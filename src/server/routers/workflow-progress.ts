import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import {
  WORKFLOW_DEFINITIONS,
  getWorkflowDefinition,
  calculateCurrentStage,
  getStageStatus,
  getWorkflowProgress,
  type StageStatus,
} from '@/lib/workflows/workflow-guide-definitions'

// ============================================
// WORKFLOW PROGRESS ROUTER
// Provides workflow guidance and progress tracking
// ============================================

export const workflowProgressRouter = router({
  // ============================================
  // GET WORKFLOW PROGRESS
  // Returns current stage, progress, and next actions
  // ============================================
  get: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get workflow definition
      const workflow = getWorkflowDefinition(input.entityType)
      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No workflow defined for entity type: ${input.entityType}`,
        })
      }

      // Get entity data
      const tableName = getTableName(input.entityType)
      const { data: entity, error } = await adminClient
        .from(tableName)
        .select('*')
        .eq('id', input.entityId)
        .eq('org_id', orgId)
        .single()

      if (error || !entity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entity not found',
        })
      }

      // Calculate progress
      const progress = getWorkflowProgress(workflow, entity)
      const currentStage = progress.currentStage

      // Build stage statuses
      const stagesWithStatus = workflow.stages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        description: stage.description,
        guidance: stage.guidance,
        status: getStageStatus(stage, entity, currentStage?.id ?? ''),
        isComplete: stage.isComplete(entity),
        actions: stage.actions,
        sla: stage.sla,
      }))

      // Get blockers
      const blockers = currentStage?.blockers
        ?.filter((b) => b.condition(entity))
        .map((b) => b.message) ?? []

      // Calculate SLA status
      const slaStatus = calculateSlaStatus(entity, currentStage)

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        entityType: input.entityType,
        entityId: input.entityId,
        progress: {
          completedStages: progress.completedStages,
          totalStages: progress.totalStages,
          percentage: progress.percentage,
        },
        currentStage: currentStage
          ? {
              id: currentStage.id,
              name: currentStage.name,
              description: currentStage.description,
              guidance: currentStage.guidance,
            }
          : null,
        stages: stagesWithStatus,
        nextActions: progress.nextActions,
        blockers,
        slaStatus,
      }
    }),

  // ============================================
  // GET GUIDANCE FOR STAGE
  // Returns detailed guidance for a specific stage
  // ============================================
  guidance: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      stageId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const workflow = getWorkflowDefinition(input.entityType)
      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No workflow defined for entity type: ${input.entityType}`,
        })
      }

      // Get entity
      const tableName = getTableName(input.entityType)
      const { data: entity } = await adminClient
        .from(tableName)
        .select('*')
        .eq('id', input.entityId)
        .eq('org_id', orgId)
        .single()

      if (!entity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entity not found',
        })
      }

      // Get stage (current or specified)
      const stage = input.stageId
        ? workflow.stages.find((s) => s.id === input.stageId)
        : calculateCurrentStage(workflow, entity)

      if (!stage) {
        return {
          guidance: null,
          tips: [],
          relatedLinks: [],
        }
      }

      // Build guidance response
      return {
        stageId: stage.id,
        stageName: stage.name,
        guidance: stage.guidance ?? stage.description,
        actions: stage.actions.map((action) => ({
          id: action.id,
          label: action.label,
          description: action.description,
          type: action.type,
          isPrimary: action.isPrimary,
          href: action.href,
        })),
        tips: getStageSpecificTips(input.entityType, stage.id),
        relatedLinks: getRelatedLinks(input.entityType, stage.id),
        checklist: getStageChecklist(input.entityType, stage.id),
      }
    }),

  // ============================================
  // GET ALL WORKFLOWS
  // Returns list of all defined workflows
  // ============================================
  list: orgProtectedProcedure.query(async () => {
    return Object.values(WORKFLOW_DEFINITIONS).map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
      entityType: workflow.entityType,
      description: workflow.description,
      stageCount: workflow.stages.length,
    }))
  }),

  // ============================================
  // BATCH GET PROGRESS
  // Get progress for multiple entities at once
  // ============================================
  batchGet: orgProtectedProcedure
    .input(z.object({
      items: z.array(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
      })).max(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const results: Array<{
        entityType: string
        entityId: string
        progress: { completedStages: number; totalStages: number; percentage: number } | null
        currentStageName: string | null
        error?: string
      }> = []

      // Group by entity type for efficient querying
      const byType: Record<string, string[]> = {}
      for (const item of input.items) {
        if (!byType[item.entityType]) {
          byType[item.entityType] = []
        }
        byType[item.entityType].push(item.entityId)
      }

      // Fetch each type
      for (const [entityType, ids] of Object.entries(byType)) {
        const workflow = getWorkflowDefinition(entityType)
        if (!workflow) {
          // No workflow for this type
          for (const id of ids) {
            results.push({
              entityType,
              entityId: id,
              progress: null,
              currentStageName: null,
              error: 'No workflow defined',
            })
          }
          continue
        }

        const tableName = getTableName(entityType)
        const { data: entities } = await adminClient
          .from(tableName)
          .select('*')
          .eq('org_id', orgId)
          .in('id', ids)

        const entityMap = new Map((entities ?? []).map((e) => [e.id, e]))

        for (const id of ids) {
          const entity = entityMap.get(id)
          if (!entity) {
            results.push({
              entityType,
              entityId: id,
              progress: null,
              currentStageName: null,
              error: 'Entity not found',
            })
            continue
          }

          const progress = getWorkflowProgress(workflow, entity)
          results.push({
            entityType,
            entityId: id,
            progress: {
              completedStages: progress.completedStages,
              totalStages: progress.totalStages,
              percentage: progress.percentage,
            },
            currentStageName: progress.currentStage?.name ?? null,
          })
        }
      }

      return results
    }),
})

