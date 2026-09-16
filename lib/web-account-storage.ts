import { createHash, randomUUID } from "node:crypto";
import { getRedis } from "./redis";

const ACCOUNT_PREFIX = "web_accounts";

export type WebAccountRole =
  | "UNVERIFIED"
  | "BASIC_USER"
  | "FINANCIAL_MEMBER"
  | "ADMIN";

export type WebAccount = {
  id: string;
  fullName: string;
  email: string;
  serviceNumber: string;
  passwordHash: string;
  role: WebAccountRole;
  createdAt: string;
  updatedAt: string;
};

export type CreateWebAccountResult =
  | { ok: true; account: WebAccount }
  | { ok: false; reason: "duplicate" | "unavailable" };

function indexToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function accountKey(id: string): string {
  return `${ACCOUNT_PREFIX}:id:${id}`;
}

function emailKey(email: string): string {
  return `${ACCOUNT_PREFIX}:email:${indexToken(email.trim().toLowerCase())}`;
}

function serviceKey(serviceNumber: string): string {
  return `${ACCOUNT_PREFIX}:service:${indexToken(serviceNumber.trim().toLowerCase())}`;
}

function parseAccount(raw: unknown): WebAccount | null {
  try {
    const parsed =
      typeof raw === "string"
        ? (JSON.parse(raw) as Partial<WebAccount>)
        : (raw as Partial<WebAccount>);
    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.serviceNumber !== "string" ||
      typeof parsed.passwordHash !== "string"
    ) {
      return null;
    }
    return parsed as WebAccount;
  } catch {
    return null;
  }
}

export async function createWebAccount(data: {
  fullName: string;
  email: string;
  serviceNumber: string;
  passwordHash: string;
}): Promise<CreateWebAccountResult> {
  const redis = getRedis();
  if (!redis) return { ok: false, reason: "unavailable" };

  const id = randomUUID();
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedServiceNumber = data.serviceNumber.trim();
  const emailIndex = emailKey(normalizedEmail);
  const serviceIndex = serviceKey(normalizedServiceNumber);
  const now = new Date().toISOString();
  const account: WebAccount = {
    id,
    fullName: data.fullName.trim(),
    email: normalizedEmail,
    serviceNumber: normalizedServiceNumber,
    passwordHash: data.passwordHash,
    role: "UNVERIFIED",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const claimedEmail = await redis.set(emailIndex, id, { nx: true });
    if (claimedEmail !== "OK") {
      return { ok: false, reason: "duplicate" };
    }

    const claimedService = await redis.set(serviceIndex, id, { nx: true });
    if (claimedService !== "OK") {
      await redis.del(emailIndex);
      return { ok: false, reason: "duplicate" };
    }

    try {
      await redis.set(accountKey(id), JSON.stringify(account));
    } catch (error) {
      await Promise.all([redis.del(emailIndex), redis.del(serviceIndex)]);
      throw error;
    }

    return { ok: true, account };
  } catch (error) {
    console.error("createWebAccount:", error);
    return { ok: false, reason: "unavailable" };
  }
}

export async function findWebAccountByIdentifier(
  identifier: string,
): Promise<WebAccount | null> {
  const redis = getRedis();
  if (!redis) return null;
  const value = identifier.trim();
  if (!value) return null;

  try {
    const id = await redis.get<string>(
      value.includes("@") ? emailKey(value) : serviceKey(value),
    );
    if (!id) return null;
    return parseAccount(await redis.get(accountKey(id)));
  } catch (error) {
    console.error("findWebAccountByIdentifier:", error);
    return null;
  }
}

export async function getWebAccountById(id: string): Promise<WebAccount | null> {
  const redis = getRedis();
  if (!redis || !id) return null;
  try {
    return parseAccount(await redis.get(accountKey(id)));
  } catch (error) {
    console.error("getWebAccountById:", error);
    return null;
  }
}
