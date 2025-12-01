# UC-FIN-010: Commission Management - Calculation, Approval & Dispute Resolution

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** CFO (Chief Financial Officer)
**Status:** Active

---

## 1. Overview

The Commission Management system handles end-to-end commission processing for recruiters, including calculation based on placements, approval workflows, dispute resolution, clawback processing (for failed placements), and commission payments. The CFO owns commission accuracy, approves all commission runs, and ensures fair, transparent compensation.

**Purpose:**
- Automated commission calculation based on placement events
- Multi-tier commission structures (individual, team, override)
- CFO approval workflow for all commission payments
- Dispute resolution process
- Clawback processing for failed placements
- Monthly commission runs and payment processing

**Key Stakeholders:**
- Recruiters (earn commissions)
- Pod Managers (earn override commissions)
- CFO (approves and audits)
- Finance Team (processes payments)

---

## 2. Commission Structure

### 2.1 Commission Types

| Type | Description | Eligibility | Calculation | Example |
|------|-------------|-------------|-------------|---------|
| **Placement Commission** | Commission on successful placement | Technical Recruiter, Bench Sales Rep | % of Gross Margin (first X months) | 10% of margin for 6 months |
| **Override Commission** | Manager override on team placements | Pod Manager, Regional Director | % of team placement commissions | 5% of all team commissions |
| **Split Commission** | Shared commission (multiple recruiters) | Any recruiter | Pro-rata based on contribution | 60/40 split |
| **Bonus Commission** | Performance bonuses (quarterly/annual) | All roles | Based on OKRs, quotas | $5K for hitting quota |
| **Referral Commission** | Commission for referring candidates | Any employee | Fixed amount or % of margin | $500 per placement |

### 2.2 Standard Commission Rates

**Technical Recruiter (Recruiting Pillar):**
```
Base Commission: 10% of Gross Margin for first 6 months of placement

Gross Margin Calculation:
- Gross Margin = (Bill Rate - Pay Rate) × Hours Worked
- Example: ($95/hr - $72/hr) × 160 hrs/month = $3,680/month
- Commission: $3,680 × 10% = $368/month × 6 months = $2,208 total

Tiered Structure (based on monthly placements):
- 1-3 placements/month: 10% commission rate
- 4-6 placements/month: 12% commission rate (20% increase)
- 7+ placements/month: 15% commission rate (50% increase)
```

**Bench Sales Rep (Bench Sales Pillar):**
```
Base Commission: 15% of Gross Margin for first 3 months of placement

Rationale: Shorter duration (bench to placement urgency), higher rate

Example: ($85/hr - $65/hr) × 160 hrs/month = $3,200/month
Commission: $3,200 × 15% = $480/month × 3 months = $1,440 total
```

**Pod Manager Override:**
```
Override Commission: 5% of all team placement commissions

Example: Team generates $50,000 in placement commissions this month
Manager Override: $50,000 × 5% = $2,500
```

### 2.3 Commission Eligibility Rules

```
Placement must meet these criteria:
✓ Placement status: "Active" (not Draft or Cancelled)
✓ Consultant has started work (Day 1 completed)
✓ Client has been invoiced for at least 1 pay period
✓ Placement has not been terminated within 7 days (probation period)
✓ No outstanding quality issues or client complaints

Commission is NOT earned if:
❌ Placement fails within 7 days (probationary period)
❌ Client refuses to pay (bad debt)
❌ Placement was obtained through fraud/misrepresentation
❌ Recruiter terminated employment before placement starts
```

---

## 3. Commission Calculation Engine

### 3.1 Automated Calculation Process

```
Daily:
├─ Monitor placement status changes
├─ Track consultant start dates
├─ Record hours worked (from timesheets)
└─ Calculate daily commission accrual

Weekly:
├─ Aggregate weekly commission accruals
├─ Flag placements approaching commission milestones
└─ Generate commission preview reports

Monthly (Commission Run):
├─ Freeze commission data (last day of month)
├─ Calculate all commissions for the month
├─ Apply commission splits and overrides
├─ Generate commission statements for each recruiter
├─ Route to CFO for approval
└─ Process payment (after approval)
```

