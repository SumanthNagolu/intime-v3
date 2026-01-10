'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  Calendar,
  Award,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EducationEntry } from '@/stores/create-candidate-store'
import { DEGREE_TYPES } from '@/stores/create-candidate-store'

interface EducationEditorProps {
  entries: EducationEntry[]
  onAdd: (entry: Omit<EducationEntry, 'id'>) => void
  onUpdate: (id: string, entry: Partial<EducationEntry>) => void
  onRemove: (id: string) => void
}

// Empty form state
const emptyEntry: Omit<EducationEntry, 'id'> = {
  institutionName: '',
  degreeType: undefined,
  degreeName: '',
  fieldOfStudy: '',
  startDate: undefined,
  endDate: undefined,
  isCurrent: false,
  gpa: undefined,
  honors: '',
}

export function EducationEditor({
  entries,
  onAdd,
  onUpdate,
  onRemove,
}: EducationEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newEntry, setNewEntry] = useState<Omit<EducationEntry, 'id'>>(emptyEntry)

  const handleAddEntry = () => {
    if (!newEntry.institutionName.trim()) {
      return
    }
    onAdd(newEntry)
    setNewEntry(emptyEntry)
    setIsAdding(false)
  }

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`
  }

  const getDegreeLabel = (type: EducationEntry['degreeType']) => {
    if (!type) return ''
    const degree = DEGREE_TYPES.find(d => d.value === type)
    return degree?.label || ''
  }

  return (
    <div className="space-y-4">
      {/* Existing Entries */}
      {entries.map((entry) => (
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
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-charcoal-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-charcoal-800 truncate">
                  {entry.degreeName || getDegreeLabel(entry.degreeType) || 'Degree'}
                  {entry.fieldOfStudy && (
                    <span className="font-normal text-charcoal-500"> in {entry.fieldOfStudy}</span>
                  )}
                </h4>
                {entry.isCurrent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                    In Progress
                  </span>
                )}
                {entry.isFromResume && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </span>
                )}
              </div>
              <p className="text-sm text-charcoal-500 truncate">{entry.institutionName}</p>
              <p className="text-xs text-charcoal-400 mt-0.5">
                {entry.startDate && formatDate(entry.startDate)}
                {entry.startDate && (entry.endDate || entry.isCurrent) && ' - '}
                {entry.isCurrent ? 'Present' : entry.endDate && formatDate(entry.endDate)}
                {entry.gpa && <span className="ml-2">&middot; GPA: {entry.gpa.toFixed(2)}</span>}
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
              {/* Row 1: Institution */}
              <div className="space-y-2">
                <Label className="text-xs text-charcoal-600">Institution Name</Label>
                <Input
                  value={entry.institutionName}
                  onChange={(e) => onUpdate(entry.id, { institutionName: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* Row 2: Degree Type & Degree Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Degree Type</Label>
                  <Select
                    value={entry.degreeType || ''}
                    onValueChange={(value) => onUpdate(entry.id, { degreeType: value as EducationEntry['degreeType'] })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select degree type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Degree Name</Label>
                  <Input
                    value={entry.degreeName || ''}
                    onChange={(e) => onUpdate(entry.id, { degreeName: e.target.value })}
                    placeholder="e.g., Bachelor of Science"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Row 3: Field of Study */}
              <div className="space-y-2">
                <Label className="text-xs text-charcoal-600">Field of Study / Major</Label>
                <Input
                  value={entry.fieldOfStudy || ''}
                  onChange={(e) => onUpdate(entry.id, { fieldOfStudy: e.target.value })}
                  placeholder="e.g., Computer Science"
                  className="h-10"
                />
              </div>

              {/* Row 4: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Start Date</Label>
                  <Input
                    type="month"
                    value={entry.startDate || ''}
                    onChange={(e) => onUpdate(entry.id, { startDate: e.target.value || undefined })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">End Date / Expected</Label>
                  <Input
                    type="month"
                    value={entry.endDate || ''}
                    onChange={(e) => onUpdate(entry.id, { endDate: e.target.value || undefined })}
                    disabled={entry.isCurrent}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Row 5: Currently Enrolled */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={entry.isCurrent}
                  onCheckedChange={(checked) => onUpdate(entry.id, {
                    isCurrent: !!checked,
                    endDate: checked ? undefined : entry.endDate
                  })}
                />
                <span className="text-sm text-charcoal-700">Currently enrolled</span>
              </label>

              {/* Row 6: GPA & Honors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">GPA (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={entry.gpa || ''}
                    onChange={(e) => onUpdate(entry.id, { gpa: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="e.g., 3.75"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-charcoal-600">Honors / Awards (Optional)</Label>
                  <Input
                    value={entry.honors || ''}
                    onChange={(e) => onUpdate(entry.id, { honors: e.target.value })}
                    placeholder="e.g., Magna Cum Laude, Dean's List"
                    className="h-10"
                  />
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
              Add Education
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

          <div className="space-y-2">
            <Label className="text-xs text-charcoal-600">
              Institution Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={newEntry.institutionName}
              onChange={(e) => setNewEntry({ ...newEntry, institutionName: e.target.value })}
              placeholder="University of California, Berkeley"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">Degree Type</Label>
              <Select
                value={newEntry.degreeType || ''}
                onValueChange={(value) => setNewEntry({ ...newEntry, degreeType: value as EducationEntry['degreeType'] })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select degree type" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">Field of Study</Label>
              <Input
                value={newEntry.fieldOfStudy || ''}
                onChange={(e) => setNewEntry({ ...newEntry, fieldOfStudy: e.target.value })}
                placeholder="e.g., Computer Science"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-charcoal-600">Start Date</Label>
              <Input
                type="month"
                value={newEntry.startDate || ''}
                onChange={(e) => setNewEntry({ ...newEntry, startDate: e.target.value || undefined })}
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

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={newEntry.isCurrent}
              onCheckedChange={(checked) => setNewEntry({
                ...newEntry,
                isCurrent: !!checked,
                endDate: checked ? undefined : newEntry.endDate
              })}
            />
            <span className="text-sm text-charcoal-700">Currently enrolled</span>
          </label>

          <Button
            type="button"
            onClick={handleAddEntry}
            disabled={!newEntry.institutionName.trim()}
            className="w-full md:w-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            Add Education
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
          <span className="font-medium">Add Education</span>
        </button>
      )}
    </div>
  )
}
