# Use Case: Manage Deal Pipeline

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-SALES-003 |
| Actor | Sales Representative |
| Goal | Manage deals through sales pipeline from qualification to close |
| Frequency | 10-30 times per day |
| Estimated Time | 5-45 minutes per deal |
| Priority | High |

---

## Preconditions

1. User is logged in as Sales Representative
2. User has "deal.read" and "deal.update" permissions
3. Deals exist in system (created from qualified leads or manually)
4. User has ownership or consultation rights on deals

---

## Trigger

One of the following:
- Qualified lead needs to be converted to deal
- Existing deal requires stage progression
- Deal activity needs to be logged
- Deal needs value/probability update
- Manager requests forecast update

---

## Deal Lifecycle Stages

### Stage Definitions and Exit Criteria

```
┌────────────────────────────────────────────────────────────────────┐
│ DEAL PIPELINE STAGES                                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 1. DISCOVERY (25% probability)                                     │
│    Initial needs assessment and qualification                      │
│    Exit Criteria: Discovery call completed, needs documented       │
│    Avg. Time: 7-14 days                                            │
│                                                                     │
│ 2. QUALIFICATION (45% probability)                                 │
│    BANT validation, stakeholder mapping                            │
│    Exit Criteria: BANT score 60+, budget confirmed                 │
│    Avg. Time: 3-7 days                                             │
│                                                                     │
│ 3. PROPOSAL (65% probability)                                      │
│    Solution presentation, proposal sent                            │
│    Exit Criteria: Proposal sent, follow-up scheduled               │
│    Avg. Time: 7-14 days                                            │
│                                                                     │
│ 4. NEGOTIATION (75% probability)                                   │
│    Contract terms discussion, pricing alignment                    │
│    Exit Criteria: Agreement on rates, terms, MSA drafted           │
│    Avg. Time: 14-30 days                                           │
│                                                                     │
│ 5. LEGAL REVIEW (90% probability)                                  │
│    Contract finalization, legal approval                           │
│    Exit Criteria: Both parties' legal teams approved               │
│    Avg. Time: 7-14 days                                            │
│                                                                     │
│ 6. CLOSED-WON (100% probability)                                   │
│    Contract signed, deal won                                       │
│    Exit Criteria: MSA/SOW signed, payment terms set                │
│                                                                     │
│ 7. CLOSED-LOST (0% probability)                                    │
│    Deal did not close                                              │
│    Exit Criteria: Reason documented, post-mortem completed         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Main Flow: View Deal Pipeline

### Step 1: Navigate to Deals

**User Action:** Click "Deals" in sidebar or press `g d`

**System Response:**
- URL changes to `/employee/workspace/sales/deals`
- Deals pipeline loads (default view: Kanban)

**Screen State (Kanban View):**
```
+--------------------------------------------------------------------+
| Deals Pipeline                    [List] [●Kanban] [Forecast] [⚙]  |
+--------------------------------------------------------------------+
| [Search deals...]              [My Deals ▼] [This Quarter ▼] [All] |
+--------------------------------------------------------------------+
| Discovery    Qualification  Proposal    Negotiation  Legal Review  |
| $285K (5)    $185K (3)      $125K (2)   $95K (1)     $115K (1)     |
| Wtd: $71K    Wtd: $83K      Wtd: $81K   Wtd: $71K    Wtd: $104K    |
+--------------------------------------------------------------------+
| ┌──────────┐ ┌──────────┐  ┌─────────┐ ┌──────────┐ ┌──────────┐ |
| │GlobalTech│ │InnovateCo│  │TechCo   │ │MegaCorp  │ │Acme Corp │ |
| │          │ │          │  │         │ │          │ │          │ |
| │$180,000  │ │$320,000⚠│  │$75,000  │ │$95,000   │ │$115,000  │ |
| │25% → $45K│ │65% →$208K│  │70% →$53K│ │75% →$71K │ │90% →$104K│ |
| │          │ │          │  │         │ │          │ │          │ |
| │Dec 20    │ │Dec 15    │  │Dec 10   │ │Dec 5     │ │Dec 2 🔥  │ |
| │          │ │          │  │         │ │          │ │          │ |
| │John Doe  │ │Maria G.  │  │Jennifer │ │VP Sales  │ │John Doe  │ |
| │VP Ops    │ │HR Dir    │  │VP Eng   │ │          │ │VP Ops    │ |
| │          │ │          │  │         │ │          │ │          │ |
| │3d old    │ │NEW 🆕    │  │5d old   │ │8d old ⚠  │ │31d old   │ |
| │          │ │          │  │         │ │          │ │          │ |
| │[Open]    │ │[Open]    │  │[Open]   │ │[Open]    │ │[Open]    │ |
| └──────────┘ └──────────┘  └─────────┘ └──────────┘ └──────────┘ |
|                                                                    |
| ┌──────────┐ ┌──────────┐  ┌─────────┐             CLOSED-WON     |
| │BuildCo   │ │DataInc   │  │BizSoft  │             $450K (6)      |
| │$65,000   │ │$95,000   │  │$50,000  │             This Month     |
| │25% →$16K │ │60% →$57K │  │65% →$33K│                            |
| │Jan 15    │ │Dec 18    │  │Dec 12   │             CLOSED-LOST    |
| │Sarah K.  │ │Mike T.   │  │Lisa P.  │             $85K (2)       |
| │7d old ⚠  │ │4d old    │  │6d old   │             This Month     |
| │[Open]    │ │[Open]    │  │[Open]   │                            |
| └──────────┘ └──────────┘  └─────────┘                            |
+--------------------------------------------------------------------+
| PIPELINE SUMMARY                                                   |
| Total Pipeline: $1,115,000  |  Weighted: $410,000  |  Deals: 12    |
| Closing This Week: $210K (2 deals)  |  This Month: $285K (4 deals) |
| Quarterly Quota: $200K  |  Attainment: 142% (YTD: $284K)          |
+--------------------------------------------------------------------+
| ⚠ ATTENTION NEEDED                                                 |
| • Acme Corp ($115K) - Closes in 2 days, needs final MSA           |
| • MegaCorp ($95K) - Stale 8 days, no recent activity              |
| • BuildCo ($65K) - Stale 7 days, follow-up overdue                |
+--------------------------------------------------------------------+