### 3.2 Calculation Examples

**Example 1: Simple Placement Commission**

```
Scenario:
- Recruiter: Sarah Chen
- Placement: Jane Doe @ Google
- Bill Rate: $95/hr | Pay Rate: $72/hr
- Hours Worked (Month 1): 160 hours
- Commission Rate: 10% (Sarah has 2 placements this month)
- Commission Duration: 6 months

Month 1 Commission:
- Gross Margin: ($95 - $72) × 160 = $3,680
- Commission: $3,680 × 10% = $368.00

Total Commission (6 months): $368 × 6 = $2,208.00
Payment Schedule: $368/month for 6 months
```

**Example 2: Split Commission (Two Recruiters)**

```
Scenario:
- Recruiter A (Sourced): Sarah Chen
- Recruiter B (Closed): Mike Torres
- Split Agreement: 60% Sourcer / 40% Closer
- Gross Margin: $3,680/month
- Base Commission: 10%

Month 1 Commission:
- Total Commission: $3,680 × 10% = $368.00
- Sarah Chen (60%): $368 × 60% = $220.80
- Mike Torres (40%): $368 × 40% = $147.20

Payment: Each receives their split for 6 months
```

**Example 3: Manager Override**

```
Scenario:
- Pod Manager: Emily Rodriguez
- Team: 5 recruiters in Pod Alpha
- Team Commission This Month: $12,500
- Override Rate: 5%

Manager Override Commission:
- Override: $12,500 × 5% = $625.00

Payment: One-time payment this month
```

**Example 4: Tiered Commission (High Performer)**

```
Scenario:
- Recruiter: Tom Wilson
- Placements This Month: 7 placements
- Tier: 7+ placements = 15% commission rate (vs 10% base)
- Average Gross Margin per Placement: $3,500/month

Month 1 Commission:
- Total Margin: $3,500 × 7 = $24,500
- Commission: $24,500 × 15% = $3,675.00

Compare to Base (10%): $24,500 × 10% = $2,450.00
Tier Bonus: $3,675 - $2,450 = $1,225 extra (50% more)
```

---

## 4. Commission Approval Workflow

### 4.1 Monthly Commission Run

```
Timeline (Example: November 2025 commissions)

Dec 1-3: Commission Calculation
├─ Finance Team runs monthly commission calculation
├─ System aggregates all placement data from November
├─ Calculate commissions for each recruiter
└─ Generate commission statements (draft)

Dec 4-6: Internal Review
├─ Finance Manager reviews calculations
├─ Validate against placement records
├─ Check for anomalies or errors
├─ Prepare CFO approval package

Dec 7-8: CFO Approval
├─ CFO reviews commission summary
├─ Drill down into high-value commissions (>$5K)
├─ Review disputes (if any)
├─ Approve or reject commission run

Dec 9-10: Dispute Period
├─ Distribute draft commission statements to recruiters
├─ Recruiters have 2 business days to dispute
├─ Finance reviews disputes with CFO
└─ Resolve disputes or defer to next month

Dec 11-12: Final Approval
├─ CFO approves final commission run
├─ Generate final commission statements
└─ Queue for payment processing

Dec 15: Payment
├─ Commission payments via ACH/Direct Deposit
├─ Included in regular paycheck or separate deposit
└─ Commission statements emailed to all recipients
```

### 4.2 CFO Approval Screen

**Screen: SCR-FIN-010 - Commission Approval Dashboard**

**Route:** `/employee/finance/commission-approval`
**Access:** CFO, Controller
**Refresh:** On-demand

