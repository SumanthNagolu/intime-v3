# Sprint 3: API Architecture - Workflow Engine & Core Services

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 3 (Week 5-6)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This document defines the complete tRPC API architecture for Sprint 3's Workflow Engine and Core Services. Building on Sprint 2's tRPC infrastructure, we add 5 new routers with 35+ procedures.

### Key Features

1. **Type-Safe Workflows** - Full TypeScript inference for workflow operations
2. **Document Generation** - PDF/DOCX generation with progress tracking
3. **File Uploads** - Presigned URLs for direct client upload
4. **Email Sending** - Template-based with rate limiting
5. **Background Jobs** - Async task processing with status polling

---

## Router Overview

| Router | Procedures | Auth Level | Purpose |
|--------|-----------|------------|---------|
| `workflows` | 10 | Protected | Workflow instance management |
| `documents` | 6 | Protected | Document generation |
| `files` | 7 | Protected | File upload/download |
| `emails` | 5 | Protected | Email sending |
| `jobs` | 6 | Protected | Background job management |

**Total:** 34 procedures

---

## File Structure

```
src/
├── server/
│   └── trpc/
│       ├── routers/
│       │   ├── workflows.ts              # Workflow operations
│       │   ├── documents.ts              # Document generation
│       │   ├── files.ts                  # File management
│       │   ├── emails.ts                 # Email service
│       │   ├── jobs.ts                   # Background jobs
│       │   └── admin/
│       │       ├── workflows-admin.ts    # Workflow admin UI
│       │       └── jobs-admin.ts         # Job monitoring
│       └── root.ts                       # App router (update)
├── lib/
│   ├── workflows/
│   │   ├── WorkflowEngine.ts             # Core workflow logic
│   │   └── types.ts                      # Workflow types
│   ├── documents/
│   │   ├── DocumentService.ts            # PDF/DOCX generation
│   │   └── types.ts                      # Document types
│   ├── files/
│   │   ├── FileUploadService.ts          # File operations
│   │   └── types.ts                      # File types
│   ├── emails/
│   │   ├── EmailService.ts               # Email sending
│   │   └── types.ts                      # Email types
│   └── jobs/
│       ├── JobQueue.ts                   # Job queue management
│       ├── processors/                   # Job processors
│       │   ├── generate-document.ts
│       │   ├── send-bulk-email.ts
│       │   └── import-data.ts
│       └── types.ts                      # Job types
└── types/
    └── api.ts                            # Shared API types
```

---

## 1. Workflows Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/workflows.ts`

### Input/Output Schemas

```typescript
import { z } from 'zod';

// Start workflow
export const startWorkflowSchema = z.object({
  workflowId: z.string().uuid(),
  entityType: z.enum(['student', 'candidate', 'job', 'consultant', 'client']),
  entityId: z.string().uuid()
});

export type StartWorkflowInput = z.infer<typeof startWorkflowSchema>;

export interface StartWorkflowOutput {
  instanceId: string;
  initialState: {
    id: string;
    name: string;
    displayName: string;
  };
}

// Transition workflow
export const transitionWorkflowSchema = z.object({
  instanceId: z.string().uuid(),
  action: z.string().min(1),
  notes: z.string().max(1000).optional(),
  expectedVersion: z.number().int().optional() // Optimistic locking
});

export interface TransitionWorkflowOutput {
  success: boolean;
  newState: {
    id: string;
    name: string;
    displayName: string;
    isTerminal: boolean;
  };
  isCompleted: boolean;
}

// Get available actions
export interface AvailableAction {
  action: string;
  displayName: string;
  toStateName: string;
  requiredPermission: string | null;
  hasPermission: boolean;
}

// List workflow instances
export const listWorkflowInstancesSchema = z.object({
  workflowId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'failed']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

export interface WorkflowInstance {
  id: string;
  workflowName: string;
  entityType: string;
  entityId: string;
  currentState: string;
  currentStateDisplay: string;
  status: 'active' | 'completed' | 'cancelled' | 'failed';
  startedAt: Date;
  completedAt: Date | null;
  durationHours: number | null;
  createdByName: string;
}

// Get workflow history
export interface WorkflowHistoryEntry {
  id: string;
  fromState: string | null;
  toState: string;
  action: string;
  performedBy: string;
  performedByName: string;
  notes: string | null;
  createdAt: Date;
}
```

