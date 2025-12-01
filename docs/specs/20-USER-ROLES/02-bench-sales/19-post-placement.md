# Use Case: Post-Placement Check-Ins and Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-019 |
| Actor | Bench Sales Recruiter |
| Goal | Monitor placement health, ensure consultant satisfaction, prevent early terminations |
| Frequency | Weekly for first month, bi-weekly after, monthly ongoing |
| Estimated Time | 15-30 minutes per placement check-in |
| Priority | High (Retention and revenue protection) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Active placement exists (consultant on client project)
3. Placement has started (start date has passed)
4. User has permission to manage assigned placements
5. Consultant and client contact information available

---

## Trigger

One of the following:
- Scheduled check-in reminder (30/60/90 day milestones)
- Weekly check-in for new placements (<30 days)
- Client feedback requested
- Consultant raises issue or concern
- Timesheet discrepancy detected
- Performance concern flagged
- Contract renewal approaching
- Placement at risk alert

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Active Placements Dashboard

**User Action:** User clicks "Placements" in sidebar or navigates from Bench Dashboard

**System Response:**
- Loads active placements dashboard
- Shows list of consultant placements
- Displays check-in status and upcoming milestones

**URL:** `/employee/workspace/bench/placements`

**Time:** ~1 second

---

### Step 2: View Active Placements List

**System Display:**

```
+------------------------------------------------------------------+
|  Active Placements                            [Refresh ⟳] [+New] |
+------------------------------------------------------------------+
| Monitor consultant placements and track check-ins                |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Placement Health Overview                                   │   |
| │                                                             │   |
| │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐│   |
| │ │Total Active │ │ Healthy     │ │ At Risk     │ │ New    ││   |
| │ │     23      │ │    19       │ │     3       │ │   1    ││   |
| │ │ placements  │ │ (83% good)  │ │ (need attn) │ │(<30 d) ││   |
| │ │             │ │             │ │             │ │        ││   |
| │ │ ▲ 2 from wk │ │ ✓ Stable    │ │ ⚠ Follow up │ │ 🎉 New ││   |
| │ └─────────────┘ └─────────────┘ └─────────────┘ └────────┘│   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Check-in Schedule                                                 |
+------------------------------------------------------------------+
| 🔴 Overdue (3):                                                  |
| • Rajesh Kumar (Accenture) - 30-day check-in overdue by 5 days  |
| • Sarah Johnson (Capital One) - Weekly check-in missed           |
| • Chen Wei (Meta) - 60-day check-in due today                   |
|                                                                   |
| 🟡 Due This Week (5):                                            |
| • Priya Sharma (Google) - 90-day check-in due 12/05             |
| • Michael Brown (Amazon) - Weekly check-in due 12/02            |
| • Lisa Wong (Uber) - 30-day check-in due 12/03                  |
| • David Lee (Microsoft) - Weekly check-in due 12/04             |
| • Maria Garcia (Apple) - 60-day check-in due 12/06              |
|                                                                   |
| 🟢 Completed This Week (4):                                      |
| • John Smith (Booz Allen) - Weekly check-in ✓                   |
| • Emma Wilson (Oracle) - 30-day check-in ✓                      |
| • Robert Martinez (IBM) - Weekly check-in ✓                     |
| • Kevin Park (Facebook) - 60-day check-in ✓                     |
+------------------------------------------------------------------+
```

**Health Status Indicators:**
- 🟢 **Healthy**: All check-ins current, no issues reported
- 🟡 **Needs Attention**: Check-in overdue OR minor issue flagged
- 🔴 **At Risk**: Multiple issues OR client dissatisfaction OR consultant unhappy

**Time:** ~30 seconds to review

---

### Step 3: View Placement Details

**User Action:** Click on placement card for "Rajesh Kumar (Accenture)"

**System Response:**
- Opens placement detail panel
- Shows placement overview, check-in history, and current status

**Placement Detail Panel:**

