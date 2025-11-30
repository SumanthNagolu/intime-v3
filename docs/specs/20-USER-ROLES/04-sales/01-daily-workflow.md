# Use Case: Sales Rep Daily Workflow

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-SALES-001 |
| Actor | Sales Representative (Business Development) |
| Goal | Complete a typical productive sales day |
| Frequency | Daily (5 days/week) |
| Estimated Time | 8-9 hours |
| Priority | High |

---

## Preconditions

1. User is logged in as Sales Representative
2. User has access to Sales Dashboard
3. User has assigned territory (geographic or vertical)
4. User has active pipeline with leads and deals
5. User has access to email, phone, LinkedIn Sales Navigator

---

## Daily Workflow Overview

### Time Allocation Summary

| Time Block | Activity | Duration | Priority |
|------------|----------|----------|----------|
| 8:00-10:00 AM | Morning Prep & Pipeline Review | 2 hours | High |
| 10:00 AM-12:00 PM | Prospecting & Discovery Calls | 2 hours | High |
| 12:00-1:00 PM | Lunch & Networking | 1 hour | Medium |
| 1:00-3:00 PM | Client Meetings & Presentations | 2 hours | High |
| 3:00-5:00 PM | CRM Updates & Follow-ups | 2 hours | High |

---

## Morning Routine (8:00 AM - 10:00 AM)

### Step 1: Login and Dashboard Review

**Time:** 8:00 AM

**User Action:** Navigate to Sales Dashboard

**System Response:**
- URL: `/employee/workspace/sales`
- Dashboard loads with personalized metrics
- Shows overnight updates and notifications

**Screen State:**
```
+--------------------------------------------------------------------+
| Sales Dashboard - Today's Focus                   [Cmd+K] [Twin 🤖] |
+--------------------------------------------------------------------+
| Good morning, Sarah! Here's your sales snapshot for today.         |
+--------------------------------------------------------------------+
| PIPELINE HEALTH                     TODAY'S PRIORITIES               |
| +--------------------------------+ +-------------------------------+ |
| | Total Value:   $847,500       | | 🔴 Follow up: Acme Corp (EOD) | |
| | Weighted:      $254,250       | | 🟡 Demo: TechCo at 2:00 PM    | |
| | Deals:         12 active      | | 🟢 Send proposal: BizInc      | |
| | This Week:     $125K closing  | +-------------------------------+ |
| +--------------------------------+                                   |
|                                   ACTIVITY SNAPSHOT                  |
| DEALS BY STAGE                    +-------------------------------+ |
| Discovery       [■■■□□] 5         | Calls Today:         0 / 15   | |
| Qualification   [■■□□□] 3         | Emails Sent:         0 / 25   | |
| Proposal        [■□□□□] 2         | Meetings:            2 booked | |
| Negotiation     [■□□□□] 1         | New Leads:           3 new    | |
| Legal Review    [■□□□□] 1         +-------------------------------+ |
+--------------------------------------------------------------------+
| DEALS CLOSING THIS WEEK           OVERDUE TASKS                     |
| ┌────────────────────────────────┬─────────────────────────────────┐|
| │ 🟢 Acme Corp - $125K           │ ⚠ Follow up: DataCorp (2d)     │|
| │    Stage: Negotiation          │ ⚠ Send contract: MegaInc (1d)  │|
| │    Close: Dec 2 (in 2 days)    │                                 │|
| │    Prob: 75%                   │                                 │|
| └────────────────────────────────┴─────────────────────────────────┘|
+--------------------------------------------------------------------+
| RECENT ACTIVITY                                        [View All →] |
| • 8:02 AM - New lead: "GlobalTech" assigned to you                 |
| • 7:45 AM - Email opened: Acme Corp (John Smith)                   |
| • Yesterday 5:30 PM - Meeting completed: TechCo Discovery Call     |
+--------------------------------------------------------------------+
```

**Time:** 2-3 minutes

---

### Step 2: Check Overnight Inbound Leads

**User Action:** Click "New Leads (3)" notification or navigate to Leads

**System Response:**
- URL changes to `/employee/workspace/sales/leads?filter=new`
- Shows leads created in last 24 hours
- Highlights uncontacted leads

**Screen State:**
```
+--------------------------------------------------------------------+
| Leads                           [+ New Lead] [Import] [⚙] [Cmd+K]  |
+--------------------------------------------------------------------+
| [Search leads...]                    [Filter: New ▼] [Sort: Date ▼]|
+--------------------------------------------------------------------+
| ● New (3) │ ○ Contacted (12) │ ○ Qualified (5) │ ○ All (47)       |
+--------------------------------------------------------------------+
| Status  Lead Name        Company        Source      Score  Age     |
| ────────────────────────────────────────────────────────────────── |
| 🔴 New  John Smith       GlobalTech     Website     85/100  2h     |
|         VP Engineering                  Contact                    |
|         john.smith@globaltech.com                                  |
|         📍 San Francisco, CA  💼 Technology  👥 500-1000           |
|                                                                    |
| 🔴 New  Maria Garcia     InnovateCo     LinkedIn    72/100  5h     |
|         Director HR                     Prospecting                |
|         maria.g@innovate.co                                        |
|         📍 Austin, TX  💼 SaaS  👥 100-500                         |
|                                                                    |
| 🔴 New  David Chen       BuildRight     Referral    91/100  8h     |
|         COO                             (Tom J.)                   |
|         d.chen@buildright.com                                      |
|         📍 Seattle, WA  💼 Construction  👥 1000+                  |
+--------------------------------------------------------------------+
```

