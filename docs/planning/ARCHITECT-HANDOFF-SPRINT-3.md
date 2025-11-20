# Architect Handoff: Sprint 3 - Workflow Engine & Core Services

**From:** Architect Agent
**To:** Developer Agent
**Sprint:** Sprint 3 (Week 5-6)
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

Sprint 3 completes the foundation by implementing:
1. **Workflow Engine** - State machines for business processes
2. **Document Generation** - PDF/DOCX generation with templates
3. **File Management** - Unified file upload/download service
4. **Email Service** - Transactional emails with Resend
5. **Background Jobs** - Async task processing with PostgreSQL queue

All systems integrate via Event Bus (Sprint 2) and follow established patterns from Sprints 1-2.

---

## 📋 Key Deliverables

| Category | Item | File Path | Status |
|----------|------|-----------|---------|
| **Documentation** | Database Design | `/docs/planning/SPRINT-3-DATABASE-DESIGN.md` | ✅ Complete |
| **Documentation** | API Architecture | `/docs/planning/SPRINT-3-API-ARCHITECTURE.md` | ✅ Complete |
| **Documentation** | Integration Design | `/docs/planning/SPRINT-3-INTEGRATION-DESIGN.md` | ✅ Complete |
| **Documentation** | Implementation Guide | `/docs/planning/SPRINT-3-IMPLEMENTATION-GUIDE.md` | ✅ Complete |
| **Documentation** | Architect Handoff | `/docs/planning/ARCHITECT-HANDOFF-SPRINT-3.md` | ✅ Complete |
| **Database** | 5 Migrations | Specifications ready | ⏳ Needs Implementation |
| **Backend** | 5 tRPC Routers | Specifications ready | ⏳ Needs Implementation |
| **Backend** | 5 Service Classes | Specifications ready | ⏳ Needs Implementation |
| **Frontend** | Workflow Admin UI | Specifications ready | ⏳ Needs Implementation |

---

## 🎯 Critical Architectural Decisions

### Decision 1: PostgreSQL-Based Job Queue (Not Redis)

**Why:** Simpler for MVP, fewer moving parts, acceptable performance for 10K jobs/month

**Implementation:**
- `background_jobs` table with SKIP LOCKED for concurrency
- Vercel Cron (every minute) processes up to 10 jobs
- Automatic retry with exponential backoff (3 attempts max)

**Performance Target:** Process 100+ jobs/hour

**Monitoring:** `get_job_queue_stats()` function for admin dashboard

**Future Migration Path:** If queue depth consistently >100, migrate to Redis (Bull)

---

### Decision 2: Optimistic Locking for Workflow Instances

**Why:** Prevent concurrent state transitions (race conditions)

**Implementation:**
- `version` column on `workflow_instances` (incremented on each transition)
- `transition_workflow()` function checks `p_expected_version`
- Frontend passes `expectedVersion` in mutation
- If mismatch, returns `CONFLICT` error with user-friendly message

**User Experience:** "Workflow was modified by another user. Please refresh and try again."

---

### Decision 3: Client-Side File Upload (Presigned URLs)

**Why:** Faster uploads, reduced server load, better UX with progress tracking

**Flow:**
1. Client calls `files.getUploadUrl` (tRPC)
2. Server generates presigned URL (valid 10 minutes)
3. Client uploads directly to Supabase Storage
4. Client calls `files.confirmUpload` to save metadata

**Security:** RLS policies enforce org isolation on Storage buckets

---

### Decision 4: Puppeteer for PDF Generation (Not External Service)

**Why:** Free for MVP, full control over templates, acceptable performance (<3s for 5-page PDF)

**Trade-off:** Resource-intensive (200MB RAM per generation)

**Mitigation:**
- Run in background jobs (not inline with API calls)
- Limit concurrent generations (max 5)
- Monitor memory usage in Vercel deployment

**Future Migration Path:** If memory issues persist, switch to external service (PDFMonkey, DocRaptor)

---

### Decision 5: Event-Driven Integration (Not Direct Calls)

**Why:** Decoupling, async processing, replay capability, audit trail

**Example:**
```typescript
// BAD: Direct call
await documentService.generateCertificate(studentId);
await emailService.sendCertificate(studentId);

// GOOD: Event-driven
await eventBus.publish('student.graduated', { studentId });
// → Handler 1: generate_certificate
// → Handler 2: send_certificate_email
```

