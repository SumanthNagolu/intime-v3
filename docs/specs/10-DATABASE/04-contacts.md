# Contacts Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `contacts` |
| Schema | `public` |
| Purpose | Universal contacts table for all contact types (client POCs, candidates, vendors, partners, internal, general) |
| Primary Owner | Variable (based on contact type) |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |

---

## Table Definition

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Contact Type
  contact_type TEXT NOT NULL DEFAULT 'general',

  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL
      THEN first_name || ' ' || last_name
      WHEN first_name IS NOT NULL THEN first_name
      WHEN last_name IS NOT NULL THEN last_name
      ELSE NULL
    END
  ) STORED,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  linkedin_url TEXT,

  -- Avatar
  avatar_url TEXT,

  -- Professional Information
  title TEXT,
  company_name TEXT,
  company_id UUID REFERENCES accounts(id),
  department TEXT,

  -- Work Location
  work_location TEXT,
  timezone TEXT DEFAULT 'America/New_York',

  -- Communication Preferences
  preferred_contact_method TEXT DEFAULT 'email',
  best_time_to_contact TEXT,
  do_not_call_before TEXT,
  do_not_call_after TEXT,

  -- Status & Preferences
  status TEXT NOT NULL DEFAULT 'active',

  -- Source Tracking
  source TEXT,
  source_detail TEXT,
  source_campaign_id UUID REFERENCES campaigns(id),

  -- For candidates: link to user_profile
  user_profile_id UUID REFERENCES user_profiles(id),

  -- Engagement Tracking
  last_contacted_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  total_interactions INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,

  -- Social Media
  twitter_url TEXT,
  github_url TEXT,

  -- Decision Making (for client POCs)
  decision_authority TEXT,
  buying_role TEXT,
  influence_level TEXT,

  -- Tags & Notes
  tags TEXT[],
  notes TEXT,
  internal_notes TEXT,

  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),

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
| Description | Unique identifier for the contact |
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
| Description | Organization this contact belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### contact_type
| Property | Value |
|----------|-------|
| Column Name | `contact_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'general'` |
| Allowed Values | `client_poc`, `candidate`, `vendor`, `partner`, `internal`, `general` |
| Description | Type of contact for classification |
| UI Label | "Contact Type" |
| UI Type | Dropdown |
| Index | Yes (`idx_contacts_contact_type`) |

**Enum Values:**
| Value | Display Label | Description | Color |
|-------|---------------|-------------|-------|
| `client_poc` | Client POC | Client point of contact | `bg-blue-100 text-blue-700` |
| `candidate` | Candidate | Job candidate/talent | `bg-green-100 text-green-700` |
| `vendor` | Vendor | Vendor/supplier contact | `bg-purple-100 text-purple-700` |
| `partner` | Partner | Business partner | `bg-amber-100 text-amber-700` |
| `internal` | Internal | Internal employee | `bg-stone-100 text-stone-700` |
| `general` | General | General contact | `bg-gray-100 text-gray-600` |

---

### first_name
| Property | Value |
|----------|-------|
| Column Name | `first_name` |
| Type | `TEXT` |
| Required | No (at least first_name OR last_name required in UI) |
| Max Length | 100 characters |
| Description | Contact's first name |
| UI Label | "First Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., John" |
| Validation | No special characters except `-`, `'`, `.` |
| Error Message | "First name or last name is required" |
| Searchable | Yes (included in search_vector) |

---

### last_name
| Property | Value |
|----------|-------|
| Column Name | `last_name` |
| Type | `TEXT` |
| Required | No (at least first_name OR last_name required in UI) |
| Max Length | 100 characters |
| Description | Contact's last name |
| UI Label | "Last Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Smith" |
| Validation | No special characters except `-`, `'`, `.` |
| Error Message | "First name or last name is required" |
| Searchable | Yes (included in search_vector) |

---

### full_name
| Property | Value |
|----------|-------|
| Column Name | `full_name` |
| Type | `TEXT` |
| Required | No |
| Generated | Yes (GENERATED ALWAYS AS) |
| Formula | `CONCAT(first_name, ' ', last_name)` with NULL handling |
| Description | Auto-generated full name from first_name and last_name |
| UI Display | Read-only computed field |
| Searchable | Yes |
| Note | Managed by database, not editable in application |

