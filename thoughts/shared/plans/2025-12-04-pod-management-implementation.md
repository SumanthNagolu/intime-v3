# Pod Management Implementation Plan

## Overview

Implement comprehensive pod management for the Admin Portal, including database schema enhancements, tRPC API endpoints, and full UI for CRUD operations, member management, sprint configuration, and pod metrics.

**Epic**: Admin Portal (Epic-01)
**Story ID**: ADMIN-US-002
**Priority**: High

## Current State Analysis

### What Exists:
- **Database**: `pods` table (2-person structure with senior/junior), `pod_members` table
- **tRPC**: Admin router with 3 read-only procedures (no pod operations)
- **UI**: Quick action link to `/employee/admin/pods/new` but no actual pages
- **Navigation**: No pods item in admin sidebar

### Key Discoveries:
- `pods` table: `src/server/../supabase/migrations/20251124030000_create_ta_hr_modules.sql:280-311`
- `pod_members` table: `supabase/migrations/20251130200000_core_schema_enhancements.sql:95-127`
- Admin router pattern: `src/server/routers/admin.ts:1-89`
- Admin nav config: `src/lib/navigation/adminNavConfig.ts:15-101`
- Admin dashboard pattern: `src/components/admin/AdminDashboard.tsx:1-223`

### Schema Gaps to Address:
1. Missing `manager_id` field (spec requires pod manager, current has senior/junior)
2. Limited `pod_type` options (missing 'hr', 'mixed')
3. No `pod_managers` history table
4. No `pod_sprint_metrics` table for performance tracking
5. Missing region support aligned with spec (us, canada, multi)

## Desired End State

After implementation:
1. Admin users can view all organization pods in a searchable/sortable table
2. Admin users can create new pods with manager, members, type, and region
3. Admin users can edit pod details and change managers
4. Admin users can add/remove members from pods with bulk operations
5. Admin users can deactivate/reactivate pods with member reassignment
6. Admin users can configure sprint targets and view pod metrics
7. All actions create audit log entries
8. UI follows existing premium design system patterns

### Verification:
- Navigate to `/employee/admin/pods` and see pod list
- Create a new pod with manager and members
- Edit pod, change manager, add/remove members
- Deactivate pod (requires member reassignment)
- View pod metrics and sprint configuration

## What We're NOT Doing

- Pod-to-pod hierarchy (parent/child pods) - out of scope per epic
- Pod budgets and cost centers - out of scope per epic
- Pod scheduling/capacity planning - out of scope per epic
- Pod hierarchy tree view (AC-6) - deferred to future iteration
- Real-time metrics from placements table (mock for MVP)

## Implementation Approach

Follow existing patterns from Admin Dashboard implementation:
1. Database-first: Create migration for schema enhancements
2. API-second: Build tRPC procedures following existing patterns
3. Navigation: Add pods to admin nav config
4. UI pages: Build pages using existing components and patterns

---

## Phase 1: Database Schema Enhancement

### Overview
Enhance the pods schema to support full management requirements including manager tracking, expanded pod types, and sprint metrics.

### Changes Required:

#### 1. Create Migration File
**File**: `supabase/migrations/20251204000000_enhance_pods_schema.sql`

