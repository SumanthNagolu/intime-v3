# Candidates Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `user_profiles` |
| Schema | `public` |
| Purpose | Store candidate profiles (talent pool) |
| Note | Candidates are stored in `user_profiles` with candidate-specific fields |
| Primary Owner | Recruiter |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |

---

## Architecture Note

InTime uses a **unified user_profiles table** for all user types (employees, candidates, clients). Candidates are identified by having `candidate_*` fields populated. This enables:

- Single person can be both employee and candidate (internal mobility)
- Academy students can convert to candidates upon graduation
- Consistent identity management

---

## Candidate-Specific Fields

The following fields are specifically for candidate data within the `user_profiles` table:

---

### Core Identity Fields

#### id
| Property | Value |
|----------|-------|
| Column Name | `id` |
| Type | `UUID` |
| Required | Yes (auto-generated) |
| Default | `gen_random_uuid()` |
| Primary Key | Yes |
| Description | Unique identifier for the user/candidate |

---

#### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| Description | Organization this candidate belongs to |
| RLS | Used in isolation policy |

---

#### email
| Property | Value |
|----------|-------|
| Column Name | `email` |
| Type | `TEXT` |
| Required | Yes |
| Unique | Yes (globally) |
| Description | Primary email address |
| UI Label | "Email" |
| UI Type | Email Input |
| Validation | Valid email format |
| Searchable | Yes |

---

#### first_name
| Property | Value |
|----------|-------|
| Column Name | `first_name` |
| Type | `TEXT` |
| Required | No (but recommended) |
| Max Length | 100 |
| Description | First/given name |
| UI Label | "First Name" |
| UI Type | Text Input |
| Searchable | Yes |

---

#### last_name
| Property | Value |
|----------|-------|
| Column Name | `last_name` |
| Type | `TEXT` |
| Required | No (but recommended) |
| Max Length | 100 |
| Description | Last/family name |
| UI Label | "Last Name" |
| UI Type | Text Input |
| Searchable | Yes |

---

#### full_name
| Property | Value |
|----------|-------|
| Column Name | `full_name` |
| Type | `TEXT` |
| Required | No |
| Description | Computed full name |
| Auto Update | Trigger: `first_name || ' ' || last_name` |
| UI Display | Display only |
| Searchable | Yes |

---

#### phone
| Property | Value |
|----------|-------|
| Column Name | `phone` |
| Type | `TEXT` |
| Required | No |
| Format | E.164 recommended (+1XXXXXXXXXX) |
| Description | Primary phone number |
| UI Label | "Phone" |
| UI Type | Phone Input |

---

#### avatar_url
| Property | Value |
|----------|-------|
| Column Name | `avatar_url` |
| Type | `TEXT` |
| Required | No |
| Description | URL to profile photo |
| UI Display | Avatar component |
| Storage | Supabase Storage bucket |

---

### Professional Information

#### professional_headline
| Property | Value |
|----------|-------|
| Column Name | `professional_headline` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 |
| Description | Short professional title/headline |
| UI Label | "Professional Headline" |
| UI Type | Text Input |
| UI Placeholder | "e.g., Senior Software Engineer with 10 years experience" |
| Example | "Full-Stack Developer | React | Node.js | AWS" |

---

#### professional_summary
| Property | Value |
|----------|-------|
| Column Name | `professional_summary` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 |
| Description | Professional bio/summary |
| UI Label | "Professional Summary" |
| UI Type | Textarea |
| AI Assist | Can be generated from resume |

---

#### career_objectives
| Property | Value |
|----------|-------|
| Column Name | `career_objectives` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 |
| Description | Career goals and objectives |
| UI Label | "Career Objectives" |
| UI Type | Textarea |

---

### Candidate Status Fields

#### candidate_status
| Property | Value |
|----------|-------|
| Column Name | `candidate_status` |
| Type | `TEXT` |
| Required | Yes (for candidates) |
| Default | `'active'` |
| Description | Current candidate status |
| UI Label | "Status" |
| UI Type | Dropdown / Status Badge |
| Index | Yes |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `active` | Active | Green | Available and being considered |
| `placed` | Placed | Blue | Currently on assignment |
| `bench` | On Bench | Yellow | Between assignments, available |
| `inactive` | Inactive | Gray | Not currently in pool |
| `blacklisted` | Do Not Use | Red | Flagged, not to be submitted |

