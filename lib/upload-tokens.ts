/**
 * Signed tokens for direct-to-storage uploads.
 *
 * A token binds one pending storage path to the MIME type and size the browser
 * declared when it asked for a signed upload URL, and expires after 10 minutes.
 *
 * Secret: UPLOAD_TOKEN_SECRET if set, otherwise a key derived from
 * SUPABASE_SERVICE_ROLE_KEY (always present when uploads can work at all).
 * There is deliberately no hard-coded fallback: with neither set, tokens can't
 * be created or verified and uploads fail closed.
 */

import { createHmac, timingSafeEqual } from 'crypto';

export const UPLOAD_TOKEN_TTL_MS = 10 * 60 * 1000;

function getSecret(): string | null {
  const explicit = process.env.UPLOAD_TOKEN_SECRET?.trim();
  if (explicit) return explicit;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceKey) {
    // Derive a separate key so the service-role key itself is never used directly as an HMAC key.
    return createHmac('sha256', serviceKey).update('ttpsswa-upload-token-v1').digest('hex');
  }
  return null;
}

export function isUploadTokenSecretConfigured(): boolean {
  return getSecret() !== null;
}

function sign(secret: string, data: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Generate a signed token for an upload. Throws if no secret is configured.
 */
export function createUploadToken(path: string, mimeType: string, maxSize: number, now: number = Date.now()): string {
  const secret = getSecret();
  if (!secret) throw new Error('Upload token secret is not configured');
  const data = `${path}:${mimeType}:${maxSize}:${now}`;
  return `${Buffer.from(data).toString('base64url')}.${sign(secret, data)}`;
}

/**
 * Verify and decode an upload token. Returns null if invalid, tampered or expired.
 */
export function verifyUploadToken(
  token: string,
  now: number = Date.now(),
): { path: string; mimeType: string; maxSize: number; timestamp: number } | null {
  try {
    const secret = getSecret();
    if (!secret || typeof token !== 'string') return null;
    const [encodedData, signature, extra] = token.split('.');
    if (!encodedData || !signature || extra !== undefined) return null;

    const data = Buffer.from(encodedData, 'base64url').toString('utf-8');
    const expected = Buffer.from(sign(secret, data), 'hex');
    const given = Buffer.from(signature, 'hex');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

    const parts = data.split(':');
    if (parts.length !== 4) return null;
    const [path, mimeType, maxSizeStr, timestampStr] = parts;
    if (!path || !mimeType) return null;

    const maxSize = Number(maxSizeStr);
    const timestamp = Number(timestampStr);
    if (!Number.isFinite(maxSize) || !Number.isFinite(timestamp)) return null;
    if (now - timestamp > UPLOAD_TOKEN_TTL_MS || timestamp - now > 60_000) return null;

    return { path, mimeType, maxSize, timestamp };
  } catch {
    return null;
  }
}
