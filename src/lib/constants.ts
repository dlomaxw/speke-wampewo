/**
 * Shared constants with no server-only dependencies.
 *
 * The seed script, the tests and client components all need these. Keeping them
 * out of the `server-only` modules means none of those have to import a module
 * that would refuse to load outside a server component.
 */

/* ─────────────────────────── CRM pipelines ─────────────────────────────── */

export const PIPELINES = {
  accommodation: {
    key: 'accommodation',
    name: 'Accommodation enquiries',
    stages: [
      { key: 'new', name: 'New enquiry', kind: 'open' as const },
      { key: 'contacted', name: 'Contacted', kind: 'open' as const },
      { key: 'availability_checked', name: 'Availability checked', kind: 'open' as const },
      { key: 'quotation_sent', name: 'Quotation sent', kind: 'open' as const },
      { key: 'follow_up', name: 'Follow-up', kind: 'open' as const },
      { key: 'confirmed', name: 'Confirmed booking', kind: 'won' as const },
      { key: 'completed', name: 'Completed stay', kind: 'won' as const },
    ],
  },
  corporate: {
    key: 'corporate',
    name: 'Corporate and long stay',
    stages: [
      { key: 'new', name: 'New enquiry', kind: 'open' as const },
      { key: 'qualified', name: 'Qualified', kind: 'open' as const },
      { key: 'site_visit', name: 'Site visit', kind: 'open' as const },
      { key: 'proposal_sent', name: 'Proposal sent', kind: 'open' as const },
      { key: 'negotiation', name: 'Negotiation', kind: 'open' as const },
      { key: 'agreement', name: 'Agreement signed', kind: 'won' as const },
    ],
  },
  events: {
    key: 'events',
    name: 'Meetings and events',
    stages: [
      { key: 'new', name: 'New enquiry', kind: 'open' as const },
      { key: 'contacted', name: 'Contacted', kind: 'open' as const },
      { key: 'proposal_sent', name: 'Proposal sent', kind: 'open' as const },
      { key: 'confirmed', name: 'Confirmed', kind: 'won' as const },
    ],
  },
  services: {
    key: 'services',
    name: 'Dining and spa requests',
    stages: [
      { key: 'new', name: 'New request', kind: 'open' as const },
      { key: 'contacted', name: 'Contacted', kind: 'open' as const },
      { key: 'booked', name: 'Booked', kind: 'won' as const },
    ],
  },
} as const;

export type PipelineKey = keyof typeof PIPELINES;

/**
 * Which team owns which enquiry. Wrong routing is the commonest cause of a lost
 * hospitality lead, so it is table-driven rather than decided per form.
 */
export const DEPARTMENT_FOR_ENQUIRY: Record<string, string> = {
  contact: 'reservations',
  accommodation: 'reservations',
  long_stay: 'reservations',
  corporate: 'sales',
  event: 'events',
  dining: 'dining',
  spa: 'spa',
  pool: 'health_club',
  gym: 'health_club',
  abandoned_booking: 'reservations',
};

export const PIPELINE_FOR_ENQUIRY: Record<string, PipelineKey> = {
  contact: 'accommodation',
  accommodation: 'accommodation',
  long_stay: 'corporate',
  corporate: 'corporate',
  event: 'events',
  dining: 'services',
  spa: 'services',
  pool: 'services',
  gym: 'services',
  abandoned_booking: 'accommodation',
};

export const ENQUIRY_TYPE_LABELS: Record<string, string> = {
  contact: 'General enquiry',
  accommodation: 'Accommodation enquiry',
  long_stay: 'Long stay enquiry',
  corporate: 'Corporate accommodation',
  event: 'Meetings and events',
  dining: 'La Cabana Dining',
  spa: 'Calabash Spa & Salon',
  pool: 'Heated Swimming Pool',
  gym: 'Health Club & Gym',
  abandoned_booking: 'Incomplete booking',
};

export const LOST_REASONS = [
  'Price', 'No availability', 'Booked elsewhere', 'Dates changed',
  'No response', 'Duplicate', 'Not a genuine enquiry', 'Other',
];

/* ─────────────────────────── Settings defaults ─────────────────────────── */

export interface AppSettings {
  /**
   * request — honest "Request Availability": no inventory is committed and
   *           nothing auto-confirms. The default, because STAAH is still
   *           selling the same rooms and a second live inventory would oversell.
   * native  — this application owns inventory, rates and confirmation.
   * staah   — hand the guest to the STAAH booking engine.
   */
  bookingMode: 'request' | 'native' | 'staah';
  /** Blocks unverified content from rendering. True in production. */
  enforceVerifiedContent: boolean;
  paymentsEnabled: boolean;
  paymentProvider: 'sandbox' | 'flutterwave' | 'pesapal';
  paymentMethods: string[];
  whatsappLevel: 'off' | 'click_to_chat' | 'business_platform';
  analyticsEnabled: boolean;
  staahPropertyId: string | null;
  staahBookingUrl: string | null;
  maintenanceBanner: string | null;
  /** Shown on staging so nobody mistakes it for the live site. */
  environmentLabel: string | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  bookingMode: 'request',
  enforceVerifiedContent: process.env.NODE_ENV === 'production',
  paymentsEnabled: false,
  paymentProvider: 'sandbox',
  paymentMethods: ['card', 'mtn_momo', 'airtel_money', 'bank_transfer'],
  whatsappLevel: 'click_to_chat',
  analyticsEnabled: false,
  staahPropertyId: null,
  staahBookingUrl: null,
  maintenanceBanner: null,
  environmentLabel: process.env.NODE_ENV === 'production' ? null : 'Staging',
};

