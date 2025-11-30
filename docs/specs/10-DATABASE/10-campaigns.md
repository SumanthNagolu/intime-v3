# Campaigns Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `campaigns` |
| Schema | `public` |
| Purpose | Store Talent Acquisition outreach campaigns for candidate and client sourcing |
| Primary Owner | Talent Acquisition / Recruiter |
| RLS Enabled | Yes |
| Soft Delete | No |

---

## Table Definition

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'talent_sourcing',

  -- Channel
  channel TEXT NOT NULL DEFAULT 'email',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft',

  -- Targeting
  target_audience TEXT,
  target_locations TEXT[],
  target_skills TEXT[],
  target_company_sizes TEXT[],

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT FALSE,
  variant_a_template_id UUID,
  variant_b_template_id UUID,
  ab_split_percentage INTEGER DEFAULT 50,

  -- Goals
  target_contacts_count INTEGER,
  target_response_rate NUMERIC(5,2),
  target_conversion_count INTEGER,

  -- Real-time metrics (aggregated from campaign_contacts)
  contacts_reached INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  linkedin_messages_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2),

  -- Dates
  start_date DATE,
  end_date DATE,

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
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
| Description | Unique identifier for the campaign |
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
| Description | Organization this campaign belongs to (multi-tenancy) |
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
| Min Length | 3 characters |
| Description | Campaign name/title |
| UI Label | "Campaign Name" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Q1 2024 Java Developer Sourcing" |
| Validation | Not empty, descriptive |
| Error Message | "Campaign name is required" |
| Searchable | Yes |

**Naming Conventions:**
- Include time period (Q1 2024, Jan 2024)
- Include target role/skill (Java Developers, DevOps Engineers)
- Include campaign type (Sourcing, BD Outreach)
- Example: "Q1 2024 Senior Java Developer Sourcing - NYC"

---

### description
| Property | Value |
|----------|-------|
| Column Name | `description` |
| Type | `TEXT` |
| Required | No (recommended) |
| Max Length | 5000 characters |
| Description | Campaign objectives, strategy, and notes |
| UI Label | "Description" |
| UI Type | Textarea |
| UI Placeholder | "Describe campaign goals, target audience, and strategy..." |
| UI Rows | 4 |

---

### campaign_type
| Property | Value |
|----------|-------|
| Column Name | `campaign_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'talent_sourcing'` |
| Allowed Values | `talent_sourcing`, `business_development`, `mixed` |
| Description | Primary purpose of the campaign |
| UI Label | "Campaign Type" |
| UI Type | Radio Buttons / Dropdown |
| Index | Yes (`idx_campaigns_type`) |

**Enum Values:**
| Value | Display Label | Description | Primary Goal |
|-------|---------------|-------------|--------------|
| `talent_sourcing` | Talent Sourcing | Candidate recruitment | Find candidates for open jobs |
| `business_development` | Business Development | Client acquisition | Find new client companies |
| `mixed` | Mixed | Hybrid approach | Both talent and client outreach |

**Business Rules:**
- `talent_sourcing`: Contacts should be candidates (developers, engineers)
- `business_development`: Contacts should be hiring managers, CTOs, VPs
- `mixed`: Can include both contact types

---

### channel
| Property | Value |
|----------|-------|
| Column Name | `channel` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'email'` |
| Allowed Values | `email`, `linkedin`, `combined` |
| Description | Outreach channel(s) used |
| UI Label | "Channel" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Description | Metrics Tracked |
|-------|---------------|-------------|-----------------|
| `email` | Email Only | Email campaigns via SMTP | emails_sent, email opens, clicks |
| `linkedin` | LinkedIn Only | LinkedIn InMail/Messages | linkedin_messages_sent |
| `combined` | Email + LinkedIn | Multi-channel approach | Both email + LinkedIn metrics |

**Channel-Specific Rules:**
- `email`: Requires valid email addresses, tracks opens/clicks
- `linkedin`: Requires LinkedIn URLs, no open tracking
- `combined`: Uses both channels, preference order configurable

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'draft'` |
| Allowed Values | `draft`, `active`, `paused`, `completed`, `archived` |
| Description | Current campaign status |
| UI Label | "Status" |
| UI Type | Status Badge / Dropdown |
| Index | Yes (`idx_campaigns_status`) |

**Enum Values:**
| Value | Display Label | Color | Description | Allows Outreach |
|-------|---------------|-------|-------------|------------------|
| `draft` | Draft | Gray | Campaign being set up | No |
| `active` | Active | Green | Currently running | Yes |
| `paused` | Paused | Yellow | Temporarily stopped | No |
| `completed` | Completed | Blue | Finished successfully | No |
| `archived` | Archived | Gray | No longer relevant | No |

**Status Workflow:**
```
draft → active → [paused] → completed → archived
              ↓
            paused → active
```

**Status Transition Rules:**
1. **draft → active**
   - Required: name, owner_id, channel, campaign_type
   - Required: At least one contact added
   - Sets: start_date (if not set)

2. **active → paused**
   - Stops all scheduled outreach
   - Preserves in-progress metrics

3. **paused → active**
   - Resumes outreach
   - Does not reset metrics

4. **active → completed**
   - Sets: end_date to today
   - Triggered automatically when:
     - All contacts processed OR
     - target_contacts_count reached OR
     - end_date passed

5. **completed → archived**
   - Final state, no changes allowed
   - Typically after 90 days

