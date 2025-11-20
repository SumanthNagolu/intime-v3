# Sprint 4 Architecture: Productivity & Employee Bots

**Author:** Architect Agent
**Date:** 2025-11-19
**Sprint:** Week 11-12
**Stories:** AI-PROD-001, AI-PROD-002, AI-PROD-003, AI-TWIN-001
**Total Points:** 21

---

## Overview

Sprint 4 delivers the **Productivity Tracking** and **Employee AI Twin** systems - critical components that differentiate InTime from competitors by providing 10× productivity insights and personalized AI assistance for each employee role.

### Core Capabilities

1. **Desktop Screenshot Agent** - Privacy-first screen capture (30s intervals)
2. **Activity Classification** - GPT-4o-mini vision API for activity categorization
3. **Daily Timeline Generator** - AI-powered productivity narratives
4. **Employee AI Twins** - Role-specific assistants (Recruiter, Trainer, Bench Sales, Admin)

### Architecture Principles

- **Privacy by Design** - Employees own their data; managers see aggregates only
- **Event-Driven** - All components communicate via event bus
- **Cost-Optimized** - Batch processing, caching, rate limiting
- **Multi-Tenant** - Full organization isolation via RLS

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Electron Desktop App                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Screenshot Agent (AI-PROD-001)                           │  │
│  │  • Capture every 30s                                      │  │
│  │  • Compress (1280px max, 50% quality JPEG)               │  │
│  │  • Sensitive window detection                             │  │
│  │  • Offline queue + retry                                  │  │
│  └─────────────────┬─────────────────────────────────────────┘  │
│                    │ Upload                                      │
└────────────────────┼─────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Supabase Storage (employee-screenshots)             │
│  • Per-user folders: {user_id}/{timestamp}.jpg                  │
│  • 30-day retention policy                                      │
│  • RLS: Employee owns data                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL: employee_screenshots (metadata table)              │
│  • filename, file_size, captured_at                             │
│  • analyzed (boolean), activity_category, confidence            │
│  • RLS: Employee SELECT own; Admin SELECT all                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼ Event: screenshot.captured
┌─────────────────────────────────────────────────────────────────┐
│  Activity Classifier Service (AI-PROD-002)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Batch Processor (runs every hour)                       │  │
│  │  • Fetch unanalyzed screenshots                          │  │
│  │  • Batch 10 at a time (rate limiting)                    │  │
│  │  • Create signed URLs (60s expiry)                       │  │
│  │  • Call GPT-4o-mini vision API                           │  │
│  │  • Store classification result                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼ Event: activity.classified
┌─────────────────────────────────────────────────────────────────┐
│  Timeline Generator (AI-PROD-003)                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Daily Batch Job (runs at 6am)                           │  │
│  │  • Aggregate previous day's activities                   │  │
│  │  • Calculate productive hours                            │  │
│  │  • Generate AI narrative (BaseAgent)                     │  │
│  │  • Store in productivity_reports                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼ Reports available
┌─────────────────────────────────────────────────────────────────┐
│  Employee Dashboard (Next.js)                                   │
│  • Employee sees: own screenshots + reports                     │
│  • Manager sees: aggregated metrics only (no screenshots)       │
│  • Privacy controls: pause tracking, view settings              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Employee AI Twin Framework (AI-TWIN-001)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Role-Specific Twins (extends BaseAgent)                 │  │
│  │  • RecruiterTwin: candidate pipeline, follow-ups         │  │
│  │  • TrainerTwin: student progress, grading                │  │
│  │  • BenchSalesTwin: consultant placements, rates          │  │
│  │  • AdminTwin: system health, reports                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Features                                                 │  │
│  │  • Morning briefings (6am, personalized)                 │  │
│  │  • Proactive suggestions (3×/day)                        │  │
│  │  • On-demand Q&A                                         │  │
│  │  • Context-aware (role data + activity history)          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Consolidated Migration: `016_add_productivity_tracking.sql`

This migration creates all tables for Sprint 4 features.

