/**
 * Stay dates are calendar dates in Africa/Kampala, never instants. All helpers
 * work on 'YYYY-MM-DD' strings and use UTC internally so a server in another
 * timezone cannot shift a check-in by a day.
 */

export type IsoDate = string; // YYYY-MM-DD

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string' || !ISO.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function parseIso(value: IsoDate): Date {
  if (!isIsoDate(value)) throw new Error(`Invalid date: ${value}`);
  return new Date(`${value}T00:00:00Z`);
}

export const toIso = (d: Date): IsoDate => d.toISOString().slice(0, 10);

export function addDays(value: IsoDate, days: number): IsoDate {
  const d = parseIso(value);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** Nights between check-in and check-out. Departure day is not a night. */
export function nightsBetween(checkIn: IsoDate, checkOut: IsoDate): number {
  const ms = parseIso(checkOut).getTime() - parseIso(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

/** The occupied nights: check-in inclusive, check-out exclusive. */
export function eachNight(checkIn: IsoDate, checkOut: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  const n = nightsBetween(checkIn, checkOut);
  for (let i = 0; i < n; i += 1) out.push(addDays(checkIn, i));
  return out;
}

/** Today in the property's timezone, not the server's. */
export function todayInKampala(now: Date = new Date()): IsoDate {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kampala',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(now);
}

/** Two stays overlap when each starts before the other ends. */
export function rangesOverlap(aIn: IsoDate, aOut: IsoDate, bIn: IsoDate, bOut: IsoDate): boolean {
  return aIn < bOut && bIn < aOut;
}

export function formatStayRange(checkIn: IsoDate, checkOut: IsoDate): string {
  const f = (d: IsoDate) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric',
    }).format(parseIso(d));
  return `${f(checkIn)} – ${f(checkOut)}`;
}

export function formatLongDate(value: IsoDate): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  }).format(parseIso(value));
}
