/**
 * Loads the property's content and the starter staff accounts.
 *
 * Idempotent: every row uses a deterministic id, so re-running updates rather
 * than duplicating. Safe to run against an existing database.
 *
 *   npm run db:seed
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '../src/db';
import * as s from '../src/db/schema';
import { DEFAULT_SETTINGS, DEFAULT_TEMPLATES, PIPELINES } from '../src/lib/constants';
import {
  AMENITIES, CANCELLATION_POLICIES, DEPARTMENTS, DISTANCES, EXTRAS, FAQS,
  GUIDES, OFFERS, PAGES, PROPERTY, REDIRECTS, ROOM_TYPES, SOURCE, TAXES,
  VIRTUAL_TOURS,
} from './seed-content';

const ROOT = resolve(import.meta.dirname, '..');

/** Starter accounts. Every one must change its password at first sign-in. */
const STARTER_PASSWORD = process.env.SEED_PASSWORD || 'SpekeWampewo2026!';
const STAFF = [
  { email: 'it@spekegroup.com', name: 'System Administrator', role: 'system_admin' },
  { email: 'gm.wampewo@spekeapartments.com', name: 'Property Manager', role: 'property_manager' },
  { email: 'reservations@spekeapartments.com', name: 'Reservations Team', role: 'reservations' },
  { email: 'sales.wampewo@spekeapartments.com', name: 'Sales and CRM', role: 'sales_crm' },
  { email: 'marketing@spekegroup.com', name: 'Marketing', role: 'marketing' },
  { email: 'finance@spekegroup.com', name: 'Finance', role: 'finance' },
  { email: 'reports@spekegroup.com', name: 'Reporting (read only)', role: 'reporting' },
];

type MediaEntry = { url: string; filename: string; alt: string; group: string; width: number | null; height: number | null; bytes: number; sourceUrl: string };

function loadMedia(): MediaEntry[] {
  const p = join(ROOT, 'public', 'media', 'manifest.json');
  if (!existsSync(p)) {
    console.warn('No public/media/manifest.json — run `npm run media:build` first. Continuing without images.');
    return [];
  }
  return JSON.parse(readFileSync(p, 'utf8'));
}

async function upsert<T extends Record<string, unknown>>(
  db: Awaited<ReturnType<typeof getDb>>,
  table: never,
  idColumn: never,
  id: string,
  values: T,
) {
  // drizzle needs the concrete table type; the admin-style dynamic path is fine
  // here because the seed is a script, not request-handling code.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDb = db as any;
  const existing = await anyDb.select().from(table).where(eq(idColumn, id)).limit(1);
  if (existing.length > 0) {
    await anyDb.update(table).set(values).where(eq(idColumn, id));
  } else {
    await anyDb.insert(table).values({ ...values, id });
  }
}

