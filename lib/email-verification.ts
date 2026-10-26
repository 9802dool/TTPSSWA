/**
 * Email verification system using Resend.
 * Generates one-time verification codes and sends verification emails.
 */

import { Resend } from "resend";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getRedis } from "./redis";

const VERIFICATION_PREFIX = "email_verification";
const VERIFICATION_TOKEN_PREFIX = "email_verification_token";
const VERIFICATION_ATTEMPTS_PREFIX = "email_verification_attempts";
const RESEND_COOLDOWN_PREFIX = "email_verification_cooldown";

const CODE_EXPIRY_SECONDS = 30 * 60; // 30 minutes
const TOKEN_EXPIRY_SECONDS = 30 * 60; // 30 minutes
const RESEND_COOLDOWN_SECONDS = 60; // 60 seconds
const MAX_ATTEMPTS = 5; // Max failed attempts before code invalidation

/**
 * Generates a secure 6-digit verification code.
 */
function generateVerificationCode(): string {
  const bytes = randomBytes(3);
  const num = bytes.readUIntBE(0, 3);
  return (num % 900000 + 100000).toString(); // 100000-999999
}

/**
 * Generates a long random token for link-based verification.
 */
function generateVerificationToken(): string {
  return randomBytes(32).toString('base64url'); // 43 chars, URL-safe
}

/**
 * Generates the verification code key for Redis.
 */
function verificationKey(userId: string): string {
  return `${VERIFICATION_PREFIX}:${userId}`;
}

/**
 * Generates the verification token key for Redis.
 */
function verificationTokenKey(token: string): string {
  // Hash the token for storage (prevents token leakage via Redis inspection)
  const hash = createHash('sha256').update(token).digest('hex');
  return `${VERIFICATION_TOKEN_PREFIX}:${hash}`;
}

/**
 * Generates the attempts counter key for Redis.
 */
function attemptsKey(userId: string): string {
  return `${VERIFICATION_ATTEMPTS_PREFIX}:${userId}`;
}

/**
 * Generates the resend cooldown key for Redis.
 */
function cooldownKey(userId: string): string {
  return `${RESEND_COOLDOWN_PREFIX}:${userId}`;
}

/**
 * Sends a verification email with a one-time code and token-based link.
 * Returns the code on success (for testing/logging), null on failure.
 */
export async function sendVerificationEmail(params: {
  email: string;
  fullName: string;
  userId: string;
}): Promise<{ code: string } | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  // Use MEMBERSHIP_FROM_EMAIL, fallback to BOOKING_FROM_EMAIL, no onboarding@resend.dev
  const fromEmail = 
    process.env.MEMBERSHIP_FROM_EMAIL?.trim() || 
    process.env.BOOKING_FROM_EMAIL?.trim() || 
    'TTPSSWA <noreply@ttpsswa.org>';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ttpsswa.vercel.app';

  if (!apiKey) {
    console.error('Cannot send verification email: RESEND_API_KEY not configured');
    return null;
  }

  const redis = getRedis();
  if (!redis) {
    console.error('Cannot send verification email: Redis not available');
    return null;
  }

  // Check resend cooldown
  const cooldown = await redis.get<string>(cooldownKey(params.userId));
  if (cooldown) {
    console.log(`Resend cooldown active for user ${params.userId}`);
    return null;
  }

  // Generate verification code and token
  const code = generateVerificationCode();
  const token = generateVerificationToken();
  
  // Store code and token in Redis with expiry
  try {
    await redis.set(
      verificationKey(params.userId),
      code,
      { ex: CODE_EXPIRY_SECONDS }
    );
    
    // Store token with userId as value (for reverse lookup)
    await redis.set(
      verificationTokenKey(token),
      params.userId,
      { ex: TOKEN_EXPIRY_SECONDS }
    );

    // Set resend cooldown
    await redis.set(
      cooldownKey(params.userId),
      '1',
      { ex: RESEND_COOLDOWN_SECONDS }
    );

    // Reset attempts counter
    await redis.del(attemptsKey(params.userId));
  } catch (error) {
    console.error('Failed to store verification code:', error);
    return null;
  }

  // Build email content with token-based link (not code)
  const verifyUrl = `${siteUrl}/verify-email?token=${token}`;
  
  const subject = 'Verify Your TTPSSWA Account';
  
  const textBody = `Dear ${params.fullName},

Welcome to TTPSSWA! Please verify your email address to access your member dashboard.

Your verification code is: ${code}

Or click this link to verify automatically:
${verifyUrl}

This code expires in 30 minutes. You have up to 5 attempts to enter the code correctly.

If you did not create an account, please ignore this email.

Best regards,
TTPSSWA Administration`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f3f4f6; border: 2px dashed #3b82f6; border-radius: 8px; margin: 20px 0; color: #1e3a8a; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #2563eb; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">TTPSSWA Email Verification</h1>
  </div>
  <div class="content">
    <p>Dear <strong>${params.fullName}</strong>,</p>
    
    <p>Welcome to the Trinidad and Tobago Police Service Social and Welfare Association! Please verify your email address to access your member dashboard.</p>
    
    <p>Your verification code is:</p>
    <div class="code">${code}</div>
    
    <p style="text-align: center;">Or click the button below to verify automatically:</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px;">This code expires in 30 minutes. You have up to 5 attempts to enter the code correctly.</p>
    
    <p style="color: #6b7280; font-size: 14px;">If you did not create an account, please ignore this email.</p>
  </div>
  <div class="footer">
    <p>Trinidad and Tobago Police Service Social and Welfare Association</p>
  </div>
