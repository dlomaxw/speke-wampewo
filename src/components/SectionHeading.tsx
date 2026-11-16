import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Section opener, following the arrangement used across serenahotels.com:
 * a centred serif title at regular weight, a small letterspaced caps subtitle
 * beneath it, then an optional line of description and an outline link.
 *
 * Serena sets its titles in Playfair at 400 rather than bold — the restraint
 * is the point, so this does not use font-bold.
 */
export default function SectionHeading({
  title,
  subtitle,
  children,
  action,
  as: Tag = 'h2',
  tone = 'light',
}: {
  title: string;
  /** Small caps line under the title. */
  subtitle?: string;
  /** Optional sentence under the subtitle. */
  children?: ReactNode;
  /** Outline link, as Serena puts "All Offers" beneath a heading. */
  action?: { href: string; label: string };
  as?: 'h1' | 'h2' | 'h3';
  tone?: 'light' | 'dark';
}) {
  const titleColor = tone === 'dark' ? 'text-ink-on-scrim' : 'text-ink-primary';
  const subColor = tone === 'dark' ? 'text-ink-on-scrim/70' : 'text-ink-muted';

  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <Tag
        className={`font-serif font-normal text-[28px] sm:text-[34px] lg:text-[38px] leading-[1.2] ${titleColor}`}
      >
        {title}
      </Tag>

      {subtitle && (
        <p
          className={`mt-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] ${subColor}`}
        >
          {subtitle}
        </p>
      )}

      {children && (
        <p className={`mt-4 text-sm leading-relaxed ${subColor}`}>{children}</p>
      )}

      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-block border border-brand-antique/60 text-brand-bronze-ink text-[13px] px-6 py-2.5 rounded-md hover:bg-brand-bronze-deep hover:text-ink-inverse hover:border-brand-bronze-deep transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
