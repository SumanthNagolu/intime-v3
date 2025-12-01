# UC-BENCH-018: Negotiate Rates & Margins

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Bench Sales Recruiter
**Status:** Approved

---

## 1. Overview

This use case describes the complete rate negotiation process for bench sales placements, including understanding the rate stack (consultant pay → InTime cost → vendor fee → client bill rate), calculating margins, applying approval thresholds, and negotiating with consultants, vendors, and clients. Effective rate negotiation is critical to bench sales success, balancing competitiveness, consultant satisfaction, vendor relationships, and InTime profitability.

---

## 2. Actors

- **Primary:** Bench Sales Recruiter
- **Secondary:** Consultant, Vendor Partner, Client Contact, Bench Sales Manager, Finance Team, Regional Director, CFO
- **System:** Rate Calculator, Margin Analyzer, Approval Workflow Engine

---

## 3. Preconditions

- Consultant is qualified and onboarded (preferred contract type and pay rate expectations documented)
- External job requirement identified with client bill rate or range
- Vendor relationship established (if applicable) with commission terms documented
- Recruiter understands InTime margin targets and approval thresholds

---

## 4. Trigger

- Recruiter identifies matching requirement for bench consultant
- Consultant requests rate adjustment
- Vendor negotiates commission terms
- Client pushes back on proposed bill rate
- Manager requests rate review for low-margin placement

---

## 5. Main Flow

### Step 1: Understand the Rate Stack

**1.1 Rate Stack Components**

```
┌─────────────────────────────────────────────────────────────────┐
│                    RATE STACK BREAKDOWN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CLIENT BILL RATE: $100/hr                                      │
│  (What client pays)                                             │
│         ↓                                                       │
│         ├─→ Vendor Commission: $5/hr (5%)                       │
│         │   (If vendor provided the requirement)                │
│         │                                                       │
│         └─→ InTime Receives: $95/hr                            │
│             ↓                                                   │
│             ├─→ InTime Margin: $20/hr (21%)                    │
│             │   (InTime's profit)                               │
│             │                                                   │
│             └─→ Consultant Pay Rate: $75/hr                    │
│                 ↓                                               │
│                 └─→ Consultant Net (after taxes): ~$60/hr     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ALTERNATIVE: InTime Direct (No Vendor)                         │
├─────────────────────────────────────────────────────────────────┤
│  CLIENT BILL RATE: $100/hr                                      │
│         ↓                                                       │
│         └─→ InTime Receives: $100/hr (No vendor commission)    │
│             ↓                                                   │
│             ├─→ InTime Margin: $25/hr (25%)                    │
│             └─→ Consultant Pay: $75/hr                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**1.2 Rate Stack Variables**

| Variable | Description | Typical Range | Negotiable? |
|----------|-------------|---------------|-------------|
| **Client Bill Rate** | What end client pays per hour | $50-200/hr | Yes (with client) |
| **Vendor Commission** | % or $ amount vendor receives | 3-10% of bill rate | Yes (with vendor) |
| **InTime Margin** | InTime's profit per hour | $18-30/hr (18-30%) | Internal target, not negotiable with external parties |
| **Consultant Pay Rate** | What consultant receives per hour | $40-150/hr | Yes (with consultant) |
| **Consultant Net** | Take-home after taxes | Varies by tax bracket | Informational only |

**1.3 Key Relationships**

```
Client Bill Rate = InTime Margin + Consultant Pay Rate + Vendor Commission

InTime Margin % = (InTime Margin $) / (Client Bill Rate) × 100

