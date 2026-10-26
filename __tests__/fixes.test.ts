import { describe, it, expect, vi, beforeEach } from "vitest";
import { filterOwnedApplications } from "../lib/dashboard-filters";
import type { Application } from "@/lib/supabase/types";

// Test 1: Member dashboard email filtering (using real function)
describe("filterOwnedApplications", () => {
  const createApp = (id: string, memberId: string, appData: Record<string, unknown>): Application => ({
    id,
    member_id: memberId,
    application_type: "salary_deduction",
    application_data: appData,
    status: "submitted",
    submitted_at: "2026-10-26T10:00:00Z",
    updated_at: "2026-10-26T10:00:00Z",
    admin_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    legacy_redis_id: null,
  });

  it("shows applications with matching email (case-insensitive)", () => {
    const apps = [
      createApp("app-1", "member-1", { email: "user@example.com" }),
      createApp("app-2", "member-1", { email: "USER@EXAMPLE.COM" }),
      createApp("app-3", "member-1", { email: "other@example.com" }),
    ];

    const result = filterOwnedApplications(
      apps,
      "user@example.com",
      "user@example.com",
      "member-1"
    );

    expect(result).toHaveLength(2);
    expect(result.map(a => a.id)).toEqual(["app-1", "app-2"]);
  });

  it("shows applications with no email if linked to member and member email matches", () => {
    const apps = [
      createApp("app-1", "member-1", { regimentalNumber: "12345" }), // no email
      createApp("app-2", "member-2", { regimentalNumber: "67890" }), // different member
    ];

    const result = filterOwnedApplications(
      apps,
      "user@example.com",
      "user@example.com",
      "member-1"
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("app-1");
  });

  it("hides applications with no email if member email doesn't match verified email", () => {
    const apps = [
      createApp("app-1", "member-1", { regimentalNumber: "12345" }), // no email
    ];

    const result = filterOwnedApplications(
      apps,
      "verified@example.com",
      "different@example.com",
      "member-1"
    );

    expect(result).toHaveLength(0);
  });

  it("hides applications with mismatched email", () => {
    const apps = [
      createApp("app-1", "member-1", { email: "other@example.com" }),
    ];

    const result = filterOwnedApplications(
      apps,
      "user@example.com",
      "user@example.com",
      "member-1"
    );

    expect(result).toHaveLength(0);
  });

  it("handles mixed scenarios correctly", () => {
    const apps = [
      createApp("app-1", "member-1", { email: "user@example.com" }), // match
      createApp("app-2", "member-1", { email: "other@example.com" }), // no match
      createApp("app-3", "member-1", { regimentalNumber: "123" }), // no email, should show
      createApp("app-4", "member-2", { regimentalNumber: "456" }), // different member
    ];

    const result = filterOwnedApplications(
      apps,
      "user@example.com",
      "user@example.com",
      "member-1"
    );

    expect(result).toHaveLength(2);
    expect(result.map(a => a.id)).toEqual(["app-1", "app-3"]);
  });
});

// Test 2: Member-signup JSON handler (testing real route with mocks)
describe("member-signup JSON handler", () => {
  const mocks = vi.hoisted(() => ({
    upsertMember: vi.fn(),
    createApplication: vi.fn(),
    checkRateLimit: vi.fn(),
    sendAdminNotification: vi.fn(),
    notifyMembershipApplicationPending: vi.fn(),
  }));

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function setupMocksAndLoadRoute() {
    vi.doMock("@/lib/supabase/applications", () => ({
      upsertMember: mocks.upsertMember,
      createApplication: mocks.createApplication,
      uploadApplicationDocument: vi.fn().mockResolvedValue({ document_id: "doc-1" }),
    }));
    vi.doMock("@/lib/supabase/server", () => ({ isSupabaseConfigured: () => true }));
    vi.doMock("@/lib/rate-limit", () => ({
      checkRateLimit: mocks.checkRateLimit,
      getClientIP: () => "203.0.113.1",
      RATE_LIMITS: { applicationForm: { maxRequests: 5, windowSeconds: 3600 } },
    }));
    vi.doMock("@/lib/email-notifications", () => ({
      sendAdminNotification: mocks.sendAdminNotification,
    }));
    vi.doMock("@/lib/member-application-notify", () => ({
      notifyMembershipApplicationPending: mocks.notifyMembershipApplicationPending,
    }));
    vi.doMock("@/lib/spam-protection", () => ({
      checkHoneypot: (val: unknown) => typeof val === "string" && val.length > 0,
      verifyFormToken: () => ({ valid: true, skipCheck: true }),
    }));
    vi.doMock("@/lib/turnstile", () => ({
      isTurnstileConfigured: () => false,
      verifyTurnstileToken: vi.fn(),
    }));

    mocks.upsertMember.mockResolvedValue({ member_id: "member-1", is_new: true });
    mocks.createApplication.mockResolvedValue({ application_id: "app-1" });
    mocks.checkRateLimit.mockResolvedValue({ success: true, remaining: 4, resetAt: 0 });
    mocks.sendAdminNotification.mockResolvedValue(undefined);
    mocks.notifyMembershipApplicationPending.mockResolvedValue(undefined);

    return import("../app/api/member-signup/route");
  }

  it("rejects honeypot spam in JSON", async () => {
    const { POST } = await setupMocksAndLoadRoute();
    const request = new Request("https://example.test/api/member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Bot",
        email: "bot@spam.com",
        phone: "1234567",
        website: "http://spam.com",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual({ ok: true });
    expect(mocks.upsertMember).not.toHaveBeenCalled();
  });

  it("applies rate limiting to JSON requests", async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({ success: false, remaining: 0, resetAt: Date.now() });
    const { POST } = await setupMocksAndLoadRoute();
    const request = new Request("https://example.test/api/member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test",
        email: "test@example.com",
        phone: "1234567",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain("Too many");
  });

  it("returns correct shape for valid JSON request", async () => {
    const { POST } = await setupMocksAndLoadRoute();
    const request = new Request("https://example.test/api/member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Valid User",
        email: "valid@example.com",
        phone: "1234567",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({ ok: true });
    expect(mocks.upsertMember).toHaveBeenCalled();
  });
});

