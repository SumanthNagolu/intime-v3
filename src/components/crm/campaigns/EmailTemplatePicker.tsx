'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Mail,
  Search,
  FileText,
  Check,
  Eye,
  Loader2,
  LayoutTemplate,
  Sparkles,
  Clock,
  Star,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface EmailTemplate {
  id: string
  name: string
  slug: string
  subject: string
  preview_text?: string
  body_html: string
  body_text?: string
  category: string
  status: string
  variables_used?: string[]
  usage_count?: number
  created_at?: string
  updated_at?: string
}

interface EmailTemplatePickerProps {
  value?: string
  onSelect: (template: EmailTemplate | null) => void
  stepNumber?: number
  channelType?: 'email' | 'linkedin'
  className?: string
}

// Dynamic variables that can be inserted
const CAMPAIGN_VARIABLES = [
  { key: 'first_name', label: 'First Name', example: 'John' },
  { key: 'last_name', label: 'Last Name', example: 'Smith' },
  { key: 'full_name', label: 'Full Name', example: 'John Smith' },
  { key: 'company', label: 'Company Name', example: 'Acme Corp' },
  { key: 'title', label: 'Job Title', example: 'VP of Engineering' },
  { key: 'email', label: 'Email', example: 'john@acme.com' },
  { key: 'sender_name', label: 'Sender Name', example: 'Sarah Johnson' },
  { key: 'sender_company', label: 'Your Company', example: 'InTime Staffing' },
]

