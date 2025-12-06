# Use Case: Negotiate Offer

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-G02 |
| Actor | Recruiter |
| Goal | Handle offer negotiations between candidate and client to reach agreement |
| Frequency | 2-4 times per week |
| Estimated Time | 15-60 minutes (may span multiple days) |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. Initial offer has been extended
3. Candidate has responded with counter or questions
4. Authority to negotiate within defined parameters

---

## Trigger

- Candidate submits counter-offer
- Candidate requests rate increase
- Candidate negotiates benefits or terms
- Client willing to adjust offer

---

## Main Flow

### Step 1: Review Counter-Offer

**User Action:** Open counter-offer notification

**Screen State:**
```
+----------------------------------------------------------+
|                    Offer Negotiation                  [×] |
+----------------------------------------------------------+
| Candidate: Jane Doe | Offer: Senior Backend @ TechStart   |
| Status: Counter-Offer Received                            |
+----------------------------------------------------------+
|                                                           |
| OFFER COMPARISON                                          |
| ┌────────────────────────────────────────────────────┐  |
| │                Original    Counter     Difference  │  |
| │ ─────────────────────────────────────────────────  │  |
| │ Pay Rate       $100/hr     $110/hr     +$10/hr    │  |
| │ Bill Rate      $125/hr     $137.50/hr  +$12.50/hr │  |
| │ Margin         20%         20%         Same       │  |
| │ Start Date     Jan 6       Jan 13      +1 week    │  |
| │ PTO Days       15          18          +3 days    │  |
| │                                                     │  |
| │ IMPACT ANALYSIS                                    │  |
| │ Annual Cost Increase: $17,680                      │  |
| │ Margin Impact: None (maintained 20%)               │  |
| │ Client Approval: Required (rate increase)         │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CANDIDATE'S MESSAGE                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ "Thank you for the offer! I'm very excited about  │  |
| │ TechStart. Based on my research and current market│  |
| │ rates for senior backend engineers with payment   │  |
| │ experience, I was hoping for $110/hr. I'd also    │  |
| │ like to push start date to Jan 13 to wrap up my   │  |
| │ current project properly. Would this work?"       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NEGOTIATION OPTIONS                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ ● Accept Counter (Approve candidate's request)    │  |
| │   Requires client approval for rate increase      │  |
| │                                                     │  |
| │ ○ Make Counter-Offer                               │  |
| │   Propose alternative: $105/hr, original start    │  |
| │                                                     │  |
| │ ○ Decline Counter (Hold original offer)           │  |
| │   Risk: Candidate may decline                     │  |
| │                                                     │  |
| │ ○ Add Non-Monetary Benefits                       │  |
| │   WFH flexibility, signing bonus, etc.           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CLIENT APPROVAL                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Rate increase requires client approval.            │  |
| │                                                     │  |
| │ New Bill Rate: $137.50/hr                          │  |
| │ Client Budget: Up to $140/hr ✅ Within budget     │  |
| │                                                     │  |
| │ [Request Client Approval]                          │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

---

### Step 2: Request Client Approval

**User Action:** Click "Request Client Approval"

**Screen State:**
```
+----------------------------------------------------------+
|                  Client Approval Request              [×] |
+----------------------------------------------------------+
|                                                           |
| To: Sarah Chen (Hiring Manager)                           |
| Subject: Rate Adjustment - Jane Doe                       |
|                                                           |
| MESSAGE                                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ Hi Sarah,                                          │  |
| │                                                     │  |
| │ Jane Doe has countered our offer with a rate      │  |
| │ request of $110/hr (vs. original $100/hr).        │  |
| │                                                     │  |
| │ To maintain our 20% margin, the bill rate would   │  |
| │ increase to $137.50/hr, still within your         │  |
| │ approved budget of $140/hr.                       │  |
| │                                                     │  |
| │ She's also requesting a 1-week delayed start      │  |
| │ (Jan 13 vs Jan 6) to wrap up her current project.│  |
| │                                                     │  |
| │ Jane is our top candidate and I believe she's    │  |
| │ worth the investment given her payment processing │  |
| │ expertise.                                         │  |
| │                                                     │  |
| │ Can you approve this adjustment?                   │  |
| │                                                     │  |
| │ [Approve] [Decline] [Discuss]                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
|                       [Cancel]  [Send Request ✓]         |
+----------------------------------------------------------+
```

---

### Step 3: Process Approval and Update Offer

**User Action:** Client approves, update offer

**System Response:**
1. Offer terms updated
2. New offer letter generated (if needed)
3. Candidate notified of approval
4. Offer status updated

---

## Postconditions

1. ✅ Negotiation documented
2. ✅ Client approval obtained (if needed)
3. ✅ Offer terms finalized
4. ✅ Candidate notified
5. ✅ Updated offer ready for acceptance

---

## Negotiation Parameters

| Item | Recruiter Authority | Manager Approval |
|------|---------------------|------------------|
| Rate ±5% | ✅ Can approve | Not needed |
| Rate >5% | ❌ Cannot approve | Required |
| Start date ±2 weeks | ✅ Can approve | Not needed |
| PTO ±5 days | ❌ Cannot approve | Required |
| Signing bonus | ❌ Cannot approve | Required |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `offer.counter_received` | `{ offer_id, counter_terms }` |
| `offer.negotiation_completed` | `{ offer_id, final_terms }` |
| `approval.requested` | `{ offer_id, approver, changes }` |

---

## Related Use Cases

- [G01-extend-offer.md](./G01-extend-offer.md) - Initial offer
- [G03-confirm-placement.md](./G03-confirm-placement.md) - After acceptance

---

*Last Updated: 2025-12-05*

