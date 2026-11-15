/**
 * Content verification gate.
 *
 * The brief is firm on this: nothing unconfirmed may appear on the production
 * website, but staging must show staff exactly what is outstanding. So every
 * piece of guest-facing commercial content carries a `verification` column and
 * passes through here before it renders.
 *
 * The rule is deliberately fail-closed: an unknown value is treated as
 * unverified, never as verified.
 */

export type Verification = 'verified' | 'unverified' | 'missing';

export interface VerifiableRecord {
  verification?: string | null;
}

export function normalise(value: unknown): Verification {
  return value === 'verified' ? 'verified' : value === 'missing' ? 'missing' : 'unverified';
}

export const isVerified = (r: VerifiableRecord | null | undefined) =>
  normalise(r?.verification) === 'verified';

/**
 * Filters a list for public rendering.
 *  - production: only verified rows survive
 *  - staging:    everything survives, and the UI badges what is unverified
 */
export function gate<T extends VerifiableRecord>(rows: T[], enforce: boolean): T[] {
  if (!enforce) return rows;
  return rows.filter((r) => isVerified(r));
}

/** Single-record variant; returns null when production must not show it. */
export function gateOne<T extends VerifiableRecord>(row: T | null | undefined, enforce: boolean): T | null {
  if (!row) return null;
  if (!enforce) return row;
  return isVerified(row) ? row : null;
}

/**
 * Whether a specific value may be shown. Used for fields that are individually
 * unconfirmed on an otherwise-verified record — a rate, say, or an apartment
 * size nobody has measured.
 */
export function showValue<T>(value: T | null | undefined, verification: unknown, enforce: boolean): T | null {
  if (value == null) return null;
  if (!enforce) return value;
  return normalise(verification) === 'verified' ? value : null;
}

export interface OutstandingItem {
  entity: string;
  label: string;
  field?: string;
  note: string;
}

/**
 * Rolls up what is still unconfirmed, for the dashboard's readiness panel and
 * for docs/content-checklist.md. Staff should never have to guess what blocks
 * launch.
 */
export function summariseOutstanding(groups: Array<{
  entity: string;
  rows: Array<VerifiableRecord & { id?: string; name?: string | null; title?: string | null; slug?: string | null }>;
  note: string;
}>): OutstandingItem[] {
  const out: OutstandingItem[] = [];
  for (const g of groups) {
    for (const row of g.rows) {
      const v = normalise(row.verification);
      if (v === 'verified') continue;
      out.push({
        entity: g.entity,
        label: row.name || row.title || row.slug || row.id || '(untitled)',
        note: v === 'missing' ? 'Information not supplied' : g.note,
      });
    }
  }
  return out;
}
