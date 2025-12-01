# UC-BENCH-017: Manage Contract Types (C2C vs W2 vs 1099)

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Bench Sales Recruiter
**Status:** Approved

---

## 1. Overview

This use case describes how Bench Sales Recruiters determine, explain, and manage the three primary contract types for bench consultants: C2C (Corp-to-Corp), W2 (Employee), and 1099 (Independent Contractor). Understanding these contract types is critical for rate negotiation, compliance, and consultant satisfaction. Each type has different legal, tax, and financial implications for both the consultant and InTime.

---

## 2. Actors

- **Primary:** Bench Sales Recruiter
- **Secondary:** Consultant, Finance Team, HR Manager, Legal Team, Tax Advisor
- **System:** Contract Generator, Tax Calculator, Compliance Checker

---

## 3. Preconditions

- Consultant has been qualified and is ready for onboarding or placement
- Recruiter understands the three contract types and their implications
- Finance and Legal have approved standard contract templates for each type

---

## 4. Trigger

- Consultant asks: "What's the difference between C2C, W2, and 1099?"
- Recruiter needs to recommend contract type during rate negotiation
- Consultant has existing preference but wants to understand alternatives
- Compliance issue requires contract type change

---

## 5. Main Flow

### Step 1: Contract Type Decision Tree

**When discussing contract types with consultant, use this decision tree:**

```
START: What contract type is best for this consultant?
│
├─ Does consultant have own legal entity (LLC, S-Corp, C-Corp)?
│  ├─ YES → Recommend C2C (Primary)
│  │         Alternative: W2 or 1099 (if consultant prefers)
│  │
│  └─ NO → Continue to next question
│
├─ Does consultant want benefits (health insurance, 401k, PTO)?
│  ├─ YES → Recommend W2 (Only option with benefits)
│  │
│  └─ NO → Continue to next question
│
├─ Does consultant want maximum take-home pay (willing to handle own taxes)?
│  ├─ YES → Recommend 1099
│  │         Alternative: C2C (if willing to form LLC)
│  │
│  └─ NO → Recommend W2 (Simplest for consultant)
│
├─ Does client require specific contract type?
│  ├─ YES → Use client-required type
│  │         (Some clients only accept W2 for compliance reasons)
│  │
│  └─ NO → Consultant chooses based on preference
│
END: Document chosen contract type in consultant profile
```

### Step 2: Explain Contract Types to Consultant

**2.1 Prepare Comparison Chart**

Use this standard comparison when explaining options:

| Aspect | C2C (Corp-to-Corp) | W2 (Employee) | 1099 (Independent Contractor) |
|--------|-------------------|---------------|-------------------------------|
| **Legal Structure** | Consultant has own business entity | Consultant is InTime employee | Consultant is self-employed individual |
| **Who Pays Consultant** | InTime pays consultant's LLC/Corp | InTime pays consultant (payroll) | InTime pays consultant directly |
| **Taxes** | Consultant's business pays taxes (business tax return) | InTime withholds taxes (W-2 form) | Consultant pays self-employment tax (1099 form) |
| **Benefits** | ❌ None (consultant provides own) | ✅ Health insurance, 401k, PTO | ❌ None |
| **Overhead** | Consultant covers business expenses, insurance | InTime covers payroll taxes, workers comp | Minimal overhead |
| **Take-Home Pay** | Highest (but must cover business costs) | Lowest (taxes withheld, benefits deducted) | High (but must pay quarterly taxes) |
| **Typical Scenario** | Experienced consultants with established LLCs | Consultants wanting stability, benefits | Mid-career consultants, temporary arrangement |
| **IRS Compliance** | Business-to-business (lowest risk) | Employee (compliant) | Independent contractor (must pass IRS test) |
| **Best For** | Consultants with multiple clients, high rates | Consultants wanting security, benefits | Consultants wanting flexibility, higher net pay |

**2.2 Walk Through Example Calculation**

Show consultant how each type affects their pay:

**Scenario:**
- Client Bill Rate: $100/hr
- Consultant works 160 hours/month
- Monthly gross: $16,000

**C2C Example:**
```
InTime pays consultant's LLC: $80/hr × 160 = $12,800/month

Consultant's LLC receives: $12,800
LLC pays consultant salary: ~$10,000/month (after business taxes, insurance, etc.)
Take-home (after personal taxes): ~$8,500/month

Pros: LLC builds business credit, tax deductions (home office, equipment)
Cons: Must file business taxes, carry liability insurance, manage bookkeeping
```

