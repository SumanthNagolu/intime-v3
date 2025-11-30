# Job Orders Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `job_orders` |
| Schema | `public` |
| Purpose | Store confirmed client orders (vs jobs which are requisitions) |
| Primary Owner | Recruiter/Account Manager |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |
| Order Number Format | `JO-2024-0001` (auto-generated) |

---

## Table Definition

```sql
CREATE TABLE job_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Order Identification
  order_number TEXT UNIQUE,

  -- Source (where this order came from)
  source_type TEXT NOT NULL DEFAULT 'direct',
  source_job_id UUID REFERENCES jobs(id),
  source_external_job_id UUID REFERENCES external_jobs(id),

  -- Client Association (REQUIRED)
  account_id UUID NOT NULL REFERENCES accounts(id),
  client_contact_id UUID REFERENCES contacts(id),

  -- Order Details
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  responsibilities TEXT,

  -- Job Classification
  job_type TEXT DEFAULT 'contract',
  employment_type TEXT DEFAULT 'w2',

  -- Team/Department
  hiring_manager_name TEXT,
  hiring_manager_email TEXT,
  department TEXT,

  -- Location
  location TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  zip_code TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  remote_type TEXT,
  hybrid_days INTEGER,

  -- Rates & Financials
  bill_rate NUMERIC(10,2) NOT NULL,
  bill_rate_max NUMERIC(10,2),
  pay_rate_min NUMERIC(10,2),
  pay_rate_max NUMERIC(10,2),
  markup_percentage NUMERIC(5,2),
  currency TEXT DEFAULT 'USD',
  rate_type TEXT DEFAULT 'hourly',

  -- Overtime
  overtime_bill_rate NUMERIC(10,2),
  overtime_pay_rate NUMERIC(10,2),
  overtime_expected BOOLEAN DEFAULT FALSE,

  -- Fee Structure (for perm placements)
  placement_fee_percentage NUMERIC(5,2),
  placement_fee_flat NUMERIC(10,2),
  guarantee_period_days INTEGER,

  -- Positions
  positions_count INTEGER NOT NULL DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,

  -- Timing
  start_date DATE,
  end_date DATE,
  duration_months INTEGER,
  extension_possible BOOLEAN DEFAULT TRUE,
  start_date_flexibility TEXT,

  -- Priority & Status
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',

  -- Qualification Requirements
  required_skills TEXT[],
  nice_to_have_skills TEXT[],
  min_experience_years INTEGER,
  max_experience_years INTEGER,
  education_requirement TEXT,
  certifications_required TEXT[],

  -- Work Authorization
  visa_requirements TEXT[],
  citizenship_required BOOLEAN DEFAULT FALSE,
  security_clearance_required TEXT,

  -- Background/Drug
  background_check_required BOOLEAN DEFAULT TRUE,
  drug_screen_required BOOLEAN DEFAULT FALSE,

  -- Interview Process
  interview_process TEXT,
  interview_rounds INTEGER,
  technical_assessment_required BOOLEAN DEFAULT FALSE,

  -- Submission Requirements
  submission_instructions TEXT,
  submission_format TEXT,
  max_submissions INTEGER,
  current_submissions INTEGER DEFAULT 0,

  -- Notes
  internal_notes TEXT,
  client_notes TEXT,

  -- VMS/MSP Information
  vms_job_id TEXT,
  vms_name TEXT,
  msp_name TEXT,
  vendor_tier TEXT,

  -- RCAI Primary Owner
  accountable_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Dates
  received_date TIMESTAMPTZ DEFAULT NOW(),
  target_fill_date DATE,
  filled_date DATE,
  closed_date DATE,
  closed_reason TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search
  search_vector TSVECTOR
);
```

---

## Field Specifications

### id
| Property | Value |
|----------|-------|
| Column Name | `id` |
| Type | `UUID` |
| Required | Yes (auto-generated) |
| Default | `gen_random_uuid()` |
| Primary Key | Yes |
| Description | Unique identifier for the job order |
| UI Display | Hidden (used in URLs) |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this job order belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### order_number
| Property | Value |
|----------|-------|
| Column Name | `order_number` |
| Type | `TEXT` |
| Required | Yes (auto-generated) |
| Unique | Yes |
| Format | `JO-YYYY-####` (e.g., `JO-2024-0001`) |
| Description | Human-readable order number |
| UI Label | "Order Number" |
| UI Type | Display only (auto-generated) |
| Generation | Via trigger on INSERT |
| Index | Yes (unique constraint) |
| Business Logic | Increments per year: JO-2024-0001, JO-2024-0002, etc. |

---

### source_type
| Property | Value |
|----------|-------|
| Column Name | `source_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'direct'` |
| Allowed Values | `requisition`, `external_job`, `direct` |
| Description | Where this order originated from |
| UI Label | "Source Type" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Description | Color |
|-------|---------------|-------------|-------|
| `requisition` | From Requisition | Converted from internal job requisition | `bg-blue-100 text-blue-700` |
| `external_job` | From External Job | Converted from external job board posting | `bg-purple-100 text-purple-700` |
| `direct` | Direct Order | Received directly from client | `bg-green-100 text-green-700` |

**Business Rules:**
- If `source_type = 'requisition'`, then `source_job_id` must be set
- If `source_type = 'external_job'`, then `source_external_job_id` must be set
- If `source_type = 'direct'`, both source IDs should be NULL

---

### source_job_id
| Property | Value |
|----------|-------|
| Column Name | `source_job_id` |
| Type | `UUID` |
| Required | Conditional (required if source_type = 'requisition') |
| Foreign Key | `jobs(id)` |
| Description | Source job requisition this order was converted from |
| UI Label | "Source Requisition" |
| UI Type | Searchable Dropdown |
| UI Visible | Only when source_type = 'requisition' |
| Index | Yes (`idx_job_orders_source_job_id`) |

---

### source_external_job_id
| Property | Value |
|----------|-------|
| Column Name | `source_external_job_id` |
| Type | `UUID` |
| Required | Conditional (required if source_type = 'external_job') |
| Foreign Key | `external_jobs(id)` |
| Description | Source external job this order was converted from |
| UI Label | "Source External Job" |
| UI Type | Searchable Dropdown |
| UI Visible | Only when source_type = 'external_job' |
| Index | Yes (`idx_job_orders_source_external_job_id`) |

---

### account_id
| Property | Value |
|----------|-------|
| Column Name | `account_id` |
| Type | `UUID` |
| Required | Yes (ALWAYS - job orders must have paying client) |
| Foreign Key | `accounts(id)` |
| Description | Client company paying for this order |
| UI Label | "Client Account" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Search client accounts..." |
| Validation | Must be active account in same org |
| Business Rule | Cannot be NULL - order must have confirmed client |
| Index | Yes (`idx_job_orders_account_id`) |

---

### client_contact_id
| Property | Value |
|----------|-------|
| Column Name | `client_contact_id` |
| Type | `UUID` |
| Required | No (recommended) |
| Foreign Key | `contacts(id)` |
| Description | Primary client contact/hiring manager for this order |
| UI Label | "Client Contact" |
| UI Type | Searchable Dropdown |
| UI Filter | Only contacts linked to selected account_id |
| Validation | Must belong to same account as account_id |
| Index | Yes (`idx_job_orders_client_contact_id`) |

---

### title
| Property | Value |
|----------|-------|
| Column Name | `title` |
| Type | `TEXT` |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 3 characters |
| Description | Job order title/position name |
| UI Label | "Position Title" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Senior Java Developer" |
| Validation | Not empty, no special chars except `- () /` |
| Error Message | "Position title is required" |
| Searchable | Yes (included in search_vector) |
| Index | Yes (part of search_vector GIN index) |

