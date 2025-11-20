# Sprint 3: Integration Design - Workflow Engine & Core Services

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 3 (Week 5-6)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This document specifies how Sprint 3 services integrate with each other and with Sprint 1/2 infrastructure. All integration follows event-driven architecture using the Event Bus from Sprint 2.

### Integration Patterns

1. **Event-Driven:** All cross-service communication via Event Bus
2. **Background Processing:** Long-running tasks via Job Queue
3. **Real-Time Updates:** Supabase Realtime for UI updates
4. **File Storage:** Supabase Storage for all file operations
5. **Email Delivery:** Resend API with webhook callbacks

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SPRINT 3 INTEGRATION ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────┘

CLIENT LAYER
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Workflow UI │  │ Document UI  │  │  File Upload │  │  Email UI    │
│              │  │              │  │  Component   │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       │ tRPC            │ tRPC            │ Direct Upload   │ tRPC
       │                 │                 │ (presigned URL) │
       ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            tRPC API LAYER                               │
│  workflows router │ documents router │ files router │ emails router    │
└──────┬────────────┴──────┬───────────┴──────┬───────┴──────┬───────────┘
       │                   │                  │              │
       ▼                   ▼                  ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ Workflow   │  │ Document   │  │ File       │  │ Email      │       │
│  │ Engine     │  │ Service    │  │ Service    │  │ Service    │       │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │
│        │               │               │               │               │
│        │ publish       │ publish       │ publish       │ publish       │
│        ▼               ▼               ▼               ▼               │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                      EVENT BUS                                │     │
│  │  (PostgreSQL LISTEN/NOTIFY + Event Handlers)                 │     │
│  └──────────────────┬───────────────────────────────────────────┘     │
│                     │                                                  │
│                     │ Event Handlers Subscribe                        │
│                     ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │           BACKGROUND JOB QUEUE (PostgreSQL)                  │     │
│  │  - generate_document                                         │     │
│  │  - send_bulk_email                                           │     │
│  │  - import_data                                               │     │
│  └──────────────────┬───────────────────────────────────────────┘     │
│                     │                                                  │
│                     │ Vercel Cron (every minute)                      │
│                     ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                  JOB PROCESSORS                              │     │
│  │  process_jobs() → dequeue → execute → mark complete/failed  │     │
│  └──────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                      │                     │
                      │                     │
       ┌──────────────┴──────┐     ┌────────┴─────────┐
       ▼                     ▼     ▼                  ▼
┌─────────────┐      ┌─────────────────┐      ┌──────────────┐
│  Supabase   │      │  Supabase       │      │   Resend     │
│  Database   │      │  Storage        │      │   Email API  │
│  (PostgreSQL)│     │  (S3-compatible)│      │              │
└─────────────┘      └─────────────────┘      └──────┬───────┘
                                                      │
                                                      │ Webhooks
                                                      ▼
                                               /api/webhooks/resend
                                               (Update email_logs)