</body>
</html>`;

  // Send via Resend
  const resend = new Resend(apiKey);
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: [params.email],
      subject,
      text: textBody,
      html: htmlBody,
    });
    
    console.log(`Verification email sent to ${params.email} (code: ${code})`);
    return { code };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return null;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a code against the stored code for a user.
 * Returns true if valid, false otherwise.
 * Implements attempt limiting: max 5 failed attempts before code invalidation.
 */
export async function verifyCode(userId: string, code: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    console.error('Cannot verify code: Redis not available');
    return false;
  }

  try {
    const storedCode = await redis.get<string>(verificationKey(userId));
    
    if (!storedCode) {
      console.log(`No verification code found for user ${userId}`);
      return false;
    }

    // Check attempts counter
    const attempts = await redis.get<number>(attemptsKey(userId)) || 0;
    
    if (attempts >= MAX_ATTEMPTS) {
      console.log(`Max attempts exceeded for user ${userId}, invalidating code`);
      await redis.del(verificationKey(userId));
      await redis.del(attemptsKey(userId));
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = constantTimeEqual(storedCode, code.trim());
    
    if (isValid) {
      // Delete the code and attempts counter after successful verification (one-time use)
      await redis.del(verificationKey(userId));
      await redis.del(attemptsKey(userId));
    } else {
      // Increment attempts counter with same expiry as code
      const ttl = await redis.ttl(verificationKey(userId));
      await redis.set(attemptsKey(userId), attempts + 1, { ex: Math.max(ttl, 60) });
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
}

/**
 * Verifies a token-based link (long random token, not 6-digit code).
 * Returns the userId if valid, null otherwise.
 */
export async function verifyToken(token: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) {
    console.error('Cannot verify token: Redis not available');
    return null;
  }

  try {
    const userId = await redis.get<string>(verificationTokenKey(token));
    
    if (!userId) {
      console.log('Invalid or expired verification token');
      return null;
    }

    // Delete the token after use (one-time use)
    await redis.del(verificationTokenKey(token));
    
    // Also delete any pending code and attempts for this user
    await redis.del(verificationKey(userId));
    await redis.del(attemptsKey(userId));
    
    return userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Checks if a verification code exists for a user (not expired).
 */
export async function hasPendingVerification(userId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  try {
    const storedCode = await redis.get<string>(verificationKey(userId));
    return storedCode !== null;
  } catch {
    return false;
  }
}

/**
 * Deletes any pending verification code and attempts for a user.
 */
export async function clearVerificationCode(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(verificationKey(userId));
    await redis.del(attemptsKey(userId));
  } catch (error) {
    console.error('Error clearing verification code:', error);
  }
}

/**
 * Gets the remaining attempts for a user.
 */
export async function getRemainingAttempts(userId: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return MAX_ATTEMPTS;

  try {
    const attempts = await redis.get<number>(attemptsKey(userId)) || 0;
    return Math.max(0, MAX_ATTEMPTS - attempts);
  } catch {
    return MAX_ATTEMPTS;
  }
}
