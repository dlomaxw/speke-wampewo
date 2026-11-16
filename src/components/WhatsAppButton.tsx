import { clickToChatUrl, CHAT_MESSAGES } from '@/lib/whatsapp';

/**
 * Floating click-to-chat button.
 *
 * This is level 1 of the two levels described in src/lib/whatsapp.ts: it opens
 * the guest's own WhatsApp with a prefilled message. Nothing reaches our
 * server and nothing is recorded in the CRM, so the label promises a chat and
 * nothing more — no "we'll get back to you", no delivery claim.
 *
 * A plain anchor, so it needs no client JavaScript and is present even if
 * hydration never happens.
 *
 * Green rather than bronze on purpose: here the colour is the platform's
 * signature and is what makes the control recognisable at a glance. It is the
 * one place in the site that steps outside the palette.
 */

/** Front desk. The same number the header's WhatsApp Desk link uses. */
const DESK_PHONE = '+256200555000';

export default function WhatsAppButton() {
  return (
    <a
      href={clickToChatUrl(DESK_PHONE, CHAT_MESSAGES.general())}
      target="_blank"
      rel="noopener noreferrer"
      // Named for screen readers, and the new tab is announced rather than
      // sprung on anyone.
      aria-label="Chat with the Speke Apartments Wampewo front desk on WhatsApp (opens in a new tab)"
      title="Chat on WhatsApp"
      // Under the header (z-50) and well under the opening splash (z-100).
      className="group fixed right-5 z-40 flex items-center gap-0 rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:gap-2 hover:bg-[#1da851] hover:shadow-xl focus-visible:gap-2"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 56px is the standard floating-action target and clears the 44px
          minimum comfortably on a phone. */}
      <span className="flex h-14 w-14 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-current"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
        </svg>
      </span>

      {/* The label grows out of the circle on hover and focus. It collapses to
          nothing rather than being hidden, so the button stays a plain circle
          at rest and nothing reflows the page. Touch devices never hover, so
          they simply get the circle. */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-semibold tracking-wide transition-all duration-300 group-hover:max-w-[12rem] group-hover:pr-5 group-focus-visible:max-w-[12rem] group-focus-visible:pr-5">
        Chat with us
      </span>
    </a>
  );
}
