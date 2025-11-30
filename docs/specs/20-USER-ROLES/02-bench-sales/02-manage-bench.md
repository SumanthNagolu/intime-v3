# Use Case: View and Manage Bench Consultants

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-001 |
| Actor | Bench Sales Recruiter |
| Goal | Monitor bench consultants, update status, track engagement, reduce days on bench |
| Frequency | Multiple times daily |
| Estimated Time | 2-5 minutes per consultant |
| Priority | High (Core workflow) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. User has bench consultants assigned
3. Consultants exist in system with "On Bench" status
4. User has permission to view and update assigned consultants

---

## Trigger

One of the following:
- Daily morning routine (reviewing bench status)
- System alert (consultant reaching 30/60 day threshold)
- New consultant added to bench
- Consultant status change (project ending)
- Manager assigns new bench consultant

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Bench Dashboard

**User Action:** User logs in or clicks "Bench" in sidebar

**System Response:**
- Bench Dashboard loads at `/employee/workspace/bench`
- Dashboard displays overview widgets and consultant cards
- Real-time data loads (bench count, average days, alerts)

**URL:** `/employee/workspace/bench`

**Time:** ~2 seconds

---

### Step 2: Review Bench Overview Metrics

**System Display:**

```
+------------------------------------------------------------------+
|  Bench Dashboard                     [Refresh ⟳] [Settings ⚙]   |
+------------------------------------------------------------------+
| Bench Overview                                    Updated: 8:15am|
+------------------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐  |
| │ Total On Bench  │ │ Average Days    │ │ Bench Utilization  │  |
| │      12         │ │      38         │ │       28%          │  |
| │ consultants     │ │   days on bench │ │   (12/43 total)    │  |
| │                 │ │                 │ │                    │  |
| │ ▲ 2 from last wk│ │ ▼ 5 days better │ │ ✓ Below 30% target │  |
| └─────────────────┘ └─────────────────┘ └────────────────────┘  |
+------------------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐  |
| │ Alert Status    │ │ This Week       │ │ Sprint Progress    │  |
| │ 🔴 0 Critical   │ │ ✓ 2 Placed      │ │ Placements: 0/1    │  |
| │ 🟠 3 Urgent     │ │ → 18 Submitted  │ │ Days Left: 8       │  |
| │ 🟢 9 Normal     │ │ ⚠ 7 Interviews  │ │                    │  |
| │                 │ │   📅 Scheduled  │ │ ⚠ Behind pace      │  |
| └─────────────────┘ └─────────────────┘ └────────────────────┘  |
+------------------------------------------------------------------+
```

**Metrics Explained:**
- **Total On Bench**: Count of consultants currently not placed
- **Average Days**: Mean days on bench across all consultants
- **Bench Utilization**: % of total consultants on bench (lower is better)
- **Alert Status**: Count by urgency level
- **This Week**: Activity summary (placements, submissions, interviews)
- **Sprint Progress**: 2-week sprint placement goal

**Time:** ~30 seconds to review

---

### Step 3: View Consultant Cards (My Consultants)

**System Display:**

