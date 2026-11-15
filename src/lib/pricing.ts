/**
 * Rate calculation.
 *
 * Pure functions over plain data so the acceptance tests can exercise every
 * rule without a database. Money is integer minor units throughout; the only
 * division happens in `applyPercent`, which rounds once, at the end, half-up.
 *
 * Order of operations matters and is fixed:
 *   nightly accommodation
 *   + occupancy supplements
 *   + extras
 *   − discount (promo)
 *   + taxes on the discounted base
 *   = total
 *
 * Taxes come last because Ugandan VAT applies to the amount actually payable,
 * not the pre-discount rack rate.
 */
import { eachNight, nightsBetween, type IsoDate } from './dates';

export type Money = number; // minor units

export interface NightlyRate {
  day: IsoDate;
  rateMinor: Money;
  minStay?: number | null;
  closed?: boolean;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
}

export interface RatePlanInput {
  id: string;
  code: string;
  name: string;
  currency: string;
  baseRateMinor: Money;
  minStay: number;
  maxStay?: number | null;
  depositPercent: number;
  extraAdultMinor: Money;
  extraChildMinor: Money;
  includedAdults?: number;
}

export interface ExtraInput {
  id: string;
  name: string;
  priceMinor: Money;
  pricingMode: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
  quantity: number;
  taxable: boolean;
}

export interface TaxInput {
  code: string;
  name: string;
  rateBps: number;          // 1800 = 18%
  appliesTo: 'accommodation' | 'extras' | 'total';
  inclusive: boolean;
}

export interface PromoInput {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;    // percent points, or minor units when fixed
  minNights: number;
  validFrom?: IsoDate | null;
  validTo?: IsoDate | null;
  stayFrom?: IsoDate | null;
  stayTo?: IsoDate | null;
  maxUses?: number | null;
  usedCount?: number;
  appliesToRoomTypeIds?: string[] | null;
  active: boolean;
}

export interface QuoteRequest {
  checkIn: IsoDate;
  checkOut: IsoDate;
  adults: number;
  children: number;
  rooms: number;
  roomTypeId: string;
  plan: RatePlanInput;
  calendar: NightlyRate[];
  extras?: ExtraInput[];
  taxes?: TaxInput[];
  promo?: PromoInput | null;
  /** Today, for promo validity. Injected so tests are deterministic. */
  today: IsoDate;
}

export interface QuoteLine {
  label: string;
  amountMinor: Money;
  detail?: string;
}

export interface Quote {
  currency: string;
  nights: number;
  rooms: number;
  nightly: { day: IsoDate; rateMinor: Money }[];
  accommodationMinor: Money;
  occupancyMinor: Money;
  extrasMinor: Money;
  discountMinor: Money;
  taxMinor: Money;
  totalMinor: Money;
  depositDueMinor: Money;
  balanceMinor: Money;
  lines: QuoteLine[];
  taxLines: QuoteLine[];
  promoApplied?: string;
  warnings: string[];
}

export class PricingError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'PricingError';
  }
}

/** Half-up rounding on a basis-point/percent application. */
export function applyPercent(amount: Money, percent: number): Money {
  return Math.round((amount * percent) / 100);
}

export function applyBps(amount: Money, bps: number): Money {
  return Math.round((amount * bps) / 10_000);
}

export function formatMoney(minor: Money, currency: string): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'UGX' ? 0 : 2,
    maximumFractionDigits: currency === 'UGX' ? 0 : 2,
  }).format(minor / 100);
}

/** True when the promo is usable for this stay, today. */
export function promoIsEligible(
  promo: PromoInput,
  opts: { today: IsoDate; checkIn: IsoDate; nights: number; roomTypeId: string },
): { ok: true } | { ok: false; reason: string } {
  if (!promo.active) return { ok: false, reason: 'This promotion is no longer active.' };
  if (promo.validFrom && opts.today < promo.validFrom) return { ok: false, reason: 'This promotion has not started yet.' };
  if (promo.validTo && opts.today > promo.validTo) return { ok: false, reason: 'This promotion has expired.' };
  if (promo.stayFrom && opts.checkIn < promo.stayFrom) return { ok: false, reason: 'This promotion does not cover your arrival date.' };
  if (promo.stayTo && opts.checkIn > promo.stayTo) return { ok: false, reason: 'This promotion does not cover your arrival date.' };
  if (opts.nights < promo.minNights) {
    return { ok: false, reason: `This promotion needs a stay of at least ${promo.minNights} night${promo.minNights === 1 ? '' : 's'}.` };
  }
  if (promo.maxUses != null && (promo.usedCount ?? 0) >= promo.maxUses) {
    return { ok: false, reason: 'This promotion has reached its usage limit.' };
  }
  const scope = promo.appliesToRoomTypeIds;
  if (scope && scope.length > 0 && !scope.includes(opts.roomTypeId)) {
    return { ok: false, reason: 'This promotion does not apply to the selected apartment.' };
  }
  return { ok: true };
}

