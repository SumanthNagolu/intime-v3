# Use Case: Manage Client Relationship

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-015 |
| Actor | Recruiter (Account Manager Role) |
| Goal | Maintain ongoing client relationships and drive satisfaction |
| Frequency | Weekly per client (ongoing activity) |
| Estimated Time | 15-30 minutes per client per week |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. User is assigned as account owner or RACI stakeholder
3. Account exists and is active or prospect status
4. User has "account.read" and "account.update" permissions

---

## Trigger

One of the following:
- Weekly scheduled client check-in
- Client responds to communication
- New job requirement received
- Issue or concern raised
- Scheduled account review meeting
- NPS survey reminder
- Contract renewal approaching

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Account Detail

**User Action:** Click account from Accounts list, Today View, or search

**System Response:**
- Account detail page loads
- URL changes to: `/employee/workspace/accounts/{account-id}`
- Account overview displayed with all key information
- Relationship health indicators shown

**Screen State:**
```
+----------------------------------------------------------+
| Google Inc                           [Edit] [⋮ More]     |
| Account • Active • MSA Signed                            |
+----------------------------------------------------------+
| 📊 RELATIONSHIP HEALTH                                    |
| ┌────────────────────────────────────────────────────┐  |
| │ NPS Score:        9/10 ⭐ (Last: Oct 2025)         │  |
| │ Jobs Active:      8 open, 12 filled YTD            │  |
| │ Revenue YTD:      $458K (Target: $500K)            │  |
| │ Last Contact:     2 days ago (✓ Within SLA)        │  |
| │ Next Check-in:    Tomorrow, 2:00 PM               │  |
| │ Risk Level:       🟢 Low Risk                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| ACCOUNT INFORMATION                                      |
| ┌────────────────────────────────────────────────────┐  |
| │ Industry:         Technology                        │  |
| │ Company Size:     1001-5000 employees              │  |
| │ Location:         Mountain View, CA                │  |
| │ Website:          https://google.com               │  |
| │ Account Type:     Direct Client                    │  |
| │ MSA Signed:       Jan 15, 2025                     │  |
| │ Payment Terms:    Net 30                           │  |
| │ Account Manager:  You (John Smith)                │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| PRIMARY CONTACTS (3)                    [+ Add Contact]  |
| ┌────────────────────────────────────────────────────┐  |
| │ 👤 Sarah Chen - VP Engineering                     │  |
| │    ✉ sarah@google.com  ☎ (650) 555-0100          │  |
| │    Last Contact: 2 days ago • [📞 Call] [✉ Email] │  |
| │                                                     │  |
| │ 👤 Mike Brown - Director of Recruiting            │  |
| │    ✉ mike@google.com  ☎ (650) 555-0101           │  |
| │    Last Contact: 1 week ago • [📞 Call] [✉ Email] │  |
| │                                                     │  |
| │ 👤 Lisa Wang - HR Manager                         │  |
| │    ✉ lisa@google.com  ☎ (650) 555-0102           │  |
| │    Last Contact: 3 weeks ago • [📞 Call] [✉ Email]│  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| TABS: [Overview] [Jobs] [Placements] [Contacts]         |
|       [Activities] [Documents] [Notes]                   |
|                                                          |
| QUICK ACTIONS                                            |
| [📞 Log Call] [✉ Send Email] [📋 Create Job]           |
| [🤝 Schedule Meeting] [📝 Add Note] [📊 View Report]    |
|                                                          |
| RECENT ACTIVITY (Last 30 Days)                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Nov 28 • Call with Sarah - Discussed Q1 needs      │  |
| │ Nov 26 • Email sent - Weekly update on 3 jobs      │  |
| │ Nov 25 • Job created - Senior Backend Engineer     │  |
| │ Nov 22 • Placement confirmed - Alex Rodriguez      │  |
| │ Nov 20 • Meeting - Quarterly Business Review       │  |
| │                                        [View All]   │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| OPEN ITEMS & TASKS                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ ⚠ DUE TODAY: Send weekly job status update         │  |
| │ 📅 Tomorrow: Check-in call with Sarah Chen         │  |
| │ ⏰ Next Week: Quarterly account review             │  |
| │ 📊 Overdue: Q4 NPS survey                          │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Review Relationship Health Dashboard

**User Action:** Review key health indicators at top of page

**System Response:**
- Dashboard shows real-time health metrics
- Color-coded risk indicators
- Automated alerts for issues

**Health Metrics Displayed:**

| Metric | Calculation | Status Indicator |
|--------|-------------|------------------|
| **NPS Score** | Latest survey result | 🟢 Green (9-10), 🟡 Yellow (7-8), 🔴 Red (<7) |
| **Last Contact** | Days since last activity | 🟢 <7 days, 🟡 7-14 days, 🔴 >14 days |
| **Active Jobs** | Count of open jobs | Shows count + YTD filled |
| **Revenue YTD** | Sum of placements this year | Progress vs target |
| **Risk Level** | Composite risk score | 🟢 Low, 🟡 Medium, 🔴 High |

**Risk Calculation:**
```
Risk Score =
  (Days since contact / 7) × 20 +
  (Declined submissions / Total submissions) × 30 +
  (10 - NPS) × 10 +
  (Overdue tasks count) × 20

