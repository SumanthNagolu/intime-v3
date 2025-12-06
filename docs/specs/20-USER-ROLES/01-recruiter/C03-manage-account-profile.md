# Use Case: Manage Account Profile

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-C03 |
| Actor | Recruiter (Account Manager Role) |
| Goal | Maintain account file including notes, POCs, hot job categories, and strategic information |
| Frequency | Weekly per active account |
| Estimated Time | 5-15 minutes per update |
| Priority | Medium |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "account.update" permission
3. Account exists and is active
4. User is account owner or has RACI access

---

## Trigger

One of the following:
- New information learned about client
- Contact changes (new hire, departure)
- Strategic update from client meeting
- Competitive intelligence gathered
- Hot job categories change
- Annual account review
- Relationship health check

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Account Profile

**User Action:** Click account from list or dashboard

**System Response:**
- Account profile page loads
- All account information displayed

**Screen State:**
```
+----------------------------------------------------------+
| [← Back to Accounts]                     Account Profile  |
+----------------------------------------------------------+
|                                                           |
| TechStart Inc                           [Edit] [Actions ▼]|
| 🟢 Active | FinTech | Mid-Market                         |
| Owner: John Smith | Since: Dec 2025                      |
|                                                           |
+----------------------------------------------------------+
| Profile | Contacts | Jobs | Placements | Activity | Notes |
+----------------------------------------------------------+
|                                                           |
| ACCOUNT OVERVIEW                                          |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ 📊 METRICS                     🎯 HEALTH SCORE: 87 │  |
| │ ────────────────────────────────────────────────── │  |
| │ Active Jobs:      3           NPS Score: 9/10      │  |
| │ Total Placements: 4           Last Contact: 2d ago │  |
| │ YTD Revenue:      $124,500    Fill Rate: 75%       │  |
| │ Lifetime Value:   $124,500    Response: <24hrs     │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| COMPANY INFORMATION                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ Legal Name:     TechStart Inc                      │  |
| │ Industry:       Financial Technology (FinTech)     │  |
| │ Size:           120 employees                      │  |
| │ Founded:        2019                               │  |
| │ Funding:        Series B ($25M)                    │  |
| │ Website:        https://techstart.io               │  |
| │ LinkedIn:       linkedin.com/company/techstart     │  |
| │                                                     │  |
| │ HQ Address:                                        │  |
| │ 500 Howard Street, Suite 400                       │  |
| │ San Francisco, CA 94105                            │  |
| │                                                     │  |
| │ Other Locations: New York (100 emp)               │  |
| │                                                [✏]│  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| CONTRACT DETAILS                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Contract Type:   MSA (Master Service Agreement)    │  |
| │ Signed:          Dec 20, 2025                      │  |
| │ Expires:         Dec 31, 2026 (Auto-renew)        │  |
| │ Payment Terms:   Net 30                            │  |
| │ Billing:         Weekly                            │  |
| │                                                     │  |
| │ Rate Card:       Custom                            │  |
| │ - Senior Engineer: $110-150/hr (20% margin)       │  |
| │ - Tech Lead: $130-170/hr (20% margin)             │  |
| │                                                     │  |
| │ [View Contract] [Update Terms]                [✏] │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| HOT JOB CATEGORIES                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ 🔥 High Priority                                   │  |
| │ • Senior Backend Engineer (Always hiring)         │  |
| │ • Full Stack Engineer (Q1-Q2 priority)           │  |
| │                                                     │  |
| │ 📌 Recurring                                       │  |
| │ • DevOps / SRE (1-2 per quarter)                  │  |
| │ • Engineering Manager (as needed)                  │  |
| │                                                     │  |
| │ Tech Stack: TypeScript, React, Node.js, AWS       │  |
| │                                                     │  |
| │ [Manage Categories]                            [✏]│  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| KEY CONTACTS                                              |
| ┌────────────────────────────────────────────────────┐  |
| │ 👤 Sarah Chen - VP Engineering (Primary)           │  |
| │    sarah.chen@techstart.io | (415) 555-0123       │  |
| │    Last Contact: 2 days ago                        │  |
| │    [📞 Call] [✉ Email] [📅 Schedule]              │  |
| │                                                     │  |
| │ 👤 Mike Johnson - CTO (Executive Sponsor)          │  |
| │    mike.johnson@techstart.io | (415) 555-0124     │  |
| │    Last Contact: 1 week ago                        │  |
| │    [📞 Call] [✉ Email] [📅 Schedule]              │  |
| │                                                     │  |
| │ [+ Add Contact] [Manage Contacts]              [✏]│  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| STRATEGIC NOTES                               [+ Add]    |
| ┌────────────────────────────────────────────────────┐  |
| │ 📌 PINNED: Account Strategy                        │  |
| │ Added by John Smith · Dec 22, 2025                │  |
| │ ──────────────────────────────────────────────── │  |
| │ TechStart is a high-growth account with potential │  |
| │ to become our largest FinTech client. Key focus:  │  |
| │ 1. Maintain quality - they value senior talent    │  |
| │ 2. Fast turnaround - they make quick decisions   │  |
| │ 3. Build relationship with CTO for expansion     │  |
| │                                                     │  |
| │ 📝 Q1 2026 Planning Call                          │  |
| │ Added by John Smith · Dec 20, 2025                │  |
| │ ──────────────────────────────────────────────── │  |
| │ Sarah mentioned they're planning to double the   │  |
| │ team in Q1. Expecting 6-8 new reqs in January.   │  |
| │ Budget approved through Q2.                       │  |
| │                                                     │  |
| │ [View All Notes (12)]                              │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| COMPETITIVE INTELLIGENCE                      [+ Add]    |
| ┌────────────────────────────────────────────────────┐  |
| │ 💡 Other Vendors                                   │  |
| │ • TechStaff Inc - Used for contract roles         │  |
| │ • HireRight - Used for direct hire                │  |
| │                                                     │  |
| │ Our Position: Preferred vendor for senior roles   │  |
| │ Win Rate vs Competition: 70%                       │  |
| │                                                     │  |
| │ Last Updated: Dec 15, 2025                        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
| [Update Profile]  [Log Activity]  [Schedule Meeting]     |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Add Strategic Note

**User Action:** Click "+ Add" in Strategic Notes section

**System Response:**
- Note creation modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                                     Add Account Note  [×] |
+----------------------------------------------------------+
|                                                           |
| Note Type *                                               |
| ○ General Note                                           |
| ○ Strategic Information                                  |
| ○ Competitive Intelligence                               |
| ○ Client Feedback                                        |
| ○ Risk / Concern                                         |
| ○ Opportunity                                            |
|                                                           |
| Note Title                                                |
| [Q1 Expansion Discussion                        ]        |
|                                                           |
| Note Content *                                            |
| [Sarah mentioned in our weekly call that the board      |
|  approved additional headcount for Q1. They're looking  |
|  to add:                                                |
|  - 2 Senior Backend Engineers (immediate)               |
|  - 1 DevOps Engineer (February)                         |
|  - 1 Engineering Manager (March)                        |
|                                                         |
|  Budget is approved. Decision timeline is fast -        |
|  typically 1 week from final interview.            ]    |
|                                                           |
| Tags                                                      |
| [+ Add tag] [Expansion] [×] [Q1 2026] [×]               |
|                                                           |
| Visibility                                                |
| ○ Team (All account stakeholders can see)               |
| ○ Private (Only me)                                      |
|                                                           |
| ☐ Pin to top of account                                  |
| ☐ Set reminder to review (Date: [___])                   |
| ☑ Notify Pod Manager                                     |
|                                                           |
+----------------------------------------------------------+
|                         [Cancel]  [Save Note ✓]          |
+----------------------------------------------------------+
```

