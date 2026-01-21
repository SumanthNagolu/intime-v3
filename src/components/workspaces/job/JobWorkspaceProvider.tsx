'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullJob } from '@/types/job'

interface JobWorkspaceContextValue {
  data: FullJob
  refreshData: () => void
}

const JobWorkspaceContext = React.createContext<JobWorkspaceContextValue | null>(null)

export function useJobWorkspace() {
  const context = React.useContext(JobWorkspaceContext)
  if (!context) {
    throw new Error('useJobWorkspace must be used within JobWorkspaceProvider')
  }
  return context
}

export interface JobWorkspaceProviderProps {
  initialData: FullJob
  children: React.ReactNode
}

/**
 * JobWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function JobWorkspaceProvider({
  initialData,
  children
}: JobWorkspaceProviderProps) {
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
    <JobWorkspaceContext.Provider value={value}>
      {children}
    </JobWorkspaceContext.Provider>
  )
}

export default JobWorkspaceProvider