```sql
-- ============================================================================
-- Migration: 016_add_productivity_tracking.sql
-- Description: Productivity tracking and Employee AI Twins infrastructure
-- Stories: AI-PROD-001, AI-PROD-002, AI-PROD-003, AI-TWIN-001
-- Author: InTime Development Team
-- Date: 2025-11-19
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

CREATE TYPE activity_category AS ENUM (
  'coding',
  'email',
  'meeting',
  'documentation',
  'research',
  'social_media',
  'idle'
);

CREATE TYPE employee_twin_role AS ENUM (
  'recruiter',
  'trainer',
  'bench_sales',
  'admin'
);

COMMENT ON TYPE activity_category IS 'Classification categories for employee activities';
COMMENT ON TYPE employee_twin_role IS 'Role types for personalized AI twins';

-- ----------------------------------------------------------------------------
-- TABLE: employee_screenshots
-- Description: Metadata for captured screenshots (AI-PROD-001)
-- Privacy: Employees see own; Admins see all
-- Retention: Auto-delete after 30 days
-- ----------------------------------------------------------------------------

CREATE TABLE employee_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Screenshot metadata
  filename TEXT NOT NULL, -- Format: {user_id}/{timestamp}.jpg
  file_size INTEGER NOT NULL, -- Bytes
  captured_at TIMESTAMPTZ NOT NULL,

  -- Classification results (AI-PROD-002)
  analyzed BOOLEAN DEFAULT FALSE,
  activity_category activity_category,
  confidence NUMERIC(3, 2), -- 0.00 to 1.00
  reasoning TEXT, -- AI's explanation

  -- Privacy flags
  is_sensitive BOOLEAN DEFAULT FALSE, -- Marked if sensitive window detected
  is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete by user

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes
CREATE INDEX idx_screenshots_user_id ON employee_screenshots(user_id);
CREATE INDEX idx_screenshots_org_id ON employee_screenshots(org_id);
CREATE INDEX idx_screenshots_captured_at ON employee_screenshots(captured_at DESC);
CREATE INDEX idx_screenshots_analyzed ON employee_screenshots(analyzed) WHERE NOT analyzed;
CREATE INDEX idx_screenshots_category ON employee_screenshots(activity_category) WHERE activity_category IS NOT NULL;

-- Comments
COMMENT ON TABLE employee_screenshots IS 'Metadata for captured employee screenshots (productivity tracking)';
COMMENT ON COLUMN employee_screenshots.filename IS 'Storage path in Supabase Storage (employee-screenshots bucket)';
COMMENT ON COLUMN employee_screenshots.analyzed IS 'TRUE if AI has classified the activity';
COMMENT ON COLUMN employee_screenshots.is_sensitive IS 'TRUE if sensitive window was active (e.g., password manager)';

-- ----------------------------------------------------------------------------
-- TABLE: productivity_reports
-- Description: AI-generated daily productivity reports (AI-PROD-003)
-- Privacy: Employees see own; Managers see team aggregates
-- ----------------------------------------------------------------------------

CREATE TABLE productivity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Report metadata
  date DATE NOT NULL,

  -- AI-generated content
  summary TEXT NOT NULL, -- Narrative overview of the day
  productive_hours NUMERIC(5, 2) NOT NULL, -- Hours spent on productive activities
  top_activities JSONB NOT NULL, -- [{category: 'coding', percentage: 45}, ...]
  insights JSONB NOT NULL, -- ['Pattern identified: Deep work 9-11am', ...]
  recommendations JSONB NOT NULL, -- ['Consider blocking calendar for focus time', ...]

  -- Raw metrics
  total_screenshots INTEGER NOT NULL DEFAULT 0,
  analyzed_screenshots INTEGER NOT NULL DEFAULT 0,
  activity_breakdown JSONB, -- {coding: 120, email: 45, meeting: 80, ...}

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_reports_user_date ON productivity_reports(user_id, date DESC);
CREATE INDEX idx_reports_org_date ON productivity_reports(org_id, date DESC);
CREATE INDEX idx_reports_date ON productivity_reports(date DESC);

-- Comments
COMMENT ON TABLE productivity_reports IS 'AI-generated daily productivity reports';
COMMENT ON COLUMN productivity_reports.summary IS 'Natural language summary of the day (generated by AI)';
COMMENT ON COLUMN productivity_reports.productive_hours IS 'Total hours spent on productive activities (coding, meetings, etc.)';
COMMENT ON COLUMN productivity_reports.top_activities IS 'Top 3 activities by time spent (JSON array)';

-- ----------------------------------------------------------------------------
-- TABLE: employee_twin_interactions
-- Description: Interaction history with Employee AI Twins (AI-TWIN-001)
-- Used for learning patterns and improving suggestions
-- ----------------------------------------------------------------------------

CREATE TABLE employee_twin_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Twin context
  twin_role employee_twin_role NOT NULL,
  interaction_type TEXT NOT NULL, -- 'morning_briefing', 'suggestion', 'question', 'feedback'

  -- Content
  prompt TEXT, -- User's question or NULL for briefings
  response TEXT NOT NULL, -- AI's response
  context JSONB, -- Role-specific context used for response

  -- Quality metrics
  was_helpful BOOLEAN, -- User feedback (thumbs up/down)
  user_feedback TEXT, -- Optional text feedback

  -- AI model tracking
  model_used TEXT, -- 'gpt-4o-mini', 'gpt-4o', 'claude-sonnet-4-5'
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6), -- Cost in USD
  latency_ms INTEGER, -- Response time in milliseconds

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_twin_interactions_user_id ON employee_twin_interactions(user_id);
CREATE INDEX idx_twin_interactions_org_id ON employee_twin_interactions(org_id);
CREATE INDEX idx_twin_interactions_role ON employee_twin_interactions(twin_role);
CREATE INDEX idx_twin_interactions_type ON employee_twin_interactions(interaction_type);
CREATE INDEX idx_twin_interactions_created_at ON employee_twin_interactions(created_at DESC);
CREATE INDEX idx_twin_interactions_helpful ON employee_twin_interactions(was_helpful) WHERE was_helpful IS NOT NULL;

-- Comments
COMMENT ON TABLE employee_twin_interactions IS 'Interaction history with Employee AI Twins';
COMMENT ON COLUMN employee_twin_interactions.twin_role IS 'Which twin the user interacted with';
COMMENT ON COLUMN employee_twin_interactions.was_helpful IS 'User feedback on response quality';

-- ----------------------------------------------------------------------------
-- TABLE: twin_proactive_suggestions
-- Description: Scheduled proactive suggestions from AI Twins
-- Generated 3× per day based on activity patterns
-- ----------------------------------------------------------------------------

CREATE TABLE twin_proactive_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Twin context
  twin_role employee_twin_role NOT NULL,

  -- Suggestion content
  suggestion TEXT NOT NULL, -- The proactive suggestion
  reasoning TEXT, -- Why this suggestion was made
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  category TEXT, -- 'followup', 'deadline', 'opportunity', 'warning'

  -- Delivery
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  actioned BOOLEAN DEFAULT FALSE, -- User took action
  actioned_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Suggestion no longer relevant after this time
);

-- Indexes
CREATE INDEX idx_suggestions_user_id ON twin_proactive_suggestions(user_id);
CREATE INDEX idx_suggestions_org_id ON twin_proactive_suggestions(org_id);
CREATE INDEX idx_suggestions_delivered ON twin_proactive_suggestions(delivered) WHERE NOT delivered;
CREATE INDEX idx_suggestions_priority ON twin_proactive_suggestions(priority);
CREATE INDEX idx_suggestions_expires_at ON twin_proactive_suggestions(expires_at) WHERE NOT delivered;

-- Comments
COMMENT ON TABLE twin_proactive_suggestions IS 'Proactive suggestions generated by AI Twins';
COMMENT ON COLUMN twin_proactive_suggestions.suggestion IS 'The actionable suggestion text';
COMMENT ON COLUMN twin_proactive_suggestions.actioned IS 'TRUE if user took action on the suggestion';

-- ----------------------------------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE employee_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_twin_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_proactive_suggestions ENABLE ROW LEVEL SECURITY;

-- employee_screenshots: Users see own; Admins see all in org
CREATE POLICY "Users can view own screenshots"
  ON employee_screenshots
  FOR SELECT
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

CREATE POLICY "Admins can view all screenshots in org"
  ON employee_screenshots
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND (user_is_admin() OR user_has_role('productivity_admin'))
  );

CREATE POLICY "Users can insert own screenshots"
  ON employee_screenshots
  FOR INSERT
  WITH CHECK (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

CREATE POLICY "Users can soft delete own screenshots"
  ON employee_screenshots
  FOR UPDATE
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

-- productivity_reports: Users see own; Managers see team
CREATE POLICY "Users can view own reports"
  ON productivity_reports
  FOR SELECT
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

CREATE POLICY "Managers can view team reports"
  ON productivity_reports
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND (
      user_is_admin()
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = productivity_reports.user_id
          AND employee_manager_id = auth_user_id()
      )
    )
  );

CREATE POLICY "System can insert reports"
  ON productivity_reports
  FOR INSERT
  WITH CHECK (
    org_id = auth_user_org_id()
  );

-- employee_twin_interactions: Users see own only
CREATE POLICY "Users can view own twin interactions"
  ON employee_twin_interactions
  FOR SELECT
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

CREATE POLICY "Users can insert own twin interactions"
  ON employee_twin_interactions
  FOR INSERT
  WITH CHECK (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

CREATE POLICY "Users can update own twin interactions"
  ON employee_twin_interactions
  FOR UPDATE
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

-- twin_proactive_suggestions: Users see own only
CREATE POLICY "Users can view own suggestions"
  ON twin_proactive_suggestions
  FOR SELECT
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

CREATE POLICY "System can insert suggestions"
  ON twin_proactive_suggestions
  FOR INSERT
  WITH CHECK (
    org_id = auth_user_org_id()
  );

CREATE POLICY "Users can update own suggestions"
  ON twin_proactive_suggestions
  FOR UPDATE
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

-- ----------------------------------------------------------------------------
-- FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function: Auto-cleanup old screenshots (30 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_screenshots()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Soft delete screenshots older than 30 days
  UPDATE employee_screenshots
  SET deleted_at = NOW(), is_deleted = TRUE
  WHERE captured_at < NOW() - INTERVAL '30 days'
    AND deleted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_old_screenshots IS 'Auto-cleanup screenshots older than 30 days (privacy policy)';

-- Function: Get daily activity summary for user
CREATE OR REPLACE FUNCTION get_daily_activity_summary(
  p_user_id UUID,
  p_date DATE
)
RETURNS TABLE (
  total_screenshots BIGINT,
  analyzed_screenshots BIGINT,
  coding_count BIGINT,
  email_count BIGINT,
  meeting_count BIGINT,
  documentation_count BIGINT,
  research_count BIGINT,
  social_media_count BIGINT,
  idle_count BIGINT,
  productive_hours NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_screenshots,
    COUNT(*) FILTER (WHERE analyzed = TRUE) AS analyzed_screenshots,
    COUNT(*) FILTER (WHERE activity_category = 'coding') AS coding_count,
    COUNT(*) FILTER (WHERE activity_category = 'email') AS email_count,
    COUNT(*) FILTER (WHERE activity_category = 'meeting') AS meeting_count,
    COUNT(*) FILTER (WHERE activity_category = 'documentation') AS documentation_count,
    COUNT(*) FILTER (WHERE activity_category = 'research') AS research_count,
    COUNT(*) FILTER (WHERE activity_category = 'social_media') AS social_media_count,
    COUNT(*) FILTER (WHERE activity_category = 'idle') AS idle_count,
    -- Calculate productive hours (30 seconds per screenshot)
    (
      COUNT(*) FILTER (
        WHERE activity_category IN ('coding', 'email', 'meeting', 'documentation', 'research')
      ) * 30.0 / 3600.0
    )::NUMERIC(5, 2) AS productive_hours
  FROM employee_screenshots
  WHERE user_id = p_user_id
    AND captured_at >= p_date::TIMESTAMPTZ
    AND captured_at < (p_date + INTERVAL '1 day')::TIMESTAMPTZ
    AND is_deleted = FALSE;
END;
$$;

COMMENT ON FUNCTION get_daily_activity_summary IS 'Get activity summary for a user on a specific date';

-- Function: Check if user needs follow-up (for twin suggestions)
CREATE OR REPLACE FUNCTION get_followup_candidates(p_user_id UUID)
RETURNS TABLE (
  candidate_id UUID,
  candidate_name TEXT,
  days_since_contact INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder - actual implementation depends on candidates table
  -- Will be completed when recruiting module is implemented
  RETURN QUERY
  SELECT
    NULL::UUID AS candidate_id,
    NULL::TEXT AS candidate_name,
    NULL::INTEGER AS days_since_contact
  LIMIT 0;
END;
$$;

COMMENT ON FUNCTION get_followup_candidates IS 'Get candidates needing follow-up (for recruiter twin)';

-- ----------------------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------------------

-- Trigger: Update updated_at timestamp
CREATE TRIGGER set_timestamp_employee_screenshots
BEFORE UPDATE ON employee_screenshots
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_productivity_reports
BEFORE UPDATE ON productivity_reports
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ----------------------------------------------------------------------------
-- STORAGE BUCKET
-- ----------------------------------------------------------------------------

-- Note: Supabase Storage buckets are created via Supabase Dashboard or CLI
-- Bucket name: 'employee-screenshots'
-- Privacy: Private (RLS policies apply)
-- File size limit: 5MB per file
-- Allowed MIME types: image/jpeg, image/png

-- Storage RLS Policies (apply via Supabase Dashboard):
-- 1. Users can upload to own folder:
--    bucket_id = 'employee-screenshots'
--    AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 2. Users can view own screenshots:
--    bucket_id = 'employee-screenshots'
--    AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 3. Admins can view all screenshots:
--    bucket_id = 'employee-screenshots'
--    AND user_is_admin()

-- ----------------------------------------------------------------------------
-- VALIDATION VIEWS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_productivity_tracking_status AS
SELECT
  'employee_screenshots' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(*) FILTER (WHERE analyzed = TRUE) AS analyzed_count,
  COUNT(*) FILTER (WHERE is_deleted = TRUE) AS soft_deleted_count
FROM employee_screenshots
UNION ALL
SELECT
  'productivity_reports' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT user_id) AS unique_users,
  NULL AS analyzed_count,
  NULL AS soft_deleted_count
FROM productivity_reports
UNION ALL
SELECT
  'employee_twin_interactions' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(*) FILTER (WHERE was_helpful = TRUE) AS helpful_count,
  NULL AS soft_deleted_count
FROM employee_twin_interactions
UNION ALL
SELECT
  'twin_proactive_suggestions' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(*) FILTER (WHERE actioned = TRUE) AS actioned_count,
  NULL AS soft_deleted_count
FROM twin_proactive_suggestions;

COMMENT ON VIEW v_productivity_tracking_status IS 'Validation view for productivity tracking data';

-- ----------------------------------------------------------------------------
-- SCHEDULED JOBS (Supabase pg_cron)
-- ----------------------------------------------------------------------------

-- Note: These are configured via Supabase Dashboard or pg_cron extension
--
-- Job 1: Cleanup old screenshots (daily at 2am)
-- SELECT cron.schedule(
--   'cleanup-old-screenshots',
--   '0 2 * * *',
--   'SELECT cleanup_old_screenshots();'
-- );
--
-- Job 2: Generate daily reports (daily at 6am)
-- SELECT cron.schedule(
--   'generate-daily-reports',
--   '0 6 * * *',
--   'SELECT generate_daily_productivity_reports();'
-- );

-- ----------------------------------------------------------------------------
-- VALIDATION QUERIES
-- ----------------------------------------------------------------------------

-- Verify tables created:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%screenshot%' OR tablename LIKE '%productivity%' OR tablename LIKE '%twin%';

-- Verify RLS enabled:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('employee_screenshots', 'productivity_reports', 'employee_twin_interactions', 'twin_proactive_suggestions');

-- Verify indexes:
-- SELECT tablename, indexname FROM pg_indexes WHERE tablename IN ('employee_screenshots', 'productivity_reports', 'employee_twin_interactions', 'twin_proactive_suggestions') ORDER BY tablename, indexname;
```

