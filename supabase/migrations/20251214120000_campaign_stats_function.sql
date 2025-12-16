-- Migration: Add get_campaign_stats function for efficient aggregation
-- This replaces fetching ALL campaigns to calculate stats in JavaScript

-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_campaign_stats(UUID);

-- Create optimized stats aggregation function
CREATE OR REPLACE FUNCTION get_campaign_stats(p_org_id UUID)
RETURNS TABLE (
  total BIGINT,
  active BIGINT,
  leads_generated BIGINT,
  prospects_contacted BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active,
    COALESCE(SUM(leads_generated), 0)::BIGINT as leads_generated,
    COALESCE(SUM(prospects_contacted), 0)::BIGINT as prospects_contacted,
    CASE
      WHEN COALESCE(SUM(prospects_contacted), 0) > 0
      THEN (COALESCE(SUM(leads_generated), 0)::NUMERIC / SUM(prospects_contacted)::NUMERIC) * 100
      ELSE 0
    END as conversion_rate
  FROM campaigns
  WHERE org_id = p_org_id
    AND deleted_at IS NULL;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_campaign_stats(UUID) IS
  'Efficiently calculates campaign stats using SQL aggregation instead of fetching all rows';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_campaign_stats(UUID) TO authenticated;
