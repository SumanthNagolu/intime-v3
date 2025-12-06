# Use Case: Track Submission

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-F02 |
| Actor | Recruiter |
| Goal | Monitor submission status, follow up with clients, and track feedback |
| Frequency | Daily |
| Estimated Time | 5-10 minutes per submission |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Submission exists in system
3. Candidate has been submitted to client

---

## Trigger

- Daily submission review routine
- Submission SLA approaching (3 days no response)
- Client provides feedback
- Candidate inquires about status
- Interview scheduled or requested

---

## Main Flow

### Step 1: View Submission Pipeline

**User Action:** Navigate to "Submissions" and select "Pending Feedback"

**Screen State:**
```
+----------------------------------------------------------+
| SUBMISSIONS                        [+ New Submission]     |
+----------------------------------------------------------+
| [All] [Pending ●] [Interview] [Offer] [Placed] [Rejected]|
+----------------------------------------------------------+
|                                                           |
| PENDING FEEDBACK (8)                                      |
| ┌────────────────────────────────────────────────────┐  |
| │ Status  Candidate      Job             Days  Action │  |
| │ ───────────────────────────────────────────────────│  |
| │ 🔴 5d   Jane Doe       Sr. Backend     5     [F/U]  │  |
| │ 🟡 3d   Mike Chen      Full Stack      3     [F/U]  │  |
| │ 🟢 1d   Sarah Lee      DevOps          1     [Wait] │  |
| │ 🟢 0d   Tom Wilson     Frontend        0     [Wait] │  |
| │                                                     │  |
| │ 🔴 = Overdue (>3 days)  🟡 = Due  🟢 = OK          │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| SLA STATUS                                                |
| ┌────────────────────────────────────────────────────┐  |
| │ Avg. Response Time: 2.8 days                       │  |
| │ Overdue: 2 submissions                             │  |
| │ On Track: 6 submissions                            │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

---

### Step 2: Follow Up on Overdue Submission

**User Action:** Click "[F/U]" on overdue submission

**Screen State:**
```
+----------------------------------------------------------+
|                          Submission Follow-up         [×] |
+----------------------------------------------------------+
| Jane Doe → Senior Backend @ TechStart                     |
| Submitted: Dec 17, 2025 (5 days ago)                     |
| Status: Awaiting Client Feedback                          |
+----------------------------------------------------------+
|                                                           |
| FOLLOW-UP OPTIONS                                         |
|                                                           |
| Quick Actions:                                            |
| [📧 Send Follow-up Email]  [📞 Log Call]                 |
|                                                           |
| Email Template:                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ To: Sarah Chen <sarah.chen@techstart.io>           │  |
| │ Subject: Following up - Jane Doe submission        │  |
| │                                                     │  |
| │ Hi Sarah,                                          │  |
| │                                                     │  |
| │ I wanted to follow up on Jane Doe's submission    │  |
| │ for the Senior Backend Engineer role sent on      │  |
| │ December 17th.                                     │  |
| │                                                     │  |
| │ Would you like to schedule an interview with her? │  |
| │ She's highly qualified and very interested in     │  |
| │ TechStart.                                         │  |
| │                                                     │  |
| │ Let me know if you need any additional info.      │  |
| │                                                     │  |
| │ Best,                                              │  |
| │ John                                               │  |
| │                                                     │  |
| │ [Edit] [Send Now ✓]                               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| FOLLOW-UP HISTORY                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Dec 17 - Submitted                                 │  |
| │ Dec 19 - Auto reminder sent                        │  |
| │ Dec 22 - Today: Manual follow-up                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

---

### Step 3: Record Feedback

**User Action:** Client responds, click "Record Feedback"

**Screen State:**
```
+----------------------------------------------------------+
|                          Record Feedback              [×] |
+----------------------------------------------------------+
|                                                           |
| FEEDBACK TYPE *                                           |
| ○ Move to Interview (Positive)                           |
| ○ On Hold (Under Review)                                 |
| ○ Rejected (Not Moving Forward)                          |
|                                                           |
| FEEDBACK DETAILS                                          |
|                                                           |
| Client Response Summary *                                 |
| [Sarah wants to move forward with Jane. Impressed by    |
|  her payment experience. Scheduling technical screen.]  |
|                                                           |
| If Rejected - Reason:                                     |
| [Select reason...                              ▼]        |
|                                                           |
| NEXT STEPS                                                |
| ☑ Schedule technical screen                              |
| ☐ Request additional information                         |
| ☐ Send to different hiring manager                       |
|                                                           |
+----------------------------------------------------------+
|                       [Cancel]  [Save Feedback ✓]        |
+----------------------------------------------------------+
```

---

## Postconditions

1. ✅ Submission status updated
2. ✅ Follow-up activity logged
3. ✅ Client feedback recorded
4. ✅ Next action scheduled
5. ✅ Candidate notified (if applicable)

---

## SLA Rules

| Days Since Submission | Status | Action |
|-----------------------|--------|--------|
| 0-2 days | Green | Wait |
| 3 days | Yellow | Send reminder |
| 4+ days | Red | Manual follow-up required |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `submission.followed_up` | `{ submission_id, method, outcome }` |
| `submission.feedback_received` | `{ submission_id, feedback_type, details }` |

---

## Related Use Cases

- [F01-submit-candidate.md](./F01-submit-candidate.md) - Initial submission
- [F03-schedule-interview.md](./F03-schedule-interview.md) - Next step if approved

---

*Last Updated: 2025-12-05*

