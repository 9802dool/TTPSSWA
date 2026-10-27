import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildContentDisposition,
  buildDocumentResponseHeaders,
  isInlineViewable,
  serveDocumentInline,
  MAX_PROXIED_DOCUMENT_BYTES,
} from "@/lib/document-inline";

function fakeSupabase(result: { data: Blob | null; error: unknown }) {
  const download = vi.fn().mockResolvedValue(result);
  const from = vi.fn(() => ({ download }));
  return { client: { storage: { from } }, from, download };
}

const pdfDoc = {
  storage_bucket: "application-documents",
  storage_path: "app-id/123-DEMO-payslip.pdf",
  mime_type: "application/pdf",
  file_name: "DEMO-payslip.pdf",
  file_size_bytes: 10,
};

describe("document inline headers", () => {
  it("serves PDFs and images inline with their real type", () => {
    for (const mime of ["application/pdf", "image/jpeg", "image/png", "image/webp"]) {
      expect(isInlineViewable(mime)).toBe(true);
      const h = buildDocumentResponseHeaders({ mime_type: mime, file_name: "f" });
      expect(h["Content-Type"]).toBe(mime);
      expect(h["Content-Disposition"].startsWith("inline;")).toBe(true);
      expect(h["X-Content-Type-Options"]).toBe("nosniff");
    }
  });

  it("never renders other types inline (e.g. HTML/SVG uploads)", () => {
    for (const mime of ["text/html", "image/svg+xml", "", null]) {
      const h = buildDocumentResponseHeaders({ mime_type: mime, file_name: "x.html" });
      expect(h["Content-Type"]).toBe("application/octet-stream");
      expect(h["Content-Disposition"].startsWith("attachment;")).toBe(true);
      expect(h["Content-Security-Policy"]).toContain("sandbox");
    }
  });

  it("leaves PDFs without a CSP so Chrome's viewer can render them", () => {
    expect(buildDocumentResponseHeaders(pdfDoc)["Content-Security-Policy"]).toBeUndefined();
    expect(buildDocumentResponseHeaders({ mime_type: "image/jpeg", file_name: "a.jpg" })["Content-Security-Policy"]).toContain("default-src 'none'");
  });

  it("encodes file names safely (no header injection)", () => {
    const cd = buildContentDisposition("inline", 'bad"name\r\nSet-Cookie: x=1;é.pdf');
    expect(cd).not.toMatch(/[\r\n]/);
    expect(cd).toMatch(/^inline; filename="[^"]*"; filename\*=UTF-8''/);
    expect(cd).toContain("%C3%A9");
    expect(buildContentDisposition("inline", "")).toContain('filename="document"');
  });
});

describe("serveDocumentInline", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("streams small files with inline Content-Disposition", async () => {
    const { client, from, download } = fakeSupabase({
      data: new Blob(["%PDF-1.4 demo"], { type: "application/pdf" }),
      error: null,
    });
    const fallback = vi.fn();
    const res = await serveDocumentInline(client, pdfDoc, fallback);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toMatch(/^inline; filename="DEMO-payslip.pdf"/);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(await res.text()).toBe("%PDF-1.4 demo");
    expect(from).toHaveBeenCalledWith("application-documents");
    expect(download).toHaveBeenCalledWith(pdfDoc.storage_path);
    expect(fallback).not.toHaveBeenCalled();
  });

  it("redirects large files to the (non-download) signed URL without proxying", async () => {
    const { client, download } = fakeSupabase({ data: null, error: null });
    const url = "https://x.supabase.co/storage/v1/object/sign/application-documents/a.pdf?token=t";
    const res = await serveDocumentInline(
      client,
      { ...pdfDoc, file_size_bytes: MAX_PROXIED_DOCUMENT_BYTES + 1 },
      async () => url,
    );
    expect(download).not.toHaveBeenCalled();
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(url);
    expect(res.headers.get("location")).not.toContain("download");
  });

  it("falls back to the signed URL when the storage download fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeSupabase({ data: null, error: new Error("boom") });
    const res = await serveDocumentInline(client, pdfDoc, async () => "https://signed.example/doc");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://signed.example/doc");
  });

  it("returns 500 when neither streaming nor signing works", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeSupabase({ data: null, error: new Error("boom") });
    const res = await serveDocumentInline(client, pdfDoc, async () => null);
    expect(res.status).toBe(500);
  });
});
