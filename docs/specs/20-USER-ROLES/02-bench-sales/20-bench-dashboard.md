# Use Case: Bench Sales Dashboard

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-020 |
| Actor | Bench Sales Recruiter (Primary), Bench Sales Manager (Secondary) |
| Goal | Monitor bench metrics, track personal KPIs, manage daily workflow |
| Frequency | Multiple times daily (start of day, mid-day, end of day) |
| Estimated Time | 5-10 minutes per review |
| Priority | High (Daily operational tool) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter or Manager
2. User has active bench consultant assignments
3. System has data to display (placements, submissions, consultants)
4. User has permission to view dashboard

---

## Trigger

One of the following:
- User logs in (morning routine)
- User clicks "Bench" in sidebar
- User navigates to bench workspace
- Dashboard auto-refreshes (every 5 minutes)
- User manually refreshes dashboard
- Notification alert redirects to dashboard

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Bench Dashboard

**User Action:** User logs in or clicks "Bench" in sidebar

**System Response:**
- Loads Bench Sales Dashboard
- Displays real-time metrics and KPIs
- Shows prioritized action items
- Highlights alerts and notifications

**URL:** `/employee/workspace/bench`

**Time:** ~2 seconds

---

### Step 2: View Dashboard Overview

**System Display:**

```
+------------------------------------------------------------------+
|  Bench Sales Dashboard                Good Morning, Alex! 8:15 AM|
+------------------------------------------------------------------+
| Your bench workspace                  Last updated: Just now ⟳   |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ TODAY'S PRIORITIES                                          │   |
| │                                                             │   |
| │ 🔴 URGENT (3):                                              │   |
| │ • 30-day check-in overdue for Rajesh Kumar (5 days)        │   |
| │ • Vendor invoice #2024-SA-067 overdue (StaffAugment)       │   |
| │ • H1B expires in 28 days: Maria Garcia (renew NOW)         │   |
| │                                                             │   |
| │ 🟡 HIGH PRIORITY (5):                                       │   |
| │ • Submit Chen Wei to 3 new jobs (goal: 20 subs/week)       │   |
| │ • Follow up on 7 pending vendor responses                  │   |
| │ • Create hotlist for .NET developers (due today)           │   |
| │ • Review 2 new vendor bench imports (42 consultants)       │   |
| │ • Contact 5 consultants (no contact in 4+ days)            │   |
| │                                                             │   |
| │ 🟢 NORMAL (8):                                              │   |
| │ [Show All Tasks]                                            │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| BENCH HEALTH OVERVIEW                                             |
+------------------------------------------------------------------+
| ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────┐|
| │ My Bench      │ │ Avg Days      │ │ This Week     │ │ Sprint │|
| │   6           │ │   35          │ │ ✓ 1 Placed    │ │ 0/1    │|
| │ consultants   │ │ on bench      │ │ → 18 Subs     │ │ 8 days │|
| │               │ │               │ │ 📅 7 Interviews│ │ left   │|
| │ ⚠ 2 orange    │ │ ▼ 3 days      │ │               │ │        │|
| │   (31+ days)  │ │ better        │ │ Target: 20/wk │ │ ⚠ Risk │|
| └───────────────┘ └───────────────┘ └───────────────┘ └────────┘|
|                                                                   |
| ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────┐|
| │ Placements    │ │ Pipeline      │ │ Marketing     │ │ Revenue│|
| │   4           │ │ 23 active     │ │ 3 hotlists    │ │ $42k   │|
| │ active        │ │ submissions   │ │ this week     │ │ monthly│|
| │               │ │               │ │               │ │        │|
| │ All healthy ✓ │ │ 5 interviews  │ │ 580 vendors   │ │ ▲ 12%  │|
| │ 1 renewing    │ │ 2 offers      │ │ reached       │ │ growth │|
| └───────────────┘ └───────────────┘ └───────────────┘ └────────┘|
+------------------------------------------------------------------+
|                                                                   |
| PERFORMANCE METRICS (vs Goals)                                    |
+------------------------------------------------------------------+
| Metric                    | This Week | This Month | Goal    | %  |
|---------------------------|-----------|------------|---------|-----|
| Placements                | 0         | 1          | 2/month | 50% |
| Bench Submissions         | 18        | 67         | 20/week | 90% |
| Vendor Submissions        | 9         | 38         | 10/week | 90% |
| Hotlists Sent             | 3         | 11         | 3/week  |100% |
| Marketing Response Rate   | 16%       | 14%        | >15%    | ✓   |
| Avg Days on Bench         | -         | 35         | <30 days| ⚠   |
| Bench Utilization         | -         | 28%        | <25%    | ⚠   |
| Placement Margin          | -         | 23.5%      | >22%    | ✓   |
| Immigration Compliance    | 100%      | 100%       | 100%    | ✓   |
+------------------------------------------------------------------+
| [View Detailed Report] [Export] [Set Goals]                      |
+------------------------------------------------------------------+
```

