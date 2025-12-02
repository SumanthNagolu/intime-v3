# account_preferences Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `account_preferences` |
| Schema | `public` |
| Purpose | Account hiring/staffing preferences and requirements |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | UUID | Primary key (UUID) |
| account_id | uuid | NO | NULL | Reference to account |
| preferred_skills | ARRAY | YES | NULL | Preferred skills |
| excluded_skills | ARRAY | YES | NULL | Excluded skills |
| preferred_visa_types | ARRAY | YES | NULL | Preferred visa types |
| excluded_visa_types | ARRAY | YES | NULL | Excluded visa types |
| rate_range_min | numeric | YES | NULL | Rate range min |
| rate_range_max | numeric | YES | NULL | Rate range max |
| preferred_rate_type | text | YES | `'hourly'::text` | Preferred rate type |
| work_mode_preference | text | YES | NULL | Work mode preference |
| onsite_requirement | text | YES | NULL | Onsite requirement |
| interview_process_notes | text | YES | NULL | Interview process notes |
| typical_interview_rounds | integer | YES | NULL | Typical interview rounds |
| interview_turnaround_days | integer | YES | NULL | Interview turnaround days |
| background_check_required | boolean | YES | `false` | Background check required |
| drug_screen_required | boolean | YES | `false` | Drug screen required |
| security_clearance_required | text | YES | NULL | Security clearance required |
| notes | text | YES | NULL | Additional notes |
| created_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|------------------|
| account_id | accounts.id | account_preferences_account_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| account_preferences_pkey | `CREATE UNIQUE INDEX account_preferences_pkey ON public.account_preferences USING btree (id)` |
| idx_account_preferences_account_id | `CREATE INDEX idx_account_preferences_account_id ON public.account_preferences USING btree (account_id)` |
