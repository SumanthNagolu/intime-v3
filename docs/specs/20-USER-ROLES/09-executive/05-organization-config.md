# Use Case: Configure Organization Settings

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EXEC-005 |
| Actor | CEO / COO / CFO |
| Goal | Configure organization-wide settings, targets, rules, and business policies |
| Frequency | Quarterly (major changes), Monthly (adjustments), Ad-hoc (as needed) |
| Estimated Time | 30-90 minutes (depending on scope) |
| Priority | Medium-High |

---

## Preconditions

1. User is logged in as Executive with admin/configuration permissions
2. Current organization settings accessible
3. Historical performance data available for target setting
4. Budget and financial data up-to-date
5. Stakeholder approval obtained for major changes

---

## Trigger

One of the following:
- New fiscal year/quarter begins (target setting)
- Business strategy changes (expansion, new market, pivot)
- Performance review indicates need for adjustment
- New policy or compliance requirement
- Subscription/billing changes needed
- Commission structure modification required
- Executive decision to optimize business rules

---

## Main Flow: Configure Organization Settings

### Step 1: Navigate to Organization Settings

**User Action:** Navigate to `/executive/settings` or click "Organization Settings" from executive menu

**System Response:**
- Loads organization settings dashboard
- Shows all configurable categories
- Displays current settings with edit capabilities
- Audit log of recent changes visible

