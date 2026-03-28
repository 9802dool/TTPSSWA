/** Base URL for absolute links in emails (tracking pixel, etc.). */
export function getPublicSiteUrl(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  const v = process.env.VERCEL_URL?.trim();
  if (v) {
    const host = v.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "";
}
