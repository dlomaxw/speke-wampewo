/**
 * Seed content for Speke Apartments Wampewo.
 *
 * PROVENANCE. Every string here is either transcribed from the property's own
 * live website (https://www.spekeapartments.com/wampewo/, captured 13 Sep 2026)
 * or written from facts published there. Nothing is invented.
 *
 * WHAT `verification` MEANS HERE:
 *   'verified'   — transcribed from the property's published source and safe to
 *                  render. Descriptive content only.
 *   'unverified' — either not published anywhere, or a commercial term the
 *                  brief requires management to confirm (rates, taxes, policies,
 *                  deposits, apartment sizes, bed configurations, accessibility).
 *   'missing'    — known to be required and not available at all.
 *
 * A management sign-off pass still applies to everything, verified included.
 * docs/content-checklist.md tracks that separately.
 *
 * NOTE ON KITANTE. The legacy site bylines every Wampewo apartment "by Speke
 * Apartments Kitante" and names its amenity icons `Speke-Apartments-Kitante-*`.
 * Kitante is a separate property with its own website. No Kitante content,
 * byline or cross-link is reproduced here.
 */

export const SOURCE = 'https://www.spekeapartments.com/wampewo/ (captured 2026-09-13)';

export const PROPERTY = {
  slug: 'speke-apartments-wampewo',
  name: 'Speke Apartments Wampewo',
  legalName: 'Speke Apartments Wampewo',
  tagline: 'Exclusive apartments in Kololo, Kampala',
  description:
    'Located in the posh suburb of Wampewo overlooking the city with scenic views of Kampala, '
    + 'Speke Apartments Wampewo offers spacious serviced apartments for short stays, long stays '
    + 'and corporate guests. The property is part of the Speke Group of Hotels.',
  addressLine: 'Plot 19–21 Wampewo Avenue, Kololo',
  city: 'Kampala',
  country: 'Uganda',
  // Coordinates are NOT transcribed from the source — the legacy site embeds a
  // map without exposing them. Left null so nothing false is published.
  latitude: null as string | null,
  longitude: null as string | null,
  mapEmbedUrl: null as string | null,
  checkInTime: null as string | null,   // not published anywhere
  checkOutTime: null as string | null,  // not published anywhere
  currency: 'USD',
  timezone: 'Africa/Kampala',
  verification: 'verified',
};

/**
 * Department contacts, transcribed exactly. The legacy site publishes four
 * numbers and two addresses but does not say which desk answers which line —
 * the mapping below is the best reading of where each appears, and every row is
 * flagged for confirmation before launch.
 */
export const DEPARTMENTS = [
  {
    key: 'reservations',
    name: 'Reservations',
    description: 'Availability, rates, bookings and amendments.',
    phone: '+256 200 555 000',
    phoneE164: '+256200555000',
    email: 'reservations@spekeapartments.com',
    whatsappE164: '+256200555000',
    whatsappEnabled: true,
    hours: null,
    sortOrder: 1,
    // Published in the header and footer of the source site.
    verification: 'verified',
  },
  {
    key: 'front_office',
    name: 'Front office',
    description: 'General assistance for guests in residence.',
    phone: '+256 752 711 704',
    phoneE164: '+256752711704',
    email: null,
    whatsappE164: '+256752711704',
    whatsappEnabled: true,
    hours: null,
    sortOrder: 2,
    verification: 'verified',
  },
  {
    key: 'dining',
    name: 'La Cabana Restaurant',
    description: 'Restaurant reservations and in-residence dining.',
    phone: '+256 702 711 009',
    phoneE164: '+256702711009',
    email: null,
    whatsappE164: '+256702711009',
    whatsappEnabled: true,
    hours: null,
    sortOrder: 3,
    // The number is published; its attribution to dining is not. Confirm.
    verification: 'unverified',
  },
  {
    key: 'spa',
    name: 'Calabash Spa and Salon',
    description: 'Spa treatments, salon appointments and the Turkish hammam.',
    phone: '+256 702 711 056',
    phoneE164: '+256702711056',
    email: 'calabash@spekeapartments.com',
    whatsappE164: '+256702711056',
    whatsappEnabled: true,
    hours: null,
    sortOrder: 4,
    // Email is published against Calabash; the number's desk needs confirming.
    verification: 'unverified',
  },
  {
    key: 'gym',
    name: 'Health Club',
    description: 'Gym membership, fitness classes and the swimming pool.',
    phone: null,
    phoneE164: null,
    email: null,
    whatsappE164: null,
    whatsappEnabled: false,
    hours: null,
    sortOrder: 5,
    // No dedicated contact published for the health club.
    verification: 'missing',
  },
  {
    key: 'sales',
    name: 'Corporate sales',
    description: 'Corporate accounts, negotiated rates and long-stay agreements.',
    phone: null,
    phoneE164: null,
    email: null,
    whatsappE164: null,
    whatsappEnabled: false,
    hours: null,
    sortOrder: 6,
    verification: 'missing',
  },
  {
    key: 'events',
    name: 'Meetings and events',
    description: 'Meeting space and private events.',
    phone: null,
    phoneE164: null,
    email: null,
    whatsappE164: null,
    whatsappEnabled: false,
    hours: null,
    sortOrder: 7,
    // The source site advertises no meeting or event facility at Wampewo.
    verification: 'missing',
  },
];

