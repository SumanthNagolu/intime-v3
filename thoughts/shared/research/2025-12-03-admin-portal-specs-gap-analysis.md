---
date: 2025-12-03T12:00:00-05:00
researcher: Claude Code
git_commit: df2bd238ff7c74319acc6a746b018cd24a7bb243
branch: main
repository: SumanthNagolu/intime-v3
topic: "Admin Portal Specs Gap Analysis - Enterprise Level Update Requirements"
tags: [research, admin, specs, user-flows, enterprise-ats, ceipal, bullhorn]
status: complete
last_updated: 2025-12-03
last_updated_by: Claude Code
---

# Research: Admin Portal Specs - Gap Analysis & Enterprise-Level Update Requirements

**Date**: 2025-12-03T12:00:00-05:00
**Researcher**: Claude Code
**Git Commit**: df2bd238ff7c74319acc6a746b018cd24a7bb243
**Branch**: main
**Repository**: SumanthNagolu/intime-v3

## Research Question

Analyze current admin userflow specs and identify gaps compared to enterprise-level ATS/CRM systems (CEIPAL, Bullhorn). Document exactly what needs to be updated/fixed to make admin specs foolproof with:
- Detailed click-by-click flows
- Complete form field specifications
- ASCII wireframes
- All transaction flows an admin would perform
- UI/Frontend rules alignment (Mantine v7.x design system)

---

## Summary

The current admin specs provide a **solid foundation** but fall significantly short of the **enterprise-level detail** found in recruiter/HR specs (06-make-placement.md, 02-employee-onboarding.md). The recruiter spec has **1,294 lines** with complete field specifications, SQL, commission formulas, test cases, and celebration animations. Admin specs range from **200-600 lines** and lack:

1. **Click-by-click main flows** with timing
2. **Complete field specifications** (type, validation, error messages)
3. **ASCII wireframes** for every screen state
4. **Backend processing steps** with SQL/TypeScript
5. **Alternative flows** and **rollback scenarios**
6. **Test cases** with specific IDs
7. **Keyboard shortcuts**
8. **UI/UX specifications** aligned with design system

Additionally, **critical admin functions are missing entirely**:
- Workflow Configuration/Automation
- Email Template Management
- SLA Configuration
- Activity Pattern Configuration
- Notification Rules Configuration
- Feature Flag Management
- Organization Settings (branding, timezone, locale)

---

## Gap Analysis by Spec File

### 1. Current Admin Spec Structure

| Spec File | Current Lines | Target Lines | Completeness |
|-----------|--------------|--------------|--------------|
| 00-OVERVIEW.md | ~50 | 150+ | 33% |
| 01-manage-users.md | ~200 | 400+ | 50% |
| 02-configure-pods.md | ~180 | 400+ | 45% |
| 03-system-settings.md | ~200 | 600+ | 33% |
| 04-data-management.md | ~150 | 400+ | 38% |
| 05-user-management.md | ~620 | 800+ | 78% |
| 06-permission-management.md | ~463 | 600+ | 77% |
| 07-integration-management.md | ~390 | 500+ | 78% |
| 08-audit-logs.md | ~411 | 500+ | 82% |
| 11-emergency-procedures.md | ~622 | 650+ | 96% |

**Missing Specs (Need to Create):**
- `09-workflow-configuration.md` - Workflow automation, approval chains, triggers
- `10-email-templates.md` - Email template management, notification settings
- `12-sla-configuration.md` - SLA rules, escalation paths, time-based alerts
- `13-activity-patterns.md` - Activity type definitions, required fields, workflows
- `14-feature-flags.md` - Feature toggles, beta rollout, A/B testing
- `15-organization-settings.md` - Branding, timezone, locale, fiscal year

---

## Detailed Findings

### 1. Overview Spec (00-OVERVIEW.md)

**Current State:**
- Basic navigation structure
- Role permissions table (high-level)
- Quick links to sub-specs

**Gaps:**
- Missing **Admin Dashboard wireframe** with metrics
- No **Quick Actions** panel spec
- No **Alert/Notification center** spec
- Missing **Navigation structure** aligned with UI design system
- No **Sidebar configuration** details

**Required Updates:**

```markdown
## Admin Dashboard Screen

### Screen Layout (ASCII)
+----------------------------------------------------------+
| InTime OS                    [🔔 3] [👤 Admin ▼]         |
+----------------------------------------------------------+
| ADMIN                                                     |
| ┌──────────────┐                                         |
| │ 📊 Dashboard │ ← Active                                |
| │ 👥 Users     │                                         |
| │ 🔐 Roles     │                                         |
| │ 🏢 Pods      │                                         |
| │ 🔑 Permissions│                                        |
| ├──────────────┤                                         |
| │ SYSTEM       │                                         |
| │ ⚙️ Settings  │                                         |
| │ 🔗 Integrations│                                       |
| │ 📋 Workflows │                                         |
| │ 🎯 SLA Config│                                         |
| │ 📧 Email     │                                         |
| │ 🚩 Features  │                                         |
| ├──────────────┤                                         |
| │ DATA         │                                         |
| │ 📦 Data Hub  │                                         |
| │ 📜 Audit Logs│                                         |
| │ 🖥️ System Logs│                                        |
| └──────────────┘                                         |
|                                                          |
| MAIN CONTENT AREA                                        |
| ┌─────────────────────────────────────────────────────┐ |
| │ System Health                        [Refresh] [⚙️] │ |
| │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │ |
| │ │  247   │ │  245   │ │   2    │ │   0    │       │ |
| │ │ Total  │ │ Active │ │Inactive│ │ Locked │       │ |
| │ │ Users  │ │ Users  │ │ Users  │ │Accounts│       │ |
| │ └────────┘ └────────┘ └────────┘ └────────┘       │ |
| ├─────────────────────────────────────────────────────┤ |
| │ Quick Actions                                        │ |
| │ [+ Add User] [📧 Invite Users] [🔄 Sync HRIS]       │ |
| │ [⬇️ Export Data] [🔧 System Settings]               │ |
| ├─────────────────────────────────────────────────────┤ |
| │ System Alerts (2)                       [View All →]│ |
| │ 🟡 SMTP Email: Connection timeout (15 min ago)      │ |
| │ 🟡 Unusual data export: john@... (500 records)      │ |
| ├─────────────────────────────────────────────────────┤ |
| │ Recent Activity                         [View All →]│ |
| │ 2:42 PM  admin@...  Login     Session    ✓          │ |
| │ 2:40 PM  sarah@...  Login     Session    ✗ (5th)    │ |
| │ 2:38 PM  mike@...   Update    Job #1234  ✓          │ |
| └─────────────────────────────────────────────────────┘ |
+----------------------------------------------------------+

### Metrics Grid Specification

| Metric | Data Source | Refresh Rate | Click Action |
|--------|-------------|--------------|--------------|
| Total Users | `admin.users.count()` | 5 min | → Users List |
| Active Users | `admin.users.count(status='active')` | 5 min | → Filter: Active |
| Inactive Users | `admin.users.count(status='inactive')` | 5 min | → Filter: Inactive |
| Locked Accounts | `admin.users.count(status='locked')` | 1 min | → Filter: Locked |
| Active Sessions | `admin.sessions.countActive()` | 30 sec | → Session Monitor |
| Failed Logins (24h) | `admin.audit.failedLogins(24h)` | 1 min | → Audit Logs |
| Integration Health | `admin.integrations.health()` | 1 min | → Integrations |
| Pending Invitations | `admin.invitations.pending()` | 5 min | → Pending Invites |
```

