/**
 * Only allow same-site relative paths after login (prevents open redirects).
 */
export function safeInternalNextPath(raw: string | null | undefined): string | null {
  if (raw == null || raw === "") return null;
  const s = raw.trim();
  if (!s.startsWith("/")) return null;
  if (s.startsWith("//")) return null;
  if (s.includes("\\")) return null;
  return s;
}