```
+------------------------------------------------------------------+
| My Consultants (Assigned: 6)                                      |
| [All] [Green] [Orange] [Red] [New]        [Filter ▼] [Sort ▼]   |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟠 Rajesh Kumar                              [⋮ More Actions] │ |
| │ Java Developer                                      Match: 95% │ |
| │                                                                │ |
| │ 📅 42 days on bench (started: 10/19)      🎯 Priority: HIGH   │ |
| │ 💼 Last project: Meta (3 years)             📍 DC/Remote      │ |
| │ 💵 Rate: $85/hr                            🛂 H1B → 2026-03   │ |
| │                                                                │ |
| │ Skills: Java, Spring Boot, AWS, Microservices, REST APIs      │ |
| │                                                                │ |
| │ 🔄 Active Submissions: 2                                       │ |
| │   • Accenture - Senior Java Dev (submitted 11/28)             │ |
| │   • Capital One - Backend Engineer (interview 12/2)           │ |
| │                                                                │ |
| │ 📞 Last Contact: 2 days ago (11/28)                            │ |
| │ 📋 Next Action: Follow up on interview prep                    │ |
| │                                                                │ |
| │ [View Profile] [Marketing] [Submit] [Log Activity] [Contact]  │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟠 John Smith                                [⋮ More Actions] │ |
| │ Full Stack Developer                              Match: 88%  │ |
| │                                                                │ |
| │ 📅 35 days on bench (started: 10/26)      🎯 Priority: HIGH   │ |
| │ 💼 Last project: Amazon (2 years)          📍 Remote only     │ |
| │ 💵 Rate: $90/hr                           🛂 US Citizen       │ |
| │                                                                │ |
| │ Skills: Java, Spring, React, Node.js, AWS, Docker             │ |
| │                                                                │ |
| │ 🔄 Active Submissions: 1                                       │ |
| │   • TechStaff - Full Stack Role (vendor review)               │ |
| │                                                                │ |
| │ 📞 Last Contact: 1 day ago (11/29)                             │ |
| │ 📋 Next Action: Find 3 more opportunities                      │ |
| │                                                                │ |
| │ [View Profile] [Marketing] [Submit] [Log Activity] [Contact]  │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟢 Priya Sharma                              [⋮ More Actions] │ |
| │ React Developer                                   Match: 92%  │ |
| │                                                                │ |
| │ 📅 18 days on bench (started: 11/12)     🎯 Priority: NORMAL  │ |
| │ 💼 Last project: Google (18 months)       📍 Bay Area/Remote  │ |
| │ 💵 Rate: $95/hr                            🛂 Green Card      │ |
| │                                                                │ |
| │ Skills: React, TypeScript, Node, GraphQL, AWS                 │ |
| │                                                                │ |
| │ 🔄 Active Submissions: 3                                       │ |
| │   • Meta - Frontend Engineer (interview scheduled 12/3)       │ |
| │   • Netflix - React Developer (submitted 11/29)               │ |
| │   • Airbnb - UI Engineer (vendor review)                      │ |
| │                                                                │ |
| │ 📞 Last Contact: 5 hours ago (today)                           │ |
| │ 📋 Next Action: Prep for Meta interview                        │ |
| │                                                                │ |
| │ [View Profile] [Marketing] [Submit] [Log Activity] [Contact]  │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ... 3 more consultants (David, Maria, Ahmed) ...                 |
+------------------------------------------------------------------+
```

**Card Color Coding:**
- 🟢 **Green**: 0-30 days on bench (normal status)
- 🟠 **Orange**: 31-60 days on bench (urgent - needs focus)
- 🔴 **Red**: 61+ days on bench (critical - manager escalation)

**Card Information:**
- Name, title, match score (to recent jobs)
- Days on bench, bench start date, priority level
- Last project, location preference, visa status
- Skills list
- Active submissions count and details
- Last contact date, next action
- Quick action buttons

**Time:** ~1 minute to scan all cards

---

### Step 4: Filter and Sort Consultants

**User Action:** Click "Filter ▼" dropdown

**Filter Options:**
```
+----------------------------------+
| Filter Consultants               |
+----------------------------------+
| Status:                          |
| ☑ On Bench                       |
| ☐ Placed (recently)              |
| ☐ In Transit (project ending)    |
|                                  |
| Days on Bench:                   |
| ☐ 0-15 days (New)                |
| ☐ 16-30 days (Normal)            |
| ☑ 31-60 days (Urgent)            |
| ☐ 61+ days (Critical)            |
|                                  |
| Skills:                          |
| [Java, React, .NET...     ▼]     |
|                                  |
| Visa Status:                     |
| ☐ US Citizen                     |
| ☐ Green Card                     |
| ☐ H1B                            |
| ☐ EAD                            |
|                                  |
| Location:                        |
| ☐ Remote                         |
| ☐ Onsite                         |
| ☐ Hybrid                         |
|                                  |
| Engagement:                      |
| ☐ Contacted <24h ago             |
| ☐ Not contacted >3 days          |
| ☐ Unresponsive                   |
|                                  |
| Active Submissions:              |
| ☐ 0 (needs submissions)          |
| ☐ 1-2                            |
| ☐ 3+ (pipeline full)             |
|                                  |
|          [Clear] [Apply Filters] |
+----------------------------------+
```

