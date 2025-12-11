-- Fix broken trigger that references dropped account_id column
-- The sync_job_client_id function and trigger were created to sync account_id <-> client_id
-- but account_id was dropped in migration 20251210221445_cleanup_legacy_accounts_vendors.sql

-- Drop the broken trigger
DROP TRIGGER IF EXISTS trigger_sync_job_client_id ON jobs;

-- Drop the broken function
DROP FUNCTION IF EXISTS sync_job_client_id();

-- Note: client_id column should now reference company_id directly
-- No sync trigger needed since we use company_id as the single FK
