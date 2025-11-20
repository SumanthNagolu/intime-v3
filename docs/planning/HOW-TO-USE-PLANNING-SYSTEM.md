# How to Use the Planning System

**Last Updated:** 2025-11-20
**For:** Developers, Product Managers, Project Managers

---

## 🎯 Quick Start

You want to build a new feature. Here's the complete workflow:

```bash
# Stage 1: Define what you're building (business value)
/workflows:define-feature [Feature-Name]

# Stage 2: Break it into major components
/workflows:create-epics [Feature-Name]

# Stage 3: Break each component into tasks
/workflows:create-stories [epic-id]

# Stage 4: Plan when to build (2-week sprints)
/workflows:plan-sprint [sprint-number] [epic-id]

# Stage 5: Execute each task
/workflows:feature [story-id]
```

---

## 📚 Complete Example: Building "Candidate Pipeline Automation"

### Stage 1: Define Feature

**You Run:**
```bash
/workflows:define-feature Candidate-Pipeline-Automation
```

**PM Agent Asks You:**
```
What business problem does this solve?
Who are the primary users?
What does success look like?
What's the expected ROI?
```

**You Answer:**
```
Problem: Recruiters spend 20 hours/week on manual candidate workflows
Users: Recruiters and Candidates
Success: 75% reduction in manual work (20h → 5h per week)
ROI: $130K/year savings (2.5 recruiters × $50K salary)
```

**PM Agent Creates:**

`docs/planning/features/candidate-pipeline-automation.md`:
```markdown
# Feature: Candidate Pipeline Automation

## Business Value
Reduce recruiter manual work from 20h/week to 5h/week (75% reduction)

## ROI
- Current cost: $130K/year (2.5 FTE × $50K)
- AI cost: $2K/year
- Savings: $128K/year (64x ROI)

## Target Users
- Primary: Recruiters (sourcing, screening, scheduling)
- Secondary: Candidates (status updates, self-service)

## Success Metrics
- Time saved: 75% reduction (20h → 5h)
- Candidate satisfaction: 4.5+ stars
- Auto-qualification accuracy: 85%+

## Proposed Epics
1. Resume Parsing & Enrichment
2. Auto-Qualification Engine
3. Interview Scheduling Automation
4. Candidate Communication System
```

---

### Stage 2: Create Epics

**You Run:**
```bash
/workflows:create-epics Candidate-Pipeline-Automation
```

**PM Agent Creates:** 4 epic files

**Epic 1:** `docs/planning/epics/epic-4.1-resume-parsing.md`
```markdown
# Epic 4.1: Resume Parsing & Enrichment

## Scope
Extract structured data from resumes and enrich with public profile data

## Timeline
4-6 weeks (2-3 sprints)

## Business Value
- Eliminate 3 hours/week manual data entry per recruiter
- 95%+ parsing accuracy vs. 60% manual entry accuracy

## Stories (High-Level)
1. PDF/DOCX resume upload
2. AI-powered data extraction
3. LinkedIn profile enrichment
4. Candidate profile creation
5. Duplicate detection

## Success Metrics
- Parsing accuracy: 95%+ (validated on 100 resumes)
- Processing time: <10 seconds per resume
- Duplicate detection: 98%+ precision

## Dependencies
- Requires: Epic 01 (Foundation) - user_profiles table
- Enables: Epic 4.2 (Auto-Qualification) - needs parsed candidate data
```

**Epic 2:** `docs/planning/epics/epic-4.2-auto-qualification.md`
```markdown
# Epic 4.2: Auto-Qualification Engine

## Scope
AI evaluates candidate fit for requisitions (skills, experience, availability)

## Timeline
6-8 weeks (3-4 sprints)

## Business Value
- Reduce screening time from 10 hours/week to 2 hours/week per recruiter
- 85%+ qualification accuracy (vs. 70% manual screening)

## Stories (High-Level)
1. Job requirement extraction
2. Candidate-job semantic matching
3. AI qualification scoring
4. Auto-rejection with explanation
5. Shortlist generation

## Success Metrics
- Qualification accuracy: 85%+ (recruiter feedback)
- False negatives: <5% (don't reject good candidates)
- Processing time: <5 seconds per candidate-job pair

## Dependencies
- Requires: Epic 4.1 (Resume Parsing) - candidate profiles
- Requires: Epic 2.5 (AI Infrastructure) - RAG + embeddings
```

