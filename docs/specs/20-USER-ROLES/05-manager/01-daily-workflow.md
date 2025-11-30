# Manager Daily Workflow

This document describes a typical day for a Manager, with specific times, actions, and expected system interactions.

---

## Morning Routine (8:00 AM - 10:00 AM)

### 8:00 AM - Login & Pod Dashboard Review

**Step 1: Login**
- User navigates to: `https://app.intime.com/auth/employee`
- User enters email and password
- User clicks "Sign In"
- System redirects to: `/employee/manager/pod` (Pod Dashboard)
- Time: ~10 seconds

**Step 2: Review Pod Dashboard**
- Dashboard loads with pod-level metrics
- Manager sees:
  - **Pod Sprint Progress** - "3/3 placements (100% of target)" with progress bar
  - **Individual IC Performance** - Table showing each IC's metrics
  - **Pipeline Health** - Total jobs, candidates, submissions by stage
  - **Escalations Queue** - Red badge if any pending escalations
  - **Approvals Queue** - Yellow badge if submissions awaiting approval
  - **Recent Activity** - Last 10 activities across pod
- Time: ~2 minutes to scan

**Step 3: Check Overnight Escalations**
- Manager clicks "Escalations" tab
- View shows:
  - Client complaint from 11 PM last night (email auto-logged)
  - Candidate withdrew from interview (IC flagged for help)
  - Submission needs approval (rate slightly above job max)
- Manager clicks first critical item (client complaint)
- Time: ~1 minute

**Example Dashboard:**
```
+------------------------------------------------------------------+
|                      Pod Dashboard - Recruiting Pod A             |
|                                                   [Manager: Sarah]|
+------------------------------------------------------------------+
| Sprint Progress (Nov 15 - Nov 29)                        [3d 12h]|
| ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% (3/3 placements) |
|                                                                   |
| Individual Performance:                                           |
| ┌────────────┬────────────┬─────────┬────────────┬─────────────┐ |
| │ IC         │ Placements │ Pipeline│ Submissions│ Status      │ |
| ├────────────┼────────────┼─────────┼────────────┼─────────────┤ |
| │ John Smith │ 1/1 ✓      │ 12 jobs │ 8 active   │ On Track    │ |
| │ Mary Jones │ 1/1 ✓      │ 10 jobs │ 6 active   │ On Track    │ |
| │ Tom Brown  │ 1/1 ✓      │ 8 jobs  │ 5 active   │ On Track    │ |
| └────────────┴────────────┴─────────┴────────────┴─────────────┘ |
|                                                                   |
| Escalations: [🔴 2 Urgent]  Approvals: [⚠️ 1 Pending]           |
|                                                                   |
| Pipeline Health:                                                  |
| • Active Jobs: 30 (10 per IC avg)                                |
| • Total Candidates in Pipeline: 87                                |
| • Submissions This Week: 12                                       |
| • Interviews Scheduled: 5                                         |
|                                                                   |
| [View Escalations] [View Approvals] [View Full Analytics]        |
+------------------------------------------------------------------+
```

### 8:15 AM - Handle Critical Escalation

**Step 4: Client Complaint - Rate Increase Issue**
- Manager clicks on escalation: "Client upset about rate increase mid-contract"
- Escalation detail opens:
  - **Original Reporter:** IC (John Smith)
  - **Client:** Google Inc. (Strategic Account)
  - **Issue:** Bill rate increased from $110/hr to $120/hr without client approval
  - **Impact:** High (may lose account)
  - **IC's Note:** "I updated the rate per the new contract template. Client says this wasn't approved."

