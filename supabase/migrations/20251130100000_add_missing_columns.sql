-- Migration: Add missing columns to fix TypeScript errors
-- This migration adds columns that the code expects but don't exist in the database

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================

-- Add timezone column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add locale column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US';

-- Add logo_url column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add favicon_url column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Add plan column (alias for subscription_tier for compatibility)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Add metadata column (jsonb for storing settings)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- =====================================================
-- USER_PROFILES TABLE
-- =====================================================

-- Add employee_role column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS employee_role TEXT;

-- Add stripe_customer_id for billing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add title field if missing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS title TEXT;

-- =====================================================
-- JOBS TABLE
-- =====================================================

-- Add client_id as alias for account_id if code expects it
-- Note: The table has account_id, but some code may expect client_id
-- We'll create a view or add column if needed
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES accounts(id);

-- Add priority column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Add target_start_date column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS target_start_date TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- RECRUITERS / PLACEMENTS
-- =====================================================

-- Add total_placements to user_profiles for recruiter metrics
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_placements INTEGER DEFAULT 0;

-- =====================================================
-- SUBSCRIPTION / BILLING
-- =====================================================

-- Add stripe_coupon_id to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_coupon_id TEXT;

-- Add stripe_customer_id to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- =====================================================
-- INDEXES
-- =====================================================

-- Add index for employee_role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_role ON user_profiles(employee_role) WHERE deleted_at IS NULL;

-- Add index for stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- =====================================================
-- SYNC client_id with account_id for jobs
-- =====================================================

-- Update client_id to match account_id for existing records
UPDATE jobs SET client_id = account_id WHERE client_id IS NULL AND account_id IS NOT NULL;

-- Create trigger to keep them in sync
CREATE OR REPLACE FUNCTION sync_job_client_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_id IS DISTINCT FROM OLD.account_id THEN
    NEW.client_id := NEW.account_id;
  END IF;
  IF NEW.client_id IS DISTINCT FROM OLD.client_id THEN
    NEW.account_id := NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_job_client_id ON jobs;
CREATE TRIGGER trigger_sync_job_client_id
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION sync_job_client_id();
