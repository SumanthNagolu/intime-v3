# Use Case: Submit Bench Consultant to External Job

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-004 |
| Actor | Bench Sales Recruiter |
| Goal | Submit internal bench consultant to external vendor/client opportunity |
| Frequency | 3-5 submissions per week per recruiter |
| Estimated Time | 15-25 minutes per submission |
| Priority | CRITICAL (Core revenue-generating activity) |
| Business Impact | Reduces bench time, generates revenue, consultant retention |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Consultant exists on bench with status = "available"
3. External job exists in system (scraped or manually added)
4. Consultant resume is current (<30 days old)
5. Consultant has confirmed interest and availability
6. Work authorization verified for job location/requirements
7. User has "bench_submission.create" permission

---

## Trigger

One of the following:
- Vendor responds to hotlist with job requirement
- Bench rep finds matching job via vendor portal scraping
- Vendor calls with urgent requirement
- Consultant reaches 30+ days on bench (proactive submission)
- Manager assigns submission target
- AI matching system flags consultant-job match (>85% score)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Submission Builder

**User Action:** Click "Pipeline" → "Bench Submissions" → "+ New Submission"

**System Response:**
- Submission builder modal opens
- Pre-selection UI displays
- Two entry paths available: Start with Consultant OR Start with Job

**Screen State:**
```
+------------------------------------------------------------------+
|                 Create Bench Submission                      [×] |
+------------------------------------------------------------------+
| Start with:                                                       |
|                                                                   |
| ┌─────────────────────────────┐  ┌───────────────────────────┐  |
| │   🧑 START WITH CONSULTANT   │  │  💼 START WITH JOB        │  |
| │                              │  │                           │  |
| │ Best when you have a         │  │ Best when vendor sent     │  |
| │ consultant to place and      │  │ a specific requirement    │  |
| │ need to find matching jobs   │  │ and you need to find      │  |
| │                              │  │ matching consultant       │  |
| │ [Select Consultant →]        │  │ [Select Job →]            │  |
| └─────────────────────────────┘  └───────────────────────────┘  |
+------------------------------------------------------------------+
```

**URL:** `/employee/workspace/bench/submissions/new`

**Time:** ~2 seconds

---

### Step 2A: Select Consultant (If Starting with Consultant)

**User Action:** Click "Select Consultant →", search/select consultant

**System Response:**
- Consultant selector opens
- Shows all bench consultants with priority indicators
- Pre-filters by availability and responsiveness

**Screen State:**
```
+------------------------------------------------------------------+
|                    Select Bench Consultant                   [×] |
+------------------------------------------------------------------+
| [Search by name, skills, visa status...]           [⌘F]  [Clear] |
+------------------------------------------------------------------+
| Filters:  [All] [High Priority] [My Consultants] [Recently Added]|
| Sort: Days on Bench (High to Low) ▼                              |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟠 RAJESH KUMAR                               42 days on bench│ |
| │ Java Backend Developer | $85/hr                                │ |
| │ Skills: Java, Spring Boot, AWS, Microservices                 │ |
| │ Visa: H1B (valid through 12/2026)                             │ |
| │ Last project: Meta (3 years)                                  │ |
| │ Location: DC Area | Open to: Remote/Hybrid                     │ |
| │ ⚠ HIGH PRIORITY: 30+ days bench | Last contacted: 2 days ago  │ |
| │ ✓ Confirmed available | ✓ Resume current (updated 1 week ago) │ |
| │                                                                │ |
| │ Matching Jobs: 8 found                    [View Matches →]    │ |
| │ [Select This Consultant]                                       │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟠 SARAH JOHNSON                              38 days on bench│ |
| │ .NET Full Stack Developer | $90/hr                            │ |
| │ Skills: C#, .NET Core, Azure, React, SQL Server               │ |
| │ Visa: US Citizen                                              │ |
| │ Last project: JP Morgan (2 years)                             │ |
| │ Location: Remote | Open to: Nationwide                         │ |
| │ ⚠ HIGH PRIORITY: 30+ days bench | Last contacted: 1 day ago   │ |
| │ ✓ Confirmed available | ✓ Resume current (updated 3 days ago) │ |
| │                                                                │ |
| │ Matching Jobs: 12 found                   [View Matches →]    │ |
| │ [Select This Consultant]                                       │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟢 PRIYA SHARMA                               18 days on bench│ |
| │ React Frontend Developer | $95/hr                             │ |
| │ Skills: React, TypeScript, Node, GraphQL, AWS                 │ |
| │ Visa: Green Card                                              │ |
| │ Last project: Google (18 months)                              │ |
| │ Location: Bay Area | Open to: Remote only                      │ |
| │ Last contacted: 4 days ago ⚠ Schedule follow-up               │ |
| │ ✓ Resume current (updated 2 weeks ago)                        │ |
| │                                                                │ |
| │ Matching Jobs: 15 found                   [View Matches →]    │ |
| │ [Select This Consultant]                                       │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Priority Indicators:**
- 🔴 Red: 60+ days on bench (CRITICAL)
- 🟠 Orange: 31-59 days on bench (HIGH)
- 🟡 Yellow: 15-30 days on bench (MEDIUM)
- 🟢 Green: 0-14 days on bench (NORMAL)

**User Action:** Click "Select This Consultant" for Rajesh Kumar

**System Response:**
- Consultant selected
- AI matching engine runs in background
- Loads matching external jobs

**Time:** ~5 seconds

---

### Step 2B: Select Job (If Starting with Job)

**User Action:** Click "Select Job →", search/select external job

**System Response:**
- External job selector opens
- Shows active vendor requirements
- Displays source and freshness

**Screen State:**
```
+------------------------------------------------------------------+
|                    Select External Job                       [×] |
+------------------------------------------------------------------+
| [Search by title, company, skills...]              [⌘F]  [Clear] |
+------------------------------------------------------------------+
| Filters:  [All Jobs] [Portal Jobs] [Email Jobs] [Fresh (0-7d)]  |
| Sources: [All] [TechStaff] [ClearanceJobs] [Robert Half]        |
| Sort: Posted Date (Newest First) ▼                               |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Senior Java Developer                          📍 REMOTE       │ |
| │ Via: TechStaff Solutions (Vendor) | For: Accenture Federal     │ |
| │ Posted: 2 days ago | Expires: 12 days left                     │ |
| │                                                                │ |
| │ Rate: $95-110/hr | Contract: 6-12 months | C2C/W2             │ |
| │ Location: Remote (US) | Clearance: Public Trust Eligible       │ |
| │                                                                │ |
| │ Required Skills:                                               │ |
| │ • Java 8+, Spring Boot, Microservices                         │ |
| │ • AWS (EC2, S3, Lambda)                                       │ |
| │ • REST APIs, PostgreSQL                                       │ |
| │ • 8+ years experience                                         │ |
| │                                                                │ |
| │ Visa: US Citizen or Green Card preferred (H1B considered)     │ |
| │                                                                │ |
| │ Matching Consultants: 3 found            [View Matches →]     │ |
| │ [Select This Job]                                              │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ .NET Full Stack Engineer                       📍 HYBRID       │ |
| │ Via: ClearanceJobs (Portal) | For: Booz Allen Hamilton        │ |
| │ Posted: 1 day ago | Expires: 13 days left                      │ |
| │                                                                │ |
| │ Rate: $100-120/hr | Contract: 12 months | W2 only              │ |
| │ Location: Baltimore, MD (Hybrid 2 days/week)                   │ |
| │                                                                │ |
| │ Required Skills:                                               │ |
| │ • C#, .NET Core, ASP.NET                                      │ |
| │ • React, Azure, SQL Server                                    │ |
| │ • 5+ years experience                                         │ |
| │                                                                │ |
| │ Visa: US Citizen ONLY (Security Clearance required)           │ |
| │                                                                │ |
| │ Matching Consultants: 2 found            [View Matches →]     │ |
| │ [Select This Job]                                              │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**User Action:** Click "Select This Job" for Java Developer role

