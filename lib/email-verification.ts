/**
 * Email verification system using Resend.
 * Generates one-time verification codes and sends verification emails.
 */

import { Resend } from "resend";
import { createHash, randomBytes } from "node:crypto";
import { getRedis } from "./redis";

const VERIFICATION_PREFIX = "email_verification";
const VERIFICATION_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Generates a secure 6-digit verification code.
 */
function generateVerificationCode(): string {
  const bytes = randomBytes(3);
  const num = bytes.readUIntBE(0, 3);
  return (num % 900000 + 100000).toString(); // 100000-999999
}

/**
 * Generates the verification token key for Redis.
 */
function verificationKey(userId: string): string {
  return `${VERIFICATION_PREFIX}:${userId}`;
}

/**
 * Sends a verification email with a one-time code.
 * Returns the code on success (for testing/logging), null on failure.
 */
export async function sendVerificationEmail(params: {
  email: string;
  fullName: string;
  userId: string;
}): Promise<{ code: string } | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.MEMBERSHIP_FROM_EMAIL?.trim() || 'TTPSSWA <onboarding@resend.dev>';
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

  // Generate verification code
  const code = generateVerificationCode();
  
  // Store code in Redis with expiry
  try {
    await redis.set(
      verificationKey(params.userId),
      code,
      { ex: VERIFICATION_EXPIRY_SECONDS }
    );
  } catch (error) {
    console.error('Failed to store verification code:', error);
    return null;
  }

  // Build email content
  const verifyUrl = `${siteUrl}/verify-email?userId=${encodeURIComponent(params.userId)}&code=${code}`;
  
  const subject = 'Verify Your TTPSSWA Account';
  
  const textBody = `Dear ${params.fullName},

Welcome to TTPSSWA! Please verify your email address to access your member dashboard.

Your verification code is: ${code}

Or click this link to verify automatically:
${verifyUrl}

This code expires in 24 hours.

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
    
    <p style="color: #6b7280; font-size: 14px;">This code expires in 24 hours.</p>
    
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
 * Verifies a code against the stored code for a user.
 * Returns true if valid, false otherwise.
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

    const isValid = storedCode === code.trim();
    
    if (isValid) {
      // Delete the code after successful verification (one-time use)
      await redis.del(verificationKey(userId));
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
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
 * Deletes any pending verification code for a user.
 */
export async function clearVerificationCode(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(verificationKey(userId));
  } catch (error) {
    console.error('Error clearing verification code:', error);
  }
}
