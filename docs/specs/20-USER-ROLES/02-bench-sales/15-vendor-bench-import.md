# Use Case: Import Consultant Profiles from Vendor Bench

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-015 |
| Actor | Bench Sales Recruiter |
| Goal | Import third-party vendor consultant profiles to expand available bench pool |
| Frequency | Weekly (scheduled sync) + on-demand |
| Estimated Time | 5-15 minutes per import |
| Priority | Medium (Bench expansion) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. Vendor relationship exists in system with signed agreement
3. Vendor has provided bench data access (API, SFTP, or manual file)
4. User has permission to import vendor consultants
5. Vendor agreement terms documented (commission structure)

---

## Trigger

One of the following:
- Weekly scheduled vendor bench sync (automated)
- New vendor onboarded (first import)
- Vendor sends updated bench list via email
- User manually requests fresh import from vendor portal
- Vendor API webhook triggers update notification

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Vendor Bench Import

**User Action:** User navigates to Vendor Bench dashboard or clicks "Import Vendor Bench" from Vendors page

**System Response:**
- Loads vendor bench import screen
- Shows list of configured vendor integrations
- Displays last sync timestamp for each vendor

**URL:** `/employee/workspace/bench/vendor-consultants/import`

**Time:** ~1 second

---

### Step 2: View Vendor Integration Status

**System Display:**

```
+------------------------------------------------------------------+
|  Vendor Bench Import                          [Refresh ⟳] [Help] |
+------------------------------------------------------------------+
| Configure and sync consultant profiles from vendor partners       |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Integration Status                           Last Updated: 9am│   |
| │                                                             │   |
| │ Connected Vendors: 8                                        │   |
| │ Total Vendor Consultants: 1,247                             │   |
| │ Last 7 Days: +42 new, 18 updated, 5 removed                │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Active Integrations                                               |
+------------------------------------------------------------------+
| Vendor Name          | Type      | Last Sync    | Status | Count |
|----------------------|-----------|--------------|--------|-------|
| TechStaff Solutions  | API (Auto)| 8:00 AM today| ✅ OK  | 342   |
| StaffAugment Inc     | API (Auto)| 8:00 AM today| ✅ OK  | 215   |
| Global IT Partners   | SFTP      | Yesterday    | ⚠️ Warn| 178   |
| ConsultPro LLC       | Manual    | 5 days ago   | 🔴 Stale| 92   |
| Elite Staffing       | API (Auto)| 8:00 AM today| ✅ OK  | 156   |
| VendorHub Inc        | API (Auto)| Failed       | ❌ Error| 0    |
| QuickHire Partners   | Manual    | 3 days ago   | ⚠️ Warn| 87   |
| Strategic Resources  | SFTP      | Yesterday    | ✅ OK  | 177   |
+------------------------------------------------------------------+
| [+ Add New Vendor Integration]        [Import from File]         |
+------------------------------------------------------------------+
```

**Integration Types:**
- **API (Auto)**: Automated daily sync via REST API
- **SFTP**: Scheduled file transfer (daily/weekly)
- **Manual**: Upload CSV/Excel files manually

**Status Indicators:**
- ✅ **OK**: Synced within 24 hours
- ⚠️ **Warn**: Not synced in 2-5 days (stale data)
- 🔴 **Stale**: Not synced in 5+ days
- ❌ **Error**: Last sync failed

**Time:** ~10 seconds to review

---

### Step 3: Select Vendor for Import

**User Action:** Click on "TechStaff Solutions" row or click "Sync Now" button

**System Response:**
- Opens vendor sync detail panel
- Shows sync configuration and history
- Displays import preview if available

**Sync Detail Panel:**

