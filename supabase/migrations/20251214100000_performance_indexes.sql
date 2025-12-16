-- ============================================
-- Performance Optimization Indexes
-- Created: 2025-12-14
-- Purpose: Add missing indexes for slow queries
-- ============================================

-- ====================
-- Activities Table Indexes
-- ====================

-- Composite index for activities by org + entity (most common query pattern)
-- This replaces the need for separate filters on org_id and entity_type/entity_id
CREATE INDEX IF NOT EXISTS idx_activities_org_entity_composite
ON activities(org_id, entity_type, entity_id)
WHERE deleted_at IS NULL;

-- Composite index for activities by org + entity + type (for filtering notes)
CREATE INDEX IF NOT EXISTS idx_activities_org_entity_type
ON activities(org_id, entity_type, entity_id, activity_type)
WHERE deleted_at IS NULL;

-- Index for activities with recent ordering (for timeline queries)
CREATE INDEX IF NOT EXISTS idx_activities_org_entity_recent
ON activities(org_id, entity_type, entity_id, created_at DESC)
WHERE deleted_at IS NULL;

-- ====================
-- Campaign Enrollments Indexes
-- ====================

-- Composite index for campaign enrollments by campaign + org
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_campaign_org
ON campaign_enrollments(campaign_id, org_id);

-- Index for funnel queries (used by get_campaign_funnel RPC)
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_funnel
ON campaign_enrollments(campaign_id, first_contacted_at, opened_at, clicked_at, responded_at, converted_to_lead_at, meeting_booked_at);

-- ====================
-- Leads Table Indexes
-- ====================

-- Composite index for leads by campaign + org
CREATE INDEX IF NOT EXISTS idx_leads_campaign_org
ON leads(campaign_id, org_id)
WHERE deleted_at IS NULL;

-- ====================
-- Campaign Documents Indexes
-- ====================

-- Composite index for campaign documents
CREATE INDEX IF NOT EXISTS idx_campaign_documents_campaign_org
ON campaign_documents(campaign_id, org_id)
WHERE deleted_at IS NULL;

-- ====================
-- Campaigns Table Indexes
-- ====================

-- Index for campaign listing with status filter
CREATE INDEX IF NOT EXISTS idx_campaigns_org_status
ON campaigns(org_id, status)
WHERE deleted_at IS NULL;

-- Index for campaign listing with date ordering
CREATE INDEX IF NOT EXISTS idx_campaigns_org_created
ON campaigns(org_id, created_at DESC)
WHERE deleted_at IS NULL;

-- ====================
-- Contacts Table Indexes (for prospect queries)
-- ====================

-- Index for contacts with company join
CREATE INDEX IF NOT EXISTS idx_contacts_company_org
ON contacts(company_id, org_id)
WHERE deleted_at IS NULL;

-- ====================
-- Jobs Table Indexes
-- ====================

-- Index for jobs by company + org (for account detail pages)
CREATE INDEX IF NOT EXISTS idx_jobs_company_org
ON jobs(company_id, org_id)
WHERE deleted_at IS NULL;

-- Index for jobs by status + org
CREATE INDEX IF NOT EXISTS idx_jobs_org_status
ON jobs(org_id, status)
WHERE deleted_at IS NULL;

-- ====================
-- Submissions Table Indexes
-- ====================

-- Index for submissions by job + org
CREATE INDEX IF NOT EXISTS idx_submissions_job_org
ON submissions(job_id, org_id)
WHERE deleted_at IS NULL;

-- Index for submissions by candidate + org
CREATE INDEX IF NOT EXISTS idx_submissions_candidate_org
ON submissions(candidate_id, org_id)
WHERE deleted_at IS NULL;

-- ====================
-- User Profiles Index (for join performance)
-- ====================

-- Index for user profiles by org
CREATE INDEX IF NOT EXISTS idx_user_profiles_org
ON user_profiles(org_id);

-- ====================
-- Analyze tables to update statistics
-- ====================

ANALYZE activities;
ANALYZE campaign_enrollments;
ANALYZE leads;
ANALYZE campaign_documents;
ANALYZE campaigns;
ANALYZE contacts;
ANALYZE jobs;
ANALYZE submissions;
ANALYZE user_profiles;
