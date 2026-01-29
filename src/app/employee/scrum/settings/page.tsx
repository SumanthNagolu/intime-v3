'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTeamSpace } from '@/components/team-space'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc/client'
import {
  Settings,
  Users,
  Columns,
  Clock,
  Zap,
  GripVertical,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BoardColumn } from '@/types/scrum'

export default function TeamSettingsPage() {
  const { boardColumns, refetchBoard } = useTeamSpace()
  const [isEditingColumns, setIsEditingColumns] = useState(false)
  const [editedColumns, setEditedColumns] = useState<BoardColumn[]>([])

  const updateColumnMutation = trpc.board.updateColumn.useMutation({
    onSuccess: () => refetchBoard(),
  })

  const createColumnMutation = trpc.board.createColumn.useMutation({
    onSuccess: () => refetchBoard(),
  })

  const deleteColumnMutation = trpc.board.deleteColumn.useMutation({
    onSuccess: () => refetchBoard(),
  })

  const handleStartEditColumns = () => {
    setEditedColumns([...boardColumns])
    setIsEditingColumns(true)
  }

  const handleCancelEditColumns = () => {
    setIsEditingColumns(false)
    setEditedColumns([])
  }

  const handleSaveColumns = async () => {
    // Update each modified column
    for (const column of editedColumns) {
      const original = boardColumns.find((c) => c.id === column.id)
      if (original && (
        original.name !== column.name ||
        original.wipLimit !== column.wipLimit ||
        original.color !== column.color
      )) {
        await updateColumnMutation.mutateAsync({
          id: column.id,
          name: column.name,
          wipLimit: column.wipLimit,
          color: column.color,
        })
      }
    }
    setIsEditingColumns(false)
    setEditedColumns([])
  }

  const handleColumnChange = (id: string, field: keyof BoardColumn, value: string | number | null) => {
    setEditedColumns((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, [field]: value } : col
      )
    )
  }

  const columnsToDisplay = isEditingColumns ? editedColumns : boardColumns

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-charcoal-900">Team Settings</h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Configure your team's workspace and sprint board
        </p>
      </div>

      {/* Sprint Settings */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-charcoal-600" />
            Sprint Settings
          </CardTitle>
          <CardDescription>
            Configure default sprint duration and planning settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sprintDuration">Default Sprint Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sprintDuration"
                  type="number"
                  defaultValue={14}
                  min={1}
                  max={30}
                  className="w-20"
                />
                <span className="text-sm text-charcoal-500">days</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="velocity">Target Velocity</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="velocity"
                  type="number"
                  defaultValue={40}
                  min={1}
                  className="w-20"
                />
                <span className="text-sm text-charcoal-500">points per sprint</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-start Sprints</Label>
                <p className="text-sm text-charcoal-500">
                  Automatically start the next sprint when one completes
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Sprint Goal</Label>
                <p className="text-sm text-charcoal-500">
                  Sprint goal must be defined before starting
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Mid-Sprint Changes</Label>
                <p className="text-sm text-charcoal-500">
                  Allow adding/removing items during active sprint
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board Columns */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Columns className="w-5 h-5 text-charcoal-600" />
                Board Columns
              </CardTitle>
              <CardDescription>
                Configure columns and WIP limits for your sprint board
              </CardDescription>
            </div>
            {!isEditingColumns ? (
              <Button variant="outline" size="sm" onClick={handleStartEditColumns}>
                Edit Columns
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEditColumns}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveColumns}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {columnsToDisplay.map((column, index) => (
              <div
                key={column.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                  isEditingColumns ? 'border-gold-300 bg-gold-50/30' : 'border-charcoal-200/60 bg-charcoal-50'
                )}
              >
                {isEditingColumns && (
                  <GripVertical className="w-4 h-4 text-charcoal-400 cursor-grab" />
                )}

                {/* Color indicator */}
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    column.color === 'gray' && 'bg-charcoal-400',
                    column.color === 'blue' && 'bg-blue-500',
                    column.color === 'amber' && 'bg-amber-500',
                    column.color === 'green' && 'bg-green-500',
                    column.color === 'red' && 'bg-red-500'
                  )}
                />

                {/* Column Name */}
                {isEditingColumns ? (
                  <Input
                    value={column.name}
                    onChange={(e) => handleColumnChange(column.id, 'name', e.target.value)}
                    className="flex-1 max-w-[200px]"
                  />
                ) : (
                  <span className="flex-1 font-medium text-charcoal-800">{column.name}</span>
                )}

                {/* Status mapping */}
                <Badge variant="secondary" className="text-xs">
                  {column.columnKey}
                </Badge>

                {/* WIP Limit */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-charcoal-500">WIP:</span>
                  {isEditingColumns ? (
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={column.wipLimit || ''}
                      onChange={(e) =>
                        handleColumnChange(
                          column.id,
                          'wipLimit',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-16"
                      placeholder="∞"
                    />
                  ) : (
                    <span className="text-sm font-medium text-charcoal-700">
                      {column.wipLimit || '∞'}
                    </span>
                  )}
                </div>

                {/* Color Selector (when editing) */}
                {isEditingColumns && (
                  <select
                    value={column.color || 'gray'}
                    onChange={(e) => handleColumnChange(column.id, 'color', e.target.value)}
                    className="text-sm border border-charcoal-200 rounded px-2 py-1"
                  >
                    <option value="gray">Gray</option>
                    <option value="blue">Blue</option>
                    <option value="amber">Amber</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                  </select>
                )}

                {/* Delete (when editing, only custom columns) */}
                {isEditingColumns && !['todo', 'in_progress', 'review', 'done'].includes(column.columnKey) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error-600 hover:text-error-700 hover:bg-error-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {isEditingColumns && (
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Column
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estimation Settings */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-charcoal-600" />
            Estimation
          </CardTitle>
          <CardDescription>
            Configure story point estimation scale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Point Scale</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 5, 8, 13, 21].map((point) => (
                <Badge
                  key={point}
                  variant="outline"
                  className="px-3 py-1 text-sm cursor-pointer hover:bg-charcoal-100"
                >
                  {point}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-charcoal-500">
              Using Fibonacci sequence for estimation
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require Estimation</Label>
              <p className="text-sm text-charcoal-500">
                Items must be estimated before adding to sprint
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white shadow-elevation-sm border-error-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-error-700">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-error-50 rounded-lg border border-error-200">
            <div>
              <p className="font-medium text-charcoal-800">Delete All Sprints</p>
              <p className="text-sm text-charcoal-500">
                Permanently delete all sprints and their items
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete All
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-error-50 rounded-lg border border-error-200">
            <div>
              <p className="font-medium text-charcoal-800">Reset Board</p>
              <p className="text-sm text-charcoal-500">
                Reset all columns to default configuration
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
