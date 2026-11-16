/**
 * Class for each card inside a CardSlider: three in view on desktop, two on
 * tablet, one on a phone. The calc values subtract the gap-8 gutters so the
 * cards fill the track exactly rather than half-peeking.
 *
 * This lives in a plain module, not in CardSlider itself. CardSlider is a
 * `'use client'` component, and a server component importing a value from a
 * client module gets a client-reference stub rather than the string — which
 * lands in the DOM as a broken class attribute.
 */
export const SLIDER_CARD =
  'snap-start shrink-0 basis-full sm:basis-[calc((100%-2rem)/2)] lg:basis-[calc((100%-4rem)/3)]';

/** Two in view from `sm`, one on a phone. Same gap arithmetic. */
export const SLIDER_CARD_2 =
  'snap-start shrink-0 basis-full sm:basis-[calc((100%-2rem)/2)]';

/**
 * Four in view at `lg`, three at `sm`, two on a phone — for small tiles that
 * would look lost at card width.
 */
export const SLIDER_CARD_4 =
  'snap-start shrink-0 basis-[calc((100%-2rem)/2)] sm:basis-[calc((100%-4rem)/3)] lg:basis-[calc((100%-6rem)/4)]';
