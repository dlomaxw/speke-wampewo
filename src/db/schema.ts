/**
 * Speke Apartments Wampewo — database schema.
 *
 * Conventions used throughout:
 *  - Money is stored in minor units (integer cents) with an explicit currency
 *    column. Never floats: rate arithmetic has to reconcile with payments.
 *  - Dates that describe a stay (arrival/departure) are `date` columns, not
 *    timestamps. A booking for the 4th is the 4th in Kampala regardless of the
 *    server's clock.
 *  - Guest-facing commercial content carries a `verification` column. Nothing
 *    unverified may render in production; see src/lib/verification.ts.
 */
import {
  pgTable, text, integer, boolean, timestamp, date, jsonb,
  uniqueIndex, index, serial, primaryKey,
} from 'drizzle-orm/pg-core';

const id = () => text('id').primaryKey();
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

/** 'verified' content may render in production. Anything else may not. */
export const VERIFICATION = ['verified', 'unverified', 'missing'] as const;

/* ─────────────────────────── Staff, access control ─────────────────────── */

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),                   // see src/lib/rbac.ts
  phone: text('phone'),
  active: boolean('active').notNull().default(true),
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  mfaSecret: text('mfa_secret'),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('users_email_idx').on(t.email)]);

export const sessions = pgTable('sessions', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ip: text('ip'),
  userAgent: text('user_agent'),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: createdAt(),
}, (t) => [index('sessions_user_idx').on(t.userId)]);

/** Append-only. Every sensitive mutation lands here. */
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  actorId: text('actor_id'),
  actorEmail: text('actor_email'),
  action: text('action').notNull(),               // 'booking.cancel', 'refund.issue', ...
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  before: jsonb('before'),
  after: jsonb('after'),
  reason: text('reason'),
  ip: text('ip'),
  createdAt: createdAt(),
}, (t) => [index('audit_entity_idx').on(t.entity, t.entityId), index('audit_created_idx').on(t.createdAt)]);

/* ─────────────────────────── Property and departments ──────────────────── */

