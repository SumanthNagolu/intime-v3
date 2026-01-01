'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullCandidateData } from '@/types/candidate-workspace'

interface CandidateWorkspaceContextValue {
  data: FullCandidateData
  refreshData: () => void
}

const CandidateWorkspaceContext = React.createContext<CandidateWorkspaceContextValue | null>(null)

export function useCandidateWorkspace() {
  const context = React.useContext(CandidateWorkspaceContext)
  if (!context) {
    throw new Error('useCandidateWorkspace must be used within CandidateWorkspaceProvider')
  }
  return context
}

export interface CandidateWorkspaceProviderProps {
  initialData: FullCandidateData
  children: React.ReactNode
}

/**
 * CandidateWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function CandidateWorkspaceProvider({
  initialData,
  children
}: CandidateWorkspaceProviderProps) {
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
    <CandidateWorkspaceContext.Provider value={value}>
      {children}
    </CandidateWorkspaceContext.Provider>
  )
}

export default CandidateWorkspaceProvider
