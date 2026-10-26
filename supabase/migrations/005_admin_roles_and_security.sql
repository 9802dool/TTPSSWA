-- TTPSSWA Stage 3: Admin Roles and Security Enhancements
-- Service role only - no anon or authenticated access

-- Admin users table for individual admin accounts
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt or argon2
  
  -- Role and status
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'staff', 'viewer')),
  active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT admin_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(active) WHERE active = true;

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Revoke any public access first
REVOKE ALL ON public.admin_users FROM anon;
REVOKE ALL ON public.admin_users FROM authenticated;

-- RLS Policy: Only service role can access
DROP POLICY IF EXISTS "Service role full access to admin_users" ON public.admin_users;
CREATE POLICY "Service role full access to admin_users"
ON public.admin_users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update trigger for updated_at (make idempotent)
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Atomic bootstrap function with advisory lock
-- Creates first super_admin only if no admins exist
DROP FUNCTION IF EXISTS bootstrap_first_admin(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION bootstrap_first_admin(
  p_email TEXT,
  p_full_name TEXT,
  p_password_hash TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  admin_id UUID,
  message TEXT
) AS $$
DECLARE
  v_admin_id UUID;
  v_existing_count INTEGER;
  v_lock_acquired BOOLEAN;
BEGIN
  -- Try to acquire advisory lock (key: 1234567890)
  -- This prevents concurrent bootstrap attempts
  v_lock_acquired := pg_try_advisory_xact_lock(1234567890);
  
  IF NOT v_lock_acquired THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Another bootstrap is in progress';
    RETURN;
  END IF;
  
  -- Check if any admins already exist
  SELECT COUNT(*) INTO v_existing_count FROM public.admin_users;
  
  IF v_existing_count > 0 THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Admin accounts already exist';
    RETURN;
  END IF;
  
  -- Create the first super_admin
  INSERT INTO public.admin_users (email, full_name, password_hash, role, active)
  VALUES (lower(p_email), p_full_name, p_password_hash, 'super_admin', true)
  RETURNING id INTO v_admin_id;
  
  RETURN QUERY SELECT true, v_admin_id, 'First super_admin created successfully';
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path = '';

-- Lock down the bootstrap function
REVOKE ALL ON FUNCTION bootstrap_first_admin(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION bootstrap_first_admin(TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION bootstrap_first_admin(TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION bootstrap_first_admin(TEXT, TEXT, TEXT) TO service_role;

-- Admin action log (extends application_status_history with admin context)
-- Add admin_user_id to track who made changes
ALTER TABLE public.application_status_history 
ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES public.admin_users(id);

ALTER TABLE public.application_status_history 
ADD COLUMN IF NOT EXISTS admin_email TEXT;

CREATE INDEX IF NOT EXISTS idx_history_admin_user ON public.application_status_history(admin_user_id) WHERE admin_user_id IS NOT NULL;

-- Remove password_hash from member lookup function for security
-- Recreate function without password_hash column
DROP FUNCTION IF EXISTS get_member_by_email_lower(TEXT);

CREATE OR REPLACE FUNCTION get_member_by_email_lower(search_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  service_number TEXT,
  full_name TEXT,
  rank TEXT,
  phone TEXT,
  phone_country_code TEXT,
  phone_home TEXT,
  phone_work TEXT,
  address TEXT,
  department_division TEXT,
  section_station TEXT,
  date_of_birth DATE,
  sex TEXT,
  age INTEGER,
  username TEXT,
  -- password_hash intentionally omitted for security
  financial_member TEXT,
  date_of_enlistment DATE,
  member_status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.email,
    m.service_number,
    m.full_name,
    m.rank,
    m.phone,
    m.phone_country_code,
    m.phone_home,
    m.phone_work,
    m.address,
    m.department_division,
    m.section_station,
    m.date_of_birth,
    m.sex,
    m.age,
    m.username,
    -- m.password_hash omitted
    m.financial_member,
    m.date_of_enlistment,
    m.member_status,
    m.created_at,
    m.updated_at
  FROM public.members m
  WHERE lower(m.email) = lower(search_email)
  ORDER BY m.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = '';

-- Revoke and grant permissions
REVOKE ALL ON FUNCTION get_member_by_email_lower(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_member_by_email_lower(TEXT) FROM anon;
REVOKE ALL ON FUNCTION get_member_by_email_lower(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION get_member_by_email_lower(TEXT) TO service_role;

-- Comments
COMMENT ON TABLE public.admin_users IS 'Individual admin accounts with role-based access control. Service role only.';
COMMENT ON COLUMN public.admin_users.role IS 'super_admin: manage admins + export, staff: change status + notes, viewer: read only';
COMMENT ON COLUMN public.application_status_history.admin_user_id IS 'Links status change to specific admin user for audit trail';
COMMENT ON FUNCTION get_member_by_email_lower IS 'Returns member without password_hash for security. SECURITY INVOKER with service_role only access.';