Example:
$100/hr = $20/hr + $75/hr + $5/hr
20% = ($20) / ($100) × 100
```

### Step 2: Use the Rate Calculator Tool

**2.1 Access Rate Calculator**

Navigate to: `/employee/workspace/bench/tools/rate-calculator`

**2.2 Calculator Interface**

```
┌────────────────────────────────────────────────────────────────┐
│ 📊 RATE CALCULATOR                            [Save] [Clear]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ INPUTS                                                         │
│                                                                │
│ Client Bill Rate ($/hr) *                                      │
│ ┌──────────────────────┐  Currency: [USD ▼]                   │
│ │ 100.00               │                                       │
│ └──────────────────────┘                                       │
│                                                                │
│ Consultant Pay Rate ($/hr) *                                   │
│ ┌──────────────────────┐  Contract Type: [C2C ▼]              │
│ │ 75.00                │                                       │
│ └──────────────────────┘                                       │
│                                                                │
│ Vendor Commission                                              │
│ ● Percentage: [5.0]% of bill rate                             │
│ ○ Fixed Amount: $[____]/hr                                    │
│ ○ No vendor (InTime direct)                                   │
│                                                                │
│ Hours per Week: [40]  (Standard: 40, Overtime: 1.5x)          │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ CALCULATIONS (Auto-Update)                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Client Bill Rate:        $100.00/hr                            │
│                                                                │
│ - Vendor Commission:     - $5.00/hr (5%)                       │
│ = InTime Receives:       = $95.00/hr                          │
│                                                                │
│ - Consultant Pay Rate:   - $75.00/hr                           │
│ = InTime Margin:         = $20.00/hr                          │
│                                                                │
│ InTime Margin %:         21.1% ✅ Above target (18%)          │
│                                                                │
│ ──────────────────────────────────────────────────────────────│
│                                                                │
│ MONTHLY PROJECTIONS (160 hours/month)                         │
│                                                                │
│ Client Invoice:          $16,000/month                         │
│ Vendor Commission:       -$800/month                           │
│ InTime Revenue:          $15,200/month                         │
│ Consultant Pay:          -$12,000/month                        │
│ InTime Margin:           $3,200/month                          │
│                                                                │
│ ──────────────────────────────────────────────────────────────│
│                                                                │
│ MARGIN ANALYSIS                                                │
│                                                                │
│ Status: ✅ APPROVED (Margin ≥18%)                              │
│                                                                │
│ Margin Tier: Standard (20-25%)                                │
│ Approval Required: None (auto-approved)                        │
│                                                                │
│ ⚠️ Alerts:                                                     │
│ • None                                                         │
│                                                                │
│ [Show Negotiation Scenarios] [Export PDF]                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**2.3 Margin Thresholds & Approval Matrix**

| InTime Margin % | Status | Approval Required | Notes |
|-----------------|--------|------------------|-------|
| **≥25%** | 🟢 Excellent | None (auto-approved) | Optimal margin, highly profitable |
| **22-24%** | 🟢 Good | None (auto-approved, notify manager) | Standard target met |
| **18-21%** | 🟡 Acceptable | Manager notification required | Below target, document justification |
| **15-17%** | 🟠 Marginal | Manager approval required | Minimum margin, strategic only |
| **12-14%** | 🔴 Low | Manager + Finance approval | Below minimum, volume deal only |
| **<12%** | 🔴 Rejected | Regional Director + CFO approval | Exception, must have compelling reason (loss leader, high volume, strategic client) |

**System Behavior:**
- **≥22%:** Auto-approve, recruiter can proceed with placement
- **18-21%:** Manager notification sent, recruiter can proceed but must document justification
- **15-17%:** Manager must explicitly approve before placement
- **12-14%:** Manager + Finance must approve
- **<12%:** Escalate to Regional Director + CFO (rare, exceptional circumstances only)

### Step 3: Research Market Rates

**3.1 Market Data Sources**

| Source | URL/Access | Data Provided | Frequency |
|--------|------------|---------------|-----------|
| **Dice Salary Calculator** | dice.com/salary-calculator | Pay rates by skill, location, experience | Updated quarterly |
| **Indeed Salary Tool** | indeed.com/salaries | Crowdsourced salary data | Real-time |
| **Robert Half Salary Guide** | roberthalf.com/salary-guide | Annual salary guide (convert to hourly) | Annually |
| **Internal InTime Database** | `/bench/reports/market-rates` | Historical placement rates (InTime data) | Real-time |
| **Vendor Rate Surveys** | Email vendors directly | What vendors are paying for similar skills | Monthly/Quarterly |

**3.2 Sample Market Rate Research**

**Scenario:** Java Developer, 5 years experience, New York, NY

