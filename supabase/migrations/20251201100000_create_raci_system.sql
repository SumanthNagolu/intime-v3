-- ============================================================================
-- Migration: RACI Ownership System
-- 
-- Implements: docs/specs/10-DATABASE/12-object-owners.md
-- 
-- This migration creates the RACI (Responsible, Accountable, Consulted, Informed)
-- ownership system for all business objects in InTime.
--
-- Tables created:
--   - object_owners: RACI assignments for entities
--   - raci_change_log: Audit trail for ownership changes
-- ============================================================================

-- ============================================================================
-- OBJECT OWNERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS object_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic Association (link to any entity)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Owner
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- RACI Role: 'responsible', 'accountable', 'consulted', 'informed'
  role TEXT NOT NULL CHECK (role IN ('responsible', 'accountable', 'consulted', 'informed')),

  -- Permission (derived from role, but can be overridden)
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('edit', 'view')),

  -- Is this the primary owner (Accountable)?
  is_primary BOOLEAN DEFAULT FALSE,

  -- Assignment metadata
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  assignment_type TEXT DEFAULT 'auto' CHECK (assignment_type IN ('auto', 'manual')),

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each user can only have one RACI role per entity
  UNIQUE(entity_type, entity_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_object_owners_org_id ON object_owners(org_id);
CREATE INDEX IF NOT EXISTS idx_object_owners_user_id ON object_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_object_owners_entity ON object_owners(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_object_owners_role ON object_owners(role);
CREATE INDEX IF NOT EXISTS idx_object_owners_permission ON object_owners(permission);
CREATE INDEX IF NOT EXISTS idx_object_owners_is_primary ON object_owners(is_primary) WHERE is_primary = TRUE;

-- Comment
COMMENT ON TABLE object_owners IS 'RACI ownership assignments for all business objects';

-- ============================================================================
-- RACI CHANGE LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS raci_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Reference to the assignment
  object_owner_id UUID REFERENCES object_owners(id) ON DELETE SET NULL,

  -- Entity reference (for when assignment is deleted)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Change type
  change_type TEXT NOT NULL CHECK (change_type IN ('assigned', 'role_changed', 'permission_changed', 'removed', 'transferred')),

  -- Before/After
  previous_role TEXT,
  new_role TEXT,
  previous_user_id UUID,
  new_user_id UUID,
  previous_permission TEXT,
  new_permission TEXT,

  -- Who made the change
  changed_by UUID REFERENCES user_profiles(id),
  reason TEXT,

  -- Timestamp
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_raci_change_log_entity ON raci_change_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_raci_change_log_changed_at ON raci_change_log(changed_at);

-- Comment
COMMENT ON TABLE raci_change_log IS 'Audit trail for RACI ownership changes';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated at trigger for object_owners
CREATE OR REPLACE FUNCTION object_owners_updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS object_owners_updated_at ON object_owners;
CREATE TRIGGER object_owners_updated_at
  BEFORE UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION object_owners_updated_at_trigger();

-- Enforce primary owner rules
CREATE OR REPLACE FUNCTION enforce_primary_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting isPrimary=true, ensure role=accountable
  IF NEW.is_primary = TRUE AND NEW.role != 'accountable' THEN
    RAISE EXCEPTION 'Only accountable role can be primary owner';
  END IF;

  -- If role=accountable, automatically set isPrimary=true and permission=edit
  IF NEW.role = 'accountable' THEN
    NEW.is_primary := TRUE;
    NEW.permission := 'edit';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS object_owners_enforce_primary ON object_owners;
CREATE TRIGGER object_owners_enforce_primary
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION enforce_primary_owner();

-- Validate single accountable per entity
CREATE OR REPLACE FUNCTION validate_single_accountable()
RETURNS TRIGGER AS $$
DECLARE
  accountable_count INTEGER;
BEGIN
  -- Only check if this is an accountable role
  IF NEW.role = 'accountable' THEN
    -- Count existing accountable owners for this entity (excluding self on update)
    SELECT COUNT(*) INTO accountable_count
    FROM object_owners
    WHERE entity_type = NEW.entity_type
      AND entity_id = NEW.entity_id
      AND role = 'accountable'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF accountable_count > 0 THEN
      RAISE EXCEPTION 'Entity already has an accountable owner. Use transferOwnership to change.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS object_owners_validate_accountable ON object_owners;
CREATE TRIGGER object_owners_validate_accountable
  BEFORE INSERT OR UPDATE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION validate_single_accountable();

-- Log RACI changes
CREATE OR REPLACE FUNCTION log_raci_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO raci_change_log (
      org_id, object_owner_id, entity_type, entity_id,
      change_type, new_role, new_user_id, new_permission, changed_by
    ) VALUES (
      NEW.org_id, NEW.id, NEW.entity_type, NEW.entity_id,
      'assigned', NEW.role, NEW.user_id, NEW.permission, NEW.assigned_by
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role != NEW.role OR OLD.permission != NEW.permission OR OLD.user_id != NEW.user_id THEN
      INSERT INTO raci_change_log (
        org_id, object_owner_id, entity_type, entity_id,
        change_type, previous_role, new_role, previous_user_id, new_user_id,
        previous_permission, new_permission, changed_by
      ) VALUES (
        NEW.org_id, NEW.id, NEW.entity_type, NEW.entity_id,
        CASE 
          WHEN OLD.user_id != NEW.user_id THEN 'transferred'
          WHEN OLD.role != NEW.role THEN 'role_changed'
          ELSE 'permission_changed'
        END,
        OLD.role, NEW.role, OLD.user_id, NEW.user_id,
        OLD.permission, NEW.permission, NEW.assigned_by
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO raci_change_log (
      org_id, entity_type, entity_id,
      change_type, previous_role, previous_user_id, previous_permission
    ) VALUES (
      OLD.org_id, OLD.entity_type, OLD.entity_id,
      'removed', OLD.role, OLD.user_id, OLD.permission
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS object_owners_log_change ON object_owners;
CREATE TRIGGER object_owners_log_change
  AFTER INSERT OR UPDATE OR DELETE ON object_owners
  FOR EACH ROW
  EXECUTE FUNCTION log_raci_change();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE object_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE raci_change_log ENABLE ROW LEVEL SECURITY;

-- Organization isolation for object_owners
DROP POLICY IF EXISTS object_owners_org_isolation ON object_owners;
CREATE POLICY object_owners_org_isolation ON object_owners
  FOR ALL
  USING (org_id = COALESCE(
    (current_setting('app.current_org_id', true))::uuid,
    (auth.jwt() ->> 'org_id')::uuid
  ));

-- Users can see their own assignments
DROP POLICY IF EXISTS object_owners_user_read ON object_owners;
CREATE POLICY object_owners_user_read ON object_owners
  FOR SELECT
  USING (
    org_id = COALESCE(
      (current_setting('app.current_org_id', true))::uuid,
      (auth.jwt() ->> 'org_id')::uuid
    )
    AND user_id = COALESCE(
      (current_setting('app.current_user_id', true))::uuid,
      (auth.jwt() ->> 'user_id')::uuid
    )
  );

-- Organization isolation for raci_change_log
DROP POLICY IF EXISTS raci_change_log_org_isolation ON raci_change_log;
CREATE POLICY raci_change_log_org_isolation ON raci_change_log
  FOR ALL
  USING (org_id = COALESCE(
    (current_setting('app.current_org_id', true))::uuid,
    (auth.jwt() ->> 'org_id')::uuid
  ));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get entity owner (accountable)
CREATE OR REPLACE FUNCTION get_entity_owner(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  role TEXT,
  permission TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oo.user_id,
    up.full_name,
    up.email,
    oo.role,
    oo.permission
  FROM object_owners oo
  JOIN user_profiles up ON up.id = oo.user_id
  WHERE oo.entity_type = p_entity_type
    AND oo.entity_id = p_entity_id
    AND oo.is_primary = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has edit access
CREATE OR REPLACE FUNCTION has_edit_access(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM object_owners
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND user_id = p_user_id
      AND permission = 'edit'
  ) INTO v_has_access;
  
  RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transfer ownership
CREATE OR REPLACE FUNCTION transfer_ownership(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_new_accountable_id UUID,
  p_keep_previous_as TEXT DEFAULT NULL,
  p_transferred_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_old_owner RECORD;
  v_org_id UUID;
  v_new_owner_id UUID;
BEGIN
  -- Get current accountable owner
  SELECT * INTO v_old_owner
  FROM object_owners
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND role = 'accountable';
    
  IF v_old_owner IS NULL THEN
    RAISE EXCEPTION 'No accountable owner found for this entity';
  END IF;
  
  v_org_id := v_old_owner.org_id;
  
  -- Update or remove old accountable
  IF p_keep_previous_as IS NOT NULL AND p_keep_previous_as IN ('responsible', 'consulted', 'informed') THEN
    UPDATE object_owners
    SET role = p_keep_previous_as,
        permission = CASE WHEN p_keep_previous_as = 'responsible' THEN 'edit' ELSE 'view' END,
        is_primary = FALSE,
        updated_at = NOW()
    WHERE id = v_old_owner.id;
  ELSE
    DELETE FROM object_owners WHERE id = v_old_owner.id;
  END IF;
  
  -- Insert new accountable
  INSERT INTO object_owners (
    org_id, entity_type, entity_id, user_id,
    role, permission, is_primary, assigned_by, assignment_type
  ) VALUES (
    v_org_id, p_entity_type, p_entity_id, p_new_accountable_id,
    'accountable', 'edit', TRUE, p_transferred_by, 'manual'
  )
  ON CONFLICT (entity_type, entity_id, user_id) 
  DO UPDATE SET
    role = 'accountable',
    permission = 'edit',
    is_primary = TRUE,
    assigned_by = p_transferred_by,
    updated_at = NOW()
  RETURNING id INTO v_new_owner_id;
  
  RETURN v_new_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DONE
-- ============================================================================

-- Grant permissions
GRANT ALL ON object_owners TO authenticated;
GRANT ALL ON raci_change_log TO authenticated;

