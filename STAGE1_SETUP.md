# Stage 1: Unified Application Storage - Setup Guide

## Overview

Stage 1 consolidates all TTPSSWA applications (membership signups, benefit applications, hotel bookings) into a single durable Supabase database with proper file storage. This eliminates the data loss issues from Redis's 200/500 record limits.

## Prerequisites

- Supabase project (free tier works)
- Existing environment variables (ADMIN_PASSWORD, UPSTASH_REDIS_REST_URL, etc.)

## Step 1: Run Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/001_unified_applications.sql`
4. Paste into a new query
5. Click **Run**
6. Verify tables created: `members`, `applications`, `application_documents`, `application_status_history`

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

## Step 2: Verify Storage Bucket

The migration creates a storage bucket called `application-documents`. Verify it exists:

1. Go to Supabase Dashboard → **Storage**
2. You should see `application-documents` bucket
3. It should be marked as **Private** (not public)

## Step 3: Set Environment Variables

Add these to your Vercel project (or `.env.local` for development):

### Required Variables

```bash
# Supabase (get these from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **IMPORTANT**: 
- `NEXT_PUBLIC_*` variables are safe for client-side code (anon key)
- `SUPABASE_SERVICE_ROLE_KEY` is server-only, NEVER prefix it with `NEXT_PUBLIC_`
- The service role key bypasses Row Level Security and should be kept secret

### Existing Variables (Keep These)

```bash
# Keep all your existing variables:
ADMIN_PASSWORD=your_existing_password
DATABASE_URL=your_existing_postgres_url  # For web accounts (Prisma)
UPSTASH_REDIS_REST_URL=your_redis_url    # Still used for analytics only
UPSTASH_REDIS_REST_TOKEN=your_redis_token
RESEND_API_KEY=your_resend_key           # For email notifications
# ... etc
```

## Step 4: Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Stage 1: Unified application storage with Supabase"
git push origin cursor/stage1-unified-storage-f4c1
```

The PR will trigger a Vercel preview deployment. Verify:
1. Build succeeds ✅
2. Forms still work
3. Admin pages load (they'll be empty until migration runs)

## Step 5: Migrate Existing Data (IMPORTANT)

⚠️ **DO NOT run this against production without testing first!**

### Test Migration (Dry Run)

```bash
# From your local development environment
npm install tsx  # If not already installed

# Set environment variables
export UPSTASH_REDIS_REST_URL="your_redis_url"
export UPSTASH_REDIS_REST_TOKEN="your_redis_token"
export NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run dry run (shows what would be migrated)
npx tsx scripts/migrate-redis-to-supabase.ts
```

Review the output carefully:
- Check member counts
- Verify application types
- Look for any errors

### Execute Migration

If dry run looks good:

```bash
# Execute actual migration
npx tsx scripts/migrate-redis-to-supabase.ts --execute
```

This will:
1. Create member records from Redis signups
2. Create application records for all submissions
3. Upload photos and documents to Supabase Storage
4. Preserve Redis IDs for tracking
5. Map statuses: `accepted` → `approved`, `rejected` → `rejected`, `pending` → `submitted`

### Verify Migration

After migration completes:

1. Check Supabase Dashboard → **Table Editor** → `members`
   - Should see all members from Redis
2. Check `applications` table
   - Should see membership signups + benefit applications + hotel bookings
3. Check `application_documents` table
   - Should have facial photos and uploaded receipts
4. Check **Storage** → `application-documents`
   - Files should be organized by application ID

## What Changed

### For Users (No Breaking Changes)

- All forms work exactly the same
- Submissions now go to Supabase instead of Redis
- No data loss from Redis limits anymore

### For Admins

**Admin pages now show ALL applications:**

- `/admin/members` - Shows both Redis signups AND Supabase applications
- Applications are marked with source for clarity
- Formal membership applications (from logged-in users) are now visible
- Hotel bookings from Supabase appear alongside Prisma bookings

### Data Flow (Before vs After)

**Before Stage 1:**
```
Member Signup → Redis (max 200) ❌ Data loss after 200 submissions
Formal Membership → Prisma (but invisible to admin)
Hotel Booking → Prisma (unused) + Redis log
Benefits → Redis (max 500) ❌ Data loss after 500 submissions
Photos → Base64 in Redis ❌ Inefficient, size-limited
```

**After Stage 1:**
```
Member Signup → Supabase + Redis (analytics only)
Formal Membership → Supabase
Hotel Booking → Prisma + Supabase (dual for transition)
Benefits → Supabase + Redis (analytics only)
Photos → Supabase Storage ✅ Proper file handling, unlimited
```

## Rollback Plan

If something goes wrong:

1. **Revert the PR** - Old code still works with Redis
2. **Data is safe** - Migration doesn't delete from Redis
3. **Re-run migration** - Script is idempotent (won't duplicate)

## Troubleshooting

### Build fails with "Supabase is not configured"

- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify they're set in Vercel environment variables for the preview

### Forms submit but data doesn't appear in Supabase

- Check `SUPABASE_SERVICE_ROLE_KEY` is set (server-side only)
- Look at Vercel function logs for errors
- Verify RLS policies are in place (migration should create them)

### Migration script fails

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY  # Should show, but don't share this!

# Verify Supabase connection
curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
```

### Photos not appearing

- Check Supabase Storage → `application-documents` bucket exists
- Verify storage policies allow service role access
- Check file size limits (5 MB for photos, 800 KB for receipts)

## Next Steps

After Stage 1 is deployed and verified:

- **Stage 2**: Member dashboard (view your own applications)
- **Stage 3**: Admin workflow tools (approve/reject, status changes, notes)
- **Stage 4**: Notifications (email on status changes)
- **Stage 5**: Rate limiting + CAPTCHA

## Support

If you encounter issues:

1. Check Vercel function logs
2. Check Supabase logs (Dashboard → Logs)
3. Review this document's troubleshooting section
4. The migration script has detailed error messages

## Data Retention

With Stage 1:
- ✅ **No more data loss** - Supabase stores everything permanently
- ✅ **Proper backups** - Supabase handles automatic backups
- ✅ **Scalable** - No 200/500 record limits
- ✅ **File storage** - Photos and documents in proper object storage
- ✅ **Audit trail** - `application_status_history` tracks all changes
