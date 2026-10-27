/**
 * Request signed upload URLs for direct-to-storage uploads.
 * Returns Supabase signed upload URLs that clients can POST files to.
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { createUploadToken } from "@/lib/upload-tokens";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file

interface UploadRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  // Strict rate limiting for upload URL requests (prevents abuse)
  const ipLimit = await checkRateLimit(`upload-url:ip:${clientIP}`, {
    maxRequests: 20,
    windowSeconds: 60, // 20 requests per minute per IP
  });

  if (!ipLimit.success) {
    return NextResponse.json(
      { ok: false, error: "Too many upload requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: { files?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.files) || body.files.length === 0 || body.files.length > 10) {
    return NextResponse.json(
      { ok: false, error: "Request must contain 1-10 files." },
      { status: 400 },
    );
  }

  const files: UploadRequest[] = [];
  for (const f of body.files) {
    if (
      typeof f !== 'object' ||
      f === null ||
      typeof f.fileName !== 'string' ||
      typeof f.mimeType !== 'string' ||
      typeof f.fileSize !== 'number'
    ) {
      return NextResponse.json(
        { ok: false, error: "Each file must have fileName, mimeType, and fileSize." },
        { status: 400 },
      );
    }

    const fileName = f.fileName.trim();
    const mimeType = f.mimeType.toLowerCase().trim();
    const fileSize = f.fileSize;

    if (!fileName || fileName.length > 255) {
      return NextResponse.json(
        { ok: false, error: "File name must be 1-255 characters." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { ok: false, error: `File type ${mimeType} is not allowed. Allowed: PDF, JPEG, PNG, GIF, WEBP.` },
        { status: 400 },
      );
    }

    if (fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: `File size must be between 1 byte and 5 MB. Received: ${fileSize} bytes.` },
        { status: 400 },
      );
    }

    files.push({ fileName, mimeType, fileSize });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Storage is not configured." },
      { status: 503 },
    );
  }

  const results: Array<{
    fileName: string;
    token: string;
    signedUrl: string;
    path: string;
  }> = [];

  for (const file of files) {
    // Generate unique storage path
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 12);
    const sanitizedName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `pending/${timestamp}-${randomSuffix}-${sanitizedName}`;

    // Create signed upload URL (valid for 10 minutes)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('application-documents')
      .createSignedUploadUrl(storagePath, {
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('Error creating signed upload URL:', uploadError);
      return NextResponse.json(
        { ok: false, error: "Failed to create upload URL." },
        { status: 500 },
      );
    }

    // Create token binding this path to this session
    const token = createUploadToken(storagePath, file.mimeType, file.fileSize);

    results.push({
      fileName: file.fileName,
      token,
      signedUrl: uploadData.signedUrl,
      path: storagePath,
    });
  }

  return NextResponse.json({ ok: true, uploads: results });
}