// ============================================
// Helper Functions
// ============================================

function getTableName(entityType: string): string {
  const tableMap: Record<string, string> = {
    job: 'jobs',
    candidate: 'candidates',
    submission: 'submissions',
    placement: 'placements',
    account: 'accounts',
    contact: 'contacts',
    lead: 'leads',
    deal: 'deals',
  }

  return tableMap[entityType] ?? entityType
}

function calculateSlaStatus(
  entity: Record<string, unknown>,
  currentStage: { sla?: { hours: number; warningThreshold: number } } | null
): {
  hasDeadline: boolean
  hoursRemaining?: number
  isWarning?: boolean
  isOverdue?: boolean
  deadline?: string
} | null {
  if (!currentStage?.sla) {
    return null
  }

  // Get stage start time (would need to track this in real implementation)
  const stageStartedAt = entity.stage_started_at || entity.updated_at || entity.created_at
  if (!stageStartedAt) {
    return { hasDeadline: false }
  }

  const startTime = new Date(stageStartedAt as string)
  const deadline = new Date(startTime.getTime() + currentStage.sla.hours * 60 * 60 * 1000)
  const now = new Date()

  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  const totalHours = currentStage.sla.hours
  const warningThreshold = currentStage.sla.warningThreshold

  return {
    hasDeadline: true,
    hoursRemaining: Math.max(0, Math.round(hoursRemaining * 10) / 10),
    isWarning: hoursRemaining > 0 && hoursRemaining < totalHours * (1 - warningThreshold),
    isOverdue: hoursRemaining <= 0,
    deadline: deadline.toISOString(),
  }
}

function getStageSpecificTips(entityType: string, stageId: string): string[] {
  // Stage-specific tips (could be stored in DB in real implementation)
  const tips: Record<string, Record<string, string[]>> = {
    job: {
      intake: [
        'Ask about team culture and reporting structure',
        'Clarify must-have vs nice-to-have requirements',
        'Understand timeline and urgency',
      ],
      sourcing: [
        'Check AI-matched candidates first',
        'Look at candidates who recently updated profiles',
        'Consider internal bench candidates',
      ],
      submission: [
        'Follow up within 24-48 hours',
        'Ask for specific feedback on rejections',
        'Keep candidates informed of status',
      ],
    },
    candidate: {
      sourcing: [
        'Personalize your outreach message',
        'Mention specific skills you noticed',
        'Be clear about the opportunity',
      ],
      qualification: [
        'Verify work authorization early',
        'Confirm rate expectations',
        'Check availability and notice period',
      ],
    },
  }

  return tips[entityType]?.[stageId] ?? []
}

function getRelatedLinks(entityType: string, stageId: string): Array<{ label: string; href: string }> {
  // Related help links (could be stored in DB)
  const links: Record<string, Record<string, Array<{ label: string; href: string }>>> = {
    job: {
      intake: [
        { label: 'Intake Call Template', href: '/templates/intake' },
        { label: 'Requirements Guide', href: '/help/requirements' },
      ],
      sourcing: [
        { label: 'Search Tips', href: '/help/search' },
        { label: 'AI Matching Guide', href: '/help/ai-matching' },
      ],
    },
  }

  return links[entityType]?.[stageId] ?? []
}

function getStageChecklist(entityType: string, stageId: string): Array<{ id: string; label: string; required: boolean }> {
  // Stage checklists (could be stored in DB)
  const checklists: Record<string, Record<string, Array<{ id: string; label: string; required: boolean }>>> = {
    job: {
      intake: [
        { id: 'call_completed', label: 'Intake call completed', required: true },
        { id: 'requirements_documented', label: 'Requirements documented', required: true },
        { id: 'rate_confirmed', label: 'Rate/salary confirmed', required: true },
        { id: 'timeline_set', label: 'Timeline established', required: false },
      ],
      sourcing: [
        { id: 'matches_reviewed', label: 'AI matches reviewed', required: false },
        { id: 'pool_searched', label: 'Pool searched', required: false },
        { id: 'candidates_selected', label: 'Candidates selected', required: true },
      ],
    },
  }

  return checklists[entityType]?.[stageId] ?? []
}
