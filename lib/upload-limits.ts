/**
 * Upload limits shared by browser forms and API routes.
 *
 * Vercel Functions reject request bodies over 4.5 MB with a plain-text
 * FUNCTION_PAYLOAD_TOO_LARGE (413) error before our code runs. To keep the
 * error friendly, every form caps the TOTAL size of its attached files at 4 MB
 * (leaving room for the text fields) and each file at 4 MB.
 */
export const MAX_UPLOAD_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_TOTAL_BYTES = 4 * 1024 * 1024;

export const UPLOAD_TOO_LARGE_MESSAGE =
  "Your attachments are too large to send together (4 MB total). Please attach smaller files, for example a lower-resolution scan or photo, and try again.";

/** Sum of the sizes of every non-empty file in the form. */
export function totalUploadBytes(fd: FormData): number {
  let total = 0;
  fd.forEach((value) => {
    if (typeof value !== "string" && value.size > 0) total += value.size;
  });
  return total;
}

/** Returns an error message when the form's files exceed the total limit, otherwise null. */
export function checkUploadTotal(fd: FormData): string | null {
  return totalUploadBytes(fd) > MAX_UPLOAD_TOTAL_BYTES ? UPLOAD_TOO_LARGE_MESSAGE : null;
}

/** Message to show for an HTTP response; handles the platform's 413 (non-JSON) error. */
export function uploadErrorMessage(status: number, serverError: string | undefined): string | undefined {
  if (status === 413) return UPLOAD_TOO_LARGE_MESSAGE;
  return serverError;
}
