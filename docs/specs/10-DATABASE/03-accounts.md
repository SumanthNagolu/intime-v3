# Accounts Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `accounts` |
| Schema | `public` |
| Purpose | Store client companies that engage InTime for staffing services |
| Primary Owner | Account Manager / Sales Rep |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |

---

## Table Definition

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  industry TEXT,
  company_type TEXT DEFAULT 'direct_client',
  status TEXT NOT NULL DEFAULT 'prospect',
  tier TEXT,

  -- Account management
  account_manager_id UUID REFERENCES user_profiles(id),
  responsiveness TEXT,
  preferred_quality TEXT,
  description TEXT,

  -- Business terms
  contract_start_date TIMESTAMPTZ,
  contract_end_date TIMESTAMPTZ,
  payment_terms_days INTEGER DEFAULT 30,
  markup_percentage NUMERIC(5,2),
  annual_revenue_target NUMERIC(12,2),

  -- Contact info
  website TEXT,
  headquarters_location TEXT,
  phone TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search
  search_vector TEXT
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
| Description | Unique identifier for the account |
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
| Description | Organization this account belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### name
| Property | Value |
|----------|-------|
| Column Name | `name` |
| Type | `TEXT` |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 2 characters |
| Description | Legal or common name of the client company |
| UI Label | "Company Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Acme Corporation" |
| Validation | Not empty, alphanumeric with spaces allowed |
| Error Message | "Company name is required" |
| Searchable | Yes (included in search_vector) |
| Index | Yes (part of search_vector GIN index) |

---

### industry
| Property | Value |
|----------|-------|
| Column Name | `industry` |
| Type | `TEXT` |
| Required | No (recommended) |
| Description | Primary industry sector of the company |
| UI Label | "Industry" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Select industry..." |

**Common Values:**
| Value | Display Label |
|-------|---------------|
| `technology` | Technology |
| `healthcare` | Healthcare |
| `finance` | Finance / Banking |
| `manufacturing` | Manufacturing |
| `retail` | Retail |
| `consulting` | Consulting |
| `government` | Government |
| `education` | Education |
| `energy` | Energy |
| `telecommunications` | Telecommunications |
| `insurance` | Insurance |
| `pharmaceuticals` | Pharmaceuticals |
| `automotive` | Automotive |
| `aerospace` | Aerospace / Defense |

---

### company_type
| Property | Value |
|----------|-------|
| Column Name | `company_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'direct_client'` |
| Description | Type of business relationship |
| UI Label | "Company Type" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `direct_client` | Direct Client | Company hiring directly |
| `implementation_partner` | Implementation Partner | SI or consulting firm |
| `msp_vms` | MSP/VMS | Managed service provider or vendor management system |
| `system_integrator` | System Integrator | Large SI (Deloitte, Accenture, etc.) |
| `sub_vendor` | Sub-Vendor | Another staffing agency |

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'prospect'` |
| Description | Current account status in the relationship lifecycle |
| UI Label | "Status" |
| UI Type | Dropdown / Status Badge |
| Index | Yes (`idx_accounts_status`) |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `prospect` | Prospect | Purple | Potential client, not yet engaged |
| `active` | Active | Green | Current paying client |
| `inactive` | Inactive | Gray | Former client, dormant |
| `churned` | Churned | Red | Lost client |

---

### tier
| Property | Value |
|----------|-------|
| Column Name | `tier` |
| Type | `TEXT` |
| Required | No |
| Description | Client tier for prioritization and SLA |
| UI Label | "Tier" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `enterprise` | Enterprise | Gold | Large enterprise accounts, high volume |
| `mid_market` | Mid-Market | Silver | Medium-sized companies |
| `smb` | SMB | Bronze | Small and medium business |
| `strategic` | Strategic | Platinum | Key strategic accounts |

---

### account_manager_id
| Property | Value |
|----------|-------|
| Column Name | `account_manager_id` |
| Type | `UUID` |
| Required | No (recommended) |
| Foreign Key | `user_profiles(id)` |
| Description | Primary account manager responsible for this client |
| UI Label | "Account Manager" |
| UI Type | User Select (filtered to sales/account roles) |
| Default | Current user (on create) |
| Index | Yes (`idx_accounts_account_manager_id`) |

---

### responsiveness
| Property | Value |
|----------|-------|
| Column Name | `responsiveness` |
| Type | `TEXT` |
| Required | No |
| Description | How quickly client typically responds to submissions |
| UI Label | "Responsiveness" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `immediate` | Immediate | Responds within hours |
| `fast` | Fast | Responds within 1-2 days |
| `average` | Average | Responds within 3-5 days |
| `slow` | Slow | Takes 1+ week to respond |
| `inconsistent` | Inconsistent | Response time varies |

---

### preferred_quality
| Property | Value |
|----------|-------|
| Column Name | `preferred_quality` |
| Type | `TEXT` |
| Required | No |
| Description | Client's preference for candidate quality vs. quantity |
| UI Label | "Quality Preference" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `quality` | Quality-Focused | Fewer, highly qualified candidates |
| `volume` | Volume-Focused | Many candidates to choose from |
| `balanced` | Balanced | Mix of quality and quantity |

---

### description
| Property | Value |
|----------|-------|
| Column Name | `description` |
| Type | `TEXT` |
| Required | No |
| Max Length | 5000 characters |
| Description | Internal notes about the account, culture, working style |
| UI Label | "Description" |
| UI Type | Textarea |
| UI Placeholder | "Notes about this client..." |

---

### contract_start_date
| Property | Value |
|----------|-------|
| Column Name | `contract_start_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Start date of the client contract/agreement |
| UI Label | "Contract Start" |
| UI Type | Date Picker |
| UI Section | Business Terms |

