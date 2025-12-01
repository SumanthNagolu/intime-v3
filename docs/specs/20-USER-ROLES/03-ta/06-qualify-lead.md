# UC-TA-006: Qualify Lead (BANT)

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** TA Specialist
**Status:** Approved

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-TA-006 |
| Actor | TA Specialist |
| Goal | Qualify lead using BANT framework (Budget, Authority, Need, Timeline) |
| Frequency | 3-5 times per week |
| Estimated Time | 20-30 minutes per lead |
| Priority | High |

---

## Actors

- **Primary:** TA Specialist
- **Secondary:** TA Manager (for coaching on difficult qualifications)
- **System:** CRM, Call recording, Email tracking

---

## Preconditions

1. Lead exists in system (from [Generate Leads](./05-generate-leads.md))
2. Initial contact made (email, phone, or LinkedIn)
3. Lead has responded or shown interest
4. Discovery call scheduled (or in progress)

---

## Trigger

One of the following:
- Lead responded positively to outreach
- Discovery call scheduled
- Inbound inquiry requires qualification
- Lead resurfaces after nurture period

---

## Main Flow: Discovery Call Qualification

### Step 1: Pre-Call Research

**User Action:** Navigate to lead detail page

**Screen:**
```
┌──────────────────────────────────────────────────────────────┐
│ Lead: Sarah Johnson                                    [Edit] │
│ VP of Learning & Development @ TechCorp Inc.                  │
├──────────────────────────────────────────────────────────────┤
│ Lead Score: ⭐⭐⭐⭐ (85/100)  Status: [Contacted ▼]          │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐   │
│ │ 📞 Discovery Call Scheduled                            │   │
│ │ Date: Tomorrow, 2:00 PM EST                            │   │
│ │ Duration: 30 minutes                                   │   │
│ │ Zoom Link: [Join Call]  [Reschedule]                  │   │
│ │                                                        │   │
│ │ Pre-Call Checklist:                                    │   │
│ │ ✓ Research company (TechCorp)                         │   │
│ │ ✓ Review LinkedIn activity                            │   │
│ │ □ Prepare discovery questions                         │   │
│ │ □ Review BANT framework                               │   │
│ │ □ Set call recording                                  │   │
│ │                                                        │   │
│ │ [Start Pre-Call Research]                             │   │
│ └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**User Action:** Click "Start Pre-Call Research"

**Research Checklist:**
```
┌──────────────────────────────────────────────────────────────┐
│ Pre-Call Research: TechCorp Inc.                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Company Intelligence (Auto-populated from Clearbit)           │
│ ├─ Industry: SaaS / Cloud Infrastructure                     │
│ ├─ Size: 180 employees                                       │
│ ├─ Revenue: $15M ARR (estimated)                             │
│ ├─ Funding: Series A ($10M, Jan 2025)                        │
│ ├─ HQ: San Francisco, CA                                     │
│ └─ Tech Stack: React, Python, AWS, Kubernetes                │
│                                                               │
│ Recent News & Signals:                                        │
│ ✓ Raised $10M Series A (Jan 2025) → Budget likely available │
│ ✓ Posted 15 engineering roles (last 30 days) → Hiring need  │
│ ✓ Sarah posted on LinkedIn about "upskilling dev team"       │
│ ✓ Competitor [CompanyX] using training programs              │
│                                                               │
│ Competitive Intelligence:                                     │
│ Current Vendors (from LinkedIn/G2):                           │
│ → Using Udemy for Business (generic training)                │
│ → Using HackerRank for assessments                           │
│ → No custom training vendor identified                       │
│                                                               │
│ Pain Points (Inferred):                                       │
│ → Scaling team fast (15 open roles)                          │
│ → Need React/Python developers (specific skills)             │
│ → Generic training not customized to their stack             │
│                                                               │
│ Opportunity Sizing:                                           │
│ → 15 new hires = ~$30K training potential                    │
│ → Existing team (180) = $50K+ upskilling opportunity         │
│ → Total potential: $50K-$100K annually                       │
│                                                               │
│ Discovery Questions Prepared:                                 │
│ [See SPIN framework below]                                   │
│                                                               │
│ [✓ Research Complete]  [Add Notes]  [Start Call]            │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 10-15 minutes

---

### Step 2: Discovery Call (SPIN Framework)

**SPIN Questioning Framework:**

