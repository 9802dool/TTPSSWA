/**
 * File validation utilities with magic byte (file signature) verification.
 * Prevents MIME type spoofing by checking actual file contents.
 */

export const ALLOWED_FILE_TYPES = {
  'application/pdf': {
    extensions: ['.pdf'],
    magicBytes: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  },
  'image/jpeg': {
    extensions: ['.jpg', '.jpeg'],
    magicBytes: [[0xFF, 0xD8, 0xFF]], // JPEG start
  },
  'image/png': {
    extensions: ['.png'],
    magicBytes: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG signature
  },
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export type AllowedMimeType = keyof typeof ALLOWED_FILE_TYPES;

/**
 * Validates file type by checking magic bytes at start of file.
 * Returns the validated MIME type or null if invalid.
 */
export async function validateFileType(
  file: File | Blob
): Promise<AllowedMimeType | null> {
  // Read first 16 bytes (enough for all our signatures)
  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check against each allowed type's magic bytes
  for (const [mimeType, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    for (const signature of config.magicBytes) {
      if (matchesSignature(bytes, signature)) {
        return mimeType as AllowedMimeType;
      }
    }
  }

  return null;
}

/**
 * Checks if the file bytes start with the expected signature.
 */
function matchesSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Validates file size.
 */
export function validateFileSize(file: File | Blob): boolean {
  return file.size > 0 && file.size <= MAX_FILE_SIZE;
}

/**
 * Full file validation: size and type.
 * Returns error message or null if valid.
 */
export async function validateFile(
  file: File | Blob
): Promise<{ valid: true; mimeType: AllowedMimeType } | { valid: false; error: string }> {
  if (!validateFileSize(file)) {
    return {
      valid: false,
      error: `File must be between 1 byte and ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)} MB`,
    };
  }

  const mimeType = await validateFileType(file);
  if (!mimeType) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed.',
    };
  }

  return { valid: true, mimeType };
}