**Screen State:**
```
+-------------------------------------------------------------------------+
| ORGANIZATION SETTINGS                             [🔔 1]  [⚙]  [👤 CEO]|
+-------------------------------------------------------------------------+
| [General] [Targets & Quotas] [Commissions] [Business Rules] [Advanced] |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ ORGANIZATION PROFILE ─────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Legal Name:        InTime Global Staffing Solutions, Inc.           │ |
| │ Trade Name:        InTime OS                                        │ |
| │ Tax ID (EIN):      **-*******45  [Edit]                             │ |
| │ Incorporation:     Delaware, USA (2018)                             │ |
| │                                                                     │ |
| │ Headquarters:      San Francisco, CA, USA                           │ |
| │ Global Offices:    10 countries, 24 offices                         │ |
| │                                                                     │ |
| │ Fiscal Year:       January 1 - December 31                          │ |
| │ Base Currency:     USD                                              │ |
| │ Timezone (HQ):     America/Los_Angeles (PST/PDT)                    │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ QUICK SETTINGS ───────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Most Recently Modified:                                             │ |
| │                                                                     │ |
| │ • Q1 2026 Revenue Targets (Modified: Dec 1, 2025 by CEO)            │ |
| │   [View Changes] [Rollback]                                         │ |
| │                                                                     │ |
| │ • Commission Structure - Bench Sales (Modified: Nov 15, 2025)       │ |
| │   [View Changes] [Rollback]                                         │ |
| │                                                                     │ |
| │ • Time-to-Fill SLA Thresholds (Modified: Nov 1, 2025)               │ |
| │   [View Changes] [Rollback]                                         │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ CRITICAL SETTINGS AUDIT ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Last 30 Days: 8 settings changed by 3 executives                    │ |
| │ [View Full Audit Log]                                               │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~10 seconds

---

### Step 2: Set Revenue and Placement Targets

**User Action:** Click "Targets & Quotas" tab

**System Response:**
- Shows current targets by time period, pillar, region
- AI suggests targets based on historical performance and growth goals
- Allows setting cascading targets (organization → pillar → pod → individual)

**Screen State:**
```
+-------------------------------------------------------------------------+
| TARGETS & QUOTAS CONFIGURATION                                          |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ COMPANY-WIDE TARGETS ─────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Fiscal Year 2026                                                    │ |
| │                                                                     │ |
| │ Annual Revenue Target:    [$36,000,000        ] USD                 │ |
| │ Current (2025):           $32,500,000                               │ |
| │ Growth:                   10.8% YoY  ✅ Achievable                  │ |
| │                                                                     │ |
| │ Annual Placement Target:  [1,500               ] placements         │ |
| │ Current (2025):           1,350                                     │ |
| │ Growth:                   11.1% YoY                                 │ |
| │                                                                     │ |
| │ Gross Margin Target:      [24.0                ] %                  │ |
| │ Current (2025):           23.2%                                     │ |
| │ Improvement:              +0.8 pts                                  │ |
| │                                                                     │ |
| │ Bench Utilization Target: [80.0                ] %                  │ |
| │ Current (2025):           72%                                       │ |
| │ Improvement:              +8 pts                                    │ |
| │                                                                     │ |
| │ 🤖 AI Recommendation:                                               │ |
| │ Based on current growth trajectory and market conditions:           │ |
| │ • Revenue: $36M is achievable with 10% growth (conservative)        │ |
| │ • Placements: 1,500 aligns with revenue at current avg deal size   │ |
| │ • Margin: +0.8 pts requires operational efficiency improvements     │ |
| │ • Bench: 80% achievable with improved marketing velocity            │ |
| │                                                                     │ |
| │ Confidence: 🟢 High (82% probability of achievement)                │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ QUARTERLY BREAKDOWN ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ FY 2026 Target: $36M Revenue | 1,500 Placements                     │ |
| │                                                                     │ |
| │ Quarter  Revenue    % of Annual  Placements  % of Annual   Notes   │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Q1 2026  $8.1M      22.5%        315         21.0%         Slower  │ |
| │ [████████████████░░░░░░░░░░░░░░]                                   │ |
| │ Post-holiday slowdown, gradual ramp-up                              │ |
| │                                                                     │ |
| │ Q2 2026  $9.0M      25.0%        375         25.0%         Peak    │ |
| │ [██████████████████████████░░░░]                                   │ |
| │ Peak hiring season, full team capacity                              │ |
| │                                                                     │ |
| │ Q3 2026  $9.7M      27.0%        420         28.0%         Strong  │ |
| │ [████████████████████████████░░]                                   │ |
| │ Summer surge, pre-budget flush                                      │ |
| │                                                                     │ |
| │ Q4 2026  $9.2M      25.5%        390         26.0%         Steady  │ |
| │ [██████████████████████████░░░]                                    │ |
| │ Year-end push, holiday dip factored                                 │ |
| │                                                                     │ |
| │ [Edit Quarterly Splits]  [Auto-Calculate from Seasonality]          │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ TARGETS BY BUSINESS PILLAR ───────────────────────────────────────┐ |
| │                                                                     │ |
| │ Pillar           Revenue     % of Total  Placements  Avg Deal Size │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Recruiting       $18.0M      50.0%       750         $24,000       │ |
| │ ████████████████████████████████████████████████                   │ |
| │ [Edit] Target: 50 recruiters × $360K/year = $18M                   │ |
| │                                                                     │ |
| │ Bench Sales      $10.8M      30.0%       450         $24,000       │ |
| │ ████████████████████████████                                       │ |
| │ [Edit] Target: 30 bench reps × $360K/year = $10.8M                 │ |
| │                                                                     │ |
| │ Talent Acq       $5.4M       15.0%       225         $24,000       │ |
| │ ██████████████                                                     │ |
| │ [Edit] Target: 15 TA specialists × $360K/year = $5.4M              │ |
| │                                                                     │ |
| │ Academy          $1.8M       5.0%        75 students  $24,000      │ |
| │ ████                                                               │ |
| │ [Edit] Target: 300 enrollments × $6K avg = $1.8M                   │ |
| │                                                                     │ |
| │ Total            $36.0M      100%        1,500       $24,000       │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ TARGETS BY REGION ────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Region          Revenue     % of Total  Headcount   Revenue/HC     │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ 🇺🇸 Americas     $21.6M      60.0%       720         $30,000        │ |
| │ 🌏 APAC          $7.2M       20.0%       340         $21,176        │ |
| │ 🇪🇺 Europe       $5.4M       15.0%       195         $27,692        │ |
| │ 🏜️ Middle East   $1.1M       3.0%        85          $12,941        │ |
| │ 🌴 LATAM         $0.7M       2.0%        60          $11,667        │ |
| │                                                                     │ |
| │ Total            $36.0M      100%        1,400       $25,714        │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ CASCADE TARGETS TO PODS ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Would you like to automatically cascade these targets to:          │ |
| │ [ ] Pods (12 pods will receive proportional targets)               │ |
| │ [ ] Individuals (all producers receive individual quotas)           │ |
| │                                                                     │ |
| │ Allocation Method: [Performance-Based ▼]                            │ |
| │ (Top performers get higher quotas, based on historical performance) │ |
| │                                                                     │ |
| │ [Preview Cascade]  [Execute Cascade]                                │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
|                     [Cancel]  [Save as Draft]  [Publish Targets]       |
+-------------------------------------------------------------------------+
```

**User Action:** Review targets, adjust quarterly splits, click "Publish Targets"

**System Response:**
- Confirmation modal appears
- Shows summary of changes and impact

**Screen State:**
```
+-------------------------------------------------------------------------+
| CONFIRM TARGETS PUBLICATION                                        [×]  |
+-------------------------------------------------------------------------+
|                                                                         |
| You are about to publish FY 2026 targets to the entire organization.    |
|                                                                         |
| Changes:                                                                |
| • Annual Revenue Target:    $32.5M → $36.0M (+10.8%)                   |
| • Annual Placement Target:  1,350 → 1,500 (+11.1%)                     |
| • Gross Margin Target:      23.2% → 24.0% (+0.8 pts)                   |
| • Bench Utilization Target: 72% → 80% (+8 pts)                         |
|                                                                         |
| This will:                                                              |
| ✓ Update all dashboards with new targets                               |
| ✓ Notify all department heads and VPs                                  |
| ✓ Trigger target cascade to pods and individuals                       |
| ✓ Recalculate commission structures based on new quotas                |
| ✓ Update forecasting models                                            |
| ✓ Send all-hands email from CEO announcing new targets                 |
|                                                                         |
| Effective Date: [January 1, 2026 ▼]                                    |
|                                                                         |
| Communication Message (will be sent to all employees):                  |
| [Team,                                                                  |
|                                                                         |
| I'm pleased to share our FY 2026 targets. We're aiming for $36M in     |
| revenue - a 10.8% growth that reflects our momentum and market          |
| opportunity. These targets are ambitious yet achievable.                |
|                                                                         |
| Your individual targets will be shared by your manager this week.       |
|                                                                         |
| Let's make 2026 our best year yet!                                      |
|                                                                         |
| [Your Name], CEO                                                  ]     |
|                                                                         |
|                                      [Cancel]  [Publish Targets]        |
+-------------------------------------------------------------------------+
```

**User Action:** Click "Publish Targets"

**System Response:**
- Targets published system-wide
- Dashboard KPIs update with new targets
- Notifications sent to all leadership (VPs, Directors, Managers)
- Cascade to pods triggered (individual quotas calculated)
- All-hands email sent
- Activity logged
- Toast: "FY 2026 targets published successfully. 450 employees notified."

**Time:** ~10 minutes

---

### Step 3: Configure Commission Structure

**User Action:** Click "Commissions" tab

**System Response:**
- Shows current commission plans by role
- Allows creation of new plans or editing existing
- Preview commission payouts based on performance scenarios

**Screen State:**
```
+-------------------------------------------------------------------------+
| COMMISSION STRUCTURE CONFIGURATION                                      |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ ACTIVE COMMISSION PLANS ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Plan Name              Roles          Type        Status    Action │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Recruiting Standard    Recruiters     Tiered      Active    [Edit] │ |
| │ Bench Sales Standard   Bench Reps     Tiered      Active    [Edit] │ |
| │ TA Specialist Standard TA Specialists Flat        Active    [Edit] │ |
| │ Manager Bonus          Managers       Team-based  Active    [Edit] │ |
| │ Executive Bonus        Executives     Company     Active    [Edit] │ |
| │                                                                     │ |
| │ [+ Create New Plan]                                                 │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Edit Recruiting Standard Plan]                                         |
|                                                                         |
| ┌─ RECRUITING COMMISSION PLAN ───────────────────────────────────────┐ |
| │                                                                     │ |
| │ Plan: Recruiting Standard                                           │ |
| │ Applies to: All Recruiters (50 employees)                           │ |
| │ Effective: Jan 1, 2026                                              │ |
| │                                                                     │ |
| │ Base Structure:                                                     │ |
| │ • Commission Type: [Tiered (Based on Quota Attainment) ▼]           │ |
| │ • Payment Frequency: [Monthly ▼]                                    │ |
| │ • Minimum Tenure: [90 days] (ramped commission for new hires)       │ |
| │                                                                     │ |
| │ Commission Tiers:                                                   │ |
| │                                                                     │ |
| │ Quota Attainment  Commission Rate  Payout Example (on $360K quota) │ |
| │ ──────────────────────────────────────────────────────────────────  │ |
| │ 0% - 69%          0%                $0                              │ |
| │ (No payout below 70% - minimum performance threshold)               │ |
| │                                                                     │ |
| │ 70% - 89%         3%                $7,560 - $9,612                 │ |
| │ (Below quota but honorable performance)                             │ |
| │                                                                     │ |
| │ 90% - 99%         5%                $16,200 - $17,820               │ |
| │ (Close to quota)                                                    │ |
| │                                                                     │ |
| │ 100% - 119%       7%                $25,200 - $30,024               │ |
| │ (At or above quota - target range)  ⭐                               │ |
| │                                                                     │ |
| │ 120% - 139%       10%               $43,200 - $50,040               │ |
| │ (Exceeding expectations - accelerator)                              │ |
| │                                                                     │ |
| │ 140%+             12%               $60,480+ (uncapped)             │ |
| │ (Rock star performance - maximum accelerator)  🚀                   │ |
| │                                                                     │ |
| │ Additional Bonuses:                                                 │ |
| │ [ ] Quality Bonus: +$500 per placement with 0% falloff in 90 days  │ |
| │ [ ] Speed Bonus: +$250 per placement filled <21 days                │ |
| │ [ ] Client NPS Bonus: +$1,000 if client NPS >80                     │ |
| │                                                                     │ |
| │ Clawback Policy:                                                    │ |
| │ [×] Clawback if candidate leaves within 30 days (100% clawback)     │ |
| │ [×] Clawback if candidate leaves within 31-90 days (50% clawback)   │ |
| │                                                                     │ |
| │ Ramping Schedule (New Hires):                                       │ |
| │ • Month 1-3:  50% of standard commission                            │ |
| │ • Month 4-6:  75% of standard commission                            │ |
| │ • Month 7+:   100% of standard commission                           │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ COMMISSION SIMULATOR ─────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Test how much a recruiter earns at different performance levels:    │ |
| │                                                                     │ |
| │ Annual Quota:      [$360,000         ]                              │ |
| │ Performance Level: [████████████░░] 120% (Exceeding)                │ |
| │                                                                     │ |
| │ Results:                                                            │ |
| │ • Revenue Achieved:    $432,000                                     │ |
| │ • Commission Earned:   $43,200 (10% tier)                           │ |
| │ • Quality Bonuses:     $6,000 (12 placements × $500)                │ |
| │ • Speed Bonuses:       $3,000 (12 placements × $250)                │ |
| │ • Total Earnings:      $52,200                                      │ |
| │                                                                     │ |
| │ Total Compensation:    $75,000 (base) + $52,200 (comm) = $127,200  │ |
| │                                                                     │ |
| │ [Simulate Different Scenarios]                                      │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ ESTIMATED ANNUAL COMMISSION EXPENSE ──────────────────────────────┐ |
| │                                                                     │ |
| │ Based on 50 recruiters with avg quota attainment of 105%:          │ |
| │                                                                     │ |
| │ Conservative (95% avg):  $1,350,000  (3.75% of $36M revenue)        │ |
| │ Expected (105% avg):     $1,575,000  (4.38% of $36M revenue)        │ |
| │ Optimistic (115% avg):   $1,890,000  (5.25% of $36M revenue)        │ |
| │                                                                     │ |
| │ Budget Impact: ✅ Within budget (allocated $2.0M for commissions)   │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
|                     [Cancel]  [Save as Draft]  [Publish Plan]          |
+-------------------------------------------------------------------------+
```

**User Action:** Review commission structure, adjust tiers if needed, click "Publish Plan"

**System Response:**
- Confirmation modal
- Once confirmed:
  - Commission plan activated
  - Payroll system updated
  - All affected employees notified
  - Manager training materials generated
  - Activity logged

**Time:** ~15 minutes

---

### Step 4: Configure Business Rules and Thresholds

**User Action:** Click "Business Rules" tab

**System Response:**
- Shows configurable business rules
- SLA thresholds
- Approval workflows
- Escalation policies
- Quality metrics

**Screen State:**
```
+-------------------------------------------------------------------------+
| BUSINESS RULES & POLICIES                                               |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ SERVICE LEVEL AGREEMENTS (SLAs) ──────────────────────────────────┐ |
| │                                                                     │ |
| │ Time-to-Fill Targets:                                               │ |
| │                                                                     │ |
| │ Job Type              Target TTF   Warning Threshold   Critical    │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Contract              [30] days    [25] days           [35] days   │ |
| │ Permanent             [45] days    [40] days           [50] days   │ |
| │ Contract-to-Hire      [35] days    [30] days           [40] days   │ |
| │ Executive             [60] days    [50] days           [70] days   │ |
| │                                                                     │ |
| │ Response Time SLAs:                                                 │ |
| │ • Client inquiry response:        [4] hours                         │ |
| │ • Candidate submittal turnaround: [24] hours                        │ |
| │ • Interview feedback collection:  [48] hours                        │ |
| │ • Offer processing:               [24] hours                        │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ QUALITY THRESHOLDS ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Metric                     Target    Warning    Critical   Current │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Placement Success (90d)    >95%      <93%       <90%       96% ✅  │ |
| │ Client NPS                 >65       <60        <50        67  ✅  │ |
| │ Candidate NPS              >70       <65        <55        72  ✅  │ |
| │ Submittal-to-Placement     <5:1      >6:1       >8:1       4.8:1✅ │ |
| │ Offer Acceptance Rate      >85%      <80%       <75%       87% ✅  │ |
| │                                                                     │ |
| │ [Edit Thresholds]                                                   │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ APPROVAL WORKFLOWS ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ What requires executive approval?                                   │ |
| │                                                                     │ |
| │ Financial:                                                          │ |
| │ [×] Contract >$500K                                                 │ |
| │ [×] Discount >15%                                                   │ |
| │ [×] Service credits >$25K                                           │ |
| │ [×] Capital expense >$50K                                           │ |
| │                                                                     │ |
| │ People:                                                             │ |
| │ [×] Salary increase >10%                                            │ |
| │ [×] New hire: Director level and above                              │ |
| │ [×] Termination: Manager level and above                            │ |
| │ [×] Promotion: Manager level and above                              │ |
| │                                                                     │ |
| │ Strategic:                                                          │ |
| │ [×] New market expansion                                            │ |
| │ [×] Strategic partnership                                           │ |
| │ [×] M&A activity                                                    │ |
| │ [×] Brand/marketing campaigns >$100K                                │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ ESCALATION POLICIES ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ When should issues escalate to executive level?                     │ |
| │                                                                     │ |
| │ Client Escalations:                                                 │ |
| │ [×] Client threatens to churn (any ARR)                             │ |
| │ [×] Strategic account health score <40                              │ |
| │ [×] Client complaint unresolved for >7 days                         │ |
| │ [×] NPS drop >20 points in 30 days                                  │ |
| │                                                                     │ |
| │ Operational Escalations:                                            │ |
| │ [×] Pod performance <70% quota for 2 consecutive months             │ |
| │ [×] Attrition spike: >5 employees in single week                    │ |
| │ [×] Legal/compliance issue                                          │ |
| │ [×] Data breach or security incident                                │ |
| │                                                                     │ |
| │ Financial Escalations:                                              │ |
| │ [×] Monthly revenue miss >10%                                       │ |
| │ [×] Margin drops below 20%                                          │ |
| │ [×] Cash flow <3 months runway                                      │ |
| │ [×] Client payment overdue >60 days (>$50K)                         │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ DATA RETENTION & COMPLIANCE ──────────────────────────────────────┐ |
| │                                                                     │ |
| │ Candidate Data Retention:     [7] years                             │ |
| │ Client Contract Retention:    [7] years after termination           │ |
| │ Financial Records:            [7] years (IRS requirement)           │ |
| │ Audit Logs:                   [3] years                             │ |
| │                                                                     │ |
| │ GDPR Compliance:                                                    │ |
| │ [×] Enable right to be forgotten                                    │ |
| │ [×] Data export requests auto-fulfilled within 30 days              │ |
| │ [×] Consent tracking enabled                                        │ |
| │                                                                     │ |
| │ CCPA Compliance (California):                                       │ |
| │ [×] Enable do-not-sell opt-out                                      │ |
| │ [×] Data disclosure upon request                                    │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
|                     [Cancel]  [Save Changes]                            |
+-------------------------------------------------------------------------+
```

**User Action:** Review and adjust thresholds as needed, click "Save Changes"

**System Response:**
- Changes saved
- Systems updated with new rules
- Monitoring alerts reconfigured
- Workflow automation updated
- Toast: "Business rules updated successfully. Changes effective immediately."

**Time:** ~10 minutes

---

### Step 5: Configure Subscription and Billing

**User Action:** Click "Advanced" tab, then "Subscription & Billing" section

**System Response:**
- Shows current subscription plan
- Billing details
- Usage metrics vs plan limits
- Upgrade/downgrade options

**Screen State:**
```
+-------------------------------------------------------------------------+
| SUBSCRIPTION & BILLING                                                  |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ CURRENT PLAN ─────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Plan: Enterprise Unlimited                                          │ |
| │ Billing Cycle: Annual (renews: March 1, 2026)                       │ |
| │ Price: $125,000/year ($10,417/month)                                │ |
| │                                                                     │ |
| │ Included:                                                           │ |
| │ ✓ Unlimited users                                                   │ |
| │ ✓ Unlimited candidates & jobs                                       │ |
| │ ✓ Unlimited storage                                                 │ |
| │ ✓ All modules (Recruiting, Bench, TA, Academy, CRM)                 │ |
| │ ✓ AI features (Twin, matching, automation)                          │ |
| │ ✓ Advanced analytics & reporting                                    │ |
| │ ✓ API access (unlimited calls)                                      │ |
| │ ✓ White-label options                                               │ |
| │ ✓ 24/7 priority support                                             │ |
| │ ✓ Dedicated success manager                                         │ |
| │ ✓ Custom integrations                                               │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ USAGE METRICS (CURRENT MONTH) ────────────────────────────────────┐ |
| │                                                                     │ |
| │ Active Users:         1,125    (No limit)  ✅                       │ |
| │ ████████████████████████████████████████                           │ |
| │                                                                     │ |
| │ Candidates in DB:     245,000  (No limit)  ✅                       │ |
| │ ████████████████████████████████████████                           │ |
| │                                                                     │ |
| │ Active Jobs:          1,850    (No limit)  ✅                       │ |
| │ ████████████████████████████████████████                           │ |
| │                                                                     │ |
| │ Storage Used:         2.8 TB   (No limit)  ✅                       │ |
| │ ████████████████████████████████████████                           │ |
| │                                                                     │ |
| │ API Calls (MTD):      1.2M     (No limit)  ✅                       │ |
| │ ████████████████████████████████████████                           │ |
| │                                                                     │ |
| │ AI Requests (MTD):    45,000   (No limit)  ✅                       │ |
| │ ████████████████████████████████████████                           │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ BILLING INFORMATION ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Payment Method:  Visa •••• 4567  (Expires: 08/2026)                 │ |
| │ Billing Contact: finance@intime.com                                 │ |
| │ Billing Address: 123 Market St, San Francisco, CA 94103             │ |
| │                                                                     │ |
| │ Next Invoice:    March 1, 2026  ($125,000)                          │ |
| │                                                                     │ |
| │ [Update Payment Method]  [Update Billing Info]                      │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ INVOICING HISTORY ────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Date           Invoice #    Amount       Status      Download      │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Mar 1, 2025    INV-2025-001 $125,000     Paid ✅     [PDF]         │ |
| │ Mar 1, 2024    INV-2024-001 $110,000     Paid ✅     [PDF]         │ |
| │ Mar 1, 2023    INV-2023-001 $95,000      Paid ✅     [PDF]         │ |
| │                                                                     │ |
| │ [View All Invoices]                                                 │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ ADD-ONS & UPGRADES ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Available Add-Ons:                                                  │ |
| │                                                                     │ |
| │ [ ] Dedicated Cloud Instance           +$25,000/year               │ |
| │     Private infrastructure, enhanced security                       │ |
| │                                                                     │ |
| │ [ ] Advanced Security Pack              +$15,000/year               │ |
| │     SSO, MFA, SOC 2 compliance, audit logs                          │ |
| │                                                                     │ |
| │ [ ] White-Label Branding                +$10,000/year               │ |
| │     Custom domain, branding, client portal                          │ |
| │                                                                     │ |
| │ [ ] Professional Services (200 hrs)     +$40,000 one-time          │ |
| │     Custom dev, integrations, training                              │ |
| │                                                                     │ |
| │ [Add to Plan]                                                       │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~5 minutes (review subscription)