---

### description
| Property | Value |
|----------|-------|
| Column Name | `description` |
| Type | `TEXT` |
| Required | No (recommended) |
| Max Length | 10000 characters |
| Description | Full job description |
| UI Label | "Job Description" |
| UI Type | Rich Text Editor / Textarea |
| UI Placeholder | "Enter detailed job description..." |
| Searchable | Yes |
| Rich Text | Optional (bold, italic, lists) |

---

### requirements
| Property | Value |
|----------|-------|
| Column Name | `requirements` |
| Type | `TEXT` |
| Required | No |
| Max Length | 5000 characters |
| Description | Detailed requirements and qualifications |
| UI Label | "Requirements" |
| UI Type | Textarea / Rich Text |
| UI Placeholder | "List job requirements..." |
| Searchable | Yes |

---

### responsibilities
| Property | Value |
|----------|-------|
| Column Name | `responsibilities` |
| Type | `TEXT` |
| Required | No |
| Max Length | 5000 characters |
| Description | Day-to-day responsibilities |
| UI Label | "Responsibilities" |
| UI Type | Textarea / Rich Text |
| UI Placeholder | "List key responsibilities..." |
| Searchable | Yes |

---

### job_type
| Property | Value |
|----------|-------|
| Column Name | `job_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'contract'` |
| Allowed Values | `contract`, `permanent`, `contract_to_hire`, `temp`, `sow` |
| Description | Type of employment |
| UI Label | "Job Type" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Description | Color |
|-------|---------------|-------------|-------|
| `contract` | Contract | Temporary contract work | `bg-blue-100 text-blue-700` |
| `permanent` | Permanent (Direct Hire) | Full-time direct employment | `bg-green-100 text-green-700` |
| `contract_to_hire` | Contract to Hire | Contract with conversion option | `bg-purple-100 text-purple-700` |
| `temp` | Temporary | Short-term temporary work | `bg-amber-100 text-amber-700` |
| `sow` | Statement of Work | Project-based work | `bg-cyan-100 text-cyan-700` |

**Financial Implications:**
- `contract`, `temp`, `sow`: Use bill_rate, pay_rate, markup calculations
- `permanent`, `contract_to_hire`: May also use placement_fee_percentage/placement_fee_flat

---

### employment_type
| Property | Value |
|----------|-------|
| Column Name | `employment_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'w2'` |
| Allowed Values | `w2`, `1099`, `corp_to_corp`, `direct_hire` |
| Description | Tax/payment structure |
| UI Label | "Employment Type" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Description | Tax Implications |
|-------|---------------|-------------|------------------|
| `w2` | W2 Employee | Paid as employee with taxes withheld | Employer pays payroll taxes |
| `1099` | 1099 Contractor | Independent contractor (US only) | No tax withholding |
| `corp_to_corp` | Corp-to-Corp (C2C) | Contract through contractor's corporation | Pay to corporation |
| `direct_hire` | Direct Hire | Permanent employee of client | N/A (perm placement) |

**Business Rules:**
- W2: Company handles payroll, benefits, taxes
- 1099: Contractor handles own taxes (markup typically lower)
- C2C: Payment to contractor's LLC/Corp (markup varies)
- Direct Hire: One-time placement fee, no ongoing billing

---

### hiring_manager_name
| Property | Value |
|----------|-------|
| Column Name | `hiring_manager_name` |
| Type | `TEXT` |
| Required | No (recommended) |
| Max Length | 100 characters |
| Description | Name of client hiring manager |
| UI Label | "Hiring Manager" |
| UI Type | Text Input |
| UI Placeholder | "John Smith" |

---

### hiring_manager_email
| Property | Value |
|----------|-------|
| Column Name | `hiring_manager_email` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Validation | Valid email format |
| Description | Email of client hiring manager |
| UI Label | "Hiring Manager Email" |
| UI Type | Email Input |
| UI Placeholder | "john.smith@client.com" |

---

### department
| Property | Value |
|----------|-------|
| Column Name | `department` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Client department/team |
| UI Label | "Department" |
| UI Type | Text Input |
| UI Placeholder | "Engineering" |
| Common Values | Engineering, IT, Finance, Marketing, Sales, HR, Operations |

---

### location
| Property | Value |
|----------|-------|
| Column Name | `location` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Full work location description |
| UI Label | "Location" |
| UI Type | Text Input (with autocomplete) |
| UI Placeholder | "e.g., San Francisco, CA" |
| Autocomplete | Google Places API (optional) |

---

### city
| Property | Value |
|----------|-------|
| Column Name | `city` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Work city |
| UI Label | "City" |
| UI Type | Text Input |
| UI Placeholder | "San Francisco" |

---

### state
| Property | Value |
|----------|-------|
| Column Name | `state` |
| Type | `TEXT` |
| Required | No |
| Max Length | 50 characters |
| Description | Work state/province |
| UI Label | "State" |
| UI Type | Dropdown (US states) or Text Input |
| UI Placeholder | "CA" |

---

### country
| Property | Value |
|----------|-------|
| Column Name | `country` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'USA'` |
| Max Length | 50 characters |
| Description | Work country |
| UI Label | "Country" |
| UI Type | Dropdown |
| Common Values | USA, Canada, UK, India |

---

### zip_code
| Property | Value |
|----------|-------|
| Column Name | `zip_code` |
| Type | `TEXT` |
| Required | No |
| Max Length | 10 characters |
| Description | Work location ZIP/postal code |
| UI Label | "ZIP Code" |
| UI Type | Text Input |
| UI Placeholder | "94105" |

---

### is_remote
| Property | Value |
|----------|-------|
| Column Name | `is_remote` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `FALSE` |
| Description | Whether position allows remote work |
| UI Label | "Remote Work" |
| UI Type | Checkbox |
| Related Field | If false but `remote_type = 'hybrid'`, shows as Hybrid |

---

### remote_type
| Property | Value |
|----------|-------|
| Column Name | `remote_type` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `fully_remote`, `hybrid`, `onsite` |
| Description | Type of work arrangement |
| UI Label | "Work Arrangement" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `fully_remote` | Fully Remote | 100% remote, no office requirement |
| `hybrid` | Hybrid | Mix of remote and in-office (see hybrid_days) |
| `onsite` | Onsite | Must be in office full-time |

---

### hybrid_days
| Property | Value |
|----------|-------|
| Column Name | `hybrid_days` |
| Type | `INTEGER` |
| Required | No (required if remote_type = 'hybrid') |
| Min | 1 |
| Max | 5 |
| Description | Days per week required in office (for hybrid roles) |
| UI Label | "Days in office per week" |
| UI Type | Number Input |
| UI Visible | Only when remote_type = 'hybrid' |
| UI Placeholder | "3" |

---

### bill_rate
| Property | Value |
|----------|-------|
| Column Name | `bill_rate` |
| Type | `NUMERIC(10,2)` |
| Required | Yes (core financial field) |
| Min | 0.01 |
| Max | 999999.99 |
| Precision | 2 decimal places |
| Description | Rate charged to client (minimum or fixed rate) |
| UI Label | "Bill Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" (or currency symbol) |
| UI Suffix | Based on rate_type (e.g., "/hr") |
| Validation | Must be positive number |
| Error Message | "Bill rate is required and must be positive" |

**Business Rules:**
- This is the rate CHARGED TO THE CLIENT
- For hourly: rate per hour
- For annual: annual salary / 2080 hours (for comparison)
- Must be >= pay_rate_max for margin to be positive

---

### bill_rate_max
| Property | Value |
|----------|-------|
| Column Name | `bill_rate_max` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | bill_rate value |
| Max | 999999.99 |
| Precision | 2 decimal places |
| Description | Maximum bill rate (for rate ranges) |
| UI Label | "Max Bill Rate" |
| UI Type | Currency Input |
| Validation | Must be >= bill_rate |
| Error Message | "Max bill rate must be greater than or equal to bill rate" |

---

### pay_rate_min
| Property | Value |
|----------|-------|
| Column Name | `pay_rate_min` |
| Type | `NUMERIC(10,2)` |
| Required | No (recommended for margin calculations) |
| Min | 0.01 |
| Max | bill_rate value |
| Precision | 2 decimal places |
| Description | Minimum pay rate for contractor/employee |
| UI Label | "Min Pay Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | Based on rate_type |
| Validation | Must be <= bill_rate for positive margin |
| Warning | If pay_rate_min > bill_rate, show "Negative margin!" |

**Business Rules:**
- This is the rate PAID TO THE CONTRACTOR/EMPLOYEE
- Difference between bill_rate and pay_rate_max = gross profit
- Markup % = (bill_rate - pay_rate) / pay_rate * 100

---

### pay_rate_max
| Property | Value |
|----------|-------|
| Column Name | `pay_rate_max` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | pay_rate_min value |
| Max | bill_rate_max value |
| Precision | 2 decimal places |
| Description | Maximum pay rate for contractor/employee |
| UI Label | "Max Pay Rate" |
| UI Type | Currency Input |
| Validation | Must be >= pay_rate_min and <= bill_rate_max |

---

### markup_percentage
| Property | Value |
|----------|-------|
| Column Name | `markup_percentage` |
| Type | `NUMERIC(5,2)` |
| Required | No (can be calculated) |
| Min | 0 |
| Max | 999.99 |
| Precision | 2 decimal places |
| Description | Markup percentage (calculated or entered) |
| UI Label | "Markup %" |
| UI Type | Percentage Input |
| UI Suffix | "%" |
| Calculation | `(bill_rate - pay_rate_max) / pay_rate_max * 100` |
| Display | Auto-calculated if bill_rate and pay_rate_max exist |

**Business Rules:**
- Standard markups: 30-40% for W2, 20-30% for 1099, 15-25% for C2C
- Formula: Markup % = (Bill Rate - Pay Rate) / Pay Rate × 100
- Example: Bill $100/hr, Pay $75/hr → Markup = 33.33%

---

### currency
| Property | Value |
|----------|-------|
| Column Name | `currency` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'USD'` |
| Allowed Values | ISO 4217 currency codes |
| Description | Currency for all rates in this order |
| UI Label | "Currency" |
| UI Type | Dropdown |
| Common Values | `USD`, `CAD`, `GBP`, `EUR`, `INR` |