**System Response:**
- Job selected
- AI matching engine runs
- Loads matching consultants from bench

**Time:** ~5 seconds

---

### Step 3: Review AI Match Score

**System Response (After Selection):**
- AI calculates match score between consultant and job
- Shows detailed breakdown

**Screen State:**
```
+------------------------------------------------------------------+
|              Submission: Rajesh Kumar → Accenture Java Role      |
+------------------------------------------------------------------+
| [Step 1: Match Review] [Step 2: Details] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| AI Match Analysis                                  Overall: 92%  |
+------------------------------------------------------------------+
| ┌────────────────────────────────────────────────────────────┐  |
| │ ✅ EXCELLENT MATCH                                          │  |
| │                                                             │  |
| │ Match Score: 92/100                     [████████████░░]   │  |
| │                                                             │  |
| │ Breakdown:                                                  │  |
| │ ✓ Skills Match: 95%           [█████████████████░░]        │  |
| │   - Java 8+: ✓ Expert (10 years)                           │  |
| │   - Spring Boot: ✓ Expert (8 years)                        │  |
| │   - AWS: ✓ Advanced (5 years)                              │  |
| │   - Microservices: ✓ Expert (6 years)                      │  |
| │   - PostgreSQL: ✓ Proficient (7 years)                     │  |
| │                                                             │  |
| │ ✓ Experience: 100%            [████████████████████]       │  |
| │   - Required: 8+ years | Rajesh: 10 years ✓                │  |
| │                                                             │  |
| │ ⚠ Visa Status: 75%            [███████████████░░░░]        │  |
| │   - Preferred: US Citizen/GC | Rajesh: H1B                  │  |
| │   - Note: Job says "H1B considered" - SUBMIT!              │  |
| │                                                             │  |
| │ ✓ Rate Alignment: 90%         [██████████████████░░]       │  |
| │   - Job offers: $95-110/hr                                 │  |
| │   - Rajesh rate: $85/hr                                    │  |
| │   - Markup potential: $10-25/hr (10-29%)                   │  |
| │                                                             │  |
| │ ✓ Location: 100%              [████████████████████]       │  |
| │   - Remote (matches Rajesh preference)                     │  |
| │                                                             │  |
| │ ✓ Availability: 100%          [████████████████████]       │  |
| │   - Immediate start available                              │  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| 💡 AI Recommendation:                                             |
| STRONG SUBMIT - Rajesh is an excellent match for this role.      |
| His Meta experience and AWS expertise will be very attractive.   |
| The H1B visa is acceptable per job description. Suggest          |
| highlighting his federal-adjacent work and current clearance     |
| eligibility in submission notes.                                 |
|                                                                   |
+------------------------------------------------------------------+
| Potential Concerns:                                               |
| ⚠ Visa: H1B (preferred: Citizen/GC) - Mitigate by emphasizing   |
|   "H1B transfer ready" and stable work history                   |
| ✓ All other criteria met or exceeded                             |
|                                                                   |
+------------------------------------------------------------------+
|                            [← Choose Different]  [Looks Good →]  |
+------------------------------------------------------------------+
```

**Match Score Calculation:**
```typescript
// Weighted scoring algorithm
const skillsWeight = 0.35;
const experienceWeight = 0.25;
const visaWeight = 0.15;
const rateWeight = 0.15;
const locationWeight = 0.10;

const finalScore =
  (skillsMatch * skillsWeight) +
  (experienceMatch * experienceWeight) +
  (visaMatch * visaWeight) +
  (rateAlignment * rateWeight) +
  (locationMatch * locationWeight);

// 90+: Excellent Match (Green - Submit immediately)
// 75-89: Good Match (Yellow - Review and submit)
// 60-74: Fair Match (Orange - Consider submission)
// <60: Poor Match (Red - Not recommended)
```

**User Action:** Review match, click "Looks Good →"

**Time:** ~30 seconds review

---

### Step 4: Confirm Consultant Availability & Interest

**Screen State:**
```
+------------------------------------------------------------------+
|              Submission: Rajesh Kumar → Accenture Java Role      |
+------------------------------------------------------------------+
| [Step 1: Match Review] [Step 2: Details] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Consultant Verification Checklist                                |
+------------------------------------------------------------------+
| Before submitting, verify the following with Rajesh:             |
|                                                                   |
| ☐ Consultant confirmed interest in this specific role            |
| ☐ Consultant confirmed availability (immediate start)            |
| ☐ Consultant confirmed rate acceptable ($85/hr for this role)    |
| ☐ Consultant confirmed work authorization (H1B transfer ready)   |
| ☐ Consultant confirmed location preference (Remote OK)           |
| ☐ Consultant aware this is vendor submission (not direct)        |
|                                                                   |
+------------------------------------------------------------------+
| Quick Contact:                                                    |
| [📞 Call Rajesh: +1-555-234-5678]  [📧 Email]  [💬 SMS]         |
|                                                                   |
| Last Contact: 2 days ago                                          |
| Notes from last call: "Actively seeking immediate opportunities.  |
| Interested in Java roles. Rate flexible for right opportunity."  |
|                                                                   |
| Add Verification Notes:                                           |
| [Called Rajesh 12/2 10:30 AM. He confirmed:                   ]  |
| [- Very interested in Accenture Federal work                  ]  |
| [- Ready to start immediately                                 ]  |
| [- Rate of $85/hr acceptable, willing to negotiate if needed  ]  |
| [- H1B transfer ready, has all documentation                  ]  |
| [- Prefers remote, willing to travel occasionally if needed   ]  |
| [                                                 ] 285/500       |
|                                                                   |
| Verification Status:                                              |
| ● Verified via phone call                                        |
| ○ Verified via email                                             |
| ○ Verified via text                                              |
| ○ Using previous confirmation (within 3 days)                    |
|                                                                   |
| Verified By: [Your Name]                                          |
| Verified Date/Time: [12/02/2024 10:30 AM]                        |
|                                                                   |
+------------------------------------------------------------------+
|                               [← Back]  [Continue to Details →]  |
+------------------------------------------------------------------+
```

**Field Specification: Verification Notes**
| Property | Value |
|----------|-------|
| Field Name | `verificationNotes` |
| Type | Textarea |
| Required | Yes |
| Min Length | 50 characters |
| Max Length | 500 characters |
| Validation | Must include date/time and method of contact |

**CRITICAL RULE:** Never submit a consultant without confirmed availability and interest. This is a bench sales cardinal rule.

**User Action:** Check all boxes, add verification notes, click "Continue to Details →"

**Time:** ~2-3 minutes (if already contacted recently)

---

### Step 5: Enter Submission Details