---

## Postconditions

1. ✅ Organization settings configured and published
2. ✅ Revenue and placement targets cascaded to all levels
3. ✅ Commission structures updated and communicated
4. ✅ Business rules and SLAs configured
5. ✅ Approval workflows and escalation policies defined
6. ✅ Subscription and billing information current
7. ✅ All changes logged in audit trail
8. ✅ Stakeholders notified of relevant changes

---

## Events Logged

| Event | Payload |
|-------|---------|
| `org_settings.targets.published` | `{ fy_year, revenue_target, placement_target, published_by, timestamp }` |
| `org_settings.commission.updated` | `{ plan_name, affected_roles[], changes, updated_by, timestamp }` |
| `org_settings.business_rules.modified` | `{ rule_type, old_value, new_value, modified_by, timestamp }` |
| `org_settings.subscription.changed` | `{ plan_name, billing_cycle, amount, changed_by, timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Save Failed | Validation error | "Invalid value for [field]" | Correct field, retry |
| Permission Denied | User lacks admin rights | "You don't have permission to modify settings" | Contact super admin |
| Cascade Failed | Pod structure missing | "Unable to cascade targets to pods" | Review pod setup, retry |
| Budget Exceeded | Commission plan too expensive | "Estimated commission expense exceeds budget" | Adjust tiers or targets |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+S` | Save current changes |
| `Cmd+P` | Publish/activate changes |
| `Cmd+Z` | Undo last change |
| `Cmd+H` | View change history |
| `Esc` | Close modal/cancel |