```
+------------------------------------------------------------------+
|  TechStaff Solutions - Vendor Bench Sync                    [×]  |
+------------------------------------------------------------------+
| Integration Type: REST API (Automated)                            |
| Sync Frequency: Daily at 8:00 AM ET                              |
| Last Successful Sync: Today at 8:00 AM                           |
| Next Scheduled Sync: Tomorrow at 8:00 AM                         |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Current Vendor Bench Status                                 │   |
| │                                                             │   |
| │ Total Consultants: 342                                      │   |
| │ Available (On Bench): 287                                   │   |
| │ Placed: 55                                                  │   |
| │                                                             │   |
| │ Visa Status Breakdown:                                      │   |
| │ • US Citizen: 87      • Green Card: 64                      │   |
| │ • H1B: 112            • OPT/EAD: 42                         │   |
| │ • Canada PR: 23       • Canada OWP: 14                      │   |
| │                                                             │   |
| │ Top Skills:                                                 │   |
| │ • Java (142)          • .NET (78)        • React (92)       │   |
| │ • Python (67)         • AWS (103)        • Azure (54)       │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Sync History (Last 7 Days)                                  │   |
| │                                                             │   |
| │ 11/30 8:00 AM - SUCCESS - 342 profiles, +3 new, 8 updated  │   |
| │ 11/29 8:00 AM - SUCCESS - 339 profiles, +2 new, 5 updated  │   |
| │ 11/28 8:00 AM - SUCCESS - 337 profiles, +1 new, 12 updated │   |
| │ 11/27 8:00 AM - SUCCESS - 336 profiles, +5 new, 7 updated  │   |
| │ 11/26 8:00 AM - SUCCESS - 331 profiles, +0 new, 4 updated  │   |
| │ 11/25 8:00 AM - SUCCESS - 331 profiles, +4 new, 6 updated  │   |
| │ 11/24 8:00 AM - SUCCESS - 327 profiles, +2 new, 9 updated  │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Import Settings:                                                  |
| ☑ Auto-deduplicate by email and phone                            |
| ☑ Flag overlaps with internal bench                              |
| ☑ Assign ownership to importer                                   |
| ☑ Auto-categorize by skills                                      |
| ☐ Skip consultants with expired work authorization               |
| ☐ Only import US Citizen and Green Card                          |
|                                                                   |
+------------------------------------------------------------------+
|                              [Cancel]  [Sync Now →]              |
+------------------------------------------------------------------+
```

**Time:** ~5 seconds to load

---

### Step 4: Configure Import Settings (Optional)

**User Action:** Review and adjust import settings

**Import Settings Options:**

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-deduplicate | ON | Skip profiles with matching email/phone |
| Flag overlaps | ON | Identify consultants already in internal bench |
| Assign ownership | ON | Auto-assign to user performing import |
| Auto-categorize | ON | Tag profiles by primary skills |
| Skip expired auth | OFF | Exclude consultants with expired visas |
| Visa filter | OFF | Limit import to specific visa types |
| Skills filter | OFF | Only import profiles matching skill keywords |
| Location filter | OFF | Only import profiles in specific regions |
| Rate range filter | OFF | Only import profiles within rate range |

**Advanced Filters (Expandable):**

```
+------------------------------------------------------------------+
| Advanced Import Filters (Optional)                                |
+------------------------------------------------------------------+
| Skills (Keywords):                                                |
| [Java, React, .NET, Python, AWS                             ]    |
|                                                                   |
| Visa Types:                                                       |
| ☑ US Citizen   ☑ Green Card   ☑ H1B   ☑ EAD/OPT                 |
| ☐ L1          ☐ TN            ☐ Canada PR   ☐ Canada OWP        |
|                                                                   |
| Locations (States/Provinces):                                     |
| [All locations                                              ▼]   |
|                                                                   |
| Rate Range:                                                       |
| Min: $[40    ] /hr    Max: $[150   ] /hr                         |
|                                                                   |
| Availability:                                                     |
| ● All consultants                                                |
| ○ Available only (on bench)                                      |
| ○ Placed only                                                    |
|                                                                   |
+------------------------------------------------------------------+
```

**Time:** ~1-2 minutes if configuring filters

---

### Step 5: Execute Import

**User Action:** Click "Sync Now →" button

**System Response:**
1. Validates API connection or file access
2. Fetches latest consultant data from vendor
3. Processes profiles (dedupe, validate, categorize)
4. Shows import progress indicator

**Progress Indicator:**