---

### email
| Property | Value |
|----------|-------|
| Column Name | `email` |
| Type | `TEXT` |
| Required | No (recommended for most contact types) |
| Max Length | 255 characters |
| Description | Contact's email address |
| UI Label | "Email" |
| UI Type | Email Input |
| UI Placeholder | "john.smith@example.com" |
| Validation | Valid email format (RFC 5322) |
| Error Message | "Please enter a valid email address" |
| Unique | No (same person can be in multiple orgs) |
| Searchable | Yes |
| Index | Yes (`idx_contacts_email`) |

---

### phone
| Property | Value |
|----------|-------|
| Column Name | `phone` |
| Type | `TEXT` |
| Required | No |
| Max Length | 50 characters |
| Description | Contact's primary phone number |
| UI Label | "Phone" |
| UI Type | Phone Input |
| UI Placeholder | "(555) 123-4567" |
| Format | E.164 recommended (e.g., +1-555-123-4567) |
| Validation | Valid phone number format |
| Searchable | Yes |

---

### mobile
| Property | Value |
|----------|-------|
| Column Name | `mobile` |
| Type | `TEXT` |
| Required | No |
| Max Length | 50 characters |
| Description | Contact's mobile/cell phone number |
| UI Label | "Mobile" |
| UI Type | Phone Input |
| UI Placeholder | "(555) 987-6543" |
| Format | E.164 recommended |
| Note | Separate from phone for SMS/WhatsApp targeting |

---

### linkedin_url
| Property | Value |
|----------|-------|
| Column Name | `linkedin_url` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 characters |
| Description | LinkedIn profile URL |
| UI Label | "LinkedIn Profile" |
| UI Type | URL Input |
| UI Placeholder | "https://linkedin.com/in/username" |
| Validation | Must be valid LinkedIn URL format |
| Error Message | "Please enter a valid LinkedIn URL" |

---

### avatar_url
| Property | Value |
|----------|-------|
| Column Name | `avatar_url` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | URL to contact's profile picture/avatar |
| UI Label | "Avatar" |
| UI Type | Image Upload / URL Input |
| Storage | Supabase Storage bucket: `avatars/contacts/` |
| Fallback | Generate initials avatar from full_name |

---

### title
| Property | Value |
|----------|-------|
| Column Name | `title` |
| Type | `TEXT` |
| Required | No (recommended for client_poc) |
| Max Length | 200 characters |
| Description | Contact's job title/position |
| UI Label | "Job Title" |
| UI Type | Text Input with autocomplete |
| UI Placeholder | "e.g., VP of Engineering" |
| Autocomplete | Common job titles |
| Searchable | Yes |

---

### company_name
| Property | Value |
|----------|-------|
| Column Name | `company_name` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Company name (free text, used when company_id not set) |
| UI Label | "Company Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Acme Corp" |
| Note | Use when contact not linked to formal account |
| Searchable | Yes |

---