LEGEND:
🔥 Closing this week    ⚠ Needs attention (stale or overdue)
🆕 New deal (created <48h)    Wtd = Weighted value (value × probability)
```

**Alternative View - List View:**

**User Action:** Click "List" view toggle

**Screen State (List View):**
```
+--------------------------------------------------------------------+
| Deals Pipeline                   [●List] [Kanban] [Forecast] [⚙]   |
+--------------------------------------------------------------------+
| [Search deals...]              [My Deals ▼] [This Quarter ▼] [All] |
+--------------------------------------------------------------------+
| Deal                Account      Stage        Value    Prob  Close |
| ─────────────────────────────────────────────────────────────────  |
| 🔥 Acme Corp        Acme Corp    Legal Rev    $115K    90%   Dec 2 |
|    Enterprise Staff              31d old                           |
|    John Doe - VP Operations      [Open →]                          |
| ─────────────────────────────────────────────────────────────────  |
| ⚠ MegaCorp Deal     MegaCorp     Negotiation  $95K     75%   Dec 5 |
|    RPO Partnership               8d old                            |
|    Tom Wilson - VP Sales         [Open →]                          |
| ─────────────────────────────────────────────────────────────────  |
| 🆕 InnovateCo Staff InnovateCo   Qualif       $320K    65%   Dec 15|
|    Engineering Team              NEW                               |
|    Maria Garcia - HR Director    [Open →]                          |
+--------------------------------------------------------------------+
```

**Time:** 1-2 seconds

---

## Use Case: Create Deal from Qualified Lead

### Step 2: Convert Lead to Deal

**Context:** Lead "InnovateCo" scored 79/100 on BANT, ready to convert

**User Action:** From lead detail page, click "Convert to Deal →"

**System Response:**
- Deal creation modal opens
- Fields pre-filled from lead data

**Screen State:**
```
+--------------------------------------------------------------------+
| Convert Lead to Deal                                           [×] |
+--------------------------------------------------------------------+
| Lead: Maria Garcia - InnovateCo Inc.                               |
| BANT Score: 79/100 (Sales Qualified Lead)                          |
+--------------------------------------------------------------------+
| DEAL DETAILS                                                       |
|                                                                    |
| Deal Title *                                                       |
| [InnovateCo - Engineering Staffing Program                      ]  |
|                                                                    |
| Deal Value * (Annual)                                              |
| [$320,000      ]                                                   |
| Auto-calculated from BANT: 8 engineers × $40K avg fee              |
|                                                                    |
| Currency                                                           |
| [USD ($) ▼]                                                        |
|                                                                    |
| Description (optional)                                             |
| [InnovateCo needs to hire 8 senior engineers (4 backend, 4     ]  |
| [frontend) to support new product launch. Timeline: First       ]  |
| [candidates by Dec 20, start dates by Jan 15, 2025.            ]  |
|                                                       ] 124/2000   |
+--------------------------------------------------------------------+
| ACCOUNT & CONTACT                                                  |
|                                                                    |
| Account                                                            |
| [ ] Use existing account: [Search accounts...             ▼]      |
| [●] Create new account: InnovateCo Inc.                           |
|                                                                    |
| Primary Contact *                                                  |
| Maria Garcia - HR Director ✓ (from lead)                          |
|                                                                    |
| Additional Contacts (optional)                                     |
| [+ Add Contact]                                                    |
+--------------------------------------------------------------------+
| PIPELINE STAGE                                                     |
|                                                                    |
| Initial Stage *                                                    |
| [Qualification ▼]                                                  |
| Recommended based on BANT completion                               |
|                                                                    |
| Options:                                                           |
| • Discovery (if BANT incomplete)                                  |
| • Qualification (if BANT 60-79) ← Recommended                     |
| • Proposal (if ready to send proposal)                            |
|                                                                    |
| Probability                                                        |
| [65% ▼]                                                            |
| Auto-calculated from BANT score (79/100 → 65% probability)        |
|                                                                    |
| Expected Close Date *                                              |
| [Dec 15, 2024 📅]                                                  |
| From BANT timeline notes (decision by Dec 15)                      |
+--------------------------------------------------------------------+
| NEXT STEPS                                                         |
|                                                                    |
| Next Action *                                                      |
| [Send capabilities deck + case studies                          ]  |
|                                                                    |
| Due Date *                                                         |
| [Dec 1, 2024 📅]                                                   |
|                                                                    |
| Additional Tasks (optional)                                        |
| [×] Schedule follow-up call     Due: [Dec 3, 2024 📅]             |
| [×] Prepare proposal            Due: [Dec 5, 2024 📅]             |
| [ ] Get manager approval        Due: [              📅]           |
+--------------------------------------------------------------------+
| ASSIGNMENT                                                         |
|                                                                    |
| Deal Owner *                                                       |
| [You - Sarah Johnson ▼]                                           |
|                                                                    |
| Deal Team (optional)                                               |
| [+ Add Team Member]                                                |
+--------------------------------------------------------------------+
| [Cancel] [Create Deal] [Create & Open →]                           |
+--------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| title | Text | Yes | Auto-suggested | Can edit |
| value | Currency | Yes | BANT notes | Annual value |
| description | Textarea | No | BANT summary | Max 2000 chars |
| accountId | Dropdown | Yes | Create new or link | From lead |
| primaryContactId | Dropdown | Yes | Lead contact | Auto-set |
| stage | Dropdown | Yes | Based on BANT | Default: Qualification |
| probability | Number | Yes | Auto-calc | Based on stage |
| expectedCloseDate | Date | Yes | BANT timeline | Can adjust |
| ownerId | Dropdown | Yes | Current user | Can reassign |

