/**
 * Base URL for the TTPSSWA website (production or your deployed Next.js URL).
 * Override with EXPO_PUBLIC_SITE_URL in .env for local testing.
 */
export const SITE_URL =
  process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://ttpsswa.vercel.app";
