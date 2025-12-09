-- ============================================================================
-- Migration: Sequence Templates for Reusable Campaign Sequences
-- Description: Creates sequence_templates table and updates campaigns to reference them
-- ============================================================================

-- ============================================================================
-- 1. Create sequence_templates table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sequence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'phone', 'sms')),
  steps JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT sequence_templates_name_length CHECK (char_length(name) <= 255)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sequence_templates_org_id ON sequence_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_sequence_templates_channel ON sequence_templates(channel);
CREATE INDEX IF NOT EXISTS idx_sequence_templates_is_active ON sequence_templates(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sequence_templates_created_by ON sequence_templates(created_by);

-- Add comments
COMMENT ON TABLE sequence_templates IS 'Reusable sequence templates for campaign outreach';
COMMENT ON COLUMN sequence_templates.channel IS 'Outreach channel: email, linkedin, phone, sms';
COMMENT ON COLUMN sequence_templates.steps IS 'Array of sequence steps with day, action, subject, body';
COMMENT ON COLUMN sequence_templates.settings IS 'Sequence settings like stopOnReply, sendTime, dailyLimit';
COMMENT ON COLUMN sequence_templates.usage_count IS 'Number of campaigns using this template';

-- ============================================================================
-- 2. Add sequence_template_ids to campaigns table
-- ============================================================================

-- Add column for referencing sequence templates (array of UUIDs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'sequence_template_ids'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN sequence_template_ids UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Create index on sequence_template_ids for efficient lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_sequence_template_ids ON campaigns USING GIN (sequence_template_ids);

COMMENT ON COLUMN campaigns.sequence_template_ids IS 'Array of sequence template IDs used by this campaign';

-- ============================================================================
-- 3. Create junction table for campaign-sequence relationship (optional, for tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sequence_template_id UUID NOT NULL REFERENCES sequence_templates(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  enrolled_count INT DEFAULT 0,
  completed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint to prevent duplicate assignments
  CONSTRAINT campaign_sequences_unique UNIQUE (campaign_id, sequence_template_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_sequences_campaign_id ON campaign_sequences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequences_sequence_template_id ON campaign_sequences(sequence_template_id);

COMMENT ON TABLE campaign_sequences IS 'Junction table tracking which sequences are used in which campaigns';

-- ============================================================================
-- 4. Enable RLS on new tables
-- ============================================================================

ALTER TABLE sequence_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sequences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sequence_templates
CREATE POLICY "sequence_templates_select_org" ON sequence_templates
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "sequence_templates_insert_org" ON sequence_templates
  FOR INSERT WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "sequence_templates_update_org" ON sequence_templates
  FOR UPDATE USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "sequence_templates_delete_org" ON sequence_templates
  FOR DELETE USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- RLS Policies for campaign_sequences
CREATE POLICY "campaign_sequences_select_org" ON campaign_sequences
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "campaign_sequences_insert_org" ON campaign_sequences
  FOR INSERT WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "campaign_sequences_update_org" ON campaign_sequences
  FOR UPDATE USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "campaign_sequences_delete_org" ON campaign_sequences
  FOR DELETE USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- ============================================================================
-- 5. Function to increment usage count when campaign uses a template
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_sequence_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment usage count for newly added templates
  IF TG_OP = 'INSERT' THEN
    UPDATE sequence_templates 
    SET usage_count = usage_count + 1, updated_at = now()
    WHERE id = NEW.sequence_template_id;
  END IF;
  
  -- Decrement usage count when removed
  IF TG_OP = 'DELETE' THEN
    UPDATE sequence_templates 
    SET usage_count = GREATEST(0, usage_count - 1), updated_at = now()
    WHERE id = OLD.sequence_template_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sequence_template_usage ON campaign_sequences;
CREATE TRIGGER trigger_sequence_template_usage
  AFTER INSERT OR DELETE ON campaign_sequences
  FOR EACH ROW
  EXECUTE FUNCTION increment_sequence_template_usage();

-- ============================================================================
-- 6. Seed some default sequence templates (optional)
-- ============================================================================

-- This will be done via application code or a separate seed file
-- to ensure proper org_id assignment

-- ============================================================================
-- 7. Update timestamp trigger for sequence_templates
-- ============================================================================

CREATE OR REPLACE FUNCTION update_sequence_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sequence_templates_updated_at ON sequence_templates;
CREATE TRIGGER trigger_sequence_templates_updated_at
  BEFORE UPDATE ON sequence_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_sequence_templates_updated_at();