```
┌────────────────────────────────────────────────────────────────────────────┐
│ COMMISSION APPROVAL - November 2025                                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ COMMISSION RUN SUMMARY ─────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Period: November 1-30, 2025                                          │  │
│ │ Status: ⏳ Pending CFO Approval                                      │  │
│ │                                                                       │  │
│ │ Total Commissions: $127,500.00                                       │  │
│ │ ├─ Placement Commissions: $105,000.00 (82%)                          │  │
│ │ ├─ Override Commissions: $18,500.00 (15%)                            │  │
│ │ ├─ Bonus Commissions: $4,000.00 (3%)                                 │  │
│ │ └─ Referral Commissions: $0.00 (0%)                                  │  │
│ │                                                                       │  │
│ │ Recipients: 47 people                                                │  │
│ │ ├─ Technical Recruiters: 25                                          │  │
│ │ ├─ Bench Sales Reps: 15                                              │  │
│ │ ├─ Pod Managers: 5                                                   │  │
│ │ ├─ Regional Directors: 2                                             │  │
│ │ └─ Other: 0                                                           │  │
│ │                                                                       │  │
│ │ Placements: 42 placements generated commissions                      │  │
│ │ Average Commission per Recipient: $2,713                             │  │
│ │                                                                       │  │
│ │ Disputes: 2 pending                                                  │  │
│ │ Exceptions: 1 (requires CFO review)                                  │  │
│ │                                                                       │  │
│ │ [Approve All] [Reject] [Review Disputes] [Export Report]             │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ TOP 10 COMMISSIONS (High-Value Review) ─────────────────────────────┐  │
│ │                                                                       │  │
│ │ Recipient              Type        Amount    Placements    Actions   │  │
│ │ ──────────────────────────────────────────────────────────────────   │  │
│ │ 1. Sarah Chen          Placement   $8,500    7 placements  [Review]  │  │
│ │    (Tech Recruiter)    15% tier                           [Approve]  │  │
│ │                                                                       │  │
│ │ 2. Mike Torres         Placement   $6,200    5 placements  [Review]  │  │
│ │    (Tech Recruiter)    12% tier                           [Approve]  │  │
│ │                                                                       │  │
│ │ 3. Emily Rodriguez     Override    $4,800    Team: Alpha   [Review]  │  │
│ │    (Pod Manager)       5% rate                            [Approve]  │  │
│ │                                                                       │  │
│ │ 4. Tom Wilson          Placement   $4,200    6 placements  [Review]  │  │
│ │    (Bench Sales)       15% rate                           [Approve]  │  │
│ │                                                                       │  │
│ │ ... (6 more)                                          [View All]     │  │
│ │                                                                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ PENDING DISPUTES (Requires Resolution) ─────────────────────────────┐  │
│ │                                                                       │  │
│ │ 🟡 DISPUTE #1 - David Kim                                            │  │
│ │    Claimed Commission: $12,000                                       │  │
│ │    System Calculated: $10,500                                        │  │
│ │    Discrepancy: $1,500 (14% difference)                              │  │
│ │                                                                       │  │
│ │    Issue: Dispute over split percentage                              │  │
│ │    David claims: 70/30 split (he sourced + closed)                  │  │
│ │    System shows: 60/40 split (per documented agreement)              │  │
│ │                                                                       │  │
│ │    Supporting Docs:                                                  │  │
│ │    - Email thread with recruiter manager (60/40 agreed)              │  │
│ │    - David's counter-claim email (claims verbal 70/30)               │  │
│ │                                                                       │  │
│ │    Recommended Resolution:                                            │  │
│ │    Uphold system calculation (60/40) - documented agreement          │  │
│ │    Reject $1,500 disputed amount                                     │  │
│ │                                                                       │  │
│ │    [View Full Details] [Approve System Calc] [Approve David's Claim] │  │
│ │    [Request Manager Review] [Defer to Next Month]                    │  │
│ │                                                                       │  │
│ ├───────────────────────────────────────────────────────────────────────┤  │
│ │                                                                       │  │
│ │ 🟡 DISPUTE #2 - Lisa Martinez                                        │  │
│ │    Claimed Commission: $3,200                                        │  │
│ │    System Calculated: $0                                             │  │
│ │    Discrepancy: $3,200 (100% difference)                             │  │
│ │                                                                       │  │
│ │    Issue: Placement not in system                                    │  │
│ │    Lisa claims: Placement started Nov 28 (not recorded)              │  │
│ │    System shows: No placement record for this candidate              │  │
│ │                                                                       │  │
│ │    Investigation:                                                     │  │
│ │    - Placement was entered Dec 1 (after commission run cutoff)       │  │
│ │    - Start date: Nov 28 (should be included in November)            │  │
│ │    - Manager confirms: Valid placement, system entry delayed         │  │
│ │                                                                       │  │
│ │    Recommended Resolution:                                            │  │
│ │    Approve manual commission addition: $3,200                        │  │
│ │    Reason: Valid placement, data entry timing issue                  │  │
│ │                                                                       │  │
│ │    [Approve Manual Addition] [Defer to December Run] [Reject]        │  │
│ │                                                                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ EXCEPTIONS & ALERTS ────────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ 🔴 EXCEPTION: High commission variance                               │  │
│ │    Sarah Chen: $8,500 this month vs $4,200 avg (102% increase)      │  │
│ │    Reason: 7 placements (vs avg 4) + tier jump (15% vs 10%)         │  │
│ │    Validated: All placements verified, tier rules correct            │  │
│ │    Action: ✅ Approve (earned through high performance)             │  │
│ │                                                                       │  │
│ │ 🟡 WARNING: New recruiter first commission                           │  │
│ │    Alex Johnson: First-ever commission $2,100                        │  │
│ │    Action: Verify placement legitimacy (standard for new recs)       │  │
│ │    [Review Placement Details] [Approve] [Flag for Review]            │  │
│ │                                                                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ COMMISSION DETAILS BY PILLAR ───────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Pillar          Recipients  Total      Avg/Person  vs Last Month     │  │
│ │ ────────────────────────────────────────────────────────────────────  │  │
│ │ Recruiting      25          $78,500    $3,140      ▲ +12%            │  │
│ │ Bench Sales     15          $38,500    $2,567      ▲ +8%             │  │
│ │ TA              0           $0         -            -                 │  │
│ │ Management      7           $10,500    $1,500      ▲ +5%             │  │
│ │ ────────────────────────────────────────────────────────────────────  │  │
│ │ Total           47          $127,500   $2,713      ▲ +10%            │  │
│ │                                                                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ CLAWBACK TRACKER ───────────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Placements Failed Within 90 Days (Clawback Required):                │  │
│ │                                                                       │  │
│ │ 🔴 Placement#8821 - John Smith @ Meta (Day 1 no-show)                │  │
│ │    Original Commission Paid: $2,100 (Month 1 of 6)                  │  │
│ │    Clawback Amount: $2,100 (100% - immediate failure)               │  │
│ │    Recruiter: Mike Torres                                            │  │
│ │    Action: Deduct $2,100 from December commission                    │  │
│ │    [Approve Clawback] [Review] [Exception Request]                   │  │
│ │                                                                       │  │
│ │ 🟡 Placement#8945 - Jane Wilson @ Apple (Terminated Day 45)          │  │
│ │    Original Commission Paid: $1,800 (Month 1 of 6)                  │  │
│ │    Clawback Amount: $1,350 (75% - failed before 90 days)            │  │
│ │    Recruiter: Sarah Chen                                             │  │
│ │    Reason: Candidate performance issues                              │  │
│ │    Action: Deduct $1,350 from December commission                    │  │
│ │    [Approve Clawback] [Review] [Exception Request]                   │  │
│ │                                                                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ APPROVAL ACTIONS ───────────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ CFO Decision Required:                                                │  │
│ │                                                                       │  │
│ │ [✅ APPROVE ALL COMMISSIONS ($127,500)]                               │  │
│ │    - Approve 45 standard commissions                                  │  │
│ │    - Resolve 2 disputes as recommended                                │  │
│ │    - Process 2 clawbacks                                              │  │
│ │    - Net Commission Payment: $123,950                                 │  │
│ │                                                                       │  │
│ │ [⏸️ HOLD FOR REVIEW]                                                  │  │
│ │    - Defer commission run to next week                                │  │
│ │    - Request additional documentation                                 │  │
│ │                                                                       │  │
│ │ [❌ REJECT COMMISSION RUN]                                            │  │
│ │    - Reject entire run (requires reason)                              │  │
│ │    - Return to Finance for recalculation                              │  │
│ │                                                                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Clawback Rules

### 5.1 Clawback Triggers

```
Clawback occurs when placement fails within 90 days:

