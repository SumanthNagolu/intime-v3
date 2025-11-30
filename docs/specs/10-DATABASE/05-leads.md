# Leads Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `leads` |
| Schema | `public` |
| Purpose | Store sales leads for client acquisition and business development |
| Primary Owner | Talent Acquisition Specialist / Sales |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |

---

## Table Definition

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Lead Type
  lead_type TEXT NOT NULL DEFAULT 'company',

  -- Company Fields
  company_name TEXT,
  industry TEXT,
  company_type TEXT,
  company_size TEXT,
  website TEXT,
  headquarters TEXT,
  tier TEXT,
  company_description TEXT,

  -- Contact Fields
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL
      THEN first_name || ' ' || last_name
      ELSE company_name
    END
  ) STORED,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  decision_authority TEXT,
  preferred_contact_method TEXT DEFAULT 'email',

  -- Link to Account (for person leads)
  account_id UUID REFERENCES accounts(id),

  -- Lead Status
  status TEXT NOT NULL DEFAULT 'new',
  estimated_value NUMERIC(12,2),

  -- Source Tracking
  source TEXT,
  source_campaign_id UUID,

  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),

  -- Notes
  notes TEXT,

  -- BANT Qualification Scores (0-25 each, total 0-100)
  bant_budget INTEGER DEFAULT 0 CHECK (bant_budget >= 0 AND bant_budget <= 25),
  bant_authority INTEGER DEFAULT 0 CHECK (bant_authority >= 0 AND bant_authority <= 25),
  bant_need INTEGER DEFAULT 0 CHECK (bant_need >= 0 AND bant_need <= 25),
  bant_timeline INTEGER DEFAULT 0 CHECK (bant_timeline >= 0 AND bant_timeline <= 25),

  -- BANT Notes
  bant_budget_notes TEXT,
  bant_authority_notes TEXT,
  bant_need_notes TEXT,
  bant_timeline_notes TEXT,

  -- BANT Total Score (computed)
  bant_total_score INTEGER GENERATED ALWAYS AS (
    COALESCE(bant_budget, 0) + COALESCE(bant_authority, 0) +
    COALESCE(bant_need, 0) + COALESCE(bant_timeline, 0)
  ) STORED,

  -- Engagement
  last_contacted_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),

  -- Conversion
  converted_to_deal_id UUID REFERENCES deals(id),
  converted_to_account_id UUID REFERENCES accounts(id),
  converted_at TIMESTAMPTZ,
  lost_reason TEXT,

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
| Description | Unique identifier for the lead |
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
| Description | Organization this lead belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### lead_type
| Property | Value |
|----------|-------|
| Column Name | `lead_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'company'` |
| Allowed Values | `company`, `person` |
| Description | Whether this is a company lead or individual contact lead |
| UI Label | "Lead Type" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `company` | Company | Lead is a business/company |
| `person` | Individual Contact | Lead is a person at an existing account |

**Business Logic:**
- When `lead_type = 'company'`: `company_name` is required
- When `lead_type = 'person'`: `first_name`, `last_name`, and `account_id` are required

---

### company_name
| Property | Value |
|----------|-------|
| Column Name | `company_name` |
| Type | `TEXT` |
| Required | Conditional (required if `lead_type = 'company'`) |
| Max Length | 200 characters |
| Min Length | 2 characters |
| Description | Name of the company |
| UI Label | "Company Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Acme Corporation" |
| Searchable | Yes (included in search_vector with weight 'A') |
| Validation | Required when lead_type is 'company' |

---

### industry
| Property | Value |
|----------|-------|
| Column Name | `industry` |
| Type | `TEXT` |
| Required | No (recommended for company leads) |
| Description | Business industry or sector |
| UI Label | "Industry" |
| UI Type | Dropdown with autocomplete |
| Searchable | Yes (weight 'C') |

**Common Values:**
| Value | Display Label |
|-------|---------------|
| `technology` | Technology |
| `healthcare` | Healthcare |
| `financial_services` | Financial Services |
| `manufacturing` | Manufacturing |
| `retail` | Retail & E-commerce |
| `consulting` | Professional Services |
| `telecommunications` | Telecommunications |
| `energy` | Energy & Utilities |
| `government` | Government & Public Sector |
| `education` | Education |
| `other` | Other |

---

### company_type
| Property | Value |
|----------|-------|
| Column Name | `company_type` |
| Type | `TEXT` |
| Required | No |
| Description | Type of client relationship |
| UI Label | "Company Type" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `direct_client` | Direct Client | End client, direct hiring relationship |
| `implementation_partner` | Implementation Partner | Technology implementation firm |
| `msp_vms` | MSP/VMS | Managed Service Provider or Vendor Management System |
| `system_integrator` | System Integrator | Large-scale systems integration firm |

---

