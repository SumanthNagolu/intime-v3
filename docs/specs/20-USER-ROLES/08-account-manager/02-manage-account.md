# Use Case: Manage Client Account

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-AM-002 |
| Actor | Account Manager |
| Goal | View and manage comprehensive client account information (360-degree view) |
| Frequency | 5-10 times per day |
| Estimated Time | 5-15 minutes per account review |
| Priority | High |

---

## Preconditions

1. User is logged in as Account Manager
2. User has at least one assigned account in portfolio
3. Account exists in system with basic data populated

---

## Trigger

One of the following:
- Preparing for client meeting
- Responding to client request
- Reviewing account health alert
- Weekly account review routine
- Pre-QBR preparation
- Investigating escalation

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Account

**User Action:** Click "Accounts" in sidebar navigation

**System Response:**
- Sidebar highlights "Accounts"
- URL changes to: `/employee/workspace/accounts`
- Accounts list screen loads (200-500ms)
- Shows all assigned accounts in table view

**Screen State:**
```
+------------------------------------------------------------------+
| Accounts                              [+ New Account] [⚙] [Cmd+K] |
+------------------------------------------------------------------+
| [Search accounts...]                    [Filter ▼] [Sort ▼]      |
+------------------------------------------------------------------+
| Health: [All] [Green] [Yellow] [Red]   Tier: [All] [T1] [T2] [T3]|
+------------------------------------------------------------------+
| Account Name          Tier  Health  ARR      Jobs  Last Touch    |
| ──────────────────────────────────────────────────────────────── |
| MegaBank              T1    🟢 94   $847K    23    Today (QBR)   |
| TechCorp              T1    🟢 82   $620K    7     Today (Call)  |
| FinanceHub            T2    🟢 88   $340K    4     2 hours ago   |
| RetailCo              T2    🟡 68   $280K    3     5 hours ago   |
| DataSystems Inc.      T2    🔴 42   $280K    0     18 days ago   |
| HealthTech Solutions  T2    🟢 91   $220K    8     Yesterday     |
| InsureCo              T3    🟢 76   $125K    2     3 days ago    |
| GrowthStartup         T3    🟡 68   $95K     1     1 week ago    |
+------------------------------------------------------------------+
| Showing 8 of 42 accounts   [Load More]                           |
+------------------------------------------------------------------+
```

**Time:** 2 seconds

---

### Step 2: Select Account to View

**User Action:** Click on "TechCorp" row

**System Response:**
- Row highlights
- Page transitions to Account Detail view (300ms animation)
- URL changes to: `/employee/workspace/accounts/tech-corp-123`
- Account 360 view loads

**Screen State (Account 360 - Overview Tab):**
```
+------------------------------------------------------------------+
| TechCorp                                      [Edit] [Actions ▼] |
+------------------------------------------------------------------+
| 🟢 HEALTHY (82/100)   Tier 1   $620K ARR   Owner: You            |
+------------------------------------------------------------------+
|                                                                   |
| [Overview] [Jobs] [Contacts] [Activity] [Files] [Financials]    |
|                                                                   |
+--[ ACCOUNT SUMMARY ]---------------------------------------------+
| Company Information              Key Metrics                     |
| ┌──────────────────────┐        ┌──────────────────────────┐   |
| │ Industry: Technology │        │ Customer Since: Jan 2023  │   |
| │ Size: 2,500 employees│        │ Duration: 23 months       │   |
| │ HQ: San Francisco, CA│        │ NRR: 118% (trailing 12mo) │   |
| │ Website: techcorp.com│        │ NPS: 8/10 (Good)          │   |
| └──────────────────────┘        │ Active Jobs: 7            │   |
|                                  │ Total Placements: 34       │   |
|                                  │ Active Contractors: 18     │   |
|                                  └──────────────────────────┘   |
+--[ HEALTH SCORE ]-----------------------------------------------+
| Overall: 82/100 🟢 GREEN                                        |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Hiring Velocity:        22/25 █████████████████████████░░░│ |
| │ Payment Promptness:     20/20 ████████████████████████████│ |
| │ NPS/Satisfaction:       16/20 ████████████████████░░░░░░░░│ |
| │ Executive Engagement:   12/15 ████████████████████░░░░░░░░│ |
| │ Expansion Pipeline:      8/10 ████████████████████░░░░░░░░│ |
| │ Issue Frequency:         4/10 ████████░░░░░░░░░░░░░░░░░░░░│ |
| └────────────────────────────────────────────────────────────┘ |
| Trend: ↑ +3 points vs last month                                |
| Risk Factors: 2 escalations in last 30 days (quality concerns)  |
| Opportunity: Payment issue resolved today - monitor satisfaction|
+------------------------------------------------------------------+
|
+--[ KEY CONTACTS ]-----------------------------------------------+
| Primary Contact          Role                   Last Contact    |
| ──────────────────────────────────────────────────────────────  |
| Michael Chen            CFO                     Today (Call)    |
| 📧 mchen@techcorp.com   🌟 Executive Sponsor   ☎️ +1-415-555-... |
|                                                                  |
| Sarah Johnson           VP Engineering          Nov 25 (Email)  |
| 📧 sjohnson@techcorp.com  Primary Stakeholder  ☎️ +1-415-555-...|
|                                                                  |
| David Kim               Dir. Talent Acquisition Nov 20 (Meeting)|
| 📧 dkim@techcorp.com      Day-to-day Contact   ☎️ +1-415-555-...|
|                                                  [View All (7)] |
+------------------------------------------------------------------+
|
+--[ ACTIVE JOBS ]------------------------------------------------+
| Job Title               Status    Submissions  Days Open  Priority|
| ──────────────────────────────────────────────────────────────── |
| Senior DevOps Engineer  Active    4            12         High    |
| Frontend Developer      Active    6            8          Critical|
| Data Analyst            Active    2            5          Normal  |
| QA Automation Engineer  Active    3            15         Normal  |
|                                                 [View All (7)]   |
+------------------------------------------------------------------+
|
+--[ RECENT ACTIVITY ]--------------------------------------------+
| Today, 9:45 AM    📞 Call with Michael Chen (CFO)              |
|                   Payment escalation resolved. Payment confirmed|
|                   by Dec 4. Positive sentiment.                |
|                   [View Details]                                |
|                                                                  |
| Nov 29, 2:15 PM   📧 Email from David Kim                      |
|                   Question about Frontend Developer timeline.   |
|                   Responded: Expected 2 submissions by Dec 2.   |
|                   [View Details]                                |
|                                                                  |
| Nov 25, 10:00 AM  👥 Team Meeting (Sarah Johnson + AM)         |
|                   Discussed Q1 hiring plans. 10-12 roles       |
|                   expected. Action items created.              |
|                   [View Details]                                |
|                                                 [View All]      |
+------------------------------------------------------------------+
|
+--[ EXPANSION OPPORTUNITIES ]------------------------------------+
| DevOps Expansion                               Value: $300K    |
| Stage: Proposal Sent (Nov 25)    Next: Follow-up due Dec 2    |
| Champion: Sarah Johnson (VP Engineering)                       |
| Notes: Proposal for dedicated DevOps team (5-7 contractors)    |
|                                                 [View Details]  |
+------------------------------------------------------------------+
|
+--[ QUICK ACTIONS ]----------------------------------------------+
| [📧 Send Email] [📞 Log Call] [👥 Schedule Meeting] [+ Add Note]|
| [View Financials] [Run Health Report] [Schedule QBR]           |
+------------------------------------------------------------------+
```

