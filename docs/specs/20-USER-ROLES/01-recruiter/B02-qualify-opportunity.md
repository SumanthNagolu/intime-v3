# Use Case: Qualify Opportunity

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-013 |
| Actor | Recruiter (BDM Role) |
| Goal | Assess lead fit and convert qualified leads to deals |
| Frequency | 3-5 times per week |
| Estimated Time | 15-30 minutes per qualification call |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Lead exists in system with status "contacted" or "new"
3. User has "lead.update" and "deal.create" permissions
4. Initial contact has been made with lead

---

## Trigger

One of the following:
- Lead responds positively to outreach
- Lead requests information about services
- Scheduled qualification call from task list
- Lead reaches "contacted" status
- Manager assigns lead for qualification

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Lead Detail

**User Action:** Click on lead from Leads list or search

**System Response:**
- Lead detail page loads
- URL changes to: `/employee/workspace/leads/{lead-id}`
- All lead information displayed
- Contact information visible
- Activity timeline shown

**Screen State:**
```
+----------------------------------------------------------+
| Acme Corp                                [Edit] [⋮ More] |
| Lead • New                                               |
+----------------------------------------------------------+
| 📊 QUALIFICATION SCORE: Not Yet Qualified                |
+----------------------------------------------------------+
|                                                           |
| COMPANY INFORMATION                                       |
| ┌─────────────────────────────────────────────────────┐ |
| │ Industry:      Technology                           │ |
| │ Size:          201-500 employees                    │ |
| │ Location:      San Francisco, CA                    │ |
| │ Website:       https://acmecorp.com                 │ |
| │ Source:        LinkedIn                             │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| PRIMARY CONTACT                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │ 👤 Sarah Jones                                      │ |
| │ VP of Engineering                                   │ |
| │ ✉ sarah.jones@acmecorp.com                         │ |
| │ ☎ (555) 123-4567                                   │ |
| │ 🔗 linkedin.com/in/sarahjones                      │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| ACTIONS                                                   |
| [📞 Log Call] [✉ Send Email] [📝 Add Note]              |
| [✅ Qualify Lead] [❌ Disqualify] [🔄 Convert to Deal]   |
|                                                           |
| ACTIVITY TIMELINE                                         |
| ┌─────────────────────────────────────────────────────┐ |
| │ Nov 28 • Lead created from LinkedIn                 │ |
| │ Nov 28 • Initial email sent                         │ |
| │ Nov 29 • Sarah replied - interested in discussing   │ |
| └─────────────────────────────────────────────────────┘ |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "Qualify Lead" Button

**User Action:** Click "✅ Qualify Lead" button

**System Response:**
- Qualification modal opens
- Modal slides in from right (300ms animation)
- BANT framework form displayed
- First field focused

**Screen State:**
```
+----------------------------------------------------------+
|                                    Qualify Lead: Acme Corp |
|                                                      [×]  |
+----------------------------------------------------------+
| Lead Qualification Framework (BANT)                      |
|                                                           |
| BUDGET                                                    |
| Does the prospect have budget for staffing?               |
| ○ Yes, confirmed budget                                   |
| ○ Budget likely available                                 |
| ○ Budget unclear                                          |
| ○ No budget / Cost-prohibitive                            |
|                                                           |
| Estimated Monthly Spend:                                  |
| [$          ] /month                                      |
|                                                           |
| AUTHORITY                                                 |
| Is the contact a decision-maker?                          |
| ○ Final decision-maker                                    |
| ○ Influences decision                                     |
| ○ Gatekeeper / Can introduce to DM                        |
| ○ No decision authority                                   |
|                                                           |
| NEED                                                      |
| What is the business need?                                |
| [                                              ]          |
| [                                              ]          |
| [                                              ] 0/500    |
|                                                           |
| Urgency:                                                  |
| ○ Immediate (< 2 weeks)                                   |
| ○ High (< 1 month)                                        |
| ○ Medium (1-3 months)                                     |
| ○ Low (> 3 months)                                        |
|                                                           |
| TIMELINE                                                  |
| When do they need to hire?                                |
| Start Date: [MM/DD/YYYY                        📅]        |
|                                                           |
| Number of Positions: [    ]                               |
|                                                           |
| ADDITIONAL QUALIFICATION                                  |
| Tech Stack / Skills Needed:                               |
| [+ Add skill] [React] [×] [Node.js] [×]                  |
|                                                           |
| Contract Type:                                            |
| □ Contract   □ Contract-to-Hire   □ Permanent            |
|                                                           |
| Qualification Notes:                                      |
| [                                              ]          |
| [                                              ] 0/1000   |
|                                                           |
| QUALIFICATION RESULT                                      |
| ○ Qualified - Convert to Deal                             |
| ○ Qualified - Needs Nurturing                             |
| ○ Not Qualified                                           |
|                                                           |
+----------------------------------------------------------+
|                  [Cancel]  [Save Qualification ✓]        |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Assess Budget

