# Use Case: Handle Early Termination

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-G07 |
| Actor | Recruiter |
| Goal | Process early contract termination and manage replacement guarantee obligations |
| Frequency | 1-2 times per month |
| Estimated Time | 30-60 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. Active placement exists
3. Termination request received from client or contractor
4. Notice period and guarantee terms known

---

## Trigger

- Client requests contractor removal
- Contractor resigns before contract end
- Performance issues requiring termination
- Project cancellation or budget cuts
- Mutual agreement to end early

---

## Main Flow

### Step 1: Receive Termination Notice

**User Action:** Open termination alert or create termination request

**Screen State:**
```
+----------------------------------------------------------+
|                   Early Termination                   [×] |
+----------------------------------------------------------+
| Placement: Tom Wilson @ Amazon                            |
| Start Date: Oct 1, 2025 | Contract End: Mar 31, 2026     |
| Days Active: 82 days                                      |
+----------------------------------------------------------+
|                                                           |
| TERMINATION DETAILS                                       |
|                                                           |
| Termination Initiated By *                                |
| ○ Client (Amazon)                                        |
| ○ Contractor (Tom Wilson)                                |
| ○ Mutual Agreement                                       |
| ○ InTime (Performance/Compliance)                        |
|                                                           |
| Termination Reason *                                      |
| [Performance - Not meeting expectations        ▼]        |
|   - Performance - Not meeting expectations               |
|   - Budget/Headcount reduction                           |
|   - Project cancelled/postponed                          |
|   - Better opportunity (contractor)                      |
|   - Personal reasons (contractor)                        |
|   - Culture fit issues                                   |
|   - Skill mismatch                                       |
|   - Other                                                |
|                                                           |
| Reason Details *                                          |
| [Client says Tom has been struggling with the codebase  |
|  complexity. Received 2 verbal warnings. Manager feels  |
|  it's not a good fit despite Tom's best efforts.   ]    |
|                                                           |
| Requested Last Day *                                      |
| [12/31/2025                                     📅]      |
|                                                           |
| Notice Period Compliance                                  |
| ┌────────────────────────────────────────────────────┐  |
| │ Contract requires: 2 weeks notice                  │  |
| │ Notice given: Dec 23 → Last day Dec 31 = 8 days   │  |
| │ Status: ⚠️ Below required notice                   │  |
| │                                                     │  |
| │ Options:                                           │  |
| │ ○ Client pays out remaining notice (1 week)       │  |
| │ ○ Waive notice requirement                         │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

---

### Step 2: Assess Guarantee Obligation

**User Action:** Review replacement guarantee terms

**Screen State:**
```
+----------------------------------------------------------+
|                  Guarantee Assessment                     |
+----------------------------------------------------------+
|                                                           |
| REPLACEMENT GUARANTEE STATUS                              |
| ┌────────────────────────────────────────────────────┐  |
| │ Contract Guarantee: 30 days free replacement       │  |
| │ Days Worked: 82 days                               │  |
| │ Guarantee Status: ❌ EXPIRED (past 30 days)        │  |
| │                                                     │  |
| │ Standard Guarantee Policy:                         │  |
| │ • 0-7 days: Free replacement, no questions         │  |
| │ • 8-30 days: Free replacement if performance       │  |
| │ • 31-60 days: 50% discount on replacement          │  |
| │ • 61-90 days: 25% discount on replacement          │  |
| │ • 90+ days: No guarantee (standard fee)            │  |
| │                                                     │  |
| │ This termination: 82 days = 25% discount applies  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| FINANCIAL IMPACT                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ REVENUE LOST                                       │  |
| │ Remaining contract: 91 days × $140/hr × 8 hrs     │  |
| │ Lost billing: ~$102,000                           │  |
| │                                                     │  |
| │ COMMISSION IMPACT                                  │  |
| │ Current monthly: $1,120                            │  |
| │ Months remaining: 3                                │  |
| │ Lost commission: ~$3,360                           │  |
| │                                                     │  |
| │ REPLACEMENT EFFORT                                 │  |
| │ If client wants replacement:                       │  |
| │ Fee: 75% of standard (25% discount)               │  |
| │ Est. time to fill: 2-3 weeks                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

---

### Step 3: Process Termination

**User Action:** Complete termination form and process

**Screen State:**
```
+----------------------------------------------------------+
|                  Complete Termination                     |
+----------------------------------------------------------+
|                                                           |
| OFFBOARDING CHECKLIST                                     |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑ Final timesheet submitted                        │  |
| │ ☐ Equipment return arranged (laptop, badge)       │  |
| │ ☐ Access revocation requested                     │  |
| │ ☐ Exit interview scheduled                         │  |
| │ ☐ Final invoice prepared                          │  |
| │ ☐ References discussion                           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NOTIFICATIONS                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑ Notify Finance (final billing)                   │  |
| │ ☑ Notify HR (offboarding)                          │  |
| │ ☑ Notify Pod Manager                               │  |
| │ ☐ Send contractor exit email                       │  |
| │ ☐ Send client confirmation                         │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| REPLACEMENT OFFER                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Offer replacement to client?                       │  |
| │ ● Yes, at 25% discounted rate                     │  |
| │ ○ No, client doesn't want replacement              │  |
| │                                                     │  |
| │ If yes, start sourcing immediately:               │  |
| │ ☑ Reopen job requisition                          │  |
| │ ☑ Search hotlist for matches                      │  |
| │ ☑ Notify team of urgent need                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| INTERNAL NOTES (Not shared with client/contractor)        |
| [Performance was legitimate issue per client feedback.   |
|  Tom was professional but struggled with codebase.      |
|  No blame - just not the right fit. He's still a good  |
|  candidate for less complex codebases.             ]    |
|                                                           |
| LESSONS LEARNED                                           |
| [Need better technical assessment for complex legacy     |
|  codebase projects. Add "legacy code experience"        |
|  as screening question for Amazon roles.           ]    |
|                                                           |
+----------------------------------------------------------+
|                [Cancel]  [Process Termination ✓]         |
+----------------------------------------------------------+
```

---

### Step 4: Complete Termination

**User Action:** Click "Process Termination ✓"

**System Response:**
1. Placement status → "Terminated"
2. End date updated to actual last day
3. Final timesheet/invoice triggered
4. Equipment return tracked
5. Contractor available for other roles
6. Replacement job created (if requested)
7. Commission adjusted

---

## Postconditions

1. ✅ Placement terminated
2. ✅ Final billing processed
3. ✅ Offboarding initiated
4. ✅ Replacement offered (if applicable)
5. ✅ Contractor status updated
6. ✅ Lessons learned documented

---

## Guarantee Policy Reference

| Days Active | Guarantee | Replacement Fee |
|-------------|-----------|-----------------|
| 0-7 | Full | Free |
| 8-30 | Performance | Free (if performance) |
| 31-60 | Partial | 50% discount |
| 61-90 | Partial | 25% discount |
| 90+ | None | Standard fee |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `placement.terminated` | `{ placement_id, reason, last_day, initiated_by }` |
| `placement.replacement_offered` | `{ placement_id, discount_percent }` |
| `job.reopened` | `{ job_id, reason: 'replacement' }` |

---

## Related Use Cases

- [G04-manage-placement.md](./G04-manage-placement.md) - Placement management
- [D01-create-job.md](./D01-create-job.md) - Replacement job
- [E01-source-candidates.md](./E01-source-candidates.md) - Find replacement

---

*Last Updated: 2025-12-05*

