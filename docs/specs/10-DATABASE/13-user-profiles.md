# User Profiles Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `user_profiles` |
| Schema | `public` |
| Purpose | Unified user table supporting ALL role types across 5 business pillars (Academy, Recruiting, Bench Sales, HR/TA, Client Portal) |
| Primary Owner | Varies by role type |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |
| Multi-Role Support | Yes (single user can have student, employee, candidate, client, and recruiter roles simultaneously) |

---

## Table Definition

```sql
CREATE TABLE user_profiles (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,

  -- Multi-tenancy
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields (ALL users)
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  locale TEXT DEFAULT 'en-US',

  -- Student fields (Training Academy)
  student_enrollment_date TIMESTAMPTZ,
  student_course_id UUID,
  student_current_module TEXT,
  student_course_progress JSONB DEFAULT '{}',
  student_graduation_date TIMESTAMPTZ,
  student_certificates JSONB DEFAULT '[]',

  -- Employee fields (HR Module)
  employee_hire_date TIMESTAMPTZ,
  employee_department TEXT,
  employee_position TEXT,
  employee_salary NUMERIC(10,2),
  employee_status TEXT,
  employee_manager_id UUID,
  employee_performance_rating NUMERIC(3,2),

  -- Candidate fields (Recruiting/Bench Sales)
  candidate_status TEXT,
  candidate_resume_url TEXT,
  candidate_skills TEXT[],
  candidate_experience_years INTEGER,
  candidate_current_visa TEXT,
  candidate_visa_expiry TIMESTAMPTZ,
  candidate_hourly_rate NUMERIC(10,2),
  candidate_bench_start_date TIMESTAMPTZ,
  candidate_availability TEXT,
  candidate_location TEXT,
  candidate_willing_to_relocate BOOLEAN DEFAULT false,

  -- Enhanced Candidate Personal Details
  middle_name TEXT,
  preferred_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,

  -- Enhanced Candidate Contact
  email_secondary TEXT,
  phone_home TEXT,
  phone_work TEXT,
  preferred_contact_method TEXT,
  preferred_call_time TEXT,
  do_not_contact BOOLEAN DEFAULT false,
  do_not_email BOOLEAN DEFAULT false,
  do_not_text BOOLEAN DEFAULT false,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  personal_website TEXT,

  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_email TEXT,

  -- Source/Marketing
  lead_source TEXT,
  lead_source_detail TEXT,
  marketing_status TEXT,
  is_on_hotlist BOOLEAN DEFAULT false,
  hotlist_added_at TIMESTAMPTZ,
  hotlist_added_by UUID,
  hotlist_notes TEXT,

  -- Enhanced Availability
  current_employment_status TEXT,
  notice_period_days INTEGER,
  earliest_start_date DATE,
  preferred_employment_type TEXT[],

  -- Enhanced Relocation
  preferred_locations TEXT[],
  relocation_assistance_required BOOLEAN DEFAULT false,
  relocation_notes TEXT,

  -- Enhanced Compensation
  desired_salary_annual NUMERIC(12,2),
  desired_salary_currency TEXT DEFAULT 'USD',
  minimum_hourly_rate NUMERIC(10,2),
  minimum_annual_salary NUMERIC(12,2),
  benefits_required TEXT[],
  compensation_notes TEXT,

  -- Languages
  languages JSONB DEFAULT '[]',

  -- Rating/Quality
  recruiter_rating INTEGER,
  recruiter_rating_notes TEXT,
  profile_completeness_score INTEGER DEFAULT 0,
  last_profile_update TIMESTAMPTZ,
  last_activity_date TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  last_contacted_by UUID,

  -- Professional Summary
  professional_headline TEXT,
  professional_summary TEXT,
  career_objectives TEXT,

  -- Tags/Categories
  tags TEXT[],
  categories TEXT[],

  -- Client fields (Client Companies)
  client_company_name TEXT,
  client_industry TEXT,
  client_tier TEXT,
  client_contract_start_date TIMESTAMPTZ,
  client_contract_end_date TIMESTAMPTZ,
  client_payment_terms INTEGER DEFAULT 30,
  client_preferred_markup_percentage NUMERIC(5,2),

  -- Recruiter-specific fields
  recruiter_territory TEXT,
  recruiter_specialization TEXT[],
  recruiter_monthly_placement_target INTEGER DEFAULT 2,
  recruiter_pod_id UUID,

  -- Employee role (for access control)
  employee_role TEXT,
  title TEXT,

  -- Billing integration
  stripe_customer_id TEXT,

  -- Recruiter metrics
  total_placements INTEGER DEFAULT 0,

  -- Leaderboard visibility
  leaderboard_visible BOOLEAN DEFAULT true,

  -- Metadata & audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Search vector (auto-maintained by trigger)
  search_vector TEXT
);
```

---

## Field Specifications

## Primary Identification

### id
| Property | Value |
|----------|-------|
| Column Name | `id` |
| Type | `UUID` |
| Required | Yes (auto-generated) |
| Default | `gen_random_uuid()` |
| Primary Key | Yes |
| Description | Unique identifier for the user profile |
| UI Display | Hidden (used in URLs and relations) |

---

### auth_id
| Property | Value |
|----------|-------|
| Column Name | `auth_id` |
| Type | `UUID` |
| Required | No (nullable for system/service accounts) |
| Unique | Yes |
| Foreign Key | `auth.users(id)` (Supabase auth) |
| Description | Link to Supabase authentication user |
| UI Display | Hidden |
| Note | NULL for non-login users (e.g., imported candidates) |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this user belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |
| Index | Yes (`idx_user_profiles_org_id`) |

---

## Core Fields (ALL Users)

### email
| Property | Value |
|----------|-------|
| Column Name | `email` |
| Type | `TEXT` |
| Required | Yes |
| Unique | Yes |
| Max Length | 255 characters |
| Description | Primary email address |
| UI Label | "Email" |
| UI Type | Email Input |
| UI Placeholder | "user@company.com" |
| Validation | Valid email format |
| Searchable | Yes (included in search_vector) |
| Index | Yes (unique) |

---

### first_name
| Property | Value |
|----------|-------|
| Column Name | `first_name` |
| Type | `TEXT` |
| Required | Recommended (not enforced) |
| Max Length | 100 characters |
| Description | User's first name (given name) |
| UI Label | "First Name" |
| UI Type | Text Input |
| UI Placeholder | "John" |
| Searchable | Yes |
| Trigger | Updates `full_name` on change |

---

