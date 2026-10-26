import type { Metadata } from 'next';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import './globals.css';

export const metadata: Metadata = {
  title: 'TTPSSWA | Trinidad & Tobago Police Service Social & Welfare Association',
  description:
    'Member services, benefits, and resources for the Trinidad and Tobago Police Service Social and Welfare Association.',
  metadataBase: new URL('https://ttpsswa.vercel.app'),
  openGraph: {
    title: 'TTPSSWA | Trinidad & Tobago Police Service Social & Welfare Association',
    description: 'Member services, benefits, and resources for the Trinidad and Tobago Police Service Social and Welfare Association.',
    url: 'https://ttpsswa.vercel.app',
    siteName: 'TTPSSWA',
    locale: 'en_TT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TTPSSWA | Trinidad & Tobago Police Service Social & Welfare Association',
    description: 'Member services, benefits, and resources for the Trinidad and Tobago Police Service Social and Welfare Association.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas antialiased text-ink [font-size:clamp(0.9375rem,0.88rem+0.25vw,1.0625rem)]">
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
