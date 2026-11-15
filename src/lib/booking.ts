import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  bookingEvents, bookingExtras, bookingRooms, bookings, cancellationPolicies,
  extras as extrasTable, promoCodes, rateCalendar, ratePlans, roomTypes, taxes as taxTable,
} from '@/db/schema';
import { consumeHold, createHold, getLiveHold, OversellError } from './availability';
import { nightsBetween, todayInKampala, type IsoDate } from './dates';
import { bookingReference, hashToken, manageToken, newId, tokenMatches } from './ids';
import {
  quote, PricingError,
  type ExtraInput, type NightlyRate, type PromoInput, type Quote, type TaxInput,
} from './pricing';
import { getSettings } from './settings';

export class BookingError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'BookingError';
  }
}

/** Loads everything the pricing engine needs for one room type and stay. */
export async function buildQuote(params: {
  roomTypeId: string;
  ratePlanId?: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  adults: number;
  children: number;
  rooms: number;
  extras?: { id: string; quantity: number }[];
  promoCode?: string | null;
}): Promise<{ quote: Quote; plan: typeof ratePlans.$inferSelect; roomType: typeof roomTypes.$inferSelect }> {
  const db = await getDb();

  const [roomType] = await db.select().from(roomTypes).where(eq(roomTypes.id, params.roomTypeId)).limit(1);
  if (!roomType) throw new BookingError('no_room_type', 'That apartment category does not exist.');

  const guests = params.adults + params.children;
  const capacity = (roomType.maxOccupancy ?? 0) * params.rooms;
  if (capacity > 0 && guests > capacity) {
    throw new BookingError(
      'over_occupancy',
      `${roomType.name} sleeps up to ${roomType.maxOccupancy} guests per apartment.`,
    );
  }

  const plans = await db.select().from(ratePlans)
    .where(and(eq(ratePlans.roomTypeId, params.roomTypeId), eq(ratePlans.active, true)));
  if (plans.length === 0) throw new BookingError('no_rate', 'No rate is published for this apartment.');

  const nights = nightsBetween(params.checkIn, params.checkOut);

  // Explicit choice wins; otherwise take the cheapest plan the stay qualifies for.
  const eligible = plans.filter((p) => nights >= p.minStay && (!p.maxStay || nights <= p.maxStay));
  const plan = params.ratePlanId
    ? plans.find((p) => p.id === params.ratePlanId)
    : eligible.sort((a, b) => a.baseRateMinor - b.baseRateMinor)[0] ?? plans[0];
  if (!plan) throw new BookingError('no_rate', 'No rate plan matches that stay length.');

  const calendarRows = await db.select().from(rateCalendar).where(eq(rateCalendar.ratePlanId, plan.id));
  const calendar: NightlyRate[] = calendarRows.map((r) => ({
    day: String(r.day),
    rateMinor: r.rateMinor ?? plan.baseRateMinor,
    minStay: r.minStay,
    closed: r.closed,
    closedToArrival: r.closedToArrival,
    closedToDeparture: r.closedToDeparture,
  }));

  let selectedExtras: ExtraInput[] = [];
  if (params.extras?.length) {
    const rows = await db.select().from(extrasTable).where(eq(extrasTable.active, true));
    selectedExtras = params.extras.flatMap((sel) => {
      const row = rows.find((r) => r.id === sel.id);
      if (!row || sel.quantity <= 0) return [];
      return [{
        id: row.id,
        name: row.name,
        priceMinor: row.priceMinor,
        pricingMode: row.pricingMode as ExtraInput['pricingMode'],
        quantity: sel.quantity,
        taxable: row.taxable,
      }];
    });
  }

  const taxRows = await db.select().from(taxTable).where(eq(taxTable.active, true));
  const taxes: TaxInput[] = taxRows.map((t) => ({
    code: t.code, name: t.name, rateBps: t.rateBps,
    appliesTo: t.appliesTo as TaxInput['appliesTo'], inclusive: t.inclusive,
  }));

  let promo: PromoInput | null = null;
  if (params.promoCode) {
    const [row] = await db.select().from(promoCodes)
      .where(eq(promoCodes.code, params.promoCode.trim().toUpperCase())).limit(1);
    if (row) {
      promo = {
        code: row.code,
        discountType: row.discountType as 'percent' | 'fixed',
        discountValue: row.discountValue,
        minNights: row.minNights,
        validFrom: row.validFrom ? String(row.validFrom) : null,
        validTo: row.validTo ? String(row.validTo) : null,
        stayFrom: row.stayFrom ? String(row.stayFrom) : null,
        stayTo: row.stayTo ? String(row.stayTo) : null,
        maxUses: row.maxUses,
        usedCount: row.usedCount,
        appliesToRoomTypeIds: row.appliesToRoomTypeIds,
        active: row.active,
      };
    } else {
      promo = {
        code: params.promoCode, discountType: 'percent', discountValue: 0,
        minNights: 1, active: false,
      };
    }
  }

  const result = quote({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: params.adults,
    children: params.children,
    rooms: params.rooms,
    roomTypeId: params.roomTypeId,
    plan: {
      id: plan.id, code: plan.code, name: plan.name, currency: plan.currency,
      baseRateMinor: plan.baseRateMinor, minStay: plan.minStay, maxStay: plan.maxStay,
      depositPercent: plan.depositPercent,
      extraAdultMinor: plan.extraAdultMinor, extraChildMinor: plan.extraChildMinor,
      includedAdults: roomType.maxAdults ?? 2,
    },
    calendar,
    extras: selectedExtras,
    taxes,
    promo,
    today: todayInKampala(),
  });

  return { quote: result, plan, roomType };
}

