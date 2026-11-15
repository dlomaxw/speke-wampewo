import Image from 'next/image';
import Link from 'next/link';
import HomeBookingSearchBar from '@/components/HomeBookingSearchBar';
import { buildBookingUrl } from '@/lib/swiftbook';
import { ROOM_TYPES } from '@/lib/rooms';
import CardSlider from '@/components/CardSlider';
import { SLIDER_CARD } from '@/lib/slider';
import OffersShowcase from '@/components/OffersShowcase';

export default function HomePage() {
  // Rates come from ROOM_TYPES so the home page, the search bar and the
  // apartment pages can never drift apart. Edit prices there, not here.
  const apartments = [
    {
      name: 'One Bedroom Deluxe Apartment',
      slug: 'one-bedroom-deluxe-apartment',
      bedrooms: 1,
      capacity: '2 Guests',
      image: '/media/one-bedroom-deluxe-apartment.jpg',
      description:
        'Self-catering luxury with a flat-screen TV, satellite channels, and a fully equipped kitchen featuring dishwasher, oven, and microwave.',
      features: ['King/Double Bed', 'Fully Fitted Kitchen', 'Living Area', 'High-speed WiFi'],
    },
    {
      name: 'One Bedroom Superior Apartment',
      slug: 'one-bedroom-superior-apartment',
      bedrooms: 1,
      capacity: '2 Guests',
      image: '/media/one-bedroom-superior-apartment.jpg',
      description:
        'Spacious superior apartment offering expanded living space, premium furniture, modern kitchen appliances, and private balcony.',
      features: ['Expanded Living Room', 'Balcony with City View', 'Dishwasher & Oven', 'AC & Satellite TV'],
    },
    {
      name: 'Two Bedroom Deluxe Apartment',
      slug: 'two-bedroom-deluxe-apartment',
      bedrooms: 2,
      capacity: '4 Guests',
      image: '/media/two-bedroom-deluxe-apartment.jpg',
      description:
        'Perfect for families and executive groups. Features dual en-suite bedrooms, open-plan dining and lounge, and complete chef kitchen.',
      features: ['2 En-Suite Bedrooms', 'Separate Dining Hall', 'Spacious Balcony', 'Laundry & Dishwasher'],
    },
    {
      name: 'Two Bedroom Superior Apartment',
      slug: 'two-bedroom-superior-apartment',
      bedrooms: 2,
      capacity: '4 Guests',
      image: '/media/two-bedroom-superior-apartment.jpg',
      description:
        'Elevated luxury with panoramic Kampala views, premium interior styling, expansive lounge, and high-spec amenities.',
      features: ['Panoramic City Views', 'Luxury Lounge Area', 'Full Chef Kitchen', '24/7 Room Service'],
    },
    {
      name: 'Three Bedroom Apartment',
      slug: 'three-bedroom-apartment',
      bedrooms: 3,
      capacity: '6 Guests',
      image: '/media/three-bedroom-apartment.jpg',
      description:
        'Splendour at its finest. A self-catering three bedroom apartment with a fully equipped kitchen, generous living area and a balcony with a view.',
      features: ['3 Bedrooms', 'Full Kitchen', 'Generous Living Area', 'Balcony with a View'],
    },
    {
      name: 'Three Bedroom Villa',
      slug: 'three-bedroom-villa',
      bedrooms: 3,
      capacity: '6 Guests',
      image: '/media/three-bedroom-villa.jpg',
      description:
        'A self-contained villa with three bedroom suites, each with a king-size double bed, plus its own living and dining space.',
      features: ['3 En-Suite Bedrooms', 'King-Size Double Beds', 'Private Living & Dining', 'Self-Contained'],
    },
    {
      name: 'Three Bedroom Penthouse',
      slug: 'penthouse-apartment',
      bedrooms: 3,
      capacity: '6 Guests',
      image: '/media/penthouse-apartment.jpg',
      description:
        'The pinnacle of Kololo residential luxury. Sprawling penthouse suite with private sun terrace, three master suites, and bespoke hosting space.',
      features: ['Private Sun Terrace', '3 Master Suites', 'Private Lift Access', 'Dedicated Concierge'],
    },
  ].map((apt) => {
    const room = ROOM_TYPES.find((r) => r.slug === apt.slug);
    return {
      ...apt,
      price: room ? room.fromPriceMinor / 100 : null,
      // Only a genuine reduction is shown struck through.
      originalPrice:
        room && room.rackPriceMinor > room.fromPriceMinor
          ? room.rackPriceMinor / 100
          : null,
    };
  });

  const facilities = [
    {
      title: 'Heated Swimming Pool',
      subtitle: 'All-Weather Luxury',
      image: '/media/facility-swimming-pool.jpg',
      desc: 'Year-round heated outdoor pool surrounded by sun loungers and cabana service.',
      href: '/facilities/pool',
      priceBadge: 'Day Pass from $10',
      actionText: 'Book Pool Pass',
    },
    {
      title: 'Calabash Spa & Salon',
      subtitle: 'Wellness & Hammam',
      image: '/media/facility-spa.jpg',
      desc: 'Full-service spa treatments, relaxation therapies, hair salon, and authentic Turkish hammam.',
      href: '/facilities/spa',
      priceBadge: 'Treatments from $30',
      actionText: 'Book Appointment',
    },
    {
      title: 'Health Club & Gym',
      subtitle: 'State-of-the-Art Fitness',
      image: '/media/facility-gym-club.jpg',
      desc: 'Top-tier cardio equipment, free weights, personal training, and dedicated fitness studios.',
      href: '/facilities/gym',
      priceBadge: 'Day Pass from $15',
      actionText: 'Book Gym Pass',
    },
    {
      title: 'La Cabana Restaurant',
      subtitle: 'Fine Dining & In-Room Service',
      image: '/media/dining-01.jpg',
      desc: 'Exquisite multi-cuisine dining, signature steaks, cocktails, and seamless apartment room service.',
      href: '/facilities/dining',
      priceBadge: 'Table Reservations',
      actionText: 'Reserve Table',
    },
  ];

  const amenities = [
    { name: '24/7 Security & CCTV', desc: 'Secure gated perimeter with round-the-clock patrol' },
    { name: 'High-Speed Wi-Fi', desc: 'Dedicated high-bandwidth fibre in every apartment' },
    { name: 'Fully Equipped Kitchen', desc: 'Oven, dishwasher, fridge, microwave & cookware' },
    { name: '100% Power Backup', desc: 'Automatic generator coverage for uninterrupted comfort' },
    { name: 'Private Balconies', desc: 'Scenic perspectives overlooking Kampala and Kololo' },
    { name: 'Ample Secure Parking', desc: 'Basement and surface parking for residents and guests' },
    { name: 'Daily Housekeeping', desc: 'Impeccable hotel-standard linen and cleaning care' },
    { name: 'Concierge & Transport', desc: 'Airport transfers and executive chauffeur assistance' },
  ];

  return (
    <div className="min-h-screen bg-surface-page text-ink-primary flex flex-col font-sans">
      {/* Top Banner / Announcement */}
      <div className="bg-surface-raised border-b border-brand-antique/20 text-xs px-4 py-2 flex flex-wrap justify-between items-center text-ink-secondary">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-brand-bronze-ink">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Plot 19–21 Wampewo Avenue, Kololo, Kampala, Uganda
          </span>
          <span className="hidden md:inline text-ink-muted">|</span>
          <span className="hidden md:inline">Part of the Speke Group of Hotels</span>
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <a
            href="tel:+256200555000"
            className="hover:text-brand-bronze-ink transition-colors flex items-center gap-1"
          >
            <span>📞</span> +256 200 555 000
          </a>
          <a
            href="https://wa.me/256200555000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            <span>💬</span> WhatsApp Desk
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 bg-surface-page/95 backdrop-blur-md border-b border-brand-antique/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-brand-antique/40 shadow-inner">
              <Image
                src="/media/speke-apartments-wampewo-logo-square.jpg"
                alt="Speke Apartments Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="block text-lg font-serif font-bold tracking-wider text-brand-bronze-ink uppercase">
                Speke Apartments
              </span>
              <span className="block text-[11px] tracking-[0.25em] text-ink-muted uppercase -mt-0.5">
                Wampewo • Kololo
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-secondary font-medium">
            <a href="#apartments" className="hover:text-brand-bronze-ink transition-colors">
              Apartments
            </a>
            <a href="#facilities" className="hover:text-brand-bronze-ink transition-colors">
              Facilities
            </a>
            <a href="#offers" className="hover:text-brand-bronze-ink transition-colors">
              Offers & Specials
            </a>
            <a href="#amenities" className="hover:text-brand-bronze-ink transition-colors">
              Amenities
            </a>
            <a href="#location" className="hover:text-brand-bronze-ink transition-colors">
              Location
            </a>
            <Link href="/contact" className="hover:text-brand-bronze-ink transition-colors">
              Contact & Inquiries
            </Link>
            {/* The staff portal lives at /admin and is not advertised to
                guests. Staff reach it by the link they are given. */}
          </nav>

          <div className="flex items-center gap-3">
            {/* Straight into SwiftBook with no room filter, so the guest
                sees every available type with its live rate. */}
            <a
              href={buildBookingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-bronze-deep text-ink-inverse font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded shadow-lg hover:brightness-110 transition-all"
            >
              Book Direct
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Visual Backdrop */}
      <section className="relative min-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/media/wampewo-hero-exterior.png"
            alt="Speke Apartments Wampewo Exterior at Dusk"
            fill
            priority
            className="object-cover brightness-40"
          />
          {/* The photo stays dark in both themes, so it carries its own
              scrim and the copy over it uses ink-on-scrim, which does not
              flip. The bottom fade blends the section into the page. */}
          <div className="absolute inset-0 bg-scrim" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-page via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-16 pb-28">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-espresso/60 border border-brand-gold/40 text-brand-gold text-xs font-semibold tracking-wider uppercase mb-6">
            ★ Exclusive Serviced Living in Kololo, Kampala
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-ink-on-scrim tracking-tight leading-tight">
            The Art of Refined <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-gold to-brand-bronze">
              Kampala Living
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-ink-on-scrim/90 max-w-3xl mx-auto leading-relaxed">
            Spacious, fully serviced luxury apartments tailored for business travelers, diplomatic
            missions, and extended city stays with panoramic views, heated pool, gym, and authentic
            Turkish hammam.
          </p>

          {/* Quick Availability & Dynamic Pricing Bar */}
          <div id="book-now">
            <HomeBookingSearchBar />
          </div>
        </div>
      </section>

      {/* Apartment Collection Showcase */}
      <section id="apartments" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.2em] font-semibold">
            Residential Suites
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-ink-primary">
            Designed for Elevated Living
          </h2>
          <p className="mt-3 text-ink-muted text-sm">
            All apartments include private kitchenettes, contemporary lounge furnishings, high-speed
            broadband, and balcony vistas across Kampala.
          </p>
        </div>

        <CardSlider count={apartments.length} hint="Swipe for more apartments">
          {apartments.map((apt) => (
            <div
              key={apt.slug}
              className={`${SLIDER_CARD} bg-surface-raised rounded-xl border border-hairline overflow-hidden hover:border-brand-antique/50 transition-all group flex flex-col shadow-lg`}
            >
              <Link href={`/apartments/${apt.slug}`} className="relative h-60 w-full overflow-hidden block">
                <Image
                  src={apt.image}
                  alt={apt.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-surface-page/80 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-brand-bronze-ink border border-brand-antique/30">
                  From ${apt.price} <span className="text-ink-muted font-normal">/ night</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-surface-page/80 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] text-ink-secondary">
                  {apt.capacity} • {apt.bedrooms} Bed
                </div>
              </Link>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/apartments/${apt.slug}`}>
                    <h3 className="text-xl font-serif font-semibold text-ink-primary group-hover:text-brand-bronze-ink transition-colors">
                      {apt.name}
                    </h3>
                  </Link>
                  <p className="mt-2 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {apt.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {apt.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-surface-page border border-hairline px-2 py-0.5 rounded text-ink-secondary"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
                  <div>
                    {apt.originalPrice !== null && (
                      <span className="text-xs text-ink-muted line-through mr-1.5">
                        ${apt.originalPrice}
                      </span>
                    )}
                    <span className="text-base font-bold text-brand-bronze-ink">${apt.price}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/apartments/${apt.slug}`}
                      className="text-xs font-semibold uppercase tracking-wider text-ink-secondary hover:text-brand-bronze-ink transition-colors"
                    >
                      Details
                    </Link>
                    <a
                      href={`https://wa.me/256200555000?text=Hello%20Speke%20Apartments%20Wampewo,%20I%20would%20like%20to%20enquire%20about%20the%20${encodeURIComponent(apt.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold uppercase tracking-wider text-brand-bronze-ink hover:text-ink-primary transition-colors flex items-center gap-1"
                    >
                      Enquire →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardSlider>
      </section>

      {/* Signature Amenities & Facilities */}
      <section id="facilities" className="py-20 bg-surface-raised border-y border-hairline/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.2em] font-semibold">
              Lifestyle & Wellness
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-ink-primary">
              Signature On-Site Amenities
            </h2>
            <p className="mt-3 text-ink-muted text-sm">
              Beyond comfortable suites, indulge in world-class wellness, dining, and fitness
              facilities without leaving the property.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac, i) => (
              <div
                key={i}
                className="bg-surface-raised rounded-xl overflow-hidden border border-hairline shadow hover:border-brand-antique/60 hover:shadow-xl hover:shadow-brand-antique/5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <Link href={fac.href} className="relative block h-48 w-full overflow-hidden">
                    <Image
                      src={fac.image}
                      alt={fac.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-surface-page/85 backdrop-blur-md border border-brand-antique/40 px-2.5 py-1 rounded-full text-[10px] font-semibold text-brand-bronze-ink shadow">
                      {fac.priceBadge}
                    </div>
                  </Link>
                  <div className="p-5 pb-2">
                    <span className="text-[10px] text-brand-bronze-ink uppercase tracking-wider font-semibold">
                      {fac.subtitle}
                    </span>
                    <h3 className="text-lg font-serif font-semibold text-ink-primary mt-1">
                      <Link href={fac.href} className="hover:text-brand-bronze-ink transition-colors">
                        {fac.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs text-ink-muted leading-relaxed">{fac.desc}</p>
                  </div>
                </div>
                <div className="p-5 pt-3">
                  <Link
                    href={fac.href}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-brand-bronze to-brand-antique hover:bg-brand-bronze-ink text-ink-inverse font-semibold text-xs transition-all shadow hover:shadow-md"
                  >
                    <span>{fac.actionText}</span>
                    <span className="text-sm">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Full Property Amenities Grid */}
          <div id="amenities" className="mt-16 pt-12 border-t border-hairline/80">
            <h3 className="text-xl font-serif font-semibold text-center text-ink-primary mb-8">
              Standard Guest Inclusions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-surface-page/60 border border-hairline/80"
                >
                  <div className="text-sm font-semibold text-ink-primary">{item.name}</div>
                  <div className="text-xs text-ink-muted mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Official Offers & Event Flyers Showcase */}
      <OffersShowcase />

      {/* Location & Neighborhood Section */}
      <section id="location" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.2em] font-semibold">
              The Neighborhood
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-ink-primary">
              Prime Kololo Location
            </h2>
            <p className="mt-4 text-ink-secondary text-sm leading-relaxed">
              Situated on Plot 19–21 Wampewo Avenue, Speke Apartments puts you in the prestigious
              heart of Kololo — minutes from diplomatic embassies, corporate headquarters, golf
              courses, and high-end dining.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs text-ink-secondary">
                <span className="w-6 h-6 rounded-full bg-brand-antique/20 text-brand-bronze-ink flex items-center justify-center font-bold">
                  ✓
                </span>
                <span>5 minutes from Acacia Mall, restaurants, and health centres</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-secondary">
                <span className="w-6 h-6 rounded-full bg-brand-antique/20 text-brand-bronze-ink flex items-center justify-center font-bold">
                  ✓
                </span>
                <span>Immediate access to Kampala Central Business District and Lugogo Bypass</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-secondary">
                <span className="w-6 h-6 rounded-full bg-brand-antique/20 text-brand-bronze-ink flex items-center justify-center font-bold">
                  ✓
                </span>
                <span>Serene hillside residential ambiance with city skyline panoramas</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://maps.google.com/?q=Speke+Apartments+Wampewo+Kampala"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-raised border border-brand-antique/40 text-ink-primary hover:text-ink-primary px-5 py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-hairline shadow-2xl">
            <Image
              src="/media/wampewo-hero-living.png"
              alt="Speke Apartments Balcony View"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-page via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-surface-page/80 backdrop-blur-md border border-hairline/60">
              <div className="text-sm font-semibold text-ink-primary">Speke Apartments Wampewo</div>
              <div className="text-xs text-brand-bronze-ink">Plot 19–21 Wampewo Avenue, Kololo, Kampala</div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact & Enquiry Section */}
      <section id="contact" className="py-20 bg-surface-raised border-t border-hairline">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.2em] font-semibold">
            Direct Concierge Desk
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-ink-primary">
            Plan Your Stay With Us
          </h2>
          <p className="mt-3 text-ink-muted text-sm max-w-xl mx-auto">
            Speak directly with our reservations team for personalized quotes, corporate long-stay
            tariffs, and site inspection arrangements.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-xl bg-surface-raised border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">📞</div>
                <h4 className="font-semibold text-ink-primary text-sm">Reservations Desk</h4>
                <p className="text-xs text-ink-muted mt-1">Available 24/7 for booking inquiries</p>
              </div>
              <a
                href="tel:+256200555000"
                className="mt-4 text-xs font-bold text-brand-bronze-ink hover:underline"
              >
                +256 200 555 000
              </a>
            </div>

            <div className="p-6 rounded-xl bg-surface-raised border border-brand-antique/30 flex flex-col justify-between shadow-lg">
              <div>
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-semibold text-ink-primary text-sm">Instant WhatsApp</h4>
                <p className="text-xs text-ink-muted mt-1">Direct chat with our front desk team</p>
              </div>
              <a
                href="https://wa.me/256200555000?text=Hello,%20I%20am%20interested%20in%20staying%20at%20Speke%20Apartments%20Wampewo"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-center py-2 px-3 rounded bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim text-xs font-bold transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="p-6 rounded-xl bg-surface-raised border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">✉️</div>
                <h4 className="font-semibold text-ink-primary text-sm">Email Inquiries</h4>
                <p className="text-xs text-ink-muted mt-1">Written proposals & corporate contracts</p>
              </div>
              <a
                href="mailto:reservations@spekeapartments.com"
                className="mt-4 text-xs font-bold text-brand-bronze-ink hover:underline break-all"
              >
                reservations@spekeapartments.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-surface-sunken border-t border-hairline/80 text-ink-muted text-xs py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="font-serif font-bold text-brand-bronze-ink text-sm uppercase tracking-wider block mb-2">
              Speke Apartments Wampewo
            </span>
            <p className="text-ink-muted text-[11px] leading-relaxed">
              Plot 19–21 Wampewo Avenue, Kololo, Kampala, Uganda. High-spec luxury serviced
              apartments and suites.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-ink-secondary text-xs uppercase tracking-wider mb-3">
              Accommodation
            </h5>
            <ul className="space-y-1.5 text-ink-muted text-[11px]">
              <li>One Bedroom Deluxe ($180)</li>
              <li>One Bedroom Superior ($236)</li>
              <li>Two Bedroom Deluxe ($290)</li>
              <li>Two Bedroom Superior ($340)</li>
              <li>Three Bedroom Penthouse ($480)</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-ink-secondary text-xs uppercase tracking-wider mb-3">
              Facilities & Dining
            </h5>
            <ul className="space-y-1.5 text-ink-muted text-[11px]">
              <li>La Cabana Restaurant</li>
              <li>Calabash Spa & Turkish Hammam</li>
              <li>Health Club & Fitness Centre</li>
              <li>Heated Swimming Pool</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-ink-secondary text-xs uppercase tracking-wider mb-3">
              Hospitality Group
            </h5>
            <p className="text-ink-muted text-[11px] leading-relaxed">
              Speke Apartments is a member of the Speke Group of Hotels in Uganda.
            </p>
            <div className="mt-3 text-[10px] text-ink-muted">
              Verified Property Data • All Rights Reserved © 2026
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-hairline flex flex-wrap justify-between items-center text-[11px] text-ink-muted">
          <div>© {new Date().getFullYear()} Speke Apartments Wampewo. All rights reserved.</div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Powered by Speke Group Hospitality Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
