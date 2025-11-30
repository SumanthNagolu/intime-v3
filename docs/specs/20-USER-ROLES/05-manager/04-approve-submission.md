# Use Case: Approve High-Value Submission

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-MGR-003 |
| Actor | Manager |
| Goal | Review and approve submissions that exceed normal parameters or require manager oversight |
| Frequency | 1-3 times per week |
| Estimated Time | 5-15 minutes per approval |
| Priority | Medium (important but not daily) |

---

## Preconditions

1. User is logged in as Manager
2. Manager is assigned to an active pod
3. IC has created a submission that requires approval
4. Submission is flagged as "Pending Approval"
5. Submission is assigned to manager's pod

---

## Trigger

One of the following:
- IC submits candidate with rate above job maximum
- IC submits candidate with rate below job minimum
- Submission margin is negative or very low (<10%)
- Placement is high-value (>$150/hr bill rate)
- Submission to strategic account (requires manager review)
- System auto-flags submission based on approval rules

---

## When Submissions Require Approval

### Automatic Approval Triggers

| Condition | Threshold | Reason |
|-----------|-----------|--------|
| Rate Above Job Max | Bill rate > job.maxBillRate | Ensure client won't reject |
| Rate Below Job Min | Bill rate < job.minBillRate | Ensure margin is acceptable |
| Low Margin | Margin % < 10% | Profitability concern |
| Negative Margin | Bill rate < pay rate | Loss on placement |
| High Bill Rate | Bill rate > $150/hr | High-value placement |
| Strategic Account | Account.isStrategic = true | Relationship sensitive |
| First Submission to Client | IC's first submission to this account | Training/quality check |
| Candidate Resubmission | Candidate previously rejected by client | Need justification |

### Optional Approval (Manager Can Configure)

- All submissions by new ICs (first 90 days)
- Submissions to top 10 accounts
- Submissions with custom rate structures
- Contract-to-hire placements

---

## Main Flow (Click-by-Click)

### Step 1: Receive Approval Notification

**System Action:** Submission is flagged for approval

**Notification Channels:**
1. **In-App Notification:**
   - Yellow badge on Pod Dashboard: "⚠️ 1 Pending Approval"
   - "Approvals" tab shows count
   - Toast notification: "Mary Jones submitted candidate for approval"

2. **Email Notification:**
   - Subject: "[APPROVAL NEEDED] Submission: Michael Chen → Stripe"
   - Body: Summary + link to approval
   - Sent to: manager@intime.com

**Time:** Instant notification

---

### Step 2: Navigate to Approvals Queue

**Option A: From Dashboard**
- Manager viewing Pod Dashboard
- Clicks "Approvals" tab (shows "⚠️ 1 Pending")
- Approval list loads
- Time: ~3 seconds

**Option B: From Email Notification**
- Manager clicks link in email
- Browser opens to approval detail
- Time: ~2 seconds

**URL:** `/employee/manager/approvals/{submission-id}`

---

### Step 3: Review Approval Request

