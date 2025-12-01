# Use Case: Create Account

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-014 |
| Actor | Recruiter (BDM/AM Role) |
| Goal | Create a new client account in the system after qualification |
| Frequency | 1-2 times per month |
| Estimated Time | 10-15 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "account.create" permission
3. Lead has been qualified (optional but recommended)
4. MSA process initiated or completed (optional)

---

## Trigger

One of the following:
- Qualified lead converts to deal
- Client agrees to work with company
- MSA signed with new client
- Manual account creation needed
- Import from CRM or other system

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Accounts

**User Action:** Click "Accounts" in the sidebar navigation under BUSINESS DEVELOPMENT

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/accounts`
- Accounts list screen loads
- Loading skeleton shows for 200-500ms
- Accounts list populates

**Screen State:**
```
+----------------------------------------------------------+
| Accounts                        [+ New Account] [⚙] [Cmd+K] |
+----------------------------------------------------------+
| [Search accounts...]                [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| ● Active │ ○ Prospect │ ○ Inactive │ ○ All                |
+----------------------------------------------------------+
| Status  Company           Industry      Owner      Jobs    |
| ─────────────────────────────────────────────────────────|
| 🟢 Act  Google            Technology    You        8       |
| 🟢 Act  Meta              Technology    You        5       |
| 🔵 Pros TechStart         Technology    Sarah      0       |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "New Account" Button

**User Action:** Click the "+ New Account" button in top-right corner

**System Response:**
- Button shows click state
- Modal slides in from right (300ms animation)
- Modal title: "Create New Account"
- First field (Company Name) is focused
- Option to "Import from Lead" shown at top if leads exist

**Screen State:**
```
+----------------------------------------------------------+
|                                       Create New Account  |
|                                                      [×]  |
+----------------------------------------------------------+
| 💡 Import from Lead? [Select lead...           ▼] [Load] |
+----------------------------------------------------------+
| Step 1 of 3: Company Information                          |
|                                                           |
| Company Name *                                            |
| [                                              ] 0/200    |
|                                                           |
| Legal Name                                                |
| [Same as company name                          ]          |
|                                                           |
| Industry *                                                |
| [Technology                                    ▼]         |
|                                                           |
| Website                                                   |
| [https://                                      ]          |
|                                                           |
| Company Size                                              |
| [51-200 employees                              ▼]         |
|                                                           |
| Headquarters Location *                                   |
| [City, State, Country                          ]          |
|                                                           |
| Account Type *                                            |
| [Direct Client                                 ▼]         |
|                                                           |
| Parent Account                                            |
| [Search for parent company...                  ]          |
|                                                           |
| Tax ID / EIN                                              |
| [__-_______                                    ]          |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Contacts →]    |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: (Optional) Import from Lead

**User Action:** Click "Import from Lead" dropdown, select lead

**System Response:**
- Dropdown shows qualified leads
- User selects lead
- User clicks "Load"
- Form fields auto-populate from lead data
- Lead relationship linked to account

**Time:** ~5 seconds

---

### Step 4: Enter Company Name

**User Action:** Type company name, e.g., "Stripe Inc"

**System Response:**
- Characters appear in input
- Character counter updates
- System searches for duplicate accounts
- If found: Warning "An account with similar name exists. View it?"
- Autocomplete suggestions from external sources (LinkedIn, Clearbit, etc.)

**Field Specification: Company Name**
| Property | Value |
|----------|-------|
| Field Name | `name` |
| Type | Text Input with Autocomplete |
| Label | "Company Name" |
| Placeholder | "e.g., Stripe Inc" |
| Required | Yes |
| Max Length | 200 characters |
| Validation | Not empty, check duplicates |
| Autocomplete | LinkedIn Company Search, Clearbit |
| Error Messages | |
| - Empty | "Company name is required" |
| - Duplicate | "Account may already exist. Check before creating." |

**Time:** ~10 seconds

---

### Step 5: Enter Legal Name

**User Action:** Enter legal entity name (if different from company name)

**System Response:**
- Default: "Same as company name"
- User can override

**Field Specification: Legal Name**
| Property | Value |
|----------|-------|
| Field Name | `legalName` |
| Type | Text Input |
| Label | "Legal Name" |
| Placeholder | "Official legal entity name" |
| Required | No |
| Max Length | 200 |
| Default | Same as `name` |

**Time:** ~5 seconds

---

### Step 6: Select Industry

**User Action:** Click dropdown, select or search industry

**Field Specification: Industry**
| Property | Value |
|----------|-------|
| Field Name | `industry` |
| Type | Searchable Dropdown |
| Label | "Industry" |
| Required | Yes |
| Options | Technology, Healthcare, Finance, Manufacturing, Retail, etc. |
| Allow Custom | Yes |

**Time:** ~5 seconds

---

### Step 7: Enter Website

**User Action:** Type company website

**System Response:**
- URL validation
- Auto-prepends "https://"
- On blur: Fetch company logo, metadata (if integration exists)

**Field Specification: Website**
| Property | Value |
|----------|-------|
| Field Name | `website` |
| Type | URL Input |
| Label | "Website" |
| Placeholder | "https://company.com" |
| Required | No (but recommended) |
| Validation | Valid URL format |
| Auto-enrichment | Fetch logo, metadata |

**Time:** ~5 seconds

---

### Step 8: Select Company Size

**User Action:** Click dropdown, select size range

**Field Specification: Company Size**
| Property | Value |
|----------|-------|
| Field Name | `companySize` |
| Type | Dropdown |
| Label | "Company Size" |
| Required | No |
| Options | 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001+ |

**Time:** ~3 seconds

---

### Step 9: Enter Headquarters Location

**User Action:** Type location

**Field Specification: Headquarters Location**
| Property | Value |
|----------|-------|
| Field Name | `location` |
| Type | Text Input |
| Label | "Headquarters Location" |
| Placeholder | "City, State, Country" |
| Required | Yes |
| Autocomplete | Google Places API |

**Time:** ~5 seconds

---

### Step 10: Select Account Type

**User Action:** Click dropdown, select type

**Field Specification: Account Type**
| Property | Value |
|----------|-------|
| Field Name | `accountType` |
| Type | Dropdown |
| Label | "Account Type" |
| Required | Yes |
| Default | "direct_client" |
| Options | |
| - `direct_client` | "Direct Client" (We bill them directly) |
| - `vendor` | "Vendor" (We supply to them, they bill end client) |
| - `partner` | "Partner" (Co-selling relationship) |
| - `end_client` | "End Client" (Final customer in vendor relationship) |

**Time:** ~5 seconds

---

### Step 11: Select Parent Account (Optional)

**User Action:** If subsidiary, search for parent account

**Field Specification: Parent Account**
| Property | Value |
|----------|-------|
| Field Name | `parentAccountId` |
| Type | Searchable Dropdown |
| Label | "Parent Account" |
| Required | No |
| Data Source | Existing accounts |
| Use Case | For subsidiaries, divisions |

**Time:** ~5 seconds (if applicable)

---

### Step 12: Enter Tax ID/EIN (Optional)

**User Action:** Enter Tax ID or EIN

**Field Specification: Tax ID**
| Property | Value |
|----------|-------|
| Field Name | `taxId` |
| Type | Text Input (Masked) |
| Label | "Tax ID / EIN" |
| Placeholder | "XX-XXXXXXX" |
| Required | No (required for invoicing later) |
| Format | US EIN format |
| Validation | Valid EIN format |

**Time:** ~5 seconds

---

### Step 13: Click "Next" to Contacts

**User Action:** Click "Next: Contacts →" button

**System Response:**
- Form validates Step 1
- If valid: Slides to Step 2
- If invalid: Shows errors

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                                       Create New Account  |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 2 of 3: Primary Contact & Billing                    |
|                                                           |
| PRIMARY CONTACT *                                         |
| First Name              Last Name                         |
| [                    ]  [                    ]            |
|                                                           |
| Title                                                     |
| [e.g., VP of Engineering                       ]          |
|                                                           |
| Email *                                                   |
| [email@company.com                             ]          |
|                                                           |
| Phone                                                     |
| [(555) 555-5555                                ]          |
|                                                           |
| LinkedIn                                                  |
| [https://linkedin.com/in/                      ]          |
|                                                           |
| BILLING CONTACT (if different)                            |
| □ Same as primary contact                                 |
|                                                           |
| First Name              Last Name                         |
| [                    ]  [                    ]            |
|                                                           |
| Email                                                     |
| [billing@company.com                           ]          |
|                                                           |
| PAYMENT TERMS                                             |
| Standard Terms                                            |
| [Net 30                                        ▼]         |
|                                                           |
| Billing Address                                           |
| [Street Address                                ]          |
| [City              ] [State  ] [ZIP      ]               |
|                                                           |
+----------------------------------------------------------+
|           [← Back]  [Cancel]  [Next: Additional Info →]  |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 14: Add Primary Contact

**User Action:** Enter primary contact information

**Field Specification: Contact First Name**
| Property | Value |
|----------|-------|
| Field Name | `primaryContactFirstName` |
| Type | Text Input |
| Required | Yes |
| Max Length | 100 |

**Field Specification: Contact Last Name**
| Property | Value |
|----------|-------|
| Field Name | `primaryContactLastName` |
| Type | Text Input |
| Required | Yes |
| Max Length | 100 |

**Field Specification: Contact Email**
| Property | Value |
|----------|-------|
| Field Name | `primaryContactEmail` |
| Type | Email Input |
| Required | Yes |
| Validation | Valid email format |

**Time:** ~20 seconds

---

### Step 15: Add Billing Contact (Optional)

**User Action:** If billing contact different, uncheck "Same as primary" and fill

**Time:** ~20 seconds (if different)

---

### Step 16: Set Payment Terms

**User Action:** Select payment terms

**Field Specification: Payment Terms**
| Property | Value |
|----------|-------|
| Field Name | `paymentTerms` |
| Type | Dropdown |
| Label | "Standard Terms" |
| Default | "net_30" |
| Options | Net 15, Net 30, Net 45, Net 60, Due on Receipt |

**Time:** ~3 seconds

---

### Step 17: Add Billing Address

**User Action:** Enter billing address

**Time:** ~20 seconds

---

### Step 18: Click "Next" to Additional Info

**User Action:** Click "Next: Additional Info →"

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                                       Create New Account  |
|                                                      [×]  |
+----------------------------------------------------------+
| Step 3 of 3: Additional Information                       |
|                                                           |
| ACCOUNT STATUS                                            |
| ○ Active (Ready to accept jobs)                           |
| ○ Prospect (Not yet client, qualified lead)               |
| ○ On Hold (Temporary pause)                               |
|                                                           |
| MSA STATUS                                                |
| ○ MSA Signed                                              |
| ○ MSA In Progress                                         |
| ○ MSA Not Required                                        |
| ○ No MSA Yet                                              |
|                                                           |
| MSA Signed Date                                           |
| [MM/DD/YYYY                                     📅]       |
|                                                           |
| Credit Limit                                              |
| [$          ]                                             |
|                                                           |
| Preferred Markup                                          |
| [   ]%  (Default: Company standard)                       |
|                                                           |
| Account Manager (Owner)                                   |
| [You (John Smith)                              ▼]         |
|                                                           |
| Tags                                                      |
| [+ Add tag] [VIP] [×] [Fortune 500] [×]                  |
|                                                           |
| Internal Notes                                            |
| [                                              ]          |
| [                                              ] 0/2000   |
|                                                           |
| □ Create first job now                                    |
| □ Schedule onboarding call                                |
|                                                           |
+----------------------------------------------------------+
|           [← Back]  [Cancel]  [Create Account ✓]         |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 19: Set Account Status

**User Action:** Select account status

**Field Specification: Account Status**
| Property | Value |
|----------|-------|
| Field Name | `status` |
| Type | Radio Button Group |
| Default | "prospect" |
| Options | |
| - `active` | "Active" (Can create jobs immediately) |
| - `prospect` | "Prospect" (Qualified but not yet client) |
| - `on_hold` | "On Hold" (Temporary pause) |

**Time:** ~3 seconds

---

### Step 20: Set MSA Status

**User Action:** Select MSA status and date

**Field Specification: MSA Status**
| Property | Value |
|----------|-------|
| Field Name | `msaStatus` |
| Type | Radio Button Group |
| Options | MSA Signed, MSA In Progress, MSA Not Required, No MSA Yet |

**Field Specification: MSA Signed Date**
| Property | Value |
|----------|-------|
| Field Name | `msaSignedDate` |
| Type | Date Picker |
| Visible | If MSA Status = "MSA Signed" |

**Time:** ~10 seconds

---

### Step 21: Set Credit Limit (Optional)

**User Action:** Enter credit limit if applicable

**Field Specification: Credit Limit**
| Property | Value |
|----------|-------|
| Field Name | `creditLimit` |
| Type | Currency Input |
| Required | No |
| Use Case | Max outstanding invoices |

**Time:** ~5 seconds

---

### Step 22: Set Preferred Markup (Optional)

**User Action:** Enter custom markup percentage

**Field Specification: Preferred Markup**
| Property | Value |
|----------|-------|
| Field Name | `preferredMarkup` |
| Type | Number Input (Percentage) |
| Default | Company standard (e.g., 35%) |
| Min | 0 |
| Max | 100 |

**Time:** ~5 seconds

---

### Step 23: Assign Account Manager

**User Action:** Select account owner (defaults to current user)

**Field Specification: Account Owner**
| Property | Value |
|----------|-------|
| Field Name | `ownerId` |
| Type | User Dropdown |
| Default | Current user |
| Options | All recruiters in org |

**Time:** ~3 seconds

---

### Step 24: Add Tags (Optional)

**User Action:** Add tags for categorization

**Field Specification: Tags**
| Property | Value |
|----------|-------|
| Field Name | `tags` |
| Type | Tag Input |
| Examples | VIP, Fortune 500, Startup, Enterprise, etc. |

**Time:** ~10 seconds

---

### Step 25: Add Internal Notes

**User Action:** Add notes for internal team

**Field Specification: Internal Notes**
| Property | Value |
|----------|-------|
| Field Name | `internalNotes` |
| Type | Textarea |
| Max Length | 2000 |
| Visibility | Internal only |

**Time:** ~30 seconds

---

### Step 26: Click "Create Account"

**User Action:** Click "Create Account ✓" button

**System Response:**
1. Button shows loading state
2. Form validates all steps
3. API call `POST /api/trpc/accounts.create`
4. On success:
   - Modal closes
   - Toast: "Account created successfully"
   - Account list refreshes
   - New account appears at top (highlighted)
   - If "Create first job" checked: Job creation modal opens
   - If "Schedule onboarding" checked: Calendar event modal opens
   - Redirect to account detail page
5. On error:
   - Error toast shown
   - Modal stays open

**Time:** ~2 seconds

---

## Postconditions

1. ✅ New account record created in `accounts` table
2. ✅ Primary contact created in `contacts` table
3. ✅ Billing contact created (if different)
4. ✅ Account status set as selected
5. ✅ User assigned as account owner/manager
6. ✅ RCAI entry: User = Responsible + Accountable
7. ✅ Activity logged: "account.created"
8. ✅ If from lead: Lead status = "converted", linked to account
9. ✅ Account appears in user's account list

---

## Events Logged

| Event | Payload |
|-------|---------|
| `account.created` | `{ account_id, name, industry, status, owner_id, lead_id, created_at }` |
| `contact.created` | `{ contact_id, account_id, name, email, type: 'primary' }` |
| `lead.converted` | `{ lead_id, account_id, converted_by, converted_at }` (if from lead) |
| `rcai.assigned` | `{ entity_type: 'account', entity_id, user_id, role: 'responsible' }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Required field empty | "Company name is required" | Fill required fields |
| Duplicate Account | Same name exists | "Account with this name already exists" | Review existing or use different name |
| Invalid Email | Bad email format | "Please enter valid email address" | Correct email |
| Invalid EIN | Bad EIN format | "Please enter valid EIN format" | Correct EIN |
| Permission Denied | User lacks permission | "You don't have permission to create accounts" | Contact Admin |
| Network Error | API failed | "Network error. Please try again." | Retry |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close modal (with confirmation) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd+Enter` | Submit form |

---

## Alternative Flows

### A1: Import from Lead (Automatic)

When creating deal from qualified lead:
1. Deal creation includes "Create account" option
2. If selected: Account creation pre-filled from lead
3. User reviews and adjusts
4. Account created and linked to deal

### A2: Quick Account Creation

From job creation flow:
1. User creating job needs to select account
2. Clicks "+ New Account" in dropdown
3. Quick modal with essential fields only:
   - Company Name
   - Industry
   - Primary Contact
4. Full account details can be completed later

---

## Related Use Cases

- [13-qualify-opportunity.md](./13-qualify-opportunity.md) - Previous step
- [02-create-job.md](./02-create-job.md) - Next step
- [15-manage-client-relationship.md](./15-manage-client-relationship.md) - Ongoing
- [16-conduct-client-meeting.md](./16-conduct-client-meeting.md) - Ongoing

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create account with all required fields | Account created successfully |
| TC-002 | Create account from qualified lead | Account linked to lead, lead status = converted |
| TC-003 | Submit without company name | Error: "Company name is required" |
| TC-004 | Submit without primary contact email | Error: "Email is required" |
| TC-005 | Create duplicate account name | Warning shown |
| TC-006 | Invalid email format | Error: "Please enter valid email" |
| TC-007 | Set MSA Signed without date | Error: "Please enter MSA signed date" |
| TC-008 | Create with "Create first job" checked | Job modal opens after account created |
| TC-009 | Create with parent account | Hierarchy established |
| TC-010 | Import from lead auto-fills data | All lead data transferred correctly |

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/accounts.ts`
**Procedure:** `accounts.create`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const createAccountInput = z.object({
  // Company info
  name: z.string().min(2).max(200),
  legalName: z.string().max(200).optional(),
  industry: z.string().max(100),
  website: z.string().url().optional(),
  companySize: z.enum([
    '1-10', '11-50', '51-200', '201-500',
    '501-1000', '1001-5000', '5001+'
  ]).optional(),
  location: z.string().max(200),
  accountType: z.enum(['direct_client', 'vendor', 'partner', 'end_client']),
  parentAccountId: z.string().uuid().optional(),
  taxId: z.string().max(50).optional(),

  // Primary contact
  primaryContactFirstName: z.string().min(1).max(100),
  primaryContactLastName: z.string().min(1).max(100),
  primaryContactTitle: z.string().max(200).optional(),
  primaryContactEmail: z.string().email(),
  primaryContactPhone: z.string().max(50).optional(),
  primaryContactLinkedIn: z.string().url().optional(),

  // Billing contact
  billingContactSameAsPrimary: z.boolean().default(true),
  billingContactFirstName: z.string().max(100).optional(),
  billingContactLastName: z.string().max(100).optional(),
  billingContactEmail: z.string().email().optional(),
  billingContactPhone: z.string().max(50).optional(),

  // Payment & billing
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt'])
    .default('net_30'),
  billingAddress: z.object({
    street: z.string().max(200),
    city: z.string().max(100),
    state: z.string().max(50),
    zip: z.string().max(20),
    country: z.string().max(100).default('USA'),
  }).optional(),

  // Account details
  status: z.enum(['active', 'prospect', 'on_hold', 'inactive']).default('prospect'),
  msaStatus: z.enum(['signed', 'in_progress', 'not_required', 'no_msa']).optional(),
  msaSignedDate: z.date().optional(),
  creditLimit: z.number().positive().optional(),
  preferredMarkup: z.number().min(0).max(100).optional(),
  ownerId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  internalNotes: z.string().max(2000).optional(),

  // Optional actions
  createFirstJob: z.boolean().default(false),
  scheduleOnboarding: z.boolean().default(false),

  // Lead linkage
  leadId: z.string().uuid().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountInput>;
```

### Output Schema

```typescript
export const createAccountOutput = z.object({
  accountId: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  primaryContactId: z.string().uuid(),
  billingContactId: z.string().uuid().optional(),
  leadConverted: z.boolean(),
  createdAt: z.string().datetime(),
});
```

### Processing Steps

1. **Validate & Check Duplicates** (~100ms)
2. **Create Account Record** (~100ms)
3. **Create Primary Contact** (~100ms)
4. **Create Billing Contact** (~100ms, if different)
5. **Update Lead** (~50ms, if from lead)
6. **Create RCAI** (~50ms)
7. **Log Activity** (~50ms)

---

## Database Schema Reference

### Table: accounts

**File:** `src/lib/db/schema/crm.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `org_id` | UUID | FK, NOT NULL | |
| `name` | VARCHAR(200) | NOT NULL | Company name |
| `legal_name` | VARCHAR(200) | | Legal entity name |
| `industry` | VARCHAR(100) | | |
| `website` | VARCHAR(500) | | |
| `company_size` | ENUM | | |
| `location` | VARCHAR(200) | | HQ location |
| `account_type` | ENUM | NOT NULL | |
| `parent_account_id` | UUID | FK → accounts.id | |
| `tax_id` | VARCHAR(50) | | EIN |
| `status` | ENUM | DEFAULT 'prospect' | |
| `msa_status` | ENUM | | |
| `msa_signed_date` | DATE | | |
| `credit_limit` | DECIMAL(12,2) | | |
| `preferred_markup` | DECIMAL(5,2) | | Percentage |
| `payment_terms` | ENUM | DEFAULT 'net_30' | |
| `billing_address` | JSONB | | |
| `tags` | TEXT[] | | |
| `internal_notes` | TEXT | | |
| `owner_id` | UUID | FK → user_profiles.id | |
| `lead_id` | UUID | FK → leads.id | If converted from lead |
| `created_by` | UUID | FK | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

*Last Updated: 2025-11-30*
