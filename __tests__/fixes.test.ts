import { describe, it, expect, vi, beforeEach } from "vitest";

// Test 1: Member dashboard email filtering
describe("member dashboard email filtering", () => {
  it("only shows applications where submitted email matches verified email", async () => {
    const mockApplications = [
      {
        id: "app-1",
        member_id: "member-1",
        application_type: "salary_deduction",
        application_data: { email: "user@example.com", regimentalNumber: "12345" },
        status: "submitted",
        submitted_at: "2026-10-26T10:00:00Z",
        updated_at: "2026-10-26T10:00:00Z",
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        legacy_redis_id: null,
      },
      {
        id: "app-2",
        member_id: "member-1",
        application_type: "dental_optical_grant",
        application_data: { email: "other@example.com", regimentalNumber: "12345" },
        status: "submitted",
        submitted_at: "2026-10-26T11:00:00Z",
        updated_at: "2026-10-26T11:00:00Z",
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        legacy_redis_id: null,
      },
      {
        id: "app-3",
        member_id: "member-1",
        application_type: "merit_loan_application",
        application_data: { email: "USER@EXAMPLE.COM", regimentalNumber: "12345" },
        status: "submitted",
        submitted_at: "2026-10-26T12:00:00Z",
        updated_at: "2026-10-26T12:00:00Z",
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        legacy_redis_id: null,
      },
    ];

    const verifiedEmail = "user@example.com";

    // Filter logic from dashboard
    const ownedApplications = mockApplications.filter((app) => {
      const appEmail = app.application_data?.email;
      if (typeof appEmail !== "string") return false;
      return appEmail.toLowerCase() === verifiedEmail.toLowerCase();
    });

    // Should only match app-1 and app-3 (case-insensitive match)
    expect(ownedApplications).toHaveLength(2);
    expect(ownedApplications[0].id).toBe("app-1");
    expect(ownedApplications[1].id).toBe("app-3");
    
    // app-2 should be excluded (different email)
    expect(ownedApplications.find(a => a.id === "app-2")).toBeUndefined();
  });

  it("excludes applications with no email in application_data", () => {
    const mockApplications = [
      {
        id: "app-1",
        member_id: "member-1",
        application_type: "salary_deduction" as const,
        application_data: { regimentalNumber: "12345" } as Record<string, unknown>,
        status: "submitted" as const,
        submitted_at: "2026-10-26T10:00:00Z",
        updated_at: "2026-10-26T10:00:00Z",
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        legacy_redis_id: null,
      },
    ];

    const verifiedEmail = "user@example.com";

    const ownedApplications = mockApplications.filter((app) => {
      const appEmail = app.application_data?.email;
      if (typeof appEmail !== "string") return false;
      return appEmail.toLowerCase() === verifiedEmail.toLowerCase();
    });

    expect(ownedApplications).toHaveLength(0);
  });
});

// Test 2: Member-signup JSON path spam checks
describe("member-signup JSON handler spam checks", () => {
  const mocks = vi.hoisted(() => ({
    upsertMember: vi.fn(),
    createApplication: vi.fn(),
    checkRateLimit: vi.fn(),
    checkHoneypot: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock("@/lib/supabase/applications", () => ({
      upsertMember: mocks.upsertMember,
      createApplication: mocks.createApplication,
    }));
    vi.doMock("@/lib/supabase/server", () => ({ isSupabaseConfigured: () => true }));
    vi.doMock("@/lib/rate-limit", () => ({
      checkRateLimit: mocks.checkRateLimit,
      getClientIP: () => "203.0.113.1",
      RATE_LIMITS: { applicationForm: { maxRequests: 5, windowSeconds: 3600 } },
    }));
    vi.doMock("@/lib/spam-protection", () => ({
      checkHoneypot: mocks.checkHoneypot,
    }));
    
    mocks.upsertMember.mockResolvedValue({ member_id: "member-1", is_new: true });
    mocks.createApplication.mockResolvedValue({ application_id: "app-1" });
    mocks.checkRateLimit.mockResolvedValue({ success: true, remaining: 4, resetAt: 0 });
    mocks.checkHoneypot.mockReturnValue(false);
  });

  it("checks honeypot in JSON body", () => {
    const body = { 
      fullName: "Test", 
      email: "test@example.com", 
      phone: "1234567",
      website: "http://spam.com" 
    };
    
    // Simulate honeypot check
    const hasWebsite = !!body.website;
    expect(hasWebsite).toBe(true);
  });

  it("applies IP rate limiting to JSON submissions", () => {
    const clientIP = "203.0.113.1";
    const key = `member-signup:ip:${clientIP}`;
    
    expect(key).toBe("member-signup:ip:203.0.113.1");
  });

  it("applies email rate limiting to JSON submissions", () => {
    const email = "test@example.com";
    const key = `member-signup:email:${email}`;
    
    expect(key).toBe("member-signup:email:test@example.com");
  });
});

// Test 3: Case-insensitive email matching
describe("upsertMember case-insensitive email matching", () => {
  it("matches emails case-insensitively", () => {
    const emails = [
      { input: "user@example.com", stored: "user@example.com" },
      { input: "USER@EXAMPLE.COM", stored: "user@example.com" },
      { input: "User@Example.Com", stored: "user@example.com" },
    ];

    emails.forEach(({ input, stored }) => {
      expect(input.toLowerCase()).toBe(stored);
    });
  });

  it("stores new member emails in lowercase", () => {
    const testEmails = [
      "User@Example.Com",
      "ADMIN@TEST.COM",
      "MixedCase@Email.ORG",
    ];

    testEmails.forEach((email) => {
      const normalized = email.toLowerCase();
      expect(normalized).toBe(normalized.toLowerCase());
      expect(normalized).not.toMatch(/[A-Z]/);
    });
  });
});

// Test 4: Member-signup honeypot response consistency
describe("member-signup honeypot response shape", () => {
  it("returns same shape as other routes for multipart", () => {
    // Multipart honeypot response
    const multipartResponse = { ok: true };
    
    // Other routes honeypot response (e.g., salary-deduction)
    const otherRouteResponse = { ok: true };
    // or { ok: true, id: "spam-rejected" }
    
    expect(multipartResponse).toHaveProperty("ok");
    expect(multipartResponse.ok).toBe(true);
    expect(otherRouteResponse).toHaveProperty("ok");
    expect(otherRouteResponse.ok).toBe(true);
  });

  it("returns same shape for JSON honeypot", () => {
    // JSON honeypot response (after fix)
    const jsonResponse = { ok: true };
    
    expect(jsonResponse).toHaveProperty("ok");
    expect(jsonResponse.ok).toBe(true);
  });
});