**User Action:** Select budget option based on qualification call

**System Response:**
- Radio button selected
- If "Yes, confirmed budget" or "Budget likely": Monthly spend field becomes required
- Score updates in real-time (shown at top of form)

**Field Specification: Budget Assessment**
| Property | Value |
|----------|-------|
| Field Name | `budgetStatus` |
| Type | Radio Button Group |
| Label | "Does the prospect have budget for staffing?" |
| Required | Yes |
| Options | |
| - `confirmed` | "Yes, confirmed budget" (Score: +25) |
| - `likely` | "Budget likely available" (Score: +15) |
| - `unclear` | "Budget unclear" (Score: +5) |
| - `no_budget` | "No budget / Cost-prohibitive" (Score: 0) |

**Field Specification: Estimated Monthly Spend**
| Property | Value |
|----------|-------|
| Field Name | `estimatedMonthlySpend` |
| Type | Currency Input |
| Label | "Estimated Monthly Spend" |
| Suffix | "/month" |
| Required | If budget confirmed or likely |
| Min Value | 0 |
| Validation | Must be > $5,000 for qualified status |

**Time:** ~5 seconds

---

### Step 4: Assess Authority

**User Action:** Select authority level of contact

**System Response:**
- Radio button selected
- Score updates
- If "No decision authority": Warning appears suggesting to get introduced to DM

**Field Specification: Authority**
| Property | Value |
|----------|-------|
| Field Name | `authorityLevel` |
| Type | Radio Button Group |
| Label | "Is the contact a decision-maker?" |
| Required | Yes |
| Options | |
| - `decision_maker` | "Final decision-maker" (Score: +25) |
| - `influencer` | "Influences decision" (Score: +20) |
| - `gatekeeper` | "Gatekeeper / Can introduce to DM" (Score: +10) |
| - `no_authority` | "No decision authority" (Score: 0) |

**Time:** ~3 seconds

---

### Step 5: Document Need

**User Action:** Type business need description

**System Response:**
- Text appears in textarea
- Character count updates
- This is critical for matching to services

**Field Specification: Business Need**
| Property | Value |
|----------|-------|
| Field Name | `businessNeed` |
| Type | Textarea |
| Label | "What is the business need?" |
| Placeholder | "Describe the business challenge, project, team expansion, etc." |
| Required | Yes |
| Max Length | 500 characters |
| Min Length | 20 characters |

**Time:** ~30 seconds

---

### Step 6: Assess Urgency

**User Action:** Select urgency level

**System Response:**
- Radio button selected
- Score updates
- Higher urgency = higher qualification score

**Field Specification: Urgency**
| Property | Value |
|----------|-------|
| Field Name | `urgency` |
| Type | Radio Button Group |
| Label | "Urgency" |
| Required | Yes |
| Options | |
| - `immediate` | "Immediate (< 2 weeks)" (Score: +25) |
| - `high` | "High (< 1 month)" (Score: +20) |
| - `medium` | "Medium (1-3 months)" (Score: +10) |
| - `low` | "Low (> 3 months)" (Score: +5) |

**Time:** ~3 seconds

---

### Step 7: Set Timeline

**User Action:** Enter desired start date and number of positions

**Field Specification: Start Date**
| Property | Value |
|----------|-------|
| Field Name | `targetStartDate` |
| Type | Date Picker |
| Label | "Start Date" |
| Min Date | Today |
| Required | Yes |

**Field Specification: Number of Positions**
| Property | Value |
|----------|-------|
| Field Name | `positionsCount` |
| Type | Number Input |
| Label | "Number of Positions" |
| Min | 1 |
| Max | 50 |
| Default | 1 |
| Required | Yes |

**Time:** ~10 seconds

---

### Step 8: Add Tech Stack / Skills

**User Action:** Type skills and press Enter to add tags

**System Response:**
- Skills appear as tags
- Autocomplete from skills database
- This helps match to available talent

**Field Specification: Skills Needed**
| Property | Value |
|----------|-------|
| Field Name | `skillsNeeded` |
| Type | Tag Input |
| Label | "Tech Stack / Skills Needed" |
| Required | No (but recommended) |
| Autocomplete | Skills database |
| Max Tags | 20 |

