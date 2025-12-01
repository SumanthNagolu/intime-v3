# UC-BENCH-011: Source Bench Consultant

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Bench Sales Recruiter
**Status:** Approved

---

## 1. Overview

This use case describes how Bench Sales Recruiters source new consultants to join the internal bench pool. Sourcing focuses on candidates with valid work authorization (US: USC, GC, H1B, OPT; Canada: Citizen, PR, OWP) who are immediately available for placement or seeking new opportunities. This workflow covers the complete journey from initial contact through qualification and handoff to onboarding.

---

## 2. Actors

### 2.1 Primary Actor
- **Bench Sales Recruiter** - Responsible for sourcing and qualifying bench consultants

### 2.2 Secondary Actors
- **Bench Sales Manager** - Approves high-value consultant additions, reviews pipeline
- **Immigration Attorney** - Consulted for complex visa cases
- **HR Manager** - Informed when consultants with visa sponsorship needs are sourced

### 2.3 System Actors
- **LinkedIn Scraper** - Auto-import candidate profiles from LinkedIn
- **Resume Parser** - Extract structured data from uploaded resumes
- **Duplicate Detection** - Prevent adding existing consultants

---

## 3. Preconditions

- User is authenticated with role: Bench Sales Recruiter, Bench Sales Manager, or higher
- User has access to sourcing tools (LinkedIn Sales Navigator, job boards, resume databases)
- User has active vendor network for referral sourcing

---

## 4. Trigger

One of the following events initiates sourcing:
- Daily sourcing routine (proactive pipeline building)
- Consultant referral received (via email, LinkedIn, vendor partner)
- Job board profile discovered matching bench criteria
- Networking event or industry conference contact
- Inbound inquiry from consultant seeking opportunities

---

## 5. Main Flow

### Step 1: Identify Potential Consultant

**1.1 LinkedIn Sourcing**
- Navigate to LinkedIn Sales Navigator
- Use boolean search strings:
  - `(Java OR Python OR .NET) AND (available OR "open to opportunities") AND (H1B OR OPT OR "Green Card" OR USC)`
  - `Technology AND "looking for" AND (contract OR C2C OR 1099)`
- Filter by:
  - Location (US: major metro areas; Canada: Toronto, Vancouver, Calgary, Montreal)
  - Current employment status (Open to work, Recently left position)
  - Work authorization indicators (profile keywords)
- Save promising profiles to "Bench Prospects" list

**1.2 Job Board Scraping (Dice, Indeed, Monster)**
- Search for profiles with:
  - "Available immediately"
  - "Looking for contract/consulting roles"
  - "Open to C2C"
  - Technology skills matching current market demand
- Download resumes or save profile links

**1.3 Vendor Referrals**
- Monitor vendor partner emails for consultant referrals
- Review vendor-provided profiles
- Verify consultant is not already represented by vendor exclusively

**1.4 Inbound Inquiries**
- Check bench-sales@intime.com inbox for consultant applications
- Review referrals from existing bench consultants (referral bonus program)

### Step 2: Initial Profile Review (Quick Screen)

**2.1 Open profile/resume**
- Review key criteria:
  - ✅ Valid work authorization (explicit mention of visa type)
  - ✅ Technology skills (in-demand: Java, Python, .NET, AWS, React, Angular, etc.)
  - ✅ Experience level (minimum 3 years for most roles)
  - ✅ Location (US/Canada markets only)
  - ✅ Availability (immediate or <30 days)

**2.2 Quick Qualification Decision**
- **Pass**: Meets 4/5 criteria above → Proceed to contact
- **Maybe**: Meets 3/5 criteria → Save for batch review
- **Fail**: Meets <3 criteria → Skip

### Step 3: Initial Contact (Multi-Channel Outreach)

**3.1 LinkedIn InMail (Preferred for cold outreach)**

Template:
```
Subject: Contract Consulting Opportunities - [Technology Stack]

Hi [First Name],

I came across your profile and noticed your strong background in [Technology].
I'm with InTime Staffing, and we specialize in placing consultants on high-quality
contract roles with top clients across [Location].

We currently have several immediate openings for:
- [Technology 1] - [Bill Rate Range] - [Location]
- [Technology 2] - [Bill Rate Range] - [Location]

We also work with consultants on C2C, W2, and 1099 arrangements.

Are you currently available or open to exploring new contract opportunities?

Best regards,
[Your Name]
[Title] | InTime Staffing
[Phone] | [Email]
```

**3.2 Email (If email address available)**

Subject: `High-Paying Contract Roles - [Technology] - [Location]`

Use similar template as LinkedIn, add:
- Link to company website
- Link to current hot job opportunities
- Call scheduling link (Calendly)

