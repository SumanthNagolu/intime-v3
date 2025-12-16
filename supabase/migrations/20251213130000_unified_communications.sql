-- ============================================
-- UNIFIED COMMUNICATIONS TABLE
-- Centralizes all outbound/inbound communications
-- Supports: Email, SMS, LinkedIn, Phone, WhatsApp
-- ============================================

-- 1. Create communications table (Unified Inbox)
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Channel & Direction
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'linkedin', 'phone', 'whatsapp', 'in_app')),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('outbound', 'inbound')),

  -- Threading (for email conversations)
  thread_id UUID REFERENCES communications(id),
  parent_id UUID REFERENCES communications(id),
  thread_position INTEGER DEFAULT 0,

  -- Sender/Recipient
  from_address TEXT, -- email, phone number, linkedin profile
  from_name TEXT,
  to_address TEXT NOT NULL,
  to_name TEXT,
  cc_addresses JSONB DEFAULT '[]',
  bcc_addresses JSONB DEFAULT '[]',

  -- Content
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  preview TEXT, -- First 200 chars for list view

  -- Attachments
  attachments JSONB DEFAULT '[]',
  -- Format: [{ "name": "file.pdf", "url": "...", "size": 1024, "type": "application/pdf" }]

  -- Entity Links (polymorphic)
  entity_type VARCHAR(50), -- contact, lead, deal, candidate, campaign_enrollment
  entity_id UUID,
  secondary_entity_type VARCHAR(50), -- campaign, job, account
  secondary_entity_id UUID,

  -- Contact Link (always try to link to a contact)
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Provider Info
  provider VARCHAR(50), -- resend, twilio, linkedin_api, manual
  provider_message_id TEXT, -- External ID from provider
  provider_thread_id TEXT, -- External thread ID

  -- Status & Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'queued', 'sending', 'sent', 'delivered',
    'opened', 'clicked', 'replied', 'bounced', 'failed',
    'spam', 'unsubscribed', 'received'
  )),

  -- Timestamps for tracking
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Engagement Metrics
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,

  -- Click Tracking Details
  clicked_links JSONB DEFAULT '[]',
  -- Format: [{ "url": "...", "clicked_at": "...", "count": 1 }]

  -- Error Handling
  error_code VARCHAR(50),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Campaign/Sequence Info
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  sequence_step_id UUID,
  ab_variant VARCHAR(50),

  -- Template Info
  template_id UUID,
  template_name TEXT,
  template_variables JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- User who sent/received
  created_by UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes for common queries
CREATE INDEX idx_communications_org ON communications(org_id, created_at DESC);
CREATE INDEX idx_communications_contact ON communications(contact_id, created_at DESC) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_communications_entity ON communications(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_communications_thread ON communications(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_communications_channel ON communications(org_id, channel, created_at DESC);
CREATE INDEX idx_communications_status ON communications(org_id, status, created_at DESC);
CREATE INDEX idx_communications_campaign ON communications(campaign_id, created_at DESC) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_communications_provider ON communications(provider_message_id) WHERE provider_message_id IS NOT NULL;

-- Partial index for pending/sending messages (for queue processing)
CREATE INDEX idx_communications_queue ON communications(scheduled_at)
  WHERE status IN ('pending', 'queued') AND scheduled_at IS NOT NULL;

-- 3. Create communication_events table (detailed event log)
CREATE TABLE IF NOT EXISTS communication_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE,

  -- Event Details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'created', 'queued', 'sending', 'sent', 'delivered',
    'opened', 'clicked', 'replied', 'bounced', 'failed',
    'spam', 'unsubscribed', 'retried'
  )),

  -- Event Data
  event_data JSONB DEFAULT '{}',
  -- For clicks: { "url": "...", "user_agent": "..." }
  -- For bounces: { "type": "hard|soft", "reason": "..." }

  -- Provider webhook data
  provider_event_id TEXT,
  raw_payload JSONB,

  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_communication_events_comm ON communication_events(communication_id, occurred_at DESC);