/** The sixteen guest amenities listed on the source site, in its order. */
export const AMENITIES = [
  { key: 'security-24-7', name: '24/7 Security', category: 'building' },
  { key: 'equipped-kitchen', name: 'Equipped Kitchen', category: 'in-apartment' },
  { key: 'refrigerator', name: 'Refrigerator', category: 'in-apartment' },
  { key: 'shower', name: 'Shower', category: 'in-apartment' },
  { key: 'high-speed-wifi', name: 'High Speed WiFi', category: 'in-apartment' },
  { key: 'satellite-tv', name: 'Satellite TV', category: 'in-apartment' },
  { key: 'nearby-shopping-malls', name: 'Nearby Shopping Malls', category: 'location' },
  { key: 'heated-swimming-pool', name: 'Heated Swimming Pool', category: 'building' },
  { key: 'elevator', name: 'Elevator', category: 'building' },
  { key: 'ample-parking', name: 'Ample Parking', category: 'building' },
  { key: 'air-conditioning', name: 'Air Condition', category: 'in-apartment' },
  { key: 'room-service', name: 'Room Service', category: 'service' },
  { key: 'cctv-camera', name: 'CCTV Camera', category: 'building' },
  { key: 'power-backup', name: 'Power Backup', category: 'building' },
  { key: 'dining-area', name: 'Dining Area', category: 'in-apartment' },
  { key: 'outdoor-balcony', name: 'Outdoor Balcony', category: 'in-apartment' },
].map((a, i) => ({ ...a, sortOrder: i, verification: 'verified' as const }));

/** The four on-site facilities the source site names. All are at Wampewo. */
export const FACILITIES = [
  { key: 'gym-club', name: 'Gym Club', image: '/media/facility-gym-club.jpg' },
  { key: 'heated-swimming-pool', name: 'Heated Swimming Pool', image: '/media/facility-swimming-pool.jpg' },
  { key: 'spa', name: 'Speke Apartments Wampewo Spa', image: '/media/facility-spa.jpg' },
  { key: 'turkish-hammam', name: 'Turkish Hammam', image: '/media/facility-turkish-hammam.jpg' },
];

/**
 * Accommodation.
 *
 * bedrooms / maxOccupancy / fromPrice are transcribed from the source cards.
 * Descriptions are expanded from the truncated source text using only what it
 * states. sizeSqm, bedConfiguration, bathrooms and accessibility are NOT
 * published anywhere — they stay null and are flagged.
 *
 * `fromPriceMinor` is the discounted "From" figure shown on the source site.
 * It is marked unverified everywhere: rates are a commercial term and the brief
 * requires management confirmation before publication.
 */