```
+------------------------------------------------------------------+
|  Placement Details - Rajesh Kumar                           [×]  |
+------------------------------------------------------------------+
| [Overview] [Check-Ins] [Timesheets] [Performance] [Contract]     |
+------------------------------------------------------------------+
|                                                                   |
| 🟡 Status: Needs Attention - 30-day check-in overdue             |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Placement Information                                       │   |
| │                                                             │   |
| │ Consultant: Rajesh Kumar                                    │   |
| │ Title: Java Developer                                       │   |
| │ Client: Accenture - DC Area Office                          │   |
| │ Project: Backend Services Modernization                     │   |
| │ Manager: John Davis (john.davis@accenture.com)              │   |
| │                                                             │   |
| │ Start Date: 10/15/2024 (47 days ago)                        │   |
| │ End Date: 04/15/2025 (6-month contract)                     │   |
| │ Contract Type: C2C                                          │   |
| │ Bill Rate: $95/hr                                           │   |
| │ Status: Active                                              │   |
| │                                                             │   |
| │ Bench Sales Rep: You                                        │   |
| │ Account Manager: Sarah Williams                             │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Health Metrics                                              │   |
| │                                                             │   |
| │ Overall Health: 🟡 Needs Attention (75/100)                 │   |
| │                                                             │   |
| │ Check-ins:           🔴 Overdue (30-day missed)             │   |
| │ Timesheet Compliance: ✅ 100% on-time                       │   |
| │ Client Satisfaction:  ✅ Good (last feedback: 11/15)        │   |
| │ Consultant Morale:    🟡 Neutral (last check-in: 10/30)     │   |
| │ Performance:          ✅ Meeting expectations                │   |
| │                                                             │   |
| │ ⚠️  Action Required: Schedule 30-day check-in immediately   │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Check-In History                                            │   |
| │                                                             │   |
| │ ✅ Week 2 Check-In (10/30/2024) - Status: Good              │   |
| │    Notes: Rajesh settling in well, team is happy, project   │   |
| │           onboarding smooth. No issues reported.            │   |
| │    [View Details]                                           │   |
| │                                                             │   |
| │ ✅ Day 1 Check-In (10/15/2024) - Status: Good               │   |
| │    Notes: First day went well, access granted, met team.    │   |
| │    [View Details]                                           │   |
| │                                                             │   |
| │ 🔴 30-Day Check-In - OVERDUE (Due: 11/14, 17 days late)    │   |
| │    [Schedule Check-In Now]                                  │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| [Log Check-In] [Contact Consultant] [Contact Client] [Add Note] |
+------------------------------------------------------------------+
```

**Placement Health Score Calculation:**
- **Check-in compliance**: 25% (on-time check-ins)
- **Timesheet compliance**: 20% (timesheets submitted on time)
- **Client feedback**: 25% (client satisfaction ratings)
- **Consultant morale**: 20% (consultant satisfaction)
- **Performance**: 10% (meeting expectations)

**Time:** ~1 minute to review

---

### Step 4: Initiate Check-In Call

**User Action:** Click "Log Check-In" button

**System Response:**
- Opens check-in form
- Pre-fills placement and consultant information
- Provides check-in questionnaire based on milestone (30/60/90 day)

**Check-In Form:**

