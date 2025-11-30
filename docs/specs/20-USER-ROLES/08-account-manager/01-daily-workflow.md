# Daily Workflow: Account Manager

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-AM-001 |
| Actor | Account Manager |
| Goal | Execute daily client success activities to maximize retention and satisfaction |
| Frequency | Daily (Monday-Friday) |
| Estimated Time | 8-9 hours |
| Priority | High |

---

## Preconditions

1. User is logged in as Account Manager
2. User has assigned client portfolio (8-50 accounts)
3. User has access to client health dashboard
4. Email and Slack notifications enabled

---

## Trigger

- Start of business day (typically 8:00-9:00 AM)
- Account Manager logs into InTime OS

---

## Daily Workflow Timeline

### 8:00 AM - Morning Routine: Review Dashboard (30 minutes)

#### Step 1: Navigate to Account Manager Console

**User Action:** Click "Workspace" in sidebar, select "Account Manager Console"

**System Response:**
- Loads personalized AM dashboard
- Shows portfolio summary metrics
- Displays priority alerts and tasks

**Screen State:**
```
+------------------------------------------------------------------+
| Account Manager Console               [Today: Monday, Nov 30]    |
+------------------------------------------------------------------+
| Portfolio Health                              Quick Actions       |
| +------------------------+                    +------------------+|
| | NRR: 112% ▲           |                    | + New Activity  ||
| | Accounts: 42          |                    | + Log Call      ||
| | • Green: 29 (69%)     |                    | + Schedule QBR  ||
| | • Yellow: 11 (26%)    |                    | View All Clients||
| | • Red: 2 (5%) ⚠️      |                    +------------------+|
| +------------------------+                                        |
|                                                                   |
| 🔴 URGENT ALERTS (2)                                             |
| ┌─────────────────────────────────────────────────────────────┐ |
| │ ⚠️  TechCorp - Payment 45 days overdue ($85K)                │ |
| │     Action: Contact Finance contact immediately              │ |
| │                                          [View] [Take Action] │ |
| ├─────────────────────────────────────────────────────────────┤ |
| │ ⚠️  DataSystems - Health score dropped to RED (42/100)      │ |
| │     Reason: No hiring in 60 days, NPS=3                     │ |
| │                                          [View] [Take Action] │ |
| └─────────────────────────────────────────────────────────────┘ |
|                                                                   |
| TODAY'S PRIORITIES (5)                                           |
| ┌─────────────────────────────────────────────────────────────┐ |
| │ ☐ 9:30 AM - Call with TechCorp CFO (payment escalation)     │ |
| │ ☐ 11:00 AM - QBR presentation for MegaBank                  │ |
| │ ☐ 2:00 PM - Weekly sync with recruiting team (5 accounts)   │ |
| │ ☐ 4:00 PM - Review expansion proposal for RetailCo          │ |
| │ ☐ EOD - Log all client interactions in CRM                  │ |
| └─────────────────────────────────────────────────────────────┘ |
|                                                                   |
| CLIENT ACTIVITY (Last 24 Hours)                                  |
| ┌─────────────────────────────────────────────────────────────┐ |
| │ 📧 FinanceHub - Email: New hiring needs for Q1 (2h ago)     │ |
| │ 📞 RetailCo - Recruiter escalation: Late submission (5h ago) │ |
| │ ✅ HealthTech - 3 new hires started successfully (8h ago)    │ |
| │ 📊 InsureCo - NPS survey response: 9/10 (Promoter!) (12h)   │ |
| └─────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Time:** 5 minutes

---

#### Step 2: Review Red/Yellow Account Alerts

**User Action:** Click on "DataSystems" RED alert

**System Response:**
- Opens account health detail view
- Shows health score breakdown
- Displays recent activity timeline
- Suggests recommended actions

**Screen State:**
```
+------------------------------------------------------------------+
| DataSystems Inc.                        Health: RED (42/100) ⚠️  |
+------------------------------------------------------------------+
| Account Tier: Growth ($280K ARR)   Owner: You   Status: At-Risk |
+------------------------------------------------------------------+
|                                                                   |
| HEALTH SCORE BREAKDOWN                                           |
| ┌────────────────────────────────────────────────────────────┐  |
| │ Hiring Velocity:         0/25  ████░░░░░░░░░░░░░░░░░░░░░░  │  |
| │ Payment Promptness:     15/20  ███████████████████░░░░░░░  │  |
| │ NPS/Satisfaction:        5/20  ██████░░░░░░░░░░░░░░░░░░░░  │  |
| │ Executive Engagement:   10/15  ██████████████░░░░░░░░░░░░  │  |
| │ Expansion Pipeline:      0/10  ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  |
| │ Issue Frequency:        12/10  ████████████ (2 escalations) │  |
| │                                                              │  |
| │ TOTAL SCORE:            42/100 █████████░░░░░░░░░░░░░░░░░  │  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| KEY RISK FACTORS                                                 |
| • No active jobs in 60 days (last hire: Sept 28)                |
| • Recent NPS score: 3/10 (Detractor) - Survey: Oct 15           |
| • Primary contact (Jane Doe) unresponsive to last 2 emails      |
| • 2 escalations in past month (quality issues)                  |
|                                                                   |
| RECOMMENDED ACTIONS                                              |
| ┌────────────────────────────────────────────────────────────┐  |
| │ 🎯 HIGH PRIORITY                                            │  |
| │ 1. Schedule emergency check-in call with Jane Doe          │  |
| │    [Schedule Call]                                          │  |
| │ 2. Review last 2 escalations - identify root cause         │  |
| │    [View Escalations]                                       │  |
| │ 3. Reach out to secondary contact (John Smith, VP Ops)     │  |
| │    [Draft Email]                                            │  |
| │ 4. Review hiring plans - understand business changes       │  |
| │    [View Account Notes]                                     │  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| ACTIVITY TIMELINE (Last 30 days)                                 |
| Oct 25: Escalation - Poor candidate quality (Resolved)          |
| Oct 18: Email - Requested pause on all searches                 |
| Oct 15: NPS Survey - Score: 3/10 "Not meeting expectations"     |
| Oct 10: Escalation - Missed deadline on Software Engineer role  |
| Sept 28: Placement - Last successful hire (Frontend Developer)  |
|                                                                   |
+------------------------------------------------------------------+
```

**User Action:** Click "[Schedule Call]" button

**System Response:**
- Opens calendar integration
- Suggests times based on contact's timezone
- Creates draft email with meeting invite

**Time:** 10 minutes (includes scheduling call for later today)

---

#### Step 3: Check Email and Slack Notifications

**User Action:** Switch to email client, review overnight messages

**Key Activities:**
- Scan for client emails (priority: escalations, urgent requests)
- Review Slack shared client channels
- Flag urgent items for immediate response
- Move routine items to task list

**System Integration:**
- InTime OS shows unread client emails count: badge on dashboard
- Slack mentions appear in "Notifications" panel
- Critical keywords trigger alerts: "escalation", "urgent", "cancel", "unhappy"

**Time:** 10 minutes

---

#### Step 4: Review Today's Calendar

**User Action:** Open calendar view

**System Response:**
- Shows all scheduled meetings
- Highlights client-facing meetings
- Shows preparation status for QBRs

**Screen State:**
```
+------------------------------------------------------------------+
| Today's Schedule - Monday, November 30                            |
+------------------------------------------------------------------+
| 9:00 AM  ✅ Review dashboard (current)                           |
| 9:30 AM  📞 TechCorp CFO - Payment Escalation (URGENT)           |
|          Prep: ⚠️ Missing - [View Account] [Prepare Now]        |
|                                                                   |
| 11:00 AM 🎯 MegaBank QBR - Q4 Review                            |
|          Prep: ✅ Complete - [View Presentation] [Join Meeting]  |
|          Attendees: Sarah Chen (VP Talent), Mark Johnson (CTO)   |
|          Location: Zoom (link in calendar)                       |
|                                                                   |
| 12:00 PM 🍽️ Lunch Block (protected time)                        |
|                                                                   |
| 2:00 PM  👥 Weekly Recruiting Sync                              |
|          Accounts: TechCorp, RetailCo, FinanceHub, DataSystems   |
|          Attendees: Rec Team (Sarah, Mike, Priya)               |
|                                                                   |
| 4:00 PM  📄 Review RetailCo Expansion Proposal                   |
|          Prep: ⚠️ Draft needs final review                      |
|                                                                   |
| 5:00 PM  📝 End-of-day: Update CRM activity log                  |
+------------------------------------------------------------------+
```

**User Action:** Click "[Prepare Now]" for 9:30 AM call

**System Response:**
- Opens account brief document
- Shows payment history
- Displays recent invoices
- Suggests talking points

**Time:** 5 minutes

---

### 9:30 AM - Client Call: Payment Escalation (30 minutes)

#### Step 5: Join Call with TechCorp CFO

**User Action:** Click Zoom link in calendar

**Pre-Call Prep (from dashboard):**
```
+------------------------------------------------------------------+
| Call Brief: TechCorp - Payment Escalation                         |
+------------------------------------------------------------------+
| Contact: Michael Chen, CFO                                        |
| Issue: Invoice #INV-2024-0847 overdue 45 days ($85,420)         |
|                                                                   |
| BACKGROUND                                                        |
| • Typical payment: Net 30 (always on time historically)         |
| • This invoice: Due Sept 15, now Nov 30 (45 days late)          |
| • Finance team sent 3 reminders (no response)                   |
| • Account otherwise healthy (Green: 82/100)                     |
|                                                                   |
| TALKING POINTS                                                   |
| 1. Acknowledge relationship: "You've been a great partner..."    |
| 2. Express concern: "This is unusual for TechCorp..."           |
| 3. Ask open-ended: "Can you help me understand what's changed?" |
| 4. Listen for: Budget freeze? Dispute? Process issue?           |
| 5. Offer solutions: Payment plan? Invoice corrections?          |
|                                                                   |
| POTENTIAL OUTCOMES                                               |
| • Best case: Payment processed today (honest mistake)           |
| • Likely: Payment plan (2-3 installments)                       |
| • Worst case: Dispute or budget cuts (escalate to Director)    |
|                                                                   |
| AUTHORITY LIMITS                                                 |
| • Can approve: Payment plan up to 60 days                       |
| • Cannot approve: Rate reductions, invoice write-offs           |
+------------------------------------------------------------------+
```

**Call Notes (captured during call):**

**User Action:** During call, open Activity Log panel, click "Log Call"

**System Response:**
- Opens call log form
- Auto-fills: Contact, Account, Call time
- Provides note-taking template

**Screen State (during call):**
```
+------------------------------------------------------------------+
| Log Call Activity                             [Minimize] [×]     |
+------------------------------------------------------------------+
| Account: TechCorp                Contact: Michael Chen, CFO      |
| Call Type: ○ Scheduled ● Escalation ○ Check-in ○ Other          |
| Duration: [Auto-tracking: 12:34]                                 |
|                                                                   |
| NOTES                                                            |
| [                                                              ] |
| [Michael explained AP system upgrade caused delays.           ] |
| [Not a budget issue. Payment will be processed by EOD Friday. ] |
| [Apologized for lack of communication. Will CC me on future   ] |
| [payment confirmations.                                       ] |
| [                                                              ] |
|                                                                   |
| OUTCOME                                                          |
| ☑ Issue Resolved   ☐ Follow-up Required   ☐ Escalate Further   |
|                                                                   |
| NEXT ACTIONS                                                     |
| [+ Add Task]                                                     |
| ┌────────────────────────────────────────────────────────────┐  |
| │ ☐ Confirm payment received by Dec 4                        │  |
| │   Due: Friday, Dec 4, 5:00 PM                              │  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| SENTIMENT: 😊 Positive   😐 Neutral   ☹️ Negative               |
| Selected: 😊 Positive                                            |
|                                                                   |
| TAGS: [Payment] [Escalation] [Resolved]                         |
|                                                                   |
|                                         [Cancel]  [Save & Close] |
+------------------------------------------------------------------+
```

**User Action:** Click "[Save & Close]"

**System Response:**
- Activity logged in CRM
- Account health score updated (issue frequency improves)
- Task created: "Confirm payment received by Dec 4"
- Email summary auto-sent to Michael Chen (optional)

**Time:** 30 minutes (call + logging)

---

### 10:15 AM - Proactive Outreach: Check-ins (45 minutes)

#### Step 6: Respond to FinanceHub Email (New Q1 Hiring Needs)

**User Action:** Open email from FinanceHub contact

**Email Content:**
```
From: Lisa Martinez <lisa.martinez@financehub.com>
To: Account Manager <am@intime.com>
Subject: Q1 2025 Hiring Plans

