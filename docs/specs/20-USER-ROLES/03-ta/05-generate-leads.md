# UC-TA-005: Generate Leads

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** TA Specialist
**Status:** Approved

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-TA-005 |
| Actor | TA Specialist |
| Goal | Generate qualified leads for training programs, staffing needs, and partnerships |
| Frequency | Daily |
| Estimated Time | 2-4 hours per day |
| Priority | High |

---

## Actors

- **Primary:** TA Specialist
- **Secondary:** TA Manager (for coaching), Marketing Team (for campaigns)
- **System:** LinkedIn Sales Navigator, ZoomInfo, CRM, Email tracking

---

## Preconditions

1. User is logged in as TA Specialist
2. User has "lead.create" permission
3. LinkedIn Sales Navigator account active
4. Target account/contact lists defined
5. Email templates and campaigns ready

---

## Trigger

One of the following:
- Daily lead generation routine
- New market segment to penetrate
- Campaign launched (inbound lead flow)
- Referral received
- Event participation (networking)

---

## Main Flow: Outbound Lead Generation

### Step 1: Review Target List

**User Action:** Navigate to `/employee/workspace/leads`

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Leads                                  [+ New Lead] [Import]  │
├──────────────────────────────────────────────────────────────┤
│ My Leads │ Team Leads │ Unassigned │ All                      │
├──────────────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [Source ▼] [Industry ▼] [Date Range]    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 🎯 Daily Target: 15-20 new leads                             │
│ ├─ LinkedIn Prospecting: 10-12 leads                         │
│ ├─ Inbound Responses: 3-5 leads                             │
│ └─ Referrals: 2-3 leads                                      │
│                                                               │
│ Quick Actions:                                                │
│ [🔍 LinkedIn Search]  [📧 Email Outreach]  [📞 Call List]    │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 2 minutes

---

### Step 2: LinkedIn Prospecting

**User Action:** Click "LinkedIn Search" → Opens LinkedIn Sales Navigator

**Target Profile:**
```
Ideal Lead Profile (Training):
├─ Title: HR Manager, L&D Director, Training Manager
├─ Company Size: 50-500 employees
├─ Industry: Technology, Finance, Healthcare
├─ Geography: USA, Canada
└─ Keywords: "upskilling", "training budget", "tech talent"

Ideal Lead Profile (Staffing):
├─ Title: IT Director, CTO, Hiring Manager
├─ Company Size: 100-1000 employees
├─ Industry: Technology, Consulting, Finance
├─ Pain Points: "hiring challenges", "contractor needs"
└─ Recent Activity: Job postings, expansion news
```

**Search Strategy:**

**A. Boolean Search (LinkedIn):**
```
(title:"HR Manager" OR title:"L&D Director" OR title:"Training Manager")
AND (company_size:51-200 OR company_size:201-500)
AND location:"United States"
AND keywords:("upskilling" OR "training program" OR "tech talent")
```

**B. Company Targeting:**
```
Companies Recently Funded (Series A/B):
- More likely to have training budget
- Scaling hiring needs
- Open to new vendors

Companies With Job Postings:
- Active hiring = staffing needs
- Multiple tech roles = training opportunity
- Remote positions = open to consultants
```

**User Action:** Review profile, click "Save to CRM"

**System Response:**
- Chrome extension captures profile data
- Pre-fills lead form with:
  - Name, Title, Company
  - LinkedIn URL
  - Email (if available via hunter.io integration)
  - Phone (if available via ZoomInfo)

