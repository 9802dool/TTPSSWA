/**
 * Helpers for showing uploaded application documents inline in the browser
 * (instead of triggering a download).
 *
 * Only types that browsers can render safely are served inline. Anything else
 * (or an unexpected stored type) is sent as an attachment so it can never be
 * rendered as active content on our origin.
 */
export const INLINE_VIEWABLE_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Largest file we stream through our own function. Vercel caps function
 * response bodies at ~4.5 MB, so larger files fall back to a short-lived
 * signed storage URL (still without the download option, so it opens inline).
 */
export const MAX_PROXIED_DOCUMENT_BYTES = 4 * 1024 * 1024;

export function isInlineViewable(mimeType: string | null | undefined): boolean {
  return INLINE_VIEWABLE_MIME_TYPES.has(String(mimeType ?? "").toLowerCase().trim());
}

/** Plain-ASCII fallback filename for the Content-Disposition `filename=` param. */
function asciiFilename(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/["\\/;\r\n]/g, "_")
    .trim();
  return cleaned || "document";
}

export function buildContentDisposition(
  disposition: "inline" | "attachment",
  fileName: string | null | undefined,
): string {
  const name = String(fileName ?? "").replace(/[\r\n]/g, " ").trim() || "document";
  const encoded = encodeURIComponent(name).replace(/['()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${disposition}; filename="${asciiFilename(name)}"; filename*=UTF-8''${encoded}`;
}

export function buildDocumentResponseHeaders(doc: {
  mime_type: string | null | undefined;
  file_name: string | null | undefined;
  size?: number;
}): Record<string, string> {
  const inline = isInlineViewable(doc.mime_type);
  const contentType = inline ? String(doc.mime_type).toLowerCase().trim() : "application/octet-stream";
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Disposition": buildContentDisposition(inline ? "inline" : "attachment", doc.file_name),
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
  // Lock image/other responses down hard. PDFs are left without CSP because
  // Chrome's built-in PDF viewer refuses to render under a sandbox/object-src CSP.
  if (contentType !== "application/pdf") {
    headers["Content-Security-Policy"] =
      "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox";
  }
  if (typeof doc.size === "number" && Number.isFinite(doc.size)) {
    headers["Content-Length"] = String(doc.size);
  }
  return headers;
}

type StorageDownloader = {
  storage: {
    from(bucket: string): {
      download(path: string): Promise<{ data: Blob | null; error: unknown }>;
    };
  };
};

/**
 * Returns a Response that displays the document inline. Small files are
 * streamed through our function with explicit inline headers; large files
 * (or a storage download failure) fall back to `fallbackSignedUrl()`, a
 * signed URL created WITHOUT the `download` option.
 */
export async function serveDocumentInline(
  supabase: StorageDownloader,
  doc: {
    storage_bucket?: string | null;
    storage_path: string;
    mime_type: string | null;
    file_name: string | null;
    file_size_bytes?: number | null;
  },
  fallbackSignedUrl: () => Promise<string | null>,
): Promise<Response> {
  const bucket = doc.storage_bucket || "application-documents";
  const knownSize = typeof doc.file_size_bytes === "number" ? doc.file_size_bytes : null;

  if (knownSize === null || knownSize <= MAX_PROXIED_DOCUMENT_BYTES) {
    try {
      const { data, error } = await supabase.storage.from(bucket).download(doc.storage_path);
      if (!error && data && data.size <= MAX_PROXIED_DOCUMENT_BYTES) {
        return new Response(data, {
          status: 200,
          headers: buildDocumentResponseHeaders({ ...doc, size: data.size }),
        });
      }
      if (error) console.error("view-document: storage download failed", error);
    } catch (err) {
      console.error("view-document: storage download threw", err);
    }
  }

  const signedUrl = await fallbackSignedUrl();
  if (!signedUrl) {
    return Response.json({ error: "Could not open document" }, { status: 500 });
  }
  return Response.redirect(signedUrl, 302);
}