export const ROOM_TYPES = [
  {
    slug: 'one-bedroom-deluxe-apartment',
    name: 'One Bedroom Deluxe Apartment',
    bedrooms: 1,
    maxAdults: 2,
    maxChildren: 0,
    maxOccupancy: 2,
    rackPriceMinor: 23000_0,      // $230 struck-through on source
    fromPriceMinor: 18000_0,      // $180 shown
    shortDescription:
      'One bedroom, a flat-screen TV with satellite channels and a fully equipped kitchen.',
    description:
      'The One Bedroom Deluxe Apartment features one bedroom, a flat-screen TV with satellite '
      + 'channels and a fully equipped kitchen that provides guests with a dishwasher, fridge, '
      + 'microwave, oven, kettle and toaster. It is a self-catering apartment suited to single '
      + 'travellers and couples on both short and extended stays.',
    heroImage: '/media/one-bedroom-deluxe-apartment.jpg',
    images: [
      'one-bedroom-deluxe-apartment', 'one-bedroom-deluxe-living-area',
      'one-bedroom-deluxe-bathroom', 'one-bedroom-deluxe-interior',
    ],
    virtualTourSlug: 'one-bedroom-virtual-tour',
    sortOrder: 1,
    totalUnits: 6,
  },
  {
    slug: 'one-bedroom-superior-apartment',
    name: 'One Bedroom Superior Apartment',
    bedrooms: 1,
    maxAdults: 2,
    maxChildren: 0,
    maxOccupancy: 2,
    rackPriceMinor: 28000_0,
    fromPriceMinor: 23600_0,
    shortDescription:
      'A larger one bedroom apartment with satellite television and a full kitchen.',
    description:
      'The One Bedroom Superior Apartment features one bedroom, a flat-screen TV with satellite '
      + 'channels and a fully equipped kitchen that provides guests with a dishwasher, fridge, '
      + 'microwave, oven, kettle and toaster. It offers more space than the Deluxe and suits '
      + 'guests staying for longer periods.',
    heroImage: '/media/one-bedroom-superior-apartment.jpg',
    images: [
      'one-bedroom-superior-apartment', 'one-bedroom-superior-living-area',
      'one-bedroom-superior-kitchen', 'one-bedroom-superior-bathroom',
    ],
    virtualTourSlug: 'one-bedroom-virtual-tour',
    sortOrder: 2,
    totalUnits: 6,
  },
  {
    slug: 'two-bedroom-deluxe-apartment',
    name: 'Two Bedroom Deluxe Apartment',
    bedrooms: 2,
    maxAdults: 4,
    maxChildren: 0,
    maxOccupancy: 4,
    rackPriceMinor: 30000_0,
    fromPriceMinor: 27000_0,
    shortDescription:
      'Two bedrooms with a full kitchen and a fully equipped private living space.',
    description:
      'Featuring a full kitchen with a microwave, oven, kettle, toaster, dishwasher and a fridge, '
      + 'the Two Bedroom Deluxe Apartment offers a fully equipped private living and dining area '
      + 'alongside two bedrooms. It suits families and colleagues sharing an apartment.',
    heroImage: '/media/two-bedroom-deluxe-apartment.jpg',
    images: ['two-bedroom-deluxe-apartment', 'two-bedroom-deluxe-living-area', 'two-bedroom-deluxe-kitchen'],
    virtualTourSlug: 'two-bedroom-virtual-tour',
    sortOrder: 3,
    totalUnits: 5,
  },
  {
    slug: 'two-bedroom-superior-apartment',
    name: 'Two Bedroom Superior Apartment',
    bedrooms: 2,
    maxAdults: 4,
    maxChildren: 0,
    maxOccupancy: 4,
    rackPriceMinor: 37000_0,
    fromPriceMinor: 32500_0,
    shortDescription:
      'A larger two bedroom apartment with a full kitchen and private living space.',
    description:
      'Featuring a full kitchen with a microwave, oven, kettle, toaster, dishwasher and a fridge, '
      + 'the Two Bedroom Superior Apartment provides a fully equipped private living area with a '
      + 'balcony. It is the larger of the two-bedroom categories.',
    heroImage: '/media/two-bedroom-superior-apartment.jpg',
    images: ['two-bedroom-superior-apartment', 'two-bedroom-superior-living-area', 'two-bedroom-superior-kitchen'],
    virtualTourSlug: 'two-bedroom-virtual-tour',
    sortOrder: 4,
    totalUnits: 5,
  },
  {
    slug: 'three-bedroom-apartment',
    name: 'Three Bedroom Apartment',
    bedrooms: 3,
    maxAdults: 6,
    maxChildren: 0,
    maxOccupancy: 6,
    rackPriceMinor: 48000_0,
    fromPriceMinor: 47200_0,
    shortDescription:
      'A self-catering three bedroom apartment with a full kitchen and a balcony with a view.',
    description:
      'Offering splendour at its finest, this self-catering apartment boasts a fully equipped '
      + 'kitchen and a balcony with a view. Three bedrooms and a generous living area make it '
      + 'suitable for families and small groups.',
    heroImage: '/media/three-bedroom-apartment.jpg',
    images: [
      'three-bedroom-apartment', 'three-bedroom-apartment-living',
      'three-bedroom-apartment-bedroom', 'three-bedroom-apartment-kitchen',
    ],
    virtualTourSlug: null,
    sortOrder: 5,
    totalUnits: 4,
  },
  {
    slug: 'three-bedroom-villa',
    name: 'Three Bedroom Villa',
    bedrooms: 3,
    maxAdults: 6,
    maxChildren: 0,
    maxOccupancy: 6,
    rackPriceMinor: 42000_0,
    fromPriceMinor: 41300_0,
    shortDescription:
      'Three bedroom suites with king-size double beds and room for multiple sleepers.',
    description:
      'The Three Bedroom Villa offers three bedroom suites with king-size double beds, giving it '
      + 'plenty of room for multiple sleepers. It is a self-contained villa with its own living '
      + 'and dining space.',
    heroImage: '/media/three-bedroom-villa.jpg',
    images: [
      'three-bedroom-villa', 'three-bedroom-villa-living',
      'three-bedroom-villa-bedroom', 'three-bedroom-villa-dining',
    ],
    virtualTourSlug: null,
    sortOrder: 6,
    totalUnits: 3,
    // The source states "3 bedroom suites with King-size double beds".
    bedConfiguration: '3 bedroom suites with king-size double beds',
    bedConfigurationVerified: true,
  },
  {
    slug: 'penthouse-apartment',
    name: 'Penthouse Apartment',
    bedrooms: 3,
    maxAdults: 5,
    maxChildren: 0,
    maxOccupancy: 5,
    rackPriceMinor: 54000_0,
    fromPriceMinor: 53100_0,
    shortDescription:
      'The pinnacle of the building, with some of the best views of the city.',
    description:
      'This high-rise apartment is, by definition, the pinnacle of luxury, offering some of the '
      + 'best views of the entire city. It is the most spacious category at Speke Apartments '
      + 'Wampewo.',
    heroImage: '/media/penthouse-apartment.jpg',
    images: [
      'penthouse-apartment', 'penthouse-apartment-living',
      'penthouse-apartment-bedroom', 'penthouse-apartment-terrace',
    ],
    virtualTourSlug: 'penthouse-apartment-virtual-tour',
    sortOrder: 7,
    totalUnits: 2,
  },
  {
    /**
     * The source site's navigation lists an eighth category, "One Bedroom
     * Apartment" ($300 → $295, sleeps 2), which has no card on the homepage.
     * The brief's provisional list has seven. Seeded UNPUBLISHED pending a
     * decision on whether it is still sold.
     */
    slug: 'one-bedroom-apartment',
    name: 'One Bedroom Apartment',
    bedrooms: 1,
    maxAdults: 2,
    maxChildren: 0,
    maxOccupancy: 2,
    rackPriceMinor: 30000_0,
    fromPriceMinor: 29500_0,
    shortDescription:
      'One bedroom with a flat-screen TV with satellite channels and a fully equipped kitchen.',
    description:
      'Features one bedroom, a flat-screen TV with satellite channels and a fully equipped '
      + 'kitchen. Listed in the legacy site navigation; confirm whether this category is still '
      + 'sold, and how it differs from the Deluxe and Superior.',
    heroImage: '/media/one-bedroom-deluxe-apartment.jpg',
    images: ['one-bedroom-deluxe-apartment'],
    virtualTourSlug: 'one-bedroom-virtual-tour',
    sortOrder: 8,
    totalUnits: 0,
    published: false,
    unresolved: 'Listed in legacy navigation with no homepage card. Confirm whether still sold.',
  },
];

