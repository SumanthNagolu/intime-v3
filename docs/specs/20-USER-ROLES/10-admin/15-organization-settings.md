# UC-ADMIN-015: Organization Settings

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-015 |
| Actor | Admin |
| Goal | Configure organization-wide settings including branding, regional settings, business hours, and defaults |
| Frequency | Monthly (initial setup) + as needed for modifications |
| Estimated Time | 20-45 min for full configuration |
| Priority | HIGH |

---

## Preconditions

1. User is authenticated with Admin role
2. User has `settings.organization.update` permission
3. Organization exists in the system
4. User has access to brand assets (logo, favicon)

---

## Trigger

- Admin clicks "Settings" → "Organization" in sidebar
- Admin navigates directly to `/employee/admin/settings/org`
- Admin uses keyboard shortcut `g o` from any admin page
- First-time organization setup wizard

---

## Settings Categories

| Category | Code | Description | Fields Count |
|----------|------|-------------|--------------|
| Company Information | `company` | Name, legal name, industry, size | 6 fields |
| Branding | `branding` | Logo, favicon, colors, fonts | 8 fields |
| Regional Settings | `regional` | Timezone, locale, date/time formats, currency | 7 fields |
| Fiscal Year | `fiscal` | Fiscal year start, reporting periods | 3 fields |
| Business Hours | `hours` | Operating hours per day, holidays | 14 fields |
| Default Values | `defaults` | System defaults for new records | 12 fields |
| Contact Information | `contact` | Address, phone, support email | 8 fields |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Organization Settings

**User Action:** Click "Settings" in Admin sidebar, then "Organization"

**System Response:**
- URL changes to: `/employee/admin/settings/org`
- Page title displays: "Organization Settings"
- Settings form loads with current values
- Tabs for different setting categories shown

**Screen State:**

