-- ============================================
-- Guidewire-Style Activity System Enhancement
-- ============================================
-- This migration adds:
-- 1. activity_notes table for comments/notes on activities
-- 2. work_queues table for team assignment queues
-- 3. Indexes and RLS policies

-- ============================================
-- 1. ACTIVITY NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.activity_notes IS 'Notes and comments attached to activities (Guidewire-style activity notes)';
COMMENT ON COLUMN public.activity_notes.is_internal IS 'Internal notes are only visible to team members, not shared externally';

-- Indexes for activity_notes
CREATE INDEX IF NOT EXISTS idx_activity_notes_activity_id ON public.activity_notes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_notes_org_id ON public.activity_notes(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_notes_created_at ON public.activity_notes(created_at DESC);

-- RLS for activity_notes
ALTER TABLE public.activity_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_notes_select_policy ON public.activity_notes
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY activity_notes_insert_policy ON public.activity_notes
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY activity_notes_update_policy ON public.activity_notes
    FOR UPDATE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
        AND created_by IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY activity_notes_delete_policy ON public.activity_notes
    FOR DELETE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
        AND created_by IN (SELECT id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

-- ============================================
-- 2. WORK QUEUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.work_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    owner_group_id UUID,
    priority_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'owner_group_id') THEN
        ALTER TABLE public.work_queues ADD COLUMN owner_group_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'assignment_type') THEN
        ALTER TABLE public.work_queues ADD COLUMN assignment_type TEXT DEFAULT 'manual';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'escalation_threshold_hours') THEN
        ALTER TABLE public.work_queues ADD COLUMN escalation_threshold_hours INTEGER DEFAULT 24;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'reminder_threshold_hours') THEN
        ALTER TABLE public.work_queues ADD COLUMN reminder_threshold_hours INTEGER DEFAULT 4;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'is_default') THEN
        ALTER TABLE public.work_queues ADD COLUMN is_default BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'entity_types') THEN
        ALTER TABLE public.work_queues ADD COLUMN entity_types TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'filter_criteria') THEN
        ALTER TABLE public.work_queues ADD COLUMN filter_criteria JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_queues' AND column_name = 'created_by') THEN
        ALTER TABLE public.work_queues ADD COLUMN created_by UUID;
    END IF;
END $$;

COMMENT ON TABLE public.work_queues IS 'Work queues for team-based activity assignment (Guidewire workqueue pattern)';
COMMENT ON COLUMN public.work_queues.assignment_type IS 'How activities are assigned: manual, round_robin, load_balanced, skill_based';
COMMENT ON COLUMN public.work_queues.escalation_threshold_hours IS 'Hours after which unassigned activities escalate';
COMMENT ON COLUMN public.work_queues.entity_types IS 'Entity types this queue handles (e.g., account, job, candidate)';
COMMENT ON COLUMN public.work_queues.filter_criteria IS 'JSON criteria for auto-routing activities to this queue';

-- Indexes for work_queues
CREATE INDEX IF NOT EXISTS idx_work_queues_org_id ON public.work_queues(org_id);
CREATE INDEX IF NOT EXISTS idx_work_queues_owner_group_id ON public.work_queues(owner_group_id);
CREATE INDEX IF NOT EXISTS idx_work_queues_is_active ON public.work_queues(is_active) WHERE is_active = true;

-- RLS for work_queues
ALTER TABLE public.work_queues ENABLE ROW LEVEL SECURITY;

CREATE POLICY work_queues_select_policy ON public.work_queues
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY work_queues_insert_policy ON public.work_queues
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY work_queues_update_policy ON public.work_queues
    FOR UPDATE USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

-- ============================================
-- 3. WORK QUEUE MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.work_queue_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL REFERENCES public.work_queues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'supervisor', 'member')),
    can_claim BOOLEAN DEFAULT true,
    can_assign BOOLEAN DEFAULT false,
    max_active_activities INTEGER DEFAULT 10,
    current_load INTEGER DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(queue_id, user_id)
);

COMMENT ON TABLE public.work_queue_members IS 'Members of work queues with their roles and capacity';
COMMENT ON COLUMN public.work_queue_members.max_active_activities IS 'Maximum activities this member can have assigned at once';
COMMENT ON COLUMN public.work_queue_members.current_load IS 'Current number of active activities assigned';