```
+------------------------------------------------------------------+
|  Log Check-In - 30-Day Milestone                            [×]  |
+------------------------------------------------------------------+
| Consultant: Rajesh Kumar (Accenture - Java Developer)            |
| Placement Start: 10/15/2024 (47 days ago)                        |
| Check-In Type: 30-Day Milestone                                  |
| Check-In Date: [12/01/2024          ] (today)                    |
+------------------------------------------------------------------+
|                                                                   |
| Contact Method: *                                                 |
| ● Phone Call                                                     |
| ○ Video Call (Zoom/Teams)                                        |
| ○ In-Person Meeting                                              |
| ○ Email (not recommended for milestone check-ins)                |
|                                                                   |
| Call Duration: [20    ] minutes                                  |
+------------------------------------------------------------------+
|                                                                   |
| CONSULTANT CHECK-IN                                               |
+------------------------------------------------------------------+
|                                                                   |
| 1. Overall Satisfaction (1-5): *                                  |
| ○ 1 - Very Unhappy   ○ 2 - Unhappy   ● 3 - Neutral               |
| ○ 4 - Satisfied      ○ 5 - Very Satisfied                        |
|                                                                   |
| 2. Work Environment: *                                            |
| ☑ Team is collaborative and supportive                           |
| ☑ Clear communication from manager                               |
| ☐ Adequate resources and tools provided                          |
| ☑ Comfortable work location/remote setup                         |
|                                                                   |
| 3. Project & Responsibilities: *                                  |
| ● Work matches job description                                   |
| ○ Work partially matches (some differences)                      |
| ○ Work does not match (significant differences)                  |
|                                                                   |
| Skill Utilization:                                                |
| ● Skills being fully utilized                                    |
| ○ Some skills underutilized                                      |
| ○ Skills don't match project needs                               |
|                                                                   |
| 4. Challenges or Concerns: *                                      |
| [Rajesh mentioned that the project setup took longer than    ]   |
| [expected, delaying actual development work. He also noted   ]   |
| [some ambiguity in requirements initially, but team is now   ]   |
| [working through it. Overall, no major blockers.             ]   |
| [                                                 ] 245/1000      |
|                                                                   |
| 5. Any Support Needed from InTime:                                |
| [None at this time. Rajesh is managing well.                 ]   |
| [                                                 ] 0/500         |
|                                                                   |
| 6. Intent to Stay: *                                              |
| ● Definitely staying (committed to contract)                     |
| ○ Likely staying (no issues currently)                           |
| ○ Uncertain (monitoring situation)                               |
| ○ Likely leaving (actively looking)                              |
| ○ Definitely leaving (found another opportunity)                 |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| CLIENT CHECK-IN (Contact manager separately)                      |
+------------------------------------------------------------------+
|                                                                   |
| 7. Client Contacted: *                                            |
| ● Yes - Spoke with John Davis (client manager)                  |
| ○ No - Will contact separately                                   |
| ○ No - Not required for this check-in                            |
|                                                                   |
| 8. Client Satisfaction (1-5): *                                   |
| ○ 1 - Very Unhappy   ○ 2 - Unhappy   ○ 3 - Neutral               |
| ● 4 - Satisfied      ○ 5 - Very Satisfied                        |
|                                                                   |
| 9. Client Feedback:                                               |
| [John is pleased with Rajesh's work. He mentioned Rajesh is  ]   |
| [quick to learn the codebase and has already contributed     ]   |
| [valuable improvements. Team integration is smooth. No       ]   |
| [performance concerns.                                       ]   |
| [                                                 ] 215/1000      |
|                                                                   |
| 10. Performance Issues Reported:                                  |
| ☐ Quality of work                                                |
| ☐ Timeliness/deadlines                                           |
| ☐ Communication                                                  |
| ☐ Attendance/availability                                        |
| ☐ Team collaboration                                             |
| ☑ None - Meeting/exceeding expectations                          |
|                                                                   |
| 11. Contract Extension Potential: *                               |
| ● Likely to extend (client indicates interest)                   |
| ○ Possible (project ongoing, no decision yet)                    |
| ○ Unlikely (project ending as planned)                           |
| ○ No (client will not extend)                                    |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| PLACEMENT HEALTH ASSESSMENT                                       |
+------------------------------------------------------------------+
|                                                                   |
| Overall Placement Health: *                                       |
| ○ 🔴 At Risk (immediate action needed)                           |
| ○ 🟡 Needs Attention (monitor closely)                           |
| ● 🟢 Healthy (stable, on track)                                  |
|                                                                   |
| Risk Factors (if any):                                            |
| ☐ Consultant unhappy/dissatisfied                                |
| ☐ Client unhappy/dissatisfied                                    |
| ☐ Performance issues                                             |
| ☐ Cultural fit issues                                            |
| ☐ Project scope changes                                          |
| ☐ Budget/rate concerns                                           |
| ☑ None - No risks identified                                     |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| ACTION ITEMS & NEXT STEPS                                         |
+------------------------------------------------------------------+
|                                                                   |
| Follow-Up Required:                                               |
| ☑ Yes                                                            |
| ☐ No                                                             |
|                                                                   |
| Next Check-In:                                                    |
| Type: [60-Day Milestone                                     ▼]   |
| Scheduled Date: [01/14/2025          ] (auto-calculated)         |
|                                                                   |
| Action Items:                                                     |
| 1. [Send Rajesh project success tips for requirements clarity]   |
| 2. [Follow up with client in 2 weeks for mid-point check     ]   |
| 3. [Schedule 60-day check-in for mid-January                 ]   |
| [+ Add Action Item]                                              |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Save Check-In →]   |
+------------------------------------------------------------------+
```