---

### rate_type
| Property | Value |
|----------|-------|
| Column Name | `rate_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'hourly'` |
| Allowed Values | `hourly`, `daily`, `weekly`, `monthly`, `annual` |
| Description | Rate period for billing and payment |
| UI Label | "Rate Type" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Rate Suffix | Typical Use Case |
|-------|---------------|-------------|------------------|
| `hourly` | Hourly | /hr | Most contract roles |
| `daily` | Daily | /day | European contracts |
| `weekly` | Weekly | /week | Short-term contracts |
| `monthly` | Monthly | /month | International contracts |
| `annual` | Annual | /year | Permanent placements |

---

### overtime_bill_rate
| Property | Value |
|----------|-------|
| Column Name | `overtime_bill_rate` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | bill_rate value |
| Precision | 2 decimal places |
| Description | Rate charged to client for overtime hours |
| UI Label | "OT Bill Rate" |
| UI Type | Currency Input |
| Default Calculation | bill_rate × 1.5 (time and a half) |
| UI Visible | When overtime_expected = true |

---

### overtime_pay_rate
| Property | Value |
|----------|-------|
| Column Name | `overtime_pay_rate` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | pay_rate_max value |
| Precision | 2 decimal places |
| Description | Rate paid to contractor for overtime hours |
| UI Label | "OT Pay Rate" |
| UI Type | Currency Input |
| Default Calculation | pay_rate_max × 1.5 (time and a half) |
| UI Visible | When overtime_expected = true |

---

### overtime_expected
| Property | Value |
|----------|-------|
| Column Name | `overtime_expected` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `FALSE` |
| Description | Whether overtime is expected for this role |
| UI Label | "Overtime Expected" |
| UI Type | Checkbox |
| UI Effect | Shows OT rate fields when checked |

---

### placement_fee_percentage
| Property | Value |
|----------|-------|
| Column Name | `placement_fee_percentage` |
| Type | `NUMERIC(5,2)` |
| Required | No (required for permanent placements) |
| Min | 0 |
| Max | 100 |
| Precision | 2 decimal places |
| Description | Percentage of annual salary charged as placement fee |
| UI Label | "Placement Fee %" |
| UI Type | Percentage Input |
| UI Suffix | "%" |
| UI Visible | When job_type = 'permanent' or 'contract_to_hire' |
| Typical Values | 15-25% of first year salary |

**Business Rules:**
- Standard fees: 15% (volume clients), 20% (standard), 25% (specialty/hard to fill)
- Calculated on candidate's annual salary
- Example: $100k salary × 20% fee = $20k placement fee
- Some agreements use tiered rates based on salary bands

---

### placement_fee_flat
| Property | Value |
|----------|-------|
| Column Name | `placement_fee_flat` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Flat fee charged for placement (alternative to percentage) |
| UI Label | "Flat Placement Fee" |
| UI Type | Currency Input |
| UI Visible | When job_type = 'permanent' or 'contract_to_hire' |
| Note | Use either fee_percentage OR fee_flat, not both |

---

### guarantee_period_days
| Property | Value |
|----------|-------|
| Column Name | `guarantee_period_days` |
| Type | `INTEGER` |
| Required | No (recommended for permanent) |
| Min | 0 |
| Max | 365 |
| Description | Guarantee period in days (refund if candidate leaves) |
| UI Label | "Guarantee Period" |
| UI Type | Number Input |
| UI Suffix | "days" |
| UI Visible | When job_type = 'permanent' |
| Typical Values | 30, 60, 90 days |

**Business Rules:**
- 30 days: 100% refund if candidate leaves/terminated
- 60 days: 50% refund for days 31-60
- 90 days: Prorated refund
- Guarantee applies to voluntary resignation or termination for cause

---

### positions_count
| Property | Value |
|----------|-------|
| Column Name | `positions_count` |
| Type | `INTEGER` |
| Required | Yes |
| Default | 1 |
| Min | 1 |
| Max | 100 |
| Description | Number of positions to fill under this order |
| UI Label | "Open Positions" |
| UI Type | Number Input |
| UI Placeholder | "1" |

---

### positions_filled
| Property | Value |
|----------|-------|
| Column Name | `positions_filled` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | positions_count |
| Description | Number of positions already filled |
| UI Label | "Filled Positions" |
| UI Type | Display only (auto-incremented) |
| Auto Update | Incremented when placement created with status 'active' |
| Business Rule | When positions_filled = positions_count, status → 'fulfilled' |

---

### start_date
| Property | Value |
|----------|-------|
| Column Name | `start_date` |
| Type | `DATE` |
| Required | No (recommended) |
| Min | Today or past (for historical orders) |
| Description | Expected/actual start date |
| UI Label | "Start Date" |
| UI Type | Date Picker |
| UI Placeholder | "Select start date" |

---

### end_date
| Property | Value |
|----------|-------|
| Column Name | `end_date` |
| Type | `DATE` |
| Required | No (required for contracts with end dates) |
| Min | start_date value |
| Description | Contract end date (for temp/contract roles) |
| UI Label | "End Date" |
| UI Type | Date Picker |
| UI Visible | When job_type = 'contract', 'temp', or 'sow' |
| Validation | Must be after start_date |

