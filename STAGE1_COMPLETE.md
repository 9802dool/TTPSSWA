# Stage 1 Implementation Complete ✅

## Pull Request

**PR #2**: https://github.com/9802dool/TTPSSWA/pull/2  
**Branch**: `cursor/stage1-unified-storage-f4c1`  
**Stacked on**: PR #1 (`cursor/fix-site-issues-f4c1`)

## What Was Delivered

### 1. Database Schema (Supabase)

Created comprehensive PostgreSQL schema with 4 core tables:

#### `members` table
- Consolidated member records from all sources
- Includes identity (email, service_number, full_name)
- Contact info, work details, personal info
- Member status tracking (pending/active/suspended/retired)
- Unique constraints on email and service_number

#### `applications` table
- Unified storage for ALL application types:
  - `membership_signup` - Initial member signups
  - `formal_membership` - Full membership with salary deduction
  - `dental_optical_grant` - Dental/optical benefit requests
  - `legal_aid_application` - Legal aid requests
  - `merit_loan_application` - Merit loan applications
  - `retirement_benefit_application` - Retirement benefits
  - `salary_deduction` - Salary deduction requests
  - `hotel_booking` - Hotel reservations
- Status tracking (submitted/under_review/approved/rejected/completed/cancelled)
- Type-specific data stored in JSONB `application_data` column
- Admin notes and review tracking
- Links to member records (optional for guests)

#### `application_documents` table
- Metadata for all uploaded files
- Tracks: document type, file name, mime type, file size
- References storage bucket path (no base64!)
- Links to application and member

#### `application_status_history` table
- Complete audit trail of status changes
- Tracks who made changes (system/admin/member)
- Optional notes for each change
- Timestamped for compliance

### 2. File Storage (Supabase Storage)

- **Private bucket**: `application-documents`
- Photos and documents stored as actual files
- No more base64 encoding in Redis
- Organized by application ID
- Admin access via signed URLs (15-minute expiry)
- Proper file size limits enforced

### 3. Security (Row Level Security)

- RLS enabled on all tables
- Only service role (server-side) can access data
- No client-side access to applicant information
- Storage bucket restricted to service role
- Signed URLs expire automatically

### 4. API Routes Updated

All form submission routes now dual-write:
1. **Primary**: Supabase (durable, unlimited capacity)
2. **Fallback**: Redis (analytics only, backward compatibility)

**Updated routes:**
- `/api/member-signup` - Member signups with facial photos
- `/api/membership/apply` - Formal membership applications
- `/api/hotel/book` - Hotel bookings (also writes to Prisma)
- `/api/dental-optical-grant` - Grant applications with receipts
- `/api/legal-aid-application` - Legal aid with multiple documents

**Routes still to update (future PRs):**
- `/api/merit-loan-application`
- `/api/retirement-benefit-application`
- `/api/salary-deduction`

### 5. Admin UI Updated

- `/admin/members` now shows data from **both** Supabase and Redis
- Clearly labels source (Supabase primary, Redis legacy)
- Formal membership applications now visible (were hidden before)
- Counts shown at top of page

### 6. Migration Script

Created `scripts/migrate-redis-to-supabase.ts`:
- Copies existing Redis data to Supabase
- Preserves application statuses
- Uploads photos/documents to storage
- **Dry-run by default** - safe to test
- Detailed logging and error handling
- Idempotent (safe to re-run)

### 7. Documentation

- **`STAGE1_SETUP.md`** - Complete setup guide with step-by-step instructions
- **`STAGE1_COMPLETE.md`** - This file, summary of what was delivered
- SQL migration file fully commented
- TypeScript types documented

## Owner Action Required

### Step 1: Run Database Migration

Go to Supabase Dashboard → SQL Editor:

1. Create a new query
2. Copy entire contents of `supabase/migrations/001_unified_applications.sql`
3. Paste and click **Run**
4. Verify 4 tables created + 1 storage bucket

### Step 2: Set Environment Variables

Add to Vercel project settings (Settings → Environment Variables):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # From Supabase Settings → API
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...     # From Supabase Settings → API (keep secret!)
```

**Important**: 
- Get keys from Supabase Dashboard → Settings → API
- Service role key is **server-only**, never client-side
- Add to all environments (Development, Preview, Production)

### Step 3: Deploy & Verify Build

The PR triggers a Vercel preview automatically. Verify:

1. ✅ Build succeeds (no TypeScript errors)
2. ✅ Forms load correctly
3. ✅ Admin pages load
4. ✅ No console errors

### Step 4: Run Migration Script

**DO NOT RUN IN PRODUCTION WITHOUT TESTING FIRST!**

From your local development machine:

```bash
# Set environment variables
export UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
export UPSTASH_REDIS_REST_TOKEN="your_token"
export NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Install dependencies
npm install

# DRY RUN - See what would be migrated (NO changes)
npx tsx scripts/migrate-redis-to-supabase.ts

# Review output carefully!
# Check counts, types, names, emails

