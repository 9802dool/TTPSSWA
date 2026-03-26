import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "ttpsswa_admin";

export function getAdminCookieName(): string {
  return COOKIE;
}

function secret(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 8) return "";
  return createHmac("sha256", "ttpsswa-admin-session").update(p).digest("hex");
}

export function signAdminSession(expMs: number): string | null {
  const s = secret();
  if (!s) return null;
  const payload = Buffer.from(JSON.stringify({ exp: expMs }), "utf8").toString(
    "base64url",
  );
  const sig = createHmac("sha256", s).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token: string): boolean {
  const s = secret();
  if (!s) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", s).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length) return false;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  try {
    const { exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp: number };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}
