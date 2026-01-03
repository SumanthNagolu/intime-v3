-- Fix duplicate triggers on activities table causing "stack depth limit exceeded"
-- Run this in Supabase SQL Editor

-- Check current triggers on activities table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'activities'
ORDER BY trigger_name;

-- Drop duplicate INSERT trigger (keep activities_generate_number)
DROP TRIGGER IF EXISTS trigger_generate_activity_number ON activities;

-- Drop duplicate UPDATE triggers (keep activities_updated_at)
DROP TRIGGER IF EXISTS activities_updated_at_trigger ON activities;
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;

-- Verify remaining triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'activities'
ORDER BY trigger_name;