**Screen State:**
```
+------------------------------------------------------------------+
| Submission Approval Request                          [PENDING ⚠️]|
+------------------------------------------------------------------+
| Submission ID: SUB-2024-11-29-042                                 |
| Submitted By: Mary Jones (IC)               Submitted: 8:45 AM   |
| Awaiting Approval: 25 minutes               SLA: 4 hours         |
+------------------------------------------------------------------+
| SUBMISSION OVERVIEW                                               |
| Candidate: Michael Chen                                           |
| Job: Staff Engineer @ Stripe                                      |
| Account: Stripe Inc. (Strategic Account 🌟)                      |
| Client Contact: Sarah Williams (sarah@stripe.com)                 |
+------------------------------------------------------------------+
| APPROVAL TRIGGER                                                  |
| 🔴 Rate Above Job Maximum                                        |
| • Job Max Bill Rate: $110/hr                                     |
| • Submitted Bill Rate: $115/hr                                   |
| • Difference: +$5/hr (4.5% over max)                             |
|                                                                   |
| Secondary Triggers:                                               |
| ⚠️ Strategic Account (requires manager review)                   |
+------------------------------------------------------------------+
| RATE DETAILS                                                      |
| ┌──────────────────┬─────────────┬─────────────┬───────────────┐|
| │                  │ Candidate   │ Job Range   │ Submission    ││
| ├──────────────────┼─────────────┼─────────────┼───────────────┤|
| │ Pay Rate         │ $95/hr      │ N/A         │ $95/hr ✓      ││
| │ Bill Rate        │ $100-110/hr │ $100-110/hr │ $115/hr ⚠️    ││
| │ Margin           │ N/A         │ N/A         │ $20/hr (21%)  ││
| │ Expected Annual  │ N/A         │ N/A         │ ~$240K        ││
| └──────────────────┴─────────────┴─────────────┴───────────────┘|
+------------------------------------------------------------------+
| CANDIDATE PROFILE                                                 |
| Michael Chen - Senior Software Engineer                           |
| Location: San Francisco, CA (On-site OK)                          |
| Experience: 12 years                                              |
| Current Status: Actively Looking                                  |
| Match Score: 98% ⭐⭐⭐⭐⭐                                       |
|                                                                   |
| Key Skills:                                                       |
| ✅ Ruby on Rails (12 years) - Expert                             |
| ✅ Redis (8 years) - Expert                                      |
| ✅ Kafka (6 years) - Advanced                                    |
| ✅ PostgreSQL (10 years) - Expert                                |
| ✅ Team Leadership (5 years) - Led teams of 8+                   |
|                                                                   |
| Previous Experience:                                              |
| • PayPal (2015-2022) - Senior Engineer, Payments Platform        |
| • Square (2012-2015) - Engineer, Transaction Processing          |
+------------------------------------------------------------------+
| JOB REQUIREMENTS                                                  |
| Staff Engineer @ Stripe                                           |
| Required Skills: Ruby, Redis, Kafka, PostgreSQL                   |
| Experience: 8-12 years                                            |
| Location: San Francisco (Hybrid - 3 days/week)                    |
| Rate Range: $100-110/hr                                           |
|                                                                   |
| Critical Requirements:                                            |
| ✅ Payment processing experience (Michael: PayPal, Square)       |
| ✅ Large-scale distributed systems (Michael: Yes)                |
| ✅ Team leadership (Michael: Led teams of 8+)                    |
+------------------------------------------------------------------+
| IC'S JUSTIFICATION FOR APPROVAL                                   |
| Mary's Note:                                                      |
| "Candidate has 12 years of experience with Stripe's exact tech    |
| stack (Ruby, Redis, Kafka). Previously worked at PayPal building  |
| similar payment processing systems. Client emphasized they want   |
| 'the best' and are open to flexibility on rate for exceptional    |
| candidates.                                                       |
|                                                                   |
| Client contact (Sarah @ Stripe) mentioned in our last call:       |
| 'We'll pay more for someone who can hit the ground running.'      |
|                                                                   |
| Michael's PayPal experience is directly relevant - he built the   |
| payment processing platform that handles billions in transactions.|
| This is the strongest candidate I've seen for this role.          |
|                                                                   |
| Recommending $115/hr ($5 above max) given:                        |
| 1. Candidate's exceptional experience (12 yrs vs 8-12 required)   |
| 2. Direct industry experience (PayPal, Square)                    |
| 3. Client's stated willingness to pay for quality                 |
| 4. Strong match score (98%)                                       |
| 5. Margin is still healthy (21%)                                  |
+------------------------------------------------------------------+
| SUPPORTING DOCUMENTS                                              |
| 📄 Michael Chen - Resume (Updated Nov 2024)                       |
| 📄 PayPal Reference Letter (4.8/5 rating)                         |
| 📧 Client Email Thread (3 messages - rate flexibility discussed)  |
+------------------------------------------------------------------+
| CLIENT CONTEXT                                                    |
| Account: Stripe Inc.                                              |
| Status: Strategic Account 🌟 (Top 5 by revenue)                  |
| Annual Revenue: $850K                                             |
| Active Placements: 4 contractors                                  |
| Relationship Health: Excellent (NPS: 9/10)                        |
| Last Interaction: Nov 20 - Client call about this role           |
+------------------------------------------------------------------+
| MANAGER DECISION OPTIONS                                          |
| ○ Approve (submit at $115/hr as requested)                       |
| ○ Approve with Note (approve but provide guidance to IC)         |
| ○ Conditional Approve (approve but IC must confirm with client)  |
| ○ Reject (do not submit, provide feedback to IC)                 |
| ○ Request More Info (need additional details before deciding)    |
+------------------------------------------------------------------+
| Manager Notes (visible to IC):                                    |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
|                                                                   |
| [Approve] [Reject] [Request More Info]                           |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Description | Data Source | Required |
|-------|-------------|-------------|----------|
| Approval Trigger | Why approval is needed | Auto-calculated based on rules | Yes |
| Rate Details | Comparison of rates | `submissions`, `jobs`, `candidates` | Yes |
| Candidate Profile | Candidate summary | `candidates` table | Yes |
| Match Score | AI-calculated fit | Matching algorithm | Yes |
| IC's Justification | Why IC wants to proceed | `submissions.approval_notes` | Yes |
| Supporting Documents | Resume, references, etc. | `files` table | Optional |
| Client Context | Account health | `accounts`, `placements` | Yes |

**Manager Action:** Read and analyze the approval request
**Time:** ~5 minutes

---

### Step 4: Review Candidate Profile & Resume

**User Action:** Click "Michael Chen - Resume" attachment

**System Response:** PDF viewer opens in modal

**Manager Reviews:**
- ✅ Resume shows 12 years Ruby experience (verified)
- ✅ PayPal experience 2015-2022 (verified)
- ✅ "Led payment platform team of 8 engineers" (leadership verified)
- ✅ Strong educational background (CS degree from Stanford)
- ✅ Resume is well-formatted and professional

**User Action:** Close resume viewer

**Time:** ~2 minutes

---

### Step 5: Review Client Email Thread

**User Action:** Click "Client Email Thread" attachment

**System Response:** Email thread viewer opens

**Email 1 (Nov 18, 2024):**
```
From: Sarah Williams (Stripe)
To: Mary Jones (InTime)
Subject: Staff Engineer Role - Requirements

