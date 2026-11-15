import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  CreateChargeInput, CreateChargeResult, PaymentMethod, PaymentProvider,
  RefundInput, RefundResult, VerifyResult, WebhookParseResult,
} from './provider';
import { PaymentError } from './provider';

/**
 * Flutterwave adapter — cards, MTN Mobile Money and Airtel Money in Uganda
 * through one merchant account, which is why it is the recommended provider
 * here.
 *
 * The code paths are real; what is missing is credentials. `isConfigured()`
 * returns false without them, and the checkout UI says the method is
 * unavailable rather than failing in front of a guest.
 *
 * ACTIVATION (see docs/integrations.md):
 *   FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_PUBLIC_KEY, FLUTTERWAVE_WEBHOOK_HASH
 * plus a Speke Group merchant account with settlement in the chosen currency.
 */

const API = 'https://api.flutterwave.com/v3';

export class FlutterwaveProvider implements PaymentProvider {
  readonly key = 'flutterwave';
  readonly displayName = 'Flutterwave';
  readonly supportedMethods: PaymentMethod[] = ['card', 'mtn_momo', 'airtel_money', 'bank_transfer'];

  isConfigured() {
    return Boolean(process.env.FLUTTERWAVE_SECRET_KEY && process.env.FLUTTERWAVE_WEBHOOK_HASH);
  }

  private secret() {
    const key = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!key) throw new PaymentError('not_configured', 'Flutterwave credentials are not configured.');
    return key;
  }

  /** Flutterwave names its mobile-money rails per network. */
  private paymentOptions(method: PaymentMethod) {
    switch (method) {
      case 'card': return 'card';
      case 'mtn_momo': return 'mobilemoneyuganda';
      case 'airtel_money': return 'mobilemoneyuganda';
      case 'bank_transfer': return 'banktransfer';
      default: return 'card';
    }
  }

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secret()}`,
        'Content-Type': 'application/json',
        // Flutterwave dedupes on tx_ref; the header is belt and braces.
        'Idempotency-Key': input.idempotencyKey,
      },
      body: JSON.stringify({
        tx_ref: input.idempotencyKey,
        amount: (input.amountMinor / 100).toFixed(2),
        currency: input.currency,
        redirect_url: input.returnUrl,
        payment_options: this.paymentOptions(input.method),
        customer: {
          email: input.customer.email,
          phonenumber: input.customer.phone ?? undefined,
          name: input.customer.name,
        },
        customizations: {
          title: 'Speke Apartments Wampewo',
          description: input.description,
        },
        meta: { ...input.metadata, booking_reference: input.bookingReference },
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.status !== 'success') {
      throw new PaymentError('charge_failed', body?.message || 'Could not start the payment.');
    }
    return {
      providerReference: input.idempotencyKey, // tx_ref is our handle until settlement
      status: 'pending',
      checkoutUrl: body.data?.link,
    };
  }

  async verify(providerReference: string): Promise<VerifyResult> {
    const res = await fetch(`${API}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(providerReference)}`, {
      headers: { Authorization: `Bearer ${this.secret()}` },
    });
    const body = await res.json().catch(() => ({}));
    const d = body?.data;
    if (!res.ok || !d) {
      return { status: 'failed', amountMinor: 0, currency: 'UGX', providerReference, failureReason: body?.message };
    }
    const map: Record<string, VerifyResult['status']> = {
      successful: 'succeeded', pending: 'pending', failed: 'failed', cancelled: 'cancelled',
    };
    return {
      status: map[String(d.status).toLowerCase()] ?? 'pending',
      amountMinor: Math.round(Number(d.amount) * 100),
      currency: String(d.currency),
      providerReference,
      failureReason: d.processor_response,
      raw: d,
    };
  }

  async parseWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookParseResult> {
    // Flutterwave sends a shared secret in `verif-hash` rather than an HMAC.
    const provided = headers['verif-hash'] || headers['Verif-Hash'] || '';
    const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH || '';
    let valid = false;
    if (provided && expected && provided.length === expected.length) {
      valid = timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
    }

    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(rawBody); } catch { /* invalid, recorded below */ }
    const data = (payload.data ?? {}) as Record<string, unknown>;

    const map: Record<string, WebhookParseResult['status']> = {
      successful: 'succeeded', pending: 'pending', failed: 'failed', cancelled: 'cancelled',
    };

    return {
      signatureValid: valid,
      eventId: String(data.id ?? payload.id ?? data.tx_ref ?? 'unknown'),
      type: String(payload.event ?? 'charge.completed'),
      providerReference: data.tx_ref ? String(data.tx_ref) : undefined,
      status: map[String(data.status ?? '').toLowerCase()],
      amountMinor: data.amount != null ? Math.round(Number(data.amount) * 100) : undefined,
      currency: data.currency ? String(data.currency) : undefined,
      payload,
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const verified = await this.verify(input.providerReference);
    const txId = (verified.raw as { id?: number } | undefined)?.id;
    if (!txId) return { providerReference: '', status: 'failed', failureReason: 'Transaction not found.' };

    const res = await fetch(`${API}/transactions/${txId}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.secret()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: (input.amountMinor / 100).toFixed(2) }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.status !== 'success') {
      return { providerReference: '', status: 'failed', failureReason: body?.message || 'Refund failed.' };
    }
    return { providerReference: String(body.data?.id ?? ''), status: 'succeeded' };
  }
}

/** Reserved for the HMAC scheme if Flutterwave migrates off `verif-hash`. */
export const hmacHex = (secret: string, body: string) =>
  createHmac('sha256', secret).update(body).digest('hex');