**Lead Capture Form:**
```
┌──────────────────────────────────────────────────────────────┐
│ Quick Add Lead                                          [×]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Contact Information (Auto-filled from LinkedIn)              │
│ Name: Sarah Johnson                                          │
│ Title: VP of Learning & Development                          │
│ Company: TechCorp Inc.                                       │
│ Email: sarah.johnson@techcorp.com (verified ✓)              │
│ Phone: (415) 555-1234                                        │
│ LinkedIn: linkedin.com/in/sarahjohnson                       │
│                                                               │
│ Lead Classification *                                        │
│ ○ Training Lead     ● Staffing Lead     ○ Partnership       │
│                                                               │
│ Source *                                                      │
│ [LinkedIn Prospecting                                    ▼]  │
│                                                               │
│ Lead Score (Auto-calculated): ⭐⭐⭐⭐ (85/100)              │
│ ├─ Job Function Match: ✓ (20 pts)                           │
│ ├─ Company Size: ✓ (15 pts)                                 │
│ ├─ Industry Fit: ✓ (15 pts)                                 │
│ ├─ Budget Signals: ✓ (20 pts - Recent funding)              │
│ └─ Engagement Likelihood: ✓ (15 pts - Active on LinkedIn)   │
│                                                               │
│ Initial Notes:                                                │
│ [TechCorp raised $10M Series A (Jan 2025). Posted 15 tech   │
│  roles last month. Sarah posts about upskilling. Good fit.] │
│                                                               │
│ Assign To: [Me (TA Specialist 1)                        ▼]  │
│                                                               │
│ [Cancel]          [Save & Add to Sequence]  [Save as Lead]  │
└──────────────────────────────────────────────────────────────┘
```

**Field Specifications:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `firstName` | String | Yes | min:1, max:50 | Auto-filled |
| `lastName` | String | Yes | min:1, max:50 | Auto-filled |
| `title` | String | Yes | max:200 | Job title |
| `company` | String | Yes | max:200 | Company name |
| `email` | Email | No | Valid email format | Verified if possible |
| `phone` | Phone | No | E.164 format | With country code |
| `linkedInUrl` | URL | No | LinkedIn domain | Profile URL |
| `leadType` | Enum | Yes | training, staffing, partnership | Classification |
| `source` | Enum | Yes | See source list | How lead found |
| `leadScore` | Number | Auto | 0-100 | System calculated |
| `notes` | Text | No | max:2000 | Context/research |
| `assignedTo` | User | Yes | Valid TA Specialist | Owner |

**Lead Sources (Dropdown Options):**
- LinkedIn Prospecting
- Inbound Website Form
- Referral (Employee)
- Referral (Client)
- Event/Conference
- Cold Email Response
- Cold Call
- LinkedIn Message Response
- Content Download
- Webinar Attendee
- Partner Introduction

**Time per lead:** 3-5 minutes

---

### Step 3: Enrich Lead Data

**User Action:** Click "Save as Lead"

**System Processing:**
1. **Email Verification** (~2 seconds)
   - Check email deliverability (hunter.io, NeverBounce)
   - Mark as verified/unverified/risky

2. **Company Enrichment** (~3 seconds)
   - Fetch from Clearbit/ZoomInfo:
     - Company size, revenue, funding
     - Tech stack (BuiltWith)
     - Recent news/updates

3. **Contact Enrichment** (~2 seconds)
   - Additional emails (work patterns)
   - Direct dial phone (if available)
   - Social profiles (Twitter, etc.)

4. **Lead Scoring** (~1 second)
   - Calculate score based on:
     - Job function fit (0-20 pts)
     - Company size (0-15 pts)
     - Industry match (0-15 pts)
     - Budget signals (0-20 pts)
     - Engagement likelihood (0-15 pts)
     - Geographic fit (0-10 pts)
     - Timing signals (0-5 pts)

**System Response:**
```
✓ Lead created: Sarah Johnson (TechCorp Inc.)
✓ Email verified: sarah.johnson@techcorp.com
✓ Company data enriched
✓ Lead score: 85/100 (High Priority)
✓ Auto-assigned to: Email Sequence "Tech Training Outreach v2"

Next Steps:
→ Day 1: LinkedIn connection request sent
→ Day 3: Email 1 scheduled (if connection accepted)
→ Day 7: Email 2 scheduled (if no response)
```

**Time:** 8-10 seconds

---

### Step 4: Add to Outreach Sequence

**Automated Sequence (Example: Training Lead):**

