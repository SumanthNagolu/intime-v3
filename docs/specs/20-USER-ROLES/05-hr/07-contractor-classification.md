# UC-HR-007: Contractor Classification (1099 vs W2 vs C2C)

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** HR Manager
**Status:** Approved

---

## 1. Overview

This use case covers the critical decision-making process for classifying workers as W2 employees, 1099 independent contractors, or Corp-to-Corp (C2C) consultants. **Misclassification can result in severe penalties, back taxes, and legal liability.**

**Critical Importance:** IRS and state agencies actively audit worker classification. InTime must classify workers correctly based on legal criteria, not convenience or preference.

---

## 2. Actors

- **Primary:** HR Manager
- **Secondary:** Finance Team, Legal Counsel, Hiring Manager
- **System:** Classification Decision Tree, Compliance Checker, Audit Logger
- **External:** IRS, State Labor Departments, Legal Auditors

---

## 3. Preconditions

1. HR Manager logged in with full permissions
2. New worker engagement being created
3. Job requirements and working conditions defined
4. Legal guidelines accessible in system

---

## 4. Trigger

- New consultant being hired
- Existing contractor relationship review
- Client requests specific employment type
- Audit requirement
- Worker requests classification change

---

## 5. Main Flow: Worker Classification Decision

### Step 1: Navigate to Classification Tool

**User Action:** Click "HR" → "Compliance" → "Worker Classification"

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Worker Classification Tool                                     │
│ ⚠️ CRITICAL: Misclassification can result in severe penalties  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Welcome to the Worker Classification Decision Tool             │
│                                                                 │
│ This tool will help you correctly classify workers as:         │
│ • W2 Employee (Full-time/Part-time)                            │
│ • 1099 Independent Contractor                                  │
│ • Corp-to-Corp (C2C) Consultant                                │
│                                                                 │
│ Classification is based on IRS 20-Factor Test and state laws.  │
│ When in doubt, consult legal counsel.                          │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │  Quick Classification Shortcuts:                           │ │
│ │                                                             │ │
│ │  [Internal Employee]                                        │ │
│ │  → Automatically classified as W2                          │ │
│ │                                                             │ │
│ │  [Client Placement - Traditional Staffing]                 │ │
│ │  → Usually W2 (InTime is employer of record)               │ │
│ │                                                             │ │
│ │  [Vendor Bench Consultant]                                 │ │
│ │  → C2C (consultant's corp invoices InTime)                 │ │
│ │                                                             │ │
│ │  [Short-Term Project Specialist]                           │ │
│ │  → Run full assessment (could be 1099 or W2)               │ │
│ │                                                             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Start New Classification Assessment]                          │
│ [Review Existing Classifications]                              │
│ [Compliance Audit Report]                                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 2: Start Classification Assessment

**User Action:** Click "Start New Classification Assessment"

**System Response:** Opens multi-step questionnaire based on IRS 20-Factor Test

