'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SPA_TREATMENTS, SPA_TIME_SLOTS } from '@/lib/facilities';

export default function SpaBookingPage() {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState(SPA_TIME_SLOTS[1]);
  const [treatmentId, setTreatmentId] = useState(SPA_TREATMENTS[0].id);
  const [persons, setPersons] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    ok: boolean;
    reference?: string;
    message?: string;
    whatsappUrl?: string;
    error?: string;
  } | null>(null);

  const selectedTreatment = useMemo(
    () => SPA_TREATMENTS.find((t) => t.id === treatmentId) || SPA_TREATMENTS[0],
    [treatmentId],
  );

  const subtotal = (selectedTreatment.priceMinor / 100) * persons;
  const vat = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingResult(null);

    try {
      const res = await fetch('/api/facility-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityType: 'spa',
          guestName,
          phone,
          email,
          date,
          timeSlot,
          partySize: persons,
          serviceId: selectedTreatment.id,
          serviceName: `${selectedTreatment.name} (${selectedTreatment.duration || 'Session'})`,
          totalPrice: total,
          notes,
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
          error: data.error || 'Failed to book spa appointment.',
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
            <span className="text-[11px] text-ink-muted block">Wellness & Therapy</span>
            <span className="text-xs font-serif text-brand-bronze-ink font-semibold">
              Calabash Spa & Turkish Hammam
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-hairline shadow-2xl mb-12">
          <div className="relative h-64 sm:h-80 w-full">
            <Image
              src="/media/facility-spa.jpg"
              alt="Calabash Spa and Turkish Hammam"
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
              ★ Authentic Turkish Hammam & Luxury Therapies
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink-on-scrim tracking-tight">
              Calabash Spa & Salon
            </h1>
            <p className="mt-2 text-ink-on-scrim/90 text-xs sm:text-sm">
              Surrender to deep tranquility. Featuring Kampala’s foremost authentic Turkish Hammam,
              full-body aromatherapies, hot stone rituals, and executive hair and salon treatments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Treatment Selector */}
            <div>
              <h2 className="text-xl font-serif font-semibold text-ink-primary mb-4">
                1. Select Ritual or Treatment
              </h2>
              <div className="space-y-3">
                {SPA_TREATMENTS.map((treatment) => (
                  <div
                    key={treatment.id}
                    onClick={() => setTreatmentId(treatment.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      treatmentId === treatment.id
                        ? 'bg-surface-raised border-brand-antique shadow-lg'
                        : 'bg-surface-raised border-hairline hover:border-hairline'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink-primary">
                          {treatment.name}
                        </span>
                        {treatment.badge && (
                          <span className="text-[10px] bg-brand-antique/20 text-brand-bronze-ink px-2 py-0.5 rounded font-semibold">
                            {treatment.badge}
                          </span>
                        )}
                        {treatment.duration && (
                          <span className="text-[11px] text-ink-muted">
                            ⏱ {treatment.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted mt-1">{treatment.description}</p>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="text-base font-bold text-brand-bronze-ink">
                        ${treatment.priceMinor / 100}
                      </span>
                      <span className="text-ink-muted text-xs block">USD</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="p-6 rounded-2xl bg-surface-raised border border-hairline space-y-6">
              <h2 className="text-lg font-serif font-semibold text-ink-primary">
                2. Schedule Appointment
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">Date *</label>
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
                  <label className="block font-semibold text-ink-secondary mb-1">Guests / Persons</label>
                  <select
                    value={persons}
                    onChange={(e) => setPersons(Number(e.target.value))}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 Persons (Couple Session)</option>
                    <option value={3}>3 Persons</option>
                    <option value={4}>4 Persons (Group)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-secondary mb-2 text-xs">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {SPA_TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 px-3 rounded text-center transition-all ${
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

            {/* Guest Details */}
            <div className="p-6 rounded-2xl bg-surface-raised border border-hairline">
              <h2 className="text-lg font-serif font-semibold text-ink-primary mb-4">
                3. Client Details
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
                        <span>✓</span> Spa Appointment Confirmed!
                      </div>
                      <p className="mt-1">{bookingResult.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="font-mono bg-emerald-100/60 px-2.5 py-1 rounded text-emerald-700 font-bold">
                          Booking Ref: {bookingResult.reference}
                        </span>
                        {bookingResult.whatsappUrl && (
                          <a
                            href={bookingResult.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim font-bold px-3 py-1.5 rounded transition-colors"
                          >
                            Dispatch on WhatsApp →
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
                    <label className="block font-semibold text-ink-secondary mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Brenda Akello"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 702 711 056"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">
                    Therapist Preferences / Medical Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Focus on shoulders, preferred female therapist, aromatherapy scent..."
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-bronze-deep hover:brightness-110 text-ink-inverse font-bold text-xs uppercase tracking-wider py-3 rounded transition-all shadow disabled:opacity-50"
                >
                  {submitting ? 'Confirming Appointment...' : `Confirm Spa Appointment ($${total} USD)`}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Appointment Summary */}
          <div className="space-y-6">
            <div className="bg-surface-raised rounded-2xl border border-brand-antique/40 p-6 shadow-xl space-y-4">
              <span className="text-xs text-brand-bronze-ink uppercase tracking-wider font-semibold block">
                Appointment Summary
              </span>

              <div className="border-t border-hairline pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-ink-secondary">
                  <span>Treatment</span>
                  <span className="font-semibold text-ink-primary text-right">
                    {selectedTreatment.name}
                  </span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Date & Time</span>
                  <span className="font-semibold text-ink-primary">
                    {date} at {timeSlot}
                  </span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Persons</span>
                  <span>{persons} guest{persons > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>VAT (18%)</span>
                  <span>${vat}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-brand-bronze-ink pt-2 border-t border-hairline">
                  <span>Total Due</span>
                  <span>${total} USD</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/256702711056?text=Hello%20Calabash%20Spa,%20I%20would%20like%20to%20book%20the%20${encodeURIComponent(selectedTreatment.name)}%20on%20${date}%20at%20${encodeURIComponent(timeSlot)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim font-bold text-xs uppercase tracking-wider py-2.5 rounded text-center block transition-all shadow"
                >
                  💬 Chat Directly with Calabash Spa
                </a>
              </div>
            </div>

            <div className="bg-surface-raised rounded-2xl border border-hairline p-6 shadow-xl text-xs space-y-3">
              <h3 className="text-sm font-semibold text-ink-primary">Spa Amenities</h3>
              <ul className="space-y-2 text-ink-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Authentic Heated Marble Hammam Slabs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Private treatment suites with shower
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Herbal tea and relaxation lounge
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Premium imported organic oils & scrubs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