**Screen State:**
```
+------------------------------------------------------------------+
| Escalation: Unauthorized Rate Increase                    [URGENT]|
+------------------------------------------------------------------+
| Reported By: John Smith (IC)                  Created: 11:47 PM  |
| Account: Google Inc.                          Priority: Critical |
| Placement: Sarah Chen (Senior Developer)                         |
| Contact: Jane Doe (Hiring Manager) - jane@google.com            |
+------------------------------------------------------------------+
| Description:                                                      |
| Client called upset about November invoice. Bill rate shows      |
| $120/hr instead of agreed $110/hr. Client states no approval     |
| was given for increase. Candidate has been working for 3 months. |
|                                                                   |
| IC Note: "I used the new contract template which has the updated |
| rate structure. I thought this was automatic. Client is very     |
| upset and threatening to end all contracts. Need help ASAP."     |
+------------------------------------------------------------------+
| Timeline:                                                         |
| 11:30 PM - Client emails complaint                               |
| 11:35 PM - IC logs email activity                                |
| 11:45 PM - IC escalates to Manager                               |
| 11:47 PM - System notifies Manager (email + in-app)              |
+------------------------------------------------------------------+
| Actions:                                                          |
| [Take Ownership] [Assign to Someone Else] [Request More Info]    |
|                                                                   |
| Resolution Notes:                                                 |
| [                                                              ]  |
| [                                                              ]  |
|                                                                   |
| [Mark Resolved] [Escalate to CEO]                                |
+------------------------------------------------------------------+
```

**Step 5: Take Action on Escalation**
- Manager clicks "Take Ownership"
- System updates escalation: `assigned_to = manager_id`, `status = in_progress`
- Manager reviews:
  - Placement contract (original agreement)
  - November invoice (showing $120/hr)
  - Email thread with client
- Manager identifies issue: IC used wrong contract template

**Step 6: Contact Client Directly**
- Manager clicks "Email Client" button
- Email modal pre-populates:
  - To: jane@google.com
  - CC: ic@intime.com (to keep IC informed)
  - Template: "Manager Escalation Response"

**Manager writes:**
```
Hi Jane,

Thank you for bringing this to my attention. I've reviewed the situation
and you are absolutely correct - the rate increase to $120/hr was an error
on our part.

Here's what happened: We recently updated our internal contract templates
for new placements, and this was mistakenly applied to Sarah's ongoing
placement. This should not have happened without your explicit approval.

I will personally ensure:
1. November invoice is corrected to $110/hr (as agreed)
2. Revised invoice sent by EOD today
3. This mistake does not happen again on any of your contracts

I sincerely apologize for the confusion and any inconvenience. Your
partnership is extremely important to us, and I take full responsibility
for this error.

Can we schedule a brief call today to ensure we're aligned going forward?

Best regards,
Sarah (Manager - Recruiting Pod A)
```

- Manager clicks "Send & Log"
- Time: ~10 minutes

**Step 7: Debrief IC (Internal Coaching)**
- Manager clicks "Add Internal Note" to escalation
- Writes note for IC:
  - ✅ What went wrong: Used new template for existing contract
  - ✅ Corrective action: Manager handled client directly
  - ✅ Learning: Always check contract history before updating rates
  - ✅ Follow-up: Schedule 1:1 to review contract management process
- Manager clicks "Create Task" → "Schedule 1:1 with John - Contract Process Review"
- Due: Tomorrow
- Time: ~3 minutes

**Step 8: Update Escalation Status**
- Manager adds resolution note:
  - "Contacted client directly, apologized, committed to corrected invoice by EOD"
  - "Root cause: IC used new template for existing contract without checking"
  - "Action: Finance will issue corrected invoice. 1:1 scheduled with IC for process review."
- Manager clicks "Mark Resolved"
- System updates:
  - `status = resolved`
  - `resolved_at = now()`
  - `resolved_by = manager_id`
  - Notifications sent to IC and COO (Informed)
- Time: ~2 minutes

---

### 9:00 AM - Pod Stand-up (Async Check-in)

**Step 9: Review Daily Stand-up Responses**
- Manager navigates to `/employee/manager/standup`
- View shows:
  - Each IC's daily update (submitted asynchronously or in 15-min call)
  - Template: "What I accomplished yesterday, What I'm working on today, Any blockers?"

**John Smith's Update:**
```
Yesterday:
- Submitted 3 candidates to Senior Dev role at Meta
- Completed 5 screening calls
- Closed 1 placement (Maria Rodriguez → Amazon)

Today:
- Follow up on Meta submissions
- Source candidates for urgent Java role at Netflix
- Prep 2 candidates for interviews

Blockers:
- Client complaint escalated (Google rate issue) - need guidance
```

