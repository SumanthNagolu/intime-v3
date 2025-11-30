# Use Case: View Client Portal Dashboard

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CLI-001 |
| Actor | Client Portal User (Hiring Manager) |
| Goal | View comprehensive dashboard of active jobs, candidates, and placements |
| Frequency | Daily (2-5 times per day) |
| Estimated Time | 2-5 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Client Portal User
2. User has valid client account association
3. User has "portal:access" permission
4. Client organization has active account in InTime

---

## Trigger

One of the following:
- User logs into client portal
- User navigates to dashboard from navigation menu
- User clicks on company logo to return to home
- Session restored after timeout

---

## Main Flow (Click-by-Click)

### Step 1: Portal Login

**User Action:** Navigate to client portal URL or click login link

**System Response:**
- Portal login page loads
- Shows InTime branding + client logo (if white-labeled)
- Email/password fields or SSO button displayed
- "Remember me" checkbox available

**Screen State:**
```
+----------------------------------------------------------+
|                                                           |
|              [InTime Logo]    [Client Logo]               |
|                                                           |
|                   Client Portal Login                     |
|                                                           |
|         Email                                             |
|         [                                              ]  |
|                                                           |
|         Password                                          |
|         [                                              ]  |
|                                                           |
|         □ Remember me for 30 days                         |
|                                                           |
|         [        Login with SSO        ]                  |
|         [        Login with Email      ]                  |
|                                                           |
|         Forgot password? | Need help?                     |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~10 seconds

---

### Step 2: SSO Authentication (If Enabled)

**User Action:** Click "Login with SSO" button

**System Response:**
- Redirect to client's Identity Provider (Azure AD/Okta/etc.)
- User authenticates via SSO
- SAML assertion returned to InTime
- Session created with client context

**Alternative:** Email login - enter email/password, click "Login"

**Time:** ~5-15 seconds (depending on SSO provider)

---

### Step 3: Dashboard Loads

**User Action:** Successful authentication completes

**System Response:**
- URL changes to: `/client/dashboard`
- Loading skeleton appears (500-800ms)
- Dashboard widgets populate with data
- Welcome message shows: "Welcome back, {FirstName}"
- Last login timestamp displayed

**Screen State:**
```
+----------------------------------------------------------+
| [Logo] Client Portal     Dashboard  Jobs  Candidates  ⚙ ☰|
+----------------------------------------------------------+
| Welcome back, Sarah Thompson                    📅 Nov 30 |
| Last login: Nov 29, 2025 at 3:45 PM                      |
+----------------------------------------------------------+
|                                                           |
| Quick Stats                                               |
| +----------------+  +----------------+  +----------------+|
| | Active Jobs    |  | Open Positions |  | In Progress    ||
| |      12        |  |       23       |  |       18       ||
| | +2 this week   |  | +5 this week   |  | +3 this week   ||
| +----------------+  +----------------+  +----------------+|
| +----------------+  +----------------+  +----------------+|
| | Filled (30d)   |  | Interviews     |  | Placements     ||
| |      8         |  |    Upcoming 5  |  |    Active 42   ||
| | 85% on time    |  | Pending appr 2 |  | +2 this week   ||
| +----------------+  +----------------+  +----------------+|
|                                                           |
+----------------------------------------------------------+
| Active Jobs Overview              [View All →]  [Filter ▼]|
+----------------------------------------------------------+
| Job Title              Candidates    Interviews  Status   |
| ─────────────────────────────────────────────────────────|
| Senior Software Eng.   12 submitted  2 scheduled  Active  |
|   Posted 5 days ago    3 reviewing   1 pending    🟢      |
|   [View Details] [Review Candidates] [Schedule Interview] |
|                                                           |
| Product Manager        8 submitted   1 scheduled  Active  |
|   Posted 8 days ago    2 reviewing   0 pending    🟢      |
|   [View Details] [Review Candidates] [Schedule Interview] |
|                                                           |
| DevOps Engineer        5 submitted   0 scheduled  Active  |
|   Posted 3 days ago    1 reviewing   2 pending    🟡      |
|   [View Details] [Review Candidates] [Schedule Interview] |
|                                                           |
+----------------------------------------------------------+
| Recent Submissions                     [View All →]       |
+----------------------------------------------------------+
| Candidate          Job               Submitted    Action  |
| ─────────────────────────────────────────────────────────|
| John Martinez      Sr. SW Engineer    2 hours ago  [Review]|
| ★★★★★ React, Node.js, AWS            Recruiter: Amy Chen |
|                                                           |
| Lisa Wang          Product Manager    5 hours ago  [Review]|
| ★★★★☆ Agile, Product Strategy        Recruiter: Mike Ross|
|                                                           |
| Robert Johnson     DevOps Engineer    1 day ago    [Review]|
| ★★★☆☆ Docker, K8s, Jenkins           Recruiter: Amy Chen |
|                                                           |
+----------------------------------------------------------+
| Upcoming Interviews                    [View All →]       |
+----------------------------------------------------------+
| Candidate          Job               Date/Time     Status |
| ─────────────────────────────────────────────────────────|
| Sarah Miller       Sr. SW Engineer    Dec 1, 2:00 PM ✓ Conf|
|   Technical Round                     Your timezone       |
|   [Join Video Call] [Reschedule] [View Candidate]         |
|                                                           |
| Alex Thompson      Product Manager    Dec 1, 4:00 PM 🔔 Pend|
|   First Round                         Your timezone       |
|   [Confirm] [Propose New Time] [View Candidate]           |
|                                                           |
| David Lee          Sr. SW Engineer    Dec 2, 10:00 AM ✓ Conf|
|   Final Round                         Your timezone       |
|   [Join Video Call] [View Candidate] [Feedback Form]      |
|                                                           |
+----------------------------------------------------------+
| Active Placements                      [View All →]       |
+----------------------------------------------------------+
| Consultant         Role              Started      Action  |
| ─────────────────────────────────────────────────────────|
| Michael Chang      Sr. Developer      Oct 1, 2025  [Manage]|
|   Performance: ★★★★★                  Week 8 of 26        |
|   [Timesheet 4 hrs pending] [Approve] [Request Extension] |
|                                                           |
| Jennifer Garcia    DevOps Lead        Sep 15, 2025 [Manage]|
|   Performance: ★★★★☆                  Week 11 of 26       |
|   [View Details] [Submit Feedback] [Schedule Review]      |
|                                                           |
| Chris Anderson     QA Engineer        Nov 15, 2025 [Manage]|
|   Performance: ★★★★★                  Week 2 of 12        |
|   [View Details] [Approve Timesheet] [Provide Feedback]   |
|                                                           |
+----------------------------------------------------------+
| Pending Actions                        [View All →]       |
+----------------------------------------------------------+
| Type              Description                      Action |
| ─────────────────────────────────────────────────────────|
| 🟡 Timesheet      Michael Chang - Week ending Dec 1 [Approve]|
|                   40.0 hours                              |
|                                                           |
| 🔴 Interview      Alex Thompson - Confirm or propose [Act Now]|
|                   Pending since 2 days ago                |
|                                                           |
| 🟡 Candidate      3 new candidates need review      [Review]|
|                   For: Senior Software Engineer           |
|                                                           |
| 🟢 Job Approval   New job request from Tech team    [Approve]|
|                   Senior Data Scientist - $150-180/hr     |
|                                                           |
+----------------------------------------------------------+
| Performance Metrics (Last 30 Days)     [View Report →]    |
+----------------------------------------------------------+
| Avg. Time to Fill: 18.5 days     (↓ 2.3 days from prev)  |
| Candidate Quality: 4.2/5.0       (↑ 0.3 from prev)        |
| Interview Show Rate: 92%         (↑ 4% from prev)         |
| Placement Success: 85%           (↔ same as prev)         |
|                                                           |
| [View Detailed Analytics] [Download Report] [Share]       |
+----------------------------------------------------------+
| Recent Activity Feed               [View All →] [Filter ▼]|
+----------------------------------------------------------+
| 2 hours ago                                               |
| 📄 New candidate submitted: John Martinez                 |
|    For job: Senior Software Engineer                     |
|    By recruiter: Amy Chen                                 |
|                                                           |
| 5 hours ago                                               |
| 📅 Interview scheduled: Sarah Miller                      |
|    Dec 1, 2025 at 2:00 PM                                 |
|    Type: Technical Round                                  |
|                                                           |
| 1 day ago                                                 |
| ✅ Placement approved: Chris Anderson                     |
|    Role: QA Engineer                                      |
|    Start date: Nov 15, 2025                               |
|                                                           |
| 2 days ago                                                |
| 📝 Feedback received: Interview with Sarah Miller         |
|    Rating: 4.5/5 - Recommended for next round             |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1-2 seconds