```sql
-- ============================================================================
-- Migration: Enhanced Pods Schema for Admin Portal
-- Date: 2025-12-04
-- Description: Adds manager support, expanded pod types, and sprint metrics
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE PODS TABLE
-- ============================================================================

-- Add manager_id to pods (the primary pod manager)
ALTER TABLE pods ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id);

-- Add description field
ALTER TABLE pods ADD COLUMN IF NOT EXISTS description TEXT;

-- Update pod_type constraint to include 'hr' and 'mixed'
-- First drop the existing check if any, then add new one
DO $$
BEGIN
  -- Remove old constraint if exists
  ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_pod_type_check;

  -- Add new constraint with expanded types
  ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check
    CHECK (pod_type IN ('recruiting', 'bench_sales', 'ta', 'hr', 'mixed'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add index for manager lookup
CREATE INDEX IF NOT EXISTS idx_pods_manager_id ON pods(manager_id);

-- ============================================================================
-- 2. POD_MANAGERS TABLE (Manager History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pod_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod reference
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,

  -- Manager reference
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Manager type
  is_primary BOOLEAN DEFAULT true,

  -- Assignment tracking
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  removed_at TIMESTAMPTZ,
  removed_by UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pod_managers_org_id ON pod_managers(org_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_pod_id ON pod_managers(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_user_id ON pod_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_active ON pod_managers(pod_id) WHERE removed_at IS NULL;

-- Unique constraint: one primary manager per pod at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_pod_managers_primary
  ON pod_managers(pod_id)
  WHERE is_primary = true AND removed_at IS NULL;

-- ============================================================================
-- 3. POD_SPRINT_METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS pod_sprint_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod reference
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,

  -- Sprint period
  sprint_number INTEGER NOT NULL,
  sprint_start_date DATE NOT NULL,
  sprint_end_date DATE NOT NULL,

  -- Targets
  placements_target INTEGER DEFAULT 2,
  placements_stretch_target INTEGER DEFAULT 3,
  submissions_target INTEGER DEFAULT 20,
  submissions_stretch_target INTEGER DEFAULT 30,
  client_meetings_target INTEGER DEFAULT 5,
  new_candidates_target INTEGER DEFAULT 30,

  -- Actuals (updated by triggers or batch jobs)
  placements_actual INTEGER DEFAULT 0,
  submissions_actual INTEGER DEFAULT 0,
  client_meetings_actual INTEGER DEFAULT 0,
  new_candidates_actual INTEGER DEFAULT 0,

  -- Calculated metrics
  target_achievement_pct NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN placements_target > 0
      THEN ROUND((placements_actual::numeric / placements_target * 100), 2)
      ELSE 0
    END
  ) STORED,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one active sprint per pod
  UNIQUE(pod_id, sprint_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_org_id ON pod_sprint_metrics(org_id);
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_pod_id ON pod_sprint_metrics(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_dates ON pod_sprint_metrics(sprint_start_date, sprint_end_date);
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_active ON pod_sprint_metrics(pod_id) WHERE status = 'active';

-- ============================================================================
-- 4. UPDATE PODS TABLE WITH SPRINT CONFIG DEFAULTS
-- ============================================================================

-- Add sprint configuration fields if not exist
ALTER TABLE pods ADD COLUMN IF NOT EXISTS sprint_start_day TEXT DEFAULT 'monday'
  CHECK (sprint_start_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));
ALTER TABLE pods ADD COLUMN IF NOT EXISTS send_sprint_summary BOOLEAN DEFAULT true;
ALTER TABLE pods ADD COLUMN IF NOT EXISTS send_midpoint_check BOOLEAN DEFAULT true;
ALTER TABLE pods ADD COLUMN IF NOT EXISTS alert_if_below_target BOOLEAN DEFAULT true;

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE pod_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_sprint_metrics ENABLE ROW LEVEL SECURITY;

-- Pod Managers: Organization isolation
CREATE POLICY IF NOT EXISTS "pod_managers_org_isolation" ON pod_managers
  FOR ALL
  USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()));

-- Pod Managers: Admin/HR write access
CREATE POLICY IF NOT EXISTS "pod_managers_admin_write" ON pod_managers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.auth_id = auth.uid()
      AND r.name IN ('admin', 'hr', 'hr_manager')
    )
  );

-- Pod Sprint Metrics: Organization isolation
CREATE POLICY IF NOT EXISTS "pod_sprint_metrics_org_isolation" ON pod_sprint_metrics
  FOR ALL
  USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()));

-- Pod Sprint Metrics: Employee read access
CREATE POLICY IF NOT EXISTS "pod_sprint_metrics_employee_read" ON pod_sprint_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE auth_id = auth.uid()
    )
  );

-- Pod Sprint Metrics: Admin/Manager write access
CREATE POLICY IF NOT EXISTS "pod_sprint_metrics_admin_write" ON pod_sprint_metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.auth_id = auth.uid()
      AND r.name IN ('admin', 'hr', 'hr_manager', 'recruiting_manager', 'bench_manager', 'ta_manager')
    )
  );

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Updated at trigger for pod_managers
CREATE OR REPLACE TRIGGER pod_managers_updated_at
  BEFORE UPDATE ON pod_managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for pod_sprint_metrics
CREATE OR REPLACE TRIGGER pod_sprint_metrics_updated_at
  BEFORE UPDATE ON pod_sprint_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================

COMMENT ON TABLE pod_managers IS 'Historical record of pod manager assignments';
COMMENT ON TABLE pod_sprint_metrics IS 'Sprint-based performance metrics for pods';
COMMENT ON COLUMN pods.manager_id IS 'Current primary manager of the pod';
COMMENT ON COLUMN pods.sprint_start_day IS 'Day of week when sprints begin';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
```

### Success Criteria:

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] Migration status shows complete: `pnpm db:status`
- [ ] No SQL errors in migration output

#### Manual Verification:
- [ ] Verify `pods` table has new columns in Supabase dashboard
- [ ] Verify `pod_managers` table exists with correct structure
- [ ] Verify `pod_sprint_metrics` table exists with correct structure
- [ ] Verify RLS policies are active on new tables

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 2.

---

## Phase 2: tRPC Router Implementation

### Overview
Create comprehensive tRPC procedures for pod management including CRUD operations, member management, and sprint configuration.

### Changes Required:

#### 1. Create Pods Router
**File**: `src/server/routers/pods.ts` (new file)