**Mary Jones's Update:**
```
Yesterday:
- Sourced 8 candidates for React role
- Scheduled 2 interviews
- Client call with Microsoft (new job discussion)

Today:
- Conduct 6 screening calls
- Submit top 3 candidates to Microsoft React role
- Follow up on pending interviews

Blockers:
- None
```

**Tom Brown's Update:**
```
Yesterday:
- Completed 4 screening calls
- Submitted 2 candidates to Salesforce
- Made 1 placement (Kevin Lee → Oracle)

Today:
- Interview prep for 3 candidates
- Source for urgent Python role
- Follow up with Salesforce on submission feedback

Blockers:
- Candidate ghosted me after accepting interview (need to reschedule)
```

**Step 10: Manager Response**
- Manager posts comment on John's update:
  - "Great placement with Maria! Re: Google issue - I've handled it directly. Let's do a 1:1 tomorrow to review contract processes."
- Manager posts comment on Tom's update:
  - "If candidate keeps ghosting, move on and source a replacement. Don't chase too long."
- Time: ~5 minutes

---

## Mid-Morning (10:00 AM - 12:00 PM)

### 10:00 AM - Review Pending Approvals

**Step 11: Approve High-Value Submission**
- Manager navigates to "Approvals Queue"
- View shows 1 pending approval:
  - **Candidate:** Michael Chen
  - **Job:** Staff Engineer @ Stripe
  - **Submitted Rate:** $115/hr (Job max: $110/hr)
  - **Submitted By:** Mary Jones (IC)
  - **Reason for Approval:** "Candidate is exceptional, client may accept above max for right person"

**Screen State:**
```
+------------------------------------------------------------------+
| Submission Approval Request                              [PENDING]|
+------------------------------------------------------------------+
| Submitted By: Mary Jones                    Submitted: 8:45 AM   |
| Candidate: Michael Chen                     Rate: $115/hr        |
| Job: Staff Engineer @ Stripe                Job Max: $110/hr     |
+------------------------------------------------------------------+
| Approval Reason:                                                  |
| Candidate has 12 years of experience with Stripe's exact tech    |
| stack (Ruby, Redis, Kafka). Previously worked at PayPal building |
| similar systems. Client emphasized they want "the best" and are  |
| open to flexibility on rate for exceptional candidates.          |
|                                                                   |
| Client contact (Sarah @ Stripe) mentioned in last call: "We'll   |
| pay more for someone who can hit the ground running."            |
+------------------------------------------------------------------+
| Submission Details:                                               |
| • Pay Rate: $95/hr                                               |
| • Bill Rate: $115/hr                                             |
| • Margin: $20/hr (21%)                                           |
| • Match Score: 98%                                               |
|                                                                   |
| Candidate Highlights:                                             |
| • 12 years Ruby on Rails experience                              |
| • Built payment processing systems at PayPal                     |
| • Expert in Kafka, Redis, PostgreSQL                             |
| • Strong communication skills, lead teams of 5+                  |
+------------------------------------------------------------------+
| Manager Decision:                                                 |
| ○ Approve (submit at $115/hr)                                    |
| ○ Approve with Note (suggest IC negotiate if client pushes back) |
| ○ Reject (ask IC to get client approval first)                   |
|                                                                   |
| Notes to IC:                                                      |
| [                                                              ]  |
|                                                                   |
| [Approve] [Reject] [Request More Info]                           |
+------------------------------------------------------------------+
```

**Step 12: Manager Approves with Guidance**
- Manager selects "Approve with Note"
- Manager writes note:
  - "Approving submission at $115/hr. Candidate looks great and client has indicated flexibility."
  - "If client pushes back on rate, call me before reducing. We may be able to negotiate based on candidate's PayPal experience."
  - "Good job positioning the value - your submission notes are strong."
- Manager clicks "Approve"
- System updates submission:
  - `requires_approval = false`
  - `approved_by = manager_id`
  - `approved_at = now()`
  - `status = submitted_to_client` (ready to send)
- Notification sent to IC: "Your submission for Michael Chen has been approved"
- Time: ~5 minutes

### 10:30 AM - 1:1 with IC (Mary Jones)