**Time:** 1 second (page load)

---

### Step 3: Review Health Score Detail

**User Action:** Click on "Health Score" section title or score (82/100)

**System Response:**
- Expands health score breakdown
- Shows historical trend chart
- Displays contributing factors

**Detailed Health View:**
```
+------------------------------------------------------------------+
| TechCorp - Health Score Analysis                          [×]    |
+------------------------------------------------------------------+
|
| OVERALL SCORE: 82/100 🟢 GREEN                                  |
|                                                                  |
| SCORE BREAKDOWN (with trends)                                   |
|                                                                  |
| 1. Hiring Velocity (22/25) ↑                                    |
|    ████████████████████████████████░░░░░░░░░░░                  |
|    • Active jobs: 7 (above avg for account size)                |
|    • Hiring rate: 3.2 placements/month (strong)                 |
|    • Pipeline: 18 candidates in various stages                  |
|    • Trend: ↑ Up 2 points vs last month (increased hiring)      |
|                                                                  |
| 2. Payment Promptness (20/20) →                                 |
|    ████████████████████████████████████████████████████         |
|    • Average payment time: 12 days (Net 30 terms)               |
|    • Payment history: 23 of 24 on-time (95.8%)                  |
|    • Current status: 1 invoice overdue (addressed today)        |
|    • Trend: → Stable (consistently excellent)                   |
|                                                                  |
| 3. NPS/Satisfaction (16/20) ↓                                   |
|    ████████████████████████████████░░░░░░░░░░                   |
|    • Latest NPS: 8/10 (Promoter)                                |
|    • Survey date: Nov 1, 2024                                   |
|    • Historical NPS: 9/10 (Oct), 9/10 (Jul), 10/10 (Apr)        |
|    • Concern: Slight decline from 9 to 8                        |
|    • Trend: ↓ Down 2 points (worth monitoring)                  |
|    • Reason: Quality escalations in Oct/Nov                     |
|                                                                  |
| 4. Executive Engagement (12/15) ↑                               |
|    ████████████████████████████░░░░░░░░░░░░                     |
|    • Executive sponsor: Michael Chen (CFO) ✅                   |
|    • Last exec touchpoint: Today (call)                         |
|    • Exec meeting frequency: Monthly (target: bi-weekly)        |
|    • Multi-level relationships: 3 execs, 4 managers             |
|    • Trend: ↑ Up 2 points (increased exec engagement)           |
|    • Opportunity: Schedule Sarah Johnson (VP Eng) quarterly     |
|                                                                  |
| 5. Expansion Pipeline (8/10) →                                  |
|    ████████████████████████████████░░░░░░░░░                    |
|    • Active opportunities: 1 ($300K DevOps expansion)           |
|    • Stage: Proposal sent, awaiting decision                    |
|    • Probability: 60% (verbal interest confirmed)               |
|    • Whitespace identified: Security team, Product team         |
|    • Trend: → Stable                                            |
|                                                                  |
| 6. Issue Frequency (4/10) ↓                                     |
|    ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                    |
|    • Escalations (last 30 days): 2                              |
|      - P2: Candidate quality (resolved)                         |
|      - P1: Payment delay (resolved today)                       |
|    • Escalations (last 90 days): 4                              |
|    • Concern: Above account average (typically 0-1/quarter)     |
|    • Trend: ↓ Down 4 points (increase in issues)                |
|    • Root cause: New recruiter onboarding (Sarah - now trained) |
|    • Action: Monitor next 30 days for improvement               |
|                                                                  |
+------------------------------------------------------------------+
|
| TREND CHART (Last 6 Months)                                     |
|                                                                  |
| 100 │                                                            |
|  90 │           ●─────●                                          |
|  80 │      ●───          ───●───●───● (82)                       |
|  70 │                                                            |
|  60 │                                                            |
|  50 │                                                            |
|     └────────────────────────────────────────                   |
|     Jun   Jul   Aug   Sep   Oct   Nov (Today)                   |
|                                                                  |
| Key Events:                                                      |
| • Aug: Spike to 91 (3 placements in 1 week)                     |
| • Oct: Dip to 79 (quality escalation)                           |
| • Nov: Recovery to 82 (payment resolved, exec engagement up)    |
|                                                                  |
+------------------------------------------------------------------+
|
| RISK ASSESSMENT                                                 |
|                                                                  |
| Overall Risk Level: LOW 🟢                                      |
|                                                                  |
| Risk Factors:                                                    |
| ⚠️ Escalation frequency above normal (monitor for 30 days)      |
| ⚠️ NPS decline from 9 to 8 (investigate in next touchpoint)     |
|                                                                  |
| Protective Factors:                                              |
| ✅ Strong executive relationship (CFO is sponsor)                |
| ✅ Excellent payment history (resolved issue today)              |
| ✅ High hiring velocity (7 active jobs)                          |
| ✅ Expansion opportunity in pipeline ($300K value)               |
|                                                                  |
| Churn Probability: 5% (very low)                                |
|                                                                  |
+------------------------------------------------------------------+
|
| RECOMMENDED ACTIONS                                             |
|                                                                  |
| 🎯 Priority Actions:                                            |
| 1. Schedule check-in with David Kim (day-to-day contact)        |
|    Purpose: Confirm quality concerns resolved                   |
|    Timeline: This week                                          |
|    [Schedule Call]                                              |
|                                                                  |
| 2. Follow up on DevOps expansion proposal                       |
|    Target: Sarah Johnson                                        |
|    Due: Dec 2 (per proposal timeline)                           |
|    [Send Follow-up Email]                                       |
|                                                                  |
| 3. Monitor payment confirmation                                 |
|    Task: Confirm payment received by Dec 4                      |
|    Assigned: Finance team (notify AM when paid)                 |
|    [View Task]                                                  |
|                                                                  |
| 📅 Ongoing Actions:                                             |
| • Continue bi-weekly check-ins with David Kim                   |
| • Schedule monthly exec touchpoint with Michael Chen            |
| • Quality audit: Review next 5 submissions before client send   |
|                                                                  |
+------------------------------------------------------------------+
|                                                           [Close]|
+------------------------------------------------------------------+
```