/** Verified distances. The Kitante entry on the source site is deliberately omitted. */
export const DISTANCES = [
  {
    key: 'city-center', label: 'From the city centre',
    detail: 'We are located 1 kilometre from the Central Business District, approximately 10 minutes by car.',
    minutes: 10, kilometres: 1,
  },
  {
    key: 'airport', label: 'From Entebbe International Airport',
    detail: 'Uganda has one international airport, Entebbe International Airport. We are located 40 kilometres from the airport, approximately 1 hour by car.',
    minutes: 60, kilometres: 40,
  },
  {
    key: 'acacia-mall', label: 'From Acacia Mall',
    detail: 'We are located near one of Kampala’s biggest shopping malls, less than 10 minutes away.',
    minutes: 10, kilometres: null,
  },
  {
    key: 'golf-course', label: 'From the Uganda Golf Club',
    detail: 'It takes less than 5 minutes to drive from the apartments to the Uganda Golf Club.',
    minutes: 5, kilometres: null,
  },
  {
    key: 'kabira', label: 'From Kabira Country Club',
    detail: 'Our sister hotel, Kabira Country Club, is approximately 10 minutes’ drive away from the apartments.',
    minutes: 10, kilometres: null,
  },
].map((d, i) => ({ ...d, sortOrder: i, verification: 'verified' as const }));

/**
 * FAQs. Only questions answerable from published fact are marked verified.
 * The rest are seeded unpublished so the team can supply answers rather than
 * the site guessing.
 */