**Check-In Questionnaire Types:**

| Milestone | Focus Areas | Client Contact |
|-----------|-------------|----------------|
| **Day 1** | Onboarding, access, first impressions | Optional |
| **Week 1** | Integration, early challenges, setup | Optional |
| **Week 2** | Project understanding, team fit | Optional |
| **30-Day** | Overall satisfaction, performance, retention | **Required** |
| **60-Day** | Mid-term review, extension potential | **Required** |
| **90-Day** | Long-term fit, contract renewal | **Required** |
| **Quarterly** | Performance review, relationship health | **Required** |

**User Action:** Fill out form and click "Save Check-In →"

**System Response:**
1. Validates all required fields
2. Saves check-in record to database
3. Updates placement health score (75 → 85, 🟡 → 🟢)
4. Creates follow-up tasks based on action items
5. Schedules next check-in reminder (60-day: 01/14/2025)
6. Updates check-in compliance status (overdue → current)
7. Sends summary email to manager (if issues flagged)
8. Logs activity in placement timeline
9. Toast: "30-day check-in logged successfully ✓"

**Time:** ~15-30 minutes including call and documentation

---

### Step 5: Handle At-Risk Placement

**Scenario:** Consultant reports dissatisfaction or client reports performance issues

**User Action:** Select "At Risk" health status during check-in

**System Response:**
- Triggers escalation workflow
- Opens at-risk action plan form

**At-Risk Action Plan:**

```
+------------------------------------------------------------------+
|  Placement At Risk - Action Plan Required                   [×]  |
+------------------------------------------------------------------+
| Placement: Sarah Johnson (Capital One - .NET Developer)          |
| Risk Level: 🔴 High - Immediate action required                  |
+------------------------------------------------------------------+
|                                                                   |
| Risk Factors Identified:                                          |
| ☑ Consultant unhappy/dissatisfied                                |
| ☑ Cultural fit issues                                            |
| ☐ Client unhappy/dissatisfied                                    |
| ☐ Performance issues                                             |
|                                                                   |
| Detailed Issue Description: *                                     |
| [Sarah reported feeling isolated on the team. She mentioned  ]   |
| [that most team members work in different time zones and     ]   |
| [communication is challenging. She's also concerned about    ]   |
| [lack of onboarding support and unclear expectations. Client ]   |
| [hasn't reported issues yet, but Sarah is considering other  ]   |
| [opportunities if situation doesn't improve.                 ]   |
| [                                                 ] 412/1000      |
|                                                                   |
+------------------------------------------------------------------+
| IMMEDIATE ACTIONS (Next 48 Hours):                                |
+------------------------------------------------------------------+
| 1. [Schedule call with Sarah to discuss concerns in detail   ]   |
| 2. [Contact client manager to discuss team integration       ]   |
| 3. [Propose solutions: daily standup, buddy system, 1:1s     ]   |
| 4. [Offer InTime support: mentorship, career coaching        ]   |
| [+ Add Action]                                                   |
|                                                                   |
+------------------------------------------------------------------+
| SHORT-TERM PLAN (Next 2 Weeks):                                   |
+------------------------------------------------------------------+
| 1. [Work with client to improve onboarding and communication ]   |
| 2. [Weekly check-ins with Sarah to monitor improvement       ]   |
| 3. [Identify backup placements if situation doesn't improve  ]   |
| 4. [Consider transition plan if cultural fit can't be fixed  ]   |
| [+ Add Action]                                                   |
|                                                                   |
+------------------------------------------------------------------+
| Escalation:                                                       |
| ☑ Notify Bench Sales Manager                                     |
| ☑ Notify Account Manager                                         |
| ☐ Notify Regional Director                                       |
| ☐ Notify HR (if serious issue)                                   |
|                                                                   |
| Manager Notes:                                                    |
| [Reviewed with manager. Agreed to intervene with client and  ]   |
| [support Sarah through transition. Will monitor weekly.      ]   |
| [                                                 ] 0/500         |
|                                                                   |
+------------------------------------------------------------------+
|                                  [Cancel]  [Create Action Plan →]|
+------------------------------------------------------------------+
```

**User Action:** Click "Create Action Plan →"

