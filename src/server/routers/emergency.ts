import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

// Initialize Resend for email notifications (optional - only if API key is present)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Alias for backwards compatibility
const getServiceClient = getAdminClient

// Input schemas
const createIncidentInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  severity: z.enum(['P0', 'P1', 'P2', 'P3']),
  impact: z.string().optional(),
  startedAt: z.string(), // ISO datetime
  detectedAt: z.string().optional(),
  incidentCommander: z.string().uuid().optional(),
})

const updateIncidentInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  severity: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  status: z.enum(['open', 'investigating', 'identified', 'monitoring', 'resolved']).optional(),
  impact: z.string().optional(),
  rootCause: z.string().optional(),
  resolution: z.string().optional(),
  incidentCommander: z.string().uuid().nullable().optional(),
  resolvedAt: z.string().optional(),
})

const listIncidentsInput = z.object({
  status: z.enum(['open', 'investigating', 'identified', 'monitoring', 'resolved', 'all']).default('all'),
  severity: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})

const addTimelineEventInput = z.object({
  incidentId: z.string().uuid(),
  eventType: z.enum(['detection', 'notification', 'escalation', 'action', 'update', 'resolution']),
  description: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
})

const sendNotificationInput = z.object({
  incidentId: z.string().uuid(),
  notificationType: z.enum(['email', 'sms', 'slack', 'status_page', 'in_app']),
  recipients: z.array(z.string()).min(1), // Email addresses for email, user IDs for in_app
  subject: z.string().min(1).optional(),
  body: z.string().min(1),
})

const logBreakGlassInput = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  authorizedBy: z.string().min(1, 'Authorizer name/email required'),
  incidentId: z.string().uuid().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

const updateBreakGlassInput = z.object({
  id: z.string().uuid(),
  actionsTaken: z.array(z.string()).optional(),
  endedAt: z.string().optional(),
})

const createDrillInput = z.object({
  drillType: z.enum(['tabletop', 'simulated_outage', 'security_breach', 'backup_restore']),
  title: z.string().min(1).max(200),
  scenario: z.string().min(1),
  scheduledAt: z.string(), // ISO datetime
  participants: z.array(z.string().uuid()).default([]),
})

const updateDrillInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  scenario: z.string().optional(),
  scheduledAt: z.string().optional(),
  participants: z.array(z.string().uuid()).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  findings: z.string().optional(),
  actionItems: z.array(z.object({
    item: z.string(),
    assignee: z.string().optional(),
    dueDate: z.string().optional(),
    completed: z.boolean().default(false),
  })).optional(),
})

const listDrillsInput = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'all']).default('all'),
  drillType: z.enum(['tabletop', 'simulated_outage', 'security_breach', 'backup_restore']).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})