```
Day 1: LinkedIn Connection Request
┌──────────────────────────────────────────────────────────────┐
│ Hi Sarah,                                                     │
│                                                               │
│ I noticed TechCorp's recent growth and your focus on         │
│ upskilling. We help tech companies like yours build internal │
│ talent through custom training programs.                     │
│                                                               │
│ I'd love to connect and share some case studies.            │
│                                                               │
│ Best,                                                         │
│ [TA Specialist Name]                                         │
└──────────────────────────────────────────────────────────────┘

Day 3: Email 1 (If connection accepted, else Day 5)
Subject: Quick idea for TechCorp's tech hiring

Hi Sarah,

I saw TechCorp recently raised $10M and is scaling the team
(congrats!). Many Series A companies face the same challenge:
finding enough skilled developers fast enough.

We've helped companies like [Client 1] and [Client 2] by:
→ Training junior developers in 12 weeks
→ 78% placement rate into full-time roles
→ 40% lower cost than external hires

Would you be open to a quick 15-minute call to explore if
this could help TechCorp's hiring goals?

[Calendar Link]

Best,
[Name]

Day 7: Email 2 (If no response to Email 1)
Subject: Re: Quick idea for TechCorp's tech hiring

Hi Sarah,

Following up on my email last week. I know you're busy, so
I'll keep this brief.

If training internal talent isn't a priority right now, no
worries. But if you're curious, here's a 2-minute video of
how we helped [Similar Company]:

[Video Link]

Happy to chat if it's relevant.

Best,
[Name]

Day 14: LinkedIn Message (If no email response)
Hi Sarah - quick follow-up on the training idea I sent over
email. Worth a conversation? If not, no worries, I'll stop
bothering you :)

Day 21: Breakup Email
Subject: Closing the loop

Hi Sarah,

I haven't heard back, so I'm guessing this isn't the right
time for TechCorp. I'll stop reaching out.

If things change and you'd like to explore training programs
in the future, feel free to reach out anytime.

Best of luck scaling the team!

[Name]

[Unsubscribe Link]
```

**Sequence Exit Criteria:**
- Responded (move to qualified stage)
- Bounced email (mark as invalid)
- Unsubscribed (remove from sequence)
- Out of office >14 days (pause sequence)
- Completed all touches (move to nurture)

**Time:** Automated (0 manual time after setup)

---

## Alternative Flow A: Inbound Lead Capture

### A1: Website Form Submission

**Trigger:** Lead submits form on InTime website

**Form Fields:**
```
Contact Us / Request Info Form:
├─ Name *
├─ Email *
├─ Phone
├─ Company *
├─ Job Title
├─ How can we help? (dropdown)
│   ├─ Corporate Training Programs
│   ├─ Staffing/Contractors
│   ├─ Partnership Opportunities
│   └─ Other
├─ Message
└─ [Submit]
```

**System Processing:**
1. Form submission triggers webhook
2. Lead auto-created in CRM
3. Email notification to TA Specialist on duty (round-robin)
4. Auto-response email sent to lead:
   ```
   Subject: Thanks for reaching out to InTime!

   Hi [Name],

   Thanks for your interest in InTime. I've received your
   inquiry about [Topic] and will reach out within 24 hours.

   In the meantime, here are some resources:
   → [Case Studies]
   → [Training Program Overview]

   Talk soon!
   [TA Specialist Name]
   ```

5. Lead assigned to TA Specialist
6. Task created: "Follow up with [Name] from [Company]" (Due: 24 hours)

**TA Specialist Action:**
- Review lead details
- Call within 4 hours (best practice)
- If no answer: Email + LinkedIn outreach
- Log activity and next steps

**SLA:** Respond within 4 hours (business hours)

**Time:** 5-10 minutes to qualify

---

### A2: LinkedIn Message (Inbound)

**Trigger:** Prospect sends message via LinkedIn

**Example Inbound Message:**
```
"Hi, I saw your profile and am interested in training
programs for our developers. Can you share more info?"
```

