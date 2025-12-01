# UC-TA-008: Internal Hiring Workflow

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** TA Specialist
**Status:** Approved

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-TA-008 |
| Actor | TA Specialist |
| Goal | Manage end-to-end internal hiring for InTime positions |
| Frequency | 2-3 times per month |
| Estimated Time | 5-8 hours per position (full cycle) |
| Priority | High |

---

## Actors

- **Primary:** TA Specialist
- **Secondary:** Hiring Manager, HR Manager, TA Manager, CEO (for senior roles)
- **System:** ATS (internal jobs module), CRM, Email, Calendar, DocuSign

---

## Preconditions

1. User is logged in as TA Specialist
2. User has "internal_job.create" and "internal_hiring.manage" permissions
3. Hiring requisition approved by manager
4. Budget confirmed by Finance
5. Job description template available

---

## Trigger

One of the following:
- Hiring manager requests new position
- Business growth requires new role
- Replacement for departing employee
- Organizational restructuring
- New department/team formation

---

## Main Flow: Internal Position Hiring

### Step 1: Receive Hiring Request

**User Action:** Navigate to `/employee/workspace/internal-hiring` or receive notification

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Internal Hiring Pipeline                    [+ New Position] │
├──────────────────────────────────────────────────────────────┤
│ Requisitions │ Active Jobs │ Interviews │ Offers │ Onboarding│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 📊 HIRING DASHBOARD                                           │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│ │ Requisitions│ Active Jobs │  Interviews │    Offers   │    │
│ │      3      │      5      │      8      │      2      │    │
│ │  +1 week    │  +2 week    │  +3 week    │  This week  │    │
│ └─────────────┴─────────────┴─────────────┴─────────────┘    │
│                                                               │
│ 🎯 PRIORITY ACTIONS                                           │
│ → 2 offers awaiting candidate response                       │
│ → 3 final interviews scheduled this week                     │
│ → 1 requisition needs job posting (Tech Recruiter)           │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 📋 NEW HIRING REQUISITION                                │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Position: Technical Recruiter                             │ │
│ │ Department: Recruiting                                    │ │
│ │ Hiring Manager: Sarah Jones (Recruiting Manager)          │ │
│ │ Headcount: 2 positions                                    │ │
│ │ Start Date Target: April 1, 2025                          │ │
│ │ Budget: $60K-$75K + commission                            │ │
│ │ Status: Approved by COO                                   │ │
│ │ Requisition Date: Feb 10, 2025                            │ │
│ │                                                           │ │
│ │ Manager Notes:                                            │ │
│ │ "We need 2 recruiters to support growth. Looking for     │ │
│ │  1-3 years experience in tech staffing. Must be able to  │ │
│ │  handle full-cycle recruiting. Strong sourcing skills    │ │
│ │  preferred."                                              │ │
│ │                                                           │ │
│ │ [Create Job Posting]  [Schedule Kickoff]  [View Details] │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 2 minutes

---

### Step 2: Kickoff Call with Hiring Manager

**User Action:** Click "Schedule Kickoff"

**Kickoff Meeting Agenda (30 min):**

```
┌──────────────────────────────────────────────────────────────┐
│ INTERNAL HIRING KICKOFF CALL                                 │
│ Position: Technical Recruiter (2 openings)                   │
│ Hiring Manager: Sarah Jones                                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. POSITION OVERVIEW (5 min)                                  │
│    □ Why is this role critical now?                          │
│    □ What problem does this solve?                           │
│    □ How does this fit team structure?                       │
│    □ Growth trajectory for this role?                        │
│                                                               │
│ 2. IDEAL CANDIDATE PROFILE (10 min)                           │
│    Must-Have:                                                 │
│    □ Years of experience: [1-3 years]                        │
│    □ Industry: [Tech staffing, IT recruiting]                │
│    □ Skills: [Full-cycle recruiting, sourcing, ATS]          │
│    □ Education: [Bachelor's preferred, not required]         │
│    □ Location: [Remote US, prefer EST timezone]              │
│                                                               │
│    Nice-to-Have:                                              │
│    □ Tech stack knowledge (Java, Python, Cloud)              │
│    □ Previous startup experience                             │
│    □ Sales/BD background                                     │
│    □ LinkedIn Recruiter certification                        │
│                                                               │
│ 3. COMPENSATION (5 min)                                       │
│    Base Salary: [$60K-$75K]                                  │
│    Commission: [Yes - $500-$1500 per placement]              │
│    Benefits: [Standard InTime package]                       │
│    Equity: [Stock options after 1 year]                      │
│    Total Comp: [$75K-$100K OTE]                              │
│                                                               │
│ 4. INTERVIEW PROCESS (5 min)                                  │
│    Stage 1: TA Specialist phone screen (30 min)             │
│    Stage 2: Hiring Manager interview (45 min)               │
│    Stage 3: Peer interviews (2 recruiters, 30 min each)     │
│    Stage 4: Final interview with COO (30 min)               │
│    Timeline: Offer within 2 weeks of application            │
│                                                               │
│ 5. SOURCING STRATEGY (3 min)                                  │
│    □ LinkedIn job posting                                    │
│    □ Indeed/Glassdoor                                        │
│    □ LinkedIn Recruiter outbound sourcing                    │
│    □ Employee referrals ($1,500 bonus)                       │
│    □ Recruiting networks/communities                         │
│                                                               │
│ 6. TIMELINE & URGENCY (2 min)                                 │
│    Target Offer Date: [March 1, 2025]                       │
│    Target Start Date: [April 1, 2025]                       │
│    Urgency: High (current team overloaded)                   │
│                                                               │
│ [Save Notes]  [Create Job Description]                       │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 30 minutes

---

### Step 3: Create Internal Job Posting

**User Action:** Click "Create Job Posting"

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Create Internal Job Posting                             [×]  │
├──────────────────────────────────────────────────────────────┤
│ Step 1 of 3: Basic Information                               │
│                                                               │
│ Job Title: *                                                  │
│ [Technical Recruiter                                      ]  │
│                                                               │
│ Department: *                                                 │
│ [Recruiting                                               ▼] │
│                                                               │
│ Hiring Manager: *                                             │
│ [Sarah Jones - Recruiting Manager                         ▼] │
│                                                               │
│ Number of Openings: *                                         │
│ [2  ]                                                         │
│                                                               │
│ Employment Type: *                                            │
│ ● Full-Time  ○ Part-Time  ○ Contract                        │
│                                                               │
│ Location: *                                                   │
│ ● Remote (US)                                                │
│ ○ Hybrid (Office: [San Francisco, CA        ])              │
│ ○ On-site (Office: [                        ])              │
│                                                               │
│ Work Authorization Required: *                                │
│ ☑ US Work Authorization (USC, GC, EAD)                       │
│                                                               │
│ [Cancel]                            [Next: Compensation →]    │
└──────────────────────────────────────────────────────────────┘
```

