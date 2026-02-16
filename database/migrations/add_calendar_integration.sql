-- ============================================
-- CALENDAR INTEGRATION SCHEMA
-- Phase 2: Communications (Weeks 5-8)
-- ============================================

-- Calendar provider types
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'exchange', 'ical');

-- Calendar sync status
CREATE TYPE calendar_sync_status AS ENUM ('active', 'paused', 'error', 'disconnected');

-- Event response status
CREATE TYPE event_response_status AS ENUM ('accepted', 'declined', 'tentative', 'needs_action');

-- Event type for recruiting
CREATE TYPE recruiting_event_type AS ENUM (
  'phone_screen',
  'technical_interview',
  'onsite_interview',
  'panel_interview',
  'hiring_manager_interview',
  'client_interview',
  'debrief',
  'offer_call',
  'intake_call',
  'kickoff_meeting',
  'check_in',
  'other'
);

-- ============================================
-- CALENDAR ACCOUNTS
-- Connected calendar accounts for each user
-- ============================================
CREATE TABLE calendar_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Provider info
  provider calendar_provider NOT NULL,
  calendar_id TEXT NOT NULL, -- Provider's calendar ID
  calendar_name TEXT NOT NULL,
  email_address TEXT NOT NULL,

  -- OAuth tokens
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Sync settings
  sync_status calendar_sync_status NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  sync_token TEXT, -- For incremental sync

  -- Preferences
  is_primary BOOLEAN NOT NULL DEFAULT false,
  color TEXT, -- Calendar color in UI
  show_in_availability BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(org_id, user_id, calendar_id)
);

-- ============================================
-- CALENDAR EVENTS
-- Synced and created calendar events
-- ============================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  calendar_account_id UUID NOT NULL REFERENCES calendar_accounts(id) ON DELETE CASCADE,

  -- Provider identification
  provider_event_id TEXT NOT NULL,
  ical_uid TEXT, -- iCalendar UID for cross-provider matching

  -- Event basics
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  -- Recruiting metadata
  recruiting_event_type recruiting_event_type,
  interview_round INTEGER, -- 1, 2, 3...
  interview_scorecard_id UUID, -- Reference to scorecard if exists

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_all_day BOOLEAN NOT NULL DEFAULT false,

  -- Recurrence
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT, -- RRULE format
  recurring_event_id UUID REFERENCES calendar_events(id), -- Parent event for instances

  -- Participants
  organizer_email TEXT NOT NULL,
  organizer_name TEXT,
  attendees JSONB NOT NULL DEFAULT '[]', -- [{email, name, responseStatus, optional}]

  -- User's response
  response_status event_response_status DEFAULT 'needs_action',

  -- Meeting details
  conference_link TEXT, -- Zoom, Meet, Teams link
  conference_provider TEXT, -- zoom, meet, teams, webex

  -- Status
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  is_private BOOLEAN NOT NULL DEFAULT false,

  -- AI-extracted info
  ai_summary TEXT,
  ai_action_items JSONB DEFAULT '[]',
  ai_entities_mentioned JSONB DEFAULT '[]',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(calendar_account_id, provider_event_id)
);

-- ============================================
-- CALENDAR ENTITY LINKS
-- Links between calendar events and InTime entities
-- ============================================
CREATE TABLE calendar_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL, -- job, candidate, submission, account, contact
  entity_id UUID NOT NULL,

  -- Link metadata
  link_type TEXT NOT NULL DEFAULT 'related', -- primary (main entity), related, mentioned
  role TEXT, -- For candidates: interviewer, candidate; for contacts: attendee, organizer

  -- Link source
  linked_by TEXT NOT NULL DEFAULT 'manual', -- manual, auto, ai
  link_reason TEXT,
  match_details JSONB,

  -- Audit
  linked_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(event_id, entity_type, entity_id)
);