-- Indexes for work_queue_members
CREATE INDEX IF NOT EXISTS idx_work_queue_members_queue_id ON public.work_queue_members(queue_id);
CREATE INDEX IF NOT EXISTS idx_work_queue_members_user_id ON public.work_queue_members(user_id);

-- RLS for work_queue_members
ALTER TABLE public.work_queue_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY work_queue_members_select_policy ON public.work_queue_members
    FOR SELECT USING (
        queue_id IN (SELECT id FROM public.work_queues WHERE org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid()))
    );

CREATE POLICY work_queue_members_insert_policy ON public.work_queue_members
    FOR INSERT WITH CHECK (
        queue_id IN (SELECT id FROM public.work_queues WHERE org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid()))
    );

-- ============================================
-- 4. ADD QUEUE REFERENCE TO ACTIVITIES
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'queue_id'
    ) THEN
        ALTER TABLE public.activities ADD COLUMN queue_id UUID REFERENCES public.work_queues(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'claimed_at'
    ) THEN
        ALTER TABLE public.activities ADD COLUMN claimed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'claimed_by'
    ) THEN
        ALTER TABLE public.activities ADD COLUMN claimed_by UUID REFERENCES public.user_profiles(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'activities' 
        AND column_name = 'snoozed_until'
    ) THEN
        ALTER TABLE public.activities ADD COLUMN snoozed_until TIMESTAMPTZ;
    END IF;
END $$;

-- Index for queue activities
CREATE INDEX IF NOT EXISTS idx_activities_queue_id ON public.activities(queue_id) WHERE queue_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_snoozed_until ON public.activities(snoozed_until) WHERE snoozed_until IS NOT NULL;

-- ============================================
-- 5. ACTIVITY ESCALATION LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    escalated_from_user UUID REFERENCES public.user_profiles(id),
    escalated_to_user UUID REFERENCES public.user_profiles(id),
    escalated_to_queue UUID REFERENCES public.work_queues(id),
    reason TEXT,
    escalation_type TEXT DEFAULT 'automatic' CHECK (escalation_type IN ('automatic', 'manual')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.activity_escalations IS 'Log of activity escalations for audit trail';

-- Indexes for activity_escalations
CREATE INDEX IF NOT EXISTS idx_activity_escalations_activity_id ON public.activity_escalations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_escalations_org_id ON public.activity_escalations(org_id);

-- RLS for activity_escalations
ALTER TABLE public.activity_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_escalations_select_policy ON public.activity_escalations
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

CREATE POLICY activity_escalations_insert_policy ON public.activity_escalations
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM public.user_profiles WHERE auth_id = auth.uid())
    );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to claim an activity from queue
