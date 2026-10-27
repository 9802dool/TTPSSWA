import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => null }));

import { createUploadToken, verifyUploadToken, isUploadTokenSecretConfigured } from "@/lib/upload-tokens";
import { matchDocumentUploads } from "@/lib/supabase/direct-upload";
import { buildMemberSearchFilter, parsePagination } from "@/lib/supabase/applications";
import { formFieldsToJson, resolveMimeType, checkDocuments } from "@/lib/direct-upload-client";

afterEach(() => vi.unstubAllEnvs());

describe("upload tokens", () => {
  it("fails closed with no secret (no hard-coded fallback)", () => {
    vi.stubEnv("UPLOAD_TOKEN_SECRET", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("NEXTAUTH_SECRET", "something");
    expect(isUploadTokenSecretConfigured()).toBe(false);
    expect(() => createUploadToken("pending/a.pdf", "application/pdf", 10)).toThrow();
    expect(verifyUploadToken("x.y")).toBeNull();
  });

  it("uses the service role key when UPLOAD_TOKEN_SECRET is unset", () => {
    vi.stubEnv("UPLOAD_TOKEN_SECRET", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
    const t = createUploadToken("pending/a.pdf", "application/pdf", 10);
    expect(verifyUploadToken(t)).toMatchObject({ path: "pending/a.pdf", mimeType: "application/pdf", maxSize: 10 });
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "other-key");
    expect(verifyUploadToken(t)).toBeNull();
  });

  it("rejects tampered and expired tokens", () => {
    vi.stubEnv("UPLOAD_TOKEN_SECRET", "s3cret");
    const now = 1_800_000_000_000;
    const t = createUploadToken("pending/a.pdf", "application/pdf", 10, now);
    expect(verifyUploadToken(t, now + 1000)).not.toBeNull();
    expect(verifyUploadToken(t, now + 11 * 60 * 1000)).toBeNull();
    const [data, sig] = t.split(".");
    const forged = Buffer.from("pending/b.pdf:application/pdf:10:" + now).toString("base64url");
    expect(verifyUploadToken(`${forged}.${sig}`, now)).toBeNull();
    expect(verifyUploadToken(`${data}.${"0".repeat(64)}`, now)).toBeNull();
  });
});

describe("matchDocumentUploads", () => {
  const docs = [
    { name: "a", label: "Doc A" },
    { name: "b", label: "Doc B", required: false },
  ];
  const u = (documentType: string) => ({ path: "pending/x", token: "t", fileName: "f.pdf", documentType });
  it("accepts required docs and maps labels", () => {
    const r = matchDocumentUploads([u("a")], docs);
    expect(r).toMatchObject({ ok: true, uploads: [{ documentType: "a", label: "Doc A" }] });
  });
  it("rejects missing, duplicate, unknown and malformed entries", () => {
    expect(matchDocumentUploads([u("b")], docs).ok).toBe(false);
    expect(matchDocumentUploads([u("a"), u("a")], docs).ok).toBe(false);
    expect(matchDocumentUploads([u("a"), u("zzz")], docs).ok).toBe(false);
    expect(matchDocumentUploads([{ path: 1 }], docs).ok).toBe(false);
    expect(matchDocumentUploads("nope", docs).ok).toBe(false);
  });
});

describe("member search filter", () => {
  it("quotes the term and strips filter syntax", () => {
    const f = buildMemberSearchFilter('x%,id.eq.1),or(email.ilike.*"\\', ["full_name", "email"])!;
    expect(f.split(",")).toHaveLength(2);
    expect(f).not.toMatch(/[()*\\]/);
    // Injection attempt ends up as inert text inside the quoted ilike values.
    expect(f).toBe('full_name.ilike."%x id.eq.1 or email.ilike.%",email.ilike."%x id.eq.1 or email.ilike.%"');
    expect(f.startsWith('full_name.ilike."%')).toBe(true);
  });
  it("keeps normal names and emails", () => {
    expect(buildMemberSearchFilter("O'Neil", ["full_name"])).toBe(`full_name.ilike."%O'Neil%"`);
    expect(buildMemberSearchFilter("a.b@example.com", ["email"])).toBe(`email.ilike."%a.b@example.com%"`);
    expect(buildMemberSearchFilter("  ,,() ", ["email"])).toBeNull();
  });
});

describe("parsePagination", () => {
  it("handles junk input", () => {
    expect(parsePagination("abc", "zz")).toEqual({ page: 1, limit: 50, offset: 0 });
    expect(parsePagination("-3", "5000")).toEqual({ page: 1, limit: 100, offset: 0 });
    expect(parsePagination("3", "20")).toEqual({ page: 3, limit: 20, offset: 40 });
  });
});

describe("direct upload client helpers", () => {
  it("serialises text fields and arrays, drops files", () => {
    const fd = new FormData();
    fd.set("name", "A");
    fd.append("grantType", "dental");
    fd.append("grantType", "optical");
    fd.set("doc", new File(["%PDF"], "a.pdf", { type: "application/pdf" }));
    expect(formFieldsToJson(fd, ["grantType"])).toEqual({ name: "A", grantType: ["dental", "optical"] });
  });
  it("resolves MIME types and checks documents", () => {
    expect(resolveMimeType(new File(["x"], "a.JPG", { type: "" }))).toBe("image/jpeg");
    expect(resolveMimeType(new File(["x"], "a.gif", { type: "image/gif" }))).toBeNull();
    const fd = new FormData();
    expect(checkDocuments(fd, [{ name: "d", label: "the doc" }])).toBe("Please upload the doc.");
    fd.set("d", new File([new Uint8Array(11 * 1024 * 1024)], "big.pdf", { type: "application/pdf" }));
    expect(checkDocuments(fd, [{ name: "d", label: "The doc" }])).toMatch(/10 MB/);
  });
});