**User Action:** Click "Sort ▼" dropdown

**Sort Options:**
```
+----------------------------------+
| Sort By:                         |
| ● Days on Bench (High to Low)   |
| ○ Days on Bench (Low to High)   |
| ○ Last Contact (Oldest first)   |
| ○ Last Contact (Newest first)   |
| ○ Priority (High to Low)         |
| ○ Name (A-Z)                     |
| ○ Match Score (High to Low)      |
| ○ Active Submissions (Most)      |
+----------------------------------+
```

**Common Filter Combinations:**
1. **Urgent Focus**: Orange + Red (31+ days)
2. **Needs Attention**: Not contacted >3 days
3. **Ready to Market**: 0 active submissions
4. **Visa Alerts**: H1B + Expiring <180 days
5. **New to Bench**: 0-15 days

**Time:** ~10 seconds per filter change

---

### Step 5: Open Consultant Detail View

**User Action:** Click "View Profile" on Rajesh Kumar card

**System Response:**
- Consultant detail panel slides in from right (or full page)
- Profile loads with complete information
- Timeline shows all activities

**URL:** `/employee/workspace/bench/consultants/[consultant-id]`

**Screen State:**
```
+------------------------------------------------------------------+
| ← Back to Bench               Rajesh Kumar          [⋮ Actions]  |
+------------------------------------------------------------------+
| [Overview] [Skills] [Submissions] [Timeline] [Files] [Immigration|
+------------------------------------------------------------------+
|                                                                   |
| 🟠 URGENT: 42 days on bench                   Priority: HIGH     |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Personal Information                                        │   |
| │ Name: Rajesh Kumar                                          │   |
| │ Email: rajesh.kumar@intime.com                              │   |
| │ Phone: +1 (555) 123-4567                                    │   |
| │ Location: Washington, DC (Open to remote)                   │   |
| │                                                             │   |
| │ Current Status: On Bench (since 10/19/2024)                 │   |
| │ Availability: Immediate                                     │   |
| │ Notice Period: N/A (on bench)                               │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Professional Profile                                        │   |
| │ Title: Java Developer                                       │   |
| │ Years Experience: 10+                                       │   |
| │ Last Project: Meta (3 years, 2021-2024)                     │   |
| │ Project Type: Backend Services, Microservices Platform      │   |
| │                                                             │   |
| │ Rate: $85/hr (W2 or C2C)                                    │   |
| │ Rate Flexibility: Open to negotiation for good fit          │   |
| │ Target Rate: $90-100/hr                                     │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Skills & Expertise                                          │   |
| │ Primary: Java ★★★★★  Spring Boot ★★★★★  AWS ★★★★☆         │   |
| │ Microservices ★★★★★  REST APIs ★★★★★  Docker ★★★★☆        │   |
| │                                                             │   |
| │ Secondary: React ★★★☆☆  Node.js ★★★☆☆  Python ★★☆☆☆      │   |
| │                                                             │   |
| │ Certifications:                                             │   |
| │ • AWS Certified Solutions Architect (2023)                  │   |
| │ • Spring Professional Certification (2022)                  │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Work Authorization                                          │   |
| │ Status: H1B                                                 │   |
| │ Valid Until: 03/15/2026 (484 days remaining) ✓              │   |
| │ Sponsor: InTime Staffing                                    │   |
| │ Transfer Ready: Yes (can start in ~2 weeks)                 │   |
| │ Immigration Case: None active                               │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Bench Status                                                │   |
| │ Bench Start Date: 10/19/2024                                │   |
| │ Days on Bench: 42 days 🟠                                   │   |
| │ Reason: Project ended at Meta (contract completion)         │   |
| │                                                             │   |
| │ Assigned Bench Rep: You                                     │   |
| │ Contact Frequency: Every 2-3 days (target)                  │   |
| │ Last Contacted: 11/28/2024 (2 days ago)                     │   |
| │ Responsiveness: High ✓                                      │   |
| │                                                             │   |
| │ Marketing Status:                                           │   |
| │ • Added to 3 hotlists (last: 11/27)                         │   |
| │ • Sent to 42 vendors                                        │   |
| │ • Direct submissions: 2 active                              │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Active Submissions (2)                                      │   |
| │                                                             │   |
| │ 1. Accenture - Senior Java Developer                        │   |
| │    Source: Dice.com                                         │   |
| │    Status: Submitted to Vendor (11/28)                      │   |
| │    Rate: $92/hr                                             │   |
| │    Next: Follow up on 12/1                                  │   |
| │    [View Details]                                           │   |
| │                                                             │   |
| │ 2. Capital One - Backend Engineer                           │   |
| │    Source: Vendor (TechStaff Solutions)                     │   |
| │    Status: Interview Scheduled (12/2 at 10am)               │   |
| │    Rate: $95/hr                                             │   |
| │    Next: Interview prep call                                │   |
| │    [View Details]                                           │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Recent Activity (Last 7 Days)                               │   |
| │                                                             │   |
| │ 11/29 - 📞 Call: Check-in, discussed Cap One interview      │   |
| │ 11/28 - 📤 Submitted to Accenture Senior Java role          │   |
| │ 11/27 - 📧 Added to weekly hotlist (Java/.NET developers)   │   |
| │ 11/26 - 📞 Call: Rate discussion, confirmed $85-95/hr ok    │   |
| │ 11/25 - 📅 Interview scheduled with TechStaff/Capital One   │   |
| │ 11/24 - 📤 Submitted to Capital One via TechStaff           │   |
| │ 11/23 - 📧 Marketing email to 10 vendors                    │   |
| │                                                             │   |
| │ [View Full Timeline]                                        │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| [Edit Profile] [Update Status] [Log Activity] [Submit to Job]   |
+------------------------------------------------------------------+
```

