-- ============================================
-- AI INTELLIGENCE SCHEMA
-- Phase 4: Intelligence (Weeks 13-16)
-- ============================================

-- AI interaction type
CREATE TYPE ai_interaction_type AS ENUM (
  'question',
  'suggestion',
  'action',
  'analysis',
  'summary'
);

-- AI suggestion status
CREATE TYPE ai_suggestion_status AS ENUM (
  'pending',
  'accepted',
  'dismissed',
  'expired'
);

-- AI suggestion priority
CREATE TYPE ai_suggestion_priority AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

-- ============================================
-- AI CONVERSATIONS
-- Chat history with AI assistant
-- ============================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation metadata
  title TEXT,
  context_type TEXT, -- entity, global, workflow
  context_entity_type TEXT, -- job, candidate, account, etc.
  context_entity_id UUID,

  -- Stats
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,

  -- Status
  is_archived BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AI MESSAGES
-- Individual messages in AI conversations
-- ============================================
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- For assistant messages
  interaction_type ai_interaction_type,

  -- Referenced entities (for context)
  referenced_entities JSONB DEFAULT '[]', -- [{type, id, name}]

  -- Actions taken
  actions_taken JSONB DEFAULT '[]', -- [{type, result, timestamp}]

  -- Feedback
  feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful')),
  feedback_notes TEXT,

  -- Tokens for usage tracking
  input_tokens INTEGER,
  output_tokens INTEGER,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AI SUGGESTIONS
-- Proactive AI suggestions for users
-- ============================================
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Suggestion content
  type TEXT NOT NULL, -- next_action, candidate_match, follow_up, risk_alert, etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT, -- Why AI suggested this

  -- Priority and urgency
  priority ai_suggestion_priority NOT NULL DEFAULT 'medium',
  score DECIMAL(5, 4), -- Confidence score 0-1

  -- Context
  entity_type TEXT,
  entity_id UUID,
  related_entities JSONB DEFAULT '[]', -- Additional context

  -- Action
  action_type TEXT, -- navigate, create, update, call, email
  action_payload JSONB, -- Data needed to execute action

  -- Status
  status ai_suggestion_status NOT NULL DEFAULT 'pending',
  dismissed_reason TEXT,

  -- Timing
  suggested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  actioned_at TIMESTAMPTZ,

  -- Feedback
  was_helpful BOOLEAN,
  feedback_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AI EMBEDDINGS
-- Vector embeddings for similarity search
-- ============================================
CREATE TABLE ai_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Source content
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- resume, job_description, note, email, etc.
  content_hash TEXT NOT NULL, -- To detect changes

  -- Embedding (using pgvector extension if available)
  -- For now, store as JSONB array - migrate to vector type later
  embedding JSONB NOT NULL,
  model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  dimensions INTEGER NOT NULL DEFAULT 1536,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(entity_type, entity_id, content_type)
);

-- ============================================
-- AI PREDICTIONS
-- Predictive analytics results
-- ============================================
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Prediction target
  prediction_type TEXT NOT NULL, -- placement_probability, time_to_fill, churn_risk, etc.
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Prediction result
  predicted_value JSONB NOT NULL, -- Flexible to support different prediction types
  confidence DECIMAL(5, 4) NOT NULL, -- 0-1

  -- Model info
  model_id TEXT NOT NULL,
  model_version TEXT NOT NULL,

  -- Features used
  features_used JSONB, -- Input features for explainability

  -- Validity
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Outcome (for model improvement)
  actual_outcome JSONB,
  outcome_recorded_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AI MATCH SCORES
-- Candidate-Job matching scores
-- ============================================
CREATE TABLE ai_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Match pair
  candidate_id UUID NOT NULL,
  job_id UUID NOT NULL,

  -- Overall score
  overall_score DECIMAL(5, 4) NOT NULL, -- 0-1

  -- Component scores (JSONB for flexibility)
  component_scores JSONB NOT NULL DEFAULT '{}',
  -- Example: { skills: 0.85, experience: 0.72, location: 0.90, culture: 0.65 }

  -- Explanation
  match_reasons JSONB DEFAULT '[]', -- Why this is a good match
  concern_reasons JSONB DEFAULT '[]', -- Potential concerns

  -- Model info
  model_id TEXT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Feedback
  recruiter_feedback TEXT CHECK (recruiter_feedback IN ('good_match', 'bad_match', 'neutral')),
  feedback_notes TEXT,
  feedback_at TIMESTAMPTZ,
  feedback_by UUID REFERENCES auth.users(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(candidate_id, job_id)
);

-- ============================================
-- AI SKILL EXTRACTION
-- Extracted skills from resumes/JDs
-- ============================================
CREATE TABLE ai_extracted_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Source
  entity_type TEXT NOT NULL, -- candidate, job
  entity_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- resume, job_description, profile

  -- Extracted skill
  skill_name TEXT NOT NULL,
  skill_category TEXT, -- technical, soft, certification, tool
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience DECIMAL(4, 1),

  -- Confidence
  confidence DECIMAL(5, 4) NOT NULL,
  extraction_context TEXT, -- The text context where skill was found

  -- Matching to canonical skills
  canonical_skill_id UUID, -- Link to skills table if matched
  match_confidence DECIMAL(5, 4),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AI USAGE TRACKING
