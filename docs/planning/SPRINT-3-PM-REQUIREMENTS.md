# Sprint 3 PM Requirements: Workflow Engine & Core Services

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 3 (Week 5-6) - FINAL FOUNDATION SPRINT
**Total Story Points:** 24
**Status:** Ready for Architect Review
**Author:** PM Agent
**Date:** 2025-11-19

---

## Executive Summary

Sprint 3 **completes the foundation** by implementing core workflows and services that all 5 business pillars will depend on. While Sprints 1-2 built the infrastructure layer (database, auth, event bus, APIs), Sprint 3 builds the **application services layer** - the common patterns that accelerate module development.

### Sprint Goals

1. **Workflow Automation**: State machine engine for multi-step business processes (student onboarding, candidate placement, etc.)
2. **Document Generation**: PDF/DOCX generation for contracts, reports, certificates
3. **File Management**: Unified file upload/storage service with security
4. **Communication**: Email system with templates and background job processing
5. **Developer Tooling**: Scaffolding tools and reusable UI components

### Success Criteria

- Workflow engine handles 100+ concurrent state machines
- Documents generated in <3 seconds
- File uploads support 100MB+ files with progress tracking
- Emails sent via background jobs (no UI blocking)
- New developer can scaffold a CRUD module in <10 minutes

---

## Sprint 1 & 2 Foundation Review

### Completed Infrastructure (Available to Build On)

**Database Layer (Sprint 1):**
- ✅ Unified `user_profiles` table with multi-role support
- ✅ RBAC system (`roles`, `permissions`, `user_roles`, `role_permissions`)
- ✅ Audit logging with monthly partitioning
- ✅ Multi-tenancy (`organizations` table with `org_id` enforcement)
- ✅ Row Level Security (RLS) enabled on ALL tables
- ✅ Supabase Auth (email/password, session management)

**Communication Layer (Sprint 2):**
- ✅ Event Bus (PostgreSQL LISTEN/NOTIFY)
- ✅ Event subscription system with health monitoring
- ✅ Event history and replay functionality
- ✅ tRPC API infrastructure with type safety
- ✅ Unified error handling with Sentry
- ✅ Zod validation schemas

### Technical Constraints from Previous Sprints

1. All new tables MUST include `org_id UUID NOT NULL REFERENCES organizations(id)`
2. All tables MUST have RLS policies enabled
3. All mutable tables SHOULD include `deleted_at TIMESTAMPTZ` for soft deletes
4. All critical operations MUST be audit logged via triggers
5. Use tRPC for ALL client-server communication (no REST endpoints)
6. Use Zod schemas for ALL input validation
7. Publish events for cross-module communication (no direct calls)

---

## Story Breakdown & Priorities

### Track 1: Workflow Engine (10 Story Points)

#### FOUND-019: Build State Machine Workflow Engine (8 SP)
**Priority:** CRITICAL
**Status:** Ready for Development

**Business Value:**
Enables complex multi-step processes like:
- Student onboarding (application → assessment → enrollment → active)
- Candidate placement (sourcing → screening → interview → offer → placement)
- Client onboarding (lead → qualification → contract → active)
- Consultant lifecycle (bench → assigned → active → completed)

**Acceptance Criteria (Detailed):**

