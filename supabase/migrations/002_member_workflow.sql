-- TTPSSWA Stage 2: Member Dashboard & Admin Workflow Enhancements
-- This migration is ADDITIVE - safe to apply to production

-- Helper function to link applications to members by email or service number
-- Used when application was submitted before member record existed
CREATE OR REPLACE FUNCTION link_application_to_member(
  p_application_id UUID,
  p_email TEXT DEFAULT NULL,
  p_service_number TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_member_id UUID;
BEGIN
  -- Find member by email or service number
  SELECT id INTO v_member_id
  FROM public.members
  WHERE (p_email IS NOT NULL AND email = p_email)
     OR (p_service_number IS NOT NULL AND service_number = p_service_number)
  LIMIT 1;

  -- If member found, link the application
  IF v_member_id IS NOT NULL THEN
    UPDATE public.applications
    SET member_id = v_member_id,
        updated_at = NOW()
    WHERE id = p_application_id
      AND member_id IS NULL;
    
    RETURN FOUND;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index to speed up member lookups for linking
CREATE INDEX IF NOT EXISTS idx_members_email_service 
ON public.members(email, service_number);

-- Member RLS policy: Members can view their own applications
DROP POLICY IF EXISTS "Members can view own applications" ON public.applications;
CREATE POLICY "Members can view own applications"
ON public.applications FOR SELECT
TO authenticated
USING (
  member_id IN (
    SELECT id FROM public.members 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Member RLS policy: Members can view their own documents
DROP POLICY IF EXISTS "Members can view own documents" ON public.application_documents;
CREATE POLICY "Members can view own documents"
ON public.application_documents FOR SELECT
TO authenticated
USING (
  member_id IN (
    SELECT id FROM public.members 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Member RLS policy: Members can view their own status history
DROP POLICY IF EXISTS "Members can view own history" ON public.application_status_history;
CREATE POLICY "Members can view own history"
ON public.application_status_history FOR SELECT
TO authenticated
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.members m ON a.member_id = m.id
    WHERE m.email = auth.jwt() ->> 'email'
  )
);

-- Member RLS policy: Members can upload additional documents to their own applications
DROP POLICY IF EXISTS "Members can upload to own applications" ON public.application_documents;
CREATE POLICY "Members can upload to own applications"
ON public.application_documents FOR INSERT
TO authenticated
WITH CHECK (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.members m ON a.member_id = m.id
    WHERE m.email = auth.jwt() ->> 'email'
  )
);

-- Add comment for documentation
COMMENT ON FUNCTION link_application_to_member IS 
'Links unlinked applications to members by matching email or service number. Used during migration or when applications submitted before member signup.';