---

### 2. User Management (01-manage-users.md + 05-user-management.md)

**Current State:**
- 05-user-management.md is fairly detailed (620 lines)
- Has ASCII wireframes
- Has some field specifications
- Includes bulk operations section

**Gaps:**
- Missing **click-by-click flow** with step numbers and timing
- Field specifications lack **error messages** and **validation details**
- No **keyboard shortcuts**
- No **test cases** with IDs
- No **database schema reference**
- Missing **User Profile Photos** handling
- Missing **SSO/SAML** user provisioning flow
- Missing **API Token Management** per user

**Required Updates (Example - Create User Flow):**

```markdown
### Step 3: Enter Email Address

**User Action:** Click in email field, type email address

**System Response:**
- Field receives focus with blue-500 border
- As user types, real-time validation runs (debounced 500ms)
- If email exists: Red border, error message appears
- If email valid and unique: Green checkmark appears

**Field Specification: Email Address**
| Property | Value |
|----------|-------|
| Field Name | `email` |
| Type | Email Input |
| Label | "Email Address" |
| Placeholder | "name@company.com" |
| Required | Yes |
| Max Length | 100 characters |
| Validation | Valid email format (RFC 5322) |
| Unique Check | Real-time (debounced 500ms) |
| Domain Restriction | Optional (configurable per org) |
| Error Messages | |
| - Empty | "Email address is required" |
| - Invalid format | "Please enter a valid email address" |
| - Already exists | "This email is already registered. View user?" |
| - Domain blocked | "Only @company.com emails are allowed" |
| Accessibility | aria-label="Email address", aria-required="true" |

**Time:** ~3 seconds
```

**Additional Fields Required (CEIPAL/Bullhorn patterns):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Employee ID | Text | No (auto-gen) | Unique employee identifier |
| Profile Photo | Image Upload | No | Max 5MB, JPG/PNG |
| Job Title | Text | Yes | Position title |
| Department | Select | Yes | Organization department |
| Reports To | User Search | Yes | Direct manager |
| Cost Center | Text | No | For finance tracking |
| Hire Date | Date | Yes | Employment start date |
| Time Zone | Select | Yes | User's timezone |
| Locale | Select | No | Language preference |
| Work Location | Select | Yes | Remote/Office/Hybrid |
| Office Location | Select | Conditional | If Office/Hybrid |
| Commission Plan | Select | No | For sales/recruiting |
| License Type | Select | No | Seat license level |
| SSO Identifier | Text | No | For SSO mapping |
| External System ID | Text | No | HRIS sync identifier |
| Phone Extension | Text | No | Internal extension |
| Mobile Phone | Phone | No | For 2FA/SMS |
| Specializations | Multi-select | No | Skills/focus areas |
| Certifications | Multi-select | No | Professional certs |
| Languages | Multi-select | No | Spoken languages |

---

### 3. Pod Configuration (02-configure-pods.md)

**Current State:**
- Basic pod CRUD operations
- Member assignment

**Gaps:**
- Missing **Pod Types** configuration (Recruiting, Sales, HR, Mixed)
- No **Territory Assignment** for pods
- Missing **Pod Metrics/Targets** configuration
- No **Sprint Configuration** (target placements, sprint duration)
- Missing **Pod Hierarchy** (pods within regions)
- No **Pod Transfer** workflow (moving users between pods)
- Missing **Pod Performance Dashboard** specs
- No **Pod Templates** for quick setup

**Required New Sections:**

```markdown
## Pod Types Configuration

| Pod Type | Description | Default Metrics | Typical Size |
|----------|-------------|----------------|--------------|
| Recruiting | Technical recruiters | Placements, Submits | 5-8 |
| Bench Sales | Bench sales reps | Placements, Marketing | 3-5 |
| TA | Talent Acquisition | Leads, Campaigns | 4-6 |
| HR | HR Operations | Onboardings, Compliance | 2-4 |
| Mixed | Cross-functional | Configurable | 4-8 |
| Client Services | Account Management | Retention, Upsells | 3-5 |

## Sprint Configuration Screen

**Screen State:**
+----------------------------------------------------------+
| Pod Settings: Recruiting Alpha                    [Save]  |
+----------------------------------------------------------+
| SPRINT CONFIGURATION                                      |
|                                                          |
| Sprint Duration *                                         |
| [2 weeks                                             ▼]   |
| Options: 1 week, 2 weeks, 3 weeks, 4 weeks, Monthly      |
|                                                          |
| Sprint Targets                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ Metric              │ Target │ Stretch │ Weight    │  |
| ├────────────────────────────────────────────────────┤  |
| │ Placements          │ [2   ] │ [3    ] │ [50%   ] │  |
| │ Submissions         │ [20  ] │ [30   ] │ [30%   ] │  |
| │ Client Meetings     │ [5   ] │ [8    ] │ [10%   ] │  |
| │ New Candidates      │ [30  ] │ [50   ] │ [10%   ] │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| [+ Add Custom Metric]                                    |
|                                                          |
| Sprint Start Day: [Monday                            ▼]  |
|                                                          |
| Notifications                                            |
| ☑ Send sprint summary to pod members                    |
| ☑ Send mid-sprint progress check                        |
| ☑ Alert manager if target < 50% at midpoint             |
|                                                          |
+----------------------------------------------------------+
```

