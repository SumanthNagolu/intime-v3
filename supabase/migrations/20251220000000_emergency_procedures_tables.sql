-- =============================================================================
-- Emergency Procedures & Incident Response Tables
-- UC-ADMIN-011 Implementation
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. INCIDENTS TABLE
-- Main table for tracking P0-P3 incidents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identification
  incident_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Classification
  severity TEXT NOT NULL CHECK (severity IN ('P0', 'P1', 'P2', 'P3')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'investigating', 'identified', 'monitoring', 'resolved'
  )),

  -- Impact & Resolution
  impact TEXT,
  root_cause TEXT,
  resolution TEXT,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- People
  incident_commander UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE (org_id, incident_number)
);

-- Indexes for incidents
CREATE INDEX idx_incidents_org ON incidents(org_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_started ON incidents(started_at DESC);
CREATE INDEX idx_incidents_org_status ON incidents(org_id, status);
CREATE INDEX idx_incidents_org_created ON incidents(org_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. INCIDENT TIMELINE TABLE
-- Track all events during an incident
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'detection', 'notification', 'escalation', 'action', 'update', 'resolution'
  )),
  description TEXT NOT NULL,

  -- Actor
  performed_by UUID REFERENCES user_profiles(id),

  -- Additional data
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for incident_timeline
CREATE INDEX idx_incident_timeline_org ON incident_timeline(org_id);
CREATE INDEX idx_incident_timeline_incident ON incident_timeline(incident_id);
CREATE INDEX idx_incident_timeline_created ON incident_timeline(created_at DESC);

-- -----------------------------------------------------------------------------
-- 3. INCIDENT NOTIFICATIONS TABLE
-- Track notifications sent during incidents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'email', 'sms', 'slack', 'status_page', 'in_app'
  )),
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,

  -- Delivery tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'failed'
  )),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,

  -- Actor
  sent_by UUID REFERENCES user_profiles(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for incident_notifications
CREATE INDEX idx_incident_notifications_org ON incident_notifications(org_id);
CREATE INDEX idx_incident_notifications_incident ON incident_notifications(incident_id);
CREATE INDEX idx_incident_notifications_status ON incident_notifications(status);

-- -----------------------------------------------------------------------------
-- 4. BREAK GLASS ACCESS TABLE
-- Log emergency access attempts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS break_glass_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Access details
  user_id UUID REFERENCES user_profiles(id),
  accessed_by TEXT NOT NULL, -- Email if user record doesn't exist
  reason TEXT NOT NULL,

  -- Related incident (optional)
  incident_id UUID REFERENCES incidents(id),

  -- Authorization
  authorized_by TEXT NOT NULL, -- Two-person authorization name/email

  -- Actions tracking
  actions_taken TEXT[] DEFAULT '{}',

  -- Timing
  accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for break_glass_access
CREATE INDEX idx_break_glass_org ON break_glass_access(org_id);
CREATE INDEX idx_break_glass_accessed ON break_glass_access(accessed_at DESC);
CREATE INDEX idx_break_glass_user ON break_glass_access(user_id);

-- -----------------------------------------------------------------------------
-- 5. EMERGENCY DRILLS TABLE
-- Track scheduled and completed emergency drills
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Drill details
  drill_type TEXT NOT NULL CHECK (drill_type IN (
    'tabletop', 'simulated_outage', 'security_breach', 'backup_restore'
  )),
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,

  -- Participants (array of user IDs)
  participants UUID[] DEFAULT '{}',

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Results
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled'
  )),
  findings TEXT,
  action_items JSONB DEFAULT '[]',

  -- People
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for emergency_drills
CREATE INDEX idx_emergency_drills_org ON emergency_drills(org_id);
CREATE INDEX idx_emergency_drills_status ON emergency_drills(status);
CREATE INDEX idx_emergency_drills_scheduled ON emergency_drills(scheduled_at);
CREATE INDEX idx_emergency_drills_type ON emergency_drills(drill_type);

-- -----------------------------------------------------------------------------
-- 6. INCIDENT NUMBER GENERATION FUNCTION
-- Format: INC-YYYY-NNNNN (per-org, per-year sequence)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_prefix TEXT := 'INC';
  v_seq INT;
  v_number TEXT;