### Router Implementation

```typescript
import { router } from '../init';
import { protectedProcedure, adminProcedure } from '../middleware';
import { TRPCError } from '@trpc/server';
import { WorkflowEngine } from '@/lib/workflows/WorkflowEngine';
import {
  startWorkflowSchema,
  transitionWorkflowSchema,
  listWorkflowInstancesSchema,
  type StartWorkflowOutput,
  type TransitionWorkflowOutput,
  type AvailableAction,
  type WorkflowInstance,
  type WorkflowHistoryEntry
} from './schemas/workflows';

const workflowEngine = new WorkflowEngine();

export const workflowsRouter = router({
  /**
   * Start a new workflow instance
   */
  start: protectedProcedure
    .input(startWorkflowSchema)
    .mutation(async ({ ctx, input }): Promise<StartWorkflowOutput> => {
      const { data, error } = await ctx.supabase.rpc('start_workflow', {
        p_workflow_id: input.workflowId,
        p_entity_type: input.entityType,
        p_entity_id: input.entityId,
        p_user_id: ctx.userId,
        p_org_id: ctx.orgId
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      const instanceId = data as string;

      // Fetch initial state
      const { data: instance } = await ctx.supabase
        .from('workflow_instances')
        .select('current_state_id, workflow_states(id, name, display_name)')
        .eq('id', instanceId)
        .single();

      return {
        instanceId,
        initialState: {
          id: instance.current_state_id,
          name: instance.workflow_states.name,
          displayName: instance.workflow_states.display_name
        }
      };
    }),

  /**
   * Transition workflow to new state
   */
  transition: protectedProcedure
    .input(transitionWorkflowSchema)
    .mutation(async ({ ctx, input }): Promise<TransitionWorkflowOutput> => {
      const { data, error } = await ctx.supabase.rpc('transition_workflow', {
        p_instance_id: input.instanceId,
        p_action: input.action,
        p_user_id: ctx.userId,
        p_notes: input.notes || null,
        p_expected_version: input.expectedVersion || null
      });

      if (error) {
        if (error.message.includes('version mismatch')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Workflow was modified by another user. Please refresh and try again.'
          });
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        });
      }

      // Fetch new state
      const { data: instance } = await ctx.supabase
        .from('workflow_instances')
        .select('current_state_id, status, workflow_states(id, name, display_name, is_terminal)')
        .eq('id', input.instanceId)
        .single();

      return {
        success: true,
        newState: {
          id: instance.workflow_states.id,
          name: instance.workflow_states.name,
          displayName: instance.workflow_states.display_name,
          isTerminal: instance.workflow_states.is_terminal
        },
        isCompleted: instance.status === 'completed'
      };
    }),

  /**
   * Get available actions for workflow instance
   */
  getAvailableActions: protectedProcedure
    .input(z.object({ instanceId: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<AvailableAction[]> => {
      const { data, error } = await ctx.supabase.rpc('get_available_actions', {
        p_instance_id: input.instanceId,
        p_user_id: ctx.userId
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data as AvailableAction[];
    }),

  /**
   * Get workflow instance details
   */
  getInstance: protectedProcedure
    .input(z.object({ instanceId: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<WorkflowInstance> => {
      const { data, error } = await ctx.supabase
        .from('v_workflow_instances_with_state')
        .select('*')
        .eq('id', input.instanceId)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow instance not found'
        });
      }

      return {
        id: data.id,
        workflowName: data.workflow_name,
        entityType: data.entity_type,
        entityId: data.entity_id,
        currentState: data.current_state,
        currentStateDisplay: data.current_state_display,
        status: data.status,
        startedAt: new Date(data.started_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : null,
        durationHours: data.duration_hours,
        createdByName: data.created_by_name
      };
    }),

  /**
   * Get workflow instance history
   */
  getHistory: protectedProcedure
    .input(z.object({ instanceId: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<WorkflowHistoryEntry[]> => {
      const { data, error } = await ctx.supabase
        .from('workflow_history')
        .select(`
          id,
          from_state_id,
          to_state_id,
          action,
          performed_by,
          notes,
          created_at,
          from_state:workflow_states!from_state_id(name),
          to_state:workflow_states!to_state_id(name),
          user:user_profiles(full_name)
        `)
        .eq('workflow_instance_id', input.instanceId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data.map(entry => ({
        id: entry.id,
        fromState: entry.from_state?.name || null,
        toState: entry.to_state.name,
        action: entry.action,
        performedBy: entry.performed_by,
        performedByName: entry.user.full_name,
        notes: entry.notes,
        createdAt: new Date(entry.created_at)
      }));
    }),

  /**
   * List workflow instances with filters
   */
  list: protectedProcedure
    .input(listWorkflowInstancesSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('v_workflow_instances_with_state')
        .select('*', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('created_at', { ascending: false });

      if (input.workflowId) {
        query = query.eq('workflow_id', input.workflowId);
      }

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType);
      }

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return {
        instances: data.map(d => ({
          id: d.id,
          workflowName: d.workflow_name,
          entityType: d.entity_type,
          entityId: d.entity_id,
          currentState: d.current_state,
          currentStateDisplay: d.current_state_display,
          status: d.status,
          startedAt: new Date(d.started_at),
          completedAt: d.completed_at ? new Date(d.completed_at) : null,
          durationHours: d.duration_hours,
          createdByName: d.created_by_name
        })),
        total: count || 0,
        hasMore: (input.offset + input.limit) < (count || 0)
      };
    }),

  /**
   * Cancel workflow instance
   */
  cancel: protectedProcedure
    .input(
      z.object({
        instanceId: z.string().uuid(),
        reason: z.string().min(1).max(500)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('cancel_workflow', {
        p_instance_id: input.instanceId,
        p_user_id: ctx.userId,
        p_reason: input.reason
      });

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        });
      }

      return { success: true };
    }),

  /**
   * List all workflow definitions (admin)
   */
  listDefinitions: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('workflows')
      .select('id, name, description, entity_type, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      });
    }

    return data;
  }),

  /**
   * Get workflow metrics
   */
  getMetrics: protectedProcedure
    .input(z.object({ workflowId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('v_workflow_metrics')
        .select('*');

      if (input.workflowId) {
        query = query.eq('workflow_id', input.workflowId);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    })
});
```