**User Action:** Click on "John Smith - GlobalTech" (highest score, most recent)

**System Response:**
- Lead detail modal opens
- Shows enriched company data (from Clearbit/ZoomInfo)
- Suggests first contact approach

**Screen State (Lead Detail):**
```
+--------------------------------------------------------------------+
| John Smith - GlobalTech                                        [×] |
+--------------------------------------------------------------------+
| Lead Score: 85/100 🟢  Status: New  Age: 2 hours                   |
+--------------------------------------------------------------------+
| CONTACT INFO                 | COMPANY INFO                         |
| Name: John Smith            | Company: GlobalTech Inc.             |
| Title: VP Engineering       | Industry: Technology / SaaS          |
| Email: john.smith@...       | Size: 500-1000 employees             |
| Phone: +1 (415) 555-0142    | Location: San Francisco, CA          |
| LinkedIn: /in/johnsmith     | Website: globaltech.com              |
| Authority: Decision Maker   | Revenue: $50M-$100M (est.)           |
|                             | Tech Stack: AWS, React, Node.js      |
+--------------------------------------------------------------------+
| BANT QUALIFICATION (Not Started)                                   |
| Budget:   [□□□□□] 0/25  Authority: [□□□□□] 0/25                   |
| Need:     [□□□□□] 0/25  Timeline:  [□□□□□] 0/25                   |
| Total Score: 0/100 (Not Qualified)                                 |
+--------------------------------------------------------------------+
| LEAD SOURCE                                                        |
| Source: Website Contact Form                                       |
| Campaign: n/a                                                      |
| UTM Source: google / cpc                                           |
| First Touch: Nov 30, 2024 6:15 AM                                  |
|                                                                    |
| Form Message:                                                      |
| "We're looking to scale our engineering team rapidly. Need 15-20  |
|  senior developers for a new product line. Timeline: Q1 2025."    |
+--------------------------------------------------------------------+
| 🤖 AI TWIN SUGGESTS:                                               |
| • High urgency indicated ("rapidly", "Q1 2025")                    |
| • Large volume opportunity (15-20 positions)                       |
| • Decision maker (VP level) - strong authority                    |
| • Recommended: Call within 2 hours, mention quick response         |
| • Similar companies closed: avg $180K deal size                    |
+--------------------------------------------------------------------+
| [Qualify BANT] [Log Call] [Send Email] [Convert to Deal] [Nurture]|
+--------------------------------------------------------------------+
```

**Time:** 5-7 minutes per lead (15-20 minutes total for 3 leads)

---

### Step 3: Prioritize Today's Outreach

**User Action:** Return to Dashboard, review "Today's Priorities"

**System Response:**
- Shows tasks sorted by urgency and deal value
- Highlights time-sensitive actions

**User Action:** Open calendar integration to block time for calls

**Screen State (Calendar Integration):**
```
+--------------------------------------------------------------------+
| Today's Schedule                                      [Google Cal] |
+--------------------------------------------------------------------+
| 8:00 AM  ▓▓▓ Dashboard Review (30 min)                           |
| 8:30 AM  ▓▓▓ Lead Review & Prioritization (30 min)               |
| 9:00 AM  ░░░ AVAILABLE - Prospecting Block                        |
| 10:00 AM ▓▓▓ CALL: Acme Corp - John Doe (Follow-up) 🔴           |
| 10:30 AM ░░░ AVAILABLE                                            |
| 11:00 AM ▓▓▓ CALL: Discovery - InnovateCo (Maria G.)             |
| 11:30 AM ░░░ AVAILABLE                                            |
| 12:00 PM      Lunch                                               |
| 1:00 PM  ░░░ AVAILABLE                                            |
| 2:00 PM  ▓▓▓ DEMO: TechCo - Product Presentation 🟡              |
| 3:00 PM  ▓▓▓ (Demo continues)                                     |
| 4:00 PM  ░░░ CRM Updates & Follow-ups                             |
| 5:00 PM  ░░░ Pipeline Review & Planning                           |
+--------------------------------------------------------------------+
```

**Time:** 5-10 minutes

---

### Step 4: Review Emails and Voicemails

**User Action:** Check email inbox, filter for client/prospect emails

**Key Activities:**
1. Reply to urgent client questions
2. Schedule meetings requested
3. Forward technical questions to delivery team
4. Add important updates to CRM activities

**User Action (Example):** Email from Acme Corp asking for pricing adjustment

**User Action in System:**
- Navigate to Acme Corp deal: `/employee/workspace/sales/deals/acme-corp-uuid`
- Log activity: "Email - Pricing inquiry"
- Update deal notes with request
- Tag deal for manager review (discount >15%)

**Time:** 15-20 minutes

---

### Step 5: Update Deal Stages from Yesterday

**User Action:** Click "Deals Closing This Week" on dashboard

**System Response:**
- Shows deals with expected close date within 7 days
- Highlights stale deals (no activity >3 days)

**User Action:** Click "Acme Corp - $125K" deal