BEGIN
  -- Get current year
  v_year := TO_CHAR(COALESCE(NEW.started_at, NOW()), 'YYYY');

  -- Get max sequence for this org + year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(incident_number FROM v_prefix || '-' || v_year || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO v_seq
  FROM incidents
  WHERE org_id = NEW.org_id
    AND incident_number LIKE v_prefix || '-' || v_year || '-%';

  -- Generate formatted number
  v_number := v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');

  NEW.incident_number := v_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incident number generation
CREATE TRIGGER trigger_generate_incident_number
  BEFORE INSERT ON incidents
  FOR EACH ROW
  WHEN (NEW.incident_number IS NULL OR NEW.incident_number = '')
  EXECUTE FUNCTION generate_incident_number();

-- -----------------------------------------------------------------------------
-- 7. UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------
CREATE TRIGGER trigger_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_emergency_drills_updated_at
  BEFORE UPDATE ON emergency_drills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

-- Incidents RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY incidents_org_isolation ON incidents
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Incident Timeline RLS
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY incident_timeline_org_isolation ON incident_timeline
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Incident Notifications RLS
ALTER TABLE incident_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY incident_notifications_org_isolation ON incident_notifications
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Break Glass Access RLS
ALTER TABLE break_glass_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY break_glass_access_org_isolation ON break_glass_access
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Emergency Drills RLS
ALTER TABLE emergency_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY emergency_drills_org_isolation ON emergency_drills
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 9. EXPAND PERMISSIONS CONSTRAINT
-- Add new action types needed for emergency procedures
-- -----------------------------------------------------------------------------
ALTER TABLE permissions
  DROP CONSTRAINT IF EXISTS permissions_valid_action;

ALTER TABLE permissions
  ADD CONSTRAINT permissions_valid_action CHECK (
    action IN (
      'create', 'read', 'update', 'delete',  -- CRUD operations
      'approve', 'reject',                    -- Workflow actions
      'export', 'import',                     -- Data transfer
      'manage',                               -- Full control
      'assign',                               -- Role assignment
      'send',                                 -- Sending actions
      'issue',                                -- Certificate issuance
      'view',                                 -- View-only access
      'use',                                  -- Use privilege (break-glass)
      'access'                                -- General access permission
    )
  );

-- -----------------------------------------------------------------------------
-- 10. PERMISSIONS
-- -----------------------------------------------------------------------------
INSERT INTO permissions (code, name, description, object_type, action) VALUES
  ('admin.emergency', 'Emergency Procedures Access', 'Access to emergency procedures and incident response', 'admin', 'access'),
  ('incidents.view', 'View Incidents', 'View incident reports', 'incidents', 'view'),
  ('incidents.create', 'Create Incidents', 'Create new incident reports', 'incidents', 'create'),
  ('incidents.update', 'Update Incidents', 'Update incident reports', 'incidents', 'update'),
  ('incidents.manage', 'Manage Incidents', 'Full incident management including commander assignment', 'incidents', 'manage'),
  ('drills.view', 'View Drills', 'View emergency drills', 'drills', 'view'),
  ('drills.create', 'Create Drills', 'Schedule emergency drills', 'drills', 'create'),
  ('drills.manage', 'Manage Drills', 'Full drill management', 'drills', 'manage'),
  ('breakglass.use', 'Break Glass Access', 'Use break-glass emergency access', 'breakglass', 'use'),
  ('breakglass.view', 'View Break Glass Logs', 'View break-glass access logs', 'breakglass', 'view')
ON CONFLICT (code) DO NOTHING;

-- Assign emergency permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted_by)
SELECT
  r.id,
  p.id,
  'org',
  (SELECT id FROM user_profiles LIMIT 1)
FROM system_roles r
CROSS JOIN permissions p
WHERE r.code = 'admin'
  AND p.code IN (
    'admin.emergency',
    'incidents.view', 'incidents.create', 'incidents.update', 'incidents.manage',
    'drills.view', 'drills.create', 'drills.manage',
    'breakglass.use', 'breakglass.view'
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 11. GRANT SERVICE ROLE ACCESS
-- -----------------------------------------------------------------------------
GRANT ALL ON incidents TO service_role;
GRANT ALL ON incident_timeline TO service_role;
GRANT ALL ON incident_notifications TO service_role;
GRANT ALL ON break_glass_access TO service_role;
GRANT ALL ON emergency_drills TO service_role;

-- -----------------------------------------------------------------------------
-- 12. COMMENTS
-- -----------------------------------------------------------------------------
COMMENT ON TABLE incidents IS 'P0-P3 incident tracking for emergency response';
COMMENT ON TABLE incident_timeline IS 'Timeline of events during incidents';
COMMENT ON TABLE incident_notifications IS 'Notifications sent during incidents';
COMMENT ON TABLE break_glass_access IS 'Emergency break-glass access logging';
COMMENT ON TABLE emergency_drills IS 'Scheduled emergency drill tracking';
