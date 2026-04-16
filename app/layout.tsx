import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'TTPSSWA | Trinidad & Tobago Police Service Social & Welfare Association',
  description:
    'Member services, benefits, and resources for the Trinidad and Tobago Police Service Social & Welfare Association.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