**User Action:** Complete note, click "Save Note ✓"

**Time:** ~2 minutes

---

### Step 3: Update Hot Job Categories

**User Action:** Click "Manage Categories" in Hot Job Categories section

**System Response:**
- Category management modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                              Manage Hot Job Categories [×]|
+----------------------------------------------------------+
|                                                           |
| HOT JOB CATEGORIES                                        |
|                                                           |
| Configure which roles this client typically hires.        |
| This helps prioritize candidate sourcing.                 |
|                                                           |
| 🔥 ALWAYS HIRING                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑ Senior Backend Engineer                          │  |
| │   Notes: Primary need, always have openings       │  |
| │                                                     │  |
| │ ☑ Full Stack Engineer                              │  |
| │   Notes: Q1-Q2 priority, React + Node.js          │  |
| │                                                     │  |
| │ [+ Add to Always Hiring]                           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| 📌 RECURRING (Quarterly)                                  |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑ DevOps / SRE                                     │  |
| │   Notes: 1-2 per quarter, Kubernetes required     │  |
| │                                                     │  |
| │ ☑ Engineering Manager                              │  |
| │   Notes: As teams grow, usually 1 per 8 engineers │  |
| │                                                     │  |
| │ [+ Add to Recurring]                               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| 🌡️ OCCASIONAL                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ ☐ QA Engineer                                      │  |
| │ ☐ Product Manager                                  │  |
| │ ☐ Data Engineer                                    │  |
| │                                                     │  |
| │ [+ Add to Occasional]                              │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| TECH STACK                                                |
| Primary: [TypeScript, React, Node.js, PostgreSQL, AWS]  |
| Secondary: [Kubernetes, GraphQL, Redis, Docker     ]    |
|                                                           |
+----------------------------------------------------------+
|                         [Cancel]  [Save Changes ✓]       |
+----------------------------------------------------------+
```

**Time:** ~1 minute

---

## Postconditions

1. ✅ Account profile updated
2. ✅ Notes saved with visibility settings
3. ✅ Hot job categories configured
4. ✅ Activity logged in timeline
5. ✅ Team notified (if applicable)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `account.profile_updated` | `{ account_id, fields_updated, updated_by }` |
| `account.note_added` | `{ account_id, note_type, visibility }` |
| `account.categories_updated` | `{ account_id, categories }` |

---

## Related Use Cases

- [C02-onboard-account.md](./C02-onboard-account.md) - Initial setup
- [C04-manage-client-relationship.md](./C04-manage-client-relationship.md) - Relationship management
- [C05-conduct-client-meeting.md](./C05-conduct-client-meeting.md) - Meeting notes

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Add strategic note | Note saved, visible to team |
| TC-002 | Pin note to top | Note appears first |
| TC-003 | Update hot categories | Categories saved |
| TC-004 | Add competitive intel | Intel saved, tagged |
| TC-005 | Private note | Only creator can see |

---

*Last Updated: 2025-12-05*