### company_size
| Property | Value |
|----------|-------|
| Column Name | `company_size` |
| Type | `TEXT` |
| Required | No |
| Description | Size of the company by employee count |
| UI Label | "Company Size" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Employee Range |
|-------|---------------|----------------|
| `small` | Small (1-50) | 1-50 employees |
| `medium` | Medium (51-500) | 51-500 employees |
| `large` | Large (501-5000) | 501-5000 employees |
| `enterprise` | Enterprise (5000+) | 5000+ employees |

---

### website
| Property | Value |
|----------|-------|
| Column Name | `website` |
| Type | `TEXT` |
| Required | No |
| Max Length | 255 characters |
| Description | Company website URL |
| UI Label | "Website" |
| UI Type | URL Input |
| UI Placeholder | "https://example.com" |
| Validation | Valid URL format |

---

### headquarters
| Property | Value |
|----------|-------|
| Column Name | `headquarters` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Company headquarters location |
| UI Label | "Headquarters" |
| UI Type | Text Input (with autocomplete) |
| UI Placeholder | "e.g., New York, NY" |

---

### tier
| Property | Value |
|----------|-------|
| Column Name | `tier` |
| Type | `TEXT` |
| Required | No |
| Description | Strategic importance tier |
| UI Label | "Account Tier" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `enterprise` | Enterprise | Purple | Large enterprise account |
| `mid_market` | Mid-Market | Blue | Mid-sized company |
| `smb` | SMB | Green | Small/medium business |
| `strategic` | Strategic | Gold | Strategically important |

---

### company_description
| Property | Value |
|----------|-------|
| Column Name | `company_description` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 characters |
| Description | Description of the company, its business, and why they're a good fit |
| UI Label | "Company Description" |
| UI Type | Textarea |
| UI Placeholder | "Enter company details..." |
| UI Rows | 4 |

---

### first_name
| Property | Value |
|----------|-------|
| Column Name | `first_name` |
| Type | `TEXT` |
| Required | Conditional (required if `lead_type = 'person'`) |
| Max Length | 100 characters |
| Description | Contact's first name |
| UI Label | "First Name" |
| UI Type | Text Input |
| UI Placeholder | "John" |
| Searchable | Yes (weight 'A') |

---

### last_name
| Property | Value |
|----------|-------|
| Column Name | `last_name` |
| Type | `TEXT` |
| Required | Conditional (required if `lead_type = 'person'`) |
| Max Length | 100 characters |
| Description | Contact's last name |
| UI Label | "Last Name" |
| UI Type | Text Input |
| UI Placeholder | "Smith" |
| Searchable | Yes (weight 'A') |

---

### full_name
| Property | Value |
|----------|-------|
| Column Name | `full_name` |
| Type | `TEXT` (GENERATED ALWAYS STORED) |
| Required | N/A (computed) |
| Formula | `first_name || ' ' || last_name` (or `company_name` if names null) |
| Description | Computed full name of contact or company |
| UI Display | Display only (computed field) |
| Searchable | No (use individual fields) |
| Note | Do not include in INSERT/UPDATE - auto-generated by database |

---

### title
| Property | Value |
|----------|-------|
| Column Name | `title` |
| Type | `TEXT` |
| Required | No |
| Max Length | 150 characters |
| Description | Contact's job title |
| UI Label | "Job Title" |
| UI Type | Text Input with autocomplete |
| UI Placeholder | "e.g., VP of Engineering" |

---

### email
| Property | Value |
|----------|-------|
| Column Name | `email` |
| Type | `TEXT` |
| Required | No (recommended) |
| Max Length | 255 characters |
| Description | Contact email address |
| UI Label | "Email" |
| UI Type | Email Input |
| UI Placeholder | "contact@example.com" |
| Validation | Valid email format |
| Searchable | Yes (weight 'B') |
| Index | Yes (`idx_leads_email`) |

---

### phone
| Property | Value |
|----------|-------|
| Column Name | `phone` |
| Type | `TEXT` |
| Required | No |
| Max Length | 50 characters |
| Description | Contact phone number |
| UI Label | "Phone" |
| UI Type | Phone Input |
| UI Placeholder | "+1 (555) 123-4567" |

---

### linkedin_url
| Property | Value |
|----------|-------|
| Column Name | `linkedin_url` |
| Type | `TEXT` |
| Required | No |
| Max Length | 255 characters |
| Description | LinkedIn profile URL |
| UI Label | "LinkedIn Profile" |
| UI Type | URL Input |
| UI Placeholder | "https://linkedin.com/in/..." |
| Validation | Valid LinkedIn URL format |

---

### decision_authority
| Property | Value |
|----------|-------|
| Column Name | `decision_authority` |
| Type | `TEXT` |
| Required | No |
| Description | Contact's level of decision-making authority |
| UI Label | "Decision Authority" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `decision_maker` | Decision Maker | Can sign contracts, final say |
| `influencer` | Influencer | Influences decisions, no final authority |
| `gatekeeper` | Gatekeeper | Controls access to decision makers |
| `end_user` | End User | Will use the service but doesn't decide |
| `champion` | Champion | Internal advocate for your solution |

---

