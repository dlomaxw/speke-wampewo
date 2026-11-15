import 'server-only';
import { and, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  availabilityOverrides, bookingRooms, bookings, inventoryHolds, roomTypes, units,
} from '@/db/schema';
import { addDays, eachNight, nightsBetween, type IsoDate } from './dates';
import { newId } from './ids';

/**
 * Availability is derived, never stored as a running counter.
 *
 * For each night:  free = active units − committed bookings − live holds − blocks
 *
 * A counter would drift the first time a process died mid-write. Deriving costs
 * one query per search and is always consistent with the booking table.
 */

export const HOLD_MINUTES = Number(process.env.HOLD_MINUTES || 15);

/** Booking statuses that occupy inventory. */
const OCCUPYING = ['pending', 'confirmed', 'completed', 'no_show'] as const;

export interface NightAvailability {
  day: IsoDate;
  total: number;
  booked: number;
  held: number;
  blocked: number;
  free: number;
}

export interface RoomTypeAvailability {
  roomTypeId: string;
  minFree: number;
  nights: NightAvailability[];
  available: boolean;
}

/**
 * Per-night free counts for one room type.
 * `excludeHoldSession` lets a guest re-price their own held selection without
 * their own hold making the room look unavailable to them.
 */
export async function availabilityFor(
  roomTypeId: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
  opts: { excludeHoldSession?: string; excludeBookingId?: string } = {},
): Promise<RoomTypeAvailability> {
  const db = await getDb();
  const days = eachNight(checkIn, checkOut);
  if (days.length === 0) {
    return { roomTypeId, minFree: 0, nights: [], available: false };
  }

  const [unitRows, bookingRows, holdRows, blockRows] = await Promise.all([
    db.select({ id: units.id })
      .from(units)
      .where(and(eq(units.roomTypeId, roomTypeId), eq(units.status, 'active'))),

    db.select({
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      id: bookings.id,
      rooms: sql<number>`count(${bookingRooms.id})::int`,
    })
      .from(bookings)
      .innerJoin(bookingRooms, eq(bookingRooms.bookingId, bookings.id))
      .where(and(
        eq(bookingRooms.roomTypeId, roomTypeId),
        inArray(bookings.status, OCCUPYING as unknown as string[]),
        sql`${bookings.checkIn} < ${checkOut}`,
        sql`${bookings.checkOut} > ${checkIn}`,
      ))
      .groupBy(bookings.id, bookings.checkIn, bookings.checkOut),

    db.select({
      checkIn: inventoryHolds.checkIn,
      checkOut: inventoryHolds.checkOut,
      rooms: inventoryHolds.rooms,
      sessionRef: inventoryHolds.sessionRef,
    })
      .from(inventoryHolds)
      .where(and(
        eq(inventoryHolds.roomTypeId, roomTypeId),
        gt(inventoryHolds.expiresAt, new Date()),
        isNull(inventoryHolds.releasedAt),
        isNull(inventoryHolds.consumedByBookingId),
        sql`${inventoryHolds.checkIn} < ${checkOut}`,
        sql`${inventoryHolds.checkOut} > ${checkIn}`,
      )),

    db.select({ day: availabilityOverrides.day, blocked: availabilityOverrides.unitsBlocked })
      .from(availabilityOverrides)
      .where(and(
        eq(availabilityOverrides.roomTypeId, roomTypeId),
        sql`${availabilityOverrides.day} >= ${checkIn}`,
        sql`${availabilityOverrides.day} < ${checkOut}`,
      )),
  ]);

  const total = unitRows.length;
  const blockedByDay = new Map(blockRows.map((b) => [String(b.day), b.blocked]));

  const nights: NightAvailability[] = days.map((day) => {
    let booked = 0;
    for (const b of bookingRows) {
      if (opts.excludeBookingId && b.id === opts.excludeBookingId) continue;
      if (String(b.checkIn) <= day && day < String(b.checkOut)) booked += Number(b.rooms) || 1;
    }
    let held = 0;
    for (const h of holdRows) {
      if (opts.excludeHoldSession && h.sessionRef === opts.excludeHoldSession) continue;
      if (String(h.checkIn) <= day && day < String(h.checkOut)) held += h.rooms;
    }
    const blocked = blockedByDay.get(day) ?? 0;
    return { day, total, booked, held, blocked, free: Math.max(0, total - booked - held - blocked) };
  });

  const minFree = nights.reduce((m, n) => Math.min(m, n.free), Number.POSITIVE_INFINITY);
  return {
    roomTypeId,
    minFree: Number.isFinite(minFree) ? minFree : 0,
    nights,
    available: Number.isFinite(minFree) && minFree > 0,
  };
}

/** Availability for every published room type, for the listing page. */
export async function availabilityForAll(
  checkIn: IsoDate,
  checkOut: IsoDate,
  opts: { excludeHoldSession?: string } = {},
): Promise<Map<string, RoomTypeAvailability>> {
  const db = await getDb();
  const types = await db.select({ id: roomTypes.id }).from(roomTypes).where(eq(roomTypes.published, true));
  const out = new Map<string, RoomTypeAvailability>();
  for (const t of types) {
    out.set(t.id, await availabilityFor(t.id, checkIn, checkOut, opts));
  }
  return out;
}

