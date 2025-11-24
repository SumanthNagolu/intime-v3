# Frontend Screen & Flow Inventory

**Simple Question: Can users complete their jobs?**

---

## 📚 MODULE 1: TRAINING ACADEMY

**Who uses it:** Students learning Guidewire

### Screens Inventory

| # | Screen | Route | Exists? | Buttons Work? | Purpose |
|---|--------|-------|---------|---------------|---------|
| 1 | **Public Landing** | `/#/academy` | ✅ Yes | 🟡 Partial | Market the academy |
| 2 | **Student Dashboard** | `/#/academy/dashboard` | ✅ Yes | ✅ Yes | See progress, daily focus |
| 3 | **Course Catalog** | `/#/academy/modules` | ✅ Yes | ✅ Yes | Browse all courses |
| 4 | **Lesson View** | `/#/academy/lesson/:id/:id` | ✅ Yes | ✅ Yes | Learn (Theory/Demo/Quiz/Lab) |
| 5 | **Persona Page** | `/#/academy/identity` | ✅ Yes | ✅ Yes | Build resume/identity |
| 6 | **Portfolio** | `/#/academy/blueprint` | ✅ Yes | ✅ Yes | View project deliverables |
| 7 | **Interview Practice** | `/#/academy/dojo` | ✅ Yes | ✅ Yes | Practice interviews |
| 8 | **Student Welcome** | `/#/academy/portal` | ✅ Yes | ✅ Yes | First-time login page |
| 9 | **AI Assistant** | `/#/academy/assistant` | ✅ Yes | ❌ No | Ask questions (broken) |
| 10 | **Enrollment Form** | N/A | ❌ MISSING | - | Apply & pay for course |
| 11 | **Course Preview** | N/A | ❌ MISSING | - | See course before buying |
| 12 | **Payment Checkout** | N/A | ❌ MISSING | - | Pay for courses |
| 13 | **Certificate View** | N/A | ❌ MISSING | - | Download certificate |
| 14 | **Progress History** | N/A | ❌ MISSING | - | See all completed work |
| 15 | **Profile Settings** | N/A | ❌ MISSING | - | Edit student profile |

### User Flow: STUDENT LEARNS A COURSE

**Flow:** Visitor → Apply → Pay → Study → Complete → Certificate

#### ✅ What EXISTS:
1. Land on public page → See "Apply for Cohort" button
2. Click Apply → Modal opens with form
3. Fill form → Submit button shows alert
4. Navigate to dashboard → See daily focus
5. Click lesson → Opens lesson page
6. Complete Theory → Auto-opens Demo
7. Watch Demo → Auto-opens Quiz
8. Pass Quiz → Auto-opens Lab
9. Submit Lab → Lesson marked complete
10. View progress → See stats update

#### ❌ What's MISSING:
1. **Enrollment Flow** - No actual signup/registration
2. **Payment** - Can't pay for course
3. **Email Confirmation** - No confirmation sent
4. **Onboarding** - No welcome wizard
5. **Certificate Generation** - Can't download cert after completion
6. **Progress Persistence** - Progress doesn't save (just mock data)

### Button Status

| Button | Location | Works? | Does What? |
|--------|----------|--------|------------|
| **Apply for Cohort** | Public Academy | 🟡 Partial | Opens modal, but just shows alert() |
| **Watch Demo** | Public Academy | 🟡 Partial | Opens modal with placeholder |
| **Submit Application** | Modal | 🟡 Partial | Just alert(), no real submit |
| **Enter The Protocol** | Dashboard | ✅ Works | Goes to current lesson |
| **View Full Sprint** | Dashboard | ✅ Works | Goes to modules page |
| **Join The Sprint** | Dashboard | ✅ Works | Changes mode, shows loader |
| **Continue Journey** | Modules | ✅ Works | Goes to current lesson |
| **Play Lesson** | Modules | ✅ Works | Opens specific lesson |
| **Theory Tab** | Lesson | ✅ Works | Shows theory slides |
| **Demo Tab** | Lesson | ✅ Works | Shows demo (placeholder) |
| **Verify Tab** | Lesson | ✅ Works | Shows quiz |
| **Build Tab** | Lesson | ✅ Works | Shows lab |
| **Next Slide** | Theory | ✅ Works | Next slide |
| **Previous Slide** | Theory | ✅ Works | Previous slide |
| **Complete Theory** | Theory | ✅ Works | Unlocks Demo tab |
| **Start Demo** | Demo | ✅ Works | Plays placeholder video |
| **Complete Demo** | Demo | ✅ Works | Unlocks Verify tab |
| **Quiz Answers** | Verify | ✅ Works | Select answer |
| **Verify Understanding** | Verify | ✅ Works | Unlocks Build tab |
| **Copy Snippet** | Build | ⚠️ Unknown | Should copy code |
| **Submit Deliverable** | Build | ⚠️ Unknown | Should complete lesson |
| **Enter Lab** | Identity | ✅ Works | Goes to lesson |
| **Export PDF** | Blueprint | ⚠️ Unknown | Should download PDF |
| **Start Simulation** | Dojo | ✅ Works | Starts interview |
| **Pause** | Dojo | ✅ Works | Pauses interview |
| **Ask AI Mentor** | All pages | 🟡 Partial | Opens chat panel |
| **Send Message** | AI Mentor | ❌ BROKEN | Button disabled |
| **Toggle Coach Audio** | Lesson | ❌ BROKEN | No audio system |