**Epic 3:** `docs/planning/epics/epic-4.3-interview-scheduling.md`

**Epic 4:** `docs/planning/epics/epic-4.4-candidate-communication.md`

---

### Stage 3: Create Stories

Let's break down Epic 4.1 into stories:

**You Run:**
```bash
/workflows:create-stories epic-4.1-resume-parsing
```

**PM Agent Creates:** Story files

`docs/planning/stories/epic-4.1-resume-parsing/README.md`:
```markdown
# Epic 4.1: Resume Parsing & Enrichment

## Overview
5 stories, 28 total story points, estimated 2-3 sprints

## Stories
- PARSE-001: Resume Upload & Storage (5 points)
- PARSE-002: AI Data Extraction (8 points)
- PARSE-003: LinkedIn Enrichment (5 points)
- PARSE-004: Profile Creation (5 points)
- PARSE-005: Duplicate Detection (5 points)

## Dependency Order
PARSE-001 (upload) → PARSE-002 (extraction) → PARSE-003 (enrichment) → PARSE-004 (profile) → PARSE-005 (dedup)
```

**Story 1:** `docs/planning/stories/epic-4.1-resume-parsing/PARSE-001-resume-upload.md`
```markdown
# PARSE-001: Resume Upload & Storage

**Epic:** Epic 4.1 - Resume Parsing & Enrichment
**Story Points:** 5
**Priority:** CRITICAL (blocks all other stories)
**Sprint:** Sprint 7 (planned)
**Dependencies:** None (foundation story)

## User Story

**As a** Recruiter
**I want to** upload candidate resumes (PDF/DOCX)
**So that** the system can parse and store them for processing

## Acceptance Criteria

1. ✅ Resume upload via drag-and-drop or file picker
   - Supported formats: PDF, DOCX, DOC
   - Max file size: 5MB
   - Multiple file upload (up to 10 at once)

2. ✅ File validation
   - Check file type (reject unsupported formats)
   - Check file size (reject >5MB)
   - Virus scanning (ClamAV integration)

3. ✅ Supabase Storage integration
   - Upload to `candidate-resumes` bucket
   - Generate signed URL (60s expiry for processing)
   - RLS: Only recruiters can upload/read

4. ✅ Database record creation
   - Create `resume_uploads` table entry
   - Store metadata: filename, size, upload_date, uploader_id
   - Status: pending_processing

5. ✅ Error handling
   - Invalid format: "Only PDF and DOCX files are supported"
   - File too large: "Max file size is 5MB"
   - Upload failed: "Please try again"

## Technical Design

### API Contract

**POST /api/recruiting/resumes/upload**

Request:
```typescript
{
  files: File[]; // Max 10 files
}
```

Response:
```typescript
{
  success: true;
  data: {
    uploads: Array<{
      id: string; // UUID
      filename: string;
      status: 'pending_processing' | 'error';
      error?: string;
    }>;
  }
}
```

### Database Schema

```sql
CREATE TABLE resume_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  file_path TEXT NOT NULL, -- Supabase Storage path

  uploaded_by UUID NOT NULL REFERENCES user_profiles(id),

  status TEXT CHECK (status IN (
    'pending_processing',
    'processing',
    'completed',
    'failed'
  )) DEFAULT 'pending_processing',

  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resume_uploads_status ON resume_uploads(status);
CREATE INDEX idx_resume_uploads_uploader ON resume_uploads(uploaded_by, created_at DESC);

-- RLS
ALTER TABLE resume_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY resume_uploads_recruiter_own ON resume_uploads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('recruiter', 'admin')
    )
  );
```

### Supabase Storage Bucket

```typescript
// Create bucket (run once)
await supabase.storage.createBucket('candidate-resumes', {
  public: false,
  fileSizeLimit: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
});
```

## Testing Requirements

**Unit Tests:**
- File validation (type, size)
- Metadata extraction
- Error handling

**Integration Tests:**
- Upload to Supabase Storage
- Database record creation
- Signed URL generation

**E2E Tests:**
- Recruiter uploads resume → Success message
- Upload invalid file → Error shown
- Upload >5MB → Error shown

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests passing
- [ ] E2E test passing
- [ ] API documented (OpenAPI)
- [ ] Deployed to production
- [ ] Verified in production (upload test resume)
```