---

## 2. Documents Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/documents.ts`

### Schemas

```typescript
import { z } from 'zod';

export const generateDocumentSchema = z.object({
  templateId: z.string().uuid(),
  variables: z.record(z.any()),
  entityType: z.string(),
  entityId: z.string().uuid()
});

export interface GeneratedDocument {
  documentId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  generatedAt: Date;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  templateType: 'pdf' | 'docx' | 'html';
  category: string;
  variables: Record<string, any>;
  isActive: boolean;
}
```

### Router Implementation

```typescript
import { router } from '../init';
import { protectedProcedure } from '../middleware';
import { TRPCError } from '@trpc/server';
import { DocumentService } from '@/lib/documents/DocumentService';
import { JobQueue } from '@/lib/jobs/JobQueue';
import { generateDocumentSchema, type GeneratedDocument, type DocumentTemplate } from './schemas/documents';

const documentService = new DocumentService();
const jobQueue = new JobQueue();

export const documentsRouter = router({
  /**
   * Generate document (async via background job)
   */
  generate: protectedProcedure
    .input(generateDocumentSchema)
    .mutation(async ({ ctx, input }): Promise<{ jobId: string }> => {
      // Create background job for document generation
      const { data: jobData, error } = await ctx.supabase
        .from('background_jobs')
        .insert({
          org_id: ctx.orgId,
          job_type: 'generate_document',
          payload: {
            templateId: input.templateId,
            variables: input.variables,
            entityType: input.entityType,
            entityId: input.entityId
          },
          created_by: ctx.userId
        })
        .select('id')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to queue document generation'
        });
      }

      return { jobId: jobData.id };
    }),

  /**
   * Generate document synchronously (for small documents)
   */
  generateSync: protectedProcedure
    .input(generateDocumentSchema)
    .mutation(async ({ ctx, input }): Promise<GeneratedDocument> => {
      try {
        const result = await documentService.generatePDF(
          input.templateId,
          input.variables,
          ctx.orgId!
        );

        // Save metadata
        const { data, error } = await ctx.supabase
          .from('generated_documents')
          .insert({
            org_id: ctx.orgId,
            template_id: input.templateId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            file_path: result.filePath,
            file_name: result.fileName,
            file_size: result.fileSize,
            mime_type: 'application/pdf',
            generated_by: ctx.userId,
            metadata: { variables: input.variables }
          })
          .select('id, generated_at')
          .single();

        if (error) {
          throw new Error('Failed to save document metadata');
        }

        return {
          documentId: data.id,
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
          generatedAt: new Date(data.generated_at)
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }
    }),

  /**
   * List document templates
   */
  listTemplates: protectedProcedure
    .input(
      z.object({
        category: z.string().optional()
      })
    )
    .query(async ({ ctx, input }): Promise<DocumentTemplate[]> => {
      let query = ctx.supabase
        .from('document_templates')
        .select('id, name, description, template_type, category, variables, is_active')
        .eq('is_active', true)
        .order('name');

      if (input.category) {
        query = query.eq('category', input.category);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        templateType: t.template_type,
        category: t.category,
        variables: t.variables,
        isActive: t.is_active
      }));
    }),

  /**
   * Get document history for entity
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('generated_documents')
        .select(`
          id,
          file_name,
          file_size,
          generated_at,
          template:document_templates(name),
          user:user_profiles(full_name)
        `)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('generated_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data.map(d => ({
        id: d.id,
        fileName: d.file_name,
        fileSize: d.file_size,
        generatedAt: new Date(d.generated_at),
        templateName: d.template.name,
        generatedBy: d.user.full_name
      }));
    }),

  /**
   * Download document (get signed URL)
   */
  download: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: doc, error: docError } = await ctx.supabase
        .from('generated_documents')
        .select('file_path, file_name')
        .eq('id', input.documentId)
        .single();

      if (docError || !doc) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found'
        });
      }

      // Generate signed URL (expires in 1 hour)
      const { data, error } = await ctx.supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URL'
        });
      }

      return {
        url: data.signedUrl,
        fileName: doc.file_name
      };
    }),

  /**
   * Preview template (render with sample data)
   */
  previewTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: template, error } = await ctx.supabase
        .from('document_templates')
        .select('sample_data, template_type')
        .eq('id', input.templateId)
        .single();

      if (error || !template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found'
        });
      }

      // Generate preview with sample data
      const result = await documentService.generatePDF(
        input.templateId,
        template.sample_data,
        ctx.orgId!,
        { preview: true }
      );

      return {
        previewUrl: result.fileUrl
      };
    })
});
```

