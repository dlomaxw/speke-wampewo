import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Speke Apartments Wampewo | Luxury Serviced Apartments in Kololo, Kampala',
  description:
    'Spacious serviced luxury apartments for short stays, extended stays and corporate guests overlooking Kampala from Wampewo Avenue, Kololo.',
  keywords: [
    'Speke Apartments Wampewo',
    'Kampala serviced apartments',
    'Kololo accommodation',
    'Luxury apartments Uganda',
    'Speke Group of Hotels',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-surface-page text-ink-primary antialiased selection:bg-brand-antique/30 selection:text-brand-bronze-ink min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
