-- Migration 006: Application fixes
-- 1. Add submitted_data field to preserve form data from anonymous submissions
-- 2. Add merit_salary_deduction type to distinguish merit vs standard salary deduction
-- 3. Update constraints and type checks

-- Add submitted_data JSONB field to store snapshot of submitted form data
-- Used when an anonymous submission matches an existing member to preserve
-- what they actually submitted vs what's in the member record
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS submitted_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_submitted_data 
ON public.applications USING gin(submitted_data) 
WHERE submitted_data IS NOT NULL;

COMMENT ON COLUMN public.applications.submitted_data IS 
'Snapshot of form data from anonymous submissions. Preserves submitted details when an existing member record is found and linked, preventing profile overwrites.';

-- Update application_type constraint to include merit_salary_deduction
-- Drop the old constraint first (if it exists)
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_application_type_check;

-- Add updated constraint with merit_salary_deduction
ALTER TABLE public.applications 
ADD CONSTRAINT applications_application_type_check 
CHECK (application_type IN (
  'membership_signup',
  'formal_membership',
  'dental_optical_grant',
  'legal_aid_application',
  'merit_loan_application',
  'retirement_benefit_application',
  'salary_deduction',
  'merit_salary_deduction',
  'hotel_booking'
));

-- Optional backfill: Try to identify merit salary deductions by checking for
-- merit-specific fields in application_data. This is best-effort only.
-- You may need to manually review and update specific records if needed.
-- 
-- Merit salary deduction forms typically have these distinct fields:
-- - deductionSumWords, deductionSumDollars (vs. authMonthlyDeduction for standard)
-- - startMonth/startYear/endMonth/endYear (date range)
-- - nameInBlockLetters, signatureRegimentalNumber
-- 
-- Standard salary deduction forms have:
-- - commencementDate
-- - authMonthlyDeduction, policyAcknowledgment, electronicSignature
--
-- This query identifies likely merit salary deductions:
UPDATE public.applications
SET application_type = 'merit_salary_deduction'
WHERE application_type = 'salary_deduction'
  AND (
    (application_data ? 'deductionSumWords')
    OR (application_data ? 'deductionSumDollars')
    OR (application_data ? 'startMonth' AND application_data ? 'endMonth')
    OR (application_data ? 'nameInBlockLetters')
  )
  AND NOT (application_data ? 'authMonthlyDeduction')
  AND NOT (application_data ? 'policyAcknowledgment');

-- Log what we updated
DO $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_updated_count 
  FROM public.applications 
  WHERE application_type = 'merit_salary_deduction';
  
  RAISE NOTICE 'Backfilled % salary_deduction records as merit_salary_deduction based on form field heuristics', v_updated_count;
END $$;

COMMENT ON TABLE public.applications IS 'Application submissions with type discrimination for merit vs standard salary deductions. submitted_data preserves anonymous submission snapshots.';
