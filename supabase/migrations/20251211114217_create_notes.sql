-- ============================================
-- NOTES-01: Unified Notes System
-- ============================================
-- Creates a centralized polymorphic notes table replacing
-- entity-specific notes tables (account_notes, company_notes, etc.)
-- Supports threading, @mentions, visibility controls, and reactions.

-- Note type enum
DO $$ BEGIN
  CREATE TYPE note_type AS ENUM (
    'general', 'meeting', 'call', 'strategy', 'warning',
    'opportunity', 'competitive_intel', 'internal'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Visibility enum
DO $$ BEGIN
  CREATE TYPE note_visibility AS ENUM ('private', 'team', 'organization');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Unified notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic entity reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Content
  title VARCHAR(200),
  content TEXT NOT NULL,
  content_html TEXT,
  content_plain TEXT,

  -- Classification
  note_type note_type DEFAULT 'general',

  -- Threading
  parent_note_id UUID REFERENCES notes(id),
  thread_root_id UUID REFERENCES notes(id),
  reply_count INTEGER DEFAULT 0,

  -- Visibility
  visibility note_visibility DEFAULT 'team',

  -- Features
  is_pinned BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  pin_order INTEGER,

  -- Mentions
  mentioned_user_ids UUID[],
  mentioned_contact_ids UUID[],

  -- Tags
  tags TEXT[],

  -- Attachments
  attachment_count INTEGER DEFAULT 0,

  -- Search
  search_vector TSVECTOR,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Validation
  CONSTRAINT notes_content_not_empty CHECK (content IS NOT NULL AND content != '')
);

-- Indexes for notes
CREATE INDEX IF NOT EXISTS idx_notes_org ON notes(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_entity ON notes(entity_type, entity_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(entity_type, entity_id, pin_order) WHERE is_pinned = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_thread ON notes(thread_root_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING gin(search_vector) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_mentions_users ON notes USING gin(mentioned_user_ids) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_creator ON notes(created_by, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_parent ON notes(parent_note_id) WHERE deleted_at IS NULL;

-- Entity type validation trigger
DROP TRIGGER IF EXISTS trg_notes_validate_entity_type ON notes;
CREATE TRIGGER trg_notes_validate_entity_type
BEFORE INSERT OR UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Search vector update trigger function
CREATE OR REPLACE FUNCTION notes_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.content_plain, NEW.content, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notes_search_vector ON notes;
CREATE TRIGGER trg_notes_search_vector
BEFORE INSERT OR UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION notes_search_vector_update();

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_org_isolation" ON notes;
CREATE POLICY "notes_org_isolation" ON notes
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

DROP POLICY IF EXISTS "notes_select_visibility" ON notes;
CREATE POLICY "notes_select_visibility" ON notes
  FOR SELECT USING (
    visibility = 'organization'
    OR (visibility = 'team')  -- Simplified: team = org for now
    OR (visibility = 'private' AND created_by = (current_setting('app.user_id', true))::uuid)
  );

-- Note reactions table
CREATE TABLE IF NOT EXISTS note_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  reaction VARCHAR(20) NOT NULL,  -- 'like', 'heart', 'thumbs_up', etc.
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT note_reactions_unique UNIQUE (note_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_note_reactions_note ON note_reactions(note_id);
CREATE INDEX IF NOT EXISTS idx_note_reactions_user ON note_reactions(user_id);

ALTER TABLE note_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "note_reactions_access" ON note_reactions;
CREATE POLICY "note_reactions_access" ON note_reactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM notes n WHERE n.id = note_id AND n.org_id = (current_setting('app.org_id', true))::uuid)
  );

-- Comments
COMMENT ON TABLE notes IS 'Unified notes table for all entity types (NOTES-01)';
COMMENT ON COLUMN notes.entity_type IS 'Type of entity this note belongs to (validated against entity_type_registry)';
COMMENT ON COLUMN notes.parent_note_id IS 'Reference to parent note for threading';
COMMENT ON COLUMN notes.thread_root_id IS 'Reference to the root note of the thread';
COMMENT ON COLUMN notes.visibility IS 'Access level: private (creator only), team (org), organization (all)';
COMMENT ON TABLE note_reactions IS 'User reactions (likes, hearts) on notes';

-- 'note' entity type is already registered in ENTITIES-01 migration
-- (entity_type_registry seeded with ('note', 'notes', 'id', 'Note', NULL))