---

### duration_months
| Property | Value |
|----------|-------|
| Column Name | `duration_months` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 120 (10 years) |
| Description | Contract duration in months |
| UI Label | "Duration (months)" |
| UI Type | Number Input |
| UI Suffix | "months" |
| Auto Calculate | From end_date - start_date if both exist |

---

### extension_possible
| Property | Value |
|----------|-------|
| Column Name | `extension_possible` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `TRUE` |
| Description | Whether contract can be extended |
| UI Label | "Extension Possible" |
| UI Type | Checkbox |
| UI Visible | When job_type = 'contract' or 'temp' |

---

### start_date_flexibility
| Property | Value |
|----------|-------|
| Column Name | `start_date_flexibility` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Flexibility around start date |
| UI Label | "Start Date Flexibility" |
| UI Type | Text Input or Dropdown |
| Example Values | "ASAP", "Within 2 weeks", "1-2 months", "Flexible" |

---

### priority
| Property | Value |
|----------|-------|
| Column Name | `priority` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'normal'` |
| Allowed Values | `low`, `normal`, `high`, `urgent`, `critical` |
| Description | Order priority level |
| UI Label | "Priority" |
| UI Type | Dropdown |
| Index | Yes (`idx_job_orders_priority`) |

**Enum Values:**
| Value | Display Label | Color | SLA (Time to Submit) | Description |
|-------|---------------|-------|---------------------|-------------|
| `low` | Low | `bg-stone-100 text-stone-600` | 10 days | Low priority, backlog |
| `normal` | Normal | `bg-blue-100 text-blue-600` | 5 days | Standard priority |
| `high` | High | `bg-amber-100 text-amber-700` | 3 days | High priority |
| `urgent` | Urgent | `bg-orange-100 text-orange-700` | 24 hours | Urgent need |
| `critical` | Critical | `bg-red-100 text-red-700` | Same day | Critical business need |

**Business Rules:**
- Priority affects queue position and SLA
- Critical/Urgent orders may trigger notifications
- SLA tracked from received_date

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'pending'` |
| Allowed Values | `pending`, `active`, `on_hold`, `fulfilled`, `cancelled`, `expired` |
| Description | Current order status |
| UI Label | "Status" |
| UI Type | Dropdown / Status Badge |
| Index | Yes (`idx_job_orders_status`) |

**Enum Values:**
| Value | Display Label | Color | Description | Next States |
|-------|---------------|-------|-------------|-------------|
| `pending` | Pending | `bg-amber-100 text-amber-700` | Received but not yet activated | active, cancelled |
| `active` | Active | `bg-green-100 text-green-700` | Actively recruiting | on_hold, fulfilled, cancelled |
| `on_hold` | On Hold | `bg-blue-100 text-blue-600` | Temporarily paused | active, cancelled |
| `fulfilled` | Fulfilled | `bg-purple-100 text-purple-700` | All positions filled | (terminal) |
| `cancelled` | Cancelled | `bg-red-100 text-red-700` | Order cancelled by client | (terminal) |
| `expired` | Expired | `bg-stone-100 text-stone-500` | Order expired (past end date) | (terminal) |

**State Transitions:**
```
pending → active (when work begins)
active → on_hold (client requests pause)
on_hold → active (work resumes)
active → fulfilled (positions_filled = positions_count)
* → cancelled (client cancels)
active → expired (end_date passed, unfilled)
```

**Auto-Transitions:**
- `active` → `fulfilled`: When positions_filled reaches positions_count
- `active` → `expired`: Nightly job checks if end_date < today and positions_filled < positions_count

---

### required_skills
| Property | Value |
|----------|-------|
| Column Name | `required_skills` |
| Type | `TEXT[]` (Array) |
| Required | Yes (at least 1) |
| Max Items | 30 |
| Description | Skills candidate must have |
| UI Label | "Required Skills" |
| UI Type | Tag Input with autocomplete |
| Autocomplete Source | `skills` table |
| Allow Custom | Yes (creates new skill) |
| Searchable | Yes (array search) |

**Common Skills by Role:**
- Software: Java, Python, React, AWS, Docker, Kubernetes
- Data: SQL, Python, Tableau, Spark, Machine Learning
- Infrastructure: Linux, AWS, Terraform, Ansible, Kubernetes

---

### nice_to_have_skills
| Property | Value |
|----------|-------|
| Column Name | `nice_to_have_skills` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 30 |
| Description | Preferred but not required skills |
| UI Label | "Nice-to-Have Skills" |
| UI Type | Tag Input with autocomplete |

---

### min_experience_years
| Property | Value |
|----------|-------|
| Column Name | `min_experience_years` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 50 |
| Description | Minimum years of relevant experience required |
| UI Label | "Min Experience" |
| UI Type | Number Input |
| UI Suffix | "years" |

---

### max_experience_years
| Property | Value |
|----------|-------|
| Column Name | `max_experience_years` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 50 |
| Validation | Must be >= min_experience_years |
| Description | Maximum years of experience (prevents overqualification) |
| UI Label | "Max Experience" |
| UI Type | Number Input |
| UI Suffix | "years" |

---

### education_requirement
| Property | Value |
|----------|-------|
| Column Name | `education_requirement` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Required education level/degree |
| UI Label | "Education Requirement" |
| UI Type | Dropdown or Text Input |
| Common Values | "Bachelor's", "Master's", "PhD", "Associate's", "High School", "Not Required" |

---

### certifications_required
| Property | Value |
|----------|-------|
| Column Name | `certifications_required` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 20 |
| Description | Required certifications |
| UI Label | "Required Certifications" |
| UI Type | Tag Input |
| Common Values | AWS Certified, PMP, CISSP, CPA, CFA, Security+, CCIE |

---

### visa_requirements
| Property | Value |
|----------|-------|
| Column Name | `visa_requirements` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Description | Allowed work authorization types |
| UI Label | "Work Authorization" |
| UI Type | Multi-select Dropdown |

**Allowed Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `us_citizen` | US Citizen | US citizenship required |
| `green_card` | Green Card | Permanent resident |
| `h1b` | H1B | H1B visa holders |
| `l1` | L1 | L1 visa holders |
| `opt` | OPT/CPT | Student work permits |
| `tn` | TN Visa | Canadian/Mexican professionals |
| `gc_ead` | GC EAD | Green card with EAD |
| `any` | Any | No work auth restrictions |

**Business Rules:**
- Empty array = No restrictions (equivalent to 'any')
- Some clients require only US Citizen/Green Card (government, defense)
- H1B positions may require additional client approval

---

### citizenship_required
| Property | Value |
|----------|-------|
| Column Name | `citizenship_required` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `FALSE` |
| Description | Whether US citizenship is required |
| UI Label | "US Citizenship Required" |
| UI Type | Checkbox |
| Business Rule | If true, visa_requirements should contain only 'us_citizen' |

---

### security_clearance_required
| Property | Value |
|----------|-------|
| Column Name | `security_clearance_required` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | NULL, `confidential`, `secret`, `top_secret`, `ts_sci` |
| Description | Required security clearance level |
| UI Label | "Security Clearance" |
| UI Type | Dropdown |

**Clearance Levels:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| NULL | None | No clearance required |
| `confidential` | Confidential | Basic clearance |
| `secret` | Secret | Standard government clearance |
| `top_secret` | Top Secret | High-level clearance |
| `ts_sci` | TS/SCI | Top Secret with special access |

---

