-- Migration 017: AI Foundation Infrastructure
-- Created: 2025-11-20
-- Epic: 2.5 - AI Infrastructure & Services
-- Sprint: 1 - Foundation Layer
--
-- This migration adds:
-- 1. RLS Helper Functions (CRITICAL - fixes Sprint 4 blocker #2)
-- 2. AI Conversations table (long-term memory)
-- 3. AI Embeddings table (RAG vector storage)
-- 4. AI Patterns table (extracted insights)
-- 5. RLS Policies for all tables
-- 6. Performance indexes
-- 7. Validation views

-- ============================================================================
-- PART 1: RLS HELPER FUNCTIONS (CRITICAL)
-- ============================================================================
-- These functions fix Sprint 4 blocker #2 by providing consistent auth checks

/**
 * Get current authenticated user ID
 *
 * @returns UUID of authenticated user or NULL if not authenticated
 */
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.uid();
$$;

COMMENT ON FUNCTION public.auth_user_id() IS 'Returns the authenticated user ID from auth.uid()';

/**
 * Get current authenticated user organization ID
 *
 * @returns UUID of user organization or NULL if not authenticated/no org
 */
CREATE OR REPLACE FUNCTION public.auth_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT organization_id
  FROM public.user_profiles
  WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.auth_user_org_id() IS 'Returns the organization_id for the authenticated user';

/**
 * Check if current user is an admin
 *
 * @returns TRUE if user has admin role, FALSE otherwise
 */
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
  );
$$;

COMMENT ON FUNCTION public.user_is_admin() IS 'Returns TRUE if authenticated user has admin role';

/**
 * Check if current user has a specific role
 *
 * @param role_name - Name of the role to check
 * @returns TRUE if user has the role, FALSE otherwise
 */
CREATE OR REPLACE FUNCTION public.user_has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = role_name
  );
$$;

COMMENT ON FUNCTION public.user_has_role(TEXT) IS 'Returns TRUE if authenticated user has the specified role';

-- ============================================================================
-- PART 2: AI CONVERSATIONS TABLE (Long-term Memory)
-- ============================================================================