**Automated Status Changes:**
- `draft` → `active`: Manual only
- `active` → `completed`: Auto when end_date reached
- Any → `paused`: Manual only

---

### target_audience
| Property | Value |
|----------|-------|
| Column Name | `target_audience` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 characters |
| Description | Free-text description of target audience |
| UI Label | "Target Audience" |
| UI Type | Textarea |
| UI Placeholder | "e.g., Senior Java developers in NYC with 5+ years experience" |
| UI Rows | 3 |

**Examples:**
- "Senior Backend Engineers in Bay Area, Python/Django, 5-10 years exp"
- "CTOs and VPs of Engineering at Series A-C startups, 50-200 employees"
- "Full-stack developers open to contract work, React + Node.js"

---

### target_locations
| Property | Value |
|----------|-------|
| Column Name | `target_locations` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 50 |
| Description | Target geographic locations |
| UI Label | "Target Locations" |
| UI Type | Tag Input with autocomplete |
| UI Placeholder | "Type location and press Enter" |
| Autocomplete | City, State, Country names |

**Value Format:**
- City, State: "San Francisco, CA"
- Metro area: "San Francisco Bay Area"
- State only: "California"
- Country: "United States"
- Remote: "Remote - US"

**Examples:**
```json
["San Francisco, CA", "New York, NY", "Remote - US"]
["United States", "Canada"]
["San Francisco Bay Area", "Austin, TX", "Seattle, WA"]
```

---

### target_skills
| Property | Value |
|----------|-------|
| Column Name | `target_skills` |
| Type | `TEXT[]` (Array) |
| Required | No (recommended for talent_sourcing) |
| Max Items | 30 |
| Description | Required technical skills for candidates |
| UI Label | "Target Skills" |
| UI Type | Tag Input with autocomplete |
| UI Placeholder | "Type skill and press Enter" |
| Autocomplete Source | Common skills database |
| Allow Custom | Yes |

**Skill Categories:**
- Programming Languages: JavaScript, Python, Java, Go
- Frameworks: React, Angular, Django, Spring Boot
- Tools: Docker, Kubernetes, AWS, Git
- Methodologies: Agile, DevOps, CI/CD

**Examples:**
```json
["Java", "Spring Boot", "Microservices", "AWS", "Docker"]
["React", "TypeScript", "Node.js", "GraphQL"]
["Python", "Django", "PostgreSQL", "Redis"]
```

---

### target_company_sizes
| Property | Value |
|----------|-------|
| Column Name | `target_company_sizes` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Allowed Values | `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5001+` |
| Description | Target company size ranges |
| UI Label | "Target Company Sizes" |
| UI Type | Multi-select Dropdown |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `1-10` | 1-10 employees | Startups, very small companies |
| `11-50` | 11-50 employees | Small companies |
| `51-200` | 51-200 employees | Small to mid-size |
| `201-500` | 201-500 employees | Mid-size companies |
| `501-1000` | 501-1000 employees | Large companies |
| `1001-5000` | 1001-5000 employees | Enterprise |
| `5001+` | 5001+ employees | Large enterprise |

**Use Cases:**
- Talent sourcing: Target candidates from specific company sizes
- BD campaigns: Focus on companies by headcount
- Mixed: Identify both candidates and hiring managers

---

### is_ab_test
| Property | Value |
|----------|-------|
| Column Name | `is_ab_test` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Whether this campaign uses A/B testing |
| UI Label | "Enable A/B Testing" |
| UI Type | Checkbox / Toggle |

**When Enabled:**
- Requires `variant_a_template_id` and `variant_b_template_id`
- Contacts automatically split between variants
- Metrics tracked separately per variant
- Winner determined by response_rate

---

### variant_a_template_id
| Property | Value |
|----------|-------|
| Column Name | `variant_a_template_id` |
| Type | `UUID` |
| Required | Only if `is_ab_test = true` |
| Foreign Key | `message_templates(id)` (if table exists) |
| Description | Message template for A/B test variant A |
| UI Label | "Template A" |
| UI Type | Template Picker |
| UI Visible | Only when `is_ab_test = true` |

**Template Selection:**
- Must be compatible with selected channel
- Email templates for email/combined channels
- LinkedIn templates for linkedin/combined channels

---

### variant_b_template_id
| Property | Value |
|----------|-------|
| Column Name | `variant_b_template_id` |
| Type | `UUID` |
| Required | Only if `is_ab_test = true` |
| Foreign Key | `message_templates(id)` (if table exists) |
| Description | Message template for A/B test variant B |
| UI Label | "Template B" |
| UI Type | Template Picker |
| UI Visible | Only when `is_ab_test = true` |
| Validation | Must be different from variant_a_template_id |

---

### ab_split_percentage
| Property | Value |
|----------|-------|
| Column Name | `ab_split_percentage` |
| Type | `INTEGER` |
| Required | No |
| Default | 50 |
| Min | 10 |
| Max | 90 |
| Description | Percentage of contacts to receive variant A (rest get B) |
| UI Label | "Split Percentage" |
| UI Type | Slider / Number Input |
| UI Suffix | "% for Variant A" |
| UI Visible | Only when `is_ab_test = true` |

**Split Logic:**
- Value of 50 = 50% A, 50% B (even split)
- Value of 70 = 70% A, 30% B
- Value of 30 = 30% A, 70% B
- Randomized assignment per contact

