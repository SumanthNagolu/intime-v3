'use client'

/**
 * useKeyboardNavigation - Linear-style keyboard navigation hook
 *
 * Provides vim-style keyboard navigation for lists and other components.
 */

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardNavigationOptions {
  items: Array<{ id: string; href?: string }>
  enabled?: boolean
  onSelect?: (item: { id: string; href?: string }) => void
  onNavigate?: (direction: 'up' | 'down') => void
}

interface KeyboardNavigationState {
  selectedIndex: number
  selectedId: string | null
}

export function useKeyboardNavigation({
  items,
  enabled = true,
  onSelect,
  onNavigate,
}: KeyboardNavigationOptions): KeyboardNavigationState & {
  setSelectedIndex: (index: number) => void
  selectNext: () => void
  selectPrevious: () => void
  selectCurrent: () => void
} {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [items.length])

  // Ensure selected index is within bounds
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1))
    }
  }, [items.length, selectedIndex])

  const selectNext = useCallback(() => {
    setSelectedIndex((prev) => {
      const next = prev < items.length - 1 ? prev + 1 : 0
      onNavigate?.('down')
      return next
    })
  }, [items.length, onNavigate])

  const selectPrevious = useCallback(() => {
    setSelectedIndex((prev) => {
      const next = prev > 0 ? prev - 1 : items.length - 1
      onNavigate?.('up')
      return next
    })
  }, [items.length, onNavigate])

  const selectCurrent = useCallback(() => {
    const item = items[selectedIndex]
    if (item) {
      if (onSelect) {
        onSelect(item)
      } else if (item.href) {
        router.push(item.href)
      }
    }
  }, [items, selectedIndex, onSelect, router])

  // Keyboard event handler
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          selectNext()
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          selectPrevious()
          break
        case 'Enter':
          e.preventDefault()
          selectCurrent()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, selectNext, selectPrevious, selectCurrent])

  return {
    selectedIndex,
    selectedId: items[selectedIndex]?.id ?? null,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    selectCurrent,
  }
}

/**
 * useGlobalShortcuts - Register global keyboard shortcuts
 *
 * Provides vim-style navigation shortcuts (G+letter for go to page).
 */

interface ShortcutDefinition {
  keys: string[]
  action: () => void
  description?: string
}

export function useGlobalShortcuts(shortcuts: ShortcutDefinition[]) {
  const [pendingKeys, setPendingKeys] = useState<string[]>([])
  const [pendingTimeout, setPendingTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      // Don't handle if modifier keys are pressed (except shift)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return
      }

      const key = e.key.toUpperCase()
      const newPendingKeys = [...pendingKeys, key]

      // Clear previous timeout
      if (pendingTimeout) {
        clearTimeout(pendingTimeout)
      }

      // Check if any shortcut matches
      for (const shortcut of shortcuts) {
        const shortcutKeys = shortcut.keys.map((k) => k.toUpperCase())

        // Exact match
        if (
          shortcutKeys.length === newPendingKeys.length &&
          shortcutKeys.every((k, i) => k === newPendingKeys[i])
        ) {
          e.preventDefault()
          shortcut.action()
          setPendingKeys([])
          return
        }

        // Partial match - keep accumulating
        if (
          shortcutKeys.length > newPendingKeys.length &&
          shortcutKeys.slice(0, newPendingKeys.length).every((k, i) => k === newPendingKeys[i])
        ) {
          e.preventDefault()
          setPendingKeys(newPendingKeys)

          // Set timeout to clear pending keys
          const timeout = setTimeout(() => {
            setPendingKeys([])
          }, 1000)
          setPendingTimeout(timeout)
          return
        }
      }

      // No match - reset
      setPendingKeys([])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (pendingTimeout) {
        clearTimeout(pendingTimeout)
      }
    }
  }, [shortcuts, pendingKeys, pendingTimeout])

  return { pendingKeys }
}

/**
 * Pre-defined navigation shortcuts for the app
 */
export function useNavigationShortcuts() {
  const router = useRouter()

  const shortcuts: ShortcutDefinition[] = [
    // Go to pages (G + letter)
    { keys: ['G', 'I'], action: () => router.push('/inbox'), description: 'Go to Inbox' },
    { keys: ['G', 'J'], action: () => router.push('/jobs'), description: 'Go to Jobs' },
    { keys: ['G', 'C'], action: () => router.push('/candidates'), description: 'Go to Candidates' },
    { keys: ['G', 'A'], action: () => router.push('/accounts'), description: 'Go to Accounts' },
    { keys: ['G', 'L'], action: () => router.push('/leads'), description: 'Go to Leads' },
    { keys: ['G', 'D'], action: () => router.push('/deals'), description: 'Go to Deals' },
    { keys: ['G', 'S'], action: () => router.push('/settings'), description: 'Go to Settings' },

    // Create new (C + letter)
    { keys: ['C', 'J'], action: () => router.push('/jobs/new'), description: 'Create Job' },
    { keys: ['C', 'C'], action: () => router.push('/candidates/new'), description: 'Create Candidate' },
    { keys: ['C', 'A'], action: () => router.push('/accounts/new'), description: 'Create Account' },
    { keys: ['C', 'L'], action: () => router.push('/leads/new'), description: 'Create Lead' },
    { keys: ['C', 'D'], action: () => router.push('/deals/new'), description: 'Create Deal' },
  ]

  return useGlobalShortcuts(shortcuts)
}