**Benefits:**
- New handlers can be added without changing existing code
- Failed events automatically retry
- Complete audit trail in `events` table

---

## 📊 Database Schema Summary

### Tables Created

| Migration | Tables | Total Rows (Year 1) | Purpose |
|-----------|--------|---------------------|---------|
| 009 | 5 (workflows) | 600K | Workflow engine state machines |
| 010 | 2 (documents) | 50K | Document template + generated docs |
| 011 | 1 (files) | 100K | File upload metadata |
| 012 | 2 (emails) | 500K | Email templates + delivery logs |
| 013 | 1 (jobs) | 120K | Background job queue |

**Total:** 11 new tables, ~1.4M rows/year, ~565 MB storage

### Key Functions Created

| Function | Purpose | Security |
|----------|---------|----------|
| `start_workflow()` | Create workflow instance | SECURITY DEFINER |
| `transition_workflow()` | Execute state change | SECURITY DEFINER |
| `get_available_actions()` | Get valid actions for user | SECURITY DEFINER |
| `cancel_workflow()` | Cancel active workflow | SECURITY DEFINER |
| `dequeue_next_job()` | Atomic job dequeue | SKIP LOCKED for concurrency |
| `mark_job_completed()` | Mark job success | Updates status + result |
| `mark_job_failed()` | Mark job failure + retry | Auto-retry or fail permanently |
| `get_job_queue_stats()` | Job metrics | For admin dashboard |

### Critical Indexes

**Performance-critical queries:**
1. List active workflows: `idx_workflow_instances_status`
2. Get pending jobs: `idx_background_jobs_pending` (partial index)
3. Find files by entity: `idx_file_uploads_entity`
4. Email logs by status: `idx_email_logs_status`

**All indexes designed for <100ms query time at 10K+ rows**

---

## 🔌 API Summary

### tRPC Routers

| Router | Procedures | Key Operations |
|--------|-----------|----------------|
| `workflows` | 10 | start, transition, getAvailableActions, getInstance, getHistory, list, cancel, listDefinitions, getMetrics |
| `documents` | 6 | generate (async), generateSync, listTemplates, getHistory, download, previewTemplate |
| `files` | 7 | getUploadUrl, confirmUpload, deleteFile, getDownloadUrl, list |
| `emails` | 5 | send, listTemplates, getLogs, getStatus |
| `jobs` | 6 | add, getStatus, list, retry, getStats |

**Total:** 34 procedures across 5 routers

### Input Validation

**All inputs validated with Zod schemas:**
- File uploads: Max size, allowed MIME types, bucket validation
- Emails: Rate limiting (100/hour per user)
- Workflows: Permission checks before transitions
- Documents: Variable validation against template schema

---

## 🔄 Integration Points

### 1. Workflow → Document → Email

**Trigger:** Student graduates (workflow reaches `graduated` state)

**Flow:**
```
transition_workflow(action: 'graduate')
  → publish('workflow.state_changed')
    → Handler: create background job (generate_document)
      → Job Processor: generate PDF certificate
        → Upload to Supabase Storage
          → publish('document.generated')
            → Handler: send email with certificate link
```

**Timeline:** ~30 seconds (async)

### 2. File Upload → Parse → Profile Update

**Trigger:** Candidate uploads resume

**Flow:**
```
files.getUploadUrl()
  → Client uploads to Storage (direct)
    → files.confirmUpload()
      → publish('file.uploaded')
        → Handler: create background job (parse_resume)
          → Job Processor: extract skills from PDF
            → Update candidate profile
              → publish('candidate.resume_parsed')
```

**Timeline:** ~10 seconds (async)

### 3. Bulk Email → Background Jobs → Delivery Tracking

**Trigger:** Admin triggers bulk email campaign

**Flow:**
```
jobs.add(type: 'send_bulk_email')
  → Cron (every minute)
    → dequeue_next_job()
      → Job Processor: send emails in batches (10 at a time)
        → Resend API
          → Insert email_logs
            → Resend webhook
              → Update email_logs (status: 'opened')
```

**Timeline:** ~10 minutes (100 emails)

---

## ⚠️ Top 3 Technical Risks

### Risk 1: Puppeteer Memory Usage

**Likelihood:** Medium
**Impact:** High (Vercel function may run out of memory)

