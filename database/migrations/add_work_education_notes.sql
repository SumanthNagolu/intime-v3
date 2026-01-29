-- Migration: Add internal_notes column to work history and education tables
-- Date: 2026-01-26

-- Add internal_notes to candidate_work_history
ALTER TABLE public.candidate_work_history
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add internal_notes to candidate_education
ALTER TABLE public.candidate_education
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add comments
COMMENT ON COLUMN public.candidate_work_history.internal_notes IS 'Internal notes for recruiters (not shown on resume)';
COMMENT ON COLUMN public.candidate_education.internal_notes IS 'Internal notes for recruiters (not shown on resume)';