---

## 3. Files Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/files.ts`

### Schemas

```typescript
import { z } from 'zod';

export const uploadFileSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive().max(100 * 1024 * 1024), // 100MB max
  mimeType: z.string(),
  bucket: z.enum(['avatars', 'resumes', 'documents', 'attachments', 'course-materials']),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional()
});

export interface UploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  filePath: string;
}

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  bucket: string;
  uploadedAt: Date;
  uploadedBy: string;
}
```

### Router Implementation

```typescript
import { router } from '../init';
import { protectedProcedure } from '../middleware';
import { TRPCError } from '@trpc/server';
import { uploadFileSchema, type UploadUrlResponse, type FileMetadata } from './schemas/files';

export const filesRouter = router({
  /**
   * Get presigned URL for file upload
   */
  getUploadUrl: protectedProcedure
    .input(uploadFileSchema)
    .mutation(async ({ ctx, input }): Promise<UploadUrlResponse> => {
      // Validate file type
      const allowedTypes: Record<string, string[]> = {
        avatars: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        resumes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        attachments: ['application/pdf', 'image/jpeg', 'image/png', 'application/zip'],
        'course-materials': ['application/pdf', 'video/mp4', 'application/zip']
      };

      if (!allowedTypes[input.bucket].includes(input.mimeType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File type ${input.mimeType} not allowed for bucket ${input.bucket}`
        });
      }

      // Generate file path
      const timestamp = Date.now();
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${ctx.orgId}/${input.entityType || 'general'}/${input.entityId || 'misc'}/${timestamp}-${sanitizedFileName}`;

      // Create upload URL (expires in 10 minutes)
      const { data, error } = await ctx.supabase.storage
        .from(input.bucket)
        .createSignedUploadUrl(filePath);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create upload URL'
        });
      }

      // Save metadata (will be updated after upload completes)
      const { data: fileData, error: fileError } = await ctx.supabase
        .from('file_uploads')
        .insert({
          org_id: ctx.orgId,
          bucket: input.bucket,
          file_path: filePath,
          file_name: input.fileName,
          file_size: input.fileSize,
          mime_type: input.mimeType,
          entity_type: input.entityType,
          entity_id: input.entityId,
          uploaded_by: ctx.userId
        })
        .select('id')
        .single();

      if (fileError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save file metadata'
        });
      }

      return {
        uploadUrl: data.signedUrl,
        fileId: fileData.id,
        filePath
      };
    }),

  /**
   * Confirm file upload completed
   */
  confirmUpload: protectedProcedure
    .input(z.object({ fileId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify file exists in storage
      const { data: file } = await ctx.supabase
        .from('file_uploads')
        .select('file_path, bucket')
        .eq('id', input.fileId)
        .single();

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found'
        });
      }

      const { data: storageFile, error } = await ctx.supabase.storage
        .from(file.bucket)
        .list(file.file_path.split('/').slice(0, -1).join('/'), {
          search: file.file_path.split('/').pop()
        });

      if (error || !storageFile || storageFile.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found in storage'
        });
      }

      return { success: true };
    }),

  /**
   * Delete file (soft delete)
   */
  deleteFile: protectedProcedure
    .input(z.object({ fileId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('file_uploads')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.fileId)
        .eq('uploaded_by', ctx.userId); // Only owner can delete

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file'
        });
      }

      return { success: true };
    }),

  /**
   * Get file download URL
   */
  getDownloadUrl: protectedProcedure
    .input(
      z.object({
        fileId: z.string().uuid(),
        expiresIn: z.number().min(60).max(86400).default(3600) // 1 hour default
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: file, error: fileError } = await ctx.supabase
        .from('file_uploads')
        .select('file_path, bucket, file_name')
        .eq('id', input.fileId)
        .is('deleted_at', null)
        .single();

      if (fileError || !file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found'
        });
      }

      const { data, error } = await ctx.supabase.storage
        .from(file.bucket)
        .createSignedUrl(file.file_path, input.expiresIn);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URL'
        });
      }

      return {
        url: data.signedUrl,
        fileName: file.file_name
      };
    }),

  /**
   * List files for entity
   */
  list: protectedProcedure
    .input(
      z.object({
        entityType: z.string().optional(),
        entityId: z.string().uuid().optional(),
        bucket: z.string().optional()
      })
    )
    .query(async ({ ctx, input }): Promise<FileMetadata[]> => {
      let query = ctx.supabase
        .from('file_uploads')
        .select(`
          id,
          file_name,
          file_size,
          mime_type,
          bucket,
          uploaded_at,
          user:user_profiles(full_name)
        `)
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false });

      if (input.entityType) {
        query = query.eq('entity_type', input.entityType);
      }

      if (input.entityId) {
        query = query.eq('entity_id', input.entityId);
      }

      if (input.bucket) {
        query = query.eq('bucket', input.bucket);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data.map(f => ({
        id: f.id,
        fileName: f.file_name,
        fileSize: f.file_size,
        mimeType: f.mime_type,
        bucket: f.bucket,
        uploadedAt: new Date(f.uploaded_at),
        uploadedBy: f.user.full_name
      }));
    })
});
```

