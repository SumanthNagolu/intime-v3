# Use Case: Handle Client Escalation

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-017 |
| Actor | Recruiter (Account Manager Role) |
| Goal | Resolve client issues and concerns quickly to maintain relationship health |
| Frequency | As needed (hopefully rare) |
| Estimated Time | 30 minutes - 2 hours depending on severity |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. User is account owner or assigned to escalation
3. Issue has been identified or reported
4. User has "account.update" permission

---

## Trigger

One of the following:
- Client expresses dissatisfaction (call, email, meeting)
- Candidate performance issue reported
- Billing dispute or payment issue
- Quality concerns about submissions
- SLA violation (e.g., time-to-submit exceeded)
- Contract or rate disagreement
- No-show or candidate drop-out
- Compliance or legal concern

---

## Main Flow (Click-by-Click)

### Step 1: Create Escalation Record

**User Action:** From account detail or Today View, click "⚠ Report Escalation"

**System Response:**
- Escalation modal opens
- Form to capture issue details

**Screen State:**
```
+----------------------------------------------------------+
|                                    Report Escalation     |
|                                                      [×]  |
+----------------------------------------------------------+
| Account: Google Inc                                       |
| Reported by: You (John Smith)                            |
| Date/Time: Dec 5, 2025 3:45 PM                           |
+----------------------------------------------------------+
|                                                           |
| Escalation Type *                                         |
| [Quality Concern                           ▼]            |
|                                                           |
| Severity *                                                |
| ○ Low (Minor issue, no immediate impact)                  |
| ○ Medium (Affecting relationship, needs attention)        |
| ○ High (Significant impact, urgent resolution needed)     |
| ○ Critical (Account at risk, immediate action required)   |
|                                                           |
| Related Entity                                            |
| [Link to job, candidate, submission, placement]           |
| • Job: Senior Backend Engineer (#1234)                    |
|                                                           |
| Issue Summary *                                           |
| [Brief description (50-200 chars)              ]          |
|                                                           |
| Detailed Description *                                    |
| [                                              ]          |
| [                                              ]          |
| [                                              ] 0/2000   |
|                                                           |
| Client Impact                                             |
| □ Revenue at risk                                         |
| □ Relationship damage                                     |
| □ Legal/compliance concern                                |
| □ Timeline impact                                         |
| □ Reputation damage                                       |
|                                                           |
| Root Cause (if known)                                     |
| [Select or type...                         ▼]            |
|                                                           |
| Immediate Actions Taken                                   |
| [What you've already done to address...     ]            |
|                                                           |
| Resolution Plan                                           |
| [How you plan to resolve...                 ]            |
|                                                           |
| Manager Notification *                                    |
| ○ Notify immediately (High/Critical)                      |
| ○ Include in daily summary (Low/Medium)                   |
|                                                           |
| Estimated Resolution Time                                 |
| [Select timeframe...                       ▼]            |
|                                                           |
+----------------------------------------------------------+
|                  [Cancel]  [Create Escalation ✓]         |
+----------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 2: Select Escalation Type

**User Action:** Click dropdown, select issue type

**Field Specification: Escalation Type**
| Property | Value |
|----------|-------|
| Field Name | `escalationType` |
| Type | Dropdown |
| Required | Yes |
| Options | |
| - `quality_concern` | "Quality Concern" (Submissions not meeting expectations) |
| - `candidate_issue` | "Candidate Issue" (Performance, no-show, drop-out) |
| - `billing_dispute` | "Billing Dispute" (Payment, rate, invoice issues) |
| - `sla_violation` | "SLA Violation" (Missed deadlines, commitments) |
| - `contract_dispute` | "Contract Dispute" (Terms, rates, MSA issues) |
| - `communication` | "Communication Issue" (Response time, clarity) |
| - `compliance` | "Compliance/Legal" (Legal concerns, regulations) |
| - `relationship` | "Relationship Damage" (Trust, satisfaction) |
| - `other` | "Other" (Specify in description) |

**Time:** ~30 seconds

---

### Step 3: Set Severity Level

**User Action:** Select severity radio button

**System Response:**
- If High or Critical: Manager notification defaults to "Immediate"
- SLA timer starts based on severity
- Escalation routing determined

**Field Specification: Severity**
| Property | Value |
|----------|-------|
| Field Name | `severity` |
| Type | Radio Button Group |
| Required | Yes |
| SLA Response Times | |
| - `low` | "Low" (Response: 24 hours) |
| - `medium` | "Medium" (Response: 4 hours) |
| - `high` | "High" (Response: 2 hours) |
| - `critical` | "Critical" (Response: Immediate) |

**Severity Guidelines:**
- **Critical:** Account at risk of churn, legal issue, major revenue impact
- **High:** Significant relationship damage, urgent client request
- **Medium:** Client frustrated but manageable, needs timely response
- **Low:** Minor inconvenience, can be resolved in normal course

**Time:** ~30 seconds

---

### Step 4: Link Related Entity

**User Action:** Search and link related job, candidate, submission, or placement

**System Response:**
- Search results show relevant entities
- Can link multiple entities
- Linked entities shown with context

**Field Specification: Related Entity**
| Property | Value |
|----------|-------|
| Field Name | `relatedEntities` |
| Type | Multi-search Dropdown |
| Options | Jobs, Candidates, Submissions, Placements |
| Required | No (but recommended) |
| Benefit | Provides context for resolution |

**Time:** ~1 minute

---

### Step 5: Write Issue Summary and Description

**User Action:** Type concise summary and detailed description

**Field Specification: Issue Summary**
| Property | Value |
|----------|-------|
| Field Name | `issueSummary` |
| Type | Text Input |
| Required | Yes |
| Min Length | 50 characters |
| Max Length | 200 characters |
| Purpose | Quick reference for escalation list |

**Example:** "Client unhappy with quality of React submissions - 3 of 5 didn't meet senior level expectations"

**Field Specification: Detailed Description**
| Property | Value |
|----------|-------|
| Field Name | `detailedDescription` |
| Type | Textarea |
| Required | Yes |
| Max Length | 2000 characters |
| Should Include | What happened, when, who was involved, client's exact feedback |

**Example:**
```
Sarah Chen (VP Engineering) called today (Dec 5, 3:30 PM) expressing
frustration with recent React Developer submissions. Out of 5 candidates
submitted this week:

