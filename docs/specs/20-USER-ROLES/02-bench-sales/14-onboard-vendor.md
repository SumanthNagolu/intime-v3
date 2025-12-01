# UC-BENCH-014: Onboard New Vendor Partner

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Bench Sales Recruiter
**Status:** Approved

---

## 1. Overview

This use case describes the complete vendor onboarding workflow, from initial vendor qualification through contract negotiation, document collection, custom commission term setup, and activation in the system. Vendor onboarding is a collaborative process involving Bench Sales Recruiter (primary), Manager (approval), Finance (banking setup), and Legal (contract review).

---

## 2. Actors

- **Primary:** Bench Sales Recruiter
- **Secondary:** Bench Sales Manager, Finance Team, Legal Team, Regional Director
- **System:** Vendor Verification Service, DocuSign, Vendor Portal Provisioning

---

## 3. Preconditions

- Vendor has expressed interest in partnership
- Initial qualification completed (vendor has consultants, relevant skills, clean reputation)
- User has Bench Sales Recruiter role or higher

---

## 4. Trigger

- Vendor inquiry received (email, LinkedIn, referral, conference contact)
- Recruiter identifies promising vendor partner opportunity
- Manager assigns vendor onboarding to recruiter

---

## 5. Main Flow

### Step 1: Vendor Qualification

**1.1 Initial Contact**
- Vendor reaches out or recruiter identifies potential partner
- Collect basic information:
  - Company name, website
  - Primary contact (name, title, email, phone)
  - Types of consultants (skills, visa types, locations)
  - Volume (how many consultants on bench?)
  - Geographic coverage

**1.2 Qualification Criteria**

| Criterion | Requirement | Notes |
|-----------|-------------|-------|
| Years in Business | Min 2 years | Prefer 5+ years |
| Consultant Pool Size | Min 20 consultants | Prefer 50+ |
| Relevant Skills | Overlap with InTime needs | Java, .NET, Python, AWS, etc. |
| Geographic Coverage | US/Canada focus | Must service our markets |
| Reputation | Clean record | Check LinkedIn, Google reviews |
| Technology Platform | Job board or API access | Ability to share bench/requirements |
| Responsiveness | Reply within 24 hours | Test during qualification |

**1.3 Qualification Call (30 min)**

Agenda:
- Introduce InTime, our model, client base
- Understand vendor's business:
  - How long in business?
  - Size of consultant bench?
  - Primary skill sets?
  - Preferred contract types (C2C, W2, 1099)?
  - Geographic focus?
- Discuss partnership model:
  - InTime will submit our bench to vendor requirements
  - Vendor will submit their bench to InTime clients (if applicable)
  - Discuss commission structure expectations (set realistic ranges: 3-10% typical)
  - Payment terms (Net 30, 45, or 60?)
- Gauge vendor interest and fit

**1.4 Decision**
- **Qualified:** Proceed to onboarding
- **Not Qualified:** Send polite decline email, keep on file for future
- **Maybe:** Schedule follow-up, gather more information

### Step 2: Initiate Vendor Onboarding

**2.1 Create Vendor Profile**

Navigate to `/employee/workspace/bench/vendors/new`

Form Fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Legal Company Name | text | Yes | As appears on W-9 |
| DBA (Doing Business As) | text | No | If different from legal name |
| Website | url | Yes | Company website |
| Company Type | enum | Yes | Staffing Agency, Prime Vendor, Consulting Firm, Other |
| Primary Industry Focus | multi-enum | No | IT, Healthcare, Finance, Engineering, etc. |
| Year Founded | number | Yes | 4-digit year |
| Number of Employees | number | No | Approximate |
| Consultant Pool Size | number | Yes | Estimated bench size |
| Primary Skills Offered | multi-enum | Yes | Java, .NET, Python, etc. (tags) |
| Geographic Coverage | multi-enum | Yes | States/provinces serviced |
| Address | address | Yes | Headquarters address |
| Phone | phone | Yes | Main company phone |
| Email | email | Yes | General company email |

**2.2 Add Primary Contact**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | text | Yes | Primary contact |
| Last Name | text | Yes | |
| Title | text | Yes | e.g., VP of Partnerships, Owner |
| Email | email | Yes | Direct email |
| Phone | phone | Yes | Direct phone |
| LinkedIn URL | url | No | Contact's LinkedIn |
| Relationship Type | enum | Yes | Primary, Operational, Billing, Executive |