---

## API Contracts

### TypeScript Interfaces

```typescript
// /src/types/productivity.ts

import { Database } from './database.types'; // Supabase generated types

// ============================================================================
// SCREENSHOT AGENT
// ============================================================================

export type ActivityCategory =
  | 'coding'
  | 'email'
  | 'meeting'
  | 'documentation'
  | 'research'
  | 'social_media'
  | 'idle';

export interface ScreenshotMetadata {
  id: string;
  orgId: string;
  userId: string;
  filename: string;
  fileSize: number;
  capturedAt: string; // ISO timestamp
  analyzed: boolean;
  activityCategory?: ActivityCategory;
  confidence?: number;
  reasoning?: string;
  isSensitive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface ScreenshotAgentConfig {
  userId: string;
  captureInterval: number; // milliseconds (default: 30000)
  compressionQuality: number; // 0-100 (default: 50)
  maxWidth: number; // pixels (default: 1280)
  sensitiveKeywords: string[]; // window titles to skip
}

export interface ScreenshotUploadResult {
  success: boolean;
  filename?: string;
  error?: string;
}

// ============================================================================
// ACTIVITY CLASSIFICATION
// ============================================================================

export interface ActivityClassification {
  category: ActivityCategory;
  confidence: number; // 0.00 to 1.00
  reasoning: string;
  timestamp: string;
}

export interface ClassificationRequest {
  screenshotId: string;
}

export interface ClassificationResponse {
  success: boolean;
  classification?: ActivityClassification;
  error?: string;
}

export interface BatchClassificationRequest {
  userId: string;
  date: string; // YYYY-MM-DD
}

export interface BatchClassificationResponse {
  success: boolean;
  classifiedCount: number;
  totalCount: number;
  errors?: string[];
}

// ============================================================================
// PRODUCTIVITY REPORTS
// ============================================================================

export interface ActivityBreakdown {
  category: ActivityCategory;
  count: number;
  percentage: number;
  hours: number;
}

export interface ProductivityReport {
  id: string;
  orgId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  summary: string; // AI-generated narrative
  productiveHours: number;
  topActivities: ActivityBreakdown[];
  insights: string[];
  recommendations: string[];
  totalScreenshots: number;
  analyzedScreenshots: number;
  activityBreakdown: Record<ActivityCategory, number>;
  createdAt: string;
}

export interface GenerateReportRequest {
  userId: string;
  date: string; // YYYY-MM-DD
}

export interface GenerateReportResponse {
  success: boolean;
  report?: ProductivityReport;
  error?: string;
}

// ============================================================================
// EMPLOYEE AI TWINS
// ============================================================================

export type TwinRole = 'recruiter' | 'trainer' | 'bench_sales' | 'admin';

export type InteractionType =
  | 'morning_briefing'
  | 'suggestion'
  | 'question'
  | 'feedback';

export interface TwinInteraction {
  id: string;
  orgId: string;
  userId: string;
  twinRole: TwinRole;
  interactionType: InteractionType;
  prompt?: string; // NULL for briefings
  response: string;
  context?: Record<string, any>;
  wasHelpful?: boolean;
  userFeedback?: string;
  modelUsed: string;
  tokensUsed: number;
  costUsd: number;
  latencyMs: number;
  createdAt: string;
}

export interface MorningBriefingRequest {
  userId: string;
  role: TwinRole;
}

export interface MorningBriefingResponse {
  success: boolean;
  briefing?: string;
  error?: string;
}

export interface ProactiveSuggestion {
  id: string;
  orgId: string;
  userId: string;
  twinRole: TwinRole;
  suggestion: string;
  reasoning?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  delivered: boolean;
  deliveredAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  actioned: boolean;
  actionedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface GenerateSuggestionRequest {
  userId: string;
  role: TwinRole;
}

export interface GenerateSuggestionResponse {
  success: boolean;
  suggestion?: ProactiveSuggestion;
  error?: string;
}

export interface TwinQueryRequest {
  userId: string;
  role: TwinRole;
  question: string;
  conversationId?: string;
}

export interface TwinQueryResponse {
  success: boolean;
  answer?: string;
  conversationId?: string;
  error?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ProductivityError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ProductivityError';
  }
}

export const ProductivityErrorCodes = {
  SCREENSHOT_UPLOAD_FAILED: 'SCREENSHOT_UPLOAD_FAILED',
  CLASSIFICATION_FAILED: 'CLASSIFICATION_FAILED',
  REPORT_GENERATION_FAILED: 'REPORT_GENERATION_FAILED',
  TWIN_QUERY_FAILED: 'TWIN_QUERY_FAILED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT: 'INVALID_INPUT',
} as const;
```

