# Use Case: Data Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADM-004 |
| Actor | Admin (System Administrator) |
| Goal | Perform bulk data operations and maintain data quality |
| Frequency | Weekly (ongoing maintenance) |
| Estimated Time | 10-60 minutes per operation |
| Priority | Medium |

---

## Preconditions

1. User is logged in as Admin
2. User has "admin.data.manage" permission (default for Admin role)
3. Organization has data to manage (candidates, jobs, etc.)
4. Database backups are current (before destructive operations)

---

## Trigger

One of the following:
- Duplicate records detected in system
- Need to import data from external source (CSV, job board)
- Need to export data for reporting or migration
- Bulk ownership reassignment required (user leaving, pod restructure)
- Data cleanup and archival needed
- Data quality audit reveals issues
- Compliance request (GDPR data export/deletion)
- System migration or integration

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Data Management

**User Action:** Click "Admin" in sidebar, then click "Data Management"

**System Response:**
- Sidebar Admin section expands
- URL changes to: `/admin/data`
- Data management dashboard loads
- Shows data operation options

**Screen State:**
```
+----------------------------------------------------------+
| Admin › Data Management                                   |
+----------------------------------------------------------+
|
| Data Operations                                           |
|                                                           |
| ┌──────────────────────────────────────────────────────┐ |
| │ Import Data                                          │ |
| │ Bulk import candidates, jobs, or other records       │ |
| │ [Import from CSV →]                                  │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| ┌──────────────────────────────────────────────────────┐ |
| │ Export Data                                          │ |
| │ Export data for reporting or backup                  │ |
| │ [Export to CSV →]                                    │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| ┌──────────────────────────────────────────────────────┐ |
| │ Merge Duplicates                                     │ |
| │ Find and merge duplicate records                     │ |
| │ [Find Duplicates →]                                  │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| ┌──────────────────────────────────────────────────────┐ |
| │ Bulk Reassign Ownership                              │ |
| │ Transfer ownership of records                        │ |
| │ [Reassign Records →]                                 │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| ┌──────────────────────────────────────────────────────┐ |
| │ Archive Old Data                                     │ |
| │ Move inactive records to archive                     │ |
| │ [Archive Data →]                                     │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| ┌──────────────────────────────────────────────────────┐ |
| │ Data Quality Report                                  │ |
| │ View data quality metrics and issues                 │ |
| │ [View Report →]                                      │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## Use Case A: Import Data from CSV

### Entry Point: Data Management Dashboard

**User Action:** Click "Import from CSV →"

**System Response:**
- Import wizard modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                                       Import Data [×]     |
+----------------------------------------------------------+
| Step 1 of 4: Select Data Type                             |
|                                                           |
| What type of data are you importing?                      |
|                                                           |
| ○ Candidates                                              |
|   Import candidate profiles and resumes                   |
|                                                           |
| ○ Jobs                                                    |
|   Import job requisitions                                 |
|                                                           |
| ○ Accounts                                                |
|   Import client accounts                                  |
|                                                           |
| ○ Contacts                                                |
|   Import client contacts                                  |
|                                                           |
| ○ Leads                                                   |
|   Import sales leads                                      |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Continue →]                     |
+----------------------------------------------------------+
```

**User Action:** Select "Candidates", click "Continue →"

**System Response:**
- Slides to Step 2

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                                       Import Data [×]     |
+----------------------------------------------------------+
| Step 2 of 4: Download Template                            |
|                                                           |
| Download CSV Template for Candidates                      |
|                                                           |
| The template includes the following columns:              |
|                                                           |
| Required Fields:                                          |
| • email (unique identifier)                               |
| • first_name                                              |
| • last_name                                               |
| • candidate_skills (comma-separated)                      |
| • candidate_experience_years                              |
| • candidate_current_visa (USC, GC, H1B, etc.)            |
| • candidate_availability (immediate, 2_weeks, etc.)      |
| • candidate_location                                      |
| • lead_source (linkedin, indeed, etc.)                    |
|                                                           |
| Optional Fields:                                          |
| • phone, linkedin_url, professional_headline             |
| • minimum_hourly_rate, candidate_hourly_rate             |
| • candidate_willing_to_relocate (true/false)             |
| • tags (comma-separated)                                  |
|                                                           |
| [Download Template (CSV)]                                 |
| [Download Sample Data (CSV)]                              |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Already have a CSV file?                                  |
| [Skip to Upload →]                                        |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Continue →]           |
+----------------------------------------------------------+
```

**User Action:** Click "Download Template (CSV)"

**System Response:**
- Downloads `candidates_import_template.csv`
- Template opens in Excel/Google Sheets

**Template Contents:**
```csv
email,first_name,last_name,candidate_skills,candidate_experience_years,candidate_current_visa,candidate_availability,candidate_location,lead_source,phone,linkedin_url,professional_headline,minimum_hourly_rate,candidate_hourly_rate,candidate_willing_to_relocate,tags
example@email.com,John,Doe,"React,Node.js,AWS",5,H1B,immediate,"San Francisco, CA",linkedin,(555) 123-4567,https://linkedin.com/in/johndoe,Senior Software Engineer,85,110,false,"client-ready,react-expert"
```

**User Action:** Fill template with candidate data, save as `candidates_import.csv`

**User Action:** Click "Continue →" in modal

**System Response:**
- Slides to Step 3

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                                       Import Data [×]     |
+----------------------------------------------------------+
| Step 3 of 4: Upload & Validate                            |
|                                                           |
| Upload Your CSV File                                      |
|                                                           |
| [                                                      ]  |
| [           Drag & Drop CSV Here                      ]  |
| [              or Click to Browse                     ]  |
| [                                                      ]  |
| [                Max size: 25 MB                      ]  |
|                                                           |
| Import Options                                            |
|                                                           |
| Duplicate Handling                                        |
| ● Skip duplicates (based on email)                       |
| ○ Update existing records                                |
| ○ Create all (even duplicates)                           |
|                                                           |
| ☑ Send welcome email to new candidates                   |
| ☑ Add to "Imported" tag for tracking                     |
| ☐ Associate with specific job: [Select job...         ▼] |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Upload & Validate →]  |
+----------------------------------------------------------+
```

