# Use Case: Handle Escalated Issue

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-MGR-002 |
| Actor | Manager |
| Goal | Resolve issues that exceed IC authority or require manager intervention |
| Frequency | 1-5 times per day |
| Estimated Time | 15-60 minutes depending on complexity |
| Priority | Critical (time-sensitive) |

---

## Preconditions

1. User is logged in as Manager
2. Manager is assigned to an active pod
3. An escalation has been created by an IC or system
4. Escalation is assigned to manager's pod

---

## Trigger

One of the following:
- IC explicitly escalates an issue (clicks "Escalate" button)
- Client complaint logged and flagged as escalation
- Candidate issue requiring manager intervention
- System auto-escalates (e.g., submission with unusual rate)
- Manager notices issue and creates escalation

---

## Main Flow (Click-by-Click)

### Step 1: Receive Escalation Notification

**System Action:** Escalation is created

**Notification Channels:**
1. **In-App Notification:**
   - Red badge appears on Manager's dashboard
   - "Escalations" tab shows count: "🔴 2 Urgent"
   - Toast notification: "New escalation from John Smith: Client complaint"

2. **Email Notification:**
   - Subject: "[URGENT] Escalation: Client complaint - Google Inc."
   - Body: Summary of issue + link to escalation
   - Sent to: manager@intime.com

3. **SMS (for Critical escalations):**
   - "URGENT: Client escalation from John Smith. Login to handle."
   - Sent only if escalation is marked "Critical"

**Time:** Instant notification

---

### Step 2: Navigate to Escalation

**Option A: From Dashboard**
- Manager viewing Pod Dashboard
- Clicks "Escalations" tab
- Escalation list loads
- Manager clicks on specific escalation
- Time: ~5 seconds

**Option B: From Email Notification**
- Manager clicks link in email
- Browser opens to escalation detail
- Time: ~3 seconds

**Option C: From Notifications Panel**
- Manager clicks bell icon (🔔) in header
- Clicks notification: "Client complaint from John Smith"
- Escalation detail opens
- Time: ~3 seconds

**URL:** `/employee/manager/escalations/{escalation-id}`

---

### Step 3: Review Escalation Details