---

### 4. System Settings (03-system-settings.md)

**Current State:**
- High-level categories listed
- Missing actual configuration screens

**Gaps:**
- No **Organization Branding** (logo, colors, domain)
- Missing **Timezone/Locale** configuration
- No **Fiscal Year** settings
- Missing **Business Hours** configuration
- No **Holiday Calendar** management
- Missing **Default Values** configuration
- No **Email Signature** templates
- Missing **Document Templates** (offer letter, NDA)
- No **Field Customization** (custom fields per entity)
- Missing **Workflow Stage** definitions
- No **Status Configuration** (custom statuses per entity)

**Required New Sections:**

```markdown
## Organization Settings Screen

### Step 1: Navigate to Organization Settings

**User Action:** Click "Settings" → "Organization"

**System Response:**
- URL changes to: `/employee/admin/settings/org`
- Organization settings form loads

**Screen State:**
+----------------------------------------------------------+
| Organization Settings                            [Save]   |
+----------------------------------------------------------+
| BRANDING                                                  |
|                                                          |
| Company Name *                                            |
| [InTime Staffing Inc.                                 ]   |
|                                                          |
| Logo                                                      |
| ┌────────────────────────────────────────────────────┐  |
| │ [Current Logo]                                     │  |
| │                                                     │  |
| │ [Upload New Logo]  [Remove]                        │  |
| │                                                     │  |
| │ Requirements: PNG/SVG, Max 2MB, Min 200x50px       │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| Favicon                                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ [Current Favicon]  [Upload New]  [Remove]          │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| Primary Color                                             |
| [#2D5016      ] [■] Forest Green                         |
|                                                          |
| Secondary Color                                           |
| [#E07A5F      ] [■] Rust/Terracotta                      |
|                                                          |
| ─────────────────────────────────────────────────────── |
| REGIONAL SETTINGS                                         |
|                                                          |
| Default Timezone *                                        |
| [America/New_York (EST/EDT)                          ▼]  |
|                                                          |
| Default Locale *                                          |
| [English (United States)                             ▼]  |
|                                                          |
| Date Format                                               |
| [MM/DD/YYYY                                          ▼]  |
| Options: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD             |
|                                                          |
| Time Format                                               |
| [12-hour (1:30 PM)                                   ▼]  |
| Options: 12-hour (1:30 PM), 24-hour (13:30)             |
|                                                          |
| Currency                                                  |
| [USD - US Dollar                                     ▼]  |
|                                                          |
| ─────────────────────────────────────────────────────── |
| FISCAL YEAR                                               |
|                                                          |
| Fiscal Year Start *                                       |
| [January                                             ▼]  |
|                                                          |
| ─────────────────────────────────────────────────────── |
| BUSINESS HOURS                                            |
|                                                          |
| ☑ Monday    [9:00 AM] to [5:00 PM]                       |
| ☑ Tuesday   [9:00 AM] to [5:00 PM]                       |
| ☑ Wednesday [9:00 AM] to [5:00 PM]                       |
| ☑ Thursday  [9:00 AM] to [5:00 PM]                       |
| ☑ Friday    [9:00 AM] to [5:00 PM]                       |
| ☐ Saturday  [Closed ]                                    |
| ☐ Sunday    [Closed ]                                    |
|                                                          |
| [Manage Holiday Calendar]                                |
|                                                          |
+----------------------------------------------------------+

**Field Specifications:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Company Name | Text | Yes | 2-100 chars |
| Logo | Image | No | PNG/SVG, max 2MB |
| Favicon | Image | No | ICO/PNG, max 100KB, 32x32 or 64x64 |
| Primary Color | Color Picker | Yes | Valid hex color |
| Secondary Color | Color Picker | Yes | Valid hex color |
| Timezone | Select | Yes | Valid IANA timezone |
| Locale | Select | Yes | Supported locale |
| Date Format | Select | Yes | Predefined options |
| Time Format | Select | Yes | 12-hour or 24-hour |
| Currency | Select | Yes | ISO 4217 currency code |
| Fiscal Year Start | Select | Yes | Month (1-12) |
| Business Hours | Time Range | Per day | Start < End |
```

---

### 5. Data Management (04-data-management.md)

**Current State:**
- Basic import/export concepts
- Duplicate detection mentioned

**Gaps:**
- No **Import Wizard** step-by-step flow
- Missing **Field Mapping** UI specs
- No **Validation Results** screen
- Missing **Import History** with rollback
- No **Export Templates** configuration
- Missing **Data Reassignment** workflow (bulk ownership transfer)
- No **Data Archival** policies
- Missing **GDPR Data Request** workflow
- No **Data Purge** schedule configuration

**Required New Sections:**