**Step 13: Conduct Weekly 1:1**
- Manager clicks "1:1s" tab
- Selects Mary Jones (scheduled for today)
- Opens 1:1 workspace:
  - Last week's notes visible
  - Action items from last meeting
  - Mary's current metrics

**Screen State:**
```
+------------------------------------------------------------------+
| 1:1: Sarah (Manager) ↔ Mary Jones (IC)            [Weekly Check-in]|
+------------------------------------------------------------------+
| Last Meeting: Nov 22                       Next Meeting: Dec 6   |
+------------------------------------------------------------------+
| Mary's Sprint Progress:                                           |
| • Placements: 1/1 ✓ (On track)                                   |
| • Pipeline: 10 active jobs, 6 submissions                         |
| • Activities: 47 this week (above avg)                            |
| • Last Placement: Nov 20 (Kevin Lee → Microsoft)                 |
+------------------------------------------------------------------+
| Action Items from Last Meeting:                                   |
| ☑ Improve submission write-ups (add more quantifiable results)   |
| ☑ Source 5 candidates for React role at Google                   |
| ☐ Shadow senior recruiter on client call (pending scheduling)    |
+------------------------------------------------------------------+
| Today's Agenda:                                                   |
| [                                                              ]  |
| [ 1. Celebrate Michael Chen submission (great positioning)    ]  |
| [ 2. Discuss client feedback from Microsoft placement         ]  |
| [ 3. Pipeline review - any jobs needing more candidates?      ]  |
| [ 4. Skill development - interest in training on negotiation? ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Meeting Notes:                                                    |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Action Items (New):                                               |
| [+ Add Action Item]                                              |
|                                                                   |
| [Save Notes] [End Meeting]                                       |
+------------------------------------------------------------------+
```

**Conversation Topics:**
1. **Wins & Celebrations** (~5 min)
   - Manager praises Michael Chen submission quality
   - Acknowledges Mary is on track for sprint target

2. **Feedback from Last Placement** (~10 min)
   - Client (Microsoft) gave positive feedback on Kevin Lee
   - Manager shares: "Hiring manager said Kevin ramped up faster than expected"
   - Discusses what made this a successful match

3. **Pipeline Health Check** (~5 min)
   - Reviews Mary's 10 active jobs
   - Identifies 2 jobs that are stale (no activity in 7 days)
   - Action item: Reach out to clients for status update

4. **Skill Development** (~10 min)
   - Mary expresses interest in learning better negotiation tactics
   - Manager suggests shadowing on next offer negotiation
   - Action item: Manager will include Mary on next complex offer call

5. **Blockers & Support Needed** (~5 min)
   - Mary mentions one client is slow to respond on submissions
   - Manager offers to escalate if no response by end of week

**Step 14: Log 1:1 Notes**
- Manager types meeting summary
- Adds action items:
  - "Follow up on stale jobs by Friday"
  - "Shadow manager on next offer negotiation call"
  - "Complete negotiation training module in Academy"
- Manager clicks "Save Notes"
- System logs activity:
  - `type: meeting`
  - `entity_type: user`
  - `entity_id: mary_jones_id`
  - `notes: [1:1 summary]`
- Time: ~35 minutes total

---

## Afternoon (12:00 PM - 3:00 PM)

### 12:00 PM - Strategic Account Check-in

**Step 15: Manage Key Client Relationship**
- Manager owns relationship with top-tier clients (e.g., Google, Meta, Amazon)
- Manager calls Google contact (Jane Doe) to follow up on morning's escalation

**Call Agenda:**
1. Confirm resolution of rate issue
2. Check on current placements (3 active contractors)
3. Discuss upcoming hiring needs
4. Ensure client satisfaction

**Step 16: Log Client Activity**
- After call, manager logs activity:
  - Type: Call
  - Account: Google Inc.
  - Contact: Jane Doe
  - Duration: 20 minutes
  - Outcome: Positive - client accepted apology, all placements going well
  - Notes: "Client has 2 new Java roles coming in Q1. Will send JDs next week."
  - Follow-up: Create task to review JDs when received
- Manager creates lead for future Java roles:
  - "Google Q1 Java Hiring - 2 Senior Java positions"
  - Assigned to: Pod (will distribute to ICs)
- Time: ~25 minutes (call + logging)

