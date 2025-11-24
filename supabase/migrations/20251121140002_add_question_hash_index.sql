-- Add Question Hash Index
-- Created: 2025-11-21
-- Description: Add generated column + index for efficient question pattern matching

-- ============================================================================
-- ADD GENERATED COLUMN
-- ============================================================================

-- Add question_hash as a generated column (computed from question)
ALTER TABLE ai_mentor_chats
ADD COLUMN IF NOT EXISTS question_hash TEXT
GENERATED ALWAYS AS (MD5(LOWER(TRIM(question)))) STORED;

-- ============================================================================
-- ADD INDEX
-- ============================================================================

-- Create index on the generated column for fast lookups
CREATE INDEX IF NOT EXISTS idx_mentor_chats_question_hash
ON ai_mentor_chats(question_hash);

-- ============================================================================
-- UPDATE RECORD_QUESTION_PATTERN FUNCTION
-- ============================================================================

-- Update the function to use the indexed column instead of computing MD5 on every row
CREATE OR REPLACE FUNCTION record_question_pattern(
  p_question TEXT,
  p_topic_id UUID,
  p_user_id UUID,
  p_rating INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_pattern_hash TEXT;
  v_pattern_id UUID;
  v_canonical_question TEXT;
BEGIN
  -- Simple hash based on normalized question (lowercase, trimmed)
  v_pattern_hash := MD5(LOWER(TRIM(p_question)));

  -- Try to find existing pattern
  SELECT id, canonical_question INTO v_pattern_id, v_canonical_question
  FROM ai_question_patterns
  WHERE pattern_hash = v_pattern_hash;

  IF FOUND THEN
    -- Update existing pattern - NOW USING INDEXED COLUMN!
    UPDATE ai_question_patterns
    SET
      occurrence_count = occurrence_count + 1,
      unique_students = (
        SELECT COUNT(DISTINCT user_id)
        FROM ai_mentor_chats
        WHERE question_hash = v_pattern_hash  -- Uses index!
      ),
      avg_response_quality = (
        SELECT AVG(student_rating)
        FROM ai_mentor_chats
        WHERE question_hash = v_pattern_hash  -- Uses index!
        AND student_rating IS NOT NULL
      ),
      last_seen = NOW()
    WHERE pattern_hash = v_pattern_hash;
  ELSE
    -- Create new pattern
    INSERT INTO ai_question_patterns (
      pattern_hash,
      canonical_question,
      topic_id,
      occurrence_count,
      unique_students,
      avg_response_quality
    ) VALUES (
      v_pattern_hash,
      p_question,
      p_topic_id,
      1,
      1,
      p_rating
    )
    RETURNING id INTO v_pattern_id;
  END IF;

  RETURN v_pattern_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN ai_mentor_chats.question_hash IS 'MD5 hash of normalized question for fast pattern matching (generated column)';
COMMENT ON INDEX idx_mentor_chats_question_hash IS 'Index for fast question pattern lookups - avoids computing MD5 on every row';
