# CAMPAIGNS-01: Guidewire-Inspired Campaign Workspace Implementation Plan

## Overview

Transform the Campaign Workspace into a complete Guidewire-inspired system with fully functional CRUD operations across all 9 sections. The primary gaps identified are:
1. Documents section - UI exists but no backend integration (tRPC procedures missing)
2. Sequences section - View works, but add/edit not functional
3. Sequences performance stats - Shows 0, needs aggregation from logs

## Current State Analysis

### What Already Works
- 9-section navigation system (`src/lib/navigation/entity-sections.ts:101-111`)
- Campaign sidebar with journey visualization (`src/components/navigation/CampaignSectionSidebar.tsx`)
- Optimized `getByIdWithCounts` procedure with caching (`src/server/routers/crm.ts:4301-4446`)
- Inline panel pattern in Prospects and Sequences sections
- Activity logging on ALL campaign mutations (100% coverage)
- Complete sections: Overview, Prospects, Leads, Activities, Notes, Analytics, History

### Key Discoveries
- `campaign_documents` table EXISTS (`supabase/migrations/20260117000000_campaign_documents_table.sql`)
- Documents section uses mock data (`src/components/crm/campaigns/sections/CampaignDocumentsSection.tsx:80-82`)
- Documents count hardcoded to 0 (`src/server/routers/crm.ts:4369`)
- Sequences stored as JSONB in campaigns table, not separate table
- Sequence stats show 0 because no aggregation from `campaign_sequence_logs`

## Desired End State

After implementation:
1. **Documents Section** - Fully functional upload, list, view, delete with real data
2. **Sequences Section** - Add new sequences, edit existing sequences in inline panel
3. **Sequences Stats** - Real performance metrics aggregated from logs
4. **Sidebar Counts** - Accurate document count in sidebar navigation
5. **All Acceptance Criteria** - Pass manual validation tests from issue

### Verification Commands
```bash
pnpm lint        # No linting errors
pnpm build       # Production build succeeds
pnpm dev         # Development server runs
```

## What We're NOT Doing

- **NOT** changing the JSONB sequences storage to separate table (working well)
- **NOT** implementing activity template auto-create system (separate issue)
- **NOT** adding inline panels to Leads section (works fine as table with links)
- **NOT** refactoring existing working sections

---

## Phase 1: Documents Section Backend

### Overview
Create tRPC procedures for campaign documents CRUD and wire up the existing UI.

### Changes Required

#### 1.1 Add Campaign Documents Procedures to CRM Router

**File**: `src/server/routers/crm.ts`
**Location**: Add after line ~5159 (after `campaigns.duplicate`)

**Add these procedures to the campaigns router:**

