# Use Case: Manage Strategic Client Relationships

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EXEC-004 |
| Actor | CEO / COO / CRO |
| Goal | Maintain executive-level relationships with strategic clients and ensure account health |
| Frequency | Weekly (review), Monthly (executive sponsor calls), Quarterly (QBRs) |
| Estimated Time | 2-4 hours per week |
| Priority | High |

---

## Preconditions

1. User is logged in as Executive with strategic account access
2. Strategic accounts identified and flagged in system
3. Account health metrics calculated and up-to-date
4. Client engagement history accessible
5. Revenue and contract data available

---

## Trigger

One of the following:
- Weekly strategic account review (Monday morning)
- Quarterly Business Review (QBR) scheduled
- Client escalation requiring executive intervention
- Contract renewal approaching (90-day window)
- NPS score drop detected
- Client executive relationship touchpoint due
- Major business opportunity identified

---

## Main Flow: Weekly Strategic Account Review

### Step 1: Navigate to Strategic Accounts Dashboard

**User Action:** Navigate to `/executive/strategic-accounts` or click "Strategic Accounts" from executive menu

**System Response:**
- Loads strategic accounts dashboard
- Shows portfolio of top-tier clients (typically top 20-30)
- Color-coded health indicators
- Alerts for accounts needing attention

