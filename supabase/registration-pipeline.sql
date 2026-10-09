-- Registration document pipeline. Run once in the Supabase SQL editor.
-- Then set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
-- and SUPABASE_SERVICE_ROLE_KEY on the Next.js app.

CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE user_role AS ENUM ('member', 'admin', 'super_admin');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reg_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  division TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  id_card_path TEXT NOT NULL,
  payslip_path TEXT NOT NULL,
  status application_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public application submission"
ON public.applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admins full access to applications"
ON public.applications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
  )
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-docs', 'registration-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public document uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'registration-docs');

CREATE POLICY "Allow admin document viewing"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'registration-docs' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
  )
);