```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

// Input schemas
const podTypeSchema = z.enum(['recruiting', 'bench_sales', 'ta', 'hr', 'mixed'])
const regionSchema = z.enum(['us', 'canada', 'multi'])
const podStatusSchema = z.enum(['active', 'inactive'])

export const podsRouter = router({
  // ============================================
  // LIST PODS
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      podType: podTypeSchema.optional(),
      region: regionSchema.optional(),
      status: podStatusSchema.optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx
      const { search, podType, region, status, page, pageSize } = input

      let query = supabase
        .from('pods')
        .select(`
          *,
          manager:user_profiles!pods_manager_id_fkey(id, full_name, email, avatar_url),
          region:regions(id, name, code),
          members:pod_members(
            id,
            user:user_profiles(id, full_name, email, avatar_url),
            role,
            is_active
          )
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }
      if (podType) {
        query = query.eq('pod_type', podType)
      }
      if (region) {
        query = query.eq('region_id', region)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Pagination
      const offset = (page - 1) * pageSize
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pods',
        })
      }

      return {
        items: data ?? [],
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET POD BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const { data: pod, error } = await supabase
        .from('pods')
        .select(`
          *,
          manager:user_profiles!pods_manager_id_fkey(id, full_name, email, avatar_url, role_id),
          region:regions(id, name, code),
          members:pod_members(
            id,
            user:user_profiles(id, full_name, email, avatar_url, role_id),
            role,
            is_active,
            joined_at
          ),
          created_by_user:user_profiles!pods_created_by_fkey(id, full_name)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      return pod
    }),

  // ============================================
  // CREATE POD
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      description: z.string().optional(),
      podType: podTypeSchema,
      regionId: z.string().uuid().optional(),
      managerId: z.string().uuid(),
      memberIds: z.array(z.string().uuid()).optional(),
      sprintDurationWeeks: z.number().min(1).max(4).default(2),
      placementsPerSprintTarget: z.number().min(0).default(2),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Check for duplicate name
      const { data: existing } = await supabase
        .from('pods')
        .select('id')
        .eq('org_id', orgId)
        .eq('name', input.name)
        .is('deleted_at', null)
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A pod with this name already exists',
        })
      }

      // Create pod
      const { data: pod, error: podError } = await supabase
        .from('pods')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description,
          pod_type: input.podType,
          region_id: input.regionId,
          manager_id: input.managerId,
          sprint_duration_weeks: input.sprintDurationWeeks,
          placements_per_sprint_target: input.placementsPerSprintTarget,
          status: 'active',
          is_active: true,
          formed_date: new Date().toISOString().split('T')[0],
          created_by: user?.id,
        })
        .select()
        .single()

      if (podError || !pod) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create pod',
        })
      }

      // Add manager to pod_managers table
      await supabase
        .from('pod_managers')
        .insert({
          org_id: orgId,
          pod_id: pod.id,
          user_id: input.managerId,
          is_primary: true,
          assigned_by: user?.id,
        })

      // Add initial members if provided
      if (input.memberIds && input.memberIds.length > 0) {
        const memberInserts = input.memberIds.map(userId => ({
          org_id: orgId,
          pod_id: pod.id,
          user_id: userId,
          role: 'junior', // Default role for new members
          is_active: true,
        }))

        await supabase.from('pod_members').insert(memberInserts)
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'pods',
        record_id: pod.id,
        new_values: pod,
      })

      return pod
    }),

  // ============================================
  // UPDATE POD
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      description: z.string().optional(),
      podType: podTypeSchema.optional(),
      regionId: z.string().uuid().nullable().optional(),
      managerId: z.string().uuid().optional(),
      sprintDurationWeeks: z.number().min(1).max(4).optional(),
      placementsPerSprintTarget: z.number().min(0).optional(),
      sprintStartDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
      sendSprintSummary: z.boolean().optional(),
      sendMidpointCheck: z.boolean().optional(),
      alertIfBelowTarget: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const { id, managerId, ...updateData } = input

      // Get current pod
      const { data: currentPod, error: fetchError } = await supabase
        .from('pods')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !currentPod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      // Check for duplicate name if name is being changed
      if (updateData.name && updateData.name !== currentPod.name) {
        const { data: existing } = await supabase
          .from('pods')
          .select('id')
          .eq('org_id', orgId)
          .eq('name', updateData.name)
          .neq('id', id)
          .is('deleted_at', null)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A pod with this name already exists',
          })
        }
      }

      // Build update object with snake_case keys
      const updates: Record<string, unknown> = {}
      if (updateData.name !== undefined) updates.name = updateData.name
      if (updateData.description !== undefined) updates.description = updateData.description
      if (updateData.podType !== undefined) updates.pod_type = updateData.podType
      if (updateData.regionId !== undefined) updates.region_id = updateData.regionId
      if (updateData.sprintDurationWeeks !== undefined) updates.sprint_duration_weeks = updateData.sprintDurationWeeks
      if (updateData.placementsPerSprintTarget !== undefined) updates.placements_per_sprint_target = updateData.placementsPerSprintTarget
      if (updateData.sprintStartDay !== undefined) updates.sprint_start_day = updateData.sprintStartDay
      if (updateData.sendSprintSummary !== undefined) updates.send_sprint_summary = updateData.sendSprintSummary
      if (updateData.sendMidpointCheck !== undefined) updates.send_midpoint_check = updateData.sendMidpointCheck
      if (updateData.alertIfBelowTarget !== undefined) updates.alert_if_below_target = updateData.alertIfBelowTarget

      // Handle manager change
      if (managerId && managerId !== currentPod.manager_id) {
        updates.manager_id = managerId

        // Mark old manager as removed in pod_managers
        await supabase
          .from('pod_managers')
          .update({
            removed_at: new Date().toISOString(),
            removed_by: user?.id,
          })
          .eq('pod_id', id)
          .eq('is_primary', true)
          .is('removed_at', null)

        // Add new manager to pod_managers
        await supabase.from('pod_managers').insert({
          org_id: orgId,
          pod_id: id,
          user_id: managerId,
          is_primary: true,
          assigned_by: user?.id,
        })
      }

      // Update pod
      const { data: pod, error: updateError } = await supabase
        .from('pods')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !pod) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update pod',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'pods',
        record_id: pod.id,
        old_values: currentPod,
        new_values: pod,
      })

      return pod
    }),

  // ============================================
  // ADD MEMBERS
  // ============================================
  addMembers: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      members: z.array(z.object({
        userId: z.string().uuid(),
        role: z.enum(['senior', 'junior']).default('junior'),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Verify pod exists
      const { data: pod, error: podError } = await supabase
        .from('pods')
        .select('id')
        .eq('id', input.podId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (podError || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      // Check for existing members
      const userIds = input.members.map(m => m.userId)
      const { data: existingMembers } = await supabase
        .from('pod_members')
        .select('user_id')
        .eq('pod_id', input.podId)
        .in('user_id', userIds)
        .eq('is_active', true)

      const existingUserIds = new Set(existingMembers?.map(m => m.user_id) ?? [])
      const newMembers = input.members.filter(m => !existingUserIds.has(m.userId))

      if (newMembers.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'All specified users are already members of this pod',
        })
      }

      // Insert new members
      const memberInserts = newMembers.map(member => ({
        org_id: orgId,
        pod_id: input.podId,
        user_id: member.userId,
        role: member.role,
        is_active: true,
      }))

      const { data: members, error: insertError } = await supabase
        .from('pod_members')
        .insert(memberInserts)
        .select()

      if (insertError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add members',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'add_members',
        table_name: 'pod_members',
        record_id: input.podId,
        new_values: { added_members: newMembers },
      })

      return { added: members?.length ?? 0, skipped: existingUserIds.size }
    }),

  // ============================================
  // REMOVE MEMBERS
  // ============================================
  removeMembers: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      userIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Soft delete members (set is_active = false, left_at)
      const { data: removed, error } = await supabase
        .from('pod_members')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('pod_id', input.podId)
        .in('user_id', input.userIds)
        .eq('is_active', true)
        .select()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove members',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'remove_members',
        table_name: 'pod_members',
        record_id: input.podId,
        old_values: { removed_user_ids: input.userIds },
      })

      return { removed: removed?.length ?? 0 }
    }),

  // ============================================
  // TRANSFER MEMBERS
  // ============================================
  transferMembers: orgProtectedProcedure
    .input(z.object({
      fromPodId: z.string().uuid(),
      toPodId: z.string().uuid(),
      userIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Remove from source pod
      await supabase
        .from('pod_members')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('pod_id', input.fromPodId)
        .in('user_id', input.userIds)
        .eq('is_active', true)

      // Add to destination pod
      const memberInserts = input.userIds.map(userId => ({
        org_id: orgId,
        pod_id: input.toPodId,
        user_id: userId,
        role: 'junior',
        is_active: true,
      }))

      const { error } = await supabase
        .from('pod_members')
        .insert(memberInserts)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to transfer members',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'transfer_members',
        table_name: 'pod_members',
        record_id: input.fromPodId,
        new_values: {
          from_pod_id: input.fromPodId,
          to_pod_id: input.toPodId,
          transferred_user_ids: input.userIds,
        },
      })

      return { transferred: input.userIds.length }
    }),

  // ============================================
  // DEACTIVATE POD
  // ============================================
  deactivate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reassignToPodId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Get current pod with members
      const { data: pod, error: fetchError } = await supabase
        .from('pods')
        .select(`
          *,
          members:pod_members(user_id, is_active)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found',
        })
      }

      const activeMembers = pod.members?.filter((m: { is_active: boolean }) => m.is_active) ?? []

      // If pod has active members and no reassignment target, error
      if (activeMembers.length > 0 && !input.reassignToPodId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Pod has ${activeMembers.length} active member(s). Please reassign them first or specify a pod to transfer them to.`,
        })
      }

      // Transfer members if reassignment target provided
      if (activeMembers.length > 0 && input.reassignToPodId) {
        const userIds = activeMembers.map((m: { user_id: string }) => m.user_id)

        // Remove from current pod
        await supabase
          .from('pod_members')
          .update({
            is_active: false,
            left_at: new Date().toISOString(),
          })
          .eq('pod_id', input.id)
          .eq('is_active', true)

        // Add to new pod
        const memberInserts = userIds.map((userId: string) => ({
          org_id: orgId,
          pod_id: input.reassignToPodId,
          user_id: userId,
          role: 'junior',
          is_active: true,
        }))

        await supabase.from('pod_members').insert(memberInserts)
      }

      // Deactivate pod
      const { data: updated, error: updateError } = await supabase
        .from('pods')
        .update({
          status: 'inactive',
          is_active: false,
          dissolved_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to deactivate pod',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'deactivate',
        table_name: 'pods',
        record_id: input.id,
        old_values: pod,
        new_values: updated,
      })

      return updated
    }),

  // ============================================
  // REACTIVATE POD
  // ============================================
  reactivate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { data: pod, error } = await supabase
        .from('pods')
        .update({
          status: 'active',
          is_active: true,
          dissolved_date: null,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .eq('status', 'inactive')
        .select()
        .single()

      if (error || !pod) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pod not found or not inactive',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'reactivate',
        table_name: 'pods',
        record_id: input.id,
        new_values: pod,
      })

      return pod
    }),

  // ============================================
  // GET POD METRICS
  // ============================================
  getMetrics: orgProtectedProcedure
    .input(z.object({
      podId: z.string().uuid(),
      period: z.enum(['current_sprint', 'mtd', 'qtd', 'ytd']).default('mtd'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      // Get current sprint metrics if exists
      const { data: sprintMetrics } = await supabase
        .from('pod_sprint_metrics')
        .select('*')
        .eq('pod_id', input.podId)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('sprint_number', { ascending: false })
        .limit(1)
        .single()

      // For now, return mock data for other metrics
      // TODO: Implement actual metrics aggregation from placements/submissions tables
      return {
        sprintMetrics: sprintMetrics ?? null,
        openJobs: 0,
        submissionsMtd: 0,
        placementsMtd: 0,
        revenueMtd: 0,
      }
    }),

  // ============================================
  // GET AVAILABLE USERS (for member selection)
  // ============================================
  getAvailableUsers: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      excludePodId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      let query = supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, role_id')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('full_name')

      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
      }

      const { data: users, error } = await query.limit(50)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }

      return users ?? []
    }),

  // ============================================
  // GET REGIONS (for pod region selection)
  // ============================================
  getRegions: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      const { data: regions, error } = await supabase
        .from('regions')
        .select('id, name, code')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch regions',
        })
      }

      return regions ?? []
    }),
})
```

#### 2. Update Root Router
**File**: `src/server/trpc/root.ts`
**Changes**: Add pods router

```typescript
import { router } from './init'
import { adminRouter } from '../routers/admin'
import { podsRouter } from '../routers/pods'

export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
})

export type AppRouter = typeof appRouter
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] tRPC types generate correctly
- [ ] No linting errors: `pnpm lint`

#### Manual Verification:
- [ ] Test `pods.list` via tRPC panel or API call
- [ ] Test `pods.create` with sample data
- [ ] Test `pods.getById` returns full pod details
- [ ] Test member management procedures

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 3.

---

## Phase 3: Navigation Configuration

### Overview
Add Pods to the admin navigation sidebar under User Management section.

### Changes Required:

#### 1. Update Admin Navigation Config
**File**: `src/lib/navigation/adminNavConfig.ts`
**Changes**: Add Pods item

```typescript
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Workflow,
  FileText,
  Bell,
  Flag,
  AlertTriangle,
  Database,
  Network, // Add this import for Pods icon
} from 'lucide-react'
import type { SidebarSection } from '@/components/navigation/Sidebar'

