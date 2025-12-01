# PROMPT: SCREENS-RECRUITER (Window 1)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and recruiting skill.

Create all Recruiter role screens for InTime v3.

## Read First:
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md
- docs/specs/20-USER-ROLES/01-recruiter/03-source-candidates.md
- docs/specs/20-USER-ROLES/01-recruiter/04-submit-candidate.md
- docs/specs/20-USER-ROLES/01-recruiter/05-schedule-interview.md
- docs/specs/20-USER-ROLES/01-recruiter/15-prospect-clients.md
- docs/specs/20-USER-ROLES/01-recruiter/16-manage-account.md
- src/components/forms/domain/*.tsx
- src/components/tables/domain/*.tsx
- src/components/cards/entity/*.tsx

## Create Screens (src/app/(app)/recruiter/):

### 1. Dashboard (/recruiter)
File: page.tsx

Layout:
- Welcome banner (name, date, quick stats)
- KPI cards row: Open Jobs, Active Candidates, Pending Submissions, Interviews Today
- Two-column layout:
  - Left: My Activities (due today, overdue, upcoming)
  - Right: Recent Updates (new submissions, status changes)
- Bottom row:
  - Pipeline Snapshot (funnel visualization)
  - Upcoming Interviews (next 7 days)

### 2. Jobs List (/recruiter/jobs)
File: jobs/page.tsx

Layout:
- Page header: "Jobs" + Create Job button
- Toolbar: Search, Status filter, Priority filter, Account filter, View toggle (table/cards)
- JobsTable with columns: title, account, status, priority, positions, submissions
- Pagination
- Click row → Job detail drawer

### 3. Job Detail (/recruiter/jobs/[id])
File: jobs/[id]/page.tsx

Layout:
- DetailLayout with tabs
- Header: Title, Account, Status badge, Priority badge, Actions (Edit, Clone, Pause)
- Tabs:
  - Overview: Description, requirements, rates, screening questions
  - Submissions: SubmissionsTable filtered by job
  - Interviews: InterviewsTable filtered by job
  - Activities: ActivityList filtered by job
- Side panel: Job quick stats, Timeline

### 4. Job Create/Edit (/recruiter/jobs/new, /recruiter/jobs/[id]/edit)
Files: jobs/new/page.tsx, jobs/[id]/edit/page.tsx

Layout:
- Multi-step form (FormStepper)
- Steps: Details → Requirements → Skills → Rates → Screening → Review
- Save as Draft, Publish buttons

### 5. Candidates List (/recruiter/candidates)
File: candidates/page.tsx

Layout:
- Page header: "Candidates" + Add Candidate button
- Toolbar: Search (name, email, skills), Status filter, Source filter, Visa filter
- CandidatesTable with columns: name, status, source, title, visa, skills
- Bulk actions: Submit to Job, Add to Hotlist
- Click row → Candidate drawer

### 6. Candidate Detail (/recruiter/candidates/[id])
File: candidates/[id]/page.tsx

Layout:
- DetailLayout with tabs
- Header: Avatar, Name, Title, Status badge, Actions (Edit, Submit, Hotlist)
- Tabs:
  - Profile: Summary, contact info, work preferences
  - Skills: Skills matrix with proficiency
  - Experience: Work history, education
  - Submissions: SubmissionsTable for candidate
  - Documents: Resume, portfolio, certifications
  - Activities: ActivityList for candidate
- Side panel: Availability, Rates, Quick actions

### 7. Candidate Add/Edit
Files: candidates/new/page.tsx, candidates/[id]/edit/page.tsx

Layout:
- CandidateForm with sections
- Resume upload with parsing
- Skills auto-suggest

### 8. Submissions List (/recruiter/submissions)
File: submissions/page.tsx

Layout:
- Page header: "Submissions"
- View toggle: Table | Kanban
- Table view: SubmissionsTable with columns: candidate, job, status, submitted, rates
- Kanban view: Columns by status (Submitted, Under Review, Shortlisted, Interview, Offer)
- Filters: Status, Job, Date range

### 9. Submission Detail (/recruiter/submissions/[id])
File: submissions/[id]/page.tsx

Layout:
- SplitLayout
- Left: Submission details (candidate, job, rates, notes)
- Right: Timeline (status changes, notes, activities)
- Actions: Update Status, Schedule Interview, Add Note

### 10. Interviews (/recruiter/interviews)
File: interviews/page.tsx

Layout:
- View toggle: Calendar | List
- Calendar view: Week/day with interview blocks
- List view: Upcoming interviews table
- Filters: Date range, Type, Status
- Quick actions: Reschedule, Cancel

### 11. Interview Detail (/recruiter/interviews/[id])
File: interviews/[id]/page.tsx

Layout:
- Interview details: Type, Date/Time, Duration, Location/Link
- Participants list with roles
- Candidate summary card
- Job summary card
- Feedback section (after completion)
- Actions: Reschedule, Cancel, Add Feedback

### 12. Activities (/recruiter/activities)
File: activities/page.tsx

Layout:
- MyActivitiesWidget (top)
- ActivityQueue (main)
- Filters: Status, Priority, Pattern, Overdue
- Create Activity button

### 13. Accounts (/recruiter/accounts)
File: accounts/page.tsx

Layout:
- Page header: "My Accounts"
- AccountsTable: name, tier, health_score, active_jobs, placements
- Filters: Tier, Health status
- Click → Account detail

### 14. Account Detail (/recruiter/accounts/[id])
File: accounts/[id]/page.tsx

Layout:
- DetailLayout with tabs
- Header: Logo, Name, Tier badge, Health score, Actions
- Tabs:
  - Overview: Company info, preferences
  - Jobs: Jobs for this account
  - Contacts: Key contacts
  - Placements: Active and historical
  - Metrics: Account performance
  - Activities: Account-related activities

## Screen Metadata:
For each screen, create metadata definition in src/lib/metadata/screens/recruiter/:
```tsx
export const jobsListScreen: ScreenDefinition = {
  id: 'recruiter.jobs.list',
  title: 'Jobs',
  path: '/recruiter/jobs',
  permissions: ['job:read'],
  layout: 'list',
  components: { ... }
};
```

## Requirements:
- Use layouts from phase2
- Use forms, tables, cards from phase2
- Integrate with tRPC queries
- Loading states (skeletons)
- Error boundaries
- Mobile responsive
- Keyboard shortcuts

## After Screens:
- Add routes to navigation config
- Export screen metadata from src/lib/metadata/screens/index.ts
