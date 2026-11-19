import type { Metadata } from 'next';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { SITE_LOGO_SRC } from '@/lib/site-logo';
import { ASSOCIATION_NAME, SITE_NAME, SITE_ORIGIN, absoluteUrl } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${ASSOCIATION_NAME}`,
  description: `${SITE_NAME} — the ${ASSOCIATION_NAME}. Member services, benefits, and resources.`,
  metadataBase: new URL(SITE_ORIGIN),
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: `${SITE_NAME} | ${ASSOCIATION_NAME}`,
    description: `${SITE_NAME} — the ${ASSOCIATION_NAME}. Member services, benefits, and resources.`,
    url: './',
    siteName: SITE_NAME,
    locale: 'en_TT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ${ASSOCIATION_NAME}`,
    description: `${SITE_NAME} — the ${ASSOCIATION_NAME}. Member services, benefits, and resources.`,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ASSOCIATION_NAME,
  alternateName: SITE_NAME,
  url: SITE_ORIGIN,
  logo: absoluteUrl(SITE_LOGO_SRC),
  telephone: '+1 868 235-5260',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '4th Floor, Riverside Plaza, #3 Besson Street',
    addressLocality: 'Port of Spain',
    addressCountry: 'TT',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas antialiased text-ink [font-size:clamp(0.9375rem,0.88rem+0.25vw,1.0625rem)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