```

---

## Integration Scenarios

### Scenario 1: Student Graduates → Generate Certificate → Send Email

**Sequence:**

1. **Student completes course** (Academy Module - Future Sprint)
2. **Workflow transitions to "graduated"** state
   - `transition_workflow()` function called
   - Publishes `workflow.state_changed` event
3. **Event Handler: course.graduated**
   ```typescript
   @EventHandler('workflow.state_changed', 'handle_student_graduation')
   async function handleStudentGraduation(event: Event) {
     if (event.payload.toState === 'graduated' && event.payload.entityType === 'student') {
       // Create background job for certificate generation
       await jobQueue.addJob({
         jobType: 'generate_document',
         payload: {
           templateId: certificateTemplateId,
           variables: {
             studentName: await getStudentName(event.payload.entityId),
             courseName: await getCourseName(event.payload.entityId),
             completionDate: new Date().toLocaleDateString(),
             grade: await getStudentGrade(event.payload.entityId)
           },
           entityType: 'student',
           entityId: event.payload.entityId
         }
       });
     }
   }
   ```
4. **Background Job Processor: generate_document**
   ```typescript
   async function processGenerateDocument(job: BackgroundJob) {
     const { templateId, variables, entityType, entityId } = job.payload;

     // Generate PDF
     const document = await documentService.generatePDF(templateId, variables);

     // Upload to Supabase Storage
     const filePath = await storageService.upload(
       'documents',
       document.buffer,
       `${entityId}-certificate.pdf`
     );

     // Save metadata
     const docId = await db.generated_documents.insert({
       template_id: templateId,
       entity_type: entityType,
       entity_id: entityId,
       file_path: filePath,
       ...
     });

     // Publish event: document.generated
     await eventBus.publish('document.generated', {
       documentId: docId,
       entityType,
       entityId,
       templateId,
       fileUrl: await getSignedUrl(filePath)
     });

     return { documentId: docId };
   }
   ```
5. **Event Handler: document.generated → send_certificate_email**
   ```typescript
   @EventHandler('document.generated', 'send_certificate_email')
   async function sendCertificateEmail(event: Event) {
     const { documentId, entityId } = event.payload;

     // Get student email
     const student = await db.user_profiles.findById(entityId);

     // Send email with certificate link
     await emailService.sendEmail({
       templateId: 'course_completion_certificate',
       to: student.email,
       variables: {
         studentName: student.full_name,
         certificateUrl: event.payload.fileUrl
       }
     });
   }
   ```

**Complete Flow:**
```
Workflow Transition → workflow.state_changed event
  → Job: generate_document (background)
    → Document Generated → document.generated event
      → Send Email (via Resend)
        → Email Log Created
```

**Timeline:** ~30 seconds (document generation is async)

---

### Scenario 2: Candidate Uploads Resume → Parse Skills → Update Profile

**Sequence:**

1. **Candidate initiates file upload**
   ```typescript
   // Frontend
   const { uploadUrl, fileId } = await trpc.files.getUploadUrl.mutate({
     fileName: 'resume.pdf',
     fileSize: 1024000,
     mimeType: 'application/pdf',
     bucket: 'resumes',
     entityType: 'candidate',
     entityId: candidateId
   });
   ```
2. **Client uploads directly to Supabase Storage**
   ```typescript
   // Direct upload (no server involved)
   await fetch(uploadUrl, {
     method: 'PUT',
     body: file,
     headers: { 'Content-Type': 'application/pdf' }
   });

   // Confirm upload
   await trpc.files.confirmUpload.mutate({ fileId });
   ```
3. **File metadata saved** triggers `file.uploaded` event
   ```typescript
   // In confirmUpload mutation
   await eventBus.publish('file.uploaded', {
     fileId,
     bucket: 'resumes',
     entityType: 'candidate',
     entityId,
     mimeType: 'application/pdf'
   });
   ```
4. **Event Handler: file.uploaded → parse_resume**
   ```typescript
   @EventHandler('file.uploaded', 'parse_resume')
   async function parseResume(event: Event) {
     if (event.payload.bucket !== 'resumes') return;

     // Create background job for parsing (CPU-intensive)
     await jobQueue.addJob({
       jobType: 'parse_resume',
       payload: {
         fileId: event.payload.fileId,
         candidateId: event.payload.entityId
       }
     });
   }
   ```
5. **Background Job: parse_resume**
   ```typescript
   async function processParseResume(job: BackgroundJob) {
     const { fileId, candidateId } = job.payload;

     // Download file from Storage
     const file = await storageService.download(fileId);

     // Parse PDF (extract text)
     const text = await pdfParse(file);

     // Extract skills (simple keyword matching for MVP)
     const skills = extractSkills(text);

     // Update candidate profile
     await db.user_profiles.update(candidateId, {
       candidate_skills: skills,
       resume_parsed_at: new Date()
     });

     // Publish event
     await eventBus.publish('candidate.resume_parsed', {
       candidateId,
       skills,
       fileId
     });

     return { skills };
   }
   ```

**Complete Flow:**
```
Client Upload → Supabase Storage (direct)
  → confirmUpload → file.uploaded event
    → Job: parse_resume (background)
      → Profile Updated → candidate.resume_parsed event