export const property = pgTable('property', {
  id: id(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  legalName: text('legal_name'),
  tagline: text('tagline'),
  description: text('description'),
  addressLine: text('address_line'),
  city: text('city'),
  country: text('country'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  mapEmbedUrl: text('map_embed_url'),
  checkInTime: text('check_in_time'),
  checkOutTime: text('check_out_time'),
  currency: text('currency').notNull().default('USD'),
  timezone: text('timezone').notNull().default('Africa/Kampala'),
  verification: text('verification').notNull().default('unverified'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('property_slug_idx').on(t.slug)]);

/**
 * Departments own their own contact routing. The brief is explicit that a
 * reservations button must never reach the spa, so every phone/email/WhatsApp
 * action on the site resolves through this table rather than a global constant.
 */
export const departments = pgTable('departments', {
  id: id(),
  key: text('key').notNull(),                     // 'reservations' | 'dining' | 'spa' | ...
  name: text('name').notNull(),
  description: text('description'),
  phone: text('phone'),
  phoneE164: text('phone_e164'),
  email: text('email'),
  whatsappE164: text('whatsapp_e164'),
  whatsappEnabled: boolean('whatsapp_enabled').notNull().default(false),
  hours: text('hours'),
  sortOrder: integer('sort_order').notNull().default(0),
  verification: text('verification').notNull().default('unverified'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('departments_key_idx').on(t.key)]);

/* ─────────────────────────── Accommodation ─────────────────────────────── */

export const amenities = pgTable('amenities', {
  id: id(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('in-apartment'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  verification: text('verification').notNull().default('unverified'),
}, (t) => [uniqueIndex('amenities_key_idx').on(t.key)]);

export const roomTypes = pgTable('room_types', {
  id: id(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  shortDescription: text('short_description'),
  description: text('description'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  maxAdults: integer('max_adults'),
  maxChildren: integer('max_children'),
  maxOccupancy: integer('max_occupancy'),
  sizeSqm: integer('size_sqm'),
  bedConfiguration: text('bed_configuration'),
  kitchenDetails: text('kitchen_details'),
  bathroomDetails: text('bathroom_details'),
  livingDetails: text('living_details'),
  accessibilityNotes: text('accessibility_notes'),
  floorplanUrl: text('floorplan_url'),
  virtualTourUrl: text('virtual_tour_url'),
  heroImage: text('hero_image'),
  /** Rates seen on the legacy site. Indicative only until Revenue confirms. */
  fromPriceMinor: integer('from_price_minor'),
  fromPriceCurrency: text('from_price_currency').default('USD'),
  totalUnits: integer('total_units').notNull().default(0),
  published: boolean('published').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  /** Per-field verification, so staff see exactly what is outstanding. */
  verification: text('verification').notNull().default('unverified'),
  verificationNotes: jsonb('verification_notes').$type<Record<string, string>>(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('room_types_slug_idx').on(t.slug)]);

export const roomTypeAmenities = pgTable('room_type_amenities', {
  roomTypeId: text('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  amenityId: text('amenity_id').notNull().references(() => amenities.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.roomTypeId, t.amenityId] })]);

export const roomTypeImages = pgTable('room_type_images', {
  id: id(),
  roomTypeId: text('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt').notNull().default(''),
  caption: text('caption'),
  width: integer('width'),
  height: integer('height'),
  sortOrder: integer('sort_order').notNull().default(0),
  verification: text('verification').notNull().default('unverified'),
}, (t) => [index('rt_images_rt_idx').on(t.roomTypeId)]);

/** Physical inventory. Availability is counted from these, never guessed. */
export const units = pgTable('units', {
  id: id(),
  roomTypeId: text('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  floor: text('floor'),
  status: text('status').notNull().default('active'),  // active | maintenance | out_of_service
  notes: text('notes'),
  createdAt: createdAt(),
}, (t) => [uniqueIndex('units_code_idx').on(t.code), index('units_rt_idx').on(t.roomTypeId)]);

/* ─────────────────────────── Rates and availability ────────────────────── */

export const cancellationPolicies = pgTable('cancellation_policies', {
  id: id(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  summary: text('summary').notNull(),
  /** Hours before check-in that a free cancellation is still possible. */
  freeCancelCutoffHours: integer('free_cancel_cutoff_hours'),
  /** Percent of total charged if cancelled inside the cutoff. */
  penaltyPercent: integer('penalty_percent').notNull().default(100),
  nonRefundable: boolean('non_refundable').notNull().default(false),
  /** Date changes inside the cutoff need staff approval rather than auto-apply. */
  amendmentRequiresApproval: boolean('amendment_requires_approval').notNull().default(true),
  verification: text('verification').notNull().default('unverified'),
}, (t) => [uniqueIndex('cancel_policies_code_idx').on(t.code)]);

export const ratePlans = pgTable('rate_plans', {
  id: id(),
  roomTypeId: text('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  currency: text('currency').notNull().default('USD'),
  baseRateMinor: integer('base_rate_minor').notNull(),
  /** Nights at or above this length select this plan; drives long-stay pricing. */
  minStay: integer('min_stay').notNull().default(1),
  maxStay: integer('max_stay'),
  includesBreakfast: boolean('includes_breakfast').notNull().default(false),
  cancellationPolicyId: text('cancellation_policy_id'),
  depositPercent: integer('deposit_percent').notNull().default(0),
  extraAdultMinor: integer('extra_adult_minor').notNull().default(0),
  extraChildMinor: integer('extra_child_minor').notNull().default(0),
  active: boolean('active').notNull().default(true),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('rate_plans_code_idx').on(t.code), index('rate_plans_rt_idx').on(t.roomTypeId)]);

/** Per-date overrides. A row wins over rate_plans.baseRateMinor for that date. */
export const rateCalendar = pgTable('rate_calendar', {
  id: serial('id').primaryKey(),
  ratePlanId: text('rate_plan_id').notNull().references(() => ratePlans.id, { onDelete: 'cascade' }),
  day: date('day').notNull(),
  rateMinor: integer('rate_minor'),
  minStay: integer('min_stay'),
  closed: boolean('closed').notNull().default(false),
  closedToArrival: boolean('closed_to_arrival').notNull().default(false),
  closedToDeparture: boolean('closed_to_departure').notNull().default(false),
}, (t) => [uniqueIndex('rate_cal_plan_day_idx').on(t.ratePlanId, t.day)]);

/** Per-date inventory override (e.g. 2 units block-booked by a corporate). */
export const availabilityOverrides = pgTable('availability_overrides', {
  id: serial('id').primaryKey(),
  roomTypeId: text('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  day: date('day').notNull(),
  unitsBlocked: integer('units_blocked').notNull().default(0),
  reason: text('reason'),
}, (t) => [uniqueIndex('avail_override_idx').on(t.roomTypeId, t.day)]);

/**
 * Short-lived claim on inventory while a guest completes checkout. Expired
 * holds are ignored by the availability query and swept by a cron; we never
 * rely on deletion having happened.
 */
export const inventoryHolds = pgTable('inventory_holds', {
  id: id(),
  roomTypeId: text('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  checkIn: date('check_in').notNull(),
  checkOut: date('check_out').notNull(),
  rooms: integer('rooms').notNull().default(1),
  sessionRef: text('session_ref').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedByBookingId: text('consumed_by_booking_id'),
  releasedAt: timestamp('released_at', { withTimezone: true }),
  createdAt: createdAt(),
}, (t) => [
  index('holds_rt_dates_idx').on(t.roomTypeId, t.checkIn, t.checkOut),
  index('holds_expiry_idx').on(t.expiresAt),
  uniqueIndex('holds_session_idx').on(t.sessionRef),
]);

/* ─────────────────────────── Extras and promotions ─────────────────────── */

export const extras = pgTable('extras', {
  id: id(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  priceMinor: integer('price_minor').notNull(),
  currency: text('currency').notNull().default('USD'),
  pricingMode: text('pricing_mode').notNull().default('per_stay'), // per_stay | per_night | per_person | per_person_night
  departmentKey: text('department_key'),
  taxable: boolean('taxable').notNull().default(true),
  active: boolean('active').notNull().default(false),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [uniqueIndex('extras_code_idx').on(t.code)]);

export const promoCodes = pgTable('promo_codes', {
  id: id(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  discountType: text('discount_type').notNull(),   // percent | fixed
  discountValue: integer('discount_value').notNull(),
  currency: text('currency').default('USD'),
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  stayFrom: date('stay_from'),
  stayTo: date('stay_to'),
  minNights: integer('min_nights').notNull().default(1),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  perGuestLimit: integer('per_guest_limit'),
  appliesToRoomTypeIds: jsonb('applies_to_room_type_ids').$type<string[]>(),
  active: boolean('active').notNull().default(false),
  createdBy: text('created_by'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('promo_code_idx').on(t.code)]);

export const taxes = pgTable('taxes', {
  id: id(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  /** Basis points, so 18% VAT = 1800. Avoids float rounding. */
  rateBps: integer('rate_bps').notNull(),
  appliesTo: text('applies_to').notNull().default('accommodation'),
  inclusive: boolean('inclusive').notNull().default(false),
  active: boolean('active').notNull().default(true),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [uniqueIndex('taxes_code_idx').on(t.code)]);

/* ─────────────────────────── Bookings ──────────────────────────────────── */

export const bookings = pgTable('bookings', {
  id: id(),
  reference: text('reference').notNull(),
  /**
   * request  — enquiry only, no inventory committed (BOOKING_MODE=request)
   * pending  — inventory held, awaiting payment
   * confirmed | cancelled | completed | no_show | expired | declined
   */
  status: text('status').notNull().default('pending'),
  mode: text('mode').notNull().default('request'),   // request | native | staah
  checkIn: date('check_in').notNull(),
  checkOut: date('check_out').notNull(),
  nights: integer('nights').notNull(),
  adults: integer('adults').notNull().default(1),
  children: integer('children').notNull().default(0),
  childAges: jsonb('child_ages').$type<number[]>(),
  rooms: integer('rooms').notNull().default(1),

  guestFirstName: text('guest_first_name').notNull(),
  guestLastName: text('guest_last_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone'),
  guestCountry: text('guest_country'),
  companyName: text('company_name'),
  specialRequests: text('special_requests'),

  currency: text('currency').notNull().default('USD'),
  accommodationMinor: integer('accommodation_minor').notNull().default(0),
  extrasMinor: integer('extras_minor').notNull().default(0),
  discountMinor: integer('discount_minor').notNull().default(0),
  taxMinor: integer('tax_minor').notNull().default(0),
  totalMinor: integer('total_minor').notNull().default(0),
  depositDueMinor: integer('deposit_due_minor').notNull().default(0),
  paidMinor: integer('paid_minor').notNull().default(0),
  refundedMinor: integer('refunded_minor').notNull().default(0),
  priceBreakdown: jsonb('price_breakdown'),

  promoCode: text('promo_code'),
  cancellationPolicyId: text('cancellation_policy_id'),
  cancellationSummary: text('cancellation_summary'),

  source: text('source').notNull().default('website'),
  utm: jsonb('utm').$type<Record<string, string>>(),
  /** Token for secure retrieval without an account. Hashed, never the raw value. */
  manageTokenHash: text('manage_token_hash'),
  manageTokenExpiresAt: timestamp('manage_token_expires_at', { withTimezone: true }),

  whatsappOptIn: boolean('whatsapp_opt_in').notNull().default(false),
  marketingOptIn: boolean('marketing_opt_in').notNull().default(false),

  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledReason: text('cancelled_reason'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  uniqueIndex('bookings_ref_idx').on(t.reference),
  index('bookings_status_idx').on(t.status),
  index('bookings_dates_idx').on(t.checkIn, t.checkOut),
  index('bookings_email_idx').on(t.guestEmail),
]);

export const bookingRooms = pgTable('booking_rooms', {
  id: id(),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  roomTypeId: text('room_type_id').notNull(),
  ratePlanId: text('rate_plan_id'),
  unitId: text('unit_id'),
  roomTypeName: text('room_type_name').notNull(),
  ratePlanName: text('rate_plan_name'),
  adults: integer('adults').notNull().default(1),
  children: integer('children').notNull().default(0),
  subtotalMinor: integer('subtotal_minor').notNull().default(0),
  nightly: jsonb('nightly').$type<{ day: string; rateMinor: number }[]>(),
}, (t) => [index('booking_rooms_booking_idx').on(t.bookingId)]);

export const bookingExtras = pgTable('booking_extras', {
  id: id(),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  extraId: text('extra_id'),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPriceMinor: integer('unit_price_minor').notNull().default(0),
  totalMinor: integer('total_minor').notNull().default(0),
}, (t) => [index('booking_extras_booking_idx').on(t.bookingId)]);

/** Every status transition, for dispute resolution and the state diagram. */
export const bookingEvents = pgTable('booking_events', {
  id: serial('id').primaryKey(),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  actor: text('actor').notNull().default('system'),
  note: text('note'),
  metadata: jsonb('metadata'),
  createdAt: createdAt(),
}, (t) => [index('booking_events_booking_idx').on(t.bookingId)]);

/** Guest-initiated change or cancellation that needs staff approval. */
export const bookingAmendments = pgTable('booking_amendments', {
  id: id(),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),                    // date_change | cancellation | guest_change
  status: text('status').notNull().default('pending'), // pending | approved | rejected | auto_applied
  requested: jsonb('requested'),
  policyOutcome: text('policy_outcome'),
  penaltyMinor: integer('penalty_minor').notNull().default(0),
  decidedBy: text('decided_by'),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  decisionNote: text('decision_note'),
  createdAt: createdAt(),
}, (t) => [index('amendments_booking_idx').on(t.bookingId)]);

/* ─────────────────────────── Payments ──────────────────────────────────── */

export const payments = pgTable('payments', {
  id: id(),
  bookingId: text('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  provider: text('provider').notNull(),            // sandbox | flutterwave | pesapal | bank_transfer
  method: text('method'),                          // card | mtn_momo | airtel_money | bank_transfer | pay_at_property
  /** Our reference sent to the provider; unique so a retry cannot double-charge. */
  idempotencyKey: text('idempotency_key').notNull(),
  providerReference: text('provider_reference'),
  /**
   * initiated | pending | succeeded | failed | cancelled | refunded
   * | partially_refunded. Only a verified provider notification may move a
   * payment to `succeeded` — never a browser redirect.
   */
  status: text('status').notNull().default('initiated'),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').notNull(),
  /** What the provider will actually settle, if different from display. */
  settlementCurrency: text('settlement_currency'),
  settlementAmountMinor: integer('settlement_amount_minor'),
  purpose: text('purpose').notNull().default('deposit'), // deposit | balance | full | incidental
  checkoutUrl: text('checkout_url'),
  failureReason: text('failure_reason'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  uniqueIndex('payments_idem_idx').on(t.idempotencyKey),
  index('payments_booking_idx').on(t.bookingId),
  index('payments_provider_ref_idx').on(t.provider, t.providerReference),
]);

/**
 * Raw provider notifications. Unique on (provider, eventId) so a redelivered
 * webhook is recorded once and processed once.
 */
export const paymentEvents = pgTable('payment_events', {
  id: serial('id').primaryKey(),
  provider: text('provider').notNull(),
  eventId: text('event_id').notNull(),
  paymentId: text('payment_id'),
  type: text('type'),
  signatureValid: boolean('signature_valid').notNull().default(false),
  processed: boolean('processed').notNull().default(false),
  processingError: text('processing_error'),
  payload: jsonb('payload'),
  receivedAt: createdAt(),
}, (t) => [uniqueIndex('payment_events_unique_idx').on(t.provider, t.eventId)]);

export const refunds = pgTable('refunds', {
  id: id(),
  paymentId: text('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  bookingId: text('booking_id'),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'),
  providerReference: text('provider_reference'),
  requestedBy: text('requested_by').notNull(),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: createdAt(),
}, (t) => [index('refunds_payment_idx').on(t.paymentId)]);

/* ─────────────────────────── CRM ───────────────────────────────────────── */

export const pipelines = pgTable('pipelines', {
  id: id(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  stages: jsonb('stages').$type<{ key: string; name: string; kind: 'open' | 'won' | 'lost' }[]>().notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [uniqueIndex('pipelines_key_idx').on(t.key)]);

export const companies = pgTable('companies', {
  id: id(),
  name: text('name').notNull(),
  industry: text('industry'),
  country: text('country'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  /** Negotiated rates are confidential: gated behind crm.rates.view. */
  negotiatedRateNotes: text('negotiated_rate_notes'),
  accountManagerId: text('account_manager_id'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index('companies_name_idx').on(t.name)]);

export const leads = pgTable('leads', {
  id: id(),
  reference: text('reference').notNull(),
  pipelineKey: text('pipeline_key').notNull().default('accommodation'),
  stage: text('stage').notNull().default('new'),
  /**
   * open | won | lost | unqualified — kept distinct from `stage` so reporting
   * never mixes a lost lead into completed-stay counts.
   */
  outcome: text('outcome').notNull().default('open'),
  lostReason: text('lost_reason'),

  enquiryType: text('enquiry_type').notNull(),     // contact | accommodation | long_stay | corporate | event | dining | spa | abandoned_booking
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  country: text('country'),
  companyId: text('company_id'),
  companyName: text('company_name'),

  checkIn: date('check_in'),
  checkOut: date('check_out'),
  adults: integer('adults'),
  children: integer('children'),
  preferredRoomTypeId: text('preferred_room_type_id'),
  message: text('message'),

  source: text('source').notNull().default('website'),
  sourceDetail: text('source_detail'),
  departmentKey: text('department_key').notNull().default('reservations'),
  utm: jsonb('utm').$type<Record<string, string>>(),

  assignedTo: text('assigned_to'),
  nextActionAt: timestamp('next_action_at', { withTimezone: true }),
  nextAction: text('next_action'),

  bookingId: text('booking_id'),
  /** SHA-256 of normalised email+phone+dates; catches resubmitted forms. */
  dedupeHash: text('dedupe_hash'),
  duplicateOfId: text('duplicate_of_id'),

  consentMarketing: boolean('consent_marketing').notNull().default(false),
  consentWhatsapp: boolean('consent_whatsapp').notNull().default(false),
  consentRecordedAt: timestamp('consent_recorded_at', { withTimezone: true }),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  uniqueIndex('leads_ref_idx').on(t.reference),
  index('leads_stage_idx').on(t.pipelineKey, t.stage),
  index('leads_assigned_idx').on(t.assignedTo),
  index('leads_dedupe_idx').on(t.dedupeHash),
  index('leads_created_idx').on(t.createdAt),
]);

export const leadActivities = pgTable('lead_activities', {
  id: serial('id').primaryKey(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),                    // note | call | email | whatsapp | stage_change | quote | system
  body: text('body'),
  actorId: text('actor_id'),
  actorName: text('actor_name'),
  metadata: jsonb('metadata'),
  createdAt: createdAt(),
}, (t) => [index('lead_activities_lead_idx').on(t.leadId)]);

export const leadTasks = pgTable('lead_tasks', {
  id: id(),
  leadId: text('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
  assignedTo: text('assigned_to'),
  status: text('status').notNull().default('open'), // open | done | cancelled
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdBy: text('created_by'),
  createdAt: createdAt(),
}, (t) => [index('lead_tasks_due_idx').on(t.status, t.dueAt), index('lead_tasks_lead_idx').on(t.leadId)]);

export const quotations = pgTable('quotations', {
  id: id(),
  reference: text('reference').notNull(),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  companyId: text('company_id'),
  status: text('status').notNull().default('draft'), // draft | sent | accepted | declined | expired
  currency: text('currency').notNull().default('USD'),
  subtotalMinor: integer('subtotal_minor').notNull().default(0),
  discountMinor: integer('discount_minor').notNull().default(0),
  taxMinor: integer('tax_minor').notNull().default(0),
  totalMinor: integer('total_minor').notNull().default(0),
  validUntil: date('valid_until'),
  notes: text('notes'),
  /** Set when the builder produced a figure outside approved rules. */
  requiresApproval: boolean('requires_approval').notNull().default(false),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdBy: text('created_by'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('quotations_ref_idx').on(t.reference)]);

export const quotationLines = pgTable('quotation_lines', {
  id: id(),
  quotationId: text('quotation_id').notNull().references(() => quotations.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPriceMinor: integer('unit_price_minor').notNull().default(0),
  totalMinor: integer('total_minor').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [index('quote_lines_quote_idx').on(t.quotationId)]);

/* ─────────────────────────── WhatsApp ──────────────────────────────────── */

export const whatsappContacts = pgTable('whatsapp_contacts', {
  id: id(),
  waId: text('wa_id').notNull(),
  displayName: text('display_name'),
  leadId: text('lead_id'),
  bookingId: text('booking_id'),
  optedIn: boolean('opted_in').notNull().default(false),
  optedInAt: timestamp('opted_in_at', { withTimezone: true }),
  optedOutAt: timestamp('opted_out_at', { withTimezone: true }),
  assignedTo: text('assigned_to'),
  /** True while a human has taken over; automations must not send. */
  humanTakeover: boolean('human_takeover').notNull().default(false),
  lastInboundAt: timestamp('last_inbound_at', { withTimezone: true }),
  createdAt: createdAt(),
}, (t) => [uniqueIndex('wa_contacts_waid_idx').on(t.waId)]);

export const whatsappMessages = pgTable('whatsapp_messages', {
  id: id(),
  contactId: text('contact_id').references(() => whatsappContacts.id, { onDelete: 'cascade' }),
  direction: text('direction').notNull(),          // inbound | outbound
  providerMessageId: text('provider_message_id'),
  templateName: text('template_name'),
  body: text('body'),
  status: text('status'),                          // queued | sent | delivered | read | failed
  failureReason: text('failure_reason'),
  /** Guards against a retried automation sending the same thing twice. */
  dedupeKey: text('dedupe_key'),
  sentBy: text('sent_by'),
  createdAt: createdAt(),
}, (t) => [
  index('wa_messages_contact_idx').on(t.contactId),
  uniqueIndex('wa_messages_dedupe_idx').on(t.dedupeKey),
]);

export const messageTemplates = pgTable('message_templates', {
  id: id(),
  key: text('key').notNull(),
  channel: text('channel').notNull(),              // email | whatsapp
  name: text('name').notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  /** WhatsApp templates must be approved by Meta before use. */
  providerTemplateName: text('provider_template_name'),
  approvalStatus: text('approval_status').notNull().default('draft'),
  active: boolean('active').notNull().default(false),
  updatedBy: text('updated_by'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('templates_key_channel_idx').on(t.key, t.channel)]);

export const outboundEmails = pgTable('outbound_emails', {
  id: id(),
  toEmail: text('to_email').notNull(),
  templateKey: text('template_key'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull().default('queued'),
  relatedEntity: text('related_entity'),
  relatedId: text('related_id'),
  dedupeKey: text('dedupe_key'),
  error: text('error'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: createdAt(),
}, (t) => [uniqueIndex('emails_dedupe_idx').on(t.dedupeKey)]);

/* ─────────────────────────── Content ───────────────────────────────────── */

export const pages = pgTable('pages', {
  id: id(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  /** Ordered blocks; the editor writes these, the renderer reads them. */
  blocks: jsonb('blocks').$type<Array<Record<string, unknown>>>(),
  heroImage: text('hero_image'),
  intro: text('intro'),
  departmentKey: text('department_key'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  ogImage: text('og_image'),
  noindex: boolean('noindex').notNull().default(false),
  published: boolean('published').notNull().default(false),
  verification: text('verification').notNull().default('unverified'),
  updatedBy: text('updated_by'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('pages_slug_idx').on(t.slug)]);

export const offers = pgTable('offers', {
  id: id(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull().default('accommodation'),
  summary: text('summary'),
  description: text('description'),
  inclusions: jsonb('inclusions').$type<string[]>(),
  terms: text('terms'),
  image: text('image'),
  promoCode: text('promo_code'),
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  bookByDate: date('book_by_date'),
  departmentKey: text('department_key'),
  published: boolean('published').notNull().default(false),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('offers_slug_idx').on(t.slug)]);

export const faqs = pgTable('faqs', {
  id: id(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull().default('general'),
  published: boolean('published').notNull().default(false),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const guides = pgTable('guides', {
  id: id(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  body: text('body'),
  image: text('image'),
  category: text('category').notNull().default('kampala'),
  published: boolean('published').notNull().default(false),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [uniqueIndex('guides_slug_idx').on(t.slug)]);

/** Distances to landmarks — "From Airport", "From City Center", etc. */
export const distances = pgTable('distances', {
  id: id(),
  label: text('label').notNull(),
  detail: text('detail').notNull(),
  minutes: integer('minutes'),
  kilometres: integer('kilometres'),
  sortOrder: integer('sort_order').notNull().default(0),
  verification: text('verification').notNull().default('unverified'),
});

/**
 * Only attributable reviews. There is no facility here to author a testimonial
 * without a named, dated, linkable source.
 */
export const testimonials = pgTable('testimonials', {
  id: id(),
  guestName: text('guest_name').notNull(),
  quote: text('quote').notNull(),
  rating: integer('rating'),
  stayDate: date('stay_date'),
  sourcePlatform: text('source_platform').notNull(),
  sourceUrl: text('source_url').notNull(),
  published: boolean('published').notNull().default(false),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const galleryImages = pgTable('gallery_images', {
  id: id(),
  url: text('url').notNull(),
  alt: text('alt').notNull().default(''),
  caption: text('caption'),
  category: text('category').notNull().default('property'),
  width: integer('width'),
  height: integer('height'),
  published: boolean('published').notNull().default(false),
  verification: text('verification').notNull().default('unverified'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [index('gallery_category_idx').on(t.category)]);

export const mediaAssets = pgTable('media_assets', {
  id: id(),
  url: text('url').notNull(),
  filename: text('filename').notNull(),
  alt: text('alt').notNull().default(''),
  mimeType: text('mime_type'),
  bytes: integer('bytes'),
  width: integer('width'),
  height: integer('height'),
  category: text('category'),
  sourceUrl: text('source_url'),
  uploadedBy: text('uploaded_by'),
  createdAt: createdAt(),
}, (t) => [index('media_category_idx').on(t.category)]);

/* ─────────────────────────── Platform ──────────────────────────────────── */

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value'),
  description: text('description'),
  /** Secrets never live here — this is for operational switches only. */
  updatedBy: text('updated_by'),
  updatedAt: updatedAt(),
});

export const redirects = pgTable('redirects', {
  id: serial('id').primaryKey(),
  fromPath: text('from_path').notNull(),
  toPath: text('to_path').notNull(),
  statusCode: integer('status_code').notNull().default(301),
  note: text('note'),
  hits: integer('hits').notNull().default(0),
  active: boolean('active').notNull().default(true),
}, (t) => [uniqueIndex('redirects_from_idx').on(t.fromPath)]);

/** First-party event log. Mirrors what is sent to analytics, for dedupe checks. */
export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sessionRef: text('session_ref'),
  path: text('path'),
  /** Unique per business event so a retry or double-fire is counted once. */
  dedupeKey: text('dedupe_key'),
  value: integer('value'),
  currency: text('currency'),
  utm: jsonb('utm').$type<Record<string, string>>(),
  metadata: jsonb('metadata'),
  createdAt: createdAt(),
}, (t) => [
  uniqueIndex('analytics_dedupe_idx').on(t.dedupeKey),
  index('analytics_name_idx').on(t.name, t.createdAt),
]);

export const consentRecords = pgTable('consent_records', {
  id: serial('id').primaryKey(),
  subjectEmail: text('subject_email'),
  subjectPhone: text('subject_phone'),
  channel: text('channel').notNull(),              // marketing_email | whatsapp | analytics
  granted: boolean('granted').notNull(),
  sourcePage: text('source_page'),
  ip: text('ip'),
  createdAt: createdAt(),
}, (t) => [index('consent_subject_idx').on(t.subjectEmail)]);

/** Per-IP/route counters backing the rate limiter. */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull().defaultNow(),
});