**W2 Example:**
```
InTime pays consultant gross: $65/hr × 160 = $10,400/month

Gross pay: $10,400
- Federal tax withholding: -$1,800
- State tax withholding: -$500
- FICA (Social Security + Medicare): -$795
- Health insurance premium: -$200
- 401k contribution (5%): -$520
Net take-home: $6,585/month

Pros: Benefits (health insurance, 401k match, PTO), simple (no taxes owed at year-end)
Cons: Lowest net pay, less flexibility
```

**1099 Example:**
```
InTime pays consultant: $75/hr × 160 = $12,000/month

Gross pay: $12,000
Consultant sets aside for taxes:
- Federal tax (estimated 22%): -$2,640
- State tax (estimated 5%): -$600
- Self-employment tax (15.3%): -$1,836
- Health insurance (self-pay): -$400
Net after taxes/insurance: $6,524/month

Pros: Higher gross pay than W2, tax deductions available
Cons: Must file quarterly estimated taxes, no benefits, no workers comp
```

**Summary:**
- **C2C:** Highest take-home ($8,500) but most complex
- **W2:** Lowest take-home ($6,585) but simplest + benefits
- **1099:** Mid take-home ($6,524) but moderate complexity

### Step 3: Determine Consultant Eligibility

**3.1 C2C Eligibility Requirements**

Consultant MUST have:
- ✅ Legal business entity (LLC, S-Corp, C-Corp, or Sole Proprietorship)
- ✅ EIN (Employer Identification Number) from IRS
- ✅ Business bank account (separate from personal)
- ✅ General liability insurance ($1M minimum) - OR willing to obtain
- ✅ Ability to invoice InTime (monthly or weekly)

If consultant does NOT have these, offer:
- **Option 1:** Help consultant form LLC (refer to LegalZoom, ZenBusiness, or attorney)
  - Timeline: 2-4 weeks to form LLC and obtain EIN
  - Cost: $100-500 depending on state
- **Option 2:** Use W2 or 1099 for now, transition to C2C later

**3.2 W2 Eligibility Requirements**

Consultant MUST:
- ✅ Be legally authorized to work in US/Canada as W2 employee
- ✅ Pass E-Verify (if US)
- ✅ Complete I-9 with valid work authorization documents
- ✅ Pass background check (InTime policy)
- ✅ Reside in state where InTime is registered as employer

If consultant is in state where InTime is NOT registered:
- Cannot use W2 (prohibitively expensive to register in all 50 states)
- Use C2C or 1099 instead

**3.3 1099 Eligibility Requirements**

Consultant MUST pass **IRS Independent Contractor Test**:

| Factor | W2 Employee | 1099 Contractor | Test |
|--------|-------------|-----------------|------|
| **Control** | Employer controls when, where, how work is done | Contractor controls own methods | Can consultant set own hours, work location? |
| **Financial** | Employer provides tools, reimburses expenses | Contractor provides own tools, pays own expenses | Does consultant have own equipment, multiple clients? |
| **Relationship** | Ongoing, exclusive, benefits provided | Project-based, no benefits | Is this a temporary, project-based engagement? |

**IRS Safe Harbor for 1099:**
- Consultant has other clients (not just InTime)
- Consultant invoices InTime (not on payroll)
- Consultant provides own equipment (laptop, software licenses)
- Consultant is NOT supervised daily by InTime or client
- Engagement is project-based, not indefinite

**Risk:**
If IRS determines consultant was misclassified as 1099 (should have been W2):
- InTime liable for back taxes, penalties, interest
- Consultant may owe additional taxes

**When to AVOID 1099:**
- Consultant works full-time, exclusively for one client
- Consultant is supervised/directed by client manager
- Client provides all tools/equipment
- Engagement is indefinite (not project-based)

In these cases, use W2 to minimize risk.

### Step 4: Document Contract Type Selection

**4.1 Update Consultant Profile**

- Navigate to consultant profile → **Contract Details** section
- Set **Preferred Contract Type**: C2C, W2, or 1099
- If multiple types acceptable, select all applicable
- Add notes explaining rationale:
  ```
  Example: "Consultant prefers C2C (has established LLC). Willing to do W2 if
  client requires. Not interested in 1099 due to tax complexity."
  ```

**4.2 Collect Required Documents by Type**