### company_id
| Property | Value |
|----------|-------|
| Column Name | `company_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `accounts(id)` |
| Description | Link to formal account/company record |
| UI Label | "Company" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Search companies..." |
| Validation | Must be active account in same org |
| Index | Yes (`idx_contacts_company_id`) |
| Note | When set, overrides company_name in display |

---

### department
| Property | Value |
|----------|-------|
| Column Name | `department` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Department within company |
| UI Label | "Department" |
| UI Type | Text Input with autocomplete |
| UI Placeholder | "e.g., Engineering, HR, Sales" |
| Common Values | Engineering, HR, Sales, Marketing, Finance, Operations |

---

### work_location
| Property | Value |
|----------|-------|
| Column Name | `work_location` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Contact's work location (city, state, country) |
| UI Label | "Work Location" |
| UI Type | Text Input with autocomplete |
| UI Placeholder | "e.g., San Francisco, CA" |
| Autocomplete | Google Places API (optional) |

---

### timezone
| Property | Value |
|----------|-------|
| Column Name | `timezone` |
| Type | `TEXT` |
| Required | No |
| Default | `'America/New_York'` |
| Allowed Values | IANA timezone names |
| Description | Contact's timezone for scheduling calls |
| UI Label | "Timezone" |
| UI Type | Dropdown (searchable) |
| Common Values | America/New_York, America/Chicago, America/Los_Angeles, Europe/London, Asia/Kolkata |
| Use Case | Scheduling calls, respecting do-not-call times |

---

### preferred_contact_method
| Property | Value |
|----------|-------|
| Column Name | `preferred_contact_method` |
| Type | `TEXT` |
| Required | No |
| Default | `'email'` |
| Allowed Values | `email`, `phone`, `mobile`, `linkedin`, `text` |
| Description | Contact's preferred communication method |
| UI Label | "Preferred Contact Method" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Icon |
|-------|---------------|------|
| `email` | Email | Mail |
| `phone` | Phone | Phone |
| `mobile` | Mobile | Smartphone |
| `linkedin` | LinkedIn | Linkedin |
| `text` | Text/SMS | MessageSquare |

---

### best_time_to_contact
| Property | Value |
|----------|-------|
| Column Name | `best_time_to_contact` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Free text description of best time to contact |
| UI Label | "Best Time to Contact" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Weekdays 2-4pm EST" |
| Example Values | "Morning", "Afternoon", "Weekdays 9-5", "After 6pm" |

---

### do_not_call_before
| Property | Value |
|----------|-------|
| Column Name | `do_not_call_before` |
| Type | `TEXT` |
| Required | No |
| Format | Time string (HH:MM AM/PM) |
| Description | Don't call before this time (in contact's timezone) |
| UI Label | "Don't Call Before" |
| UI Type | Time Picker |
| UI Placeholder | "9:00 AM" |
| Validation | Must be valid time format |
| Use Case | Respect contact preferences, auto-enforce in dialer |

---

### do_not_call_after
| Property | Value |
|----------|-------|
| Column Name | `do_not_call_after` |
| Type | `TEXT` |
| Required | No |
| Format | Time string (HH:MM AM/PM) |
| Description | Don't call after this time (in contact's timezone) |
| UI Label | "Don't Call After" |
| UI Type | Time Picker |
| UI Placeholder | "6:00 PM" |
| Validation | Must be valid time format, must be after do_not_call_before |
| Error Message | "End time must be after start time" |

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'active'` |
| Allowed Values | `active`, `inactive`, `do_not_contact`, `bounced`, `unsubscribed` |
| Description | Contact's current status |
| UI Label | "Status" |
| UI Type | Dropdown / Status Badge |
| Index | Yes (`idx_contacts_status`) |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `active` | Active | `bg-green-100 text-green-700` | Can be contacted |
| `inactive` | Inactive | `bg-stone-100 text-stone-500` | Not currently engaged |
| `do_not_contact` | Do Not Contact | `bg-red-100 text-red-700` | Legal/preference - never contact |
| `bounced` | Bounced | `bg-amber-100 text-amber-700` | Email bounced |
| `unsubscribed` | Unsubscribed | `bg-purple-100 text-purple-700` | Opted out of communications |

---

### source
| Property | Value |
|----------|-------|
| Column Name | `source` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | High-level source of contact |
| UI Label | "Source" |
| UI Type | Dropdown with custom option |
| Searchable | Yes |

**Common Values:**
| Value | Display Label |
|-------|---------------|
| `referral` | Referral |
| `linkedin` | LinkedIn |
| `job_board` | Job Board |
| `website` | Website |
| `event` | Event/Conference |
| `cold_outreach` | Cold Outreach |
| `partner` | Partner |
| `campaign` | Marketing Campaign |
| `manual` | Manual Entry |

---

### source_detail
| Property | Value |
|----------|-------|
| Column Name | `source_detail` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 characters |
| Description | Detailed source information (referrer name, event name, etc.) |
| UI Label | "Source Details" |
| UI Type | Text Input |
| UI Placeholder | "e.g., John referred, AWS Re:Invent 2024" |