---

### Step 4: Review Quick Stats

**User Action:** View quick stats cards at top of dashboard

**System Response:**
- Cards display real-time data
- Green/red indicators show trend (up/down arrows)
- Clickable cards navigate to detail views

**Quick Stats Widgets:**

| Widget | Data | Calculation |
|--------|------|-------------|
| **Active Jobs** | Count of open job requisitions | `COUNT(jobs WHERE status='active' AND client_id=current_client)` |
| **Open Positions** | Total unfilled positions across all jobs | `SUM(positions_count - filled_count WHERE status='active')` |
| **In Progress** | Candidates in active review/interview | `COUNT(candidates WHERE status IN ('submitted','interviewing'))` |
| **Filled (30d)** | Positions filled in last 30 days | `COUNT(placements WHERE created_at > NOW() - 30 days)` |
| **Interviews** | Upcoming/pending interviews | Upcoming: scheduled future; Pending: awaiting confirmation |
| **Placements** | Active consultants/employees | `COUNT(placements WHERE status='active')` |

**Time:** ~10-15 seconds

---

### Step 5: Review Active Jobs

**User Action:** Scroll to "Active Jobs Overview" section

**System Response:**
- List shows up to 3 most recent active jobs
- Each job shows:
  - Job title
  - Days since posted
  - Candidate counts (submitted, reviewing)
  - Interview counts (scheduled, pending)
  - Status indicator (green = active, yellow = slow)