**Screen State (Deal Detail):**
```
+--------------------------------------------------------------------+
| Deal: Acme Corp - Enterprise Staffing Program              [Edit] |
+--------------------------------------------------------------------+
| Stage: Negotiation  Probability: 75%  Value: $125,000             |
| Expected Close: Dec 2, 2024 (in 2 days) ⏰                         |
+--------------------------------------------------------------------+
| DEAL OVERVIEW                                                      |
| Account: Acme Corporation                                          |
| Primary Contact: John Doe - VP Operations                          |
| Owner: Sarah Johnson (you)                                         |
| Created: Nov 1, 2024 (30 days ago)                                 |
+--------------------------------------------------------------------+
| TIMELINE                                                           |
| ┌─────────────────────────────────────────────────────────────┐   |
| │ Nov 1  Nov 8   Nov 15  Nov 22  Nov 29  Dec 2               │   |
| │ Discovery → Qualification → Proposal → Negotiation → Close │   |
| │    (7d)        (5d)         (10d)         (8d)         (2d) │   |
| └─────────────────────────────────────────────────────────────┘   |
| Avg Sales Cycle: 45 days | This Deal: 31 days (on track) ✅       |
+--------------------------------------------------------------------+
| RECENT ACTIVITY                                    [+ Log Activity]|
| • Nov 29 5:30 PM - Call: Discussed pricing options (You)          |
|   📝 "John requested 10% discount. Manager approval needed."      |
| • Nov 28 2:00 PM - Email: Sent revised proposal (You)             |
| • Nov 27 10:00 AM - Meeting: Contract review with legal           |
+--------------------------------------------------------------------+
| NEXT STEPS                                                         |
| 🔴 HIGH PRIORITY: Follow up on pricing decision (Due: Today EOD)  |
| 🟡 PENDING: Manager approval for 10% discount                     |
| 🟢 SCHEDULED: Final contract review call - Dec 1 at 3:00 PM       |
+--------------------------------------------------------------------+
| LINKED ENTITIES                                                    |
| Jobs: 5 positions planned (2 Senior Devs, 2 QA, 1 DevOps Lead)   |
| Contacts: John Doe (Primary), Mary Smith (HR Director)            |
| Documents: MSA Draft v3, Rate Card, Proposal Nov 28               |
+--------------------------------------------------------------------+
| [Move Stage →] [Log Activity] [Schedule Meeting] [Update Value]   |
+--------------------------------------------------------------------+
```

**User Action:** Click "Log Activity" button

**System Response:**
- Activity modal opens

**User Action:**
- Select Activity Type: "Call"
- Set Date/Time: "Today, 10:00 AM" (scheduled)
- Add Subject: "Pricing follow-up"
- Add Notes: "Need to close pricing decision. Prepare counter-offer if needed."
- Click "Save"

**Time:** 5-10 minutes per critical deal (15-30 minutes total)

---

## Mid-Morning: Prospecting & Discovery (10:00 AM - 12:00 PM)

### Step 6: Make Scheduled Follow-up Call (Acme Corp)

**Time:** 10:00 AM

**Pre-Call Prep:**

**User Action:** Open deal on second monitor, review notes from last call

**Key Info Visible:**
- Last conversation notes
- Pricing request details
- Contact's communication style preferences
- Deal history

**User Action:** Click "Start Call" button (if using integrated dialer)

**System Response:**
- Call log automatically created
- Timer starts
- Notes field ready for real-time input

**During Call:**
- User types notes in real-time
- System suggests talking points from AI Twin
- User marks outcomes as discussed

**Post-Call:**

**Screen State (Call Log Form):**
```
+--------------------------------------------------------------------+
| Log Call - Acme Corp Deal                                          |
+--------------------------------------------------------------------+
| Call Duration: 18 minutes                                          |
| Contact: John Doe                                                  |
| Date/Time: Nov 30, 2024 10:00 AM                                   |
+--------------------------------------------------------------------+
| CALL OUTCOME                                                       |
| [×] Connected  [ ] Voicemail  [ ] No Answer  [ ] Gatekeeper        |
|                                                                    |
| DISCUSSION TOPICS (check all that apply)                           |
| [×] Pricing negotiation                                            |
| [×] Timeline clarification                                         |
| [ ] Technical requirements                                         |
| [×] Next steps / decision timeline                                 |
| [ ] Competitor comparison                                          |
| [ ] Contract terms                                                 |
+--------------------------------------------------------------------+
| CALL NOTES                                                         |
| John confirmed budget approved at $115K (10% discount accepted).  |
| Legal review complete on their side. Ready to sign by Dec 2.      |
| Need to send final MSA by EOD tomorrow (Dec 1).                   |
| Mary Smith (HR) wants to be CC'd on all documents.                |
| Start date confirmed: Jan 6, 2025.                                |
+--------------------------------------------------------------------+
| OUTCOME                                                            |
| [×] Positive  [ ] Neutral  [ ] Negative  [ ] Needs Follow-up       |
|                                                                    |
| NEXT ACTION                                                        |
| Action: Send final MSA with agreed terms                           |
| Due Date: Dec 1, 2024                                              |
| Assigned To: [You - Sarah Johnson ▼]                              |
+--------------------------------------------------------------------+
| DEAL UPDATE                                                        |
| Update Stage: [Negotiation ▼] → [Legal Review ▼]                  |
| Update Probability: 75% → [90% ▼]                                 |
| Update Value: $125,000 → [$115,000        ]                       |
+--------------------------------------------------------------------+
| [Cancel] [Save Activity] [Save & Move Stage →]                    |
+--------------------------------------------------------------------+
```

**User Action:** Click "Save & Move Stage →"

**System Response:**
- Activity logged
- Deal stage updated to "Legal Review"
- Probability updated to 90%
- Value updated to $115,000
- Task created: "Send final MSA" (Due: Dec 1)
- Toast notification: "Deal updated successfully ✓"
- Email notification sent to manager (large deal update)

**Time:** 25-30 minutes (including prep and logging)