```typescript
// ================================================
// Campaign Documents CRUD
// ================================================

documents: router({
  list: orgProtectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        documentType: z.enum(['template', 'collateral', 'report', 'attachment', 'all']).default('all'),
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx

      let query = adminClient
        .from('campaign_documents')
        .select('*, uploader:user_profiles!uploaded_by(id, full_name, avatar_url)')
        .eq('org_id', orgId)
        .eq('campaign_id', input.campaignId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(input.limit)

      if (input.documentType !== 'all') {
        query = query.eq('document_type', input.documentType)
      }
      if (input.category) {
        query = query.eq('category', input.category)
      }

      const { data, error } = await query
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ?? []
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx

      const { data, error } = await adminClient
        .from('campaign_documents')
        .select('*, uploader:user_profiles!uploaded_by(id, full_name, avatar_url)')
        .eq('org_id', orgId)
        .eq('id', input.id)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' })
      }
      return data
    }),

  create: orgProtectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        documentType: z.enum(['template', 'collateral', 'report', 'attachment']).default('attachment'),
        category: z.string().optional(),
        fileUrl: z.string().url(),
        fileName: z.string(),
        fileSize: z.number().int().positive(),
        mimeType: z.string(),
        templateVariables: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId, user } = ctx

      const { data, error } = await adminClient
        .from('campaign_documents')
        .insert({
          campaign_id: input.campaignId,
          org_id: orgId,
          name: input.name,
          description: input.description,
          document_type: input.documentType,
          category: input.category,
          file_url: input.fileUrl,
          file_name: input.fileName,
          file_size: input.fileSize,
          mime_type: input.mimeType,
          template_variables: input.templateVariables,
          uploaded_by: userId,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // Log activity
      await adminClient.from('activities').insert({
        org_id: orgId,
        entity_type: 'campaign',
        entity_id: input.campaignId,
        activity_type: 'note',
        subject: 'Document Uploaded',
        description: `"${input.name}" (${input.documentType}) uploaded to campaign`,
        created_by: userId,
      })

      return data
    }),

  update: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        templateVariables: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx
      const { id, ...updates } = input

      const cleanUpdates = Object.fromEntries(
        Object.entries({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          template_variables: updates.templateVariables,
        }).filter(([, v]) => v !== undefined)
      )

      const { data, error } = await adminClient
        .from('campaign_documents')
        .update(cleanUpdates)
        .eq('org_id', orgId)
        .eq('id', id)
        .select('*, campaign_id')
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // Log activity
      await adminClient.from('activities').insert({
        org_id: orgId,
        entity_type: 'campaign',
        entity_id: data.campaign_id,
        activity_type: 'note',
        subject: 'Document Updated',
        description: `"${data.name}" document updated`,
        created_by: userId,
      })

      return data
    }),

  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx

      // Get document first for activity log
      const { data: doc } = await adminClient
        .from('campaign_documents')
        .select('name, campaign_id')
        .eq('org_id', orgId)
        .eq('id', input.id)
        .single()

      // Soft delete
      const { error } = await adminClient
        .from('campaign_documents')
        .update({ deleted_at: new Date().toISOString() })
        .eq('org_id', orgId)
        .eq('id', input.id)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // Log activity
      if (doc) {
        await adminClient.from('activities').insert({
          org_id: orgId,
          entity_type: 'campaign',
          entity_id: doc.campaign_id,
          activity_type: 'note',
          subject: 'Document Deleted',
          description: `"${doc.name}" document removed from campaign`,
          created_by: userId,
        })
      }

      return { success: true }
    }),

  incrementUsage: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx

      const { error } = await adminClient.rpc('increment_document_usage', {
        doc_id: input.id,
        p_org_id: orgId,
      })

      // If RPC doesn't exist, do it manually
      if (error) {
        await adminClient
          .from('campaign_documents')
          .update({
            usage_count: adminClient.raw('usage_count + 1'),
            last_used_at: new Date().toISOString(),
          })
          .eq('org_id', orgId)
          .eq('id', input.id)
      }

      return { success: true }
    }),
}),
```

#### 1.2 Update getByIdWithCounts to Include Document Count

**File**: `src/server/routers/crm.ts`
**Location**: Line ~4369 (where documents count is hardcoded to 0)

**Replace:**
```typescript
documents: 0, // TODO: Implement document count
```

**With:**
```typescript
documents: documentCount,
```

**And add this query to the parallel fetches around line 4325:**
```typescript
const documentCountQuery = adminClient
  .from('campaign_documents')
  .select('id', { count: 'exact', head: true })
  .eq('campaign_id', input.id)
  .eq('org_id', orgId)
  .is('deleted_at', null)
```

**Then destructure the result around line 4345:**
```typescript
const { count: documentCount } = await documentCountQuery
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Linting passes: `pnpm lint`
- [ ] Dev server runs: `pnpm dev`

#### Manual Verification:
- [ ] Navigate to campaign → Documents section
- [ ] Verify documents count shows in sidebar navigation
- [ ] API call to `crm.campaigns.documents.list` returns data

---

## Phase 2: Documents Section UI Integration

### Overview
Wire the existing Documents section UI to use real tRPC data and enable upload functionality.

### Changes Required

#### 2.1 Update CampaignDocumentsSection Component

**File**: `src/components/crm/campaigns/sections/CampaignDocumentsSection.tsx`

**Replace mock data (lines 80-82) with tRPC query:**

```typescript
// Replace:
// const documents: DocumentData[] = [] // Mock data

