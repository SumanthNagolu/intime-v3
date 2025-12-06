# Use Case: Create Deal

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-B03 |
| Actor | Recruiter (Business Development Role) |
| Goal | Create a deal record from a qualified lead to track the sales opportunity through closure |
| Frequency | 2-5 deals per week per recruiter |
| Estimated Time | 5-10 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "deal.create" permission
3. Qualified lead exists with sufficient information
4. Lead has been qualified using BANT criteria
5. Verbal or written interest from prospect to proceed

---

## Trigger

One of the following:
- Lead qualification meeting completed successfully
- Prospect requests proposal or pricing
- Prospect agrees to discovery call
- BANT criteria met (Budget, Authority, Need, Timeline defined)
- Pod Manager approves deal creation
- Lead score exceeds deal threshold (e.g., >80)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Lead and Initiate Deal Creation

**User Action:** From lead detail page, click "Convert to Deal" button

**System Response:**
- Deal creation modal opens
- Pre-filled with lead data
- Deal qualification form displayed

**Screen State:**
```
+----------------------------------------------------------+
|                                        Create Deal    [×] |
+----------------------------------------------------------+
| Converting Lead: Sarah Chen @ TechStart Inc               |
| Lead Score: 85/100 | Status: Qualified                    |
+----------------------------------------------------------+
|                                                           |
| DEAL BASICS                                               |
|                                                           |
| Deal Name *                                               |
| [TechStart Inc - Q1 Engineering Hiring           ]       |
| (Auto-generated, editable)                                |
|                                                           |
| Deal Stage *                                              |
| [Discovery                                       ▼]      |
|   └─ Discovery (Initial meeting scheduled)               |
|   └─ Qualification (Requirements gathering)              |
|   └─ Proposal (Pricing/terms sent)                       |
|   └─ Negotiation (Terms discussion)                      |
|   └─ Verbal Commit (Verbal yes, pending paperwork)       |
|   └─ Closed Won (MSA signed, account created)            |
|   └─ Closed Lost (Deal lost)                             |
|                                                           |
| Deal Type *                                               |
| ○ New Business (New client relationship)                 |
| ○ Expansion (Existing client, new scope)                 |
| ○ Renewal (Contract renewal)                             |
| ○ Re-engagement (Win back former client)                 |
|                                                           |
| DEAL VALUE                                                |
|                                                           |
| Estimated Deal Value *                                    |
| [$75,000.00        ] USD                                 |
|                                                           |
| Value Basis                                               |
| ○ One-time (Total contract value)                        |
| ○ Annual (Annualized revenue)                            |
| ○ Monthly (Monthly recurring)                            |
|                                                           |
| Value Calculation:                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ Estimated Placements: [3    ]                      │  |
| │ Avg. Bill Rate:       [$100 ] /hr                  │  |
| │ Avg. Contract Length: [6    ] months               │  |
| │ Est. Hours/Month:     [173  ] (40 hrs/week)        │  |
| │                                                     │  |
| │ Calculation:                                        │  |
| │ 3 placements × $100/hr × 173 hrs × 6 months       │  |
| │ = $311,400 gross revenue                           │  |
| │                                                     │  |
| │ At 20% margin: ~$62,280 gross margin              │  |
| │ At 5% commission: $3,114/month recruiter earnings │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Win Probability *                                         |
| [70  ]% (Based on stage: Discovery = 20%, Qualified = 40%|
|         Proposal = 60%, Negotiation = 70%, Verbal = 90%) |
|                                                           |
| Weighted Value: $52,500 (75,000 × 70%)                   |
|                                                           |
| TIMELINE                                                  |
|                                                           |
| Expected Close Date *                                     |
| [01/15/2026                                     📅]      |
|                                                           |
| Sales Cycle Duration                                      |
| Estimated: 30 days (Based on deal type: New Business)    |
|                                                           |
| Key Milestones:                                           |
| □ Discovery call completed                               |
| □ Requirements document sent                             |
| □ Proposal/pricing sent                                  |
| □ Contract negotiation                                   |
| □ MSA/contract signed                                    |
|                                                           |
| OPPORTUNITY DETAILS                                       |
|                                                           |
| Hiring Needs (from Lead)                                  |
| [3-4 Senior Software Engineers for Q1 2026       ]       |
|                                                           |
| Roles Breakdown                                           |
| [+ Add Role]                                              |
| ┌────────────────────────────────────────────────────┐  |
| │ Role 1: Senior Backend Engineer                    │  |
| │ Quantity: [2  ] | Rate: [$100-120] | Priority: High│  |
| │                                                     │  |
| │ Role 2: Senior Frontend Engineer                   │  |
| │ Quantity: [1  ] | Rate: [$95-110 ] | Priority: Med │  |
| │                                                [×] │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Services Required                                         |
| ☑ Contract Staffing                                      |
| ☐ Contract-to-Hire                                       |
| ☐ Direct Hire                                            |
| ☐ RPO (Recruitment Process Outsourcing)                  |
| ☐ Managed Services                                       |
|                                                           |
| Competition                                               |
| Known Competitors: [2    ]                               |
| Competitor Names: [TechStaff, HireRight              ]   |
| Competitive Advantage:                                    |
| [Speed and quality - they mentioned struggling with      |
|  traditional channels, our specialization in FinTech     |
|  and access to passive candidates is our edge.     ]     |
|                                                           |
| CONTACTS & STAKEHOLDERS                                   |
|                                                           |
| Primary Contact *                                         |
| Sarah Chen | VP Engineering | sarah.chen@techstart.io    |
| Role: [Champion                                  ▼]      |
|                                                           |
| Additional Stakeholders                                   |
| [+ Add Stakeholder]                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ Name: [Mike Johnson         ]                      │  |
| │ Title: [CTO                 ]                      │  |
| │ Email: [mike@techstart.io   ]                      │  |
| │ Role: [Economic Buyer      ▼]                      │  |
| │   - Champion (Internal advocate)                   │  |
| │   - Economic Buyer (Budget owner)                  │  |
| │   - Technical Buyer (Technical evaluator)          │  |
| │   - End User (Will work with placements)          │  |
| │   - Blocker (Potential obstacle)              [×] │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ASSIGNMENT                                                |
|                                                           |
| Deal Owner *                                              |
| [John Smith (You)                            ▼]          |
|                                                           |
| Pod Manager                                               |
| [Sarah Johnson (Auto-assigned)               ▼]          |
|                                                           |
| Secondary Owner (Optional)                                |
| [Select team member...                       ▼]          |
|                                                           |
| NEXT STEPS                                                |
|                                                           |
| Next Action *                                             |
| [Conduct discovery call                      ▼]          |
|   - Conduct discovery call                               |
|   - Send company overview                                |
|   - Gather requirements                                  |
|   - Send proposal                                        |
|   - Schedule follow-up                                   |
|                                                           |
| Next Action Date *                                        |
| [12/18/2025                                     📅]      |
|                                                           |
| Notes                                                     |
| [Discovery call scheduled for Dec 18 at 2 PM PT.        |
|  Sarah wants to discuss Q1 hiring plans in detail.      |
|  Will involve CTO Mike Johnson on the call.        ]    |
|                                                           |
+----------------------------------------------------------+
|      [Cancel]  [Save as Draft]  [Create Deal ✓]         |
+----------------------------------------------------------+
```

