-- TTPSSWA Stage 2: Security Hardening
-- Removes insecure RLS policies and functions

-- 1. Drop the insecure link_application_to_member function
DROP FUNCTION IF EXISTS link_application_to_member(UUID, TEXT, TEXT);

-- 2. Drop the auth.jwt() based member policies (site uses custom cookie auth, not Supabase Auth)
DROP POLICY IF EXISTS "Members can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Members can view own documents" ON public.application_documents;
DROP POLICY IF EXISTS "Members can view own history" ON public.application_status_history;
DROP POLICY IF EXISTS "Members can upload to own applications" ON public.application_documents;

-- 3. Drop the anon insert policies from migration 001
-- All form submissions now go through service_role server-side code
DROP POLICY IF EXISTS "Public can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Public can upload documents during submission" ON public.application_documents;

-- 4. Add index for case-insensitive email lookups used by member dashboard
CREATE INDEX IF NOT EXISTS idx_members_email_lower ON public.members(LOWER(email));

-- Comment for documentation
COMMENT ON MIGRATION '003_security_hardening' IS 
'Removes SECURITY DEFINER function and auth.jwt() policies. All data access now via service_role server-side code with verified session checks.';
