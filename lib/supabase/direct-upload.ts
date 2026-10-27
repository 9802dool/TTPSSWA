/**
 * Direct-to-storage upload verification and processing.
 * Validates that uploaded files match their declared tokens.
 */

import { createServiceClient } from './service';
import { verifyUploadToken } from '../upload-tokens';

/** Expected file signatures. Only the types the forms accept are allowed. */
function matchesMagicBytes(mimeType: string, header: Buffer): boolean {
  const hex = header.toString('hex').toUpperCase();
  switch (mimeType) {
    case 'application/pdf':
      return hex.startsWith('25504446'); // %PDF
    case 'image/jpeg':
      return hex.startsWith('FFD8FF');
    case 'image/png':
      return hex.startsWith('89504E470D0A1A0A');
    case 'image/webp':
      // RIFF....WEBP
      return hex.startsWith('52494646') && header.subarray(8, 12).toString('ascii') === 'WEBP';
    default:
      return false;
  }
}

export interface DocumentSpec {
  name: string;
  label: string;
  required?: boolean;
}

export interface DirectUploadRef {
  path: string;
  token: string;
  fileName: string;
  /** Spec name sent by the client (e.g. "idDocument"). */
  documentType: string;
  /** Human label from the server-side spec; used for document_type. */
  label: string;
}

/**
 * Validates the `uploads` array a form submitted against the documents the
 * route accepts: well-formed entries, known document types, no duplicates,
 * and every required document present. Does not touch storage.
 */
export function matchDocumentUploads(
  raw: unknown,
  docs: readonly DocumentSpec[],
): { ok: true; uploads: DirectUploadRef[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: 'Please upload all required documents.' };
  const byName = new Map(docs.map((d) => [d.name, d]));
  const seen = new Set<string>();
  const uploads: DirectUploadRef[] = [];
  for (const u of raw) {
    if (
      typeof u !== 'object' ||
      u === null ||
      typeof (u as DirectUploadRef).path !== 'string' ||
      typeof (u as DirectUploadRef).token !== 'string' ||
      typeof (u as DirectUploadRef).fileName !== 'string' ||
      typeof (u as DirectUploadRef).documentType !== 'string'
    ) {
      return { ok: false, error: 'Invalid upload data.' };
    }
    const ref = u as DirectUploadRef;
    const spec = byName.get(ref.documentType);
    if (!spec) return { ok: false, error: 'Invalid upload data.' };
    if (seen.has(spec.name)) return { ok: false, error: `${spec.label} was uploaded more than once.` };
    seen.add(spec.name);
    uploads.push({
      path: ref.path,
      token: ref.token,
      fileName: ref.fileName.slice(0, 255),
      documentType: spec.name,
      label: spec.label,
    });
  }
  for (const d of docs) {
    if (d.required !== false && !seen.has(d.name)) {
      return { ok: false, error: `Please upload ${d.label}.` };
    }
  }
  return { ok: true, uploads };
}

/**
 * Verify a file was uploaded via our signed URL and matches the declared type/size.
 */
export async function verifyUploadedFile(
  path: string,
  token: string,
): Promise<
  | { ok: true; mimeType: string; size: number }
  | { ok: false; error: string }
> {
  const tokenData = verifyUploadToken(token);
  if (!tokenData) {
    return { ok: false, error: 'Invalid or expired upload token.' };
  }

  if (tokenData.path !== path || !path.startsWith('pending/') || path.includes('..')) {
    return { ok: false, error: 'Upload token does not match the provided path.' };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, error: 'Storage is not configured.' };
  }

  // Check that the file exists and get its metadata
  const { data: fileList, error: listError } = await supabase.storage
    .from('application-documents')
    .list(path.substring(0, path.lastIndexOf('/')), {
      search: path.substring(path.lastIndexOf('/') + 1),
    });

  const fileName = path.substring(path.lastIndexOf('/') + 1);
  // `search` is a prefix match, so pick the exact object.
  const fileMetadata = fileList?.find((f) => f.name === fileName);
  if (listError || !fileMetadata) {
    return { ok: false, error: 'File not found in storage. Upload may have failed.' };
  }

  const fileSize = Number(fileMetadata.metadata?.size ?? 0);
  if (!(fileSize > 0)) {
    return { ok: false, error: 'Uploaded file is empty.' };
  }

  // Verify size is within declared maximum
  if (fileSize > tokenData.maxSize) {
    return {
      ok: false,
      error: `File size ${fileSize} exceeds declared maximum ${tokenData.maxSize}.`,
    };
  }

  // Download first 12 bytes to check magic bytes
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('application-documents')
    .download(path);

  if (downloadError || !fileData) {
    return { ok: false, error: 'Failed to verify file contents.' };
  }

  const header = Buffer.from(await fileData.slice(0, 16).arrayBuffer());

  // Verify magic bytes match declared MIME type (unknown types are rejected)
  if (!matchesMagicBytes(tokenData.mimeType, header)) {
    return {
      ok: false,
      error: 'File content does not match its type. Please upload a PDF, JPG, PNG or WebP file.',
    };
  }

  return { ok: true, mimeType: tokenData.mimeType, size: fileSize };
}

