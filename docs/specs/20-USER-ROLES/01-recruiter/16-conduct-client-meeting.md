# Use Case: Conduct Client Meeting

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-016 |
| Actor | Recruiter (Account Manager Role) |
| Goal | Conduct structured client meetings for job intake, reviews, or relationship building |
| Frequency | 2-3 times per week |
| Estimated Time | 30-60 minutes per meeting |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Meeting scheduled in calendar
3. Client account exists and is active
4. User has "account.read" permission
5. Pre-meeting preparation completed (optional but recommended)

---

## Trigger

One of the following:
- Scheduled client check-in call
- Job intake meeting for new requirement
- Quarterly Business Review (QBR)
- Issue resolution meeting
- Contract renewal discussion
- New account kickoff meeting
- Submission review meeting

---

## Main Flow (Click-by-Click)

### Step 1: Pre-Meeting Preparation

**User Action:** Navigate to meeting from Today View or Calendar

**System Response:**
- Meeting detail panel opens
- Shows meeting agenda and preparation checklist

**Screen State:**
```
+----------------------------------------------------------+
| UPCOMING MEETING                                          |
| Google Inc - Weekly Check-in                              |
| Today, 2:00 PM - 2:30 PM (30 minutes)                    |
+----------------------------------------------------------+
|                                                           |
| 👥 ATTENDEES                                              |
| Internal: John Smith (You)                                |
| Client:   Sarah Chen (VP Engineering)                     |
|                                                           |
| 📋 PRE-MEETING CHECKLIST                                  |
| ✅ Review active jobs (8 jobs)                            |
| ✅ Check recent submissions (5 this week)                 |
| ✅ Review pending interviews (3 scheduled)                |
| ✅ Prepare status report                                  |
| ⬜ Review client feedback from last meeting               |
| ⬜ Check for any escalations                              |
|                                                           |
| 📊 QUICK STATS FOR MEETING                                |
| • Active Jobs: 8                                          |
| • Submissions This Week: 5                                |
| • Interviews Scheduled: 3                                 |
| • Placements This Month: 2                                |
| • Fill Rate: 75%                                          |
|                                                           |
| 📝 AGENDA                                                 |
| 1. Review active job statuses                             |
| 2. Discuss new Q1 hiring needs                            |
| 3. Address any concerns                                   |
| 4. Next steps                                             |
|                                                           |
| 🔗 MEETING LINK                                           |
| [Join Google Meet] [Copy Link]                           |
|                                                           |
| [Open Meeting Notes] [View Account Details]              |
+----------------------------------------------------------+
```

**Time:** ~5 minutes before meeting

---

### Step 2: Join Meeting and Open Meeting Notes

**User Action:** Click "Open Meeting Notes"

**System Response:**
- Meeting notes template opens
- Real-time note taking interface
- Account context sidebar visible

**Screen State:**
```
+----------------------------------------------------------+
| MEETING NOTES: Google Inc - Weekly Check-in               |
| Dec 5, 2025 • 2:00 PM • Sarah Chen                       |
+----------------------------------------------------------+
| [Template: Weekly Check-in              ▼] [Save] [⋮]    |
+----------------------------------------------------------+
|                                                           |
| ATTENDEES                                                 |
| Internal: John Smith                                      |
| Client:   Sarah Chen (VP Engineering)                     |
|                                                           |
| DISCUSSION POINTS                                         |
|                                                           |
| 1. ACTIVE JOB STATUS REVIEW                               |
| ┌─────────────────────────────────────────────────────┐ |
| │ [Type notes here...]                                │ |
| │                                                     │ |
| │ [Quick Insert: Active Jobs Summary]                 │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| 2. NEW REQUIREMENTS / OPPORTUNITIES                       |
| ┌─────────────────────────────────────────────────────┐ |
| │ [Type notes here...]                                │ |
| │                                                     │ |
| │ [Quick Insert: Job Template]                        │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| 3. CLIENT FEEDBACK / CONCERNS                             |
| ┌─────────────────────────────────────────────────────┐ |
| │ [Type notes here...]                                │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| 4. COMPETITIVE INTELLIGENCE                               |
| ┌─────────────────────────────────────────────────────┐ |
| │ [Type notes here...]                                │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| ACTION ITEMS                                              |
| ⬜ [Add action item...] [Assign to: ___] [Due: ___]      |
| [+ Add Action Item]                                       |
|                                                           |
| NEXT MEETING                                              |
| Date: [12/12/2025        ] Time: [2:00 PM    ]           |
|                                                           |
| MEETING SENTIMENT                                         |
| ○ Very Positive  ○ Positive  ○ Neutral  ○ Negative       |
|                                                           |
| QUICK ACTIONS                                             |
| [📋 Create Job from Notes] [📧 Send Follow-up Email]     |
| [✅ Complete Action Items] [📊 Update NPS]               |
|                                                           |
+----------------------------------------------------------+
| [Save Draft]  [Save & Close]  [Save & Email Summary]     |
+----------------------------------------------------------+
```

