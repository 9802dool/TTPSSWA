import { getRedis } from "./redis";

const VISITS_TOTAL = "analytics:visits:total";
const VISITS_PATHS = "analytics:visits:paths";
const SERVICE_LOG = "analytics:service_requests";

export type ServiceRequestRecord = {
  id: string;
  serviceType: "hotel_booking";
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

export async function recordServiceRequest(
  serviceType: ServiceRequestRecord["serviceType"],
  payload: Record<string, unknown>,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
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
    return true;
  } catch (e) {
    console.error("analytics recordServiceRequest:", e);
    return false;
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
      if (typeof item !== "string") continue;
      try {
        serviceRequests.push(JSON.parse(item) as ServiceRequestRecord);
      } catch {
        /* skip */
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
