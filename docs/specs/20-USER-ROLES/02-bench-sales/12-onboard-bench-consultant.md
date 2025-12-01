# UC-BENCH-012: Onboard Bench Consultant

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Bench Sales Recruiter
**Status:** Approved

---

## 1. Overview

This use case describes the complete onboarding workflow for consultants joining the InTime bench. Onboarding transforms a qualified prospect into a placement-ready consultant with complete profile, verified documents, negotiated rates, and proper immigration/tax setup. This is a multi-day, collaborative process involving the Bench Sales Recruiter, HR, Immigration Attorney, and Finance.

---

## 2. Actors

### 2.1 Primary Actor
- **Bench Sales Recruiter** - Responsible for end-to-end onboarding process

### 2.2 Secondary Actors
- **Bench Sales Manager** - Approves rates, reviews onboarding completion
- **HR Manager** - Processes employment paperwork, background checks
- **Immigration Attorney** - Reviews visa cases, provides legal guidance
- **Finance Team** - Sets up payroll, vendor payments, banking
- **IT Support** - Provides system access if needed

### 2.3 System Actors
- **Background Check Service** (Checkr, HireRight) - Automated background screening
- **E-Verify System** - Work authorization verification (for W2 employees)
- **DocuSign** - Electronic signature for contracts and agreements
- **Resume Parser** - Extract and structure consultant data

---

## 3. Preconditions

- Consultant profile exists in system with stage = **Qualified** (from [UC-BENCH-011](./11-source-bench-consultant.md))
- Consultant has confirmed interest in joining bench
- All required fields from sourcing are complete
- Bench Sales Recruiter is assigned as owner

---

## 4. Trigger

One of the following initiates onboarding:
- Recruiter moves consultant stage from **Qualified** → **Onboarding**
- Consultant completes online onboarding form (sent via email link)
- Manager approves high-value consultant for expedited onboarding

---

## 5. Main Flow

### Step 1: Initiate Onboarding

**1.1 Update Consultant Stage**
- Navigate to consultant profile
- Click **[Start Onboarding]** button
- System updates stage: `Qualified` → `Onboarding`
- System creates onboarding checklist (auto-generated tasks)

**1.2 Onboarding Checklist Created**

System auto-generates tasks:

| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
| Send welcome packet | Bench Sales Recruiter | Day 0 | Pending |
| Collect consultant documents | Consultant | Day 2 | Pending |
| Rate negotiation | Bench Sales Recruiter | Day 3 | Pending |
| Contract type selection | Bench Sales Recruiter + Consultant | Day 3 | Pending |
| Background check initiated | HR | Day 4 | Pending |
| Immigration verification | Immigration Attorney | Day 5 | Pending |
| Complete profile setup | Bench Sales Recruiter | Day 7 | Pending |
| Manager review & approval | Bench Sales Manager | Day 8 | Pending |
| Onboarding complete | Bench Sales Recruiter | Day 10 | Pending |

**1.3 Send Welcome Packet**

System auto-sends email to consultant:

```
Subject: Welcome to InTime - Onboarding Started!

Hi [First Name],

Welcome to InTime! We're excited to have you join our bench and help you
find your next great opportunity.

Next Steps to Complete Your Onboarding:

1. Complete Onboarding Form: [Link]
   - Upload required documents (see list below)
   - Confirm your availability and preferences
   - Review and sign consultant agreement

2. Schedule Onboarding Call: [Calendly Link]
   - Duration: 30 minutes
   - We'll discuss rate expectations, contract types, and next steps

Required Documents (upload in onboarding portal):

✅ Updated Resume (Word or PDF)
✅ Work Authorization Documents (see details below)
✅ Professional References (2 required)
✅ W-9 or W-8BEN (for tax purposes)
✅ Photo ID (Driver's License or Passport)
✅ Certifications (if applicable)

Work Authorization Documents by Type:
- USC: Passport, Birth Certificate, or Naturalization Certificate
- Green Card: Copy of Green Card (front and back)
- H1B: Copy of I-797, Passport, Visa Stamp, I-94
- OPT/OPT-STEM: Copy of EAD, I-20, Passport
- TN: Copy of TN approval, Passport
- L1A/L1B: Copy of I-797, Passport, Visa Stamp
- Canada PR: Copy of PR Card, Passport
- Canada Work Permit: Copy of Work Permit, Passport

Questions? Reply to this email or call me directly at [Phone].

Best regards,
[Recruiter Name]
[Title] | InTime Staffing
[Phone] | [Email]
```

### Step 2: Consultant Completes Onboarding Form

**2.1 Consultant Accesses Portal**
- Consultant clicks link in welcome email
- Redirected to: `/onboarding/[token]` (secure, tokenized URL)
- System validates token, displays personalized onboarding form

**2.2 Onboarding Form Sections**

#### Section 1: Verify Basic Information
- Pre-filled from sourcing:
  - Name, Email, Phone, Location
- Consultant confirms or corrects
- Add secondary contact information:
  - Emergency contact name, phone, relationship

#### Section 2: Work Authorization Details
- Pre-filled: Work Authorization Type, Expiry Date
- Upload required documents (see list in email)
- Consultant confirms:
  - "I am legally authorized to work in [US/Canada]"
  - "I do not require sponsorship at this time" (or specify if they do)
- If visa holder:
  - Upload I-797 (H1B), EAD (OPT), or equivalent
  - Upload passport copy
  - Upload visa stamp (if applicable)
  - Upload I-94 record (if applicable)

#### Section 3: Professional Profile
- **Resume Upload:**
  - Drag-and-drop or browse
  - Accepted formats: PDF, DOC, DOCX
  - Max size: 5MB
  - System auto-parses and extracts:
    - Skills, certifications, work history, education
  - Consultant reviews and confirms parsed data

- **Skills & Technologies:**
  - Review auto-parsed skills
  - Add missing skills (tag input, autocomplete)
  - Rate proficiency for each skill:
    - Expert (5+ years, can mentor)
    - Advanced (3-5 years, independent work)
    - Intermediate (1-3 years, some guidance needed)
    - Beginner (<1 year, learning)

- **Certifications:**
  - Add certifications (AWS, Azure, PMP, etc.)
  - Upload certificate copies
  - Include expiry dates if applicable

- **Education:**
  - Degrees (BS, MS, PhD)
  - Schools, graduation years
  - Majors/specializations

- **Professional References:**
  - Minimum 2 required
  - For each reference:
    - Full name
    - Title/Company
    - Relationship (Manager, Colleague, Client)
    - Email, Phone
    - How long you worked together
    - OK to contact? (Yes/No)

