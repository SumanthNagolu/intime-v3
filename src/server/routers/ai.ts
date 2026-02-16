import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { getAIService } from '@/lib/ai/ai-service'

// ============================================
// AI ROUTER
// Phase 4: Intelligence
// ============================================

// Schemas
const interactionTypeSchema = z.enum(['question', 'suggestion', 'action', 'analysis', 'summary'])
const suggestionStatusSchema = z.enum(['pending', 'accepted', 'dismissed', 'expired'])
const suggestionPrioritySchema = z.enum(['critical', 'high', 'medium', 'low'])

export const aiRouter = router({
  // ============================================
  // CONVERSATIONS
  // ============================================

  conversations: router({
    // List conversations
    list: orgProtectedProcedure
      .input(z.object({
        contextType: z.string().optional(),
        contextEntityType: z.string().optional(),
        contextEntityId: z.string().uuid().optional(),
        includeArchived: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('ai_conversations')
          .select('*')
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)

        if (!input.includeArchived) {
          query = query.eq('is_archived', false)
        }

        if (input.contextType) {
          query = query.eq('context_type', input.contextType)
        }

        if (input.contextEntityType && input.contextEntityId) {
          query = query
            .eq('context_entity_type', input.contextEntityType)
            .eq('context_entity_id', input.contextEntityId)
        }

        query = query.order('last_message_at', { ascending: false }).limit(input.limit)

        const { data: conversations, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return conversations ?? []
      }),

    // Get conversation with messages
    get: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: conversation, error } = await adminClient
          .from('ai_conversations')
          .select('*, ai_messages(*)')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single()

        if (error || !conversation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' })
        }

        return conversation
      }),

    // Create conversation
    create: orgProtectedProcedure
      .input(z.object({
        title: z.string().optional(),
        contextType: z.string().optional(),
        contextEntityType: z.string().optional(),
        contextEntityId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: conversation, error } = await adminClient
          .from('ai_conversations')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            title: input.title,
            context_type: input.contextType,
            context_entity_type: input.contextEntityType,
            context_entity_id: input.contextEntityId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return conversation
      }),

    // Archive conversation
    archive: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('ai_conversations')
          .update({ is_archived: true, updated_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // CHAT
  // ============================================

  chat: orgProtectedProcedure
    .input(z.object({
      conversationId: z.string().uuid().optional(),
      message: z.string().min(1).max(4000),
      context: z.object({
        entityType: z.string().optional(),
        entityId: z.string().uuid().optional(),
        entityData: z.record(z.unknown()).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const aiService = getAIService()

      // Get or create conversation
      let conversationId = input.conversationId
      if (!conversationId) {
        const { data: newConvo, error: convoError } = await adminClient
          .from('ai_conversations')
          .insert({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            context_type: input.context?.entityType ? 'entity' : 'global',
            context_entity_type: input.context?.entityType,
            context_entity_id: input.context?.entityId,
          })
          .select()
          .single()

        if (convoError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: convoError.message })
        }
        conversationId = newConvo.id
      }

      // Get existing messages for context
      const { data: existingMessages } = await adminClient
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20)

      const messages = [
        ...(existingMessages ?? []).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: input.message },
      ]

      // Save user message
      await adminClient.from('ai_messages').insert({
        org_id: ctx.orgId,
        conversation_id: conversationId,
        role: 'user',
        content: input.message,
      })

      // Get AI response
      const response = await aiService.chat(messages, {
        entityType: input.context?.entityType,
        entityId: input.context?.entityId,
        entityData: input.context?.entityData,
      })

      // Save assistant message
      const { data: assistantMsg, error: msgError } = await adminClient
        .from('ai_messages')
        .insert({
          org_id: ctx.orgId,
          conversation_id: conversationId,
          role: 'assistant',
          content: response.content,
          interaction_type: response.interactionType,
          referenced_entities: response.referencedEntities ?? [],
          input_tokens: response.inputTokens,
          output_tokens: response.outputTokens,
        })
        .select()
        .single()

      if (msgError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: msgError.message })
      }

      // Log usage
      await adminClient.from('ai_usage_logs').insert({
        org_id: ctx.orgId,
        user_id: ctx.userId,
        feature: 'chat',
        operation: 'generate',
        input_tokens: response.inputTokens,
        output_tokens: response.outputTokens,
        model: 'gpt-4-turbo-preview',
        provider: 'openai',
        entity_type: input.context?.entityType,
        entity_id: input.context?.entityId,
      })

      return {
        conversationId,
        message: assistantMsg,
        suggestedActions: response.suggestedActions,
      }
    }),

  // ============================================
  // SUGGESTIONS
  // ============================================

  suggestions: router({
    // Get pending suggestions for user
    list: orgProtectedProcedure
      .input(z.object({
        status: z.array(suggestionStatusSchema).default(['pending']),
        type: z.string().optional(),
        priority: z.array(suggestionPrioritySchema).optional(),
        limit: z.number().min(1).max(50).default(10),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        let query = adminClient
          .from('ai_suggestions')
          .select('*')
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)
          .in('status', input.status)

        if (input.type) {
          query = query.eq('type', input.type)
        }

        if (input.priority && input.priority.length > 0) {
          query = query.in('priority', input.priority)
        }

        query = query
          .order('priority', { ascending: true })
          .order('score', { ascending: false })
          .limit(input.limit)

        const { data: suggestions, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return suggestions ?? []
      }),

    // Generate suggestions (called periodically)
    generate: orgProtectedProcedure.mutation(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const aiService = getAIService()

      // Gather context for suggestions
      const [activitiesResult, submissionsResult, jobsResult] = await Promise.all([
        adminClient
          .from('activities')
          .select('id, type, due_at, entity_type, entity_id')
          .eq('org_id', ctx.orgId)
          .eq('assigned_to', ctx.userId)
          .eq('status', 'pending')
          .order('due_at', { ascending: true })
          .limit(20),
        adminClient
          .from('submissions')
          .select('id, candidate_id, job_id, status')
          .eq('org_id', ctx.orgId)
          .eq('created_by', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(20),
        adminClient
          .from('jobs')
          .select('id, title, created_at, status')
          .eq('org_id', ctx.orgId)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const context = {
        pendingActivities: (activitiesResult.data ?? []).map((a) => ({
          id: a.id,
          type: a.type,
          dueAt: a.due_at,
          entityType: a.entity_type,
          entityId: a.entity_id,
        })),
        recentSubmissions: (submissionsResult.data ?? []).map((s) => ({
          id: s.id,
          candidateName: '', // Would need to join
          jobTitle: '', // Would need to join
          status: s.status,
        })),
        openJobs: (jobsResult.data ?? []).map((j) => ({
          id: j.id,
          title: j.title,
          daysOpen: Math.floor(
            (Date.now() - new Date(j.created_at).getTime()) / (1000 * 60 * 60 * 24)
          ),
          submissionCount: 0, // Would need to aggregate
        })),
        userMetrics: {}, // Would gather from reports
      }

      // Generate suggestions
      const suggestions = await aiService.generateSuggestions(ctx.userId, context)

      // Save suggestions
      if (suggestions.length > 0) {
        await adminClient.from('ai_suggestions').insert(
          suggestions.map((s) => ({
            org_id: ctx.orgId,
            user_id: ctx.userId,
            type: s.type,
            title: s.title,
            description: s.description,
            reasoning: s.reasoning,
            priority: s.priority,
            score: s.score,
            entity_type: s.entityType,
            entity_id: s.entityId,
            action_type: s.actionType,
            action_payload: s.actionPayload,
            expires_at: s.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }))
        )
      }

      return { generated: suggestions.length }
    }),

    // Accept suggestion
    accept: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: suggestion, error } = await adminClient
          .from('ai_suggestions')
          .update({
            status: 'accepted',
            actioned_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return suggestion
      }),

    // Dismiss suggestion
    dismiss: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('ai_suggestions')
          .update({
            status: 'dismissed',
            dismissed_reason: input.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Provide feedback
    feedback: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        wasHelpful: z.boolean(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('ai_suggestions')
          .update({
            was_helpful: input.wasHelpful,
            feedback_notes: input.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // MATCHING
  // ============================================

  matching: router({
    // Get match scores for a job
    forJob: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        minScore: z.number().min(0).max(1).default(0.6),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: matches, error } = await adminClient
          .from('ai_match_scores')
          .select('*, candidates!inner(id, first_name, last_name, email, title)')
          .eq('org_id', ctx.orgId)
          .eq('job_id', input.jobId)
          .gte('overall_score', input.minScore)
          .order('overall_score', { ascending: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return matches ?? []
      }),

    // Get match scores for a candidate
    forCandidate: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        minScore: z.number().min(0).max(1).default(0.6),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: matches, error } = await adminClient
          .from('ai_match_scores')
          .select('*, jobs!inner(id, title, status, account_id)')
          .eq('org_id', ctx.orgId)
          .eq('candidate_id', input.candidateId)
          .gte('overall_score', input.minScore)
          .order('overall_score', { ascending: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return matches ?? []
      }),

    // Calculate match score on demand
    calculate: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        jobId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const aiService = getAIService()

        // Get candidate and job data
        const [candidateResult, jobResult] = await Promise.all([
          adminClient
            .from('candidates')
            .select('id, first_name, last_name, title, skills, experience, location, desired_salary')
            .eq('id', input.candidateId)
            .eq('org_id', ctx.orgId)
            .single(),
          adminClient
            .from('jobs')
            .select('id, title, description, requirements, location, salary_min, salary_max, accounts!inner(name)')
            .eq('id', input.jobId)
            .eq('org_id', ctx.orgId)
            .single(),
        ])

        if (!candidateResult.data || !jobResult.data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate or job not found' })
        }

        const candidate = candidateResult.data
        const job = jobResult.data

        // Calculate match
        const matchScore = await aiService.calculateMatchScore(
          {
            id: candidate.id,
            name: `${candidate.first_name} ${candidate.last_name}`,
            title: candidate.title ?? '',
            skills: (candidate.skills as string[]) ?? [],
            experience: candidate.experience ?? '',
            location: candidate.location ?? '',
            desiredSalary: candidate.desired_salary,
          },
          {
            id: job.id,
            title: job.title,
            description: job.description ?? '',
            requirements: (job.requirements as string[]) ?? [],
            location: job.location ?? '',
            salaryMin: job.salary_min,
            salaryMax: job.salary_max,
            accountName: (job as any).accounts?.name ?? '',
          }
        )

        // Save match score
        const { data: savedMatch, error } = await adminClient
          .from('ai_match_scores')
          .upsert({
            org_id: ctx.orgId,
            candidate_id: input.candidateId,
            job_id: input.jobId,
            overall_score: matchScore.overallScore,
            component_scores: matchScore.componentScores,
            match_reasons: matchScore.matchReasons,
            concern_reasons: matchScore.concernReasons,
            model_id: 'gpt-4-turbo-preview',
            calculated_at: new Date().toISOString(),
          }, { onConflict: 'candidate_id,job_id' })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return savedMatch
      }),

    // Provide feedback on match
    feedback: orgProtectedProcedure
      .input(z.object({
        candidateId: z.string().uuid(),
        jobId: z.string().uuid(),
        feedback: z.enum(['good_match', 'bad_match', 'neutral']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('ai_match_scores')
          .update({
            recruiter_feedback: input.feedback,
            feedback_notes: input.notes,
            feedback_at: new Date().toISOString(),
            feedback_by: ctx.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('candidate_id', input.candidateId)
          .eq('job_id', input.jobId)
          .eq('org_id', ctx.orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // SUMMARIZATION
  // ============================================

  summarize: orgProtectedProcedure
    .input(z.object({
      content: z.string().min(10).max(10000),
      type: z.enum(['email', 'note', 'document', 'conversation']),
      maxLength: z.number().min(50).max(500).default(150),
    }))
    .mutation(async ({ ctx, input }) => {
      const aiService = getAIService()
      const adminClient = getAdminClient()

      const result = await aiService.summarize(input.content, input.type, input.maxLength)

      // Log usage
      await adminClient.from('ai_usage_logs').insert({
        org_id: ctx.orgId,
        user_id: ctx.userId,
        feature: 'summarize',
        operation: 'generate',
        model: 'gpt-4-turbo-preview',
        provider: 'openai',
      })

      return result
    }),

  // ============================================
  // SKILL EXTRACTION
  // ============================================

  extractSkills: orgProtectedProcedure
    .input(z.object({
      text: z.string().min(10).max(10000),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const aiService = getAIService()
      const adminClient = getAdminClient()

      const skills = await aiService.extractSkills(input.text)

      // Save extracted skills if entity provided
      if (input.entityType && input.entityId && skills.length > 0) {
        await adminClient.from('ai_extracted_skills').insert(
          skills.map((skill) => ({
            org_id: ctx.orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            source_type: 'text',
            skill_name: skill.name,
            skill_category: skill.category,
            confidence: skill.confidence,
          }))
        )
      }

      // Log usage
      await adminClient.from('ai_usage_logs').insert({
        org_id: ctx.orgId,
        user_id: ctx.userId,
        feature: 'skill_extraction',
        operation: 'extract',
        entity_type: input.entityType,
        entity_id: input.entityId,
        model: 'gpt-4-turbo-preview',
        provider: 'openai',
      })

      return skills
    }),

  // ============================================
  // USAGE STATS
  // ============================================

  usage: router({
    // Get usage stats for current user
    myUsage: orgProtectedProcedure
      .input(z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: logs, error } = await adminClient
          .from('ai_usage_logs')
          .select('feature, input_tokens, output_tokens, estimated_cost_cents')
          .eq('org_id', ctx.orgId)
          .eq('user_id', ctx.userId)
          .gte('created_at', input.startDate)
          .lte('created_at', input.endDate)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Aggregate by feature
        const byFeature: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number }> = {}

        for (const log of logs ?? []) {
          if (!byFeature[log.feature]) {
            byFeature[log.feature] = { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0 }
          }
          byFeature[log.feature].calls++
          byFeature[log.feature].inputTokens += log.input_tokens ?? 0
          byFeature[log.feature].outputTokens += log.output_tokens ?? 0
          byFeature[log.feature].cost += log.estimated_cost_cents ?? 0
        }

        const totalCalls = (logs ?? []).length
        const totalInputTokens = Object.values(byFeature).reduce((sum, f) => sum + f.inputTokens, 0)
        const totalOutputTokens = Object.values(byFeature).reduce((sum, f) => sum + f.outputTokens, 0)
        const totalCost = Object.values(byFeature).reduce((sum, f) => sum + f.cost, 0)

        return {
          byFeature,
          totals: {
            calls: totalCalls,
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            costCents: totalCost,
          },
        }
      }),
  }),
})
