import { createClient } from '@supabase/supabase-js'

// ============================================
// TYPES
// ============================================

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Notification type categories that map to notification_type in the database
 * Format: category_action (e.g., submission_created, interview_scheduled)
 */
export type NotificationType =
  // Submission notifications
  | 'submission_created'
  | 'submission_status_changed'
  | 'submission_update'
  // Interview notifications
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'interview_cancelled'
  | 'interview_rescheduled'
  // Deal notifications
  | 'deal_stage_changed'
  | 'deal_closed_won'
  | 'deal_closed_lost'
  | 'deal_created'
  // Task/Activity notifications
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'activity_logged'
  // Workflow notifications
  | 'approval_required'
  | 'approval_completed'
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  // Campaign notifications
  | 'campaign_activated'
  | 'campaign_completed'
  | 'campaign_paused'
  // Mention/Collaboration notifications
  | 'mention_comment'
  | 'mention_note'
  // Bench notifications
  | 'bench_alert_30day'
  | 'bench_alert_60day'
  | 'bench_alert_90day'
  // Placement notifications
  | 'placement_started'
  | 'placement_ending_soon'
  | 'placement_ended'
  // System notifications
  | 'system_announcement'
  | 'system_maintenance'

export interface CreateNotificationParams {
  orgId: string
  userId: string
  notificationType: NotificationType
  title: string
  message: string
  entityType?: string
  entityId?: string
  channels?: NotificationChannel[]
  priority?: NotificationPriority
  actionUrl?: string
  actionLabel?: string
}

export interface CreateBulkNotificationParams {
  orgId: string
  userIds: string[]
  notificationType: NotificationType
  title: string
  message: string
  entityType?: string
  entityId?: string
  channels?: NotificationChannel[]
  priority?: NotificationPriority
  actionUrl?: string
  actionLabel?: string
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  error?: string
}

export interface BulkNotificationResult {
  success: boolean
  created: number
  failed: number
  errors: string[]
}

export interface Notification {
  id: string
  org_id: string
  user_id: string
  notification_type: string
  title: string
  message: string
  entity_type?: string
  entity_id?: string
  channels: NotificationChannel[]
  email_sent_at?: string
  email_error?: string
  slack_sent_at?: string
  slack_error?: string
  is_read: boolean
  read_at?: string
  is_archived: boolean
  archived_at?: string
  priority: NotificationPriority
  action_url?: string
  action_label?: string
  created_at: string
}

// ============================================
// SERVICE CONFIGURATION
// ============================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// NOTIFICATION SERVICE CLASS
// ============================================

/**
 * Service for creating and managing notifications
 * Supports in-app, email, SMS, and push channels
 */
export class NotificationService {
  private db = getAdminClient()

  // ========================================
  // CORE OPERATIONS
  // ========================================

  /**
   * Create a single notification
   */
  async create(params: CreateNotificationParams): Promise<NotificationResult> {
    const {
      orgId,
      userId,
      notificationType,
      title,
      message,
      entityType,
      entityId,
      channels = ['in_app'],
      priority = 'normal',
      actionUrl,
      actionLabel,
    } = params

    try {
      // Check user preferences (if configured to respect them)
      const shouldSend = await this.checkUserPreferences(userId, notificationType, channels)

      if (!shouldSend) {
        return {
          success: true,
          error: 'Notification suppressed by user preferences',
        }
      }

      // Insert notification
      const { data, error } = await this.db
        .from('notifications')
        .insert({
          org_id: orgId,
          user_id: userId,
          notification_type: notificationType,
          title,
          message,
          entity_type: entityType,
          entity_id: entityId,
          channels,
          priority,
          action_url: actionUrl,
          action_label: actionLabel,
          is_read: false,
          is_archived: false,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Failed to create notification:', error)
        return { success: false, error: error.message }
      }

      // Handle additional channels (email, push) asynchronously
      if (channels.includes('email')) {
        this.sendEmailNotification(orgId, userId, title, message, actionUrl).catch(err => {
          console.error('Failed to send email notification:', err)
        })
      }

      return { success: true, notificationId: data.id }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating notification:', err)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Create notifications for multiple users
   */
  async createBulk(params: CreateBulkNotificationParams): Promise<BulkNotificationResult> {
    const {
      orgId,
      userIds,
      notificationType,
      title,
      message,
      entityType,
      entityId,
      channels = ['in_app'],
      priority = 'normal',
      actionUrl,
      actionLabel,
    } = params

    const results: BulkNotificationResult = {
      success: true,
      created: 0,
      failed: 0,
      errors: [],
    }

    // Build notification records
    const notifications = userIds.map(userId => ({
      org_id: orgId,
      user_id: userId,
      notification_type: notificationType,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
      channels,
      priority,
      action_url: actionUrl,
      action_label: actionLabel,
      is_read: false,
      is_archived: false,
    }))

    try {
      // Insert all notifications in a single query
      const { data, error } = await this.db
        .from('notifications')
        .insert(notifications)
        .select('id, user_id')

      if (error) {
        console.error('Bulk notification insert failed:', error)
        results.success = false
        results.failed = userIds.length
        results.errors.push(error.message)
        return results
      }

      results.created = data?.length || 0
      results.failed = userIds.length - results.created

      // Handle email channel for all users
      if (channels.includes('email') && data) {
        for (const notification of data) {
          this.sendEmailNotification(
            orgId,
            notification.user_id,
            title,
            message,
            actionUrl
          ).catch(err => {
            console.error(`Failed to send email to user ${notification.user_id}:`, err)
          })
        }
      }

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error in bulk notification:', err)
      return {
        success: false,
        created: 0,
        failed: userIds.length,
        errors: [errorMessage],
      }
    }
  }

  // ========================================
  // READING & QUERYING
  // ========================================

  /**
   * Get unread notifications for a user
   */
  async getUnread(userId: string, orgId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await this.db
      .from('notifications')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('is_read', false)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching unread notifications:', error)
      return []
    }

    return (data || []) as Notification[]
  }

  /**
   * Get all notifications for a user with pagination
   */
  async getAll(
    userId: string,
    orgId: string,
    options: { page?: number; pageSize?: number; includeArchived?: boolean } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { page = 1, pageSize = 20, includeArchived = false } = options

    let query = this.db
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return { notifications: [], total: 0 }
    }

    return {
      notifications: (data || []) as Notification[],
      total: count || 0,
    }
  }

  /**
   * Get notification count by read status
   */
  async getCount(userId: string, orgId: string): Promise<{ unread: number; total: number }> {
    const { count: totalCount, error: totalError } = await this.db
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('is_archived', false)

    const { count: unreadCount, error: unreadError } = await this.db
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('is_read', false)
      .eq('is_archived', false)

    if (totalError || unreadError) {
      console.error('Error fetching notification counts:', totalError || unreadError)
      return { unread: 0, total: 0 }
    }

    return {
      unread: unreadCount || 0,
      total: totalCount || 0,
    }
  }

  // ========================================
  // STATUS MANAGEMENT
  // ========================================

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const { error } = await this.db
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, orgId: string): Promise<number> {
    const { data, error } = await this.db
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('is_read', false)
      .select('id')

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return 0
    }