---

### source_campaign_id
| Property | Value |
|----------|-------|
| Column Name | `source_campaign_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `campaigns(id)` |
| Description | Link to marketing/TA campaign that sourced this contact |
| UI Label | "Source Campaign" |
| UI Type | Dropdown |
| Index | Yes (`idx_contacts_source_campaign_id`) |

---

### user_profile_id
| Property | Value |
|----------|-------|
| Column Name | `user_profile_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | Link to user profile (for candidates who become users) |
| UI Label | "User Profile" |
| UI Display | Hidden (auto-linked when candidate creates account) |
| Index | Yes (`idx_contacts_user_profile_id`) |
| Use Case | When contact_type = 'candidate' and they register |

---

### last_contacted_at
| Property | Value |
|----------|-------|
| Column Name | `last_contacted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time we reached out to this contact |
| UI Label | "Last Contacted" |
| UI Type | Display only (auto-updated) |
| Auto Update | Set when activity created with direction='outbound' |
| Display Format | Relative (e.g., "2 days ago") |

---

### last_response_at
| Property | Value |
|----------|-------|
| Column Name | `last_response_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time contact responded to us |
| UI Label | "Last Response" |
| UI Type | Display only (auto-updated) |
| Auto Update | Set when activity created with direction='inbound' |
| Display Format | Relative (e.g., "5 hours ago") |

---

### total_interactions
| Property | Value |
|----------|-------|
| Column Name | `total_interactions` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Total number of interactions (calls, emails, meetings) |
| UI Label | "Interactions" |
| UI Type | Display only (auto-incremented) |
| Auto Update | Incremented when activity created for this contact |

---

### engagement_score
| Property | Value |
|----------|-------|
| Column Name | `engagement_score` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | 100 |
| Description | Calculated engagement score (0-100) |
| UI Label | "Engagement Score" |
| UI Type | Display only with visual indicator |
| Calculation | Based on recency, frequency, response rate |
| Display | Progress bar + number |

**Scoring Algorithm:**
- Recency (40%): Days since last_response_at
- Frequency (30%): total_interactions in last 90 days
- Response Rate (30%): (responses / outbound contacts) * 100

---

### twitter_url
| Property | Value |
|----------|-------|
| Column Name | `twitter_url` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 characters |
| Description | Twitter/X profile URL |
| UI Label | "Twitter/X" |
| UI Type | URL Input |
| UI Placeholder | "https://twitter.com/username" |
| Validation | Valid Twitter URL format |

---

### github_url
| Property | Value |
|----------|-------|
| Column Name | `github_url` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 characters |
| Description | GitHub profile URL |
| UI Label | "GitHub" |
| UI Type | URL Input |
| UI Placeholder | "https://github.com/username" |
| Validation | Valid GitHub URL format |
| Use Case | Tech talent sourcing |

---

### decision_authority
| Property | Value |
|----------|-------|
| Column Name | `decision_authority` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Level of decision-making authority (for client POCs) |
| UI Label | "Decision Authority" |
| UI Type | Dropdown |
| UI Visible | Only when contact_type = 'client_poc' |

**Allowed Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `final_decision_maker` | Final Decision Maker | Can sign contracts alone |
| `key_influencer` | Key Influencer | Strong influence on decision |
| `gatekeeper` | Gatekeeper | Controls access to decision makers |
| `recommender` | Recommender | Provides recommendations |
| `end_user` | End User | Will use service but doesn't decide |

---

### buying_role
| Property | Value |
|----------|-------|
| Column Name | `buying_role` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Role in buying process (for client POCs) |
| UI Label | "Buying Role" |
| UI Type | Dropdown |
| UI Visible | Only when contact_type = 'client_poc' |

**Allowed Values:**
| Value | Display Label |
|-------|---------------|
| `champion` | Champion |
| `economic_buyer` | Economic Buyer |
| `technical_buyer` | Technical Buyer |
| `coach` | Coach |
| `blocker` | Blocker |

---