export function EmailTemplatePicker({
  value,
  onSelect,
  stepNumber,
  channelType = 'email',
  className,
}: EmailTemplatePickerProps) {
  const [open, setOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedForPreview, setSelectedForPreview] = useState<EmailTemplate | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: templatesData, isLoading } = trpc.emailTemplates.list.useQuery({
    search: search || undefined,
    category: categoryFilter === 'all' ? undefined : categoryFilter as 'marketing' | 'candidate' | 'client',
    status: 'active',
    pageSize: 50,
  })

  const templates = templatesData?.items || []
  
  // Find currently selected template
  const selectedTemplate = templates.find(t => t.id === value)

  const handleSelect = (template: EmailTemplate) => {
    onSelect(template)
    setOpen(false)
  }

  const handlePreview = (template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedForPreview(template)
    setPreviewOpen(true)
  }

  // Replace variables with example values for preview
  const replaceVariablesForPreview = (text: string): string => {
    let result = text
    CAMPAIGN_VARIABLES.forEach(v => {
      const regex = new RegExp(`\\{\\{${v.key}\\}\\}|\\{${v.key}\\}`, 'gi')
      result = result.replace(regex, `<span class="bg-violet-100 text-violet-700 px-1 rounded">${v.example}</span>`)
    })
    return result
  }

  return (
    <TooltipProvider>
      <div className={cn('space-y-2', className)}>
        {/* Selected Template Display */}
        {selectedTemplate ? (
          <div className="p-3 border rounded-lg bg-charcoal-50/50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LayoutTemplate className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-charcoal-900 truncate">
                    {selectedTemplate.name}
                  </p>
                  <p className="text-sm text-charcoal-500 truncate mt-0.5">
                    Subject: {selectedTemplate.subject}
                  </p>
                  {selectedTemplate.variables_used && selectedTemplate.variables_used.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      <span className="text-xs text-charcoal-400">
                        Uses {selectedTemplate.variables_used.length} dynamic fields
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedForPreview(selectedTemplate)
                        setPreviewOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview template</TooltipContent>
                </Tooltip>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-3"
            onClick={() => setOpen(true)}
          >
            <LayoutTemplate className="w-4 h-4 text-charcoal-400" />
            <span className="text-charcoal-500">
              Select email template
              {stepNumber && <span className="text-charcoal-400 ml-1">for Step {stepNumber}</span>}
            </span>
            <ChevronRight className="w-4 h-4 ml-auto text-charcoal-300" />
          </Button>
        )}

        {/* Template Picker Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-hublot-600" />
                Select Email Template
              </DialogTitle>
              <DialogDescription>
                Choose a template for {stepNumber ? `Step ${stepNumber}` : 'this sequence step'}
              </DialogDescription>
            </DialogHeader>

            {/* Filters */}
            <div className="flex gap-3 py-3 border-b">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template List */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
                </div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-10 h-10 text-charcoal-300 mb-3" />
                  <p className="text-charcoal-500">No templates found</p>
                  <p className="text-sm text-charcoal-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className={cn(
                        'p-4 border rounded-lg cursor-pointer transition-all hover:border-hublot-300 hover:bg-hublot-50/30',
                        value === template.id && 'border-hublot-500 bg-hublot-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            'p-2 rounded-lg',
                            value === template.id ? 'bg-hublot-100' : 'bg-charcoal-100'
                          )}>
                            <LayoutTemplate className={cn(
                              'w-4 h-4',
                              value === template.id ? 'text-hublot-600' : 'text-charcoal-500'
                            )} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-charcoal-900">
                                {template.name}
                              </p>
                              {value === template.id && (
                                <Badge className="bg-hublot-100 text-hublot-700">
                                  <Check className="w-3 h-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-charcoal-500 mt-0.5 truncate">
                              Subject: {template.subject}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.category}
                              </Badge>
                              {template.usage_count !== undefined && (
                                <span className="text-xs text-charcoal-400 flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Used {template.usage_count} times
                                </span>
                              )}
                              {template.variables_used && template.variables_used.length > 0 && (
                                <span className="text-xs text-violet-600 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {template.variables_used.length} variables
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => handlePreview(template, e)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Preview</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Dynamic Variables Reference */}
            <div className="p-3 bg-charcoal-50 rounded-lg mt-4">
              <p className="text-xs font-medium text-charcoal-600 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-500" />
                Available Dynamic Fields
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CAMPAIGN_VARIABLES.map((v) => (
                  <Badge key={v.key} variant="secondary" className="text-xs font-mono">
                    {`{{${v.key}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-hublot-600" />
                Template Preview
              </DialogTitle>
              {selectedForPreview && (
                <DialogDescription>
                  {selectedForPreview.name}
                </DialogDescription>
              )}
            </DialogHeader>

            {selectedForPreview && (
              <div className="flex-1 overflow-auto">
                {/* Subject Line */}
                <div className="p-4 border-b bg-charcoal-50">
                  <p className="text-xs text-charcoal-500 mb-1">Subject</p>
                  <p 
                    className="font-medium text-charcoal-900"
                    dangerouslySetInnerHTML={{ 
                      __html: replaceVariablesForPreview(selectedForPreview.subject) 
                    }}
                  />
                </div>

                {/* Preview Text */}
                {selectedForPreview.preview_text && (
                  <div className="px-4 py-2 border-b bg-charcoal-50/50">
                    <p className="text-xs text-charcoal-500 mb-1">Preview Text</p>
                    <p 
                      className="text-sm text-charcoal-600"
                      dangerouslySetInnerHTML={{ 
                        __html: replaceVariablesForPreview(selectedForPreview.preview_text) 
                      }}
                    />
                  </div>
                )}

                {/* Email Body */}
                <div className="p-6 bg-white">
                  <div className="border rounded-lg p-6 bg-white shadow-sm max-w-lg mx-auto">
                    <div 
                      className="prose prose-sm max-w-none [&_span]:inline"
                      dangerouslySetInnerHTML={{ 
                        __html: replaceVariablesForPreview(selectedForPreview.body_html) 
                      }}
                    />
                  </div>
                </div>

                {/* Variable Legend */}
                <div className="p-4 bg-violet-50 border-t">
                  <p className="text-xs font-medium text-violet-700 mb-2">
                    Dynamic fields in this template will be replaced with actual prospect data
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedForPreview.variables_used?.map((v) => (
                      <Badge key={v} className="bg-violet-100 text-violet-700 text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              {selectedForPreview && (
                <Button onClick={() => {
                  handleSelect(selectedForPreview)
                  setPreviewOpen(false)
                }}>
                  <Check className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}