**Examples:**
- 50: Standard A/B test (recommended)
- 80/20: Test new template against proven winner
- 90/10: Champion/Challenger testing

---

### target_contacts_count
| Property | Value |
|----------|-------|
| Column Name | `target_contacts_count` |
| Type | `INTEGER` |
| Required | No (recommended) |
| Min | 1 |
| Max | 100000 |
| Description | Goal for number of contacts to reach |
| UI Label | "Target Contacts" |
| UI Type | Number Input |
| UI Placeholder | "1000" |

**Purpose:**
- Sets campaign scope
- Triggers completion when reached
- Used in progress calculations

**Completion Logic:**
```
progress_percentage = (contacts_reached / target_contacts_count) * 100
is_complete = contacts_reached >= target_contacts_count
```

---

### target_response_rate
| Property | Value |
|----------|-------|
| Column Name | `target_response_rate` |
| Type | `NUMERIC(5,2)` |
| Required | No |
| Min | 0.00 |
| Max | 100.00 |
| Precision | 2 decimal places |
| Description | Goal response rate as percentage |
| UI Label | "Target Response Rate" |
| UI Type | Number Input |
| UI Suffix | "%" |
| UI Placeholder | "15.00" |

**Typical Benchmarks:**
- Cold email: 5-15%
- Warm email: 20-40%
- LinkedIn InMail: 10-25%
- Referral-based: 30-50%

**Success Criteria:**
```sql
actual_response_rate >= target_response_rate
```

---

### target_conversion_count
| Property | Value |
|----------|-------|
| Column Name | `target_conversion_count` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 10000 |
| Description | Goal for number of conversions |
| UI Label | "Target Conversions" |
| UI Type | Number Input |
| UI Placeholder | "50" |

**Conversion Definitions:**
- Talent sourcing: Phone screen scheduled, submission created, interview scheduled
- Business development: Discovery call booked, meeting scheduled, deal created
- Mixed: Any of the above

**Success Criteria:**
```sql
conversions >= target_conversion_count
```

---

### contacts_reached
| Property | Value |
|----------|-------|
| Column Name | `contacts_reached` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Total unique contacts reached in campaign |
| UI Label | "Contacts Reached" |
| UI Type | Display only (computed) |
| Auto Update | Incremented when contact status = 'sent' |

**Calculation:**
```sql
SELECT COUNT(*) FROM campaign_contacts
WHERE campaign_id = ? AND status IN ('sent', 'opened', 'responded', 'converted')
```

**Updates:**
- Incremented when email sent
- Incremented when LinkedIn message sent
- Not decremented on bounce (counted as attempted reach)

---

### emails_sent
| Property | Value |
|----------|-------|
| Column Name | `emails_sent` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Total emails sent |
| UI Label | "Emails Sent" |
| UI Type | Display only (computed) |
| Auto Update | Incremented when email sent successfully |
| Visible | Only when channel is 'email' or 'combined' |

**Calculation:**
```sql
SELECT COUNT(*) FROM campaign_contacts
WHERE campaign_id = ? AND sent_at IS NOT NULL
AND (SELECT event_type FROM engagement_tracking
     WHERE campaign_contact_id = campaign_contacts.id
     AND event_type = 'email_sent')
```

**Excludes:**
- Bounced emails (counted separately)
- Failed sends
- Pending sends

---

### linkedin_messages_sent
| Property | Value |
|----------|-------|
| Column Name | `linkedin_messages_sent` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Total LinkedIn messages sent |
| UI Label | "LinkedIn Messages Sent" |
| UI Type | Display only (computed) |
| Auto Update | Incremented when LinkedIn message sent |
| Visible | Only when channel is 'linkedin' or 'combined' |

**Note:**
- LinkedIn does not provide open/read tracking
- Status inferred from response or manual confirmation

---

### responses_received
| Property | Value |
|----------|-------|
| Column Name | `responses_received` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Total responses from contacts |
| UI Label | "Responses" |
| UI Type | Display only (computed) |
| Auto Update | Incremented when contact responds |

**Calculation:**
```sql
SELECT COUNT(*) FROM campaign_contacts
WHERE campaign_id = ? AND responded_at IS NOT NULL
```

**Response Triggers:**
- Email reply received
- LinkedIn message reply
- Phone call returned
- Manual response logged

**Excludes:**
- Automated replies (Out of Office)
- Bounces
- Unsubscribes

---

### conversions
| Property | Value |
|----------|-------|
| Column Name | `conversions` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Total conversions (desired actions taken) |
| UI Label | "Conversions" |
| UI Type | Display only (computed) |
| Auto Update | Incremented when conversion recorded |

**Calculation:**
```sql
SELECT COUNT(*) FROM campaign_contacts
WHERE campaign_id = ? AND converted_at IS NOT NULL
```

**Conversion Types:**

For `talent_sourcing`:
- `phone_screen`: Phone screen scheduled
- `submission`: Candidate submitted to job
- `interview`: Interview scheduled
- `placement`: Candidate placed

For `business_development`:
- `discovery_call`: Initial call booked
- `meeting`: In-person/video meeting
- `proposal`: Proposal sent
- `deal`: Deal created

For `mixed`:
- Any of the above

---