```
+----------------------------------------------------------+
| Organization Settings                            [Save]    |
+----------------------------------------------------------+
| [Company Info] [Branding] [Regional] [Business Hours]     |
| [Fiscal Year] [Defaults] [Contact]                        |
+----------------------------------------------------------+
|                                                            |
| COMPANY INFORMATION                                        |
|                                                            |
| Company Name *                                             |
| [InTime Staffing Inc.                                  ]   |
|                                                            |
| Legal Name                                                 |
| [InTime Staffing Incorporated                          ]   |
|                                                            |
| Industry *                                                 |
| [IT Staffing & Consulting                              ▼]  |
| Options: IT Staffing, Healthcare Staffing, Finance,       |
|          Manufacturing, General Staffing, Other           |
|                                                            |
| Company Size *                                             |
| [51-200 employees                                      ▼]  |
| Options: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+    |
|                                                            |
| Founded Year                                               |
| [2015                                                  ]   |
|                                                            |
| Website                                                    |
| [https://intime.com                                    ]   |
|                                                            |
| Tax ID / EIN                                               |
| [**-***1234                                            ]   |
| 🔒 Encrypted - only last 4 digits shown                   |
|                                                            |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Configure Branding Settings

**User Action:** Click "Branding" tab

**System Response:**
- Branding settings panel loads
- Current logo and colors displayed
- Preview of branded elements shown

**Screen State:**

```
+----------------------------------------------------------+
| Organization Settings                            [Save]    |
+----------------------------------------------------------+
| [Company Info] [Branding ← Active] [Regional]             |
| [Business Hours] [Fiscal Year] [Defaults] [Contact]       |
+----------------------------------------------------------+
|                                                            |
| BRANDING                                                   |
|                                                            |
| Company Logo                                               |
| ┌─────────────────────────────────────────────────────┐   |
| │ [Current Logo Preview - InTime]                     │   |
| │                                                     │   |
| │ [Upload New Logo]  [Remove]                        │   |
| │                                                     │   |
| │ Requirements:                                       │   |
| │ • PNG or SVG format                                │   |
| │ • Max file size: 2MB                               │   |
| │ • Minimum dimensions: 200x50px                     │   |
| │ • Recommended: Transparent background              │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| Favicon                                                    |
| ┌─────────────────────────────────────────────────────┐   |
| │ [🏢]  [Upload New]  [Remove]                        │   |
| │                                                     │   |
| │ Requirements: ICO or PNG, 32x32 or 64x64px         │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| COLOR SCHEME                                               |
|                                                            |
| Primary Color (Brand)                                      |
| [#2D5016    ] [■] Forest Green                            |
| Used for: Primary buttons, links, active states           |
|                                                            |
| Secondary Color                                            |
| [#E07A5F    ] [■] Rust/Terracotta                         |
| Used for: Accents, hover states, highlights               |
|                                                            |
| Background Color                                           |
| [#FFFFFF    ] [■] White                                   |
| Used for: Page backgrounds, cards                         |
|                                                            |
| Text Color                                                 |
| [#1A1A1A    ] [■] Near Black                              |
| Used for: Body text, headings                             |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| PREVIEW                                                    |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ [Logo]  InTime OS              [Notification] [User]│   |
| │                                                     │   |
| │ ┌──────────┐                                       │   |
| │ │ Sidebar  │  Welcome back, Sarah!                 │   |
| │ │ ────────│                                        │   |
| │ │ Dashboard│  [Primary Button] [Secondary Button]  │   |
| │ │ Jobs     │                                       │   |
| │ │ Candidate│  Sample text with link styling        │   |
| │ └──────────┘                                       │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| [Reset to Default Colors]                                  |
|                                                            |
+----------------------------------------------------------+
```

**Field Specification: Logo Upload**

| Property | Value |
|----------|-------|
| Field Name | `logo` |
| Type | File Upload |
| Accept | .png, .svg |
| Max Size | 2MB |
| Min Dimensions | 200x50px |
| Recommended | Transparent background |
| Error Messages | |
| - Wrong Format | "Please upload a PNG or SVG file" |
| - Too Large | "Logo must be under 2MB" |
| - Too Small | "Logo must be at least 200x50 pixels" |

**Field Specification: Primary Color**

| Property | Value |
|----------|-------|
| Field Name | `primary_color` |
| Type | ColorInput (with picker) |
| Format | Hex color (#RRGGBB) |
| Default | #2D5016 (Forest Green) |
| Validation | Valid hex color |
| Contrast Check | Warn if insufficient contrast with white |
| Error Messages | |
| - Invalid | "Please enter a valid hex color" |
| - Low Contrast | "Color may not be accessible on white background" |

**Time:** ~5-10 seconds (uploading files)

---

### Step 3: Configure Regional Settings

**User Action:** Click "Regional" tab

**System Response:**
- Regional settings panel loads
- Current timezone and locale displayed
- Format previews shown

**Screen State:**

```
+----------------------------------------------------------+
| Organization Settings                            [Save]    |
+----------------------------------------------------------+
| [Company Info] [Branding] [Regional ← Active]             |
| [Business Hours] [Fiscal Year] [Defaults] [Contact]       |
+----------------------------------------------------------+
|                                                            |
| REGIONAL SETTINGS                                          |
|                                                            |
| Default Timezone *                                         |
| [America/New_York (EST/EDT)                            ▼]  |
| Current time: 2:45 PM EST                                 |
|                                                            |
| Default Locale *                                           |
| [English (United States)                               ▼]  |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| DATE & TIME FORMATS                                        |
|                                                            |
| Date Format *                                              |
| [MM/DD/YYYY                                            ▼]  |
| Preview: 12/03/2024                                       |
|                                                            |
| Options:                                                   |
| • MM/DD/YYYY (12/03/2024)                                 |
| • DD/MM/YYYY (03/12/2024)                                 |
| • YYYY-MM-DD (2024-12-03)                                 |
| • MMM DD, YYYY (Dec 03, 2024)                             |
| • DD MMM YYYY (03 Dec 2024)                               |
|                                                            |
| Time Format *                                              |
| [12-hour (2:45 PM)                                     ▼]  |
| Options: 12-hour (2:45 PM), 24-hour (14:45)               |
|                                                            |
| Week Start Day                                             |
| [Sunday                                                ▼]  |
| Options: Sunday, Monday                                   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| CURRENCY & NUMBERS                                         |
|                                                            |
| Default Currency *                                         |
| [USD - US Dollar ($)                                   ▼]  |
|                                                            |
| Number Format                                              |
| [1,234.56                                              ▼]  |
| Options: 1,234.56 | 1.234,56 | 1 234,56                   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| PREVIEW                                                    |
|                                                            |
| Date: December 3, 2024                                    |
| Time: 2:45 PM EST                                         |
| Currency: $1,234.56                                       |
| Number: 1,234,567.89                                      |
|                                                            |
+----------------------------------------------------------+
```

**Field Specification: Timezone**

| Property | Value |
|----------|-------|
| Field Name | `timezone` |
| Type | Select (searchable) |
| Options | All IANA timezone identifiers |
| Default | America/New_York |
| Required | Yes |
| Validation | Valid IANA timezone |
| Display | Show current time in selected zone |
| Error Messages | |
| - Empty | "Please select a timezone" |

**Time:** ~5 seconds

---

### Step 4: Configure Business Hours

**User Action:** Click "Business Hours" tab

**System Response:**
- Business hours configuration loads
- Per-day hour settings displayed
- Holiday calendar link shown

**Screen State:**

```
+----------------------------------------------------------+
| Organization Settings                            [Save]    |
+----------------------------------------------------------+
| [Company Info] [Branding] [Regional]                      |
| [Business Hours ← Active] [Fiscal Year] [Defaults]        |
+----------------------------------------------------------+
|                                                            |
| BUSINESS HOURS                                             |
|                                                            |
| Configure your organization's operating hours.             |
| Used for: SLA calculations, availability display           |
|                                                            |
| ┌────────────────────────────────────────────────────┐    |
| │ Day        │ Open  │ Start    │ End      │ Break  │    |
| ├────────────────────────────────────────────────────┤    |
| │ ☑ Monday   │       │ [9:00 AM]│ [5:00 PM]│ [1 hr] │    |
| │ ☑ Tuesday  │       │ [9:00 AM]│ [5:00 PM]│ [1 hr] │    |
| │ ☑ Wednesday│       │ [9:00 AM]│ [5:00 PM]│ [1 hr] │    |
| │ ☑ Thursday │       │ [9:00 AM]│ [5:00 PM]│ [1 hr] │    |
| │ ☑ Friday   │       │ [9:00 AM]│ [5:00 PM]│ [1 hr] │    |
| │ ☐ Saturday │ Closed│ ──────── │ ──────── │ ────── │    |
| │ ☐ Sunday   │ Closed│ ──────── │ ──────── │ ────── │    |
| └────────────────────────────────────────────────────┘    |
|                                                            |
| Weekly Hours: 40 hours (excluding breaks)                  |
|                                                            |
| [Apply Same Hours to All Weekdays]                         |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| HOLIDAYS                                                   |
|                                                            |
| Holiday Calendar                                           |
| [US Federal Holidays                                   ▼]  |
| Options: US Federal, US Federal + Common, Custom Only     |
|                                                            |
| Upcoming Holidays (Next 90 Days):                          |
| • Dec 25, 2024 - Christmas Day                            |
| • Jan 1, 2025 - New Year's Day                            |
| • Jan 20, 2025 - Martin Luther King Jr. Day               |
|                                                            |
| Custom Holidays                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ Date         │ Name                    │ Action    │   |
| ├─────────────────────────────────────────────────────┤   |
| │ Dec 24, 2024 │ Christmas Eve (Half Day)│ [Remove] │   |
| │ Dec 26, 2024 │ Day After Christmas     │ [Remove] │   |
| │ Jul 3, 2025  │ Independence Day Eve    │ [Remove] │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| [+ Add Custom Holiday]                                     |
|                                                            |
+----------------------------------------------------------+
```

**Field Specification: Business Hours**

| Property | Value |
|----------|-------|
| Field Name | `business_hours` |
| Type | Complex (per-day configuration) |
| Format | JSON object with day keys |
| Validation | Start time < End time |
| Error Messages | |
| - Invalid Time | "End time must be after start time" |
| - Overlap | "Time ranges cannot overlap" |

**Time:** ~10 seconds

---

### Step 5: Configure Fiscal Year

**User Action:** Click "Fiscal Year" tab

**System Response:**
- Fiscal year settings load
- Reporting period configuration shown
- Preview of fiscal periods displayed

**Screen State:**

```
+----------------------------------------------------------+
| Organization Settings                            [Save]    |
+----------------------------------------------------------+
| [Company Info] [Branding] [Regional] [Business Hours]     |
| [Fiscal Year ← Active] [Defaults] [Contact]               |
+----------------------------------------------------------+
|                                                            |
| FISCAL YEAR CONFIGURATION                                  |
|                                                            |
| Fiscal Year Start Month *                                  |
| [January                                               ▼]  |
| Options: January through December                         |
|                                                            |
| Current Fiscal Year: FY2024 (Jan 1, 2024 - Dec 31, 2024) |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| REPORTING PERIODS                                          |
|                                                            |
| Reporting Period Type                                      |
| [Quarterly (Q1, Q2, Q3, Q4)                            ▼]  |
| Options: Monthly, Quarterly, Semi-Annual                  |
|                                                            |
| Current Period: Q4 2024 (Oct 1 - Dec 31)                  |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| FISCAL YEAR PREVIEW                                        |
|                                                            |
| FY2024 Periods:                                           |
| ┌─────────────────────────────────────────────────────┐   |
| │ Period  │ Start Date  │ End Date    │ Status      │   |
| ├─────────────────────────────────────────────────────┤   |
| │ Q1 2024 │ Jan 1, 2024 │ Mar 31, 2024│ Closed      │   |
| │ Q2 2024 │ Apr 1, 2024 │ Jun 30, 2024│ Closed      │   |
| │ Q3 2024 │ Jul 1, 2024 │ Sep 30, 2024│ Closed      │   |
| │ Q4 2024 │ Oct 1, 2024 │ Dec 31, 2024│ Current     │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| SPRINT ALIGNMENT                                           |
|                                                            |
| Align sprints to fiscal periods?                          |
| ● Yes - Sprint targets reset at period boundaries         |
| ○ No - Sprints run independently                          |
|                                                            |
+----------------------------------------------------------+
```

**Time:** ~3 seconds

---

### Step 6: Configure Default Values

**User Action:** Click "Defaults" tab

**System Response:**
- Default value settings load
- Entity-specific defaults shown
- Clear indication of what each default affects

**Screen State:**

```
+----------------------------------------------------------+
| Organization Settings                            [Save]    |
+----------------------------------------------------------+
| [Company Info] [Branding] [Regional] [Business Hours]     |
| [Fiscal Year] [Defaults ← Active] [Contact]               |
+----------------------------------------------------------+
|                                                            |
| DEFAULT VALUES                                             |
|                                                            |
| Configure default values for new records.                  |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| JOB DEFAULTS                                               |
|                                                            |
| Default Job Status                                         |
| [Draft                                                 ▼]  |
|                                                            |
| Default Job Type                                           |
| [Contract                                              ▼]  |
| Options: Contract, Contract-to-Hire, Direct Hire          |
|                                                            |
| Default Work Location                                      |
| [Hybrid                                                ▼]  |
| Options: Remote, Onsite, Hybrid                           |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| CANDIDATE DEFAULTS                                         |
|                                                            |
| Default Source                                             |
| [Direct Application                                    ▼]  |
|                                                            |
| Default Availability                                       |
| [2 weeks                                               ▼]  |
| Options: Immediate, 1 week, 2 weeks, 1 month, Negotiable  |
|                                                            |
| Auto-Parse Resume                                          |
| ☑ Automatically parse uploaded resumes                    |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| SUBMISSION DEFAULTS                                        |
|                                                            |
| Default Submission Status                                  |
| [Pending Review                                        ▼]  |
|                                                            |
| Auto-Send Client Email                                     |
| ☐ Automatically send submission email to client           |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| ACTIVITY DEFAULTS                                          |
|                                                            |
| Default Follow-Up Days                                     |
| [3    ] days                                              |
|                                                            |
| Auto-Create Follow-Up Task                                 |
| ☑ Create follow-up task after activities                  |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| COMMUNICATION DEFAULTS                                     |
|                                                            |
| Email Signature Location                                   |
| [Below message                                         ▼]  |
| Options: Below message, Above message, None               |
|                                                            |
| Include Company Disclaimer                                 |
| ☑ Add legal disclaimer to outbound emails                 |
|                                                            |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 7: Configure Contact Information

**User Action:** Click "Contact" tab

**System Response:**
- Contact information settings load
- Address and communication details shown

**Screen State:**

```
+----------------------------------------------------------+
| Organization Settings                            [Save]    |
+----------------------------------------------------------+
| [Company Info] [Branding] [Regional] [Business Hours]     |
| [Fiscal Year] [Defaults] [Contact ← Active]               |
+----------------------------------------------------------+
|                                                            |
| CONTACT INFORMATION                                        |
|                                                            |
| This information appears in email footers and documents.   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| PRIMARY ADDRESS                                            |
|                                                            |
| Street Address *                                           |
| [123 Main Street                                       ]   |
|                                                            |
| Suite/Unit                                                 |
| [Suite 400                                             ]   |
|                                                            |
| City *                                                     |
| [New York                                              ]   |
|                                                            |
| State/Province *                                           |
| [NY                                                    ▼]  |
|                                                            |
| ZIP/Postal Code *                                          |
| [10001                                                 ]   |
|                                                            |
| Country *                                                  |
| [United States                                         ▼]  |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| PHONE NUMBERS                                              |
|                                                            |
| Main Phone *                                               |
| [(555) 123-4567                                        ]   |
|                                                            |
| Fax                                                        |
| [(555) 123-4568                                        ]   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| EMAIL ADDRESSES                                            |
|                                                            |
| General Inquiries                                          |
| [info@intime.com                                       ]   |
|                                                            |
| Support Email                                              |
| [support@intime.com                                    ]   |
|                                                            |
| HR Email                                                   |
| [hr@intime.com                                         ]   |
|                                                            |
| Billing Email                                              |
| [billing@intime.com                                    ]   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| SOCIAL MEDIA                                               |
|                                                            |
| LinkedIn URL                                               |
| [https://linkedin.com/company/intime                   ]   |
|                                                            |
| Twitter/X Handle                                           |
| [@intimestaffing                                       ]   |
|                                                            |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 8: Save Settings

**User Action:** Click "Save" button

**System Response:**
- All settings validate
- Settings save to database
- Success notification appears
- Audit log entry created

**Backend Processing:**

```typescript
// Save organization settings
async function saveOrganizationSettings(orgId: string, settings: OrgSettings) {
  // 1. Validate all settings
  const validation = await validateOrgSettings(settings);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors);
  }

  // 2. Process logo upload if changed
  if (settings.logo instanceof File) {
    const logoUrl = await uploadFile(settings.logo, {
      bucket: 'org-assets',
      path: `${orgId}/logo`,
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/png', 'image/svg+xml']
    });
    settings.logo_url = logoUrl;
  }

  // 3. Process favicon upload if changed
  if (settings.favicon instanceof File) {
    const faviconUrl = await uploadFile(settings.favicon, {
      bucket: 'org-assets',
      path: `${orgId}/favicon`,
      maxSize: 100 * 1024, // 100KB
      allowedTypes: ['image/png', 'image/x-icon']
    });
    settings.favicon_url = faviconUrl;
  }

  // 4. Update organization record
  await db.organizations.update(orgId, {
    name: settings.company_name,
    legal_name: settings.legal_name,
    industry: settings.industry,
    company_size: settings.company_size,
    website: settings.website,
    logo_url: settings.logo_url,
    favicon_url: settings.favicon_url,
    primary_color: settings.primary_color,
    secondary_color: settings.secondary_color,
    timezone: settings.timezone,
    locale: settings.locale,
    date_format: settings.date_format,
    time_format: settings.time_format,
    currency: settings.currency,
    fiscal_year_start: settings.fiscal_year_start,
    business_hours: settings.business_hours,
    holidays: settings.holidays,
    default_values: settings.default_values,
    contact_info: settings.contact_info,
    updated_at: new Date(),
    updated_by: currentUser.id
  });

  // 5. Clear cached settings
  await cache.invalidate(`org:${orgId}:settings`);

  // 6. Create audit log
  await auditLog.create({
    action: 'organization.settings_updated',
    entity_type: 'organization',
    entity_id: orgId,
    user_id: currentUser.id,
    changes: settings
  });

  return { success: true };
}
```

**SQL:**

```sql
-- Update organization settings
UPDATE organizations SET
  name = 'InTime Staffing Inc.',
  legal_name = 'InTime Staffing Incorporated',
  industry = 'IT Staffing',
  company_size = '51-200',
  website = 'https://intime.com',
  logo_url = 'https://storage.../org/logo.png',
  favicon_url = 'https://storage.../org/favicon.ico',
  primary_color = '#2D5016',
  secondary_color = '#E07A5F',
  timezone = 'America/New_York',
  locale = 'en-US',
  date_format = 'MM/DD/YYYY',
  time_format = '12h',
  currency = 'USD',
  fiscal_year_start = 1,
  business_hours = '{
    "monday": {"open": true, "start": "09:00", "end": "17:00"},
    "tuesday": {"open": true, "start": "09:00", "end": "17:00"},
    "wednesday": {"open": true, "start": "09:00", "end": "17:00"},
    "thursday": {"open": true, "start": "09:00", "end": "17:00"},
    "friday": {"open": true, "start": "09:00", "end": "17:00"},
    "saturday": {"open": false},
    "sunday": {"open": false}
  }',
  holidays = '["2024-12-25", "2025-01-01"]',
  default_values = '{"job_status": "draft", "job_type": "contract"}',
  contact_info = '{
    "address": {"street": "123 Main St", "city": "New York", "state": "NY"},
    "phone": "(555) 123-4567",
    "email": "info@intime.com"
  }',
  updated_at = NOW(),
  updated_by = 'user-uuid'
