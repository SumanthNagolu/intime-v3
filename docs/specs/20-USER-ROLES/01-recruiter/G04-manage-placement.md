# Use Case: Manage Placement (30/60/90 Day Check-ins)

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-023 |
| Actor | Recruiter (Delivery Manager Role) |
| Goal | Ensure placement success through structured check-ins and issue resolution |
| Frequency | 30-day, 60-day, and 90-day intervals per placement |
| Estimated Time | 15-30 minutes per check-in |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Placement exists and is active
3. User is placement owner or RACI stakeholder
4. Candidate has started working
5. User has "placement.read" and "placement.update" permissions

---

## Trigger

One of the following:
- Automated task created at 30/60/90 day mark
- Check-in reminder appears in Today View
- Proactive check-in before milestone
- Issue reported by candidate or client
- Extension discussion approaching

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Placement Check-in

**User Action:** Click check-in task from Today View or navigate to Placement detail

**System Response:**
- Placement detail page loads
- Check-in status visible
- Next check-in highlighted

**Screen State:**
```
+----------------------------------------------------------+
| PLACEMENT #PL-1234                        [Edit] [⋮ More] |
| Alex Rodriguez • Google Inc • Active                      |
| Senior Backend Engineer                                   |
+----------------------------------------------------------+
| 📊 PLACEMENT HEALTH                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ Start Date:       Nov 1, 2025                       │  |
| │ Days Active:      34 days                          │  |
| │ Current Status:   ✅ Active & Performing           │  |
| │ Next Check-in:    ⚠ 30-Day Due Today              │  |
| │ Retention Risk:   🟢 Low Risk                      │  |
| │ Extension Status: Not yet discussed                │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| CHECK-IN TIMELINE                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ ✅ Day 1 (Nov 1)   First day successful            │  |
| │ ✅ Day 7 (Nov 8)   Week 1 check-in completed       │  |
| │ ⏳ Day 30 (Dec 1)  30-day check-in DUE TODAY       │  |
| │ ⏰ Day 60 (Dec 31) 60-day check-in upcoming        │  |
| │ ⏰ Day 90 (Jan 30) 90-day check-in upcoming        │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| PLACEMENT DETAILS                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ Candidate:        Alex Rodriguez                   │  |
| │ Client:           Google Inc                       │  |
| │ Job:              Senior Backend Engineer          │  |
| │ Hiring Manager:   Sarah Chen (VP Engineering)      │  |
| │ Bill Rate:        $95/hr                           │  |
| │ Pay Rate:         $70/hr                           │  |
| │ Margin:           $25/hr (26.3%)                   │  |
| │ Contract Type:    Contract (6 months)              │  |
| │ End Date:         May 1, 2026                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| QUICK ACTIONS                                            |
| [📞 30-Day Check-in] [✉ Email Candidate] [📊 View Stats]|
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "30-Day Check-in" Button

**User Action:** Click "📞 30-Day Check-in" button

**System Response:**
- Check-in form modal opens
- Pre-populated with placement context
- Structured questionnaire displayed

**Screen State:**
```
+----------------------------------------------------------+
|                              30-Day Placement Check-in   |
|                                                      [×]  |
+----------------------------------------------------------+
| Placement: Alex Rodriguez @ Google Inc                   |
| Start Date: Nov 1, 2025 • Day 30 of 180                 |
+----------------------------------------------------------+
| Check-in Date: [12/01/2025              ] [Today]        |
|                                                           |
| CANDIDATE CHECK-IN                                        |
| ─────────────────────────────────────────────────────── |
|                                                           |
| Candidate Contact Method                                  |
| ○ Phone Call  ○ Video Call  ○ In-Person  ○ Email         |
|                                                           |
| Candidate Response Status                                 |
| ○ Completed  ○ Scheduled  ○ Left Message  ○ No Response  |
|                                                           |
| 1. How is the assignment going overall? *                 |
| ○ Excellent  ○ Good  ○ Fair  ○ Poor                      |
|                                                           |
| 2. Are you satisfied with the role and responsibilities?  |
| ○ Very Satisfied  ○ Satisfied  ○ Neutral  ○ Unsatisfied |
|                                                           |
| 3. How is your relationship with the team/manager?        |
| ○ Excellent  ○ Good  ○ Fair  ○ Poor                      |
|                                                           |
| 4. Workload and work-life balance?                        |
| ○ Just Right  ○ A bit much  ○ Too much  ○ Too little    |
|                                                           |
| 5. Are you being paid on time and correctly?              |
| ○ Yes, no issues  ○ Minor delay  ○ Major issue           |
|                                                           |
| 6. Any issues or concerns we should know about?           |
| [                                              ]          |
| [                                              ] 0/500    |
|                                                           |
| 7. Interest in extension/conversion? *                    |
| ○ Definitely interested                                   |
| ○ Probably interested                                     |
| ○ Unsure / Depends                                        |
| ○ Not interested                                          |
| ○ Too early to say                                        |
|                                                           |
| Candidate Sentiment (Overall) *                           |
| ○ Very Positive  ○ Positive  ○ Neutral  ○ Negative       |
|                                                           |
| Candidate Notes                                           |
| [Detailed notes from conversation...        ]            |
|                                              ] 0/1000     |
|                                                           |
| CLIENT CHECK-IN                                           |
| ─────────────────────────────────────────────────────── |
|                                                           |
| Client Contact Method                                     |
| ○ Phone Call  ○ Video Call  ○ In-Person  ○ Email         |
|                                                           |
| Client Contact: [Sarah Chen - VP Engineering   ▼]        |
|                                                           |
| 1. How is Alex performing? *                              |
| ○ Exceeds Expectations  ○ Meets  ○ Below  ○ Not Meeting |
|                                                           |
| 2. Integration with team?                                 |
| ○ Excellent  ○ Good  ○ Fair  ○ Poor                      |
|                                                           |
| 3. Quality of work?                                       |
| ○ Excellent  ○ Good  ○ Fair  ○ Poor                      |
|                                                           |
| 4. Communication and collaboration?                       |
| ○ Excellent  ○ Good  ○ Fair  ○ Poor                      |
|                                                           |
| 5. Would you extend/convert Alex if needed?               |
| ○ Definitely  ○ Probably  ○ Unsure  ○ Probably Not      |
|                                                           |
| 6. Any concerns or feedback?                              |
| [                                              ]          |
| [                                              ] 0/500    |
|                                                           |
| Client Satisfaction *                                     |
| ○ Very Satisfied  ○ Satisfied  ○ Neutral  ○ Unsatisfied |
|                                                           |
| Client Notes                                              |
| [Detailed notes from conversation...        ]            |
|                                              ] 0/1000     |
|                                                           |
| CHECK-IN SUMMARY                                          |
| ─────────────────────────────────────────────────────── |
|                                                           |
| Overall Placement Health *                                |
| ○ Excellent (No issues, high satisfaction both sides)     |
| ○ Good (Minor issues, generally positive)                 |
| ○ At Risk (Concerns identified, action needed)            |
| ○ Critical (Major issues, immediate intervention)         |
|                                                           |
| Risk Factors Identified                                   |
| □ Candidate unhappy with role/team                        |
| □ Client performance concerns                             |
| □ Workload issues                                         |
| □ Pay/billing issues                                      |
| □ Cultural fit concerns                                   |
| □ Candidate seeking other opportunities                   |
| □ Client may not extend                                   |
|                                                           |
| Action Items                                              |
| [+ Add action item]                                       |
|                                                           |
| Next Check-in Date                                        |
| [12/31/2025 (60-day)                       📅]           |
|                                                           |
| Follow-up Required                                        |
| ○ No follow-up needed                                     |
| ○ Schedule follow-up call (Date: [___])                  |
| ○ Escalate to manager                                     |
|                                                           |
+----------------------------------------------------------+
|                  [Save Draft]  [Complete Check-in ✓]     |
+----------------------------------------------------------+
```

**Time:** ~20-30 minutes to complete both conversations

---

### Step 3: Document Candidate Check-in

**User Action:** Complete candidate section based on phone call/meeting

**Field Specification: Candidate Questions**

| Question | Field Type | Required | Purpose |
|----------|-----------|----------|---------|
| Overall satisfaction | Rating scale | Yes | General health indicator |
| Role satisfaction | Rating scale | Yes | Job match quality |
| Team/manager relationship | Rating scale | Yes | Cultural fit, management |
| Workload balance | Rating scale | Yes | Burnout risk |
| Payment issues | Yes/No/Issue | Yes | Admin/payroll check |
| Issues/concerns | Textarea | No | Open feedback |
| Extension interest | Rating scale | Yes | Retention planning |
| Overall sentiment | Rating scale | Yes | Composite measure |
| Notes | Textarea | No | Detailed conversation notes |

**Time:** ~10-15 minutes for candidate conversation + documentation

---

### Step 4: Document Client Check-in

**User Action:** Complete client section based on phone call/meeting

**Field Specification: Client Questions**

| Question | Field Type | Required | Purpose |
|----------|-----------|----------|---------|
| Performance rating | Rating scale | Yes | Job performance |
| Team integration | Rating scale | Yes | Cultural fit |
| Work quality | Rating scale | Yes | Output quality |
| Communication | Rating scale | Yes | Soft skills |
| Extension interest | Rating scale | Yes | Retention planning |
| Concerns/feedback | Textarea | No | Open feedback |
| Satisfaction | Rating scale | Yes | Composite measure |
| Notes | Textarea | No | Detailed conversation notes |

**Time:** ~10-15 minutes for client conversation + documentation

---

### Step 5: Assess Overall Health and Risks

**User Action:** Based on both check-ins, select overall health rating and any risk factors

**System Response:**
- Risk score calculated automatically
- If "At Risk" or "Critical": Action items become required
- If risk factors checked: Prompts for action plan

**Health Rating Logic:**
```
Excellent:
  - Candidate: Very Positive/Positive sentiment
  - Client: Very Satisfied/Satisfied
  - No risk factors
  - Both interested in extension

