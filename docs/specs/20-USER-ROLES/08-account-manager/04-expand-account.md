# Use Case: Expand Client Account

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-AM-004 |
| Actor | Account Manager |
| Goal | Identify and close expansion opportunities within existing client accounts |
| Frequency | Ongoing (2-3 expansions per quarter per AM) |
| Estimated Time | 2-4 weeks from identification to close |
| Priority | High (drives NRR and revenue growth) |

---

## Preconditions

1. User is logged in as Account Manager
2. Client account exists and is in "Active" status
3. Account health score is at least "Yellow" (ideally "Green")
4. Existing relationship is established (account active for 3+ months)
5. User has access to expansion pipeline management tools

---

## Trigger

One of the following:
- Client mentions new department/location/initiative in conversation
- LinkedIn/news shows client company growth (new office, acquisition, funding)
- Existing hiring manager expresses satisfaction and hints at additional needs
- QBR reveals whitespace (departments/roles not yet served)
- Client requests additional services proactively
- Account Manager identifies opportunity during account review

---

## Main Flow (Click-by-Click)

### PHASE 1: OPPORTUNITY IDENTIFICATION (Week 1)

#### Step 1: Identify Expansion Opportunity

**Scenario:** During routine call with RetailCo's IT Director, he mentions:
"Our Marketing Department is also growing rapidly. They're hiring a ton of contractors, but they're using multiple vendors and it's a headache for procurement."

**User Action:** During or immediately after call, navigate to RetailCo account

**System Response:**
- Opens account detail page

**User Action:** Click "Expansion Pipeline" tab

**System Response:**
- Shows current expansion opportunities for this account

**Screen State:**
```
+------------------------------------------------------------------+
| RetailCo - Expansion Pipeline                                    |
+------------------------------------------------------------------+
| [Overview] [Jobs] [Contacts] [Activity] [Expansion] [Financials]|
+------------------------------------------------------------------+
|
| ACTIVE OPPORTUNITIES (0)                                        |
| No active expansion opportunities                               |
|                                                                  |
| CLOSED OPPORTUNITIES (1)                                        |
| • Additional IT roles (Won - Closed Jun 2024) - $45K            |
|                                                                  |
+------------------------------------------------------------------+
| [+ Create Expansion Opportunity]                                |
+------------------------------------------------------------------+
```

**User Action:** Click "[+ Create Expansion Opportunity]"

**System Response:**
- Opens expansion opportunity creation modal

**Screen State:**
```
+------------------------------------------------------------------+
| Create Expansion Opportunity - RetailCo                    [×]   |
+------------------------------------------------------------------+
|
| OPPORTUNITY DETAILS                                             |
|                                                                  |
| Opportunity Name *                                              |
| [Marketing Department Staffing                               ]  |
|                                                        0/100    |
|                                                                  |
| Type *                                                          |
| [● New Department] [○ New Location] [○ New Service Line]        |
| [○ Volume Increase] [○ Rate Increase] [○ Contract Extension]    |
|                                                                  |
| Target Departments/Areas                                        |
| [+ Add Department]                                              |
| • Marketing (Primary)                                           |
| • Digital Marketing                                             |
| • Creative Services                                             |
|                                                                  |
| Estimated Value *                                               |
| [$150,000    ] annually                                         |
|                                                                  |
| Probability of Close                                            |
| [40%                                                      ▼]    |
| Options: 10%, 25%, 40%, 60%, 75%, 90%                          |
|                                                                  |
| Expected Close Date                                             |
| [December 31, 2024                                      📅]     |
|                                                                  |
+------------------------------------------------------------------+
|
| SOURCE & CONTEXT                                                |
|                                                                  |
| How was this opportunity discovered?                            |
| [● Client Mention] [○ News/LinkedIn] [○ QBR Discussion]         |
| [○ Proactive Outreach] [○ Internal Referral]                    |
|                                                                  |
| Source Contact                                                  |
| [Tom Wilson - IT Director                               ▼]     |
|                                                                  |
| Discovery Notes                                                 |
| [                                                              ]|
| [Tom mentioned Marketing Dept is "hiring a ton of contractors  ]|
| [but using multiple vendors - headache for procurement."       ]|
| [Implied dissatisfaction with current vendor situation.        ]|
| [Opportunity: Consolidate Marketing staffing under InTime.     ]|
| [                                                              ]|
|                                                        0/1000   |
|                                                                  |
+------------------------------------------------------------------+
|
| STAKEHOLDERS                                                    |
|                                                                  |
| Champion (Internal Advocate)                                    |
| [Tom Wilson - IT Director                               ▼]     |
|                                                                  |
| Decision Maker                                                  |
| [TBD - Likely VP Marketing or Procurement               ▼]     |
|                                                                  |
| Influencers (Optional)                                          |
| [+ Add Influencer]                                              |
|                                                                  |
+------------------------------------------------------------------+
|                                        [Cancel]  [Create & Start]|
+------------------------------------------------------------------+
```

**Field Specification: Opportunity Name**
| Property | Value |
|----------|-------|
| Field Name | `opportunityName` |
| Type | Text Input |
| Label | "Opportunity Name" |
| Required | Yes |
| Max Length | 100 characters |
| Example | "Marketing Department Staffing", "Austin Office Expansion" |

**Field Specification: Estimated Value**
| Property | Value |
|----------|-------|
| Field Name | `estimatedValue` |
| Type | Currency Input |
| Label | "Estimated Value" |
| Prefix | "$" |
| Suffix | "annually" |
| Required | Yes |
| Min Value | 0 |
| Max Value | 9,999,999 |
| Validation | Must be positive number |

**Field Specification: Probability of Close**
| Property | Value |
|----------|-------|
| Field Name | `probability` |
| Type | Dropdown (Select) |
| Label | "Probability of Close" |
| Required | Yes |
| Default | 40% |
| Options | |
| - `10` | "10% - Identified (early stage, no validation)" |
| - `25` | "25% - Researching (gathering information)" |
| - `40` | "40% - Qualified (real need confirmed)" |
| - `60` | "60% - Proposal Sent (actively negotiating)" |
| - `75` | "75% - Verbal Agreement (near close)" |
| - `90` | "90% - Contract Sent (waiting signature)" |

