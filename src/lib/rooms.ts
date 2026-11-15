export interface RoomType {
  slug: string;
  name: string;
  bedrooms: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  rackPriceMinor: number;
  fromPriceMinor: number;
  shortDescription: string;
  description: string;
  heroImage: string;
  images: string[];
  virtualTourSlug?: string | null;
  sortOrder: number;
  totalUnits: number;
  bedConfiguration?: string;
  bedConfigurationVerified?: boolean;
}

export const ROOM_TYPES: RoomType[] = [
  {
    slug: 'one-bedroom-deluxe-apartment',
    name: 'One Bedroom Deluxe Apartment',
    bedrooms: 1,
    maxAdults: 2,
    maxChildren: 0,
    maxOccupancy: 2,
    // Rack is the engine's standard (Early Booking) rate, confirmed at
    // USD 750 / 3 nights in December. `from` below is its Last Minute Deal
    // rate, so the strike-through shows a real reduction.
    rackPriceMinor: 250_00, // $250.00
    fromPriceMinor: 180_00, // $180.00 — engine's lowest (Last Minute Deal)
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
    // Standard rate, same $250 as the Deluxe (confirmed 2026-11-13).
    rackPriceMinor: 250_00, // $250.00
    fromPriceMinor: 188_00, // $188.00 — engine's lowest (Last Minute Deal)
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
    rackPriceMinor: 300_00, // $300.00
    fromPriceMinor: 216_00, // $216.00 — engine's lowest (Last Minute Deal)
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
    rackPriceMinor: 370_00, // $370.00
    fromPriceMinor: 260_00, // $260.00 — engine's lowest (Last Minute Deal)
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
    // Same $283 as the Three Bedroom Villa. This type is rarely in the
    // engine's listing (it had no availability when the other rates were
    // read), so the rack figure below is the one value here not taken from
    // the engine.
    rackPriceMinor: 420_00, // $420.00
    fromPriceMinor: 283_00, // $283.00
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
    rackPriceMinor: 420_00, // $420.00
    fromPriceMinor: 283_00, // $283.00 — engine's lowest (Last Minute Deal)
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
    rackPriceMinor: 540_00, // $540.00
    fromPriceMinor: 378_00, // $378.00 — engine's lowest (Last Minute Deal)
    shortDescription:
      'The pinnacle of the building, with some of the best views of the city.',
    description:
      'The Penthouse Apartment is a three bedroom suite accommodating up to five guests, with an '
      + 'outdoor balcony providing views across the city. Suited to long-stay executives and '
      + 'high-end travellers.',
    heroImage: '/media/penthouse-apartment.jpg',
    images: [
      'penthouse-apartment', 'penthouse-apartment-living',
      'penthouse-apartment-bedroom', 'penthouse-apartment-terrace',
    ],
    virtualTourSlug: null,
    sortOrder: 7,
    totalUnits: 2,
  },
];