### background_check_required
| Property | Value |
|----------|-------|
| Column Name | `background_check_required` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `TRUE` |
| Description | Whether background check is required |
| UI Label | "Background Check Required" |
| UI Type | Checkbox |

---

### drug_screen_required
| Property | Value |
|----------|-------|
| Column Name | `drug_screen_required` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `FALSE` |
| Description | Whether drug screening is required |
| UI Label | "Drug Screen Required" |
| UI Type | Checkbox |

---

### interview_process
| Property | Value |
|----------|-------|
| Column Name | `interview_process` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 characters |
| Description | Description of client's interview process |
| UI Label | "Interview Process" |
| UI Type | Textarea |
| UI Placeholder | "e.g., 1) Phone screen, 2) Technical interview, 3) Manager interview" |

---

### interview_rounds
| Property | Value |
|----------|-------|
| Column Name | `interview_rounds` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 10 |
| Description | Number of interview rounds |
| UI Label | "Interview Rounds" |
| UI Type | Number Input |
| Typical Values | 1-4 rounds |

---

### technical_assessment_required
| Property | Value |
|----------|-------|
| Column Name | `technical_assessment_required` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `FALSE` |
| Description | Whether technical coding/assessment is required |
| UI Label | "Technical Assessment Required" |
| UI Type | Checkbox |

---

### submission_instructions
| Property | Value |
|----------|-------|
| Column Name | `submission_instructions` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 characters |
| Description | Client's specific submission requirements |
| UI Label | "Submission Instructions" |
| UI Type | Textarea |
| UI Section | Submission Details (advanced) |
| Example | "Submit resumes in Word format with rate expectations and availability" |

---

### submission_format
| Property | Value |
|----------|-------|
| Column Name | `submission_format` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Allowed Values | `word`, `pdf`, `email`, `vms_portal`, `both` |
| Description | Required submission format |
| UI Label | "Submission Format" |
| UI Type | Dropdown |

---

### max_submissions
| Property | Value |
|----------|-------|
| Column Name | `max_submissions` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 100 |
| Description | Maximum number of candidates that can be submitted |
| UI Label | "Max Submissions" |
| UI Type | Number Input |
| Business Rule | Prevent new submissions when current_submissions >= max_submissions |

---

### current_submissions
| Property | Value |
|----------|-------|
| Column Name | `current_submissions` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | max_submissions |
| Description | Current number of active submissions |
| UI Label | "Current Submissions" |
| UI Type | Display only (auto-incremented) |
| Auto Update | Incremented when submission created |
| Display | Show as "X / Y" where Y = max_submissions |

---

### internal_notes
| Property | Value |
|----------|-------|
| Column Name | `internal_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 5000 characters |
| Description | Internal notes (not shared with client) |
| UI Label | "Internal Notes" |
| UI Type | Textarea |
| UI Section | Internal (collapsed by default) |
| Security | Never exposed to client portal |

---

### client_notes
| Property | Value |
|----------|-------|
| Column Name | `client_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 5000 characters |
| Description | Notes from client about the order |
| UI Label | "Client Notes" |
| UI Type | Textarea |
| UI Section | Client Details |

---

### vms_job_id
| Property | Value |
|----------|-------|
| Column Name | `vms_job_id` |
| Type | `TEXT` |
| Required | No (required for VMS orders) |
| Max Length | 100 characters |
| Description | Job ID in Vendor Management System |
| UI Label | "VMS Job ID" |
| UI Type | Text Input |
| UI Visible | When vms_name is set |
| Index | Yes (`idx_job_orders_vms_job_id`) |

**Business Rules:**
- Required if order comes through VMS (Fieldglass, Beeline, etc.)
- Used for tracking submissions and timesheets in VMS
- Must be unique within org

---

### vms_name
| Property | Value |
|----------|-------|
| Column Name | `vms_name` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Allowed Values | `fieldglass`, `beeline`, `iqn`, `wand`, `peoplefluent`, `other` |
| Description | Name of VMS system |
| UI Label | "VMS System" |
| UI Type | Dropdown |
| Common Values | Fieldglass (SAP), Beeline, IQNavigator, WAND |

---

### msp_name
| Property | Value |
|----------|-------|
| Column Name | `msp_name` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Managed Service Provider name (if applicable) |
| UI Label | "MSP Name" |
| UI Type | Text Input |

**Business Rules:**
- MSP = Managed Service Provider (intermediary managing contingent workforce)
- Example MSPs: Randstad, Manpower, Adecco, Kelly Services
- If MSP involved, billing may go through MSP not direct to client

---

### vendor_tier
| Property | Value |
|----------|-------|
| Column Name | `vendor_tier` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `tier_1`, `tier_2`, `tier_3`, `preferred`, `strategic` |
| Description | Vendor tier level with client/MSP |
| UI Label | "Vendor Tier" |
| UI Type | Dropdown |

**Tier Meanings:**
| Value | Display Label | Description | Submission Priority |
|-------|---------------|-------------|---------------------|
| `strategic` | Strategic Partner | Highest tier, strategic relationship | First to submit |
| `preferred` | Preferred Vendor | Preferred status | High priority |
| `tier_1` | Tier 1 | Top tier vendor | Standard priority |
| `tier_2` | Tier 2 | Second tier vendor | Lower priority |
| `tier_3` | Tier 3 | Third tier vendor | Lowest priority |

**Business Rules:**
- Higher tiers often get: first look at jobs, more submissions allowed, faster approvals
- Tier affects max_submissions limit
- Strategic/Preferred may have better bill rates

---

### accountable_id
| Property | Value |
|----------|-------|
| Column Name | `accountable_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `user_profiles(id)` |
| Description | RCAI Accountable owner (primary owner who approves/owns outcome) |
| UI Label | "Accountable Owner" |
| UI Type | User Select |
| Default | Current user (on create) |
| Business Rule | Exactly ONE accountable owner required (RCAI rule) |
| Index | Yes (`idx_job_orders_accountable_id`) |

**RCAI Framework:**
- **Responsible**: Does the work (assigned via object_owners table)
- **Accountable**: Approves/owns outcome (this field - exactly 1)
- **Consulted**: Provides input (assigned via object_owners table)
- **Informed**: Kept updated (assigned via object_owners table)

---

### received_date
| Property | Value |
|----------|-------|
| Column Name | `received_date` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | When order was received from client |
| UI Label | "Received Date" |
| UI Type | Date/Time Picker |
| Business Rule | Used for SLA calculations (time to first submission) |

---

### target_fill_date
| Property | Value |
|----------|-------|
| Column Name | `target_fill_date` |
| Type | `DATE` |
| Required | No (recommended) |
| Min | Today |
| Description | Target date to fill all positions |
| UI Label | "Target Fill Date" |
| UI Type | Date Picker |
| Business Rule | Used for aging reports and priority |

---

### filled_date
| Property | Value |
|----------|-------|
| Column Name | `filled_date` |
| Type | `DATE` |
| Required | No |
| Description | Date all positions were filled |
| UI Label | "Filled Date" |
| UI Type | Display only (auto-set) |
| Auto Update | Set when positions_filled = positions_count |

---

### closed_date
| Property | Value |
|----------|-------|
| Column Name | `closed_date` |
| Type | `DATE` |
| Required | No |
| Description | Date order was closed |
| UI Label | "Closed Date" |
| UI Type | Display only (auto-set) |
| Auto Update | Set when status changes to 'fulfilled', 'cancelled', or 'expired' |

---

### closed_reason
| Property | Value |
|----------|-------|
| Column Name | `closed_reason` |
| Type | `TEXT` |
| Required | No (required when status = 'cancelled') |
| Max Length | 500 characters |
| Description | Reason for closing/cancelling order |
| UI Label | "Close Reason" |
| UI Type | Textarea |
| UI Visible | When status changes to 'cancelled' or 'expired' |
| Common Reasons | "Client filled internally", "Budget cut", "Project cancelled", "Filled by another vendor" |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp of record creation |
| UI Display | Display only, formatted |
| Format | "MMM DD, YYYY hh:mm A" |

---

### updated_at
| Property | Value |
|----------|-------|
| Column Name | `updated_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Auto Update | Yes (via trigger) |
| Description | Timestamp of last update |
| UI Display | Display only, formatted |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the order |
| UI Display | Display only |
| UI Format | Show user's full name |