**If C2C Selected:**
- Upload W-9 for consultant's business entity
- Upload Certificate of Insurance (COI)
- Upload Articles of Incorporation or LLC Operating Agreement
- Confirm business bank account (for ACH payments)

**If W2 Selected:**
- Upload personal W-4 (tax withholding form)
- Complete I-9 with work authorization documents
- Complete E-Verify submission
- Enroll in benefits (health insurance, 401k)
- Set up direct deposit

**If 1099 Selected:**
- Upload personal W-9
- Confirm consultant has other clients or is available to multiple clients (IRS test)
- Consultant acknowledges self-employment tax responsibility (signed statement)

### Step 5: Generate Contract by Type

**5.1 System Auto-Generates Appropriate Contract**

Based on contract type selection, system generates:

**C2C Contract Template:**
- Agreement between InTime Inc. and [Consultant LLC Name]
- Services Agreement (not Employment Agreement)
- Payment terms: Consultant invoices InTime weekly/monthly
- Rate: $X/hr (paid to LLC)
- No benefits, no tax withholding
- Indemnification: Consultant responsible for own taxes, insurance, workers comp
- Term: Indefinite, at-will termination with 2-week notice

**W2 Employment Agreement Template:**
- Agreement between InTime Inc. (Employer) and [Consultant Name] (Employee)
- Employment Agreement (at-will)
- Payment terms: Bi-weekly payroll via direct deposit
- Rate: $X/hr (gross, before taxes)
- Benefits: Health insurance, 401k matching, PTO accrual
- Tax withholding: InTime withholds federal, state, FICA
- Workers comp coverage provided
- Term: At-will, either party can terminate anytime

**1099 Independent Contractor Agreement Template:**
- Agreement between InTime Inc. (Client) and [Consultant Name] (Contractor)
- Independent Contractor Agreement
- Payment terms: Consultant invoices InTime weekly/monthly
- Rate: $X/hr (paid to consultant)
- No benefits, no tax withholding (consultant receives 1099 at year-end)
- IRS Classification: Consultant is independent contractor, not employee
- Consultant responsible for self-employment tax (15.3%)
- Term: Project-based or at-will with 2-week notice

**5.2 Customize Contract (if needed)**

- Review auto-generated contract
- Add any special clauses (non-compete, IP ownership, etc.)
- Ensure rate is correct for contract type
- Save and send for signature

### Step 6: Explain Rate Differences by Contract Type

**6.1 Why Rates Differ by Type**

**C2C = Highest Rate**
- Consultant must pay:
  - Business taxes (corporate or LLC tax)
  - Liability insurance ($1M policy = ~$500-1500/year)
  - Accounting/bookkeeping fees (~$100-300/month)
  - Self-employment tax on distributions
- Therefore, C2C rate is typically 15-25% higher than W2 rate

**W2 = Lowest Rate**
- InTime pays:
  - Employer portion of FICA (7.65%)
  - Workers comp insurance (~2-5% of wages)
  - Unemployment insurance (~1-3% of wages)
  - Benefits (health insurance, 401k match) = ~$500-1000/month
- Total employer burden: ~25-35% on top of gross wage
- Consultant receives benefits, so gross rate is lower

**1099 = Middle Rate**
- Consultant pays self-employment tax (15.3%) but no business overhead
- No benefits provided, so rate is higher than W2 but lower than C2C
- Typically 10-15% higher than W2 rate

**6.2 Rate Conversion Examples**

Given Client Bill Rate = $100/hr, InTime target margin = 22%:

| Contract Type | Consultant Pay Rate | InTime Cost (with burden) | InTime Margin | Margin % |
|---------------|---------------------|---------------------------|---------------|----------|
| **C2C** | $80/hr | $80/hr (no burden) | $20/hr | 20% |
| **W2** | $60/hr | $78/hr (30% burden) | $22/hr | 22% |
| **1099** | $72/hr | $72/hr (minimal burden) | $28/hr | 28% |

**Why W2 pay rate is lowest:**
- InTime's cost is $78/hr (including benefits, taxes)
- To maintain 22% margin, can only pay consultant $60/hr gross
- But consultant receives benefits worth ~$500-1000/month, so total comp is competitive

**Net Take-Home Comparison (160 hrs/month):**
- C2C: $80/hr × 160 = $12,800 → ~$9,500 net (after business taxes, insurance)
- W2: $60/hr × 160 = $9,600 gross → ~$6,500 net (after taxes, benefits deducted)
- 1099: $72/hr × 160 = $11,520 → ~$8,000 net (after self-employment tax)

