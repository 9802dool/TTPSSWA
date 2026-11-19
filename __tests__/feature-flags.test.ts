import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  disabledPublicPaths,
  disabledSectionForPath,
  envFlagEnabled,
  isSectionEnabled,
} from "@/lib/feature-flags";
import { middleware } from "@/middleware";

const FLAG_KEYS = [
  "ENABLE_HOTEL",
  "ENABLE_MEMBERSHIP_SERVICES",
  "ENABLE_MEMBERSHIP_SIGNUP",
  "ENABLE_ADMIN",
] as const;

const original = Object.fromEntries(FLAG_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of FLAG_KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("envFlagEnabled", () => {
  it("is off when unset or not a recognised on-value", () => {
    expect(envFlagEnabled(undefined)).toBe(false);
    expect(envFlagEnabled("")).toBe(false);
    expect(envFlagEnabled("false")).toBe(false);
    expect(envFlagEnabled("0")).toBe(false);
    expect(envFlagEnabled("no")).toBe(false);
  });

  it("accepts true, 1, yes, and on", () => {
    expect(envFlagEnabled("true")).toBe(true);
    expect(envFlagEnabled(" TRUE ")).toBe(true);
    expect(envFlagEnabled("1")).toBe(true);
    expect(envFlagEnabled("yes")).toBe(true);
    expect(envFlagEnabled("on")).toBe(true);
  });
});

describe("disabledSectionForPath", () => {
  it("hides launch sections by default and leaves the public site alone", () => {
    expect(isSectionEnabled("hotel")).toBe(false);
    expect(disabledSectionForPath("/hotel-reservations")).toBe("hotel");
    expect(disabledSectionForPath("/noel-chase-hotel-and-conference-centre")).toBe("hotel");
    expect(disabledSectionForPath("/api/hotel/book")).toBe("hotel");
    expect(disabledSectionForPath("/api/hotel-availability")).toBe("hotel");
    expect(disabledSectionForPath("/api/hotel-booking/quotation-open")).toBe("hotel");
    expect(disabledSectionForPath("/api/cron/hotel-performance-report")).toBe("hotel");

    expect(disabledSectionForPath("/membership-services")).toBe("membershipServices");
    expect(disabledSectionForPath("/membership-services/6")).toBe("membershipServices");
    expect(disabledSectionForPath("/legal-aid-application")).toBe("membershipServices");
    expect(disabledSectionForPath("/dental-optical-grant")).toBe("membershipServices");
    expect(disabledSectionForPath("/retirement-benefit-application")).toBe("membershipServices");
    expect(disabledSectionForPath("/merit-loan-application")).toBe("membershipServices");
    expect(disabledSectionForPath("/api/merit-salary-deduction")).toBe("membershipServices");
    expect(disabledSectionForPath("/api/upload/request-signed-url")).toBe("membershipServices");

    expect(disabledSectionForPath("/become-a-member")).toBe("membershipSignup");
    expect(disabledSectionForPath("/membership-form")).toBe("membershipSignup");
    expect(disabledSectionForPath("/salary-deduction")).toBe("membershipSignup");
    expect(disabledSectionForPath("/register")).toBe("membershipSignup");
    expect(disabledSectionForPath("/login")).toBe("membershipSignup");
    expect(disabledSectionForPath("/members/login")).toBe("membershipSignup");
    expect(disabledSectionForPath("/verify-email")).toBe("membershipSignup");
    expect(disabledSectionForPath("/member/dashboard")).toBe("membershipSignup");
    expect(disabledSectionForPath("/services/membership-application")).toBe("membershipSignup");
    expect(disabledSectionForPath("/api/auth/register")).toBe("membershipSignup");
    expect(disabledSectionForPath("/api/auth/session")).toBe("membershipSignup");
    expect(disabledSectionForPath("/api/members/login")).toBe("membershipSignup");
    expect(disabledSectionForPath("/api/member-signup")).toBe("membershipSignup");
    expect(disabledSectionForPath("/api/salary-deduction")).toBe("membershipSignup");
    expect(disabledSectionForPath("/api/member/upload-document")).toBe("membershipSignup");

    expect(disabledSectionForPath("/admin")).toBe("admin");
    expect(disabledSectionForPath("/admin/login")).toBe("admin");
    expect(disabledSectionForPath("/admin/hotel-reservations")).toBe("admin");
    expect(disabledSectionForPath("/api/admin/login")).toBe("admin");
    expect(disabledSectionForPath("/api/admin/check-bootstrap")).toBe("admin");

    for (const live of [
      "/",
      "/about",
      "/executive",
      "/central-committee-representatives",
      "/central-committee-representatives/acib",
      "/committees",
      "/committees/education-committee",
      "/subsidiaries",
      "/subsidiaries/antar-auto",
      "/beetham-np-service-station",
      "/laventille-np-service-station",
      "/partnership",
      "/partnership/hardware-and-beyond",
      "/rule-book",
      "/privacy-policy",
      "/coming-soon",
      "/api/analytics/track",
      "/api/cron/cleanup-orphaned-uploads",
    ]) {
      expect(disabledSectionForPath(live)).toBeNull();
    }
  });

  it("does not treat /member as a prefix of membership or members paths", () => {
    expect(disabledSectionForPath("/membership-services")).not.toBe("membershipSignup");
    expect(disabledSectionForPath("/members/login")).toBe("membershipSignup");
    expect(disabledSectionForPath("/member/dashboard")).toBe("membershipSignup");
  });

  it("robots rules do not prefix-block a section that is turned back on", () => {
    process.env.ENABLE_MEMBERSHIP_SERVICES = "true";
    const rules = disabledPublicPaths();
    const blocked = (url: string) =>
      rules.some((rule) =>
        rule.endsWith("$") ? url === rule.slice(0, -1) : url.startsWith(rule),
      );
    expect(blocked("/membership-services")).toBe(false);
    expect(blocked("/membership-services/1")).toBe(false);
    expect(blocked("/member/dashboard")).toBe(true);
    expect(blocked("/members/login")).toBe(true);
  });

  it("opens only the section whose variable is set", () => {
    process.env.ENABLE_HOTEL = "true";
    expect(disabledSectionForPath("/hotel-reservations")).toBeNull();
    expect(disabledSectionForPath("/api/hotel/book")).toBeNull();
    expect(disabledSectionForPath("/membership-services")).toBe("membershipServices");
    expect(disabledSectionForPath("/admin")).toBe("admin");
    expect(disabledPublicPaths().some((path) => path.startsWith("/hotel"))).toBe(false);
  });
});

describe("middleware", () => {
  it("returns 503 for a switched-off API and does not continue", () => {
    const res = middleware(
      new NextRequest("https://ttpsswa.org/api/hotel/book", { method: "POST" }),
    );
    expect(res.status).toBe(503);
    expect(res.headers.get("x-middleware-next")).toBeNull();
  });

  it("rewrites a switched-off page to coming soon", () => {
    const res = middleware(new NextRequest("https://ttpsswa.org/legal-aid-application"));
    expect(res.headers.get("x-middleware-rewrite")).toContain(
      "/coming-soon?section=membership-services",
    );
  });

  it("leaves live pages and the analytics API alone", () => {
    const page = middleware(new NextRequest("https://ttpsswa.org/rule-book"));
    expect(page.headers.get("x-middleware-rewrite")).toBeNull();
    expect(page.status).toBe(200);

    const api = middleware(
      new NextRequest("https://ttpsswa.org/api/analytics/track", { method: "POST" }),
    );
    expect(api.status).toBe(200);
    expect(api.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
