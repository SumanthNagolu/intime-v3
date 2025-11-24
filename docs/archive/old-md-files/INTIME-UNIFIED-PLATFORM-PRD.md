# InTime Unified Internal Platform - Complete PRD

**Project:** InTime Internal Employee Platform (Unified HR/Academy/Client/Talent/Productivity)
**Version:** 1.0
**Date:** 2025-11-23
**For:** Frontend Developer Team
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Zustand, tRPC, Supabase
**Platform:** Desktop + Tablet + Mobile (Responsive)
**Build Approach:** All modules at once (parallel development)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Context](#business-context)
3. [Pod Structure & Roles](#pod-structure--roles)
4. [Role-Permission Matrix](#role-permission-matrix)
5. [Navigation Architecture](#navigation-architecture)
6. [Module Specifications](#module-specifications)
7. [Shared Boards](#shared-boards)
8. [AI Twin Integration](#ai-twin-integration)
9. [Screen Specifications](#screen-specifications)
10. [Component Library](#component-library)
11. [Responsive Design](#responsive-design)
12. [Notification System](#notification-system)
13. [Celebration System](#celebration-system)
14. [Existing Code Integration](#existing-code-integration)
15. [Implementation Checklist](#implementation-checklist)

---

## 1. Executive Summary

### Vision

Build **ONE unified internal platform** where all InTime employees (19 pods, CEO to Junior) log in, see their personalized dashboard, access their workflows, and collaborate with their AI Twin.

### Key Principles

1. **Single Login, Multiple Personas** - One employee can wear multiple hats (e.g., HR + Recruiter)
2. **Pod-Centric** - Everything organized around 2-person pods (Senior + Junior)
3. **AI-First** - Every workflow has AI Twin assistance
4. **Shared Intelligence** - Central Job Board + Talent Board accessible to all
5. **Cross-Pollination** - One lead flows across all 5 pillars
6. **Celebration Culture** - Team celebrates every win together
7. **Mobile-Ready** - Recruiters use tablets in client meetings

### Scope

**19 Pods × 2 People = 38 Employees Year 1**
- 5 Bench Sales Pods (10 people)
- 5 Recruiting Pods (10 people)
- 5 TA Pods (10 people)
- 3 Training Academy Pods (6 people)
- 1 Cross-Border Specialist (1 person)
- CEO + HR + Admin (3 people)

**10 Integrated Modules:**
1. HR/PeopleOS (Employee lifecycle)
2. Academy Admin (Course management, student tracking)
3. Client Portal Admin (Client relationships, projects)
4. Talent Portal Admin (Candidate pipeline, bench management)
5. Recruiting Workflows (Sourcing, submissions, placements)
6. Bench Sales Workflows (Consultant placement, client outreach)
7. TA Workflows (Pipeline building, outreach automation)
8. Productivity Tools (Time tracking, analytics, AI Twin)
9. CEO Dashboard (Company metrics, strategic insights)
10. Admin Panel (User management, permissions, system config)

---

## 2. Business Context

### The 5-Pillar Staffing Model

**Pillar 1: Training Academy**
- Transform candidates → consultants (8 weeks)
- Guidewire specialization
- Graduates become bench consultants

**Pillar 2: Recruiting Services**
- 48-hour turnaround for client job orders
- Direct hire placements
- Commission: $500/placement (sprint bonus)

**Pillar 3: Bench Sales**
- 30-60 day placement for bench consultants
- Upskilling during bench time
- Utilization tracking (billable %)

**Pillar 4: Talent Acquisition**
- Pipeline building (outbound outreach)
- Long-term candidate relationships
- Feeds into Academy + Recruiting

**Pillar 5: Cross-Border Solutions**
- International talent (India → US)
- Visa sponsorship coordination
- Remote/hybrid placements

### Cross-Pollination Magic

**Example Flow:**
1. **TA Pod** sources candidate via LinkedIn outreach
2. Candidate not job-ready → **Academy Pod** enrolls them in 8-week program
3. Candidate graduates → **Bench Sales Pod** adds to bench consultant pool
4. Client need emerges → **Recruiting Pod** submits consultant
5. Placement successful → **Cross-Border Pod** handles visa if needed

**Result:** 1 sourced candidate = 5 revenue opportunities

### Key Metrics (Visible to All)

- **Pod Performance:** 2 placements per sprint per pod (target)
- **Revenue per Employee:** $245k/year
- **Academy Completion Rate:** 87%
- **Bench Utilization:** 85% target
- **Client Satisfaction:** 4.5+ stars

---

## 3. Pod Structure & Roles

### Pod Hierarchy

```
CEO (Sumanth)
├── HR Manager (1 person)
├── Admin (1 person)
└── 19 Pods
    ├── 5 Bench Sales Pods (Senior + Junior each)
    ├── 5 Recruiting Pods (Senior + Junior each)
    ├── 5 TA Pods (Senior + Junior each)
    ├── 3 Training Academy Pods (Senior Trainer + Junior Trainer each)
    └── 1 Cross-Border Specialist (1 person, no junior yet)
```

### Pod Types & Responsibilities

#### **Bench Sales Pod (5 pods, 10 people)**

**Senior Bench Sales Lead:**
- Place bench consultants with clients (30-60 day assignments)
- Build client relationships
- Negotiate rates ($70-90/hr)
- Mentor junior partner
- **AI Twin:** Suggests clients for each consultant, drafts outreach emails, forecasts placement probability

**Junior Bench Sales:**
- Manage bench consultant pool
- Track upskilling progress
- Schedule client interviews
- Learn from senior's deals
- **AI Twin:** Automates weekly check-ins with consultants, creates status reports

**Workflows:**
- View bench consultant list (from Academy graduates)
- Match consultant skills to client needs
- Outreach to clients (AI-drafted emails)
- Schedule interviews
- Track placement pipeline
- Commission tracking

---

#### **Recruiting Pod (5 pods, 10 people)**

**Senior Account Manager:**
- Own client relationships (2-3 key accounts)
- Receive job orders (48-hour SLA)
- Submit candidates
- Close placements ($150k+ revenue/year)
- **AI Twin:** Finds matching candidates from database, drafts candidate profiles, predicts client preferences

**Junior/Technical Recruiter:**
- Source candidates (LinkedIn, job boards)
- Screen resumes
- Conduct initial calls
- Learn senior's client preferences
- **AI Twin:** Automates Boolean searches, scores resumes, suggests outreach messages

**Workflows:**
- Receive job order from client
- Search talent pool (AI-powered)
- Submit candidate profiles to client
- Coordinate interviews
- Handle offer negotiations
- Track placements (2/sprint goal)
- **Shared:** Access to central Talent Board

---

#### **TA Pod (5 pods, 10 people)**

**Senior TA Specialist:**
- Build long-term pipeline (100+ candidates/month)
- Outbound campaigns (LinkedIn, email)
- Nurture passive candidates
- Feed Academy + Recruiting pipelines
- **AI Twin:** Automates LinkedIn outreach, personalizes messages at scale, tracks engagement

**Junior TA Specialist:**
- Execute outreach campaigns
- Screen inbound applications
- Maintain candidate database
- Learn sourcing techniques
- **AI Twin:** Suggests candidate personas to target, writes outreach sequences

**Workflows:**
- Launch outreach campaigns (AI-automated)
- Track candidate engagement
- Move warm leads to Recruiting or Academy
- Maintain talent pipeline dashboard
- **Shared:** Access to central Talent Board

---

#### **Training Academy Pod (3 pods, 6 people)**

**Senior Trainer:**
- Create course content (Guidewire curriculum)
- Mentor students (20 per cohort)
- Grade assignments
- Track student performance
- **AI Twin:** Auto-grades quizzes, suggests struggling students for intervention, creates personalized learning paths

**Junior Trainer:**
- Student support (Q&A, troubleshooting)
- Grade labs
- Monitor attendance
- Assist senior with content updates
- **AI Twin:** Answers common student questions, tracks completion rates

**Workflows:**
- Create/edit courses (modules, lessons, quizzes)
- Assign courses to students (or employees)
- Track student progress (dashboard)
- Grade submissions
- Issue certifications
- Coordinate with Bench Sales (graduates → bench pool)
- **Shared:** Assign training to employees via HR module

---

#### **Cross-Border Specialist (1 person)**

**Responsibilities:**
- Coordinate international placements (India → US)
- Handle visa paperwork (H-1B, OPT)
- Manage remote work compliance
- Support all pods with cross-border needs
- **AI Twin:** Tracks visa deadlines, generates compliance checklists, suggests candidates by visa status

**Workflows:**
- View all placements requiring visa support
- Track visa application status
- Coordinate with legal team
- Maintain compliance documentation

---

#### **HR Manager (1 person)**

**Responsibilities:**
- Employee onboarding/offboarding
- Timesheet approvals
- Leave management
- Compliance tracking
- Assign training to employees
- Performance reviews
- **AI Twin:** Automates onboarding checklists, flags compliance issues, suggests training based on role

**Workflows:**
- All HR/PeopleOS workflows (dashboard, people, time, payroll, performance, recruitment, documents, learning, analytics)
- Access to ALL employee data across pods

---

#### **Admin (1 person)**

**Responsibilities:**
- User management (create accounts, assign roles)
- Permission configuration
- System settings
- Data exports
- Integration monitoring
- **AI Twin:** Suggests role assignments, flags security issues, automates user provisioning

**Workflows:**
- User management panel
- Role/permission editor
- System configuration
- Audit logs
- Integration health dashboard

---

#### **CEO (Sumanth)**

**Responsibilities:**
- Strategic oversight
- Company performance tracking
- Pod performance reviews
- Financial forecasting
- Client escalations
- **AI Twin:** Provides strategic insights, forecasts revenue, suggests resource allocation, drafts board reports

**Workflows:**
- Executive dashboard (all company metrics)
- Pod performance scoreboard
- Revenue forecasting
- Client health dashboard
- Strategic planning tools
- Access to ALL modules (read-only or admin)

---

## 4. Role-Permission Matrix

### Permission Levels

- **View:** Can see data
- **Edit:** Can modify data
- **Create:** Can add new records
- **Delete:** Can remove records
- **Admin:** Full control

### Matrix

| Module | CEO | HR | Admin | Sr Bench | Jr Bench | Sr Recruit | Jr Recruit | Sr TA | Jr TA | Sr Trainer | Jr Trainer | X-Border |
|--------|-----|-----|-------|----------|----------|------------|------------|-------|-------|------------|------------|----------|
| **HR Dashboard** | View | Admin | View | View | View | View | View | View | View | View | View | View |
| **People Directory** | View | Admin | Edit | View | View | View | View | View | View | View | View | View |
| **Timesheets (Own)** | N/A | View | View | Edit | Edit | Edit | Edit | Edit | Edit | Edit | Edit | Edit |
| **Timesheets (Approve)** | View | Admin | View | Edit (Jr only) | - | Edit (Jr only) | - | Edit (Jr only) | - | Edit (Jr only) | - | - |
| **Leave Requests** | View | Admin | View | Edit (own) | Edit (own) | Edit (own) | Edit (own) | Edit (own) | Edit (own) | Edit (own) | Edit (own) | Edit (own) |
| **Performance Reviews** | View | Admin | View | View (own) | View (own) | View (own) | View (own) | View (own) | View (own) | View (own) | View (own) | View (own) |
| **Learning (Assign)** | - | Admin | - | - | - | - | - | - | - | Admin | Edit | - |
| **Learning (View Progress)** | View | Admin | View | View (pod) | View (pod) | View (pod) | View (pod) | View (pod) | View (pod) | Admin | Admin | - |
| **Academy Admin** | View | View | View | View | View | View | View | View | View | Admin | Edit | - |
| **Client Portal Admin** | Admin | View | Edit | View | View | Admin | Edit | View | View | - | - | View |
| **Talent Board (Shared)** | View | View | View | Edit | Edit | Admin | Admin | Admin | Admin | View | View | Edit |
| **Job Board (Shared)** | View | View | View | Admin | Admin | Admin | Admin | Edit | Edit | - | - | View |
| **Bench Console** | View | View | View | Admin | Admin | Edit | Edit | Edit | Edit | - | - | Edit |
| **Recruiting Workflows** | View | View | View | View | View | Admin | Edit | Edit | Edit | - | - | View |
| **TA Workflows** | View | View | View | View | View | Edit | Edit | Admin | Edit | - | - | View |
| **CEO Dashboard** | Admin | View | View | - | - | - | - | - | - | - | - | - |
| **Admin Panel** | View | View | Admin | - | - | - | - | - | - | - | - | - |
| **AI Twin** | Admin | Admin | Admin | Admin | Edit | Admin | Edit | Admin | Edit | Admin | Edit | Admin |
| **Productivity Tools** | Admin | Admin | Admin | Edit | Edit | Edit | Edit | Edit | Edit | Edit | Edit | Edit |

---

## 5. Navigation Architecture

### Global Navigation (All Users)

**Top Bar:**
```
┌─────────────────────────────────────────────────────────────┐
│ [InTime Logo] [Search Global] [Notifications🔔] [AI Twin💬] [Profile▼] │
└─────────────────────────────────────────────────────────────┘
```

**Sidebar (Role-Based):**

#### **CEO View:**
```
🏠 Dashboard (Executive)
📊 Company Metrics
👥 Pod Performance
💼 Client Health
💰 Financial Forecast
📋 Shared Boards
   ├── Job Board
   ├── Talent Board
   └── Combined View
🎓 Academy Overview
⚙️ Settings
🤖 AI Twin
```

#### **HR Manager View:**
```
🏠 Dashboard
👥 People
   ├── Directory
   ├── Org Chart
   ├── Onboarding
   └── Offboarding
⏰ Time & Attendance
💳 Payroll & Benefits
📈 Performance
📝 Recruitment
📄 Documents
🎓 Learning & Development
📊 Analytics
🤖 AI Twin
```

#### **Senior Recruiter View:**
```
🏠 Dashboard (My Pod)
📋 Shared Boards
   ├── Job Board (All)
   ├── Talent Board (All)
   └── Combined View
💼 My Clients (2-3 accounts)
📞 Active Reqs (Job Orders)
👤 My Candidates
📊 Pipeline (Recruiting funnel)
🎯 Placements (2/sprint goal)
👨‍🎓 Junior Performance
⏰ My Timesheet
🎓 My Training
🤖 AI Twin
```

#### **Junior Recruiter View:**
```
🏠 Dashboard (Learning Mode)
📋 Shared Boards
   ├── Talent Board (Search/Add)
   ├── Job Board (View)
   └── Combined View
📞 Assigned Reqs
🔍 Sourcing Tools
👤 My Candidates
📚 Learning Center
   ├── Senior's Workflows (Shadow)
   └── My Training Courses
⏰ My Timesheet
🤖 AI Twin (Learning Assistant)
```

#### **Senior Bench Sales View:**
```
🏠 Dashboard (My Pod)
📋 Shared Boards
   ├── Talent Board (Bench Consultants)
   ├── Job Board (Client Needs)
   └── Combined View
👥 Bench Console (Consultants on bench)
💼 My Clients
📊 Placement Pipeline
🎯 Placements (2/sprint goal)
👨‍🎓 Junior Performance
⏰ My Timesheet
🤖 AI Twin
```

#### **Senior TA View:**
```
🏠 Dashboard (My Pod)
📋 Shared Boards
   ├── Talent Board (Pipeline)
   ├── Job Board (View)
   └── Combined View
🚀 Outreach Campaigns
👤 My Pipeline (100+/month)
📧 Engagement Tracker
🎯 Warm Leads
👨‍🎓 Junior Performance
⏰ My Timesheet
🤖 AI Twin (Automation)
```

#### **Senior Trainer View:**
```
🏠 Dashboard
🎓 Academy Admin
   ├── Courses (Create/Edit)
   ├── Students (20/cohort)
   ├── Assignments (Grade)
   ├── Progress Tracking
   └── Certifications
👥 My Cohort
📊 Performance Analytics
👨‍🎓 Junior Trainer
⏰ My Timesheet
🤖 AI Twin (Grading Assistant)
```

#### **Admin View:**
```
🏠 Dashboard
👥 User Management
🔐 Roles & Permissions
⚙️ System Settings
📊 Audit Logs
🔗 Integrations
📄 Data Exports
🤖 AI Twin
```

---

## 6. Module Specifications

### 6.1 HR/PeopleOS Module

**Purpose:** Employee lifecycle management (onboarding → offboarding)

**Existing Code:** `/frontend-prototype/components/hr/` (9 pages, 60% functional)

**Pages:**

#### **6.1.1 HR Dashboard** (`/hr/dashboard`)

**Current State:** ✅ Exists, needs enhancements

**Sections:**
1. **Stat Cards:**
   - Total Headcount (38 employees Year 1)
   - Active Onboarding (new hires)
   - Open Roles (requisitions)
   - Retention Rate (98% target)

2. **Pending Approvals:**
   - Time Off Requests (requires modal: ApproveLeaveModal)
   - Commission Requests (requires modal: ApproveCommissionModal)
   - Expense Requests (requires modal: ApproveExpenseModal)

3. **New Hire Progress:**
   - List of employees in onboarding (Day X of 30)
   - Checklist progress (Equipment, Benefits, Training)

4. **Upcoming Events:**
   - Sprint Reviews
   - Payroll Cutoff
   - Open Enrollment

5. **Quick Actions:**
   - + Add Employee → Opens AddEmployeeModal
   - Run Off-Cycle Payroll → Confirmation dialog
   - Export Census Data → Downloads CSV

**Enhancements Needed:**
- ✅ Create ApproveLeaveModal (approve/reject with notes)
- ✅ Create ApproveCommissionModal (verify placements, approve payout)
- ✅ Create ApproveExpenseModal (view receipt, approve/reject)
- ✅ Create AddEmployeeModal (multi-step: Personal → Role → Pod → Onboarding)
- ✅ Make Quick Actions functional

---

#### **6.1.2 People Directory** (`/hr/people`)

**Current State:** ✅ Exists, 90% functional

**Features:**
- Employee cards (avatar, name, role, pod, location, email, status)
- Search by name/role (needs implementation)
- Filter by pod/department (needs implementation)
- View Profile button → navigates to `/hr/profile/:employeeId`

**Enhancements Needed:**
- ✅ Implement search functionality (client-side filter)
- ✅ Add filter dropdowns (Pod, Department, Status)
- ✅ Add "Add Person" button → Opens AddEmployeeModal
- ✅ Show pod badge color-coded (Recruiting=orange, Bench=blue, TA=green, Academy=purple)

---

#### **6.1.3 Org Chart** (`/hr/org`)

**Current State:** ✅ Exists, beautiful visual, 100% functional

**Features:**
- CEO → Departments → Pods → Employees
- Visual pod structure (Senior + Junior pairs)
- Click pod/employee → Shows quick info tooltip

**Enhancements Needed:**
- ✅ Click employee → Navigate to profile
- ✅ Show open positions (dotted outline for unfilled Junior roles)
- ✅ Pod performance indicator (green=on track, yellow=needs support)

---

#### **6.1.4 Time & Attendance** (`/hr/time`)

**Current State:** ✅ Exists, needs form functionality

**Tabs:**
1. **Timesheets:**
   - Current pay period (bi-weekly)
   - Daily hours (Mon-Fri)
   - Project allocation (billable vs internal)
   - Total Hours (target: 80 hrs/2 weeks)
   - Utilization % (billable %)
   - Submit for Approval button → Changes status to "Pending"

2. **Time Off:**
   - PTO balance (15 days/year)
   - Sick leave balance (10 days/year)
   - Request Time Off button → Opens RequestTimeOffModal
   - Upcoming time off list

3. **Sprints:**
   - Sprint calendar (2-week cycles)
   - Pod sprint goals (2 placements/sprint)
   - Sprint retrospective notes

**Enhancements Needed:**
- ✅ Make hours editable (inline editing or modal)
- ✅ Create RequestTimeOffModal (date range picker, type dropdown, reason textarea)
- ✅ "Submit for Approval" → Shows confirmation, changes status
- ✅ Manager view: Pending approvals list with Approve/Reject buttons

---

#### **6.1.5 Payroll & Benefits** (`/hr/payroll`)

**Current State:** ✅ Exists, commission tracker perfect

**Sections:**
1. **YTD Earnings:** $92,450 (on track indicator)
2. **Next Payday:** Oct 15 (est. $4,625)
3. **Recent Paystubs:** Download button per paystub
4. **Commission Tracker:**
   - Pod name (e.g., "Recruiting Pod A")
   - Placements count (2/sprint)
   - Sprint Bonus ($500)
   - Commission Rate (2%)
   - Note: "Commission paid 30 days after start date"
5. **Benefits:**
   - Health Insurance (plan details)
   - 401(k) (contribution %, match %)
   - Manage Benefits button → Opens BenefitsModal
6. **Total Rewards:** $165k statement, Download button

**Enhancements Needed:**
- ✅ Download paystub → Generates PDF (or downloads pre-generated file)
- ✅ Create BenefitsModal (edit health plan, 401k %, dependents)
- ✅ Download Total Rewards Statement → PDF

---

#### **6.1.6 Performance** (`/hr/performance`)

**Current State:** ✅ Exists, OKR display works

**Tabs:**
1. **My Goals:**
   - Q4 OKRs (current quarter)
   - Goal cards: Title, Description, Progress bar, Status badge
   - + Add Goal button → Opens AddGoalModal

2. **Reviews:**
   - Quarterly review history
   - Performance rating (1-5 scale)
   - Manager feedback
   - Self-assessment

3. **360 Feedback:**
   - Peer feedback requests
   - Give feedback to peers
   - View received feedback

**Enhancements Needed:**
- ✅ Create AddGoalModal (title, description, target metric, deadline)
- ✅ Edit goal progress (inline or modal)
- ✅ Reviews tab: Display review history, upload review form
- ✅ 360 Feedback: Request feedback form, submit feedback form

---

#### **6.1.7 Recruitment (Internal Hiring)** (`/hr/recruitment`)

**Current State:** ✅ Exists, requisition list works

**Tabs:**
1. **Requisitions:**
   - Req cards (ID, title, department/pod, applicant count, status)
   - Create Requisition button → Opens CreateReqModal
   - Search requisitions

2. **Candidates:**
   - Applicant list (for internal roles)
   - Pipeline stages (Applied → Screened → Interview → Offer)
   - Move candidates between stages

3. **Onboarding:**
   - New hires in onboarding (Day X of 30)
   - Checklist progress
   - Assign onboarding buddy (Senior in their pod)

**Enhancements Needed:**
- ✅ Create CreateReqModal (job title, department, pod, description, requirements)
- ✅ Candidates tab: Kanban board (drag-drop between stages)
- ✅ Onboarding tab: Checklist with auto-assignments

---

#### **6.1.8 Documents** (`/hr/documents`)

**Current State:** ✅ Exists, table display works

**Features:**
- Document table (Name, Category, Last Updated, Action)
- Filter by category (All Files, Policies, Templates)
- Search documents
- Upload button → File upload modal
- Download button per document

**Enhancements Needed:**
- ✅ Search functionality (client-side filter)
- ✅ Upload modal (drag-drop file, select category, add description)
- ✅ Download → Actual file download (or placeholder PDF)
- ✅ Categories: Policy, Template, Benefits, Handbook, Contract

---

#### **6.1.9 Learning & Development** (`/hr/learning`)

**Current State:** 🔴 Assign button broken (critical bug)

**Sections:**
1. **Stats Cards:**
   - Completion Rate (87%)
   - Active Learners (12 employees)
   - Certifications Issued (5 this quarter)

2. **Course Catalog:**
   - Course cards (module #, title, description, week, lessons count)
   - Assign to Employee button → Opens AssignCourseModal

3. **Employee Progress Tab:**
   - Table: Employee Name, Course, Progress %, Status, Actions
   - Filter by pod/department
   - Send Reminder button (for overdue)

**Enhancements Needed:**
- 🔴 **FIX:** Create AssignCourseModal (employee multi-select, start/due dates, priority, message)
- ✅ Add "Employee Progress" tab (new component)
- ✅ Progress table with filters
- ✅ Send Reminder → Email notification (or in-app notification)

**AssignCourseModal Spec:**
```typescript
interface AssignCourseModalProps {
  course: Course;
  onClose: () => void;
  onSubmit: (data: AssignmentData) => void;
}

// Fields:
// - Employee multi-select (search + checkboxes)
// - Start Date (date picker)
// - Due Date (optional date picker)
// - Priority (radio: Optional, Recommended, Mandatory)
// - Message (optional textarea)
// - Submit: "Assign Course to X Employees"
```

---

#### **6.1.10 Analytics** (`/hr/analytics`)

**Current State:** ✅ Exists, beautiful charts

**Sections:**
1. **Revenue per Employee Chart:**
   - Line graph (Apr → Oct)
   - Current: $245k/employee

2. **Pod Productivity:**
   - Average: 2.4 placements/sprint
   - Breakdown by pod:
     - Recruiting Pod A: High Performance
     - Sales Pod 1: On Track
     - Recruiting Pod B: Needs Support

3. **Additional Metrics:**
   - Headcount trend
   - Attrition rate
   - Training completion rate
   - Time-to-hire

**Enhancements Needed:**
- ✅ Add more charts (using Recharts library)
- ✅ Export report button → Downloads CSV/PDF
- ✅ Date range filter (last 30 days, quarter, year)

---

### 6.2 Academy Admin Module

**Purpose:** Course management, student tracking, certification issuance

**New Module:** Needs to be built (leverage existing Academy student portal)

**Existing Code:**
- `/src/app/students/` - Student-facing Academy portal (dashboard, courses, lessons)
- `/frontend-prototype/components/` - Academy UI (lesson protocol, modules)

**Pages:**

#### **6.2.1 Academy Dashboard** (`/academy/admin/dashboard`)

**For:** Senior Trainers, HR (viewing), CEO (viewing)

**Sections:**
1. **Active Cohorts:**
   - November 2025 Cohort (20 students, Week 4 of 8)
   - Completion rate: 18/20 on track
   - Click cohort → Navigate to cohort detail

2. **Course Library:**
   - 9 modules (InsuranceSuite → Integration Developer)
   - 40+ lessons total
   - Edit Course button (per course)

3. **Student Performance:**
   - Top performers (leaderboard)
   - At-risk students (< 60% progress)
   - Recent graduations

4. **Certifications Issued:**
   - This quarter: 5 certified
   - Click → View certificate details

5. **Quick Actions:**
   - + Create Course
   - + Enroll Students
   - + Create Cohort

---

#### **6.2.2 Course Builder** (`/academy/admin/courses`)

**Features:**
1. **Course List:**
   - Table: Course Name, Module #, Lessons, Status (Draft/Published)
   - Create Course button

2. **Course Editor:**
   - Course metadata (title, description, prerequisite)
   - Module structure (drag-drop reordering)
   - Lesson builder (per lesson):
     - **Theory Tab:** Upload slides (PDF or images), add text content
     - **Demo Tab:** Upload video, add instructions
     - **Verify Tab:** Quiz builder (multiple choice, code challenges)
     - **Build Tab:** Lab instructions, user story, acceptance criteria
   - Publish button

**Quiz Builder:**
```
┌─────────────────────────────────────┐
│ Quiz: Coverage Patterns             │
├─────────────────────────────────────┤
│ Question 1:                          │
│ What is a CovTerm?                  │
│                                      │
│ ( ) A database table                │
│ (•) A coverage term definition      │
│ ( ) A Gosu class                    │
│ ( ) An XML file                     │
│                                      │
│ Correct Answer: B                   │
│ Explanation: CovTerms define...    │
│                                      │
│ [+ Add Question] [Save Quiz]        │
└─────────────────────────────────────┘
```

---

#### **6.2.3 Student Management** (`/academy/admin/students`)

**Features:**
1. **Student List:**
   - Table: Name, Cohort, Progress %, Status, Last Active
   - Filter: Cohort, Status (Active/Graduated/Dropped)
   - Search by name

2. **Student Detail:**
   - Profile (name, email, cohort, start date)
   - Progress dashboard (per module)
   - Assignment grades
   - AI Mentor chat history (view only)
   - Intervention notes (for at-risk students)

3. **Bulk Actions:**
   - Enroll in Cohort (multi-select students)
   - Assign Bonus Content
   - Send Message (bulk email)

---

#### **6.2.4 Grading Center** (`/academy/admin/grading`)

**Features:**
1. **Pending Submissions:**
   - List: Student, Assignment, Submitted Date, Status
   - Click → Open submission viewer

2. **Submission Viewer:**
   - Student code/answer
   - AI suggested grade (from AI Mentor)
   - Manual override (if needed)
   - Feedback textarea
   - Approve/Reject buttons

3. **Auto-Grading:**
   - Quizzes: Auto-graded (multiple choice)
   - Labs: AI-graded (code quality, completeness)
   - Trainer review required for capstone projects

---

#### **6.2.5 Certifications** (`/academy/admin/certifications`)

**Features:**
1. **Issue Certificate:**
   - Student dropdown (graduated students only)
   - Course/cohort selection
   - Issue Date
   - Certificate template preview
   - Generate PDF button

2. **Certificate Templates:**
   - Guidewire Developer Certification (8-week program)
   - Specialized tracks (PolicyCenter, BillingCenter)
   - Custom templates (upload logo, edit text)

---

### 6.3 Client Portal Admin Module

**Purpose:** Manage client relationships, projects, invoicing

**New Module:** Needs to be built

**Pages:**

#### **6.3.1 Client Dashboard** (`/clients/dashboard`)

**For:** Recruiters (view their clients), Bench Sales (view their clients), CEO (view all)

**Sections:**
1. **My Clients:**
   - Cards: Client name, logo, active projects, revenue YTD
   - Health score (green/yellow/red based on engagement)

2. **Active Projects:**
   - Table: Client, Consultant, Start Date, End Date, Billing Rate
   - Status: Active, Ending Soon, On Hold

3. **Revenue This Month:**
   - Chart: Billable hours × rate
   - Projection for quarter

4. **Recent Activity:**
   - New job order received (Client X, Java Developer)
   - Consultant placed (Client Y, Guidewire Admin)
   - Invoice sent (Client Z, $15,000)

---

#### **6.3.2 Client List** (`/clients/list`)

**Features:**
1. **Client Cards/Table:**
   - Name, Industry, Primary Contact, Phone, Email
   - Pod Owner (which recruiter owns this client)
   - Status (Active, Prospecting, Inactive)
   - + Add Client button

2. **Client Detail Page:**
   - Overview (company info, HQ location, size)
   - Contacts (hiring manager, HR, procurement)
   - Active Projects (consultants currently placed)
   - Job Orders (open reqs)
   - Placement History (past placements)
   - Invoices (billing history)
   - Notes (CRM-style notes from recruiters)

---

#### **6.3.3 Job Orders** (`/clients/job-orders`)

**Features:**
1. **Job Order Kanban:**
   - Columns: New → Working → Submitted → Interview → Offer → Placed
   - Drag-drop cards between stages
   - Card: Client name, Job title, Submitted candidates count, Days open

2. **Job Order Detail:**
   - Client name
   - Job title, description, requirements
   - Salary range ($X - $Y)
   - Location (remote/hybrid/onsite)
   - Recruiter assigned
   - Candidates submitted (list)
   - Timeline (SLA: 48 hours)

3. **Create Job Order:**
   - Client dropdown
   - Job title, description
   - Requirements (skills, years exp)
   - Salary range
   - Assign to Recruiter (auto-assign to client owner)

---

#### **6.3.4 Projects** (`/clients/projects`)

**Features:**
1. **Project List:**
   - Table: Client, Consultant, Role, Start, End, Rate, Status
   - Filter: Client, Status, Pod

2. **Project Detail:**
   - Client info
   - Consultant assigned (with photo, resume link)
   - Project scope (description)
   - Billing: Hourly rate, hours worked, invoiced amount
   - Timeline: Start date, end date, extension requests
   - Health check: Client satisfaction, consultant performance

---

#### **6.3.5 Invoicing** (`/clients/invoicing`)

**Features:**
1. **Invoice List:**
   - Table: Client, Invoice #, Amount, Status (Draft/Sent/Paid)
   - Create Invoice button

2. **Invoice Builder:**
   - Client dropdown
   - Consultant dropdown (or multiple if consolidated invoice)
   - Billing period (start - end date)
   - Hours worked (auto-populated from timesheets)
   - Rate (from project)
   - Total: Hours × Rate
   - Notes (optional)
   - Generate PDF button
   - Send Invoice button (email to client contact)

---

### 6.4 Talent Portal Admin Module

**Purpose:** Central talent database, bench management, cross-pod visibility

**New Module:** Needs to be built (critical for cross-pollination)

**Pages:**

#### **6.4.1 Talent Board (Shared)** (`/talent/board`)

**For:** ALL pods (Recruiting, Bench, TA, Academy)

**This is THE central talent database. One shared pool.**

**Features:**

1. **Unified Talent Search:**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │ 🔍 Search Talent (AI-Powered)                               │
   │                                                              │
   │ [Guidewire PolicyCenter Developer, 3+ years]     [Search]  │
   │                                                              │
   │ Filters:                                                     │
   │ Status: [All▼] [Candidate] [Student] [Bench] [Placed]      │
   │ Skills: [Guidewire] [Java] [SQL] [Integration] [+ Add]     │
   │ Location: [All▼] [Remote] [NY] [CA] [TX]                   │
   │ Availability: [Immediate] [2 weeks] [1 month] [Future]     │
   │ Source: [TA Pipeline] [Academy] [Bench] [External]         │
   │                                                              │
   │ Results: 47 matches                                         │
   └─────────────────────────────────────────────────────────────┘
   ```

2. **Talent Cards:**
   ```
   ┌─────────────────────────────────────────┐
   │ 👤 Priya Sharma                          │
   │ Guidewire PolicyCenter Developer        │
   │                                          │
   │ 🎓 Status: Academy Graduate (Week 8)    │
   │ 📍 Location: Austin, TX                 │
   │ 💼 Availability: Immediate               │
   │ ⭐ Skills: Guidewire PC, Java, Gosu     │
   │                                          │
   │ Source: Training Academy (Nov cohort)   │
   │ Added by: Senior Trainer A              │
   │ Last Updated: 2 days ago                │
   │                                          │
   │ [View Profile] [Add to Job] [Move to Bench] │
   └─────────────────────────────────────────┘
   ```

3. **Status Pipeline:**
   - **Pipeline** (TA sourced, not yet qualified)
   - **Candidate** (active in recruiting process)
   - **Student** (enrolled in Academy)
   - **Graduate** (completed Academy, available for placement)
   - **Bench** (consultant between assignments)
   - **Placed** (currently on client project)
   - **Alumni** (past placements, can be re-engaged)

4. **Bulk Actions:**
   - Add to Job Order (submit to client)
   - Move to Bench (graduate → bench pool)
   - Enroll in Academy (candidate → student)
   - Send to TA (placed consultant → re-engage for new role)
   - Export to CSV

5. **AI Twin Integration:**
   - **Auto-Categorization:** AI tags skills from resume
   - **Match Suggestions:** "This candidate matches 3 open jobs" (shows Job Board matches)
   - **Upskilling Recommendations:** "Suggest Academy course: BillingCenter Basics"
   - **Engagement Prompts:** "Last contacted 30 days ago, send follow-up?"

---

#### **6.4.2 Bench Console** (`/talent/bench`)

**For:** Bench Sales pods (primary), Recruiters (view), TA (view)

**Purpose:** Manage consultants on bench (between client assignments)

**Features:**

1. **Bench Dashboard:**
   ```
   ┌─────────────────────────────────────────┐
   │ Bench Utilization                        │
   │ 12 Consultants on Bench                 │
   │ Target: 30-60 day placement cycle       │
   │ Current Avg: 45 days                    │
   │                                          │
   │ Utilization Rate: 78% (Target: 85%)    │
   └─────────────────────────────────────────┘
   ```

2. **Bench Consultant List:**
   - Table: Name, Skills, Days on Bench, Upskilling Status, Next Interview
   - Sort by: Days on Bench (longest first = high priority)
   - Filter: Skills, Location, Availability

3. **Consultant Card:**
   ```
   ┌─────────────────────────────────────────┐
   │ 👤 Raj Patel                             │
   │ Guidewire Developer                     │
   │                                          │
   │ 🕐 On Bench: 32 days (Target: <60)     │
   │ 📍 Dallas, TX (Willing to relocate)    │
   │ ⭐ Skills: GW PC, BC, Java, SQL         │
   │                                          │
   │ Upskilling:                              │
   │ ✅ BillingCenter Basics (Completed)     │
   │ 🔄 Integration Developer (60% done)     │
   │                                          │
   │ Outreach:                                │
   │ 📧 Last contact: 5 days ago             │
   │ 📞 Next check-in: Tomorrow              │
   │ 🤖 AI: "3 matching client needs"        │
   │                                          │
   │ [View Profile] [Match to Jobs] [Send Update] │
   └─────────────────────────────────────────┘
   ```

4. **Weekly Check-In:**
   - AI-automated: "How's your week going? Any interviews scheduled?"
   - Consultant replies via email (tracked in system)
   - Bench Sales pod sees responses

5. **AI Twin Actions for Bench Sales:**
   - **Match Consultant to Jobs:** AI scans Job Board, suggests top 3 matches
   - **Draft Outreach:** AI writes personalized email to clients: "I have a Guidewire expert available..."
   - **Upskilling Plan:** AI suggests courses to fill skill gaps
   - **Forecast Placement:** AI predicts placement probability (based on skills, market, bench time)

---

#### **6.4.3 Candidate Pipeline** (`/talent/pipeline`)

**For:** Recruiters (primary), TA (feed pipeline), Bench (view)

**Purpose:** Recruiting funnel for active job orders

**Features:**

1. **Pipeline Kanban:**
   - Columns: Sourced → Screened → Submitted → Interview → Offer → Placed
   - Drag-drop candidates between stages
   - Card: Name, Job applied for, Days in stage

2. **Candidate Detail:**
   - Profile (name, photo, contact)
   - Resume (view/download PDF)
   - Skills matrix (AI-extracted from resume)
   - Application notes (recruiter comments)
   - Interview feedback (from client)
   - Status history (audit trail)

3. **AI Twin Actions for Recruiters:**
   - **Resume Scoring:** AI rates resume match to job (1-100 score)
   - **Email Draft:** AI writes candidate submission email to client
   - **Interview Prep:** AI generates interview questions for this candidate
   - **Salary Negotiation:** AI suggests salary range based on market data

---

#### **6.4.4 Academy Graduates** (`/talent/graduates`)

**For:** Academy pods (track), Bench Sales (recruit), Recruiters (view)

**Purpose:** Track Academy graduates ready for placement

**Features:**

1. **Graduate List:**
   - Table: Name, Cohort, Graduation Date, Certification, Placement Status
   - Filter: Cohort, Placed/Unplaced

2. **Graduate Profile:**
   - Academy performance (grades, capstone project)
   - Assumed persona (resume with 7-year experience profile)
   - Blueprint (60-page technical spec they authored)
   - Skills: Guidewire PC/BC/CC, Java, Gosu, SQL, Integrations
   - Availability: Immediate
   - Placement status:
     - **Available:** Not yet placed, ready for interviews
     - **Interviewing:** Active in recruiting process
     - **Placed:** On client project (celebrate! 🎉)

3. **Auto-Transition:**
   - Graduate → Auto-added to Bench Console
   - Graduate → Auto-added to Talent Board (status: Graduate)
   - Bench Sales notified: "New graduate available: Priya Sharma"

---

### 6.5 Shared Boards (Job Board + Talent Board + Combined)

**Purpose:** Central intelligence - ALL pods see all opportunities and talent

**Critical for Cross-Pollination**

---

#### **6.5.1 Job Board (Shared)** (`/shared/jobs`)

**For:** ALL pods (Recruiting, Bench, TA, Academy, Cross-Border)

**Purpose:** Every job order (client need) visible to all pods

**Features:**

1. **Job List View:**
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ 🔍 Search Jobs                                          │
   │ [Guidewire Developer]                    [Search]       │
   │                                                          │
   │ Filters:                                                 │
   │ Client: [All▼] [Acme Insurance] [Global Mutual]        │
   │ Skills: [Guidewire] [Java] [Integration] [+ Add]       │
   │ Location: [All▼] [Remote] [NY] [CA]                    │
   │ Status: [All▼] [Open] [Filled] [On Hold]               │
   │ Owner: [All Pods▼] [My Pod] [Recruiting Pod A]         │
   │                                                          │
   │ Results: 23 open jobs                                   │
   └─────────────────────────────────────────────────────────┘
   ```

2. **Job Cards:**
   ```
   ┌─────────────────────────────────────────┐
   │ 💼 Guidewire PolicyCenter Developer     │
   │ Client: Acme Insurance                  │
   │                                          │
   │ 📍 Location: Remote                     │
   │ 💰 Salary: $110k - $130k                │
   │ 🎯 Skills: GW PC, Java, 3+ years       │
   │ 📅 Posted: 2 days ago                   │
   │ ⏱️ SLA: 46 hours remaining (48hr SLA)  │
   │                                          │
   │ Owner: Recruiting Pod A (Sarah Lao)    │
   │ Submitted: 2 candidates                 │
   │                                          │
   │ 🤖 AI: "3 bench consultants match"      │
   │                                          │
   │ [View Details] [Match Talent] [Claim Job] │
   └─────────────────────────────────────────┘
   ```

3. **Cross-Pod Collaboration:**
   - **Recruiting Pod** owns the client relationship, receives job order
   - **Bench Sales Pod** sees job, checks if bench consultants match
   - **TA Pod** sees job, adds to outreach targeting (find candidates with these skills)
   - **Academy Pod** sees job, creates course content for these skills

4. **AI Twin Job Matching:**
   - Scans Talent Board for matches
   - Shows: "3 bench consultants match this job" (click → see list)
   - Suggests: "No exact match, but 2 candidates could upskill in 2 weeks"

5. **Claim Job:**
   - If a pod member (Bench Sales) can fill this job with their consultant, they "Claim" it
   - Notification sent to job owner (Recruiter): "Bench Sales Pod 1 has a match for your job"
   - Collaboration workflow begins (split commission if applicable)

---

#### **6.5.2 Combined View** (`/shared/combined`)

**For:** ALL pods (most powerful view)

**Purpose:** See jobs + matching talent side-by-side (AI-powered recommendations)

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 AI-Powered Job-Talent Matching                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌───────────────────────────┐  ┌───────────────────────────┐  │
│ │ 💼 JOB                    │  │ 👤 MATCHING TALENT        │  │
│ │                           │  │                           │  │
│ │ Guidewire PC Developer    │  │ 1. Priya Sharma (95%)    │  │
│ │ Acme Insurance            │  │    Academy Graduate       │  │
│ │ Remote, $110-130k         │  │    ✅ Available now       │  │
│ │                           │  │    [Submit to Client]     │  │
│ │ Skills: GW PC, Java       │  │                           │  │
│ │ Posted: 2 days ago        │  │ 2. Raj Patel (88%)       │  │
│ │ Owner: Recruiting Pod A   │  │    On Bench (32 days)    │  │
│ │                           │  │    ✅ Available now       │  │
│ │ 🤖 3 Strong Matches       │  │    [Submit to Client]     │  │
│ │                           │  │                           │  │
│ │ [View Full Details]       │  │ 3. Lisa Chen (75%)       │  │
│ └───────────────────────────┘  │    TA Pipeline           │  │
│                                 │    ⚠️ Needs 2 wks notice │  │
│                                 │    [Contact Candidate]    │  │
│                                 └───────────────────────────┘  │
│                                                                  │
│ ┌───────────────────────────┐  ┌───────────────────────────┐  │
│ │ 💼 JOB                    │  │ 👤 MATCHING TALENT        │  │
│ │                           │  │                           │  │
│ │ Integration Architect     │  │ 1. Amit Kumar (82%)      │  │
│ │ Global Mutual             │  │    On Bench (15 days)    │  │
│ │ Hybrid (Chicago)          │  │    ✅ Completed Int. course│ │
│ │ $130-150k                 │  │    [Submit to Client]     │  │
│ │                           │  │                           │  │
│ │ Skills: GW Cloud API      │  │ 2. No other matches      │  │
│ │ Posted: 5 days ago        │  │                           │  │
│ │ Owner: Recruiting Pod B   │  │ 🤖 Suggestion:           │  │
│ │                           │  │ "Source via TA Pod"      │  │
│ │ 🤖 1 Match, Source More   │  │ [Create Outreach Campaign]│  │
│ └───────────────────────────┘  └───────────────────────────┘  │
│                                                                  │
│ [Show More Matches]                                             │
└─────────────────────────────────────────────────────────────────┘
```

**AI Matching Algorithm:**
- Skills match (80% weight)
- Availability (10% weight)
- Location match (5% weight)
- Salary expectation vs range (5% weight)
- Match score: 1-100%

**Actions:**
- **Submit to Client:** Adds candidate to job order pipeline
- **Contact Candidate:** Opens email draft (AI-generated)
- **Create Outreach Campaign:** If no matches, launches TA outreach for these skills
- **Upskill:** If near-match, suggests Academy course to close gap

---

### 6.6 Recruiting Pod Workflows

**For:** Senior Account Managers + Junior Recruiters (5 pods, 10 people)

**Pages:**

#### **6.6.1 Recruiting Dashboard** (`/recruiting/dashboard`)

**Pod-Specific Dashboard** (Senior + Junior see same data, different permissions)

**Sections:**

1. **Pod Performance:**
   ```
   ┌─────────────────────────────────────────┐
   │ Recruiting Pod A Performance            │
   │ Sprint Goal: 2 Placements               │
   │                                          │
   │ This Sprint (Nov 11-24):                │
   │ ✅ 2 Placements (Goal met! 🎉)          │
   │ 💰 $1,000 Sprint Bonus earned           │
   │                                          │
   │ Pipeline Health:                         │
   │ 🟢 5 Candidates in Interview stage      │
   │ 🟡 2 Offers pending                     │
   │ 🔴 3 Reqs at risk (SLA < 12 hrs)        │
   └─────────────────────────────────────────┘
   ```

2. **My Clients** (Senior only):
   - Client cards (2-3 key accounts)
   - Health score, active projects, revenue YTD

3. **Active Job Orders:**
   - Table: Client, Job Title, Days Open, Submitted, Interview, Offer
   - SLA countdown (48 hours to first submission)

4. **Today's Tasks** (AI-Generated):
   - "Follow up with Acme Insurance (job order 3 days old)"
   - "Submit 2 more candidates to Global Mutual (SLA: 6 hours)"
   - "Prep candidate Lisa Chen for interview tomorrow at 2pm"

5. **Junior Performance** (Senior only):
   - Junior's sourcing stats (candidates sourced this week)
   - Training progress (courses assigned)
   - Shadowing notes (what junior learned)

---

#### **6.6.2 My Clients** (`/recruiting/clients`)

**Senior Only** (Juniors have view access)

**Features:**
- Client list (owned accounts)
- Add Client button
- Client detail page:
  - Contact info, company details
  - Active projects
  - Job order history
  - Placement history
  - Revenue generated
  - Relationship notes (CRM-style)
  - Next touchpoint reminder

---

#### **6.6.3 Job Order Pipeline** (`/recruiting/pipeline`)

**Features:**

1. **Kanban Board:**
   - Columns: New → Sourcing → Submitted → Interview → Offer → Placed
   - Job order cards (drag-drop between stages)

2. **Job Order Detail:**
   - Client, job title, description
   - Requirements checklist
   - Salary range
   - Submitted candidates (list with status)
   - Interview schedule
   - AI suggestions: "3 talent matches available"

---

#### **6.6.4 Candidate Submissions** (`/recruiting/submissions`)

**Features:**

1. **Submission List:**
   - Table: Candidate, Job, Client, Submitted Date, Status
   - Filter: Client, Status (Submitted/Interview/Offer/Placed/Rejected)

2. **Submit Candidate Workflow:**
   - Select candidate (from Talent Board)
   - Select job order
   - AI generates submission email:
     ```
     Subject: Guidewire PolicyCenter Developer - Priya Sharma

     Hi [Hiring Manager],

     I'm excited to submit Priya Sharma for your Guidewire PolicyCenter Developer role.

     Priya has 7 years of experience in Guidewire implementations, including:
     - PolicyCenter configuration (LOB, Rating, Forms)
     - Integration development (Cloud API, Messaging)
     - Production support for Fortune 500 insurance clients

     She's immediately available and open to remote work.

     Resume attached. Available for interview this week?

     Best,
     [Your Name]
     ```
   - Edit email (manual adjustments)
   - Send submission (marks candidate as "Submitted" in pipeline)

---

#### **6.6.5 Placements** (`/recruiting/placements`)

**Features:**

1. **Placement Calendar:**
   - Monthly view showing start dates
   - Celebrate each placement (confetti animation 🎉)

2. **Placement List:**
   - Table: Candidate, Client, Role, Start Date, Salary, Commission
   - Total placements this sprint
   - Total revenue this month/quarter/year

3. **Placement Detail:**
   - Candidate info
   - Client info
   - Start date, end date (if contract)
   - Salary offered
   - Commission earned (2% of annual salary)
   - Celebration note: "Pod A placed Priya Sharma! 🎉"

---

### 6.7 Bench Sales Pod Workflows

**For:** Senior Bench Sales Leads + Junior Bench Sales (5 pods, 10 people)

**Pages:**

#### **6.7.1 Bench Sales Dashboard** (`/bench/dashboard`)

**Sections:**

1. **Pod Performance:**
   ```
   ┌─────────────────────────────────────────┐
   │ Bench Sales Pod 1 Performance           │
   │ Sprint Goal: 2 Placements               │
   │                                          │
   │ This Sprint (Nov 11-24):                │
   │ ✅ 1 Placement (James Wilson → Client X)│
   │ 🟡 1 More needed (5 days left)          │
   │                                          │
   │ Bench Status:                            │
   │ 12 Consultants on bench                 │
   │ Avg time on bench: 45 days (Target: 60) │
   │ Utilization: 78% (Target: 85%)         │
   └─────────────────────────────────────────┘
   ```

2. **Priority Consultants:**
   - List: Consultants on bench >50 days (high priority)
   - AI suggestions: "Raj Patel matches 3 client needs"

3. **Upskilling Progress:**
   - Consultants in Academy courses
   - Completion rates

4. **Today's Tasks:**
   - "Check in with Raj Patel (32 days on bench)"
   - "Follow up with Client Y (expressed interest last week)"
   - "Review Amit Kumar's Integration course progress (80% done)"

---

#### **6.7.2 Bench Console** (Detailed View)

**Linked from:** Talent Board → Bench filter

**Features:**
- Full bench consultant list
- Upskilling tracker
- Weekly check-ins (AI-automated)
- Client match suggestions
- Outreach templates (AI-generated)

---

#### **6.7.3 Client Outreach** (`/bench/outreach`)

**Features:**

1. **Outreach Campaigns:**
   - Create campaign (target: clients needing Guidewire talent)
   - AI drafts emails: "I have a Guidewire expert available immediately..."
   - Track responses

2. **Templates:**
   - Consultant availability announcement
   - New skills acquired (after upskilling)
   - Urgent bench capacity (consultant ending project soon)

---

### 6.8 TA Pod Workflows

**For:** Senior TA Specialists + Junior TA Specialists (5 pods, 10 people)

**Pages:**

#### **6.8.1 TA Dashboard** (`/ta/dashboard`)

**Sections:**

1. **Pod Performance:**
   ```
   ┌─────────────────────────────────────────┐
   │ TA Pod 1 Performance                    │
   │ Monthly Goal: 100 New Candidates        │
   │                                          │
   │ This Month (Nov 1-30):                  │
   │ ✅ 87 Candidates sourced (87%)          │
   │ 🎯 13 more needed (7 days left)         │
   │                                          │
   │ Pipeline Health:                         │
   │ 🟢 45 Warm leads (engaged in last 7 days)│
   │ 🟡 120 Cold leads (need re-engagement)  │
   │ ✅ 15 Converted to Academy/Recruiting   │
   └─────────────────────────────────────────┘
   ```

2. **Active Campaigns:**
   - Campaign cards (LinkedIn, Email, Job Boards)
   - Response rates
   - AI optimization suggestions

3. **Warm Leads:**
   - Candidates who responded recently
   - Next action: Move to Recruiting or Academy

4. **Today's Tasks:**
   - "Launch LinkedIn campaign (Guidewire Developers, East Coast)"
   - "Follow up with 12 candidates from last week's outreach"
   - "Review AI-suggested outreach improvements"

---

#### **6.8.2 Outreach Campaigns** (`/ta/campaigns`)

**Features:**

1. **Campaign Builder:**
   ```
   ┌─────────────────────────────────────────┐
   │ Create Outreach Campaign                │
   ├─────────────────────────────────────────┤
   │ Campaign Name:                           │
   │ [Guidewire Developers - Q4 2025]        │
   │                                          │
   │ Target Persona:                          │
   │ Title: [Guidewire Developer]            │
   │ Skills: [PolicyCenter] [Java] [Gosu]   │
   │ Location: [East Coast, Remote OK]      │
   │ Experience: [3-7 years]                 │
   │                                          │
   │ Channel:                                 │
   │ (•) LinkedIn InMail                     │
   │ ( ) Email (if we have contact)          │
   │ ( ) Both                                 │
   │                                          │
   │ AI Message Generator:                    │
   │ [Generate Personalized Messages]        │
   │                                          │
   │ Preview:                                 │
   │ ┌─────────────────────────────────┐   │
   │ │ Hi {{FirstName}},               │   │
   │ │                                 │   │
   │ │ I noticed your experience with  │   │
   │ │ Guidewire PolicyCenter at       │   │
   │ │ {{CurrentCompany}}. Impressive! │   │
   │ │                                 │   │
   │ │ We're building a specialized    │   │
   │ │ Guidewire practice and looking  │   │
   │ │ for experts like you...         │   │
   │ │                                 │   │
   │ │ [Generated by AI, editable]     │   │
   │ └─────────────────────────────────┘   │
   │                                          │
   │ Target: 200 candidates                  │
   │ Expected response rate: 15-20% (AI)    │
   │                                          │
   │ [Launch Campaign]                       │
   └─────────────────────────────────────────┘
   ```

2. **Campaign Tracker:**
   - Table: Campaign Name, Sent, Opened, Replied, Converted
   - AI insights: "Best performing subject line: ..."

---

#### **6.8.3 Pipeline Management** (`/ta/pipeline`)

**Features:**

1. **Pipeline Stages:**
   - Sourced (new contact)
   - Engaged (replied to outreach)
   - Qualified (fit for Academy or Recruiting)
   - Converted (enrolled in Academy or submitted to client)
   - Archived (not interested)

2. **Candidate Cards:**
   - Name, current company, LinkedIn profile
   - Source (campaign name)
   - Engagement history (emails, calls)
   - AI score: "High fit for Academy" or "Ready for recruiting"
   - Next action: "Schedule screening call"

---

### 6.9 Productivity Tools & AI Twin

**For:** ALL employees (CEO to Junior)

**Purpose:** Time tracking, personal analytics, AI assistant

**Pages:**

#### **6.9.1 My Productivity** (`/productivity/dashboard`)

**Sections:**

1. **This Week:**
   - Hours worked (40/40)
   - Meetings (12 meetings, 8 hours)
   - Focus time (20 hours)
   - AI Twin interactions (47 conversations)

2. **AI Twin Summary:**
   ```
   ┌─────────────────────────────────────────┐
   │ 🤖 Your AI Twin Summary                 │
   │                                          │
   │ This week, your AI Twin helped you:     │
   │ ✅ Draft 12 candidate emails            │
   │ ✅ Find 8 talent matches for job orders │
   │ ✅ Schedule 5 interviews                │
   │ ✅ Create 1 weekly report               │
   │                                          │
   │ Time saved: ~6 hours                    │
   │                                          │
   │ [View Full AI Activity Log]             │
   └─────────────────────────────────────────┘
   ```

3. **Personal Goals:**
   - OKRs (from Performance module)
   - Progress bars
   - AI coaching: "You're 60% to your placement goal, 3 candidates in interview stage"

4. **Achievements:**
   - Badges (First Placement, 5 Placements, Sprint Goal Met)
   - Leaderboard rank (within pod, within company)

---

#### **6.9.2 AI Twin Chat** (Global - accessible from all pages)

**Fixed Button:** Bottom-right corner (all pages)

```
┌─────────────────────────────────────────┐
│ 🤖 AI Twin                              │
├─────────────────────────────────────────┤
│                                          │
│ [Previous conversation history...]      │
│                                          │
│ You: Find me candidates for the Acme   │
│ Insurance job order                     │
│                                          │
│ AI Twin: I found 3 strong matches from │
│ the Talent Board:                       │
│                                          │
│ 1. Priya Sharma (95% match)            │
│    Academy Graduate, available now     │
│    [View Profile] [Submit to Client]   │
│                                          │
│ 2. Raj Patel (88% match)               │
│    On bench, 32 days                    │
│    [View Profile] [Submit to Client]   │
│                                          │
│ 3. Lisa Chen (75% match)               │
│    TA Pipeline, needs 2 weeks notice   │
│    [View Profile] [Contact]            │
│                                          │
│ Would you like me to draft submission  │
│ emails for the top 2?                   │
│                                          │
├─────────────────────────────────────────┤
│ [Type your message...]          [Send] │
└─────────────────────────────────────────┘
```

**AI Twin Capabilities by Role:**

**For Recruiters:**
- Find matching candidates (searches Talent Board)
- Draft submission emails
- Schedule interviews (integrates with calendar)
- Generate weekly reports

**For Bench Sales:**
- Match consultants to client needs
- Draft outreach emails to clients
- Track consultant upskilling
- Predict placement probability

**For TA:**
- Generate outreach messages (personalized at scale)
- Suggest campaign improvements
- Score candidates (fit for Academy vs Recruiting)
- Automate follow-ups

**For Trainers:**
- Auto-grade quizzes
- Identify at-risk students
- Suggest personalized learning paths
- Draft student feedback

**For HR:**
- Automate onboarding checklists
- Flag compliance issues
- Suggest training assignments
- Generate performance review templates

**For CEO:**
- Forecast revenue
- Suggest resource allocation
- Draft board reports
- Identify business risks/opportunities

---

### 6.10 CEO Dashboard

**For:** CEO only (Admin and HR have view access)

**Pages:**

#### **6.10.1 Executive Dashboard** (`/ceo/dashboard`)

**Sections:**

1. **Company Performance:**
   ```
   ┌─────────────────────────────────────────┐
   │ InTime Performance (Nov 2025)           │
   ├─────────────────────────────────────────┤
   │ Revenue This Month: $147,000            │
   │ Target: $150,000 (98%)                  │
   │                                          │
   │ Placements: 18/20 (Sprint goal: 19 pods)│
   │ Missing: 2 pods below target            │
   │                                          │
   │ Bench Utilization: 78% (Target: 85%)   │
   │ Revenue per Employee: $245k/year        │
   └─────────────────────────────────────────┘
   ```

2. **Pod Scoreboard:**
   - Table: Pod Name, Placements This Sprint, Revenue YTD, Status
   - Color-coded: Green (exceeding), Yellow (on track), Red (needs support)
   - Click pod → Drill into pod details

3. **Client Health:**
   - Top 10 clients by revenue
   - Health scores (engagement, satisfaction)
   - At-risk clients (flagged)

4. **Pipeline Forecast:**
   - AI-generated revenue forecast (next 30/60/90 days)
   - Confidence intervals
   - Assumptions (based on current pipeline)

5. **Strategic Insights (AI Twin):**
   ```
   🤖 CEO AI Twin Insights:

   ⚠️ Risk: Recruiting Pod B has 0 placements this sprint.
      Recommendation: Reassign Senior's top client to Pod A,
      pair Pod B Senior with CEO for client calls next week.

   ✅ Opportunity: 12 Academy graduates available.
      Bench Sales can place 8 within 30 days if we launch
      targeted client outreach. Draft email ready.

   📊 Trend: TA Pod 3 has 150% of monthly sourcing goal.
      Consider expanding this pod to 3 people (add another junior).
   ```

---

#### **6.10.2 Financial Forecast** (`/ceo/financials`)

**Sections:**

1. **Revenue Forecast:**
   - Chart: Monthly revenue (actual + projected)
   - Breakdown: Recruiting, Bench Sales, Academy
   - Confidence bands (best case, worst case, likely)

2. **Expense Tracking:**
   - Salaries ($X/month)
   - Commissions ($X/month)
   - Tools/Software ($X/month)
   - Marketing ($X/month)

3. **Profitability:**
   - Gross margin %
   - Net profit
   - Runway (months of cash remaining)

---

#### **6.10.3 Strategic Planning** (`/ceo/strategy`)

**Features:**

1. **5-Year Vision Tracker:**
   - Year 1 (2026): Internal tool ✅ In progress
   - Year 2 (2027): B2B SaaS (IntimeOS) - Planning
   - Year 3 (2028): Multi-industry expansion - Future
   - Year 5 (2030): IPO-ready - Future

2. **OKRs (Company-Level):**
   - Q4 2025: 20 pods operational (19/20)
   - Q1 2026: $500k/month revenue (current: $150k/month)
   - Q2 2026: Launch IntimeOS SaaS beta

3. **Resource Planning:**
   - Hiring plan (next 6 months)
   - Pod expansion roadmap
   - Tool/software budget

---

## 7. Screen Specifications

### 7.1 Responsive Layouts

**Desktop (1440px+):**
- Sidebar (240px wide) + Main content (1200px)
- Tables with 8-10 columns visible
- Side-by-side panels (Job + Talent in Combined View)

**Tablet (768px - 1439px):**
- Collapsible sidebar (hamburger menu)
- Main content (full width)
- Tables with 5-6 columns (hide less important columns)
- Stacked panels (Job above Talent)

**Mobile (375px - 767px):**
- Bottom navigation bar (5 icons)
- Main content (full width, scrollable)
- Cards instead of tables
- Single column layout
- Floating AI Twin button (bottom-right)

---

### 7.2 Component Specifications

**All components use shadcn/ui + Tailwind CSS**

#### **Button Styles:**

```tsx
// Primary action (e.g., "Submit", "Save", "Create")
<button className="bg-rust-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-rust-dark">
  Submit Application
</button>

// Secondary action (e.g., "Cancel", "Back")
<button className="border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50">
  Cancel
</button>

// Danger action (e.g., "Delete", "Reject")
<button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700">
  Delete
</button>
```

#### **Modal Template:**

```tsx
// All modals follow this structure
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold">Modal Title</h3>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <XIcon />
      </button>
    </div>

    {/* Modal content */}
    <div className="mb-6">
      {/* Form fields, info, etc. */}
    </div>

    {/* Actions */}
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="secondary-button">
        Cancel
      </button>
      <button onClick={onSubmit} className="primary-button">
        Submit
      </button>
    </div>
  </div>
</div>
```

#### **Stat Card Template:**

```tsx
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
  <div className="flex items-center justify-between mb-4">
    <span className="text-sm uppercase tracking-wide text-gray-500">
      {label}
    </span>
    <Icon className="text-rust-primary" />
  </div>
  <div className="text-4xl font-bold text-charcoal mb-2">
    {value}
  </div>
  <div className="text-sm text-gray-600">
    {description}
  </div>
</div>
```

#### **Table Template:**

```tsx
<table className="w-full border-collapse">
  <thead className="bg-gray-50 border-b-2 border-gray-200">
    <tr>
      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
        Column 1
      </th>
      {/* More columns */}
    </tr>
  </thead>
  <tbody>
    {data.map((row, idx) => (
      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
        <td className="p-4">{row.col1}</td>
        {/* More cells */}
      </tr>
    ))}
  </tbody>
</table>
```

#### **AI Twin Chat Interface:**

```tsx
// Fixed position, bottom-right corner
<div className="fixed bottom-6 right-6 z-50">
  {/* Closed state: Floating button */}
  {!isOpen && (
    <button
      onClick={() => setIsOpen(true)}
      className="bg-rust-primary text-white p-4 rounded-full shadow-lg hover:bg-rust-dark"
    >
      <BotIcon className="w-6 h-6" />
    </button>
  )}

  {/* Open state: Chat panel */}
  {isOpen && (
    <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BotIcon className="text-rust-primary" />
          <span className="font-semibold">AI Twin</span>
        </div>
        <button onClick={() => setIsOpen(false)}>
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block rounded-2xl px-4 py-2 max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-rust-primary text-white'
                : 'bg-gray-100 text-charcoal'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI Twin..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          <button
            onClick={sendMessage}
            className="bg-rust-primary text-white px-4 rounded-lg hover:bg-rust-dark"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )}
</div>
```

---

## 8. Notification System

### Push Notifications

**Trigger Events:**
- Timesheet submitted (→ Manager)
- Timesheet approved (→ Employee)
- Leave request submitted (→ Manager)
- Leave request approved (→ Employee)
- Job order received (→ Pod owner)
- Candidate submitted to client (→ Pod)
- Interview scheduled (→ Recruiter, Candidate)
- Placement made (→ Pod, CEO, ALL employees for celebration)
- Commission earned (→ Employee)
- Training assigned (→ Employee)
- Sprint goal met (→ Pod, ALL employees for celebration)
- At-risk alert (→ Manager, HR, CEO)

**Notification UI:**

```
┌─────────────────────────────────────────┐
│ 🔔 Notifications (3 new)                │
├─────────────────────────────────────────┤
│ ✅ Your leave request was approved      │
│    Dec 20-24, 2025 (5 days)            │
│    2 hours ago                          │
│                                          │
│ 🎉 Pod A placed Priya Sharma!          │
│    Celebrate with the team 🎊          │
│    5 hours ago                          │
│                                          │
│ 📧 New job order from Acme Insurance   │
│    Guidewire Developer, Remote          │
│    SLA: 47 hours remaining              │
│    1 day ago                            │
│                                          │
│ [Mark All as Read]                      │
└─────────────────────────────────────────┘
```

**Notification Badge:**
- Top-right bell icon
- Red badge with count (e.g., "3")
- Click → Opens notification panel

---

## 9. Celebration System

### Team Celebrations

**When to Celebrate:**
1. **Placement Made** (any pod)
2. **Sprint Goal Met** (pod hits 2 placements)
3. **Academy Graduate** (student completes 8-week program)
4. **100 Placements Milestone** (company-wide)
5. **$1M Revenue Milestone** (company-wide)

**Celebration UI:**

**1. Confetti Animation:**
- Triggered on placement/goal met
- Confetti falls from top of screen
- Lasts 3 seconds
- User can click to dismiss early

**2. Toast Notification (All Users):**
```
┌─────────────────────────────────────────┐
│ 🎉 CELEBRATION!                         │
│                                          │
│ Recruiting Pod A placed Priya Sharma!   │
│ at Acme Insurance ($120k/year)          │
│                                          │
│ This is Pod A's 2nd placement this sprint│
│ SPRINT GOAL MET! 🏆                     │
│                                          │
│ [👏 Celebrate] [💬 Comment]             │
└─────────────────────────────────────────┘
```

**3. Celebration Feed:**
- Dedicated page: `/celebrations`
- Timeline of all company wins
- Comments/reactions from team members
- CEO can add personal congratulations

**4. Slack Integration (Future):**
- Auto-post to #celebrations channel
- "@channel Priya Sharma placed at Acme Insurance! 🎉"

---

## 10. Existing Code Integration

### Leverage What's Already Built

**From `/frontend-prototype/`:**

1. **HR Components** (60% functional):
   - `components/hr/HRDashboard.tsx` ✅
   - `components/hr/PeopleDirectory.tsx` ✅
   - `components/hr/OrgChart.tsx` ✅
   - `components/hr/TimeAttendance.tsx` ✅
   - `components/hr/Compensation.tsx` ✅
   - `components/hr/PerformanceReviews.tsx` ✅
   - `components/hr/Recruitment.tsx` ✅
   - `components/hr/Documents.tsx` ✅
   - `components/hr/LearningAdmin.tsx` 🔴 (Broken button - FIX THIS FIRST)
   - `components/hr/Analytics.tsx` ✅

2. **Academy Components** (90% functional):
   - `components/Dashboard.tsx` (Student dashboard)
   - `components/ModulesList.tsx` (Course catalog)
   - `components/LessonView.tsx` (4-tab protocol)
   - `components/PersonaView.tsx` (Resume builder)
   - `components/BlueprintView.tsx` (Portfolio)
   - `components/PublicAcademy.tsx` (Landing page)

3. **Shared Components**:
   - `components/Navbar.tsx` (Top navigation)
   - `components/AIMentor.tsx` (AI Twin chat - needs enhancement)

**From `/src/app/`:**

1. **Academy Routes**:
   - `app/students/ai-mentor/page.tsx` (AI Mentor interface)
   - `app/students/courses/[slug]/page.tsx` (Course detail)
   - `app/students/page.tsx` (Student dashboard)

2. **API Routes**:
   - `app/api/students/code-mentor/route.ts` (AI Code Mentor)
   - `app/api/students/interview-coach/route.ts` (AI Interview Coach)
   - `app/api/students/project-planner/route.ts` (AI Project Planner)
   - `app/api/students/resume-builder/route.ts` (AI Resume Builder)

**From `/src/lib/`:**

1. **AI Agents**:
   - `lib/ai/agents/guru/CodeMentorAgent.ts` ✅
   - `lib/ai/agents/guru/InterviewCoachAgent.ts` ✅
   - `lib/ai/agents/guru/ProjectPlannerAgent.ts` ✅
   - `lib/ai/agents/guru/ResumeBuilderAgent.ts` ✅
   - `lib/ai/agents/guru/CoordinatorAgent.ts` ✅

2. **Database Schema**:
   - `lib/db/schema/index.ts` (30+ tables, RLS, functions)

3. **tRPC Routers**:
   - `lib/trpc/routers/courses.ts`
   - `lib/trpc/routers/enrollment.ts`
   - `lib/trpc/routers/progress.ts`
   - `lib/trpc/routers/badges.ts`
   - `lib/trpc/routers/quiz.ts`

**Integration Strategy:**

1. **Port HR Components to Main App:**
   - Move `/frontend-prototype/components/hr/` → `/src/components/hr/`
   - Update imports to use shadcn/ui from main app
   - Connect to tRPC endpoints

2. **Extend Academy Components:**
   - Add admin views (Course Builder, Grading Center)
   - Reuse existing LessonView, ModulesList components

3. **Connect AI Agents:**
   - Use existing Guru agents for recruiting workflows
   - Extend CoordinatorAgent for cross-pod intelligence

4. **Leverage Database Schema:**
   - All tables already exist in Supabase
   - Just need to create tRPC endpoints for new modules

---

## 11. Implementation Checklist

### Phase 1: Foundation (Week 1)

**Frontend Infrastructure:**
- [ ] Set up unified navigation (sidebar with role-based menu)
- [ ] Create role permission system (Zustand store)
- [ ] Build layout components (Desktop/Tablet/Mobile responsive)
- [ ] Set up global notification system
- [ ] Create celebration system (confetti, toasts)
- [ ] Implement AI Twin chat interface (global, all pages)

**Core Components:**
- [ ] Button library (primary, secondary, danger)
- [ ] Modal templates (standard, form, confirmation)
- [ ] Stat card component
- [ ] Table component (sortable, filterable)
- [ ] Kanban board component (drag-drop)
- [ ] Form components (inputs, selects, date pickers, multi-select)

### Phase 2: HR Module Completion (Week 2)

**Fix Critical Bugs:**
- [ ] 🔴 Fix "Assign to Employee" button → Create AssignCourseModal
- [ ] Create ApproveLeaveModal
- [ ] Create ApproveCommissionModal
- [ ] Create ApproveExpenseModal
- [ ] Create AddEmployeeModal

**Complete Missing Features:**
- [ ] People Directory: Search, filters
- [ ] Time & Attendance: Editable hours, RequestTimeOffModal
- [ ] Payroll: Download paystubs, BenefitsModal
- [ ] Performance: AddGoalModal, Reviews tab, 360 Feedback
- [ ] Recruitment: CreateReqModal, Kanban board
- [ ] Documents: Search, upload, download
- [ ] Learning: Employee Progress tab
- [ ] Analytics: More charts, export

### Phase 3: Academy Admin (Week 3)

**New Pages:**
- [ ] Academy Dashboard (`/academy/admin/dashboard`)
- [ ] Course Builder (`/academy/admin/courses`)
  - [ ] Course list
  - [ ] Course editor (modules, lessons)
  - [ ] Quiz builder
  - [ ] Video upload
- [ ] Student Management (`/academy/admin/students`)
  - [ ] Student list with filters
  - [ ] Student detail view
  - [ ] Bulk enrollment
- [ ] Grading Center (`/academy/admin/grading`)
  - [ ] Pending submissions
  - [ ] Submission viewer
  - [ ] Auto-grading integration
- [ ] Certifications (`/academy/admin/certifications`)
  - [ ] Issue certificate
  - [ ] Template editor

### Phase 4: Client Portal Admin (Week 4)

**New Pages:**
- [ ] Client Dashboard (`/clients/dashboard`)
- [ ] Client List (`/clients/list`)
  - [ ] Client cards/table
  - [ ] Add Client form
  - [ ] Client detail page
- [ ] Job Orders (`/clients/job-orders`)
  - [ ] Kanban board
  - [ ] Job order detail
  - [ ] Create job order form
- [ ] Projects (`/clients/projects`)
  - [ ] Project list
  - [ ] Project detail
- [ ] Invoicing (`/clients/invoicing`)
  - [ ] Invoice list
  - [ ] Invoice builder
  - [ ] PDF generation

### Phase 5: Talent Portal & Shared Boards (Week 5-6)

**Talent Board (Shared):**
- [ ] Unified Talent Search (`/talent/board`)
  - [ ] AI-powered search
  - [ ] Filters (status, skills, location, availability)
  - [ ] Talent cards
  - [ ] Bulk actions
  - [ ] AI Twin match suggestions

**Bench Console:**
- [ ] Bench Dashboard (`/talent/bench`)
- [ ] Bench consultant list
- [ ] Weekly check-in system
- [ ] Upskilling tracker
- [ ] AI Twin automation

**Candidate Pipeline:**
- [ ] Pipeline Kanban (`/talent/pipeline`)
- [ ] Candidate detail view
- [ ] AI resume scoring
- [ ] Submission workflow

**Academy Graduates:**
- [ ] Graduate list (`/talent/graduates`)
- [ ] Graduate profile
- [ ] Auto-transition to bench

**Job Board (Shared):**
- [ ] Job Board (`/shared/jobs`)
  - [ ] Job search/filters
  - [ ] Job cards
  - [ ] Job detail
  - [ ] Claim job workflow
  - [ ] AI Twin job matching

**Combined View:**
- [ ] Combined View (`/shared/combined`)
  - [ ] Side-by-side job + talent
  - [ ] AI-powered matching
  - [ ] Quick actions (submit, contact)

### Phase 6: Pod Workflows (Week 7-8)

**Recruiting Pod:**
- [ ] Recruiting Dashboard (`/recruiting/dashboard`)
- [ ] My Clients (`/recruiting/clients`)
- [ ] Job Order Pipeline (`/recruiting/pipeline`)
- [ ] Candidate Submissions (`/recruiting/submissions`)
- [ ] Placements (`/recruiting/placements`)

**Bench Sales Pod:**
- [ ] Bench Sales Dashboard (`/bench/dashboard`)
- [ ] Client Outreach (`/bench/outreach`)

**TA Pod:**
- [ ] TA Dashboard (`/ta/dashboard`)
- [ ] Outreach Campaigns (`/ta/campaigns`)
  - [ ] Campaign builder
  - [ ] AI message generator
  - [ ] Campaign tracker
- [ ] Pipeline Management (`/ta/pipeline`)

### Phase 7: Productivity & AI Twin (Week 9)

**Productivity Tools:**
- [ ] My Productivity (`/productivity/dashboard`)
  - [ ] This week summary
  - [ ] AI Twin summary
  - [ ] Personal goals
  - [ ] Achievements/badges

**AI Twin Integration:**
- [ ] Role-specific AI prompts
- [ ] Automation workflows:
  - [ ] Recruiter: Find candidates, draft emails
  - [ ] Bench Sales: Match consultants, draft outreach
  - [ ] TA: Generate campaigns, score candidates
  - [ ] Trainer: Auto-grade, identify at-risk students
  - [ ] HR: Onboarding checklists, compliance flags
  - [ ] CEO: Forecasts, strategic insights

### Phase 8: CEO Dashboard & Admin Panel (Week 10)

**CEO Dashboard:**
- [ ] Executive Dashboard (`/ceo/dashboard`)
  - [ ] Company performance
  - [ ] Pod scoreboard
  - [ ] Client health
  - [ ] Pipeline forecast
  - [ ] AI Twin strategic insights
- [ ] Financial Forecast (`/ceo/financials`)
  - [ ] Revenue forecast chart
  - [ ] Expense tracking
  - [ ] Profitability metrics
- [ ] Strategic Planning (`/ceo/strategy`)
  - [ ] 5-year vision tracker
  - [ ] Company OKRs
  - [ ] Resource planning

**Admin Panel:**
- [ ] User Management (`/admin/users`)
  - [ ] User list
  - [ ] Create user
  - [ ] Edit roles/permissions
- [ ] Roles & Permissions (`/admin/roles`)
  - [ ] Role editor
  - [ ] Permission matrix
- [ ] System Settings (`/admin/settings`)
- [ ] Audit Logs (`/admin/audit`)
- [ ] Integrations (`/admin/integrations`)

### Phase 9: Polish & Testing (Week 11-12)

**Responsive Design:**
- [ ] Test all pages on desktop (1440px)
- [ ] Test all pages on tablet (768px)
- [ ] Test all pages on mobile (375px)
- [ ] Fix mobile navigation
- [ ] Optimize touch targets

**Notifications:**
- [ ] Implement all notification triggers
- [ ] Test notification delivery
- [ ] Test email integration (if applicable)

**Celebrations:**
- [ ] Test confetti animation
- [ ] Test toast notifications
- [ ] Create celebration feed page

**AI Twin:**
- [ ] Test all role-specific prompts
- [ ] Test automation workflows
- [ ] Optimize response times

**Performance:**
- [ ] Optimize bundle size
- [ ] Lazy load routes
- [ ] Optimize images
- [ ] Test page load times (<3s)

**E2E Testing:**
- [ ] Test complete user flows (18 flows from assessment doc)
- [ ] Test cross-pod collaboration
- [ ] Test role switching (user with multiple roles)
- [ ] Test edge cases

---

## 12. Success Criteria

**The platform is COMPLETE when:**

1. ✅ ALL employees can log in and see role-appropriate dashboard
2. ✅ ALL 10 modules are functional (not just UI)
3. ✅ Shared Boards (Job + Talent) work across all pods
4. ✅ AI Twin responds to all role-specific requests
5. ✅ Notifications trigger for all key events
6. ✅ Celebrations work for placements and sprint goals
7. ✅ Mobile/tablet views are fully functional
8. ✅ All 18 user flows from assessment complete end-to-end
9. ✅ Cross-pollination workflows work (Academy → Bench → Recruiting)
10. ✅ Pod performance tracking accurate (2 placements/sprint)
11. ✅ Commission tracking working (Payroll module)
12. ✅ Zero critical bugs

---

## 13. Design System Reference

**Colors:**
```css
--rust-primary: #C84B31;
--rust-dark: #A63A22;
--charcoal: #2D4059;
--ivory: #F5F5F5;
--sage: #88A096;

--success: #4CAF50;
--warning: #FF9800;
--error: #F44336;
--info: #2196F3;

--pod-recruiting: #FF6B35; /* Orange */
--pod-bench: #4ECDC4;      /* Teal */
--pod-ta: #95E1D3;         /* Green */
--pod-academy: #9B59B6;    /* Purple */
--pod-xborder: #F39C12;    /* Gold */
```

**Typography:**
```css
font-family: Inter, system-ui, sans-serif;

h1: 2.5rem, 700
h2: 2rem, 600
h3: 1.5rem, 600
h4: 1.25rem, 600
body: 1rem, 400
small: 0.875rem, 400
```

**Spacing:**
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

**Shadows:**
```css
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.15)
```

---

## 14. Final Notes for Frontend Developer

### What You Have

1. **Existing HR Components** - 9 pages, 60% functional, beautiful UI
2. **Existing Academy Components** - Student portal 90% functional
3. **Existing AI Agents** - 5 Guru agents already built
4. **Existing Database** - 30+ tables, RLS, functions ready
5. **Existing tRPC Endpoints** - Academy module endpoints

### What You Need to Build

1. **Fix 1 Critical Bug** - "Assign to Employee" button (2-3 hours)
2. **Complete HR Missing Features** - Modals, forms (1 week)
3. **Build Academy Admin** - Course builder, grading (1 week)
4. **Build Client Portal Admin** - Client management, invoicing (1 week)
5. **Build Talent Portal** - Shared boards, bench console (2 weeks)
6. **Build Pod Workflows** - Recruiting, Bench, TA dashboards (2 weeks)
7. **Integrate AI Twin** - Role-specific automation (1 week)
8. **Build CEO Dashboard** - Executive metrics, forecasts (1 week)
9. **Build Admin Panel** - User management, permissions (1 week)
10. **Polish & Test** - Responsive, notifications, celebrations (2 weeks)

**Total:** 12 weeks (3 months) for complete platform

### Priority Order

If you can't build everything at once, prioritize:

1. **Week 1-2:** Fix HR bugs, complete HR module
2. **Week 3:** Academy Admin (trainers need this)
3. **Week 4-5:** Talent Board + Job Board (CRITICAL for cross-pollination)
4. **Week 6-7:** Recruiting Pod workflows (revenue generation)
5. **Week 8:** Bench Sales workflows
6. **Week 9:** AI Twin integration
7. **Week 10:** CEO Dashboard
8. **Week 11-12:** Polish, testing, mobile optimization

### Resources

- **Design Reference:** `/frontend-prototype/` (use as visual spec)
- **Backend Reference:** `/src/lib/db/schema/` (database structure)
- **AI Reference:** `/src/lib/ai/agents/guru/` (existing AI agents)
- **Component Library:** shadcn/ui (https://ui.shadcn.com)
- **Icons:** Lucide Icons (https://lucide.dev)

### Questions?

If anything is unclear, refer back to:
- **Section 3:** Pod Structure & Roles (who uses what)
- **Section 4:** Role-Permission Matrix (who can do what)
- **Section 6:** Module Specifications (detailed feature lists)
- **Section 11:** Implementation Checklist (step-by-step tasks)

---

**End of PRD**

**Document Version:** 1.0
**Last Updated:** 2025-11-23
**Total Pages:** 100+
**Total Screens:** 50+
**Total Components:** 100+
**Estimated Build Time:** 12 weeks (parallel development)
**Target Users:** 38 employees Year 1, 100+ by Year 5
**Business Model:** 5-pillar staffing, pod-centric, cross-pollination
**Vision:** ONE unified platform, ALL employees, AI-first, demo-ready → production-ready

🚀 **Let's build the future of staffing!** 🚀
