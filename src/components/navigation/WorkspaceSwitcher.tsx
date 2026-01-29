'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Check, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspaceType } from '@/types/scrum'

const WORKSPACE_STORAGE_KEY = 'intime-workspace-selection'

interface WorkspaceSwitcherProps {
  teamName?: string
  hasTeam: boolean
  onSelect?: (workspace: WorkspaceType) => void
  className?: string
}

export function useWorkspaceSelection() {
  const [workspace, setWorkspace] = useState<WorkspaceType>('my-space')

  useEffect(() => {
    const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY)
    if (stored === 'my-space' || stored === 'team-space') {
      setWorkspace(stored)
    }
  }, [])

  const setCurrentWorkspace = (newWorkspace: WorkspaceType) => {
    setWorkspace(newWorkspace)
    localStorage.setItem(WORKSPACE_STORAGE_KEY, newWorkspace)
  }

  return { workspace, setWorkspace: setCurrentWorkspace }
}

export function WorkspaceSwitcher({
  teamName,
  hasTeam,
  onSelect,
  className,
}: WorkspaceSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { workspace, setWorkspace } = useWorkspaceSelection()

  // Determine current workspace from URL
  const isTeamSpace = pathname.includes('/employee/team')
  const currentWorkspace: WorkspaceType = isTeamSpace ? 'team-space' : 'my-space'

  const handleSelect = (selected: WorkspaceType) => {
    setWorkspace(selected)
    onSelect?.(selected)

    // Navigate to the appropriate workspace
    if (selected === 'my-space' && isTeamSpace) {
      router.push('/employee/workspace')
    } else if (selected === 'team-space' && !isTeamSpace) {
      router.push('/employee/team')
    }
  }

  return (
    <div className={cn('px-2 py-2', className)}>
      <div className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider px-2 mb-2">
        Switch Workspace
      </div>
      <div className="space-y-0.5">
        {/* My Space Option */}
        <button
          onClick={() => handleSelect('my-space')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 border-l-2 transition-all duration-200',
            currentWorkspace === 'my-space'
              ? 'bg-charcoal-50 text-charcoal-900 border-gold-500'
              : 'text-charcoal-700 hover:bg-charcoal-50 border-transparent hover:border-gold-500/50'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-colors',
              currentWorkspace === 'my-space'
                ? 'bg-charcoal-900 text-white'
                : 'bg-charcoal-100 text-charcoal-500'
            )}
          >
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-sm">My Space</div>
            <div className="text-xs text-charcoal-500">Personal dashboard & pipeline</div>
          </div>
          {currentWorkspace === 'my-space' && (
            <Check className="w-4 h-4 text-gold-600" />
          )}
        </button>

        {/* Team Space Option */}
        <button
          onClick={() => hasTeam && handleSelect('team-space')}
          disabled={!hasTeam}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 border-l-2 transition-all duration-200',
            !hasTeam && 'opacity-50 cursor-not-allowed',
            currentWorkspace === 'team-space'
              ? 'bg-charcoal-50 text-charcoal-900 border-gold-500'
              : hasTeam
                ? 'text-charcoal-700 hover:bg-charcoal-50 border-transparent hover:border-gold-500/50'
                : 'text-charcoal-400 border-transparent'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-colors',
              currentWorkspace === 'team-space'
                ? 'bg-charcoal-900 text-white'
                : 'bg-charcoal-100 text-charcoal-500'
            )}
          >
            <Users className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-sm">
              {teamName || 'Team Space'}
            </div>
            <div className="text-xs text-charcoal-500">
              {hasTeam ? 'Team dashboard & pipeline' : 'No team assigned'}
            </div>
          </div>
          {currentWorkspace === 'team-space' && hasTeam && (
            <Check className="w-4 h-4 text-gold-600" />
          )}
        </button>
      </div>
    </div>
  )
}

// Inline variant for the dropdown header
export function WorkspaceSwitcherCompact({
  teamName,
  hasTeam,
  onSelect,
}: Omit<WorkspaceSwitcherProps, 'className'>) {
  const pathname = usePathname()
  const router = useRouter()
  const { setWorkspace } = useWorkspaceSelection()

  const isTeamSpace = pathname.includes('/employee/team')
  const currentWorkspace: WorkspaceType = isTeamSpace ? 'team-space' : 'my-space'

  const handleToggle = () => {
    const newWorkspace = currentWorkspace === 'my-space' ? 'team-space' : 'my-space'
    if (newWorkspace === 'team-space' && !hasTeam) return

    setWorkspace(newWorkspace)
    onSelect?.(newWorkspace)

    if (newWorkspace === 'my-space') {
      router.push('/employee/workspace')
    } else {
      router.push('/employee/team')
    }
  }

  return (
    <div className="px-3 py-2 border-b border-charcoal-100">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className="flex-1 flex items-center gap-2 px-3 py-2 bg-charcoal-50 hover:bg-charcoal-100 border-l-2 border-gold-500 transition-colors"
        >
          {currentWorkspace === 'my-space' ? (
            <>
              <User className="w-4 h-4 text-charcoal-700" />
              <span className="font-medium text-sm text-charcoal-900">My Space</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-charcoal-700" />
              <span className="font-medium text-sm text-charcoal-900">
                {teamName || 'Team Space'}
              </span>
            </>
          )}
          <span className="ml-auto text-xs text-charcoal-400 uppercase tracking-wider">
            Switch
          </span>
        </button>
      </div>
    </div>
  )
}
