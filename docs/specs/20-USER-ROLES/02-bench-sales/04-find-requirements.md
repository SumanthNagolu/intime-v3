# Use Case: Find External Job Requirements for Bench Consultants

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-003 |
| Actor | Bench Sales Recruiter |
| Goal | Discover external job requirements, add to system, match to bench consultants |
| Frequency | Daily (10-15 jobs per day) |
| Estimated Time | 3-5 minutes per job |
| Priority | High (Core daily activity) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Bench consultants exist in system with complete profiles
3. User has access to external job boards (Dice, Indeed, LinkedIn, vendor portals)
4. User has permission to create external jobs
5. External job sources are configured in system

---

## Trigger

One of the following:
- Daily morning routine (job discovery block)
- Vendor emails job requirements
- Specific consultant needs opportunities (30+ days bench)
- Manager requests jobs for specific skillset
- New consultant joins bench (proactive job search)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to External Jobs Board

**Option A: From Bench Dashboard**
- User clicks "Find Jobs" button on bench dashboard

**Option B: From Sidebar**
- User clicks "External Jobs" in sidebar

**Option C: From Consultant Card**
- User clicks "Find Matching Jobs" on consultant card

**System Response:**
- External Jobs page loads
- Shows list of active external jobs
- Search and filter options available

**URL:** `/employee/workspace/bench/jobs`

**Screen State:**
```
+------------------------------------------------------------------+
|  External Jobs                    [+ Add External Job] [Import]  |
+------------------------------------------------------------------+
| [Active] [My Added] [Matched] [Expired]      [Search...] [⚙]    |
+------------------------------------------------------------------+
|                                                                   |
| Quick Actions:                                                    |
| [Scan Dice.com] [Scan Indeed] [Scan LinkedIn] [Vendor Emails]   |
+------------------------------------------------------------------+
|                                                                   |
| Active External Jobs (147)                   Sort: Date Added ▼  |
+------------------------------------------------------------------+
| Source      | Title                  | Company  | Rate    | Added  |
|-------------|------------------------|----------|---------|--------|
| Dice.com    | Senior Java Developer  | Accenture| $90-100 | 1d ago |
| Indeed.com  | Full Stack Engineer    | Meta     | $95-110 | 1d ago |
| TechStaff   | Backend Developer      | Capital1 | $85-95  | 2d ago |
| LinkedIn    | React Developer        | Netflix  | $100-120| 2d ago |
| Dice.com    | DevOps Engineer        | Amazon   | $90-105 | 3d ago |
| ... 142 more jobs ...                                             |
+------------------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Open External Job Source (Manual Search)

### Option 1: Scan Dice.com

**User Action:** Click "Scan Dice.com" OR open new browser tab to `https://dice.com`

**External Site Actions:**
1. User searches: "Java developer contract remote"
2. Filters:
   - Job Type: Contract
   - Location: Remote
   - Posted: Last 7 days
3. Reviews search results (typically 50-100 jobs)
4. Opens promising job posting

**Example Job Posting:**
```
Senior Java Developer - Remote - Contract
Accenture Federal Services
Location: Remote (US)
Rate: $90-100/hr
Posted: 1 day ago

Description:
We are seeking a Senior Java Developer with 8+ years of experience...

Requirements:
• 8+ years Java development
• Spring Boot, Microservices
• AWS cloud experience
• Strong communication skills
• US Citizen, Green Card, or H1B

To apply, submit resume to recruiting@accenture.com
```

**User evaluates job:**
- ✅ Skills match bench consultants (Java, Spring Boot, AWS)
- ✅ Rate fits consultant expectations ($85-100/hr range)
- ✅ Visa requirements match consultants (H1B OK)
- ✅ Recently posted (1 day ago, likely still active)
- ✅ Reputable company (Accenture)

**Decision:** Add to InTime OS

**Time:** ~2-3 minutes to find suitable job

---

### Step 3: Add External Job to System

**User Action:** Switch back to InTime OS, click "+ Add External Job"

