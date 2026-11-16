'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

import { ROOM_TYPES } from '@/lib/rooms';
import { buildBookingUrl } from '@/lib/swiftbook';

/** Matches the condensed header height, so the bar parks directly under it. */
const DOCK_OFFSET = 64;

export default function HomeBookingSearchBar() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [docked, setDocked] = useState(false);

  // Serena's booking bar sits at the base of the hero, then docks beneath the
  // header and shrinks (90px -> 74px). Stickiness is CSS; this only notices
  // when the bar has reached its parked position so it can condense.
  useEffect(() => {
    const onScroll = () => {
      const el = barRef.current;
      const section = el?.closest('section');
      if (!section) return;
      // Matches the lg: breakpoint the sticky positioning is bound to.
      const canDock = window.innerWidth >= 1024;
      setDocked(canDock && section.getBoundingClientRect().top <= DOCK_OFFSET + 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Rates come from ROOM_TYPES, the one place they are edited. The short
  // labels stay here because they are display copy, not data.
  const SHORT_NAMES: Record<string, string> = {
    'one-bedroom-deluxe-apartment': '1 Bedroom Deluxe',
    'one-bedroom-superior-apartment': '1 Bedroom Superior',
    'two-bedroom-deluxe-apartment': '2 Bedroom Deluxe',
    'two-bedroom-superior-apartment': '2 Bedroom Superior',
    'three-bedroom-apartment': '3 Bedroom Apartment',
    'three-bedroom-villa': '3 Bedroom Villa',
    'penthouse-apartment': '3 Bedroom Penthouse',
  };

  const apartmentOptions = Object.keys(SHORT_NAMES)
    .map((slug) => {
      const room = ROOM_TYPES.find((r) => r.slug === slug);
      return room
        ? { slug, name: SHORT_NAMES[slug], price: room.fromPriceMinor / 100 }
        : null;
    })
    .filter((o): o is { slug: string; name: string; price: number } => o !== null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultOutStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }, []);

  const [selectedSlug, setSelectedSlug] = useState(apartmentOptions[0].slug);
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(defaultOutStr);

  const selectedApt = useMemo(
    () => apartmentOptions.find((a) => a.slug === selectedSlug) || apartmentOptions[0],
    [selectedSlug],
  );

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const tIn = new Date(`${checkIn}T00:00:00Z`).getTime();
    const tOut = new Date(`${checkOut}T00:00:00Z`).getTime();
    const diff = Math.round((tOut - tIn) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const subtotal = nights * selectedApt.price;
  // Rates are tax inclusive, as the engine quotes them, so nothing is added
  // here. Adding 18% on top would over-quote the guest against the figure
  // they see on the very next screen.
  const total = subtotal;

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    const tIn = new Date(`${val}T00:00:00Z`).getTime();
    const tOut = new Date(`${checkOut}T00:00:00Z`).getTime();
    if (tOut <= tIn) {
      const next = new Date(tIn);
      next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().slice(0, 10));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Open the engine on the property, same link the live site uses, and let
    // the guest confirm dates there against its live rates. The figures above
    // are indicative; the engine's rate moves with the dates.
    window.open(buildBookingUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={barRef}
      className={`bg-surface-raised/95 backdrop-blur-md border-y border-brand-antique/30 transition-all duration-300 ${
        docked
          ? 'mt-0 w-full px-4 sm:px-6 lg:px-8 py-3 shadow-md'
          : 'mt-0 w-full px-4 sm:px-6 lg:px-8 py-5 shadow-sm'
      }`}
    >
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div>
          <label className={`block text-[11px] font-semibold text-brand-bronze-ink uppercase tracking-wider mb-1 ${docked ? "sr-only" : ""}`}>
            Apartment Category
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full bg-surface-page border border-hairline rounded-md px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-brand-antique"
          >
            {apartmentOptions.map((apt) => (
              <option key={apt.slug} value={apt.slug}>
                {apt.name} (${apt.price}/night)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-[11px] font-semibold text-brand-bronze-ink uppercase tracking-wider mb-1 ${docked ? "sr-only" : ""}`}>
            Check-In Date
          </label>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="w-full bg-surface-page border border-hairline rounded-md px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-brand-antique"
          />
        </div>

        <div>
          <label className={`block text-[11px] font-semibold text-brand-bronze-ink uppercase tracking-wider mb-1 ${docked ? "sr-only" : ""}`}>
            Check-Out Date
          </label>
          <input
            type="date"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-surface-page border border-hairline rounded-md px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-brand-antique"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-brand-bronze-deep hover:brightness-110 text-ink-inverse font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-md transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Reserve Suite</span>
            <span>→</span>
          </button>
        </div>
      </form>

      {/* Dynamic Price Bar updated per days selected */}
      <div hidden={docked} className="mt-4 pt-3 border-t border-hairline/80 flex flex-wrap justify-between items-center text-xs text-ink-secondary gap-2">
        <div className="flex items-center gap-2">
          <span className="text-brand-bronze-ink font-semibold">{nights} Night{nights !== 1 ? 's' : ''} Selected:</span>
          <span>
            ${selectedApt.price} × {nights} = ${subtotal}
          </span>
          <span className="text-ink-muted">(VAT included)</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-ink-muted">Total Quote:</span>
          <span className="text-base font-bold text-brand-bronze-ink">${total} USD</span>
        </div>
      </div>

      {/* The engine holds the live, tax-inclusive rate and it can differ from
          this estimate, so say so before the guest is handed over. */}
      <p hidden={docked} className="mt-2 text-[11px] text-ink-muted">
        Indicative estimate. Live availability and the final rate are confirmed
        on the next step.
      </p>
    </div>
  );
}