### preferred_contact_method
| Property | Value |
|----------|-------|
| Column Name | `preferred_contact_method` |
| Type | `TEXT` |
| Required | No |
| Default | `'email'` |
| Description | Preferred way to contact this lead |
| UI Label | "Preferred Contact Method" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label |
|-------|---------------|
| `email` | Email |
| `phone` | Phone Call |
| `linkedin` | LinkedIn Message |

---

### account_id
| Property | Value |
|----------|-------|
| Column Name | `account_id` |
| Type | `UUID` |
| Required | Conditional (required if `lead_type = 'person'`) |
| Foreign Key | `accounts(id)` |
| Description | Account this contact belongs to (for person leads) |
| UI Label | "Account" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Search accounts..." |
| UI Visible | Only when `lead_type = 'person'` |
| Index | Yes (`idx_leads_account_id`) |

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'new'` |
| Allowed Values | `new`, `warm`, `hot`, `cold`, `converted`, `lost` |
| Description | Current lead qualification status |
| UI Label | "Status" |
| UI Type | Dropdown / Status Badge |
| Index | Yes (`idx_leads_status`) |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `new` | New | Gray | Just created, not yet contacted |
| `warm` | Warm | Yellow | Some interest shown |
| `hot` | Hot | Orange | High interest, actively engaged |
| `cold` | Cold | Blue | Low priority or disengaged |
| `converted` | Converted | Green | Converted to deal/account |
| `lost` | Lost | Red | Not interested or unqualified |

**Status Workflow:**
```
new → warm → hot → converted
  ↓      ↓      ↓
cold → cold → lost
```

---

### estimated_value
| Property | Value |
|----------|-------|
| Column Name | `estimated_value` |
| Type | `NUMERIC(12,2)` |
| Required | No |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Estimated potential revenue from this lead |
| UI Label | "Estimated Value" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Placeholder | "100000.00" |

---

### source
| Property | Value |
|----------|-------|
| Column Name | `source` |
| Type | `TEXT` |
| Required | No (recommended) |
| Description | How this lead was acquired |
| UI Label | "Lead Source" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label |
|-------|---------------|
| `linkedin` | LinkedIn |
| `referral` | Referral |
| `cold_outreach` | Cold Outreach |
| `inbound` | Inbound (Website/Form) |
| `event` | Event/Conference |
| `partner` | Partner Referral |
| `ad_campaign` | Ad Campaign |
| `other` | Other |

---

### source_campaign_id
| Property | Value |
|----------|-------|
| Column Name | `source_campaign_id` |
| Type | `UUID` |
| Required | No |
| Description | ID of marketing campaign that generated this lead |
| UI Label | "Campaign" |
| UI Type | Dropdown |
| UI Display | Optional, only if campaigns exist |
| Index | Yes (`idx_leads_source`) |
| Future Use | Will link to campaigns table when implemented |

---

### owner_id
| Property | Value |
|----------|-------|
| Column Name | `owner_id` |
| Type | `UUID` |
| Required | No (auto-assigned) |
| Foreign Key | `user_profiles(id)` |
| Description | Sales/TA specialist who owns this lead |
| UI Label | "Owner" |
| UI Type | User Select |
| Default | Current user (on create) |
| Index | Yes (`idx_leads_owner`) |

---

### notes
| Property | Value |
|----------|-------|
| Column Name | `notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 10000 characters |
| Description | General notes about the lead |
| UI Label | "Notes" |
| UI Type | Textarea |
| UI Placeholder | "Add notes about this lead..." |
| UI Rows | 6 |

---

### bant_budget
| Property | Value |
|----------|-------|
| Column Name | `bant_budget` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | 25 |
| Check Constraint | `bant_budget >= 0 AND bant_budget <= 25` |
| Description | BANT Budget score: Does the lead have budget allocated? |
| UI Label | "Budget (0-25)" |
| UI Type | Slider or Number Input |
| Part Of | BANT qualification framework |

**Scoring Guide:**
| Score | Description |
|-------|-------------|
| 0-6 | No budget / Unknown |
| 7-12 | Budget exists but not allocated |
| 13-18 | Budget allocated for this year |
| 19-25 | Budget approved and ready to spend |

---

### bant_authority
| Property | Value |
|----------|-------|
| Column Name | `bant_authority` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | 25 |
| Check Constraint | `bant_authority >= 0 AND bant_authority <= 25` |
| Description | BANT Authority score: Is contact a decision-maker? |
| UI Label | "Authority (0-25)" |
| UI Type | Slider or Number Input |
| Part Of | BANT qualification framework |

**Scoring Guide:**
| Score | Description |
|-------|-------------|
| 0-6 | End user / No authority |
| 7-12 | Influencer / Gatekeeper |
| 13-18 | Manager / Budget owner |
| 19-25 | Executive / Final decision maker |

---

### bant_need
| Property | Value |
|----------|-------|
| Column Name | `bant_need` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | 25 |
| Check Constraint | `bant_need >= 0 AND bant_need <= 25` |
| Description | BANT Need score: Does the lead have a clear business need? |
| UI Label | "Need (0-25)" |
| UI Type | Slider or Number Input |
| Part Of | BANT qualification framework |