export interface CreateBookingInput {
  sessionRef: string;
  roomTypeId: string;
  ratePlanId?: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  adults: number;
  children: number;
  childAges?: number[];
  rooms: number;
  extras?: { id: string; quantity: number }[];
  promoCode?: string | null;
  guest: {
    firstName: string; lastName: string; email: string;
    phone?: string; country?: string; companyName?: string;
  };
  specialRequests?: string;
  whatsappOptIn?: boolean;
  marketingOptIn?: boolean;
  source?: string;
  utm?: Record<string, string>;
}

/**
 * Creates a booking.
 *
 * In `request` mode nothing is committed and nothing is confirmed — the guest
 * gets an honest "we will confirm" and reservations get a lead. In `native`
 * mode the hold is validated and consumed inside the same transaction that
 * writes the booking, which is what stops two guests taking the last apartment.
 */
export async function createBooking(input: CreateBookingInput) {
  const db = await getDb();
  const settings = await getSettings();
  const mode = settings.bookingMode;

  const { quote: priced, plan, roomType } = await buildQuote({
    roomTypeId: input.roomTypeId,
    ratePlanId: input.ratePlanId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    rooms: input.rooms,
    extras: input.extras,
    promoCode: input.promoCode,
  });

  let policySummary: string | null = null;
  if (plan.cancellationPolicyId) {
    const [pol] = await db.select().from(cancellationPolicies)
      .where(eq(cancellationPolicies.id, plan.cancellationPolicyId)).limit(1);
    policySummary = pol?.summary ?? null;
  }

  const id = newId('bkg');
  const reference = bookingReference();
  const rawToken = manageToken();

  // request mode never commits inventory; native mode must hold it first.
  if (mode === 'native') {
    const hold = await getLiveHold(input.sessionRef);
    if (!hold) {
      // The hold lapsed while the guest was typing. Re-take it, which fails
      // loudly if someone else has since booked the last apartment.
      await createHold({
        roomTypeId: input.roomTypeId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        rooms: input.rooms,
        sessionRef: input.sessionRef,
      });
    } else if (
      hold.roomTypeId !== input.roomTypeId ||
      String(hold.checkIn) !== input.checkIn ||
      String(hold.checkOut) !== input.checkOut ||
      hold.rooms < input.rooms
    ) {
      // The selection changed after the hold was taken; re-take to match.
      await createHold({
        roomTypeId: input.roomTypeId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        rooms: input.rooms,
        sessionRef: input.sessionRef,
      });
    }
  }

  const status = mode === 'native' ? 'pending' : 'request';

  await db.insert(bookings).values({
    id,
    reference,
    status,
    mode,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: priced.nights,
    adults: input.adults,
    children: input.children,
    childAges: input.childAges ?? [],
    rooms: input.rooms,
    guestFirstName: input.guest.firstName,
    guestLastName: input.guest.lastName,
    guestEmail: input.guest.email.trim().toLowerCase(),
    guestPhone: input.guest.phone ?? null,
    guestCountry: input.guest.country ?? null,
    companyName: input.guest.companyName ?? null,
    specialRequests: input.specialRequests ?? null,
    currency: priced.currency,
    accommodationMinor: priced.accommodationMinor + priced.occupancyMinor,
    extrasMinor: priced.extrasMinor,
    discountMinor: priced.discountMinor,
    taxMinor: priced.taxMinor,
    totalMinor: priced.totalMinor,
    depositDueMinor: priced.depositDueMinor,
    priceBreakdown: priced as never,
    promoCode: priced.promoApplied ?? null,
    cancellationPolicyId: plan.cancellationPolicyId ?? null,
    cancellationSummary: policySummary,
    source: input.source ?? 'website',
    utm: (input.utm ?? {}) as never,
    manageTokenHash: hashToken(rawToken),
    manageTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 400),
    whatsappOptIn: Boolean(input.whatsappOptIn),
    marketingOptIn: Boolean(input.marketingOptIn),
  });

  await db.insert(bookingRooms).values({
    id: newId('bkr'),
    bookingId: id,
    roomTypeId: roomType.id,
    ratePlanId: plan.id,
    roomTypeName: roomType.name,
    ratePlanName: plan.name,
    adults: input.adults,
    children: input.children,
    subtotalMinor: priced.accommodationMinor,
    nightly: priced.nightly as never,
  });

  for (const line of priced.lines) {
    await db.insert(bookingExtras).values({
      id: newId('bke'),
      bookingId: id,
      name: line.label,
      quantity: 1,
      unitPriceMinor: line.amountMinor,
      totalMinor: line.amountMinor,
    });
  }

  await db.insert(bookingEvents).values({
    bookingId: id,
    fromStatus: null,
    toStatus: status,
    actor: 'guest',
    note: mode === 'native' ? 'Booking created, awaiting payment.' : 'Availability request submitted.',
  });

  if (mode === 'native') {
    await consumeHold(input.sessionRef, id);
    if (priced.promoApplied) {
      const [row] = await db.select().from(promoCodes)
        .where(eq(promoCodes.code, priced.promoApplied)).limit(1);
      if (row) {
        await db.update(promoCodes)
          .set({ usedCount: row.usedCount + 1 })
          .where(eq(promoCodes.id, row.id));
      }
    }
  }

  return { id, reference, manageToken: rawToken, status, quote: priced };
}