| Source | Reported Pay Rate | Bill Rate | Notes |
|--------|------------------|-----------|-------|
| Dice | $70-85/hr | $95-115/hr | Based on 50 postings |
| Indeed | $75-90/hr | Not provided | Crowdsourced |
| Robert Half | $68-82/hr | $90-110/hr | 2025 Salary Guide |
| InTime Historical | $72-80/hr | $98-108/hr | Last 10 placements |
| Vendor Survey (TechStaff) | $75/hr | $100/hr | Recent placement |

**Conclusion:** Market pay rate for this profile is **$70-85/hr**, bill rate **$95-115/hr**.

**3.3 Adjust for Variables**

| Factor | Adjustment | Example |
|--------|-----------|---------|
| **Higher cost of living** | +10-20% | NYC, SF, Seattle |
| **Lower cost of living** | -10-20% | Rural areas, smaller cities |
| **In-demand skills** | +15-30% | AI/ML, Blockchain, Cloud (AWS, Azure) |
| **Legacy/niche skills** | +20-40% | Mainframe, SAP, Salesforce |
| **Security clearance** | +20-50% | Government/Defense roles |
| **Remote vs Onsite** | Remote: -5-10% | Location flexibility |
| **Contract duration** | Long-term (12+ months): -5% | Rate stability vs short-term premium |
| **Urgency** | Client urgent need: +10-20% | Leverage scarcity |

### Step 4: Negotiate with Consultant

**4.1 Consultant Expects Higher Rate Than Market**

**Scenario:** Consultant wants $90/hr, but market data shows $70-85/hr is standard.

**Approach:**

1. **Acknowledge and Validate**
   ```
   "I understand you're looking for $90/hr. Let me share some market data
   I've researched to ensure we're aligned on realistic expectations."
   ```

2. **Present Market Data**
   - Show Dice, Indeed, InTime historical data
   - Explain typical range for their skills/experience/location
   - Be transparent: "The market is currently paying $70-85/hr for your profile."

3. **Explore Justification**
   ```
   "Is there anything that sets you apart that would justify a higher rate?
   - Specialized certifications?
   - Rare skill combination?
   - Proven track record of high performance?"
   ```

4. **Negotiate to Middle Ground**
   - If consultant has valid justification (rare skills, strong track record):
     - Offer mid-to-high end of market range: $82/hr
   - If consultant has no strong differentiator:
     - Offer mid-market: $75-78/hr
   - If consultant is inflexible at $90/hr:
     - "I'd love to work with you, but $90/hr is 15% above market and our clients
        won't pay that premium. If you're flexible on rate, we can move forward.
        Otherwise, let's stay in touch and revisit if market conditions change."

5. **Offer Non-Rate Incentives (if W2)**
   - "While we can't go to $90/hr, we can offer:
     - Comprehensive health insurance (worth ~$500/month)
     - 401k matching (up to 5%)
     - Paid time off
     - Total compensation package is competitive when you factor in benefits."

**4.2 Consultant Rate Negotiation Call Script**

```
Hi [Consultant Name],

I wanted to discuss the rate for the [Job Title] role at [Client Name].

Based on my research of market rates for [Skills] with [Years] years experience
in [Location], the current market range is $[Low]-[High]/hr.

You mentioned you're looking for $[Consultant's Ask]/hr. Let me explain how
that compares:

- Market Low: $[Low]/hr
- Market Average: $[Mid]/hr
- Market High: $[High]/hr
- Your Ask: $[Ask]/hr (X% above market high)

I want to be transparent about what's realistic. Here's what I can offer:

Option 1 (C2C): $[Rate]/hr - This is at the high end of market range.
Option 2 (W2): $[Rate-20%]/hr + benefits (health, 401k, PTO) - Total comp is comparable.

Given your [specific strengths: certifications, experience, etc.], I think
$[Rate]/hr is a strong, competitive offer that reflects your value.

What do you think? Are you comfortable moving forward at this rate?

[Pause for response]

[If consultant pushes back]:
I understand you'd like to be at $[Higher Rate]. Let me take this back to my
manager and see if there's any flexibility. I'll need to justify the higher
rate to leadership, so can you help me understand what differentiates you
from other candidates at the market rate? [Listen for unique value props]

[If consultant agrees]:
Great! I'll move forward with submitting you to the client at $[Bill Rate]/hr,
which gives you $[Pay Rate]/hr. I'll prepare the submission and keep you updated.
```

