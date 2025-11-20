-- ============================================================================
-- Migration: 021_add_sprint_5_features.sql
-- Description: Guidewire Guru & Resume Matching (Sprint 5)
-- Epic: 2.5 - AI Infrastructure (Sprint 5 - Final Sprint)
-- Stories: AI-GURU-001 to AI-GURU-005, AI-MATCH-001
-- Author: InTime Development Team
-- Date: 2025-11-20
-- Dependencies: Migrations 017-020 (AI foundation, agent framework, Guru base)
-- ============================================================================

-- Verify dependencies
DO $$
BEGIN
  -- Verify migration 019 (Guru base) completed
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guru_interactions') THEN
    RAISE EXCEPTION 'Migration 019 (Guru base) must be applied first';
  END IF;

  -- Verify pgvector extension
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    RAISE EXCEPTION 'pgvector extension not installed - run migration 017 first';
  END IF;

  RAISE NOTICE 'Migration 021: Dependencies verified';
END $$;

-- ----------------------------------------------------------------------------
-- GENERATED RESUMES TABLE (AI-GURU-003)
-- Description: AI-generated resumes for students with quality tracking
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS generated_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Resume metadata
  target_role TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  resume_pdf_path TEXT,  -- Supabase Storage path: {org_id}/{user_id}/{timestamp}.pdf

  -- Quality metrics (automated validation)
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  ats_keywords TEXT[],
  has_quantified_achievements BOOLEAN DEFAULT FALSE,
  has_action_verbs BOOLEAN DEFAULT FALSE,
  length_appropriate BOOLEAN DEFAULT FALSE,
  no_typos BOOLEAN DEFAULT FALSE,

  -- Success tracking
  student_feedback TEXT,
  interview_count INTEGER DEFAULT 0,
  placement_achieved BOOLEAN DEFAULT FALSE,

  -- AI model tracking
  model_used TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),
  generation_latency_ms INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_resumes_user ON generated_resumes(user_id, created_at DESC);
CREATE INDEX idx_resumes_org ON generated_resumes(org_id);
CREATE INDEX idx_resumes_placement ON generated_resumes(placement_achieved)
  WHERE placement_achieved = TRUE;
CREATE INDEX idx_resumes_role ON generated_resumes(target_role);
CREATE INDEX idx_resumes_quality ON generated_resumes(quality_score)
  WHERE quality_score IS NOT NULL;

-- Comments
COMMENT ON TABLE generated_resumes IS 'AI-generated resumes for students (AI-GURU-003)';
COMMENT ON COLUMN generated_resumes.quality_score IS 'Overall quality score 0-100 (automated validation)';
COMMENT ON COLUMN generated_resumes.interview_count IS 'Number of interviews secured with this resume (success tracking)';
COMMENT ON COLUMN generated_resumes.ats_keywords IS 'ATS-friendly keywords detected in resume';

-- ----------------------------------------------------------------------------
-- CANDIDATE EMBEDDINGS TABLE (AI-MATCH-001)
-- Description: pgvector embeddings for semantic candidate search
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS candidate_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,  -- Will reference candidates(id) when Epic 3 is built

  -- Embedding data (text-embedding-3-small = 1536 dimensions)
  embedding vector(1536),
  resume_text TEXT NOT NULL,
  skills TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior')),
  availability TEXT CHECK (availability IN ('immediate', '2-weeks', '1-month')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, candidate_id)
);

-- pgvector index (ivfflat with lists=100)
-- Formula: lists = sqrt(expected_rows) = sqrt(10,000) = 100
-- Performance: <500ms for 10K embeddings
CREATE INDEX idx_candidate_embeddings_vector ON candidate_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Performance indexes
CREATE INDEX idx_candidate_embeddings_org ON candidate_embeddings(org_id);
CREATE INDEX idx_candidate_embeddings_skills ON candidate_embeddings USING GIN(skills);
CREATE INDEX idx_candidate_embeddings_experience ON candidate_embeddings(experience_level);
CREATE INDEX idx_candidate_embeddings_availability ON candidate_embeddings(availability);

-- Comments
COMMENT ON TABLE candidate_embeddings IS 'Semantic embeddings for candidate resumes (resume matching AI-MATCH-001)';
COMMENT ON COLUMN candidate_embeddings.embedding IS 'pgvector embedding (1536 dims from text-embedding-3-small)';
COMMENT ON INDEX idx_candidate_embeddings_vector IS 'ivfflat index optimized for 10K candidates, <500ms search target';

-- ----------------------------------------------------------------------------
-- REQUISITION EMBEDDINGS TABLE (AI-MATCH-001)
-- Description: pgvector embeddings for job requisitions
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS requisition_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requisition_id UUID NOT NULL,  -- Will reference job_requisitions(id) when Epic 3 is built

  -- Embedding data
  embedding vector(1536),
  description TEXT NOT NULL,
  required_skills TEXT[],
  nice_to_have_skills TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, requisition_id)
);

