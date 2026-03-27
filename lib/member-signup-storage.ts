import { getRedis } from "./redis";

const PENDING_LIST = "member_signups:pending";

/** Max photo size we persist to Redis (base64 grows ~33%). */
export const MAX_PHOTO_BYTES_FOR_STORAGE = 900 * 1024; // ~900 KB

export type PendingMemberSignup = {
  id: string;
  createdAt: string;
  status: "pending";
  /** Login username chosen at signup (older records may omit). */
  username?: string;
  /** scrypt hash — never plain text (older records may omit). */
  passwordHash?: string;
  regimentalNumber: string;
  rank: string;
  fullName: string;
  address: string;
  email: string;
  phone: string;
  financialMember: "yes" | "no";
  photoMimeType: string;
  photoBase64: string;
};

export async function recordPendingMemberSignup(
  data: Omit<PendingMemberSignup, "id" | "createdAt" | "status">,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const record: PendingMemberSignup = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    ...data,
  };
  try {
    await redis.lpush(PENDING_LIST, JSON.stringify(record));
    await redis.ltrim(PENDING_LIST, 0, 199);
    return true;
  } catch (e) {
    console.error("recordPendingMemberSignup:", e);
    return false;
  }
}

export async function getPendingMemberSignupById(
  id: string,
): Promise<PendingMemberSignup | null> {
  if (!id || id.length > 96) return null;
  const all = await getPendingMemberSignups();
  return all.find((r) => r.id === id) ?? null;
}

/** Match username (case-insensitive) or email (case-insensitive). Requires passwordHash on record. */
export async function findPendingMemberByUsernameOrEmail(
  identifier: string,
): Promise<PendingMemberSignup | null> {
  const q = identifier.trim();
  if (!q) return null;
  const qLower = q.toLowerCase();
  const all = await getPendingMemberSignups();
  for (const r of all) {
    if (!r.passwordHash) continue;
    const user = (r.username ?? "").trim().toLowerCase();
    const mail = (r.email ?? "").trim().toLowerCase();
    if (user === qLower || mail === qLower) {
      return r;
    }
  }
  return null;
}

export async function getPendingMemberSignups(): Promise<PendingMemberSignup[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const rawList = await redis.lrange(PENDING_LIST, 0, 199);
    const out: PendingMemberSignup[] = [];
    for (const item of rawList) {
      try {
        const parsed =
          typeof item === "string"
            ? (JSON.parse(item) as PendingMemberSignup)
            : (item as PendingMemberSignup);
        if (parsed?.id && parsed.status === "pending") {
          out.push(parsed);
        }
      } catch {
        /* skip */
      }
    }
    return out;
  } catch (e) {
    console.error("getPendingMemberSignups:", e);
    return [];
  }
}
