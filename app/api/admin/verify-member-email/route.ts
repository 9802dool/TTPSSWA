import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession, getAdminCookieName, hasRole } from "@/lib/admin-auth";
import { markEmailVerified } from "@/lib/web-account-storage";
import { clearVerificationCode } from "@/lib/email-verification";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Require at least staff role
  if (!hasRole(session, "staff")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  let body: { userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Mark email as verified in Redis
  const success = await markEmailVerified(userId);

  if (!success) {
    return NextResponse.json({ error: "Failed to verify email in Redis" }, { status: 500 });
  }

  // Clear any pending verification code
  await clearVerificationCode(userId);

  // Also update Prisma if configured
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
      // Don't fail the request - Redis is primary
    }
  }

  return NextResponse.json({ 
    ok: true,
    message: "Email verified successfully by admin override",
  });
}
