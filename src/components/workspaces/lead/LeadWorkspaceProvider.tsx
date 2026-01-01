'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullLeadData } from '@/types/lead'

interface LeadWorkspaceContextValue {
  data: FullLeadData
  refreshData: () => void
}

const LeadWorkspaceContext = React.createContext<LeadWorkspaceContextValue | null>(null)

export function useLeadWorkspace() {
  const context = React.useContext(LeadWorkspaceContext)
  if (!context) {
    throw new Error('useLeadWorkspace must be used within LeadWorkspaceProvider')
  }
  return context
}

export interface LeadWorkspaceProviderProps {
  initialData: FullLeadData
  children: React.ReactNode
}

/**
 * LeadWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function LeadWorkspaceProvider({
  initialData,
  children
}: LeadWorkspaceProviderProps) {
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
    <LeadWorkspaceContext.Provider value={value}>
      {children}
    </LeadWorkspaceContext.Provider>
  )
}

export default LeadWorkspaceProvider