/** Secure retrieval: reference plus token, or reference plus matching email. */
export async function findBooking(reference: string, credential: { token?: string; email?: string }) {
  const db = await getDb();
  const [booking] = await db.select().from(bookings)
    .where(eq(bookings.reference, reference.trim().toUpperCase())).limit(1);
  if (!booking) return null;

  if (credential.token && booking.manageTokenHash) {
    if (booking.manageTokenExpiresAt && booking.manageTokenExpiresAt < new Date()) return null;
    return tokenMatches(credential.token, booking.manageTokenHash) ? booking : null;
  }
  if (credential.email) {
    return credential.email.trim().toLowerCase() === booking.guestEmail ? booking : null;
  }
  return null;
}

export async function bookingDetail(bookingId: string) {
  const db = await getDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) return null;
  const [rooms, extrasRows, events] = await Promise.all([
    db.select().from(bookingRooms).where(eq(bookingRooms.bookingId, bookingId)),
    db.select().from(bookingExtras).where(eq(bookingExtras.bookingId, bookingId)),
    db.select().from(bookingEvents).where(eq(bookingEvents.bookingId, bookingId)),
  ]);
  return { booking, rooms, extras: extrasRows, events };
}

export async function transition(params: {
  bookingId: string;
  to: string;
  actor: string;
  note?: string;
  reason?: string;
}) {
  const db = await getDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.bookingId)).limit(1);
  if (!booking) throw new BookingError('no_booking', 'Booking not found.');

  const allowed: Record<string, string[]> = {
    request: ['confirmed', 'declined', 'cancelled', 'expired'],
    pending: ['confirmed', 'cancelled', 'expired'],
    confirmed: ['cancelled', 'completed', 'no_show'],
    cancelled: [],
    completed: [],
    declined: [],
    expired: ['pending'],
    no_show: [],
  };
  if (!allowed[booking.status]?.includes(params.to)) {
    throw new BookingError('bad_transition', `A ${booking.status} booking cannot become ${params.to}.`);
  }

  await db.update(bookings).set({
    status: params.to,
    confirmedAt: params.to === 'confirmed' ? new Date() : booking.confirmedAt,
    cancelledAt: params.to === 'cancelled' ? new Date() : booking.cancelledAt,
    cancelledReason: params.to === 'cancelled' ? params.reason ?? null : booking.cancelledReason,
    updatedAt: new Date(),
  }).where(eq(bookings.id, params.bookingId));

  await db.insert(bookingEvents).values({
    bookingId: params.bookingId,
    fromStatus: booking.status,
    toStatus: params.to,
    actor: params.actor,
    note: params.note ?? null,
  });

  return { from: booking.status, to: params.to };
}

export { OversellError, PricingError };