Good:
  - Mostly positive feedback
  - Minor issues identified
  - Action plan in place

At Risk:
  - Candidate Neutral/Negative sentiment
  - Client concerns about performance
  - 1-2 significant risk factors
  - Extension uncertain

Critical:
  - Candidate planning to leave
  - Client very unsatisfied
  - Multiple risk factors
  - Termination possible
```

**Time:** ~2 minutes

---

### Step 6: Add Action Items (If Needed)

**User Action:** Click "+ Add action item" for each follow-up needed

**Example Action Items:**
```
⬜ Follow up on payroll delay issue with Finance team
   Due: Dec 2 | Assigned to: You

⬜ Schedule weekly 1-on-1s with candidate for next month
   Due: Dec 8 | Assigned to: You

⬜ Discuss workload concerns with hiring manager
   Due: Dec 3 | Assigned to: You

⬜ Send candidate training resources for new tech stack
   Due: Dec 5 | Assigned to: You
```

**Time:** ~3 minutes

---

### Step 7: Set Next Check-in Date

**User Action:** Confirm or adjust next check-in date

**System Response:**
- Default: 60-day mark (30 days from now)
- Can adjust if early check-in needed
- Task created automatically

**Time:** ~30 seconds

---

### Step 8: Complete Check-in

**User Action:** Click "Complete Check-in ✓"

**System Response:**
1. Check-in record saved
2. Placement status updated
3. Risk level calculated and flagged if needed
4. If "Escalate to manager" selected: Manager notified
5. Action items created as tasks
6. Next check-in task created
7. Activities logged for both candidate and client
8. Toast: "30-day check-in completed successfully"
9. Placement detail page updates with new status

**Screen State (Updated Placement Detail):**
```
+----------------------------------------------------------+
| PLACEMENT #PL-1234                                        |
| Alex Rodriguez • Google Inc • Active                      |
+----------------------------------------------------------+
| 📊 PLACEMENT HEALTH: 🟢 Excellent                         |
| Last Check-in: 30-day (Dec 1) - Both parties very happy  |
+----------------------------------------------------------+
| CHECK-IN TIMELINE                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ ✅ Day 30 (Dec 1)  30-day check-in completed        │  |
| │    • Candidate: Very Positive                       │  |
| │    • Client: Very Satisfied - Exceeds expectations  │  |
| │    • Health: Excellent                              │  |
| │    • Extension: Both interested                     │  |
| │    [View Details]                                   │  |
| │                                                     │  |
| │ ⏰ Day 60 (Dec 31) 60-day check-in upcoming         │  |
| │ ⏰ Day 90 (Jan 30) 90-day check-in upcoming         │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| OPEN ACTION ITEMS (2)                                    |
| ⬜ Follow up on payroll delay (Due: Dec 2)               |
| ⬜ Schedule weekly 1-on-1s (Due: Dec 8)                  |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## 60-Day Check-in Differences

