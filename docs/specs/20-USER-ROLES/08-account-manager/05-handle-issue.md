# Use Case: Handle Client Escalation

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-AM-005 |
| Actor | Account Manager |
| Goal | Resolve client escalations quickly and effectively to maintain satisfaction and prevent churn |
| Frequency | 2-5 escalations per month per AM (varies by portfolio health) |
| Estimated Time | 2-48 hours (varies by severity) |
| Priority | Critical (especially P0/P1 escalations) |

---

## Preconditions

1. User is logged in as Account Manager
2. Escalation exists in system (created by recruiter, client, or AM)
3. User has authority to resolve escalations within defined limits
4. User has access to escalation management tools
5. Relevant account and job data is accessible

---

## Trigger

One of the following:
- Recruiter escalates issue beyond their scope
- Client directly contacts AM with complaint/concern
- Automated alert triggered (e.g., contractor no-show, SLA violation)
- Account health score drops below threshold
- Quality issue identified (candidate rejection, performance complaint)
- Contract/billing dispute

---

## Main Flow (Click-by-Click)

### PHASE 1: ESCALATION INTAKE (0-1 hour)

#### Step 1: Receive Escalation Notification

**Scenario:** Account Manager receives Slack notification and email

**Slack Notification:**
```
🚨 NEW ESCALATION - P1 (High Priority)
Account: GlobalTech Solutions
Issue: Candidate quality - 3 consecutive rejections
Created by: Sarah Chen (Recruiter)
Response SLA: 4 hours
[View in InTime] [Take Ownership]
```

**Email Notification:**
```
From: InTime Escalations <escalations@intime.com>
Subject: 🚨 P1 Escalation: GlobalTech - Candidate Quality Issue

New escalation assigned to you:

Escalation ID: ESC-2024-1923
Account: GlobalTech Solutions
Severity: P1 - High Priority
Created: Nov 30, 2024, 2:47 PM
Response SLA: 4 hours (respond by 6:47 PM)

Issue Summary:
Client (Jennifer Wu, Hiring Manager) rejected 3 consecutive candidates
for Senior UX Designer role. Feedback: "Candidates don't meet basic
requirements despite matching job description."

Recruiter Sarah Chen requests AM intervention.

[View Full Escalation in InTime]
```

**User Action:** Click "[View Full Escalation in InTime]"

**System Response:**
- Opens escalation detail page in InTime
- URL changes to: `/employee/workspace/escalations/ESC-2024-1923`

**Screen State:**
```
+------------------------------------------------------------------+
| Escalation #ESC-2024-1923                       [Take Ownership] |
+------------------------------------------------------------------+
| Status: Open (Unassigned)       Severity: P1 - High Priority     |
| Account: GlobalTech Solutions   Job: Senior UX Designer          |
| Created: Nov 30, 2024, 2:47 PM  Response SLA: 6:47 PM (4h)      |
| Created By: Sarah Chen (Recruiter)                               |
+------------------------------------------------------------------+
|
| [Overview] [Investigation] [Resolution] [Communication] [History]|
|                                                                  |
+------------------------------------------------------------------+
|
| ISSUE DESCRIPTION                                               |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Client (Jennifer Wu, Hiring Manager at GlobalTech) has     │ |
| │ rejected 3 consecutive candidates for the Senior UX Designer│ |
| │ role over the past 10 days.                                │ |
| │                                                             │ |
| │ Rejection feedback (verbatim from client):                 │ |
| │ • Candidate 1: "Lacks retail experience we specified"      │ |
| │ • Candidate 2: "Portfolio doesn't show healthcare work"    │ |
| │ • Candidate 3: "Years of experience don't match (5 vs 10)" │ |
| │                                                             │ |
| │ Client is frustrated and questioning our understanding of  │ |
| │ role requirements. Hiring manager sent terse email today:  │ |
| │ "Are we reading the same job description?"                 │ |
| │                                                             │ |
| │ Recruiter (Sarah) requests AM to:                          │ |
| │ 1. Review job requirements with client (possible mismatch?)│ |
| │ 2. Reset expectations on timeline/quality                  │ |
| │ 3. Determine if rate adjustment needed to attract right    │ |
| │    candidates                                              │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| IMPACT ASSESSMENT                                               |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Client Satisfaction Risk:    HIGH                          │ |
| │ Account Health Impact:       -5 points (current: 78/100)   │ |
| │ Revenue at Risk:             $0 (immediate)                │ |
| │                              $280K (annual renewal risk)   │ |
| │ Churn Probability:           +8% (now 15% total)           │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| RELATED INFORMATION                                             |
| • Job ID: JOB-2024-5623 (Senior UX Designer)                    |
| • Account Tier: Tier 2 (Growth Account)                         |
| • Account Manager: You                                          |
| • Primary Contact: Jennifer Wu (Hiring Manager)                 |
| • Submissions: 3 rejected, 0 in interview, 0 accepted           |
| • Days Open: 18 days (target: 14 days)                          |
|                                                                  |
| RECOMMENDED ACTIONS (AI-Generated)                              |
| ┌────────────────────────────────────────────────────────────┐ |
| │ 1. 🔍 Review job description vs submitted candidate profiles│ |
| │    Hypothesis: Requirements mismatch or unclear             │ |
| │                                                             │ |
| │ 2. 📞 Call client within 2 hours to acknowledge and        │ |
| │    demonstrate urgency                                      │ |
| │                                                             │ |
| │ 3. 🤝 Schedule alignment meeting with client + recruiter   │ |
| │    to recalibrate on requirements                          │ |
| │                                                             │ |
| │ 4. 💰 Assess if rate ($75/hr) is competitive for required  │ |
| │    experience level (10 years + Retail + Healthcare)       │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
+------------------------------------------------------------------+
| [Take Ownership] [Assign to Someone] [Add Note] [Close]         |
+------------------------------------------------------------------+
```

