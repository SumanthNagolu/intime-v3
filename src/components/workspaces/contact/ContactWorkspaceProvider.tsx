'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullContactData } from '@/types/workspace'

interface ContactWorkspaceContextValue {
  data: FullContactData
  refreshData: () => void
}

const ContactWorkspaceContext = React.createContext<ContactWorkspaceContextValue | null>(null)

export function useContactWorkspace() {
  const context = React.useContext(ContactWorkspaceContext)
  if (!context) {
    throw new Error('useContactWorkspace must be used within ContactWorkspaceProvider')
  }
  return context
}

export interface ContactWorkspaceProviderProps {
  initialData: FullContactData
  children: React.ReactNode
}

/**
 * ContactWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function ContactWorkspaceProvider({
  initialData,
  children
}: ContactWorkspaceProviderProps) {
  const router = useRouter()
  const [data, setData] = React.useState(initialData)

  // Update data when initialData changes (after router.refresh)
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Function to refresh data (called after mutations)
  const refreshData = React.useCallback(() => {
    router.refresh()
  }, [router])

  const value = React.useMemo(() => ({
    data,
    refreshData,
  }), [data, refreshData])

  return (
    <ContactWorkspaceContext.Provider value={value}>
      {children}
    </ContactWorkspaceContext.Provider>
  )
}

export default ContactWorkspaceProvider