**User Action:** Drag `candidates_import.csv` to upload area

**System Response:**
- File appears in upload area
- Shows file name and size

**User Action:** Select "Update existing records" for duplicates

**User Action:** Click "Upload & Validate →"

**System Response:**
- Uploads CSV file
- Validates each row
- Shows validation results

**Screen State (Step 4 - Validation Results):**
```
+----------------------------------------------------------+
|                                       Import Data [×]     |
+----------------------------------------------------------+
| Step 4 of 4: Review & Import                              |
|                                                           |
| Validation Results                                        |
|                                                           |
| ✅ 87 candidates ready to import                         |
| ⚠️  12 candidates have warnings                          |
| ❌ 5 candidates have errors                              |
|                                                           |
| Total rows: 104                                           |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Detailed Results                                          |
|                                                           |
| Row | Email              | Status  | Issue                |
| ────────────────────────────────────────────────────────|
| 1   | john@email.com     | ✅ Ready | -                   |
| 2   | jane@email.com     | ✅ Ready | -                   |
| 5   | sarah@email.com    | ⚠️  Warn | Duplicate email (will update) |
| 10  | invalid-email      | ❌ Error| Invalid email format|
| 15  | mike@email.com     | ❌ Error| Missing required field: candidate_skills |
| 23  | amy@email.com      | ⚠️  Warn | Unknown visa type: "E3" (will set to "Other") |
| 47  | carlos@email.com   | ❌ Error| Invalid availability: "asap" |
|                                                           |
| [View All Rows] [Download Error Report (CSV)]             |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Import Options                                            |
|                                                           |
| ● Import only valid rows (87 candidates)                 |
| ○ Fix errors and re-upload                               |
| ○ Import valid + warning rows (99 candidates)            |
|                                                           |
| Estimated time: ~2 minutes                                |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Import Candidates ✓]  |
+----------------------------------------------------------+
```

**Validation Rules:**

| Field | Validation |
|-------|------------|
| email | Required, valid email format, unique (unless update mode) |
| first_name | Required, 2-50 chars, letters only |
| last_name | Required, 2-50 chars, letters only |
| candidate_skills | Required, at least 1 skill, comma-separated |
| candidate_experience_years | Required, integer 0-50 |
| candidate_current_visa | Required, valid enum: USC, GC, H1B, L1, TN, OPT, CPT, EAD, Other |
| candidate_availability | Required, valid enum: immediate, 2_weeks, 1_month, not_available |
| candidate_location | Required, 2-200 chars |
| lead_source | Required, valid enum: linkedin, indeed, dice, monster, referral, direct, agency, job_board, other |
| phone | Optional, valid phone format |
| linkedin_url | Optional, valid LinkedIn URL format |
| minimum_hourly_rate | Optional, numeric 0-1000 |
| candidate_hourly_rate | Optional, numeric, >= minimum_hourly_rate |
| candidate_willing_to_relocate | Optional, boolean: true/false |

**User Action:** Select "Import only valid rows", click "Import Candidates ✓"

**System Response:**
1. Shows progress bar
2. Creates candidates in batches (10 at a time)
3. Uploads any attached resumes (if file path column provided)
4. Creates skills associations
5. Applies tags
6. Sends welcome emails (if selected)
7. On complete:
   - Modal shows success summary
   - Downloads error report CSV (for rows that failed)
   - Toast: "87 candidates imported successfully. 5 rows skipped due to errors."
   - Closes modal
   - Redirects to candidates list with "Imported" filter

