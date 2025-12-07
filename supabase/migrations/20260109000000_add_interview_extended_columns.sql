-- Migration: Add extended columns to interviews table for full F03-F06 functionality
-- These columns support proposed times, confirmation, rescheduling, prep, and detailed feedback

-- Add proposed times as JSONB array
-- Format: [{id, date, time, timezone, status: 'pending'|'confirmed'|'declined'}]
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS proposed_times JSONB DEFAULT '[]'::jsonb;

-- Add confirmation tracking
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES user_profiles(id);

-- Add reschedule tracking
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS rescheduled_by UUID REFERENCES user_profiles(id);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;

-- Add cancellation details (cancellation_reason already exists)
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES user_profiles(id);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS cancellation_notes TEXT;

-- Add interview prep tracking
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS prep_completed_at TIMESTAMPTZ;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS prep_completed_by UUID REFERENCES user_profiles(id);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS prep_notes TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS prep_checklist JSONB DEFAULT '[]'::jsonb;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS prep_materials_sent_at TIMESTAMPTZ;

-- Add detailed feedback ratings
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS problem_solving_rating INTEGER CHECK (problem_solving_rating >= 1 AND problem_solving_rating <= 5);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS culture_fit_rating INTEGER CHECK (culture_fit_rating >= 1 AND culture_fit_rating <= 5);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS strengths TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS concerns TEXT;

-- Add interview details
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS location TEXT;

-- Add candidate feedback fields
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS candidate_experience TEXT CHECK (candidate_experience IN ('great', 'good', 'okay', 'poor'));
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS candidate_interest_level TEXT CHECK (candidate_interest_level IN ('very_high', 'high', 'medium', 'low', 'withdrawn'));
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS candidate_feedback TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS candidate_concerns TEXT;

-- Add attendance tracking
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS attendance_status TEXT CHECK (attendance_status IN ('attended', 'no_show', 'cancelled', 'rescheduled'));

-- Add next steps tracking
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS next_steps TEXT CHECK (next_steps IN ('schedule_next_round', 'extend_offer', 'reject', 'on_hold'));

-- Add ICS calendar data
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS ics_uid TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS ics_sequence INTEGER DEFAULT 0;

-- Update status enum to include 'proposed'
-- First check current values and update constraint
DO $$
BEGIN
    -- Add 'proposed' and 'confirmed' to valid statuses if not already there
    -- The status column uses TEXT, so we just need to ensure our code handles the values
    COMMENT ON COLUMN interviews.status IS 'Valid values: proposed, scheduled, confirmed, completed, cancelled, no_show';
END $$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_interviews_proposed_times ON interviews USING GIN (proposed_times);
CREATE INDEX IF NOT EXISTS idx_interviews_confirmed_at ON interviews(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_interviews_prep_completed ON interviews(prep_completed_at);
CREATE INDEX IF NOT EXISTS idx_interviews_attendance ON interviews(attendance_status);

-- Add comment for documentation
COMMENT ON TABLE interviews IS 'Interview records with full lifecycle tracking: scheduling, confirmation, prep, feedback';
