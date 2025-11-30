# Use Case: Update Bench Consultant Profile

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-007 |
| Actor | Bench Sales Recruiter |
| Goal | Update consultant profile information to maintain accuracy and improve marketability |
| Frequency | 2-3 times per week per consultant |
| Estimated Time | 5-15 minutes per update (varies by section) |
| Priority | High (Critical for accurate marketing and submissions) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Consultant profile exists in system
3. User has edit permissions for consultant profiles
4. Consultant is on bench or recently placed
5. Profile sections are properly initialized

---

## Trigger

One of the following:
- Consultant provides updated resume
- Consultant's availability changes
- Rate adjustment needed (market conditions, performance)
- Work authorization update (visa renewal, status change)
- Consultant requests profile edits
- Profile accuracy review (weekly/monthly)
- Manager requests profile update
- Pre-submission profile validation
- Immigration status change
- Consultant feedback from interviews

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Consultant Profile

**Option A: From Bench Dashboard**
- User finds consultant card on bench dashboard
- User clicks consultant name

**Option B: From Search**
- User searches consultant name in global search
- User clicks profile from results

**Option C: From Consultant List**
- User navigates to `/employee/workspace/bench/consultants`
- User clicks consultant row

**System Response:**
- Consultant profile page loads
- Shows all profile sections
- Edit buttons visible on each section

**URL:** `/employee/workspace/bench/consultants/[consultant-id]`