### Service Layer Interfaces

```typescript
// /src/lib/productivity/interfaces.ts

import {
  ActivityClassification,
  ProductivityReport,
  TwinInteraction,
  ProactiveSuggestion,
} from '@/types/productivity';

// Screenshot Agent Interface
export interface IScreenshotAgent {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isActive(): boolean;
  getConfig(): ScreenshotAgentConfig;
  updateConfig(config: Partial<ScreenshotAgentConfig>): void;
}

// Activity Classifier Interface
export interface IActivityClassifier {
  classifyScreenshot(screenshotId: string): Promise<ActivityClassification>;
  batchClassify(userId: string, date: string): Promise<number>;
  getDailySummary(userId: string, date: string): Promise<{
    totalScreenshots: number;
    analyzed: number;
    byCategory: Record<ActivityCategory, number>;
    productiveHours: number;
  }>;
}

// Timeline Generator Interface
export interface ITimelineGenerator {
  generateDailyReport(userId: string, date: string): Promise<ProductivityReport>;
  batchGenerateReports(date: string): Promise<number>;
  exportReport(reportId: string, format: 'pdf' | 'json'): Promise<Buffer>;
}

// Employee Twin Interface
export interface IEmployeeTwin {
  generateMorningBriefing(): Promise<string>;
  generateProactiveSuggestion(): Promise<string | null>;
  query(question: string, conversationId?: string): Promise<{
    answer: string;
    conversationId: string;
  }>;
  getRole(): TwinRole;
  getInteractionHistory(limit?: number): Promise<TwinInteraction[]>;
}
```

---

## Component Architecture

### File Structure

```
intime-v3/
├── electron/                           # Electron desktop app
│   ├── src/
│   │   ├── main.ts                    # Electron main process
│   │   ├── preload.ts                 # Preload script (IPC)
│   │   ├── screenshot-agent.ts        # AI-PROD-001
│   │   └── tray-manager.ts            # System tray integration
│   ├── package.json
│   └── electron-builder.json          # Build configuration
│
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── productivity/
│   │           ├── page.tsx           # Main productivity dashboard
│   │           ├── screenshots/
│   │           │   └── page.tsx       # Screenshot viewer
│   │           ├── reports/
│   │           │   └── page.tsx       # Daily reports
│   │           └── twin/
│   │               └── page.tsx       # AI Twin interface
│   │
│   ├── components/
│   │   └── productivity/
│   │       ├── ActivityChart.tsx      # Activity breakdown chart
│   │       ├── ProductivityCalendar.tsx # Monthly calendar view
│   │       ├── ScreenshotGrid.tsx     # Screenshot thumbnail grid
│   │       ├── TimelineCard.tsx       # Daily timeline summary
│   │       └── TwinChatInterface.tsx  # AI Twin chat UI
│   │
│   ├── lib/
│   │   └── productivity/
│   │       ├── screenshot-agent.ts    # Electron IPC client
│   │       ├── ActivityClassifier.ts  # AI-PROD-002
│   │       ├── TimelineGenerator.ts   # AI-PROD-003
│   │       └── twins/
│   │           ├── EmployeeTwin.ts    # Base twin class
│   │           ├── RecruiterTwin.ts   # Role-specific twin
│   │           ├── TrainerTwin.ts     # Role-specific twin
│   │           ├── BenchSalesTwin.ts  # Role-specific twin
│   │           └── AdminTwin.ts       # Role-specific twin
│   │
│   └── server/
│       └── routers/
│           └── productivity.ts        # tRPC router for productivity
│
└── tests/
    ├── e2e/
    │   ├── screenshot-agent.spec.ts
    │   └── twin-interaction.spec.ts
    └── unit/
        ├── ActivityClassifier.test.ts
        ├── TimelineGenerator.test.ts
        └── EmployeeTwin.test.ts
```

### React Component Examples

```typescript
// /src/components/productivity/ActivityChart.tsx

'use client';

import { useMemo } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { ActivityCategory } from '@/types/productivity';

const ACTIVITY_COLORS: Record<ActivityCategory, string> = {
  coding: '#10b981',      // green
  email: '#3b82f6',       // blue
  meeting: '#f59e0b',     // amber
  documentation: '#8b5cf6', // purple
  research: '#06b6d4',    // cyan
  social_media: '#ef4444', // red
  idle: '#6b7280',        // gray
};

interface ActivityChartProps {
  activities: Array<{
    category: ActivityCategory;
    count: number;
    percentage: number;
  }>;
}

export function ActivityChart({ activities }: ActivityChartProps) {
  const data = useMemo(() => {
    return activities
      .filter(a => a.count > 0)
      .map(a => ({
        name: a.category,
        value: a.percentage,
        count: a.count,
      }));
  }, [activities]);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry.name}: ${entry.value}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={ACTIVITY_COLORS[entry.name as ActivityCategory]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## Integration Design

### Supabase Storage Integration

```typescript
// /src/lib/productivity/storage.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class ScreenshotStorage {
  private bucketName = 'employee-screenshots';

  /**
   * Upload screenshot to Supabase Storage
   */
  async upload(
    userId: string,
    screenshot: Buffer,
    timestamp: Date
  ): Promise<{ success: boolean; filename?: string; error?: string }> {
    const filename = `${userId}/${timestamp.toISOString()}.jpg`;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(filename, screenshot, {
        contentType: 'image/jpeg',
        upsert: false,
        cacheControl: '3600', // 1 hour cache
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, filename };
  }

  /**
   * Get signed URL for screenshot (60s expiry for AI classification)
   */
  async getSignedUrl(filename: string): Promise<{ signedUrl: string | null; error?: string }> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filename, 60); // 60 seconds

    if (error) {
      return { signedUrl: null, error: error.message };
    }

    return { signedUrl: data.signedUrl };
  }

  /**
   * Delete screenshot from storage
   */
  async delete(filename: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([filename]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Batch delete old screenshots (called by cleanup job)
   */
  async batchDelete(filenames: string[]): Promise<{ success: boolean; deletedCount: number }> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .remove(filenames);

    if (error) {
      console.error('[ScreenshotStorage] Batch delete failed:', error);
      return { success: false, deletedCount: 0 };
    }

    return { success: true, deletedCount: data?.length || 0 };
  }
}
```

### OpenAI Vision API Integration

```typescript
// /src/lib/productivity/vision-api.ts