0-30: Low Risk (🟢)
31-60: Medium Risk (🟡)
61+: High Risk (🔴)
```

**Time:** ~30 seconds

---

### Step 3: Check Open Tasks & Due Items

**User Action:** Review "Open Items & Tasks" section

**System Response:**
- Shows tasks due today, upcoming, and overdue
- Color-coded by urgency
- Click to complete or snooze

**Task Types:**

| Task Type | Auto-Generated When | Frequency |
|-----------|---------------------|-----------|
| Weekly Check-in | Every Monday | Weekly |
| Job Status Update | Jobs > 7 days old | Weekly |
| NPS Survey | Every 90 days | Quarterly |
| Quarterly Review | Every 3 months | Quarterly |
| Contract Renewal | 60 days before expiry | As needed |
| Follow-up on Submission | 3 days after submission | As needed |

**Time:** ~1 minute

---

### Step 4: Review Recent Activity Timeline

**User Action:** Scroll through recent activities

**System Response:**
- Chronological activity feed
- All interactions with account visible
- Filter by type (calls, emails, meetings, jobs, placements)

**Activity Types Logged:**

| Activity | When Logged | Visibility |
|----------|-------------|------------|
| Call | Manual log or auto from phone system | All team |
| Email | Manual or auto from email integration | All team |
| Meeting | Calendar integration | All team |
| Job Created | Automatic | All team |
| Submission Sent | Automatic | All team |
| Placement Confirmed | Automatic | All team |
| Note Added | Manual | All team |
| Document Uploaded | Manual | All team |

**Time:** ~1 minute

---

### Step 5: Log Client Communication (Call)

**User Action:** Click "📞 Log Call" button

**System Response:**
- Call logging modal opens
- Form to capture call details

**Screen State:**
```
+----------------------------------------------------------+
|                                              Log Call    |
|                                                      [×]  |
+----------------------------------------------------------+
|                                                           |
| Contact *                                                 |
| [Sarah Chen - VP Engineering               ▼]            |
|                                                           |
| Call Date & Time *                                        |
| [11/30/2025              ] [2:30 PM        ]             |
|                                                           |
| Duration                                                  |
| [30  ] minutes                                           |
|                                                           |
| Call Type *                                               |
| ○ Outbound Call                                           |
| ○ Inbound Call                                            |
| ○ Scheduled Call                                          |
|                                                           |
| Call Outcome *                                            |
| [Successful - Action Items             ▼]                |
|                                                           |
| Discussion Topics                                         |
| □ Job Requirements     □ Submissions                      |
| □ Placements          □ Account Issues                   |
| □ New Opportunities   □ Feedback                          |
| □ Contract/Pricing    □ Relationship Check-in            |
|                                                           |
| Call Summary *                                            |
| [                                              ]          |
| [                                              ]          |
| [                                              ] 0/1000   |
|                                                           |
| Action Items                                              |
| □ Send job descriptions for 3 new roles                   |
| □ Schedule follow-up next Tuesday                         |
| [+ Add action item]                                       |
|                                                           |
| Next Steps / Follow-up                                    |
| [Follow up on Tuesday with updated candidates  ]          |
|                                                           |
| Call Sentiment                                            |
| ○ Very Positive  ○ Positive  ○ Neutral  ○ Negative       |
|                                                           |
| □ Flag for manager review                                 |
| □ Update NPS based on conversation                        |
|                                                           |
+----------------------------------------------------------+
|                       [Cancel]  [Save Call Log ✓]        |
+----------------------------------------------------------+
```

**Time:** ~2-3 minutes

---

### Step 6: Complete Call Log Form

**User Action:** Fill in call details

**Field Specification: Contact**
| Property | Value |
|----------|-------|
| Field Name | `contactId` |
| Type | Dropdown |
| Label | "Contact" |
| Required | Yes |
| Data Source | Contacts linked to account |

**Field Specification: Call Summary**
| Property | Value |
|----------|-------|
| Field Name | `summary` |
| Type | Textarea |
| Label | "Call Summary" |
| Required | Yes |
| Max Length | 1000 |
| Placeholder | "What was discussed, outcomes, client feedback..." |

**Field Specification: Call Outcome**
| Property | Value |
|----------|-------|
| Field Name | `outcome` |
| Type | Dropdown |
| Options | Successful - Action Items, Successful - No Action, Left Voicemail, No Answer, Scheduled Callback |

**Field Specification: Call Sentiment**
| Property | Value |
|----------|-------|
| Field Name | `sentiment` |
| Type | Radio Buttons |
| Options | Very Positive, Positive, Neutral, Negative |
| Use | Tracks relationship health |

**Time:** ~3 minutes to write summary

---

### Step 7: Save Call Log

**User Action:** Click "Save Call Log ✓"

**System Response:**
1. Activity created
2. If action items checked: Tasks created
3. If sentiment negative: Alert sent to manager
4. If "Update NPS" checked: NPS survey triggered
5. Toast: "Call logged successfully"
6. Activity timeline refreshes with new call
7. "Last Contact" metric updates to today

**Time:** ~1 second

---

### Step 8: Send Weekly Status Email

**User Action:** Click "✉ Send Email" button

**System Response:**
- Email composer opens
- Pre-filled with template for weekly update

**Screen State:**
```
+----------------------------------------------------------+
|                                           Send Email     |
|                                                      [×]  |
+----------------------------------------------------------+
|                                                           |
| To: [sarah@google.com; mike@google.com      ] [+ Add]    |
|                                                           |
| CC: [                                       ]             |
|                                                           |
| Template: [Weekly Job Status Update        ▼] [Load]     |
|                                                           |
| Subject:                                                  |
| [Weekly Update: 8 Active Jobs - Nov 30, 2025]            |
|                                                           |
| Body:                                                     |
| ┌─────────────────────────────────────────────────────┐ |
| │ Hi Sarah and Mike,                                  │ |
| │                                                     │ |
| │ Here's your weekly update on active jobs:           │ |
| │                                                     │ |
| │ 🟢 ACTIVELY RECRUITING (8 jobs)                     │ |
| │ • Senior Backend Engineer - 12 candidates in pipe   │ |
| │ • React Developer - 5 submissions sent this week    │ |
| │ • DevOps Engineer - 3 interviews scheduled          │ |
| │ ... [Auto-populated from active jobs]               │ |
| │                                                     │ |
| │ 📊 THIS WEEK'S ACTIVITY                             │ |
| │ • Submissions sent: 5                               │ |
| │ • Interviews scheduled: 3                           │ |
| │ • Offers extended: 1                                │ |
| │                                                     │ |
| │ 🎯 NEXT WEEK'S FOCUS                                │ |
| │ • Following up on React Developer interviews        │ |
| │ • Sourcing for new Senior Backend role              │ |
| │                                                     │ |
| │ Let me know if you have any questions!              │ |
| │                                                     │ |
| │ Best,                                               │ |
| │ John Smith                                          │ |
| │ [Signature auto-inserted]                           │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| Attachments:                                              |
| [+ Add attachment] [Weekly_Report_Google.pdf] [×]        |
|                                                           |
| □ Track email open                                        |
| □ Log as activity                                         |
| □ Create follow-up task (Date: [___])                    |
|                                                           |
+----------------------------------------------------------+
|                  [Save Draft]  [Cancel]  [Send ✓]        |
+----------------------------------------------------------+
```

**Time:** ~5 minutes to review/adjust template

---

### Step 9: Send Email

**User Action:** Review email, click "Send ✓"

**System Response:**
1. Email sent via integrated system
2. Activity logged automatically
3. If "Track email open": Tracking pixel added
4. If "Follow-up task": Task created
5. Toast: "Email sent successfully"
6. Activity timeline updated

**Time:** ~1 second

---

### Step 10: Add Account Note

**User Action:** Click "📝 Add Note" button

**System Response:**
- Note modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                                          Add Account Note |
|                                                      [×]  |
+----------------------------------------------------------+
|                                                           |
| Note Type                                                 |
| ○ General Note                                            |
| ○ Client Feedback                                         |
| ○ Strategic Information                                   |
| ○ Competitive Intelligence                                |
| ○ Issue/Concern                                           |
|                                                           |
| Note                                                      |
| [                                              ]          |
| [                                              ]          |
| [                                              ] 0/2000   |
|                                                           |
| Tags                                                      |
| [+ Add tag] [VIP] [×] [Price Sensitive] [×]              |
|                                                           |
| Visibility                                                |
| ○ Internal Only (Team can see)                            |
| ○ Private (Only me)                                       |
|                                                           |
| □ Pin to top of account                                   |
| □ Set reminder to review (Date: [___])                    |
|                                                           |
+----------------------------------------------------------+
|                       [Cancel]  [Save Note ✓]            |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 11: Schedule Next Check-in

**User Action:** Click "🤝 Schedule Meeting"

**System Response:**
- Calendar integration opens
- Meeting scheduler displayed

**Screen State:**
```
+----------------------------------------------------------+
|                                      Schedule Meeting     |
|                                                      [×]  |
+----------------------------------------------------------+
|                                                           |
| Meeting Type                                              |
| [Weekly Check-in                           ▼]            |
|                                                           |
| Attendees *                                               |
| Internal: [You (John Smith)                ]             |
| Client:   [Sarah Chen                      ] [+ Add]      |
|                                                           |
| Date & Time *                                             |
| [12/05/2025              ] [2:00 PM - 2:30 PM]           |
|                                                           |
| Meeting Method                                            |
| ○ Video Call (Google Meet)                                |
| ○ Phone Call                                              |
| ○ In-Person                                               |
|                                                           |
| Agenda                                                    |
| □ Job status updates                                      |
| □ New requirements                                        |
| □ Submission feedback                                     |
| □ Placement check-ins                                     |
| □ Account health review                                   |
|                                                           |
| Meeting Notes / Agenda Details                            |
| [Review active jobs, discuss Q1 hiring needs  ]          |
|                                                           |
| □ Send calendar invite to client                          |
| □ Create pre-meeting preparation task                     |
| □ Generate meeting agenda document                        |
|                                                           |
+----------------------------------------------------------+
|              [Cancel]  [Save to Calendar ✓]              |
+----------------------------------------------------------+
```

**Time:** ~3 minutes

---

### Step 12: Review Account Health Score

**User Action:** Click on "View Report" to see detailed health analysis

**System Response:**
- Account health report modal opens
- Detailed breakdown of all metrics

**Screen State:**
```
+----------------------------------------------------------+
|                      Account Health Report: Google Inc    |
|                                                      [×]  |
+----------------------------------------------------------+
|                                                           |
| OVERALL HEALTH SCORE: 87/100 (🟢 Excellent)              |
|                                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │ CLIENT SATISFACTION                    35/40         │ |
| │ • NPS Score: 9/10                      ████████░░   │ |
| │ • Response Rate: 95%                   ████████░░   │ |
| │ • Escalations: 0 (Last 90 days)        ██████████   │ |
| └─────────────────────────────────────────────────────┘ |
| ┌─────────────────────────────────────────────────────┐ |
| │ ENGAGEMENT                             22/30         │ |
| │ • Last Contact: 2 days ago             ██████████   │ |
| │ • Contact Frequency: 2.5x/week         ████████░░   │ |
| │ • Meeting Cadence: On Track            ██████████   │ |
| └─────────────────────────────────────────────────────┘ |
| ┌─────────────────────────────────────────────────────┐ |
| │ BUSINESS PERFORMANCE                   20/20         │ |
| │ • Revenue YTD: $458K (92% of target)   ████████░░   │ |
| │ • Jobs Filled: 12 (Above avg)          ██████████   │ |
| │ • Fill Rate: 75% (Excellent)           ██████████   │ |
| └─────────────────────────────────────────────────────┘ |
| ┌─────────────────────────────────────────────────────┐ |
| │ OPERATIONAL EXCELLENCE                 10/10         │ |
| │ • Time to Submit: 1.2 days (Fast)      ██████████   │ |
| │ • Submission Quality: 85% interview    ██████████   │ |
| │ • SLA Compliance: 100%                 ██████████   │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| RECOMMENDATIONS                                           |
| ✅ Account is healthy - maintain current approach         |
| 💡 Consider account expansion: Discuss additional teams   |
| 📅 Quarterly review scheduled for next month              |
|                                                           |
| TREND (Last 6 Months)                                     |
| [Line chart showing health score trend: ↗ Improving]     |
|                                                           |
+----------------------------------------------------------+
|           [Export PDF]  [Share with Manager]  [Close]    |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