-- ============================================
-- AVAILABILITY BLOCKS
-- User-defined availability windows
-- ============================================
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Block details
  name TEXT, -- "Interview Hours", "Office Hours"
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',

  -- Validity period
  effective_from DATE,
  effective_until DATE,

  -- What this availability is for
  event_types JSONB DEFAULT '[]', -- Which recruiting_event_types this applies to

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- SCHEDULING LINKS
-- Shareable scheduling links (like Calendly)
-- ============================================
CREATE TABLE scheduling_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link details
  slug TEXT NOT NULL, -- URL slug
  name TEXT NOT NULL,
  description TEXT,

  -- Event settings
  event_title_template TEXT NOT NULL DEFAULT '{{attendee_name}} <> {{owner_name}}',
  event_duration_minutes INTEGER NOT NULL DEFAULT 30,
  event_type recruiting_event_type,
  location_type TEXT DEFAULT 'video', -- video, phone, in_person
  conference_provider TEXT, -- zoom, meet, teams

  -- Availability settings
  calendar_account_id UUID REFERENCES calendar_accounts(id),
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  min_notice_hours INTEGER DEFAULT 24,
  max_days_ahead INTEGER DEFAULT 60,

  -- Day/time restrictions
  available_days JSONB DEFAULT '[1,2,3,4,5]', -- Mon-Fri by default
  available_hours_start TIME DEFAULT '09:00',
  available_hours_end TIME DEFAULT '17:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',

  -- Customization
  questions JSONB DEFAULT '[]', -- Custom questions for booker
  confirmation_message TEXT,
  reminder_enabled BOOLEAN DEFAULT true,

  -- Usage
  is_active BOOLEAN NOT NULL DEFAULT true,
  booking_count INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(org_id, slug)
);

-- ============================================
-- SCHEDULED INTERVIEWS
-- Interview scheduling with candidate workflow
-- ============================================
CREATE TABLE scheduled_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Related entities
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  job_id UUID NOT NULL,
  candidate_id UUID NOT NULL,

  -- Calendar event
  calendar_event_id UUID REFERENCES calendar_events(id),

  -- Interview details
  interview_type recruiting_event_type NOT NULL,
  interview_round INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,

  -- Timing
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',

  -- Location
  location_type TEXT NOT NULL DEFAULT 'video', -- video, phone, in_person
  location_details TEXT, -- Address or conference link
  conference_link TEXT,

  -- Interviewers
  interviewers JSONB NOT NULL DEFAULT '[]', -- [{userId, name, email, role}]
  hiring_manager_id UUID REFERENCES auth.users(id),

  -- Candidate info
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  candidate_confirmed BOOLEAN DEFAULT false,
  candidate_confirmed_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'pending', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'
  )),

  -- Feedback
  feedback_submitted BOOLEAN DEFAULT false,
  feedback_due_at TIMESTAMPTZ,
  overall_rating TEXT CHECK (overall_rating IN ('strong_yes', 'yes', 'neutral', 'no', 'strong_no')),

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,

  -- Rescheduling
  rescheduled_from_id UUID REFERENCES scheduled_interviews(id),
  reschedule_count INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INTERVIEW FEEDBACK