**Screen State:**
```
+-------------------------------------------------------------------------+
| STRATEGIC ACCOUNTS PORTFOLIO                      [🔔 4]  [⚙]  [👤 CEO]|
+-------------------------------------------------------------------------+
| [Portfolio View] [Account Health] [Renewals] [QBR Calendar] [Reports]  |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ PORTFOLIO SUMMARY ────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Total Strategic Accounts: 24                                        │ |
| │ Combined ARR:             $28.5M  (65% of total company revenue)    │ |
| │ Avg Account Size:         $1.19M                                    │ |
| │                                                                     │ |
| │ Health Status:                                                      │ |
| │   🟢 Healthy:     16 accounts  (67%)  $19.2M ARR                    │ |
| │   🟡 At Risk:     6 accounts   (25%)  $7.1M ARR  ⚠️                 │ |
| │   🔴 Critical:    2 accounts   (8%)   $2.2M ARR  🚨 Urgent          │ |
| │                                                                     │ |
| │ Contract Status:                                                    │ |
| │   Renewing in 90 days:   5 accounts   $6.8M at stake               │ |
| │   Expansion opportunity: 8 accounts   $4.2M potential               │ |
| │   Recently renewed:      3 accounts   $3.5M secured  ✅             │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ EXECUTIVE ACTIONS NEEDED ─────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 🔴 URGENT (2)                                                       │ |
| │   • ABC Technologies - Escalation, churn risk, $500K ARR            │ |
| │     Last executive touch: 45 days ago  [Schedule Call] [View]      │ |
| │                                                                     │ |
| │   • MegaCorp - Contract renewal in 30 days, negotiation stalled    │ |
| │     Last executive touch: 60 days ago  [Schedule Call] [View]      │ |
| │                                                                     │ |
| │ 🟡 ATTENTION NEEDED (6)                                             │ |
| │   • TechStart Inc - NPS dropped from 85 to 62                       │ |
| │   • GlobalCo - No executive touchpoint in 90 days (overdue)         │ |
| │   • InnovateCorp - Expansion discussion pending executive approval  │ |
| │   • DataSystems - QBR scheduled Dec 15 (prep needed)                │ |
| │   • CloudServices - 3 placements failed, quality concerns           │ |
| │   • EnterpriseHQ - New CEO appointed, relationship reset needed     │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~30 seconds

---

### Step 2: Review Top-Risk Account (ABC Technologies)

**User Action:** Click on "ABC Technologies" critical account

**System Response:**
- Opens detailed account health view
- Shows comprehensive account history
- Timeline of engagement
- Risk factors and recommendations
- Quick action buttons

**Screen State:**
```
+-------------------------------------------------------------------------+
| 🔴 ABC TECHNOLOGIES - ACCOUNT HEALTH DASHBOARD                  [Close] |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ ACCOUNT OVERVIEW ─────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Account ID:        ACC-001                                          │ |
| │ Industry:          Technology / SaaS                                │ |
| │ Size:              5,000 employees                                  │ |
| │ HQ Location:       San Francisco, CA                                │ |
| │                                                                     │ |
| │ Relationship:                                                       │ |
| │   Start Date:      Jan 2022 (46 months)                             │ |
| │   Account Manager: Sarah Chen                                       │ |
| │   Executive Sponsor: CEO (You)                                      │ |
| │                                                                     │ |
| │ Financial:                                                          │ |
| │   Current ARR:     $500,000                                         │ |
| │   Lifetime Value:  $1.8M (cumulative)                               │ |
| │   YoY Growth:      -15%  🔴 Declining                               │ |
| │   Contract End:    March 31, 2026 (120 days)                        │ |
| │   Renewal Probability: 35%  🔴 At high risk of churn                │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ HEALTH SCORE BREAKDOWN ───────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Overall Health: 32/100  🔴 CRITICAL                                 │ |
| │                                                                     │ |
| │ Component Scores:                                                   │ |
| │                                                                     │ |
| │ Engagement:          45/100  🔴                                     │ |
| │ ███████████░░░░░░░░░░░░░░░░░░░░                                    │ |
| │   • Last executive call: 45 days ago (target: 30 days)              │ |
| │   • Client responsiveness: Slow (avg 48hr response)                 │ |
| │   • Meeting attendance: 60% (down from 95%)                         │ |
| │                                                                     │ |
| │ Satisfaction:        28/100  🔴                                     │ |
| │ ██████░░░░░░░░░░░░░░░░░░░░░░░░░                                    │ |
| │   • NPS Score: 15 (was 75 six months ago)  🔴                       │ |
| │   • Client escalations: 3 in last month                             │ |
| │   • Complaint rate: High                                            │ |
| │                                                                     │ |
| │ Product Usage:       65/100  🟡                                     │ |
| │ █████████████████████░░░░░░░░░░                                    │ |
| │   • Active jobs: 12 (was 18 six months ago)                         │ |
| │   • Placement velocity: Stable                                      │ |
| │   • Feature adoption: Moderate                                      │ |
| │                                                                     │ |
| │ Financial Health:    25/100  🔴                                     │ |
| │ ████████░░░░░░░░░░░░░░░░░░░░░░░                                    │ |
| │   • Payment delays: 2 invoices >45 days                             │ |
| │   • Budget cuts: Reduced hiring budget 30%                          │ |
| │   • Spend trend: ↘ -15% YoY                                         │ |
| │                                                                     │ |
| │ Outcomes/Success:    18/100  🔴                                     │ |
| │ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░                                    │ |
| │   • Placement success: 3 failures in last 2 months                  │ |
| │   • Time-to-fill: 45 days (target was 30 days)                      │ |
| │   • Falloff rate: 12% (industry avg: 4%)                            │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ CRITICAL ISSUES ──────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. Quality Concerns (High Priority)                                 │ |
| │    • 3 placements failed within 90 days                             │ |
| │    • Client CEO expressed frustration in last call                  │ |
| │    • Damage to relationship trust                                   │ |
| │    Impact: Jeopardizes $500K renewal                                │ |
| │                                                                     │ |
| │ 2. Slow Time-to-Fill (High Priority)                                │ |
| │    • Avg 45 days vs 30-day SLA commitment                           │ |
| │    • Missed hiring targets causing client pain                      │ |
| │    • Client exploring competitors                                   │ |
| │    Impact: Competitive vulnerability                                │ |
| │                                                                     │ |
| │ 3. Executive Relationship Gap (Medium Priority)                     │ |
| │    • Last executive sponsor call: 45 days ago                       │ |
| │    • Client CEO feeling neglected                                   │ |
| │    • Loss of strategic alignment                                    │ |
| │    Impact: Erosion of executive-level buy-in                        │ |
| │                                                                     │ |
| │ 4. Budget Pressure (Medium Priority)                                │ |
| │    • Client facing budget cuts (tech downturn)                      │ |
| │    • Reduced hiring by 30%                                          │ |
| │    • May consolidate to single vendor                               │ |
| │    Impact: Revenue reduction or complete churn                      │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ ENGAGEMENT TIMELINE ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Nov 15  🔴 Client CEO sends complaint email to Sarah Chen           │ |
| │ Nov 18  📞 Sarah escalates to Recruiting Manager (Tom Davis)        │ |
| │ Nov 22  📧 Tom sends apology + recovery plan email                  │ |
| │ Nov 25  🚨 Client CEO threatens to explore alternatives             │ |
| │ Nov 28  📋 Escalated to Executive (you) - Action needed             │ |
| │                                                                     │ |
| │ Last Positive Interaction:                                          │ |
| │ Oct 10  ✅ Executive sponsor QBR - went well, NPS was 65            │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ AI RECOMMENDATIONS ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Immediate Actions (Next 48 Hours):                                  │ |
| │ 1. 📞 Executive call to Client CEO                                  │ |
| │    • Acknowledge issues, express commitment                         │ |
| │    • Listen to concerns, take ownership                             │ |
| │    • Outline recovery plan                                          │ |
| │                                                                     │ |
| │ 2. 👤 Assign top-performing recruiter to account                    │ |
| │    • Recommended: Michael Torres (100% placement success)           │ |
| │    • Dedicated resource for next 90 days                            │ |
| │                                                                     │ |
| │ 3. 💰 Offer service credits / concession                            │ |
| │    • Suggest: $50K credit (10% ARR) as goodwill                     │ |
| │    • Shows commitment to making things right                        │ |
| │                                                                     │ |
| │ Short-Term (Next 2 Weeks):                                          │ |
| │ 4. 🎯 Implement enhanced SLA for this account                       │ |
| │    • Time-to-fill target: 21 days (vs standard 30)                  │ |
| │    • Daily status updates to client                                 │ |
| │                                                                     │ |
| │ 5. 📊 Weekly executive sponsor check-ins                            │ |
| │    • Every Friday for next 8 weeks                                  │ |
| │    • Progress updates, relationship rebuilding                      │ |
| │                                                                     │ |
| │ Long-Term (Next 90 Days):                                           │ |
| │ 6. 🔄 Process audit and optimization                                │ |
| │    • Review matching algorithm for this client                      │ |
| │    • Understand client culture fit requirements better              │ |
| │                                                                     │ |
| │ 7. 🤝 Strategic partnership discussion                              │ |
| │    • Explore deeper integration (exclusive partnership)             │ |
| │    • Value-add services beyond staffing                             │ |
| │                                                                     │ |
| │ Success Metrics (90-Day Recovery Plan):                             │ |
| │ • Health Score: 32 → 75+                                            │ |
| │ • NPS: 15 → 65+                                                     │ |
| │ • Time-to-Fill: 45 days → 21 days                                   │ |
| │ • Placement Success: 100% (no falloffs)                             │ |
| │ • Contract Renewal: Secured by Feb 15                               │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ QUICK ACTIONS ────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ [Schedule Executive Call]  [Assign Top Recruiter]  [Send Message]  │ |
| │ [Offer Service Credit]  [Create Recovery Plan]  [View Full History]│ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| Executive Notes:                                                        |
| [This is our 3rd largest account. Cannot afford to lose them.          |
| Will personally own the recovery. Schedule call tomorrow.         ]     |
|                                                                         |
|                      [Save Notes]  [Acknowledge]  [Escalate Further]   |
+-------------------------------------------------------------------------+
```

**Time:** ~5 minutes (review account details)

---

### Step 3: Take Action - Schedule Executive Call

**User Action:** Click "Schedule Executive Call" button

**System Response:**
- Opens scheduling modal
- Shows client CEO's calendar (if integrated)
- Suggests optimal time slots
- Pre-populates call agenda based on issues

**Screen State:**
```
+-------------------------------------------------------------------------+
| SCHEDULE EXECUTIVE SPONSOR CALL                                    [×]  |
+-------------------------------------------------------------------------+
|                                                                         |
| Account: ABC Technologies                                               |
| Client Contact: John Smith, CEO                                         |
| Client Email: john.smith@abctech.com                                    |
|                                                                         |
| ┌─ SUGGESTED TIME SLOTS ─────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Based on both calendars, here are the best options:                │ |
| │                                                                     │ |
| │ ○ Tomorrow, Dec 1 @ 2:00 PM PST (1 hour)  ⭐ RECOMMENDED           │ |
| │ ○ Dec 2 @ 10:00 AM PST (1 hour)                                    │ |
| │ ○ Dec 2 @ 3:30 PM PST (1 hour)                                     │ |
| │ ○ Dec 5 @ 9:00 AM PST (1 hour)                                     │ |
| │                                                                     │ |
| │ [Custom Date/Time]                                                  │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ CALL DETAILS ─────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Meeting Type:  [Video Call ▼]                                       │ |
| │ Duration:      [60 minutes ▼]                                       │ |
| │                                                                     │ |
| │ Attendees:                                                          │ |
| │ From InTime:   [×] You (CEO)                                        │ |
| │                [ ] Sarah Chen (Account Manager)                     │ |
| │                [ ] Tom Davis (Recruiting Manager)                   │ |
| │                                                                     │ |
| │ From Client:   [×] John Smith (CEO)                                 │ |
| │                [ ] + Add attendees                                  │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ AGENDA (AI-GENERATED) ────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Subject: Strategic Partnership Review & Path Forward                │ |
| │                                                                     │ |
| │ Agenda:                                                             │ |
| │ 1. Opening & Acknowledgment (5 min)                                 │ |
| │    - Acknowledge recent service issues                              │ |
| │    - Express commitment to partnership                              │ |
| │                                                                     │ |
| │ 2. Listen & Understand (15 min)                                     │ |
| │    - Hear client's concerns and frustrations                        │ |
| │    - Understand business impact                                     │ |
| │    - Identify gaps in expectations vs delivery                      │ |
| │                                                                     │ |
| │ 3. Recovery Plan Presentation (20 min)                              │ |
| │    - Dedicated top-tier recruiter assignment                        │ |
| │    - Enhanced SLA (21-day time-to-fill)                             │ |
| │    - Weekly executive check-ins                                     │ |
| │    - $50K service credit as goodwill gesture                        │ |
| │                                                                     │ |
| │ 4. Strategic Partnership Discussion (15 min)                        │ |
| │    - Explore deeper collaboration opportunities                     │ |
| │    - Discuss contract renewal and expansion                         │ |
| │    - Align on long-term goals                                       │ |
| │                                                                     │ |
| │ 5. Next Steps & Commitments (5 min)                                 │ |
| │    - Agree on success metrics                                       │ |
| │    - Schedule follow-up touchpoints                                 │ |
| │    - Clear action items and owners                                  │ |
| │                                                                     │ |
| │ [Edit Agenda]                                                       │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| Calendar Invitation Message:                                            |
| [Hi John,                                                               |
|                                                                         |
| I'd like to personally connect with you to discuss our partnership      |
| and address the recent service challenges you've experienced.           |
|                                                                         |
| I'm committed to ensuring ABC Technologies receives the exceptional     |
| service you deserve, and I'd like to share our recovery plan and        |
| hear your thoughts on how we can strengthen our partnership.            |
|                                                                         |
| Looking forward to speaking with you.                                   |
|                                                                         |
| Best regards,                                                           |
| [Your Name]                                                       ]     |
|                                                                         |
|                                      [Cancel]  [Send Invitation]        |
+-------------------------------------------------------------------------+
```

**User Action:** Select "Tomorrow, Dec 1 @ 2:00 PM PST", click "Send Invitation"

**System Response:**
- Calendar invitation sent to client CEO
- Event added to your calendar
- Prep tasks automatically created:
  - Review account history (1 hour before call)
  - Brief from Account Manager Sarah Chen (30 min before)
  - Recovery plan document prepared
- Notification sent to Sarah Chen (Account Manager) to brief you
- Activity logged in account timeline
- Toast: "Call scheduled for Dec 1 at 2:00 PM. Prep tasks created."

**Time:** ~3 minutes

---

### Step 4: Assign Top Recruiter to Account

**User Action:** Click "Assign Top Recruiter" button

**System Response:**
- Shows list of top-performing recruiters
- Highlights recommended recruiter (Michael Torres)
- Shows current workload and availability

**Screen State:**
```
+-------------------------------------------------------------------------+
| ASSIGN DEDICATED RECRUITER                                         [×]  |
+-------------------------------------------------------------------------+
|                                                                         |
| Account: ABC Technologies                                               |
| Assignment Duration: [90 days ▼]                                        |
| Assignment Type: [Dedicated Resource ▼]                                 |
|                                                                         |
| ┌─ RECOMMENDED RECRUITER ────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ ⭐ BEST MATCH                                                       │ |
| │                                                                     │ |
| │ Michael Torres - Senior Recruiter                                   │ |
| │                                                                     │ |
| │ Performance Stats (Last 6 Months):                                  │ |
| │ • Placements:           42  (Top 5% of team)                        │ |
| │ • Success Rate:         100% (No falloffs)  ⭐                       │ |
| │ • Avg Time-to-Fill:     22 days (vs 32 avg)                         │ |
| │ • Client Satisfaction:  9.4/10                                      │ |
| │ • Tech Industry Exp:    8 years                                     │ |
| │                                                                     │ |
| │ Current Workload:                                                   │ |
| │ • Active Jobs:          8                                           │ |
| │ • Capacity:             70% (has room for dedicated account)        │ |
| │ • Availability:         Immediate                                   │ |
| │                                                                     │ |
| │ Why Recommended:                                                    │ |
| │ ✓ Perfect track record (100% success rate)                          │ |
| │ ✓ Fastest time-to-fill on team                                      │ |
| │ ✓ Tech industry specialist (matches client)                         │ |
| │ ✓ Available capacity for dedicated focus                            │ |
| │ ✓ Strong communication skills (high NPS)                            │ |
| │                                                                     │ |
| │ [Select Michael Torres]                                             │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ OTHER OPTIONS ────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Emily Rodriguez - Senior Recruiter                                  │ |
| │ • Placements: 38, Success: 98%, TTF: 25 days                        │ |
| │ • Current Workload: 85% (may be stretched)                          │ |
| │ [View Details]                                                      │ |
| │                                                                     │ |
| │ David Kim - Recruiter                                               │ |
| │ • Placements: 28, Success: 96%, TTF: 28 days                        │ |
| │ • Current Workload: 60% (good availability)                         │ |
| │ [View Details]                                                      │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| Assignment Terms:                                                       |
| • Dedicated to ABC Technologies for 90 days                             |
| • 21-day time-to-fill SLA (enhanced)                                    |
| • Daily status updates to Account Manager                               |
| • Weekly executive sponsor briefings                                    |
| • Success bonus: $5K if account health score reaches 75+               |
|                                                                         |
|                                      [Cancel]  [Assign Michael Torres] |
+-------------------------------------------------------------------------+
```

**User Action:** Click "Assign Michael Torres"

**System Response:**
- Michael Torres assigned to ABC Technologies account
- Notifications sent:
  - Michael Torres: New dedicated account assignment
  - Sarah Chen (AM): Recruiter assignment confirmed
  - Tom Davis (Recruiting Mgr): Team member assigned to critical account
- Michael's other jobs redistributed among team
- Account timeline updated
- Success bonus created in system
- Toast: "Michael Torres assigned to ABC Technologies. Assignment effective immediately."

**Time:** ~2 minutes

---

### Step 5: Review Contract Renewal Pipeline

**User Action:** Click "Renewals" tab on main Strategic Accounts dashboard

**System Response:**
- Shows all accounts with contracts renewing in next 90 days
- Renewal probability and risk factors
- Executive action items

**Screen State:**
```
+-------------------------------------------------------------------------+
| CONTRACT RENEWALS - 90 DAY PIPELINE                                     |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ RENEWALS SUMMARY ─────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Total Value at Stake:     $6.8M ARR                                 │ |
| │ Accounts Renewing:        5                                         │ |
| │                                                                     │ |
| │ Forecast:                                                           │ |
| │   High Confidence:   $4.2M  (3 accounts)  ✅ 95% renewal prob       │ |
| │   Medium Risk:       $1.8M  (1 account)   🟡 70% renewal prob       │ |
| │   High Risk:         $800K  (1 account)   🔴 35% renewal prob       │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ RENEWALS BY QUARTER ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Account Name      ARR      Renewal Date  Prob    Health  Action    │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Q1 2026 (Jan - Mar)                                                 │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ TechStart Inc     $1.2M    Jan 31, 2026  95% ✅  85      Auto      │ |
| │ Likely renewal. Strong relationship, high satisfaction.             │ |
| │ [View] [Schedule QBR]                                               │ |
| │                                                                     │ |
| │ GlobalCo          $900K    Feb 15, 2026  70% 🟡  68      Call      │ |
| │ Moderate risk. No exec touchpoint in 90 days. Action needed.        │ |
| │ [View] [Schedule Call] [Send Proposal]                             │ |
| │                                                                     │ |
| │ InnovateCorp      $1.5M    Feb 28, 2026  98% ✅  92      Expand    │ |
| │ Excellent relationship. Expansion opportunity +$500K.               │ |
| │ [View] [Expansion Proposal]                                         │ |
| │                                                                     │ |
| │ ABC Technologies  $500K    Mar 31, 2026  35% 🔴  32      Urgent    │ |
| │ HIGH RISK. Service issues. Recovery plan in progress.               │ |
| │ [View] [Recovery Dashboard]                                         │ |
| │                                                                     │ |
| │ DataSystems       $1.7M    Mar 15, 2026  92% ✅  78      QBR       │ |
| │ Strong partnership. QBR scheduled Dec 15.                           │ |
| │ [View] [QBR Prep]                                                   │ |
| │                                                                     │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Q1 Total          $5.8M                  83% avg                    │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ RENEWAL ACTIONS ──────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 🔴 URGENT                                                           │ |
| │ • ABC Technologies: Execute recovery plan, secure renewal           │ |
| │                                                                     │ |
| │ 🟡 THIS WEEK                                                        │ |
| │ • GlobalCo: Schedule executive touchpoint (overdue)                 │ |
| │ • InnovateCorp: Prepare expansion proposal (+$500K opportunity)     │ |
| │                                                                     │ |
| │ ✅ ON TRACK                                                         │ |
| │ • TechStart Inc: Automated renewal in progress                      │ |
| │ • DataSystems: QBR prep for Dec 15                                  │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Export Renewal Forecast] [Schedule Renewal Calls] [Risk Report]       |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 6: Conduct Quarterly Business Review (QBR)