---

### Step 7: Discovery Call with New Lead (InnovateCo)

**Time:** 11:00 AM

**Pre-Call Prep:**

**User Action:** Navigate to lead: `/employee/workspace/sales/leads/innovateco-uuid`

**User Action:** Review BANT framework guide

**System Response:**
- Shows BANT question templates
- Displays company research from enrichment

**Screen State (BANT Guide):**
```
+--------------------------------------------------------------------+
| BANT Discovery Call Guide - InnovateCo (Maria Garcia)             |
+--------------------------------------------------------------------+
| 🎯 CALL OBJECTIVE: Qualify lead and understand staffing needs     |
+--------------------------------------------------------------------+
| COMPANY INTEL (from Clearbit)                                      |
| • Industry: SaaS / HR Technology                                   |
| • Size: 100-500 employees                                          |
| • Revenue: $10M-$50M (estimated)                                   |
| • Growth: +45% YoY (high growth)                                   |
| • Tech Stack: React, Python, AWS, PostgreSQL                       |
| • Recent News: Series B funding $25M (3 months ago)                |
+--------------------------------------------------------------------+
| BUDGET QUESTIONS                                                   |
| • "What's your current staffing budget for this initiative?"       |
| • "Have you allocated funds for external recruiting support?"      |
| • "What's your typical budget range for contract placements?"      |
+--------------------------------------------------------------------+
| AUTHORITY QUESTIONS                                                |
| • "Who else is involved in the hiring decision?"                   |
| • "What's your approval process for engaging external vendors?"    |
| • "Do you have an existing MSA process, or preferred legal team?"  |
+--------------------------------------------------------------------+
| NEED QUESTIONS                                                     |
| • "What challenges are you facing with your current hiring?"       |
| • "What happens if these positions aren't filled on time?"         |
| • "What's driving the urgency around these roles?"                 |
+--------------------------------------------------------------------+
| TIMELINE QUESTIONS                                                 |
| • "When do you need these people to start?"                        |
| • "What's your ideal timeline for making a decision on vendors?"   |
| • "Are there any project deadlines driving these hires?"           |
+--------------------------------------------------------------------+
| 🤖 AI TWIN INSIGHTS:                                               |
| • Recent funding suggests budget availability (HIGH BUDGET)        |
| • HR Director likely has authority for recruiting vendors          |
| • High growth = likely urgent hiring needs                         |
| • Recommend: Focus on speed-to-hire and quality of talent          |
+--------------------------------------------------------------------+
```

**User Action:** Click "Start Call & Begin BANT"

**During Call (45 minutes):**
- User asks BANT questions
- Types answers into BANT scoring fields
- System auto-scores based on keywords

**Post-Call:**

**Screen State (BANT Qualification Form):**
```
+--------------------------------------------------------------------+
| BANT Qualification - InnovateCo (Maria Garcia)                     |
+--------------------------------------------------------------------+
| Call Duration: 42 minutes                     Status: Connected ✓  |
+--------------------------------------------------------------------+
| BUDGET (0-25 points)                                               |
| Score: [████████████████████░░░] 20/25  (Strong)                   |
|                                                                    |
| Notes:                                                             |
| Budget confirmed: $400K allocated for Q1 hiring (8 engineers).    |
| Approved by CFO. Willing to pay market rates for quality talent.  |
| Previous agency spend: $50K-$75K per placement.                   |
|                                                                    |
| 🤖 Auto-scored: Mentioned "approved budget", "allocated funds"     |
+--------------------------------------------------------------------+
| AUTHORITY (0-25 points)                                            |
| Score: [██████████████████░░░░] 18/25  (Moderate-Strong)           |
|                                                                    |
| Notes:                                                             |
| Maria (HR Director) has authority to select vendors up to $500K.  |
| VP of Engineering (Tom Chen) must approve finalists.              |
| Legal review required but typically 5-7 days.                     |
| Procurement contact: Sarah Lee (will send MSA template).          |
|                                                                    |
| 🤖 Auto-scored: Decision maker identified, stakeholders mapped     |
+--------------------------------------------------------------------+
| NEED (0-25 points)                                                 |
| Score: [█████████████████████░] 22/25  (Very Strong)               |
|                                                                    |
| Notes:                                                             |
| URGENT: New product launch delayed due to lack of engineering.    |
| Current team: 50 engineers, need to grow to 80 by March.          |
| Pain points: Lost 3 key engineers to competitors (retention).     |
| Tried in-house recruiting: only filled 2 of 12 open roles (16%).  |
| Cost of delay: $2M in deferred revenue per quarter.               |
|                                                                    |
| 🤖 Auto-scored: Strong pain points, quantified impact, urgency     |
+--------------------------------------------------------------------+
| TIMELINE (0-25 points)                                             |
| Score: [████████████████████░░] 19/25  (Strong)                    |
|                                                                    |
| Notes:                                                             |
| Decision timeline: Select vendor by Dec 15 (2 weeks).             |
| Need first candidates presented by Dec 20.                        |
| First hires must start by Jan 15, 2025 (6 weeks).                |
| Product launch: March 31, 2025 (hard deadline).                   |
|                                                                    |
| 🤖 Auto-scored: Specific dates, near-term urgency, hard deadline   |
+--------------------------------------------------------------------+
| TOTAL BANT SCORE: 79/100 🟢 QUALIFIED (SQL)                        |
+--------------------------------------------------------------------+
| Recommendation: CONVERT TO DEAL ✓                                 |
| Estimated Deal Value: $320,000 (8 placements × $40K avg)          |
| Suggested Next Step: Send capabilities deck + 3 case studies      |
+--------------------------------------------------------------------+
| ADDITIONAL NOTES                                                   |
| • Requested case studies from SaaS/tech companies                  |
| • Interested in RPO model for ongoing partnership                  |
| • Mentioned competitor: "TalentSource Pro" (we need to beat)       |
| • Personal connection: Knows Tom from previous company             |
+--------------------------------------------------------------------+
| [Save & Keep as Lead] [Convert to Deal →] [Schedule Follow-up]    |
+--------------------------------------------------------------------+
```

