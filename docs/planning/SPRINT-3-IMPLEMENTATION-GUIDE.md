# Sprint 3: Implementation Guide - Workflow Engine & Core Services

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 3 (Week 5-6)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This guide provides step-by-step instructions for implementing Sprint 3's Workflow Engine and Core Services. Follow this sequence to ensure dependencies are met and integration points work correctly.

### Implementation Timeline

| Day | Focus | Deliverables |
|-----|-------|--------------|
| Day 1-2 | Workflow Engine | Database migrations, WorkflowEngine class, tRPC router |
| Day 3-4 | Document Generation | DocumentService, templates, Puppeteer integration |
| Day 5 | File Management | FileUploadService, Storage setup, presigned URLs |
| Day 6-7 | Email Service | EmailService, Resend integration, templates |
| Day 8 | Background Jobs | JobQueue, processors, Vercel Cron |
| Day 9 | Workflow Admin UI | Dashboard, instance details, manual transitions |
| Day 10 | Integration & Testing | E2E tests, integration scenarios, QA handoff |

---

## Prerequisites

### Environment Setup

1. **Install Dependencies**
   ```bash
   pnpm add puppeteer docx handlebars resend
   pnpm add -D @types/puppeteer @types/handlebars
   ```

2. **Environment Variables**
   ```env
   # Add to .env.local

   # Resend (Email)
   RESEND_API_KEY=re_xxx
   RESEND_FROM_EMAIL=noreply@intimeesolutions.com
   RESEND_FROM_NAME=InTime Platform
   RESEND_WEBHOOK_SECRET=whsec_xxx

   # Cron Security
   CRON_SECRET=<generate-random-secret>

   # Supabase Storage (already configured)
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_DB_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
   ```

3. **Verify Sprint 1 & 2 Complete**
   ```sql
   -- Check database has Sprint 1 & 2 tables
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename IN ('organizations', 'user_profiles', 'user_roles', 'events', 'event_subscriptions');

   -- Expected: All 5 tables exist

   -- Check Event Bus is running
   SELECT * FROM v_event_metrics_24h LIMIT 1;

   -- Expected: No error (view exists)
   ```

---

## Day 1-2: Workflow Engine

### Step 1: Create Database Migration 009

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/migrations/009_create_workflow_engine.sql`

1. Copy the complete migration from `SPRINT-3-DATABASE-DESIGN.md` (Migration 009 section)
2. Save to the migrations directory
3. Apply migration:
   ```bash
   # Connect to Supabase
   psql $SUPABASE_DB_URL

   # Run migration
   \i src/lib/db/migrations/009_create_workflow_engine.sql

   # Verify tables created
   \dt workflow*

   # Expected: 5 tables (workflows, workflow_states, workflow_transitions, workflow_instances, workflow_history)
   ```

4. Verify seed data:
   ```sql
   SELECT name FROM workflows;

   -- Expected:
   -- Student Lifecycle
   -- Candidate Placement
   -- Job Requisition
   ```

### Step 2: Update Drizzle Schema

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/schema/workflows.ts`

