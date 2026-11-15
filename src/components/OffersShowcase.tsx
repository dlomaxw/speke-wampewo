'use client';

import { useState } from 'react';
import Image from 'next/image';

import CardSlider from '@/components/CardSlider';
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

export default function OffersShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFlyerModal, setActiveFlyerModal] = useState<OfferFlyer | null>(null);

  const filteredOffers =
    selectedCategory === 'all'
      ? OFFERS
      : OFFERS.filter((o) => o.category === selectedCategory);

  // A new filter shows a new set, so start it at the first card.
  const selectCategory = (id: string) => {
    setSelectedCategory(id);
    // the slider resets itself when its children change
  };

  return (
    <section id="offers" className="py-24 bg-surface-sunken border-y border-hairline relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.25em] font-semibold">
            Official Promotions & Events
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-ink-primary">
            Exclusive Offers & Seasonal Flyers
          </h2>
          <p className="mt-3 text-ink-muted text-sm leading-relaxed">
            Take advantage of official specials directly from Speke Apartments Wampewo, including staycation packages, heated pool day passes, Rodizio dining, and weekly fitness schedules.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {[
            { id: 'all', label: 'All Specials' },
            { id: 'accommodation', label: 'Staycation & Suites' },
            { id: 'pool', label: 'Heated Pool & Kids' },
            { id: 'dining', label: 'La Cabana Dining' },
            { id: 'fitness', label: 'Weekly Fitness Classes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === tab.id
                  ? 'bg-brand-bronze-deep text-ink-inverse shadow-lg shadow-brand-antique/10'
                  : 'bg-surface-raised text-ink-secondary hover:text-ink-primary hover:bg-surface-raised border border-hairline'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Flyers slider — three in view, the rest scroll */}
        <CardSlider count={filteredOffers.length} hint="Swipe for more offers">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`${SLIDER_CARD} bg-surface-raised rounded-2xl overflow-hidden border border-hairline/90 shadow-xl hover:border-brand-antique/60 transition-all group flex flex-col justify-between`}
            >
              <div>
                {/* Image / Flyer preview */}
                <div
                  className="relative h-72 w-full overflow-hidden cursor-pointer bg-surface-sunken"
                  onClick={() => setActiveFlyerModal(offer)}
                >
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-surface-page/90 backdrop-blur-md border border-brand-antique/40 px-3 py-1 rounded-full text-[10px] font-bold text-brand-bronze-ink shadow">
                    {offer.tag}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-surface-page/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-ink-secondary flex items-center gap-1 group-hover:text-ink-primary">
                    <span>🔍</span> Click to Expand
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-6">
                  <h3 className="text-lg font-serif font-bold text-ink-primary group-hover:text-brand-bronze-ink transition-colors">
                    {offer.title}
                  </h3>
                  <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                    {offer.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2">
                <a
                  href={`https://wa.me/256200555000?text=${encodeURIComponent(offer.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-ink-primary font-semibold text-xs transition-all shadow-md"
                >
                  <span>💬</span> {offer.ctaText || 'Claim Offer via WhatsApp'}
                </a>

                {offer.downloadPdf && (
                  <a
                    href={offer.downloadPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-surface-page hover:bg-surface-raised text-brand-bronze-ink text-xs font-semibold border border-brand-antique/30 transition-colors"
                  >
                    <span>📄</span> Download La Cabana Menu (PDF)
                  </a>
                )}
              </div>
            </div>
          ))}
        </CardSlider>
      </div>

      {/* Expanded Flyer Modal */}
      {activeFlyerModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveFlyerModal(null)}
        >
          <div
            className="bg-surface-raised border border-brand-antique/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveFlyerModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-raised text-ink-secondary hover:text-ink-primary flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            <div className="relative w-full h-[450px] bg-black/60 rounded-xl overflow-hidden mb-4">
              <Image
                src={activeFlyerModal.image}
                alt={activeFlyerModal.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-brand-antique/20 text-brand-bronze-ink border border-brand-antique/40">
                {activeFlyerModal.tag}
              </span>
            </div>

            <h3 className="text-xl font-serif font-bold text-ink-primary">
              {activeFlyerModal.title}
            </h3>
            <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
              {activeFlyerModal.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/256200555000?text=${encodeURIComponent(
                  activeFlyerModal.whatsappMessage,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-ink-primary font-semibold text-xs shadow-lg"
              >
                <span>💬</span> Claim / Enquire on WhatsApp
              </a>

              {activeFlyerModal.downloadPdf && (
                <a
                  href={activeFlyerModal.downloadPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 rounded-xl bg-surface-page hover:bg-surface-raised text-brand-bronze-ink text-xs font-semibold border border-brand-antique/40"
                >
                  Download Menu PDF ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