- 3 were screened but didn't have the senior-level architecture
  experience required
- 2 had good technical skills but Sarah felt we didn't properly
  assess their communication abilities
- Client specifically mentioned one candidate (John Doe) who
  "clearly wasn't prepared for the conversation"

Sarah said: "I expected higher quality candidates from you. This is
taking up too much of my team's time interviewing people who aren't
close to what we need."

She's questioning whether to continue using us for this role.
```

**Time:** ~5 minutes

---

### Step 6: Document Immediate Actions Taken

**User Action:** Type actions already taken during/after client conversation

**Example:**
```
IMMEDIATE ACTIONS TAKEN:

1. Apologized and acknowledged the issue
2. Committed to review our screening process for this role
3. Offered to re-screen all candidates in pipeline before sending more
4. Scheduled follow-up call for tomorrow to present improved process
5. Put submissions on hold until we align on expectations
6. Started review of job requirements vs candidates submitted
```

**Time:** ~3 minutes

---

### Step 7: Outline Resolution Plan

**User Action:** Type proposed resolution steps

**Example:**
```
RESOLUTION PLAN:

Short-term (Next 24-48 hours):
1. Call Sarah tomorrow (Dec 6, 2 PM) to review screening criteria
2. Update job requirements with specific architecture experience needed
3. Create more detailed technical screening rubric
4. Re-screen 8 candidates in pipeline with new criteria
5. Send only top 2 candidates (best matches) for next round
6. Personally prep each candidate before client interviews

Medium-term (Next 2 weeks):
1. Implement technical assessment for all React candidates
2. Schedule calibration call with Sarah to align on "senior level"
3. Provide candidate comparison matrix with each submission
4. Weekly quality check-ins until confidence restored