#### Section 4: Rate & Contract Preferences

- **Desired Pay Rate (Hourly):**
  - Currency: USD or CAD
  - Minimum acceptable rate: $___
  - Preferred rate: $___
  - ℹ️ Note: "This is YOUR pay rate. Bill rate to client will be higher."

- **Preferred Contract Types:**
  - ☐ C2C (Corp-to-Corp) - I have my own business entity
  - ☐ W2 (Employee) - I want to be an InTime employee with benefits
  - ☐ 1099 (Independent Contractor) - Self-employed individual
  - ℹ️ Info tooltips explain each option (see [UC-BENCH-017](./17-manage-contract-types.md))

- **If C2C Selected:**
  - Legal Entity Name: ___
  - EIN (Employer Identification Number): ___
  - Business Type: LLC, Corp, S-Corp, Sole Proprietor
  - Upload W-9 for entity

- **If W2 or 1099 Selected:**
  - Upload personal W-9
  - SSN (last 4 digits for verification)

- **Availability:**
  - Start Date: [Date Picker] (When can you start a new project?)
  - Notice Period: Immediate, 2 weeks, 1 month, Other
  - Maximum Commute: ___ miles (or fully remote only)
  - Relocation: Willing / Not willing / Maybe
  - Travel: Willing / Not willing / Up to ___% travel

- **Preferred Work Arrangements:**
  - ☐ Remote only
  - ☐ Hybrid (2-3 days/week onsite)
  - ☐ Onsite (4-5 days/week)
  - ☐ Flexible / Open to any

#### Section 5: Background Check Consent

- Review background check disclosure
- Consent checkboxes:
  - ☑ I authorize InTime to conduct a background check
  - ☑ I authorize InTime to conduct a drug screening (if required by client)
  - ☑ I certify that all information provided is accurate and complete
  - ☑ I understand that false information may result in termination

- Electronic Signature:
  - Type full legal name
  - Date (auto-filled)
  - IP address logged

#### Section 6: Banking & Payment (if W2 or 1099)

- **Direct Deposit:**
  - Bank Name: ___
  - Routing Number: ___
  - Account Number: ___
  - Account Type: Checking / Savings
  - Upload voided check (optional)

- **Payment Frequency:**
  - Weekly / Bi-weekly / Monthly (based on InTime policy)

#### Section 7: Additional Information

- **How did you hear about InTime?**
  - Dropdown: LinkedIn, Referral, Job Board, Vendor, Other

- **Career Goals (optional):**
  - Textarea: What are you looking for in your next role?

- **Special Accommodations:**
  - Any disability accommodations needed? (ADA compliance)

**2.3 Submit Onboarding Form**

- Consultant clicks **[Submit Onboarding]**
- System validates:
  - All required fields completed
  - At least one document uploaded for each category
  - Electronic signature provided
  - Background check consent given
- If validation passes:
  - System saves all data
  - Updates checklist task: "Collect consultant documents" → Complete
  - Sends confirmation email to consultant
  - Notifies recruiter: "Onboarding form submitted by [Name]"
- If validation fails:
  - Display error messages
  - Highlight missing fields
  - Allow consultant to correct and resubmit

### Step 3: Recruiter Reviews Submitted Documents

**3.1 Notification Received**
- Recruiter receives Slack/email notification: "Onboarding form completed by [Consultant Name]"
- Navigate to consultant profile
- **Onboarding Tab** now shows submitted documents

**3.2 Document Review Checklist**

| Document | Status | Action |
|----------|--------|--------|
| Resume | ✅ Uploaded | [Download] [Review Parsed Data] |
| Work Auth Docs | ✅ Uploaded | [Download] [Verify Authenticity] |
| W-9 / W-8BEN | ✅ Uploaded | [Download] [Forward to Finance] |
| Photo ID | ✅ Uploaded | [Download] [Verify Identity] |
| Certifications | ⚠️ 1 of 3 uploaded | [Request Missing] |
| References | ✅ 2 provided | [Contact References] |

**3.3 Verify Work Authorization Documents**

- Compare uploaded documents against consultant claims:
  - Visa type matches uploaded I-797/EAD?
  - Expiry date matches system record?
  - Name on documents matches profile?
- Flag discrepancies:
  - If mismatch found → Update consultant stage to **Onboarding - Issues** → Contact consultant to clarify
- If documents appear fraudulent or altered:
  - Escalate to HR and Immigration Attorney immediately
  - Do NOT proceed with onboarding

**3.4 Immigration Attorney Review (if visa holder)**

- If consultant has visa (H1B, OPT, L1, TN, etc.):
  - Forward documents to Immigration Attorney via secure portal
  - Attorney reviews for:
    - Validity of work authorization
    - Compliance with visa terms (employer restrictions, location restrictions)
    - Upcoming renewal requirements
  - Attorney provides determination:
    - ✅ Approved - Consultant can work
    - ⚠️ Conditional - Can work with restrictions (document in system)
    - ❌ Rejected - Cannot work (e.g., expired EAD, invalid H1B transfer)
- If rejected:
  - Update stage to **Onboarding - Failed**
  - Send rejection email to consultant with attorney guidance
  - Archive profile

**3.5 Request Missing Documents (if any)**

- If any required documents missing or incomplete:
  - Click **[Request Documents]**
  - Select missing items from checklist
  - System sends automated email:
    ```
    Subject: InTime Onboarding - Additional Documents Needed

    Hi [First Name],

    Thank you for completing your onboarding form! We need a few additional
    documents to finalize your profile:

    Missing Documents:
    - [Document 1]
    - [Document 2]

    Please upload these at your earliest convenience: [Portal Link]

    Best,
    [Recruiter Name]
    ```
  - Set reminder to follow up in 2 days if not received

### Step 4: Rate Negotiation & Contract Type Finalization

**4.1 Review Consultant Rate Expectations**

- Navigate to **Onboarding Tab** → **Rate & Preferences** section
- Consultant submitted:
  - Desired pay rate: $75/hr
  - Preferred contract type: C2C or W2 (flexible)

**4.2 Market Rate Research**

- Use Rate Calculator tool:
  - Input: Skills, Years of Experience, Location
  - Output: Market rate range for similar consultants
  - Example output:
    ```
    Java Developer | 5 years | New York, NY
    Market Pay Rate: $70-85/hr (C2C) | $60-75/hr (W2)
    Typical Bill Rate: $95-115/hr
    ```

