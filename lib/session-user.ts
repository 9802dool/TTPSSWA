import { cookies } from "next/headers";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getMemberCookieName, verifyMemberSession } from "@/lib/member-session";

export function getSessionUserId(): string | null {
  const token = cookies().get(getMemberCookieName())?.value;
  if (!token) return null;
  return verifyMemberSession(token);
}

export async function getSessionUser() {
  const id = getSessionUserId();
  if (!id) return null;
  if (!isDatabaseConfigured()) return null;
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: { membershipApplication: true },
    });
  } catch (error) {
    console.error("getSessionUser:", error);
    return null;
  }
}