```

**Timeline:** ~10 seconds (async parsing)

---

### Scenario 3: Bulk Email Campaign → Background Jobs → Delivery Tracking

**Sequence:**

1. **Admin triggers bulk email**
   ```typescript
   // Admin UI
   await trpc.jobs.add.mutate({
     jobType: 'send_bulk_email',
     payload: {
       templateId: 'monthly_newsletter',
       recipients: [
         { email: 'user1@example.com', variables: { name: 'John' } },
         { email: 'user2@example.com', variables: { name: 'Jane' } },
         // ... 100 recipients
       ]
     },
     priority: 5
   });
   ```
2. **Background Job Processor: send_bulk_email**
   ```typescript
   async function processSendBulkEmail(job: BackgroundJob) {
     const { templateId, recipients } = job.payload;

     const results = { sent: 0, failed: 0 };

     // Send in batches of 10 (Resend rate limit)
     for (const batch of chunk(recipients, 10)) {
       for (const recipient of batch) {
         try {
           await emailService.sendEmail({
             templateId,
             to: recipient.email,
             variables: recipient.variables
           });
           results.sent++;
         } catch (error) {
           results.failed++;
           console.error(`Failed to send to ${recipient.email}:`, error);
         }
       }

       // Wait 1 second between batches (rate limiting)
       await sleep(1000);
     }

     // Publish completion event
     await eventBus.publish('bulk_email.completed', {
       templateId,
       totalRecipients: recipients.length,
       sent: results.sent,
       failed: results.failed
     });

     return results;
   }
   ```
3. **Email Delivery (Resend)**
   ```typescript
   async function sendEmail(params) {
     const resend = new Resend(process.env.RESEND_API_KEY);

     const { data, error } = await resend.emails.send({
       from: 'InTime <noreply@intimeesolutions.com>',
       to: params.to,
       subject: renderTemplate(params.subject, params.variables),
       html: renderTemplate(params.html, params.variables)
     });

     if (error) throw error;

     // Log email
     await db.email_logs.insert({
       template_id: params.templateId,
       to_email: params.to,
       subject: params.subject,
       status: 'sent',
       resend_id: data.id,
       sent_at: new Date()
     });

     return { emailLogId: logId, resendId: data.id };
   }
   ```
4. **Resend Webhook: Email Opened**
   ```typescript
   // /api/webhooks/resend/route.ts
   export async function POST(request: Request) {
     const payload = await request.json();

     if (payload.type === 'email.opened') {
       await db.email_logs.update(
         { resend_id: payload.data.email_id },
         { status: 'opened', opened_at: new Date(payload.created_at) }
       );

       // Publish event
       await eventBus.publish('email.opened', {
         emailId: payload.data.email_id,
         openedAt: payload.created_at
       });
     }

     return new Response('OK', { status: 200 });
   }
   ```

**Complete Flow:**
```
Add Job → Job Queue
  → Cron Processor (every minute)
    → Send emails in batches
      → Resend API
        → Webhook: email.opened
          → Update email_logs
            → email.opened event
