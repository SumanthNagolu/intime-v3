# Use Case: Create Job

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-001 |
| Actor | Recruiter |
| Goal | Create a new job requisition in the system |
| Frequency | 3-5 times per week |
| Estimated Time | 5-10 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "job.create" permission (default for Recruiter role)
3. Client Account exists in the system (or user will create during flow)

---

## Trigger

One of the following:
- Received job requirement via email from client
- Client call revealed new opening
- Manager assigned new job to recruiter
- Account Manager logged new opportunity

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Jobs

**User Action:** Click "Jobs" in the sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/jobs`
- Jobs list screen loads
- Loading skeleton shows for 200-500ms
- Jobs list populates with user's assigned jobs

**Screen State:**
```
+----------------------------------------------------------+
| Jobs                              [+ New Job] [⚙] [Cmd+K] |
+----------------------------------------------------------+
| [Search jobs...]                    [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| ● Active │ ○ On Hold │ ○ Filled │ ○ All                   |
+----------------------------------------------------------+
| Status  Job Title              Account      Pipeline  Age |
| ─────────────────────────────────────────────────────────|
| 🟢 Act  Senior Developer       Google       12 cand   3d  |
| 🟢 Act  Product Manager        Meta         8 cand    5d  |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "New Job" Button

**User Action:** Click the "+ New Job" button in top-right corner

**System Response:**
- Button shows click state (darker background)
- Modal slides in from right (300ms animation)
- Modal title: "Create New Job"
- First field (Job Title) is focused
- Keyboard cursor blinks in Job Title field

**Screen State:**
```
+----------------------------------------------------------+
|                                          Create New Job   |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 1 of 3: Basic Information                            |
|                                                           |
| Job Title *                                               |
| [                                              ] 0/200    |
|                                                           |
| Client Account *                                          |
| [Search accounts...                            ] [+ New]  |
|                                                           |
| Job Type *                                                |
| [Contract                                      ▼]         |
|                                                           |
| Location                                                  |
| [                                              ]          |
|                                                           |
| □ Remote    □ Hybrid (if hybrid: [__] days/week)         |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Requirements →]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Enter Job Title

**User Action:** Type job title, e.g., "Senior Software Engineer"

**System Response:**
- Characters appear in input field
- Character counter updates: "25/200"
- No validation errors (title is valid)

**Field Specification: Job Title**
| Property | Value |
|----------|-------|
| Field Name | `title` |
| Type | Text Input |
| Label | "Job Title" |
| Placeholder | "e.g., Senior Software Engineer" |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 3 characters |
| Validation | Not empty, no special characters except `-`, `()`, `/` |
| Error Messages | |
| - Empty | "Job title is required" |
| - Too short | "Job title must be at least 3 characters" |
| - Invalid chars | "Job title contains invalid characters" |
| Keyboard | Standard text |
| Autocomplete | Previous job titles (suggestions appear after 3 chars) |

**Time:** ~5 seconds

---

### Step 4: Select Client Account

**User Action:** Click on "Client Account" dropdown

**System Response:**
- Dropdown opens showing search input
- Recent accounts (last 5 used) appear first
- All active accounts listed alphabetically below

**User Action:** Type "Goo" to search

**System Response:**
- List filters in real-time
- Shows: "Google (Technology)", "Goodyear (Manufacturing)"

**User Action:** Click "Google (Technology)"

**System Response:**
- Dropdown closes
- Field shows selected account: "Google (Technology)"
- If account has default contacts, they pre-populate in later step

**Field Specification: Client Account**
| Property | Value |
|----------|-------|
| Field Name | `accountId` |
| Type | Searchable Dropdown |
| Label | "Client Account" |
| Placeholder | "Search accounts..." |
| Required | Yes |
| Data Source | `accounts` table WHERE `status = 'active'` AND `org_id = current_org` |
| Display Format | `{account.name} ({account.industry})` |
| Search Fields | `name`, `industry`, `website` |
| Recent Items | Yes (last 5 used) |
| Allow Create | Yes - Opens "Quick Add Account" modal |
| Error Messages | |
| - Not selected | "Please select a client account" |

**Time:** ~5 seconds

---

### Step 5: Select Job Type

**User Action:** Click "Job Type" dropdown

**System Response:**
- Dropdown opens with options

**User Action:** Click "Contract"

**System Response:**
- Dropdown closes
- Field shows: "Contract"

**Field Specification: Job Type**
| Property | Value |
|----------|-------|
| Field Name | `jobType` |
| Type | Dropdown (Select) |
| Label | "Job Type" |
| Required | Yes |
| Default | "Contract" |
| Options | |
| - `contract` | "Contract" |
| - `permanent` | "Permanent (Direct Hire)" |
| - `contract_to_hire` | "Contract to Hire" |
| - `temp` | "Temporary" |
| - `sow` | "Statement of Work (SOW)" |

**Time:** ~2 seconds

---

### Step 6: Enter Location

**User Action:** Type location, e.g., "San Francisco, CA"

**System Response:**
- Text appears in input
- Optional autocomplete from Google Places API (if integrated)

**Field Specification: Location**
| Property | Value |
|----------|-------|
| Field Name | `location` |
| Type | Text Input |
| Label | "Location" |
| Placeholder | "e.g., San Francisco, CA" |
| Required | No (but recommended) |
| Max Length | 200 characters |
| Autocomplete | Google Places (optional) |

**Time:** ~3 seconds

---

### Step 7: Set Remote Options

**User Action:** Check "Remote" checkbox

**System Response:**
- Checkbox becomes checked (✓)
- If "Hybrid" selected instead, shows additional field for days/week

**Field Specification: Remote Flag**
| Property | Value |
|----------|-------|
| Field Name | `isRemote` |
| Type | Checkbox |
| Label | "Remote" |
| Default | Unchecked |

**Field Specification: Hybrid Days**
| Property | Value |
|----------|-------|
| Field Name | `hybridDays` |
| Type | Number Input |
| Label | "days/week in office" |
| Visible | Only when "Hybrid" is checked |
| Min | 1 |
| Max | 5 |
| Default | 3 |

**Time:** ~2 seconds

---

### Step 8: Click "Next" to Requirements

**User Action:** Click "Next: Requirements →" button

**System Response:**
- Form validates Step 1 fields
- If valid: Animation slides to Step 2
- If invalid: Shows error messages on invalid fields, focus on first error

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                                          Create New Job   |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 2 of 3: Requirements                                 |
|                                                           |
| Required Skills *                                         |
| [+ Add skill                                           ]  |
| [React] [×]  [Node.js] [×]  [AWS] [×]                    |
|                                                           |
| Nice-to-Have Skills                                       |
| [+ Add skill                                           ]  |
|                                                           |
| Experience Range                                          |
| Min: [5  ] years    Max: [10 ] years                     |
|                                                           |
| Visa Requirements                                         |
| [Select allowed visa types...                      ▼]     |
|                                                           |
| Description                                               |
| [                                                      ]  |
| [                                                      ]  |
| [                                               ] 0/5000  |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Next: Compensation →] |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 9: Add Required Skills

**User Action:** Click in "Required Skills" field, type "React", press Enter

**System Response:**
- Tag "React" appears with × button
- Input clears, ready for next skill
- Autocomplete shows matching skills from skills database

**User Action:** Type "Node", select "Node.js" from dropdown, press Enter

**System Response:**
- Tag "Node.js" appears

**User Action:** Type "AWS", press Enter

**System Response:**
- Tag "AWS" appears

**Field Specification: Required Skills**
| Property | Value |
|----------|-------|
| Field Name | `requiredSkills` |
| Type | Tag Input |
| Label | "Required Skills" |
| Required | Yes (at least 1) |
| Data Source | `skills` table (autocomplete) |
| Allow Custom | Yes (creates new skill if not exists) |
| Max Tags | 20 |
| Error Messages | |
| - Empty | "At least one required skill is needed" |
| - Too many | "Maximum 20 skills allowed" |

**Time:** ~15 seconds

---

### Step 10: Add Nice-to-Have Skills (Optional)

**User Action:** Click in "Nice-to-Have Skills" field, add "TypeScript", "GraphQL"

**System Response:**
- Tags appear for each skill

**Field Specification: Nice-to-Have Skills**
| Property | Value |
|----------|-------|
| Field Name | `niceToHaveSkills` |
| Type | Tag Input |
| Label | "Nice-to-Have Skills" |
| Required | No |
| Max Tags | 20 |

**Time:** ~10 seconds

---

### Step 11: Set Experience Range

**User Action:** Enter "5" in Min field, "10" in Max field

**System Response:**
- Numbers appear in fields
- Validation ensures Min ≤ Max

**Field Specification: Min Experience**
| Property | Value |
|----------|-------|
| Field Name | `minExperienceYears` |
| Type | Number Input |
| Label | "Min" |
| Suffix | "years" |
| Min | 0 |
| Max | 50 |
| Default | null |

**Field Specification: Max Experience**
| Property | Value |
|----------|-------|
| Field Name | `maxExperienceYears` |
| Type | Number Input |
| Label | "Max" |
| Suffix | "years" |
| Min | 0 |
| Max | 50 |
| Validation | Must be ≥ Min Experience |
| Error | "Max experience must be greater than or equal to min" |

**Time:** ~5 seconds

---

### Step 12: Select Visa Requirements

**User Action:** Click visa dropdown, select "US Citizen", "Green Card", "H1B"

**System Response:**
- Multi-select dropdown shows checkboxes
- Selected options appear as tags

**Field Specification: Visa Requirements**
| Property | Value |
|----------|-------|
| Field Name | `visaRequirements` |
| Type | Multi-select Dropdown |
| Label | "Visa Requirements" |
| Required | No |
| Options | |
| - `us_citizen` | "US Citizen" |
| - `green_card` | "Green Card" |
| - `h1b` | "H1B" |
| - `l1` | "L1" |
| - `opt` | "OPT/CPT" |
| - `tn` | "TN Visa" |
| - `any` | "Any (No restriction)" |

**Time:** ~5 seconds

---

### Step 13: Enter Description

**User Action:** Type or paste job description

**System Response:**
- Text appears in textarea
- Character count updates

**Field Specification: Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Textarea (Rich Text optional) |
| Label | "Description" |
| Placeholder | "Enter job description, responsibilities, and requirements..." |
| Required | No (but recommended) |
| Max Length | 5000 characters |
| Rich Text | Optional (bold, italic, lists) |

**Time:** ~30 seconds to 2 minutes (if pasting from email)

---

### Step 14: Click "Next" to Compensation

**User Action:** Click "Next: Compensation →" button

**System Response:**
- Validates Step 2 fields
- Slides to Step 3

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                                          Create New Job   |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 3 of 3: Compensation & Details                       |
|                                                           |
| Bill Rate Range *                                         |
| Min: [$    ] /hr    Max: [$    ] /hr                     |
|                                                           |
| Rate Type                                                 |
| ○ Hourly  ○ Daily  ○ Weekly  ○ Monthly  ○ Annual         |
|                                                           |
| Positions                                                 |
| [1  ] open positions                                      |
|                                                           |
| Priority                                                  |
| [Normal                                           ▼]      |
|                                                           |
| Target Fill Date                                          |
| [MM/DD/YYYY                                     📅]       |
|                                                           |
| Target Start Date                                         |
| [MM/DD/YYYY                                     📅]       |
|                                                           |
| Internal Notes                                            |
| [                                                      ]  |
|                                               ] 0/2000    |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Create Job ✓]         |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 15: Enter Bill Rate Range

**User Action:** Enter "95" in Min, "110" in Max

**System Response:**
- Numbers appear with $ prefix and /hr suffix
- System calculates typical margin if pay rate is known

**Field Specification: Rate Min**
| Property | Value |
|----------|-------|
| Field Name | `rateMin` |
| Type | Currency Input |
| Label | "Min" |
| Prefix | "$" |
| Suffix | Based on rate type ("/hr", "/day", etc.) |
| Required | Yes |
| Min Value | 0 |
| Precision | 2 decimal places |

**Field Specification: Rate Max**
| Property | Value |
|----------|-------|
| Field Name | `rateMax` |
| Type | Currency Input |
| Label | "Max" |
| Required | No |
| Validation | Must be ≥ Rate Min |

**Time:** ~5 seconds

---

### Step 16: Select Rate Type

**User Action:** Click "Hourly" radio button (usually default)

**System Response:**
- Radio button selected
- Rate display suffix updates accordingly

**Field Specification: Rate Type**
| Property | Value |
|----------|-------|
| Field Name | `rateType` |
| Type | Radio Button Group |
| Label | "Rate Type" |
| Default | "hourly" |
| Options | |
| - `hourly` | "Hourly" |
| - `daily` | "Daily" |
| - `weekly` | "Weekly" |
| - `monthly` | "Monthly" |
| - `annual` | "Annual" |

**Time:** ~1 second

---

### Step 17: Set Positions Count

**User Action:** Leave at default "1" or adjust

**Field Specification: Positions Count**
| Property | Value |
|----------|-------|
| Field Name | `positionsCount` |
| Type | Number Input |
| Label | "open positions" |
| Default | 1 |
| Min | 1 |
| Max | 100 |
| Required | Yes |

**Time:** ~1 second

---

### Step 18: Select Priority

**User Action:** Click dropdown, select "High"

**Field Specification: Priority**
| Property | Value |
|----------|-------|
| Field Name | `priority` |
| Type | Dropdown |
| Label | "Priority" |
| Default | "normal" |
| Options | |
| - `low` | "Low" 🟢 |
| - `normal` | "Normal" 🔵 |
| - `high` | "High" 🟡 |
| - `urgent` | "Urgent" 🟠 |
| - `critical` | "Critical" 🔴 |

**Time:** ~2 seconds

---

### Step 19: Set Target Fill Date

**User Action:** Click calendar icon, select date

**System Response:**
- Date picker opens
- User navigates to desired month
- Clicks on date
- Date picker closes
- Field shows formatted date

**Field Specification: Target Fill Date**
| Property | Value |
|----------|-------|
| Field Name | `targetFillDate` |
| Type | Date Picker |
| Label | "Target Fill Date" |
| Format | MM/DD/YYYY |
| Min Date | Today |
| Required | No |

**Time:** ~5 seconds

---

### Step 20: Set Target Start Date

**User Action:** Click calendar icon, select date

**Field Specification: Target Start Date**
| Property | Value |
|----------|-------|
| Field Name | `targetStartDate` |
| Type | Date Picker |
| Label | "Target Start Date" |
| Format | MM/DD/YYYY |
| Min Date | Today |
| Required | No |

**Time:** ~5 seconds

---

### Step 21: Add Internal Notes (Optional)

**User Action:** Type notes for internal team

**Field Specification: Internal Notes**
| Property | Value |
|----------|-------|
| Field Name | `internalNotes` (not in schema, may need to add) |
| Type | Textarea |
| Label | "Internal Notes" |
| Placeholder | "Notes visible only to internal team..." |
| Required | No |
| Max Length | 2000 characters |
| Visibility | Internal only (not sent to client) |

**Time:** ~30 seconds

---

### Step 22: Click "Create Job"

**User Action:** Click "Create Job ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. Form validates all fields
3. If valid: API call `POST /api/trpc/jobs.create`
4. On success:
   - Modal closes (300ms animation)
   - Toast notification: "Job created successfully" (green)
   - Jobs list refreshes
   - New job appears at top of list (highlighted for 3 seconds)
   - URL changes to: `/employee/workspace/jobs/{new-job-id}`
   - Job detail view opens automatically
5. On error:
   - Modal stays open
   - Error toast: "Failed to create job: {error message}"
   - Problematic fields highlighted

**Time:** ~2 seconds

---

## Postconditions

1. ✅ New job record created in `jobs` table
2. ✅ Job status set to "draft" (or "open" based on settings)
3. ✅ User assigned as owner (`ownerId = current_user`)
4. ✅ RCAI entry created: User = Responsible + Accountable
5. ✅ Manager (if assigned) = Informed
6. ✅ Activity logged: "job.created"
7. ✅ User redirected to new job detail page

---

## Events Logged

| Event | Payload |
|-------|---------|
| `job.created` | `{ job_id, title, account_id, owner_id, created_by, created_at }` |
| `rcai.assigned` | `{ entity_type: 'job', entity_id, user_id, role: 'accountable' }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Required field empty | "Job title is required" | Fill in required field |
| Account Not Found | Selected account deleted | "Selected account no longer exists" | Select different account |
| Duplicate Job | Same title + account exists | "A job with this title already exists for this client" | Change title or use existing job |
| Permission Denied | User lacks create permission | "You don't have permission to create jobs" | Contact Admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Rate Limit | Too many requests | "Please wait before creating another job" | Wait 30 seconds |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Esc` | Close modal (with confirmation if changes made) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form (when on button) |
| `Cmd+Enter` | Submit form (from any field) |

---

## Alternative Flows

### A1: Create Account During Job Creation

At Step 4, if user clicks "+ New" button:

1. Modal slides to show "Quick Add Account" form
2. User enters: Account Name, Industry, Website
3. User clicks "Create Account"
4. Account created
5. Modal slides back to job form
6. New account auto-selected in dropdown

### A2: Import Job from Email

1. User clicks "Import from Email" button (if available)
2. Paste email content
3. System parses job details using AI
4. Form pre-fills with extracted data
5. User reviews and adjusts
6. Continue from Step 8

### A3: Clone Existing Job

1. User opens existing job
2. Clicks "Clone" action
3. New job form opens with all fields pre-filled
4. User adjusts title (adds "- Copy")
5. User modifies as needed
6. Continue from Step 22

---

## Related Use Cases

- [E01-source-candidates.md](./E01-source-candidates.md) - After creating job
- [F01-submit-candidate.md](./F01-submit-candidate.md) - Once candidates sourced
- [D05-update-job-status.md](./D05-update-job-status.md) - Manage job lifecycle

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create job with all required fields | Job created successfully |
| TC-002 | Submit with empty title | Error: "Job title is required" |
| TC-003 | Submit without account | Error: "Please select a client account" |
| TC-004 | Rate Max < Rate Min | Error: "Max rate must be greater than min" |
| TC-005 | Create duplicate job | Error: "Job already exists" |
| TC-006 | Cancel mid-creation | Confirmation prompt, then close |
| TC-007 | Network error during submit | Retry button appears |
| TC-008 | Create with all optional fields | All data saved correctly |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/jobs.ts`
**Procedure:** `jobs.create`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const createJobInput = z.object({
  title: z.string().min(3).max(200),
  accountId: z.string().uuid(),
  jobType: z.enum(['contract', 'permanent', 'contract_to_hire', 'temp', 'sow']),
  location: z.string().max(200).optional(),
  isRemote: z.boolean().default(false),
  hybridDays: z.number().int().min(1).max(5).optional(),
  requiredSkills: z.array(z.string()).min(1).max(20),
  niceToHaveSkills: z.array(z.string()).max(20).optional(),
  minExperienceYears: z.number().int().min(0).max(50).optional(),
  maxExperienceYears: z.number().int().min(0).max(50).optional(),
  visaRequirements: z.array(z.enum([
    'us_citizen', 'green_card', 'h1b', 'l1', 'opt', 'tn', 'any'
  ])).optional(),
  description: z.string().max(5000).optional(),
  rateMin: z.number().positive().multipleOf(0.01),
  rateMax: z.number().positive().multipleOf(0.01).optional(),
  rateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']),
  positionsCount: z.number().int().min(1).max(100).default(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical']).default('normal'),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  targetFillDate: z.date().optional(),
  targetStartDate: z.date().optional(),
  internalNotes: z.string().max(2000).optional(),
  dealId: z.string().uuid().optional(),
});

export type CreateJobInput = z.infer<typeof createJobInput>;
```

### Output Schema

```typescript
export const createJobOutput = z.object({
  jobId: z.string().uuid(),
  title: z.string(),
  status: z.literal('draft'),
  createdAt: z.string().datetime(),
});

export type CreateJobOutput = z.infer<typeof createJobOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)

   ```typescript
   // Check permissions
   const hasPermission = ctx.user.permissions.includes('job.create');
   if (!hasPermission) throw new TRPCError({ code: 'FORBIDDEN' });

   // Validate rate range
   if (input.rateMax && input.rateMax < input.rateMin) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Max rate must be greater than min rate'
     });
   }

   // Validate experience range
   if (input.maxExperienceYears && input.minExperienceYears &&
       input.maxExperienceYears < input.minExperienceYears) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Max experience must be greater than min'
     });
   }
   ```

2. **Check Duplicate** (~50ms)

   ```sql
   SELECT id FROM jobs
   WHERE org_id = $1
     AND account_id = $2
     AND LOWER(title) = LOWER($3)
     AND status != 'cancelled';
   ```

3. **Create Job Record** (~100ms)

   ```sql
   INSERT INTO jobs (
     id, org_id, account_id, title, job_type,
     location, is_remote, hybrid_days,
     required_skills, nice_to_have_skills,
     min_experience_years, max_experience_years,
     visa_requirements, description,
     rate_min, rate_max, rate_type,
     positions_count, priority, urgency,
     target_fill_date, target_start_date,
     internal_notes, deal_id,
     status, owner_id, created_by, created_at, updated_at
   ) VALUES (
     gen_random_uuid(), $1, $2, $3, $4,
     $5, $6, $7,
     $8::text[], $9::text[],
     $10, $11,
     $12::text[], $13,
     $14, $15, $16,
     $17, $18, $19,
     $20, $21,
     $22, $23,
     'draft', $24, $24, NOW(), NOW()
   ) RETURNING id;
   ```

4. **Create RCAI Assignment** (~50ms)

   ```sql
   INSERT INTO entity_assignments (
     id, org_id, entity_type, entity_id,
     user_id, role, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'job', $2,
     $3, 'responsible', NOW()
   );
   ```

5. **Log Activity** (~50ms)

   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description, created_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'job', $2,
     'created', 'Job created', $3, NOW()
   );
   ```

---

## Database Schema Reference

### Table: jobs

**File:** `src/lib/db/schema/ats.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | Auto-generated |
| `org_id` | UUID | FK → organizations.id, NOT NULL | Multi-tenant |
| `account_id` | UUID | FK → accounts.id, NOT NULL | Client company |
| `deal_id` | UUID | FK → deals.id | Optional CRM deal linkage |
| `title` | VARCHAR(200) | NOT NULL | Job title |
| `description` | TEXT | | Full job description (max 5000) |
| `job_type` | ENUM | NOT NULL | 'contract', 'permanent', 'contract_to_hire', 'temp', 'sow' |
| `location` | VARCHAR(200) | | Work location |
| `is_remote` | BOOLEAN | DEFAULT false | Remote position flag |
| `hybrid_days` | INT | | Days per week in office (1-5) |
| `required_skills` | TEXT[] | NOT NULL | Array of required skills |
| `nice_to_have_skills` | TEXT[] | | Array of preferred skills |
| `min_experience_years` | INT | | Minimum years experience |
| `max_experience_years` | INT | | Maximum years experience |
| `visa_requirements` | TEXT[] | | Acceptable visa statuses |
| `rate_min` | DECIMAL(10,2) | NOT NULL | Minimum bill rate |
| `rate_max` | DECIMAL(10,2) | | Maximum bill rate |
| `rate_type` | ENUM | NOT NULL | 'hourly', 'daily', 'weekly', 'monthly', 'annual' |
| `positions_count` | INT | DEFAULT 1 | Number of positions to fill |
| `priority` | ENUM | DEFAULT 'normal' | 'low', 'normal', 'high', 'urgent', 'critical' |
| `urgency` | ENUM | DEFAULT 'medium' | 'low', 'medium', 'high', 'urgent' |
| `target_fill_date` | DATE | | Target date to fill position |
| `target_start_date` | DATE | | Target candidate start date |
| `internal_notes` | TEXT | | Internal notes (max 2000, not visible to clients) |
| `status` | ENUM | DEFAULT 'draft' | See status enum below |
| `owner_id` | UUID | FK → user_profiles.id | Primary owner (Responsible) |
| `created_by` | UUID | FK → user_profiles.id | Who created the job |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Status Enum Values:**
- `draft` - Initial creation, not yet published
- `open` - Actively seeking candidates
- `on_hold` - Temporarily paused
- `filled` - All positions filled
- `cancelled` - No longer needed

**Indexes:**

```sql
CREATE INDEX idx_jobs_org_status ON jobs(org_id, status);
CREATE INDEX idx_jobs_account ON jobs(account_id);
CREATE INDEX idx_jobs_owner ON jobs(owner_id);
CREATE INDEX idx_jobs_deal ON jobs(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_jobs_skills ON jobs USING gin(required_skills);
```

### Field Clarifications

**urgency vs priority:**
- `priority` - Used for UI display (color-coded badges, sorting)
- `urgency` - Used for SLA calculations and automated escalations

**Rate Type Usage:**
- `hourly` - Most common for contract positions ($/hr)
- `daily` - Day rate contracts
- `weekly` - Rare, some government contracts
- `monthly` - Retainer-based positions
- `annual` - Permanent/salaried positions

**Internal Notes:**
- Only visible to internal team members
- Not included in client-facing exports
- Used for competitive intelligence, rate negotiation notes, etc.

**Deal Linkage:**
- Optional connection to CRM deals table
- Used for tracking revenue attribution
- Enables deal-to-placement revenue tracking

---

*Last Updated: 2024-11-30*





