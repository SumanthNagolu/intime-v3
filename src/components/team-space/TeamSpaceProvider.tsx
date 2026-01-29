'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { Sprint, SprintItemWithRelations, BoardColumn } from '@/types/scrum'
import type { TeamWorkspaceData } from '@/types/workspace'

interface TeamSpaceContextValue {
  // Sprint/Scrum data
  activeSprint: Sprint | null
  sprints: Sprint[]
  backlog: SprintItemWithRelations[]
  boardColumns: BoardColumn[]
  boardItems: Record<string, SprintItemWithRelations[]>

  // Team data (legacy)
  teamData: TeamWorkspaceData | null

  // Loading states
  isLoadingSprints: boolean
  isLoadingBoard: boolean

  // Mutations
  moveItem: (itemId: string, targetColumn: string, targetOrder: number) => void
  refetchBoard: () => void
  refetchSprints: () => void
  refetchBacklog: () => void
}

const TeamSpaceContext = createContext<TeamSpaceContextValue | null>(null)

export function useTeamSpace() {
  const context = useContext(TeamSpaceContext)
  if (!context) {
    throw new Error('useTeamSpace must be used within TeamSpaceProvider')
  }
  return context
}

interface TeamSpaceProviderProps {
  children: ReactNode
  initialTeamData?: TeamWorkspaceData | null
}

export function TeamSpaceProvider({ children, initialTeamData }: TeamSpaceProviderProps) {
  // Fetch active sprint
  const { data: activeSprint, isLoading: isLoadingActive } = trpc.sprints.getActive.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })

  // Fetch all sprints
  const { data: sprintsData, isLoading: isLoadingSprints, refetch: refetchSprints } = trpc.sprints.list.useQuery(
    { limit: 50 },
    { refetchOnWindowFocus: false }
  )

  // Fetch backlog items
  const { data: backlogData, refetch: refetchBacklog } = trpc.sprintItems.getBacklog.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })

  // Fetch full board for active sprint
  const { data: boardData, isLoading: isLoadingBoard, refetch: refetchBoard } = trpc.board.getFullBoard.useQuery(
    { sprintId: activeSprint?.id },
    {
      enabled: !!activeSprint?.id,
      refetchOnWindowFocus: false,
    }
  )

  // Move item mutation
  const moveItemMutation = trpc.sprintItems.moveItem.useMutation({
    onSuccess: () => {
      refetchBoard()
    },
  })

  const moveItem = (itemId: string, targetColumn: string, targetOrder: number) => {
    moveItemMutation.mutate({
      id: itemId,
      status: targetColumn as 'todo' | 'in_progress' | 'review' | 'done' | 'blocked',
      boardOrder: targetOrder,
    })
  }

  // Transform board data to items by column - boardData.items is already keyed by column
  const boardItems: Record<string, SprintItemWithRelations[]> = boardData?.items
    ? (boardData.items as Record<string, SprintItemWithRelations[]>)
    : {}

  const value: TeamSpaceContextValue = {
    activeSprint: activeSprint || null,
    sprints: sprintsData?.items || [],
    backlog: backlogData || [],
    boardColumns: boardData?.columns || [],
    boardItems,
    teamData: initialTeamData || null,
    isLoadingSprints: isLoadingSprints || isLoadingActive,
    isLoadingBoard,
    moveItem,
    refetchBoard,
    refetchSprints,
    refetchBacklog,
  }

  return (
    <TeamSpaceContext.Provider value={value}>
      {children}
    </TeamSpaceContext.Provider>
  )
}