**Screen State:**
```
+------------------------------------------------------------------+
| Escalation: Unauthorized Rate Increase                [CRITICAL 🔴]|
+------------------------------------------------------------------+
| Escalation ID: ESC-2024-11-28-001                                 |
| Created: Nov 28, 2024 11:47 PM          Status: PENDING          |
| Reporter: John Smith (IC - Recruiting)  Age: 8 hours 13 minutes  |
+------------------------------------------------------------------+
| ISSUE SUMMARY                                                     |
| Category: Client Complaint → Billing Dispute                     |
| Priority: Critical (Affects strategic account)                    |
| Impact: High (May lose account with $2M annual revenue)          |
+------------------------------------------------------------------+
| RELATED ENTITIES                                                  |
| Account: Google Inc. (Strategic Account)                          |
| Contact: Jane Doe (Hiring Manager) - jane@google.com            |
| Placement: Sarah Chen (Senior Developer)                          |
| Contract: C-2024-08-15-GOOG-001 (Started: Aug 15, 2024)          |
+------------------------------------------------------------------+
| DESCRIPTION                                                       |
| Client called upset about November invoice showing bill rate of   |
| $120/hr instead of the agreed $110/hr. Client states no approval  |
| was given for this rate increase. Candidate has been working for  |
| 3 months with no issues until this invoice.                       |
|                                                                   |
| Client's exact words (per John's note):                           |
| "We never approved a rate increase. This is a breach of our       |
| agreement. If this isn't fixed immediately, we will terminate     |
| all contracts with InTime."                                       |
+------------------------------------------------------------------+
| IC'S INITIAL ASSESSMENT                                           |
| John's Note (11:45 PM):                                           |
| "I updated the placement rate per the new contract template       |
| we started using in November. I thought this was automatic for    |
| all placements going forward. I didn't realize it only applies    |
| to NEW placements, not existing ones. Client is very upset and    |
| threatening to end all 3 active contracts ($180K annual).         |
|                                                                   |
| I apologized and said I'd escalate to my manager immediately.     |
| I need help ASAP - client expects callback by 9 AM tomorrow."     |
+------------------------------------------------------------------+
| TIMELINE OF EVENTS                                                |
| Nov 1, 2024 10:00 AM - Finance sends November invoice            |
| Nov 28, 2024 10:30 AM - Client emails complaint to John          |
| Nov 28, 2024 11:15 PM - John calls client, discovers issue       |
| Nov 28, 2024 11:35 PM - John logs email activity                 |
| Nov 28, 2024 11:45 PM - John escalates to Manager                |
| Nov 28, 2024 11:47 PM - System notifies Manager (Sarah)          |
| Nov 29, 2024 08:00 AM - Manager (Sarah) reviews escalation       |
+------------------------------------------------------------------+
| ATTACHED DOCUMENTS                                                |
| 📄 November Invoice (invoice-nov-2024-google.pdf)                |
| 📄 Original Contract (contract-aug-2024-google.pdf)              |
| 📧 Client Email Thread (3 messages)                              |
+------------------------------------------------------------------+
| PREVIOUS ESCALATIONS (Same Account)                               |
| None - First escalation with this client ✅                      |
+------------------------------------------------------------------+
| RECOMMENDED ACTIONS (AI-Generated)                                |
| Based on similar escalations, recommended steps:                  |
| 1. Review original contract to confirm agreed rate                |
| 2. Contact client directly within 24 hours to apologize           |
| 3. Issue corrected invoice immediately                            |
| 4. Offer goodwill gesture (e.g., 1 week credit on next invoice)  |
| 5. Schedule process review with IC to prevent recurrence          |
+------------------------------------------------------------------+
| [Take Ownership] [Assign to Someone Else] [Request More Info]    |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Description | Data Source | Required |
|-------|-------------|-------------|----------|
| Escalation ID | Unique identifier | Auto-generated | Yes |
| Reporter | IC who escalated | `user_profiles` | Yes |
| Category | Type of escalation | Enum: Client Complaint, Candidate Issue, Rate Exception, etc. | Yes |
| Priority | Urgency level | Enum: Critical, High, Medium, Low | Yes |
| Impact | Business impact | Calculated based on account value + risk | Yes |
| Related Entities | Linked objects | `accounts`, `contacts`, `placements`, etc. | Varies |
| Description | Issue details | Free text | Yes |
| IC's Assessment | IC's perspective | Free text | Recommended |
| Timeline | Event history | `activities` table | Auto-generated |
| Attached Documents | Supporting files | `files` table | Optional |

**Manager Action:** Read and understand the issue
**Time:** ~3-5 minutes

---

### Step 4: Take Ownership

**User Action:** Click "Take Ownership" button

**System Response:**
- Button changes to "Owner: You" (disabled)
- Status updates from "PENDING" to "IN PROGRESS"
- Timestamp logged: `assigned_at = now()`, `assigned_to = manager_id`
- Notification sent to IC: "Sarah Martinez has taken ownership of your escalation"
- Activity logged: `type: escalation_claimed`, `user: manager_id`

**Screen State:**
```
+------------------------------------------------------------------+
| Escalation: Unauthorized Rate Increase                [IN PROGRESS]|
+------------------------------------------------------------------+
| Owner: Sarah Martinez (You)              Claimed: 8:02 AM (just now)|
| Status: IN PROGRESS                      SLA: Respond by 9:00 AM |
+------------------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 5: Investigate Root Cause

**User Action:** Click on "Original Contract" attachment

**System Response:**
- PDF viewer opens in modal or new tab
- Contract shows:
  - Bill Rate: $110/hr (agreed Aug 15, 2024)
  - Pay Rate: $90/hr
  - Margin: $20/hr (22%)
  - No auto-escalation clause

