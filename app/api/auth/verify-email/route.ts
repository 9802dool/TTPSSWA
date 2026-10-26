import { NextResponse } from "next/server";
import { verifyCode, clearVerificationCode } from "@/lib/email-verification";
import { markEmailVerified as markRedisEmailVerified } from "@/lib/web-account-storage";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { userId?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!userId || !code) {
    return NextResponse.json({ error: "User ID and code are required." }, { status: 400 });
  }

  // Verify the code
  const isValid = await verifyCode(userId, code);
  
  if (!isValid) {
    return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
  }

  // Mark email as verified in Redis
  const redisSuccess = await markRedisEmailVerified(userId);
  
  if (!redisSuccess) {
    return NextResponse.json({ error: "Failed to update verification status." }, { status: 500 });
  }

  // If Prisma is configured, also update the User table
  if (isDatabaseConfigured()) {
    try {
      await prisma.user.update({
        where: { id: userId },
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
