'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface TemplateTask {
  id?: string
  taskName: string
  description: string
  category: 'paperwork' | 'it_setup' | 'training' | 'orientation' | 'other'
  dueOffsetDays: number
  isRequired: boolean
  sortOrder: number
  assigneeRole?: string
}

interface ExistingTask {
  id: string
  taskName: string
  description: string | null
  category: string
  dueOffsetDays: number | null
  isRequired: boolean
  sortOrder: number | null
  assigneeRole: string | null
}

interface OnboardingTemplateEditorProps {
  templateId: string | null
  onClose: () => void
  onSave: () => void
}

const CATEGORY_OPTIONS = [
  { value: 'paperwork', label: 'Paperwork' },
  { value: 'it_setup', label: 'IT Setup' },
  { value: 'training', label: 'Training' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'other', label: 'Other' },
]

const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
  { value: 'temp', label: 'Temporary' },
]

const ASSIGNEE_ROLE_OPTIONS = [
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'it_admin', label: 'IT Admin' },
  { value: 'employee', label: 'Employee (Self)' },
]

export function OnboardingTemplateEditor({
  templateId,
  onClose,
  onSave,
}: OnboardingTemplateEditorProps) {
  const isEditing = !!templateId

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [employeeType, setEmployeeType] = useState<string | undefined>(undefined)
  const [department, setDepartment] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [tasks, setTasks] = useState<TemplateTask[]>([])

  // Query existing template if editing
  const { data: existingTemplate, isLoading } = trpc.hr.onboarding.templates.getById.useQuery(
    { id: templateId! },
    { enabled: isEditing }
  )

  // Mutations
  const createMutation = trpc.hr.onboarding.templates.create.useMutation({
    onSuccess: () => {
      toast.success('Template created successfully')
      onSave()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = trpc.hr.onboarding.templates.update.useMutation({
    onSuccess: () => {
      toast.success('Template updated successfully')
      onSave()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Load existing template data
  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name)
      setDescription(existingTemplate.description ?? '')
      setEmployeeType(existingTemplate.employeeType ?? undefined)
      setDepartment(existingTemplate.department ?? '')
      setIsDefault(existingTemplate.isDefault)
      setTasks(
        (existingTemplate.tasks as ExistingTask[]).map((task: ExistingTask, index: number) => ({
          id: task.id,
          taskName: task.taskName,
          description: task.description ?? '',
          category: task.category as TemplateTask['category'],
          dueOffsetDays: task.dueOffsetDays ?? 0,
          isRequired: task.isRequired,
          sortOrder: task.sortOrder ?? index,
          assigneeRole: task.assigneeRole ?? undefined,
        }))
      )
    }
  }, [existingTemplate])

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        taskName: '',
        description: '',
        category: 'other',
        dueOffsetDays: 0,
        isRequired: true,
        sortOrder: tasks.length,
      },
    ])
  }

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const updateTask = (index: number, updates: Partial<TemplateTask>) => {
    setTasks(tasks.map((task, i) => (i === index ? { ...task, ...updates } : task)))
  }

  const moveTask = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= tasks.length) return

    const newTasks = [...tasks]
    const temp = newTasks[fromIndex]
    newTasks[fromIndex] = newTasks[toIndex]
    newTasks[toIndex] = temp

    // Update sort orders
    newTasks.forEach((task, i) => {
      task.sortOrder = i
    })

    setTasks(newTasks)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Template name is required')
      return
    }

    const validTasks = tasks.filter((t) => t.taskName.trim())
    if (validTasks.length === 0) {
      toast.error('At least one task is required')
      return
    }

    const templateData = {
      name: name.trim(),
      description: description.trim() || undefined,
      employeeType: employeeType as 'full_time' | 'contractor' | 'intern' | 'temp' | undefined,
      department: department.trim() || undefined,
      isDefault,
      tasks: validTasks.map((task, index) => ({
        taskName: task.taskName.trim(),
        description: task.description.trim() || undefined,
        category: task.category,
        dueOffsetDays: task.dueOffsetDays,
        isRequired: task.isRequired,
        sortOrder: index,
        assigneeRole: task.assigneeRole,
      })),
    }

    if (isEditing && templateId) {
      await updateMutation.mutateAsync({ id: templateId, ...templateData })
    } else {
      await createMutation.mutateAsync(templateData)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen bg-cream p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-body-sm text-charcoal-500 mt-1">
              {isEditing ? 'Update the onboarding checklist template' : 'Create a new onboarding checklist template'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Template Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Standard Employee Onboarding"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeType">Employee Type</Label>
              <Select value={employeeType ?? 'any'} onValueChange={(v) => setEmployeeType(v === 'any' ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any employee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any employee type</SelectItem>
                  {EMPLOYEE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Engineering (or leave empty for any)"
              />
            </div>
            <div className="space-y-2 flex items-center gap-4 pt-6">
              <Switch id="isDefault" checked={isDefault} onCheckedChange={setIsDefault} />
              <Label htmlFor="isDefault">Set as default template</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this onboarding template..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading font-semibold">
            Tasks ({tasks.length})
          </CardTitle>
          <Button onClick={addTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-charcoal-200 rounded-lg">
              <p className="text-body text-charcoal-500 mb-3">No tasks added yet</p>
              <Button variant="outline" onClick={addTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-charcoal-50 rounded-lg border border-charcoal-100"
                >
                  {/* Drag handle and order controls */}
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <GripVertical className="h-4 w-4 text-charcoal-400" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveTask(index, 'up')}
                      disabled={index === 0}
                    >
                      <span className="text-xs">↑</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveTask(index, 'down')}
                      disabled={index === tasks.length - 1}
                    >
                      <span className="text-xs">↓</span>
                    </Button>
                  </div>

                  {/* Task number badge */}
                  <Badge variant="outline" className="mt-2">
                    {index + 1}
                  </Badge>

                  {/* Task form */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Task Name *</Label>
                        <Input
                          value={task.taskName}
                          onChange={(e) => updateTask(index, { taskName: e.target.value })}
                          placeholder="Task name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Select
                          value={task.category}
                          onValueChange={(v) => updateTask(index, { category: v as TemplateTask['category'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={task.description}
                        onChange={(e) => updateTask(index, { description: e.target.value })}
                        placeholder="Task description (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Due (days from start)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={task.dueOffsetDays}
                          onChange={(e) =>
                            updateTask(index, { dueOffsetDays: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Assignee Role</Label>
                        <Select
                          value={task.assigneeRole ?? 'none'}
                          onValueChange={(v) => updateTask(index, { assigneeRole: v === 'none' ? undefined : v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Not specified" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not specified</SelectItem>
                            {ASSIGNEE_ROLE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <Switch
                          checked={task.isRequired}
                          onCheckedChange={(checked) => updateTask(index, { isRequired: checked })}
                        />
                        <Label className="text-xs">Required</Label>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeTask(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
