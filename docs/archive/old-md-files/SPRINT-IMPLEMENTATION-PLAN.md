# InTime Unified Platform - Sprint Implementation Plan

**Project:** InTime Internal Employee Platform
**Duration:** 12 weeks (6 sprints × 2 weeks)
**Team Size:** 2-3 frontend developers (recommended)
**Start Date:** TBD
**Methodology:** Agile/Scrum with 2-week sprints

---

## Table of Contents

1. [Sprint Overview](#sprint-overview)
2. [Sprint 1: Foundation & HR Fixes](#sprint-1-foundation--hr-fixes)
3. [Sprint 2: Academy Admin](#sprint-2-academy-admin)
4. [Sprint 3: Shared Boards](#sprint-3-shared-boards)
5. [Sprint 4: Client Portal](#sprint-4-client-portal)
6. [Sprint 5: Pod Workflows](#sprint-5-pod-workflows)
7. [Sprint 6: CEO Dashboard & Polish](#sprint-6-ceo-dashboard--polish)
8. [Team Structure](#team-structure)
9. [Risk Management](#risk-management)

---

## Sprint Overview

| Sprint | Duration | Focus Area | Key Deliverables | Dependencies |
|--------|----------|------------|------------------|--------------|
| **Sprint 1** | Week 1-2 | Foundation & HR | Fix critical bugs, complete HR module | None |
| **Sprint 2** | Week 3-4 | Academy Admin | Course builder, student tracking | Backend academy tables |
| **Sprint 3** | Week 5-6 | Shared Boards | Job Board, Talent Board, Combined View | Cross-pollination critical |
| **Sprint 4** | Week 7-8 | Client Portal | Client management, project tracking | Client schema |
| **Sprint 5** | Week 9-10 | Pod Workflows | Recruiting, Bench Sales, TA dashboards | Shared Boards complete |
| **Sprint 6** | Week 11-12 | CEO & Polish | Executive dashboard, mobile, testing | All modules |

---

## Sprint 1: Foundation & HR Fixes

**Dates:** Week 1-2
**Goal:** Fix critical bugs, complete HR module to production-ready state
**Team Focus:** All developers on HR module

### Day 1-2: Setup & Bug Fixes

**Tasks:**
- [ ] Environment setup (all devs)
  - [ ] Clone `/frontend-prototype/` code
  - [ ] Install dependencies (`pnpm install`)
  - [ ] Set up local database connection
  - [ ] Configure tRPC endpoints
  - [ ] Test local build
- [ ] **CRITICAL BUG FIX:** "Assign to Employee" button
  - [ ] **File:** `components/hr/LearningAdmin.tsx`
  - [ ] Create `AssignCourseModal.tsx` component
  - [ ] Implement multi-select employee picker
  - [ ] Connect to backend `assignCourseToEmployees` mutation
  - [ ] Test assignment flow end-to-end
  - [ ] **Acceptance:** Modal opens, employees selectable, assignment saves

**Code Specification:**
```typescript
// components/hr/AssignCourseModal.tsx
interface AssignCourseModalProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
  onAssign: (employeeIds: string[]) => Promise<void>;
}

// Features needed:
// - Search employees by name
// - Multi-select with checkboxes
// - Filter by pod/role
// - Show already assigned employees (grayed out)
// - Bulk assign button
// - Success toast notification
```

**Backend Endpoint Needed:**
```typescript
// src/server/trpc/routers/academy.ts
assignCourseToEmployees: protectedProcedure
  .input(z.object({
    courseId: z.string(),
    employeeIds: z.array(z.string()),
    dueDate: z.date().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Create enrollment records
    // Send email notifications
    // Return success
  })
```

### Day 3-5: HR Module Completion

**Missing Features to Implement:**

#### 1. Timesheet Approval Modal
- [ ] **File:** `components/hr/TimesheetApprovalModal.tsx`
- [ ] Show timesheet details (hours breakdown)
- [ ] Approve/Reject actions
- [ ] Comments field for rejection
- [ ] Update status in database
- [ ] **Acceptance:** Manager can approve/reject timesheets

#### 2. Leave Request Modal
- [ ] **File:** `components/hr/LeaveRequestModal.tsx`
- [ ] Date range picker
- [ ] Leave type dropdown (PTO, Sick, Unpaid)
- [ ] Reason textarea
- [ ] Submit to manager for approval
- [ ] **Acceptance:** Employee can request time off, manager approves

#### 3. Performance Review Form
- [ ] **File:** `components/hr/PerformanceReviewForm.tsx`
- [ ] Q4 OKR input (goals, key results)
- [ ] Self-assessment section
- [ ] Manager feedback section
- [ ] Save draft / Submit final
- [ ] **Acceptance:** Employee can set goals, manager can review

#### 4. Add Person Modal (People Directory)
- [ ] **File:** `components/hr/AddPersonModal.tsx`
- [ ] Form fields: Name, Email, Role, Pod, Start Date
- [ ] Pod assignment dropdown (dynamic from database)
- [ ] Role assignment (multi-select: Recruiter, Bench Sales, TA, etc.)
- [ ] Create user in Supabase Auth + user_profiles table
- [ ] **Acceptance:** HR can add new employees

#### 5. Document Upload Modal
- [ ] **File:** `components/hr/DocumentUploadModal.tsx`
- [ ] File picker (PDF, DOCX, images)
- [ ] Document type dropdown (Handbook, Policy, Contract, etc.)
- [ ] Upload to Supabase Storage
- [ ] Create record in `documents` table
- [ ] **Acceptance:** HR can upload documents, employees can download

### Day 6-8: HR Module Backend Integration

**Replace Mock Data with API Calls:**

#### File: `app/(dashboard)/hr/dashboard/page.tsx`
```typescript
// BEFORE (Mock):
const pendingApprovals = [
  { id: 1, type: 'Timesheet', name: 'John Doe', date: '2025-10-15' },
];

// AFTER (Real):
const { data: pendingApprovals } = trpc.hr.getPendingApprovals.useQuery();
```

**API Calls to Implement:**
- [ ] `trpc.hr.getPendingApprovals.useQuery()`
- [ ] `trpc.hr.approveTimesheet.useMutation()`
- [ ] `trpc.hr.rejectTimesheet.useMutation()`
- [ ] `trpc.hr.submitLeaveRequest.useMutation()`
- [ ] `trpc.hr.approveLeaveRequest.useMutation()`
- [ ] `trpc.hr.getEmployeeList.useQuery()`
- [ ] `trpc.hr.createEmployee.useMutation()`
- [ ] `trpc.hr.updateEmployee.useMutation()`
- [ ] `trpc.hr.uploadDocument.useMutation()`
- [ ] `trpc.hr.getDocuments.useQuery()`

**Backend Files to Create:**
```
src/server/trpc/routers/
├── hr.ts (main HR router)
├── hr/
│   ├── timesheets.ts
│   ├── leave.ts
│   ├── performance.ts
│   ├── people.ts
│   └── documents.ts
```

### Day 9-10: Testing & Polish

**Testing Checklist:**
- [ ] **User Flow 7:** HR Manager → View Dashboard
  - [ ] Dashboard loads with real data
  - [ ] Pending approvals show correct count
  - [ ] Click "Review" opens approval modal
  - [ ] Approve/Reject updates database
  - [ ] Toast notification shows
- [ ] **User Flow 8:** HR Manager → Assign Training
  - [ ] Click "Assign to Employee" opens modal ✅
  - [ ] Search employees works
  - [ ] Select multiple employees
  - [ ] Click "Assign" saves to database
  - [ ] Success notification
  - [ ] Employees see course in "My Training"
- [ ] **User Flow 9:** Employee → Submit Timesheet
  - [ ] Edit hours (daily breakdown)
  - [ ] Click "Submit for Approval"
  - [ ] Manager sees pending approval
  - [ ] Approve → Employee sees "Approved" status
- [ ] **User Flow 10:** Manager → Approve Timesheet
  - [ ] See pending timesheets
  - [ ] Click "Review" opens modal
  - [ ] Approve → Status updates
  - [ ] Reject → Employee notified with reason
- [ ] **User Flow 11:** Employee → Request Time Off
  - [ ] Navigate to Time tab
  - [ ] Click "Request Time Off"
  - [ ] Fill form (dates, type, reason)
  - [ ] Submit → Manager sees pending request

**Polish:**
- [ ] Add loading spinners to all modals
- [ ] Add error handling (toast notifications for failures)
- [ ] Mobile responsive check (all HR pages)
- [ ] Accessibility audit (keyboard navigation, screen readers)

### Sprint 1 Deliverables

**Completed:**
✅ "Assign to Employee" bug fixed
✅ All HR modals implemented
✅ Backend integration complete (10 endpoints)
✅ All 5 HR user flows tested and working
✅ Mobile responsive
✅ Production-ready HR module

**Metrics:**
- **Coverage:** 9 HR pages, 100% functional
- **Bug Fixes:** 1 critical, 5 missing features
- **New Components:** 5 modals, 10 API calls
- **Tests Passed:** 5 user flows end-to-end

---

## Sprint 2: Academy Admin

**Dates:** Week 3-4
**Goal:** Build complete Academy Admin module for trainers
**Team Focus:** Split - 1 dev on course builder, 1 dev on student tracking

### Day 1-3: Course Builder (Dev 1)

**New Pages:**
- [ ] **File:** `app/(dashboard)/academy-admin/courses/page.tsx`
  - [ ] Course list (all courses)
  - [ ] Search/filter courses
  - [ ] "Create Course" button → modal
  - [ ] Edit course button → course editor
  - [ ] Delete course (soft delete with confirmation)

- [ ] **File:** `app/(dashboard)/academy-admin/courses/[courseId]/edit/page.tsx`
  - [ ] Course metadata form (title, description, duration, level)
  - [ ] Module list (drag-and-drop reordering)
  - [ ] Add/Edit/Delete modules
  - [ ] Preview course as student
  - [ ] Publish/Unpublish toggle

**Components:**
```typescript
// components/academy/CourseEditor.tsx
interface CourseEditorProps {
  courseId?: string; // undefined = new course
  initialData?: Course;
  onSave: (course: Course) => Promise<void>;
}

// Features:
// - Rich text editor for description (TipTap or Slate)
// - Module builder (add Theory, Demo, Verify, Build tabs)
// - Slide editor for Theory (multi-slide support)
// - Video uploader for Demo tab
// - Quiz builder for Verify tab
// - Lab instructions editor for Build tab
// - Prerequisite selector (other courses)
```

**Backend Endpoints:**
```typescript
// src/server/trpc/routers/academy-admin.ts
createCourse
updateCourse
deleteCourse
publishCourse
unpublishCourse
reorderModules
```

### Day 1-3: Student Tracking (Dev 2)

**New Pages:**
- [ ] **File:** `app/(dashboard)/academy-admin/students/page.tsx`
  - [ ] Student list (current cohort + all)
  - [ ] Filter by cohort, status (active, completed, at-risk)
  - [ ] Search by name
  - [ ] Click student → detail view

- [ ] **File:** `app/(dashboard)/academy-admin/students/[studentId]/page.tsx`
  - [ ] Student profile (name, email, cohort, start date)
  - [ ] Enrolled courses list
  - [ ] Progress breakdown (per course)
  - [ ] Quiz scores table
  - [ ] Lab submissions (graded/pending)
  - [ ] AI Mentor conversation log
  - [ ] At-risk indicators (AI-detected)
  - [ ] Actions: Send message, extend deadline, flag for review

**Components:**
```typescript
// components/academy/StudentProgressTracker.tsx
interface StudentProgressTrackerProps {
  studentId: string;
  courseId?: string; // optional filter
}

// Features:
// - Progress donut chart (Theory, Demo, Verify, Build completion %)
// - Quiz scores chart (over time)
// - Lab submission timeline
// - AI insights ("Student struggling with PolicyCenter module")
// - Quick actions (extend deadline, send encouragement)
```

**Backend Endpoints:**
```typescript
// src/server/trpc/routers/academy-admin.ts
getStudentList
getStudentDetail
getStudentProgress
getQuizScores
getLabSubmissions
flagStudentAtRisk
extendDeadline
```

### Day 4-6: Grading System

**Assignment Grading:**
- [ ] **File:** `app/(dashboard)/academy-admin/grading/page.tsx`
  - [ ] Pending grading queue
  - [ ] Filter by course, module, due date
  - [ ] Click submission → grading view

- [ ] **File:** `app/(dashboard)/academy-admin/grading/[submissionId]/page.tsx`
  - [ ] Student submission display
  - [ ] Code viewer (syntax highlighting for labs)
  - [ ] Rubric checklist
  - [ ] Points input (out of 100)
  - [ ] Feedback textarea (rich text)
  - [ ] AI grading suggestions (from existing Guru agents)
  - [ ] Submit grade → student notified

**Auto-Grading:**
```typescript
// components/academy/AutoGradeToggle.tsx
// Features:
// - Enable AI auto-grading for quizzes (already working)
// - Enable AI auto-grading for simple labs (code checks)
// - Trainer review queue (AI-graded submissions pending approval)
// - Override AI grade option
```

### Day 7-8: Content Upload

**Video Upload:**
- [ ] **Component:** `components/academy/VideoUploader.tsx`
  - [ ] File picker (MP4, MOV)
  - [ ] Upload to Supabase Storage
  - [ ] Thumbnail extraction
  - [ ] Video metadata (title, duration)
  - [ ] Progress bar during upload
  - [ ] Preview uploaded video
  - [ ] Replace video option

**Reading Material Upload:**
- [ ] **Component:** `components/academy/ReadingUploader.tsx`
  - [ ] PDF upload
  - [ ] Markdown editor (for inline content)
  - [ ] Image upload for diagrams
  - [ ] Preview rendering

**Lab Instructions:**
- [ ] **Component:** `components/academy/LabInstructionsEditor.tsx`
  - [ ] Rich text editor
  - [ ] Code snippet blocks (syntax highlighted)
  - [ ] User story template
  - [ ] Acceptance criteria checklist
  - [ ] Rubric builder (what gets graded)

### Day 9-10: Testing & Integration

**Testing Checklist:**
- [ ] **User Flow:** Trainer creates course
  - [ ] Navigate to Academy Admin → Courses
  - [ ] Click "Create Course"
  - [ ] Fill metadata (Guidewire PolicyCenter Fundamentals, 8 weeks, Beginner)
  - [ ] Add Module 1 (Introduction)
  - [ ] Add Theory tab (3 slides)
  - [ ] Add Demo tab (upload video)
  - [ ] Add Verify tab (create 5-question quiz)
  - [ ] Add Build tab (lab instructions)
  - [ ] Preview as student
  - [ ] Publish course
  - [ ] ✅ Course appears in student catalog

- [ ] **User Flow:** Trainer assigns course to cohort
  - [ ] Navigate to Students
  - [ ] Select cohort (Cohort 12 - Jan 2026)
  - [ ] Bulk assign course
  - [ ] ✅ All students see new course in dashboard

- [ ] **User Flow:** Trainer grades lab
  - [ ] Navigate to Grading → Pending (3 submissions)
  - [ ] Click submission
  - [ ] Review student code
  - [ ] AI suggests score (85/100)
  - [ ] Add feedback ("Great work on error handling!")
  - [ ] Submit grade
  - [ ] ✅ Student sees grade and feedback

- [ ] **User Flow:** Trainer tracks at-risk student
  - [ ] Navigate to Students
  - [ ] Filter by "At-Risk" status
  - [ ] Click student "Jane Doe"
  - [ ] See AI insight: "Low quiz scores (40% average), 2 weeks behind"
  - [ ] Click "Send Encouragement"
  - [ ] Email sent to student + AI Mentor adjusts approach
  - [ ] ✅ Student receives support

### Sprint 2 Deliverables

**Completed:**
✅ Course builder (create, edit, publish)
✅ Student tracking dashboard
✅ Grading system (manual + AI-assisted)
✅ Content upload (videos, reading, labs)
✅ 4 trainer workflows tested

**Metrics:**
- **New Pages:** 5
- **New Components:** 8
- **Backend Endpoints:** 15
- **Tests Passed:** 4 user flows

---

## Sprint 3: Shared Boards

**Dates:** Week 5-6
**Goal:** Build shared Job Board + Talent Board (CRITICAL for cross-pollination)
**Team Focus:** All devs on shared boards (highest priority feature)

### Day 1-3: Talent Board

**Page Structure:**
```
app/(dashboard)/shared/talent/page.tsx → Talent Board (Kanban)
app/(dashboard)/shared/talent/[candidateId]/page.tsx → Candidate Detail
```

**Talent Board (Kanban View):**
- [ ] **Component:** `components/shared/TalentBoard.tsx`

**Columns:**
1. **Pipeline** (TA sourced, not yet contacted)
2. **Contacted** (Initial outreach sent)
3. **Qualified** (Screening passed)
4. **Academy Candidate** (Ready for training)
5. **Student** (Currently enrolled in Academy)
6. **Graduate** (Completed Academy)
7. **Bench** (Available for placement)
8. **Placed** (On client project)
9. **Alumni** (Past placements)

**Card Fields:**
```typescript
interface TalentCard {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: TalentStatus; // column
  source: 'LinkedIn' | 'Referral' | 'Job Board' | 'Academy Application';
  skills: string[]; // ['Guidewire', 'Java', 'PolicyCenter']
  experience: number; // years
  availability: 'Immediate' | 'Available in 2 weeks' | 'Academy Student';
  resumeUrl: string;
  aiScore: number; // 0-100 (resume scoring)
  owner: {
    name: string; // Pod member responsible
    pod: string; // 'Recruiting Pod A'
  };
  tags: string[]; // ['Hot Lead', 'Visa Required', 'Senior']
  lastContact: Date;
  nextFollowUp: Date;
}
```

**Features:**
- [ ] Drag-and-drop between columns (status update)
- [ ] Search by name, skills, owner
- [ ] Filter by pod, status, skills, experience
- [ ] AI score sort (highest scored first)
- [ ] Bulk actions (assign owner, add tag, move status)
- [ ] Click card → detail view
- [ ] Add candidate button (quick add form)
- [ ] Real-time updates (when another pod member moves card)

**Backend:**
```typescript
// src/server/trpc/routers/shared/talent.ts
getTalentBoard.useQuery() // All candidates with filters
updateTalentStatus.useMutation() // Drag-and-drop
createCandidate.useMutation()
updateCandidate.useMutation()
deleteCandidate.useMutation() // Soft delete
assignOwner.useMutation()
addTag.useMutation()
```

### Day 1-3: Job Board (Parallel)

**Page Structure:**
```
app/(dashboard)/shared/jobs/page.tsx → Job Board (List/Grid)
app/(dashboard)/shared/jobs/[jobId]/page.tsx → Job Detail
```

**Job Board (Card Grid View):**
- [ ] **Component:** `components/shared/JobBoard.tsx`

**Job Card Fields:**
```typescript
interface JobCard {
  id: string;
  title: string; // 'Senior Guidewire PolicyCenter Developer'
  client: {
    name: string; // 'Acme Insurance'
    logo: string;
  };
  location: string; // 'Remote (US Only)' or 'Austin, TX'
  type: 'Contract' | 'Contract-to-Hire' | 'Permanent';
  duration: string; // '6 months' or 'Permanent'
  rate: { min: number; max: number }; // $70-$90/hr
  status: 'Open' | 'Submitted' | 'Interviewing' | 'Offer' | 'Filled' | 'Cancelled';
  requiredSkills: string[]; // ['PolicyCenter 10', 'Java 11', 'AWS']
  niceToHave: string[];
  description: string; // Full JD
  owner: {
    name: string; // Account Manager
    pod: string; // 'Recruiting Pod A'
  };
  claimedBy: string[]; // Other pods who are also working this
  submittedCount: number; // How many candidates submitted
  interviewCount: number;
  createdDate: Date;
  fillByDate: Date;
  priority: 'Hot' | 'Warm' | 'Cold';
  aiMatchCount: number; // How many candidates in Talent Board match
}
```

**Features:**
- [ ] Grid view (card layout)
- [ ] List view (table layout)
- [ ] Search by title, client, skills
- [ ] Filter by status, location, type, pod owner
- [ ] Sort by priority, created date, fill-by date, match count
- [ ] Click job → detail view
- [ ] "Claim Job" button (other pods can work it too)
- [ ] "Submit Candidate" button → opens candidate selector
- [ ] AI match indicator (shows how many Talent Board candidates match)
- [ ] Real-time updates (new jobs, status changes)

**Backend:**
```typescript
// src/server/trpc/routers/shared/jobs.ts
getJobBoard.useQuery() // All jobs with filters
createJob.useMutation()
updateJob.useMutation()
deleteJob.useMutation()
claimJob.useMutation() // Pod claims to work on it
submitCandidate.useMutation() // Link job + candidate
```

### Day 4-6: Combined View (CRITICAL)

**Page Structure:**
```
app/(dashboard)/shared/combined/page.tsx → Side-by-side Job + Talent
```

**Combined View Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Search Jobs] [Search Candidates]           [AI Match] [Filters▼]  │
├────────────────────────────────┬────────────────────────────────────┤
│ 📋 JOB BOARD (Left 50%)        │ 👥 TALENT BOARD (Right 50%)       │
├────────────────────────────────┼────────────────────────────────────┤
│ 🔥 Senior PolicyCenter Dev     │ 🟢 John Doe (AI Match: 95%)       │
│ Client: Acme Insurance         │ Skills: PolicyCenter 10, Java 11  │
│ Rate: $80-$95/hr              │ Experience: 8 years               │
│ Remote (US)                    │ Status: Bench (Available)         │
│ [View Detail] [Submit 3 →]     │ [View Profile] [Submit to Job ←]  │
├────────────────────────────────┼────────────────────────────────────┤
│ 🟡 Java Developer              │ 🟡 Jane Smith (AI Match: 78%)     │
│ Client: Beta Corp              │ Skills: Java, Spring, AWS         │
│ Rate: $70-$85/hr              │ Experience: 5 years               │
│ Austin, TX                     │ Status: Academy (Graduates Feb)   │
│ [View Detail] [Submit 1 →]     │ [View Profile] [Submit to Job ←]  │
└────────────────────────────────┴────────────────────────────────────┘
```

**Features:**
- [ ] **AI-Powered Matching:**
  - [ ] Click job → right side shows top 10 matching candidates
  - [ ] Click candidate → left side shows top 10 matching jobs
  - [ ] Match score calculation:
    ```typescript
    // AI scoring factors:
    // - Skills match (70%)
    // - Experience level (10%)
    // - Availability (10%)
    // - Location match (5%)
    // - Visa status match (5%)
    ```
- [ ] **Quick Actions:**
  - [ ] Drag candidate card to job → submit workflow
  - [ ] Click "Submit to Job" → opens submission form
  - [ ] Bulk submit (select 3 candidates → submit all to job)
- [ ] **Real-time Sync:**
  - [ ] Both boards update live
  - [ ] Show "John from Recruiting Pod B just submitted Jane to Acme Insurance"

**Submission Workflow Modal:**
```typescript
// components/shared/SubmitCandidateModal.tsx
interface SubmitCandidateModalProps {
  jobId: string;
  candidateId: string;
  onSubmit: (submission: Submission) => Promise<void>;
}

// Fields:
// - Job summary (read-only)
// - Candidate summary (read-only)
// - AI-generated candidate profile (editable)
// - Cover letter (AI-drafted, editable)
// - Rate expectation (candidate's rate)
// - Availability date
// - Notes (internal)
// - Submit button → creates submission record
```

### Day 7-8: Candidate Detail View

**Page:** `app/(dashboard)/shared/talent/[candidateId]/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back to Board]    [Edit] [Delete] [Convert to Student]  │
├─────────────────────────────────────────────────────────────┤
│ 👤 John Doe                                    AI Score: 92│
│ john.doe@email.com | (555) 123-4567                        │
│ Status: Bench (Available) | Owner: Recruiting Pod A        │
├────────────────────────────┬────────────────────────────────┤
│ 📄 PROFILE                 │ 📋 ACTIVITY                    │
├────────────────────────────┤                                │
│ Skills:                    │ • Nov 20: Submitted to Acme    │
│ ✓ Guidewire PolicyCenter  │   Insurance (Pending)          │
│ ✓ Java 11                  │ • Nov 15: Graduated Academy   │
│ ✓ AWS                      │   Cohort 11                    │
│                            │ • Nov 1: Started Academy      │
│ Experience: 8 years        │ • Oct 20: Contacted by TA Pod │
│ Availability: Immediate    │ • Oct 15: Sourced from        │
│ Location: Austin, TX       │   LinkedIn                     │
│ Visa: US Citizen           │                                │
│                            │ 📊 SUBMISSIONS (3)             │
│ 📎 Resume (View/Download)  │ • Acme Insurance - Pending    │
│ 🎓 Academy Course:         │ • Beta Corp - Rejected        │
│    Guidewire PolicyCenter │ • Gamma LLC - Interview       │
│    (Completed Nov 15)      │                                │
│                            │ 💬 NOTES (2)                   │
│ 🏷️ Tags:                   │ • "Very strong technical      │
│   • Hot Lead               │   skills" - Sarah (Nov 10)    │
│   • Senior                 │ • "Needs visa sponsorship"    │
│   • Bench                  │   - Mike (Oct 25)             │
└────────────────────────────┴────────────────────────────────┘
```

**Features:**
- [ ] Edit candidate (inline or modal)
- [ ] Upload/replace resume
- [ ] Convert to Academy student (if Pipeline/Contacted status)
- [ ] Add note (visible to all pods)
- [ ] Add tag
- [ ] Submit to job (opens Combined View with candidate pre-selected)
- [ ] Activity timeline (auto-generated from events)
- [ ] Submissions history (all jobs submitted to)

### Day 9-10: Testing & Polish

**Critical User Flows:**

- [ ] **Flow 1: TA Pod sources candidate → Academy**
  - [ ] TA creates candidate (LinkedIn sourced)
  - [ ] Status: Pipeline
  - [ ] TA contacts candidate
  - [ ] Status → Contacted
  - [ ] Candidate interested but needs training
  - [ ] Click "Convert to Student"
  - [ ] Student enrollment modal opens
  - [ ] Assign to Academy Cohort 12
  - [ ] ✅ Status → Student
  - [ ] ✅ Candidate appears in Academy Admin student list
  - [ ] ✅ Trainer can track progress

- [ ] **Flow 2: Academy Graduate → Bench → Placed**
  - [ ] Student completes Academy
  - [ ] Event: `course.graduated`
  - [ ] Auto-transition: Status → Graduate
  - [ ] Bench Sales Pod sees new graduate
  - [ ] Graduate ready for placement
  - [ ] Status → Bench
  - [ ] Recruiting Pod has job order
  - [ ] Combined View shows AI match (95%)
  - [ ] Submit candidate to job
  - [ ] Client interviews candidate
  - [ ] Offer accepted
  - [ ] Status → Placed
  - [ ] ✅ Celebration triggers (confetti, toast to all)

- [ ] **Flow 3: Cross-Pod Collaboration**
  - [ ] Recruiting Pod creates job (Acme Insurance)
  - [ ] Owner: Recruiting Pod A
  - [ ] Bench Sales Pod sees job (AI shows 3 bench consultants match)
  - [ ] Bench Pod clicks "Claim Job"
  - [ ] Both pods now working job
  - [ ] Bench Pod submits consultant
  - [ ] Recruiting Pod sees submission
  - [ ] ✅ No duplicate submissions
  - [ ] ✅ Both pods get commission if placed

### Sprint 3 Deliverables

**Completed:**
✅ Talent Board (Kanban with 9 columns)
✅ Job Board (Grid/List view)
✅ Combined View (AI-powered matching)
✅ Submission workflow
✅ Candidate detail view
✅ Cross-pod collaboration
✅ Real-time updates
✅ 3 critical cross-pollination flows tested

**Metrics:**
- **New Pages:** 5
- **New Components:** 15
- **Backend Endpoints:** 20
- **AI Features:** Resume scoring, job-candidate matching
- **Critical Business Value:** Cross-pollination enabled

---

## Sprint 4: Client Portal

**Dates:** Week 7-8
**Goal:** Build Client Portal Admin for account managers
**Team Focus:** Split - 1 dev on client management, 1 dev on project tracking

### Day 1-3: Client Management

**Pages:**
```
app/(dashboard)/clients/page.tsx → Client list
app/(dashboard)/clients/[clientId]/page.tsx → Client detail
app/(dashboard)/clients/[clientId]/projects/[projectId]/page.tsx → Project detail
```

**Client List Page:**
- [ ] **Component:** `components/clients/ClientList.tsx`

**View:**
```
┌──────────────────────────────────────────────────────────────┐
│ 🏢 Clients (24)        [+ Add Client] [Grid▼] [Search...]   │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ 🟢 Acme Ins │ 🟡 Beta Corp│ 🟢 Gamma LLC│ 🔴 Delta Systems │
│ 3 Active    │ 1 Active    │ 2 Active    │ 0 Active         │
│ $45k/mo     │ $15k/mo     │ $30k/mo     │ Lost Client      │
│ Health: 95% │ Health: 70% │ Health: 88% │ Health: 0%       │
│ [View]      │ [View]      │ [View]      │ [Reactivate]     │
└─────────────┴─────────────┴─────────────┴───────────────────┘
```

**Client Card Fields:**
```typescript
interface ClientCard {
  id: string;
  name: string;
  logo: string;
  status: 'Active' | 'Inactive' | 'Lost';
  activeProjects: number;
  monthlyRevenue: number;
  healthScore: number; // 0-100 (AI-calculated)
  accountManager: {
    name: string;
    pod: string;
  };
  industry: string; // 'Insurance', 'Healthcare', 'Financial Services'
  size: string; // 'Enterprise (1000+ employees)'
  contractType: 'MSA' | 'SOW' | 'Staffing Agreement';
  billingTerms: 'Net 30' | 'Net 45' | 'Net 60';
  lastContact: Date;
  nextReview: Date;
}
```

**Features:**
- [ ] Grid view (cards)
- [ ] List view (table)
- [ ] Search by name, industry
- [ ] Filter by status, account manager, health score
- [ ] Sort by revenue, health, last contact
- [ ] Add client button → modal
- [ ] Click client → detail view
- [ ] Health score indicator (green/yellow/red)
- [ ] AI insights ("Client at risk - no new projects in 60 days")

**Client Detail Page:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Clients] 🏢 Acme Insurance                    Edit ⚙️    │
├───────────────────────────┬─────────────────────────────────┤
│ 📊 OVERVIEW               │ 📋 ACTIVE PROJECTS (3)          │
│                           │                                 │
│ Status: 🟢 Active         │ 1. Senior PolicyCenter Dev      │
│ Account Manager:          │    Rate: $85/hr | Start: Oct 1 │
│   Sarah Johnson           │    Consultant: John Doe         │
│   (Recruiting Pod A)      │    [View Project]               │
│                           │                                 │
│ Monthly Revenue: $45,000  │ 2. Java Developer               │
│ Total Placements: 12      │    Rate: $75/hr | Start: Sep 15│
│ Health Score: 95%         │    Consultant: Jane Smith       │
│                           │    [View Project]               │
│ 📞 CONTACTS (2)           │                                 │
│ • Mike Brown (CTO)        │ 3. QA Automation Engineer      │
│   mike@acme.com          │    Rate: $65/hr | Start: Nov 1 │
│   (555) 123-4567         │    Consultant: Bob Wilson       │
│ • Lisa White (HR Dir)     │    [View Project]               │
│   lisa@acme.com          │                                 │
│                           │ 💰 INVOICING                    │
│ 📄 CONTRACT               │ Oct 2025: $45,000 (Paid)       │
│ MSA Active                │ Nov 2025: $45,000 (Due Dec 5)  │
│ Signed: Jan 15, 2025      │ [View All Invoices]             │
│ Expires: Jan 14, 2026     │                                 │
│ [View Contract]           │                                 │
│                           │ 📈 HISTORY                      │
│ 🎯 PIPELINE (2)           │ • Nov 15: Placed Bob Wilson    │
│ • Java Developer (Hot)    │ • Oct 20: Invoice paid         │
│ • Data Engineer (Warm)    │ • Oct 1: Placed John Doe       │
│                           │ • Sep 15: Placed Jane Smith    │
└───────────────────────────┴─────────────────────────────────┘
```

**Features:**
- [ ] Edit client info (modal)
- [ ] Add/edit contacts
- [ ] Add new project (opens job creation)
- [ ] View all projects (active + completed)
- [ ] Invoice management (view, download, mark paid)
- [ ] Contract management (upload, renew)
- [ ] Activity timeline
- [ ] Health score details (why 95%? AI explains)
- [ ] Add note

### Day 4-6: Project Tracking

**Project Detail Page:**
```
app/(dashboard)/clients/[clientId]/projects/[projectId]/page.tsx
```

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Client] 💼 Senior PolicyCenter Developer         Edit ⚙️ │
├───────────────────────────┬─────────────────────────────────┤
│ 📊 PROJECT INFO           │ 👤 CONSULTANT                   │
│                           │                                 │
│ Status: 🟢 Active         │ John Doe                        │
│ Client: Acme Insurance    │ Email: john.doe@intime.com     │
│ Start Date: Oct 1, 2025   │ Phone: (555) 987-6543          │
│ End Date: Mar 31, 2026    │                                 │
│ Duration: 6 months        │ Rate: $85/hr                    │
│                           │ Hours This Week: 40             │
│ 💰 FINANCIALS             │ Total Hours: 480                │
│ Bill Rate: $85/hr         │ Total Billed: $40,800           │
│ Pay Rate: $60/hr          │                                 │
│ Margin: $25/hr (29%)      │ 📊 PERFORMANCE                  │
│                           │ Client Satisfaction: ⭐⭐⭐⭐⭐  │
│ Monthly Revenue: $14,450  │ Last Check-in: Nov 20          │
│ Total Revenue: $40,800    │ Next Review: Dec 1             │
│                           │                                 │
│ 📅 TIMELINE               │ 📋 NOTES (3)                    │
│ Oct 1: Project started    │ • "Client very happy with      │
│ Oct 15: First check-in    │   John's work" - Sarah (Nov 15)│
│ Nov 1: Mid-project review │ • "Extend 3 months?" - Sarah   │
│ Nov 15: Client feedback   │   (Nov 10)                      │
│ Dec 1: Renewal discussion │                                 │
│                           │ ⚠️ ALERTS                       │
│ 📄 DOCUMENTS (2)          │ • Contract renewal due in 30   │
│ • SOW.pdf                 │   days                          │
│ • Rate Confirmation.pdf   │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

**Features:**
- [ ] Edit project details
- [ ] Update status (Active, On Hold, Extended, Completed, Cancelled)
- [ ] Track hours (weekly breakdown)
- [ ] Financial tracking (bill rate, pay rate, margin)
- [ ] Client satisfaction (star rating + notes)
- [ ] Check-in scheduler (automated reminders)
- [ ] Renewal workflow (30 days before end → alert)
- [ ] Document upload (SOW, contracts, invoices)
- [ ] Timeline (auto-generated events)
- [ ] Notes (shared across pod)

### Day 7-8: Invoicing

**Invoice Page:**
```
app/(dashboard)/clients/[clientId]/invoices/page.tsx
```

**Invoice List:**
```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Invoices - Acme Insurance      [+ Create Invoice]        │
├────────────┬──────────┬──────────┬──────────┬──────────────┤
│ Invoice #  │ Period   │ Amount   │ Due Date │ Status       │
├────────────┼──────────┼──────────┼──────────┼──────────────┤
│ INV-001025 │ Nov 2025 │ $45,000  │ Dec 5    │ 🟡 Pending   │
│            │          │          │          │ [Send] [View]│
├────────────┼──────────┼──────────┼──────────┼──────────────┤
│ INV-001024 │ Oct 2025 │ $45,000  │ Nov 5    │ ✅ Paid      │
│            │          │          │          │ [View]       │
├────────────┼──────────┼──────────┼──────────┼──────────────┤
│ INV-001023 │ Sep 2025 │ $30,000  │ Oct 5    │ ✅ Paid      │
│            │          │          │          │ [View]       │
└────────────┴──────────┴──────────┴──────────┴──────────────┘
```

**Invoice Generator:**
```typescript
// components/clients/InvoiceGenerator.tsx
// Features:
// - Auto-calculate from project hours
// - Line items (per consultant/project)
// - Tax calculation (if applicable)
// - PDF generation
// - Email to client
// - Mark as sent/paid
// - Payment tracking
// - Overdue alerts (>30 days)
```

### Day 9-10: Testing

**User Flows:**
- [ ] **Flow: Account Manager adds new client**
  - [ ] Click "Add Client"
  - [ ] Fill form (name, industry, contacts, contract terms)
  - [ ] Upload MSA
  - [ ] Save
  - [ ] ✅ Client appears in list

- [ ] **Flow: Start new project**
  - [ ] Go to Client Detail
  - [ ] Click "Add Project" (or create from Job Board)
  - [ ] Fill project details (consultant, rate, start/end date)
  - [ ] Save
  - [ ] ✅ Project appears in Active Projects
  - [ ] ✅ Consultant sees assignment
  - [ ] ✅ Timesheet auto-linked to project

- [ ] **Flow: Invoice client**
  - [ ] End of month trigger
  - [ ] System auto-generates invoice from project hours
  - [ ] Review invoice (edit if needed)
  - [ ] Send to client
  - [ ] ✅ Email sent
  - [ ] Client pays
  - [ ] Mark as paid
  - [ ] ✅ Revenue recorded

### Sprint 4 Deliverables

**Completed:**
✅ Client management (24 clients tracked)
✅ Project tracking (active + completed)
✅ Invoicing system
✅ Health score monitoring
✅ 3 client workflows tested

**Metrics:**
- **New Pages:** 5
- **New Components:** 12
- **Backend Endpoints:** 18
- **Business Value:** Client revenue tracking, renewals, health monitoring

---

## Sprint 5: Pod Workflows

**Dates:** Week 9-10
**Goal:** Build pod-specific dashboards and workflows
**Team Focus:** 3 parallel tracks (Recruiting, Bench Sales, TA)

### Day 1-5: Recruiting Pod Dashboard

**Page:** `app/(dashboard)/recruiting/dashboard/page.tsx`

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Recruiting Pod A Dashboard          This Sprint: 1/2    │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 📞 Active    │ 👥 Candidates│ 🎯 Pipeline  │ 💰 Revenue    │
│ Reqs: 8      │ Sourced: 45  │ Interviews:12│ This Sprint:  │
│              │ Submitted:15 │ Offers: 2    │ $75k          │
│              │              │              │ YTD: $450k    │
├──────────────┴──────────────┴──────────────┴───────────────┤
│ 🔥 HOT REQS (Urgent)                                        │
│ • Senior PolicyCenter Dev @ Acme (Due: 2 days) [3 submitted]│
│ • Java Developer @ Beta Corp (Due: 5 days)    [1 submitted]│
│                                                              │
│ 📋 MY CLIENTS (3)                                           │
│ • Acme Insurance (95% health) - 3 active projects          │
│ • Beta Corp (70% health) - 1 active project                │
│ • Gamma LLC (88% health) - 2 active projects               │
│                                                              │
│ 🚀 QUICK ACTIONS                                            │
│ [Search Talent] [View Job Board] [Submit Candidate]        │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- [ ] Sprint goal tracker (2 placements/sprint)
- [ ] Hot req alerts (approaching deadline)
- [ ] Client health monitoring
- [ ] Quick access to Shared Boards
- [ ] Junior performance (if Senior)
- [ ] AI Twin insights ("High-probability placement: John Doe to Acme")

### Day 1-5: Bench Sales Pod Dashboard

**Page:** `app/(dashboard)/bench/dashboard/page.tsx`

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 💼 Bench Sales Pod 1 Dashboard         This Sprint: 2/2 ✅ │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 👥 Bench     │ 📞 Outreach  │ 🎯 Pipeline  │ 💰 Commission │
│ Consultants: │ This Week:30 │ Interviews:8 │ This Sprint:  │
│ 12 Available │ Responded:12 │ Offers: 3    │ $1,000        │
│              │              │              │ YTD: $6,000   │
├──────────────┴──────────────┴──────────────┴───────────────┤
│ 🟢 AVAILABLE CONSULTANTS (12)                               │
│ • John Doe (PolicyCenter) - 45 days on bench               │
│   AI: Match to 3 jobs [View Matches]                       │
│ • Jane Smith (Java) - 20 days on bench                     │
│   AI: Match to 5 jobs [View Matches]                       │
│                                                              │
│ ⚠️ LONG-TERM BENCH (>60 days) (2)                          │
│ • Bob Wilson - 75 days [Upskilling needed]                 │
│ • Lisa Brown - 68 days [Assign training]                   │
│                                                              │
│ 🚀 QUICK ACTIONS                                            │
│ [View Bench Console] [View Job Board] [AI Match All]       │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- [ ] Bench consultant list (sorted by availability)
- [ ] Long-term bench alerts (>60 days)
- [ ] AI job matching for each consultant
- [ ] Outreach tracker (emails sent/responded)
- [ ] Sprint goal tracker
- [ ] Commission calculator

### Day 1-5: TA Pod Dashboard

**Page:** `app/(dashboard)/ta/dashboard/page.tsx`

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🚀 TA Pod 3 Dashboard                  This Month: 120/100 ✅│
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 📧 Outreach  │ 🔥 Warm Leads│ 🎓 Academy   │ 👥 Recruiting │
│ Sent: 450    │ This Week:35 │ Referred: 8  │ Referred: 25  │
│ Opened: 180  │ Total: 120   │              │               │
│ Replied: 65  │              │              │               │
├──────────────┴──────────────┴──────────────┴───────────────┤
│ 🎯 ACTIVE CAMPAIGNS (3)                                     │
│ • LinkedIn - Guidewire Developers (50 contacted, 12 warm)  │
│ • Email - Java Developers (200 sent, 35 warm)             │
│ • Referral - Alumni Network (Active)                        │
│                                                              │
│ 🔥 HOT LEADS (Ready for handoff)                           │
│ • Mike Johnson - Ready for Academy                         │
│ • Sarah Lee - Ready for Recruiting                         │
│                                                              │
│ 🚀 QUICK ACTIONS                                            │
│ [Launch Campaign] [View Pipeline] [AI Generate Messages]   │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- [ ] Campaign manager (create, track, analyze)
- [ ] Warm lead tracker
- [ ] Handoff to Academy (convert to student)
- [ ] Handoff to Recruiting (qualified candidate)
- [ ] AI message generator
- [ ] Monthly goal tracker (100 warm leads/month)

### Day 6-8: AI Twin Workflows

**AI Twin Role-Specific Prompts:**

```typescript
// lib/ai/twins/RecruiterTwin.ts
export const recruiterPrompts = {
  findCandidates: (jobRequirements: string) => `
    Search the Talent Board for candidates matching:
    ${jobRequirements}

    Return top 10 matches with:
    - Match score (0-100)
    - Matching skills
    - Availability
    - Why they're a good fit
  `,

  draftSubmission: (candidate: Candidate, job: Job) => `
    Draft a professional candidate submission for:
    Candidate: ${candidate.name}
    Job: ${job.title} at ${job.client.name}

    Include:
    - Professional summary
    - Key skills match
    - Relevant experience
    - Why they're ideal for this role
  `,

  scoreResume: (resumeText: string, jobRequirements: string) => `
    Score this resume against job requirements:
    Resume: ${resumeText}
    Requirements: ${jobRequirements}

    Provide:
    - Overall score (0-100)
    - Skills match breakdown
    - Experience relevance
    - Gaps to address
  `,
};
```

**Bench Sales Twin:**
```typescript
// lib/ai/twins/BenchSalesTwin.ts
export const benchSalesPrompts = {
  matchConsultant: (consultant: Consultant, jobs: Job[]) => `
    Match bench consultant to available jobs:
    Consultant: ${consultant.name}
    Skills: ${consultant.skills.join(', ')}

    Analyze ${jobs.length} open jobs and return:
    - Top 5 best matches
    - Match score for each
    - Why it's a good fit
    - Recommended talking points for client outreach
  `,

  draftOutreach: (consultant: Consultant, client: Client) => `
    Draft client outreach email:
    Consultant: ${consultant.name} (${consultant.skills.join(', ')})
    Client: ${client.name}

    Write a professional email highlighting:
    - Consultant's relevant experience
    - Availability
    - Rate range
    - Call to action
  `,

  forecastPlacement: (consultant: Consultant, pipeline: Placement[]) => `
    Forecast placement probability:
    Consultant: ${consultant.name}
    Current pipeline: ${pipeline.length} opportunities

    Analyze and provide:
    - Most likely to close (rank opportunities)
    - Probability percentages
    - Timeline estimates
    - Recommended actions to increase probability
  `,
};
```

**TA Twin:**
```typescript
// lib/ai/twins/TATwin.ts
export const taPrompts = {
  generateCampaign: (targetPersona: string, count: number) => `
    Generate outreach campaign:
    Target: ${targetPersona}
    Volume: ${count} contacts

    Provide:
    - LinkedIn search query
    - Message sequence (3 messages)
    - Subject lines for email
    - Personalization tokens
  `,

  scoreCandidate: (candidate: Candidate) => `
    Score candidate for staffing pipeline:
    Name: ${candidate.name}
    Skills: ${candidate.skills.join(', ')}
    Experience: ${candidate.experience} years

    Evaluate:
    - Technical skill level (0-100)
    - Market demand for skills
    - Placement probability
    - Recommended path (Academy, Recruiting, Bench)
  `,
};
```

**Integration:**
- [ ] AI Twin chat panel (bottom-right on all pages)
- [ ] Role-aware (different prompts per pod type)
- [ ] Quick actions ("Find candidates for this job", "Draft outreach for this consultant")
- [ ] Automation workflows (scheduled tasks)

### Day 9-10: Testing

**User Flows:**
- [ ] **Flow: Senior Recruiter places candidate**
  - [ ] Dashboard shows hot req (Due: 2 days)
  - [ ] Click "Search Talent"
  - [ ] Combined View shows AI matches
  - [ ] Submit top candidate
  - [ ] Client interviews
  - [ ] Offer accepted
  - [ ] ✅ Sprint goal: 1/2 → 2/2
  - [ ] ✅ Confetti celebration
  - [ ] ✅ Commission recorded ($500)

- [ ] **Flow: Bench Sales places consultant**
  - [ ] Dashboard shows 12 available consultants
  - [ ] AI suggests John Doe → Acme Insurance (95% match)
  - [ ] Click "View Matches"
  - [ ] Draft outreach (AI-generated)
  - [ ] Send to client
  - [ ] Client interested
  - [ ] Interview scheduled
  - [ ] Placement
  - [ ] ✅ Commission earned

- [ ] **Flow: TA generates warm leads**
  - [ ] Launch LinkedIn campaign
  - [ ] AI generates messages
  - [ ] Send 50 connection requests
  - [ ] 12 accept
  - [ ] AI follows up
  - [ ] 5 respond positively
  - [ ] Qualify for Academy
  - [ ] ✅ Handoff to Academy Pod
  - [ ] ✅ Cross-pollination flow complete

### Sprint 5 Deliverables

**Completed:**
✅ 3 pod-specific dashboards (Recruiting, Bench, TA)
✅ AI Twin integration (role-specific prompts)
✅ Automation workflows
✅ 3 pod user flows tested
✅ Sprint goal tracking

**Metrics:**
- **New Pages:** 3 dashboards
- **New Components:** 10
- **AI Prompts:** 15 role-specific
- **Business Value:** Pod efficiency, automation, sprint goals

---

## Sprint 6: CEO Dashboard & Polish

**Dates:** Week 11-12
**Goal:** Executive dashboard, mobile optimization, final testing
**Team Focus:** All developers on polish and testing

### Day 1-3: CEO Dashboard

**Page:** `app/(dashboard)/ceo/dashboard/page.tsx`

**Executive Dashboard:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 InTime Executive Dashboard            Sprint 6, 2025    │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 💰 Revenue   │ 👥 Headcount │ 🎯 Placements│ 📈 Growth     │
│ This Month:  │ Employees:38 │ This Sprint: │ MoM: +15%     │
│ $245,000     │ Consultants: │ 18/19 pods   │ YoY: +120%    │
│ Target: $228k│ 45 placed    │ met goal     │               │
│ ✅ +7%       │ 12 bench     │              │               │
├──────────────┴──────────────┴──────────────┴───────────────┤
│ 🏆 POD SCOREBOARD (Top 5)                                   │
│ 1. 🥇 Recruiting Pod A - 4 placements (200% of goal)       │
│ 2. 🥈 Bench Sales Pod 3 - 3 placements (150%)              │
│ 3. 🥉 Recruiting Pod B - 2 placements (100%)               │
│ 4. ⭐ TA Pod 5 - 125 warm leads (125% of goal)             │
│ 5. ⭐ Academy Pod 1 - 15 graduates this sprint             │
│                                                              │
│ ⚠️ PODS NEEDING SUPPORT (1)                                │
│ • Recruiting Pod D - 0 placements (Need: coaching)         │
│                                                              │
│ 📊 REVENUE FORECAST (Next 3 Months)                        │
│ [Chart: $245k → $260k → $280k]                             │
│ AI Confidence: 85%                                          │
│                                                              │
│ 🎯 STRATEGIC INSIGHTS (AI Twin)                            │
│ • "Bench utilization down to 78% (target: 85%). Recommend  │
│   increasing client outreach."                              │
│ • "Academy Cohort 12 graduating Feb - 20 students. Bench   │
│   Sales Pods should prepare for influx."                    │
│ • "Acme Insurance contract renewal due Jan 15. High value  │
│   client (20% of revenue). Schedule renewal meeting now."   │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- [ ] Company KPIs (revenue, headcount, placements, growth)
- [ ] Pod performance scoreboard (ranked)
- [ ] Underperforming pod alerts
- [ ] Revenue forecast (AI-powered)
- [ ] Strategic insights (AI Twin)
- [ ] Client health summary
- [ ] Drill-down to any module

### Day 1-3: Admin Panel

**Page:** `app/(dashboard)/admin/users/page.tsx`

**User Management:**
```
┌─────────────────────────────────────────────────────────────┐
│ 👥 User Management (38 users)         [+ Create User]       │
├──────────┬──────────┬──────────────┬──────────┬────────────┤
│ Name     │ Email    │ Roles        │ Pod      │ Status     │
├──────────┼──────────┼──────────────┼──────────┼────────────┤
│ John Doe │ john@... │ Recruiter,   │ Rec A    │ ✅ Active  │
│          │          │ Sr Account   │          │ [Edit]     │
│          │          │ Manager      │          │            │
├──────────┼──────────┼──────────────┼──────────┼────────────┤
│ Jane S.  │ jane@... │ Bench Sales, │ Bench 3  │ ✅ Active  │
│          │          │ Senior       │          │ [Edit]     │
└──────────┴──────────┴──────────────┴──────────┴────────────┘
```

**Features:**
- [ ] Create user (Supabase Auth + profile)
- [ ] Edit user (name, email, roles, pod)
- [ ] Assign roles (multi-role support)
- [ ] Assign to pod
- [ ] Deactivate user (soft delete)
- [ ] Reset password
- [ ] Audit log (who changed what)

### Day 4-6: Mobile Optimization

**Responsive Design Testing:**

**Desktop (1440px+):**
- [ ] Test all 50+ pages
- [ ] Sidebar navigation
- [ ] Full data tables
- [ ] All modals fit
- [ ] Charts render correctly

**Tablet (768px-1439px):**
- [ ] Test all pages
- [ ] Collapsible sidebar
- [ ] Tables scroll horizontally
- [ ] Modals responsive
- [ ] Touch-friendly targets (44px minimum)

**Mobile (375px-767px):**
- [ ] Test all pages
- [ ] Bottom navigation bar
- [ ] Hamburger menu
- [ ] Cards stack vertically
- [ ] Forms single-column
- [ ] Modals full-screen
- [ ] Touch gestures (swipe, tap)
- [ ] No horizontal scroll
- [ ] Readable font sizes (16px minimum)

**Priority Pages for Mobile:**
- [ ] Dashboard (all roles)
- [ ] Talent Board (search/add candidates)
- [ ] Job Board (view/claim jobs)
- [ ] Timesheet (submit hours)
- [ ] AI Twin chat
- [ ] Notifications

### Day 7-8: Notifications & Celebrations

**Notification System:**
```typescript
// lib/notifications/triggers.ts
export const notificationTriggers = {
  // Approvals
  timesheetSubmitted: (employeeId, managerId) => {
    sendNotification(managerId, {
      type: 'approval_needed',
      title: 'Timesheet Approval',
      message: `${employee.name} submitted timesheet`,
      action: '/hr/dashboard',
    });
  },

  // Placements
  placementConfirmed: (podId, candidateId, jobId) => {
    // Send to all employees
    broadcastNotification({
      type: 'celebration',
      title: '🎉 Placement!',
      message: `${pod.name} placed ${candidate.name} at ${client.name}!`,
      confetti: true,
    });
  },

  // Deadlines
  jobDeadlineApproaching: (jobId, accountManagerId) => {
    sendNotification(accountManagerId, {
      type: 'warning',
      title: '⚠️ Job Deadline',
      message: `${job.title} due in 2 days - 0 submissions`,
      action: `/shared/jobs/${jobId}`,
    });
  },

  // Academy
  studentAtRisk: (studentId, trainerId) => {
    sendNotification(trainerId, {
      type: 'alert',
      title: '🚨 Student At-Risk',
      message: `${student.name} falling behind (AI detected)`,
      action: `/academy-admin/students/${studentId}`,
    });
  },
};
```

**Celebration System:**
```typescript
// components/Celebration.tsx
export const triggerCelebration = (type: CelebrationType) => {
  // Confetti animation
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  // Toast notification
  toast.success(message, {
    icon: '🎉',
    duration: 5000,
  });

  // Add to celebration feed
  createCelebrationPost({
    type,
    message,
    timestamp: new Date(),
  });

  // Optional: Play sound
  playSound('/sounds/celebration.mp3');
};

// Celebration triggers:
// - Placement confirmed
// - Sprint goal met (2 placements)
// - Academy student graduates
// - Big deal closed (>$100k)
// - Client renewal secured
// - Pod hits monthly target
```

### Day 9-10: Final E2E Testing

**Complete User Flow Testing (18 Flows from Assessment):**

**Academy:**
- [ ] Flow 1: Public visitor applies to cohort
- [ ] Flow 2: Student views dashboard → starts lesson
- [ ] Flow 3: Student completes full lesson protocol (Theory → Demo → Verify → Build)
- [ ] Flow 4: Student views modules page
- [ ] Flow 5: Student views persona (resume builder)
- [ ] Flow 6: Student views blueprint (portfolio)

**HR:**
- [ ] Flow 7: HR manager views dashboard
- [ ] Flow 8: HR manager assigns training to employee ✅ (Fixed Sprint 1)
- [ ] Flow 9: Employee submits timesheet
- [ ] Flow 10: Manager approves timesheet
- [ ] Flow 11: Employee requests time off
- [ ] Flow 12: HR views people directory
- [ ] Flow 13: HR views org chart
- [ ] Flow 14: Employee views payroll
- [ ] Flow 15: Employee sets performance goals
- [ ] Flow 16: HR manages recruitment
- [ ] Flow 17: HR manages documents
- [ ] Flow 18: HR views analytics

**New Flows (Cross-Pollination):**
- [ ] Flow 19: TA sources candidate → Academy → Bench → Placed (complete journey)
- [ ] Flow 20: Recruiter submits candidate → Interview → Offer → Placement
- [ ] Flow 21: Bench Sales places consultant → Invoice → Payment
- [ ] Flow 22: Trainer creates course → Assigns to cohort → Grades students
- [ ] Flow 23: CEO reviews pod performance → Identifies issue → Coaches pod
- [ ] Flow 24: Admin creates user → Assigns roles → User logs in

**Performance Testing:**
- [ ] Page load times (<3s on 3G)
- [ ] API response times (<500ms)
- [ ] Real-time updates (WebSocket lag <1s)
- [ ] Image optimization (lazy loading)
- [ ] Bundle size (<500KB initial)

**Accessibility Testing:**
- [ ] Keyboard navigation (all pages)
- [ ] Screen reader compatibility
- [ ] ARIA labels
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators

### Sprint 6 Deliverables

**Completed:**
✅ CEO executive dashboard
✅ Admin panel (user management)
✅ Mobile optimization (all pages)
✅ Notification system (all triggers)
✅ Celebration system (confetti, toasts)
✅ 24 user flows tested end-to-end
✅ Performance optimized
✅ Accessibility compliant
✅ Production-ready

**Metrics:**
- **Total Pages:** 50+
- **Total Components:** 100+
- **Total User Flows Tested:** 24
- **Mobile Coverage:** 100%
- **Performance:** <3s page loads
- **Accessibility:** WCAG AA compliant

---

## Team Structure

### Recommended Team

**Option A: 3 Developers (Optimal)**
- **Dev 1 (Senior):** Architecture, complex features (Shared Boards, AI Twin)
- **Dev 2 (Mid):** Module development (Academy, HR, Clients)
- **Dev 3 (Junior):** Components, testing, polish

**Option B: 2 Developers (Minimum)**
- **Dev 1 (Senior):** Backend integration, core modules
- **Dev 2 (Mid):** Frontend features, testing
- **Note:** Extends timeline to 14-16 weeks

**Option C: 1 Developer (Not Recommended)**
- **Timeline:** 20-24 weeks
- **Risk:** High burnout, delayed delivery

### Roles & Responsibilities

**Senior Developer:**
- System architecture decisions
- Database schema review
- tRPC endpoint design
- Code review
- Performance optimization

**Mid Developer:**
- Feature implementation
- Component development
- API integration
- Testing (unit + integration)

**Junior Developer:**
- UI polish
- Component styling
- E2E testing
- Bug fixes
- Documentation

---

## Risk Management

### High-Risk Items

**Risk 1: Backend Not Ready**
- **Probability:** Medium
- **Impact:** Critical (blocks frontend)
- **Mitigation:**
  - Parallel backend development
  - Mock data fallback
  - Clear API contracts upfront

**Risk 2: AI Integration Complexity**
- **Probability:** Medium
- **Impact:** High (core feature)
- **Mitigation:**
  - Use existing Guru agents (already built)
  - Start with simple prompts
  - Iterate based on feedback

**Risk 3: Shared Boards Performance**
- **Probability:** Low
- **Impact:** High (many users, real-time)
- **Mitigation:**
  - Pagination (50 items per page)
  - Virtual scrolling for large lists
  - Debounce searches
  - WebSocket optimization

**Risk 4: Mobile Complexity**
- **Probability:** Medium
- **Impact:** Medium (tablet usage in client meetings)
- **Mitigation:**
  - Mobile-first design from start
  - Test on real devices early
  - Simplify mobile flows

**Risk 5: Scope Creep**
- **Probability:** High
- **Impact:** Medium (delays timeline)
- **Mitigation:**
  - Strict sprint scope
  - "Phase 2" backlog for nice-to-haves
  - Weekly stakeholder check-ins

### Contingency Plans

**If Backend Delayed:**
- Use mock data (already exists in `/frontend-prototype/`)
- Build UI-only for first 2 sprints
- Integrate backend in Sprint 3-6

**If Team Reduced:**
- Prioritize: HR (Sprint 1) → Shared Boards (Sprint 2-3) → Pod Workflows (Sprint 4-5) → CEO Dashboard (Sprint 6)
- Defer: Mobile optimization, advanced AI features
- Extend timeline

**If Testing Insufficient:**
- Add Sprint 7 (2 weeks) for testing + bug fixes
- Hire QA contractor
- Automate E2E tests (Playwright)

---

## Success Metrics

**By End of Sprint 6:**

**Functionality:**
- ✅ All 10 modules complete
- ✅ 50+ pages functional
- ✅ 100+ components reusable
- ✅ 24 user flows tested
- ✅ 0 critical bugs
- ✅ <5 minor bugs

**Performance:**
- ✅ <3s page load (desktop)
- ✅ <5s page load (mobile 3G)
- ✅ <500ms API response
- ✅ <1s real-time updates
- ✅ <500KB initial bundle

**Quality:**
- ✅ 80%+ test coverage
- ✅ WCAG AA accessibility
- ✅ Mobile responsive (all pages)
- ✅ No console errors
- ✅ TypeScript strict mode

**Business:**
- ✅ Demo-ready (can show to clients)
- ✅ Production-ready (can deploy to 38 employees)
- ✅ Scalable (can handle 100+ users)

---

## Next Steps After Sprint 6

**Week 13-14: Beta Launch**
- Deploy to production (Vercel)
- Onboard 38 employees
- Monitor for bugs
- Gather feedback
- Hot fixes as needed

**Week 15-16: Iteration**
- Address user feedback
- Optimize based on usage analytics
- Add Phase 2 features (from backlog)
- Performance tuning

**Month 4+: Scale**
- Add advanced features
- Improve AI capabilities
- Mobile app (React Native?)
- Slack integration
- Calendar sync
- Email sync

---

**Document Version:** 1.0
**Created:** 2025-11-23
**Format:** Sprint-by-Sprint Implementation Plan
**For:** Frontend Development Team
**Based On:** INTIME-UNIFIED-PLATFORM-PRD.md + HONEST-USER-FLOW-ASSESSMENT.md

**Total Timeline:** 12 weeks (6 sprints)
**Estimated Team:** 2-3 developers
**Estimated Hours:** 1,440-2,160 hours (480-720 hours per developer)
**Complexity:** High (unified platform, 10 modules, AI integration)
**Business Value:** Critical (replaces all internal tools, enables 5-pillar model)
