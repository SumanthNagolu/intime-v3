-- ============================================
-- EMAIL INTEGRATION SCHEMA
-- Phase 2: Communications (Weeks 5-8)
-- ============================================

-- Email account provider types
CREATE TYPE email_provider AS ENUM ('gmail', 'outlook', 'exchange', 'imap');

-- Email sync status
CREATE TYPE email_sync_status AS ENUM ('active', 'paused', 'error', 'disconnected');

-- Email direction
CREATE TYPE email_direction AS ENUM ('inbound', 'outbound');

-- Email link confidence
CREATE TYPE email_link_confidence AS ENUM ('high', 'medium', 'low', 'manual');

-- ============================================
-- EMAIL ACCOUNTS
-- Connected email accounts for each user
-- ============================================
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Provider info
  provider email_provider NOT NULL,
  email_address TEXT NOT NULL,
  display_name TEXT,

  -- OAuth tokens (encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Sync settings
  sync_status email_sync_status NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  sync_from_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',

  -- Preferences
  auto_link_enabled BOOLEAN NOT NULL DEFAULT true,
  signature TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(org_id, email_address)
);

-- ============================================
-- EMAIL THREADS
-- Conversation threads grouping messages
-- ============================================
CREATE TABLE email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Thread identification
  provider_thread_id TEXT NOT NULL, -- Gmail/Outlook thread ID
  subject TEXT NOT NULL,

  -- Participants (JSONB array of {email, name})
  participants JSONB NOT NULL DEFAULT '[]',

  -- Thread stats
  message_count INTEGER NOT NULL DEFAULT 0,
  unread_count INTEGER NOT NULL DEFAULT 0,
  has_attachments BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  first_message_at TIMESTAMPTZ NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL,

  -- Labels/folders
  labels JSONB NOT NULL DEFAULT '[]', -- Gmail labels or Outlook folders
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_spam BOOLEAN NOT NULL DEFAULT false,
  is_trash BOOLEAN NOT NULL DEFAULT false,

  -- AI-extracted summary
  ai_summary TEXT,
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
  ai_topics JSONB DEFAULT '[]',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(account_id, provider_thread_id)
);

-- ============================================
-- EMAIL MESSAGES
-- Individual email messages
-- ============================================
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Message identification
  provider_message_id TEXT NOT NULL, -- Gmail/Outlook message ID
  internet_message_id TEXT, -- RFC 2822 Message-ID

  -- Direction and status
  direction email_direction NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_draft BOOLEAN NOT NULL DEFAULT false,

  -- Sender/recipients
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses JSONB NOT NULL DEFAULT '[]', -- [{email, name}]
  cc_addresses JSONB DEFAULT '[]',
  bcc_addresses JSONB DEFAULT '[]',
  reply_to_address TEXT,

  -- Content
  subject TEXT NOT NULL,
  body_text TEXT, -- Plain text version
  body_html TEXT, -- HTML version
  snippet TEXT, -- Short preview

  -- Attachments (JSONB array of {id, name, size, mimeType, url})
  attachments JSONB DEFAULT '[]',
  has_attachments BOOLEAN NOT NULL DEFAULT false,

  -- References for threading
  in_reply_to TEXT, -- Message-ID of parent
  references_ids JSONB DEFAULT '[]', -- Array of Message-IDs

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ,

  -- Tracking (for sent emails)
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,

  -- AI analysis
  ai_intent TEXT, -- inquiry, follow_up, scheduling, etc.
  ai_action_items JSONB DEFAULT '[]', -- Extracted action items
  ai_entities_mentioned JSONB DEFAULT '[]', -- Detected entity references

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(account_id, provider_message_id)
);

-- ============================================
-- EMAIL ENTITY LINKS
-- Links between emails and InTime entities
-- ============================================
CREATE TABLE email_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Email reference (thread or message)
  thread_id UUID REFERENCES email_threads(id) ON DELETE CASCADE,
  message_id UUID REFERENCES email_messages(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL, -- job, candidate, account, contact, etc.
  entity_id UUID NOT NULL,

  -- Link metadata
  link_type TEXT NOT NULL DEFAULT 'related', -- primary, related, mentioned
  confidence email_link_confidence NOT NULL DEFAULT 'high',
  linked_by TEXT NOT NULL DEFAULT 'manual', -- manual, auto, ai

  -- For auto-links: why was this linked?
  link_reason TEXT, -- email_match, domain_match, name_match, etc.
  match_details JSONB, -- Details about the match

  -- Audit
  linked_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure either thread or message is linked
  CONSTRAINT email_link_target CHECK (
    (thread_id IS NOT NULL AND message_id IS NULL) OR
    (thread_id IS NULL AND message_id IS NOT NULL)
  ),

  -- Unique constraint per entity-email combination
  UNIQUE(thread_id, entity_type, entity_id),
  UNIQUE(message_id, entity_type, entity_id)
);

