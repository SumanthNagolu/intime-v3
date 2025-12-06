# Use Case: Screen Candidate

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-E03 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Conduct phone screening to assess candidate fit, skills, and interest before client submission |
| Frequency | 10-20 screens per week per recruiter |
| Estimated Time | 30-45 minutes per screen |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "candidate.update" permission
3. Candidate profile exists in system
4. Candidate has been sourced for a specific job
5. Screening call scheduled or candidate available

---

## Trigger

One of the following:
- Scheduled screening call time arrives
- Candidate responds to outreach, ready to talk
- Candidate applies to job posting
- Hiring manager requests candidate evaluation
- Candidate referred by employee/contact

---

## Main Flow (Click-by-Click)

### Step 1: Open Screening Interface

**User Action:** Click "Start Screen" from candidate card or scheduled task

**System Response:**
- Screening interface opens
- Candidate profile and job details displayed
- Screening form ready for input

**Screen State:**
```
+----------------------------------------------------------+
|                         Candidate Screening           [×] |
+----------------------------------------------------------+
| Candidate: Jane Doe                                       |
| Job: Senior Backend Engineer @ TechStart Inc              |
| Scheduled: Now (Dec 22, 2025 at 2:00 PM)                 |
+----------------------------------------------------------+
|                                                           |
| ┌─────────────────────┬──────────────────────────────┐  |
| │ CANDIDATE INFO      │ SCREENING FORM               │  |
| │                     │                              │  |
| │ 👤 Jane Doe         │ CALL STATUS                  │  |
| │ Sr. Software Eng    │ ○ Not Started                │  |
| │ 6 years exp         │ ○ In Progress ●              │  |
| │                     │ ○ Completed                  │  |
| │ 📧 jane@email.com   │ ○ No Show                    │  |
| │ 📱 (555) 123-4567   │ ○ Rescheduled               │  |
| │                     │                              │  |
| │ Current:            │ Call Duration: 00:15:32      │  |
| │ Meta, 3 years       │ [⏱ Timer Running]           │  |
| │                     │                              │  |
| │ Education:          │──────────────────────────────│  |
| │ MS CS, Stanford     │                              │  |
| │                     │ KNOCKOUT QUESTIONS           │  |
| │ Skills:             │                              │  |
| │ • Node.js (5 yrs)   │ Q1: Years of Node.js exp?    │  |
| │ • TypeScript (3 yrs)│ [5 years, production      ]  │  |
| │ • AWS (4 yrs)       │ ✅ Meets requirement (3+)    │  |
| │ • PostgreSQL (4 yrs)│                              │  |
| │                     │ Q2: Payment system exp?      │  |
| │ [View Full Profile] │ [Yes, Stripe integration  ]  │  |
| │                     │ ✅ Has relevant experience   │  |
| │ ─────────────────── │                              │  |
| │                     │ Q3: Comfortable with on-call?│  |
| │ JOB REQUIREMENTS    │ [Yes, currently on rotation] │  |
| │                     │ ✅ Acceptable                 │  |
| │ TechStart Inc       │                              │  |
| │ Sr. Backend Eng     │ Q4: Rate expectations?       │  |
| │                     │ [$95-105/hr             ]    │  |
| │ Required:           │ ✅ Within range ($88-112)    │  |
| │ • Node.js 3+ yrs ✓  │                              │  |
| │ • TypeScript 2+ ✓   │ Q5: Availability?            │  |
| │ • AWS 2+ yrs ✓      │ [2 weeks notice         ]    │  |
| │ • PostgreSQL 2+ ✓   │ ✅ Meets start date need     │  |
| │                     │                              │  |
| │ Nice-to-have:       │──────────────────────────────│  |
| │ • FinTech exp ✓     │                              │  |
| │ • GraphQL           │ KNOCKOUT RESULT: ✅ PASS     │  |
| │ • Kubernetes        │ 5/5 questions passed         │  |
| │                     │                              │  |
| │ Rate: $110-140/hr   │                              │  |
| └─────────────────────┴──────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Conduct Technical Assessment

**User Action:** Complete technical screening section

**Screen State (Scrolled to Technical):**
```
+----------------------------------------------------------+
|                         Candidate Screening           [×] |
+----------------------------------------------------------+
|                                                           |
| TECHNICAL ASSESSMENT                                      |
|                                                           |
| Backend Development Skills                                |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ Node.js / TypeScript                               │  |
| │ Rating: ○ 1 ○ 2 ○ 3 ○ 4 ● 5                       │  |
| │ Notes: [Strong understanding of async patterns,   |
| │         event loop, TypeScript generics. Built    |
| │         high-throughput APIs at Meta.         ]   │  |
| │                                                     │  |
| │ Database / PostgreSQL                              │  |
| │ Rating: ○ 1 ○ 2 ○ 3 ● 4 ○ 5                       │  |
| │ Notes: [Good query optimization knowledge.        |
| │         Experience with partitioning, indexing.   |
| │         Less experience with complex migrations.] │  |
| │                                                     │  |
| │ AWS / Cloud Infrastructure                         │  |
| │ Rating: ○ 1 ○ 2 ○ 3 ● 4 ○ 5                       │  |
| │ Notes: [EC2, RDS, Lambda, SQS experience.        |
| │         Has AWS Solutions Architect cert.     ]   │  |
| │                                                     │  |
| │ System Design                                      │  |
| │ Rating: ○ 1 ○ 2 ○ 3 ○ 4 ● 5                       │  |
| │ Notes: [Excellent. Discussed payment system      |
| │         design with strong scalability focus. ]   │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Technical Score: 4.5/5 ⭐⭐⭐⭐½                          |
|                                                           |
| KEY PROJECT DISCUSSION                                    |
| ┌────────────────────────────────────────────────────┐  |
| │ Project: Payment Processing Pipeline @ Meta        │  |
| │                                                     │  |
| │ Role: Lead Backend Engineer                        │  |
| │ Team Size: 6 engineers                             │  |
| │ Duration: 18 months                                │  |
| │                                                     │  |
| │ Challenge:                                         │  |
| │ [Needed to handle 10x traffic increase for new    |
| │  market launch while maintaining <100ms latency]  │  |
| │                                                     │  |
| │ Solution:                                          │  |
| │ [Implemented event-driven architecture with       |
| │  Kafka, horizontal scaling with k8s, circuit     |
| │  breakers for downstream services            ]    │  |
| │                                                     │  |
| │ Outcome:                                           │  |
| │ [Achieved 50ms p99 latency, 99.99% uptime,       |
| │  processed $2B in transactions monthly       ]    │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~10 minutes

