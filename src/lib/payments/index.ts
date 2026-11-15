import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { bookingEvents, bookings, paymentEvents, payments, refunds } from '@/db/schema';
import { getSettings } from '../settings';
import { newId } from '../ids';
import { SandboxProvider } from './sandbox';
import { FlutterwaveProvider } from './flutterwave';
import type { PaymentMethod, PaymentProvider, PaymentStatus } from './provider';
import { PaymentError } from './provider';

export * from './provider';

const REGISTRY: Record<string, PaymentProvider> = {
  sandbox: new SandboxProvider(),
  flutterwave: new FlutterwaveProvider(),
};

export function getProvider(key?: string): PaymentProvider {
  const p = REGISTRY[key ?? 'sandbox'];
  if (!p) throw new PaymentError('unknown_provider', `No payment provider named ${key}.`);
  return p;
}

export async function activeProvider(): Promise<PaymentProvider> {
  const s = await getSettings();
  const p = getProvider(s.paymentProvider);
  // Fall back rather than break checkout if someone selects an unconfigured
  // provider; the admin settings screen flags this.
  if (!p.isConfigured()) return REGISTRY.sandbox;
  return p;
}

/**
 * Starts a payment for a booking.
 *
 * The idempotency key is derived from booking + purpose + attempt, so a guest
 * who double-taps "Pay" reuses the same charge instead of creating a second.
 */
export async function startPayment(params: {
  bookingId: string;
  method: PaymentMethod;
  purpose?: 'deposit' | 'balance' | 'full';
  returnUrl: string;
  cancelUrl: string;
}) {
  const db = await getDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.bookingId)).limit(1);
  if (!booking) throw new PaymentError('no_booking', 'Booking not found.');
  if (booking.status === 'cancelled') throw new PaymentError('cancelled', 'This booking has been cancelled.');

  const purpose = params.purpose ?? (booking.depositDueMinor > 0 ? 'deposit' : 'full');
  const amountMinor = purpose === 'deposit'
    ? booking.depositDueMinor
    : purpose === 'balance'
      ? Math.max(0, booking.totalMinor - booking.paidMinor)
      : booking.totalMinor;

  if (amountMinor <= 0) throw new PaymentError('nothing_due', 'There is nothing left to pay.');

  // Reuse an in-flight attempt instead of stacking charges.
  const existing = await db.select().from(payments)
    .where(and(eq(payments.bookingId, booking.id), eq(payments.purpose, purpose)));
  const live = existing.find((p) => p.status === 'initiated' || p.status === 'pending');
  if (live && live.checkoutUrl) {
    return { payment: live, checkoutUrl: live.checkoutUrl, reused: true };
  }

  const attempt = existing.length + 1;
  const idempotencyKey = `${booking.reference}-${purpose}-${attempt}`;
  const provider = await activeProvider();

  const id = newId('pay');
  await db.insert(payments).values({
    id,
    bookingId: booking.id,
    provider: provider.key,
    method: params.method,
    idempotencyKey,
    status: 'initiated',
    amountMinor,
    currency: booking.currency,
    purpose,
  });

  try {
    const charge = await provider.createCharge({
      idempotencyKey,
      amountMinor,
      currency: booking.currency,
      method: params.method,
      bookingReference: booking.reference,
      customer: {
        name: `${booking.guestFirstName} ${booking.guestLastName}`.trim(),
        email: booking.guestEmail,
        phone: booking.guestPhone,
      },
      description: `Speke Apartments Wampewo — booking ${booking.reference}`,
      returnUrl: params.returnUrl,
      cancelUrl: params.cancelUrl,
      metadata: { booking_id: booking.id },
    });

    const [updated] = await db.update(payments).set({
      providerReference: charge.providerReference,
      status: charge.status,
      checkoutUrl: charge.checkoutUrl ?? null,
      settlementCurrency: charge.settlementCurrency ?? null,
      settlementAmountMinor: charge.settlementAmountMinor ?? null,
      updatedAt: new Date(),
    }).where(eq(payments.id, id)).returning();

    return { payment: updated, checkoutUrl: charge.checkoutUrl, instructions: charge.instructions, reused: false };
  } catch (err) {
    await db.update(payments).set({
      status: 'failed',
      failureReason: err instanceof Error ? err.message : 'Unknown error',
      updatedAt: new Date(),
    }).where(eq(payments.id, id));
    throw err;
  }
}

