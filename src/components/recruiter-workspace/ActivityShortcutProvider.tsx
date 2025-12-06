'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { LogActivityModal } from './LogActivityModal'

interface ActivityShortcutContextType {
  openLogActivity: (prefilledEntity?: { type: string; id: string; name: string }) => void
  closeLogActivity: () => void
  isOpen: boolean
}

const ActivityShortcutContext = createContext<ActivityShortcutContextType | null>(null)

export function useActivityShortcut() {
  const context = useContext(ActivityShortcutContext)
  if (!context) {
    throw new Error('useActivityShortcut must be used within ActivityShortcutProvider')
  }
  return context
}

interface ActivityShortcutProviderProps {
  children: ReactNode
}

export function ActivityShortcutProvider({ children }: ActivityShortcutProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prefilledEntity, setPrefilledEntity] = useState<{ type: string; id: string; name: string } | undefined>()

  const openLogActivity = useCallback((entity?: { type: string; id: string; name: string }) => {
    setPrefilledEntity(entity)
    setIsOpen(true)
  }, [])

  const closeLogActivity = useCallback(() => {
    setIsOpen(false)
    setPrefilledEntity(undefined)
  }, [])

  // Global keyboard shortcut: Ctrl/Cmd + L to log activity
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+L or Cmd+L to open log activity modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        openLogActivity()
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        closeLogActivity()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openLogActivity, closeLogActivity, isOpen])

  return (
    <ActivityShortcutContext.Provider value={{ openLogActivity, closeLogActivity, isOpen }}>
      {children}
      <LogActivityModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeLogActivity()
          else setIsOpen(true)
        }}
        prefilledEntity={prefilledEntity}
      />
    </ActivityShortcutContext.Provider>
  )
}