**Time:** 30 seconds (review)

---

### Step 4: Review Active Jobs

**User Action:** Click "Jobs" tab in account detail view

**System Response:**
- Switches to Jobs tab
- Loads all jobs associated with account (active, on hold, filled, closed)
- Default filter: Active jobs

**Screen State (Jobs Tab):**
```
+------------------------------------------------------------------+
| TechCorp - Jobs                                                  |
+------------------------------------------------------------------+
|                                                                  |
| [Overview] [Jobs] [Contacts] [Activity] [Files] [Financials]   |
|                                                                  |
+------------------------------------------------------------------+
| Status: [●All] [●Active] [○On Hold] [○Filled] [○Closed]        |
| [Search jobs...]                              [+ Create Job]     |
+------------------------------------------------------------------+
|
| ACTIVE JOBS (7)                                                 |
|                                                                  |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Senior DevOps Engineer                          Status: 🟢 │ |
| │ Opened: Nov 18 (12 days ago)   Priority: High              │ |
| │ Rate: $95-110/hr   Positions: 2   Owner: Sarah Chen        │ |
| │                                                             │ |
| │ Pipeline:  4 submissions │ 2 in interview │ 1 offer pending │ |
| │ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                │ |
| │                                                             │ |
| │ Latest Activity:                                            │ |
| │ • Today: Offer pending for John Smith (waiting client approval)│|
| │ • Nov 28: Interview scheduled for Sarah Lee (Dec 2)        │ |
| │                                                             │ |
| │ Health: 🟢 On Track (expected fill: Dec 10)                │ |
| │                                    [View Details] [Update] │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ Frontend Developer (React)                      Status: 🔴 │ |
| │ Opened: Nov 22 (8 days ago)    Priority: Critical          │ |
| │ Rate: $85-100/hr   Positions: 1   Owner: Sarah Chen        │ |
| │                                                             │ |
| │ Pipeline:  6 submissions │ 3 in interview │ 0 offers        │ |
| │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░                │ |
| │                                                             │ |
| │ Latest Activity:                                            │ |
| │ • Nov 29: 2 candidates rejected after tech screen          │ |
| │ • Nov 27: 3 new submissions sent to client                 │ |
| │                                                             │ |
| │ Health: 🟡 At Risk (client rejected last 4 candidates)     │ |
| │ Concern: Quality expectations mismatch                      │ |
| │ Action: AM to discuss with hiring manager                  │ |
| │                                    [View Details] [Update] │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ Data Analyst                                    Status: 🟢 │ |
| │ Opened: Nov 25 (5 days ago)    Priority: Normal            │ |
| │ Rate: $65-80/hr   Positions: 1   Owner: Mike Rodriguez     │ |
| │                                                             │ |
| │ Pipeline:  2 submissions │ 0 in interview │ 0 offers        │ |
| │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                │ |
| │                                                             │ |
| │ Latest Activity:                                            │ |
| │ • Nov 29: 2 submissions sent to client                     │ |
| │ • Nov 26: Job opened, recruiter assigned                   │ |
| │                                                             │ |
| │ Health: 🟢 On Track (early stage)                          │ |
| │                                    [View Details] [Update] │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                  [View All (7)] |
+------------------------------------------------------------------+
|
| JOBS SUMMARY                                                    |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Total Active Jobs: 7                                        │ |
| │ Total Open Positions: 12 (some jobs have multiple openings)│ |
| │                                                             │ |
| │ By Status:                                                  │ |
| │ • On Track: 5 jobs (71%)                                    │ |
| │ • At Risk: 1 job (Frontend Developer - quality mismatch)    │ |
| │ • Critical: 1 job (Senior DevOps - offer pending)           │ |
| │                                                             │ |
| │ By Priority:                                                │ |
| │ • Critical: 1     • High: 2      • Normal: 4                │ |
| │                                                             │ |
| │ Average Time-to-Fill: 18 days (account avg: 21 days)        │ |
| │ Total Candidates in Pipeline: 32                            │ |
| └────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Time:** 10 seconds (review)

---

### Step 5: View Contact Management

**User Action:** Click "Contacts" tab

**System Response:**
- Switches to Contacts tab
- Shows all contacts at account with relationship mapping

**Screen State (Contacts Tab):**
```
+------------------------------------------------------------------+
| TechCorp - Contacts                                              |
+------------------------------------------------------------------+
|                                                                  |
| [Overview] [Jobs] [Contacts] [Activity] [Files] [Financials]   |
|                                                                  |
+------------------------------------------------------------------+
| [Search contacts...]                         [+ Add Contact]     |
| Filter: [All] [Executives] [Hiring Managers] [Procurement]      |
+------------------------------------------------------------------+
|
| ORGANIZATIONAL HIERARCHY                                        |
|                                                                  |
|                    Michael Chen                                 |
|                    CFO, Executive Sponsor                       |
|                    mchen@techcorp.com                           |
|                    📞 +1-415-555-0101                           |
|                    Last Contact: Today (Call)                   |
|                    Relationship: 🌟🌟🌟🌟🌟 Excellent           |
|                    [View Profile] [Send Email]                  |
|                            │                                     |
|         ┌──────────────────┼──────────────────┐                 |
|         │                  │                  │                  |
|   Sarah Johnson      CTO (not engaged)   Lisa Martinez          |
|   VP Engineering                          VP Finance            |
|   Primary Stakeholder                     Finance Contact       |
|   sjohnson@tech...                        lmartinez@tech...     |
|   Last: Nov 25 (Meeting)                  Last: Nov 15 (Email)  |
|   🌟🌟🌟🌟 Strong                          🌟🌟🌟 Good            |
|   [View] [Email]                          [View] [Email]        |
|         │                                                        |
|    ┌────┴────┐                                                   |
|    │         │                                                   |
| David Kim  (2 other managers)                                   |
| Dir. TA                                                         |
| Day-to-day                                                      |
| dkim@tech...                                                    |
| Last: Nov 20 (Mtg)                                              |
| 🌟🌟🌟🌟 Strong                                                   |
| [View] [Email]                                                  |
|                                                                  |
+------------------------------------------------------------------+
|
| CONTACTS LIST (7 total)                                         |
|                                                                  |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Michael Chen                                  🌟 Executive  │ |
| │ Chief Financial Officer                                     │ |
| │ 📧 mchen@techcorp.com       📞 +1-415-555-0101              │ |
| │ Relationship Strength: 🌟🌟🌟🌟🌟 Excellent (5/5)            │ |
| │ Role: Executive Sponsor, Contract Signer                    │ |
| │ Preferences: Prefers phone calls, responsive, data-driven   │ |
| │ Last Contact: Today, 9:45 AM (Call - Payment escalation)    │ |
| │ Touchpoint Frequency: Monthly minimum                       │ |
| │ Notes: Very supportive, appreciates transparency            │ |
| │                      [View Full Profile] [Edit] [Log Touch] │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ Sarah Johnson                              🌟 Primary Stakeholder│|
| │ Vice President, Engineering                                 │ |
| │ 📧 sjohnson@techcorp.com    📞 +1-415-555-0145              │ |
| │ Relationship Strength: 🌟🌟🌟🌟 Strong (4/5)                 │ |
| │ Role: Primary Hiring Authority (Engineering)                │ |
| │ Preferences: Email preferred, detail-oriented, busy         │ |
| │ Last Contact: Nov 25, 10:00 AM (Meeting - Q1 planning)      │ |
| │ Touchpoint Frequency: Bi-weekly check-ins                   │ |
| │ Notes: Champion of DevOps expansion. Expects quality over   │ |
| │ speed. Provide data/metrics in all communications.          │ |
| │                      [View Full Profile] [Edit] [Log Touch] │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ David Kim                                   Day-to-day Contact│|
| │ Director, Talent Acquisition                                │ |
| │ 📧 dkim@techcorp.com        📞 +1-415-555-0198              │ |
| │ Relationship Strength: 🌟🌟🌟🌟 Strong (4/5)                 │ |
| │ Role: Primary Coordinator, Job Requests, Interview Scheduling│|
| │ Preferences: Slack for quick questions, email for formal    │ |
| │ Last Contact: Nov 29, 2:15 PM (Email - Frontend timeline)   │ |
| │ Touchpoint Frequency: 2-3x per week (high volume)           │ |
| │ Notes: Very responsive, appreciates proactive updates.      │ |
| │ Raised quality concerns in Oct - now resolved via training. │ |
| │                      [View Full Profile] [Edit] [Log Touch] │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ Lisa Martinez                               Finance Contact │ |
| │ Vice President, Finance                                     │ |
| │ 📧 lmartinez@techcorp.com   📞 +1-415-555-0223              │ |
| │ Relationship Strength: 🌟🌟🌟 Good (3/5)                     │ |
| │ Role: Invoice Approval, Payment Processing                  │ |
| │ Preferences: Email only, formal communication               │ |
| │ Last Contact: Nov 15 (Email - Invoice question)             │ |
| │ Touchpoint Frequency: As needed (monthly invoices)          │ |
| │ Notes: Handles payment approvals. Generally responsive.     │ |
| │                      [View Full Profile] [Edit] [Log Touch] │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                  [Show All (7)] |
+------------------------------------------------------------------+
|
| ENGAGEMENT ANALYTICS                                            |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Multi-threading Score: 8/10 (Good)                          │ |
| │ • Executive relationships: 1 (Michael Chen)                 │ |
| │ • VP-level relationships: 2 (Sarah, Lisa)                   │ |
| │ • Manager-level: 4 (David + 3 others)                       │ |
| │                                                             │ |
| │ Risk Assessment:                                            │ |
| │ ⚠️ Single point of failure: David Kim (day-to-day)          │ |
| │   Recommendation: Build relationship with backup TA contact │ |
| │ ⚠️ CTO not engaged: Opportunity to expand relationship      │ |
| │   Recommendation: Invite to DevOps expansion discussion     │ |
| │                                                             │ |
| │ Touchpoint Coverage (Last 30 Days):                         │ |
| │ • Executives: 2 touches ✅                                  │ |
| │ • Primary stakeholders: 4 touches ✅                        │ |
| │ • Day-to-day: 12 touches ✅                                 │ |
| └────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Time:** 15 seconds (review)