**2.3 Set Onboarding Stage**
- Default: `Qualification Completed`
- System creates onboarding checklist

### Step 3: Negotiate Custom Commission Terms

**3.1 Commission Structure Options**

Present vendor with options:

**Option A: Fixed Percentage**
- Simple: Vendor receives X% of bill rate on every placement
- Example: 5% of bill rate
- Pros: Simple to calculate, predictable
- Cons: No volume incentive

**Option B: Tiered Percentage (Recommended)**
- Volume-based: Lower commission % at higher volumes
- Example:
  - Tier 1 (1-5 placements/quarter): 5%
  - Tier 2 (6-10 placements/quarter): 4%
  - Tier 3 (11+ placements/quarter): 3%
- Pros: Incentivizes volume, aligns interests
- Cons: More complex to track

**Option C: Fixed Dollar Amount per Placement**
- Example: $500 per placement (regardless of bill rate)
- Pros: Predictable cost for InTime
- Cons: Less attractive for high-rate placements

**3.2 Typical Commission Ranges**

| Relationship Type | Typical Commission | Notes |
|-------------------|-------------------|-------|
| Direct Client (InTime owns client) | 0% | No vendor involved |
| Prime Vendor (InTime is subcontractor) | 70-85% to InTime | Vendor keeps 15-30% |
| Subcontractor (Vendor provides consultants) | 3-10% to Vendor | InTime keeps 90-97% |
| Co-Marketing (Joint partnership) | 50/50 split | Equal partnership |

**3.3 Negotiate and Document Terms**

- Discuss vendor expectations
- Present InTime's standard terms
- Negotiate to mutual agreement
- Document agreed terms in system (see Step 4)

### Step 4: Document Vendor Agreement Terms

**4.1 Navigate to Vendor Profile → Agreement Tab → [Set Agreement Terms]**

**4.2 Agreement Terms Form**

```
Agreement Type: [Prime Vendor ▼]

Commission Structure:
● Tiered Percentage
○ Fixed Percentage
○ Fixed Dollar Amount
○ Custom (specify)

Tier Configuration:
┌────────────────────────────────────────────────────┐
│ Tier 1: First [5] placements per [Quarter ▼]      │
│ Commission: [5.0]%                                 │
│                                                    │
│ Tier 2: Next [5] placements (6-10 total)          │
│ Commission: [4.0]%                                 │
│                                                    │
│ Tier 3: [11]+ placements                          │
│ Commission: [3.0]%                                 │
└────────────────────────────────────────────────────┘

Payment Terms:
Invoice Frequency: [Monthly ▼]
Payment Terms: Net [30] days
Payment Method: [ACH ▼]

Volume Commitment (Optional):
Minimum Placements per Quarter: [3]
Penalty for Unmet Commitment: [None ▼]
Bonus for Exceeding Target: ☑ 0.5% additional discount at 15+ placements

Exclusivity:
Type: [First Right of Refusal ▼]
Duration: [48] hours
Scope: [Technology consultants in NY/NJ metro]

Contract Duration:
Effective Date: [Today]
Term: [24] months
Auto-Renew: ☑ Yes
Termination Notice: [30] days

Non-Compete Terms:
Duration: [6] months post-termination
Scope: [No solicitation of placed consultants or end clients]
```

- Click **[Save Terms]**
- Terms saved to vendor profile (pending contract generation)

### Step 5: Collect Vendor Documents

**5.1 Send Document Request Email**

System auto-generates email to vendor:

```
Subject: InTime Vendor Onboarding - Required Documents

Hi [Vendor Contact Name],

We're excited to move forward with our partnership! To complete your
onboarding, please provide the following documents:

Required Documents:
1. W-9 (for US vendors) or W-8BEN (for international vendors)
2. Certificate of Insurance (COI) - Minimum $1M general liability
3. ACH Banking Information Form (attached)
4. Business License or Articles of Incorporation
5. NDA (attached - please sign and return)
6. Primary contact information (name, title, email, phone)

Please upload documents here: [Secure Portal Link]

If you have questions, feel free to reach out anytime.

Best regards,
[Recruiter Name]
InTime Staffing
```

**5.2 Vendor Uploads Documents**

- Vendor accesses secure portal
- Uploads each document
- System notifies recruiter when all documents received

**5.3 Recruiter Verifies Documents**