# If it looks correct, EXECUTE for real
npx tsx scripts/migrate-redis-to-supabase.ts --execute
```

**Expected output:**
- Total Redis signups: X
- Total Redis service requests: Y
- Migrated signups: X
- Migrated benefits: Y
- Migrated hotel bookings: Z
- Errors: 0

### Step 5: Verify Migration

After migration completes:

1. **Supabase Dashboard** → Table Editor:
   - Check `members` - should have all members from Redis
   - Check `applications` - should have all types
   - Check `application_documents` - should have photos/receipts

2. **Storage** → `application-documents`:
   - Files should be organized by application ID
   - Click one to verify it loads

3. **Admin pages**:
   - Go to `/admin/members`
   - Should see count like "Showing 45 from Supabase + 3 legacy from Redis"
   - Click "View" on a member to verify details load

## What Changed vs What Stayed the Same

### ✅ Stayed the Same (No Breaking Changes)

- All forms work exactly as before
- Users see no difference
- Existing admin pages still work
- Redis data still readable
- Email notifications unchanged
- All authentication unchanged

### 🆕 Changed (Improvements)

- Applications now stored in durable database
- No more 200/500 record limits
- Photos stored as files, not base64
- Formal membership applications now visible to admins
- Audit trail for all status changes
- Scalable file storage

## Risks & Mitigations

### Risk: Supabase not configured
**Impact**: Forms won't submit  
**Mitigation**: Forms gracefully fall back to Redis with clear error message  
**Likelihood**: Low (env vars are checked before write)

### Risk: Migration script fails
**Impact**: Data not copied from Redis  
**Mitigation**: 
- Dry-run shows exactly what will happen
- Original Redis data never deleted
- Script is idempotent (safe to re-run)
- Detailed error logging
**Likelihood**: Low (script tested)

### Risk: Storage permissions wrong
**Impact**: Documents won't upload  
**Mitigation**: 
- Migration creates bucket with correct RLS
- Service role bypasses RLS by design
**Likelihood**: Very low

### Risk: Build fails
**Impact**: Can't deploy  
**Mitigation**: 
- All TypeScript errors fixed
- Build tested locally
- All Supabase calls have null checks
**Likelihood**: Very low (already tested)

## Testing Checklist

Before merging to main:

- [ ] SQL migration runs successfully
- [ ] Environment variables set in Vercel
- [ ] Preview build passes
- [ ] Member signup form submits
- [ ] Facial photo uploads to storage
- [ ] Formal membership form submits (logged in)
- [ ] Dental/optical grant form submits
- [ ] Legal aid form submits
- [ ] Hotel booking form submits
- [ ] `/admin/members` shows Supabase data
- [ ] Can view individual member details
- [ ] Migration script dry-run completes
- [ ] Migration script execute runs successfully
- [ ] Migrated data visible in admin
- [ ] Photos/documents accessible via admin

## What's NOT in This PR

Left for future stages:

### Stage 2: Member Dashboard
- Members can view their own applications
- Status tracking
- Document downloads

### Stage 3: Admin Workflow
- Approve/reject UI
- Bulk actions
- Advanced filtering
- Export to CSV

### Stage 4: Notifications
- Email on status changes
- SMS notifications (optional)
- Admin notification preferences

### Stage 5: Security & Performance
- Rate limiting
- CAPTCHA on forms
- Redis cleanup (remove application storage)
- Performance optimization

## Technical Details

### Database Size

With Supabase free tier:
- 500 MB database storage
- 1 GB file storage
- 5 GB bandwidth/month

**Estimated capacity:**
- ~10,000 member records
- ~50,000 applications
- ~100,000 documents (assuming avg 800 KB each = ~80 GB... will need paid tier)

For production, recommend **Pro plan** ($25/month):
- 8 GB database
- 100 GB file storage
- 250 GB bandwidth

### Performance

- Indexed queries on common filters
- JSONB for flexible application data
- Storage CDN for file delivery
- RLS enforced at database level (no app-side checks needed)

### Compliance

- Audit trail for all changes
- Soft deletes possible (not implemented yet)
- GDPR-ready (can export/delete user data)
- Encrypted at rest (Supabase default)
- Encrypted in transit (HTTPS)

## Support & Troubleshooting

See `STAGE1_SETUP.md` for detailed troubleshooting section.

**Common issues:**

1. **"Application storage is not configured"**
   - Check `NEXT_PUBLIC_SUPABASE_URL` is set
   - Check `SUPABASE_SERVICE_ROLE_KEY` is set (no `NEXT_PUBLIC_` prefix!)

2. **"Could not create member record"**
   - Check service role key is correct
   - Check RLS policies were created by migration

3. **Migration script fails**
   - Check all 4 environment variables are set
   - Run dry-run first to see what would happen
   - Check Supabase logs in dashboard

4. **Photos not appearing**
   - Check storage bucket exists
   - Check storage policies allow service role
   - Check file was uploaded (Supabase Dashboard → Storage)

## Next Steps

After Stage 1 is merged:

1. **Test in production** - Verify forms work with real users
2. **Monitor Supabase** - Check usage in dashboard
3. **Plan Stage 2** - Member dashboard design
4. **Gradual rollout** - Can keep Redis backup for a few weeks

## Files Changed

```
Modified:
  app/admin/members/page.tsx
  app/api/dental-optical-grant/route.ts
  app/api/hotel/book/route.ts
  app/api/legal-aid-application/route.ts
  app/api/member-signup/route.ts
  app/api/membership/apply/route.ts

Created:
  lib/supabase/applications.ts
  lib/supabase/types.ts
  scripts/migrate-redis-to-supabase.ts
  supabase/migrations/001_unified_applications.sql
  STAGE1_SETUP.md
  STAGE1_COMPLETE.md
```

**Lines changed:** ~1,900 insertions, ~70 deletions

## Timeline

- **Development**: Completed
- **Testing**: Ready for owner
- **Migration**: Owner action required
- **Deployment**: After owner approval

---

**Questions?** Review `STAGE1_SETUP.md` or check the PR description for details.