**User Action:** Fill in all fields, click "Create & Start"

**System Response:**
- Expansion opportunity created
- Moved to "Identified" stage (first stage in pipeline)
- Toast notification: "Expansion opportunity created successfully"
- Redirects to opportunity detail page

**Time:** 5 minutes

---

#### Step 2: Research and Validate Opportunity

**System Response:**
- Opens expansion opportunity workspace

**Screen State:**
```
+------------------------------------------------------------------+
| RetailCo - Marketing Department Staffing                         |
+------------------------------------------------------------------+
| Opportunity ID: EXP-2024-0847          Status: Identified (10%) |
| Created: Nov 30, 2024                  Expected Close: Dec 31    |
| Estimated Value: $150,000 annually     Owner: You               |
+------------------------------------------------------------------+
|
| [Overview] [Research] [Stakeholders] [Proposal] [Activity]      |
|                                                                  |
+------------------------------------------------------------------+
|
| OPPORTUNITY SUMMARY                                             |
| Type: New Department Expansion                                  |
| Source: Client mention (Tom Wilson, IT Director)                |
| Target: Marketing, Digital Marketing, Creative Services         |
|                                                                  |
| KEY INSIGHT:                                                    |
| "Marketing Department using multiple vendors - procurement      |
| headache. Opportunity to consolidate under InTime."             |
|                                                                  |
+------------------------------------------------------------------+
|
| RESEARCH CHECKLIST                                              |
| ┌────────────────────────────────────────────────────────────┐ |
| │ ☐ Identify decision maker (VP Marketing or Procurement)    │ |
| │ ☐ Research Marketing team size and structure               │ |
| │ ☐ Estimate current contractor spend (LinkedIn, ZoomInfo)   │ |
| │ ☐ Identify pain points with current vendors                │ |
| │ ☐ Validate Tom Wilson as champion (will he advocate?)      │ |
| │ ☐ Understand budget cycle and approval process             │ |
| │ ☐ Map competitive landscape (who are current vendors?)     │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| NEXT ACTIONS                                                    |
| ┌────────────────────────────────────────────────────────────┐ |
| │ ☐ LinkedIn research on Marketing leadership team           │ |
| │   Assigned: You      Due: Dec 2                            │ |
| │   [Mark Complete]                                          │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ ☐ Ask Tom for intro to Marketing leadership                │ |
| │   Assigned: You      Due: Dec 3                            │ |
| │   [Mark Complete]                                          │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ ☐ Draft discovery questions for first meeting              │ |
| │   Assigned: You      Due: Dec 5                            │ |
| │   [Mark Complete]                                          │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
+------------------------------------------------------------------+
```

**User Action:** Click "Research" tab

**System Response:**
- Opens research workspace with tools

**Screen State (Research Tab):**
```
+------------------------------------------------------------------+
| Research: Marketing Department Expansion                         |
+------------------------------------------------------------------+
|
| COMPANY INTELLIGENCE                                            |
| [Fetch from LinkedIn] [Fetch from ZoomInfo] [Fetch from News]   |
|                                                                  |
| Company: RetailCo                                               |
| Marketing Team Size: ~45 employees (per LinkedIn)                |
| Recent News: "RetailCo expands e-commerce division" (Oct 2024)  |
| Budget Season: Fiscal year Jan-Dec (Q4 planning happening now)  |
|                                                                  |
+------------------------------------------------------------------+
|
| STAKEHOLDER MAPPING                                             |
|                                                                  |
| Decision Maker (Identified via LinkedIn):                       |
| • Jennifer Martinez - VP Marketing                              |
|   - LinkedIn: 500+ connections, active poster                   |
|   - Background: 8 years at RetailCo, promoted to VP in 2023     |
|   - Reports to: CMO (Chief Marketing Officer)                   |
|   - Budget Authority: Likely $5M+ (based on team size)          |
|                                                                  |
| Influencers:                                                    |
| • Mark Stevens - Director, Digital Marketing                    |
| • Sarah Lee - Director, Creative Services                       |
| • Tom Wilson - IT Director (our champion!)                      |
|                                                                  |
+------------------------------------------------------------------+
|
| COMPETITOR ANALYSIS                                             |
|                                                                  |
| Current Vendors (best guess):                                   |
| • Vendor A: Likely Creative Circle (common for creative roles)  |
| • Vendor B: Likely Robert Half (general staffing)               |
| • Vendor C: Unknown (possibly niche agency)                     |
|                                                                  |
| Pain Points (hypothesized):                                     |
| • Multiple vendor relationships = multiple invoices             |
| • Inconsistent quality across vendors                           |
| • No single point of accountability                             |
| • Difficult to track overall spend                              |
|                                                                  |
+------------------------------------------------------------------+
|
| VALUE PROPOSITION (Draft)                                       |
|                                                                  |
| Why InTime for Marketing Department?                            |
|                                                                  |
| 1. Consolidation: Single vendor for IT + Marketing = simplified |
|    procurement, one invoice, one relationship                   |
|                                                                  |
| 2. Proven Track Record: 18 months successful IT staffing,       |
|    $340K annually, 94% satisfaction (Tom Wilson as reference)   |
|                                                                  |
| 3. Specialized Expertise: Marketing/creative recruiters on staff|
|    (if true - need to verify with recruiting team)              |
|                                                                  |
| 4. Cost Savings: Volume discount potential (combined IT + Mktg) |
|                                                                  |
| 5. Speed: Leverage existing MSA, no lengthy contracting process |
|                                                                  |
+------------------------------------------------------------------+
|
| NOTES & INSIGHTS                                                |
| [                                                              ] |
| [Dec 1: LinkedIn research shows Jennifer Martinez focused on   ] |
| [digital transformation. Recent posts about "scaling digital   ] |
| [presence" - likely hiring need coming.                        ] |
| [                                                              ] |
| [Dec 2: Asked Tom for intro. He's supportive and will connect  ] |
| [me with Jennifer. Mentioned she's "frustrated with current    ] |
| [staffing situation - takes forever to fill roles."            ] |
| [                                                              ] |
|                                                                  |
+------------------------------------------------------------------+
```

