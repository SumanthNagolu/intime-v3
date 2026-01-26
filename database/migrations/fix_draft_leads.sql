-- Fix Draft Leads Migration
-- Fixes leads that were incorrectly marked as 'new' when they should be 'draft'
-- This addresses the bug where DEFAULT_IDENTITY_DATA.status was 'new' instead of empty

-- Update leads with 'new' status that have minimal data filled
-- These are likely drafts that were never properly submitted
UPDATE public.contacts
SET lead_status = 'draft'
WHERE subtype IN ('person_lead', 'company_lead')
  AND lead_status = 'new'
  AND deleted_at IS NULL
  -- Only has first name or company name filled (minimal data)
  AND (
    -- Has no classification data (second section)
    (lead_type IS NULL OR lead_type = '')
    AND (lead_category IS NULL OR lead_category = '')
    AND (lead_opportunity_type IS NULL OR lead_opportunity_type = '')
  );

-- To see which leads will be affected, run this SELECT first:
-- SELECT id, first_name, last_name, company_name, lead_status, lead_type, created_at
-- FROM public.contacts
-- WHERE subtype IN ('person_lead', 'company_lead')
--   AND lead_status = 'new'
--   AND deleted_at IS NULL
--   AND (lead_type IS NULL OR lead_type = '')
--   AND (lead_category IS NULL OR lead_category = '')
--   AND (lead_opportunity_type IS NULL OR lead_opportunity_type = '');