**3.3 Phone Call (If phone number available)**

Script:
- Introduce self and company
- Confirm availability status
- Quick screen on work authorization
- Gauge interest in contract/consulting roles
- Schedule follow-up call or send email with details

### Step 4: Log Prospect in System

**4.1 Navigate to Bench Module**
- Click **Bench Dashboard** → **[+ New Consultant]**
- Select source type:
  - LinkedIn
  - Job Board (Dice/Indeed/Monster)
  - Referral (Vendor)
  - Referral (Employee)
  - Inbound Application
  - Networking Event
  - Other

**4.2 Enter Basic Information**

| Field | Input | Notes |
|-------|-------|-------|
| First Name | [Text] | Required |
| Last Name | [Text] | Required |
| Email | [Email] | Required, validated |
| Phone | [Phone] | Required, US/Canada format |
| LinkedIn URL | [URL] | Optional but recommended |
| Current Location | [City, State/Province] | Auto-suggest from address DB |
| Willing to Relocate | [Yes/No/Maybe] | Important for national requirements |
| Work Authorization | [Dropdown] | USC, GC, H1B, OPT, etc. (see full list) |
| Visa Expiry Date | [Date Picker] | Required if visa type selected |
| Primary Skills | [Multi-select tags] | Technology, tools, frameworks |
| Years of Experience | [Number] | Total professional experience |
| Current Availability | [Dropdown] | Immediate, 2 weeks, 1 month, Not available |
| Desired Rate (Hourly) | [Currency] | Consultant's expected pay rate |
| Preferred Contract Type | [Checkboxes] | C2C, W2, 1099 (can select multiple) |
| Source | [Auto-filled] | Based on Step 4.1 selection |
| Source Details | [Text] | LinkedIn URL, referral name, etc. |
| Notes | [Textarea] | Initial impression, red flags, special notes |

**4.3 Upload Resume (if available)**
- Drag-and-drop or browse to upload
- System auto-parses resume:
  - Extracts skills, employers, education
  - Validates email/phone against manual entry
  - Suggests skills tags
- Review and confirm parsed data

**4.4 Set Pipeline Stage**
- **Stage Options:**
  - `Sourced` (just identified)
  - `Contacted` (outreach sent, awaiting response)
  - `Responded` (replied, needs qualification call)
  - `Qualified` (passed initial screen, ready for onboarding)
  - `Rejected` (did not meet criteria)
  - `Unresponsive` (no reply after 3 attempts)

- **Default:** `Sourced` if no contact yet, `Contacted` if already reached out

**4.5 Assign Owner**
- **Default:** Current user (you)
- **Override:** If sourced for another team member, assign accordingly

**4.6 Save Consultant Profile**
- Click **[Save Draft]** to save without notifications
- Click **[Save & Contact]** to save and trigger automated follow-up sequence

### Step 5: Follow-Up Sequence (Automated + Manual)

**5.1 Automated Email Sequence (if opted in)**

Day 0 (Immediate):
- Welcome email with company overview
- Current job opportunities PDF attachment
- Link to schedule screening call

Day 3 (if no response):
- Follow-up email highlighting specific matching roles
- Success stories from placed consultants
- LinkedIn connection request

Day 7 (if no response):
- Final touch-point email
- Offer to keep on file for future opportunities
- Option to unsubscribe from outreach

**5.2 Manual Follow-Up Tasks**
- System creates task: "Follow up with [Name] - [Date]"
- Task appears in **My Tasks** dashboard
- Snooze/reschedule if needed

### Step 6: Qualification Call (Initial Phone Screen)

**6.1 Schedule Call**
- Send Calendly link or manually schedule
- Duration: 15-20 minutes
- Add to calendar with consultant phone/email

**6.2 Qualification Checklist (Cover During Call)**

| Topic | Questions | Notes |
|-------|-----------|-------|
| **Work Authorization** | "Can you confirm your current work authorization status?" "When does your visa expire?" | Verify eligibility, no red flags |
| **Availability** | "When are you available to start a new role?" "Are you currently employed?" | Immediate or <30 days preferred |
| **Rate Expectations** | "What's your expected hourly rate for contract roles?" "Are you open to C2C, W2, or 1099?" | Align with market rates |
| **Skills Validation** | "Walk me through your recent projects using [Technology]." "How many years with [Skill]?" | Confirm resume accuracy |
| **Location Preferences** | "Are you open to remote, hybrid, or onsite roles?" "Any geographic restrictions?" | Match to client requirements |
| **Background Check** | "Are you able to pass a standard background check and drug test?" | Red flag if hesitation |
| **References** | "Can you provide 2 professional references from recent projects?" | Required for placement |
| **Current Status** | "Are you working with other staffing agencies?" "Any pending offers or interviews?" | Gauge competition, urgency |

