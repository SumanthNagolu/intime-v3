'use client'

import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface EmergencyShortcutsOptions {
  /** Callback when Create Incident shortcut is triggered */
  onCreateIncident?: () => void
  /** Callback when Send Notification shortcut is triggered */
  onSendNotification?: () => void
  /** Whether shortcuts are enabled (e.g., only for admins) */
  enabled?: boolean
}

/**
 * Hook for emergency keyboard shortcuts.
 *
 * Shortcuts (all require Cmd/Ctrl + Shift):
 * - E: Open Emergency Dashboard
 * - I: Create Incident
 * - N: Send Notification
 * - L: View Incident Log (same as E)
 * - B: Break-Glass page
 * - A: Audit Logs
 *
 * @example
 * ```tsx
 * useEmergencyShortcuts({
 *   onCreateIncident: () => setShowCreateDialog(true),
 *   onSendNotification: () => setShowNotificationDialog(true),
 *   enabled: isAdmin,
 * })
 * ```
 */
export function useEmergencyShortcuts(options: EmergencyShortcutsOptions = {}) {
  const { onCreateIncident, onSendNotification, enabled = true } = options
  const router = useRouter()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only handle if enabled
      if (!enabled) return

      // Check for Cmd/Ctrl + Shift
      const isMod = event.metaKey || event.ctrlKey
      const isShift = event.shiftKey

      if (!isMod || !isShift) return

      // Don't trigger if typing in an input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'e':
        case 'l': // L for Log (same as E for Emergency Dashboard)
          event.preventDefault()
          router.push('/employee/admin/emergency')
          break

        case 'i':
          event.preventDefault()
          if (onCreateIncident) {
            onCreateIncident()
          } else {
            // Navigate to emergency dashboard and let user create from there
            router.push('/employee/admin/emergency')
          }
          break

        case 'n':
          event.preventDefault()
          if (onSendNotification) {
            onSendNotification()
          }
          break

        case 'b':
          event.preventDefault()
          router.push('/employee/admin/emergency/break-glass')
          break

        case 'a':
          event.preventDefault()
          router.push('/employee/admin/audit')
          break

        case 'd':
          event.preventDefault()
          router.push('/employee/admin/emergency/drills')
          break
      }
    },
    [enabled, router, onCreateIncident, onSendNotification]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}

/**
 * Component to display available keyboard shortcuts
 */
export function EmergencyShortcutsHelp() {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac')
  const modKey = isMac ? '⌘' : 'Ctrl'

  const shortcuts = [
    { keys: `${modKey}+⇧+E`, action: 'Emergency Dashboard' },
    { keys: `${modKey}+⇧+I`, action: 'Create Incident' },
    { keys: `${modKey}+⇧+N`, action: 'Send Notification' },
    { keys: `${modKey}+⇧+B`, action: 'Break-Glass Access' },
    { keys: `${modKey}+⇧+D`, action: 'Drills' },
    { keys: `${modKey}+⇧+A`, action: 'Audit Logs' },
  ]

  return (
    <div className="p-4 bg-charcoal-50 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
      <div className="space-y-1">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.keys} className="flex justify-between text-sm">
            <span className="text-charcoal-500">{shortcut.action}</span>
            <kbd className="px-2 py-0.5 bg-white border rounded text-xs font-mono">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  )
}
