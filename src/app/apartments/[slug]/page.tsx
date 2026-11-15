import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ROOM_TYPES, type RoomType } from '@/lib/rooms';
import BookingPriceCalculator from '@/components/BookingPriceCalculator';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ApartmentPage({ params }: Props) {
  const { slug } = await params;
  const room = ROOM_TYPES.find((r: RoomType) => r.slug === slug);

  if (!room) {
    notFound();
  }

  const nightlyRate =
    room.fromPriceMinor >= 100_000
      ? Math.round(room.fromPriceMinor / 1000)
      : Math.round(room.fromPriceMinor / 100);
  const rackRate =
    room.rackPriceMinor >= 100_000
      ? Math.round(room.rackPriceMinor / 1000)
      : Math.round(room.rackPriceMinor / 100);
  const discountPercent = Math.round(((rackRate - nightlyRate) / rackRate) * 100);

  // Map image slugs to public media URLs
  const galleryImages: string[] = room.images.map((img: string) => `/media/${img}.jpg`);

  return (
    <div className="min-h-screen bg-surface-page text-ink-primary">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-surface-page/95 backdrop-blur-md border-b border-brand-antique/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-ink-secondary hover:text-brand-bronze-ink text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>←</span> Back to All Apartments
          </Link>
          <div className="text-right">
            <span className="text-[11px] text-ink-muted block">Speke Apartments Wampewo</span>
            <span className="text-xs font-serif text-brand-bronze-ink font-semibold">Kololo, Kampala</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-hairline">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-antique/15 border border-brand-antique/30 text-brand-bronze-ink text-xs font-semibold tracking-wider uppercase mb-3">
              ★ {room.bedrooms} Bedroom Suite • Sleeps up to {room.maxOccupancy} Guests
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink-primary tracking-tight">
              {room.name}
            </h1>
            <p className="mt-2 text-ink-muted text-sm max-w-2xl">{room.shortDescription}</p>
          </div>

          <div className="bg-surface-raised p-5 rounded-xl border border-hairline flex items-center gap-6">
            <div>
              <span className="text-xs text-ink-muted block">Direct Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-brand-bronze-ink">
                  ${nightlyRate}
                </span>
                <span className="text-xs text-ink-muted">/ night</span>
              </div>
              {discountPercent > 0 && (
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Save {discountPercent}% vs Standard Rack (${rackRate})
                </div>
              )}
            </div>
            <a
              href="#book-apartment"
              className="bg-brand-bronze-deep text-ink-inverse font-bold text-xs uppercase tracking-wider px-5 py-3 rounded shadow hover:brightness-110 transition-all"
            >
              Reserve
            </a>
          </div>
        </div>

        {/* Gallery Grid */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative h-80 sm:h-[480px] rounded-2xl overflow-hidden border border-hairline">
            <Image
              src={room.heroImage}
              alt={room.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute top-4 left-4 bg-surface-page/80 backdrop-blur-md px-3 py-1 rounded text-xs text-brand-bronze-ink border border-brand-antique/30">
              Featured Suite
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {galleryImages.slice(1, 3).map((img: string, idx: number) => (
              <div
                key={idx}
                className="relative h-36 sm:h-[232px] rounded-xl overflow-hidden border border-hairline"
              >
                <Image
                  src={img}
                  alt={`${room.name} interior ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Details & Direct Booking Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Description, Specs, Inclusions */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-serif font-bold text-ink-primary mb-4">
                Apartment Overview
              </h2>
              <p className="text-ink-secondary text-sm leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </section>

            {/* In-apartment features */}
            <section className="p-6 rounded-2xl bg-surface-raised border border-hairline">
              <h3 className="text-lg font-serif font-semibold text-ink-primary mb-4">
                Amenities & Appliances
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-ink-secondary">
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Fully Equipped Kitchen
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Dishwasher & Oven
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Microwave & Fridge
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> High-Speed WiFi
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Satellite TV
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Air Conditioning
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Private Balcony
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> Daily Housekeeping
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-bronze-ink">✓</span> 100% Power Backup
                </div>
              </div>
            </section>

            {/* Policies */}
            <section className="border-t border-hairline pt-8 text-xs text-ink-muted space-y-2">
              <h4 className="text-sm font-semibold text-ink-primary">Residence Policies & Inclusions</h4>
              <p>• Check-in time from 14:00 | Check-out by 11:00 (Africa/Kampala)</p>
              <p>• Rates are quoted in USD and include 18% Value Added Tax (VAT).</p>
              <p>• Complimentary access to Heated Pool, Gym Club, and Turkish Hammam.</p>
            </section>
          </div>

          {/* Right Column: Reactive Direct Booking & WhatsApp Quotation */}
          <div id="book-apartment" className="lg:col-span-1">
            <BookingPriceCalculator
              roomName={room.name}
              roomSlug={room.slug}
              nightlyRate={nightlyRate}
              rackRate={rackRate}
              bedrooms={room.bedrooms}
              maxOccupancy={room.maxOccupancy}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
