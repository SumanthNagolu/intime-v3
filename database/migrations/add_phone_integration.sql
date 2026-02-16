-- ============================================
-- PHONE INTEGRATION SCHEMA
-- Phase 3: Desktop & Phone
-- ============================================

-- Call direction
CREATE TYPE call_direction AS ENUM ('inbound', 'outbound');

-- Call status
CREATE TYPE call_status AS ENUM ('initiated', 'ringing', 'connected', 'completed', 'missed', 'voicemail', 'failed', 'cancelled');

-- Call outcome for logging
CREATE TYPE call_outcome AS ENUM (
  'connected',
  'left_voicemail',
  'no_answer',
  'busy',
  'wrong_number',
  'disconnected',
  'call_back_requested',
  'not_interested',
  'interested',
  'scheduled_meeting',
  'other'
);

-- ============================================
-- PHONE ACCOUNTS
-- Connected phone/VoIP accounts
-- ============================================
CREATE TABLE phone_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT NOT NULL, -- twilio, ringcentral, vonage, zoom_phone, etc.
  account_sid TEXT,
  phone_number TEXT NOT NULL, -- The user's phone number
  display_name TEXT,

  -- Authentication
  auth_token TEXT, -- Encrypted
  api_key TEXT, -- Encrypted

  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  record_calls BOOLEAN NOT NULL DEFAULT false,
  voicemail_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(org_id, phone_number)
);

-- ============================================
-- CALL LOGS
-- All phone calls made/received
-- ============================================
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  phone_account_id UUID REFERENCES phone_accounts(id),

  -- Call identification
  provider_call_id TEXT, -- Provider's unique call ID
  direction call_direction NOT NULL,
  status call_status NOT NULL DEFAULT 'initiated',

  -- Phone numbers
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,

  -- Timing
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Call outcome (logged by user)
  outcome call_outcome,
  outcome_notes TEXT,

  -- Recording
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  transcription TEXT,
  transcription_summary TEXT,

  -- AI analysis
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
  ai_topics JSONB DEFAULT '[]',
  ai_action_items JSONB DEFAULT '[]',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CALL ENTITY LINKS
-- Links between calls and InTime entities
-- ============================================
CREATE TABLE call_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL, -- candidate, contact, account, job, submission
  entity_id UUID NOT NULL,

  -- Link metadata
  link_type TEXT NOT NULL DEFAULT 'related', -- primary, related
  linked_by TEXT NOT NULL DEFAULT 'manual', -- manual, auto, ai

  -- Audit
  linked_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(call_id, entity_type, entity_id)
);

-- ============================================
-- CONTACT PHONE NUMBERS
-- Structured phone numbers for contacts
-- ============================================
CREATE TABLE contact_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Phone details
  phone_number TEXT NOT NULL,
  phone_type TEXT NOT NULL DEFAULT 'mobile', -- mobile, work, home, fax, other
  country_code TEXT,
  extension TEXT,

  -- Flags
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_sms_capable BOOLEAN DEFAULT true,
  do_not_call BOOLEAN NOT NULL DEFAULT false,

  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- SMS MESSAGES