Long-term (Next month):
1. Apply learnings to all Google roles
2. Document Google-specific quality standards
3. Train manager on Google's expectations
4. Implement account-specific screening templates
```

**Time:** ~5 minutes

---

### Step 8: Set Manager Notification

**User Action:** Select notification timing

**System Response:**
- If "Notify immediately": Manager gets real-time alert
- If "Daily summary": Included in end-of-day report

**Field Specification: Manager Notification**
| Property | Value |
|----------|-------|
| Field Name | `managerNotification` |
| Type | Radio Button Group |
| Auto-selected | Based on severity (High/Critical = Immediate) |
| Options | Notify immediately, Include in daily summary |

**Time:** ~10 seconds

---

### Step 9: Create Escalation

**User Action:** Click "Create Escalation ✓"

**System Response:**
1. Escalation record created
2. Manager notified (based on selection)
3. SLA timer starts
4. Account health score updated (flagged)
5. Escalation appears in Today View
6. Toast: "Escalation created - Manager notified"
7. Escalation detail view opens

**Screen State (Escalation Detail):**
```
+----------------------------------------------------------+
| ESCALATION #ESC-1234                      [Edit] [Close] |
| Quality Concern • High Severity • Open                    |
| Created: Dec 5, 2025 3:45 PM by John Smith               |
+----------------------------------------------------------+
| ⏰ SLA: Respond within 2 hours (⚠ 1:45 remaining)        |
+----------------------------------------------------------+
|                                                           |
| ACCOUNT: Google Inc                      [View Account]  |
| RELATED: Job #1234 - React Developer     [View Job]      |
|                                                           |
| ISSUE SUMMARY                                             |
| Client unhappy with quality of React submissions - 3 of 5 |
| didn't meet senior level expectations                     |
|                                                           |
| DETAILED DESCRIPTION                                      |
| [Full description as entered...]                          |
|                                                           |
| CLIENT IMPACT                                             |
| ⚠ Revenue at risk                                         |
| ⚠ Relationship damage                                     |
|                                                           |
| RESOLUTION PLAN                                           |
| [Full resolution plan as entered...]                      |
|                                                           |
| ESCALATION TIMELINE                                       |
| ┌─────────────────────────────────────────────────────┐ |
| │ Dec 5, 3:45 PM • Escalation created                 │ |
| │ Dec 5, 3:46 PM • Manager (Sarah Jones) notified    │ |
| │ Dec 5, 4:00 PM • Manager acknowledged               │ |
| │                                                     │ |
| │ [Pending actions...]                                │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| ACTION ITEMS                                              |
| ⬜ Call client tomorrow 2 PM (Due: Dec 6)                 |
| ⬜ Update job requirements (Due: Dec 6)                   |
| ⬜ Re-screen pipeline candidates (Due: Dec 7)             |
| ⬜ Create technical assessment (Due: Dec 9)               |
|                                                           |
| UPDATES & NOTES                             [+ Add Update]|
| ┌─────────────────────────────────────────────────────┐ |
| │ [No updates yet]                                    │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| QUICK ACTIONS                                             |
| [📞 Log Call] [✉ Email Client] [📝 Add Note]            |
| [✅ Mark Resolved] [🔺 Escalate to Director]             |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 10: Execute Resolution Plan

**User Action:** Work through action items, log updates

**System Response:**
- Each update logged with timestamp
- SLA timer visible
- Manager can track progress in real-time

**Example Updates:**
```
Dec 5, 4:30 PM - John Smith
Called Sarah to confirm tomorrow's meeting. She appreciated the quick
response. Meeting set for 2 PM tomorrow.

Dec 6, 10:00 AM - John Smith
Reviewed all 8 candidates in pipeline. Only 2 meet updated criteria:
- Jane Doe: 8 yrs React, led 3 major architecture projects
- Tom Wilson: 10 yrs, built 2 large-scale React apps from scratch

Will submit only these two after alignment call.

Dec 6, 2:00 PM - John Smith
Excellent call with Sarah. She clarified "senior" means:
- 7+ years React production experience
- Led team or project (architecture decisions)
- Can whiteboard system design
- Strong communication (must prep before interviews)

She's happy with new screening approach. Relationship repaired.

Dec 6, 2:30 PM - John Smith
Sent revised submissions for Jane and Tom with detailed profiles.
Sarah replied: "This is exactly what I was looking for. Thank you for
the quick turnaround and taking my feedback seriously."

Ready to mark as resolved.
```

**Time:** Varies (hours to days depending on issue)

---

### Step 11: Mark Escalation Resolved

**User Action:** Click "✅ Mark Resolved"

**System Response:**
- Resolution modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                                    Resolve Escalation     |
+----------------------------------------------------------+
|                                                           |
| Resolution Summary *                                      |
| [Brief summary of how issue was resolved    ]            |
|                                                           |
| Resolution Actions Taken *                                |
| [                                              ]          |
| [                                              ] 0/1000   |
|                                                           |
| Client Satisfaction Post-Resolution                       |
| ○ Very Satisfied  ○ Satisfied  ○ Neutral  ○ Unsatisfied  |
|                                                           |
| Lessons Learned                                           |
| [What we learned, process improvements...   ]            |
|                                                           |
| Preventive Measures Implemented                           |
| [Steps taken to prevent recurrence...       ]            |
|                                                           |
| Time to Resolve: 1 day, 2 hours (Auto-calculated)        |
|                                                           |
| □ Update account processes with learnings                 |
| □ Share learnings with team                               |
| □ Create training materials from this case                |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Mark Resolved ✓]           |
+----------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 12: Complete Resolution

