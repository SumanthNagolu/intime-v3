'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullAccountData } from '@/types/workspace'

interface AccountWorkspaceContextValue {
  data: FullAccountData
  refreshData: () => void
}

const AccountWorkspaceContext = React.createContext<AccountWorkspaceContextValue | null>(null)

export function useAccountWorkspace() {
  const context = React.useContext(AccountWorkspaceContext)
  if (!context) {
    throw new Error('useAccountWorkspace must be used within AccountWorkspaceProvider')
  }
  return context
}

export interface AccountWorkspaceProviderProps {
  initialData: FullAccountData
  children: React.ReactNode
}

/**
 * AccountWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 */
export function AccountWorkspaceProvider({
  initialData,
  children
}: AccountWorkspaceProviderProps) {
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
    <AccountWorkspaceContext.Provider value={value}>
      {children}
    </AccountWorkspaceContext.Provider>
  )
}

export default AccountWorkspaceProvider