**User Action:** Click "QBR Prep" for DataSystems account

**System Response:**
- Opens QBR preparation dashboard
- Auto-generates QBR deck from account data
- Shows talking points and metrics

**Screen State:**
```
+-------------------------------------------------------------------------+
| QBR PREPARATION - DataSystems                                     [×]   |
+-------------------------------------------------------------------------+
|                                                                         |
| QBR Details:                                                            |
| • Date: December 15, 2025 @ 10:00 AM PST                                |
| • Duration: 90 minutes                                                  |
| • Location: Virtual (Zoom)                                              |
| • Attendees:                                                            |
|   - InTime: You (CEO), Sarah Chen (AM), Tom Davis (Rec Mgr)             |
|   - Client: Jennifer Wu (CTO), Mark Johnson (VP HR), 2 others           |
|                                                                         |
| ┌─ QBR AGENDA ───────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. Welcome & Introductions (5 min)                                  │ |
| │ 2. Partnership Overview (10 min)                                    │ |
| │    - Relationship timeline                                          │ |
| │    - Strategic value delivered                                      │ |
| │                                                                     │ |
| │ 3. Q4 Performance Review (30 min)                                   │ |
| │    - Placements & hiring metrics                                    │ |
| │    - Time-to-fill performance                                       │ |
| │    - Quality & retention metrics                                    │ |
| │    - Cost savings achieved                                          │ |
| │                                                                     │ |
| │ 4. Success Stories & Case Studies (15 min)                          │ |
| │    - Notable placements                                             │ |
| │    - Impact on client's business                                    │ |
| │                                                                     │ |
| │ 5. Q1 2026 Planning & Roadmap (20 min)                              │ |
| │    - Anticipated hiring needs                                       │ |
| │    - New services & capabilities                                    │ |
| │    - Strategic initiatives                                          │ |
| │                                                                     │ |
| │ 6. Feedback & Improvement Areas (5 min)                             │ |
| │    - Client satisfaction survey results                             │ |
| │    - Areas for improvement                                          │ |
| │                                                                     │ |
| │ 7. Contract Renewal Discussion (10 min)                             │ |
| │    - Review renewal terms                                           │ |
| │    - Expansion opportunities                                        │ |
| │                                                                     │ |
| │ 8. Q&A & Next Steps (5 min)                                         │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ KEY METRICS TO PRESENT ───────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Q4 2025 Performance:                                                │ |
| │ • Placements:           28  (vs 24 target)  ✅ +17%                 │ |
| │ • Avg Time-to-Fill:     26 days  (vs 30 SLA)  ✅ 13% faster        │ |
| │ • Placement Success:    96%  (vs 95% target)  ✅                    │ |
| │ • Client NPS:           78  (vs 70 target)  ✅                      │ |
| │ • Cost Savings:         $450K  (vs market rates)                    │ |
| │                                                                     │ |
| │ Year-to-Date:                                                       │ |
| │ • Total Placements:     98  (↗ +22% vs 2024)                        │ |
| │ • Total Revenue:        $1.7M                                       │ |
| │ • Retention (90-day):   96%                                         │ |
| │ • Responsiveness:       2.4 hours avg (vs 4hr SLA)  ✅              │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ SUCCESS STORIES ──────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. Senior Cloud Architect Placement                                 │ |
| │    • Filled critical role in 18 days (vs 30-day SLA)                │ |
| │    • Candidate still thriving 6 months later                        │ |
| │    • Client testimonial: "Best hire we've made this year"           │ |
| │                                                                     │ |
| │ 2. DevOps Team Build-Out                                            │ |
| │    • Helped scale DevOps team from 5 to 15 in Q3                    │ |
| │    • All 10 placements successful (0% falloff)                      │ |
| │    • Enabled client to accelerate product roadmap                   │ |
| │                                                                     │ |
| │ 3. Diversity Initiative Support                                     │ |
| │    • 42% of placements were diverse candidates                      │ |
| │    • Exceeded client's diversity goals                              │ |
| │    • Featured in client's annual DEI report                         │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ EXPANSION OPPORTUNITIES ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Based on client's growth trajectory and hiring patterns:            │ |
| │                                                                     │ |
| │ 1. Exclusive Partnership Model                                      │ |
| │    • Become sole staffing partner                                   │ |
| │    • Dedicated on-site recruiter                                    │ |
| │    • Volume discount: 15%                                           │ |
| │    • Revenue potential: +$600K/year                                 │ |
| │                                                                     │ |
| │ 2. Academy Training Partnership                                     │ |
| │    • Custom training programs for client's internal team            │ |
| │    • Upskilling existing employees                                  │ |
| │    • Revenue potential: +$200K/year                                 │ |
| │                                                                     │ |
| │ 3. Consulting Services                                              │ |
| │    • Talent strategy consulting                                     │ |
| │    • Org design support                                             │ |
| │    • Revenue potential: +$150K/year                                 │ |
| │                                                                     │ |
| │ Total Expansion Potential: +$950K (56% increase on $1.7M base)      │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Download QBR Deck (PPT)] [Send Pre-Read Email] [Start Presentation]   |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~15 minutes (QBR prep)

---

## Postconditions

1. ✅ Strategic accounts reviewed and health status assessed
2. ✅ Critical account escalations addressed with recovery plans
3. ✅ Executive sponsor calls scheduled with at-risk accounts
4. ✅ Top performers assigned to critical accounts
5. ✅ Contract renewals tracked and actions identified
6. ✅ QBRs prepared with compelling metrics and expansion proposals
7. ✅ Client relationships strengthened through executive engagement
8. ✅ Activity logged in CRM and audit trail

---

## Events Logged

| Event | Payload |
|-------|---------|
| `strategic_account.reviewed` | `{ account_id, health_score, reviewed_by, timestamp }` |
| `executive.call.scheduled` | `{ account_id, client_contact, call_date, agenda }` |
| `recruiter.assigned` | `{ account_id, recruiter_id, assignment_type, duration }` |
| `qbr.conducted` | `{ account_id, attendees[], metrics_presented, outcomes }` |
| `contract.renewal.initiated` | `{ account_id, current_arr, renewal_date, probability }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Account Data Load Failed | API timeout | "Unable to load account data" | Retry, fallback to cached data |
| Scheduling Failed | Calendar API error | "Unable to schedule call" | Manual calendar entry |
| Assignment Failed | Recruiter unavailable | "Selected recruiter not available" | Choose alternate recruiter |
| QBR Deck Generation Failed | Data missing | "Unable to generate QBR deck" | Manual deck creation |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+R` | Refresh account health data |
| `Cmd+N` | Create new executive note |
| `Cmd+S` | Schedule call with selected account |
| `Cmd+Q` | Quick view QBR calendar |
| `Esc` | Close modal/drawer |

---

## Alternative Flows

### A1: Emergency Escalation (Client CEO Angry Call)

1. Client CEO calls unexpectedly with complaint
2. Executive takes call, listens, takes notes
3. Immediately flags account as critical in system
4. Creates emergency recovery task force
5. Schedules follow-up call within 24 hours
6. Assigns executive sponsor ownership

### A2: Expansion Opportunity Identified

1. During QBR, client mentions expansion plans
2. Executive captures opportunity
3. Creates expansion deal in CRM
4. Assigns business development owner
5. Schedules proposal follow-up
6. Tracks expansion through separate pipeline

### A3: Contract Renewal Negotiation

1. Client requests pricing concession for renewal
2. Executive reviews account profitability
3. Consults with CFO on margin impact
4. Prepares counter-proposal with value justification
5. Negotiation call scheduled
6. Final terms approved and contract signed

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Executive daily routine
- [02-executive-dashboard.md](./02-executive-dashboard.md) - Dashboard monitoring
- [03-workforce-planning.md](./03-workforce-planning.md) - Workforce planning
- [05-organization-config.md](./05-organization-config.md) - Org configuration

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-SAC-001 | Load strategic accounts portfolio | All accounts load with health scores |
| TC-SAC-002 | Click critical account | Detailed health breakdown displayed |
| TC-SAC-003 | Schedule executive call | Calendar invite sent, tasks created |
| TC-SAC-004 | Assign recruiter to account | Assignment confirmed, notifications sent |
| TC-SAC-005 | Generate QBR deck | PPT deck created with accurate metrics |
| TC-SAC-006 | View renewal pipeline | All renewals show with probabilities |
| TC-SAC-007 | Health score updated | Dashboard reflects new score |

---

*Last Updated: 2025-11-30*
