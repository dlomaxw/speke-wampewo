/**
 * SwiftBook (STAAH) booking-engine hand-off.
 *
 * The property's live availability, rates and payment all live in SwiftBook.
 * This site collects the guest's intent (category, dates, guests) and hands
 * it over with those values prefilled, so the guest does not re-enter them.
 *
 * Room ids below were read off the engine's own listing and each was verified
 * by loading the engine filtered to that single id and confirming the room
 * that came back. None of these values are secret — they appear in the
 * public booking URL.
 */

/**
 * The property's booking-engine id.
 *
 * Taken from the live site, www.spekeapartments.com/wampewo/, which links to
 * the engine in exactly one place and with exactly this id. Keep the two in
 * step: if the live site's link changes, this is the line to update.
 *
 * An older id, 542NzlzAZ9DLaIsTofYXn7xtZe6wZXfOU1Nw==, also resolves to this
 * property, but it is not the one the live site uses.
 */
export const SWIFTBOOK_PROPERTY_ID =
  '963NzUz7Do15a7deOUQ7GJMQMPTgooT0XejD5Qu8P8wmvCDTS8B2uW1Nw==';

const BASE = 'https://www.swiftbook.io/inst/';

/**
 * Site apartment slug -> SwiftBook RoomID.
 *
 * Verified against the engine on 2026-11-13:
 *   186301 -> One Bedroom Deluxe Apartment      (confirmed directly)
 *   158603 -> One Bedroom Superior Apartment    (confirmed by elimination)
 *   217536 -> Two Bedroom Deluxe Apartment      (confirmed directly)
 *   158606 -> Two Bedroom Superior Apartment    (confirmed directly)
 *   158610 -> Three Bedroom Villa               (by listing order; not
 *                                                confirmed on its own)
 *   158612 -> Penthouse Apartment               (confirmed directly)
 */
export const SWIFTBOOK_ROOM_IDS: Record<string, string> = {
  'one-bedroom-deluxe-apartment': '186301',
  'one-bedroom-superior-apartment': '158603',
  'two-bedroom-deluxe-apartment': '217536',
  'two-bedroom-superior-apartment': '158606',
  'three-bedroom-villa': '158610',
  'penthouse-apartment': '158612',
  // 'three-bedroom-apartment' is deliberately absent. The engine lists it,
  // but it had no availability on the days this map was built, so it showed
  // no Book button and its id could not be read. Omitting it means a prefill
  // for that slug falls back to the unfiltered engine, which is correct;
  // guessing an id would send guests to the wrong apartment.
};

export interface BookingHandoff {
  /** Apartment slug. Omit to let the guest choose from every room type. */
  slug?: string;
  /** YYYY-MM-DD */
  checkIn?: string;
  /** YYYY-MM-DD */
  checkOut?: string;
  adults?: number;
  rooms?: number;
}

/**
 * Build the engine URL.
 *
 * Called with no arguments it returns exactly the link the live site uses:
 * the property and nothing else, so the guest picks dates and room in the
 * engine against its own live rates. That is what every booking button on
 * this site does.
 *
 * Passing dates or a slug prefills the engine instead. Useful, but it means
 * this site quotes a price before the engine does, and the engine's rate
 * moves with the dates — a 3-night One Bedroom Deluxe came back at $750 in
 * December and $542 for the same stay nearer the day. Only prefill if the
 * site's displayed rates are being kept in step with the engine.
 *
 * The engine is a hash-routed single-page app and reads these parameters on
 * a full page load only, so always follow this URL with a real navigation
 * (a link or window.open), never by assigning location.hash.
 */
export function buildBookingUrl({
  slug,
  checkIn,
  checkOut,
  adults,
  rooms = 1,
}: BookingHandoff = {}): string {
  const roomId = slug ? SWIFTBOOK_ROOM_IDS[slug] : undefined;
  const prefilling = Boolean(checkIn || checkOut || roomId || adults);

  // The plain form, matching the live site exactly.
  if (!prefilling) {
    return `${BASE}#home?propertyId=${SWIFTBOOK_PROPERTY_ID}&JDRN=Y`;
  }

  const params: string[] = [
    `propertyId=${SWIFTBOOK_PROPERTY_ID}`,
    ...(checkIn ? [`checkIn=${checkIn}`] : []),
    ...(checkOut ? [`checkOut=${checkOut}`] : []),
    'JDRN=Y',
    ...(roomId ? [`RoomID=${roomId}`] : []),
    `noofrooms=${rooms}`,
    `adult0=${adults ?? 2}`,
    `gsId=${SWIFTBOOK_PROPERTY_ID}`,
  ];

  // The engine expects propertyId/gsId with their '=' padding intact, so the
  // query is assembled rather than run through URLSearchParams.
  return `${BASE}#/home?${params.join('&')}`;
}