1. **Database Tables Created:**
   ```sql
   -- Workflow definitions (templates)
   CREATE TABLE workflows (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     name TEXT NOT NULL,
     description TEXT,
     entity_type TEXT NOT NULL, -- 'student', 'candidate', 'job', etc.
     initial_state TEXT NOT NULL,
     created_by UUID NOT NULL REFERENCES user_profiles(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Workflow states
   CREATE TABLE workflow_states (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     display_name TEXT NOT NULL,
     description TEXT,
     is_terminal BOOLEAN DEFAULT FALSE, -- end state?
     actions JSONB DEFAULT '[]', -- available actions from this state
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Workflow transitions (valid state changes)
   CREATE TABLE workflow_transitions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
     from_state_id UUID NOT NULL REFERENCES workflow_states(id),
     to_state_id UUID NOT NULL REFERENCES workflow_states(id),
     action TEXT NOT NULL, -- 'approve', 'reject', 'submit', etc.
     required_permission TEXT, -- e.g., 'students:approve'
     conditions JSONB DEFAULT '{}', -- conditions to allow transition
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Workflow instances (actual executions)
   CREATE TABLE workflow_instances (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     workflow_id UUID NOT NULL REFERENCES workflows(id),
     entity_type TEXT NOT NULL,
     entity_id UUID NOT NULL, -- ID of student, candidate, job, etc.
     current_state_id UUID NOT NULL REFERENCES workflow_states(id),
     started_at TIMESTAMPTZ DEFAULT NOW(),
     completed_at TIMESTAMPTZ,
     status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'failed'
     metadata JSONB DEFAULT '{}',
     created_by UUID NOT NULL REFERENCES user_profiles(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Workflow history (audit trail of state changes)
   CREATE TABLE workflow_history (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
     from_state_id UUID REFERENCES workflow_states(id),
     to_state_id UUID NOT NULL REFERENCES workflow_states(id),
     action TEXT NOT NULL,
     performed_by UUID NOT NULL REFERENCES user_profiles(id),
     notes TEXT,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **TypeScript Workflow Engine:**
   - `WorkflowEngine` class with methods:
     - `startWorkflow(workflowId, entityType, entityId)` - Create instance
     - `transitionTo(instanceId, action, userId)` - Execute state change
     - `getCurrentState(instanceId)` - Get current state
     - `getAvailableActions(instanceId, userId)` - List valid actions for user
     - `getHistory(instanceId)` - Get audit trail
     - `cancelWorkflow(instanceId, userId)` - Cancel instance
   - Permission checks before transitions (use RBAC helpers)
   - Event publishing on state changes (`workflow.state_changed`)
   - Transaction safety (rollback on failure)

3. **Predefined Workflows (Seed Data):**
   - **Student Lifecycle:**
     - States: `application_submitted` → `assessment_scheduled` → `assessment_completed` → `enrollment_approved` → `active` → `graduated` → `alumni`
     - Actions: `schedule_assessment`, `complete_assessment`, `approve_enrollment`, `graduate`
   - **Candidate Placement:**
     - States: `sourced` → `screening` → `submitted_to_client` → `interview_scheduled` → `offer_extended` → `placed` → `active`
     - Actions: `screen`, `submit`, `schedule_interview`, `extend_offer`, `place`
   - **Job Requisition:**
     - States: `draft` → `pending_approval` → `approved` → `active` → `filled` → `closed`
     - Actions: `submit_for_approval`, `approve`, `activate`, `fill`, `close`

4. **tRPC API Endpoints:**
   ```typescript
   export const workflowRouter = router({
     // Workflow management (admin)
     listWorkflows: adminProcedure.query(),
     createWorkflow: adminProcedure.input(createWorkflowSchema).mutation(),

     // Instance operations
     startWorkflow: protectedProcedure
       .input(z.object({ workflowId: z.string(), entityType: z.string(), entityId: z.string() }))
       .mutation(),

     transitionTo: protectedProcedure
       .input(z.object({ instanceId: z.string(), action: z.string(), notes: z.string().optional() }))
       .mutation(),

     getInstanceDetails: protectedProcedure
       .input(z.object({ instanceId: z.string() }))
       .query(),

     getInstanceHistory: protectedProcedure
       .input(z.object({ instanceId: z.string() }))
       .query(),

     getAvailableActions: protectedProcedure
       .input(z.object({ instanceId: z.string() }))
       .query(),
   });
   ```

5. **Performance Requirements:**
   - State transition execution: <100ms (95th percentile)
   - Support 100+ concurrent workflow instances
   - History queries indexed on `workflow_instance_id`
   - Composite index on `(entity_type, entity_id)` for lookups

6. **Event Integration:**
   - Publish events on state changes:
     ```typescript
     await eventBus.publish('workflow.state_changed', {
       instanceId,
       workflowName,
       fromState,
       toState,
       action,
       entityType,
       entityId,
       performedBy: userId,
     });
     ```
   - Example handler: Student workflow reaches `graduated` → Publish `course.graduated` event

**Technical Constraints:**
- MUST enforce permissions before transitions (use `requirePermission()`)
- MUST use database transactions for state changes
- MUST audit log ALL state transitions
- Terminal states MUST be immutable (cannot transition out)
- RLS policies MUST enforce org isolation on all tables

**Dependencies:**
- Sprint 1 RBAC system (COMPLETED)
- Sprint 2 Event Bus (COMPLETED)
- Sprint 2 tRPC infrastructure (COMPLETED)

**Testing Requirements:**
- Unit test: Valid transition succeeds
- Unit test: Invalid transition blocked
- Unit test: Permission check prevents unauthorized transition
- Integration test: State change → Event published → History recorded
- Performance test: 100 concurrent transitions complete in <5 seconds
- Security test: User in Org A cannot transition Org B's workflow

---

#### FOUND-020: Build Workflow Admin UI (2 SP)
**Priority:** HIGH
**Status:** Ready for Development

**Business Value:**
Allows admins to visualize, manage, and troubleshoot workflow instances. Critical for debugging complex multi-step processes.

**Acceptance Criteria (Detailed):**

1. **Workflow Dashboard Page (`/admin/workflows`):**
   - List all workflow instances with filters:
     - Filter by workflow type (student, candidate, job)
     - Filter by status (active, completed, cancelled)
     - Filter by date range
     - Search by entity ID or user
   - Columns: Workflow Name, Entity Type, Entity ID, Current State, Started, Last Updated, Status
   - Pagination (50 per page)
   - Click row to see details

2. **Workflow Instance Detail Modal:**
   - **Header Section:**
     - Workflow name and entity info
     - Current state (highlighted)
     - Status badge (active/completed/cancelled)
     - Started/completed timestamps
   - **State Timeline (Visual):**
     - Vertical timeline showing all state changes
     - Each state: Name, timestamp, performed by user, action taken
     - Notes/comments on each transition
   - **Available Actions Section:**
     - Buttons for valid actions from current state
     - Disabled if user lacks permission
     - Confirmation dialog before transition
   - **Metadata Panel:**
     - JSON viewer for workflow instance metadata
     - Collapsible/expandable

3. **Manual Transition Form:**
   - Select action dropdown (only valid actions shown)
   - Notes textarea (optional, max 1000 chars)
   - Confirm button
   - Success/error toast notifications

4. **Real-Time Updates (Optional Enhancement):**
   - Use Supabase real-time subscriptions to auto-refresh when instance changes
   - Show "Updated" indicator when state changes

5. **Export Functionality:**
   - Export workflow history to CSV
   - Include: timestamp, from_state, to_state, action, performed_by, notes

**Technical Constraints:**
- Admin UI MUST require `system:admin` permission
- MUST use tRPC `workflow` router (no direct database queries)
- MUST display user-friendly error messages
- Timeline MUST be sorted chronologically (oldest first)
- Action buttons MUST check permissions client-side (disable if no permission)

**Dependencies:**
- FOUND-019 (Workflow Engine) - MUST be completed first

**Testing Requirements:**
- E2E test: Admin views workflow instance
- E2E test: Admin transitions workflow to next state
- Permission test: Non-admin cannot access workflow admin page
- UI test: Timeline displays correctly with 10+ state changes

---

### Track 2: Document Generation (5 Story Points)

#### FOUND-021: Implement Document Generation Service (5 SP)
**Priority:** HIGH
**Status:** Ready for Development

**Business Value:**
Automates creation of contracts, offer letters, certificates, reports, invoices. Eliminates manual document creation (saves 2-3 hours per document). Critical for all pillars:
- **Training Academy:** Completion certificates, progress reports
- **Recruiting:** Offer letters, candidate profiles
- **Bench Sales:** Consultant resumes, placement contracts
- **Clients:** Invoices, engagement letters

**Acceptance Criteria (Detailed):**

1. **Package Installation:**
   ```json
   {
     "dependencies": {
       "puppeteer": "^22.0.0", // HTML → PDF
       "docx": "^9.0.0",       // DOCX generation
       "handlebars": "^4.7.8"  // Template engine
     }
   }
   ```

2. **Database Tables:**
   ```sql
   -- Document templates
   CREATE TABLE document_templates (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     name TEXT NOT NULL,
     description TEXT,
     template_type TEXT NOT NULL, -- 'pdf', 'docx', 'html'
     category TEXT NOT NULL, -- 'certificate', 'offer_letter', 'report', 'invoice'
     template_content TEXT NOT NULL, -- Handlebars template
     variables JSONB DEFAULT '{}', -- expected variables with descriptions
     created_by UUID NOT NULL REFERENCES user_profiles(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     deleted_at TIMESTAMPTZ
   );

   -- Generated documents (metadata)
   CREATE TABLE generated_documents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     template_id UUID NOT NULL REFERENCES document_templates(id),
     entity_type TEXT NOT NULL, -- 'student', 'candidate', 'job', etc.
     entity_id UUID NOT NULL,
     file_path TEXT NOT NULL, -- Supabase Storage path
     file_size INTEGER, -- bytes
     generated_by UUID NOT NULL REFERENCES user_profiles(id),
     generated_at TIMESTAMPTZ DEFAULT NOW(),
     metadata JSONB DEFAULT '{}'
   );
   ```

3. **Document Service (`src/lib/documents/index.ts`):**
   ```typescript
   export class DocumentService {
     async generatePDF(templateId: string, variables: Record<string, any>): Promise<{
       filePath: string;
       fileUrl: string;
       fileSize: number;
     }>;

     async generateDOCX(templateId: string, variables: Record<string, any>): Promise<{
       filePath: string;
       fileUrl: string;
       fileSize: number;
     }>;

     async getTemplate(templateId: string): Promise<DocumentTemplate>;

     async uploadToStorage(buffer: Buffer, filename: string): Promise<string>; // Supabase Storage

     async getDocumentHistory(entityType: string, entityId: string): Promise<GeneratedDocument[]>;
   }
   ```

4. **Predefined Templates (Seed Data):**
   - **Completion Certificate (PDF):**
     - Variables: `studentName`, `courseName`, `completionDate`, `grade`, `instructorName`
     - Template uses Handlebars: `{{ studentName }}` placeholders
   - **Offer Letter (DOCX):**
     - Variables: `candidateName`, `jobTitle`, `salary`, `startDate`, `companyName`
   - **Consultant Resume (PDF):**
     - Variables: `name`, `skills[]`, `experience[]`, `education[]`

5. **tRPC API Endpoints:**
   ```typescript
   export const documentsRouter = router({
     generateDocument: protectedProcedure
       .input(z.object({
         templateId: z.string(),
         variables: z.record(z.any()),
         entityType: z.string(),
         entityId: z.string(),
       }))
       .mutation(),

     listTemplates: protectedProcedure
       .input(z.object({ category: z.string().optional() }))
       .query(),

     getDocumentHistory: protectedProcedure
       .input(z.object({ entityType: z.string(), entityId: z.string() }))
       .query(),

     downloadDocument: protectedProcedure
       .input(z.object({ documentId: z.string() }))
       .query(), // Returns signed Supabase Storage URL
   });
   ```

6. **Supabase Storage Setup:**
   - Create bucket: `documents` (private)
   - RLS policy: Users can only download documents from their org
   - Folder structure: `{org_id}/{entity_type}/{entity_id}/{filename}`

7. **Performance Requirements:**
   - PDF generation: <3 seconds for 5-page document
   - DOCX generation: <2 seconds
   - File upload to Supabase Storage: <5 seconds for 10MB file
   - Template rendering: <500ms

8. **Error Handling:**
   - Invalid template variables → Return validation error with missing variables
   - Storage upload failure → Retry 3 times, then fail gracefully
   - Template not found → Return 404 with user-friendly message

**Technical Constraints:**
- MUST sanitize user inputs before rendering (prevent XSS in PDFs)
- Generated documents MUST be stored in Supabase Storage (NOT local filesystem)
- File names MUST include timestamp to prevent overwrites
- MUST use RLS on `generated_documents` table
- MUST audit log document generation (via trigger)

**Dependencies:**
- Sprint 1 database and RLS (COMPLETED)
- Sprint 2 tRPC (COMPLETED)

**Testing Requirements:**
- Unit test: Handlebars template renders correctly
- Integration test: PDF generated and uploaded to Storage
- Integration test: DOCX generated with correct formatting
- Security test: User cannot download documents from another org
- Performance test: Generate 10 PDFs concurrently in <30 seconds

---

### Track 3: File Upload & Storage (4 Story Points)

#### FOUND-022: Build File Upload Service (4 SP)
**Priority:** HIGH
**Status:** Ready for Development

**Business Value:**
Unified file upload for resumes, profile pictures, attachments, course materials, training videos. Eliminates duplicate file handling code across modules.

**Acceptance Criteria (Detailed):**

1. **Supabase Storage Buckets:**
   - Create buckets:
     - `avatars` (public) - Profile pictures
     - `resumes` (private) - Candidate resumes
     - `documents` (private) - Contracts, certificates (from FOUND-021)
     - `attachments` (private) - Generic file uploads
     - `course-materials` (private) - Training resources
   - RLS policies on each bucket (org isolation)

2. **Database Tables:**
   ```sql
   CREATE TABLE file_uploads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     bucket TEXT NOT NULL, -- 'avatars', 'resumes', etc.
     file_path TEXT NOT NULL, -- Storage path
     file_name TEXT NOT NULL, -- Original filename
     file_size INTEGER NOT NULL, -- bytes
     mime_type TEXT NOT NULL,
     entity_type TEXT, -- 'user', 'student', 'candidate', etc.
     entity_id UUID, -- ID of related entity
     uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
     uploaded_at TIMESTAMPTZ DEFAULT NOW(),
     deleted_at TIMESTAMPTZ,
     metadata JSONB DEFAULT '{}'
   );
   ```

3. **File Upload Service (`src/lib/files/index.ts`):**
   ```typescript
   export class FileUploadService {
     async uploadFile(params: {
       file: File;
       bucket: string;
       entityType?: string;
       entityId?: string;
       onProgress?: (progress: number) => void;
     }): Promise<{
       fileId: string;
       filePath: string;
       publicUrl?: string; // only for public buckets
     }>;

     async deleteFile(fileId: string, userId: string): Promise<void>; // Soft delete

     async getFileUrl(fileId: string, expiresIn?: number): Promise<string>; // Signed URL for private files

     async listFiles(params: {
       entityType?: string;
       entityId?: string;
       bucket?: string;
     }): Promise<FileUpload[]>;
   }
   ```

4. **File Upload Component (`src/components/ui/file-upload.tsx`):**
   - Drag-and-drop zone
   - File type validation (accept prop)
   - File size validation (max 100MB default, configurable)
   - Progress bar during upload
   - Preview for images
   - Error messages for validation failures
   - Multiple file upload support

5. **tRPC API Endpoints:**
   ```typescript
   export const filesRouter = router({
     uploadFile: protectedProcedure
       .input(z.object({
         fileName: z.string(),
         fileSize: z.number(),
         mimeType: z.string(),
         bucket: z.enum(['avatars', 'resumes', 'documents', 'attachments', 'course-materials']),
         entityType: z.string().optional(),
         entityId: z.string().optional(),
       }))
       .mutation(), // Returns upload URL + metadata

     deleteFile: protectedProcedure
       .input(z.object({ fileId: z.string() }))
       .mutation(),

     getFileUrl: protectedProcedure
       .input(z.object({ fileId: z.string(), expiresIn: z.number().optional() }))
       .query(),

     listFiles: protectedProcedure
       .input(z.object({
         entityType: z.string().optional(),
         entityId: z.string().optional(),
         bucket: z.string().optional(),
       }))
       .query(),
   });
   ```

6. **File Type Validation:**
   - Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` (max 10MB)
   - Documents: `.pdf`, `.doc`, `.docx`, `.txt` (max 50MB)
   - Resumes: `.pdf`, `.doc`, `.docx` (max 25MB)
   - Videos: `.mp4`, `.mov`, `.avi` (max 500MB)
   - Archives: `.zip`, `.tar`, `.gz` (max 100MB)