### 1:00 PM - Pod Pipeline Review

**Step 17: Analyze Pod Pipeline Health**
- Manager navigates to `/employee/manager/pipeline`
- Views aggregate pipeline across all ICs:

**Screen State:**
```
+------------------------------------------------------------------+
|                    Pod Pipeline Overview                          |
+------------------------------------------------------------------+
| Time Period: Current Sprint (Nov 15 - Nov 29)                    |
+------------------------------------------------------------------+
| Pipeline Coverage:                                                |
| • Active Jobs: 30                                                |
| • Total Submissions: 19 (0.63 per job - ⚠️ Below Target)         |
| • Target Coverage: 3 submissions per job                         |
| • Pipeline Health: ⚠️ Needs Attention                            |
+------------------------------------------------------------------+
| Submission Stages:                                                |
| ┌────────────────┬──────┬──────────────────────────────────────┐ |
| │ Stage          │ Count│ Progress                             │ |
| ├────────────────┼──────┼──────────────────────────────────────┤ |
| │ Sourced        │  7   │ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░              │ |
| │ Screening      │  5   │ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░              │ |
| │ Submitted      │  4   │ ▓▓▓▓░░░░░░░░░░░░░░░░░░░              │ |
| │ Interview      │  2   │ ▓▓░░░░░░░░░░░░░░░░░░░░░              │ |
| │ Offer          │  1   │ ▓░░░░░░░░░░░░░░░░░░░░░░              │ |
| └────────────────┴──────┴──────────────────────────────────────┘ |
+------------------------------------------------------------------+
| Jobs Needing Attention:                                           |
| • 8 jobs with 0 submissions (⚠️ HIGH PRIORITY)                   |
| • 5 jobs with submissions but no activity in 7+ days             |
| • 3 jobs on hold (waiting for client)                            |
+------------------------------------------------------------------+
| Recommended Actions:                                              |
| 1. Assign priority sourcing for 8 jobs with no submissions       |
| 2. Follow up on 5 stale jobs (client ghosting?)                  |
| 3. Review 3 on-hold jobs - can we reactivate?                    |
|                                                                   |
| [Assign Jobs] [Bulk Follow-up] [Export Report]                   |
+------------------------------------------------------------------+
```

**Step 18: Take Action on Pipeline Gaps**
- Manager identifies issue: 8 jobs with no submissions
- Manager clicks "View Jobs" to see list
- Manager reviews each job:
  - 2 jobs are too niche (unlikely to fill quickly)
  - 3 jobs are new (opened this week, ICs still sourcing)
  - 3 jobs are urgent (client needs ASAP)