**Modal Opens:**
```
+------------------------------------------------------------------+
|                    Add External Job                          [×] |
+------------------------------------------------------------------+
| Source Information                                                |
+------------------------------------------------------------------+
| Source: *                                                         |
| [Dice.com                                                  ▼]     |
|                                                                   |
| Job URL: *                                                        |
| [https://dice.com/jobs/detail/senior-java-dev-12345       ]      |
|                                                                   |
| Source Job ID: (optional)                                         |
| [12345                                               ]            |
|                                                                   |
| ☑ Auto-fill from URL (scrape job details)                        |
+------------------------------------------------------------------+
| Job Details *                                                     |
+------------------------------------------------------------------+
| Title: *                                                          |
| [Senior Java Developer - Remote                           ]      |
|                                                                   |
| Company: *                                                        |
| [Accenture Federal Services                               ]      |
|                                                                   |
| Description:                                                      |
| [We are seeking a Senior Java Developer with 8+ years of  ]      |
| [experience in building enterprise applications. The ideal]      |
| [candidate will have strong Spring Boot and AWS skills... ]      |
| [                                                          ]      |
| [                                                          ]      |
| [                                                 ] 285/5000      |
|                                                                   |
+------------------------------------------------------------------+
| Location & Remote                                                 |
+------------------------------------------------------------------+
| Location:                                                         |
| [Remote (US-based)                                         ]      |
|                                                                   |
| Remote Work:                                                      |
| ● Fully Remote                                                   |
| ○ Hybrid (specify location)                                      |
| ○ On-site Only                                                   |
|                                                                   |
+------------------------------------------------------------------+
| Rate Range *                                                      |
+------------------------------------------------------------------+
| Min Rate: $[90     ] /hr    Max Rate: $[100    ] /hr             |
|                                                                   |
| Rate Type: ● Hourly  ○ Daily  ○ Annual                           |
|                                                                   |
+------------------------------------------------------------------+
| Requirements                                                      |
+------------------------------------------------------------------+
| Required Skills: * (comma-separated or select from list)          |
| [Java, Spring Boot, AWS, Microservices, REST APIs         ]      |
|                                                                   |
| OR [Select from list ▼]                                          |
| ☑ Java  ☑ Spring Boot  ☑ AWS  ☑ Microservices  ☑ REST APIs      |
|                                                                   |
| Minimum Experience: *                                             |
| [8      ] years                                                  |
|                                                                   |
| Visa Requirements: *                                              |
| ☑ US Citizen                                                     |
| ☑ Green Card                                                     |
| ☑ H1B                                                            |
| ☐ EAD                                                            |
| ☐ TN Visa                                                        |
| ☐ No Sponsorship (Citizens/GC only)                              |
|                                                                   |
| Security Clearance Required:                                      |
| ○ None                                                           |
| ○ Public Trust                                                   |
| ○ Secret                                                         |
| ○ Top Secret                                                     |
|                                                                   |
+------------------------------------------------------------------+
| Job Validity                                                      |
+------------------------------------------------------------------+
| Posted/Scraped Date: *                                            |
| [11/30/2024                  ] (today)                           |
|                                                                   |
| Expires On: *                                                     |
| [12/30/2024                  ] (30 days default)                 |
|                                                                   |
| Auto-expire in: [30     ] days (system will mark expired)        |
|                                                                   |
+------------------------------------------------------------------+
| Contact Information (if available)                                |
+------------------------------------------------------------------+
| Contact Email:                                                    |
| [recruiting@accenture.com                                  ]      |
|                                                                   |
| Contact Name: (optional)                                          |
| [                                                          ]      |
|                                                                   |
| Contact Phone: (optional)                                         |
| [                                                          ]      |
|                                                                   |
+------------------------------------------------------------------+
| Auto-Matching                                                     |
+------------------------------------------------------------------+
| ☑ Auto-match to bench consultants after saving                   |
| ☑ Notify me of matching consultants (email + notification)       |
|                                                                   |
+------------------------------------------------------------------+
|                                [Cancel]  [Save & Match Jobs →]   |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Max Length | Validation |
|-------|------|----------|------------|------------|
| Source | Dropdown | Yes | - | Must select from predefined sources |
| Job URL | URL | Yes | 500 | Must be valid URL |
| Source Job ID | Text | No | 100 | - |
| Title | Text | Yes | 200 | Min 10 chars |
| Company | Text | Yes | 200 | Min 2 chars |
| Description | Textarea | No | 5000 | - |
| Location | Text | Yes | 200 | - |
| Remote Work | Radio | Yes | - | - |
| Min Rate | Decimal | Yes | - | Must be >0, <Max |
| Max Rate | Decimal | Yes | - | Must be >Min |
| Required Skills | Text/Multi-select | Yes | - | At least 1 skill |
| Min Experience | Integer | Yes | - | 0-50 years |
| Visa Requirements | Checkboxes | Yes | - | At least 1 checked |
| Posted Date | Date | Yes | - | Cannot be future |
| Expires On | Date | Yes | - | Must be after posted date |

**Auto-fill Feature:**
- If "Auto-fill from URL" is checked and URL is from supported source (Dice, Indeed)
- System scrapes job page and auto-populates:
  - Title
  - Company
  - Description
  - Location
  - Rate (if present)
  - Skills (parsed from description)
- User reviews and edits as needed

**Time:** ~3-5 minutes to fill form (faster with auto-fill)

---

### Step 4: Save External Job

**User Action:** Click "Save & Match Jobs →"

**System Processing:**
1. **Validation:** Checks all required fields
2. **Deduplication:** Checks if job already exists
   - Matches on: Source + Source Job ID OR URL OR Company + Title
   - If duplicate found: Shows warning "Similar job exists: [link]. Continue anyway?"
3. **Save:** Creates external job record in database
4. **Parse Skills:** Extracts and normalizes skills
5. **Auto-Matching:** Runs matching algorithm against bench consultants
   - Compares: Required skills, experience, rate range, location, visa
   - Generates match scores (0-100%)
6. **Notify:** Sends notification if matches found

**System Response (Success):**
- Toast: "External job added ✓"
- Redirects to job detail OR matching consultants modal

**Time:** ~2 seconds processing

---

### Step 5: Review Matched Consultants

**Modal Opens:**
```
+------------------------------------------------------------------+
|    Matched Consultants: Senior Java Developer @ Accenture    [×] |
+------------------------------------------------------------------+
| Job Details: Remote | $90-100/hr | 8+ yrs | Java, Spring, AWS    |
+------------------------------------------------------------------+
|                                                                   |
| Top Matches (5 consultants)                                       |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✅ EXCELLENT MATCH (95%)          Rajesh Kumar - 42d bench 🟠 │ |
| │                                                               │ |
| │ Java Developer | $85/hr | H1B ✓ | Remote ✓ | 10 yrs exp ✓    │ |
| │                                                               │ |
| │ Matching Skills (5/5):                                        │ |
| │ ✓ Java ★★★★★  ✓ Spring Boot ★★★★★  ✓ AWS ★★★★☆             │ |
| │ ✓ Microservices ★★★★★  ✓ REST APIs ★★★★★                    │ |
| │                                                               │ |
| │ ✅ Rate: $85/hr (within job range $90-100)                    │ |
| │ ✅ Experience: 10 years (exceeds minimum 8 years)             │ |
| │ ✅ Location: Remote OK                                        │ |
| │ ✅ Visa: H1B accepted by job                                  │ |
| │ ✅ Availability: Immediate                                    │ |
| │                                                               │ |
| │ ⚠ Priority: HIGH - 42 days on bench                           │ |
| │                                                               │ |
| │ [View Profile] [Submit to Job →] [Contact Consultant]        │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ✅ EXCELLENT MATCH (88%)          John Smith - 35d bench 🟠   │ |
| │                                                               │ |
| │ Full Stack Developer | $90/hr | Citizen ✓ | Remote ✓ | 8 yrs │ |
| │                                                               │ |
| │ Matching Skills (5/5):                                        │ |
| │ ✓ Java ★★★★☆  ✓ Spring ★★★★☆  ✓ AWS ★★★★☆                  │ |
| │ ✓ Microservices ★★★★☆  ✓ REST APIs ★★★★★                    │ |
| │                                                               │ |
| │ Additional Skills: React, Node.js (bonus for full stack)     │ |
| │                                                               │ |
| │ ✅ Rate: $90/hr (at bottom of range)                          │ |
| │ ✅ Experience: 8 years (meets minimum)                        │ |
| │ ✅ Location: Remote only                                      │ |
| │ ✅ Visa: US Citizen (preferred)                               │ |
| │ ✅ Availability: Immediate                                    │ |
| │                                                               │ |
| │ ⚠ Priority: HIGH - 35 days on bench                           │ |
| │                                                               │ |
| │ [View Profile] [Submit to Job →] [Contact Consultant]        │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ⚠ GOOD MATCH (72%)               David Chen - 12d bench 🟢   │ |
| │                                                               │ |
| │ DevOps Engineer | $95/hr | H1B ✓ | Remote ✓ | 6 yrs exp      │ |
| │                                                               │ |
| │ Matching Skills (3/5):                                        │ |
| │ ✓ Java ★★★☆☆  ✓ AWS ★★★★★  ✓ REST APIs ★★★☆☆               │ |
| │ ✗ Spring Boot ★☆☆☆☆  ✗ Microservices ★★☆☆☆                  │ |
| │                                                               │ |
| │ Additional Skills: Docker, Kubernetes, Python (DevOps focus) │ |
| │                                                               │ |
| │ ✅ Rate: $95/hr (within range)                                │ |
| │ ⚠ Experience: 6 years (below minimum 8 years)                │ |
| │ ✅ Location: Remote OK                                        │ |
| │ ✅ Visa: H1B accepted                                         │ |
| │ ✅ Availability: Immediate                                    │ |
| │                                                               │ |
| │ ℹ Notes: Skills gap in Spring/Microservices, junior exp      │ |
| │                                                               │ |
| │ [View Profile] [Maybe Later] [Not a Fit]                     │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| No Match: Priya (React focus), Maria (QA), Ahmed (Data Analyst) |
+------------------------------------------------------------------+
|                                                                   |
| [Close] [Submit Selected Consultants (0 selected)]               |
+------------------------------------------------------------------+
```

**Match Score Algorithm:**

**Components:**
1. **Skills Match (40%)**
   - Required skills coverage: 5/5 skills = 40%, 4/5 = 32%, etc.
   - Skill proficiency level: Expert = 100%, Intermediate = 75%, Beginner = 50%
   - Bonus: Additional relevant skills = +5%

2. **Experience Match (20%)**
   - Meets minimum: 20%
   - Exceeds by 2+ years: +5%
   - Below minimum: -10% per year short

3. **Rate Match (20%)**
   - Within range: 20%
   - Below range: 15% (good for margin)
   - Above range: 10% (may be too expensive)
   - Way above range (>10%): 0%

4. **Location Match (10%)**
   - Perfect match: 10%
   - Compatible (remote OK): 8%
   - Hybrid compatible: 5%
   - Not compatible: 0%

5. **Visa Match (10%)**
   - Matches job requirement: 10%
   - Not on job's list: 0%

**Match Score Categories:**
- 90-100%: Excellent Match ✅ (submit immediately)
- 75-89%: Good Match ✅ (submit with confidence)
- 60-74%: Fair Match ⚠ (submit if consultant is priority or limited options)
- <60%: Poor Match ❌ (not recommended)

**Time:** ~1 minute to review

---

### Step 6: Bulk Submit Matched Consultants

**User Action:** Select top 2 matches (Rajesh, John) by clicking checkboxes

**User Action:** Click "Submit Selected Consultants (2 selected)"

**System Response:**
- Opens bulk submission form
- Pre-fills consultant and job information
- User completes submission details for each

**Bulk Submission Modal:**
```
+------------------------------------------------------------------+
|           Submit 2 Consultants to External Job               [×] |
+------------------------------------------------------------------+
| Job: Senior Java Developer @ Accenture (Dice.com)                |
| Rate: $90-100/hr | Remote | H1B OK                               |
+------------------------------------------------------------------+
|                                                                   |
| [Consultant 1: Rajesh] [Consultant 2: John]  (tabs)              |
+------------------------------------------------------------------+
|                                                                   |
| Consultant 1: Rajesh Kumar                                        |
+------------------------------------------------------------------+
| Resume Version: *                                                 |
| ● Rajesh_Kumar_Java_Developer.pdf (uploaded 11/15)              |
| ○ Create new formatted version                                   |
|                                                                   |
| [Preview Resume]                                                  |
+------------------------------------------------------------------+
| Submitted Rate: *                                                 |
| Consultant Rate: $85/hr                                          |
| Submit at: $[92    ] /hr (within job range $90-100)              |
|                                                                   |
| Margin: ~8% (company profit)                                     |
+------------------------------------------------------------------+
| Consultant Highlights: * (sent to vendor)                         |
| [• 10+ years Java development, Spring Boot expert          ]     |
| [• AWS Certified Solutions Architect                       ]     |
| [• Built scalable microservices at Meta (10M+ req/day)     ]     |
| [• Excellent communication, team player                    ]     |
| [• Available immediately, H1B transfer ready               ]     |
| [                                                 ] 265/1000     |
|                                                                   |
| ☐ Use AI to generate highlights                                 |
+------------------------------------------------------------------+
| Internal Notes: (not sent)                                        |
| [Rajesh 42 days bench, highly motivated, rate flexible     ]     |
| [                                                 ] 58/500       |
+------------------------------------------------------------------+
| Pre-Submission Checklist:                                         |
| ☑ Contacted consultant today                                     |
| ☑ Consultant confirmed available                                 |
| ☑ Rate approved by consultant                                    |
| ☑ Resume current (<30 days)                                      |
| ☑ Visa verified (H1B valid until 2026-03-15)                     |
+------------------------------------------------------------------+
|                                                                   |
| Submission Method:                                                |
| ● Email to: recruiting@accenture.com                             |
| ○ Manual (I will submit externally)                              |
+------------------------------------------------------------------+
|                  [← Previous] [Next: John →] [Submit All (2) →]  |
+------------------------------------------------------------------+
```

**User Action:** Complete details for Rajesh, click "Next: John →"

**User Action:** Complete details for John, click "Submit All (2) →"

**System Processing:**
1. Creates 2 bench submission records
2. Generates submission emails
3. Sends emails to vendor
4. Updates consultant "last submitted" timestamps
5. Updates external job "submission count"
6. Creates activities for both consultants
7. Notifies manager (2 submissions)

**System Response:**
- Progress indicator
- Success toast: "2 consultants submitted to Accenture ✓"
- Redirects to bench submissions list
- Shows both submissions in "Submitted to Vendor" status

**Time:** ~5-10 minutes for 2 submissions

---

## Alternative Flows

### A1: Import Jobs via Email

**Trigger:** Vendor sends email with job requirements

**Email Example:**
```
From: vendor@techstaff.com
Subject: Urgent: Senior Java Developer - Capital One