```
┌──────────────────────────────────────────────────────────────┐
│ SPIN Discovery Questions                                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ S = SITUATION Questions (Current State)                      │
│ "Tell me about your current approach to training developers" │
│ "How many developers do you have on the team currently?"     │
│ "What's your typical onboarding process for new hires?"      │
│ "Who handles training coordination today?"                   │
│                                                               │
│ P = PROBLEM Questions (Pain Points)                          │
│ "What challenges are you facing with your current training?" │
│ "How long does it typically take a new hire to be productive?"│
│ "Are you finding the talent you need in the market?"         │
│ "What gaps exist in your current team's skill set?"          │
│                                                               │
│ I = IMPLICATION Questions (Cost of Inaction)                 │
│ "How does slow onboarding impact your product roadmap?"      │
│ "What's the cost of an open role staying unfilled for 90 days?"│
│ "If you don't upskill existing team, what's the alternative?" │
│ "How does skill gap affect your competitive position?"       │
│                                                               │
│ N = NEED-PAYOFF Questions (Value of Solution)                │
│ "If you could reduce onboarding time by 40%, what would      │
│  that enable for the business?"                              │
│ "What would it mean if you could hire junior devs and        │
│  upskill them to senior level in 12 weeks?"                  │
│ "How valuable would it be to have a training program         │
│  customized to your exact tech stack?"                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Call Flow:**

```
1. Opening (2 min)
   "Thanks for taking the time, Sarah. I've done some research
   on TechCorp - congrats on the Series A! I saw you're hiring
   aggressively. Before I share how we might help, I'd love to
   understand your current situation better. Sound good?"

2. Situation Questions (5 min)
   → Current training approach
   → Team size and structure
   → Hiring goals for next 6-12 months
   → Budget/resources for training

3. Problem Questions (8 min)
   → Specific pain points (time to productivity, skill gaps)
   → Current solutions and limitations
   → Impact on business (delayed features, lost revenue)

4. Implication Questions (5 min)
   → Quantify cost of problem (vacant roles, slow onboarding)
   → Explore urgency (competitive pressure, roadmap delays)
   → Discuss alternatives (external hiring cost, offshore)

5. Need-Payoff Questions (5 min)
   → Paint picture of solution impact
   → Get prospect to articulate value
   → Build desire for solution

6. BANT Discovery (3 min)
   → Budget: "What budget have you allocated for training?"
   → Authority: "Who else is involved in this decision?"
   → Need: [Already explored above]
   → Timeline: "When do you need to have this in place?"

7. Next Steps (2 min)
   → Recap key points
   → Propose next action (proposal, demo, stakeholder meeting)
   → Schedule follow-up
