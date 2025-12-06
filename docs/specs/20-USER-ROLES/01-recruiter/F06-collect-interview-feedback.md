# Use Case: Collect Interview Feedback

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-F06 |
| Actor | Recruiter |
| Goal | Gather and document feedback from both client and candidate after interviews |
| Frequency | After every interview |
| Estimated Time | 10-15 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Interview has been completed
3. Access to client and candidate contact info

---

## Trigger

- Interview completed (same day or next business day)
- Client submits feedback via portal
- Scheduled follow-up reminder
- Candidate reaches out post-interview

---

## Main Flow

### Step 1: View Pending Feedback

**User Action:** Navigate to interviews requiring feedback

**Screen State:**
```
+----------------------------------------------------------+
|                    Interview Feedback                     |
+----------------------------------------------------------+
| PENDING FEEDBACK (5)                                      |
| ┌────────────────────────────────────────────────────┐  |
| │ Candidate       Round          Date       Status    │  |
| │ ─────────────────────────────────────────────────  │  |
| │ Jane Doe       Tech Screen    Dec 24    🔴 Overdue │  |
| │ Mike Chen      Final          Dec 23    🟡 Due     │  |
| │ Sarah Lee      Onsite         Dec 22    🟢 Received│  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

---

### Step 2: Record Feedback

**User Action:** Click on interview to record feedback

**Screen State:**
```
+----------------------------------------------------------+
|                   Record Feedback                     [×] |
+----------------------------------------------------------+
| Jane Doe - Technical Screen @ TechStart                   |
| Interview Date: Dec 24, 2025                              |
+----------------------------------------------------------+
|                                                           |
| CLIENT FEEDBACK                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Interviewer: Alex Kumar                            │  |
| │                                                     │  |
| │ Overall Rating *                                   │  |
| │ ○ 1 ○ 2 ○ 3 ● 4 ○ 5                               │  |
| │                                                     │  |
| │ Decision *                                         │  |
| │ ● Move Forward (Proceed to next round)            │  |
| │ ○ Hold (Need to discuss)                          │  |
| │ ○ Reject (Do not proceed)                         │  |
| │                                                     │  |
| │ Technical Skills:     ⭐⭐⭐⭐ 4/5                 │  |
| │ Communication:        ⭐⭐⭐⭐⭐ 5/5               │  |
| │ Problem Solving:      ⭐⭐⭐⭐ 4/5                 │  |
| │ Culture Fit:          ⭐⭐⭐⭐ 4/5                 │  |
| │                                                     │  |
| │ Strengths:                                         │  |
| │ [Strong system design skills, explained payment   |
| │  architecture clearly. Good communication.    ]   │  |
| │                                                     │  |
| │ Areas of Concern:                                  │  |
| │ [Could have been more creative with scaling      |
| │  solution. Minor - not a blocker.            ]    │  |
| │                                                     │  |
| │ Additional Notes:                                  │  |
| │ [Recommend for onsite. Would be strong addition  |
| │  to payments team.                           ]    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ───────────────────────────────────────────────────────  |
|                                                           |
| CANDIDATE FEEDBACK                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ How did the interview go? *                        │  |
| │ ○ Great ● Good ○ Okay ○ Poorly                    │  |
| │                                                     │  |
| │ Interest level after interview *                   │  |
| │ ○ Very High ● High ○ Medium ○ Low ○ Withdrawn    │  |
| │                                                     │  |
| │ Candidate's feedback:                              │  |
| │ [Enjoyed the technical discussion. Alex was       |
| │  friendly and asked interesting questions about   |
| │  scalability. Excited about the role.        ]    │  |
| │                                                     │  |
| │ Any concerns raised?                               │  |
| │ [Asked about on-call frequency - explained it's   |
| │  1 week every 6 weeks, she's comfortable.    ]    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NEXT STEPS                                                |
| ☑ Schedule next round (Round 3: Onsite)                  |
| ☐ Send additional information to client                  |
| ☐ Follow up on specific concern                          |
|                                                           |
+----------------------------------------------------------+
|                [Cancel]  [Save Feedback ✓]               |
+----------------------------------------------------------+
```

---

### Step 3: Save and Process

**User Action:** Complete feedback, click "Save Feedback ✓"

**System Response:**
1. Feedback saved to interview record
2. Submission status updated based on decision
3. If "Move Forward" - Prompts to schedule next round
4. Activity logged on candidate and submission

---

## Postconditions

1. ✅ Client feedback documented
2. ✅ Candidate feedback captured
3. ✅ Decision recorded
4. ✅ Next steps identified
5. ✅ Submission status updated

---

## Feedback SLA

| Time After Interview | Status | Action |
|---------------------|--------|--------|
| Same day | Green | Best practice |
| 1 day | Green | Acceptable |
| 2 days | Yellow | Follow up |
| 3+ days | Red | Escalate |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `interview.feedback_received` | `{ interview_id, rating, decision }` |
| `submission.status_updated` | `{ submission_id, new_status }` |

---

## Related Use Cases

- [F05-coordinate-interview-rounds.md](./F05-coordinate-interview-rounds.md) - Multi-round
- [G01-extend-offer.md](./G01-extend-offer.md) - If approved

---

*Last Updated: 2025-12-05*

