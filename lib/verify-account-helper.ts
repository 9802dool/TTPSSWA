/**
 * Helper to check if a user's email is verified.
 * Checks both Redis (WebAccount) and Prisma (User) sources.
 */

import { getWebAccountById } from "./web-account-storage";
import { isDatabaseConfigured, prisma } from "./prisma";

export async function isEmailVerified(userId: string): Promise<boolean> {
  // Check Redis first (primary source for web accounts)
  const account = await getWebAccountById(userId);
  if (account) {
    return account.emailVerified === true;
  }

  // Fallback to Prisma if configured
  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true },
      });
      return user?.emailVerified === true;
    } catch (error) {
      console.error('Error checking Prisma email verification:', error);
      return false;
    }
  }

  return false;
}

export interface AccountVerificationStatus {
  isVerified: boolean;
  email?: string;
  fullName?: string;
}

export async function getAccountVerificationStatus(
  userId: string
): Promise<AccountVerificationStatus | null> {
  // Check Redis first
  const account = await getWebAccountById(userId);
  if (account) {
    return {
      isVerified: account.emailVerified === true,
      email: account.email,
      fullName: account.fullName,
    };
  }

  // Fallback to Prisma
  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true, email: true, fullName: true },
      });
      
      if (user) {
        return {
          isVerified: user.emailVerified === true,
          email: user.email,
          fullName: user.fullName,
        };
      }
    } catch (error) {
      console.error('Error fetching account verification status:', error);
    }
  }

  return null;
}
