'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Star,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { OnboardingTemplateEditor } from '@/components/hr/onboarding/OnboardingTemplateEditor'

const EMPLOYEE_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-Time',
  contractor: 'Contractor',
  intern: 'Intern',
  temp: 'Temporary',
}

const CATEGORY_LABELS: Record<string, string> = {
  paperwork: 'Paperwork',
  it_setup: 'IT Setup',
  training: 'Training',
  orientation: 'Orientation',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  paperwork: 'bg-blue-100 text-blue-800',
  it_setup: 'bg-purple-100 text-purple-800',
  training: 'bg-green-100 text-green-800',
  orientation: 'bg-amber-100 text-amber-800',
  other: 'bg-gray-100 text-gray-800',
}

interface TemplateTask {
  id: string
  taskName: string
  description: string | null
  category: string
  isRequired: boolean
  dueOffsetDays: number | null
}

function OnboardingTemplatesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null)

  // Queries
  const { data: templates, isLoading, refetch } = trpc.hr.onboarding.templates.list.useQuery({
    includeInactive: true,
  })

  const { data: selectedTemplate } = trpc.hr.onboarding.templates.getById.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId }
  )

  // Mutations
  const deleteMutation = trpc.hr.onboarding.templates.delete.useMutation({
    onSuccess: () => {
      toast.success('Template deleted')
      refetch()
      setDeleteTemplateId(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = trpc.hr.onboarding.templates.update.useMutation({
    onSuccess: () => {
      toast.success('Template updated')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedTemplates(newExpanded)
  }

  const handleEdit = (id: string) => {
    setEditingTemplate(id)
    setShowEditor(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setEditingTemplate(null)
    refetch()
  }

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    await updateMutation.mutateAsync({ id, isActive: !currentlyActive })
  }

  const handleSetDefault = async (id: string) => {
    await updateMutation.mutateAsync({ id, isDefault: true })
  }

  if (showEditor) {
    return (
      <OnboardingTemplateEditor
        templateId={editingTemplate}
        onClose={handleEditorClose}
        onSave={() => {
          handleEditorClose()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-charcoal-500 mb-1">
            <span
              className="hover:text-charcoal-700 cursor-pointer"
              onClick={() => router.push('/employee/operations/onboarding')}
            >
              Onboarding
            </span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-charcoal-900">Templates</span>
          </div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Onboarding Templates
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Create and manage checklist templates for employee onboarding
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
              No templates yet
            </h3>
            <p className="text-body text-charcoal-500 mb-4">
              Create your first onboarding template to get started
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates?.map((template) => (
            <Card
              key={template.id}
              className={cn(
                'transition-all duration-200',
                !template.isActive && 'opacity-60'
              )}
            >
              <CardContent className="p-0">
                {/* Template Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-charcoal-50"
                  onClick={() => toggleExpand(template.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded flex items-center justify-center bg-charcoal-100">
                      {expandedTemplates.has(template.id) ? (
                        <ChevronDown className="h-4 w-4 text-charcoal-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-charcoal-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-body font-medium text-charcoal-900">{template.name}</h3>
                        {template.isDefault && (
                          <Badge className="bg-gold-100 text-gold-800">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {!template.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-body-sm text-charcoal-500">
                        {template.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-body-sm text-charcoal-900">
                        {template.taskCount} task{template.taskCount !== 1 ? 's' : ''}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {template.employeeType && (
                          <Badge variant="outline" className="text-xs">
                            {EMPLOYEE_TYPE_LABELS[template.employeeType] ?? template.employeeType}
                          </Badge>
                        )}
                        {template.department && (
                          <Badge variant="outline" className="text-xs">
                            {template.department}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(template.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!template.isDefault && (
                          <DropdownMenuItem onClick={() => handleSetDefault(template.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(template.id, template.isActive)}
                        >
                          {template.isActive ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteTemplateId(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Expanded Tasks */}
                {expandedTemplates.has(template.id) && selectedTemplate && selectedTemplate.id === template.id && (
                  <div className="border-t border-charcoal-100 p-4 bg-charcoal-50">
                    {(selectedTemplate.tasks as TemplateTask[]).length === 0 ? (
                      <p className="text-body-sm text-charcoal-500 text-center py-4">
                        No tasks defined. Edit the template to add tasks.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(selectedTemplate.tasks as TemplateTask[]).map((task: TemplateTask, index: number) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-charcoal-100"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-body-sm text-charcoal-400 w-6">
                                {index + 1}.
                              </span>
                              <div>
                                <p className="text-body-sm font-medium text-charcoal-900">
                                  {task.taskName}
                                </p>
                                {task.description && (
                                  <p className="text-caption text-charcoal-500">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.other}>
                                {CATEGORY_LABELS[task.category] ?? 'Other'}
                              </Badge>
                              {task.isRequired && (
                                <Badge variant="outline" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {task.dueOffsetDays != null && task.dueOffsetDays > 0 && (
                                <span className="text-caption text-charcoal-500">
                                  Due: Day {task.dueOffsetDays}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
              Existing onboarding checklists using this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTemplateId && deleteMutation.mutate({ id: deleteTemplateId })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Wrap in Suspense to prevent useSearchParams from blocking SSR
export default function OnboardingTemplatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream p-6 animate-pulse"><div className="h-8 w-48 bg-charcoal-200 rounded mb-4" /><div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-charcoal-100 rounded" />)}</div></div>}>
      <OnboardingTemplatesPageContent />
    </Suspense>
  )
}