```
┌────────────────────────────────────────────────────────────────┐
│ Worker Classification Assessment                               │
│ Worker: [Enter name or select existing consultant]             │
│ Client: [Enter client or select from list]                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CATEGORY 1: BEHAVIORAL CONTROL                                 │
│ (Does InTime or client control HOW work is performed?)         │
│                                                                 │
│ 1. Instructions and Training                                   │
│                                                                 │
│ Will the worker receive detailed instructions on:              │
│ ☐ When to work (specific schedule required)                   │
│ ☐ Where to work (must work at our/client's location)          │
│ ☐ What tools/equipment to use                                  │
│ ☐ What workers to hire/assist                                  │
│ ☐ Where to purchase supplies                                   │
│ ☐ What work must be performed by specific person               │
│ ☐ What order/sequence to follow                                │
│                                                                 │
│ → More checkboxes = More likely W2 Employee                    │
│                                                                 │
│ Will the worker receive training from company/client?           │
│ ● Yes → Indicates employee relationship                        │
│ ○ No  → Indicates independent contractor                       │
│                                                                 │
│ 2. Supervision and Evaluation                                  │
│                                                                 │
│ Will the worker be supervised by company/client manager?       │
│ ● Yes, direct day-to-day supervision                           │
│ ○ Yes, but only deliverable review                             │
│ ○ No, fully independent                                        │
│                                                                 │
│ How will performance be evaluated?                             │
│ ● Behavioral (attendance, teamwork, attitude) → Employee       │
│ ○ Results-only (deliverable quality, timeline) → Contractor    │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ CATEGORY 2: FINANCIAL CONTROL                                  │
│ (Does worker have significant business investment/expense?)    │
│                                                                 │
│ 3. Business Investment                                         │
│                                                                 │
│ Does the worker have their own:                                │
│ ☐ Business entity (LLC, S-Corp, C-Corp)                       │
│ ☐ Business license                                             │
│ ☐ Business insurance                                           │
│ ☐ Office space                                                 │
│ ☐ Equipment/tools                                              │
│ ☐ Marketing/website for their services                         │
│ ☐ Multiple clients simultaneously                              │
│                                                                 │
│ → More checkboxes = More likely 1099/C2C                       │
│                                                                 │
│ 4. Expenses                                                    │
│                                                                 │
│ Who pays for work-related expenses?                            │
│ ○ Company/Client reimburses all expenses → Employee            │
│ ○ Worker absorbs own expenses → Contractor                     │
│ ○ Mixed                                                        │
│                                                                 │
│ 5. Payment Method                                              │
│                                                                 │
│ How will the worker be paid?                                   │
│ ○ Hourly or salary (guaranteed) → Employee                     │
│ ○ Per project/deliverable → Contractor                         │
│ ○ Commission-based → Could be either                           │
│                                                                 │
│ Can the worker realize profit or loss?                         │
│ ● Yes (can earn more by being efficient) → Contractor          │
│ ○ No (gets paid same regardless) → Employee                    │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ CATEGORY 3: RELATIONSHIP TYPE                                  │
│ (What is the nature of the relationship?)                      │
│                                                                 │
│ 6. Benefits                                                    │
│                                                                 │
│ Will the worker receive:                                       │
│ ☐ Health insurance                                             │
│ ☐ Retirement plan (401k)                                       │
│ ☐ Paid time off (vacation/sick)                                │
│ ☐ Paid holidays                                                │
│ ☐ Other benefits                                               │
│                                                                 │
│ → Any benefits checked = Strong indicator of W2 Employee       │
│                                                                 │
│ 7. Duration and Exclusivity                                    │
│                                                                 │
│ Expected duration of relationship:                             │
│ ○ Indefinite/Ongoing → Employee                                │
│ ○ Specific end date/project completion → Contractor            │
│                                                                 │
│ Is this work a regular part of company business?               │
│ ● Yes (e.g., recruiter for staffing firm) → Employee           │
│ ○ No (e.g., one-time website design) → Contractor              │
│                                                                 │
│ Can the worker provide services to others simultaneously?      │
│ ○ Yes, multiple clients allowed → Contractor                   │
│ ○ No, exclusive to this engagement → Employee                  │
│                                                                 │
│ 8. Contract Type                                               │
│                                                                 │
│ What type of agreement will be used?                           │
│ ○ Employment Agreement → Employee                              │
│ ○ Independent Contractor Agreement → 1099                      │
│ ○ Corp-to-Corp Consulting Agreement → C2C                      │
│                                                                 │
│ Will the worker have right to hire/fire assistants?            │
│ ● Yes → Contractor                                             │
│ ○ No → Employee                                                │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [← Back]  [Cancel]  [Calculate Classification →]              │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 3: Review Classification Result

**User Action:** Click "Calculate Classification"

**System Response:** Analyzes answers and provides recommendation

```
┌────────────────────────────────────────────────────────────────┐
│ Classification Result                                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ RECOMMENDED CLASSIFICATION: W2 EMPLOYEE                         │
│                                                                 │
│ Confidence Level: HIGH (85%)                                    │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Summary of Factors:                                        │ │
│ │                                                             │ │
│ │ Behavioral Control:          EMPLOYEE (7/7 factors)        │ │
│ │ Financial Control:           EMPLOYEE (0/5 contractor)     │ │
│ │ Relationship Type:           EMPLOYEE (5/5 factors)        │ │
│ │                                                             │ │
│ │ Key Indicators of Employee Status:                         │ │
│ │ ✓ Receives detailed instructions and supervision           │ │
│ │ ✓ Uses company/client equipment and workspace              │ │
│ │ ✓ Works set hours at company/client location               │ │
│ │ ✓ Receives benefits (health, PTO, 401k)                    │ │
│ │ ✓ Indefinite relationship (ongoing employment)             │ │
│ │ ✓ Exclusive to this employer                               │ │
│ │ ✓ No business entity or multiple clients                   │ │
│ │                                                             │ │
│ │ Risk Assessment:                                            │ │
│ │ 🔴 HIGH RISK if classified as 1099/C2C                     │ │
│ │                                                             │ │
│ │ Classifying this worker as 1099/C2C would likely:          │ │
│ │ • Trigger IRS audit and penalties                          │ │
│ │ • Require payment of back taxes + interest                 │ │
│ │ • Result in employee benefits liability                    │ │
│ │ • Expose company to state labor law violations             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RECOMMENDATION:                                                 │
│                                                                 │
│ Classify this worker as W2 EMPLOYEE.                           │
│                                                                 │
│ Required Actions:                                              │
│ • Execute Employment Agreement                                 │
│ • Enroll in payroll (withhold taxes, FICA, etc.)              │
│ • Provide employee handbook                                    │
│ • Offer benefits per company policy                            │
│ • File I-9 and E-Verify                                        │
│ • Add to workers' compensation insurance                       │
│                                                                 │
│ ⚠️ DO NOT classify as 1099 or C2C                              │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Save Assessment]  [Print Report]  [Consult Legal]             │
│ [Override (Requires Legal Approval)]  [Start Over]             │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Classification Types: Detailed Comparison