### influence_level
| Property | Value |
|----------|-------|
| Column Name | `influence_level` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `low`, `medium`, `high` |
| Description | Overall influence level (for client POCs) |
| UI Label | "Influence Level" |
| UI Type | Radio Buttons |
| UI Visible | Only when contact_type = 'client_poc' |

**Enum Values:**
| Value | Display Label | Color |
|-------|---------------|-------|
| `low` | Low | `bg-stone-100 text-stone-600` |
| `medium` | Medium | `bg-blue-100 text-blue-600` |
| `high` | High | `bg-green-100 text-green-700` |

---

### tags
| Property | Value |
|----------|-------|
| Column Name | `tags` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 20 |
| Description | Freeform tags for categorization |
| UI Label | "Tags" |
| UI Type | Tag Input with autocomplete |
| Autocomplete | Recently used tags |
| Allow Custom | Yes |
| Searchable | Yes |
| Example Values | "hot-lead", "vip", "technical", "c-level" |

---

### notes
| Property | Value |
|----------|-------|
| Column Name | `notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 10000 characters |
| Description | General notes about the contact (visible to contact) |
| UI Label | "Notes" |
| UI Type | Textarea |
| UI Placeholder | "Add notes about this contact..." |
| Rich Text | Optional |

---

### internal_notes
| Property | Value |
|----------|-------|
| Column Name | `internal_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 10000 characters |
| Description | Internal-only notes (never shared with contact) |
| UI Label | "Internal Notes" |
| UI Type | Textarea |
| UI Placeholder | "Internal team notes..." |
| UI Section | Collapsed by default |
| Visibility | Internal team only, never in exports/shares |

---

### owner_id
| Property | Value |
|----------|-------|
| Column Name | `owner_id` |
| Type | `UUID` |
| Required | No (recommended) |
| Foreign Key | `user_profiles(id)` |
| Description | Primary owner/relationship manager for this contact |
| UI Label | "Owner" |
| UI Type | User Select |
| Default | Current user (on create) |
| Index | Yes (`idx_contacts_owner_id`) |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp when contact was created |
| UI Display | Display only, formatted |
| Display Format | "Created on Nov 30, 2024 at 3:45 PM" |

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
| Display Format | "Last updated 5 minutes ago" |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the contact |
| UI Display | Display only with user avatar/name |
| Display Format | "Created by John Smith" |

---