```typescript
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { userProfiles } from './user-profiles';

export const workflows = pgTable(
  'workflows',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    entityType: text('entity_type').notNull(),
    initialStateId: uuid('initial_state_id'),
    version: integer('version').notNull().default(1),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: uuid('created_by').notNull().references(() => userProfiles.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true })
  },
  (table) => ({
    orgIdIdx: index('idx_workflows_org_id').on(table.orgId),
    entityTypeIdx: index('idx_workflows_entity_type').on(table.entityType),
    activeIdx: index('idx_workflows_active').on(table.isActive),
    uniqueNamePerOrg: uniqueIndex('unique_workflow_name_per_org').on(table.orgId, table.name, table.version)
  })
);

export const workflowStates = pgTable(
  'workflow_states',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    displayName: text('display_name').notNull(),
    description: text('description'),
    stateOrder: integer('state_order').notNull(),
    isInitial: boolean('is_initial').notNull().default(false),
    isTerminal: boolean('is_terminal').notNull().default(false),
    actions: jsonb('actions').notNull().default([]),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    workflowIdIdx: index('idx_workflow_states_workflow_id').on(table.workflowId),
    terminalIdx: index('idx_workflow_states_terminal').on(table.isTerminal),
    uniqueStateName: uniqueIndex('unique_state_name_per_workflow').on(table.workflowId, table.name),
    uniqueStateOrder: uniqueIndex('unique_state_order_per_workflow').on(table.workflowId, table.stateOrder)
  })
);

export const workflowTransitions = pgTable(
  'workflow_transitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
    fromStateId: uuid('from_state_id').notNull().references(() => workflowStates.id, { onDelete: 'cascade' }),
    toStateId: uuid('to_state_id').notNull().references(() => workflowStates.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    displayName: text('display_name').notNull(),
    requiredPermission: text('required_permission'),
    conditions: jsonb('conditions').notNull().default({}),
    autoTransition: boolean('auto_transition').notNull().default(false),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    workflowIdIdx: index('idx_workflow_transitions_workflow_id').on(table.workflowId),
    fromStateIdx: index('idx_workflow_transitions_from_state').on(table.fromStateId),
    actionIdx: index('idx_workflow_transitions_action').on(table.action),
    uniqueTransition: uniqueIndex('unique_transition_action').on(table.workflowId, table.fromStateId, table.action)
  })
);

export const workflowInstances = pgTable(
  'workflow_instances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    workflowId: uuid('workflow_id').notNull().references(() => workflows.id),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    currentStateId: uuid('current_state_id').notNull().references(() => workflowStates.id),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    status: text('status').notNull().default('active'),
    metadata: jsonb('metadata').notNull().default({}),
    version: integer('version').notNull().default(0),
    createdBy: uuid('created_by').notNull().references(() => userProfiles.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    orgIdIdx: index('idx_workflow_instances_org_id').on(table.orgId),
    workflowIdIdx: index('idx_workflow_instances_workflow_id').on(table.workflowId),
    entityIdx: index('idx_workflow_instances_entity').on(table.entityType, table.entityId),
    statusIdx: index('idx_workflow_instances_status').on(table.status),
    currentStateIdx: index('idx_workflow_instances_current_state').on(table.currentStateId),
    uniqueEntityWorkflow: uniqueIndex('unique_entity_workflow').on(table.orgId, table.entityType, table.entityId, table.workflowId)
  })
);

export const workflowHistory = pgTable(
  'workflow_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workflowInstanceId: uuid('workflow_instance_id').notNull().references(() => workflowInstances.id, { onDelete: 'cascade' }),
    fromStateId: uuid('from_state_id').references(() => workflowStates.id),
    toStateId: uuid('to_state_id').notNull().references(() => workflowStates.id),
    action: text('action').notNull(),
    performedBy: uuid('performed_by').notNull().references(() => userProfiles.id),
    notes: text('notes'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    instanceIdIdx: index('idx_workflow_history_instance_id').on(table.workflowInstanceId),
    createdAtIdx: index('idx_workflow_history_created_at').on(table.createdAt),
    performedByIdx: index('idx_workflow_history_performed_by').on(table.performedBy)
  })
);

// Export types
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type WorkflowState = typeof workflowStates.$inferSelect;
export type WorkflowTransition = typeof workflowTransitions.$inferSelect;
export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type WorkflowHistoryEntry = typeof workflowHistory.$inferSelect;
```