**Screen State:**
```
+------------------------------------------------------------------+
|              Submission: Rajesh Kumar → Accenture Java Role      |
+------------------------------------------------------------------+
| [Step 1: Match Review] [Step 2: Details] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Submission Details                                                |
+------------------------------------------------------------------+
| Consultant: Rajesh Kumar (Java Developer)               [locked] |
| External Job: Senior Java Developer - Accenture         [locked] |
|                                                                   |
+------------------------------------------------------------------+
| Vendor Information                                                |
+------------------------------------------------------------------+
| Vendor/Prime: *                                                   |
| [TechStaff Solutions                                          ▼] |
| (Auto-filled from job source)                                    |
|                                                                   |
| Vendor Contact: *                                                 |
| [Michael Roberts - michael.roberts@techstaff.com          ▼]    |
| Phone: +1-555-987-6543                                           |
|                                                                   |
| End Client: *                                                     |
| [Accenture Federal Services                                   ]  |
| (Auto-filled from job)                                           |
|                                                                   |
+------------------------------------------------------------------+
| Rate & Billing                                                    |
+------------------------------------------------------------------+
| Consultant's Rate (Our Cost): *                                  |
| $ [85.00        ] /hr                                            |
| (Auto-filled from consultant profile)                            |
|                                                                   |
| Submission Rate (Bill to Vendor): *                              |
| $ [100.00       ] /hr        💡 Suggested: $98-108/hr            |
|                                                                   |
| Client Budget Range:                                              |
| $ [95.00        ] - $ [110.00       ] /hr                        |
| (From job posting)                                               |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| Margin Calculation:                                               |
| • Markup: $15.00/hr                                              |
| • Markup %: 17.65%                                               |
| • Gross Margin: 15.00%                                           |
| • Status: ✓ GOOD MARGIN (within company target 12-20%)          |
| • Monthly Revenue (est.): $17,600                                |
| • Monthly Margin: $2,640                                         |
| ─────────────────────────────────────────────────────────────── |
|                                                                   |
| Currency:                                                         |
| [USD                                                          ▼] |
|                                                                   |
| Rate Type:                                                        |
| ● Hourly  ○ Daily  ○ Monthly  ○ Annual                          |
|                                                                   |
| Contract Duration:                                                |
| [6-12     ] months (from job posting)                            |
|                                                                   |
+------------------------------------------------------------------+
| Work Authorization & Immigration                                  |
+------------------------------------------------------------------+
| Consultant Visa Status: *                                         |
| [H1B                                                          ▼] |
|                                                                   |
| Visa Valid Through: *                                             |
| [12/31/2026                                               📅]    |
|                                                                   |
| Transfer Status:                                                  |
| ☑ H1B transfer ready (all documents available)                   |
| ☑ Current employer LCA available                                 |
| ☑ Last 3 paystubs available                                      |
| ☑ I-797 approval notice available                                |
|                                                                   |
| Job Visa Requirements:                                            |
| Preferred: US Citizen, Green Card                                |
| Accepted: H1B (as stated in job posting)                         |
| ✓ ELIGIBLE - Consultant meets requirements                       |
|                                                                   |
+------------------------------------------------------------------+
| Submission Method                                                 |
+------------------------------------------------------------------+
| How will you submit to vendor? *                                  |
| ● Email to vendor contact                                        |
| ○ Vendor portal upload                                           |
| ○ Both (email + portal)                                          |
|                                                                   |
| Documents to Include:                                             |
| ☑ Consultant resume (Rajesh_Kumar_Java_2024.pdf)                 |
| ☑ Rate confirmation sheet                                        |
| ☐ Work authorization documents (send if requested)               |
| ☐ References (send if requested)                                 |
|                                                                   |
+------------------------------------------------------------------+
|                               [← Back]  [Next: Customize Resume →|
+------------------------------------------------------------------+
```

**Field Specification: Submission Rate**
| Property | Value |
|----------|-------|
| Field Name | `submissionRate` |
| Type | Currency Input |
| Prefix | "$" |
| Suffix | "/hr" |
| Required | Yes |
| Min Value | Consultant's rate + $1 |
| Max Value | Client budget max (if specified) |
| Precision | 2 decimal places |
| Validation | Must provide positive margin |
| AI Suggestion | Based on market data and client budget |

**Rate Setting Strategy:**

**Conservative Approach (Recommended for H1B):**
- Submit at lower end of range to increase acceptance odds
- Example: Client range $95-110, submit at $98-100

**Aggressive Approach (For Citizens/GC):**
- Submit at higher end to maximize margin
- Example: Client range $95-110, submit at $105-108

**Balanced Approach (Most Common):**
- Submit at midpoint of range
- Example: Client range $95-110, submit at $102-103

**User Action:** Set submission rate at $100/hr, verify visa info, select email method

**Time:** ~3 minutes

---

### Step 6: Customize Resume for Submission

**Screen State:**
```
+------------------------------------------------------------------+
|                    Customize Resume for Submission           [×] |
+------------------------------------------------------------------+
| Consultant: Rajesh Kumar                                          |
| Job: Senior Java Developer - Accenture Federal                   |
|                                                                   |
+------------------------------------------------------------------+
| Current Resume:  [Rajesh_Kumar_Java_2024.pdf           ] [View]  |
| Last Updated: 1 week ago                                          |
|                                                                   |
| Options:                                                          |
| ● Use current resume as-is (fastest)                             |
| ○ AI-optimize resume for this job (recommended)                  |
| ○ Create custom version manually                                 |
|                                                                   |
+------------------------------------------------------------------+
| [Option Selected: AI-Optimize]                                    |
|                                                                   |
| AI Resume Optimizer                               Powered by GPT-4|
+------------------------------------------------------------------+
| The AI will:                                                      |
| ✓ Reorder skills to match job requirements                       |
| ✓ Highlight relevant project experience                          |
| ✓ Add keywords from job description                              |
| ✓ Optimize for ATS scanning                                      |
| ✓ Tailor summary to Accenture Federal role                       |
| ✓ Keep factual accuracy (no fabrication)                         |
|                                                                   |
| Estimated time: 10 seconds                                        |
|                                                                   |
| [Generate Optimized Resume]                                       |
|                                                                   |
+------------------------------------------------------------------+
| [Processing... AI analyzing job description and resume...]        |
+------------------------------------------------------------------+
|                                                                   |
| ✓ Optimization Complete!                                          |
|                                                                   |
| Changes Made:                                                     |
| ✓ Added "Accenture Federal Services" context to summary          |
| ✓ Moved "Java 8+, Spring Boot, AWS" to top of skills             |
| ✓ Highlighted Meta microservices project (matches job needs)     |
| ✓ Added "Public Trust Clearance Eligible" statement              |
| ✓ Reworded summary to emphasize federal-adjacent experience      |
| ✓ Added "Immediate Availability" prominently                     |
|                                                                   |
| Keyword Match Score:                                              |
| Before: 72%  →  After: 94%  [+22% improvement]                   |
|                                                                   |
| Preview Optimized Resume:                                         |
| ┌────────────────────────────────────────────────────────────┐  |
| │ RAJESH KUMAR                                                │  |
| │ Senior Java Developer                                       │  |
| │ Washington, DC | rajesh.kumar@email.com | 555-234-5678      │  |
| │                                                             │  |
| │ PROFESSIONAL SUMMARY                                        │  |
| │ Senior Java Developer with 10+ years building enterprise   │  |
| │ applications for federal and commercial clients. Expertise  │  |
| │ in microservices architecture, AWS cloud solutions, and     │  |
| │ agile development. Recently completed 3-year engagement at  │  |
| │ Meta building scalable backend services. Immediate          │  |
| │ availability. Public Trust Clearance Eligible. H1B visa.    │  |
| │                                                             │  |
| │ TECHNICAL SKILLS                                            │  |
| │ Languages: Java 8/11/17, Spring Boot, Python                │  |
| │ Cloud: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes       │  |
| │ ...                                                         │  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| [Download PDF] [Preview Full Resume] [Edit Manually]             |
|                                                                   |
| ☑ Save this optimized version for future Accenture submissions   |
| ☐ Replace master resume with optimized version                   |
|                                                                   |
+------------------------------------------------------------------+
|                       [Use Original Resume]  [Use Optimized →]   |
+------------------------------------------------------------------+
```

