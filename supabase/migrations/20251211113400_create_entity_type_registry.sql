-- ============================================
-- ENTITIES-01: Entity Type Registry
-- Central registry for all valid entity types for polymorphic tables
-- ============================================

-- Central registry for all valid entity types
CREATE TABLE IF NOT EXISTS entity_type_registry (
  entity_type VARCHAR(50) PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  id_column VARCHAR(50) DEFAULT 'id',
  display_name_column VARCHAR(50) DEFAULT 'name',
  display_name VARCHAR(100) NOT NULL,
  url_pattern VARCHAR(200),  -- e.g., '/employee/recruiting/jobs/{id}'
  icon_name VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with canonical entity types from Master Guide
INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern) VALUES
-- Core
('organization', 'organizations', 'name', 'Organization', NULL),
('user', 'user_profiles', 'full_name', 'User', NULL),

-- CRM
('company', 'companies', 'name', 'Company', '/employee/contacts/{id}'),
('contact', 'contacts', 'first_name', 'Contact', '/employee/contacts/{id}'),
('campaign', 'campaigns', 'name', 'Campaign', '/employee/crm/campaigns/{id}'),
('deal', 'deals', 'name', 'Deal', '/employee/crm/deals/{id}'),

-- ATS
('job', 'jobs', 'title', 'Job', '/employee/recruiting/jobs/{id}'),
('submission', 'submissions', 'id', 'Submission', '/employee/recruiting/submissions/{id}'),
('interview', 'interviews', 'id', 'Interview', '/employee/recruiting/interviews/{id}'),
('offer', 'offers', 'id', 'Offer', '/employee/recruiting/offers/{id}'),

-- Placements
('placement', 'placements', 'id', 'Placement', '/employee/recruiting/placements/{id}'),
('timesheet', 'timesheets', 'id', 'Timesheet', NULL),
('onboarding', 'onboarding_checklists', 'checklist_number', 'Onboarding', NULL),

-- Finance
('invoice', 'invoices', 'invoice_number', 'Invoice', NULL),
('rate_card', 'rate_cards', 'name', 'Rate Card', NULL),
('contract', 'contracts', 'contract_name', 'Contract', NULL),

-- Supporting
('skill', 'skills', 'name', 'Skill', NULL),
('document', 'documents', 'file_name', 'Document', NULL),
('note', 'notes', 'id', 'Note', NULL),
('activity', 'activities', 'subject', 'Activity', NULL),
('address', 'addresses', 'id', 'Address', NULL)
ON CONFLICT (entity_type) DO NOTHING;

-- Entity resolution function
-- Returns JSON object with entity display info
CREATE OR REPLACE FUNCTION resolve_entity(p_entity_type VARCHAR, p_entity_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_registry RECORD;
  v_result JSONB;
  v_query TEXT;
BEGIN
  -- Get registry info
  SELECT * INTO v_registry
  FROM entity_type_registry
  WHERE entity_type = p_entity_type AND is_active = true;

  IF v_registry IS NULL THEN
    RETURN jsonb_build_object('error', 'Unknown entity type: ' || p_entity_type);
  END IF;

  -- Build dynamic query
  v_query := format(
    'SELECT jsonb_build_object(
      ''id'', id,
      ''type'', %L,
      ''typeName'', %L,
      ''name'', COALESCE(%I::text, id::text),
      ''url'', %L
    ) FROM %I WHERE id = %L',
    p_entity_type,
    v_registry.display_name,
    v_registry.display_name_column,
    REPLACE(COALESCE(v_registry.url_pattern, ''), '{id}', p_entity_id::text),
    v_registry.table_name,
    p_entity_id
  );

  BEGIN
    EXECUTE v_query INTO v_result;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
  END;

  RETURN COALESCE(v_result, jsonb_build_object('error', 'Entity not found'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validation function for polymorphic tables
-- Use as trigger to validate entity_type values
CREATE OR REPLACE FUNCTION validate_entity_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM entity_type_registry
    WHERE entity_type = NEW.entity_type AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid entity_type: %. Must be registered in entity_type_registry', NEW.entity_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_entity_registry_active
ON entity_type_registry(entity_type) WHERE is_active = true;

-- Comments
COMMENT ON TABLE entity_type_registry IS 'Central registry of all valid entity types for polymorphic tables (ENTITIES-01)';
COMMENT ON FUNCTION resolve_entity IS 'Resolves entity_type + entity_id to display info (name, URL). Used for rendering polymorphic references.';
COMMENT ON FUNCTION validate_entity_type IS 'Trigger function to validate entity_type against registry. Add as BEFORE INSERT OR UPDATE trigger on polymorphic tables.';
