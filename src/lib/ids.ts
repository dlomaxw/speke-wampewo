import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

/** Stable ids for seeded rows so re-seeding is idempotent. */
export const slugId = (prefix: string, slug: string) => `${prefix}_${slug}`;

export const newId = (prefix: string) => `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`;

const REF_ALPHABET = 'ACDEFGHJKLMNPQRTUVWXY349'; // no 0/O, 1/I/L, S/5, B/8

function refBody(length: number) {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return out;
}

/**
 * Guest-facing booking reference. Read aloud over the phone often, so the
 * alphabet excludes characters that are mistaken for one another.
 */
export const bookingReference = () => `SAW-${refBody(6)}`;
export const leadReference = () => `ENQ-${refBody(6)}`;
export const quotationReference = () => `QTE-${refBody(6)}`;

/** Opaque token for managing a booking without an account. */
export function manageToken() {
  return randomBytes(24).toString('base64url');
}

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Constant-time compare so a token cannot be recovered by timing the response. */
export function tokenMatches(candidate: string, storedHash: string) {
  const a = Buffer.from(hashToken(candidate), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Identifies a likely-duplicate enquiry: same person, same intent, same dates.
 * Normalised so "  Jane@Example.COM " and "jane@example.com" collide.
 */
export function dedupeHash(input: {
  email?: string | null;
  phone?: string | null;
  enquiryType: string;
  checkIn?: string | null;
  checkOut?: string | null;
}) {
  const email = (input.email || '').trim().toLowerCase();
  const phone = (input.phone || '').replace(/[^\d]/g, '').slice(-9);
  const parts = [email, phone, input.enquiryType, input.checkIn || '', input.checkOut || ''];
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

export { randomUUID };