Hi,

We have an urgent need for a Senior Java Developer at Capital One.

Position: Senior Java Developer
Client: Capital One
Location: McLean, VA (Hybrid)
Rate: $95-105/hr
Duration: 6 months
Start: ASAP

Requirements:
- 8+ years Java
- Spring Boot, Microservices
- AWS experience
- Banking domain preferred
- Must be US Citizen or Green Card

Please send resumes ASAP.

Thanks,
John Smith
TechStaff Solutions
```

**Actions:**
1. User clicks "Import" button on External Jobs page
2. Selects "Email Import"
3. Modal opens with email parser
4. User pastes email OR forwards email to system address
5. AI parses email and extracts:
   - Title: "Senior Java Developer"
   - Company: "Capital One"
   - Vendor: "TechStaff Solutions"
   - Location: "McLean, VA (Hybrid)"
   - Rate: "$95-105/hr"
   - Skills: "Java, Spring Boot, Microservices, AWS"
   - Visa: "US Citizen, Green Card"
6. User reviews auto-filled form
7. User corrects any errors
8. User clicks "Save & Match"
9. System matches to consultants

**Time:** ~2 minutes (faster than manual entry)

### A2: Scan Job Board (Automated)

**Trigger:** User clicks "Scan Dice.com" button

**System Actions:**
1. Opens Dice.com scraper
2. Runs predefined search queries:
   - "Java developer contract"
   - ".NET developer contract"
   - "React developer contract"
   - "DevOps engineer contract"
3. Scrapes first 10 results per query (40 jobs total)
4. Deduplicates against existing jobs
5. Shows "New Jobs Found" modal with 15 new jobs
6. User reviews list
7. User selects jobs to import (checkboxes)
8. User clicks "Import Selected"
9. System creates external job records
10. System runs auto-matching
11. Notifies user of matches

**Time:** ~5 minutes for bulk import

### A3: Job Expired / Filled

**Trigger:** Vendor responds: "This position has been filled"

**Actions:**
1. User opens external job detail
2. User clicks "Mark as Filled"
3. Confirmation modal: "Are you sure? This will close all active submissions."
4. User confirms
5. System updates:
   - Job status: "active" → "filled"
   - All submissions: "submitted_to_vendor" → "rejected" with reason "Position filled"
6. Job removed from active matching
7. Consultants notified (if they were waiting for response)

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Source | Required | "Please select a job source" |
| Job URL | Required, valid URL | "Please enter a valid job URL" |
| Title | Required, min 10 chars | "Job title is required (min 10 characters)" |
| Company | Required, min 2 chars | "Company name is required" |
| Min Rate | Required, >0 | "Minimum rate must be greater than 0" |
| Max Rate | Required, >Min | "Maximum rate must be greater than minimum" |
| Skills | Required, min 1 | "Please add at least one required skill" |
| Min Experience | Required, 0-50 | "Please enter minimum years of experience" |
| Visa | Required, min 1 | "Please select at least one visa type" |
| Posted Date | Required, not future | "Posted date cannot be in the future" |
| Expires On | Required, after posted | "Expiry date must be after posted date" |

**Duplicate Detection:**
- Checks: Same source + source job ID
- Checks: Same URL
- Checks: Same company + similar title (<3 words different)
- If duplicate: "Similar job exists: [Job Title]. Continue anyway? [Yes] [No] [View Existing]"

---

## Business Rules

### Job Eligibility
- ✅ Posted within last 30 days (fresh jobs only)
- ✅ Contract or contract-to-hire (not full-time perm)
- ✅ Rate disclosed or estimable
- ✅ Clear skills requirements
- ✅ Visa requirements disclosed
- ❌ No rate disclosed: Low priority, estimate range
- ❌ Posted >30 days ago: Likely filled, mark expired

### Auto-Expiry
- Jobs expire automatically after configured days (default 30)
- System marks as "expired" and removes from active matching
- Bench rep can manually extend expiry if job still active

### Submission Limits
- Maximum 3 active submissions per consultant per external job
- Cannot submit same consultant to same external job twice within 30 days
- Must wait for response before re-submitting

### Rate Guidelines
- Submitted rate should be within job's min-max range
- Ideal margin: 15-25% (company profit)
- Minimum margin: 10% (below requires manager approval)
- Can submit below job minimum if consultant rate is low (upside for client)

---

## External Job Sources

### Supported Job Boards

| Source | Type | Auto-Fill | Scraping | API |
|--------|------|-----------|----------|-----|
| Dice.com | Public | ✅ | ✅ | ❌ |
| Indeed.com | Public | ✅ | ✅ | ❌ |
| LinkedIn Jobs | Public | ✅ | ⚠ Limited | ❌ |
| ClearedJobs | Public | ✅ | ❌ | ❌ |
| CyberCoders | Public | ✅ | ❌ | ❌ |
| Vendor Email | Private | ⚠ AI Parse | ❌ | ❌ |
| Vendor Portal | Private | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Fully supported
- ⚠ Partially supported
- ❌ Not supported (manual entry)

### Job Board Search Strategies

**Dice.com:**
- Search: "[Skill] developer contract [Location]"
- Filters: Job Type = Contract, Posted = Last 7 days
- Sort: Date (newest first)
- Target: 10-15 jobs per day

**Indeed.com:**
- Search: "[Skill] consultant remote"
- Filters: Job Type = Contract, Salary = $80k+
- Sort: Date
- Target: 5-10 jobs per day

**LinkedIn Jobs:**
- Search: "[Skill] #OpenToWork contract"
- Filters: Job Type = Contract, Experience = Mid-Senior
- Network: 2nd/3rd degree connections (warm leads)
- Target: 3-5 jobs per day

**Vendor Emails:**
- Check inbox for vendor job blasts
- Filter by subject: "urgent", "contract", "requirement"
- Parse and import
- Target: 5-10 jobs per day

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | Add new external job |
| `i` | Import from email |
| `s` | Scan job board |
| `m` | View matches |
| `Enter` | Save job (when in form) |
| `Esc` | Cancel / Close modal |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `external_job.created` | `{ job_id, source, title, company, created_by }` |
| `external_job.matched` | `{ job_id, matched_consultant_ids, match_scores }` |
| `external_job.submitted` | `{ job_id, consultant_id, submission_id }` |
| `external_job.expired` | `{ job_id, reason, expired_at }` |
| `external_job.filled` | `{ job_id, filled_by_consultant_id, filled_at }` |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Jobs Added per Day | 10-15 | Daily count |
| Auto-Match Rate | >60% | Jobs with matches / Total jobs |
| Submission Conversion | >20% | Submissions from job / Total matches |
| Job Accuracy | >80% | Active jobs / Total jobs (not expired) |
| Time per Job | <5 min | Avg time to add job |

---

## Common Job Board Patterns

### Contract Keywords
- "Contract", "C2C", "Corp-to-Corp", "W2 Contract"
- "Consultant", "Contractor", "Freelance"
- "Contract to Hire", "C2H"

### Rate Indicators
- "$90-100/hr", "$95/hour", "$95-105 hourly"
- "Up to $100/hr", "Max $110/hr"
- "DOE" (Depends on Experience) - estimate based on market

### Red Flags (Avoid)
- "Full-time permanent only"
- "No sponsorship, no third party"
- "Direct hire only, no agencies"
- No rate disclosed and no response to inquiry
- Job posted >60 days ago

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [03-market-consultant.md](./03-market-consultant.md) - Creating hotlists for consultants
- [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) - Submitting consultants to external jobs

---

*Last Updated: 2024-11-30*
