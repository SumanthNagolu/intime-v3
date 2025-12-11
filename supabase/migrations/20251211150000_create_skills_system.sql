-- ============================================
-- SKILLS-01: Unified Skills Taxonomy System
-- ============================================

-- Enable pgvector for embeddings (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- ENUMS
-- ============================================

-- Skill category enum
DO $$ BEGIN
  CREATE TYPE skill_category AS ENUM (
    'programming_language', 'framework', 'library', 'tool', 'platform',
    'database', 'cloud', 'methodology', 'soft_skill', 'domain', 'certification_skill'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Skill domain enum
DO $$ BEGIN
  CREATE TYPE skill_domain AS ENUM (
    'technology', 'business', 'creative', 'healthcare', 'finance', 'legal', 'general'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Verification method enum
DO $$ BEGIN
  CREATE TYPE verification_method AS ENUM (
    'self_reported', 'assessment', 'endorsement', 'certification', 'interview', 'resume_parsed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ENHANCE SKILLS MASTER TABLE
-- ============================================

-- Add new columns to existing skills table
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS canonical_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS skill_level INTEGER DEFAULT 2,  -- 0=root, 1=category, 2=skill, 3=specialization
  ADD COLUMN IF NOT EXISTS hierarchy_path TEXT,
  ADD COLUMN IF NOT EXISTS aliases JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS related_skills UUID[],
  ADD COLUMN IF NOT EXISTS version VARCHAR(20),
  ADD COLUMN IF NOT EXISTS is_latest_version BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS demand_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trending_direction VARCHAR(10),
  ADD COLUMN IF NOT EXISTS embedding VECTOR(1536),  -- For semantic search
  ADD COLUMN IF NOT EXISTS deprecated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deprecated_successor_id UUID REFERENCES skills(id),
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id),  -- NULL for global skills
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Add domain column using text first, then we'll use it with enums in application layer
ALTER TABLE skills ADD COLUMN IF NOT EXISTS domain VARCHAR(50) DEFAULT 'technology';

-- Create unique index on canonical_name (per org or global)
CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_canonical_unique
ON skills(COALESCE(org_id, '00000000-0000-0000-0000-000000000000'::uuid), canonical_name)
WHERE canonical_name IS NOT NULL;

-- Populate canonical_name from existing name
UPDATE skills SET canonical_name = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '_', 'g'))
WHERE canonical_name IS NULL;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_skills_category_domain ON skills(category, domain) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_skills_hierarchy ON skills(hierarchy_path) WHERE hierarchy_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_parent ON skills(parent_skill_id) WHERE parent_skill_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_search ON skills USING gin(search_vector) WHERE search_vector IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_org ON skills(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_trending ON skills(demand_score DESC) WHERE trending = true;

-- Only create vector index if there are non-null embeddings (avoid ivfflat error on empty column)
-- This will be created later when embeddings are populated
-- CREATE INDEX IF NOT EXISTS idx_skills_embedding ON skills USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100) WHERE embedding IS NOT NULL;

-- Search vector trigger
CREATE OR REPLACE FUNCTION skills_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.aliases::text, '')
  );
  IF NEW.canonical_name IS NULL THEN
    NEW.canonical_name := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '_', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_skills_search_vector ON skills;
CREATE TRIGGER trg_skills_search_vector
BEFORE INSERT OR UPDATE ON skills
FOR EACH ROW EXECUTE FUNCTION skills_search_vector_update();

-- ============================================
-- ENTITY SKILLS (Polymorphic Junction)
-- ============================================