**User Action:** Click on "November Invoice" attachment

**System Response:**
- Invoice shows:
  - Bill Rate: $120/hr (incorrect!)
  - Pay Rate: $90/hr (correct)
  - Margin: $30/hr (33%)
  - Total billed: $9,600 (160 hours × $120)

**Manager Analysis:**
- ✅ Original contract clearly states $110/hr
- ❌ November invoice incorrectly shows $120/hr
- ✅ Pay rate is correct ($90/hr)
- ❌ IC used wrong template for existing placement
- 💡 Root cause: Process failure - IC didn't check contract before updating rate

**User Action:** Click "Add Investigation Note" button

**Screen State:**
```
+------------------------------------------------------------------+
| Investigation Notes                                   [Internal Only]|
+------------------------------------------------------------------+
| [                                                              ]  |
| [ Root cause identified:                                      ]  |
| [ - IC used new November contract template for existing       ]  |
| [   placement without checking original contract              ]  |
| [ - Original contract: $110/hr (Aug 15, 2024)                 ]  |
| [ - November invoice: $120/hr (incorrect)                     ]  |
| [ - Difference: $10/hr × 160 hours = $1,600 overbilled        ]  |
| [                                                              ]  |
| [ Client is justified in complaint. We need to:               ]  |
| [ 1. Apologize immediately                                    ]  |
| [ 2. Issue corrected invoice for $17,600 ($110 × 160)        ]  |
| [ 3. Offer goodwill credit (suggest $500 or 1 week free)     ]  |
| [ 4. Train IC on contract management process                  ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| [Save Note] [Cancel]                                             |
+------------------------------------------------------------------+
```

**User Action:** Click "Save Note"

**System Response:**
- Note saved to escalation
- Visible only to manager and admin
- Not shared with client or IC yet

**Time:** ~5-10 minutes for investigation

---

### Step 6: Take Corrective Action - Contact Client

**User Action:** Click "Contact Client" button

**System Response:** Email modal opens with template

**Screen State:**
```
+------------------------------------------------------------------+
| Send Email - Escalation Response                                  |
+------------------------------------------------------------------+
| To: jane@google.com (Jane Doe - Hiring Manager)                  |
| CC: john.smith@intime.com (Reporter - kept in loop)              |
| BCC: sarah.martinez@intime.com (You)                             |
| Subject: Re: Invoice Issue - Sarah Chen Contract                 |
+------------------------------------------------------------------+
| Template: Manager Escalation - Client Apology                     |
|                                                                   |
| [                                                              ]  |
| [ Hi Jane,                                                    ]  |
| [                                                              ]  |
| [ Thank you for bringing the invoice discrepancy to our       ]  |
| [ attention. I've personally reviewed the situation and you   ]  |
| [ are absolutely correct - the rate increase to $120/hr was   ]  |
| [ an error on our part.                                       ]  |
| [                                                              ]  |
| [ Here's what happened:                                       ]  |
| [ We recently updated our internal contract templates for NEW ]  |
| [ placements, and this was mistakenly applied to Sarah's      ]  |
| [ ongoing contract. This should not have happened without     ]  |
| [ your explicit approval.                                     ]  |
| [                                                              ]  |
| [ I will personally ensure:                                   ]  |
| [ 1. Corrected invoice issued today showing $110/hr (as agreed)]  |
| [ 2. Total: $17,600 (160 hours × $110) instead of $19,200    ]  |
| [ 3. As an apology, we'll credit your December invoice $500   ]  |
| [ 4. This mistake will not happen again on any of your contracts]  |
| [                                                              ]  |
| [ I sincerely apologize for the confusion and any inconvenience.]  |
| [ Your partnership is extremely important to us, and I take   ]  |
| [ full responsibility for this error.                         ]  |
| [                                                              ]  |
| [ I'll call you at 9:00 AM to discuss and ensure we're aligned.]  |
| [                                                              ]  |
| [ Best regards,                                               ]  |
| [ Sarah Martinez                                              ]  |
| [ Manager - Recruiting Pod A                                  ]  |
| [ InTime                                                      ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Attachments:                                                      |
| [+ Add Attachment]                                               |
|                                                                   |
| [Cancel] [Save Draft] [Send & Log Activity]                      |
+------------------------------------------------------------------+
```