---

### Step 3: Assess Soft Skills & Culture Fit

**User Action:** Complete soft skills section

**Screen State:**
```
+----------------------------------------------------------+
|                         Candidate Screening           [×] |
+----------------------------------------------------------+
|                                                           |
| SOFT SKILLS & CULTURE FIT                                 |
|                                                           |
| Communication                                             |
| Rating: ○ 1 ○ 2 ○ 3 ○ 4 ● 5                             |
| Notes: [Clear, articulate, good at explaining            |
|         technical concepts. Active listener.        ]    |
|                                                           |
| Problem Solving                                           |
| Rating: ○ 1 ○ 2 ○ 3 ○ 4 ● 5                             |
| Notes: [Methodical approach, asks clarifying             |
|         questions, considers trade-offs.            ]    |
|                                                           |
| Collaboration / Teamwork                                  |
| Rating: ○ 1 ○ 2 ○ 3 ● 4 ○ 5                             |
| Notes: [Enjoys mentoring, has led cross-functional       |
|         projects. Prefers collaborative environments.]   |
|                                                           |
| Leadership Potential                                      |
| Rating: ○ 1 ○ 2 ○ 3 ● 4 ○ 5                             |
| Notes: [Has led small teams, interested in               |
|         growing into tech lead role eventually.     ]    |
|                                                           |
| Culture Fit for TechStart                                 |
| Rating: ○ 1 ○ 2 ○ 3 ○ 4 ● 5                             |
| Notes: [Startup background at earlier company.           |
|         Excited about FinTech space. Values             |
|         fast-paced, high-impact environments.       ]    |
|                                                           |
| Soft Skills Score: 4.4/5                                 |
|                                                           |
| MOTIVATION & INTEREST                                     |
| ┌────────────────────────────────────────────────────┐  |
| │ Why leaving current role?                          │  |
| │ [Looking for smaller company where can have       |
| │  more impact. Meta is too big, wants to be       |
| │  closer to product decisions.                ]    │  |
| │                                                     │  |
| │ Why interested in TechStart?                       │  |
| │ [Excited about FinTech disruption, knows their   |
| │  product, impressed by engineering blog posts.   |
| │  Wants to work on payment infrastructure.    ]    │  |
| │                                                     │  |
| │ Career goals (1-2 years)?                         │  |
| │ [Become tech lead, own a major system, mentor    |
| │  junior engineers. Eventually architect role. ]   │  |
| │                                                     │  |
| │ Interest Level: ○ Low ○ Med ● High ○ Very High   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 4: Complete Screening Summary

**User Action:** Complete final evaluation

**Screen State:**
```
+----------------------------------------------------------+
|                         Candidate Screening           [×] |
+----------------------------------------------------------+
|                                                           |
| SCREENING SUMMARY                                         |
|                                                           |
| OVERALL ASSESSMENT                                        |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ Technical Skills:    ⭐⭐⭐⭐½  4.5/5              │  |
| │ Soft Skills:         ⭐⭐⭐⭐½  4.4/5              │  |
| │ Culture Fit:         ⭐⭐⭐⭐⭐  5.0/5              │  |
| │ Interest Level:      ⭐⭐⭐⭐   4.0/5              │  |
| │ ────────────────────────────────────────────────── │  |
| │ OVERALL SCORE:       ⭐⭐⭐⭐½  4.5/5              │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| RECOMMENDATION *                                          |
| ● Submit to Client (Highly recommended)                  |
| ○ Submit with Reservations (Some concerns)               |
| ○ Hold for Other Roles (Not right for this job)         |
| ○ Reject (Does not meet requirements)                    |
|                                                           |
| STRENGTHS                                                 |
| [• Excellent technical depth in Node.js/TypeScript      |
|  • Strong system design skills, payment experience      |
|  • Great communicator, will interview well              |
|  • Highly motivated, genuine interest in TechStart      |
|  • Leadership experience, can mentor team           ]   |
|                                                           |
| CONCERNS / AREAS TO PROBE                                 |
| [• Slightly less PostgreSQL depth than ideal            |
|  • Rate expectation at higher end of range              |
|  • Never worked at company as small as TechStart    ]   |
|                                                           |
| INTERVIEW PREPARATION NOTES                               |
| [Prep candidate on TechStart's interview format.        |
|  Practice system design for payment scenarios.          |
|  Discuss her Kafka experience - key differentiator. ]   |
|                                                           |
| COMPENSATION DISCUSSION                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ Candidate Expectation: $95-105/hr                  │  |
| │ Job Range: $88-112/hr (pay), $110-140/hr (bill)   │  |
| │ Recommended Offer: $100/hr pay, $125/hr bill      │  |
| │ Margin: 20% ✅                                     │  |
| │                                                     │  |
| │ Notes: She's flexible, prioritizing role fit      │  |
| │ over compensation. $100/hr should work.           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NEXT STEPS                                                |
| ☑ Submit to client (create submission)                   |
| ☑ Send prep materials to candidate                       |
| ☐ Schedule prep call before client interview             |
| ☐ Notify hiring manager of submission                    |
|                                                           |
| Call Duration: 00:32:15                                   |
|                                                           |
+----------------------------------------------------------+
|    [Save Draft]  [Cancel]  [Complete Screening ✓]        |
+----------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 5: Complete Screening