**User Action:** Complete research tasks, take notes

**Time:** 2-3 hours over 2-3 days

---

### PHASE 2: QUALIFICATION & DISCOVERY (Week 2)

#### Step 3: Get Introduction to Decision Maker

**User Action:** Send email to Tom Wilson (champion) requesting introduction

**Email Sent:**
```
To: Tom Wilson <twilson@retailco.com>
Subject: Intro Request - Marketing Department Staffing

Hi Tom,

Thanks again for mentioning the Marketing team's staffing challenges in
our call last week. After thinking about it, I believe InTime could help
consolidate their contractor relationships and simplify the process.

Would you be comfortable introducing me to Jennifer Martinez (VP
Marketing)? I'd love to learn more about their needs and see if there's
a fit.

I'm happy to draft an intro email for you to forward, or we can do a
quick 3-way call if that's easier.

Let me know what works best!

Thanks,
[Name]
```

**Tom's Response (Next Day):**
```
From: Tom Wilson <twilson@retailco.com>
Subject: Re: Intro Request - Marketing Department Staffing

Hi [Name],

Happy to make the intro! Jennifer and I were just talking about this
yesterday. She's definitely interested.

I'll CC you both on an email intro. Take it from there!

Tom
```

**Introduction Email (from Tom):**
```
To: Jennifer Martinez <jmartinez@retailco.com>
CC: [Your email]
Subject: Intro: [Name] (InTime) + Jennifer (RetailCo Marketing)

Jennifer,

I'd like to introduce you to [Name] from InTime. They've been our IT
staffing partner for 18 months and have been fantastic - fast, quality
candidates, easy to work with.

I mentioned to [Name] that your team is hiring a lot of contractors and
managing multiple vendor relationships. Given our success with InTime on
the IT side, I thought it might be worth a conversation about whether
they could help consolidate things on the Marketing side.

[Name], Jennifer leads our Marketing organization and is driving a lot
of our digital transformation initiatives. She's a great partner to work
with.

I'll let you two take it from here!

Tom
```

**User Action:** Log Tom's introduction email as activity in InTime

**User Action:** Reply to Jennifer within 2 hours

**Reply Email:**
```
To: Jennifer Martinez <jmartinez@retailco.com>
CC: Tom Wilson <twilson@retailco.com>
Subject: Re: Intro: [Name] (InTime) + Jennifer (RetailCo Marketing)

Hi Jennifer,

Thank you, Tom, for the kind introduction!

Jennifer, it's great to meet you (virtually!). Tom mentioned you're
driving some exciting digital transformation initiatives and that your
team is scaling up with contractors.

I'd love to learn more about your hiring needs and challenges. If you
have 20-30 minutes this week or next, I'd appreciate the opportunity to
understand your situation better. No pressure - just a discovery
conversation to see if there's a potential fit.

Are you available for a quick call? I'm flexible on timing.

Looking forward to connecting!

Best regards,
[Name]
Account Manager, InTime
[Phone] | [Email] | [Calendar Link]
```

**Jennifer's Response:**
```
From: Jennifer Martinez <jmartinez@retailco.com>
Subject: Re: Intro: [Name] (InTime) + Jennifer (RetailCo Marketing)

Hi [Name],

Thanks for reaching out! Yes, we're definitely scaling up and the
contractor management has become a bit of a challenge.

I have time this Thursday, Dec 5 at 2:00 PM. Does that work for you?

Looking forward to it,
Jennifer
```

**User Action:** Accept meeting, log activity, update expansion opportunity

**User Action:** Navigate to expansion opportunity, update status to "Qualified" (25% probability)

**System Response:**
- Status updated
- Probability increased to 25%
- Next action: "Prepare for discovery call with Jennifer"

**Time:** 2-3 days (email back-and-forth)

---

#### Step 4: Conduct Discovery Call

**Date:** Thursday, Dec 5, 2:00 PM

**Pre-Call Prep:**

**User Action:** Navigate to expansion opportunity, click "Prepare for Meeting"

**System Response:**
- Opens discovery call prep guide