- Action buttons: View Details, Review Candidates, Schedule Interview

**Job Card Specification:**

| Field | Description | Source |
|-------|-------------|--------|
| Job Title | Position name | `jobs.title` |
| Posted Date | Time since job created | `jobs.created_at` (relative: "5 days ago") |
| Candidates Submitted | Total candidates submitted | `COUNT(submissions WHERE job_id=X)` |
| Candidates Reviewing | Awaiting client review | `COUNT(submissions WHERE status='submitted')` |
| Interviews Scheduled | Confirmed interviews | `COUNT(interviews WHERE status='confirmed')` |
| Interviews Pending | Awaiting confirmation | `COUNT(interviews WHERE status='pending')` |
| Status | Job health indicator | Based on time-to-fill, candidate flow |

**Time:** ~15-20 seconds

---

### Step 6: Review Recent Submissions

**User Action:** Scroll to "Recent Submissions" section

**System Response:**
- Shows 3 most recent candidate submissions
- Each submission shows:
  - Candidate name
  - Star rating (recruiter pre-screen rating)
  - Key skills/highlights
  - Job applied for
  - Time submitted
  - Recruiter name
  - [Review] action button

**Submission Card Specification:**

| Field | Description | Source |
|-------|-------------|--------|
| Candidate Name | Full name | `candidates.first_name + last_name` |
| Star Rating | Recruiter rating (1-5) | `submissions.recruiter_rating` |
| Skills | Top 3-4 skills | `candidates.skills` (first 4) |
| Job Title | Position applied for | `jobs.title` |
| Submitted Time | Relative time | `submissions.created_at` |
| Recruiter | Submitting recruiter | `users.first_name + last_name` |

**Interaction:**

**User Action:** Click [Review] button on John Martinez

**System Response:**
- Modal slides in from right
- Shows full candidate profile
- Resume viewer
- Skills match matrix
- [Accept] [Reject] [Request Interview] buttons

**Time:** ~20-30 seconds

---

### Step 7: Check Upcoming Interviews

**User Action:** Scroll to "Upcoming Interviews" section