7. **Virus Scanning (Optional, Document for Future):**
   - Placeholder for ClamAV integration
   - Quarantine bucket for suspicious files

**Technical Constraints:**
- MUST validate file type and size on BOTH client and server
- MUST use presigned URLs for uploads (not direct client upload)
- File paths MUST include `org_id` to prevent cross-org access
- MUST use soft deletes (set `deleted_at` timestamp)
- RLS MUST enforce org isolation on `file_uploads` table
- MUST audit log file uploads and deletes

**Dependencies:**
- Sprint 1 database and RLS (COMPLETED)
- Sprint 2 tRPC (COMPLETED)

**Testing Requirements:**
- E2E test: Upload image → Preview → Success
- E2E test: Upload oversized file → Validation error
- E2E test: Upload invalid file type → Blocked
- Security test: User cannot access files from another org
- Performance test: Upload 50MB file completes in <30 seconds

---

### Track 4: Email & Background Jobs (5 Story Points)

#### FOUND-023: Implement Email Service with Resend (3 SP)
**Priority:** HIGH
**Status:** Ready for Development

**Business Value:**
Transactional emails for notifications, alerts, reports. Critical for:
- Student onboarding (welcome email, course materials)
- Candidate communications (interview invites, offer letters)
- Client updates (placement notifications)
- System alerts (password resets, 2FA codes)