**Story 2:** `PARSE-002-ai-data-extraction.md` (8 points)

**Story 3:** `PARSE-003-linkedin-enrichment.md` (5 points)

**Story 4:** `PARSE-004-profile-creation.md` (5 points)

**Story 5:** `PARSE-005-duplicate-detection.md` (5 points)

---

### Stage 4: Plan Sprint

Now let's plan Sprint 7:

**You Run:**
```bash
/workflows:plan-sprint 7 epic-4.1-resume-parsing
```

**PM Agent Analyzes:**
- Total story points: 28
- Sprint capacity: 24 points (2 devs × 12 points/sprint)
- Dependencies: PARSE-001 must be first

**PM Agent Creates:** `docs/planning/sprints/sprint-07/sprint-plan.md`

```markdown
# Sprint 7: Resume Parsing & Enrichment (Part 1)

**Duration:** Weeks 15-16 (Dec 2-15, 2025)
**Epic:** Epic 4.1 - Resume Parsing & Enrichment
**Team Capacity:** 24 story points (2 developers)

## Sprint Goals
1. Enable resume upload with validation
2. Implement AI data extraction
3. Create candidate profiles from parsed data

## Stories in This Sprint (23 points)

### Week 15
- [⚪] **PARSE-001**: Resume Upload & Storage (5 points)
  - Developer: Dev 1
  - Days: Monday-Tuesday
  - Deliverable: Recruiters can upload resumes to Supabase

- [⚪] **PARSE-002**: AI Data Extraction (8 points)
  - Developer: Dev 2 (starts in parallel with PARSE-001)
  - Days: Monday-Wednesday
  - Deliverable: Extract name, email, phone, skills, experience from resume

### Week 16
- [⚪] **PARSE-004**: Profile Creation (5 points)
  - Developer: Dev 1
  - Days: Wednesday-Thursday
  - Deliverable: Auto-create candidate profile from parsed data

- [⚪] **PARSE-003**: LinkedIn Enrichment (5 points)
  - Developer: Dev 2
  - Days: Thursday-Friday
  - Deliverable: Enrich profile with LinkedIn public data

## Deferred to Sprint 8
- **PARSE-005**: Duplicate Detection (5 points)
  - Reason: Sprint 7 already at capacity (23/24 points)
  - Will complete in Sprint 8 along with Epic 4.2 stories

## Dependencies
- ✅ Epic 01 (Foundation) - user_profiles table exists
- ✅ Epic 2.5 (AI Infrastructure) - OpenAI API configured
- ⚠️ LinkedIn API access - Need to request API key (1-week lead time)

## Risks
1. **LinkedIn API approval delay** (HIGH)
   - Mitigation: Start API request now, implement PARSE-003 with mock data
   - Contingency: Skip LinkedIn enrichment, use manual entry

2. **AI extraction accuracy <95%** (MEDIUM)
   - Mitigation: Validation dataset (100 resumes) ready for testing
   - Contingency: Fallback to manual correction interface

## Definition of Done
- [ ] All 4 stories complete (PARSE-001, 002, 003, 004)
- [ ] Integration tests passing
- [ ] E2E test: Upload resume → Profile created
- [ ] Deployed to production
- [ ] 95%+ parsing accuracy (validated on 50 test resumes)
```

---

### Stage 5: Execute Stories

Now execute each story:

**Week 15, Monday:**
```bash
/workflows:feature PARSE-001-resume-upload
```

**Pipeline Executes:**
1. ✅ PM: Reads `PARSE-001-resume-upload.md` story
2. 🏗️ Architect: Designs Supabase Storage + RLS policies
3. 💻 Developer: Implements upload UI + API + storage integration
4. ✅ QA: Tests upload flow (valid/invalid files, >5MB, multiple uploads)
5. 🚀 Deploy: Deploys to Vercel production

**Story Status:** PARSE-001 changes from ⚪ → 🟡 (in progress) → 🟢 (complete)