**Dashboard Sections:**
1. **Today's Priorities**: Urgent tasks and action items
2. **Bench Health Overview**: Key metrics at a glance
3. **Performance Metrics**: Weekly and monthly progress vs goals

**Color Coding:**
- 🔴 **Red/Urgent**: Immediate action required
- 🟡 **Yellow/High**: Priority tasks for today
- 🟢 **Green/Normal**: Routine tasks, can be scheduled

**Time:** ~1-2 minutes to review

---

### Step 3: View Bench Consultant Cards

**User Action:** Scroll down or click "My Consultants" section

**System Display:**

```
+------------------------------------------------------------------+
| MY BENCH CONSULTANTS (6 Assigned)                                 |
+------------------------------------------------------------------+
| [All] [🟠 Orange] [🟢 Green] [New]        [Filter ▼] [Sort ▼]   |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ 🟠 Rajesh Kumar                          [⋮ Actions]        │   |
| │ Java Developer                                 Match: 95%   │   |
| │                                                             │   |
| │ 📅 42 days on bench (started: 10/19)    🎯 Priority: HIGH  │   |
| │ 💼 Last: Meta (3yr)  📍 DC/Remote       🛂 H1B → 2026-03   │   |
| │ 💵 Rate: $85/hr                                             │   |
| │                                                             │   |
| │ Skills: Java, Spring Boot, AWS, Microservices, REST        │   |
| │                                                             │   |
| │ 🔄 Active Subs: 2  📞 Last Contact: 2 days ago             │   |
| │ 📋 Next: Follow up on interview prep                        │   |
| │                                                             │   |
| │ [View] [Marketing] [Submit] [Log Activity] [Contact]       │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ 🟠 John Smith                            [⋮ Actions]        │   |
| │ Full Stack Developer                           Match: 88%   │   |
| │                                                             │   |
| │ 📅 35 days on bench (started: 10/26)    🎯 Priority: HIGH  │   |
| │ 💼 Last: Amazon (2yr) 📍 Remote         🛂 US Citizen      │   |
| │ 💵 Rate: $90/hr                                             │   |
| │                                                             │   |
| │ Skills: Java, Spring, React, Node.js, AWS, Docker          │   |
| │                                                             │   |
| │ 🔄 Active Subs: 1  📞 Last Contact: 1 day ago              │   |
| │ 📋 Next: Find 3 more opportunities                          │   |
| │                                                             │   |
| │ [View] [Marketing] [Submit] [Log Activity] [Contact]       │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ... 4 more consultants (Priya, David, Maria, Ahmed) ...          |
|                                                                   |
+------------------------------------------------------------------+
| Total: 6 consultants | 🟠 Orange: 2 | 🟢 Green: 4                |
+------------------------------------------------------------------+
```

**Quick Actions Available:**
- **View**: Open full consultant profile
- **Marketing**: Add to hotlist or vendor blast
- **Submit**: Submit to matching jobs
- **Log Activity**: Record call/email/meeting
- **Contact**: Quick dial or email

**Time:** ~30 seconds to scan

---

### Step 4: View Submission Pipeline

**User Action:** Click "Pipeline" widget or navigate to "Submissions" tab

**System Display:**