**Acceptance Criteria (Detailed):**

1. **Package Installation:**
   ```json
   {
     "dependencies": {
       "resend": "^4.0.0"
     }
   }
   ```

2. **Environment Variables:**
   ```env
   RESEND_API_KEY=re_xxx
   RESEND_FROM_EMAIL=noreply@intime.com
   RESEND_FROM_NAME=InTime Platform
   ```

3. **Database Tables:**
   ```sql
   -- Email templates
   CREATE TABLE email_templates (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     name TEXT NOT NULL,
     subject TEXT NOT NULL, -- Handlebars template
     body_html TEXT NOT NULL, -- Handlebars template
     body_text TEXT, -- Plain text fallback
     category TEXT NOT NULL, -- 'transactional', 'notification', 'marketing'
     variables JSONB DEFAULT '{}', -- expected variables
     created_by UUID NOT NULL REFERENCES user_profiles(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),
     deleted_at TIMESTAMPTZ
   );

   -- Email log
   CREATE TABLE email_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     template_id UUID REFERENCES email_templates(id),
     to_email TEXT NOT NULL,
     subject TEXT NOT NULL,
     status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
     resend_id TEXT, -- Resend email ID
     error_message TEXT,
     sent_at TIMESTAMPTZ,
     opened_at TIMESTAMPTZ,
     clicked_at TIMESTAMPTZ,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **Email Service (`src/lib/email/index.ts`):**
   ```typescript
   export class EmailService {
     async sendEmail(params: {
       to: string | string[];
       templateId?: string; // OR
       subject?: string;     // Manual email
       html?: string;        // Manual email
       variables?: Record<string, any>;
     }): Promise<{
       emailLogId: string;
       resendId: string;
     }>;

     async sendBulkEmail(params: {
       templateId: string;
       recipients: Array<{ email: string; variables: Record<string, any> }>;
     }): Promise<{
       successCount: number;
       failureCount: number;
       emailLogIds: string[];
     }>;

     async getEmailStatus(emailLogId: string): Promise<{
       status: 'pending' | 'sent' | 'failed' | 'bounced';
       sentAt?: Date;
       openedAt?: Date;
       clickedAt?: Date;
     }>;
   }
   ```

5. **Predefined Email Templates (Seed Data):**
   - **Welcome Email:**
     - Subject: `Welcome to InTime, {{ firstName }}!`
     - Variables: `firstName`, `loginUrl`
   - **Password Reset:**
     - Subject: `Reset Your Password`
     - Variables: `resetUrl`, `expiresIn`
   - **Course Completion Certificate:**
     - Subject: `Congratulations on Completing {{ courseName }}!`
     - Variables: `studentName`, `courseName`, `certificateUrl`
   - **Interview Invitation:**
     - Subject: `Interview Scheduled: {{ jobTitle }}`
     - Variables: `candidateName`, `jobTitle`, `interviewDate`, `interviewTime`, `meetingLink`

6. **Resend Webhook Handler (`/api/webhooks/resend/route.ts`):**
   - Handle events: `email.sent`, `email.opened`, `email.clicked`, `email.bounced`
   - Update `email_logs` table with status
   - Publish event to event bus: `email.status_changed`

7. **tRPC API Endpoints:**
   ```typescript
   export const emailRouter = router({
     sendEmail: protectedProcedure
       .input(z.object({
         to: z.string().email().or(z.array(z.string().email())),
         templateId: z.string().optional(),
         subject: z.string().optional(),
         html: z.string().optional(),
         variables: z.record(z.any()).optional(),
       }))
       .mutation(),

     listTemplates: protectedProcedure
       .input(z.object({ category: z.string().optional() }))
       .query(),

     getEmailLogs: adminProcedure
       .input(z.object({
         toEmail: z.string().optional(),
         status: z.string().optional(),
         limit: z.number().default(50),
       }))
       .query(),
   });
   ```

8. **Rate Limiting:**
   - Max 100 emails/hour per user (prevent spam)
   - Max 1,000 emails/hour per org
   - Admin users exempt from rate limits

**Technical Constraints:**
- MUST use email templates for consistency
- MUST log ALL email sends (success and failure)
- MUST sanitize variables to prevent XSS in emails
- MUST handle bounces gracefully (mark user email as invalid)
- MUST use environment variables for Resend API key
- MUST audit log email sends for sensitive emails (password resets, offers)

**Dependencies:**
- Sprint 2 tRPC (COMPLETED)
- Sprint 2 Event Bus (for webhook events)

**Testing Requirements:**
- Unit test: Email template renders with variables
- Integration test: Email sent via Resend successfully
- Integration test: Webhook updates email log status
- Security test: Rate limiting blocks spam attempts
- E2E test: User triggers action → Email sent → Logged

---

#### FOUND-024: Build Background Job Queue (2 SP)
**Priority:** MEDIUM
**Status:** Ready for Development

**Business Value:**
Prevents UI blocking for long-running tasks (document generation, bulk emails, data imports). Improves user experience and system reliability.

**Acceptance Criteria (Detailed):**

1. **Package Installation:**
   ```json
   {
     "dependencies": {
       "bull": "^4.16.0",       // Job queue
       "ioredis": "^5.4.0"      // Redis client (if using Redis)
     }
   }
   ```

2. **Database Tables (Alternative to Redis):**
   ```sql
   -- Job queue (PostgreSQL-based, simpler for MVP)
   CREATE TABLE background_jobs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     job_type TEXT NOT NULL, -- 'generate_document', 'send_bulk_email', 'import_data'
     payload JSONB NOT NULL,
     status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
     attempts INTEGER DEFAULT 0,
     max_attempts INTEGER DEFAULT 3,
     error_message TEXT,
     created_by UUID NOT NULL REFERENCES user_profiles(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     started_at TIMESTAMPTZ,
     completed_at TIMESTAMPTZ,
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Index for processing jobs
   CREATE INDEX idx_background_jobs_pending ON background_jobs(status, created_at)
   WHERE status = 'pending';
   ```

3. **Job Queue Service (`src/lib/jobs/index.ts`):**
   ```typescript
   export class JobQueue {
     async addJob(params: {
       jobType: 'generate_document' | 'send_bulk_email' | 'import_data';
       payload: Record<string, any>;
       userId: string;
     }): Promise<{
       jobId: string;
     }>;

     async processJobs(): Promise<void>; // Background worker

     async getJobStatus(jobId: string): Promise<{
       status: 'pending' | 'processing' | 'completed' | 'failed';
       attempts: number;
       errorMessage?: string;
       completedAt?: Date;
     }>;

     async retryJob(jobId: string): Promise<void>;

     async cancelJob(jobId: string): Promise<void>;
   }
   ```

4. **Job Processors:**
   ```typescript
   // src/lib/jobs/processors/generate-document.ts
   export async function processGenerateDocument(job: BackgroundJob) {
     const { templateId, variables, entityType, entityId } = job.payload;
     const documentService = new DocumentService();
     await documentService.generatePDF(templateId, variables);
     // Publish event: document.generated
   }

   // src/lib/jobs/processors/send-bulk-email.ts
   export async function processSendBulkEmail(job: BackgroundJob) {
     const { templateId, recipients } = job.payload;
     const emailService = new EmailService();
     await emailService.sendBulkEmail({ templateId, recipients });
     // Publish event: bulk_email.completed
   }
   ```

5. **Background Worker (Cron Job):**
   - Vercel Cron: `/api/cron/process-jobs/route.ts` (runs every minute)
   - Fetches pending jobs (LIMIT 10)
   - Processes each job
   - Updates status (completed/failed)
   - Retries failed jobs (up to 3 attempts)
   - Publishes events on completion

6. **tRPC API Endpoints:**
   ```typescript
   export const jobsRouter = router({
     addJob: protectedProcedure
       .input(z.object({
         jobType: z.enum(['generate_document', 'send_bulk_email', 'import_data']),
         payload: z.record(z.any()),
       }))
       .mutation(),

     getJobStatus: protectedProcedure
       .input(z.object({ jobId: z.string() }))
       .query(),

     listJobs: protectedProcedure
       .input(z.object({
         status: z.string().optional(),
         limit: z.number().default(50),
       }))
       .query(),

     retryJob: protectedProcedure
       .input(z.object({ jobId: z.string() }))
       .mutation(),
   });
   ```

7. **Job Monitoring (Admin UI):**
   - Page: `/admin/jobs`
   - List all jobs with filters (status, type, date)
   - Retry failed jobs
   - View error messages

**Technical Constraints:**
- MUST use database-based queue (NOT Redis for MVP, to reduce infrastructure complexity)
- MUST limit concurrent job processing (max 5 concurrent jobs)
- MUST handle job failures gracefully (retry 3 times, then mark failed)
- MUST publish events on job completion
- MUST use RLS on `background_jobs` table
- Vercel Cron MUST be configured in `vercel.json`

**Dependencies:**
- Sprint 2 Event Bus (for job completion events)
- FOUND-021 (Document Service) - For document generation jobs
- FOUND-023 (Email Service) - For bulk email jobs

**Testing Requirements:**
- Unit test: Job added to queue
- Integration test: Job processed successfully
- Integration test: Failed job retried 3 times
- E2E test: Document generation job completes → Event published

---

## Cross-Cutting Concerns

### Multi-Tenancy Enforcement

**Requirement:** ALL new tables MUST include `org_id` and enforce org isolation via RLS.

**Implementation:**
```sql
-- Example: Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  -- ... other fields
);