**Screen State (Import Complete):**
```
+----------------------------------------------------------+
|                                  Import Complete! [×]     |
+----------------------------------------------------------+
| Import Summary                                            |
|                                                           |
| ✅ Successfully imported 87 candidates                   |
| ⚠️  12 candidates updated (existing records)             |
| ❌ 5 rows skipped due to errors                          |
|                                                           |
| Total processing time: 1 minute 34 seconds                |
|                                                           |
| Actions Taken:                                            |
| • Created 75 new candidate profiles                      |
| • Updated 12 existing candidate profiles                 |
| • Added 324 skills associations                          |
| • Applied "Imported" tag to all candidates               |
| • Sent 75 welcome emails                                 |
|                                                           |
| Error Report:                                             |
| [Download Error Report (CSV)]                             |
|                                                           |
| Rows 10, 15, 47, 62, 89 could not be imported.           |
| Fix errors and re-import these rows.                      |
|                                                           |
| [View Imported Candidates] [Import More Data] [Close]    |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~5 minutes (including template fill)

---

## Use Case B: Export Data to CSV

### Entry Point: Data Management Dashboard

**User Action:** Click "Export to CSV →"

**System Response:**
- Export wizard modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                                       Export Data [×]     |
+----------------------------------------------------------+
| Export Data to CSV                                        |
|                                                           |
| What data would you like to export?                       |
|                                                           |
| Data Type *                                               |
| [Candidates                                            ▼] |
|                                                           |
| Options: Candidates, Jobs, Submissions, Placements,       |
| Accounts, Contacts, Leads, Deals, Activities              |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Filters (Optional)                                        |
|                                                           |
| Date Range                                                |
| ○ All time                                                |
| ● Custom range:                                           |
|   From: [01/01/2024 📅]  To: [12/31/2024 📅]            |
|                                                           |
| Status                                                    |
| ☑ Active  ☑ Bench  ☐ Placed  ☐ Inactive                 |
|                                                           |
| Pod Filter                                                |
| [All Pods                                              ▼] |
|                                                           |
| Skills Filter (for candidates)                            |
| [Select skills...                                      ▼] |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Fields to Include                                         |
|                                                           |
| ● All fields (complete export)                           |
| ○ Standard fields (commonly used)                        |
| ○ Custom selection: [Select fields...              ▼]    |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Export Options                                            |
|                                                           |
| Format                                                    |
| ● CSV (Excel-compatible)                                 |
| ○ Excel (.xlsx)                                          |
| ○ JSON                                                    |
|                                                           |
| ☑ Include column headers                                 |
| ☑ Anonymize personal data (GDPR-friendly)                |
| ☐ Include archived records                               |
|                                                           |
| Estimated records: ~247 candidates                        |
| Estimated file size: ~2.5 MB                              |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Export Data ✓]                  |
+----------------------------------------------------------+
```

**User Action:** Configure filters (e.g., Active candidates, 2024 only)

**User Action:** Click "Export Data ✓"

**System Response:**
1. Shows progress indicator
2. Queries database with filters
3. Generates CSV file
4. If "Anonymize personal data" checked: Masks sensitive fields
5. On complete:
   - Downloads `candidates_export_2024-11-30.csv`
   - Toast: "247 candidates exported successfully"
   - Logs activity: "data.exported"

**Export Format (Candidates CSV):**
```csv
id,email,first_name,last_name,candidate_skills,candidate_experience_years,candidate_current_visa,candidate_availability,candidate_location,lead_source,phone,linkedin_url,created_at,updated_at
cand_001,john@email.com,John,Doe,"React,Node.js,AWS",5,H1B,immediate,"San Francisco, CA",linkedin,(555) 123-4567,https://linkedin.com/in/johndoe,2024-06-15T10:30:00Z,2024-11-30T08:15:00Z
cand_002,jane@email.com,Jane,Smith,"Python,Django,PostgreSQL",8,USC,2_weeks,"New York, NY",indeed,(555) 234-5678,https://linkedin.com/in/janesmith,2024-07-20T14:22:00Z,2024-11-29T16:45:00Z
```

**Time:** ~2 minutes

---

## Use Case C: Merge Duplicate Records

### Entry Point: Data Management Dashboard

**User Action:** Click "Find Duplicates →"

**System Response:**
- Duplicate detection wizard opens

**Screen State:**
```
+----------------------------------------------------------+
|                                    Find Duplicates [×]    |
+----------------------------------------------------------+
| Duplicate Detection                                       |
|                                                           |
| Entity Type *                                             |
| ● Candidates  ○ Accounts  ○ Contacts  ○ Leads           |
|                                                           |
| Detection Method                                          |
|                                                           |
| ☑ Email (exact match)                                    |
| ☑ Phone (normalized match)                               |
| ☑ Name + Location (fuzzy match, 85% similarity)          |
| ☐ LinkedIn URL (exact match)                             |
|                                                           |
| Fuzzy Matching Threshold                                  |
| [85 ]% similarity (higher = stricter)                    |
|                                                           |
| [Scan for Duplicates →]                                   |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]                                    |
+----------------------------------------------------------+
```