### response_rate
| Property | Value |
|----------|-------|
| Column Name | `response_rate` |
| Type | `NUMERIC(5,2)` |
| Required | No |
| Min | 0.00 |
| Max | 100.00 |
| Precision | 2 decimal places |
| Description | Calculated response rate percentage |
| UI Label | "Response Rate" |
| UI Type | Display only (computed) |
| Auto Update | Recomputed on metric changes |
| UI Display | Badge with color coding |

**Calculation:**
```sql
response_rate = (responses_received / NULLIF(contacts_reached, 0)) * 100
```

**Database Trigger:**
```sql
CREATE OR REPLACE FUNCTION update_campaign_response_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.response_rate = CASE
    WHEN NEW.contacts_reached > 0
    THEN ROUND((NEW.responses_received::numeric / NEW.contacts_reached) * 100, 2)
    ELSE 0
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_response_rate_trigger
  BEFORE INSERT OR UPDATE OF responses_received, contacts_reached ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_response_rate();
```

**UI Color Coding:**
| Response Rate | Color | Label |
|---------------|-------|-------|
| 0-5% | Red | Poor |
| 5-10% | Orange | Below Average |
| 10-20% | Yellow | Average |
| 20-30% | Light Green | Good |
| 30%+ | Green | Excellent |

---

### start_date
| Property | Value |
|----------|-------|
| Column Name | `start_date` |
| Type | `DATE` |
| Required | No |
| Description | Campaign start date |
| UI Label | "Start Date" |
| UI Type | Date Picker |
| Default | Set to today when status → 'active' |
| Auto Update | Set on first transition to 'active' |

**Business Rules:**
- Auto-set when campaign activated
- Can be set manually in 'draft' status
- Cannot be in the past (validation)
- Must be before end_date

---

### end_date
| Property | Value |
|----------|-------|
| Column Name | `end_date` |
| Type | `DATE` |
| Required | No (recommended) |
| Min | start_date + 1 day |
| Description | Campaign end date |
| UI Label | "End Date" |
| UI Type | Date Picker |
| Validation | Must be after start_date |
| Auto Complete | Sets status to 'completed' when reached |

**Automated Completion:**
```sql
-- Scheduled job runs daily
UPDATE campaigns
SET status = 'completed', updated_at = NOW()
WHERE status = 'active' AND end_date <= CURRENT_DATE;
```

**Common Durations:**
- Short campaign: 1-2 weeks
- Standard campaign: 4-6 weeks
- Long campaign: 8-12 weeks
- Ongoing: No end_date (manual completion)

---

### owner_id
| Property | Value |
|----------|-------|
| Column Name | `owner_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `user_profiles(id)` |
| Description | Campaign owner/manager |
| UI Label | "Campaign Owner" |
| UI Type | User Select |
| Default | Current user (on create) |
| Index | Yes (`idx_campaigns_owner_id`) |

**Owner Responsibilities:**
- Campaign strategy and setup
- Monitor metrics and performance
- Adjust targeting and messaging
- Respond to high-priority replies

**Permissions:**
- Can edit campaign settings
- Can activate/pause/complete campaign
- Can reassign ownership

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp when campaign was created |
| UI Display | Display only, formatted |
| Format | "MMM DD, YYYY HH:mm" |

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
| Description | User who created the campaign |
| UI Display | Display only |
| Default | Current user ID on INSERT |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `campaigns_pkey` | `id` | BTREE | Primary key |
| `idx_campaigns_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_campaigns_owner_id` | `owner_id` | BTREE | Owner lookup |
| `idx_campaigns_status` | `status` | BTREE | Status filtering |
| `idx_campaigns_type` | `campaign_type` | BTREE | Type filtering |
| `idx_campaigns_dates` | `start_date`, `end_date` | BTREE | Date range queries |
| `idx_campaigns_created_at` | `created_at DESC` | BTREE | Recent campaigns |

**Index Usage:**
```sql
-- Common queries
SELECT * FROM campaigns WHERE org_id = ? AND status = 'active';
SELECT * FROM campaigns WHERE owner_id = ? ORDER BY created_at DESC;
SELECT * FROM campaigns WHERE start_date >= ? AND end_date <= ?;
SELECT * FROM campaigns WHERE campaign_type = 'talent_sourcing' AND status IN ('active', 'paused');
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "campaigns_org_isolation" ON campaigns
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Owner can do anything
CREATE POLICY "campaigns_owner_full_access" ON campaigns
  FOR ALL
  USING (owner_id = auth.uid());

-- Team members can view
CREATE POLICY "campaigns_team_view" ON campaigns
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      -- TA/Recruiting roles can view all campaigns
      auth.jwt() ->> 'role' IN ('admin', 'ta_manager', 'recruiter')
    )
  );
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Response Rate Calculation Trigger
```sql
CREATE OR REPLACE FUNCTION update_campaign_response_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.response_rate = CASE
    WHEN NEW.contacts_reached > 0
    THEN ROUND((NEW.responses_received::numeric / NEW.contacts_reached) * 100, 2)
    ELSE 0
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_response_rate_trigger
  BEFORE INSERT OR UPDATE OF responses_received, contacts_reached ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_response_rate();
```

### Auto-Complete Campaign on End Date
```sql
-- Run as scheduled job (cron or pg_cron)
CREATE OR REPLACE FUNCTION auto_complete_campaigns()
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET status = 'completed', updated_at = NOW()
  WHERE status = 'active'
    AND end_date IS NOT NULL
    AND end_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily at midnight
SELECT cron.schedule('auto-complete-campaigns', '0 0 * * *', $$
  SELECT auto_complete_campaigns();
$$);
```