---

### Step 6: View Activity Timeline

**User Action:** Click "Activity" tab

**System Response:**
- Switches to Activity tab
- Shows comprehensive timeline of all interactions

**Screen State (Activity Tab):**
```
+------------------------------------------------------------------+
| TechCorp - Activity Timeline                                     |
+------------------------------------------------------------------+
|                                                                  |
| [Overview] [Jobs] [Contacts] [Activity] [Files] [Financials]   |
|                                                                  |
+------------------------------------------------------------------+
| Filter: [All] [Calls] [Emails] [Meetings] [Notes] [Escalations]|
| Date Range: [Last 30 Days ▼]                    [Export]        |
+------------------------------------------------------------------+
|
| TODAY - Monday, November 30, 2024                               |
| ┌────────────────────────────────────────────────────────────┐ |
| │ 9:45 AM  📞 Call - Michael Chen (CFO)                       │ |
| │          Logged by: You                                     │ |
| │          Duration: 28 minutes                               │ |
| │          Type: Escalation Resolution                        │ |
| │          Sentiment: 😊 Positive                             │ |
| │                                                             │ |
| │          Summary:                                           │ |
| │          Payment escalation resolved. Invoice #INV-2024-0847│ |
| │          ($85,420) overdue 45 days due to AP system upgrade.│ |
| │          Not a budget issue. Payment will be processed by   │ |
| │          EOD Friday, Dec 4. Michael apologized for lack of  │ |
| │          communication and will CC AM on future payment     │ |
| │          confirmations.                                     │ |
| │                                                             │ |
| │          Next Actions:                                      │ |
| │          ☐ Confirm payment received by Dec 4 (assigned: You)│ |
| │                                                             │ |
| │          Tags: [Payment] [Escalation] [Resolved]            │ |
| │                                     [View Full] [Edit] [×]  │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| YESTERDAY - Sunday, November 29, 2024                           |
| ┌────────────────────────────────────────────────────────────┐ |
| │ 2:15 PM  📧 Email - David Kim (Dir. TA)                     │ |
| │          From: David → To: You                              │ |
| │          Subject: Frontend Developer Timeline?              │ |
| │                                                             │ |
| │          Question: "When can we expect more submissions for │ |
| │          the React Frontend Developer role? The team is     │ |
| │          anxious to fill this position."                    │ |
| │                                                             │ |
| │          Your Response (2:47 PM):                           │ |
| │          "Hi David, Sarah (recruiter) is actively sourcing. │ |
| │          We're seeing a competitive market for senior React │ |
| │          developers. Expect 2 additional submissions by     │ |
| │          Dec 2. I'll have Sarah send a detailed pipeline    │ |
| │          update tomorrow. Let me know if you'd like to      │ |
| │          discuss adjusting requirements to accelerate."     │ |
| │                                                             │ |
| │          Tags: [Job Update] [Timeline Question]             │ |
| │                                     [View Full] [Edit] [×]  │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| Nov 25 - Monday                                                 |
| ┌────────────────────────────────────────────────────────────┐ |
| │ 10:00 AM 👥 Meeting - Sarah Johnson (VP Engineering)        │ |
| │          Attendees: Sarah Johnson, David Kim, You           │ |
| │          Duration: 45 minutes                               │ |
| │          Type: Strategic Planning                           │ |
| │          Location: Zoom                                     │ |
| │                                                             │ |
| │          Agenda:                                            │ |
| │          • Q1 2025 hiring forecast                          │ |
| │          • DevOps team expansion discussion                 │ |
| │          • Review current pipeline                          │ |
| │                                                             │ |
| │          Key Outcomes:                                      │ |
| │          • Confirmed 10-12 roles for Q1 (mix of FTE, contract)│|
| │          • DevOps expansion: 5-7 dedicated contractors      │ |
| │          • Authorized to send formal proposal for DevOps    │ |
| │          • Budget: $300K for DevOps expansion               │ |
| │                                                             │ |
| │          Action Items:                                      │ |
| │          ☑ Draft DevOps expansion proposal (completed)      │ |
| │          ☑ Send proposal to Sarah (sent Nov 25, 3pm)        │ |
| │          ☐ Follow up on proposal feedback (due Dec 2)       │ |
| │                                                             │ |
| │          Sentiment: 😊 Positive - Very productive meeting   │ |
| │          Tags: [Q1 Planning] [Expansion] [Strategic]        │ |
| │                                     [View Full] [Edit] [×]  │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ┌────────────────────────────────────────────────────────────┐ |
| │ 3:00 PM  📧 Email - Proposal Sent                           │ |
| │          To: Sarah Johnson                                  │ |
| │          CC: David Kim, Michael Chen                        │ |
| │          Subject: DevOps Team Expansion Proposal - TechCorp │ |
| │          Attachments: DevOps_Expansion_Proposal_v1.pdf      │ |
| │                                                             │ |
| │          Email sent with formal expansion proposal.         │ |
| │          Requested feedback by Dec 2.                       │ |
| │                                     [View Full] [Edit] [×]  │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| [Load More Activities...]                                       |
+------------------------------------------------------------------+
|
| ACTIVITY SUMMARY (Last 30 Days)                                 |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Total Touchpoints: 28                                       │ |
| │ • Calls: 6       • Emails: 18      • Meetings: 4            │ |
| │ • Notes: 0       • Escalations: 2 (both resolved)           │ |
| │                                                             │ |
| │ Contact Distribution:                                       │ |
| │ • Michael Chen (CFO): 3 touches                             │ |
| │ • Sarah Johnson (VP Eng): 5 touches                         │ |
| │ • David Kim (Dir. TA): 16 touches (primary day-to-day)      │ |
| │ • Others: 4 touches                                         │ |
| │                                                             │ |
| │ Response Time (Avg): 2.4 hours                              │ |
| │ Sentiment Breakdown:                                        │ |
| │ • Positive: 22 (79%)   • Neutral: 5 (18%)   • Negative: 1 (3%)│|
| └────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Time:** 20 seconds (review)

---

### Step 7: Review Financials

**User Action:** Click "Financials" tab

**System Response:**
- Switches to Financials tab
- Shows revenue, invoicing, payment history

**Screen State (Financials Tab):**
```
+------------------------------------------------------------------+
| TechCorp - Financials                                            |
+------------------------------------------------------------------+
|                                                                  |
| [Overview] [Jobs] [Contacts] [Activity] [Files] [Financials]   |
|                                                                  |
+------------------------------------------------------------------+
| Date Range: [Last 12 Months ▼]                  [Export Report] |
+------------------------------------------------------------------+
|
| REVENUE SUMMARY                                                 |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Annual Recurring Revenue (ARR): $620,000                    │ |
| │ Trailing 12-Month Revenue: $587,000                         │ |
| │ Net Revenue Retention (NRR): 118%                           │ |
| │ Growth vs Last Year: +$92,000 (+18%)                        │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| REVENUE TREND (Last 12 Months)                                  |
| $80K │                                               ●          |
| $70K │                                          ●───             |
| $60K │                                     ●───                  |
| $50K │                          ●─────●───                       |
| $40K │               ●─────●───                                  |
| $30K │      ●───●───                                             |
|      └──────────────────────────────────────────────────────    |
|      Dec  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov |
|      '23                                                    '24  |
|                                                                  |
| Key Events:                                                      |
| • Jan '24: Initial contract signed ($30K/month)                 |
| • Apr '24: Expansion to additional departments (+$15K/month)    |
| • Oct '24: Increased hiring velocity (+$8K/month)               |
|                                                                  |
+------------------------------------------------------------------+
|
| INVOICE HISTORY                                                 |
| ┌────────────────────────────────────────────────────────────┐ |
| │ INV-2024-0847   Oct 2024   $85,420   ⚠️ Overdue (45 days)  │ |
| │                 Due: Sept 15    Status: Payment pending     │ |
| │                 Note: Resolved today - Payment by Dec 4     │ |
| │                                              [View Details] │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ INV-2024-0723   Sept 2024  $72,350   ✅ Paid (10 days)     │ |
| │                 Due: Sept 1     Paid: Sept 11               │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ INV-2024-0615   Aug 2024   $68,200   ✅ Paid (8 days)      │ |
| │                 Due: Aug 1      Paid: Aug 9                 │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ INV-2024-0501   Jul 2024   $61,150   ✅ Paid (12 days)     │ |
| │                 Due: Jul 1      Paid: Jul 13                │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                  [View All (24)]|
|                                                                  |
| PAYMENT METRICS                                                 |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Average Payment Time: 12 days (terms: Net 30)               │ |
| │ On-Time Payment Rate: 95.8% (23 of 24 invoices)             │ |
| │ Current Outstanding: $85,420 (1 invoice)                    │ |
| │ Collections Status: Low Risk (resolved)                     │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
+------------------------------------------------------------------+
|
| REVENUE BY SERVICE TYPE                                         |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Contract Staffing (W2):    $520,000   (84%)  ████████████  │ |
| │ Contract-to-Hire:          $67,000    (11%)  ██░░░░░░░░░░  │ |
| │ Direct Hire (placement):   $33,000    (5%)   █░░░░░░░░░░░  │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ACTIVE CONTRACTORS (Revenue Contribution)                       |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Total Active: 18 contractors                                │ |
| │ Monthly Revenue: ~$62,000                                   │ |
| │ Average Bill Rate: $92/hour                                 │ |
| │ Average Assignment Duration: 8.2 months                     │ |
| │                                                             │ |
| │ Top Contributors (by revenue):                              │ |
| │ 1. Senior Developer (12mo):    $9,600/month                 │ |
| │ 2. DevOps Engineer (9mo):      $8,800/month                 │ |
| │ 3. Architect (14mo):           $8,400/month                 │ |
| │                                              [View All (18)]│ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
+------------------------------------------------------------------+
|
| PROFITABILITY (Account Manager View)                            |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Gross Revenue (TTM):         $587,000                       │ |
| │ Estimated Margin:            28% (industry standard)        │ |
| │ Estimated Gross Profit:      $164,360                       │ |
| │                                                             │ |
| │ Note: Detailed margin data available to Finance/Leadership  │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| FORECAST (Next 12 Months)                                       |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Projected Revenue (Current Run Rate):  $744,000             │ |
| │ Expansion Opportunities:                $300,000            │ |
| │   • DevOps team expansion:              $300K (60% prob)    │ |
| │   • Security team (whitespace):         TBD                 │ |
| │                                                             │ |
| │ Total Potential Revenue:                $1,044,000          │ |
| │ Conservative Forecast (80% probability):$864,000            │ |
| └────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Time:** 20 seconds (review)