**User Action:** Keep default settings, click "Scan for Duplicates →"

**System Response:**
1. Shows progress indicator
2. Scans database for duplicates using selected methods
3. Groups potential duplicates
4. Shows results

**Screen State (Results):**
```
+----------------------------------------------------------+
|                                    Merge Duplicates [×]   |
+----------------------------------------------------------+
| Duplicate Candidates Found                                |
|                                                           |
| Found 23 potential duplicate groups (46 total records)    |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Group 1 (Email match: 100%)                               |
|                                                           |
| ○ Candidate A (ID: cand_047)                              |
|   Email: john.smith@email.com                             |
|   Name: John Smith                                        |
|   Skills: React, Node.js (8 total)                        |
|   Created: 6 months ago by Sarah Johnson                  |
|   Last Activity: 2 days ago                               |
|   Associated Items: 3 jobs, 5 submissions                 |
|                                                           |
| ● Candidate B (ID: cand_189) [SELECTED AS PRIMARY]        |
|   Email: john.smith@email.com                             |
|   Name: John A. Smith                                     |
|   Skills: React, Node.js, AWS, Docker (12 total)          |
|   Created: 2 months ago by Mike Chen                      |
|   Last Activity: 3 hours ago                              |
|   Associated Items: 2 jobs, 3 submissions                 |
|                                                           |
| Match Confidence: 100% (Exact email match)                |
|                                                           |
| Merge Strategy:                                           |
| ● Keep Candidate B as primary (more complete profile)    |
| ○ Keep Candidate A as primary                            |
| ○ Keep both (not duplicates)                             |
|                                                           |
| What to do with Candidate A after merge?                  |
| ● Merge data into Candidate B, then delete A             |
| ○ Keep as secondary record (link to B)                   |
|                                                           |
| [Preview Merge] [Merge Now] [Skip]                        |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| [Previous Group] [Next Group (2/23)] [Merge All] [Cancel]|
|                                                           |
+----------------------------------------------------------+
```

**User Action:** Click "Preview Merge"

**System Response:**
- Shows side-by-side comparison with merged result

**Screen State (Merge Preview):**
```
+----------------------------------------------------------+
|                                    Merge Preview [×]      |
+----------------------------------------------------------+
| Preview Merged Candidate                                  |
|                                                           |
| ┌─────────────────┬─────────────────┬─────────────────┐  |
| │ Candidate A     │ Candidate B     │ Merged Result   │  |
| │ (Will delete)   │ (Primary)       │ (Final)         │  |
| ├─────────────────┼─────────────────┼─────────────────┤  |
| │ John Smith      │ John A. Smith   │ John A. Smith   │  |
| │ 6 mo old        │ 2 mo old        │ (keep newer)    │  |
| ├─────────────────┼─────────────────┼─────────────────┤  |
| │ Email           │ Email           │ Email           │  |
| │ john.smith@...  │ john.smith@...  │ john.smith@...  │  |
| │ (same)          │ (same)          │                 │  |
| ├─────────────────┼─────────────────┼─────────────────┤  |
| │ Skills: 8       │ Skills: 12      │ Skills: 15      │  |
| │ React, Node.js  │ React, Node,    │ (merged unique) │  |
| │                 │ AWS, Docker     │                 │  |
| ├─────────────────┼─────────────────┼─────────────────┤  |
| │ Jobs: 3         │ Jobs: 2         │ Jobs: 5         │  |
| │ Submissions: 5  │ Submissions: 3  │ Submissions: 8  │  |
| │ (transferred)   │                 │ (combined)      │  |
| ├─────────────────┼─────────────────┼─────────────────┤  |
| │ Created:        │ Created:        │ Created:        │  |
| │ 6 mo ago        │ 2 mo ago        │ 6 mo ago        │  |
| │ (keep oldest)   │                 │ (earliest date) │  |
| ├─────────────────┼─────────────────┼─────────────────┤  |
| │ Resume: v1,v2   │ Resume: v1      │ Resumes: v1,v2,v3│  |
| │ (2 versions)    │ (1 version)     │ (all 3 versions)│  |
| └─────────────────┴─────────────────┴─────────────────┘  |
|                                                           |
| Merge Operations:                                         |
| ✓ Transfer 3 job associations from A to B                |
| ✓ Transfer 5 submissions from A to B                     |
| ✓ Merge skills (15 unique skills)                        |
| ✓ Combine resume versions (3 total)                      |
| ✓ Update activity history (reference B instead of A)     |
| ✓ Delete Candidate A record                              |
|                                                           |
| ⚠️  This action cannot be undone                          |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Confirm Merge ✓]                |
+----------------------------------------------------------+
```

**User Action:** Click "Confirm Merge ✓"

**System Response:**
1. Transfers all associations from A to B
2. Merges skills (unique only)
3. Combines resume versions
4. Updates activity references
5. Marks A as deleted (soft delete)
6. Toast: "Candidates merged successfully"
7. Logs activity: "data.duplicates_merged"
8. Moves to next duplicate group

