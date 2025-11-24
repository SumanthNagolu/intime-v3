-- Add Traffic Percentage Validation
-- Created: 2025-11-21
-- Description: Prevent A/B testing traffic allocation from exceeding 100%

-- ============================================================================
-- TRIGGER FUNCTION FOR TRAFFIC VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_traffic_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  -- Lock the table for this transaction to prevent race conditions
  LOCK TABLE ai_prompt_variants IN SHARE ROW EXCLUSIVE MODE;

  -- Calculate total active traffic excluding current row
  SELECT COALESCE(SUM(traffic_percentage), 0) INTO v_total
  FROM ai_prompt_variants
  WHERE is_active = true
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  -- Check if new allocation would exceed 100%
  IF NEW.is_active AND (v_total + NEW.traffic_percentage > 100) THEN
    RAISE EXCEPTION 'Traffic allocation would exceed 100%% (current active: %, adding: %)',
      v_total, NEW.traffic_percentage
      USING HINT = 'Deactivate or reduce traffic for other variants first';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ATTACH TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS validate_traffic_before_insert ON ai_prompt_variants;
DROP TRIGGER IF EXISTS validate_traffic_before_update ON ai_prompt_variants;

CREATE TRIGGER validate_traffic_before_insert
  BEFORE INSERT ON ai_prompt_variants
  FOR EACH ROW
  EXECUTE FUNCTION validate_traffic_allocation();

CREATE TRIGGER validate_traffic_before_update
  BEFORE UPDATE ON ai_prompt_variants
  FOR EACH ROW
  WHEN (NEW.is_active IS DISTINCT FROM OLD.is_active OR
        NEW.traffic_percentage IS DISTINCT FROM OLD.traffic_percentage)
  EXECUTE FUNCTION validate_traffic_allocation();

-- ============================================================================
-- HELPER FUNCTION: GET CURRENT TRAFFIC ALLOCATION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_traffic_allocation()
RETURNS TABLE (
  variant_id UUID,
  variant_name TEXT,
  traffic_percentage INTEGER,
  total_allocated INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH active_variants AS (
    SELECT
      id,
      variant_name,
      traffic_percentage
    FROM ai_prompt_variants
    WHERE is_active = true
  )
  SELECT
    av.id as variant_id,
    av.variant_name,
    av.traffic_percentage,
    (SELECT SUM(traffic_percentage) FROM active_variants)::INTEGER as total_allocated
  FROM active_variants av
  ORDER BY av.traffic_percentage DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_current_traffic_allocation IS 'Returns current A/B test traffic distribution';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION validate_traffic_allocation IS 'Ensures traffic percentage never exceeds 100% (with row-level locking for concurrency safety)';