**Step 2: Compensation**

```
┌──────────────────────────────────────────────────────────────┐
│ Create Internal Job Posting                             [×]  │
├──────────────────────────────────────────────────────────────┤
│ Step 2 of 3: Compensation & Benefits                         │
│                                                               │
│ Salary Range: *                                               │
│ Min: [$60,000  ] Max: [$75,000  ] Currency: [USD         ▼] │
│                                                               │
│ Salary Type: *                                                │
│ ● Annual  ○ Hourly                                           │
│                                                               │
│ Commission Plan:                                              │
│ ☑ Yes - Commission eligible                                  │
│ Commission Structure:                                         │
│ [Placement-based: $500-$1500 per successful placement    ]   │
│                                                               │
│ On-Target Earnings (OTE):                                     │
│ [$85,000 - $100,000]                                         │
│                                                               │
│ Benefits Included:                                            │
│ ☑ Health Insurance (Medical, Dental, Vision)                 │
│ ☑ 401(k) with 4% company match                               │
│ ☑ Unlimited PTO                                               │
│ ☑ Remote work stipend ($500/year)                            │
│ ☑ Professional development budget ($1,000/year)              │
│ ☑ Stock options (after 1 year)                               │
│                                                               │
│ Bonus/Incentives:                                             │
│ ☑ Annual performance bonus (5-10% of base)                   │
│ ☑ Referral bonus program ($1,500 per hire)                   │
│                                                               │
│ [◀ Back]                    [Next: Job Description →]        │
└──────────────────────────────────────────────────────────────┘
```

**Step 3: Job Description**

```
┌──────────────────────────────────────────────────────────────┐
│ Create Internal Job Posting                             [×]  │
├──────────────────────────────────────────────────────────────┤
│ Step 3 of 3: Job Description                                 │
│                                                               │
│ Use Template: [Technical Recruiter Template              ▼]  │
│ [Load Template]                                              │
│                                                               │
│ Job Summary: *                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ InTime is seeking 2 talented Technical Recruiters to    │ │
│ │ join our fast-growing recruiting team. In this role,    │ │
│ │ you'll manage full-cycle recruiting for technology      │ │
│ │ positions, working directly with clients and candidates │ │
│ │ to make successful placements. This is a high-impact    │ │
│ │ role with significant earning potential through         │ │
│ │ commission.                                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ Key Responsibilities:                                         │
│ [+ Add Responsibility]                                       │
│ → Manage full-cycle recruiting (sourcing to placement)      │
│ → Source candidates via LinkedIn, job boards, referrals     │
│ → Screen and interview candidates                           │
│ → Present qualified candidates to clients                   │
│ → Coordinate interviews and gather feedback                 │
│ → Negotiate offers and close placements                     │
│ → Build and maintain candidate pipeline                     │
│ → Develop client relationships                              │
│                                                               │
│ Required Qualifications:                                      │
│ [+ Add Qualification]                                        │
│ → 1-3 years of recruiting experience (tech staffing)        │
│ → Full-cycle recruiting experience                          │
│ → Strong sourcing skills (Boolean search, LinkedIn)         │
│ → ATS experience (Bullhorn, Greenhouse, or similar)         │
│ → Excellent communication and relationship-building skills  │
│ → Self-motivated and target-driven                          │
│ → US work authorization                                      │
│                                                               │
│ Preferred Qualifications:                                     │
│ [+ Add Qualification]                                        │
│ → Tech industry knowledge (software development)            │
│ → Bachelor's degree (any field)                             │
│ → Previous startup experience                               │
│ → Sales or business development background                  │
│                                                               │
│ Success Metrics (First 90 Days):                             │
│ → 5-7 placements in first 90 days                           │
│ → Build pipeline of 50+ qualified candidates                │
│ → Develop 3-5 strong client relationships                   │
│ → Master InTime systems and processes                       │
│                                                               │
│ [◀ Back]                              [Preview & Publish]    │
└──────────────────────────────────────────────────────────────┘
```

