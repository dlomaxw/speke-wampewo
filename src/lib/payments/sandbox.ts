import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type {
  CreateChargeInput, CreateChargeResult, PaymentProvider, RefundInput,
  RefundResult, VerifyResult, WebhookParseResult, PaymentMethod,
} from './provider';

/**
 * Fully working sandbox provider.
 *
 * This is not a stub: it issues a hosted checkout page, signs its webhooks with
 * the same HMAC scheme the real providers use, and honours idempotency. The
 * whole payment path — including signature rejection, replay handling and
 * refunds — is exercised end to end by the acceptance tests before any live
 * merchant account exists.
 *
 * Test instruments (chosen on the hosted page):
 *   success  → succeeds immediately
 *   pending  → stays pending, then a webhook settles it
 *   fail     → declines
 */

const store = new Map<string, {
  reference: string;
  idempotencyKey: string;
  amountMinor: number;
  currency: string;
  status: 'initiated' | 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  refundedMinor: number;
  failureReason?: string;
}>();

/** Idempotency: same key ⇒ same charge, never a second one. */
const byIdempotencyKey = new Map<string, string>();

export function sandboxSecret() {
  return process.env.SANDBOX_WEBHOOK_SECRET || 'sandbox-webhook-secret-change-me';
}

export function signSandboxPayload(body: string) {
  return createHmac('sha256', sandboxSecret()).update(body).digest('hex');
}

/** Exposed so the test-harness route can drive settlement like a real provider. */
export function sandboxSettle(reference: string, status: 'succeeded' | 'failed', reason?: string) {
  const rec = store.get(reference);
  if (!rec) return null;
  rec.status = status;
  if (reason) rec.failureReason = reason;
  return rec;
}

export function sandboxGet(reference: string) {
  return store.get(reference) ?? null;
}

export class SandboxProvider implements PaymentProvider {
  readonly key = 'sandbox';
  readonly displayName = 'Sandbox (test payments)';
  readonly supportedMethods: PaymentMethod[] = [
    'card', 'mtn_momo', 'airtel_money', 'bank_transfer', 'pay_at_property',
  ];

  isConfigured() { return true; }

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    const existingRef = byIdempotencyKey.get(input.idempotencyKey);
    if (existingRef) {
      const existing = store.get(existingRef)!;
      return {
        providerReference: existing.reference,
        status: existing.status,
        checkoutUrl: this.checkoutUrl(existing.reference, input),
      };
    }

    const reference = `sbx_${randomUUID().replace(/-/g, '').slice(0, 18)}`;
    store.set(reference, {
      reference,
      idempotencyKey: input.idempotencyKey,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: 'pending',
      refundedMinor: 0,
    });
    byIdempotencyKey.set(input.idempotencyKey, reference);

    // Bank transfer and pay-at-property settle off-line; there is no hosted page.
    if (input.method === 'bank_transfer' || input.method === 'pay_at_property') {
      return {
        providerReference: reference,
        status: 'pending',
        instructions: input.method === 'bank_transfer'
          ? 'Bank transfer instructions are issued by Finance once approved. This is sandbox data.'
          : 'Payment will be taken at the property on arrival, subject to management approval.',
      };
    }

    return {
      providerReference: reference,
      status: 'pending',
      checkoutUrl: this.checkoutUrl(reference, input),
    };
  }

  private checkoutUrl(reference: string, input: CreateChargeInput) {
    const p = new URLSearchParams({
      ref: reference,
      amount: String(input.amountMinor),
      currency: input.currency,
      method: input.method,
      booking: input.bookingReference,
      return: input.returnUrl,
      cancel: input.cancelUrl,
    });
    return `/sandbox/checkout?${p.toString()}`;
  }

  async verify(providerReference: string): Promise<VerifyResult> {
    const rec = store.get(providerReference);
    if (!rec) {
      return {
        status: 'failed', amountMinor: 0, currency: 'USD',
        providerReference, failureReason: 'Unknown reference.',
      };
    }
    return {
      status: rec.status,
      amountMinor: rec.amountMinor,
      currency: rec.currency,
      providerReference,
      failureReason: rec.failureReason,
      raw: { ...rec },
    };
  }

  async parseWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookParseResult> {
    const provided = headers['x-sandbox-signature'] || headers['X-Sandbox-Signature'] || '';
    const expected = signSandboxPayload(rawBody);

    let valid = false;
    try {
      const a = Buffer.from(provided, 'hex');
      const b = Buffer.from(expected, 'hex');
      valid = a.length === b.length && timingSafeEqual(a, b);
    } catch {
      valid = false;
    }

    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(rawBody); } catch { /* recorded as invalid below */ }

    return {
      signatureValid: valid,
      // Provider-assigned id. A redelivery carries the same one, which the
      // (provider, event_id) unique index turns into a no-op.
      eventId: String(payload.event_id || payload.id || 'unknown'),
      type: String(payload.type || 'payment.updated'),
      providerReference: payload.reference ? String(payload.reference) : undefined,
      status: payload.status as WebhookParseResult['status'],
      amountMinor: payload.amount_minor != null ? Number(payload.amount_minor) : undefined,
      currency: payload.currency ? String(payload.currency) : undefined,
      payload,
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const rec = store.get(input.providerReference);
    if (!rec) return { providerReference: '', status: 'failed', failureReason: 'Unknown reference.' };
    if (rec.status !== 'succeeded' && rec.status !== 'partially_refunded') {
      return { providerReference: '', status: 'failed', failureReason: 'Only a settled payment can be refunded.' };
    }
    const remaining = rec.amountMinor - rec.refundedMinor;
    if (input.amountMinor > remaining) {
      return { providerReference: '', status: 'failed', failureReason: 'Refund exceeds the remaining balance.' };
    }
    rec.refundedMinor += input.amountMinor;
    rec.status = rec.refundedMinor >= rec.amountMinor ? 'refunded' : 'partially_refunded';
    return { providerReference: `sbxrf_${randomUUID().replace(/-/g, '').slice(0, 16)}`, status: 'succeeded' };
  }
}

/** Test-only: clears in-memory state between runs. */
export function __resetSandbox() {
  store.clear();
  byIdempotencyKey.clear();
}