**System Response:**
- Shows next 3 scheduled interviews (chronologically)
- Each interview shows:
  - Candidate name
  - Job position
  - Interview type/round
  - Date/time (in user's timezone)
  - Status: Confirmed (✓) or Pending (🔔)
  - Action buttons based on status

**Interview Card Specification:**

| Field | Description | Source |
|-------|-------------|--------|
| Candidate Name | Full name | `candidates.first_name + last_name` |
| Job Title | Position | `jobs.title` |
| Interview Type | Round/stage | `interviews.type` ("Technical Round", "Final", etc.) |
| Date/Time | Localized datetime | `interviews.scheduled_at` (converted to user timezone) |
| Status | Confirmation status | `interviews.status` |
| Timezone | User's timezone | `user_preferences.timezone` |

**Status-Based Actions:**

| Status | Available Actions |
|--------|-------------------|
| ✓ Confirmed | [Join Video Call] [Reschedule] [View Candidate] |
| 🔔 Pending | [Confirm] [Propose New Time] [View Candidate] |
| ⏰ In Progress | [Join Video Call] [View Candidate] |
| ✅ Completed | [Submit Feedback] [View Candidate] |

**Interaction:**

**User Action:** Click [Join Video Call] for Sarah Miller interview

**System Response:**
- If before interview time: Shows countdown "Interview starts in X hours"
- If within 15 min window: Opens video link in new tab (Zoom/Teams/Google Meet)
- If after interview: Shows [Submit Feedback] instead

**Time:** ~15-20 seconds

---

### Step 8: Review Active Placements

**User Action:** Scroll to "Active Placements" section

**System Response:**
- Shows 3 most recent active placements
- Each placement shows:
  - Consultant name
  - Performance rating (star rating)
  - Role/position
  - Start date
  - Progress indicator (Week X of Y)
  - Pending actions (timesheets, reviews)

**Placement Card Specification:**

| Field | Description | Source |
|-------|-------------|--------|
| Consultant Name | Full name | `candidates.first_name + last_name` |
| Performance Rating | Client rating (1-5) | `placements.performance_rating` (avg of feedback) |
| Role | Position title | `jobs.title` or `placements.position_title` |
| Start Date | Placement start | `placements.start_date` |
| Duration | Weeks elapsed/total | Calculated from start_date and contract_length |
| Pending Actions | Alerts | Timesheets pending, reviews due, etc. |

**Interaction:**

**User Action:** Click [Approve] on Michael Chang timesheet

**System Response:**
- Timesheet modal opens
- Shows hours breakdown by day
- Shows total: 40.0 hours
- [Approve] [Request Changes] [Reject] buttons

**Time:** ~20-30 seconds

---

### Step 9: Review Pending Actions

**User Action:** Scroll to "Pending Actions" section

**System Response:**
- Shows items requiring user attention
- Sorted by priority: Red (urgent) → Yellow (important) → Green (low)
- Each action shows:
  - Priority indicator
  - Type icon
  - Description
  - Time pending
  - Quick action button

**Pending Action Types:**

| Type | Icon | Priority | Description |
|------|------|----------|-------------|
| Timesheet Approval | 🟡 | Medium | Consultant submitted timesheet |
| Interview Confirmation | 🔴 | High | Pending > 24 hours |
| Candidate Review | 🟡 | Medium | New submissions awaiting review |
| Job Approval | 🟢 | Low | Internal job request needs approval |
| Placement Extension | 🟡 | Medium | Contract ending soon |
| Feedback Required | 🟡 | Medium | Interview completed, no feedback |

**Interaction:**

**User Action:** Click [Act Now] on Interview Confirmation

**System Response:**
- Calendar modal opens
- Shows proposed time: Dec 1, 4:00 PM
- Shows candidate availability windows
- [Confirm This Time] or [Propose New Time] buttons

**Time:** ~10-15 seconds

---

### Step 10: Review Performance Metrics

**User Action:** Scroll to "Performance Metrics (Last 30 Days)" section

**System Response:**
- Shows 4 key metrics with trend indicators
- Green ↑ = improved, Red ↓ = declined, Gray ↔ = same
- Each metric clickable for detailed view

**Metric Definitions:**

| Metric | Formula | Industry Benchmark |
|--------|---------|-------------------|
| **Avg. Time to Fill** | Median days from job posted to placement accepted | 18-25 days |
| **Candidate Quality** | Average client rating of submitted candidates (1-5 scale) | 3.8-4.2 |
| **Interview Show Rate** | % of scheduled interviews where candidate attended | 85-90% |
| **Placement Success** | % of placements completing contract successfully | 80-90% |

**Interaction:**

**User Action:** Click "View Detailed Analytics"

**System Response:**
- Navigates to `/client/analytics`
- Shows comprehensive reports dashboard
- Charts, graphs, trends over time
- Exportable reports (PDF, Excel)

**Time:** ~10-15 seconds

---

### Step 11: Review Activity Feed

**User Action:** Scroll to "Recent Activity Feed" section

**System Response:**
- Shows last 10 activities in reverse chronological order
- Real-time updates (new activities slide in)
- Each activity shows:
  - Icon representing type
  - Timestamp (relative: "2 hours ago")
  - Description
  - Related entity (job, candidate, etc.)

**Activity Types:**

| Icon | Event | Description |
|------|-------|-------------|
| 📄 | Candidate Submitted | New candidate submitted for review |
| 📅 | Interview Scheduled | Interview confirmed |
| ✅ | Placement Approved | New placement started |
| 📝 | Feedback Received | Interview feedback submitted |
| 🔔 | Action Required | Timesheet, approval, etc. |
| 💬 | Message Received | Recruiter sent message |
| 📊 | Status Changed | Job or candidate status updated |
| 🎯 | Job Created | New job requisition opened |

**Interaction:**

**User Action:** Click on activity "New candidate submitted: John Martinez"

**System Response:**
- Navigates to candidate review page
- Shows full candidate profile
- Ready for review/feedback

**Time:** ~10-15 seconds

---

### Step 12: Access Navigation Menu

**User Action:** Click hamburger menu (☰) in top-right

**System Response:**
- Side menu slides in from right
- Shows full navigation options

**Navigation Menu:**
```
+----------------------------------+
| [X] Close                         |
+----------------------------------+
| Dashboard                    [🏠] |
| Jobs                         [💼] |
|   - Active Jobs                   |
|   - Job Requests                  |
|   - Filled Positions              |
| Candidates                   [👤] |
|   - Recent Submissions            |
|   - In Review                     |
|   - Interviewing                  |
| Interviews                   [📅] |
|   - Upcoming                      |
|   - Past Interviews               |
|   - Feedback                      |
| Placements                   [✅] |
|   - Active Placements             |
|   - Timesheets                    |
|   - Performance Reviews           |
| Analytics                    [📊] |
|   - Hiring Metrics                |
|   - Spend Reports                 |
|   - Custom Reports                |
+----------------------------------+
| Settings                     [⚙]  |
| Help & Support               [?]  |
| Logout                       [⎋]  |
+----------------------------------+
```

**Time:** ~5 seconds

---

### Step 13: Use Quick Actions (Optional)

**User Action:** Press `Cmd+K` (or Ctrl+K on Windows) to open command palette

**System Response:**
- Command palette modal opens (center of screen)
- Shows search input
- Recent actions listed
- Type to search all available actions

**Command Palette:**
```
+----------------------------------------------------------+
| Quick Actions                                         [×] |
+----------------------------------------------------------+
| [Type to search...]                                       |
+----------------------------------------------------------+
| Recent                                                    |
|   Review candidate: John Martinez                        |
|   Approve timesheet: Michael Chang                       |
|   Schedule interview: Alex Thompson                      |
+----------------------------------------------------------+
| Suggested                                                 |
|   Create new job request                                 |
|   View all candidates                                    |
|   Generate monthly report                                |
|   Contact account manager                                |
+----------------------------------------------------------+
```

**Available Commands:**

| Command | Action |
|---------|--------|
| "Review candidates" | Navigate to candidates page |
| "Schedule interview [name]" | Open interview scheduler |
| "Approve timesheet [name]" | Open timesheet approval |
| "Create job" | Open new job request form |
| "View analytics" | Navigate to analytics page |
| "Contact support" | Open support chat |

**Time:** ~10-20 seconds

---

## Postconditions

1. ✅ User has reviewed current state of hiring pipeline
2. ✅ User aware of pending actions requiring attention
3. ✅ User has visibility into upcoming interviews
4. ✅ User can monitor active placements
5. ✅ Dashboard activity logged for analytics
6. ✅ User session refreshed (timeout extended)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `portal.dashboard.viewed` | `{ user_id, client_id, timestamp, duration }` |
| `portal.action.clicked` | `{ user_id, action_type, entity_id, timestamp }` |
| `portal.navigation.used` | `{ user_id, from_page, to_page, timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Dashboard Load Failed | API timeout | "Unable to load dashboard. Please refresh." | [Refresh] button shown |
| Session Expired | Token expired | "Your session has expired. Please log in again." | Redirect to login |
| Data Not Available | Client account inactive | "Account access restricted. Contact support." | Show support contact |
| Network Error | Connection lost | "Connection lost. Retrying..." | Auto-retry 3 times |
| Permission Denied | Insufficient permissions | "You don't have access to this section." | Hide unauthorized sections |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `Cmd/Ctrl+/` | Toggle navigation menu |
| `Cmd/Ctrl+R` | Refresh dashboard |
| `Esc` | Close open modals |
| `?` | Show keyboard shortcuts help |

---

## Alternative Flows

### A1: First-Time User Onboarding

If user logging in for first time:

1. Welcome modal appears after login
2. Shows 5-step product tour
3. Highlights key dashboard sections
4. "Take Tour" or "Skip" options
5. User can restart tour from Help menu

### A2: Mobile/Tablet View

If user accessing from mobile device:

1. Dashboard adapts to responsive layout
2. Widgets stack vertically
3. Cards show condensed view
4. Hamburger menu always visible
5. Swipe gestures enabled

### A3: Notification Alerts

If critical actions pending:

1. Red badge appears on navigation icon
2. Browser notification (if enabled): "You have 3 pending timesheets"
3. Email digest sent daily (if enabled)
4. In-app toast for urgent items

---

## Widget Customization (Enterprise Feature)

**User Action:** Click [⚙] icon next to section header

**System Response:**
- Edit mode enabled
- Drag handles appear on widgets
- [Add Widget] [Remove] [Resize] options

**Available Widgets:**
- Active Jobs
- Recent Submissions
- Upcoming Interviews
- Active Placements
- Pending Actions
- Performance Metrics
- Activity Feed
- Spend Summary (Enterprise)
- Team Activity (Multi-user)
- Custom Charts

**Customization Options:**
- Reorder widgets (drag & drop)
- Resize widgets (S, M, L)
- Hide/show widgets
- Set default filters
- Save layouts per user

---

## Real-Time Updates

**WebSocket Events:**

Dashboard listens for real-time events:

| Event | Update Behavior |
|-------|-----------------|
| `candidate.submitted` | New card slides into "Recent Submissions" |
| `interview.confirmed` | Update status in "Upcoming Interviews" |
| `timesheet.submitted` | Badge appears in "Pending Actions" |
| `placement.started` | New card in "Active Placements" |
| `job.filled` | Update count in "Quick Stats" |

**Visual Feedback:**
- New items highlighted with green background (fades after 3s)
- Updated counts pulse briefly
- Toast notification for high-priority events

---

## Performance Considerations

**Load Time Targets:**

| Metric | Target | Implementation |
|--------|--------|----------------|
| Initial Page Load | < 2 seconds | Server-side rendering (SSR) |
| Widget Load | < 500ms each | Parallel API calls |
| Real-time Update | < 100ms | WebSocket push |
| Navigation | < 200ms | Client-side routing |

**Caching Strategy:**

- Quick stats: Cache 30 seconds
- Active jobs: Cache 1 minute
- Submissions: Real-time (no cache)
- Placements: Cache 5 minutes
- Metrics: Cache 15 minutes

**Data Pagination:**

- Jobs: Show 3, load more on demand
- Submissions: Show 3, load more on demand
- Interviews: Show 3, load more on demand
- Placements: Show 3, load more on demand
- Activity Feed: Show 10, infinite scroll

---

## Related Use Cases

- [02-review-candidates.md](./02-review-candidates.md) - Review submitted candidates
- [03-schedule-interview.md](./03-schedule-interview.md) - Schedule/manage interviews
- [04-manage-placements.md](./04-manage-placements.md) - Manage active placements
- [05-create-job-request.md](./05-create-job-request.md) - Create new job requisition

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Login and view dashboard | Dashboard loads with correct data |
| TC-002 | View with no active jobs | Shows "No active jobs" empty state |
| TC-003 | View with pending actions | Red badges shown, count accurate |
| TC-004 | Click quick action button | Navigate to correct page |
| TC-005 | Real-time update received | New item appears without refresh |
| TC-006 | Session timeout during view | Re-login modal appears |
| TC-007 | Mobile responsive view | Layout adapts correctly |
| TC-008 | Command palette search | Results filter correctly |
| TC-009 | Widget customization save | Layout persists on reload |
| TC-010 | Export metrics report | PDF downloads correctly |

---

*Last Updated: 2025-11-30*