### Metric Aggregation Trigger
```sql
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_id uuid;
BEGIN
  -- Determine campaign_id from trigger operation
  IF TG_OP = 'DELETE' THEN
    v_campaign_id := OLD.campaign_id;
  ELSE
    v_campaign_id := NEW.campaign_id;
  END IF;

  -- Aggregate metrics from campaign_contacts
  UPDATE campaigns
  SET
    contacts_reached = (
      SELECT COUNT(*) FROM campaign_contacts
      WHERE campaign_id = v_campaign_id
        AND status IN ('sent', 'opened', 'responded', 'converted')
    ),
    emails_sent = (
      SELECT COUNT(*) FROM campaign_contacts cc
      WHERE cc.campaign_id = v_campaign_id
        AND EXISTS (
          SELECT 1 FROM engagement_tracking et
          WHERE et.campaign_contact_id = cc.id
            AND et.event_type = 'email_sent'
        )
    ),
    linkedin_messages_sent = (
      SELECT COUNT(*) FROM campaign_contacts
      WHERE campaign_id = v_campaign_id
        AND sent_at IS NOT NULL
        AND channel = 'linkedin'
    ),
    responses_received = (
      SELECT COUNT(*) FROM campaign_contacts
      WHERE campaign_id = v_campaign_id
        AND responded_at IS NOT NULL
    ),
    conversions = (
      SELECT COUNT(*) FROM campaign_contacts
      WHERE campaign_id = v_campaign_id
        AND converted_at IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = v_campaign_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_contacts_metrics_update
  AFTER INSERT OR UPDATE OR DELETE ON campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_metrics();
```

---

## Related Tables

| Table | Relationship | Description |
|-------|--------------|-------------|
| `organizations` | Parent (N:1) | Multi-tenant organization |
| `user_profiles` | Owner (N:1) | Campaign owner |
| `user_profiles` | Creator (N:1) | User who created campaign |
| `campaign_contacts` | Children (1:N) | Individual contacts in campaign |
| `message_templates` | Referenced | Email/LinkedIn templates (A/B variants) |

---

## Campaign Contacts Table

### Overview
Stores individual contacts within a campaign. Each row represents one person being contacted.

### Table Definition
```sql
CREATE TABLE campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Contact type
  contact_type TEXT NOT NULL DEFAULT 'candidate',

  -- Existing entity (if already in system)
  user_id UUID REFERENCES user_profiles(id),
  lead_id UUID REFERENCES leads(id),

  -- Contact info (if not in system yet)
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  company_name TEXT,
  title TEXT,

  -- Outreach status
  status TEXT NOT NULL DEFAULT 'pending',

  -- A/B Test variant
  ab_variant TEXT,
  template_used_id UUID,

  -- Engagement
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_text TEXT,

  -- Conversion
  converted_at TIMESTAMPTZ,
  conversion_type TEXT,
  conversion_entity_id UUID,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Key Fields

#### contact_type
| Property | Value |
|----------|-------|
| Type | TEXT |
| Default | 'candidate' |
| Allowed Values | `candidate`, `hiring_manager`, `decision_maker`, `referral` |
| Description | Type of contact |

**Enum Values:**
| Value | Use Case |
|-------|----------|
| `candidate` | Talent sourcing campaigns |
| `hiring_manager` | BD campaigns, direct hiring managers |
| `decision_maker` | BD campaigns, C-level executives |
| `referral` | Referral requests |

#### status
| Property | Value |
|----------|-------|
| Type | TEXT |
| Default | 'pending' |
| Allowed Values | `pending`, `sent`, `opened`, `responded`, `converted`, `bounced`, `unsubscribed` |

**Status Workflow:**
```
pending → sent → opened → responded → converted
              ↓
            bounced
              ↓
            unsubscribed
```

#### ab_variant
| Property | Value |
|----------|-------|
| Type | TEXT |
| Allowed Values | `A`, `B`, null |
| Description | Which A/B test variant this contact received |

**Assignment Logic:**
```javascript
const variant = Math.random() < (campaign.ab_split_percentage / 100) ? 'A' : 'B';
const template_id = variant === 'A'
  ? campaign.variant_a_template_id
  : campaign.variant_b_template_id;
```

#### Engagement Timestamps
- `sent_at`: When message was sent
- `opened_at`: When email was opened (email only)
- `clicked_at`: When link in message was clicked
- `responded_at`: When contact replied
- `converted_at`: When conversion action occurred

#### Conversion Fields
- `conversion_type`: Type of conversion (`phone_screen`, `submission`, `interview`, `meeting`, `deal`)
- `conversion_entity_id`: ID of created entity (submission_id, interview_id, deal_id)

---

## Engagement Tracking Table

### Overview
Stores individual engagement events (email opens, link clicks, etc.) for detailed analytics.

### Table Definition
```sql
CREATE TABLE engagement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL,
  event_data JSONB,

  -- Timestamp
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Tracking
  tracking_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  clicked_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Event Types

| Event Type | Description | event_data Fields |
|------------|-------------|-------------------|
| `email_sent` | Email sent to contact | `{ provider, message_id }` |
| `email_opened` | Email opened | `{ ip_address, user_agent, location }` |
| `link_clicked` | Link clicked in email | `{ url, link_text }` |
| `email_bounced` | Email bounced | `{ bounce_type, bounce_reason }` |
| `unsubscribed` | Contact unsubscribed | `{ reason }` |
| `linkedin_sent` | LinkedIn message sent | `{ message_id }` |
| `linkedin_viewed` | LinkedIn profile viewed | `{ }` |
| `response_received` | Reply received | `{ channel }` |