**Merge Logic:**

| Field | Strategy |
|-------|----------|
| Name | Keep primary candidate's name |
| Email | Keep primary (should be same) |
| Phone | Keep primary if present, else secondary |
| Skills | Merge unique skills from both |
| Experience | Keep higher value |
| Location | Keep primary |
| Visa Status | Keep primary |
| Rate | Keep higher rate |
| Resumes | Combine all versions |
| Jobs | Transfer all from secondary to primary |
| Submissions | Transfer all from secondary to primary |
| Activities | Update references to point to primary |
| Created Date | Keep earliest (oldest) |
| Updated Date | Set to now (merge timestamp) |

**User Action:** Continue through all duplicate groups, click "Merge All" to auto-merge remaining

**System Response:**
- Merges all remaining duplicates using default strategy
- Shows progress bar
- On complete:
  - Toast: "23 duplicate groups merged. 46 records consolidated to 23."
  - Logs activity: "data.bulk_merge_completed"

**Time:** ~10 minutes for 23 groups

---

## Use Case D: Bulk Reassign Ownership

### Entry Point: Data Management Dashboard

**User Action:** Click "Reassign Records →"

**System Response:**
- Bulk reassignment wizard opens

**Screen State:**
```
+----------------------------------------------------------+
|                                 Bulk Reassignment [×]     |
+----------------------------------------------------------+
| Reassign Ownership of Records                             |
|                                                           |
| Step 1: Select Records                                    |
|                                                           |
| Entity Type *                                             |
| ● Jobs  ○ Candidates  ○ Submissions  ○ Accounts         |
|                                                           |
| Current Owner *                                           |
| [Sarah Johnson                                         ▼] |
|                                                           |
| Filter Records (Optional)                                 |
| ☑ Only active records                                    |
| ☐ Include completed records                              |
| ☐ Only unassigned records                                |
|                                                           |
| Date Range                                                |
| ○ All time                                                |
| ● Created in last: [90] days                             |
|                                                           |
| [Search Records →]                                        |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]                                    |
+----------------------------------------------------------+
```

**User Action:** Select "Jobs", current owner "Sarah Johnson", click "Search Records →"

**System Response:**
- Searches database
- Shows matching records

**Screen State (Results):**
```
+----------------------------------------------------------+
| Found 47 jobs owned by Sarah Johnson                      |
|                                                           |
| Select records to reassign:                               |
|                                                           |
| [☑ Select All (47)]                                      |
|                                                           |
| ☑ Senior Software Engineer - Google                      |
|   Status: Open · 12 candidates · Created: 15 days ago    |
|                                                           |
| ☑ Product Manager - Meta                                 |
|   Status: Open · 8 candidates · Created: 22 days ago     |
|                                                           |
| ☑ Data Scientist - Amazon                                |
|   Status: On Hold · 3 candidates · Created: 45 days ago  |
|                                                           |
| ... (44 more jobs)                                        |
|                                                           |
| Selected: 47 jobs                                         |
|                                                           |
| [Continue →]                                              |
|                                                           |
+----------------------------------------------------------+
```

**User Action:** Keep "Select All" checked, click "Continue →"

**System Response:**
- Slides to Step 2

**Screen State (Step 2):**
```
+----------------------------------------------------------+
| Step 2: Choose New Owner                                  |
|                                                           |
| Reassign 47 jobs from Sarah Johnson to:                   |
|                                                           |
| New Owner *                                               |
| [Mike Chen (Recruiting Manager)                        ▼] |
|                                                           |
| Available users with job.create permission:               |
| • Mike Chen (Recruiting Manager, Pod B)                  |
| • Amy Williams (Recruiting Manager, Pod C)               |
| • Emily Rodriguez (Recruiting Manager, Pod H)            |
| • Admin User                                              |
|                                                           |
| RCAI Assignment                                           |
| ● Transfer full ownership (Responsible + Accountable)    |
| ○ Make new owner Responsible only                        |
| ○ Make new owner Consulted                               |
|                                                           |
| What happens to old owner (Sarah Johnson)?                |
| ● Remove from RCAI entirely                              |
| ○ Keep as Consulted                                      |
| ○ Keep as Informed                                       |
|                                                           |
| Notification                                              |
| ☑ Notify new owner (Mike Chen)                           |
| ☑ Notify old owner (Sarah Johnson)                       |
| ☑ Notify candidates on these jobs                        |
|                                                           |
| Reason for Reassignment (Required)                        |
| [Sarah Johnson leaving company - effective 12/01/2024  ]  |
| [                                               ] 0/200   |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Reassign Records ✓]   |
+----------------------------------------------------------+
```

**User Action:** Select "Mike Chen", keep defaults, enter reason

**User Action:** Click "Reassign Records ✓"

**System Response:**
1. Shows confirmation dialog
2. On confirm:
   - Updates `owner_id` on 47 jobs
   - Updates RCAI assignments
   - Sends notifications to Sarah, Mike, and candidates
   - Logs activity for each reassignment