**User Action:** Fill resolution details, click "Mark Resolved ✓"

**System Response:**
1. Escalation status → "Resolved"
2. Resolution logged with timestamp
3. Account health score updated (recovery tracked)
4. Manager notified of resolution
5. If "Share learnings" checked: Email sent to team
6. Toast: "Escalation resolved successfully"
7. Redirects to account detail

**Time:** ~1 second

---

## Postconditions

1. ✅ Escalation documented in system
2. ✅ Manager notified and aware
3. ✅ SLA compliance tracked
4. ✅ Resolution plan executed
5. ✅ Client relationship status updated
6. ✅ Account health score reflects issue and resolution
7. ✅ Lessons learned captured for team
8. ✅ Preventive measures implemented

---

## Events Logged

| Event | Payload |
|-------|---------|
| `escalation.created` | `{ escalation_id, account_id, type, severity, created_by }` |
| `escalation.updated` | `{ escalation_id, update_type, content, updated_by }` |
| `escalation.resolved` | `{ escalation_id, resolution_summary, time_to_resolve, satisfaction }` |
| `account.health_flagged` | `{ account_id, risk_level_change, reason: 'escalation' }` |
| `manager.notified` | `{ manager_id, escalation_id, notification_type }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Required Fields | Summary or description empty | "Please complete all required fields" | Fill in fields |
| SLA Expired | Not resolved in time | "SLA expired - Manager escalation required" | Escalate to director |
| Invalid Severity | None selected | "Please select severity level" | Select severity |

---

## Alternative Flows

### A1: Escalate to Regional Director

If recruiter and manager can't resolve:
1. Click "🔺 Escalate to Director"
2. Add notes on attempts made
3. Director notified immediately
4. Director reviews and takes ownership
5. May involve executive team if critical

### A2: Critical Account-at-Risk Escalation

If severity = Critical:
1. Manager notified via phone call + email + app
2. CEO/COO automatically notified
3. SLA = Immediate response required
4. Daily updates mandatory
5. Executive team tracks resolution

---

## Related Use Cases

- [15-manage-client-relationship.md](./15-manage-client-relationship.md) - Prevention
- [16-conduct-client-meeting.md](./16-conduct-client-meeting.md) - Issue may arise in meeting
- [04-submit-candidate.md](./04-submit-candidate.md) - Quality issues

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create high severity escalation | Manager notified immediately |
| TC-002 | Create low severity escalation | Included in daily summary |
| TC-003 | SLA expires without resolution | Auto-escalation to director |
| TC-004 | Resolve within SLA | Account health improves |
| TC-005 | Critical escalation created | CEO/COO notified |
| TC-006 | Add resolution learnings | Shared with team |

---

## Database Schema Reference

### Table: escalations

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `escalation_number` | VARCHAR | Human-readable (ESC-1234) |
| `org_id` | UUID | FK |
| `account_id` | UUID | FK to accounts |
| `escalation_type` | ENUM | Type of issue |
| `severity` | ENUM | low, medium, high, critical |
| `issue_summary` | VARCHAR(200) | Brief summary |
| `detailed_description` | TEXT | Full description |
| `related_entities` | JSONB | Linked jobs, candidates, etc. |
| `client_impact` | TEXT[] | Impact areas |
| `immediate_actions` | TEXT | Actions taken |
| `resolution_plan` | TEXT | Plan to resolve |
| `status` | ENUM | open, in_progress, resolved, escalated |
| `created_by` | UUID | FK to user |
| `assigned_to` | UUID | FK to user |
| `resolved_by` | UUID | FK to user |
| `resolution_summary` | TEXT | How it was resolved |
| `time_to_resolve` | INTERVAL | Resolution time |
| `client_satisfaction` | ENUM | Post-resolution |
| `lessons_learned` | TEXT | Takeaways |
| `created_at` | TIMESTAMP | |
| `resolved_at` | TIMESTAMP | |

---

*Last Updated: 2025-11-30*
