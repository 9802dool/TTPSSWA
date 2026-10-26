import crypto from "crypto";

/**
 * Generate a signed timestamp token for form submission tracking.
 * Returns a string like "timestamp:signature".
 */
export function generateFormToken(): string {
  const timestamp = Date.now();
  const secret = getFormSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(String(timestamp))
    .digest("hex")
    .slice(0, 16); // First 16 chars for brevity
  
  return `${timestamp}:${signature}`;
}

/**
 * Verify a form token and check minimum fill time.
 * Returns { valid: true } if the token is valid and enough time has passed.
 * Returns { valid: false, reason: string } otherwise.
 */
export function verifyFormToken(
  token: string | null | undefined,
  minFillTimeSeconds: number = 3,
): { valid: boolean; reason?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" };
  }

  const parts = token.split(":");
  if (parts.length !== 2) {
    return { valid: false, reason: "invalid_token_format" };
  }

  const [timestampStr, receivedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  
  if (isNaN(timestamp) || timestamp <= 0) {
    return { valid: false, reason: "invalid_timestamp" };
  }

  // Verify signature
  const secret = getFormSecret();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(timestampStr)
    .digest("hex")
    .slice(0, 16);
  
  if (receivedSignature !== expectedSignature) {
    return { valid: false, reason: "invalid_signature" };
  }

  // Check token age (max 1 hour to prevent replay attacks with old tokens)
  const now = Date.now();
  const ageSeconds = (now - timestamp) / 1000;
  
  if (ageSeconds > 3600) {
    return { valid: false, reason: "token_expired" };
  }

  // Check minimum fill time
  if (ageSeconds < minFillTimeSeconds) {
    return { valid: false, reason: "too_fast" };
  }

  return { valid: true };
}

/**
 * Check honeypot field. Returns true if the honeypot was triggered (spam detected).
 */
export function checkHoneypot(honeypotValue: unknown): boolean {
  // Honeypot should be empty; any value indicates a bot filled it in
  return Boolean(
    honeypotValue !== undefined &&
    honeypotValue !== null &&
    honeypotValue !== ""
  );
}

function getFormSecret(): string {
  // Use ADMIN_PASSWORD as the base secret, or fallback for local dev
  return process.env.ADMIN_PASSWORD || "dev-secret-change-in-production";
}