export const FAQS = [
  {
    question: 'Where is Speke Apartments Wampewo?',
    answer:
      'The property is at Plot 19–21 Wampewo Avenue, Kololo, Kampala, Uganda — about 1 kilometre '
      + 'from the Central Business District, roughly 10 minutes by car.',
    category: 'location', published: true, verification: 'verified',
  },
  {
    question: 'Is Speke Apartments Wampewo the same as Speke Apartments Kitante?',
    answer:
      'No. They are separate properties. This website covers Speke Apartments Wampewo on Wampewo '
      + 'Avenue in Kololo. Both are part of the Speke Group of Hotels.',
    category: 'general', published: true, verification: 'verified',
  },
  {
    question: 'Do the apartments have kitchens?',
    answer:
      'Yes. Every apartment is self-catering with a fully equipped kitchen including a fridge, '
      + 'microwave, oven, kettle, toaster and dishwasher.',
    category: 'apartments', published: true, verification: 'verified',
  },
  {
    question: 'What facilities are on site?',
    answer:
      'The Gym Club, a heated swimming pool, the spa and a Turkish hammam are all at the property, '
      + 'along with La Cabana restaurant and Calabash Spa and Salon.',
    category: 'facilities', published: true, verification: 'verified',
  },
  {
    question: 'Is there parking?',
    answer: 'Yes — ample parking is available, and the property has 24/7 security and CCTV.',
    category: 'facilities', published: true, verification: 'verified',
  },
  {
    question: 'Is there a backup generator?',
    answer: 'Yes. Power backup is provided for the building.',
    category: 'facilities', published: true, verification: 'verified',
  },
  {
    question: 'What are the check-in and check-out times?',
    answer: '',
    category: 'booking', published: false, verification: 'missing',
  },
  {
    question: 'Do you accept Mobile Money?',
    answer: '',
    category: 'payment', published: false, verification: 'missing',
  },
  {
    question: 'What is your cancellation policy?',
    answer: '',
    category: 'booking', published: false, verification: 'missing',
  },
  {
    question: 'Do you offer airport transfers?',
    answer: '',
    category: 'services', published: false, verification: 'missing',
  },
  {
    question: 'Are pets allowed?',
    answer: '',
    category: 'policies', published: false, verification: 'missing',
  },
  {
    question: 'Is the property wheelchair accessible?',
    answer: '',
    category: 'accessibility', published: false, verification: 'missing',
  },
];

/**
 * Cancellation policies. These are SPECIMEN terms so the booking engine and its
 * tests have something to run against. They are seeded unverified and unpublished
 * commercial terms — Revenue must replace them with the property's actual policy.
 */
export const CANCELLATION_POLICIES = [
  {
    code: 'FLEX',
    name: 'Flexible',
    summary: 'Free cancellation up to 48 hours before arrival. After that, one night is charged.',
    freeCancelCutoffHours: 48,
    penaltyPercent: 25,
    nonRefundable: false,
    amendmentRequiresApproval: false,
  },
  {
    code: 'SEMIFLEX',
    name: 'Semi-flexible',
    summary: 'Free cancellation up to 7 days before arrival. After that, 50% of the stay is charged.',
    freeCancelCutoffHours: 168,
    penaltyPercent: 50,
    nonRefundable: false,
    amendmentRequiresApproval: true,
  },
  {
    code: 'NONREF',
    name: 'Non-refundable',
    summary: 'This rate cannot be cancelled or refunded, and dates cannot be changed.',
    freeCancelCutoffHours: null,
    penaltyPercent: 100,
    nonRefundable: true,
    amendmentRequiresApproval: true,
  },
  {
    code: 'LONGSTAY',
    name: 'Long stay',
    summary: 'Free cancellation up to 14 days before arrival. Inside 14 days, the deposit is retained.',
    freeCancelCutoffHours: 336,
    penaltyPercent: 30,
    nonRefundable: false,
    amendmentRequiresApproval: true,
  },
];

/**
 * Taxes. Uganda's standard VAT rate is 18%, and hospitality is commonly subject
 * to a local service charge — but neither is published on the source site and
 * the applicable treatment is a finance question. Seeded INACTIVE and unverified.
 */
export const TAXES = [
  {
    code: 'VAT', name: 'VAT', rateBps: 1800, appliesTo: 'total',
    inclusive: false, active: false, verification: 'unverified',
  },
  {
    code: 'SERVICE', name: 'Service charge', rateBps: 1000, appliesTo: 'accommodation',
    inclusive: false, active: false, verification: 'unverified',
  },
];

/**
 * Optional extras. All seeded INACTIVE: the brief is explicit that extras must
 * only appear when the property actually offers them.
 */
export const EXTRAS = [
  {
    code: 'AIRPORT-ARRIVAL', name: 'Airport transfer — arrival',
    description: 'Private transfer from Entebbe International Airport to the property.',
    priceMinor: 5000_0, pricingMode: 'per_stay', departmentKey: 'reservations',
  },
  {
    code: 'AIRPORT-DEPARTURE', name: 'Airport transfer — departure',
    description: 'Private transfer from the property to Entebbe International Airport.',
    priceMinor: 5000_0, pricingMode: 'per_stay', departmentKey: 'reservations',
  },
  {
    code: 'BREAKFAST', name: 'Daily breakfast',
    description: 'Breakfast at La Cabana for each guest, each morning.',
    priceMinor: 1500_0, pricingMode: 'per_person_night', departmentKey: 'dining',
  },
  {
    code: 'AIRPORT-MEET', name: 'Meet and greet',
    description: 'Meet and greet on arrival at the airport.',
    priceMinor: 2000_0, pricingMode: 'per_stay', departmentKey: 'reservations',
  },
  {
    code: 'LAUNDRY', name: 'Laundry package',
    description: 'Weekly laundry service for long stays.',
    priceMinor: 3000_0, pricingMode: 'per_night', departmentKey: 'front_office',
  },
];

