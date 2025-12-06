# Recruiter Daily Workflow

This document describes a typical day for a Recruiter, with specific times, actions, and expected system interactions.

---

## Morning Routine (8:00 AM - 10:00 AM)

### 8:00 AM - Login & Dashboard Review

**Step 1: Login**
- User navigates to: `https://app.intime.com/auth/employee`
- User enters email and password
- User clicks "Sign In"
- System redirects to: `/employee/workspace` (Today View)
- Time: ~10 seconds

**Step 2: Review Today View**
- Dashboard loads with personalized widgets
- User sees:
  - **Today's Tasks** - Tasks due today, sorted by priority
  - **Sprint Progress** - Placement goal progress (e.g., "1/2 placements")
  - **Watchlist** - Updates on consulted/informed items
  - **Recent Activity** - Last 5 activities logged
- Time: ~30 seconds to scan

**Step 3: Check Urgent Items**
- User looks at red badges indicating:
  - Overdue tasks (red dot)
  - Pending client responses > 48 hours
  - Interviews scheduled today
- User clicks on first urgent item
- Time: ~1 minute

### 8:15 AM - Email & Message Review

**Step 4: Check Notifications**
- User clicks bell icon (🔔) in header
- Dropdown shows unread notifications:
  - Client responded to submission
  - Interview confirmed
  - Candidate availability changed
- User clicks each notification to navigate to relevant entity
- Time: ~5 minutes

**Step 5: Update Submission Statuses**
- From notification, user lands on Submission Detail
- User updates status based on client feedback:
  - Click status dropdown
  - Select new status (e.g., "Interview Scheduled")
  - Add note explaining update
  - Click "Save"
- Repeat for each client response
- Time: ~2 minutes per update

### 8:30 AM - Priority Setting

**Step 6: Review Job Pipeline**
- User clicks "Jobs" in sidebar
- Jobs list shows all assigned jobs
- User clicks "Priority" column to sort by urgency
- User identifies top 3 priority jobs for the day
- Time: ~2 minutes

**Step 7: Create Today's Task List**
- For each priority job:
  - User opens job detail
  - User clicks "+ Add Task"
  - Types task: "Source 5 candidates"
  - Sets due date: Today
  - Sets priority: High
  - Clicks "Save"
- Time: ~1 minute per task

---

## Mid-Morning (10:00 AM - 12:00 PM)

### 10:00 AM - Candidate Sourcing

**Step 8: Open Priority Job**
- User clicks on top priority job from sidebar "Pinned" section
- Job detail opens in split pane
- User reviews job requirements:
  - Required skills
  - Experience level
  - Location requirements
  - Rate range
- Time: ~2 minutes

**Step 9: Search for Matching Candidates**
- User opens Command Bar (`Cmd+K`)
- Types: "candidates with React Node remote"
- System shows matching candidates
- User clicks first result
- Candidate detail opens
- Time: ~30 seconds per search

**Step 10: Review Candidate Profile**
- User reviews candidate:
  - Skills match
  - Experience years
  - Current status (available/placed/bench)
  - Rate expectations
  - Work authorization
- Time: ~2 minutes per candidate

**Step 11: Add Candidate to Pipeline**
- If candidate is a match:
  - User clicks "Submit to Job" button
  - Modal opens with job already selected
  - User confirms and clicks "Add to Pipeline"
  - Candidate added to "Sourced" stage
- Time: ~30 seconds

**Repeat Steps 9-11 for 5-10 candidates**

### 11:00 AM - Screening Calls

**Step 12: Schedule Screening Call**
- User goes to Candidate Detail
- Clicks "Log Activity" → "Schedule Call"
- Enters:
  - Type: Screening Call
  - Date/Time: Now + 30 minutes
  - Duration: 30 minutes
  - Notes: "Initial screening for Senior Dev role"
- Clicks "Schedule"
- System creates calendar event
- Time: ~1 minute

**Step 13: Conduct Screening Call**
- User clicks phone icon to initiate call (or uses external phone)
- During call, user has candidate profile open
- User takes notes in real-time (text field always visible)
- Topics to cover:
  - Availability
  - Rate expectations
  - Technical skills verification
  - Interest level
  - Red flags
- Time: 15-30 minutes per call

**Step 14: Log Call Activity**
- After call ends:
  - User clicks "Complete Activity"
  - Modal opens with call summary
  - User enters:
    - Duration: Actual minutes
    - Outcome: Positive/Neutral/Negative
    - Notes: Summary of discussion
    - Follow-up required: Yes/No
  - Clicks "Save"
- Activity logged to candidate timeline
- Time: ~2 minutes

**Repeat Steps 12-14 for 3-5 candidates**

---

## Afternoon (12:00 PM - 3:00 PM)

