-- ============================================
-- EMAIL TEMPLATES MODULE
-- ============================================
-- This migration creates or updates tables for email template management:
-- - email_templates: Template definitions with content and metadata
-- - email_sends: Tracking table for sent emails
-- - email_senders: Verified sender addresses

-- ============================================
-- 1. Email Templates Table - ALTER EXISTING OR CREATE
-- ============================================

-- Drop existing category constraint to allow new values
ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS valid_category;

-- First, update existing category values to match new schema
UPDATE email_templates SET category = 'user' WHERE category = 'notification';
UPDATE email_templates SET category = 'system' WHERE category = 'transactional';

-- Add missing columns to existing table (safe operations with IF NOT EXISTS equivalents)
DO $$
BEGIN
  -- Add slug column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'slug') THEN
    ALTER TABLE email_templates ADD COLUMN slug TEXT;
    -- Generate slugs from name for existing records
    UPDATE email_templates SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::TEXT, 1, 8) WHERE slug IS NULL;
    ALTER TABLE email_templates ALTER COLUMN slug SET NOT NULL;
  END IF;

  -- Add preview_text column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'preview_text') THEN
    ALTER TABLE email_templates ADD COLUMN preview_text TEXT;
  END IF;

  -- Add from_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'from_name') THEN
    ALTER TABLE email_templates ADD COLUMN from_name TEXT NOT NULL DEFAULT '{{company_name}}';
  END IF;

  -- Add from_email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'from_email') THEN
    ALTER TABLE email_templates ADD COLUMN from_email TEXT NOT NULL DEFAULT 'noreply@{{company_domain}}';
  END IF;

  -- Add reply_to column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'reply_to') THEN
    ALTER TABLE email_templates ADD COLUMN reply_to TEXT;
  END IF;

  -- Add variables_used column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'variables_used') THEN
    ALTER TABLE email_templates ADD COLUMN variables_used TEXT[] DEFAULT '{}';
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'notes') THEN
    ALTER TABLE email_templates ADD COLUMN notes TEXT;
  END IF;

  -- Add status column if it doesn't exist (migrate from is_active)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'status') THEN
    ALTER TABLE email_templates ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
    -- Migrate is_active to status
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'is_active') THEN
      UPDATE email_templates SET status = CASE WHEN is_active = true THEN 'active' ELSE 'draft' END;
    END IF;
  END IF;

  -- Add version column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'version') THEN
    ALTER TABLE email_templates ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
  END IF;

  -- Add updated_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'updated_by') THEN
    ALTER TABLE email_templates ADD COLUMN updated_by UUID REFERENCES user_profiles(id);
  END IF;

  -- Add archived_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'archived_at') THEN
    ALTER TABLE email_templates ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;

  -- Add check constraint for status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_templates_status_check') THEN
    ALTER TABLE email_templates ADD CONSTRAINT email_templates_status_check
      CHECK (status IN ('draft', 'active', 'disabled', 'archived'));
  END IF;

  -- Add check constraint for category if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_templates_category_check') THEN
    BEGIN
      ALTER TABLE email_templates ADD CONSTRAINT email_templates_category_check
        CHECK (category IN ('user', 'candidate', 'client', 'internal', 'system', 'marketing'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Add comments (safe to run multiple times)
COMMENT ON TABLE email_templates IS 'Email templates for notifications and communications';
COMMENT ON COLUMN email_templates.category IS 'Template category: user, candidate, client, internal, system, marketing';
COMMENT ON COLUMN email_templates.variables_used IS 'Array of variable names used in the template';
COMMENT ON COLUMN email_templates.status IS 'Template status: draft, active, disabled, archived';

-- ============================================
-- 2. Email Sends Table (Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,

  -- Recipient
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,

  -- Content (snapshot at send time)
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,

  -- Delivery Status
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'spam'
  )),

  -- Tracking
  resend_id TEXT,
  variables_data JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  error_message TEXT,

  -- Context
  entity_type TEXT,
  entity_id UUID,
  triggered_by TEXT CHECK (triggered_by IN ('workflow', 'manual', 'system', 'test')),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

COMMENT ON TABLE email_sends IS 'Log of all emails sent through the system';
COMMENT ON COLUMN email_sends.triggered_by IS 'What triggered this email: workflow, manual, system, test';

-- ============================================
-- 3. Email Senders Table (Verified Addresses)
-- ============================================
CREATE TABLE IF NOT EXISTS email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Sender Info
  email TEXT NOT NULL,
  name TEXT NOT NULL,

  -- Status
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  UNIQUE(org_id, email)
);

COMMENT ON TABLE email_senders IS 'Verified sender email addresses for an organization';

-- ============================================
-- INDEXES (CREATE IF NOT EXISTS equivalent)
-- ============================================
DO $$
BEGIN
  -- email_templates indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_templates_org_category') THEN
    CREATE INDEX idx_email_templates_org_category ON email_templates(org_id, category) WHERE deleted_at IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_templates_org_status') THEN
    CREATE INDEX idx_email_templates_org_status ON email_templates(org_id, status) WHERE deleted_at IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_templates_org_slug') THEN
    CREATE INDEX idx_email_templates_org_slug ON email_templates(org_id, slug) WHERE deleted_at IS NULL;
  END IF;

  -- email_sends indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_sends_org') THEN
    CREATE INDEX idx_email_sends_org ON email_sends(org_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_sends_template') THEN
    CREATE INDEX idx_email_sends_template ON email_sends(template_id, status);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_sends_recipient') THEN
    CREATE INDEX idx_email_sends_recipient ON email_sends(recipient_email, created_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_sends_status') THEN
    CREATE INDEX idx_email_sends_status ON email_sends(org_id, status, created_at);
  END IF;

  -- email_senders indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_email_senders_org') THEN
    CREATE INDEX idx_email_senders_org ON email_senders(org_id) WHERE deleted_at IS NULL;
  END IF;
END $$;

-- ============================================
-- UNIQUE CONSTRAINT (if not exists)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_templates_org_id_slug_version_key') THEN
    ALTER TABLE email_templates ADD CONSTRAINT email_templates_org_id_slug_version_key UNIQUE(org_id, slug, version);
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_senders ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS email_templates_org_isolation ON email_templates;
CREATE POLICY email_templates_org_isolation ON email_templates
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS email_sends_org_isolation ON email_sends;
CREATE POLICY email_sends_org_isolation ON email_sends
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS email_senders_org_isolation ON email_senders;
CREATE POLICY email_senders_org_isolation ON email_senders
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS trigger_email_templates_updated_at ON email_templates;
CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_email_senders_updated_at ON email_senders;
CREATE TRIGGER trigger_email_senders_updated_at
  BEFORE UPDATE ON email_senders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PERMISSIONS (using valid actions from constraint)
-- ============================================
INSERT INTO permissions (code, name, description, object_type, action) VALUES
  ('email_templates.create', 'Create Email Templates', 'Can create new email templates', 'email_templates', 'create'),
  ('email_templates.read', 'View Email Templates', 'Can view email templates', 'email_templates', 'read'),
  ('email_templates.update', 'Edit Email Templates', 'Can edit email templates', 'email_templates', 'update'),
  ('email_templates.delete', 'Delete Email Templates', 'Can delete email templates', 'email_templates', 'delete'),
  ('email_templates.manage', 'Manage Email Templates', 'Can activate, deactivate, and send test emails', 'email_templates', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Assign to System Administrator role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM system_roles r
CROSS JOIN permissions p
WHERE r.name = 'System Administrator'
  AND p.object_type = 'email_templates'
ON CONFLICT DO NOTHING;