```
+------------------------------------------------------------------+
|                    Importing Vendor Bench...                      |
+------------------------------------------------------------------+
|                                                                   |
|  ████████████████████████░░░░░░░░░░░░░░░░░░░░  62%               |
|                                                                   |
|  Processing: 213 of 342 profiles                                 |
|                                                                   |
|  ✓ Fetched data from TechStaff API                               |
|  ✓ Validated 342 profiles                                        |
|  ⟳ Deduplicating profiles...                                     |
|  ⟳ Categorizing by skills...                                     |
|  ⏳ Saving to database...                                         |
|                                                                   |
|  Estimated time remaining: 30 seconds                            |
|                                                                   |
+------------------------------------------------------------------+
```

**Time:** ~30-90 seconds depending on volume

---

### Step 6: Review Import Results

**System Response:**
- Import completes
- Shows summary of results
- Highlights new profiles, updates, duplicates, and errors

**Import Results Summary:**

```
+------------------------------------------------------------------+
|              Import Complete - TechStaff Solutions                |
+------------------------------------------------------------------+
|                                                                   |
| ✅ Import Successful                          Completed: 9:05 AM  |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Summary                                                     │   |
| │                                                             │   |
| │ Total Profiles Processed: 342                               │   |
| │                                                             │   |
| │ ✅ New Profiles Added: 3                                    │   |
| │ 🔄 Existing Profiles Updated: 8                             │   |
| │ ⏭️  Skipped (Duplicates): 327                               │   |
| │ ⚠️  Warnings: 4                                             │   |
| │ ❌ Errors: 0                                                │   |
| │                                                             │   |
| │ Processing Time: 1 minute 23 seconds                        │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ New Profiles Added (3)                                      │   |
| │                                                             │   |
| │ 1. Amit Patel - Java Developer - H1B - DC Area             │   |
| │    Skills: Java, Spring Boot, AWS, Microservices            │   |
| │    Rate: $85/hr                                             │   |
| │    [View Profile]                                           │   |
| │                                                             │   |
| │ 2. Sarah Johnson - .NET Developer - US Citizen - Remote    │   |
| │    Skills: C#, .NET Core, Azure, SQL Server                 │   |
| │    Rate: $90/hr                                             │   |
| │    [View Profile]                                           │   |
| │                                                             │   |
| │ 3. Chen Wei - React Developer - OPT - Bay Area             │   |
| │    Skills: React, TypeScript, Node.js, AWS                  │   |
| │    Rate: $75/hr                                             │   |
| │    [View Profile]                                           │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Warnings (4)                                                │   |
| │                                                             │   |
| │ ⚠️  Profile 127: H1B expires in 45 days (Rajesh Kumar)     │   |
| │ ⚠️  Profile 203: No rate information (Maria Garcia)        │   |
| │ ⚠️  Profile 218: Missing resume/CV (John Smith)            │   |
| │ ⚠️  Profile 287: OPT expired last month (Kevin Park)       │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Next Steps                                                  │   |
| │                                                             │   |
| │ • Review new profiles and add to marketing hotlist          │   |
| │ • Address warnings (immigration issues, missing data)       │   |
| │ • Match new consultants to active external jobs            │   |
| │ • Contact vendor about profiles with missing info          │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
|          [View All Vendor Consultants]  [Download Report] [Done] |
+------------------------------------------------------------------+
```

**Time:** ~30 seconds to review

---

### Step 7: Review Duplicate/Overlap Detection

**System Response:**
- If duplicates or overlaps found, shows detailed comparison
- Allows user to resolve conflicts

**Duplicate Detection Panel:**