### last_name
| Property | Value |
|----------|-------|
| Column Name | `last_name` |
| Type | `TEXT` |
| Required | Recommended (not enforced) |
| Max Length | 100 characters |
| Description | User's last name (family name) |
| UI Label | "Last Name" |
| UI Type | Text Input |
| UI Placeholder | "Doe" |
| Searchable | Yes |
| Trigger | Updates `full_name` on change |

---

### full_name
| Property | Value |
|----------|-------|
| Column Name | `full_name` |
| Type | `TEXT` |
| Required | No |
| Description | Computed field: `first_name || ' ' || last_name` |
| UI Display | Display only (auto-populated) |
| Auto Update | Via database trigger |
| Searchable | Yes (primary search field) |

---

### avatar_url
| Property | Value |
|----------|-------|
| Column Name | `avatar_url` |
| Type | `TEXT` |
| Required | No |
| Description | URL to user's profile picture |
| UI Label | "Profile Picture" |
| UI Type | Image Upload |
| Storage | Supabase Storage bucket: `avatars/` |
| Default | Initials-based placeholder |
| Validation | Valid URL format |

---

### phone
| Property | Value |
|----------|-------|
| Column Name | `phone` |
| Type | `TEXT` |
| Required | No (recommended for candidates) |
| Max Length | 50 characters |
| Description | Primary phone number |
| UI Label | "Phone" |
| UI Type | Phone Input (with formatting) |
| UI Placeholder | "+1 (555) 123-4567" |
| Format | International format preferred |
| Validation | Valid phone number |

---

### timezone
| Property | Value |
|----------|-------|
| Column Name | `timezone` |
| Type | `TEXT` |
| Required | No |
| Default | `'America/New_York'` |
| Allowed Values | IANA timezone strings |
| Description | User's timezone for scheduling and notifications |
| UI Label | "Timezone" |
| UI Type | Timezone Dropdown |
| Common Values | `America/New_York`, `America/Chicago`, `America/Los_Angeles`, `America/Phoenix`, `UTC` |

---

### locale
| Property | Value |
|----------|-------|
| Column Name | `locale` |
| Type | `TEXT` |
| Required | No |
| Default | `'en-US'` |
| Allowed Values | BCP 47 language tags |
| Description | User's preferred language/locale |
| UI Label | "Language" |
| UI Type | Dropdown |
| Common Values | `en-US`, `es-ES`, `fr-FR`, `de-DE`, `hi-IN` |

---

## Student Fields (Training Academy)

### student_enrollment_date
| Property | Value |
|----------|-------|
| Column Name | `student_enrollment_date` |
| Type | `TIMESTAMPTZ` |
| Required | No (set when student role activated) |
| Description | Date when student enrolled in academy |
| UI Label | "Enrollment Date" |
| UI Type | Date Picker (readonly for students) |
| UI Visible | Only for students and instructors |
| Auto Set | On first course enrollment |

---

### student_course_id
| Property | Value |
|----------|-------|
| Column Name | `student_course_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `academy_courses(id)` (soft reference) |
| Description | Current/active course student is enrolled in |
| UI Label | "Current Course" |
| UI Type | Display only |
| UI Visible | Student dashboard |

---

### student_current_module
| Property | Value |
|----------|-------|
| Column Name | `student_current_module` |
| Type | `TEXT` |
| Required | No |
| Description | Current module/lesson student is working on |
| UI Label | "Current Module" |
| UI Type | Display only |
| UI Visible | Student dashboard |

---

### student_course_progress
| Property | Value |
|----------|-------|
| Column Name | `student_course_progress` |
| Type | `JSONB` |
| Required | No |
| Default | `{}` |
| Description | Progress tracking for courses |
| Data Structure | `{ "course_id": completion_percentage, ... }` |
| Example | `{ "uuid-1": 75.5, "uuid-2": 100 }` |
| UI Display | Progress bars in academy portal |

---

### student_graduation_date
| Property | Value |
|----------|-------|
| Column Name | `student_graduation_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Date when student completed their program |
| UI Label | "Graduation Date" |
| UI Type | Display only (auto-set on course completion) |
| Auto Set | When course completion reaches 100% |

---

### student_certificates
| Property | Value |
|----------|-------|
| Column Name | `student_certificates` |
| Type | `JSONB` |
| Required | No |
| Default | `[]` |
| Description | Array of earned certificates |
| Data Structure | `[{ certId: string, issuedDate: string, url: string }, ...]` |
| Example | `[{ "certId": "CERT-123", "issuedDate": "2024-11-30", "url": "https://..." }]` |
| UI Display | Certificate badges in student profile |

---

## Employee Fields (HR Module)

### employee_hire_date
| Property | Value |
|----------|-------|
| Column Name | `employee_hire_date` |
| Type | `TIMESTAMPTZ` |
| Required | No (required for employee role) |
| Description | Date employee was hired |
| UI Label | "Hire Date" |
| UI Type | Date Picker |
| UI Visible | HR, managers, employee's own profile |
| Used For | Tenure calculations, anniversary tracking |

---

### employee_department
| Property | Value |
|----------|-------|
| Column Name | `employee_department` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `recruiting`, `training`, `sales`, `admin`, `hr`, `finance`, `operations`, `executive` |
| Description | Employee's department |
| UI Label | "Department" |
| UI Type | Dropdown |
| UI Visible | HR, managers |

---

### employee_position
| Property | Value |
|----------|-------|
| Column Name | `employee_position` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Employee's job title/position |
| UI Label | "Position" |
| UI Type | Text Input |
| UI Placeholder | "Senior Recruiter" |
| UI Visible | HR, managers, employee profile |

---

### employee_salary
| Property | Value |
|----------|-------|
| Column Name | `employee_salary` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Precision | 2 decimal places |
| Description | Employee's annual salary |
| UI Label | "Annual Salary" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Visible | HR only (PII) |
| Access Control | Restricted to HR and payroll roles |

---

### employee_status
| Property | Value |
|----------|-------|
| Column Name | `employee_status` |
| Type | `TEXT` |
| Required | No |
| Default | `'active'` |
| Allowed Values | `active`, `on_leave`, `terminated` |
| Description | Current employment status |
| UI Label | "Status" |
| UI Type | Badge/Dropdown |

**Enum Values:**
| Value | Display Label | Color |
|-------|---------------|-------|
| `active` | Active | Green |
| `on_leave` | On Leave | Yellow |
| `terminated` | Terminated | Red |

---

### employee_manager_id
| Property | Value |
|----------|-------|
| Column Name | `employee_manager_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` (self-referencing) |
| Description | Direct manager's user ID |
| UI Label | "Reports To" |
| UI Type | User Select (filtered to managers) |
| Used For | Org chart, approval workflows |

---