**Time:** 2 minutes (review escalation)

---

#### Step 2: Take Ownership of Escalation

**User Action:** Click "[Take Ownership]" button

**System Response:**
- Escalation assigned to user
- Status changes: "Open (Unassigned)" → "In Progress (Assigned to You)"
- SLA timer continues (now 3h 55min remaining)
- Notification sent to recruiter (Sarah): "AM has taken ownership"

**Screen State (Updated):**
```
+------------------------------------------------------------------+
| Escalation #ESC-2024-1923                              [Actions ▼]|
+------------------------------------------------------------------+
| Status: In Progress             Severity: P1 - High Priority     |
| Assigned To: You                SLA: 3h 55min remaining          |
| Account: GlobalTech Solutions   Job: Senior UX Designer          |
+------------------------------------------------------------------+
|
| OWNERSHIP CONFIRMED                                             |
| ✅ You are now responsible for resolving this escalation        |
| ✅ Recruiter (Sarah Chen) has been notified                     |
| ✅ SLA timer: Respond to client by 6:47 PM                      |
|                                                                  |
| NEXT STEP CHECKLIST                                             |
| ☐ Review job description and candidate profiles (5 min)         |
| ☐ Contact client to acknowledge issue (within 2 hours)          |
| ☐ Investigate root cause (30-60 min)                            |
| ☐ Develop action plan (15 min)                                  |
| ☐ Execute resolution (varies)                                   |
| ☐ Follow up with client and recruiter (15 min)                  |
| ☐ Document lessons learned (10 min)                             |
|                                                                  |
+------------------------------------------------------------------+
```

**Time:** 30 seconds

---

### PHASE 2: INVESTIGATION (30-60 minutes)

#### Step 3: Review Job Description & Candidate Profiles

**User Action:** Click "Investigation" tab

**System Response:**
- Loads investigation workspace with all relevant data

**Screen State (Investigation Tab):**
```
+------------------------------------------------------------------+
| Investigation: ESC-2024-1923                                     |
+------------------------------------------------------------------+
|
| JOB DESCRIPTION REVIEW                                          |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Job Title: Senior UX Designer                              │ |
| │ Account: GlobalTech Solutions                              │ |
| │ Posted: Nov 12, 2024 (18 days ago)                         │ |
| │                                                             │ |
| │ REQUIREMENTS (from job description):                       │ |
| │ • 10+ years UX design experience                           │ |
| │ • Healthcare AND Retail industry experience                │ |
| │ • Portfolio demonstrating complex UX projects              │ |
| │ • Proficiency: Figma, Sketch, Adobe XD                     │ |
| │ • Rate: $75/hour                                           │ |
| │                                                             │ |
| │ ⚠️ ANALYSIS:                                                │ |
| │ Requirement "Healthcare AND Retail" is VERY specific.      │ |
| │ Market data: Only ~50 UX designers nationwide with both.   │ |
| │ Typical rate for this profile: $90-110/hour (not $75)     │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| SUBMITTED CANDIDATES REVIEW                                     |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Candidate 1: Alex Thompson                                 │ |
| │ Experience: 12 years UX design                             │ |
| │ Industries: Retail (8 years), Finance (4 years)            │ |
| │ Missing: Healthcare experience ❌                          │ |
| │ Client Feedback: "Lacks retail experience we specified"    │ |
| │ ⚠️ NOTE: Client feedback INCORRECT - has 8 years retail!   │ |
| │          Client may not have read resume carefully.        │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ Candidate 2: Maria Garcia                                  │ |
| │ Experience: 10 years UX design                             │ |
| │ Industries: Healthcare (6 years), E-commerce (4 years)     │ |
| │ Missing: Retail experience (E-commerce ≠ Retail per client)❌│|
| │ Client Feedback: "Portfolio doesn't show healthcare work"  │ |
| │ ⚠️ NOTE: Portfolio DOES show healthcare - link broken?     │ |
| ├────────────────────────────────────────────────────────────┤ |
| │ Candidate 3: John Lee                                      │ |
| │ Experience: 5 years UX design                              │ |
| │ Industries: Healthcare (3 years), Retail (2 years) ✅      │ |
| │ Missing: 10+ years experience (only has 5) ❌             │ |
| │ Client Feedback: "Years of experience don't match (5 vs 10)"│|
| │ ⚠️ NOTE: Recruiter error - should not have submitted       │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ROOT CAUSE ANALYSIS                                             |
| ┌────────────────────────────────────────────────────────────┐ |
| │ PRIMARY CAUSE:                                             │ |
| │ Requirements too specific for rate offered. "Healthcare AND│ |
| │ Retail" at $75/hr is below market ($90-110/hr). Recruiting │ |
| │ is struggling to find candidates who meet ALL criteria.    │ |
| │                                                             │ |
| │ CONTRIBUTING FACTORS:                                      │ |
| │ 1. Client not thoroughly reviewing submissions (Candidate 1│ |
| │    DID have retail experience, but client said didn't)     │ |
| │ 2. Recruiter error on Candidate 3 (should not have sent)  │ |
| │ 3. Possible technical issue with Candidate 2's portfolio   │ |
| │    (broken link?)                                          │ |
| │                                                             │ |
| │ SEVERITY DRIVERS:                                          │ |
| │ • 3 rejections = pattern of failure                        │ |
| │ • Client questioning competence ("same job description?")  │ |
| │ • 18 days open vs 14-day target = behind SLA              │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| MARKET DATA (Auto-Retrieved)                                    |
| ┌────────────────────────────────────────────────────────────┐ |
| │ UX Designers with 10+ years:      ~12,000 nationwide       │ |
| │ + Healthcare experience:          ~800                     │ |
| │ + Retail experience:              ~50 (!!!)                │ |
| │                                                             │ |
| │ Market Rate (10+ years, dual industry):  $90-110/hour      │ |
| │ Client Rate:                             $75/hour          │ |
| │ Gap:                                     -$15 to -$35/hour │ |
| │                                                             │ |
| │ Conclusion: Rate is 17-32% below market for requirements.  │ |
| └────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**User Action:** Review analysis, take notes

**User Action:** Click "Consult with Recruiter" to get Sarah's perspective

**System Response:**
- Opens chat/call interface with recruiter

**Quick Slack Chat with Sarah (Recruiter):**
```
You: "Hi Sarah, reviewing the GlobalTech UX role. Can you give me
      context on why Candidate 3 (John Lee) was submitted with only 5
      years experience when job requires 10+?"