```
+------------------------------------------------------------------+
|  Duplicate Profiles Detected                                 [×] |
+------------------------------------------------------------------+
| The following profiles match existing records in the system.      |
| Review and decide how to handle each.                            |
+------------------------------------------------------------------+
|                                                                   |
| Duplicate 1 of 2:                                                |
|                                                                   |
| ┌─────────────────────────────┬─────────────────────────────┐   |
| │ VENDOR PROFILE (TechStaff)  │ EXISTING PROFILE (InTime)   │   |
| ├─────────────────────────────┼─────────────────────────────┤   |
| │ Name: Rajesh Kumar          │ Name: Rajesh Kumar          │   |
| │ Email: rajesh.k@gmail.com   │ Email: rajesh.k@gmail.com   │   |
| │ Phone: +1 555-123-4567      │ Phone: +1 555-123-4567      │   |
| │ Title: Java Developer       │ Title: Senior Java Dev      │   |
| │ Rate: $85/hr                │ Rate: $88/hr                │   |
| │ Status: Available           │ Status: On Bench (35 days)  │   |
| │ Visa: H1B (expires 2026)    │ Visa: H1B (expires 2026)    │   |
| │ Skills: Java, Spring, AWS   │ Skills: Java, Spring Boot,  │   |
| │                             │         AWS, Microservices  │   |
| │ Last Updated: 11/30/2024    │ Last Updated: 11/28/2024    │   |
| │ Source: Vendor (TechStaff)  │ Source: Internal            │   |
| └─────────────────────────────┴─────────────────────────────┘   |
|                                                                   |
| ⚠️ OVERLAP DETECTED: This consultant is in both InTime internal  |
| bench AND TechStaff vendor bench. This may indicate:             |
|                                                                   |
| • Consultant is marketed by both InTime and vendor (conflict)    |
| • Consultant previously worked with vendor, now InTime employee  |
| • Data entry error (same person, different sources)              |
|                                                                   |
| Action: *                                                         |
| ● Skip import (keep existing InTime profile only)                |
| ○ Merge data (update existing profile with vendor data)          |
| ○ Create separate vendor profile (allow duplicate)               |
| ○ Flag for manual review (add to review queue)                   |
|                                                                   |
| Notes:                                                            |
| [This is our internal consultant. Skip vendor import and     ]   |
| [notify TechStaff that Rajesh is no longer available via     ]   |
| [their bench.                                                ]   |
|                                                                   |
+------------------------------------------------------------------+
|                     [< Previous]  [Apply]  [Next >]              |
+------------------------------------------------------------------+
```

**Duplicate Resolution Options:**

| Option | When to Use | Result |
|--------|-------------|--------|
| **Skip import** | Consultant is internal employee | Keep existing, ignore vendor profile |
| **Merge data** | Vendor has newer/better info | Update existing profile with vendor data |
| **Create separate** | Different people with similar info | Add vendor profile as new record |
| **Flag for review** | Unclear, needs investigation | Add to manual review queue |

**Time:** ~1-2 minutes per duplicate

---

### Step 8: Handle Import Warnings and Errors

**User Action:** Review warnings and take corrective action

**Common Warnings:**

| Warning | Cause | Action |
|---------|-------|--------|
| **Visa expiring soon** | Work auth expires <90 days | Flag for immigration review, may limit marketing |
| **Missing rate info** | Vendor didn't provide rate | Contact vendor or estimate based on market |
| **No resume/CV** | Profile incomplete | Request resume from vendor |
| **Expired work auth** | Visa already expired | Skip import or flag as unavailable |
| **Duplicate skills** | Skills list has duplicates | Auto-clean and normalize |
| **Invalid email** | Email format invalid | Contact vendor to correct |
| **Missing contact info** | No phone or email | Cannot import, notify vendor |

**Error Handling Modal:**

```
+------------------------------------------------------------------+
|  Address Import Warnings                                     [×] |
+------------------------------------------------------------------+
| 4 warnings detected. Review and resolve before completing import. |
+------------------------------------------------------------------+
|                                                                   |
| Warning 1 of 4: H1B Expiring Soon                                |
|                                                                   |
| Consultant: Rajesh Kumar (Profile #127)                          |
| Issue: H1B visa expires in 45 days (01/14/2025)                  |
|                                                                   |
| Action: *                                                         |
| ● Import but flag as "Immigration Review Required"               |
| ○ Skip import (exclude from vendor bench)                        |
| ○ Import without restrictions (ignore warning)                   |
|                                                                   |
| Notes:                                                            |
| [Contact vendor to confirm renewal status. Add to immigration]   |
| [alert dashboard.                                            ]   |
|                                                                   |
+------------------------------------------------------------------+
|                     [< Previous]  [Apply]  [Next >]              |
+------------------------------------------------------------------+
```