### 6.1 W2 Employee

**Definition:** Worker is employee of InTime (or client). Company is employer of record.

**Characteristics:**
- Company controls when, where, and how work is performed
- Company provides tools, equipment, training
- Worker receives benefits (health, 401k, PTO)
- Company withholds taxes (federal, state, FICA, Medicare)
- Ongoing, indefinite relationship
- Worker is exclusive (or primarily dedicated) to company
- Evaluated on behavior, not just results
- Cannot hire substitutes or assistants

**Tax Implications:**
- **Company Pays:**
  - Employer portion of FICA (7.65%)
  - Employer portion of Medicare (1.45%)
  - Federal/State unemployment tax (FUTA/SUTA)
  - Workers' compensation insurance
- **Company Withholds from Worker:**
  - Federal income tax
  - State income tax
  - Employee FICA (7.65%)
  - Employee Medicare (1.45%)

**Forms Required:**
- W-4 (Employee's Withholding Certificate)
- I-9 (Employment Eligibility Verification)
- E-Verify (within 3 days of hire)
- W-2 (annual, by Jan 31)

**Benefits:**
- Full control over worker
- Stability and loyalty
- Clear legal standing
- Easier to enforce IP/non-compete

**Drawbacks:**
- Higher cost (taxes, benefits, overhead)
- Termination complexity (unemployment claims)
- Long-term commitment

**Use Cases:**
- Internal InTime employees (recruiters, HR, operations)
- Traditional temp-to-hire placements
- Long-term client placements (> 6 months)
- Workers integrated into company operations

---

### 6.2 1099 Independent Contractor

**Definition:** Self-employed individual providing services under contract. NOT an employee.

**Characteristics:**
- Worker controls when, where, and how work is performed
- Worker provides own tools, equipment, workspace
- Worker markets services to multiple clients
- No benefits provided
- No tax withholding (worker pays own taxes quarterly)
- Project-based or deliverable-based engagement
- Can hire assistants/substitutes
- Evaluated solely on deliverable quality, not process

**Tax Implications:**
- **Company Pays:**
  - Nothing (no payroll taxes)
  - Pays contractor gross amount
- **Contractor Pays:**
  - Full self-employment tax (15.3%)
  - Federal/State income tax (quarterly estimated)
  - Own business expenses

**Forms Required:**
- W-9 (Request for Taxpayer Identification)
- 1099-NEC (annual, by Jan 31 if paid > $600)

**Benefits:**
- Lower cost (no taxes, benefits)
- Flexibility (easy to engage/disengage)
- Specialized expertise on-demand

**Drawbacks:**
- 🔴 **HIGH MISCLASSIFICATION RISK**
- Limited control over worker
- No exclusivity or loyalty
- Cannot enforce non-compete easily
- Worker may work for competitors

**Use Cases:**
- Specialized consultants (short-term projects)
- Subject matter experts (training, advisory)
- Creative professionals (writers, designers)
- Truly independent service providers

**⚠️ CRITICAL WARNING:**
IRS presumes workers are employees unless proven otherwise. 1099 should be rare in staffing industry.

---

### 6.3 Corp-to-Corp (C2C)

**Definition:** Business-to-business relationship. Worker's corporation invoices InTime for services. Worker is employee of their own corp.

**Characteristics:**
- Worker operates through own business entity (LLC, S-Corp, C-Corp)
- Worker's corp is vendor to InTime
- Worker handles own taxes via their corp
- No benefits from InTime
- Business relationship, not employment
- Worker may have multiple corporate clients
- Worker invoices for services (not payroll)

**Tax Implications:**
- **Company Pays:**
  - Nothing (no payroll taxes)
  - Pays consultant's corporation via invoice
- **Consultant's Corp Pays:**
  - Corporate taxes
  - Worker's salary (as W2 employee of own corp)
  - Business expenses

**Forms Required:**
- W-9 (for contractor's corp)
- 1099-NEC (if corp is LLC or sole prop; NOT if C-Corp or S-Corp)
- Corp-to-Corp Agreement

**Benefits:**
- Clear business-to-business relationship
- Lower misclassification risk (vs 1099 individual)
- No payroll admin
- Flexibility

**Drawbacks:**
- Higher rates (worker includes overhead in rate)
- No control over worker
- Cannot enforce exclusivity

**Use Cases:**
- Vendor bench consultants
- Independent consulting firms
- Specialized contractors with established businesses
- Short-term, project-based work

---

## 7. Decision Tree

```
START: New Worker Engagement
│
├─ Is this an internal InTime employee?
│  ├─ YES → W2 EMPLOYEE (done)
│  └─ NO → Continue
│
├─ Is worker providing services through their own corporation?
│  ├─ YES → C2C (verify corp exists, get W-9)
│  └─ NO → Continue
│
├─ Does InTime/client dictate:
│  • When worker must work (set schedule)?
│  • Where worker must work (onsite required)?
│  • How work must be performed (specific methods)?
│  ├─ YES to 2+ → W2 EMPLOYEE
│  └─ NO to all → Continue
│
├─ Will worker receive:
│  • Benefits (health, 401k, PTO)?
│  • Equipment/tools from company?
│  • Training from company?
│  ├─ YES to any → W2 EMPLOYEE
│  └─ NO to all → Continue
│
├─ Is this an ongoing, indefinite relationship?
│  ├─ YES → W2 EMPLOYEE
│  └─ NO (specific end date) → Continue
│
├─ Is the work a key part of company's regular business?
│  ├─ YES → W2 EMPLOYEE (e.g., recruiter for staffing firm)
│  └─ NO (specialized, non-core) → Continue
│
├─ Does worker:
│  • Maintain their own business?
│  • Market services to public?
│  • Have multiple clients?
│  • Provide own tools/workspace?
│  ├─ YES to 3+ → 1099 INDEPENDENT CONTRACTOR
│  └─ NO → W2 EMPLOYEE (if unsure, default to W2)
│
END
```

---

## 8. Common Scenarios

### Scenario 1: Software Developer Placement at Client

**Facts:**
- Developer works full-time (40 hrs/week) at client's office
- Client assigns tasks, provides equipment, sets schedule
- Client managers supervise work
- Engagement expected to last 6-12 months
- Developer works exclusively for this client during engagement
- No other clients

**Classification:** W2 EMPLOYEE (InTime is employer of record)

**Reasoning:**
- Client controls how, when, where work is performed
- Full-time, exclusive engagement
- Uses client's tools and workspace
- This is traditional temp staffing (W2 required)

---

### Scenario 2: Bench Consultant from Vendor

**Facts:**
- Consultant operates through "ABC Consulting LLC"
- ABC Consulting invoices InTime for services
- Consultant has own workspace, equipment
- Consultant has other clients simultaneously
- ABC Consulting carries business insurance
- No benefits from InTime

**Classification:** C2C (Corp-to-Corp)

**Reasoning:**
- Business-to-business relationship
- Consultant is W2 employee of ABC Consulting LLC
- InTime has no employer relationship with consultant
- Clear separation (vendor relationship)

---

### Scenario 3: Short-Term Project Expert

**Facts:**
- Expert hired to build specific deliverable (data migration)
- Works remotely from own office
- Provides own tools and equipment
- Paid per project (not hourly)
- No supervision (only deliverable review)
- Has other clients
- No benefits
- 3-month engagement with defined end

**Classification:** 1099 INDEPENDENT CONTRACTOR (if truly independent) OR W2 (if any behavioral control)

**Reasoning:**
- Project-based, deliverable-focused
- Worker controls methods and hours
- Own tools and workspace
- Multiple clients

**⚠️ Caution:** If InTime/client provides detailed instructions, set schedule, or supervises daily work → Must be W2

---

### Scenario 4: Internal Recruiter

**Facts:**
- Works from InTime office
- Reports to Recruiting Manager
- Uses InTime's ATS, CRM, equipment
- Works set hours (9am-6pm)
- Receives salary, health benefits, PTO, 401k
- Ongoing employment
- Cannot work for other staffing firms

**Classification:** W2 EMPLOYEE

**Reasoning:**
- Clear employee relationship
- All factors point to employee
- Core business function

---

## 9. Compliance Risks & Penalties

### 9.1 Misclassification Penalties (Federal)

| Violation | Penalty |
|-----------|---------|
| **Unintentional Misclassification** | $50 per W-2 not filed, 1.5% of wages for employee FICA, 40% of employee FICA not withheld, 100% of employer FICA not paid |
| **Intentional Misclassification** | $1,000 fine per misclassified worker, potential criminal penalties |
| **IRS Audit** | Back taxes + interest + penalties, can go back 3 years (or more if fraud) |

### 9.2 State Penalties

| State | Key Risk | Penalty Example |
|-------|----------|-----------------|
| **California** | Aggressive enforcement, ABC test | $5,000-$25,000 per violation + criminal penalties |
| **New York** | Wage/Hour violations | Up to $10,000 per misclassified worker |
| **Massachusetts** | Joint employer liability | 3x back wages + attorney fees |

### 9.3 Other Risks

- **Unemployment Claims:** Misclassified 1099 can claim unemployment benefits
- **Workers' Comp Claims:** State can retroactively require coverage + penalties
- **ERISA Violations:** Must provide benefits to misclassified employees
- **Wage/Hour Violations:** Overtime, minimum wage violations if classified as 1099
- **Class Action Lawsuits:** Workers can sue collectively

---

## 10. Field Specifications

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `employmentType` | Enum | Yes | W2, 1099, C2C | Classification type |
| `classificationDate` | Date | Yes | - | Date classification determined |
| `classificationMethod` | Enum | Yes | AUTO, MANUAL, LEGAL_REVIEW | How classified |
| `assessmentScore` | Number | Optional | 0-100 | Confidence level |
| `assessmentAnswers` | JSON | Optional | - | Questionnaire responses |
| `legalReviewRequired` | Boolean | Yes | - | If override needed |
| `legalReviewDate` | Date | Conditional | - | If legal reviewed |
| `legalReviewer` | String | Conditional | - | Attorney name |
| `riskLevel` | Enum | Yes | LOW, MEDIUM, HIGH | Misclassification risk |
| `complianceNotes` | Text | Optional | - | Additional context |

---

## 11. Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| **CL-001** | Default to W2 when uncertain | System recommends W2 if score < 70% contractor |
| **CL-002** | Legal review required for 1099 override | Cannot finalize 1099 without legal approval if system recommends W2 |
| **CL-003** | C2C requires business entity verification | Must upload W-9 showing corp entity |
| **CL-004** | Annual classification review for long-term engagements | If 1099/C2C > 12 months, trigger reassessment |
| **CL-005** | Cannot provide benefits to 1099/C2C | System blocks benefits enrollment for non-W2 |
| **CL-006** | W2 required for workers receiving equipment | If company provides laptop/phone → must be W2 |

---

## 12. Test Cases

### TC-HR-007-001: Clear W2 Employee

**Preconditions:** Worker with all employee factors

**Steps:**
1. Start classification assessment
2. Answer all questions indicating employee (set schedule, onsite, benefits, etc.)
3. Click "Calculate Classification"

**Expected Result:**
- System recommends W2 EMPLOYEE
- Confidence: HIGH (90%+)
- No override option (clear case)

---

### TC-HR-007-002: Clear C2C Consultant

**Preconditions:** Worker operating through own corp

**Steps:**
1. Start classification assessment
2. Select "Worker provides services through own corporation"
3. Upload W-9 showing business entity

**Expected Result:**
- System classifies as C2C
- Prompts for C2C agreement
- Requires vendor onboarding

---

### TC-HR-007-003: Borderline Case Requiring Legal Review

**Preconditions:** Mixed factors (some employee, some contractor)

**Steps:**
1. Start classification assessment
2. Answer with mixed responses
3. Click "Calculate Classification"

**Expected Result:**
- System shows UNCERTAIN or MEDIUM confidence
- Recommends legal review
- Requires legal approval to finalize

---

## 13. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial comprehensive documentation for contractor classification |

---

**End of UC-HR-007**