### Missing Screens for Complete Flow:

1. **Student Signup/Register** - Can't create account
2. **Payment Page** - Can't pay for courses
3. **Course Catalog (Public)** - Can't browse before buying
4. **Course Preview** - Can't see curriculum before enrolling
5. **Settings/Profile Edit** - Can't update info
6. **Notifications Center** - Can't see alerts
7. **Certificate Gallery** - Can't view earned certs
8. **Progress Reports** - Can't see detailed stats
9. **Help/Support** - Can't get help

---

## 👔 MODULE 2: CLIENT PORTAL (Recruiting)

**Who uses it:** Companies hiring Guidewire talent

### Screens Inventory

| # | Screen | Route | Exists? | Buttons Work? | Purpose |
|---|--------|-------|---------|---------------|---------|
| 1 | **Client Landing** | `/#/clients` | 🟡 Minimal | ⚠️ Basic | Show value prop |
| 2 | **Post Requirement** | N/A | ❌ MISSING | - | Submit job req |
| 3 | **Talent Browse** | N/A | ❌ MISSING | - | Search candidates |
| 4 | **Candidate Profile** | N/A | ❌ MISSING | - | View candidate details |
| 5 | **Match Results** | N/A | ❌ MISSING | - | See matched candidates |
| 6 | **Interview Schedule** | N/A | ❌ MISSING | - | Book interviews |
| 7 | **Contract Management** | N/A | ❌ MISSING | - | Manage contracts |
| 8 | **Invoice/Billing** | N/A | ❌ MISSING | - | View invoices |
| 9 | **Dashboard** | N/A | ❌ MISSING | - | See all active reqs |

### User Flow: CLIENT HIRES TALENT

**Flow:** Land → Post Req → Review Matches → Interview → Hire

#### ❌ What EXISTS:
1. Very basic landing page
2. That's it

#### ❌ What's MISSING:
1. **Post Requirement Form** - Can't submit job needs
2. **Browse Candidates** - Can't see available talent
3. **View Profiles** - Can't see candidate details
4. **Request Interview** - Can't book interviews
5. **Accept/Reject** - Can't make decisions
6. **Contract Flow** - Can't finalize hire
7. **Billing** - Can't see invoices

### Button Status

| Button | Location | Works? | Does What? |
|--------|----------|--------|------------|
| **Find Talent** | Home → Clients | ✅ Works | Goes to minimal client page |
| **Post Requirement** | N/A | ❌ MISSING | Would submit job |
| **Browse Talent** | N/A | ❌ MISSING | Would show candidates |
| **Request Match** | N/A | ❌ MISSING | Would get matches |

### Missing Screens:
1. Post Job Requirement Form
2. Talent Search/Browse
3. Candidate Profile Pages
4. Match Results Page
5. Interview Scheduling
6. Contract Approval
7. Client Dashboard
8. Billing/Invoices
9. Messages/Chat with candidates

**STATUS: 90% MISSING** 🔴

---

## 🎯 MODULE 3: BENCH TALENT (Consultants)

**Who uses it:** Bench consultants looking for placements

### Screens Inventory

