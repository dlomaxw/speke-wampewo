'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    enquiryType: 'accommodation',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Uganda',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    reference?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({
          ok: true,
          reference: data.reference,
          message: data.message,
        });
        setFormData({
          enquiryType: 'accommodation',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          country: 'Uganda',
          checkIn: '',
          checkOut: '',
          adults: 1,
          children: 0,
          message: '',
        });
      } else {
        setResult({
          ok: false,
          error: data.error || 'Failed to submit inquiry. Please check the fields and try again.',
        });
      }
    } catch (err: any) {
      setResult({
        ok: false,
        error: err.message || 'Network error occurred. Please try again.',
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
            <span>←</span> Return to Homepage
          </Link>
          <div className="text-right">
            <span className="text-[11px] text-ink-muted block">Direct Inquiries Desk</span>
            <span className="text-xs font-serif text-brand-bronze-ink font-semibold">
              Speke Apartments Wampewo
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.2em] font-semibold">
            Get in Touch
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-serif font-bold text-ink-primary">
            Reservations & Inquiries
          </h1>
          <p className="mt-3 text-ink-muted text-sm">
            Whether booking an extended corporate stay, weekend getaway, or requesting private event
            quotations, our dedicated hospitality team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 bg-surface-raised rounded-2xl border border-hairline p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-serif font-semibold text-ink-primary mb-6">
              Submit Direct Inquiry
            </h2>

            {result && (
              <div
                className={`mb-6 p-4 rounded-xl border text-sm ${
                  result.ok
                    ? 'bg-emerald-50/60 border-emerald-500/50 text-emerald-700'
                    : 'bg-red-50/60 border-red-500/50 text-red-700'
                }`}
              >
                {result.ok ? (
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span>✓</span> Inquiry Received Successfully!
                    </div>
                    <p className="mt-1 text-xs">{result.message}</p>
                    <div className="mt-2 text-xs font-mono bg-emerald-100/50 px-2.5 py-1 rounded inline-block text-emerald-700">
                      Reference: {result.reference}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold">Error submitting form</div>
                    <p className="mt-1 text-xs">{result.error}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">Inquiry Type</label>
                  <select
                    value={formData.enquiryType}
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  >
                    <option value="accommodation">Accommodation (Short Stay)</option>
                    <option value="long_stay">Long Stay (Monthly Serviced)</option>
                    <option value="corporate">Corporate Account / Group</option>
                    <option value="dining">La Cabana Restaurant</option>
                    <option value="spa">Calabash Spa & Hammam</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    placeholder="e.g. John"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                    placeholder="+256 700 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">
                    Check-in Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-secondary mb-1">
                    Check-out Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-secondary mb-1">
                  Message / Special Requests
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-surface-page border border-hairline rounded px-3 py-2 text-ink-primary focus:outline-none focus:border-brand-antique"
                  placeholder="Tell us about your requirements, preferred apartment type, or questions..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-bronze-deep hover:brightness-110 text-ink-inverse font-bold text-xs uppercase tracking-wider py-3 px-6 rounded transition-all shadow disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Send Inquiry →'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Direct Department Directory */}
          <div className="space-y-6">
            <div className="bg-surface-raised rounded-2xl border border-hairline p-6 shadow-xl">
              <h3 className="text-lg font-serif font-semibold text-ink-primary mb-4">
                Department Directory
              </h3>

              <div className="space-y-4 text-xs">
                <div className="border-b border-hairline pb-3">
                  <div className="font-semibold text-ink-primary">Reservations & Bookings</div>
                  <div className="text-ink-muted mt-0.5">Availability, quotes, and check-in</div>
                  <div className="mt-2 space-y-1">
                    <a
                      href="tel:+256200555000"
                      className="text-brand-bronze-ink block hover:underline font-mono"
                    >
                      📞 +256 200 555 000
                    </a>
                    <a
                      href="mailto:reservations@spekeapartments.com"
                      className="text-ink-secondary block hover:underline"
                    >
                      ✉️ reservations@spekeapartments.com
                    </a>
                  </div>
                </div>

                <div className="border-b border-hairline pb-3">
                  <div className="font-semibold text-ink-primary">Front Office & Residents</div>
                  <div className="text-ink-muted mt-0.5">Guest assistance and in-house concierge</div>
                  <div className="mt-2">
                    <a
                      href="tel:+256752711704"
                      className="text-brand-bronze-ink block hover:underline font-mono"
                    >
                      📞 +256 752 711 704
                    </a>
                  </div>
                </div>

                <div className="border-b border-hairline pb-3">
                  <div className="font-semibold text-ink-primary">La Cabana Restaurant</div>
                  <div className="text-ink-muted mt-0.5">Table bookings and apartment room service</div>
                  <div className="mt-2">
                    <a
                      href="tel:+256702711009"
                      className="text-brand-bronze-ink block hover:underline font-mono"
                    >
                      📞 +256 702 711 009
                    </a>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-ink-primary">Calabash Spa & Turkish Hammam</div>
                  <div className="text-ink-muted mt-0.5">Spa therapies and salon appointments</div>
                  <div className="mt-2 space-y-1">
                    <a
                      href="tel:+256702711056"
                      className="text-brand-bronze-ink block hover:underline font-mono"
                    >
                      📞 +256 702 711 056
                    </a>
                    <a
                      href="mailto:calabash@spekeapartments.com"
                      className="text-ink-secondary block hover:underline"
                    >
                      ✉️ calabash@spekeapartments.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Box */}
            <div className="bg-surface-raised rounded-2xl border border-hairline p-6 shadow-xl text-xs">
              <h3 className="text-sm font-semibold text-ink-primary mb-2">Location</h3>
              <p className="text-ink-secondary">
                Plot 19–21 Wampewo Avenue, Kololo, Kampala, Uganda
              </p>
              <a
                href="https://maps.google.com/?q=Speke+Apartments+Wampewo+Kampala"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-brand-bronze-ink hover:underline"
              >
                View on Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
