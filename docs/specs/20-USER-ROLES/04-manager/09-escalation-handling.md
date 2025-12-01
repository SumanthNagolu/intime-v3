# Use Case: Escalation Handling - Detailed Process & SLAs

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-MGR-006 |
| Actor | Manager |
| Goal | Handle escalations efficiently with clear processes, SLAs, and resolution tracking |
| Frequency | 1-5 escalations per day (varies by pod) |
| Estimated Time | 15 minutes to 8 hours depending on complexity |
| Priority | Critical (time-sensitive, client/candidate satisfaction) |

---

## Preconditions

1. User is logged in as Manager
2. Manager is assigned to active pod
3. Escalation exists in system (created by IC, client, system, or manager)
4. Escalation is assigned to manager's pod

---

## Trigger

One of the following:
- IC explicitly escalates issue via "Escalate" button
- Client complaint received and flagged as escalation
- Candidate issue requiring manager authority
- System auto-escalates based on business rules
- Manager proactively creates escalation for visibility

---

## Escalation Categories & Definitions

### 1. Client Escalations

| Category | Description | Example | Priority | SLA |
|----------|-------------|---------|----------|-----|
| **Billing Dispute** | Client questions invoice amount or rate | Unauthorized rate increase | Critical | 24h |
| **Performance Issue** | Client unhappy with consultant performance | Consultant missing deadlines | High | 48h |
| **Missed SLA** | InTime failed to meet service commitment | Failed to submit 5 candidates in 48h | High | 24h |
| **Relationship Issue** | General client dissatisfaction | "We're considering other vendors" | Critical | 12h |
| **Contract Dispute** | Disagreement on contract terms | Client wants to reduce rate mid-contract | High | 48h |
| **Communication Breakdown** | Client feels ignored or uninformed | No response to emails for 5+ days | Medium | 24h |

### 2. Candidate Escalations

| Category | Description | Example | Priority | SLA |
|----------|-------------|---------|----------|-----|
| **Ghosting** | Candidate stops responding | Candidate disappeared 3 days before start | Critical | 4h |
| **Counter-Offer** | Candidate received competing offer | Candidate wants $10/hr more | High | 12h |
| **Visa/Immigration Issue** | Work authorization problem | EAD expired, candidate can't start | Critical | 24h |
| **Onboarding Failure** | Candidate can't start as planned | Background check failed | High | 24h |
| **Compensation Dispute** | Disagreement on pay/benefits | Candidate claims different rate was promised | Critical | 12h |
| **Workplace Issue** | Problem at client site | Harassment claim, unsafe conditions | Critical | 2h |

### 3. Internal Escalations

| Category | Description | Example | Priority | SLA |
|----------|-------------|---------|----------|-----|
| **Rate Exception** | Submission needs non-standard rate | Negative margin placement request | Medium | 24h |
| **Process Failure** | System or process broke down | Invoice sent with wrong rate | High | 12h |
| **IC Conflict** | Team members in disagreement | Two ICs claim same placement | Medium | 48h |
| **Compliance Issue** | Regulatory or legal concern | Missing I-9 documentation | Critical | 4h |
| **System Outage** | Technology preventing work | ATS down, can't submit candidates | Critical | 1h |

### 4. Strategic Escalations

| Category | Description | Example | Priority | SLA |
|----------|-------------|---------|----------|-----|
| **Account at Risk** | Major client threatening to leave | $500K account considering termination | Critical | 2h |
| **Competitor Threat** | Client evaluating competitors | Client taking bids from other vendors | High | 24h |
| **Contract Renewal** | High-value renewal requires attention | $1M annual contract up for renewal | High | 48h |
| **Expansion Opportunity** | Upsell opportunity needs executive involvement | Client wants to 3x contract size | Medium | 48h |

---

## Service Level Agreements (SLAs)

### SLA Response Times

| Priority | Response Time | Definition | Escalate To |
|----------|---------------|------------|-------------|
| **Critical** | 1-4 hours | Manager acknowledges and assigns ownership | COO if >4h |
| **High** | 12 hours | Manager reviews and begins investigation | COO if >24h |
| **Medium** | 24 hours | Manager assigns or takes ownership | COO if >48h |
| **Low** | 48 hours | Manager reviews and prioritizes | - |

**Response Time** = Time from escalation creation to manager acknowledgment

