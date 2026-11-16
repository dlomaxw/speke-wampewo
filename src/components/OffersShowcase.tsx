'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import CardSlider from '@/components/CardSlider';
import SectionHeading from '@/components/SectionHeading';
import { SLIDER_CARD } from '@/lib/slider';

interface OfferFlyer {
  id: string;
  title: string;
  category: 'accommodation' | 'pool' | 'dining' | 'fitness';
  tag: string;
  description: string;
  image: string;
  whatsappMessage: string;
  downloadPdf?: string;
  ctaText?: string;
}

const OFFERS: OfferFlyer[] = [
  {
    id: 'weekend_retreat',
    title: 'Luxury Weekend Retreat',
    category: 'accommodation',
    tag: 'Staycation Offer',
    description:
      'Indulge in a tranquil weekend escape in the heart of Kololo. Includes complimentary heated pool access, high-speed Wi-Fi, and signature hospitality.',
    image: '/media/offers/Luxury-Weekend-Retreat.jpg',
    whatsappMessage:
      'Hello Speke Apartments Wampewo, I would like to enquire and book the Luxury Weekend Retreat special package.',
    ctaText: 'Claim Weekend Offer',
  },
  {
    id: 'dive_into_warmth',
    title: 'Dive Into Warmth — Heated Pool Special',
    category: 'pool',
    tag: 'Year-Round Heated Pool',
    description:
      'Escape the chill with our temperature-controlled outdoor pool. Day passes available for non-residents with poolside towel service and cabana seating.',
    image: '/media/offers/Dive-into-warmth.jpg',
    whatsappMessage:
      'Hello Speke Apartments Wampewo, I would like to claim the Dive Into Warmth heated swimming pool day pass special.',
    ctaText: 'Get Pool Day Pass',
  },
  {
    id: 'kids_swimming',
    title: 'Kids Swimming & Splash Club',
    category: 'pool',
    tag: 'Family Special',
    description:
      'Dedicated shallow swimming pool sessions with safety guards and certified trainers. Perfect for weekend family outings and youth swim lessons.',
    image: '/media/offers/Kids-Swim-Ming_.png',
    whatsappMessage:
      'Hello Speke Apartments Wampewo, I would like to enquire about Kids Swimming and family splash day passes.',
    ctaText: 'Book Kids Swim Pass',
  },
  {
    id: 'la_cabana_dining',
    title: 'Tastefully Devoted To You — La Cabana Dining',
    category: 'dining',
    tag: 'Fine Dining & Rodizio',
    description:
      'Kampala’s favorite Brazilian Churrascaria experience. Endless cuts of premium grilled meats, open salad bar, and authentic Brazilian flavors.',
    image: '/media/Tastefully-Devoted-To-You.jpg',
    whatsappMessage:
      'Hello La Cabana Restaurant, I would like to reserve a table for the Brazilian Rodizio dining experience.',
    downloadPdf: '/media/La-Cabana-Menu.pdf',
    ctaText: 'Reserve Rodizio Table',
  },
  {
    id: 'fitness_monday',
    title: 'Monday Fitness: Step Aerobics & Core',
    category: 'fitness',
    tag: 'Group Class Schedule',
    description:
      'Kickstart your week with energizing cardio and step aerobics instructed by certified trainers at the Health Club studio.',
    image: '/media/offers/Monday-Fitness-classes.jpg',
    whatsappMessage:
      'Hello Speke Apartments Health Club, I would like to book a slot for the Monday Fitness class.',
    ctaText: 'Join Fitness Class',
  },
  {
    id: 'fitness_tuesday',
    title: 'Tuesday Fitness: Zumba & Dance Workout',
    category: 'fitness',
    tag: 'Group Class Schedule',
    description:
      'High-energy Latin dance rhythms combined with cardiovascular exercise to burn calories and tone muscle in a fun group environment.',
    image: '/media/offers/Tuesday-Fitness-Classes.jpg',
    whatsappMessage:
      'Hello Speke Apartments Health Club, I would like to join the Tuesday Zumba class.',
    ctaText: 'Join Zumba Session',
  },
  {
    id: 'fitness_wednesday',
    title: 'Wednesday Fitness: HIIT & Circuit Training',
    category: 'fitness',
    tag: 'Group Class Schedule',
    description:
      'Full body circuit routines targeting endurance, strength, and core stability with modern gym equipment.',
    image: '/media/offers/Wednesday-Fitness-classes.jpg',
    whatsappMessage:
      'Hello Speke Apartments Health Club, I would like to join the Wednesday HIIT class.',
    ctaText: 'Join HIIT Class',
  },
  {
    id: 'fitness_thursday',
    title: 'Thursday Fitness: Spinning & Cardio Blast',
    category: 'fitness',
    tag: 'Group Class Schedule',
    description:
      'High-intensity stationary cycling workout designed to increase stamina, leg strength, and burn maximum calories.',
    image: '/media/offers/Thursday-Fitness-Classes.jpg',
    whatsappMessage:
      'Hello Speke Apartments Health Club, I would like to reserve a spinning bike for Thursday class.',
    ctaText: 'Reserve Spinning Bike',
  },
  {
    id: 'fitness_friday',
    title: 'Friday Fitness: Aerobics & Abs Workout',
    category: 'fitness',
    tag: 'Group Class Schedule',
    description:
      'Weekend warm-up workout targeting abdominal sculpting, flexibility, and dynamic aerobic movements.',
    image: '/media/offers/Friday-Fitness-Classes.jpg',
    whatsappMessage:
      'Hello Speke Apartments Health Club, I would like to join Friday Aerobics class.',
    ctaText: 'Join Aerobics Class',
  },
  {
    id: 'fitness_saturday',
    title: 'Saturday Fitness: Weekend Bootcamp & Yoga',
    category: 'fitness',
    tag: 'Group Class Schedule',
    description:
      'Outdoor and studio morning fitness sessions followed by restorative yoga stretching and sauna/steam relaxation.',
    image: '/media/offers/Saturday-Fitness-Classes.jpg',
    whatsappMessage:
      'Hello Speke Apartments Health Club, I would like to register for Saturday Weekend Bootcamp.',
    ctaText: 'Join Bootcamp',
  },
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'accommodation', label: 'Stays' },
  { id: 'pool', label: 'Pool' },
  { id: 'dining', label: 'Dining' },
  { id: 'fitness', label: 'Fitness' },
] as const;