```markdown
## Bulk Import Wizard

### Step 1: Select Entity Type

**Screen State:**
+----------------------------------------------------------+
| Data Import Wizard                               [× Close]|
+----------------------------------------------------------+
| Step 1 of 5: Select Entity Type                          |
|                                                          |
| What type of data are you importing?                     |
|                                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │ ● Users                                             │ |
| │   Import employee and user accounts                 │ |
| │                                                     │ |
| │ ○ Candidates                                        │ |
| │   Import candidate profiles with resumes            │ |
| │                                                     │ |
| │ ○ Accounts (Clients)                               │ |
| │   Import client companies                           │ |
| │                                                     │ |
| │ ○ Contacts                                          │ |
| │   Import client contacts                            │ |
| │                                                     │ |
| │ ○ Jobs                                              │ |
| │   Import job requisitions                           │ |
| │                                                     │ |
| │ ○ Custom Entity                                     │ |
| │   Import to custom entity type                      │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| [Download Template: Users.csv]                           |
|                                                          |
+----------------------------------------------------------+
|                                     [Cancel]  [Next →]   |
+----------------------------------------------------------+

### Step 2: Upload File

**Screen State:**
+----------------------------------------------------------+
| Data Import Wizard                               [× Close]|
+----------------------------------------------------------+
| Step 2 of 5: Upload File                                 |
|                                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │        ┌─────────────────────────────┐             │ |
| │        │                             │             │ |
| │        │   📄 Drag & Drop File       │             │ |
| │        │                             │             │ |
| │        │   or [Browse Files]         │             │ |
| │        │                             │             │ |
| │        └─────────────────────────────┘             │ |
| │                                                     │ |
| │  Supported formats: .csv, .xlsx                    │ |
| │  Maximum file size: 10 MB                          │ |
| │  Maximum rows: 5,000 records                       │ |
| │                                                     │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| File: employees_import.csv                               |
| Size: 1.2 MB                                             |
| Rows detected: 247                                       |
| Encoding: UTF-8 ✓                                        |
|                                                          |
+----------------------------------------------------------+
|                           [← Back]  [Cancel]  [Next →]   |
+----------------------------------------------------------+

### Step 3: Field Mapping

**Screen State:**
+----------------------------------------------------------+
| Data Import Wizard                               [× Close]|
+----------------------------------------------------------+
| Step 3 of 5: Map Fields                                  |
|                                                          |
| Match your CSV columns to system fields                  |
|                                                          |
| ┌──────────────────┬────────────────────┬──────────┐   |
| │ Your Column      │ Maps To            │ Status   │   |
| ├──────────────────┼────────────────────┼──────────┤   |
| │ first_name       │ [First Name    ▼]  │ ✓ Matched│   |
| │ last_name        │ [Last Name     ▼]  │ ✓ Matched│   |
| │ email_address    │ [Email         ▼]  │ ✓ Matched│   |
| │ phone            │ [Phone Number  ▼]  │ ✓ Matched│   |
| │ department       │ [Department    ▼]  │ ✓ Matched│   |
| │ manager_email    │ [Reports To    ▼]  │ ✓ Matched│   |
| │ title            │ [Job Title     ▼]  │ ✓ Matched│   |
| │ hire_date        │ [Start Date    ▼]  │ ✓ Matched│   |
| │ salary           │ [Annual Salary ▼]  │ ✓ Matched│   |
| │ custom_field_1   │ [-- Skip --    ▼]  │ ⚠ Skipped│   |
| │ employee_id      │ [Employee ID   ▼]  │ ✓ Matched│   |
| └──────────────────┴────────────────────┴──────────┘   |
|                                                          |
| Matched: 10 of 11 columns                                |
| Required fields: All matched ✓                           |
|                                                          |
| Advanced Options                                         |
| ☐ Skip first row (header row)                           |
| ☑ Update existing records (match by email)              |
| ☐ Create only (skip existing records)                   |
|                                                          |
+----------------------------------------------------------+
|                           [← Back]  [Cancel]  [Next →]   |
+----------------------------------------------------------+

### Step 4: Validation Results

**Screen State:**
+----------------------------------------------------------+
| Data Import Wizard                               [× Close]|
+----------------------------------------------------------+
| Step 4 of 5: Validation Results                          |
|                                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │ VALIDATION SUMMARY                                  │ |
| │                                                     │ |
| │ ✓ Ready to import: 243 records                     │ |
| │ ⚠ Warnings: 3 records (will import with defaults)  │ |
| │ ✗ Errors: 1 record (will skip)                     │ |
| │                                                     │ |
| │ Total: 247 records                                 │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| ERRORS (1)                                  [Fix in CSV] |
| ┌─────────────────────────────────────────────────────┐ |
| │ Row 45: Invalid email format "john.doe@"            │ |
| │         Action: [Skip] or [Edit: _____________ ]   │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| WARNINGS (3)                               [Show/Hide]   |
| ┌─────────────────────────────────────────────────────┐ |
| │ Row 12: Email exists - will update existing record  │ |
| │ Row 89: Department "Sales" not found - will create  │ |
| │ Row 156: Manager email not found - will leave blank │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| [Preview Import Results]                                 |
|                                                          |
+----------------------------------------------------------+
|                      [← Back]  [Cancel]  [Import 246 →]  |
+----------------------------------------------------------+

### Step 5: Import Complete

**Screen State:**
+----------------------------------------------------------+
| Data Import Wizard                               [× Close]|
+----------------------------------------------------------+
| Step 5 of 5: Import Complete                             |
|                                                          |
|                   ✓ Import Successful!                   |
|                                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │                                                     │ |
| │   📥 IMPORT RESULTS                                │ |
| │                                                     │ |
| │   ✓ Created: 180 new records                       │ |
| │   ✓ Updated: 63 existing records                   │ |
| │   ⚠ Skipped: 4 records (errors/duplicates)        │ |
| │                                                     │ |
| │   Import ID: IMP-2024-1234                         │ |
| │   Completed: Dec 3, 2024 at 2:45 PM                │ |
| │   Duration: 12 seconds                             │ |
| │                                                     │ |
| │   ⚠ Note: You can undo this import within 48 hrs  │ |
| │                                                     │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| [Download Import Report]  [View Import History]          |
|                                                          |
+----------------------------------------------------------+
|                                            [Done]        |
+----------------------------------------------------------+
```

---

### 6. NEW SPEC NEEDED: Workflow Configuration (09-workflow-configuration.md)

This is a **critical missing spec**. Enterprise ATS systems like CEIPAL and Bullhorn have robust workflow automation.

**Required Content:**