### SLA Resolution Times

| Priority | Resolution Time | Definition | Escalate To |
|----------|-----------------|------------|-------------|
| **Critical** | 24 hours | Issue fully resolved or escalated to CEO/COO | CEO |
| **High** | 48 hours | Issue fully resolved or clear path to resolution | COO |
| **Medium** | 72 hours | Issue resolved or documented plan in place | COO |
| **Low** | 5 business days | Issue resolved or converted to project | - |

**Resolution Time** = Time from escalation creation to "Resolved" status

### SLA Breach Consequences

| Breach Type | Consequence | Notification |
|-------------|-------------|--------------|
| Response SLA Missed | Automatic escalation to COO | COO receives alert |
| Resolution SLA Missed | Manager must document reason | COO + CEO receive alert |
| Critical SLA Missed | Executive review required | CEO involved in resolution |
| Pattern of Breaches | Manager performance review | Coaching or removal |

---

## Escalation Severity Matrix

**How to determine priority:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ESCALATION PRIORITY MATRIX               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              High Impact                                    │
│                  ↑                                          │
│         Critical │ Critical                                 │
│         ─────────┼─────────                                 │
│           High   │  High                                    │
│         ─────────┼─────────                                 │
│         Medium   │  Medium                                  │
│         ─────────┼─────────                                 │
│           Low    │   Low                                    │
│                  │                                          │
│ ◄────────────────┼──────────────────►                       │
│         Low Urgency        High Urgency                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Impact Factors:
- Revenue at risk ($0-$10K = Low, $10K-$50K = Medium, $50K+ = High)
- Account type (Transactional = Low, Strategic = High)
- Relationship damage (One-time = Low, Recurring client = High)
- Compliance risk (No legal issue = Low, Regulatory = High)

Urgency Factors:
- Time sensitivity (Can wait = Low, Immediate = High)
- Client/candidate distress level (Calm = Low, Angry = High)
- Business impact (Isolated = Low, Affects multiple = High)
- Escalation source (IC = Low, CEO/Client = High)
```

### Priority Calculation Examples

**Example 1: Client Complaint - Billing Dispute**
- Impact: High (Strategic account worth $200K/year)
- Urgency: High (Client threatening contract termination)
- **Priority: CRITICAL**

**Example 2: Candidate Ghosting**
- Impact: Medium (One placement worth $15K margin)
- Urgency: High (Candidate starts in 3 days)
- **Priority: HIGH**

**Example 3: Rate Exception Request**
- Impact: Low (Single placement, small variance)
- Urgency: Low (Submission not time-sensitive)
- **Priority: MEDIUM**

---

## Main Flow (Click-by-Click)

### Step 1: Receive Escalation Notification

**System Action:** Escalation created by IC, client, or system

**Notification Delivery (Multi-Channel):**

**Channel 1: In-App Notification**
```
+------------------------------------------------------------------+
| 🔴 NEW ESCALATION - CRITICAL                                     |
+------------------------------------------------------------------+
| From: John Smith (IC)                                             |
| Subject: Client complaint - Unauthorized rate increase           |
| Account: Google Inc. ($200K annual revenue)                      |
| Created: Nov 28, 2024 11:47 PM                                   |
| SLA: Respond by 3:47 AM (4 hours)                                |
+------------------------------------------------------------------+
| [View Details] [Take Ownership] [Dismiss]                        |
+------------------------------------------------------------------+
```

**Channel 2: Email Notification**
```
Subject: [CRITICAL] Escalation: Client Complaint - Google Inc.

Hi Sarah,

A CRITICAL escalation has been assigned to your pod:

Escalation ID: ESC-2024-11-28-001
Priority: CRITICAL 🔴
Category: Client Complaint → Billing Dispute
Reporter: John Smith (Technical Recruiter)

Account: Google Inc. (Strategic Account)
Annual Revenue: $200,000
Relationship: 3 years, 12 active placements

Issue Summary:
Client called upset about November invoice showing bill rate of $120/hr
instead of agreed $110/hr. Client threatening to terminate all contracts.

SLA Response Time: 4 hours (Due: Nov 29, 2024 3:47 AM)
SLA Resolution Time: 24 hours (Due: Nov 29, 2024 11:47 PM)

Action Required:
1. Review escalation details
2. Take ownership
3. Contact client within 4 hours

