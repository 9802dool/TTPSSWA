import { NextResponse } from "next/server";
import { verifyCode, verifyToken, clearVerificationCode, getRemainingAttempts } from "@/lib/email-verification";
import { markEmailVerified as markRedisEmailVerified } from "@/lib/web-account-storage";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { userId?: string; code?: string; token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  let verifiedUserId: string | null = null;

  // Token-based verification (link in email)
  if (token) {
    verifiedUserId = await verifyToken(token);
    if (!verifiedUserId) {
      return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
    }
  }
  // Code-based verification (manual entry)
  else if (userId && code) {
    const isValid = await verifyCode(userId, code);
    
    if (!isValid) {
      const remaining = await getRemainingAttempts(userId);
      return NextResponse.json({ 
        error: remaining > 0 
          ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : "Too many failed attempts. Please request a new verification code.",
        remainingAttempts: remaining,
      }, { status: 400 });
    }
    
    verifiedUserId = userId;
  }
  // Neither provided
  else {
    return NextResponse.json({ error: "Verification code or token is required." }, { status: 400 });
  }

  // Mark email as verified in Redis
  const redisSuccess = await markRedisEmailVerified(verifiedUserId);
  
  if (!redisSuccess) {
    return NextResponse.json({ error: "Failed to update verification status." }, { status: 500 });
  }

  // If Prisma is configured, also update the User table
  if (isDatabaseConfigured()) {
    try {
      await prisma.user.update({
        where: { id: verifiedUserId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to update Prisma user verification:', error);
      // Don't fail the request - Redis is source of truth for web accounts
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Email verified successfully. You can now access your dashboard.",
  });
}