Checklist:
- ✅ W-9 has correct legal name, EIN, address
- ✅ COI shows $1M coverage, InTime listed as additional insured
- ✅ Banking info has routing/account numbers, voided check attached
- ✅ Business license is current (not expired)
- ✅ NDA is signed and dated

If issues found → Request corrections from vendor

### Step 6: Generate Vendor Agreement

**6.1 Recruiter Initiates Contract Generation**

- Navigate to Vendor Profile → Agreement Tab
- Click **[Generate Contract]**
- System pre-fills vendor agreement template with:
  - Vendor legal name, address
  - InTime entity information
  - Commission terms (from Step 4)
  - Payment terms
  - Effective/expiration dates
  - Exclusivity clauses
  - Non-compete terms

**6.2 Recruiter Reviews Draft Contract**

- Review for accuracy
- Customize if needed (add special clauses)
- If custom terms OR commission >7%:
  - Submit to Legal for review
  - Legal reviews, approves or requests changes
- If standard terms (<7% commission, standard clauses):
  - Skip legal review, proceed to send

**6.3 Manager Approval**

- Submit to Bench Sales Manager for approval
- Manager reviews:
  - Commission terms fair and aligned with market?
  - Volume commitment realistic?
  - Any red flags in vendor background?
- Manager approves or requests changes

### Step 7: Contract Execution (DocuSign)

**7.1 Send Contract for Signature**

- Click **[Send for Signature]**
- DocuSign sends contract to:
  1. Vendor contact (signs first)
  2. InTime authorized signer (Bench Sales Manager or Regional Director) (signs second)

**7.2 Vendor Signs**

- Vendor receives email from DocuSign
- Reviews contract
- Signs electronically
- DocuSign notifies InTime

**7.3 InTime Countersigns**

- Authorized signer receives notification
- Reviews signed contract
- Countersigns
- Contract fully executed

**7.4 System Updates**

- Fully signed contract auto-uploads to vendor profile
- Vendor status updated: `Onboarding` → `Active`
- System notifies recruiter: "Vendor onboarding complete!"

### Step 8: Finance Setup

**8.1 Finance Creates Vendor Record**

- Finance receives notification of new vendor
- Sets up vendor in accounting system (QuickBooks, NetSuite, etc.)
- Enters banking information for ACH payments
- Configures payment terms (Net 30)

**8.2 Test Payment (Optional)**

- For high-value vendors, Finance may send $1 test payment
- Confirm ACH details are correct

### Step 9: System Access & Training

**9.1 Provision Vendor Portal Access (if applicable)**

- If vendor will access InTime Vendor Portal:
  - IT creates vendor user account
  - Send login credentials to primary contact
  - Provide portal user guide

**9.2 Onboarding Call**

Schedule 30-minute kickoff call:
- Introduce InTime processes
- Show how to submit requirements (email, portal, API)
- Explain how InTime will submit consultants
- Walk through commission tracking
- Set expectations for communication (response times, check-ins)
- Answer questions

### Step 10: Onboarding Complete - Begin Partnership

**10.1 Welcome Email**

```
Subject: Welcome to the InTime Vendor Network!

Hi [Vendor Contact],

Congratulations! Your vendor onboarding is complete and we're ready to
start working together.

What's Next:
✅ Your vendor profile is active in our system
✅ You can now submit job requirements to: vendors@intime.com
✅ We'll send you our consultant hotlists weekly
✅ Track your commissions in the Vendor Portal: [Link]

Partnership Overview:
- Commission Terms: [Summary of terms]
- Payment Terms: Net 30 days
- Primary Contact at InTime: [Recruiter Name] | [Email] | [Phone]

Weekly Check-Ins: We'll have a standing weekly call every [Day] at [Time].

Looking forward to a successful partnership!

Best,
[Recruiter Name]
Bench Sales Recruiter | InTime Staffing
```

**10.2 Add to Active Vendor List**

- Vendor now appears in Bench Sales Recruiter's vendor dashboard
- Included in weekly vendor check-in rotations
- Receives hotlist distributions

**10.3 Set Up Recurring Tasks**

System auto-creates:
- Weekly check-in task (call or email vendor)
- Monthly performance review reminder
- Quarterly business review (QBR) scheduling
- Annual contract renewal reminder (45 days before expiration)

---

## 6. Alternative Flows

### Alt-1: Vendor Declines Terms