**Screen State (Discovery Call Prep):**
```
+------------------------------------------------------------------+
| Discovery Call Prep: Jennifer Martinez (VP Marketing)            |
+------------------------------------------------------------------+
| Account: RetailCo                                                |
| Opportunity: Marketing Department Expansion                      |
| Call Date: Dec 5, 2:00 PM                                       |
+------------------------------------------------------------------+
|
| CALL OBJECTIVES                                                 |
| 1. Build rapport and credibility                                |
| 2. Understand Marketing team's staffing needs and challenges    |
| 3. Identify pain points with current vendor situation           |
| 4. Assess budget and decision-making process                    |
| 5. Determine if there's a fit (qualify/disqualify opportunity)  |
|                                                                  |
+------------------------------------------------------------------+
|
| DISCOVERY QUESTIONS (SPIN Selling Framework)                    |
|                                                                  |
| SITUATION Questions:                                            |
| • How large is your Marketing team? (Confirm ~45 people)        |
| • How many contractors do you typically have at any given time? |
| • What roles do you hire contractors for most frequently?       |
| • How many staffing vendors are you currently working with?     |
|                                                                  |
| PROBLEM Questions:                                              |
| • Tom mentioned managing multiple vendors has been challenging. |
|   Can you tell me more about that?                              |
| • What's the biggest pain point in your current staffing process?|
| • How long does it typically take to fill a contractor role?    |
| • Have you experienced quality issues with contractors?         |
|                                                                  |
| IMPLICATION Questions:                                          |
| • How does the slow hiring process impact your team's projects? |
| • What's the cost of managing 3+ vendor relationships (admin    |
|   overhead, invoicing, quality variability)?                    |
| • If you could wave a magic wand, what would your ideal         |
|   staffing process look like?                                   |
|                                                                  |
| NEED-PAYOFF Questions:                                          |
| • If you had a single trusted vendor for all contractor needs,  |
|   what would that enable for your team?                         |
| • How valuable would it be to reduce time-to-fill from X to Y?  |
| • Would consolidating vendors free up your team's time for      |
|   strategic work instead of admin?                              |
|                                                                  |
+------------------------------------------------------------------+
|
| CREDIBILITY BUILDERS                                            |
| • Tom Wilson's endorsement (18 months partnership, 94% NPS)     |
| • IT staffing track record: $340K annually, 23 active jobs      |
| • Fast time-to-fill: 12-day average (industry avg: 18-20 days) |
| • Quality: 96% first-year retention rate                        |
|                                                                  |
+------------------------------------------------------------------+
|
| RED FLAGS (Disqualify if...)                                    |
| ⚠️ No real pain point (just kicking tires)                      |
| ⚠️ Budget freeze or cuts (not hiring in near future)            |
| ⚠️ Happy with current vendors (no switching intent)             |
| ⚠️ No decision-making authority (can't move forward)            |
|                                                                  |
+------------------------------------------------------------------+
|
| CALL NOTES (Fill during call)                                   |
| [                                                              ] |
| [                                                              ] |
| [                                                              ] |
|                                                                  |
+------------------------------------------------------------------+
```

**User Action:** Review prep guide, join Zoom call at 2:00 PM

**Call Flow (30-minute discovery call):**

**Minutes 0-5: Build Rapport**
```
AM: "Hi Jennifer! Thanks so much for making time today. How's your week
     going?"

[Small talk, relationship building]

AM: "Tom speaks very highly of you and the work you're doing in
     Marketing. Digital transformation is such an exciting challenge!"

[Establish credibility through Tom's referral]
```

**Minutes 5-15: Discovery Questions**
```
AM: "To make the best use of our time, I'd love to start by understanding
     your current situation. Can you give me a sense of your Marketing
     team structure and how you use contractors?"

[Jennifer responds: ~45 full-time employees, 10-15 contractors at any
 given time, roles include Graphic Designers, Digital Marketing
 Specialists, Content Writers, Social Media Managers]

AM: "That's helpful context. Tom mentioned you're working with multiple
     staffing vendors. How many are you juggling right now?"

[Jennifer: "At least 3, maybe 4. It's honestly hard to keep track."]

AM: "What's the biggest challenge with that setup?"

[Jennifer: "Invoicing is a nightmare. Different payment terms, different
 processes. And quality is hit-or-miss. Some vendors send great people,
 others... not so much. We've had contractors show up who don't even
 have the basic skills listed on their resume."]

AM: "That sounds frustrating. How much time would you say your team
     spends managing vendor relationships versus actually filling roles?"

[Jennifer: "Too much. I'd estimate 20-30% of my TA Director's time is
 just vendor management - approving invoices, resolving quality issues,
 onboarding new vendors."]
```

**Minutes 15-25: Implication & Need-Payoff**
```
AM: "If I'm hearing you correctly, the multi-vendor approach is costing
     you in three ways: time (admin overhead), quality (inconsistent
     candidates), and speed (delays in filling roles). Is that accurate?"

[Jennifer: "Exactly. And it's only getting worse as we scale."]

AM: "What would it mean for your team if you could consolidate to a
     single, trusted partner who delivers consistent quality and handles
     all the admin complexity?"

[Jennifer: "That would be huge. My TA Director could focus on strategic
 hiring instead of firefighting. We'd have one throat to choke if
 something goes wrong. And honestly, it would just be less stressful."]

AM: "I appreciate your candor. Based on what you've shared, I think
     there could be a strong fit here. We've been RetailCo's IT staffing
     partner for 18 months, and Tom's team has been very satisfied - 94%
     NPS, 12-day average time-to-fill. We're set up to handle creative
     and marketing roles just as effectively."
```

**Minutes 25-30: Next Steps**
```
AM: "Here's what I'd recommend as next steps:

     1. I'll put together a proposal that outlines how we'd approach
        Marketing staffing for RetailCo - including role types, estimated
        volumes, pricing, and timeline.

     2. I'd also love to include a few case studies from similar clients
        where we've consolidated multi-vendor relationships.

     3. If the proposal looks good, we can schedule a follow-up with
        your TA Director and Procurement to discuss implementation.

     Does that sound reasonable?"

[Jennifer: "Yes, that works. I'd need to see the proposal by mid-December
 to get it into our Q1 budget planning. We finalize budgets by Dec 20."]

AM: "Perfect. I'll have a draft to you by December 9th. That gives you
     time to review before your budget deadline."

[Jennifer: "Great. Looking forward to it."]

AM: "Thanks again, Jennifer. I'll follow up with the proposal next week."
```

**Post-Call Actions:**

**User Action:** Immediately log call in InTime

