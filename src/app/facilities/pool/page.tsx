'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { POOL_PASSES } from '@/lib/facilities';

export default function PoolBookingPage() {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date, setDate] = useState(todayStr);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [passType, setPassType] = useState('pool_adult_day');
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

  // Calculate live total
  const { subtotal, vat, total, summaryText } = useMemo(() => {
    let price = 0;
    let label = '';

    if (passType === 'pool_family_weekend') {
      price = 25;
      label = 'Family Weekend Package (2 Adults + 2 Kids)';
    } else if (passType === 'pool_monthly') {
      price = 90;
      label = 'Monthly Unlimited Pool Membership';
    } else {
      // Per person daily pass
      price = adults * 10 + children * 5;
      label = `${adults} Adult${adults > 1 ? 's' : ''} ($10) ${children > 0 ? `+ ${children} Child${children > 1 ? 'ren' : ''} ($5)` : ''}`;
    }

    const vatAmount = Math.round(price * 0.18 * 100) / 100;
    const finalTotal = price + vatAmount;

    return {
      subtotal: price,
      vat: vatAmount,
      total: finalTotal,
      summaryText: label,
    };
  }, [passType, adults, children]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingResult(null);

    try {
      const res = await fetch('/api/facility-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityType: 'pool',
          guestName,
          phone,
          email,
          date,
          partySize: adults + children,
          serviceId: passType,
          serviceName: summaryText,
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
          error: data.error || 'Failed to submit pool booking.',
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-page/95 backdrop-blur-md border-b border-brand-antique/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-ink-secondary hover:text-brand-bronze-ink text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>←</span> Back to Overview
          </Link>
          <div className="text-right">
            <span className="text-[11px] text-ink-muted block">Day Guest Access</span>
            <span className="text-xs font-serif text-brand-bronze-ink font-semibold">
              Heated Swimming Pool • Kololo
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-hairline shadow-2xl mb-12">
          <div className="relative h-64 sm:h-80 w-full">
            <Image
              src="/media/facility-swimming-pool.jpg"
              alt="Speke Apartments Heated Swimming Pool"
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
              ★ Non-Resident Day Passes Available
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink-on-scrim tracking-tight">
              Heated Swimming Pool
            </h1>
            <p className="mt-2 text-ink-on-scrim/90 text-xs sm:text-sm">
              Enjoy all-weather heated swimming in the prestigious heart of Kololo. Towel service,
              sun lounger access, and poolside dining from La Cabana included with every day pass.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Pass Options & Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pass Selection Cards */}
            <div>
              <h2 className="text-xl font-serif font-semibold text-ink-primary mb-4">
                1. Select Pass Package
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {POOL_PASSES.map((pass) => (
                  <div
                    key={pass.id}
                    onClick={() => setPassType(pass.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      passType === pass.id
                        ? 'bg-surface-raised border-brand-antique shadow-lg'
                        : 'bg-surface-raised border-hairline hover:border-hairline'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-ink-primary">{pass.name}</span>
                      {pass.badge && (
                        <span className="text-[10px] bg-brand-antique/20 text-brand-bronze-ink px-2 py-0.5 rounded font-semibold">
                          {pass.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted mt-1.5">{pass.description}</p>
                    <div className="mt-3 text-base font-bold text-brand-bronze-ink">
                      ${pass.priceMinor / 100}{' '}
                      <span className="text-ink-muted font-normal text-xs">USD</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Guest Counters if individual pass is chosen */}
            {passType === 'pool_adult_day' && (
              <div className="p-5 rounded-xl bg-surface-raised border border-hairline space-y-4">
                <h3 className="text-sm font-semibold text-ink-primary">Guest Count (Daily Passes)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">
                      Adults ($10 / person)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded bg-surface-page border border-hairline text-ink-primary font-bold"
                      >
                        -
                      </button>
                      <span className="text-base font-bold text-ink-primary">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded bg-surface-page border border-hairline text-ink-primary font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">
                      Children ($5 / child under 12)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 rounded bg-surface-page border border-hairline text-ink-primary font-bold"
                      >
                        -
                      </button>
                      <span className="text-base font-bold text-ink-primary">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 rounded bg-surface-page border border-hairline text-ink-primary font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Form */}
            <div className="p-6 rounded-2xl bg-surface-raised border border-hairline">
              <h2 className="text-lg font-serif font-semibold text-ink-primary mb-4">
                2. Guest Information & Date
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
                        <span>✓</span> Pool Day Pass Reserved!
                      </div>
                      <p className="mt-1">{bookingResult.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="font-mono bg-emerald-100/60 px-2.5 py-1 rounded text-emerald-700 font-bold">
                          Voucher Ref: {bookingResult.reference}
                        </span>
                        {bookingResult.whatsappUrl && (
                          <a
                            href={bookingResult.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim font-bold px-3 py-1.5 rounded transition-colors"
                          >
                            Open in WhatsApp →
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
                    <label className="block font-semibold text-ink-secondary mb-1">Pass Date *</label>
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
                    <label className="block font-semibold text-ink-secondary mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. David Mukasa"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink-secondary mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="david@example.com"
                      className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">
                    Special Requests (Sun lounger set, towels, poolside dining)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Let us know if you need specific cabana arrangements..."
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-bronze-deep hover:brightness-110 text-ink-inverse font-bold text-xs uppercase tracking-wider py-3 rounded transition-all shadow disabled:opacity-50"
                >
                  {submitting ? 'Confirming Pass...' : `Confirm Pool Pass ($${total} USD)`}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Price Summary & Facility Information */}
          <div className="space-y-6">
            <div className="bg-surface-raised rounded-2xl border border-brand-antique/40 p-6 shadow-xl space-y-4">
              <span className="text-xs text-brand-bronze-ink uppercase tracking-wider font-semibold block">
                Booking Summary
              </span>

              <div className="border-t border-hairline pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-ink-secondary">
                  <span>Selected Date</span>
                  <span className="font-semibold text-ink-primary">{date}</span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>Package</span>
                  <span className="font-semibold text-ink-primary">{summaryText}</span>
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
                  <span>Total Amount</span>
                  <span>${total} USD</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/256200555000?text=Hello%20Speke%20Apartments%20Wampewo,%20I%20would%20like%20to%20reserve%20a%20Heated%20Swimming%20Pool%20Day%20Pass%20for%20${date}.%20Guests:%20${adults}%20Adults,%20${children}%20Children.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim font-bold text-xs uppercase tracking-wider py-2.5 rounded text-center block transition-all shadow"
                >
                  💬 Quick Book via WhatsApp
                </a>
              </div>
            </div>

            {/* Inclusions Card */}
            <div className="bg-surface-raised rounded-2xl border border-hairline p-6 shadow-xl text-xs space-y-3">
              <h3 className="text-sm font-semibold text-ink-primary">Pool Pass Inclusions</h3>
              <ul className="space-y-2 text-ink-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Heated outdoor swimming pool
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Complimentary clean towel service
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Poolside loungers and umbrellas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Lifeguard on duty & secure lockers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> In-pool food & drink service from La Cabana
                </li>
              </ul>
              <div className="pt-2 border-t border-hairline text-[11px] text-ink-muted">
                Opening Hours: Daily from 06:00 to 20:00.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