**AI Resume Optimization Rules:**
1. **Never fabricate** - Only rearrange and reword existing facts
2. **Keyword matching** - Add relevant job keywords naturally
3. **Highlight relevant experience** - Bring matching projects to top
4. **ATS optimization** - Use standard formatting and keywords
5. **Federal compliance** - Add clearance eligibility, visa status
6. **Remove irrelevant** - De-emphasize non-matching skills/experience

**User Action:** Review AI changes, click "Use Optimized →"

**Time:** ~15 seconds AI generation + 1 minute review

---

### Step 7: Write Submission Pitch/Notes

**Screen State:**
```
+------------------------------------------------------------------+
|              Submission: Rajesh Kumar → Accenture Java Role      |
+------------------------------------------------------------------+
| [Step 1: Match Review] [Step 2: Details] [Step 3: Confirm]      |
+------------------------------------------------------------------+
|                                                                   |
| Submission Pitch & Notes                                          |
+------------------------------------------------------------------+
| This pitch will be sent to the vendor along with the resume.     |
| Make it compelling and highlight why Rajesh is perfect for the   |
| Accenture role.                                                  |
|                                                                   |
+------------------------------------------------------------------+
| Subject Line: *                                                   |
| [Submission: Senior Java Developer - Rajesh Kumar (H1B)       ]  |
|                                                                   |
| Email Body / Pitch: *                                             |
| [Hi Michael,                                                  ]  |
| [                                                             ]  |
| [I am submitting Rajesh Kumar for your Accenture Federal      ]  |
| [Senior Java Developer role. Rajesh is an excellent match:    ]  |
| [                                                             ]  |
| [✓ 10+ years Java development (exceeds 8+ requirement)        ]  |
| [✓ Expert in Spring Boot, Microservices, AWS                  ]  |
| [✓ Recent 3-year tenure at Meta building scalable backend     ]  |
| [✓ Public Trust Clearance Eligible                            ]  |
| [✓ Immediate availability                                     ]  |
| [✓ H1B transfer ready (all documentation available)           ]  |
| [                                                             ]  |
| [Highlights:                                                  ]  |
| [• Built microservices handling 10M+ requests/day at Meta     ]  |
| [• AWS Certified Solutions Architect (2023)                   ]  |
| [• Led migration from monolith to microservices               ]  |
| [• Strong communication and team collaboration skills         ]  |
| [                                                             ]  |
| [Rajesh is confirmed available for immediate start and is     ]  |
| [very interested in this Accenture opportunity. His rate is   ]  |
| [$100/hr, well within your budget.                            ]  |
| [                                                             ]  |
| [Resume attached. Happy to provide additional details or      ]  |
| [schedule an interview.                                       ]  |
| [                                                             ]  |
| [Best regards,                                                ]  |
| [{{your_signature}}                                           ]  |
| [                                                 ] 920/2000     |
|                                                                   |
| 💡 AI Suggestions:                                                |
| • Mention "Meta" prominently (brand name recognition)            |
| • Lead with clearance eligibility (important for federal work)   |
| • Emphasize "immediate availability" (reduces vendor risk)       |
| • Include specific metrics (10M+ requests/day)                   |
|                                                                   |
| [Apply AI Suggestions]                                            |
|                                                                   |
+------------------------------------------------------------------+
| Internal Notes (Not sent to vendor):                             |
| [Rajesh confirmed interested 12/2 10:30 AM. Willing to       ]  |
| [negotiate rate if needed. Prefers long-term contracts.      ]  |
| [Follow up if no response in 3 days.                         ]  |
| [                                                 ] 150/500      |
|                                                                   |
+------------------------------------------------------------------+
| Attachments:                                                      |
| ✓ Rajesh_Kumar_Java_Accenture_2024.pdf (248 KB) - Optimized     |
| ☑ Rate confirmation sheet (auto-generated)                       |
|                                                                   |
+------------------------------------------------------------------+
| Expected Timeline:                                                |
| Vendor response time: 2-3 business days (typical)                |
| Client interview: 5-7 days after vendor submission               |
| Decision: 10-14 days total                                       |
|                                                                   |
| Auto-create follow-up tasks:                                      |
| ☑ Follow up with vendor if no response in 3 days                 |
| ☑ Check in with Rajesh in 2 days (keep engagement)               |
| ☑ Escalate to manager if no response in 7 days                   |
|                                                                   |
+------------------------------------------------------------------+
|                               [← Back]  [Next: Review & Submit →|
+------------------------------------------------------------------+
```

**Field Specification: Email Pitch**
| Property | Value |
|----------|-------|
| Field Name | `submissionPitch` |
| Type | Textarea with rich text |
| Required | Yes |
| Min Length | 200 characters |
| Max Length | 2000 characters |
| Validation | Must include rate, availability, visa status |
| Template Variables | `{{consultant_name}}`, `{{job_title}}`, `{{your_signature}}` |

**Pitch Writing Best Practices:**

**DO:**
- ✅ Lead with strongest match points
- ✅ Quantify achievements (10M+ requests/day, 3 years, etc.)
- ✅ Mention brand names (Meta, AWS Certified, etc.)
- ✅ State rate clearly
- ✅ Confirm availability
- ✅ Address visa status upfront
- ✅ Keep professional and concise
- ✅ Include call-to-action

**DON'T:**
- ❌ Exaggerate or fabricate
- ❌ Write generic pitches
- ❌ Forget to mention visa status
- ❌ Use vague language ("good with Java")
- ❌ Write walls of text
- ❌ Miss the consultant's rate

**User Action:** Write pitch, add internal notes, click "Next: Review & Submit →"

**Time:** ~5 minutes

---

### Step 8: Final Review & Confirmation

