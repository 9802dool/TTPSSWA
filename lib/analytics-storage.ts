import { getRedis } from "./redis";

const VISITS_TOTAL = "analytics:visits:total";
const VISITS_PATHS = "analytics:visits:paths";
const SERVICE_LOG = "analytics:service_requests";

export type ServiceRequestRecord = {
  id: string;
  serviceType:
    | "hotel_booking"
    | "salary_deduction"
    | "dental_optical_grant"
    | "legal_aid_application";
  createdAt: string;
  payload: Record<string, unknown>;
};

export async function recordPageVisit(pathname: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const path = pathname.slice(0, 256) || "/";
  try {
    await redis.incr(VISITS_TOTAL);
    await redis.hincrby(VISITS_PATHS, path, 1);
    return true;
  } catch (e) {
    console.error("analytics recordPageVisit:", e);
    return false;
  }
}

/** Returns the new record id when stored, or null if Redis is unavailable or the write failed. */
export async function recordServiceRequest(
  serviceType: ServiceRequestRecord["serviceType"],
  payload: Record<string, unknown>,
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  const record: ServiceRequestRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    serviceType,
    createdAt: new Date().toISOString(),
    payload,
  };
  try {
    const json = JSON.stringify(record);
    await redis.lpush(SERVICE_LOG, json);
    await redis.ltrim(SERVICE_LOG, 0, 499);
    return record.id;
  } catch (e) {
    console.error("analytics recordServiceRequest:", e);
    return null;
  }
}

export type AdminStats = {
  storageConfigured: boolean;
  totalVisits: number | null;
  visitsByPath: Record<string, number> | null;
  serviceRequests: ServiceRequestRecord[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const redis = getRedis();
  if (!redis) {
    return {
      storageConfigured: false,
      totalVisits: null,
      visitsByPath: null,
      serviceRequests: [],
    };
  }
  try {
    const totalRaw = await redis.get(VISITS_TOTAL);
    const total =
      typeof totalRaw === "number"
        ? totalRaw
        : totalRaw != null
          ? Number(totalRaw)
          : 0;
    const pathsRaw = await redis.hgetall(VISITS_PATHS);
    const visitsByPath: Record<string, number> = {};
    if (pathsRaw && typeof pathsRaw === "object") {
      for (const [k, v] of Object.entries(pathsRaw)) {
        visitsByPath[k] = typeof v === "number" ? v : Number(v);
      }
    }
    const rawList = await redis.lrange(SERVICE_LOG, 0, 199);
    const serviceRequests: ServiceRequestRecord[] = [];
    for (const item of rawList) {
      try {
        const record =
          typeof item === "string"
            ? (JSON.parse(item) as ServiceRequestRecord)
            : (item as ServiceRequestRecord);
        if (record && record.id && record.serviceType) {
          serviceRequests.push(record);
        }
      } catch {
        /* skip unparseable */
      }
    }
    return {
      storageConfigured: true,
      totalVisits: Number.isFinite(total) ? total : 0,
      visitsByPath,
      serviceRequests,
    };
  } catch (e) {
    console.error("getAdminStats:", e);
    return {
      storageConfigured: true,
      totalVisits: null,
      visitsByPath: null,
      serviceRequests: [],
    };
  }
}

function extractEmailFromPayload(payload: Record<string, unknown>): string | null {
  const e = payload.email ?? payload.Email;
  if (typeof e === "string" && e.trim()) return e.trim().toLowerCase();
  return null;
}

/**
 * Service requests (hotel booking, etc.) whose stored payload email matches the member.
 * Scans the same Redis list as the admin service log (newest-first trim).
 */
export async function getServiceRequestsForEmail(
  email: string,
): Promise<ServiceRequestRecord[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  const redis = getRedis();
  if (!redis) return [];
  try {
    const rawList = await redis.lrange(SERVICE_LOG, 0, 499);
    const out: ServiceRequestRecord[] = [];
    for (const item of rawList) {
      try {
        const record =
          typeof item === "string"
            ? (JSON.parse(item) as ServiceRequestRecord)
            : (item as ServiceRequestRecord);
        if (!record?.id || !record.serviceType || !record.payload) continue;
        const p = record.payload as Record<string, unknown>;
        if (extractEmailFromPayload(p) === normalized) {
          out.push(record);
        }
      } catch {
        /* skip */
      }
    }
    out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return out;
  } catch (e) {
    console.error("getServiceRequestsForEmail:", e);
    return [];
  }
}

export type HotelReservationDatabase = {
  storageConfigured: boolean;
  records: ServiceRequestRecord[];
};

/**
 * All hotel booking rows from the service log (Redis), newest first.
 * Same source as successful submissions on the public hotel form.
 */
export async function getHotelReservationRecords(): Promise<HotelReservationDatabase> {
  const redis = getRedis();
  if (!redis) {
    return { storageConfigured: false, records: [] };
  }
  try {
    const rawList = await redis.lrange(SERVICE_LOG, 0, 499);
    const out: ServiceRequestRecord[] = [];
    for (const item of rawList) {
      try {
        const record =
          typeof item === "string"
            ? (JSON.parse(item) as ServiceRequestRecord)
            : (item as ServiceRequestRecord);
        if (
          !record?.id ||
          record.serviceType !== "hotel_booking" ||
          !record.payload
        ) {
          continue;
        }
        out.push(record);
      } catch {
        /* skip */
      }
    }
    out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { storageConfigured: true, records: out };
  } catch (e) {
    console.error("getHotelReservationRecords:", e);
    return { storageConfigured: true, records: [] };
  }
}

export type HotelReservationLookup = {
  storageConfigured: boolean;
  record: ServiceRequestRecord | null;
};

/**
 * Single hotel booking row by record id, or null if not in the current log window.
 */
export async function getHotelReservationById(
  id: string,
): Promise<HotelReservationLookup> {
  const decoded = decodeURIComponent(id).trim();
  if (!decoded) {
    return { storageConfigured: false, record: null };
  }
  const redis = getRedis();
  if (!redis) {
    return { storageConfigured: false, record: null };
  }
  try {
    const rawList = await redis.lrange(SERVICE_LOG, 0, 499);
    for (const item of rawList) {
      try {
        const record =
          typeof item === "string"
            ? (JSON.parse(item) as ServiceRequestRecord)
            : (item as ServiceRequestRecord);
        if (
          record?.id === decoded &&
          record.serviceType === "hotel_booking" &&
          record.payload
        ) {
          return { storageConfigured: true, record };
        }
      } catch {
        /* skip */
      }
    }
    return { storageConfigured: true, record: null };
  } catch (e) {
    console.error("getHotelReservationById:", e);
    return { storageConfigured: true, record: null };
  }
}