---

### updated_by
| Property | Value |
|----------|-------|
| Column Name | `updated_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who last updated the order |
| UI Display | Display only |

---

### deleted_at
| Property | Value |
|----------|-------|
| Column Name | `deleted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Default | NULL |
| Description | Soft delete timestamp |
| UI Display | Hidden |
| Query Filter | `WHERE deleted_at IS NULL` |
| Business Rule | Soft delete preserves historical data |

---

### search_vector
| Property | Value |
|----------|-------|
| Column Name | `search_vector` |
| Type | `TSVECTOR` |
| Required | No |
| Description | Full-text search vector |
| Auto Update | Via trigger on INSERT/UPDATE |
| Includes | order_number, title, description, requirements, required_skills, location, vms_job_id |
| Index | GIN index for fast searching |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `job_orders_pkey` | `id` | BTREE | Primary key |
| `idx_job_orders_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_job_orders_order_number` | `order_number` | BTREE | Unique constraint, lookup |
| `idx_job_orders_account_id` | `account_id` | BTREE | Account/client lookup |
| `idx_job_orders_client_contact_id` | `client_contact_id` | BTREE | Contact lookup |
| `idx_job_orders_source_job_id` | `source_job_id` | BTREE | Source requisition lookup |
| `idx_job_orders_source_external_job_id` | `source_external_job_id` | BTREE | Source external job lookup |
| `idx_job_orders_accountable_id` | `accountable_id` | BTREE | Owner lookup |
| `idx_job_orders_status` | `status` | BTREE | Status filtering |
| `idx_job_orders_priority` | `priority` | BTREE | Priority filtering |
| `idx_job_orders_vms_job_id` | `vms_job_id` | BTREE | VMS job lookup |
| `idx_job_orders_deleted_at` | `deleted_at` | BTREE | Soft delete (WHERE NULL) |
| `idx_job_orders_search` | `search_vector` | GIN | Full-text search |
| `idx_job_orders_received_date` | `received_date` | BTREE | SLA and aging reports |
| `idx_job_orders_target_fill_date` | `target_fill_date` | BTREE | Due date tracking |

---

## Composite Indexes (for common queries)

```sql
-- Active orders by account
CREATE INDEX idx_job_orders_account_status
  ON job_orders(account_id, status)
  WHERE deleted_at IS NULL;

-- Urgent/priority orders
CREATE INDEX idx_job_orders_priority_status
  ON job_orders(priority, status)
  WHERE deleted_at IS NULL;

-- VMS orders
CREATE INDEX idx_job_orders_vms_name_status
  ON job_orders(vms_name, status)
  WHERE vms_name IS NOT NULL AND deleted_at IS NULL;

-- Owner's active orders
CREATE INDEX idx_job_orders_accountable_status
  ON job_orders(accountable_id, status)
  WHERE deleted_at IS NULL;
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;

-- Organization isolation (basic multi-tenancy)
CREATE POLICY "job_orders_org_isolation" ON job_orders
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Additional RCAI-based access policy
-- Users can see orders where they are RCAI participants
CREATE POLICY "job_orders_rcai_access" ON job_orders
  FOR SELECT
  USING (
    -- Own org
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      -- Is accountable owner
      accountable_id = (auth.jwt() ->> 'user_id')::uuid
      OR
      -- Is RCAI participant (via object_owners)
      id IN (
        SELECT entity_id
        FROM object_owners
        WHERE entity_type = 'job_order'
          AND user_id = (auth.jwt() ->> 'user_id')::uuid
      )
    )
  );

-- Edit policy: only accountable owner and responsible users can edit
CREATE POLICY "job_orders_rcai_edit" ON job_orders
  FOR UPDATE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      -- Is accountable owner
      accountable_id = (auth.jwt() ->> 'user_id')::uuid
      OR
      -- Is responsible (via object_owners with edit permission)
      id IN (
        SELECT entity_id
        FROM object_owners
        WHERE entity_type = 'job_order'
          AND user_id = (auth.jwt() ->> 'user_id')::uuid
          AND role IN ('responsible', 'accountable')
          AND permission = 'edit'
      )
    )
  );
```

---

## Triggers

### Order Number Auto-Generation Trigger
```sql
CREATE OR REPLACE FUNCTION generate_job_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  year_str TEXT;
BEGIN
  -- Only generate if order_number is NULL
  IF NEW.order_number IS NULL THEN
    year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

    -- Get next number for this year
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(order_number FROM 'JO-\d{4}-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO next_number
    FROM job_orders
    WHERE order_number LIKE 'JO-' || year_str || '-%'
      AND org_id = NEW.org_id;

    -- Format as JO-YYYY-NNNN
    NEW.order_number := 'JO-' || year_str || '-' || LPAD(next_number::TEXT, 4, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_orders_order_number_trigger
  BEFORE INSERT ON job_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_job_order_number();
```

### Updated At Trigger
```sql
CREATE TRIGGER job_orders_updated_at
  BEFORE UPDATE ON job_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Search Vector Trigger
```sql
CREATE OR REPLACE FUNCTION job_orders_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.order_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.requirements, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.required_skills, ' '), '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.vms_job_id, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_orders_search_vector_update
  BEFORE INSERT OR UPDATE ON job_orders
  FOR EACH ROW
  EXECUTE FUNCTION job_orders_search_vector_trigger();
