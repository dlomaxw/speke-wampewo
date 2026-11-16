import Image from 'next/image';
import Link from 'next/link';
import HomeBookingSearchBar from '@/components/HomeBookingSearchBar';
import { buildBookingUrl } from '@/lib/swiftbook';
import { ROOM_TYPES } from '@/lib/rooms';
import CardSlider from '@/components/CardSlider';
import SiteHeader from '@/components/SiteHeader';
import SectionHeading from '@/components/SectionHeading';
import HeroCarousel from '@/components/HeroCarousel';
import { SLIDER_CARD, SLIDER_CARD_2, SLIDER_CARD_4 } from '@/lib/slider';
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
            className="text-brand-bronze-ink hover:text-brand-bronze-deep font-medium flex items-center gap-1"
          >
            <span>💬</span> WhatsApp Desk
          </a>
        </div>
      </div>

      <SiteHeader bookingUrl={buildBookingUrl()} />

      {/* Hero: the photographs carry it, with no copy over them. Its height is
          set here because there is no longer any content to size it. */}
      <section className="relative h-[62vh] min-h-[460px] max-h-[760px] overflow-hidden">
        {/* The visible headline is gone, but the page still needs one h1 for
            search engines and screen readers. */}
        <h1 className="sr-only">
          Speke Apartments Wampewo — luxury serviced apartments in Kololo, Kampala
        </h1>
        <HeroCarousel />
      </section>

      {/* Reserve card. Sits below the hero, then sticks beneath the condensed
          header as you scroll, the way Serena parks its booking bar. z-40
          keeps it under the header's z-50 rather than over it. */}
      {/* The Speke group pattern, used exactly as supplied: its own colours,
          its own 25px height, tiled across rather than stretched. */}
      <div
        aria-hidden="true"
        className="w-full h-[25px] bg-repeat-x"
        style={{
          backgroundImage: "url('/media/Speke-group-patterns1.png')",
          backgroundSize: 'auto 25px',
        }}
      />

      <section id="book-now" className="lg:sticky lg:top-16 z-40 bg-surface-page">
        <div className="w-full">
          <HomeBookingSearchBar />
        </div>
      </section>

      {/* Apartment Collection Showcase */}
      <section id="apartments" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <SectionHeading title="Residential Suites" subtitle="Designed for elevated living">
          All apartments include private kitchenettes, contemporary lounge furnishings, high-speed
          broadband, and balcony vistas across Kampala.
        </SectionHeading>

        <CardSlider count={apartments.length} hint="Swipe for more apartments">
          {apartments.map((apt) => (
            <div
              key={apt.slug}
              className={`${SLIDER_CARD} bg-surface-raised rounded-md border border-hairline overflow-hidden hover:border-brand-antique/50 transition-all group flex flex-col shadow-lg`}
            >
              <Link href={`/apartments/${apt.slug}`} className="relative h-64 w-full overflow-hidden block">
                <Image
                  src={apt.image}
                  alt={apt.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-surface-page/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-brand-bronze-ink border border-brand-antique/30">
                  From ${apt.price} <span className="text-ink-muted font-normal">/ night</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-surface-page/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] text-ink-secondary">
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
                        className="text-[10px] bg-surface-page border border-hairline px-2 py-0.5 rounded-md text-ink-secondary"
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
      <section id="facilities" className="py-20 bg-surface-page border-y border-hairline/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Signature On-Site Amenities" subtitle="Lifestyle &amp; wellness">
            Beyond comfortable suites, indulge in world-class wellness, dining, and fitness
            facilities without leaving the property.
          </SectionHeading>

          <CardSlider count={facilities.length} perView={2} hint="Swipe for more facilities">
            {facilities.map((fac, i) => (
              <div
                key={i}
                className={`${SLIDER_CARD_2} bg-surface-raised rounded-md overflow-hidden border border-hairline shadow hover:border-brand-antique/60 hover:shadow-xl hover:shadow-brand-antique/5 transition-all group flex flex-col justify-between`}
              >
                <div>
                  <Link href={fac.href} className="relative block h-64 w-full overflow-hidden">
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
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-gradient-to-r from-brand-bronze to-brand-antique hover:bg-brand-bronze-ink text-ink-inverse font-semibold text-xs transition-all shadow hover:shadow-md"
                  >
                    <span>{fac.actionText}</span>
                    <span className="text-sm">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </CardSlider>

          {/* Full Property Amenities Grid */}
          <div id="amenities" className="mt-16 pt-12 border-t border-hairline/80">
            <SectionHeading as="h3" title="Standard Guest Inclusions" subtitle="Included with every stay" />
            <CardSlider count={amenities.length} perView={4} hint="Swipe for more inclusions">
              {amenities.map((item, idx) => (
                <div
                  key={idx}
                  className={`${SLIDER_CARD_4} p-4 rounded-md bg-surface-page/60 border border-hairline/80`}
                >
                  <div className="text-sm font-semibold text-ink-primary">{item.name}</div>
                  <div className="text-xs text-ink-muted mt-1">{item.desc}</div>
                </div>
              ))}
            </CardSlider>
          </div>
        </div>
      </section>

      {/* Official Offers & Event Flyers Showcase */}
      <OffersShowcase />

      {/* Location & Neighborhood Section */}
      <section id="location" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading title="Prime Kololo Location" subtitle="The neighbourhood" />
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
                className="bg-surface-raised border border-brand-antique/40 text-ink-primary hover:text-ink-primary px-5 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          <div className="relative h-80 sm:h-96 rounded-md overflow-hidden border border-hairline shadow-2xl">
            <Image
              src="/media/wampewo-hero-living.png"
              alt="Speke Apartments Balcony View"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-page via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-md bg-surface-page/80 backdrop-blur-md border border-hairline/60">
              <div className="text-sm font-semibold text-ink-primary">Speke Apartments Wampewo</div>
              <div className="text-xs text-brand-bronze-ink">Plot 19–21 Wampewo Avenue, Kololo, Kampala</div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact & Enquiry Section */}
      <section id="contact" className="py-20 bg-surface-page border-t border-hairline">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeading title="Plan Your Stay With Us" subtitle="Direct concierge desk">
            Speak directly with our reservations team for personalized quotes, corporate long-stay
            tariffs, and site inspection arrangements.
          </SectionHeading>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-md bg-surface-raised border border-hairline flex flex-col justify-between">
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

            <div className="p-6 rounded-md bg-surface-raised border border-brand-antique/30 flex flex-col justify-between shadow-lg">
              <div>
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-semibold text-ink-primary text-sm">Instant WhatsApp</h4>
                <p className="text-xs text-ink-muted mt-1">Direct chat with our front desk team</p>
              </div>
              <a
                href="https://wa.me/256200555000?text=Hello,%20I%20am%20interested%20in%20staying%20at%20Speke%20Apartments%20Wampewo"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-center py-2 px-3 rounded-md bg-brand-bronze-deep hover:bg-brand-bronze-ink text-ink-on-scrim text-xs font-bold transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="p-6 rounded-md bg-surface-raised border border-hairline flex flex-col justify-between">
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
      <footer className="mt-auto bg-surface-page border-t border-hairline/80 text-ink-muted text-xs py-12 px-4 sm:px-6 lg:px-8">
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
