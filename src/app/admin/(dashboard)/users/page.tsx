import { asc } from 'drizzle-orm';

import { getDb } from '@/db';
import { users } from '@/db/schema';
import { requirePermission } from '@/lib/auth';
import { ROLE_LABELS, type Role } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

/**
 * Staff accounts.
 *
 * Read-only on purpose: creating and editing accounts touches password hashes
 * and role grants, and those belong behind their own reviewed flows rather
 * than being bolted on here. This shows who has access and flags the accounts
 * that need attention.
 */
export default async function UsersPage() {
  await requirePermission('users.manage');

  let rows: (typeof users.$inferSelect)[] = [];
  let loadError: string | null = null;

  try {
    const db = await getDb();
    rows = await db.select().from(users).orderBy(asc(users.name));
  } catch {
    // Most likely no DATABASE_URL in this environment.
    loadError = 'Could not read staff accounts. Check the database connection.';
  }

  const fmt = (d: Date | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : '—';

  return (
    <div className="space-y-6">
      <div>
        <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.25em] font-semibold">
          Platform
        </span>
        <h1 className="mt-2 text-3xl font-serif font-bold text-ink-primary">Staff accounts</h1>
        <p className="mt-2 text-ink-secondary text-sm">
          Who can sign in, and with which role.
        </p>
      </div>

      {loadError ? (
        <p className="bg-surface-raised border border-hairline rounded-xl p-6 text-sm text-ink-secondary">
          {loadError}
        </p>
      ) : (
        <div className="bg-surface-raised border border-hairline rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface-sunken text-ink-secondary">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Last sign-in'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-semibold uppercase tracking-[0.08em] text-[11px] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-hairline align-top">
                    <td className="px-4 py-3 text-ink-primary font-medium whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{u.email}</td>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">
                      {ROLE_LABELS[u.role as Role] ?? u.role}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={
                            u.active
                              ? 'text-[11px] px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : 'text-[11px] px-2 py-0.5 rounded-sm bg-surface-sunken text-ink-muted border border-hairline'
                          }
                        >
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                        {u.mustChangePassword && (
                          <span className="text-[11px] px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-300">
                            Starter password
                          </span>
                        )}
                        {u.lockedUntil && new Date(u.lockedUntil) > new Date() && (
                          <span className="text-[11px] px-2 py-0.5 rounded-sm bg-red-50 text-red-700 border border-red-300">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap tabular">
                      {fmt(u.lastLoginAt)}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                      No staff accounts yet. Run the seed to create the starter set.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