### employee_performance_rating
| Property | Value |
|----------|-------|
| Column Name | `employee_performance_rating` |
| Type | `NUMERIC(3,2)` |
| Required | No |
| Min | 0.00 |
| Max | 5.00 |
| Precision | 2 decimal places |
| Description | Latest performance rating |
| UI Label | "Performance Rating" |
| UI Type | Star Rating (1-5) |
| UI Visible | HR, direct manager |
| Used For | Performance reviews, compensation adjustments |

---

## Candidate Fields (Recruiting/Bench Sales)

### candidate_status
| Property | Value |
|----------|-------|
| Column Name | `candidate_status` |
| Type | `TEXT` |
| Required | No (auto-set when candidate role activated) |
| Default | `'active'` |
| Allowed Values | `active`, `placed`, `bench`, `inactive`, `blacklisted` |
| Description | Candidate's current status in the system |
| UI Label | "Status" |
| UI Type | Status Badge/Dropdown |
| Index | Yes (`idx_user_profiles_candidate_status`) |

**Enum Values:**
| Value | Display Label | Color | Description |
|-------|---------------|-------|-------------|
| `active` | Active | Green | Actively seeking roles |
| `placed` | Placed | Blue | Currently on assignment |
| `bench` | On Bench | Yellow | Between assignments |
| `inactive` | Inactive | Gray | Not actively seeking |
| `blacklisted` | Do Not Contact | Red | Blacklisted |

---

### candidate_resume_url
| Property | Value |
|----------|-------|
| Column Name | `candidate_resume_url` |
| Type | `TEXT` |
| Required | No (highly recommended) |
| Description | URL to candidate's resume file |
| UI Label | "Resume" |
| UI Type | File Upload |
| Storage | Supabase Storage bucket: `resumes/` |
| Allowed Formats | PDF, DOC, DOCX |
| Max Size | 5 MB |
| Validation | Valid URL format |

---

### candidate_skills
| Property | Value |
|----------|-------|
| Column Name | `candidate_skills` |
| Type | `TEXT[]` (Array) |
| Required | No (recommended) |
| Max Items | 50 |
| Description | Candidate's technical and professional skills |
| UI Label | "Skills" |
| UI Type | Tag Input with autocomplete |
| Autocomplete Source | `skills` table |
| Allow Custom | Yes |
| Searchable | Yes (indexed with GIN) |
| Index | Yes (GIN index for array search) |

---

### candidate_experience_years
| Property | Value |
|----------|-------|
| Column Name | `candidate_experience_years` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 70 |
| Description | Total years of professional experience |
| UI Label | "Years of Experience" |
| UI Type | Number Input |
| UI Suffix | "years" |

---

### candidate_current_visa
| Property | Value |
|----------|-------|
| Column Name | `candidate_current_visa` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `H1B`, `GC`, `USC`, `OPT`, `CPT`, `TN`, `L1`, `E3`, `H4_EAD`, `Other` |
| Description | Current work authorization status |
| UI Label | "Work Authorization" |
| UI Type | Dropdown |
| Note | Deprecated - use `candidate_work_authorizations` table for detailed tracking |

---

### candidate_visa_expiry
| Property | Value |
|----------|-------|
| Column Name | `candidate_visa_expiry` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Visa/work authorization expiration date |
| UI Label | "Work Auth Expiry" |
| UI Type | Date Picker |
| Validation | Future date |
| Alert | Show warning 90 days before expiry |
| Note | Deprecated - use `candidate_work_authorizations` table |

---

### candidate_hourly_rate
| Property | Value |
|----------|-------|
| Column Name | `candidate_hourly_rate` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Desired hourly rate |
| UI Label | "Hourly Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | "/hr" |

---

### candidate_bench_start_date
| Property | Value |
|----------|-------|
| Column Name | `candidate_bench_start_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Date candidate went on bench |
| UI Label | "Bench Since" |
| UI Type | Display only |
| Auto Set | When status changes to `bench` |
| Used For | Bench aging calculations |

---

### candidate_availability
| Property | Value |
|----------|-------|
| Column Name | `candidate_availability` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `immediate`, `2_weeks`, `1_month` |
| Description | How quickly candidate can start |
| UI Label | "Availability" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label |
|-------|---------------|
| `immediate` | Immediate |
| `2_weeks` | 2 Weeks |
| `1_month` | 1 Month |

---

### candidate_location
| Property | Value |
|----------|-------|
| Column Name | `candidate_location` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Candidate's current location |
| UI Label | "Location" |
| UI Type | Text Input |
| UI Placeholder | "San Francisco, CA" |
| Note | Deprecated - use `addresses` table for structured location data |

---

### candidate_willing_to_relocate
| Property | Value |
|----------|-------|
| Column Name | `candidate_willing_to_relocate` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Whether candidate is willing to relocate |
| UI Label | "Willing to Relocate" |
| UI Type | Checkbox |

---

## Enhanced Candidate Personal Details

### middle_name
| Property | Value |
|----------|-------|
| Column Name | `middle_name` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Candidate's middle name |
| UI Label | "Middle Name" |
| UI Type | Text Input |
| UI Visible | Extended profile form |

---

### preferred_name
| Property | Value |
|----------|-------|
| Column Name | `preferred_name` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Name candidate prefers to be called |
| UI Label | "Preferred Name" |
| UI Type | Text Input |
| UI Placeholder | "Bob (if first_name is Robert)" |
| UI Priority | Display over first_name in UI |

---

### date_of_birth
| Property | Value |
|----------|-------|
| Column Name | `date_of_birth` |
| Type | `DATE` |
| Required | No |
| Description | Candidate's date of birth |
| UI Label | "Date of Birth" |
| UI Type | Date Picker |
| Validation | Must be 18+ years old |
| PII | Yes (restricted access) |
| Used For | Age verification, background checks |

---

### gender
| Property | Value |
|----------|-------|
| Column Name | `gender` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `male`, `female`, `non_binary`, `prefer_not_to_say`, `other` |
| Description | Candidate's gender identity |
| UI Label | "Gender" |
| UI Type | Dropdown (optional) |
| PII | Yes |

---

### nationality
| Property | Value |
|----------|-------|
| Column Name | `nationality` |
| Type | `TEXT` |
| Required | No |
| Description | Candidate's nationality/citizenship |
| UI Label | "Nationality" |
| UI Type | Country Dropdown |
| Format | Full country name or ISO 3166-1 alpha-2 code |
| Index | Yes (`idx_user_profiles_nationality`) |

---

## Enhanced Candidate Contact

### email_secondary
| Property | Value |
|----------|-------|
| Column Name | `email_secondary` |
| Type | `TEXT` |
| Required | No |
| Max Length | 255 characters |
| Description | Secondary/backup email address |
| UI Label | "Secondary Email" |
| UI Type | Email Input |
| Validation | Valid email format, different from primary |

---

### phone_home
| Property | Value |
|----------|-------|
| Column Name | `phone_home` |
| Type | `TEXT` |
| Required | No |
| Max Length | 50 characters |
| Description | Home phone number |
| UI Label | "Home Phone" |
| UI Type | Phone Input |

---

### phone_work
| Property | Value |
|----------|-------|
| Column Name | `phone_work` |
| Type | `TEXT` |
| Required | No |
| Max Length | 50 characters |
| Description | Work/office phone number |
| UI Label | "Work Phone" |
| UI Type | Phone Input |

---

### preferred_contact_method
| Property | Value |
|----------|-------|
| Column Name | `preferred_contact_method` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `email`, `phone`, `text` |
| Description | Candidate's preferred contact method |
| UI Label | "Preferred Contact Method" |
| UI Type | Radio Buttons |
| Used For | Communication workflow routing |

---

### preferred_call_time
| Property | Value |
|----------|-------|
| Column Name | `preferred_call_time` |
| Type | `TEXT` |
| Required | No |
| Description | Best time to call candidate |
| UI Label | "Best Time to Call" |
| UI Type | Text Input |
| UI Placeholder | "Weekdays 9am-5pm EST" |

---

### do_not_contact
| Property | Value |
|----------|-------|
| Column Name | `do_not_contact` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Do not contact candidate at all |
| UI Label | "Do Not Contact" |
| UI Type | Checkbox |
| UI Alert | Red warning if checked |
| Used For | Compliance, blacklisting |

---

### do_not_email
| Property | Value |
|----------|-------|
| Column Name | `do_not_email` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Do not send emails to candidate |
| UI Label | "Do Not Email" |
| UI Type | Checkbox |
| Used For | Email workflow filtering |

---

### do_not_text
| Property | Value |
|----------|-------|
| Column Name | `do_not_text` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Do not send SMS to candidate |
| UI Label | "Do Not Text" |
| UI Type | Checkbox |
| Used For | SMS workflow filtering |

---

### linkedin_url
| Property | Value |
|----------|-------|
| Column Name | `linkedin_url` |
| Type | `TEXT` |
| Required | No |
| Description | Candidate's LinkedIn profile URL |
| UI Label | "LinkedIn" |
| UI Type | URL Input |
| UI Prefix Icon | LinkedIn logo |
| Validation | Valid LinkedIn URL format |
| Example | `https://www.linkedin.com/in/johndoe` |