```

**During Call - Live Notes Template:**

**User Action:** Open "Call Notes" panel in CRM

```
┌──────────────────────────────────────────────────────────────┐
│ Live Call Notes: Sarah Johnson (TechCorp)                    │
│ [● Recording] Duration: 00:15:23                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ SITUATION:                                                    │
│ - Team: 180 total, 80 engineers                              │
│ - Goal: Hire 20 engineers in next 6 months                   │
│ - Current training: Udemy (self-paced, not working)          │
│ - Onboarding: 3-6 months to full productivity (too long)     │
│                                                               │
│ PROBLEM:                                                      │
│ - Can't find senior React developers (market too competitive)│
│ - Tried hiring bootcamp grads, but they lack specific skills │
│ - Udemy too generic, not tailored to their stack             │
│ - Engineers leave for better opportunities (retention issue) │
│                                                               │
│ IMPLICATION:                                                  │
│ - Product roadmap delayed 2 quarters (due to lack of talent) │
│ - Cost of open role: ~$30K/month in lost productivity        │
│ - Losing deals because features not built fast enough        │
│ - Estimated revenue impact: $500K/year                       │
│                                                               │
│ NEED-PAYOFF:                                                  │
│ - "If we could hire mid-level and train to senior in         │
│   12 weeks, that would be game-changing"                     │
│ - Interested in custom curriculum (React, Python, AWS)       │
│ - Values ongoing upskilling (not just new hires)             │
│                                                               │
│ BANT QUALIFICATION:                                           │
│                                                               │
│ B - BUDGET:                                                   │
│   ✓ Allocated: $75K for 2025 training initiatives            │
│   ✓ Approval level: Sarah can approve up to $50K             │
│   ✓ Above $50K: Needs CTO approval (Michael Chen)            │
│   ✓ Open to ROI-based investment if business case strong     │
│   Score: 25/25 ✓ Excellent                                   │
│                                                               │
│ A - AUTHORITY:                                                │
│   ✓ Sarah: Decision maker for L&D budget                     │
│   ✓ Influences: CTO (Michael), CEO (for large investments)   │
│   ✓ Process: Sarah proposes, CTO approves, CEO signs off     │
│   ✓ Sarah can champion internally (motivated)                │
│   Score: 22/25 ✓ Very Good (need to engage CTO eventually)   │
│                                                               │
│ N - NEED:                                                     │
│   ✓ Pain: Can't hire fast enough, can't train effectively    │
│   ✓ Impact: Revenue loss, delayed roadmap, retention risk    │
│   ✓ Urgency: High (Board pressure to deliver features)       │
│   ✓ Fit: InTime's training programs directly solve this      │
│   Score: 25/25 ✓ Excellent                                   │
│                                                               │
│ T - TIMELINE:                                                 │
│   ✓ Decision target: End of Q1 (6 weeks)                     │
│   ✓ Implementation: Ideally start by April (Q2)              │
│   ✓ First cohort: 10 developers in April                     │
│   ✓ Urgency driver: Board meeting in March (needs progress)  │
│   Score: 23/25 ✓ Very Good                                   │
│                                                               │
│ TOTAL BANT SCORE: 95/100 🎯 HIGHLY QUALIFIED                 │
│                                                               │
│ NEXT STEPS:                                                   │
│ 1. TA Specialist: Send custom proposal (by Friday)           │
│ 2. Sarah: Review proposal, share with CTO                    │
│ 3. Schedule follow-up: Stakeholder call with CTO (next week) │
│ 4. Target: Proposal approval by end of February              │
│                                                               │
│ OBJECTIONS / CONCERNS:                                        │
│ - Cost: "Budget is tight, need to see clear ROI"             │
│   → Response: Showed ROI calculator, $500K revenue impact    │
│ - Timing: "We're already behind, can we start sooner?"       │
│   → Response: Possible to fast-track, will check capacity    │
│                                                               │
│ COMPETITORS MENTIONED:                                        │
│ - Evaluated Udacity for Business (too expensive, $2K/person) │
│ - Considered building internal (no bandwidth)                │
│                                                               │
│ BUYING SIGNALS:                                               │
│ ✓ Asked about pricing multiple times                         │
│ ✓ Volunteered to introduce us to CTO                         │
│ ✓ Asked "What's the fastest we could start?"                 │
│ ✓ Shared internal goals (20 hires in 6 months)               │
│                                                               │
│ [Save Notes]  [Convert to Deal]  [Schedule Follow-up]        │
└──────────────────────────────────────────────────────────────┘
```

**Time:** 30 minutes (call) + 5 minutes (notes)

---

### Step 3: BANT Scoring

**User Action:** Click "Calculate BANT Score"

**System Auto-Scoring:**

```
┌──────────────────────────────────────────────────────────────┐
│ BANT Qualification Score                                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ BUDGET (25 points max)                      Score: 25/25 ✓   │
│ ├─ Budget amount confirmed: $75K (10 pts)                    │
│ ├─ Budget allocated this FY: Yes (5 pts)                     │
│ ├─ Approval authority clear: Yes (5 pts)                     │
│ └─ Willing to invest based on ROI: Yes (5 pts)               │
│                                                               │
│ AUTHORITY (25 points max)                   Score: 22/25 ✓   │
│ ├─ Decision maker identified: Yes (10 pts)                   │
│ ├─ Access to decision maker: Yes (5 pts)                     │
│ ├─ Influencers identified: Yes (5 pts)                       │
│ └─ Decision process understood: Partial (2/2 pts)            │
│     (Need to engage CTO in next meeting)                     │
│                                                               │
│ NEED (25 points max)                        Score: 25/25 ✓   │
│ ├─ Pain point clear and urgent: Yes (10 pts)                 │
│ ├─ Business impact quantified: Yes (5 pts)                   │
│ ├─ InTime solution fits need: Yes (5 pts)                    │
│ └─ No better alternative: Yes (5 pts)                        │
│                                                               │
│ TIMELINE (25 points max)                    Score: 23/25 ✓   │
│ ├─ Decision timeline: 6 weeks (10 pts)                       │
│ ├─ Implementation timeline: Q2 (5 pts)                       │
│ ├─ Urgency drivers: Board meeting (5 pts)                    │
│ └─ No dependencies/blockers: Minimal (3/3 pts)               │
│                                                               │
│ ══════════════════════════════════════════════════════════   │
│ TOTAL SCORE: 95/100                                           │
│ ══════════════════════════════════════════════════════════   │
│                                                               │
│ QUALIFICATION STATUS: ✅ HIGHLY QUALIFIED                    │
│                                                               │
│ Recommended Action: CONVERT TO DEAL                           │
│                                                               │
│ Estimated Deal Value: $50K-$75K (Year 1)                     │
│ Confidence Level: 85% (Very High)                            │
│ Expected Close Date: March 31, 2025                           │
│                                                               │
│ [Convert to Deal]  [Add to Nurture]  [Schedule Follow-up]   │
└──────────────────────────────────────────────────────────────┘
```

**Qualification Thresholds:**

| Score Range | Status | Action |
|-------------|--------|--------|
| **90-100** | Highly Qualified | Immediate deal conversion, fast-track |
| **70-89** | Qualified | Convert to deal, standard process |
| **50-69** | Partially Qualified | Nurture, gather more info, re-qualify |
| **30-49** | Poorly Qualified | Long-term nurture, check back in 6 months |
| **0-29** | Disqualified | Politely disengage, mark as "not a fit" |

**Field Specifications:**

| Field | Type | Required | Validation | Calculation |
|-------|------|----------|------------|-------------|
| `budgetAmount` | Currency | No | >0 | Manual entry |
| `budgetAllocated` | Boolean | Yes | true/false | Based on call notes |
| `approvalAuthority` | String | Yes | max:200 | Who can approve |
| `decisionMaker` | String | Yes | max:200 | Primary DM name/title |
| `decisionProcess` | Text | No | max:500 | How decisions made |
| `painPoint` | Text | Yes | max:1000 | Primary problem |
| `businessImpact` | Text | No | max:500 | Cost of inaction |
| `timeline` | Date | Yes | Future date | Target decision date |
| `urgencyDriver` | Text | No | max:500 | Why urgent |
| `bant_score` | Number | Auto | 0-100 | System calculated |

**Time:** 5 minutes

---

## Alternative Flow A: Low BANT Score (50-69)

### A1: Partial Qualification - Need More Discovery

**Scenario:** Lead interested but missing key BANT elements

**Example Gaps:**
- Budget not discussed (uncomfortable asking)
- Decision maker not identified (speaking with influencer)
- Timeline vague ("sometime this year")
- Need unclear (exploratory conversation)

**User Action:** Select "Add to Nurture Campaign"

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│ Lead Needs Further Qualification                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Current BANT Score: 62/100 (Partially Qualified)             │
│                                                               │
│ Missing Information:                                          │
│ ⚠ Budget not discussed                                       │
│ ⚠ Decision maker not confirmed (talked to influencer)        │
│ ✓ Need is clear                                              │
│ ⚠ Timeline vague ("Q2 or Q3")                                │
│                                                               │
│ Recommended Actions:                                          │
│ 1. Schedule follow-up call to address gaps                   │
│ 2. Request introduction to budget holder                     │
│ 3. Send ROI calculator to prompt budget discussion           │
│ 4. Add to nurture campaign: "Partial Qualification"          │
│                                                               │
│ Nurture Campaign (Email sequence):                            │
│ Week 1: Case study similar to their use case                 │
│ Week 2: ROI calculator (prompt budget thinking)              │
│ Week 3: "How to get budget approval" guide                   │
│ Week 4: Re-engagement call (complete qualification)          │
│                                                               │
│ [Schedule Follow-up]  [Add to Nurture]  [Disqualify]        │
└──────────────────────────────────────────────────────────────┘
```