**Screen State:**
```
+------------------------------------------------------------------+
|                     Final Submission Review                      |
+------------------------------------------------------------------+
| Review all details before submitting to vendor.                  |
| This cannot be undone once submitted.                            |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Details                                                |
+------------------------------------------------------------------+
| Name: Rajesh Kumar                                                |
| Title: Java Developer                                            |
| Rate: $85/hr (our cost)                                          |
| Visa: H1B (valid through 12/31/2026)                             |
| Availability: ✓ Confirmed immediate (verified 12/2 10:30 AM)     |
| Resume: Rajesh_Kumar_Java_Accenture_2024.pdf (AI-optimized)      |
|                                                                   |
+------------------------------------------------------------------+
| Job Details                                                       |
+------------------------------------------------------------------+
| Title: Senior Java Developer                                     |
| End Client: Accenture Federal Services                           |
| Location: Remote                                                  |
| Duration: 6-12 months                                            |
| Budget: $95-110/hr                                               |
| Visa: US Citizen/GC preferred, H1B considered                    |
|                                                                   |
+------------------------------------------------------------------+
| Vendor & Submission                                               |
+------------------------------------------------------------------+
| Vendor: TechStaff Solutions                                       |
| Contact: Michael Roberts (michael.roberts@techstaff.com)         |
| Submission Rate: $100/hr                                          |
| Method: Email                                                     |
|                                                                   |
+------------------------------------------------------------------+
| Financial Details                                                 |
+------------------------------------------------------------------+
| Consultant Rate (Cost): $85.00/hr                                |
| Submission Rate (Bill): $100.00/hr                               |
| Markup: $15.00/hr                                                |
| Markup %: 17.65%                                                 |
| Gross Margin: 15.00%                                             |
| ─────────────────────────────────────────────────────────────── |
| ✓ GOOD MARGIN - Within company target (12-20%)                   |
|                                                                   |
| If placed:                                                        |
| • Monthly Revenue: $17,600                                       |
| • Monthly Margin: $2,640                                         |
| • 6-month Revenue: $105,600                                      |
| • 6-month Margin: $15,840                                        |
| • Your Commission (est.): $1,584 (10% of margin)                 |
|                                                                   |
+------------------------------------------------------------------+
| Pre-Submission Checklist                                          |
+------------------------------------------------------------------+
| ✅ Consultant availability confirmed                              |
| ✅ Consultant interested in this specific role                    |
| ✅ Rate acceptable to consultant                                  |
| ✅ Visa eligibility verified                                      |
| ✅ Resume current and optimized                                   |
| ✅ Vendor contact information verified                            |
| ✅ Submission rate provides positive margin                       |
| ✅ Email pitch written and reviewed                               |
| ✅ All required documents attached                                |
|                                                                   |
+------------------------------------------------------------------+
| What happens after submission:                                    |
| 1. Email sent to vendor contact immediately                      |
| 2. Submission status set to "Submitted to Vendor"                |
| 3. Consultant notified of submission                             |
| 4. Follow-up task created (3 days)                               |
| 5. Bench metrics updated (submission count)                      |
| 6. Manager notified of submission                                |
| 7. Activity logged for audit trail                               |
|                                                                   |
+------------------------------------------------------------------+
| Send Now Options:                                                 |
| ● Send immediately                                               |
| ○ Schedule send: [Date/Time picker]                             |
|                                                                   |
| Notification Preferences:                                         |
| ☑ Notify consultant (email confirming submission)                |
| ☑ Notify manager (for visibility)                                |
| ☑ Create follow-up tasks                                         |
|                                                                   |
+------------------------------------------------------------------+
|                          [← Back to Edit]  [🚀 Submit Now!]      |
+------------------------------------------------------------------+
```

**User Action:** Review all details, click "🚀 Submit Now!"

**Time:** ~2 minutes review

---

### Step 9: Submit & Confirmation

**User Action:** Click "🚀 Submit Now!"

**System Processing (Sequential):**

1. **Create Bench Submission Record:**
```typescript
const submission = await db.insert(benchSubmissions).values({
  id: generateId(),
  orgId: currentOrgId,
  externalJobId: selectedJobId,
  candidateId: consultantId,
  status: 'submitted_to_vendor',
  submittedBy: currentUserId,
  submittedAt: new Date(),
  submissionNotes: pitchText,
  vendorName: 'TechStaff Solutions',
  vendorContactName: 'Michael Roberts',
  vendorContactEmail: 'michael.roberts@techstaff.com',
  benchRepId: currentUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

2. **Send Email to Vendor:**
```typescript
await sendEmail({
  to: 'michael.roberts@techstaff.com',
  from: currentUserEmail,
  subject: 'Submission: Senior Java Developer - Rajesh Kumar (H1B)',
  body: submissionPitch,
  attachments: [
    { filename: 'Rajesh_Kumar_Java_Accenture_2024.pdf', content: resumePDF },
    { filename: 'Rate_Confirmation.pdf', content: rateSheetPDF }
  ],
  trackOpens: true,
  trackClicks: true,
  metadata: {
    submissionId: submission.id,
    type: 'bench_submission'
  }
});
```

3. **Update Consultant Bench Metadata:**
```sql
UPDATE bench_metadata
SET last_outreach_date = NOW(),
    updated_at = NOW()
WHERE user_id = consultant_id;
```

4. **Update External Job Stats:**
```sql
UPDATE external_jobs
SET submission_count = submission_count + 1,
    updated_at = NOW()
WHERE id = external_job_id;
```

5. **Notify Consultant:**
```typescript
await sendEmail({
  to: consultantEmail,
  subject: 'Submission Update: Accenture Federal - Senior Java Developer',
  template: 'consultant_submission_confirmation',
  data: {
    consultantName: 'Rajesh Kumar',
    jobTitle: 'Senior Java Developer',
    clientName: 'Accenture Federal Services',
    vendorName: 'TechStaff Solutions',
    recruiterName: currentUserName,
    recruiterPhone: currentUserPhone,
    nextSteps: [
      'Vendor will review your profile within 2-3 business days',
      'If selected, vendor will schedule client interview',
      'I will keep you updated on all progress',
      'Please confirm you remain available and interested'
    ]
  }
});
```

6. **Notify Manager:**
```typescript
await createNotification({
  userId: managerId,
  type: 'bench_submission_created',
  title: 'New Bench Submission',
  message: `${currentUserName} submitted ${consultantName} for ${jobTitle} at ${clientName} via ${vendorName}`,
  link: `/employee/workspace/bench/submissions/${submission.id}`,
  priority: 'normal'
});
```

7. **Create Follow-up Tasks:**
```typescript
const tasks = [
  {
    title: 'Follow up with TechStaff Solutions on Rajesh submission',
    dueDate: addDays(new Date(), 3),
    priority: 'high',
    assignedTo: currentUserId,
    relatedEntity: 'bench_submission',
    relatedEntityId: submission.id
  },
  {
    title: 'Check in with Rajesh - keep engagement',
    dueDate: addDays(new Date(), 2),
    priority: 'medium',
    assignedTo: currentUserId,
    relatedEntity: 'bench_consultant',
    relatedEntityId: consultantId
  },
  {
    title: 'Escalate Rajesh submission if no vendor response',
    dueDate: addDays(new Date(), 7),
    priority: 'high',
    assignedTo: currentUserId,
    relatedEntity: 'bench_submission',
    relatedEntityId: submission.id
  }
];