**6.3 Update Profile After Call**
- Log call activity in system
- Update pipeline stage:
  - **Qualified** (meets all criteria, ready for bench)
  - **Needs Follow-Up** (some gaps, need more info)
  - **Rejected** (does not meet criteria, disqualify)
- Add detailed notes on conversation
- Flag any immigration concerns (escalate to HR if needed)

### Step 7: Decision & Next Steps

**7.1 If Qualified → Handoff to Onboarding**
- Update stage to **Qualified**
- Notify Bench Sales Manager (if high-value consultant: rate >$80/hr, rare skills)
- Trigger onboarding workflow (see [UC-BENCH-012: Onboard Bench Consultant](./12-onboard-bench-consultant.md))
- Send consultant email:
  ```
  Subject: Next Steps - InTime Bench Onboarding

  Hi [First Name],

  Great speaking with you! Based on our conversation, I'd like to move forward
  with onboarding you to our bench for immediate placement opportunities.

  Next steps:
  1. Complete the attached onboarding form
  2. Upload updated resume and work authorization documents
  3. Schedule formal onboarding call (link below)

  [Calendly Link]

  Looking forward to working together!

  Best,
  [Your Name]
  ```

**7.2 If Needs Follow-Up → Set Reminder**
- Update stage to **Needs Follow-Up**
- Create task with specific follow-up action:
  - "Verify H1B transfer timeline"
  - "Get updated resume with [Technology] projects"
  - "Confirm rate flexibility"
- Set reminder date

**7.3 If Rejected → Disqualify**
- Update stage to **Rejected**
- Select rejection reason:
  - Insufficient experience
  - Work authorization issues
  - Rate expectations too high
  - Skills mismatch
  - Location restrictions
  - Failed background check (if applicable)
  - Not interested in contract roles
  - Other (specify)
- Send polite rejection email (optional):
  ```
  Subject: Re: Contract Consulting Opportunities

  Hi [First Name],

  Thank you for your time speaking with me. At this time, we don't have
  opportunities that align with your current profile and preferences.

  I'll keep your information on file and reach out if a better match arises.

  Best of luck in your search!

  [Your Name]
  ```

**7.4 If Unresponsive → Archive**
- After 3 contact attempts over 14 days with no response:
  - Update stage to **Unresponsive**
  - Archive profile (can reactivate later)
  - System auto-unsubscribes from email sequences

---

## 6. Alternative Flows

### Alt-1: Consultant Already in System (Duplicate Detected)

**Trigger:** System detects duplicate email or phone during Step 4

**Flow:**
1. System displays warning:
   ```
   ⚠️ Potential Duplicate Detected

   A consultant with similar information already exists:

   Name: [Existing Name]
   Email: [Existing Email]
   Phone: [Existing Phone]
   Owner: [Owner Name]
   Status: [Current Stage]
   Last Contact: [Date]

   [View Existing Profile]  [Create Anyway]  [Merge Profiles]
   ```

2. User reviews existing profile
3. **Options:**
   - **View Existing Profile:** Opens existing record (use this one)
   - **Create Anyway:** If legitimately different person (rare)
   - **Merge Profiles:** Combine data from both (requires manager approval)

4. If viewing existing:
   - Check current owner
   - If unowned or inactive >90 days → reassign to self
   - If owned by another recruiter → contact owner before proceeding
   - Update profile with new information
   - Log new sourcing attempt

### Alt-2: Visa Sponsorship Required (Complex Case)

**Trigger:** Consultant needs H1B sponsorship, Green Card sponsorship, or has expired work authorization

**Flow:**
1. During qualification call, consultant reveals sponsorship need
2. Recruiter logs this in **Immigration Notes** field
3. System triggers alert to HR Manager and Immigration Attorney
4. Options:
   - **Future Sponsorship:** Add to pipeline for H1B cap season (April filing)
   - **Current Sponsorship:** Evaluate business case (high-value skills, client commitment)
   - **Reject:** Not currently sponsoring (most common for bench sales)
5. If future sponsorship:
   - Update stage to **Sponsorship Pipeline**
   - Set reminder for H1B cap season (March)
   - Keep consultant warm with periodic updates

### Alt-3: Consultant Currently Employed (Passive Candidate)

**Trigger:** Consultant is employed but open to better opportunities

**Flow:**
1. During qualification, consultant reveals current employment
2. Questions to ask:
   - "What would make you consider leaving your current role?"
   - "What's your ideal timeline for a transition?"
   - "Are you interviewing actively or just exploring?"