**Next Steps:**
1. Send email with ROI resources
2. Schedule follow-up in 2 weeks
3. Add to nurture campaign
4. Re-qualify when more info available

**Time:** 10 minutes

---

## Alternative Flow B: Disqualified Lead (Score <50)

### B1: No Budget or Wrong Fit

**Scenario:** Lead doesn't meet qualification criteria

**Common Disqualification Reasons:**
- No budget ("We don't have budget for this")
- Wrong company size (too small: <20 employees)
- Wrong need ("We're actually looking for X, not training")
- No urgency ("Maybe next year, just exploring")
- Bad timing ("We just signed with competitor")
- Decision maker unreachable ("I can't get you to my boss")

**User Action:** Click "Disqualify Lead"

**System Prompt:**
```
┌──────────────────────────────────────────────────────────────┐
│ Disqualify Lead: Sarah Johnson                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Disqualification Reason: *                                    │
│ [ ] No budget / Budget too small                             │
│ [ ] Wrong company size (too small/large)                     │
│ [ ] Need doesn't match InTime offerings                      │
│ [ ] No urgency / Poor timing                                 │
│ [ ] Recently signed with competitor                          │
│ [ ] Decision maker not accessible                            │
│ [ ] Other: ___________________                               │
│                                                               │
│ Additional Notes:                                             │
│ [                                                          ]  │
│                                                               │
│ Future Action:                                                │
│ ○ Check back in 6 months (add to long-term nurture)         │
│ ○ Check back in 12 months                                    │
│ ● Archive (do not contact again)                             │
│                                                               │
│ Send Closing Email?                                           │
│ ☑ Yes, send polite disengagement email                       │
│                                                               │
│ Email Preview:                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Subject: No fit right now - staying in touch             │  │
│ │                                                          │  │
│ │ Hi Sarah,                                                │  │
│ │                                                          │  │
│ │ Thanks for the conversation about TechCorp's training   │  │
│ │ needs. Based on our discussion, it sounds like [reason]  │  │
│ │ means this isn't the right fit right now.               │  │
│ │                                                          │  │
│ │ I'll check back in [6/12 months] to see if things have  │  │
│ │ changed. In the meantime, if you need anything, feel    │  │
│ │ free to reach out.                                       │  │
│ │                                                          │  │
│ │ Best,                                                    │  │
│ │ [Your Name]                                              │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ [Cancel]                                  [Disqualify Lead]  │
└──────────────────────────────────────────────────────────────┘
```

