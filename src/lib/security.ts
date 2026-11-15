import 'server-only';
import { headers } from 'next/headers';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { rateLimits } from '@/db/schema';

/** Client IP, honouring the proxy chain in front of the app. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim()
    || h.get('x-real-ip')
    || '0.0.0.0';
}

/**
 * Fixed-window rate limiter backed by the database, so limits hold across
 * serverless instances where an in-memory counter would not.
 */
export async function rateLimit(
  bucket: string,
  opts: { limit: number; windowSeconds: number; key?: string },
): Promise<{ ok: boolean; remaining: number; retryAfter: number }> {
  const ip = opts.key ?? await clientIp();
  const key = `${bucket}:${ip}`;
  const db = await getDb();
  const now = new Date();

  const [row] = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);

  if (!row) {
    await db.insert(rateLimits).values({ key, count: 1, windowStart: now }).onConflictDoNothing();
    return { ok: true, remaining: opts.limit - 1, retryAfter: 0 };
  }

  const elapsed = (now.getTime() - new Date(row.windowStart).getTime()) / 1000;
  if (elapsed > opts.windowSeconds) {
    await db.update(rateLimits).set({ count: 1, windowStart: now }).where(eq(rateLimits.key, key));
    return { ok: true, remaining: opts.limit - 1, retryAfter: 0 };
  }

  if (row.count >= opts.limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil(opts.windowSeconds - elapsed) };
  }

  await db.update(rateLimits)
    .set({ count: sql`${rateLimits.count} + 1` })
    .where(eq(rateLimits.key, key));
  return { ok: true, remaining: opts.limit - row.count - 1, retryAfter: 0 };
}

/**
 * Honeypot + timing check. Catches ordinary form spam without a CAPTCHA, which
 * would be an accessibility barrier on the booking path.
 */
export function looksLikeSpam(form: { website?: string; renderedAt?: string }): boolean {
  // A real guest never fills a field that is hidden from them.
  if (form.website && form.website.trim().length > 0) return true;
  if (form.renderedAt) {
    const elapsed = Date.now() - Number(form.renderedAt);
    // Under 2 seconds from render to submit is not human typing.
    if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 2000) return true;
  }
  return false;
}

/** Removes anything that must never reach a log or an error report. */
const SENSITIVE = /(password|token|secret|authorization|card|cvv|pan|otp|pin)/i;

export function redact<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE.test(k) ? '[redacted]' : redact(v);
  }
  return out as T;
}

/**
 * Guest-facing error text. Internal detail goes to the server log; the guest
 * sees something useful and non-revealing.
 */
export function safeErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code: string }).code);
    const known: Record<string, string> = {
      no_availability: 'Those dates are no longer available. Please try different dates.',
      min_stay: 'That rate has a minimum stay requirement for the dates you chose.',
      max_stay: 'That rate has a maximum stay limit for the dates you chose.',
      over_occupancy: 'That apartment does not sleep the number of guests entered.',
      invalid_dates: 'Please check your arrival and departure dates.',
      closed: 'We have no availability on one of the nights selected.',
      nothing_due: 'There is nothing left to pay on this booking.',
      not_configured: 'This payment method is not available right now.',
    };
    if (known[code]) return known[code];
  }
  return 'Something went wrong at our end. Please try again, or contact reservations for help.';
}

export function logError(scope: string, err: unknown, context?: Record<string, unknown>) {
  const payload = {
    scope,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    context: context ? redact(context) : undefined,
  };
  console.error(JSON.stringify(payload));
}