### Sample Data
```json
{
  "event_type": "link_clicked",
  "event_data": {
    "url": "https://intime.com/jobs/senior-java-developer",
    "link_text": "View Job Details",
    "position": 2
  },
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1"
}
```

---

## Business Rules

### Campaign Activation Rules

**Required to Activate (draft → active):**
1. Campaign has name
2. Campaign has owner
3. Campaign has channel selected
4. Campaign type selected
5. At least 1 contact added to campaign_contacts
6. If A/B test enabled:
   - Both variant templates selected
   - Templates are different
   - ab_split_percentage between 10-90

**Optional but Recommended:**
- target_audience description
- target_contacts_count set
- target_response_rate set
- At least one targeting field (locations, skills, or company_sizes)

### Metric Calculation Rules

#### Contacts Reached
```sql
contacts_reached = COUNT(contacts WHERE status IN ('sent', 'opened', 'responded', 'converted'))
```

#### Response Rate
```sql
response_rate = (responses_received / contacts_reached) * 100
-- Only calculate if contacts_reached > 0
-- Round to 2 decimal places
```

#### Conversion Rate
```sql
conversion_rate = (conversions / responses_received) * 100
-- Stored in application, not database
```

#### Overall Campaign Performance
```sql
overall_performance = (conversions / contacts_reached) * 100
-- Stored in application
```

### A/B Test Winner Determination

**Statistical Significance Required:**
- Minimum 100 contacts per variant
- Minimum 30 responses total
- 95% confidence level (p < 0.05)

**Winner Criteria:**
```javascript
const winner = {
  by_response_rate: variant_a.response_rate > variant_b.response_rate ? 'A' : 'B',
  by_conversion_rate: variant_a.conversion_rate > variant_b.conversion_rate ? 'A' : 'B',
  by_overall: variant_a.overall_rate > variant_b.overall_rate ? 'A' : 'B'
};

// Recommended winner: by_conversion_rate (business outcome)
```

**Display in UI:**
```
Variant A: 15.2% response rate, 8.3% conversion rate ✓ WINNER
Variant B: 12.8% response rate, 6.1% conversion rate
Difference: +2.4% response rate, +2.2% conversion rate (p = 0.023)
```

### Conversion Tracking Rules

#### Talent Sourcing Conversions
| Conversion Type | Trigger | Entity Created |
|-----------------|---------|----------------|
| `phone_screen` | Phone screen scheduled | Event/Calendar |
| `submission` | Candidate submitted to job | submissions table |
| `interview` | Interview scheduled | interviews table |
| `placement` | Candidate placed | placements table |

#### Business Development Conversions
| Conversion Type | Trigger | Entity Created |
|-----------------|---------|----------------|
| `discovery_call` | Initial call booked | Event/Calendar |
| `meeting` | Meeting scheduled | Event/Calendar |
| `proposal` | Proposal sent | proposals table |
| `deal` | Deal created | deals table |

**Conversion Recording:**
```sql
-- When conversion happens
UPDATE campaign_contacts
SET
  converted_at = NOW(),
  conversion_type = 'submission',
  conversion_entity_id = '<submission_id>',
  status = 'converted'
WHERE id = '<contact_id>';

-- Automatically triggers metric update on campaigns table
```

### Channel-Specific Rules

#### Email Channel Rules
1. **Sending Rate Limits:**
   - Maximum 200 emails per hour per sender
   - Maximum 1000 emails per day per sender
   - 30-second delay between individual sends

2. **Bounce Handling:**
   - Hard bounce: Mark contact as 'bounced', do not retry
   - Soft bounce: Retry up to 3 times over 48 hours
   - After 3 soft bounces: Mark as 'bounced'

3. **Unsubscribe:**
   - One-click unsubscribe required
   - Unsubscribe applies globally (all campaigns)
   - Suppression list checked before every send

#### LinkedIn Channel Rules
1. **Connection Limits:**
   - Maximum 100 connection requests per week
   - Maximum 50 InMails per month (if no premium)
   - 15-minute delay between messages

2. **Message Templates:**
   - Maximum 300 characters for connection requests
   - Maximum 1900 characters for InMails
   - Personalization tokens required

### Campaign Completion Rules

**Auto-Complete Triggers:**
1. `end_date` reached
2. `target_contacts_count` reached AND `target_response_rate` reached
3. All contacts processed (status != 'pending')

**Manual Complete:**
- Owner can manually complete at any time
- Requires confirmation dialog

**On Completion:**
1. Set `status = 'completed'`
2. Set `end_date = TODAY()` (if not set)
3. Stop all scheduled outreach
4. Generate completion report
5. Send summary email to owner

### Campaign Archival Rules

**Archive After:**
- 90 days after completion
- Manual archive by admin/owner

**On Archive:**
1. Set `status = 'archived'`
2. No further edits allowed
3. Read-only access
4. Consider data retention policy (delete after 2 years)

---

## Performance Optimization

### Query Optimization

