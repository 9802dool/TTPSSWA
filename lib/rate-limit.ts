import { getRedis } from "./redis";

export type RateLimitConfig = {
  /**
   * Maximum number of requests allowed in the time window.
   */
  maxRequests: number;
  /**
   * Time window in seconds.
   */
  windowSeconds: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Simple fixed-window rate limiter using Redis.
 * Returns success=true if the request is allowed, success=false if rate limited.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redis = getRedis();
  
  // If Redis is not configured, allow the request
  if (!redis) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: Date.now() + config.windowSeconds * 1000,
    };
  }

  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / config.windowSeconds) * config.windowSeconds;
  const key = `ratelimit:${identifier}:${windowStart}`;
  
  try {
    // Increment the counter
    const count = await redis.incr(key);
    
    // Set expiry on first request in this window
    if (count === 1) {
      await redis.expire(key, config.windowSeconds * 2); // 2x window for safety
    }
    
    const remaining = Math.max(0, config.maxRequests - count);
    const reset = (windowStart + config.windowSeconds) * 1000;
    
    return {
      success: count <= config.maxRequests,
      limit: config.maxRequests,
      remaining,
      reset,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On Redis error, allow the request (fail open)
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowSeconds * 1000,
    };
  }
}

/**
 * Rate limit configurations for different endpoints.
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  login: { maxRequests: 5, windowSeconds: 300 }, // 5 attempts per 5 minutes
  register: { maxRequests: 3, windowSeconds: 600 }, // 3 registrations per 10 minutes
  verificationSend: { maxRequests: 3, windowSeconds: 600 }, // 3 verification emails per 10 minutes
  
  // Application forms - moderate limits
  applicationForm: { maxRequests: 5, windowSeconds: 3600 }, // 5 submissions per hour
  
  // Document uploads - moderate limits
  documentUpload: { maxRequests: 10, windowSeconds: 600 }, // 10 uploads per 10 minutes
  
  // Hotel booking - moderate limit
  hotelBooking: { maxRequests: 5, windowSeconds: 3600 }, // 5 bookings per hour
} as const;

/**
 * Get client IP address from request, considering proxies.
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (original client)
    return forwarded.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback to a generic identifier if no IP is available
  return "unknown";
}
