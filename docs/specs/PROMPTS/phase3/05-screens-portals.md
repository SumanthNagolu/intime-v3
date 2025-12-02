# PROMPT: SCREENS-PORTALS (Window 5)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and frontend skill.

Create/Update Client Portal, Candidate Portal, and Academy Portal screens for InTime v3.

## Read First (Required):
- docs/specs/20-USER-ROLES/11-client-portal/00-OVERVIEW.md (Client portal spec)
- docs/specs/20-USER-ROLES/12-candidate-portal/00-OVERVIEW.md (Candidate portal spec)
- docs/specs/20-USER-ROLES/13-academy/00-OVERVIEW.md (Academy portal spec if exists)
- docs/specs/01-GLOSSARY.md (Business terms)
- CLAUDE.md (Tech stack)

## Read Existing Code:
- src/app/auth/client/page.tsx (Client auth)
- src/app/auth/talent/page.tsx (Candidate/talent auth)
- src/app/auth/academy/page.tsx (Academy auth)
- src/components/academy/ (Academy components)
- src/lib/metadata/types.ts (ScreenDefinition type)

## Context:
- Portals are EXTERNAL facing (clients, candidates, learners)
- Separate auth flows from employee system
- Clean, professional, mobile-first design
- Minimal JS, fast loading
- Accessibility compliant

---

## Client Portal Screens (src/app/client/):

### 1. Client Dashboard
File: page.tsx OR use ScreenRenderer with client-dashboard.screen.ts
Route: `/client`

Layout:
- Welcome banner (company name, primary contact)
- Quick stats row:
  - Active Jobs count
  - Pending Submissions (awaiting review)
  - Upcoming Interviews
  - Active Placements
- Two-column:
  - Left: Pending Actions card (submissions to review, interviews to schedule)
  - Right: Recent Activity feed
- Bottom: Active Placements summary

### 2. Jobs List (Client View)
Route: `/client/jobs`

Client's job orders:
- Table/Cards: title, status, positionsCount, submissionsCount, interviewsCount, createdAt
- Status filter: Open, Filled, On Hold, Cancelled
- Click → Job detail

### 3. Job Detail (Client View)
Route: `/client/jobs/[id]`

Tabs:
- Details: Job description, requirements, rates (if visible)
- Submissions: Candidates submitted for this job (review queue)
- Interviews: Scheduled and completed interviews
- Placements: Hired candidates

Actions: Request More Candidates, Edit Requirements, Put On Hold

### 4. Submissions Review Queue
Route: `/client/submissions`

All pending submissions across jobs:
- Cards with candidate summary (may be anonymized)
- Skills match percentage
- Rate (if disclosed)
- Quick actions: View Profile, Shortlist, Reject, Request Interview

Filters: Job, Status (pending/shortlisted/rejected)

### 5. Submission Detail (Client View)
Route: `/client/submissions/[id]`

Candidate review screen:
- Profile as shared (may hide some details)
- Resume viewer (embedded)
- Skills matrix with job requirements match
- Work history
- Rate information
- Screening question answers

Actions: Shortlist, Reject (with reason), Request Interview
Feedback form: Required feedback on decision

### 6. Interviews (Client View)
Route: `/client/interviews`

Views: Calendar | List
- Upcoming interviews
- Past interviews (with feedback status)
- Interview cards: candidate, date, time, type, interviewers

Actions: View Details, Provide Feedback, Reschedule

### 7. Interview Detail (Client View)
Route: `/client/interviews/[id]`

- Date, Time, Type, Duration
- Candidate summary
- Meeting link or location
- Interviewers from client side
- Preparation materials (if provided)
- Post-interview: Feedback form (rating, comments, decision)

Actions: Reschedule, Cancel, Submit Feedback

### 8. Placements (Client View)
Route: `/client/placements`

Active and historical placements:
- Cards: consultant name, role, start date, end date, status
- Filters: Status (active/completed), Date range

### 9. Placement Detail (Client View)
Route: `/client/placements/[id]`

- Consultant profile
- Contract info: Start, End, Rate
- Performance check-ins (if shared)
- Extension request form
- Issue reporting

### 10. Client Reports
Route: `/client/reports`

Available reports:
- Hiring Activity (jobs, submissions, interviews)
- Time to Fill Analysis
- Placement History
- Spending Summary
- Diversity Report (if enabled)

Export: PDF, Excel

### 11. Client Settings
Route: `/client/settings`

Sections:
- Account Preferences (notification frequency, communication)
- Team Members (invite colleagues, manage access)
- Billing Preferences
- Integration Settings (calendar sync)

---

## Candidate Portal Screens (src/app/talent/ or src/app/candidate/):

### 12. Candidate Dashboard
Route: `/talent`

Layout:
- Welcome banner (candidate name)
- Profile completeness indicator (progress bar)
- Quick stats: Active Applications, Interviews Scheduled, Offers Pending
- Two-column:
  - Left: Application status updates
  - Right: Recommended jobs
- Bottom: Upcoming interviews card

### 13. My Profile
Route: `/talent/profile`

Profile editor with sections:
- Personal Info (name, location, contact)
- Work Experience (add/edit/remove)
- Education
- Skills (tag input with proficiency)
- Work Preferences (job type, location, rate, remote preference)
- Documents (resume upload, certifications)

Profile completeness indicator per section
Save progress automatically

### 14. Job Search
Route: `/talent/jobs`