/**
 * Applies a settled payment to its booking.
 *
 * Idempotent by design: it recomputes `paidMinor` from the payments table
 * rather than incrementing, so processing the same notification twice cannot
 * inflate the paid total.
 */
export async function reconcileBooking(bookingId: string) {
  const db = await getDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) return null;

  const rows = await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  const paid = rows
    .filter((p) => p.status === 'succeeded' || p.status === 'partially_refunded')
    .reduce((sum, p) => sum + p.amountMinor, 0);

  const refundRows = await db.select().from(refunds).where(eq(refunds.bookingId, bookingId));
  const refunded = refundRows
    .filter((r) => r.status === 'succeeded')
    .reduce((sum, r) => sum + r.amountMinor, 0);

  const netPaid = Math.max(0, paid - refunded);
  const enough = netPaid >= booking.depositDueMinor && netPaid > 0;

  const shouldConfirm = enough && booking.status === 'pending';
  await db.update(bookings).set({
    paidMinor: netPaid,
    refundedMinor: refunded,
    status: shouldConfirm ? 'confirmed' : booking.status,
    confirmedAt: shouldConfirm ? new Date() : booking.confirmedAt,
    updatedAt: new Date(),
  }).where(eq(bookings.id, bookingId));

  if (shouldConfirm) {
    await db.insert(bookingEvents).values({
      bookingId, fromStatus: booking.status, toStatus: 'confirmed',
      actor: 'system', note: 'Payment verified by provider notification.',
    });
  }

  return { paidMinor: netPaid, refundedMinor: refunded, confirmed: shouldConfirm };
}

/**
 * Single entry point for provider notifications.
 *
 * Order is deliberate:
 *   1. record the raw event (unique on provider+eventId, so a redelivery is a
 *      no-op rather than a second state change)
 *   2. reject unsigned payloads without acting on them
 *   3. re-verify with the provider — we never trust amounts from the body alone
 *   4. reconcile the booking
 */
