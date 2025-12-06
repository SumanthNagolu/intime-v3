# Use Case: Coordinate Interview Rounds

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-F05 |
| Actor | Recruiter |
| Goal | Manage multi-round interview process from initial screen through final |
| Frequency | 5-10 times per week |
| Estimated Time | 10-15 minutes per round coordination |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Candidate has passed initial screening
3. Client interview process defined
4. Multiple interview rounds required

---

## Trigger

- Candidate passes interview round, next round needed
- Client provides positive feedback
- Final round scheduling required
- Complex multi-panel interview

---

## Main Flow

### Step 1: View Interview Progress

**User Action:** Navigate to submission or candidate interview tracking

**Screen State:**
```
+----------------------------------------------------------+
|                    Interview Progress                     |
+----------------------------------------------------------+
| Jane Doe → Senior Backend @ TechStart                     |
| Overall Status: Round 2 of 4 Complete                     |
+----------------------------------------------------------+
|                                                           |
| INTERVIEW ROUNDS                                          |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ Round 1: Recruiter Screen                          │  |
| │ Status: ✅ Passed                                  │  |
| │ Date: Dec 18, 2025                                 │  |
| │ Interviewer: John Smith (You)                      │  |
| │ Feedback: 4.5/5 - Highly recommended               │  |
| │                                                     │  |
| │ Round 2: Technical Phone Screen                    │  |
| │ Status: ✅ Passed                                  │  |
| │ Date: Dec 24, 2025                                 │  |
| │ Interviewer: Alex Kumar                            │  |
| │ Feedback: 4/5 - Strong technical, proceed          │  |
| │                                                     │  |
| │ Round 3: Virtual Onsite                            │  |
| │ Status: ⏳ Scheduling                              │  |
| │ Format: 3-hour panel (System Design + Coding)      │  |
| │ Interviewers: Panel of 3 engineers                 │  |
| │ [Schedule Now]                                     │  |
| │                                                     │  |
| │ Round 4: Hiring Manager Final                      │  |
| │ Status: ⏸ Pending Round 3                         │  |
| │ Interviewer: Sarah Chen                            │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| TIMELINE                                                  |
| ┌────────────────────────────────────────────────────┐  |
| │ Started: Dec 17 (Submission)                       │  |
| │ Current Day: 7                                     │  |
| │ Target Decision: Dec 31 (14 days)                  │  |
| │ Status: 🟢 On Track                               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

---

### Step 2: Schedule Next Round

**User Action:** Click "Schedule Now" for Round 3

**Screen State:**
```
+----------------------------------------------------------+
|                    Schedule Interview                 [×] |
+----------------------------------------------------------+
| Round 3: Virtual Onsite                                   |
| Duration: 3 hours                                         |
+----------------------------------------------------------+
|                                                           |
| INTERVIEW FORMAT                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Part 1: System Design (1 hour)                     │  |
| │ Interviewer: Alex Kumar                            │  |
| │                                                     │  |
| │ Part 2: Coding Exercise (1 hour)                   │  |
| │ Interviewer: Maria Santos                          │  |
| │                                                     │  |
| │ Part 3: Behavioral + Q&A (1 hour)                  │  |
| │ Interviewer: James Wong                            │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| AVAILABLE TIMES (From client)                             |
| ┌────────────────────────────────────────────────────┐  |
| │ ☐ Mon, Dec 30 - 10:00 AM - 1:00 PM PT            │  |
| │ ☑ Tue, Dec 31 - 1:00 PM - 4:00 PM PT             │  |
| │ ☐ Thu, Jan 2 - 9:00 AM - 12:00 PM PT             │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CANDIDATE AVAILABILITY                                    |
| Jane has confirmed: Dec 31 works ✅                       |
|                                                           |
| MEETING DETAILS                                           |
| Platform: [Google Meet                         ▼]        |
| Link: [Auto-generate                             ]       |
|                                                           |
| NOTIFICATIONS                                             |
| ☑ Send calendar invite to candidate                      |
| ☑ Send calendar invite to interviewers                   |
| ☑ Include prep materials for candidate                   |
| ☑ Send interviewer scorecard template                    |
|                                                           |
+----------------------------------------------------------+
|                [Cancel]  [Confirm & Schedule ✓]          |
+----------------------------------------------------------+
```

---

### Step 3: Confirm Schedule

**User Action:** Select time, click "Confirm & Schedule ✓"

**System Response:**
1. Calendar events created
2. Invites sent to all parties
3. Prep materials sent to candidate
4. Scorecards sent to interviewers
5. Submission status updated

---

## Postconditions

1. ✅ Interview scheduled
2. ✅ All parties notified
3. ✅ Calendar events created
4. ✅ Materials distributed
5. ✅ Timeline tracked

---

## Events Logged

| Event | Payload |
|-------|---------|
| `interview.round_scheduled` | `{ interview_id, round, date, interviewers }` |
| `interview.round_completed` | `{ interview_id, round, outcome, feedback }` |

---

## Related Use Cases

- [F03-schedule-interview.md](./F03-schedule-interview.md) - Single interview
- [F04-prepare-candidate-for-interview.md](./F04-prepare-candidate-for-interview.md) - Prep

---

*Last Updated: 2025-12-05*