At 60 days, additional questions included:

**Candidate:**
- Extension/conversion timeline preferences
- Salary expectations for conversion (if applicable)
- Long-term career goals with client
- Would you recommend InTime to others?

**Client:**
- Extension decision timeline
- Budget for extension/conversion
- Performance review formal results
- Interested in other candidates like this one?

---

## 90-Day Check-in Differences

At 90 days, focus shifts to:

**Candidate:**
- Final extension decision
- Conversion interest and salary expectations
- Next assignment preferences (if ending)
- Testimonial/referral request

**Client:**
- Extension/conversion decision (final)
- Start next job search (if needed)
- Request testimonial if great experience
- Discuss other hiring needs

---

## Postconditions

1. ✅ Check-in completed and documented
2. ✅ Candidate satisfaction captured
3. ✅ Client satisfaction captured
4. ✅ Placement health status updated
5. ✅ Risk factors identified and flagged
6. ✅ Action items created for follow-up
7. ✅ Next check-in scheduled
8. ✅ Manager notified if issues identified
9. ✅ Retention metrics updated

---

## Events Logged

| Event | Payload |
|-------|---------|
| `placement.checkin_completed` | `{ placement_id, checkin_type: '30_day', health_status, sentiment }` |
| `activity.created` | `{ activity_type: 'placement_checkin', placement_id, candidate_id, notes }` |
| `activity.created` | `{ activity_type: 'placement_checkin', placement_id, account_id, notes }` |
| `placement.health_updated` | `{ placement_id, health_status, risk_level, risk_factors }` |
| `task.created` | `{ task_type: 'placement_followup', placement_id, action_item }` (per action) |
| `task.created` | `{ task_type: 'placement_checkin', placement_id, due_date: '60_day' }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Required Field | Sentiment not selected | "Please complete all required fields" | Fill required fields |
| Check-in Too Early | More than 5 days before due | "Check-in not yet due. Proceed anyway?" | Confirm or cancel |
| No Action Items for At-Risk | Risk but no actions | "Please add action items to address risks" | Add action items |
| Manager Not Notified | Critical issue, no escalation | "Critical issues should be escalated" | Check escalation box |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+S` | Save draft |
| `Cmd+Enter` | Complete check-in |
| `Tab` | Next field |
| `Cmd+A` | Add action item |