-- RLS Policy
CREATE POLICY "Users can only access workflows in their org"
ON workflows FOR ALL
TO authenticated
USING (org_id = auth_user_org_id());
```

**Validation:**
- Database Architect will verify all new tables have `org_id`
- QA will test cross-org access is blocked

---

### Security Requirements

**Authentication:**
- All tRPC procedures MUST validate session
- Admin endpoints MUST verify `system:admin` role
- Background jobs MUST run with proper user context

**Authorization:**
- Workflow transitions MUST check permissions before execution
- File downloads MUST verify user has access to org
- Email sending MUST check rate limits

**Data Protection:**
- File uploads MUST validate file types and sizes
- Email templates MUST sanitize variables (prevent XSS)
- Generated documents MUST NOT contain sensitive data in filenames

**Audit Logging:**
- Workflow state changes MUST be audit logged
- File uploads/deletes MUST be audit logged
- Email sends MUST be logged (via `email_logs` table)
- Background job execution MUST be logged

---

### Performance Requirements

**Workflow Engine:**
- State transition execution: <100ms (95th percentile)
- Support 100+ concurrent workflow instances
- History queries: <200ms (indexed properly)

**Document Generation:**
- PDF generation: <3 seconds for 5-page document
- DOCX generation: <2 seconds
- File upload to Storage: <5 seconds for 10MB file

**File Uploads:**
- Upload 50MB file: <30 seconds
- Download signed URL generation: <100ms
- Support 1,000+ files per org

**Email Service:**
- Email send: <2 seconds
- Bulk email (100 recipients): <30 seconds
- Template rendering: <500ms

**Background Jobs:**
- Job processing: <60 seconds per job
- Queue depth: <100 pending jobs at any time
- Cron frequency: Every 1 minute

---

### Monitoring & Observability

**Workflow Engine Metrics:**
- Active workflow instances by type
- Average time spent in each state
- State transition success/failure rate
- Workflows stuck in non-terminal states >7 days

**Document Generation Metrics:**
- Documents generated per hour
- Generation time by template type
- Storage usage per org
- Failed generations by error type

**File Upload Metrics:**
- Files uploaded per hour
- Storage usage by bucket
- Upload failure rate
- Average file size

**Email Metrics:**
- Emails sent per hour
- Email delivery rate
- Email open rate
- Email bounce rate

**Background Job Metrics:**
- Jobs processed per hour
- Average job processing time
- Job failure rate by type
- Queue depth over time

**Dashboards:**
- Admin workflow monitoring (FOUND-020)
- Admin job monitoring (`/admin/jobs`)
- Email logs viewer (`/admin/emails`)

---

## Integration Points

### Workflow Engine ↔ Event Bus

**Scenario 1: Student Graduates**
1. Student workflow reaches `graduated` state
2. Workflow engine publishes `workflow.state_changed` event
3. Event handler publishes `course.graduated` event
4. Recruiting module handler auto-creates candidate profile

**Scenario 2: Candidate Placed**
1. Candidate workflow reaches `placed` state
2. Event handler publishes `candidate.placed` event
3. HR module handler creates employee record
4. Email service sends welcome email to new employee

---

### Document Generation ↔ Workflow Engine

**Scenario: Student Completes Course**
1. Student workflow reaches `graduated` state
2. Event handler triggers background job: `generate_document`
3. Job processor generates completion certificate (PDF)
4. Certificate uploaded to Supabase Storage
5. Email sent to student with certificate link

---

### File Upload ↔ Document Generation

**Scenario: Resume Upload**
1. Candidate uploads resume via file upload component
2. File stored in `resumes` bucket
3. Metadata saved to `file_uploads` table
4. Event published: `file.uploaded`
5. Background job processes resume (extract text, parse skills)

---

### Email Service ↔ Background Jobs

**Scenario: Bulk Email Campaign**
1. Admin triggers bulk email (100 recipients)
2. Background job added to queue
3. Job processor sends emails in batches (10 at a time)
4. Email logs track delivery status
5. Webhook updates logs when emails opened/clicked

---

## Non-Functional Requirements

### Reliability
- Workflow state transitions: ACID compliant (database transactions)
- Background jobs: At least once delivery (retry 3 times)
- Email delivery: Track status via Resend webhooks
- File uploads: Checksum validation (detect corruption)

### Scalability
- Workflow instances: Support 10K+ active workflows
- Background jobs: Process 100+ jobs/hour
- File uploads: Support 10GB+ storage per org
- Emails: Send 10K+ emails/day

### Maintainability
- Code coverage: 80%+ on workflow engine and document service
- Documentation: JSDoc comments on all public APIs
- Error messages: User-friendly with actionable guidance
- Logging: Structured logs for troubleshooting

### Developer Experience
- Scaffolding: Generate workflow definitions via CLI
- Type safety: Full TypeScript coverage on services
- Testing: Example tests for each service
- Examples: Seed data with realistic workflows and templates

---

## Recommended Implementation Sequence

### Week 5 (Days 1-5)

**Day 1-2: Workflow Engine Foundation**
1. Create database migrations (Migration 009)
2. Build `WorkflowEngine` class with core methods
3. Seed predefined workflows (student, candidate, job)
4. Write unit tests for state transitions

**Day 3-4: Document Generation**
1. Install packages (Puppeteer, docx, Handlebars)
2. Create database tables for templates
3. Build `DocumentService` with PDF/DOCX generation
4. Create predefined templates (certificate, offer letter)
5. Setup Supabase Storage buckets

**Day 5: File Upload Service**
1. Create database table for file uploads
2. Build `FileUploadService` with upload/download methods
3. Create Supabase Storage buckets with RLS
4. Build file upload UI component

---

### Week 6 (Days 6-10)

**Day 6-7: Email Service**
1. Install Resend package
2. Create database tables for templates and logs
3. Build `EmailService` with send/bulk methods
4. Create predefined email templates
5. Setup Resend webhook handler

**Day 8: Background Jobs**
1. Create database table for job queue
2. Build `JobQueue` service
3. Create job processors (document generation, bulk email)
4. Setup Vercel Cron for job processing

**Day 9: Workflow Admin UI**
1. Build workflow dashboard page
2. Create workflow instance detail modal
3. Implement manual state transition form
4. Add real-time updates (optional)

**Day 10: Integration & Testing**
1. Integration tests (workflow → document → email flow)
2. E2E tests (user uploads file → workflow transitions)
3. Performance testing (100 concurrent workflows)
4. Security testing (RLS, permissions, rate limits)
5. Documentation updates

---

## Testing Strategy

### Unit Tests (Services)
- Workflow engine state transitions
- Document template rendering
- File upload validation
- Email template rendering
- Background job processing

### Integration Tests
- Workflow state change → Event published
- Document generated → File uploaded to Storage
- Email sent → Status logged
- Background job → Processor executed

### End-to-End Tests
- Student completes course → Certificate generated → Email sent
- Candidate uploads resume → Workflow transitions → Email notification
- Admin triggers bulk email → Jobs processed → Emails delivered

### Performance Tests
- 100 concurrent workflow transitions in <5 seconds
- Generate 10 PDFs concurrently in <30 seconds
- Upload 10 files (50MB each) in <5 minutes
- Process 100 background jobs in <2 hours

### Security Tests
- User cannot access workflows from another org
- User cannot download files from another org
- Rate limiting blocks spam emails
- File upload validates file types and sizes

---

## Success Metrics

### Functional Metrics
- All 6 stories completed (24 story points)
- 100% of acceptance criteria met
- 80%+ code coverage on critical paths
- All integration tests passing

### Quality Metrics
- Zero RLS policy violations in testing
- Zero security vulnerabilities (file upload validation)
- Zero TypeScript errors in production build
- Zero API endpoints without Zod validation

### Performance Metrics
- Workflow state transition < 100ms (95th percentile)
- Document generation < 3 seconds
- File upload (50MB) < 30 seconds
- Email send < 2 seconds
- Background job processing < 60 seconds

### Developer Experience Metrics
- New developer can scaffold workflow in <10 minutes
- Full type inference working (no `any` types)
- Error messages actionable
- Documentation complete for all services

---

## Risks & Mitigation Strategies

### Risk 1: Document Generation Memory Usage
**Likelihood:** Medium
**Impact:** High (Puppeteer can use 200MB+ per PDF)

**Mitigation:**
- Use background jobs for document generation (not inline)
- Limit concurrent PDF generations (max 5)
- Monitor memory usage in Vercel deployment
- Consider serverless function with higher memory limit

**Fallback Plan:**
- Use external service (PDFMonkey, DocRaptor) if memory issues persist

---

### Risk 2: Background Jobs Overload Queue
**Likelihood:** Low
**Impact:** High (UI becomes unresponsive)

**Mitigation:**
- Limit queue depth (max 100 pending jobs)
- Auto-scale Vercel Cron frequency (every 30s if queue >50)
- Alert admins when queue depth >80
- Implement job priority system

**Fallback Plan:**
- Migrate to Redis-based queue (Bull) if PostgreSQL queue struggles

---

### Risk 3: Email Rate Limiting (Resend)
**Likelihood:** Medium
**Impact:** Medium (emails delayed)

**Mitigation:**
- Start with Resend free tier (3K emails/month)
- Monitor email send rate daily
- Set alert threshold at 80% of limit
- Implement graceful degradation (queue emails for later)

**Fallback Plan:**
- Upgrade to paid Resend plan ($20/mo for 50K emails)

---

### Risk 4: Workflow Engine State Corruption
**Likelihood:** Low
**Impact:** Critical (data loss)

**Mitigation:**
- Use database transactions for ALL state changes
- Add database constraint: Terminal states cannot transition
- Implement state history for audit trail
- Regular database backups (Supabase handles this)

**Prevention:**
- Code review checklist: "Are state changes wrapped in transactions?"

---

### Risk 5: File Upload Abuse (Large Files)
**Likelihood:** Medium
**Impact:** Medium (storage costs)

**Mitigation:**
- Enforce file size limits (100MB max)
- Implement storage quotas per org (10GB initially)
- Monitor storage usage daily
- Alert admins when org exceeds 80% of quota

**Fallback Plan:**
- Implement file compression for PDFs/images
- Archive old files to cheaper storage (Supabase Storage tiers)

---

## Open Questions for Architect Agent

### Question 1: Workflow Engine State Locking
**Context:** Concurrent state transitions could cause race conditions.

**Question:** Should we implement optimistic locking (version number on `workflow_instances`)?

**Recommendation:** Yes, add `version INTEGER DEFAULT 0` and increment on each transition. Reject transitions if version mismatch.

---

### Question 2: Document Generation: Puppeteer vs External Service
**Context:** Puppeteer is resource-intensive. External services cost $0.01-0.05 per PDF.

**Question:** Should we use Puppeteer (free but resource-heavy) or external service (paid but reliable)?

**Recommendation:** Start with Puppeteer for MVP. Monitor memory usage. Switch to external service if issues arise.

---

### Question 3: Background Jobs: PostgreSQL vs Redis
**Context:** PostgreSQL-based queue is simpler but may not scale as well as Redis.

**Question:** Should we use PostgreSQL queue for MVP or invest in Redis infrastructure now?

**Recommendation:** Start with PostgreSQL queue (simpler, fewer moving parts). Migrate to Redis if queue depth consistently >100.

---

### Question 4: File Upload: Client-Direct Upload vs Server Proxy
**Context:** Supabase Storage supports presigned URLs for direct client upload (faster, less server load).

**Question:** Should we upload files directly from client or proxy through server?

**Recommendation:** Use presigned URLs for client-direct upload. Server validates metadata before issuing presigned URL.

---

### Question 5: Email Templates: WYSIWYG Editor or Code-Based?
**Context:** Non-technical users may want to edit email templates.

**Question:** Should we build a WYSIWYG template editor or keep templates code-based (Handlebars)?

**Recommendation:** Keep code-based for Sprint 3 (MVP). Add WYSIWYG editor in Epic 2+ if user feedback requests it.

---

## Documentation Requirements

### For Architect Agent
- Workflow engine database schema ERD
- Document generation architecture diagram
- File upload flow diagram (client → presigned URL → Storage)
- Background job processing sequence diagram
- Email delivery flow (Resend → Webhook → Status Update)

### For Developer Agent
- Workflow engine usage guide with examples
- Document template creation guide
- File upload component integration guide
- Email service API reference
- Background job creation guide

### For QA Agent
- Workflow engine test scenarios
- Document generation test cases
- File upload security test checklist
- Email delivery test plan
- Background job reliability test suite

### For Deployment Agent
- Vercel Cron configuration steps
- Supabase Storage bucket setup
- Resend configuration and webhook setup
- Environment variables required
- Database migration sequence (Migration 009)

---

## Approval Checklist

**PM Agent (This Document):**
- [x] All acceptance criteria refined and testable
- [x] Dependencies verified against Sprint 1-2 actuals
- [x] Technical constraints documented
- [x] Risks assessed with mitigation strategies
- [x] Implementation sequence recommended
- [x] Success metrics defined

**Next Steps:**
1. Architect Agent reviews this document
2. Architect creates technical design (database schema, API contracts, component architecture)
3. Developer Agent implements based on Architect's design
4. QA Agent validates against acceptance criteria
5. Deployment Agent deploys to staging/production

---

**Document Status:** ✅ READY FOR ARCHITECT REVIEW

**Estimated Review Time:** 3-4 hours

**Expected Outputs from Architect:**
1. Database migration files (009_create_workflow_engine.sql, 010_create_document_service.sql, etc.)
2. API contract specifications (tRPC router schemas)
3. Component architecture diagrams
4. Performance optimization recommendations
5. Security review (RLS policies, file upload validation)

---

**End of Document**
