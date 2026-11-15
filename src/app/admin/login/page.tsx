import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession, signIn } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Staff sign in | Speke Apartments Wampewo',
  // Keep the portal out of search results.
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Sign-in for the staff portal.
 *
 * This page sits outside the (dashboard) route group deliberately: that
 * group's layout calls requireUser(), which redirects here, so gating this
 * page too would loop.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Already signed in? Nothing to do here.
  if (await getSession()) redirect('/admin');

  const params = await searchParams;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;

  async function authenticate(formData: FormData) {
    'use server';
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    const result = await signIn(email, password);
    if (!result.ok) {
      // The message is already generic — it never says whether the address
      // exists — so it is safe to show.
      redirect(`/admin/login?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/admin');
  }

  return (
    <main className="min-h-screen bg-surface-page text-ink-primary flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-brand-bronze-ink text-xs uppercase tracking-[0.25em] font-semibold">
            Speke Apartments Wampewo
          </span>
          <h1 className="mt-2 text-3xl font-serif font-bold text-ink-primary">
            Staff Portal
          </h1>
          <p className="mt-2 text-ink-muted text-sm">
            Sign in with your work address.
          </p>
        </div>

        <form
          action={authenticate}
          className="bg-surface-raised border border-hairline rounded-xl shadow-md p-6 space-y-4"
        >
          {errorParam && (
            <p
              role="alert"
              className="text-sm text-status-danger bg-red-50 border border-red-300 rounded px-3 py-2"
            >
              {errorParam}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-secondary"
            >
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full bg-surface-raised border border-control rounded-sm px-3 py-3 text-[15px] text-ink-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-secondary"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full bg-surface-raised border border-control rounded-sm px-3 py-3 text-[15px] text-ink-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-bronze-deep hover:bg-brand-bronze-ink text-ink-inverse font-bold text-[13px] uppercase tracking-[0.1em] py-3 rounded-md transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Authorised staff only. Sign-ins are recorded.
        </p>
      </div>
    </main>
  );
}
