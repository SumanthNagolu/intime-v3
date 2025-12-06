# Use Case: Generate Lead from Campaign

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-A03 |
| Actor | Recruiter (Business Development Role) |
| Goal | Convert campaign responses into qualified leads for pipeline management |
| Frequency | Multiple times daily during active campaigns |
| Estimated Time | 2-5 minutes per lead |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "lead.create" permission
3. Active campaign exists with responses
4. Prospect has responded positively to outreach
5. Response indicates potential business interest

---

## Trigger

One of the following:
- Prospect replies positively to campaign email
- Prospect accepts LinkedIn connection and expresses interest
- Prospect requests information or meeting
- Prospect clicks booking link in campaign
- Automated lead scoring identifies hot prospect
- Daily lead review notification

---

## Main Flow (Click-by-Click)

### Step 1: Review Campaign Response

**User Action:** Click notification or navigate to campaign responses

**System Response:**
- Response detail view opens
- Full conversation thread visible
- Prospect profile displayed
- Quick actions available

**Screen State:**
```
+----------------------------------------------------------+
| CAMPAIGN RESPONSE                              [← Back]   |
+----------------------------------------------------------+
|                                                           |
| FROM CAMPAIGN: Q4 FinTech Startup Outreach               |
| Response Type: 🟢 Positive                                |
| Received: Dec 15, 2025 at 10:32 AM                       |
|                                                           |
+----------------------------------------------------------+
|                                                           |
| PROSPECT PROFILE                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ 👤 Sarah Chen                                       │  |
| │    VP of Engineering @ TechStart Inc               │  |
| │    San Francisco, CA                               │  |
| │                                                     │  |
| │    📧 sarah.chen@techstart.io                      │  |
| │    🔗 linkedin.com/in/sarahchen                    │  |
| │                                                     │  |
| │    COMPANY INFO                                     │  |
| │    TechStart Inc | FinTech | Series B              │  |
| │    120 employees | Founded 2019                     │  |
| │    HQ: San Francisco, CA                           │  |
| │                                                     │  |
| │    ENGAGEMENT SCORE: 85/100 🔥                     │  |
| │    Signals: Opened 3 emails, clicked 2 links,      │  |
| │    visited careers page                            │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CONVERSATION THREAD                                       |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ YOU (Dec 12, 9:00 AM) - Step 1: Initial           │  |
| │ ─────────────────────────────────────────────────  │  |
| │ Hi Sarah,                                          │  |
| │                                                     │  |
| │ I noticed TechStart recently closed your Series B. │  |
| │ Congrats! Many FinTech companies at your stage    │  |
| │ are scaling their engineering teams rapidly.       │  |
| │                                                     │  |
| │ I work with similar companies to help them find   │  |
| │ senior engineering talent quickly. Would you be   │  |
| │ open to a brief call to discuss your hiring plans?│  |
| │                                                     │  |
| │ Best,                                              │  |
| │ John Smith                                         │  |
| │                                                     │  |
| │ ─────────────────────────────────────────────────  │  |
| │                                                     │  |
| │ SARAH CHEN (Dec 15, 10:32 AM) - Response          │  |
| │ ─────────────────────────────────────────────────  │  |
| │ Hi John,                                           │  |
| │                                                     │  |
| │ Thanks for reaching out! Yes, we're actually      │  |
| │ looking to hire 3-4 senior engineers in Q1. We've │  |
| │ been struggling to find good candidates through   │  |
| │ traditional channels.                              │  |
| │                                                     │  |
| │ I'd be happy to chat next week. Can you send me   │  |
| │ some times that work?                              │  |
| │                                                     │  |
| │ Sarah                                              │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| LEAD SIGNALS                                              |
| ┌────────────────────────────────────────────────────┐  |
| │ ✅ Explicit interest in services                   │  |
| │ ✅ Defined hiring need (3-4 engineers)             │  |
| │ ✅ Timeline mentioned (Q1)                         │  |
| │ ✅ Pain point identified (struggling to find)      │  |
| │ ✅ Requested meeting                               │  |
| │ ✅ Decision maker (VP Engineering)                 │  |
| │                                                     │  |
| │ Recommendation: 🔥 HIGH PRIORITY - Convert Now    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| QUICK ACTIONS                                             |
| [🎯 Convert to Lead]  [📅 Book Meeting]  [💬 Reply]     |
| [📧 Send Collateral]  [🔍 Research Company]              |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "Convert to Lead"

**User Action:** Click "🎯 Convert to Lead" button

**System Response:**
- Lead creation modal opens
- Pre-filled with prospect data
- Additional qualification fields shown

**Screen State:**
```
+----------------------------------------------------------+
|                                   Convert to Lead     [×] |
+----------------------------------------------------------+
|                                                           |
| ✨ Creating lead from campaign response                   |
|                                                           |
| CONTACT INFORMATION (Pre-filled)                          |
|                                                           |
| First Name *          Last Name *                         |
| [Sarah              ] [Chen                ]              |
|                                                           |
| Title *                                                   |
| [VP of Engineering                              ]        |
|                                                           |
| Email *                                                   |
| [sarah.chen@techstart.io                        ]        |
|                                                           |
| Phone                                                     |
| [(415) 555-0123                                 ]        |
|                                                           |
| LinkedIn                                                  |
| [linkedin.com/in/sarahchen                      ]        |
|                                                           |
| COMPANY INFORMATION (Pre-filled)                          |
|                                                           |
| Company Name *                                            |
| [TechStart Inc                                  ]        |
|                                                           |
| Industry *                                                |
| [Financial Technology (FinTech)              ▼]          |
|                                                           |
| Company Size *                                            |
| [101-200 employees                           ▼]          |
|                                                           |
| Funding Stage                                             |
| [Series B                                    ▼]          |
|                                                           |
| Headquarters                                              |
| [San Francisco, CA, USA                         ]        |
|                                                           |
| Website                                                   |
| [https://techstart.io                           ]        |
|                                                           |
| LEAD QUALIFICATION                                        |
|                                                           |
| Lead Source *                                             |
| [Campaign: Q4 FinTech Startup Outreach       ▼]          |
|                                                           |
| Lead Status *                                             |
| [Qualified                                   ▼]          |
|   - New (Unqualified)                                    |
|   - Qualified (BANT criteria met)                        |
|   - Working (In active discussion)                       |
|                                                           |
| Lead Score                                                |
| [85    ] / 100  (Auto-calculated from engagement)        |
|                                                           |
| Interest Level *                                          |
| ○ Hot (Ready to buy, urgent need)                        |
| ○ Warm (Interested, timeline 1-3 months)                 |
| ○ Cold (Future potential, 3+ months)                     |
|                                                           |
| BANT QUALIFICATION                                        |
|                                                           |
| Budget                                                    |
| ○ Unknown  ○ Limited  ○ Defined  ○ Approved             |
| Notes: [                                        ]        |
|                                                           |
| Authority                                                 |
| ○ Unknown  ○ Influencer  ○ Decision Maker  ○ Champion   |
| Notes: [VP Engineering - direct hiring auth.    ]        |
|                                                           |
| Need                                                      |
| ○ Unknown  ○ Identified  ○ Defined  ○ Urgent            |
| Notes: [3-4 senior engineers for Q1 hiring      ]        |
|                                                           |
| Timeline                                                  |
| ○ Unknown  ○ Long (6+ mo)  ○ Medium (3-6 mo)  ○ Short   |
| Notes: [Q1 2026 - January start target          ]        |
|                                                           |
| HIRING DETAILS (Extracted from Response)                  |
|                                                           |
| Hiring Needs                                              |
| [3-4 Senior Software Engineers                  ]        |
|                                                           |
| Urgency                                                   |
| [High - Q1 hiring push                       ▼]          |
|                                                           |
| Pain Points                                               |
| [Struggling to find quality candidates through           |
|  traditional channels                           ]        |
|                                                           |
| NEXT STEPS                                                |
|                                                           |
| Primary Action *                                          |
| [Schedule discovery call                     ▼]          |
|   - Schedule discovery call                              |
|   - Send more information                                |
|   - Connect on LinkedIn                                  |
|   - Add to nurture sequence                              |
|                                                           |
| Follow-up Date *                                          |
| [12/16/2025                                     📅]      |
|                                                           |
| Notes                                                     |
| [Responded to campaign, requested meeting for next      |
|  week. Wants to discuss hiring 3-4 senior engineers.    |
|  High priority - active need.                    ]      |
|                                                           |
| ASSIGNMENTS                                               |
|                                                           |
| Lead Owner *                                              |
| [John Smith (You)                            ▼]          |
|                                                           |
| □ Notify Pod Manager of hot lead                         |
| □ Add to weekly BD pipeline review                       |
|                                                           |
+----------------------------------------------------------+
|    [Cancel]  [Save as Draft]  [Convert to Lead ✓]       |
+----------------------------------------------------------+
```

**Field Specification: Lead Score**
| Property | Value |
|----------|-------|
| Field Name | `leadScore` |
| Type | Number |
| Label | "Lead Score" |
| Min | 0 |
| Max | 100 |
| Auto-calculated | Based on engagement, company fit, response quality |
| Editable | Yes (can override) |

**Field Specification: BANT Fields**
| Property | Value |
|----------|-------|
| Field Names | `budget`, `authority`, `need`, `timeline` |
| Type | Radio Button Groups |
| Required | At least 2 of 4 for "Qualified" status |
| Purpose | Standardized lead qualification |

**Time:** ~3-5 minutes to review and qualify

---

### Step 3: Complete Lead Qualification

**User Action:** Fill in BANT criteria, select interest level, add notes

**Example Input:**
- Interest Level: Hot (Ready to buy, urgent need)
- Budget: Unknown
- Authority: Decision Maker
- Need: Defined (3-4 senior engineers)
- Timeline: Short (Q1 2026)
- Primary Action: Schedule discovery call
- Follow-up: Tomorrow (Dec 16)

**User Action:** Click "Convert to Lead ✓"

**System Response:**

1. **Lead record created** (~100ms)
   ```sql
   INSERT INTO leads (
     id, org_id, campaign_id, campaign_prospect_id,
     first_name, last_name, email, phone, title, linkedin_url,
     company_name, industry, company_size, funding_stage, headquarters, website,
     lead_source, lead_status, lead_score, interest_level,
     budget_status, authority_status, need_status, timeline_status,
     budget_notes, authority_notes, need_notes, timeline_notes,
     hiring_needs, urgency, pain_points, notes,
     owner_id, next_action, next_action_date,
     created_by, created_at, updated_at
   ) VALUES (...);
   ```

2. **Campaign prospect updated** (~50ms)
   ```sql
   UPDATE campaign_prospects
   SET converted_to_lead_at = NOW(),
       lead_id = new_lead_id,
       status = 'converted'
   WHERE id = prospect_id;
   ```

3. **Follow-up task created** (~50ms)
   ```sql
   INSERT INTO tasks (
     task_type, entity_type, entity_id,
     title, description,
     assigned_to, due_date, status
   ) VALUES (
     'follow_up', 'lead', new_lead_id,
     'Schedule discovery call with Sarah Chen',
     'Respond to campaign response, book call for next week',
     owner_id, '2025-12-16', 'pending'
   );
   ```

4. **Activity logged** (~50ms)
   ```sql
   INSERT INTO activities (
     entity_type, entity_id, activity_type, description, metadata
   ) VALUES (
     'lead', new_lead_id, 'created',
     'Lead created from campaign response',
     '{"campaign": "Q4 FinTech Startup Outreach", "lead_score": 85}'
   );
   ```

5. **If "Hot" lead and notify Pod Manager checked:**
   - Email sent to Pod Manager
   - In-app notification created

6. **On Success:**
   - Modal closes
   - Toast: "Lead created successfully! Follow-up scheduled for tomorrow."
   - Campaign response marked as converted
   - Redirects to lead detail page

**Screen State (Lead Detail):**
```
+----------------------------------------------------------+
| [← Back to Leads]                          Lead Detail    |
+----------------------------------------------------------+
|                                                           |
| 🔥 Sarah Chen                                            |
| VP of Engineering @ TechStart Inc                        |
| Status: 🟢 Qualified                    [Edit] [Actions ▼]|
|                                                           |
| Lead Score: 85/100           Created: Just now           |
| Source: Campaign - Q4 FinTech Startup Outreach           |
|                                                           |
+----------------------------------------------------------+
| Overview | Activity | Notes | Emails | Related           |
+----------------------------------------------------------+
|                                                           |
| CONTACT INFORMATION                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ 📧 sarah.chen@techstart.io                         │  |
| │ 📱 (415) 555-0123                                  │  |
| │ 🔗 linkedin.com/in/sarahchen                       │  |
| │                                                     │  |
| │ [📞 Call] [✉ Email] [🔗 LinkedIn] [📅 Schedule]   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| COMPANY                                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ 🏢 TechStart Inc                                   │  |
| │    FinTech | Series B | 120 employees              │  |
| │    San Francisco, CA                               │  |
| │    https://techstart.io                            │  |
| │                                                     │  |
| │    [View Company Profile] [Research]               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| QUALIFICATION (BANT)                                      |
| ┌────────────────────────────────────────────────────┐  |
| │ Budget:    ⚪ Unknown                              │  |
| │ Authority: 🟢 Decision Maker (VP Engineering)      │  |
| │ Need:      🟢 Defined (3-4 senior engineers)       │  |
| │ Timeline:  🟢 Short (Q1 2026)                      │  |
| │                                                     │  |
| │ BANT Score: 3/4 ✅ Qualified                       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| HIRING NEEDS                                              |
| ┌────────────────────────────────────────────────────┐  |
| │ Roles: 3-4 Senior Software Engineers               │  |
| │ Urgency: High - Q1 hiring push                     │  |
| │ Pain Points: Struggling to find quality candidates │  |
| │ through traditional channels                       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NEXT STEPS                                                |
| ┌────────────────────────────────────────────────────┐  |
| │ ⏰ TOMORROW (Dec 16)                               │  |
| │ Schedule discovery call with Sarah Chen            │  |
| │                                                     │  |
| │ [Mark Complete] [Reschedule] [Add Note]           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| RECENT ACTIVITY                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ • Lead created from campaign · Just now            │  |
| │ • Responded to outreach email · 3 hours ago        │  |
| │ • Opened email (3x) · Dec 12-15                    │  |
| │ • Clicked link in email · Dec 14                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
| [Convert to Deal] [Book Meeting] [Add to Account]        |
+----------------------------------------------------------+
```

**Time:** ~2-3 seconds for processing

---

## Postconditions

1. ✅ Lead record created in `leads` table
2. ✅ Campaign prospect marked as converted
3. ✅ Lead score calculated and stored
4. ✅ BANT qualification captured
5. ✅ Follow-up task created
6. ✅ Activity logged in timeline
7. ✅ Pod Manager notified (if hot lead)
8. ✅ Lead appears in pipeline views

---

## Events Logged

| Event | Payload |
|-------|---------|
| `lead.created` | `{ lead_id, source: 'campaign', campaign_id, lead_score, owner_id, created_at }` |
| `campaign.prospect_converted` | `{ campaign_id, prospect_id, lead_id, converted_at }` |
| `task.created` | `{ task_id, entity_type: 'lead', entity_id, task_type: 'follow_up', due_date }` |
| `notification.sent` | `{ type: 'hot_lead', recipient: 'pod_manager', lead_id }` |

---

## Lead Scoring Algorithm

```javascript
function calculateLeadScore(prospect, response) {
  let score = 0;

  // Engagement signals (max 40 points)
  score += prospect.emailOpens * 3;        // 3 points per open (max 15)
  score += prospect.linkClicks * 5;        // 5 points per click (max 15)
  score += prospect.replies ? 10 : 0;      // 10 points for reply

  // Company fit (max 30 points)
  if (TARGET_INDUSTRIES.includes(prospect.industry)) score += 10;
  if (TARGET_COMPANY_SIZES.includes(prospect.companySize)) score += 10;
  if (TARGET_FUNDING_STAGES.includes(prospect.fundingStage)) score += 10;

  // Response quality (max 30 points)
  if (response.sentiment === 'positive') score += 10;
  if (response.mentionsHiringNeed) score += 10;
  if (response.requestsMeeting) score += 10;

  return Math.min(score, 100);
}
```

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Lead | Email already exists | "A lead with this email already exists. View existing lead?" | Link to existing or merge |
| Invalid Email | Malformed email | "Please enter a valid email address" | Correct email |
| Missing Required | Required field empty | "Company name is required" | Fill field |
| Campaign Closed | Campaign already ended | "This campaign has ended. Lead can still be created manually." | Proceed anyway |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `c` | Convert to lead |
| `m` | Book meeting |
| `r` | Reply to message |
| `n` | Add note |

---

## Alternative Flows

### A1: Bulk Convert Multiple Responses

1. Select multiple positive responses
2. Click "Bulk Convert to Leads"
3. System creates leads with default qualification
4. User reviews and enriches later

### A2: Auto-Convert Based on Score

1. Configure auto-convert threshold (e.g., score > 80)
2. System automatically creates lead when threshold met
3. Task created for recruiter to review and qualify
4. Hot leads flagged for immediate attention

### A3: Convert and Immediately Book Meeting

1. Click "📅 Book Meeting" directly from response
2. System creates lead automatically
3. Meeting scheduler opens
4. Calendar invite sent to prospect

---

## Related Use Cases

- [A01-run-campaign.md](./A01-run-campaign.md) - Source campaign
- [A02-track-campaign-metrics.md](./A02-track-campaign-metrics.md) - Campaign analytics
- [A04-create-lead.md](./A04-create-lead.md) - Manual lead creation
- [B02-qualify-opportunity.md](./B02-qualify-opportunity.md) - Full qualification

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Convert positive response to lead | Lead created with campaign source |
| TC-002 | Pre-fill fields from prospect data | All available fields populated |
| TC-003 | Calculate lead score | Score matches algorithm |
| TC-004 | Create follow-up task | Task created with correct due date |
| TC-005 | Notify Pod Manager for hot lead | Notification sent |
| TC-006 | Duplicate email detected | Warning shown with merge option |
| TC-007 | Convert from closed campaign | Lead still created, warning shown |
| TC-008 | Bulk convert 10 responses | 10 leads created, summary shown |

---

## Backend Processing

### tRPC Procedures

- `leads.createFromCampaign` - Create lead from campaign response
- `leads.calculateScore` - Calculate lead score
- `campaigns.markProspectConverted` - Update prospect status
- `tasks.create` - Create follow-up task
- `notifications.send` - Send hot lead alert

---

*Last Updated: 2025-12-05*