CREATE INDEX idx_communication_events_type ON communication_events(event_type, occurred_at DESC);

-- 4. Enable RLS
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY org_isolation_communications ON communications
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY comm_access_communication_events ON communication_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM communications c
      WHERE c.id = communication_id
      AND c.org_id = current_setting('app.org_id', true)::uuid
    )
  );

-- 5. Create helper function to find or create thread
CREATE OR REPLACE FUNCTION find_or_create_communication_thread(
  p_org_id UUID,
  p_contact_id UUID,
  p_subject TEXT,
  p_channel VARCHAR(50) DEFAULT 'email'
) RETURNS UUID AS $$
DECLARE
  v_thread_id UUID;
  v_clean_subject TEXT;
BEGIN
  -- Clean subject (remove Re:, Fwd:, etc.)
  v_clean_subject := regexp_replace(p_subject, '^(Re:|Fwd:|FW:|RE:)\s*', '', 'gi');
  v_clean_subject := trim(v_clean_subject);

  -- Find existing thread by subject and contact
  SELECT thread_id INTO v_thread_id
  FROM communications
  WHERE org_id = p_org_id
    AND contact_id = p_contact_id
    AND channel = p_channel
    AND (
      subject ILIKE v_clean_subject
      OR subject ILIKE 'Re: ' || v_clean_subject
      OR subject ILIKE 'Fwd: ' || v_clean_subject
    )
    AND created_at > now() - INTERVAL '30 days'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no thread found, return NULL (will be set to the new message's ID)
  RETURN v_thread_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to update communication stats
CREATE OR REPLACE FUNCTION update_communication_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update open count
  IF NEW.status = 'opened' AND (OLD.status IS NULL OR OLD.status != 'opened') THEN
    NEW.open_count := COALESCE(OLD.open_count, 0) + 1;
    IF NEW.opened_at IS NULL THEN
      NEW.opened_at := now();
    END IF;
  END IF;

  -- Update click count
  IF NEW.status = 'clicked' AND (OLD.status IS NULL OR OLD.status != 'clicked') THEN
    NEW.click_count := COALESCE(OLD.click_count, 0) + 1;
    IF NEW.clicked_at IS NULL THEN
      NEW.clicked_at := now();
    END IF;
  END IF;

  -- Update replied
  IF NEW.status = 'replied' AND (OLD.status IS NULL OR OLD.status != 'replied') THEN
    NEW.reply_count := COALESCE(OLD.reply_count, 0) + 1;
    IF NEW.replied_at IS NULL THEN
      NEW.replied_at := now();
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_communication_stats
  BEFORE UPDATE ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_communication_stats();

-- 7. Create view for unified inbox
CREATE OR REPLACE VIEW unified_inbox AS
SELECT
  c.*,
  ct.first_name as contact_first_name,
  ct.last_name as contact_last_name,
  ct.email as contact_email,
  ct.company_name as contact_company,
  CASE
    WHEN c.thread_id IS NOT NULL THEN (
      SELECT COUNT(*) FROM communications WHERE thread_id = c.thread_id
    )
    ELSE 1
  END as thread_count,
  CASE
    WHEN c.thread_id IS NOT NULL THEN (
      SELECT MAX(created_at) FROM communications WHERE thread_id = c.thread_id
    )
    ELSE c.created_at
  END as thread_updated_at
FROM communications c
LEFT JOIN contacts ct ON c.contact_id = ct.id;

-- 8. Grant permissions
GRANT SELECT, INSERT, UPDATE ON communications TO authenticated;
GRANT SELECT, INSERT ON communication_events TO authenticated;
GRANT SELECT ON unified_inbox TO authenticated;

COMMENT ON TABLE communications IS 'Unified communications table for email, SMS, LinkedIn, phone across all channels';
COMMENT ON TABLE communication_events IS 'Detailed event log for communication tracking (opens, clicks, bounces)';
COMMENT ON VIEW unified_inbox IS 'Unified inbox view with contact info and thread counts';