3. Update **Availability** to reflect realistic timeline (e.g., "1 month notice")
4. Add to **Passive Pipeline** stage
5. Nurture sequence:
   - Monthly check-in emails with market updates
   - Share relevant job opportunities
   - Invite to industry events/webinars
6. When consultant signals readiness → move to **Qualified** stage

### Alt-4: Vendor Exclusive Consultant (Conflict)

**Trigger:** Consultant is already represented by a vendor partner with exclusivity clause

**Flow:**
1. During qualification, consultant mentions they're working with [Vendor Name]
2. Recruiter checks vendor agreement in system:
   - Navigate to **Vendors** → Search [Vendor Name]
   - Review **Exclusivity Terms**
3. **If Vendor has exclusivity:**
   - Explain to consultant: "It looks like [Vendor] is already representing you. We respect that relationship."
   - Update stage to **Vendor Exclusive**
   - Do NOT proceed with onboarding
   - Log vendor name in notes
4. **If No exclusivity (most common):**
   - Proceed with onboarding
   - Notify vendor as courtesy (optional, check agreement)
   - Ensure consultant understands dual representation

### Alt-5: High-Value Consultant (Rare Skills, High Rate)

**Trigger:** Consultant has rare skills (e.g., Mainframe, SAP FICO, Oracle DBA) or commands high rate (>$100/hr)

**Flow:**
1. During qualification, identify high-value attributes
2. Flag profile as **High Priority**
3. Notify Bench Sales Manager immediately (Slack, email)
4. Manager reviews profile within 24 hours
5. Expedited onboarding:
   - Skip standard approval gates
   - Assign to senior recruiter for immediate marketing
   - Add to priority hotlist
   - Direct outreach to top-tier clients
6. Track closely: weekly check-ins, VIP treatment

---

## 7. Exception Flows

### Exc-1: Consultant Provides False Information

**Trigger:** During background check or immigration verification, discover consultant lied about work authorization, experience, or education

**Flow:**
1. HR or Background Check vendor notifies recruiter
2. Recruiter escalates to Bench Sales Manager immediately
3. Manager reviews evidence
4. **Actions:**
   - Update profile stage to **Disqualified - Fraud**
   - Add to **Do Not Hire** list (permanent flag)
   - Notify all recruiters (company-wide alert)
   - If consultant already placed → immediate termination, notify client
5. Document all evidence in audit log
6. Legal review if consultant threatens action

### Exc-2: Immigration Attorney Rejects Visa Case

**Trigger:** Attorney reviews consultant's visa situation and determines they cannot legally work

**Flow:**
1. Attorney emails recruiter with determination
2. Recruiter updates stage to **Rejected - Immigration**
3. Send consultant email (reviewed by attorney):
   ```
   Subject: Work Authorization Status

   Hi [First Name],

   After reviewing your work authorization with our immigration attorney,
   we've determined we're unable to move forward at this time due to
   [specific legal reason - e.g., "expired EAD without pending renewal"].

   We recommend you [attorney's advice, e.g., "file for EAD renewal immediately
   and reach back out once approved"].

   Best,
   [Your Name]
   ```
4. Archive profile
5. Set reminder to follow up if consultant resolves issue (optional)

### Exc-3: Consultant Requests Unrealistic Rate

**Trigger:** Consultant demands rate far above market (e.g., $150/hr for mid-level Java developer)

**Flow:**
1. During qualification call, consultant states rate expectation
2. Recruiter provides market data:
   - "Based on current market rates for [Skill] with [Years] experience in [Location], we're seeing $[Range]."
   - "Your expectation of $[Rate] is [X]% above market. Are you flexible?"
3. **If Consultant is Flexible:**
   - Negotiate to market rate
   - Proceed with onboarding
4. **If Consultant is Inflexible:**
   - Update stage to **Rejected - Rate Too High**
   - Send polite rejection
   - Keep on file in case market shifts or consultant becomes flexible

### Exc-4: System Error During Save

**Trigger:** Technical issue prevents saving consultant profile

**Flow:**
1. System displays error message
2. User takes screenshot or copies error details
3. User attempts to save again
4. If error persists:
   - Save data locally (copy all form fields to text file)
   - Contact IT support via Slack #tech-support
   - Provide error details and screenshot
5. IT support resolves issue
6. User re-enters data once resolved
7. Verify data saved correctly

---

## 8. Postconditions

**Successful Completion:**
- New consultant profile created in system
- Profile assigned to recruiter
- Pipeline stage set appropriately (Sourced, Contacted, Qualified, Rejected)
- Initial contact logged (if applicable)
- Qualification notes documented
- Next steps scheduled (onboarding, follow-up, or rejection)