    return data?.length || 0
  }

  /**
   * Archive a notification
   */
  async archive(notificationId: string, userId: string): Promise<boolean> {
    const { error } = await this.db
      .from('notifications')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error archiving notification:', error)
      return false
    }

    return true
  }

  /**
   * Archive all read notifications for a user
   */
  async archiveAllRead(userId: string, orgId: string): Promise<number> {
    const { data, error } = await this.db
      .from('notifications')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
      })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('is_read', true)
      .eq('is_archived', false)
      .select('id')

    if (error) {
      console.error('Error archiving read notifications:', error)
      return 0
    }

    return data?.length || 0
  }

  // ========================================
  // PREFERENCES & SETTINGS
  // ========================================

  /**
   * Check if user preferences allow this notification
   * Returns true if notification should be sent
   */
  private async checkUserPreferences(
    userId: string,
    notificationType: string,
    channels: NotificationChannel[]
  ): Promise<boolean> {
    // Extract category from notification type (e.g., 'submission_created' -> 'submission')
    const category = notificationType.split('_')[0]

    try {
      const { data: preferences } = await this.db
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .single()

      // No preferences = allow all
      if (!preferences) {
        return true
      }

      // Check if frequency is 'never'
      if (preferences.frequency === 'never') {
        return false
      }

      // Check Do Not Disturb
      if (preferences.dnd_enabled && preferences.dnd_until) {
        const dndUntil = new Date(preferences.dnd_until)
        if (new Date() < dndUntil) {
          // Only allow in_app during DND
          return channels.length === 1 && channels[0] === 'in_app'
        }
      }

      // Check email unsubscribed
      if (preferences.email_unsubscribed && channels.includes('email')) {
        // Filter out email channel but allow others
        return channels.some(c => c !== 'email')
      }

      // Check quiet hours
      if (preferences.quiet_hours_enabled) {
        const now = new Date()
        const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

        const startTime = preferences.quiet_hours_start
        const endTime = preferences.quiet_hours_end

        // Simple time comparison (doesn't handle timezone properly yet)
        if (startTime && endTime) {
          const inQuietHours = startTime > endTime
            ? currentTime >= startTime || currentTime < endTime
            : currentTime >= startTime && currentTime < endTime

          if (inQuietHours) {
            // Only allow in_app during quiet hours
            return channels.length === 1 && channels[0] === 'in_app'
          }
        }
      }

      return true
    } catch {
      // On error, default to allowing notifications
      return true
    }
  }

  // ========================================
  // EMAIL DELIVERY
  // ========================================

  /**
   * Send email notification (async, non-blocking)
   */
  private async sendEmailNotification(
    orgId: string,
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    try {
      // Get user email
      const { data: user } = await this.db
        .from('user_profiles')
        .select('email, first_name')
        .eq('id', userId)
        .single()

      if (!user?.email) {
        console.warn(`No email found for user ${userId}`)
        return
      }

      // Use the template service if available
      const { sendTemplatedEmail } = await import('@/lib/email/template-service')

      await sendTemplatedEmail({
        templateSlug: 'system_notification',
        orgId,
        to: user.email,
        toName: user.first_name || undefined,
        context: {
          first_name: user.first_name || 'User',
          notification_title: title,
          notification_message: message,
          action_url: actionUrl,
        },
        entityType: 'notification',
        triggeredBy: 'system',
        userId,
      })
    } catch (err) {
      console.error('Error sending email notification:', err)
      // Update notification with email error
      // This is best-effort, don't throw
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

// Export a singleton instance for convenience
export const notificationService = new NotificationService()

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Quick helper to create a notification
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationResult> {
  return notificationService.create(params)
}

/**
 * Quick helper to create notifications for multiple users
 */
export async function createBulkNotification(
  params: CreateBulkNotificationParams
): Promise<BulkNotificationResult> {
  return notificationService.createBulk(params)
}

/**
 * Get notification count for a user
 */
export async function getNotificationCount(
  userId: string,
  orgId: string
): Promise<{ unread: number; total: number }> {
  return notificationService.getCount(userId, orgId)
}