**Most Common Queries:**
```sql
-- Active campaigns for owner
SELECT * FROM campaigns
WHERE owner_id = ? AND status = 'active'
ORDER BY created_at DESC;

-- Campaign performance dashboard
SELECT
  c.id, c.name, c.status,
  c.contacts_reached, c.responses_received, c.conversions,
  c.response_rate,
  COUNT(cc.id) as total_contacts,
  COUNT(CASE WHEN cc.status = 'pending' THEN 1 END) as pending_contacts
FROM campaigns c
LEFT JOIN campaign_contacts cc ON c.id = cc.campaign_id
WHERE c.org_id = ? AND c.status IN ('active', 'paused')
GROUP BY c.id
ORDER BY c.created_at DESC;

-- A/B test results
SELECT
  cc.ab_variant,
  COUNT(*) as total_contacts,
  COUNT(CASE WHEN cc.responded_at IS NOT NULL THEN 1 END) as responses,
  COUNT(CASE WHEN cc.converted_at IS NOT NULL THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN cc.responded_at IS NOT NULL THEN 1 END)::numeric
    / COUNT(*)::numeric * 100, 2
  ) as response_rate
FROM campaign_contacts cc
WHERE cc.campaign_id = ?
GROUP BY cc.ab_variant;
```

### Materialized Views (Optional)

```sql
-- Campaign performance summary (refresh hourly)
CREATE MATERIALIZED VIEW campaign_performance_summary AS
SELECT
  c.id as campaign_id,
  c.name,
  c.status,
  c.campaign_type,
  c.channel,
  c.contacts_reached,
  c.response_rate,
  c.conversions,
  CASE
    WHEN c.contacts_reached > 0
    THEN ROUND((c.conversions::numeric / c.contacts_reached) * 100, 2)
    ELSE 0
  END as conversion_rate,
  COUNT(DISTINCT cc.id) as total_contacts,
  COUNT(DISTINCT CASE WHEN cc.status = 'pending' THEN cc.id END) as pending_contacts,
  COUNT(DISTINCT et.id) as total_events
FROM campaigns c
LEFT JOIN campaign_contacts cc ON c.id = cc.campaign_id
LEFT JOIN engagement_tracking et ON cc.id = et.campaign_contact_id
GROUP BY c.id;

-- Refresh schedule
SELECT cron.schedule('refresh-campaign-performance', '0 * * * *', $$
  REFRESH MATERIALIZED VIEW campaign_performance_summary;
$$);
```

---

## Validation Rules

### Campaign Level Validations

```typescript
interface CampaignValidation {
  name: {
    required: true;
    minLength: 3;
    maxLength: 200;
    pattern: /^[a-zA-Z0-9\s\-_()]+$/;
  };

  description: {
    maxLength: 5000;
  };

  campaign_type: {
    required: true;
    enum: ['talent_sourcing', 'business_development', 'mixed'];
  };

  channel: {
    required: true;
    enum: ['email', 'linkedin', 'combined'];
  };

  status: {
    required: true;
    enum: ['draft', 'active', 'paused', 'completed', 'archived'];
  };

  target_locations: {
    maxItems: 50;
    itemMaxLength: 100;
  };

  target_skills: {
    maxItems: 30;
    itemMaxLength: 50;
  };

  target_company_sizes: {
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+'];
  };

  ab_split_percentage: {
    min: 10;
    max: 90;
    requiredIf: (campaign) => campaign.is_ab_test === true;
  };

  variant_a_template_id: {
    requiredIf: (campaign) => campaign.is_ab_test === true;
  };

  variant_b_template_id: {
    requiredIf: (campaign) => campaign.is_ab_test === true;
    notEqualTo: 'variant_a_template_id';
  };

  target_contacts_count: {
    min: 1;
    max: 100000;
  };

  target_response_rate: {
    min: 0;
    max: 100;
    decimal: 2;
  };

  start_date: {
    minDate: 'today';
    lessThan: 'end_date';
  };

  end_date: {
    greaterThan: 'start_date';
  };
}
```

### Campaign Contact Validations

```typescript
interface CampaignContactValidation {
  contact_type: {
    required: true;
    enum: ['candidate', 'hiring_manager', 'decision_maker', 'referral'];
  };

  // Must have EITHER user_id/lead_id OR contact info
  user_id: {
    requiredWithout: ['lead_id', 'email'];
  };

  email: {
    format: 'email';
    requiredIf: (contact) => !contact.user_id && !contact.lead_id;
  };

  linkedin_url: {
    format: 'url';
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/;
  };

  ab_variant: {
    enum: ['A', 'B', null];
    requiredIf: (contact) => contact.campaign.is_ab_test === true;
  };

  status: {
    required: true;
    enum: ['pending', 'sent', 'opened', 'responded', 'converted', 'bounced', 'unsubscribed'];
  };
}
```

---

## Error Handling

### Common Errors

| Error Code | Error Message | Resolution |
|------------|---------------|------------|
| `CAMPAIGN_NAME_REQUIRED` | "Campaign name is required" | Provide campaign name |
| `CAMPAIGN_NO_CONTACTS` | "Cannot activate campaign with 0 contacts" | Add at least 1 contact |
| `CAMPAIGN_AB_MISSING_TEMPLATES` | "A/B test requires both variant templates" | Select both templates |
| `CAMPAIGN_AB_SAME_TEMPLATES` | "Variant A and B must use different templates" | Choose different templates |
| `CAMPAIGN_INVALID_DATES` | "End date must be after start date" | Adjust dates |
| `CAMPAIGN_ALREADY_ACTIVE` | "Campaign is already active" | Check status |
| `CAMPAIGN_SEND_LIMIT_EXCEEDED` | "Daily send limit exceeded (1000)" | Wait 24 hours or increase limit |
| `CONTACT_EMAIL_INVALID` | "Invalid email address format" | Provide valid email |
| `CONTACT_UNSUBSCRIBED` | "Contact has unsubscribed" | Remove from campaign |
| `CONTACT_BOUNCED` | "Email previously bounced" | Use different email |