**Screen State (Call Log):**
```
+------------------------------------------------------------------+
| Log Call: Jennifer Martinez (VP Marketing)                  [×]  |
+------------------------------------------------------------------+
| Account: RetailCo                                                |
| Contact: Jennifer Martinez                                       |
| Opportunity: Marketing Department Expansion                      |
| Duration: 32 minutes                                             |
+------------------------------------------------------------------+
|
| CALL NOTES                                                      |
| [                                                              ] |
| [Fantastic discovery call. Jennifer confirmed major pain points:] |
| [                                                              ] |
| [SITUATION:                                                    ] |
| [• 10-15 contractors at any given time                         ] |
| [• Using 3-4 staffing vendors (losing track)                   ] |
| [• Roles: Graphic Designers, Digital Marketing, Content,       ] |
| [  Social Media                                                ] |
| [                                                              ] |
| [PAIN POINTS:                                                  ] |
| [• Invoicing nightmare (multiple payment terms/processes)      ] |
| [• Quality inconsistent (some contractors lack basic skills)   ] |
| [• Admin overhead (TA Director spends 20-30% time on vendor mgmt)]|
| [                                                              ] |
| [VALUE DRIVERS:                                                ] |
| [• Consolidation = less stress, single point of accountability ] |
| [• TA Director can focus on strategic hiring vs firefighting   ] |
| [                                                              ] |
| [BUDGET/TIMELINE:                                              ] |
| [• Proposal needed by Dec 9 (budget finalization Dec 20)       ] |
| [• Q1 2025 start target                                        ] |
| [                                                              ] |
| [NEXT STEPS:                                                   ] |
| [• Draft proposal by Dec 9                                     ] |
| [• Include case studies (multi-vendor consolidation)           ] |
| [• Follow-up meeting with TA Director + Procurement            ] |
| [                                                              ] |
|                                                                  |
| OUTCOME                                                         |
| ● Opportunity Qualified (strong fit)                            |
| ○ Disqualified (no fit)                                         |
|                                                                  |
| SENTIMENT: 😊 Very Positive                                     |
|                                                                  |
| TASKS CREATED                                                   |
| ┌────────────────────────────────────────────────────────────┐ |
| │ ☐ Draft Marketing expansion proposal                       │ |
| │   Due: Dec 9, 2024                                         │ |
| │   [Create Task]                                            │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ ☐ Research case studies (multi-vendor consolidation)       │ |
| │   Due: Dec 6, 2024                                         │ |
| │   [Create Task]                                            │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
+------------------------------------------------------------------+
|                                         [Cancel]  [Save & Update]|
+------------------------------------------------------------------+
```

**User Action:** Click "Save & Update"

**System Response:**
- Call logged in CRM
- Expansion opportunity updated:
  - Status: "Qualified" → "Proposal" (60% probability)
  - Estimated value: $150K → $180K (refined based on 12 contractors @ $15K each)
  - Expected close: Dec 31, 2024
- Tasks created automatically
- Toast: "Call logged and opportunity updated"

**Time:** 30 minutes (call) + 10 minutes (logging)

---

### PHASE 3: PROPOSAL & NEGOTIATION (Week 3)

#### Step 5: Build Proposal

**User Action:** Navigate to expansion opportunity, click "Proposal" tab

**System Response:**
- Opens proposal builder

**Screen State:**
```
+------------------------------------------------------------------+
| Proposal Builder: RetailCo Marketing Expansion                   |
+------------------------------------------------------------------+
| Opportunity Value: $180,000   Probability: 60%   Due: Dec 9     |
+------------------------------------------------------------------+
|
| PROPOSAL TEMPLATE                                               |
| [● InTime Standard] [○ Executive Brief] [○ Custom]              |
|                                                                  |
+------------------------------------------------------------------+
|
| PROPOSAL SECTIONS (Auto-Generated, Editable)                    |
|                                                                  |
| 1. [✓] Executive Summary                                        |
|    Auto-populated from opportunity data                         |
|    [Edit Section]                                               |
|                                                                  |
| 2. [⚠️] Proposed Scope                                          |
|    Needs customization                                          |
|    [Edit Section]                                               |
|                                                                  |
| 3. [✓] Commercial Terms                                         |
|    Pre-filled with account's existing MSA terms                 |
|    [Edit Section]                                               |
|                                                                  |
| 4. [⚠️] Implementation Plan                                     |
|    Needs customization                                          |
|    [Edit Section]                                               |
|                                                                  |
| 5. [✓] Why InTime                                               |
|    Auto-populated with RetailCo track record + case studies     |
|    [Edit Section]                                               |
|                                                                  |
| 6. [✓] Team & Expertise                                         |
|    Auto-populated with recruiter profiles                       |
|    [Edit Section]                                               |
|                                                                  |
| 7. [✓] Next Steps & Timeline                                    |
|    Auto-generated based on expected close date                  |
|    [Edit Section]                                               |
|                                                                  |
+------------------------------------------------------------------+
|
| [Preview Proposal] [Download PDF] [Download DOCX] [Send to Client]|
|                                                                  |
+------------------------------------------------------------------+
```

**User Action:** Click "[Edit Section]" on Section 2 (Proposed Scope)

**System Response:**
- Opens editor for customization

**Customized Proposal Content (Excerpt):**
```
+------------------------------------------------------------------+
| PROPOSED SCOPE                                                  |
+------------------------------------------------------------------+

RetailCo Marketing Department - Contract Staffing Partnership

Departments Served:
• Marketing (General)
• Digital Marketing
• Creative Services
• Content Marketing

Anticipated Role Types & Volumes (Based on Discovery):
┌────────────────────────────────────────────────────────────────┐
│ Role Type                  Est. Annual  Avg Duration  Est. Value│
│                            Volume                                │
├────────────────────────────────────────────────────────────────┤
│ Graphic Designer           4-5          6 months     $60,000    │
│ Digital Marketing Spec.    3-4          6 months     $55,000    │
│ Content Writer             2-3          6 months     $35,000    │
│ Social Media Manager       1-2          6 months     $30,000    │
│                                                                  │
│ TOTAL ESTIMATED VALUE:     10-14 roles  6 mo avg     $180,000   │
└────────────────────────────────────────────────────────────────┘

Contract Type: W2 contractors via InTime
Payment Terms: Net 30 (consistent with existing IT agreement)
Rate Structure:
  • Graphic Designer: $65-75/hour
  • Digital Marketing Specialist: $70-85/hour
  • Content Writer: $55-70/hour
  • Social Media Manager: $75-90/hour

Volume Commitment Discount:
Given the consolidation of Marketing + IT staffing (combined ~25
contractors annually), we propose a 5% rate discount on all new
Marketing roles. This represents ~$9,000 annual savings.
+------------------------------------------------------------------+
```

**User Action:** Continue customizing remaining sections