### updated_by
| Property | Value |
|----------|-------|
| Column Name | `updated_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who last updated the contact |
| UI Display | Display only with user avatar/name |
| Auto Update | Set to current user on every update |

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
| Query Filter | `WHERE deleted_at IS NULL` for active records |
| Restore | Set to NULL to restore contact |

---

### search_vector
| Property | Value |
|----------|-------|
| Column Name | `search_vector` |
| Type | `TSVECTOR` |
| Required | No |
| Description | Full-text search vector |
| Auto Update | Via trigger on INSERT/UPDATE |
| Includes | first_name, last_name, email, phone, mobile, company_name, title, tags |
| Index | GIN index for fast searching |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `contacts_pkey` | `id` | BTREE | Primary key |
| `idx_contacts_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_contacts_contact_type` | `contact_type` | BTREE | Type filtering |
| `idx_contacts_email` | `email` | BTREE | Email lookup |
| `idx_contacts_company_id` | `company_id` | BTREE | Company lookup |
| `idx_contacts_owner_id` | `owner_id` | BTREE | Owner lookup |
| `idx_contacts_status` | `status` | BTREE | Status filtering |
| `idx_contacts_source_campaign_id` | `source_campaign_id` | BTREE | Campaign tracking |
| `idx_contacts_user_profile_id` | `user_profile_id` | BTREE | User profile link |
| `idx_contacts_deleted_at` | `deleted_at` | BTREE | Soft delete (WHERE NULL) |
| `idx_contacts_search` | `search_vector` | GIN | Full-text search |
| `idx_contacts_org_type` | `org_id, contact_type` | BTREE | Composite filter |
| `idx_contacts_engagement` | `engagement_score DESC` | BTREE | Engagement sorting |

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Organization isolation (base policy)
CREATE POLICY "contacts_org_isolation" ON contacts
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Read access: users can see contacts they own or have RCAI access to
CREATE POLICY "contacts_read_access" ON contacts
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      -- User is owner
      owner_id = (auth.jwt() ->> 'user_id')::uuid
      OR
      -- User has RCAI access
      EXISTS (
        SELECT 1 FROM object_owners
        WHERE entity_type = 'contact'
          AND entity_id = contacts.id
          AND user_id = (auth.jwt() ->> 'user_id')::uuid
      )
      OR
      -- User has admin role
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (auth.jwt() ->> 'user_id')::uuid
          AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Insert access: authenticated users can create contacts in their org
CREATE POLICY "contacts_insert_access" ON contacts
  FOR INSERT
  WITH CHECK (
    org_id = (auth.jwt() ->> 'org_id')::uuid
  );

-- Update access: owner or RCAI with edit permission
CREATE POLICY "contacts_update_access" ON contacts
  FOR UPDATE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      owner_id = (auth.jwt() ->> 'user_id')::uuid
      OR
      EXISTS (
        SELECT 1 FROM object_owners
        WHERE entity_type = 'contact'
          AND entity_id = contacts.id
          AND user_id = (auth.jwt() ->> 'user_id')::uuid
          AND permission = 'edit'
      )
    )
  );

-- Delete access (soft delete): owner or admin only
CREATE POLICY "contacts_delete_access" ON contacts
  FOR UPDATE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND deleted_at IS NULL
    AND (
      owner_id = (auth.jwt() ->> 'user_id')::uuid
      OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = (auth.jwt() ->> 'user_id')::uuid
          AND role IN ('admin', 'super_admin')
      )
    )
  );
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Function:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Search Vector Trigger
```sql
CREATE TRIGGER contacts_search_vector_update
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION contacts_search_vector_trigger();
```

**Function:**
```sql
CREATE OR REPLACE FUNCTION contacts_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.mobile, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Auto-assign RCAI Trigger
```sql
CREATE TRIGGER contacts_auto_rcai
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_contact_rcai();
```

**Function:**
```sql
CREATE OR REPLACE FUNCTION auto_assign_contact_rcai()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign creator as Accountable (if owner_id not set)
  IF NEW.owner_id IS NOT NULL THEN
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
      'contact',
      NEW.id,
      NEW.owner_id,
      'accountable',
      'edit',
      TRUE,
      'auto'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Engagement Score Update Trigger
```sql
CREATE TRIGGER contacts_update_engagement
  AFTER INSERT OR UPDATE ON activities
  FOR EACH ROW
  WHEN (NEW.entity_type = 'contact')
  EXECUTE FUNCTION update_contact_engagement();
```

**Function:**
```sql
CREATE OR REPLACE FUNCTION update_contact_engagement()
RETURNS TRIGGER AS $$
DECLARE
  v_contact_id UUID;
  v_total_interactions INTEGER;
  v_recency_score INTEGER;
  v_frequency_score INTEGER;
  v_response_rate NUMERIC;
  v_response_score INTEGER;
  v_final_score INTEGER;