---

## Alternative Flows

### A1: Rollback Configuration Change

If a setting change causes issues:

1. Navigate to Audit Log
2. Find problematic change
3. Click "Rollback" button
4. Confirm rollback action
5. System reverts to previous state
6. Notifications sent about rollback

### A2: Clone Settings from Previous Year

To expedite annual planning:

1. Click "Clone FY 2025 Settings"
2. System duplicates all targets/rules
3. Apply growth % to all targets (e.g., +10%)
4. Review and adjust as needed
5. Publish for new fiscal year

### A3: Bulk Import Targets from Spreadsheet

For complex multi-pod organizations:

1. Download targets template (Excel)
2. Fill in all targets offline
3. Upload completed spreadsheet
4. System validates and previews
5. Approve and publish

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Executive daily routine
- [02-executive-dashboard.md](./02-executive-dashboard.md) - Dashboard monitoring
- [03-workforce-planning.md](./03-workforce-planning.md) - Workforce planning
- [04-strategic-client.md](./04-strategic-client.md) - Client management

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-CFG-001 | Publish new targets | Targets cascade to all levels |
| TC-CFG-002 | Update commission plan | Plan activated, payroll updated |
| TC-CFG-003 | Change SLA threshold | Alerts reconfigured correctly |
| TC-CFG-004 | Modify approval workflow | New approvals route correctly |
| TC-CFG-005 | Rollback target change | Previous targets restored |
| TC-CFG-006 | Commission simulator | Accurate payout calculations |
| TC-CFG-007 | Export configuration | All settings downloadable |

---

*Last Updated: 2025-11-30*
