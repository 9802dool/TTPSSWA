import type { Application } from "./supabase/types";

/**
 * Filters applications to show only those owned by the logged-in member.
 * An application is owned when EITHER:
 * - its application_data.email matches the verified email (case-insensitive), OR
 * - it has no email in application_data, is linked to the member's own member_id,
 *   and that member record's email matches the verified email (case-insensitive)
 * 
 * Applications with an email that doesn't match are hidden to prevent seeing
 * forms submitted by others with the same service number.
 */
export function filterOwnedApplications(
  applications: Application[],
  verifiedEmail: string,
  memberEmail: string,
  memberId: string
): Application[] {
  const verifiedLower = verifiedEmail.toLowerCase();
  const memberLower = memberEmail.toLowerCase();

  return applications.filter((app) => {
    const appEmail = app.application_data?.email;

    // If the application has an email, it must match the verified email
    if (typeof appEmail === 'string') {
      return appEmail.toLowerCase() === verifiedLower;
    }

    // If no email in application_data:
    // - Must be linked to the member's own member_id
    // - The member record's email must match the verified login email
    return app.member_id === memberId && memberLower === verifiedLower;
  });
}