---

#### marketing_status
| Property | Value |
|----------|-------|
| Column Name | `marketing_status` |
| Type | `TEXT` |
| Required | No |
| Default | `'active'` |
| Description | Marketing/outreach status |
| UI Label | "Marketing Status" |
| Allowed Values | `active`, `passive`, `do_not_contact` |

---

#### is_on_hotlist
| Property | Value |
|----------|-------|
| Column Name | `is_on_hotlist` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Whether candidate is on priority hotlist |
| UI Label | "Hotlist" |
| UI Type | Toggle |

---

### Skills & Experience

#### candidate_skills
| Property | Value |
|----------|-------|
| Column Name | `candidate_skills` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 50 |
| Description | List of skills |
| UI Label | "Skills" |
| UI Type | Tag Input |
| Autocomplete | `skills` table |
| Searchable | Yes |
| Note | For detailed skills, use `candidate_skills` junction table |

---

#### candidate_experience_years
| Property | Value |
|----------|-------|
| Column Name | `candidate_experience_years` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 60 |
| Description | Total years of professional experience |
| UI Label | "Years of Experience" |
| UI Type | Number Input |
| Searchable | Yes (filter) |

---

#### languages
| Property | Value |
|----------|-------|
| Column Name | `languages` |
| Type | `JSONB` |
| Required | No |
| Structure | `[{ language: string, proficiency: string }]` |
| Description | Languages spoken |
| UI Label | "Languages" |
| UI Type | Dynamic list |
| Proficiency Values | `native`, `fluent`, `professional`, `conversational`, `basic` |

---

### Work Authorization

#### candidate_current_visa
| Property | Value |
|----------|-------|
| Column Name | `candidate_current_visa` |
| Type | `TEXT` |
| Required | No |
| Description | Current work authorization type |
| UI Label | "Work Authorization" |
| UI Type | Dropdown |

**Allowed Values:**
| Value | Display Label |
|-------|---------------|
| `USC` | US Citizen |
| `GC` | Green Card |
| `H1B` | H1B Visa |
| `L1` | L1 Visa |
| `OPT` | F1 OPT |
| `CPT` | F1 CPT |
| `H4_EAD` | H4 EAD |
| `TN` | TN Visa |
| `O1` | O1 Visa |
| `Other` | Other |

---

#### candidate_visa_expiry
| Property | Value |
|----------|-------|
| Column Name | `candidate_visa_expiry` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Visa expiration date |
| UI Label | "Visa Expiry" |
| UI Type | Date Picker |
| Visible | When visa type requires it |
| Alert | When < 90 days from expiry |

---

### Compensation

#### candidate_hourly_rate
| Property | Value |
|----------|-------|
| Column Name | `candidate_hourly_rate` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | 0 |
| Description | Desired/current hourly rate |
| UI Label | "Hourly Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | "/hr" |

---

#### minimum_hourly_rate
| Property | Value |
|----------|-------|
| Column Name | `minimum_hourly_rate` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Description | Minimum acceptable hourly rate |
| UI Label | "Minimum Rate" |
| UI Type | Currency Input |

---

#### desired_salary_annual
| Property | Value |
|----------|-------|
| Column Name | `desired_salary_annual` |
| Type | `NUMERIC(12,2)` |
| Required | No |
| Description | Desired annual salary (for permanent roles) |
| UI Label | "Desired Salary" |
| UI Type | Currency Input |

---

#### minimum_annual_salary
| Property | Value |
|----------|-------|
| Column Name | `minimum_annual_salary` |
| Type | `NUMERIC(12,2)` |
| Required | No |
| Description | Minimum acceptable annual salary |
| UI Label | "Minimum Salary" |
| UI Type | Currency Input |

---

#### benefits_required
| Property | Value |
|----------|-------|
| Column Name | `benefits_required` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Description | Required benefits |
| UI Label | "Required Benefits" |
| UI Type | Multi-select Checkbox |
| Options | `health`, `dental`, `vision`, `401k`, `pto`, `remote` |

---

### Availability

#### candidate_availability
| Property | Value |
|----------|-------|
| Column Name | `candidate_availability` |
| Type | `TEXT` |
| Required | No |
| Description | General availability status |
| UI Label | "Availability" |
| UI Type | Dropdown |