```markdown
# UC-ADMIN-009: Workflow Configuration

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-009 |
| Actor | Admin |
| Goal | Configure automated workflows, approval chains, and business rules |
| Frequency | Monthly (initial setup) + as needed |
| Estimated Time | 30 min - 2 hours per workflow |
| Priority | HIGH |

## Workflow Types

| Type | Description | Example |
|------|-------------|---------|
| Approval Chain | Multi-level approvals | Job approval: Recruiter → Manager → Director |
| Status Automation | Auto-update statuses | Candidate → Submitted when email sent |
| Notification Trigger | Send alerts on events | Email manager when placement made |
| SLA Escalation | Time-based escalation | Alert if submission pending > 48 hours |
| Field Automation | Auto-populate fields | Set priority based on job value |
| Assignment Rules | Auto-assign ownership | Round-robin new leads to team |

## Workflow Builder Screen

**Screen State:**
+----------------------------------------------------------+
| Workflow Builder: New Approval Workflow          [Save]   |
+----------------------------------------------------------+
| Workflow Name *                                           |
| [Job Approval - High Value                           ]    |
|                                                          |
| Trigger                                                   |
| When [Job            ▼] is [Created            ▼]        |
| AND  [Bill Rate      ▼] is [Greater than       ▼] [$100 ]|
|                                                          |
| [+ Add Condition]                                        |
|                                                          |
| ─────────────────────────────────────────────────────── |
| APPROVAL STEPS                                            |
|                                                          |
| Step 1: Pod Manager                                       |
| ┌─────────────────────────────────────────────────────┐ |
| │ Approver: [Job Owner's Manager            ▼]       │ |
| │ Timeout: [24 hours                        ▼]       │ |
| │ On Timeout: [Escalate to next step        ▼]       │ |
| │ [× Remove]                                          │ |
| └─────────────────────────────────────────────────────┘ |
|         ↓                                                |
| Step 2: Regional Director                                |
| ┌─────────────────────────────────────────────────────┐ |
| │ Approver: [Regional Director              ▼]       │ |
| │ Timeout: [24 hours                        ▼]       │ |
| │ On Timeout: [Auto-approve                 ▼]       │ |
| │ [× Remove]                                          │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| [+ Add Approval Step]                                    |
|                                                          |
| ─────────────────────────────────────────────────────── |
| ACTIONS ON APPROVAL                                       |
|                                                          |
| ☑ Set status to "Approved"                               |
| ☑ Send email notification to job owner                   |
| ☐ Create activity log entry                             |
| ☐ Trigger webhook                                        |
|                                                          |
| ACTIONS ON REJECTION                                      |
|                                                          |
| ☑ Set status to "Rejected"                               |
| ☑ Send email with rejection reason                       |
| ☐ Reassign to original owner                            |
|                                                          |
+----------------------------------------------------------+
| [Test Workflow]  [Cancel]  [Save as Draft]  [Activate]   |
+----------------------------------------------------------+

## Workflow Conditions

| Condition | Operators | Example |
|-----------|-----------|---------|
| Field Value | =, ≠, >, <, >=, <=, contains, starts with | Bill Rate > $100 |
| User Role | is, is not | Owner Role is Recruiter |
| Time-based | within, after, before | Created within Last 24 hours |
| Related Record | has, has no | Job has No Submissions |
| Custom Formula | JavaScript expression | billRate * hours > 10000 |

## Approval Status Tracking

**Field Specification: Approval Status**
| Status | Description | UI Display |
|--------|-------------|------------|
| pending | Awaiting first approval | 🟡 Pending Approval |
| in_review | Currently being reviewed | 🔵 In Review |
| approved | All approvers approved | 🟢 Approved |
| rejected | Any approver rejected | 🔴 Rejected |
| escalated | Timeout triggered escalation | 🟠 Escalated |
| cancelled | Workflow cancelled | ⚫ Cancelled |
```

---

### 7. NEW SPEC NEEDED: Email Template Management (10-email-templates.md)

**Required Content:**

```markdown
# UC-ADMIN-010: Email Template Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-010 |
| Actor | Admin |
| Goal | Configure system email templates and notification settings |
| Priority | HIGH |

## Email Template Categories

| Category | Templates | Trigger |
|----------|-----------|---------|
| User Notifications | Welcome, Password Reset, 2FA Setup | User events |
| Candidate Communications | Application Received, Interview Scheduled | Candidate events |
| Client Notifications | Submission Sent, Placement Confirmed | Client events |
| Internal Alerts | New Lead, Deal Closed, Approval Needed | Business events |
| System Alerts | Integration Error, Low Balance, Security Alert | System events |

## Template Editor Screen

**Screen State:**
+----------------------------------------------------------+
| Email Template Editor                            [Save]   |
+----------------------------------------------------------+
| Template: Welcome Email (New User)               [Active] |
+----------------------------------------------------------+
| TEMPLATE SETTINGS                                         |
|                                                          |
| Template Name *                                           |
| [Welcome Email - New User                            ]    |
|                                                          |
| Subject Line *                                            |
| [Welcome to {{company_name}}! 🎉                     ]    |
|                                                          |
| From Name                                                 |
| [{{company_name}} Team                               ]    |
|                                                          |
| Reply-To                                                  |
| [hr@{{company_domain}}                               ]    |
|                                                          |
| ─────────────────────────────────────────────────────── |
| EMAIL BODY                                                |
|                                                          |
| [Visual Editor] [HTML Editor] [Plain Text]               |
|                                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │ Hi {{first_name}},                                  │ |
| │                                                     │ |
| │ Welcome to {{company_name}}! We're thrilled to     │ |
| │ have you join our team as {{job_title}}.           │ |
| │                                                     │ |
| │ Here's what you need to know:                      │ |
| │                                                     │ |
| │ • Start Date: {{start_date}}                       │ |
| │ • Manager: {{manager_name}}                        │ |
| │ • Department: {{department}}                       │ |
| │                                                     │ |
| │ To get started, please:                            │ |
| │ 1. Set up your password: {{password_setup_link}}   │ |
| │ 2. Complete your profile                           │ |
| │ 3. Review the onboarding checklist                 │ |
| │                                                     │ |
| │ If you have any questions, reach out to your       │ |
| │ manager or HR at {{hr_email}}.                     │ |
| │                                                     │ |
| │ Best,                                               │ |
| │ {{company_name}} Team                              │ |
| │                                                     │ |
| │ [Company Logo]                                      │ |
| │ [Unsubscribe Footer]                               │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| ─────────────────────────────────────────────────────── |
| AVAILABLE VARIABLES                       [Insert ▼]    |
|                                                          |
| User: {{first_name}}, {{last_name}}, {{email}}           |
| Company: {{company_name}}, {{company_domain}}, {{logo}}  |
| Employment: {{job_title}}, {{department}}, {{start_date}}|
| Manager: {{manager_name}}, {{manager_email}}             |
| Links: {{password_setup_link}}, {{login_link}}           |
|                                                          |
+----------------------------------------------------------+
| [Preview] [Send Test]  [Cancel]  [Save Draft]  [Publish] |
+----------------------------------------------------------+

## Variable Reference

| Variable | Description | Example Output |
|----------|-------------|----------------|
| {{first_name}} | User's first name | Sarah |
| {{last_name}} | User's last name | Chen |
| {{email}} | User's email | sarah@company.com |
| {{company_name}} | Organization name | InTime Staffing |
| {{company_domain}} | Company domain | intime.com |
| {{job_title}} | User's position | Senior Recruiter |
| {{department}} | User's department | Recruiting |
| {{start_date}} | Formatted start date | Monday, December 18, 2024 |
| {{manager_name}} | Manager's full name | Mike Rodriguez |
| {{password_setup_link}} | Password setup URL | https://app.intime.com/... |
| {{logo}} | Company logo HTML | <img src="..." /> |
```