**Update:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/schema/index.ts`

```typescript
export * from './workflows';
```

### Step 3: Implement WorkflowEngine Service

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/workflows/WorkflowEngine.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { getEventBus } from '@/lib/events/EventBus';

export interface StartWorkflowParams {
  workflowId: string;
  entityType: string;
  entityId: string;
  userId: string;
  orgId: string;
}

export interface TransitionWorkflowParams {
  instanceId: string;
  action: string;
  userId: string;
  notes?: string;
  expectedVersion?: number;
}

export class WorkflowEngine {
  private supabase = createClient();
  private eventBus = getEventBus();

  /**
   * Start a new workflow instance
   */
  async startWorkflow(params: StartWorkflowParams): Promise<string> {
    const { data, error } = await this.supabase.rpc('start_workflow', {
      p_workflow_id: params.workflowId,
      p_entity_type: params.entityType,
      p_entity_id: params.entityId,
      p_user_id: params.userId,
      p_org_id: params.orgId
    });

    if (error) {
      throw new Error(`Failed to start workflow: ${error.message}`);
    }

    return data as string;
  }

  /**
   * Transition workflow to new state
   */
  async transition(params: TransitionWorkflowParams): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('transition_workflow', {
      p_instance_id: params.instanceId,
      p_action: params.action,
      p_user_id: params.userId,
      p_notes: params.notes || null,
      p_expected_version: params.expectedVersion || null
    });

    if (error) {
      throw new Error(`Failed to transition workflow: ${error.message}`);
    }

    return data as boolean;
  }

  /**
   * Get available actions for workflow instance
   */
  async getAvailableActions(instanceId: string, userId: string) {
    const { data, error } = await this.supabase.rpc('get_available_actions', {
      p_instance_id: instanceId,
      p_user_id: userId
    });

    if (error) {
      throw new Error(`Failed to get available actions: ${error.message}`);
    }

    return data as Array<{
      action: string;
      display_name: string;
      to_state_name: string;
      required_permission: string | null;
      has_permission: boolean;
    }>;
  }

  /**
   * Cancel workflow instance
   */
  async cancel(instanceId: string, userId: string, reason: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('cancel_workflow', {
      p_instance_id: instanceId,
      p_user_id: userId,
      p_reason: reason
    });

    if (error) {
      throw new Error(`Failed to cancel workflow: ${error.message}`);
    }

    return data as boolean;
  }
}
```

### Step 4: Implement Workflows tRPC Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/workflows.ts`

Copy implementation from `SPRINT-3-API-ARCHITECTURE.md` (Section 1: Workflows Router)

### Step 5: Test Workflow Engine

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/workflows/__tests__/WorkflowEngine.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { WorkflowEngine } from '../WorkflowEngine';

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine;
  let testWorkflowId: string;
  let testUserId: string;
  let testOrgId: string;

  beforeAll(async () => {
    workflowEngine = new WorkflowEngine();

    // Get test data from database
    const { data: workflow } = await supabase
      .from('workflows')
      .select('id')
      .eq('name', 'Student Lifecycle')
      .single();

    testWorkflowId = workflow.id;

    const { data: user } = await supabase
      .from('user_profiles')
      .select('id, org_id')
      .limit(1)
      .single();

    testUserId = user.id;
    testOrgId = user.org_id;
  });

  it('starts a workflow instance', async () => {
    const instanceId = await workflowEngine.startWorkflow({
      workflowId: testWorkflowId,
      entityType: 'student',
      entityId: crypto.randomUUID(),
      userId: testUserId,
      orgId: testOrgId
    });

    expect(instanceId).toBeTruthy();
    expect(typeof instanceId).toBe('string');
  });

  it('transitions workflow to next state', async () => {
    // Start workflow
    const instanceId = await workflowEngine.startWorkflow({
      workflowId: testWorkflowId,
      entityType: 'student',
      entityId: crypto.randomUUID(),
      userId: testUserId,
      orgId: testOrgId
    });

    // Transition
    const success = await workflowEngine.transition({
      instanceId,
      action: 'schedule_assessment',
      userId: testUserId
    });

    expect(success).toBe(true);
  });

  it('gets available actions for instance', async () => {
    const instanceId = await workflowEngine.startWorkflow({
      workflowId: testWorkflowId,
      entityType: 'student',
      entityId: crypto.randomUUID(),
      userId: testUserId,
      orgId: testOrgId
    });

    const actions = await workflowEngine.getAvailableActions(instanceId, testUserId);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0]).toHaveProperty('action');
    expect(actions[0]).toHaveProperty('has_permission');
  });
});
```

Run tests:
```bash
pnpm test src/lib/workflows
```

---

## Day 3-4: Document Generation

### Step 1: Create Database Migration 010

Apply migration from `SPRINT-3-DATABASE-DESIGN.md` (Migration 010 section)

```bash
psql $SUPABASE_DB_URL < src/lib/db/migrations/010_create_document_service.sql
```

### Step 2: Implement DocumentService

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/documents/DocumentService.ts`