**Scoring Guide:**
| Score | Description |
|-------|-------------|
| 0-6 | No identified need |
| 7-12 | Vague or future need |
| 13-18 | Clear need, not urgent |
| 19-25 | Critical business need |

---

### bant_timeline
| Property | Value |
|----------|-------|
| Column Name | `bant_timeline` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | 25 |
| Check Constraint | `bant_timeline >= 0 AND bant_timeline <= 25` |
| Description | BANT Timeline score: When will they make a decision? |
| UI Label | "Timeline (0-25)" |
| UI Type | Slider or Number Input |
| Part Of | BANT qualification framework |

**Scoring Guide:**
| Score | Description |
|-------|-------------|
| 0-6 | No timeline / Far future |
| 7-12 | Within 12 months |
| 13-18 | Within 6 months |
| 19-25 | Within 30 days |

---

### bant_budget_notes
| Property | Value |
|----------|-------|
| Column Name | `bant_budget_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | Notes explaining the budget score |
| UI Label | "Budget Notes" |
| UI Type | Textarea |
| UI Rows | 2 |
| UI Placeholder | "Explain budget situation..." |

---

### bant_authority_notes
| Property | Value |
|----------|-------|
| Column Name | `bant_authority_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | Notes explaining the authority score |
| UI Label | "Authority Notes" |
| UI Type | Textarea |
| UI Rows | 2 |
| UI Placeholder | "Who are the decision makers?" |

---

### bant_need_notes
| Property | Value |
|----------|-------|
| Column Name | `bant_need_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | Notes explaining the need score |
| UI Label | "Need Notes" |
| UI Type | Textarea |
| UI Rows | 2 |
| UI Placeholder | "What is their business need?" |

---

### bant_timeline_notes
| Property | Value |
|----------|-------|
| Column Name | `bant_timeline_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | Notes explaining the timeline score |
| UI Label | "Timeline Notes" |
| UI Type | Textarea |
| UI Rows | 2 |
| UI Placeholder | "When do they plan to decide?" |

---

### bant_total_score
| Property | Value |
|----------|-------|
| Column Name | `bant_total_score` |
| Type | `INTEGER` (GENERATED ALWAYS STORED) |
| Required | N/A (computed) |
| Min | 0 |
| Max | 100 |
| Formula | `SUM(bant_budget, bant_authority, bant_need, bant_timeline)` |
| Description | Total BANT qualification score (sum of all 4 components) |
| UI Display | Display only, with visual indicator |
| Index | Yes (`idx_leads_bant_total`) |
| Note | Do not include in INSERT/UPDATE - auto-generated by database |

**Score Ranges:**
| Score Range | Qualification Level | Color | Action |
|-------------|---------------------|-------|--------|
| 0-25 | Unqualified | Red | Nurture or disqualify |
| 26-50 | Low Qualified | Yellow | Continue qualification |
| 51-75 | Qualified | Blue | Prioritize engagement |
| 76-100 | Highly Qualified | Green | Fast-track to deal |

---

### last_contacted_at
| Property | Value |
|----------|-------|
| Column Name | `last_contacted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time this lead was contacted |
| UI Label | "Last Contacted" |
| UI Type | Display only (auto-updated) |
| Auto Update | Set when activity is logged |
| UI Format | Relative time (e.g., "2 days ago") |

---

### last_response_at
| Property | Value |
|----------|-------|
| Column Name | `last_response_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time lead responded to contact attempt |
| UI Label | "Last Response" |
| UI Type | Display only (auto-updated) |
| Auto Update | Set when inbound activity is logged |
| UI Format | Relative time (e.g., "1 week ago") |

---

### engagement_score
| Property | Value |
|----------|-------|
| Column Name | `engagement_score` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 100 |
| Check Constraint | `engagement_score >= 0 AND engagement_score <= 100` |
| Description | Overall engagement level based on interactions |
| UI Label | "Engagement Score" |
| UI Type | Display only with progress bar |
| Calculation | Based on frequency, recency, and quality of interactions |

**Score Calculation (Example Formula):**
- Recency: 40 points (contacted in last 7 days = 40, last 30 days = 20, etc.)
- Frequency: 30 points (5+ touches = 30, 3-4 touches = 20, 1-2 touches = 10)
- Response Rate: 30 points (responds > 50% = 30, 25-50% = 15, < 25% = 5)

---

### converted_to_deal_id
| Property | Value |
|----------|-------|
| Column Name | `converted_to_deal_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `deals(id)` |
| Description | Deal created from this lead |
| UI Label | "Converted to Deal" |
| UI Type | Link (when populated) |
| Auto Set | When `convert_lead_to_deal()` function called |
| UI Display | Read-only, links to deal detail page |

---

### converted_to_account_id
| Property | Value |
|----------|-------|
| Column Name | `converted_to_account_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `accounts(id)` |
| Description | Account created from this lead (for company leads) |
| UI Label | "Converted to Account" |
| UI Type | Link (when populated) |
| Auto Set | When `convert_lead_to_deal()` function called |
| UI Display | Read-only, links to account detail page |

