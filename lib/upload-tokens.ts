/**
 * Upload token management for direct-to-storage uploads.
 * Tracks pending uploads to prevent unauthorized file submissions.
 */

import { createHmac } from 'crypto';

const SECRET = process.env.UPLOAD_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

export interface PendingUpload {
  token: string;
  path: string;
  mimeType: string;
  maxSize: number;
  createdAt: string;
  expiresAt: string;
}

/**
 * Generate a signed token for an upload.
 * The token binds a specific storage path to this server session.
 */
export function createUploadToken(path: string, mimeType: string, maxSize: number): string {
  const data = `${path}:${mimeType}:${maxSize}:${Date.now()}`;
  const hmac = createHmac('sha256', SECRET);
  hmac.update(data);
  return `${Buffer.from(data).toString('base64')}.${hmac.digest('hex')}`;
}

/**
 * Verify and decode an upload token.
 */
export function verifyUploadToken(token: string): { path: string; mimeType: string; maxSize: number; timestamp: number } | null {
  try {
    const [encodedData, signature] = token.split('.');
    if (!encodedData || !signature) return null;

    const data = Buffer.from(encodedData, 'base64').toString('utf-8');
    const hmac = createHmac('sha256', SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) return null;

    const [path, mimeType, maxSizeStr, timestampStr] = data.split(':');
    if (!path || !mimeType || !maxSizeStr || !timestampStr) return null;

    const maxSize = parseInt(maxSizeStr, 10);
    const timestamp = parseInt(timestampStr, 10);

    if (!Number.isFinite(maxSize) || !Number.isFinite(timestamp)) return null;

    // Token expires after 10 minutes
    if (Date.now() - timestamp > 600000) return null;

    return { path, mimeType, maxSize, timestamp };
  } catch {
    return null;
  }
}