---

### github_url
| Property | Value |
|----------|-------|
| Column Name | `github_url` |
| Type | `TEXT` |
| Required | No |
| Description | Candidate's GitHub profile URL |
| UI Label | "GitHub" |
| UI Type | URL Input |
| UI Prefix Icon | GitHub logo |
| Validation | Valid GitHub URL format |
| Example | `https://github.com/johndoe` |

---

### portfolio_url
| Property | Value |
|----------|-------|
| Column Name | `portfolio_url` |
| Type | `TEXT` |
| Required | No |
| Description | Candidate's portfolio website |
| UI Label | "Portfolio" |
| UI Type | URL Input |
| Validation | Valid URL format |

---

### personal_website
| Property | Value |
|----------|-------|
| Column Name | `personal_website` |
| Type | `TEXT` |
| Required | No |
| Description | Candidate's personal website |
| UI Label | "Personal Website" |
| UI Type | URL Input |
| Validation | Valid URL format |

---

## Emergency Contact

### emergency_contact_name
| Property | Value |
|----------|-------|
| Column Name | `emergency_contact_name` |
| Type | `TEXT` |
| Required | No (required for placements) |
| Max Length | 200 characters |
| Description | Emergency contact person's full name |
| UI Label | "Emergency Contact Name" |
| UI Type | Text Input |

---

### emergency_contact_relationship
| Property | Value |
|----------|-------|
| Column Name | `emergency_contact_relationship` |
| Type | `TEXT` |
| Required | No |
| Max Length | 100 characters |
| Description | Relationship to candidate |
| UI Label | "Relationship" |
| UI Type | Text Input or Dropdown |
| Common Values | Spouse, Parent, Sibling, Friend |

---

### emergency_contact_phone
| Property | Value |
|----------|-------|
| Column Name | `emergency_contact_phone` |
| Type | `TEXT` |
| Required | No (required for placements) |
| Max Length | 50 characters |
| Description | Emergency contact's phone number |
| UI Label | "Emergency Contact Phone" |
| UI Type | Phone Input |

---

### emergency_contact_email
| Property | Value |
|----------|-------|
| Column Name | `emergency_contact_email` |
| Type | `TEXT` |
| Required | No |
| Max Length | 255 characters |
| Description | Emergency contact's email address |
| UI Label | "Emergency Contact Email" |
| UI Type | Email Input |

---

## Source/Marketing

### lead_source
| Property | Value |
|----------|-------|
| Column Name | `lead_source` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `job_board`, `linkedin`, `referral`, `direct`, `agency`, `career_fair`, `college`, `internal`, `other` |
| Description | Original source where candidate was found |
| UI Label | "Source" |
| UI Type | Dropdown |
| Index | Yes (`idx_user_profiles_lead_source`) |

---

### lead_source_detail
| Property | Value |
|----------|-------|
| Column Name | `lead_source_detail` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Specific source details |
| UI Label | "Source Details" |
| UI Type | Text Input |
| UI Placeholder | "Indeed", "Employee John Doe", "USC Career Fair 2024" |

---

### marketing_status
| Property | Value |
|----------|-------|
| Column Name | `marketing_status` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `active`, `passive`, `do_not_contact` |
| Description | Marketing/outreach status |
| UI Label | "Marketing Status" |
| UI Type | Dropdown |

---

### is_on_hotlist
| Property | Value |
|----------|-------|
| Column Name | `is_on_hotlist` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Whether candidate is on marketing hotlist |
| UI Label | "Hotlist" |
| UI Type | Checkbox/Badge |
| Index | Yes (`idx_user_profiles_hotlist`) |
| Used For | Bench sales marketing campaigns |

---

### hotlist_added_at
| Property | Value |
|----------|-------|
| Column Name | `hotlist_added_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When candidate was added to hotlist |
| UI Label | "Added to Hotlist" |
| UI Type | Display only |
| Auto Set | When `is_on_hotlist` changes to `true` |

---

### hotlist_added_by
| Property | Value |
|----------|-------|
| Column Name | `hotlist_added_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who added candidate to hotlist |
| UI Label | "Added By" |
| UI Type | Display only (user name) |

