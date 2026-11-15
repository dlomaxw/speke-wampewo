'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DINING_SEATING_AREAS, DINING_TIME_SLOTS } from '@/lib/facilities';

export default function DiningBookingPage() {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState(DINING_TIME_SLOTS[6]); // 07:00 PM Dinner
  const [partySize, setPartySize] = useState(2);
  const [seatingArea, setSeatingArea] = useState(DINING_SEATING_AREAS[0].id);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occasion, setOccasion] = useState('none');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    ok: boolean;
    reference?: string;
    message?: string;
    whatsappUrl?: string;
    error?: string;
  } | null>(null);

  const selectedArea = useMemo(
    () => DINING_SEATING_AREAS.find((a) => a.id === seatingArea) || DINING_SEATING_AREAS[0],
    [seatingArea],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingResult(null);

    try {
      const res = await fetch('/api/facility-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityType: 'dining',
          guestName,
          phone,
          email,
          date,
          timeSlot,
          partySize,
          serviceName: `Table for ${partySize} (${selectedArea.name})`,
          seatingArea: selectedArea.name,
          totalPrice: 0, // Complimentary table reservation
          notes: [
            occasion !== 'none' ? `Occasion: ${occasion}` : null,
            notes ? `Special Requests: ${notes}` : null,
          ]
            .filter(Boolean)
            .join(' | '),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setBookingResult({
          ok: true,
          reference: data.reference,
          message: data.message,
          whatsappUrl: data.whatsappUrl,
        });
      } else {
        setBookingResult({
          ok: false,
          error: data.error || 'Failed to reserve table.',
        });
      }
    } catch (err: any) {
      setBookingResult({
        ok: false,
        error: err.message || 'Network error occurred.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-page text-ink-primary">
      <header className="sticky top-0 z-50 bg-surface-page/95 backdrop-blur-md border-b border-brand-antique/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-ink-secondary hover:text-brand-bronze-ink text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>←</span> Back to Overview
          </Link>
          <div className="text-right">
            <span className="text-[11px] text-ink-muted block">Fine Dining & Steaks</span>
            <span className="text-xs font-serif text-brand-bronze-ink font-semibold">
              La Cabana Restaurant • Wampewo
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-3xl overflow-hidden border border-hairline shadow-2xl mb-12">
          <div className="relative h-64 sm:h-80 w-full">
            <Image
              src="/media/dining-01.jpg"
              alt="La Cabana Restaurant Dining"
              fill
              priority
              className="object-cover brightness-40"
            />
            {/* Dark photo in both themes: its own scrim, and copy in
                ink-on-scrim, which does not flip with the theme. */}
            <div className="absolute inset-0 bg-scrim" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-page/80 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 right-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-espresso/60 border border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider mb-2">
              ★ Kampala’s Premier Multi-Cuisine & Brazilian Rodizio
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink-on-scrim tracking-tight">
              La Cabana Restaurant
            </h1>
            <p className="mt-2 text-ink-on-scrim/90 text-xs sm:text-sm">
              Reserve your table for signature Brazilian Churrasco meats, authentic Indian curries,
              continental classics, and bespoke cocktail pairings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Seating Area Selection */}
            <div>
              <h2 className="text-xl font-serif font-semibold text-ink-primary mb-4">
                1. Select Dining Atmosphere
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DINING_SEATING_AREAS.map((area) => (
                  <div
                    key={area.id}
                    onClick={() => setSeatingArea(area.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      seatingArea === area.id
                        ? 'bg-surface-raised border-brand-antique shadow-lg'
                        : 'bg-surface-raised border-hairline hover:border-hairline'
                    }`}
                  >
                    <span className="text-sm font-semibold text-ink-primary block">{area.name}</span>
                    <span className="text-xs text-brand-bronze-ink mt-1 block">
                      {area.id === 'rodizio_lounge' ? 'Full Churrasco experience' : 'À la carte & bar'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date, Time & Guests */}
            <div className="p-6 rounded-2xl bg-surface-raised border border-hairline space-y-6">
              <h2 className="text-lg font-serif font-semibold text-ink-primary">
                2. Party Size & Seating Time
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">Reservation Date *</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">Guests / Seats *</label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? 's' : ''} {num >= 8 ? '(Large Party)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-secondary mb-2 text-xs">
                  Available Seating Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {DINING_TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 px-2.5 rounded text-center transition-all text-[11px] ${
                        timeSlot === slot
                          ? 'bg-brand-bronze-deep text-ink-inverse font-bold shadow'
                          : 'bg-surface-page border border-hairline text-ink-secondary hover:border-control'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Guest Form */}
            <div className="p-6 rounded-2xl bg-surface-raised border border-hairline">
              <h2 className="text-lg font-serif font-semibold text-ink-primary mb-4">
                3. Host Contact & Special Occasions
              </h2>

              {bookingResult && (
                <div
                  className={`p-4 rounded-xl border mb-6 text-xs ${
                    bookingResult.ok
                      ? 'bg-emerald-50/60 border-emerald-500/50 text-emerald-700'
                      : 'bg-red-50/60 border-red-500/50 text-red-700'
                  }`}
                >
                  {bookingResult.ok ? (
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>✓</span> Table Reserved Successfully!
                      </div>
                      <p className="mt-1">{bookingResult.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="font-mono bg-emerald-100/60 px-2.5 py-1 rounded text-emerald-700 font-bold">
                          Table Ref: {bookingResult.reference}
                        </span>
                        {bookingResult.whatsappUrl && (
                          <a
                            href={bookingResult.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim font-bold px-3 py-1.5 rounded transition-colors"
                          >
                            Send to La Cabana WhatsApp →
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold">Error: </span>
                      {bookingResult.error}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">Host Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Christine Namubiru"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">
                      WhatsApp / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 702 711 009"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">Special Occasion</label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    >
                      <option value="none">Casual Dining</option>
                      <option value="birthday">Birthday Celebration</option>
                      <option value="anniversary">Anniversary / Romantic</option>
                      <option value="business">Business Dinner / Corporate</option>
                      <option value="family">Family Gathering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="christine@example.com"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">
                    Dietary Requirements or Table Setup Requests
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Halal meat only, high chair needed, cake presentation, wine preference..."
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-bronze-deep hover:brightness-110 text-ink-inverse font-bold text-xs uppercase tracking-wider py-3 rounded transition-all shadow disabled:opacity-50"
                >
                  {submitting ? 'Confirming Table...' : `Reserve Table for ${partySize} Guests`}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Reservation Details */}
          <div className="space-y-6">
            <div className="bg-surface-raised rounded-2xl border border-brand-antique/40 p-6 shadow-xl space-y-4">
              <span className="text-xs text-brand-bronze-ink uppercase tracking-wider font-semibold block">
                Reservation Details
              </span>

              <div className="border-t border-hairline pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-ink-secondary">
                  <span>Area</span>
                  <span className="font-semibold text-ink-primary text-right">{selectedArea.name}</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Party Size</span>
                  <span className="font-semibold text-ink-primary">{partySize} Guests</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Date</span>
                  <span className="font-semibold text-ink-primary">{date}</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Time</span>
                  <span className="font-semibold text-brand-bronze-ink">{timeSlot}</span>
                </div>
                <div className="flex justify-between text-ink-muted pt-2 border-t border-hairline">
                  <span>Table Hold Fee</span>
                  <span className="text-emerald-700 font-semibold">Complimentary</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/256702711009?text=Hello%20La%20Cabana,%20I%20would%20like%20to%20reserve%20a%20table%20for%20${partySize}%20guests%20on%20${date}%20at%20${encodeURIComponent(timeSlot)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim font-bold text-xs uppercase tracking-wider py-2.5 rounded text-center block transition-all shadow"
                >
                  💬 WhatsApp La Cabana Desk
                </a>
              </div>
            </div>

            <div className="bg-surface-raised rounded-2xl border border-hairline p-6 shadow-xl text-xs space-y-3">
              <h3 className="text-sm font-semibold text-ink-primary">Dining Highlights</h3>
              <ul className="space-y-2 text-ink-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Authentic Brazilian Churrasco All-You-Can-Eat
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> 100% Certified Halal Beef, Lamb & Chicken
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Wine Cellar with South African & European Vintages
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Apartment Room Service available 24/7
                </li>
              </ul>
              <div className="pt-2 border-t border-hairline text-[11px] text-ink-muted">
                Opening Hours: Lunch 11:30 - 15:30 | Dinner 18:00 - 23:00.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