**Field Specifications:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `title` | String | Yes | min:3, max:200 | Position title |
| `department` | Enum | Yes | Valid dept | Recruiting, Sales, HR, etc. |
| `hiringManagerId` | UUID | Yes | Valid user | Manager for role |
| `openings` | Number | Yes | 1-10 | Number of positions |
| `employmentType` | Enum | Yes | full_time, part_time, contract | Type |
| `location` | String | Yes | max:200 | Remote/Office |
| `workAuthRequired` | Boolean | Yes | - | US work auth needed? |
| `salaryMin` | Currency | Yes | > 0 | Min salary |
| `salaryMax` | Currency | Yes | >= salaryMin | Max salary |
| `salaryType` | Enum | Yes | annual, hourly | Pay frequency |
| `commissionEligible` | Boolean | No | - | Has commission? |
| `commissionStructure` | Text | Conditional | max:500 | Commission details |
| `targetOTE` | Currency | No | - | On-target earnings |
| `benefits` | Array | No | - | Benefits list |
| `jobSummary` | Text | Yes | min:50, max:2000 | Overview |
| `responsibilities` | Array | Yes | min:3 items | Key duties |
| `requiredQualifications` | Array | Yes | min:3 items | Must-haves |
| `preferredQualifications` | Array | No | - | Nice-to-haves |
| `successMetrics` | Array | No | - | 30/60/90 day goals |

**Time:** 20-30 minutes

---

### Step 4: Publish Job Posting