-- ============================================
-- EMAIL TEMPLATES
-- Reusable email templates
-- ============================================
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- outreach, follow_up, scheduling, rejection, etc.

  -- Template content
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  -- Variables (JSONB array of {name, description, defaultValue})
  variables JSONB DEFAULT '[]',

  -- Targeting
  entity_types JSONB DEFAULT '[]', -- Which entity types this applies to

  -- Stats
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Sharing
  is_shared BOOLEAN NOT NULL DEFAULT false, -- Shared with org
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- EMAIL SEQUENCES
-- Automated email sequences/cadences
-- ============================================
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Sequence info
  name TEXT NOT NULL,
  description TEXT,

  -- Steps (JSONB array of {order, delayDays, templateId, subject, body})
  steps JSONB NOT NULL DEFAULT '[]',

  -- Settings
  send_as_reply BOOLEAN NOT NULL DEFAULT true,
  skip_weekends BOOLEAN NOT NULL DEFAULT true,
  skip_holidays BOOLEAN NOT NULL DEFAULT false,
  stop_on_reply BOOLEAN NOT NULL DEFAULT true,
  stop_on_bounce BOOLEAN NOT NULL DEFAULT true,

  -- Stats
  active_enrollments INTEGER NOT NULL DEFAULT 0,
  total_enrollments INTEGER NOT NULL DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- SEQUENCE ENROLLMENTS