Hi [Name],

Hope you're doing well! We're planning our Q1 budget and expecting to
open 8-10 contract roles in January (mix of Java developers, DevOps,
and Data Engineers). Can we schedule time to discuss capacity and
timelines?

Let me know your availability this week.

Thanks,
Lisa
```

**User Action:** Click InTime browser extension "Log to CRM"

**System Response:**
- Extracts email metadata
- Creates activity: "Email received - Q1 hiring plans"
- Suggests response template

**User Action:** Click "Smart Reply" in InTime extension

**System Response:**
- Generates response based on:
  - Account context (past hiring patterns)
  - Recruiter availability
  - Q1 capacity planning

**Generated Response:**
```
Hi Lisa,

Great to hear from you! Exciting to hear about your Q1 expansion plans.
8-10 roles is significant - I want to make sure we're fully prepared to
deliver quality candidates quickly.

I have availability this week:
• Wednesday, Dec 2: 2:00-3:00 PM or 4:00-5:00 PM
• Thursday, Dec 3: 10:00-11:00 AM or 3:00-4:00 PM

In the meantime, could you share:
1. Ideal start dates for these roles?
2. Any rate or budget parameters we should be aware of?
3. Priority order if all 10 roles won't open simultaneously?

Looking forward to partnering with you on a successful Q1!