**User Action:** Manager reviews and edits email (optional)

**User Action:** Click "Send & Log Activity"

**System Response:**
1. Email sent to jane@google.com (cc: john.smith@intime.com)
2. Activity logged:
   - `type: email`
   - `direction: outbound`
   - `entity_type: escalation`
   - `entity_id: escalation_id`
   - `subject: Re: Invoice Issue - Sarah Chen Contract`
   - `body: [email content]`
   - `sent_at: now()`
3. Escalation updated:
   - `last_action: email_sent`
   - `last_action_at: now()`
4. Notification sent to IC (John): "Manager sent email to client"
5. Toast: "Email sent successfully ✓"

**Time:** ~10 minutes (drafting + sending)

---

### Step 7: Coordinate with Finance - Issue Corrected Invoice

**User Action:** Click "Create Task" button on escalation

**System Response:** Task creation modal opens

**Screen State:**
```
+------------------------------------------------------------------+
| Create Task - Escalation Action Item                              |
+------------------------------------------------------------------+
| Task Title: *                                                     |
| [Issue corrected invoice for Google - Sarah Chen placement    ]  |
|                                                                   |
| Assigned To: *                                                    |
| [v Finance Team            ] (Dropdown: Users/Teams)             |
|                                                                   |
| Due Date: *                                                       |
| [v Today (Nov 29, 2024)    ] [⏰ 5:00 PM]                        |
|                                                                   |
| Priority:                                                         |
| ○ Low  ○ Medium  ● High  ○ Critical                              |
|                                                                   |
| Description:                                                      |
| [                                                              ]  |
| [ Please issue a corrected invoice for Google Inc.:           ]  |
| [                                                              ]  |
| [ Original (INCORRECT):                                       ]  |
| [ - Bill Rate: $120/hr                                        ]  |
| [ - Total: $19,200 (160 hours)                                ]  |
| [                                                              ]  |
| [ Corrected:                                                  ]  |
| [ - Bill Rate: $110/hr (per original contract)                ]  |
| [ - Total: $17,600 (160 hours)                                ]  |
| [ - Credit December invoice: $500 (goodwill gesture)          ]  |
| [                                                              ]  |
| [ Placement: Sarah Chen → Google Inc.                         ]  |
| [ Contract: C-2024-08-15-GOOG-001                             ]  |
| [ Month: November 2024                                        ]  |
| [                                                              ]  |
| [ URGENT: Client expects corrected invoice today.             ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Linked to Escalation: ESC-2024-11-28-001                         |
+------------------------------------------------------------------+
| [Cancel] [Create Task]                                           |
+------------------------------------------------------------------+
```

**User Action:** Click "Create Task"

**System Response:**
- Task created in `tasks` table
- Assigned to Finance Team
- Notification sent to finance@intime.com
- Task linked to escalation
- Activity logged
- Toast: "Task created and assigned to Finance ✓"

**Time:** ~3 minutes

---

### Step 8: Schedule Follow-up Call with Client

**User Action:** Click "Schedule Call" button

**System Response:** Calendar integration modal opens

