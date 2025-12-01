# PROMPT: SCREENS-PORTALS (Window 5)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create Client Portal and Candidate Portal screens for InTime v3.

## Read First:
- docs/specs/20-USER-ROLES/11-client-portal/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/11-client-portal/02-review-submissions.md
- docs/specs/20-USER-ROLES/11-client-portal/03-schedule-interviews.md
- docs/specs/20-USER-ROLES/11-client-portal/04-manage-placements.md
- docs/specs/20-USER-ROLES/12-candidate-portal/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/12-candidate-portal/04-track-applications.md
- docs/specs/20-USER-ROLES/12-candidate-portal/06-search-apply-jobs.md

## Create Client Portal Screens (src/app/(portal)/client/):

### 1. Client Dashboard (/client)
File: page.tsx

Layout:
- Welcome banner (company name, primary contact)
- Quick stats row:
  - Active Jobs
  - Pending Submissions
  - Upcoming Interviews
  - Active Placements
- Two-column:
  - Left: Pending Actions (submissions to review, interviews to schedule)
  - Right: Recent Activity feed
- Bottom: Active Placements overview

### 2. Jobs List (/client/jobs)
File: jobs/page.tsx

Layout:
- Page header: "Your Jobs"
- Jobs cards/table: title, status, submissions count, interviews, positions
- Filters: Status, Date range
- Click → Job detail

### 3. Job Detail (/client/jobs/[id])
File: jobs/[id]/page.tsx

Layout:
- Job header: Title, Status, Posted date
- Job description, requirements
- Tabs:
  - Submissions: Candidates submitted for review
  - Interviews: Scheduled/completed interviews
  - Placements: Filled positions
- Actions: Request More Candidates

### 4. Submissions Review (/client/submissions)
File: submissions/page.tsx

Layout:
- Pending submissions queue
- Submission cards with:
  - Candidate summary (anonymized or full based on settings)
  - Skills match indicators
  - Rate
  - Quick actions: View Profile, Shortlist, Reject, Request Interview
- Filters: Job, Status

### 5. Submission Detail (/client/submissions/[id])
File: submissions/[id]/page.tsx

Layout:
- Candidate profile view (as shared by recruiter)
- Resume viewer
- Skills matrix
- Work history
- Rate information
- Actions: Shortlist, Reject, Request Interview
- Feedback form

### 6. Interviews (/client/interviews)
File: interviews/page.tsx

Layout:
- View toggle: Calendar | List
- Upcoming interviews
- Past interviews (with feedback status)
- Actions: View Details, Provide Feedback
- Schedule new interview (for shortlisted candidates)

### 7. Interview Detail (/client/interviews/[id])
File: interviews/[id]/page.tsx

Layout:
- Interview info: Date, Time, Type, Duration
- Candidate summary
- Meeting link/location
- Interviewers list
- Actions: Reschedule, Cancel
- Feedback form (post-interview)

### 8. Placements (/client/placements)
File: placements/page.tsx

Layout:
- Active placements grid
- Placement cards: consultant, role, start date, rate, status
- Historical placements
- Filters: Status, Date range

### 9. Placement Detail (/client/placements/[id])
File: placements/[id]/page.tsx

Layout:
- Placement header: Consultant name, Role, Status
- Contract info: Start date, End date, Rate
- Performance notes
- Extension request option
- Issue reporting

### 10. Reports (/client/reports)
File: reports/page.tsx

Layout:
- Available reports:
  - Hiring activity
  - Time to fill
  - Placement history
  - Spending summary
- Export options

### 11. Settings (/client/settings)
File: settings/page.tsx

Layout:
- Account preferences
- Notification settings
- Team members (invite/manage)
- Integration settings

---

## Create Candidate Portal Screens (src/app/(portal)/candidate/):

### 12. Candidate Dashboard (/candidate)
File: page.tsx

Layout:
- Welcome banner (candidate name)
- Profile completeness indicator
- Quick stats: Active Applications, Interviews Scheduled, Offers Pending
- Two-column:
  - Left: Application status updates
  - Right: Recommended jobs
- Bottom: Upcoming interviews