**Time:** Throughout meeting (30-60 minutes)

---

### Step 3: Document Job Status Review

**User Action:** Click "Quick Insert: Active Jobs Summary"

**System Response:**
- Automatically inserts current status of all active jobs
- Pre-formatted for easy review

**Auto-Inserted Content:**
```
ACTIVE JOB STATUS (8 jobs)

🟢 Senior Backend Engineer (Job #1234)
   • Posted: 14 days ago
   • Candidates in pipeline: 12
   • Submissions sent: 3
   • Interviews: 1 scheduled
   • Status: Actively recruiting

🟢 React Developer (Job #1235)
   • Posted: 7 days ago
   • Candidates in pipeline: 8
   • Submissions sent: 2
   • Interviews: 2 completed, waiting feedback
   • Status: Strong pipeline

🟡 DevOps Engineer (Job #1236)
   • Posted: 21 days ago
   • Candidates in pipeline: 4
   • Submissions sent: 1
   • Interviews: None yet
   • Status: Need more candidates
   • ACTION NEEDED: Expand search criteria

[... additional jobs ...]
```

**User Action:** Add notes about client's feedback on each job

**Time:** ~10 minutes of discussion

---

### Step 4: Capture New Requirements

**User Action:** Client mentions new hiring need, type notes in "New Requirements" section

**Example Notes:**
```
NEW REQUIREMENTS / OPPORTUNITIES

Sarah mentioned they're expanding the platform team in Q1:
- Need 3 Full-Stack Engineers (React + Node.js)
- Start date: February 15, 2026
- Contract-to-hire preferred
- Budget: $80-95/hr
- Remote OK, prefer Bay Area candidates
- High priority - project launch in March

Additional future needs (not urgent):
- 1 DevOps Engineer (Kubernetes focus) - Q2
- 2 QA Automation Engineers - Q2

NEXT STEPS:
☐ Create job req for Full-Stack Engineers
☐ Send over sample candidate profiles by end of week
☐ Schedule follow-up call with hiring managers
```

**User Action:** Click "Create Job from Notes" button

**System Response:**
- Job creation modal opens
- Pre-filled with details from meeting notes
- User reviews and completes job creation

**Time:** ~15 minutes of discussion

---

### Step 5: Document Client Feedback

**User Action:** Type client feedback on recent submissions/candidates

**Example Notes:**
```
CLIENT FEEDBACK / CONCERNS

POSITIVE FEEDBACK:
- Very happy with Alex Rodriguez (placed last week) - settling in well
- Quality of React candidates has been excellent
- Response time is great - Sarah appreciates quick turnaround

CONCERNS / IMPROVEMENT AREAS:
- DevOps candidates have been light on Kubernetes experience
- Would like to see more diverse candidate slate
- Need better rate transparency upfront

COMPETITIVE INTEL:
- Mentioned they're also working with TechStaff Inc for some roles
- Not happy with their communication
- We're the preferred vendor, but need to maintain quality

ACTION ITEMS:
☐ Focus on Kubernetes-certified DevOps engineers
☐ Emphasize diversity sourcing in next batch
☐ Create rate sheet to share with hiring managers
```

**Time:** ~10 minutes

---

### Step 6: Add Action Items

**User Action:** Click "+ Add Action Item" for each follow-up task

**System Response:**
- Action item row appears
- Can assign to self or others
- Due date picker

**Field Specification: Action Item**
| Property | Value |
|----------|-------|
| Field Name | `actionItem` |
| Type | Text Input + Assignment |
| Required | Yes |
| Assign To | User dropdown (self, manager, team members) |
| Due Date | Date picker |
| Link To | Can link to account, job, candidate, etc. |