**Time:** ~20 seconds

---

### Step 9: Select Contract Type

**User Action:** Check applicable contract types

**Field Specification: Contract Type**
| Property | Value |
|----------|-------|
| Field Name | `contractTypes` |
| Type | Checkbox Group |
| Label | "Contract Type" |
| Required | Yes (at least one) |
| Options | |
| - `contract` | "Contract" |
| - `contract_to_hire` | "Contract-to-Hire" |
| - `permanent` | "Permanent" |

**Time:** ~5 seconds

---

### Step 10: Add Qualification Notes

**User Action:** Type notes from qualification call

**Field Specification: Qualification Notes**
| Property | Value |
|----------|-------|
| Field Name | `qualificationNotes` |
| Type | Textarea |
| Label | "Qualification Notes" |
| Placeholder | "Notes from qualification call, objections, competitor mentions, etc." |
| Required | No |
| Max Length | 1000 characters |

**Time:** ~1 minute

---

### Step 11: Select Qualification Result

**User Action:** Choose final qualification outcome

**System Response:**
- Based on selected option, different next steps appear
- Qualification score shown (0-100)
- If score < 50: System suggests "Not Qualified" or "Needs Nurturing"
- If score >= 50: System suggests "Convert to Deal"

**Field Specification: Qualification Result**
| Property | Value |
|----------|-------|
| Field Name | `qualificationResult` |
| Type | Radio Button Group |
| Label | "Qualification Result" |
| Required | Yes |
| Options | |
| - `qualified_convert` | "Qualified - Convert to Deal" (If score >= 50) |
| - `qualified_nurture` | "Qualified - Needs Nurturing" (If score 30-49) |
| - `not_qualified` | "Not Qualified" (If score < 30) |

**Qualification Scoring:**
```
Total Score = Budget (0-25) + Authority (0-25) + Need (0-25) + Urgency (0-25)

0-29:   Not Qualified
30-49:  Qualified but needs nurturing
50-74:  Qualified - Good opportunity
75-100: Qualified - Excellent opportunity
```

**Time:** ~5 seconds

---

### Step 12: Click "Save Qualification"

**User Action:** Click "Save Qualification ✓" button

**System Response:**
1. Button shows loading state
2. Form validates
3. API call `POST /api/trpc/leads.qualify`
4. On success:
   - Modal closes
   - Lead status updated
   - Toast notification: "Lead qualified successfully"
   - If "Convert to Deal" selected: Deal creation modal opens
   - If "Needs Nurturing": Task created for follow-up in 2 weeks
   - If "Not Qualified": Lead status = "unqualified"
   - Lead detail page refreshes with qualification data
5. On error:
   - Error toast shown
   - Modal stays open

**Time:** ~2 seconds

---

### Step 13: Convert to Deal (If Qualified)

**User Action:** If "Convert to Deal" selected, deal modal opens automatically

**System Response:**
- Deal creation modal opens
- Pre-filled with qualification data
- Company name, contact, needs, timeline auto-populated
- User reviews and adjusts

**Screen State:**
```
+----------------------------------------------------------+
|                                        Create Deal        |
|                                                      [×]  |
+----------------------------------------------------------+
| Pre-filled from Lead: Acme Corp                           |
|                                                           |
| Deal Name *                                               |
| [Acme Corp - Engineering Team Expansion        ]          |
|                                                           |
| Account                                                   |
| [Create new account: Acme Corp             ▼]             |
|                                                           |
| Deal Value (Est. Annual) *                                |
| [$120,000    ] (Pre-filled: $10K/mo × 12)                |
|                                                           |
| Deal Stage *                                              |
| [Qualification                                 ▼]         |
|                                                           |
| Expected Close Date                                       |
| [01/15/2026                                   📅]         |
|                                                           |
| Description                                               |
| [Need 3 React engineers for new product build.    ]      |
| [Start date: Feb 1. Budget confirmed: $10K/mo.    ]      |
| [                                              ]          |
|                                                           |
| □ Create account from lead                                |
| □ Create first job from requirements                      |
|                                                           |
+----------------------------------------------------------+
|                    [Cancel]  [Create Deal ✓]             |
+----------------------------------------------------------+
```

**Time:** ~30 seconds to review and adjust

---

### Step 14: Finalize Deal Creation

**User Action:** Review pre-filled data, adjust as needed, click "Create Deal ✓"

