'use client';

import { usePathname } from 'next/navigation';

/**
 * Shows its children on the guest-facing site and nowhere else.
 *
 * The root layout wraps every route, /admin included, and a "Chat with us"
 * bubble has no business sitting over the staff dashboard. The button itself
 * stays a server component and is passed in as a child, so src/lib/whatsapp.ts
 * — which imports node:crypto — is never pulled into the client bundle.
 */
export default function GuestChatSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
