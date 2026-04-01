import { getRedis } from "./redis";

const PENDING_LIST = "member_signups:pending";

/** Max photo size we persist to Redis (base64 grows ~33%). */
export const MAX_PHOTO_BYTES_FOR_STORAGE = 900 * 1024; // ~900 KB

export type MemberApplicationStatus = "pending" | "accepted" | "rejected";

export type PendingMemberSignup = {
  id: string;
  createdAt: string;
  /** Legacy field on older Redis JSON — prefer applicationStatus. */
  status?: "pending";
  applicationStatus: MemberApplicationStatus;
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
  /** ITU dial prefix, e.g. +1868 (optional on older records). */
  phoneCountryCode?: string;
  /** Local number digits — optional (PDF HOME line). */
  phoneHome?: string;
  /** Local number digits — optional (PDF WORK line). */
  phoneWork?: string;
  financialMember: "yes" | "no";
  photoMimeType: string;
  photoBase64: string;
  /** PDF-aligned membership application (optional on older records). */
  departmentDivision?: string;
  sectionStation?: string;
  age?: string;
  sex?: "male" | "female";
  dateOfBirth?: string;
  dateOfEnlistment?: string;
  declarationAccepted?: boolean;
  beneficiaryRegimentalNumber?: string;
  beneficiaryRank?: string;
  beneficiaryFullName?: string;
  beneficiaryRelationship?: string;
  beneficiaryIdNumber?: string;
  witnessName?: string;
  applicationDateSigned?: string;
};

function normalizeApplicationStatus(
  parsed: Record<string, unknown>,
): MemberApplicationStatus {
  const a = parsed.applicationStatus;
  if (a === "accepted" || a === "rejected" || a === "pending") {
    return a;
  }
  if (parsed.status === "pending") {
    return "pending";
  }
  return "pending";
}

function normalizeRecord(
  parsed: Record<string, unknown>,
): PendingMemberSignup | null {
  if (!parsed?.id || typeof parsed.id !== "string") return null;
  const applicationStatus = normalizeApplicationStatus(parsed);
  return {
    ...parsed,
    applicationStatus,
  } as PendingMemberSignup;
}

export async function recordPendingMemberSignup(
  data: Omit<
    PendingMemberSignup,
    "id" | "createdAt" | "applicationStatus" | "status"
  >,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const record: PendingMemberSignup = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    applicationStatus: "pending",
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

/** All applications in the queue (any status). */
export async function getAllMemberApplications(): Promise<PendingMemberSignup[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const rawList = await redis.lrange(PENDING_LIST, 0, 199);
    const out: PendingMemberSignup[] = [];
    for (const item of rawList) {
      try {
        const raw =
          typeof item === "string"
            ? (JSON.parse(item) as Record<string, unknown>)
            : (item as Record<string, unknown>);
        const n = normalizeRecord(raw);
        if (n) out.push(n);
      } catch {
        /* skip */
      }
    }
    return out;
  } catch (e) {
    console.error("getAllMemberApplications:", e);
    return [];
  }
}

/** Applications still awaiting admin review. */
export async function getPendingMemberSignups(): Promise<PendingMemberSignup[]> {
  const all = await getAllMemberApplications();
  return all.filter((r) => r.applicationStatus === "pending");
}

export async function getPendingMemberSignupById(
  id: string,
): Promise<PendingMemberSignup | null> {
  if (!id || id.length > 96) return null;
  const all = await getAllMemberApplications();
  return all.find((r) => r.id === id) ?? null;
}

/** For member login: match username/email and must be accepted. */
export async function findAcceptedMemberByUsernameOrEmail(
  identifier: string,
): Promise<PendingMemberSignup | null> {
  const q = identifier.trim();
  if (!q) return null;
  const qLower = q.toLowerCase();
  const all = await getAllMemberApplications();
  for (const r of all) {
    if (r.applicationStatus !== "accepted" || !r.passwordHash) continue;
    const user = (r.username ?? "").trim().toLowerCase();
    const mail = (r.email ?? "").trim().toLowerCase();
    if (user === qLower || mail === qLower) {
      return r;
    }
  }
  return null;
}

/**
 * Set application status in Redis list (rebuilds list in place).
 */
export async function setMemberApplicationStatus(
  id: string,
  applicationStatus: "accepted" | "rejected",
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    const rawList = await redis.lrange(PENDING_LIST, 0, 199);
    const updated: string[] = [];
    let found = false;
    for (const item of rawList) {
      try {
        const raw =
          typeof item === "string"
            ? (JSON.parse(item) as Record<string, unknown>)
            : (item as Record<string, unknown>);
        if (raw?.id === id) {
          found = true;
          raw.applicationStatus = applicationStatus;
          delete raw.status;
          updated.push(JSON.stringify(raw));
        } else {
          updated.push(typeof item === "string" ? item : JSON.stringify(item));
        }
      } catch {
        updated.push(typeof item === "string" ? item : String(item));
      }
    }
    if (!found) return false;
    await redis.del(PENDING_LIST);
    for (let i = updated.length - 1; i >= 0; i--) {
      await redis.lpush(PENDING_LIST, updated[i]!);
    }
    await redis.ltrim(PENDING_LIST, 0, 199);
    return true;
  } catch (e) {
    console.error("setMemberApplicationStatus:", e);
    return false;
  }
}
