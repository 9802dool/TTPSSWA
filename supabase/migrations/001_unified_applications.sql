-- TTPSSWA Stage 1: Unified Applications Storage
-- Run this in the Supabase SQL editor or via `supabase db push`

-- Application types enum
CREATE TYPE application_type AS ENUM (
  'membership_signup',
  'formal_membership',
  'dental_optical_grant',
  'legal_aid_application',
  'merit_loan_application',
  'retirement_benefit_application',
  'salary_deduction',
  'hotel_booking'
);

-- Application status enum
CREATE TYPE application_status AS ENUM (
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'completed',
  'cancelled'
);

-- Members table (consolidated from multiple sources)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Core identity
  email TEXT NOT NULL,
  service_number TEXT, -- regimental number
  full_name TEXT NOT NULL,
  rank TEXT,
  
  -- Contact
  phone TEXT,
  phone_country_code TEXT DEFAULT '+1868',
  phone_home TEXT,
  phone_work TEXT,
  address TEXT,
  
  -- Work details
  department_division TEXT,
  section_station TEXT,
  
  -- Personal
  date_of_birth DATE,
  sex TEXT CHECK (sex IN ('male', 'female')),
  age INTEGER,
  
  -- Legacy fields from Redis
  username TEXT, -- legacy login identifier
  password_hash TEXT, -- scrypt hash if migrated from Redis
  financial_member TEXT CHECK (financial_member IN ('yes', 'no')),
  date_of_enlistment DATE,
  
  -- Member status
  member_status TEXT DEFAULT 'pending' CHECK (member_status IN ('pending', 'active', 'suspended', 'retired')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT members_email_unique UNIQUE (email),
  CONSTRAINT members_service_number_unique UNIQUE (service_number)
);

-- Applications table (all types)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Core fields
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  application_type application_type NOT NULL,
  status application_status DEFAULT 'submitted',
  
  -- Type-specific data stored as JSONB
  application_data JSONB NOT NULL DEFAULT '{}',
  
  -- Admin fields
  admin_notes TEXT,
  reviewed_by UUID, -- references admin user, but no FK to avoid complexity
  reviewed_at TIMESTAMPTZ,
  
  -- Legacy tracking
  legacy_redis_id TEXT, -- original Redis record ID for migration tracking
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT applications_check_member_or_guest CHECK (
    member_id IS NOT NULL OR 
    (application_type = 'hotel_booking' AND application_data ? 'guestName')
  )
);

-- Application documents (photos, receipts, ID cards, etc.)
CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  
  -- File metadata
  document_type TEXT NOT NULL, -- 'facial_photo', 'receipt', 'id_card', 'payslip', etc.
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  
  -- Storage location
  storage_bucket TEXT NOT NULL DEFAULT 'application-documents',
  storage_path TEXT NOT NULL, -- path within bucket
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT application_documents_storage_unique UNIQUE (storage_bucket, storage_path)
);

-- Application status history (audit trail)
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  
  -- Status change
  from_status application_status,
  to_status application_status NOT NULL,
  
  -- Who made the change
  changed_by_type TEXT NOT NULL CHECK (changed_by_type IN ('system', 'admin', 'member')),
  changed_by_id TEXT, -- admin session ID or member ID
  changed_by_name TEXT, -- for display
  
  -- Optional note
  note TEXT,
  
  -- When
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional context
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_members_service_number ON public.members(service_number) WHERE service_number IS NOT NULL;
CREATE INDEX idx_members_status ON public.members(member_status);
CREATE INDEX idx_members_created ON public.members(created_at DESC);

CREATE INDEX idx_applications_member ON public.applications(member_id);
CREATE INDEX idx_applications_type ON public.applications(application_type);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_submitted ON public.applications(submitted_at DESC);
CREATE INDEX idx_applications_type_status ON public.applications(application_type, status);

CREATE INDEX idx_documents_application ON public.application_documents(application_id);
CREATE INDEX idx_documents_member ON public.application_documents(member_id);

CREATE INDEX idx_history_application ON public.application_status_history(application_id, changed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin service role can access everything
-- (Service role bypasses RLS by default, but we're explicit here)

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role full access to members" ON public.members;
DROP POLICY IF EXISTS "Service role full access to applications" ON public.applications;
DROP POLICY IF EXISTS "Service role full access to documents" ON public.application_documents;
DROP POLICY IF EXISTS "Service role full access to history" ON public.application_status_history;

-- Admin service role has full access (server-side only)
CREATE POLICY "Service role full access to members"
ON public.members FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to applications"
ON public.applications FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to documents"
ON public.application_documents FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to history"
ON public.application_status_history FOR ALL
USING (true)
WITH CHECK (true);

-- Public can submit applications (but not read them)
CREATE POLICY "Public can insert applications"
ON public.applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can upload documents during submission"
ON public.application_documents FOR INSERT
WITH CHECK (true);

-- Storage bucket for private application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Only service role can access
CREATE POLICY "Service role can manage application documents"
ON storage.objects FOR ALL
USING (bucket_id = 'application-documents')
WITH CHECK (bucket_id = 'application-documents');

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.members IS 'All TTPSSWA members from signups and registrations';
COMMENT ON TABLE public.applications IS 'All application types: membership, benefits, hotel bookings';
COMMENT ON TABLE public.application_documents IS 'File metadata for photos, receipts, documents';
COMMENT ON TABLE public.application_status_history IS 'Audit trail of all status changes';
COMMENT ON COLUMN public.applications.application_data IS 'Type-specific fields stored as JSON: nisNumber, bankName, checkIn/checkOut for hotels, etc.';