async function main() {
  const db = await getDb();
  const media = loadMedia();
  const mediaByName = new Map(media.map((m) => [m.filename.replace(/\.[a-z]+$/i, ''), m]));

  console.log('Seeding Speke Apartments Wampewo');
  console.log(`Source: ${SOURCE}\n`);

  /* ── Staff ─────────────────────────────────────────────────────────────── */
  const passwordHash = await bcrypt.hash(STARTER_PASSWORD, 12);
  for (const person of STAFF) {
    const id = `usr_${person.role}`;
    const [existing] = await db.select().from(s.users).where(eq(s.users.id, id)).limit(1);
    if (existing) {
      // Never reset a password that a real person has already changed.
      await db.update(s.users)
        .set({ email: person.email, name: person.name, role: person.role, updatedAt: new Date() })
        .where(eq(s.users.id, id));
    } else {
      await db.insert(s.users).values({
        id, email: person.email, name: person.name, role: person.role,
        passwordHash, mustChangePassword: true, active: true,
      });
    }
  }
  console.log(`  ${STAFF.length} staff accounts`);

  /* ── Property and departments ──────────────────────────────────────────── */
  await upsert(db, s.property as never, s.property.id as never, 'prop_wampewo', {
    slug: PROPERTY.slug, name: PROPERTY.name, legalName: PROPERTY.legalName,
    tagline: PROPERTY.tagline, description: PROPERTY.description,
    addressLine: PROPERTY.addressLine, city: PROPERTY.city, country: PROPERTY.country,
    latitude: PROPERTY.latitude, longitude: PROPERTY.longitude, mapEmbedUrl: PROPERTY.mapEmbedUrl,
    checkInTime: PROPERTY.checkInTime, checkOutTime: PROPERTY.checkOutTime,
    currency: PROPERTY.currency, timezone: PROPERTY.timezone,
    verification: PROPERTY.verification, updatedAt: new Date(),
  });

  for (const d of DEPARTMENTS) {
    await upsert(db, s.departments as never, s.departments.id as never, `dept_${d.key}`, {
      key: d.key, name: d.name, description: d.description,
      phone: d.phone, phoneE164: d.phoneE164, email: d.email,
      whatsappE164: d.whatsappE164, whatsappEnabled: d.whatsappEnabled,
      hours: d.hours, sortOrder: d.sortOrder, verification: d.verification,
      updatedAt: new Date(),
    });
  }
  console.log(`  ${DEPARTMENTS.length} departments`);

  /* ── Amenities ─────────────────────────────────────────────────────────── */
  for (const a of AMENITIES) {
    await upsert(db, s.amenities as never, s.amenities.id as never, `amen_${a.key}`, {
      key: a.key, name: a.name, category: a.category,
      sortOrder: a.sortOrder, verification: a.verification,
    });
  }
  console.log(`  ${AMENITIES.length} amenities`);

  /* ── Cancellation policies, taxes, extras ──────────────────────────────── */
  for (const p of CANCELLATION_POLICIES) {
    await upsert(db, s.cancellationPolicies as never, s.cancellationPolicies.id as never, `cxl_${p.code}`, {
      code: p.code, name: p.name, summary: p.summary,
      freeCancelCutoffHours: p.freeCancelCutoffHours, penaltyPercent: p.penaltyPercent,
      nonRefundable: p.nonRefundable, amendmentRequiresApproval: p.amendmentRequiresApproval,
      // Specimen terms until Revenue supplies the property's actual policy.
      verification: 'unverified',
    });
  }
  for (const t of TAXES) {
    await upsert(db, s.taxes as never, s.taxes.id as never, `tax_${t.code}`, {
      code: t.code, name: t.name, rateBps: t.rateBps, appliesTo: t.appliesTo,
      inclusive: t.inclusive, active: t.active, verification: t.verification,
    });
  }
  for (const [i, e] of EXTRAS.entries()) {
    await upsert(db, s.extras as never, s.extras.id as never, `extra_${e.code}`, {
      code: e.code, name: e.name, description: e.description,
      priceMinor: e.priceMinor, currency: 'USD', pricingMode: e.pricingMode,
      departmentKey: e.departmentKey, taxable: true,
      active: false,               // only switched on once the property confirms
      verification: 'unverified', sortOrder: i,
    });
  }
  console.log(`  ${CANCELLATION_POLICIES.length} cancellation policies, ${TAXES.length} taxes, ${EXTRAS.length} extras (all inactive pending confirmation)`);

  /* ── Room types, images, amenities, units, rate plans ──────────────────── */
  const flexId = 'cxl_FLEX';
  const longStayId = 'cxl_LONGSTAY';

  for (const rt of ROOM_TYPES) {
    const id = `rt_${rt.slug}`;
    const tour = rt.virtualTourSlug
      ? VIRTUAL_TOURS.find((v) => v.slug === rt.virtualTourSlug)?.url ?? null
      : null;

    await upsert(db, s.roomTypes as never, s.roomTypes.id as never, id, {
      slug: rt.slug, name: rt.name,
      shortDescription: rt.shortDescription, description: rt.description,
      bedrooms: rt.bedrooms,
      bathrooms: null,                       // not published
      maxAdults: rt.maxAdults, maxChildren: rt.maxChildren, maxOccupancy: rt.maxOccupancy,
      sizeSqm: null,                         // not published
      bedConfiguration: 'bedConfiguration' in rt ? rt.bedConfiguration ?? null : null,
      kitchenDetails: 'Fully equipped kitchen with fridge, microwave, oven, kettle, toaster and dishwasher.',
      bathroomDetails: null,
      livingDetails: null,
      accessibilityNotes: null,              // requires a physical survey
      floorplanUrl: null,
      virtualTourUrl: tour,
      heroImage: rt.heroImage,
      fromPriceMinor: rt.fromPriceMinor,
      fromPriceCurrency: 'USD',
      totalUnits: rt.totalUnits,
      published: 'published' in rt ? rt.published !== false : true,
      sortOrder: rt.sortOrder,
      // Descriptive content is source-confirmed; the commercial and physical
      // details below are not, and the per-field notes say so.
      verification: 'verified',
      verificationNotes: {
        fromPrice: 'Rate transcribed from the legacy website. Revenue must confirm before publication.',
        sizeSqm: 'Apartment size is not published anywhere. Requires measurement.',
        bedConfiguration: 'bedConfiguration' in rt && rt.bedConfiguration
          ? 'Transcribed from the legacy website.'
          : 'Bed configuration is not published. Requires confirmation.',
        bathrooms: 'Bathroom count is not published. Requires confirmation.',
        maxChildren: 'Child occupancy is not published. Requires confirmation.',
        accessibility: 'No accessibility information published. Requires a physical survey.',
        ...('unresolved' in rt && rt.unresolved ? { inventory: rt.unresolved } : {}),
      },
      seoTitle: `${rt.name} | Speke Apartments Wampewo`,
      seoDescription: rt.shortDescription,
      updatedAt: new Date(),
    });

    // Images
    await db.delete(s.roomTypeImages).where(eq(s.roomTypeImages.roomTypeId, id));
    for (const [i, name] of rt.images.entries()) {
      const m = mediaByName.get(name);
      if (!m) continue;
      await db.insert(s.roomTypeImages).values({
        id: `rti_${rt.slug}_${i}`,
        roomTypeId: id, url: m.url, alt: m.alt,
        width: m.width, height: m.height, sortOrder: i,
        verification: 'verified',
      });
    }

    // Every apartment carries the full published amenity list.
    await db.delete(s.roomTypeAmenities).where(eq(s.roomTypeAmenities.roomTypeId, id));
    for (const a of AMENITIES) {
      await db.insert(s.roomTypeAmenities).values({ roomTypeId: id, amenityId: `amen_${a.key}` });
    }

    // Physical units, so availability is counted rather than guessed.
    for (let n = 1; n <= rt.totalUnits; n += 1) {
      const code = `${rt.slug.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}-${String(n).padStart(2, '0')}`;
      await upsert(db, s.units as never, s.units.id as never, `unit_${rt.slug}_${n}`, {
        roomTypeId: id, code, status: 'active',
        notes: 'Seeded placeholder. Replace with the actual unit schedule.',
      });
    }

    // Rate plans. Nightly and long-stay, both unverified specimen pricing.
    await upsert(db, s.ratePlans as never, s.ratePlans.id as never, `rp_${rt.slug}_std`, {
      roomTypeId: id, code: `${rt.slug}-STD`, name: 'Standard nightly rate',
      description: 'Flexible nightly rate with free cancellation up to 48 hours before arrival.',
      currency: 'USD', baseRateMinor: rt.fromPriceMinor,
      minStay: 1, maxStay: null, includesBreakfast: false,
      cancellationPolicyId: flexId, depositPercent: 30,
      extraAdultMinor: 0, extraChildMinor: 0,
      active: true, verification: 'unverified', sortOrder: 1, updatedAt: new Date(),
    });

    await upsert(db, s.ratePlans as never, s.ratePlans.id as never, `rp_${rt.slug}_long`, {
      roomTypeId: id, code: `${rt.slug}-LONG`, name: 'Long stay rate (7 nights or more)',
      description: 'Reduced nightly rate for stays of seven nights or more.',
      currency: 'USD',
      // Specimen 15% reduction so long-stay logic is exercised. Not a real rate.
      baseRateMinor: Math.round(rt.fromPriceMinor * 0.85),
      minStay: 7, maxStay: null, includesBreakfast: false,
      cancellationPolicyId: longStayId, depositPercent: 30,
      extraAdultMinor: 0, extraChildMinor: 0,
      active: true, verification: 'unverified', sortOrder: 2, updatedAt: new Date(),
    });
  }
  console.log(`  ${ROOM_TYPES.length} room types with images, units and rate plans`);

  /* ── Distances, FAQs, pages, guides, offers ────────────────────────────── */
  for (const d of DISTANCES) {
    await upsert(db, s.distances as never, s.distances.id as never, `dist_${d.key}`, {
      label: d.label, detail: d.detail, minutes: d.minutes, kilometres: d.kilometres,
      sortOrder: d.sortOrder, verification: d.verification,
    });
  }

  for (const [i, f] of FAQS.entries()) {
    await upsert(db, s.faqs as never, s.faqs.id as never, `faq_${i}`, {
      question: f.question, answer: f.answer, category: f.category,
      published: f.published, verification: f.verification, sortOrder: i,
    });
  }

  for (const p of PAGES) {
    await upsert(db, s.pages as never, s.pages.id as never, `page_${p.slug}`, {
      slug: p.slug, title: p.title, intro: p.intro, heroImage: p.heroImage,
      departmentKey: p.departmentKey, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
      published: p.published, verification: p.verification,
      blocks: [] as never, noindex: !p.published, updatedAt: new Date(),
    });
  }

  for (const [i, g] of GUIDES.entries()) {
    await upsert(db, s.guides as never, s.guides.id as never, `guide_${g.slug}`, {
      slug: g.slug, title: g.title, summary: g.summary, body: g.body,
      image: g.image, category: g.category, published: g.published,
      verification: g.verification, sortOrder: i,
    });
  }

  for (const [i, o] of OFFERS.entries()) {
    await upsert(db, s.offers as never, s.offers.id as never, `offer_${o.slug}`, {
      slug: o.slug, title: o.title, category: o.category, summary: o.summary,
      description: o.description, inclusions: o.inclusions as never, image: o.image,
      departmentKey: o.departmentKey, published: o.published,
      verification: o.verification, sortOrder: i, updatedAt: new Date(),
    });
  }
  console.log(`  ${DISTANCES.length} distances, ${FAQS.length} FAQs, ${PAGES.length} pages, ${GUIDES.length} guides, ${OFFERS.length} offers`);

  /* ── Gallery ───────────────────────────────────────────────────────────── */
  const galleryEntries = media.filter((m) => m.group.startsWith('gallery-') || m.group === 'facilities');
  for (const [i, m] of galleryEntries.entries()) {
    const category = m.group.replace('gallery-', '');
    await upsert(db, s.galleryImages as never, s.galleryImages.id as never, `gal_${m.filename.replace(/\.[a-z]+$/i, '')}`, {
      url: m.url, alt: m.alt, category,
      width: m.width, height: m.height,
      published: true, verification: 'verified', sortOrder: i,
    });
  }

  // Full media library record, so the dashboard can browse what exists.
  for (const m of media) {
    await upsert(db, s.mediaAssets as never, s.mediaAssets.id as never, `media_${m.filename.replace(/\.[a-z]+$/i, '')}`, {
      url: m.url, filename: m.filename, alt: m.alt, mimeType: null,
      bytes: m.bytes, width: m.width, height: m.height,
      category: m.group, sourceUrl: m.sourceUrl, uploadedBy: 'seed',
    });
  }
  console.log(`  ${galleryEntries.length} gallery images, ${media.length} media assets`);

  /* ── CRM pipelines ─────────────────────────────────────────────────────── */
  for (const [i, p] of Object.values(PIPELINES).entries()) {
    await upsert(db, s.pipelines as never, s.pipelines.id as never, `pipe_${p.key}`, {
      key: p.key, name: p.name, stages: p.stages as never, sortOrder: i,
    });
  }
  console.log(`  ${Object.keys(PIPELINES).length} CRM pipelines`);

  /* ── Message templates ─────────────────────────────────────────────────── */
  for (const t of DEFAULT_TEMPLATES) {
    await upsert(db, s.messageTemplates as never, s.messageTemplates.id as never, `tpl_${t.channel}_${t.key}`, {
      key: t.key, channel: t.channel, name: t.name,
      subject: t.subject, body: t.body,
      approvalStatus: 'approved', active: true, updatedAt: new Date(),
    });
  }

  // WhatsApp templates must be approved by Meta before they can be sent.
  const waTemplates = [
    { key: 'enquiry_ack', name: 'Enquiry acknowledgement', body: 'Hello {{1}}, thank you for contacting Speke Apartments Wampewo. Your reference is {{2}} and our team will reply shortly.' },
    { key: 'booking_confirmation', name: 'Booking confirmation', body: 'Hello {{1}}, your booking {{2}} at Speke Apartments Wampewo is confirmed for {{3}} to {{4}}.' },
    { key: 'payment_reminder', name: 'Payment reminder', body: 'Hello {{1}}, a balance of {{2}} is outstanding on booking {{3}}.' },
    { key: 'pre_arrival', name: 'Pre-arrival information', body: 'Hello {{1}}, we look forward to welcoming you on {{2}}. We are at Plot 19-21 Wampewo Avenue, Kololo, Kampala.' },
    { key: 'post_stay_feedback', name: 'Post-stay feedback', body: 'Hello {{1}}, thank you for staying with us. We would value your feedback.' },
  ];
  for (const t of waTemplates) {
    await upsert(db, s.messageTemplates as never, s.messageTemplates.id as never, `tpl_whatsapp_${t.key}`, {
      key: t.key, channel: 'whatsapp', name: t.name, subject: null, body: t.body,
      providerTemplateName: null,
      approvalStatus: 'draft',   // not submitted to Meta yet
      active: false, updatedAt: new Date(),
    });
  }
  console.log(`  ${DEFAULT_TEMPLATES.length} email templates, ${waTemplates.length} WhatsApp templates (draft)`);

  /* ── Redirects ─────────────────────────────────────────────────────────── */
  await db.delete(s.redirects);
  for (const r of REDIRECTS) {
    await db.insert(s.redirects).values({
      fromPath: r.from, toPath: r.to, statusCode: 301, note: r.note ?? null, active: true,
    });
  }
  console.log(`  ${REDIRECTS.length} SEO redirects`);

  /* ── Settings ──────────────────────────────────────────────────────────── */
  const [existingSettings] = await db.select().from(s.settings).where(eq(s.settings.key, 'app')).limit(1);
  if (!existingSettings) {
    await db.insert(s.settings).values({
      key: 'app',
      value: {
        ...DEFAULT_SETTINGS,
        // Observed on the live site. Recorded, NOT trusted: the brief says not
        // to reuse an unverified property id, so STAAH mode stays switched off
        // until someone confirms this is still the right property.
        staahPropertyId: '7557',
        staahBookingUrl: 'https://secure.staah.com/common-cgi/package/packagebooking.pl?propertyId=7557',
      } as never,
      description: 'Operational switches for the Wampewo site.',
      updatedBy: 'seed',
    });
  }

  console.log('\nDone.');
  console.log(`Sign in at /admin/login — starter password: ${STARTER_PASSWORD}`);
  console.log('Every account must change its password at first sign-in.\n');
  console.log('Booking mode is "request": no inventory is committed and nothing auto-confirms.');
  console.log('See docs/handover.md before switching it.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