**Example Action Items:**
```
ACTION ITEMS

✅ Create job req for 3 Full-Stack Engineers
   Assigned to: You (John Smith)
   Due: Today (Dec 5)
   Linked to: Account - Google Inc

✅ Send sample Full-Stack candidate profiles
   Assigned to: You (John Smith)
   Due: Dec 9, 2025
   Linked to: Job - [To be created]

✅ Create rate sheet for hiring managers
   Assigned to: You (John Smith)
   Due: Dec 8, 2025
   Linked to: Account - Google Inc

✅ Source Kubernetes-certified DevOps engineers
   Assigned to: You (John Smith)
   Due: Dec 12, 2025
   Linked to: Job #1236 (DevOps Engineer)

✅ Schedule call with platform team hiring managers
   Assigned to: You (John Smith)
   Due: Dec 10, 2025
   Linked to: Account - Google Inc
```

**Time:** ~5 minutes

---

### Step 7: Schedule Next Meeting

**User Action:** Fill in "Next Meeting" date/time

**System Response:**
- Date and time captured
- Can automatically create calendar event

**Field Specification: Next Meeting**
| Property | Value |
|----------|-------|
| Field Name | `nextMeetingDate` |
| Type | Date + Time Picker |
| Default | 1 week from today, same time |
| Auto-Action | Creates calendar event if checked |

**Time:** ~1 minute

---

### Step 8: Rate Meeting Sentiment

**User Action:** Select meeting sentiment radio button

**System Response:**
- Sentiment captured
- If "Negative" selected: Prompts for escalation
- Sentiment factors into account health score

**Field Specification: Meeting Sentiment**
| Property | Value |
|----------|-------|
| Field Name | `meetingSentiment` |
| Type | Radio Button Group |
| Options | Very Positive, Positive, Neutral, Negative |
| Impact | Updates account health score |
| Escalation | If Negative: Prompt to notify manager |

**Time:** ~10 seconds

---

### Step 9: Save Meeting Notes

**User Action:** Click "Save & Close" or "Save & Email Summary"

**System Response:**

**If "Save & Close":**
1. Meeting notes saved to account
2. Action items created as tasks
3. Activity logged: "meeting.completed"
4. Next meeting added to calendar (if scheduled)
5. Toast: "Meeting notes saved"
6. Returns to account detail page

**If "Save & Email Summary":**
1. All of above, PLUS
2. Email composer opens with meeting summary
3. Pre-addressed to meeting attendees
4. Summary formatted professionally
5. Action items included
6. User can edit before sending

**Screen State (Email Summary):**
```
+----------------------------------------------------------+
|                                  Meeting Summary Email    |
+----------------------------------------------------------+
| To: sarah@google.com                                      |
| CC: john.smith@intime.com (You)                          |
| Subject: Meeting Summary - Weekly Check-in - Dec 5, 2025  |
|                                                           |
| Body:                                                     |
| ┌─────────────────────────────────────────────────────┐ |
| │ Hi Sarah,                                           │ |
| │                                                     │ |
| │ Thanks for taking the time to meet today. Here's   │ |
| │ a summary of what we discussed:                     │ |
| │                                                     │ |
| │ ACTIVE JOB STATUS                                   │ |
| │ • Senior Backend Engineer: 3 submissions sent,      │ |
| │   1 interview scheduled                             │ |
| │ • React Developer: 2 interviews completed,          │ |
| │   awaiting your feedback                            │ |
| │ • DevOps Engineer: Expanding search for             │ |
| │   Kubernetes-certified candidates                   │ |
| │                                                     │ |
| │ NEW REQUIREMENTS                                    │ |
| │ • 3 Full-Stack Engineers (React + Node.js)         │ |
| │ • Start date: February 15                           │ |
| │ • Budget: $80-95/hr                                │ |
| │ • I'll have the job created and send sample         │ |
| │   profiles by end of week                           │ |
| │                                                     │ |
| │ ACTION ITEMS                                        │ |
| │ On my side:                                         │ |
| │ ☐ Create Full-Stack Engineer job req (today)       │ |
| │ ☐ Send sample candidate profiles (by Dec 9)        │ |
| │ ☐ Create rate sheet for hiring managers (by Dec 8) │ |
| │ ☐ Focus on Kubernetes-certified DevOps candidates  │ |
| │                                                     │ |
| │ NEXT MEETING                                        │ |
| │ Thursday, December 12, 2:00 PM                      │ |
| │                                                     │ |
| │ Let me know if I missed anything!                   │ |
| │                                                     │ |
| │ Best regards,                                       │ |
| │ John Smith                                          │ |
| │ Technical Recruiter                                 │ |
| │ [Auto-signature]                                    │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
+----------------------------------------------------------+
|                       [Edit]  [Cancel]  [Send ✓]         |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 10: Send Email Summary

**User Action:** Review email, click "Send ✓"

**System Response:**
1. Email sent to client and self
2. Email logged as activity
3. Client receives professional summary
4. All action items trackable
5. Toast: "Meeting summary sent successfully"

**Time:** ~1 second

---

## Postconditions

1. ✅ Meeting notes documented and saved
2. ✅ Activity logged: "meeting.completed"
3. ✅ Action items created as tasks in system
4. ✅ Email summary sent to client (if selected)
5. ✅ Next meeting scheduled (if applicable)
6. ✅ Account health metrics updated (sentiment)
7. ✅ New jobs created from meeting (if applicable)
8. ✅ Follow-up tasks in Today View

---

## Events Logged

| Event | Payload |
|-------|---------|
| `meeting.completed` | `{ meeting_id, account_id, attendees, duration, sentiment, notes_id }` |
| `meeting_notes.created` | `{ notes_id, meeting_id, account_id, content, created_by }` |
| `task.created` | `{ task_id, title, assigned_to, due_date, linked_entity }` (per action item) |
| `email.sent` | `{ email_id, account_id, subject, recipients, type: 'meeting_summary' }` |
| `meeting.scheduled` | `{ meeting_id, account_id, scheduled_date, attendees }` (for next meeting) |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Save Failed | Network error | "Failed to save meeting notes. Try again?" | Retry, notes saved locally |
| Email Failed | SMTP error | "Failed to send email summary" | Retry or send manually |
| Missing Attendees | No client attendee | "Please add at least one client attendee" | Add attendee |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+S` | Save meeting notes |
| `Cmd+Enter` | Save and close |
| `Tab` | Next section |
| `Cmd+J` | Quick insert: Job summary |
| `Cmd+A` | Add action item |