**Time:** ~2-5 minutes depending on warnings

---

### Step 9: Manual File Upload (Alternative Flow)

**User Action:** Click "Import from File" button (for vendors without API)

**System Response:**
- Opens file upload dialog
- Shows supported file formats
- Provides template download

**File Upload Dialog:**

```
+------------------------------------------------------------------+
|  Import Vendor Bench from File                               [×] |
+------------------------------------------------------------------+
|                                                                   |
| Upload a CSV or Excel file containing consultant profiles.       |
|                                                                   |
| Supported Formats: .csv, .xlsx, .xls                             |
| Maximum File Size: 10 MB                                         |
| Maximum Profiles: 500 per upload                                 |
|                                                                   |
+------------------------------------------------------------------+
| ┌────────────────────────────────────────────────────────────┐   |
| │                                                             │   |
| │              [Click to upload or drag file here]            │   |
| │                                                             │   |
| │                     Supported: CSV, Excel                   │   |
| │                                                             │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ☐ First row contains column headers                              |
| ☐ Auto-detect columns                                            |
|                                                                   |
+------------------------------------------------------------------+
| Vendor: *                                                         |
| [Select Vendor                                              ▼]   |
|                                                                   |
| Import Date: [11/30/2024          ]                              |
|                                                                   |
+------------------------------------------------------------------+
| Don't have the right format?                                      |
| [📥 Download CSV Template] [📥 Download Excel Template]          |
+------------------------------------------------------------------+
|                                    [Cancel]  [Upload & Import]   |
+------------------------------------------------------------------+
```

**CSV Template Format:**

```
first_name,last_name,email,phone,title,skills,rate,visa_type,location,availability,resume_url
Rajesh,Kumar,rajesh.k@gmail.com,+1-555-123-4567,Java Developer,"Java,Spring Boot,AWS",85,H1B,"Washington, DC",Available,https://...
Sarah,Johnson,sarah.j@gmail.com,+1-555-234-5678,.NET Developer,"C#,.NET Core,Azure",90,USC,Remote,Available,https://...
```

**Required Columns:**
- `first_name`, `last_name` (or `full_name`)
- `email` OR `phone` (at least one)
- `title` or `role`
- `skills`
- `visa_type` or `work_authorization`

**Optional Columns:**
- `rate`, `rate_type` (hourly/daily/annual)
- `location`, `location_preference`
- `availability`, `availability_date`
- `resume_url`, `linkedin_url`
- `years_experience`, `certifications`
- `vendor_id`, `vendor_consultant_id`

**Time:** ~3-5 minutes including file preparation

---

### Step 10: Column Mapping (If Auto-Detect Fails)

**System Response:**
- If column headers don't match expected format
- Shows column mapping interface

**Column Mapping Interface:**

```
+------------------------------------------------------------------+
|  Map File Columns to System Fields                          [×] |
+------------------------------------------------------------------+
| We detected 15 columns in your file. Map them to system fields.  |
+------------------------------------------------------------------+
|                                                                   |
| File Column              →    System Field                       |
| -------------------------     -------------------------------     |
| Name                     →    [Full Name                    ▼]   |
| Email Address            →    [Email                        ▼]   |
| Contact Number           →    [Phone                        ▼]   |
| Job Title                →    [Title/Role                   ▼]   |
| Technical Skills         →    [Skills                       ▼]   |
| Bill Rate                →    [Rate                         ▼]   |
| Work Auth                →    [Visa Type                    ▼]   |
| City, State              →    [Location                     ▼]   |
| Status                   →    [Availability                 ▼]   |
| Resume Link              →    [Resume URL                   ▼]   |
| LinkedIn                 →    [LinkedIn URL                 ▼]   |
| Experience (Years)       →    [Years Experience             ▼]   |
| Certs                    →    [Certifications               ▼]   |
| Vendor Ref ID            →    [Vendor Consultant ID         ▼]   |
| Notes                    →    [Ignore (Don't Import)        ▼]   |
|                                                                   |
+------------------------------------------------------------------+
| ☑ Remember this mapping for future imports from this vendor      |
|                                                                   |
+------------------------------------------------------------------+
|                              [Cancel]  [Continue Import →]       |
+------------------------------------------------------------------+
```