-- pgvector index
CREATE INDEX idx_requisition_embeddings_vector ON requisition_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Performance indexes
CREATE INDEX idx_requisition_embeddings_org ON requisition_embeddings(org_id);
CREATE INDEX idx_requisition_embeddings_skills ON requisition_embeddings
  USING GIN(required_skills);
CREATE INDEX idx_requisition_embeddings_experience ON requisition_embeddings(experience_level);

-- Comments
COMMENT ON TABLE requisition_embeddings IS 'Semantic embeddings for job requisitions (resume matching AI-MATCH-001)';
COMMENT ON COLUMN requisition_embeddings.embedding IS 'pgvector embedding of job description + requirements';

-- ----------------------------------------------------------------------------
-- RESUME MATCHES TABLE (AI-MATCH-001)
-- Description: Match history for candidate-job pairings with feedback loop
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS resume_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requisition_id UUID NOT NULL,
  candidate_id UUID NOT NULL,

  -- Overall match scoring (0-100)
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  reasoning TEXT,  -- AI explanation for the match score
  skills_matched TEXT[],
  skills_missing TEXT[],

  -- Detailed match breakdown (0-100 each)
  skills_score INTEGER CHECK (skills_score >= 0 AND skills_score <= 100),      -- 40% weight
  experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100), -- 30% weight
  project_score INTEGER CHECK (project_score >= 0 AND project_score <= 100),    -- 20% weight
  availability_score INTEGER CHECK (availability_score >= 0 AND availability_score <= 100), -- 10% weight

  -- Recruiter feedback (for accuracy tracking)
  recruiter_feedback TEXT,
  is_relevant BOOLEAN,  -- Was this a good match? (yes/no)

  -- Pipeline tracking
  submitted BOOLEAN DEFAULT FALSE,
  interview_scheduled BOOLEAN DEFAULT FALSE,
  placement_achieved BOOLEAN DEFAULT FALSE,

  -- AI model tracking
  model_used TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),
  search_latency_ms INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_matches_requisition ON resume_matches(requisition_id, match_score DESC);
CREATE INDEX idx_matches_candidate ON resume_matches(candidate_id);
CREATE INDEX idx_matches_org ON resume_matches(org_id);
CREATE INDEX idx_matches_relevant ON resume_matches(is_relevant)
  WHERE is_relevant IS NOT NULL;
CREATE INDEX idx_matches_placement ON resume_matches(placement_achieved)
  WHERE placement_achieved = TRUE;
CREATE INDEX idx_matches_created ON resume_matches(org_id, created_at DESC);

-- Comments
COMMENT ON TABLE resume_matches IS 'Resume matching history and outcomes (AI-MATCH-001)';
COMMENT ON COLUMN resume_matches.is_relevant IS 'Recruiter feedback: Was this match relevant? Used for accuracy calculation';
COMMENT ON COLUMN resume_matches.match_score IS 'Overall match score 0-100 (weighted sum of component scores)';

-- ----------------------------------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on new tables
ALTER TABLE generated_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisition_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_matches ENABLE ROW LEVEL SECURITY;

-- generated_resumes: Students see own; Trainers see all in org
CREATE POLICY resumes_user_own ON generated_resumes
  FOR ALL
  USING (
    user_id = auth.uid()
    AND org_id = auth_user_org_id()
  );

CREATE POLICY resumes_trainer_view ON generated_resumes
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND user_has_role('trainer')
  );

CREATE POLICY resumes_admin_all ON generated_resumes
  FOR ALL
  USING (
    org_id = auth_user_org_id()
    AND user_has_role('org_admin')
  );

-- candidate_embeddings: Recruiters see all in org
CREATE POLICY embeddings_recruiter_all ON candidate_embeddings
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND user_has_role('recruiter')
  );

CREATE POLICY embeddings_service_role ON candidate_embeddings
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- requisition_embeddings: Recruiters see all in org
CREATE POLICY requisitions_recruiter_all ON requisition_embeddings
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND user_has_role('recruiter')
  );

CREATE POLICY requisitions_service_role ON requisition_embeddings
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- resume_matches: Recruiters see all in org
CREATE POLICY matches_recruiter_all ON resume_matches
  FOR ALL
  USING (
    org_id = auth_user_org_id()
    AND user_has_role('recruiter')
  );

CREATE POLICY matches_admin_all ON resume_matches
  FOR ALL
  USING (
    org_id = auth_user_org_id()
    AND user_has_role('org_admin')
  );