3. Shows progress bar
4. On complete:
   - Toast: "47 jobs reassigned from Sarah Johnson to Mike Chen"
   - Downloads reassignment report (CSV)
   - Logs activity: "data.bulk_reassignment_completed"

**Time:** ~2 minutes

---

## Use Case E: Archive Old Data

### Entry Point: Data Management Dashboard

**User Action:** Click "Archive Data →"

**System Response:**
- Archive wizard opens

**Screen State:**
```
+----------------------------------------------------------+
|                                      Archive Data [×]     |
+----------------------------------------------------------+
| Archive Inactive Records                                  |
|                                                           |
| What would you like to archive?                           |
|                                                           |
| ☑ Old Jobs                                               |
|   Jobs closed more than [6  ] months ago                 |
|                                                           |
| ☑ Inactive Candidates                                    |
|   No activity in last [12 ] months                       |
|                                                           |
| ☑ Completed Placements                                   |
|   Placements completed more than [2  ] years ago         |
|                                                           |
| ☐ Old Activities                                         |
|   Activities older than [1  ] year                       |
|                                                           |
| [Preview Records →]                                       |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Archive Options                                           |
|                                                           |
| What happens to archived records?                         |
| • Moved to separate archive table                        |
| • Hidden from main lists and searches                    |
| • Still accessible via "View Archived" filter            |
| • Can be restored if needed                              |
| • Included in exports and reports                        |
|                                                           |
| ☑ Create backup before archiving                         |
| ☑ Send summary report to admin@intimestaffing.com        |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Archive Records ✓]              |
+----------------------------------------------------------+
```

**User Action:** Keep defaults, click "Preview Records →"

**System Response:**
- Queries database with criteria
- Shows preview

**Screen State (Preview):**
```
+----------------------------------------------------------+
| Archive Preview                                           |
|                                                           |
| Records matching archive criteria:                        |
|                                                           |
| Old Jobs (closed > 6 months ago):                         |
| • 143 jobs                                                |
| • Associated items: 547 submissions, 89 placements        |
|                                                           |
| Inactive Candidates (no activity > 12 months):            |
| • 78 candidates                                           |
| • Associated items: 12 jobs, 34 submissions               |
|                                                           |
| Completed Placements (> 2 years ago):                     |
| • 67 placements                                           |
|                                                           |
| Total records to archive: 288                             |
| Estimated time: ~30 seconds                               |
|                                                           |
| ⚠️  Note: Associated items will be preserved but marked   |
|    as archived. This helps maintain data integrity.       |
|                                                           |
| [← Back to Adjust Criteria]  [Proceed with Archive ✓]    |
|                                                           |
+----------------------------------------------------------+
```

**User Action:** Click "Proceed with Archive ✓"

**System Response:**
1. Creates backup (if selected)
2. Moves records to archive tables or sets `archived = true`
3. Updates indexes
4. Shows progress bar
5. On complete:
   - Toast: "288 records archived successfully"
   - Sends summary email to admin
   - Logs activity: "data.archived"

**Database Operations:**
```sql
-- Mark jobs as archived
UPDATE jobs
SET archived = true, archived_at = NOW(), archived_by = current_user_id
WHERE status = 'closed' AND closed_at < NOW() - INTERVAL '6 months';

-- Mark candidates as archived
UPDATE user_profiles
SET archived = true, archived_at = NOW(), archived_by = current_user_id
WHERE candidate_status = 'inactive'
  AND updated_at < NOW() - INTERVAL '12 months';

-- Mark placements as archived
UPDATE placements
SET archived = true, archived_at = NOW(), archived_by = current_user_id
WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '2 years';
```

**Time:** ~2 minutes

---

## Postconditions

1. ✅ Import: New records created, existing updated
2. ✅ Export: CSV file downloaded
3. ✅ Merge: Duplicates consolidated
4. ✅ Reassign: Ownership transferred
5. ✅ Archive: Old data moved to archive
6. ✅ All operations logged in audit log
7. ✅ Notifications sent (if applicable)
8. ✅ Reports generated and emailed

---

## Events Logged

