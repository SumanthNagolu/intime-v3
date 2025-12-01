# Jobs Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `jobs` |
| Schema | `public` |
| Purpose | Store job requisitions from clients |
| Primary Owner | Recruiter |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |

---

## Table Definition

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Associations
  account_id UUID REFERENCES accounts(id),
  client_id UUID REFERENCES accounts(id),
  deal_id UUID REFERENCES deals(id),
  
  -- Job Details
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT DEFAULT 'contract',
  
  -- Location
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  hybrid_days INTEGER,
  
  -- Compensation
  rate_min NUMERIC(10,2),
  rate_max NUMERIC(10,2),
  rate_type TEXT DEFAULT 'hourly',
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  urgency TEXT DEFAULT 'medium',
  priority TEXT DEFAULT 'medium',
  positions_count INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,
  
  -- Requirements
  required_skills TEXT[],
  nice_to_have_skills TEXT[],
  min_experience_years INTEGER,
  max_experience_years INTEGER,
  visa_requirements TEXT[],
  
  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),
  recruiter_ids UUID[],
  
  -- Dates
  posted_date DATE,
  target_fill_date DATE,
  target_start_date TIMESTAMPTZ,
  filled_date DATE,
  
  -- Client Instructions
  client_submission_instructions TEXT,
  client_interview_process TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
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
| Description | Unique identifier for the job |
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
| Description | Organization this job belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### account_id
| Property | Value |
|----------|-------|
| Column Name | `account_id` |
| Type | `UUID` |
| Required | Yes (in UI, nullable in DB for migration) |
| Foreign Key | `accounts(id)` |
| Description | Client company this job is for |
| UI Label | "Client Account" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Search accounts..." |
| Validation | Must be active account in same org |
| Index | Yes (`idx_jobs_account_id`) |

---

### client_id
| Property | Value |
|----------|-------|
| Column Name | `client_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `accounts(id)` |
| Description | Alias for account_id (legacy compatibility) |
| UI Display | Hidden |
| Note | Deprecated - use account_id |

---

### deal_id
| Property | Value |
|----------|-------|
| Column Name | `deal_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `deals(id)` |
| Description | Deal this job originated from (if applicable) |
| UI Label | "Related Deal" |
| UI Type | Dropdown |
| UI Display | Only in advanced section |

---

### title
| Property | Value |
|----------|-------|
| Column Name | `title` |
| Type | `TEXT` |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 3 characters |
| Description | Job title/position name |
| UI Label | "Job Title" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Senior Software Engineer" |
| Validation | Not empty, no special chars except `- () /` |
| Error Message | "Job title is required" |
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
| Description | Full job description, responsibilities, requirements |
| UI Label | "Description" |
| UI Type | Rich Text Editor / Textarea |
| UI Placeholder | "Enter job description..." |
| Searchable | Yes |
| Rich Text | Optional (bold, italic, lists) |

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
| Value | Display Label | Description |
|-------|---------------|-------------|
| `contract` | Contract | Temporary contract work |
| `permanent` | Permanent (Direct Hire) | Full-time direct employment |
| `contract_to_hire` | Contract to Hire | Contract with conversion option |
| `temp` | Temporary | Short-term temporary work |
| `sow` | Statement of Work | Project-based work |

---

### location
| Property | Value |
|----------|-------|
| Column Name | `location` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Work location (city, state, country) |
| UI Label | "Location" |
| UI Type | Text Input (with autocomplete) |
| UI Placeholder | "e.g., San Francisco, CA" |
| Autocomplete | Google Places API (optional) |

---

### is_remote
| Property | Value |
|----------|-------|
| Column Name | `is_remote` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `FALSE` |
| Description | Whether position allows remote work |
| UI Label | "Remote" |
| UI Type | Checkbox |
| Related Field | If false but `hybrid_days` > 0, treat as Hybrid |

---

### hybrid_days
| Property | Value |
|----------|-------|
| Column Name | `hybrid_days` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 5 |
| Description | Days per week required in office (for hybrid roles) |
| UI Label | "Days in office per week" |
| UI Type | Number Input |
| UI Visible | Only when Hybrid mode selected |

---

