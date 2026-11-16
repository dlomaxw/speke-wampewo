'use client';

import { useRef, type ReactNode } from 'react';

/**
 * Horizontal card slider. Scroll-snap does the work, so native momentum,
 * trackpad and keyboard scrolling all keep working; the arrows are an extra
 * for pointer users and are hidden when everything already fits.
 */
export default function CardSlider({
  children,
  count,
  perView = 3,
  hint = 'Swipe for more',
}: {
  children: ReactNode;
  /** Number of cards, used to decide whether the controls are needed. */
  count: number;
  perView?: number;
  hint?: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gap = 32; // gap-8
    const step = card ? card.offsetWidth + gap : track.clientWidth;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  const overflows = count > perView;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {overflows && (
        <>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous"
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-6 w-11 h-11 items-center justify-center rounded-pill bg-surface-raised border border-brand-antique/50 text-brand-bronze-ink shadow-md hover:bg-brand-bronze-deep hover:text-ink-inverse hover:border-brand-bronze-deep transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next"
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-6 w-11 h-11 items-center justify-center rounded-pill bg-surface-raised border border-brand-antique/50 text-brand-bronze-ink shadow-md hover:bg-brand-bronze-deep hover:text-ink-inverse hover:border-brand-bronze-deep transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="mt-4 text-center text-[11px] text-ink-muted lg:hidden">{hint}</p>
        </>
      )}
    </div>
  );
}
