# Use Case: Manage Sales Leads

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-SALES-002 |
| Actor | Sales Representative |
| Goal | Effectively manage and qualify sales leads through the pipeline |
| Frequency | 10-20 times per day |
| Estimated Time | 5-30 minutes per lead |
| Priority | High |

---

## Preconditions

1. User is logged in as Sales Representative
2. User has "lead.read" and "lead.update" permissions
3. Leads exist in system (inbound or manually created)
4. User has assigned territory or lead ownership

---

## Trigger

One of the following:
- New inbound lead from website form
- Lead assigned by manager
- Lead imported from marketing campaign
- Manual lead creation from prospecting
- Lead requires follow-up or qualification

---

## Main Flow: View Lead Pipeline

### Step 1: Navigate to Leads

**User Action:** Click "Leads" in sidebar or press `g l`

**System Response:**
- Sidebar highlights "Leads"
- URL changes to `/employee/workspace/sales/leads`
- Leads list loads with default filter (user's owned leads)

**Screen State:**
```
+--------------------------------------------------------------------+
| Leads                        [+ New Lead] [Import] [⚙] [Cmd+K]     |
+--------------------------------------------------------------------+
| [Search by name, company, email...]      [Filter ▼] [Sort: Score ▼]|
+--------------------------------------------------------------------+
| ● New (8) │ ○ Contacted (23) │ ○ Qualified (12) │ ○ All (95)      |
+--------------------------------------------------------------------+
| FILTERS ACTIVE: [My Leads ×] [Territory: West ×] [Last 30 Days ×]  |
+--------------------------------------------------------------------+
| Score  Status   Lead Name        Company          Source     Age   |
| ─────────────────────────────────────────────────────────────────── |
| 92/100 🔴 New   David Chen       BuildRight       Referral   2h    |
|                 COO              Construction                       |
|                 d.chen@buildright.com                              |
|                 📍 Seattle, WA  💼 Construction  👥 1000+          |
|                 📊 BANT: 0/100 (Not Qualified)                     |
|                 🎯 Next: Initial outreach                          |
| ─────────────────────────────────────────────────────────────────── |
| 85/100 🔴 New   John Smith       GlobalTech       Website    5h    |
|                 VP Engineering   Technology                        |
|                 john.smith@globaltech.com                          |
|                 📍 SF, CA  💼 SaaS  👥 500-1000                    |
|                 📊 BANT: 0/100 (Not Qualified)                     |
|                 🎯 Next: Call within 4 hours                       |
| ─────────────────────────────────────────────────────────────────── |
| 79/100 🟡 Contacted  Maria Garcia  InnovateCo    LinkedIn    2d    |
|                      Director HR   SaaS                            |
|                      maria.g@innovate.co                           |
|                      📍 Austin, TX  💼 HR Tech  👥 100-500         |
|                      📊 BANT: 79/100 (SQL - Ready to Convert)      |
|                      🎯 Next: Convert to deal                      |
| ─────────────────────────────────────────────────────────────────── |
| 72/100 🟢 Qualified  Robert Lee    DataVault      Campaign   5d    |
|                      CTO           Data Security                   |
|                      r.lee@datavault.io                            |
|                      📍 Boston, MA  💼 Security  👥 200-500        |
|                      📊 BANT: 68/100 (MQL - Needs More Qual)       |
|                      🎯 Next: Schedule discovery call              |
+--------------------------------------------------------------------+
| Showing 1-4 of 95 leads                      [Load More] [Export ↓]|
+--------------------------------------------------------------------+

LEGEND:
🔴 New (not contacted)  🟡 Contacted  🟢 Qualified  ⚫ Cold  ⚪ Nurture
```

**Time:** 1-2 seconds

---

## Use Case: Create New Lead Manually

### Step 2: Click "New Lead" Button

**User Action:** Click "+ New Lead" button

**System Response:**
- Modal slides in from right
- Title: "Create New Lead"
- First field focused

**Screen State:**
```
+--------------------------------------------------------------------+
| Create New Lead                                                [×] |
+--------------------------------------------------------------------+
| Lead Type                                                          |
| [●] Company Lead  [ ] Person Lead                                 |
|                                                                    |
| COMPANY INFORMATION                                                |
| Company Name *                                                     |
| [                                              ]                   |
|                                                                    |
| Industry                                                           |
| [Technology                                   ▼]                   |
|                                                                    |
| Company Size                                                       |
| [100-500 employees                            ▼]                   |
|                                                                    |
| Website                                                            |
| [https://                                     ] [Enrich 🔍]        |
|                                                                    |
| Headquarters Location                                              |
| [                                             ]                    |
|                                                                    |
| ────────────────────────────────────────────────────────────────   |
| PRIMARY CONTACT                                                    |
| First Name *                                                       |
| [                              ]                                   |
|                                                                    |
| Last Name *                                                        |
| [                              ]                                   |
|                                                                    |
| Title                                                              |
| [                                             ]                    |
|                                                                    |
| Email *                                                            |
| [                                             ]                    |
|                                                                    |
| Phone                                                              |
| [                                             ]                    |
|                                                                    |
| LinkedIn URL                                                       |
| [https://linkedin.com/in/                     ]                    |
|                                                                    |
| Decision Authority                                                 |
| [Decision Maker                               ▼]                   |
| Options: Decision Maker, Influencer, Champion, Gatekeeper          |
|                                                                    |
| ────────────────────────────────────────────────────────────────   |
| SOURCE TRACKING                                                    |
| Lead Source                                                        |
| [Cold Outreach                                ▼]                   |
| Options: Website, Referral, LinkedIn, Campaign, Trade Show, etc.   |
|                                                                    |
| Source Campaign                                                    |
| [Select campaign...                           ▼] (optional)        |
|                                                                    |
| Estimated Value                                                    |
| [$                                            ]                    |
|                                                                    |
| Notes                                                              |
| [                                                              ]   |
| [                                                              ]   |
|                                                         ] 0/1000   |
+--------------------------------------------------------------------+
| [Cancel] [Save & Close] [Save & Qualify BANT →]                    |
+--------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| companyName | Text | Yes | 2-200 chars |
| industry | Dropdown | No | From industry list |
| companySize | Dropdown | No | Standard ranges |
| website | URL | No | Valid URL format |
| firstName | Text | Yes | 1-100 chars |
| lastName | Text | Yes | 1-100 chars |
| email | Email | Yes | Valid email format |
| phone | Phone | No | E.164 format preferred |
| linkedinUrl | URL | No | LinkedIn domain |
| decisionAuthority | Dropdown | No | Enum values |
| source | Dropdown | Yes | From source list |
| estimatedValue | Currency | No | Numeric, $0-$10M |

---

### Step 3: Enter Lead Information

**User Action:** Fill in form fields

**Example Data:**
- Company Name: "TechStartup Inc."
- Industry: "Technology / SaaS"
- Company Size: "50-100 employees"
- Website: "https://techstartup.io"

**User Action:** Click "Enrich 🔍" button next to website field

**System Response:**
- Calls enrichment service (Clearbit/ZoomInfo)
- Shows loading spinner
- Auto-fills available data

**Data Enriched:**
```
✓ Headquarters: San Francisco, CA
✓ Company Type: Direct Client
✓ Tier: SMB
✓ Industry confirmed: Technology / SaaS
✓ Estimated Revenue: $5M-$10M
✓ Employee Count: ~75 (refined)
✓ Tech Stack: React, Node.js, AWS, PostgreSQL
```

**User Action:** Continue filling contact info
- First Name: "Jennifer"
- Last Name: "Park"
- Title: "VP of Engineering"
- Email: "jennifer.park@techstartup.io"
- Phone: "+1 (415) 555-0199"
- LinkedIn: "linkedin.com/in/jenniferpark"
- Decision Authority: "Decision Maker"

**User Action:** Fill source tracking
- Lead Source: "LinkedIn Prospecting"
- Estimated Value: "$80,000"
- Notes: "Found via mutual connection. Mentioned hiring challenges in recent post."

**Time:** 3-5 minutes (with enrichment)

---

### Step 4: Save and Qualify

**User Action:** Click "Save & Qualify BANT →"

**System Response:**
- Lead created in database
- Lead ID generated
- User redirected to BANT qualification form
- Lead status set to "new"

**Time:** 1 second

---

## Use Case: Qualify Lead with BANT

### Step 5: BANT Qualification Form

**System Response:**
- BANT qualification screen loads
- Shows company context on left
- BANT scoring form on right

**Screen State:**
```
+--------------------------------------------------------------------+
| BANT Qualification - TechStartup Inc. (Jennifer Park)              |
+--------------------------------------------------------------------+
| Lead Score: 85/100 🟢          Status: New → Qualifying            |
| Created: Just now              Owner: You                          |
+--------------------------------------------------------------------+
| COMPANY CONTEXT               | BANT QUALIFICATION                  |
| ────────────────────────────  | ─────────────────────────────────  |
| TechStartup Inc.              | Progress: 0 of 4 complete          |
| Industry: Technology / SaaS   |                                    |
| Size: ~75 employees           | ┌────────────────────────────────┐ |
| Location: San Francisco, CA   | │ B - BUDGET (0-25 points)       │ |
| Revenue: $5M-$10M (est.)      | │ Score: [          ] 0/25       │ |
|                               | │                                │ |
| Contact: Jennifer Park        | │ Key Questions:                 │ |
| Title: VP of Engineering      | │ • What's your staffing budget? │ |
| Authority: Decision Maker ✓   | │ • Budget already approved?     │ |
| Email: jennifer.park@...      | │ • Typical spend per hire?      │ |
| Phone: +1 (415) 555-0199      | │                                │ |
|                               | │ Notes:                         │ |
| Lead Source:                  | │ [                           ]  │ |
| LinkedIn Prospecting          | │ [                           ]  │ |
| Via mutual connection         | │ [                           ]  │ |
|                               | │                      ] 0/500   │ |
| Estimated Value: $80,000      | │                                │ |
|                               | │ [Score Budget]                 │ |
|                               | └────────────────────────────────┘ |
| Recent Activity:              |                                    |
| • Just now: Lead created      | Quick Score Buttons:               |
| • No contact yet              | [0] [5] [10] [15] [20] [25]       |
+--------------------------------------------------------------------+

