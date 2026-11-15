/**
 * Master catalog and pricing models for Speke Apartments Wampewo facilities:
 * 1. Heated Swimming Pool (Day Passes)
 * 2. Calabash Spa, Salon & Turkish Hammam
 * 3. Health Club & Gym
 * 4. La Cabana Restaurant (Table Reservations)
 */

export interface FacilityService {
  id: string;
  name: string;
  category: 'pool' | 'spa' | 'gym' | 'dining';
  description: string;
  priceMinor: number; // in minor units (e.g. 10_00 for $10.00)
  currency: 'USD' | 'UGX';
  duration?: string;
  badge?: string;
}

export const POOL_PASSES: FacilityService[] = [
  {
    id: 'pool_adult_day',
    name: 'Adult Day Pass',
    category: 'pool',
    description: 'Full day access to the heated outdoor swimming pool with towel service and lounger.',
    priceMinor: 10_00, // $10.00 (~UGX 37,000)
    currency: 'USD',
    badge: 'Popular',
  },
  {
    id: 'pool_child_day',
    name: 'Child Day Pass (Under 12)',
    category: 'pool',
    description: 'Day access for children accompanied by an adult, includes shallow pool area access.',
    priceMinor: 5_00, // $5.00 (~UGX 18,500)
    currency: 'USD',
  },
  {
    id: 'pool_family_weekend',
    name: 'Family Weekend Package',
    category: 'pool',
    description: 'Access for 2 adults and up to 2 children with reserved poolside sunbed set.',
    priceMinor: 25_00, // $25.00
    currency: 'USD',
    badge: 'Best Value',
  },
  {
    id: 'pool_monthly',
    name: 'Monthly Pool Membership',
    category: 'pool',
    description: 'Unlimited 30-day heated swimming pool access any day of the week.',
    priceMinor: 90_00, // $90.00
    currency: 'USD',
  },
];

export const SPA_TREATMENTS: FacilityService[] = [
  {
    id: 'spa_turkish_hammam',
    name: 'Authentic Turkish Hammam Ritual',
    category: 'spa',
    description: 'Traditional steam exfoliation with black olive soap, kessa mitt scrub, and soothing foam rinse.',
    priceMinor: 60_00,
    currency: 'USD',
    duration: '60 mins',
    badge: 'Signature',
  },
  {
    id: 'spa_deep_tissue',
    name: 'Deep Tissue Therapeutic Massage',
    category: 'spa',
    description: 'Targeted muscle tension release with aromatic organic botanicals and firm pressure.',
    priceMinor: 65_00,
    currency: 'USD',
    duration: '60 mins',
  },
  {
    id: 'spa_swedish_relax',
    name: 'Swedish Relaxation Massage',
    category: 'spa',
    description: 'Gentle long-stroke restorative massage promoting full-body circulation and tranquility.',
    priceMinor: 50_00,
    currency: 'USD',
    duration: '60 mins',
    badge: 'Relaxing',
  },
  {
    id: 'spa_calabash_glow',
    name: 'Calabash Signature Glow & Scrub',
    category: 'spa',
    description: 'Coffee-cacao body scrub followed by full-body nourishing butter massage and scalp treatment.',
    priceMinor: 80_00,
    currency: 'USD',
    duration: '90 mins',
  },
  {
    id: 'spa_salon_hair_nail',
    name: 'Executive Salon & Manicure/Pedicure',
    category: 'spa',
    description: 'Hair wash, blowout styling, and luxury spa manicure or pedicure with hand massage.',
    priceMinor: 30_00,
    currency: 'USD',
    duration: '45 mins',
  },
];

export const GYM_PASSES: FacilityService[] = [
  {
    id: 'gym_day_pass',
    name: 'Health Club Day Pass',
    category: 'gym',
    description: 'Full day access to cardio equipment, free weights, resistance machines, steam & sauna.',
    priceMinor: 15_00, // $15.00
    currency: 'USD',
    badge: 'Daily',
  },
  {
    id: 'gym_personal_training',
    name: '1-on-1 Personal Trainer Session',
    category: 'gym',
    description: '60-minute tailored fitness assessment and guided workout with a certified trainer.',
    priceMinor: 30_00,
    currency: 'USD',
    duration: '60 mins',
  },
  {
    id: 'gym_10_sessions',
    name: '10-Session Fitness Pass',
    category: 'gym',
    description: '10 flexible workout passes valid over 60 days with steam and sauna included.',
    priceMinor: 120_00,
    currency: 'USD',
    badge: 'Flexible',
  },
  {
    id: 'gym_monthly_unlimited',
    name: '1-Month Full Health Club Membership',
    category: 'gym',
    description: 'Unlimited daily access to the gym, steam room, sauna, lockers, and weekly fitness classes.',
    priceMinor: 150_00,
    currency: 'USD',
    badge: 'All-Inclusive',
  },
];

export const DINING_SEATING_AREAS = [
  { id: 'main_dining', name: 'Main Dining Hall (AC Indoor)' },
  { id: 'rodizio_lounge', name: 'Brazilian Rodizio Lounge' },
  { id: 'garden_terrace', name: 'Al Fresco Garden Terrace' },
  { id: 'poolside_pergola', name: 'Poolside Pergola & Cabana' },
];

export const SPA_TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
];

export const DINING_TIME_SLOTS = [
  '12:00 PM (Lunch)',
  '12:30 PM (Lunch)',
  '01:00 PM (Lunch)',
  '01:30 PM (Lunch)',
  '02:00 PM (Lunch)',
  '06:30 PM (Dinner)',
  '07:00 PM (Dinner)',
  '07:30 PM (Dinner)',
  '08:00 PM (Dinner)',
  '08:30 PM (Dinner)',
  '09:00 PM (Dinner)',
];

export const GYM_TIME_SLOTS = [
  'Morning Session (06:00 - 10:00)',
  'Midday Session (10:00 - 14:00)',
  'Afternoon Session (14:00 - 18:00)',
  'Evening Session (18:00 - 21:30)',
];

const REF_ALPHABET = 'ACDEFGHJKLMNPQRTUVWXY349';

function randomSuffix(len = 5) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return out;
}

export const facilityReference = (type: 'pool' | 'spa' | 'gym' | 'dining') => {
  switch (type) {
    case 'pool':
      return `POOL-${randomSuffix(6)}`;
    case 'spa':
      return `SPA-${randomSuffix(6)}`;
    case 'gym':
      return `GYM-${randomSuffix(6)}`;
    case 'dining':
      return `TAB-${randomSuffix(6)}`;
  }
};