**System Response:**
1. Creates at-risk case record
2. Assigns tasks to bench rep, manager, and account manager
3. Sets up weekly check-in reminders
4. Sends escalation emails to stakeholders
5. Updates placement status: Healthy → At Risk
6. Creates timeline entry
7. Toast: "At-risk action plan created. Manager notified."

**Time:** ~20-30 minutes

---

### Step 6: Track Contract Renewal Opportunities

**User Action:** Navigate to "Contract Renewals" tab

**System Response:**
- Shows placements approaching end date
- Highlights extension opportunities

**Contract Renewals Dashboard:**

```
+------------------------------------------------------------------+
|  Contract Renewals - Next 90 Days                                 |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Renewal Pipeline                                            │   |
| │                                                             │   |
| │ Ending in 30 Days: 4 placements ($38k/month at risk)       │   |
| │ Ending in 60 Days: 7 placements ($67k/month at risk)       │   |
| │ Ending in 90 Days: 5 placements ($45k/month at risk)       │   |
| │                                                             │   |
| │ Extension Confirmed: 3 placements ($28k/month secured)      │   |
| │ Extension Likely: 6 placements ($52k/month probable)        │   |
| │ Extension Unlikely: 4 placements ($38k/month at risk)       │   |
| │ No Decision Yet: 3 placements ($32k/month uncertain)        │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Ending in Next 30 Days - Action Required                          |
+------------------------------------------------------------------+
|                                                                   |
| Priya Sharma (Google - Full Stack Dev)                           |
| End Date: 01/08/2025 (38 days)                                   |
| Contract Value: $20,800/month                                    |
| Extension Status: ✅ Confirmed - 6 months (client signed SOW)    |
| Action: Update contract end date in system                       |
| [Update Contract] [View Details]                                 |
|                                                                   |
| Michael Brown (Amazon - DevOps Engineer)                         |
| End Date: 01/15/2025 (45 days)                                   |
| Contract Value: $9,360/month                                     |
| Extension Status: 🟡 Likely - Client indicated interest          |
| Action: Follow up with client for formal extension               |
| [Contact Client] [View Details]                                  |
|                                                                   |
| Lisa Wong (Uber - React Developer)                               |
| End Date: 01/22/2025 (52 days)                                   |
| Contract Value: $8,400/month                                     |
| Extension Status: 🔴 Unlikely - Project ending as planned        |
| Action: Start marketing Lisa for new placement                   |
| [Add to Bench Queue] [View Details]                              |
|                                                                   |
| David Lee (Microsoft - Java Developer)                           |
| End Date: 01/28/2025 (58 days)                                   |
| Contract Value: $15,600/month                                    |
| Extension Status: ⚪ Unknown - No discussion yet                 |
| Action: Schedule check-in to discuss extension potential         |
| [Schedule Check-In] [View Details]                               |
+------------------------------------------------------------------+
```

**Extension Status:**
- ✅ **Confirmed**: Client signed extension, update contract
- 🟡 **Likely**: Client expressed interest, formalize agreement
- 🔴 **Unlikely**: Project ending, prepare consultant for bench
- ⚪ **Unknown**: No discussion yet, initiate conversation

**Time:** ~5 minutes to review

---

### Step 7: Document Performance Issues

**User Action:** Click "Add Note" or "Flag Performance Issue" on placement

**System Response:**
- Opens performance issue form
- Categorizes issue type
- Creates improvement plan

**Performance Issue Form:**