-- SMS/Text messages sent and received
-- ============================================
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  phone_account_id UUID REFERENCES phone_accounts(id),

  -- Message identification
  provider_message_id TEXT,
  direction call_direction NOT NULL,

  -- Phone numbers
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,

  -- Content
  body TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]', -- MMS media

  -- Status
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN (
    'queued', 'sending', 'sent', 'delivered', 'failed', 'received'
  )),
  error_message TEXT,

  -- Timing
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SMS ENTITY LINKS
-- Links between SMS and InTime entities
-- ============================================
CREATE TABLE sms_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sms_id UUID NOT NULL REFERENCES sms_messages(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Link metadata
  link_type TEXT NOT NULL DEFAULT 'related',
  linked_by TEXT NOT NULL DEFAULT 'manual',

  -- Audit
  linked_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(sms_id, entity_type, entity_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Phone accounts
CREATE INDEX phone_accounts_org_id_idx ON phone_accounts(org_id) WHERE deleted_at IS NULL;
CREATE INDEX phone_accounts_user_id_idx ON phone_accounts(user_id) WHERE deleted_at IS NULL;

-- Call logs
CREATE INDEX call_logs_org_id_idx ON call_logs(org_id);
CREATE INDEX call_logs_user_id_idx ON call_logs(user_id);
CREATE INDEX call_logs_initiated_at_idx ON call_logs(org_id, initiated_at DESC);
CREATE INDEX call_logs_from_number_idx ON call_logs(org_id, from_number);
CREATE INDEX call_logs_to_number_idx ON call_logs(org_id, to_number);
CREATE INDEX call_logs_status_idx ON call_logs(org_id, status);

-- Call entity links
CREATE INDEX call_entity_links_call_id_idx ON call_entity_links(call_id);
CREATE INDEX call_entity_links_entity_idx ON call_entity_links(entity_type, entity_id);

-- Contact phones
CREATE INDEX contact_phones_contact_id_idx ON contact_phones(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX contact_phones_number_idx ON contact_phones(org_id, phone_number) WHERE deleted_at IS NULL;

-- SMS messages
CREATE INDEX sms_messages_org_id_idx ON sms_messages(org_id);
CREATE INDEX sms_messages_user_id_idx ON sms_messages(user_id);
CREATE INDEX sms_messages_sent_at_idx ON sms_messages(org_id, sent_at DESC);

-- SMS entity links
CREATE INDEX sms_entity_links_sms_id_idx ON sms_entity_links(sms_id);
CREATE INDEX sms_entity_links_entity_idx ON sms_entity_links(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE phone_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_entity_links ENABLE ROW LEVEL SECURITY;

-- Phone accounts - users see their own
CREATE POLICY "Users can view their own phone accounts"
  ON phone_accounts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own phone accounts"
  ON phone_accounts FOR ALL
  USING (auth.uid() = user_id);

-- Call logs - org members can view
CREATE POLICY "Org members can view call logs"
  ON call_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own call logs"
  ON call_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Call entity links - org members can view
CREATE POLICY "Org members can view call entity links"
  ON call_entity_links FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Contact phones - org members can view
CREATE POLICY "Org members can view contact phones"
  ON contact_phones FOR SELECT
  USING (
    deleted_at IS NULL AND
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- SMS messages - org members can view
CREATE POLICY "Org members can view SMS messages"
  ON sms_messages FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- SMS entity links - org members can view
CREATE POLICY "Org members can view SMS entity links"
  ON sms_entity_links FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-link calls to entities based on phone number
CREATE OR REPLACE FUNCTION auto_link_call_to_entities()
RETURNS TRIGGER AS $$
DECLARE
  v_contact RECORD;
  v_phone_to_check TEXT;
BEGIN
  -- Determine which phone number to match
  v_phone_to_check := CASE
    WHEN NEW.direction = 'outbound' THEN NEW.to_number
    ELSE NEW.from_number
  END;

  -- Link to contacts by phone number
  FOR v_contact IN
    SELECT c.id, 'contact' as type
    FROM contacts c
    JOIN contact_phones cp ON cp.contact_id = c.id
    WHERE c.org_id = NEW.org_id
      AND cp.phone_number = v_phone_to_check
      AND c.deleted_at IS NULL
      AND cp.deleted_at IS NULL
    LIMIT 5
  LOOP
    INSERT INTO call_entity_links (org_id, call_id, entity_type, entity_id, link_type, linked_by)
    VALUES (NEW.org_id, NEW.id, v_contact.type, v_contact.id, 'primary', 'auto')
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_link_call_trigger
AFTER INSERT ON call_logs
FOR EACH ROW EXECUTE FUNCTION auto_link_call_to_entities();

-- Function to get call history for a contact
CREATE OR REPLACE FUNCTION get_contact_call_history(
  p_contact_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  call_id UUID,
  direction call_direction,
  status call_status,
  duration_seconds INTEGER,
  outcome call_outcome,
  initiated_at TIMESTAMPTZ,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cl.id,
    cl.direction,
    cl.status,
    cl.duration_seconds,
    cl.outcome,
    cl.initiated_at,
    u.full_name
  FROM call_logs cl
  JOIN call_entity_links cel ON cel.call_id = cl.id
  LEFT JOIN users u ON u.id = cl.user_id
  WHERE cel.entity_type = 'contact'
    AND cel.entity_id = p_contact_id
  ORDER BY cl.initiated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