// With:
const { data: documents, isLoading, refetch } = trpc.crm.campaigns.documents.list.useQuery({
  campaignId,
  documentType: filterType === 'all' ? 'all' : filterType as any,
})

const deleteMutation = trpc.crm.campaigns.documents.delete.useMutation({
  onSuccess: () => {
    toast.success('Document deleted')
    refetch()
  },
  onError: (error) => {
    toast.error(error.message)
  },
})
```

**Add loading state before the return statement:**

```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
    </div>
  )
}
```

**Update the delete button in inline panel footer to use mutation:**

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    if (selectedDocument) {
      deleteMutation.mutate({ id: selectedDocument.id })
      setSelectedDocumentId(null)
    }
  }}
  disabled={deleteMutation.isPending}
>
  {deleteMutation.isPending ? (
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  ) : (
    <Trash className="w-4 h-4 mr-2" />
  )}
  Delete
</Button>
```

#### 2.2 Create Upload Document Dialog

**File**: `src/components/crm/campaigns/UploadDocumentDialog.tsx` (new file)

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Upload, Loader2, File } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const uploadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  documentType: z.enum(['template', 'collateral', 'report', 'attachment']),
  category: z.string().optional(),
})

type UploadFormData = z.infer<typeof uploadSchema>

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onSuccess?: () => void
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  campaignId,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
      description: '',
      documentType: 'attachment',
      category: '',
    },
  })

  const createMutation = trpc.crm.campaigns.documents.create.useMutation({
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      form.reset()
      setFile(null)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!form.getValues('name')) {
        form.setValue('name', selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const onSubmit = async (data: UploadFormData) => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${campaignId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-documents')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-documents')
        .getPublicUrl(fileName)

      // Create document record
      await createMutation.mutateAsync({
        campaignId,
        name: data.name,
        description: data.description,
        documentType: data.documentType,
        category: data.category,
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  const documentTypes = [
    { value: 'template', label: 'Email/LinkedIn Template' },
    { value: 'collateral', label: 'Marketing Collateral' },
    { value: 'report', label: 'Report' },
    { value: 'attachment', label: 'General Attachment' },
  ]

  const categories = [
    { value: 'email_template', label: 'Email Template' },
    { value: 'linkedin_template', label: 'LinkedIn Template' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'case_study', label: 'Case Study' },
    { value: 'one_pager', label: 'One Pager' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a document to this campaign. Templates, collateral, and reports can be tracked.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <div className="border-2 border-dashed border-charcoal-200 rounded-lg p-6 text-center hover:border-hublot-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <File className="w-8 h-8 text-hublot-600" />
                      <div className="text-left">
                        <p className="font-medium text-charcoal-900">{file.name}</p>
                        <p className="text-sm text-charcoal-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-charcoal-400 mx-auto mb-2" />
                      <p className="text-sm text-charcoal-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-charcoal-400 mt-1">
                        PDF, DOC, XLS, PPT, images up to 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q4 Email Template" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Type */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this document..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || createMutation.isPending}>
                {uploading || createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

#### 2.3 Wire Upload Button in Documents Section

**File**: `src/components/crm/campaigns/sections/CampaignDocumentsSection.tsx`

**Add state and dialog:**
```typescript
const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
```

**Update upload button onClick:**
```typescript
<Button onClick={() => setUploadDialogOpen(true)}>
  <Upload className="w-4 h-4 mr-2" />
  Upload Document
</Button>
```

**Add dialog at end of component:**
```typescript
<UploadDocumentDialog
  open={uploadDialogOpen}
  onOpenChange={setUploadDialogOpen}
  campaignId={campaignId}
  onSuccess={() => refetch()}
/>
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Linting passes: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to campaign → Documents section
- [ ] Click "Upload Document" button
- [ ] Select a file and fill in details
- [ ] Document appears in list after upload
- [ ] Click on document row to see inline panel
- [ ] Delete document works
- [ ] Document count updates in sidebar

---

## Phase 3: Sequences Section Add/Edit

### Overview
Enable add and edit functionality for campaign sequences.

### Changes Required

#### 3.1 Create Add/Edit Sequence Dialog

**File**: `src/components/crm/campaigns/EditSequenceDialog.tsx` (new file)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Plus, Trash, Loader2, GripVertical, Mail, Linkedin } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'

const sequenceStepSchema = z.object({
  day: z.number().int().min(0),
  action: z.string(),
  subject: z.string().optional(),
  body: z.string().optional(),
})

const sequenceSchema = z.object({
  channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
  enabled: z.boolean().default(true),
  steps: z.array(sequenceStepSchema).min(1, 'At least one step is required'),
  stopOnReply: z.boolean().default(true),
  stopOnMeeting: z.boolean().default(true),
})

type SequenceFormData = z.infer<typeof sequenceSchema>

interface EditSequenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  existingSequence?: {
    channel: string
    steps: Array<{ day: number; action: string; subject?: string; body?: string }>
    settings?: { stopOnReply?: boolean; stopOnMeeting?: boolean }
  }
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function EditSequenceDialog({
  open,
  onOpenChange,
  campaignId,
  existingSequence,
  mode,
  onSuccess,
}: EditSequenceDialogProps) {
  const utils = trpc.useUtils()

  const form = useForm<SequenceFormData>({
    resolver: zodResolver(sequenceSchema),
    defaultValues: {
      channel: (existingSequence?.channel as any) || 'email',
      enabled: true,
      steps: existingSequence?.steps || [{ day: 1, action: 'send_email', subject: '', body: '' }],
      stopOnReply: existingSequence?.settings?.stopOnReply ?? true,
      stopOnMeeting: existingSequence?.settings?.stopOnMeeting ?? true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  })

  // Reset form when sequence changes
  useEffect(() => {
    if (existingSequence) {
      form.reset({
        channel: existingSequence.channel as any,
        enabled: true,
        steps: existingSequence.steps,
        stopOnReply: existingSequence.settings?.stopOnReply ?? true,
        stopOnMeeting: existingSequence.settings?.stopOnMeeting ?? true,
      })
    } else {
      form.reset({
        channel: 'email',
        enabled: true,
        steps: [{ day: 1, action: 'send_email', subject: '', body: '' }],
        stopOnReply: true,
        stopOnMeeting: true,
      })
    }
  }, [existingSequence, form])

  const { data: campaign } = trpc.crm.campaigns.getById.useQuery({ id: campaignId })

  const updateMutation = trpc.crm.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success(mode === 'create' ? 'Sequence created' : 'Sequence updated')
      utils.crm.campaigns.getById.invalidate({ id: campaignId })
      utils.crm.campaigns.getByIdWithCounts.invalidate({ id: campaignId })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (data: SequenceFormData) => {
    if (!campaign) return

    // Parse existing sequences from campaign
    const existingSequences = campaign.sequences || {}

    // Create new sequence object
    const newSequence = {
      steps: data.steps,
      settings: {
        stopOnReply: data.stopOnReply,
        stopOnMeeting: data.stopOnMeeting,
      },
    }

    // Update sequences object
    const updatedSequences = {
      ...existingSequences,
      [data.channel]: newSequence,
    }

    // Update campaign with new sequences
    await updateMutation.mutateAsync({
      id: campaignId,
      sequences: updatedSequences,
    })
  }

  const channelIcons = {
    email: <Mail className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    phone: <span className="text-xs">📞</span>,
    sms: <span className="text-xs">💬</span>,
  }

  const actionOptions = {
    email: [
      { value: 'send_email', label: 'Send Email' },
      { value: 'follow_up_email', label: 'Follow-up Email' },
      { value: 'breakup_email', label: 'Breakup Email' },
    ],
    linkedin: [
      { value: 'connection_request', label: 'Connection Request' },
      { value: 'linkedin_message', label: 'LinkedIn Message' },
      { value: 'linkedin_inmail', label: 'LinkedIn InMail' },
    ],
    phone: [
      { value: 'call', label: 'Phone Call' },
      { value: 'voicemail', label: 'Leave Voicemail' },
    ],
    sms: [
      { value: 'send_sms', label: 'Send SMS' },
    ],
  }

  const watchChannel = form.watch('channel')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Sequence' : 'Edit Sequence'}
          </DialogTitle>
          <DialogDescription>
            Configure the outreach sequence for this channel.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Channel Selection */}
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === 'edit'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Email
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4" /> LinkedIn
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Sequence Steps</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ day: fields.length + 1, action: actionOptions[watchChannel][0].value, subject: '', body: '' })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Step
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-charcoal-400" />
                      <span className="font-medium text-sm">Step {index + 1}</span>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.day`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Day</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.action`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Action</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {actionOptions[watchChannel]?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchChannel === 'email' && (
                    <>
                      <FormField
                        control={form.control}
                        name={`steps.${index}.subject`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Subject Line</FormLabel>
                            <FormControl>
                              <Input placeholder="Email subject..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`steps.${index}.body`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Message Template</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Email body... Use {first_name}, {company} for variables"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {watchChannel === 'linkedin' && (
                    <FormField
                      control={form.control}
                      name={`steps.${index}.body`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="LinkedIn message... Use {first_name}, {company} for variables"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </Card>
              ))}
            </div>

            {/* Stop Conditions */}
            <div className="space-y-3">
              <FormLabel>Stop Conditions</FormLabel>

              <FormField
                control={form.control}
                name="stopOnReply"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Stop on Reply</FormLabel>
                      <FormDescription className="text-xs">
                        Stop sequence when prospect responds
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stopOnMeeting"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Stop on Meeting Booked</FormLabel>
                      <FormDescription className="text-xs">
                        Stop sequence when meeting is scheduled
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  mode === 'create' ? 'Add Sequence' : 'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

#### 3.2 Wire Edit Button in Sequences Section

**File**: `src/components/crm/campaigns/sections/CampaignSequencesSection.tsx`

**Add state:**
```typescript
const [editDialogOpen, setEditDialogOpen] = useState(false)
const [editingSequence, setEditingSequence] = useState<any>(null)
```

**Update Edit Sequence button in inline panel footer:**
```typescript
<Button
  variant="outline"
  size="sm"
  className="flex-1"
  onClick={() => {
    setEditingSequence(selectedSequence)
    setEditDialogOpen(true)
  }}
>
  <Edit className="w-4 h-4 mr-2" />
  Edit Sequence
</Button>
```

**Add dialog at end of component:**
```typescript
<EditSequenceDialog
  open={editDialogOpen}
  onOpenChange={setEditDialogOpen}
  campaignId={campaignId}
  existingSequence={editingSequence}
  mode={editingSequence ? 'edit' : 'create'}
  onSuccess={() => {
    setEditingSequence(null)
    // Refetch campaign data
  }}
/>
```

#### 3.3 Add "Add Sequence" Button to Section Header

**File**: `src/components/crm/campaigns/sections/CampaignSequencesSection.tsx`

**In the section header, add button:**
```typescript
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="text-lg font-heading font-semibold text-charcoal-900">
      Sequences
    </h2>
    <p className="text-sm text-charcoal-500 mt-1">
      Manage outreach sequences for this campaign
    </p>
  </div>
  <div className="flex items-center gap-3">
    {/* Existing filter */}
    <Select ... />

    {/* Add Sequence button */}
    {campaign?.status !== 'completed' && (
      <Button
        onClick={() => {
          setEditingSequence(null)
          setEditDialogOpen(true)
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Sequence
      </Button>
    )}
  </div>
</div>
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Linting passes: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to campaign → Sequences section
- [ ] Click "Add Sequence" button
- [ ] Fill in sequence details with multiple steps
- [ ] New sequence appears in list
- [ ] Click on sequence row, click "Edit Sequence" in panel
- [ ] Modify sequence and save
- [ ] Changes persist after page refresh

---

## Phase 4: Sequences Performance Stats

### Overview
Show real performance statistics in the Sequences section by aggregating data from `campaign_sequence_logs`.

### Changes Required

#### 4.1 Add Sequence Stats Query

**File**: `src/server/routers/crm.ts`
**Location**: Add to campaigns router

```typescript
getSequenceStats: orgProtectedProcedure
  .input(z.object({ campaignId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const { orgId } = ctx

    // Aggregate stats from campaign_sequence_logs
    const { data, error } = await adminClient
      .from('campaign_sequence_logs')
      .select('channel, action_type')
      .eq('campaign_id', input.campaignId)

    if (error) {
      return {}
    }

    // Group by channel and calculate stats
    const stats: Record<string, { sent: number; opens: number; replies: number }> = {}

    for (const log of data || []) {
      if (!stats[log.channel]) {
        stats[log.channel] = { sent: 0, opens: 0, replies: 0 }
      }

      switch (log.action_type) {
        case 'sent':
        case 'delivered':
          stats[log.channel].sent++
          break
        case 'opened':
        case 'viewed':
          stats[log.channel].opens++
          break
        case 'replied':
        case 'responded':
          stats[log.channel].replies++
          break
      }
    }

    return stats
  }),
```

#### 4.2 Update Sequences Section to Use Real Stats

**File**: `src/components/crm/campaigns/sections/CampaignSequencesSection.tsx`

**Add query:**
```typescript
const { data: sequenceStats } = trpc.crm.campaigns.getSequenceStats.useQuery({
  campaignId,
})
```

**Update sequences mapping to use real stats:**
```typescript
const sequences = Object.entries(campaign?.sequences || {}).map(([channel, data]: [string, any]) => {
  const stats = sequenceStats?.[channel] || { sent: 0, opens: 0, replies: 0 }
  return {
    channel,
    steps: data.steps?.length || 0,
    status: campaign?.status === 'active' ? 'active' : 'paused',
    sent: stats.sent,
    openRate: stats.sent > 0 ? Math.round((stats.opens / stats.sent) * 100) : 0,
    responseRate: stats.sent > 0 ? Math.round((stats.replies / stats.sent) * 100) : 0,
    data,
  }
})
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Linting passes: `pnpm lint`

#### Manual Verification:
- [ ] Navigate to campaign → Sequences section
- [ ] Verify stats columns show real numbers (not all 0)
- [ ] Stats update when new sequence logs are added

---

## Testing Strategy

### Unit Tests
- Test tRPC document procedures with mock data
- Test sequence stats aggregation logic

### Integration Tests
- Test document upload flow end-to-end
- Test sequence CRUD operations

### Manual Testing Steps

Follow the validation tests from the issue:

1. **Test Documents Upload** (Test 5 from issue)
   - Navigate to campaign → Documents
   - Click "Upload Document"
   - Select file and category
   - Verify document appears in list
   - Click row to see inline panel

2. **Test Sequences Add/Edit** (Test 4 from issue)
   - Navigate to campaign → Sequences
   - Click "Add Sequence"
   - Configure multi-step sequence
   - Save and verify in list
   - Click row, edit sequence
   - Verify changes persist

3. **Test Document Count in Sidebar**
   - Upload documents
   - Verify sidebar shows correct count
   - Delete documents
   - Verify count updates

---

## Performance Considerations

- Documents list limited to 50 items by default
- Sequence stats query may be slow for large campaigns - consider caching
- File uploads go to Supabase Storage with CDN delivery

---

## References

- Original issue: `thoughts/shared/issues/campaigns-01`
- Research: `thoughts/shared/research/2025-12-08-campaign-workspace-guidewire-research.md`
- Campaign documents table: `supabase/migrations/20260117000000_campaign_documents_table.sql`
- Inline panel pattern: `src/components/ui/inline-panel.tsx`
- Campaign router: `src/server/routers/crm.ts:4180-5159`