- If vendor finds commission terms unacceptable during negotiation:
  - Recruiter escalates to Manager for approval of higher commission
  - If Manager approves: Update terms, proceed
  - If Manager declines: Part ways amicably, keep on file for future

### Alt-2: Legal Rejects Contract Terms

- If Legal team flags issues in custom contract:
  - Legal provides feedback and recommended changes
  - Recruiter re-negotiates with vendor
  - Revise contract and resubmit to Legal
  - Iterate until approved

### Alt-3: Background Check on Vendor (Due Diligence)

- For large vendors or those with significant volume commitments:
  - Manager may request business credit check
  - Verify vendor's client references
  - Check for litigation history
  - Confirm legitimacy (no fraud red flags)

---

## 7. Exception Flows

### Exc-1: Vendor Provides Fraudulent Documents

- If W-9 or COI appears fake or altered:
  - Immediately halt onboarding
  - Escalate to Legal and Manager
  - Request original documents directly from issuing authority
  - If fraud confirmed: Reject vendor, flag in system

### Exc-2: Vendor Goes Out of Business During Onboarding

- If vendor ceases operations before contract signed:
  - Archive vendor profile
  - Update status to `Onboarding - Abandoned`
  - No further action needed

---

## 8. Postconditions

**Success:**
- Vendor profile created and active
- All required documents collected and verified
- Custom commission terms documented
- Vendor agreement signed by both parties
- Banking setup complete
- Vendor portal access provisioned (if applicable)
- Kickoff call completed
- Vendor receives hotlists and can submit requirements

**Failure:**
- Vendor status remains `Onboarding - Incomplete` or `Rejected`
- Reason for failure documented
- Vendor notified (if applicable)

---

## 9. Business Rules

### BR-1: Required Documents
Cannot activate vendor without:
- W-9 (US) or W-8BEN (International)
- Certificate of Insurance ($1M minimum)
- ACH Banking Information
- Signed Vendor Agreement

### BR-2: Commission Approval Thresholds
| Commission % | Approval Required |
|--------------|------------------|
| ≤5% | None (auto-approve) |
| 6-7% | Manager approval |
| 8-10% | Regional Director approval |
| >10% | CFO approval (rare, strategic only) |

### BR-3: Onboarding Timeline Targets
- Total onboarding: 10-14 business days
- Document collection: 3 days
- Legal review (if needed): 5 days
- Contract signing: 2 days
- Finance setup: 2 days

---

## 10. Screen Specifications

### Screen: SCR-BENCH-014-01 - Vendor Onboarding Workflow

**Route:** `/employee/workspace/bench/vendors/onboard`

(Wireframe omitted for brevity - similar multi-step wizard to consultant onboarding)

---

## 11. Field Specifications

(Detailed field specs omitted for brevity - see Step 2.1 and 4.2 for key fields)

---

## 12. Integration Points

- **DocuSign:** Electronic contract signing
- **Business Verification Services:** Verify vendor legitimacy
- **Accounting System (QuickBooks/NetSuite):** Vendor master data sync
- **Vendor Portal:** User provisioning and access

---

## 13. RACI Assignments

| Action | R | A | C | I |
|--------|---|---|---|---|
| Vendor Qualification | Bench Sales Recruiter | Bench Sales Recruiter | - | Manager |
| Negotiate Terms | Bench Sales Recruiter | Bench Manager | Finance | - |
| Generate Contract | Bench Sales Recruiter | Legal (if custom) | - | Manager |
| Contract Approval | Bench Manager | Regional Director (if >7%) | Legal | CFO |
| Finance Setup | Finance | Finance | - | Recruiter |
| Onboarding Complete | Bench Sales Recruiter | Bench Manager | - | COO |

---

## 14. Metrics & Analytics

- Vendors Onboarded per Month: Target 2-3
- Avg Time to Onboard: Target <14 days
- Onboarding Completion Rate: Target >80%
- Vendor Retention (1 year): Target >70%

---

## 15. Test Cases

### TC-BENCH-014-001: Successful Vendor Onboarding (Happy Path)

1. Recruiter creates vendor profile
2. Negotiates 5% tiered commission
3. Vendor uploads all documents
4. Recruiter verifies documents
5. System generates contract
6. Manager approves
7. Both parties sign via DocuSign
8. Finance sets up banking
9. Vendor status = Active
10. Welcome email sent

Expected: Vendor onboarded in <10 days, all documents verified, ready to transact.

---

## 16. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | InTime v3 Product Team | Initial document creation |
