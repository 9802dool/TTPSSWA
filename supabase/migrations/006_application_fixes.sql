-- Migration 006: Application fixes
--
-- Adds the 'merit_salary_deduction' application type so the merit salary
-- deduction form is stored separately from the standard salary deduction form.
--
-- Notes:
-- * public.applications.application_type is the ENUM type public.application_type
--   (created in 001), not TEXT with a CHECK constraint, so the new value is added
--   with ALTER TYPE ... ADD VALUE. IF NOT EXISTS makes this safe to re-run.
-- * No new column is needed: application_data already stores the exact form
--   submission, and upsertMember no longer overwrites existing member profiles.
-- * No backfill: production had 0 'salary_deduction' rows when this was written,
--   and a newly added enum value cannot be used in the same transaction anyway.
--   If old merit rows ever need reclassifying, do it in a separate, reviewed step.
-- * Apply this BEFORE deploying the code that inserts 'merit_salary_deduction'.

ALTER TYPE public.application_type
  ADD VALUE IF NOT EXISTS 'merit_salary_deduction' AFTER 'salary_deduction';