| # | Screen | Route | Exists? | Buttons Work? | Purpose |
|---|--------|-------|---------|---------------|---------|
| 1 | **Bench Welcome** | `/#/bench/portal` | ✅ Yes | ⚠️ Basic | Landing page |
| 2 | **Bench Dashboard** | `/#/bench/dashboard` | ✅ Yes | ⚠️ Basic | See opportunities |
| 3 | **Available Jobs** | `/#/bench/jobs` | 🟡 Routes exist | ⚠️ Unknown | Browse openings |
| 4 | **Applications** | `/#/bench/applications` | 🟡 Routes exist | ⚠️ Unknown | Track applications |
| 5 | **Profile** | `/#/bench/profile` | 🟡 Routes exist | ⚠️ Unknown | Consultant profile |
| 6 | **Job Details** | N/A | ❌ MISSING | - | View job description |
| 7 | **Apply to Job** | N/A | ❌ MISSING | - | Submit application |
| 8 | **Interview Prep** | N/A | ❌ MISSING | - | Prepare for interviews |
| 9 | **Placement Status** | N/A | ❌ MISSING | - | Track placement |

### User Flow: CONSULTANT GETS PLACED

**Flow:** Login → Browse Jobs → Apply → Interview → Get Placed

#### ❌ What EXISTS:
1. Basic welcome page
2. Routes defined but pages mostly empty

#### ❌ What's MISSING:
1. **Job Listings** - Can't see available positions
2. **Application Form** - Can't apply to jobs
3. **Application Tracking** - Can't see status
4. **Interview Scheduling** - Can't book slots
5. **Placement Confirmation** - Can't confirm placement

### Button Status

| Button | Location | Works? | Does What? |
|--------|----------|--------|------------|
| **Consultant Login** | Home → Bench | ✅ Works | Goes to login (broken) |
| **View Jobs** | N/A | ❌ MISSING | Would show openings |
| **Apply** | N/A | ❌ MISSING | Would submit application |
| **Upload Resume** | N/A | ❌ MISSING | Would upload doc |

**STATUS: 85% MISSING** 🔴

---

## 👥 MODULE 4: HR / EMPLOYEE PORTAL

**Who uses it:** HR admins managing employees & training

### Screens Inventory

| # | Screen | Route | Exists? | Buttons Work? | Purpose |
|---|--------|-------|---------|---------------|---------|
| 1 | **HR Dashboard** | `/#/hr/dashboard` | ✅ Yes | ✅ Yes | Overview of HR |
| 2 | **People Directory** | `/#/hr/people` | ✅ Yes | ✅ Yes | List all employees |
| 3 | **Org Chart** | `/#/hr/org` | ✅ Yes | ✅ Yes | Visual org structure |
| 4 | **Time & Attendance** | `/#/hr/time` | ✅ Yes | ✅ Yes | Track time |
| 5 | **Payroll** | `/#/hr/payroll` | ✅ Yes | ✅ Yes | Compensation |
| 6 | **Performance** | `/#/hr/performance` | ✅ Yes | ✅ Yes | Reviews |
| 7 | **Recruitment** | `/#/hr/recruitment` | ✅ Yes | ✅ Yes | Hiring pipeline |
| 8 | **Onboarding** | `/#/hr/onboarding` | ✅ Yes | ✅ Yes | New hire process |
| 9 | **Documents** | `/#/hr/documents` | ✅ Yes | ✅ Yes | Employee docs |
| 10 | **Learning Admin** | `/#/hr/learning` | ✅ Yes | 🟡 Partial | Assign courses |
| 11 | **Analytics** | `/#/hr/analytics` | ✅ Yes | ✅ Yes | HR metrics |
| 12 | **Employee Profile** | `/#/hr/profile/:id` | ✅ Yes | ✅ Yes | Individual employee |

### User Flow: HR ASSIGNS TRAINING

**Flow:** Login → Learning → Select Course → Assign to Employees → Track Progress

#### ✅ What EXISTS:
1. Navigate to Learning Admin
2. See course catalog with stats
3. See list of 5 courses

#### ❌ What's BROKEN:
1. **Assign Course Button** - Does NOTHING when clicked
2. **No employee selection** - Can't choose who gets course
3. **No progress tracking** - Can't see who completed what
4. **No deadline setting** - Can't set due dates

#### ❌ What's MISSING:
1. **Assign Course Modal** - Select employees, set deadline
2. **Employee Progress View** - See who's completing courses
3. **Send Reminders** - Nudge employees
4. **Generate Reports** - Export training data
5. **Create Custom Courses** - Build new content
6. **Bulk Actions** - Assign to multiple at once

### Button Status

| Button | Location | Works? | Does What? |
|--------|----------|--------|------------|
| **Assign to Employee** (×5) | Learning Admin | ❌ BROKEN | Does NOTHING |
| **View Employee** | People Directory | ✅ Works | Opens profile |
| **Add Employee** | People Directory | ⚠️ Unknown | Should add employee |
| **Schedule Review** | Performance | ⚠️ Unknown | Should book review |
| **Upload Document** | Documents | ⚠️ Unknown | Should upload file |

