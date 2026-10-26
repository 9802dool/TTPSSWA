-- TTPSSWA Stage 2: Member Dashboard & Admin Workflow Enhancements
-- This migration is ADDITIVE and SECURE - safe to apply to production
-- All insecure elements (SECURITY DEFINER function, auth.jwt() policies) removed
-- Migration 003 will clean up any remnants from earlier versions

-- Add index to speed up member lookups (used by server-side code)
CREATE INDEX IF NOT EXISTS idx_members_email_service 
ON public.members(email, service_number);
