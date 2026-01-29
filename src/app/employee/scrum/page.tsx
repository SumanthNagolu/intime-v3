'use client'

import { useTeamSpace } from '@/components/team-space'
import { SprintBoard } from '@/components/team-space'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Rocket, Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { CreateSprintDialog } from '@/components/team-space/CreateSprintDialog'
import { SprintItemDrawer } from '@/components/team-space/SprintItemDrawer'
import type { SprintItemWithRelations } from '@/types/scrum'

export default function TeamBoardPage() {
  const { activeSprint, boardColumns, boardItems, isLoadingBoard, moveItem, refetchBoard } = useTeamSpace()
  const [selectedItem, setSelectedItem] = useState<SprintItemWithRelations | null>(null)
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const [createItemColumn, setCreateItemColumn] = useState<string | undefined>()

  const handleViewItem = (item: SprintItemWithRelations) => {
    setSelectedItem(item)
    setIsItemDrawerOpen(true)
  }

  const handleCreateItem = (column?: string) => {
    setCreateItemColumn(column)
    setIsCreateItemOpen(true)
  }

  const handleMoveItem = (itemId: string, targetColumn: string, targetOrder: number) => {
    moveItem(itemId, targetColumn, targetOrder)
  }

  // Loading state
  if (isLoadingBoard && !activeSprint) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  // No active sprint state
  if (!activeSprint) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="max-w-md w-full bg-white shadow-elevation-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-100 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-gold-600" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-charcoal-900 mb-2">
              No Active Sprint
            </h2>
            <p className="text-charcoal-600 mb-6">
              Start a new sprint to begin tracking your team's work on the board.
            </p>
            <Button onClick={() => setIsCreateSprintOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Start New Sprint
            </Button>
          </CardContent>
        </Card>

        <CreateSprintDialog
          open={isCreateSprintOpen}
          onOpenChange={setIsCreateSprintOpen}
        />
      </div>
    )
  }

  return (
    <>
      <SprintBoard
        columns={boardColumns}
        items={boardItems}
        sprint={activeSprint}
        onMoveItem={handleMoveItem}
        onViewItem={handleViewItem}
        onCreateItem={handleCreateItem}
        isLoading={isLoadingBoard}
      />

      <SprintItemDrawer
        item={selectedItem}
        open={isItemDrawerOpen}
        onOpenChange={setIsItemDrawerOpen}
        onClose={() => {
          setIsItemDrawerOpen(false)
          setSelectedItem(null)
          refetchBoard()
        }}
      />

      <CreateSprintDialog
        open={isCreateSprintOpen}
        onOpenChange={setIsCreateSprintOpen}
      />
    </>
  )
}
