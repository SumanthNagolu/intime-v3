'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { registerShortcut, isTauri, listen } from '@/lib/desktop/tauri-bridge'

// ============================================
// Types
// ============================================

interface ShortcutConfig {
  key: string
  modifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[]
  action: () => void
  description: string
  global?: boolean // Whether to register as global shortcut in Tauri
}

interface UseGlobalShortcutsOptions {
  enabled?: boolean
  onOpenCommandPalette?: () => void
  onNavigateToInbox?: () => void
  onNavigateToDashboard?: () => void
  onQuickSearch?: () => void
  onNewActivity?: () => void
  onToggleSidebar?: () => void
}

// ============================================
// Default Shortcuts
// ============================================

const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
const modKey = isMac ? 'meta' : 'ctrl'

// ============================================
// Hook
// ============================================

export function useGlobalShortcuts(options: UseGlobalShortcutsOptions = {}) {
  const router = useRouter()
  const {
    enabled = true,
    onOpenCommandPalette,
    onNavigateToInbox,
    onNavigateToDashboard,
    onQuickSearch,
    onNewActivity,
    onToggleSidebar,
  } = options

  const unlistenersRef = useRef<Array<() => void>>([])

  // Define shortcuts
  const shortcuts: ShortcutConfig[] = [
    // Command palette (Cmd/Ctrl + K)
    {
      key: 'k',
      modifiers: [modKey],
      action: () => onOpenCommandPalette?.(),
      description: 'Open command palette',
      global: true,
    },
    // Quick search (Cmd/Ctrl + /)
    {
      key: '/',
      modifiers: [modKey],
      action: () => onQuickSearch?.() ?? onOpenCommandPalette?.(),
      description: 'Quick search',
    },
    // Navigation shortcuts (g + key sequence)
    {
      key: 'i',
      modifiers: [],
      action: () => onNavigateToInbox?.() ?? router.push('/employee/inbox'),
      description: 'Go to Inbox',
    },
    {
      key: 'd',
      modifiers: [],
      action: () => onNavigateToDashboard?.() ?? router.push('/employee/recruiting/dashboard'),
      description: 'Go to Dashboard',
    },
    // New activity (Cmd/Ctrl + Shift + A)
    {
      key: 'a',
      modifiers: [modKey, 'shift'],
      action: () => onNewActivity?.(),
      description: 'New activity',
    },
    // Toggle sidebar (Cmd/Ctrl + \\)
    {
      key: '\\',
      modifiers: [modKey],
      action: () => onToggleSidebar?.(),
      description: 'Toggle sidebar',
    },
    // Escape - close modals/panels (handled separately)
  ]

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ignore if typing in an input
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to work in inputs
        if (event.key !== 'Escape') return
      }

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const modifiersMatch = shortcut.modifiers.every((mod) => {
          switch (mod) {
            case 'ctrl':
              return event.ctrlKey
            case 'shift':
              return event.shiftKey
            case 'alt':
              return event.altKey
            case 'meta':
              return event.metaKey
            default:
              return false
          }
        })

        // Check no extra modifiers are pressed
        const noExtraModifiers =
          (!event.ctrlKey || shortcut.modifiers.includes('ctrl')) &&
          (!event.shiftKey || shortcut.modifiers.includes('shift')) &&
          (!event.altKey || shortcut.modifiers.includes('alt')) &&
          (!event.metaKey || shortcut.modifiers.includes('meta'))

        if (keyMatches && modifiersMatch && noExtraModifiers) {
          event.preventDefault()
          event.stopPropagation()
          shortcut.action()
          return
        }
      }
    },
    [enabled, shortcuts]
  )

  // Register keyboard listener
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])

  // Register global Tauri shortcuts
  useEffect(() => {
    if (!enabled || !isTauri()) return

    const registerGlobalShortcuts = async () => {
      for (const shortcut of shortcuts.filter((s) => s.global)) {
        try {
          const shortcutString = [
            ...shortcut.modifiers.map((m) => {
              if (m === 'meta' || m === 'ctrl') return 'CmdOrCtrl'
              return m.charAt(0).toUpperCase() + m.slice(1)
            }),
            shortcut.key.toUpperCase(),
          ].join('+')

          const unlisten = await registerShortcut(shortcutString, shortcut.action)
          unlistenersRef.current.push(unlisten)
        } catch (error) {
          console.warn(`Failed to register global shortcut: ${error}`)
        }
      }
    }

    registerGlobalShortcuts()

    return () => {
      unlistenersRef.current.forEach((unlisten) => unlisten())
      unlistenersRef.current = []
    }
  }, [enabled])

  // Listen for Tauri navigation events
  useEffect(() => {
    if (!isTauri()) return

    let unlisten: (() => void) | undefined

    listen<string>('navigate', (path) => {
      router.push(path)
    }).then((fn) => {
      unlisten = fn
    })

    return () => unlisten?.()
  }, [router])

  // Listen for command palette event from Tauri
  useEffect(() => {
    if (!isTauri()) return

    let unlisten: (() => void) | undefined

    listen('open-command-palette', () => {
      onOpenCommandPalette?.()
    }).then((fn) => {
      unlisten = fn
    })

    return () => unlisten?.()
  }, [onOpenCommandPalette])

  return {
    shortcuts,
  }
}

// ============================================
// Shortcut Display Helpers
// ============================================

export function formatShortcut(shortcut: ShortcutConfig): string {
  const modSymbols: Record<string, string> = {
    ctrl: isMac ? '⌃' : 'Ctrl',
    shift: isMac ? '⇧' : 'Shift',
    alt: isMac ? '⌥' : 'Alt',
    meta: isMac ? '⌘' : 'Win',
  }

  const parts = shortcut.modifiers.map((m) => modSymbols[m])
  parts.push(shortcut.key.toUpperCase())

  return parts.join(isMac ? '' : '+')
}

export function getShortcutLabel(key: string, modifiers: string[]): string {
  const modSymbols: Record<string, string> = {
    ctrl: isMac ? '⌃' : 'Ctrl',
    shift: isMac ? '⇧' : 'Shift',
    alt: isMac ? '⌥' : 'Alt',
    meta: isMac ? '⌘' : 'Cmd',
  }

  const parts = modifiers.map((m) => modSymbols[m] ?? m)
  parts.push(key.toUpperCase())

  return parts.join(isMac ? '' : '+')
}

// ============================================
// Keyboard Shortcut Display Component
// ============================================

export function ShortcutKey({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-charcoal-500 bg-charcoal-100 rounded border border-charcoal-200 shadow-sm">
      {children}
    </kbd>
  )
}

export function ShortcutKeys({ shortcut }: { shortcut: string }) {
  const keys = shortcut.split(/(?=[+])|(?<=[+])/).filter((k) => k !== '+')

  return (
    <div className="inline-flex items-center gap-0.5">
      {keys.map((key, i) => (
        <ShortcutKey key={i}>{key}</ShortcutKey>
      ))}
    </div>
  )
}

export default useGlobalShortcuts