```
+------------------------------------------------------------------+
|  Document Performance Issue                                  [×]  |
+------------------------------------------------------------------+
| Placement: Chen Wei (Meta - React Developer)                     |
| Issue Reported By: Client Manager (Jane Smith)                   |
| Issue Date: [12/01/2024          ]                               |
+------------------------------------------------------------------+
|                                                                   |
| Issue Type: *                                                     |
| ☐ Quality of Work                                                |
| ☑ Timeliness/Deadlines                                           |
| ☐ Communication                                                  |
| ☐ Attendance/Availability                                        |
| ☐ Team Collaboration                                             |
| ☐ Technical Skills Gap                                           |
| ☐ Behavioral/Attitude                                            |
| ☐ Other                                                          |
|                                                                   |
| Severity: *                                                       |
| ○ 🟢 Low (Minor issue, coaching needed)                          |
| ● 🟡 Medium (Pattern emerging, action required)                  |
| ○ 🔴 High (Serious issue, at-risk of termination)                |
|                                                                   |
| Issue Description: *                                              |
| [Client reported that Chen has missed 2 sprint deadlines in  ]   |
| [the past 3 weeks. Tasks are taking longer than estimated.   ]   |
| [Client is concerned about velocity and impact on project    ]   |
| [timeline. No quality issues, just slower delivery.          ]   |
| [                                                 ] 242/1000      |
|                                                                   |
| Root Cause (if known):                                            |
| [Chen mentioned he's learning new frameworks (Next.js) and   ]   |
| [some architectural patterns are unfamiliar. Also juggling   ]   |
| [multiple priorities which is impacting focus.               ]   |
| [                                                 ] 0/500         |
|                                                                   |
+------------------------------------------------------------------+
| IMPROVEMENT PLAN                                                  |
+------------------------------------------------------------------+
|                                                                   |
| Discussed with Consultant:                                        |
| ● Yes - Consultant is aware and acknowledges issue               |
| ○ No - Need to schedule discussion                               |
|                                                                   |
| Improvement Actions:                                              |
| 1. [Chen to take Next.js course this weekend (LinkedIn Learning)]|
| 2. [Daily standups with team to clarify priorities           ]   |
| 3. [Pair programming sessions with senior dev for 2 weeks    ]   |
| 4. [Reduce parallel tasks, focus on one story at a time      ]   |
| [+ Add Action]                                                   |
|                                                                   |
| Timeline for Improvement:                                         |
| Review Date: [12/15/2024          ] (2 weeks)                    |
|                                                                   |
| Success Criteria:                                                 |
| [Meet sprint commitments for next 2 sprints                  ]   |
| [Complete tasks within estimated timelines                   ]   |
| [Client reports improvement in velocity                      ]   |
| [                                                 ] 0/500         |
|                                                                   |
| Escalation Plan (if no improvement):                              |
| [If no improvement by 12/15, will schedule PIP (Performance  ]   |
| [Improvement Plan) with HR. Client has indicated they will   ]   |
| [need to replace if velocity doesn't improve within 30 days. ]   |
| [                                                 ] 0/500         |
|                                                                   |
+------------------------------------------------------------------+
| Notifications:                                                    |
| ☑ Notify Bench Sales Manager                                     |
| ☑ Notify HR (for documentation)                                  |
| ☐ Notify Regional Director                                       |
|                                                                   |
+------------------------------------------------------------------+
|                                  [Cancel]  [Document Issue →]    |
+------------------------------------------------------------------+
```

**User Action:** Click "Document Issue →"

**System Response:**
1. Creates performance issue record
2. Links issue to placement
3. Creates improvement plan tasks
4. Schedules review date reminder
5. Notifies manager and HR
6. Updates placement health score
7. Adds note to consultant profile
8. Toast: "Performance issue documented and improvement plan created"

**Time:** ~15-20 minutes

---

## Field Specifications

### Check-In Form

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| Check-In Type | Dropdown | Yes | Day 1/Week 1/30d/60d/90d | Auto-suggested based on timeline |
| Check-In Date | Date | Yes | Cannot be future | Date call conducted |
| Contact Method | Radio | Yes | Phone/Video/In-person | Email not recommended |
| Call Duration | Number | Yes | 5-120 minutes | Track engagement time |
| Consultant Satisfaction | Scale 1-5 | Yes | 1-5 | Core metric |
| Client Satisfaction | Scale 1-5 | Yes if contacted | 1-5 | Core metric |
| Overall Health | Status | Yes | At Risk/Needs Attention/Healthy | Determines escalation |
| Challenges/Concerns | Textarea | Yes | Min 20 chars | Required documentation |
| Intent to Stay | Radio | Yes | Definite/Likely/Uncertain/Leaving | Retention risk |
| Extension Potential | Radio | Yes if milestone | Likely/Possible/Unlikely/No | Revenue forecast |

### Performance Issue