-- Entities enrolled in email sequences
-- ============================================
CREATE TABLE sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Enrolled entity
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  email_address TEXT NOT NULL, -- Specific email to send to

  -- Progress
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'stopped', 'bounced', 'replied')),

  -- Timing
  next_send_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,

  -- Stats
  emails_sent INTEGER NOT NULL DEFAULT 0,
  emails_opened INTEGER NOT NULL DEFAULT 0,
  emails_clicked INTEGER NOT NULL DEFAULT 0,

  -- Stop reason if stopped
  stop_reason TEXT,
  stopped_at TIMESTAMPTZ,

  -- Audit
  enrolled_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(sequence_id, entity_type, entity_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Email accounts
CREATE INDEX email_accounts_org_id_idx ON email_accounts(org_id) WHERE deleted_at IS NULL;
CREATE INDEX email_accounts_user_id_idx ON email_accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX email_accounts_sync_status_idx ON email_accounts(sync_status) WHERE deleted_at IS NULL;

-- Email threads
CREATE INDEX email_threads_org_id_idx ON email_threads(org_id);
CREATE INDEX email_threads_account_id_idx ON email_threads(account_id);
CREATE INDEX email_threads_last_message_at_idx ON email_threads(account_id, last_message_at DESC);
CREATE INDEX email_threads_unread_idx ON email_threads(account_id) WHERE unread_count > 0;
CREATE INDEX email_threads_starred_idx ON email_threads(account_id) WHERE is_starred = true;

-- Email messages
CREATE INDEX email_messages_org_id_idx ON email_messages(org_id);
CREATE INDEX email_messages_thread_id_idx ON email_messages(thread_id);
CREATE INDEX email_messages_account_id_idx ON email_messages(account_id);
CREATE INDEX email_messages_sent_at_idx ON email_messages(account_id, sent_at DESC);
CREATE INDEX email_messages_direction_idx ON email_messages(account_id, direction);
CREATE INDEX email_messages_from_address_idx ON email_messages(org_id, from_address);

-- Email entity links
CREATE INDEX email_entity_links_org_id_idx ON email_entity_links(org_id);
CREATE INDEX email_entity_links_thread_id_idx ON email_entity_links(thread_id);
CREATE INDEX email_entity_links_message_id_idx ON email_entity_links(message_id);
CREATE INDEX email_entity_links_entity_idx ON email_entity_links(entity_type, entity_id);

-- Email templates
CREATE INDEX email_templates_org_id_idx ON email_templates(org_id) WHERE deleted_at IS NULL;
CREATE INDEX email_templates_category_idx ON email_templates(org_id, category) WHERE deleted_at IS NULL;

-- Email sequences
CREATE INDEX email_sequences_org_id_idx ON email_sequences(org_id) WHERE deleted_at IS NULL;

-- Sequence enrollments
CREATE INDEX sequence_enrollments_org_id_idx ON sequence_enrollments(org_id);
CREATE INDEX sequence_enrollments_sequence_id_idx ON sequence_enrollments(sequence_id);
CREATE INDEX sequence_enrollments_entity_idx ON sequence_enrollments(entity_type, entity_id);
CREATE INDEX sequence_enrollments_next_send_idx ON sequence_enrollments(next_send_at)
  WHERE status = 'active' AND next_send_at IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_enrollments ENABLE ROW LEVEL SECURITY;

-- Email accounts policies (user can only see their own accounts)
CREATE POLICY "Users can view their own email accounts"
  ON email_accounts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own email accounts"
  ON email_accounts FOR ALL
  USING (auth.uid() = user_id);

-- Email threads policies
CREATE POLICY "Users can view threads from their accounts"
  ON email_threads FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM email_accounts
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Email messages policies
CREATE POLICY "Users can view messages from their accounts"
  ON email_messages FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM email_accounts
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Email entity links - org members can view
CREATE POLICY "Org members can view email entity links"
  ON email_entity_links FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Email templates - org members can view shared or own
CREATE POLICY "Org members can view email templates"
  ON email_templates FOR SELECT
  USING (
    deleted_at IS NULL AND (
      created_by = auth.uid() OR
      (is_shared = true AND org_id IN (
        SELECT org_id FROM organization_members WHERE user_id = auth.uid()
      ))
    )
  );

-- Email sequences - org members can view
CREATE POLICY "Org members can view email sequences"
  ON email_sequences FOR SELECT
  USING (
    deleted_at IS NULL AND
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Sequence enrollments - org members can view
CREATE POLICY "Org members can view sequence enrollments"
  ON sequence_enrollments FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update thread stats when messages change
CREATE OR REPLACE FUNCTION update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE email_threads
    SET
      message_count = (SELECT COUNT(*) FROM email_messages WHERE thread_id = NEW.thread_id),
      unread_count = (SELECT COUNT(*) FROM email_messages WHERE thread_id = NEW.thread_id AND is_read = false),
      has_attachments = EXISTS(SELECT 1 FROM email_messages WHERE thread_id = NEW.thread_id AND has_attachments = true),
      last_message_at = (SELECT MAX(sent_at) FROM email_messages WHERE thread_id = NEW.thread_id),
      updated_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE email_threads
    SET
      message_count = (SELECT COUNT(*) FROM email_messages WHERE thread_id = OLD.thread_id),
      unread_count = (SELECT COUNT(*) FROM email_messages WHERE thread_id = OLD.thread_id AND is_read = false),
      has_attachments = EXISTS(SELECT 1 FROM email_messages WHERE thread_id = OLD.thread_id AND has_attachments = true),
      last_message_at = (SELECT MAX(sent_at) FROM email_messages WHERE thread_id = OLD.thread_id),
      updated_at = NOW()
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON email_messages
FOR EACH ROW EXECUTE FUNCTION update_thread_stats();

-- Function to auto-link emails to entities based on email address
CREATE OR REPLACE FUNCTION auto_link_email_to_entities()
RETURNS TRIGGER AS $$
DECLARE
  v_contact RECORD;
  v_account RECORD;
BEGIN
  -- Skip if auto-linking is disabled for the account
  IF NOT EXISTS (
    SELECT 1 FROM email_accounts
    WHERE id = NEW.account_id AND auto_link_enabled = true
  ) THEN
    RETURN NEW;
  END IF;

  -- Link to contacts by email
  FOR v_contact IN
    SELECT id, 'contact' as type FROM contacts
    WHERE org_id = NEW.org_id
    AND (
      email = NEW.from_address OR
      email = ANY(SELECT jsonb_array_elements_text(NEW.to_addresses::jsonb->'email'))
    )
    AND deleted_at IS NULL
    LIMIT 5
  LOOP
    INSERT INTO email_entity_links (org_id, message_id, entity_type, entity_id, link_type, confidence, linked_by, link_reason)
    VALUES (NEW.org_id, NEW.id, v_contact.type, v_contact.id, 'related', 'high', 'auto', 'email_match')
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_link_email_trigger
AFTER INSERT ON email_messages
FOR EACH ROW EXECUTE FUNCTION auto_link_email_to_entities();
