/**
 * Builds the applicant's display name for admin views (list, search, CSV,
 * status emails).
 *
 * Several forms (e.g. Merit Loan) do not store a single `fullName` in
 * application_data: the name is captured as first/last name fields or only on
 * the linked member record. Previously the admin list showed "N/A" for them.
 *
 * Order: fullName → guestName → applicantName → first/middle/last name fields
 * → linked member's full_name. Returns "" when nothing is available.
 */
const FIRST_NAME_KEYS = ["firstName", "first_name", "givenName"] as const;
const MIDDLE_NAME_KEYS = ["middleName", "middle_name", "otherNames"] as const;
const LAST_NAME_KEYS = ["surname", "lastName", "last_name", "familyName"] as const;

function str(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

function firstOf(data: Record<string, unknown>, keys: readonly string[]): string {
  for (const k of keys) {
    const v = str(data[k]);
    if (v) return v;
  }
  return "";
}

export function getApplicantDisplayName(
  applicationData: unknown,
  memberFullName?: string | null,
): string {
  const data =
    applicationData && typeof applicationData === "object" && !Array.isArray(applicationData)
      ? (applicationData as Record<string, unknown>)
      : {};

  const direct = firstOf(data, ["fullName", "full_name", "guestName", "applicantName"]);
  if (direct) return direct;

  const parts = [
    firstOf(data, FIRST_NAME_KEYS),
    firstOf(data, MIDDLE_NAME_KEYS),
    firstOf(data, LAST_NAME_KEYS),
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");

  return str(memberFullName);
}