---

## 4. Emails Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/emails.ts`

### Schemas

```typescript
import { z } from 'zod';

export const sendEmailSchema = z.object({
  to: z.union([
    z.string().email(),
    z.array(z.string().email())
  ]),
  templateId: z.string().uuid().optional(),
  subject: z.string().min(1).optional(),
  html: z.string().optional(),
  variables: z.record(z.any()).optional()
}).refine(
  data => (data.templateId || (data.subject && data.html)),
  { message: 'Either templateId or (subject + html) required' }
);

export interface EmailSendResult {
  emailLogId: string;
  resendId: string;
  status: 'pending' | 'sent';
}
```

### Router Implementation

```typescript
import { router } from '../init';
import { protectedProcedure } from '../middleware';
import { TRPCError } from '@trpc/server';
import { EmailService } from '@/lib/emails/EmailService';
import { sendEmailSchema, type EmailSendResult } from './schemas/emails';

const emailService = new EmailService();

// Rate limiting (in-memory, replace with Redis for production)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

export const emailsRouter = router({
  /**
   * Send email
   */
  send: protectedProcedure
    .input(sendEmailSchema)
    .mutation(async ({ ctx, input }): Promise<EmailSendResult> => {
      // Rate limiting check
      const userKey = `${ctx.userId}:${Date.now() / (60 * 60 * 1000) | 0}`; // Per hour
      const userLimit = rateLimiter.get(userKey) || { count: 0, resetAt: Date.now() + 3600000 };

      if (userLimit.count >= 100) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Email rate limit exceeded (100/hour)'
        });
      }

      rateLimiter.set(userKey, { count: userLimit.count + 1, resetAt: userLimit.resetAt });

      try {
        const result = await emailService.sendEmail({
          to: input.to,
          templateId: input.templateId,
          subject: input.subject,
          html: input.html,
          variables: input.variables,
          orgId: ctx.orgId!
        });

        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }
    }),

  /**
   * List email templates
   */
  listTemplates: protectedProcedure
    .input(
      z.object({
        category: z.enum(['transactional', 'notification', 'marketing']).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('email_templates')
        .select('id, name, subject, category, variables, is_active')
        .eq('is_active', true)
        .order('name');

      if (input.category) {
        query = query.eq('category', input.category);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),

  /**
   * Get email logs (admin)
   */
  getLogs: protectedProcedure
    .input(
      z.object({
        toEmail: z.string().optional(),
        status: z.enum(['pending', 'sent', 'failed', 'bounced']).optional(),
        limit: z.number().min(1).max(100).default(50)
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('email_logs')
        .select('id, to_email, subject, status, sent_at, opened_at, created_at')
        .order('created_at', { ascending: false })
        .limit(input.limit);

      if (input.toEmail) {
        query = query.eq('to_email', input.toEmail);
      }

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data.map(e => ({
        id: e.id,
        toEmail: e.to_email,
        subject: e.subject,
        status: e.status,
        sentAt: e.sent_at ? new Date(e.sent_at) : null,
        openedAt: e.opened_at ? new Date(e.opened_at) : null,
        createdAt: new Date(e.created_at)
      }));
    }),

  /**
   * Get email status
   */
  getStatus: protectedProcedure
    .input(z.object({ emailLogId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('email_logs')
        .select('status, sent_at, opened_at, clicked_at, error_message')
        .eq('id', input.emailLogId)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email log not found'
        });
      }

      return {
        status: data.status,
        sentAt: data.sent_at ? new Date(data.sent_at) : null,
        openedAt: data.opened_at ? new Date(data.opened_at) : null,
        clickedAt: data.clicked_at ? new Date(data.clicked_at) : null,
        errorMessage: data.error_message
      };
    })
});
```

