-- Phase 10: Cleanup and Deprecation of Legacy accounts/vendors Tables
-- This migration removes the backward compatibility views and legacy tables
-- after the codebase has been updated to use the unified 'companies' table.
--
-- IMPORTANT: Only run this migration AFTER verifying:
-- 1. All code has been updated to use 'companies' table instead of 'accounts'/'vendors'
-- 2. All FK joins use 'company_id' pointing to 'companies' instead of 'account_id'/'vendor_id'
-- 3. All data has been migrated from legacy tables to companies and company_* tables

-- ============================================================
-- STEP 1: Drop Backward Compatibility Views
-- ============================================================

DROP VIEW IF EXISTS public.accounts_v CASCADE;
DROP VIEW IF EXISTS public.vendors_v CASCADE;

-- ============================================================
-- STEP 2: Drop Legacy FK Constraints (if any remain)
-- ============================================================

-- Drop foreign keys from tables that still reference accounts/vendors
-- (These should have been updated to reference companies during migration)

-- job_orders table
ALTER TABLE IF EXISTS public.job_orders
  DROP CONSTRAINT IF EXISTS job_orders_vendor_id_fkey;

-- jobs table - drop legacy account_id FK (company_id FK should be active)
ALTER TABLE IF EXISTS public.jobs
  DROP CONSTRAINT IF EXISTS jobs_account_id_fkey;
ALTER TABLE IF EXISTS public.jobs
  DROP CONSTRAINT IF EXISTS jobs_client_id_fkey;

-- placements table - drop legacy account_id FK
ALTER TABLE IF EXISTS public.placements
  DROP CONSTRAINT IF EXISTS placements_account_id_fkey;

-- contacts table - drop legacy account_id and vendor_id FKs
ALTER TABLE IF EXISTS public.contacts
  DROP CONSTRAINT IF EXISTS contacts_account_id_fkey;
ALTER TABLE IF EXISTS public.contacts
  DROP CONSTRAINT IF EXISTS contacts_vendor_id_fkey;

-- account_contracts - this table is replaced by company_contracts
-- account_metrics - this table is replaced by company_metrics
-- account_notes - this table is replaced by company_notes
-- account_preferences - this table is replaced by company_preferences
-- account_team - this table is replaced by company_team

-- ============================================================
-- STEP 3: Drop Legacy Columns from Tables
-- ============================================================

-- Jobs table - remove legacy account_id column (keep company_id)
ALTER TABLE IF EXISTS public.jobs
  DROP COLUMN IF EXISTS account_id CASCADE;
ALTER TABLE IF EXISTS public.jobs
  DROP COLUMN IF EXISTS client_id CASCADE;

-- Placements table - remove legacy account_id column (keep company_id)
ALTER TABLE IF EXISTS public.placements
  DROP COLUMN IF EXISTS account_id CASCADE;

-- Contacts table - remove legacy account_id and vendor_id columns (keep company_id)
ALTER TABLE IF EXISTS public.contacts
  DROP COLUMN IF EXISTS account_id CASCADE;
ALTER TABLE IF EXISTS public.contacts
  DROP COLUMN IF EXISTS vendor_id CASCADE;

-- Job orders - remove vendor_id if exists (should use company_id)
ALTER TABLE IF EXISTS public.job_orders
  DROP COLUMN IF EXISTS vendor_id CASCADE;

-- Companies table - remove legacy_account_id and legacy_vendor_id columns
ALTER TABLE IF EXISTS public.companies
  DROP COLUMN IF EXISTS legacy_account_id CASCADE;
ALTER TABLE IF EXISTS public.companies
  DROP COLUMN IF EXISTS legacy_vendor_id CASCADE;

-- ============================================================
-- STEP 4: Drop Legacy Tables (accounts and vendors)
-- ============================================================

-- Drop account_* tables (replaced by company_* tables)
DROP TABLE IF EXISTS public.account_contacts CASCADE;
DROP TABLE IF EXISTS public.account_contracts CASCADE;
DROP TABLE IF EXISTS public.account_metrics CASCADE;
DROP TABLE IF EXISTS public.account_notes CASCADE;
DROP TABLE IF EXISTS public.account_preferences CASCADE;
DROP TABLE IF EXISTS public.account_team CASCADE;

-- Drop vendor_* tables (replaced by company_vendor_* tables)
DROP TABLE IF EXISTS public.vendor_terms CASCADE;
DROP TABLE IF EXISTS public.vendor_performance CASCADE;
DROP TABLE IF EXISTS public.vendor_compliance CASCADE;
DROP TABLE IF EXISTS public.vendor_contacts CASCADE;

-- Drop the main legacy tables last (after all dependencies removed)
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;

-- ============================================================
-- STEP 5: Cleanup Indexes (if any orphaned indexes remain)
-- ============================================================

DROP INDEX IF EXISTS public.idx_accounts_org_id;
DROP INDEX IF EXISTS public.idx_accounts_name;
DROP INDEX IF EXISTS public.idx_accounts_status;
DROP INDEX IF EXISTS public.idx_vendors_org_id;
DROP INDEX IF EXISTS public.idx_vendors_name;
DROP INDEX IF EXISTS public.idx_vendors_status;

-- ============================================================
-- VERIFICATION QUERIES (commented out - run manually to verify)
-- ============================================================

-- Verify no tables referencing accounts or vendors exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND (table_name LIKE 'account%' OR table_name LIKE 'vendor%');

-- Verify no foreign keys to accounts or vendors remain
-- SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
-- AND ccu.table_name IN ('accounts', 'vendors');

-- ============================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================

-- If this migration needs to be rolled back, you will need to:
-- 1. Restore the accounts and vendors tables from backup
-- 2. Recreate the backward compatibility views
-- 3. Re-add the legacy FK columns to dependent tables
-- 4. Update code to use legacy table names again
--
-- This is a destructive migration - ensure you have backups before running.
