'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullCampaignData } from '@/types/campaign'

interface CampaignWorkspaceContextValue {
  data: FullCampaignData
  refreshData: () => void
}

const CampaignWorkspaceContext = React.createContext<CampaignWorkspaceContextValue | null>(null)

export function useCampaignWorkspace() {
  const context = React.useContext(CampaignWorkspaceContext)
  if (!context) {
    throw new Error('useCampaignWorkspace must be used within CampaignWorkspaceProvider')
  }
  return context
}

export interface CampaignWorkspaceProviderProps {
  initialData: FullCampaignData
  children: React.ReactNode
}

/**
 * CampaignWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function CampaignWorkspaceProvider({
  initialData,
  children
}: CampaignWorkspaceProviderProps) {
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
    <CampaignWorkspaceContext.Provider value={value}>
      {children}
    </CampaignWorkspaceContext.Provider>
  )
}

export default CampaignWorkspaceProvider