Day 1-7 (Probationary Period):
- 100% clawback
- Reason: Immediate failure (no-show, quit, terminated)
- Rationale: No value delivered to client

Day 8-30:
- 75% clawback
- Reason: Early failure (performance, fit issues)
- Rationale: Minimal value delivered

Day 31-60:
- 50% clawback
- Reason: Mid-term failure
- Rationale: Partial value delivered

Day 61-90:
- 25% clawback
- Reason: Late failure (approaching retention threshold)
- Rationale: Substantial value delivered

Day 91+:
- 0% clawback
- Placement considered successful
- Commission fully earned
```

### 5.2 Clawback Exceptions

```
CFO can waive clawback if:
✓ Placement failed due to client (layoff, project cancelled)
✓ Placement failed due to force majeure (health emergency, etc.)
✓ Consultant performance was satisfactory (client fault)
✓ Recruiter went above-and-beyond to prevent failure

CFO cannot waive clawback if:
❌ Recruiter misrepresented candidate skills
❌ Recruiter ignored red flags during screening
❌ Pattern of failed placements (quality issue)
```

---

## 6. Business Rules

### BR-FIN-010-001: Commission Payment Timing

```
Commission Payment Schedule:
- Monthly run: 1st-10th of following month
- Calculation: 1st-3rd
- CFO Approval: 7th-8th
- Dispute Resolution: 9th-10th
- Payment: 15th (with regular paycheck)

