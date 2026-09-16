import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { getMemberCookieName, verifyMemberSession } from "@/lib/member-session";

export function getSessionUserId(): string | null {
  const token = cookies().get(getMemberCookieName())?.value;
  if (!token) return null;
  return verifyMemberSession(token);
}

export async function getSessionUser() {
  const id = getSessionUserId();
  if (!id) return null;
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.user.findUnique({
    where: { id },
    include: { membershipApplication: true },
  });
}