```

**Timeline:** ~10 minutes (100 emails, batched)

---

### Scenario 4: Job Posting Approved → Notify Recruiters → Auto-Match Candidates

**Sequence:**

1. **Manager approves job posting**
   ```typescript
   await trpc.workflows.transition.mutate({
     instanceId: jobWorkflowInstanceId,
     action: 'approve'
   });
   ```
2. **Workflow publishes `workflow.state_changed` event**
3. **Event Handler: job_approved → notify_recruiters**
   ```typescript
   @EventHandler('workflow.state_changed', 'notify_recruiters_job_approved')
   async function notifyRecruiters(event: Event) {
     if (event.payload.toState === 'approved' && event.payload.entityType === 'job') {
       // Get job details
       const job = await db.jobs.findById(event.payload.entityId);

       // Find recruiters in same org
       const recruiters = await db.user_profiles.find({
         org_id: job.org_id,
         user_roles: { some: { role: { name: 'recruiter' } } }
       });

       // Send email to each recruiter
       for (const recruiter of recruiters) {
         await emailService.sendEmail({
           templateId: 'new_job_approved',
           to: recruiter.email,
           variables: {
             recruiterName: recruiter.full_name,
             jobTitle: job.title,
             jobUrl: `https://app.intime.com/jobs/${job.id}`
           }
         });
       }
     }
   }
   ```
4. **Event Handler: job_approved → auto_match_candidates (Future)**
   ```typescript
   @EventHandler('workflow.state_changed', 'auto_match_candidates')
   async function autoMatchCandidates(event: Event) {
     if (event.payload.toState === 'approved' && event.payload.entityType === 'job') {
       // Create background job for matching (CPU-intensive)
       await jobQueue.addJob({
         jobType: 'match_candidates',
         payload: {
           jobId: event.payload.entityId
         }
       });
     }
   }
   ```

**Complete Flow:**
```
Workflow Transition → workflow.state_changed event
  → Handler: notify_recruiters (sends emails)
  → Handler: auto_match_candidates (background job)
