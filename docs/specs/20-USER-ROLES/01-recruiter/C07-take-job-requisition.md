# Use Case: Take Job Requisition

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-C07 |
| Actor | Recruiter (Account Manager Role) |
| Goal | Receive and document detailed job requirements from client for new hiring needs |
| Frequency | 3-5 times per week per recruiter |
| Estimated Time | 15-30 minutes per intake |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "job.create" permission
3. Account exists and is active
4. Client contact available for intake discussion
5. Budget/approval exists for the role

---

## Trigger

One of the following:
- Client emails new job requirement
- Job intake call scheduled
- Client submits via portal
- Hiring manager requests help filling role
- Expansion of existing job requisition
- Replacement for terminated placement

---

## Main Flow (Click-by-Click)

### Step 1: Initiate Job Intake

**User Action:** Click "Take Job Requisition" from account page or "+ New Job"

**System Response:**
- Job intake wizard opens
- Account pre-selected if initiated from account

**Screen State:**
```
+----------------------------------------------------------+
|                                   Job Intake Wizard   [×] |
+----------------------------------------------------------+
| Step 1 of 5: Basic Information                            |
| ●───────○───────○───────○───────○                         |
+----------------------------------------------------------+
|                                                           |
| ACCOUNT & CONTACT                                         |
|                                                           |
| Account *                                                 |
| [TechStart Inc                                 ▼]        |
|                                                           |
| Hiring Manager *                                          |
| [Sarah Chen - VP Engineering                   ▼]        |
|                                                           |
| Intake Method *                                           |
| ○ Phone/Video Call (Live intake)                         |
| ○ Email (Client sent requirements)                       |
| ○ Client Portal (Self-service submission)                |
| ○ In-Person Meeting                                      |
|                                                           |
| JOB BASICS                                                |
|                                                           |
| Job Title *                                               |
| [Senior Backend Engineer                        ]        |
|                                                           |
| Number of Positions *                                     |
| [2     ]                                                  |
|                                                           |
| Job Type *                                                |
| ○ Contract (W2)                                          |
| ○ Contract-to-Hire                                       |
| ○ Direct Hire (Permanent)                                |
| ○ 1099 / C2C                                             |
|                                                           |
| Priority Level *                                          |
| ○ Urgent (Need ASAP, <2 weeks)                          |
| ○ High (Within 30 days)                                  |
| ○ Normal (30-60 days)                                    |
| ○ Low (60+ days, pipeline building)                     |
|                                                           |
| Target Start Date                                         |
| [01/20/2026                                     📅]      |
|                                                           |
+----------------------------------------------------------+
|             [Cancel]  [Next: Requirements →]             |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 2: Gather Detailed Requirements

**User Action:** Click "Next: Requirements →"

**Screen State:**
```
+----------------------------------------------------------+
|                                   Job Intake Wizard   [×] |
+----------------------------------------------------------+
| Step 2 of 5: Technical Requirements                       |
| ●───────●───────○───────○───────○                         |
+----------------------------------------------------------+
|                                                           |
| EXPERIENCE REQUIREMENTS                                   |
|                                                           |
| Years of Experience *                                     |
| Minimum: [5    ] years    Preferred: [7    ] years       |
|                                                           |
| Experience Level *                                        |
| ○ Junior (0-2 years)                                     |
| ○ Mid-Level (3-5 years)                                  |
| ○ Senior (5-8 years) ✓                                   |
| ○ Staff/Principal (8+ years)                             |
|                                                           |
| REQUIRED SKILLS (Must-Have)                               |
| ┌────────────────────────────────────────────────────┐  |
| │ [+ Add skill]                                      │  |
| │                                                     │  |
| │ Skill              Years    Proficiency           │  |
| │ ──────────────────────────────────────────────── │  |
| │ Node.js            [3+ ]    [Expert         ▼]   │  |
| │ TypeScript         [2+ ]    [Expert         ▼]   │  |
| │ PostgreSQL         [2+ ]    [Proficient     ▼]   │  |
| │ AWS                [2+ ]    [Proficient     ▼]   │  |
| │ REST API Design    [3+ ]    [Expert         ▼]   │  |
| │ Microservices      [2+ ]    [Proficient     ▼]   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PREFERRED SKILLS (Nice-to-Have)                           |
| ┌────────────────────────────────────────────────────┐  |
| │ [+ Add skill]                                      │  |
| │                                                     │  |
| │ • GraphQL                                          │  |
| │ • Kubernetes                                       │  |
| │ • Redis                                            │  |
| │ • FinTech/Payment processing experience           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| EDUCATION                                                 |
|                                                           |
| Minimum Education                                         |
| [Bachelor's in CS or equivalent               ▼]        |
|   - No requirement                                       |
|   - High School                                          |
|   - Associate's                                          |
|   - Bachelor's in CS or equivalent                       |
|   - Master's preferred                                   |
|   - PhD required                                         |
|                                                           |
| Certifications (Optional)                                 |
| [AWS Certified, not required but preferred      ]        |
|                                                           |
| DOMAIN EXPERIENCE                                         |
|                                                           |
| Industry experience required?                             |
| ☑ FinTech / Payments                                     |
| ☐ Healthcare                                             |
| ☐ E-commerce                                             |
| ☐ No specific industry required                          |
|                                                           |
+----------------------------------------------------------+
|       [← Back]  [Cancel]  [Next: Role Details →]         |
+----------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 3: Role Details & Responsibilities

**User Action:** Click "Next: Role Details →"

**Screen State:**
```
+----------------------------------------------------------+
|                                   Job Intake Wizard   [×] |
+----------------------------------------------------------+
| Step 3 of 5: Role Details                                 |
| ●───────●───────●───────○───────○                         |
+----------------------------------------------------------+
|                                                           |
| JOB DESCRIPTION                                           |
|                                                           |
| Role Summary *                                            |
| [We're looking for a Senior Backend Engineer to join    |
|  our Payments team. You'll be building and scaling our  |
|  core payment processing infrastructure that handles    |
|  millions of transactions daily. This is a high-impact  |
|  role working directly with our CTO and VP Eng.    ]    |
|                                                           |
| Key Responsibilities *                                    |
| [• Design and build scalable backend services           |
|  • Own end-to-end development of payment features       |
|  • Mentor junior engineers on best practices            |
|  • Participate in architecture decisions                |
|  • On-call rotation for production systems              |
|  • Code review and technical documentation          ]   |
|                                                           |
| Why This Role is Open                                     |
| ○ Team growth / Expansion                                |
| ○ Backfill (someone left)                               |
| ○ New project / Initiative                               |
| ○ Restructuring                                          |
|                                                           |
| TEAM STRUCTURE                                            |
|                                                           |
| Team Name                                                 |
| [Payments Team                                  ]        |
|                                                           |
| Team Size                                                 |
| [8     ] engineers currently                             |
|                                                           |
| Reports To                                                |
| [Sarah Chen - VP Engineering                   ▼]        |
|                                                           |
| Direct Reports                                            |
| [0     ] (Individual contributor role)                   |
|                                                           |
| KEY PROJECTS                                              |
|                                                           |
| What will this person work on?                           |
| [• Real-time payment processing pipeline                |
|  • Fraud detection system integration                   |
|  • International payment expansion (EU, APAC)           |
|  • Performance optimization for peak load           ]   |
|                                                           |
| Success Metrics (First 90 Days)                          |
| [• Onboard and ship first feature by Day 30             |
|  • Own a major service component by Day 60              |
|  • Participate in on-call rotation by Day 90        ]   |
|                                                           |
+----------------------------------------------------------+
|       [← Back]  [Cancel]  [Next: Logistics →]            |
+----------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 4: Logistics & Compensation

**User Action:** Click "Next: Logistics →"

**Screen State:**
```
+----------------------------------------------------------+
|                                   Job Intake Wizard   [×] |
+----------------------------------------------------------+
| Step 4 of 5: Logistics & Compensation                     |
| ●───────●───────●───────●───────○                         |
+----------------------------------------------------------+
|                                                           |
| WORK LOCATION                                             |
|                                                           |
| Work Arrangement *                                        |
| ○ Remote (100%)                                          |
| ○ Hybrid ([3 ] days in office)                          |
| ○ On-site (Full-time in office)                         |
|                                                           |
| If Remote, Location Restrictions                          |
| ☑ US-based only                                          |
| ☐ Specific states: [                           ]        |
| ☐ Specific timezone: [                         ]        |
| ☐ No restrictions (global)                               |
|                                                           |
| Office Location (if hybrid/on-site)                       |
| [San Francisco, CA                             ▼]        |
|                                                           |
| WORK AUTHORIZATION                                        |
|                                                           |
| Accepted work authorizations *                            |
| ☑ US Citizen                                             |
| ☑ Green Card                                             |
| ☑ H1B (Transfer)                                         |
| ☐ H1B (New sponsorship)                                  |
| ☑ OPT / CPT                                              |
| ☐ TN Visa                                                |
|                                                           |
| COMPENSATION                                              |
|                                                           |
| Bill Rate Range (Client pays) *                           |
| Min: [$110.00    ] /hr    Max: [$140.00    ] /hr        |
|                                                           |
| Pay Rate Range (Candidate receives) *                     |
| Min: [$88.00     ] /hr    Max: [$112.00    ] /hr        |
|                                                           |
| Target Margin: 20%                                        |
|                                                           |
| If Contract-to-Hire:                                      |
| Conversion Salary Range                                   |
| Min: [$180,000   ]    Max: [$220,000   ]                |
| Conversion Fee: [20   ]% of annual salary                |
|                                                           |
| BENEFITS (For W2 Contract)                                |
| ☑ Health Insurance                                       |
| ☑ 401(k)                                                 |
| ☑ Paid Time Off                                          |
| ☐ Other: [                                     ]        |
|                                                           |
| SCHEDULE                                                  |
|                                                           |
| Standard Hours                                            |
| [40    ] hours per week                                  |
|                                                           |
| Overtime Expected?                                        |
| ○ Yes, regularly (10+ hrs/week)                         |
| ○ Occasionally (5-10 hrs/week)                          |
| ○ Rarely (<5 hrs/week)                                  |
|                                                           |
| On-Call Required?                                         |
| ☑ Yes, rotation schedule: [1 week every 6 weeks  ]      |
|                                                           |
+----------------------------------------------------------+
|      [← Back]  [Cancel]  [Next: Interview Process →]     |
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 5: Interview Process

**User Action:** Click "Next: Interview Process →"

**Screen State:**
```
+----------------------------------------------------------+
|                                   Job Intake Wizard   [×] |
+----------------------------------------------------------+
| Step 5 of 5: Interview Process & Submission               |
| ●───────●───────●───────●───────●                         |
+----------------------------------------------------------+
|                                                           |
| INTERVIEW PROCESS                                         |
|                                                           |
| Number of Interview Rounds *                              |
| [4     ] rounds total                                    |
|                                                           |
| Interview Stages                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Round 1: Recruiter Screen                          │  |
| │ Format: [Phone         ▼] Duration: [30 ] min     │  |
| │ Interviewer: [InTime Recruiter                ]   │  |
| │ Focus: Experience overview, culture, logistics    │  |
| │                                                     │  |
| │ Round 2: Technical Phone Screen                    │  |
| │ Format: [Video         ▼] Duration: [60 ] min     │  |
| │ Interviewer: [Senior Engineer - TBD           ]   │  |
| │ Focus: Technical depth, coding problem            │  |
| │                                                     │  |
| │ Round 3: Virtual Onsite                            │  |
| │ Format: [Video         ▼] Duration: [180] min     │  |
| │ Interviewer: [Panel - 3 engineers             ]   │  |
| │ Focus: System design, coding, behavioral          │  |
| │                                                     │  |
| │ Round 4: Hiring Manager Final                      │  |
| │ Format: [Video         ▼] Duration: [30 ] min     │  |
| │ Interviewer: [Sarah Chen                      ]   │  |
| │ Focus: Culture fit, team dynamics, Q&A           │  |
| │                                                     │  |
| │ [+ Add Round]                                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| DECISION TIMELINE                                         |
|                                                           |
| Decision after final interview                            |
| [3-5   ] business days                                   |
|                                                           |
| SUBMISSION REQUIREMENTS                                   |
|                                                           |
| Required for submission:                                  |
| ☑ Resume                                                 |
| ☑ Cover letter (optional)                                |
| ☐ Portfolio / Work samples                               |
| ☐ References                                             |
| ☐ Background check consent                               |
|                                                           |
| Submission Format Preference                              |
| ○ Our standard format (recommended)                      |
| ○ Client's format (provide template)                     |
| ○ Either acceptable                                      |
|                                                           |
| Submission Notes                                          |
| [Client prefers submissions with a brief summary of     |
|  why the candidate is a good fit. Include relevant      |
|  project examples if available.                    ]    |
|                                                           |
| CANDIDATE EXPECTATIONS                                    |
|                                                           |
| Candidates per week target                                |
| [3-5   ] quality submissions expected                    |
|                                                           |
| Feedback turnaround                                       |
| [48    ] hours after submission                          |
|                                                           |
| SCREENING QUESTIONS                                       |
|                                                           |
| Knockout questions to ask in screen:                      |
| [• What's your Node.js/TypeScript experience level?     |
|  • Have you worked on high-scale payment systems?       |
|  • Are you comfortable with on-call rotation?           |
|  • What's your expected hourly rate range?          ]   |
|                                                           |
+----------------------------------------------------------+
|   [← Back]  [Save as Draft]  [Create Job Requisition ✓]  |
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 6: Create Job Requisition

**User Action:** Click "Create Job Requisition ✓"

**System Response:**

1. **Job record created** with all details
2. **Assigned to recruiter** as owner
3. **Activity logged** on account
4. **Notifications sent** to team
5. **Job appears** in active jobs list

**On Success:**
- Toast: "Job requisition created! Senior Backend Engineer @ TechStart"
- Redirects to new job detail page

**Time:** ~2 seconds

---

## Postconditions

1. ✅ Job record created in `jobs` table
2. ✅ Linked to account and hiring manager
3. ✅ Skills and requirements documented
4. ✅ Interview process defined
5. ✅ Compensation range set
6. ✅ Team notified
7. ✅ Ready for candidate sourcing

---

## Events Logged

| Event | Payload |
|-------|---------|
| `job.created` | `{ job_id, account_id, title, positions, created_by }` |
| `job.intake_completed` | `{ job_id, intake_method, hiring_manager }` |
| `account.job_added` | `{ account_id, job_id }` |

---

## Related Use Cases

- [C05-conduct-client-meeting.md](./C05-conduct-client-meeting.md) - Intake during meeting
- [D01-create-job.md](./D01-create-job.md) - Quick job creation
- [E01-source-candidates.md](./E01-source-candidates.md) - Start sourcing

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Complete intake wizard | Job created with all fields |
| TC-002 | Add required skills | Skills saved with proficiency |
| TC-003 | Define interview process | 4 rounds configured |
| TC-004 | Set compensation range | Rates and margin calculated |
| TC-005 | Save as draft | Partial job saved |
| TC-006 | Multiple positions | Position count = 2 |

---

*Last Updated: 2025-12-05*

