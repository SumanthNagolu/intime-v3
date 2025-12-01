# Use Case: Prospect New Client

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-012 |
| Actor | Recruiter (BDM Role) |
| Goal | Identify and initiate contact with potential new clients |
| Frequency | Daily (ongoing prospecting) |
| Estimated Time | 15-20 minutes per prospect |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "lead.create" permission
3. User has LinkedIn Recruiter or Sales Navigator access (optional but recommended)
4. User has access to prospecting tools/databases

---

## Trigger

One of the following:
- Daily prospecting block scheduled (typically 4:00-4:30 PM)
- Referral received from existing client or colleague
- Networking event attendance
- LinkedIn connection request or message
- Industry event or conference
- Manager assigns territory or vertical

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Leads

**User Action:** Click "Leads" in the sidebar navigation under BUSINESS DEVELOPMENT

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/leads`
- Leads list screen loads
- Loading skeleton shows for 200-500ms
- Leads list populates with user's leads

**Screen State:**
```
+----------------------------------------------------------+
| Leads                             [+ New Lead] [⚙] [Cmd+K] |
+----------------------------------------------------------+
| [Search leads...]                   [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| ● New │ ○ Contacted │ ○ Qualified │ ○ All                 |
+----------------------------------------------------------+
| Status  Company              Contact      Source     Age   |
| ─────────────────────────────────────────────────────────|
| 🟢 New  Acme Corp            Sarah Jones  LinkedIn   1d    |
| 🔵 Cont TechStart Inc        Mike Brown   Referral   3d    |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "New Lead" Button

**User Action:** Click the "+ New Lead" button in top-right corner

**System Response:**
- Button shows click state (darker background)
- Modal slides in from right (300ms animation)
- Modal title: "Create New Lead"
- First field (Company Name) is focused
- Keyboard cursor blinks in Company Name field

**Screen State:**
```
+----------------------------------------------------------+
|                                           Create New Lead  |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 1 of 2: Company Information                          |
|                                                           |
| Company Name *                                            |
| [                                              ] 0/200    |
|                                                           |
| Industry                                                  |
| [Technology                                    ▼]         |
|                                                           |
| Website                                                   |
| [https://                                      ]          |
|                                                           |
| Company Size                                              |
| [Select...                                     ▼]         |
|                                                           |
| Location                                                  |
| [City, State                                   ]          |
|                                                           |
| Lead Source *                                             |
| [LinkedIn                                      ▼]         |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Contact Info →]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Enter Company Name

**User Action:** Type company name, e.g., "Stripe Inc"

**System Response:**
- Characters appear in input field
- Character counter updates: "11/200"
- System searches for existing accounts with same name
- If match found: Shows warning "This company may already exist as an account"
- Autocomplete suggestions appear (LinkedIn company search if integrated)

**Field Specification: Company Name**
| Property | Value |
|----------|-------|
| Field Name | `companyName` |
| Type | Text Input with Autocomplete |
| Label | "Company Name" |
| Placeholder | "e.g., Stripe Inc" |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 2 characters |
| Validation | Not empty, checks for duplicates |
| Autocomplete | LinkedIn company search (if integrated) |
| Error Messages | |
| - Empty | "Company name is required" |
| - Duplicate warning | "This company may already exist. Check Accounts first." |

**Time:** ~10 seconds

---

### Step 4: Select Industry

**User Action:** Click Industry dropdown, select from list

**System Response:**
- Dropdown opens with industry list
- User scrolls or types to filter
- Selection appears in field

**Field Specification: Industry**
| Property | Value |
|----------|-------|
| Field Name | `industry` |
| Type | Searchable Dropdown |
| Label | "Industry" |
| Required | No (but recommended) |
| Options | Standard industry list (Technology, Healthcare, Finance, Manufacturing, etc.) |
| Allow Custom | Yes |

**Time:** ~5 seconds

---

### Step 5: Enter Website

**User Action:** Type company website URL

**System Response:**
- URL validation (must be valid format)
- Auto-prepends "https://" if missing
- On blur: System may auto-fetch company info (logo, LinkedIn page, etc.)

**Field Specification: Website**
| Property | Value |
|----------|-------|
| Field Name | `website` |
| Type | URL Input |
| Label | "Website" |
| Placeholder | "https://company.com" |
| Required | No |
| Validation | Valid URL format |
| Auto-enrichment | Fetch logo, LinkedIn company page on blur |

**Time:** ~5 seconds

---

### Step 6: Select Company Size

**User Action:** Click dropdown, select size range

**Field Specification: Company Size**
| Property | Value |
|----------|-------|
| Field Name | `companySize` |
| Type | Dropdown |
| Label | "Company Size" |
| Required | No |
| Options | |
| - `1-10` | "1-10 employees" |
| - `11-50` | "11-50 employees" |
| - `51-200` | "51-200 employees" |
| - `201-500` | "201-500 employees" |
| - `501-1000` | "501-1000 employees" |
| - `1001-5000` | "1001-5000 employees" |
| - `5001+` | "5001+ employees" |

**Time:** ~3 seconds

---

### Step 7: Enter Location

**User Action:** Type location (city, state)

**Field Specification: Location**
| Property | Value |
|----------|-------|
| Field Name | `location` |
| Type | Text Input |
| Label | "Location" |
| Placeholder | "e.g., San Francisco, CA" |
| Required | No |
| Autocomplete | Google Places API (optional) |

**Time:** ~5 seconds

---

### Step 8: Select Lead Source

**User Action:** Click dropdown, select source

**System Response:**
- Dropdown opens
- Shows most common sources
- User selects one

**Field Specification: Lead Source**
| Property | Value |
|----------|-------|
| Field Name | `leadSource` |
| Type | Dropdown |
| Label | "Lead Source" |
| Required | Yes |
| Options | |
| - `linkedin` | "LinkedIn" |
| - `referral` | "Referral" |
| - `cold_call` | "Cold Call" |
| - `email` | "Cold Email" |
| - `networking` | "Networking Event" |
| - `conference` | "Conference" |
| - `inbound` | "Inbound Inquiry" |
| - `website` | "Website" |
| - `partner` | "Partner" |
| - `other` | "Other" |

**Time:** ~3 seconds

---

### Step 9: Click "Next" to Contact Info

**User Action:** Click "Next: Contact Info →" button

**System Response:**
- Form validates Step 1 fields
- If valid: Animation slides to Step 2
- If invalid: Shows error messages, focus on first error

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                                           Create New Lead  |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 2 of 2: Contact Information                          |
|                                                           |
| Contact Name *                                            |
| [First Name              ] [Last Name              ]      |
|                                                           |
| Title                                                     |
| [e.g., VP of Engineering                       ]          |
|                                                           |
| Email                                                     |
| [email@company.com                             ]          |
|                                                           |
| Phone                                                     |
| [(555) 555-5555                                ]          |
|                                                           |
| LinkedIn Profile                                          |
| [https://linkedin.com/in/                      ]          |
|                                                           |
| Lead Status                                               |
| [New                                           ▼]         |
|                                                           |
| Notes                                                     |
| [                                              ]          |
| [                                              ] 0/1000   |
|                                                           |
| □ Schedule follow-up task (Date: [___] Time: [___])      |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Create Lead ✓]        |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 10: Enter Contact Name

**User Action:** Type first and last name

**Field Specification: Contact First Name**
| Property | Value |
|----------|-------|
| Field Name | `contactFirstName` |
| Type | Text Input |
| Label | "First Name" |
| Required | Yes |
| Max Length | 100 |

**Field Specification: Contact Last Name**
| Property | Value |
|----------|-------|
| Field Name | `contactLastName` |
| Type | Text Input |
| Label | "Last Name" |
| Required | Yes |
| Max Length | 100 |

**Time:** ~5 seconds

---

### Step 11: Enter Contact Title

**User Action:** Type job title

**Field Specification: Contact Title**
| Property | Value |
|----------|-------|
| Field Name | `contactTitle` |
| Type | Text Input |
| Label | "Title" |
| Placeholder | "e.g., VP of Engineering" |
| Required | No |
| Max Length | 200 |
| Autocomplete | Common titles (VP Engineering, CTO, Hiring Manager, etc.) |

**Time:** ~5 seconds

---

### Step 12: Enter Email

**User Action:** Type email address

**System Response:**
- Email format validation
- Checks against existing contacts
- If duplicate: Shows warning

**Field Specification: Email**
| Property | Value |
|----------|-------|
| Field Name | `contactEmail` |
| Type | Email Input |
| Label | "Email" |
| Placeholder | "email@company.com" |
| Required | No (but one of email or phone required) |
| Validation | Valid email format |
| Duplicate Check | Warns if email exists in contacts |

**Time:** ~5 seconds

---

### Step 13: Enter Phone

**User Action:** Type phone number

**System Response:**
- Auto-formats phone number as user types
- Example: "5551234567" → "(555) 123-4567"

**Field Specification: Phone**
| Property | Value |
|----------|-------|
| Field Name | `contactPhone` |
| Type | Phone Input |
| Label | "Phone" |
| Placeholder | "(555) 555-5555" |
| Required | No (but one of email or phone required) |
| Validation | Valid phone format |
| Auto-format | US phone format |

**Time:** ~5 seconds

---

### Step 14: Enter LinkedIn Profile (Optional)

**User Action:** Paste LinkedIn profile URL

**Field Specification: LinkedIn Profile**
| Property | Value |
|----------|-------|
| Field Name | `contactLinkedIn` |
| Type | URL Input |
| Label | "LinkedIn Profile" |
| Placeholder | "https://linkedin.com/in/username" |
| Required | No |
| Validation | Valid LinkedIn URL |

**Time:** ~3 seconds

---

### Step 15: Set Lead Status

**User Action:** Leave at default "New" or select different status

**Field Specification: Lead Status**
| Property | Value |
|----------|-------|
| Field Name | `leadStatus` |
| Type | Dropdown |
| Label | "Lead Status" |
| Default | "new" |
| Options | |
| - `new` | "New" |
| - `contacted` | "Contacted" |
| - `qualified` | "Qualified" |
| - `unqualified` | "Unqualified" |
| - `nurture` | "Nurture" |

**Time:** ~2 seconds

---

### Step 16: Add Notes

**User Action:** Type notes about the lead

**Field Specification: Notes**
| Property | Value |
|----------|-------|
| Field Name | `notes` |
| Type | Textarea |
| Label | "Notes" |
| Placeholder | "Where you met, mutual connections, specific needs mentioned..." |
| Required | No |
| Max Length | 1000 characters |

**Time:** ~30 seconds

---

### Step 17: Schedule Follow-up (Optional)

**User Action:** Check "Schedule follow-up task" checkbox, enter date/time

**System Response:**
- Date picker and time picker appear
- User selects date and time
- Task will be created automatically when lead is created

**Field Specification: Follow-up Date**
| Property | Value |
|----------|-------|
| Field Name | `followUpDate` |
| Type | Date Picker |
| Min Date | Today |

**Field Specification: Follow-up Time**
| Property | Value |
|----------|-------|
| Field Name | `followUpTime` |
| Type | Time Picker |
| Default | 9:00 AM |

**Time:** ~10 seconds

---

### Step 18: Click "Create Lead"

**User Action:** Click "Create Lead ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. Form validates all fields
3. If valid: API call `POST /api/trpc/leads.create`
4. On success:
   - Modal closes (300ms animation)
   - Toast notification: "Lead created successfully" (green)
   - Leads list refreshes
   - New lead appears at top of list (highlighted for 3 seconds)
   - If follow-up scheduled: Task created and appears in Today View
   - Lead detail page opens in background (optional)
5. On error:
   - Modal stays open
   - Error toast: "Failed to create lead: {error message}"
   - Problematic fields highlighted

**Time:** ~2 seconds

---

## Postconditions

1. ✅ New lead record created in `leads` table
2. ✅ Contact record created in `contacts` table
3. ✅ Lead status set to selected value (default "new")
4. ✅ User assigned as owner (`ownerId = current_user`)
5. ✅ RCAI entry created: User = Responsible + Accountable
6. ✅ Activity logged: "lead.created"
7. ✅ If follow-up scheduled: Task created with due date
8. ✅ Lead appears in user's lead list

---

## Events Logged

| Event | Payload |
|-------|---------|
| `lead.created` | `{ lead_id, company_name, contact_name, source, owner_id, created_at }` |
| `contact.created` | `{ contact_id, name, email, phone, linkedin, account_id }` |
| `rcai.assigned` | `{ entity_type: 'lead', entity_id, user_id, role: 'responsible' }` |
| `task.created` | `{ task_id, lead_id, due_date, type: 'follow_up' }` (if scheduled) |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Required field empty | "Company name is required" | Fill in required field |
| Duplicate Lead | Company + contact exists | "This lead may already exist. View existing lead?" | Review existing or create anyway |
| Duplicate Contact | Email exists in system | "Contact with this email already exists" | Link to existing contact or create new |
| Invalid Email | Bad email format | "Please enter a valid email address" | Correct email format |
| Invalid URL | Bad URL format | "Please enter a valid URL" | Correct URL format |
| Missing Contact Info | No email or phone | "Please provide email or phone number" | Add email or phone |
| Permission Denied | User lacks create permission | "You don't have permission to create leads" | Contact Admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |

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

### A1: Import Lead from LinkedIn

If LinkedIn integration enabled:

1. User has Chrome extension installed
2. User browses to LinkedIn company page or profile
3. User clicks "Import to InTime" extension button
4. Extension scrapes company and contact info
5. Modal opens pre-filled with data
6. User reviews and adjusts
7. Continue from Step 18

### A2: Create Lead from Referral

1. User receives referral email or message
2. User clicks "New Lead" from email (if integration exists)
3. Modal opens
4. Lead Source auto-set to "Referral"
5. User fills in company and contact info
6. User adds referrer name in notes
7. Continue from Step 18

### A3: Bulk Lead Import

1. User exports contacts from event or conference
2. User clicks "Import Leads" button on Leads list
3. Upload CSV file
4. Map CSV columns to InTime fields
5. Review and validate
6. Import all leads
7. Leads appear in list with "New" status

### A4: Convert Existing Contact to Lead

1. User searches Contacts
2. User opens contact detail
3. User clicks "Create Lead" action
4. Modal opens with contact info pre-filled
5. User adds company and source info
6. Continue from Step 9

---

## Related Use Cases

- [13-qualify-opportunity.md](./13-qualify-opportunity.md) - Next step after prospecting
- [14-create-account.md](./14-create-account.md) - If lead qualifies and becomes client
- [11-create-lead.md](./11-create-lead.md) - Legacy workflow
- [15-manage-client-relationship.md](./15-manage-client-relationship.md) - After conversion to account

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create lead with all required fields | Lead created successfully |
| TC-002 | Submit with empty company name | Error: "Company name is required" |
| TC-003 | Submit without contact name | Error: "Contact name is required" |
| TC-004 | Submit without email or phone | Error: "Please provide email or phone number" |
| TC-005 | Create duplicate lead (same company + contact) | Warning shown, can proceed |
| TC-006 | Invalid email format | Error: "Please enter a valid email address" |
| TC-007 | Schedule follow-up task | Task created with correct due date |
| TC-008 | Cancel mid-creation | Confirmation prompt, then close |
| TC-009 | Create lead with existing contact email | Warning shown, can link or create new |
| TC-010 | Create lead with LinkedIn integration | Data auto-filled from LinkedIn |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/leads.ts`
**Procedure:** `leads.create`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const createLeadInput = z.object({
  // Company info
  companyName: z.string().min(2).max(200),
  industry: z.string().max(100).optional(),
  website: z.string().url().optional(),
  companySize: z.enum([
    '1-10', '11-50', '51-200', '201-500',
    '501-1000', '1001-5000', '5001+'
  ]).optional(),
  location: z.string().max(200).optional(),
  leadSource: z.enum([
    'linkedin', 'referral', 'cold_call', 'email',
    'networking', 'conference', 'inbound', 'website',
    'partner', 'other'
  ]),

  // Contact info
  contactFirstName: z.string().min(1).max(100),
  contactLastName: z.string().min(1).max(100),
  contactTitle: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(50).optional(),
  contactLinkedIn: z.string().url().optional(),

  // Lead details
  leadStatus: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'nurture'])
    .default('new'),
  notes: z.string().max(1000).optional(),

  // Follow-up task
  scheduleFollowUp: z.boolean().default(false),
  followUpDate: z.date().optional(),
  followUpTime: z.string().optional(),
}).refine(
  (data) => data.contactEmail || data.contactPhone,
  {
    message: "Either email or phone is required",
    path: ["contactEmail"],
  }
);