export async function handleWebhook(providerKey: string, rawBody: string, headers: Record<string, string>) {
  const db = await getDb();
  const provider = getProvider(providerKey);
  const parsed = await provider.parseWebhook(rawBody, headers);

  // Step 1 — record. A duplicate insert throws on the unique index, which is
  // the signal that we have already handled this notification.
  try {
    await db.insert(paymentEvents).values({
      provider: providerKey,
      eventId: parsed.eventId,
      type: parsed.type,
      signatureValid: parsed.signatureValid,
      payload: parsed.payload as never,
    });
  } catch {
    return { ok: true, duplicate: true, message: 'Already processed.' };
  }

  // Step 2 — reject anything unsigned. Recorded above for investigation.
  if (!parsed.signatureValid) {
    await db.update(paymentEvents)
      .set({ processingError: 'Invalid signature' })
      .where(and(eq(paymentEvents.provider, providerKey), eq(paymentEvents.eventId, parsed.eventId)));
    return { ok: false, status: 401, message: 'Invalid signature.' };
  }

  if (!parsed.providerReference) {
    return { ok: false, status: 400, message: 'No payment reference in notification.' };
  }

  const [payment] = await db.select().from(payments)
    .where(and(eq(payments.provider, providerKey), eq(payments.providerReference, parsed.providerReference)))
    .limit(1);

  if (!payment) {
    await db.update(paymentEvents)
      .set({ processingError: 'No matching payment' })
      .where(and(eq(paymentEvents.provider, providerKey), eq(paymentEvents.eventId, parsed.eventId)));
    return { ok: false, status: 404, message: 'No matching payment.' };
  }

  // Step 3 — ask the provider directly. The webhook body tells us *when* to
  // look, never *what is true*.
  const verified = await provider.verify(parsed.providerReference);

  // Guard against a mismatched amount, which would indicate tampering or a
  // provider-side change we must not silently accept.
  if (verified.status === 'succeeded' && verified.amountMinor !== payment.amountMinor) {
    await db.update(payments).set({
      status: 'pending',
      failureReason: `Amount mismatch: expected ${payment.amountMinor}, provider reported ${verified.amountMinor}.`,
      updatedAt: new Date(),
    }).where(eq(payments.id, payment.id));
    await db.update(paymentEvents)
      .set({ processingError: 'Amount mismatch — held for finance review' })
      .where(and(eq(paymentEvents.provider, providerKey), eq(paymentEvents.eventId, parsed.eventId)));
    return { ok: false, status: 409, message: 'Amount mismatch. Held for review.' };
  }

  await db.update(payments).set({
    status: verified.status,
    failureReason: verified.failureReason ?? null,
    verifiedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(payments.id, payment.id));

  // Step 4 — reconcile.
  if (payment.bookingId) await reconcileBooking(payment.bookingId);

  await db.update(paymentEvents)
    .set({ processed: true, paymentId: payment.id })
    .where(and(eq(paymentEvents.provider, providerKey), eq(paymentEvents.eventId, parsed.eventId)));

  return { ok: true, status: verified.status };
}

/**
 * Re-checks a payment with the provider. Used by the return page (which must
 * never confirm on its own) and by the finance reconciliation screen.
 */
export async function refreshPayment(paymentId: string) {
  const db = await getDb();
  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!payment?.providerReference) return null;

  const provider = getProvider(payment.provider);
  const verified = await provider.verify(payment.providerReference);

  await db.update(payments).set({
    status: verified.status,
    failureReason: verified.failureReason ?? null,
    verifiedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(payments.id, paymentId));

  if (payment.bookingId) await reconcileBooking(payment.bookingId);
  return verified;
}

/** Refunds are restricted to finance and always carry a recorded reason. */
export async function issueRefund(params: {
  paymentId: string;
  amountMinor: number;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
}) {
  const db = await getDb();
  const [payment] = await db.select().from(payments).where(eq(payments.id, params.paymentId)).limit(1);
  if (!payment) throw new PaymentError('no_payment', 'Payment not found.');
  if (payment.status !== 'succeeded' && payment.status !== 'partially_refunded') {
    throw new PaymentError('not_settled', 'Only a settled payment can be refunded.');
  }

  const already = await db.select().from(refunds).where(eq(refunds.paymentId, params.paymentId));
  const refundedSoFar = already
    .filter((r) => r.status === 'succeeded')
    .reduce((s, r) => s + r.amountMinor, 0);
  if (params.amountMinor > payment.amountMinor - refundedSoFar) {
    throw new PaymentError('too_large', 'Refund exceeds the remaining balance.');
  }

  const id = newId('rfnd');
  await db.insert(refunds).values({
    id,
    paymentId: payment.id,
    bookingId: payment.bookingId,
    amountMinor: params.amountMinor,
    currency: payment.currency,
    reason: params.reason,
    status: 'pending',
    requestedBy: params.requestedBy,
    approvedBy: params.approvedBy ?? null,
    approvedAt: params.approvedBy ? new Date() : null,
  });

  const provider = getProvider(payment.provider);
  const result = await provider.refund({
    providerReference: payment.providerReference!,
    amountMinor: params.amountMinor,
    currency: payment.currency,
    reason: params.reason,
    idempotencyKey: `${payment.idempotencyKey}-refund-${already.length + 1}`,
  });

  await db.update(refunds).set({
    status: result.status === 'succeeded' ? 'succeeded' : result.status,
    providerReference: result.providerReference || null,
  }).where(eq(refunds.id, id));

  if (result.status === 'succeeded') {
    const total = refundedSoFar + params.amountMinor;
    await db.update(payments).set({
      status: total >= payment.amountMinor ? 'refunded' : 'partially_refunded',
      updatedAt: new Date(),
    }).where(eq(payments.id, payment.id));
    if (payment.bookingId) await reconcileBooking(payment.bookingId);
  }

  return { id, status: result.status, failureReason: result.failureReason };
}

/**
 * Recovery sweep for the case the brief calls out: money took, booking did not
 * finish. Finds settled payments whose booking is still unconfirmed and
 * reconciles them, so a guest is never charged for a reservation they do not
 * hold.
 */
export async function recoverOrphanedPayments() {
  const db = await getDb();
  const rows = await db.select({ bookingId: payments.bookingId })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(and(
      eq(payments.status, 'succeeded'),
      sql`${bookings.status} in ('pending','expired')`,
    ));

  const seen = new Set<string>();
  const recovered: string[] = [];
  for (const r of rows) {
    if (!r.bookingId || seen.has(r.bookingId)) continue;
    seen.add(r.bookingId);
    const res = await reconcileBooking(r.bookingId);
    if (res?.confirmed) recovered.push(r.bookingId);
  }
  return recovered;
}

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'initiated', 'pending', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded',
];