**User Action:** Click "Convert to Deal →"

**System Response:**
- Deal creation modal opens
- Pre-filled with BANT data

**Screen State (Convert to Deal):**
```
+--------------------------------------------------------------------+
| Convert Lead to Deal                                               |
+--------------------------------------------------------------------+
| Deal Title *                                                       |
| [InnovateCo - Engineering Staffing Program                      ]  |
|                                                                    |
| Deal Value * (Annual)                                              |
| [$320,000      ] (Auto-calculated from BANT notes)                |
|                                                                    |
| Account                                                            |
| [ ] Use existing account: [Search...                          ▼]  |
| [×] Create new account: InnovateCo Inc.                           |
|                                                                    |
| Stage                                                              |
| [Qualification ▼] (Based on BANT completion)                      |
|                                                                    |
| Probability                                                        |
| [65% ▼] (Based on 79/100 BANT score)                              |
|                                                                    |
| Expected Close Date                                                |
| [Dec 15, 2024 📅] (From timeline notes)                            |
|                                                                    |
| Primary Contact                                                    |
| Maria Garcia - HR Director ✓                                      |
|                                                                    |
| Next Action                                                        |
| [Send capabilities deck + case studies                          ]  |
| Due: [Dec 1, 2024 📅]                                              |
+--------------------------------------------------------------------+
| [Cancel] [Create Deal] [Create Deal & Open →]                     |
+--------------------------------------------------------------------+
```

**User Action:** Click "Create Deal & Open →"

**System Response:**
- Deal created
- Account created (InnovateCo Inc.)
- Contact created/linked (Maria Garcia)
- Lead status updated to "Converted"
- Lead.convertedToDealId set
- Lead.convertedToAccountId set
- Activity logged: "Lead converted to deal"
- User redirected to new deal detail page
- Toast: "Deal created successfully! 🎉"

**Time:** 1 hour total (call + BANT logging + conversion)

---

## Afternoon: Client Meetings & Presentations (1:00 PM - 3:00 PM)

### Step 8: Prepare for Demo (TechCo)

**Time:** 1:00-2:00 PM

**User Action:** Navigate to deal: `/employee/workspace/sales/deals/techco-uuid`

**User Action:** Review demo preparation checklist

**System Response:**
- Shows deal context
- Lists demo best practices
- Suggests customization points

**Activities:**
1. Review TechCo's requirements
2. Customize demo slides with their use case
3. Prepare case study examples from similar clients
4. Set up Zoom meeting room
5. Test screen sharing

**Time:** 45-60 minutes

---

### Step 9: Conduct Product Demo

**Time:** 2:00-3:00 PM

**User Action:** Join Zoom meeting with TechCo team

**Participants:**
- Sarah Johnson (Sales Rep - you)
- Product Specialist (invited guest)
- TechCo: 4 attendees (VP Engineering, 2 Hiring Managers, HR Partner)

**Demo Agenda:**
1. Introductions (5 min)
2. TechCo's challenges recap (5 min)
3. InTime platform walkthrough (25 min)
4. Case study: Similar tech company (10 min)
5. Q&A (10 min)
6. Next steps (5 min)

**Post-Demo:**

**User Action:** Return to InTime, log demo activity

**Screen State (Log Meeting):**
```
+--------------------------------------------------------------------+
| Log Meeting - TechCo Deal                                          |
+--------------------------------------------------------------------+
| Meeting Type: [Product Demo ▼]                                    |
| Date/Time: Nov 30, 2024 2:00 PM                                   |
| Duration: [58] minutes                                             |
+--------------------------------------------------------------------+
| ATTENDEES                                                          |
| Internal:                                                          |
| • Sarah Johnson (you) - Sales Rep                                 |
| • Mike Chen - Product Specialist                                  |
|                                                                    |
| Client:                                                            |
| • Jennifer Wu - VP Engineering ⭐ (Decision Maker)                 |
| • Robert Kim - Hiring Manager (Backend)                           |
| • Lisa Park - Hiring Manager (Frontend)                           |
| • David Tran - HR Business Partner                                |
+--------------------------------------------------------------------+
| MEETING NOTES                                                      |
| Very positive reception. Jennifer asked great questions about     |
| candidate quality metrics. Loved the case study from "SaaSCo"     |
| (similar company, reduced time-to-hire by 40%).                   |
|                                                                    |
| Key Questions/Concerns:                                            |
| 1. Pricing transparency (answered: yes, we provide detailed SOW)  |
| 2. Replacement guarantee (answered: 90-day guarantee)             |
| 3. Speed to first candidates (answered: 7-10 days typical)        |
|                                                                    |
| Buying Signals:                                                    |
| • Jennifer: "This looks like exactly what we need"                |
| • Asked about onboarding timeline                                 |
| • Requested references from other tech companies                  |
+--------------------------------------------------------------------+
| OUTCOME                                                            |
| [×] Very Positive  [ ] Positive  [ ] Neutral  [ ] Needs Work       |
|                                                                    |
| NEXT STEPS AGREED                                                  |
| 1. Send proposal by Dec 2 (Monday)                                |
| 2. Provide 3 client references (tech companies)                   |
| 3. Schedule follow-up call for Dec 5 to review proposal           |
| 4. Jennifer will brief CEO and get final approval by Dec 10       |
+--------------------------------------------------------------------+
| DEAL UPDATE                                                        |
| Move Stage: [Qualification ▼] → [Proposal ▼]                      |
| Update Probability: 45% → [70% ▼]                                 |
| Update Close Date: [Dec 10, 2024 📅]                               |
+--------------------------------------------------------------------+
| [Cancel] [Save Activity] [Save & Create Tasks]                    |
+--------------------------------------------------------------------+
```