### 12:00 PM - Candidate Submission Prep

**Step 15: Open Submission Queue**
- User goes to Jobs list
- Opens top priority job
- Clicks "Pipeline" tab
- Views candidates in "Sourced" and "Screening" stages
- Time: ~1 minute

**Step 16: Prepare Submission**
- User clicks on qualified candidate card
- Candidate detail slides in from right
- User clicks "Submit to Client" button
- Submission modal opens
- Time: ~30 seconds

**Step 17: Complete Submission Form**
See [F01-submit-candidate.md](./F01-submit-candidate.md) for field-by-field detail.

Brief summary:
- Select resume version
- Enter submission rate
- Write submission notes (candidate highlights)
- Upload any additional documents
- Click "Submit"
- Time: ~5-10 minutes per submission

### 1:00 PM - Interview Scheduling

**Step 18: Check Pending Interview Requests**
- User navigates to Submissions list
- Filters by status: "Client Accepted"
- Reviews submissions awaiting interview scheduling
- Time: ~2 minutes

**Step 19: Schedule Interview**
See [F03-schedule-interview.md](./F03-schedule-interview.md) for field-by-field detail.

Brief summary:
- Contact client for available times
- Contact candidate for availability
- Enter interview details
- Send calendar invites
- Time: ~10-15 minutes per interview

### 2:00 PM - Interview Prep

**Step 20: Prepare Candidate for Interview**
- User opens submission with upcoming interview
- Reviews:
  - Interview details (time, format, interviewers)
  - Job requirements
  - Client company info
- User calls candidate:
  - Discuss interview format
  - Review potential questions
  - Confirm logistics
- Log prep call activity
- Time: ~20-30 minutes per candidate

---

## Late Afternoon (3:00 PM - 5:00 PM)

### 3:00 PM - Follow-ups

**Step 21: Client Follow-ups**
- User filters Submissions by "Submitted to Client" > 48 hours ago
- For each stale submission:
  - Open submission detail
  - Review last activity
  - Call or email client for status
  - Log follow-up activity
  - Update status if response received
- Time: ~5 minutes per follow-up

### 3:30 PM - Candidate Follow-ups

**Step 22: Post-Interview Follow-up**
- User filters Submissions by "Interview Completed" today
- For each:
  - Call candidate for interview feedback
  - Document candidate's perspective
  - Note any concerns or next steps
  - Update submission with feedback
- Time: ~10 minutes per candidate

### 4:00 PM - Pipeline Review

**Step 23: Update Job Statuses**
- User opens each priority job
- Reviews pipeline health:
  - Total candidates in pipeline
  - Stage distribution
  - Stale candidates (no activity > 3 days)
- Updates job notes with end-of-day status
- Time: ~5 minutes per job

### 4:30 PM - Cross-Pollination Check

**Step 24: Log Cross-Pillar Opportunities**
- During day, recruiter may discover:
  - Client needs training → Create Lead for Academy
  - Client expanding → Create Lead for TA
  - Candidate relocating → Note for Cross-Border
- User clicks "Log Opportunity" (global button)
- Enters lead details
- Assigns to appropriate department
- User becomes "Consulted" on that lead
- Time: ~3 minutes per lead

### 4:45 PM - Plan Tomorrow

**Step 25: Review and Plan**
- User opens Today View
- Checks what's due tomorrow
- Creates any new tasks for tomorrow
- Reviews sprint progress
- Notes blockers for manager (if any)
- Time: ~10 minutes

### 5:00 PM - End of Day

**Step 26: Logout**
- User clicks profile menu
- Clicks "Sign Out"
- Session ends
- Redirect to login page

---

## Daily Activity Summary

By end of day, a typical recruiter should have logged:

| Activity Type | Target Count |
|---------------|--------------|
| Screening Calls | 5-8 |
| Submissions Created | 2-3 |
| Follow-up Calls | 5-10 |
| Emails Logged | 10-20 |
| Tasks Completed | 5-10 |
| Status Updates | 10-15 |

---

## Weekly Patterns

| Day | Focus |
|-----|-------|
| Monday | Priority setting, sourcing, pipeline review |
| Tuesday | Heavy sourcing, submissions |
| Wednesday | Interview scheduling, client calls |
| Thursday | Follow-ups, interview prep |
| Friday | Pipeline cleanup, reporting, planning |

---

## Common Blockers & Escalation

| Blocker | Escalation Path |
|---------|-----------------|
| Client not responding | Manager escalates to Account Manager |
| Candidate not responding | Remove from pipeline after 3 attempts |
| Job on hold | Update status, focus on other jobs |
| System issue | Report to Admin |
| Rate mismatch | Discuss with Manager before declining |

---

*Last Updated: 2024-11-30*