**User Action:** Click "Complete Screening ✓"

**System Response:**

1. **Screening record created**
2. **Candidate status updated** to "Screened"
3. **Scores calculated and saved**
4. **Activity logged** on candidate profile
5. **If "Submit to Client"** - Opens submission workflow
6. **Notifications sent** to team

**On Success:**
- Toast: "Screening completed! Opening submission form..."
- Redirects to submission creation (if recommended)

---

## Postconditions

1. ✅ Screening record saved
2. ✅ Technical and soft skill scores recorded
3. ✅ Knockout questions documented
4. ✅ Recommendation captured
5. ✅ Candidate status updated
6. ✅ Ready for submission (if passed)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `candidate.screened` | `{ candidate_id, job_id, overall_score, recommendation, screened_by }` |
| `screening.completed` | `{ screening_id, duration_minutes, knockout_passed }` |

---

## Screening Scorecard

| Category | Weight | Rating Scale |
|----------|--------|--------------|
| Technical Skills | 35% | 1-5 |
| Soft Skills | 25% | 1-5 |
| Culture Fit | 20% | 1-5 |
| Interest Level | 10% | 1-5 |
| Experience Match | 10% | 1-5 |

**Recommendation Thresholds:**
- Submit to Client: Score ≥ 4.0
- Submit with Reservations: Score 3.0-3.9
- Hold for Other Roles: Score 2.5-2.9 + skills mismatch
- Reject: Score < 2.5 or knockout fail

---

## Related Use Cases

- [E01-source-candidates.md](./E01-source-candidates.md) - Find candidates
- [E05-prepare-candidate-profile.md](./E05-prepare-candidate-profile.md) - Format for submission
- [F01-submit-candidate.md](./F01-submit-candidate.md) - Submit to client

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Complete full screening | All scores saved |
| TC-002 | Fail knockout question | Warning shown |
| TC-003 | Recommend for submission | Opens submission flow |
| TC-004 | Hold for other roles | Status updated, tagged |
| TC-005 | Reject candidate | Rejection reason required |
| TC-006 | Timer tracks call duration | Duration saved |

---

*Last Updated: 2025-12-05*