**User Action:** Click "Preview Proposal"

**System Response:**
- Generates full PDF preview
- Shows professional-looking proposal with InTime branding

**User Action:** Review, make final edits, click "Download PDF"

**System Response:**
- Generates final PDF
- Saves to opportunity files
- Ready to send

**Time:** 3-4 hours (spread over 2 days)

---

#### Step 6: Send Proposal to Client

**User Action:** Click "Send to Client" in proposal builder

**System Response:**
- Opens email composer with proposal attached

**Screen State:**
```
+------------------------------------------------------------------+
| Send Proposal: RetailCo Marketing Expansion                [×]   |
+------------------------------------------------------------------+
|
| To: [Jennifer Martinez <jmartinez@retailco.com>          ▼]    |
| CC: [Tom Wilson <twilson@retailco.com> (optional)        ▼]    |
|                                                                  |
| Subject:                                                        |
| [Marketing Staffing Proposal - RetailCo                      ]  |
|                                                                  |
| Attachments:                                                    |
| RetailCo_Marketing_Staffing_Proposal_Dec2024.pdf (1.2 MB)       |
|                                                                  |
| Body:                                                           |
| [                                                              ] |
| [Hi Jennifer,                                                  ] |
| [                                                              ] |
| [Thank you again for the great conversation last week. I       ] |
| [appreciate you sharing the challenges your team is facing with] |
| [contractor management.                                        ] |
| [                                                              ] |
| [As promised, I've put together a proposal for consolidating   ] |
| [your Marketing staffing under InTime. The proposal includes:  ] |
| [                                                              ] |
| [• Anticipated role types and volumes (10-14 contractors/year) ] |
| [• Commercial terms (consistent with our IT partnership)       ] |
| [• 5% volume discount (saves ~$9K annually)                    ] |
| [• Implementation plan and timeline                            ] |
| [• Case studies from similar consolidation projects            ] |
| [                                                              ] |
| [Estimated annual value: $180,000                              ] |
| [Target start date: January 2025 (Q1)                          ] |
| [                                                              ] |
| [I'd love to walk you through this proposal and answer any     ] |
| [questions. Are you available for a 30-minute follow-up call   ] |
| [next week? I'm flexible on timing.                            ] |
| [                                                              ] |
| [Looking forward to hearing your thoughts!                     ] |
| [                                                              ] |
| [Best regards,                                                 ] |
| [[Name]                                                        ] |
| [Account Manager, InTime                                       ] |
| [[Phone] | [Email]                                             ] |
| [                                                              ] |
|                                                                  |
+------------------------------------------------------------------+
| ☑ Log this email as activity                                    |
| ☑ Update opportunity stage to "Proposal Sent"                   |
| ☐ Set follow-up reminder (3 days if no response)                |
|                                                                  |
+------------------------------------------------------------------+
|                                         [Cancel]  [Send Proposal]|
+------------------------------------------------------------------+
```

**User Action:** Review email, click "Send Proposal"

**System Response:**
- Email sent with proposal attachment
- Activity logged in CRM
- Opportunity stage updated to "Proposal Sent" (60% probability)
- Follow-up reminder set for 3 days
- Toast: "Proposal sent successfully"

**Time:** 10 minutes

---

#### Step 7: Follow Up on Proposal

**3 Days Later (Dec 12):**

**User Action:** Receive email from Jennifer

**Email:**
```
From: Jennifer Martinez <jmartinez@retailco.com>
Subject: Re: Marketing Staffing Proposal - RetailCo

Hi [Name],

Thank you for the proposal - it looks very comprehensive!

I shared it with my TA Director (Mark Stevens) and our Procurement lead
(Lisa Chen). They both have questions.

Can we schedule a call for next week to discuss? I'd like to bring Mark
and Lisa so they can ask questions directly.

How about Tuesday, Dec 17 at 10:00 AM?

Best,
Jennifer
```

**User Action:** Accept meeting, log activity, prepare for multi-stakeholder call

**User Action:** Navigate to opportunity, update stage to "Negotiation" (75% probability)

**System Response:**
- Stage updated
- Probability increased to 75%
- Next action: "Prepare for stakeholder call (Dec 17)"

**Time:** 5 minutes (scheduling)

---

### PHASE 4: CLOSING (Week 4)

#### Step 8: Stakeholder Review Call

**Date:** Tuesday, Dec 17, 10:00 AM

**Attendees:**
- Jennifer Martinez (VP Marketing) - Decision Maker
- Mark Stevens (TA Director) - Implementer
- Lisa Chen (Procurement Manager) - Contract Approver
- You (Account Manager)

**Call Flow (45 minutes):**

**Minutes 0-10: Proposal Overview**
```
AM: "Thank you all for joining today. Jennifer, Mark, Lisa - I
     appreciate your time.

     Let me start with a brief overview of the proposal, then we'll
     open it up for questions.

     [Walk through key points: scope, pricing, volume discount,
      implementation timeline]

     The bottom line: We estimate 10-14 Marketing contractors annually,
     with an annual value of ~$180K. Because we're consolidating both IT
     and Marketing under one partnership, I've included a 5% volume
     discount, which saves RetailCo about $9K per year.

     What questions can I answer?"
```

**Minutes 10-30: Q&A**
```
[Mark Stevens (TA Director): "How quickly can you fill roles? Jennifer
 mentioned some vendors take 3-4 weeks."]

AM: "Great question. Our average time-to-fill across all roles is 12
     days. For Marketing roles specifically, I'd estimate 10-14 days
     depending on seniority. We have a dedicated recruiter with 7 years
     of marketing staffing experience who would be your primary contact."

[Lisa Chen (Procurement): "What's your invoice process? One of our pain
 points is managing 4 different vendor invoice systems."]

AM: "We'll use the same invoice process as your existing IT staffing
     partnership - Net 30, single monthly invoice covering all active
     contractors, submitted via your AP portal. You'll have one point of
     contact for all invoicing questions."

[Jennifer: "Can we start with a trial - maybe 2-3 roles - before
 committing to the full scope?"]

AM: "Absolutely. We can structure this as a phased rollout:
     • Phase 1 (Jan-Feb): 2-3 initial roles (proof of concept)
     • Phase 2 (Mar-Apr): Full rollout if Phase 1 is successful
     This gives you a low-risk way to validate the partnership."

[All three nod approval]
```