---

### 8. NEW SPEC NEEDED: SLA Configuration (12-sla-configuration.md)

**Required Content:**

```markdown
# UC-ADMIN-012: SLA Configuration

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-012 |
| Actor | Admin |
| Goal | Configure Service Level Agreements, escalation rules, and time-based alerts |
| Priority | MEDIUM |

## SLA Categories

| Category | Metrics | Typical Targets |
|----------|---------|-----------------|
| Response Time | Time to first response | 4 hours |
| Submission Speed | Time from job to first submit | 48 hours |
| Interview Scheduling | Time to schedule interview | 24 hours |
| Offer Response | Time to respond to candidate | 24 hours |
| Onboarding Completion | Time to complete I-9 | 3 days |
| Client Communication | Time between touchpoints | 7 days |

## SLA Rule Builder

**Screen State:**
+----------------------------------------------------------+
| SLA Rule: Submission Response Time              [Save]    |
+----------------------------------------------------------+
| RULE DEFINITION                                           |
|                                                          |
| Rule Name *                                               |
| [First Submission within 48 Hours                    ]    |
|                                                          |
| Description                                               |
| [Submit first candidate within 48 business hours     ]    |
|                                                          |
| Applies To                                                |
| Entity: [Jobs                                        ▼]  |
| Status: [Active                                      ▼]  |
|                                                          |
| ─────────────────────────────────────────────────────── |
| TIME CALCULATION                                          |
|                                                          |
| Start Time: [Job Created                             ▼]  |
| End Time: [First Submission Created                  ▼]  |
|                                                          |
| Target Duration                                           |
| [48    ] [Business Hours                             ▼]  |
| Options: Minutes, Hours, Business Hours, Days, Business Days
|                                                          |
| Business Hours: [9:00 AM] to [5:00 PM]                   |
| Exclude Weekends: ☑                                      |
| Exclude Holidays: ☑                                      |
|                                                          |
| ─────────────────────────────────────────────────────── |
| ESCALATION LEVELS                                         |
|                                                          |
| Level 1: Warning (75% of target)                         |
| ┌─────────────────────────────────────────────────────┐ |
| │ At [36    ] hours:                                  │ |
| │ ☑ Send email to: [Job Owner                   ▼]   │ |
| │ ☑ Show warning badge on job                        │ |
| │ ☐ Send Slack notification                          │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| Level 2: Breach (100% of target)                         |
| ┌─────────────────────────────────────────────────────┐ |
| │ At [48    ] hours:                                  │ |
| │ ☑ Send email to: [Job Owner + Manager         ▼]   │ |
| │ ☑ Show breach badge on job (red)                   │ |
| │ ☑ Add to SLA Breach report                         │ |
| │ ☐ Escalate to: [Pod Manager                   ▼]   │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| Level 3: Critical (150% of target)                       |
| ┌─────────────────────────────────────────────────────┐ |
| │ At [72    ] hours:                                  │ |
| │ ☑ Send email to: [Regional Director           ▼]   │ |
| │ ☑ Add to Executive Dashboard                       │ |
| │ ☑ Require resolution notes                         │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
+----------------------------------------------------------+
| [Test Rule]  [Cancel]  [Save as Draft]  [Activate]       |
+----------------------------------------------------------+
```

---

### 9. NEW SPEC NEEDED: Activity Pattern Configuration (13-activity-patterns.md)

**Required Content:**

```markdown
# UC-ADMIN-013: Activity Pattern Configuration

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-013 |
| Actor | Admin |
| Goal | Configure activity types, required fields, and logging patterns |
| Priority | MEDIUM |

## Activity Types

| Type | Category | Required Fields | Auto-log |
|------|----------|-----------------|----------|
| Call - Outbound | Communication | Contact, Duration, Notes | No |
| Call - Inbound | Communication | Contact, Duration, Notes | No |
| Email Sent | Communication | Contact, Subject | Yes |
| Email Received | Communication | Contact, Subject | Yes |
| Meeting - Scheduled | Calendar | Contact, Date/Time, Type | Yes |
| Meeting - Completed | Calendar | Contact, Notes, Outcome | No |
| LinkedIn Message | Communication | Contact, Message | Manual |
| Text/SMS | Communication | Contact, Message | Yes |
| Submission Sent | Workflow | Candidate, Job, Client | Yes |
| Interview Scheduled | Workflow | Candidate, Date/Time | Yes |
| Offer Extended | Workflow | Candidate, Terms | Yes |
| Note Added | Documentation | Entity, Note | Manual |
| Task Created | Workflow | Title, Due Date | Yes |
| Task Completed | Workflow | Task, Notes | Manual |

## Activity Pattern Editor

**Screen State:**
+----------------------------------------------------------+
| Activity Pattern: Outbound Call                  [Save]   |
+----------------------------------------------------------+
| PATTERN DEFINITION                                        |
|                                                          |
| Activity Type *                                           |
| [Call - Outbound                                     ▼]  |
|                                                          |
| Display Name                                              |
| [Outbound Call                                       ]    |
|                                                          |
| Icon                                                      |
| [📞 Phone                                            ▼]  |
|                                                          |
| Color                                                     |
| [Blue                                                ▼]  |
|                                                          |
| ─────────────────────────────────────────────────────── |
| REQUIRED FIELDS                                           |
|                                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │ ☑ Contact/Entity                                   │ |
| │ ☑ Duration (minutes)                               │ |
| │ ☑ Outcome (Connected, Voicemail, No Answer)        │ |
| │ ☐ Notes (optional)                                 │ |
| │ ☐ Follow-up Date (optional)                        │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| [+ Add Custom Field]                                     |
|                                                          |
| ─────────────────────────────────────────────────────── |
| OUTCOME OPTIONS                                           |
|                                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Label              │ Value       │ Next Action    │  |
| ├────────────────────────────────────────────────────┤  |
| │ Connected          │ connected   │ Log notes      │  |
| │ Left Voicemail     │ voicemail   │ Schedule f/u   │  |
| │ No Answer          │ no_answer   │ Schedule retry │  |
| │ Wrong Number       │ wrong_num   │ Update contact │  |
| │ Disconnected       │ disconn     │ Update status  │  |
| └────────────────────────────────────────────────────┘  |
|                                                          |
| [+ Add Outcome]                                          |
|                                                          |
| ─────────────────────────────────────────────────────── |
| AUTOMATION                                                |
|                                                          |
| ☑ Auto-create follow-up task if outcome = voicemail     |
|   Follow-up delay: [24    ] hours                        |
|                                                          |
| ☐ Auto-log from phone integration (RingCentral)          |
|                                                          |
| ☑ Count towards daily activity target                    |
|   Points: [1    ]                                        |
|                                                          |
+----------------------------------------------------------+
```

