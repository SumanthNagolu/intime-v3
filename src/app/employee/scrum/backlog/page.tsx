'use client'

import { useState, useMemo } from 'react'
import { useTeamSpace } from '@/components/team-space'
import { SprintItemCardStatic } from '@/components/team-space'
import { SprintItemDrawer } from '@/components/team-space/SprintItemDrawer'
import { CreateItemDialog } from '@/components/team-space/CreateItemDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import {
  Plus,
  Search,
  Filter,
  Rocket,
  ListTodo,
  Loader2,
  ArrowUpDown,
} from 'lucide-react'
import type { SprintItemWithRelations, SprintItemType, SprintItemPriority } from '@/types/scrum'

export default function BacklogPage() {
  const { backlog, sprints, activeSprint, refetchBacklog } = useTeamSpace()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SprintItemType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<SprintItemPriority | 'all'>('all')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewItem, setViewItem] = useState<SprintItemWithRelations | null>(null)
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const addToSprintMutation = trpc.sprintItems.addToSprint.useMutation({
    onSuccess: () => {
      setSelectedItems(new Set())
      refetchBacklog()
    },
  })

  // Filter and search backlog
  const filteredBacklog = useMemo(() => {
    return backlog.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemNumber.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === 'all' || item.itemType === typeFilter
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter

      return matchesSearch && matchesType && matchesPriority
    })
  }, [backlog, searchQuery, typeFilter, priorityFilter])

  // Calculate stats
  const stats = useMemo(() => ({
    total: backlog.length,
    stories: backlog.filter((i) => i.itemType === 'story').length,
    bugs: backlog.filter((i) => i.itemType === 'bug').length,
    tasks: backlog.filter((i) => i.itemType === 'task').length,
    totalPoints: backlog.reduce((sum, i) => sum + (i.storyPoints || 0), 0),
  }), [backlog])

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
    if (selectedItems.size === 0 || !activeSprint) return
    addToSprintMutation.mutate({
      itemIds: Array.from(selectedItems),
      sprintId: activeSprint.id,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900">Backlog</h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Manage and prioritize items for upcoming sprints
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Create Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ListTodo className="w-4 h-4 text-charcoal-400" />
              <span className="text-xs font-medium text-charcoal-500 uppercase">Total Items</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-charcoal-500 uppercase">Stories</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.stories}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-charcoal-500 uppercase">Bugs</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.bugs}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-charcoal-500 uppercase">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-600">{stats.tasks}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-charcoal-500 uppercase">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-gold-600">{stats.totalPoints}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search backlog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as SprintItemType | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="spike">Spikes</SelectItem>
              <SelectItem value="epic">Epics</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as SprintItemPriority | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedItems.size > 0 && activeSprint && (
          <Button onClick={handleAddToSprint} disabled={addToSprintMutation.isPending}>
            {addToSprintMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 mr-1" />
            )}
            Add {selectedItems.size} to Sprint
          </Button>
        )}
      </div>

      {/* Backlog List */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Backlog Items
              <Badge variant="secondary" className="ml-2">
                {filteredBacklog.length}
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-charcoal-500">
              <ArrowUpDown className="w-4 h-4 mr-1" />
              Sort
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredBacklog.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-600 mb-2">No Items in Backlog</h3>
              <p className="text-sm text-charcoal-400 mb-4">
                Create new items to start building your backlog.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Item
              </Button>
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

      {/* Drawers & Dialogs */}
      <SprintItemDrawer
        item={viewItem}
        open={isItemDrawerOpen}
        onOpenChange={setIsItemDrawerOpen}
        onClose={() => {
          setIsItemDrawerOpen(false)
          setViewItem(null)
          refetchBacklog()
        }}
      />

      <CreateItemDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