### Step 7: Handle Contract Type Changes

**7.1 Consultant Requests Contract Type Change**

Scenarios:
- C2C consultant wants to switch to W2 (tired of business overhead)
- W2 consultant forms LLC, wants to switch to C2C (maximize income)
- 1099 consultant wants benefits, switches to W2

**7.2 Change Process**

1. **Evaluate Request**
   - Why does consultant want to change?
   - Is it financially feasible? (rate adjustment required)
   - Does it make sense from compliance standpoint?

2. **Calculate New Rate**
   - If switching from C2C → W2: Rate will decrease ~20-25%
   - If switching from W2 → C2C: Rate will increase ~20-25%
   - Ensure client bill rate can support the change (maintain InTime margin)

3. **Client Approval (if needed)**
   - If client contract specifies employment type, get client approval for change
   - Some clients require W2 only (for insurance, control reasons)

4. **Generate New Contract**
   - Terminate old contract (with notice period, typically 2 weeks)
   - Generate new contract with updated type and rate
   - Both parties sign new agreement

5. **Update Systems**
   - Finance updates payroll/invoicing system
   - HR updates employment records (if W2)
   - Benefits enrollment/termination (if applicable)

6. **Effective Date**
   - Typically align with start of new pay period or month
   - Ensure no payroll/tax gaps

---

## 6. Alternative Flows

### Alt-1: Consultant Unsure Which Type to Choose

- Provide comparison chart (Step 2.1)
- Walk through example calculations (Step 2.2)
- Ask clarifying questions:
  - Do you have an LLC already? → C2C
  - Do you want benefits? → W2
  - Do you want to maximize net income and willing to handle taxes? → 1099 or C2C
- Recommend best fit based on consultant's answers

### Alt-2: Client Requires Specific Contract Type

- Some clients mandate W2 only (government contracts, risk aversion)
- Inform consultant: "This client requires W2 employment. Are you comfortable with that?"
- If consultant declines, cannot place with this client (find alternative client)

### Alt-3: State Registration Issue (W2)

- Consultant lives in Montana, InTime not registered as employer there
- Options:
  1. InTime registers in Montana (expensive, time-consuming) - Only if multiple consultants
  2. Use C2C or 1099 instead
  3. Consultant relocates to state where InTime is registered (unlikely)
- Typically: Use C2C (consultant forms LLC)

---

## 7. Exception Flows

### Exc-1: IRS Audits 1099 Classification

- IRS determines consultant should have been W2
- InTime liable for back taxes, penalties
- Immediately consult legal and tax advisor
- Reclassify consultant to W2 going forward
- Pay back taxes/penalties as required

### Exc-2: Consultant Misrepresents LLC Status

- Consultant claims to have LLC but does not
- InTime processes payment as C2C
- IRS flags as incorrect (should be 1099 or W2)
- Immediately correct classification
- Request proper documentation (EIN, Articles of Incorporation)
- If consultant cannot provide, switch to W2 or 1099

---

## 8. Postconditions

- Consultant's contract type is documented and understood
- Appropriate contract generated and signed
- Payment/invoicing setup matches contract type
- Consultant understands tax and benefit implications
- Compliance requirements met (I-9, E-Verify for W2, etc.)

---

## 9. Business Rules

### BR-1: Contract Type Requirements

**C2C:**
- MUST have: Business entity, EIN, liability insurance
- CANNOT use if: Consultant has no LLC and unwilling to form one

**W2:**
- MUST have: Valid work authorization, pass background check, state registration
- CANNOT use if: InTime not registered in consultant's state

**1099:**
- MUST pass: IRS independent contractor test
- CANNOT use if: Consultant works exclusively for one client full-time indefinitely

### BR-2: Rate Adjustment Rules

When switching contract types:
- C2C → W2: Decrease rate by 20-25%
- W2 → C2C: Increase rate by 20-25%
- W2 → 1099: Increase rate by 10-15%
- 1099 → W2: Decrease rate by 10-15%

InTime margin must remain ≥18% after adjustment.

### BR-3: State Registration for W2

InTime is registered as employer in:
- US: CA, NY, NJ, TX, FL, IL, GA, NC, VA, PA, OH, MI, WA
- Canada: ON, BC, AB, QC

Cannot use W2 for consultants in other states/provinces.

---

## 10. Screen Specifications

### Screen: SCR-BENCH-017-01 - Contract Type Selector

**Route:** `/employee/workspace/bench/consultants/[id]/contract-type`