/**
 * Builds a full price breakdown. Throws PricingError on a rule the guest must
 * fix (stay length, closed dates) so the caller can surface the exact reason
 * rather than a generic failure.
 */
export function quote(req: QuoteRequest): Quote {
  const nights = nightsBetween(req.checkIn, req.checkOut);
  const warnings: string[] = [];

  if (nights < 1) throw new PricingError('invalid_dates', 'Check-out must be after check-in.');
  if (req.rooms < 1) throw new PricingError('invalid_rooms', 'At least one apartment is required.');

  const days = eachNight(req.checkIn, req.checkOut);
  const byDay = new Map(req.calendar.map((c) => [c.day, c]));

  // Minimum stay: the plan's floor, raised by any night that demands more.
  let requiredMin = req.plan.minStay;
  for (const day of days) {
    const cal = byDay.get(day);
    if (cal?.minStay && cal.minStay > requiredMin) requiredMin = cal.minStay;
  }
  if (nights < requiredMin) {
    throw new PricingError('min_stay', `This rate requires a minimum stay of ${requiredMin} nights.`);
  }
  if (req.plan.maxStay && nights > req.plan.maxStay) {
    throw new PricingError('max_stay', `This rate allows a maximum stay of ${req.plan.maxStay} nights.`);
  }

  const arrival = byDay.get(days[0]);
  if (arrival?.closedToArrival) throw new PricingError('closed_to_arrival', 'Arrival is not permitted on this date.');
  const departureDay = req.checkOut;
  if (byDay.get(departureDay)?.closedToDeparture) {
    throw new PricingError('closed_to_departure', 'Departure is not permitted on this date.');
  }

  const nightly: { day: IsoDate; rateMinor: Money }[] = [];
  let accommodation = 0;
  for (const day of days) {
    const cal = byDay.get(day);
    if (cal?.closed) throw new PricingError('closed', `We have no availability on ${day}.`);
    const rate = cal?.rateMinor ?? req.plan.baseRateMinor;
    nightly.push({ day, rateMinor: rate });
    accommodation += rate;
  }
  accommodation *= req.rooms;

  // Occupancy supplements above what the plan includes.
  const includedAdults = req.plan.includedAdults ?? 2;
  const extraAdults = Math.max(0, req.adults - includedAdults * req.rooms);
  const occupancy =
    extraAdults * req.plan.extraAdultMinor * nights +
    req.children * req.plan.extraChildMinor * nights;

  // Extras.
  const guests = req.adults + req.children;
  let extrasTotal = 0;
  let extrasTaxable = 0;
  const lines: QuoteLine[] = [];
  for (const e of req.extras ?? []) {
    if (e.quantity <= 0) continue;
    let amount = 0;
    switch (e.pricingMode) {
      case 'per_stay': amount = e.priceMinor * e.quantity; break;
      case 'per_night': amount = e.priceMinor * e.quantity * nights; break;
      case 'per_person': amount = e.priceMinor * e.quantity * guests; break;
      case 'per_person_night': amount = e.priceMinor * e.quantity * guests * nights; break;
    }
    extrasTotal += amount;
    if (e.taxable) extrasTaxable += amount;
    lines.push({ label: e.name, amountMinor: amount, detail: describeExtra(e, nights, guests) });
  }

  const preDiscount = accommodation + occupancy;

  // Discount applies to accommodation, not to extras or tax.
  let discount = 0;
  let promoApplied: string | undefined;
  if (req.promo) {
    const eligible = promoIsEligible(req.promo, {
      today: req.today, checkIn: req.checkIn, nights, roomTypeId: req.roomTypeId,
    });
    if (eligible.ok) {
      discount = req.promo.discountType === 'percent'
        ? applyPercent(preDiscount, req.promo.discountValue)
        : Math.min(req.promo.discountValue, preDiscount);
      promoApplied = req.promo.code;
    } else {
      warnings.push(eligible.reason);
    }
  }

  const taxableAccommodation = Math.max(0, preDiscount - discount);

  // Taxes.
  const taxLines: QuoteLine[] = [];
  let tax = 0;
  for (const t of req.taxes ?? []) {
    const base =
      t.appliesTo === 'accommodation' ? taxableAccommodation
      : t.appliesTo === 'extras' ? extrasTaxable
      : taxableAccommodation + extrasTaxable;
    if (base <= 0) continue;
    if (t.inclusive) {
      // Already inside the rate: show it, do not add it.
      const included = Math.round((base * t.rateBps) / (10_000 + t.rateBps));
      taxLines.push({ label: `${t.name} (included)`, amountMinor: included });
      continue;
    }
    const amount = applyBps(base, t.rateBps);
    tax += amount;
    taxLines.push({ label: t.name, amountMinor: amount });
  }

  const total = taxableAccommodation + extrasTotal + tax;
  const deposit = req.plan.depositPercent > 0 ? applyPercent(total, req.plan.depositPercent) : total;

  return {
    currency: req.plan.currency,
    nights,
    rooms: req.rooms,
    nightly,
    accommodationMinor: accommodation,
    occupancyMinor: occupancy,
    extrasMinor: extrasTotal,
    discountMinor: discount,
    taxMinor: tax,
    totalMinor: total,
    depositDueMinor: deposit,
    balanceMinor: total - deposit,
    lines,
    taxLines,
    promoApplied,
    warnings,
  };
}