Sarah: "Ugh, that was my mistake. I was rushing and misread his
        LinkedIn. Shouldn't have sent him. Sorry about that."

You: "No worries, mistakes happen. More importantly - are you struggling
      to find candidates who have BOTH Healthcare AND Retail? The
      requirement seems very narrow."

Sarah: "YES! I've sourced 47 UX designers in the past 2 weeks. Only 2
        had both industries. One wanted $110/hr (way above our $75 rate),
        the other wasn't interested in contract work."

You: "That's what I suspected. The market data confirms this. I'm going
      to call the client and discuss either relaxing the requirement
      (Healthcare OR Retail) or increasing the rate. Sound good?"

Sarah: "Please! I've been beating my head against the wall on this one."

You: "Got it. I'll handle it and loop you in on the outcome. Thanks!"
```

**Time:** 30 minutes (investigation + recruiter consult)

---

#### Step 4: Develop Action Plan

**User Action:** Navigate back to escalation, click "Resolution" tab

**System Response:**
- Opens resolution planning workspace

**Screen State (Resolution Tab):**
```
+------------------------------------------------------------------+
| Resolution Plan: ESC-2024-1923                                   |
+------------------------------------------------------------------+
|
| ROOT CAUSE (Confirmed)                                          |
| Requirements too specific for rate offered. Only ~50 candidates  |
| nationwide meet "Healthcare AND Retail + 10 years" criteria.     |
| Market rate for this profile is $90-110/hr, client offering $75.|
|                                                                  |
+------------------------------------------------------------------+
|
| RESOLUTION OPTIONS                                              |
|                                                                  |
| Option 1: INCREASE RATE (Recommended)                           |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Proposal: Increase rate from $75 to $90/hour                │ |
| │ Rationale: Aligns with market rate for dual-industry expert │ |
| │ Impact:                                                      │ |
| │ • Candidate pool expands from 2 to ~15 (7x increase)        │ |
| │ • Expected time-to-fill: 7-10 days (from current 18+)       │ |
| │ • Cost increase: $15/hr × 40hr/wk × 26wk = ~$15,600        │ |
| │   (assuming 6-month contract)                               │ |
| │                                                             │ |
| │ Pros: Solves problem definitively, maintains quality bar    │ |
| │ Cons: Client budget may not allow for 20% rate increase    │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| Option 2: RELAX REQUIREMENTS                                    |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Proposal: Change "Healthcare AND Retail" to                 │ |
| │           "Healthcare OR Retail (prefer both)"              │ |
| │ Rationale: Expands candidate pool without increasing cost   │ |
| │ Impact:                                                      │ |
| │ • Candidate pool expands from 50 to ~800 (16x increase)     │ |
| │ • Expected time-to-fill: 5-7 days                           │ |
| │ • Cost increase: $0                                         │ |
| │                                                             │ |
| │ Pros: No budget impact, fast resolution                     │ |
| │ Cons: May not get "ideal" dual-industry candidate          │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| Option 3: HYBRID APPROACH (Most Flexible)                       |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Proposal: Offer client 2 options to choose from:            │ |
| │   A) Keep requirements, increase rate to $90/hr             │ |
| │   B) Relax to Healthcare OR Retail, keep $75/hr             │ |
| │                                                             │ |
| │ Rationale: Puts decision in client's hands (budget vs ideal)│ |
| │                                                             │ |
| │ Pros: Client feels empowered, collaborative problem-solving │ |
| │ Cons: Requires decision-making, may delay resolution        │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| RECOMMENDED APPROACH: Option 3 (Hybrid)                         |
| Present both options, recommend Option 1 if budget allows.      |
|                                                                  |
+------------------------------------------------------------------+
|
| ACTION PLAN                                                     |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Step 1: Call client (Jennifer Wu) within 1 hour            │ |
| │         • Acknowledge issue and apologize                   │ |
| │         • Share findings from investigation                 │ |
| │         • Present 2 options with recommendation             │ |
| │         • Get decision or schedule follow-up                │ |
| │                                                             │ |
| │ Step 2: Send summary email (same day)                       │ |
| │         • Recap call discussion                             │ |
| │         • Confirm client's decision                         │ |
| │         • Outline next steps and timeline                   │ |
| │                                                             │ |
| │ Step 3: Brief recruiter on outcome (within 24 hours)        │ |
| │         • Share client decision                             │ |
| │         • Adjust search parameters                          │ |
| │         • Set expectations on submissions                   │ |
| │                                                             │ |
| │ Step 4: Monitor progress closely (first week)               │ |
| │         • Daily check-ins with recruiter                    │ |
| │         • Review candidates before client submission        │ |
| │         • Proactive updates to client                       │ |
| │                                                             │ |
| │ Step 5: Close escalation when resolved                      │ |
| │         • Document outcome and lessons learned              │ |
| │         • Update account health score                       │ |
| │         • Share learnings with recruiting team              │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
+------------------------------------------------------------------+
| [Save Plan] [Execute Step 1: Call Client]                       |
+------------------------------------------------------------------+
```

**User Action:** Review plan, click "Save Plan"

**System Response:**
- Resolution plan saved
- Tasks auto-created for each step
- Ready to execute

**Time:** 15 minutes

---

### PHASE 3: CLIENT COMMUNICATION & RESOLUTION (2-4 hours)

#### Step 5: Call Client to Acknowledge and Resolve

**User Action:** Click "Execute Step 1: Call Client"

**System Response:**
- Opens call prep screen with talking points
- Provides client contact info
- Starts SLA timer for call (track response time)

**User Action:** Call Jennifer Wu (Hiring Manager) at 4:15 PM

**Call Flow (20-minute conversation):**

**Minutes 0-3: Acknowledge & Apologize**
```
AM: "Hi Jennifer, this is [Name] from InTime. I wanted to reach out
     about the Senior UX Designer role. Do you have 15-20 minutes to
     discuss?"