**4.3 Calculate InTime Margin**

Use Rate Negotiation Framework (see [UC-BENCH-018](./18-negotiate-rates.md)):

| Contract Type | Consultant Pay | InTime Cost (W2 burden) | Target Bill Rate | Margin | Margin % |
|---------------|----------------|------------------------|------------------|--------|----------|
| C2C | $75/hr | $75/hr | $98/hr | $23/hr | 23.5% ✅ |
| W2 | $65/hr | $80/hr (with taxes/benefits) | $105/hr | $25/hr | 23.8% ✅ |
| 1099 | $70/hr | $70/hr | $92/hr | $22/hr | 23.9% ✅ |

**4.4 Determine Recommendation**

- Based on market data and margin targets:
  - **If consultant rate is within market:** Accept as-is
  - **If consultant rate is 10-20% above market:** Negotiate down or justify with rare skills
  - **If consultant rate is >20% above market:** Likely reject or push back significantly

**4.5 Rate Negotiation Call**

Schedule 15-minute call (or email if consultant prefers):

**Agenda:**
1. Thank consultant for interest
2. Present market data:
   - "Based on our research for [Skills] with [Years] experience in [Location], the market rate is typically $[Range]."
3. Discuss contract type pros/cons:
   - C2C: Higher take-home, but consultant handles taxes and insurance
   - W2: Lower take-home, but InTime provides benefits, taxes withheld
   - 1099: Middle ground, but consultant handles taxes
4. Present offer:
   - "We'd like to offer $[Rate]/hr on a [C2C/W2/1099] basis."
   - "This allows us to bill clients at $[Bill Rate]/hr, which is competitive."
5. Negotiate:
   - If consultant pushes back, explain margin requirements
   - Offer compromise: Slightly higher rate for longer commitment, or performance bonuses
6. Finalize:
   - Reach agreement or determine consultant is not a fit

**4.6 Document Agreed Terms**

- Update consultant profile:
  - **Final Pay Rate:** $75/hr
  - **Final Contract Type:** C2C
  - **Target Bill Rate:** $98/hr
  - **Margin:** 23.5%
- Update checklist task: "Rate negotiation" → Complete
- Log activity: "Rate negotiation completed - Agreed to $75/hr C2C"

### Step 5: Background Check Initiation (if W2 or required by client)

**5.1 HR Initiates Background Check**

- HR receives notification from recruiter: "Consultant ready for background check"
- HR navigates to HR Portal → Background Checks
- Select vendor: Checkr, HireRight, or other
- Initiate check with consultant details:
  - Full name, DOB, SSN, Address history (last 7 years)
- Select package:
  - **Standard:** Criminal background, employment verification
  - **Comprehensive:** + Education verification, credit check, drug screening

**5.2 Consultant Completes Background Check**

- Consultant receives email from background check vendor
- Clicks link to complete authorization form
- Provides additional details (address history, previous employers)
- Submits authorization

**5.3 Wait for Results**

- Typical turnaround: 3-7 business days
- Results sent to HR
- HR reviews:
  - ✅ **Clear:** No issues, proceed with onboarding
  - ⚠️ **Conditional:** Minor issues (e.g., traffic violations), review with legal
  - ❌ **Failed:** Criminal record, false employment history → Reject candidate

**5.4 Update System**

- HR updates consultant profile:
  - **Background Check Status:** Clear / Conditional / Failed
  - **Background Check Date:** [Date]
  - Upload background check report (secure, HR-only access)
- If Clear:
  - Update checklist task: "Background check" → Complete
  - Notify recruiter: "Background check clear for [Name]"
- If Failed:
  - Notify recruiter and manager
  - Send adverse action notice to consultant (FCRA compliance)
  - Update stage to **Onboarding - Failed**

### Step 6: E-Verify (if W2 employee)

**6.1 HR Submits to E-Verify**

- If consultant is W2 employee, E-Verify is required (US only)
- HR submits consultant information to E-Verify system:
  - Name, DOB, SSN, Work Authorization Type
- E-Verify checks against DHS and SSA databases

**6.2 E-Verify Results**

- **Employment Authorized:** Cleared to work, proceed
- **Tentative Non-Confirmation (TNC):** Mismatch detected, consultant must resolve
  - Consultant has 8 federal business days to contact SSA/DHS
  - If resolved → Proceed
  - If not resolved → Cannot employ as W2

**6.3 Update System**

- HR updates profile:
  - **E-Verify Status:** Authorized / TNC / Failed
  - **E-Verify Case Number:** [Number]
- If Authorized:
  - Update checklist task: "E-Verify" → Complete

### Step 7: Contract Generation & Signing

**7.1 Generate Consultant Agreement**

- Recruiter navigates to consultant profile → **Contracts Tab**
- Click **[Generate Agreement]**
- System pre-fills contract template based on contract type:

**If C2C:**
- **Template:** Corp-to-Corp Services Agreement
- **Parties:**
  - InTime Inc. (Client)
  - [Consultant LLC Name] (Vendor)
- **Key Terms:**
  - Services: IT consulting services as assigned
  - Rate: $75/hr (consultant pay rate)
  - Payment Terms: Net 7 days (weekly invoicing)
  - Contract Duration: Indefinite (at-will)
  - Termination: Either party, 2 weeks notice
  - Insurance: Consultant must carry $1M liability insurance
  - Taxes: Consultant responsible for all taxes
  - Non-Compete: 6 months after contract end (negotiate if consultant objects)

**If W2:**
- **Template:** Employment Agreement (At-Will)
- **Parties:**
  - InTime Inc. (Employer)
  - [Consultant Name] (Employee)
- **Key Terms:**
  - Position: IT Consultant
  - Hourly Rate: $65/hr
  - Benefits: Health insurance, 401(k) matching, PTO
  - At-Will: Either party can terminate any time
  - Payroll: Bi-weekly via direct deposit
  - Taxes: InTime withholds federal, state, FICA

**If 1099:**
- **Template:** Independent Contractor Agreement
- **Parties:**
  - InTime Inc. (Client)
  - [Consultant Name] (Contractor)
- **Key Terms:**
  - Services: IT consulting services
  - Rate: $70/hr
  - Payment: Weekly invoicing, Net 7 days
  - Taxes: Consultant receives 1099 at year-end, responsible for self-employment tax
  - No benefits provided

**7.2 Recruiter Reviews & Customizes**

- Review auto-filled contract
- Customize if needed:
  - Add specific project scope (if known)
  - Adjust payment terms (if negotiated)
  - Add special clauses (non-solicitation, IP ownership, etc.)
