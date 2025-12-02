# PROMPT: SCREENS-TA (Window 8)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and crm skill.

Create/Update TA Specialist (Talent Acquisition) role screens for InTime v3 using the metadata-driven screen definition approach.

## Read First (Required):
- docs/specs/20-USER-ROLES/03-ta/00-OVERVIEW.md (Complete TA role spec)
- docs/specs/20-USER-ROLES/03-ta/01-daily-workflow.md (Daily workflow)
- docs/specs/20-USER-ROLES/03-ta/02-run-campaign.md (Campaign management)
- docs/specs/20-USER-ROLES/03-ta/03-internal-hiring.md (Internal hiring)
- docs/specs/20-USER-ROLES/03-ta/05-generate-leads.md (Lead generation)
- docs/specs/20-USER-ROLES/03-ta/06-qualify-lead.md (Lead qualification)
- docs/specs/20-USER-ROLES/03-ta/07-manage-training-pipeline.md (Training pipeline)
- docs/specs/01-GLOSSARY.md (Business terms)
- CLAUDE.md (Tech stack)

## Read Existing Code:
- src/screens/crm/index.ts (CRM screens - shared lead/deal entities)
- src/screens/crm/lead-list.screen.ts
- src/screens/crm/deal-list.screen.ts
- src/screens/crm/campaign-list.screen.ts
- src/lib/metadata/types.ts (ScreenDefinition type)
- src/lib/db/schema/crm.ts (CRM schema)

## Context:
- Routes: `/employee/workspace/ta/*` for TA-specific screens
- TA Specialist is a COMBINED ROLE that differs from Technical Recruiter:
  - **Recruiter**: Fills client positions (external placements)
  - **TA Specialist**: Generates leads, coordinates training, handles internal hiring

## TA vs Recruiter Distinction (Critical):
Per 00-OVERVIEW.md:
| Focus | TA Specialist | Technical Recruiter |
|-------|--------------|---------------------|
| Primary | Lead Generation | Fill Client Jobs |
| Customer | Mixed (B2B + B2C) | External Client |
| Outcome | Qualified Lead / Training Enrollment | Placement |
| Pipeline | Lead → Deal | Job → Submission → Placement |

---

## TA Dashboard (src/screens/ta/):

### 1. TA Dashboard
File: ta-dashboard.screen.ts
Route: `/employee/workspace/ta`

Per 00-OVERVIEW.md Section 4 (KPIs):

KPI Cards (Row 1):
- Leads Generated (MTD, target: 15-20)
- Lead-to-Deal Conversion (target: 25-30%)
- Deal Closure Rate (target: 20-25%)
- Pipeline Value (3-month forward, target: $100K-$200K)

KPI Cards (Row 2):
- Training Enrollments (QTD, target: 5-8)
- Internal Positions Filled (QTD, target: 1-2)
- Campaign Response Rate (target: 15-20%)
- Time to Qualify Lead (target: 3-7 days)

Widgets:
- Today's Priorities (follow-ups due, calls to make)
- Lead Pipeline Funnel (new → contacted → qualified → deal)
- Active Campaigns (with response rates)
- Pending Training Applications
- Internal Hiring Pipeline

---

## Lead Management Screens:

### 2. Leads List (UPDATE if exists in CRM)
File: lead-list.screen.ts OR ta-leads.screen.ts
Route: `/employee/workspace/ta/leads`

Per TA permissions: Own + Team leads

Views: Table | Kanban (by stage)

Kanban stages:
- New (uncontacted)
- Contacted (initial outreach)
- Engaged (responded)
- Qualifying (BANT in progress)
- Qualified (ready for deal)
- Disqualified (not a fit)

Table columns: companyName, contactName, source, status, leadScore, owner, lastContactedAt, createdAt
Filters: Status, Source (inbound/outbound), Score, Owner, Date range

Bulk actions: Send Campaign, Update Status, Assign Owner

### 3. Lead Detail
File: lead-detail.screen.ts
Route: `/employee/workspace/ta/leads/[id]`

Tabs:
- Overview: Company info, contact, source, qualification status
- BANT Qualification:
  - Budget: Confirmed? Range?
  - Authority: Decision maker identified?
  - Need: Clear articulated need?
  - Timeline: When do they need it?
- Activities: Call logs, emails, meetings
- Notes: Internal notes
- Conversion: Convert to Deal form

Header: Company, Contact name, Status badge, Lead score
Side panel: Quick actions (Call, Email, Log Activity, Convert to Deal)