for (const task of tasks) {
  await db.insert(activities).values({
    orgId: currentOrgId,
    entityType: task.relatedEntity,
    entityId: task.relatedEntityId,
    activityType: 'task',
    title: task.title,
    dueDate: task.dueDate,
    priority: task.priority,
    status: 'pending',
    assignedTo: task.assignedTo,
    createdBy: currentUserId
  });
}
```

8. **Update Bench Metrics:**
```typescript
// Update recruiter's bench sales metrics
await db.insert(benchRecruiterMetrics).values({
  recruiterId: currentUserId,
  period: getCurrentPeriod(), // e.g., "2024-Q4-W48"
  submissionsCount: sql`COALESCE((SELECT submissions_count FROM bench_recruiter_metrics WHERE recruiter_id = ${currentUserId} AND period = ${period}), 0) + 1`,
  updatedAt: new Date()
}).onConflictDoUpdate({
  target: [benchRecruiterMetrics.recruiterId, benchRecruiterMetrics.period],
  set: {
    submissionsCount: sql`bench_recruiter_metrics.submissions_count + 1`,
    updatedAt: new Date()
  }
});
```

9. **Log Activity:**
```typescript
await db.insert(activityLog).values({
  orgId: currentOrgId,
  entityType: 'bench_submission',
  entityId: submission.id,
  activityType: 'submission_created',
  description: `Bench submission: ${consultantName} → ${jobTitle} (${clientName}) via ${vendorName}`,
  metadata: {
    consultantId,
    externalJobId,
    vendorName,
    submissionRate: 100.00,
    consultantRate: 85.00,
    margin: 15.00,
    marginPercent: 15.00
  },
  createdBy: currentUserId,
  createdAt: new Date()
});
```

**System Response:**
- Success animation (checkmark, 1s)
- Confirmation modal displays
- Email sent confirmation
- Redirects to submission detail page

**Screen State (Success):**
```
+------------------------------------------------------------------+
|                                                                   |
|                          ✓ SUBMITTED!                            |
|                                                                   |
|          Rajesh Kumar submitted to TechStaff Solutions           |
|               for Accenture Federal Java Role                    |
|                                                                   |
|                   Submission ID: BS-2024-1247                    |
|                                                                   |
|  ✓ Email sent to Michael Roberts                                 |
|  ✓ Rajesh notified                                               |
|  ✓ Follow-up tasks created                                       |
|  ✓ Manager notified                                              |
|  ✓ Bench metrics updated                                         |
|                                                                   |
|  Next Steps:                                                      |
|  • Vendor typically responds in 2-3 business days                |
|  • Follow up scheduled for 12/5/24                               |
|  • Check in with Rajesh on 12/4/24                               |
|                                                                   |
|                                                                   |
|        [View Submission]  [Submit Another]  [Dashboard]          |
|                                                                   |
+------------------------------------------------------------------+
```

**Time:** ~5 seconds processing

---

### Step 10: Track Submission Status

**User Action:** Click "View Submission"

**Screen State (Submission Detail):**
```
+------------------------------------------------------------------+
| ← Back to Submissions    BS-2024-1247: Rajesh → Accenture  [⋮]  |
+------------------------------------------------------------------+
| Status: 📧 Submitted to Vendor              Submitted: 12/2 11am |
| Next Action: Follow up 12/5                                      |
+------------------------------------------------------------------+
|                                                                   |
| Submission Summary                                                |
+------------------------------------------------------------------+
| Consultant:        Rajesh Kumar (Java Developer)                 |
| Rate:              $85/hr (cost) → $100/hr (bill)                |
| Margin:            $15/hr (15%) ✓ Good                           |
| Visa:              H1B (valid through 12/31/2026)                |
|                                                                   |
| Job:               Senior Java Developer                         |
| End Client:        Accenture Federal Services                    |
| Location:          Remote                                         |
| Duration:          6-12 months                                   |
|                                                                   |
| Vendor:            TechStaff Solutions                           |
| Contact:           Michael Roberts                               |
| Email:             michael.roberts@techstaff.com                 |
|                                                                   |
+------------------------------------------------------------------+
| Engagement Tracking                                               |
+------------------------------------------------------------------+
| Email Status:      ✓ Delivered (12/2 11:05 AM)                   |
| Opened:            ✓ Yes (12/2 2:15 PM) - First open             |
|                    → Opened 2 times total                         |
| Attachments:       ✓ Resume downloaded (12/2 2:16 PM)            |
| Links Clicked:     - None yet                                    |
| Response:          ⏳ Awaiting response                           |
|                                                                   |
+------------------------------------------------------------------+
| Timeline                                                          |
+------------------------------------------------------------------+
| 12/2 11:05 AM  Submission sent to vendor                         |
|                Email delivered ✓                                  |
|                                                                   |
| 12/2 2:15 PM   Email opened by vendor                            |
|                Good sign - reviewing within 3 hours! ✓            |
|                                                                   |
| 12/2 2:16 PM   Resume downloaded                                 |
|                Vendor is actively reviewing ✓                     |
|                                                                   |
| ⏳ PENDING     Awaiting vendor response...                        |
|                Expected: Within 2-3 business days                 |
|                                                                   |
+------------------------------------------------------------------+
| Quick Actions                                                     |
+------------------------------------------------------------------+
| [📧 Follow Up with Vendor]  [📞 Call Vendor]  [💬 Email Rajesh] |
| [📝 Add Note]  [🔄 Update Status]  [📅 Schedule Interview]      |
|                                                                   |
+------------------------------------------------------------------+
| Internal Notes                                                    |
+------------------------------------------------------------------+
| 12/2 11:00 AM - Submission created                               |
| Rajesh confirmed interested 12/2 10:30 AM. Very excited about    |
| Accenture opportunity. Willing to negotiate rate if needed.      |
|                                                                   |
| [Add Note...]                                                     |
|                                                                   |
+------------------------------------------------------------------+
| Documents                                                         |
+------------------------------------------------------------------+
| • Rajesh_Kumar_Java_Accenture_2024.pdf (248 KB)                  |
| • Rate_Confirmation.pdf (85 KB)                                  |
| • Submission_Email.pdf (archived copy)                           |
|                                                                   |
+------------------------------------------------------------------+
```

**Status Flow:**
```
submitted_to_vendor → vendor_review → vendor_shortlisted →
client_interview → client_offered → placed

