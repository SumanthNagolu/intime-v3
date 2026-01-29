'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useTeamSpace } from '@/components/team-space'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/client'
import {
  Plus,
  History,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  CheckSquare,
  MessageSquare,
  Loader2,
  Heart,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type RetroCategory = 'went_well' | 'to_improve'

const CATEGORY_CONFIG: Record<RetroCategory, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  went_well: {
    label: 'What Went Well',
    icon: ThumbsUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  to_improve: {
    label: 'What To Improve',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
  },
}

export default function RetroPage() {
  const { activeSprint, sprints } = useTeamSpace()
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(
    activeSprint?.id || sprints[0]?.id || null
  )
  const [newItems, setNewItems] = useState<Record<RetroCategory, string>>({
    went_well: '',
    to_improve: '',
  })
  const [newActionItem, setNewActionItem] = useState('')

  // Fetch retro for selected sprint
  const { data: retro, isLoading, refetch: refetchRetro } = trpc.retrospectives.get.useQuery(
    { sprintId: selectedSprintId! },
    { enabled: !!selectedSprintId }
  )

  const createRetro = trpc.retrospectives.create.useMutation({
    onSuccess: () => refetchRetro(),
  })

  const addItem = trpc.retrospectives.addItem.useMutation({
    onSuccess: () => refetchRetro(),
  })

  const addActionItem = trpc.retrospectives.addActionItem.useMutation({
    onSuccess: () => refetchRetro(),
  })

  const voteItem = trpc.retrospectives.voteItem.useMutation({
    onSuccess: () => refetchRetro(),
  })

  const handleCreateRetro = () => {
    if (!selectedSprintId) return
    createRetro.mutate({ sprintId: selectedSprintId })
  }

  const handleAddItem = (category: RetroCategory) => {
    const text = newItems[category].trim()
    if (!text || !selectedSprintId) return

    addItem.mutate({
      sprintId: selectedSprintId,
      category,
      text,
    })
    setNewItems((prev) => ({ ...prev, [category]: '' }))
  }

  const handleAddActionItem = () => {
    const text = newActionItem.trim()
    if (!text || !selectedSprintId) return

    addActionItem.mutate({
      sprintId: selectedSprintId,
      text,
    })
    setNewActionItem('')
  }

  const handleVote = (itemId: string, category: RetroCategory) => {
    if (!selectedSprintId) return
    voteItem.mutate({ sprintId: selectedSprintId, itemId, category })
  }

  // Get the selected sprint
  const selectedSprint = sprints.find((s) => s.id === selectedSprintId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900">Retrospectives</h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Reflect on what worked and what can be improved
          </p>
        </div>

        {/* Sprint Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSprintId || ''}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="px-3 py-2 border border-charcoal-200 rounded-lg text-sm bg-white"
          >
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No Sprint Selected */}
      {!selectedSprintId && (
        <Card className="bg-white shadow-elevation-md">
          <CardContent className="p-12 text-center">
            <History className="w-16 h-16 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-xl font-heading font-semibold text-charcoal-900 mb-2">
              No Sprints Available
            </h3>
            <p className="text-charcoal-600">
              Create a sprint first to start running retrospectives.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Retro Yet */}
      {selectedSprintId && !retro && (
        <Card className="bg-white shadow-elevation-md">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto text-gold-400 mb-4" />
            <h3 className="text-xl font-heading font-semibold text-charcoal-900 mb-2">
              Start Retrospective
            </h3>
            <p className="text-charcoal-600 mb-6">
              Begin a retrospective session for <strong>{selectedSprint?.name}</strong>
            </p>
            <Button onClick={handleCreateRetro} disabled={createRetro.isPending}>
              {createRetro.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Plus className="w-4 h-4 mr-1" />
              Start Retro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Retro Board */}
      {retro && (
        <div className="grid grid-cols-3 gap-6">
          {(['went_well', 'to_improve'] as RetroCategory[]).map((category) => {
            const config = CATEGORY_CONFIG[category]
            const CategoryIcon = config.icon
            const items = category === 'went_well' ? retro.wentWell : retro.toImprove

            return (
              <Card key={category} className={cn('shadow-elevation-sm', config.bgColor)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CategoryIcon className={cn('w-5 h-5', config.color)} />
                    <span className={config.color}>{config.label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Add New Item */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an item..."
                      value={newItems[category]}
                      onChange={(e) =>
                        setNewItems((prev) => ({ ...prev, [category]: e.target.value }))
                      }
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem(category)}
                      className="flex-1 bg-white"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddItem(category)}
                      disabled={!newItems[category].trim() || addItem.isPending}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded-lg border border-charcoal-200/60 shadow-sm"
                      >
                        <p className="text-sm text-charcoal-700">{item.text}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-100">
                          <div className="flex items-center gap-2 text-xs text-charcoal-500">
                            <span>{item.authorName || 'Anonymous'}</span>
                          </div>
                          <button
                            onClick={() => handleVote(item.id, category)}
                            className="flex items-center gap-1 text-xs text-charcoal-500 hover:text-gold-600 transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>{item.votes || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <p className="text-center text-sm text-charcoal-400 py-8">
                        No items yet. Add the first one!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Action Items Column */}
          <Card className="shadow-elevation-sm bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600">Action Items</span>
                <Badge variant="secondary" className="ml-auto">
                  {retro.actionItems.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add New Action Item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add an action item..."
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActionItem()}
                  className="flex-1 bg-white"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddActionItem}
                  disabled={!newActionItem.trim() || addActionItem.isPending}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Items List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {retro.actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-lg border border-charcoal-200/60 shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        className="w-4 h-4 rounded border-charcoal-300 mt-0.5"
                        readOnly
                      />
                      <p className={cn(
                        'text-sm text-charcoal-700 flex-1',
                        item.completed && 'line-through text-charcoal-400'
                      )}>
                        {item.text}
                      </p>
                    </div>
                    {item.assigneeName && (
                      <div className="mt-2 pt-2 border-t border-charcoal-100">
                        <Badge variant="secondary" className="text-xs">
                          {item.assigneeName}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}

                {retro.actionItems.length === 0 && (
                  <p className="text-center text-sm text-charcoal-400 py-8">
                    No action items yet. Add the first one!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Items Summary - only show if retro is completed and has action items */}
      {retro && retro.status === 'completed' && retro.actionItems.length > 0 && (
        <Card className="bg-white shadow-elevation-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              Action Items from This Retro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {retro.actionItems.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={action.completed}
                    className="w-4 h-4 rounded border-charcoal-300"
                    readOnly
                  />
                  <span className={cn(
                    'flex-1 text-sm',
                    action.completed && 'text-charcoal-400 line-through'
                  )}>
                    {action.text}
                  </span>
                  {action.assigneeName && (
                    <Badge variant="secondary" className="text-xs">
                      {action.assigneeName}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