- Manager decides to redistribute 3 urgent jobs:
  - Assigns 1 urgent Java role to Tom (he's Java expert)
  - Assigns 2 urgent React roles to Mary (she's React specialist)
  - Sends message to ICs: "These are priority - let's get submissions by EOD Friday"
- Time: ~20 minutes

### 2:00 PM - Cross-Pod Coordination Call

**Step 19: Weekly Manager Sync**
- Manager joins call with other pod managers (Bench Sales, TA)
- Call agenda:
  1. Cross-pollination opportunities (recruiting → bench sales, etc.)
  2. Shared client accounts (who owns what)
  3. Resource sharing (candidate pooling)
  4. Escalations that span pods

**Discussion Points:**
- Recruiting pod has 2 candidates who weren't placed → Can Bench Sales market them?
- TA pod has new client lead → Recruiting pod will handle hiring needs
- Bench pod has consultant ending contract → Recruiting pod will try to place elsewhere

**Action Items:**
- Transfer 2 candidates to Bench Sales pod
- Create handoff for new client from TA to Recruiting
- Set up meeting next week to discuss consultant re-placement strategy

- Time: ~30 minutes

---

## Late Afternoon (3:00 PM - 5:00 PM)

### 3:00 PM - Sprint Planning & Retrospective

**Step 20: Review Current Sprint Progress**
- Manager navigates to `/employee/manager/sprint`
- Current sprint ends in 3 days
- Pod status: 3/3 placements ✅ (Target met!)

**Screen State:**
```
+------------------------------------------------------------------+
|                   Sprint Board - Recruiting Pod A                 |
+------------------------------------------------------------------+
| Sprint 24 (Nov 15 - Nov 29)                         [3 days left] |
+------------------------------------------------------------------+
| Sprint Goal: 1 placement per IC (3 total)                 ✅ MET! |
+------------------------------------------------------------------+
| Individual Progress:                                              |
| ┌────────────┬────────────┬────────────────────────────────────┐ |
| │ IC         │ Placements │ Sprint Notes                       │ |
| ├────────────┼────────────┼────────────────────────────────────┤ |
| │ John Smith │ 1/1 ✓      │ Maria Rodriguez → Amazon (Nov 18)  │ |
| │ Mary Jones │ 1/1 ✓      │ Kevin Lee → Microsoft (Nov 20)     │ |
| │ Tom Brown  │ 1/1 ✓      │ Kevin Lee → Oracle (Nov 25)        │ |
| └────────────┴────────────┴────────────────────────────────────┘ |
+------------------------------------------------------------------+
| Sprint Retrospective (Scheduled: Nov 29):                         |
| Questions for team:                                               |
| • What went well this sprint?                                    |
| • What challenges did we face?                                   |
| • What can we improve next sprint?                               |
| • Any blockers we need to address?                               |
|                                                                   |
| [Schedule Retrospective] [Plan Next Sprint]                      |
+------------------------------------------------------------------+
```

**Step 21: Plan Next Sprint**
- Manager clicks "Plan Next Sprint"
- System creates Sprint 25 (Nov 30 - Dec 13)
- Manager sets sprint goals:
  - Target: 1 placement per IC (3 total)
  - Stretch goal: 4 placements (one IC gets 2)
  - Focus: Fill urgent jobs first, then pipeline building
- Manager assigns priority jobs for next sprint:
  - John: 3 urgent Java roles
  - Mary: 2 React roles + 1 Python role
  - Tom: 2 Full-stack roles + 1 DevOps role
- Manager schedules sprint kickoff: Monday 9:00 AM
- Time: ~20 minutes

### 4:00 PM - Administrative Work

**Step 22: Review & Approve Time-Off Requests**
- Manager navigates to "Approvals" → "Time Off Requests"
- John Smith requested PTO: Dec 15-16 (2 days)
- Manager checks:
  - Sprint calendar: Not during critical sprint deadline ✓
  - Pod coverage: Mary and Tom can cover ✓
  - John's pipeline: No urgent interviews scheduled ✓
- Manager approves request
- Time: ~5 minutes

**Step 23: Update COO on Pod Status**
- Manager navigates to "Reports" → "Weekly Manager Update"
- System generates pre-filled report with key metrics
- Manager reviews and edits:

```
Weekly Manager Update - Recruiting Pod A
Week of Nov 22-29

SPRINT PROGRESS: ✅ 100% (3/3 placements)
- John Smith: 1 placement (Maria Rodriguez → Amazon)
- Mary Jones: 1 placement (Kevin Lee → Microsoft)
- Tom Brown: 1 placement (Kevin Lee → Oracle)

PIPELINE HEALTH: ⚠️ Needs attention
- Active Jobs: 30 (good)
- Submission Coverage: 0.63 per job (below 3x target)
- Action: Redistributed 3 urgent jobs to specialists

ESCALATIONS: 1 resolved
- Google rate issue (resolved with client, IC coached)

CLIENT UPDATES:
- Google: Resolved rate dispute, 2 new roles coming in Q1
- Microsoft: Positive feedback on Kevin Lee placement

NEXT SPRINT FOCUS:
- Fill 8 jobs with no submissions (priority sourcing)
- Continue strong placement pace (target: 3 placements)

BLOCKERS: None

SUPPORT NEEDED: None at this time
```

- Manager clicks "Submit to COO"
- Report sent via email + logged in system
- Time: ~10 minutes

### 4:30 PM - Prepare for Tomorrow

**Step 24: Review Tomorrow's Schedule**
- Manager opens calendar
- Tomorrow's agenda:
  - 9:00 AM: Sprint kickoff (new sprint)
  - 10:00 AM: 1:1 with John (contract process review)
  - 11:00 AM: Client call with Netflix (new job discussion)
  - 1:00 PM: Escalation training for new IC
  - 3:00 PM: Review pod analytics with COO
- Manager creates prep tasks:
  - "Prepare sprint kickoff slides"
  - "Review contract templates for John's 1:1"
  - "Research Netflix's tech stack for client call"
- Time: ~10 minutes

**Step 25: End-of-Day Wrap-up**
- Manager reviews open escalations: 0 (all resolved ✓)
- Manager reviews pending approvals: 0 (all handled ✓)
- Manager checks notifications: 2 unread
  - Tom completed interview prep (no action needed)
  - Mary submitted Michael Chen to Stripe (monitoring)
- Manager adds note to pod journal:
  - "Great sprint! All ICs hit targets. Focus next sprint: improve pipeline coverage."
- Time: ~5 minutes

### 5:00 PM - End of Day

**Step 26: Logout**
- Manager clicks profile menu
- Clicks "Sign Out"
- Session ends
- Redirect to login page

---

## Daily Activity Summary

By end of day, a typical manager should have:

| Activity Type | Target Count |
|---------------|--------------|
| Escalations Handled | 1-3 |
| Approvals Processed | 1-2 |
| 1:1 Meetings | 1 (daily rotation) |
| Client Calls | 1-2 (strategic accounts) |
| Pod Check-ins | 1 (stand-up or async) |
| Pipeline Reviews | 1 |
| Administrative Tasks | 5-10 |
| Status Updates Sent | 1 (to leadership) |

---

## Weekly Patterns

| Day | Focus |
|-----|-------|
| Monday | Sprint planning, priority setting, pod alignment |
| Tuesday | 1:1s, coaching, skill development |
| Wednesday | Client relationship management, escalations |
| Thursday | Pipeline review, approvals, cross-pod coordination |
| Friday | Sprint retrospective, reporting, planning next week |

---

## Common Blockers & Escalation

| Blocker | Manager Action |
|---------|----------------|
| IC consistently missing targets | 1:1 to identify root cause, create performance improvement plan |
| Multiple escalations from same client | Review account health, consider reassigning or involving CEO |
| Pod morale low | Team building activity, retrospective to surface issues |
| Pipeline weak across pod | Sourcing blitz, bring in recruiting help, adjust targets |
| IC conflict | Mediate, clarify roles, reset expectations |
| System issue affecting pod | Report to Admin, communicate workaround to ICs |

---

## Manager Daily Checklist

### Morning (Must Do)
- [ ] Check Pod Dashboard for overnight activity
- [ ] Review and handle urgent escalations
- [ ] Check approvals queue
- [ ] Review IC stand-up updates

### Mid-Day (Should Do)
- [ ] Conduct scheduled 1:1
- [ ] Strategic client touchpoint (1 per day)
- [ ] Review pending approvals

### Afternoon (Should Do)
- [ ] Pod pipeline review
- [ ] Sprint progress check
- [ ] Update COO/leadership (as needed)

### End of Day (Must Do)
- [ ] Ensure all escalations have action plan
- [ ] Ensure all approvals processed
- [ ] Plan tomorrow's priorities
- [ ] Log any important client/IC conversations

---

## Time Allocation (Typical)

| Activity Category | % of Day | Hours (8hr day) |
|-------------------|----------|-----------------|
| Escalation Handling | 20% | 1.5 hours |
| IC Coaching & 1:1s | 25% | 2 hours |
| Strategic Client Management | 20% | 1.5 hours |
| Pod Performance Monitoring | 15% | 1 hour |
| Approvals & Admin | 10% | 0.75 hours |
| Cross-Pod Coordination | 5% | 0.5 hours |
| Planning & Reporting | 5% | 0.5 hours |

---

## Success Metrics (Daily)

A successful day as a Manager includes:
- ✅ All escalations addressed (no overnight carryover)
- ✅ All approvals processed within 4 hours
- ✅ At least 1 IC coaching conversation
- ✅ At least 1 strategic client touchpoint
- ✅ Pod dashboard reviewed and action items identified
- ✅ ICs feel supported (measured by quick response to requests)
- ✅ Leadership informed of critical issues

---

*Last Updated: 2024-11-30*