Best regards,
[Name]
Account Manager, InTime
```

**User Action:** Review, adjust tone, send

**System Response:**
- Email sent
- Activity logged: "Email sent - Q1 planning meeting request"
- Task created: "Follow up if no response by Wed AM"

**Time:** 10 minutes

---

#### Step 7: Proactive Check-in with Yellow Account (GrowthStartup)

**User Action:** Filter dashboard to "Yellow" accounts, select "GrowthStartup"

**System Response:**
- Shows account at 68/100 (Yellow)
- Risk factor: Hiring velocity dropped 40% in last month

**User Action:** Click "Send Check-in Email"

**System Response:**
- Opens email template: "How Are We Doing?"

**Template:**
```
Subject: Quick Check-in - How Are We Doing?

Hi [Contact Name],

I hope this email finds you well! I noticed our hiring activity has
slowed down a bit this month, and I wanted to check in to see if
everything is on track.

A few questions to make sure we're aligned:
• Are we still meeting your expectations on quality and turnaround time?
• Have your hiring priorities shifted? Should we adjust our focus?
• Is there anything we could be doing differently to better support you?

Your feedback is incredibly valuable to us. If you have 15 minutes for
a quick call this week, I'd love to hear how things are going.

Thanks for being a great partner!

Best,
[Name]
```

**User Action:** Personalize and send

**System Response:**
- Email sent
- Activity logged
- Reminder set: "Follow up in 2 business days if no response"

**Time:** 8 minutes

---

#### Step 8: Review and Respond to Recruiter Escalation (RetailCo)

**User Action:** Click on RetailCo activity: "Recruiter escalation: Late submission"

**System Response:**
- Opens escalation detail

**Escalation Details:**
```
+------------------------------------------------------------------+
| Escalation #ESC-2024-1847                    Status: Open        |
+------------------------------------------------------------------+
| Account: RetailCo            Severity: P2 - Medium               |
| Created: Nov 29, 3:42 PM     Created by: Sarah Chen (Recruiter)  |
|                                                                   |
| DESCRIPTION                                                      |
| Client (RetailCo - Jennifer Wu, Hiring Manager) is frustrated    |
| that we've only submitted 2 candidates for "Senior UX Designer"  |
| role after 2 weeks. She expected 5-7 submissions by now.         |
|                                                                   |
| RECRUITER CONTEXT (from Sarah)                                   |
| • Role requirements very specific (Retail + Healthcare exp)      |
| • Rate is $75/hr (below market for this skill combo: ~$90/hr)   |
| • Only 3 qualified candidates found in 2 weeks of sourcing      |
| • 1 candidate declined due to rate                              |
| • 2 candidates submitted, both in client review                 |
|                                                                   |
| CLIENT EXPECTATION                                               |
| Jennifer mentioned in kickoff call she wanted "at least 5        |
| candidates in first 2 weeks" based on prior experience with     |
| another firm.                                                    |
|                                                                   |
| REQUESTED ACTION                                                 |
| Sarah requests AM to:                                            |
| 1. Manage client expectation on timeline/quantity               |
| 2. Discuss potential rate increase to attract better candidates |
| 3. Clarify if requirements can be relaxed (Healthcare OR Retail)|
+------------------------------------------------------------------+
```

**User Action:** Click "Take Ownership" button

**System Response:**
- Escalation status: "In Progress"
- AM assigned as owner
- Notification sent to Sarah (recruiter)

**User Action:** Click "View Job Details"

**System Response:**
- Opens job record
- Shows original requirements
- Displays submission history

**User Action:** Click "Draft Client Email"

**System Response:**
- Opens email composer with context

**Draft Email:**
```
Subject: Senior UX Designer Role - Update & Discussion

Hi Jennifer,

Thank you for your patience on the Senior UX Designer search. I wanted
to give you an update and discuss how we can best meet your needs.

CURRENT STATUS:
• 2 strong candidates submitted (both in your review)
• Both have the Retail + Healthcare background you specified
• Actively sourcing additional candidates

MARKET INSIGHTS:
Our team has reached out to 47 professionals in the past 2 weeks. The
combination of Retail AND Healthcare UX experience at the $75/hr rate
is quite specific. Here's what we're seeing:

• Candidates with both backgrounds: Rare (market rate: $85-95/hr)
• Candidates with Retail OR Healthcare: More available at $75/hr

OPTIONS TO ACCELERATE:
1. Adjust rate to $85-90/hr (attracts top-tier candidates immediately)
2. Relax requirement to Retail OR Healthcare (expands candidate pool 5x)
3. Continue current approach (may take 3-4 weeks for 5 submissions)

I'd love to discuss which approach works best for RetailCo's timeline
and budget. Are you available for a quick call tomorrow or Wednesday?

Best regards,
[Name]
```

**User Action:** Review, send email

**System Response:**
- Email sent
- Activity logged on account
- Escalation updated: "Waiting for client response"
- Recruiter (Sarah) notified of action taken

**Time:** 15 minutes

---

### 11:00 AM - Quarterly Business Review (QBR): MegaBank (90 minutes)

#### Step 9: Conduct QBR Presentation

**Preparation (completed yesterday):**
- QBR deck created using InTime template
- Metrics pulled from system automatically
- Success stories documented
- Action items from last QBR reviewed

**User Action:** Join Zoom meeting, share screen with QBR presentation

**QBR Presentation Structure:**
```
+------------------------------------------------------------------+
|                    MegaBank Quarterly Business Review            |
|                           Q4 2024                                |
|                                                                   |
|                    Presented by: [Account Manager]               |
|                    Date: November 30, 2024                       |
+------------------------------------------------------------------+