## Postconditions

1. ✅ All client interactions logged
2. ✅ Relationship health metrics updated
3. ✅ Tasks created for follow-up actions
4. ✅ Communication sent and tracked
5. ✅ Account notes documented
6. ✅ Next touchpoints scheduled
7. ✅ Manager visibility maintained (if issues)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `activity.created` | `{ activity_type: 'call/email/meeting', account_id, contact_id, summary }` |
| `account.note_added` | `{ account_id, note_type, content, visibility }` |
| `account.health_updated` | `{ account_id, health_score, risk_level, updated_at }` |
| `task.created` | `{ task_type, account_id, due_date, assigned_to }` |
| `email.sent` | `{ account_id, contact_id, subject, tracked }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Contact | No contact selected | "Please select a contact" | Select contact |
| Empty Summary | Required field blank | "Call summary is required" | Add summary |
| Permission Denied | Not account owner/stakeholder | "You don't have access to this account" | Contact owner |
| Email Send Failed | SMTP error | "Failed to send email. Try again?" | Retry |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `l` | Log activity |
| `e` | Send email |
| `n` | Add note |
| `j` | Create job |

---

## Alternative Flows

### A1: Escalation Handling

If issue detected:
1. Click "Flag for manager review" in note/call log
2. System alerts manager immediately
3. Manager notified via email + in-app
4. Issue tracked in account health

### A2: NPS Survey Triggered

If sentiment negative or quarterly survey due:
1. System sends NPS survey to client
2. Client rates 0-10
3. Response logged automatically
4. If <7: Manager alerted, action plan required
5. Health score updated

---

## Related Use Cases

- [16-conduct-client-meeting.md](./16-conduct-client-meeting.md) - Formal meetings
- [17-handle-client-escalation.md](./17-handle-client-escalation.md) - Issues
- [02-create-job.md](./02-create-job.md) - New requirements
- [24-recruiter-dashboard.md](./24-recruiter-dashboard.md) - Account portfolio view

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Log call with all fields | Activity created, health updated |
| TC-002 | Send weekly email | Email sent, activity logged |
| TC-003 | Add note with "Pin to top" | Note appears at top of account |
| TC-004 | Schedule meeting | Calendar event created, task created |
| TC-005 | Flag negative call for manager | Manager alerted immediately |
| TC-006 | Last contact >14 days | Account shows yellow warning |
| TC-007 | View health report | All metrics calculated correctly |

---

## Backend Processing

### tRPC Procedures

- `activities.create` - Log activity
- `accounts.addNote` - Add note
- `accounts.getHealthScore` - Calculate health
- `emails.send` - Send email via integration
- `tasks.create` - Create follow-up tasks

---

*Last Updated: 2025-11-30*