---

## 5. Jobs Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/jobs.ts`

### Schemas

```typescript
import { z } from 'zod';

export const addJobSchema = z.object({
  jobType: z.enum(['generate_document', 'send_bulk_email', 'import_data', 'export_data']),
  payload: z.record(z.any()),
  priority: z.number().min(1).max(10).default(5)
});

export interface JobStatus {
  id: string;
  jobType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  errorMessage: string | null;
  result: any;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}
```

### Router Implementation

```typescript
import { router } from '../init';
import { protectedProcedure } from '../middleware';
import { TRPCError } from '@trpc/server';
import { addJobSchema, type JobStatus } from './schemas/jobs';

export const jobsRouter = router({
  /**
   * Add background job
   */
  add: protectedProcedure
    .input(addJobSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('background_jobs')
        .insert({
          org_id: ctx.orgId,
          job_type: input.jobType,
          payload: input.payload,
          priority: input.priority,
          created_by: ctx.userId
        })
        .select('id')
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create background job'
        });
      }

      return { jobId: data.id };
    }),

  /**
   * Get job status
   */
  getStatus: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(async ({ ctx, input }): Promise<JobStatus> => {
      const { data, error } = await ctx.supabase
        .from('background_jobs')
        .select('*')
        .eq('id', input.jobId)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found'
        });
      }

      return {
        id: data.id,
        jobType: data.job_type,
        status: data.status,
        attempts: data.attempts,
        maxAttempts: data.max_attempts,
        errorMessage: data.error_message,
        result: data.result,
        createdAt: new Date(data.created_at),
        startedAt: data.started_at ? new Date(data.started_at) : null,
        completedAt: data.completed_at ? new Date(data.completed_at) : null
      };
    }),

  /**
   * List jobs
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
        jobType: z.string().optional(),
        limit: z.number().min(1).max(100).default(50)
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('background_jobs')
        .select('id, job_type, status, attempts, created_at, started_at, completed_at')
        .order('created_at', { ascending: false })
        .limit(input.limit);

      if (input.status) {
        query = query.eq('status', input.status);
      }

      if (input.jobType) {
        query = query.eq('job_type', input.jobType);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data.map(j => ({
        id: j.id,
        jobType: j.job_type,
        status: j.status,
        attempts: j.attempts,
        createdAt: new Date(j.created_at),
        startedAt: j.started_at ? new Date(j.started_at) : null,
        completedAt: j.completed_at ? new Date(j.completed_at) : null
      }));
    }),

  /**
   * Retry failed job
   */
  retry: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('background_jobs')
        .update({
          status: 'pending',
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.jobId)
        .eq('status', 'failed');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retry job'
        });
      }

      return { success: true };
    }),

  /**
   * Get job queue stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.rpc('get_job_queue_stats');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      });
    }

    return data;
  })
});
```