**User Action:** Click "Save & Create Tasks"

**System Response:**
- Meeting logged
- 3 tasks auto-created:
  1. "Send proposal to TechCo" (Due: Dec 2)
  2. "Provide client references" (Due: Dec 2)
  3. "Schedule follow-up call for Dec 5" (Due: Today)
- Deal stage moved to "Proposal"
- Probability updated to 70%
- Email summary sent to Product Specialist (attendee)

**Time:** 1 hour meeting + 10 minutes logging

---

## Late Afternoon: CRM Updates & Follow-ups (3:00 PM - 5:00 PM)

### Step 10: Pipeline Review & Hygiene

**Time:** 3:30 PM

**User Action:** Navigate to Deals Pipeline: `/employee/workspace/sales/deals`

**System Response:**
- Shows kanban board view of all deals

**Screen State (Deals Pipeline - Kanban View):**
```
+--------------------------------------------------------------------+
| Deals Pipeline                        [List] [Kanban] [Forecast]   |
+--------------------------------------------------------------------+
| [Search deals...]                     [My Deals ▼] [This Quarter ▼]|
+--------------------------------------------------------------------+
| Discovery    Qualification  Proposal   Negotiation  Legal Review   |
| $285K (5)    $185K (3)      $125K (2)  $95K (1)     $115K (1)      |
| ──────────── ────────────── ────────── ──────────── ────────────── |
| ┌──────────┐ ┌──────────┐  ┌────────┐ ┌─────────┐  ┌──────────┐  |
| │GlobalTech│ │InnovateCo│  │TechCo  │ │MegaCorp │  │Acme Corp │  |
| │$180K     │ │$320K ⚠   │  │$75K    │ │$95K     │  │$115K     │  |
| │30% prob  │ │65% prob  │  │70% prob│ │75% prob │  │90% prob  │  |
| │Dec 20    │ │Dec 15    │  │Dec 10  │ │Dec 5    │  │Dec 2     │  |
| │3d old    │ │NEW       │  │5d old  │ │8d old   │  │31d old   │  |
| └──────────┘ └──────────┘  └────────┘ └─────────┘  └──────────┘  |
|                                                                    |
| ┌──────────┐ ┌──────────┐  ┌────────┐                             |
| │BuildCo   │ │DataInc   │  │BizSoft │                             |
| │$65K      │ │$95K      │  │$50K    │                             |
| │25% prob  │ │60% prob  │  │65% prob│                             |
| │Jan 15    │ │Dec 18    │  │Dec 12  │                             |
| │7d old    │ │4d old    │  │6d old  │                             |
| └──────────┘ └──────────┘  └────────┘                             |
|                                        CLOSED-WON    CLOSED-LOST   |
|                                        $450K (6)     $85K (2)      |
|                                        This Month    This Month    |
+--------------------------------------------------------------------+
| ⚠ STALE DEALS (No activity >5 days):                              |
| • MegaCorp ($95K) - Last activity: Nov 22 (8 days ago)            |
| • BuildCo ($65K) - Last activity: Nov 23 (7 days ago)             |
| • BizSoft ($50K) - Last activity: Nov 24 (6 days ago)             |
+--------------------------------------------------------------------+
| FORECAST SUMMARY                                                   |
| Weighted Pipeline: $254,250 (Total: $805K × Avg Prob: 31.6%)     |
| Closing This Week: $115K (Acme) + $95K (Mega) = $210K             |
| Closing This Month: $285K total (4 deals)                         |
| Quarterly Quota: $200K | Attainment: 142% (YTD: $284K closed)    |
+--------------------------------------------------------------------+
```

**User Action:** Click "⚠ InnovateCo" (new deal, needs follow-up)

**User Action:** Send follow-up email with capabilities deck

**Time:** 5 minutes per stale deal (20-25 minutes total)

---

### Step 11: Send Proposal (BizInc)

**Time:** 4:00 PM

**User Action:** Navigate to BizInc deal

**User Action:** Click "Create Proposal" button

**System Response:**
- Proposal builder opens
- Templates available