---

### 10. NEW SPEC NEEDED: Feature Flag Management (14-feature-flags.md)

**Required Content:**

```markdown
# UC-ADMIN-014: Feature Flag Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-014 |
| Actor | Admin |
| Goal | Enable/disable features, manage beta rollouts, A/B testing |
| Priority | MEDIUM |

## Feature Flag List Screen

**Screen State:**
+----------------------------------------------------------+
| Feature Flags                            [+ New Feature]  |
+----------------------------------------------------------+
| [Search features...]                    [Status ▼]        |
+----------------------------------------------------------+
|                                                          |
| ACTIVE FEATURES                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │ AI Twin System                                      │ |
| │ ──────────────────────────────────────────────────│ |
| │ Status: 🟢 Enabled for 4 roles                     │ |
| │ Enabled: Recruiter, Bench Sales, TA, Pod Manager   │ |
| │ Disabled: Client Portal, Admin                     │ |
| │ [Configure]  [Disable All]                         │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| ┌─────────────────────────────────────────────────────┐ |
| │ Advanced Analytics Dashboard                        │ |
| │ ──────────────────────────────────────────────────│ |
| │ Status: 🟢 Enabled for Management+                 │ |
| │ Enabled: Pod Manager, Director, COO, CEO, CFO      │ |
| │ Disabled: Recruiter, TA, Bench Sales               │ |
| │ [Configure]  [Enable All]                          │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| BETA FEATURES                                             |
| ┌─────────────────────────────────────────────────────┐ |
| │ Bulk Email Campaigns                                │ |
| │ ──────────────────────────────────────────────────│ |
| │ Status: 🟡 Beta (Limited Rollout)                  │ |
| │ Enabled: 5 users (beta testers)                    │ |
| │ Rollout: 10% of users                              │ |
| │ [Configure]  [Expand Rollout]  [End Beta]          │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
| DISABLED FEATURES                                         |
| ┌─────────────────────────────────────────────────────┐ |
| │ Video Interview Integration                         │ |
| │ ──────────────────────────────────────────────────│ |
| │ Status: 🔴 Disabled (Coming Soon)                  │ |
| │ Expected Release: Q1 2025                          │ |
| │ [Configure]  [Preview in Dev]                      │ |
| └─────────────────────────────────────────────────────┘ |
|                                                          |
+----------------------------------------------------------+

## Feature Flag Configuration

**Screen State:**
+----------------------------------------------------------+
| Configure Feature: AI Twin System                [Save]   |
+----------------------------------------------------------+
| FEATURE DETAILS                                           |
|                                                          |
| Feature Name *                                            |
| [AI Twin System                                      ]    |
|                                                          |
| Feature Key (immutable)                                   |
| [ai_twin_system                                      ]    |
|                                                          |
| Description                                               |
| [AI-powered assistant for recruiters and sales      ]    |
|                                                          |
| ─────────────────────────────────────────────────────── |
| ROLLOUT STRATEGY                                          |
|                                                          |
| ● Enable for specific roles                              |
| ○ Enable for specific users                              |
| ○ Percentage rollout                                     |
| ○ Enable for all                                         |
| ○ Disable for all                                        |
|                                                          |
| ─────────────────────────────────────────────────────── |
| ENABLED ROLES                                             |
|                                                          |
| ☑ Technical Recruiter                                    |
| ☑ Bench Sales Recruiter                                  |
| ☑ TA Specialist                                          |
| ☑ Pod Manager                                            |
| ☐ Regional Director                                      |
| ☐ HR Manager                                             |
| ☐ Finance                                                |
| ☐ COO                                                    |
| ☐ CEO                                                    |
| ☐ Admin                                                  |
| ☐ Client Portal User                                     |
|                                                          |
| ─────────────────────────────────────────────────────── |
| ADDITIONAL SETTINGS                                       |
|                                                          |
| ☑ Show feature in navigation                             |
| ☐ Show "New" badge                                       |
| ☐ Log feature usage for analytics                        |
| ☐ Show feedback prompt after first use                   |
|                                                          |
+----------------------------------------------------------+
```

---

## UI Design System Alignment

All admin specs must align with the documented UI design system:

### Color Usage

