import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "TTPSSWA",
  description:
    "TTPSSWA — information, programs, and community updates. Replace this text in app/layout.tsx with your organization’s description.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${sans.variable} ${display.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
