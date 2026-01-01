'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullDealData } from '@/types/deal'

interface DealWorkspaceContextValue {
  data: FullDealData
  refreshData: () => void
}

const DealWorkspaceContext = React.createContext<DealWorkspaceContextValue | null>(null)

export function useDealWorkspace() {
  const context = React.useContext(DealWorkspaceContext)
  if (!context) {
    throw new Error('useDealWorkspace must be used within DealWorkspaceProvider')
  }
  return context
}

export interface DealWorkspaceProviderProps {
  initialData: FullDealData
  children: React.ReactNode
}

/**
 * DealWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function DealWorkspaceProvider({
  initialData,
  children
}: DealWorkspaceProviderProps) {
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
    <DealWorkspaceContext.Provider value={value}>
      {children}
    </DealWorkspaceContext.Provider>
  )
}

export default DealWorkspaceProvider