Rush Payment (exception):
- Recruiter can request early payment (hardship)
- Requires CFO approval
- $50 processing fee
- Paid via separate ACH (not paycheck)
```

### BR-FIN-010-002: Commission Dispute SLA

```
Dispute Process:
1. Recruiter submits dispute (via system or email)
2. Finance reviews within 2 business days
3. CFO decides within 3 business days
4. If approved: Added to current or next month's run
5. If rejected: Explanation provided to recruiter

Appeals:
- Recruiter can appeal CFO decision to CEO
- CEO decision is final
```

### BR-FIN-010-003: Commission Accuracy Target

```
Target: 99.5% commission accuracy

Measurement:
- Accuracy = Approved Commissions / (Approved + Disputed + Corrected)
- Example: 100 commissions, 1 dispute corrected = 99% accuracy

Quality Checks:
✓ Automated calculation review (system validation)
✓ Finance Manager spot-check (10% sample)
✓ CFO review (all commissions >$5K)
✓ Post-payment audit (quarterly sample)
```

---

## 7. Integration Points

### Commission Calculation Engine

**Technology:** Custom rules engine + PostgreSQL stored procedures

**Endpoints:**
- `POST /api/commissions/calculate` - Run monthly calculation
- `GET /api/commissions/statement/{userId}` - Get statement
- `POST /api/commissions/dispute` - Submit dispute
- `PATCH /api/commissions/approve` - CFO approval

---

### Payroll Integration

**Purpose:** Include commissions in paycheck

**Endpoint:** `POST /api/payroll/add-commissions`

**Payload:**
```json
{
  "pay_period": "2025-12-15",
  "commissions": [
    {
      "employee_id": "EMP-001",
      "amount": 8500.00,
      "description": "November 2025 Placement Commissions"
    }
  ]
}
```

---

## 8. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | Product Team | Initial comprehensive specification |

---

**End of UC-FIN-010: Commission Management**

*This document provides complete specification for commission calculation, approval workflows, dispute resolution, clawback processing, and payment management.*