import OpenAI from 'openai';
import { ActivityCategory, ActivityClassification } from '@/types/productivity';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class VisionClassifier {
  /**
   * Classify activity from screenshot URL
   */
  async classify(imageUrl: string): Promise<Omit<ActivityClassification, 'timestamp'>> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Classify the activity shown in this screenshot into ONE category:

CATEGORIES:
- coding: Writing/editing code (IDE, text editor with code)
- email: Reading/writing emails (Gmail, Outlook, etc.)
- meeting: Video calls (Zoom, Teams, Google Meet)
- documentation: Writing docs, wikis, markdown files
- research: Reading articles, Stack Overflow, documentation sites
- social_media: Twitter, LinkedIn, Reddit, non-work sites
- idle: No activity, lock screen, blank screen

Return ONLY a JSON object:
{
  "category": "coding",
  "confidence": 0.95,
  "reasoning": "Visual Studio Code open with TypeScript file visible"
}`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
        response_format: { type: 'json_object' }, // Enforce JSON response
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);

      return {
        category: parsed.category as ActivityCategory,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      console.error('[VisionClassifier] Classification failed:', error);

      // Fallback classification
      return {
        category: 'idle',
        confidence: 0.1,
        reasoning: 'Failed to classify - API error',
      };
    }
  }

  /**
   * Batch classify multiple screenshots with rate limiting
   */
  async batchClassify(imageUrls: string[]): Promise<Array<ActivityClassification>> {
    const BATCH_SIZE = 10; // Process 10 at a time
    const results: ActivityClassification[] = [];

    for (let i = 0; i < imageUrls.length; i += BATCH_SIZE) {
      const batch = imageUrls.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (url) => {
          const classification = await this.classify(url);
          return {
            ...classification,
            timestamp: new Date().toISOString(),
          };
        })
      );

      results.push(...batchResults);

      // Rate limiting: 500 requests/min max for GPT-4o-mini
      // Wait 1 second between batches
      if (i + BATCH_SIZE < imageUrls.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}
```

### BaseAgent Integration

```typescript
// /src/lib/productivity/twins/EmployeeTwin.ts

import { BaseAgent, AgentConfig } from '@/lib/ai/agents/BaseAgent';
import { TwinRole, TwinInteraction } from '@/types/productivity';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class EmployeeTwin extends BaseAgent {
  protected role: TwinRole;
  protected employeeId: string;

  constructor(employeeId: string, role: TwinRole) {
    super({
      name: `${role}_twin`,
      useCase: 'employee_twin',
      defaultModel: 'gpt-4o-mini', // Cost-optimized
      systemPrompt: EmployeeTwin.getRolePrompt(role),
      requiresReasoning: false, // Use GPT-4o-mini for speed
    });

    this.employeeId = employeeId;
    this.role = role;
  }

  /**
   * Get role-specific system prompt
   */
  private static getRolePrompt(role: TwinRole): string {
    const prompts: Record<TwinRole, string> = {
      recruiter: `You are an AI assistant for a technical recruiter specializing in Guidewire placements.

YOUR ROLE:
- Track candidate pipeline (sourcing → screening → interview → placement)
- Suggest next best actions for each candidate
- Remind about follow-ups and deadlines
- Provide resume matching insights
- Optimize job description wording
- Track placement metrics

BE PROACTIVE:
- "You have 3 candidates waiting for follow-up"
- "Job req #42 has been open for 2 weeks - suggest posting to LinkedIn"
- "Candidate John Doe matches 85% with PolicyCenter role"

TONE: Professional, action-oriented, data-driven`,

      trainer: `You are an AI assistant for a Guidewire trainer.

YOUR ROLE:
- Track student progress and struggles
- Suggest personalized interventions
- Remind about grading deadlines
- Identify at-risk students
- Recommend curriculum improvements
- Prepare class materials

BE PROACTIVE:
- "Student Jane is struggling with Rating module - schedule 1:1"
- "Quiz grades due tomorrow for Module 5"
- "3 students haven't logged in this week"

TONE: Supportive, educator-focused, student-centric`,

      bench_sales: `You are an AI assistant for a bench sales consultant.

YOUR ROLE:
- Track bench consultants (availability, skills, rates)
- Match consultants to client requirements
- Suggest outreach strategies
- Monitor market rates
- Track placement timelines (30-60 day goal)
- Optimize consultant marketing

BE PROACTIVE:
- "Consultant Mike is on bench for 15 days - 3 matching reqs found"
- "Client ABC looking for ClaimCenter dev - Sarah is 90% match"
- "Market rate for PolicyCenter increased 10% this month"

TONE: Sales-oriented, metrics-focused, urgency-driven`,

      admin: `You are an AI assistant for a platform administrator.

YOUR ROLE:
- Monitor system health
- Track user activity and anomalies
- Suggest optimizations
- Alert on security issues
- Generate reports
- Coordinate cross-team tasks

BE PROACTIVE:
- "Database size increased 50% this week - consider archiving"
- "User login errors spiked - check auth service"
- "Weekly report generation scheduled for tomorrow"

TONE: Technical, precise, systems-thinking`,
    };

    return prompts[role];
  }

  /**
   * Generate morning briefing (called at 6am daily)
   */
  async generateMorningBriefing(): Promise<string> {
    const context = await this.gatherEmployeeContext();

    const prompt = `Generate a personalized morning briefing for this ${this.role}.

CONTEXT:
${JSON.stringify(context, null, 2)}

BRIEFING STRUCTURE:
1. Greeting (personalized with name)
2. Today's priorities (top 3 tasks)
3. Urgent items (deadlines, follow-ups)
4. Opportunities (proactive suggestions)
5. Motivational close

Keep it concise (200-300 words), friendly, and actionable.`;

    const response = await this.query(
      prompt,
      {
        conversationId: `briefing-${Date.now()}`,
        userId: this.employeeId,
        userType: 'employee',
        metadata: { action: 'morning_briefing', role: this.role },
      },
      {
        temperature: 0.7,
        maxTokens: 512,
      }
    );

    // Log interaction
    await this.logInteraction({
      interactionType: 'morning_briefing',
      prompt: null,
      response: response.content,
      context,
      modelUsed: response.model,
      tokensUsed: response.tokensUsed,
      costUsd: response.cost,
      latencyMs: response.latency,
    });

    return response.content;
  }

  /**
   * Gather role-specific context for AI
   */
  private async gatherEmployeeContext(): Promise<any> {
    // Get employee profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', this.employeeId)
      .single();

    // Role-specific context (placeholder - actual implementation varies by role)
    let roleContext = {};

    switch (this.role) {
      case 'recruiter':
        // Fetch active candidates, pending follow-ups, etc.
        roleContext = {
          active_candidates: 0, // Placeholder
          candidates_needing_followup: 0,
        };
        break;

      case 'trainer':
        // Fetch student progress, grading queue, etc.
        roleContext = {
          total_students: 0, // Placeholder
          struggling_students: 0,
        };
        break;

      case 'bench_sales':
        // Fetch bench consultants, open reqs, etc.
        roleContext = {
          bench_count: 0, // Placeholder
          avg_bench_days: 0,
        };
        break;

      case 'admin':
        // Fetch system metrics
        roleContext = {
          system_health: 'healthy', // Placeholder
        };
        break;
    }

    return {
      employee_name: profile?.full_name,
      role: this.role,
      ...roleContext,
    };
  }

  /**
   * Log interaction to database
   */
  private async logInteraction(data: {
    interactionType: string;
    prompt: string | null;
    response: string;
    context: any;
    modelUsed: string;
    tokensUsed: number;
    costUsd: number;
    latencyMs: number;
  }): Promise<void> {
    await supabase.from('employee_twin_interactions').insert({
      user_id: this.employeeId,
      twin_role: this.role,
      interaction_type: data.interactionType,
      prompt: data.prompt,
      response: data.response,
      context: data.context,
      model_used: data.modelUsed,
      tokens_used: data.tokensUsed,
      cost_usd: data.costUsd,
      latency_ms: data.latencyMs,
    });
  }
}
```

### Event Bus Integration

```typescript
// /src/lib/productivity/events.ts

import { EventBus } from '@/lib/events/EventBus';

export class ProductivityEvents {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
    this.registerHandlers();
  }

  /**
   * Register event handlers
   */
  private registerHandlers(): void {
    // When screenshot is captured, queue for classification
    this.eventBus.subscribe('screenshot.captured', async (event) => {
      const { screenshotId } = event.payload;

      // Queue for batch classification (processed hourly)
      // Implementation depends on job queue system
      console.log(`[ProductivityEvents] Screenshot ${screenshotId} queued for classification`);
    });

    // When activity is classified, check if daily report should be generated
    this.eventBus.subscribe('activity.classified', async (event) => {
      const { userId, date } = event.payload;

      // Check if all screenshots for the day are classified
      // If yes, generate daily report
      console.log(`[ProductivityEvents] Activity classified for ${userId} on ${date}`);
    });

    // When daily report is generated, send to employee
    this.eventBus.subscribe('report.generated', async (event) => {
      const { userId, reportId } = event.payload;

      // Send notification to employee (email, Slack, etc.)
      console.log(`[ProductivityEvents] Report ${reportId} ready for ${userId}`);
    });

    // When twin generates suggestion, deliver to employee
    this.eventBus.subscribe('twin.suggestion_generated', async (event) => {
      const { userId, suggestionId } = event.payload;

      // Deliver via notification system
      console.log(`[ProductivityEvents] Suggestion ${suggestionId} for ${userId}`);
    });
  }

  /**
   * Emit screenshot captured event
   */
  async emitScreenshotCaptured(screenshotId: string, userId: string): Promise<void> {
    await this.eventBus.publish('screenshot.captured', {
      screenshotId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit activity classified event
   */
  async emitActivityClassified(
    screenshotId: string,
    userId: string,
    category: string,
    date: string
  ): Promise<void> {
    await this.eventBus.publish('activity.classified', {
      screenshotId,
      userId,
      category,
      date,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit report generated event
   */
  async emitReportGenerated(reportId: string, userId: string, date: string): Promise<void> {
    await this.eventBus.publish('report.generated', {
      reportId,
      userId,
      date,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit twin suggestion event
   */
  async emitTwinSuggestion(suggestionId: string, userId: string, role: string): Promise<void> {
    await this.eventBus.publish('twin.suggestion_generated', {
      suggestionId,
      userId,
      role,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## Security & Privacy

### Privacy-First Design

1. **Employee Data Ownership**
   - Employees fully control their screenshot data
   - Can pause tracking anytime
   - Can view all captured screenshots
   - Can request data deletion
   - 30-day automatic retention policy

2. **Manager Access Restrictions**
   - Managers see aggregated metrics only
   - No access to raw screenshots
   - Reports show trends, not specifics
   - RLS policies enforce separation

3. **Sensitive Content Detection**
   - Keywords: `password`, `bank`, `credit card`, `private`, `confidential`
   - Skips screenshot if sensitive window active
   - Marks as `is_sensitive = TRUE` in database

### RLS Policy Design

```sql
-- Employees can view own screenshots
CREATE POLICY "Users can view own screenshots"
  ON employee_screenshots
  FOR SELECT
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );

-- Admins can view all screenshots in org (for support)
CREATE POLICY "Admins can view all screenshots in org"
  ON employee_screenshots
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND (user_is_admin() OR user_has_role('productivity_admin'))
  );

-- Managers can view team reports (aggregated only)
CREATE POLICY "Managers can view team reports"
  ON productivity_reports
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND (
      user_is_admin()
      OR user_id = auth_user_id() -- Own report
      OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = productivity_reports.user_id
          AND employee_manager_id = auth_user_id()
      )
    )
  );

-- Employees can soft delete own screenshots
CREATE POLICY "Users can soft delete own screenshots"
  ON employee_screenshots
  FOR UPDATE
  USING (
    user_id = auth_user_id()
    AND org_id = auth_user_org_id()
  );
```

### Data Retention & Deletion

1. **Automatic Cleanup**
   - Daily cron job at 2am: `SELECT cleanup_old_screenshots();`
   - Soft deletes screenshots older than 30 days
   - Storage files deleted via separate job

2. **User-Initiated Deletion**
   - Soft delete: `UPDATE employee_screenshots SET is_deleted = TRUE, deleted_at = NOW()`
   - Hard delete: Storage bucket file removal + DB record deletion

3. **GDPR Compliance**
   - Right to access: Employee can export all data
   - Right to erasure: Hard delete on request
   - Right to portability: JSON export of all interactions
   - Consent tracking: `privacy_consent` table (to be added)

### Audit Logging

All privacy-sensitive operations logged to `audit_logs`:

```typescript
// /src/lib/productivity/audit.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function logPrivacyAction(
  userId: string,
  action: 'screenshot_captured' | 'screenshot_deleted' | 'tracking_paused' | 'tracking_resumed' | 'data_exported',
  details?: any
): Promise<void> {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: 'productivity_tracking',
    resource_id: details?.resourceId,
    details,
    created_at: new Date().toISOString(),
  });
}
```

---

## Performance Strategy

### Batch Processing

1. **Screenshot Classification**
   - Batch size: 10 screenshots at a time
   - Frequency: Every hour
   - Rate limiting: 1 second between batches (GPT-4o-mini: 500 req/min max)
   - Queue system: PostgreSQL `employee_screenshots` table (`analyzed = FALSE`)

2. **Daily Report Generation**
   - Runs once daily at 6am
   - Processes all employees with screenshots from previous day
   - Uses BaseAgent for narrative generation (GPT-4o-mini)

3. **Proactive Suggestions**
   - Generates 3× per day (9am, 1pm, 5pm)
   - Checks for actionable items before generating (avoid empty suggestions)
   - Expires after 4 hours if not actioned

### Caching Strategy

```typescript
// /src/lib/productivity/cache.ts

import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export class ProductivityCache {
  private TTL = 3600; // 1 hour

  /**
   * Cache daily activity summary
   */
  async cacheDailySummary(userId: string, date: string, summary: any): Promise<void> {
    const key = `activity:${userId}:${date}`;
    await redis.setex(key, this.TTL, JSON.stringify(summary));
  }

  /**
   * Get cached daily activity summary
   */
  async getDailySummary(userId: string, date: string): Promise<any | null> {
    const key = `activity:${userId}:${date}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache productivity report
   */
  async cacheReport(userId: string, date: string, report: any): Promise<void> {
    const key = `report:${userId}:${date}`;
    await redis.setex(key, this.TTL * 24, JSON.stringify(report)); // 24 hour cache
  }

  /**
   * Get cached productivity report
   */
  async getReport(userId: string, date: string): Promise<any | null> {
    const key = `report:${userId}:${date}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Invalidate cache on update
   */
  async invalidate(userId: string, date: string): Promise<void> {
    await redis.del(`activity:${userId}:${date}`, `report:${userId}:${date}`);
  }
}
```

### Rate Limiting

```typescript
// /src/lib/productivity/rate-limiter.ts

import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export class ProductivityRateLimiter {
  /**
   * Check if user has exceeded twin query limit
   * Limit: 20 queries per day
   */
  async checkTwinQueryLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const key = `twin:queries:${userId}:${new Date().toISOString().split('T')[0]}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 86400); // 24 hours
    }

    const limit = 20;
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
    };
  }

  /**
   * Check if user has exceeded screenshot upload limit
   * Limit: 2880 per day (30s intervals × 24 hours)
   */
  async checkScreenshotUploadLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const key = `screenshots:uploads:${userId}:${new Date().toISOString().split('T')[0]}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 86400); // 24 hours
    }

    const limit = 2880;
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
    };
  }
}
```

### Database Query Optimization

1. **Indexes Created**
   - `idx_screenshots_user_id` - User lookups
   - `idx_screenshots_captured_at` - Time-based queries
   - `idx_screenshots_analyzed` - Batch processing queue
   - `idx_reports_user_date` - Report retrieval

2. **Query Patterns**
   ```sql
   -- Efficient: Get unanalyzed screenshots (uses index)
   SELECT id FROM employee_screenshots
   WHERE user_id = $1
     AND analyzed = FALSE
   ORDER BY captured_at ASC
   LIMIT 100;

   -- Efficient: Get daily summary (uses indexes)
   SELECT activity_category, COUNT(*)
   FROM employee_screenshots
   WHERE user_id = $1
     AND captured_at >= $2
     AND captured_at < $3
   GROUP BY activity_category;
   ```

3. **Avoid N+1 Queries**
   - Use `JOIN` or batch fetch for related data
   - Example: Fetch user profiles with reports in single query

---

## Testing Strategy

### Unit Tests

```typescript
// /tests/unit/ActivityClassifier.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityClassifier } from '@/lib/productivity/ActivityClassifier';
import { VisionClassifier } from '@/lib/productivity/vision-api';

vi.mock('@/lib/productivity/vision-api');