---

### Step 3: Create Deal

**User Action:** Review pre-filled data, click "Create & Open →"

**System Response:**
1. Deal record created in `deals` table
2. Account created: "InnovateCo Inc."
3. Contact linked: Maria Garcia
4. Lead status updated to "converted"
5. Lead.convertedToDealId = new deal ID
6. Lead.convertedToAccountId = new account ID
7. 3 tasks created from "Additional Tasks"
8. Activity logged: "Deal created from lead"
9. RCAI entry: User = Responsible + Accountable
10. Manager = Informed
11. User redirected to deal detail page
12. Toast: "Deal created successfully! 🎉"

**URL:** `/employee/workspace/sales/deals/[deal-id]`

**Time:** 2-3 seconds

---

## Use Case: View Deal Detail

### Step 4: Deal Detail Page

**System Response:**
- Deal detail page loads
- Shows comprehensive deal information

**Screen State (Deal Detail - Full Page):**
```
+--------------------------------------------------------------------+
| ← Back to Pipeline                               [Edit] [⋮] [Twin] |
+--------------------------------------------------------------------+
| InnovateCo - Engineering Staffing Program                          |
+--------------------------------------------------------------------+
| Stage: Qualification  │  Value: $320,000  │  Probability: 65%      |
| Expected Close: Dec 15, 2024 (14 days)    │  Age: 2 hours          |
+--------------------------------------------------------------------+
| QUICK ACTIONS                                                      |
| [📞 Call] [✉ Email] [📝 Log Activity] [📄 Proposal] [Move Stage →] |
+--------------------------------------------------------------------+
|                                                                    |
| ┌─ DEAL OVERVIEW ─────────────────────────────────────────────┐   |
| │                                                              │   |
| │ Account: InnovateCo Inc. (NEW)                              │   |
| │ Primary Contact: Maria Garcia - HR Director                 │   |
| │ Owner: Sarah Johnson (you)                                  │   |
| │ Created: Nov 30, 2024 11:45 AM                              │   |
| │ Source Lead: Maria Garcia - InnovateCo (BANT: 79/100)       │   |
| │                                                              │   |
| │ Description:                                                 │   |
| │ InnovateCo needs to hire 8 senior engineers (4 backend,    │   |
| │ 4 frontend) to support new product launch. Timeline: First  │   |
| │ candidates by Dec 20, start dates by Jan 15, 2025.          │   |
| │                                                              │   |
| └──────────────────────────────────────────────────────────────┘   |
|                                                                    |
| ┌─ PIPELINE PROGRESS ──────────────────────────────────────────┐  |
| │                                                               │  |
| │ Current Stage: QUALIFICATION (65% probability)                │  |
| │                                                               │  |
| │ Discovery → Qualification → Proposal → Negotiation → Close   │  |
| │   DONE         ● YOU ARE HERE                                 │  |
| │                                                               │  |
| │ Sales Cycle:                                                  │  |
| │ ├─ Created: Nov 30                                            │  |
| │ ├─ Discovery: (skipped - came from qualified lead)           │  |
| │ ├─ Qualification: Nov 30 (current) - Est. 3-7 days           │  |
| │ ├─ Proposal: Est. Dec 3-7                                    │  |
| │ ├─ Negotiation: Est. Dec 7-14                                │  |
| │ └─ Expected Close: Dec 15, 2024 ✓                            │  |
| │                                                               │  |
| │ Avg Sales Cycle: 45-60 days for similar deals                │  |
| │ This Deal Pace: On track (fast-tracked from qualified lead)  │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌─ DEAL VALUE & FORECAST ──────────────────────────────────────┐  |
| │                                                               │  |
| │ Annual Contract Value:  $320,000                             │  |
| │ Probability:            65%                                   │  |
| │ Weighted Value:         $208,000                             │  |
| │                                                               │  |
| │ Breakdown:                                                    │  |
| │ • 8 placements × $40,000 avg fee = $320,000                  │  |
| │                                                               │  |
| │ Expected Terms:                                               │  |
| │ • Contract Type: Master Service Agreement (MSA)              │  |
| │ • Payment Terms: Net 30                                      │  |
| │ • Guarantee: 90-day replacement                              │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌─ STAKEHOLDERS ───────────────────────────────────────────────┐  |
| │                                                               │  |
| │ Primary Contact:                                              │  |
| │ • Maria Garcia - HR Director (Decision Maker)                │  |
| │   maria.g@innovate.co | (512) 555-0148                       │  |
| │   Last Contact: Today 11:15 AM                               │  |
| │   [Email] [Call] [LinkedIn]                                  │  |
| │                                                               │  |
| │ Additional Stakeholders (from BANT):                          │  |
| │ • Tom Chen - VP Engineering (Approver)                       │  |
| │   Status: Not yet contacted  [+ Add as Contact]              │  |
| │ • Lisa Wang - HR Director (Coordinator)                      │  |
| │   Status: Not yet contacted  [+ Add as Contact]              │  |
| │ • Sarah Lee - Procurement (MSA Processing)                   │  |
| │   Status: Not yet contacted  [+ Add as Contact]              │  |
| │                                                               │  |
| │ [+ Add Stakeholder]                                           │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌─ BANT QUALIFICATION ─────────────────────────────────────────┐  |
| │                                                               │  |
| │ Total Score: 79/100 (from lead qualification)                │  |
| │                                                               │  |
| │ Budget:    [███████████████          ] 15/25  (60%)          │  |
| │ Authority: [██████████████████       ] 18/25  (72%)          │  |
| │ Need:      [██████████████████████   ] 22/25  (88%)          │  |
| │ Timeline:  [████████████████         ] 20/25  (80%)          │  |
| │                                                               │  |
| │ [View Full BANT Details →]                                    │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌─ ACTIVITY TIMELINE ──────────────────────────────────────────┐  |
| │                                                               │  |
| │ Nov 30, 11:45 AM - Deal Created                              │  |
| │ Converted from qualified lead (Maria Garcia - InnovateCo).   │  |
| │ Initial stage: Qualification. Value: $320K.                  │  |
| │ By: Sarah Johnson                                            │  |
| │                                                               │  |
| │ [+ Log Activity]                                              │  |
| │                                                               │  |
| │ ─── Activities from Lead (before conversion) ───             │  |
| │                                                               │  |
| │ Nov 29, 11:15 AM - Discovery Call (42 min)                   │  |
| │ BANT qualification completed. Score: 79/100.                 │  |
| │ [View Lead Timeline →]                                        │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌─ NEXT STEPS ─────────────────────────────────────────────────┐  |
| │                                                               │  |
| │ 🔴 HIGH PRIORITY                                              │  |
| │ Send capabilities deck + case studies                        │  |
| │ Due: Dec 1, 2024                                             │  |
| │ [Mark Complete] [Reschedule]                                 │  |
| │                                                               │  |
| │ 🟡 SCHEDULED                                                  │  |
| │ Schedule follow-up call                                      │  |
| │ Due: Dec 3, 2024                                             │  |
| │ [Mark Complete] [Reschedule]                                 │  |
| │                                                               │  |
| │ 🟢 UPCOMING                                                   │  |
| │ Prepare proposal                                             │  |
| │ Due: Dec 5, 2024                                             │  |
| │ [Mark Complete] [Reschedule]                                 │  |
| │                                                               │  |
| │ [+ Add Task]                                                  │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌─ LINKED ENTITIES ────────────────────────────────────────────┐  |
| │                                                               │  |
| │ Jobs: None yet (will be created after deal closes)           │  |
| │ Proposals: None                                               │  |
| │ Contracts: None                                               │  |
| │ Documents: 0 files                                            │  |
| │                                                               │  |
| │ [+ Link Job] [+ Create Proposal] [+ Upload Document]          │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌─ AI TWIN INSIGHTS ───────────────────────────────────────────┐  |
| │                                                               │  |
| │ 🤖 Deal Health: HEALTHY ✅                                    │  |
| │                                                               │  |
| │ Insights:                                                     │  |
| │ • Strong BANT score (79/100) - well qualified                │  |
| │ • High urgency (product launch deadline)                     │  |
| │ • Decision timeline is tight (2 weeks) - prioritize          │  |
| │                                                               │  |
| │ Recommendations:                                              │  |
| │ • Send materials today (competitor evaluation in progress)   │  |
| │ • Emphasize quality + speed (key differentiators)            │  |
| │ • Include tech company case studies (similar industry)       │  |
| │                                                               │  |
| │ Similar Deals Closed:                                         │  |
| │ • TechStartup Inc. - $180K (72 days, won)                    │  |
| │ • SaaSCo - $95K (48 days, won)                               │  |
| │ Avg Win Rate for Similar: 67%                                │  |
| │                                                               │  |
| └───────────────────────────────────────────────────────────────┘  |
|                                                                    |
+--------------------------------------------------------------------+
```