```
+------------------------------------------------------------------+
| SUBMISSION PIPELINE (23 Active)                                   |
+------------------------------------------------------------------+
| Visual Pipeline (Kanban View)                                     |
+------------------------------------------------------------------+
|                                                                   |
| ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ |
| │ Submitted│ │ Vendor   │ │ Client   │ │Interview │ │  Offer  │ |
| │    10    │ │ Review   │ │ Review   │ │    5     │ │    2    │ |
| ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├─────────┤ |
| │          │ │          │ │          │ │          │ │         │ |
| │ Rajesh → │ │ Chen →   │ │ Priya →  │ │ Sarah →  │ │ John →  │ |
| │ Accenture│ │ Meta     │ │ Google   │ │ Cap One  │ │ TechCo  │ |
| │ (today)  │ │ (2 days) │ │ (5 days) │ │ (Mon 9am)│ │ ($95/hr)│ |
| │          │ │          │ │          │ │          │ │         │ |
| │ David →  │ │ John →   │ │ Maria →  │ │ Ahmed →  │ │ Lisa →  │ |
| │ MSFT     │ │ Amazon   │ │ Apple    │ │ Netflix  │ │ Startup │ |
| │ (today)  │ │ (1 day)  │ │ (3 days) │ │ (Wed 2pm)│ │ ($88/hr)│ |
| │          │ │          │ │          │ │          │ │         │ |
| │ ... +8   │ │ ... +4   │ │          │ │ ... +3   │ │         │ |
| │          │ │          │ │          │ │          │ │         │ |
| └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘ |
|                                                                   |
+------------------------------------------------------------------+
| Conversion Metrics:                                               |
| • Submitted → Vendor Review: 60% (industry: 50%)                 |
| • Vendor → Client Review: 40% (industry: 35%)                    |
| • Client Review → Interview: 67% (industry: 60%)                 |
| • Interview → Offer: 40% (industry: 35%)                         |
| • Overall Submission → Placement: 6.4% (industry: 4-5%)          |
+------------------------------------------------------------------+
| [View All Submissions] [Add Submission] [Update Status]          |
+------------------------------------------------------------------+
```

**Pipeline Stages:**
1. **Submitted**: Sent to vendor or client
2. **Vendor Review**: Vendor reviewing profile
3. **Client Review**: Client/hiring manager reviewing
4. **Interview**: Interview scheduled or completed
5. **Offer**: Offer extended, negotiating
6. **Placed**: Offer accepted, placement made

**Time:** ~1 minute to review

---

### Step 5: View Active Placements

**User Action:** Click "Placements" widget or navigate to "Placements" tab

**System Display:**

```
+------------------------------------------------------------------+
| ACTIVE PLACEMENTS (4)                                             |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Sarah Johnson @ Capital One                  Health: 🟢     │   |
| │ .NET Developer | Started: 09/22 (70 days)                   │   |
| │ Rate: $90/hr | Value: $15.6k/mo | Next Check-in: 12/22    │   |
| │ Status: Stable, client happy, on track for extension        │   |
| │ [View Details] [Log Check-In] [Update]                      │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Priya Sharma @ Google                        Health: 🟢     │   |
| │ Full Stack Dev | Started: 08/10 (113 days)                  │   |
| │ Rate: $110/hr | Value: $19.4k/mo | Next Check-in: 01/08    │   |
| │ Status: Extension confirmed - 6 months                      │   |
| │ [View Details] [Log Check-In] [Update Contract]             │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Michael Brown @ Amazon                       Health: 🟡     │   |
| │ DevOps Engineer | Started: 10/28 (34 days)                  │   |
| │ Rate: $85/hr | Value: $14.9k/mo | Next Check-in: 12/28     │   |
| │ Status: Needs attention - 30-day check-in due               │   |
| │ [View Details] [Log Check-In] [Contact]                     │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Lisa Wong @ Uber                             Health: 🟢     │   |
| │ React Developer | Started: 11/15 (16 days)                  │   |
| │ Rate: $95/hr | Value: $16.7k/mo | Next Check-in: 12/15     │   |
| │ Status: New placement, onboarding well                      │   |
| │ [View Details] [Log Check-In] [Contact]                     │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Total Monthly Value: $66.6k | Avg Health: 87.5% (Good)           |
+------------------------------------------------------------------+
```