**Failed/Rejected:**
- Consultant marked as Rejected with reason
- Rejection email sent (optional)
- Profile archived
- No further action required unless consultant re-engages

---

## 9. Business Rules

### BR-1: Duplicate Prevention
- System MUST check for duplicates on:
  - Email address (exact match)
  - Phone number (normalized, e.g., +1-555-123-4567 = 555-123-4567)
  - LinkedIn URL (exact match)
- If potential duplicate found → display warning (see Alt-1)

### BR-2: Work Authorization Validation
- Consultant CANNOT be marked as **Qualified** without valid work authorization
- Valid work authorization = one of:
  - USC, GC (permanent)
  - Visa with >180 days validity
  - Visa with pending renewal (EAD, H1B transfer, etc.)
- System MUST display warning if visa expires within 180 days

### BR-3: Required Fields for Qualification
To move consultant to **Qualified** stage, the following fields are REQUIRED:
- ✅ First Name, Last Name
- ✅ Email, Phone
- ✅ Work Authorization + Expiry Date (if applicable)
- ✅ Primary Skills (minimum 3)
- ✅ Years of Experience
- ✅ Current Availability
- ✅ Desired Rate
- ✅ Preferred Contract Type
- ✅ Resume uploaded
- ✅ Qualification call completed (logged as activity)

System MUST block stage change if any required field missing.

### BR-4: Rate Reasonableness Check
- If consultant's desired rate is >30% above market average for their skills/experience:
  - System displays warning: "⚠️ Desired rate is significantly above market average ($[Market Rate]). Proceed with caution."
- Recruiter must acknowledge warning to proceed

### BR-5: Immigration Alert Thresholds
- Visa expiry <180 days → 🟡 Yellow alert (display on profile)
- Visa expiry <90 days → 🟠 Orange alert (notify HR)
- Visa expiry <30 days → 🔴 Red alert (escalate to Legal)
- Visa expired → ⚫ Black alert (cannot submit, block actions)

### BR-6: Follow-Up Attempt Limits
- Maximum **3 contact attempts** over **14 days**
- After 3rd attempt with no response → auto-update stage to **Unresponsive**
- User can manually override if special circumstances

### BR-7: High-Priority Flagging (Automatic)
System MUST auto-flag consultant as **High Priority** if:
- Desired rate >$100/hr, OR
- Skills include rare technologies (Mainframe, SAP, Salesforce, Oracle DBA), OR
- 10+ years experience, OR
- Referral from executive or top-performing recruiter

High-priority consultants trigger instant notification to Bench Sales Manager.

---

## 10. Screen Specifications

### Screen: SCR-BENCH-011-01 - Consultant Sourcing Dashboard

**Route:** `/employee/workspace/bench/consultants/source`
**Access:** Bench Sales Recruiter, Bench Sales Manager, Admin
**Layout:** Dashboard with quick-add widget

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────────┐
│ Bench Dashboard > Source Consultants                        [Help] [?] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ 📊 SOURCING PIPELINE (Last 30 Days)                              │   │
│ │                                                                  │   │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│ │  │ Sourced  │  │Contacted │  │ Qualified│  │ Rejected │        │   │
│ │  │    42    │  │    28    │  │    12    │  │    18    │        │   │
│ │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│ │                                                                  │   │
│ │  Conversion Rate: 28.6% (Qualified / Total)                     │   │
│ │  Avg Time to Qualify: 5.2 days                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ ⚡ QUICK ADD CONSULTANT                          [Expand Form]   │   │
│ ├──────────────────────────────────────────────────────────────────┤   │
│ │                                                                  │   │
│ │  First Name *          Last Name *                              │   │
│ │  ┌──────────────────┐  ┌──────────────────┐                     │   │
│ │  │                  │  │                  │                     │   │
│ │  └──────────────────┘  └──────────────────┘                     │   │
│ │                                                                  │   │
│ │  Email *               Phone *                                  │   │
│ │  ┌──────────────────┐  ┌──────────────────┐                     │   │
│ │  │                  │  │                  │                     │   │
│ │  └──────────────────┘  └──────────────────┘                     │   │
│ │                                                                  │   │
│ │  Primary Skills *      Work Authorization *                     │   │
│ │  ┌──────────────────┐  ┌──────────────────┐                     │   │
│ │  │ [Tags: Java...  ]│  │ [Select      ▼] │                     │   │
│ │  └──────────────────┘  └──────────────────┘                     │   │
│ │                                                                  │   │
│ │  Source Type *         LinkedIn/Resume URL                      │   │
│ │  ┌──────────────────┐  ┌──────────────────┐                     │   │
│ │  │ [LinkedIn    ▼] │  │                  │                     │   │
│ │  └──────────────────┘  └──────────────────┘                     │   │
│ │                                                                  │   │
│ │  ☐ Send welcome email    ☐ Schedule qualification call         │   │
│ │                                                                  │   │
│ │  [Cancel]                      [Save Draft]  [Save & Contact]   │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ 📋 RECENT SOURCING ACTIVITY                         [View All]   │   │
│ ├──────────────────────────────────────────────────────────────────┤   │
│ │                                                                  │   │
│ │  👤 Jane Doe (Java/AWS) - Contacted - 2 hours ago              │   │
│ │     LinkedIn | H1B Valid | $75/hr | [View] [Contact]           │   │
│ │                                                                  │   │
│ │  👤 John Smith (Python/ML) - Qualified - 1 day ago             │   │
│ │     Referral | USC | $85/hr | [View] [Start Onboarding]        │   │
│ │                                                                  │   │
│ │  👤 Maria Garcia (.NET/Azure) - Needs Follow-Up - 3 days ago   │   │
│ │     Indeed | OPT-STEM | $70/hr | [View] [Follow Up]            │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ 🎯 SOURCING CHANNELS (Click to Launch)                           │   │
│ ├──────────────────────────────────────────────────────────────────┤   │
│ │  [LinkedIn Sales Nav] [Dice.com] [Indeed] [Monster] [Vendor]   │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