```typescript
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { createClient } from '@/lib/supabase/server';

export interface GeneratePDFParams {
  templateId: string;
  variables: Record<string, any>;
  orgId: string;
  options?: {
    preview?: boolean;
  };
}

export interface GeneratePDFResult {
  filePath: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export class DocumentService {
  private supabase = createClient();

  /**
   * Generate PDF from template
   */
  async generatePDF(
    templateId: string,
    variables: Record<string, any>,
    orgId: string,
    options: { preview?: boolean } = {}
  ): Promise<GeneratePDFResult> {
    // 1. Get template
    const { data: template, error: templateError } = await this.supabase
      .from('document_templates')
      .select('template_content, name')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // 2. Render template with Handlebars
    const compiledTemplate = Handlebars.compile(template.template_content);
    const html = compiledTemplate(variables);

    // 3. Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
      });

      await browser.close();

      // 4. Upload to Supabase Storage
      const timestamp = Date.now();
      const fileName = `${template.name.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      const filePath = `${orgId}/documents/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('documents')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }

      // 5. Get signed URL
      const { data: urlData } = await this.supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // 1 hour

      return {
        filePath,
        fileName,
        fileUrl: urlData!.signedUrl,
        fileSize: pdfBuffer.length
      };
    } catch (error) {
      await browser.close();
      throw error;
    }
  }
}
```

### Step 3: Implement Documents tRPC Router

Copy implementation from `SPRINT-3-API-ARCHITECTURE.md` (Section 2: Documents Router)

### Step 4: Test Document Generation

```typescript
// src/lib/documents/__tests__/DocumentService.test.ts
import { describe, it, expect } from 'vitest';
import { DocumentService } from '../DocumentService';

describe('DocumentService', () => {
  it('generates PDF from template', async () => {
    const service = new DocumentService();

    // Get test template
    const { data: template } = await supabase
      .from('document_templates')
      .select('id')
      .eq('name', 'Course Completion Certificate')
      .single();

    const result = await service.generatePDF(
      template.id,
      {
        studentName: 'John Doe',
        courseName: 'Test Course',
        completionDate: 'January 15, 2026',
        grade: 92,
        instructorName: 'Jane Smith'
      },
      testOrgId
    );

    expect(result.filePath).toContain('.pdf');
    expect(result.fileSize).toBeGreaterThan(0);
    expect(result.fileUrl).toContain('https://');
  });
});
```

---

## Day 5: File Management

### Step 1: Create Database Migration 011

Apply migration from `SPRINT-3-DATABASE-DESIGN.md` (Migration 011 section)

### Step 2: Configure Supabase Storage Buckets

1. **Go to Supabase Dashboard → Storage**
2. **Create Buckets:**
   - `avatars` (Public)
   - `resumes` (Private)
   - `documents` (Private)
   - `attachments` (Private)
   - `course-materials` (Private)

3. **Apply RLS Policies** (from `SPRINT-3-INTEGRATION-DESIGN.md` - Storage RLS Policies section)

### Step 3: Implement FileUploadService

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/files/FileUploadService.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export interface GetUploadUrlParams {
  fileName: string;
  fileSize: number;
  mimeType: string;
  bucket: 'avatars' | 'resumes' | 'documents' | 'attachments' | 'course-materials';
  entityType?: string;
  entityId?: string;
  orgId: string;
}

export class FileUploadService {
  private supabase = createClient();

  async getUploadUrl(params: GetUploadUrlParams) {
    // Generate file path
    const timestamp = Date.now();
    const sanitizedFileName = params.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${params.orgId}/${params.entityType || 'general'}/${params.entityId || 'misc'}/${timestamp}-${sanitizedFileName}`;

    // Create presigned upload URL
    const { data, error } = await this.supabase.storage
      .from(params.bucket)
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new Error(`Failed to create upload URL: ${error.message}`);
    }

    return {
      uploadUrl: data.signedUrl,
      filePath,
      token: data.token
    };
  }

  async getDownloadUrl(fileId: string, expiresIn: number = 3600) {
    const { data: file, error: fileError } = await this.supabase
      .from('file_uploads')
      .select('file_path, bucket')
      .eq('id', fileId)
      .is('deleted_at', null)
      .single();

    if (fileError || !file) {
      throw new Error('File not found');
    }

    const { data, error } = await this.supabase.storage
      .from(file.bucket)
      .createSignedUrl(file.file_path, expiresIn);

    if (error) {
      throw new Error(`Failed to create download URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}
```

### Step 4: Implement Files tRPC Router

Copy implementation from `SPRINT-3-API-ARCHITECTURE.md` (Section 3: Files Router)

---

## Day 6-7: Email Service

### Step 1: Create Database Migration 012

Apply migration from `SPRINT-3-DATABASE-DESIGN.md` (Migration 012 section)

### Step 2: Setup Resend Account

1. **Sign up at resend.com**
2. **Get API key** → Copy to `RESEND_API_KEY`
3. **Add domain** (or use resend.dev for testing)
4. **Configure webhook:**
   - URL: `https://your-app.vercel.app/api/webhooks/resend`
   - Events: `email.sent`, `email.opened`, `email.clicked`, `email.bounced`
   - Save webhook secret to `RESEND_WEBHOOK_SECRET`

### Step 3: Implement EmailService

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/emails/EmailService.ts`

```typescript
import { Resend } from 'resend';
import Handlebars from 'handlebars';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string | string[];
  templateId?: string;
  subject?: string;
  html?: string;
  variables?: Record<string, any>;
  orgId: string;
}

export class EmailService {
  private supabase = createClient();

  async sendEmail(params: SendEmailParams) {
    let subject = params.subject;
    let html = params.html;

    // If templateId provided, render template
    if (params.templateId) {
      const { data: template, error } = await this.supabase
        .from('email_templates')
        .select('subject, body_html')
        .eq('id', params.templateId)
        .single();

      if (error || !template) {
        throw new Error('Email template not found');
      }

      subject = Handlebars.compile(template.subject)(params.variables || {});
      html = Handlebars.compile(template.body_html)(params.variables || {});
    }

    if (!subject || !html) {
      throw new Error('Email subject and body required');
    }

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject,
      html
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Log email
    const { data: logData, error: logError } = await this.supabase
      .from('email_logs')
      .insert({
        org_id: params.orgId,
        template_id: params.templateId,
        to_email: Array.isArray(params.to) ? params.to[0] : params.to,
        subject,
        status: 'sent',
        resend_id: data.id,
        sent_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Failed to log email:', logError);
    }

    return {
      emailLogId: logData!.id,
      resendId: data.id,
      status: 'sent' as const
    };
  }
}
```

### Step 4: Implement Resend Webhook

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/api/webhooks/resend/route.ts`

Copy implementation from `SPRINT-3-INTEGRATION-DESIGN.md` (Resend Integration section)

### Step 5: Implement Emails tRPC Router

Copy implementation from `SPRINT-3-API-ARCHITECTURE.md` (Section 4: Emails Router)

---

## Day 8: Background Jobs

### Step 1: Create Database Migration 013

Apply migration from `SPRINT-3-DATABASE-DESIGN.md` (Migration 013 section)

### Step 2: Implement JobQueue

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/jobs/JobQueue.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export interface AddJobParams {
  jobType: 'generate_document' | 'send_bulk_email' | 'import_data';
  payload: Record<string, any>;
  priority?: number;
  orgId: string;
  userId: string;
}

export class JobQueue {
  private supabase = createClient();

  async addJob(params: AddJobParams) {
    const { data, error } = await this.supabase
      .from('background_jobs')
      .insert({
        org_id: params.orgId,
        job_type: params.jobType,
        payload: params.payload,
        priority: params.priority || 5,
        created_by: params.userId
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to add job: ${error.message}`);
    }

    return data.id;
  }

  async getJobStatus(jobId: string) {
    const { data, error } = await this.supabase
      .from('background_jobs')
      .select('status, attempts, error_message, result, completed_at')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      throw new Error('Job not found');
    }

    return data;
  }
}
```

### Step 3: Implement Job Processors

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/jobs/processors/generate-document.ts`

```typescript
import { DocumentService } from '@/lib/documents/DocumentService';
import { createClient } from '@/lib/supabase/server';
import type { BackgroundJob } from '../types';

export async function processGenerateDocument(job: BackgroundJob) {
  const { templateId, variables, entityType, entityId } = job.payload;
  const documentService = new DocumentService();

  // Generate document
  const result = await documentService.generatePDF(
    templateId,
    variables,
    job.orgId
  );

  // Save metadata
  const supabase = createClient();
  const { data, error } = await supabase
    .from('generated_documents')
    .insert({
      org_id: job.orgId,
      template_id: templateId,
      entity_type: entityType,
      entity_id: entityId,
      file_path: result.filePath,
      file_name: result.fileName,
      file_size: result.fileSize,
      mime_type: 'application/pdf',
      generated_by: job.payload.userId,
      metadata: { variables }
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save document metadata: ${error.message}`);
  }

  return {
    documentId: data.id,
    fileUrl: result.fileUrl
  };
}
```

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/jobs/processors/send-bulk-email.ts`

```typescript
import { EmailService } from '@/lib/emails/EmailService';
import type { BackgroundJob } from '../types';

export async function processSendBulkEmail(job: BackgroundJob) {
  const { templateId, recipients } = job.payload;
  const emailService = new EmailService();

  const results = { sent: 0, failed: 0 };

  // Send in batches of 10
  for (let i = 0; i < recipients.length; i += 10) {
    const batch = recipients.slice(i, i + 10);

    for (const recipient of batch) {
      try {
        await emailService.sendEmail({
          templateId,
          to: recipient.email,
          variables: recipient.variables,
          orgId: job.orgId
        });
        results.sent++;
      } catch (error) {
        results.failed++;
        console.error(`Failed to send to ${recipient.email}:`, error);
      }
    }

    // Rate limiting: wait 1 second between batches
    if (i + 10 < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
```

### Step 4: Implement Vercel Cron

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/process-jobs",
      "schedule": "* * * * *"
    }
  ]
}
```

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/api/cron/process-jobs/route.ts`

Copy implementation from `SPRINT-3-INTEGRATION-DESIGN.md` (Background Job Processing section)

### Step 5: Implement Jobs tRPC Router

Copy implementation from `SPRINT-3-API-ARCHITECTURE.md` (Section 5: Jobs Router)

### Step 6: Test Locally

```bash
# Trigger cron manually
curl http://localhost:3000/api/cron/process-jobs \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Expected: Jobs processed
```

---

## Day 9: Workflow Admin UI

### Step 1: Create Workflow Dashboard

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/admin/workflows/page.tsx`

```typescript
'use client';

import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';

export default function WorkflowDashboard() {
  const [filters, setFilters] = useState({
    status: undefined,
    entityType: undefined
  });

  const { data, isLoading } = trpc.workflows.list.useQuery(filters);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Workflow Instances</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.entityType || ''}
          onChange={(e) => setFilters({ ...filters, entityType: e.target.value || undefined })}
        >
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="candidate">Candidate</option>
          <option value="job">Job</option>
        </select>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Entity</th>
            <th>Current State</th>
            <th>Status</th>
            <th>Started</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.instances.map((instance) => (
            <tr key={instance.id}>
              <td>{instance.workflowName}</td>
              <td>{instance.entityType}</td>
              <td>{instance.currentStateDisplay}</td>
              <td>{instance.status}</td>
              <td>{new Date(instance.startedAt).toLocaleDateString()}</td>
              <td>
                <a href={`/admin/workflows/${instance.id}`}>View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Step 2: Create Instance Detail Page

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/admin/workflows/[id]/page.tsx`

```typescript
'use client';

import { trpc } from '@/lib/trpc/client';
import { use } from 'react';

export default function WorkflowInstancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: instance } = trpc.workflows.getInstance.useQuery({ instanceId: id });
  const { data: history } = trpc.workflows.getHistory.useQuery({ instanceId: id });
  const { data: actions } = trpc.workflows.getAvailableActions.useQuery({ instanceId: id });

  const transitionMutation = trpc.workflows.transition.useMutation();

  if (!instance) return <div>Loading...</div>;

  return (
    <div>
      <h1>{instance.workflowName}</h1>

      {/* Current State */}
      <div>
        <h2>Current State: {instance.currentStateDisplay}</h2>
        <p>Status: {instance.status}</p>
      </div>

      {/* Available Actions */}
      {actions && actions.length > 0 && (
        <div>
          <h2>Available Actions</h2>
          {actions.map((action) => (
            <button
              key={action.action}
              onClick={() =>
                transitionMutation.mutate({
                  instanceId: id,
                  action: action.action
                })
              }
              disabled={!action.has_permission}
            >
              {action.display_name}
            </button>
          ))}
        </div>
      )}

      {/* History Timeline */}
      <div>
        <h2>History</h2>
        {history?.map((entry) => (
          <div key={entry.id}>
            <p>
              <strong>{entry.action}</strong>: {entry.fromState || 'Start'} → {entry.toState}
            </p>
            <p>By: {entry.performedByName} at {new Date(entry.createdAt).toLocaleString()}</p>
            {entry.notes && <p>Notes: {entry.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Day 10: Integration & Testing

### E2E Test: Complete Student Workflow

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/tests/e2e/workflows.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('complete student workflow end-to-end', async ({ page }) => {
  // 1. Login as admin
  await page.goto('/login');
  await page.fill('[name=email]', 'admin@test.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');

  // 2. Navigate to workflows
  await page.goto('/admin/workflows');

  // 3. Start new student workflow
  const studentId = crypto.randomUUID();
  // ... (trigger workflow start via UI or API)

  // 4. Transition through states
  await page.click('button:has-text("Schedule Assessment")');
  await expect(page.locator('text=Assessment Scheduled')).toBeVisible();

  await page.click('button:has-text("Complete Assessment")');
  await expect(page.locator('text=Assessment Completed')).toBeVisible();

  await page.click('button:has-text("Approve Enrollment")');
  await expect(page.locator('text=Enrollment Approved')).toBeVisible();

  // 5. Verify history
  await page.click('text=History');
  await expect(page.locator('text=schedule_assessment')).toBeVisible();
  await expect(page.locator('text=complete_assessment')).toBeVisible();
  await expect(page.locator('text=approve_enrollment')).toBeVisible();
});
```

Run E2E tests:
```bash
pnpm playwright test
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All database migrations applied to staging
- [ ] All environment variables set in Vercel
- [ ] Supabase Storage buckets created and RLS configured
- [ ] Resend webhook configured
- [ ] All tests passing (unit + E2E)

### Deploy to Staging

```bash
vercel --prod=false
```

### Verify Staging

- [ ] Workflow creation works
- [ ] Workflow transitions work
- [ ] Document generation completes
- [ ] File upload works
- [ ] Email sends successfully
- [ ] Background jobs process
- [ ] Cron runs every minute

### Deploy to Production

```bash
vercel --prod
```

### Post-Deployment

- [ ] Monitor Vercel logs for errors
- [ ] Check background jobs processing
- [ ] Verify email delivery via Resend dashboard
- [ ] Test critical workflows

---

## Troubleshooting

### Issue: Puppeteer fails in Vercel

**Solution:** Use Puppeteer with `--no-sandbox` flag (already configured in DocumentService)

### Issue: Background jobs not processing

**Solution:**
1. Check Vercel Cron logs
2. Verify `CRON_SECRET` is set
3. Manually trigger: `curl /api/cron/process-jobs`

### Issue: File upload fails

**Solution:**
1. Check Supabase Storage bucket exists
2. Verify RLS policies allow upload
3. Check file size limits

### Issue: Emails not sending

**Solution:**
1. Verify `RESEND_API_KEY` is valid
2. Check Resend dashboard for errors
3. Verify domain/sender email configured

---

## Next Steps

After completing implementation:

1. **QA Agent:** Run comprehensive tests
2. **Developer Agent:** Fix any bugs found
3. **Deployment Agent:** Deploy to production
4. **Documentation:** Update API docs with new routers

---

**Status:** ✅ READY FOR IMPLEMENTATION

**Estimated Total Time:** 80 hours (10 days × 8 hours)

---

**End of Implementation Guide**