### 13. My Profile (/candidate/profile)
File: profile/page.tsx

Layout:
- Profile completeness bar
- Sections (accordion or tabs):
  - Personal Info
  - Contact Information
  - Work Experience
  - Education
  - Skills
  - Preferences (job type, location, rate)
  - Documents (resume, certifications)
- Edit capabilities per section

### 14. Job Search (/candidate/jobs)
File: jobs/page.tsx

Layout:
- Search bar with filters
- Filter sidebar:
  - Job type (contract, FTE, C2H)
  - Work mode (remote, hybrid, onsite)
  - Location
  - Salary/Rate range
  - Skills
- Job cards grid:
  - Title, Company, Location, Type
  - Brief description
  - Match score (if applicable)
  - Save / Apply buttons
- Pagination or infinite scroll

### 15. Job Detail (/candidate/jobs/[id])
File: jobs/[id]/page.tsx

Layout:
- Job header: Title, Company, Location, Type
- Full description
- Requirements list
- Skills required (with match indicators if logged in)
- Company info summary
- Apply button (prominent)
- Save for later
- Similar jobs

### 16. Application Flow (/candidate/jobs/[id]/apply)
File: jobs/[id]/apply/page.tsx

Layout:
- Multi-step form:
  1. Review Profile (confirm info is current)
  2. Screening Questions (from job)
  3. Cover Letter (optional)
  4. Availability & Rate
  5. Review & Submit
- Progress indicator
- Save draft option

### 17. My Applications (/candidate/applications)
File: applications/page.tsx

Layout:
- Applications list by status:
  - Active (Submitted, Under Review, Interviewing)
  - Completed (Offered, Placed, Rejected, Withdrawn)
- Application cards:
  - Job title, Company
  - Status badge
  - Applied date
  - Last activity
- Click → Application detail
- Withdraw action (for active)

### 18. Application Detail (/candidate/applications/[id])
File: applications/[id]/page.tsx

Layout:
- Application status timeline
- Job summary
- Submitted information
- Upcoming interview (if scheduled)
- Messages/Notes from recruiter
- Actions: Withdraw, Update Availability

### 19. Interviews (/candidate/interviews)
File: interviews/page.tsx

Layout:
- Upcoming interviews list
- Interview cards:
  - Company, Position
  - Date, Time, Type
  - Location/Meeting link
  - Interviewer names
- Calendar view option
- Past interviews with feedback (if shared)

### 20. Interview Detail (/candidate/interviews/[id])
File: interviews/[id]/page.tsx

Layout:
- Interview info: Date, Time, Type, Duration
- Company and position
- Interviewers (with LinkedIn if provided)
- Meeting link or location
- Preparation tips
- Company research links
- Add to calendar button

### 21. Offers (/candidate/offers)
File: offers/page.tsx

Layout:
- Pending offers
- Offer cards:
  - Position, Company
  - Compensation summary
  - Start date
  - Expiry date
  - Accept/Decline buttons
- Offer history

### 22. Offer Detail (/candidate/offers/[id])
File: offers/[id]/page.tsx

Layout:
- Offer letter view
- Compensation breakdown
- Benefits summary
- Terms and conditions
- Accept/Decline actions
- Negotiate button (if enabled)
- Expiry countdown

### 23. Saved Jobs (/candidate/saved)
File: saved/page.tsx

Layout:
- Saved jobs list
- Quick apply option
- Remove from saved
- Sort by date saved

### 24. Settings (/candidate/settings)
File: settings/page.tsx

Layout:
- Notification preferences
- Privacy settings (profile visibility)
- Password change
- Account deletion

## Screen Metadata:
Create metadata in:
- src/lib/metadata/screens/client-portal/
- src/lib/metadata/screens/candidate-portal/

## Requirements:
- Clean, professional design for external users
- Mobile-first (candidates often use phones)
- Fast loading (minimal JS)
- Accessibility compliant
- Clear call-to-actions
- Progress indicators
- Email notification integration points

## Authentication:
- Separate auth flow for portals
- Magic link option for candidates
- SSO for client users (if configured)

## After Screens:
- Add routes to portal navigation
- Export screen metadata