**Time:** ~2-3 minutes

---

### Step 11: Validate Imported Data

**System Response:**
- Validates all imported profiles
- Shows validation errors
- Allows user to fix or skip invalid profiles

**Validation Report:**

```
+------------------------------------------------------------------+
|  Validation Results - 342 Profiles                               |
+------------------------------------------------------------------+
|                                                                   |
| ✅ Valid Profiles: 335                                           |
| ❌ Invalid Profiles: 7 (review required)                         |
|                                                                   |
+------------------------------------------------------------------+
| Invalid Profiles:                                                 |
+------------------------------------------------------------------+
| Row 23: Missing email and phone - Cannot import                  |
| Row 67: Invalid email format (user@domain) - Fix required        |
| Row 104: Unknown visa type "Visitor" - Map to valid type         |
| Row 156: Rate "-1" is invalid - Fix or set to 0 (negotiate)      |
| Row 201: Missing required field "title" - Add job title          |
| Row 278: Duplicate email (matches row 45) - Skip or merge        |
| Row 312: Invalid phone format - Fix required                     |
|                                                                   |
+------------------------------------------------------------------+
| Action:                                                           |
| ● Skip invalid profiles and import 335 valid profiles            |
| ○ Cancel import and fix file                                     |
| ○ Fix errors inline (advanced)                                   |
|                                                                   |
+------------------------------------------------------------------+
|                              [Cancel]  [Continue Import →]       |
+------------------------------------------------------------------+
```

**Time:** ~1-2 minutes

---

## Field Specifications

### Import Configuration

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| Vendor | Dropdown | Yes | Must exist in system | Select vendor source |
| Import Type | Radio | Yes | API, SFTP, Manual | Determines data source |
| Import Date | Date | Yes | Cannot be future | For manual imports |
| Auto-deduplicate | Checkbox | No | - | Recommended: ON |
| Flag overlaps | Checkbox | No | - | Recommended: ON |
| Assign ownership | Checkbox | No | - | Assigns to importer |
| Skills filter | Text | No | Comma-separated | Optional filtering |
| Visa filter | Multi-select | No | Valid visa types | Optional filtering |
| Rate range | Currency range | No | Min < Max | Optional filtering |

### Consultant Profile Fields (From Import)

| Field | Required | Validation | Notes |
|-------|----------|------------|-------|
| First Name | Yes | Min 1 char | Can combine with Last Name |
| Last Name | Yes | Min 1 char | Can use Full Name instead |
| Email | Yes* | Valid email format | *Required if no phone |
| Phone | Yes* | Valid phone format | *Required if no email |
| Title/Role | Yes | Min 3 chars | Job title |
| Skills | Yes | Comma-separated list | Normalized on import |
| Rate | No | Numeric >0 | Default 0 if missing |
| Rate Type | No | hourly/daily/annual | Default: hourly |
| Visa Type | No | Valid visa code | Default: Unknown |
| Location | No | Free text | City, State or Remote |
| Availability | No | Available/Placed/Other | Default: Available |
| Resume URL | No | Valid URL | Link to resume |
| LinkedIn URL | No | Valid LinkedIn URL | Profile link |
| Years Experience | No | Numeric 0-50 | Total years |
| Vendor Consultant ID | No | Alphanumeric | Vendor's internal ID |

---

## Postconditions

### Success Postconditions

1. **Vendor consultant profiles imported** into system
2. **Import summary logged** with counts and timestamp
3. **New profiles assigned** to importer (if auto-assign enabled)
4. **Duplicates flagged** for review
5. **Immigration warnings generated** for expiring visas
6. **Vendor bench count updated** in dashboard
7. **Email notification sent** to manager (if large import >100 profiles)
8. **Import history recorded** for audit trail

