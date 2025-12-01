# UC-MGR-007: Pod Manager Approval Workflows

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Pod Manager
**Status:** Canonical Reference

---

## 1. Overview

Pod Managers are **Consulted (C)** and **Accountable (A)** on key pod decisions, requiring approval for high-stakes transactions. This document defines what requires approval, the approval process, approval criteria, and escalation paths when Pod Manager judgment is needed to protect the business while empowering ICs.

**Philosophy:** Pod Managers approve decisions that carry significant financial, legal, or reputational risk. Standard operations should not require approval - only exceptions.

---

## 2. Actors

- **Primary:** Pod Manager (approves/rejects)
- **Secondary:** IC (requests approval), CFO (financial review), HR (compliance review)
- **Supporting:** Regional Director (escalations), Legal (contract review)
- **System:** InTime Platform (workflow automation, notifications)

---

## 3. What Requires Approval

### 3.1 Approval Categories

| Category | Threshold | Reason | Auto-Escalate If |
|----------|-----------|--------|------------------|
| **Submission Rate Override** | Rate outside std range | Financial risk | Margin < 15% |
| **Offer Extension** | All offers | Commitment binding | Salary > market rate |
| **Client Contract Terms** | Non-standard terms | Legal/financial risk | Revenue > $500K |
| **Candidate Relocation** | Relocation assistance | Cost commitment | Cost > $10K |
| **Visa Sponsorship** | H1B, GC sponsorship | Legal/cost commitment | Always |
| **Negative Margin Placement** | Bill rate < pay rate + costs | Revenue loss | Always to CFO |
| **Job Cancellation** | Active job closure | Client relationship | Active submissions exist |
| **IC Transfer Request** | IC wants to change pods | Team disruption | High performer |
| **Vendor Agreement** | Third-party bench usage | Vendor risk | New vendor |
| **Client Escalation Resolution** | Remedy for complaint | Client satisfaction | High-value client |

### 3.2 Standard Submission Approval Thresholds

**NO Approval Needed (Auto-Approved):**
- Margin ≥ 25%
- Rates within market range (±10% of job target)
- Standard employment type (W2, C2C, 1099)
- No relocation or visa sponsorship
- Submission to active job owned by pod