/**
 * Offer categories the source site advertises (LaCabana, Accommodation,
 * Spa & Salon, Health Club). It publishes no validity dates, inclusions or
 * terms for any of them, so no offer is seeded as published — the brief
 * requires offers to carry validity dates.
 */
export const OFFER_CATEGORIES = [
  { key: 'accommodation', name: 'Accommodation' },
  { key: 'dining', name: 'La Cabana' },
  { key: 'spa', name: 'Spa & Salon' },
  { key: 'health-club', name: 'Health Club' },
];

export const OFFERS = [
  {
    slug: 'long-stay-enquiry',
    title: 'Long stay rates',
    category: 'accommodation',
    summary: 'Reduced nightly rates for stays of 7 nights or more. Enquire for a quotation.',
    description:
      'Extended stays are quoted individually. Tell us your dates, apartment preference and '
      + 'number of guests and the reservations team will prepare a quotation.',
    inclusions: [] as string[],
    image: '/media/one-bedroom-superior-living-area.jpg',
    departmentKey: 'reservations',
    published: false,
    verification: 'unverified',
    note: 'No published long-stay rate ladder exists. Revenue must supply thresholds and discounts.',
  },
];

/**
 * Virtual tours published on the source site. URLs point at the legacy pages,
 * which is honest — we have the tour pages but not the underlying tour assets.
 */
export const VIRTUAL_TOURS = [
  { slug: 'one-bedroom-virtual-tour', name: 'One Bedroom Virtual Tour', url: 'https://www.spekeapartments.com/wampewo/one-bedroom-virtual-tour/' },
  { slug: 'two-bedroom-virtual-tour', name: 'Two Bedroom Virtual Tour', url: 'https://www.spekeapartments.com/wampewo/two-bedroom-virtual-tour/' },
  { slug: 'penthouse-apartment-virtual-tour', name: 'Penthouse Apartment Virtual Tour', url: 'https://www.spekeapartments.com/wampewo/penthouse-apartment-virtual-tour/' },
  { slug: 'calabash-spa-and-salon-virtual-tour', name: 'Calabash Spa and Salon Virtual Tour', url: 'https://www.spekeapartments.com/wampewo/calabash-spa-and-salon-virtual-tour/' },
  { slug: 'health-gym-virtual-tour', name: 'Health Gym Virtual Tour', url: 'https://www.spekeapartments.com/wampewo/health-gym-virtual-tour/' },
];

/**
 * SEO migration map: legacy path → new path.
 *
 * The legacy site serves several apartment pages at TWO paths (/slug/ and
 * /apartments/slug/), which splits ranking signals. Both are mapped to the one
 * canonical new URL.
 */