**Field Specification: Deal Value**
| Property | Value |
|----------|-------|
| Field Name | `dealValue` |
| Type | Currency Input |
| Label | "Estimated Deal Value" |
| Required | Yes |
| Currency | USD (default), supports CAD, EUR, GBP, AUD, INR |
| Auto-calculate | Option to calculate from placements × rate × duration |

**Field Specification: Win Probability**
| Property | Value |
|----------|-------|
| Field Name | `winProbability` |
| Type | Number (Percentage) |
| Label | "Win Probability" |
| Required | Yes |
| Range | 0-100 |
| Auto-suggest | Based on deal stage |
| Used For | Weighted pipeline value |

**Field Specification: Stakeholder Role**
| Property | Value |
|----------|-------|
| Field Name | `stakeholderRole` |
| Type | Dropdown |
| Options | Champion, Economic Buyer, Technical Buyer, End User, Blocker, Influencer |
| Purpose | MEDDIC sales methodology support |

**Time:** ~5-10 minutes

---

### Step 2: Review and Submit Deal

**User Action:** Complete all fields, click "Create Deal ✓"

**System Response:**

1. **Deal record created** (~100ms)
   ```sql
   INSERT INTO deals (
     id, org_id, lead_id,
     name, stage, deal_type,
     value, value_basis, win_probability, weighted_value,
     expected_close_date, estimated_placements,
     avg_bill_rate, contract_length_months,
     hiring_needs, roles_breakdown, services_required,
     competitors, competitive_advantage,
     owner_id, pod_manager_id, secondary_owner_id,
     next_action, next_action_date, notes,
     created_by, created_at, updated_at
   ) VALUES (...);
   ```