**TA Specialist Response (within 2 hours):**
```
Hi [Name],

Great to hear from you! I'd be happy to share info on our
training programs. To make sure I send you the most relevant
info, can you tell me:

1. What skills/technologies you're looking to train?
2. How many people would be in the cohort?
3. Any timeline in mind?

Or if you prefer, we can jump on a quick 15-min call:
[Calendar Link]

Looking forward to helping!

[Your Name]
```

**User Action:** Click "Create Lead from Message"

**System Response:**
- Auto-fill lead form with LinkedIn data
- Attach LinkedIn conversation to lead record
- Mark source as "LinkedIn Inbound"
- Lead score: +10 points (inbound bonus)

**Time:** 2-3 minutes

---

## Alternative Flow B: Referral Lead

### B1: Employee Referral

**Trigger:** Employee submits referral via internal form

**Referral Form:**
```
┌──────────────────────────────────────────────────────────────┐
│ Refer a Lead - Earn $500 Bonus!                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Your Information:                                             │
│ Name: John Smith (auto-filled)                               │
│ Email: john.smith@intime.com                                 │
│                                                               │
│ Referral Contact:                                             │
│ Name: *                                                       │
│ Email: *                                                      │
│ Phone:                                                        │
│ Company: *                                                    │
│ Title:                                                        │
│                                                               │
│ Opportunity Type: *                                           │
│ ○ Corporate Training                                         │
│ ○ Staffing Needs                                             │
│ ○ Partnership                                                │
│                                                               │
│ Why is this a good fit?                                      │
│ [                                                          ]  │
│                                                               │
│ Have you already introduced them to InTime?                  │
│ ○ Yes    ○ No                                                │
│                                                               │
│ [Submit Referral]                                            │
│                                                               │
│ Referral Bonus Terms:                                        │
│ → $500 paid if lead converts to closed deal                 │
│ → Payment within 30 days of deal closure                    │
│ → Must be new client (not existing account)                 │
└──────────────────────────────────────────────────────────────┘
```

**System Processing:**
1. Create lead with source "Employee Referral"
2. Tag referring employee
3. Assign to TA Specialist (round-robin or by specialty)
4. Email TA Specialist with context
5. Lead score: +15 points (referral bonus)

**TA Specialist Action:**
1. Review referral notes
2. Reach out to referring employee for warm intro
3. Craft personalized outreach mentioning referrer:
   ```
   Subject: [Referrer Name] suggested we connect

   Hi [Lead Name],

   [Referrer Name] mentioned you might be interested in
   [training/staffing solutions] for [Company]. [He/She]
   thought InTime could be a good fit.

   [Brief value prop]

   Would you be open to a quick call this week?

   [Calendar Link]

   Best,
   [TA Specialist]
   ```

**Time:** 5-10 minutes (higher priority due to warm intro)

---

## Lead Qualification Criteria (BANT Framework)

After initial contact, qualify lead using BANT:

```
┌──────────────────────────────────────────────────────────────┐
│ BANT Qualification Checklist                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Budget                                                        │
│ □ Budget confirmed ($______ annually)                        │
│ □ Budget range identified ($10K-$50K, $50K-$100K, $100K+)   │
│ □ Budget authority identified (who approves?)                │
│ □ Fiscal year timing (Q1, Q2, Q3, Q4)                       │
│                                                               │
│ Authority                                                     │
│ □ Decision maker identified (name/title)                     │
│ □ Decision process understood (committee? CEO approval?)     │
│ □ Influencers identified (who else involved?)                │
│ □ Access to decision maker (can we get meeting?)             │
│                                                               │
│ Need                                                          │
│ □ Pain point articulated (what problem solving?)             │
│ □ Current solution (what using now?)                         │
│ □ Gaps identified (why current solution insufficient?)       │
│ □ Business impact quantified (cost of inaction)              │
│                                                               │
│ Timeline                                                      │
│ □ Target decision date (when decide?)                        │
│ □ Target start date (when implement?)                        │
│ □ Urgency level (1-5, 5 = immediate)                         │
│ □ Dependencies (what must happen first?)                     │
│                                                               │
│ Qualification Score: ___/100                                 │
│                                                               │
│ □ QUALIFIED (score ≥70) → Convert to Deal                    │
│ □ NURTURE (score 40-69) → Add to nurture campaign           │
│ □ DISQUALIFIED (score <40) → Archive with reason            │
│                                                               │
│ Next Steps:                                                   │
│ [                                                          ]  │
│                                                               │
│ [Save Qualification]                                         │
└──────────────────────────────────────────────────────────────┘
```