BANT SCORING GUIDE:

BUDGET (0-25 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 0-5:  No budget discussion / No budget allocated
 6-10: Budget mentioned but not confirmed
11-15: Budget range discussed, not formally approved
16-20: Budget approved, amount confirmed
21-25: Budget approved, amount sufficient, ready to spend

AUTHORITY (0-25 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 0-5:  Unknown decision process / Gatekeeper only
 6-10: Influencer but not decision maker
11-15: Decision maker identified but not engaged
16-20: Decision maker engaged, stakeholders known
21-25: Full buying committee mapped and engaged

NEED (0-25 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 0-5:  No clear pain point / Exploring options
 6-10: Generic need, no urgency
11-15: Specific need identified, moderate pain
16-20: Strong pain point, quantified impact
21-25: Critical business impact, high urgency

TIMELINE (0-25 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 0-5:  No timeline / "Someday, maybe"
 6-10: Vague timeline (next year, eventually)
11-15: General timeline (next quarter)
16-20: Specific timeline (next month, by date X)
21-25: Urgent timeline with hard deadline

TOTAL SCORE INTERPRETATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 0-39:  NOT QUALIFIED - Nurture or disqualify
40-59:  MQL (Marketing Qualified Lead) - Needs more qualification
60-79:  SQL (Sales Qualified Lead) - Ready for deal conversation
80-100: HOT LEAD - Convert to deal immediately
```

---

### Step 6: Score Budget (Example: Discovery Call Completed)

**Context:** Sales rep completed discovery call and gathered BANT information

**User Action:** Enter budget notes

**User Input:**
```
Budget Notes:
Jennifer confirmed $120K allocated for Q1 hiring (approved by CFO).
Planning to hire 3 senior engineers at ~$40K each (our fee).
Budget is approved and ready to execute. No additional approvals needed.
```

**User Action:** Click "15" (Budget confirmed, amount adequate)

**Alternative:** User can drag slider or type score

**System Response:**
- Budget score set to 15/25
- Budget bar fills to 60%
- Notes saved
- Progress updates to "1 of 4 complete"

**Screen State (Updated):**
```
│ B - BUDGET (15-25 points) ✓                                       │
│ Score: [███████████████          ] 15/25                          │
│                                                                   │
│ Notes:                                                            │
│ Jennifer confirmed $120K allocated for Q1 hiring (approved by    │
│ CFO). Planning to hire 3 senior engineers at ~$40K each (our     │
│ fee). Budget is approved and ready to execute. No additional     │
│ approvals needed.                                                 │
│                                                                   │
│ Scored by: You (Sarah Johnson)                                   │
│ Scored at: Nov 30, 2024 11:15 AM                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 7: Score Authority

**User Action:** Click "Authority" section

**User Input:**
```
Authority Notes:
Jennifer (VP Eng) is the decision maker for vendor selection.
CEO (Mike Chen) must approve contracts >$100K (this qualifies).
HR Director (Lisa Wang) handles onboarding coordination.
Procurement (Sarah Lee) processes MSA (5-7 day turnaround).

Decision timeline: Jennifer selects vendor, CEO approves within 24 hours.
```

**User Action:** Click "18" (Decision maker engaged, stakeholders known)

**System Response:**
- Authority score: 18/25
- Progress: 2 of 4 complete

---

### Step 8: Score Need

**User Input:**
```
Need Notes:
PAIN POINT: Product launch delayed 2 months due to lack of engineering capacity.
IMPACT: Losing $500K/month in deferred revenue.
CURRENT STATE: Tried in-house recruiting, only filled 1 of 6 roles in 3 months.
URGENCY: Board pressure to launch by Q1. Need hires to start by Jan 15.
ALTERNATIVES: Evaluated 2 other agencies but quality concerns.
WHY US: Referred by mutual contact who vouched for our quality.
```

**User Action:** Click "22" (Strong pain, quantified impact, high urgency)

**System Response:**
- Need score: 22/25
- Progress: 3 of 4 complete

---

### Step 9: Score Timeline

**User Input:**
```
Timeline Notes:
Decision deadline: Dec 15, 2024 (2 weeks from now).
First candidates needed: Dec 20, 2024.
Start date: Jan 15, 2025 (hard deadline for product launch).
Product launch: March 31, 2025 (board committed).

All dates are firm. Missing Jan 15 start means another delay.
```

**User Action:** Click "20" (Specific timeline with hard deadline)

**System Response:**
- Timeline score: 20/25
- Progress: 4 of 4 complete ✓
- **Total BANT Score: 75/100** (SQL - Sales Qualified Lead)

---

### Step 10: Review BANT Summary

**Screen State (BANT Complete):**
```
+--------------------------------------------------------------------+
| BANT Qualification Complete - TechStartup Inc.                     |
+--------------------------------------------------------------------+
| TOTAL SCORE: 75/100 🟢 SALES QUALIFIED LEAD (SQL)                  |
+--------------------------------------------------------------------+
| Budget:    [███████████████          ] 15/25  (Moderate)          |
| Authority: [██████████████████       ] 18/25  (Strong)            |
| Need:      [██████████████████████   ] 22/25  (Very Strong)       |
| Timeline:  [████████████████         ] 20/25  (Strong)            |
+--------------------------------------------------------------------+
| QUALIFICATION SUMMARY                                              |
|                                                                    |
| ✅ STRENGTHS:                                                      |
| • Strong, quantified pain point ($500K/month loss)                |
| • Clear timeline with hard deadlines                              |
| • Decision maker engaged and motivated                            |
| • Budget approved and adequate                                    |
|                                                                    |
| ⚠️ CONSIDERATIONS:                                                 |
| • CEO approval required (adds 1 day to close)                     |
| • Tight timeline (decision in 2 weeks)                            |
| • Competing against 2 other agencies                              |
|                                                                    |
| 🎯 RECOMMENDED NEXT STEPS:                                         |
| 1. Convert to deal immediately                                    |
| 2. Send capabilities deck + case studies (tech companies)         |
| 3. Schedule follow-up call within 3 days                          |
| 4. Prepare proposal highlighting quality + speed                  |
|                                                                    |
| 💰 ESTIMATED DEAL VALUE: $120,000 (3 placements × $40K)           |
+--------------------------------------------------------------------+
| [Update Lead] [Convert to Deal →] [Schedule Follow-up] [Nurture]  |
+--------------------------------------------------------------------+
```

**User Action:** Click "Convert to Deal →"

**System Response:**
- Deal conversion modal opens (see UC-SALES-003 for full flow)
- Lead status updated to "qualified"
- Lead.bantTotalScore = 75
- Activity logged: "BANT qualification completed (75/100)"

**Time:** 15-20 minutes (for full BANT qualification)

---

## Use Case: Update Lead Status

### Step 11: Bulk Status Update

**Scenario:** Sales rep wants to mark several cold leads as "nurture"

**User Action:** From leads list, select checkboxes for 3 leads

**Screen State:**
```
+--------------------------------------------------------------------+
| Leads                                        [3 selected] [Actions ▼]|
+--------------------------------------------------------------------+
| [☑] 65/100 ⚫ Cold  Peter Kim    OldCorp     Outbound    45d       |
| [☑] 58/100 ⚫ Cold  Nancy Liu    SlowTech    Campaign    62d       |
| [☑] 61/100 ⚫ Cold  Tom Wilson   NoResponse  LinkedIn    38d       |
+--------------------------------------------------------------------+
```

**User Action:** Click "Actions ▼" dropdown

**Dropdown Options:**
```
┌─────────────────────────────────────┐
│ Bulk Actions                        │
├─────────────────────────────────────┤
│ Change Status                    →  │
│ Assign Owner                     →  │
│ Add to Campaign                  →  │
│ Bulk Email                       →  │
│ Export Selected                  →  │
│ Delete (Archive)                    │
└─────────────────────────────────────┘
```

**User Action:** Click "Change Status →"

**System Response:**
- Status selection modal opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Change Status for 3 Leads                                          |
+--------------------------------------------------------------------+
| Current Status: Cold (all 3)                                       |
|                                                                    |
| New Status:                                                        |
| [ ] New                                                            |
| [ ] Contacted                                                      |
| [ ] Qualified                                                      |
| [ ] Cold                                                           |
| [●] Nurture                                                        |
| [ ] Lost                                                           |
|                                                                    |
| Reason for Change (optional):                                      |
| [Not responsive after 3 attempts. Adding to nurture campaign.   ]  |
|                                                                    |
| Add to Nurture Campaign:                                           |
| [×] Yes, add to: [Q1 2025 Tech Hiring Campaign ▼]                 |
|                                                                    |
| [Cancel] [Update Status]                                           |
+--------------------------------------------------------------------+
```

**User Action:** Click "Update Status"

**System Response:**
- 3 leads updated to status "nurture"
- Activity logged for each lead: "Status changed: cold → nurture"
- Leads added to selected campaign
- Toast notification: "3 leads updated successfully ✓"

**Time:** 1-2 minutes

---

## Use Case: View Lead Detail

### Step 12: Open Lead Detail Page

**User Action:** Click on any lead from list

**System Response:**
- Lead detail page loads
- URL changes to `/employee/workspace/sales/leads/{lead-id}`

**Screen State (Lead Detail - Full View):**
```
+--------------------------------------------------------------------+
| ← Back to Leads                                          [Edit] [⋮] |
+--------------------------------------------------------------------+
| Jennifer Park - TechStartup Inc.                                   |
| VP of Engineering                                                  |
+--------------------------------------------------------------------+
| Lead Score: 85/100 🟢    Status: Qualified     Age: 2 days         |
| Owner: Sarah Johnson     Territory: West       Created: Nov 28     |
+--------------------------------------------------------------------+
| QUICK ACTIONS                                                      |
| [📞 Call] [✉ Email] [📅 Schedule] [Convert to Deal →] [BANT ✓]    |
+--------------------------------------------------------------------+
|                                                                    |
| ┌─ CONTACT INFO ─────────┬─ COMPANY INFO ──────┬─ BANT SCORE ───┐ |
| │ Name: Jennifer Park    │ Company: TechStartup│ Total: 75/100  │ |
| │ Title: VP Engineering  │ Industry: Tech/SaaS │                │ |
| │ Email: jennifer.p...   │ Size: ~75 employees │ B: 15/25  ████ │ |
| │ Phone: (415) 555-0199  │ Location: SF, CA    │ A: 18/25  █████│ |
| │ LinkedIn: /in/jennif...│ Revenue: $5M-$10M   │ N: 22/25  ██████│ |
| │ Authority: Decision Mkr│ Tier: SMB           │ T: 20/25  █████│ |
| │ Preferred: Email       │ Type: Direct Client │                │ |
| └────────────────────────┴─────────────────────┴────────────────┘ |
|                                                                    |
| ┌─ LEAD SOURCE & TRACKING ──────────────────────────────────────┐ |
| │ Source: LinkedIn Prospecting                                  │ |
| │ Campaign: n/a                                                 │ |
| │ Referral: Mutual connection (Tom Anderson)                    │ |
| │ First Touch: Nov 28, 2024 9:45 AM                             │ |
| │ Last Contacted: Nov 29, 2024 11:15 AM (Discovery call)        │ |
| │ Last Response: Nov 29, 2024 3:30 PM (Email reply)             │ |
| │ Engagement Score: 82/100 (High engagement)                    │ |
| └───────────────────────────────────────────────────────────────┘ |
|                                                                    |
| ┌─ ACTIVITY TIMELINE ───────────────────────────────────────────┐ |
| │                                                                │ |
| │ Nov 29, 3:30 PM - Email Received                              │ |
| │ Jennifer replied: "Thanks for the info. Sounds promising.     │ |
| │ Can you send case studies from similar companies?"            │ |
| │                                                                │ |
| │ Nov 29, 11:15 AM - Discovery Call (42 minutes)                │ |
| │ BANT qualification completed. Score: 75/100.                  │ |
| │ Next: Send capabilities deck + case studies.                  │ |
| │ [View Call Notes →]                                           │ |
| │                                                                │ |
| │ Nov 29, 10:00 AM - Email Sent                                 │ |
| │ Subject: "RE: TechStartup hiring needs"                       │ |
| │ Confirmed discovery call for 11:00 AM.                        │ |
| │                                                                │ |
| │ Nov 28, 4:15 PM - Email Received ⭐                            │ |
| │ Jennifer responded to outreach. Interested in learning more.  │ |
| │ Available for call tomorrow (Nov 29).                         │ |
| │                                                                │ |
| │ Nov 28, 2:00 PM - LinkedIn Connection Accepted                │ |
| │                                                                │ |
| │ Nov 28, 9:45 AM - Lead Created                                │ |
| │ Source: LinkedIn prospecting via mutual connection.           │ |
| │ Initial outreach sent.                                        │ |
| │                                                                │ |
| └───────────────────────────────────────────────────────────────┘ |
|                                                                    |
| ┌─ NOTES & CONTEXT ─────────────────────────────────────────────┐ |
| │                                                                │ |
| │ Pain Point Summary:                                            │ |
| │ Product launch delayed due to lack of engineering capacity.   │ |
| │ Losing $500K/month in deferred revenue. Need 3 senior         │ |
| │ engineers by Jan 15 to hit March 31 launch deadline.          │ |
| │                                                                │ |
| │ Competitors Mentioned:                                         │ |
| │ • TalentSource Pro (quality concerns)                         │ |
| │ • StaffGenius (slow response time)                            │ |
| │                                                                │ |
| │ Key Stakeholders:                                              │ |
| │ • Jennifer Park (VP Eng) - Decision maker ✓                   │ |
| │ • Mike Chen (CEO) - Final approver                            │ |
| │ • Lisa Wang (HR Director) - Onboarding coordination           │ |
| │ • Sarah Lee (Procurement) - MSA processing                    │ |
| │                                                                │ |
| │ [Edit Notes]                                                   │ |
| └───────────────────────────────────────────────────────────────┘ |
|                                                                    |
| ┌─ NEXT STEPS ──────────────────────────────────────────────────┐ |
| │                                                                │ |
| │ 🔴 HIGH PRIORITY: Send capabilities deck + case studies       │ |
| │    Due: Today EOD                                             │ |
| │    [Mark Complete] [Reschedule]                               │ |
| │                                                                │ |
| │ 🟡 SCHEDULED: Follow-up call to review materials              │ |
| │    Due: Dec 2, 2024 10:00 AM                                  │ |
| │    [View Calendar] [Reschedule]                               │ |
| │                                                                │ |
| │ 🟢 PENDING: Convert to deal after positive response           │ |
| │    Est. Deal Value: $120,000                                  │ |
| │    [Convert Now →]                                            │ |
| │                                                                │ |
| └───────────────────────────────────────────────────────────────┘ |
|                                                                    |
+--------------------------------------------------------------------+
```

**Time:** 5-10 seconds to load and review

---

## Alternative Flow: Disqualify Lead

### Step 13: Mark Lead as Lost

**Scenario:** After discovery call, determined lead is not a fit

**User Action:** From lead detail page, click "⋮" menu > "Mark as Lost"

**Screen State:**
```
+--------------------------------------------------------------------+
| Mark Lead as Lost - TechStartup Inc.                               |
+--------------------------------------------------------------------+
| Are you sure you want to mark this lead as lost?                   |
|                                                                    |
| Lost Reason *                                                      |
| [ ] No Budget                                                      |
| [ ] No Authority                                                   |
| [ ] No Need                                                        |
| [ ] No Timeline                                                    |
| [●] Bad Fit (our services don't match needs)                      |
| [ ] Chose Competitor                                               |
| [ ] Other                                                          |
|                                                                    |
| Details (optional but recommended):                                |
| [They need direct hire only, we focus on contract staffing.    ]  |
| [Not a good fit for our model.                                  ]  |
|                                                         ] 0/500    |
|                                                                    |
| Competitor (if applicable):                                        |
| [                                             ]                    |
|                                                                    |
| Future Opportunity:                                                |
| [ ] Add to nurture campaign (may be fit later)                    |
| [●] Close permanently (unlikely to ever be fit)                   |
|                                                                    |
| [Cancel] [Mark as Lost]                                            |
+--------------------------------------------------------------------+
```

**User Action:** Click "Mark as Lost"

**System Response:**
- Lead status updated to "lost"
- Lead.lostReason = "bad_fit"
- Activity logged: "Lead marked as lost - bad fit"
- Lead removed from active pipeline
- Toast notification: "Lead marked as lost"

**Time:** 1-2 minutes

---

## Alternative Flow: Import Leads from CSV

### Step 14: Bulk Import Leads

**User Action:** From leads list, click "Import" button

**System Response:**
- Import modal opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Import Leads from CSV                                              |
+--------------------------------------------------------------------+
| Step 1: Download Template                                          |
|                                                                    |
| [Download CSV Template ↓]                                          |
|                                                                    |
| Required Columns:                                                  |
| • first_name, last_name, email (required)                         |
| • company_name, title, phone, linkedin_url (optional)             |
| • industry, company_size, source (optional)                       |
|                                                                    |
| ────────────────────────────────────────────────────────────────   |
| Step 2: Upload Your CSV                                            |
|                                                                    |
| [Choose File] or drag and drop                                     |
|                                                                    |
| ┌──────────────────────────────────────────────────────────────┐  |
| │                                                               │  |
| │         Drag CSV file here or click to browse                │  |
| │                                                               │  |
| │         Max file size: 5 MB                                  │  |
| │         Max leads: 500 per import                            │  |
| │                                                               │  |
| └──────────────────────────────────────────────────────────────┘  |
|                                                                    |
| Import Options:                                                    |
| [×] Skip duplicate emails (don't create if email exists)          |
| [×] Assign to me (set owner_id to current user)                   |
| [ ] Assign to: [Select user... ▼]                                 |
| [×] Set source to: [Bulk Import ▼]                                |
| [ ] Add to campaign: [Select campaign... ▼]                       |
|                                                                    |
| [Cancel] [Next: Preview →]                                         |
+--------------------------------------------------------------------+
```

**User Action:** Upload CSV file (e.g., "leads-nov-2024.csv")

**System Response:**
- File parsed
- Preview shown with validation

**Screen State (Preview):**
```
+--------------------------------------------------------------------+
| Import Preview - 47 Leads                                          |
+--------------------------------------------------------------------+
| ✅ 45 valid leads ready to import                                  |
| ⚠️ 2 leads have warnings                                           |
| ❌ 0 leads will be skipped                                         |
+--------------------------------------------------------------------+
| Preview (showing first 5 of 47):                                   |
|                                                                    |
| # Name           Email              Company        Status          |
| ─────────────────────────────────────────────────────────────────  |
| 1 John Smith     j.smith@acme.com   Acme Corp      ✅ Valid        |
| 2 Mary Johnson   mary@techco.io     TechCo         ✅ Valid        |
| 3 Bob Lee        bob.lee@data.com   DataInc        ⚠ Missing phone |
| 4 Sarah Chen     sarah@innov.co     InnovateCo     ✅ Valid        |
| 5 Mike Wilson    m.wilson@build.com BuildCorp      ⚠ Invalid LI URL|
|                                                                    |
| [View All] [Download Error Report]                                 |
+--------------------------------------------------------------------+
| WARNINGS (2):                                                      |
| • Row 3: Missing phone number (optional field, will proceed)      |
| • Row 5: Invalid LinkedIn URL format (will be ignored)            |
+--------------------------------------------------------------------+
| [← Back] [Cancel] [Import 45 Leads →]                              |
+--------------------------------------------------------------------+
```

**User Action:** Click "Import 45 Leads →"

**System Response:**
- Import job starts
- Progress bar shown
- Leads created in batches

**Screen State (Importing):**
```
+--------------------------------------------------------------------+
| Importing Leads...                                                 |
+--------------------------------------------------------------------+
| Progress: [████████████████████░░░░░░] 35/45 (78%)                 |
|                                                                    |
| • Creating leads in database...                                   |
| • Enriching company data...                                       |
| • Calculating lead scores...                                      |
| • Assigning ownership...                                          |
|                                                                    |
| Estimated time remaining: 15 seconds                               |
+--------------------------------------------------------------------+
```

**Final Result:**
```
+--------------------------------------------------------------------+
| Import Complete! ✓                                                 |
+--------------------------------------------------------------------+
| ✅ 45 leads imported successfully                                  |
| ⚠️ 2 leads had warnings (see report)                               |
| ❌ 0 leads failed                                                  |
|                                                                    |
| Summary:                                                           |
| • Total leads created: 45                                         |
| • Assigned to: You (Sarah Johnson)                                |
| • Source: Bulk Import                                             |
| • Average lead score: 68/100                                      |
|                                                                    |
| Next Steps:                                                        |
| • Review new leads in "My Leads" view                             |
| • Prioritize by score (highest first)                             |
| • Begin outreach within 24 hours for best results                 |
|                                                                    |
| [View Imported Leads →] [Import More] [Close]                     |
+--------------------------------------------------------------------+
```

**Time:** 3-5 minutes for full import process

---

## Lead Lifecycle States

### Lead Status Flow

```
┌─────────┐
│   NEW   │ ← Lead created (manual, import, website form)
└────┬────┘
     │
     ↓ (Initial contact made)
┌─────────────┐
│ CONTACTED   │ ← Email sent, call attempted, LinkedIn message
└─────┬───────┘
      │
      ↓ (BANT qualification in progress)
┌──────────────┐
│  QUALIFIED   │ ← BANT score 60-100, ready for deal conversion
└──┬───────┬───┘
   │       │
   │       ↓ (Not ready to buy, but good fit)
   │    ┌─────────┐
   │    │ NURTURE │ ← Drip campaign, future opportunity
   │    └─────────┘
   │
   ↓ (BANT score 80+, convert to deal)
┌───────────┐
│ CONVERTED │ ← Deal created, lead lifecycle complete
└───────────┘

Alternative Endings:
┌──────┐
│ COLD │ ← No response after multiple attempts
└──────┘

┌──────┐
│ LOST │ ← Disqualified, chose competitor, not a fit
└──────┘
```

---

## Lead Scoring Algorithm

### Auto-Score Calculation (0-100)

InTime automatically calculates lead score based on:

| Factor | Weight | Points |
|--------|--------|--------|
| **BANT Total Score** | 50% | 0-50 pts (BANT/2) |
| **Engagement Score** | 20% | 0-20 pts |
| **Company Firmographics** | 15% | 0-15 pts |
| **Source Quality** | 10% | 0-10 pts |
| **Recency** | 5% | 0-5 pts |

#### Engagement Score (0-20)
- Email opens: +2 per open (max 6)
- Email clicks: +3 per click (max 6)
- Website visits: +2 per visit (max 4)
- LinkedIn profile views: +2
- Phone call answered: +4

#### Company Firmographics (0-15)
- Company size match (ideal: 100-1000): +5
- Industry match (target industries): +5
- Revenue tier (SMB/Mid/Enterprise): +3
- Location (in target territory): +2

#### Source Quality (0-10)
- Referral: 10
- Website (inbound): 8
- LinkedIn (prospecting): 7
- Campaign: 6
- Trade show: 5
- Cold outreach: 3
- Purchased list: 1

#### Recency (0-5)
- <24 hours: 5
- 1-7 days: 4
- 8-30 days: 3
- 31-90 days: 2
- >90 days: 0

**Example:**
```
Lead: Jennifer Park - TechStartup Inc.

BANT Score: 75/100 → 37.5 points (75 ÷ 2)
Engagement: 16/20 (3 email opens, 2 clicks, 1 call)
Firmographics: 12/15 (size match, industry match, location match)
Source: 7/10 (LinkedIn prospecting)
Recency: 4/5 (2 days old)

TOTAL SCORE: 76.5/100 → 77/100 (rounded)
```

---

## Postconditions

### After Managing Leads

1. ✅ Lead status updated accurately
2. ✅ BANT scores recorded (if qualified)
3. ✅ All activities logged (calls, emails, meetings)
4. ✅ Next steps defined with due dates
5. ✅ High-value leads converted to deals
6. ✅ Low-fit leads marked as lost/nurture
7. ✅ CRM data clean and current

---

## Events Logged

| Event | Payload |
|-------|---------|
| `lead.created` | `{ lead_id, company_name, contact_name, source, owner_id }` |
| `lead.contacted` | `{ lead_id, contact_method, outcome }` |
| `lead.qualified` | `{ lead_id, bant_score, qualified_by }` |
| `lead.converted` | `{ lead_id, deal_id, account_id }` |
| `lead.lost` | `{ lead_id, lost_reason }` |
| `lead.assigned` | `{ lead_id, from_user_id, to_user_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Email | Email already exists | "Lead with this email already exists" | View existing lead or use different email |
| Invalid Email | Bad email format | "Please enter a valid email address" | Correct email format |
| Missing Required Fields | Title, company empty | "Please fill in all required fields" | Complete required fields |
| BANT Score Missing | Tried to convert without BANT | "Please complete BANT qualification first" | Complete BANT scoring |
| Permission Denied | User lacks lead.create permission | "You don't have permission to create leads" | Contact admin |
| Import Too Large | CSV >500 rows | "Please limit import to 500 leads" | Split into multiple files |

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - See leads in daily context
- [03-manage-deals.md](./03-manage-deals.md) - After lead conversion
- [04-prospect-outreach.md](./04-prospect-outreach.md) - Outreach campaigns

---

*Last Updated: 2024-11-30*
