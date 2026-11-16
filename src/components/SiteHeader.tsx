'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Site header.
 *
 * The links only fit beside the brand at large widths — at 820px the old
 * inline nav collided with the wordmark and broke "Offers & Specials" across
 * three lines — so the full row appears from `lg` and everything below that
 * gets a disclosure menu. Before, anything under `md` had no navigation at
 * all: the only link in the header was Book Direct.
 */

const LINKS = [
  { href: '/#apartments', label: 'Apartments' },
  { href: '/#facilities', label: 'Facilities' },
  { href: '/#offers', label: 'Offers & Specials' },
  { href: '/#amenities', label: 'Amenities' },
  { href: '/#location', label: 'Location' },
  { href: '/contact', label: 'Contact & Inquiries' },
];

export default function SiteHeader({ bookingUrl }: { bookingUrl: string }) {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Serena condenses its header once you leave the top of the page
  // (103px down to 66px). Same idea here: give the photographs more room
  // without taking the navigation away.
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes, and focus returns to the control that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !toggleRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-surface-page/95 backdrop-blur-md border-b border-brand-antique/20">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 transition-[height] duration-300 ${
          condensed ? 'h-16' : 'h-20'
        }`}
      >
        {/* min-w-0 + truncate so the brand gives way rather than pushing the
            row wider than the screen. */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-md overflow-hidden border border-brand-antique/40 shadow-inner shrink-0">
            <Image
              src="/media/speke-apartments-wampewo-logo-square.jpg"
              alt="Speke Apartments Wampewo"
              fill
              className="object-cover"
            />
          </div>
          <span className="min-w-0">
            {/* Letter-spacing is what pushed this to an ellipsis at 375px, so
                it only kicks in once there is room for it. */}
            <span className="block truncate text-[13px] tracking-normal sm:text-base sm:tracking-wider lg:text-lg font-serif font-bold text-brand-bronze-ink uppercase">
              Speke Apartments
            </span>
            {/* The locality line is the first thing to go when space is tight. */}
            <span className="hidden sm:block truncate text-[11px] tracking-[0.25em] text-ink-muted uppercase -mt-0.5">
              Wampewo &bull; Kololo
            </span>
          </span>
        </Link>

        {/* Full row only where it genuinely fits. */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm text-ink-secondary font-medium mx-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap hover:text-brand-bronze-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-bronze-deep text-ink-inverse font-semibold text-xs uppercase tracking-wider px-3.5 sm:px-5 py-2.5 rounded-md shadow-lg hover:brightness-110 transition-all whitespace-nowrap"
          >
            Book<span className="hidden sm:inline"> Direct</span>
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-control text-ink-primary hover:bg-surface-sunken transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Disclosure panel for everything below lg. */}
      <div
        id="site-menu"
        ref={panelRef}
        hidden={!open}
        className="lg:hidden border-t border-hairline bg-surface-raised shadow-md"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 border-b border-hairline last:border-b-0 text-ink-secondary hover:text-brand-bronze-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