---

### Step 8: Update Account Status

**User Action:** Click "Edit" button (top right of account page)

**System Response:**
- Opens account edit modal
- Allows updates to key account fields

**Screen State (Edit Modal):**
```
+------------------------------------------------------------------+
| Edit Account: TechCorp                                     [×]   |
+------------------------------------------------------------------+
|
| ACCOUNT INFORMATION                                             |
|                                                                  |
| Account Name *                                                  |
| [TechCorp                                                    ]  |
|                                                                  |
| Account Tier *                                                  |
| [● Tier 1 (Strategic)  ○ Tier 2 (Growth)  ○ Tier 3 (Standard)] |
|                                                                  |
| Account Status                                                  |
| [Active                                               ▼]        |
| Options: Active, On Hold, Churned, Dormant                      |
|                                                                  |
| Industry                                                        |
| [Technology                                           ▼]        |
|                                                                  |
| Company Size                                                    |
| [2500] employees                                                |
|                                                                  |
| Annual Contract Value (ACV)                                     |
| [$620,000    ]                                                  |
|                                                                  |
+------------------------------------------------------------------+
|
| RELATIONSHIP DETAILS                                            |
|                                                                  |
| Account Owner (AM) *                                            |
| [You - Account Manager                               ▼]        |
|                                                                  |
| Executive Sponsor                                               |
| [Michael Chen - CFO                                   ▼]        |
|                                                                  |
| Primary Contact                                                 |
| [David Kim - Director TA                              ▼]        |
|                                                                  |
| Payment Terms                                                   |
| [Net 30                                               ▼]        |
|                                                                  |
+------------------------------------------------------------------+
|
| STRATEGIC NOTES                                                 |
|                                                                  |
| Success Plan Summary                                            |
| [                                                              ]|
| [Focus on Engineering hiring. DevOps expansion in progress.    ]|
| [Strong exec relationship with CFO. Monitor quality closely.   ]|
| [                                                              ]|
|                                                        0/2000   |
|                                                                  |
| Risk Notes                                                      |
| [                                                              ]|
| [Recent quality escalations (Oct-Nov). Recruiter now trained.  ]|
| [Monitor next 30 days for improvement.                        ]|
| [                                                              ]|
|                                                        0/1000   |
|                                                                  |
+------------------------------------------------------------------+
|
| TAGS                                                            |
| [Technology] [SaaS] [Engineering] [High-Volume] [+Add Tag]      |
|                                                                  |
+------------------------------------------------------------------+
|                                                [Cancel]  [Save]  |
+------------------------------------------------------------------+
```

