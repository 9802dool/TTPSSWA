/**
 * Direct-to-storage upload verification and processing.
 * Validates that uploaded files match their declared tokens.
 */

import { createServiceClient } from './service';
import { verifyUploadToken } from '../upload-tokens';

const MAGIC_BYTES: Record<string, string[]> = {
  'application/pdf': ['25504446'], // %PDF
  'image/jpeg': ['FFD8FF'],
  'image/jpg': ['FFD8FF'],
  'image/png': ['89504E47'],
  'image/gif': ['474946383761', '474946383961'], // GIF87a, GIF89a
  'image/webp': ['52494646'], // RIFF
};

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

  if (tokenData.path !== path) {
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

  if (listError || !fileList || fileList.length === 0) {
    return { ok: false, error: 'File not found in storage. Upload may have failed.' };
  }

  const fileMetadata = fileList[0];
  const fileSize = fileMetadata.metadata?.size || 0;

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
    .download(path, {
      transform: {
        width: undefined,
        height: undefined,
      },
    });

  if (downloadError || !fileData) {
    return { ok: false, error: 'Failed to verify file contents.' };
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const header = buffer.subarray(0, 12).toString('hex').toUpperCase();

  // Verify magic bytes match declared MIME type
  const expectedMagic = MAGIC_BYTES[tokenData.mimeType];
  if (expectedMagic) {
    const matches = expectedMagic.some((magic) => header.startsWith(magic));
    if (!matches) {
      return {
        ok: false,
        error: `File content does not match declared type ${tokenData.mimeType}.`,
      };
    }
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

  // List all files in the pending/ folder
  const { data: files, error } = await supabase.storage
    .from('application-documents')
    .list('pending', {
      sortBy: { column: 'created_at', order: 'asc' },
    });

  if (error || !files) {
    console.error('Error listing pending uploads:', error);
    return 0;
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

  const { error: deleteError } = await supabase.storage
    .from('application-documents')
    .remove(toDelete);

  if (deleteError) {
    console.error('Error deleting orphaned uploads:', deleteError);
    return 0;
  }

  console.log(`Cleaned up ${toDelete.length} orphaned uploads`);
  return toDelete.length;
}
