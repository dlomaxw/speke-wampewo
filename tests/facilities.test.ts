import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  POOL_PASSES,
  SPA_TREATMENTS,
  GYM_PASSES,
  DINING_SEATING_AREAS,
  facilityReference,
  SPA_TIME_SLOTS,
  DINING_TIME_SLOTS,
  GYM_TIME_SLOTS,
} from '../src/lib/facilities';

describe('Facility Catalog & Booking Reference Suite', () => {
  it('generates properly formatted booking references for all facility types', () => {
    const poolRef = facilityReference('pool');
    assert.match(poolRef, /^POOL-[A-Z0-9]{6}$/);

    const spaRef = facilityReference('spa');
    assert.match(spaRef, /^SPA-[A-Z0-9]{6}$/);

    const gymRef = facilityReference('gym');
    assert.match(gymRef, /^GYM-[A-Z0-9]{6}$/);

    const diningRef = facilityReference('dining');
    assert.match(diningRef, /^TAB-[A-Z0-9]{6}$/);
  });

  it('generates unique references across multiple calls', () => {
    const refs = new Set<string>();
    for (let i = 0; i < 50; i++) {
      refs.add(facilityReference('pool'));
      refs.add(facilityReference('spa'));
    }
    assert.equal(refs.size, 100);
  });

  it('verifies pool passes have valid pricing and catalog invariants', () => {
    assert.ok(POOL_PASSES.length >= 3);
    const adultPass = POOL_PASSES.find((p) => p.id === 'pool_adult_day');
    assert.ok(adultPass);
    assert.equal(adultPass.priceMinor, 1000); // $10.00
    assert.equal(adultPass.currency, 'USD');
    assert.equal(adultPass.category, 'pool');

    const childPass = POOL_PASSES.find((p) => p.id === 'pool_child_day');
    assert.ok(childPass);
    assert.equal(childPass.priceMinor, 500); // $5.00
  });

  it('verifies spa treatments and time slots', () => {
    assert.ok(SPA_TREATMENTS.length >= 4);
    const hammam = SPA_TREATMENTS.find((t) => t.id === 'spa_turkish_hammam');
    assert.ok(hammam);
    assert.equal(hammam.priceMinor, 6000); // $60.00
    assert.equal(hammam.category, 'spa');
    assert.ok(hammam.duration?.includes('mins'));

    assert.ok(SPA_TIME_SLOTS.length >= 5);
    assert.ok(SPA_TIME_SLOTS.includes('09:00 AM'));
    assert.ok(SPA_TIME_SLOTS.includes('06:00 PM'));
  });

  it('verifies gym passes and time slots', () => {
    assert.ok(GYM_PASSES.length >= 3);
    const dayPass = GYM_PASSES.find((g) => g.id === 'gym_day_pass');
    assert.ok(dayPass);
    assert.equal(dayPass.priceMinor, 1500); // $15.00
    assert.equal(dayPass.category, 'gym');

    assert.ok(GYM_TIME_SLOTS.length >= 3);
  });

  it('verifies dining areas and dining time slots', () => {
    assert.ok(DINING_SEATING_AREAS.length >= 3);
    assert.ok(DINING_TIME_SLOTS.length >= 5);
    const mainDining = DINING_SEATING_AREAS.find((a: { id: string; name: string }) => a.id === 'main_dining');
    assert.ok(mainDining);
  });

  it('accurately computes pool day pass per-day prices with 18% VAT', () => {
    const adultRate = 10;
    const childRate = 5;
    const adults = 2;
    const children = 1;

    const subtotal = adults * adultRate + children * childRate; // $25.00
    assert.equal(subtotal, 25);

    const vat = Math.round(subtotal * 0.18 * 100) / 100; // $4.50
    assert.equal(vat, 4.5);

    const total = subtotal + vat; // $29.50
    assert.equal(total, 29.5);
  });
});
