-- Migration: Fix FK constraints for candidate-related tables
-- Issue: candidate_work_history, candidate_education, and candidate_certifications
--        have candidate_id FK pointing to user_profiles instead of candidates
--
-- Run this migration in Supabase SQL Editor

-- 1. Fix candidate_work_history FK constraint
ALTER TABLE public.candidate_work_history
DROP CONSTRAINT IF EXISTS candidate_work_history_candidate_id_fkey;

ALTER TABLE public.candidate_work_history
ADD CONSTRAINT candidate_work_history_candidate_id_fkey
FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;

-- 2. Fix candidate_education FK constraint
ALTER TABLE public.candidate_education
DROP CONSTRAINT IF EXISTS candidate_education_candidate_id_fkey;

ALTER TABLE public.candidate_education
ADD CONSTRAINT candidate_education_candidate_id_fkey
FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;

-- 3. Fix candidate_certifications FK constraint
ALTER TABLE public.candidate_certifications
DROP CONSTRAINT IF EXISTS candidate_certifications_candidate_id_fkey;

ALTER TABLE public.candidate_certifications
ADD CONSTRAINT candidate_certifications_candidate_id_fkey
FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;

-- Verify the changes
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('candidate_work_history', 'candidate_education', 'candidate_certifications')
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'candidate_id';
