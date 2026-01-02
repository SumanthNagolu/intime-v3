'use client'

import { createContext, useContext, ReactNode } from 'react'
import { type UserRole } from '@/lib/auth/client'

/**
 * Context for sharing user role fetched server-side.
 * This eliminates the need for client-side getMyRole API calls.
 */
const UserRoleContext = createContext<UserRole | null>(null)

interface UserRoleProviderProps {
  children: ReactNode
  role: UserRole | null
}

export function UserRoleProvider({ children, role }: UserRoleProviderProps) {
  return (
    <UserRoleContext.Provider value={role}>
      {children}
    </UserRoleContext.Provider>
  )
}

/**
 * Hook to access the user role from context.
 * Returns null if role is not available (user not authenticated or role fetch failed).
 */
export function useUserRole(): UserRole | null {
  return useContext(UserRoleContext)
}
