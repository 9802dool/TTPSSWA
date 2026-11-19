/** Public site origin. Preview deployments keep their own host. */
export const SITE_ORIGIN = "https://ttpsswa.org";

export const ASSOCIATION_NAME =
  "Trinidad and Tobago Police Service Social and Welfare Association";

export const SITE_NAME = "TTPSSWA";

/** Production hosts that should 301 to SITE_ORIGIN. Preview *.vercel.app hosts are not listed. */
export const LEGACY_CANONICAL_HOSTS = ["ttpsswa.vercel.app", "www.ttpsswa.org"] as const;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 1200×630 share card at public/og-image.png */
export const SHARE_IMAGE = {
  url: absoluteUrl("/og-image.png"),
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} crest — ${ASSOCIATION_NAME}`,
} as const;