export type CreateLeadInput = z.infer<typeof createLeadInput>;
```

### Output Schema

```typescript
export const createLeadOutput = z.object({
  leadId: z.string().uuid(),
  contactId: z.string().uuid(),
  companyName: z.string(),
  contactName: z.string(),
  leadStatus: z.string(),
  taskId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
});

export type CreateLeadOutput = z.infer<typeof createLeadOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)

   ```typescript
   // Check permissions
   const hasPermission = ctx.user.permissions.includes('lead.create');
   if (!hasPermission) throw new TRPCError({ code: 'FORBIDDEN' });

   // Validate at least one contact method
   if (!input.contactEmail && !input.contactPhone) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Either email or phone is required'
     });
   }
   ```

2. **Check for Duplicate Lead** (~50ms)

   ```sql
   SELECT l.id, c.email
   FROM leads l
   JOIN contacts c ON l.contact_id = c.id
   WHERE l.org_id = $1
     AND LOWER(l.company_name) = LOWER($2)
     AND LOWER(c.email) = LOWER($3)
     AND l.status != 'converted';
   ```

3. **Check for Existing Contact** (~50ms)

   ```sql
   SELECT id, email FROM contacts
   WHERE org_id = $1
     AND (LOWER(email) = LOWER($2) OR phone = $3)
   LIMIT 1;
   ```