-- Structured feedback for interviews
-- ============================================
CREATE TABLE interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES scheduled_interviews(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES auth.users(id),

  -- Rating
  overall_rating TEXT NOT NULL CHECK (overall_rating IN ('strong_yes', 'yes', 'neutral', 'no', 'strong_no')),

  -- Structured feedback (JSONB array of {category, rating, notes})
  category_ratings JSONB DEFAULT '[]',

  -- Text feedback
  strengths TEXT,
  concerns TEXT,
  notes TEXT,

  -- Recommendation
  recommendation TEXT CHECK (recommendation IN ('hire', 'advance', 'hold', 'reject')),
  recommended_next_step TEXT,

  -- Meta
  is_submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(interview_id, interviewer_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Calendar accounts
CREATE INDEX calendar_accounts_org_id_idx ON calendar_accounts(org_id) WHERE deleted_at IS NULL;
CREATE INDEX calendar_accounts_user_id_idx ON calendar_accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX calendar_accounts_sync_status_idx ON calendar_accounts(sync_status) WHERE deleted_at IS NULL;

-- Calendar events
CREATE INDEX calendar_events_org_id_idx ON calendar_events(org_id);
CREATE INDEX calendar_events_account_id_idx ON calendar_events(calendar_account_id);
CREATE INDEX calendar_events_start_time_idx ON calendar_events(calendar_account_id, start_time);
CREATE INDEX calendar_events_time_range_idx ON calendar_events(calendar_account_id, start_time, end_time);
CREATE INDEX calendar_events_recruiting_type_idx ON calendar_events(org_id, recruiting_event_type)
  WHERE recruiting_event_type IS NOT NULL;

-- Calendar entity links
CREATE INDEX calendar_entity_links_event_id_idx ON calendar_entity_links(event_id);
CREATE INDEX calendar_entity_links_entity_idx ON calendar_entity_links(entity_type, entity_id);

-- Availability blocks
CREATE INDEX availability_blocks_user_id_idx ON availability_blocks(user_id) WHERE deleted_at IS NULL;
CREATE INDEX availability_blocks_day_idx ON availability_blocks(user_id, day_of_week) WHERE deleted_at IS NULL;

-- Scheduling links
CREATE INDEX scheduling_links_org_id_idx ON scheduling_links(org_id) WHERE deleted_at IS NULL;
CREATE INDEX scheduling_links_user_id_idx ON scheduling_links(user_id) WHERE deleted_at IS NULL;
CREATE INDEX scheduling_links_slug_idx ON scheduling_links(slug) WHERE deleted_at IS NULL AND is_active = true;

-- Scheduled interviews
CREATE INDEX scheduled_interviews_org_id_idx ON scheduled_interviews(org_id);
CREATE INDEX scheduled_interviews_job_id_idx ON scheduled_interviews(job_id);
CREATE INDEX scheduled_interviews_candidate_id_idx ON scheduled_interviews(candidate_id);
CREATE INDEX scheduled_interviews_submission_id_idx ON scheduled_interviews(submission_id);
CREATE INDEX scheduled_interviews_date_idx ON scheduled_interviews(org_id, scheduled_start);
CREATE INDEX scheduled_interviews_status_idx ON scheduled_interviews(org_id, status);
CREATE INDEX scheduled_interviews_feedback_due_idx ON scheduled_interviews(feedback_due_at)
  WHERE status = 'completed' AND feedback_submitted = false;

-- Interview feedback
CREATE INDEX interview_feedback_interview_id_idx ON interview_feedback(interview_id);
CREATE INDEX interview_feedback_interviewer_id_idx ON interview_feedback(interviewer_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE calendar_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_entity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- Calendar accounts - users see their own
CREATE POLICY "Users can view their own calendar accounts"
  ON calendar_accounts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own calendar accounts"
  ON calendar_accounts FOR ALL
  USING (auth.uid() = user_id);

-- Calendar events - users see events from their calendars
CREATE POLICY "Users can view their calendar events"
  ON calendar_events FOR SELECT
  USING (
    calendar_account_id IN (
      SELECT id FROM calendar_accounts
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Calendar entity links - org members can view
CREATE POLICY "Org members can view calendar entity links"
  ON calendar_entity_links FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Availability blocks - users manage their own
CREATE POLICY "Users can view their own availability"
  ON availability_blocks FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own availability"
  ON availability_blocks FOR ALL
  USING (auth.uid() = user_id);

-- Scheduling links - users manage their own
CREATE POLICY "Users can view their own scheduling links"
  ON scheduling_links FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own scheduling links"
  ON scheduling_links FOR ALL
  USING (auth.uid() = user_id);

-- Scheduled interviews - org members can view
CREATE POLICY "Org members can view scheduled interviews"
  ON scheduled_interviews FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Interview feedback - interviewers can manage their own
CREATE POLICY "Interviewers can manage their feedback"
  ON interview_feedback FOR ALL
  USING (auth.uid() = interviewer_id);

CREATE POLICY "Org members can view interview feedback"
  ON interview_feedback FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check for scheduling conflicts
CREATE OR REPLACE FUNCTION check_scheduling_conflicts(
  p_user_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_event_id UUID DEFAULT NULL
)
RETURNS TABLE (
  event_id UUID,
  title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT ce.id, ce.title, ce.start_time, ce.end_time
  FROM calendar_events ce
  JOIN calendar_accounts ca ON ce.calendar_account_id = ca.id
  WHERE ca.user_id = p_user_id
    AND ca.show_in_availability = true
    AND ca.deleted_at IS NULL
    AND ce.is_cancelled = false
    AND ce.response_status != 'declined'
    AND (ce.id != p_exclude_event_id OR p_exclude_event_id IS NULL)
    AND ce.start_time < p_end_time
    AND ce.end_time > p_start_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get available slots for scheduling
CREATE OR REPLACE FUNCTION get_available_slots(
  p_user_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER,
  p_buffer_before INTEGER DEFAULT 0,
  p_buffer_after INTEGER DEFAULT 0
)
RETURNS TABLE (
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ
) AS $$
DECLARE
  v_availability RECORD;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
BEGIN
  -- Get availability for this day of week
  FOR v_availability IN
    SELECT * FROM availability_blocks
    WHERE user_id = p_user_id
      AND day_of_week = EXTRACT(DOW FROM p_date)
      AND deleted_at IS NULL
      AND (effective_from IS NULL OR effective_from <= p_date)
      AND (effective_until IS NULL OR effective_until >= p_date)
  LOOP
    v_day_start := p_date + v_availability.start_time;
    v_day_end := p_date + v_availability.end_time;
    v_slot_start := v_day_start;

    -- Generate slots within availability window
    WHILE v_slot_start + (p_duration_minutes || ' minutes')::INTERVAL <= v_day_end LOOP
      v_slot_end := v_slot_start + (p_duration_minutes || ' minutes')::INTERVAL;

      -- Check for conflicts (including buffer)
      IF NOT EXISTS (
        SELECT 1 FROM check_scheduling_conflicts(
          p_user_id,
          v_slot_start - (p_buffer_before || ' minutes')::INTERVAL,
          v_slot_end + (p_buffer_after || ' minutes')::INTERVAL
        )
      ) THEN
        slot_start := v_slot_start;
        slot_end := v_slot_end;
        RETURN NEXT;
      END IF;

      -- Move to next slot (15-minute increments)
      v_slot_start := v_slot_start + '15 minutes'::INTERVAL;
    END LOOP;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-link calendar events to entities
CREATE OR REPLACE FUNCTION auto_link_calendar_event()
RETURNS TRIGGER AS $$
DECLARE
  v_attendee JSONB;
  v_contact RECORD;
BEGIN
  -- Skip if event has no recruiting type
  IF NEW.recruiting_event_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Link to contacts/candidates based on attendee emails
  FOR v_attendee IN SELECT jsonb_array_elements(NEW.attendees) LOOP
    FOR v_contact IN
      SELECT id, 'contact' as type FROM contacts
      WHERE org_id = NEW.org_id
        AND email = v_attendee->>'email'
        AND deleted_at IS NULL
      UNION ALL
      SELECT id, 'candidate' as type FROM candidates
      WHERE org_id = NEW.org_id
        AND email = v_attendee->>'email'
        AND deleted_at IS NULL
      LIMIT 1
    LOOP
      INSERT INTO calendar_entity_links (
        org_id, event_id, entity_type, entity_id,
        link_type, role, linked_by, link_reason
      )
      VALUES (
        NEW.org_id, NEW.id, v_contact.type, v_contact.id,
        'related', COALESCE(v_attendee->>'role', 'attendee'), 'auto', 'attendee_email_match'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_link_calendar_event_trigger
AFTER INSERT ON calendar_events
FOR EACH ROW EXECUTE FUNCTION auto_link_calendar_event();

-- Function to update interview feedback status
CREATE OR REPLACE FUNCTION update_interview_feedback_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Check if all interviewers have submitted feedback
    IF NEW.is_submitted = true THEN
      UPDATE scheduled_interviews si
      SET
        feedback_submitted = (
          SELECT COUNT(*) = jsonb_array_length(si.interviewers)
          FROM interview_feedback if2
          WHERE if2.interview_id = NEW.interview_id AND if2.is_submitted = true
        ),
        updated_at = NOW()
      WHERE si.id = NEW.interview_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interview_feedback_status_trigger
AFTER INSERT OR UPDATE ON interview_feedback
FOR EACH ROW EXECUTE FUNCTION update_interview_feedback_status();