**Minutes 30-45: Next Steps & Close**
```
AM: "Based on this conversation, here's what I propose:

     1. I'll update the proposal to reflect the phased rollout approach.
     2. Lisa, I'll work with your team on the contract amendment (should
        be quick since we're adding to the existing MSA).
     3. Jennifer, assuming legal/procurement approval, we could kick off
        Phase 1 in early January. Does that timeline work?"

[Jennifer: "Yes, that works. I'll need the updated proposal by Friday
 to include in our budget review."]

AM: "I'll have it to you by Thursday. Lisa, I'll loop in our contracts
     team to coordinate with you on the MSA amendment."

[Lisa: "Perfect. Send me their contact info."]

AM: "Will do. Thank you all for the great discussion. I'm excited about
     this partnership!"
```

**Post-Call Actions:**

**User Action:** Log call, update opportunity stage to "Verbal Agreement" (90%)

**User Action:** Revise proposal to include phased rollout

**User Action:** Coordinate with contracts team (internal) and Lisa Chen (client procurement)

**Time:** 45 minutes (call) + 2 hours (contract coordination)

---

#### Step 9: Contract Execution & Close

**Dec 20:**

**User Action:** Receive email from Lisa Chen (Procurement)

**Email:**
```
From: Lisa Chen <lchen@retailco.com>
Subject: MSA Amendment Approved - Marketing Staffing

Hi [Name],

Good news - the MSA amendment for Marketing staffing has been approved
by Legal and is ready for signature.

Jennifer has signed on our side. It's now with your team for countersignature.

Looking forward to kicking off in January!

Best,
Lisa
```

**User Action:** Notify InTime contracts team to countersign

**2 Days Later (Dec 22):**

**User Action:** Receive notification: "Contract fully executed"

**User Action:** Navigate to opportunity, update stage to "Closed Won" (100%)

**System Response:**
- Opportunity marked as WON
- Revenue added to forecast ($180K annually)
- Account ARR updated: $340K → $520K (+53%)
- Account tier recalculated: Tier 2 → Tier 1 (crossed $500K threshold)
- Celebration animation plays
- Toast: "🎉 Expansion opportunity won! Great work!"

**Screen State (Closed Won):**
```
+------------------------------------------------------------------+
| 🎉 OPPORTUNITY WON!                                             |
+------------------------------------------------------------------+
| RetailCo - Marketing Department Expansion                        |
| Closed: December 22, 2024                                        |
| Contract Value: $180,000 annually                                |
+------------------------------------------------------------------+
|
| IMPACT ON ACCOUNT                                               |
| • Account ARR: $340K → $520K (+53%)                             |
| • Account Tier: Tier 2 → Tier 1 (Strategic Account)            |
| • NRR Contribution: 153% (significant expansion)                |
| • Total Active Contractors: 23 → 35 (estimated)                 |
|                                                                  |
| NEXT STEPS                                                      |
| ☐ Schedule kickoff meeting with Jennifer, Mark, and recruiter   |
| ☐ Assign dedicated Marketing recruiter (Amanda Torres)          |
| ☐ Create first 2-3 job requisitions for Phase 1                 |
| ☐ Set up weekly check-ins during Phase 1 (Jan-Feb)             |
| ☐ Update QBR schedule (now quarterly as Tier 1 account)        |
|                                                                  |
| RECOGNITION                                                     |
| This expansion will be highlighted in:                          |
| • Your monthly performance review                               |
| • Team all-hands meeting                                        |
| • Company newsletter                                            |
|                                                                  |
| Congratulations on a successful expansion close!                |
+------------------------------------------------------------------+
|                                                      [Continue]  |
+------------------------------------------------------------------+
```

**User Action:** Click "Continue"

**System Response:**
- Returns to expansion pipeline dashboard
- Shows updated account metrics

**Time:** 5 minutes

---

#### Step 10: Celebrate & Handoff to Delivery

**User Action:** Send celebration email to client

**Email:**
```
To: Jennifer Martinez <jmartinez@retailco.com>
CC: Mark Stevens <mstevens@retailco.com>, Tom Wilson <twilson@retailco.com>
Subject: Excited to Partner on Marketing Staffing!

Hi Jennifer, Mark, and Tom,

I wanted to share the great news - our Marketing staffing partnership is
officially a go! The contract was fully executed this morning.

I'm thrilled about this expansion and confident we'll deliver the same
quality and service you've experienced on the IT side.

NEXT STEPS:
• Kickoff meeting: I'd like to schedule a kickoff with you, Mark, and
  our dedicated Marketing recruiter (Amanda Torres) for early January.
  Amanda has 7 years of marketing staffing experience and is excited to
  support your team.

• First roles: Mark, let's connect next week to discuss the first 2-3
  roles for Phase 1. I want to make sure we hit the ground running in
  January.

Tom - thank you for the introduction that made this happen! Looking
forward to an even stronger partnership in 2025.

Happy holidays to all of you, and see you in the new year!

Best regards,
[Name]
```

**User Action:** Schedule internal handoff meeting with recruiting team

**User Action:** Brief Amanda Torres (Marketing recruiter) on account context

**User Action:** Update personal goals/metrics dashboard

**Final Metrics:**
- Expansion closed: $180K ARR
- Time to close: 22 days (from identification to signature)
- Contribution to quarterly expansion goal: 36% (if goal was $500K)
- NRR impact: +53% for this account

**Time:** 30 minutes

---

## Postconditions

