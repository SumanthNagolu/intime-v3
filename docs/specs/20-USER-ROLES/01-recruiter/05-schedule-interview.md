# Use Case: Schedule Interview

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-004 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Schedule interview between candidate and client hiring team |
| Frequency | 3-5 times per week |
| Estimated Time | 10-15 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "submission.update" permission (default for Recruiter role)
3. Submission exists with status 'client_interview' or 'interviewing'
4. Client has accepted candidate for interview (explicitly or implicitly)
5. Candidate is available and ready for interview

---

## Trigger

One of the following:
- Client responds "Yes, let's schedule an interview" to submission
- Client contact calls to schedule next interview round
- Submission status updated to 'client_interview' by Account Manager
- Recruiter receives go-ahead after client review

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Submission

**User Action:** Click "Submissions" in sidebar, then click on specific submission

**System Response:**
- Sidebar highlights "Submissions"
- URL changes to: `/employee/workspace/submissions`
- Submissions list loads with filters
- User clicks submission for "Sarah Chen - Senior Engineer at Google"
- URL changes to: `/employee/workspace/submissions/{submission-id}`
- Submission detail page loads

**Screen State:**
```
+----------------------------------------------------------+
| Submissions > Sarah Chen - Senior Engineer at Google      |
+----------------------------------------------------------+
| [← Back to List]                      [Actions ▼]  [•••]  |
+----------------------------------------------------------+
| Status: Client Interview  |  Round: 0  |  Updated: 2h ago |
+----------------------------------------------------------+
| CANDIDATE              JOB                    CLIENT       |
| Sarah Chen             Senior Software       Google        |
| sarah@email.com        Engineer              Technology    |
| H1B                    $95-110/hr            Active        |
+----------------------------------------------------------+
| [View Candidate Profile]  [View Job Details]              |
+----------------------------------------------------------+
| TIMELINE                                                   |
| ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| ✓ Submitted to Client        2 days ago                   |
| ✓ Client Reviewed            1 day ago                    |
| → Schedule Interview         Now                          |
| ○ Interview Round 1          Pending                      |
+----------------------------------------------------------+
| ACTIONS                                                    |
| [📅 Schedule Interview]  [📝 Add Note]  [📎 Attach File] |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 2: Click "Schedule Interview" Button

**User Action:** Click "📅 Schedule Interview" button

**System Response:**
- Button shows active state
- Modal slides in from right (300ms animation)
- Modal title: "Schedule Interview - Sarah Chen"
- First field (Interview Type) is focused
- System pre-populates: Round Number = 1 (if no previous interviews)

**Screen State:**
```
+----------------------------------------------------------+
|                          Schedule Interview - Sarah Chen  |
|                                                      [×]  |
+----------------------------------------------------------+
| Submission: Senior Software Engineer at Google            |
| Candidate: Sarah Chen (sarah@email.com)                   |
+----------------------------------------------------------+
| Step 1 of 3: Interview Details                            |
|                                                           |
| Interview Type *                                          |
| [Phone Screen                                      ▼]     |
|                                                           |
| Interview Round *                                         |
| ○ Round 1   ○ Round 2   ○ Round 3   ○ Round 4+           |
|                                                           |
| If Round 4+: [  ] (enter number)                         |
|                                                           |
| Duration                                                  |
| [60] minutes    Common: [30] [45] [60] [90] [120]        |
|                                                           |
| Description (Optional)                                    |
| [                                                      ]  |
| [                                               ] 0/500   |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Schedule →]    |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Select Interview Type

**User Action:** Click "Interview Type" dropdown

**System Response:**
- Dropdown opens with interview types
- Each type shows icon and description

**User Action:** Select "Video Call"

**System Response:**
- Dropdown closes
- Field shows: "📹 Video Call"
- Meeting link field becomes required

**Field Specification: Interview Type**
| Property | Value |
|----------|-------|
| Field Name | `interviewType` |
| Type | Dropdown (Select) |
| Label | "Interview Type" |
| Required | Yes |
| Default | "phone_screen" |
| Options | |
| - `phone_screen` | "📞 Phone Screen" - Initial call with candidate |
| - `video_call` | "📹 Video Call" - Remote video interview |
| - `in_person` | "🏢 In-Person" - On-site interview |
| - `panel` | "👥 Panel Interview" - Multiple interviewers |
| - `technical` | "💻 Technical Interview" - Coding/tech assessment |
| - `behavioral` | "💬 Behavioral" - Culture fit, soft skills |
| - `final_round` | "🎯 Final Round" - Decision-making interview |
| Impact | Affects meeting link requirement and email templates |

**Time:** ~3 seconds

---

### Step 4: Select Interview Round

**User Action:** Click "Round 1" radio button

**System Response:**
- Radio button selected
- System checks for previous interviews
- If previous rounds exist, shows summary: "Previous: R1 on 11/25 (Passed)"