**Placement Health Calculation:**
- 🟢 **Healthy** (80-100): All check-ins current, no issues
- 🟡 **Needs Attention** (60-79): Check-in overdue OR minor issue
- 🔴 **At Risk** (<60): Multiple issues OR client/consultant unhappy

**Time:** ~30 seconds to scan

---

### Step 6: View Immigration Alerts

**User Action:** Click "Immigration" widget or navigate to "Immigration" tab

**System Display:**

```
+------------------------------------------------------------------+
| IMMIGRATION STATUS DASHBOARD                                      |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Alert Summary                                               │   |
| │                                                             │   |
| │ 🔴 RED (1): Action required <30 days to expiry              │   |
| │ 🟠 ORANGE (3): Renewal needed 30-90 days                    │   |
| │ 🟡 YELLOW (5): Monitor 90-180 days                          │   |
| │ 🟢 GREEN (12): Good standing >180 days                      │   |
| │ ⚫ BLACK (0): Expired - NO WORK AUTHORIZED                  │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| CRITICAL ALERTS (Immediate Action Required)                       |
+------------------------------------------------------------------+
|                                                                   |
| 🔴 Maria Garcia - H1B Expires 12/28/2024 (28 days)               |
| Status: On Bench (35 days)                                        |
| Action: URGENT - File H1B extension NOW or stop marketing        |
| [Contact HR] [View Immigration Case] [Flag Unavailable]          |
|                                                                   |
+------------------------------------------------------------------+
| WARNING ALERTS (Action Needed Soon)                               |
+------------------------------------------------------------------+
|                                                                   |
| 🟠 Kevin Park - OPT EAD Expires 02/15/2025 (77 days)             |
| Status: Placed @ Facebook                                         |
| Action: Coordinate with HR for H1B sponsorship or cap-gap        |
| [View Case] [Contact HR]                                          |
|                                                                   |
| 🟠 Amit Patel - H1B Expires 03/01/2025 (91 days)                 |
| Status: On Bench (18 days)                                        |
| Action: Initiate H1B extension process                           |
| [View Case] [Contact HR]                                          |
|                                                                   |
| 🟠 Chen Wei - H4 EAD Expires 01/30/2025 (61 days)                |
| Status: Placed @ Meta                                             |
| Action: Verify H1B spouse status, renew EAD                      |
| [View Case] [Contact HR]                                          |
|                                                                   |
+------------------------------------------------------------------+
| [View All Immigration Cases] [Download Report] [Contact Attorney]|
+------------------------------------------------------------------+
```

**Immigration Alert Levels:**
- 🔴 **Red**: <30 days to expiry (URGENT)
- 🟠 **Orange**: 30-90 days (Action needed)
- 🟡 **Yellow**: 90-180 days (Monitor)
- 🟢 **Green**: >180 days (Good)
- ⚫ **Black**: Expired (Cannot work)

**Time:** ~1 minute to review

---

### Step 7: View Marketing Activity

**User Action:** Click "Marketing" widget or navigate to "Marketing" tab

**System Display:**

```
+------------------------------------------------------------------+
| MARKETING ACTIVITY                                                |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ This Week's Marketing Stats                                 │   |
| │                                                             │   |
| │ Hotlists Sent: 3 (Goal: 3) ✓                                │   |
| │ Total Recipients: 580 vendors                               │   |
| │ Email Open Rate: 42% (Industry avg: 35%)                    │   |
| │ Click Rate: 18% (Industry avg: 12%)                         │   |
| │ Response Rate: 16% (Goal: >15%) ✓                           │   |
| │                                                             │   |
| │ Vendor Calls Made: 18 (Goal: 20/week)                       │   |
| │ LinkedIn Messages: 34                                       │   |
| │ Vendor Meetings: 2                                          │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Recent Hotlists                                                   |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Java/.NET Developers - Week of 11/25                        │   |
| │ Sent: 11/25 | Recipients: 247 vendors                       │   |
| │ Consultants: 8 (Rajesh, John, David, Maria, +4)            │   |
| │                                                             │   |
| │ Performance:                                                │   |
| │ • Opened: 112 (45%)                                         │   |
| │ • Clicked: 48 (19%)                                         │   |
| │ • Responded: 22 (9%)                                        │   |
| │ • Submissions Generated: 7                                  │   |
| │ [View Details] [Resend] [Clone]                             │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ React/Frontend Developers - Week of 11/25                   │   |
| │ Sent: 11/26 | Recipients: 198 vendors                       │   |
| │ Consultants: 5 (Priya, Chen, Lisa, Emma, Sarah)            │   |
| │                                                             │   |
| │ Performance:                                                │   |
| │ • Opened: 87 (44%)                                          │   |
| │ • Clicked: 31 (16%)                                         │   |
| │ • Responded: 14 (7%)                                        │   |
| │ • Submissions Generated: 4                                  │   |
| │ [View Details] [Resend] [Clone]                             │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| [Create New Hotlist] [View All Campaigns] [Marketing Report]     |
+------------------------------------------------------------------+
```