2. **Lead status updated** (~50ms)
   ```sql
   UPDATE leads
   SET status = 'converted_to_deal',
       deal_id = new_deal_id,
       converted_at = NOW()
   WHERE id = lead_id;
   ```

3. **Stakeholders created** (~100ms)
   ```sql
   INSERT INTO deal_stakeholders (
     deal_id, name, title, email, role
   ) VALUES (...);
   ```

4. **Next action task created** (~50ms)
   ```sql
   INSERT INTO tasks (
     task_type, entity_type, entity_id,
     title, assigned_to, due_date
   ) VALUES (
     'deal_action', 'deal', new_deal_id,
     'Conduct discovery call with TechStart Inc',
     owner_id, '2025-12-18'
   );
   ```

5. **Activity logged** (~50ms)
   - Activity record created
   - Deal timeline initiated

6. **Notifications sent** (~1 second)
   - Pod Manager notified of new deal
   - Deal appears in pipeline view

7. **On Success:**
   - Modal closes
   - Toast: "Deal created successfully! Discovery call scheduled for Dec 18."
   - Redirects to deal detail page

**Screen State (Deal Detail):**
```
+----------------------------------------------------------+
| [← Back to Deals]                           Deal Detail   |
+----------------------------------------------------------+
|                                                           |
| TechStart Inc - Q1 Engineering Hiring                    |
| Stage: 🔵 Discovery                    [Move Stage ▼]    |
| Owner: John Smith | Created: Just now                    |
|                                                           |
| Deal Value: $75,000         Probability: 70%             |
| Weighted: $52,500           Close: Jan 15, 2026          |
|                                                           |
+----------------------------------------------------------+
| Overview | Stakeholders | Activity | Notes | Documents   |
+----------------------------------------------------------+
|                                                           |
| DEAL PROGRESS                                             |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ Discovery → Qualification → Proposal → Negotiation │  |
| │     🔵          ○              ○            ○       │  |
| │                                                     │  |
| │ → Verbal Commit → Closed Won                       │  |
| │        ○              ○                            │  |
| │                                                     │  |
| │ Days in Stage: 0 | Total Age: 0 days               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| OPPORTUNITY DETAILS                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ Hiring Needs: 3-4 Senior Software Engineers        │  |
| │ Services: Contract Staffing                        │  |
| │ Timeline: Q1 2026                                  │  |
| │                                                     │  |
| │ Roles:                                             │  |
| │ • Senior Backend Engineer (2) - $100-120/hr       │  |
| │ • Senior Frontend Engineer (1) - $95-110/hr       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| KEY STAKEHOLDERS                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Sarah Chen - VP Engineering (Champion)             │  |
| │ Mike Johnson - CTO (Economic Buyer)                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NEXT STEPS                                                |
| ┌────────────────────────────────────────────────────┐  |
| │ ⏰ Dec 18 (3 days)                                 │  |
| │ Conduct discovery call                             │  |
| │                                                     │  |
| │ [Mark Complete] [Reschedule] [Add Next Action]    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| RECENT ACTIVITY                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ • Deal created · Just now                          │  |
| │ • Lead converted to deal · Just now                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
| [Update Stage]  [Log Activity]  [Add Note]  [Schedule]   |
+----------------------------------------------------------+
```

**Time:** ~3 seconds for processing

---

## Postconditions

1. ✅ Deal record created in `deals` table
2. ✅ Lead status updated to converted
3. ✅ Stakeholders linked to deal
4. ✅ Next action task created
5. ✅ Pod Manager notified
6. ✅ Deal appears in pipeline view
7. ✅ Activity logged in timeline
8. ✅ Weighted pipeline updated

---

## Events Logged

| Event | Payload |
|-------|---------|
| `deal.created` | `{ deal_id, lead_id, value, stage, owner_id, created_at }` |
| `lead.converted` | `{ lead_id, deal_id, converted_at }` |
| `deal.stakeholder_added` | `{ deal_id, stakeholder_name, role }` |
| `task.created` | `{ task_type: 'deal_action', deal_id, action, due_date }` |

---

## Deal Stage Definitions

| Stage | Definition | Probability | Exit Criteria |
|-------|------------|-------------|---------------|
| **Discovery** | Initial meeting scheduled | 20% | Discovery call completed |
| **Qualification** | Requirements being gathered | 40% | Requirements documented |
| **Proposal** | Pricing/terms sent | 60% | Proposal delivered, reviewed by client |
| **Negotiation** | Terms being discussed | 70% | Agreement on terms |
| **Verbal Commit** | Verbal yes, pending paperwork | 90% | MSA received for signature |
| **Closed Won** | Contract signed | 100% | MSA signed, account created |
| **Closed Lost** | Deal lost | 0% | Loss reason documented |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Required | Required field empty | "Deal value is required" | Fill field |
| Invalid Date | Close date in past | "Expected close date must be in the future" | Select future date |
| Lead Already Converted | Lead has existing deal | "This lead has already been converted to deal [link]" | View existing deal |
| Low Win Probability | <10% probability | "Win probability seems low. Confirm or adjust stage?" | Confirm or adjust |