**User Action:** Update "Risk Notes" to reflect payment resolution

**Field Specification: Risk Notes**
| Property | Value |
|----------|-------|
| Field Name | `riskNotes` |
| Type | Textarea |
| Label | "Risk Notes" |
| Required | No |
| Max Length | 1000 characters |
| Purpose | Document current risks, concerns, mitigation plans |

**User Action:** Click "Save"

**System Response:**
- Modal closes
- Account updated in database
- Activity logged: "Account edited by [User]"
- Toast notification: "Account updated successfully"

**Time:** 2 minutes

---

### Step 9: Take Quick Action (Send Email to Client)

**User Action:** Click "Send Email" in Quick Actions section

**System Response:**
- Opens email composer with context

**Screen State (Email Composer):**
```
+------------------------------------------------------------------+
| Compose Email - TechCorp                                   [×]   |
+------------------------------------------------------------------+
|
| To: [Select contact(s)                                       ▼] |
| Suggested: David Kim, Sarah Johnson, Michael Chen               |
|                                                                  |
| Template: [Blank] [Check-in] [QBR Request] [Issue Follow-up]    |
|                                                                  |
| Subject:                                                        |
| [                                                              ] |
|                                                                  |
| Body:                                                           |
| [                                                              ] |
| [                                                              ] |
| [                                                              ] |
| [                                                              ] |
|                                                                  |
| [Insert Variable ▼] [Attach File]                              |
| Variables: {{account_name}}, {{contact_name}}, {{health_score}}|
|                                                                  |
+------------------------------------------------------------------+
| ☑ Log this email as activity in CRM                             |
| ☐ Schedule send for later: [Date/Time picker]                  |
+------------------------------------------------------------------+
|                                         [Cancel]  [Send Email]  |
+------------------------------------------------------------------+
```

