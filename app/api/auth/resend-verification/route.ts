import { NextResponse } from "next/server";
import { getMemberSessionUserId } from "@/lib/member-session";
import { getWebAccountById } from "@/lib/web-account-storage";
import { sendVerificationEmail } from "@/lib/email-verification";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  const userId = getMemberSessionUserId();
  
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `verification-send:ip:${clientIP}`,
    RATE_LIMITS.verificationSend,
  );
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Too many verification requests. Please try again later." },
      { status: 429 },
    );
  }

  // Rate limiting by user ID
  const userLimit = await checkRateLimit(
    `verification-send:user:${userId}`,
    RATE_LIMITS.verificationSend,
  );
  if (!userLimit.success) {
    return NextResponse.json(
      { error: "Too many verification requests for this account. Please try again later." },
      { status: 429 },
    );
  }

  // Get account from Redis
  const account = await getWebAccountById(userId);
  
  if (!account) {
    // Try Prisma as fallback
    if (isDatabaseConfigured()) {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          if (user.emailVerified) {
            return NextResponse.json({ error: "Email already verified" }, { status: 400 });
          }

          // Send verification email
          const result = await sendVerificationEmail({
            email: user.email,
            fullName: user.fullName,
            userId: user.id,
          });

          if (!result) {
            return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
          }

          return NextResponse.json({
            ok: true,
            message: "Verification email sent. Please check your inbox.",
          });
        }
      } catch (error) {
        console.error('Failed to lookup user in Prisma:', error);
      }
    }
    
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (account.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 });
  }

  // Send verification email (cooldown is checked internally - 60s)
  const result = await sendVerificationEmail({
    email: account.email,
    fullName: account.fullName,
    userId: account.id,
  });

  if (!result) {
    return NextResponse.json({ 
      error: "Please wait 60 seconds before requesting another verification code.",
    }, { status: 429 });
  }

  return NextResponse.json({
    ok: true,
    message: "Verification email sent. Please check your inbox.",
  });
}
