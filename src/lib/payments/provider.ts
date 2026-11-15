/**
 * Payment provider contract.
 *
 * Three rules hold for every implementation, because getting them wrong is how
 * hotels double-charge guests:
 *
 *  1. A browser redirect NEVER confirms a payment. `verify()` re-asks the
 *     provider, or a signed webhook tells us. The return URL only decides what
 *     the guest sees.
 *  2. Every charge carries our `idempotencyKey`. A retried request with the
 *     same key must reuse the existing charge, not create a second one.
 *  3. Webhooks are verified by signature before the payload is trusted, and
 *     recorded by provider event id so a redelivery is processed once.
 */

export type PaymentMethod =
  | 'card' | 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'pay_at_property';

export type PaymentStatus =
  | 'initiated' | 'pending' | 'succeeded' | 'failed' | 'cancelled'
  | 'refunded' | 'partially_refunded';

export interface CreateChargeInput {
  idempotencyKey: string;
  amountMinor: number;
  currency: string;
  method: PaymentMethod;
  bookingReference: string;
  customer: { name: string; email: string; phone?: string | null };
  description: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreateChargeResult {
  providerReference: string;
  status: PaymentStatus;
  /** Hosted page the guest is sent to. We never take card details ourselves. */
  checkoutUrl?: string;
  /** Provider-side instructions, e.g. bank details or a USSD prompt notice. */
  instructions?: string;
  settlementCurrency?: string;
  settlementAmountMinor?: number;
}

export interface VerifyResult {
  status: PaymentStatus;
  amountMinor: number;
  currency: string;
  providerReference: string;
  failureReason?: string;
  raw?: unknown;
}

export interface WebhookParseResult {
  /** False means: record it, do not act on it. */
  signatureValid: boolean;
  /** Stable per-notification id, for the (provider, eventId) unique index. */
  eventId: string;
  type: string;
  providerReference?: string;
  status?: PaymentStatus;
  amountMinor?: number;
  currency?: string;
  payload: unknown;
}

export interface RefundInput {
  providerReference: string;
  amountMinor: number;
  currency: string;
  reason: string;
  idempotencyKey: string;
}

export interface RefundResult {
  providerReference: string;
  status: 'pending' | 'succeeded' | 'failed';
  failureReason?: string;
}

export interface PaymentProvider {
  readonly key: string;
  readonly displayName: string;
  readonly supportedMethods: PaymentMethod[];
  /** False until real credentials are present; the UI says so rather than failing at checkout. */
  isConfigured(): boolean;
  createCharge(input: CreateChargeInput): Promise<CreateChargeResult>;
  verify(providerReference: string): Promise<VerifyResult>;
  parseWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookParseResult>;
  refund(input: RefundInput): Promise<RefundResult>;
}

export class PaymentError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'PaymentError';
  }
}