---

## Alternative Flows

### A1: Create Deal from Account (Expansion)

1. Navigate to existing account
2. Click "Create Deal"
3. Deal type defaults to "Expansion"
4. Account data pre-filled
5. Link to existing account relationship

### A2: Quick Deal from Pipeline View

1. Click "+ New Deal" in pipeline view
2. Simplified form (name, value, close date)
3. Qualify details later
4. Fast entry for known opportunities

---

## Related Use Cases

- [B02-qualify-opportunity.md](./B02-qualify-opportunity.md) - Lead qualification
- [B04-manage-deal-pipeline.md](./B04-manage-deal-pipeline.md) - Pipeline management
- [B05-close-deal.md](./B05-close-deal.md) - Deal closure
- [C01-create-account.md](./C01-create-account.md) - Convert deal to account

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create deal from qualified lead | Deal created, lead converted |
| TC-002 | Pre-fill data from lead | All lead data transferred |
| TC-003 | Calculate deal value from roles | Accurate calculation shown |
| TC-004 | Add multiple stakeholders | All stakeholders saved |
| TC-005 | Set 70% win probability | Weighted value = value × 0.7 |
| TC-006 | Create task for next action | Task created with due date |
| TC-007 | Duplicate deal from lead | Warning shown |
| TC-008 | Pod Manager notification | PM receives deal alert |

---

## Backend Processing

### tRPC Procedures

- `deals.create` - Create deal record
- `deals.calculateValue` - Calculate from placements
- `deals.addStakeholder` - Add deal stakeholder
- `leads.convertToDeal` - Update lead status
- `tasks.createDealAction` - Create next action task

### Database Schema

**Table:** `deals`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `org_id` | UUID | FK to organizations |
| `lead_id` | UUID | FK to leads (nullable for expansion deals) |
| `account_id` | UUID | FK to accounts (nullable for new business) |
| `name` | VARCHAR(200) | Deal name |
| `stage` | ENUM | discovery, qualification, proposal, negotiation, verbal_commit, closed_won, closed_lost |
| `deal_type` | ENUM | new_business, expansion, renewal, re_engagement |
| `value` | DECIMAL | Deal value |
| `value_basis` | ENUM | one_time, annual, monthly |
| `currency` | VARCHAR(3) | USD, CAD, EUR, GBP, etc. |
| `win_probability` | INTEGER | 0-100 |
| `weighted_value` | DECIMAL | value × probability |
| `expected_close_date` | DATE | |
| `estimated_placements` | INTEGER | |
| `avg_bill_rate` | DECIMAL | |
| `contract_length_months` | INTEGER | |
| `hiring_needs` | TEXT | |
| `roles_breakdown` | JSONB | |
| `services_required` | TEXT[] | |
| `competitors` | TEXT[] | |
| `competitive_advantage` | TEXT | |
| `owner_id` | UUID | FK to users |
| `pod_manager_id` | UUID | FK to users |
| `secondary_owner_id` | UUID | FK to users |
| `next_action` | VARCHAR(100) | |
| `next_action_date` | DATE | |
| `notes` | TEXT | |
| `closed_at` | TIMESTAMP | |
| `closed_reason` | TEXT | |
| `created_by` | UUID | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Table:** `deal_stakeholders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `deal_id` | UUID | FK to deals |
| `name` | VARCHAR(100) | |
| `title` | VARCHAR(100) | |
| `email` | VARCHAR(255) | |
| `phone` | VARCHAR(50) | |
| `role` | ENUM | champion, economic_buyer, technical_buyer, end_user, blocker, influencer |
| `notes` | TEXT | |

---

## Commission Projection

When deal is won, recruiter commission calculated:

```
Deal Value: $75,000 (6-month contract value)
Gross Margin: 20% = $15,000
Recruiter Commission: 5% of gross = $750/month × 6 = $4,500 total

Breakdown by placement:
- 3 placements × $100/hr × 173 hrs/month × 6 months
- Gross: $311,400
- Margin (20%): $62,280
- Commission (5%): $3,114 per month while placements active
```

---

*Last Updated: 2025-12-05*