### Step 5: Negotiate with Vendor (Commission)

**5.1 Vendor Requests Higher Commission**

**Scenario:** Vendor agreement states 5% commission, but vendor asks for 7% on specific placement due to "exclusive candidate."

**Approach:**

1. **Review Vendor Agreement**
   - Check contract: Does it allow rate exceptions?
   - Check tier structure: Is vendor close to next tier (lower commission at higher volume)?

2. **Evaluate Request**
   - Is candidate truly exclusive? (Can we source similar candidate elsewhere?)
   - What's the impact on InTime margin?
     - Original: 5% vendor commission → 21% InTime margin
     - Requested: 7% vendor commission → 19% InTime margin (still above 18% threshold)
   - Is this a strategic placement? (High-value client, long-term contract?)

3. **Counter-Offer Options**

   **Option A: Accept (if margin still >18%)**
   ```
   "I reviewed your request for 7% commission on this placement. Given the
   candidate's strong fit and our long-standing partnership, I can approve
   7% for this placement. Let's move forward."
   ```

   **Option B: Negotiate Down**
   ```
   "I understand you'd like 7%, but our agreement specifies 5% for this tier.
   I can offer 6% as a one-time accommodation given the candidate's exclusivity.
   Does that work?"
   ```

   **Option C: Reject (if margin too low)**
   ```
   "I appreciate the strong candidate, but 7% commission would put our margin
   below threshold (19% → 17% after commission). Our agreement is 5%, and I
   need to stay within those terms. If you can provide the candidate at 5%,
   we'll move forward. Otherwise, I'll need to pass on this one."
   ```

4. **Document Exception**
   - If approved, document reason in vendor notes:
     ```
     "Exception approved: 7% commission (vs standard 5%) for Jane Doe placement
     due to exclusive candidate with rare Mainframe + Java skillset. Manager
     approval: [Manager Name], Date: [Date]."
     ```

**5.2 Vendor Commission Negotiation Email Template**

```
Subject: Commission Discussion - [Candidate Name] → [Job Title]

Hi [Vendor Contact],

Thank you for submitting [Candidate Name] for the [Job Title] role. I reviewed
the profile and agree the candidate is a strong fit.

I wanted to discuss the commission structure for this placement. Per our
agreement (Section 4.2), the commission rate for Tier 1 (1-5 placements/quarter)
is 5% of bill rate.

You mentioned you'd like 7% for this placement due to the candidate's exclusivity.

Here's my analysis:
- Bill Rate: $100/hr
- Standard Commission (5%): $5/hr → InTime Margin: 21%
- Requested Commission (7%): $7/hr → InTime Margin: 19%

While the candidate is strong, a 7% commission impacts our margin significantly.

Proposal: I can offer 6% commission ($6/hr) as a one-time accommodation. This
recognizes the candidate's unique value while keeping us within margin targets.

Alternatively, if you submit [X] more candidates this quarter and move to Tier 2
(6+ placements), the commission drops to 4% across all placements, which is
better for both of us at scale.

Let me know your thoughts. If 6% works, I'll move forward with the submission today.

Best,
[Your Name]
```

### Step 6: Negotiate with Client (Bill Rate)

**6.1 Client Pushes Back on Bill Rate**

**Scenario:** Recruiter proposes $100/hr bill rate, client counters with $90/hr.

**Approach:**

1. **Understand Client's Position**
   ```
   "I appreciate your feedback on the rate. Can you help me understand what's
   driving the $90/hr target? Is it:
   - Budget constraints?
   - Internal equity (other contractors at $90/hr)?
   - Market comparison (competitors offering lower rates)?"
   ```

2. **Justify Value**
   - Highlight consultant's unique qualifications:
     - "Our candidate has [specific skill/certification] that's rare in the market."
     - "They've delivered [specific achievement] in similar roles."
     - "Average time-to-productivity is [X] weeks faster due to their experience."
   - Show market data:
     - "Market rates for this skillset are $95-115/hr. Our $100/hr is competitive."