**Postconditions:**
- Lead status: "Disqualified"
- Lead stage: "Closed - Not a Fit"
- Activity logged with reason
- Closing email sent (if selected)
- Lead removed from active follow-up sequences
- Optional: Added to long-term nurture (6-12 month check-in)

**Time:** 5 minutes

---

## Alternative Flow C: Hot Lead (Score 90-100)

### C1: Fast-Track to Deal

**Scenario:** Lead is highly qualified and ready to move forward

**Indicators:**
- Budget confirmed and allocated
- Decision maker engaged and motivated
- Clear urgent need
- Timeline: Decision within 2-4 weeks

**User Action:** Click "Convert to Deal"

**System Response:**
```
🎯 HIGH-PRIORITY QUALIFIED LEAD

This lead scored 95/100 (Highly Qualified).

Fast-Track Recommended Actions:
✓ Convert to Deal immediately
✓ Prepare custom proposal (within 24 hours)
✓ Schedule stakeholder meeting (this week)
✓ Notify TA Manager (high-value opportunity)
✓ Flag for priority support

Estimated Deal Value: $50K-$75K
Probability: 85%

[Convert to Deal Now →]
```

**Next:** [Convert Lead to Deal](./07-convert-lead-to-deal.md)

**Time:** 2 minutes (system handles conversion)

---

## Postconditions

1. ✅ BANT framework completed
2. ✅ Lead scored (0-100)
3. ✅ Qualification decision made:
   - Qualified (score ≥70) → Convert to Deal
   - Partial (50-69) → Nurture campaign
   - Disqualified (<50) → Archive or long-term nurture
4. ✅ Call notes logged
5. ✅ Recording saved (if applicable)
6. ✅ Next steps defined and scheduled
7. ✅ Activity logged in CRM

---

## Business Rules

1. **BANT Required:** All leads must complete BANT before converting to deals
2. **Score Threshold:** Minimum 70/100 to convert to deal (can override with manager approval)
3. **Re-Qualification:** Leads in nurture must be re-qualified after 90 days
4. **Call Recording:** All discovery calls must be recorded (compliance + coaching)
5. **Manager Review:** Deals >$50K require manager review of BANT before proposal
6. **Time Limit:** Qualification must occur within 14 days of lead creation (or lead moves to nurture)

---

## Metrics & Analytics

### Qualification Metrics
- Leads qualified per week: Target 5-7
- Average BANT score: Target >75
- Qualification rate: % of leads that reach 70+ score
- Time to qualify: Days from create to qualified
- Conversion rate: Qualified leads → Deals

### Call Performance
- Average call duration: 25-35 minutes
- Questions asked per call: Target 15-20
- SPIN coverage: Did call cover all 4 SPIN areas?
- Objection handling: How many objections surfaced and handled?

### Deal Pipeline Impact
- Qualified lead → Deal conversion: Target >80%
- Average deal size from qualified leads: $15K-$50K
- Win rate on qualified deals: Target >60%

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Complete BANT, score 95 | Auto-suggest deal conversion |
| TC-002 | Incomplete BANT (missing budget) | Warning, suggest nurture |
| TC-003 | Score <50, disqualify | Email sent, lead archived |
| TC-004 | Manual score override | Require manager approval |
| TC-005 | Call recording fails | Error logged, allow manual notes |
| TC-006 | Duplicate qualification attempt | Show previous BANT, allow update |
| TC-007 | Lead unresponsive post-call | Auto-move to nurture after 14 days |

---

*Last Updated: 2025-11-30*