Actions: Edit, Convert to Deal, Disqualify (with reason)

### 4. Lead Create/Edit Form
File: lead-form.screen.ts
Route: `/employee/workspace/ta/leads/new`

Form fields:
- Company Info: companyName, website, industry, employeeCount
- Contact Info: firstName, lastName, email, phone, title
- Lead Source: source (inbound/outbound), campaign (if from campaign)
- Notes: Initial notes

---

## Deal Management Screens:

### 5. Deals Pipeline
File: deal-pipeline.screen.ts OR ta-deals.screen.ts
Route: `/employee/workspace/ta/deals`

Per TA permissions: Own deals

Views: Kanban | List

Kanban stages:
- Qualification
- Discovery
- Proposal
- Negotiation
- Closed Won
- Closed Lost

Deal cards: name, accountName, value, probability, expectedCloseDate, owner

Filters: Stage, Deal type (training/staffing/partnership), Owner, Value range, Close date

### 6. Deal Detail
File: deal-detail.screen.ts
Route: `/employee/workspace/ta/deals/[id]`

Tabs:
- Overview: Deal info, value, probability, expected close
- Account: Related account info
- Contacts: Stakeholders involved
- Activities: Meetings, calls, emails
- Documents: Proposals, contracts
- History: Stage changes, notes

Header: Deal name, Account, Value, Stage badge
Weighted value display: Value × Probability

Actions: Edit, Change Stage, Won, Lost (with reason)

### 7. Deal Create/Edit Form
File: deal-form.screen.ts
Route: `/employee/workspace/ta/deals/new`

Form fields:
- Basic: name, dealType (training/staffing/partnership)
- Value: value, probability, expectedCloseDate
- Account: accountId (search or create new)
- Contacts: Key contacts (multi-select)
- Notes: Deal notes

---

## Campaign Management Screens:

### 8. Campaigns List
File: campaign-list.screen.ts
Route: `/employee/workspace/ta/campaigns`

Per 00-OVERVIEW.md: Own + Team campaigns

Table columns: name, type (email/linkedin), status (draft/active/paused/completed), recipientCount, responseRate, conversionRate, createdAt
Filters: Type, Status, Date range

Views: Table | Cards

Actions: Create Campaign

### 9. Campaign Detail
File: campaign-detail.screen.ts
Route: `/employee/workspace/ta/campaigns/[id]`

Tabs:
- Overview: Campaign info, status, schedule
- Audience: Recipient list, segmentation
- Content: Email template / LinkedIn messages
- Performance: Open rate, click rate, response rate, conversions
- Leads: Leads generated from this campaign

Analytics:
- Sent vs Delivered vs Opened vs Clicked vs Responded
- Conversion funnel
- A/B test results (if applicable)

Actions: Edit, Pause, Resume, Clone, Archive

### 10. Campaign Builder
File: campaign-builder.screen.ts
Route: `/employee/workspace/ta/campaigns/new`

Multi-step wizard:
1. **Campaign Type**: Email or LinkedIn
2. **Audience Selection**: Upload list / Select from CRM / Create segment
3. **Content Creation**:
   - Email: Subject, Body (rich text), Merge fields
   - LinkedIn: Connection request message, Follow-up messages
4. **Schedule**: Send now / Schedule / Drip sequence
5. **Review & Launch**: Preview, Test send, Confirm

A/B testing: Optional variation for subject/content

---

## Training Coordination Screens:

### 11. Training Applications Queue
File: training-applications.screen.ts
Route: `/employee/workspace/ta/training`

Pending training program applications:

Table: applicantName, program, appliedAt, status, screeningScore
Stages: New → Screening → Accepted → Enrolled → Deposit Paid

Filters: Program, Status, Date range

Actions per row: View Application, Schedule Interview, Accept, Reject

### 12. Training Application Detail
File: training-application-detail.screen.ts
Route: `/employee/workspace/ta/training/[id]`

- Applicant profile (from candidate record)
- Program applied for
- Application answers
- Screening interview notes
- Assessment scores
- Decision: Accept / Reject with notes
- If accepted: Enrollment form

### 13. Training Enrollments
File: training-enrollments.screen.ts
Route: `/employee/workspace/ta/training/enrollments`

Active and historical enrollments:

Table: enrolleeName, program, startDate, status, progress, depositPaid
Filters: Program, Status (enrolled/in_progress/completed/dropped), Cohort

### 14. Post-Training Placement Tracker
File: training-placement-tracker.screen.ts
Route: `/employee/workspace/ta/training/placements`