---

### converted_at
| Property | Value |
|----------|-------|
| Column Name | `converted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When this lead was converted |
| UI Label | "Converted On" |
| UI Type | Display only |
| Auto Set | When status changed to 'converted' |
| UI Format | Date and time |

---

### lost_reason
| Property | Value |
|----------|-------|
| Column Name | `lost_reason` |
| Type | `TEXT` |
| Required | Conditional (required when status = 'lost') |
| Max Length | 500 characters |
| Description | Reason why lead was lost |
| UI Label | "Lost Reason" |
| UI Type | Dropdown with 'Other' option + text input |
| UI Visible | Only when status is 'lost' |

**Common Values:**
| Value | Display Label |
|-------|---------------|
| `no_budget` | No Budget |
| `no_need` | No Current Need |
| `timing` | Bad Timing |
| `competitor` | Went with Competitor |
| `unresponsive` | Unresponsive |
| `price` | Price Too High |
| `not_qualified` | Not Qualified |
| `other` | Other (specify) |

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
| UI Format | "Created on MMM DD, YYYY at HH:MM" |

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
| UI Format | "Last updated MMM DD, YYYY at HH:MM" |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the lead |
| UI Display | Display only (user name) |
| Auto Set | Set to `auth.uid()` on INSERT |

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
| Query Filter | `WHERE deleted_at IS NULL` (show active leads only) |
| Soft Delete | Set to `NOW()` instead of deleting row |

---

### search_vector
| Property | Value |
|----------|-------|
| Column Name | `search_vector` |
| Type | `TSVECTOR` |
| Required | No |
| Description | Full-text search vector for fast searching |
| Auto Update | Via trigger on INSERT/UPDATE |
| Includes Fields | company_name (A), first_name + last_name (A), email (B), industry (C) |
| Index | GIN index (`idx_leads_search`) for fast searching |
| Weights | A = highest, C = lowest |

**Trigger Function:**
```sql
CREATE OR REPLACE FUNCTION update_leads_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.first_name || ' ' || NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `leads_pkey` | `id` | BTREE | Primary key |
| `idx_leads_org` | `org_id` | BTREE | Tenant filtering (WHERE deleted_at IS NULL) |
| `idx_leads_status` | `status` | BTREE | Status filtering (WHERE deleted_at IS NULL) |
| `idx_leads_owner` | `owner_id` | BTREE | Owner lookup |
| `idx_leads_source` | `source_campaign_id` | BTREE | Campaign tracking |
| `idx_leads_email` | `email` | BTREE | Email lookup |
| `idx_leads_account_id` | `account_id` | BTREE | Account linkage (for person leads) |
| `idx_leads_bant_total` | `bant_total_score` | BTREE | BANT score filtering |
| `idx_leads_search` | `search_vector` | GIN | Full-text search |

**Index Creation:**
```sql
CREATE INDEX idx_leads_org ON leads(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_status ON leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_source ON leads(source_campaign_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_account_id ON leads(account_id);
CREATE INDEX idx_leads_bant_total ON leads(bant_total_score);
CREATE INDEX idx_leads_search ON leads USING GIN(search_vector);
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 1. Organization isolation (multi-tenancy)
CREATE POLICY "leads_org_isolation"
  ON leads
  FOR ALL
  USING (org_id = auth_org_id());

-- 2. Employees can view all leads in their org
CREATE POLICY "leads_employee_select"
  ON leads
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('ta_specialist')
  );

-- 3. Lead owners can update their leads
CREATE POLICY "leads_owner_update"
  ON leads
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    owner_id = auth.uid() OR
    created_by = auth.uid()
  );

-- 4. Employees and TA specialists can create leads
CREATE POLICY "leads_employee_insert"
  ON leads
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('ta_specialist')
  );
```

**Policy Explanation:**
- **leads_org_isolation**: All operations must be within user's organization
- **leads_employee_select**: Employees, admins, and TA specialists can view all leads
- **leads_owner_update**: Only lead owners, creators, or admins can update
- **leads_employee_insert**: Employees, admins, and TA specialists can create leads

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Purpose:** Automatically updates `updated_at` timestamp on any row update

---

### Search Vector Trigger
```sql
CREATE TRIGGER trigger_leads_search_vector
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_search_vector();
```

**Purpose:** Maintains full-text search index for fast searching

**Fields Indexed:**
- company_name (weight A - highest)
- first_name + last_name (weight A)
- email (weight B)
- industry (weight C)

---

## Related Tables