export class OversellError extends Error {
  code = 'no_availability';
  constructor(message = 'Those dates are no longer available.') {
    super(message);
    this.name = 'OversellError';
  }
}

/**
 * Claims inventory for a checkout session.
 *
 * The re-check inside the transaction is the part that matters: two guests who
 * both saw "1 left" will serialise here, and the second one fails rather than
 * overselling. With Postgres this runs at SERIALIZABLE so the read that decides
 * cannot be stale; PGlite is single-process and therefore already serial.
 */
export async function createHold(params: {
  roomTypeId: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  rooms: number;
  sessionRef: string;
  minutes?: number;
}): Promise<{ id: string; expiresAt: Date }> {
  const db = await getDb();
  const minutes = params.minutes ?? HOLD_MINUTES;
  const expiresAt = new Date(Date.now() + minutes * 60_000);

  if (nightsBetween(params.checkIn, params.checkOut) < 1) {
    throw new OversellError('Check-out must be after check-in.');
  }

  const run = async (tx: typeof db) => {
    // Drop any previous hold for this session so a guest changing their mind
    // does not sit behind their own claim.
    await tx.update(inventoryHolds)
      .set({ releasedAt: new Date() })
      .where(and(
        eq(inventoryHolds.sessionRef, params.sessionRef),
        isNull(inventoryHolds.releasedAt),
        isNull(inventoryHolds.consumedByBookingId),
      ));

    const avail = await availabilityFor(params.roomTypeId, params.checkIn, params.checkOut, {
      excludeHoldSession: params.sessionRef,
    });
    if (avail.minFree < params.rooms) throw new OversellError();

    const id = newId('hold');
    await tx.insert(inventoryHolds).values({
      id,
      roomTypeId: params.roomTypeId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      rooms: params.rooms,
      sessionRef: params.sessionRef,
      expiresAt,
    });
    return { id, expiresAt };
  };

  // drizzle's transaction API is identical across both drivers.
  return db.transaction(async (tx) => run(tx as unknown as typeof db));
}

export async function releaseHold(sessionRef: string) {
  const db = await getDb();
  await db.update(inventoryHolds)
    .set({ releasedAt: new Date() })
    .where(and(eq(inventoryHolds.sessionRef, sessionRef), isNull(inventoryHolds.releasedAt)));
}

export async function getLiveHold(sessionRef: string) {
  const db = await getDb();
  const [hold] = await db.select().from(inventoryHolds)
    .where(and(
      eq(inventoryHolds.sessionRef, sessionRef),
      gt(inventoryHolds.expiresAt, new Date()),
      isNull(inventoryHolds.releasedAt),
      isNull(inventoryHolds.consumedByBookingId),
    ))
    .limit(1);
  return hold ?? null;
}

/** Marks the hold as spent by a booking. Called inside the booking transaction. */
export async function consumeHold(sessionRef: string, bookingId: string) {
  const db = await getDb();
  await db.update(inventoryHolds)
    .set({ consumedByBookingId: bookingId })
    .where(and(eq(inventoryHolds.sessionRef, sessionRef), isNull(inventoryHolds.consumedByBookingId)));
}

/** Housekeeping. Expired holds are already ignored by reads; this just tidies. */
export async function sweepExpiredHolds() {
  const db = await getDb();
  const res = await db.update(inventoryHolds)
    .set({ releasedAt: new Date() })
    .where(and(
      sql`${inventoryHolds.expiresAt} < now()`,
      isNull(inventoryHolds.releasedAt),
      isNull(inventoryHolds.consumedByBookingId),
    ));
  return res;
}

/**
 * Comparable alternatives when the requested category is full: same or larger
 * capacity, actually free for those dates.
 */
export async function suggestAlternatives(
  roomTypeId: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
  guests: number,
) {
  const db = await getDb();
  const all = await db.select().from(roomTypes).where(eq(roomTypes.published, true));
  const out: { roomType: typeof all[number]; minFree: number }[] = [];
  for (const rt of all) {
    if (rt.id === roomTypeId) continue;
    if ((rt.maxOccupancy ?? 0) < guests) continue;
    const a = await availabilityFor(rt.id, checkIn, checkOut);
    if (a.available) out.push({ roomType: rt, minFree: a.minFree });
  }
  return out.sort((a, b) => (a.roomType.fromPriceMinor ?? 0) - (b.roomType.fromPriceMinor ?? 0));
}

/** Nearby dates with space, for "nothing on your dates" recovery. */
export async function suggestNearbyDates(
  roomTypeId: string, checkIn: IsoDate, checkOut: IsoDate, windowDays = 7,
) {
  const nights = nightsBetween(checkIn, checkOut);
  const found: { checkIn: IsoDate; checkOut: IsoDate }[] = [];
  for (let offset = 1; offset <= windowDays && found.length < 3; offset += 1) {
    for (const dir of [1, -1]) {
      const ci = addDays(checkIn, offset * dir);
      const co = addDays(ci, nights);
      const a = await availabilityFor(roomTypeId, ci, co);
      if (a.available) found.push({ checkIn: ci, checkOut: co });
      if (found.length >= 3) break;
    }
  }
  return found;
}
