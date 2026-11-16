'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

import { buildBookingUrl } from '@/lib/swiftbook';


interface BookingPriceCalculatorProps {
  roomName: string;
  roomSlug: string;
  nightlyRate: number;
  rackRate: number;
  bedrooms: number;
  maxOccupancy: number;
}

export default function BookingPriceCalculator({
  roomName,
  roomSlug,
  nightlyRate,
  rackRate,
  bedrooms,
  maxOccupancy,
}: BookingPriceCalculatorProps) {
  // Compute initial dates in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const defaultOutStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }, []);

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(defaultOutStr);
  const [adults, setAdults] = useState<number>(Math.min(2, maxOccupancy));

  // Compute nights safely
  const { nights, isValid, error } = useMemo(() => {
    if (!checkIn || !checkOut) {
      return { nights: 0, isValid: false, error: 'Please select both check-in and check-out dates.' };
    }
    const tIn = new Date(`${checkIn}T00:00:00Z`).getTime();
    const tOut = new Date(`${checkOut}T00:00:00Z`).getTime();

    if (isNaN(tIn) || isNaN(tOut)) {
      return { nights: 0, isValid: false, error: 'Invalid dates selected.' };
    }

    const diffDays = Math.round((tOut - tIn) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return {
        nights: 0,
        isValid: false,
        error: 'Check-out date must be at least 1 day after check-in date.',
      };
    }

    return { nights: diffDays, isValid: true, error: null };
  }, [checkIn, checkOut]);

  // Handle check-in change: auto-adjust checkout if invalid
  const handleCheckInChange = (newIn: string) => {
    setCheckIn(newIn);
    const tIn = new Date(`${newIn}T00:00:00Z`).getTime();
    const tOut = new Date(`${checkOut}T00:00:00Z`).getTime();
    if (tOut <= tIn) {
      const nextDay = new Date(tIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().slice(0, 10));
    }
  };

  // Calculations
  const accommodationSubtotal = nights * nightlyRate;
  // Tax inclusive, as the engine quotes it — nothing added on top.
  const totalAmount = accommodationSubtotal;
  const depositDue = Math.round(totalAmount * 0.5);

  const standardRackSubtotal = nights * rackRate;
  const totalSavings = Math.max(0, standardRackSubtotal - accommodationSubtotal);

  // WhatsApp text
  const whatsappMessage = useMemo(() => {
    return `Hello Speke Apartments Wampewo, I would like to reserve the ${roomName} from ${checkIn} to ${checkOut} (${nights} night${nights > 1 ? 's' : ''}, ${adults} guest${adults > 1 ? 's' : ''}). Estimated total: $${totalAmount} USD (incl. 18% VAT).`;
  }, [roomName, checkIn, checkOut, nights, adults, totalAmount]);

  return (
    <div className="sticky top-24 bg-surface-raised rounded-md border border-brand-antique/40 p-6 shadow-2xl space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-brand-bronze-ink uppercase tracking-wider font-semibold">
            Reserve Directly
          </span>
          <span className="text-[11px] bg-emerald-50/80 border border-emerald-500/40 text-emerald-700 px-2 py-0.5 rounded-md font-mono">
            Best Rate Guaranteed
          </span>
        </div>
        <h3 className="text-xl font-serif font-bold text-ink-primary mt-1">Book Your Dates</h3>
        <p className="text-xs text-ink-muted mt-1">
          Price updates dynamically based on the exact days selected.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Check-in */}
        <div>
          <label className="block font-semibold text-ink-secondary mb-1">
            Check-in Date <span className="text-ink-muted font-normal">(from 14:00)</span>
          </label>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="w-full bg-surface-page border border-hairline rounded-md px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique transition-colors"
          />
        </div>

        {/* Check-out */}
        <div>
          <label className="block font-semibold text-ink-secondary mb-1">
            Check-out Date <span className="text-ink-muted font-normal">(by 11:00)</span>
          </label>
          <input
            type="date"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-surface-page border border-hairline rounded-md px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique transition-colors"
          />
        </div>

        {/* Adults / Guests */}
        <div>
          <label className="block font-semibold text-ink-secondary mb-1">Guests</label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full bg-surface-page border border-hairline rounded-md px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique transition-colors"
          >
            {Array.from({ length: maxOccupancy }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} Adult{num > 1 ? 's' : ''} (Max {maxOccupancy})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="p-3 rounded-md bg-amber-50/50 border border-amber-500/40 text-amber-700 text-xs">
          ⚠️ {error}
        </div>
      ) : (
        /* Live Price Breakdown */
        <div className="border-t border-hairline pt-4 space-y-2.5 text-xs">
          <div className="flex justify-between text-ink-secondary">
            <span>
              ${nightlyRate} × {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span className="font-semibold text-ink-primary">${accommodationSubtotal}</span>
          </div>

          <div className="flex justify-between text-ink-muted">
            <span>Ugandan VAT (18%)</span>
            <span>Included</span>
          </div>

          {totalSavings > 0 && (
            <div className="flex justify-between text-emerald-700 text-[11px]">
              <span>Direct Booking Savings</span>
              <span>-${totalSavings}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline font-bold text-sm text-brand-bronze-ink pt-2 border-t border-hairline">
            <span>Estimated Total ({nights} day{nights > 1 ? 's' : ''})</span>
            <span className="text-xl text-brand-bronze-ink">${totalAmount}</span>
          </div>

          <div className="flex justify-between text-ink-muted text-[11px]">
            <span>Holding Deposit Due (50%)</span>
            <span className="font-mono text-ink-secondary">${depositDue}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Primary path: hand off to SwiftBook with this apartment, the
            chosen dates and guest count already selected. */}
        <a
          href={
            isValid
              ? buildBookingUrl()
              : '#'
          }
          target={isValid ? '_blank' : undefined}
          rel="noopener noreferrer"
          aria-disabled={!isValid}
          className={`w-full bg-brand-bronze-deep hover:bg-brand-bronze-ink text-ink-inverse font-bold text-xs uppercase tracking-wider py-3 rounded-md text-center block transition-all shadow ${
            !isValid ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          Book {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'this apartment'} &rarr;
        </a>

        <a
          href={isValid ? `https://wa.me/256200555000?text=${encodeURIComponent(whatsappMessage)}` : '#'}
          target={isValid ? '_blank' : undefined}
          rel="noopener noreferrer"
          className={`w-full bg-brand-bronze-deep hover:bg-brand-bronze-ink text-ink-on-scrim font-bold text-xs uppercase tracking-wider py-3 rounded-md text-center block transition-all shadow ${
            !isValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          💬 Book via WhatsApp ({nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'Select Dates'})
        </a>

        <Link
          href={`/contact?room=${encodeURIComponent(roomName)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`}
          className="w-full bg-surface-page border border-brand-antique/50 hover:bg-brand-antique/10 text-brand-bronze-ink font-semibold text-xs uppercase tracking-wider py-3 rounded-md text-center block transition-all"
        >
          Request Formal Quote (${totalAmount})
        </Link>
      </div>

      <div className="text-[11px] text-ink-muted text-center">
        Need assistance or special requests? Call{' '}
        <a href="tel:+256200555000" className="text-brand-bronze-ink underline">
          +256 200 555 000
        </a>
      </div>
    </div>
  );
}
