'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ============================================
// TYPES
// ============================================

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push'

export interface RealtimeNotification {
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
  is_read: boolean
  read_at?: string
  is_archived: boolean
  archived_at?: string
  priority: NotificationPriority
  action_url?: string
  action_label?: string
  created_at: string
}

export interface UseRealtimeNotificationsOptions {
  /** Whether to show toast notifications for new items */
  showToasts?: boolean
  /** Maximum number of notifications to keep in state */
  maxNotifications?: number
  /** Callback when a new notification arrives */
  onNotification?: (notification: RealtimeNotification) => void
  /** Whether to automatically mark as read when viewed */
  autoMarkRead?: boolean
}

export interface UseRealtimeNotificationsReturn {
  /** List of notifications */
  notifications: RealtimeNotification[]
  /** Number of unread notifications */
  unreadCount: number
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Connection status */
  isConnected: boolean
  /** Mark a notification as read */
  markAsRead: (notificationId: string) => Promise<void>
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>
  /** Archive a notification */
  archive: (notificationId: string) => Promise<void>
  /** Refresh notifications from server */
  refresh: () => Promise<void>
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Hook for real-time notification subscriptions
 * Uses Supabase Realtime to listen for new notifications
 *
 * @param userId - The user ID to subscribe to notifications for
 * @param orgId - The organization ID for filtering
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications(
 *   user.id,
 *   org.id,
 *   {
 *     showToasts: true,
 *     onNotification: (n) => console.log('New notification:', n),
 *   }
 * )
 * ```
 */
export function useRealtimeNotifications(
  userId: string | null | undefined,
  orgId: string | null | undefined,
  options: UseRealtimeNotificationsOptions = {}
): UseRealtimeNotificationsReturn {
  const {
    showToasts = true,
    maxNotifications = 50,
    onNotification,
    autoMarkRead = false,
  } = options

  // State
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Refs to avoid stale closures
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read && !n.is_archived).length

  // ========================================
  // FETCH INITIAL NOTIFICATIONS
  // ========================================

  const fetchNotifications = useCallback(async () => {
    if (!userId || !orgId) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const supabase = supabaseRef.current

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(maxNotifications)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setNotifications((data || []) as RealtimeNotification[])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
    } finally {
      setIsLoading(false)
    }
  }, [userId, orgId, maxNotifications])

  // ========================================
  // SUBSCRIBE TO REALTIME
  // ========================================

  const subscribeToRealtime = useCallback(() => {
    if (!userId || !orgId) {
      return
    }

    const supabase = supabaseRef.current

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Create new channel with unique name
    const channelName = `notifications:${userId}:${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as RealtimeNotification

          // Verify org_id matches (extra security)
          if (newNotification.org_id !== orgId) {
            return
          }

          // Add to state
          setNotifications(prev => {
            const updated = [newNotification, ...prev].slice(0, maxNotifications)
            return updated
          })

          // Show toast notification
          if (showToasts) {
            const variant = getToastVariant(newNotification.priority)
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant,
            })
          }

          // Callback
          onNotification?.(newNotification)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as RealtimeNotification

          // Verify org_id matches
          if (updatedNotification.org_id !== orgId) {
            return
          }

          // Update in state
          setNotifications(prev =>
            prev.map(n =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          )
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')

        if (status === 'CHANNEL_ERROR') {
          console.error('Notification channel error')
          setError(new Error('Failed to connect to notification channel'))
        }
      })

    channelRef.current = channel
  }, [userId, orgId, maxNotifications, showToasts, onNotification])

  // ========================================
  // LIFECYCLE
  // ========================================

  useEffect(() => {
    fetchNotifications()
    subscribeToRealtime()

    return () => {
      // Cleanup on unmount
      if (channelRef.current) {
        const supabase = supabaseRef.current
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [fetchNotifications, subscribeToRealtime])

  // ========================================
  // ACTIONS
  // ========================================

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    const supabase = supabaseRef.current

    // Optimistic update
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    )

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (updateError) {
        throw new Error(updateError.message)
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      // Revert optimistic update
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!userId || !orgId) return

    const supabase = supabaseRef.current

    // Optimistic update
    const now = new Date().toISOString()
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: now }))
    )

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: now,
        })
        .eq('org_id', orgId)
        .eq('user_id', userId)
        .eq('is_read', false)

      if (updateError) {
        throw new Error(updateError.message)
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      // Revert optimistic update
      fetchNotifications()
    }
  }, [userId, orgId, fetchNotifications])

  /**
   * Archive a notification
   */
  const archive = useCallback(async (notificationId: string) => {
    const supabase = supabaseRef.current

    // Optimistic update - remove from list
    setNotifications(prev => prev.filter(n => n.id !== notificationId))

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (updateError) {
        throw new Error(updateError.message)
      }
    } catch (err) {
      console.error('Error archiving notification:', err)
      // Revert optimistic update
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  /**
   * Refresh notifications from server
   */
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications()
  }, [fetchNotifications])

  // ========================================
  // AUTO MARK READ (optional)
  // ========================================

  useEffect(() => {
    if (!autoMarkRead) return

    // Mark notifications as read when they become visible
    // This is a simple implementation - could be enhanced with IntersectionObserver
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id)

    if (unreadIds.length > 0) {
      const timer = setTimeout(() => {
        unreadIds.forEach(id => markAsRead(id))
      }, 2000) // 2 second delay before marking as read

      return () => clearTimeout(timer)
    }
  }, [notifications, autoMarkRead, markAsRead])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    markAsRead,
    markAllAsRead,
    archive,
    refresh,
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Map notification priority to toast variant
 */
function getToastVariant(priority: NotificationPriority): 'default' | 'success' | 'error' | 'warning' | 'info' {
  switch (priority) {
    case 'urgent':
      return 'error'
    case 'high':
      return 'warning'
    case 'low':
      return 'info'
    case 'normal':
    default:
      return 'default'
  }
}

// ============================================
// EXPORTS
// ============================================

export default useRealtimeNotifications
