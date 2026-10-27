# Supabase Setup for Direct-to-Storage Uploads

## Overview

This document outlines the Supabase configuration needed to support direct-to-storage uploads. **No database migrations are required** - only storage bucket permissions need verification.

## Storage Bucket Configuration

### Bucket: `application-documents`

This bucket should already exist from PR #13. Verify it has the correct permissions:

#### 1. Check Bucket Exists

Go to: **Storage** → **Buckets** in Supabase Dashboard

Ensure `application-documents` exists with:
- **Public**: `false` (private bucket)
- **File size limit**: `5242880` (5 MB)
- **Allowed MIME types**: `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

#### 2. Verify RLS Policies

**Policy 1: Service Role Full Access** (Required)

```sql
-- This should already exist from previous setup
-- Allows service role to manage all files
CREATE POLICY "Service role full access" 
ON storage.objects 
FOR ALL 
TO service_role
USING (bucket_id = 'application-documents');
```

**Policy 2: Authenticated Users Upload** (NOT needed - we use signed URLs)

❌ Do NOT create policies for authenticated users to upload directly.  
✅ All uploads use server-generated signed URLs (service role).

**Policy 3: Authenticated Users Download** (Optional)

```sql
-- Only if you want authenticated users to download their own documents
CREATE POLICY "Users can download their documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM applications WHERE member_id IN (
      SELECT id FROM members WHERE email = auth.jwt() ->> 'email'
    )
  )
);
```

### Folder Structure

The bucket uses this structure:

```
application-documents/
├── pending/                    # Temporary uploads (cleaned up after 60 min)
│   ├── 1730000000-abc123-file.pdf
│   ├── 1730000001-def456-photo.jpg
│   └── ...
├── <application-id-1>/         # Final storage per application
│   ├── 1730001000-xyz789-id-card.pdf
│   ├── 1730001001-uvw012-payslip.pdf
│   └── ...
├── <application-id-2>/
│   └── ...
└── ...
```

**Pending folder cleanup**:
- Files uploaded to `pending/` via signed URLs
- Server verifies and moves to `<application-id>/` on form submission
- Orphaned files (not moved within 60 min) are deleted by cron job

## Database Tables

**No migrations needed!** Existing tables already support the new flow:

### `applications` table
- ✅ Already has `application_type` and `application_data` columns
- ✅ `application_data` JSONB can store any form structure

### `application_documents` table
- ✅ Already tracks file metadata
- ✅ Has `storage_bucket` and `storage_path` columns
- ✅ Linked to `applications` via `application_id`

### `members` table
- ✅ Already has all required fields
- ✅ No changes needed

## RPC Functions (Optional Enhancement)

### Case-Insensitive Email Lookup

This function is already used by the backend:

```sql
CREATE OR REPLACE FUNCTION get_member_by_email_lower(search_email text)
RETURNS TABLE (
  id uuid,
  email text,
  service_number text,
  full_name text,
  rank text,
  phone text,
  phone_country_code text,
  phone_home text,
  phone_work text,
  address text,
  department_division text,
  section_station text,
  date_of_birth text,
  sex text,
  age integer,
  username text,
  password_hash text,
  financial_member text,
  date_of_enlistment text,
  member_status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM members
  WHERE LOWER(email) = LOWER(search_email)
  LIMIT 1;
$$;
```

**Note**: This should already exist from the initial Supabase setup in PR #13.

## Testing Storage Configuration

### Test 1: Generate Signed Upload URL

```bash
curl -X POST http://localhost:3001/api/upload/request-signed-url \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{
      "fileName": "test.pdf",
      "mimeType": "application/pdf",
      "fileSize": 1000
    }]
  }'
```

Expected response:
```json
{
  "ok": true,
  "uploads": [{
    "fileName": "test.pdf",
    "token": "base64-encoded-token.signature",
    "signedUrl": "https://xxx.supabase.co/storage/v1/object/sign/...",
    "path": "pending/1730000000-abc123-test.pdf"
  }]
}
```

### Test 2: Upload File to Signed URL

```bash
# Use the signedUrl from Test 1
curl -X PUT "https://xxx.supabase.co/storage/v1/object/sign/..." \
  -H "Content-Type: application/pdf" \
  --data-binary "@test.pdf"