[View Full Details] [Take Ownership Now]

---
This is an automated notification. Do not reply to this email.
```

**Channel 3: SMS (Critical Only)**
```
InTime Alert: CRITICAL escalation from John Smith.
Client complaint - Google Inc. ($200K account at risk).
Respond within 4 hours. Login: https://intime.app/escalations/ESC-2024-11-28-001
```

**Channel 4: Dashboard Badge**
- Red notification badge on sidebar: "Escalations (1)"
- Pod Dashboard shows alert banner: "🔴 1 CRITICAL escalation needs immediate attention"

**Time:** Instant (multi-channel simultaneous delivery)

---

### Step 2: Triage Escalation

**User Action:** Click "View Details" from any notification

**System Response:** Escalation Triage Screen loads

**Screen State:**
```
+------------------------------------------------------------------+
| ESCALATION TRIAGE - ESC-2024-11-28-001             [CRITICAL 🔴] |
+------------------------------------------------------------------+
| SLA STATUS:                                                       |
| Response Due: Nov 29, 3:47 AM (in 3h 52m) ⏱️ [76% time remaining]|
| Resolution Due: Nov 29, 11:47 PM (in 23h 52m)                    |
+------------------------------------------------------------------+
| QUICK ASSESSMENT (Complete to prioritize)                         |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Impact Assessment:                                           │ |
| │ ○ Low ($0-$10K)  ○ Medium ($10-50K)  ● High ($50K+)        │ |
| │                                                              │ |
| │ Urgency Assessment:                                          │ |
| │ ○ Low (Can wait)  ○ Medium (This week)  ● High (Today)     │ |
| │                                                              │ |
| │ Relationship Risk:                                           │ |
| │ ○ None  ○ Minor  ● Severe (Account at risk)                │ |
| │                                                              │ |
| │ Calculated Priority: CRITICAL 🔴 ✓                          │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ISSUE SUMMARY                                                     |
| Category: Client Complaint → Billing Dispute                     |
| Reporter: John Smith (Technical Recruiter)                        |
| Created: Nov 28, 2024 11:47 PM                                   |
+------------------------------------------------------------------+
| Related Entities:                                                 |
| • Account: Google Inc. (Strategic) - $200K annual revenue        |
| • Contact: Jane Doe (Hiring Manager) - jane@google.com          |
| • Placement: Sarah Chen (Senior Developer)                        |
| • Contract: C-2024-08-15-GOOG-001                                |
| • Invoice: INV-NOV-2024-GOOG (Disputed: $1,600 overcharge)       |
+------------------------------------------------------------------+
| Description:                                                      |
| Client called upset about November invoice showing bill rate of  |
| $120/hr instead of the agreed $110/hr. Client states no approval |
| was given for this rate increase. Threatening to terminate all 3 |
| active contracts ($180K annual value).                           |
+------------------------------------------------------------------+
| IMMEDIATE ACTIONS NEEDED                                          |
| ☐ 1. Take ownership (assign to yourself)                         |
| ☐ 2. Review original contract ($110/hr confirmed)                |
| ☐ 3. Contact client directly (apologize, explain, resolve)       |
| ☐ 4. Coordinate with Finance (issue corrected invoice)           |
| ☐ 5. Follow up with IC (debrief, prevent recurrence)             |
+------------------------------------------------------------------+
| RECOMMENDED ACTIONS (AI-Generated)                                |
| Based on 47 similar escalations, recommended approach:           |
| 1. Acknowledge error immediately (don't defend or delay)         |
| 2. Contact client within 2 hours (phone + email)                 |
| 3. Issue corrected invoice same day                              |
| 4. Offer goodwill gesture ($500-$1000 credit)                    |
| 5. Document process failure and implement safeguards             |
|                                                                   |
| Success Rate: 89% (42/47 similar cases resolved without loss)    |
| Average Resolution Time: 8 hours                                  |
+------------------------------------------------------------------+
| [Take Ownership & Start Timer] [Assign to Someone Else] [Defer]  |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Description | Data Source | Purpose |
|-------|-------------|-------------|---------|
| SLA Status | Time remaining until breach | Calculated from `created_at` + SLA rules | Visual urgency indicator |
| Quick Assessment | Manager's impact/urgency evaluation | Manual input | Validate priority |
| Issue Summary | Brief description | `escalations.description` | Quick context |
| Related Entities | Linked objects | `accounts`, `placements`, `contracts` | Full context |
| Immediate Actions | Checklist of next steps | AI-generated + template | Actionable guidance |
| Recommended Actions | Past resolution patterns | ML model analyzing history | Best practice suggestions |

**Manager Analysis (Internal Decision):**
- ✅ Priority is correct (Critical - strategic account at risk)
- ✅ Issue is clear (billing error)
- ✅ Solution path is obvious (apologize, correct invoice)
- ✅ I can handle this myself (no need to escalate to CEO)
- ⏱️ SLA is tight (4 hours to respond) - need to act now

**Time:** ~3 minutes to review and assess

---

### Step 3: Take Ownership & Start Resolution Clock

**User Action:** Click "Take Ownership & Start Timer"

**System Response:**
1. Escalation assigned to manager
2. Status changes: "PENDING" → "IN PROGRESS"
3. Resolution timer starts
4. Notifications sent:
   - IC (John): "Sarah has taken ownership of your escalation"
   - COO: "Escalation ESC-001 assigned to Sarah (Critical)"
5. Activity logged: `type: escalation_claimed`, `timestamp: now()`

**Screen State:**
```
+------------------------------------------------------------------+
| ESCALATION WORKSPACE - ESC-2024-11-28-001          [IN PROGRESS] |
+------------------------------------------------------------------+
| Owner: Sarah Martinez (You)              Claimed: 8:05 AM        |
| SLA Response: ✅ MET (claimed in 3h 52m, target 4h)             |
| SLA Resolution: ⏱️ 23h 48m remaining (due 11:47 PM tonight)     |
+------------------------------------------------------------------+
| [Left Sidebar]        | [Main Workspace]     | [Right Sidebar]   |
| ┌──────────────────┐  | ┌─────────────────┐  | ┌──────────────┐  |
| │ TIMELINE         │  | │ ACTIONS         │  | │ RELATED INFO │  |
| │ (Activity Log)   │  | │ (Resolution)    │  | │ (Context)    │  |
| │                  │  | │                 │  | │              │  |
| │ 8:05 AM          │  | │ ☐ Review docs   │  | │ Account:     │  |
| │ Sarah claimed    │  | │ ☐ Contact client│  | │ Google Inc.  │  |
| │                  │  | │ ☐ Fix invoice   │  | │              │  |
| │ 11:47 PM         │  | │ ☐ Debrief IC    │  | │ Revenue:     │  |
| │ John escalated   │  | │ ☐ Document      │  | │ $200K/year   │  |
| │                  │  | │                 │  | │              │  |
| └──────────────────┘  | └─────────────────┘  | │ Contact:     │  |
|                       |                      | │ Jane Doe     │  |
|                       |                      | │ (415)555-1234│  |
|                       |                      | └──────────────┘  |
+------------------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 4: Execute Resolution Plan

**Resolution checklist automatically expands based on escalation type:**

```
+------------------------------------------------------------------+
| RESOLUTION PLAN - Billing Dispute                                 |
+------------------------------------------------------------------+
| Step 1: INVESTIGATE                                               |
| ☑ Review original contract [View Contract →]                     |
|   → Confirmed: $110/hr agreed on Aug 15, 2024                    |
| ☑ Review disputed invoice [View Invoice →]                       |
|   → Error found: Invoice shows $120/hr (should be $110/hr)       |
| ☑ Calculate overbilling amount                                    |
|   → $1,600 overbilled (160 hours × $10/hr difference)            |
| ☑ Document root cause                                             |
|   → IC used new template on existing contract (process error)    |
+------------------------------------------------------------------+
| Step 2: CONTACT CLIENT                                            |
| ☐ Send apology email [Use Template →]                            |
|   Time: 10 min                                                    |
| ☐ Schedule call with client [Schedule Now →]                     |
|   Target: Within 2 hours                                          |
| ☐ Prepare talking points [AI Suggested Points →]                 |
+------------------------------------------------------------------+
| Step 3: COORDINATE CORRECTIVE ACTIONS                             |
| ☐ Create task for Finance: Issue corrected invoice               |
|   Assignee: Finance Team                                          |
|   Due: Today 5 PM                                                 |
| ☐ Create task for self: Follow-up call with client               |
|   Due: Today 9 AM                                                 |
| ☐ Create task for IC: Contract management training               |
|   Assignee: John Smith                                            |
|   Due: Tomorrow                                                   |
+------------------------------------------------------------------+
| Step 4: RESOLUTION VERIFICATION                                   |
| ☐ Confirm client received corrected invoice                      |
| ☐ Confirm client satisfied with resolution                       |
| ☐ Confirm no further action needed                               |
+------------------------------------------------------------------+
| Step 5: DEBRIEF & PREVENTION                                      |
| ☐ Debrief IC (coaching moment)                                    |
| ☐ Document lessons learned                                        |
| ☐ Implement process improvement                                   |
+------------------------------------------------------------------+
| [Mark Step Complete] [Skip Step] [Add Custom Step]               |
+------------------------------------------------------------------+
```

**User Action:** Manager works through each step, checking off as completed

**Time:** 2-4 hours for full resolution (varies by complexity)

---

### Step 5: Track Progress & Update Stakeholders

**Throughout resolution, manager updates progress:**

**Update Modal (Triggered every 2 hours or at major milestones):**
```
+------------------------------------------------------------------+
| Update Escalation Status                                          |
+------------------------------------------------------------------+
| Current Status: IN PROGRESS                                       |
| Time Elapsed: 3h 15m                                              |
| SLA Resolution: 20h 33m remaining                                 |
+------------------------------------------------------------------+
| Progress Update: *                                                |
| ○ No progress yet                                                |
| ○ Investigation in progress                                      |
| ● Actions being taken                                            |
| ○ Waiting on external party                                      |
| ○ Nearly resolved                                                |
+------------------------------------------------------------------+
| Status Note (visible to stakeholders):                            |
| [                                                              ]  |
| [ Client contacted directly at 9:00 AM. Apologized for error  ]  |
| [ and explained root cause. Client accepted apology. Finance  ]  |
| [ issuing corrected invoice by 5 PM today. Client confirmed   ]  |
| [ relationship intact. Scheduling follow-up next week.        ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Notify:                                                           |
| ☑ IC (John Smith)                                                |
| ☑ COO (for visibility)                                           |
| ☐ Client (not needed at this stage)                              |
+------------------------------------------------------------------+
| [Save Update] [Cancel]                                           |
+------------------------------------------------------------------+
```

**System Response:**
- Progress note added to escalation timeline
- Notifications sent to checked stakeholders
- SLA clock continues running
- Activity logged

**Time:** ~2 minutes per update

---

### Step 6: Resolution & Closure

**When all resolution steps complete:**

**User Action:** Click "Mark Escalation Resolved" button

**System Response:** Resolution Modal opens

**Screen State:**
```
+------------------------------------------------------------------+
| Mark Escalation as RESOLVED                                       |
+------------------------------------------------------------------+
| Current Status: IN PROGRESS                                       |
| Time to Resolution: 9h 13m (SLA: 24h) ✅ WITHIN SLA              |
+------------------------------------------------------------------+
| Resolution Summary: * (Required, min 100 characters)              |
| [                                                              ]  |
| [ ISSUE: Client billed $120/hr instead of contracted $110/hr  ]  |
| [                                                              ]  |
| [ ROOT CAUSE:                                                 ]  |
| [ IC (John) applied new contract template to existing        ]  |
| [ placement without verifying original contract terms.        ]  |
| [                                                              ]  |
| [ ACTIONS TAKEN:                                              ]  |
| [ 1. Reviewed original contract - confirmed $110/hr rate      ]  |
| [ 2. Contacted client directly (email 8:15 AM, call 9:00 AM) ]  |
| [ 3. Apologized and explained error                           ]  |
| [ 4. Coordinated with Finance - corrected invoice issued      ]  |
| [    at 4:30 PM (Total: $17,600 vs incorrect $19,200)        ]  |
| [ 5. Offered $500 goodwill credit on December invoice        ]  |
| [ 6. Debriefed IC - scheduled contract mgmt training          ]  |
| [                                                              ]  |
| [ OUTCOME:                                                    ]  |
| [ ✅ Client accepted apology                                  ]  |
| [ ✅ Corrected invoice delivered and approved                 ]  |
| [ ✅ Relationship intact (client confirmed satisfaction)      ]  |
| [ ✅ Client discussed Q1 expansion (2 new Java roles)         ]  |
| [ ✅ No contracts terminated                                   ]  |
| [                                                              ]  |
| [ PREVENTION:                                                 ]  |
| [ - Added validation step: Check original contract before    ]  |
| [   any rate changes on existing placements                   ]  |
| [ - Updated IC training: New templates apply to NEW contracts ]  |
| [   only, not existing ones                                   ]  |
| [ - Added Finance review requirement for all rate changes     ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Resolution Type:                                                  |
| ● Fully Resolved (issue completely fixed)                        |
| ○ Partially Resolved (temporary solution, more work needed)      |
| ○ Escalated Further (CEO/COO taking over)                        |
| ○ Cannot Resolve (external blocker)                              |
+------------------------------------------------------------------+
| Client Satisfaction:                                              |
| ● Satisfied (client happy with resolution)                       |
| ○ Neutral (client accepted but not happy)                        |
| ○ Unsatisfied (client still has concerns)                        |
+------------------------------------------------------------------+
| Lessons Learned: *                                                |
| [                                                              ]  |
| [ 1. Process gap: No validation when using new templates      ]  |
| [ 2. Training gap: IC didn't understand template scope        ]  |
| [ 3. Communication win: Direct manager contact resolved fast  ]  |
| [ 4. Goodwill gesture ($500 credit) preserved relationship    ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Follow-Up Actions Required:                                       |
| ☑ Create task: Implement contract validation process (CFO)      |
| ☑ Create task: Update IC training materials (HR)                |
| ☑ Create task: Follow up with client next week (Manager)        |
| ☐ No follow-up needed                                            |
+------------------------------------------------------------------+
| Notify Stakeholders:                                              |
| ☑ IC (John Smith) - Resolution summary                           |
| ☑ COO - Critical escalation resolved                             |
| ☑ Finance - Invoice correction confirmed                         |
| ☐ CEO - Not needed for this escalation                           |
| ☐ Client - Already informed via call/email                       |
+------------------------------------------------------------------+
| [Cancel] [Mark as Resolved]                                      |
+------------------------------------------------------------------+
```

**User Action:** Fill in all required fields, click "Mark as Resolved"

**System Response:**
1. Escalation status: "IN PROGRESS" → "RESOLVED"
2. `resolved_at = now()`
3. `resolved_by = manager_id`
4. `resolution_time = 9h 13m` (calculated)
5. SLA status: "✅ WITHIN SLA" (resolved in 9h 13m vs 24h target)
6. Notifications sent to all checked stakeholders
7. Tasks created for follow-up actions
8. Escalation removed from "Active" queue
9. Escalation archived to "Resolved" list
10. Manager performance metrics updated:
    - Escalations resolved: +1
    - Avg resolution time: Updated
    - SLA compliance: +1 (within SLA)
11. Toast: "Escalation ESC-2024-11-28-001 marked as RESOLVED ✓"

**Time:** ~5 minutes

---

## Postconditions

1. ✅ Escalation fully resolved or escalated to higher authority
2. ✅ Client/candidate issue addressed
3. ✅ Root cause identified and documented
4. ✅ IC debriefed (coaching provided)
5. ✅ Process improvements identified
6. ✅ Follow-up actions created and assigned
7. ✅ SLA compliance tracked
8. ✅ Stakeholders notified
9. ✅ Lessons learned captured for future reference
10. ✅ Manager performance metrics updated

---

## Escalation Response Time Benchmarks

### Industry Standards vs InTime Targets

| Priority | Industry Avg | InTime Target | InTime Actual (Q3 2024) |
|----------|--------------|---------------|-------------------------|
| Critical | 8 hours | 4 hours | 3.2 hours ✅ |
| High | 24 hours | 12 hours | 10.5 hours ✅ |
| Medium | 48 hours | 24 hours | 18 hours ✅ |
| Low | 5 days | 48 hours | 36 hours ✅ |

### Resolution Time Benchmarks

| Escalation Type | Avg Resolution | Target | Best Practice |
|-----------------|----------------|--------|---------------|
| Billing Dispute | 12 hours | 24 hours | Same-day resolution |
| Performance Issue | 48 hours | 72 hours | Weekly check-ins |
| Candidate Ghosting | 6 hours | 12 hours | Immediate backup |
| Rate Exception | 4 hours | 24 hours | Pre-approved ranges |
| Contract Dispute | 72 hours | 96 hours | Legal review if needed |

---

## Escalation Prevention Strategies

### Proactive Measures (Reduce Escalation Volume)

**1. Client Communication Cadence**
- Weekly check-ins with strategic accounts
- Bi-weekly updates on all active placements
- Quarterly business reviews (QBRs)
- **Target:** Reduce client escalations by 30%

**2. Candidate Relationship Management**
- Pre-start confirmation calls (3 days before)
- First-week check-ins (day 1, day 3, day 5)
- Monthly satisfaction surveys
- **Target:** Reduce candidate escalations by 40%

**3. Process Validation Gates**
- Contract review before any rate changes
- Finance approval for invoices >$50K
- Double-check visa expiration dates
- **Target:** Reduce process-related escalations by 50%

**4. IC Training & Enablement**
- Quarterly escalation case study reviews
- Role-play difficult conversations
- Shadowing manager on client calls
- **Target:** Reduce IC-generated escalations by 25%

### Early Warning Systems

**Auto-Escalation Triggers (System-Generated):**

| Trigger | Threshold | Action | Owner |
|---------|-----------|--------|-------|
| Client No-Response | 5 days | Alert manager | Manager |
| Candidate No-Response | 3 days | Alert IC, manager | IC first |
| Visa Expiring | 90 days | Alert IC, HR | IC + HR |
| Invoice Overdue | 45 days | Alert Finance, manager | Finance |
| Stale Job | 14 days, 0 submissions | Alert IC, manager | IC |
| Low Client NPS | Score <6 | Alert manager, COO | Manager |
| Placement Failure | 30-day termination | Alert manager, COO | Manager |

---

## Escalation Playbooks (Quick Reference)

### Playbook 1: Billing Dispute

**Immediate Actions (0-2 hours):**
1. Review original contract
2. Review disputed invoice
3. Calculate discrepancy amount
4. Contact client (phone + email)

**Short-Term Actions (2-24 hours):**
1. Coordinate with Finance (corrected invoice)
2. Offer goodwill gesture (if appropriate)
3. Follow up with client (confirm satisfaction)

**Long-Term Actions (24+ hours):**
1. Debrief IC (process training)
2. Implement process safeguards
3. Monitor for recurrence

**SLA:** 24 hours resolution
**Success Metric:** Client accepts resolution, no contract loss

---

### Playbook 2: Candidate Ghosting

**Immediate Actions (0-4 hours):**
1. Attempt to contact candidate (call, email, SMS)
2. Check candidate's last known status
3. Activate backup candidate (if available)
4. Notify client of situation

**Short-Term Actions (4-12 hours):**
1. Continue outreach attempts (emergency contact)
2. Present backup candidate to client
3. Document timeline for future reference

**Long-Term Actions (12+ hours):**
1. Mark candidate as "unreliable" in system
2. Debrief IC (candidate vetting process)
3. Update candidate screening criteria

**SLA:** 12 hours resolution or backup presented
**Success Metric:** Placement slot filled with backup, client satisfied

---

### Playbook 3: Performance Issue

**Immediate Actions (0-12 hours):**
1. Collect specific performance data from client
2. Review placement contract/expectations
3. Contact consultant for their perspective
4. Schedule 3-way call (client, consultant, manager)

**Short-Term Actions (12-48 hours):**
1. Create performance improvement plan (PIP)
2. Set clear expectations and timeline
3. Schedule weekly check-ins (manager, consultant, client)

**Long-Term Actions (48+ hours):**
1. Monitor improvement progress
2. If no improvement: Discuss replacement with client
3. If improvement: Celebrate and document success

**SLA:** 48 hours for initial PIP, 2 weeks for improvement
**Success Metric:** Performance improves OR replacement accepted

---

## Manager Escalation Metrics (Performance Tracking)

### Individual Manager KPIs

| Metric | Target | Measurement | Impact on Performance Review |
|--------|--------|-------------|------------------------------|
| SLA Response Rate | >95% | % escalations responded to within SLA | High |
| SLA Resolution Rate | >90% | % escalations resolved within SLA | High |
| Avg Resolution Time | <target for each priority | Hours from creation to resolution | Medium |
| Escalation Volume Trend | Decreasing | Month-over-month change | Medium |
| Client Satisfaction Post-Resolution | >4.0/5.0 | Client feedback after resolution | High |
| Recurrence Rate | <10% | Same issue escalated again | Low |
| Escalation Prevention Actions | >5 per quarter | Proactive measures implemented | Medium |

### Pod-Level Escalation Metrics

| Metric | Target | Purpose |
|--------|--------|---------|
| Total Escalations per IC | <2 per month | Identify ICs needing coaching |
| Escalation Category Breakdown | Track trends | Identify systemic issues |
| Escalation-to-Client Ratio | <5% | Measure client satisfaction |
| Self-Resolved Escalations (IC) | >30% | Measure IC autonomy |
| Escalated-to-COO/CEO | <5% | Measure manager effectiveness |

---

## Alternative Flows

### A1: Escalation Requires CEO Involvement

**Scenario:** Strategic account threatening lawsuit

1. Manager reviews escalation
2. Manager determines this exceeds their authority
3. Manager clicks "Escalate to CEO" button
4. Modal asks for escalation justification
5. Manager provides context and recommendation
6. CEO receives notification
7. CEO takes ownership OR provides guidance to manager
8. Manager becomes "Consulted" on escalation (visibility, no ownership)

**Example:**
```
Escalation: Google threatening legal action over contract breach
Manager Assessment: "This requires CEO-level negotiation. Legal team
should be involved. I've done initial damage control but client is
demanding executive conversation."
CEO Action: Takes ownership, schedules call with Google's VP
```

---

### A2: Escalation Cannot Be Resolved (External Blocker)

**Scenario:** Candidate visa expired, cannot work until USCIS approves renewal

1. Manager reviews escalation
2. Manager determines resolution is outside InTime's control
3. Manager marks escalation as "Blocked - External"
4. Manager documents:
   - What is blocking resolution
   - When blocker expected to clear
   - What alternatives exist
5. Manager notifies client and IC of status
6. Escalation moves to "On Hold" queue
7. Manager sets reminder to check weekly until cleared

**Example:**
```
Escalation: Candidate's H1B transfer pending (30-60 day wait)
Manager Action: Marked as "Blocked - USCIS processing"
Client Notification: "Candidate cannot start until H1B approved.
We've presented a backup candidate in the meantime."
Status: On Hold until transfer approved
```

---

### A3: Escalation Resolves Before Manager Can Act

**Scenario:** IC handles issue directly after escalating

1. IC escalates issue (e.g., client complaint)
2. Before manager responds, IC contacts client and resolves
3. IC updates escalation: "Resolved - Client accepted my apology"
4. Manager reviews IC's resolution
5. Manager verifies with client (optional)
6. Manager approves resolution OR reopens if insufficient
7. Manager marks as "Resolved by IC" (IC gets credit)
8. Manager uses as positive coaching example in next 1:1

**Example:**
```
Escalation: Client unhappy with candidate quality
IC Action: Called client immediately, apologized, submitted 3 better
candidates same day, client satisfied
Manager Review: Verified with client, confirmed satisfaction
Manager Action: Marked "Resolved by IC", praised John in next 1:1
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | IC escalates critical issue | Manager receives multi-channel notification (app, email, SMS) |
| TC-002 | Manager claims escalation | Status changes to "In Progress", IC notified, SLA timer starts |
| TC-003 | Manager resolves within SLA | Escalation marked resolved, SLA compliance tracked, stakeholders notified |
| TC-004 | Manager misses response SLA | COO receives alert, escalation flagged as overdue |
| TC-005 | Manager escalates to CEO | CEO notified, ownership transferred, manager becomes Consulted |
| TC-006 | Escalation blocked externally | Status changes to "On Hold", reminder set, client/IC notified |
| TC-007 | IC resolves before manager | Manager reviews, approves, marks "Resolved by IC" |
| TC-008 | Client complaint after hours | Manager receives SMS (critical), email (high/medium), notification updated next morning |

---

## Related Use Cases

- [02-pod-dashboard.md](./02-pod-dashboard.md) - Escalations visible on dashboard
- [03-handle-escalation.md](./03-handle-escalation.md) - Original escalation handling flow (high-level)
- [08-coaching-workflow.md](./08-coaching-workflow.md) - Use escalations as coaching opportunities

---

*Last Updated: 2024-11-30*
