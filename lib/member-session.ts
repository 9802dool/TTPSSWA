import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "ttpsswa_member";

export function getMemberCookieName(): string {
  return COOKIE;
}

/** Uses MEMBER_SESSION_SECRET if set, otherwise derives from ADMIN_PASSWORD (min 8 chars). */
function secret(): string {
  const raw =
    process.env.MEMBER_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();
  if (!raw || raw.length < 8) return "";
  return createHmac("sha256", "ttpsswa-member-session").update(raw).digest("hex");
}

export function isMemberSessionConfigured(): boolean {
  return secret().length > 0;
}

export function signMemberSession(memberId: string, expMs: number): string | null {
  const s = secret();
  if (!s) return null;
  const payload = Buffer.from(
    JSON.stringify({ sub: memberId, exp: expMs }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", s).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyMemberSession(token: string): string | null {
  const s = secret();
  if (!s) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", s).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { sub?: string; exp?: number };
    if (typeof data.sub !== "string" || data.sub.length === 0) return null;
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    return data.sub;
  } catch {
    return null;
  }
}