**Qualified Lead Definition:**
- Budget: Confirmed or strong signals (≥$15K opportunity)
- Authority: Access to decision maker or strong influencer
- Need: Clear pain point that InTime can solve
- Timeline: Decision within 6 months

**Next Step:** [Convert to Deal](./07-convert-lead-to-deal.md)

---

## Postconditions

1. ✅ Lead created in CRM
2. ✅ Lead enriched with company/contact data
3. ✅ Lead scored (0-100)
4. ✅ Lead assigned to TA Specialist
5. ✅ Lead added to outreach sequence (if applicable)
6. ✅ Activity logged (source, notes, next steps)
7. ✅ Notifications sent (if inbound/referral)

---

## Business Rules

1. **Lead Ownership:** First TA Specialist to create lead owns it (unless reassigned)
2. **Lead Deduplication:** System checks for existing leads by email/company before creating
3. **Response SLA:**
   - Inbound: 4 hours (business hours)
   - Outbound: No SLA, but best practice 1-2 days for first touch
4. **Lead Scoring:** Auto-calculated, can be manually overridden with justification
5. **Sequence Limits:** Max 1 sequence per lead at a time (to avoid spam)
6. **LinkedIn Limits:** 100 connection requests/week (LinkedIn policy)
7. **Email Limits:** 200 emails/day (deliverability best practice)

---

## Metrics & Analytics

### Daily Metrics
- Leads generated: Target 15-20/day
- Lead sources breakdown (pie chart)
- Average lead score: Target >70
- Email open rate: Target >35%
- LinkedIn acceptance rate: Target >40%

### Weekly Metrics
- Total leads: Target 75-100/week
- Qualified leads: Target 15-20/week
- Conversion to deals: Target 5-7/week
- Response rate by source: Compare channels
- Lead velocity: Time from create to qualified

### Monthly Metrics
- Lead-to-deal conversion: Target >25%
- Cost per lead: Target <$50
- Lead quality score: >75% rated 70+
- Outreach sequence performance: Open/click/reply rates

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create lead from LinkedIn | Lead auto-filled, enriched, scored |
| TC-002 | Duplicate email detected | Warning shown, option to merge |
| TC-003 | Inbound form submission | Lead created, TA notified within 5 min |
| TC-004 | Lead score <40 | Flagged as low priority, optional disqualify |
| TC-005 | LinkedIn sequence limit hit | Error message, prevent over-limit |
| TC-006 | Email bounce detected | Lead email marked invalid, removed from sequence |
| TC-007 | Referral submitted | Bonus tracker updated, referrer notified |
| TC-008 | Lead unsubscribes | Removed from all sequences, marked "do not contact" |

---

## Integration Points

### LinkedIn Sales Navigator
- **API:** LinkedIn Recruiter System Connect
- **Authentication:** OAuth 2.0
- **Data Flow:** Profile data → InTime CRM
- **Rate Limits:** 100 API calls/hour
- **Webhook:** Connection accepted → Update lead status

### Email Verification (Hunter.io)
- **API:** REST API
- **Authentication:** API Key
- **Data Flow:** Email → Verification status
- **Cost:** $0.01 per verification
- **Response Time:** <2 seconds

### Enrichment (Clearbit/ZoomInfo)
- **API:** REST API
- **Authentication:** API Key
- **Data Flow:** Company/Contact → Enriched data
- **Cost:** $1-$3 per enrichment
- **Caching:** 90 days (avoid re-enrichment)

---

*Last Updated: 2025-11-30*
