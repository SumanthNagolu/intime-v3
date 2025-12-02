# PROMPT: SCREENS-RECRUITER (Window 1)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and recruiting skill.

Create/Update Recruiter role screens for InTime v3 using the metadata-driven screen definition approach.

## Read First (Required):
- docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md (Complete role spec with screen access map)
- docs/specs/20-USER-ROLES/01-recruiter/01-daily-workflow.md (Daily workflow patterns)
- docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md (Job form detailed specs)
- docs/specs/20-USER-ROLES/01-recruiter/03-source-candidates.md (Candidate sourcing)
- docs/specs/20-USER-ROLES/01-recruiter/04-submit-candidate.md (Submission workflow)
- docs/specs/20-USER-ROLES/01-recruiter/05-schedule-interview.md (Interview scheduling)
- docs/specs/01-GLOSSARY.md (Business terms, RACI model)
- CLAUDE.md (Tech stack, patterns)

## Read Existing Code:
- src/screens/recruiting/index.ts (Existing screen registry)
- src/screens/recruiting/recruiter-dashboard.screen.ts (Dashboard pattern reference)
- src/screens/recruiting/list-screens.ts (List patterns)
- src/lib/metadata/types.ts (ScreenDefinition type)
- src/components/forms/domain/ (Phase 2 forms)
- src/components/tables/ (Phase 2 tables)
- src/components/activities/ (Phase 2 activity components)

## Context:
- Routes follow pattern: `/employee/workspace/*` for recruiter screens
- Existing screens in `src/screens/recruiting/` should be UPDATED/ENHANCED
- Use `ScreenDefinition` type for all screen metadata
- Reference Phase 2 components (forms, tables, cards, layouts, activities)
- Recruiters have "Partner Model" role (BDM + AM + Recruiter + DM combined)

## Screen Definitions to Create/Update (src/screens/recruiting/):

### 1. Dashboard (ENHANCE existing)
File: recruiter-dashboard.screen.ts
Route: `/employee/workspace`
Status: EXISTS - Review and enhance if needed

Already includes:
- Sprint Progress (6 KPIs: Placements, Revenue, Submissions, Interviews, Candidates, Fill Rate)
- Today's Priorities (overdue, due today, high priority)
- Pipeline Health
- Account Portfolio
- Activity Summary (7-day)
- Quality Metrics (30-day)
- Upcoming Calendar
- Recent Wins

Enhance with:
- RACI Watchlist (items where user is Consulted/Informed)
- Client relationship health alerts
- Cross-pillar opportunities widget

### 2. Jobs List (UPDATE existing)
File: list-screens.ts → jobsListScreen
Route: `/employee/workspace/jobs`
Status: EXISTS - Update per spec

Per 00-OVERVIEW.md Screen Access Map:
- View: Own + RACI (C, I)
- Actions: Create, filter, search, bulk actions
- Row click → Job detail drawer or page

Required fields: title, accountId, jobType, status, priority, positionsCount, rateMin/Max, submissions count
Filters: Status (open/filled/on_hold/cancelled), Priority, Account, Date range
Views: Table (default), Cards

### 3. Job Detail (UPDATE existing)
File: job-detail.screen.ts
Route: `/employee/workspace/jobs/[id]`
Status: EXISTS - Ensure aligns with 02-create-job.md specs

Tabs:
- Overview: Description, requirements, rates, screening questions, RACI ownership
- Submissions: Filtered by job (SubmissionsTable)
- Pipeline: Kanban view of candidates by stage
- Interviews: Scheduled/completed interviews
- Activities: Activity timeline for this job
- History: Audit log

Header: Title, Account link, Status badge, Priority badge, Job Type badge
Actions: Edit, Clone, Publish/Unpublish, Close, Add Candidate

### 4. Job Create/Edit (CREATE if missing)
Files: job-form.screen.ts
Routes: `/employee/workspace/jobs/new`, `/employee/workspace/jobs/[id]/edit`

Use JobForm from Phase 2 (src/components/forms/domain/JobForm.tsx)
Multi-step form:
1. Details: title, accountId (searchable), jobType, description (rich text), location, isRemote, hybridDays
2. Requirements: requiredSkills (tag input), niceToHaveSkills, minExperienceYears, maxExperienceYears, visaRequirements (multi-select)
3. Compensation: rateMin, rateMax, rateType, priority, urgency, targetFillDate, targetStartDate
4. Screening: Dynamic screening questions builder
5. Review: Summary before publish

Actions: Save Draft, Publish

### 5. Candidates List (UPDATE existing)
File: list-screens.ts → candidatesListScreen
Route: `/employee/workspace/candidates`
Status: EXISTS - Verify per spec

Per 00-OVERVIEW.md:
- View: All in Org (read), Own (edit)
- Filters: Status (new/active/passive/placed/on_bench/do_not_use/inactive), Source, Visa type, Skills, Location
- Bulk actions: Submit to Job, Add to Hotlist

### 6. Candidate Detail (UPDATE existing)
File: candidate-detail.screen.ts
Route: `/employee/workspace/candidates/[id]`
Status: EXISTS - Verify tabs per spec

Tabs:
- Profile: Contact info, work preferences, summary
- Skills: Skills matrix with proficiency levels
- Experience: Work history, education (timeline)
- Submissions: All submissions for this candidate
- Documents: Resume (versions), portfolio, certifications
- Activities: Activity timeline
- Notes: Internal notes