4. **Create Contact Record** (~100ms)

   ```sql
   INSERT INTO contacts (
     id, org_id, first_name, last_name, title,
     email, phone, linkedin_url,
     created_by, created_at, updated_at
   ) VALUES (
     gen_random_uuid(), $1, $2, $3, $4,
     $5, $6, $7,
     $8, NOW(), NOW()
   ) RETURNING id;
   ```

5. **Create Lead Record** (~100ms)

   ```sql
   INSERT INTO leads (
     id, org_id, contact_id, company_name, industry,
     website, company_size, location, lead_source,
     lead_status, notes, owner_id,
     created_by, created_at, updated_at
   ) VALUES (
     gen_random_uuid(), $1, $2, $3, $4,
     $5, $6, $7, $8,
     $9, $10, $11,
     $11, NOW(), NOW()
   ) RETURNING id;
   ```

6. **Create RCAI Assignment** (~50ms)

   ```sql
   INSERT INTO entity_assignments (
     id, org_id, entity_type, entity_id,
     user_id, role, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'lead', $2,
     $3, 'responsible', NOW()
   );
   ```

7. **Log Activity** (~50ms)

   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description, created_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'lead', $2,
     'created', 'Lead created', $3, NOW()
   );
   ```

8. **Create Follow-up Task** (Optional, ~50ms)

   ```sql
   INSERT INTO tasks (
     id, org_id, entity_type, entity_id,
     title, description, due_date, assigned_to,
     status, created_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 'lead', $2,
     'Follow up with ' || $3, 'Initial outreach', $4, $5,
     'pending', $5, NOW()
   ) RETURNING id;
   ```

---

## Database Schema Reference

### Table: leads

**File:** `src/lib/db/schema/crm.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | Auto-generated |
| `org_id` | UUID | FK → organizations.id, NOT NULL | Multi-tenant |
| `contact_id` | UUID | FK → contacts.id, NOT NULL | Primary contact |
| `company_name` | VARCHAR(200) | NOT NULL | Prospect company name |
| `industry` | VARCHAR(100) | | Industry vertical |
| `website` | VARCHAR(500) | | Company website |
| `company_size` | ENUM | | Employee count range |
| `location` | VARCHAR(200) | | City, State |
| `lead_source` | ENUM | NOT NULL | How lead was acquired |
| `lead_status` | ENUM | DEFAULT 'new' | Current lead status |
| `notes` | TEXT | | General notes about lead |
| `owner_id` | UUID | FK → user_profiles.id | Lead owner (Responsible) |
| `qualified_at` | TIMESTAMP | | When lead was qualified |
| `converted_at` | TIMESTAMP | | When converted to account |
| `converted_to_account_id` | UUID | FK → accounts.id | If converted |
| `created_by` | UUID | FK → user_profiles.id | Who created |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Lead Source Enum:**
- `linkedin` - LinkedIn outreach
- `referral` - Referral from existing contact
- `cold_call` - Cold calling
- `email` - Cold email
- `networking` - Networking event
- `conference` - Conference/trade show
- `inbound` - Inbound inquiry
- `website` - Website form
- `partner` - Partner referral
- `other` - Other source