| Context | Color | Token |
|---------|-------|-------|
| Primary Actions | Forest Green | `--mantine-color-brand-6` (#2D5016) |
| Destructive Actions | Rust Red | `--mantine-color-rust-6` (#E07A5F) |
| Warning States | Goldenrod | `--mantine-color-gold-6` (#FFD700) |
| Info/Links | Ocean Blue | `--mantine-color-ocean-6` (#1E3A5F) |
| Success | Green | `--mantine-color-green-6` |
| Error | Red | `--mantine-color-red-6` |
| Neutral | Gray | `--mantine-color-gray-*` |

### Component Patterns

| Pattern | Mantine Component | Usage |
|---------|-------------------|-------|
| Primary Button | `<Button variant="filled">` | Save, Submit, Confirm |
| Secondary Button | `<Button variant="outline">` | Cancel, Back |
| Danger Button | `<Button variant="filled" color="red">` | Delete, Deactivate |
| Form Input | `<TextInput>` with labels | All text fields |
| Select | `<Select>` with searchable | Dropdowns |
| Table | `<Table.ScrollContainer>` | Data lists |
| Modal | `<Modal centered>` | Dialogs, wizards |
| Notification | `<Notifications>` | Toast messages |
| Tabs | `<Tabs>` | Section navigation |
| Progress | `<Stepper>` | Wizard steps |

### Layout Requirements

- **AppShell**: Sidebar (260px) + Main content
- **Page Header**: Title (h1), subtitle (text-gray-600), actions (right-aligned)
- **Section Cards**: `<Paper p="md" withBorder>` with section headers
- **Form Layout**: 2-column grid for wide screens, stack for mobile
- **Table Actions**: Row-level actions in last column, bulk actions above table
- **Modal Width**: sm (320px), md (440px), lg (620px), xl (780px)

---

## Test Case Requirements

Every admin spec should include test cases following this format:

```markdown
## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-USR-001 | Create user with valid data | Admin logged in | 1. Click + User 2. Fill form 3. Submit | User created, email sent |
| ADMIN-USR-002 | Create user - email exists | User exists | 1. Click + User 2. Enter existing email | Error: "Email already registered" |
| ADMIN-USR-003 | Create user - missing required | Admin logged in | 1. Click + User 2. Leave email blank 3. Submit | Error: "Email is required" |
| ADMIN-USR-004 | Bulk import - happy path | CSV with 10 users | 1. Upload CSV 2. Map fields 3. Import | 10 users created |
| ADMIN-USR-005 | Bulk import - duplicate email | CSV with dupe | 1. Upload CSV 2. Validate | Warning: Row 5 has duplicate |
| ADMIN-USR-006 | Deactivate user - immediate | Active user exists | 1. Open user 2. Click Deactivate 3. Confirm | User deactivated, sessions revoked |
| ADMIN-USR-007 | Deactivate user - with RACI | User owns 10 jobs | 1. Open user 2. Deactivate 3. Transfer ownership | Jobs transferred, user deactivated |
| ADMIN-USR-008 | Reset password | User locked out | 1. Open user 2. Reset Password 3. Send link | Reset email sent |
| ADMIN-USR-009 | Change role - Manager to Recruiter | Manager exists | 1. Open user 2. Change role 3. Save | Role changed, permissions updated |
| ADMIN-USR-010 | Admin cannot delete self | Admin viewing own profile | 1. Open own profile 2. Try delete | Delete button disabled |
```

---

## Database Schema References

Each admin spec should include relevant schema:

```sql
-- User Management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'locked')),
  role_id UUID REFERENCES roles(id),
  pod_id UUID REFERENCES pods(id),
  manager_id UUID REFERENCES users(id),
  hire_date DATE,
  timezone TEXT DEFAULT 'America/New_York',
  locale TEXT DEFAULT 'en-US',
  last_login_at TIMESTAMPTZ,
  failed_login_count INTEGER DEFAULT 0,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  enabled_roles TEXT[],
  enabled_users UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, key)
);
```

---

## Summary of Required Changes

### Existing Specs - Updates Needed

| Spec | Priority | Updates Required |
|------|----------|------------------|
| 00-OVERVIEW.md | HIGH | Add dashboard wireframe, navigation spec, metrics |
| 01-manage-users.md | LOW | Merge with 05 or remove duplicate |
| 02-configure-pods.md | MEDIUM | Add sprint config, pod types, territory |
| 03-system-settings.md | HIGH | Add org settings, branding, locale, business hours |
| 04-data-management.md | HIGH | Add import wizard, field mapping, rollback |
| 05-user-management.md | MEDIUM | Add click-by-click flow, test cases, keyboard shortcuts |
| 06-permission-management.md | LOW | Add test cases, keyboard shortcuts |
| 07-integration-management.md | LOW | Add test cases, webhook debugging |
| 08-audit-logs.md | LOW | Add test cases, export specs |
| 11-emergency-procedures.md | LOW | Complete (96%) |

### New Specs - Must Create

| Spec | Priority | Estimated Lines |
|------|----------|-----------------|
| 09-workflow-configuration.md | HIGH | 600+ |
| 10-email-templates.md | HIGH | 400+ |
| 12-sla-configuration.md | MEDIUM | 400+ |
| 13-activity-patterns.md | MEDIUM | 350+ |
| 14-feature-flags.md | MEDIUM | 300+ |
| 15-organization-settings.md | HIGH | 450+ |

### Format Upgrades for All Specs

Every spec must include:
1. ✅ Overview table with Use Case ID, Actor, Goal, Frequency, Time, Priority
2. ✅ Preconditions list
3. ✅ Trigger events
4. ✅ Click-by-click main flow with step numbers
5. ✅ ASCII wireframes for each screen state
6. ✅ Field specifications table (type, validation, errors)
7. ✅ Backend processing steps (SQL/TypeScript)
8. ✅ Postconditions list
9. ✅ Alternative flows
10. ✅ Error scenarios table
11. ✅ Keyboard shortcuts
12. ✅ Test cases table
13. ✅ Database schema reference
14. ✅ Related use cases links
15. ✅ Change log

---

## Related Research

- Enterprise ATS patterns: CEIPAL, Bullhorn, Lever, Greenhouse
- UI Design System: `/Users/sumanthrajkumarnagolu/Projects/intime-v3/.claude/rules/ui-design-system.md`
- Recruiter spec example: `/docs/specs/20-USER-ROLES/01-recruiter/06-make-placement.md`
- HR spec example: `/docs/specs/20-USER-ROLES/05-hr/02-employee-onboarding.md`

---

## Open Questions

1. Should admin specs include **mobile/responsive** variants?
2. What **permission levels** exist within Admin role (Super Admin vs Admin)?
3. Should **multi-tenancy** settings be in admin or separate platform admin?
4. Are there **white-label** requirements for client branding?
5. What **API rate limits** should be configurable by admin?
6. Should **audit log retention** policies be configurable?