**Screen State:**
```
+------------------------------------------------------------------+
| Schedule Call - Client Follow-up                                  |
+------------------------------------------------------------------+
| Contact: Jane Doe (jane@google.com)                              |
| Account: Google Inc.                                              |
|                                                                   |
| Date: * [v Nov 29, 2024  ]                                       |
| Time: * [v 9:00 AM       ] Duration: [30 minutes]                |
|                                                                   |
| Meeting Type:                                                     |
| ● Phone Call  ○ Video Call  ○ In-Person                          |
|                                                                   |
| Agenda:                                                           |
| [                                                              ]  |
| [ 1. Apologize for invoice error                              ]  |
| [ 2. Confirm corrected invoice received                       ]  |
| [ 3. Discuss $500 goodwill credit                             ]  |
| [ 4. Ensure satisfaction with Sarah Chen's performance        ]  |
| [ 5. Discuss Q1 hiring needs (2 Java roles mentioned)         ]  |
| [                                                              ]  |
|                                                                   |
| Send Calendar Invite?                                             |
| ☑ Send to jane@google.com                                        |
| ☑ Send to john.smith@intime.com (IC - for visibility)            |
|                                                                   |
| [Cancel] [Schedule Call & Log Activity]                          |
+------------------------------------------------------------------+
```

**User Action:** Click "Schedule Call & Log Activity"

**System Response:**
- Calendar event created
- Invites sent via email
- Activity logged: `type: meeting`, `status: scheduled`
- Reminder set: 15 minutes before call
- Toast: "Call scheduled for 9:00 AM ✓"

**Time:** ~2 minutes

---

### Step 9: Debrief IC (Coaching Moment)

**User Action:** Click "Send Message to IC" button

**System Response:** Internal message modal opens

**Screen State:**
```
+------------------------------------------------------------------+
| Send Message to IC - Escalation Update                            |
+------------------------------------------------------------------+
| To: John Smith (Reporter)                                         |
| Re: Escalation ESC-2024-11-28-001                                 |
+------------------------------------------------------------------+
| Message:                                                          |
| [                                                              ]  |
| [ Hi John,                                                    ]  |
| [                                                              ]  |
| [ I've handled the Google rate issue - here's the update:     ]  |
| [                                                              ]  |
| [ ✅ Contacted client directly, apologized for error           ]  |
| [ ✅ Finance issuing corrected invoice today                   ]  |
| [ ✅ Offering $500 goodwill credit                             ]  |
| [ ✅ Scheduled 9 AM call with Jane to resolve                  ]  |
| [                                                              ]  |
| [ Great job escalating this quickly. You did the right thing. ]  |
| [                                                              ]  |
| [ For next time: Always check the ORIGINAL contract before    ]  |
| [ updating rates on existing placements. New templates only   ]  |
| [ apply to NEW placements starting after the template date.   ]  |
| [                                                              ]  |
| [ Let's schedule a 1:1 tomorrow to review the contract        ]  |
| [ management process so this doesn't happen again.            ]  |
| [                                                              ]  |
| [ I'll keep you updated after my 9 AM call.                   ]  |
| [                                                              ]  |
| [ - Sarah                                                     ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Tone:                                                             |
| ○ Formal  ● Professional  ○ Casual                               |
|                                                                   |
| [Cancel] [Send & Create 1:1 Task]                                |
+------------------------------------------------------------------+
```

**User Action:** Click "Send & Create 1:1 Task"

**System Response:**
- Message sent to John (in-app notification + email)
- Task created: "1:1 with John - Contract Management Process Review"
- Due: Tomorrow
- Activity logged
- Toast: "Message sent to John ✓"

**Time:** ~5 minutes

---

### Step 10: Conduct Client Call (Real-Time)

**Time: 9:00 AM (scheduled time)**

**System Action:** Reminder notification 15 minutes before

**Manager Action:** Call client at 9:00 AM

**Call Outline:**
1. **Apology & Acknowledgment** (2 min)
   - "Jane, thank you for bringing this to our attention immediately."
   - "You're absolutely right - the $120/hr was our error."

2. **Explanation** (2 min)
   - "We updated our internal templates for new contracts, and it was mistakenly applied to Sarah's existing contract."
   - "This should never have happened without your approval."

3. **Resolution Confirmation** (3 min)
   - "You should receive the corrected invoice today showing $17,600."
   - "We're also crediting your December invoice $500 as an apology."
   - "Is there anything else we can do to make this right?"

4. **Relationship Building** (3 min)
   - "How is Sarah performing? Any feedback?"
   - "I understand you have 2 Java roles coming up in Q1 - let's discuss those."