**Allowed Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `immediate` | Immediate | Can start now |
| `2_weeks` | 2 Weeks | Standard notice |
| `1_month` | 1 Month | Longer notice |
| `unavailable` | Not Available | Currently not available |

---

#### current_employment_status
| Property | Value |
|----------|-------|
| Column Name | `current_employment_status` |
| Type | `TEXT` |
| Required | No |
| Description | Current employment situation |
| UI Label | "Employment Status" |
| Allowed Values | `employed`, `unemployed`, `student`, `freelance`, `contractor` |

---

#### notice_period_days
| Property | Value |
|----------|-------|
| Column Name | `notice_period_days` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Description | Days notice required at current job |
| UI Label | "Notice Period" |
| UI Suffix | "days" |

---

#### earliest_start_date
| Property | Value |
|----------|-------|
| Column Name | `earliest_start_date` |
| Type | `DATE` |
| Required | No |
| Description | Earliest available start date |
| UI Label | "Earliest Start" |
| UI Type | Date Picker |

---

#### candidate_bench_start_date
| Property | Value |
|----------|-------|
| Column Name | `candidate_bench_start_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Date candidate went on bench |
| UI Label | "On Bench Since" |
| UI Display | Display only (auto-set) |
| Metric | Used for bench aging reports |

---

### Location & Relocation

#### candidate_location
| Property | Value |
|----------|-------|
| Column Name | `candidate_location` |
| Type | `TEXT` |
| Required | No |
| Description | Current location (legacy) |
| UI Label | "Current Location" |
| Note | Prefer using `addresses` table |

---

#### candidate_willing_to_relocate
| Property | Value |
|----------|-------|
| Column Name | `candidate_willing_to_relocate` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Whether candidate will relocate |
| UI Label | "Willing to Relocate" |
| UI Type | Checkbox |

---

#### preferred_locations
| Property | Value |
|----------|-------|
| Column Name | `preferred_locations` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Description | Preferred work locations |
| UI Label | "Preferred Locations" |
| UI Type | Tag Input |

---

#### relocation_assistance_required
| Property | Value |
|----------|-------|
| Column Name | `relocation_assistance_required` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Whether relocation assistance is needed |
| UI Label | "Needs Relocation Assistance" |
| UI Type | Checkbox |

---

### Resume & Documents

#### candidate_resume_url
| Property | Value |
|----------|-------|
| Column Name | `candidate_resume_url` |
| Type | `TEXT` |
| Required | No |
| Description | URL to latest resume |
| UI Label | "Resume" |
| Note | Prefer using `candidate_resumes` table for versioning |

---

### Contact Preferences

#### preferred_contact_method
| Property | Value |
|----------|-------|
| Column Name | `preferred_contact_method` |
| Type | `TEXT` |
| Required | No |
| Description | How candidate prefers to be contacted |
| UI Label | "Preferred Contact Method" |
| Allowed Values | `email`, `phone`, `text`, `linkedin` |

---

#### preferred_call_time
| Property | Value |
|----------|-------|
| Column Name | `preferred_call_time` |
| Type | `TEXT` |
| Required | No |
| Description | Best time to call |
| UI Label | "Best Time to Call" |
| UI Type | Text / Dropdown |
| Examples | "Morning", "After 5pm EST", "Weekends only" |

---

#### do_not_contact
| Property | Value |
|----------|-------|
| Column Name | `do_not_contact` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Do not contact flag |
| UI Label | "Do Not Contact" |
| UI Type | Checkbox |
| Alert | Shows warning banner when true |

---

### Social Links

#### linkedin_url
| Property | Value |
|----------|-------|
| Column Name | `linkedin_url` |
| Type | `TEXT` |
| Required | No |
| Validation | Valid LinkedIn URL |
| Description | LinkedIn profile URL |
| UI Label | "LinkedIn" |
| UI Type | URL Input |

---

#### github_url
| Property | Value |
|----------|-------|
| Column Name | `github_url` |
| Type | `TEXT` |
| Required | No |
| Description | GitHub profile URL |
| UI Label | "GitHub" |
| UI Type | URL Input |

---

#### portfolio_url
| Property | Value |
|----------|-------|
| Column Name | `portfolio_url` |
| Type | `TEXT` |
| Required | No |
| Description | Portfolio website URL |
| UI Label | "Portfolio" |
| UI Type | URL Input |

---

### Source Tracking

#### lead_source
| Property | Value |
|----------|-------|
| Column Name | `lead_source` |
| Type | `TEXT` |
| Required | No |
| Description | How candidate was sourced |
| UI Label | "Source" |
| UI Type | Dropdown |

**Allowed Values:**
| Value | Display Label |
|-------|---------------|
| `job_board` | Job Board |
| `linkedin` | LinkedIn |
| `referral` | Referral |
| `direct` | Direct Application |
| `agency` | Agency |
| `career_fair` | Career Fair |
| `website` | Website |
| `social_media` | Social Media |

---

#### lead_source_detail
| Property | Value |
|----------|-------|
| Column Name | `lead_source_detail` |
| Type | `TEXT` |
| Required | No |
| Description | Specific source details |
| UI Label | "Source Details" |
| UI Type | Text Input |
| Examples | "Indeed", "Referred by John Doe", "LinkedIn Recruiter" |

---

### Quality & Ratings

#### recruiter_rating
| Property | Value |
|----------|-------|
| Column Name | `recruiter_rating` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 5 |
| Description | Internal quality rating |
| UI Label | "Rating" |
| UI Type | Star Rating |

---

#### recruiter_rating_notes
| Property | Value |
|----------|-------|
| Column Name | `recruiter_rating_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 500 |
| Description | Notes explaining rating |
| UI Label | "Rating Notes" |
| UI Type | Textarea |

