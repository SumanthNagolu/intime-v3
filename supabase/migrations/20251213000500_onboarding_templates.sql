-- ============================================================================
-- ONBOARDING-01: Employee Onboarding Templates System
-- ============================================================================
-- Creates the template system for employee onboarding checklists.
-- Supports template-based checklist assignment with customizable tasks.
-- ============================================================================

-- ============================================================================
-- 1. Create onboarding_templates table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id),

    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Template targeting
    employee_type VARCHAR(50), -- 'full_time', 'contractor', 'intern', 'temp' or NULL for any
    department VARCHAR(100),   -- Specific department or NULL for any

    -- Template settings
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id),
    updated_by UUID REFERENCES public.user_profiles(id)
);

-- ============================================================================
-- 2. Create onboarding_template_tasks table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.onboarding_template_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id),
    template_id UUID NOT NULL REFERENCES public.onboarding_templates(id) ON DELETE CASCADE,

    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    category public.task_category DEFAULT 'other'::public.task_category NOT NULL,

    -- Task configuration
    due_offset_days INTEGER DEFAULT 0, -- Days from start date
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,

    -- Assignee configuration
    assignee_role VARCHAR(100), -- Role that should handle this task (e.g., 'hr_admin', 'manager')

    -- Linked systems (compliance_requirement_id added without FK for now - table may not exist)
    compliance_requirement_id UUID,
    document_template_id UUID REFERENCES public.documents(id),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. Add columns to employee_onboarding for multi-tenancy and contacts
-- ============================================================================
ALTER TABLE public.employee_onboarding
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.employee_onboarding
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id);

-- Add foreign key for template reference (may already exist as text)
-- First check if checklist_template_id column exists and update its type
DO $$
BEGIN
    -- Add FK constraint if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'employee_onboarding_template_fkey'
        AND table_name = 'employee_onboarding'
    ) THEN
        ALTER TABLE public.employee_onboarding
        ADD CONSTRAINT employee_onboarding_template_fkey
        FOREIGN KEY (checklist_template_id) REFERENCES public.onboarding_templates(id);
    END IF;
END $$;

-- ============================================================================
-- 4. Add columns to onboarding_tasks for enhanced tracking
-- ============================================================================
ALTER TABLE public.onboarding_tasks
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.onboarding_tasks
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.user_profiles(id);

ALTER TABLE public.onboarding_tasks
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Note: compliance_item_id column will be added when compliance_tracking table exists
-- For now, add the column without the foreign key constraint
ALTER TABLE public.onboarding_tasks
ADD COLUMN IF NOT EXISTS compliance_item_id UUID;

ALTER TABLE public.onboarding_tasks
ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES public.documents(id);

ALTER TABLE public.onboarding_tasks
ADD COLUMN IF NOT EXISTS skip_reason TEXT;

-- ============================================================================
-- 5. Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_org
ON public.onboarding_templates(org_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_onboarding_templates_active
ON public.onboarding_templates(org_id, is_active) WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_onboarding_templates_default
ON public.onboarding_templates(org_id, is_default) WHERE deleted_at IS NULL AND is_default = true;

CREATE INDEX IF NOT EXISTS idx_onboarding_template_tasks_template
ON public.onboarding_template_tasks(template_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_template_tasks_org
ON public.onboarding_template_tasks(org_id);

CREATE INDEX IF NOT EXISTS idx_employee_onboarding_org
ON public.employee_onboarding(org_id);

CREATE INDEX IF NOT EXISTS idx_employee_onboarding_contact
ON public.employee_onboarding(contact_id) WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employee_onboarding_status_active
ON public.employee_onboarding(org_id, status) WHERE status IN ('not_started', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_org
ON public.onboarding_tasks(org_id) WHERE org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_assigned
ON public.onboarding_tasks(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_due
ON public.onboarding_tasks(due_date) WHERE status = 'pending' AND due_date IS NOT NULL;

-- ============================================================================
-- 6. Enable RLS
-- ============================================================================
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_template_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. Create RLS policies
-- ============================================================================
CREATE POLICY onboarding_templates_org_isolation ON public.onboarding_templates
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY onboarding_template_tasks_org_isolation ON public.onboarding_template_tasks
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- ============================================================================
-- 8. Add trigger for updated_at
-- ============================================================================
CREATE TRIGGER onboarding_templates_updated_at
    BEFORE UPDATE ON public.onboarding_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER onboarding_template_tasks_updated_at
    BEFORE UPDATE ON public.onboarding_template_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 9. Add comments
-- ============================================================================
COMMENT ON TABLE public.onboarding_templates IS 'Onboarding checklist templates for different employee types/departments';
COMMENT ON TABLE public.onboarding_template_tasks IS 'Task definitions within onboarding templates';

COMMENT ON COLUMN public.onboarding_templates.employee_type IS 'Target employee type: full_time, contractor, intern, temp, or NULL for any';
COMMENT ON COLUMN public.onboarding_templates.department IS 'Target department or NULL for any department';
COMMENT ON COLUMN public.onboarding_templates.is_default IS 'Whether this is the default template for matching employee type/department';

COMMENT ON COLUMN public.onboarding_template_tasks.due_offset_days IS 'Days from start date when task is due';
COMMENT ON COLUMN public.onboarding_template_tasks.assignee_role IS 'Role that should handle this task (hr_admin, manager, employee)';
COMMENT ON COLUMN public.onboarding_template_tasks.compliance_requirement_id IS 'Linked compliance requirement to auto-create on checklist assignment';

COMMENT ON COLUMN public.employee_onboarding.contact_id IS 'Reference to unified contacts table for the employee being onboarded';
COMMENT ON COLUMN public.onboarding_tasks.due_date IS 'Calculated due date based on template offset and start date';
COMMENT ON COLUMN public.onboarding_tasks.compliance_item_id IS 'Auto-created compliance tracking item';