- Save contract draft

**7.3 Manager Approval (if required)**

- If contract has non-standard terms OR rate <22% margin:
  - Submit to Bench Sales Manager for approval
  - Manager reviews contract
  - Approves or requests changes
- If standard terms:
  - Skip approval, proceed to send

**7.4 Send for Signature (DocuSign)**

- Click **[Send for Signature]**
- System integrates with DocuSign:
  - Uploads contract PDF
  - Sets signing order:
    1. Consultant signs first
    2. InTime authorized signer (Manager or HR) signs second
  - Sends email to consultant with DocuSign link

**7.5 Consultant Signs Contract**

- Consultant receives email: "InTime Contract Ready for Signature"
- Clicks link to DocuSign
- Reviews contract
- Signs electronically
- DocuSign notifies InTime: "Document signed by [Consultant]"

**7.6 InTime Countersigns**

- Manager or HR receives DocuSign notification
- Reviews signed contract
- Countersigns
- Contract fully executed

**7.7 System Updates**

- DocuSign sends completed contract to InTime system
- System stores contract in consultant profile (Documents tab)
- Updates checklist task: "Contract signed" → Complete
- Notifies recruiter: "Contract fully executed for [Consultant]"

### Step 8: Complete Profile Setup

**8.1 Finalize Consultant Profile**

Recruiter performs final profile review:

- **Personal Information:** ✅ Complete
- **Work Authorization:** ✅ Verified and documented
- **Skills & Experience:** ✅ Resume parsed and confirmed
- **Certifications:** ✅ Uploaded and validated
- **Rate & Contract Type:** ✅ Negotiated and agreed
- **Background Check:** ✅ Clear (if applicable)
- **E-Verify:** ✅ Authorized (if W2)
- **Contract:** ✅ Signed and executed
- **Banking:** ✅ Direct deposit setup (if W2/1099)
- **Professional Photo:** ⚠️ Missing → Request

**8.2 Request Professional Photo**

- If not already uploaded:
  - Send email to consultant:
    ```
    Subject: Final Step - Professional Photo

    Hi [First Name],

    We're almost done! To complete your profile, please upload a professional
    headshot photo. This will be used for:
    - Hotlists and marketing materials
    - Client submissions
    - Internal directory

    Requirements:
    - Professional attire
    - Neutral background
    - High resolution (min 500x500px)
    - Recent photo (within 1 year)

    Upload here: [Portal Link]

    Thanks!
    [Recruiter Name]
    ```

**8.3 Create Marketing Profile**

- Navigate to **Marketing Tab** on consultant profile
- Generate marketing-ready consultant summary:

**Template:**

```
[Consultant Name]
[Primary Title] | [Years] Years Experience

SKILLS:
- [Skill 1], [Skill 2], [Skill 3], ... (top 10 skills)

EXPERIENCE HIGHLIGHTS:
- [Most recent employer]: [Title] ([Dates])
  - [Key achievement/project 1]
  - [Key achievement/project 2]

EDUCATION:
- [Degree], [Major], [School], [Year]

CERTIFICATIONS:
- [Cert 1], [Cert 2]

WORK AUTHORIZATION: [Type]
AVAILABILITY: [Date]
LOCATION: [City, State]
RATE: [Confidential - Contact for details]
```

- Save marketing profile
- This auto-populates in hotlists and email blasts

**8.4 Add to Bench Consultant Pool**