-- Track AI feature usage for billing and analytics
-- ============================================
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Usage details
  feature TEXT NOT NULL, -- chat, suggestions, matching, extraction, etc.
  operation TEXT NOT NULL, -- query, generate, embed, etc.

  -- Tokens/units
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  embedding_tokens INTEGER DEFAULT 0,

  -- Cost (in cents)
  estimated_cost_cents INTEGER DEFAULT 0,

  -- Model used
  model TEXT,
  provider TEXT, -- openai, anthropic, etc.

  -- Context
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',

  -- Timing
  duration_ms INTEGER,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- AI conversations
CREATE INDEX ai_conversations_org_id_idx ON ai_conversations(org_id);
CREATE INDEX ai_conversations_user_id_idx ON ai_conversations(user_id);
CREATE INDEX ai_conversations_context_idx ON ai_conversations(context_entity_type, context_entity_id);
CREATE INDEX ai_conversations_last_message_idx ON ai_conversations(user_id, last_message_at DESC);

-- AI messages
CREATE INDEX ai_messages_conversation_id_idx ON ai_messages(conversation_id);
CREATE INDEX ai_messages_created_at_idx ON ai_messages(conversation_id, created_at);

-- AI suggestions
CREATE INDEX ai_suggestions_org_id_idx ON ai_suggestions(org_id);
CREATE INDEX ai_suggestions_user_id_idx ON ai_suggestions(user_id);
CREATE INDEX ai_suggestions_status_idx ON ai_suggestions(user_id, status) WHERE status = 'pending';
CREATE INDEX ai_suggestions_entity_idx ON ai_suggestions(entity_type, entity_id);
CREATE INDEX ai_suggestions_expires_idx ON ai_suggestions(expires_at) WHERE status = 'pending';

-- AI embeddings
CREATE INDEX ai_embeddings_org_id_idx ON ai_embeddings(org_id);
CREATE INDEX ai_embeddings_entity_idx ON ai_embeddings(entity_type, entity_id);

-- AI predictions
CREATE INDEX ai_predictions_org_id_idx ON ai_predictions(org_id);
CREATE INDEX ai_predictions_entity_idx ON ai_predictions(entity_type, entity_id);
CREATE INDEX ai_predictions_type_idx ON ai_predictions(org_id, prediction_type);

-- AI match scores
CREATE INDEX ai_match_scores_org_id_idx ON ai_match_scores(org_id);
CREATE INDEX ai_match_scores_candidate_idx ON ai_match_scores(candidate_id);
CREATE INDEX ai_match_scores_job_idx ON ai_match_scores(job_id);
CREATE INDEX ai_match_scores_score_idx ON ai_match_scores(org_id, overall_score DESC);

-- AI extracted skills
CREATE INDEX ai_extracted_skills_entity_idx ON ai_extracted_skills(entity_type, entity_id);
CREATE INDEX ai_extracted_skills_skill_idx ON ai_extracted_skills(org_id, skill_name);

-- AI usage logs
CREATE INDEX ai_usage_logs_org_id_idx ON ai_usage_logs(org_id);
CREATE INDEX ai_usage_logs_user_id_idx ON ai_usage_logs(user_id);
CREATE INDEX ai_usage_logs_created_at_idx ON ai_usage_logs(org_id, created_at);
CREATE INDEX ai_usage_logs_feature_idx ON ai_usage_logs(org_id, feature);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_extracted_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- AI conversations - users see their own
CREATE POLICY "Users can view their own AI conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI conversations"
  ON ai_conversations FOR ALL
  USING (auth.uid() = user_id);

-- AI messages - users see messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON ai_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );

-- AI suggestions - users see their own
CREATE POLICY "Users can view their own AI suggestions"
  ON ai_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI suggestions"
  ON ai_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- AI embeddings - org members can view
CREATE POLICY "Org members can view AI embeddings"
  ON ai_embeddings FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- AI predictions - org members can view
CREATE POLICY "Org members can view AI predictions"
  ON ai_predictions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- AI match scores - org members can view
CREATE POLICY "Org members can view AI match scores"
  ON ai_match_scores FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- AI extracted skills - org members can view
CREATE POLICY "Org members can view AI extracted skills"
  ON ai_extracted_skills FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- AI usage logs - users see their own
CREATE POLICY "Users can view their own AI usage"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update conversation stats
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET
    message_count = (SELECT COUNT(*) FROM ai_messages WHERE conversation_id = NEW.conversation_id),
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_stats_trigger
AFTER INSERT ON ai_messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- Function to expire old suggestions
CREATE OR REPLACE FUNCTION expire_old_suggestions()
RETURNS void AS $$
BEGIN
  UPDATE ai_suggestions
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get top match candidates for a job
CREATE OR REPLACE FUNCTION get_top_candidates_for_job(
  p_job_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_min_score DECIMAL DEFAULT 0.6
)
RETURNS TABLE (
  candidate_id UUID,
  overall_score DECIMAL,
  component_scores JSONB,
  match_reasons JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ams.candidate_id,
    ams.overall_score,
    ams.component_scores,
    ams.match_reasons
  FROM ai_match_scores ams
  WHERE ams.job_id = p_job_id
    AND ams.overall_score >= p_min_score
  ORDER BY ams.overall_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