WHERE id = 'org-uuid';
```

**Time:** ~2 seconds

---

## Alternative Flows

### Alternative A: First-Time Setup Wizard

1. New organization created
2. Setup wizard launches automatically
3. Step-by-step configuration of essential settings
4. Skip optional settings for later
5. Complete setup and access dashboard

### Alternative B: Reset to Defaults

1. Click "Reset to Defaults" for specific section
2. Confirm in modal
3. Settings revert to system defaults
4. Save to apply

### Alternative C: Import Settings

1. Click "Import Settings"
2. Upload JSON configuration file
3. Preview changes
4. Confirm and apply

### Alternative D: Export Settings

1. Click "Export Settings"
2. Choose format (JSON or CSV)
3. Download configuration file
4. Use for backup or migration

---

## Postconditions

1. Organization settings saved to database
2. Brand assets uploaded and accessible
3. Regional settings applied across system
4. Business hours calendar updated
5. Default values applied to new records
6. Audit log entry created
7. Cache invalidated for settings

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Invalid Logo | Wrong file format | "Please upload a PNG or SVG file" | Upload correct format |
| Logo Too Large | File exceeds 2MB | "Logo must be under 2MB" | Compress or resize |
| Invalid Color | Malformed hex code | "Please enter a valid hex color" | Fix color format |
| Invalid Timezone | Unknown timezone ID | "Invalid timezone selected" | Choose from list |
| Invalid Hours | End before start | "End time must be after start time" | Fix time range |
| Missing Required | Required field empty | "[Field] is required" | Fill in field |
| Invalid URL | Malformed website URL | "Please enter a valid URL" | Fix URL format |
| Permission Denied | User lacks permission | "You don't have permission to update settings" | Contact admin |

---

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` | Open Command Bar | Any page |
| `g o` | Go to Organization Settings | Any admin page |
| `Cmd+S` | Save Settings | Settings page |
| `Cmd+Z` | Undo Change | Settings form |
| `Tab` | Next Field | Form navigation |
| `Shift+Tab` | Previous Field | Form navigation |
| `1-7` | Switch Tab | Settings page (with Cmd) |
| `Escape` | Cancel/Close Modal | Any modal |

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-ORG-001 | Update company name | Admin logged in | Change name, save | Name updated across system |
| ADMIN-ORG-002 | Upload logo | Valid PNG file | Upload 200x100 PNG | Logo displayed in header |
| ADMIN-ORG-003 | Invalid logo format | JPG file | Try to upload JPG | Error: "Please upload PNG or SVG" |
| ADMIN-ORG-004 | Logo too large | 5MB PNG | Try to upload | Error: "Must be under 2MB" |
| ADMIN-ORG-005 | Change timezone | - | Select new timezone | All times display in new zone |
| ADMIN-ORG-006 | Change date format | - | Select DD/MM/YYYY | Dates display in new format |
| ADMIN-ORG-007 | Configure business hours | - | Set Mon-Fri 9-5 | Hours saved, SLA uses new hours |
| ADMIN-ORG-008 | Add custom holiday | - | Add Dec 24 | Holiday appears in calendar |
| ADMIN-ORG-009 | Change fiscal year start | - | Set to July | Fiscal periods recalculate |
| ADMIN-ORG-010 | Update default job type | - | Set to Direct Hire | New jobs default to Direct Hire |
| ADMIN-ORG-011 | Change primary color | - | Set to #FF0000 | UI accent color changes |
| ADMIN-ORG-012 | Invalid hex color | - | Enter "red" | Error: "Enter valid hex color" |
| ADMIN-ORG-013 | Export settings | - | Click Export | JSON file downloads |
| ADMIN-ORG-014 | Import settings | Valid JSON | Upload config | Settings applied from file |
| ADMIN-ORG-015 | Reset section | - | Reset branding | Colors revert to defaults |