#### Components Used
- CMP-KPICard (Sourcing Pipeline metrics)
- CMP-QuickAddForm (Consultant quick-add widget)
- CMP-ActivityFeed (Recent sourcing activity)
- CMP-ExternalLinks (Sourcing channel launchers)

---

### Screen: SCR-BENCH-011-02 - Full Consultant Profile Form

**Route:** `/employee/workspace/bench/consultants/new`
**Access:** Bench Sales Recruiter, Bench Sales Manager, Admin
**Layout:** Multi-step form wizard

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────────┐
│ Add New Consultant                                              [X]     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ [Step Indicator: ● Basic Info  ○ Work Auth  ○ Skills  ○ Source]         │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ STEP 1: Basic Information                                        │   │
│ │                                                                  │   │
│ │ First Name *                         Last Name *                │   │
│ │ ┌─────────────────────────────────┐ ┌────────────────────────┐  │   │
│ │ │                                 │ │                        │  │   │
│ │ └─────────────────────────────────┘ └────────────────────────┘  │   │
│ │                                                                  │   │
│ │ Email *                              Phone *                    │   │
│ │ ┌─────────────────────────────────┐ ┌────────────────────────┐  │   │
│ │ │ consultant@example.com          │ │ +1 (555) 123-4567      │  │   │
│ │ └─────────────────────────────────┘ └────────────────────────┘  │   │
│ │ ℹ️ We'll check for duplicates when you proceed                 │   │
│ │                                                                  │   │
│ │ LinkedIn Profile URL                                            │   │
│ │ ┌──────────────────────────────────────────────────────────────┐│   │
│ │ │ https://linkedin.com/in/                                     ││   │
│ │ └──────────────────────────────────────────────────────────────┘│   │
│ │                                                                  │   │
│ │ Current Location *                                              │   │
│ │ ┌──────────────────────────────────────────────────────────────┐│   │
│ │ │ [City, State/Province                                    ▼] ││   │
│ │ └──────────────────────────────────────────────────────────────┘│   │
│ │                                                                  │   │
│ │ Willing to Relocate?                                            │   │
│ │ ○ Yes   ○ No   ○ Maybe (depends on opportunity)                │   │
│ │                                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ [< Back]                                       [Cancel]  [Next: Work Auth >]│
└────────────────────────────────────────────────────────────────────────┘
```

*(Steps 2-4 would follow similar layout for Work Authorization, Skills, and Source details)*

---

## 11. Field Specifications

| Field | Type | Required | Validation | Default | Display | Notes |
|-------|------|----------|------------|---------|---------|-------|
| firstName | string | Yes | min:1, max:50 | - | Text input | Legal first name |
| lastName | string | Yes | min:1, max:50 | - | Text input | Legal last name |
| email | email | Yes | valid email, unique | - | Email input | Primary contact |
| phone | phone | Yes | valid US/CA phone | - | Phone input (masked) | Primary contact |
| linkedInUrl | url | No | linkedin.com domain | - | URL input | Profile URL |
| currentLocation | string | Yes | city/state or city/province | - | Location autocomplete | Where consultant lives now |
| willingToRelocate | enum | No | yes, no, maybe | maybe | Radio buttons | Relocation flexibility |
| workAuthorization | enum | Yes | See visa types list | - | Dropdown (searchable) | Current work status |
| visaType | enum | Conditional | Based on workAuth | - | Dropdown | Specific visa category |
| visaExpiryDate | date | Conditional | Future date, >today | - | Date picker | When authorization expires |
| primarySkills | multi-enum | Yes | min:3 tags | - | Tag input (autocomplete) | Core technical skills |
| yearsOfExperience | number | Yes | min:0, max:50 | - | Number input | Total years professional |
| currentAvailability | enum | Yes | immediate, 2_weeks, 1_month, not_available | - | Dropdown | When can start |
| desiredRate | currency | Yes | min:10, max:500 | - | Currency input (USD/CAD) | Expected hourly pay |
| preferredContractType | multi-enum | Yes | C2C, W2, 1099 | - | Checkboxes | Can select multiple |
| sourceType | enum | Yes | linkedin, job_board, referral_vendor, referral_employee, inbound, networking, other | - | Dropdown | Where found |
| sourceDetails | text | No | max:500 | - | Textarea | LinkedIn URL, referral name, etc. |
| initialNotes | text | No | max:2000 | - | Textarea | First impression, red flags |
| pipelineStage | enum | Yes | sourced, contacted, responded, qualified, rejected, unresponsive | sourced | Auto-set by system | Current stage |
| resumeFile | file | No | PDF, DOC, DOCX; max 5MB | - | File upload | Resume document |

---

## 12. Integration Points

### 12.1 LinkedIn Integration
- **API:** LinkedIn Sales Navigator API (if available) or manual export
- **Data Flow:** Inbound (import profile data)
- **Trigger:** User clicks "Import from LinkedIn" button
- **Mapping:**
  - LinkedIn Full Name → firstName, lastName
  - LinkedIn Email → email
  - LinkedIn Phone → phone
  - LinkedIn Headline → primarySkills (parsed)
  - LinkedIn Summary → initialNotes
  - LinkedIn Profile URL → linkedInUrl

### 12.2 Resume Parser
- **Service:** Internal resume parser (OpenAI GPT-4 based)
- **Input:** PDF, DOC, DOCX file
- **Output:** Structured JSON with extracted fields
- **Fields Extracted:**
  - Contact information (name, email, phone)
  - Skills (technology tags)
  - Work history (employers, dates, titles)
  - Education (degrees, schools)
  - Certifications
- **Validation:** User reviews and confirms parsed data before saving

### 12.3 Duplicate Detection
- **Service:** Internal deduplication service
- **Trigger:** On save (before commit)
- **Logic:**
  - Exact match on email OR phone → Hard duplicate (block)
  - Fuzzy match on name + similar email domain → Soft duplicate (warn)
- **Action:** Display warning modal (see Alt-1)

### 12.4 Immigration Database
- **Service:** Internal immigration tracking system
- **Trigger:** When workAuthorization or visaExpiryDate is set
- **Action:**
  - Create immigration case if visa type requires monitoring
  - Set alert thresholds based on expiry date
  - Notify HR if <90 days to expiry

---

## 13. RACI Assignments

| Action | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|--------|-----------------|-----------------|---------------|--------------|
| Source Consultant | Bench Sales Recruiter | Bench Sales Recruiter | - | Bench Manager (if high-value) |
| Create Profile | Bench Sales Recruiter | Bench Sales Recruiter | - | - |
| Qualification Call | Bench Sales Recruiter | Bench Sales Recruiter | Immigration Attorney (if complex visa) | Bench Manager |
| Approve High-Value Consultant | Bench Manager | Bench Manager | - | COO |
| Immigration Review | HR Compliance | Immigration Attorney | Bench Sales Recruiter | Bench Manager |
| Move to Qualified Stage | Bench Sales Recruiter | Bench Manager (approval if needed) | - | - |
| Reject Consultant | Bench Sales Recruiter | Bench Sales Recruiter | - | - |

---

## 14. Metrics & Analytics

### 14.1 Sourcing Metrics (Per Recruiter)

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| New Consultants Sourced | 20/month | Count of new profiles created | Daily |
| Contacts Made | 50/month | LinkedIn InMails + Emails + Calls | Daily |
| Response Rate | >25% | Responses / Contacts | Weekly |
| Qualification Rate | >30% | Qualified / Total Sourced | Weekly |
| Time to Qualify | <7 days | Avg days from Sourced → Qualified | Weekly |
| Source Channel Effectiveness | Varies | Qualified by source (LinkedIn vs Dice vs Referral) | Monthly |

### 14.2 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Profile Completeness | >90% | % of required fields filled |
| Resume Upload Rate | >80% | Profiles with resume attached |
| Duplicate Rate | <5% | Duplicates flagged / Total sourced |
| Rejection Rate | <40% | Rejected / Total sourced |

---

## 15. Test Cases

### TC-BENCH-011-001: Successful Consultant Sourcing (Happy Path)

**Priority:** Critical
**Type:** E2E
**Automated:** Yes

**Preconditions:**
- User logged in as Bench Sales Recruiter
- No existing consultant with email "newconsultant@example.com"

**Test Data:**
| Variable | Value |
|----------|-------|
| firstName | Jane |
| lastName | Consultant |
| email | newconsultant@example.com |
| phone | +1-555-987-6543 |
| workAuth | H1B |
| visaExpiry | 2026-12-31 (>180 days) |
| skills | Java, Spring Boot, AWS |
| rate | $75 |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to /bench/consultants/source | Sourcing dashboard displayed |
| 2 | Click [+ New Consultant] | Full form opens |
| 3 | Fill all required fields (per Test Data) | No validation errors |
| 4 | Upload sample resume (Java_Developer.pdf) | Resume parsed, skills extracted |
| 5 | Review parsed data, confirm | Data accepted |
| 6 | Set stage to "Contacted" | Dropdown updated |
| 7 | Click [Save & Contact] | Profile saved, welcome email triggered |
| 8 | Verify consultant appears in Recent Activity | Consultant listed with "Contacted" badge |
| 9 | Navigate to consultant detail page | Full profile displayed with all data |

**Postconditions:**
- Consultant profile exists in database
- Welcome email sent to consultant
- Activity logged: "Profile created"
- No duplicate warnings

---

### TC-BENCH-011-002: Duplicate Detection

**Priority:** High
**Type:** Functional
**Automated:** Yes

**Preconditions:**
- Existing consultant in system:
  - Name: John Smith
  - Email: jsmith@example.com
  - Phone: +1-555-111-2222

**Test Data:**
| Variable | Value |
|----------|-------|
| firstName | John |
| lastName | Smith |
| email | jsmith@example.com |
| phone | +1-555-333-4444 (different) |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to /bench/consultants/new | Form opens |
| 2 | Fill fields (per Test Data) | Form populated |
| 3 | Click [Save] | Duplicate warning modal appears |
| 4 | Verify warning shows existing profile details | Correct existing profile displayed |
| 5 | Click [View Existing Profile] | Redirected to existing consultant |
| 6 | Verify no new profile created | Consultant count unchanged |

---

### TC-BENCH-011-003: Visa Expiry Warning

**Priority:** Critical
**Type:** Functional
**Automated:** Yes

**Test Data:**
| Variable | Value |
|----------|-------|
| workAuth | H1B |
| visaExpiry | 2025-12-15 (45 days from today, assume today is 2025-11-01) |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Create new consultant with above visa data | Form filled |
| 2 | Click [Save] | 🟠 Orange alert displayed: "Visa expires in 45 days (<90 threshold)" |
| 3 | Proceed with save | Profile saved with alert flag |
| 4 | Verify HR notification sent | Email to hr@intime.com with visa alert |
| 5 | View consultant profile | Orange alert badge visible on profile |

---

## 16. Accessibility

- **WCAG 2.1 AA Compliance:**
  - All form fields have visible labels
  - Placeholder text is supplementary, not sole indicator
  - Color is not sole indicator (alerts use icons + text)
  - Keyboard navigation: Tab through all fields, Enter to submit
  - Screen reader support: ARIA labels on all interactive elements
  - Error messages: Clear, specific, programmatically associated with fields

- **Keyboard Shortcuts:**
  - `Alt + N` → Open New Consultant form
  - `Alt + S` → Save form
  - `Alt + C` → Cancel/Close form
  - `Escape` → Close modal

---

## 17. Mobile Considerations

- **Responsive Design:**
  - Form fields stack vertically on mobile (<640px width)
  - Quick Add widget collapses to simplified 3-field form on mobile
  - Full form accessible but recommended on desktop for file upload
  - Phone contact method prioritized on mobile (click-to-call enabled)

---

## 18. Security

### Data Protection
- **PII Handling:**
  - Email, Phone, SSN (if collected) encrypted at rest
  - Resume files stored in encrypted S3 bucket
  - Access logged in audit trail

### Audit Requirements
- **Logged Events:**
  - Profile created (by whom, when)
  - Profile updated (field-level change tracking)
  - Stage transitions (from → to, reason)
  - Contact attempts (channel, timestamp)
  - Resume uploads (filename, size, timestamp)
  - Duplicate warnings (dismissed or merged)

### Permissions
- Bench Sales Recruiter: Create, Read, Update own sourced consultants
- Bench Sales Manager: Full access to team consultants
- HR: Read access to immigration-related fields
- Admin: Full access

---

## 19. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | InTime v3 Product Team | Initial document creation |