---

### hotlist_notes
| Property | Value |
|----------|-------|
| Column Name | `hotlist_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 characters |
| Description | Notes about why candidate is on hotlist |
| UI Label | "Hotlist Notes" |
| UI Type | Textarea |

---

## Enhanced Availability

### current_employment_status
| Property | Value |
|----------|-------|
| Column Name | `current_employment_status` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `employed`, `unemployed`, `student`, `freelance`, `on_bench`, `other` |
| Description | Candidate's current employment situation |
| UI Label | "Employment Status" |
| UI Type | Dropdown |
| Index | Yes (`idx_user_profiles_employment_status`) |

---

### notice_period_days
| Property | Value |
|----------|-------|
| Column Name | `notice_period_days` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 365 |
| Description | Number of days notice required at current job |
| UI Label | "Notice Period" |
| UI Type | Number Input |
| UI Suffix | "days" |
| Common Values | 0 (immediate), 14, 30, 60, 90 |

---

### earliest_start_date
| Property | Value |
|----------|-------|
| Column Name | `earliest_start_date` |
| Type | `DATE` |
| Required | No |
| Description | Earliest date candidate can start work |
| UI Label | "Earliest Start Date" |
| UI Type | Date Picker |
| Validation | Must be current or future date |

---

### preferred_employment_type
| Property | Value |
|----------|-------|
| Column Name | `preferred_employment_type` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Allowed Values | `contract`, `permanent`, `part_time`, `temp_to_hire`, `freelance` |
| Description | Types of employment candidate is interested in |
| UI Label | "Preferred Employment Types" |
| UI Type | Multi-select Checkboxes |

---

## Enhanced Relocation

### preferred_locations
| Property | Value |
|----------|-------|
| Column Name | `preferred_locations` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 10 |
| Description | Locations candidate is willing to work |
| UI Label | "Preferred Locations" |
| UI Type | Tag Input with location autocomplete |
| Example | `["New York, NY", "San Francisco, CA", "Remote"]` |

---

### relocation_assistance_required
| Property | Value |
|----------|-------|
| Column Name | `relocation_assistance_required` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `false` |
| Description | Whether candidate needs relocation assistance |
| UI Label | "Needs Relocation Assistance" |
| UI Type | Checkbox |

---

### relocation_notes
| Property | Value |
|----------|-------|
| Column Name | `relocation_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | Additional relocation details |
| UI Label | "Relocation Notes" |
| UI Type | Textarea |

---

## Enhanced Compensation

### desired_salary_annual
| Property | Value |
|----------|-------|
| Column Name | `desired_salary_annual` |
| Type | `NUMERIC(12,2)` |
| Required | No |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Desired annual salary |
| UI Label | "Desired Annual Salary" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | "/year" |

---

### desired_salary_currency
| Property | Value |
|----------|-------|
| Column Name | `desired_salary_currency` |
| Type | `TEXT` |
| Required | No |
| Default | `'USD'` |
| Allowed Values | ISO 4217 currency codes |
| Description | Currency for salary values |
| UI Label | "Currency" |
| UI Type | Dropdown |
| Common Values | `USD`, `CAD`, `GBP`, `EUR`, `INR` |

---

### minimum_hourly_rate
| Property | Value |
|----------|-------|
| Column Name | `minimum_hourly_rate` |
| Type | `NUMERIC(10,2)` |
| Required | No |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Minimum acceptable hourly rate |
| UI Label | "Minimum Hourly Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | "/hr" |

---

### minimum_annual_salary
| Property | Value |
|----------|-------|
| Column Name | `minimum_annual_salary` |
| Type | `NUMERIC(12,2)` |
| Required | No |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Minimum acceptable annual salary |
| UI Label | "Minimum Annual Salary" |
| UI Type | Currency Input |
| UI Prefix | "$" |

---

### benefits_required
| Property | Value |
|----------|-------|
| Column Name | `benefits_required` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 20 |
| Description | Benefits candidate requires |
| UI Label | "Required Benefits" |
| UI Type | Multi-select Checkboxes |
| Common Values | `health_insurance`, `dental`, `vision`, `401k`, `pto`, `remote_work` |

---

### compensation_notes
| Property | Value |
|----------|-------|
| Column Name | `compensation_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | Additional compensation requirements |
| UI Label | "Compensation Notes" |
| UI Type | Textarea |

---

## Languages

### languages
| Property | Value |
|----------|-------|
| Column Name | `languages` |
| Type | `JSONB` |
| Required | No |
| Default | `[]` |
| Description | Languages candidate speaks |
| Data Structure | `[{ language: string, proficiency: string }, ...]` |
| Example | `[{ "language": "English", "proficiency": "native" }, { "language": "Spanish", "proficiency": "fluent" }]` |
| Proficiency Levels | `native`, `fluent`, `professional`, `intermediate`, `basic` |
| UI Type | Dynamic list with language dropdown + proficiency select |

---

## Rating/Quality

### recruiter_rating
| Property | Value |
|----------|-------|
| Column Name | `recruiter_rating` |
| Type | `INTEGER` |
| Required | No |
| Min | 1 |
| Max | 5 |
| Description | Recruiter's rating of candidate quality |
| UI Label | "Recruiter Rating" |
| UI Type | Star Rating (1-5 stars) |
| Index | Yes (`idx_user_profiles_recruiter_rating`) |
| Access Control | Internal only (not visible to candidate) |

---

### recruiter_rating_notes
| Property | Value |
|----------|-------|
| Column Name | `recruiter_rating_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 1000 characters |
| Description | Notes explaining rating |
| UI Label | "Rating Notes" |
| UI Type | Textarea |
| Access Control | Internal only |

---

### profile_completeness_score
| Property | Value |
|----------|-------|
| Column Name | `profile_completeness_score` |
| Type | `INTEGER` |
| Required | No |
| Default | `0` |
| Min | 0 |
| Max | 100 |
| Description | Automated profile completeness score (0-100%) |
| UI Display | Progress bar in profile header |
| Auto Update | Via database function `calculate_profile_completeness()` |
| Calculation | See "Profile Completeness Calculation" section below |

---

### last_profile_update
| Property | Value |
|----------|-------|
| Column Name | `last_profile_update` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time profile was updated |
| UI Display | "Profile updated X days ago" |
| Auto Update | Via trigger on related table changes |

---