```

---

## Event Catalog

### Workflow Events

| Event Type | Payload | Published By | Consumed By |
|-----------|---------|--------------|-------------|
| `workflow.started` | `{ instanceId, workflowId, entityType, entityId }` | `start_workflow()` | Audit log |
| `workflow.state_changed` | `{ instanceId, workflowId, fromState, toState, action, entityType, entityId }` | `transition_workflow()` | Multiple handlers |
| `workflow.cancelled` | `{ instanceId, reason }` | `cancel_workflow()` | Audit log |

### Document Events

| Event Type | Payload | Published By | Consumed By |
|-----------|---------|--------------|-------------|
| `document.generated` | `{ documentId, templateId, entityType, entityId, fileUrl }` | DocumentService | Email handlers |
| `document.download_requested` | `{ documentId, userId }` | download() API | Analytics |

### File Events

| Event Type | Payload | Published By | Consumed By |
|-----------|---------|--------------|-------------|
| `file.uploaded` | `{ fileId, bucket, entityType, entityId, mimeType }` | confirmUpload() | Resume parser, virus scan |
| `file.deleted` | `{ fileId }` | deleteFile() | Cleanup jobs |

### Email Events

| Event Type | Payload | Published By | Consumed By |
|-----------|---------|--------------|-------------|
| `email.sent` | `{ emailLogId, toEmail, templateId }` | EmailService | Analytics |
| `email.opened` | `{ emailId, openedAt }` | Resend webhook | Analytics |
| `email.clicked` | `{ emailId, clickedAt, linkUrl }` | Resend webhook | Analytics |
| `email.bounced` | `{ emailId, reason }` | Resend webhook | User profile update |

### Job Queue Events

| Event Type | Payload | Published By | Consumed By |
|-----------|---------|--------------|-------------|
| `job.completed` | `{ jobId, jobType, result }` | Job processor | UI notifications |
| `job.failed` | `{ jobId, jobType, error }` | Job processor | Admin alerts |
| `bulk_email.completed` | `{ templateId, sent, failed }` | Bulk email processor | Admin dashboard |

---

## Background Job Processing

### Vercel Cron Configuration

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

### Cron Handler

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/api/cron/process-jobs/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processGenerateDocument } from '@/lib/jobs/processors/generate-document';
import { processSendBulkEmail } from '@/lib/jobs/processors/send-bulk-email';
import { processImportData } from '@/lib/jobs/processors/import-data';

const JOB_PROCESSORS = {
  generate_document: processGenerateDocument,
  send_bulk_email: processSendBulkEmail,
  import_data: processImportData
};

export async function GET(request: Request) {
  // Verify cron secret (security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient();
  const processed = { completed: 0, failed: 0 };

  try {
    // Process up to 10 jobs per cron run
    for (let i = 0; i < 10; i++) {
      // Dequeue next job (atomic operation)
      const { data: job, error } = await supabase.rpc('dequeue_next_job');

      if (error || !job || job.length === 0) {
        break; // No more jobs
      }

      const jobData = job[0];
      const processor = JOB_PROCESSORS[jobData.job_type];

      if (!processor) {
        console.error(`No processor for job type: ${jobData.job_type}`);
        await supabase.rpc('mark_job_failed', {
          p_job_id: jobData.job_id,
          p_error_message: `Unknown job type: ${jobData.job_type}`
        });
        processed.failed++;
        continue;
      }

      try {
        // Execute job processor
        const result = await processor({
          id: jobData.job_id,
          type: jobData.job_type,
          payload: jobData.payload,
          orgId: jobData.org_id
        });

        // Mark completed
        await supabase.rpc('mark_job_completed', {
          p_job_id: jobData.job_id,
          p_result: result
        });

        processed.completed++;
      } catch (error: any) {
        console.error(`Job ${jobData.job_id} failed:`, error);

        // Mark failed (will retry if attempts < max_attempts)
        await supabase.rpc('mark_job_failed', {
          p_job_id: jobData.job_id,
          p_error_message: error.message
        });

        processed.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed
    });
  } catch (error: any) {
    console.error('Cron job processing failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Supabase Storage Integration

### Bucket Configuration

**Buckets to Create (via Supabase Dashboard):**

1. **avatars** (Public)
   - Max file size: 10MB
   - Allowed MIME types: `image/*`
   - RLS: Public read, authenticated write

2. **resumes** (Private)
   - Max file size: 25MB
   - Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - RLS: Org isolation

3. **documents** (Private)
   - Max file size: 50MB
   - Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - RLS: Org isolation

4. **attachments** (Private)
   - Max file size: 100MB
   - Allowed MIME types: `application/pdf`, `image/*`, `application/zip`
   - RLS: Org isolation

5. **course-materials** (Private)
   - Max file size: 500MB
   - Allowed MIME types: `application/pdf`, `video/mp4`, `application/zip`
   - RLS: Org isolation

### Storage RLS Policies

```sql
-- avatars bucket (public read)
CREATE POLICY "Public avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- resumes bucket (org isolation)
CREATE POLICY "Users can access resumes in their org"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth_user_org_id()::text
  );

CREATE POLICY "Users can upload resumes to their org"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth_user_org_id()::text
  );

-- documents bucket (org isolation)
CREATE POLICY "Users can access documents in their org"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth_user_org_id()::text
  );

-- Service role can write documents (for document generation)
CREATE POLICY "Service role can write documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');
```

---

## Resend Integration

### Webhook Setup

**Resend Dashboard Configuration:**
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/resend`
3. Select events: `email.sent`, `email.opened`, `email.clicked`, `email.bounced`
4. Save webhook secret to `RESEND_WEBHOOK_SECRET` env var

**Webhook Handler:**

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/api/webhooks/resend/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { eventBus } from '@/lib/events/EventBus';

export async function POST(request: Request) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('svix-signature');
    const payload = await request.text();

    // TODO: Verify signature using Resend webhook secret
    // if (!verifyWebhookSignature(payload, signature, process.env.RESEND_WEBHOOK_SECRET)) {
    //   return new NextResponse('Invalid signature', { status: 401 });
    // }

    const event = JSON.parse(payload);
    const supabase = createClient();

    switch (event.type) {
      case 'email.sent':
        await supabase
          .from('email_logs')
          .update({
            status: 'sent',
            sent_at: new Date(event.created_at).toISOString()
          })
          .eq('resend_id', event.data.email_id);
        break;

      case 'email.opened':
        await supabase
          .from('email_logs')
          .update({
            status: 'opened',
            opened_at: new Date(event.created_at).toISOString()
          })
          .eq('resend_id', event.data.email_id);

        await eventBus.publish('email.opened', {
          emailId: event.data.email_id,
          openedAt: event.created_at
        });
        break;

      case 'email.clicked':
        await supabase
          .from('email_logs')
          .update({
            status: 'clicked',
            clicked_at: new Date(event.created_at).toISOString()
          })
          .eq('resend_id', event.data.email_id);

        await eventBus.publish('email.clicked', {
          emailId: event.data.email_id,
          clickedAt: event.created_at,
          linkUrl: event.data.link
        });
        break;

      case 'email.bounced':
        await supabase
          .from('email_logs')
          .update({
            status: 'bounced',
            error_message: event.data.bounce_type
          })
          .eq('resend_id', event.data.email_id);

        await eventBus.publish('email.bounced', {
          emailId: event.data.email_id,
          reason: event.data.bounce_type
        });
        break;
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('Resend webhook error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
```

---

## Real-Time Updates (Supabase Realtime)

### Workflow Instance Updates

```typescript
// Frontend: Subscribe to workflow instance changes
const { data: instance } = trpc.workflows.getInstance.useQuery({ instanceId });

useEffect(() => {
  const channel = supabase
    .channel(`workflow:${instanceId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'workflow_instances',
        filter: `id=eq.${instanceId}`
      },
      (payload) => {
        // Refetch instance data
        queryClient.invalidateQueries(['workflows.getInstance', { instanceId }]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [instanceId]);
```

### Job Progress Updates

```typescript
// Frontend: Poll job status every 2 seconds
const { data: job, refetch } = trpc.jobs.getStatus.useQuery(
  { jobId },
  { refetchInterval: job?.status === 'processing' ? 2000 : false }
);

if (job?.status === 'completed') {
  toast.success('Document generated successfully!');
}
```

---

## Error Handling & Retries

### Event Handler Failures

```typescript
// Automatic retry with exponential backoff (handled by Event Bus)
@EventHandler('workflow.state_changed', 'notify_stakeholders')
async function notifyStakeholders(event: Event) {
  // If this throws, Event Bus will:
  // 1. Mark event as failed
  // 2. Retry after 2 minutes (1st failure)
  // 3. Retry after 4 minutes (2nd failure)
  // 4. Retry after 8 minutes (3rd failure)
  // 5. Move to dead letter queue (4th failure)

  await sendNotifications(event.payload);
}
```

### Background Job Failures

```typescript
// Job processor failures are retried automatically
async function processGenerateDocument(job: BackgroundJob) {
  try {
    // Attempt document generation
    const result = await documentService.generatePDF(...);
    return result;
  } catch (error) {
    // This error is caught by cron processor
    // Job will be retried (up to max_attempts)
    throw error;
  }
}
```

### Circuit Breaker for External APIs

```typescript
// Resend API circuit breaker
class ResendCircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private isOpen = false;

  async send(email: Email) {
    if (this.isOpen) {
      // Circuit is open, wait 5 minutes before retry
      if (Date.now() - this.lastFailure!.getTime() < 300000) {
        throw new Error('Circuit breaker is open');
      }
      this.isOpen = false; // Try again
    }

    try {
      const result = await resend.emails.send(email);
      this.failures = 0; // Reset on success
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = new Date();

      if (this.failures >= 5) {
        this.isOpen = true;
        console.error('Circuit breaker opened after 5 failures');
      }

      throw error;
    }
  }
}
```

---

## Performance Optimization

### Database Connection Pooling

```typescript
// Shared connection pool for all services
import { Pool } from 'pg';

export const dbPool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 20, // Maximum 20 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Use pool in services
export class WorkflowEngine {
  private pool = dbPool; // Reuse shared pool
}
```

### File Upload Optimization

```typescript
// Client-side chunked upload for large files
async function uploadLargeFile(file: File, uploadUrl: string) {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  const chunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    await fetch(uploadUrl, {
      method: 'PUT',
      body: chunk,
      headers: {
        'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
      }
    });

    onProgress((i + 1) / chunks * 100);
  }
}
```

### Event Bus Batching (Future Optimization)

```typescript
// Batch multiple events into single NOTIFY
class EventBus {
  private pendingEvents: Event[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  async publish(eventType: string, payload: any) {
    this.pendingEvents.push({ eventType, payload });

    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 100); // 100ms debounce
    }

    if (this.pendingEvents.length >= 10) {
      await this.flush(); // Flush immediately if 10 events queued
    }
  }

  private async flush() {
    if (this.pendingEvents.length === 0) return;

    // Batch insert all events
    await this.pool.query(
      'INSERT INTO events (event_type, payload) SELECT * FROM unnest($1, $2)',
      [
        this.pendingEvents.map(e => e.eventType),
        this.pendingEvents.map(e => JSON.stringify(e.payload))
      ]
    );

    this.pendingEvents = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
```

---

## Testing Integration

### Integration Test Example

```typescript
// Test: Workflow transition triggers document generation
describe('Workflow → Document Integration', () => {
  it('generates certificate when student graduates', async () => {
    // 1. Start student workflow
    const { instanceId } = await workflowEngine.start({
      workflowId: studentWorkflowId,
      entityType: 'student',
      entityId: studentId
    });

    // 2. Transition to graduated state
    await workflowEngine.transition({
      instanceId,
      action: 'graduate'
    });

    // 3. Wait for event propagation
    await sleep(1000);

    // 4. Verify background job created
    const jobs = await db.background_jobs.find({
      job_type: 'generate_document',
      payload: { entityId: studentId }
    });
    expect(jobs.length).toBe(1);

    // 5. Process job manually (simulate cron)
    await processGenerateDocument(jobs[0]);

    // 6. Verify document created
    const docs = await db.generated_documents.find({
      entity_id: studentId,
      entity_type: 'student'
    });
    expect(docs.length).toBe(1);
    expect(docs[0].file_path).toContain('certificate.pdf');
  });
});
```

---

## Monitoring & Observability

### Key Metrics to Track

1. **Event Processing:**
   - Events published per hour
   - Event processing latency (p50, p95, p99)
   - Event handler failure rate

2. **Background Jobs:**
   - Jobs queued per hour
   - Job processing time by type
   - Job failure rate
   - Queue depth over time

3. **Document Generation:**
   - Documents generated per hour
   - Generation time by template
   - Storage usage per org

4. **Email Delivery:**
   - Emails sent per hour
   - Email delivery rate
   - Email open rate
   - Email bounce rate

5. **File Uploads:**
   - Files uploaded per hour
   - Upload failure rate
   - Storage usage by bucket

### Monitoring Dashboards

```sql
-- Event processing metrics (last 24 hours)
SELECT * FROM v_event_metrics_24h;

-- Job queue health
SELECT * FROM get_job_queue_stats();

-- Storage usage by org
SELECT
  org_id,
  SUM(file_size) AS total_bytes,
  COUNT(*) AS file_count
FROM file_uploads
WHERE deleted_at IS NULL
GROUP BY org_id
ORDER BY total_bytes DESC;

-- Email delivery stats
SELECT
  status,
  COUNT(*) AS count,
  ROUND(AVG(EXTRACT(EPOCH FROM (sent_at - created_at))), 2) AS avg_send_seconds
FROM email_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

---

## Next Steps

1. **Developer Agent:** Implement event handlers for each integration scenario
2. **Developer Agent:** Create background job processors
3. **Developer Agent:** Configure Supabase Storage buckets and RLS
4. **Developer Agent:** Set up Resend webhook endpoint
5. **Developer Agent:** Configure Vercel Cron
6. **QA Agent:** Test all integration scenarios end-to-end
7. **Deployment Agent:** Deploy with monitoring enabled

---

**Status:** ✅ READY FOR IMPLEMENTATION

**Estimated Implementation Time:** 12-16 hours

---

**End of Integration Design Document**