describe('ActivityClassifier', () => {
  let classifier: ActivityClassifier;
  let mockVisionClassifier: any;

  beforeEach(() => {
    classifier = new ActivityClassifier();
    mockVisionClassifier = vi.mocked(VisionClassifier);
  });

  it('classifies screenshot correctly', async () => {
    mockVisionClassifier.prototype.classify.mockResolvedValue({
      category: 'coding',
      confidence: 0.95,
      reasoning: 'IDE visible with code',
    });

    const result = await classifier.classifyScreenshot('test-screenshot-id');

    expect(result.category).toBe('coding');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('handles classification errors gracefully', async () => {
    mockVisionClassifier.prototype.classify.mockRejectedValue(new Error('API error'));

    const result = await classifier.classifyScreenshot('test-screenshot-id');

    expect(result.category).toBe('idle'); // Fallback
    expect(result.confidence).toBeLessThan(0.2);
  });

  it('batch processes multiple screenshots', async () => {
    mockVisionClassifier.prototype.batchClassify.mockResolvedValue([
      { category: 'coding', confidence: 0.95, reasoning: 'IDE visible', timestamp: new Date().toISOString() },
      { category: 'email', confidence: 0.90, reasoning: 'Gmail open', timestamp: new Date().toISOString() },
    ]);

    const count = await classifier.batchClassify('test-user-id', '2025-01-15');

    expect(count).toBe(2);
  });

  it('respects rate limits', async () => {
    const batchSize = 10;
    const totalScreenshots = 25;

    const spy = vi.spyOn(classifier as any, 'classifyScreenshot');

    await classifier.batchClassify('test-user-id', '2025-01-15');

    // Should be called in batches with delays
    expect(spy).toHaveBeenCalledTimes(totalScreenshots);
  });
});
```

### Integration Tests

```typescript
// /tests/integration/productivity-flow.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ScreenshotStorage } from '@/lib/productivity/storage';
import { ActivityClassifier } from '@/lib/productivity/ActivityClassifier';
import { TimelineGenerator } from '@/lib/productivity/TimelineGenerator';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Productivity Tracking Flow', () => {
  let testUserId: string;
  let testScreenshotId: string;

  beforeAll(async () => {
    // Create test user
    const { data } = await supabase.from('user_profiles').insert({
      email: 'test@example.com',
      full_name: 'Test User',
    }).select().single();

    testUserId = data.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('user_profiles').delete().eq('id', testUserId);
  });

  it('completes full productivity tracking flow', async () => {
    // 1. Upload screenshot
    const storage = new ScreenshotStorage();
    const mockScreenshot = Buffer.from('fake-image-data');
    const uploadResult = await storage.upload(testUserId, mockScreenshot, new Date());

    expect(uploadResult.success).toBe(true);
    expect(uploadResult.filename).toBeTruthy();

    // 2. Create screenshot metadata
    const { data: screenshot } = await supabase.from('employee_screenshots').insert({
      user_id: testUserId,
      filename: uploadResult.filename!,
      file_size: mockScreenshot.length,
      captured_at: new Date().toISOString(),
    }).select().single();

    testScreenshotId = screenshot.id;
    expect(screenshot).toBeTruthy();

    // 3. Classify activity
    const classifier = new ActivityClassifier();
    const classification = await classifier.classifyScreenshot(testScreenshotId);

    expect(classification.category).toBeTruthy();
    expect(classification.confidence).toBeGreaterThan(0);

    // 4. Generate daily report
    const generator = new TimelineGenerator();
    const report = await generator.generateDailyReport(
      testUserId,
      new Date().toISOString().split('T')[0]
    );

    expect(report.summary).toBeTruthy();
    expect(report.productiveHours).toBeGreaterThanOrEqual(0);
    expect(report.topActivities.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests

```typescript
// /tests/e2e/twin-interaction.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Employee AI Twin', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employee
    await page.goto('/login');
    await page.fill('input[name="email"]', 'employee@test.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('displays morning briefing', async ({ page }) => {
    // Navigate to AI Twin page
    await page.goto('/dashboard/productivity/twin');

    // Check for morning briefing
    await expect(page.locator('[data-testid="morning-briefing"]')).toBeVisible();
    await expect(page.locator('[data-testid="morning-briefing"]')).toContainText('Good morning');
  });

  test('allows user to ask questions', async ({ page }) => {
    await page.goto('/dashboard/productivity/twin');

    // Type question
    await page.fill('textarea[name="question"]', 'What are my top priorities today?');
    await page.click('button[type="submit"]');

    // Wait for response
    await expect(page.locator('[data-testid="twin-response"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="twin-response"]')).not.toBeEmpty();
  });

  test('shows proactive suggestions', async ({ page }) => {
    await page.goto('/dashboard/productivity/twin');

    // Check for suggestions
    const suggestions = page.locator('[data-testid="proactive-suggestion"]');
    await expect(suggestions.first()).toBeVisible();

    // Dismiss suggestion
    await suggestions.first().locator('button[aria-label="Dismiss"]').click();
    await expect(suggestions.first()).not.toBeVisible();
  });

  test('enforces rate limiting', async ({ page }) => {
    await page.goto('/dashboard/productivity/twin');

    // Ask 21 questions (exceeds 20/day limit)
    for (let i = 0; i < 21; i++) {
      await page.fill('textarea[name="question"]', `Question ${i + 1}`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // Should show rate limit error
    await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="rate-limit-error"]')).toContainText('exceeded daily limit');
  });
});
```

### Performance Benchmarks

```typescript
// /tests/performance/productivity-benchmarks.test.ts

import { describe, it, expect } from 'vitest';
import { ActivityClassifier } from '@/lib/productivity/ActivityClassifier';
import { TimelineGenerator } from '@/lib/productivity/TimelineGenerator';

describe('Performance Benchmarks', () => {
  it('classifies screenshot in <2 seconds', async () => {
    const classifier = new ActivityClassifier();
    const start = Date.now();

    await classifier.classifyScreenshot('test-screenshot-id');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000); // 2 seconds
  });

  it('batch classifies 120 screenshots in <5 minutes', async () => {
    const classifier = new ActivityClassifier();
    const start = Date.now();

    await classifier.batchClassify('test-user-id', '2025-01-15');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(300000); // 5 minutes
  });

  it('generates daily report in <3 seconds', async () => {
    const generator = new TimelineGenerator();
    const start = Date.now();

    await generator.generateDailyReport('test-user-id', '2025-01-15');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000); // 3 seconds
  });

  it('twin morning briefing generated in <2 seconds', async () => {
    const { EmployeeTwin } = await import('@/lib/productivity/twins/EmployeeTwin');
    const twin = new EmployeeTwin('test-user-id', 'recruiter');

    const start = Date.now();
    await twin.generateMorningBriefing();

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000); // 2 seconds
  });
});
```

---

## Deployment Considerations

### Electron App Distribution

1. **Build Configuration**
   ```json
   // electron-builder.json
   {
     "appId": "com.intimeesolutions.productivity-tracker",
     "productName": "InTime Productivity Tracker",
     "directories": {
       "output": "dist-electron"
     },
     "files": [
       "electron/**/*",
       "!electron/**/*.ts",
       "!electron/**/*.map"
     ],
     "mac": {
       "category": "public.app-category.productivity",
       "target": ["dmg", "zip"]
     },
     "win": {
       "target": ["nsis", "portable"]
     },
     "linux": {
       "target": ["AppImage", "deb"]
     }
   }
   ```

2. **Auto-Update Strategy**
   - Use `electron-updater` for auto-updates
   - Check for updates on app launch
   - Download in background, prompt user to restart
   - Signed updates for security

3. **Distribution Channels**
   - Internal download portal (authenticated)
   - Direct download links sent via email
   - Future: Company-wide deployment via MDM

### Database Migration Strategy

1. **Pre-Deployment**
   - Test migration on staging database
   - Backup production database
   - Validate schema with `SELECT * FROM v_productivity_tracking_status;`

2. **Deployment**
   - Run migration during low-traffic window (2am-4am)
   - Monitor for errors via Sentry
   - Rollback plan: `rollback/016_rollback.sql`

3. **Post-Deployment**
   - Verify all tables created
   - Check RLS policies active
   - Test sample screenshot upload
   - Monitor cost dashboard (Helicone)

### Environment Variables

```bash
# .env.production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Helicone (Cost Monitoring)
HELICONE_API_KEY=xxx

# Redis (Caching & Rate Limiting)
REDIS_URL=redis://xxx:6379

# Feature Flags
FEATURE_PRODUCTIVITY_TRACKING=true
FEATURE_EMPLOYEE_TWINS=true

# Cost Limits
MAX_DAILY_AI_COST_USD=500
ALERT_THRESHOLD_USD=400
```

### Feature Flags

```typescript
// /src/lib/feature-flags.ts

export const FeatureFlags = {
  PRODUCTIVITY_TRACKING: process.env.FEATURE_PRODUCTIVITY_TRACKING === 'true',
  EMPLOYEE_TWINS: process.env.FEATURE_EMPLOYEE_TWINS === 'true',
} as const;

export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature] === true;
}
```

---

## Key Architectural Decisions

### 1. Electron for Desktop Agent

**Decision:** Use Electron instead of browser extension or system-level app

**Rationale:**
- Cross-platform (Windows, Mac, Linux)
- Access to native APIs (screenshot, active window)
- Easy to distribute and update
- TypeScript/React familiarity

**Trade-offs:**
- Larger app size (~150MB)
- More resource usage than extension
- Requires user installation

**Alternatives Considered:**
- Browser extension: Limited screenshot capabilities
- Native app (Swift/C++): Higher development cost, slower iteration

---

### 2. GPT-4o-mini for Classification

**Decision:** Use GPT-4o-mini vision API instead of GPT-4o or custom model

**Rationale:**
- Cost: $0.0015 per screenshot (vs $0.01 for GPT-4o)
- Speed: 2× faster than GPT-4o
- Accuracy: 90%+ for activity classification
- No training data required

**Trade-offs:**
- Lower accuracy than GPT-4o (90% vs 95%)
- Less nuanced reasoning
- Limited context window

**Alternatives Considered:**
- GPT-4o: 3× more expensive, overkill for this task
- Custom model: Requires training data, maintenance overhead
- Claude Sonnet: More expensive, similar accuracy

---

### 3. Batch Processing for Cost Optimization

**Decision:** Classify screenshots in batches (hourly) instead of real-time

**Rationale:**
- Cost savings: 70% reduction via batching + caching
- Rate limiting: Avoids hitting API limits
- User experience: Hourly updates acceptable for productivity tracking

**Trade-offs:**
- Reports delayed by up to 1 hour
- Can't provide real-time feedback

**Alternatives Considered:**
- Real-time: 3× more expensive, not critical for this use case
- Daily batch: Too slow, users want same-day insights

---

### 4. RLS for Privacy Enforcement

**Decision:** Use Supabase RLS policies instead of application-layer checks

**Rationale:**
- Security: Database-enforced, can't be bypassed
- Multi-tenancy: Automatic org isolation
- Performance: Postgres-optimized query plans
- Compliance: Audit trail at database level

**Trade-offs:**
- Complex policy syntax
- Debugging RLS issues harder
- Performance impact on complex policies

**Alternatives Considered:**
- Application-layer: Easier to debug, but less secure
- API gateway: Additional infrastructure complexity

---

### 5. BaseAgent Extension for Twins

**Decision:** Extend BaseAgent class instead of standalone implementation

**Rationale:**
- Code reuse: Memory, RAG, cost tracking built-in
- Consistency: Same patterns across all AI features
- Maintenance: Single codebase for agent logic

**Trade-offs:**
- Tight coupling to BaseAgent design
- Changes to BaseAgent affect all twins

**Alternatives Considered:**
- Standalone: More flexible, but duplicates infrastructure
- Composition: More complex, less intuitive

---

## Integration with Existing System

### Dependencies on Epic 1 (Foundation)

1. **Database Schema**
   - Extends `user_profiles` table (employee fields)
   - Uses `organizations` table (multi-tenancy)
   - Uses `audit_logs` table (privacy logging)
   - Uses `events` table (event bus integration)

2. **Authentication**
   - Uses Supabase Auth (`auth.uid()`)
   - RLS policies depend on `auth_user_id()` function
   - Session management via middleware

3. **Storage**
   - Uses Supabase Storage (buckets, RLS)
   - File upload/download infrastructure

4. **Event Bus**
   - Publishes events: `screenshot.captured`, `activity.classified`
   - Subscribes to events: (future integrations)

### Enables Future Epics

1. **Epic 3 (Recruiting)**
   - Resume matching uses RAG infrastructure
   - Recruiter twin provides candidate suggestions
   - Activity tracking shows recruitment time allocation

2. **Epic 6 (HR & Employee)**
   - Performance reviews use productivity data
   - Manager dashboards show team metrics
   - Employee satisfaction correlates with productivity

3. **Epic 7 (Productivity Pods)**
   - Pod-level productivity metrics
   - Twin collaboration features
   - Cross-pollination activity tracking

---

## Risks & Concerns

### 1. Privacy Backlash

**Risk:** Employees resist screenshot tracking (feels invasive)

**Mitigation:**
- Transparent communication during rollout
- Emphasize employee data ownership
- Pilot with volunteers first (10 employees)
- Provide clear ROI: time savings, workflow insights
- Allow opt-out without penalty

**Contingency:**
- Reduce capture frequency (5 min intervals instead of 30s)
- Make tracking fully optional
- Provide privacy dashboard showing what's tracked

---

### 2. AI Classification Accuracy

**Risk:** Classification accuracy below 90% (user complaints)

**Mitigation:**
- A/B test with human labelers (validate 100 screenshots)
- Allow user corrections (feedback loop)
- Fallback to manual categorization if confidence < 70%

**Contingency:**
- Use human-in-the-loop for critical classifications
- Reduce to 5 categories (simpler = more accurate)
- Switch to GPT-4o if accuracy doesn't improve

---

### 3. Cost Overruns

**Risk:** AI costs exceed $280K budget (25M screenshots × $0.002 = $50K budgeted)

**Mitigation:**
- Daily cost monitoring (Helicone alerts at $500/day)
- Rate limiting (max 2880 screenshots/day per user)
- Caching (50% hit rate expected)
- Auto-pause if budget exceeded

**Contingency:**
- Reduce capture frequency (60s instead of 30s) → 50% cost reduction
- Downgrade to cheaper model (custom fine-tuned model)
- Limit to opted-in users only

---

### 4. Electron App Adoption

**Risk:** Employees don't install/use desktop app (low adoption)

**Mitigation:**
- Easy installation (single-click installers)
- Auto-update (seamless experience)
- Manager endorsement (leadership uses publicly)
- Gamification (leaderboards, badges)

**Contingency:**
- Browser extension fallback (limited features)
- Mobile app for remote workers
- Incentivize adoption (bonus for 30-day usage)

---

### 5. Performance Degradation

**Risk:** Screenshot uploads slow down employee machines

**Mitigation:**
- Background upload (non-blocking)
- Offline queue (retry later if network slow)
- Resource throttling (CPU/memory limits)
- Compress before upload (50% quality JPEG)

**Contingency:**
- Reduce capture frequency (60s → 120s)
- Upload during idle time only
- Pause tracking during high-CPU tasks

---

## Summary

### Key Architectural Highlights

1. **Privacy-First Design**
   - Employees own their data (RLS enforced)
   - Managers see aggregates only
   - 30-day retention policy
   - Sensitive window detection

2. **Cost-Optimized**
   - Batch processing (hourly classification)
   - GPT-4o-mini ($0.0015/screenshot)
   - Caching (50% hit rate)
   - Rate limiting (2880/day per user)
   - **Total: $50K/year for 200 employees**

3. **Event-Driven Architecture**
   - All components communicate via event bus
   - Decoupled services
   - Easy to extend (future integrations)

4. **Multi-Tenant Ready**
   - Full org isolation via RLS
   - Scales to 1000+ organizations
   - No code changes needed for new orgs

5. **BaseAgent Integration**
   - Employee Twins extend BaseAgent
   - Memory + RAG + cost tracking built-in
   - Consistent patterns across AI features

### Security & Privacy Measures

- RLS policies enforce data ownership
- Sensitive window detection (password managers, banking)
- Audit logging for all privacy actions
- GDPR-compliant (right to access, erasure, portability)
- 30-day automatic retention policy

### Performance Optimizations

- Batch processing (10 screenshots/batch, 1s delay)
- Caching (Redis: 1 hour TTL for summaries, 24 hours for reports)
- Rate limiting (20 twin queries/day, 2880 screenshots/day)
- Indexed database queries (captured_at, analyzed, user_id)
- **Benchmarks:** Classification <2s, Reports <3s, Twins <2s

### Risks Flagged

1. Privacy concerns (mitigation: transparency + opt-in pilot)
2. Classification accuracy (mitigation: A/B testing + user corrections)
3. Cost overruns (mitigation: daily monitoring + rate limiting + auto-pause)
4. Electron adoption (mitigation: easy install + manager endorsement)
5. Performance impact (mitigation: background processing + throttling)

---

**Next Steps:**
1. Developer implements database migration (016_add_productivity_tracking.sql)
2. Developer builds Electron app (AI-PROD-001)
3. Developer implements ActivityClassifier (AI-PROD-002)
4. Developer implements TimelineGenerator (AI-PROD-003)
5. Developer implements EmployeeTwin framework (AI-TWIN-001)
6. QA validates all functionality + privacy controls
7. Deployment team rolls out Electron app to pilot group (10 employees)

**Status:** ✅ Architecture Complete - Ready for Implementation