Search and browse jobs:
- Search bar with autocomplete
- Filter sidebar:
  - Job type (Contract, FTE, Contract-to-Hire)
  - Work mode (Remote, Hybrid, Onsite)
  - Location (with radius)
  - Rate/Salary range
  - Skills
  - Company
- Job cards:
  - Title, Company, Location, Type
  - Rate range (if shown)
  - Match score (based on profile)
  - Posted date
  - Save / Apply buttons

Pagination or infinite scroll

### 15. Job Detail (Candidate View)
Route: `/talent/jobs/[id]`

- Job header: Title, Company, Location, Type
- Full description
- Requirements with match indicators (green check / yellow partial / red missing)
- Skills required (matched against profile)
- Company info
- Apply button (prominent CTA)
- Save for later
- Share job
- Similar jobs

### 16. Application Flow
Route: `/talent/jobs/[id]/apply`

Multi-step application:
1. Review Profile: Confirm info is current
2. Screening Questions: Answer job-specific questions
3. Cover Letter: Optional personalized message
4. Availability & Rate: When can you start? Rate expectations
5. Review & Submit: Final review before submission

Progress indicator
Save draft option

### 17. My Applications
Route: `/talent/applications`

Applications by status:
- Active: Submitted, Under Review, Interviewing
- Completed: Offered, Placed, Rejected, Withdrawn

Application cards:
- Job title, Company
- Status badge
- Applied date
- Last activity

Click → Application detail
Withdraw action (for active applications)

### 18. Application Detail
Route: `/talent/applications/[id]`

- Status timeline (visual)
- Job summary
- Submitted information
- Upcoming interview (if scheduled)
- Messages from recruiter
- Actions: Withdraw, Update Availability

### 19. Interviews (Candidate View)
Route: `/talent/interviews`

Upcoming and past interviews:
- Calendar or list view
- Interview cards: Company, Position, Date, Time, Type
- Meeting link or location
- Interviewers (if provided)
- Add to calendar button

### 20. Interview Detail (Candidate View)
Route: `/talent/interviews/[id]`

- Full interview info
- Company research links
- Interviewers (with LinkedIn if provided)
- Preparation tips
- Meeting link with one-click join
- Add to Google/Outlook calendar

### 21. Offers
Route: `/talent/offers`

Pending and past offers:
- Offer cards: Position, Company, Compensation, Start date, Expiry
- Accept / Decline buttons
- Expiry countdown for pending offers

### 22. Offer Detail
Route: `/talent/offers/[id]`

- Offer letter view (PDF or rendered)
- Compensation breakdown
- Benefits summary
- Terms and conditions
- Accept / Decline with confirmation
- Negotiate button (if enabled)

### 23. Saved Jobs
Route: `/talent/saved`

Saved job list:
- Quick apply from saved
- Remove from saved
- Sort by date saved

### 24. Candidate Settings
Route: `/talent/settings`

- Notification preferences
- Privacy settings (profile visibility)
- Job alert subscriptions
- Password change
- Account deletion request

---

## Academy Portal Screens (src/app/academy/ or src/app/training/):

### 25. Academy Dashboard
Route: `/training`

Per academy skill:
- XP Progress bar
- Current streak display (with flame animation)
- Active courses
- Recently completed
- Achievements/Badges
- Leaderboard (optional)

### 26. Courses Catalog
Route: `/training/courses`

Browse courses:
- Categories: Technical, Soft Skills, Compliance, Role-specific
- Course cards: Title, Duration, XP reward, Difficulty
- Progress indicator if started
- Filters: Category, Duration, Skill level

### 27. Course Detail
Route: `/training/courses/[id]`

- Course overview
- Lessons list with checkmarks
- Estimated time
- XP reward
- Prerequisites
- Start / Continue button

### 28. Lesson View
Route: `/training/courses/[courseId]/lessons/[lessonId]`

- Video or content area
- Progress tracker
- Quiz/Assessment (if applicable)
- Next lesson navigation
- Mark complete

### 29. My Learning
Route: `/training/my-learning`

- In-progress courses
- Completed courses
- Certificates earned
- XP history

### 30. Certificates
Route: `/training/certificates`

- Earned certificates grid
- Download/Print options
- Share to LinkedIn

### 31. Achievements
Route: `/training/achievements`

- Badges/Achievements earned
- Progress toward next badges
- Streak history

## Screen Definition Pattern:
```typescript
// For portal screens using metadata
import type { ScreenDefinition } from '@/lib/metadata/types';

export const portalScreenName: ScreenDefinition = {
  id: 'portal-screen-id',
  type: 'list' | 'detail' | 'dashboard',
  title: 'Screen Title',

  // Portal-specific: public or authenticated
  auth: {
    required: true,
    portalType: 'client' | 'candidate' | 'academy',
  },

  dataSource: {
    type: 'query',
    query: { procedure: 'portal.procedure' },
  },

  layout: { /* sections */ },
};
```

## Requirements:
- Clean, professional design for external users
- Mobile-first (candidates often use phones)
- Fast loading (code-split, minimal JS)
- Accessibility compliant (WCAG 2.1 AA)
- Clear call-to-actions
- Progress indicators
- Email notification integration
- SEO friendly for job listings

## Authentication:
- Separate auth flow from employee system
- Magic link option for candidates
- SSO for enterprise clients (if configured)
- Remember me option
- Session timeout handling

## After Screens:
1. Create screen definitions in src/screens/portals/
2. Create routes in src/app/client/, src/app/talent/, src/app/training/
3. Update portal navigation configs
4. Test mobile responsiveness
