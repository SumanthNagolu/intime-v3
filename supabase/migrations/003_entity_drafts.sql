-- ============================================
-- Entity Drafts System
-- ============================================
-- This migration creates the entity_drafts table for persisting
-- wizard form data across sessions. Drafts are stored in the database
-- instead of localStorage for reliability and cross-device access.

-- ============================================
-- 1. ENTITY DRAFTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.entity_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users, not user_profiles (FK via RLS)
    
    -- Entity Information
    entity_type TEXT NOT NULL, -- 'account', 'job', 'contact', etc.
    display_name TEXT NOT NULL,
    
    -- Form State
    form_data JSONB NOT NULL DEFAULT '{}',
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,
    wizard_route TEXT NOT NULL, -- e.g., '/employee/recruiting/accounts/new'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ, -- soft delete
    
    -- Constraints
    CONSTRAINT entity_drafts_entity_type_check CHECK (entity_type IN (
        'account',
        'job',
        'contact',
        'candidate',
        'submission',
        'placement',
        'vendor',
        'contract'
    ))
);

-- ============================================
-- 2. INDEXES
-- ============================================
-- Index for listing user's drafts (most common query)
CREATE INDEX IF NOT EXISTS idx_entity_drafts_user_active 
    ON public.entity_drafts(user_id, deleted_at) 
    WHERE deleted_at IS NULL;

-- Index for filtering by entity type
CREATE INDEX IF NOT EXISTS idx_entity_drafts_entity_type 
    ON public.entity_drafts(entity_type);

-- Index for org-level queries (admin viewing all drafts)
CREATE INDEX IF NOT EXISTS idx_entity_drafts_org 
    ON public.entity_drafts(org_id, deleted_at) 
    WHERE deleted_at IS NULL;

-- ============================================
-- 3. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_entity_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entity_drafts_updated_at ON public.entity_drafts;
CREATE TRIGGER entity_drafts_updated_at
    BEFORE UPDATE ON public.entity_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_entity_drafts_updated_at();

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.entity_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own drafts
CREATE POLICY entity_drafts_select_own ON public.entity_drafts
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can only insert their own drafts
CREATE POLICY entity_drafts_insert_own ON public.entity_drafts
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can only update their own drafts
CREATE POLICY entity_drafts_update_own ON public.entity_drafts
    FOR UPDATE
    USING (user_id = auth.uid());

-- Users can only delete their own drafts
CREATE POLICY entity_drafts_delete_own ON public.entity_drafts
    FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- 5. COMMENTS
-- ============================================
COMMENT ON TABLE public.entity_drafts IS 'Stores in-progress wizard form data for entity creation';
COMMENT ON COLUMN public.entity_drafts.entity_type IS 'Type of entity being created (account, job, contact, etc.)';
COMMENT ON COLUMN public.entity_drafts.display_name IS 'Human-readable name for the draft (derived from form data)';
COMMENT ON COLUMN public.entity_drafts.form_data IS 'Complete wizard form state as JSONB';
COMMENT ON COLUMN public.entity_drafts.current_step IS 'Current wizard step (1-based)';
COMMENT ON COLUMN public.entity_drafts.total_steps IS 'Total number of steps in the wizard';
COMMENT ON COLUMN public.entity_drafts.wizard_route IS 'Route to the wizard page for resuming';
COMMENT ON COLUMN public.entity_drafts.deleted_at IS 'Soft delete timestamp - drafts are not hard deleted';