function describeExtra(e: ExtraInput, nights: number, guests: number): string {
  switch (e.pricingMode) {
    case 'per_night': return `${e.quantity} × ${nights} night${nights === 1 ? '' : 's'}`;
    case 'per_person': return `${e.quantity} × ${guests} guest${guests === 1 ? '' : 's'}`;
    case 'per_person_night': return `${e.quantity} × ${guests} guest${guests === 1 ? '' : 's'} × ${nights} night${nights === 1 ? '' : 's'}`;
    default: return `${e.quantity} × per stay`;
  }
}

/**
 * Cancellation outcome for a booking, evaluated against its booked policy.
 * `requiresApproval` means staff must decide; the guest is told that clearly
 * rather than being shown a cancellation that silently did not happen.
 */
export function evaluateCancellation(opts: {
  policy: {
    freeCancelCutoffHours: number | null;
    penaltyPercent: number;
    nonRefundable: boolean;
    amendmentRequiresApproval: boolean;
  };
  totalMinor: Money;
  paidMinor: Money;
  checkIn: IsoDate;
  now: Date;
}): { penaltyMinor: Money; refundableMinor: Money; requiresApproval: boolean; summary: string } {
  const { policy } = opts;
  const checkInAt = new Date(`${opts.checkIn}T14:00:00+03:00`); // Kampala
  const hoursUntil = (checkInAt.getTime() - opts.now.getTime()) / 3_600_000;

  if (policy.nonRefundable) {
    return {
      penaltyMinor: opts.paidMinor,
      refundableMinor: 0,
      requiresApproval: policy.amendmentRequiresApproval,
      summary: 'This rate is non-refundable. No refund is due.',
    };
  }

  const cutoff = policy.freeCancelCutoffHours ?? 0;
  if (hoursUntil >= cutoff) {
    return {
      penaltyMinor: 0,
      refundableMinor: opts.paidMinor,
      requiresApproval: false,
      summary: `Free cancellation applies. Anything already paid (${opts.paidMinor / 100}) is refundable.`,
    };
  }

  const penalty = Math.min(applyPercent(opts.totalMinor, policy.penaltyPercent), opts.paidMinor);
  return {
    penaltyMinor: penalty,
    refundableMinor: Math.max(0, opts.paidMinor - penalty),
    requiresApproval: policy.amendmentRequiresApproval,
    summary: `Cancelling inside the free-cancellation window incurs a ${policy.penaltyPercent}% charge.`,
  };
}