---

### contract_end_date
| Property | Value |
|----------|-------|
| Column Name | `contract_end_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Validation | Must be >= contract_start_date |
| Description | End date of the client contract/agreement |
| UI Label | "Contract End" |
| UI Type | Date Picker |
| UI Section | Business Terms |
| Note | Null indicates evergreen contract |

---

### payment_terms_days
| Property | Value |
|----------|-------|
| Column Name | `payment_terms_days` |
| Type | `INTEGER` |
| Required | No |
| Default | 30 |
| Min | 0 |
| Max | 180 |
| Description | Number of days for invoice payment |
| UI Label | "Payment Terms" |
| UI Type | Dropdown with common values |
| UI Section | Business Terms |

**Common Values:**
| Value | Display Label |
|-------|---------------|
| 0 | Due on Receipt |
| 15 | Net 15 |
| 30 | Net 30 |
| 45 | Net 45 |
| 60 | Net 60 |
| 90 | Net 90 |

---

### markup_percentage
| Property | Value |
|----------|-------|
| Column Name | `markup_percentage` |
| Type | `NUMERIC(5,2)` |
| Required | No |
| Min | 0 |
| Max | 100 |
| Precision | 2 decimal places |
| Description | Default markup percentage for this account |
| UI Label | "Default Markup %" |
| UI Type | Percentage Input |
| UI Suffix | "%" |
| UI Section | Business Terms |
| Note | Used to calculate bill rate from pay rate |

---

### annual_revenue_target
| Property | Value |
|----------|-------|
| Column Name | `annual_revenue_target` |
| Type | `NUMERIC(12,2)` |
| Required | No |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Annual revenue target for this account |
| UI Label | "Annual Revenue Target" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Section | Business Terms |

---

### website
| Property | Value |
|----------|-------|
| Column Name | `website` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 characters |
| Description | Company website URL |
| UI Label | "Website" |
| UI Type | URL Input |
| UI Placeholder | "https://example.com" |
| Validation | Valid URL format |
| Error Message | "Please enter a valid URL" |

---

### headquarters_location
| Property | Value |
|----------|-------|
| Column Name | `headquarters_location` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Location of company headquarters |
| UI Label | "Headquarters" |
| UI Type | Text Input (with autocomplete) |
| UI Placeholder | "e.g., San Francisco, CA" |
| Autocomplete | Google Places API (optional) |

---

### phone
| Property | Value |
|----------|-------|
| Column Name | `phone` |
| Type | `TEXT` |
| Required | No |
| Max Length | 50 characters |
| Description | Main company phone number |
| UI Label | "Phone" |
| UI Type | Phone Input |
| UI Placeholder | "+1 (555) 123-4567" |
| Validation | Valid phone format |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp of creation |
| UI Display | Display only, formatted as "Created on [date]" |

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
| UI Display | Display only, formatted as "Last updated [date]" |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the account |
| UI Display | Display only, shows user name |

---

### updated_by
| Property | Value |
|----------|-------|
| Column Name | `updated_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who last updated the account |
| UI Display | Display only, shows user name |

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
| Type | `TEXT` (could be TSVECTOR) |
| Required | No |
| Description | Full-text search vector |
| Auto Update | Via trigger on INSERT/UPDATE |
| Includes | name, industry, description, headquarters_location |
| Index | GIN index for fast searching |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `accounts_pkey` | `id` | BTREE | Primary key |
| `idx_accounts_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_accounts_status` | `status` | BTREE | Status filtering |
| `idx_accounts_account_manager_id` | `account_manager_id` | BTREE | Manager lookup |
| `idx_accounts_deleted_at` | `deleted_at` | BTREE | Soft delete (WHERE NULL) |
| `idx_accounts_search` | `search_vector` | GIN | Full-text search |

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "accounts_org_isolation" ON accounts
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Search Vector Trigger
```sql
CREATE TRIGGER accounts_search_vector_update
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION accounts_search_vector_trigger();
```

### Auto-assign RCAI Trigger
```sql
CREATE TRIGGER accounts_auto_rcai
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_rcai();
```

---

## Related Tables

| Table | Relationship | FK Column |
|-------|--------------|-----------|
| organizations | Parent | `org_id` |
| user_profiles | Account Manager | `account_manager_id` |
| point_of_contacts | Children | `point_of_contacts.account_id` |
| leads | Children | `leads.account_id` |
| deals | Children | `deals.account_id` |
| jobs | Children | `jobs.account_id` |
| submissions | Children | `submissions.account_id` |
| placements | Children | `placements.account_id` |
| job_orders | Children | `job_orders.account_id` |
| object_owners | RCAI | Polymorphic |

---

## Business Rules

1. **Status Transitions:**
   - `prospect` → `active`: When first job/deal is created
   - `active` → `inactive`: When no activity for 6 months
   - `active` → `churned`: When client explicitly ends relationship
   - Any status → `active`: When new job/placement is created

2. **Account Manager Assignment:**
   - When account is created, creator becomes default Account Manager
   - Account Manager change triggers notification to old and new manager
   - Account Manager receives RCAI "Accountable" role automatically

3. **Tier Assignment:**
   - Enterprise: > $1M annual revenue potential
   - Mid-Market: $100K - $1M annual revenue potential
   - SMB: < $100K annual revenue potential
   - Strategic: High-profile accounts regardless of revenue

---

*Last Updated: 2024-11-30*