---

## Alternative Flows

### A1: Quarterly Business Review (QBR)

Different template with:
1. Performance metrics review (placements, fill rates, revenue)
2. Strategic planning for next quarter
3. Feedback and NPS discussion
4. Contract renewal discussion
5. Account expansion opportunities

### A2: Job Intake Meeting

Focused template:
1. Job requirements deep dive
2. Ideal candidate profile
3. Timeline and urgency
4. Budget and rate discussion
5. Interview process and decision makers
6. Submission expectations

### A3: Emergency/Escalation Meeting

1. Issue description and impact
2. Root cause analysis
3. Resolution plan
4. Prevention measures
5. Relationship repair actions

---

## Related Use Cases

- [15-manage-client-relationship.md](./15-manage-client-relationship.md) - Ongoing relationship
- [02-create-job.md](./02-create-job.md) - Creating jobs from meeting
- [17-handle-client-escalation.md](./17-handle-client-escalation.md) - If issues arise
- [07-log-activity.md](./07-log-activity.md) - Activity logging

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Complete meeting notes with all sections | Notes saved, activity logged |
| TC-002 | Add 3 action items | 3 tasks created with correct assignments |
| TC-003 | Save and email summary | Email sent with formatted summary |
| TC-004 | Select "Negative" sentiment | Manager alert triggered |
| TC-005 | Quick insert job summary | Current job statuses inserted |
| TC-006 | Create job from meeting notes | Job modal pre-filled with meeting data |
| TC-007 | Schedule next meeting | Calendar event created |
| TC-008 | Save without client attendee | Error: "Please add client attendee" |

---

## Backend Processing

### tRPC Procedures

- `meetings.createNotes` - Save meeting notes
- `meetings.complete` - Mark meeting complete
- `tasks.createBulk` - Create action item tasks
- `emails.sendMeetingSummary` - Send summary email
- `accounts.updateHealth` - Update health score with sentiment

### Meeting Notes Storage

**Table:** `meeting_notes`

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `meeting_id` | UUID | FK to calendar events |
| `account_id` | UUID | FK to accounts |
| `attendees_internal` | TEXT[] | Internal attendees |
| `attendees_client` | TEXT[] | Client attendees |
| `discussion_points` | JSONB | Structured notes |
| `action_items` | JSONB | Action items with assignments |
| `next_meeting_date` | TIMESTAMP | Next scheduled meeting |
| `sentiment` | ENUM | Meeting sentiment |
| `created_by` | UUID | Note taker |
| `created_at` | TIMESTAMP | |

---

*Last Updated: 2025-11-30*
