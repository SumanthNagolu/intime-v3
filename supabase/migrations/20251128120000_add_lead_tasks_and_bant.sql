-- Migration: Add Lead Tasks and BANT Qualification
-- Created: 2025-11-28
-- Purpose: Store tasks and BANT scores for leads

-- =====================================================
-- LEAD TASKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),
  
  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE lead_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy for org isolation
CREATE POLICY "lead_tasks_org_isolation" ON lead_tasks
  FOR ALL
  USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id ON lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_org_id ON lead_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_due_date ON lead_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_completed ON lead_tasks(completed) WHERE NOT completed;

-- =====================================================
-- ADD BANT COLUMNS TO LEADS TABLE
-- =====================================================

-- BANT Score columns (0-25 each, total 0-100)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_budget INTEGER DEFAULT 0 CHECK (bant_budget >= 0 AND bant_budget <= 25);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_authority INTEGER DEFAULT 0 CHECK (bant_authority >= 0 AND bant_authority <= 25);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_need INTEGER DEFAULT 0 CHECK (bant_need >= 0 AND bant_need <= 25);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_timeline INTEGER DEFAULT 0 CHECK (bant_timeline >= 0 AND bant_timeline <= 25);

-- BANT Notes columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_budget_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_authority_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_need_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_timeline_notes TEXT;

-- Computed BANT total score (for easy querying)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bant_total_score INTEGER GENERATED ALWAYS AS (
  COALESCE(bant_budget, 0) + COALESCE(bant_authority, 0) + COALESCE(bant_need, 0) + COALESCE(bant_timeline, 0)
) STORED;

-- Index for BANT score filtering
CREATE INDEX IF NOT EXISTS idx_leads_bant_total ON leads(bant_total_score);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================

-- Update trigger for lead_tasks
CREATE OR REPLACE FUNCTION update_lead_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_tasks_updated_at ON lead_tasks;
CREATE TRIGGER trigger_lead_tasks_updated_at
  BEFORE UPDATE ON lead_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_tasks_updated_at();

-- Mark task as completed trigger
CREATE OR REPLACE FUNCTION handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = false AND OLD.completed = true THEN
    NEW.completed_at = NULL;
    NEW.completed_by = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_task_completion ON lead_tasks;
CREATE TRIGGER trigger_task_completion
  BEFORE UPDATE ON lead_tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_completion();