| Event | Payload |
|-------|---------|
| `data.imported` | `{ entity_type, total_rows, created_count, updated_count, error_count, imported_by, imported_at }` |
| `data.exported` | `{ entity_type, record_count, filters, exported_by, exported_at }` |
| `data.duplicates_merged` | `{ entity_type, primary_id, secondary_id, merged_by, merged_at }` |
| `data.bulk_reassignment_completed` | `{ entity_type, record_count, from_user_id, to_user_id, reason, reassigned_by, reassigned_at }` |
| `data.archived` | `{ entity_type, record_count, criteria, archived_by, archived_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Import File Too Large | CSV > 25MB | "File size exceeds 25 MB limit" | Split into smaller files |
| Invalid CSV Format | Malformed CSV | "Invalid CSV format. Check headers and data." | Fix CSV format |
| Missing Required Field | Required column empty | "Row X: Missing required field 'email'" | Fill missing data |
| Duplicate Email | Email exists (skip mode) | "Row X: Duplicate email (skipped)" | Expected behavior or use update mode |
| Export Too Large | Too many records | "Export too large. Use filters to reduce size." | Apply filters |
| Merge Conflict | Cannot auto-merge | "Cannot merge: conflicting data" | Manual review required |
| Reassignment Failed | Invalid new owner | "New owner does not have required permissions" | Select valid user |
| Archive Failed | System error | "Archive operation failed. Try again." | Retry or contact support |
| Permission Denied | User lacks permission | "You don't have permission for this operation" | Contact super admin |

---

## Best Practices

### Import
- ✅ Always download and use the official template
- ✅ Test with small batch first (10-20 records)
- ✅ Review validation results before importing
- ✅ Fix errors in CSV rather than skipping
- ✅ Keep original import file for reference

### Export
- ✅ Use filters to limit export size
- ✅ Anonymize data if sharing externally
- ✅ Include timestamp in filename
- ✅ Store exports securely (encrypted if sensitive)
- ✅ Delete old exports after use

### Merge Duplicates
- ✅ Review each merge manually (don't auto-merge all)
- ✅ Keep more complete profile as primary
- ✅ Verify before confirming merge
- ✅ Test merge logic on non-critical duplicates first
- ✅ Keep backup before bulk merges

### Reassignment
- ✅ Notify all affected parties
- ✅ Document reason for reassignment
- ✅ Verify new owner has appropriate permissions
- ✅ Keep old owner as Informed if appropriate
- ✅ Plan reassignments during off-hours

### Archive
- ✅ Create backup before archiving
- ✅ Start with conservative retention periods
- ✅ Verify archived data is still accessible
- ✅ Test restore process periodically
- ✅ Schedule archival during low-usage times

---

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Ctrl/Cmd + U` | Open import wizard | Data Management page |
| `Ctrl/Cmd + E` | Open export wizard | Data Management page |
| `Ctrl/Cmd + D` | Find duplicates | Data Management page |
| `Ctrl/Cmd + R` | Open reassignment wizard | Data Management page |
| `Esc` | Close wizard / Cancel | Modal open |
| `Enter` | Continue to next step | Wizard step |
| `←` | Previous step | Multi-step wizard |
| `→` | Next step | Multi-step wizard |
| `Ctrl/Cmd + A` | Select all records | List view |
| `Space` | Toggle record selection | List view |
| `Ctrl/Cmd + S` | Save / Confirm action | Modal open |

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-DAT-001 | Import valid CSV | Admin logged in, valid CSV prepared | 1. Click Import 2. Select Candidates 3. Upload valid CSV 4. Import | All records imported, success message shown |
| ADMIN-DAT-002 | Import with validation errors | Admin logged in | 1. Upload CSV with invalid emails 2. View validation | Errors shown, invalid rows flagged |
| ADMIN-DAT-003 | Import skip duplicates | Admin logged in, some emails exist | 1. Upload CSV 2. Select "Skip duplicates" 3. Import | Existing records skipped, new records created |
| ADMIN-DAT-004 | Import update duplicates | Admin logged in, some emails exist | 1. Upload CSV 2. Select "Update existing" 3. Import | Existing records updated with new data |
| ADMIN-DAT-005 | Download import template | Admin logged in | 1. Click Import 2. Download template | CSV template downloaded with correct headers |
| ADMIN-DAT-006 | Export all candidates | Admin logged in | 1. Click Export 2. Select Candidates 3. Select All time 4. Export | CSV downloaded with all candidate data |
| ADMIN-DAT-007 | Export with filters | Admin logged in | 1. Export Candidates 2. Filter by date range 3. Filter by status 4. Export | Only filtered records exported |
| ADMIN-DAT-008 | Export anonymized data | Admin logged in | 1. Export 2. Check "Anonymize personal data" 3. Export | Exported CSV has masked personal data |
| ADMIN-DAT-009 | Find duplicate candidates | Admin logged in, duplicates exist | 1. Click Find Duplicates 2. Select Candidates 3. Scan | Duplicate groups identified and shown |
| ADMIN-DAT-010 | Merge duplicate candidates | Duplicates found | 1. Select primary record 2. Preview merge 3. Confirm | Records merged, secondary deleted |
| ADMIN-DAT-011 | Skip false positive duplicate | Duplicates found | 1. Review group 2. Select "Keep both" | Records preserved, marked as not duplicates |
| ADMIN-DAT-012 | Bulk reassign jobs | Admin logged in, user has jobs | 1. Click Reassign 2. Select owner 3. Select all jobs 4. Choose new owner 5. Confirm | All jobs transferred to new owner |
| ADMIN-DAT-013 | Reassign with notifications | Admin logged in | 1. Reassign records 2. Enable notifications 3. Confirm | Reassignment completed, notifications sent |
| ADMIN-DAT-014 | Archive old jobs | Admin logged in, old jobs exist | 1. Click Archive 2. Configure criteria 3. Preview 4. Archive | Old jobs moved to archive |
| ADMIN-DAT-015 | Archive with backup | Admin logged in | 1. Archive data 2. Enable backup 3. Confirm | Backup created, then records archived |
| ADMIN-DAT-016 | View archived records | Records archived | 1. Go to entity list 2. Enable "View Archived" filter | Archived records visible with indicator |
| ADMIN-DAT-017 | Restore archived record | Records archived | 1. Find archived record 2. Click Restore | Record restored to active status |
| ADMIN-DAT-018 | Import oversized file | Admin logged in | 1. Attempt to upload 30MB CSV | Error: "File size exceeds 25 MB limit" |
| ADMIN-DAT-019 | Export large dataset | Admin logged in, 10k+ records | 1. Export all candidates | Progress shown, file downloaded successfully |
| ADMIN-DAT-020 | Reassign to user without permission | Admin logged in | 1. Try to reassign to user without proper role | Error: "New owner does not have required permissions" |