**Pod Manager Approval Required:**
- Margin 15-24% (lower than target but acceptable)
- Rates 10-20% outside job target range
- Relocation assistance $1K-$10K
- OPT/EAD visa status (compliance risk)
- Cross-pod submission (IC submitting to another pod's job)

**CFO Approval Required (Pod Manager + CFO):**
- Margin < 15% (low margin risk)
- Negative margin (loss on placement)
- Relocation assistance > $10K
- Visa sponsorship (H1B transfer, GC, etc.)
- Contract terms > 1 year duration

**CEO Approval Required (Pod Manager + CFO + CEO):**
- Negative margin > $5K annually
- Strategic placement (high-profile role)
- Client contract > $2M annually
- Any placement with legal/compliance red flags

---

## 4. Approval Workflow

### 4.1 Main Flow (UC-MGR-007-F01)

**Preconditions:**
- IC has completed submission details
- Submission flagged for approval based on thresholds
- Pod Manager notified via system

**Steps:**

```
Step 1: IC Submits Candidate (Triggers Approval)
┌───────────────────────────────────────────────────────────┐
│ IC completes submission form with all required fields     │
│ - Candidate details                                       │
│ - Job assignment                                          │
│ - Rate structure (pay rate, bill rate)                    │
│ - Employment type, start date, duration                   │
│ - Special terms (relocation, visa, etc.)                  │
│                                                           │
│ System calculates:                                        │
│ - Gross margin % = (bill - pay) / bill                   │
│ - Variance from job target rate                          │
│ - Risk flags (visa, relocation, cross-pod, etc.)         │
│                                                           │
│ IF meets auto-approval criteria:                         │
│   → Submission created with status: "Submitted"          │
│   → Pod Manager notified (Consulted role)                │
│   → Workflow ends                                        │
│                                                           │
│ ELSE:                                                     │
│   → Submission created with status: "Pending Approval"   │
│   → Approval workflow triggered                          │
│   → Continue to Step 2                                   │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 2: System Determines Approval Path
┌───────────────────────────────────────────────────────────┐
│ System evaluates submission against approval matrix:      │
│                                                           │
│ Level 1: Pod Manager Only                                │
│   - Margin 15-24%                                        │
│   - Rate variance 10-20%                                 │
│   - Relocation < $10K                                    │
│   - OPT/EAD visa                                         │
│                                                           │
│ Level 2: Pod Manager + CFO                               │
│   - Margin < 15%                                         │
│   - Relocation > $10K                                    │
│   - H1B sponsorship                                      │
│   - Contract > 1 year                                    │
│                                                           │
│ Level 3: Pod Manager + CFO + CEO                         │
│   - Negative margin > $5K                                │
│   - Strategic placement                                  │
│   - Contract > $2M                                       │
│   - Legal red flags                                      │
│                                                           │
│ System creates approval task(s) and sends notifications   │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 3: Pod Manager Receives Approval Request
┌───────────────────────────────────────────────────────────┐
│ Pod Manager receives notification:                        │
│   - Email: "Approval Required: [Candidate] → [Job]"      │
│   - Slack: "@manager - New approval request"             │
│   - In-app: Badge on Approvals Queue                     │
│                                                           │
│ Pod Manager navigates to Approvals Queue:                │
│   Route: /employee/manager/approvals                     │
│                                                           │
│ Approval card displayed:                                 │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ [🟡 Pending] Submission Approval Required           │  │
│ │                                                     │  │
│ │ Jane Doe → Senior Java Developer @ Acme Corp       │  │
│ │ Submitted by: John Smith                           │  │
│ │                                                     │  │
│ │ ⚠️ Approval Reason: Low Margin (18%)               │  │
│ │                                                     │  │
│ │ Rate Details:                                       │  │
│ │ - Pay Rate: $82/hr                                 │  │
│ │ - Bill Rate: $100/hr                               │  │
│ │ - Gross Margin: $18/hr (18%)                       │  │
│ │ - Target Margin: 25%                               │  │
│ │                                                     │  │
│ │ Special Terms:                                      │  │
│ │ - Relocation Assistance: $5,000                    │  │
│ │ - Visa Status: H1B (valid through 2027)           │  │
│ │                                                     │  │
│ │ IC Justification:                                   │  │
│ │ "Client has tight budget constraints but this is  │  │
│ │  a high-volume account. Candidate is exceptional  │  │
│ │  fit and we can make up margin on future roles."  │  │
│ │                                                     │  │
│ │ [View Full Submission] [View Candidate Profile]    │  │
│ │                                                     │  │
│ │ Decision:                                           │  │
│ │ ○ Approve  ○ Approve with Conditions  ○ Reject    │  │
│ │                                                     │  │
│ │ [Provide Feedback / Conditions]                     │  │
│ └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 4: Pod Manager Reviews Submission
┌───────────────────────────────────────────────────────────┐
│ Pod Manager evaluates:                                    │
│                                                           │
│ Financial Viability:                                      │
│ ✓ Is the margin acceptable given the context?            │
│ ✓ Will this placement be profitable after costs?         │
│ ✓ Does the client have volume potential to offset?       │
│ ✓ Is this rate competitive for the market?               │
│                                                           │
│ Risk Assessment:                                          │
│ ✓ Is the candidate qualified and stable?                 │
│ ✓ Is the visa status secure (not expiring soon)?         │
│ ✓ Is the client reliable (payment history)?              │
│ ✓ Are there any red flags in the submission?             │
│                                                           │
│ Strategic Alignment:                                      │
│ ✓ Does this align with pod goals?                        │
│ ✓ Does this help IC development?                         │
│ ✓ Will this strengthen client relationship?              │
│ ✓ Is this consistent with company policy?                │
│                                                           │
│ Pod Manager may:                                          │
│ - Click [View Full Submission] for complete details      │
│ - Click [View Candidate Profile] for background          │
│ - Review job requirements and client history             │
│ - Check IC's track record and judgment                   │
│ - Consult with CFO or Regional Director if unsure        │
└───────────────────────────────────────────────────────────┘
                        ↓
Step 5: Pod Manager Makes Decision
┌───────────────────────────────────────────────────────────┐
│ OPTION A: APPROVE                                         │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ ● Approve  ○ Approve with Conditions  ○ Reject    │  │
│ │                                                     │  │
│ │ Approval Comments (Required):                       │  │
│ │ ┌───────────────────────────────────────────────┐   │  │
│ │ │ Approved. While margin is below target, this  │   │  │
│ │ │ is a strategic account with high volume       │   │  │
│ │ │ potential. Candidate is strong fit. Proceed.  │   │  │
│ │ └───────────────────────────────────────────────┘   │  │
│ │                                                     │  │
│ │ [Cancel]                          [Approve & Send]  │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ System Actions:                                           │
│ - Update submission status: "Approved"                    │
│ - Notify IC: "Submission approved by [Manager]"          │
│ - Log approval in audit trail                            │
│ - Allow IC to proceed with submission to client          │
│ - Add approval to Pod Manager activity feed              │
└───────────────────────────────────────────────────────────┘
                        ↓
                  [Workflow Complete]

         ┌──────────────────────────────────────────┐
         │ OPTION B: APPROVE WITH CONDITIONS        │
         └──────────────────────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────────────┐
│ ○ Approve  ● Approve with Conditions  ○ Reject           │
│                                                           │
│ Conditions (Required):                                    │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Approved ONLY IF:                                   │  │
│ │                                                     │  │
│ │ 1. Client commits to 3+ additional roles in Q1     │  │
│ │ 2. Candidate agrees to 6-month minimum assignment  │  │
│ │ 3. We negotiate bill rate to $102/hr (20% margin)  │  │
│ │                                                     │  │
│ │ If conditions cannot be met, re-submit for review. │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ [Cancel]                  [Approve with Conditions]       │
└───────────────────────────────────────────────────────────┘
│
│ System Actions:
│ - Update submission status: "Conditionally Approved"
│ - Notify IC with conditions
│ - IC must confirm conditions met before proceeding
│ - If conditions met: auto-approve, if not: re-review
└───────────────────────────────────────────────────────────┘
                        ↓
                  [IC Addresses Conditions]

         ┌──────────────────────────────────────────┐
         │ OPTION C: REJECT                         │
         └──────────────────────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────────────┐
│ ○ Approve  ○ Approve with Conditions  ● Reject           │
│                                                           │
│ Rejection Reason (Required):                              │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Rejected. Margin of 18% is too low without         │  │
│ │ guaranteed volume commitment. Candidate's visa      │  │
│ │ expires in 6 months, creating placement risk.       │  │
│ │                                                     │  │
│ │ Recommendation: Negotiate bill rate to $105/hr OR   │  │
│ │ get client commitment for 5+ roles this quarter.    │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ [Cancel]                              [Reject & Send]     │
└───────────────────────────────────────────────────────────┘
│
│ System Actions:
│ - Update submission status: "Rejected by Manager"
│ - Notify IC with detailed rejection reason
│ - Log rejection in audit trail
│ - Offer IC option to revise and re-submit
│ - Schedule optional coaching call if IC requests
└───────────────────────────────────────────────────────────┘
                        ↓
                [IC Revises or Abandons]
```

**Postconditions:**
- Submission has approval decision (approved/conditional/rejected)
- IC notified of decision with feedback
- Audit trail updated with approval/rejection details
- If approved: IC can proceed with client submission
- If rejected: IC can revise and re-submit
- If conditional: IC must meet conditions first

---

## 5. Alternative Flows

### 5.1 Multi-Level Approval (CFO Required)

**Trigger:** Submission requires both Pod Manager AND CFO approval

**Flow:**
```
Step 1: Pod Manager approves (as above)
        ↓
Step 2: System routes to CFO for financial approval
        ↓
Step 3: CFO reviews financial impact and risk
        ↓
Step 4: CFO approves/rejects
        ↓
Step 5: Both approvals required → Submission approved
        OR either rejects → Submission rejected
```

### 5.2 Urgent Approval Request

**Trigger:** IC marks submission as "Urgent" (client deadline < 24 hours)

**Flow:**
```
Step 1: IC marks submission as urgent with justification
        ↓
Step 2: System sends high-priority notification to Pod Manager
        - Email: "[URGENT] Approval needed by [time]"
        - Slack: "@manager URGENT approval needed"
        - SMS (if configured)
        ↓
Step 3: Pod Manager reviews within SLA (2 hours)
        ↓
Step 4: If Pod Manager unavailable, escalate to Regional Director
        ↓
Step 5: Approval decision expedited
```

**SLA:** Urgent approvals must be reviewed within 2 hours during business hours.

### 5.3 Pod Manager Unavailable (Out of Office)

**Trigger:** Pod Manager is out of office and approval pending

**Flow:**
```
Step 1: System detects Pod Manager OOO status
        ↓
Step 2: Auto-escalate to designated backup approver:
        - Secondary Pod Manager (if multi-manager pod)
        - Regional Director
        - Another Pod Manager in same region
        ↓
Step 3: Backup approver receives notification
        ↓
Step 4: Backup approver reviews and decides
        ↓
Step 5: Original Pod Manager notified upon return (FYI)
```

**Configuration:** Pod Managers must set backup approver when going OOO.

### 5.4 Approval Escalation (Pod Manager Unsure)

**Trigger:** Pod Manager uncertain about approval decision

**Flow:**
```
Step 1: Pod Manager clicks [Escalate to Regional Director]
        ↓
Step 2: Pod Manager provides context:
        "Unsure if 12% margin is acceptable for this strategic
         client. Seeking Regional Director guidance."
        ↓
Step 3: Regional Director receives escalation
        ↓
Step 4: Regional Director provides decision or guidance
        ↓
Step 5: Pod Manager makes final decision based on guidance
        OR Regional Director approves directly
```

---

## 6. Exception Flows

### 6.1 System Failure (Approval System Down)

**Recovery:**
1. IC emails approval request to Pod Manager directly
2. Pod Manager replies via email with decision
3. When system restored, IC manually enters approval decision
4. Audit log notes "offline approval due to system outage"

### 6.2 Duplicate Approval Request

**Trigger:** Same submission triggers multiple approval requests (system bug)

**Resolution:**
1. System detects duplicate based on submission ID
2. Consolidate into single approval task
3. Notify Pod Manager only once
4. Log duplicate detection in system audit

### 6.3 Approval Timeout (No Decision After 48 Hours)

**Trigger:** Approval pending for > 48 hours without decision

**Flow:**
```
After 24 hours: Reminder notification to Pod Manager
After 48 hours: Escalate to Regional Director
After 72 hours: Auto-reject with note "Approval timeout - resubmit"
```

### 6.4 Post-Approval Discovered Issue

**Trigger:** After approval, issue discovered (e.g., candidate background check fails)

**Resolution:**
1. IC or Pod Manager can revoke approval
2. Submission status changed to "Approval Revoked"
3. New approval required if issue resolved
4. Audit trail logs revocation reason

---

## 7. Approval Criteria & Guidelines

### 7.1 Financial Approval Criteria

**Margin Thresholds:**

| Margin % | Decision | Conditions |
|----------|----------|------------|
| **≥ 25%** | Auto-approve | Standard target met |
| **20-24%** | Pod Manager approve | Acceptable with justification |
| **15-19%** | Pod Manager approve | Requires strong justification |
| **10-14%** | Pod Manager + CFO | Only if strategic value |
| **< 10%** | Reject or CEO exception | Rarely approved |
| **Negative** | Reject unless CEO approves | Only for strategic placements |

**Rate Variance Evaluation:**

```
Job Target Bill Rate: $100/hr
Candidate Submission: $110/hr (+10%)

Questions to Ask:
✓ Is candidate significantly more qualified?
✓ Will client accept higher rate?
✓ Is market rate genuinely higher?
✓ Is this a niche skill commanding premium?

Decision Framework:
- Variance < 10%: Auto-approve
- Variance 10-20%: Approve if justified
- Variance > 20%: Likely reject (too far from target)
```

### 7.2 Risk Assessment Criteria

**Visa/Immigration Risk:**

| Visa Type | Risk Level | Approval Criteria |
|-----------|------------|-------------------|
| **USC, GC** | Low | Auto-approve |
| **H1B (>1 year)** | Low | Auto-approve |
| **H1B (<1 year)** | Medium | Approve if renewal in progress |
| **OPT, EAD** | Medium | Approve if expiry > 6 months |
| **Pending transfer** | High | Approve only if low-risk client |
| **Expired/unclear** | High | Reject until clarified |

**Client Risk Assessment:**

```
Client Payment History:
- Always pays on time: Low risk → Approve
- Occasional delays (< 30 days): Medium risk → Approve with monitoring
- Frequent delays (> 30 days): High risk → Require prepayment or CFO approval
- Outstanding invoices > 60 days: Critical risk → Reject new placements

Client Stability:
- Fortune 500, public company: Low risk
- Established private company (5+ years): Medium risk
- Startup (<2 years): High risk → Require financial review
- New client (first placement): Medium risk → Extra diligence
```

**Candidate Risk Assessment:**

```
Red Flags (Reject or Require Additional Review):
❌ Background check failed
❌ References declined to provide feedback
❌ Gaps in employment unexplained
❌ Visa status unclear or questionable
❌ Unrealistic salary expectations
❌ Poor communication in interview process
❌ Inconsistent resume information

Green Flags (Approve Confidently):
✅ Clean background check
✅ Strong references from previous roles
✅ Stable employment history
✅ Clear and valid work authorization
✅ Realistic expectations
✅ Professional communication
✅ Skills match job requirements
```

### 7.3 Strategic Approval Criteria

**When to Approve Lower Margin:**

1. **Client Volume Potential**
   - Client has 10+ open roles in pipeline
   - Historical volume client (5+ placements/year)
   - Expanding relationship (new division, new project)

2. **Market Entry Strategy**
   - First placement with Fortune 500 target account
   - New vertical or geography we want to penetrate
   - Competitive displacement opportunity

3. **IC Development**
   - Junior IC's first major placement (learning opportunity)
   - IC needs win for morale/confidence
   - Teaching moment for IC to understand margin negotiation

4. **Relationship Preservation**
   - Long-term client with excellent payment history
   - High lifetime value relationship
   - Client facing budget constraints (temporary)

**When to Reject Even Good Margin:**

1. **Compliance Red Flags**
   - Visa status unclear or risky
   - Background check concerns
   - Client asks to bypass standard process

2. **Candidate Instability**
   - Job-hopping pattern (< 1 year tenures)
   - Unreliable in interview process
   - References raise concerns

3. **Client Risk**
   - Outstanding invoices unpaid
   - History of candidate mistreatment
   - Unreasonable demands or contract terms

4. **Strategic Misalignment**
   - Client/vertical we're exiting
   - Low-value transactional work (not strategic)
   - Undermines pod's positioning

---

## 8. Screen Specifications

### 8.1 Screen: Approvals Queue (SCR-MGR-007)

**Route:** `/employee/manager/approvals`
**Access:** Pod Manager, Regional Director
**Layout:** List with filters and batch actions

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ InTime OS - Approvals Queue                   [User Menu ▼]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Approvals Queue                                   [Mark All Read]│
│                                                                  │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│ │ Pending    │ │ Urgent     │ │ Overdue    │ │ Approved   │    │
│ │            │ │            │ │            │ │ Today      │    │
│ │     7      │ │     2      │ │     1      │ │     5      │    │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ [Filters]  [Type: All ▼] [Urgency: All ▼] [IC: All ▼]     │  │
│ │ [🔍 Search approvals...                                   ]│  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ [🔴 URGENT] Submission Approval - Due in 2 hours          │  │
│ │ Jane Doe → Senior Java Dev @ Acme Corp                    │  │
│ │ Requested by: John Smith    Reason: Low Margin (18%)      │  │
│ │ [Review & Approve]                           [1 hour ago] │  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ [🟡 Pending] Offer Approval                               │  │
│ │ Mike Chen → DevOps Engineer @ TechCorp                    │  │
│ │ Requested by: Sarah Lee     Reason: Relocation $8K        │  │
│ │ [Review & Approve]                           [3 hours ago]│  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ [⚠️ Overdue] Job Cancellation Approval                    │  │
│ │ Cloud Architect role @ StartupXYZ                         │  │
│ │ Requested by: Tom Davis     Reason: Client cancelled      │  │
│ │ [Review & Approve]                          [25 hours ago]│  │
│ ├────────────────────────────────────────────────────────────┤  │
│ │ [🟢 Approved] Submission - Approved Today                 │  │
│ │ Alex Kim → Frontend Dev @ DesignCo                        │  │
│ │ Approved by: You            Margin: 22%                   │  │
│ │ [View Details]                              [This morning]│  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ [Load More]                                [Showing 1-10 of 47] │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Modal: Approval Review Detail (MDL-MGR-007)

**Size:** Large (full details)
**Closable:** Yes
**Keyboard:** Tab navigation, Ctrl+Enter to approve

```
┌──────────────────────────────────────────────────────────────────┐
│ Submission Approval Review                                  [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ [Tab: Overview] [Tab: Candidate] [Tab: Job] [Tab: Client]       │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ SUBMISSION OVERVIEW                                        │  │
│ │                                                            │  │
│ │ Candidate: Jane Doe                                        │  │
│ │ Job: Senior Java Developer                                 │  │
│ │ Client: Acme Corp                                          │  │
│ │ Submitted by: John Smith (Technical Recruiter)             │  │
│ │ Submitted: 3 hours ago                                     │  │
│ │                                                            │  │
│ │ ⚠️ APPROVAL REQUIRED: Low Margin (18%)                     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ FINANCIAL DETAILS                                          │  │
│ │                                                            │  │
│ │ Pay Rate:        $82.00 /hr                                │  │
│ │ Bill Rate:       $100.00 /hr                               │  │
│ │ Gross Margin:    $18.00 /hr (18.0%)                        │  │
│ │ Target Margin:   25% (⚠️ Below target by 7%)               │  │
│ │                                                            │  │
│ │ Annual Revenue (est): $208,000                             │  │
│ │ Annual Margin (est):  $37,440                              │  │
│ │                                                            │  │
│ │ Employment Type: W2                                        │  │
│ │ Duration: 12 months (estimated)                            │  │
│ │ Start Date: 2025-12-15                                     │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ SPECIAL TERMS & RISKS                                      │  │
│ │                                                            │  │
│ │ ✓ Relocation Assistance: $5,000 (one-time)                │  │
│ │ ✓ Visa Status: H1B valid through 2027-06-30               │  │
│ │ ⚠️ Client Payment History: 2 invoices 15+ days late (2024) │  │
│ │ ✓ Background Check: Passed (2025-11-28)                   │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ IC JUSTIFICATION                                           │  │
│ │                                                            │  │
│ │ "Acme Corp is a high-volume strategic account with 8      │  │
│ │ active jobs and 12 in pipeline. While this margin is      │  │
│ │ below our 25% target, the client has committed to 3 more  │  │
│ │ roles in Q1 2026 at standard rates. Jane is an            │  │
│ │ exceptional fit - 10 years Java experience, AWS certified,│  │
│ │ and has worked in similar environments. Client is eager   │  │
│ │ to hire and we can make up the margin shortfall on future │  │
│ │ placements. I recommend approval to strengthen this       │  │
│ │ strategic relationship."                                   │  │
│ │                                                            │  │
│ │ - John Smith, Technical Recruiter                         │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ MANAGER DECISION                                           │  │
│ │                                                            │  │
│ │ ○ Approve                                                  │  │
│ │   Proceed with submission as-is                           │  │
│ │                                                            │  │
│ │ ○ Approve with Conditions                                 │  │
│ │   Approve only if specific conditions are met             │  │
│ │                                                            │  │
│ │ ○ Reject                                                   │  │
│ │   Do not proceed, provide feedback to IC                  │  │
│ │                                                            │  │
│ │ ○ Escalate to Regional Director                           │  │
│ │   Need additional guidance or authority                   │  │
│ │                                                            │  │
│ │ Comments / Conditions (Required):                          │  │
│ │ ┌──────────────────────────────────────────────────────┐   │  │
│ │ │                                                      │   │  │
│ │ │                                                      │   │  │
│ │ │                                                      │   │  │
│ │ └──────────────────────────────────────────────────────┘   │  │
│ │                                                            │  │
│ │ [Cancel]                              [Submit Decision]    │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Field Specifications

### 9.1 Approval Request Fields

| Field | Type | Required | Validation | Default | Notes |
|-------|------|----------|------------|---------|-------|
| submission_id | uuid | Yes | Valid submission | - | FK to submissions |
| approval_type | enum | Yes | submission, offer, job_cancel, contract, etc. | - | Type of approval |
| approval_level | enum | Yes | pod_manager, cfo, ceo | pod_manager | Escalation level |
| requester_id | uuid | Yes | Valid user (IC) | Current user | Who requested |
| approver_id | uuid | Yes | Valid user (Manager+) | - | Who must approve |
| status | enum | Yes | pending, approved, rejected, escalated | pending | Current status |
| urgency | enum | Yes | normal, urgent, critical | normal | Priority level |
| reason | text | Yes | min:10 chars | - | Why approval needed |
| justification | text | Yes | min:50 chars | - | IC's justification |
| financial_impact | decimal | No | - | null | Dollar impact |
| risk_flags | string[] | No | - | [] | Risk indicators |
| requested_at | timestamp | Yes | - | Now | When requested |
| due_by | timestamp | No | Future date | null | Deadline (if urgent) |
| reviewed_at | timestamp | No | - | null | When reviewed |
| decision | enum | No | approved, conditional, rejected, escalated | null | Final decision |
| decision_comments | text | No | - | null | Manager feedback |
| conditions | text | No | - | null | Approval conditions |

### 9.2 Approval Decision Audit

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| approval_id | uuid | Yes | FK to approvals |
| approver_id | uuid | Yes | Who made decision |
| decision | enum | Yes | approved, conditional, rejected, escalated |
| comments | text | Yes | Required feedback |
| conditions | text | No | If conditional approval |
| escalated_to | uuid | No | If escalated |
| decision_timestamp | timestamp | Yes | Exact time of decision |
| ip_address | string | No | Audit trail |
| user_agent | string | No | Audit trail |

---

## 10. Business Rules

### 10.1 Approval Routing Rules

1. **Auto-Approval Threshold:** Submissions meeting standard criteria (margin ≥25%, standard terms) do NOT require approval
2. **Single Approver:** Most approvals require only Pod Manager
3. **Multi-Approver:** CFO approval required for margin <15%, visa sponsorship, or relocation >$10K
4. **Sequential Approval:** Multi-level approvals must be sequential (Pod Manager → CFO → CEO)
5. **Timeout Rule:** Approvals pending >72 hours auto-reject with "timeout" reason

### 10.2 Approval Authority Rules

1. **Pod Manager Authority:** Can approve up to 15% margin, $10K relocation, standard terms
2. **CFO Authority:** Required for 10-14% margin, negative margin, >$10K costs
3. **CEO Authority:** Required for negative margin >$5K annually, strategic exceptions
4. **Backup Approver:** Pod Manager must designate backup when OOO >24 hours
5. **Override Restriction:** Approvals cannot be self-approved (IC cannot approve own submission)

### 10.3 Notification Rules

1. **Immediate Notification:** Approver notified within 1 minute of approval request
2. **Reminder Schedule:**
   - First reminder: 24 hours after request
   - Second reminder: 48 hours after request
   - Escalation: 72 hours after request (auto-escalate to Regional Director)
3. **Urgent Notification:** Urgent requests trigger email + Slack + SMS (if configured)
4. **Decision Notification:** IC notified immediately upon approval/rejection
5. **Stakeholder Notification:** COO always informed of approvals (Informed role in RACI)

---

## 11. Integration Points

### 11.1 tRPC Procedures

```typescript
// Request approval
approvals.request({
  input: {
    submissionId: string;
    approvalType: 'submission' | 'offer' | 'job_cancel' | 'contract';
    urgency: 'normal' | 'urgent' | 'critical';
    justification: string;
    financialImpact?: number;
    riskFlags?: string[];
  };
  output: {
    approvalId: string;
    status: 'pending' | 'auto_approved';
    approvers: User[];
    estimatedReviewTime: number; // minutes
  };
});

// Submit approval decision
approvals.decide({
  input: {
    approvalId: string;
    decision: 'approved' | 'conditional' | 'rejected' | 'escalated';
    comments: string;
    conditions?: string;
    escalateTo?: string;
  };
  output: {
    success: boolean;
    finalStatus: string;
    nextSteps: string;
  };
});

// Get approval queue
approvals.list({
  input: {
    status?: 'pending' | 'approved' | 'rejected';
    urgency?: 'normal' | 'urgent' | 'critical';
    requesterId?: string;
    page?: number;
    pageSize?: number;
  };
  output: {
    items: Approval[];
    total: number;
    pending: number;
    overdue: number;
  };
});
```

### 11.2 System Side Effects

**On Approval Request Created:**
1. Calculate approval level based on thresholds
2. Assign to appropriate approver(s)
3. Send notifications (email, Slack, SMS if urgent)
4. Create audit log entry
5. Update submission status to "Pending Approval"
6. Add to approver's queue
7. Notify COO (Informed role)

**On Approval Decision:**
1. Update approval status
2. Notify IC of decision
3. If approved: unlock submission for client submission
4. If rejected: allow IC to revise and re-submit
5. If conditional: require IC confirmation of conditions met
6. If escalated: route to next approver
7. Create audit log entry
8. Update Pod Manager activity feed

---

## 12. Metrics & Analytics

### 12.1 Approval Metrics

| Metric | Target | Purpose |
|--------|--------|---------|
| **Approval Response Time** | < 4 hours (normal), < 2 hours (urgent) | Measure responsiveness |
| **Approval Rate** | 70-85% approved | Balance between enablement and control |
| **Conditional Approval Rate** | 10-15% | Coaching opportunities |
| **Rejection Rate** | 5-15% | Quality control |
| **Escalation Rate** | < 5% | Manager confidence |
| **Timeout Rate** | < 2% | Process adherence |
| **Re-submission Success Rate** | > 80% after rejection | IC learning |

### 12.2 Pod Manager Approval Dashboard

**Metrics Displayed:**
- Pending approvals (count, oldest request)
- Approvals this week (approved/rejected/conditional)
- Average response time
- Approval rate trend (last 90 days)
- Most common approval types
- ICs with most approval requests (coaching opportunity)

---

## 13. Test Cases

### TC-MGR-007-001: Approve Standard Submission with Low Margin

**Priority:** Critical
**Type:** E2E
**Automated:** Yes

**Preconditions:**
- Logged in as Pod Manager
- Submission with 18% margin pending approval

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to /employee/manager/approvals | Approvals queue displayed |
| 2 | Click pending submission | Approval review modal opens |
| 3 | Review financial details | Margin 18% shown, below 25% target |
| 4 | Read IC justification | Justification displayed |
| 5 | Select "Approve" | Approve option selected |
| 6 | Enter approval comments | Comments field populated |
| 7 | Click [Submit Decision] | Approval processed |
| 8 | Verify IC notified | IC receives approval notification |
| 9 | Verify submission unlocked | IC can submit to client |

**Postconditions:**
- Submission status: "Approved"
- Audit log entry created
- IC notified via email and in-app

### TC-MGR-007-002: Reject Submission with Excessive Risk

**Priority:** High
**Type:** E2E
**Automated:** Yes

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Review submission with visa expiring in 2 months | Risk flag displayed |
| 2 | Select "Reject" | Reject option selected |
| 3 | Enter rejection reason with guidance | Detailed feedback provided |
| 4 | Click [Submit Decision] | Rejection processed |
| 5 | Verify IC notified with feedback | IC receives rejection with next steps |

### TC-MGR-007-003: Conditional Approval Requiring Client Commitment

**Priority:** Medium
**Type:** E2E
**Automated:** Yes

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Review submission with low margin | Margin 16% flagged |
| 2 | Select "Approve with Conditions" | Conditional option selected |
| 3 | Enter conditions: "Approve only if client commits to 3+ roles in Q1" | Conditions documented |
| 4 | Click [Submit Decision] | Conditional approval processed |
| 5 | IC addresses conditions | IC confirms client commitment |
| 6 | Verify auto-approval upon confirmation | Submission auto-approved when condition met |

---

## 14. Accessibility

**WCAG 2.1 AA Compliance:**
- Approval queue keyboard navigable (Tab, Enter, Arrow keys)
- Screen reader announces approval count, urgency, and details
- Color contrast: Red (urgent), Yellow (pending), Green (approved) - 4.5:1 ratio
- Focus indicators visible on all interactive elements
- ARIA labels: "7 pending approvals, 2 urgent"

---

## 15. Mobile Considerations

**Responsive Design:**
- **Desktop (1024px+):** Full approval detail modal
- **Tablet (640-1024px):** Stacked approval cards, simplified detail view
- **Mobile (<640px):** Single-column list, swipe actions for approve/reject

**Mobile Approval Actions:**
- Swipe right: Quick approve
- Swipe left: Quick reject
- Tap: Full detail view
- Long-press: Batch select for approval

---

## 16. Security

**Authorization:**
- Only assigned approver can approve/reject
- No self-approval (IC cannot approve own submission)
- Audit trail for all approval decisions
- Approvals cannot be deleted, only reversed with justification

**Data Protection:**
- Sensitive approval data (SSN, visa details) encrypted at rest
- PII visible only to approver and stakeholders
- Approval history retained for 7 years (compliance)

---

## 17. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | System Architect | Initial complete specification for Pod Manager approval workflows |

---

**End of UC-MGR-007: Pod Manager Approval Workflows**
