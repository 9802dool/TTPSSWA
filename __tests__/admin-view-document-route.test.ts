import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  session: null as null | { userId: string; email: string },
  doc: null as null | Record<string, unknown>,
  download: vi.fn(),
  getDocumentSignedUrl: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => (mocks.session ? { value: "tok" } : undefined) }),
}));
vi.mock("@/lib/admin-auth", () => ({
  verifyAdminSession: () => mocks.session,
  getAdminCookieName: () => "admin",
}));
vi.mock("@/lib/supabase/server", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/supabase/applications", () => ({ getDocumentSignedUrl: mocks.getDocumentSignedUrl }));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => (mocks.doc ? { data: mocks.doc, error: null } : { data: null, error: { message: "nf" } }),
        }),
      }),
    }),
    storage: { from: () => ({ download: mocks.download }) },
  }),
}));

import { GET } from "@/app/api/admin/view-document/route";

describe("GET /api/admin/view-document", () => {
  beforeEach(() => {
    mocks.session = { userId: "u1", email: "admin@example.com" };
    mocks.doc = {
      id: "d1",
      storage_bucket: "application-documents",
      storage_path: "a1/1-DEMO-id-card.jpg",
      mime_type: "image/jpeg",
      file_name: "DEMO-id-card.jpg",
      file_size_bytes: 3,
    };
    mocks.download.mockReset().mockResolvedValue({ data: new Blob(["jpg"], { type: "image/jpeg" }), error: null });
    mocks.getDocumentSignedUrl.mockReset();
  });

  it("requires an admin session", async () => {
    mocks.session = null;
    const res = await GET(new Request("https://site/api/admin/view-document?id=d1"));
    expect(res.status).toBe(401);
    expect(mocks.download).not.toHaveBeenCalled();
  });

  it("opens the document inline instead of downloading it", async () => {
    const res = await GET(new Request("https://site/api/admin/view-document?id=d1"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("content-disposition")).toMatch(/^inline;/);
    expect(mocks.download).toHaveBeenCalledWith("a1/1-DEMO-id-card.jpg");
    expect(mocks.getDocumentSignedUrl).not.toHaveBeenCalled();
  });

  it("404s for an unknown document", async () => {
    mocks.doc = null;
    const res = await GET(new Request("https://site/api/admin/view-document?id=nope"));
    expect(res.status).toBe(404);
  });
});