- Update stage: `Onboarding` → `Active - Available`
- Set **Bench Start Date:** [Today's date]
- Consultant now visible in Bench Dashboard
- Eligible for marketing and submissions

**8.5 Update Checklist**

- Mark task complete: "Complete profile setup" → ✅ Complete

### Step 9: Manager Review & Approval

**9.1 Notify Manager**

- System auto-notifies Bench Sales Manager:
  ```
  Subject: New Bench Consultant Ready for Review

  A new consultant has completed onboarding and is ready for your review:

  Name: [Consultant Name]
  Skills: [Top 3 Skills]
  Rate: $[Rate]/hr ([C2C/W2/1099])
  Start Date: [Date]
  Recruiter: [Recruiter Name]

  [Review Profile]  [Approve]  [Request Changes]
  ```

**9.2 Manager Reviews Profile**

Manager checks:
- Profile completeness (all required fields filled)
- Rate competitiveness (within market range?)
- Margin adequacy (>22% target?)
- Document authenticity (work auth, resume, certifications)
- Contract terms (standard or custom?)
- Immigration compliance (if visa holder)

**9.3 Manager Decision**

- **Approve:**
  - Click **[Approve]**
  - Consultant remains `Active - Available`
  - Recruiter notified: "Consultant approved by manager"
- **Request Changes:**
  - Click **[Request Changes]**
  - Specify what needs fixing (e.g., "Rate too high, renegotiate to $70/hr")
  - Consultant stage reverts to `Onboarding - Issues`
  - Recruiter addresses issues and resubmits
- **Reject:**
  - Rare, but if consultant does not meet quality bar
  - Update stage to `Onboarding - Failed`
  - Recruiter sends rejection email

### Step 10: Onboarding Complete - Welcome to Bench

**10.1 Send Welcome Email (Post-Approval)**

System auto-sends congratulatory email:

```
Subject: Welcome to the InTime Bench - You're All Set!

Hi [First Name],

Congratulations! Your onboarding is complete and you're now officially part of the
InTime bench.

Here's what happens next:

✅ Your profile is live and being actively marketed to our clients and vendor partners
✅ You'll receive weekly updates on matching opportunities
✅ We'll contact you BEFORE submitting your profile to any requirement
✅ You can track your submissions and interviews in the Consultant Portal: [Link]

What to Expect:
- Weekly check-ins from your recruiter ([Recruiter Name])
- Job matches sent via email as they become available
- Interview coordination and prep support
- Placement within 30 days on average (our goal!)

Your Recruiter:
[Recruiter Name]
[Email] | [Phone]

Consultant Portal Access:
[Portal Link]
Username: [Email]
Temporary Password: [Generated Password] (Change on first login)

Thank you for trusting InTime with your career. Let's find you a great opportunity!

Best,
The InTime Team
```

**10.2 Update Final Checklist Tasks**

- Task: "Manager review & approval" → ✅ Complete
- Task: "Onboarding complete" → ✅ Complete
- Onboarding checklist now 100% complete

**10.3 Add to Marketing Queues**

- Auto-add consultant to:
  - **Weekly Hotlist** (if skills match current hot requirements)
  - **LinkedIn Marketing Campaign** (if opted in)
  - **Vendor Email Blast** (next scheduled blast)

**10.4 Set Up Ongoing Engagement**

- Create recurring task for recruiter:
  - **Weekly Check-In:** Every Monday, call or email consultant
  - **Purpose:** Maintain engagement, confirm availability, share updates
- Set reminder: **30-Day Review**
  - If consultant not placed in 30 days, escalate to manager for strategy review

**10.5 Celebrate Internally**

- Post in team Slack channel:
  ```
  🎉 New Bench Consultant Onboarded!

  Name: [Consultant Name]
  Skills: [Top 3 Skills]
  Rate: $[Rate]/hr
  Recruiter: [Recruiter Name]

  Let's get [him/her/them] placed quickly!
  ```

---

## 6. Alternative Flows

### Alt-1: Consultant Requests Changes to Contract

**Trigger:** Consultant reviews contract and objects to specific terms (e.g., non-compete duration, payment terms)

**Flow:**
1. Consultant emails recruiter with concerns
2. Recruiter reviews objections
3. **If minor (e.g., clarification):**
   - Recruiter responds with explanation
   - Consultant satisfied, proceeds to sign
4. **If significant (e.g., wants Net 30 instead of Net 7):**
   - Recruiter escalates to Bench Sales Manager
   - Manager evaluates:
     - Can we accommodate? (flexibility based on consultant value)
     - Counter-offer?
   - If approved: Regenerate contract with updated terms, resend for signature
   - If rejected: Explain to consultant, offer compromise or part ways

### Alt-2: Background Check Reveals Issues

**Trigger:** Background check returns with criminal record, employment discrepancies, or failed drug test

**Flow:**
1. HR receives background check report
2. HR reviews findings:
   - **Minor issues (e.g., traffic violations):** Proceed with caution, document
   - **Moderate issues (e.g., misdemeanor from 10 years ago):** Evaluate relevance, consult legal
   - **Major issues (e.g., recent felony, falsified resume):** Reject candidate
3. **If Rejecting:**
   - HR sends **Adverse Action Notice** (FCRA requirement):
     ```
     Subject: InTime Background Check - Pre-Adverse Action Notice

     Dear [Consultant Name],

     InTime Staffing has received your background check report from [Vendor].
     Based on information in this report, we are considering not moving forward
     with your onboarding.

     Attached is a copy of your background check report and a summary of your
     rights under the Fair Credit Reporting Act (FCRA).

     You have 5 business days to review the report and dispute any inaccuracies
     with [Vendor] before we make a final decision.

     If you have questions, please contact [HR Email].

     Sincerely,
     InTime HR Team
     ```
   - Wait 5 business days for consultant to dispute
   - If no dispute or dispute fails: Send **Final Adverse Action Notice**
   - Update stage to `Onboarding - Failed`
   - Do NOT proceed with employment

4. **If Proceeding with Caution:**
   - Document decision and rationale in consultant profile
   - Flag profile for manager review of first placement
   - Proceed with onboarding

### Alt-3: Immigration Attorney Rejects Work Authorization

**Trigger:** Attorney reviews visa documents and determines consultant cannot legally work or has significant compliance issues

**Flow:**
1. Attorney sends determination to recruiter and HR:
   - "Consultant's EAD expired 30 days ago, renewal not filed. Cannot work."
   - OR "H1B transfer requires approval before starting work. Consultant cannot begin until I-797 received."
2. Recruiter updates stage to `Onboarding - Immigration Hold`
3. Recruiter contacts consultant:
   ```
   Subject: Work Authorization Issue - Action Required

   Hi [First Name],

   Our immigration attorney has reviewed your work authorization documents
   and identified an issue: [Specific issue].

   Next Steps:
   [Attorney's recommended action, e.g., "File EAD renewal immediately"]

   We cannot proceed with placement until this is resolved. Please contact
   our immigration attorney directly to discuss: [Attorney Email/Phone].

   We'll keep your profile on hold and revisit once your work authorization
   is updated.

   Best,
   [Recruiter Name]
   ```
4. Set reminder to follow up in 30 days or when consultant notifies resolution
5. If consultant resolves issue → Resume onboarding
6. If consultant cannot resolve → Move to `Onboarding - Failed`

### Alt-4: Consultant Delays or Ghosts

**Trigger:** Consultant stops responding during onboarding (doesn't complete form, doesn't sign contract, etc.)

**Flow:**
1. After 3 business days of no response:
   - Send follow-up email:
     ```
     Subject: InTime Onboarding - Checking In

     Hi [First Name],

     I wanted to check in on your onboarding status. I see you haven't yet
     [completed the onboarding form / signed the contract].

     Are you still interested in joining the InTime bench? If so, please let
     me know what questions or concerns you have.

     If now is not the right time, no problem - just let me know and we can
     revisit later.

     Best,
     [Recruiter Name]
     ```

2. After 7 business days of no response:
   - Send final follow-up:
     ```
     Subject: InTime Onboarding - Final Follow-Up

     Hi [First Name],

     I haven't heard back from you regarding your onboarding. I'll assume
     you're no longer interested at this time and will close your onboarding.

     If you'd like to revisit in the future, feel free to reach out anytime.

     Best of luck!
     [Recruiter Name]
     ```

3. Update stage to `Onboarding - Abandoned`
4. Archive profile (can reactivate if consultant re-engages)

### Alt-5: High-Value Consultant - Expedited Onboarding

**Trigger:** Consultant has rare skills (e.g., SAP FICO, Mainframe) or high bill rate potential (>$120/hr)

**Flow:**
1. During sourcing, consultant is flagged as **High Priority**
2. Manager is notified immediately
3. **Expedited process:**
   - Skip standard approval gates (manager pre-approves rate)
   - Assign dedicated HR contact for fast background check
   - Immigration attorney prioritizes document review
   - Contract generated same-day
   - Target onboarding completion: **3 business days** (vs standard 10 days)
4. Recruiter maintains daily contact with consultant
5. Once onboarded, immediately add to priority hotlist and direct client outreach

---

## 7. Exception Flows

### Exc-1: Consultant Provides Fraudulent Documents

**Trigger:** HR or Immigration Attorney detects fake I-797, altered EAD, or fraudulent certifications

**Flow:**
1. Immediately notify:
   - Bench Sales Manager
   - HR Compliance
   - Legal team
2. Freeze onboarding:
   - Update stage to `Onboarding - Fraud Detected`
   - Flag profile as **Do Not Hire**
3. Legal review:
   - Determine if law enforcement should be notified (immigration fraud is federal crime)
   - Assess liability risk
4. Notify consultant (if safe to do so):
   ```
   Subject: Onboarding Discontinued

   Dear [Consultant Name],

   We are unable to proceed with your onboarding due to discrepancies in your
   documentation. Your profile has been closed.

   If you believe this is an error, please contact [Legal Email] with supporting
   documentation.

   Sincerely,
   InTime Legal Team
   ```
5. Document all evidence in secure, legal-only folder
6. Add to industry-wide fraud database (if participating)

### Exc-2: System Error During Contract Generation

**Trigger:** DocuSign integration fails, contract template corrupted, or technical glitch

**Flow:**
1. System displays error message
2. Recruiter attempts retry
3. If error persists:
   - Contact IT support via Slack #tech-support
   - Provide error details and screenshot
4. IT support investigates
5. **Temporary workaround:**
   - Manually generate contract from Word template
   - Email to consultant for signature (wet signature or DocuSign manual send)
   - Upload signed contract to system manually
6. IT resolves system issue for future use

### Exc-3: Consultant Fails Drug Test

**Trigger:** Background check vendor reports failed drug screening

**Flow:**
1. HR receives notification
2. Review results:
   - **Positive for illegal substances:** Immediate rejection
   - **Positive for prescription medication:** Request medical explanation (ADA compliance)
3. **If rejecting:**
   - Send Adverse Action Notice (see Alt-2)
   - Update stage to `Onboarding - Failed`
   - Do NOT disclose reason to recruiter (medical privacy)
4. **If accepting with medical explanation:**
   - Document in HR-only file
   - Proceed with onboarding
   - Note: Some clients may still reject based on their policies

---

## 8. Postconditions

**Successful Completion:**
- Consultant profile is complete and verified
- All documents collected and validated
- Work authorization confirmed by immigration attorney (if applicable)
- Background check cleared (if applicable)
- Rate negotiated and agreed
- Contract type selected (C2C, W2, or 1099)
- Contract signed by both parties
- Banking/payment setup complete (if W2/1099)
- Consultant stage updated to **Active - Available**
- Consultant added to bench pool and marketing queues
- Onboarding checklist 100% complete
- Manager approval received

**Failed/Rejected:**
- Consultant stage updated to **Onboarding - Failed** (with reason)
- Rejection email sent to consultant
- Profile archived
- All stakeholders notified
- Lessons learned documented (if process issue)

---

## 9. Business Rules

### BR-1: Required Documents by Contract Type

**C2C:**
- ✅ Business entity W-9
- ✅ Certificate of Incorporation (or LLC formation docs)
- ✅ Proof of liability insurance ($1M minimum)
- ✅ Work authorization documents

**W2:**
- ✅ Personal W-9 (or W-4)
- ✅ I-9 with supporting documents
- ✅ Direct deposit authorization
- ✅ Background check consent
- ✅ E-Verify authorization
- ✅ Benefits enrollment forms

**1099:**
- ✅ Personal W-9
- ✅ Work authorization documents
- ✅ Background check consent (if required by client)

### BR-2: Onboarding Timeline Targets

| Stage | Target Duration | Maximum Duration | Escalation if Exceeded |
|-------|-----------------|------------------|------------------------|
| Document Collection | 2 days | 5 days | Recruiter follow-up |
| Immigration Review | 2 days | 7 days | Manager escalation |
| Background Check | 5 days | 10 days | HR escalation to vendor |
| Rate Negotiation | 1 day | 3 days | Manager involvement |
| Contract Signing | 2 days | 5 days | Recruiter follow-up |
| **Total Onboarding** | **10 days** | **21 days** | Manager review |

If onboarding exceeds 21 days without placement, manager reviews for:
- Process bottlenecks
- Consultant engagement issues
- Should we continue or archive?

### BR-3: Rate Approval Matrix

| Margin % | Approval Required | Notes |
|----------|------------------|-------|
| ≥25% | None (auto-approve) | Standard margin achieved |
| 22-24% | Manager notification | Acceptable, document reason |
| 18-21% | Manager approval | Below target, requires justification |
| 15-17% | Manager + Finance approval | Minimum margin, strategic only |
| <15% | Regional Director + CFO approval | Exception, volume deal only |

### BR-4: Background Check Requirements

**Always Required:**
- W2 employees (InTime policy)
- Consultants placing at clients with security clearances
- Consultants in financial services, healthcare, or government sectors

**Optional (Client-Dependent):**
- C2C consultants for non-sensitive roles
- 1099 consultants for non-sensitive roles

**Scope:**
- Standard: Criminal background (7 years), Employment verification (last 2 employers)
- Enhanced: + Education verification, Credit check
- Comprehensive: + Drug screening, Professional license verification

### BR-5: E-Verify Requirements

**Required:**
- All W2 employees in US (federal law for most employers)
- Some states require for all employees regardless of contract type

**Not Required:**
- C2C consultants (they are not employees)
- 1099 contractors (not employees, though some clients may require)

**Timeline:**
- Must be completed within 3 business days of hire date

### BR-6: Immigration Document Validity

System MUST enforce:
- Cannot onboard consultant with visa expiry <90 days (unless renewal pending with proof)
- H1B transfer: Cannot start work until I-797 approval notice received (portability DOES NOT apply to bench consultants without specific client)
- OPT: Must have valid EAD card with future expiry date
- GC-EAD: Must verify I-485 application still pending
- Canada OWP: Must have valid open work permit with future expiry date

### BR-7: Contract Non-Negotiable Terms

The following terms CANNOT be modified without Regional Director approval:
- Intellectual Property ownership (all work product belongs to InTime/client)
- Confidentiality obligations
- Non-solicitation of InTime clients (6 months post-contract)
- Indemnification clauses
- Governing law and jurisdiction

The following terms CAN be negotiated by recruiter/manager:
- Payment terms (Net 7 vs Net 30)
- Notice period (2 weeks vs 30 days)
- Non-compete duration (can reduce from 6 months to 3 months)
- Rate and payment frequency

---

## 10. Screen Specifications

### Screen: SCR-BENCH-012-01 - Onboarding Dashboard

**Route:** `/employee/workspace/bench/onboarding`
**Access:** Bench Sales Recruiter, Bench Sales Manager, HR, Admin
**Layout:** Kanban board with consultant cards by onboarding stage

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────────┐
│ Bench Dashboard > Onboarding                             [Help] [?]     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 📊 ONBOARDING PIPELINE                                  [View List]     │
│                                                                          │
│ ┌────────────┬────────────┬────────────┬────────────┬────────────┐     │
│ │  Started   │ Docs       │ Rate       │ Contract   │ Complete   │     │
│ │   (5)      │ Review (3) │ Negotiation│ Signing (2)│   (12)     │     │
│ │            │            │  (4)       │            │            │     │
│ ├────────────┼────────────┼────────────┼────────────┼────────────┤     │
│ │            │            │            │            │            │     │
│ │ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │     │
│ │ │Jane Doe│ │ │John S. │ │ │Maria G.│ │ │Tom B.  │ │ │Lisa C. │ │     │
│ │ │Java    │ │ │Python  │ │ │.NET    │ │ │AWS     │ │ │React   │ │     │
│ │ │Day 2   │ │ │Day 5   │ │ │Day 7   │ │ │Day 9   │ │ │Day 10  │ │     │
│ │ │🟡 Docs │ │ │🟢 Clear│ │ │⚠️ High │ │ │📝 Sent │ │ │✅ Done │ │     │
│ │ │Pending │ │ │        │ │ │  Rate  │ │ │        │ │ │        │ │     │
│ │ └────────┘ │ └────────┘ │ └────────┘ │ └────────┘ │ └────────┘ │     │
│ │            │            │            │            │            │     │
│ │ [+ Add]    │            │            │            │   Today: 2 │     │
│ │            │            │            │            │   Week: 8  │     │
│ └────────────┴────────────┴────────────┴────────────┴────────────┘     │
│                                                                          │
│ ⚡ QUICK ACTIONS                                                         │
│ [Start New Onboarding] [View Pending Tasks] [Generate Report]           │
│                                                                          │
│ 📋 MY ONBOARDING TASKS (Due This Week)                      [View All]  │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ 🔴 OVERDUE (2)                                                   │   │
│ │ • Follow up with Jane Doe - Missing W-9 (Due: 2 days ago)       │   │
│ │ • Rate negotiation call with John Smith (Due: Yesterday)        │   │
│ │                                                                  │   │
│ │ 🟡 DUE TODAY (3)                                                 │   │
│ │ • Review background check results for Maria Garcia              │   │
│ │ • Send contract to Tom Brown for signature                      │   │
│ │ • Manager approval needed for Lisa Chen                         │   │
│ │                                                                  │   │
│ │ 🟢 UPCOMING (5)                                                  │   │
│ │ • Immigration review for Ahmed K. (Due: Tomorrow)               │   │
│ │ • Complete profile setup for Sarah P. (Due: Friday)             │   │
│ │ • ... [See all tasks]                                           │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Screen: SCR-BENCH-012-02 - Consultant Onboarding Portal (Consultant View)

**Route:** `/onboarding/[token]` (Public, tokenized access)
**Access:** Consultant (via email link)
**Layout:** Multi-step wizard

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────────┐
│ [InTime Logo]                     Consultant Onboarding               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Welcome, Jane!                                                           │
│                                                                          │
│ [Progress Bar: =========>---------------- 60% Complete]                 │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ STEP 4: Rate & Contract Preferences                              │   │
│ │                                                                  │   │
│ │ Desired Hourly Pay Rate *                                       │   │
│ │ ┌─────────────────────┐  ℹ️ This is YOUR rate (before taxes).  │   │
│ │ │ $ 75.00         USD │     InTime will bill clients at a      │   │
│ │ └─────────────────────┘     higher rate to cover overhead.     │   │
│ │                                                                  │   │
│ │ Preferred Contract Type * (Select all you're open to)          │   │
│ │ ☑ C2C (Corp-to-Corp) - I have my own business entity           │   │
│ │    ℹ️ You invoice InTime, responsible for your own taxes        │   │
│ │                                                                  │   │
│ │ ☑ W2 (Employee) - I want to be an InTime employee              │   │
│ │    ℹ️ InTime withholds taxes, provides benefits, lower take-home│   │
│ │                                                                  │   │
│ │ ☐ 1099 (Independent Contractor) - Self-employed individual     │   │
│ │    ℹ️ You invoice InTime, receive 1099, pay self-employment tax │   │
│ │                                                                  │   │
│ │ [Compare Contract Types]                                         │   │
│ │                                                                  │   │
│ │ ─── C2C Details (Conditional) ───                               │   │
│ │                                                                  │   │
│ │ Business Legal Name *                                           │   │
│ │ ┌──────────────────────────────────────────────────────────────┐│   │
│ │ │ Jane Doe Consulting LLC                                      ││   │
│ │ └──────────────────────────────────────────────────────────────┘│   │
│ │                                                                  │   │
│ │ Employer Identification Number (EIN) *                          │   │
│ │ ┌──────────────────────────────────────────────────────────────┐│   │
│ │ │ 12-3456789                                                   ││   │
│ │ └──────────────────────────────────────────────────────────────┘│   │
│ │                                                                  │   │
│ │ Business Type *                                                 │   │
│ │ ○ LLC   ● S-Corp   ○ C-Corp   ○ Sole Proprietor                │   │
│ │                                                                  │   │
│ │ Upload W-9 for Business Entity *                                │   │
│ │ [Drag file here or click to browse]                            │   │
│ │ ✅ W9_JaneDoeConsulting.pdf (Uploaded)                          │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ [< Back: Skills]                           [Save Draft]  [Next: Banking >]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Field Specifications

(See full field specs in Section 5, Step 2.2 - Onboarding Form Sections)

**Key Fields:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| workAuthDocuments | file[] | Yes | PDF/JPG/PNG, max 5MB each | I-797, EAD, passport, etc. |
| resumeFile | file | Yes | PDF/DOC/DOCX, max 5MB | Latest version |
| professionalPhoto | file | Yes | JPG/PNG, min 500x500px | Headshot for marketing |
| references | object[] | Yes | Min 2, max 5 | Name, title, company, contact |
| w9File | file | Yes | PDF, max 2MB | Personal or business W-9 |
| backgroundCheckConsent | boolean | Yes | true | Required for W2 |
| electronicSignature | string | Yes | Full legal name | Contract acceptance |
| finalPayRate | currency | Yes | min:10, max:500 | Negotiated pay rate |
| finalContractType | enum | Yes | C2C, W2, 1099 | Selected contract type |
| bankRoutingNumber | string | Conditional (W2/1099) | 9 digits | Direct deposit |
| bankAccountNumber | string | Conditional (W2/1099) | Max 17 digits | Direct deposit |
| ein | string | Conditional (C2C) | XX-XXXXXXX format | Business EIN |
| businessLegalName | string | Conditional (C2C) | Max 200 chars | Entity name |

---

## 12. Integration Points

### 12.1 Background Check Service (Checkr/HireRight)
- **API:** REST API
- **Trigger:** HR initiates background check from HR Portal
- **Data Sent:** Name, DOB, SSN, Address, Consent
- **Data Received:** Background check report (PDF), status (Clear/Conditional/Failed)
- **Webhook:** Receive real-time status updates

### 12.2 E-Verify System
- **Service:** DHS E-Verify (government system)
- **Trigger:** HR submits after I-9 completion
- **Data Sent:** Name, DOB, SSN, Work Authorization Type
- **Data Received:** Employment Authorized / TNC / Final Non-Confirmation
- **Timeline:** Usually same-day response, TNC has 8-day resolution period

### 12.3 DocuSign Integration
- **API:** DocuSign eSignature API
- **Trigger:** Recruiter clicks "Send for Signature"
- **Flow:**
  1. InTime uploads contract PDF to DocuSign
  2. DocuSign emails consultant with signing link
  3. Consultant signs electronically
  4. DocuSign emails InTime signer for countersignature
  5. DocuSign webhooks notify InTime of completion
  6. Signed contract PDF auto-downloads to consultant profile
- **Webhook Events:** sent, delivered, signed, completed, declined, voided

### 12.4 Resume Parser (OpenAI GPT-4)
- **Service:** Internal resume parsing service
- **Input:** Resume file (PDF/DOC/DOCX)
- **Output:** Structured JSON with:
  - Contact info, skills, work history, education, certifications
- **Accuracy:** ~90% for standard resumes, requires human review

---

## 13. RACI Assignments

| Action | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|--------|-----------------|-----------------|---------------|--------------|
| Initiate Onboarding | Bench Sales Recruiter | Bench Sales Recruiter | - | Bench Manager |
| Send Welcome Packet | Bench Sales Recruiter | Bench Sales Recruiter | - | - |
| Collect Documents | Consultant | Bench Sales Recruiter | - | - |
| Verify Work Auth | Immigration Attorney | HR Compliance | Bench Sales Recruiter | Bench Manager |
| Rate Negotiation | Bench Sales Recruiter | Bench Manager (approval) | Finance (if margin <18%) | - |
| Generate Contract | Bench Sales Recruiter | Bench Sales Recruiter | Legal (if custom terms) | Manager |
| Background Check | HR | HR | - | Bench Sales Recruiter, Manager |
| E-Verify | HR | HR | - | - |
| Manager Approval | Bench Manager | Bench Manager | - | COO |
| Onboarding Complete | Bench Sales Recruiter | Bench Manager | - | COO |

---

## 14. Metrics & Analytics

### 14.1 Onboarding Efficiency Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Avg Time to Complete Onboarding | <10 days | Date qualified → Date active |
| Onboarding Completion Rate | >85% | Completed / Started |
| Onboarding Abandonment Rate | <15% | Abandoned / Started |
| Document Collection Time | <2 days | Onboarding start → Docs submitted |
| Contract Signing Time | <2 days | Contract sent → Signed |

### 14.2 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Background Check Pass Rate | >95% | Clear / Total checks |
| Immigration Approval Rate | >98% | Approved / Submitted for review |
| Rate Negotiation Success Rate | >90% | Agreed / Initiated |
| Profile Completeness | 100% | All required fields filled |

---

## 15. Test Cases

### TC-BENCH-012-001: Complete Onboarding (Happy Path - C2C)

**Priority:** Critical
**Type:** E2E
**Automated:** Partial

**Test Data:**
| Variable | Value |
|----------|-------|
| Consultant | Jane Doe (from TC-BENCH-011-001) |
| Work Auth | H1B (valid until 2026-12-31) |
| Rate | $75/hr (C2C) |
| Contract Type | C2C |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Recruiter moves consultant to "Onboarding" stage | Onboarding checklist created |
| 2 | System sends welcome email to consultant | Email received with portal link |
| 3 | Consultant clicks portal link | Onboarding form opens |
| 4 | Consultant completes all 7 sections of form | All fields filled, documents uploaded |
| 5 | Consultant submits form | Confirmation email sent, recruiter notified |
| 6 | Recruiter reviews documents | All documents valid |
| 7 | Immigration attorney reviews H1B docs | Approved |
| 8 | Recruiter negotiates rate ($75/hr C2C) | Agreement reached |
| 9 | System generates C2C contract | Contract pre-filled correctly |
| 10 | Contract sent to consultant via DocuSign | Consultant receives email |
| 11 | Consultant signs contract electronically | Signature captured |
| 12 | Manager countersigns contract | Contract fully executed |
| 13 | Recruiter completes profile setup | Profile 100% complete |
| 14 | Manager reviews and approves | Consultant moved to "Active - Available" |
| 15 | System sends welcome-to-bench email | Consultant receives confirmation |

**Postconditions:**
- Consultant is Active - Available
- All onboarding tasks complete
- Consultant visible in bench pool
- Ready for marketing and submissions

---

## 16. Accessibility

- **WCAG 2.1 AA Compliance:**
  - All form fields labeled clearly
  - File upload drag-and-drop has keyboard alternative
  - Document upload status announced to screen readers
  - Multi-step wizard shows clear progress indicator
  - Error messages specific and actionable

- **Mobile Optimization:**
  - Onboarding form fully responsive
  - File upload works via mobile camera (scan documents)
  - E-signature works on mobile browsers

---

## 17. Mobile Considerations

- Consultant onboarding portal optimized for mobile
- File uploads support mobile camera for document scanning
- DocuSign mobile app integration for contract signing
- Recruiter can review and approve onboarding from mobile app

---

## 18. Security

### Data Protection
- **PII Encryption:**
  - SSN, bank account numbers encrypted at rest
  - Work authorization documents stored in encrypted S3
  - Access logs maintained for all document views/downloads

### Compliance
- **FCRA (Fair Credit Reporting Act):**
  - Background check consent obtained
  - Adverse action notices sent if rejection based on report
- **I-9 Compliance:**
  - I-9 forms stored securely for 3 years post-hire
  - E-Verify completed within 3 business days
- **ADA (Americans with Disabilities Act):**
  - Accommodation requests handled confidentially
  - No discrimination based on medical conditions

---

## 19. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | InTime v3 Product Team | Initial document creation |