### last_activity_date
| Property | Value |
|----------|-------|
| Column Name | `last_activity_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time candidate had any activity |
| UI Display | Display only |
| Auto Update | Via activity tracking triggers |
| Index | Yes (`idx_user_profiles_last_activity`) |
| Used For | Stale candidate detection |

---

### last_contacted_at
| Property | Value |
|----------|-------|
| Column Name | `last_contacted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Last time candidate was contacted |
| UI Display | "Last contacted X days ago" |
| Auto Set | When email/call activity created |

---

### last_contacted_by
| Property | Value |
|----------|-------|
| Column Name | `last_contacted_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who last contacted candidate |
| UI Display | Display as user name |

---

## Professional Summary

### professional_headline
| Property | Value |
|----------|-------|
| Column Name | `professional_headline` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Short professional tagline |
| UI Label | "Professional Headline" |
| UI Type | Text Input |
| UI Placeholder | "Senior Full Stack Engineer specializing in React & Node.js" |
| Searchable | Yes |

---

### professional_summary
| Property | Value |
|----------|-------|
| Column Name | `professional_summary` |
| Type | `TEXT` |
| Required | No |
| Max Length | 5000 characters |
| Description | Detailed professional summary/bio |
| UI Label | "Professional Summary" |
| UI Type | Textarea (rich text optional) |
| Searchable | Yes |

---

### career_objectives
| Property | Value |
|----------|-------|
| Column Name | `career_objectives` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 characters |
| Description | Candidate's career goals and objectives |
| UI Label | "Career Objectives" |
| UI Type | Textarea |

---

## Tags/Categories

### tags
| Property | Value |
|----------|-------|
| Column Name | `tags` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 50 |
| Description | Freeform tags for categorization |
| UI Label | "Tags" |
| UI Type | Tag Input |
| Allow Custom | Yes |
| Example | `["hot_candidate", "java_expert", "cloud_certified"]` |
| Index | Yes (GIN index `idx_user_profiles_tags`) |
| Searchable | Yes |

---

### categories
| Property | Value |
|----------|-------|
| Column Name | `categories` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 20 |
| Description | Predefined categories |
| UI Label | "Categories" |
| UI Type | Multi-select Dropdown |
| Example | `["software_engineering", "cloud_architect", "devops"]` |

---

## Client Fields

### client_company_name
| Property | Value |
|----------|-------|
| Column Name | `client_company_name` |
| Type | `TEXT` |
| Required | No (required if user is client) |
| Max Length | 200 characters |
| Description | Name of client company |
| UI Label | "Company Name" |
| UI Type | Text Input |
| UI Visible | Only for client role |

---

### client_industry
| Property | Value |
|----------|-------|
| Column Name | `client_industry` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Client's industry |
| UI Label | "Industry" |
| UI Type | Dropdown or Text Input |

---

### client_tier
| Property | Value |
|----------|-------|
| Column Name | `client_tier` |
| Type | `TEXT` |
| Required | No |
| Allowed Values | `preferred`, `strategic`, `exclusive` |
| Description | Client relationship tier |
| UI Label | "Tier" |
| UI Type | Dropdown |

**Enum Values:**
| Value | Display Label | Description |
|-------|---------------|-------------|
| `preferred` | Preferred | Preferred client |
| `strategic` | Strategic | Strategic partnership |
| `exclusive` | Exclusive | Exclusive relationship |

---

### client_contract_start_date
| Property | Value |
|----------|-------|
| Column Name | `client_contract_start_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Client contract start date |
| UI Label | "Contract Start" |
| UI Type | Date Picker |

---

### client_contract_end_date
| Property | Value |
|----------|-------|
| Column Name | `client_contract_end_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Client contract end date |
| UI Label | "Contract End" |
| UI Type | Date Picker |
| Validation | Must be after start date |

---

### client_payment_terms
| Property | Value |
|----------|-------|
| Column Name | `client_payment_terms` |
| Type | `INTEGER` |
| Required | No |
| Default | `30` |
| Description | Payment terms in days |
| UI Label | "Payment Terms" |
| UI Type | Number Input |
| UI Suffix | "days" |
| Common Values | 15, 30, 45, 60 |

---

### client_preferred_markup_percentage
| Property | Value |
|----------|-------|
| Column Name | `client_preferred_markup_percentage` |
| Type | `NUMERIC(5,2)` |
| Required | No |
| Min | 0 |
| Max | 999.99 |
| Precision | 2 decimal places |
| Description | Preferred markup percentage for this client |
| UI Label | "Preferred Markup" |
| UI Type | Number Input |
| UI Suffix | "%" |

---

## Recruiter-Specific Fields

### recruiter_territory
| Property | Value |
|----------|-------|
| Column Name | `recruiter_territory` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | Geographic territory assigned to recruiter |
| UI Label | "Territory" |
| UI Type | Text Input or Dropdown |
| Example | "West Coast", "EMEA", "Northeast US" |

---

### recruiter_specialization
| Property | Value |
|----------|-------|
| Column Name | `recruiter_specialization` |
| Type | `TEXT[]` (Array) |
| Required | No |
| Max Items | 10 |
| Description | Recruiter's areas of specialization |
| UI Label | "Specializations" |
| UI Type | Multi-select Dropdown |
| Example | `["IT", "Healthcare", "Finance"]` |

---

### recruiter_monthly_placement_target
| Property | Value |
|----------|-------|
| Column Name | `recruiter_monthly_placement_target` |
| Type | `INTEGER` |
| Required | No |
| Default | `2` |
| Min | 0 |
| Description | Monthly placement goal |
| UI Label | "Monthly Target" |
| UI Type | Number Input |
| UI Suffix | "placements" |

---

### recruiter_pod_id
| Property | Value |
|----------|-------|
| Column Name | `recruiter_pod_id` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `pods(id)` |
| Description | Team/pod recruiter belongs to |
| UI Label | "Pod/Team" |
| UI Type | Dropdown |
| Note | Pods = Teams in InTime v3 |

---

## Role & Access Control

### employee_role
| Property | Value |
|----------|-------|
| Column Name | `employee_role` |
| Type | `TEXT` |
| Required | No (recommended for employees) |
| Max Length | 100 characters |
| Description | RBAC role for access control |
| UI Label | "Role" |
| UI Type | Dropdown |
| Common Values | `recruiter`, `recruiting_manager`, `bench_sales`, `ta_specialist`, `hr`, `admin`, `ceo` |
| Used For | Permission checking, role hierarchy |
| Note | See `src/lib/workspace/role-hierarchy.ts` for role mapping |

---

### title
| Property | Value |
|----------|-------|
| Column Name | `title` |
| Type | `TEXT` |
| Required | No |
| Max Length | 200 characters |
| Description | User's job title (display only) |
| UI Label | "Title" |
| UI Type | Text Input |
| Note | Different from `employee_position` - this is for display |

---

## Billing Integration

### stripe_customer_id
| Property | Value |
|----------|-------|
| Column Name | `stripe_customer_id` |
| Type | `TEXT` |
| Required | No |
| Max Length | 255 characters |
| Description | Stripe customer ID for billing |
| UI Display | Hidden |
| Format | Starts with `cus_` |
| Used For | Payment processing integration |

---

## Metrics

### total_placements
| Property | Value |
|----------|-------|
| Column Name | `total_placements` |
| Type | `INTEGER` |
| Required | No |
| Default | `0` |
| Min | 0 |
| Description | Total number of successful placements |
| UI Display | Read-only metric |
| Auto Increment | When placement is created |
| Used For | Recruiter performance tracking |

---

### leaderboard_visible
| Property | Value |
|----------|-------|
| Column Name | `leaderboard_visible` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `true` |
| Description | Whether user appears on leaderboards |
| UI Label | "Show on Leaderboard" |
| UI Type | Checkbox |
| UI Visible | User preferences |

---

## Audit Fields

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp when profile was created |
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
| Description | User who created this profile |
| UI Display | Display only (user name) |

---

### updated_by
| Property | Value |
|----------|-------|
| Column Name | `updated_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who last updated this profile |
| UI Display | Display only (user name) |

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