---

## Update App Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/root.ts`

```typescript
import { router } from './init';
import { usersRouter } from './routers/users';
import { candidatesRouter } from './routers/candidates';
import { jobsRouter as jobPostingsRouter } from './routers/jobs'; // Rename to avoid conflict
import { studentsRouter } from './routers/students';
import { eventsRouter } from './routers/admin/events';
import { handlersRouter } from './routers/admin/handlers';

// Sprint 3 routers
import { workflowsRouter } from './routers/workflows';
import { documentsRouter } from './routers/documents';
import { filesRouter } from './routers/files';
import { emailsRouter } from './routers/emails';
import { jobsRouter as backgroundJobsRouter } from './routers/jobs';

export const appRouter = router({
  users: usersRouter,
  candidates: candidatesRouter,
  jobPostings: jobPostingsRouter,
  students: studentsRouter,

  // Sprint 3 additions
  workflows: workflowsRouter,
  documents: documentsRouter,
  files: filesRouter,
  emails: emailsRouter,
  jobs: backgroundJobsRouter,

  admin: router({
    events: eventsRouter,
    handlers: handlersRouter
  })
});

export type AppRouter = typeof appRouter;
```

---

## Error Handling

### Standard Error Responses

```typescript
// Validation error (Zod)
{
  code: 'BAD_REQUEST',
  message: 'Invalid input',
  data: {
    zodError: {
      formErrors: [],
      fieldErrors: {
        email: ['Invalid email address']
      }
    }
  }
}

// Authentication error
{
  code: 'UNAUTHORIZED',
  message: 'You must be logged in to perform this action'
}

// Permission error
{
  code: 'FORBIDDEN',
  message: 'You don\'t have permission to execute students:approve'
}

// Not found error
{
  code: 'NOT_FOUND',
  message: 'Workflow instance not found'
}

// Conflict error (optimistic locking)
{
  code: 'CONFLICT',
  message: 'Workflow was modified by another user. Please refresh and try again.'
}

// Rate limiting error
{
  code: 'TOO_MANY_REQUESTS',
  message: 'Email rate limit exceeded (100/hour)'
}

// Internal error
{
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Failed to generate document'
}
```

