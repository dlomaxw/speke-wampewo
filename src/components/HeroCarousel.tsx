'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * The hero backdrop: five property photographs, cross-faded.
 *
 * All five stay mounted and are switched with opacity so there is no flash of
 * empty space between them. The first is `priority` because it is the page's
 * largest contentful paint; the rest load lazily.
 *
 * The photographs are darkened and carry a scrim, so the copy over them uses
 * ink-on-scrim, which does not flip with the theme.
 */
/**
 * Ordered to open on the building itself, then move inside.
 *
 * The filenames do not describe their contents — `hero-exterior` is the gym,
 * `hero-pool` is the building at dusk, `hero-living` is the colonnade. The alt
 * text below describes what each photograph actually shows, so do not infer
 * the subject from the path.
 */
const SLIDES = [
  { src: '/media/wampewo-hero-pool.png', alt: 'The apartment building and poolside terrace at dusk' },
  { src: '/media/wampewo-hero-living.png', alt: 'The stone colonnade walkway at dusk' },
  { src: '/media/wampewo-banner-01.jpg', alt: 'The reception lobby' },
  { src: '/media/wampewo-hero-bedroom.png', alt: 'A bedroom in one of the apartments' },
  { src: '/media/wampewo-hero-exterior.png', alt: 'The health club and gym' },
];

const INTERVAL_MS = 6000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) setPaused(true);
  }, []);

  // No point advancing while the tab is in the background.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden || reducedMotion.current);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);

  const go = useCallback((i: number) => {
    setIndex(i);
    // A deliberate choice should stick rather than be overridden a moment later.
    setPaused(true);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={i === index ? slide.alt : ''}
          aria-hidden={i !== index}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover brightness-[.85] transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* No scrim: nothing is written over these now, so the photographs are
          left to read. A touch of brightness is held back only so the dots
          stay visible on the lighter frames. */}

      {/* The dots sit on their own tinted pill, which keeps them legible
          whatever the photograph behind them is doing. */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3 py-2 rounded-pill bg-brand-espresso/45 backdrop-blur-sm">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show image ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index}
            className={`h-2.5 rounded-pill transition-all duration-300 ${
              i === index
                ? 'w-7 bg-brand-gold'
                : 'w-2.5 bg-ink-on-scrim/60 hover:bg-ink-on-scrim/90'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