Hi Mary,

We're looking for a Staff Engineer with deep Ruby and payment
processing experience. Rate range is $100-110/hr but we're flexible
for the right candidate. Quality is more important than cost on
this one.

Let me know if you find anyone strong.

- Sarah
```

**Email 2 (Nov 20, 2024):**
```
From: Mary Jones (InTime)
To: Sarah Williams (Stripe)
Subject: Re: Staff Engineer Role - Requirements

Hi Sarah,

Perfect timing! I'm actively sourcing and will prioritize candidates
with payment processing backgrounds. Just to clarify - you mentioned
flexibility on rate. What's the absolute max you'd consider for
someone exceptional?

- Mary
```

**Email 3 (Nov 20, 2024):**
```
From: Sarah Williams (Stripe)
To: Mary Jones (InTime)
Subject: Re: Staff Engineer Role - Requirements

For someone with direct payment platform experience at scale,
we'd go up to $120/hr. We want someone who can hit the ground
running and doesn't need much ramp time.

- Sarah
```

**Manager Analysis:**
- ✅ Client explicitly stated flexibility on rate (up to $120/hr)
- ✅ IC's proposed $115/hr is within client's stated max
- ✅ Client prioritizes quality over cost
- ✅ IC did proper discovery before submitting

**User Action:** Close email viewer

**Time:** ~2 minutes

---

### Step 6: Make Approval Decision

**Manager's Internal Analysis:**

**Factors Supporting Approval:**
- ✅ Candidate is exceptionally qualified (98% match, 12 yrs experience)
- ✅ Client explicitly stated willingness to pay up to $120/hr
- ✅ Proposed $115/hr is within client's stated range
- ✅ Margin is healthy (21% = $20/hr)
- ✅ Strategic account relationship is excellent
- ✅ IC did thorough research and has strong justification
- ✅ PayPal experience is highly relevant

**Factors Against Approval:**
- ⚠️ Exceeds job posting's stated max ($110/hr)
- ⚠️ Sets precedent for going above posted max

**Decision:** APPROVE WITH NOTE

**User Action:** Select "Approve with Note" option

**User Action:** Type manager notes

**Screen State:**
```
+------------------------------------------------------------------+
| Manager Decision: Approve with Note                               |
+------------------------------------------------------------------+
| Notes to IC (Mary Jones):                                         |
| [                                                              ]  |
| [ Approving submission at $115/hr. Excellent work on this one! ]  |
| [                                                              ]  |
| [ Your justification was thorough and the client context was  ]  |
| [ perfect. I can see from the email thread that Sarah @ Stripe]  |
| [ explicitly stated flexibility up to $120/hr, so $115 is well]  |
| [ within their range.                                         ]  |
| [                                                              ]  |
| [ Candidate looks exceptional - PayPal payment platform       ]  |
| [ experience is exactly what they need.                       ]  |
| [                                                              ]  |
| [ Two pieces of guidance:                                     ]  |
| [                                                              ]  |
| [ 1. When you submit, mention the rate in your submission     ]  |
| [    notes so Sarah isn't surprised. Reference her email      ]  |
| [    where she said $120 was acceptable.                      ]  |
| [                                                              ]  |
| [ 2. If client pushes back on the $115 rate (unlikely given   ]  |
| [    the email), call me before negotiating down. We may be   ]  |
| [    able to hold firm based on candidate's experience.       ]  |
| [                                                              ]  |
| [ Great job positioning the value. Your submission notes are  ]  |
| [ strong - you clearly articulated why this candidate is      ]  |
| [ worth the premium.                                          ]  |
| [                                                              ]  |
| [ Good luck! Let me know how it goes.                         ]  |
| [                                                              ]  |
| [ - Sarah (Manager)                                           ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Internal Notes (not visible to IC):                               |
| [                                                              ]  |
| [ Mary did excellent discovery work - got client to commit to ]  |
| [ $120 max before finding candidate. This is the right way to ]  |
| [ handle rate flexibility. Will use this as a teaching example]  |
| [ in next team meeting.                                       ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| [Cancel] [Approve Submission]                                    |
+------------------------------------------------------------------+
```

**User Action:** Click "Approve Submission"

**System Response:**
1. **Submission Updated:**
   - `requires_approval = false`
   - `approved_by = manager_id`
   - `approved_at = now()`
   - `approval_notes = [manager notes]`
   - `status = ready_to_submit` (was: pending_approval)

2. **Notifications Sent:**
   - To IC (Mary): "Your submission for Michael Chen has been approved by Sarah Martinez"
   - Email + in-app notification

3. **Activity Logged:**
   - `type: approval_granted`
   - `entity_type: submission`
   - `entity_id: submission_id`
   - `notes: [manager notes]`
   - `approved_by: manager_id`

4. **Dashboard Updated:**
   - Approval removed from "Pending Approvals" queue
   - IC can now submit candidate to client

5. **Toast Notification:**
   - "Submission approved ✓ Mary has been notified"

**Time:** ~5 minutes (decision + notes)

---

### Step 7: IC Submits Candidate (After Approval)

**IC Action:** Mary receives approval notification

**IC Action:** Opens submission, clicks "Submit to Client"

**Submission Email (Auto-Generated from Mary):**
```
To: sarah@stripe.com
Subject: Candidate Submission: Michael Chen - Staff Engineer

Hi Sarah,

I'm excited to submit Michael Chen for your Staff Engineer role.
Michael is an exceptional candidate with 12 years of Ruby experience
and deep payment processing expertise from PayPal and Square.

Candidate Highlights:
• 12 years Ruby on Rails experience (expert level)
• Built payment processing platform at PayPal handling billions
• Led engineering teams of 8+ at PayPal
• Expert in Redis, Kafka, PostgreSQL (your exact stack)
• Can start immediately, available for on-site 3 days/week

Rate: $115/hr
(Based on your email indicating flexibility up to $120/hr for
exceptional candidates with payment platform experience)

Resume and references attached. Michael is available for an
interview next week if you'd like to move forward.

Best regards,
Mary Jones
InTime Recruiting
```

**Client Response (Next Day):**
```
From: Sarah Williams (Stripe)
To: Mary Jones (InTime)
Subject: Re: Candidate Submission: Michael Chen - Staff Engineer

Hi Mary,

Michael looks great! PayPal experience is exactly what we need.
Can we schedule a technical interview for Tuesday 2 PM?

Rate is fine - $115 is within our budget for someone with his
background.

- Sarah
```

**Result:** Submission accepted, interview scheduled ✅

---

## Postconditions

1. ✅ Submission approved or rejected with clear reasoning
2. ✅ IC notified of decision with guidance
3. ✅ If approved: IC can proceed with client submission
4. ✅ If rejected: IC understands why and can adjust
5. ✅ Activity logged for audit trail
6. ✅ Approval removed from pending queue
7. ✅ Manager's notes captured for future reference
8. ✅ Process improvement identified (if applicable)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `submission.flagged_for_approval` | `{ submission_id, trigger_reason, flagged_at, ic_id }` |
| `approval.reviewed` | `{ submission_id, reviewed_by: manager_id, reviewed_at }` |
| `approval.granted` | `{ submission_id, approved_by, approved_at, rate, margin }` |
| `approval.rejected` | `{ submission_id, rejected_by, rejected_at, reason }` |
| `notification.sent` | `{ to: ic_id, type: 'approval_decision', submission_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Submission Not Found | Invalid submission ID | "Submission not found or you don't have access" | Verify ID, check permissions |
| Already Approved | Submission was already approved by another manager | "This submission has already been approved" | No action needed |
| IC Deleted Submission | IC withdrew submission before approval | "This submission has been deleted by the IC" | No action needed |
| Missing Justification | IC didn't provide approval notes | "IC must provide justification before approval" | Request IC to add notes |
| Rate Data Missing | Job or candidate rate data incomplete | "Unable to calculate margin - missing rate data" | Request IC to update submission |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Manager Notes | Recommended for approval or rejection | "Consider adding notes for IC's learning" (warning, not error) |
| Rejection Reason | Required if rejecting | "Please provide a reason for rejection" |
| Conditional Approval | Must specify condition | "Please specify what IC must confirm before submitting" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | Approve |
| `r` | Reject |
| `i` | Request more info |
| `c` | Open candidate profile |
| `j` | Open job detail |
| `Esc` | Close modal |

---

## Alternative Flows

### A1: Reject Submission

**Scenario:** Manager determines submission should not proceed

**User Action:** Select "Reject" option

**Screen State:**
```
+------------------------------------------------------------------+
| Manager Decision: Reject Submission                               |
+------------------------------------------------------------------+
| Reason for Rejection: *                                           |
| ○ Rate too high (client unlikely to accept)                      |
| ○ Candidate not qualified enough                                 |
| ○ Better candidates available                                    |
| ● Need client pre-approval on rate (IC must confirm first)       |
| ○ Other (specify below)                                          |
|                                                                   |
| Feedback to IC:                                                   |
| [                                                              ]  |
| [ I'm rejecting this submission for now because we need client]  |
| [ pre-approval on the $115 rate before submitting.            ]  |
| [                                                              ]  |
| [ While the candidate looks great and the client did mention  ]  |
| [ flexibility, it's best practice to get explicit approval on ]  |
| [ rates above the posted max BEFORE submitting the resume.    ]  |
| [                                                              ]  |
| [ Here's what to do next:                                     ]  |
| [ 1. Call Sarah @ Stripe and say: "I have an exceptional      ]  |
| [    candidate with PayPal payment platform experience. His   ]  |
| [    rate is $115/hr. Is that within your budget?"            ]  |
| [ 2. If she confirms $115 is OK, resubmit for approval        ]  |
| [ 3. If she pushes back, we can discuss negotiation strategy  ]  |
| [                                                              ]  |
| [ This protects our relationship - we don't want to surprise  ]  |
| [ clients with rates above their posted range.                ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| [Cancel] [Reject Submission]                                     |
+------------------------------------------------------------------+
```

**User Action:** Click "Reject Submission"

**System Response:**
- Submission status: `pending_approval` → `rejected_by_manager`
- IC notified with rejection reason
- Submission returns to IC's queue for revision
- Activity logged

### A2: Request More Information

**Scenario:** Manager needs additional details before deciding

**User Action:** Select "Request More Info" option

**Screen State:**
```
+------------------------------------------------------------------+
| Request More Information from IC                                  |
+------------------------------------------------------------------+
| What information do you need?                                     |
| [                                                              ]  |
| [ Please provide:                                             ]  |
| [                                                              ]  |
| [ 1. Candidate's references - can you get a reference from    ]  |
| [    his PayPal manager?                                      ]  |
| [                                                              ]  |
| [ 2. Candidate's availability - when can he start? Client may ]  |
| [    need someone immediately.                                ]  |
| [                                                              ]  |
| [ 3. Salary expectations - is $95/hr his minimum or would he  ]  |
| [    accept less if client negotiates?                        ]  |
| [                                                              ]  |
| [ Once you have this info, resubmit for approval.             ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Urgency:                                                          |
| ○ Low (respond within 2 days)                                    |
| ● Medium (respond within 1 day)                                  |
| ○ High (respond within 4 hours)                                  |
|                                                                   |
| [Cancel] [Request Info]                                          |
+------------------------------------------------------------------+
```

**User Action:** Click "Request Info"

**System Response:**
- Status: `pending_approval` → `info_requested`
- IC notified with info request
- SLA timer pauses until IC responds
- Activity logged

### A3: Conditional Approval

**Scenario:** Approve but IC must confirm something with client first

**User Action:** Select "Conditional Approve" option

**Screen State:**
```
+------------------------------------------------------------------+
| Conditional Approval                                              |
+------------------------------------------------------------------+
| I approve this submission IF:                                     |
| [                                                              ]  |
| [ IC confirms with client that $115/hr is acceptable.         ]  |
| [                                                              ]  |
| [ Mary - please call Sarah @ Stripe and say:                  ]  |
| [ "I have an exceptional candidate with PayPal payment        ]  |
| [  platform experience. His rate is $115/hr which is slightly ]  |
| [  above your posted max of $110. Based on your previous      ]  |
| [  email mentioning flexibility, is this within your budget?" ]  |
| [                                                              ]  |
| [ If Sarah confirms $115 is OK, you can submit the resume.    ]  |
| [ If she pushes back, call me before adjusting the rate.      ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| IC must confirm condition before submitting?                      |
| ● Yes (IC must check box confirming condition met)              |
| ○ No (IC can proceed immediately)                                |
|                                                                   |
| [Cancel] [Conditionally Approve]                                 |
+------------------------------------------------------------------+
```

**User Action:** Click "Conditionally Approve"

**System Response:**
- Status: `pending_approval` → `conditionally_approved`
- IC sees approval with condition checklist
- IC must check "I confirmed with client" before submitting
- Activity logged

---

## Approval Decision Matrix

| Scenario | Typical Decision | Reasoning |
|----------|------------------|-----------|
| Rate 5% above max, client stated flexibility | Approve | Client pre-approved higher rate |
| Rate 5% above max, no client discussion | Conditional Approve | IC must confirm with client first |
| Rate 20% above max | Reject | Too far from posted range, need client approval |
| Negative margin | Reject (or escalate to CEO) | Company loses money |
| Low margin (<10%) | Approve with caution | Document reason, monitor |
| Strategic account, rate slightly high | Approve | Relationship more important than rate |
| First submission by new IC | Approve with coaching notes | Training opportunity |
| Candidate resubmission after rejection | Request More Info | Need justification for resubmit |

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | IC submits candidate with rate above max | Submission flagged, manager notified |
| TC-002 | Manager approves submission | Status changes, IC notified, can proceed |
| TC-003 | Manager rejects submission | Status changes, IC notified with reason, returns to IC |
| TC-004 | Manager requests more info | Status changes, IC notified, SLA pauses |
| TC-005 | Manager gives conditional approval | IC sees approval with conditions, must confirm before submitting |
| TC-006 | IC tries to submit without manager approval | Error: "This submission requires manager approval" |
| TC-007 | Submission with negative margin | Auto-flagged as critical, requires manager approval |

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/trpc/manager.getApprovalQueue` | GET | Fetch pending approvals |
| `/api/trpc/manager.getApprovalDetail` | GET | Fetch submission detail for approval |
| `/api/trpc/manager.approveSubmission` | POST | Approve submission |
| `/api/trpc/manager.rejectSubmission` | POST | Reject submission |
| `/api/trpc/manager.requestMoreInfo` | POST | Request additional information |
| `/api/trpc/submissions.getByIc` | GET | View IC's submissions |

---

## Backend Approval Logic

```typescript
function checkIfApprovalRequired(submission: Submission, job: Job) {
  const approvalReasons: string[] = [];

  // Check rate above max
  if (submission.billRate > job.maxBillRate) {
    approvalReasons.push('rate_above_max');
  }

  // Check rate below min
  if (submission.billRate < job.minBillRate) {
    approvalReasons.push('rate_below_min');
  }

  // Check margin
  const margin = submission.billRate - submission.payRate;
  const marginPercent = (margin / submission.billRate) * 100;

  if (marginPercent < 10) {
    approvalReasons.push('low_margin');
  }

  if (margin < 0) {
    approvalReasons.push('negative_margin');
  }

  // Check high-value
  if (submission.billRate > 150) {
    approvalReasons.push('high_value');
  }

  // Check strategic account
  if (job.account.isStrategic) {
    approvalReasons.push('strategic_account');
  }

  // Check IC experience
  const ic = submission.submittedBy;
  if (ic.tenureDays < 90) {
    approvalReasons.push('new_ic');
  }

  return {
    requiresApproval: approvalReasons.length > 0,
    reasons: approvalReasons,
    priority: approvalReasons.includes('negative_margin') ? 'critical' : 'normal'
  };
}
```

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Approval review is part of daily routine
- [02-pod-dashboard.md](./02-pod-dashboard.md) - Approvals visible on dashboard
- [../01-recruiter/04-submit-candidate.md](../01-recruiter/04-submit-candidate.md) - IC creates submission

---

*Last Updated: 2024-11-30*