---

## Sample Data

### Sample Campaign

```sql
INSERT INTO campaigns (
  org_id, name, description, campaign_type, channel, status,
  target_audience, target_locations, target_skills,
  target_contacts_count, target_response_rate,
  owner_id, created_by
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Q1 2024 Senior Java Developer Sourcing - NYC',
  'Sourcing senior Java developers for Fortune 500 financial clients in NYC. Focus on microservices, Spring Boot, and cloud experience.',
  'talent_sourcing',
  'email',
  'active',
  'Senior Java developers with 5-10 years experience in financial services',
  ARRAY['New York, NY', 'Jersey City, NJ', 'Remote - US'],
  ARRAY['Java', 'Spring Boot', 'Microservices', 'AWS', 'Kubernetes'],
  500,
  15.00,
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
);
```

### Sample Campaign Contact

```sql
INSERT INTO campaign_contacts (
  campaign_id, contact_type,
  first_name, last_name, email, linkedin_url,
  company_name, title,
  status, ab_variant
) VALUES (
  '123e4567-e89b-12d3-a456-426614174001',
  'candidate',
  'John',
  'Doe',
  'john.doe@example.com',
  'https://linkedin.com/in/johndoe',
  'TechCorp Inc',
  'Senior Software Engineer',
  'pending',
  'A'
);
```

---

## Migration Scripts

### Initial Table Creation

```sql
-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'talent_sourcing',
  channel TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'draft',
  target_audience TEXT,
  target_locations TEXT[],
  target_skills TEXT[],
  target_company_sizes TEXT[],
  is_ab_test BOOLEAN DEFAULT FALSE,
  variant_a_template_id UUID,
  variant_b_template_id UUID,
  ab_split_percentage INTEGER DEFAULT 50,
  target_contacts_count INTEGER,
  target_response_rate NUMERIC(5,2),
  target_conversion_count INTEGER,
  contacts_reached INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  linkedin_messages_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2),
  start_date DATE,
  end_date DATE,
  owner_id UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Create indexes
CREATE INDEX idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Create campaign_contacts table
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL DEFAULT 'candidate',
  user_id UUID REFERENCES user_profiles(id),
  lead_id UUID REFERENCES leads(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  company_name TEXT,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  ab_variant TEXT,
  template_used_id UUID,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_text TEXT,
  converted_at TIMESTAMPTZ,
  conversion_type TEXT,
  conversion_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for campaign_contacts
CREATE INDEX idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_user_id ON campaign_contacts(user_id);
CREATE INDEX idx_campaign_contacts_lead_id ON campaign_contacts(lead_id);
CREATE INDEX idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX idx_campaign_contacts_ab_variant ON campaign_contacts(ab_variant);

-- Create engagement_tracking table
CREATE TABLE IF NOT EXISTS engagement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tracking_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  clicked_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for engagement_tracking
CREATE INDEX idx_engagement_tracking_contact_id ON engagement_tracking(campaign_contact_id);
CREATE INDEX idx_engagement_tracking_event_type ON engagement_tracking(event_type);
CREATE INDEX idx_engagement_tracking_timestamp ON engagement_tracking(event_timestamp DESC);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY campaigns_org_isolation ON campaigns
  FOR ALL USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY campaign_contacts_via_campaign ON campaign_contacts
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
    )
  );

CREATE POLICY engagement_tracking_via_contact ON engagement_tracking
  FOR ALL USING (
    campaign_contact_id IN (
      SELECT cc.id FROM campaign_contacts cc
      JOIN campaigns c ON cc.campaign_id = c.id
      WHERE c.org_id = (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- Triggers
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER campaign_contacts_updated_at
  BEFORE UPDATE ON campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## API Examples

### tRPC Router Methods

```typescript
// Create campaign
campaign.create({
  name: "Q1 2024 Senior Java Developer Sourcing",
  campaign_type: "talent_sourcing",
  channel: "email",
  target_skills: ["Java", "Spring Boot", "AWS"],
  target_locations: ["New York, NY"],
  target_contacts_count: 500,
  target_response_rate: 15.00
});

// List campaigns
campaign.list({
  status: "active",
  campaign_type: "talent_sourcing",
  orderBy: "created_at",
  order: "desc"
});

// Get campaign with metrics
campaign.getById({ id: "campaign-id" });
// Returns: campaign + aggregated metrics + contact stats

// Activate campaign
campaign.activate({ id: "campaign-id" });
// Validates requirements, sets status = 'active', sets start_date

// Pause campaign
campaign.pause({ id: "campaign-id" });

// Add contacts to campaign
campaign.addContacts({
  campaign_id: "campaign-id",
  contacts: [
    {
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
      linkedin_url: "https://linkedin.com/in/johndoe"
    }
  ]
});

// Get A/B test results
campaign.getABTestResults({ id: "campaign-id" });
// Returns: variant stats, winner, confidence level
```

---

*Last Updated: 2025-11-30*