### Missing Screens:
1. **Assign Course Modal** 🔴 CRITICAL
2. **Employee Training Progress Dashboard** 🔴 CRITICAL
3. **Course Creation Wizard** 🟡 Medium
4. **Training Reports** 🟡 Medium
5. **Reminder Settings** 🟢 Low

**STATUS: 70% Complete** 🟡

---

## ⚙️ MODULE 5: ADMIN PANEL

**Who uses it:** System administrators

### Screens Inventory

| # | Screen | Route | Exists? | Buttons Work? | Purpose |
|---|--------|-------|---------|---------------|---------|
| 1 | **Admin Dashboard** | `/#/admin` | ❌ MISSING | - | System overview |
| 2 | **User Management** | N/A | ❌ MISSING | - | Add/edit/delete users |
| 3 | **Role Management** | N/A | ❌ MISSING | - | Set permissions |
| 4 | **Course Management** | N/A | ❌ MISSING | - | Create/edit courses |
| 5 | **Content Upload** | N/A | ❌ MISSING | - | Upload videos/files |
| 6 | **System Settings** | N/A | ❌ MISSING | - | Configure system |
| 7 | **Analytics** | N/A | ❌ MISSING | - | System metrics |
| 8 | **Billing** | N/A | ❌ MISSING | - | Revenue tracking |
| 9 | **Audit Logs** | N/A | ❌ MISSING | - | See all actions |

### User Flow: ADMIN CREATES COURSE

**Flow:** Login → Course Mgmt → Create Course → Add Lessons → Publish

#### ❌ What EXISTS:
Nothing. Zero admin screens.

#### ❌ What's MISSING:
1. **Admin Dashboard** - Overview of system
2. **User CRUD** - Add/edit/delete users
3. **Course Builder** - Create new courses
4. **Content Uploader** - Add videos/PDFs
5. **Settings Panel** - Configure everything
6. **Reports** - System analytics
7. **Billing Dashboard** - Revenue tracking

**STATUS: 100% MISSING** 🔴

---

## 🤖 MODULE 6: PRODUCTIVITY / CEO AI

**Who uses it:** Business leaders, productivity tracking

### Screens Inventory

| # | Screen | Route | Exists? | Buttons Work? | Purpose |
|---|--------|-------|---------|---------------|---------|
| 1 | **CEO Dashboard** | N/A | ❌ MISSING | - | Business overview |
| 2 | **Productivity Tracking** | N/A | ❌ MISSING | - | Track work |
| 3 | **AI Twin** | N/A | ❌ MISSING | - | AI assistant |
| 4 | **Reports** | N/A | ❌ MISSING | - | Business reports |
| 5 | **Forecasting** | N/A | ❌ MISSING | - | Predictions |

**STATUS: 100% MISSING** 🔴

---

## 🔄 CROSS-MODULE FLOWS

### Flow 1: Student Enrollment (End-to-End)

**What SHOULD happen:**
1. Land on public site → Click "Academy"
2. Browse courses → Click "Apply"
3. Fill application form → Submit
4. Get email → Click enrollment link
5. Enter payment info → Pay
6. Create account → Set password
7. Onboarding wizard → Tour of platform
8. Land on dashboard → Start learning

**What ACTUALLY happens:**
1. Land on public site → Click "Academy" ✅
2. Browse info → Click "Apply" ✅
3. Fill form → Submit ✅
4. See alert() ❌ (Should be real form)
5. **FLOW BREAKS HERE** ❌
6. No payment ❌
7. No account creation ❌
8. No onboarding ❌

**Missing Screens:**
- Payment checkout page
- Account creation page
- Email verification page
- Onboarding wizard
- Welcome email flow

---

### Flow 2: HR Assigns Course (End-to-End)

**What SHOULD happen:**
1. HR logs in → Go to Learning
2. Browse courses → Select one
3. Click "Assign" → Modal opens
4. Select employees (checkboxes)
5. Set deadline → Click "Assign"
6. Employees get email notification
7. Track progress on dashboard

**What ACTUALLY happens:**
1. Navigate to Learning ✅
2. See courses ✅
3. Click "Assign" ❌ NOTHING HAPPENS
4. **FLOW BREAKS HERE** ❌

**Missing Screens:**
- Assign course modal
- Employee selection interface
- Progress tracking dashboard
- Email notification system

---

### Flow 3: Client Posts Job (End-to-End)