**Screen State (Proposal Builder):**
```
+--------------------------------------------------------------------+
| Proposal Builder - BizInc Deal                                     |
+--------------------------------------------------------------------+
| Template: [Standard Staffing Proposal ▼]                          |
+--------------------------------------------------------------------+
| CLIENT INFORMATION (Auto-filled)                                   |
| Company: BizInc Solutions                                          |
| Contact: Robert Martinez - VP Operations                           |
| Email: r.martinez@bizinc.com                                       |
+--------------------------------------------------------------------+
| PROPOSAL DETAILS                                                   |
| Proposal Title:                                                    |
| [BizInc - Engineering Staffing Services                         ]  |
|                                                                    |
| Executive Summary:                                                 |
| [BizInc requires 6 software engineers (4 backend, 2 frontend)... ] |
|                                                                    |
| Scope of Work:                                                     |
| [×] Contract Staffing (6 positions)                               |
| [×] Dedicated Account Manager                                     |
| [×] 90-Day Replacement Guarantee                                  |
| [ ] Retained Search                                               |
| [ ] RPO (Recruitment Process Outsourcing)                         |
+--------------------------------------------------------------------+
| POSITIONS & PRICING                                                |
| Position                 Qty  Bill Rate    Total Annual            |
| ─────────────────────────────────────────────────────────────────  |
| Senior Backend Engineer   4   $95-105/hr   $790K-$874K             |
| Senior Frontend Engineer  2   $90-100/hr   $374K-$416K             |
|                                                                    |
| TOTAL ESTIMATED VALUE:         $1,164K - $1,290K annually         |
+--------------------------------------------------------------------+
| PAYMENT TERMS                                                      |
| Payment Schedule: [Net 30 ▼]                                      |
| Invoicing: [Bi-weekly based on timesheets ▼]                      |
| Markup: [35% ▼] (Client Tier: Mid-Market)                         |
+--------------------------------------------------------------------+
| TIMELINE                                                           |
| Kickoff: Dec 5, 2024                                              |
| First Candidates: Dec 15, 2024 (10 business days)                 |
| Target Start Date: Jan 6, 2025                                    |
+--------------------------------------------------------------------+
| ADDITIONAL TERMS                                                   |
| [×] Include 90-day replacement guarantee                          |
| [×] Include case studies (3 similar companies)                    |
| [×] Include client testimonials                                   |
| [ ] Include optional RPO pricing                                  |
+--------------------------------------------------------------------+
| VALIDITY                                                           |
| Proposal Valid Until: [Dec 31, 2024 📅]                            |
+--------------------------------------------------------------------+
| [Preview PDF] [Save Draft] [Send to Client]                       |
+--------------------------------------------------------------------+
```

**User Action:** Click "Preview PDF"

**System Response:**
- Generates PDF proposal
- Shows preview

**User Action:** Review, click "Send to Client"

**System Response:**
- Email compose window opens
- Proposal attached as PDF

**User Action:** Add personal message, click "Send"

**System Response:**
- Email sent
- Activity logged: "Proposal sent"
- Deal updated: Last activity timestamp
- Task marked complete: "Send proposal to BizInc"
- Email tracking pixel added (opens/clicks tracked)

**Time:** 20-30 minutes

---

### Step 12: Update CRM Notes & Next-Day Planning

**Time:** 4:30 PM

**User Action:** Review all deals touched today, ensure notes are complete

**Checklist:**
- [×] All calls logged
- [×] All emails logged (key emails)
- [×] All meetings logged
- [×] Deal stages accurate
- [×] Next actions defined
- [×] Tomorrow's priorities set

**User Action:** Open "Tomorrow's Plan" view

**System Response:**
- Shows tasks due tomorrow
- Shows meetings scheduled
- Shows deals needing attention