**Marketing Metrics:**
- **Open Rate**: % of recipients who opened email
- **Click Rate**: % who clicked consultant profiles
- **Response Rate**: % who replied or submitted
- **Submission Conversion**: Responses that became actual submissions

**Time:** ~1 minute to review

---

### Step 8: Review Revenue and Commission

**User Action:** Click "Revenue" widget or navigate to "Commission" tab

**System Display:**

```
+------------------------------------------------------------------+
| REVENUE & COMMISSION DASHBOARD                                    |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ November 2024 Financial Summary                             │   |
| │                                                             │   |
| │ Total Placement Revenue: $66,600/month                      │   |
| │ • 4 active placements (all C2C or vendor)                   │   |
| │ • Average bill rate: $95/hr                                 │   |
| │ • Total hours billed: 700 hrs/month                         │   |
| │                                                             │   |
| │ Gross Margin: $15,600/month (23.4%)                         │   |
| │ Vendor Commission: $2,840/month (4.3%)                      │   |
| │ Net Margin: $12,760/month (19.1%)                           │   |
| │                                                             │   |
| │ Year-to-Date:                                               │   |
| │ • Total Revenue: $598k                                      │   |
| │ • Total Placements: 14                                      │   |
| │ • Avg Placement Duration: 4.2 months                        │   |
| │ • Retention Rate: 86% (12/14 completed contracts)           │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Personal Commission Tracker (if applicable)                       |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Your Earnings - November 2024                               │   |
| │                                                             │   |
| │ Base Salary: $5,000/month                                   │   |
| │                                                             │   |
| │ Commission Earned:                                          │   |
| │ • Placement Bonus (1 placement): $1,000                     │   |
| │ • Margin Share (4 active): $2,300                           │   |
| │ • Sprint Bonus (0/1 goal): $0                               │   |
| │                                                             │   |
| │ Total November Compensation: $8,300                         │   |
| │                                                             │   |
| │ Year-to-Date: $87,400 (on track for $105k annual)           │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| [View Detailed Breakdown] [Export Report] [Contact Finance]      |
+------------------------------------------------------------------+
```

**Revenue Tracking:**
- **Placement Revenue**: Total monthly billing from active placements
- **Gross Margin**: Revenue minus consultant pay
- **Vendor Commission**: Payment to third-party vendors
- **Net Margin**: Gross margin minus vendor commission

**Time:** ~1 minute to review

---

### Step 9: Customize Dashboard Widgets

**User Action:** Click "Settings ⚙" icon on dashboard

**System Response:**
- Opens dashboard customization panel
- Allows user to show/hide widgets
- Adjust layout and order

**Customization Panel:**