**What SHOULD happen:**
1. Client logs in → Dashboard
2. Click "Post Requirement"
3. Fill job details form
4. Submit → Job posted
5. Get matched candidates (48h)
6. Review profiles
7. Request interviews
8. Make offer

**What ACTUALLY happens:**
1. Navigate to `/clients` ✅
2. See minimal landing page ✅
3. **NO POST BUTTON** ❌
4. **ENTIRE FLOW MISSING** ❌

**Missing Screens:**
- Client dashboard
- Post requirement form
- Candidate matching page
- Candidate profiles
- Interview scheduling
- Offer management

---

## 🚨 CRITICAL GAPS SUMMARY

### Module Completion Scores

| Module | Screens | Buttons | Flows | Score |
|--------|---------|---------|-------|-------|
| **Academy** | 9/15 | 25/29 | 1/2 | 75% 🟡 |
| **Client** | 1/9 | 1/4 | 0/1 | 10% 🔴 |
| **Bench** | 3/9 | 1/4 | 0/1 | 15% 🔴 |
| **HR** | 12/17 | 11/15 | 0/1 | 70% 🟡 |
| **Admin** | 0/9 | 0/10 | 0/1 | 0% 🔴 |
| **CEO AI** | 0/5 | 0/5 | 0/1 | 0% 🔴 |

### What Can Users Actually DO?

| User Type | Can Do? | Can't Do? |
|-----------|---------|-----------|
| **Student** | ✅ Learn lessons, view progress, practice interviews | ❌ Enroll, pay, get certificate |
| **HR Admin** | ✅ View employees, see courses | ❌ Assign courses (button broken) |
| **Client** | ⚠️ See landing page | ❌ Post jobs, hire talent (everything) |
| **Consultant** | ⚠️ See landing page | ❌ Browse jobs, apply (everything) |
| **Admin** | ❌ Nothing | ❌ Manage system (no screens) |
| **CEO** | ❌ Nothing | ❌ Track productivity (no screens) |

---

## ✅ WHAT WORKS (Can Demo This)

1. **Academy Learning Flow** - Student can complete full lesson (Theory → Demo → Quiz → Lab) ✅
2. **Progress Visualization** - Dashboard shows stats, progress bars ✅
3. **Course Browsing** - Can see all modules and lessons ✅
4. **Interview Practice** - Dojo simulation works ✅
5. **Portfolio** - Blueprint shows user stories ✅
6. **Persona** - Resume building page works ✅
7. **Navigation** - All menus and routing work ✅
8. **Visual Design** - Everything looks professional ✅

---

## ❌ WHAT'S BROKEN (Can't Demo This)

1. **Enrollment** - Can't actually sign up students ❌
2. **Payment** - Can't take money ❌
3. **Course Assignment** - HR can't assign courses (button dead) ❌
4. **Client Portal** - 90% missing ❌
5. **Bench Portal** - 85% missing ❌
6. **Admin Panel** - 100% missing ❌
7. **AI Chat** - Send button disabled ❌
8. **Certificates** - Can't generate/download ❌

---

## 📋 MINIMUM TO BE DEMO-READY

### If demoing to STUDENTS:
**Need to fix:**
1. ✅ Nothing! Academy works for demo

**Nice to have:**
2. Fix AI Mentor send button
3. Add enrollment modal (fake is OK)
4. Add payment page (fake is OK)

### If demoing to COMPANIES (Clients):
**Need to add:**
1. 🔴 Client dashboard
2. 🔴 Post requirement form
3. 🔴 Candidate browse page
4. 🔴 Basic profiles

**Estimated:** 2-3 full screens needed

### If demoing to HR:
**Need to fix:**
1. 🔴 Assign Course button (make it open modal)
2. 🔴 Employee selection modal
3. 🔴 Progress tracking view

**Estimated:** 1 modal + 1 screen

### If demoing FULL PLATFORM:
**Need to add:**
- Everything above
- Admin panel basics
- Bench portal basics

**Estimated:** 10+ screens

---

## 🎯 BOTTOM LINE

**What you HAVE:** Beautiful Academy module (75% complete)
**What you DON'T HAVE:** Working multi-tenant portal system

**Can you demo?**
- ✅ YES if selling ACADEMY to students
- ❌ NO if selling to clients/companies
- 🟡 MAYBE if selling to HR (need to fix assign button)

**What's the ONE critical thing to fix?**
🔴 **HR Learning Admin "Assign to Employee" button** - This is the ONLY truly broken feature in an otherwise working module.