CREATE TABLE IF NOT EXISTS entity_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic relationship
  entity_type VARCHAR(50) NOT NULL,  -- 'contact', 'job', 'placement', 'submission'
  entity_id UUID NOT NULL,

  -- Skill reference
  skill_id UUID NOT NULL REFERENCES skills(id),
  skill_name_override VARCHAR(100),  -- For ad-hoc skills not in taxonomy

  -- Proficiency (universal 1-5 scale)
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    -- 1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert
  years_experience NUMERIC(4,1),
  last_used_date DATE,

  -- Context
  is_primary BOOLEAN DEFAULT false,
  is_required BOOLEAN,  -- For jobs: required vs nice-to-have
  min_proficiency_required INTEGER,  -- For jobs: minimum level needed

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,
  verification_method VARCHAR(50) DEFAULT 'self_reported',
  confidence_score NUMERIC(3,2),  -- AI confidence (0-1)

  -- Source
  source VARCHAR(50),  -- 'resume_parsed', 'manual', 'linkedin_sync', 'assessment'
  source_context TEXT,  -- Where skill was demonstrated

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Unique constraint on entity + skill (soft delete aware)
CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_skills_unique
ON entity_skills(entity_type, entity_id, skill_id)
WHERE deleted_at IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entity_skills_org ON entity_skills(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_skills_entity ON entity_skills(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_skills_skill ON entity_skills(skill_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_skills_verified ON entity_skills(entity_type, entity_id) WHERE is_verified = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_skills_primary ON entity_skills(entity_type, entity_id) WHERE is_primary = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_skills_proficiency ON entity_skills(proficiency_level DESC) WHERE deleted_at IS NULL;

-- Entity type validation trigger
DROP TRIGGER IF EXISTS trg_entity_skills_validate_entity_type ON entity_skills;
CREATE TRIGGER trg_entity_skills_validate_entity_type
BEFORE INSERT OR UPDATE ON entity_skills
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_entity_skills_updated_at ON entity_skills;
CREATE TRIGGER trg_entity_skills_updated_at
BEFORE UPDATE ON entity_skills
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE entity_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entity_skills_org_isolation" ON entity_skills;
CREATE POLICY "entity_skills_org_isolation" ON entity_skills
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- CERTIFICATIONS (Unified)
-- ============================================

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic (who has this cert)
  entity_type VARCHAR(50) NOT NULL,  -- Usually 'contact'
  entity_id UUID NOT NULL,

  -- Certification details
  certification_name VARCHAR(200) NOT NULL,
  issuing_organization VARCHAR(200),
  credential_id VARCHAR(100),
  verification_url VARCHAR(500),

  -- Linked skill (optional)
  skill_id UUID REFERENCES skills(id),

  -- Dates
  issue_date DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,

  -- Renewal
  renewal_required BOOLEAN DEFAULT false,
  renewal_period_months INTEGER,
  renewal_reminder_sent_at TIMESTAMPTZ,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,

  -- Documents
  certificate_document_id UUID,  -- Links to documents table after DOCS-01

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certifications_org ON certifications(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_certifications_entity ON certifications(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON certifications(expiry_date) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_certifications_skill ON certifications(skill_id) WHERE skill_id IS NOT NULL AND deleted_at IS NULL;

-- Entity type validation trigger
DROP TRIGGER IF EXISTS trg_certifications_validate_entity_type ON certifications;
CREATE TRIGGER trg_certifications_validate_entity_type
BEFORE INSERT OR UPDATE ON certifications
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_certifications_updated_at ON certifications;
CREATE TRIGGER trg_certifications_updated_at
BEFORE UPDATE ON certifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certifications_org_isolation" ON certifications;
CREATE POLICY "certifications_org_isolation" ON certifications
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- SKILL ENDORSEMENTS (Social Proof)
-- ============================================

CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Who is being endorsed
  entity_skill_id UUID NOT NULL REFERENCES entity_skills(id) ON DELETE CASCADE,

  -- Who is endorsing
  endorser_id UUID NOT NULL REFERENCES contacts(id),
  endorser_relationship VARCHAR(50),  -- 'colleague', 'manager', 'client', 'recruiter'

  -- Endorsement details
  endorsement_level VARCHAR(20),  -- 'basic', 'strong', 'expert'
  comment TEXT,

  -- Verification
  is_verified BOOLEAN DEFAULT false,  -- Endorser is verified contact

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Unique constraint on skill + endorser
CREATE UNIQUE INDEX IF NOT EXISTS idx_skill_endorsements_unique
ON skill_endorsements(entity_skill_id, endorser_id);

CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill ON skill_endorsements(entity_skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_endorser ON skill_endorsements(endorser_id);

-- RLS
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skill_endorsements_org_isolation" ON skill_endorsements;
CREATE POLICY "skill_endorsements_org_isolation" ON skill_endorsements
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get skill hierarchy (for hierarchy display)
CREATE OR REPLACE FUNCTION get_skill_hierarchy(p_skill_id UUID)
RETURNS TABLE(
  skill_id UUID,
  skill_name TEXT,
  skill_level INTEGER,
  depth INTEGER
) AS $$
WITH RECURSIVE hierarchy AS (
  SELECT s.id AS skill_id, s.name AS skill_name, s.skill_level, 0 AS depth
  FROM skills s
  WHERE s.id = p_skill_id

  UNION ALL

  SELECT s.id AS skill_id, s.name AS skill_name, s.skill_level, h.depth + 1
  FROM skills s
  INNER JOIN hierarchy h ON s.parent_skill_id = h.skill_id
  WHERE s.parent_skill_id IS NOT NULL
)
SELECT h.skill_id, h.skill_name, h.skill_level, h.depth
FROM hierarchy h
ORDER BY h.depth DESC;
$$ LANGUAGE sql;

-- Match skills between entity and job (for skill matching UI)
CREATE OR REPLACE FUNCTION match_entity_skills_to_job(p_entity_type VARCHAR, p_entity_id UUID, p_job_id UUID)
RETURNS TABLE(
  skill_id UUID,
  skill_name TEXT,
  entity_proficiency INTEGER,
  job_min_proficiency INTEGER,
  is_required BOOLEAN,
  match_status VARCHAR
) AS $$
SELECT
  js.skill_id,
  s.name AS skill_name,
  es.proficiency_level AS entity_proficiency,
  js.min_proficiency_required AS job_min_proficiency,
  js.is_required,
  CASE
    WHEN es.id IS NULL THEN 'missing'
    WHEN js.min_proficiency_required IS NULL THEN 'matched'
    WHEN es.proficiency_level >= COALESCE(js.min_proficiency_required, 1) THEN 'matched'
    ELSE 'partial'
  END AS match_status
FROM entity_skills js
JOIN skills s ON s.id = js.skill_id
LEFT JOIN entity_skills es ON es.skill_id = js.skill_id
  AND es.entity_type = p_entity_type
  AND es.entity_id = p_entity_id
  AND es.deleted_at IS NULL
WHERE js.entity_type = 'job'
  AND js.entity_id = p_job_id
  AND js.deleted_at IS NULL
ORDER BY js.is_required DESC NULLS LAST, s.name;
$$ LANGUAGE sql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE entity_skills IS 'Polymorphic junction table for skills on any entity type (contacts, jobs, placements). Part of SKILLS-01 unified skills system.';
COMMENT ON TABLE certifications IS 'Unified certifications table with polymorphic entity reference. Part of SKILLS-01.';
COMMENT ON TABLE skill_endorsements IS 'Social proof for skills - endorsements from other contacts. Part of SKILLS-01.';
COMMENT ON FUNCTION get_skill_hierarchy IS 'Returns the hierarchy path for a skill (from specialization up to root category).';
COMMENT ON FUNCTION match_entity_skills_to_job IS 'Matches an entity skills against a job requirements. Returns match status for each required skill.';

-- Add 'certification' to entity_type_registry if not exists
INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES ('certification', 'certifications', 'certification_name', 'Certification', NULL)
ON CONFLICT (entity_type) DO NOTHING;