**Field Specification: Round Number**
| Property | Value |
|----------|-------|
| Field Name | `roundNumber` |
| Type | Radio Button Group + Number Input |
| Label | "Interview Round" |
| Required | Yes |
| Default | 1 (or auto-detect next round) |
| Options | Round 1, 2, 3, 4+ |
| Validation | Must be sequential (can't schedule Round 3 without Round 2) |
| Auto-detect | System suggests next round based on interview history |
| Error | "Cannot schedule Round 3 before Round 2 is completed" |

**Time:** ~2 seconds

---

### Step 5: Set Duration

**User Action:** Click "60" minutes (default)

**System Response:**
- Duration field shows 60
- Quick select buttons highlight active duration

**Field Specification: Duration**
| Property | Value |
|----------|-------|
| Field Name | `durationMinutes` |
| Type | Number Input with Quick Select |
| Label | "Duration" |
| Suffix | "minutes" |
| Required | Yes |
| Default | 60 |
| Quick Select | 30, 45, 60, 90, 120 minutes |
| Min | 15 |
| Max | 480 (8 hours) |
| Validation | Must be multiple of 15 |

**Time:** ~2 seconds

---

### Step 6: Add Description (Optional)

**User Action:** Type "Technical screening for React and Node.js expertise"

**System Response:**
- Text appears in field
- Character count updates: "53/500"

**Field Specification: Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Textarea |
| Label | "Description (Optional)" |
| Placeholder | "e.g., Technical screening, Culture fit assessment..." |
| Required | No |
| Max Length | 500 characters |
| Purpose | Included in calendar invite and email to participants |

**Time:** ~10 seconds

---

### Step 7: Click "Next" to Scheduling

**User Action:** Click "Next: Schedule →" button

**System Response:**
- Validates Step 1 fields
- Slides to Step 2 (Scheduling)
- System auto-detects user's timezone from browser
- Loads candidate availability if available

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                          Schedule Interview - Sarah Chen  |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 2 of 3: Date & Time                                  |
|                                                           |
| Timezone                                                  |
| [America/New_York (EST, UTC-5)                     ▼]     |
| [🔄 Auto-detect]                                          |
|                                                           |
| Propose Interview Times *                                 |
| Propose 3 time slots for client to choose from            |
|                                                           |
| Option 1 *                                                |
| Date: [12/15/2024 📅]  Time: [10:00 AM ▼]  [🗑]          |
|                                                           |
| Option 2 *                                                |
| Date: [12/15/2024 📅]  Time: [02:00 PM ▼]  [🗑]          |
|                                                           |
| Option 3 *                                                |
| Date: [12/16/2024 📅]  Time: [11:00 AM ▼]  [🗑]          |
|                                                           |
| [+ Add Another Option]                                    |
|                                                           |
| ─────────────────────────────────────────────────────────|
| 📊 CANDIDATE AVAILABILITY (if known)                      |
| Mon-Fri: 9 AM - 5 PM EST                                  |
| Preferred: Mornings                                       |
| Blocked: 12/20-12/25 (Holiday)                           |
+----------------------------------------------------------+
|                [← Back]  [Cancel]  [Next: Participants →]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 8: Select Timezone

**User Action:** Click timezone dropdown

**System Response:**
- Dropdown opens with common timezones
- User's detected timezone is pre-selected
- Search field at top for filtering

**User Action:** Keep "America/New_York (EST, UTC-5)"

**Field Specification: Timezone**
| Property | Value |
|----------|-------|
| Field Name | `timezone` |
| Type | Searchable Dropdown |
| Label | "Timezone" |
| Required | Yes |
| Default | Auto-detected from browser |
| Data Source | IANA timezone database |
| Display Format | `{timezone} ({abbr}, UTC{offset})` |
| Common Timezones | America/New_York, America/Chicago, America/Denver, America/Los_Angeles, America/Phoenix, Europe/London, Asia/Kolkata |
| Search | By city, abbreviation, or offset |
| Auto-detect | Button to re-detect from browser |

**Time:** ~2 seconds

---

### Step 9: Propose First Time Slot

**User Action:** Click date field for Option 1

**System Response:**
- Date picker opens
- Today is highlighted
- Past dates are disabled
- Weekends are visually distinct

**User Action:** Select December 15, 2024

**System Response:**
- Date picker closes
- Date field shows: "12/15/2024"
- Time field becomes active

**User Action:** Click time dropdown, select "10:00 AM"

**System Response:**
- Time shows in selected timezone
- System checks candidate availability (if data available)
- Shows indicator: ✅ Available or ⚠️ Outside preferred hours

**Field Specification: Date/Time Slot**
| Property | Value |
|----------|-------|
| Field Name | `proposedTimes` (array) |
| Type | Date Picker + Time Dropdown |
| Label | "Option 1", "Option 2", "Option 3" |
| Required | At least 3 options |
| Max Options | 5 |
| Date Min | Today |
| Date Max | 90 days from today |
| Time Increment | 15 minutes |
| Business Hours | 8 AM - 6 PM (configurable) |
| Validation | |
| - No duplicates | "This time slot is already proposed" |
| - Min spacing | At least 30 minutes between options |
| - Past time | "Cannot schedule in the past" |
| Availability Check | Compares against candidate's calendar/preferences |

**Time:** ~10 seconds

---

### Step 10: Propose Second Time Slot

**User Action:** Click date field for Option 2

**System Response:**
- Date picker opens with Dec 15 still visible

**User Action:** Select December 15, 2024, Time: 02:00 PM

**System Response:**
- Date and time populate
- Shows: ✅ Available

**Time:** ~8 seconds

---

### Step 11: Propose Third Time Slot

**User Action:** Click date field for Option 3

**User Action:** Select December 16, 2024, Time: 11:00 AM

**System Response:**
- Date and time populate
- Shows: ✅ Available
- All 3 required time slots now filled
- "Next" button becomes enabled

**Time:** ~8 seconds

---

### Step 12: Review Candidate Availability (Info Only)

**User reads the candidate availability panel:**
- Mon-Fri: 9 AM - 5 PM EST
- Preferred: Mornings
- Blocked: 12/20-12/25 (Holiday)

**Notes:**
- This is informational only
- Data comes from candidate profile or prior conversations
- Helps recruiter propose realistic times

**Time:** ~5 seconds

---

### Step 13: Click "Next" to Participants

**User Action:** Click "Next: Participants →" button

**System Response:**
- Validates all time slots are filled
- Slides to Step 3 (Participants & Meeting Details)

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                          Schedule Interview - Sarah Chen  |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 3 of 3: Participants & Meeting Details               |
|                                                           |
| INTERVIEWERS (Client Side) *                              |
|                                                           |
| Interviewer 1                                             |
| Name:  [                                            ]     |
| Email: [                                            ]     |
| Title: [                                            ]     |
| [🗑 Remove]                                               |
|                                                           |
| [+ Add Another Interviewer]                               |
|                                                           |
| ─────────────────────────────────────────────────────────|
| MEETING DETAILS                                           |
|                                                           |
| Meeting Link (for Video/Phone)                            |
| [https://meet.google.com/xyz-abc-def             ]       |
| [🔗 Generate Zoom] [🔗 Generate Meet] [🔗 Generate Teams]|
|                                                           |
| OR                                                        |
|                                                           |
| Meeting Location (for In-Person)                          |
| [                                                      ]  |
| e.g., "Google Office, 1600 Amphitheatre Pkwy, MV, CA"    |
|                                                           |
| ─────────────────────────────────────────────────────────|
| ADDITIONAL NOTES                                          |
| Internal notes (not sent to client)                      |
| [                                                      ]  |
| [                                               ] 0/1000  |
+----------------------------------------------------------+
|                [← Back]  [Cancel]  [Schedule Interview ✓] |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 14: Add First Interviewer

**User Action:** Type interviewer name "Michael Johnson"

**System Response:**
- Name appears in field
- If client contact exists with this name, autocomplete suggests

**User Action:** Type email "michael.johnson@google.com"

**System Response:**
- Email appears
- Validates email format in real-time
- If email exists in contacts, auto-fills Name and Title

**User Action:** Type title "Engineering Manager"

**System Response:**
- Title appears

**Field Specification: Interviewer**
| Property | Value |
|----------|-------|
| Field Name | `interviewerNames`, `interviewerEmails` (arrays) |
| Type | Grouped Text Inputs (repeatable) |
| Label | "Interviewer 1", "Interviewer 2", etc. |
| Required | At least 1 interviewer |
| Max Count | 10 interviewers |
| Fields | |
| - Name | Text, Required, Max 100 chars |
| - Email | Email, Required, Validated |
| - Title | Text, Optional, Max 100 chars |
| Autocomplete | From `contacts` table where `account_id = job.account_id` |
| Validation | |
| - Email format | "Invalid email address" |
| - Duplicate email | "This interviewer is already added" |
| Add/Remove | Dynamic add/remove buttons |

**Time:** ~15 seconds

---

### Step 15: Add Second Interviewer (Optional)

**User Action:** Click "[+ Add Another Interviewer]"

**System Response:**
- New interviewer form appears below
- Shows "Interviewer 2"

**User Action:** Enter "Lisa Wang", "lisa.wang@google.com", "Senior Engineer"

**System Response:**
- Interviewer added to list

**Time:** ~15 seconds

---

### Step 16: Set Meeting Link

**User Action:** Click "🔗 Generate Meet" button

**System Response:**
- System calls Google Meet API (if integrated)
- Generates unique meeting link
- Link appears in field: "https://meet.google.com/xyz-abc-def"
- Alternative: User can manually paste existing link

**Field Specification: Meeting Link**
| Property | Value |
|----------|-------|
| Field Name | `meetingLink` |
| Type | URL Input |
| Label | "Meeting Link (for Video/Phone)" |
| Required | Conditional (required if type = video_call or phone_screen) |
| Validation | Must be valid URL |
| Format | https:// required |
| Quick Generate | Zoom, Google Meet, Microsoft Teams integrations |
| Supported Platforms | Zoom, Google Meet, Teams, WebEx, Any URL |

**Field Specification: Meeting Location**
| Property | Value |
|----------|-------|
| Field Name | `meetingLocation` |
| Type | Text Input |
| Label | "Meeting Location (for In-Person)" |
| Required | Conditional (required if type = in_person) |
| Max Length | 200 characters |
| Placeholder | "e.g., Google Office, 1600 Amphitheatre Pkwy, Mountain View, CA" |
| Autocomplete | Client office addresses if available |

**Time:** ~5 seconds

---

### Step 17: Add Internal Notes (Optional)

**User Action:** Type "First round - focus on React expertise. Client wants to assess problem-solving skills."

**System Response:**
- Text appears
- Character count: "87/1000"

**Field Specification: Internal Notes**
| Property | Value |
|----------|-------|
| Field Name | `internalNotes` |
| Type | Textarea |
| Label | "Internal notes (not sent to client)" |
| Required | No |
| Max Length | 1000 characters |
| Visibility | Internal only - not included in client emails |
| Purpose | Instructions for team, reminders, context |

**Time:** ~20 seconds

---

### Step 18: Review Before Scheduling

**User reviews all information:**
- Interview Type: Video Call
- Round: 1
- Duration: 60 minutes
- Timezone: EST
- Proposed Times: 3 options
- Interviewers: 2 added
- Meeting Link: Generated

**Time:** ~10 seconds

---

### Step 19: Click "Schedule Interview"

**User Action:** Click "Schedule Interview ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. System performs actions:
   - Creates interview record in `interviews` table
   - Sets status = 'proposed' (since client needs to confirm time)
   - Generates calendar invites (.ics files)
   - Sends email to candidate with proposed times
   - Sends email to client interviewers with proposed times
   - Updates submission: `interviewCount++`
   - Logs activity: "interview.scheduled"
   - Creates timeline entry
3. On success:
   - Modal closes (300ms animation)
   - Toast notification: "Interview scheduled successfully! Invitation emails sent." (green)
   - Submission detail page refreshes
   - Timeline updates with new "Interview Scheduled" entry
   - Interview appears in "Upcoming Interviews" section
4. On error:
   - Modal stays open
   - Error toast: "Failed to schedule interview: {error message}"
   - Fields with errors highlighted

**Screen State (After Success):**
```
+----------------------------------------------------------+
| Submissions > Sarah Chen - Senior Engineer at Google      |
+----------------------------------------------------------+
| [← Back to List]                      [Actions ▼]  [•••]  |
+----------------------------------------------------------+
| Status: Interviewing  |  Round: 1  |  Updated: Just now   |
+----------------------------------------------------------+
| 🎉 Interview scheduled! Invitations sent to all parties.  |
+----------------------------------------------------------+
| UPCOMING INTERVIEWS                                        |
| ┌──────────────────────────────────────────────────────┐ |
| │ Round 1: Video Call - Technical Screening            │ |
| │ Status: Proposed (Awaiting confirmation)             │ |
| │ Proposed Times:                                      │ |
| │   • Dec 15, 10:00 AM EST                            │ |
| │   • Dec 15, 02:00 PM EST                            │ |
| │   • Dec 16, 11:00 AM EST                            │ |
| │ Interviewers: Michael Johnson, Lisa Wang             │ |
| │ [Confirm Time] [Reschedule] [Cancel Interview]       │ |
| └──────────────────────────────────────────────────────┘ |
+----------------------------------------------------------+
| TIMELINE                                                   |
| ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| ✓ Submitted to Client        2 days ago                   |
| ✓ Client Reviewed            1 day ago                    |
| ✓ Interview Scheduled        Just now                     |
|   Round 1 - 3 times proposed                              |
| → Awaiting Time Confirmation Pending                      |
+----------------------------------------------------------+
```

**Time:** ~3 seconds

---

## Postconditions

1. ✅ New interview record created in `interviews` table
2. ✅ Interview status set to "proposed" (awaiting confirmation)
3. ✅ Submission `interviewCount` incremented by 1
4. ✅ Submission status updated to "interviewing"
5. ✅ Calendar invites (.ics) generated for all proposed times
6. ✅ Email sent to candidate with all proposed time options
7. ✅ Email sent to each client interviewer with time options
8. ✅ Activity logged: "interview.scheduled"
9. ✅ Timeline entry created showing proposed interview
10. ✅ Recruiter (current user) set as `scheduledBy`
11. ✅ Interview visible in recruiter's "My Interviews" dashboard

---

## Email Templates Sent

### To Candidate

**Subject:** Interview Request - Senior Software Engineer at Google

```
Hi Sarah,

Great news! Google would like to interview you for the Senior Software
Engineer position.

Interview Details:
- Type: Video Call
- Round: 1
- Duration: 60 minutes
- Focus: Technical screening for React and Node.js expertise

Please select ONE of the following times that works best for you:

  □ Friday, December 15, 2024 at 10:00 AM EST
  □ Friday, December 15, 2024 at 02:00 PM EST
  □ Saturday, December 16, 2024 at 11:00 AM EST

Reply to this email with your preferred time, or click below:
[Confirm Your Availability]

Interviewers:
- Michael Johnson, Engineering Manager
- Lisa Wang, Senior Engineer

Meeting Link: https://meet.google.com/xyz-abc-def

Please join the meeting 5 minutes early to test your connection.

Best of luck!

[Recruiter Name]
[Contact Info]
```

### To Client Interviewers

**Subject:** Interview Scheduled - Sarah Chen for Senior Software Engineer

```
Hi Michael,

An interview has been scheduled with Sarah Chen for the Senior Software
Engineer position. Please confirm which of the proposed times works for you.

Candidate: Sarah Chen
Position: Senior Software Engineer
Interview Type: Video Call - Round 1
Duration: 60 minutes

Proposed Times (Please select one):

  □ Friday, December 15, 2024 at 10:00 AM EST
  □ Friday, December 15, 2024 at 02:00 PM EST
  □ Saturday, December 16, 2024 at 11:00 AM EST

Meeting Link: https://meet.google.com/xyz-abc-def

Other Interviewers: Lisa Wang (Senior Engineer)

Candidate Background:
- [Link to resume/profile]

Please reply with your availability by [date].

[Recruiter Name]
[Contact Info]
```

---

## Events Logged

| Event | Payload |
|-------|---------|
| `interview.scheduled` | `{ interview_id, submission_id, candidate_id, job_id, round_number, interview_type, proposed_times, scheduled_by, scheduled_at }` |
| `submission.status_changed` | `{ submission_id, old_status: 'client_interview', new_status: 'interviewing', changed_by }` |
| `activity.created` | `{ entity_type: 'submission', entity_id, activity_type: 'interview_scheduled', details }` |
| `notification.sent` | `{ recipient: candidate_id, type: 'interview_request', interview_id }` |
| `notification.sent` | `{ recipient: interviewer_emails, type: 'interview_scheduled', interview_id }` |

---

## Alternative Flow 1: Confirm Specific Time (After Initial Proposal)

**Trigger:** Client responds with confirmed time slot

### Flow:

1. Recruiter receives email/call: "Dec 15 at 10 AM works for us"
2. Recruiter opens interview from submission detail
3. Clicks "[Confirm Time]" button
4. Modal opens showing 3 proposed times
5. Recruiter selects "Dec 15, 10:00 AM EST"
6. Clicks "Confirm & Send Final Invites"
7. System:
   - Updates interview status: 'proposed' → 'scheduled'
   - Sets `scheduledAt` = confirmed date/time
   - Generates final calendar invites with confirmed time
   - Sends confirmation email to candidate
   - Sends confirmation email to interviewers
   - Adds to all participants' calendars (if integrated)
8. Interview now shows as "Scheduled" with single confirmed time

**Screen After Confirmation:**
```
┌──────────────────────────────────────────────────────┐
│ Round 1: Video Call - Technical Screening            │
│ Status: Scheduled ✅                                  │
│ Confirmed Time: Dec 15, 10:00 AM EST                 │
│ Duration: 60 minutes                                  │
│ Interviewers: Michael Johnson, Lisa Wang             │
│ Meeting Link: https://meet.google.com/xyz-abc-def    │
│ [Reschedule] [Cancel Interview] [Join Meeting]       │
└──────────────────────────────────────────────────────┘
```

---

## Alternative Flow 2: Reschedule Interview

**Trigger:** Candidate or client needs to change time

### Flow:

1. Recruiter clicks "[Reschedule]" from interview card
2. Modal opens with current interview details pre-filled
3. Recruiter sees reason field: "Why reschedule?"
4. Recruiter types: "Candidate has conflict, client requested earlier time"
5. Recruiter proposes 3 new time slots (same UI as initial scheduling)
6. Clicks "Send Rescheduled Invites"
7. System:
   - Updates interview record (keeps same ID)
   - Logs activity: "interview.rescheduled"
   - Status changes to 'proposed' if awaiting confirmation
   - Sends reschedule emails to all parties
   - Cancels old calendar invites
   - Sends new calendar invites with updated times
8. Timeline shows: "Interview Rescheduled - Dec 15, 10 AM → Dec 16, 2 PM"

**Email Template (Reschedule):**
```
Subject: Interview Rescheduled - Sarah Chen

Hi Sarah,

The interview for Senior Software Engineer at Google needs to be
rescheduled due to [reason].

New Proposed Times:
  □ Monday, December 18, 2024 at 09:00 AM EST
  □ Monday, December 18, 2024 at 01:00 PM EST
  □ Tuesday, December 19, 2024 at 11:00 AM EST

Please select your preferred time.

[Same meeting link and details]
```

---

## Alternative Flow 3: Cancel Interview

**Trigger:** Candidate withdraws, client cancels, or position filled

### Flow:

1. Recruiter clicks "[Cancel Interview]"
2. Confirmation dialog appears
3. Recruiter selects cancellation reason from dropdown:
   - Candidate withdrew
   - Client cancelled
   - Position filled
   - Candidate not qualified (after pre-screen)
   - Scheduling conflict (rescheduling instead)
   - Other (with text field)
4. Recruiter types additional notes (optional)
5. Checkbox: "☑ Send cancellation email to all participants"
6. Clicks "Cancel Interview"
7. System:
   - Updates interview status: → 'cancelled'
   - Sets `cancellationReason`
   - Logs activity: "interview.cancelled"
   - Sends cancellation emails (if checked)
   - Sends calendar cancellations
   - Decrements submission `interviewCount` (if desired)
8. Interview moves to "Cancelled Interviews" section
9. Submission status may revert based on workflow

---

## Alternative Flow 4: Capture Interview Feedback (After Completion)

**Trigger:** Interview completed, recruiter receives feedback from client

### Flow:

1. Interview date/time passes
2. System auto-updates status: 'scheduled' → 'completed'
3. Recruiter receives feedback from client via email/call
4. Recruiter opens interview, clicks "[Add Feedback]"
5. Modal opens: "Interview Feedback - Round 1"
6. Fields:
   - **Status:** Dropdown (Attended, No-show, Cancelled)
   - **Rating:** 1-5 stars
   - **Recommendation:** Dropdown (Strong Yes, Yes, Maybe, No, Strong No)
   - **Feedback:** Textarea (detailed notes)
   - **Submitted By:** Auto-filled (current user or select client contact)
   - **Next Steps:** Dropdown (Schedule next round, Extend offer, Reject, On hold)
7. Recruiter fills:
   - Status: Attended
   - Rating: 5 stars
   - Recommendation: Strong Yes
   - Feedback: "Excellent technical skills. Solved coding challenge efficiently. Great culture fit. Recommend moving to Round 2."
   - Next Steps: Schedule next round
8. Clicks "Submit Feedback"
9. System:
   - Updates interview record with feedback
   - Sets `feedbackSubmittedAt` = now
   - Logs activity: "interview.feedback_submitted"
   - If "Schedule next round" selected, prompts to schedule Round 2
   - Updates submission status based on recommendation
10. Feedback visible in timeline and interview history

---

## Alternative Flow 5: Timezone Conversion for Multi-Location Teams

**Scenario:** Candidate in PST, Client in EST, Recruiter in CST

### Enhanced UI:

**When proposing times, show multi-timezone display:**

```
Proposed Times:

Option 1:
  Date: Dec 15, 2024
  Time: 10:00 AM EST

  All Timezones:
  • 10:00 AM EST (Eastern - Client)
  • 09:00 AM CST (Central - You)
  • 07:00 AM PST (Pacific - Candidate)

  ⚠️ Note: Early morning for candidate (7 AM PST)
```

**Field Specification: Timezone Display**
| Property | Value |
|----------|-------|
| Feature | Multi-Timezone Preview |
| Shows | Proposed time in all relevant timezones |
| Auto-detect | Candidate timezone, Client timezone, Recruiter timezone |
| Warning Indicators | |
| - Before 8 AM | "⚠️ Early morning for {party}" |
| - After 6 PM | "⚠️ Evening for {party}" |
| - Weekend | "⚠️ Weekend" |
| - Holiday | "⚠️ Holiday in {location}" |
| Conversion | Real-time as user selects time |

---

## Alternative Flow 6: Calendar Integration (Direct Scheduling)

**If calendar integration is enabled:**

### Flow:

1. After Step 2 (Date & Time), show option: "[📅 Check Live Availability]"
2. Recruiter clicks button
3. System queries:
   - Candidate's calendar (if synced)
   - Client interviewers' calendars (if synced via API)
4. Shows availability matrix:

```
+----------------------------------------------------------+
| LIVE AVAILABILITY - Week of Dec 15                        |
+----------------------------------------------------------+
|           Mon 12/15    Tue 12/16    Wed 12/17             |
| 9:00 AM   ✅ All free  ❌ Lisa busy ✅ All free           |
| 10:00 AM  ✅ All free  ✅ All free  ❌ Sarah busy         |
| 11:00 AM  ❌ Mike busy ✅ All free  ✅ All free           |
| 2:00 PM   ✅ All free  ✅ All free  ✅ All free           |
+----------------------------------------------------------+
| Click on any green slot to auto-schedule                  |
+----------------------------------------------------------+
```

5. Recruiter clicks "Mon 12/15 at 10:00 AM"
6. System auto-fills that as Option 1
7. Recruiter can still add 2 more options or proceed with single confirmed time
8. If single time selected and all parties free, interview is immediately "Scheduled" (not "Proposed")

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| No Interviewers | User tries to schedule without adding interviewers | "At least one interviewer is required" | Add interviewer |
| Invalid Email | Interviewer email format wrong | "Invalid email address for {name}" | Correct email format |
| Past Time | User selects date/time in the past | "Cannot schedule interview in the past" | Select future date/time |
| Missing Meeting Link | Video call selected but no link provided | "Meeting link is required for video calls" | Add or generate link |
| Duplicate Time Slots | User proposes same time twice | "This time slot is already proposed" | Choose different time |
| Submission Not Found | Submission deleted during scheduling | "Submission no longer exists" | Return to submissions list |
| Permission Denied | User lacks permission | "You don't have permission to schedule interviews" | Contact Admin |
| Email Send Failure | SMTP error | "Interview created but emails failed to send" | Manually send invites or retry |
| Network Error | API call timeout | "Network error. Please try again." | Retry scheduling |
| Calendar Integration Error | Google/Outlook API failure | "Could not generate calendar invite. Please add manually." | Copy details manually |
| Interview Already Exists | Trying to schedule duplicate round | "Round 1 interview already scheduled for this submission" | View existing interview or schedule next round |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Esc` | Close modal (with confirmation if changes made) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form (when on button) |
| `Cmd+Enter` | Submit form (from any field) |
| `Cmd+K` | Open interviewer search (when in interviewer field) |
| `Ctrl+Z` | Undo last time slot entry |

---

## Related Use Cases

- [04-submit-candidate.md](./04-submit-candidate.md) - Before scheduling interview
- [06-manage-interview-feedback.md](./06-manage-interview-feedback.md) - After interview completion
- [07-extend-offer.md](./07-extend-offer.md) - After successful final interview
- [11-update-submission-status.md](./11-update-submission-status.md) - Status lifecycle

---

## Database Schema Reference

### `interviews` Table

```typescript
{
  id: uuid (PK)
  orgId: uuid (FK → organizations)
  submissionId: uuid (FK → submissions)
  jobId: uuid (FK → jobs)
  candidateId: uuid (FK → userProfiles)

  // Interview Details
  roundNumber: integer (1, 2, 3, ...)
  interviewType: text ('phone_screen', 'video_call', 'in_person', 'panel', 'technical', 'behavioral', 'final_round')

  // Scheduling
  scheduledAt: timestamp (with timezone) - Confirmed date/time
  durationMinutes: integer (default: 60)
  timezone: text (default: 'America/New_York')
  meetingLink: text (URL for virtual meetings)
  meetingLocation: text (Address for in-person)

  // Participants
  interviewerNames: text[] (array of interviewer names)
  interviewerEmails: text[] (array of interviewer emails)
  scheduledBy: uuid (FK → userProfiles) - Recruiter who scheduled

  // Status
  status: text ('proposed', 'scheduled', 'completed', 'cancelled', 'no_show')
  cancellationReason: text

  // Feedback (post-interview)
  feedback: text
  rating: integer (1-5)
  recommendation: text ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')
  submittedBy: uuid (FK → userProfiles)
  feedbackSubmittedAt: timestamp

  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-INT-001 | Schedule interview with all required fields | Interview created, emails sent |
| TC-INT-002 | Submit without interviewers | Error: "At least one interviewer is required" |
| TC-INT-003 | Submit with invalid interviewer email | Error: "Invalid email address" |
| TC-INT-004 | Select past date/time | Error: "Cannot schedule in the past" |
| TC-INT-005 | Video call without meeting link | Error: "Meeting link required" |
| TC-INT-006 | Propose duplicate time slots | Error: "Time slot already proposed" |
| TC-INT-007 | Schedule Round 2 before Round 1 completed | Error: "Complete Round 1 first" |
| TC-INT-008 | Confirm time from proposed options | Status changes to 'scheduled', final invites sent |
| TC-INT-009 | Reschedule with new times | Old invites cancelled, new invites sent |
| TC-INT-010 | Cancel interview | Status = 'cancelled', cancellation emails sent |
| TC-INT-011 | Submit feedback after completion | Feedback saved, timeline updated |
| TC-INT-012 | Auto-detect timezone | User's timezone auto-populated |
| TC-INT-013 | Multi-timezone display | Shows time in candidate, client, recruiter timezones |
| TC-INT-014 | Generate meeting link (Google Meet) | Unique link generated and populated |
| TC-INT-015 | Add 5 interviewers | All saved correctly |
| TC-INT-016 | Network error during save | Retry option appears |
| TC-INT-017 | Schedule on submission with status != 'client_interview' | Warning or auto-update status |
| TC-INT-018 | Interview count increment | Submission `interviewCount` increases by 1 |
| TC-INT-019 | Calendar integration active | Shows live availability matrix |
| TC-INT-020 | Candidate availability conflict | Warning indicator shown |

---

## UI/UX Specifications

### Interview Type Icons

| Type | Icon | Color |
|------|------|-------|
| Phone Screen | 📞 | Blue |
| Video Call | 📹 | Green |
| In-Person | 🏢 | Purple |
| Panel | 👥 | Orange |
| Technical | 💻 | Cyan |
| Behavioral | 💬 | Pink |
| Final Round | 🎯 | Red |

### Status Badges

| Status | Badge | Color |
|--------|-------|-------|
| Proposed | 🕐 Proposed | Yellow |
| Scheduled | ✅ Scheduled | Green |
| Completed | ✔️ Completed | Blue |
| Cancelled | ❌ Cancelled | Red |
| No-show | ⚠️ No-show | Orange |

### Recommendation Badges

| Recommendation | Badge | Color |
|----------------|-------|-------|
| Strong Yes | ⭐⭐⭐⭐⭐ Strong Yes | Dark Green |
| Yes | ⭐⭐⭐⭐ Yes | Green |
| Maybe | ⭐⭐⭐ Maybe | Yellow |
| No | ⭐⭐ No | Orange |
| Strong No | ⭐ Strong No | Red |

---

## Integration Points

### Email Service
- **Provider:** SendGrid / AWS SES / Postmark
- **Templates:** interview_request, interview_confirmation, interview_reschedule, interview_cancellation
- **Attachments:** .ics calendar files
- **Variables:** candidate_name, job_title, company_name, date_time, meeting_link, interviewers, etc.

### Calendar Services
- **Google Calendar API:** Generate Meet links, create events, send invites
- **Microsoft Graph API:** Generate Teams links, Outlook calendar events
- **Zoom API:** Generate Zoom meetings with auto-recordings
- **.ics Generation:** Standard iCalendar format for universal compatibility

### Timezone Services
- **Library:** moment-timezone / date-fns-tz / luxon
- **Data Source:** IANA Time Zone Database
- **Features:** Daylight saving handling, offset calculation, abbreviation lookup

### Availability Checking
- **Internal:** Query candidate's calendar preferences from profile
- **External:** Integrate with Google Calendar / Outlook API for live availability
- **Conflict Detection:** Cross-reference proposed times with existing meetings

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Modal Load Time | < 300ms |
| Time Slot Selection | < 100ms response |
| Interview Creation | < 2 seconds |
| Email Delivery | < 5 seconds after creation |
| Calendar Invite Generation | < 1 second |
| Live Availability Query | < 3 seconds |
| Timezone Conversion | < 50ms |

---

## Accessibility (a11y)

- **Keyboard Navigation:** Full keyboard support (Tab, Enter, Esc)
- **Screen Reader:** All fields have proper ARIA labels
- **Focus Management:** Auto-focus on first field, visible focus indicators
- **Error Announcements:** Errors announced via ARIA live regions
- **Color Contrast:** WCAG AAA compliance for all text
- **Date/Time Pickers:** Accessible date pickers with keyboard support

---

## Mobile Considerations

### Responsive Design
- Stack fields vertically on mobile
- Full-width inputs for easy tapping
- Large touch targets (min 44x44px)
- Sticky "Next" and "Schedule" buttons at bottom

### Mobile-Specific Features
- **Auto-detect timezone** from device
- **Native date/time pickers** on iOS/Android
- **One-tap calling** for phone screen interviews
- **Copy meeting link** button
- **Add to phone calendar** native integration

### Mobile Screen State (Step 2 Example):
```
+--------------------------------+
| Schedule Interview             |
|                           [×]  |
+--------------------------------+
| Step 2 of 3: Date & Time       |
|                                |
| Timezone                       |
| [America/New_York        ▼]   |
| [Auto-detect]                  |
|                                |
| Propose Interview Times        |
|                                |
| Option 1                       |
| [12/15/2024        📅]        |
| [10:00 AM          ▼]         |
|                                |
| Option 2                       |
| [12/15/2024        📅]        |
| [02:00 PM          ▼]         |
|                                |
| Option 3                       |
| [12/16/2024        📅]        |
| [11:00 AM          ▼]         |
|                                |
| [+ Add Option]                 |
|                                |
+--------------------------------+
| [← Back]  [Next: Participants] |
+--------------------------------+
```

---

## Future Enhancements

1. **AI-Powered Scheduling**
   - Suggest optimal times based on historical acceptance rates
   - Predict no-show likelihood
   - Auto-schedule when all parties' calendars are synced

2. **Automated Reminders**
   - 24-hour reminder to candidate
   - 1-hour reminder to all participants
   - Post-interview feedback request automation

3. **Interview Prep Automation**
   - Auto-send candidate profile to interviewers 24 hours before
   - Generate interview scorecard template
   - Suggest interview questions based on job requirements

4. **Video Recording**
   - Auto-record video interviews (with consent)
   - Store in secure cloud storage
   - Share with hiring team for review

5. **Interview Analytics**
   - Average time-to-schedule
   - Acceptance rate by time slot
   - No-show patterns
   - Interviewer participation rates

6. **Smart Conflict Resolution**
   - Detect scheduling conflicts automatically
   - Suggest alternative times
   - Auto-reschedule if participant cancels

7. **Multi-Language Support**
   - Send emails in candidate's preferred language
   - Timezone names in local language

8. **Integration with ATS Workflows**
   - Auto-advance submission status after successful interview
   - Trigger offer generation after final round
   - Integration with background check initiation

---

*Last Updated: 2024-11-30*