1. ✅ Expansion opportunity identified and qualified
2. ✅ Discovery call conducted with decision maker
3. ✅ Proposal created and sent to client
4. ✅ Multi-stakeholder review call completed
5. ✅ Contract amendment negotiated and executed
6. ✅ Opportunity closed as WON
7. ✅ Account ARR increased by $180K
8. ✅ Account tier upgraded (Tier 2 → Tier 1)
9. ✅ Recruiting team briefed and ready for delivery
10. ✅ Client relationship strengthened through successful expansion

---

## Events Logged

| Event | Payload |
|-------|---------|
| `expansion.created` | `{ opportunity_id, account_id, estimated_value, type, user_id }` |
| `expansion.stage_changed` | `{ opportunity_id, old_stage, new_stage, probability, user_id }` |
| `expansion.won` | `{ opportunity_id, account_id, closed_value, close_date, user_id }` |
| `account.arr_updated` | `{ account_id, old_arr, new_arr, source: 'expansion', user_id }` |
| `account.tier_changed` | `{ account_id, old_tier, new_tier, trigger: 'arr_threshold', user_id }` |
| `activity.created` | Multiple (calls, emails, meetings logged throughout process) |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Opportunity Creation Failed | Validation error | "Failed to create opportunity. Check required fields." | Review and retry |
| Proposal Generation Failed | Template error | "Failed to generate proposal. Use manual creation." | Create in Word/PDF manually |
| Contact Not Found | Deleted or invalid | "Decision maker contact not found in system." | Add contact first |
| Stage Transition Invalid | Skipped stage | "Cannot move to Negotiation without Proposal stage." | Follow proper sequence |
| Contract Not Executed | External delay | N/A (no system error, operational delay) | Follow up with Legal/Procurement |

---

## Field Specifications

### Expansion Opportunity Type

| Property | Value |
|----------|-------|
| Field Name | `expansionType` |
| Type | Radio Button Group |
| Label | "Type" |
| Required | Yes |
| Options | |
| - `new_department` | "New Department" - Expand to new part of organization |
| - `new_location` | "New Location" - Geographic expansion |
| - `new_service` | "New Service Line" - Add new service type |
| - `volume_increase` | "Volume Increase" - More of same |
| - `rate_increase` | "Rate Increase" - Price optimization |
| - `contract_extension` | "Contract Extension" - Extend existing agreement |

### Expansion Stage

| Property | Value |
|----------|-------|
| Field Name | `stage` |
| Type | Workflow Stage |
| Label | "Stage" |
| Required | Yes |
| Stages (Sequential) | |
| - `identified` | "Identified" (10% probability) - Opportunity spotted |
| - `qualified` | "Qualified" (25% probability) - Validated real need |
| - `proposal` | "Proposal Sent" (60% probability) - Formal proposal delivered |
| - `negotiation` | "Negotiation" (75% probability) - Active discussion |
| - `verbal_agreement` | "Verbal Agreement" (90% probability) - Commitment made |
| - `closed_won` | "Closed Won" (100%) - Contract signed |
| - `closed_lost` | "Closed Lost" (0%) - Opportunity failed |

---

## Success Metrics

### Time to Close (Benchmarks)

| Expansion Type | Target Time to Close | Complexity |
|----------------|---------------------|------------|
| Volume Increase | 1-2 weeks | Low |
| Rate Increase | 2-3 weeks | Low-Medium |
| Contract Extension | 2-4 weeks | Medium |
| New Service Line | 3-6 weeks | Medium-High |
| New Department | 3-8 weeks | High |
| New Location | 4-12 weeks | Very High |

### Win Rate (Industry Benchmarks)

| Stage Reached | Typical Win Rate |
|--------------|------------------|
| Identified | 10-15% |
| Qualified | 25-30% |
| Proposal Sent | 40-50% |
| Negotiation | 60-70% |
| Verbal Agreement | 85-95% |

### AM Performance Expectations

| Metric | Target (per quarter) |
|--------|---------------------|
| Expansions Identified | 8-12 |
| Expansions Qualified | 4-6 |
| Expansions Closed Won | 2-3 |
| Total Expansion Revenue | 15-20% of portfolio ARR |

---

## Alternative Flows

### A1: Client Proactively Requests Expansion

1. Client emails: "We'd like to expand our partnership to include [X]"
2. AM creates expansion opportunity (skip discovery, go straight to "Qualified")
3. Schedule scoping call to understand requirements
4. Build and send proposal
5. Negotiate and close

**Time Savings:** 1-2 weeks (skip identification and qualification stages)

### A2: Expansion Opportunity Lost

1. Client responds to proposal: "Not right now, but we'll keep it in mind"
2. AM updates opportunity stage to "Closed Lost"
3. AM captures loss reason: Budget constraints, timing, competitor, etc.
4. AM sets follow-up reminder for 3-6 months
5. AM documents lessons learned

### A3: Multi-Product Bundle Expansion

1. Client wants multiple new service lines (e.g., Marketing + Bench Sales + RPO)
2. AM creates separate opportunity for each service line
3. Bundles them in single proposal with package discount
4. Negotiates as combined deal
5. Closes as single contract with multiple line items

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Expansion activities in daily routine
- [02-manage-account.md](./02-manage-account.md) - Identifying whitespace
- [03-client-meeting.md](./03-client-meeting.md) - Proposing expansion in QBR
- [05-handle-issue.md](./05-handle-issue.md) - Risk: Expansion delayed by quality issues

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create expansion opportunity | Opportunity created in "Identified" stage |
| TC-002 | Move opportunity through stages | Probability updates correctly at each stage |
| TC-003 | Close expansion as Won | Account ARR updated, tier recalculated |
| TC-004 | Close expansion as Lost | Opportunity marked lost, no ARR impact |
| TC-005 | Generate proposal from template | Proposal auto-populated with account data |
| TC-006 | Send proposal via email | Email sent, activity logged, stage updated |
| TC-007 | Expansion exceeds tier threshold | Account tier auto-upgraded |
| TC-008 | Create tasks from opportunity | Tasks appear in AM's task list |

---

*Last Updated: 2025-11-30*