export const emergencyRouter = router({
  // ================== Dashboard ==================

  getDashboard: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      // Get stats
      const [
        incidentsResult,
        activeIncidentsResult,
        recentTimelineResult,
        upcomingDrillsResult,
        breakGlassResult,
      ] = await Promise.all([
        // Total incidents by status
        serviceClient
          .from('incidents')
          .select('status', { count: 'exact' })
          .eq('org_id', orgId),

        // Active incidents (not resolved)
        serviceClient
          .from('incidents')
          .select(`
            id, incident_number, title, severity, status, started_at, created_at,
            commander:user_profiles!incidents_incident_commander_fkey(id, full_name, email)
          `)
          .eq('org_id', orgId)
          .neq('status', 'resolved')
          .order('severity', { ascending: true })
          .order('started_at', { ascending: false })
          .limit(10),

        // Recent timeline events
        serviceClient
          .from('incident_timeline')
          .select(`
            id, incident_id, event_type, description, created_at,
            performer:user_profiles!incident_timeline_performed_by_fkey(full_name, email),
            incident:incidents!inner(incident_number, title, severity)
          `)
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(15),

        // Upcoming drills
        serviceClient
          .from('emergency_drills')
          .select('id, drill_type, title, scheduled_at, status')
          .eq('org_id', orgId)
          .in('status', ['scheduled', 'in_progress'])
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5),

        // Recent break-glass access
        serviceClient
          .from('break_glass_access')
          .select('id, accessed_by, reason, accessed_at, ended_at, incident_id')
          .eq('org_id', orgId)
          .order('accessed_at', { ascending: false })
          .limit(5),
      ])

      // Calculate stats from incidents
      const incidents = incidentsResult.data ?? []
      const activeCount = incidents.filter(i => i.status !== 'resolved').length
      const resolvedCount = incidents.filter(i => i.status === 'resolved').length

      // Get P0/P1 count in last 24 hours
      const { data: criticalRecent } = await serviceClient
        .from('incidents')
        .select('id', { count: 'exact' })
        .eq('org_id', orgId)
        .in('severity', ['P0', 'P1'])
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return {
        stats: {
          activeIncidents: activeCount,
          resolvedIncidents: resolvedCount,
          criticalLast24h: criticalRecent?.length ?? 0,
          upcomingDrills: upcomingDrillsResult.data?.length ?? 0,
        },
        activeIncidents: activeIncidentsResult.data ?? [],
        recentTimeline: recentTimelineResult.data ?? [],
        upcomingDrills: upcomingDrillsResult.data ?? [],
        recentBreakGlass: breakGlassResult.data ?? [],
      }
    }),

  // ================== Incidents ==================

  listIncidents: orgProtectedProcedure
    .input(listIncidentsInput)
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()
      const { status, severity, page, pageSize } = input

      let query = serviceClient
        .from('incidents')
        .select(`
          id, incident_number, title, description, severity, status,
          impact, root_cause, resolution,
          started_at, detected_at, resolved_at, created_at, updated_at,
          commander:user_profiles!incidents_incident_commander_fkey(id, full_name, email),
          creator:user_profiles!incidents_created_by_fkey(id, full_name, email)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('started_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }
      if (severity) {
        query = query.eq('severity', severity)
      }

      const offset = (page - 1) * pageSize
      query = query.range(offset, offset + pageSize - 1)

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to fetch incidents:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch incidents',
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

  getIncident: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      const { data: incident, error } = await serviceClient
        .from('incidents')
        .select(`
          *,
          commander:user_profiles!incidents_incident_commander_fkey(id, full_name, email),
          creator:user_profiles!incidents_created_by_fkey(id, full_name, email),
          updater:user_profiles!incidents_updated_by_fkey(id, full_name, email)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        })
      }

      // Get timeline events
      const { data: timeline } = await serviceClient
        .from('incident_timeline')
        .select(`
          id, event_type, description, metadata, created_at,
          performer:user_profiles!incident_timeline_performed_by_fkey(id, full_name, email)
        `)
        .eq('incident_id', input.id)
        .order('created_at', { ascending: true })

      // Get notifications
      const { data: notifications } = await serviceClient
        .from('incident_notifications')
        .select('*')
        .eq('incident_id', input.id)
        .order('created_at', { ascending: false })

      return {
        ...incident,
        timeline: timeline ?? [],
        notifications: notifications ?? [],
      }
    }),

  createIncident: orgProtectedProcedure
    .input(createIncidentInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('incidents')
        .insert({
          org_id: orgId,
          title: input.title,
          description: input.description,
          severity: input.severity,
          impact: input.impact,
          started_at: input.startedAt,
          detected_at: input.detectedAt,
          incident_commander: input.incidentCommander,
          created_by: profileId,
          updated_by: profileId,
        })
        .select(`
          *,
          commander:user_profiles!incidents_incident_commander_fkey(id, full_name, email)
        `)
        .single()

      if (error) {
        console.error('Failed to create incident:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create incident',
        })
      }

      // Create initial timeline event
      await serviceClient.from('incident_timeline').insert({
        org_id: orgId,
        incident_id: data.id,
        event_type: 'detection',
        description: `Incident created: ${input.title}`,
        performed_by: profileId,
        metadata: { severity: input.severity },
      })

      // Log to audit
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'CREATE',
        table_name: 'incidents',
        record_id: data.id,
        object_name: data.incident_number,
        new_values: input,
        result: 'SUCCESS',
        severity: input.severity === 'P0' ? 'CRITICAL' : input.severity === 'P1' ? 'HIGH' : 'MEDIUM',
      })

      return data
    }),

  updateIncident: orgProtectedProcedure
    .input(updateIncidentInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()
      const { id, ...updates } = input

      // Get current incident for audit
      const { data: currentIncident } = await serviceClient
        .from('incidents')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .single()

      if (!currentIncident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        })
      }

      const updateData: Record<string, unknown> = { updated_by: profileId }
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.severity !== undefined) updateData.severity = updates.severity
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.impact !== undefined) updateData.impact = updates.impact
      if (updates.rootCause !== undefined) updateData.root_cause = updates.rootCause
      if (updates.resolution !== undefined) updateData.resolution = updates.resolution
      if (updates.incidentCommander !== undefined) updateData.incident_commander = updates.incidentCommander
      if (updates.resolvedAt !== undefined) updateData.resolved_at = updates.resolvedAt

      // Auto-set resolved_at when status changes to resolved
      if (updates.status === 'resolved' && !updates.resolvedAt) {
        updateData.resolved_at = new Date().toISOString()
      }

      const { data, error } = await serviceClient
        .from('incidents')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)
        .select(`
          *,
          commander:user_profiles!incidents_incident_commander_fkey(id, full_name, email)
        `)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update incident',
        })
      }

      // Create timeline event for status change
      if (updates.status && updates.status !== currentIncident.status) {
        await serviceClient.from('incident_timeline').insert({
          org_id: orgId,
          incident_id: id,
          event_type: updates.status === 'resolved' ? 'resolution' : 'update',
          description: `Status changed from ${currentIncident.status} to ${updates.status}`,
          performed_by: profileId,
          metadata: { oldStatus: currentIncident.status, newStatus: updates.status },
        })
      }

      // Log to audit
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'UPDATE',
        table_name: 'incidents',
        record_id: id,
        object_name: data.incident_number,
        old_values: currentIncident,
        new_values: updates,
        result: 'SUCCESS',
        severity: 'INFO',
      })

      return data
    }),

  addTimelineEvent: orgProtectedProcedure
    .input(addTimelineEventInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, profileId } = ctx
      const serviceClient = getServiceClient()

      // Verify incident exists and belongs to org
      const { data: incident } = await serviceClient
        .from('incidents')
        .select('id, incident_number')
        .eq('id', input.incidentId)
        .eq('org_id', orgId)
        .single()

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        })
      }

      const { data, error } = await serviceClient
        .from('incident_timeline')
        .insert({
          org_id: orgId,
          incident_id: input.incidentId,
          event_type: input.eventType,
          description: input.description,
          performed_by: profileId,
          metadata: input.metadata ?? {},
        })
        .select(`
          *,
          performer:user_profiles!incident_timeline_performed_by_fkey(id, full_name, email)
        `)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add timeline event',
        })
      }

      return data
    }),

  // ================== Notifications ==================

  sendNotification: orgProtectedProcedure
    .input(sendNotificationInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()

      // Verify incident exists
      const { data: incident } = await serviceClient
        .from('incidents')
        .select('id, incident_number, title, severity, status')
        .eq('id', input.incidentId)
        .eq('org_id', orgId)
        .single()

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        })
      }

      const results: Array<{ recipient: string; status: string; error?: string }> = []

      // Send notifications to each recipient
      for (const recipient of input.recipients) {
        let status = 'pending'
        let errorMessage: string | undefined

        try {
          if (input.notificationType === 'email') {
            // Send actual email via Resend
            if (!resend) {
              throw new Error('Email service not configured')
            }
            const subject = input.subject || `[${incident.severity}] ${incident.title} - ${incident.incident_number}`

            await resend.emails.send({
              from: 'InTime OS <noreply@intime.dev>',
              to: recipient,
              subject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: ${incident.severity === 'P0' ? '#dc2626' : incident.severity === 'P1' ? '#ea580c' : incident.severity === 'P2' ? '#d97706' : '#2563eb'}; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Incident Alert - ${incident.severity}</h1>
                  </div>
                  <div style="padding: 20px; background: #f9fafb;">
                    <p><strong>Incident:</strong> ${incident.incident_number}</p>
                    <p><strong>Title:</strong> ${incident.title}</p>
                    <p><strong>Status:</strong> ${incident.status}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="white-space: pre-wrap;">${input.body}</div>
                  </div>
                  <div style="padding: 15px; background: #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                    This is an automated incident notification from InTime OS
                  </div>
                </div>
              `,
            })
            status = 'sent'
          } else if (input.notificationType === 'in_app') {
            // Create in-app notification record
            await serviceClient.from('notifications').insert({
              org_id: orgId,
              user_id: recipient, // For in_app, recipient is user ID
              notification_type: 'workflow',
              title: `[${incident.severity}] ${incident.title}`,
              body: input.body,
              entity_type: 'incidents',
              entity_id: input.incidentId,
              priority: incident.severity === 'P0' ? 'urgent' : incident.severity === 'P1' ? 'high' : 'normal',
            })
            status = 'sent'
          } else {
            // SMS, Slack, Status Page - not implemented yet
            status = 'pending'
            errorMessage = `${input.notificationType} notifications not yet implemented`
          }
        } catch (err) {
          status = 'failed'
          errorMessage = err instanceof Error ? err.message : 'Unknown error'
        }

        // Record the notification
        await serviceClient.from('incident_notifications').insert({
          org_id: orgId,
          incident_id: input.incidentId,
          notification_type: input.notificationType,
          recipient,
          subject: input.subject,
          body: input.body,
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : null,
          sent_by: profileId,
          error_message: errorMessage,
        })

        results.push({ recipient, status, error: errorMessage })
      }

      // Add timeline event
      const successCount = results.filter(r => r.status === 'sent').length
      await serviceClient.from('incident_timeline').insert({
        org_id: orgId,
        incident_id: input.incidentId,
        event_type: 'notification',
        description: `${input.notificationType} notification sent to ${successCount}/${input.recipients.length} recipients`,
        performed_by: profileId,
        metadata: { notificationType: input.notificationType, recipientCount: input.recipients.length, successCount },
      })

      return {
        incidentId: input.incidentId,
        totalRecipients: input.recipients.length,
        successCount,
        results,
      }
    }),

  // ================== Break-Glass Access ==================

  logBreakGlassAccess: orgProtectedProcedure
    .input(logBreakGlassInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('break_glass_access')
        .insert({
          org_id: orgId,
          user_id: profileId,
          accessed_by: user?.email || 'unknown',
          reason: input.reason,
          authorized_by: input.authorizedBy,
          incident_id: input.incidentId,
          ip_address: input.ipAddress,
          user_agent: input.userAgent,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to log break-glass access',
        })
      }

      // Create CRITICAL audit log
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'CREATE',
        table_name: 'break_glass_access',
        record_id: data.id,
        object_name: 'Break-Glass Access',
        new_values: input,
        result: 'SUCCESS',
        severity: 'CRITICAL',
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
      })

      // If linked to incident, add timeline event
      if (input.incidentId) {
        await serviceClient.from('incident_timeline').insert({
          org_id: orgId,
          incident_id: input.incidentId,
          event_type: 'action',
          description: `Break-glass access initiated by ${user?.email}. Authorized by: ${input.authorizedBy}`,
          performed_by: profileId,
          metadata: { reason: input.reason },
        })
      }

      return data
    }),

  updateBreakGlassAccess: orgProtectedProcedure
    .input(updateBreakGlassInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()
      const { id, ...updates } = input

      const updateData: Record<string, unknown> = {}
      if (updates.actionsTaken !== undefined) updateData.actions_taken = updates.actionsTaken
      if (updates.endedAt !== undefined) updateData.ended_at = updates.endedAt

      const { data, error } = await serviceClient
        .from('break_glass_access')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update break-glass access',
        })
      }

      // Log to audit
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'UPDATE',
        table_name: 'break_glass_access',
        record_id: id,
        new_values: updates,
        result: 'SUCCESS',
        severity: 'HIGH',
      })

      return data
    }),

  listBreakGlassAccess: orgProtectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()
      const { page, pageSize } = input

      const offset = (page - 1) * pageSize

      const { data, count, error } = await serviceClient
        .from('break_glass_access')
        .select(`
          *,
          user:user_profiles!break_glass_access_user_id_fkey(id, full_name, email),
          incident:incidents!break_glass_access_incident_id_fkey(incident_number, title)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('accessed_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch break-glass access logs',
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

  // ================== Emergency Drills ==================

  listDrills: orgProtectedProcedure
    .input(listDrillsInput)
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()
      const { status, drillType, page, pageSize } = input

      let query = serviceClient
        .from('emergency_drills')
        .select(`
          id, drill_type, title, scenario, status,
          scheduled_at, started_at, completed_at,
          findings, action_items, created_at,
          creator:user_profiles!emergency_drills_created_by_fkey(id, full_name, email)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('scheduled_at', { ascending: false })

      if (status !== 'all') {
        query = query.eq('status', status)
      }
      if (drillType) {
        query = query.eq('drill_type', drillType)
      }

      const offset = (page - 1) * pageSize
      query = query.range(offset, offset + pageSize - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch drills',
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

  getDrill: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('emergency_drills')
        .select(`
          *,
          creator:user_profiles!emergency_drills_created_by_fkey(id, full_name, email),
          updater:user_profiles!emergency_drills_updated_by_fkey(id, full_name, email)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Drill not found',
        })
      }

      // Get participant details
      let participantDetails: Array<{ id: string; full_name: string; email: string }> = []
      if (data.participants && data.participants.length > 0) {
        const { data: users } = await serviceClient
          .from('user_profiles')
          .select('id, full_name, email')
          .in('id', data.participants)

        participantDetails = users ?? []
      }

      return {
        ...data,
        participantDetails,
      }
    }),

  createDrill: orgProtectedProcedure
    .input(createDrillInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('emergency_drills')
        .insert({
          org_id: orgId,
          drill_type: input.drillType,
          title: input.title,
          scenario: input.scenario,
          scheduled_at: input.scheduledAt,
          participants: input.participants,
          created_by: profileId,
          updated_by: profileId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create drill',
        })
      }

      // Log to audit
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'CREATE',
        table_name: 'emergency_drills',
        record_id: data.id,
        object_name: input.title,
        new_values: input,
        result: 'SUCCESS',
        severity: 'INFO',
      })

      return data
    }),

  updateDrill: orgProtectedProcedure
    .input(updateDrillInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()
      const { id, ...updates } = input

      // Get current drill for audit
      const { data: currentDrill } = await serviceClient
        .from('emergency_drills')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .single()

      if (!currentDrill) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Drill not found',
        })
      }

      const updateData: Record<string, unknown> = { updated_by: profileId }
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.scenario !== undefined) updateData.scenario = updates.scenario
      if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt
      if (updates.participants !== undefined) updateData.participants = updates.participants
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.startedAt !== undefined) updateData.started_at = updates.startedAt
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt
      if (updates.findings !== undefined) updateData.findings = updates.findings
      if (updates.actionItems !== undefined) updateData.action_items = updates.actionItems

      const { data, error } = await serviceClient
        .from('emergency_drills')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update drill',
        })
      }

      // Log to audit
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'UPDATE',
        table_name: 'emergency_drills',
        record_id: id,
        old_values: currentDrill,
        new_values: updates,
        result: 'SUCCESS',
        severity: 'INFO',
      })

      return data
    }),

  deleteDrill: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user, profileId } = ctx
      const serviceClient = getServiceClient()

      // Get current drill for audit
      const { data: currentDrill } = await serviceClient
        .from('emergency_drills')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (!currentDrill) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Drill not found',
        })
      }

      const { error } = await serviceClient
        .from('emergency_drills')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete drill',
        })
      }

      // Log to audit
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'DELETE',
        table_name: 'emergency_drills',
        record_id: input.id,
        old_values: currentDrill,
        result: 'SUCCESS',
        severity: 'MEDIUM',
      })

      return { success: true }
    }),

  // ================== Helpers ==================

  getAdminUsers: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      // Get users who can be incident commanders (admins and managers)
      const { data, error } = await serviceClient
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('full_name')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }

      return data ?? []
    }),
})