Track graduates for 90 days post-training:

Table: graduateName, program, completedAt, placementStatus, placedAt, employer
Filters: Program, Status (seeking/interviewing/placed/not_placed), Completion date

Per spec: 70% placement rate within 90 days target

---

## Internal Hiring Screens:

### 15. Internal Jobs List
File: internal-jobs.screen.ts
Route: `/employee/workspace/ta/internal-jobs`

Per 00-OVERVIEW.md: Full access to internal positions

Table: title, department, hiringManager, status (open/filled/on_hold/cancelled), applicantCount, postedAt
Filters: Department, Status, Hiring Manager

Actions: Create Job

### 16. Internal Job Detail
File: internal-job-detail.screen.ts
Route: `/employee/workspace/ta/internal-jobs/[id]`

Tabs:
- Details: Job description, requirements, compensation range
- Applicants: Candidate pipeline for this job
- Interviews: Scheduled and completed
- Offer: Offer details if extended

Actions: Edit, Close, Reopen

### 17. Internal Job Form
File: internal-job-form.screen.ts
Route: `/employee/workspace/ta/internal-jobs/new`

Form fields:
- Basic: title, department, hiringManager, employmentType
- Details: description (rich text), requirements, niceToHaves
- Compensation: salaryMin, salaryMax, bonus, equity
- Settings: postExternally, referralBonus

Requires TA Manager approval before posting

### 18. Internal Candidates Pipeline
File: internal-candidates.screen.ts
Route: `/employee/workspace/ta/internal-candidates`

All internal hire candidates:

Kanban stages:
- Applied
- Phone Screen
- Hiring Manager Interview
- Final Round
- Offer Extended
- Offer Accepted / Declined

Table: name, job, stage, appliedAt, source (referral/direct/agency)

### 19. Internal Candidate Detail
File: internal-candidate-detail.screen.ts
Route: `/employee/workspace/ta/internal-candidates/[id]`

Tabs:
- Profile: Resume, contact, work history
- Application: Job applied for, screening answers
- Interviews: Interview schedule, feedback
- Offer: Offer details, negotiation notes
- Onboarding: After acceptance, onboarding checklist

Actions: Schedule Interview, Advance Stage, Extend Offer, Reject

---

## Analytics & Reporting:

### 20. TA Analytics Dashboard
File: ta-analytics.screen.ts
Route: `/employee/workspace/ta/analytics`

Per 00-OVERVIEW.md permissions: Own data only

Sections:
- Lead Funnel: Leads → Qualified → Deals → Won
- Deal Pipeline Value (3-month forward)
- Campaign Performance (response rates, conversions)
- Time metrics (Time to Qualify, Sales Cycle)
- Conversion Metrics (Lead-to-Deal, Deal-to-Won)

Charts: Funnel, Bar, Line with period comparison

Filters: Date range, Deal type

---

## Activities Queue:

### 21. TA Activities
File: ta-activities.screen.ts
Route: `/employee/workspace/ta/activities`

TA-specific activity patterns:
- Prospect outreach (LinkedIn, email)
- Discovery call
- Qualification call (BANT)
- Send proposal
- Follow up on proposal
- Screen training candidate
- Interview internal candidate
- Coordinate onboarding

Use Phase 2 ActivityQueue with TA patterns

## Screen Definition Pattern:
```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const taScreenName: ScreenDefinition = {
  id: 'ta-screen-id',
  type: 'list' | 'detail' | 'dashboard' | 'kanban',
  title: 'Screen Title',
  icon: 'IconName',

  permission: {
    roles: ['ta_specialist', 'ta_manager', 'admin'],
  },

  dataSource: {
    type: 'query',
    query: { procedure: 'ta.procedure' },
  },

  layout: { /* sections */ },
  actions: [...],
};
```

## Requirements:
- Lead qualification (BANT) workflow
- Campaign builder with templates
- Training application screening
- Internal hiring pipeline
- CRM integration (leads, deals share schema)
- Activity logging for all interactions
- Follow existing CRM screen patterns

## Key Integrations:
- LinkedIn Sales Navigator (prospecting)
- Email marketing (campaigns)
- Calendar (interview scheduling)
- Academy module (training enrollments)
- HR module (internal hire onboarding)

## After Screens:
1. Create screen definitions in src/screens/ta/ (new folder)
2. Create taScreens registry
3. Export from src/screens/index.ts
4. Create routes in src/app/employee/workspace/ta/
5. Update navigation config for ta_specialist role
