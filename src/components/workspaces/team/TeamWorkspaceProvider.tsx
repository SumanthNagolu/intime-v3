'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullTeamEntityData } from '@/types/workspace'

interface TeamWorkspaceContextValue {
  data: FullTeamEntityData
  refreshData: () => void
}

const TeamWorkspaceContext = React.createContext<TeamWorkspaceContextValue | null>(null)

export function useTeamWorkspace() {
  const context = React.useContext(TeamWorkspaceContext)
  if (!context) {
    throw new Error('useTeamWorkspace must be used within TeamWorkspaceProvider')
  }
  return context
}

export interface TeamWorkspaceProviderProps {
  initialData: FullTeamEntityData
  children: React.ReactNode
}

/**
 * TeamWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function TeamWorkspaceProvider({
  initialData,
  children
}: TeamWorkspaceProviderProps) {
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
    <TeamWorkspaceContext.Provider value={value}>
      {children}
    </TeamWorkspaceContext.Provider>
  )
}

export default TeamWorkspaceProvider