**User Action:** Click "Preview & Publish"

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Job Posting Preview                                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ [Preview shows formatted job posting as candidates will see] │
│                                                               │
│ Publish To: *                                                 │
│ ☑ InTime Careers Page (https://intime.com/careers)          │
│ ☑ LinkedIn Jobs                                               │
│ ☑ Indeed                                                      │
│ ☑ Glassdoor                                                   │
│ □ AngelList (for startups)                                   │
│ □ BuiltIn (for tech)                                         │
│                                                               │
│ Internal Distribution:                                        │
│ ☑ Send to all employees (referral opportunity)              │
│ ☑ Post in #jobs Slack channel                               │
│ ☑ Include in next company newsletter                         │
│                                                               │
│ Referral Bonus:                                               │
│ ☑ Enable referral bonus: $1,500                              │
│   (Paid after 90-day retention)                              │
│                                                               │
│ Application Deadline:                                         │
│ ○ No deadline (rolling basis)                               │
│ ● Set deadline: [March 15, 2025           ] [📅]            │
│                                                               │
│ Auto-Responses:                                               │
│ ☑ Send confirmation email on application                     │
│ ☑ Send rejection email if not qualified                      │
│                                                               │
│ [Cancel]  [Save as Draft]              [Publish Job Now]     │
└──────────────────────────────────────────────────────────────┘
```

**System Processing:**
1. Create job posting record
2. Publish to selected job boards (via integrations)
3. Post to InTime careers page
4. Send email to all employees (referral opportunity)
5. Post to Slack #jobs channel
6. Enable applicant tracking
7. Set up email automation

**Confirmation:**
```
✅ Job Published Successfully!

Technical Recruiter (2 openings)

Posted to:
→ InTime Careers: https://intime.com/careers/tech-recruiter
→ LinkedIn Jobs: Active
→ Indeed: Active
→ Glassdoor: Active

Internal Notifications:
→ Employees notified (referral bonus active)
→ Slack #jobs posted
→ Hiring Manager notified

Application Tracking:
→ Applications will appear in "Internal Hiring" pipeline
→ Auto-screening enabled for basic qualifications
→ You'll receive email for each new application

[View Job Posting]  [Track Applications]
```

**Time:** 5 minutes

---

### Step 5: Source Candidates (Proactive Outreach)

**User Action:** Navigate to "Candidate Sourcing"

**Sourcing Strategy:**

```
┌──────────────────────────────────────────────────────────────┐
│ PROACTIVE SOURCING: Technical Recruiter                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ SOURCING CHANNELS:                                            │
│                                                               │
│ 1. LinkedIn Recruiter Search                                 │
│    Boolean: (title:"Technical Recruiter" OR                  │
│             title:"IT Recruiter" OR                          │
│             title:"Staffing Specialist")                     │
│             AND (skills:"full-cycle recruiting")             │
│             AND location:"United States"                     │
│             AND experience:1-3                               │
│                                                               │
│    Filters:                                                   │
│    → Current company: NOT InTime (exclude own employees)     │
│    → Industries: Staffing, Recruiting, Technology            │
│    → Active in last 30 days                                  │
│    → Open to opportunities: Yes                              │
│                                                               │
│    Results: 450 candidates                                   │
│    [View List]  [Save Search]  [Start Outreach]             │
│                                                               │
│ 2. Employee Referrals                                         │
│    Referral Program: $1,500 bonus (paid at 90 days)         │
│    [View Referral Submissions (3 new)]                       │
│                                                               │
│ 3. Internal Candidate Database                               │
│    Past Applicants: 12 candidates from previous roles       │
│    [Review & Re-Engage]                                      │
│                                                               │
│ 4. Recruiting Networks                                        │
│    → Recruiting.com                                          │
│    → RecruiterLink                                           │
│    → Reddit r/recruiting                                     │
│    [Post in Communities]                                     │
│                                                               │
│ 5. Passive Candidate Pipeline                                │
│    → Past interviewed candidates (didn't place)              │
│    → Academy alumni (career change to recruiting)            │
│    [Review Pipeline (8 candidates)]                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Outreach Message Template (LinkedIn):**

```
Subject: Technical Recruiter Opportunity @ InTime

Hi [First Name],

I came across your profile and was impressed by your recruiting
background at [Current Company]. We're looking for 2 Technical
Recruiters to join our fast-growing team at InTime.

What makes this role unique:
→ Full-cycle recruiting (you own the whole process)
→ Strong earning potential ($75K-$100K OTE with commission)
→ Remote-first culture (work from anywhere in US)
→ Fast-paced startup environment (we're scaling fast)
→ Great team culture (check our Glassdoor reviews)

If you're open to exploring, I'd love to chat. Here's a quick
15-minute slot on my calendar:
[Calendly Link]

Or feel free to reply with your availability.

Best,
[Your Name]
TA Specialist @ InTime
[Email] | [Phone]
```

**Time:** 2-3 hours per week (ongoing sourcing)

---

### Step 6: Screen Applications & Phone Screens

**User Action:** Navigate to "Applications"

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Applications: Technical Recruiter (42 applications)          │
├──────────────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [Source ▼] [Date ▼] [Match Score ▼]    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 📄 NEW APPLICATION                                        │ │
│ │ ──────────────────────────────────────────────────────────│ │
│ │ Name: Michael Chen                                        │ │
│ │ Email: michael.chen@email.com                             │ │
│ │ Phone: (650) 555-7890                                     │ │
│ │ LinkedIn: linkedin.com/in/michaelchen                     │ │
│ │ Resume: michael-chen-resume.pdf [View]                    │ │
│ │ Source: LinkedIn Job Posting                              │ │
│ │ Applied: 2 hours ago                                      │ │
│ │                                                           │ │
│ │ Match Score: ⭐⭐⭐⭐⭐ (95/100) - EXCELLENT FIT            │ │
│ │ ├─ Experience: 2 years tech recruiting (exact match)     │ │
│ │ ├─ Skills: Full-cycle, LinkedIn Recruiter, Bullhorn ATS  │ │
│ │ ├─ Location: San Francisco (remote OK)                   │ │
│ │ ├─ Work Auth: US Citizen                                 │ │
│ │ └─ Availability: 2 weeks notice                          │ │
│ │                                                           │ │
│ │ Current Role:                                             │ │
│ │ Technical Recruiter @ TechStaff Solutions (2 years)       │ │
│ │ → Averaged 8 placements/month                            │ │
│ │ → Specialized in software engineers and data scientists  │ │
│ │ → Managed full recruiting lifecycle                      │ │
│ │                                                           │ │
│ │ Why interested?                                           │ │
│ │ "I'm looking for a high-growth environment where I can   │ │
│ │  take ownership and grow my career. InTime's commission  │ │
│ │  structure and remote flexibility are very appealing."   │ │
│ │                                                           │ │
│ │ Salary Expectations: $65K-$70K base + commission         │ │
│ │                                                           │ │
│ │ [View Full Application]  [Schedule Screen]  [Reject]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Auto-Reject Low Matches (<60%)]  [Bulk Schedule Screens]    │
└──────────────────────────────────────────────────────────────┘
```

**Phone Screen Guide (30 min):**

```
┌──────────────────────────────────────────────────────────────┐
│ INTERNAL PHONE SCREEN GUIDE                                  │
│ Candidate: Michael Chen                                      │
│ Position: Technical Recruiter                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. OPENING (2 min)                                            │
│    "Hi Michael, thanks for applying! I've reviewed your      │
│     resume and I'm excited to learn more. Let me give you a  │
│     quick overview of InTime and the role, then I'd love to  │
│     hear about your background."                             │
│                                                               │
│ 2. COMPANY & ROLE OVERVIEW (3 min)                            │
│    → InTime: Staffing company, 50 employees, fast growth     │
│    → Role: Full-cycle tech recruiting, own client accounts   │
│    → Comp: $60K-$75K base + $500-$1500/placement commission  │
│    → Team: 8 recruiters, collaborative culture               │
│    → Remote: Work from anywhere in US                        │
│                                                               │
│ 3. RECRUITING EXPERIENCE (10 min)                             │
│    Questions:                                                 │
│    □ "Walk me through your recruiting process at TechStaff" │
│    □ "What's your average time-to-fill for tech roles?"     │
│    □ "How do you source passive candidates? (strategies)"   │
│    □ "Tell me about a difficult search you closed"          │
│    □ "What ATS/tools do you use daily?"                     │
│    □ "How do you qualify candidates? (screening process)"   │
│                                                               │
│ 4. PERFORMANCE & RESULTS (5 min)                              │
│    □ "What's your average placements per month?"             │
│    □ "What's your placement-to-submittal ratio?"            │
│    □ "Tell me about your best month - what drove success?"  │
│    □ "How do you handle a slow month?"                      │
│                                                               │
│ 5. CULTURAL FIT (5 min)                                       │
│    □ "Why are you looking to leave TechStaff?"               │
│    □ "What motivates you in recruiting?"                     │
│    □ "How do you handle rejection (from candidates/clients)?"│
│    □ "Describe your ideal work environment"                  │
│    □ "How do you manage remote work? (self-discipline)"     │
│                                                               │
│ 6. LOGISTICS (3 min)                                          │
│    □ "Salary expectations? ($65K-$70K + comm = good fit)"   │
│    □ "Notice period at current employer? (2 weeks)"          │
│    □ "Work authorization status?"                            │
│    □ "Any concerns about remote-first role?"                 │
│                                                               │
│ 7. NEXT STEPS (2 min)                                         │
│    If Strong Fit:                                            │
│    "I think you'd be a great fit. Next steps:               │
│     → Hiring Manager interview (Sarah Jones, 45 min)        │
│     → Peer interviews (2 recruiters, 30 min each)           │
│     → Final interview with COO (30 min)                     │
│     → Offer decision within 1 week                          │
│     Timeline work for you?"                                  │
│                                                               │
│    If Not a Fit:                                             │
│    "Thanks for your time. I'll follow up by email within    │
│     48 hours with next steps."                              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Post-Screen Notes:**

```
┌──────────────────────────────────────────────────────────────┐
│ Phone Screen Notes: Michael Chen                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ SCREENING SCORE:                                              │
│ Recruiting Skills:    [█████████░] 9/10 - Strong sourcing   │
│ Performance:          [████████░░] 8/10 - 6-8 placements/mo │
│ Cultural Fit:         [█████████░] 9/10 - Great attitude    │
│ Communication:        [██████████] 10/10 - Excellent        │
│ Remote Work Ready:    [█████████░] 9/10 - Self-disciplined  │
│ Motivation:           [█████████░] 9/10 - Commission-driven │
│ Overall:              [█████████░] 9/10 - STRONG HIRE       │
│                                                               │
│ HIGHLIGHTS:                                                   │
│ ✓ 2 years full-cycle tech recruiting                        │
│ ✓ Averaged 8 placements/month (above target)                │
│ ✓ Strong sourcing skills (Boolean, LinkedIn Recruiter)      │
│ ✓ Experience with Bullhorn ATS                              │
│ ✓ Excellent communication and energy                        │
│ ✓ Motivated by commission structure                         │
│                                                               │
│ CONCERNS:                                                     │
│ ⚠ Limited experience with C2C contractors (mostly W2)       │
│   → Not a blocker, can train on this                        │
│                                                               │
│ RECOMMENDATION:                                               │
│ ✅ ADVANCE TO HIRING MANAGER INTERVIEW                       │
│                                                               │
│ Next Steps:                                                   │
│ 1. Schedule with Sarah Jones (hiring manager)               │
│ 2. Send calendar invite + job details                        │
│ 3. Brief Sarah on candidate (email summary)                 │
│                                                               │
│ [Save Notes]  [Schedule Next Interview]  [Reject]           │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 30-40 minutes per screen (call + notes)

---

### Step 7: Coordinate Interview Process

**User Action:** Click "Schedule Next Interview"

**Interview Coordination:**

```
┌──────────────────────────────────────────────────────────────┐
│ Interview Scheduler: Michael Chen                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Interview Stage: [Stage 2: Hiring Manager                ▼] │
│                                                               │
│ Interviewer(s):                                               │
│ ☑ Sarah Jones (Hiring Manager)                              │
│ Duration: [45] minutes                                       │
│                                                               │
│ Suggested Times (based on Sarah's availability):             │
│ ○ Tomorrow, 2:00 PM EST                                      │
│ ● Thursday, 10:00 AM EST                                     │
│ ○ Friday, 3:00 PM EST                                        │
│                                                               │
│ Meeting Link:                                                 │
│ ● Auto-generate Zoom link                                    │
│                                                               │
│ Interview Guide:                                              │
│ [Attach] Hiring Manager Interview Guide (auto-included)     │
│                                                               │
│ Email to Candidate:                                           │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Subject: Next Step: Interview with Hiring Manager       │ │
│ │                                                          │ │
│ │ Hi Michael,                                              │ │
│ │                                                          │ │
│ │ Great news! Sarah Jones, our Recruiting Manager, would  │ │
│ │ like to meet you.                                        │ │
│ │                                                          │ │
│ │ Interview Details:                                       │ │
│ │ Date: Thursday, Feb 15, 2025                            │ │
│ │ Time: 10:00 AM EST                                       │ │
│ │ Duration: 45 minutes                                     │ │
│ │ Zoom Link: [Link]                                        │ │
│ │                                                          │ │
│ │ What to expect:                                          │ │
│ │ → Deep dive into your recruiting experience             │ │
│ │ → Discussion of InTime's recruiting process             │ │
│ │ → Role expectations and team dynamics                   │ │
│ │ → Opportunity to ask Sarah questions                    │ │
│ │                                                          │ │
│ │ Please come prepared with:                              │ │
│ │ → Examples of successful placements                     │ │
│ │ → Questions about the role and team                     │ │
│ │                                                          │ │
│ │ Let me know if you have any questions!                  │ │
│ │                                                          │ │
│ │ Best,                                                    │ │
│ │ [Your Name]                                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Cancel]                              [Schedule & Send]       │
└──────────────────────────────────────────────────────────────┘
```

**Interview Process Tracking:**

```
Interview Pipeline: Michael Chen

Stage 1: TA Phone Screen ✅ COMPLETE (Feb 12)
  ├─ Screener: You (TA Specialist)
  ├─ Score: 9/10
  └─ Decision: ADVANCE

Stage 2: Hiring Manager ⏳ SCHEDULED (Feb 15, 10:00 AM)
  ├─ Interviewer: Sarah Jones
  └─ Status: Calendar invite sent

Stage 3: Peer Interviews 📅 PENDING
  ├─ Interviewer 1: John Smith (Sr. Recruiter)
  ├─ Interviewer 2: Lisa Wang (Sr. Recruiter)
  └─ Duration: 30 min each

Stage 4: Final Interview (COO) 📅 PENDING
  ├─ Interviewer: Mike Brown (COO)
  └─ Duration: 30 min

Expected Timeline: Offer by Feb 22 (1 week)
```

**Time:** 10 minutes per interview scheduling

---

### Step 8: Gather Feedback & Make Decision

**User Action:** After each interview, collect feedback

**Feedback Form:**

```
┌──────────────────────────────────────────────────────────────┐
│ Interview Feedback: Michael Chen                            │
│ Interviewer: Sarah Jones (Hiring Manager)                   │
│ Interview Date: Feb 15, 2025                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ OVERALL RATING: *                                             │
│ ○ Strong No      ○ No      ○ Maybe      ● Yes      ○ Strong Yes│
│                                                               │
│ COMPETENCY RATINGS:                                           │
│                                                               │
│ Recruiting Skills (Sourcing, Screening):                     │
│ [████████░░] 8/10                                            │
│ Notes: Strong sourcing skills, good screening process       │
│                                                               │
│ Communication & Relationship Building:                        │
│ [█████████░] 9/10                                            │
│ Notes: Excellent communicator, builds rapport quickly       │
│                                                               │
│ Results Orientation & Drive:                                 │
│ [█████████░] 9/10                                            │
│ Notes: Clearly motivated by targets, competitive spirit     │
│                                                               │
│ Cultural Fit (Values, Team Fit):                             │
│ [████████░░] 8/10                                            │
│ Notes: Would fit well with team, positive attitude          │
│                                                               │
│ Remote Work Readiness:                                        │
│ [█████████░] 9/10                                            │
│ Notes: Self-starter, disciplined, previous remote exp       │
│                                                               │
│ STRENGTHS:                                                    │
│ → Great track record (8 placements/month)                   │
│ → Strong technical recruiting background                    │
│ → Excellent communication skills                            │
│ → Self-motivated and competitive                            │
│                                                               │
│ CONCERNS/GAPS:                                                │
│ → Limited C2C experience (mostly W2 placements)             │
│ → Would need training on our specific client types          │
│                                                               │
│ RECOMMENDATION:                                               │
│ ● ADVANCE TO NEXT ROUND                                      │
│ ○ HOLD (needs more assessment)                               │
│ ○ REJECT                                                      │
│                                                               │
│ ADDITIONAL NOTES:                                             │
│ [Impressed by Michael's energy and track record. I think he │
│  would be a strong addition to the team. Recommend advancing│
│  to peer interviews.]                                        │
│                                                               │
│ [Save Feedback]                                              │
└──────────────────────────────────────────────────────────────┘
```

**Hiring Decision Summary:**

```
┌──────────────────────────────────────────────────────────────┐
│ HIRING DECISION: Michael Chen                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ALL INTERVIEWS COMPLETE                                       │
│                                                               │
│ Stage 1: TA Screen       ✅ 9/10  Recommend: ADVANCE         │
│ Stage 2: Hiring Manager  ✅ 8/10  Recommend: ADVANCE         │
│ Stage 3: Peer Interview 1✅ 9/10  Recommend: HIRE            │
│ Stage 4: Peer Interview 2✅ 8/10  Recommend: HIRE            │
│ Stage 5: COO Interview   ✅ 9/10  Recommend: STRONG HIRE     │
│                                                               │
│ CONSENSUS: STRONG HIRE                                        │
│ Overall Score: 8.6/10                                        │
│                                                               │
│ OFFER RECOMMENDATION:                                         │
│ Base Salary: $68,000 (mid-range)                            │
│ Commission: Standard structure ($500-$1500/placement)        │
│ Start Date: March 1, 2025 (2 weeks notice)                  │
│                                                               │
│ [Prepare Offer]  [Request More Interviews]  [Reject]        │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 10 minutes per feedback collection

---

### Step 9: Extend Offer

**User Action:** Click "Prepare Offer"

**Offer Details:**

```
┌──────────────────────────────────────────────────────────────┐
│ Prepare Job Offer: Michael Chen                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Position: Technical Recruiter                                │
│ Hiring Manager: Sarah Jones                                  │
│                                                               │
│ COMPENSATION:                                                 │
│ Base Salary: $[68,000] annually                             │
│ Commission: Standard placement commission ($500-$1500)       │
│ On-Target Earnings: $85,000 - $95,000                       │
│                                                               │
│ BENEFITS:                                                     │
│ ☑ Health Insurance (Medical, Dental, Vision)                 │
│ ☑ 401(k) with 4% match                                       │
│ ☑ Unlimited PTO                                               │
│ ☑ Remote work stipend ($500/year)                            │
│ ☑ Professional development ($1,000/year)                     │
│ ☑ Stock options (after 1 year vesting)                       │
│                                                               │
│ START DATE:                                                   │
│ Proposed: [March 1, 2025                ] [📅]              │
│                                                               │
│ EMPLOYMENT TYPE:                                              │
│ ● Full-Time, Exempt                                          │
│                                                               │
│ LOCATION:                                                     │
│ ● Remote (US)                                                │
│                                                               │
│ APPROVAL REQUIRED:                                            │
│ ☑ Hiring Manager: Sarah Jones (approved)                     │
│ ☑ HR Manager: Lisa Chen (approved)                           │
│ □ CEO: Not required (<$100K)                                 │
│                                                               │
│ OFFER LETTER:                                                 │
│ Template: [Standard Offer Letter - Recruiter             ▼]  │
│ [Preview Offer Letter]                                       │
│                                                               │
│ DELIVERY METHOD:                                              │
│ ● Email + DocuSign (e-signature)                             │
│ ○ Printed letter (mail)                                      │
│                                                               │
│ OFFER EXPIRATION:                                             │
│ Candidate must accept by: [Feb 22, 2025      ] [📅] (5 days)│
│                                                               │
│ [Cancel]  [Save Draft]                [Send Offer Letter]    │
└──────────────────────────────────────────────────────────────┘
```

**Offer Letter Template:**

```
[InTime Letterhead]

February 15, 2025

Michael Chen
michael.chen@email.com

Dear Michael,

We are pleased to extend you an offer of employment with InTime
for the position of Technical Recruiter, reporting to Sarah Jones,
Recruiting Manager.

COMPENSATION:
→ Base Salary: $68,000 per year
→ Commission: Placement-based commission ($500-$1500 per placement)
→ On-Target Earnings: $85,000 - $95,000 annually

BENEFITS:
→ Health Insurance (Medical, Dental, Vision) - company pays 80%
→ 401(k) with 4% company match
→ Unlimited Paid Time Off (PTO)
→ Remote work stipend: $500/year
→ Professional development budget: $1,000/year
→ Stock options (eligibility after 1 year)

START DATE: March 1, 2025

EMPLOYMENT TYPE: Full-time, Exempt

LOCATION: Remote (United States)

This offer is contingent upon:
→ Successful background check
→ Verification of employment eligibility (I-9)
→ Signed confidentiality and non-compete agreement

Please sign and return this letter by February 22, 2025 to accept
this offer.

We're excited to have you join the InTime team!

Sincerely,

[Digital Signature]
Lisa Chen
HR Manager, InTime

─────────────────────────────────────────────────────────────

ACCEPTANCE:

I, Michael Chen, accept the above offer of employment with InTime.

Signature: ________________________  Date: ______________

[DocuSign - Click to Sign]
```

**System Processing:**
1. Generate offer letter PDF
2. Send via DocuSign for e-signature
3. CC: HR Manager, Hiring Manager, TA Specialist
4. Track signature status
5. Set expiration reminder (offer expires in 5 days)
6. Notify candidate via email and phone call

**Phone Call to Candidate:**

```
TA Specialist calls candidate:

"Hi Michael! I have great news - we'd like to extend you an offer
for the Technical Recruiter position!

[Summarize offer verbally]

I'm sending the formal offer letter via email now (via DocuSign).
Please review and let me know if you have any questions.

We're really excited to have you join the team! What's your
initial reaction?"

[Answer questions, address concerns, reinforce excitement]

"Take some time to review, and let me know if you'd like to
discuss anything. Looking forward to having you on board!"
```

**Time:** 20-30 minutes (offer prep + call)

---

### Step 10: Offer Acceptance & Onboarding Handoff

**Trigger:** Candidate signs offer letter (DocuSign webhook)

**System Notification:**
```
✅ OFFER ACCEPTED!

Michael Chen has accepted the offer for Technical Recruiter.

Signed: Feb 16, 2025 (1 day after offer)
Start Date: March 1, 2025

Next Steps:
1. Background check initiated (Checkr)
2. I-9 verification scheduled (first day)
3. Onboarding packet sent (HR)
4. IT equipment ordered (laptop, monitor)
5. System access provisioned (email, Slack, ATS)
6. First-day agenda prepared

[View Onboarding Checklist]
```

**Onboarding Handoff to HR:**

```
┌──────────────────────────────────────────────────────────────┐
│ Onboarding Handoff: Michael Chen                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ NEW HIRE DETAILS:                                             │
│ Name: Michael Chen                                           │
│ Position: Technical Recruiter                                │
│ Department: Recruiting                                       │
│ Manager: Sarah Jones                                         │
│ Start Date: March 1, 2025                                    │
│ Salary: $68,000 + commission                                 │
│                                                               │
│ PRE-START CHECKLIST (HR):                                     │
│ ☑ Offer letter signed (Feb 16)                              │
│ ☑ Background check initiated (Feb 16)                        │
│ □ Background check cleared (pending, due Feb 23)             │
│ ☑ I-9 documents requested (Feb 16)                           │
│ □ I-9 completed (due March 1)                                │
│ ☑ IT equipment ordered (laptop, monitor, Feb 16)             │
│ ☑ Email account created (michael.chen@intime.com)            │
│ ☑ Slack invite sent (Feb 16)                                 │
│ □ ATS access provisioned (due Feb 28)                        │
│ □ Benefits enrollment scheduled (due Feb 28)                 │
│                                                               │
│ FIRST DAY AGENDA (March 1):                                   │
│ 9:00 AM - Welcome call with HR (Lisa Chen)                  │
│ 9:30 AM - IT setup assistance                                │
│ 10:00 AM - Company orientation                               │
│ 11:00 AM - Meet the team (Recruiting)                        │
│ 12:00 PM - Lunch (virtual) with buddy (John Smith)          │
│ 1:00 PM - Systems training (ATS, CRM)                        │
│ 3:00 PM - 1:1 with Sarah Jones (manager)                    │
│ 4:30 PM - End of Day check-in                                │
│                                                               │
│ ASSIGNED ONBOARDING BUDDY:                                    │
│ John Smith (Sr. Technical Recruiter)                         │
│ → Will guide through first 2 weeks                           │
│                                                               │
│ [Complete Handoff to HR]                                     │
└──────────────────────────────────────────────────────────────┘
```

**TA Specialist Congratulations Email:**

```
Subject: Welcome to InTime, Michael!

Hi Michael,

Congratulations and welcome to the InTime team! 🎉

We're thrilled to have you joining as a Technical Recruiter on
March 1. Here's what to expect between now and your start date:

PRE-START:
→ Background check (you'll receive an email from Checkr)
→ I-9 verification (HR will send instructions)
→ IT equipment shipped to your home (tracking forthcoming)
→ Benefits enrollment (HR will schedule a call)

FIRST DAY (March 1):
→ You'll receive a detailed agenda next week
→ Your manager Sarah will be your main point of contact
→ John Smith will be your onboarding buddy (he's great!)

In the meantime, feel free to:
→ Join our Slack workspace (invite sent separately)
→ Review our handbook: [Link]
→ Check out our recruiting playbook: [Link]

If you have ANY questions before your start date, don't hesitate
to reach out. I'm here to help!

See you on March 1!

Best,
[Your Name]
TA Specialist @ InTime
[Email] | [Phone]
```

**Time:** 15-20 minutes (handoff + email)

---

## Postconditions

1. ✅ Internal job posted to careers page and job boards
2. ✅ Employee referral program activated
3. ✅ Candidates sourced and screened
4. ✅ Interview process coordinated
5. ✅ Feedback collected from all interviewers
6. ✅ Offer extended and accepted
7. ✅ Background check initiated
8. ✅ Onboarding handed off to HR
9. ✅ New hire scheduled for first day
10. ✅ TA Specialist tracks to successful start

---

## Business Rules

1. **Approval Required:** All internal job postings require hiring manager + HR approval before publishing
2. **Budget Approval:** Positions >$100K require CEO approval
3. **Interview Stages:** Minimum 3 interviews required (TA screen, hiring manager, peer/final)
4. **Offer Expiration:** Standard 5-day acceptance window
5. **Background Check:** Required for all hires (conducted by Checkr)
6. **Reference Checks:** Minimum 2 professional references checked before offer
7. **Employee Referrals:** $1,500 bonus paid at 90 days (if hire retained)
8. **Hiring Timeline:** Target offer within 2 weeks of application
9. **TA Specialist Commission:** $500 per successful internal hire (paid at 90 days)
10. **Remote Work:** All roles can be remote unless specifically on-site required

---

## Metrics & Analytics

### Hiring Metrics
- Time to fill: Target <30 days (application to start date)
- Time to offer: Target <14 days (application to offer)
- Applications per posting: Target 30-50
- Phone screen conversion: Target >40% (screen to next round)
- Offer acceptance rate: Target >90%
- New hire retention: Target >90% at 90 days

### Sourcing Metrics
- Source effectiveness: Track applicants by source (LinkedIn, Indeed, referrals)
- Referral rate: Target 20-30% of hires from referrals
- Passive candidate conversion: Target >25% (outreach to application)
- Job posting views: Track visibility and engagement

### Quality Metrics
- Hiring manager satisfaction: Target >4.5/5
- New hire onboarding score: Target >4.5/5
- 30/60/90 day retention: Track and report
- Performance in role: Track first-year performance reviews

---

## Integration Points

### ATS Module (Internal Jobs)
- **Data Flow:** Job postings → Applications → Interviews → Offers → Hires
- **API:** `internalJobs.create()`, `applications.track()`, `offers.extend()`

### HR Module
- **Handoff:** Offer acceptance → Onboarding
- **API:** `hr.createNewHire()`, `hr.trackOnboarding()`
- **Data Sync:** Employee profile creation

### LinkedIn / Job Boards
- **Integration:** Post jobs to LinkedIn, Indeed, Glassdoor via API
- **Tracking:** Track applicant source and application flow

### DocuSign
- **Integration:** Offer letters and employment agreements
- **Webhook:** Signature completion → Update offer status

### Background Check (Checkr)
- **Integration:** Initiate checks upon offer acceptance
- **Webhook:** Results received → Notify HR and TA Specialist

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create internal job posting | Posted to all selected boards |
| TC-002 | Receive application | Auto-scored, TA notified |
| TC-003 | Schedule phone screen | Calendar invite sent |
| TC-004 | Collect interview feedback | Feedback form completed |
| TC-005 | Extend offer | DocuSign sent, candidate notified |
| TC-006 | Offer accepted | Background check triggered, HR notified |
| TC-007 | Offer declined | Position reopened, next candidate contacted |
| TC-008 | Employee referral | Referral tracked, bonus scheduled |
| TC-009 | Background check fails | Offer rescinded, candidate notified |
| TC-010 | New hire start date | Onboarding checklist created |

---

*Last Updated: 2025-11-30*
*Version: 1.0*