---

## Performance Targets

| Procedure | Target (p95) | Notes |
|-----------|--------------|-------|
| workflows.start | < 200ms | Includes DB transaction |
| workflows.transition | < 150ms | With optimistic locking check |
| workflows.getAvailableActions | < 100ms | Simple query |
| documents.generateSync | < 3s | Small PDFs only |
| documents.generate (async) | < 100ms | Job queued immediately |
| files.getUploadUrl | < 200ms | Presigned URL generation |
| emails.send | < 2s | Resend API call |
| jobs.add | < 100ms | Simple insert |

---

## Testing

### Unit Tests

```typescript
// workflows.test.ts
describe('Workflows Router', () => {
  it('starts workflow instance', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.workflows.start({
      workflowId: 'workflow-123',
      entityType: 'student',
      entityId: 'student-456'
    });

    expect(result.instanceId).toBeDefined();
    expect(result.initialState.name).toBe('application_submitted');
  });

  it('transitions workflow to next state', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.workflows.transition({
      instanceId: 'instance-123',
      action: 'schedule_assessment'
    });

    expect(result.success).toBe(true);
    expect(result.newState.name).toBe('assessment_scheduled');
  });

  it('rejects transition without permission', async () => {
    const caller = appRouter.createCaller(mockContextNoPermission);

    await expect(
      caller.workflows.transition({
        instanceId: 'instance-123',
        action: 'approve_enrollment'
      })
    ).rejects.toThrow('FORBIDDEN');
  });
});
```

### E2E Tests

```typescript
// workflows.e2e.test.ts
describe('Workflow E2E', () => {
  it('completes full student workflow', async () => {
    // 1. Start workflow
    const { instanceId } = await trpc.workflows.start.mutate({
      workflowId: studentWorkflowId,
      entityType: 'student',
      entityId: studentId
    });

    // 2. Transition through states
    await trpc.workflows.transition.mutate({
      instanceId,
      action: 'schedule_assessment'
    });

    await trpc.workflows.transition.mutate({
      instanceId,
      action: 'complete_assessment'
    });

    await trpc.workflows.transition.mutate({
      instanceId,
      action: 'approve_enrollment'
    });

    // 3. Verify final state
    const instance = await trpc.workflows.getInstance.query({ instanceId });
    expect(instance.status).toBe('completed');
    expect(instance.currentState).toBe('graduated');
  });
});
```

---

## Next Steps

1. **Developer Agent:** Implement all 5 routers
2. **Developer Agent:** Create service classes (WorkflowEngine, DocumentService, etc.)
3. **Developer Agent:** Write unit tests for each router
4. **QA Agent:** Test all procedures, error handling, permissions
5. **Deployment Agent:** Deploy updated tRPC API

---

**Status:** ✅ READY FOR IMPLEMENTATION

**Estimated Implementation Time:** 16-20 hours

---

**End of API Architecture Document**