| Table | Relationship | FK Column | Description |
|-------|--------------|-----------|-------------|
| `organizations` | Parent | `org_id` | Multi-tenant organization |
| `user_profiles` | Owner | `owner_id` | Lead owner |
| `user_profiles` | Creator | `created_by` | User who created lead |
| `accounts` | Parent | `account_id` | Linked account (person leads) |
| `accounts` | Conversion | `converted_to_account_id` | Account created from lead |
| `deals` | Conversion | `converted_to_deal_id` | Deal created from lead |
| `activities` | Children | Polymorphic (`entity_type='lead'`, `entity_id=lead.id`) | Tasks, notes, calls, emails |
| `activity_log` | Children | Polymorphic (`entity_type='lead'`, `entity_id=lead.id`) | Communication history |

**Note on Tasks:**
Lead tasks are now tracked via the unified `activities` table using polymorphic relationships:
```sql
-- Query tasks for a lead
SELECT * FROM activities
WHERE entity_type = 'lead'
  AND entity_id = :lead_id
  AND activity_type IN ('task', 'follow_up');
```

---

## Business Rules

### Lead Type Validation

**Rule:** Field requirements vary based on `lead_type`

```typescript
// Company Lead Requirements
if (lead_type === 'company') {
  required: ['company_name']
  recommended: ['industry', 'company_size', 'tier']
  optional: ['first_name', 'last_name'] // Primary contact
  invalid: ['account_id'] // Should be null
}

// Person Lead Requirements
if (lead_type === 'person') {
  required: ['first_name', 'last_name', 'account_id']
  recommended: ['email', 'title', 'decision_authority']
  optional: ['company_name'] // Auto-filled from account
  invalid: ['company_size', 'tier'] // Use account's values
}
```

---

### BANT Scoring System

**Rule:** BANT (Budget, Authority, Need, Timeline) qualification uses 0-100 scale

**Component Scores:**
- Each component: 0-25 points
- Total score: 0-100 points (computed field)

**Scoring Guidelines:**

| Component | 0-6 (Low) | 7-12 (Medium) | 13-18 (Good) | 19-25 (Excellent) |
|-----------|-----------|---------------|--------------|-------------------|
| **Budget** | No budget | Budget exists | Allocated this year | Approved & ready |
| **Authority** | End user | Influencer | Manager | Executive/DM |
| **Need** | No need | Future need | Clear need | Critical need |
| **Timeline** | No timeline | 12 months | 6 months | 30 days |

**Lead Qualification Levels:**
```
0-25:   Unqualified (nurture or disqualify)
26-50:  Low Qualified (continue qualification)
51-75:  Qualified (prioritize engagement)
76-100: Highly Qualified (fast-track to deal)
```

**UI Display:**
```typescript
// Color coding for total BANT score
const getBantColor = (score: number) => {
  if (score >= 76) return 'green';   // Highly qualified
  if (score >= 51) return 'blue';    // Qualified
  if (score >= 26) return 'yellow';  // Low qualified
  return 'red';                       // Unqualified
};
```

---

### Lead Status Workflow

**Rule:** Lead status follows qualification progression

**Status Flow:**
```
new (initial state)
  ↓ (qualification starts)
warm (interest shown)
  ↓ (engagement increases)
hot (highly engaged)
  ↓ (ready for conversion)
converted (deal created)

From any state:
  → cold (disengaged, low priority)
  → lost (disqualified or rejected)
```

**Automatic Status Updates:**
```sql
-- Auto-set status to 'converted' when deal created
UPDATE leads
SET status = 'converted',
    converted_at = NOW()
WHERE id = :lead_id
  AND converted_to_deal_id IS NOT NULL;
```

---

### Lead Conversion Rules

**Rule:** Converting a lead to a deal may create an account

**Conversion Logic:**
```sql
-- For company leads: create account if not exists
IF lead_type = 'company' AND converted_to_account_id IS NULL THEN
  -- Create account from lead data
  INSERT INTO accounts (org_id, name, industry, ...)
  SELECT org_id, company_name, industry, ... FROM leads WHERE id = :lead_id;

  -- Link lead to new account
  UPDATE leads SET converted_to_account_id = :new_account_id;
END IF;

-- For person leads: use existing account_id
IF lead_type = 'person' THEN
  -- Use existing account_id for deal
  -- Optionally create point_of_contact record
END IF;

-- Create deal
INSERT INTO deals (org_id, lead_id, account_id, ...)
VALUES (:org_id, :lead_id, :account_id, ...);

-- Update lead
UPDATE leads
SET status = 'converted',
    converted_to_deal_id = :new_deal_id,
    converted_at = NOW()
WHERE id = :lead_id;
```

**Use Function:**
```sql
-- Built-in conversion function
SELECT convert_lead_to_deal(
  p_lead_id => :lead_id,
  p_deal_title => 'Q1 Staffing Partnership',
  p_deal_value => 150000.00,
  p_deal_stage => 'discovery'
);
```

---

### Engagement Scoring

**Rule:** Engagement score reflects interaction quality and recency

