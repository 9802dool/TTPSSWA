import { cookies } from "next/headers";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getMemberCookieName, verifyMemberSession } from "@/lib/member-session";
import { getWebAccountById } from "@/lib/web-account-storage";

export function getSessionUserId(): string | null {
  const token = cookies().get(getMemberCookieName())?.value;
  if (!token) return null;
  return verifyMemberSession(token);
}

export async function getSessionUser() {
  const id = getSessionUserId();
  if (!id) return null;
  const webAccount = await getWebAccountById(id);
  if (webAccount) {
    return { ...webAccount, membershipApplication: null };
  }
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