**System Response:**
1. Creates deal record
2. If "Create account" checked: Creates account from lead
3. If "Create first job" checked: Opens job creation with pre-filled data
4. Lead status → "converted"
5. Lead linked to deal and account
6. Redirects to deal detail page
7. Toast: "Deal created successfully from qualified lead"

**Time:** ~2 seconds

---

## Postconditions

1. ✅ Lead record updated with qualification data
2. ✅ Lead status updated based on qualification result
3. ✅ Qualification score calculated and stored
4. ✅ BANT fields populated
5. ✅ Activity logged: "lead.qualified"
6. ✅ If qualified → Deal created and linked
7. ✅ If needs nurturing → Follow-up task created
8. ✅ If not qualified → Lead status = "unqualified"

---

## Events Logged

| Event | Payload |
|-------|---------|
| `lead.qualified` | `{ lead_id, qualification_score, result, budget, authority, need, urgency }` |
| `lead.status_changed` | `{ lead_id, old_status, new_status, changed_by }` |
| `deal.created` | `{ deal_id, lead_id, account_id, value, stage }` (if converted) |
| `account.created` | `{ account_id, lead_id, name, industry }` (if converted) |
| `task.created` | `{ task_id, lead_id, type: 'nurture_followup', due_date }` (if nurturing) |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Required field empty | "Please complete all required fields" | Fill in missing data |
| Low Qualification Score | Score < 30 but "Convert to Deal" selected | "Lead score is low. Are you sure you want to convert?" | Review qualification or change result |
| Missing Budget | "Confirmed budget" but no spend amount | "Please enter estimated monthly spend" | Add budget amount |
| Invalid Start Date | Date in past | "Start date must be in the future" | Select future date |
| Permission Denied | User lacks permission | "You don't have permission to qualify leads" | Contact Admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Esc` | Close modal (with confirmation if changes made) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd+Enter` | Submit form (from any field) |

---

## Alternative Flows

### A1: Quick Disqualify

If lead clearly doesn't qualify:

1. User clicks "❌ Disqualify" button on lead detail
2. Simple modal opens
3. User selects disqualification reason:
   - No budget
   - Wrong industry/vertical
   - Not decision-maker
   - Timeline too far out
   - Other (specify)
4. User adds notes (optional)
5. Lead status → "unqualified"
6. Lead archived from active view

### A2: Partial Qualification (Save Progress)

If qualification call incomplete:

1. User fills partial BANT data
2. User clicks "Save Progress"
3. Data saved but lead stays in "contacted" status
4. Task created to complete qualification
5. Can resume qualification later with saved data

### A3: Re-qualify Lead

If lead was previously unqualified but circumstances changed:

1. User opens unqualified lead
2. User clicks "Re-qualify"
3. Qualification modal opens with previous data
4. User updates BANT fields
5. New qualification saved
6. Lead status updated based on new result

---

## Related Use Cases

- [B01-prospect-new-client.md](./B01-prospect-new-client.md) - Previous step
- [C01-create-account.md](./C01-create-account.md) - Next step if qualified
- [D01-create-job.md](./D01-create-job.md) - Next step after account created
- [C04-manage-client-relationship.md](./C04-manage-client-relationship.md) - Ongoing after conversion

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Qualify lead with high BANT score (75+) | Suggests "Convert to Deal" |
| TC-002 | Qualify lead with medium score (30-49) | Suggests "Needs Nurturing" |
| TC-003 | Qualify lead with low score (<30) | Suggests "Not Qualified" |
| TC-004 | Convert qualified lead to deal | Deal created, account created, lead converted |
| TC-005 | Disqualify lead | Lead status = "unqualified" |
| TC-006 | Save partial qualification | Data saved, task created |
| TC-007 | Re-qualify previously unqualified lead | New qualification saved |
| TC-008 | Qualified without budget amount | Error: "Please enter estimated monthly spend" |
| TC-009 | Invalid start date | Error: "Start date must be in the future" |
| TC-010 | Needs nurturing selected | Task created for 2-week follow-up |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/leads.ts`
**Procedure:** `leads.qualify`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const qualifyLeadInput = z.object({
  leadId: z.string().uuid(),

  // BANT Assessment
  budgetStatus: z.enum(['confirmed', 'likely', 'unclear', 'no_budget']),
  estimatedMonthlySpend: z.number().positive().optional(),
  authorityLevel: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'no_authority']),
  businessNeed: z.string().min(20).max(500),
  urgency: z.enum(['immediate', 'high', 'medium', 'low']),

  // Timeline
  targetStartDate: z.date(),
  positionsCount: z.number().int().min(1).max(50),

  // Additional
  skillsNeeded: z.array(z.string()).optional(),
  contractTypes: z.array(z.enum(['contract', 'contract_to_hire', 'permanent'])),
  qualificationNotes: z.string().max(1000).optional(),

  // Result
  qualificationResult: z.enum(['qualified_convert', 'qualified_nurture', 'not_qualified']),
});

export type QualifyLeadInput = z.infer<typeof qualifyLeadInput>;
```

