import Link from 'next/link';

import { requireUser } from '@/lib/auth';
import { ROLE_LABELS, ROLE_PERMISSIONS, can } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

/**
 * Portal overview.
 *
 * Shows the signed-in user what their role actually permits, taken from the
 * same ROLE_PERMISSIONS table the server enforces with — so this page cannot
 * drift from what is really allowed.
 */
export default async function AdminHome() {
  const user = await requireUser();
  const permissions = ROLE_PERMISSIONS[user.role] ?? [];

  const areas = [
    {
      href: '/admin/crm',
      title: 'Enquiries',
      body: 'Guest enquiries and the sales pipeline across every department.',
      allowed: can(user.role, 'crm.view'),
    },
    {
      href: '/admin/users',
      title: 'Users',
      body: 'Staff accounts, roles and access.',
      allowed: can(user.role, 'users.manage'),
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.25em] font-semibold">
          Signed in
        </span>
        <h1 className="mt-2 text-3xl font-serif font-bold text-ink-primary">
          {user.name}
        </h1>
        <p className="mt-2 text-ink-secondary text-sm">
          {ROLE_LABELS[user.role]} &middot; {user.email}
        </p>
      </div>

      <section>
        <h2 className="text-lg font-serif font-semibold text-ink-primary mb-4">
          Areas open to you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {areas.map((area) => (
            <div
              key={area.href}
              className="bg-surface-raised border border-hairline rounded-xl p-6"
            >
              <h3 className="font-serif font-semibold text-ink-primary">{area.title}</h3>
              <p className="mt-2 text-[13px] text-ink-secondary leading-relaxed">{area.body}</p>
              {area.allowed ? (
                <Link
                  href={area.href}
                  className="mt-4 inline-block text-brand-bronze-ink text-[13px] font-semibold uppercase tracking-[0.08em] hover:underline"
                >
                  Open &rarr;
                </Link>
              ) : (
                <p className="mt-4 text-[11px] text-ink-muted uppercase tracking-[0.08em]">
                  Not available to your role
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold text-ink-primary mb-4">
          What your role permits
        </h2>
        <div className="flex flex-wrap gap-2">
          {permissions.map((p) => (
            <span
              key={p}
              className="text-[11px] font-mono px-2 py-1 rounded-sm bg-surface-sunken border border-hairline text-ink-secondary"
            >
              {p}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-ink-muted">
          Read from the same table the server checks against, so it always
          matches what is actually enforced.
        </p>
      </section>
    </div>
  );
}