```
+------------------------------------------------------------------+
|  Customize Dashboard                                         [×]  |
+------------------------------------------------------------------+
| Select which widgets to display and arrange layout               |
+------------------------------------------------------------------+
|                                                                   |
| Visible Widgets:                                                  |
| ☑ Today's Priorities                                             |
| ☑ Bench Health Overview                                          |
| ☑ Performance Metrics                                            |
| ☑ My Bench Consultants                                           |
| ☑ Submission Pipeline                                            |
| ☑ Active Placements                                              |
| ☑ Immigration Alerts                                             |
| ☑ Marketing Activity                                             |
| ☑ Revenue & Commission                                           |
| ☐ Vendor Bench (imported consultants)                            |
| ☐ External Jobs Feed                                             |
| ☐ Team Leaderboard                                               |
|                                                                   |
| Widget Layout:                                                    |
| ● Single Column (default)                                        |
| ○ Two Column                                                     |
| ○ Grid (3 columns)                                               |
|                                                                   |
| Auto-Refresh:                                                     |
| ● Every 5 minutes                                                |
| ○ Every 15 minutes                                               |
| ○ Manual only                                                    |
|                                                                   |
| Default View:                                                     |
| ● Dashboard Overview (default)                                   |
| ○ My Consultants List                                            |
| ○ Submissions Pipeline                                           |
| ○ Placements                                                     |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Reset to Default]  [Save →]  |
+------------------------------------------------------------------+
```

**User Action:** Click "Save →"

**System Response:**
1. Saves user preferences
2. Reloads dashboard with new layout
3. Toast: "Dashboard preferences saved ✓"

**Time:** ~1-2 minutes

---

## Field Specifications

### Dashboard Widgets

| Widget | Data Source | Refresh Rate | User Action |
|--------|-------------|--------------|-------------|
| Today's Priorities | Tasks, alerts, deadlines | Real-time | Click to open task |
| Bench Health | Consultant bench data | Every 5 min | Drill down to details |
| Performance Metrics | KPIs, goals | Daily | View report |
| Bench Consultants | Consultant profiles | Every 5 min | Quick actions |
| Submission Pipeline | Submission records | Real-time | Update status |
| Active Placements | Placement records | Real-time | Log check-in |
| Immigration Alerts | Visa expiry dates | Daily | View case |
| Marketing Activity | Hotlist campaigns | Hourly | View analytics |
| Revenue & Commission | Financial data | Daily | Export report |

### Performance Metrics

| Metric | Calculation | Goal Source | Display |
|--------|-------------|-------------|---------|
| Placements | Count of placements made | User or org goal | Count + % of goal |
| Bench Submissions | Count of submissions | User or org goal | Count + % of goal |
| Vendor Submissions | Count to vendor jobs | User or org goal | Count + % of goal |
| Hotlists Sent | Count of campaigns | User or org goal | Count + % of goal |
| Marketing Response | Responses / Sent | Industry benchmark | % + trend |
| Avg Days on Bench | Mean across assigned | Org target | Days + trend |
| Bench Utilization | Bench / Total | Org target | % + trend |
| Placement Margin | Avg margin % | Org target | % + trend |
| Immigration Compliance | No violations | 100% required | % (must be 100%) |

---

## Postconditions

### Success Postconditions

1. **User informed** of current bench status
2. **Priorities identified** for the day
3. **Alerts acknowledged** and action planned
4. **Metrics reviewed** and performance tracked
5. **Dashboard preferences saved** for future sessions

### Failure Postconditions

1. **Data loading error**: Show cached data with warning
2. **Performance below goals**: Highlight gaps and suggest actions
3. **Critical alerts missed**: Send notification reminder

---

## Events Logged

| Event | Payload |
|-------|---------|
| `dashboard.viewed` | `{ user_id, timestamp, widgets_displayed }` |
| `dashboard.widget_clicked` | `{ user_id, widget_name, action_taken, timestamp }` |
| `dashboard.customized` | `{ user_id, layout_changed, widgets_toggled, timestamp }` |
| `dashboard.refreshed` | `{ user_id, manual_refresh, timestamp }` |
| `dashboard.alert_acknowledged` | `{ user_id, alert_type, alert_id, timestamp }` |

---

## Error Scenarios