```

Expected: `200 OK`

### Test 3: Verify File Exists

Go to: **Storage** → **application-documents** → **pending/** in Supabase Dashboard

You should see: `1730000000-abc123-test.pdf`

### Test 4: Cleanup Cron

```bash
curl http://localhost:3001/api/cron/cleanup-orphaned-uploads
```

Expected response:
```json
{
  "ok": true,
  "deleted": 0,
  "message": "Cleaned up 0 orphaned upload(s)"
}
```

(Assuming no files are older than 60 minutes)

## Monitoring

### Storage Usage

Check: **Storage** → **application-documents** → **Usage** in Supabase Dashboard

Monitor:
- Total storage used
- Number of objects
- Growth rate

### Failed Uploads

Check application logs for errors:
- "Document verification failed"
- "Failed to move uploaded file"
- "Invalid or expired upload token"

These indicate:
- Token expiry (files not submitted within 10 min)
- Size/type mismatches
- Missing files

### Cleanup Job

Check cron logs for:
```
Cleaned up N orphaned uploads
```

If `N` is consistently high, users may be abandoning forms frequently.

## Troubleshooting

### "Failed to create signed upload URL"

**Cause**: Supabase service role doesn't have permission to create signed URLs.

**Fix**:
1. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Verify RLS policy for service role exists
3. Check bucket allows uploads

### "File not found in storage"

**Cause**: Upload didn't complete or file was cleaned up.

**Fix**:
1. Check signed URL was used within 10 minutes
2. Verify file upload completed (200 response)
3. Check if cleanup job ran prematurely

### "File content does not match declared type"

**Cause**: Magic byte validation failed (file type mismatch).

**Fix**:
1. Ensure client sends correct MIME type
2. Check file isn't corrupted
3. Verify allowed MIME types in bucket config

### "Storage quota exceeded"

**Cause**: Bucket reached size limit.

**Fix**:
1. Increase Supabase plan storage
2. Run manual cleanup: `DELETE FROM storage.objects WHERE bucket_id = 'application-documents' AND created_at < NOW() - INTERVAL '90 days'`
3. Review and delete old applications if appropriate

## Security Considerations

### Rate Limiting

Upload URL endpoint is rate-limited to **20 requests per minute per IP**:

```typescript
// In /api/upload/request-signed-url
const ipLimit = await checkRateLimit(`upload-url:ip:${clientIP}`, {
  maxRequests: 20,
  windowSeconds: 60,
});
```

**Why**: Prevents abuse (requesting thousands of signed URLs).

### Token Expiry

Upload tokens expire after **10 minutes**:

```typescript
// In lib/upload-tokens.ts
if (Date.now() - timestamp > 600000) return null; // 600000ms = 10 minutes
```

**Why**: Limits window for token misuse.

### Magic Byte Validation

Server downloads first **12 bytes** to verify file type:

```typescript
// In lib/supabase/direct-upload.ts
const buffer = Buffer.from(await fileData.arrayBuffer());
const header = buffer.subarray(0, 12).toString('hex');
```

**Why**: Prevents uploading malicious files disguised as PDFs/images.

### Size Validation

Server verifies actual file size matches declared size:

```typescript
if (fileSize > tokenData.maxSize) {
  return { ok: false, error: 'File size exceeds declared maximum' };
}
```

**Why**: Prevents oversized uploads.

## Production Checklist

Before deploying to production:

- [ ] Verify `application-documents` bucket exists
- [ ] Confirm service role RLS policy is active
- [ ] Test signed URL generation
- [ ] Test file upload to signed URL
- [ ] Test form submission with upload tokens
- [ ] Verify cleanup cron job is scheduled
- [ ] Monitor storage usage for first week
- [ ] Check error logs for upload failures

## Rollback Plan

If issues arise, disable direct uploads:

1. **Temporary Fix**: Return 503 from `/api/upload/request-signed-url`:
   ```typescript
   return NextResponse.json(
     { ok: false, error: "Upload service temporarily disabled" },
     { status: 503 }
   );
   ```

2. **Revert Frontend**: Switch forms back to FormData submission (if frontend was updated)

3. **Full Rollback**: Revert PR #14 entirely

## Additional Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Signed URLs](https://supabase.com/docs/guides/storage/uploads/signed-upload-urls)
- [Vercel Request Limits](https://vercel.com/docs/functions/serverless-functions/runtimes#request-body-size-limit)

---

**Questions?** Check the [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) or [PR #14](https://github.com/9802dool/TTPSSWA/pull/14).