export const REDIRECTS: Array<{ from: string; to: string; note?: string }> = [
  { from: '/wampewo', to: '/' },
  { from: '/wampewo/', to: '/' },
  { from: '/wampewo/our-apartments/', to: '/apartments' },
  { from: '/wampewo/dining/', to: '/dining' },
  { from: '/wampewo/spa-and-saloon/', to: '/spa' },
  { from: '/wampewo/gym-club/', to: '/wellness' },
  { from: '/wampewo/contact-and-location/', to: '/contact' },
  { from: '/wampewo/food-gallery/', to: '/gallery?category=dining' },

  // Apartment pages — legacy duplicate paths collapse onto one canonical URL.
  { from: '/wampewo/one-bedroom-deluxe-apartment/', to: '/apartments/one-bedroom-deluxe-apartment' },
  { from: '/wampewo/apartments/one-bedroom-deluxe-apartment/', to: '/apartments/one-bedroom-deluxe-apartment', note: 'Duplicate legacy path' },
  { from: '/wampewo/one-bedroom-superior-apartment/', to: '/apartments/one-bedroom-superior-apartment' },
  { from: '/wampewo/apartments/one-bedroom-superior-apartment/', to: '/apartments/one-bedroom-superior-apartment', note: 'Duplicate legacy path' },
  { from: '/wampewo/two-bedroom-deluxe-apartments/', to: '/apartments/two-bedroom-deluxe-apartment' },
  { from: '/wampewo/apartments/two-bedroom-deluxe-apartments/', to: '/apartments/two-bedroom-deluxe-apartment', note: 'Duplicate legacy path' },
  { from: '/wampewo/two-bed-room-apartment/', to: '/apartments/two-bedroom-superior-apartment', note: 'Legacy slug for the Superior' },
  { from: '/wampewo/two-bedroom-apartment/', to: '/apartments/two-bedroom-superior-apartment' },
  { from: '/wampewo/apartments/two-bed-room-apartment/', to: '/apartments/two-bedroom-superior-apartment', note: 'Duplicate legacy path' },
  { from: '/wampewo/three-bedroom-apartment/', to: '/apartments/three-bedroom-apartment' },
  { from: '/wampewo/apartments/three-bedroom-apartment/', to: '/apartments/three-bedroom-apartment', note: 'Duplicate legacy path' },
  { from: '/wampewo/three-bedroom-villa/', to: '/apartments/three-bedroom-villa' },
  { from: '/wampewo/apartments/three-bedroom-villa/', to: '/apartments/three-bedroom-villa', note: 'Duplicate legacy path' },
  { from: '/wampewo/penthouse-apartment/', to: '/apartments/penthouse-apartment' },
  { from: '/wampewo/pent-house-apartment/', to: '/apartments/penthouse-apartment', note: 'Legacy slug spelling' },
  { from: '/wampewo/apartments/pent-house-apartment/', to: '/apartments/penthouse-apartment', note: 'Duplicate legacy path' },
  { from: '/wampewo/one-bed-room-apartment/', to: '/apartments', note: 'Category under review' },
  { from: '/wampewo/one-bedroom-apartment/', to: '/apartments', note: 'Category under review' },

  // Virtual tours.
  { from: '/wampewo/one-bedroom-virtual-tour/', to: '/apartments/one-bedroom-deluxe-apartment#tour' },
  { from: '/wampewo/two-bedroom-virtual-tour/', to: '/apartments/two-bedroom-superior-apartment#tour' },
  { from: '/wampewo/penthouse-apartment-virtual-tour/', to: '/apartments/penthouse-apartment#tour' },
  { from: '/wampewo/calabash-spa-and-salon-virtual-tour/', to: '/spa#tour' },
  { from: '/wampewo/health-gym-virtual-tour/', to: '/wellness#tour' },

  // Distance posts folded into the location page.
  { from: '/wampewo/from-airport/', to: '/location' },
  { from: '/wampewo/from-city-center/', to: '/location' },
  { from: '/wampewo/from-acacia-mall/', to: '/location' },
  { from: '/wampewo/from-golf-course/', to: '/location' },
  { from: '/wampewo/from-kabira-country-club/', to: '/location' },
  // Kitante has its own website; do not absorb its URL into this property.
  { from: '/wampewo/from-speke-apartments-kitante/', to: '/location', note: 'Kitante content removed — Kitante has a separate site' },

  // Legacy WordPress noise.
  { from: '/wampewo/category/apartments/', to: '/apartments' },
  { from: '/wampewo/author/speke-apartments-kitante/', to: '/', note: 'Incorrect author attribution on legacy site' },
  { from: '/wampewo/speke-apartments-kitante/', to: '/', note: 'Legacy page slug titled "Speke Apartments Wampewo"' },
  { from: '/wampewo/lacabana-feedback/', to: '/dining' },
];

/**
 * Pages whose body copy the property must supply. Seeded so the routes, SEO
 * metadata and navigation exist, but unpublished where there is no verified
 * content to show.
 */