3. **Calculate Impact on InTime Margin**

   | Scenario | Bill Rate | Pay Rate | Vendor Commission | InTime Margin | Margin % | Feasible? |
   |----------|-----------|----------|-------------------|---------------|----------|-----------|
   | **Original** | $100/hr | $75/hr | $5/hr (5%) | $20/hr | 20% | ✅ Yes |
   | **Client Counter** | $90/hr | $75/hr | $5/hr | $10/hr | 11% | ❌ No (below 18%) |
   | **Option 1: Reduce pay rate** | $90/hr | $65/hr | $5/hr | $20/hr | 22% | ✅ Yes (must renegotiate with consultant) |
   | **Option 2: Reduce vendor commission** | $90/hr | $75/hr | $0/hr | $15/hr | 17% | ⚠️ Marginal (requires manager approval) |

4. **Counter-Offer Strategies**

   **Strategy A: Meet in Middle**
   ```
   "I understand $90/hr is your target. Given the candidate's strong qualifications,
   I can come down to $95/hr. This is still competitive with market, and ensures
   we can attract and retain top talent for your project."
   ```

   **Strategy B: Volume Discount**
   ```
   "I can offer $90/hr if you can commit to [2+] consultants or a [12+ month]
   contract. The volume/duration allows us to reduce our margin and pass savings
   to you."
   ```

   **Strategy C: Scope Trade-Off**
   ```
   "At $90/hr, we'd need to adjust the scope slightly:
   - Option 1: $90/hr for a mid-level consultant (3-5 years experience)
   - Option 2: $100/hr for the senior consultant you requested (7+ years)

   Which would you prefer?"
   ```

   **Strategy D: Accept Lower Rate, Adjust Consultant Pay**
   - Renegotiate with consultant: "Client can only pay $90/hr. Can you do $65/hr
     instead of $75/hr? Still at market rate for your profile."
   - If consultant agrees → Proceed at $90/hr bill rate
   - If consultant declines → Find alternative candidate or walk away

5. **When to Walk Away**
   - If client's rate results in <15% margin and Manager does not approve exception
   - If client is demanding unrealistic rates far below market (e.g., $60/hr for senior Java developer)
   - If rate negotiation becomes adversarial (damages long-term relationship)

**6.2 Client Rate Negotiation Email Template**

```
Subject: Rate Discussion - [Job Title] - [Req ID]

Hi [Client Contact],

Thank you for your feedback on the $100/hr rate for the [Job Title] role.

I understand you'd prefer to be at $90/hr. Let me provide some context on
how we arrived at $100/hr:

Market Analysis:
- Average bill rate for [Skill] with [Years] experience in [Location]: $95-115/hr
- Our proposed rate ($100/hr) is at the low end of this range

Candidate Value:
- [Candidate Name] has [specific qualification/achievement]
- [Quantifiable benefit: e.g., "Reduced deployment time by 40% in previous role"]
- [Certification/specialization that's in high demand]

Proposal:
Given our strong partnership and your feedback, I can offer the following:

Option 1: $95/hr (5% discount from original proposal)
   - Best value: Senior-level candidate with proven track record
   - Fast start (available immediately, minimal onboarding)

Option 2: $90/hr for volume commitment
   - If you can commit to 2+ consultants or 12+ month contract
   - Volume pricing allows us to reduce margin and pass savings to you

Option 3: $90/hr with scope adjustment
   - We can provide a mid-level candidate (3-5 years vs 7+ years)
   - Still meets core requirements but less experience

Which option works best for your budget and project needs?

I'm committed to finding a solution that works for both of us. Let's discuss
on our call tomorrow at [Time].

Best,
[Your Name]
```

### Step 7: Apply for Rate Override/Approval

**7.1 When Margin is Below Threshold**

If negotiation results in margin **15-17%** (requires Manager approval) or **<15%** (requires Director/CFO approval):

**7.2 Navigate to Rate Approval Workflow**

- In Rate Calculator, click **[Request Approval]**
- Modal opens:

```
┌────────────────────────────────────────────────────────────┐
│ Request Rate Override Approval                        [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ RATE DETAILS                                               │
│                                                            │
│ Consultant: Jane Doe                                       │
│ Job: Senior Java Developer @ Acme Corp                     │
│ Req ID: #12345                                             │
│                                                            │
│ Bill Rate: $90/hr                                          │
│ Pay Rate: $75/hr                                           │
│ Vendor Commission: $5/hr (5%)                              │
│ InTime Margin: $10/hr (11.1%) ⚠️ BELOW THRESHOLD          │
│                                                            │
│ Target Margin: 18% minimum                                 │
│ Shortfall: -6.9%                                           │
│                                                            │
│ ──────────────────────────────────────────────────────────│
│                                                            │
│ JUSTIFICATION (Required) *                                 │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Client (Acme Corp) is strategic account with         │  │
│ │ potential for 10+ placements in next 12 months.      │  │
│ │ Accepting lower margin on this initial placement     │  │
│ │ establishes relationship for future high-margin      │  │
│ │ opportunities. Client has firm budget of $90/hr      │  │
│ │ and will not budge. Consultant is ideal fit and      │  │
│ │ unwilling to reduce from $75/hr (market rate).       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ Strategic Value (Check all that apply):                    │
│ ☑ High-value client (revenue potential >$100K/year)       │
│ ☑ Long-term contract (12+ months)                         │
│ ☐ Market expansion (new geography/vertical)               │
│ ☐ Competitive win (displacing competitor)                 │
│ ☑ Relationship builder (first placement with client)      │
│                                                            │
│ Approval Required: 🔴 Regional Director + CFO              │
│ (Margin <15%)                                              │
│                                                            │
│ [Cancel]                              [Submit for Approval]│
└────────────────────────────────────────────────────────────┘
```

- Click **[Submit for Approval]**
- System routes request to appropriate approvers based on margin %

**7.3 Approval Workflow**

| Margin % | Approver 1 | Approver 2 | Approver 3 | SLA |
|----------|-----------|-----------|-----------|-----|
| 15-17% | Bench Manager | Finance Manager | - | 24 hours |
| 12-14% | Bench Manager | Finance Manager | - | 48 hours |
| <12% | Regional Director | CFO | - | 72 hours |

**7.4 Approval Notification**

- Approvers receive email + Slack notification
- Approvers review justification, rate stack, strategic value
- Approvers either:
  - ✅ **Approve:** Recruiter can proceed with placement
  - ❌ **Reject:** Recruiter must renegotiate or decline placement
  - 💬 **Request More Info:** Recruiter provides additional justification

---

## 6. Alternative Flows

### Alt-1: Consultant Agrees to Rate Reduction

- If client lowers bill rate, recruiter may need to reduce consultant pay rate
- Approach consultant:
  ```
  "Hi [Name], I have an update on the [Job] role. The client's budget is firm
  at $90/hr bill rate. To make this work, I'd need to adjust your pay rate from
  $75/hr to $65/hr (still within market range for your profile).

  I know this isn't ideal, but the role is a great opportunity [highlight benefits:
  long-term, great client, resume builder, etc.].

  Are you comfortable with $65/hr to move forward?"
  ```
- If consultant agrees → Proceed with updated rate
- If consultant declines → Find alternative candidate or decline requirement

### Alt-2: Vendor Agrees to Reduce Commission

- If client lowers bill rate and consultant won't reduce pay, ask vendor to reduce commission:
  ```
  "Hi [Vendor], the client came back at $90/hr instead of $100/hr. To make this
  placement work, I need to ask if you can reduce your commission from 5% to 3%
  on this one. I know it's not ideal, but it's a strong placement and we can make
  it up on volume in future deals. Can you accommodate?"
  ```
- If vendor agrees → Proceed
- If vendor declines → Recruiter must decide: reduce InTime margin or decline placement

### Alt-3: Multiple Negotiation Rounds

- Consultant → Client → Vendor → Consultant (iterative back-and-forth)
- Document all negotiations in consultant activity timeline
- Set deadline: "We need to finalize rate by [Date] or I'll need to move on to another candidate."

---

## 7. Exception Flows

### Exc-1: Client Refuses to Disclose Bill Rate

- Some clients/vendors won't share bill rate (competitive sensitivity)
- In this case:
  - Ask for **pay rate budget** instead: "What's your budget for the consultant's pay rate?"
  - Estimate bill rate based on market data: If pay rate is $75/hr, assume bill rate is $95-105/hr
  - Proceed with caution, document assumption

### Exc-2: Rate Negotiation Stalls (No Agreement)