| Field | Required | Validation | Notes |
|-------|----------|------------|-------|
| Issue Type | Yes | Select at least 1 | Categorize issue |
| Severity | Yes | Low/Medium/High | Determines response |
| Issue Description | Yes | Min 50 chars | Detailed documentation |
| Discussed with Consultant | Yes | Yes/No | Must confirm awareness |
| Improvement Actions | Yes | Min 1 action | Concrete steps |
| Review Date | Yes | 1-4 weeks out | Reasonable timeframe |
| Success Criteria | Yes | Min 20 chars | Measurable outcomes |

---

## Postconditions

### Success Postconditions

1. **Check-in logged** and documented
2. **Placement health score updated** based on feedback
3. **Follow-up tasks created** for action items
4. **Next check-in scheduled** automatically
5. **Stakeholders notified** if issues flagged
6. **Timeline updated** with check-in notes
7. **Contract renewal pipeline updated** with extension status

### Failure Postconditions

1. **At-risk placement escalated** to manager
2. **Performance improvement plan initiated** if needed
3. **Consultant support provided** (coaching, resources)
4. **Client intervention scheduled** if dissatisfaction detected
5. **Replacement search started** if termination likely

---

## Events Logged

| Event | Payload |
|-------|---------|
| `placement.checkin_completed` | `{ placement_id, checkin_type, consultant_satisfaction, client_satisfaction, health_status, timestamp }` |
| `placement.health_changed` | `{ placement_id, old_health, new_health, reason, timestamp }` |
| `placement.at_risk_flagged` | `{ placement_id, risk_factors, action_plan_id, escalated_to, timestamp }` |
| `placement.performance_issue_logged` | `{ placement_id, issue_type, severity, improvement_plan_created, timestamp }` |
| `placement.extension_confirmed` | `{ placement_id, original_end_date, new_end_date, extension_value, timestamp }` |
| `placement.termination_notice` | `{ placement_id, termination_date, reason, initiated_by, timestamp }` |

---

## Error Scenarios