**Sprint Progress:** 5/23 story points complete (22%)

---

**Week 15, Wednesday:**
```bash
/workflows:feature PARSE-002-ai-data-extraction
```

**Pipeline Executes:** (same 5 stages)

**Story Status:** PARSE-002: ⚪ → 🟡 → 🟢

**Sprint Progress:** 13/23 story points complete (57%)

---

**Week 16, Thursday:**
```bash
/workflows:feature PARSE-004-profile-creation
```

**Sprint Progress:** 18/23 story points complete (78%)

---

**Week 16, Friday:**
```bash
/workflows:feature PARSE-003-linkedin-enrichment
```

**Sprint Progress:** 23/23 story points complete (100%) ✅

---

## 📊 Progress Tracking

### Epic Progress

After Sprint 7 completes:

`docs/planning/epics/epic-4.1-resume-parsing.md` auto-updates:

```markdown
## Progress
- Total Stories: 5
- Completed: 4 (PARSE-001, 002, 003, 004)
- In Progress: 0
- Not Started: 1 (PARSE-005)
- **Completion:** 80%

## Story Status
- [🟢] PARSE-001: Resume Upload & Storage (Sprint 7)
- [🟢] PARSE-002: AI Data Extraction (Sprint 7)
- [🟢] PARSE-003: LinkedIn Enrichment (Sprint 7)
- [🟢] PARSE-004: Profile Creation (Sprint 7)
- [⚪] PARSE-005: Duplicate Detection (Sprint 8)
```

### Feature Progress

`docs/planning/features/candidate-pipeline-automation.md` auto-updates:

```markdown
## Epic Progress
1. [🟡] Epic 4.1: Resume Parsing (80% complete - 4/5 stories)
2. [⚪] Epic 4.2: Auto-Qualification (0% complete)
3. [⚪] Epic 4.3: Interview Scheduling (0% complete)
4. [⚪] Epic 4.4: Candidate Communication (0% complete)

**Feature Completion:** 20% (1/4 epics mostly done)
```

---

## 🎯 Summary of Commands

| Stage | Command | What It Does |
|-------|---------|--------------|
| 1 | `/workflows:define-feature [name]` | Define business value + success metrics |
| 2 | `/workflows:create-epics [feature]` | Break feature into 3-5 major epics |
| 3 | `/workflows:create-stories [epic-id]` | Break epic into 5-15 implementable stories |
| 4 | `/workflows:plan-sprint [N] [epic-id]` | Select stories for 2-week sprint (20-25 points) |
| 5 | `/workflows:feature [story-id]` | Execute story: PM → Architect → Developer → QA → Deploy |

---

## 🚨 Important Rules

1. **Never skip stages** - Must define feature before creating epics
2. **One story at a time** - Complete stories before starting new ones
3. **Dependencies matter** - Can't execute story if dependencies not complete
4. **Sprint capacity** - Max 24-25 story points per 2-week sprint
5. **Story points** - 1 point = ~4 hours work (1-13 scale)

---

## ❓ FAQ

**Q: Can I work on multiple stories in parallel?**
A: Yes, if they have no dependencies. Example: PARSE-001 and PARSE-002 can start together.

**Q: What if a story takes longer than estimated?**
A: Increase story points for future similar work. Don't extend sprint - move remaining stories to next sprint.

**Q: Can I split a story mid-sprint?**
A: Yes, if story is >8 points or blocked. Create sub-stories (PARSE-002a, PARSE-002b).

**Q: What if I don't have a PM?**
A: The AI PM Agent handles all planning. You just provide business context.

**Q: Can I skip the Architect stage?**
A: No. Architect ensures design before coding. Prevents rework.

---

## 🎓 Pro Tips

1. **Start small** - First feature should be 1 epic, 5 stories, 1 sprint
2. **Write stories as user stories** - "As a [role], I want [feature], so that [value]"
3. **Acceptance criteria = testable** - QA uses these to validate
4. **Dependencies block execution** - Plan stories in dependency order
5. **Re-plan as needed** - Sprint plans can change, stories cannot (once started)

---

**Next Step:** Try it yourself!

```bash
/workflows:define-feature [Your-Feature-Name]
```