**Screen State (Tomorrow's Plan):**
```
+--------------------------------------------------------------------+
| Monday, December 1, 2024 - Your Plan                               |
+--------------------------------------------------------------------+
| HIGH PRIORITY TASKS (3)                                            |
| 🔴 Send final MSA to Acme Corp (closes Dec 2)                     |
| 🔴 Send proposal to TechCo (committed to client)                  |
| 🔴 Follow up: MegaCorp deal (stale 8 days)                        |
+--------------------------------------------------------------------+
| SCHEDULED MEETINGS (2)                                             |
| 10:00 AM - Discovery Call: BuildRight (David Chen) - New Lead     |
| 3:00 PM - Negotiation Call: MegaCorp - Pricing Discussion         |
+--------------------------------------------------------------------+
| PROSPECTING GOALS                                                  |
| • 15-20 cold calls (target accounts list)                          |
| • 25 outbound emails (campaign: Q1 Tech Hiring)                    |
| • 5 LinkedIn connection requests (VP/Director level)               |
+--------------------------------------------------------------------+
| DEALS NEEDING ATTENTION (No recent activity)                       |
| • BuildCo ($65K) - Last contact: 7 days ago                       |
| • BizSoft ($50K) - Last contact: 6 days ago                       |
+--------------------------------------------------------------------+
| AI TWIN SUGGESTIONS:                                               |
| • Focus on MegaCorp close (high value, close date Dec 5)          |
| • InnovateCo showing high engagement (opened email 3x)            |
| • Consider nurture campaign for DataInc (slow response)           |
+--------------------------------------------------------------------+
```

**Time:** 10-15 minutes

---

### Step 13: End-of-Day Manager Sync (Optional)

**Time:** 4:45 PM (if scheduled)

**Context:** Weekly 1-on-1 with Sales Director

**Topics Discussed:**
1. Acme Corp close progress (need discount approval)
2. InnovateCo - new qualified deal
3. TechCo demo went well, moving to proposal
4. Quarterly forecast update
5. Coaching on handling MegaCorp pricing objection

**User Action in System:** No specific action (verbal discussion)

**Follow-up Actions:**
- Manager approves 10% discount for Acme Corp
- Manager assigns stretch goal: +1 deal this month

**Time:** 15 minutes

---

## End-of-Day Summary (5:00 PM)

### Final Dashboard Check

**User Action:** Return to Sales Dashboard

**System Response:**
- Shows updated metrics from today's activities

**Screen State (End of Day Dashboard):**
```
+--------------------------------------------------------------------+
| Sales Dashboard - Today's Summary                   [Cmd+K] [Twin] |
+--------------------------------------------------------------------+
| Great work today, Sarah! Here's what you accomplished:             |
+--------------------------------------------------------------------+
| TODAY'S ACTIVITY                                                   |
| ✅ Calls Made: 12 (Target: 10) 🎯                                 |
| ✅ Emails Sent: 28 (Target: 25) 🎯                                |
| ✅ Meetings: 2 completed                                          |
| ✅ Proposals Sent: 1                                              |
| ✅ New Deals Created: 1 (InnovateCo - $320K)                      |
| ✅ Deals Advanced: 2 (Acme to Legal, TechCo to Proposal)          |
+--------------------------------------------------------------------+
| PIPELINE MOVEMENT                                                  |
| Starting Pipeline: $805,000                                        |
| Added Today: +$320,000 (InnovateCo)                               |
| Updated Values: -$10,000 (Acme negotiated discount)              |
| Ending Pipeline: $1,115,000                                       |
| Weighted Value: $334,500                                          |
+--------------------------------------------------------------------+
| DEALS CLOSING THIS WEEK                                            |
| Acme Corp - $115K (Prob: 90%) - Expected: Dec 2                   |
| MegaCorp - $95K (Prob: 75%) - Expected: Dec 5                     |
| Total Forecast: $210K                                             |
+--------------------------------------------------------------------+
| TASKS COMPLETED TODAY: 8 / 10                                      |
| ✅ Follow up: Acme Corp                                           |
| ✅ Demo: TechCo                                                   |
| ✅ Send proposal: BizInc                                          |
| ✅ BANT qualification: InnovateCo                                 |
| ✅ Convert lead: InnovateCo                                       |
| ✅ Review new leads (3)                                           |
| ⏭ Send contract: (moved to tomorrow)                             |
| ⏭ Follow up: DataInc (moved to tomorrow)                         |
+--------------------------------------------------------------------+
| QUARTERLY PERFORMANCE                                              |
| Quota: $200,000 | Closed: $284,000 | Attainment: 142% ✅          |
| Deals Closed: 4 | Win Rate: 33% | Avg Deal Size: $71K            |
| Pipeline for Next Quarter: $1.1M (5.5x quota) ✅                  |
+--------------------------------------------------------------------+
```

**Time:** 2 minutes

---

## Postconditions

### What Was Accomplished

1. ✅ **Pipeline Management**
   - Reviewed and updated all active deals
   - Advanced 2 deals to next stage
   - Created 1 new qualified deal ($320K)
   - Total pipeline increased by $310K

2. ✅ **Client Engagement**
   - Completed 12 calls
   - Sent 28 emails
   - Conducted 2 client meetings
   - Sent 1 formal proposal

3. ✅ **Lead Management**
   - Reviewed 3 new inbound leads
   - Qualified 1 lead with BANT (79/100)
   - Converted 1 lead to deal

4. ✅ **CRM Hygiene**
   - Logged all activities
   - Updated deal stages and probabilities
   - Created next-day tasks
   - Kept notes current

5. ✅ **Forecast Accuracy**
   - Updated weighted pipeline
   - Adjusted close dates based on conversations
   - Identified at-risk deals

---

## Key Metrics for This Day

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Calls Made | 10-15 | 12 | ✅ On target |
| Emails Sent | 20-25 | 28 | ✅ Exceeded |
| Meetings | 2-3 | 2 | ✅ On target |
| New Leads Reviewed | 3+ | 3 | ✅ On target |
| Deals Advanced | 1-2 | 2 | ✅ On target |
| Proposals Sent | 1 | 1 | ✅ On target |
| Pipeline Growth | Positive | +$310K | ✅ Strong |
| CRM Updated | 100% | 100% | ✅ Complete |

---

## Common Daily Challenges & Solutions

| Challenge | Solution in InTime |
|-----------|-------------------|
| Forgot to log a call | Activity timeline shows gaps; AI Twin reminds |
| Deal stage unclear | Stage definitions visible in-app with exit criteria |
| Lost track of next steps | Tasks auto-created from logged activities |
| Can't find lead source | Source tracking visible on lead detail |
| Unclear on pricing | Rate cards accessible from deal context |
| Need manager approval | Escalation workflow built into deal updates |
| Stale deals slipping | Dashboard highlights deals with no activity >5 days |
| Forecast inaccuracy | Weighted pipeline auto-calculated from probabilities |

---

## Time-Saving Features Used

1. **AI Twin Suggestions** - Recommended prioritization, talking points
2. **Auto-fill Forms** - BANT conversion pre-filled deal details
3. **Email Tracking** - Tracked opens/clicks without manual logging
4. **Activity Templates** - Quick call/email logging with templates
5. **Keyboard Shortcuts** - `Cmd+K` for quick navigation
6. **Dashboard Widgets** - At-a-glance pipeline health
7. **Task Auto-creation** - Next steps created from meeting logs
8. **Calendar Integration** - Meetings synced from Google Calendar

---

## Related Use Cases

- [02-manage-leads.md](./02-manage-leads.md) - Deep dive into lead management
- [03-manage-deals.md](./03-manage-deals.md) - Deal pipeline management
- [04-prospect-outreach.md](./04-prospect-outreach.md) - Prospecting campaigns
- [05-close-deal.md](./05-close-deal.md) - Closing and handoff process

---

*Last Updated: 2024-11-30*