**Time:** 2-3 seconds to load

---

## Use Case: Log Deal Activity

### Step 5: Log Call Activity

**User Action:** Click "Log Activity" button

**System Response:**
- Activity log modal opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Log Activity - InnovateCo Deal                                 [×] |
+--------------------------------------------------------------------+
| Activity Type *                                                    |
| [●] Call  [ ] Email  [ ] Meeting  [ ] Note  [ ] Other             |
+--------------------------------------------------------------------+
| CALL DETAILS                                                       |
|                                                                    |
| Date & Time *                                                      |
| [Nov 30, 2024 ▼]  [2:00 PM ▼]                                     |
|                                                                    |
| Duration                                                           |
| [25] minutes                                                       |
|                                                                    |
| Contact(s) *                                                       |
| [Maria Garcia - HR Director ▼]                                    |
| [+ Add Another Contact]                                            |
|                                                                    |
| Call Outcome *                                                     |
| [●] Connected  [ ] Voicemail  [ ] No Answer  [ ] Busy             |
+--------------------------------------------------------------------+
| DISCUSSION                                                         |
|                                                                    |
| Subject                                                            |
| [Follow-up on capabilities deck                                 ]  |
|                                                                    |
| Topics Discussed (check all that apply)                            |
| [×] Pricing / Budget                                              |
| [×] Timeline / Urgency                                            |
| [ ] Technical requirements                                        |
| [×] Competitor comparison                                         |
| [×] Decision process                                              |
| [ ] Contract terms                                                |
| [×] Next steps                                                    |
|                                                                    |
| Call Notes *                                                       |
| [Maria loved the case studies, especially SaaSCo example.       ]  |
| [Confirmed they're evaluating 2 other agencies (TalentPro,     ]  |
| [StaffGenius). Our quality ratings stand out. She's scheduling ]  |
| [internal review meeting with VP Eng (Tom) for Dec 2. Wants    ]  |
| [proposal by Dec 5 to present to team. Very positive tone.     ]  |
|                                                        ] 312/2000  |
+--------------------------------------------------------------------+
| CALL OUTCOME                                                       |
|                                                                    |
| Sentiment *                                                        |
| [●] Very Positive  [ ] Positive  [ ] Neutral  [ ] Negative         |
|                                                                    |
| Buying Signals Detected                                            |
| [×] Asked about pricing / contracts                               |
| [×] Discussed timeline / urgency                                  |
| [×] Mentioned internal stakeholder meetings                       |
| [ ] Requested references                                          |
| [×] Compared favorably to competitors                             |
| [ ] Asked about onboarding / next steps                           |
+--------------------------------------------------------------------+
| NEXT ACTIONS                                                       |
|                                                                    |
| Next Action                                                        |
| [Send proposal by Dec 5                                         ]  |
|                                                                    |
| Due Date                                                           |
| [Dec 5, 2024 📅]                                                   |
|                                                                    |
| Assigned To                                                        |
| [You - Sarah Johnson ▼]                                           |
|                                                                    |
| [+ Add Another Task]                                               |
+--------------------------------------------------------------------+
| DEAL UPDATE (optional)                                             |
|                                                                    |
| Update Deal Stage?                                                 |
| [ ] Yes, move to: [Proposal ▼]                                    |
| [●] No, keep in: Qualification                                    |
|                                                                    |
| Update Probability?                                                |
| [ ] Yes, change to: [70% ▼]                                       |
| [●] No, keep at: 65%                                              |
|                                                                    |
| Update Expected Close Date?                                        |
| [ ] Yes, change to: [       📅]                                   |
| [●] No, keep: Dec 15, 2024                                        |
+--------------------------------------------------------------------+
| [Cancel] [Save Activity] [Save & Update Deal]                     |
+--------------------------------------------------------------------+
```

**User Action:** Fill in details, click "Save Activity"

**System Response:**
- Activity saved to `activity_log` table
- Activity appears in deal timeline
- Task created: "Send proposal by Dec 5"
- Deal.updatedAt timestamp updated
- Toast: "Activity logged successfully ✓"

**Time:** 3-5 minutes

---

## Use Case: Move Deal to Next Stage

### Step 6: Advance Deal Stage

**Context:** Proposal has been sent, ready to move from "Qualification" to "Proposal"

**User Action:** Click "Move Stage →" button on deal detail page

**System Response:**
- Stage progression modal opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Move Deal to Next Stage                                        [×] |
+--------------------------------------------------------------------+
| Deal: InnovateCo - Engineering Staffing Program                    |
| Current Stage: Qualification (65% probability)                     |
+--------------------------------------------------------------------+
| SELECT NEW STAGE                                                   |
|                                                                    |
| Discovery      → Qualification → Proposal → Negotiation → Close    |
|   (done)          (current)       ● MOVE HERE                      |
|                                                                    |
| [ ] Discovery (25% probability)                                    |
| [●] Qualification (65% probability) ← Current                      |
| [ ] Proposal (70% probability) ← Recommended Next                  |
| [ ] Negotiation (75% probability)                                  |
| [ ] Legal Review (90% probability)                                 |
| [ ] Closed-Won (100%)                                              |
| [ ] Closed-Lost (0%)                                               |
+--------------------------------------------------------------------+
| Moving to: PROPOSAL                                                |
|                                                                    |
| Exit Criteria Check:                                               |
| [×] BANT qualification complete (79/100) ✓                         |
| [×] Stakeholders identified ✓                                      |
| [ ] Proposal sent (required for Proposal stage)                    |
| [ ] Follow-up scheduled                                            |
|                                                                    |
| ⚠ Missing: Proposal not yet sent                                   |
|                                                                    |
| Actions:                                                           |
| [●] I confirm proposal has been sent (or will be sent today)       |
| [ ] Skip this check (not recommended)                              |
+--------------------------------------------------------------------+
| STAGE UPDATE DETAILS                                               |
|                                                                    |
| Auto-Update Probability                                            |
| Current: 65% → New: [70% ▼] (default for Proposal stage)          |
|                                                                    |
| Reason for Stage Change *                                          |
| [Proposal sent to Maria Garcia. Follow-up call scheduled for   ]  |
| [Dec 5 to review and answer questions.                          ]  |
|                                                              ] 89/500|
|                                                                    |
| Next Milestone                                                     |
| [Review proposal with client and address questions             ]  |
|                                                                    |
| Expected Stage Duration                                            |
| [7] days (avg for Proposal stage: 7-14 days)                      |
|                                                                    |
| Update Expected Close Date?                                        |
| Current: Dec 15, 2024                                              |
| [ ] Keep current date                                              |
| [●] Adjust to: [Dec 12, 2024 📅] (based on stage duration)         |
+--------------------------------------------------------------------+
| CREATE STAGE-SPECIFIC TASKS                                        |
|                                                                    |
| Recommended tasks for Proposal stage:                              |
| [×] Schedule proposal review call      Due: [Dec 5, 2024 📅]      |
| [×] Send supporting case studies       Due: [Dec 3, 2024 📅]      |
| [×] Prepare pricing alternatives       Due: [Dec 4, 2024 📅]      |
| [ ] Get manager approval (if needed)   Due: [            📅]      |
|                                                                    |
| [+ Add Custom Task]                                                |
+--------------------------------------------------------------------+
| [Cancel] [Move to Proposal]                                        |
+--------------------------------------------------------------------+
```