### rate_min
| Property | Value |
|----------|-------|
| Column Name | `rate_min` |
| Type | `NUMERIC(10,2)` |
| Required | Yes (in UI) |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Minimum bill rate |
| UI Label | "Min Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | Based on rate_type |
| Validation | Must be positive number |

---

### rate_max
| Property | Value |
|----------|-------|
| Column Name | `rate_max` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | rate_min value |
| Precision | 2 decimal places |
| Description | Maximum bill rate |
| UI Label | "Max Rate" |
| UI Type | Currency Input |
| Validation | Must be >= rate_min |
| Error Message | "Max rate must be greater than or equal to min rate" |

---

### rate_type
| Property | Value |
|----------|-------|
| Column Name | `rate_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'hourly'` |
| Allowed Values | `hourly`, `daily`, `weekly`, `monthly`, `annual` |
| Description | Rate period |
| UI Label | "Rate Type" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Rate Suffix |
|-------|---------------|-------------|
| `hourly` | Hourly | /hr |
| `daily` | Daily | /day |
| `weekly` | Weekly | /week |
| `monthly` | Monthly | /month |
| `annual` | Annual | /year |

---

### currency
| Property | Value |
|----------|-------|
| Column Name | `currency` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'USD'` |
| Allowed Values | ISO 4217 currency codes |
| Description | Currency for rates |
| UI Label | "Currency" |
| UI Type | Dropdown |
| Common Values | `USD`, `CAD`, `GBP`, `EUR`, `INR` |

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'draft'` |
| Allowed Values | `draft`, `open`, `urgent`, `on_hold`, `filled`, `cancelled` |
| Description | Current job status |
| UI Label | "Status" |
| UI Type | Dropdown / Status Badge |
| Index | Yes (`idx_jobs_status`) |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `draft` | Draft | Gray | Not yet active |
| `open` | Open | Green | Actively recruiting |
| `urgent` | Urgent | Red | High priority |
| `on_hold` | On Hold | Yellow | Paused |
| `filled` | Filled | Blue | All positions filled |
| `cancelled` | Cancelled | Red | No longer needed |

---

### urgency
| Property | Value |
|----------|-------|
| Column Name | `urgency` |
| Type | `TEXT` |
| Required | No |
| Default | `'medium'` |
| Allowed Values | `low`, `medium`, `high`, `critical` |
| Description | How quickly position needs filling |
| UI Label | "Urgency" |
| UI Type | Dropdown |
| Note | Deprecated - use `priority` instead |

---

### priority
| Property | Value |
|----------|-------|
| Column Name | `priority` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'medium'` |
| Allowed Values | `low`, `normal`, `high`, `urgent`, `critical` |
| Description | Job priority level |
| UI Label | "Priority" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Color | SLA (Time to Submit) |
|-------|---------------|-------|---------------------|
| `low` | Low | Gray | 7 days |
| `normal` | Normal | Blue | 3 days |
| `high` | High | Yellow | 48 hours |
| `urgent` | Urgent | Orange | 24 hours |
| `critical` | Critical | Red | Same day |

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
| Description | Number of positions to fill |
| UI Label | "Open Positions" |
| UI Type | Number Input |

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
| UI Label | "Filled" |
| UI Type | Display only (auto-incremented) |
| Auto Update | Incremented when placement created |

---

### required_skills
| Property | Value |
|----------|-------|
| Column Name | `required_skills` |
| Type | `TEXT[]` (Array) |
| Required | Yes (at least 1) |
| Max Items | 20 |
| Description | Skills candidate must have |
| UI Label | "Required Skills" |
| UI Type | Tag Input with autocomplete |
| Autocomplete Source | `skills` table |
| Allow Custom | Yes (creates new skill) |
| Searchable | Yes |

---

### nice_to_have_skills
| Property | Value |
|----------|-------|
| Column Name | `nice_to_have_skills` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 20 |
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
| Description | Minimum years of experience required |
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
| Description | Maximum years of experience |
| UI Label | "Max Experience" |
| UI Type | Number Input |
| UI Suffix | "years" |

---

### visa_requirements
| Property | Value |
|----------|-------|
| Column Name | `visa_requirements` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Description | Allowed work authorization types |
| UI Label | "Visa Requirements" |
| UI Type | Multi-select Dropdown |

**Allowed Values:**
| Value | Display Label |
|-------|---------------|
| `us_citizen` | US Citizen |
| `green_card` | Green Card |
| `h1b` | H1B |
| `l1` | L1 |
| `opt` | OPT/CPT |
| `tn` | TN Visa |
| `any` | Any (No Restriction) |

---

### owner_id
| Property | Value |
|----------|-------|
| Column Name | `owner_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `user_profiles(id)` |
| Description | Primary owner/recruiter for this job |
| UI Label | "Owner" |
| UI Type | User Select |
| Default | Current user (on create) |
| Index | Yes (`idx_jobs_owner_id`) |