---

## Database Schema Reference

```sql
-- Organizations table (settings columns)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT,
  company_size TEXT,
  founded_year INTEGER,
  website TEXT,
  tax_id_encrypted TEXT,

  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#2D5016',
  secondary_color TEXT DEFAULT '#E07A5F',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#1A1A1A',

  -- Regional
  timezone TEXT DEFAULT 'America/New_York',
  locale TEXT DEFAULT 'en-US',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  week_start TEXT DEFAULT 'sunday',
  currency TEXT DEFAULT 'USD',
  number_format TEXT DEFAULT '1,234.56',

  -- Fiscal
  fiscal_year_start INTEGER DEFAULT 1, -- January
  reporting_period TEXT DEFAULT 'quarterly',
  sprint_alignment BOOLEAN DEFAULT true,

  -- Business Hours
  business_hours JSONB DEFAULT '{
    "monday": {"open": true, "start": "09:00", "end": "17:00"},
    "tuesday": {"open": true, "start": "09:00", "end": "17:00"},
    "wednesday": {"open": true, "start": "09:00", "end": "17:00"},
    "thursday": {"open": true, "start": "09:00", "end": "17:00"},
    "friday": {"open": true, "start": "09:00", "end": "17:00"},
    "saturday": {"open": false},
    "sunday": {"open": false}
  }',
  holiday_calendar TEXT DEFAULT 'us_federal',
  custom_holidays JSONB DEFAULT '[]',

  -- Defaults
  default_values JSONB DEFAULT '{}',

  -- Contact Info
  contact_info JSONB DEFAULT '{}',

  -- Metadata
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Organization assets (logos, files)
CREATE TABLE organization_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  asset_type TEXT NOT NULL, -- 'logo', 'favicon', 'document_header'
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_active BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organization_assets_org ON organization_assets(org_id, asset_type);
```