**User Action:** Click "Move to Proposal"

**System Response:**
- Deal.stage updated to "proposal"
- Deal.probability updated to 70%
- Deal.expectedCloseDate adjusted to Dec 12
- Activity logged: "Stage changed: Qualification → Proposal"
- 3 tasks created
- Deal detail page refreshes
- Pipeline view updated
- Toast: "Deal moved to Proposal stage ✓"

**Time:** 2-3 minutes

---

## Use Case: Update Deal Value and Probability

### Step 7: Adjust Deal Parameters

**Context:** During negotiation, deal value decreased due to client budget constraints

**User Action:** From deal detail page, click "Edit" button

**System Response:**
- Edit deal modal opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Edit Deal - InnovateCo Engineering Staffing                    [×] |
+--------------------------------------------------------------------+
| DEAL DETAILS                                                       |
|                                                                    |
| Deal Title                                                         |
| [InnovateCo - Engineering Staffing Program                      ]  |
|                                                                    |
| Deal Value *                                                       |
| [$320,000      ] → [$280,000      ]                                |
| Change: -$40,000 (-12.5%)                                          |
|                                                                    |
| Reason for Value Change *                                          |
| [Client budget reduced. Scoping down from 8 to 7 engineers.     ]  |
| [Maintaining margin %.                                          ]  |
|                                                              ] 95/500|
|                                                                    |
| Probability                                                        |
| [70% ▼] → [75% ▼]                                                  |
| Change: +5% (moving to negotiation, terms nearly agreed)           |
|                                                                    |
| Expected Close Date                                                |
| [Dec 12, 2024 📅] → [Dec 10, 2024 📅]                              |
| Change: -2 days (accelerated timeline)                             |
+--------------------------------------------------------------------+
| STAGE & OWNERSHIP                                                  |
|                                                                    |
| Stage                                                              |
| [Proposal ▼] (no change)                                          |
|                                                                    |
| Owner                                                              |
| [You - Sarah Johnson ▼] (no change)                               |
+--------------------------------------------------------------------+
| FORECAST IMPACT                                                    |
|                                                                    |
| Before:                                                            |
| Value: $320,000 × 70% = $224,000 weighted                         |
|                                                                    |
| After:                                                             |
| Value: $280,000 × 75% = $210,000 weighted                         |
|                                                                    |
| Net Change: -$14,000 weighted pipeline value                      |
+--------------------------------------------------------------------+
| NOTIFICATION                                                       |
|                                                                    |
| [×] Notify manager of value change (recommended for changes >10%) |
| [×] Log activity with change details                              |
+--------------------------------------------------------------------+
| [Cancel] [Update Deal]                                             |
+--------------------------------------------------------------------+
```

**User Action:** Click "Update Deal"

**System Response:**
- Deal.value updated to $280,000
- Deal.probability updated to 75%
- Deal.expectedCloseDate updated to Dec 10
- Activity logged: "Deal updated - Value: $320K → $280K, Probability: 70% → 75%"
- Email notification sent to manager (large value change)
- Pipeline view refreshes with new values
- Toast: "Deal updated successfully ✓"

**Time:** 2-3 minutes

---

## Use Case: Forecast View

### Step 8: View Weighted Pipeline Forecast

**User Action:** From pipeline, click "Forecast" tab

**System Response:**
- Forecast view loads with weighted calculations

**Screen State (Forecast View):**
```
+--------------------------------------------------------------------+
| Deals Forecast                   [List] [Kanban] [●Forecast] [⚙]   |
+--------------------------------------------------------------------+
| Period: [This Quarter ▼]          Owner: [My Deals ▼]              |
+--------------------------------------------------------------------+
| QUARTERLY FORECAST SUMMARY (Q4 2024)                               |
+--------------------------------------------------------------------+
| Quota:           $200,000                                          |
| Closed YTD:      $284,000 (142% of quota) ✅                       |
| Pipeline:        $1,115,000 (12 active deals)                      |
| Weighted:        $410,000 (expected value based on probability)    |
| Forecast:        $484,000 (Closed YTD + High-prob deals)           |
| Attainment:      242% (Exceeds quota) 🎉                           |
+--------------------------------------------------------------------+
| DEALS BY CLOSE DATE                                                |
+--------------------------------------------------------------------+
| THIS WEEK (Dec 2-6)                           2 deals  |  $210,000 |
| ─────────────────────────────────────────────────────────────────  |
| Dec 2  Acme Corp         $115K    90%   Weighted: $104K    🔥      |
| Dec 5  MegaCorp          $95K     75%   Weighted: $71K     🔥      |
|                                          Total Weighted: $175K     |
+--------------------------------------------------------------------+
| THIS MONTH (Dec 7-31)                         2 deals  |  $155,000 |
| ─────────────────────────────────────────────────────────────────  |
| Dec 10 InnovateCo        $280K    75%   Weighted: $210K            |
| Dec 12 TechCo            $75K     70%   Weighted: $53K             |
|                                          Total Weighted: $263K     |
+--------------------------------------------------------------------+
| NEXT MONTH (Jan 2025)                         3 deals  |  $210,000 |
| ─────────────────────────────────────────────────────────────────  |
| Jan 15 BuildCo           $65K     25%   Weighted: $16K             |
| Jan 20 DataInc           $95K     60%   Weighted: $57K             |
| Jan 25 BizSoft           $50K     65%   Weighted: $33K             |
|                                          Total Weighted: $106K     |
+--------------------------------------------------------------------+
| PROBABILITY DISTRIBUTION                                           |
+--------------------------------------------------------------------+
| High Confidence (75-100%):   4 deals  |  $565K  |  Wtd: $454K      |
| Medium Confidence (50-74%):  3 deals  |  $405K  |  Wtd: $253K      |
| Low Confidence (25-49%):     3 deals  |  $210K  |  Wtd: $68K       |
| Early Stage (0-24%):         2 deals  |  $220K  |  Wtd: $44K       |
+--------------------------------------------------------------------+
| RISK ANALYSIS                                                      |
+--------------------------------------------------------------------+
| ✅ LOW RISK                                                        |
| • Quota already exceeded (142%)                                   |
| • Strong pipeline (5.5x quota)                                    |
| • High-probability deals sufficient to hit 200% quota             |
|                                                                    |
| ⚠ ATTENTION NEEDED                                                 |
| • 3 deals stale (no activity >5 days) - risk of slipping         |
| • 2 deals closing this week - need to execute flawlessly          |
+--------------------------------------------------------------------+
| 🤖 AI FORECAST INSIGHTS                                            |
| Based on historical win rates and deal velocity:                  |
|                                                                    |
| • Predicted Attainment: 225-250% of quota                         |
| • Recommended: Continue prospecting to maintain 3x pipeline       |
| • Win Rate Trend: 67% (up from 58% last quarter)                  |
| • Avg Deal Size: $93K (up from $71K last quarter)                 |
+--------------------------------------------------------------------+
```

**Time:** 1-2 seconds

---

## Use Case: Close Deal (Won)

### Step 9: Mark Deal as Closed-Won

**Context:** Acme Corp signed MSA, deal is won

**User Action:** From deal detail, click "⋮" menu > "Close Deal"

**System Response:**
- Close deal modal opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Close Deal - Acme Corp                                         [×] |
+--------------------------------------------------------------------+
| Deal: Acme Corp - Enterprise Staffing Program                      |
| Current Value: $115,000  |  Probability: 90%  |  Age: 31 days      |
+--------------------------------------------------------------------+
| CLOSE OUTCOME *                                                    |
|                                                                    |
| [●] Closed-Won (We won!) 🎉                                        |
| [ ] Closed-Lost (We lost)                                         |
+--------------------------------------------------------------------+
| CLOSED-WON DETAILS                                                 |
|                                                                    |
| Actual Close Date *                                                |
| [Dec 2, 2024 📅] (Today)                                           |
| Expected was: Dec 2, 2024 ✓ On time                               |
|                                                                    |
| Final Deal Value *                                                 |
| [$115,000      ]                                                   |
| Original: $125,000 (negotiated down $10K for 10% discount)         |
|                                                                    |
| Contract Details                                                   |
| Contract Type: [Master Service Agreement (MSA) ▼]                 |
| Contract Start: [Jan 6, 2025 📅]                                   |
| Contract End: [Jan 6, 2026 📅] (1 year)                            |
| Payment Terms: [Net 30 ▼]                                         |
|                                                                    |
| Contract Documents                                                 |
| [×] MSA Signed (upload): [Choose File: acme-msa-signed.pdf ✓]     |
| [×] SOW Signed (upload): [Choose File: acme-sow-signed.pdf ✓]     |
| [ ] Rate Card (optional): [Choose File...]                         |
+--------------------------------------------------------------------+
| HANDOFF & NEXT STEPS                                               |
|                                                                    |
| Account Manager *                                                  |
| [Tom Anderson ▼]                                                   |
| This person will own the ongoing client relationship               |
|                                                                    |
| Create Jobs from Deal?                                             |
| [●] Yes, create job orders now                                    |
| [ ] No, I'll create jobs later                                    |
|                                                                    |
| Planned Positions (from deal scope):                               |
| [×] 2 × Senior Software Engineers                                 |
| [×] 2 × QA Engineers                                              |
| [×] 1 × DevOps Lead                                               |
|                                                                    |
| Assign Jobs To:                                                    |
| [Jessica Kim - Recruiting Manager ▼]                              |
|                                                                    |
| Internal Handoff Notes                                             |
| [Client is high-touch, prefers weekly status calls. Contact:   ]  |
| [John Doe (VP Ops). Start date critical: Jan 6. MSA includes   ]  |
| [90-day replacement guarantee.                                  ]  |
|                                                            ] 152/1000|
+--------------------------------------------------------------------+
| CLOSE ANALYSIS (optional but recommended)                          |
|                                                                    |
| Win Reason                                                         |
| [×] Quality of talent                                             |
| [×] Speed to fill                                                 |
| [ ] Pricing (competitive)                                         |
| [×] Relationship / Trust                                          |
| [×] Case studies / References                                     |
| [ ] Other                                                         |
|                                                                    |
| Competitor(s) We Beat                                              |
| [TalentSource Pro, StaffGenius                                  ]  |
|                                                                    |
| Key Success Factors                                                |
| [Strong discovery call, excellent case studies, responsive      ]  |
| [follow-up. John Doe was impressed by quality focus.           ]  |
|                                                              ] 112/500|
+--------------------------------------------------------------------+
| COMMISSION CALCULATION                                             |
|                                                                    |
| Deal Value: $115,000                                               |
| Commission Rate: 12% (Tier 3 - 100-124% quota attainment)         |
| Commission: $13,800                                                |
| New Logo Bonus: $1,500                                             |
| Total Earnings: $15,300 💰                                         |
|                                                                    |
| Note: Commission paid monthly based on invoiced revenue            |
+--------------------------------------------------------------------+
| [Cancel] [Close as Won 🎉]                                         |
+--------------------------------------------------------------------+
```

