import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireUser, signOut } from '@/lib/auth';
import { ROLE_LABELS, can } from '@/lib/rbac';

export const metadata: Metadata = {
  title: 'Staff Portal | Speke Apartments Wampewo',
  robots: { index: false, follow: false },
};

// A session is read per request, so nothing here may be cached.
export const dynamic = 'force-dynamic';

/**
 * The gate for everything under /admin except the sign-in page.
 *
 * requireUser() redirects to /admin/login when there is no valid session, so
 * every page inside this route group is behind it by construction rather than
 * by each page remembering to check.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  async function endSession() {
    'use server';
    await signOut();
    redirect('/admin/login');
  }

  const nav = [
    { href: '/admin', label: 'Overview', allowed: true },
    { href: '/admin/crm', label: 'Enquiries', allowed: can(user.role, 'crm.view') },
    { href: '/admin/users', label: 'Users', allowed: can(user.role, 'users.manage') },
  ].filter((item) => item.allowed);

  return (
    <div className="min-h-screen bg-surface-page text-ink-primary flex flex-col">
      <header className="border-b border-hairline bg-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-4">
          <Link href="/admin" className="font-serif font-bold text-ink-primary">
            Staff Portal
          </Link>

          <nav className="flex items-center gap-1 text-[13px]">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-sunken transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-[13px]">
            <span className="text-ink-muted hidden sm:inline">
              {user.name} &middot; {ROLE_LABELS[user.role]}
            </span>
            <form action={endSession}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md border border-control text-ink-primary hover:bg-surface-sunken transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {user.mustChangePassword && (
        <p className="bg-brand-gold-tint text-ink-primary text-[13px] px-4 py-2 text-center">
          This account is still on its starter password. Change it before using
          the portal for live work.
        </p>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