- If after 3+ negotiation attempts, parties cannot agree:
  - Recruiter decision:
    - **Decline placement:** "Unfortunately, we can't make the economics work. Let's stay in touch for future opportunities."
    - **Escalate to Manager:** Manager may have more flexibility or relationship leverage
  - Document reason for decline in system

---

## 8. Postconditions

**Success:**
- Agreed rates documented (bill rate, pay rate, vendor commission)
- InTime margin meets or exceeds threshold (≥18%) OR approved override
- All parties (consultant, vendor, client) aligned on rates
- Placement can proceed to submission and offer

**Failure:**
- No agreement reached, placement declined
- Reason documented (rate too low, consultant rejected, client rejected, vendor rejected)

---

## 9. Business Rules

### BR-1: Margin Thresholds (Reiterated)

| Margin % | Status | Action |
|----------|--------|--------|
| ≥25% | Excellent | Auto-approve |
| 22-24% | Good | Auto-approve, notify manager |
| 18-21% | Acceptable | Manager notification, document justification |
| 15-17% | Marginal | Manager approval required |
| 12-14% | Low | Manager + Finance approval |
| <12% | Critical | Regional Director + CFO approval |

### BR-2: Rate Change Limits

- Consultant pay rate cannot change >10% during active placement without client approval
- Bill rate cannot change during contract term unless:
  - Scope change (additional responsibilities)
  - Contract extension (may negotiate rate adjustment)
  - Client-initiated rate review (annual, quarterly)

### BR-3: Rate Lock Period

- Once rate is agreed and consultant placed, rate is locked for:
  - Minimum 3 months (standard)
  - Entire contract term if <6 months
- Exceptions require Regional Director approval

---

## 10. Screen Specifications

(See Step 2.2 for Rate Calculator interface - comprehensive wireframe provided)

---

## 11. Field Specifications

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| clientBillRate | currency | Yes | min:10, max:500 | Per hour, USD/CAD |
| consultantPayRate | currency | Yes | min:10, max:400, <billRate | Per hour |
| vendorCommissionPct | number | No | 0-50% | % of bill rate |
| vendorCommissionFixed | currency | No | min:0, max:100 | Fixed $/hr |
| hoursPerWeek | number | Yes | min:1, max:80 | Typically 40 |
| contractType | enum | Yes | C2C, W2, 1099 | Affects burden calculation |

---

## 12. Integration Points

- **Market Rate Databases (Dice, Indeed, Robert Half):** API or manual lookup
- **Internal Analytics (InTime historical rates):** Query from placements database
- **Approval Workflow (Manager/Director/CFO):** Email + Slack notifications, approval buttons

---

## 13. RACI Assignments

| Action | R | A | C | I |
|--------|---|---|---|---|
| Research Market Rates | Bench Sales Recruiter | Bench Sales Recruiter | - | - |
| Negotiate with Consultant | Bench Sales Recruiter | Bench Sales Recruiter | - | Manager |
| Negotiate with Vendor | Bench Sales Recruiter | Bench Manager (if override) | Finance | - |
| Negotiate with Client | Bench Sales Recruiter | Bench Manager (if override) | - | - |
| Approve Margin Override (15-17%) | Bench Manager | Finance Manager | - | - |
| Approve Margin Override (<15%) | Regional Director | CFO | Finance | CEO |

---

## 14. Metrics & Analytics

- Avg InTime Margin %: Target 22-25%
- % of Placements by Margin Tier (Excellent/Good/Acceptable/Marginal/Low)
- Rate Override Request Rate: Target <10% of placements require override
- Rate Negotiation Time: Avg days from initial rate discussion to agreement

---

## 15. Test Cases

### TC-BENCH-018-001: Successful Rate Negotiation (Happy Path)

1. Consultant wants $80/hr, market data shows $70-85/hr
2. Recruiter offers $75/hr (mid-market)
3. Consultant agrees
4. Client budget is $100/hr bill rate
5. Vendor commission is 5% ($5/hr)
6. InTime margin: $100 - $5 - $75 = $20/hr (20%) ✅
7. All parties agree, placement proceeds

Expected: Rate stack documented, margin >18%, auto-approved.

---

## 16. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | InTime v3 Product Team | Initial document creation |
