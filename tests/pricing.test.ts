import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  quote,
  applyPercent,
  applyBps,
  formatMoney,
  promoIsEligible,
  PricingError,
  type RatePlanInput,
  type TaxInput,
  type PromoInput,
} from '../src/lib/pricing';

describe('Pricing Engine & Money Calculations', () => {
  const plan: RatePlanInput = {
    id: 'rp_deluxe_standard',
    code: 'BAR',
    name: 'Best Available Rate',
    currency: 'USD',
    baseRateMinor: 18000, // $180.00
    minStay: 1,
    maxStay: 30,
    depositPercent: 50,
    extraAdultMinor: 3000,
    extraChildMinor: 1500,
    includedAdults: 2,
  };

  const vatTax: TaxInput = {
    code: 'VAT',
    name: 'Value Added Tax',
    rateBps: 1800, // 18%
    appliesTo: 'total',
    inclusive: false,
  };

  it('correctly calculates basic money operations and basis points', () => {
    assert.equal(applyPercent(10000, 15), 1500); // 15% of 100.00
    assert.equal(applyBps(10000, 1800), 1800); // 18% VAT
    assert.equal(applyPercent(1999, 10), 200); // half-up rounding
  });

  it('formats currency correctly for USD and UGX', () => {
    const usd = formatMoney(18000, 'USD');
    assert.match(usd, /180/);
    const ugx = formatMoney(50000000, 'UGX');
    assert.match(ugx, /500/);
  });

  it('computes a complete multi-night quote with taxes', () => {
    const res = quote({
      checkIn: '2026-09-15',
      checkOut: '2026-09-18', // 3 nights
      adults: 2,
      children: 0,
      rooms: 1,
      roomTypeId: 'rt_deluxe',
      plan,
      calendar: [],
      taxes: [vatTax],
      today: '2026-09-13',
    });

    assert.equal(res.nights, 3);
    assert.equal(res.accommodationMinor, 3 * 18000); // $540.00
    assert.equal(res.taxMinor, Math.round(54000 * 0.18)); // $97.20
    assert.equal(res.totalMinor, 54000 + 9720); // $637.20
    assert.equal(res.depositDueMinor, Math.round(res.totalMinor * 0.5)); // 50% deposit
  });

  it('validates promo code eligibility', () => {
    const promo: PromoInput = {
      code: 'WEEKEND10',
      discountType: 'percent',
      discountValue: 10,
      minNights: 2,
      active: true,
      validFrom: '2026-09-01',
      validTo: '2026-09-30',
    };

    const eligible = promoIsEligible(promo, {
      today: '2026-09-13',
      checkIn: '2026-09-15',
      nights: 3,
      roomTypeId: 'rt_deluxe',
    });
    assert.equal(eligible.ok, true);

    const tooShort = promoIsEligible(promo, {
      today: '2026-09-13',
      checkIn: '2026-09-15',
      nights: 1,
      roomTypeId: 'rt_deluxe',
    });
    assert.equal(tooShort.ok, false);
  });

  it('enforces min stay requirements in quote', () => {
    const longStayPlan: RatePlanInput = {
      ...plan,
      minStay: 7,
    };

    assert.throws(
      () =>
        quote({
          checkIn: '2026-09-15',
          checkOut: '2026-09-17', // 2 nights < 7
          adults: 2,
          children: 0,
          rooms: 1,
          roomTypeId: 'rt_deluxe',
          plan: longStayPlan,
          calendar: [],
          today: '2026-09-13',
        }),
      PricingError,
    );
  });
});
