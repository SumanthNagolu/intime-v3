'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { CrossPillarLeadDialog } from './CrossPillarLeadDialog'

interface CrossPillarLeadContextType {
  openCrossPillarLead: () => void
  closeCrossPillarLead: () => void
  isOpen: boolean
}

const CrossPillarLeadContext = createContext<CrossPillarLeadContextType | null>(null)

export function useCrossPillarLead() {
  const context = useContext(CrossPillarLeadContext)
  if (!context) {
    throw new Error('useCrossPillarLead must be used within CrossPillarLeadProvider')
  }
  return context
}

interface CrossPillarLeadProviderProps {
  children: ReactNode
}

export function CrossPillarLeadProvider({ children }: CrossPillarLeadProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openCrossPillarLead = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCrossPillarLead = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Global keyboard shortcut: Cmd+Shift+L (or Ctrl+Shift+L) for cross-pillar lead
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+L or Ctrl+Shift+L to open cross-pillar lead dialog
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        openCrossPillarLead()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openCrossPillarLead])

  return (
    <CrossPillarLeadContext.Provider
      value={{ openCrossPillarLead, closeCrossPillarLead, isOpen }}
    >
      {children}
      <CrossPillarLeadDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeCrossPillarLead()
          else setIsOpen(true)
        }}
      />
    </CrossPillarLeadContext.Provider>
  )
}