| Scenario | Cause | System Response | User Action |
|----------|-------|-----------------|-------------|
| **Check-in overdue** | Missed scheduled check-in date | Flag as overdue, send reminder | Schedule and complete check-in immediately |
| **Consultant unreachable** | No response after 3 attempts | Update status, notify manager | Try alternate contact methods, escalate |
| **Client refuses feedback** | Client doesn't respond or declines | Document attempt, flag concern | Escalate to account manager |
| **Conflicting feedback** | Consultant happy but client unhappy | Flag discrepancy, investigate | Schedule joint call to align expectations |
| **Immediate termination** | Client terminates without notice | Update placement status, transition consultant | Add to bench, find new placement urgently |
| **Extension negotiation fails** | Client declines extension | Update renewal status, prepare consultant | Market consultant before end date |
| **Performance not improving** | No progress on improvement plan | Escalate to PIP, consider replacement | HR involvement, formal documentation |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g then p` | Go to Placements Dashboard |
| `c` | Log check-in for selected placement |
| `n` | Add note to selected placement |
| `i` | Flag issue on selected placement |
| `e` | Update extension status |
| `Enter` | Open selected placement details |
| `Esc` | Close placement detail panel |

---

## Alternative Flows

### A1: Early Termination by Client

**Trigger:** Client terminates consultant before contract end date

**Flow:**
1. Client notifies bench rep of termination
2. User opens placement and clicks "End Placement Early"
3. System shows early termination form:
   - Termination date (last day worked)
   - Reason (client initiated, project ended, performance, budget, etc.)
   - Notice period (immediate, 2 weeks, etc.)
   - Final invoice amount (pro-rated)
4. User documents termination details
5. System:
   - Updates placement status: Active → Terminated
   - Calculates final commission
   - Adds consultant back to bench
   - Notifies manager, HR, Finance
   - Creates task: "Find new placement for [Consultant]"
6. User conducts exit interview with consultant
7. User documents lessons learned

### A2: Consultant Quits Placement

**Trigger:** Consultant resigns from placement

**Flow:**
1. Consultant notifies bench rep of resignation
2. User opens placement and clicks "Consultant Resigned"
3. System shows resignation form:
   - Last day worked
   - Reason (another opportunity, personal, dissatisfaction, etc.)
   - Exit interview notes
4. User documents resignation
5. System:
   - Updates placement status: Active → Resigned
   - Notifies client, manager, HR
   - Adds consultant to "Former" bench (inactive)
   - Flags for potential re-hire evaluation
6. If breach of contract: HR involvement, legal review
7. If amicable: Maintain relationship for future

### A3: Contract Extension Negotiation

**Trigger:** Placement approaching end date, client interested in extension

**Flow:**
1. During check-in, client expresses extension interest
2. User updates extension status: Unknown → Likely
3. User creates extension negotiation task
4. User coordinates with account manager and client:
   - Extension duration (3/6/12 months)
   - Rate negotiation (same/increase/decrease)
   - Scope changes (if any)
5. Parties agree on terms
6. User updates placement:
   - Extension status: Likely → Confirmed
   - New end date
   - Updated rate (if changed)
7. System:
   - Extends placement contract
   - Updates revenue forecast
   - Notifies Finance for new SOW
   - Logs extension activity
8. User informs consultant of extension

### A4: Mid-Placement Rate Increase

**Trigger:** Client approves rate increase for consultant

**Flow:**
1. Client notifies of rate increase (performance-based, market adjustment, etc.)
2. User opens placement and clicks "Update Rate"
3. System shows rate change form:
   - Effective date
   - Old rate → New rate
   - Reason for increase
   - Impact on margins
4. User documents rate change
5. System:
   - Pro-rates commission for rate change period
   - Updates placement rate going forward
   - Notifies Finance for invoicing
   - Recalculates revenue forecast
6. User notifies consultant of rate increase (if applicable)

### A5: Placement Rescue - Intervention

**Trigger:** At-risk placement flagged during check-in

**Flow:**
1. User flags placement as "At Risk"
2. System creates escalation case
3. Bench manager reviews situation
4. Intervention team assembled:
   - Bench Sales Recruiter
   - Account Manager
   - Bench Sales Manager
   - HR (if needed)
5. Intervention plan:
   - If consultant issue: Coaching, training, mentorship
   - If client issue: Expectation alignment, role adjustment
   - If fit issue: Internal transfer or graceful exit
6. Execute plan with 1-2 week review period
7. Outcomes:
   - **Success**: Placement stabilized, health improves
   - **Partial**: Consultant agrees to stay short-term while finding replacement
   - **Failure**: Planned termination with transition

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Check-In Date | Cannot be future | "Check-in date cannot be in the future" |
| Consultant Satisfaction | Required | "Please rate consultant satisfaction" |
| Client Satisfaction | Required if contacted | "Please rate client satisfaction" |
| Overall Health | Required | "Please assess overall placement health" |
| Intent to Stay | Required | "Please indicate consultant's intent to stay" |
| Issue Description | Min 50 chars | "Please provide detailed issue description (min 50 characters)" |
| Improvement Actions | Min 1 | "Please add at least one improvement action" |

---

## Business Rules

### Check-In Frequency

| Placement Age | Check-In Frequency | Type |
|---------------|-------------------|------|
| Day 1 | Day 1 | Onboarding |
| Week 1 | Week 1 | Integration |
| Weeks 2-4 | Weekly | Early monitoring |
| Month 1-3 | 30/60/90 days | Milestone |
| 3+ months | Quarterly | Ongoing |

### Escalation Triggers

| Condition | Escalation | Stakeholder |
|-----------|------------|-------------|
| Consultant satisfaction ≤2 | Immediate | Manager + HR |
| Client satisfaction ≤2 | Immediate | Manager + Account Mgr |
| Performance issue (High) | Immediate | Manager + HR |
| 2+ check-ins overdue | Weekly summary | Manager |
| Intent to leave | Immediate | Manager |
| Extension unlikely + valuable placement | 30 days before end | Manager + Account Mgr |

### Performance Improvement Timeline

| Severity | Review Period | Escalation if No Improvement |
|----------|---------------|------------------------------|
| Low | 30 days | Medium severity |
| Medium | 14 days | High severity, PIP |
| High | 7 days | Termination consideration |

---

## Related Use Cases

- [10-make-placement.md](./10-make-placement.md) - Creating placements
- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [16-vendor-commission.md](./16-vendor-commission.md) - Commission tracking for vendor placements
- [20-bench-dashboard.md](./20-bench-dashboard.md) - Bench Sales dashboard metrics

---

*Last Updated: 2024-11-30*
