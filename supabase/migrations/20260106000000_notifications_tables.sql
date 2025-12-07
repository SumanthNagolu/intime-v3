-- =============================================================================
-- NOTIFICATIONS TABLES
-- =============================================================================
-- Created: 2025-12-06
-- Description: Tables for notifications, preferences, and templates

-- =============================================================================
-- 1. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Notification content
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Link/action
  action_url TEXT,
  action_label TEXT,

  -- Entity reference
  entity_type TEXT,
  entity_id UUID,

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(org_id);

-- =============================================================================
-- 2. NOTIFICATION PREFERENCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  category TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'push', 'sms')),
  enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, category, channel)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- =============================================================================
-- 3. NOTIFICATION TEMPLATES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),

  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  subject TEXT NOT NULL,
  body TEXT NOT NULL,

  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint per org (allow same code for different orgs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_templates_org_code ON notification_templates(COALESCE(org_id, '00000000-0000-0000-0000-000000000000'::uuid), code);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);

-- =============================================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- =============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Notification Preferences: Users manage own preferences
CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- Notification Templates: Read access for org members, write access for admins
CREATE POLICY "Users can view org templates"
  ON notification_templates FOR SELECT
  USING (org_id IS NULL OR org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- =============================================================================
-- 5. DEFAULT NOTIFICATION TEMPLATES
-- =============================================================================
INSERT INTO notification_templates (code, name, description, category, subject, body, variables) VALUES
  ('welcome', 'Welcome Email', 'Sent when a new user joins', 'system', 'Welcome to InTime!', 'Hi {{name}}, welcome to InTime! Your account has been created successfully.', ARRAY['name', 'email']),
  ('password_reset', 'Password Reset', 'Sent when password reset is requested', 'security', 'Password Reset Request', 'Hi {{name}}, click the link to reset your password: {{link}}', ARRAY['name', 'link']),
  ('workflow_approval', 'Workflow Approval', 'Sent when approval is needed', 'workflow', 'Approval Required: {{workflow_name}}', 'A workflow requires your approval: {{workflow_name}}. Please review and approve.', ARRAY['workflow_name', 'requester', 'link']),
  ('task_assigned', 'Task Assigned', 'Sent when a task is assigned', 'activity', 'New Task Assigned: {{task_name}}', 'You have been assigned a new task: {{task_name}}', ARRAY['task_name', 'assignee', 'due_date']),
  ('reminder', 'Reminder', 'Generic reminder notification', 'reminder', 'Reminder: {{title}}', '{{body}}', ARRAY['title', 'body']),
  ('system_alert', 'System Alert', 'System-wide alerts', 'system', 'System Alert: {{title}}', '{{message}}', ARRAY['title', 'message', 'severity'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 6. TRIGGER FOR UPDATED_AT
-- =============================================================================
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

CREATE OR REPLACE TRIGGER trigger_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();