Alternative outcomes:
→ vendor_rejected
→ candidate_withdrew
→ client_rejected
```

**Time:** Ongoing tracking

---

## Postconditions

1. ✅ Bench submission record created in `bench_submissions` table
2. ✅ Submission status = "submitted_to_vendor"
3. ✅ Email sent to vendor contact with resume and pitch
4. ✅ Email tracking enabled (opens, downloads, clicks)
5. ✅ Consultant notified of submission via email
6. ✅ Manager notified for visibility
7. ✅ 3 follow-up tasks created (3-day, 2-day, 7-day)
8. ✅ Bench metadata updated (`lastOutreachDate`)
9. ✅ External job submission count incremented
10. ✅ Bench recruiter metrics updated (+1 submission)
11. ✅ Activity logged for audit trail
12. ✅ Documents stored in file storage
13. ✅ Resume optimized and saved
14. ✅ Rate margin validated (must be positive)
15. ✅ Consultant availability confirmed and documented

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `bench_submission.created` | `{ submission_id, consultant_id, external_job_id, vendor_name, submission_rate, consultant_rate, margin, submitted_by }` | System |
| `bench_submission.email_sent` | `{ submission_id, vendor_email, sent_at }` | System |
| `bench_submission.email_opened` | `{ submission_id, opened_at, open_count }` | Recruiter |
| `bench_submission.resume_downloaded` | `{ submission_id, downloaded_at }` | Recruiter |
| `bench_consultant.marketed` | `{ consultant_id, submission_id, marketed_at }` | System |
| `bench_metrics.updated` | `{ recruiter_id, submissions_count, period }` | Manager |
| `notification.sent` | See step 9 | Consultant, Manager |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Consultant Unavailable | Consultant status ≠ "available" | "This consultant is not currently on bench" | Select different consultant |
| Duplicate Submission | Same consultant already submitted to this job | "Rajesh has already been submitted to this job on 11/28. View existing submission?" | View or cancel previous |
| Negative Margin | Submission rate ≤ Consultant rate | "Submission rate must be higher than consultant rate ($85/hr)" | Adjust submission rate |
| Visa Mismatch | Consultant visa doesn't meet job requirements | "⚠️ Warning: Job requires US Citizen but consultant is H1B. Submit anyway?" | Confirm override or cancel |
| Missing Resume | Consultant has no resume uploaded | "Cannot submit: Consultant has no resume on file" | Upload resume first |
| Outdated Resume | Resume older than 30 days | "⚠️ Warning: Resume is 45 days old. Consider updating before submission." | Update or proceed anyway |
| Rate Out of Range | Submission rate > Client budget max | "⚠️ Warning: Your rate ($115/hr) exceeds client budget ($110/hr max)" | Adjust rate or proceed |
| Vendor Contact Missing | No contact info for vendor | "Cannot submit: Vendor contact information is missing" | Add vendor contact |
| Consultant Not Contacted | No recent contact confirmation | "⚠️ Warning: Consultant hasn't been contacted in 7 days. Confirm availability first." | Contact consultant |
| Email Send Failed | SMTP error or network issue | "Failed to send submission email. Please try again." | Retry submission |
| Permission Denied | User lacks submission permission | "You don't have permission to submit consultants" | Contact admin |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Cmd+K` | Open consultant/job quick search |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd+Enter` | Submit (if on final screen) |
| `Cmd+S` | Save draft (future enhancement) |
| `Esc` | Close modal (with confirmation if data entered) |
| `Cmd+B` | Bold text in pitch editor |
| `Cmd+I` | Italic text in pitch editor |

---

## Alternative Flows

### A1: Bulk Submission (Multiple Consultants for One Job)

**Trigger:** Vendor sends urgent requirement, needs multiple candidates

**Flow:**
1. Start with job selection
2. Select multiple consultants (instead of one)
3. System creates separate submission for each
4. Each gets optimized resume
5. All sent in batch to vendor
6. Individual tracking for each submission

**Best Practices:**
- Maximum 3-5 consultants per job (avoid overwhelming vendor)
- Ensure diversity (different skill levels, backgrounds)
- Rank consultants (best match first)
- Stagger submissions by 30 minutes (avoid spam perception)

### A2: Vendor Portal Submission (Instead of Email)

**Trigger:** Vendor requires portal submission, email not accepted

**Flow:**
1. Select submission method: "Vendor Portal Upload"
2. System opens vendor portal in iframe or new window
3. Provide manual upload instructions
4. User uploads resume and fills portal form
5. User copies submission ID from portal
6. User returns to InTime and enters portal submission ID
7. System marks as "submitted_to_vendor_portal"
8. Manual tracking only (no email open/download tracking)

### A3: Direct Client Submission (Bypass Vendor)

**Trigger:** Existing client relationship, submit directly (rare for bench sales)

**Flow:**
1. Select external job type: "Direct Client"
2. No vendor required
3. Submission goes directly to client contact
4. Higher margin potential (no vendor cut)
5. Follow standard submission flow but with client info instead of vendor

### A4: Rush Submission (Urgent Requirement)

**Trigger:** Vendor says "Need resume in 1 hour for interview tomorrow"

**Flow:**
1. Click "⚡ Rush Submission" mode
2. Pre-fill with reasonable defaults
3. Skip AI optimization (use current resume)
4. Minimal pitch (template-based)
5. Send immediately (no scheduling)
6. Notify consultant via SMS + email
7. Flag submission as "urgent" for priority tracking
8. Manager auto-notified

### A5: Multi-Vendor Submission (Same Consultant, Multiple Jobs)

**Trigger:** Consultant has broad skills, multiple matching jobs from different vendors

**Flow:**
1. Select consultant first
2. View "Matching Jobs" (AI-powered)
3. Select multiple jobs from list (up to 5)
4. System creates separate submission for each job
5. Each vendor gets customized pitch
6. Each gets optimized resume for specific job
7. Prevent conflicts: System checks if jobs are for same end client
8. If same client via different vendors → warn user and require confirmation

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Consultant | Required, must be on bench | "Please select a consultant" |
| External Job | Required, must be active | "Please select an active job" |
| Submission Rate | Required, must be > consultant rate | "Submission rate must be higher than consultant rate" |
| Visa Status | Required | "Visa status is required" |
| Vendor Contact | Required, must have email | "Vendor contact email is required" |
| Resume | Required, must exist | "Consultant must have a resume on file" |
| Availability | Must be confirmed within last 5 days | "Please confirm consultant availability before submitting" |
| Email Pitch | Required, min 200 chars | "Pitch is too short (minimum 200 characters)" |
| Verification Notes | Required if not contacted in 3 days | "Please document recent availability confirmation" |

---

## Business Rules

### Submission Frequency
- **Per Consultant**: Maximum 3 submissions per week (avoid over-exposure)
- **Per Job**: Maximum 5 consultants per job (avoid vendor spam)
- **Per Vendor**: Maximum 10 submissions per week to same vendor
- **Cooldown Period**: 30 days between resubmitting same consultant to same vendor

### Rate Guidelines
- **Minimum Margin**: 10% gross margin (company policy)
- **Target Margin**: 15-20% gross margin
- **Maximum Markup**: 30% markup over consultant rate
- **Currency Alignment**: Consultant and submission must be same currency

### Consultant Eligibility
- ✅ On bench status = "available"
- ✅ Resume current (<30 days) or updated within last week
- ✅ Contacted within last 5 days (confirmed available)
- ✅ Visa valid for at least 90 days
- ✅ Not already submitted to this job
- ✅ Not submitted to same vendor in last 7 days
- ❌ Profile incomplete
- ❌ Unresponsive (no contact in >10 days)
- ❌ On notice period or pending placement

### Visa Eligibility Matrix

| Job Requires | Consultant Has | Eligible? | Notes |
|--------------|----------------|-----------|-------|
| US Citizen | US Citizen | ✅ Yes | Perfect match |
| US Citizen | Green Card | ⚠️ Maybe | Submit with caveat |
| US Citizen | H1B | ❌ No | Do not submit unless job says "considered" |
| US Citizen or GC | Green Card | ✅ Yes | Perfect match |
| US Citizen or GC | H1B | ⚠️ Maybe | Submit if job says "H1B considered" |
| Any (Work Auth) | H1B | ✅ Yes | Perfect match |
| Any (Work Auth) | OPT | ⚠️ Maybe | Check duration alignment |
| Any (Work Auth) | EAD | ✅ Yes | Perfect match |
| Clearance Required | Any | ⚠️ Check | Verify clearance eligibility |

### International Considerations

**Multi-Currency Submissions:**
- Consultant in India: INR rate
- Job in USA: USD budget
- System converts: INR → USD using current exchange rate
- Display both currencies in submission
- Lock exchange rate at time of submission

**Example:**
```
Consultant Rate: ₹6,000/hr INR (≈ $72/hr USD at 1 USD = 83 INR)
Job Budget: $95-110/hr USD
Submission Rate: $95/hr USD
Margin: $23/hr USD (31.9% markup)
```

**Timezone Handling:**
- Consultant in India: IST (UTC+5:30)
- Vendor in USA: EST (UTC-5)
- Interview scheduling must account for 10.5 hour difference
- Suggest interview times in both timezones
- Auto-convert in notifications

---

## Commission Calculation (If Placed)

### Bench Sales Commission Structure

Unlike regular recruiting (placement-based), bench sales uses margin-based commission:

```typescript
// If placement occurs
const monthlyBillRate = submissionRate * 176; // 176 hours/month
const monthlyPayRate = consultantRate * 176;
const monthlyMargin = monthlyBillRate - monthlyPayRate;

// Bench sales commission tiers (different from recruiting)
let commissionRate = 0.08; // Default: 8% of margin

if (grossMarginPercent >= 25) commissionRate = 0.12; // Tier 3
else if (grossMarginPercent >= 18) commissionRate = 0.10; // Tier 2
else if (grossMarginPercent >= 12) commissionRate = 0.08; // Tier 1

const monthlyCommission = monthlyMargin * commissionRate;

// Example: Rajesh placement
// Bill: $100/hr → $17,600/month
// Pay: $85/hr → $14,960/month
// Margin: $15/hr → $2,640/month
// Commission: $2,640 * 0.10 = $264/month

