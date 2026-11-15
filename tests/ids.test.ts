import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  bookingReference,
  leadReference,
  quotationReference,
  newId,
  slugId,
  manageToken,
  hashToken,
  tokenMatches,
  dedupeHash,
} from '../src/lib/ids';

describe('ID & Reference Utilities', () => {
  it('generates well-formatted booking references', () => {
    const ref = bookingReference();
    assert.match(ref, /^SAW-[ACDEFGHJKLMNPQRTUVWXY349]{6}$/);
  });

  it('generates well-formatted lead references', () => {
    const ref = leadReference();
    assert.match(ref, /^ENQ-[ACDEFGHJKLMNPQRTUVWXY349]{6}$/);
  });

  it('generates prefixed IDs', () => {
    const id = newId('bk');
    assert.match(id, /^bk_[a-f0-9]{20}$/);
    const slug = slugId('rt', 'one-bedroom-deluxe');
    assert.equal(slug, 'rt_one-bedroom-deluxe');
  });

  it('securely generates and matches manage tokens', () => {
    const token = manageToken();
    const hash = hashToken(token);

    assert.equal(tokenMatches(token, hash), true);
    assert.equal(tokenMatches('wrong-token', hash), false);
  });

  it('normalizes and detects duplicate inquiries via dedupeHash', () => {
    const hash1 = dedupeHash({
      email: '  Guest@Example.COM ',
      phone: '+256 (752) 711-704',
      enquiryType: 'accommodation',
      checkIn: '2026-09-15',
      checkOut: '2026-09-20',
    });

    const hash2 = dedupeHash({
      email: 'guest@example.com',
      phone: '0752711704',
      enquiryType: 'accommodation',
      checkIn: '2026-09-15',
      checkOut: '2026-09-20',
    });

    // Both should match because email is trimmed/lowercased and phone uses normalized digits
    assert.equal(hash1, hash2);

    const hashDifferent = dedupeHash({
      email: 'other@example.com',
      phone: '0752711704',
      enquiryType: 'accommodation',
      checkIn: '2026-09-15',
      checkOut: '2026-09-20',
    });
    assert.notEqual(hash1, hashDifferent);
  });
});
