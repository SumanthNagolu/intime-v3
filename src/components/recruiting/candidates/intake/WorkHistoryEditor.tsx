'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  Wifi,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GripVertical,
  Edit3,
  Check,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WorkHistoryEntry } from '@/stores/create-candidate-store'
import { WORK_HISTORY_EMPLOYMENT_TYPES } from '@/stores/create-candidate-store'

interface WorkHistoryEditorProps {
  entries: WorkHistoryEntry[]
  onAdd: (entry: Omit<WorkHistoryEntry, 'id'>) => void
  onUpdate: (id: string, entry: Partial<WorkHistoryEntry>) => void
  onRemove: (id: string) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

// Empty form state
const emptyEntry: Omit<WorkHistoryEntry, 'id'> = {
  companyName: '',
  jobTitle: '',
  startDate: '',
  endDate: undefined,
  isCurrent: false,
  locationCity: '',
  locationState: '',
  isRemote: false,
  description: '',
  achievements: [],
}

export function WorkHistoryEditor({
  entries,
  onAdd,
  onUpdate,
  onRemove,
}: WorkHistoryEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newEntry, setNewEntry] = useState<Omit<WorkHistoryEntry, 'id'>>(emptyEntry)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [achievementInput, setAchievementInput] = useState('')

  const handleAddEntry = () => {
    if (!newEntry.companyName.trim() || !newEntry.jobTitle.trim() || !newEntry.startDate) {
      return
    }
    onAdd(newEntry)
    setNewEntry(emptyEntry)
    setIsAdding(false)
  }

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleAddAchievement = (id: string, achievement: string) => {
    const entry = entries.find(e => e.id === id)
    if (entry && achievement.trim()) {
      onUpdate(id, { achievements: [...(entry.achievements || []), achievement.trim()] })
    }
  }