**Client Response:** "Apology accepted. Sarah is doing great. Please don't let this happen again."

**Manager:** "You have my word. I've put new checks in place to prevent this."

**Call Duration:** ~15 minutes

**User Action:** After call, log activity

**Screen State:**
```
+------------------------------------------------------------------+
| Log Activity - Client Call                                        |
+------------------------------------------------------------------+
| Activity Type: Phone Call                                         |
| Account: Google Inc.                                              |
| Contact: Jane Doe                                                 |
| Duration: [15] minutes                                            |
|                                                                   |
| Outcome:                                                          |
| ● Positive  ○ Neutral  ○ Negative                                |
|                                                                   |
| Summary:                                                          |
| [                                                              ]  |
| [ Client accepted apology. Confirmed:                         ]  |
| [ - Satisfied with Sarah Chen's performance (very positive)   ]  |
| [ - Will await corrected invoice today                        ]  |
| [ - Appreciates $500 credit                                   ]  |
| [ - Relationship intact                                       ]  |
| [ - Discussed Q1 hiring: 2 Senior Java roles (Jan start)      ]  |
| [                                                              ]  |
| [ Action items:                                               ]  |
| [ - Finance to send corrected invoice by 5 PM today           ]  |
| [ - Follow up next week to confirm invoice received           ]  |
| [ - Create leads for 2 Java roles in Q1                       ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Link to Escalation: ESC-2024-11-28-001                           |
+------------------------------------------------------------------+
| [Cancel] [Save & Link to Escalation]                             |
+------------------------------------------------------------------+
```

**User Action:** Click "Save & Link to Escalation"

**System Response:**
- Activity logged and linked to escalation
- Escalation timeline updated
- Toast: "Activity logged ✓"

**Time:** ~3 minutes to log

---

### Step 11: Update Escalation Status

**User Action:** Navigate back to escalation detail

**User Action:** Scroll to bottom, click "Update Status" button

**Screen State:**
```
+------------------------------------------------------------------+
| Update Escalation Status                                          |
+------------------------------------------------------------------+
| Current Status: IN PROGRESS                                       |
|                                                                   |
| New Status: *                                                     |
| ○ In Progress (still working on it)                              |
| ● Resolved (issue is fixed)                                      |
| ○ Escalate Further (need CEO/COO help)                           |
| ○ On Hold (waiting for external input)                           |
|                                                                   |
| Resolution Notes: *                                               |
| [                                                              ]  |
| [ RESOLUTION SUMMARY:                                         ]  |
| [                                                              ]  |
| [ Issue: Client billed $120/hr instead of contracted $110/hr  ]  |
| [ Root Cause: IC used new template for existing placement     ]  |
| [                                                              ]  |
| [ Actions Taken:                                              ]  |
| [ 1. ✅ Contacted client directly, apologized (email 8:15 AM) ]  |
| [ 2. ✅ Finance issuing corrected invoice (due 5 PM today)    ]  |
| [ 3. ✅ Offered $500 goodwill credit                          ]  |
| [ 4. ✅ Conducted follow-up call (9:00 AM, 15 min)            ]  |
| [ 5. ✅ Scheduled 1:1 with IC for process training            ]  |
| [                                                              ]  |
| [ Outcome:                                                    ]  |
| [ - Client accepted apology                                   ]  |
| [ - Relationship intact (client confirmed Sarah is excellent) ]  |
| [ - No contract termination risk                              ]  |
| [ - Client discussed Q1 hiring (2 Java roles)                 ]  |
| [                                                              ]  |
| [ Follow-up Actions:                                          ]  |
| [ - Monitor invoice delivery (by Finance, due 5 PM)           ]  |
| [ - Confirm client received corrected invoice (next week)     ]  |
| [ - Train IC on contract management (tomorrow 1:1)            ]  |
| [ - Create leads for Q1 Java roles                            ]  |
| [                                                              ]  |
| [ Lessons Learned:                                            ]  |
| [ - Need clearer process for when to use new vs old templates ]  |
| [ - Add validation step before rate changes on existing contracts]  |
| [ - Consider Finance review for all rate updates              ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| Notify:                                                           |
| ☑ IC (John Smith) - Resolution summary                           |
| ☑ COO - FYI on strategic account escalation                      |
| ☐ CEO - Not needed for this escalation                           |
|                                                                   |
| [Cancel] [Mark Resolved]                                         |
+------------------------------------------------------------------+
```

