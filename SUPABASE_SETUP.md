# Direct-to-storage uploads

The dental/optical, legal aid, merit loan, merit salary deduction and retirement
forms upload documents straight to Supabase Storage, so Vercel's 4.5 MB request
limit does not apply. Limits: PDF, JPG, PNG or WebP, up to 10 MB per file.

## Flow

1. Browser `POST /api/upload/request-signed-url` with `{ files: [{ fileName, mimeType, fileSize }] }`
   (rate limited 20/min per IP). Returns a Supabase signed upload URL per file for
   `application-documents/pending/<timestamp>-<uuid>-<name>` and an HMAC token
   binding path, type, size and time (10-minute expiry).
2. Browser `PUT`s each file to its signed URL (`lib/direct-upload-client.ts`).
3. Browser posts the form as JSON with `uploads: [{ path, token, fileName, documentType }]`.
4. The route checks the token, the document types, the stored size (<= declared)
   and the file's magic bytes, creates the application, then moves each file to
   `<application_id>/...` and records it in `application_documents`. On failure
   the application and its files are removed and no email is sent.
5. `/api/cron/cleanup-orphaned-uploads` (daily, 07:00 UTC, registered in
   `vercel.json`, requires `CRON_SECRET`) deletes `pending/` files older than 1 hour.

## Configuration

- Bucket `application-documents`: private, single policy
  "Service role can manage application documents" (service_role, ALL). Signed
  upload URLs work without any anon/authenticated policy.
- Recommended (optional) bucket hardening: file size limit 10 MB and allowed MIME
  types `application/pdf, image/jpeg, image/png, image/webp`.
- `UPLOAD_TOKEN_SECRET` (optional): HMAC secret for upload tokens. If unset, a key
  derived from `SUPABASE_SERVICE_ROLE_KEY` is used. There is no hard-coded fallback.
- `CRON_SECRET`: required for the cleanup cron (already set for the hotel reports).