---

### is_active
| Property | Value |
|----------|-------|
| Column Name | `is_active` |
| Type | `BOOLEAN` |
| Required | No |
| Default | `true` |
| Description | Whether user profile is active |
| UI Label | "Active" |
| UI Type | Checkbox (admin only) |
| Used For | Deactivating users without deletion |

---

### search_vector
| Property | Value |
|----------|-------|
| Column Name | `search_vector` |
| Type | `TEXT` |
| Required | No |
| Description | Full-text search vector |
| Auto Update | Via trigger on INSERT/UPDATE |
| Includes | `full_name`, `email`, `professional_headline`, `professional_summary`, `candidate_skills`, `tags` |
| Note | In PostgreSQL, this would typically be `TSVECTOR` but Drizzle uses TEXT |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `user_profiles_pkey` | `id` | BTREE | Primary key |
| `user_profiles_auth_id_unique` | `auth_id` | BTREE | Auth user linkage (unique) |
| `user_profiles_email_unique` | `email` | BTREE | Email uniqueness constraint |
| `idx_user_profiles_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_user_profiles_candidate_status` | `candidate_status` | BTREE | Candidate status filtering |
| `idx_user_profiles_lead_source` | `lead_source` | BTREE | Source reporting |
| `idx_user_profiles_hotlist` | `is_on_hotlist` | BTREE | Hotlist filtering (WHERE TRUE) |
| `idx_user_profiles_employment_status` | `current_employment_status` | BTREE | Employment status filtering |
| `idx_user_profiles_recruiter_rating` | `recruiter_rating` | BTREE | Rating queries |
| `idx_user_profiles_nationality` | `nationality` | BTREE | Nationality filtering |
| `idx_user_profiles_last_activity` | `last_activity_date` | BTREE | Activity-based queries |
| `idx_user_profiles_tags` | `tags` | GIN | Array search for tags |
| `idx_user_profiles_skills` | `candidate_skills` | GIN | Array search for skills |
| `idx_user_profiles_deleted_at` | `deleted_at` | BTREE | Soft delete (WHERE NULL) |

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "user_profiles_org_isolation" ON user_profiles
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Users can view their own profile
CREATE POLICY "users_can_view_own_profile" ON user_profiles
  FOR SELECT
  USING (auth_id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "users_can_update_own_profile" ON user_profiles
  FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Full Name Trigger
```sql
CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := TRIM(CONCAT(NEW.first_name, ' ', NEW.last_name));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_full_name
  BEFORE INSERT OR UPDATE OF first_name, last_name ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_full_name();
```

### Profile Completeness Trigger
```sql
CREATE TRIGGER user_profiles_completeness
  AFTER INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();
```

---

## Profile Completeness Calculation

The `profile_completeness_score` is automatically calculated based on the following criteria:

### Scoring Breakdown (Total: 100%)

| Category | Points | Criteria |
|----------|--------|----------|
| **Personal Info** | 10% | `first_name` AND `last_name` populated |
| **Contact** | 10% | `email` AND `phone` populated |
| **Address** | 10% | Has at least one address in `addresses` table |
| **Work Authorization** | 15% | Has active work authorization in `candidate_work_authorizations` |
| **Skills** | 10% | `candidate_skills` array has ≥3 items |
| **Experience** | 10% | Has at least one entry in `candidate_work_history` |
| **Education** | 5% | Has at least one entry in `candidate_education` |
| **Availability** | 10% | `candidate_availability` is set |
| **Rates** | 10% | `candidate_hourly_rate` OR `desired_salary_annual` is set |
| **References** | 5% | Has at least 2 entries in `candidate_references` |
| **Certifications (Bonus)** | +5% | Has at least one certification (max 100%) |

### Implementation

```sql
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_candidate_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Personal Info (10%)
  IF EXISTS(SELECT 1 FROM user_profiles
    WHERE id = p_candidate_id
    AND first_name IS NOT NULL
    AND last_name IS NOT NULL) THEN
    score := score + 10;
  END IF;

  -- Contact (10%)
  IF EXISTS(SELECT 1 FROM user_profiles
    WHERE id = p_candidate_id
    AND email IS NOT NULL
    AND phone IS NOT NULL) THEN
    score := score + 10;
  END IF;

  -- Address (10%)
  IF EXISTS(SELECT 1 FROM addresses
    WHERE entity_type = 'candidate'
    AND entity_id = p_candidate_id) THEN
    score := score + 10;
  END IF;

  -- Work Authorization (15%)
  IF EXISTS(SELECT 1 FROM candidate_work_authorizations
    WHERE candidate_id = p_candidate_id
    AND status = 'active') THEN
    score := score + 15;
  END IF;

  -- Skills (10%)
  IF EXISTS(SELECT 1 FROM user_profiles
    WHERE id = p_candidate_id
    AND candidate_skills IS NOT NULL
    AND array_length(candidate_skills, 1) >= 3) THEN
    score := score + 10;
  END IF;

  -- Experience (10%)
  IF EXISTS(SELECT 1 FROM candidate_work_history
    WHERE candidate_id = p_candidate_id) THEN
    score := score + 10;
  END IF;

  -- Education (5%)
  IF EXISTS(SELECT 1 FROM candidate_education
    WHERE candidate_id = p_candidate_id) THEN
    score := score + 5;
  END IF;

  -- Availability (10%)
  IF EXISTS(SELECT 1 FROM user_profiles
    WHERE id = p_candidate_id
    AND candidate_availability IS NOT NULL) THEN
    score := score + 10;
  END IF;

  -- Rates (10%)
  IF EXISTS(SELECT 1 FROM user_profiles
    WHERE id = p_candidate_id
    AND (candidate_hourly_rate IS NOT NULL
         OR desired_salary_annual IS NOT NULL)) THEN
    score := score + 10;
  END IF;

  -- References (5%)
  IF EXISTS(SELECT 1 FROM candidate_references
    WHERE candidate_id = p_candidate_id
    LIMIT 2) THEN
    score := score + 5;
  END IF;

  -- Certifications bonus (5%)
  IF EXISTS(SELECT 1 FROM candidate_certifications
    WHERE candidate_id = p_candidate_id) THEN
    score := LEAST(score + 5, 100);
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;
```

---

## Search Vector Composition

The `search_vector` field includes the following fields for full-text search:

### Included Fields
1. `full_name` (weight: A - highest)
2. `email` (weight: B)
3. `professional_headline` (weight: A)
4. `professional_summary` (weight: B)
5. `candidate_skills` (weight: A)
6. `tags` (weight: B)
7. `candidate_location` (weight: C)
8. `candidate_current_visa` (weight: C)
9. `preferred_name` (weight: B)

### Search Query Example
```sql
SELECT * FROM user_profiles
WHERE to_tsvector('english', search_vector) @@ to_tsquery('english', 'java & senior');
```

---

## Role-Based Field Visibility

Different user roles have access to different fields:

### Candidate (Self-View)
**Can View:**
- All core fields
- All candidate fields
- All student fields (if enrolled)
- Own compensation fields
- Own professional summary

**Cannot View:**
- `recruiter_rating` and `recruiter_rating_notes`
- `employee_salary`
- `hotlist_notes`
- Other users' data

---

### Recruiter
**Can View:**
- All candidate fields
- `recruiter_rating` and `recruiter_rating_notes`
- Hotlist fields
- Contact preferences
- Availability and compensation

**Cannot View:**
- `employee_salary` (unless HR role)
- Other recruiters' private notes (unless manager)

---

### HR Manager
**Can View:**
- All employee fields including `employee_salary`
- All candidate fields
- All personal and contact information
- Emergency contact information

**Cannot View:**
- Fields outside their organization

---

### Client Portal User
**Can View:**
- Own client fields
- Assigned candidate basic info (name, skills, experience)
- Submission-related candidate data

**Cannot View:**
- Compensation details
- Contact information (unless submission approved)
- Other clients' data

---

### Admin/CEO
**Can View:**
- All fields across all role types
- All audit trails
- All metrics and ratings

---

## Related Tables

| Table | Relationship | FK Column |
|-------|--------------|-----------|
| `organizations` | Parent | `org_id` |
| `auth.users` | Parent (Supabase) | `auth_id` |
| `user_profiles` | Self-ref (Manager) | `employee_manager_id` |
| `pods` | Parent | `recruiter_pod_id` |
| `addresses` | Children (polymorphic) | `addresses.entity_id` |
| `candidate_work_authorizations` | Children | `candidate_id` |
| `candidate_education` | Children | `candidate_id` |
| `candidate_work_history` | Children | `candidate_id` |
| `candidate_certifications` | Children | `candidate_id` |
| `candidate_references` | Children | `candidate_id` |
| `candidate_background_checks` | Children | `candidate_id` |
| `candidate_compliance_documents` | Children | `candidate_id` |
| `submissions` | Children | `submissions.candidate_id` |
| `placements` | Children | `placements.consultant_id` |
| `activities` | Children (polymorphic) | `activities.entity_id` |
| `notes` | Children (polymorphic) | `notes.entity_id` |
| `academy_enrollments` | Children | `student_id` |

---

## Business Rules

### Multi-Role Support
- A single user can have multiple role types simultaneously
- Role detection: If `student_enrollment_date` is set → student role
- Role detection: If `employee_hire_date` is set → employee role
- Role detection: If `candidate_status` is set → candidate role
- Role detection: If `client_company_name` is set → client role
- Role detection: If `recruiter_territory` is set → recruiter role

### Field Inheritance
- When a candidate becomes an employee, candidate fields remain populated
- When an employee is terminated, `employee_status` = `terminated` but data persists
- Soft delete (`deleted_at`) preserves all historical data

### Validation Rules
1. **Email uniqueness:** Must be unique across entire system (not just org)
2. **Salary visibility:** `employee_salary` restricted to HR and payroll roles
3. **Do Not Contact:** If `do_not_contact` = true, system blocks outreach emails/calls
4. **Hotlist eligibility:** Only candidates with `candidate_status` IN ('active', 'bench') can be hotlisted
5. **Profile completeness:** Auto-calculated on INSERT/UPDATE of related tables

### Deprecated Fields
- `candidate_location` → Use `addresses` table instead
- `candidate_current_visa` → Use `candidate_work_authorizations` table
- `candidate_visa_expiry` → Use `candidate_work_authorizations` table

---

## Migration Notes

### From Legacy Systems
When migrating from other ATS/HRIS systems:

1. **Map role types:**
   - Bullhorn `Candidate` → `candidate_*` fields
   - Bullhorn `ClientContact` → `client_*` fields
   - Bullhorn `CorporateUser` → `employee_*` fields

2. **Handle multi-valued fields:**
   - Skills: Import as array to `candidate_skills`
   - Tags: Import as array to `tags`
   - Certifications: Create entries in `candidate_certifications` table

3. **Preserve audit history:**
   - Import original created date to `created_at`
   - Map original creator to `created_by` if user exists

4. **Data quality:**
   - Run `calculate_profile_completeness()` after import
   - Validate email format before insert
   - Check for duplicate emails

---

## Performance Considerations

### Indexing Strategy
- **GIN indexes** on array fields (`candidate_skills`, `tags`) for fast containment queries
- **BTREE indexes** on frequently filtered columns (`org_id`, `candidate_status`)
- **Partial indexes** for conditional queries (e.g., `WHERE is_on_hotlist = true`)

### Query Optimization
- Always filter by `org_id` first (tenant isolation)
- Use `deleted_at IS NULL` for active records
- For candidate search, use search_vector GIN index

### Large Table Considerations
- Expected row count: 100K+ in enterprise deployments
- Partition by `org_id` if single-tenant performance degrades
- Archive old `deleted_at` records after 7 years

---

*Last Updated: 2024-11-30*