export const adminNavSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/employee/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        label: 'Users',
        href: '/employee/admin/users',
        icon: Users,
      },
      {
        label: 'Pods',
        href: '/employee/admin/pods',
        icon: Network,
      },
      {
        label: 'Roles',
        href: '/employee/admin/roles',
        icon: Shield,
      },
      {
        label: 'Permissions',
        href: '/employee/admin/permissions',
        icon: Shield,
      },
    ],
  },
  // ... rest remains the same
]
```

### Success Criteria:

#### Automated Verification:
- [ ] No TypeScript errors: `pnpm build`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to admin portal, see "Pods" in sidebar
- [ ] Click "Pods" navigates to `/employee/admin/pods`

**Implementation Note**: After completing this phase, proceed to Phase 4.

---

## Phase 4: Pod List Page

### Overview
Create the main pod list page with search, filters, and data table.

### Changes Required:

#### 1. Create Pod List Page
**File**: `src/app/employee/admin/pods/page.tsx`

```typescript
export const dynamic = 'force-dynamic'

import { PodsListPage } from '@/components/admin/pods/PodsListPage'

export default function PodsPage() {
  return <PodsListPage />
}
```

#### 2. Create Pods List Component
**File**: `src/components/admin/pods/PodsListPage.tsx`

```typescript
'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Search, Users, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const POD_TYPE_LABELS: Record<string, string> = {
  recruiting: 'Recruiting',
  bench_sales: 'Bench Sales',
  ta: 'TA',
  hr: 'HR',
  mixed: 'Mixed',
}

