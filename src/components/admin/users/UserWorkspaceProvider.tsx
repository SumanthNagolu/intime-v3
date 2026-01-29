'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { FullUserData } from '@/types/admin'
import type { UserWorkspaceMode } from '@/lib/users/tabs'

type SaveHandler = () => Promise<void> | void

interface UserWorkspaceContextValue {
  data: FullUserData
  mode: UserWorkspaceMode
  isEditing: boolean
  isSaving: boolean
  setIsEditing: (editing: boolean) => void
  refreshData: () => void
  registerSaveHandler: (handler: SaveHandler) => void
  unregisterSaveHandler: (handler: SaveHandler) => void
  triggerSave: () => Promise<void>
}

const UserWorkspaceContext = React.createContext<UserWorkspaceContextValue | null>(null)

export function useUserWorkspace() {
  const context = React.useContext(UserWorkspaceContext)
  if (!context) {
    throw new Error('useUserWorkspace must be used within UserWorkspaceProvider')
  }
  return context
}

export interface UserWorkspaceProviderProps {
  initialData: FullUserData
  mode: UserWorkspaceMode
  children: React.ReactNode
}

/**
 * UserWorkspaceProvider - Provides workspace data to all child components
 *
 * Key features:
 * - Server data passed from layout (ONE database call)
 * - refreshData() triggers router.refresh() to refetch
 * - No client-side queries - all data comes from server
 * - Mode-aware (create/view/edit)
 */
export function UserWorkspaceProvider({
  initialData,
  mode,
  children
}: UserWorkspaceProviderProps) {
  const router = useRouter()
  const [data, setData] = React.useState(initialData)
  const [isEditing, setIsEditing] = React.useState(mode === 'edit' || mode === 'create')
  const [isSaving, setIsSaving] = React.useState(false)
  const saveHandlersRef = React.useRef<Set<SaveHandler>>(new Set())

  // Update data when initialData changes (after router.refresh)
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Update editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit' || mode === 'create')
  }, [mode])

  // Function to refresh data (called after mutations)
  const refreshData = React.useCallback(() => {
    router.refresh()
  }, [router])

  // Register a save handler from a tab
  const registerSaveHandler = React.useCallback((handler: SaveHandler) => {
    saveHandlersRef.current.add(handler)
  }, [])

  // Unregister a save handler
  const unregisterSaveHandler = React.useCallback((handler: SaveHandler) => {
    saveHandlersRef.current.delete(handler)
  }, [])

  // Trigger all registered save handlers
  const triggerSave = React.useCallback(async () => {
    setIsSaving(true)
    try {
      const handlers = Array.from(saveHandlersRef.current)
      await Promise.all(handlers.map((handler) => handler()))
    } finally {
      setIsSaving(false)
    }
  }, [])

  const value = React.useMemo(() => ({
    data,
    mode,
    isEditing,
    isSaving,
    setIsEditing,
    refreshData,
    registerSaveHandler,
    unregisterSaveHandler,
    triggerSave,
  }), [data, mode, isEditing, isSaving, refreshData, registerSaveHandler, unregisterSaveHandler, triggerSave])

  return (
    <UserWorkspaceContext.Provider value={value}>
      {children}
    </UserWorkspaceContext.Provider>
  )
}

export default UserWorkspaceProvider
