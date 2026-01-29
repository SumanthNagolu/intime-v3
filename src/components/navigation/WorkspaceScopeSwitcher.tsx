'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Check, User, Users, UserCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// =============================================================================
// TYPES
// =============================================================================

export type WorkspaceScope = 'my-work' | 'team' | 'user'

export interface WorkspaceScopeState {
  scope: WorkspaceScope
  selectedUserId?: string
  selectedUserName?: string
}

interface WorkspaceScopeContextValue extends WorkspaceScopeState {
  setScope: (scope: WorkspaceScope, userId?: string, userName?: string) => void
  isMyWork: boolean
  isTeamWork: boolean
  isUserWork: boolean
}

// =============================================================================
// CONTEXT
// =============================================================================

const SCOPE_STORAGE_KEY = 'intime-workspace-scope'

const WorkspaceScopeContext = createContext<WorkspaceScopeContextValue | null>(null)

export function useWorkspaceScope() {
  const context = useContext(WorkspaceScopeContext)
  if (!context) {
    throw new Error('useWorkspaceScope must be used within WorkspaceScopeProvider')
  }
  return context
}

// =============================================================================
// PROVIDER
// =============================================================================

export function WorkspaceScopeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkspaceScopeState>({ scope: 'my-work' })
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize from URL params or localStorage
  useEffect(() => {
    const scopeParam = searchParams.get('scope') as WorkspaceScope | null
    const userIdParam = searchParams.get('userId')
    const userNameParam = searchParams.get('userName')

    if (scopeParam) {
      setState({
        scope: scopeParam,
        selectedUserId: userIdParam || undefined,
        selectedUserName: userNameParam || undefined,
      })
    } else {
      // Try localStorage
      const stored = localStorage.getItem(SCOPE_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as WorkspaceScopeState
          setState(parsed)
        } catch {
          // Invalid stored data
        }
      }
    }
  }, [searchParams])

  const setScope = (scope: WorkspaceScope, userId?: string, userName?: string) => {
    const newState: WorkspaceScopeState = {
      scope,
      selectedUserId: userId,
      selectedUserName: userName,
    }
    setState(newState)
    localStorage.setItem(SCOPE_STORAGE_KEY, JSON.stringify(newState))

    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    params.set('scope', scope)
    if (userId) {
      params.set('userId', userId)
      params.set('userName', userName || '')
    } else {
      params.delete('userId')
      params.delete('userName')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const value: WorkspaceScopeContextValue = {
    ...state,
    setScope,
    isMyWork: state.scope === 'my-work',
    isTeamWork: state.scope === 'team',
    isUserWork: state.scope === 'user',
  }

  return (
    <WorkspaceScopeContext.Provider value={value}>
      {children}
    </WorkspaceScopeContext.Provider>
  )
}

// =============================================================================
// SCOPE SWITCHER COMPONENT (for dropdown menus)
// =============================================================================

interface TeamMember {
  id: string
  name: string
  avatarUrl?: string
}

interface WorkspaceScopeSwitcherProps {
  teamMembers?: TeamMember[]
  className?: string
}

export function WorkspaceScopeSwitcher({
  teamMembers = [],
  className,
}: WorkspaceScopeSwitcherProps) {
  const { scope, selectedUserName, setScope, isMyWork, isTeamWork, isUserWork } = useWorkspaceScope()

  const scopeLabel = isMyWork
    ? 'My Work'
    : isTeamWork
    ? 'Team Work'
    : selectedUserName || 'By User'

  const ScopeIcon = isMyWork ? User : isTeamWork ? Users : UserCircle

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-left',
            className
          )}
        >
          <ScopeIcon className="w-4 h-4 text-charcoal-500" />
          <span className="font-medium text-sm">{scopeLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider">
            View Scope
          </p>
        </div>

        {/* My Work */}
        <DropdownMenuItem
          onClick={() => setScope('my-work')}
          className={cn(isMyWork && 'bg-charcoal-50')}
        >
          <User className="w-4 h-4 mr-2 text-charcoal-500" />
          <span className="flex-1">My Work</span>
          {isMyWork && <Check className="w-4 h-4 text-gold-600" />}
        </DropdownMenuItem>

        {/* Team Work */}
        <DropdownMenuItem
          onClick={() => setScope('team')}
          className={cn(isTeamWork && 'bg-charcoal-50')}
        >
          <Users className="w-4 h-4 mr-2 text-charcoal-500" />
          <span className="flex-1">Team Work</span>
          {isTeamWork && <Check className="w-4 h-4 text-gold-600" />}
        </DropdownMenuItem>

        {/* By User */}
        {teamMembers.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider">
                By Team Member
              </p>
            </div>
            {teamMembers.slice(0, 5).map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => setScope('user', member.id, member.name)}
                className={cn(isUserWork && selectedUserName === member.name && 'bg-charcoal-50')}
              >
                <UserCircle className="w-4 h-4 mr-2 text-charcoal-500" />
                <span className="flex-1 truncate">{member.name}</span>
                {isUserWork && selectedUserName === member.name && (
                  <Check className="w-4 h-4 text-gold-600" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// =============================================================================
// INLINE VARIANT (for sidebar)
// =============================================================================

export function WorkspaceScopeSwitcherInline({
  teamMembers = [],
}: WorkspaceScopeSwitcherProps) {
  const { scope, selectedUserName, setScope, isMyWork, isTeamWork, isUserWork } = useWorkspaceScope()

  return (
    <div className="px-2 py-2 border-b border-charcoal-200/60">
      <div className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider px-2 mb-2">
        View Scope
      </div>
      <div className="space-y-0.5">
        {/* My Work */}
        <button
          onClick={() => setScope('my-work')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
            isMyWork
              ? 'bg-charcoal-900 text-white'
              : 'text-charcoal-600 hover:bg-charcoal-100'
          )}
        >
          <User className={cn('w-4 h-4', isMyWork ? 'text-white' : 'text-charcoal-400')} />
          <span className="flex-1 text-left text-sm font-medium">My Work</span>
          {isMyWork && <Check className="w-4 h-4" />}
        </button>

        {/* Team Work */}
        <button
          onClick={() => setScope('team')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
            isTeamWork
              ? 'bg-charcoal-900 text-white'
              : 'text-charcoal-600 hover:bg-charcoal-100'
          )}
        >
          <Users className={cn('w-4 h-4', isTeamWork ? 'text-white' : 'text-charcoal-400')} />
          <span className="flex-1 text-left text-sm font-medium">Team Work</span>
          {isTeamWork && <Check className="w-4 h-4" />}
        </button>

        {/* User picker dropdown */}
        {teamMembers.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                  isUserWork
                    ? 'bg-charcoal-900 text-white'
                    : 'text-charcoal-600 hover:bg-charcoal-100'
                )}
              >
                <UserCircle className={cn('w-4 h-4', isUserWork ? 'text-white' : 'text-charcoal-400')} />
                <span className="flex-1 text-left text-sm font-medium truncate">
                  {isUserWork && selectedUserName ? selectedUserName : 'By User'}
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5', isUserWork ? 'text-white/70' : 'text-charcoal-400')} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {teamMembers.map((member) => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => setScope('user', member.id, member.name)}
                >
                  <span className="truncate">{member.name}</span>
                  {isUserWork && selectedUserName === member.name && (
                    <Check className="w-4 h-4 text-gold-600 ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