-- ----------------------------------------------------------------------------
-- FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function: Semantic candidate search using pgvector
CREATE OR REPLACE FUNCTION search_candidates(
  p_org_id UUID,
  p_query_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.70,
  p_match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  candidate_id UUID,
  resume_text TEXT,
  skills TEXT[],
  experience_level TEXT,
  availability TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Semantic search using pgvector cosine similarity
  RETURN QUERY
  SELECT
    ce.candidate_id,
    ce.resume_text,
    ce.skills,
    ce.experience_level,
    ce.availability,
    -- Calculate similarity (1 - cosine distance = cosine similarity)
    1 - (ce.embedding <=> p_query_embedding) AS similarity
  FROM candidate_embeddings ce
  WHERE ce.org_id = p_org_id
    AND 1 - (ce.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY ce.embedding <=> p_query_embedding  -- <=> is cosine distance operator
  LIMIT p_match_count;
END;
$$;

COMMENT ON FUNCTION search_candidates IS 'Semantic candidate search using pgvector cosine similarity. Returns top-K matches above threshold.';

-- Function: Calculate resume matching accuracy
CREATE OR REPLACE FUNCTION calculate_matching_accuracy(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days'
)
RETURNS TABLE (
  total_matches BIGINT,
  relevant_matches BIGINT,
  accuracy NUMERIC,
  match_precision NUMERIC,
  avg_match_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_matches,
    COUNT(*) FILTER (WHERE is_relevant = TRUE) AS relevant_matches,
    -- Accuracy: (relevant / total) × 100
    ROUND(
      (COUNT(*) FILTER (WHERE is_relevant = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) AS accuracy,
    -- Precision: (true positives / (true positives + false positives)) × 100
    ROUND(
      (COUNT(*) FILTER (WHERE is_relevant = TRUE)::NUMERIC /
       NULLIF(COUNT(*) FILTER (WHERE match_score >= 70), 0)) * 100,
      2
    ) AS match_precision,
    -- Average match score
    ROUND(AVG(match_score), 2) AS avg_match_score
  FROM resume_matches
  WHERE org_id = p_org_id
    AND created_at >= p_start_date
    AND is_relevant IS NOT NULL;  -- Only include labeled matches
END;
$$;

COMMENT ON FUNCTION calculate_matching_accuracy IS 'Calculate resume matching accuracy metrics based on recruiter feedback (is_relevant column)';

-- Function: Get student resume generation stats
CREATE OR REPLACE FUNCTION get_resume_stats(
  p_org_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_resumes BIGINT,
  avg_quality_score NUMERIC,
  total_interviews INTEGER,
  total_placements BIGINT,
  avg_generation_time_ms INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_resumes,
    ROUND(AVG(quality_score), 2) AS avg_quality_score,
    SUM(interview_count) AS total_interviews,
    COUNT(*) FILTER (WHERE placement_achieved = TRUE) AS total_placements,
    CAST(AVG(generation_latency_ms) AS INTEGER) AS avg_generation_time_ms
  FROM generated_resumes
  WHERE org_id = p_org_id
    AND (p_user_id IS NULL OR user_id = p_user_id);
END;
$$;

COMMENT ON FUNCTION get_resume_stats IS 'Get resume generation statistics for an org or specific user';

-- ----------------------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------------------

-- Update updated_at timestamps
CREATE TRIGGER set_timestamp_generated_resumes
BEFORE UPDATE ON generated_resumes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_candidate_embeddings
BEFORE UPDATE ON candidate_embeddings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_requisition_embeddings
BEFORE UPDATE ON requisition_embeddings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_resume_matches
BEFORE UPDATE ON resume_matches
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------------------------------
-- STORAGE BUCKET SETUP (MANUAL - CANNOT BE DONE VIA SQL)
-- ----------------------------------------------------------------------------

/*
IMPORTANT: Supabase Storage buckets must be created manually via Dashboard

Bucket Configuration:
  Name: generated-resumes
  Public: NO (private bucket, RLS enforced)
  File size limit: 5MB
  Allowed MIME types:
    - application/pdf
    - application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)
    - text/plain (TXT)

Storage RLS Policies (apply via Supabase Dashboard → Storage → Policies):

1. "Users can view own resumes"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'generated-resumes'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

2. "Users can upload own resumes"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'generated-resumes'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

3. "Users can delete own resumes"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'generated-resumes'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

Path structure: {org_id}/{user_id}/{timestamp}.pdf
*/

-- ----------------------------------------------------------------------------
-- VALIDATION VIEWS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_sprint_5_status AS
SELECT
  'generated_resumes' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(*) FILTER (WHERE placement_achieved = TRUE) AS placements,
  ROUND(AVG(quality_score), 2) AS avg_quality
FROM generated_resumes
UNION ALL
SELECT
  'candidate_embeddings' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT candidate_id) AS unique_candidates,
  NULL AS placements,
  NULL AS avg_quality
FROM candidate_embeddings
UNION ALL
SELECT
  'requisition_embeddings' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT requisition_id) AS unique_requisitions,
  NULL AS placements,
  NULL AS avg_quality
FROM requisition_embeddings
UNION ALL
SELECT
  'resume_matches' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT candidate_id) AS unique_candidates,
  COUNT(*) FILTER (WHERE placement_achieved = TRUE) AS placements,
  ROUND(AVG(match_score), 2) AS avg_match_score
FROM resume_matches;

COMMENT ON VIEW v_sprint_5_status IS 'Validation view for Sprint 5 data (Guidewire Guru & Resume Matching)';

-- ----------------------------------------------------------------------------
-- GRANTS
-- ----------------------------------------------------------------------------

-- Service role needs full access for background jobs
GRANT ALL ON generated_resumes TO service_role;
GRANT ALL ON candidate_embeddings TO service_role;
GRANT ALL ON requisition_embeddings TO service_role;
GRANT ALL ON resume_matches TO service_role;

-- Authenticated users can execute functions
GRANT EXECUTE ON FUNCTION search_candidates TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_matching_accuracy TO authenticated;
GRANT EXECUTE ON FUNCTION get_resume_stats TO authenticated;

-- ----------------------------------------------------------------------------
-- POST-MIGRATION VALIDATION
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  function_count INTEGER;
BEGIN
  -- Verify tables created
  SELECT COUNT(*) INTO table_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'generated_resumes',
      'candidate_embeddings',
      'requisition_embeddings',
      'resume_matches'
    );

  ASSERT table_count = 4, 'Not all Sprint 5 tables created';

  -- Verify pgvector indexes created
  -- Note: ivfflat indexes may not be created on empty tables
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE '%embeddings_vector%';

  IF index_count < 2 THEN
    RAISE WARNING 'pgvector indexes not created yet (% found) - normal for empty tables', index_count;
  END IF;

  -- Verify functions created
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN ('search_candidates', 'calculate_matching_accuracy', 'get_resume_stats');

  ASSERT function_count = 3, 'Not all functions created';

  -- Verify RLS enabled
  ASSERT (
    SELECT COUNT(*) = 4
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'generated_resumes',
        'candidate_embeddings',
        'requisition_embeddings',
        'resume_matches'
      )
      AND rowsecurity = true
  ), 'RLS not enabled on all tables';

  RAISE NOTICE 'Migration 021 completed successfully!';
  RAISE NOTICE 'Tables: %', table_count;
  RAISE NOTICE 'pgvector indexes: %', index_count;
  RAISE NOTICE 'Functions: %', function_count;
  RAISE NOTICE 'RLS enabled: 4/4 tables';
END $$;

-- ----------------------------------------------------------------------------
-- POST-MIGRATION INSTRUCTIONS
-- ----------------------------------------------------------------------------

/*
MANUAL STEPS REQUIRED AFTER MIGRATION:

1. [ ] Create Supabase Storage bucket 'generated-resumes' (see instructions above)
2. [ ] Configure storage RLS policies in Supabase Dashboard
3. [ ] Index RAG collections (run script: scripts/index-rag-collections.ts):
   - guidewire_curriculum (~500 chunks)
   - successful_resumes (~100 resumes)
   - job_descriptions (~200 descriptions)
   - interview_questions (~100 questions)
4. [ ] Run ANALYZE on candidate_embeddings and requisition_embeddings:
   ANALYZE candidate_embeddings;
   ANALYZE requisition_embeddings;
5. [ ] Verify environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - OPENAI_API_KEY (for embeddings + GPT-4o-mini/GPT-4o)
   - ANTHROPIC_API_KEY (for Claude Sonnet - Interview Coach)
   - HELICONE_API_KEY (cost tracking)
   - SLACK_WEBHOOK_URL (escalation notifications)
6. [ ] Test flows:
   - Student asks question → Socratic response
   - Student generates resume → PDF download
   - Recruiter searches candidates → Matches returned
7. [ ] Monitor Helicone for AI cost tracking (target: <$10/day)
8. [ ] Create validation datasets:
   - 100 test questions for Code Mentor
   - 10 sample resumes for quality review
   - 20 test requisitions + 50 candidates = 1,000 pairs

VALIDATION QUERIES:

-- Check migration status
SELECT * FROM v_sprint_5_status;

-- Test semantic search (after indexing candidates)
SELECT * FROM search_candidates(
  'org-id-here'::uuid,
  '[0.1, 0.2, ...]'::vector(1536),  -- Test embedding
  0.70,
  10
);

-- Check matching accuracy (after recruiter feedback)
SELECT * FROM calculate_matching_accuracy('org-id-here'::uuid);

-- Check resume stats
SELECT * FROM get_resume_stats('org-id-here'::uuid);
*/

-- ============================================================================
-- END OF MIGRATION 021
-- ============================================================================