[Jennifer: "Yes, I do. I'm glad you called. I've been frustrated with
 the candidates we've been getting."]

AM: "I completely understand your frustration, and I apologize. You
     deserve better quality from us. I wanted to dig into what's
     happening and make sure we get this right."
```

**Minutes 3-10: Share Investigation Findings**
```
AM: "I spent the last hour reviewing the job requirements and the three
     candidates we submitted. I found some important insights I want to
     share with you.

     First, let me address the candidates themselves:
     • Candidate 1 (Alex Thompson) - You mentioned he lacked retail
       experience, but actually he has 8 years of retail UX on his
       resume. I'm wondering if there was a miscommunication or if the
       resume wasn't clear?

     • Candidate 2 (Maria Garcia) - You said her portfolio didn't show
       healthcare work, but it actually does. I'm wondering if there
       was a technical issue with the portfolio link?

     • Candidate 3 (John Lee) - You're 100% right on this one. He only
       has 5 years experience, not the 10+ required. That was our
       mistake, and I apologize. He should not have been submitted."

[Jennifer: "Hmm, I may have misread Alex's resume. I was reviewing them
 quickly. And yes, Maria's portfolio link didn't work when I clicked it."]

AM: "That's helpful context. So it sounds like Candidates 1 and 2 may
     actually be worth a second look if we can fix those issues. But I
     want to address the bigger picture..."
```

**Minutes 10-18: Present Options & Recommendation**
```
AM: "I did some market research on the UX Designer profile you need.
     The combination of Healthcare AND Retail experience with 10+ years
     is extremely rare - there are only about 50 people nationwide who
     fit that exact profile.

     The market rate for that profile is $90 to $110 per hour. Your
     current rate of $75/hour is about 17-32% below market, which makes
     it very difficult to attract those candidates.

     This explains why we've been struggling. The good news is we have
     two options to solve this:

     Option A: Increase the rate to $90/hour
     • This aligns with market rate
     • Expands candidate pool from 2 to about 15 qualified people
     • We could fill this in 7-10 days
     • Cost increase is about $15,600 over a 6-month contract

     Option B: Relax the requirements to Healthcare OR Retail
     • Keeps the $75/hour rate
     • Massively expands the candidate pool to 800+ people
     • We could fill this in 5-7 days
     • No budget impact

     Honestly, if your budget allows, I recommend Option A. You'll get
     the exact dual-industry expert you're looking for. But if budget is
     tight, Option B will still get you a very strong candidate.

     What are your thoughts?"
```

**Minutes 18-20: Get Decision & Confirm Next Steps**
```
[Jennifer: "I really want someone with both industries, but I need to
 check with my budget. Can I let you know by tomorrow morning?"]

AM: "Absolutely. Take whatever time you need. I'll follow up this
     conversation with an email summarizing everything we discussed,
     including the two options and their trade-offs.

     In the meantime, would you be open to taking a second look at Alex
     Thompson (Candidate 1)? If his 8 years of retail experience works
     for you, that could be a quick win while we figure out the budget
     question."

[Jennifer: "Yes, let me review his resume again tonight. I may have been
 too quick to dismiss him."]

AM: "Perfect. I'll resend his profile with the retail experience
     highlighted. And I'll get you that summary email within the hour.

     Again, I apologize for the rocky start on this role. We're going to
     make this right. You have my cell if anything comes up before
     tomorrow."

[Jennifer: "Thank you, I appreciate you taking the time to dig into this
 and give me options. Talk tomorrow."]
```

**Post-Call Actions:**

**User Action:** Immediately log call in InTime

**System Response:**
- Opens call log form (pre-filled with escalation context)

**Screen State (Call Log):**
```
+------------------------------------------------------------------+
| Log Call: Jennifer Wu (GlobalTech - UX Escalation)         [×]   |
+------------------------------------------------------------------+
| Duration: 22 minutes                  Sentiment: 😊 Positive     |
+------------------------------------------------------------------+
|
| CALL SUMMARY                                                    |
| [                                                              ] |
| [Great call - Jennifer was receptive and appreciative.         ] |
| [                                                              ] |
| [KEY OUTCOMES:                                                 ] |
| [1. Acknowledged frustration and apologized                    ] |
| [2. Clarified candidate feedback (Alex had retail, Maria's     ] |
| [   portfolio link broken, John was recruiter error)           ] |
| [3. Presented market data: $75/hr is 17-32% below market       ] |
| [4. Offered 2 options:                                         ] |
| [   A) Increase rate to $90/hr (my recommendation)             ] |
| [   B) Relax to Healthcare OR Retail at $75/hr                 ] |
| [5. Jennifer will decide by tomorrow morning (Dec 1)           ] |
| [6. Jennifer will review Alex Thompson again tonight           ] |
| [                                                              ] |
| [SENTIMENT: Positive. Jennifer appreciated transparency and    ] |
| [problem-solving approach. Frustration de-escalated.           ] |
| [                                                              ] |
|                                                                  |
| NEXT ACTIONS                                                    |
| ☐ Send summary email to Jennifer (within 1 hour)                |
| ☐ Resend Alex Thompson profile with retail exp highlighted      |
| ☐ Follow up tomorrow AM if no decision received                 |
| ☐ Brief recruiter Sarah on outcome                              |
|                                                                  |
+------------------------------------------------------------------+
| [Save & Close]                                                   |
+------------------------------------------------------------------+
```

**User Action:** Click "Save & Close"

**System Response:**
- Call logged
- Escalation status updated: "Awaiting Client Decision"
- SLA status: Response completed within 2 hours (well within 4-hour SLA)
- Tasks auto-created from "Next Actions"

**Time:** 20 minutes (call) + 5 minutes (logging)

---

#### Step 6: Send Follow-Up Email

**User Action:** Navigate to escalation, click "Send Summary Email"

**System Response:**
- Opens email composer with auto-generated draft

**Generated Email:**
```
To: Jennifer Wu <jwu@globaltech.com>
CC: Sarah Chen <schen@intime.com> (Recruiter)
Subject: UX Designer Role - Options & Next Steps

Hi Jennifer,

Thank you for taking time to speak with me this afternoon. I wanted to
recap our conversation and confirm next steps.

SITUATION SUMMARY:
After investigating the 3 candidate rejections, I found:
• Candidate 1 (Alex Thompson): Has 8 years retail UX experience (may
  have been missed on initial review)
• Candidate 2 (Maria Garcia): Portfolio link was broken (we'll resend
  working link)
• Candidate 3 (John Lee): Our error - only 5 years experience vs 10+
  required. Should not have been submitted. Apologies.

MARKET ANALYSIS:
The requirement for "Healthcare AND Retail experience + 10+ years" is
very specific. Market data shows:
• Only ~50 candidates nationwide meet this exact profile
• Market rate for this profile: $90-110/hour
• Current rate ($75/hour): 17-32% below market

This explains the difficulty in attracting qualified candidates.

OPTIONS TO RESOLVE:

Option A: Increase Rate to $90/hour (Recommended)
• Aligns with market rate for dual-industry UX experts
• Expands candidate pool from 2 to ~15 qualified professionals
• Expected time-to-fill: 7-10 days
• Cost impact: +$15,600 over 6-month contract

Option B: Relax Requirements to "Healthcare OR Retail"
• Keeps current $75/hour rate
• Expands candidate pool to 800+ UX designers
• Expected time-to-fill: 5-7 days
• Cost impact: $0 (no budget increase)

NEXT STEPS:

1. You'll review Alex Thompson's profile again tonight (resent
   separately with retail experience highlighted)

2. You'll confirm budget decision by tomorrow morning (Dec 1):
   • Option A (increase to $90/hr), or
   • Option B (relax to Healthcare OR Retail)

3. Once decision is made, we'll adjust search and deliver 2-3 new
   submissions within 5-7 days

I'm confident we can resolve this quickly once we align on the approach.
Please let me know if you have any questions or need additional
information to make the decision.

Thank you for your partnership and patience as we work through this!

Best regards,
[Name]
Account Manager, InTime
[Phone] | [Email]

Attachments:
• Alex_Thompson_Profile_Retail_Highlighted.pdf
• UX_Designer_Market_Rate_Data.pdf
```

**User Action:** Review email, send

**System Response:**
- Email sent
- Activity logged
- Escalation timeline updated

**Time:** 10 minutes

---

#### Step 7: Client Decision & Resolution Execution

**Next Morning (Dec 1, 9:15 AM):**

**Email from Jennifer:**
```
From: Jennifer Wu <jwu@globaltech.com>
Subject: Re: UX Designer Role - Options & Next Steps

Hi [Name],

Thank you for the thorough analysis and options.

Two updates:

1. I reviewed Alex Thompson's profile again last night. You're right - I
   totally missed his retail experience the first time. I was skimming
   too quickly. I'd like to move forward with interviewing him. Can you
   coordinate with your recruiter to schedule?

2. I spoke with my Director this morning about the budget. We can
   increase the rate to $85/hour (splitting the difference). Will that
   help attract candidates?

Let me know if $85/hr works, and please get Alex scheduled for an
interview ASAP. I'd like to meet him this week if possible.

Thanks,
Jennifer
```

**User Action:** Log email as activity

**User Action:** Update escalation with client decision

**User Action:** Immediately coordinate with recruiter Sarah

**Slack Message to Sarah:**
```
You: "Sarah! Great news on GlobalTech UX role:

      1. Client will interview Alex Thompson (she re-reviewed, realized
         she missed his retail exp). Can you schedule ASAP - ideally this
         week?

      2. Client approved rate increase to $85/hr (up from $75). This
         should help us attract better candidates.

      Update the job rate in system and let's get 2-3 more submissions
      by end of week. Sound good?"

Sarah: "Amazing! Yes, I'll schedule Alex today. And $85/hr makes a HUGE
        difference - I can reach out to the candidates I couldn't afford
        before. On it!"

You: "Perfect. Keep me posted on interview schedule and new submissions.
      I want to keep Jennifer updated proactively."
```

**User Action:** Reply to Jennifer's email

**Reply Email:**
```
To: Jennifer Wu <jwu@globaltech.com>
Subject: Re: UX Designer Role - Options & Next Steps

Hi Jennifer,

Fantastic news on both fronts!

1. Alex Thompson Interview: Sarah (your recruiter) is scheduling his
   interview today. She'll coordinate directly with you on timing. I
   know you wanted this week, so we'll make it happen.

2. Rate Increase to $85/hour: This is great and will absolutely help.
   While it's not quite the $90/hr market rate, it's much more
   competitive than $75 and should attract quality candidates. I've
   updated the job in our system.

Sarah will also submit 2-3 additional candidates by end of this week
(Dec 5) at the new $85/hr rate. These will be carefully screened to
ensure they meet all requirements.

Thank you for being flexible and collaborative on this. We're going to
get you the right person!

Best regards,
[Name]
```

**User Action:** Update escalation status to "Resolved - Rate Increase & Candidate Re-Review"

**System Response:**
- Escalation marked as resolved
- Resolution time: 18 hours (from creation to resolution)
- Outcome: Positive (client satisfied, issue resolved)
- Account health score recalculated: 78 → 82 (+4 points for quick resolution)

**Time:** 15 minutes

---

### PHASE 4: FOLLOW-UP & LESSONS LEARNED (1 week later)

#### Step 8: Monitor Resolution & Follow Up

**One Week Later (Dec 8):**

**Status Check:**
- Alex Thompson interviewed on Dec 3 → Client loved him → Offer extended Dec 4 → Accepted Dec 5
- Sarah submitted 3 additional candidates at $85/hr → 2 in interview stage
- Client satisfaction restored

**User Action:** Navigate to escalation, click "Close Escalation"

**System Response:**
- Opens escalation closure form

**Screen State (Close Escalation):**
```
+------------------------------------------------------------------+
| Close Escalation: ESC-2024-1923                            [×]   |
+------------------------------------------------------------------+
|
| RESOLUTION SUMMARY                                              |
|                                                                  |
| Final Outcome *                                                 |
| [● Issue Resolved - Client Satisfied]                           |
| [○ Issue Resolved - Client Neutral]                             |
| [○ Issue Resolved - Client Still Frustrated]                    |
| [○ Escalated Further (to Director)]                             |
| [○ Could Not Resolve]                                           |
|                                                                  |
| Resolution Description                                          |
| [                                                              ] |
| [Client approved rate increase to $85/hr (from $75). This      ] |
| [unlocked better candidate pool. Additionally, client re-reviewed]|
| [Candidate 1 (Alex Thompson) and realized she'd missed his     ] |
| [retail experience. Alex was interviewed, received offer, and  ] |
| [accepted within 1 week of escalation creation.                ] |
| [                                                              ] |
| [3 additional candidates submitted at new rate. 2 in interview ] |
| [stage. Client is very satisfied with turnaround.              ] |
| [                                                              ] |
|                                                        0/1000   |
|                                                                  |
| Time to Resolve: 7 days (from creation to placement acceptance) |
|                                                                  |
+------------------------------------------------------------------+
|
| ROOT CAUSE (For Learning)                                       |
| [● Rate Below Market] [☐ Quality Issue] [☐ Process Breakdown]   |
| [☐ Communication Gap] [☐ Client Expectations] [☐ Other]         |
|                                                                  |
| Contributing Factors (Select all that apply)                    |
| [☑] Client did not thoroughly review candidates                 |
| [☑] Recruiter error (submitted underqualified candidate)        |
| [☑] Market rate not researched during job intake                |
| [☐] Job description unclear                                     |
| [☐] Recruiter lacks expertise in role type                      |
|                                                                  |
+------------------------------------------------------------------+
|
| LESSONS LEARNED                                                 |
| What can we do differently to prevent similar escalations?      |
| [                                                              ] |
| [1. PROCESS IMPROVEMENT: Add market rate analysis during job   ] |
| [   intake. If client rate is >15% below market for specific   ] |
| [   requirements, flag immediately and discuss with client.    ] |
| [                                                              ] |
| [2. RECRUITER TRAINING: Remind team to double-check years of   ] |
| [   experience before submitting. Sarah acknowledged her error.] |
| [                                                              ] |
| [3. CLIENT EDUCATION: Create "How to Review Resumes" guide for ] |
| [   clients to ensure thorough candidate evaluation.           ] |
| [                                                              ] |
| [4. TECHNICAL FIX: Check all portfolio/resume links before     ] |
| [   sending to client (Candidate 2's link was broken).         ] |
| [                                                              ] |
|                                                        0/2000   |
|                                                                  |
+------------------------------------------------------------------+
|
| IMPACT ON ACCOUNT                                               |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Before Escalation:  Health Score 78/100 (Yellow)           │ |
| │ After Resolution:   Health Score 82/100 (Green)             │ |
| │                                                             │ |
| │ Client Sentiment:   Frustrated → Satisfied                  │ |
| │ Churn Risk:         15% → 8% (-7 points)                    │ |
| │ Relationship:       Strengthened through transparent         │ |
| │                     problem-solving                         │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
+------------------------------------------------------------------+
|
| SHARE LEARNINGS                                                 |
| ☑ Share with recruiting team (prevent future similar issues)    |
| ☑ Add to knowledge base (market rate analysis process)          |
| ☐ Escalate to leadership (systemic issue)                       |
|                                                                  |
+------------------------------------------------------------------+
| [Cancel]  [Close Escalation & Save Learnings]                   |
+------------------------------------------------------------------+
```

**User Action:** Fill in all fields, click "Close Escalation & Save Learnings"

**System Response:**
- Escalation marked as CLOSED
- Lessons learned saved to knowledge base
- Email sent to recruiting team with process improvements
- Account health score finalized at 82/100
- AM performance metrics updated:
  - Escalations resolved: +1
  - Average resolution time: 7 days (within target)
  - Client satisfaction post-resolution: 9/10
- Toast: "Escalation closed. Great work resolving this issue!"

**Time:** 15 minutes

---

## Postconditions

1. ✅ Escalation received and ownership taken
2. ✅ Root cause identified through investigation
3. ✅ Client contacted within SLA (4 hours for P1)
4. ✅ Resolution options presented to client
5. ✅ Client decision obtained and executed
6. ✅ Issue fully resolved (candidate placed)
7. ✅ Escalation closed with lessons learned documented
8. ✅ Account health score improved
9. ✅ Process improvements identified and shared with team
10. ✅ Client relationship strengthened through transparent problem-solving

---

## Events Logged

| Event | Payload |
|-------|---------|
| `escalation.created` | `{ escalation_id, account_id, severity, issue_type, created_by }` |
| `escalation.assigned` | `{ escalation_id, assigned_to, assigned_at }` |
| `escalation.status_changed` | `{ escalation_id, old_status, new_status, user_id }` |
| `escalation.sla_response` | `{ escalation_id, response_time_minutes, sla_met: true/false }` |
| `escalation.resolved` | `{ escalation_id, resolution_time_hours, outcome, root_cause }` |
| `escalation.closed` | `{ escalation_id, lessons_learned, improvements_identified }` |
| `account.health_updated` | `{ account_id, old_score, new_score, trigger: 'escalation_resolved' }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| SLA Breach | Response took too long | "SLA breached: P1 response due in 4h, actual: 5h" | Notify manager, document reason |
| Cannot Contact Client | Phone/email unresponsive | N/A (no system error) | Try alternative contacts, escalate to exec sponsor |
| Resolution Failed | Client rejects all options | N/A | Escalate to Sales Director for intervention |
| Escalation Data Missing | Job or candidate deleted | "Cannot load job details for this escalation" | Manually gather info from recruiter |
| Duplicate Escalation | Same issue created twice | "Similar escalation exists: ESC-2024-1922" | Merge escalations or close duplicate |

---

## Field Specifications

### Escalation Severity

| Property | Value |
|----------|-------|
| Field Name | `severity` |
| Type | Dropdown (Select) |
| Label | "Severity" |
| Required | Yes |
| Default | P2 (Medium) |
| Options | |
| - `p0` | "P0 - Critical" - Client production halt, legal threat, exec escalation |
| - `p1` | "P1 - High" - Major quality issue, client very frustrated, revenue risk |
| - `p2` | "P2 - Medium" - Process delay, moderate dissatisfaction, fixable issue |
| - `p3` | "P3 - Low" - Minor issue, feature request, general inquiry |

**SLA Response Times by Severity:**
| Severity | Response SLA | Resolution SLA |
|----------|--------------|----------------|
| P0 | 1 hour | 4 hours |
| P1 | 4 hours | 24 hours |
| P2 | 24 hours | 1 week |
| P3 | 48 hours | 2 weeks |

### Escalation Issue Type

| Property | Value |
|----------|-------|
| Field Name | `issueType` |
| Type | Multi-Select Dropdown |
| Label | "Issue Type" |
| Required | Yes |
| Options | |
| - `quality` | "Candidate Quality" - Client rejects candidates, skills mismatch |
| - `timeline` | "Timeline/Speed" - Too slow to fill, missed deadlines |
| - `billing` | "Billing/Invoice" - Payment disputes, invoice errors |
| - `communication` | "Communication" - Unresponsive, poor updates |
| - `contractor_performance` | "Contractor Performance" - Placed contractor underperforming |
| - `contractor_no_show` | "Contractor No-Show" - Contractor didn't start/ghosted |
| - `contract_dispute` | "Contract Dispute" - Rate, terms, MSA issues |
| - `relationship` | "Relationship" - Client unhappy with AM/recruiter |
| - `other` | "Other" (requires description) |

### Escalation Outcome

| Property | Value |
|----------|-------|
| Field Name | `outcome` |
| Type | Radio Button Group |
| Label | "Final Outcome" |
| Required | Yes (when closing) |
| Options | |
| - `resolved_satisfied` | "Issue Resolved - Client Satisfied" |
| - `resolved_neutral` | "Issue Resolved - Client Neutral" |
| - `resolved_frustrated` | "Issue Resolved - Client Still Frustrated" |
| - `escalated` | "Escalated Further" (to Director/VP) |
| - `unresolved` | "Could Not Resolve" |

---

## Escalation Resolution Benchmarks

### Resolution Time by Severity

| Severity | Target Resolution Time | Good | Acceptable | Poor |
|----------|------------------------|------|------------|------|
| P0 | 4 hours | <2h | 2-4h | >4h |
| P1 | 24 hours | <12h | 12-24h | >24h |
| P2 | 1 week | <3 days | 3-7 days | >7 days |
| P3 | 2 weeks | <1 week | 1-2 weeks | >2 weeks |

### Client Satisfaction Post-Resolution

| Outcome | Typical % | Account Health Impact |
|---------|-----------|----------------------|
| Resolved - Satisfied | 60-70% | +2 to +5 points |
| Resolved - Neutral | 20-25% | 0 to +1 points |
| Resolved - Frustrated | 5-10% | -2 to 0 points |
| Escalated/Unresolved | 5% | -5 to -10 points |

### AM Performance Expectations

| Metric | Target |
|--------|--------|
| SLA Response Rate | >95% (respond within SLA) |
| Resolution Rate | >90% (resolve without escalating) |
| Client Satisfaction (post-resolution) | 8+/10 average |
| Avg Resolution Time (P1) | <12 hours |
| Escalations per Account per Quarter | <2 |

---

## Alternative Flows

### A1: P0 Critical Escalation (Immediate Response)

1. Receive P0 escalation (e.g., contractor walked off job, client threatening legal action)
2. Drop everything, respond within 1 hour
3. Immediately call client (don't wait for investigation)
4. Involve Director/VP if needed
5. Provide hourly updates until resolved
6. Resolve within 4 hours or escalate to leadership

### A2: Escalation to Director/VP

1. AM attempts resolution, but client demands higher authority
2. Brief Director/VP on situation, provide full context
3. Director/VP takes over communication
4. AM supports in background (gather data, coordinate recruiter, etc.)
5. Director/VP resolves and hands back to AM for follow-up
6. AM documents learnings and closes escalation

### A3: Recurring Escalation Pattern

1. Same account has 3+ escalations in 30 days
2. AM identifies pattern (systemic issue, not isolated incidents)
3. Schedule urgent meeting with client + recruiting manager
4. Conduct root cause analysis (recruiter change? Process breakdown?)
5. Develop comprehensive improvement plan
6. Weekly check-ins until pattern breaks

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Escalation handling as part of daily routine
- [02-manage-account.md](./02-manage-account.md) - Escalations impact account health
- [03-client-meeting.md](./03-client-meeting.md) - Addressing challenges in QBR
- [04-expand-account.md](./04-expand-account.md) - Risk: Escalations delay expansion

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create P1 escalation | SLA timer starts, notifications sent |
| TC-002 | AM takes ownership | Status changes, recruiter notified |
| TC-003 | Respond within SLA | SLA marked as met, no breach alert |
| TC-004 | Miss SLA deadline | Breach alert sent to manager |
| TC-005 | Resolve escalation | Account health recalculated |
| TC-006 | Document lessons learned | Learnings saved to knowledge base |
| TC-007 | Close escalation | Metrics updated, team notified |
| TC-008 | Escalate to Director | Ownership transferred, notifications sent |

---

*Last Updated: 2025-11-30*