export const PAGES = [
  {
    slug: 'long-stays', title: 'Long Stays', departmentKey: 'reservations',
    intro: 'Serviced apartments for extended stays in Kololo, with a full kitchen, weekly housekeeping and a single monthly invoice.',
    heroImage: '/media/one-bedroom-superior-living-area.jpg',
    seoTitle: 'Long Stay Apartments in Kampala | Speke Apartments Wampewo',
    seoDescription: 'Furnished serviced apartments for long stays in Kololo, Kampala. Request a quotation for stays of a week or more.',
    published: true, verification: 'unverified',
    note: 'Long-stay rate ladder and inclusions need Revenue confirmation.',
  },
  {
    slug: 'corporate', title: 'Corporate Accommodation', departmentKey: 'sales',
    intro: 'Accommodation agreements for organisations placing staff, consultants and visiting teams in Kampala.',
    heroImage: '/media/two-bedroom-superior-living-area.jpg',
    seoTitle: 'Corporate Accommodation in Kampala | Speke Apartments Wampewo',
    seoDescription: 'Corporate serviced apartments in Kololo, Kampala. Negotiated rates and dedicated account management.',
    published: true, verification: 'unverified',
    note: 'Corporate contact and negotiated-rate process need confirmation.',
  },
  {
    slug: 'dining', title: 'La Cabana', departmentKey: 'dining',
    intro: 'La Cabana is the restaurant at Speke Apartments Wampewo.',
    heroImage: '/media/dining-01.jpg',
    seoTitle: 'La Cabana Restaurant | Speke Apartments Wampewo',
    seoDescription: 'La Cabana restaurant at Speke Apartments Wampewo, Kololo, Kampala.',
    published: true, verification: 'unverified',
    note: 'Opening hours, menu and cuisine are not published on the source site.',
  },
  {
    slug: 'spa', title: 'Calabash Spa and Salon', departmentKey: 'spa',
    intro: 'Calabash Spa and Salon offers treatments, salon services and a Turkish hammam at the property.',
    heroImage: '/media/spa-01.jpg',
    seoTitle: 'Calabash Spa and Salon | Speke Apartments Wampewo',
    seoDescription: 'Spa, salon and Turkish hammam at Speke Apartments Wampewo, Kololo, Kampala.',
    published: true, verification: 'unverified',
    note: 'Treatment menu, prices and hours need confirmation.',
  },
  {
    slug: 'wellness', title: 'Gym, Pool and Wellness', departmentKey: 'gym',
    intro: 'The Gym Club and heated swimming pool are available to residents.',
    heroImage: '/media/facility-gym-club.jpg',
    seoTitle: 'Gym, Pool and Health Club | Speke Apartments Wampewo',
    seoDescription: 'Health club, fitness classes and heated swimming pool at Speke Apartments Wampewo.',
    published: true, verification: 'unverified',
    note: 'Class timetable, membership terms and pool hours need confirmation.',
  },
  {
    slug: 'about', title: 'About the Property', departmentKey: 'reservations',
    intro: 'Speke Apartments Wampewo is part of the Speke Group of Hotels.',
    heroImage: '/media/about-speke-apartments-wampewo.png',
    seoTitle: 'About | Speke Apartments Wampewo',
    seoDescription: 'About Speke Apartments Wampewo, serviced apartments in Kololo, Kampala.',
    published: true, verification: 'verified',
  },
  {
    slug: 'meetings-and-events', title: 'Meetings and Events', departmentKey: 'events',
    intro: '',
    heroImage: null,
    seoTitle: 'Meetings and Events | Speke Apartments Wampewo',
    seoDescription: '',
    published: false, verification: 'missing',
    note: 'The source site advertises no meeting or event facility at Wampewo. Confirm whether one exists before publishing this page.',
  },
  {
    slug: 'accessibility', title: 'Accessibility Information', departmentKey: 'reservations',
    intro: '',
    heroImage: null,
    seoTitle: 'Accessibility | Speke Apartments Wampewo',
    seoDescription: 'Accessibility information for Speke Apartments Wampewo.',
    published: false, verification: 'missing',
    note: 'No accessibility information is published. A physical survey is required — do not publish claims without one.',
  },
  {
    slug: 'privacy', title: 'Privacy Policy', departmentKey: null,
    intro: '', heroImage: null,
    seoTitle: 'Privacy Policy | Speke Apartments Wampewo',
    seoDescription: 'How Speke Apartments Wampewo handles personal information.',
    published: false, verification: 'missing',
    note: 'Must be supplied and approved by the Speke Group data owner.',
  },
  {
    slug: 'booking-terms', title: 'Booking Terms', departmentKey: 'reservations',
    intro: '', heroImage: null,
    seoTitle: 'Booking Terms | Speke Apartments Wampewo',
    seoDescription: 'Booking terms and conditions for Speke Apartments Wampewo.',
    published: false, verification: 'missing',
    note: 'Commercial terms. Must be approved before any live booking is taken.',
  },
  {
    slug: 'cancellation-policy', title: 'Cancellation and Refund Policy', departmentKey: 'reservations',
    intro: '', heroImage: null,
    seoTitle: 'Cancellation and Refund Policy | Speke Apartments Wampewo',
    seoDescription: 'Cancellation and refund policy for Speke Apartments Wampewo.',
    published: false, verification: 'missing',
    note: 'Commercial terms. Must be approved before any live booking is taken.',
  },
];

/** Kampala guides. Seeded unpublished — local editorial has to be written. */
export const GUIDES = [
  { slug: 'getting-around-kampala', title: 'Getting around Kampala', category: 'kampala' },
  { slug: 'dining-near-kololo', title: 'Dining near Kololo', category: 'kampala' },
  { slug: 'business-district-guide', title: 'The Central Business District', category: 'business' },
  { slug: 'weekend-in-kampala', title: 'A weekend in Kampala', category: 'kampala' },
].map((g) => ({
  ...g, summary: '', body: '', image: null,
  published: false, verification: 'missing' as const,
}));