**Example - Check-in Email:**

**User Action:** Select "Check-in" template, choose "David Kim" as recipient

**System Response:**
- Pre-fills subject and body

**Generated Email:**
```
To: David Kim <dkim@techcorp.com>
Subject: Quick Check-in - TechCorp Partnership

Hi David,

I wanted to check in and see how everything is going with our current
partnership. We have 7 active searches underway, and I want to make sure
we're meeting your expectations.

A few quick questions:
• Are we on track with the quality and quantity of candidates?
• Any concerns or feedback I should be aware of?
• Anything we could be doing differently or better?

Also, I wanted to follow up on the Frontend Developer role. Sarah is
actively sourcing and we expect 2 additional submissions by Dec 2 as
discussed. Let me know if you'd like a detailed pipeline update.

Looking forward to hearing from you!

Best regards,
[Your Name]
Account Manager, InTime
```

**User Action:** Personalize, then click "Send Email"

**System Response:**
- Email sent via Gmail/Outlook integration
- Activity logged automatically in CRM (checkbox was selected)
- Toast notification: "Email sent to David Kim"

**Time:** 3 minutes

---

## Postconditions

1. ✅ Account 360 view reviewed comprehensively
2. ✅ Health score and risk factors understood
3. ✅ Active jobs status current
4. ✅ Contact relationships mapped
5. ✅ Recent activity timeline reviewed
6. ✅ Financial status confirmed
7. ✅ Account notes updated (if applicable)
8. ✅ Follow-up action taken (email sent, call scheduled, etc.)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `account.viewed` | `{ account_id, user_id, timestamp, tabs_viewed[] }` |
| `account.edited` | `{ account_id, user_id, fields_changed[], timestamp }` |
| `activity.created` | `{ account_id, activity_type, contact_id, user_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Account Not Found | Deleted or reassigned | "This account no longer exists or you don't have access" | Return to accounts list |
| Permission Denied | User not owner | "You don't have permission to edit this account" | Request access from owner |
| Data Load Failed | API error | "Failed to load account data. Please refresh." | Retry button |
| Health Score Missing | Calculation error | "Health score unavailable. Contact support." | Show warning, allow other actions |
| Save Failed | Network error | "Failed to save changes. Please try again." | Retry save |

---

## Field Specifications

### Account Status

| Property | Value |
|----------|-------|
| Field Name | `status` |
| Type | Dropdown (Select) |
| Label | "Account Status" |
| Required | Yes |
| Default | "active" |
| Options | |
| - `active` | "Active" - Currently engaged, hiring actively |
| - `on_hold` | "On Hold" - Temporarily paused hiring |
| - `dormant` | "Dormant" - No activity for 90+ days |
| - `churned` | "Churned" - Contract ended, no longer client |

### Account Tier

| Property | Value |
|----------|-------|
| Field Name | `tier` |
| Type | Radio Button Group |
| Label | "Account Tier" |
| Required | Yes |
| Default | "tier_2" |
| Options | |
| - `tier_1` | "Tier 1 (Strategic)" - $500K+ ARR |
| - `tier_2` | "Tier 2 (Growth)" - $150K-$500K ARR |
| - `tier_3` | "Tier 3 (Standard)" - $50K-$150K ARR |

### Annual Contract Value

| Property | Value |
|----------|-------|
| Field Name | `acv` |
| Type | Currency Input |
| Label | "Annual Contract Value (ACV)" |
| Prefix | "$" |
| Required | No |
| Min Value | 0 |
| Max Value | 999,999,999 |
| Precision | 2 decimal places |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Global search (find accounts) |
| `E` | Edit account (when viewing) |
| `N` | Add note (when viewing) |
| `Tab` | Navigate between tabs |
| `Esc` | Close modal/drawer |

---

## Alternative Flows

### A1: Quick Health Score Update

1. From accounts list, click health score badge
2. Mini-modal opens with score breakdown
3. Update specific metric (e.g., mark escalation as resolved)
4. Score recalculates automatically
5. Modal closes, list updates

### A2: Bulk Account Review (Weekly Routine)

1. Filter accounts list: "Yellow" + "Red" only
2. Open each account in new tab (Cmd+Click)
3. Review each tab systematically
4. Take notes in central document
5. Create tasks for follow-ups
6. Close tabs when complete

### A3: Export Account Report for Executive

1. Click "Actions" dropdown on account page
2. Select "Generate Executive Summary"
3. System creates PDF with key metrics
4. Download or email directly to recipient

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Context for when this is used
- [03-client-meeting.md](./03-client-meeting.md) - Pre-meeting preparation
- [04-expand-account.md](./04-expand-account.md) - Expansion opportunities
- [05-handle-issue.md](./05-handle-issue.md) - Escalation management

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | View account with all data | All tabs load successfully |
| TC-002 | View account with missing health score | Show warning, allow other functions |
| TC-003 | Edit account as owner | Changes saved successfully |
| TC-004 | Edit account as non-owner | Permission denied error |
| TC-005 | Send email from account page | Email sent, activity logged |
| TC-006 | Export financial report | PDF generated with correct data |
| TC-007 | Filter activities by type | Only selected type shown |
| TC-008 | Update tier from T2 to T1 | Tier updated, portfolio metrics recalculated |

---

*Last Updated: 2025-11-30*
