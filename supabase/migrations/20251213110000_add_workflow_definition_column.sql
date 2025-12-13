-- ============================================
-- WAVE 6: ADD WORKFLOW DEFINITION COLUMN
-- Issue: WORKFLOWS-01 Phase 1
-- Purpose: Add definition column for workflow-engine-v2.ts
-- ============================================

-- Add definition column to workflows table
-- This column stores the workflow configuration including triggers, actions, and conditions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'definition'
  ) THEN
    ALTER TABLE workflows ADD COLUMN definition JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add index for JSON path queries on definition
CREATE INDEX IF NOT EXISTS idx_workflows_definition_triggers
  ON workflows USING gin ((definition->'triggers'));

CREATE INDEX IF NOT EXISTS idx_workflows_definition_actions
  ON workflows USING gin ((definition->'actions'));

-- Add comments for documentation
COMMENT ON COLUMN workflows.definition IS 'JSON workflow definition containing triggers, actions, conditions, and states configuration';

-- Example structure for definition column:
-- {
--   "triggers": [
--     { "type": "status_change", "from": "draft", "to": "active" },
--     { "type": "created" },
--     { "type": "field_change", "field": "priority" }
--   ],
--   "actions": [
--     { "type": "send_email", "config": { "templateSlug": "welcome", "to": "{{contact.email}}" } },
--     { "type": "create_task", "config": { "title": "Review submission", "assigneeId": "{{owner_id}}" } }
--   ],
--   "conditions": [
--     { "field": "priority", "operator": "eq", "value": "high" }
--   ],
--   "states": [
--     { "id": "initial", "actions": [...] },
--     { "id": "review", "actions": [...] }
--   ]
-- }