**Score Components:**
```typescript
// Example scoring algorithm
const calculateEngagementScore = (lead: Lead) => {
  let score = 0;

  // Recency (40 points max)
  const daysSinceContact = daysBetween(lead.last_contacted_at, now());
  if (daysSinceContact <= 7) score += 40;
  else if (daysSinceContact <= 30) score += 20;
  else if (daysSinceContact <= 90) score += 10;

  // Response rate (30 points max)
  const responseRate = lead.responses / lead.outreach_count;
  if (responseRate > 0.5) score += 30;
  else if (responseRate > 0.25) score += 15;
  else if (responseRate > 0) score += 5;

  // Touch frequency (30 points max)
  const touchCount = getTouchCount(lead.id);
  if (touchCount >= 5) score += 30;
  else if (touchCount >= 3) score += 20;
  else if (touchCount >= 1) score += 10;

  return Math.min(score, 100);
};
```

**Auto-Update Triggers:**
```sql
-- Update engagement score when activity logged
CREATE OR REPLACE FUNCTION update_lead_engagement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads
  SET last_contacted_at = NEW.activity_date
  WHERE id = NEW.entity_id
    AND NEW.entity_type = 'lead'
    AND NEW.direction = 'outbound';

  UPDATE leads
  SET last_response_at = NEW.activity_date
  WHERE id = NEW.entity_id
    AND NEW.entity_type = 'lead'
    AND NEW.direction = 'inbound';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Lead Assignment Rules

**Rule:** Leads can be auto-assigned based on territory, industry, or round-robin

**Assignment Strategies:**
```typescript
// Territory-based
if (lead.headquarters in ['NY', 'NJ', 'CT']) {
  owner_id = findUserByTerritory('northeast');
}

// Industry-based
if (lead.industry === 'healthcare') {
  owner_id = findUserBySpecialization('healthcare');
}

// Round-robin (default)
owner_id = getNextUserInQueue('ta_specialist');
```

---

### Data Quality Rules

**Rule:** Enforce data completeness based on lead status

**Required Fields by Status:**
```typescript
const requiredFields = {
  new: ['company_name OR first_name+last_name', 'email OR phone'],
  warm: ['...new', 'bant_budget', 'bant_need'],
  hot: ['...warm', 'bant_authority', 'bant_timeline'],
  converted: ['...hot', 'converted_to_deal_id'],
  lost: ['...any', 'lost_reason']
};
```

**Validation:**
```sql
-- Prevent status = 'lost' without reason
ALTER TABLE leads
  ADD CONSTRAINT check_lost_reason
  CHECK (
    status != 'lost' OR lost_reason IS NOT NULL
  );
```

---

### Lead Deduplication

**Rule:** Prevent duplicate leads based on email or company name

**Deduplication Check:**
```sql
-- Check for existing lead before insert
SELECT id, status FROM leads
WHERE deleted_at IS NULL
  AND org_id = :org_id
  AND (
    (email IS NOT NULL AND email = :new_email)
    OR
    (company_name IS NOT NULL AND LOWER(company_name) = LOWER(:new_company_name))
  );

-- If found: prompt to merge or update existing lead
-- If not found: create new lead
```

**Merge Strategy:**
- Prioritize most recent data
- Preserve all BANT scores (take highest)
- Merge notes fields
- Keep most engaged lead as primary

---

### Activity Tracking

**Rule:** All lead interactions must be logged to `activity_log`

**Required Activities:**
```sql
-- Log activity when:
-- 1. Email sent
INSERT INTO activity_log (
  org_id, entity_type, entity_id,
  activity_type, subject, direction, performed_by
) VALUES (
  :org_id, 'lead', :lead_id,
  'email', 'Follow-up on staffing needs', 'outbound', :user_id
);

-- 2. Call made
INSERT INTO activity_log (
  org_id, entity_type, entity_id,
  activity_type, duration_minutes, outcome, performed_by
) VALUES (
  :org_id, 'lead', :lead_id,
  'call', 15, 'positive', :user_id
);

-- 3. Meeting scheduled
INSERT INTO activity_log (
  org_id, entity_type, entity_id,
  activity_type, subject, next_action, next_action_date
) VALUES (
  :org_id, 'lead', :lead_id,
  'meeting', 'Discovery call', 'Send proposal', :meeting_date + '7 days'
);
```

---

### Performance Metrics

**Key Lead Metrics:**

```sql
-- Conversion Rate
SELECT
  COUNT(*) FILTER (WHERE status = 'converted') * 100.0 / COUNT(*) as conversion_rate
FROM leads
WHERE created_at >= NOW() - INTERVAL '90 days';

-- Average Time to Convert
SELECT
  AVG(EXTRACT(DAY FROM (converted_at - created_at))) as avg_days_to_convert
FROM leads
WHERE status = 'converted';

-- Average BANT Score by Status
SELECT
  status,
  AVG(bant_total_score) as avg_bant_score
FROM leads
GROUP BY status;

-- Lead Source Performance
SELECT
  source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'converted') as converted,
  AVG(bant_total_score) as avg_qualification