---

## Database Schema Reference

### Core Tables

```sql
-- Import logs table
CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'candidates', 'jobs', 'accounts', etc.
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INTEGER,
  total_rows INTEGER NOT NULL,
  created_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details JSONB, -- array of {row, field, error}
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  imported_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export logs table
CREATE TABLE export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  filters JSONB, -- applied filters
  record_count INTEGER NOT NULL,
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  format VARCHAR(20) DEFAULT 'csv', -- 'csv', 'xlsx', 'json'
  anonymized BOOLEAN DEFAULT FALSE,
  exported_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate merge logs table
CREATE TABLE merge_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  primary_record_id UUID NOT NULL,
  secondary_record_id UUID NOT NULL,
  merge_strategy JSONB, -- fields merged and how
  merged_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reassignment logs table
CREATE TABLE reassignment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  record_ids UUID[] NOT NULL, -- array of reassigned record IDs
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  notifications_sent BOOLEAN DEFAULT FALSE,
  reassigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive metadata (added to entities)
-- Each entity table has these columns:
-- archived BOOLEAN DEFAULT FALSE
-- archived_at TIMESTAMPTZ
-- archived_by UUID REFERENCES users(id)

-- Archive configuration table
CREATE TABLE archive_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  retention_period_months INTEGER NOT NULL,
  criteria JSONB, -- status, last_activity, etc.
  auto_archive BOOLEAN DEFAULT FALSE,
  last_run_at TIMESTAMPTZ,
  records_archived INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, entity_type)
);
```

### Indexes

```sql
-- Import/Export logs indexes
CREATE INDEX idx_import_logs_org_id ON import_logs(organization_id);
CREATE INDEX idx_import_logs_entity_type ON import_logs(entity_type);
CREATE INDEX idx_import_logs_status ON import_logs(status);
CREATE INDEX idx_import_logs_created_at ON import_logs(created_at);

CREATE INDEX idx_export_logs_org_id ON export_logs(organization_id);
CREATE INDEX idx_export_logs_entity_type ON export_logs(entity_type);
CREATE INDEX idx_export_logs_created_at ON export_logs(created_at);

-- Merge logs indexes
CREATE INDEX idx_merge_logs_org_id ON merge_logs(organization_id);
CREATE INDEX idx_merge_logs_entity_type ON merge_logs(entity_type);
CREATE INDEX idx_merge_logs_primary_record ON merge_logs(primary_record_id);

-- Reassignment logs indexes
CREATE INDEX idx_reassignment_logs_org_id ON reassignment_logs(organization_id);
CREATE INDEX idx_reassignment_logs_from_user ON reassignment_logs(from_user_id);
CREATE INDEX idx_reassignment_logs_to_user ON reassignment_logs(to_user_id);

-- Archive policy indexes
CREATE INDEX idx_archive_policies_org_id ON archive_policies(organization_id);
CREATE INDEX idx_archive_policies_entity_type ON archive_policies(entity_type);

-- Archived records indexes (for each entity table)
-- Example for user_profiles:
CREATE INDEX idx_user_profiles_archived ON user_profiles(archived) WHERE archived = TRUE;
CREATE INDEX idx_jobs_archived ON jobs(archived) WHERE archived = TRUE;
CREATE INDEX idx_placements_archived ON placements(archived) WHERE archived = TRUE;
```

---

## Related Use Cases

- [UC-ADMIN-001: Admin Dashboard Overview](./00-OVERVIEW.md)
- [UC-ADMIN-003: System Settings](./03-system-settings.md)
- [UC-ADMIN-005: User Management](./05-user-management.md)
- [UC-ADMIN-008: Audit Logs](./08-audit-logs.md)

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-11-30 | Initial documentation |
| 1.1 | 2025-12-04 | Added test cases, keyboard shortcuts, database schema |

---

*Last Updated: 2025-12-04*
