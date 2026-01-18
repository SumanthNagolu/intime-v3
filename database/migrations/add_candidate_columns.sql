-- Migration: Add missing candidate columns for comprehensive ATS data capture
-- Run this in Supabase Studio SQL Editor

-- ============================================================================
-- PART 1: Fix candidate_resumes FK constraint (CRITICAL for resume uploads)
-- ============================================================================

-- Drop the incorrect FK constraint that references user_profiles
ALTER TABLE public.candidate_resumes
DROP CONSTRAINT IF EXISTS candidate_resumes_candidate_id_fkey;

-- Add correct FK constraint that references candidates table
ALTER TABLE public.candidate_resumes
ADD CONSTRAINT candidate_resumes_candidate_id_fkey
FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;

-- Create index for candidate_id lookup
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_candidate_id
ON public.candidate_resumes(candidate_id) WHERE is_archived = false;

-- ============================================================================
-- PART 2: Add missing candidate columns
-- ============================================================================

-- Add location structure columns
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_state text,
ADD COLUMN IF NOT EXISTS location_country text DEFAULT 'US';

-- Add employment preferences
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS employment_types text[] DEFAULT '{full_time,contract}'::text[],
ADD COLUMN IF NOT EXISTS work_modes text[] DEFAULT '{on_site,remote}'::text[];

-- Add work authorization details
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS work_authorization text,
ADD COLUMN IF NOT EXISTS requires_sponsorship boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS clearance_level text;

-- Add notice period
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS notice_period_days integer;

-- Add compensation details
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS is_negotiable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS compensation_notes text;

-- Add relocation and contact details
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS relocation_preferences text,
ADD COLUMN IF NOT EXISTS mobile text,
ADD COLUMN IF NOT EXISTS current_company text;

-- Add referral tracking
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS referred_by text,
ADD COLUMN IF NOT EXISTS campaign_id uuid;

-- Add visa/sponsorship details
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS current_sponsor text,
ADD COLUMN IF NOT EXISTS is_transferable boolean;

-- Add availability details
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS available_from timestamp with time zone;

-- Add internal notes
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS internal_notes text;

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_candidates_location_city ON public.candidates(location_city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_location_state ON public.candidates(location_state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_visa_status ON public.candidates(visa_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_employment_types ON public.candidates USING gin(employment_types) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_work_modes ON public.candidates USING gin(work_modes) WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.candidates.location_city IS 'City for structured location';
COMMENT ON COLUMN public.candidates.location_state IS 'State/Province for structured location';
COMMENT ON COLUMN public.candidates.location_country IS 'Country code (2-3 letter) for structured location';
COMMENT ON COLUMN public.candidates.employment_types IS 'Array of preferred employment types: full_time, contract, contract_to_hire, part_time';
COMMENT ON COLUMN public.candidates.work_modes IS 'Array of preferred work modes: on_site, remote, hybrid';
COMMENT ON COLUMN public.candidates.work_authorization IS 'Detailed work authorization type';
COMMENT ON COLUMN public.candidates.requires_sponsorship IS 'Whether candidate requires visa sponsorship';
COMMENT ON COLUMN public.candidates.clearance_level IS 'Security clearance level if any';
COMMENT ON COLUMN public.candidates.notice_period_days IS 'Notice period required in days';
COMMENT ON COLUMN public.candidates.currency IS 'Preferred currency for compensation: USD, CAD, EUR, GBP, INR';
COMMENT ON COLUMN public.candidates.is_negotiable IS 'Whether compensation is negotiable';
COMMENT ON COLUMN public.candidates.compensation_notes IS 'Additional notes about compensation expectations';
COMMENT ON COLUMN public.candidates.relocation_preferences IS 'Notes about relocation preferences and restrictions';
COMMENT ON COLUMN public.candidates.mobile IS 'Mobile phone number';
COMMENT ON COLUMN public.candidates.current_company IS 'Current employer name';
COMMENT ON COLUMN public.candidates.referred_by IS 'Name or ID of person who referred this candidate';