**Time:** ~1 second to load

---

### Step 6: Update Consultant Status

**User Action:** Click "Update Status" button

**Modal Opens:**
```
+------------------------------------------------------------------+
|                    Update Consultant Status                  [×] |
+------------------------------------------------------------------+
| Consultant: Rajesh Kumar                                          |
| Current Status: On Bench (since 10/19/2024, 42 days)             |
+------------------------------------------------------------------+
|                                                                   |
| New Status: *                                                     |
| ● On Bench (still available)                                     |
| ○ Placed (project starting)                                      |
| ○ In Transit (project ending soon, will be on bench)             |
| ○ Internal Project (temporarily assigned)                        |
| ○ Training (upskilling period)                                   |
| ○ Leave (personal/medical leave)                                 |
|                                                                   |
+------------------------------------------------------------------+
| Availability: *                                                   |
| ● Immediate                                                      |
| ○ Available with notice: [2    ] weeks                           |
| ○ Not available (specify reason below)                           |
|                                                                   |
+------------------------------------------------------------------+
| Rate Expectations:                                                |
| Current Rate: $[85    ] /hr                                      |
| Target Rate: $[90    ] - $[100   ] /hr                           |
| Rate Type: ● Hourly  ○ Daily  ○ Annual                           |
|                                                                   |
| ☐ Rate is negotiable                                             |
| ☐ Willing to go lower for right opportunity                      |
|                                                                   |
+------------------------------------------------------------------+
| Location Preferences:                                             |
| ☑ Remote                                                         |
| ☑ Washington, DC                                                 |
| ☑ Baltimore, MD                                                  |
| ☐ On-site only                                                   |
|                                                                   |
+------------------------------------------------------------------+
| Skills Update:                                                    |
| Primary Skills:                                                   |
| [Java, Spring Boot, AWS, Microservices, REST APIs          ]     |
|                                                                   |
| Recently Added/Improved:                                          |
| [Spring Cloud, Kubernetes                                   ]     |
|                                                                   |
+------------------------------------------------------------------+
| Last Contact Summary:                                             |
| Date/Time: [11/29/2024 10:30 AM           ]                      |
|                                                                   |
| Contact Notes:                                                    |
| [Spoke with Rajesh, he's motivated and ready. Confirmed      ]   |
| [availability, discussed Capital One interview prep. He's    ]   |
| [also interested in AWS-heavy roles. Added Kubernetes skill. ]   |
| [                                                 ] 185/500       |
|                                                                   |
+------------------------------------------------------------------+
| Next Action:                                                      |
| Action: [Interview prep call                                 ]   |
| Due Date: [12/01/2024          ]                                 |
| Priority: ● High  ○ Normal  ○ Low                                |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Save & Update →]   |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| New Status | Radio | Yes | Must select one | Changes consultant state |
| Availability | Radio | Yes | If notice, must enter weeks | Affects submission eligibility |
| Current Rate | Currency | Yes | Must be >0 | Used for vendor submissions |
| Target Rate | Currency Range | No | Min < Max | Helps match to jobs |
| Location | Checkbox | Yes | At least one | Filters job matches |
| Skills | Text | No | - | Updates matching algorithm |
| Contact Notes | Textarea | Yes | Min 20 chars | Required for audit trail |
| Next Action | Text + Date | No | - | Creates follow-up task |

**User Action:** User updates fields and clicks "Save & Update →"

**System Response:**
1. Validates all fields
2. Updates consultant record in database
3. Creates activity log entry: "Status updated by [User]"
4. Creates next action task (if specified)
5. Recalculates bench metrics
6. Updates consultant card on dashboard
7. Toast notification: "Rajesh Kumar updated ✓"
8. Modal closes

**Time:** ~2-3 minutes

---

### Step 7: Log Activity (Quick Action)

**User Action:** Click "Log Activity" button on consultant card

**Modal Opens:**
```
+------------------------------------------------------------------+
|                      Log Activity                            [×] |
+------------------------------------------------------------------+
| Consultant: Rajesh Kumar                                          |
| Activity Date/Time: [11/30/2024 9:15 AM     ] (now)              |
+------------------------------------------------------------------+
|                                                                   |
| Activity Type: *                                                  |
| ● Call (Phone/Video)                                             |
| ○ Email                                                          |
| ○ Text/SMS                                                       |
| ○ In-person Meeting                                              |
| ○ Note (no contact)                                              |
|                                                                   |
+------------------------------------------------------------------+
| Duration: [15    ] minutes                                       |
+------------------------------------------------------------------+
| Outcome: *                                                        |
| ● Positive (engaged, responsive)                                 |
| ○ Neutral (routine check-in)                                     |
| ○ Negative (unresponsive, issues)                                |
| ○ No Answer/Response                                             |
|                                                                   |
+------------------------------------------------------------------+
| Activity Notes: *                                                 |
| [Discussed upcoming Capital One interview. Rajesh is well    ]   |
| [prepared and excited. Reviewed potential technical questions]   |
| [around microservices and AWS. Confirmed he's still actively ]   |
| [looking and open to all opportunities. Updated target rate  ]   |
| [to $90-100/hr based on market feedback.                     ]   |
| [                                                 ] 312/1000      |
|                                                                   |
+------------------------------------------------------------------+
| Tags: (optional)                                                  |
| [interview-prep] [rate-discussion] [+Add Tag]                    |
|                                                                   |
+------------------------------------------------------------------+
| Follow-up Required:                                               |
| ☑ Yes                                                            |
|   Action: [Send interview prep guide                         ]   |
|   Due: [12/01/2024          ]                                    |
|                                                                   |
+------------------------------------------------------------------+
|                                         [Cancel]  [Log Activity] |
+------------------------------------------------------------------+
```

**System Response:**
1. Creates activity record in database
2. Updates "last contacted" timestamp on consultant
3. Creates follow-up task (if specified)
4. Updates consultant card
5. Activity appears in consultant timeline
6. Activity counted in daily metrics
7. Toast: "Activity logged ✓"

**Time:** ~2 minutes

---

### Step 8: Mark for Marketing (Add to Hotlist Queue)

**User Action:** Click "Marketing" button on consultant card

**Quick Action Menu:**
```
+----------------------------------+
| Marketing Actions                |
+----------------------------------+
| → Add to Next Hotlist            |
| → Send to Specific Vendors       |
| → Generate Marketing Profile     |
| → Copy Profile Summary           |
| → Create Marketing Task          |
+----------------------------------+
```

**User Action:** Select "Add to Next Hotlist"

**System Response:**
- Consultant added to hotlist queue
- Badge appears on card: "📋 In Hotlist Queue"
- Toast: "Rajesh added to hotlist queue ✓"

**Time:** ~5 seconds

---

### Step 9: Submit to External Job (Quick Submit)

**User Action:** Click "Submit" button on consultant card

**System Response:**
- If matching external jobs exist: Shows list of top 5 matches
- If no matches: Opens external job search

**Match List Modal:**
```
+------------------------------------------------------------------+
|          Submit Rajesh Kumar to External Job                 [×] |
+------------------------------------------------------------------+
| Top Matching Jobs (Auto-matched based on skills, rate, location) |
+------------------------------------------------------------------+
| ☐ Senior Java Developer @ Accenture              Match: 95%      |
|   Dice.com | Remote | $90-100/hr | H1B OK                        |
|   Required: Java, Spring Boot, AWS, Microservices                |
|   [View Job Details]                                              |
+------------------------------------------------------------------+
| ☐ Backend Engineer @ Capital One                 Match: 88%      |
|   TechStaff Solutions | DC Hybrid | $85-95/hr | Citizen/GC/H1B  |
|   Required: Java, Spring, Microservices, AWS                     |
|   [View Job Details]                                              |
+------------------------------------------------------------------+
| ☐ Java Developer @ Booz Allen                    Match: 82%      |
|   ClearedJobs | DC Area | $80-90/hr | Clearance Required        |
|   Required: Java, Spring, REST APIs                              |
|   ⚠ May require security clearance                               |
|   [View Job Details]                                              |
+------------------------------------------------------------------+
| [Select All]                        [Cancel]  [Submit Selected →]|
+------------------------------------------------------------------+
```

**User Action:** Select 1-3 jobs and click "Submit Selected →"

**System Response:**
- Opens batch submission form (pre-filled with consultant and job info)
- User completes submission details (see 04-find-requirements.md for full flow)

**Time:** ~30 seconds + submission time

---

## Alternative Flows

### A1: Consultant Reaches 30-Day Alert

**Trigger:** System detects consultant hit 30 days on bench

**System Actions:**
1. Changes card color: Green → Orange
2. Sends notification to bench rep
3. Sends notification to manager
4. Updates priority: Normal → High
5. Creates task: "Urgent: Rajesh at 30 days - escalate marketing"

**Bench Rep Actions:**
1. Review notification
2. Open consultant profile
3. Review current pipeline (submissions, interviews)
4. Call consultant for status check
5. Increase marketing frequency (daily contact)
6. Target 5+ submissions in next 5 days
7. Add to high-priority section of hotlist
8. Update manager with action plan

### A2: Consultant Placed (Leaving Bench)

**Trigger:** Bench rep receives offer acceptance

**Actions:**
1. Open consultant profile
2. Click "Update Status"
3. Select "Placed"
4. Enter placement details:
   - Client name
   - Project start date
   - Bill rate
   - Project duration (if known)
5. System updates:
   - Removes from bench dashboard
   - Calculates final days on bench
   - Updates bench utilization metrics
   - Logs placement activity
   - Notifies manager
   - Updates sprint progress
6. Creates follow-up task: "Check in with Rajesh on Day 1"

### A3: Consultant Unresponsive

**Trigger:** Consultant not responding after 3 contact attempts over 5 days

**Actions:**
1. Open consultant profile
2. Review timeline (verify 3+ attempts)
3. Try alternate contact methods (email, text, phone)
4. Click "Update Status"
5. Update responsiveness: High → Low
6. Add note: "Unresponsive, attempted contact 3x"
7. Escalate to manager
8. Manager may:
   - Contact consultant directly
   - Contact HR
   - Reach out to previous project manager
   - Mark consultant as "inactive" if no response after 10 days

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Status | Required | "Please select a status" |
| Availability | Required | "Please indicate availability" |
| Rate | Required, >0 | "Rate must be greater than 0" |
| Contact Notes | Required, min 20 chars | "Please add notes from your contact (min 20 characters)" |
| Last Contact Date | Cannot be future | "Contact date cannot be in the future" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` | Navigate down/up consultant cards |
| `Enter` | Open selected consultant detail |
| `c` | Log activity (call) |
| `e` | Log activity (email) |
| `m` | Add to marketing/hotlist |
| `s` | Submit to job |
| `u` | Update status |
| `Esc` | Close modal |

---

## Bench Status Definitions

| Status | Definition | Visibility | Actions Available |
|--------|------------|------------|-------------------|
| **On Bench** | Not on billable project, actively marketing | Show on bench dashboard | Marketing, submissions, all actions |
| **Placed** | On client project, currently billing | Hide from bench dashboard | Read-only, contact for future bench |
| **In Transit** | Project ending soon, will be bench | Show on bench dashboard | Pre-marketing, prepare profile |
| **Internal Project** | On internal project (non-billable) | Show with note | Limited marketing |
| **Training** | In training/upskilling program | Show with note | Marketing after training |
| **Leave** | Personal/medical leave | Hide from active bench | No marketing |

---

## Metrics & Reporting

### Individual Bench Rep Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| Avg Days on Bench | Mean days for assigned consultants | <45 days |
| Placement Rate | Placements / Total bench consultants | >50% per quarter |
| Marketing Velocity | Activities logged per consultant per week | >2 |
| Submission Rate | Submissions / Bench consultants | >2.5 per consultant |
| Contact Frequency | Days since last contact (avg) | <3 days |

### Team Bench Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| Bench Utilization | Bench consultants / Total consultants | <30% |
| 30-Day Placement | % placed within 30 days | >50% |
| 60-Day Placement | % placed within 60 days | >80% |
| Critical Cases | Consultants >60 days bench | 0 |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `consultant.status_changed` | `{ consultant_id, old_status, new_status, changed_by, timestamp }` |
| `consultant.contacted` | `{ consultant_id, contact_type, outcome, notes, contacted_by, timestamp }` |
| `consultant.alert_triggered` | `{ consultant_id, alert_type, days_on_bench, threshold }` |
| `consultant.placed` | `{ consultant_id, placement_details, days_on_bench, bench_rep_id }` |

---

## Related Use Cases

- [03-market-consultant.md](./03-market-consultant.md) - Marketing consultants via hotlist
- [04-find-requirements.md](./04-find-requirements.md) - Finding external jobs for consultants
- [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) - Submitting to external jobs

---

*Last Updated: 2024-11-30*
