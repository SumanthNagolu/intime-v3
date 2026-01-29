'use client'

import { useState, useMemo } from 'react'
import { useTeamSpace } from '@/components/team-space'
import { SprintItemCardStatic } from '@/components/team-space'
import { SprintItemDrawer } from '@/components/team-space/SprintItemDrawer'
import { CreateSprintDialog } from '@/components/team-space/CreateSprintDialog'
import { CreateItemDialog } from '@/components/team-space/CreateItemDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import { format, differenceInDays } from 'date-fns'
import {
  Plus,
  Target,
  ArrowRight,
  Search,
  Loader2,
  Zap,
  ListTodo,
  Calendar,
  Rocket,
  CheckCircle2,
} from 'lucide-react'
import type { SprintItemWithRelations, Sprint } from '@/types/scrum'
import { cn } from '@/lib/utils'

export default function SprintPlanningPage() {
  const { backlog, sprints, activeSprint, refetchBacklog, refetchSprints } = useTeamSpace()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [targetSprintId, setTargetSprintId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<SprintItemWithRelations | null>(null)
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)

  const addToSprintMutation = trpc.sprintItems.addToSprint.useMutation({
    onSuccess: () => {
      setSelectedItems(new Set())
      refetchBacklog()
      refetchSprints()
    },
  })

  // Filter backlog
  const filteredBacklog = useMemo(() => {
    return backlog.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemNumber.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [backlog, searchQuery])

  // Get planning/active sprint
  const planningSprint = sprints.find((s) => s.status === 'planning') || activeSprint

  // Calculate capacity metrics
  const selectedPoints = useMemo(() => {
    return Array.from(selectedItems).reduce((sum, id) => {
      const item = backlog.find((i) => i.id === id)
      return sum + (item?.storyPoints || 0)
    }, 0)
  }, [selectedItems, backlog])

  const handleSelectItem = (item: SprintItemWithRelations) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(item.id)) {
        newSet.delete(item.id)
      } else {
        newSet.add(item.id)
      }
      return newSet
    })
  }

  const handleViewItem = (item: SprintItemWithRelations) => {
    setViewItem(item)
    setIsItemDrawerOpen(true)
  }

  const handleAddToSprint = () => {
    const sprintId = targetSprintId || planningSprint?.id
    if (selectedItems.size === 0 || !sprintId) return

    addToSprintMutation.mutate({
      itemIds: Array.from(selectedItems),
      sprintId,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900">Sprint Planning</h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Plan and scope your upcoming sprint
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsCreateItemOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Item
          </Button>
          <Button onClick={() => setIsCreateSprintOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Sprint
          </Button>
        </div>
      </div>

      {/* Sprint Selection & Stats */}
      {planningSprint ? (
        <Card className="bg-gradient-to-r from-gold-50 to-gold-100/50 border-gold-200 shadow-elevation-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-gold-100 text-gold-700 border-gold-300">
                    {planningSprint.status === 'planning' ? 'Planning' : 'Active'}
                  </Badge>
                  <span className="text-sm text-charcoal-500">
                    {format(new Date(planningSprint.startDate), 'MMM d')} - {format(new Date(planningSprint.endDate), 'MMM d')}
                  </span>
                </div>
                <h2 className="text-xl font-heading font-bold text-charcoal-900">
                  {planningSprint.name}
                </h2>
                {planningSprint.goal && (
                  <div className="flex items-start gap-2 mt-2">
                    <Target className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-charcoal-600">{planningSprint.goal}</p>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase font-medium">Items</p>
                    <p className="text-2xl font-bold text-charcoal-900">{planningSprint.totalItems}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase font-medium">Points</p>
                    <p className="text-2xl font-bold text-charcoal-900">{planningSprint.totalPoints}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase font-medium">Days</p>
                    <p className="text-2xl font-bold text-charcoal-900">
                      {differenceInDays(new Date(planningSprint.endDate), new Date(planningSprint.startDate))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white shadow-elevation-sm border-dashed">
          <CardContent className="p-8 text-center">
            <Rocket className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-semibold text-charcoal-700 mb-2">No Sprint to Plan</h3>
            <p className="text-sm text-charcoal-500 mb-4">
              Create a new sprint to start planning.
            </p>
            <Button onClick={() => setIsCreateSprintOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create Sprint
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Backlog Column */}
        <Card className="bg-white shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-charcoal-600" />
                Backlog
                <Badge variant="secondary">{filteredBacklog.length}</Badge>
              </CardTitle>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                placeholder="Search backlog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredBacklog.length === 0 ? (
              <div className="text-center py-8">
                <ListTodo className="w-10 h-10 mx-auto text-charcoal-300 mb-2" />
                <p className="text-sm text-charcoal-500">No items in backlog</p>
              </div>
            ) : (
              filteredBacklog.map((item) => (
                <SprintItemCardStatic
                  key={item.id}
                  item={item}
                  selected={selectedItems.has(item.id)}
                  onSelect={handleSelectItem}
                  onView={handleViewItem}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Planning Column */}
        <div className="space-y-4">
          {/* Selection Summary */}
          {selectedItems.size > 0 && (
            <Card className="bg-gold-50 border-gold-200 shadow-elevation-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-charcoal-600">Selected</p>
                      <p className="text-xl font-bold text-charcoal-900">
                        {selectedItems.size} items
                      </p>
                    </div>
                    <div className="w-px h-10 bg-gold-300" />
                    <div>
                      <p className="text-sm text-charcoal-600">Total Points</p>
                      <p className="text-xl font-bold text-gold-700">{selectedPoints}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToSprint}
                    disabled={!planningSprint || addToSprintMutation.isPending}
                  >
                    {addToSprintMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-1" />
                    )}
                    Add to Sprint
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sprint Items Preview */}
          {planningSprint && (
            <Card className="bg-white shadow-elevation-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-charcoal-600" />
                  Sprint Items
                  <Badge variant="secondary">{planningSprint.totalItems}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="w-10 h-10 mx-auto text-charcoal-300 mb-2" />
                  <p className="text-sm text-charcoal-500">
                    {planningSprint.totalItems > 0
                      ? `${planningSprint.totalItems} items planned (${planningSprint.totalPoints} points)`
                      : 'Select items from the backlog to add to this sprint'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Planning Tips */}
          <Card className="bg-charcoal-50 border-charcoal-200 shadow-elevation-sm">
            <CardContent className="p-4">
              <h4 className="font-medium text-charcoal-800 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Planning Tips
              </h4>
              <ul className="text-sm text-charcoal-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Start with must-have items (bugs, critical features)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Reserve 20% capacity for unexpected work
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Balance new features with tech debt
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <SprintItemDrawer
        item={viewItem}
        open={isItemDrawerOpen}
        onOpenChange={setIsItemDrawerOpen}
        onClose={() => {
          setIsItemDrawerOpen(false)
          setViewItem(null)
        }}
      />

      <CreateSprintDialog open={isCreateSprintOpen} onOpenChange={setIsCreateSprintOpen} />
      <CreateItemDialog open={isCreateItemOpen} onOpenChange={setIsCreateItemOpen} />
    </div>
  )
}
