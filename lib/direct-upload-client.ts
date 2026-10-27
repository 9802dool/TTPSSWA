/**
 * Browser side of direct-to-storage uploads.
 *
 * 1. Ask /api/upload/request-signed-url for one signed URL per attached file.
 * 2. PUT each file straight to Supabase Storage (bypasses the Vercel 4.5 MB body limit).
 * 3. Return a JSON payload of the form's text fields plus `uploads` references,
 *    which the application route verifies (token, size, magic bytes) and files.
 */

import {
  DIRECT_UPLOAD_MIME_TYPES,
  MAX_DIRECT_UPLOAD_FILE_BYTES,
  MAX_DIRECT_UPLOAD_FILE_LABEL,
} from "@/lib/upload-limits";

export interface UploadDocSpec {
  name: string;
  label: string;
  required?: boolean;
}

export interface UploadedRef {
  path: string;
  token: string;
  fileName: string;
  documentType: string;
}

export class UploadError extends Error {}

const EXTENSION_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** The file's MIME type, falling back to its extension when the browser leaves it blank. */
export function resolveMimeType(file: File): string | null {
  let type = (file.type || "").toLowerCase();
  if (type === "image/jpg") type = "image/jpeg";
  if (!type) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    type = EXTENSION_TYPES[ext] ?? "";
  }
  return (DIRECT_UPLOAD_MIME_TYPES as readonly string[]).includes(type) ? type : null;
}

/** Client-side checks; returns a user-facing error or null. */
export function checkDocuments(fd: FormData, docs: readonly UploadDocSpec[]): string | null {
  for (const doc of docs) {
    const file = fd.get(doc.name);
    const present = file instanceof File && file.size > 0;
    if (!present) {
      if (doc.required !== false) return `Please upload ${doc.label}.`;
      continue;
    }
    if (file.size > MAX_DIRECT_UPLOAD_FILE_BYTES) {
      return `${doc.label} must be ${MAX_DIRECT_UPLOAD_FILE_LABEL} or smaller.`;
    }
    if (!resolveMimeType(file)) {
      return `${doc.label} must be a PDF, JPG, PNG or WebP file.`;
    }
  }
  return null;
}

async function putToSignedUrl(signedUrl: string, file: File, mimeType: string): Promise<void> {
  // Same request shape supabase-js uploadToSignedUrl() sends.
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", new Blob([file], { type: mimeType }), file.name);
  const res = await fetch(signedUrl, { method: "PUT", body, headers: { "x-upsert": "false" } });
  if (!res.ok) {
    throw new UploadError(`Could not upload "${file.name}". Please check your connection and try again.`);
  }
}

/** Uploads every attached document and returns references for the JSON submission. */
export async function uploadDocuments(fd: FormData, docs: readonly UploadDocSpec[]): Promise<UploadedRef[]> {
  const attached: { doc: UploadDocSpec; file: File; mimeType: string }[] = [];
  for (const doc of docs) {
    const file = fd.get(doc.name);
    if (file instanceof File && file.size > 0) {
      const mimeType = resolveMimeType(file);
      if (!mimeType) throw new UploadError(`${doc.label} must be a PDF, JPG, PNG or WebP file.`);
      attached.push({ doc, file, mimeType });
    }
  }
  if (attached.length === 0) return [];

  let res: Response;
  try {
    res = await fetch("/api/upload/request-signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: attached.map((a) => ({ fileName: a.file.name, mimeType: a.mimeType, fileSize: a.file.size })),
      }),
    });
  } catch {
    throw new UploadError("Network error. Please try again.");
  }
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    uploads?: { token: string; signedUrl: string; path: string }[];
  };
  if (!res.ok || !data.uploads || data.uploads.length !== attached.length) {
    throw new UploadError(data.error || "Could not prepare your document upload. Please try again.");
  }

  const signed = data.uploads;
  await Promise.all(attached.map((a, i) => putToSignedUrl(signed[i].signedUrl, a.file, a.mimeType)));

  return attached.map((a, i) => ({
    path: signed[i].path,
    token: signed[i].token,
    fileName: a.file.name,
    documentType: a.doc.name,
  }));
}

/**
 * Text fields of the form as a JSON object. File inputs are dropped. Fields in
 * `arrayFields` are always arrays; any other repeated field keeps its last value.
 */
export function formFieldsToJson(fd: FormData, arrayFields: readonly string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const name of arrayFields) out[name] = [];
  fd.forEach((value, key) => {
    if (typeof value !== "string") return;
    if (arrayFields.includes(key)) (out[key] as string[]).push(value);
    else out[key] = value;
  });
  return out;
}