---

### recruiter_ids
| Property | Value |
|----------|-------|
| Column Name | `recruiter_ids` |
| Type | `UUID[]` (Array) |
| Required | No |
| Description | Additional recruiters assigned |
| UI Label | "Additional Recruiters" |
| UI Type | Multi-select User Picker |

---

### posted_date
| Property | Value |
|----------|-------|
| Column Name | `posted_date` |
| Type | `DATE` |
| Required | No |
| Description | Date job was posted/opened |
| UI Label | "Posted Date" |
| UI Type | Date Picker |
| Default | Set to today when status changes to 'open' |

---

### target_fill_date
| Property | Value |
|----------|-------|
| Column Name | `target_fill_date` |
| Type | `DATE` |
| Required | No |
| Min | Today |
| Description | Target date to fill position |
| UI Label | "Target Fill Date" |
| UI Type | Date Picker |

---

### target_start_date
| Property | Value |
|----------|-------|
| Column Name | `target_start_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When client wants candidate to start |
| UI Label | "Target Start Date" |
| UI Type | Date Picker |

---

### filled_date
| Property | Value |
|----------|-------|
| Column Name | `filled_date` |
| Type | `DATE` |
| Required | No |
| Description | Date job was filled |
| UI Label | "Filled Date" |
| UI Type | Display only (auto-set) |
| Auto Update | Set when positions_filled = positions_count |

---

### client_submission_instructions
| Property | Value |
|----------|-------|
| Column Name | `client_submission_instructions` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 |
| Description | Client's specific submission requirements |
| UI Label | "Submission Instructions" |
| UI Type | Textarea |
| UI Section | Client Details (advanced) |

---

### client_interview_process
| Property | Value |
|----------|-------|
| Column Name | `client_interview_process` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 |
| Description | Description of client's interview process |
| UI Label | "Interview Process" |
| UI Type | Textarea |
| UI Section | Client Details (advanced) |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp of creation |
| UI Display | Display only, formatted |

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
| Description | User who created the job |
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

---

### search_vector
| Property | Value |
|----------|-------|
| Column Name | `search_vector` |
| Type | `TSVECTOR` |
| Required | No |
| Description | Full-text search vector |
| Auto Update | Via trigger on INSERT/UPDATE |
| Includes | title, description, required_skills, location |
| Index | GIN index for fast searching |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `jobs_pkey` | `id` | BTREE | Primary key |
| `idx_jobs_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_jobs_account_id` | `account_id` | BTREE | Account lookup |
| `idx_jobs_owner_id` | `owner_id` | BTREE | Owner lookup |
| `idx_jobs_status` | `status` | BTREE | Status filtering |
| `idx_jobs_deleted_at` | `deleted_at` | BTREE | Soft delete (WHERE NULL) |
| `idx_jobs_search` | `search_vector` | GIN | Full-text search |

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "jobs_org_isolation" ON jobs
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Additional policy for RCAI-based access could be added
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Search Vector Trigger
```sql
CREATE TRIGGER jobs_search_vector_update
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION jobs_search_vector_trigger();
```

### Auto-assign RCAI Trigger
```sql
CREATE TRIGGER jobs_auto_rcai
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_rcai();
```

---

## Related Tables

| Table | Relationship | FK Column |
|-------|--------------|-----------|
| organizations | Parent | `org_id` |
| accounts | Parent | `account_id` |
| deals | Parent | `deal_id` |
| user_profiles | Owner | `owner_id` |
| submissions | Children | `submissions.job_id` |
| interviews | Children | `interviews.job_id` |
| offers | Children | `offers.job_id` |
| placements | Children | `placements.job_id` |
| object_owners | RCAI | Polymorphic |

---

*Last Updated: 2024-11-30*