### Output Schema

```typescript
export const qualifyLeadOutput = z.object({
  leadId: z.string().uuid(),
  qualificationScore: z.number().int().min(0).max(100),
  leadStatus: z.string(),
  dealId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  qualifiedAt: z.string().datetime(),
});

export type QualifyLeadOutput = z.infer<typeof qualifyLeadOutput>;
```

### Processing Steps

1. **Validate Input & Calculate Score** (~50ms)

   ```typescript
   // Calculate BANT score
   const budgetScore = {
     confirmed: 25, likely: 15, unclear: 5, no_budget: 0
   }[input.budgetStatus];

   const authorityScore = {
     decision_maker: 25, influencer: 20, gatekeeper: 10, no_authority: 0
   }[input.authorityLevel];

   const urgencyScore = {
     immediate: 25, high: 20, medium: 10, low: 5
   }[input.urgency];

   const needScore = input.businessNeed.length >= 20 ? 25 : 0;

   const qualificationScore = budgetScore + authorityScore + urgencyScore + needScore;
   ```

2. **Update Lead Record** (~100ms)

   ```sql
   UPDATE leads SET
     budget_status = $1,
     estimated_monthly_spend = $2,
     authority_level = $3,
     business_need = $4,
     urgency = $5,
     target_start_date = $6,
     positions_count = $7,
     skills_needed = $8::text[],
     contract_types = $9::text[],
     qualification_notes = $10,
     qualification_score = $11,
     lead_status = $12,
     qualified_at = NOW(),
     updated_at = NOW()
   WHERE id = $13 AND org_id = $14
   RETURNING id;
   ```

3. **Create Deal (If Qualified Convert)** (~150ms)

   ```sql
   INSERT INTO deals (
     id, org_id, lead_id, name, description,
     deal_value, deal_stage, expected_close_date,
     owner_id, created_by, created_at, updated_at
   ) VALUES (
     gen_random_uuid(), $1, $2, $3, $4,
     ($5 * 12), 'qualification', $6,
     $7, $7, NOW(), NOW()
   ) RETURNING id;
   ```

4. **Create Account (If Converting)** (~150ms)

   ```sql
   INSERT INTO accounts (
     id, org_id, name, industry, website,
     company_size, location, lead_source,
     owner_id, created_by, created_at, updated_at
   )
   SELECT
     gen_random_uuid(), l.org_id, l.company_name, l.industry, l.website,
     l.company_size, l.location, l.lead_source,
     l.owner_id, $1, NOW(), NOW()
   FROM leads l
   WHERE l.id = $2
   RETURNING id;
   ```

5. **Create Nurture Task (If Needs Nurturing)** (~50ms)

   ```sql
   INSERT INTO tasks (
     id, org_id, entity_type, entity_id,
     title, due_date, assigned_to, status,
     created_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'lead', $2,
     'Follow up with ' || $3, NOW() + INTERVAL '14 days', $4, 'pending',
     $4, NOW()
   ) RETURNING id;
   ```

6. **Log Activities** (~50ms)

   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description, metadata, created_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'lead', $2,
     'qualified', 'Lead qualified', jsonb_build_object(
       'qualification_score', $3,
       'result', $4
     ), $5, NOW()
   );
   ```

---

## Database Schema Reference

### Table: leads (Additional Fields)

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `budget_status` | ENUM | | confirmed, likely, unclear, no_budget |
| `estimated_monthly_spend` | DECIMAL(10,2) | | Expected monthly staffing spend |
| `authority_level` | ENUM | | decision_maker, influencer, gatekeeper, no_authority |
| `business_need` | TEXT | | Description of need |
| `urgency` | ENUM | | immediate, high, medium, low |
| `target_start_date` | DATE | | When they need to hire |
| `positions_count` | INT | | Number of positions needed |
| `skills_needed` | TEXT[] | | Array of required skills |
| `contract_types` | TEXT[] | | contract, contract_to_hire, permanent |
| `qualification_notes` | TEXT | | Notes from qualification |
| `qualification_score` | INT | | Calculated BANT score (0-100) |
| `qualified_at` | TIMESTAMP | | When lead was qualified |

---

*Last Updated: 2025-11-30*