**User Action:** Click "Close as Won 🎉"

**System Response:**
1. Deal.stage = "closed_won"
2. Deal.probability = 100%
3. Deal.actualCloseDate = Dec 2, 2024
4. Deal.closeReason = "Won - Quality, speed, relationship"
5. Account.status updated to "active"
6. Account.accountManagerId = Tom Anderson
7. 5 Job records created (based on positions)
8. Jobs assigned to Jessica Kim (recruiter)
9. Documents uploaded and linked
10. Activity logged: "Deal closed - WON 🎉"
11. Commission record created
12. Notifications sent:
    - Manager: "Deal closed - $115K"
    - Account Manager: "New account assigned"
    - Recruiter: "5 new jobs assigned"
    - CEO: "New client won"
13. Celebration animation plays
14. User redirected to account detail page
15. Toast: "Congratulations! Deal closed - $115,000 won! 🎉"

**Time:** 5-10 minutes

---

## Use Case: Close Deal (Lost)

### Step 10: Mark Deal as Closed-Lost

**Context:** BuildCo chose a competitor

**User Action:** From deal detail, click "⋮" > "Close Deal"

**User Action:** Select "Closed-Lost" radio button

**Screen State:**
```
+--------------------------------------------------------------------+
| Close Deal - BuildCo                                           [×] |
+--------------------------------------------------------------------+
| Deal: BuildCo - Construction Staffing                              |
| Value: $65,000  |  Probability: 25%  |  Age: 45 days                |
+--------------------------------------------------------------------+
| CLOSE OUTCOME *                                                    |
|                                                                    |
| [ ] Closed-Won (We won!)                                          |
| [●] Closed-Lost (We lost)                                         |
+--------------------------------------------------------------------+
| CLOSED-LOST DETAILS                                                |
|                                                                    |
| Actual Close Date *                                                |
| [Dec 2, 2024 📅] (Today)                                           |
| Expected was: Jan 15, 2025 (closed early)                          |
|                                                                    |
| Lost Reason * (select primary reason)                              |
| [ ] Price (competitor undercut)                                   |
| [●] Chose competitor (non-price)                                  |
| [ ] No budget                                                     |
| [ ] No decision / Delayed indefinitely                            |
| [ ] Internal hire (filled in-house)                               |
| [ ] Requirements changed                                          |
| [ ] Relationship / Trust                                          |
| [ ] Other                                                         |
|                                                                    |
| Competitor Name                                                    |
| [TalentSource Pro                                               ]  |
|                                                                    |
| Lost Details *                                                     |
| [Client went with TalentSource Pro. They had an existing MSA   ]  |
| [and offered 5% lower pricing. We were competitive on quality  ]  |
| [but couldn't overcome existing relationship. Noted for future.]  |
|                                                              ] 185/500|
+--------------------------------------------------------------------+
| POST-MORTEM ANALYSIS                                               |
|                                                                    |
| What went well?                                                    |
| [Good discovery call, strong proposal, positive relationship.   ]  |
|                                                                    |
| What could we have done better?                                    |
| [Could have engaged earlier before competitor was entrenched.   ]  |
| [Pricing was slightly higher. Maybe offer volume discount.     ]  |
|                                                                    |
| Lessons Learned                                                    |
| [For construction industry, existing relationships very strong. ]  |
| [Need to differentiate more on specialized expertise.          ]  |
+--------------------------------------------------------------------+
| FUTURE OPPORTUNITY                                                 |
|                                                                    |
| Future Opportunity? *                                              |
| [●] Yes, add to nurture (may have opportunity later)              |
| [ ] No, unlikely to work together                                 |
|                                                                    |
| If Yes:                                                            |
| Nurture Campaign: [Quarterly Executive Updates ▼]                 |
| Follow-up Date: [March 1, 2025 📅] (check in Q1 next year)        |
+--------------------------------------------------------------------+
| [Cancel] [Close as Lost]                                           |
+--------------------------------------------------------------------+
```