**Lead Status Enum:**
- `new` - Just created, not yet contacted
- `contacted` - Initial contact made
- `qualified` - Meets criteria, active opportunity
- `unqualified` - Does not meet criteria
- `nurture` - Not ready now, keep warm
- `converted` - Converted to account/deal

**Company Size Enum:**
- `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5001+`

**Indexes:**

```sql
CREATE INDEX idx_leads_org_status ON leads(org_id, lead_status);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_contact ON leads(contact_id);
CREATE INDEX idx_leads_company ON leads(company_name);
CREATE INDEX idx_leads_source ON leads(lead_source);
```

### Table: contacts

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `org_id` | UUID | FK, NOT NULL | |
| `account_id` | UUID | FK → accounts.id | If associated with account |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `title` | VARCHAR(200) | | Job title |
| `email` | VARCHAR(255) | | Email address |
| `phone` | VARCHAR(50) | | Phone number |
| `linkedin_url` | VARCHAR(500) | | LinkedIn profile |
| `created_by` | UUID | FK | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Indexes:**

```sql
CREATE INDEX idx_contacts_org ON contacts(org_id);
CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE UNIQUE INDEX idx_contacts_email ON contacts(org_id, email) WHERE email IS NOT NULL;
```

---

*Last Updated: 2025-11-30*