**Mitigation:**
- Run document generation in background jobs (not inline)
- Limit concurrent generations (max 5)
- Monitor Vercel memory usage
- Set timeout (30 seconds)

**Contingency:** Switch to external PDF service (PDFMonkey, DocRaptor)

**Cost Impact:** External service = $0.01-0.05 per PDF (~$500/year for 10K docs)

---

### Risk 2: Background Job Queue Overload

**Likelihood:** Low
**Impact:** High (delayed processing, poor UX)

**Mitigation:**
- Limit queue depth (alert if >100 pending jobs)
- Process jobs every minute (Vercel Cron)
- Auto-scale to every 30s if queue >50
- Implement job priority system

**Contingency:** Migrate to Redis-based queue (Bull)

**Implementation Time:** 4-6 hours to migrate

---

### Risk 3: Email Rate Limiting (Resend)

**Likelihood:** Medium
**Impact:** Medium (emails delayed or rejected)

**Mitigation:**
- Start with Resend free tier (3K emails/month)
- Monitor email send rate daily
- Set alert at 80% of limit
- Implement graceful degradation (queue for later)

**Contingency:** Upgrade to paid plan ($20/mo for 50K emails)

**Cost Impact:** $240/year for paid plan

---

## 🚀 Implementation Priorities

### Critical Path (Day 1-3)

1. **Database Migrations** (Day 1)
   - Apply all 5 migrations
   - Verify seed data created
   - Test RLS policies

2. **Workflow Engine** (Day 2)
   - Implement WorkflowEngine service
   - Create workflows tRPC router
   - Write unit tests

3. **Document Generation** (Day 3)
   - Implement DocumentService
   - Integrate Puppeteer
   - Test PDF generation

### Secondary Features (Day 4-7)

4. **File Management** (Day 4-5)
   - Configure Supabase Storage buckets
   - Implement FileUploadService
   - Test presigned URLs

5. **Email Service** (Day 6)
   - Setup Resend account
   - Implement EmailService
   - Configure webhook

6. **Background Jobs** (Day 7)
   - Implement JobQueue
   - Create job processors
   - Configure Vercel Cron

### Polish & Testing (Day 8-10)

7. **Workflow Admin UI** (Day 8-9)
   - Build dashboard
   - Create instance detail page
   - Add manual transition form

8. **Integration Testing** (Day 10)
   - E2E test: complete student workflow
   - E2E test: document generation → email
   - E2E test: bulk email job processing

---

## 📝 Key Implementation Notes

### For Database Work

1. **Apply migrations in sequence** (009 → 010 → 011 → 012 → 013)
2. **Verify seed data** after each migration
3. **Test RLS policies** (ensure cross-org access blocked)
4. **Create indexes** before bulk data inserts

### For Service Classes

1. **Follow established patterns** from Sprint 2 (Event Bus, Email)
2. **Use Supabase client** (NOT raw SQL) for portability
3. **Publish events** after critical operations
4. **Handle errors gracefully** with user-friendly messages

### For tRPC Routers

1. **Use Zod schemas** for ALL inputs (no `any` types)
2. **Check permissions** before mutations
3. **Return type-safe responses** (discriminated unions)
4. **Add rate limiting** for expensive operations (emails, documents)

### For Testing

1. **Write unit tests** alongside implementation (NOT after)
2. **Test RLS policies** (cross-org access blocked)
3. **Test permission checks** (unauthorized users blocked)
4. **Test error handling** (validation errors, not found, etc.)

---

## 🔍 Testing Checklist

### Unit Tests

- [ ] WorkflowEngine.startWorkflow()
- [ ] WorkflowEngine.transition() (valid + invalid)
- [ ] WorkflowEngine.getAvailableActions() (with permissions)
- [ ] DocumentService.generatePDF()
- [ ] FileUploadService.getUploadUrl()
- [ ] EmailService.sendEmail()
- [ ] JobQueue.addJob()

### Integration Tests

- [ ] Workflow transition → Event published
- [ ] Document generated → File uploaded to Storage
- [ ] Email sent → Log created
- [ ] Background job → Processor executed

### E2E Tests

- [ ] Complete student workflow (application → graduated)
- [ ] Document generation → Email with certificate
- [ ] File upload → Confirm → Download
- [ ] Bulk email job → 100 emails sent

### Security Tests

