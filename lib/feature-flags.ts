/**
 * Launch switches. Each section stays off unless its environment variable is
 * set to a truthy value and the site is redeployed.
 *
 *   ENABLE_HOTEL=true
 *   ENABLE_MEMBERSHIP_SERVICES=true
 *   ENABLE_MEMBERSHIP_SIGNUP=true
 *   ENABLE_ADMIN=true
 *
 * Unset, empty, or any other value means off. Accepted on-values: true, 1, yes, on.
 */

export type SiteSection = "hotel" | "membershipServices" | "membershipSignup" | "admin";

export const SECTION_ENV: Record<SiteSection, string> = {
  hotel: "ENABLE_HOTEL",
  membershipServices: "ENABLE_MEMBERSHIP_SERVICES",
  membershipSignup: "ENABLE_MEMBERSHIP_SIGNUP",
  admin: "ENABLE_ADMIN",
};

/** Query value used by the coming-soon page. */
export const SECTION_QUERY: Record<SiteSection, string> = {
  hotel: "hotel",
  membershipServices: "membership-services",
  membershipSignup: "membership-signup",
  admin: "admin",
};

const ON_VALUES = new Set(["1", "true", "yes", "on"]);

export function envFlagEnabled(value: string | undefined): boolean {
  if (!value) return false;
  return ON_VALUES.has(value.trim().toLowerCase());
}

export function isSectionEnabled(section: SiteSection): boolean {
  switch (section) {
    case "hotel":
      return envFlagEnabled(process.env.ENABLE_HOTEL);
    case "membershipServices":
      return envFlagEnabled(process.env.ENABLE_MEMBERSHIP_SERVICES);
    case "membershipSignup":
      return envFlagEnabled(process.env.ENABLE_MEMBERSHIP_SIGNUP);
    case "admin":
      return envFlagEnabled(process.env.ENABLE_ADMIN);
    default:
      return false;
  }
}

type SectionRule = {
  section: SiteSection;
  /** Matched exactly, or as a path prefix (`/members` matches `/members/login`). */
  prefixes: readonly string[];
};

/**
 * Pages and APIs owned by each switch. Prefixes use a path boundary so
 * `/member` does not also match `/membership-services` or `/members`.
 */
const SECTION_RULES: readonly SectionRule[] = [
  {
    section: "hotel",
    prefixes: [
      "/hotel-reservations",
      "/noel-chase-hotel-and-conference-centre",
      "/api/hotel",
      "/api/hotel-availability",
      "/api/hotel-booking",
      "/api/cron/hotel-performance-report",
    ],
  },
  {
    section: "membershipServices",
    prefixes: [
      "/membership-services",
      "/legal-aid-application",
      "/dental-optical-grant",
      "/retirement-benefit-application",
      "/merit-loan-application",
      "/api/legal-aid-application",
      "/api/dental-optical-grant",
      "/api/retirement-benefit-application",
      "/api/merit-loan-application",
      "/api/merit-salary-deduction",
      "/api/upload/request-signed-url",
    ],
  },
  {
    section: "membershipSignup",
    prefixes: [
      "/become-a-member",
      "/membership-form",
      "/membership-registration",
      "/salary-deduction",
      "/register",
      "/login",
      "/members",
      "/members-portal",
      "/verify-email",
      "/member",
      "/services/membership-application",
      "/dashboard/apply-membership",
      "/api/auth/register",
      "/api/auth/verify-email",
      "/api/auth/resend-verification",
      "/api/auth/session",
      "/api/members",
      "/api/member-signup",
      "/api/salary-deduction",
      "/api/membership/apply",
      "/api/member",
    ],
  },
  {
    section: "admin",
    prefixes: ["/admin", "/api/admin", "/unauthorized"],
  },
];

export function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Section that should be hidden for this path, or null when the path stays live. */
export function disabledSectionForPath(pathname: string): SiteSection | null {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  for (const rule of SECTION_RULES) {
    if (isSectionEnabled(rule.section)) continue;
    if (rule.prefixes.some((prefix) => pathMatchesPrefix(path, prefix))) {
      return rule.section;
    }
  }
  return null;
}

/**
 * Public paths to disallow in robots.txt while their section is off.
 * Google treats each rule as a prefix, so `/member` would also hide
 * `/membership-services`. Those short prefixes are anchored instead.
 */
export function disabledPublicPaths(): string[] {
  const paths: string[] = [];
  for (const rule of SECTION_RULES) {
    if (isSectionEnabled(rule.section)) continue;
    for (const prefix of rule.prefixes) {
      if (prefix.startsWith("/api/")) continue;
      if (prefix === "/member" || prefix === "/members" || prefix === "/admin") {
        paths.push(`${prefix}/`);
        paths.push(`${prefix}$`);
      } else {
        paths.push(prefix);
      }
    }
  }
  return paths;
}