BEGIN
  v_contact_id := NEW.entity_id::uuid;

  -- Update last_contacted_at for outbound
  IF NEW.direction = 'outbound' THEN
    UPDATE contacts
    SET last_contacted_at = NEW.activity_date
    WHERE id = v_contact_id
      AND (last_contacted_at IS NULL OR NEW.activity_date > last_contacted_at);
  END IF;

  -- Update last_response_at for inbound
  IF NEW.direction = 'inbound' THEN
    UPDATE contacts
    SET last_response_at = NEW.activity_date
    WHERE id = v_contact_id
      AND (last_response_at IS NULL OR NEW.activity_date > last_response_at);
  END IF;

  -- Increment total_interactions
  UPDATE contacts
  SET total_interactions = total_interactions + 1
  WHERE id = v_contact_id;

  -- Calculate engagement score (0-100)
  SELECT
    COUNT(*) INTO v_total_interactions
  FROM activities
  WHERE entity_type = 'contact'
    AND entity_id = v_contact_id::text
    AND activity_date > NOW() - INTERVAL '90 days';

  -- Recency score (40%): days since last response
  SELECT
    CASE
      WHEN last_response_at IS NULL THEN 0
      WHEN last_response_at > NOW() - INTERVAL '7 days' THEN 40
      WHEN last_response_at > NOW() - INTERVAL '30 days' THEN 30
      WHEN last_response_at > NOW() - INTERVAL '90 days' THEN 20
      ELSE 10
    END INTO v_recency_score
  FROM contacts WHERE id = v_contact_id;

  -- Frequency score (30%): interactions in last 90 days
  v_frequency_score := LEAST(30, v_total_interactions * 3);

  -- Response rate score (30%)
  WITH activity_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE direction = 'outbound') AS outbound_count,
      COUNT(*) FILTER (WHERE direction = 'inbound') AS inbound_count
    FROM activities
    WHERE entity_type = 'contact'
      AND entity_id = v_contact_id::text
      AND activity_date > NOW() - INTERVAL '90 days'
  )
  SELECT
    CASE
      WHEN outbound_count = 0 THEN 0
      ELSE (inbound_count::NUMERIC / outbound_count::NUMERIC * 30)::INTEGER
    END INTO v_response_score
  FROM activity_stats;

  -- Final score
  v_final_score := LEAST(100, v_recency_score + v_frequency_score + v_response_score);

  -- Update engagement_score
  UPDATE contacts
  SET engagement_score = v_final_score
  WHERE id = v_contact_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Related Tables

| Table | Relationship | FK Column | Description |
|-------|--------------|-----------|-------------|
| `organizations` | Parent | `org_id` | Organization owning this contact |
| `accounts` | Parent (optional) | `company_id` | Formal company account link |
| `campaigns` | Parent (optional) | `source_campaign_id` | Source campaign |
| `user_profiles` | Parent (optional) | `user_profile_id` | For candidate contacts who register |
| `user_profiles` | Owner | `owner_id` | Primary relationship owner |
| `user_profiles` | Creator | `created_by` | User who created record |
| `user_profiles` | Updater | `updated_by` | User who last updated |
| `activities` | Children | Polymorphic (`entity_type='contact'`) | All interactions |
| `job_orders` | Children | `job_orders.client_contact_id` | Job orders for this client POC |
| `deals` | Children | `deals.contact_id` | CRM deals |
| `submissions` | Children | `submissions.contact_id` | Candidate submissions |
| `object_owners` | RCAI | Polymorphic | RCAI assignments |

---

## Business Rules

### Contact Type Specific Rules

**client_poc:**
- Should have `company_id` set (link to account)
- Fields `decision_authority`, `buying_role`, `influence_level` are relevant
- Should have `title` populated
- Status should be `active` or `do_not_contact`

**candidate:**
- May link to `user_profile_id` when they register in Academy/Talent Portal
- Phone/mobile/email required for outreach
- `source` and `source_detail` important for attribution

**vendor:**
- Should have `company_name` or `company_id`
- `email` required for communications

**partner:**
- Should have `company_id` for formal partnerships
- May have special tags like "preferred-partner"

**internal:**
- Should link to `user_profile_id`
- Status always `active`

**general:**
- Default type for uncategorized contacts
- Minimal required fields

---

### Data Validation Rules

1. **Name Requirement:**
   - At least one of `first_name` OR `last_name` must be provided
   - `full_name` auto-generated from these fields

2. **Contact Method:**
   - At least one contact method required: `email`, `phone`, or `mobile`
   - Email must be valid format if provided

3. **Company Association:**
   - If `company_id` is set, it must be an active account in the same org
   - If `company_id` is set, display it instead of `company_name`

4. **Do Not Contact:**
   - If `status = 'do_not_contact'`, block all automated outreach
   - If `status = 'unsubscribed'`, block marketing emails only
   - If `status = 'bounced'`, flag email as invalid

5. **Timezone Respect:**
   - When scheduling calls, respect `do_not_call_before` and `do_not_call_after` in contact's `timezone`
   - Auto-convert to user's timezone for display