---

#### profile_completeness_score
| Property | Value |
|----------|-------|
| Column Name | `profile_completeness_score` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Max | 100 |
| Description | Percentage of profile fields completed |
| UI Display | Progress bar |
| Auto Update | Trigger on profile update |

---

### Activity Tracking

#### last_contacted_at
| Property | Value |
|----------|-------|
| Column Name | `last_contacted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time recruiter contacted candidate |
| UI Display | Display only |
| Auto Update | When activity logged |

---

#### last_activity_date
| Property | Value |
|----------|-------|
| Column Name | `last_activity_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last activity on this candidate |
| UI Display | Display only |
| Auto Update | On any submission, interview, etc. |

---

### Tags & Categories

#### tags
| Property | Value |
|----------|-------|
| Column Name | `tags` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Description | Custom tags for filtering |
| UI Label | "Tags" |
| UI Type | Tag Input |
| Max Items | 20 |

---

#### categories
| Property | Value |
|----------|-------|
| Column Name | `categories` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Description | Category assignments |
| UI Label | "Categories" |
| UI Type | Multi-select |

---

## Related Tables

| Table | Relationship | FK Column | Description |
|-------|--------------|-----------|-------------|
| candidate_skills | 1:* | candidate_id | Detailed skill records |
| candidate_resumes | 1:* | candidate_id | Resume versions |
| candidate_education | 1:* | candidate_id | Education history |
| candidate_work_history | 1:* | candidate_id | Employment history |
| candidate_work_authorizations | 1:* | candidate_id | Visa/work auth details |
| candidate_certifications | 1:* | candidate_id | Certifications & licenses |
| candidate_references | 1:* | candidate_id | Professional references |
| candidate_background_checks | 1:* | candidate_id | Background check records |
| submissions | 1:* | candidate_id | Job submissions |
| placements | 1:* | candidate_id | Placement history |
| activities | 1:* | entity_id | Activity log (polymorphic) |
| addresses | 1:* | entity_id | Address records (polymorphic) |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `user_profiles_pkey` | `id` | BTREE | Primary key |
| `idx_user_profiles_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_user_profiles_email` | `email` | BTREE | Email lookup |
| `idx_user_profiles_candidate_status` | `candidate_status` | BTREE | Status filtering |
| `idx_user_profiles_search` | `search_vector` | GIN | Full-text search |

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "user_profiles_org_isolation" ON user_profiles
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

---

## Profile Completeness Calculation

Fields that contribute to profile completeness score:

| Field Group | Weight | Fields |
|-------------|--------|--------|
| Basic Info | 20% | first_name, last_name, email, phone |
| Professional | 20% | professional_headline, candidate_skills, candidate_experience_years |
| Resume | 15% | candidate_resume_url (or has resume record) |
| Work Auth | 15% | candidate_current_visa |
| Availability | 10% | candidate_availability, candidate_status |
| Compensation | 10% | candidate_hourly_rate OR desired_salary_annual |
| Location | 10% | candidate_location, preferred_locations |

---

*Last Updated: 2024-11-30*



