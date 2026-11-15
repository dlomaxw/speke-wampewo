import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isIsoDate,
  parseIso,
  toIso,
  addDays,
  nightsBetween,
  eachNight,
  todayInKampala,
  rangesOverlap,
  formatStayRange,
} from '../src/lib/dates';

describe('Date Utilities (Africa/Kampala & ISO)', () => {
  it('validates ISO date format YYYY-MM-DD', () => {
    assert.equal(isIsoDate('2026-09-15'), true);
    assert.equal(isIsoDate('2026-02-28'), true);
    assert.equal(isIsoDate('2026-02-31'), false); // invalid calendar date
    assert.equal(isIsoDate('invalid-date'), false);
    assert.equal(isIsoDate(''), false);
    assert.equal(isIsoDate(null), false);
  });

  it('correctly calculates nights between dates', () => {
    assert.equal(nightsBetween('2026-09-15', '2026-09-16'), 1);
    assert.equal(nightsBetween('2026-09-15', '2026-09-22'), 7);
    assert.equal(nightsBetween('2026-09-01', '2026-10-01'), 30);
  });

  it('generates accurate list of occupied nights', () => {
    const nights = eachNight('2026-09-15', '2026-09-18');
    assert.deepEqual(nights, ['2026-09-15', '2026-09-16', '2026-09-17']);
    assert.equal(nights.length, 3);
  });

  it('correctly adds days to ISO dates', () => {
    assert.equal(addDays('2026-09-28', 3), '2026-10-01');
    assert.equal(addDays('2026-09-15', 0), '2026-09-15');
    assert.equal(addDays('2026-09-15', -1), '2026-09-14');
  });

  it('detects overlapping stay ranges', () => {
    // Overlapping
    assert.equal(rangesOverlap('2026-09-15', '2026-09-20', '2026-09-18', '2026-09-25'), true);
    assert.equal(rangesOverlap('2026-09-15', '2026-09-20', '2026-09-16', '2026-09-19'), true);

    // Adjacent / back-to-back: checkout day equals next checkin day => NOT overlapping
    assert.equal(rangesOverlap('2026-09-15', '2026-09-20', '2026-09-20', '2026-09-25'), false);

    // Completely disjoint
    assert.equal(rangesOverlap('2026-09-15', '2026-09-20', '2026-09-22', '2026-09-25'), false);
  });

  it('formats stay ranges in human-readable British format', () => {
    const formatted = formatStayRange('2026-09-15', '2026-09-20');
    assert.match(formatted, /15 Sept? 2026 – 20 Sept? 2026/);
  });
});