6. **Duplicate Prevention:**
   - Warn on duplicate email within same org
   - Suggest merging if full_name + email + company_id match

7. **User Profile Link:**
   - When `user_profile_id` is set, sync basic fields (name, email) from user_profiles
   - One user_profile can link to multiple contacts (different orgs)

8. **Owner Assignment:**
   - Default `owner_id` to creator on INSERT
   - Owner must be active user in same org

9. **Engagement Tracking:**
   - `last_contacted_at` auto-updated from activities (direction='outbound')
   - `last_response_at` auto-updated from activities (direction='inbound')
   - `total_interactions` increments on each activity
   - `engagement_score` recalculated via trigger

10. **Soft Delete:**
    - Setting `deleted_at` hides from normal queries
    - Related records (activities) remain accessible
    - Can restore by setting `deleted_at = NULL`

---

### UI Business Rules

**Create Contact:**
1. User selects `contact_type` first
2. Form adjusts based on type (show/hide fields)
3. `owner_id` defaults to current user
4. `created_by` auto-set to current user
5. Auto-create RCAI assignment (owner as Accountable)

**Edit Contact:**
1. Only owner or users with RCAI edit permission can edit
2. `updated_by` auto-set to current user
3. `updated_at` auto-set via trigger
4. Changing `contact_type` may show/hide fields

**Delete Contact:**
1. Soft delete only (set `deleted_at`)
2. Only owner or admin can delete
3. Confirm deletion if contact has activities/relationships
4. Option to permanently delete after 30 days (admin only)

**Merge Contacts:**
1. Detect duplicates by email + company
2. Admin can merge contacts
3. Keep most complete record, migrate activities to winner
4. Archive loser contact

**Engagement Display:**
- Show engagement score with color coding:
  - 0-30: Red (Cold)
  - 31-60: Yellow (Warm)
  - 61-100: Green (Hot)
- Display last_contacted and last_response with relative dates
- Show total_interactions count as badge

**Communication Preferences:**
- Display preferred_contact_method as primary action button
- Show do-not-call times as warning when scheduling
- Block actions if status = 'do_not_contact'

---

### Reporting & Analytics

**Key Metrics:**
- Contacts by type (pie chart)
- Contacts by status (bar chart)
- Contacts by owner (leaderboard)
- Average engagement score by type
- Response rate by source
- Contact acquisition trend (over time)

**Filters:**
- Contact type
- Status
- Owner
- Company
- Source / Campaign
- Engagement score range
- Last contacted date range
- Tags

**Exports:**
- CSV/Excel with all fields
- Respect RLS (user can only export contacts they can see)
- Exclude `internal_notes` from client-facing exports

---

## Migration Notes

**From Legacy Systems:**
1. Import contacts with `contact_type = 'general'`, then classify
2. Map old "client" contacts to `contact_type = 'client_poc'`
3. Map old "talent" contacts to `contact_type = 'candidate'`
4. Deduplicate by email before import
5. Set `source = 'migration'` for imported contacts

**Data Cleanup:**
1. Standardize phone formats to E.164
2. Validate email addresses
3. Merge duplicate contacts
4. Link to `accounts` where company name matches
5. Assign owners based on last activity creator

---

## Testing Checklist

**Unit Tests:**
- [ ] Validate email format
- [ ] Validate phone format
- [ ] full_name generation from first_name + last_name
- [ ] Engagement score calculation
- [ ] RLS policies (org isolation)
- [ ] RCAI auto-assignment on insert

**Integration Tests:**
- [ ] Create contact with all fields
- [ ] Update contact engagement from activity
- [ ] Link contact to user_profile
- [ ] Search contacts (full-text)
- [ ] Filter contacts by type/status/owner
- [ ] Soft delete and restore contact

**E2E Tests:**
- [ ] Create client POC contact from account detail page
- [ ] Create candidate contact from sourcing workflow
- [ ] Schedule call respecting do-not-call times
- [ ] Merge duplicate contacts
- [ ] Export contacts to CSV
- [ ] View contact activity timeline

---

*Last Updated: 2025-11-30*
*Version: 1.0*
*Author: InTime Engineering Team*