```
┌────────────────────────────────────────────────────────────┐
│ Select Contract Type - Jane Doe                       [X]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Choose the contract type for this consultant:              │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ○ C2C (Corp-to-Corp)                                 │  │
│ │                                                      │  │
│ │   Consultant has own business entity (LLC, Corp)    │  │
│ │   Pay Rate: $80/hr (to consultant's business)       │  │
│ │   Benefits: None                                     │  │
│ │   Taxes: Consultant responsible                     │  │
│ │                                                      │  │
│ │   Requirements:                                      │  │
│ │   ✅ Business entity formed                          │  │
│ │   ✅ EIN obtained                                    │  │
│ │   ⚠️ Liability insurance needed ($1M)               │  │
│ │                                                      │  │
│ │   [Learn More]                                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ● W2 (Employee)                                      │  │
│ │                                                      │  │
│ │   Consultant is InTime employee                     │  │
│ │   Pay Rate: $60/hr (gross, before taxes)            │  │
│ │   Benefits: ✅ Health, 401k, PTO                    │  │
│ │   Taxes: InTime withholds                           │  │
│ │                                                      │  │
│ │   Requirements:                                      │  │
│ │   ✅ Valid work authorization                        │  │
│ │   ✅ Pass background check                          │  │
│ │   ✅ Consultant in registered state (NY)            │  │
│ │                                                      │  │
│ │   [Learn More]                                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ○ 1099 (Independent Contractor)                      │  │
│ │                                                      │  │
│ │   Consultant is self-employed individual            │  │
│ │   Pay Rate: $72/hr                                  │  │
│ │   Benefits: None                                     │  │
│ │   Taxes: Consultant pays self-employment tax        │  │
│ │                                                      │  │
│ │   Requirements:                                      │  │
│ │   ✅ Pass IRS independent contractor test           │  │
│ │   ⚠️ Consultant must have multiple clients          │  │
│ │   ⚠️ Project-based, not indefinite employment       │  │
│ │                                                      │  │
│ │   [Learn More]                                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ [Compare Side-by-Side] [View Tax Implications]            │
│                                                            │
│ [Cancel]                                      [Continue]   │
└────────────────────────────────────────────────────────────┘
```

---

## 11. Field Specifications

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| contractType | enum | Yes | C2C, W2, 1099 | Primary contract type |
| businessEntityName | text | Conditional (C2C) | max 200 chars | LLC/Corp legal name |
| ein | string | Conditional (C2C) | XX-XXXXXXX format | Employer ID Number |
| hasLiabilityInsurance | boolean | Conditional (C2C) | - | $1M minimum required |
| w2State | enum | Conditional (W2) | US states/Canada provinces | Where consultant resides |
| passedIndependentContractorTest | boolean | Conditional (1099) | - | IRS test confirmation |

---

## 12. Integration Points

- **Payroll System (ADP, Gusto):** W2 employee setup
- **Accounting System (QuickBooks):** 1099/C2C invoice tracking
- **Tax Software (TurboTax, H&R Block):** Year-end tax form generation (W-2, 1099-NEC)
- **Benefits Provider (Health insurance, 401k):** W2 enrollment

---

## 13. RACI Assignments

| Action | R | A | C | I |
|--------|---|---|---|---|
| Explain Contract Types | Bench Sales Recruiter | Bench Sales Recruiter | - | - |
| Recommend Best Fit | Bench Sales Recruiter | Bench Sales Recruiter | Finance, HR | Manager |
| Verify Eligibility | Bench Sales Recruiter | HR (W2), Finance (C2C/1099) | Legal | - |
| Generate Contract | Bench Sales Recruiter | Legal (custom terms) | - | Manager |
| Approve Contract Type Change | Bench Manager | Bench Manager | Finance, HR, Legal | COO |

---

## 14. Metrics & Analytics

- % of consultants by contract type (C2C vs W2 vs 1099)
- Avg pay rate by contract type
- Contract type change requests per quarter
- Compliance issues (IRS misclassification) - Target: 0

---

## 15. Test Cases

### TC-BENCH-017-001: Consultant Selects C2C

1. Consultant has LLC formed
2. Uploads W-9, COI
3. Recruiter selects C2C contract type
4. System generates C2C services agreement
5. Both parties sign
6. Finance sets up ACH payments to LLC

Expected: C2C contract executed, consultant invoices InTime monthly.

---

## 16. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | InTime v3 Product Team | Initial document creation |
