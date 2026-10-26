-- TTPSSWA: Safe Member Email Lookup
-- Fixes wildcard issues with .ilike and duplicate handling

-- Function to find member by email with exact case-insensitive match
-- Returns the most recently created member if duplicates exist (shouldn't happen due to unique constraint)
-- SECURITY INVOKER: Runs with caller's permissions (service_role bypasses RLS)
-- NOT SECURITY DEFINER: Prevents anon/authenticated from calling via REST API
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
  password_hash TEXT,
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
    m.password_hash,
    m.financial_member,
    m.date_of_enlistment,
    m.member_status,
    m.created_at,
    m.updated_at
  FROM public.members m
  WHERE lower(m.email) = lower(search_email)  -- Uses idx_members_email_lower
  ORDER BY m.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = '';  -- Prevent search_path attacks

-- Revoke default public execute permission
REVOKE ALL ON FUNCTION get_member_by_email_lower(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_member_by_email_lower(TEXT) FROM anon;
REVOKE ALL ON FUNCTION get_member_by_email_lower(TEXT) FROM authenticated;

-- Grant execute to service role only
GRANT EXECUTE ON FUNCTION get_member_by_email_lower(TEXT) TO service_role;

-- Comment for documentation
COMMENT ON FUNCTION get_member_by_email_lower IS 
'Safely finds a member by email with exact case-insensitive match. Avoids wildcard issues with ILIKE. Returns most recent if duplicates exist. Uses idx_members_email_lower index. SECURITY INVOKER with service_role only access.';