**User Action:** Click "Mark Resolved"

**System Response:**
1. Escalation status updated to "RESOLVED"
2. `resolved_at = now()`
3. `resolved_by = manager_id`
4. `resolution_time = resolved_at - created_at` (calculated: 9h 13m)
5. Notifications sent:
   - To John (IC): "Your escalation has been resolved by Sarah Martinez"
   - To COO: "Escalation resolved: Google billing issue (strategic account)"
6. Escalation removed from "Pending" queue
7. Escalation archived to "Resolved" list
8. Toast: "Escalation marked as resolved ✓"

**Time:** ~5 minutes

---

### Step 12: Monitor Follow-up Actions

**Next Day: Finance confirms invoice sent**
- Manager receives notification: "Task completed: Corrected invoice sent to Google"
- Manager verifies in Finance system

**Next Week: Follow up with client**
- Manager sends email: "Hi Jane, just confirming you received the corrected invoice."
- Client confirms: "Yes, received and approved. Thank you."
- Manager logs activity
- Manager closes all related tasks

**Total Escalation Resolution Time:** 9 hours 13 minutes (created 11:47 PM, resolved 9:00 AM next day)

---

## Postconditions

1. ✅ Escalation resolved and marked "RESOLVED"
2. ✅ Client issue addressed and relationship intact
3. ✅ Root cause identified and documented
4. ✅ Corrective actions completed (invoice, credit, apology)
5. ✅ IC debriefed and coaching scheduled
6. ✅ Process improvement identified (template usage guidelines)
7. ✅ Follow-up tasks created and assigned
8. ✅ Leadership informed (COO notified)
9. ✅ Timeline documented for audit trail
10. ✅ Lessons learned captured for future reference

---

## Events Logged

