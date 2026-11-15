import 'server-only';
import { createHash } from 'node:crypto';
import { getDb } from '@/db';
import { analyticsEvents } from '@/db/schema';

/**
 * First-party event log.
 *
 * Written server-side so a transaction is recorded once even if the browser
 * fires the tag twice, a page is refreshed, or the guest returns to the
 * confirmation URL later. The `dedupeKey` unique index is what actually
 * enforces that — the acceptance test for double-counting relies on it.
 */

export const EVENTS = {
  availabilitySearch: 'availability_search',
  accommodationView: 'accommodation_view',
  bookingStart: 'booking_start',
  bookingComplete: 'booking_complete',
  longStayEnquiry: 'long_stay_enquiry',
  corporateEnquiry: 'corporate_enquiry',
  phoneClick: 'phone_click',
  whatsappClick: 'whatsapp_click',
  quoteRequest: 'quote_request',
  enquirySubmit: 'enquiry_submit',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export interface TrackInput {
  name: EventName | string;
  sessionRef?: string | null;
  path?: string | null;
  /**
   * Business identity of the event. A booking completion is
   * `booking_complete:SAW-ABC123` — the same on every replay, so it counts once.
   * Omit for events where every occurrence is genuinely distinct.
   */
  dedupeOn?: string;
  value?: number;
  currency?: string;
  utm?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export async function track(input: TrackInput): Promise<{ recorded: boolean }> {
  try {
    const db = await getDb();
    const dedupeKey = input.dedupeOn
      ? createHash('sha256').update(input.dedupeOn).digest('hex').slice(0, 40)
      : `${input.name}:${crypto.randomUUID()}`;

    await db.insert(analyticsEvents).values({
      name: input.name,
      sessionRef: input.sessionRef ?? null,
      path: input.path ?? null,
      dedupeKey,
      value: input.value ?? null,
      currency: input.currency ?? null,
      utm: (input.utm ?? {}) as never,
      metadata: (input.metadata ?? {}) as never,
    });
    return { recorded: true };
  } catch {
    // Duplicate, or analytics is simply unavailable. Never break a guest journey
    // to record a metric.
    return { recorded: false };
  }
}

/** UTM parameters, kept to a known set so arbitrary query strings are not stored. */
export function extractUtm(url: URL): Record<string, string> {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = url.searchParams.get(k);
    if (v) out[k] = v.slice(0, 120);
  }
  return out;
}

/** Counts by event name over a window, for the dashboard. */
export async function eventTotals(days = 30) {
  const db = await getDb();
  const { sql } = await import('drizzle-orm');
  return db.select({
    name: analyticsEvents.name,
    count: sql<number>`count(*)::int`,
    value: sql<number>`coalesce(sum(${analyticsEvents.value}),0)::int`,
  })
    .from(analyticsEvents)
    .where(sql`${analyticsEvents.createdAt} > now() - interval '1 day' * ${days}`)
    .groupBy(analyticsEvents.name);
}