[SLIDE 1: Executive Summary]
+------------------------------------------------------------------+
| Q4 2024 PERFORMANCE HIGHLIGHTS                                   |
|                                                                   |
| ✅ 18 successful placements (Target: 15)  - 120% attainment      |
| ✅ 94% offer acceptance rate               - Above target (90%)   |
| ✅ 12-day average time-to-fill             - 3 days faster than Q3|
| ✅ NPS Score: 9/10                         - Promoter status      |
|                                                                   |
| 📈 GROWTH                                                        |
| • Q4 Revenue: $847K (↑18% vs Q3)                                |
| • New divisions added: 2 (Marketing, Legal)                     |
| • Active roles: 23 (↑35% vs Q3)                                 |
+------------------------------------------------------------------+

[SLIDE 2: Placement Breakdown]
+------------------------------------------------------------------+
| PLACEMENTS BY DEPARTMENT (Q4)                                    |
|                                                                   |
| Engineering:           12  ████████████████████████░░░░          |
| Marketing:              3  ██████░░░░░░░░░░░░░░░░░░░░░░          |
| Legal:                  2  ████░░░░░░░░░░░░░░░░░░░░░░░░          |
| Finance:                1  ██░░░░░░░░░░░░░░░░░░░░░░░░░░          |
|                                                                   |
| BY ROLE TYPE                                                     |
| Contract (6mo+):       14  ████████████████████████████░░        |
| Contract-to-Hire:       4  ████████░░░░░░░░░░░░░░░░░░░░          |
|                                                                   |
| DIVERSITY METRICS                                                |
| • Women: 39% (7 of 18)                                          |
| • Underrepresented minorities: 28% (5 of 18)                    |
+------------------------------------------------------------------+

[SLIDE 3: Quality Metrics]
+------------------------------------------------------------------+
| QUALITY & EFFICIENCY                                             |
|                                                                   |
| Metric                    Q4 2024   Q3 2024   Target   Status    |
| ─────────────────────────────────────────────────────────────   |
| Time-to-Fill (avg)         12 days   15 days   14 days   ✅     |
| Submissions-to-Hire        3.2:1     4.1:1     3.5:1     ✅     |
| Offer Acceptance Rate      94%       88%       90%       ✅     |
| First-year Retention       96%       92%       95%       ✅     |
| Client Satisfaction (NPS)  9/10      8/10      8/10      ✅     |
+------------------------------------------------------------------+

[SLIDE 4: Success Stories]
+------------------------------------------------------------------+
| SPOTLIGHT: Principal Engineer Placement                          |
|                                                                   |
| Challenge: Niche requirement (Blockchain + RegTech expertise)    |
| Timeline: Needed to start within 3 weeks                         |
| Market: Only ~50 qualified candidates nationwide                 |
|                                                                   |
| Our Approach:                                                    |
| • Leveraged specialized tech network                            |
| • Identified passive candidate at competitor                    |
| • Coordinated expedited interview process (5 days)              |
| • Negotiated candidate relocation from Austin                   |
|                                                                   |
| Result:                                                          |
| ✅ Candidate started on target date                             |
| ✅ Hiring manager quote: "Exceeded expectations in first month"  |
| ✅ Led to 3 additional role requests in same team               |
+------------------------------------------------------------------+

[SLIDE 5: Challenges & Resolutions]
+------------------------------------------------------------------+
| CHALLENGES ADDRESSED THIS QUARTER                                |
|                                                                   |
| Issue: UX Designer role - low candidate flow                     |
| Root Cause: Rate below market for required experience level      |
| Resolution: Rate increased from $75 to $85/hr                    |
| Outcome: 4 qualified candidates submitted within 1 week          |
|                                                                   |
| Issue: Slow interview process (avg 18 days)                      |
| Root Cause: Scheduling conflicts with panel interviewers         |
| Resolution: Introduced streamlined 2-stage process               |
| Outcome: Interview-to-decision time reduced to 9 days            |
+------------------------------------------------------------------+

[SLIDE 6: Q1 2025 Strategic Initiatives]
+------------------------------------------------------------------+
| PROPOSED INITIATIVES FOR Q1                                      |
|                                                                   |
| 1. EXPAND TO DATA SCIENCE TEAM                                   |
|    • New VP of Data hired - expects 5-7 roles in Jan-Feb        |
|    • Opportunity: $200-300K additional quarterly revenue        |
|    • Requires: 1 dedicated recruiter with DS/ML expertise       |
|    [Decision needed: Approve expansion]                          |
|                                                                   |
| 2. DIVERSITY HIRING PARTNERSHIP                                  |
|    • Goal: Increase underrepresented talent to 40%              |
|    • Approach: Partner with NSBE, AnitaB.org, Code2040          |
|    • Timeline: Launch Jan 15                                     |
|    [Decision needed: Budget approval for org partnerships]       |
|                                                                   |
| 3. QUARTERLY TALENT MARKET BRIEFINGS                             |
|    • Provide hiring managers with market insights               |
|    • Topics: Salary trends, skill availability, competition     |
|    • Format: 30-min webinar, monthly                            |
|    [Decision needed: Stakeholder interest]                       |
+------------------------------------------------------------------+

[SLIDE 7: Account Metrics & Health]
+------------------------------------------------------------------+
| ACCOUNT HEALTH SCORECARD                                         |
|                                                                   |
| Overall Health: GREEN (94/100) 🟢                                |
|                                                                   |
| Hiring Velocity:       25/25  ████████████████████████████████  |
| Payment Promptness:    20/20  ████████████████████████████████  |
| NPS/Satisfaction:      18/20  ██████████████████████████████░░  |
| Executive Engagement:  15/15  ████████████████████████████████  |
| Expansion Pipeline:    10/10  ████████████████████████████████  |
| Issue Frequency:        6/10  ████████████░░░░░░░░░░░░░░░░░░░  |
|                                                                   |
| Note: Issue frequency reflects 4 minor escalations (all resolved)|
| Proactive improvement: Implemented tighter QA process in Nov     |
+------------------------------------------------------------------+

[SLIDE 8: Q&A and Action Items]
+------------------------------------------------------------------+
| DISCUSSION TOPICS                                                |
|                                                                   |
| 1. Q1 hiring forecast - confirm projected volumes                |
| 2. Data Science expansion - timeline and requirements            |
| 3. Diversity partnership budget allocation                       |
| 4. Any concerns or feedback on current service delivery          |
|                                                                   |
| ACTION ITEMS (Documented)                                        |
| ┌────────────────────────────────────────────────────────────┐  |
| │ [ ] MegaBank (Sarah): Confirm Q1 hiring projections by Dec 7 │  |
| │ [ ] InTime (AM): Send DS recruiter profiles for review by Dec 9│|
| │ [ ] MegaBank (Sarah): Approve diversity partnership budget    │  |
| │ [ ] InTime (AM): Schedule Jan 15 market briefing webinar     │  |
| │ [ ] Both: Next QBR scheduled for March 1, 2025              │  |
| └────────────────────────────────────────────────────────────┘  |
+------------------------------------------------------------------+
```

**During Meeting - Real-Time Notes:**

**User Action:** Use InTime mobile app or second screen to capture notes

**System Response:**
- Meeting notes template auto-loaded
- Action items tracked in real-time

**Post-Meeting Actions:**

**User Action:** Click "Finalize QBR" in dashboard

**System Response:**
- Prompts to confirm action items
- Assigns tasks to relevant team members
- Sends summary email to attendees
- Updates account health score (if applicable)
- Schedules next QBR (90 days out)

**Generated Follow-up Email:**
```
Subject: MegaBank Q4 QBR - Summary & Action Items

