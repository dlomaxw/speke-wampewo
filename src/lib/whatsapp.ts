import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * WhatsApp, at two clearly separated levels.
 *
 * Level 1 — click-to-chat. A wa.me link with a prefilled message. It opens the
 *   guest's own WhatsApp; nothing reaches our server, so nothing is recorded in
 *   the CRM. The UI never claims otherwise — see the note in the floating
 *   button component.
 *
 * Level 2 — WhatsApp Business Platform. Real inbound and outbound messaging,
 *   conversations attached to CRM contacts, consent and opt-out tracked,
 *   delivery status logged. Requires approved credentials.
 */

export type DepartmentKey = 'reservations' | 'dining' | 'spa' | 'gym' | 'sales' | 'events' | 'front_office';

export interface ChatTarget {
  key: DepartmentKey | string;
  name: string;
  phoneE164: string;
  enabled: boolean;
}

/** wa.me requires digits only — no '+', spaces or punctuation. */
export function normaliseWaNumber(input: string): string {
  return input.replace(/[^\d]/g, '');
}

export function clickToChatUrl(phoneE164: string, message: string): string {
  const number = normaliseWaNumber(phoneE164);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Prefilled messages. Each carries enough context that staff can answer without
 * a round trip, but never anything the guest has not already seen on screen.
 */
export const CHAT_MESSAGES = {
  general: () =>
    'Hello Speke Apartments Wampewo, I would like some help please.',

  reservations: (opts?: { checkIn?: string; checkOut?: string; guests?: number }) => {
    const parts = ['Hello Speke Apartments Wampewo, I would like to check availability'];
    if (opts?.checkIn && opts?.checkOut) parts.push(`for ${opts.checkIn} to ${opts.checkOut}`);
    if (opts?.guests) parts.push(`for ${opts.guests} guest${opts.guests === 1 ? '' : 's'}`);
    return `${parts.join(' ')}.`;
  },

  roomEnquiry: (roomName: string, opts?: { checkIn?: string; checkOut?: string }) => {
    const dates = opts?.checkIn && opts?.checkOut ? ` for ${opts.checkIn} to ${opts.checkOut}` : '';
    return `Hello Speke Apartments Wampewo, I am interested in the ${roomName}${dates}. Could you help me with availability and rates?`;
  },

  bookingHelp: (reference: string) =>
    `Hello Speke Apartments Wampewo, I need help with my booking ${reference}.`,

  longStay: (opts?: { nights?: number }) =>
    `Hello Speke Apartments Wampewo, I would like a quotation for a long stay${opts?.nights ? ` of about ${opts.nights} nights` : ''}.`,

  corporate: (company?: string) =>
    `Hello Speke Apartments Wampewo, I would like to discuss corporate accommodation${company ? ` for ${company}` : ''}.`,

  dining: () =>
    'Hello La Cabana at Speke Apartments Wampewo, I would like to make a restaurant enquiry.',

  spa: () =>
    'Hello Calabash Spa and Salon, I would like to enquire about an appointment.',

  gym: () =>
    'Hello Speke Apartments Wampewo Health Club, I would like to enquire about membership.',
} as const;

/* ───────────────────── WhatsApp Business Platform ──────────────────────── */

export function isBusinessPlatformConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_APP_SECRET,
  );
}

const GRAPH = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v21.0'}`;

/** Meta signs each webhook with sha256=<hmac> over the exact raw body. */
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyWebhookChallenge(params: URLSearchParams): string | null {
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');
  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

export interface SendTemplateInput {
  to: string;
  templateName: string;
  languageCode?: string;
  variables?: string[];
}

/**
 * Sends an approved template. Outside the 24-hour customer service window Meta
 * only permits templates, which is why free-text sending is a separate call.
 */
export async function sendTemplate(input: SendTemplateInput) {
  if (!isBusinessPlatformConfigured()) {
    return { ok: false as const, error: 'WhatsApp Business Platform is not configured.' };
  }
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normaliseWaNumber(input.to),
      type: 'template',
      template: {
        name: input.templateName,
        language: { code: input.languageCode || 'en' },
        components: input.variables?.length
          ? [{ type: 'body', parameters: input.variables.map((v) => ({ type: 'text', text: v })) }]
          : undefined,
      },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false as const, error: body?.error?.message || 'Send failed.' };
  return { ok: true as const, messageId: body?.messages?.[0]?.id as string | undefined };
}

/** Free-text reply. Only valid inside the 24-hour service window. */
export async function sendText(to: string, body: string) {
  if (!isBusinessPlatformConfigured()) {
    return { ok: false as const, error: 'WhatsApp Business Platform is not configured.' };
  }
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normaliseWaNumber(to),
      type: 'text',
      text: { body },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false as const, error: json?.error?.message || 'Send failed.' };
  return { ok: true as const, messageId: json?.messages?.[0]?.id as string | undefined };
}

/** Normalises Meta's nested webhook shape into flat events. */
export interface InboundMessage {
  waId: string;
  displayName?: string;
  messageId: string;
  text?: string;
  timestamp: string;
}

export interface StatusUpdate {
  messageId: string;
  status: string;
  recipientId: string;
  error?: string;
}

export function parseWebhookPayload(payload: unknown): {
  messages: InboundMessage[];
  statuses: StatusUpdate[];
} {
  const messages: InboundMessage[] = [];
  const statuses: StatusUpdate[] = [];
  const entries = (payload as { entry?: unknown[] })?.entry ?? [];

  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes ?? [];
    for (const change of changes) {
      const value = (change as { value?: Record<string, unknown> })?.value ?? {};
      const contacts = (value.contacts ?? []) as Array<{ wa_id?: string; profile?: { name?: string } }>;
      const nameFor = (waId: string) =>
        contacts.find((c) => c.wa_id === waId)?.profile?.name;

      for (const m of (value.messages ?? []) as Array<Record<string, unknown>>) {
        const from = String(m.from ?? '');
        messages.push({
          waId: from,
          displayName: nameFor(from),
          messageId: String(m.id ?? ''),
          text: (m.text as { body?: string } | undefined)?.body,
          timestamp: String(m.timestamp ?? ''),
        });
      }

      for (const s of (value.statuses ?? []) as Array<Record<string, unknown>>) {
        statuses.push({
          messageId: String(s.id ?? ''),
          status: String(s.status ?? ''),
          recipientId: String(s.recipient_id ?? ''),
          error: (s.errors as Array<{ title?: string }> | undefined)?.[0]?.title,
        });
      }
    }
  }
  return { messages, statuses };
}

/**
 * Automations available once templates are approved. Each is opt-in and
 * deduplicated by key, so a retry cannot message a guest twice.
 */
export const AUTOMATIONS = [
  { key: 'enquiry_ack', name: 'Enquiry acknowledgement', trigger: 'Lead created' },
  { key: 'booking_confirmation', name: 'Booking confirmation', trigger: 'Booking confirmed' },
  { key: 'payment_reminder', name: 'Payment reminder', trigger: 'Balance due' },
  { key: 'pre_arrival', name: 'Pre-arrival information', trigger: '48 hours before check-in' },
  { key: 'transfer_coordination', name: 'Transfer coordination', trigger: 'Airport transfer booked' },
  { key: 'quotation_follow_up', name: 'Quotation follow-up', trigger: 'Quotation sent, no reply' },
  { key: 'post_stay_feedback', name: 'Post-stay feedback', trigger: '1 day after check-out' },
] as const;
