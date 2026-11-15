import 'server-only';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { messageTemplates, outboundEmails } from '@/db/schema';
import { newId } from './ids';

/**
 * Outbound email.
 *
 * Messages are written to `outbound_emails` first and dispatched after, so a
 * confirmation is never lost because an SMTP call failed, and a retried request
 * cannot send twice (the dedupe key is a unique index).
 *
 * Without SMTP credentials the row is still written and marked `queued`. That
 * is what makes confirmation flows testable before the property's mail account
 * is connected.
 */

export interface QueueEmailInput {
  to: string;
  templateKey: string;
  variables: Record<string, string>;
  relatedEntity?: string;
  relatedId?: string;
  /** Business identity of the message, e.g. `booking-confirmation:SAW-ABC123`. */
  dedupeOn: string;
}

function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

export async function queueEmail(input: QueueEmailInput) {
  const db = await getDb();
  const [tpl] = await db.select().from(messageTemplates)
    .where(eq(messageTemplates.key, input.templateKey))
    .limit(1);

  if (!tpl) return { ok: false as const, error: `No template named ${input.templateKey}.` };

  const dedupeKey = createHash('sha256').update(input.dedupeOn).digest('hex').slice(0, 40);

  try {
    await db.insert(outboundEmails).values({
      id: newId('mail'),
      toEmail: input.to,
      templateKey: input.templateKey,
      subject: render(tpl.subject ?? '', input.variables),
      body: render(tpl.body, input.variables),
      status: 'queued',
      relatedEntity: input.relatedEntity ?? null,
      relatedId: input.relatedId ?? null,
      dedupeKey,
    });
  } catch {
    // Unique violation: this exact message was already queued.
    return { ok: true as const, duplicate: true };
  }

  await dispatchQueued();
  return { ok: true as const, duplicate: false };
}

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

/**
 * Sends queued mail. Left as an explicit call (rather than a background worker)
 * so behaviour is deterministic in tests; in production a cron calls the same
 * function via /api/cron/dispatch.
 */
export async function dispatchQueued(limit = 25) {
  const db = await getDb();
  const pending = await db.select().from(outboundEmails)
    .where(eq(outboundEmails.status, 'queued'))
    .limit(limit);

  if (!smtpConfigured()) {
    // Nothing to send with. Rows stay queued and the admin mail screen says so
    // rather than reporting a delivery that never happened.
    return { sent: 0, queued: pending.length, reason: 'SMTP not configured' };
  }

  let sent = 0;
  for (const mail of pending) {
    try {
      await deliver(mail.toEmail, mail.subject, mail.body);
      await db.update(outboundEmails)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(outboundEmails.id, mail.id));
      sent += 1;
    } catch (err) {
      await db.update(outboundEmails)
        .set({ status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' })
        .where(eq(outboundEmails.id, mail.id));
    }
  }
  return { sent, queued: pending.length - sent };
}

/**
 * Transport seam. Swapped for the property's provider at activation; kept
 * behind one function so nothing else in the codebase knows about SMTP.
 */
async function deliver(to: string, subject: string, body: string) {
  const endpoint = process.env.MAIL_HTTP_ENDPOINT;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MAIL_HTTP_TOKEN ?? ''}`,
      },
      body: JSON.stringify({ to, subject, html: body, from: process.env.MAIL_FROM }),
    });
    if (!res.ok) throw new Error(`Mail endpoint returned ${res.status}`);
    return;
  }
  throw new Error('No mail transport configured. Set MAIL_HTTP_ENDPOINT or SMTP_*.');
}

export { DEFAULT_TEMPLATES } from './constants';