**Screen State:**
```
+------------------------------------------------------------------+
| ← Back to Bench         Rajesh Kumar                  [⋮ Actions]|
+------------------------------------------------------------------+
| [Overview] [Profile] [Activity] [Submissions] [Placements]      |
+------------------------------------------------------------------+
|                                                                   |
| Profile Overview                                       [Edit All]|
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ RAJESH KUMAR                                        [Photo]   │ |
| │ Senior Java Developer                                         │ |
| │                                                               │ |
| │ Status: 🟠 On Bench (42 days)                                │ |
| │ Availability: ✅ Immediate                                    │ |
| │ Rate: $85/hr                                                  │ |
| │ Location: Remote / Washington DC                             │ |
| │ Work Auth: H1B (Valid until 03/15/2026)                      │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
|                                                                   |
| Contact Information                                        [Edit]|
+------------------------------------------------------------------+
| Email: rajesh.kumar@gmail.com                                    |
| Phone: +1 (240) 555-0123                                         |
| LinkedIn: linkedin.com/in/rajeshkumar                            |
| Location: Washington, DC 20001                                   |
| Timezone: EST (UTC-5)                                            |
| Preferred Contact: Email (9 AM - 6 PM EST)                       |
+------------------------------------------------------------------+
|                                                                   |
| Professional Summary                                       [Edit]|
+------------------------------------------------------------------+
| Headline:                                                         |
| "Senior Java Developer | 10+ Years | Spring Boot, AWS, Micro... |
|                                                                   |
| Summary:                                                          |
| Experienced Java developer with 10+ years building enterprise   |
| applications. Specialized in Spring Boot microservices and AWS   |
| cloud architecture. Recent project at Meta handling 10M+ daily   |
| requests. AWS Certified Solutions Architect.                     |
|                                                                   |
| Primary Skills: Java, Spring Boot, AWS, Microservices, REST APIs|
| Secondary Skills: Docker, Kubernetes, PostgreSQL, MongoDB        |
+------------------------------------------------------------------+
|                                                                   |
| Rate Information                                           [Edit]|
+------------------------------------------------------------------+
| Expected Rate: $90/hr                                            |
| Minimum Acceptable: $85/hr                                       |
| Current Bill Rate: $85/hr                                        |
| Negotiable: ✅ Yes (up to $95 for right opportunity)            |
| Last Updated: 11/25/2024 by rec1@intime.com                      |
| Manager Approval: ✅ Approved by bs_mgr1@intime.com (11/25)     |
+------------------------------------------------------------------+
|                                                                   |
| Availability                                                [Edit]|
+------------------------------------------------------------------+
| Available From: Immediate                                        |
| Notice Period: None (on bench)                                   |
| Preferred Start: ASAP                                            |
| Work Schedule: Full-time (40 hrs/week)                           |
| Overtime: ✅ Available                                           |
| Travel: Up to 25%                                                |
| Relocation: ❌ Not willing                                       |
| Remote Preference: Fully remote preferred, open to hybrid        |
+------------------------------------------------------------------+
|                                                                   |
| Work Authorization                                         [Edit]|
+------------------------------------------------------------------+
| Status: H1B                                                       |
| Valid From: 03/15/2020                                           |
| Valid Until: 03/15/2026                                          |
| Transfer Ready: ✅ Yes                                           |
| Transfer Timeline: 2-3 weeks (standard processing)               |
| Sponsorship Needed: ❌ No (H1B transfer only)                    |
| EAD: ❌ Not applicable                                           |
| Next Action: Renewal needed by 09/15/2025 (6 months prior)      |
+------------------------------------------------------------------+
|                                                                   |
| Resume / Profile Documents                                 [Edit]|
+------------------------------------------------------------------+
| Current Resume:                                                   |
| ✅ Rajesh_Kumar_Java_Developer.pdf (485 KB)                      |
|    Uploaded: 11/15/2024 by rajesh.kumar@gmail.com               |
|    Last Updated: 15 days ago                                     |
|    [Download] [Preview] [Replace]                                |
|                                                                   |
| Previous Versions (2):                                            |
| • Rajesh_Kumar_Resume_Oct2024.pdf (452 KB) - 10/15/2024         |
| • Rajesh_Kumar_Resume_Sept2024.docx (234 KB) - 09/10/2024       |
|                                                                   |
| Additional Documents:                                             |
| • H1B_Approval_Notice.pdf (1.2 MB)                               |
| • AWS_Solutions_Architect_Cert.pdf (156 KB)                      |
+------------------------------------------------------------------+
|                                                                   |
| Marketing Status                                           [Edit]|
+------------------------------------------------------------------+
| Marketing Status: ✅ Active                                      |
| Include in Hotlists: ✅ Yes                                      |
| Vendor Submissions: ✅ Allowed                                   |
| Direct Client Contact: ⚠ Requires approval                      |
| Last Marketed: 11/28/2024 (2 days ago)                           |
| Hotlist Count: 8 times                                           |
| Submission Count: 12 active                                      |
| Do Not Contact List: None                                        |
+------------------------------------------------------------------+
|                                                                   |
| Engagement History (Recent)                                       |
+------------------------------------------------------------------+
| 11/28/24 - Added to hotlist "Java Developers - Week of 11/25"   |
| 11/27/24 - Submitted to Accenture - Senior Java Developer        |
| 11/25/24 - Rate updated from $80 to $85/hr (market adjustment)   |
| 11/22/24 - Contacted consultant, confirmed availability          |
| 11/20/24 - Interview rejected by Capital One (skills mismatch)   |
| ... View All (47 activities)                                      |
+------------------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Edit Contact Information

**User Action:** Click "Edit" button on Contact Information section

**Modal Opens:**
```
+------------------------------------------------------------------+
|                  Edit Contact Information                    [×] |
+------------------------------------------------------------------+
| Update consultant's contact details and communication preferences|
+------------------------------------------------------------------+
|                                                                   |
| Email Address: *                                                  |
| [rajesh.kumar@gmail.com                                    ]      |
| ☑ Verified (last verified: 11/20/2024)                           |
| [Send Verification Email]                                         |
|                                                                   |
| Phone Number: *                                                   |
| Country: [United States (+1)                               ▼]     |
| Number: [(240) 555-0123                                    ]      |
| Type: ● Mobile  ○ Home  ○ Work                                   |
| ☑ Verified (last verified: 11/18/2024)                           |
| [Send SMS Verification]                                           |
|                                                                   |
| Secondary Phone: (optional)                                       |
| Number: [                                                  ]      |
| Type: ○ Mobile  ● Home  ○ Work                                   |
|                                                                   |
+------------------------------------------------------------------+
| Professional Networks                                             |
+------------------------------------------------------------------+
| LinkedIn Profile:                                                 |
| [https://linkedin.com/in/rajeshkumar                       ]      |
| ☑ Profile validated (found, public)                              |
|                                                                   |
| GitHub: (optional)                                                |
| [https://github.com/rajeshk                                ]      |
|                                                                   |
| Personal Website: (optional)                                      |
| [                                                          ]      |
|                                                                   |
+------------------------------------------------------------------+
| Location                                                          |
+------------------------------------------------------------------+
| Street Address: (optional)                                        |
| [123 Main Street, Apt 4B                                   ]      |
|                                                                   |
| City: *                                                           |
| [Washington                                                ]      |
|                                                                   |
| State/Province: *                                                 |
| [DC                                                        ▼]     |
|                                                                   |
| ZIP/Postal Code: *                                                |
| [20001                                                     ]      |
|                                                                   |
| Country: *                                                        |
| [United States                                             ▼]     |
|                                                                   |
| Timezone: * (auto-detected from location)                         |
| [America/New_York (EST, UTC-5)                             ▼]     |
|                                                                   |
+------------------------------------------------------------------+
| Communication Preferences                                         |
+------------------------------------------------------------------+
| Preferred Contact Method: *                                       |
| ● Email  ○ Phone  ○ SMS  ○ LinkedIn                              |
|                                                                   |
| Best Time to Contact: *                                           |
| From: [09:00 AM        ▼]  To: [06:00 PM        ▼]  [EST    ▼]  |
|                                                                   |
| Do Not Contact Times:                                             |
| ☑ Weekends                                                       |
| ☐ Before 9 AM                                                    |
| ☐ After 6 PM                                                     |
|                                                                   |
| Language Preferences:                                             |
| Primary: [English                                          ▼]     |
| Additional: [Hindi, Telugu                                 ▼]     |
|                                                                   |
+------------------------------------------------------------------+
| Emergency Contact (optional)                                      |
+------------------------------------------------------------------+
| Name:                                                             |
| [Priya Kumar                                               ]      |
|                                                                   |
| Relationship:                                                     |
| [Spouse                                                    ▼]     |
|                                                                   |
| Phone:                                                            |
| [(240) 555-0124                                            ]      |
|                                                                   |
+------------------------------------------------------------------+
| Change Tracking                                                   |
+------------------------------------------------------------------+
| ☑ Notify consultant of changes via email                         |
| ☑ Require consultant confirmation for email/phone changes        |
|                                                                   |
| Internal Notes: (not visible to consultant)                       |
| [Updated email per consultant request - old email bouncing ]     |
| [                                                 ] 65/500       |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Save Changes]      |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Max Length | Validation |
|-------|------|----------|------------|------------|
| Email | Email | Yes | 100 | Valid email format, unique |
| Phone | Phone | Yes | 20 | Valid phone format |
| LinkedIn | URL | No | 200 | Valid LinkedIn URL |
| City | Text | Yes | 100 | - |
| State | Dropdown | Yes | - | Valid state/province |
| ZIP Code | Text | Yes | 20 | Valid postal code |
| Country | Dropdown | Yes | - | - |
| Timezone | Dropdown | Yes | - | Valid IANA timezone |

**User Action:** Update email, phone, or location details

**System Response:**
- Validates all fields
- Checks for duplicates (email, phone)
- If email/phone changed: Sends verification request to consultant
- Saves changes with audit log
- Updates profile timestamp

**Business Rules:**
- Email/Phone changes require consultant confirmation within 48 hours
- Manager approval needed if email domain changes (fraud prevention)
- Location changes trigger tax/compliance review if state changes
- Timezone auto-updates based on location

**Time:** ~2-3 minutes

---

### Step 3: Edit Professional Summary

**User Action:** Click "Edit" button on Professional Summary section

**Modal Opens:**
```
+------------------------------------------------------------------+
|                Edit Professional Summary                     [×] |
+------------------------------------------------------------------+
| Create compelling summary to attract clients and vendors         |
+------------------------------------------------------------------+
|                                                                   |
| Professional Headline: *                                          |
| [Senior Java Developer | 10+ Years | Spring Boot, AWS,   ]      |
| [Microservices Expert | Meta Alumni                       ]      |
| [                                                 ] 98/120       |
|                                                                   |
| Tips: Keep it concise, highlight years of experience, key tech   |
| Bad: "Java Developer"                                            |
| Good: "Senior Java Developer | 10+ Years | AWS Certified"       |
|                                                                   |
| [✨ AI Generate Headline]                                        |
|                                                                   |
+------------------------------------------------------------------+
| Professional Summary: *                                           |
| [Experienced Java developer with 10+ years building       ]      |
| [enterprise applications. Specialized in Spring Boot      ]      |
| [microservices and AWS cloud architecture. Recent project ]      |
| [at Meta handling 10M+ daily requests. AWS Certified      ]      |
| [Solutions Architect. Proven track record of delivering   ]      |
| [scalable, high-performance systems on time and within    ]      |
| [budget. Strong communicator and team player.             ]      |
| [                                                          ]      |
| [                                                          ]      |
| [                                                 ] 465/1000     |
|                                                                   |
| Tips:                                                             |
| • Focus on achievements, not just responsibilities               |
| • Include metrics (years, team size, scale, impact)              |
| • Mention certifications and notable companies                   |
| • Keep it scan-friendly (short sentences, bullet points)         |
|                                                                   |
| [✨ AI Enhance Summary]  [📋 Copy from Resume]                   |
|                                                                   |
+------------------------------------------------------------------+
| Skills & Expertise                                                |
+------------------------------------------------------------------+
| Primary Skills: * (3-7 skills)                                    |
| [Java            ▼] [Spring Boot    ▼] [AWS            ▼]       |
| [Microservices   ▼] [REST APIs      ▼]                          |
| [+ Add Skill]                                                    |
|                                                                   |
| Skill Proficiency Levels:                                         |
| Java              ★★★★★ Expert    (10+ years)                   |
| Spring Boot       ★★★★★ Expert    (8 years)                     |
| AWS               ★★★★☆ Advanced  (5 years)                     |
| Microservices     ★★★★★ Expert    (7 years)                     |
| REST APIs         ★★★★★ Expert    (10 years)                    |
|                                                                   |
| Secondary Skills: (additional skills that strengthen profile)     |
| [Docker          ▼] [Kubernetes     ▼] [PostgreSQL     ▼]       |
| [MongoDB         ▼] [Git            ▼] [Agile          ▼]       |
| [+ Add Skill]                                                    |
|                                                                   |
| Soft Skills: (optional but recommended)                           |
| ☑ Team Leadership                                                |
| ☑ Communication                                                  |
| ☑ Problem Solving                                                |
| ☑ Client Management                                              |
| ☐ Mentoring                                                      |
|                                                                   |
+------------------------------------------------------------------+
| Industry Experience                                               |
+------------------------------------------------------------------+
| Industries: (helps with industry-specific submissions)            |
| ☑ Technology / Software                                          |
| ☑ Financial Services                                             |
| ☐ Healthcare                                                     |
| ☐ Government / Defense                                           |
| ☐ Retail / E-commerce                                            |
|                                                                   |
| Domain Expertise:                                                 |
| [E-commerce platforms, Payment systems, Cloud migration   ]      |
| [                                                 ] 58/500       |
|                                                                   |
+------------------------------------------------------------------+
| Certifications                                                    |
+------------------------------------------------------------------+
| [Certification 1]                                                 |
| Name: [AWS Certified Solutions Architect - Associate      ]      |
| Issuer: [Amazon Web Services                              ]      |
| Issue Date: [06/2023           ] Expiry: [06/2026          ]     |
| Credential ID: [AWS-SA-2023-12345                          ]     |
| Credential URL: [https://aws.amazon.com/verify/...         ]     |
| ☑ Include in profile                                             |
|                                                                   |
| [Certification 2]                                                 |
| Name: [Spring Professional Certification                   ]      |
| Issuer: [VMware / Pivotal                                  ]      |
| Issue Date: [03/2022           ] Expiry: [No expiration    ]     |
| ☑ Include in profile                                             |
|                                                                   |
| [+ Add Certification]                                            |
|                                                                   |
+------------------------------------------------------------------+
| Education                                                         |
+------------------------------------------------------------------+
| [Degree 1]                                                        |
| Degree: [Master of Science                                 ▼]     |
| Field of Study: [Computer Science                          ]      |
| Institution: [University of Maryland                        ]      |
| Location: [College Park, MD                                ]      |
| Year: From [2010    ] To [2012    ]                              |
| ☑ Include in profile                                             |
|                                                                   |
| [+ Add Education]                                                |
|                                                                   |
+------------------------------------------------------------------+
| AI Assistance                                                     |
+------------------------------------------------------------------+
| [✨ Analyze Resume and Auto-Fill All Fields]                     |
|                                                                   |
| This will:                                                        |
| • Parse uploaded resume                                          |
| • Extract skills, experience, education, certifications          |
| • Generate professional headline and summary                     |
| • Suggest proficiency levels                                     |
| • You can review and edit after                                  |
|                                                                   |
+------------------------------------------------------------------+
| Change Tracking                                                   |
+------------------------------------------------------------------+
| ☑ Update "Profile Last Modified" timestamp                       |
| ☐ Notify consultant of changes                                   |
|                                                                   |
| Internal Notes:                                                   |
| [Updated summary to highlight Meta experience per manager  ]     |
| [feedback - makes profile more competitive                 ]     |
| [                                                 ] 102/500      |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Save Changes]      |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Max Length | Default |
|-------|------|----------|------------|---------|
| Headline | Text | Yes | 120 chars | - |
| Summary | Textarea | Yes | 1000 chars | - |
| Primary Skills | Multi-select | Yes | 7 max | - |
| Skill Level | Star rating | No | - | 3 stars |
| Secondary Skills | Multi-select | No | 15 max | - |
| Certifications | Array | No | - | - |
| Education | Array | No | - | - |

**User Action:** Update headline, summary, skills, or add certifications

**System Response:**
- Validates headline length (not too short)
- Checks summary for quality (not generic, has metrics)
- Normalizes skills (matches to master skill list)
- Auto-detects skill proficiency from years of experience
- Saves changes with version history

**AI Features:**
- **AI Generate Headline**: Creates compelling headline from resume/profile
- **AI Enhance Summary**: Improves existing summary (metrics, clarity, impact)
- **Analyze Resume**: Parses uploaded resume and auto-fills all fields

**Business Rules:**
- Primary skills limited to 7 (keep focused)
- At least 3 primary skills required
- Skill proficiency auto-calculated from experience years (editable)
- Certifications auto-validated via credential URL (if provided)

**Time:** ~5-8 minutes (includes AI assistance)

---

### Step 4: Edit Rate Information

**User Action:** Click "Edit" button on Rate Information section

**Modal Opens:**
```
+------------------------------------------------------------------+
|                   Edit Rate Information                      [×] |
+------------------------------------------------------------------+
| ⚠ IMPORTANT: Rate changes >10% require manager approval          |
+------------------------------------------------------------------+
|                                                                   |
| Current Rate Information                                          |
+------------------------------------------------------------------+
| Expected Rate: * (What consultant wants to earn)                  |
| $[90       ] /hr                                                 |
|                                                                   |
| Minimum Acceptable Rate: * (Lowest consultant will accept)        |
| $[85       ] /hr                                                 |
| Must be ≤ Expected Rate                                          |
|                                                                   |
| Current Bill Rate: (What we're currently marketing at)            |
| $[85       ] /hr                                                 |
| Typically = Minimum or between Min and Expected                  |
|                                                                   |
| Maximum Rate: (For premium opportunities)                         |
| $[95       ] /hr                                                 |
|                                                                   |
| Rate Type: *                                                      |
| ● Hourly ($/hr)                                                  |
| ○ Daily ($/day)                                                  |
| ○ Annual ($/year)                                                |
|                                                                   |
+------------------------------------------------------------------+
| Rate Flexibility                                                  |
+------------------------------------------------------------------+
| Negotiable: *                                                     |
| ● Yes, negotiable within range                                   |
| ○ Firm, not negotiable                                           |
|                                                                   |
| Negotiation Notes: (helps in submissions)                         |
| [Willing to go up to $95/hr for long-term contracts (6+   ]      |
| [months) or Fortune 500 clients. Rate flexible for remote ]      |
| [opportunities. Minimum $85/hr for short-term projects.   ]      |
| [                                                 ] 178/500      |
|                                                                   |
+------------------------------------------------------------------+
| Rate History & Context                                            |
+------------------------------------------------------------------+
| Previous Rate: $80/hr (11/01/2024 - 11/24/2024)                  |
| Change: +$5/hr (+6.25%)                                          |
| Reason for Current Rate:                                          |
| ● Market adjustment (similar roles paying more)                  |
| ○ Performance improvement                                        |
| ○ Certification earned                                           |
| ○ Increased experience                                           |
| ○ Consultant request                                             |
|                                                                   |
| Last Updated: 11/25/2024 by rec1@intime.com                      |
| Previous Updates:                                                 |
| • 11/01/24: $75 → $80 (market adjustment)                        |
| • 09/15/24: $70 → $75 (AWS certification)                        |
|                                                                   |
+------------------------------------------------------------------+
| Market Benchmarking                                               |
+------------------------------------------------------------------+
| Role: Senior Java Developer (8-10 years experience)              |
| Location: Remote (US-based)                                      |
|                                                                   |
| Market Rate Range: $85 - $110/hr                                 |
| Average: $95/hr                                                  |
| Data Source: Dice, Indeed, LinkedIn (updated 11/28/2024)         |
|                                                                   |
| Consultant's Rate vs Market:                                      |
| Expected ($90): ▓▓▓▓▓▓▓░░░ 60th percentile (competitive)        |
| Minimum ($85):  ▓▓▓▓░░░░░░ 40th percentile (below avg)          |
| Maximum ($95):  ▓▓▓▓▓▓▓▓░░ 75th percentile (strong)             |
|                                                                   |
| ✅ Rates are competitive and marketable                          |
|                                                                   |
+------------------------------------------------------------------+
| Currency & International                                          |
+------------------------------------------------------------------+
| Currency: *                                                       |
| [USD ($) - United States Dollar                           ▼]     |
|                                                                   |
| ☐ Allow multi-currency rates (for international placements)     |
|   If checked, you can specify rates in multiple currencies       |
|                                                                   |
+------------------------------------------------------------------+
| Approval Workflow                                                 |
+------------------------------------------------------------------+
| Rate Change: $80/hr → $90/hr (Expected)                          |
| Change Percentage: +12.5%                                        |
|                                                                   |
| ⚠ This change requires manager approval (>10% increase)          |
|                                                                   |
| Justification: * (required for >10% changes)                      |
| [Market research shows senior Java developers with AWS    ]      |
| [certification earning $85-110/hr. Rajesh's previous rate ]      |
| [of $80 was below market. New rate aligns with 60th       ]      |
| [percentile, improving our competitiveness. Consultant    ]      |
| [confirmed willing to work at this rate.                  ]      |
| [                                                 ] 287/1000     |
|                                                                   |
| Approval From: *                                                  |
| [bs_mgr1@intime.com                                        ▼]     |
|                                                                   |
| ☑ Request approval now (manager will be notified)                |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Confirmation                                           |
+------------------------------------------------------------------+
| ☑ Consultant has confirmed these rates                           |
| Confirmed By: rajesh.kumar@gmail.com                             |
| Confirmed On: 11/25/2024                                         |
|                                                                   |
| ☐ Send rate confirmation email to consultant                     |
|   (Consultant will receive email with rate details to confirm)   |
|                                                                   |
+------------------------------------------------------------------+
| Change Tracking                                                   |
+------------------------------------------------------------------+
| Internal Notes:                                                   |
| [Consultant requested rate increase citing market rates.  ]      |
| [Verified via Dice.com, Indeed salary data. Manager       ]      |
| [approved increase to improve submission success rate.    ]      |
| [                                                 ] 165/500      |
|                                                                   |
+------------------------------------------------------------------+
|                         [Cancel]  [Save & Request Approval]      |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Expected Rate | Decimal | Yes | >0, 2 decimal places |
| Minimum Rate | Decimal | Yes | >0, ≤Expected |
| Current Bill Rate | Decimal | Yes | ≥Minimum, ≤Expected |
| Maximum Rate | Decimal | No | ≥Expected |
| Rate Type | Radio | Yes | - |
| Negotiable | Radio | Yes | - |
| Justification | Textarea | Conditional | Required if change >10% |

**User Action:** Update rate values and provide justification

**System Processing:**
1. Calculates rate change percentage
2. Determines if approval needed (>10% change)
3. Validates rate logic (min ≤ current ≤ expected ≤ max)
4. Fetches market benchmark data (optional)
5. If approval needed:
   - Creates approval request
   - Notifies manager
   - Sets status to "Pending Approval"
6. If no approval needed:
   - Saves immediately
   - Updates consultant marketing materials
   - Logs rate change event

**System Response:**
- If approved immediately: "Rate updated ✓"
- If requires approval: "Rate change submitted for approval. Manager notified."
- Updates all active submissions with new rate
- Recalculates margins on active opportunities

**Business Rules:**
- **>10% increase**: Requires manager approval
- **>25% increase**: Requires director approval
- **Decrease**: Always allowed (no approval)
- **Consultant confirmation**: Required within 48 hours
- **Active submissions**: Rate changes affect submissions in "Draft" only

**Time:** ~3-5 minutes

---

### Step 5: Edit Availability

**User Action:** Click "Edit" button on Availability section

**Modal Opens:**
```
+------------------------------------------------------------------+
|                    Edit Availability                         [×] |
+------------------------------------------------------------------+
| Update when consultant can start working on new projects         |
+------------------------------------------------------------------+
|                                                                   |
| Availability Status: *                                            |
| ● Immediate (available now, on bench)                            |
| ○ Available with notice (currently placed, needs notice)         |
| ○ Specific date (available from specific date)                   |
| ○ Not available (on project, do not market)                      |
|                                                                   |
+------------------------------------------------------------------+
| Start Date & Notice Period                                        |
+------------------------------------------------------------------+
| Available From: *                                                 |
| ● Immediate                                                      |
| ○ Specific Date: [12/15/2024         ] (if selected above)      |
|                                                                   |
| Notice Period: (if currently on project)                          |
| [None (on bench)                                           ▼]     |
| Options: None, 1 week, 2 weeks, 30 days, 60 days, Custom        |
|                                                                   |
| Preferred Start Date: (if consultant has preference)              |
| [ASAP                                                      ]      |
|                                                                   |
+------------------------------------------------------------------+
| Work Schedule Preferences                                         |
+------------------------------------------------------------------+
| Preferred Work Type: *                                            |
| ● Contract (1099/C2C)                                            |
| ○ W2 Contract                                                    |
| ○ Either (Flexible)                                              |
|                                                                   |
| Preferred Duration: *                                             |
| ☑ Short-term (1-3 months)                                        |
| ☑ Medium-term (3-6 months)                                       |
| ☑ Long-term (6-12+ months)                                       |
| ☐ Permanent (convert to FTE)                                     |
|                                                                   |
| Weekly Hours: *                                                   |
| ● Full-time (40 hrs/week)                                        |
| ○ Part-time (specify): [      ] hrs/week                         |
| ○ Flexible                                                       |
|                                                                   |
| Overtime Availability:                                            |
| ● Available (willing to work overtime if needed)                 |
| ○ Limited (occasional only)                                      |
| ○ Not available                                                  |
|                                                                   |
| Weekend Work:                                                     |
| ○ Available                                                      |
| ● Limited (emergency only)                                       |
| ○ Not available                                                  |
|                                                                   |
+------------------------------------------------------------------+
| Location & Remote Preferences                                     |
+------------------------------------------------------------------+
| Remote Work Preference: *                                         |
| ● Fully remote preferred                                         |
| ○ Hybrid (2-3 days in office)                                    |
| ○ On-site only                                                   |
| ○ Flexible (open to all)                                         |
|                                                                   |
| If Hybrid/On-site, Acceptable Locations:                          |
| [Washington DC, Baltimore, Northern Virginia              ]      |
| [                                                          ]      |
|                                                                   |
| Maximum Commute: (for on-site/hybrid)                             |
| [30            ] miles / [45            ] minutes                |
|                                                                   |
| Relocation:                                                       |
| ○ Willing to relocate                                            |
| ○ Open to short-term relocation (travel projects)                |
| ● Not willing to relocate                                        |
|                                                                   |
| Travel Availability: *                                            |
| ☑ Up to 25% (1 week/month)                                       |
| ☐ Up to 50% (2 weeks/month)                                      |
| ☐ Up to 75% (3 weeks/month)                                      |
| ☐ 100% travel (full-time travel)                                 |
| ☐ No travel                                                      |
|                                                                   |
+------------------------------------------------------------------+
| Restrictions & Blackout Dates                                     |
+------------------------------------------------------------------+
| Blackout Dates: (dates consultant is not available)               |
| [Date Range 1]                                                    |
| From: [12/20/2024      ] To: [01/02/2025      ]                  |
| Reason: [Holiday vacation - India trip                     ]      |
| [+ Add Blackout Date]                                            |
|                                                                   |
| Geographic Restrictions:                                          |
| [                                                          ]      |
| Example: "Cannot work in California due to tax reasons"          |
|                                                                   |
| Client Restrictions: (clients consultant cannot work for)         |
| ☐ Previous employer non-compete                                  |
| ☐ Do not contact list                                            |
|                                                                   |
| Clients: [Meta (previous employer - non-compete until     ]      |
|          [06/2025)                                         ]      |
|                                                                   |
+------------------------------------------------------------------+
| Additional Preferences                                            |
+------------------------------------------------------------------+
| Industry Preferences:                                             |
| ☑ Technology / Software                                          |
| ☑ Financial Services                                             |
| ☐ Healthcare                                                     |
| ☐ Government (requires clearance)                                |
| ☐ Any / No preference                                            |
|                                                                   |
| Company Size Preference:                                          |
| ☑ Enterprise (1000+ employees)                                   |
| ☑ Mid-market (100-1000)                                          |
| ☐ Startup (<100)                                                 |
|                                                                   |
| Project Type Preference:                                          |
| ☑ Greenfield (new projects)                                      |
| ☑ Maintenance / Enhancement                                      |
| ☐ Legacy migration                                               |
|                                                                   |
+------------------------------------------------------------------+
| Availability Notes                                                |
+------------------------------------------------------------------+
| Internal Notes: (not shared with consultant)                      |
| [Consultant confirmed available immediately. Prefers       ]      |
| [remote but open to hybrid in DC area. Not available       ]      |
| [Dec 20 - Jan 2 (India trip). Confirmed willing to start   ]      |
| [within 48 hours if right opportunity.                     ]      |
| [                                                 ] 235/500      |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Confirmation                                           |
+------------------------------------------------------------------+
| Last Confirmed: 11/22/2024                                       |
| Confirmed By: rajesh.kumar@gmail.com                             |
| Method: Email                                                    |
|                                                                   |
| ☑ Send availability confirmation request to consultant           |
|   (Best practice: Confirm every 7 days for consultants on bench) |
|                                                                   |
| [Send Confirmation Request Now]                                  |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Save Changes]      |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Availability Status | Radio | Yes | - |
| Available From | Date/Radio | Yes | Cannot be in past |
| Notice Period | Dropdown | Conditional | Required if currently placed |
| Work Type | Radio | Yes | - |
| Weekly Hours | Number/Radio | Yes | 0-80 hours |
| Remote Preference | Radio | Yes | - |
| Travel Availability | Checkboxes | Yes | At least one |

**User Action:** Update availability details and preferences

**System Processing:**
1. Validates availability logic
2. Checks blackout dates against active submissions
3. If availability changes to "Not Available":
   - Warns about active submissions
   - Optionally withdraws from hotlists
4. If immediate → specific date:
   - Updates bench status
   - Adjusts marketing strategy
5. Sends confirmation email to consultant

**System Response:**
- Success toast: "Availability updated ✓"
- If immediate availability: "Consultant marked as immediate. Hotlists will include."
- If blackout dates: "Blackout dates saved. Active submissions will be notified."

**Business Rules:**
- **Immediate availability**: Required for hotlist inclusion
- **Blackout dates**: Must notify active submissions
- **Confirmation**: Required every 7 days for bench consultants
- **Not available**: Auto-removes from active marketing

**Time:** ~4-6 minutes

---

### Step 6: Edit Work Authorization

**User Action:** Click "Edit" button on Work Authorization section

**Modal Opens:**
```
+------------------------------------------------------------------+
|                 Edit Work Authorization                      [×] |
+------------------------------------------------------------------+
| ⚠ CRITICAL: Immigration changes may require compliance review    |
+------------------------------------------------------------------+
|                                                                   |
| Work Authorization Status: *                                      |
| [H1B - Temporary Worker in Specialty Occupation           ▼]     |
|                                                                   |
| Options:                                                          |
| • US Citizen                                                     |
| • Green Card / Permanent Resident                                |
| • H1B - Temporary Worker                                         |
| • H4 EAD - H4 Visa with Employment Authorization                 |
| • L1 - Intracompany Transfer                                     |
| • TN - NAFTA Professional (Canada/Mexico)                        |
| • OPT - Optional Practical Training (F1 Student)                 |
| • CPT - Curricular Practical Training                            |
| • Asylum/Refugee EAD                                             |
| • GC EAD - Green Card EAD                                        |
| • Other (specify)                                                |
|                                                                   |
+------------------------------------------------------------------+
| H1B Details (shown because H1B selected)                          |
+------------------------------------------------------------------+
| Current Employer/Sponsor: *                                       |
| [InTime Staffing Solutions                                 ]      |
|                                                                   |
| H1B Approval Notice (I-797):                                      |
| Receipt Number: * [WAC2012345678                           ]      |
| Case Status: [Approved                                     ▼]     |
| Options: Approved, Pending, Denied, Withdrawn                    |
|                                                                   |
| Validity Period: *                                                |
| Valid From: [03/15/2020         ]                                |
| Valid Until: [03/15/2026         ]                               |
|                                                                   |
| Days Remaining: 472 days (1 year, 3 months)                      |
| ⚠ Renewal needed by: 09/15/2025 (6 months prior)                |
|                                                                   |
+------------------------------------------------------------------+
| Transfer Information                                              |
+------------------------------------------------------------------+
| Transfer Ready: *                                                 |
| ● Yes (can transfer to new employer)                             |
| ○ No (not eligible for transfer)                                 |
| ○ Unknown / Need to verify                                       |
|                                                                   |
| Transfer Timeline: (typical processing time)                      |
| [2-3 weeks (standard processing)                           ▼]     |
| Options: 1-2 weeks (premium), 2-3 weeks (standard), 3-4 weeks   |
|                                                                   |
| Transfer Requirements:                                            |
| ☑ I-94 current and valid                                         |
| ☑ Passport valid >6 months                                       |
| ☑ No gaps in H1B status                                          |
| ☑ Currently in valid H1B status                                  |
|                                                                   |
| Transfer Notes:                                                   |
| [Currently with InTime. Can start new project via H1B      ]      |
| [transfer. No premium processing needed unless urgent.     ]      |
| [Attorney: John Smith (john@immigrationlaw.com)            ]      |
| [                                                 ] 168/500      |
|                                                                   |
+------------------------------------------------------------------+
| Sponsorship & Immigration                                         |
+------------------------------------------------------------------+
| Requires Sponsorship: *                                           |
| ○ Yes (needs new sponsorship)                                    |
| ● No (H1B transfer only, no new sponsorship)                     |
|                                                                   |
| Green Card Process:                                               |
| ☑ Green Card in process                                          |
| Stage: [I-140 Approved (waiting for priority date)        ▼]     |
| Priority Date: [06/15/2022         ]                             |
| Expected Completion: [2025-2026 (estimated)                ]      |
|                                                                   |
+------------------------------------------------------------------+
| I-94 & Travel Information                                         |
+------------------------------------------------------------------+
| Latest I-94 Number: [12345678901                           ]      |
| I-94 Expiry: [03/15/2026         ]                               |
| Last Entry to US: [08/20/2023         ]                          |
|                                                                   |
| Passport Information:                                             |
| Country: [India                                            ▼]     |
| Passport Number: [J1234567                                 ]      |
| Issue Date: [05/10/2018         ]                                |
| Expiry Date: [05/09/2028         ] ✅ Valid >6 months            |
|                                                                   |
| Travel Restrictions:                                              |
| ☐ Cannot travel outside US (pending status change)               |
| ☑ Can travel with valid H1B stamp                                |
| ☐ H1B stamp expired (can travel but needs visa renewal)          |
|                                                                   |
| Last Travel: [08/2023 - India (family visit)               ]      |
| Next Planned Travel: [12/2024 - India (holiday)            ]      |
|                                                                   |
+------------------------------------------------------------------+
| Employment Restrictions                                           |
+------------------------------------------------------------------+
| Can work for:                                                     |
| ● Any employer (after H1B transfer approved)                     |
| ○ Current employer only                                          |
| ○ Specific employers (list):                                     |
|                                                                   |
| Concurrent Employment:                                            |
| ☐ Allowed (has multiple H1B approvals)                           |
| ☑ Not allowed (single H1B only)                                  |
|                                                                   |
| Work Location Restrictions:                                       |
| ☐ Limited to specific states (H1B LCA restriction)               |
| ☑ Can work in any state (LCA filed for nationwide)               |
|                                                                   |
| If limited, allowed locations:                                    |
| [                                                          ]      |
|                                                                   |
+------------------------------------------------------------------+
| Compliance & Documents                                            |
+------------------------------------------------------------------+
| Document Uploads:                                                 |
|                                                                   |
| H1B Approval Notice (I-797): *                                    |
| ✅ H1B_I797_Approval.pdf (1.2 MB)                                |
|    Uploaded: 10/15/2024                                          |
|    [Download] [Replace] [Preview]                                |
|                                                                   |
| I-94 (Arrival/Departure Record):                                  |
| ✅ I94_Current.pdf (245 KB)                                      |
|    [Download] [Replace] [Preview]                                |
|                                                                   |
| Passport (bio page):                                              |
| ✅ Passport_Bio_Page.pdf (187 KB)                                |
|    [Download] [Replace] [Preview]                                |
|                                                                   |
| EAD Card (if applicable):                                         |
| ☐ Not applicable for H1B                                         |
|                                                                   |
| [+ Add Document]                                                 |
|                                                                   |
| Document Expiry Alerts:                                           |
| ☑ Alert 6 months before H1B expiry (09/15/2025)                  |
| ☑ Alert 3 months before H1B expiry (12/15/2025)                  |
| ☑ Alert when passport <6 months validity                         |
|                                                                   |
+------------------------------------------------------------------+
| Compliance Review                                                 |
+------------------------------------------------------------------+
| Last Compliance Review: 10/20/2024                               |
| Reviewed By: compliance@intime.com                               |
| Status: ✅ Compliant                                             |
| Next Review: 04/20/2025 (every 6 months)                         |
|                                                                   |
| ☑ Trigger compliance review for this update                      |
|   (Immigration team will review changes within 24 hours)         |
|                                                                   |
+------------------------------------------------------------------+
| Attorney Information                                              |
+------------------------------------------------------------------+
| Immigration Attorney:                                             |
| Name: [John Smith                                          ]      |
| Firm: [Smith Immigration Law                               ]      |
| Email: [john@smithimmigration.com                          ]      |
| Phone: [(202) 555-0199                                     ]      |
|                                                                   |
| ☑ Notify attorney of authorization changes                       |
|                                                                   |
+------------------------------------------------------------------+
| Change Tracking                                                   |
+------------------------------------------------------------------+
| Internal Notes:                                                   |
| [Updated H1B expiry date per new I-797. Compliance team    ]      |
| [verified documents. Renewal process to start 09/2025.     ]      |
| [Consultant confirmed no travel plans during transfer.     ]      |
| [                                                 ] 178/500      |
|                                                                   |
+------------------------------------------------------------------+
|                         [Cancel]  [Save & Notify Compliance]     |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Work Auth Status | Dropdown | Yes | - |
| Valid From | Date | Yes | Cannot be future |
| Valid Until | Date | Yes | Must be after Valid From |
| Transfer Ready | Radio | Yes | - |
| I-94 Number | Text | Conditional | 11 digits |
| Passport Number | Text | Conditional | 6-9 characters |
| Passport Expiry | Date | Conditional | Must be future |

**User Action:** Update work authorization details and upload documents

**System Processing:**
1. Validates immigration status logic
2. Checks document expiry dates
3. Triggers compliance review workflow:
   - Notifies immigration/compliance team
   - Sets review status to "Pending"
   - Creates compliance task
4. If expiry <90 days:
   - Sends urgent alert to manager
   - Flags consultant in system
   - Creates renewal task
5. Updates employment eligibility
6. Notifies attorney (if configured)

**System Response:**
- Success: "Work authorization updated. Compliance review requested."
- If expiring soon: "⚠ H1B expires in 120 days. Renewal process recommended."
- If expired: "🚨 ERROR: Authorization expired. Consultant cannot work. Immediate action required."

**Business Rules:**
- **Expiry <90 days**: Cannot submit to new opportunities (renewal required)
- **Expiry <30 days**: Cannot work, immediate action required
- **Status change**: Triggers compliance review (24-48 hours)
- **Document upload**: Required for H1B, EAD, Green Card
- **Immigration changes >10% approval needed from compliance**

**Time:** ~8-12 minutes (includes document uploads)

---

### Step 7: Upload/Update Resume

**User Action:** Click "Edit" button on Resume/Profile Documents section

**Modal Opens:**
```
+------------------------------------------------------------------+
|              Upload / Update Resume & Documents              [×] |
+------------------------------------------------------------------+
| Keep consultant resume current for successful submissions        |
+------------------------------------------------------------------+
|                                                                   |
| Current Resume                                                    |
+------------------------------------------------------------------+
| ✅ Rajesh_Kumar_Java_Developer.pdf                               |
| Size: 485 KB                                                     |
| Uploaded: 11/15/2024 by rajesh.kumar@gmail.com                   |
| Last Updated: 15 days ago                                        |
|                                                                   |
| ⚠ Resume is 15 days old. Best practice: Update every 30 days.   |
|                                                                   |
| [Download] [Preview] [Send to Consultant]                        |
|                                                                   |
+------------------------------------------------------------------+
| Upload New Resume                                                 |
+------------------------------------------------------------------+
| Upload Method:                                                    |
| ● Upload file                                                    |
| ○ Request from consultant (email with upload link)               |
|                                                                   |
| [Choose File] or drag and drop here                              |
|                                                                   |
| Accepted formats: PDF, DOCX, DOC                                 |
| Max file size: 5 MB                                              |
| Recommended: PDF for best compatibility                          |
|                                                                   |
| ☑ Parse resume and update profile automatically (AI)             |
| ☑ Create backup of previous version                              |
|                                                                   |
+------------------------------------------------------------------+
| Resume Parsing & Validation                                       |
+------------------------------------------------------------------+
| After upload, system will:                                        |
| ✓ Extract skills, experience, education, certifications         |
| ✓ Validate contact information matches profile                   |
| ✓ Check for common errors (formatting, missing info)             |
| ✓ Generate professional summary                                  |
| ✓ Suggest profile updates based on resume content                |
|                                                                   |
| Validation Checks:                                                |
| ☑ Contact info matches profile (email, phone)                    |
| ☑ No sensitive info (SSN, DOB, full address)                     |
| ☑ Professional formatting                                        |
| ☑ No spelling errors                                             |
| ☑ Skills section present                                         |
| ☑ Experience section present                                     |
|                                                                   |
+------------------------------------------------------------------+
| Resume Versions (History)                                         |
+------------------------------------------------------------------+
| Version 1 (Current):                                              |
| • Rajesh_Kumar_Java_Developer.pdf (485 KB)                       |
|   Uploaded: 11/15/2024 | Used in: 8 submissions                   |
|                                                                   |
| Version 2 (Previous):                                             |
| • Rajesh_Kumar_Resume_Oct2024.pdf (452 KB)                       |
|   Uploaded: 10/15/2024 | Used in: 15 submissions                  |
|   [Download] [Restore as Current] [Delete]                       |
|                                                                   |
| Version 3 (Archived):                                             |
| • Rajesh_Kumar_Resume_Sept2024.docx (234 KB)                     |
|   Uploaded: 09/10/2024 | Used in: 5 submissions                   |
|   [Download] [Restore as Current] [Delete]                       |
|                                                                   |
| Version retention: Keep last 5 versions                          |
|                                                                   |
+------------------------------------------------------------------+
| Additional Documents                                              |
+------------------------------------------------------------------+
| Supporting Documents: (optional but recommended)                  |
|                                                                   |
| Cover Letter Template:                                            |
| ☐ No cover letter uploaded                                       |
| [Upload Cover Letter]                                            |
|                                                                   |
| Certifications:                                                   |
| ✅ AWS_Solutions_Architect_Certificate.pdf (156 KB)              |
|    Issued: 06/2023 | Expires: 06/2026                            |
|    [Download] [Preview] [Replace] [Delete]                       |
|                                                                   |
| ✅ Spring_Professional_Certification.pdf (98 KB)                 |
|    Issued: 03/2022 | No expiration                               |
|    [Download] [Preview] [Replace] [Delete]                       |
|                                                                   |
| [+ Add Certification Document]                                   |
|                                                                   |
| Work Samples / Portfolio:                                         |
| ☐ No work samples uploaded                                       |
| [Upload Work Sample]                                             |
|                                                                   |
| References:                                                       |
| ☐ No reference letters uploaded                                  |
| [Upload Reference Letter]                                        |
|                                                                   |
+------------------------------------------------------------------+
| Resume Enhancement Tools                                          |
+------------------------------------------------------------------+
| [✨ AI Resume Review]                                            |
| Get AI feedback on resume quality, formatting, content           |
|                                                                   |
| [✨ Generate ATS-Optimized Resume]                               |
| Create ATS-friendly version with keyword optimization            |
|                                                                   |
| [📄 Format Resume for Submission]                                |
| Remove personal info, add InTime branding, optimize for vendor   |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Notification                                           |
+------------------------------------------------------------------+
| ☑ Notify consultant of resume update                             |
| ☑ Request consultant to review and approve                       |
|                                                                   |
| Email Template:                                                   |
| Subject: [Please Review Your Updated Resume                ]      |
| Body:                                                             |
| [Hi Rajesh,                                                ]      |
| [                                                          ]      |
| [We've updated your resume in our system. Please review   ]      |
| [and confirm it's accurate:                                ]      |
| [{{resume_preview_link}}                                   ]      |
| [                                                          ]      |
| [If you have a newer version, please upload it here:      ]      |
| [{{upload_link}}                                           ]      |
| [                                                          ]      |
| [Thanks!                                                   ]      |
|                                                                   |
+------------------------------------------------------------------+
| Change Tracking                                                   |
+------------------------------------------------------------------+
| Internal Notes:                                                   |
| [Consultant emailed updated resume with AWS certification  ]      |
| [added. Parsed successfully, updated skills section.       ]      |
| [Ready for new submissions.                                ]      |
| [                                                 ] 152/500      |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Upload & Parse]    |
+------------------------------------------------------------------+
```

**User Action (After file selected):**

**System Processing (AI Resume Parsing):**
```
+------------------------------------------------------------------+
|                    Resume Parsing Results                    [×] |
+------------------------------------------------------------------+
| ✅ Resume uploaded and parsed successfully                       |
+------------------------------------------------------------------+
|                                                                   |
| Extracted Information:                                            |
+------------------------------------------------------------------+
| Name: Rajesh Kumar ✅ Matches profile                            |
| Email: rajesh.kumar@gmail.com ✅ Matches profile                 |
| Phone: +1 (240) 555-0123 ✅ Matches profile                      |
|                                                                   |
+------------------------------------------------------------------+
| Skills Detected (18):                                             |
+------------------------------------------------------------------+
| Primary Skills (already in profile):                              |
| ✅ Java (10+ years)                                              |
| ✅ Spring Boot (8 years)                                         |
| ✅ AWS (5 years)                                                 |
| ✅ Microservices (7 years)                                       |
| ✅ REST APIs (10 years)                                          |
|                                                                   |
| New Skills Found (not in profile):                                |
| ⭐ GraphQL (2 years) [Add to Profile]                            |
| ⭐ React (3 years) [Add to Profile]                              |
| ⭐ Jenkins (5 years) [Add to Profile]                            |
|                                                                   |
| Secondary Skills (already in profile):                            |
| ✅ Docker, Kubernetes, PostgreSQL, MongoDB, Git                  |
|                                                                   |
| [Add All New Skills] [Review Individually]                       |
|                                                                   |
+------------------------------------------------------------------+
| Experience Timeline:                                              |
+------------------------------------------------------------------+
| Meta | Backend Services Engineer | 2021-2024 (3 years)           |
| Amazon | Senior Software Engineer | 2017-2021 (4 years)         |
| Infosys | Software Engineer | 2014-2017 (3 years)              |
|                                                                   |
| Total Experience: 10 years ✅ Matches profile                    |
|                                                                   |
+------------------------------------------------------------------+
| Certifications Found:                                             |
+------------------------------------------------------------------+
| ⭐ AWS Certified Solutions Architect (2023) - Already in profile |
| ⭐ Spring Professional Certification (2022) - Already in profile |
|                                                                   |
+------------------------------------------------------------------+
| Education:                                                        |
+------------------------------------------------------------------+
| ✅ MS Computer Science - University of Maryland (2012)           |
| ✅ BS Computer Science - IIT Delhi (2010)                        |
|                                                                   |
+------------------------------------------------------------------+
| Resume Quality Check:                                             |
+------------------------------------------------------------------+
| ✅ Professional formatting                                       |
| ✅ Contact information present                                   |
| ✅ Skills section well-organized                                 |
| ✅ Experience with metrics and achievements                      |
| ✅ No spelling errors detected                                   |
| ⚠ Warning: Full home address included (recommend removing)      |
| ⚠ Warning: Resume is 3 pages (recommend 2 pages max)            |
|                                                                   |
| Overall Quality Score: 85/100 (Good)                             |
|                                                                   |
+------------------------------------------------------------------+
| Suggested Profile Updates:                                        |
+------------------------------------------------------------------+
| ☑ Add GraphQL to primary skills                                  |
| ☑ Add React to secondary skills                                  |
| ☑ Add Jenkins to secondary skills                                |
| ☐ Update professional summary to mention GraphQL experience      |
|                                                                   |
| [Apply All Suggestions] [Review One-by-One]                      |
|                                                                   |
+------------------------------------------------------------------+
|                              [Close]  [Save Resume & Updates]    |
+------------------------------------------------------------------+
```

**User Action:** Review parsing results, apply suggestions, click "Save Resume & Updates"

**System Response:**
- Saves new resume as current version
- Archives previous version
- Applies profile updates (if selected)
- Updates "Profile Last Modified" timestamp
- Notifies consultant (if configured)
- Success toast: "Resume uploaded and profile updated ✓"

**Business Rules:**
- **Resume age**: Warning if >30 days old
- **Max file size**: 5 MB
- **Formats**: PDF (preferred), DOCX, DOC
- **Version history**: Keep last 5 versions
- **Parsing**: Auto-update profile with AI suggestions (reviewable)
- **Validation**: Contact info must match profile

**Time:** ~5-7 minutes (includes review and updates)

---

### Step 8: Edit Marketing Status

**User Action:** Click "Edit" button on Marketing Status section

**Modal Opens:**
```
+------------------------------------------------------------------+
|                   Edit Marketing Status                      [×] |
+------------------------------------------------------------------+
| Control how consultant is marketed to vendors and clients        |
+------------------------------------------------------------------+
|                                                                   |
| Marketing Status: *                                               |
| ● Active (actively marketing to all channels)                    |
| ○ Passive (limited marketing, by request only)                   |
| ○ Do Not Contact (on project or unavailable)                     |
| ○ On Hold (temporary pause, specific reason)                     |
|                                                                   |
+------------------------------------------------------------------+
| Marketing Channels (if Active or Passive)                         |
+------------------------------------------------------------------+
| Include in:                                                       |
| ☑ Hotlists (email distributions to vendors)                      |
| ☑ Vendor Submissions (individual job opportunities)              |
| ☑ Direct Client Marketing (client-specific opportunities)        |
| ☐ Public Talent Portal (consultant visible on website)          |
| ☐ LinkedIn Outreach                                              |
|                                                                   |
| Approval Requirements:                                            |
| ○ No approval needed (submit freely)                             |
| ● Notify consultant before submission (recommended)              |
| ○ Require consultant approval for each submission                |
|                                                                   |
+------------------------------------------------------------------+
| Marketing Restrictions                                            |
+------------------------------------------------------------------+
| Do Not Contact List: (clients/vendors to avoid)                   |
|                                                                   |
| [Vendor/Client 1]                                                 |
| Name: [Meta Platforms                                      ]      |
| Reason: [Previous employer - non-compete until 06/2025    ▼]     |
| Valid Until: [06/30/2025         ]                               |
| [× Remove]                                                       |
|                                                                   |
| [+ Add to Do Not Contact List]                                  |
|                                                                   |
| Geographic Restrictions:                                          |
| ☐ Limit to specific regions                                      |
| Allowed Regions: [All US states                            ▼]     |
|                                                                   |
| Industry Restrictions:                                            |
| ☐ Exclude specific industries                                    |
| Excluded: [None                                            ▼]     |
|                                                                   |
+------------------------------------------------------------------+
| Marketing History                                                 |
+------------------------------------------------------------------+
| Last Marketed: 11/28/2024 (2 days ago)                           |
| Method: Hotlist - "Java Developers Week of 11/25"               |
|                                                                   |
| Marketing Statistics (Last 30 Days):                              |
| • Hotlists: 8 times                                              |
| • Vendor Submissions: 12                                         |
| • Direct Client Submissions: 2                                   |
| • Total Reach: ~150 vendors/clients                              |
|                                                                   |
| Response Rate: 18% (27 responses / 150 reached)                  |
| Interview Rate: 8% (12 interviews / 150 reached)                 |
|                                                                   |
| [View Detailed Marketing Report]                                 |
|                                                                   |
+------------------------------------------------------------------+
| Marketing Preferences                                             |
+------------------------------------------------------------------+
| Marketing Message: (optional headline for hotlists)               |
| [Immediate availability | 10+ years Java | AWS Certified  ]     |
| [Meta alumni | Scalable microservices expert              ]     |
| [                                                 ] 102/200      |
|                                                                   |
| Rate Disclosure:                                                  |
| ● Show rate range in hotlists ($85-90/hr)                        |
| ○ Show "Competitive rate"                                        |
| ○ Do not disclose rate (by request only)                         |
|                                                                   |
| Profile Visibility:                                               |
| ● Full profile (name, experience, skills, rate)                  |
| ○ Anonymous profile (skills and experience only, no name)        |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Confirmation                                           |
+------------------------------------------------------------------+
| Marketing Authorization:                                          |
| ✅ Consultant has authorized marketing                           |
| Authorized On: 11/01/2024                                        |
| Authorization Valid Until: 05/01/2025 (6 months)                 |
|                                                                   |
| ☐ Request re-authorization from consultant                       |
|   (Best practice: Re-authorize every 6 months)                   |
|                                                                   |
| [Send Marketing Authorization Request]                           |
|                                                                   |
+------------------------------------------------------------------+
| Change Tracking                                                   |
+------------------------------------------------------------------+
| Internal Notes:                                                   |
| [Consultant confirmed OK to market actively. Added Meta to ]     |
| [DNC list per non-compete. Marketing performing well, 18%  ]     |
| [response rate above team average of 12%.                  ]     |
| [                                                 ] 172/500      |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Save Changes]      |
+------------------------------------------------------------------+
```

**User Action:** Update marketing preferences and restrictions

**System Response:**
- If status changed to "Do Not Contact":
  - Removes from active hotlists
  - Withdraws pending submissions (with confirmation)
  - Notifies manager
- If status changed to "Active":
  - Includes in next hotlist
  - Enables auto-matching
- Saves marketing preferences
- Updates consultant metadata

**Business Rules:**
- **Active status**: Required for hotlist inclusion
- **Do Not Contact**: Removes from all marketing immediately
- **DNC list**: Validated against active submissions (warns if conflict)
- **Authorization**: Required every 6 months (regulatory compliance)
- **Rate disclosure**: Defaults to range, customizable

**Time:** ~3-5 minutes

---

## Alternative Flows

### A1: Bulk Update Multiple Consultants

**Trigger:** Need to update rate for entire team or pod

**Actions:**
1. Navigate to Bench Consultants list
2. Select multiple consultants (checkboxes)
3. Click "Bulk Actions" → "Update Rates"
4. Modal opens with rate adjustment options
5. Apply percentage increase (e.g., +5%)
6. System calculates new rates for each consultant
7. Review changes, click "Apply to All"
8. Manager approval requested (if >10%)
9. System updates all selected consultants
10. Sends confirmation emails to all

**Time:** ~5-10 minutes for 10+ consultants

### A2: Emergency Immigration Update

**Trigger:** Consultant's H1B denied or revoked

**Actions:**
1. Open consultant profile
2. Click "Edit" on Work Authorization
3. Change status to appropriate (e.g., "Pending" or "Denied")
4. Upload denial notice
5. System immediately:
   - Withdraws all pending submissions
   - Removes from hotlists
   - Marks as "Do Not Contact"
   - Notifies manager (urgent alert)
   - Creates compliance case
6. Compliance team reviews within 24 hours
7. Immigration attorney notified automatically

**Time:** ~10-15 minutes (urgent)

### A3: Consultant-Requested Profile Update

**Trigger:** Consultant emails updated resume or rate change request

**Actions:**
1. Open consultant profile
2. Click "Request from Consultant" in resume section
3. System sends email with secure upload link
4. Consultant uploads new resume
5. System notifies recruiter
6. Recruiter reviews upload
7. System auto-parses resume
8. Recruiter reviews suggested changes
9. Applies updates to profile
10. Confirms with consultant

**Time:** ~3-5 minutes (excluding consultant wait time)

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Required, valid format, unique | "Please enter a valid, unique email address" |
| Phone | Required, valid format | "Please enter a valid phone number" |
| Rate (Expected) | Required, >0 | "Expected rate must be greater than 0" |
| Rate (Minimum) | Required, ≤Expected | "Minimum rate cannot exceed expected rate" |
| Work Auth Status | Required | "Please select work authorization status" |
| Work Auth Expiry | Required, future date | "Work authorization expiry must be in the future" |
| Resume | Required, valid format | "Please upload a valid resume (PDF, DOCX)" |
| Resume Size | ≤5 MB | "Resume file size must be less than 5 MB" |

---

## Business Rules

### Profile Update Frequency
- **Contact info**: Update as needed, verify quarterly
- **Rate**: Review monthly, update if market changes
- **Resume**: Update every 30 days (best practice)
- **Availability**: Confirm weekly for bench consultants
- **Work auth**: Review every 6 months, update if changed

### Approval Requirements
| Change Type | Approval Needed | Approver |
|-------------|-----------------|----------|
| Rate increase >10% | Yes | Manager |
| Rate increase >25% | Yes | Director |
| Rate decrease | No | - |
| Immigration status | Yes | Compliance |
| Marketing status → DNC | No | - (notify manager) |
| Contact info change | No | - (verify consultant) |

### Consultant Confirmation
| Field | Confirmation Required | Frequency |
|-------|----------------------|-----------|
| Rate changes | Yes | Immediately |
| Availability | Yes | Weekly |
| Resume updates | Yes | Each update |
| Marketing authorization | Yes | Every 6 months |
| Work auth changes | Yes | Immediately |

---

## International Considerations

### Multi-Currency Rate Management

**Example: Canadian Consultant**
```
Primary Rate: CAD $110/hr
USD Equivalent: USD $82/hr (exchange rate: 0.745)
Last Updated: 11/30/2024
```

**Fields:**
- Primary Currency: CAD
- Primary Rate: $110/hr
- Secondary Currency: USD
- Auto-convert: ✅ Yes (daily exchange rate)

### Country-Specific Visa Types

**Common by Country:**

| Country | Visa Types | Transfer Complexity |
|---------|------------|---------------------|
| USA | H1B, L1, TN, OPT, EAD | Medium-High |
| Canada | Work Permit, LMIA | Medium |
| UK | Tier 2, Tier 5 | High |
| Australia | 457, TSS | Medium |
| India | Employment Visa | Low |

### Regional Compliance

**Location-Based Rules:**
- **California**: Specific labor laws, higher rates
- **New York**: Metro area requires higher minimums
- **Government**: Security clearance requirements
- **EU**: GDPR compliance for data handling

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `e` | Edit current section (when focused) |
| `Cmd+S` | Save current edit |
| `Esc` | Cancel edit / Close modal |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd+U` | Upload file (when in upload section) |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `consultant.profile_updated` | `{ consultant_id, section, updated_fields, updated_by }` |
| `consultant.rate_changed` | `{ consultant_id, old_rate, new_rate, change_pct, approved_by }` |
| `consultant.resume_uploaded` | `{ consultant_id, file_name, file_size, uploaded_by }` |
| `consultant.work_auth_updated` | `{ consultant_id, old_status, new_status, expiry_date }` |
| `consultant.marketing_status_changed` | `{ consultant_id, old_status, new_status, reason }` |
| `consultant.availability_updated` | `{ consultant_id, available_from, notice_period }` |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Profile Accuracy | >95% | Verified vs actual |
| Resume Freshness | <30 days | Avg age of resumes |
| Rate Competitiveness | 50-75th percentile | vs market data |
| Immigration Compliance | 100% | No expired work auth |
| Update Frequency | 2-3x/week | Avg updates per consultant |
| Consultant Confirmation | <48 hours | Time to confirm changes |

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [03-market-consultant.md](./03-market-consultant.md) - Creating and sending hotlists
- [04-find-requirements.md](./04-find-requirements.md) - Finding external jobs
- [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) - Submitting consultants to jobs

---

*Last Updated: 2024-11-30*