const POD_TYPE_COLORS: Record<string, string> = {
  recruiting: 'bg-blue-100 text-blue-800',
  bench_sales: 'bg-purple-100 text-purple-800',
  ta: 'bg-cyan-100 text-cyan-800',
  hr: 'bg-pink-100 text-pink-800',
  mixed: 'bg-gray-100 text-gray-800',
}

export function PodsListPage() {
  const [search, setSearch] = useState('')
  const [podType, setPodType] = useState<string>('')
  const [status, setStatus] = useState<string>('active')
  const [page, setPage] = useState(1)

  const podsQuery = trpc.pods.list.useQuery({
    search: search || undefined,
    podType: podType as 'recruiting' | 'bench_sales' | 'ta' | 'hr' | 'mixed' | undefined,
    status: status as 'active' | 'inactive' | undefined,
    page,
    pageSize: 20,
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Pods' },
  ]

  return (
    <DashboardShell
      title="Pods"
      description="Manage organizational pods and team structures"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/pods/new">
          <Button className="bg-forest-600 hover:bg-forest-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Pod
          </Button>
        </Link>
      }
    >
      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search pods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={podType} onValueChange={setPodType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="recruiting">Recruiting</SelectItem>
              <SelectItem value="bench_sales">Bench Sales</SelectItem>
              <SelectItem value="ta">TA</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {podsQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : podsQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load pods. Please try again.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pod Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {podsQuery.data?.items.map((pod) => (
                  <TableRow key={pod.id}>
                    <TableCell>
                      <Link
                        href={`/employee/admin/pods/${pod.id}`}
                        className="font-medium text-charcoal-900 hover:text-forest-600"
                      >
                        {pod.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {pod.manager ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={pod.manager.avatar_url} />
                            <AvatarFallback>
                              {pod.manager.full_name?.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{pod.manager.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-400">No manager</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-charcoal-400" />
                        <span>{pod.members?.filter((m: { is_active: boolean }) => m.is_active).length ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={POD_TYPE_COLORS[pod.pod_type] ?? 'bg-gray-100'}>
                        {POD_TYPE_LABELS[pod.pod_type] ?? pod.pod_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pod.region?.name ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pod.status === 'active' ? 'default' : 'secondary'}>
                        {pod.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/employee/admin/pods/${pod.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/employee/admin/pods/${pod.id}/edit`}>
                              Edit Pod
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {podsQuery.data && podsQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, podsQuery.data.pagination.total)} of {podsQuery.data.pagination.total} pods
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= podsQuery.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to `/employee/admin/pods`
- [ ] See pod list table with columns
- [ ] Search filters pods by name
- [ ] Type dropdown filters pods
- [ ] Status dropdown filters pods
- [ ] Pagination works correctly
- [ ] Click pod name navigates to detail page

**Implementation Note**: After completing this phase, proceed to Phase 5.

---

## Phase 5: Pod Create/Edit Form

### Overview
Create the pod creation form page with all required fields.

### Changes Required:

#### 1. Create Pod Form Page
**File**: `src/app/employee/admin/pods/new/page.tsx`

```typescript
export const dynamic = 'force-dynamic'

import { PodFormPage } from '@/components/admin/pods/PodFormPage'

export default function NewPodPage() {
  return <PodFormPage mode="create" />
}
```

#### 2. Create Pod Edit Page
**File**: `src/app/employee/admin/pods/[id]/edit/page.tsx`

```typescript
export const dynamic = 'force-dynamic'

import { PodFormPage } from '@/components/admin/pods/PodFormPage'

export default function EditPodPage({ params }: { params: { id: string } }) {
  return <PodFormPage mode="edit" podId={params.id} />
}
```

#### 3. Create Pod Form Component
**File**: `src/components/admin/pods/PodFormPage.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PodFormPageProps {
  mode: 'create' | 'edit'
  podId?: string
}

export function PodFormPage({ mode, podId }: PodFormPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [podType, setPodType] = useState<string>('recruiting')
  const [regionId, setRegionId] = useState<string>('')
  const [managerId, setManagerId] = useState<string>('')
  const [selectedMembers, setSelectedMembers] = useState<Array<{
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }>>([])
  const [sprintDurationWeeks, setSprintDurationWeeks] = useState(2)
  const [placementsTarget, setPlacementsTarget] = useState(2)
  const [userSearch, setUserSearch] = useState('')

  // Queries
  const podQuery = trpc.pods.getById.useQuery(
    { id: podId! },
    { enabled: mode === 'edit' && !!podId }
  )
  const regionsQuery = trpc.pods.getRegions.useQuery()
  const usersQuery = trpc.pods.getAvailableUsers.useQuery({
    search: userSearch || undefined,
  })

  // Mutations
  const createMutation = trpc.pods.create.useMutation({
    onSuccess: () => {
      toast.success('Pod created successfully')
      utils.pods.list.invalidate()
      router.push('/employee/admin/pods')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create pod')
    },
  })

  const updateMutation = trpc.pods.update.useMutation({
    onSuccess: () => {
      toast.success('Pod updated successfully')
      utils.pods.list.invalidate()
      utils.pods.getById.invalidate({ id: podId! })
      router.push(`/employee/admin/pods/${podId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update pod')
    },
  })

  // Load existing pod data for edit mode
  useEffect(() => {
    if (mode === 'edit' && podQuery.data) {
      const pod = podQuery.data
      setName(pod.name)
      setDescription(pod.description ?? '')
      setPodType(pod.pod_type)
      setRegionId(pod.region_id ?? '')
      setManagerId(pod.manager_id ?? '')
      setSprintDurationWeeks(pod.sprint_duration_weeks ?? 2)
      setPlacementsTarget(pod.placements_per_sprint_target ?? 2)
      // Set existing members
      if (pod.members) {
        setSelectedMembers(
          pod.members
            .filter((m: { is_active: boolean }) => m.is_active)
            .map((m: { user: { id: string; full_name: string; email: string; avatar_url?: string } }) => m.user)
        )
      }
    }
  }, [mode, podQuery.data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Pod name is required')
      return
    }
    if (!managerId) {
      toast.error('Please select a pod manager')
      return
    }

    if (mode === 'create') {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        podType: podType as 'recruiting' | 'bench_sales' | 'ta' | 'hr' | 'mixed',
        regionId: regionId || undefined,
        managerId,
        memberIds: selectedMembers.map(m => m.id),
        sprintDurationWeeks,
        placementsPerSprintTarget: placementsTarget,
      })
    } else {
      updateMutation.mutate({
        id: podId!,
        name: name.trim(),
        description: description.trim() || undefined,
        podType: podType as 'recruiting' | 'bench_sales' | 'ta' | 'hr' | 'mixed',
        regionId: regionId || null,
        managerId,
        sprintDurationWeeks,
        placementsPerSprintTarget: placementsTarget,
      })
    }
  }

  const addMember = (user: { id: string; full_name: string; email: string; avatar_url?: string }) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user])
    }
    setUserSearch('')
  }

  const removeMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== userId))
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Pods', href: '/employee/admin/pods' },
    { label: mode === 'create' ? 'New Pod' : 'Edit Pod' },
  ]

  const isLoading = createMutation.isPending || updateMutation.isPending

  if (mode === 'edit' && podQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      title={mode === 'create' ? 'Create New Pod' : 'Edit Pod'}
      description={mode === 'create' ? 'Set up a new organizational pod' : 'Update pod details'}
      breadcrumbs={breadcrumbs}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-6">
          {/* Pod Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Pod Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Recruiting Alpha"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this pod's focus..."
              rows={3}
            />
          </div>

          {/* Pod Type */}
          <div className="space-y-2">
            <Label htmlFor="podType">Pod Type *</Label>
            <Select value={podType} onValueChange={setPodType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiting">Recruiting</SelectItem>
                <SelectItem value="bench_sales">Bench Sales</SelectItem>
                <SelectItem value="ta">TA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label>Region *</Label>
            <RadioGroup value={regionId} onValueChange={setRegionId} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="region-none" />
                <Label htmlFor="region-none">No Region</Label>
              </div>
              {regionsQuery.data?.map((region) => (
                <div key={region.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={region.id} id={`region-${region.id}`} />
                  <Label htmlFor={`region-${region.id}`}>{region.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Pod Manager */}
          <div className="space-y-2">
            <Label htmlFor="manager">Pod Manager *</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {usersQuery.data?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar_url ?? undefined} />
                        <AvatarFallback>
                          {user.full_name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {user.full_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initial Members (Create mode only) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label>Initial Members (Optional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search and add users..."
                  className="pl-10"
                />
              </div>
              {userSearch && usersQuery.data && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-charcoal-200 rounded-lg shadow-lg">
                  {usersQuery.data
                    .filter(u => !selectedMembers.find(m => m.id === u.id) && u.id !== managerId)
                    .map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addMember(user)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-charcoal-50 text-left"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {user.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.full_name}</div>
                          <div className="text-xs text-charcoal-500">{user.email}</div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMembers.map(member => (
                    <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                      {member.full_name}
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sprint Configuration */}
          <div className="border-t border-charcoal-100 pt-6 space-y-4">
            <h3 className="font-semibold text-charcoal-900">Sprint Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sprintDuration">Sprint Duration (weeks)</Label>
                <Select
                  value={sprintDurationWeeks.toString()}
                  onValueChange={(v) => setSprintDurationWeeks(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 week</SelectItem>
                    <SelectItem value="2">2 weeks</SelectItem>
                    <SelectItem value="3">3 weeks</SelectItem>
                    <SelectItem value="4">4 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placementsTarget">Placements Target</Label>
                <Input
                  id="placementsTarget"
                  type="number"
                  min={0}
                  max={99}
                  value={placementsTarget}
                  onChange={(e) => setPlacementsTarget(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-forest-600 hover:bg-forest-700 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Pod' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardShell>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to `/employee/admin/pods/new`
- [ ] Fill form with valid data
- [ ] Submit creates pod and redirects to list
- [ ] Validation errors show for invalid data
- [ ] Edit mode loads existing pod data

**Implementation Note**: After completing this phase, proceed to Phase 6.

---

## Phase 6: Pod Detail Page

### Overview
Create the pod detail page with member management, metrics, and actions.

### Changes Required:

#### 1. Create Pod Detail Page
**File**: `src/app/employee/admin/pods/[id]/page.tsx`

```typescript
export const dynamic = 'force-dynamic'

import { PodDetailPage } from '@/components/admin/pods/PodDetailPage'

export default function PodPage({ params }: { params: { id: string } }) {
  return <PodDetailPage podId={params.id} />
}
```

#### 2. Create Pod Detail Component
**File**: `src/components/admin/pods/PodDetailPage.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
  DashboardGrid,
} from '@/components/dashboard/DashboardShell'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Edit,
  UserPlus,
  UserMinus,
  Power,
  PowerOff,
  Loader2,
  Briefcase,
  FileText,
  Target,
  DollarSign,
  Crown,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AddMembersDialog } from './AddMembersDialog'

interface PodDetailPageProps {
  podId: string
}

const POD_TYPE_LABELS: Record<string, string> = {
  recruiting: 'Recruiting',
  bench_sales: 'Bench Sales',
  ta: 'TA',
  hr: 'HR',
  mixed: 'Mixed',
}

export function PodDetailPage({ podId }: PodDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [showAddMembers, setShowAddMembers] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  const podQuery = trpc.pods.getById.useQuery({ id: podId })
  const metricsQuery = trpc.pods.getMetrics.useQuery({ podId, period: 'mtd' })

  const removeMemberMutation = trpc.pods.removeMembers.useMutation({
    onSuccess: () => {
      toast.success('Member removed')
      utils.pods.getById.invalidate({ id: podId })
      setMemberToRemove(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  const deactivateMutation = trpc.pods.deactivate.useMutation({
    onSuccess: () => {
      toast.success('Pod deactivated')
      utils.pods.list.invalidate()
      router.push('/employee/admin/pods')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to deactivate pod')
    },
  })

  const reactivateMutation = trpc.pods.reactivate.useMutation({
    onSuccess: () => {
      toast.success('Pod reactivated')
      utils.pods.getById.invalidate({ id: podId })
      utils.pods.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reactivate pod')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Pods', href: '/employee/admin/pods' },
    { label: podQuery.data?.name ?? 'Pod Details' },
  ]

  if (podQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
        </div>
      </DashboardShell>
    )
  }

  if (podQuery.error || !podQuery.data) {
    return (
      <DashboardShell title="Error" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <p className="text-red-600">Pod not found or failed to load.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/employee/admin/pods')}
          >
            Back to Pods
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const pod = podQuery.data
  const activeMembers = pod.members?.filter((m: { is_active: boolean }) => m.is_active) ?? []

  return (
    <DashboardShell
      title={pod.name}
      description={`${POD_TYPE_LABELS[pod.pod_type] ?? pod.pod_type} Pod${pod.region ? ` • ${pod.region.name}` : ''}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          {pod.status === 'active' ? (
            <>
              <Link href={`/employee/admin/pods/${podId}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setShowDeactivateDialog(true)}
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            </>
          ) : (
            <Button
              className="bg-forest-600 hover:bg-forest-700 text-white"
              onClick={() => reactivateMutation.mutate({ id: podId })}
              disabled={reactivateMutation.isPending}
            >
              {reactivateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Power className="w-4 h-4 mr-2" />
              Reactivate
            </Button>
          )}
        </div>
      }
    >
      {/* Status Banner for Inactive */}
      {pod.status === 'inactive' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 font-medium">
            This pod is currently inactive. Reactivate it to resume operations.
          </p>
        </div>
      )}

      {/* Pod Metrics */}
      <DashboardSection title="Pod Metrics">
        <DashboardGrid columns={4}>
          <StatsCard
            title="Open Jobs"
            value={metricsQuery.data?.openJobs ?? 0}
            icon={Briefcase}
          />
          <StatsCard
            title="Submissions (MTD)"
            value={metricsQuery.data?.submissionsMtd ?? 0}
            icon={FileText}
          />
          <StatsCard
            title="Placements (MTD)"
            value={metricsQuery.data?.placementsMtd ?? 0}
            icon={Target}
            variant="success"
          />
          <StatsCard
            title="Revenue (MTD)"
            value={`$${(metricsQuery.data?.revenueMtd ?? 0).toLocaleString()}`}
            icon={DollarSign}
          />
        </DashboardGrid>
      </DashboardSection>

      {/* Members Section */}
      <DashboardSection
        title={`Members (${activeMembers.length})`}
        action={
          pod.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMembers(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Members
            </Button>
          )
        }
      >
        <div className="bg-white rounded-xl border border-charcoal-100 divide-y divide-charcoal-100">
          {/* Manager */}
          {pod.manager && (
            <div className="p-4 flex items-center justify-between bg-forest-50/50">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={pod.manager.avatar_url} />
                  <AvatarFallback>
                    {pod.manager.full_name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-charcoal-900">
                      {pod.manager.full_name}
                    </span>
                    <Badge variant="secondary" className="bg-forest-100 text-forest-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Manager
                    </Badge>
                  </div>
                  <span className="text-sm text-charcoal-500">{pod.manager.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Members */}
          {activeMembers.length === 0 ? (
            <div className="p-8 text-center text-charcoal-500">
              No members assigned to this pod yet.
            </div>
          ) : (
            activeMembers.map((member: {
              id: string
              user: { id: string; full_name: string; email: string; avatar_url?: string }
              role: string
              joined_at: string
            }) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.user.avatar_url} />
                    <AvatarFallback>
                      {member.user.full_name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal-900">
                        {member.user.full_name}
                      </span>
                      <Badge variant="outline">
                        {member.role === 'senior' ? 'Senior' : 'Junior'}
                      </Badge>
                    </div>
                    <span className="text-sm text-charcoal-500">
                      {member.user.email} • Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {pod.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-charcoal-400 hover:text-red-600"
                    onClick={() => setMemberToRemove(member.user.id)}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DashboardSection>

      {/* Sprint Configuration Section */}
      <DashboardSection title="Sprint Configuration">
        <div className="bg-white rounded-xl border border-charcoal-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-charcoal-500">Sprint Duration</p>
              <p className="font-semibold">{pod.sprint_duration_weeks ?? 2} weeks</p>
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Placements Target</p>
              <p className="font-semibold">{pod.placements_per_sprint_target ?? 2} per sprint</p>
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Sprint Start Day</p>
              <p className="font-semibold capitalize">{pod.sprint_start_day ?? 'Monday'}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Status</p>
              <Badge variant={pod.status === 'active' ? 'default' : 'secondary'}>
                {pod.status}
              </Badge>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* Add Members Dialog */}
      <AddMembersDialog
        open={showAddMembers}
        onOpenChange={setShowAddMembers}
        podId={podId}
        existingMemberIds={activeMembers.map((m: { user: { id: string } }) => m.user.id)}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the pod? They can be added back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (memberToRemove) {
                  removeMemberMutation.mutate({
                    podId,
                    userIds: [memberToRemove],
                  })
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Pod</AlertDialogTitle>
            <AlertDialogDescription>
              {activeMembers.length > 0
                ? `This pod has ${activeMembers.length} active member(s). You'll need to reassign them before deactivating.`
                : 'Are you sure you want to deactivate this pod? It can be reactivated later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={activeMembers.length > 0}
              onClick={() => {
                deactivateMutation.mutate({ id: podId })
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
```

#### 3. Create Add Members Dialog
**File**: `src/components/admin/pods/AddMembersDialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  podId: string
  existingMemberIds: string[]
}

export function AddMembersDialog({
  open,
  onOpenChange,
  podId,
  existingMemberIds,
}: AddMembersDialogProps) {
  const utils = trpc.useUtils()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const usersQuery = trpc.pods.getAvailableUsers.useQuery({
    search: search || undefined,
    excludePodId: podId,
  })

  const addMembersMutation = trpc.pods.addMembers.useMutation({
    onSuccess: (data) => {
      toast.success(`Added ${data.added} member(s)`)
      utils.pods.getById.invalidate({ id: podId })
      setSelectedIds([])
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add members')
    },
  })

  const availableUsers = usersQuery.data?.filter(
    u => !existingMemberIds.includes(u.id)
  ) ?? []

  const toggleUser = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    addMembersMutation.mutate({
      podId,
      members: selectedIds.map(userId => ({ userId, role: 'junior' })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>

          {/* User List */}
          <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
            {usersQuery.isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-charcoal-400" />
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="p-4 text-center text-charcoal-500">
                No users available
              </div>
            ) : (
              availableUsers.map(user => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-charcoal-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {user.full_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-charcoal-500 truncate">{user.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || addMembersMutation.isPending}
              className="bg-forest-600 hover:bg-forest-700 text-white"
            >
              {addMembersMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to `/employee/admin/pods/{id}`
- [ ] See pod details with manager and members
- [ ] See pod metrics cards
- [ ] Add member dialog works
- [ ] Remove member works with confirmation
- [ ] Deactivate/Reactivate works correctly
- [ ] Edit link navigates to edit page

**Implementation Note**: After completing this phase, all core pod management functionality is complete.

---

## Testing Strategy

### Unit Tests:
- Pod router procedures validation
- Input schema validation (Zod)
- Error handling for edge cases

### Integration Tests:
- Full CRUD flow via tRPC
- Member management operations
- Deactivation with member reassignment

### Manual Testing Steps:
1. Create a new pod with manager and 2 members
2. Verify pod appears in list with correct data
3. Edit pod name and change manager
4. Add 2 more members via Add Members dialog
5. Remove 1 member from pod
6. Deactivate pod (should fail if members exist)
7. Remove all members, then deactivate
8. Reactivate pod
9. Verify audit logs captured all actions

### Test Cases Table:

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-POD-001 | View pods list | Shows all org pods with correct data |
| ADMIN-POD-002 | Search pods | Filters pods by name |
| ADMIN-POD-003 | Create pod | Pod created with manager assigned |
| ADMIN-POD-004 | Create pod with duplicate name | Error: "A pod with this name already exists" |
| ADMIN-POD-005 | Edit pod | Pod updated, audit log created |
| ADMIN-POD-006 | Add members | Members added to pod |
| ADMIN-POD-007 | Remove members | Members removed from pod |
| ADMIN-POD-008 | Transfer member | Member moved between pods |
| ADMIN-POD-009 | Deactivate pod with members | Error: "Please reassign members first" |
| ADMIN-POD-010 | Deactivate empty pod | Pod deactivated successfully |
| ADMIN-POD-011 | Reactivate pod | Pod status set to active |
| ADMIN-POD-012 | Change pod manager | Old manager demoted, new promoted |
| ADMIN-POD-013 | Filter by type | Shows only pods of selected type |
| ADMIN-POD-014 | Filter by status | Shows only active/inactive pods |
| ADMIN-POD-015 | Non-admin access | Returns 403 Forbidden |

---

## Performance Considerations

1. **List pagination**: Default 20 items per page to avoid slow queries
2. **User search debounce**: 300ms debounce on user search inputs
3. **Query caching**: tRPC queries use React Query caching (5 min stale time)
4. **Indexes**: All foreign keys and filter columns are indexed

---

## Migration Notes

- Migration is additive - no breaking changes to existing data
- Existing pods will have `manager_id` as NULL initially
- Admin should assign managers to existing pods after migration
- `senior_member_id` and `junior_member_id` columns remain for backwards compatibility

---

## References

- Original epic: `thoughts/shared/epics/epic-01-admin/02-pod-management.md`
- Gap analysis: `thoughts/shared/research/2025-12-03-admin-portal-specs-gap-analysis.md`
- Admin router pattern: `src/server/routers/admin.ts`
- Dashboard pattern: `src/components/admin/AdminDashboard.tsx`
- Functional spec: `docs/specs/20-USER-ROLES/10-admin/02-configure-pods.md`
