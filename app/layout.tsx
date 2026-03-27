import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TTPSSWA — Trinidad and Tobago Police Service Social Welfare Association",
  description:
    "Trinidad and Tobago Police Service Social Welfare Association (TTPSSWA) — official information, programs, and community updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