FROM leads
GROUP BY source
ORDER BY converted DESC;
```

---

## SQL Functions

### convert_lead_to_deal()

**Purpose:** Convert a qualified lead to a deal (and optionally create an account)

```sql
CREATE OR REPLACE FUNCTION convert_lead_to_deal(
  p_lead_id UUID,
  p_deal_title TEXT,
  p_deal_value NUMERIC,
  p_deal_stage TEXT DEFAULT 'discovery'
)
RETURNS UUID AS $$
DECLARE
  v_lead leads;
  v_account_id UUID;
  v_deal_id UUID;
BEGIN
  -- Get lead details
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Create account if company lead and not already converted
  IF v_lead.lead_type = 'company' AND v_lead.converted_to_account_id IS NULL THEN
    INSERT INTO accounts (
      org_id, name, industry, status, created_by
    ) VALUES (
      v_lead.org_id,
      v_lead.company_name,
      v_lead.industry,
      'prospect',
      auth.uid()
    ) RETURNING id INTO v_account_id;

    -- Update lead with account reference
    UPDATE leads SET converted_to_account_id = v_account_id WHERE id = p_lead_id;
  ELSE
    v_account_id := v_lead.converted_to_account_id;
  END IF;

  -- Create deal
  INSERT INTO deals (
    org_id, lead_id, account_id, title, value, stage, owner_id, created_by
  ) VALUES (
    v_lead.org_id, p_lead_id, v_account_id,
    p_deal_title, p_deal_value, p_deal_stage,
    v_lead.owner_id, auth.uid()
  ) RETURNING id INTO v_deal_id;

  -- Update lead status
  UPDATE leads SET
    status = 'converted',
    converted_to_deal_id = v_deal_id,
    converted_at = NOW()
  WHERE id = p_lead_id;

  -- Log activity
  INSERT INTO activity_log (
    org_id, entity_type, entity_id, activity_type,
    subject, body, performed_by, activity_date
  ) VALUES (
    v_lead.org_id, 'lead', p_lead_id, 'note',
    'Lead converted to deal',
    format('Lead converted to deal: %s', p_deal_title),
    auth.uid(), NOW()
  );

  RETURN v_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage:**
```sql
SELECT convert_lead_to_deal(
  p_lead_id => 'uuid-of-lead',
  p_deal_title => 'Q1 2025 Staffing Contract',
  p_deal_value => 250000.00,
  p_deal_stage => 'proposal'
);
```

---

## Example Queries

### Find Hot Leads Ready for Conversion
```sql
SELECT
  id,
  company_name,
  full_name,
  status,
  bant_total_score,
  engagement_score,
  owner_id
FROM leads
WHERE deleted_at IS NULL
  AND org_id = :org_id
  AND status IN ('warm', 'hot')
  AND bant_total_score >= 75
  AND engagement_score >= 60
ORDER BY bant_total_score DESC, engagement_score DESC
LIMIT 20;
```

### Leads Requiring Follow-Up
```sql
SELECT
  id,
  company_name,
  full_name,
  status,
  last_contacted_at,
  EXTRACT(DAY FROM (NOW() - last_contacted_at)) as days_since_contact
FROM leads
WHERE deleted_at IS NULL
  AND org_id = :org_id
  AND status IN ('new', 'warm', 'hot')
  AND (
    last_contacted_at IS NULL
    OR last_contacted_at < NOW() - INTERVAL '7 days'
  )
ORDER BY last_contacted_at ASC NULLS FIRST;
```

### BANT Score Distribution
```sql
SELECT
  CASE
    WHEN bant_total_score >= 76 THEN 'Highly Qualified (76-100)'
    WHEN bant_total_score >= 51 THEN 'Qualified (51-75)'
    WHEN bant_total_score >= 26 THEN 'Low Qualified (26-50)'
    ELSE 'Unqualified (0-25)'
  END as qualification_level,
  COUNT(*) as lead_count,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_count
FROM leads
WHERE deleted_at IS NULL
  AND org_id = :org_id
GROUP BY qualification_level
ORDER BY MIN(bant_total_score) DESC;
```

### Lead Pipeline by Owner
```sql
SELECT
  u.first_name || ' ' || u.last_name as owner_name,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE status = 'warm') as warm_leads,
  COUNT(*) FILTER (WHERE status = 'hot') as hot_leads,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_leads,
  AVG(bant_total_score) as avg_bant_score,
  AVG(engagement_score) as avg_engagement_score
FROM leads l
JOIN user_profiles u ON l.owner_id = u.id
WHERE l.deleted_at IS NULL
  AND l.org_id = :org_id
GROUP BY u.id, owner_name
ORDER BY converted_leads DESC;
```

### Full-Text Search
```sql
SELECT
  id,
  company_name,
  full_name,
  email,
  status,
  bant_total_score,
  ts_rank(search_vector, query) as rank
FROM leads, to_tsquery('english', :search_term) query
WHERE deleted_at IS NULL
  AND org_id = :org_id
  AND search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

---

*Last Updated: 2025-11-30*