```

### Auto-assign RCAI Trigger
```sql
CREATE OR REPLACE FUNCTION job_orders_auto_rcai()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign Accountable user as RCAI Accountable
  INSERT INTO object_owners (
    org_id,
    entity_type,
    entity_id,
    user_id,
    role,
    permission,
    is_primary,
    assignment_type
  ) VALUES (
    NEW.org_id,
    'job_order',
    NEW.id,
    NEW.accountable_id,
    'accountable',
    'edit',
    TRUE,
    'auto'
  )
  ON CONFLICT (entity_type, entity_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_orders_auto_rcai
  AFTER INSERT ON job_orders
  FOR EACH ROW
  EXECUTE FUNCTION job_orders_auto_rcai();
```

### Auto-fulfill Trigger
```sql
CREATE OR REPLACE FUNCTION job_orders_auto_fulfill()
RETURNS TRIGGER AS $$
BEGIN
  -- If positions_filled reaches positions_count, auto-fulfill
  IF NEW.positions_filled >= NEW.positions_count AND OLD.status = 'active' THEN
    NEW.status := 'fulfilled';
    NEW.filled_date := CURRENT_DATE;
    NEW.closed_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_orders_auto_fulfill_trigger
  BEFORE UPDATE ON job_orders
  FOR EACH ROW
  WHEN (NEW.positions_filled <> OLD.positions_filled)
  EXECUTE FUNCTION job_orders_auto_fulfill();
```

### Status Change Audit Trigger
```sql
CREATE OR REPLACE FUNCTION job_orders_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Set closed_date when status changes to terminal state
  IF NEW.status IN ('fulfilled', 'cancelled', 'expired')
     AND OLD.status NOT IN ('fulfilled', 'cancelled', 'expired') THEN
    NEW.closed_date := CURRENT_DATE;
  END IF;

  -- Log to audit table (if exists)
  INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    old_value,
    new_value,
    user_id
  ) VALUES (
    'job_order',
    NEW.id,
    'status_change',
    jsonb_build_object('status', OLD.status),
    jsonb_build_object('status', NEW.status),
    (auth.jwt() ->> 'user_id')::uuid
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_orders_status_change_trigger
  AFTER UPDATE ON job_orders
  FOR EACH ROW
  WHEN (NEW.status <> OLD.status)
  EXECUTE FUNCTION job_orders_status_change();
```

---

## Calculated Fields / Virtual Columns

### Margin Calculation
```sql
-- Gross Profit (GP) = Bill Rate - Pay Rate
-- Markup % = (Bill Rate - Pay Rate) / Pay Rate × 100
-- Margin % = (Bill Rate - Pay Rate) / Bill Rate × 100

CREATE OR REPLACE FUNCTION calculate_job_order_margin(
  p_bill_rate NUMERIC,
  p_pay_rate NUMERIC
)
RETURNS TABLE (
  gross_profit NUMERIC,
  markup_percentage NUMERIC,
  margin_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (p_bill_rate - p_pay_rate) AS gross_profit,
    CASE
      WHEN p_pay_rate > 0 THEN
        ((p_bill_rate - p_pay_rate) / p_pay_rate * 100)
      ELSE NULL
    END AS markup_percentage,
    CASE
      WHEN p_bill_rate > 0 THEN
        ((p_bill_rate - p_pay_rate) / p_bill_rate * 100)
      ELSE NULL
    END AS margin_percentage;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Example Usage:**
```sql
SELECT
  order_number,
  bill_rate,
  pay_rate_max,
  (SELECT gross_profit FROM calculate_job_order_margin(bill_rate, pay_rate_max)),
  (SELECT markup_percentage FROM calculate_job_order_margin(bill_rate, pay_rate_max)),
  (SELECT margin_percentage FROM calculate_job_order_margin(bill_rate, pay_rate_max))
FROM job_orders;
```

### Estimated Revenue
```sql
CREATE OR REPLACE FUNCTION calculate_job_order_revenue(
  p_bill_rate NUMERIC,
  p_rate_type TEXT,
  p_duration_months INTEGER DEFAULT 12
)
RETURNS NUMERIC AS $$
DECLARE
  hours_per_year CONSTANT NUMERIC := 2080;
  hours_per_month CONSTANT NUMERIC := 173.33;
BEGIN
  CASE p_rate_type
    WHEN 'hourly' THEN
      RETURN p_bill_rate * hours_per_month * p_duration_months;
    WHEN 'daily' THEN
      RETURN p_bill_rate * 22 * p_duration_months; -- 22 work days/month
    WHEN 'weekly' THEN
      RETURN p_bill_rate * 4.33 * p_duration_months; -- 4.33 weeks/month
    WHEN 'monthly' THEN
      RETURN p_bill_rate * p_duration_months;
    WHEN 'annual' THEN
      RETURN p_bill_rate * (p_duration_months / 12.0);
    ELSE
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Time to Fill
```sql
-- Days from received_date to filled_date
CREATE OR REPLACE VIEW job_orders_metrics AS
SELECT
  id,
  order_number,
  status,
  received_date,
  filled_date,
  CASE
    WHEN filled_date IS NOT NULL THEN
      DATE_PART('day', filled_date::timestamp - received_date)
    ELSE
      DATE_PART('day', CURRENT_TIMESTAMP - received_date)
  END AS days_to_fill,
  CASE
    WHEN target_fill_date IS NOT NULL THEN
      DATE_PART('day', target_fill_date::timestamp - CURRENT_DATE::timestamp)
    ELSE NULL
  END AS days_until_target,
  -- Estimated revenue
  calculate_job_order_revenue(bill_rate, rate_type, duration_months) AS estimated_revenue,
  -- Margin calculations
  (SELECT gross_profit FROM calculate_job_order_margin(bill_rate, pay_rate_max)) AS gross_profit,
  (SELECT markup_percentage FROM calculate_job_order_margin(bill_rate, pay_rate_max)) AS markup_pct,
  (SELECT margin_percentage FROM calculate_job_order_margin(bill_rate, pay_rate_max)) AS margin_pct
FROM job_orders
WHERE deleted_at IS NULL;
```

---

## Business Rules

### Order Creation Rules

1. **Required Client**: `account_id` must always be set (unlike jobs which can be internal requisitions)
2. **Source Validation**:
   - If `source_type = 'requisition'`, `source_job_id` must be set
   - If `source_type = 'external_job'`, `source_external_job_id` must be set
   - If `source_type = 'direct'`, both source IDs should be NULL
3. **Order Number**: Auto-generated in format `JO-YYYY-NNNN` (e.g., `JO-2024-0001`)
4. **Accountable Owner**: Must be set (RCAI framework)

### Financial Rules

1. **Positive Margin Required**:
   - `bill_rate` must be > `pay_rate_max` (can't bill less than we pay)
   - Warn if margin < 15% (below industry standard)
   - Flag if margin < 0% (losing money)

2. **Rate Type Consistency**:
   - `bill_rate`, `pay_rate`, `overtime_bill_rate`, `overtime_pay_rate` must all use same `rate_type`

3. **Overtime Rates**:
   - If `overtime_expected = true`, require `overtime_bill_rate` and `overtime_pay_rate`
   - Typical: OT rates = 1.5x regular rates (time and a half)

4. **Permanent Placement Fees**:
   - For `job_type = 'permanent'` or `'contract_to_hire'`, require either `placement_fee_percentage` OR `placement_fee_flat`
   - Standard fee percentages: 15-25%
   - Standard guarantee periods: 30, 60, or 90 days

### Status Transition Rules

```
Valid Transitions:
pending → active        (order activated)
pending → cancelled     (order cancelled before starting)
active → on_hold       (client pauses search)
active → fulfilled     (all positions filled)
active → cancelled     (client cancels active order)
active → expired       (end_date passed without filling)
on_hold → active       (search resumed)
on_hold → cancelled    (cancelled while on hold)

Terminal States (no further transitions):
- fulfilled
- cancelled
- expired
```

### Position Tracking Rules

1. **Positions Filled**:
   - Auto-increment `positions_filled` when placement created with status 'active'
   - Auto-decrement if placement cancelled within guarantee period
   - When `positions_filled = positions_count`, auto-set status to 'fulfilled'

2. **Positions Count**:
   - Cannot reduce `positions_count` below `positions_filled`
   - Increasing `positions_count` on fulfilled order → status back to 'active'

### VMS Integration Rules

1. **VMS Order Requirements**:
   - If `vms_name` is set, `vms_job_id` is required
   - VMS orders typically have strict `max_submissions` limits
   - VMS orders require specific `submission_format` (usually 'vms_portal')

2. **MSP Relationship**:
   - If `msp_name` is set, billing goes through MSP
   - MSP orders may have lower margins due to MSP fee split
   - `vendor_tier` affects submission priority and max_submissions

3. **Vendor Tier Limits**:
   ```
   strategic:  max_submissions = unlimited or 10+
   preferred:  max_submissions = 5-10
   tier_1:     max_submissions = 3-5
   tier_2:     max_submissions = 2-3
   tier_3:     max_submissions = 1-2
   ```

### Submission Rules

1. **Max Submissions**:
   - Prevent new submissions when `current_submissions >= max_submissions`
   - VMS orders typically limit to 3-5 submissions
   - Direct orders may allow unlimited

2. **Submission Tracking**:
   - Increment `current_submissions` when submission created
   - Only count active submissions (not rejected/withdrawn)
   - Decrement when submission withdrawn

### Work Authorization Rules

1. **Citizenship vs Visa**:
   - If `citizenship_required = true`, only US citizens allowed
   - `visa_requirements` array lists acceptable work authorizations
   - Empty array = no restrictions

2. **Security Clearance**:
   - If `security_clearance_required` is set, candidate must have or be clearable
   - Active clearance preferred (faster start)
   - Clearable candidates need 3-6 months for clearance process

### SLA and Priority Rules

1. **Time to Submit SLA** (from `received_date`):
   ```
   critical: Same day (8 hours)
   urgent:   24 hours
   high:     3 days
   normal:   5 days
   low:      10 days
   ```

2. **Priority Auto-Escalation**:
   - If `target_fill_date` < 7 days away, auto-escalate to 'urgent'
   - If `target_fill_date` < 3 days away, auto-escalate to 'critical'

### Expiration Rules

1. **Auto-Expire Orders**:
   - Nightly job checks for orders where:
     - `status = 'active'`
     - `end_date < CURRENT_DATE`
     - `positions_filled < positions_count`
   - Sets status to 'expired' and `closed_date = CURRENT_DATE`

2. **Prevent Expiration**:
   - If `extension_possible = true`, show "Request Extension" button
   - Extension creates new order with updated dates

---

## Related Tables

| Table | Relationship | FK Column | Description |
|-------|--------------|-----------|-------------|
| organizations | Parent | `org_id` | Multi-tenant org |
| accounts | Parent | `account_id` | Client company |
| contacts | Parent | `client_contact_id` | Client POC |
| jobs | Source | `source_job_id` | Source requisition |
| external_jobs | Source | `source_external_job_id` | Source external job |
| user_profiles | Owner | `accountable_id` | RCAI accountable owner |
| submissions | Children | `submissions.job_order_id` | Candidate submissions |
| placements | Children | `placements.job_order_id` | Successful placements |
| timesheets | Children | `timesheets.job_order_id` | Contractor timesheets |
| invoices | Children | `invoices.job_order_id` | Client invoices |
| object_owners | RCAI | Polymorphic `entity_type='job_order'` | RCAI assignments |

---

## Common Queries

### Active Orders by Account
```sql
SELECT
  jo.order_number,
  jo.title,
  jo.status,
  jo.priority,
  jo.positions_count,
  jo.positions_filled,
  jo.bill_rate,
  jo.rate_type,
  a.name AS account_name,
  up.full_name AS accountable_name
FROM job_orders jo
JOIN accounts a ON a.id = jo.account_id
JOIN user_profiles up ON up.id = jo.accountable_id
WHERE jo.deleted_at IS NULL
  AND jo.status IN ('active', 'on_hold')
  AND jo.account_id = $1
ORDER BY jo.priority DESC, jo.received_date ASC;
```

### High Priority Unfulfilled Orders
```sql
SELECT
  jo.order_number,
  jo.title,
  jo.priority,
  jo.received_date,
  jo.target_fill_date,
  DATE_PART('day', CURRENT_TIMESTAMP - jo.received_date) AS days_open,
  jo.positions_count - jo.positions_filled AS remaining_positions
FROM job_orders jo
WHERE jo.deleted_at IS NULL
  AND jo.status = 'active'
  AND jo.priority IN ('urgent', 'critical')
  AND jo.positions_filled < jo.positions_count
ORDER BY jo.priority DESC, jo.received_date ASC;
```

### Revenue Report by Status
```sql
SELECT
  jo.status,
  COUNT(*) AS order_count,
  SUM(jo.positions_count) AS total_positions,
  SUM(jo.positions_filled) AS filled_positions,
  SUM(calculate_job_order_revenue(jo.bill_rate, jo.rate_type, jo.duration_months)) AS estimated_revenue
FROM job_orders jo
WHERE jo.deleted_at IS NULL
  AND jo.created_at >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY jo.status
ORDER BY estimated_revenue DESC;
```

### VMS Orders Requiring Attention
```sql
SELECT
  jo.order_number,
  jo.vms_name,
  jo.vms_job_id,
  jo.title,
  jo.max_submissions,
  jo.current_submissions,
  jo.max_submissions - jo.current_submissions AS remaining_slots
FROM job_orders jo
WHERE jo.deleted_at IS NULL
  AND jo.status = 'active'
  AND jo.vms_name IS NOT NULL
  AND jo.current_submissions < jo.max_submissions
ORDER BY jo.priority DESC, remaining_slots DESC;
```

### Margin Analysis
```sql
SELECT
  jo.order_number,
  jo.title,
  jo.bill_rate,
  jo.pay_rate_max,
  jo.bill_rate - jo.pay_rate_max AS gross_profit,
  ROUND(((jo.bill_rate - jo.pay_rate_max) / jo.pay_rate_max * 100)::numeric, 2) AS markup_pct,
  ROUND(((jo.bill_rate - jo.pay_rate_max) / jo.bill_rate * 100)::numeric, 2) AS margin_pct,
  CASE
    WHEN ((jo.bill_rate - jo.pay_rate_max) / jo.bill_rate * 100) < 15 THEN 'Low Margin'
    WHEN ((jo.bill_rate - jo.pay_rate_max) / jo.bill_rate * 100) < 25 THEN 'Normal Margin'
    ELSE 'High Margin'
  END AS margin_category
FROM job_orders jo
WHERE jo.deleted_at IS NULL
  AND jo.status IN ('active', 'fulfilled')
  AND jo.pay_rate_max IS NOT NULL
ORDER BY margin_pct ASC;
```

---

## Views

### Job Orders with Metrics
```sql
CREATE OR REPLACE VIEW vw_job_orders_with_metrics AS
SELECT
  jo.*,
  a.name AS account_name,
  c.full_name AS contact_name,
  up.full_name AS accountable_name,

  -- Position metrics
  jo.positions_count - jo.positions_filled AS open_positions,
  ROUND((jo.positions_filled::numeric / jo.positions_count * 100), 1) AS fill_rate_pct,

  -- Time metrics
  DATE_PART('day', COALESCE(jo.filled_date, CURRENT_DATE)::timestamp - jo.received_date) AS days_to_fill,
  CASE
    WHEN jo.target_fill_date IS NOT NULL THEN
      DATE_PART('day', jo.target_fill_date::timestamp - CURRENT_DATE::timestamp)
    ELSE NULL
  END AS days_until_target,

  -- Financial metrics
  jo.bill_rate - COALESCE(jo.pay_rate_max, 0) AS gross_profit,
  CASE
    WHEN jo.pay_rate_max > 0 THEN
      ROUND(((jo.bill_rate - jo.pay_rate_max) / jo.pay_rate_max * 100)::numeric, 2)
    ELSE NULL
  END AS markup_pct,
  CASE
    WHEN jo.bill_rate > 0 THEN
      ROUND(((jo.bill_rate - COALESCE(jo.pay_rate_max, 0)) / jo.bill_rate * 100)::numeric, 2)
    ELSE NULL
  END AS margin_pct,
  calculate_job_order_revenue(jo.bill_rate, jo.rate_type, jo.duration_months) AS estimated_revenue,

  -- Submission metrics
  CASE
    WHEN jo.max_submissions IS NOT NULL THEN
      jo.max_submissions - jo.current_submissions
    ELSE NULL
  END AS remaining_submission_slots

FROM job_orders jo
LEFT JOIN accounts a ON a.id = jo.account_id
LEFT JOIN contacts c ON c.id = jo.client_contact_id
LEFT JOIN user_profiles up ON up.id = jo.accountable_id
WHERE jo.deleted_at IS NULL;
```

---

*Last Updated: 2025-11-30*