---

## Alternative Flows

### A1: Early Intervention Check-in

If issues arise before scheduled check-in:
1. Click "Ad-hoc Check-in"
2. Simplified form focusing on specific issue
3. Does not replace scheduled check-in
4. Logged separately

### A2: Failed to Reach Candidate/Client

If unable to connect:
1. Mark as "Attempted - No Response"
2. Task created to retry in 2 days
3. After 3 attempts: Escalate to manager
4. Check-in remains incomplete

### A3: Placement Ending Early

If termination or early end discussed:
1. Additional section appears: "Termination Details"
2. Capture: Reason, notice period, final date
3. Manager automatically notified
4. Exit process initiated

---

## Related Use Cases

- [G03-confirm-placement.md](./G03-confirm-placement.md) - Initial placement
- [G01-extend-offer.md](./G01-extend-offer.md) - Extension offers
- [C04-manage-client-relationship.md](./C04-manage-client-relationship.md) - Ongoing client relationship

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Complete 30-day check-in with "Excellent" | Health updated, next check-in scheduled |
| TC-002 | Complete with "At Risk" status | Action items required, manager notified |
| TC-003 | Complete with "Critical" status | Manager and director notified immediately |
| TC-004 | Candidate unhappy, client happy | Risk flagged, action items to address candidate |
| TC-005 | Both interested in extension | Extension discussion task created |
| TC-006 | Payment issue reported | Finance team notified, action item created |
| TC-007 | Failed to reach candidate after 3 attempts | Escalated to manager |
| TC-008 | 60-day check-in with conversion interest | Conversion process task created |