/**
 * AI Conversations
 *
 * Stores long-term conversation history for AI agents.
 * Indexed for fast retrieval by user and timestamp.
 */
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL, -- 'code_mentor', 'employee_twin', 'activity_classifier', etc.
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent_type ON public.ai_conversations(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_metadata ON public.ai_conversations USING gin(metadata);

-- RLS Policies
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY ai_conversations_select_own
  ON public.ai_conversations
  FOR SELECT
  USING (user_id = auth_user_id());

-- Users can insert their own conversations
CREATE POLICY ai_conversations_insert_own
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (user_id = auth_user_id());

-- Users can update their own conversations
CREATE POLICY ai_conversations_update_own
  ON public.ai_conversations
  FOR UPDATE
  USING (user_id = auth_user_id());

-- Users can delete their own conversations
CREATE POLICY ai_conversations_delete_own
  ON public.ai_conversations
  FOR DELETE
  USING (user_id = auth_user_id());

-- Admins can view all conversations
CREATE POLICY ai_conversations_admin_all
  ON public.ai_conversations
  FOR ALL
  USING (user_is_admin());

COMMENT ON TABLE public.ai_conversations IS 'Long-term storage for AI agent conversations';
COMMENT ON COLUMN public.ai_conversations.agent_type IS 'Type of AI agent (code_mentor, employee_twin, etc.)';
COMMENT ON COLUMN public.ai_conversations.messages IS 'Array of messages in JSONB format';
COMMENT ON COLUMN public.ai_conversations.metadata IS 'Additional conversation metadata';

-- ============================================================================
-- PART 3: AI EMBEDDINGS TABLE (RAG Vector Storage)
-- ============================================================================

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

/**
 * AI Embeddings
 *
 * Stores text embeddings for semantic search (RAG).
 * Uses pgvector for cosine similarity search.
 */
CREATE TABLE IF NOT EXISTS public.ai_embeddings (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL, -- text-embedding-3-small dimensions
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_vector
  ON public.ai_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for metadata filtering
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_metadata
  ON public.ai_embeddings
  USING gin(metadata);

-- RLS Policies
ALTER TABLE public.ai_embeddings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read embeddings
CREATE POLICY ai_embeddings_select_authenticated
  ON public.ai_embeddings
  FOR SELECT
  USING (auth_user_id() IS NOT NULL);

-- Only admins can insert/update/delete embeddings
CREATE POLICY ai_embeddings_admin_modify
  ON public.ai_embeddings
  FOR ALL
  USING (user_is_admin());

COMMENT ON TABLE public.ai_embeddings IS 'Vector embeddings for semantic search (RAG)';
COMMENT ON COLUMN public.ai_embeddings.embedding IS '1536-dimensional vector from text-embedding-3-small';

-- ============================================================================
-- PART 4: VECTOR SEARCH FUNCTION
-- ============================================================================

/**
 * Search embeddings by cosine similarity
 *
 * @param query_embedding - Query vector (1536 dimensions)
 * @param match_count - Number of results to return
 * @param filter_metadata - Optional JSONB filter
 * @returns Ranked results by similarity
 */
CREATE OR REPLACE FUNCTION public.search_embeddings(
  query_embedding vector(1536),
  match_count INTEGER DEFAULT 5,
  filter_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.ai_embeddings e
  WHERE
    CASE
      WHEN filter_metadata IS NOT NULL THEN
        e.metadata @> filter_metadata
      ELSE TRUE
    END
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION public.search_embeddings IS 'Semantic search over embeddings using cosine similarity';

-- ============================================================================
-- PART 5: AI PATTERNS TABLE (Extracted Insights)
-- ============================================================================

/**
 * AI Patterns
 *
 * Stores extracted patterns from user conversations.
 * Used for personalization and insights.
 */
CREATE TABLE IF NOT EXISTS public.ai_patterns (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'question', 'struggle', 'preference', 'skill'
  description TEXT NOT NULL,
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_patterns_user_id ON public.ai_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON public.ai_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_last_seen ON public.ai_patterns(last_seen DESC);

-- RLS Policies
ALTER TABLE public.ai_patterns ENABLE ROW LEVEL SECURITY;

-- Users can view their own patterns
CREATE POLICY ai_patterns_select_own
  ON public.ai_patterns
  FOR SELECT
  USING (user_id = auth_user_id());

-- Users can insert their own patterns
CREATE POLICY ai_patterns_insert_own
  ON public.ai_patterns
  FOR INSERT
  WITH CHECK (user_id = auth_user_id());

-- Users can update their own patterns
CREATE POLICY ai_patterns_update_own
  ON public.ai_patterns
  FOR UPDATE
  USING (user_id = auth_user_id());

-- Admins can view all patterns
CREATE POLICY ai_patterns_admin_all
  ON public.ai_patterns
  FOR ALL
  USING (user_is_admin());

COMMENT ON TABLE public.ai_patterns IS 'Extracted patterns from user conversations';
COMMENT ON COLUMN public.ai_patterns.pattern_type IS 'Type of pattern (question, struggle, preference, skill)';

-- ============================================================================
-- PART 6: VALIDATION VIEW
-- ============================================================================

/**
 * Validation view for AI foundation infrastructure
 *
 * Verifies all components are correctly installed.
 */
CREATE OR REPLACE VIEW public.ai_foundation_validation AS
SELECT
  'RLS Functions' AS component,
  CASE WHEN COUNT(*) = 4 THEN 'OK' ELSE 'MISSING' END AS status
FROM pg_proc
WHERE proname IN ('auth_user_id', 'auth_user_org_id', 'user_is_admin', 'user_has_role')
  AND pronamespace = 'public'::regnamespace

UNION ALL

SELECT
  'AI Tables' AS component,
  CASE WHEN COUNT(*) = 3 THEN 'OK' ELSE 'MISSING' END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ai_conversations', 'ai_embeddings', 'ai_patterns')

UNION ALL

SELECT
  'pgvector Extension' AS component,
  CASE WHEN COUNT(*) = 1 THEN 'OK' ELSE 'NOT INSTALLED' END AS status
FROM pg_extension
WHERE extname = 'vector'

UNION ALL

SELECT
  'Vector Search Function' AS component,
  CASE WHEN COUNT(*) = 1 THEN 'OK' ELSE 'MISSING' END AS status
FROM pg_proc
WHERE proname = 'search_embeddings'
  AND pronamespace = 'public'::regnamespace;

COMMENT ON VIEW public.ai_foundation_validation IS 'Validation status for AI foundation infrastructure';

-- ============================================================================
-- ROLLBACK SCRIPT
-- ============================================================================
-- To rollback this migration, run:
-- DROP VIEW IF EXISTS public.ai_foundation_validation;
-- DROP FUNCTION IF EXISTS public.search_embeddings(vector, INTEGER, JSONB);
-- DROP TABLE IF EXISTS public.ai_patterns CASCADE;
-- DROP TABLE IF EXISTS public.ai_embeddings CASCADE;
-- DROP TABLE IF EXISTS public.ai_conversations CASCADE;
-- DROP FUNCTION IF EXISTS public.user_has_role(TEXT);
-- DROP FUNCTION IF EXISTS public.user_is_admin();
-- DROP FUNCTION IF EXISTS public.auth_user_org_id();
-- DROP FUNCTION IF EXISTS public.auth_user_id();
