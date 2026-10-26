import { NextResponse } from "next/server";
import { getMemberSessionUserId } from "@/lib/member-session";
import { getAccountVerificationStatus } from "@/lib/verify-account-helper";

export const runtime = "nodejs";

export async function GET() {
  const userId = getMemberSessionUserId();
  
  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const status = await getAccountVerificationStatus(userId);

  if (!status) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    userId,
    email: status.email,
    fullName: status.fullName,
    emailVerified: status.isVerified,
  });
}