/**
 * Move a verified uploaded file from pending/ to its final location.
 * Returns the new storage path.
 */
export async function moveUploadedFile(
  pendingPath: string,
  applicationId: string,
  fileName: string,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, error: 'Storage is not configured.' };
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const finalPath = `${applicationId}/${timestamp}-${randomSuffix}-${sanitizedName}`;

  // Copy the file to its final location
  const { error: copyError } = await supabase.storage
    .from('application-documents')
    .copy(pendingPath, finalPath);

  if (copyError) {
    console.error('Error moving uploaded file:', copyError);
    return { ok: false, error: 'Failed to move uploaded file.' };
  }

  // Delete the original pending file
  const { error: deleteError } = await supabase.storage
    .from('application-documents')
    .remove([pendingPath]);

  if (deleteError) {
    console.warn('Failed to delete pending file after move:', deleteError);
  }

  return { ok: true, path: finalPath };
}

/**
 * Record a document in the database after successful upload and verification.
 */
export async function recordUploadedDocument(data: {
  application_id: string;
  member_id?: string;
  document_type: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
}): Promise<{ document_id: string } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: doc, error } = await supabase
    .from('application_documents')
    .insert({
      application_id: data.application_id,
      member_id: data.member_id || null,
      document_type: data.document_type,
      file_name: data.file_name,
      mime_type: data.mime_type,
      file_size_bytes: data.file_size,
      storage_bucket: 'application-documents',
      storage_path: data.storage_path,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording document metadata:', error);
    return null;
  }

  return { document_id: doc.id };
}

/**
 * Clean up pending files that were never finalized (orphaned uploads).
 */
export async function cleanupOrphanedUploads(olderThanMinutes: number = 60): Promise<number> {
  const supabase = createServiceClient();
  if (!supabase) return 0;

  const cutoffTime = Date.now() - olderThanMinutes * 60 * 1000;

  // List all files in the pending/ folder (paged; list() returns at most `limit` entries)
  const files: { name: string }[] = [];
  const PAGE = 1000;
  for (let offset = 0; offset < 100_000; offset += PAGE) {
    const { data, error } = await supabase.storage
      .from('application-documents')
      .list('pending', { limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error || !data) {
      console.error('Error listing pending uploads:', error);
      return 0;
    }
    files.push(...data);
    if (data.length < PAGE) break;
  }

  const toDelete: string[] = [];
  for (const file of files) {
    // Parse timestamp from filename (format: timestamp-randomSuffix-filename)
    const match = file.name.match(/^(\d+)-/);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      if (timestamp < cutoffTime) {
        toDelete.push(`pending/${file.name}`);
      }
    }
  }

  if (toDelete.length === 0) {
    return 0;
  }

  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += 500) {
    const batch = toDelete.slice(i, i + 500);
    const { error: deleteError } = await supabase.storage
      .from('application-documents')
      .remove(batch);
    if (deleteError) {
      console.error('Error deleting orphaned uploads:', deleteError);
      break;
    }
    deleted += batch.length;
  }
  console.log(`Cleaned up ${deleted} orphaned uploads`);
  return deleted;
}

/** Best-effort removal of one stored object (e.g. a moved file whose metadata insert failed). */
export async function discardStoredFile(path: string): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from('application-documents').remove([path]);
  if (error) console.error('Failed to remove stored file', path, error);
}