Hi Sarah and Mark,

Thank you for a productive Q4 Business Review today! It was great to
celebrate our successes together and plan for an exciting Q1.

KEY HIGHLIGHTS:
✅ 18 placements (120% of target)
✅ 94% offer acceptance rate
✅ 12-day average time-to-fill (3 days faster than Q3)
✅ NPS: 9/10 - Thank you for your trust!

ACTION ITEMS:
□ MegaBank (Sarah): Confirm Q1 hiring projections - Due: Dec 7
□ InTime (Us): Send Data Science recruiter profiles - Due: Dec 9
□ MegaBank (Sarah): Approve diversity partnership budget
□ InTime (Us): Schedule Jan 15 market briefing webinar

NEXT QBR: March 1, 2025 (calendar invite sent separately)

Please let me know if I missed anything or if you have questions!

Best regards,
[Name]

[Attachment: MegaBank_Q4_QBR_Presentation.pdf]
```

**System Response:**
- Email sent
- QBR marked complete in CRM
- Account activity updated
- Tasks created and assigned

**Time:** 90 minutes (60 min meeting + 30 min follow-up)

---

### 12:30 PM - Lunch Break (30 minutes)

**User Action:** Mark calendar as "Out to Lunch"

**System Response:**
- Status updated in InTime
- Email auto-responder: "Away, will respond by 2:00 PM"
- Urgent notifications still delivered to mobile

**Time:** 30 minutes

---

### 1:00 PM - Administrative Tasks (60 minutes)

#### Step 10: Update CRM - Log Morning Activities

**User Action:** Navigate to "My Activities" dashboard

**System Response:**
- Shows unlogged activities (detected from email, calendar)
- Prompts to add context/notes

**Screen State:**
```
+------------------------------------------------------------------+
| Activity Log - Pending Review                                     |
+------------------------------------------------------------------+
| SUGGESTED ACTIVITIES (Auto-detected)                             |
| ┌────────────────────────────────────────────────────────────┐  |
| │ ✓ Call with TechCorp CFO (9:30-10:00 AM)                   │  |
| │   Status: Logged   Notes: ✅ Complete                       │  |
| ├────────────────────────────────────────────────────────────┤  |
| │ ⚠️ Email sent to FinanceHub (10:15 AM)                     │  |
| │   Status: Auto-logged   [Review & Confirm]                 │  |
| ├────────────────────────────────────────────────────────────┤  |
| │ ⚠️ Email sent to GrowthStartup (10:23 AM)                  │  |
| │   Status: Auto-logged   [Review & Confirm]                 │  |
| ├────────────────────────────────────────────────────────────┤  |
| │ ✓ MegaBank QBR (11:00 AM - 12:00 PM)                       │  |
| │   Status: Logged   Notes: ✅ Complete   Action Items: 4    │  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| MISSING ACTIVITIES (No detection)                                |
| Did you have any client interactions not captured above?         |
| [+ Log Call] [+ Log Email] [+ Log Meeting] [+ Log Note]         |
+------------------------------------------------------------------+
```

**User Action:** Click "[Review & Confirm]" for auto-logged emails

**System Response:**
- Shows email content
- Asks for sentiment/outcome tags
- Confirms logging

**Time:** 15 minutes

---

#### Step 11: Review Expansion Pipeline

**User Action:** Navigate to "Expansion Opportunities" dashboard

**System Response:**
- Shows all active expansion deals in pipeline
- Organized by stage: Identified → Qualified → Proposal → Negotiation

**Screen State:**
```
+------------------------------------------------------------------+
| Expansion Pipeline                        Total Value: $1.2M     |
+------------------------------------------------------------------+
| Stage: Identified (4)                                   $420K    |
| ┌────────────────────────────────────────────────────────────┐  |
| │ RetailCo - Marketing Department                    $150K    │  |
| │ Source: Mentioned in last call   Next: Send proposal       │  |
| │                                        [View] [Move Forward]│  |
| ├────────────────────────────────────────────────────────────┤  |
| │ HealthTech - New Austin Office                     $200K    │  |
| │ Source: LinkedIn news (office opening)  Next: Email contact│  |
| │                                        [View] [Move Forward]│  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| Stage: Qualified (2)                                    $380K    |
| ┌────────────────────────────────────────────────────────────┐  |
| │ InsureCo - Data Science Team                       $250K    │  |
| │ Champion: CTO (confirmed need)   Next: Draft SOW           │  |
| │                                        [View] [Move Forward]│  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| Stage: Proposal (1)                                     $300K    |
| ┌────────────────────────────────────────────────────────────┐  |
| │ TechCorp - DevOps Expansion                        $300K    │  |
| │ Proposal sent: Nov 25   Follow-up: Due Dec 2               │  |
| │                              [View Proposal] [Follow Up Now]│  |
| └────────────────────────────────────────────────────────────┘  |
|                                                                   |
| Stage: Negotiation (1)                                  $180K    |
| ┌────────────────────────────────────────────────────────────┐  |
| │ MegaBank - Data Science (from QBR today!)          $180K    │  |
| │ Status: Verbal approval   Next: Formal contract            │  |
| │                                        [View] [Move Forward]│  |
| └────────────────────────────────────────────────────────────┘  |
+------------------------------------------------------------------+
```

**User Action:** Click on "RetailCo - Marketing Department"

**System Response:**
- Opens expansion opportunity detail
- Shows discovery notes
- Provides proposal template

**User Action:** Click "Move to Qualified" → "Draft Proposal"

**System Response:**
- Opens proposal generator
- Pre-fills with account data (rates, terms, contacts)
- Suggests scope based on typical marketing roles

**User Action:** Customize proposal, click "Save Draft"

**System Response:**
- Proposal saved
- Task created: "Finalize and send RetailCo expansion proposal"
- Reminder set for 4:00 PM (per calendar)

**Time:** 25 minutes

---

#### Step 12: Prepare for 2:00 PM Recruiting Sync

**User Action:** Navigate to "Team Sync Prep" tool

**System Response:**
- Pulls data for accounts being discussed
- Shows recruiter performance metrics
- Highlights issues needing discussion

**Prep Summary:**
```
+------------------------------------------------------------------+
| Weekly Recruiting Sync - Prep Sheet                              |
| Date: Nov 30, 2:00 PM   Attendees: Sarah, Mike, Priya (Recruiters)|
+------------------------------------------------------------------+
| ACCOUNTS TO DISCUSS (5)                                          |
|                                                                   |
| 1. TechCorp (Sarah's account)                                    |
|    • Payment issue: RESOLVED ✅ (discussed this morning)         |
|    • Active roles: 7 (3 critical priority)                      |
|    • Feedback: Share positive CFO call outcome with Sarah       |
|                                                                   |
| 2. RetailCo (Sarah's account)                                    |
|    • Escalation: UX Designer role (rate/requirements issue)     |
|    • Status: Awaiting client response on options               |
|    • Action: Brief Sarah on email sent, await client decision   |
|                                                                   |
| 3. FinanceHub (Mike's account)                                   |
|    • New opportunity: 8-10 Q1 roles incoming                    |
|    • Action: Confirm Mike has capacity; may need support        |
|    • Client call scheduled: Dec 2 or 3 (AM will attend)        |
|                                                                   |
| 4. DataSystems (Priya's account) ⚠️                             |
|    • Health: RED (42/100) - no hiring in 60 days                |
|    • Client outreach: Emergency call scheduled for tomorrow     |
|    • Action: Discuss with Priya - any intel on client changes?  |
|    • Review past escalations for patterns                       |
|                                                                   |
| 5. MegaBank (Mike's account)                                     |
|    • QBR completed today - EXCELLENT results                    |
|    • Q1 expansion: Data Science team (5-7 roles)                |
|    • Action: Mike to take lead on DS roles (his specialty)      |
|    • Share QBR slides with recruiting team for visibility       |
+------------------------------------------------------------------+
```

**Time:** 20 minutes

---

### 2:00 PM - Weekly Recruiting Team Sync (60 minutes)

#### Step 13: Conduct Team Sync Meeting

**User Action:** Join team meeting (Zoom or conference room)

**Meeting Agenda:**
```
1. Wins of the Week (5 min)
   - Celebrate placements, offer acceptances

2. Account-by-Account Review (40 min)
   - TechCorp (10 min)
   - RetailCo (10 min)
   - FinanceHub (5 min)
   - DataSystems (10 min)
   - MegaBank (5 min)

3. Escalations & Blockers (10 min)
   - Any recruiter concerns
   - Process improvements needed

4. Next Week Preview (5 min)
   - Upcoming client meetings
   - Deadlines and priorities
```

**Key Discussion Points:**

**TechCorp (Sarah):**
- AM shares: Payment issue resolved, CFO apologized
- Sarah updates: 2 critical roles close to offer stage
- Action: Continue current approach, strong momentum

**RetailCo (Sarah):**
- AM shares: Email sent with 3 options (rate increase, relax requirements, or wait)
- Sarah provides: Market data supporting $85-90/hr recommendation
- Action: Wait for client response (expected tomorrow)
- Contingency: If client chooses Option 3 (wait), set expectation for 3-4 week timeline

**FinanceHub (Mike):**
- AM shares: 8-10 Q1 roles incoming, client call scheduled Dec 2-3
- Mike assesses: Can handle 5-6 roles, will need support for remaining
- Action: AM to attend client call with Mike, discuss phased rollout
- Contingency: Priya available to support 2-3 overflow roles

**DataSystems (Priya):**
- AM shares: Account health RED, emergency call scheduled tomorrow
- Priya provides context: Client mentioned "budget review" in last conversation (3 weeks ago)
- AM asks: Any quality issues or concerns from client?
- Priya confirms: No quality complaints, client seemed satisfied with placements
- Hypothesis: Likely internal budget freeze or hiring pause
- Action: AM to investigate on tomorrow's call, may need to put account in "maintenance mode"

**MegaBank (Mike):**
- AM shares: Fantastic QBR results, client thrilled with Q4 performance
- Opportunity: 5-7 Data Science roles in Q1 (Mike's specialty)
- Mike excited: Confirms bandwidth and expertise for DS hiring
- Action: AM to send Mike client contact info, schedule intro call
- Mike to send AM sample DS recruiter profiles for client review

**Escalations & Blockers:**
- Priya raises: Difficulty getting interview feedback from clients within SLA (48 hours)
- Discussion: Is this systemic or specific accounts?
- Resolution: AM to add "interview feedback turnaround" as QBR topic for Q1 reviews
- Immediate action: AM to send reminder email to slow-responding accounts

**Time:** 60 minutes

---

### 3:15 PM - Client Issue Resolution (30 minutes)

#### Step 14: Handle Urgent Client Request

**User Action:** Check email, see urgent request from HealthTech

**Email:**
```
From: David Lee <david.lee@healthtech.com>
To: Account Manager <am@intime.com>
Subject: URGENT - Contractor No-Show Today

[Name],

We have a serious issue. Our contractor John Smith (Developer) was
supposed to start his assignment today and never showed up. We can't
reach him by phone or email. This is a critical role and the team is
blocked.

Can you please investigate immediately? We need to know what's going on
and what our options are.

David
```

**User Action:** Click "Create Escalation" in InTime extension

**System Response:**
- Opens escalation form
- Pre-fills account, contact, severity (auto-detected as P1 based on "URGENT" keyword)

**User Action:** Fill in details, assign to self, click "Create & Notify"

**System Response:**
- Escalation created: ESC-2024-1848
- Notifications sent to:
  - Recruiter who placed John Smith
  - Recruiting Manager
  - AM (self)
- Timer started: P1 response SLA = 4 hours

**User Action:** Call contractor John Smith (mobile)

**Outcome:** Voicemail full, cannot leave message

**User Action:** Call recruiter (Jennifer) who placed John

**Outcome:** Jennifer answers, she also tried reaching John (no response)

**User Action:** Check contractor HR system for emergency contact

**Outcome:** Emergency contact on file (spouse)

**User Action:** Call emergency contact

**Outcome:** Spouse answers - John was in a car accident this morning (minor injuries, but in hospital for evaluation). John's phone was damaged in accident. Spouse was unaware John was supposed to start today.

**User Action:** Call client (David) immediately

**Conversation Summary:**
- Explain situation: Contractor had medical emergency (car accident)
- John is okay, but unable to work today (possibly tomorrow)
- Apologize for lack of communication (unavoidable circumstances)
- Offer solutions:
  1. John can start tomorrow or Wednesday (pending recovery)
  2. Find backup contractor if critical (may take 2-3 days)
  3. Adjust start date to next week

**Client Decision:** Wait for John to recover, start Wednesday if cleared by doctor

**User Action:** Log entire incident in escalation record

**User Action:** Update escalation status to "Resolved - External Circumstances"

**System Response:**
- Escalation closed
- Resolution time: 28 minutes (well within 4-hour SLA)
- Activity logged on account
- Contractor record updated with note

**User Action:** Send follow-up email to client and contractor

**Follow-up Email (Client):**
```
Subject: Re: URGENT - Contractor No-Show Today - RESOLVED

Hi David,

Thank you for your patience. I wanted to provide a full update.

SITUATION:
John was involved in a car accident this morning on his way to your
office. He sustained minor injuries and is currently at the hospital
for evaluation. His phone was damaged in the accident, which is why we
couldn't reach him.

RESOLUTION:
• John is expected to be released later today
• He will confirm availability by tomorrow morning
• Tentative start date: Wednesday, Dec 2 (pending doctor clearance)
• If John is unable to start Wed, we will discuss backup options

I've been in touch with John's emergency contact and will keep you
updated. I sincerely apologize for the stress this caused your team.

Please let me know if you'd like to discuss contingency plans.

Best regards,
[Name]
```

**Follow-up Email (Contractor):**
```
Subject: Checking In - Hope You're Okay

Hi John,

I spoke with [spouse name] today about your accident. I'm so glad to
hear you're okay!

Please focus on your recovery and don't worry about work. When you're
feeling better and have a new phone, please let me know your status.

I've updated HealthTech that you'll tentatively start Wednesday, pending
doctor clearance. No pressure - your health comes first.

Wishing you a speedy recovery,
[Name]
```

**Time:** 30 minutes

---

### 4:00 PM - Strategic Work: Proposal Review (45 minutes)

#### Step 15: Finalize RetailCo Expansion Proposal

**User Action:** Navigate to expansion pipeline, open RetailCo proposal draft

**System Response:**
- Opens proposal document (created earlier at 1:25 PM)
- Shows editable template

**Proposal Structure:**
```
+------------------------------------------------------------------+
|            EXPANSION PROPOSAL                                     |
|            RetailCo - Marketing Department Staffing               |
+------------------------------------------------------------------+

EXECUTIVE SUMMARY

RetailCo has experienced tremendous success with InTime for IT staffing
over the past 18 months. This proposal outlines an expansion opportunity
to support your Marketing Department with contract creative and digital
marketing talent.

PROPOSED SCOPE

Departments: Marketing, Digital Marketing, Creative Services
Estimated Roles: 6-8 contractors over next 6 months
Role Types:
  • Graphic Designers (2-3)
  • Digital Marketing Specialists (2-3)
  • Content Writers (1-2)
  • Social Media Manager (1)

COMMERCIAL TERMS

Rate Structure (based on existing MSA):
  • Graphic Designer: $65-75/hr
  • Digital Marketing Specialist: $70-85/hr
  • Content Writer: $55-70/hr
  • Social Media Manager: $75-90/hr

Payment Terms: Net 30 (existing terms maintained)
Contract Type: W2 contractors via InTime

PROJECTED VALUE

Conservative Estimate (6 roles, 6-month average duration):
  • Total Contract Value: $150,000

Optimistic Estimate (8 roles, 9-month average duration):
  • Total Contract Value: $225,000

IMPLEMENTATION TIMELINE

Week 1: Contract amendment signed, kickoff meeting scheduled
Week 2: Recruiter assigned (Marketing staffing specialist)
Week 3: First job requisitions opened
Week 4-6: Candidate submissions begin

TEAM & EXPERTISE

Proposed Recruiter: Amanda Torres
  • 7 years marketing/creative staffing experience
  • Specialty: Digital marketing and creative roles
  • Network: 2,500+ marketing professionals
  • Recent placements: 12 marketing roles in Q3-Q4 2024

Account Manager: [Your Name] (continuity)

VALUE PROPOSITION

✅ Leverage existing successful partnership
✅ Consistent quality and vetting process
✅ Single vendor for IT + Marketing (simplified invoicing)
✅ Cross-functional coordination (e.g., Marketing + IT projects)
✅ Preferred rates based on volume commitment

NEXT STEPS

1. Review and feedback on proposal (by Dec 7)
2. Schedule kickoff meeting with Marketing leadership
3. Execute contract amendment (1-week legal review)
4. Begin recruiting (target: first submission within 2 weeks)

QUESTIONS?

Please contact:
[Account Manager Name]
Email: [email]
Phone: [phone]

We're excited about the opportunity to expand our partnership!
+------------------------------------------------------------------+
```

**User Action:** Review proposal, make final edits

**Edits Made:**
- Adjust rate ranges based on recent market data
- Add case study from similar client (with permission)
- Personalize introduction referencing recent conversation

**User Action:** Click "Request Review" (internal approval)

**System Response:**
- Sends proposal to Sales Director for review
- Notification sent to AM when approved (estimated: 24 hours)

**User Action:** Click "Save Final Draft"

**System Response:**
- Proposal saved
- Task updated: "Awaiting internal approval - Send to client by Dec 2"

**Time:** 45 minutes

---

### 5:00 PM - End-of-Day Wrap-Up (30 minutes)

#### Step 16: Review Task Completion

**User Action:** Navigate to "My Tasks" dashboard

**System Response:**
- Shows today's task list with completion status

**Screen State:**
```
+------------------------------------------------------------------+
| Today's Tasks                                  Completed: 4 of 5  |
+------------------------------------------------------------------+
| ☑ 9:30 AM - Call with TechCorp CFO (payment escalation)         |
|   Status: ✅ Completed - Issue resolved                         |
|                                                                   |
| ☑ 11:00 AM - QBR presentation for MegaBank                      |
|   Status: ✅ Completed - Action items created                   |
|                                                                   |
| ☑ 2:00 PM - Weekly sync with recruiting team                    |
|   Status: ✅ Completed - Notes logged                           |
|                                                                   |
| ☑ 4:00 PM - Review expansion proposal for RetailCo              |
|   Status: ✅ Completed - Awaiting approval                      |
|                                                                   |
| ☐ EOD - Log all client interactions in CRM                      |
|   Status: ⚠️ Pending - 2 activities need review                |
|                                                                   |
+------------------------------------------------------------------+
| TOMORROW'S PRIORITIES (Auto-generated)                           |
| ☐ 10:00 AM - Emergency call with DataSystems (RED account)      |
| ☐ 11:00 AM - Follow up with RetailCo on UX Designer options     |
| ☐ 2:00 PM - Meeting with FinanceHub (Q1 hiring plans)          |
| ☐ EOD - Confirm TechCorp payment received (due Friday)          |
+------------------------------------------------------------------+
```

**User Action:** Click "Review Pending Activities"

**System Response:**
- Shows 2 unlogged activities
  1. HealthTech escalation (contractor no-show)
  2. Calls to contractor and client

**User Action:** Confirm and finalize activity logs

**System Response:**
- Activities logged
- All tasks marked complete

**Time:** 10 minutes

---

#### Step 17: Set Up Tomorrow's Priorities

**User Action:** Review tomorrow's calendar and create prep tasks

**System Response:**
- Shows tomorrow's schedule
- Suggests prep tasks based on meetings

**User Action:** Add notes to 10:00 AM DataSystems call

**Note:**
```
PREP FOR DATASYSTEMS CALL (RED Account - Emergency)

Objectives:
1. Understand why hiring stopped (budget freeze? Satisfied with team?)
2. Assess satisfaction with InTime service quality
3. Identify any unresolved issues or concerns
4. Determine if relationship is salvageable or if churn is inevitable

Questions to Ask:
- "How is your team doing? Are the contractors we placed performing well?"
- "I noticed hiring has slowed down. Can you help me understand what's changed?"
- "Is there anything we could be doing differently?"
- "What are your plans for Q1 2025?"

Possible Outcomes:
✅ Best case: Temporary hiring freeze, relationship strong, will resume in Q1
⚠️ Neutral: Business changes, reduced need for contractors (graceful downgrade to lower tier)
🔴 Worst case: Dissatisfaction, planning to switch vendors (damage control, exit interview)
```

**Time:** 10 minutes

---

#### Step 18: Send End-of-Day Summary Email (Optional)

**User Action:** Click "Generate Daily Summary" (if team uses this feature)

**System Response:**
- Creates summary of today's activities
- Sends to manager and relevant team members

**Daily Summary Email:**
```
Subject: AM Daily Summary - Nov 30, 2024

ACCOUNTS ENGAGED TODAY: 8

HIGH-PRIORITY ACTIONS:
✅ TechCorp payment escalation RESOLVED ($85K payment confirmed by Friday)
✅ MegaBank QBR completed - Excellent results (NPS 9/10)
✅ HealthTech contractor emergency handled (car accident, resolved in 28 min)

EXPANSION PIPELINE:
• RetailCo Marketing proposal finalized (awaiting approval) - $150K value
• MegaBank Data Science expansion confirmed (from QBR) - $180K value

RISKS & ESCALATIONS:
🔴 DataSystems - Health RED (42/100), emergency call scheduled tomorrow 10 AM
⚠️ RetailCo - UX Designer role escalation (awaiting client response on rate/scope)

RECRUITING TEAM SYNC COMPLETED:
- 5 accounts reviewed
- FinanceHub: 8-10 Q1 roles incoming (meeting scheduled Dec 2-3)
- MegaBank: Mike to lead Data Science expansion

TOMORROW'S PRIORITIES:
1. DataSystems emergency call (10 AM) - Critical
2. RetailCo follow-up (rate decision expected)
3. FinanceHub Q1 planning meeting (with Mike)

---
Logged Activities: 12
Calls: 4
Emails: 8
Meetings: 3
Escalations Resolved: 1 (HealthTech contractor no-show)
```

**Time:** 5 minutes

---

#### Step 19: Final Review and Sign-Off

**User Action:** Review dashboard one last time for any missed alerts

**System Response:**
- Shows "All clear" if no urgent items
- Or highlights any new notifications received during day

**User Action:** Mark self as "Offline" in InTime

**System Response:**
- Status updated
- Out-of-office auto-responder enabled (if after-hours)
- Mobile app still receives urgent P0/P1 notifications

**Time:** 5 minutes

---

## Postconditions

1. ✅ All client interactions logged in CRM
2. ✅ All urgent escalations addressed (within SLA)
3. ✅ Tomorrow's meetings prepped and ready
4. ✅ Team sync completed, recruiters aligned
5. ✅ QBR completed with action items tracked
6. ✅ Expansion pipeline updated
7. ✅ Account health scores current
8. ✅ No outstanding P0/P1 escalations

---

## Metrics Tracked (Daily)

| Metric | Today's Performance |
|--------|-------------------|
| Client touchpoints | 12 (Target: 8-10) |
| Response time (avg) | 2.3 hours (Target: <4 hours) |
| Escalations resolved | 1 of 1 (100%) |
| QBRs completed | 1 of 1 (100%) |
| CRM hygiene | 100% (all activities logged) |
| Red account actions | 1 of 2 (50% - DataSystems scheduled for tomorrow) |
| Expansion value added | $330K (RetailCo + MegaBank) |

---

## Variations by Day of Week

### Monday (Planning Day)
- Review weekend activity
- Set weekly priorities
- Schedule client check-ins for week

### Tuesday-Thursday (Execution Days)
- Most client meetings and QBRs
- Recruiting team syncs
- Expansion proposal development

### Friday (Wrap-Up Day)
- Week-in-review
- Update forecasts
- Prep for next week
- Follow-up on outstanding items

---

## Common Interruptions & Handling

| Interruption | Response Strategy |
|-------------|------------------|
| Urgent client call (unscheduled) | Take call if during business hours, reschedule lower-priority task |
| Escalation notification (P0) | Drop everything, respond within 1 hour |
| Escalation notification (P1) | Acknowledge within 1 hour, resolve within 4 hours |
| Recruiter needs guidance | Quick Slack response if simple, schedule 15-min call if complex |
| Sales handoff (new account) | Schedule proper handoff meeting, don't rush onboarding |

---

## Tools Used Throughout Day

| Tool | Usage Frequency | Purpose |
|------|----------------|---------|
| InTime CRM | Constant | Account management, activity logging |
| Email (Gmail/Outlook) | Every 1-2 hours | Client communication |
| Slack | Every 30 minutes | Internal team coordination |
| Zoom | 2-3 times/day | Client meetings, QBRs |
| Calendar | Constant | Scheduling, time blocking |
| Google Docs/Sheets | 2-3 times/day | Proposals, reports, analysis |

---

## Energy Management Tips

**High-Energy Tasks (Morning):**
- Urgent escalations
- QBR presentations
- Strategic planning

**Medium-Energy Tasks (Afternoon):**
- Team syncs
- Routine check-ins
- Email responses

**Low-Energy Tasks (End of Day):**
- CRM logging
- Reading reports
- Task organization

---

## Related Use Cases

- [02-manage-account.md](./02-manage-account.md) - Account 360 view details
- [03-client-meeting.md](./03-client-meeting.md) - QBR deep dive
- [04-expand-account.md](./04-expand-account.md) - Expansion process
- [05-handle-issue.md](./05-handle-issue.md) - Escalation management

---

*Last Updated: 2025-11-30*