/* ─────────────────────────── Message templates ─────────────────────────── */

export const DEFAULT_TEMPLATES = [
  {
    key: 'booking_confirmation',
    channel: 'email',
    name: 'Booking confirmation',
    subject: 'Your booking {{reference}} at Speke Apartments Wampewo',
    body: `<p>Dear {{firstName}},</p>
<p>Thank you for booking with Speke Apartments Wampewo.</p>
<p><strong>Booking reference:</strong> {{reference}}<br>
<strong>Apartment:</strong> {{roomType}}<br>
<strong>Arrival:</strong> {{checkIn}}<br>
<strong>Departure:</strong> {{checkOut}}<br>
<strong>Guests:</strong> {{guests}}<br>
<strong>Total:</strong> {{total}}</p>
<p>{{cancellationSummary}}</p>
<p>You can view or manage this booking at any time:<br>
<a href="{{manageUrl}}">{{manageUrl}}</a></p>
<p>Plot 19–21 Wampewo Avenue, Kololo, Kampala, Uganda<br>
Reservations: {{reservationsPhone}} · {{reservationsEmail}}</p>`,
  },
  {
    key: 'booking_request_received',
    channel: 'email',
    name: 'Availability request received',
    subject: 'We have your request {{reference}} — Speke Apartments Wampewo',
    body: `<p>Dear {{firstName}},</p>
<p>Thank you for your enquiry. <strong>This is not yet a confirmed booking.</strong>
Our reservations team is checking availability for your dates and will come back
to you with confirmation and a final price.</p>
<p><strong>Reference:</strong> {{reference}}<br>
<strong>Apartment requested:</strong> {{roomType}}<br>
<strong>Arrival:</strong> {{checkIn}}<br>
<strong>Departure:</strong> {{checkOut}}<br>
<strong>Guests:</strong> {{guests}}</p>
<p>Reservations: {{reservationsPhone}} · {{reservationsEmail}}</p>`,
  },
  {
    key: 'enquiry_acknowledgement',
    channel: 'email',
    name: 'Enquiry acknowledgement',
    subject: 'We have received your enquiry — Speke Apartments Wampewo',
    body: `<p>Dear {{firstName}},</p>
<p>Thank you for contacting Speke Apartments Wampewo. Your reference is
<strong>{{reference}}</strong> and a member of our {{department}} team will reply shortly.</p>
<p>Plot 19–21 Wampewo Avenue, Kololo, Kampala, Uganda</p>`,
  },
  {
    key: 'payment_receipt',
    channel: 'email',
    name: 'Payment receipt',
    subject: 'Receipt for booking {{reference}}',
    body: `<p>Dear {{firstName}},</p>
<p>We have received your payment of <strong>{{amount}}</strong> for booking
{{reference}}.</p>
<p><strong>Paid to date:</strong> {{paid}}<br>
<strong>Balance outstanding:</strong> {{balance}}</p>
<p>Speke Apartments Wampewo · Plot 19–21 Wampewo Avenue, Kololo, Kampala</p>`,
  },
  {
    key: 'cancellation_confirmation',
    channel: 'email',
    name: 'Cancellation confirmation',
    subject: 'Cancellation of booking {{reference}}',
    body: `<p>Dear {{firstName}},</p>
<p>Booking {{reference}} has been cancelled.</p>
<p>{{policyOutcome}}</p>
<p>If a refund is due it will be processed to the original payment method.</p>`,
  },
  {
    key: 'quotation_sent',
    channel: 'email',
    name: 'Quotation',
    subject: 'Your quotation {{reference}} — Speke Apartments Wampewo',
    body: `<p>Dear {{firstName}},</p>
<p>Please find your quotation below. It is valid until {{validUntil}}.</p>
{{lines}}
<p><strong>Total: {{total}}</strong></p>
<p>{{notes}}</p>`,
  },
] as const;

/* ─────────────────────────── Booking statuses ──────────────────────────── */

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  request: 'Availability requested',
  pending: 'Awaiting payment',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No show',
  expired: 'Expired',
  declined: 'Declined',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Credit or debit card',
  mtn_momo: 'MTN Mobile Money',
  airtel_money: 'Airtel Money',
  bank_transfer: 'Bank transfer',
  pay_at_property: 'Pay at the property',
};