  const handleRemoveAchievement = (id: string, index: number) => {
    const entry = entries.find(e => e.id === id)
    if (entry) {
      const newAchievements = [...(entry.achievements || [])]
      newAchievements.splice(index, 1)
      onUpdate(id, { achievements: newAchievements })
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`
  }

  return (
    <div className="space-y-4">
      {/* Existing Entries */}
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            'border rounded-xl overflow-hidden transition-all duration-300',
            entry.isFromResume
              ? 'border-gold-200 bg-gradient-to-r from-gold-50/50 to-white'
              : 'border-charcoal-200 bg-white',
            expandedId === entry.id && 'shadow-elevation-sm'
          )}
        >
          {/* Header - Always Visible */}
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-charcoal-50/50 transition-colors"
            onClick={() => handleToggleExpand(entry.id)}
          >
            <div className="text-charcoal-400 cursor-grab">
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-charcoal-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-charcoal-800 truncate">{entry.jobTitle}</h4>
                {entry.isCurrent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    Current
                  </span>
                )}
                {entry.isFromResume && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </span>
                )}
              </div>
              <p className="text-sm text-charcoal-500 truncate">
                {entry.companyName}
                {(entry.locationCity || entry.locationState) && (
                  <span className="text-charcoal-400">
                    {' '}&middot; {[entry.locationCity, entry.locationState].filter(Boolean).join(', ')}
                  </span>
                )}
              </p>
              <p className="text-xs text-charcoal-400 mt-0.5">
                {formatDate(entry.startDate)} - {entry.isCurrent ? 'Present' : formatDate(entry.endDate)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(entry.id)
                }}
                className="text-charcoal-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {expandedId === entry.id ? (
                <ChevronUp className="w-5 h-5 text-charcoal-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-charcoal-400" />
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {expandedId === entry.id && (
            <div className="border-t border-charcoal-100 p-4 space-y-4 bg-charcoal-50/30">
              {/* Row 1: Company & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Company Name</Label>
                  <Input
                    value={entry.companyName}
                    onChange={(e) => onUpdate(entry.id, { companyName: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Job Title</Label>
                  <Input
                    value={entry.jobTitle}
                    onChange={(e) => onUpdate(entry.id, { jobTitle: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Row 2: Employment Type & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Employment Type</Label>
                  <Select
                    value={entry.employmentType || ''}
                    onValueChange={(value) => onUpdate(entry.id, { employmentType: value as WorkHistoryEntry['employmentType'] })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_HISTORY_EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Start Date</Label>
                  <Input
                    type="month"
                    value={entry.startDate}
                    onChange={(e) => onUpdate(entry.id, { startDate: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">End Date</Label>
                  <Input
                    type="month"
                    value={entry.endDate || ''}
                    onChange={(e) => onUpdate(entry.id, { endDate: e.target.value || undefined })}
                    disabled={entry.isCurrent}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Row 3: Current & Remote */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={entry.isCurrent}
                    onCheckedChange={(checked) => onUpdate(entry.id, {
                      isCurrent: !!checked,
                      endDate: checked ? undefined : entry.endDate
                    })}
                  />
                  <span className="text-sm text-charcoal-700">I currently work here</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={entry.isRemote}
                    onCheckedChange={(checked) => onUpdate(entry.id, { isRemote: !!checked })}
                  />
                  <span className="text-sm text-charcoal-700">Remote position</span>
                </label>
              </div>

              {/* Row 4: Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">City</Label>
                  <Input
                    value={entry.locationCity || ''}
                    onChange={(e) => onUpdate(entry.id, { locationCity: e.target.value })}
                    placeholder="San Francisco"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">State</Label>
                  <Input
                    value={entry.locationState || ''}
                    onChange={(e) => onUpdate(entry.id, { locationState: e.target.value })}
                    placeholder="CA"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Row 5: Description */}
              <div className="space-y-2">
                <Label className="text-xs text-charcoal-600">Description (Optional)</Label>
                <Textarea
                  value={entry.description || ''}
                  onChange={(e) => onUpdate(entry.id, { description: e.target.value })}
                  placeholder="Brief description of responsibilities..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Row 6: Achievements */}
              <div className="space-y-2">
                <Label className="text-xs text-charcoal-600">Key Achievements (Optional)</Label>
                <div className="space-y-2">
                  {(entry.achievements || []).map((achievement, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-charcoal-100">
                      <span className="text-sm text-charcoal-700 flex-1">{achievement}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(entry.id, i)}
                        className="text-charcoal-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={editingId === entry.id ? achievementInput : ''}
                      onChange={(e) => {
                        setEditingId(entry.id)
                        setAchievementInput(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && achievementInput.trim()) {
                          handleAddAchievement(entry.id, achievementInput)
                          setAchievementInput('')
                        }
                      }}
                      placeholder="Add an achievement..."
                      className="h-10 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (achievementInput.trim()) {
                          handleAddAchievement(entry.id, achievementInput)
                          setAchievementInput('')
                        }
                      }}
                      className="h-10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add New Entry Form */}
      {isAdding ? (
        <div className="border-2 border-dashed border-gold-300 rounded-xl p-5 space-y-4 bg-gold-50/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-charcoal-800 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Work Experience
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false)
                setNewEntry(emptyEntry)
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newEntry.companyName}
                onChange={(e) => setNewEntry({ ...newEntry, companyName: e.target.value })}
                placeholder="Acme Corporation"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newEntry.jobTitle}
                onChange={(e) => setNewEntry({ ...newEntry, jobTitle: e.target.value })}
                placeholder="Software Engineer"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">Employment Type</Label>
              <Select
                value={newEntry.employmentType || ''}
                onValueChange={(value) => setNewEntry({ ...newEntry, employmentType: value as WorkHistoryEntry['employmentType'] })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_HISTORY_EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="month"
                value={newEntry.startDate}
                onChange={(e) => setNewEntry({ ...newEntry, startDate: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">End Date</Label>
              <Input
                type="month"
                value={newEntry.endDate || ''}
                onChange={(e) => setNewEntry({ ...newEntry, endDate: e.target.value || undefined })}
                disabled={newEntry.isCurrent}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={newEntry.isCurrent}
                onCheckedChange={(checked) => setNewEntry({
                  ...newEntry,
                  isCurrent: !!checked,
                  endDate: checked ? undefined : newEntry.endDate
                })}
              />
              <span className="text-sm text-charcoal-700">I currently work here</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={newEntry.isRemote}
                onCheckedChange={(checked) => setNewEntry({ ...newEntry, isRemote: !!checked })}
              />
              <span className="text-sm text-charcoal-700">Remote position</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">City</Label>
              <Input
                value={newEntry.locationCity || ''}
                onChange={(e) => setNewEntry({ ...newEntry, locationCity: e.target.value })}
                placeholder="San Francisco"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">State</Label>
              <Input
                value={newEntry.locationState || ''}
                onChange={(e) => setNewEntry({ ...newEntry, locationState: e.target.value })}
                placeholder="CA"
                className="h-10"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddEntry}
            disabled={!newEntry.companyName.trim() || !newEntry.jobTitle.trim() || !newEntry.startDate}
            className="w-full md:w-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={cn(
            'w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300',
            'border-charcoal-200 hover:border-gold-300 hover:bg-gold-50/30',
            'flex items-center justify-center gap-2 text-charcoal-500 hover:text-gold-600'
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Work Experience</span>
        </button>
      )}
    </div>
  )
}