const DESK = '256200555000';

function waHref(message: string) {
  return `https://wa.me/${DESK}?text=${encodeURIComponent(message)}`;
}

/**
 * Inline icons. This section previously used emoji, which render at a
 * different weight, size and colour on every platform and ignore the palette
 * entirely.
 */
function IconWhatsApp({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
    </svg>
  );
}

function IconExpand({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
    </svg>
  );
}

export default function OffersShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFlyer, setActiveFlyer] = useState<OfferFlyer | null>(null);

  // The control that opened the dialog, so focus returns where it came from.
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const filteredOffers =
    selectedCategory === 'all'
      ? OFFERS
      : OFFERS.filter((o) => o.category === selectedCategory);

  const openFlyer = (offer: OfferFlyer, e: React.MouseEvent) => {
    openerRef.current = e.currentTarget as HTMLElement;
    setActiveFlyer(offer);
  };

  const closeFlyer = () => {
    setActiveFlyer(null);
    openerRef.current?.focus();
  };

  // A dialog that cannot be dismissed from the keyboard, and that lets the
  // page behind it scroll, is a trap on a phone. Both are handled here.
  useEffect(() => {
    if (!activeFlyer) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setActiveFlyer(null);
      openerRef.current?.focus();
    };

    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [activeFlyer]);

  return (
    <section id="offers" className="py-20 bg-surface-page border-y border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Offers &amp; Packages" subtitle="Seasonal rates &amp; experiences">
          Book direct for staycation packages, heated pool day passes, Rodizio evenings at
          La Cabana and the weekly Health Club schedule.
        </SectionHeading>

        {/* Quiet tabs rather than filled pills. The heading should be the
            loudest thing in the section, and five solid bronze buttons were
            competing with it. */}
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1 mb-12 border-b border-hairline">
          {TABS.map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                aria-pressed={active}
                className={`relative pb-3 text-[11px] sm:text-xs uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? 'text-brand-bronze-ink font-semibold'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                {tab.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-px h-[2px] ${
                    active ? 'bg-brand-bronze-deep' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* The same card as the apartments row: h-64 cover image, hairline
            border, p-6 body, a rule above the footer actions. The flyer art is
            cropped here so the row reads as one band of equal pictures — the
            whole poster is one click away in the dialog. */}
        <CardSlider count={filteredOffers.length} hint="Swipe for more offers">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`${SLIDER_CARD} bg-surface-raised rounded-md border border-hairline overflow-hidden hover:border-brand-antique/50 transition-all group flex flex-col shadow-lg`}
            >
              <button
                type="button"
                onClick={(e) => openFlyer(offer, e)}
                aria-label={`View the ${offer.title} flyer`}
                className="relative h-64 w-full overflow-hidden block text-left bg-surface-sunken"
              >
                {/* These are posters, not photographs. Cropping them to fill
                    the frame slices their own headlines, and containing them
                    leaves bars down the sides. So: a blurred copy fills the
                    frame, the whole flyer sits on top of it. The band stays
                    uniform and nothing is cut. */}
                <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
                  <Image
                    src={offer.image}
                    alt=""
                    fill
                    aria-hidden="true"
                    className="object-cover scale-125 blur-2xl opacity-45"
                  />
                </span>
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 right-3 bg-surface-page/80 backdrop-blur-sm w-8 h-8 rounded-md border border-brand-antique/30 text-brand-bronze-ink flex items-center justify-center">
                  <IconExpand className="w-3.5 h-3.5" />
                </span>
              </button>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* The tag reads here rather than as a chip over the
                      artwork, where it covered each poster's own headline.
                      Same eyebrow treatment the dialog uses. */}
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    {offer.tag}
                  </p>
                  <h3 className="mt-1.5 text-xl font-serif font-semibold text-ink-primary group-hover:text-brand-bronze-ink transition-colors">
                    {offer.title}
                  </h3>
                  <p className="mt-2 text-xs text-ink-muted line-clamp-3 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between gap-3">
                  {offer.downloadPdf ? (
                    <a
                      href={offer.downloadPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold uppercase tracking-wider text-ink-secondary hover:text-brand-bronze-ink transition-colors"
                    >
                      Menu PDF
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => openFlyer(offer, e)}
                      className="text-xs font-semibold uppercase tracking-wider text-ink-secondary hover:text-brand-bronze-ink transition-colors"
                    >
                      View flyer
                    </button>
                  )}

                  <a
                    href={waHref(offer.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold uppercase tracking-wider text-brand-bronze-ink hover:text-ink-primary transition-colors flex items-center gap-1.5"
                  >
                    <IconWhatsApp className="w-3.5 h-3.5" />
                    Enquire
                  </a>
                </div>
              </div>
            </div>
          ))}
        </CardSlider>
      </div>

      {/* The full flyer. Opened from a card, closed with Escape, the backdrop
          or the button, and focus goes back to the card it came from. */}
      {activeFlyer && (
        <div
          className="fixed inset-0 z-50 bg-scrim backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={closeFlyer}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeFlyer.title}
            className="bg-surface-raised border border-hairline rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={closeFlyer}
              aria-label="Close"
              // Sits over the flyer, which may be light, so it carries a
              // shadow of its own rather than relying on the border alone.
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-md border border-hairline bg-surface-page text-ink-secondary shadow-md hover:text-ink-primary hover:border-brand-antique/50 flex items-center justify-center transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="square"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Here the poster is shown whole — contained, never cropped. */}
            <div className="relative w-full h-[420px] sm:h-[480px] bg-surface-sunken rounded-md overflow-hidden mb-5">
              <Image
                src={activeFlyer.image}
                alt={activeFlyer.title}
                fill
                className="object-contain"
              />
            </div>

            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              {activeFlyer.tag}
            </p>
            <h3 className="mt-1.5 text-2xl font-serif font-normal text-ink-primary">
              {activeFlyer.title}
            </h3>
            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
              {activeFlyer.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* ink-inverse, not ink-primary: the bronze fill is dark and the
                  label was reading near-black on it. */}
              <a
                href={waHref(activeFlyer.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[12rem] inline-flex items-center justify-center gap-2 py-3 px-5 rounded-md bg-brand-bronze-deep hover:brightness-110 text-ink-inverse font-bold text-xs uppercase tracking-wider shadow-md transition-all"
              >
                <IconWhatsApp className="w-4 h-4" />
                Enquire on WhatsApp
              </a>

              {activeFlyer.downloadPdf && (
                <a
                  href={activeFlyer.downloadPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 rounded-md border border-brand-antique/60 text-brand-bronze-ink text-xs font-semibold uppercase tracking-wider hover:bg-brand-bronze-deep hover:text-ink-inverse hover:border-brand-bronze-deep transition-colors"
                >
                  Menu PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
