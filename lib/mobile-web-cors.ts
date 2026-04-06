/**
 * Allow browser requests from the Expo web app when it is hosted on another origin
 * (e.g. *.vercel.app) while the API lives on this Next.js deployment.
 */

function parseOriginList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/** True if origin is an https://*.vercel.app host (preview or production). */
function isVercelAppOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    return u.protocol === "https:" && u.pathname === "/" && !u.search && !u.hash && /\.vercel\.app$/i.test(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Returns CORS headers for `origin` if it is allowed; otherwise null.
 */
export function mobileWebCorsHeaders(
  origin: string | null,
  requestMethod: string,
  requestHeaders: Headers,
): Record<string, string> | null {
  if (!origin) return null;

  const allowList = parseOriginList(process.env.MOBILE_WEB_ORIGINS);
  const allowAllVercel = process.env.MOBILE_WEB_ALLOW_ALL_VERCEL === "1";

  const allowed =
    allowList.includes(origin) || (allowAllVercel && isVercelAppOrigin(origin));

  if (!allowed) return null;

  const reqHdrs = requestHeaders.get("access-control-request-headers");
  const allowHeaders = reqHdrs?.trim() || "Content-Type, Authorization";

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": allowHeaders,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (requestMethod === "OPTIONS") {
    return headers;
  }

  return headers;
}