---

## Backend Processing

### tRPC Procedures

- `placements.createCheckin` - Save check-in
- `placements.updateHealth` - Update health status
- `tasks.createBulk` - Create action items
- `activities.create` - Log check-in activities

### Check-in Storage

**Table:** `placement_checkins`

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `placement_id` | UUID | FK to placements |
| `checkin_type` | ENUM | 30_day, 60_day, 90_day, ad_hoc |
| `checkin_date` | DATE | When completed |
| `candidate_sentiment` | ENUM | very_positive, positive, neutral, negative |
| `candidate_responses` | JSONB | All candidate answers |
| `client_satisfaction` | ENUM | very_satisfied, satisfied, neutral, unsatisfied |
| `client_responses` | JSONB | All client answers |
| `overall_health` | ENUM | excellent, good, at_risk, critical |
| `risk_factors` | TEXT[] | Array of risk factors |
| `action_items` | JSONB | Action items created |
| `next_checkin_date` | DATE | When next check-in due |
| `conducted_by` | UUID | FK to user |
| `created_at` | TIMESTAMP | |

---

## Enterprise & Multi-National Features

### Multi-Currency Commission Tracking

Placements track commission in both contract currency and payout currency:

| Field | Description |
|-------|-------------|
| `billRateCurrency` | Client's contract currency |
| `payRateCurrency` | Consultant's pay currency |
| `commissionCurrency` | Recruiter's payout currency (typically USD) |
| `exchangeRateAtPlacement` | Locked rate at placement confirmation |

**Commission Example (Cross-Border):**
```
UK Client, Canada Consultant, US Recruiter:
Bill Rate: £95/hr (GBP)
Pay Rate: C$145/hr (CAD)
Monthly Revenue: £16,720 GBP
Commission (5%): £836 GBP → $1,061 USD
```

### Regional Compliance Check-ins

| Region | 30-Day Focus | 60-Day Focus | 90-Day Focus |
|--------|--------------|--------------|--------------|
| **US** | Performance, culture fit | I-9 re-verify if needed | Extension discussion |
| **Canada** | Provincial compliance | Tax forms | Work permit renewal check |
| **UK** | IR35 status review | Right-to-work recheck | PAYE reconciliation |
| **EU** | GDPR data review | Working time compliance | Social security |
| **India** | PF/ESI verification | Attendance compliance | Contract renewal |

### Timezone-Aware Check-in Scheduling

- Recruiter tasks scheduled in recruiter's timezone
- Candidate notifications in candidate's timezone
- Client reminders in client contact's timezone
- Auto-adjustment for daylight saving changes

### Multi-Regional Escalation Paths

| Issue Type | NA | EMEA | APAC |
|------------|-----|------|------|
| Performance | Pod Manager → Regional Director | Pod Manager → Regional Director | Branch Manager → Regional |
| Compliance | HR → Legal | HR → EU Legal | Branch HR → Legal |
| Payment | Finance → CFO | Regional Finance → CFO | Branch Finance → CFO |
| Early Termination | Pod Manager → COO | Regional → COO | Branch → Regional → COO |

### Global Placement Dashboard

Managers can view placement health across regions:
- Real-time status by region
- Currency conversion for revenue comparison
- Compliance status indicators
- Check-in completion rates

### Audit Trail

All placement activities tracked:
```json
{
  "placement_id": "uuid",
  "check_in_audit": [
    {
      "type": "30_day",
      "completed_at": "2025-12-01T14:30:00Z",
      "recruiter_id": "uuid",
      "region": "NA-EAST",
      "candidate_feedback_score": 9,
      "client_feedback_score": 8,
      "issues_flagged": []
    }
  ]
}
```

---

*Last Updated: 2025-12-01*