CREATE OR REPLACE FUNCTION public.claim_activity_from_queue(
    p_activity_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_activity activities%ROWTYPE;
    v_member work_queue_members%ROWTYPE;
BEGIN
    -- Get activity
    SELECT * INTO v_activity FROM activities WHERE id = p_activity_id;
    
    IF v_activity IS NULL THEN
        RAISE EXCEPTION 'Activity not found';
    END IF;
    
    -- Check if already assigned
    IF v_activity.assigned_to IS NOT NULL AND v_activity.assigned_to != p_user_id THEN
        RAISE EXCEPTION 'Activity is already assigned to another user';
    END IF;
    
    -- Check if user is member of the queue
    IF v_activity.queue_id IS NOT NULL THEN
        SELECT * INTO v_member 
        FROM work_queue_members 
        WHERE queue_id = v_activity.queue_id 
        AND user_id = p_user_id 
        AND is_active = true
        AND can_claim = true;
        
        IF v_member IS NULL THEN
            RAISE EXCEPTION 'User is not authorized to claim from this queue';
        END IF;
        
        -- Check load capacity
        IF v_member.current_load >= v_member.max_active_activities THEN
            RAISE EXCEPTION 'User has reached maximum activity capacity';
        END IF;
        
        -- Update member load
        UPDATE work_queue_members 
        SET current_load = current_load + 1 
        WHERE id = v_member.id;
    END IF;
    
    -- Claim the activity
    UPDATE activities SET
        assigned_to = p_user_id,
        claimed_at = NOW(),
        claimed_by = p_user_id,
        status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
        updated_at = NOW()
    WHERE id = p_activity_id;
    
    -- Log history
    INSERT INTO activity_history (activity_id, action, field_changed, new_value, changed_by)
    VALUES (p_activity_id, 'claimed', 'assigned_to', p_user_id::text, p_user_id);
    
    RETURN TRUE;
END;
$$;

-- Function to release an activity back to queue
CREATE OR REPLACE FUNCTION public.release_activity_to_queue(
    p_activity_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_activity activities%ROWTYPE;
BEGIN
    -- Get activity
    SELECT * INTO v_activity FROM activities WHERE id = p_activity_id;
    
    IF v_activity IS NULL THEN
        RAISE EXCEPTION 'Activity not found';
    END IF;
    
    -- Check if user is the assigned user
    IF v_activity.assigned_to != p_user_id THEN
        RAISE EXCEPTION 'Only the assigned user can release the activity';
    END IF;
    
    -- Update member load if from queue
    IF v_activity.queue_id IS NOT NULL THEN
        UPDATE work_queue_members 
        SET current_load = GREATEST(0, current_load - 1)
        WHERE queue_id = v_activity.queue_id AND user_id = p_user_id;
    END IF;
    
    -- Release the activity
    UPDATE activities SET
        assigned_to = NULL,
        claimed_at = NULL,
        claimed_by = NULL,
        status = 'open',
        updated_at = NOW()
    WHERE id = p_activity_id;
    
    -- Log history
    INSERT INTO activity_history (activity_id, action, field_changed, old_value, changed_by)
    VALUES (p_activity_id, 'released', 'assigned_to', p_user_id::text, p_user_id);
    
    RETURN TRUE;
END;
$$;

-- Function to escalate an activity
CREATE OR REPLACE FUNCTION public.escalate_activity(
    p_activity_id UUID,
    p_reason TEXT DEFAULT 'Overdue',
    p_escalation_type TEXT DEFAULT 'automatic'
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_activity activities%ROWTYPE;
    v_new_level INTEGER;
BEGIN
    -- Get activity
    SELECT * INTO v_activity FROM activities WHERE id = p_activity_id;
    
    IF v_activity IS NULL THEN
        RAISE EXCEPTION 'Activity not found';
    END IF;
    
    -- Calculate new escalation level
    v_new_level := COALESCE(v_activity.escalation_count, 0) + 1;
    
    -- Update activity
    UPDATE activities SET
        escalation_count = v_new_level,
        last_escalated_at = NOW(),
        priority = CASE 
            WHEN v_new_level >= 3 THEN 'urgent'
            WHEN v_new_level >= 2 THEN 'high'
            ELSE priority 
        END,
        updated_at = NOW()
    WHERE id = p_activity_id;
    
    -- Log escalation
    INSERT INTO activity_escalations (
        activity_id, org_id, escalation_level,
        escalated_from_user, reason, escalation_type
    ) VALUES (
        p_activity_id, v_activity.org_id, v_new_level,
        v_activity.assigned_to, p_reason, p_escalation_type
    );
    
    -- Log history
    INSERT INTO activity_history (activity_id, action, new_value, notes)
    VALUES (p_activity_id, 'escalated', v_new_level::text, p_reason);
    
    RETURN TRUE;
END;
$$;

-- Function to snooze an activity
CREATE OR REPLACE FUNCTION public.snooze_activity(
    p_activity_id UUID,
    p_snooze_until TIMESTAMPTZ,
    p_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    UPDATE activities SET
        snoozed_until = p_snooze_until,
        reminder_sent_at = NULL,
        updated_at = NOW(),
        updated_by = p_user_id
    WHERE id = p_activity_id;
    
    -- Log history
    INSERT INTO activity_history (activity_id, action, field_changed, new_value, changed_by)
    VALUES (p_activity_id, 'snoozed', 'snoozed_until', p_snooze_until::text, p_user_id);
    
    RETURN TRUE;
END;
$$;

-- ============================================
-- 7. SEED DEFAULT WORK QUEUES
-- ============================================
-- These will be created per-org, this is just an example

-- Done!