Header: Avatar, Name, Title, Status badge, Visa badge (color-coded)
Side Panel: Availability, Rate expectations, Quick submit action

### 7. Submissions List (UPDATE existing)
File: submission-pipeline.screen.ts OR list-screens.ts
Route: `/employee/workspace/submissions`
Status: EXISTS - Verify views

Views:
- Table: candidateName, jobTitle, accountName, status, submittedAt, rates
- Kanban: Columns by status (Sourced → Submitted → Reviewing → Interview → Offer → Placed)

Per 00-OVERVIEW.md: View Own + Job RACI

### 8. Submission Detail (UPDATE existing)
File: submission-detail.screen.ts
Route: `/employee/workspace/submissions/[id]`
Status: EXISTS - Verify per 04-submit-candidate.md

Layout: Split view
- Left: Submission details, candidate summary, job summary, rates, margin display
- Right: Timeline (status changes, activities, notes)

Actions: Update Status, Schedule Interview, Add Note, Withdraw

### 9. Interviews Calendar (CREATE if missing)
File: interviews-calendar.screen.ts
Route: `/employee/workspace/interviews`

Views:
- Calendar: Week/day view with interview blocks
- List: Table of upcoming/past interviews

Filters: Date range, Status (scheduled/completed/cancelled/no_show), Type (phone/video/onsite)
Quick actions: Reschedule, Cancel, Add Feedback

### 10. Interview Detail (CREATE if missing)
File: interview-detail.screen.ts
Route: `/employee/workspace/interviews/[id]`

Fields: Type, Date/Time, Duration, Location/Link, Participants
Related: Candidate summary card, Job summary card
After completion: Feedback form

### 11. Accounts List (CREATE if missing)
File: account-list.screen.ts
Route: `/employee/workspace/accounts`

Per 00-OVERVIEW.md: All (read), Own contacts (edit)
Columns: name, industry, tier, healthScore, activeJobs, placementCount, lastContactAt
Filters: Tier (enterprise/mid_market/smb), Status (prospect/active/inactive)

### 12. Account Detail (CREATE if missing)
File: account-detail.screen.ts
Route: `/employee/workspace/accounts/[id]`

Tabs:
- Overview: Company info, preferences, billing
- Jobs: All jobs for this account
- Contacts: Key contacts table
- Placements: Active and historical
- Metrics: Account performance charts
- Activities: Account timeline

Header: Logo, Name, Tier badge, Health score indicator
RACI display: Current ownership

### 13. Contacts List (CREATE if missing)
File: contact-list.screen.ts
Route: `/employee/workspace/contacts`

Columns: name, title, accountName, email, phone, lastContactAt
Filters: Account, Role/Title, Last contacted

### 14. Leads & Deals (CREATE if missing)
Files: lead-list.screen.ts, lead-detail.screen.ts, deal-list.screen.ts, deal-detail.screen.ts
Routes: `/employee/workspace/leads`, `/employee/workspace/deals`

Per 00-OVERVIEW.md recruiter also does BD:
- Leads: source, status, companyName, contactName, qualificationScore
- Deals: accountId, name, value, stage (pipeline), probability, expectedCloseDate

### 15. Activities Queue (CREATE if missing)
File: activities-queue.screen.ts
Route: `/employee/workspace/activities`

Use Phase 2 activity components:
- ActivityQueue (priority sorted)
- MyActivitiesWidget (summary)
- Filters: Status, Priority, Pattern type, Overdue, Entity type

Actions: Create Activity, Complete, Defer, Reassign

### 16. Placements List (CREATE if missing)
File: placements-list.screen.ts
Route: `/employee/workspace/placements`

Per 00-OVERVIEW.md: View Own
Columns: candidateName, accountName, jobTitle, startDate, endDate, status, billRate, payRate
Filters: Status (active/pending/completed/terminated), Date range, Account

Include: 30/60/90 day check-in indicators

### 17. Placement Detail (CREATE if missing)
File: placement-detail.screen.ts
Route: `/employee/workspace/placements/[id]`

Tabs:
- Overview: Contract details, rates, dates
- Check-ins: 30/60/90 day tracker
- Extensions: History and pending
- Issues: Any flagged issues
- Timesheets: If integrated
- Activities: Related activities

## Screen Definition Pattern:
```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const screenNameScreen: ScreenDefinition = {
  id: 'screen-id',
  type: 'list' | 'detail' | 'dashboard' | 'form',
  title: 'Screen Title',
  icon: 'IconName',

  dataSource: {
    type: 'query',
    query: { procedure: 'router.procedure' },
  },

  layout: {
    type: 'single-column' | 'two-column' | 'tabs',
    // ... sections
  },

  actions: [...],
  navigation: {
    breadcrumbs: [...],
  },
  keyboard_shortcuts: [...],
};
```

## Requirements:
- Use ScreenDefinition type from src/lib/metadata/types.ts
- Reference Phase 2 components (ActivityQueue, forms, tables)
- Follow existing pattern from recruiter-dashboard.screen.ts
- Integrate with tRPC queries (dataSource.query.procedure)
- Loading states using section-level skeleton
- Error boundaries per section
- Mobile responsive
- Keyboard shortcuts (g+j=jobs, g+c=candidates, etc.)

## After Screens:
1. Export from src/screens/recruiting/index.ts
2. Add to recruitingScreens registry
3. Create corresponding routes in src/app/employee/workspace/ if not exists
4. Update navigation config in src/lib/navigation/navConfig.ts
