-- ============================================================================
-- BOOTSTRAP SCRIPT
-- Run this ONCE in Supabase Dashboard to enable automated migrations
-- ============================================================================

-- Create function to execute migrations via RPC
CREATE OR REPLACE FUNCTION exec_migration(migration_sql TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE migration_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to execute arbitrary SQL (for flexibility)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION exec_migration(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;

-- Verify functions were created
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN ('exec_migration', 'exec_sql')
  AND pronamespace = 'public'::regnamespace;