| Scenario | Cause | System Response | User Action |
|----------|-------|-----------------|-------------|
| **Data loading timeout** | API slow or down | Show cached data, display warning | Refresh manually or wait |
| **Metric calculation error** | Missing data | Show "N/A", log error | Contact support if persists |
| **Widget customization fails** | Save error | Revert to previous layout | Retry save or reset |
| **Real-time updates stopped** | WebSocket disconnect | Show stale data warning | Refresh page |
| **Permission denied** | User lacks access | Hide restricted widgets | Contact admin for access |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g then d` | Go to Dashboard (home) |
| `r` | Refresh dashboard |
| `f` | Focus search/filter |
| `1`-`9` | Jump to widget 1-9 |
| `t` | View Today's Priorities |
| `c` | View My Consultants |
| `s` | View Submissions |
| `p` | View Placements |
| `i` | View Immigration |
| `m` | View Marketing |
| `?` | Show keyboard shortcuts |

---

## Alternative Flows

### A1: Manager Dashboard View

**Trigger:** User logs in as Bench Sales Manager

**Dashboard Differences:**
- Shows **team-wide metrics** instead of individual
- Includes **team leaderboard**
- Displays **all team consultants** (not just assigned)
- Shows **team performance trends**
- Includes **team scheduling calendar**
- Highlights **underperforming team members** needing coaching

**Additional Widgets:**
- Team Performance Summary
- Individual Rep Scorecards
- Team Sprint Progress
- Bench Capacity Planning
- Team Activity Feed

### A2: Mobile Dashboard View

**Trigger:** User accesses dashboard from mobile device

**Dashboard Adaptations:**
- **Simplified layout**: Single column, vertically scrollable
- **Priority-first**: Urgent tasks at top
- **Condensed metrics**: Key numbers only, minimal charts
- **Touch-optimized**: Larger buttons, swipe gestures
- **Offline mode**: Cached data available without connection
- **Quick actions**: One-tap call, email, log activity

**Mobile-Specific Features:**
- Push notifications for critical alerts
- Voice-to-text for logging activities
- GPS-based location tagging for in-person meetings
- Camera integration for document uploads

### A3: Executive Summary Dashboard

**Trigger:** Executive (CEO, COO, Regional Director) views bench operations

**Dashboard Differences:**
- **High-level only**: No granular task details
- **Aggregated metrics**: Org-wide, not individual
- **Financial focus**: Revenue, margins, forecasts
- **Trend analysis**: Month-over-month, year-over-year
- **Strategic indicators**: Bench utilization, placement velocity, retention

**Key Widgets:**
- Organization Bench Utilization Trend
- Revenue Forecast vs Actual
- Placement Volume by Division
- Top Performing Reps
- Risk Dashboard (at-risk placements)

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Goal Values | Must be numeric >0 | "Goal must be a positive number" |
| Date Filters | Start ≤ End | "Start date must be before end date" |
| Widget Selection | At least 1 widget | "Select at least one widget to display" |
| Refresh Rate | 1-60 minutes | "Refresh rate must be between 1-60 minutes" |

---

## Business Rules

### Dashboard Refresh

- **Auto-refresh**: Every 5 minutes (configurable)
- **Manual refresh**: On-demand via button
- **Real-time updates**: For critical alerts (via WebSocket)
- **Cache duration**: 15 minutes (fallback if API down)

### Alert Priority

| Alert Type | Priority | Notification | Persistence |
|------------|----------|--------------|-------------|
| Immigration <30 days | 🔴 Critical | Email + Dashboard | Until resolved |
| Check-in overdue | 🟡 High | Dashboard only | Until completed |
| Submission follow-up | 🟢 Normal | Dashboard only | 7 days |
| Hotlist reminder | 🟢 Normal | Dashboard only | Until sent |

### Performance Color Coding

| % of Goal | Color | Interpretation |
|-----------|-------|----------------|
| ≥100% | 🟢 Green | On track or exceeding |
| 80-99% | 🟡 Yellow | Close, needs push |
| <80% | 🔴 Red | Behind, action needed |

### Data Visibility

- **Own data**: Always visible
- **Team data**: Visible to managers only
- **Org data**: Visible to executives only
- **Sensitive data**: Redacted based on permissions

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [21-bench-reports.md](./21-bench-reports.md) - Detailed reporting
- [19-post-placement.md](./19-post-placement.md) - Placement check-ins
- [16-vendor-commission.md](./16-vendor-commission.md) - Commission tracking
- [08-track-immigration.md](./08-track-immigration.md) - Immigration monitoring

---

*Last Updated: 2024-11-30*