---

## UI Component Reference (Mantine v7)

| Context | Component | Props |
|---------|-----------|-------|
| Settings Tabs | `<Tabs>` | variant="outline" |
| Form Section | `<Paper p="md">` | withBorder |
| Logo Upload | `<Dropzone>` | accept={['image/png', 'image/svg+xml']} |
| Color Picker | `<ColorInput>` | format="hex" |
| Timezone Select | `<Select searchable>` | data={timezones} |
| Time Input | `<TimeInput>` | format="12" |
| Address Form | `<Stack gap="sm">` | Multiple TextInputs |
| Save Button | `<Button variant="filled">` | color="brand" |
| Preview Card | `<Card withBorder>` | p="md" |
| Setting Label | `<Text size="sm" fw={500}>` | c="dimmed" |

---

## Related Use Cases

- [UC-ADMIN-003](./03-system-settings.md) - System Settings (system-level configuration)
- [UC-ADMIN-010](./10-email-templates.md) - Email Templates (uses company variables)
- [UC-ADMIN-012](./12-sla-configuration.md) - SLA Configuration (uses business hours)
- [UC-ADMIN-009](./09-workflow-configuration.md) - Workflow Configuration (uses defaults)

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-03 | Initial documentation - full enterprise spec |

---

*Last Updated: 2025-12-03*
