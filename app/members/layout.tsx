import type { Metadata } from "next";

/** Member session uses Node crypto (HMAC). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MembersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
