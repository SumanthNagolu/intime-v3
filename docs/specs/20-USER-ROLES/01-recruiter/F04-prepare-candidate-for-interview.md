# Use Case: Prepare Candidate for Interview

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-F04 |
| Actor | Recruiter |
| Goal | Coach candidate for upcoming client interview to maximize success |
| Frequency | 3-5 times per week |
| Estimated Time | 20-30 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Interview scheduled with client
3. Candidate confirmed availability
4. Interview details (format, interviewers) known

---

## Trigger

- Interview scheduled (1-2 days before)
- Candidate requests prep help
- Complex interview format
- High-priority placement

---

## Main Flow

### Step 1: Initiate Prep Session

**User Action:** Click "Prepare Candidate" from interview or submission

**Screen State:**
```
+----------------------------------------------------------+
|                      Interview Preparation            [×] |
+----------------------------------------------------------+
| Candidate: Jane Doe                                       |
| Interview: TechStart - Technical Screen                   |
| Date: Dec 24, 2025 at 2:00 PM PT                         |
+----------------------------------------------------------+
|                                                           |
| INTERVIEW DETAILS                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Round: Technical Phone Screen (Round 2 of 4)       │  |
| │ Duration: 60 minutes                               │  |
| │ Format: Video (Google Meet)                        │  |
| │ Interviewer: Alex Kumar, Senior Engineer           │  |
| │                                                     │  |
| │ Focus Areas:                                       │  |
| │ • Technical depth in Node.js/TypeScript           │  |
| │ • Live coding problem                              │  |
| │ • System design discussion                         │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PREP CHECKLIST                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ ☐ Review company background with candidate         │  |
| │ ☐ Discuss role specifics and expectations          │  |
| │ ☐ Practice common technical questions              │  |
| │ ☐ Review system design approach                    │  |
| │ ☐ Prepare questions for interviewer               │  |
| │ ☐ Confirm logistics (link, time, backup plan)     │  |
| │ ☐ Discuss compensation if it comes up             │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| COMPANY BRIEF                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ TechStart Inc - FinTech Startup                    │  |
| │ • Series B, 120 employees, growing fast           │  |
| │ • Payment processing platform                      │  |
| │ • Culture: Fast-paced, collaborative, innovative  │  |
| │ • Tech: Node.js, TypeScript, AWS, PostgreSQL      │  |
| │ • Recent news: Launched in 3 new markets          │  |
| │                                                     │  |
| │ [Full Company Profile]                             │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| LIKELY QUESTIONS                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Technical:                                         │  |
| │ • Design a payment processing system              │  |
| │ • How do you handle database scaling?             │  |
| │ • Implement rate limiting algorithm               │  |
| │                                                     │  |
| │ Behavioral:                                        │  |
| │ • Tell me about a challenging project             │  |
| │ • How do you handle disagreements?                │  |
| │ • Why are you interested in TechStart?            │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CANDIDATE'S QUESTIONS (Suggest to ask)                    |
| ┌────────────────────────────────────────────────────┐  |
| │ • What does success look like in this role?       │  |
| │ • How is the team structured?                     │  |
| │ • What's the biggest technical challenge?         │  |
| │ • What's the growth trajectory?                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PREP NOTES                                                |
| [Discussed her payment processing project from Meta.    |
|  She should lead with that experience. Reminded her to  |
|  ask clarifying questions during system design.    ]    |
|                                                           |
| SEND PREP MATERIALS                                       |
| ☑ Company overview document                              |
| ☑ Interview tips sheet                                   |
| ☑ Meeting link and logistics                             |
|                                                           |
+----------------------------------------------------------+
|      [Save Notes]  [Send Materials]  [Complete Prep ✓]   |
+----------------------------------------------------------+
```

---

### Step 2: Complete Prep and Send Materials

**User Action:** Check off items, add notes, click "Complete Prep ✓"

**System Response:**
1. Prep session logged
2. Materials emailed to candidate
3. Reminder set for post-interview debrief

---

## Postconditions

1. ✅ Candidate briefed on company/role
2. ✅ Practice questions reviewed
3. ✅ Logistics confirmed
4. ✅ Materials sent
5. ✅ Prep session documented

---

## Events Logged

| Event | Payload |
|-------|---------|
| `interview.prep_completed` | `{ interview_id, candidate_id, prep_by }` |
| `email.prep_materials_sent` | `{ candidate_id, materials_list }` |

---

## Related Use Cases

- [F03-schedule-interview.md](./F03-schedule-interview.md) - Schedule interview
- [F06-collect-interview-feedback.md](./F06-collect-interview-feedback.md) - Post-interview

---

*Last Updated: 2025-12-05*