- [ ] RLS blocks cross-org access (workflows, files, emails)
- [ ] Permission check blocks unauthorized transitions
- [ ] Rate limiting blocks spam emails
- [ ] File upload validates MIME types and size

---

## 📦 Dependencies & Packages

### New Packages Required

```json
{
  "dependencies": {
    "puppeteer": "^22.0.0",
    "docx": "^9.0.0",
    "handlebars": "^4.7.8",
    "resend": "^4.0.0"
  },
  "devDependencies": {
    "@types/puppeteer": "^21.0.0",
    "@types/handlebars": "^4.1.0"
  }
}
```

### Environment Variables Required

```env
# Resend
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@intimeesolutions.com
RESEND_FROM_NAME=InTime Platform
RESEND_WEBHOOK_SECRET=whsec_xxx

# Cron
CRON_SECRET=<random-secret>
```

---

## 🎯 Success Criteria

### Functional

- [ ] All 6 user stories complete (24 story points)
- [ ] 100% of acceptance criteria met
- [ ] All 5 migrations applied successfully
- [ ] All 34 tRPC procedures implemented
- [ ] Workflow admin UI functional

### Quality

- [ ] 80%+ code coverage on critical paths
- [ ] All integration tests passing
- [ ] Zero RLS policy violations
- [ ] Zero TypeScript errors in build
- [ ] Zero API endpoints without Zod validation

### Performance

- [ ] Workflow transition < 100ms (p95)
- [ ] Document generation < 3s (small PDFs)
- [ ] File upload presigned URL < 200ms
- [ ] Email send < 2s
- [ ] Background job processing < 60s

---

## 📚 Reference Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **PM Requirements** | User stories & acceptance criteria | `/docs/planning/SPRINT-3-PM-REQUIREMENTS.md` |
| **Database Design** | Complete schema with migrations | `/docs/planning/SPRINT-3-DATABASE-DESIGN.md` |
| **API Architecture** | tRPC routers & schemas | `/docs/planning/SPRINT-3-API-ARCHITECTURE.md` |
| **Integration Design** | Event flows & integration patterns | `/docs/planning/SPRINT-3-INTEGRATION-DESIGN.md` |
| **Implementation Guide** | Step-by-step instructions | `/docs/planning/SPRINT-3-IMPLEMENTATION-GUIDE.md` |

---

## 🤝 Handoff to Developer Agent

### What You Need to Do

1. **Read all 5 planning documents** (this document references them)
2. **Apply database migrations** in sequence (009 → 013)
3. **Implement services** (WorkflowEngine, DocumentService, etc.)
4. **Implement tRPC routers** (workflows, documents, files, emails, jobs)
5. **Write tests** (unit, integration, E2E)
6. **Build Workflow Admin UI** (dashboard + detail page)
7. **Deploy to staging** and verify all features work
8. **Hand off to QA Agent** for comprehensive testing

### Estimated Timeline

- **Database Migrations:** 4 hours
- **Service Classes:** 16 hours
- **tRPC Routers:** 12 hours
- **Admin UI:** 8 hours
- **Testing:** 8 hours
- **Integration:** 4 hours
- **Bug Fixes:** 8 hours

**Total:** ~60 hours (7.5 days × 8 hours/day)

### How to Ask Questions

1. **Check documentation first** (likely already answered)
2. **Search codebase** for similar patterns (Sprints 1-2)
3. **If still stuck:** Ask specific question with context

**I've designed this to be complete - you should NOT need to ask architecture questions.**

---

## 🎉 Final Notes

Sprint 3 **completes the foundation**. After this sprint:

✅ Multi-tenancy & RBAC (Sprint 1)
✅ Event Bus & tRPC API (Sprint 2)
✅ Workflow Engine & Core Services (Sprint 3)

**Next sprints** (Epic 2+) build business modules using this foundation:
- Training Academy Module
- Recruiting Services Module
- Bench Sales Module
- Talent Acquisition Module
- Cross-Border Solutions Module

**All future modules** will use:
- Workflows for state machines
- Document generation for certificates/contracts
- File uploads for resumes/attachments
- Email service for notifications
- Background jobs for async processing

**This is the last foundation sprint. Modules start in Epic 2 (Sprint 4+).**

---

**Handoff Status:** ✅ COMPLETE

**Ready for Implementation:** YES

**Architect Availability:** Available for questions

---

**End of Architect Handoff Document**