| Event | Payload |
|-------|---------|
| `escalation.created` | `{ escalation_id, reporter_id, category, priority, created_at }` |
| `escalation.assigned` | `{ escalation_id, assigned_to: manager_id, assigned_at }` |
| `escalation.investigated` | `{ escalation_id, investigation_notes, investigated_by }` |
| `escalation.action_taken` | `{ escalation_id, action_type: 'email_sent', action_details }` |
| `escalation.resolved` | `{ escalation_id, resolved_by, resolved_at, resolution_time }` |
| `activity.email_sent` | `{ to: client_email, subject, body, escalation_id }` |
| `activity.call_logged` | `{ contact_id, duration, outcome, escalation_id }` |
| `task.created` | `{ task_title, assigned_to, due_date, escalation_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Escalation Not Found | Invalid escalation ID | "Escalation not found or you don't have access" | Verify ID, check permissions |
| Cannot Take Ownership | Already assigned to someone else | "This escalation is already being handled by [Name]" | Contact assigned manager or wait |
| Email Send Failed | SMTP error | "Failed to send email. Please try again." | Retry or use manual email client |
| Finance Task Failed | Finance team unavailable | "Unable to assign task to Finance. Please contact Admin." | Manually email Finance or escalate to COO |
| Client Unreachable | Phone/email bounces | "Unable to reach client. Please try alternate contact." | Use secondary contact or escalate |
| SLA Breach | Resolution time > SLA | "⚠️ SLA breach: This escalation is overdue" | Escalate to COO, explain delay |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Resolution Notes | Required when marking resolved | "Please provide resolution notes" |
| Resolution Notes | Min 50 characters | "Resolution notes too brief (min 50 chars)" |
| Contact Client | Client email must be valid | "Invalid client email address" |
| Task Assignment | Assignee must be valid user/team | "Invalid assignee" |
| Status Update | Can only resolve owned escalations | "You must take ownership first" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `t` | Take ownership |
| `e` | Send email to client |
| `c` | Schedule call |
| `m` | Message IC |
| `r` | Mark resolved |
| `Esc` | Close modal |

---

## Alternative Flows

### A1: Escalate Further to CEO

**Scenario:** Manager cannot resolve alone (e.g., client demands executive involvement)

1. Manager reviews escalation
2. Manager determines CEO involvement needed
3. Manager clicks "Escalate Further" button
4. Modal asks: "Escalate to: ○ COO ● CEO"
5. Manager writes escalation note for CEO
6. CEO receives notification
7. CEO takes over escalation
8. Manager becomes "Consulted" on escalation

### A2: IC Resolves Before Manager Can Act

**Scenario:** IC resolves issue directly after escalating

1. IC escalates issue
2. Before manager acts, IC contacts client and resolves
3. IC updates escalation: "Client accepted my apology, issue resolved"
4. Manager reviews IC's resolution
5. Manager approves resolution or requests more info
6. Manager marks escalation as "Resolved by IC" (gives IC credit)

### A3: Ongoing Escalation (Multi-Day)

**Scenario:** Complex issue requiring multiple days to resolve

1. Manager takes ownership Day 1
2. Manager updates status to "In Progress - Investigating"
3. Manager adds daily notes with progress updates
4. Manager coordinates with multiple teams (Finance, Legal, CEO)
5. Manager resolves on Day 5
6. Resolution notes include full timeline and all actions taken

---

## Escalation Categories & Handling Guides

| Category | Typical Actions | Escalate Further If... |
|----------|-----------------|------------------------|
| Client Complaint - Billing | Review invoice, contact Finance, apologize, correct | Client demands refund > $5K |
| Client Complaint - Performance | Review contractor performance, discuss with IC, contact client | Client wants to terminate contract |
| Candidate Issue - Ghosting | Contact candidate, discuss with IC, have backup ready | Candidate already started (no-show) |
| Candidate Issue - Compensation | Review market rates, discuss with Finance, negotiate | Candidate demands > 20% increase |
| Rate Exception | Review job/candidate, approve or deny, document | Negative margin placement |
| Contract Dispute | Review contract, contact Legal if needed, negotiate | Client threatens legal action |
| System/Process Failure | Fix process, document for improvement | Affects multiple clients |

---

## SLA (Service Level Agreement) for Escalations

| Priority | Response Time | Resolution Time | Escalate If Exceeds |
|----------|---------------|-----------------|---------------------|
| Critical | 1 hour | 24 hours | CEO |
| High | 4 hours | 48 hours | COO |
| Medium | 8 hours | 72 hours | COO |
| Low | 24 hours | 5 business days | - |

**Response Time:** Manager acknowledges and takes ownership
**Resolution Time:** Issue is fully resolved or escalated further

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | IC escalates client complaint | Manager receives notification, escalation appears in queue |
| TC-002 | Manager takes ownership | Status changes to "In Progress", IC notified |
| TC-003 | Manager sends email to client | Email sent, activity logged, escalation timeline updated |
| TC-004 | Manager marks escalation resolved | Status changes to "Resolved", notifications sent, removed from queue |
| TC-005 | Manager tries to resolve without ownership | Error: "You must take ownership first" |
| TC-006 | Escalation exceeds SLA | Warning badge, notification to COO |
| TC-007 | Manager escalates to CEO | CEO notified, escalation reassigned, manager becomes Consulted |

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Escalation handling is part of daily routine
- [02-pod-dashboard.md](./02-pod-dashboard.md) - Escalations visible on dashboard
- [05-conduct-1on1.md](./05-conduct-1on1.md) - Use escalation as coaching opportunity
- [07-coach-ic.md](./07-coach-ic.md) - Debrief IC after escalation

---

*Last Updated: 2024-11-30*
