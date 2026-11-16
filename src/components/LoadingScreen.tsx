'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Opening splash: the logo settles and a bronze rule draws beneath it.
 *
 * Rendered from the very first paint rather than switched on after mount —
 * deciding to show it in an effect would let the page paint for a frame
 * first, which reads as a flash of content followed by a splash.
 *
 * Two rules it has to obey, because a splash that misbehaves is worse than
 * no splash:
 *
 *  1. It always leaves. The page `load` event dismisses it, and a hard
 *     timeout dismisses it regardless, so a stalled image can never trap the
 *     site behind a blank screen.
 *  2. Without JavaScript it is never shown at all — the noscript rule below
 *     hides it, so it cannot become a permanent overlay.
 *
 * The root layout is not remounted by client-side navigation, so this runs
 * on a genuine page load and not when moving around the site.
 */
const MIN_SHOW_MS = 900;   // long enough to read as deliberate
const HARD_STOP_MS = 2500; // never hold the page longer than this
const FADE_MS = 450;

export default function LoadingScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      setLeaving(true);
      window.setTimeout(() => {
        setGone(true);
        document.body.style.overflow = '';
      }, FADE_MS);
    };

    const afterMinimum = window.setTimeout(() => {
      if (document.readyState === 'complete') finish();
      else window.addEventListener('load', finish, { once: true });
    }, MIN_SHOW_MS);

    const hardStop = window.setTimeout(finish, HARD_STOP_MS);

    return () => {
      window.clearTimeout(afterMinimum);
      window.clearTimeout(hardStop);
      window.removeEventListener('load', finish);
      document.body.style.overflow = '';
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <noscript>
        {/* No script, no splash: it would have nothing to dismiss it. */}
        <style>{`#speke-splash{display:none!important}`}</style>
      </noscript>

      <div
        id="speke-splash"
        // Decorative: the page behind it is the real content.
        aria-hidden="true"
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-surface-page transition-opacity ease-out ${
          leaving ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        <div className="speke-mark-in flex flex-col items-center">
          <Image
            src="/media/Speke-Apartments-Wampewo-Logo200x75.png"
            alt=""
            width={200}
            height={75}
            priority
            className="w-[180px] sm:w-[220px] h-auto"
          />
          <span className="mt-5 block h-px w-[180px] sm:w-[220px] overflow-hidden">
            <span className="speke-rule-draw block h-px w-full bg-brand-bronze-deep" />
          </span>
        </div>
      </div>
    </>
  );
}