**User Action:** Click "Close as Lost"

**System Response:**
1. Deal.stage = "closed_lost"
2. Deal.probability = 0%
3. Deal.actualCloseDate = Dec 2, 2024
4. Deal.closeReason = "Chose competitor - existing relationship"
5. Activity logged: "Deal closed - LOST to TalentSource Pro"
6. Post-mortem report created
7. Account added to nurture campaign
8. Notification sent to manager
9. Pipeline view updated (deal removed from active)
10. Toast: "Deal marked as lost. Post-mortem saved for learning."

**Time:** 3-5 minutes

---

## Postconditions

### After Managing Deals

1. ✅ Deal stages accurate and current
2. ✅ All activities logged with details
3. ✅ Probabilities reflect real deal health
4. ✅ Close dates realistic and updated
5. ✅ Won deals handed off to account management
6. ✅ Lost deals analyzed for learning
7. ✅ Pipeline forecast accurate
8. ✅ Commission calculated correctly

---

## Events Logged

| Event | Payload |
|-------|---------|
| `deal.created` | `{ deal_id, title, account_id, value, stage, owner_id }` |
| `deal.stage_changed` | `{ deal_id, from_stage, to_stage, changed_by }` |
| `deal.value_updated` | `{ deal_id, old_value, new_value, reason }` |
| `deal.closed_won` | `{ deal_id, value, account_id, close_date, jobs_created }` |
| `deal.closed_lost` | `{ deal_id, lost_reason, competitor }` |
| `deal.activity_logged` | `{ deal_id, activity_type, performed_by }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Exit Criteria | Move stage without meeting criteria | "Please complete required actions for this stage" | Complete checklist |
| Invalid Close Date | Future date for closed deal | "Close date cannot be in the future" | Use today or past date |
| Missing Documents | Close won without MSA | "Please upload signed MSA to close deal" | Upload required docs |
| Value Too Low | Value < $1,000 | "Deal value seems too low. Please verify." | Confirm or adjust |
| Duplicate Deal | Same account + title exists | "Similar deal already exists. View existing?" | View or modify title |
| Permission Denied | User lacks close permission | "Only deal owner can close deals" | Request manager help |

---

## Related Use Cases

- [02-manage-leads.md](./02-manage-leads.md) - Lead qualification before deal creation
- [05-close-deal.md](./05-close-deal.md) - Detailed close and handoff process
- [01-daily-workflow.md](./01-daily-workflow.md) - Deals in daily context

---

*Last Updated: 2024-11-30*