### Failure Postconditions

1. **Error logged** with failure reason
2. **No profiles imported** (all-or-nothing for API sync)
3. **User notified** of failure with error details
4. **Retry scheduled** (for automated syncs)
5. **Manager notified** if repeated failures

---

## Events Logged

| Event | Payload |
|-------|---------|
| `vendor_bench.import_started` | `{ vendor_id, import_type, initiated_by, timestamp }` |
| `vendor_bench.import_completed` | `{ vendor_id, total_processed, new_count, updated_count, skipped_count, error_count, duration, timestamp }` |
| `vendor_bench.import_failed` | `{ vendor_id, error_message, timestamp }` |
| `vendor_bench.duplicate_detected` | `{ vendor_consultant_id, internal_consultant_id, resolution, timestamp }` |
| `vendor_bench.profile_added` | `{ vendor_consultant_id, vendor_id, skills, visa_type, assigned_to, timestamp }` |
| `vendor_bench.profile_updated` | `{ vendor_consultant_id, changed_fields, timestamp }` |
| `vendor_bench.immigration_warning` | `{ vendor_consultant_id, visa_type, expiry_date, days_until_expiry, timestamp }` |

---

## Error Scenarios

| Scenario | Cause | System Response | User Action |
|----------|-------|-----------------|-------------|
| **API connection failure** | Vendor API down or credentials invalid | Show error, suggest retry or manual import | Contact vendor IT support, use manual file upload |
| **File format invalid** | Wrong file type or corrupted | Reject upload, show error message | Fix file format, re-upload |
| **File too large** | File >10MB or >500 profiles | Reject upload | Split into multiple files |
| **Missing required columns** | CSV missing email, name, etc. | Show validation error, column mapping | Add missing columns or map correctly |
| **All profiles invalid** | Every row has validation errors | Import fails, show errors | Fix data quality issues in source file |
| **Duplicate vendor** | Trying to import same vendor data twice | Warn user, suggest merge instead | Choose merge or skip |
| **Immigration data mismatch** | Visa type not recognized | Show warning, map to "Unknown" | Contact vendor to standardize visa codes |
| **Rate data missing** | No rate information provided | Import with rate = 0, flag for update | Manually update rates or contact vendor |
| **Network timeout** | Large import times out | Show error, suggest smaller batches | Split import into smaller batches |
| **Vendor agreement missing** | No signed vendor agreement found | Block import, require agreement | Complete vendor onboarding first |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g then v` | Go to Vendor Bench |
| `i` | Start new import |
| `r` | Refresh sync status |
| `Cmd/Ctrl + U` | Upload file |
| `Enter` | Confirm import |
| `Esc` | Cancel import |
| `→` / `←` | Navigate warnings/duplicates |
| `d` | Toggle duplicate resolution |
| `s` | Skip current warning |

---

## Alternative Flows

### A1: Automated Daily Sync (API Integration)

**Trigger:** Scheduled cron job at 8:00 AM daily

**System Actions:**
1. System initiates sync for all API-enabled vendors
2. Fetches latest data from each vendor API
3. Processes profiles (dedupe, validate, categorize)
4. Sends summary email to bench team:
   - Total vendors synced: 5
   - New profiles: 12
   - Updated profiles: 34
   - Warnings: 3 (immigration alerts)
5. Updates vendor bench dashboard
6. No user interaction required

### A2: SFTP File Transfer

**Trigger:** Vendor drops new file on SFTP server

**System Actions:**
1. System detects new file on SFTP
2. Downloads and validates file
3. Auto-processes if format matches previous imports
4. If format changed: notifies user to map columns
5. Completes import and sends notification

**User Actions (if format changed):**
1. Receive notification: "SFTP import pending - column mapping needed"
2. Navigate to vendor bench import
3. Map columns
4. Approve import

### A3: Import Fails - Retry Flow

**Trigger:** API sync fails due to network error

**System Actions:**
1. Logs error: "API sync failed for TechStaff Solutions"
2. Schedules retry in 1 hour
3. If retry fails: schedules retry in 4 hours
4. If third retry fails: notifies manager and bench team
5. Suggests manual file import as workaround

**User Actions:**
1. Receive notification: "Automated sync failed for TechStaff Solutions"
2. Check sync status in vendor bench dashboard
3. Review error log
4. Contact vendor to resolve issue OR
5. Perform manual file import

### A4: Overlap Detected - Internal Consultant Also in Vendor Bench

**Scenario:** Vendor imports consultant who is already InTime internal employee

**System Actions:**
1. Detects duplicate by email/phone
2. Flags as "Internal Overlap - Potential Conflict"
3. Notifies bench manager
4. Creates task: "Review overlap: [Consultant Name] - InTime vs [Vendor]"

**User Actions:**
1. Review overlap details
2. Determine cause:
   - **Consultant is InTime employee**: Skip vendor import, notify vendor to remove
   - **Consultant is vendor's consultant**: Different person, allow both
   - **Consultant left InTime, now vendor's**: Update internal status to "Former Employee", allow vendor import
3. Document resolution
4. Update vendor bench import settings

### A5: Bulk Update Existing Profiles

**Trigger:** Vendor sends updated bench list with rate changes

**User Actions:**
1. Upload vendor file
2. System detects 200 matches with existing profiles
3. Shows bulk update preview:
   - 50 profiles: Rate changed
   - 30 profiles: Skills updated
   - 20 profiles: Availability changed
   - 100 profiles: No changes
4. User reviews changes
5. Approves bulk update
6. System updates all 200 profiles
7. Logs update activity for each profile

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Vendor | Required | "Please select a vendor" |
| Import File | Required (manual) | "Please upload a file" |
| File Type | .csv, .xlsx, .xls | "Invalid file type. Please upload CSV or Excel." |
| File Size | Max 10 MB | "File too large. Maximum 10 MB." |
| Profile Count | Max 500 per upload | "Too many profiles. Maximum 500 per upload." |
| Email | Valid email format | "Invalid email format: [email]" |
| Phone | Valid phone format | "Invalid phone format: [phone]" |
| Email or Phone | At least one | "Each profile must have email OR phone" |
| Name | Required | "Name is required" |
| Skills | Min 1 skill | "At least one skill required" |
| Rate | Numeric ≥0 | "Rate must be a positive number" |
| Visa Type | Valid visa code | "Unknown visa type: [value]" |

---

## Business Rules

### Import Limits

- Maximum **500 profiles** per manual upload
- Maximum **10 MB** file size
- API syncs: No limit (vendor dependent)
- Dedupe by: Email (exact match) OR Phone (exact match)

### Ownership Assignment

- **Auto-assign** to importer if enabled
- **No assignment** if disabled (pool available to all)
- **Reassign** allowed by manager

### Conflict Resolution Priority

1. **Internal bench always wins** (InTime employees take precedence)
2. **Most recent data** used for updates
3. **Manual review required** for overlaps
4. **Vendor notified** of conflicts within 24 hours

### Data Refresh Frequency

| Vendor Type | Sync Frequency | Retention |
|-------------|----------------|-----------|
| API (Tier 1) | Every 8 hours | 90 days inactive |
| API (Tier 2) | Daily | 60 days inactive |
| SFTP | Weekly | 45 days inactive |
| Manual | On-demand | 30 days inactive |

### Immigration Compliance

- **Auto-flag** profiles with work auth expiring <90 days
- **Skip import** for expired work auth (if setting enabled)
- **Alert manager** for any red/black level immigration alerts in import

---

## Related Use Cases

- [13-manage-vendors.md](./13-manage-vendors.md) - Managing vendor relationships
- [14-onboard-vendor.md](./14-onboard-vendor.md) - Onboarding new vendor partners
- [16-vendor-commission.md](./16-vendor-commission.md) - Tracking vendor payments
- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [04-find-requirements.md](./04-find-requirements.md) - Finding jobs for vendor consultants

---

*Last Updated: 2024-11-30*