// 6-month contract commission: $264 * 6 = $1,584 total
```

**Commission Tiers:**

| Tier | Gross Margin % | Commission Rate | Example (on $2,640 margin) |
|------|----------------|-----------------|----------------------------|
| Tier 1 | 12-17.99% | 8% of margin | $211/month |
| Tier 2 | 18-24.99% | 10% of margin | $264/month |
| Tier 3 | 25%+ | 12% of margin | $317/month |

**Payment Schedule:**
- Commission paid monthly after consultant is paid
- First commission: After 1 month of work + payment received
- Ongoing: Monthly as long as consultant is working
- Clawback: If consultant leaves before 3 months, commission prorated

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Submissions per Week | 3-5 per recruiter | Weekly count |
| Vendor Response Rate | >40% | Responses / Submissions |
| Interview Conversion | >25% | Interviews / Submissions |
| Placement Conversion | >12% | Placements / Submissions |
| Average Margin | 15-18% | Avg gross margin across all submissions |
| Average Days to Response | <3 days | Avg time from submission to vendor response |
| Consultant Reuse Rate | >50% | % of consultants submitted multiple times |
| Vendor Engagement | >60% | % of vendors who open emails |

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [03-market-consultant.md](./03-market-consultant.md) - Creating hotlists to generate leads
- [04-find-requirements.md](./04-find-requirements.md) - Finding external jobs
- [06-interview-coordination.md](./06-interview-coordination.md) - Scheduling vendor/client interviews (future)
- [07-bench-placement.md](./07-bench-placement.md) - Recording successful placement (future)

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Submit consultant with all required fields | Submission created, email sent, notifications sent |
| TC-002 | Submit without consultant availability confirmation | Warning: "Please confirm availability first" |
| TC-003 | Submit with negative margin | Error: "Submission rate must be higher than consultant rate" |
| TC-004 | Submit consultant already submitted to same job | Error: "Duplicate submission detected" |
| TC-005 | Submit H1B consultant to "US Citizen only" job | Warning: "Visa mismatch - submit anyway?" |
| TC-006 | Submit with submission rate > client budget max | Warning: "Rate exceeds client budget" |
| TC-007 | Submit consultant with resume >30 days old | Warning: "Resume is outdated - update first?" |
| TC-008 | Submit via vendor portal (not email) | Submission created, portal submission ID recorded |
| TC-009 | AI resume optimization | Resume optimized, keyword match improved >20% |
| TC-010 | Bulk submission (3 consultants to 1 job) | 3 separate submissions created, staggered emails |
| TC-011 | Submission with INR consultant to USD job | Currency converted, both rates displayed |
| TC-012 | Email tracking (opens, downloads) | Events logged correctly when vendor opens/downloads |
| TC-013 | Follow-up task creation | 3 tasks created with correct due dates |
| TC-014 | Manager notification | Manager receives notification with submission details |
| TC-015 | Consultant notification | Consultant receives confirmation email |
| TC-016 | Bench metrics update | Submission count incremented for recruiter and period |

---

## UI/UX Specifications

### AI Match Score Visualization

**Color Coding:**
- 🟢 Green (90-100): Excellent Match - Submit immediately
- 🟡 Yellow (75-89): Good Match - Review and submit
- 🟠 Orange (60-74): Fair Match - Consider carefully
- 🔴 Red (<60): Poor Match - Not recommended

**Progress Bars:**
- Use gradient fills
- Animate on load (0 → score over 1 second)
- Show percentage label at end of bar

### Rate Calculator

**Real-time Margin Display:**
- Updates as user types submission rate
- Color-coded margin indicator:
  - Green: 15-25% (target range)
  - Yellow: 10-14% (acceptable)
  - Red: <10% (below minimum)
  - Orange: >25% (may be too high for competitive win)

**Margin Calculation Card:**
```
┌─────────────────────────────────────┐
│ Margin Analysis                     │
├─────────────────────────────────────┤
│ Consultant Rate: $85/hr             │
│ Submission Rate: $100/hr            │
│ ─────────────────────────────────── │
│ Markup: $15/hr                      │
│ Markup %: 17.65%                    │
│ Gross Margin: 15.00%                │
│ Status: ✓ GOOD (target: 12-20%)    │
│ ─────────────────────────────────── │
│ If placed (6 months):               │
│ Total Revenue: $105,600             │
│ Total Margin: $15,840               │
│ Your Commission: $1,584 (est.)      │
└─────────────────────────────────────┘
```

### Email Tracking Indicators

**Visual Timeline:**
```
12/2 11:05 AM  📧 Sent
               └─ Delivered ✓

12/2 2:15 PM   👁️ Opened (1st time)
               └─ Vendor is reviewing

12/2 2:16 PM   📥 Resume Downloaded
               └─ Active review in progress

⏳ Pending     Awaiting response...
               Typical: 2-3 business days
```

---

## Database Schema Reference

**Bench Submissions Table:**
```sql
CREATE TABLE bench_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  external_job_id UUID NOT NULL REFERENCES external_jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Workflow
  status TEXT NOT NULL DEFAULT 'identified',
  -- 'identified', 'contacted_candidate', 'candidate_interested',
  -- 'submitted_to_vendor', 'vendor_review', 'interview',
  -- 'offered', 'placed', 'rejected'

  -- Submission
  submitted_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMPTZ,
  submission_notes TEXT,

  -- Vendor
  vendor_name TEXT,
  vendor_contact_name TEXT,
  vendor_contact_email TEXT,
  vendor_submission_id TEXT,
  vendor_feedback TEXT,

  -- Rates (stored in consultant's currency)
  consultant_rate NUMERIC(10, 2),
  submission_rate NUMERIC(10, 2),
  margin_amount NUMERIC(10, 2),
  margin_percentage NUMERIC(5, 2),
  currency TEXT DEFAULT 'USD',

  -- Verification
  availability_confirmed BOOLEAN DEFAULT false,
  availability_confirmed_at TIMESTAMPTZ,
  availability_notes TEXT,

  -- Interview
  interview_date TIMESTAMPTZ,
  interview_feedback TEXT,

  -- Outcome
  placed_at TIMESTAMPTZ,
  placement_start_date DATE,
  placement_bill_rate NUMERIC(10, 2),

  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Assignment
  bench_rep_id UUID REFERENCES user_profiles(id),

  -- Tracking
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  email_open_count INTEGER DEFAULT 0,
  resume_downloaded_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(external_job_id, candidate_id)
);
```

---

## Email Template: Vendor Submission

**Subject:** Submission: {{job_title}} - {{consultant_name}} ({{visa_status}})

**Body:**
```
Hi {{vendor_contact_name}},

I am submitting {{consultant_name}} for your {{end_client_name}} {{job_title}} role. {{consultant_name}} is an excellent match:

✓ {{years_experience}}+ years {{primary_skill}} development ({{requirement_comparison}})
✓ Expert in {{skill_list}}
✓ Recent {{tenure_length}} tenure at {{last_company}} {{doing_what}}
✓ {{clearance_or_location_fit}}
✓ Immediate availability
✓ {{visa_status}} ({{visa_details}})

Highlights:
{{#highlights}}
• {{highlight_text}}
{{/highlights}}

{{consultant_name}} is confirmed available for immediate start and is very interested in this {{end_client_name}} opportunity. Rate is ${{submission_rate}}/hr, well within your budget.

Resume attached. Happy to provide additional details or schedule an interview.

Best regards,
{{your_signature}}
```

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
