# UC-ADMIN-005: User Management

**Version:** 2.0
**Last Updated:** 2025-12-04
**Role:** Admin
**Status:** Approved

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-005 |
| Actor | Admin |
| Goal | Manage complete user lifecycle including creation, role assignment, profile updates, deactivation, and bulk operations |
| Frequency | Daily (user lookups), Weekly (new user creation), As needed (terminations) |
| Estimated Time | 2-5 min (create user), 30 sec (lookup), 2 min (deactivate) |
| Priority | HIGH |

This use case covers complete user lifecycle management in InTime OS, including user creation, role assignment, profile updates, deactivation, and bulk operations. Admin has god-mode access to create, modify, and delete users across the entire organization.

**Critical Focus:** User management is the foundation of system security and access control. Errors can create security vulnerabilities or block legitimate users.

---

## 2. Actors

- **Primary:** Admin
- **Secondary:** HR Manager (user creation for employees), IT Support
- **System:** HRIS Integration, Auth System, Directory Service, Audit Logger
- **External:** SSO Provider (if applicable), Active Directory

---

## 3. Preconditions

1. Admin logged in with full permissions
2. HRIS integration active (for employee sync)
3. Role definitions configured
4. Email system operational

---

## 4. Trigger

- New employee hired (create user)
- Employee role change (update permissions)
- Employee terminated (deactivate user)
- Password reset request
- Bulk user import
- Security incident (emergency lockout)

---

## 5. Main Flow: User Management Dashboard

### Step 1: Navigate to User Management

**User Action:** Click "Admin" → "Users" in sidebar

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ User Management                          [+ Create User]       │
├────────────────────────────────────────────────────────────────┤
│ [Search users...] [Filter ▼] [Role ▼] [Status ▼] [Export]     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ USERS OVERVIEW                                                  │
│ ┌────────────┬────────────┬────────────┬────────────┐          │
│ │ Total Users│ Active     │ Inactive   │ Locked     │          │
│ │ 247        │ 245 (99%)  │ 2 (1%)     │ 0          │          │
│ └────────────┴────────────┴────────────┴────────────┘          │
│                                                                 │
│ USERS BY ROLE                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Technical Recruiter:    89                                 │ │
│ │ Bench Sales Recruiter:  67                                 │ │
│ │ TA Specialist:          45                                 │ │
│ │ Pod Manager:            24                                 │ │
│ │ Regional Director:       4                                 │ │
│ │ HR Manager:              3                                 │ │
│ │ Finance:                 5                                 │ │
│ │ COO:                     1                                 │ │
│ │ CEO:                     1                                 │ │
│ │ Admin:                   2                                 │ │
│ │ Client Portal User:      6 (external)                      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ALL USERS                                                       │
│ ┌──────┬─────────────┬───────────┬─────────────┬────────────┐ │
│ │ ID   │ Name        │ Email     │ Role        │ Status     │ │
│ ├──────┼─────────────┼───────────┼─────────────┼────────────┤ │
│ │ 1001 │ John Smith  │ john@...  │ CEO         │ Active ✓   │ │
│ │ 1002 │ Lisa Chen   │ lisa@...  │ COO         │ Active ✓   │ │
│ │ 1003 │ Sarah Patel │ sarah@... │ Tech Rec    │ Active ✓   │ │
│ │ 1004 │ Mike Jones  │ mike@...  │ Pod Mgr     │ Active ✓   │ │
│ │ 1005 │ Amy Davis   │ amy@...   │ TA Spec     │ Inactive ⏸│ │
│ │ ...  │ ...         │ ...       │ ...         │ ...        │ │
│ │                                                   [···]     │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Bulk Actions ▼] [Import Users] [Sync with HRIS] [Audit Log]  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 2: Create New User

**User Action:** Click "+ Create User"

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Create New User                                          [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ BASIC INFORMATION                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ First Name: *                                              │ │
│ │ [________________________]                                 │ │
│ │                                                             │ │
│ │ Last Name: *                                               │ │
│ │ [________________________]                                 │ │
│ │                                                             │ │
│ │ Email: * (will be used for login)                          │ │
│ │ [________________________@intime.com]                      │ │
│ │                                                             │ │
│ │ Employee ID: (optional, auto-generated if empty)           │ │
│ │ [________________________]                                 │ │
│ │                                                             │ │
│ │ Phone:                                                      │ │
│ │ [________________________]                                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ROLE & PERMISSIONS                                              │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Primary Role: *                                             │ │
│ │ [Select role...                                         ▼] │ │
│ │ Options:                                                    │ │
│ │ • Technical Recruiter                                      │ │
│ │ • Bench Sales Recruiter                                    │ │
│ │ • TA Specialist                                            │ │
│ │ • Pod Manager                                              │ │
│ │ • Regional Director                                        │ │
│ │ • HR Manager                                               │ │
│ │ • Finance                                                  │ │
│ │ • COO                                                      │ │
│ │ • CEO                                                      │ │
│ │ • Admin                                                    │ │
│ │ • Client Portal User (external)                            │ │
│ │                                                             │ │
│ │ Pod Assignment: (if applicable)                            │ │
│ │ [Select pod...                                          ▼] │ │
│ │                                                             │ │
│ │ Data Scope:                                                 │ │
│ │ ○ Own (can only see own data)                              │ │
│ │ ○ Team (can see team/pod data)                             │ │
│ │ ○ Region (can see regional data)                           │ │
│ │ ● Organization (can see all data) ← Typical for Admin      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ACCOUNT SETTINGS                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Account Status:                                             │ │
│ │ ● Active (user can log in immediately)                     │ │
│ │ ○ Inactive (account created but disabled)                  │ │
│ │                                                             │ │
│ │ Start Date: (when employment begins)                       │ │
│ │ [Today                                             ] [📅]  │ │
│ │                                                             │ │
│ │ Password Setup:                                             │ │
│ │ ● Send welcome email (user sets password via link)         │ │
│ │ ○ Set temporary password manually                          │ │
│ │   [________________________]                               │ │
│ │   ☑ Require password change on first login                 │ │
│ │                                                             │ │
│ │ Two-Factor Authentication:                                  │ │
│ │ ☐ Require 2FA (recommended for Admin, Finance, HR)         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ADDITIONAL SETTINGS                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Location:                                                   │ │
│ │ [New York, NY                                           ▼] │ │
│ │                                                             │ │
│ │ Timezone:                                                   │ │
│ │ [America/New_York (EST/EDT)                             ▼] │ │
│ │                                                             │ │
│ │ Manager: (reports to)                                       │ │
│ │ [Search for manager...                                  ▼] │ │
│ │                                                             │ │
│ │ Department:                                                 │ │
│ │ [Sales/Recruiting                                       ▼] │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ INTEGRATION SYNC                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ☑ Sync with HRIS (create employee record)                  │ │
│ │ ☑ Sync with Payroll (for salary/benefits)                  │ │
│ │ ☑ Sync with Email (create email account)                   │ │
│ │ ☐ Sync with Active Directory (if using AD/LDAP)            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ [Cancel]                          [Create User & Send Invite]  │
└────────────────────────────────────────────────────────────────┘
```

**System Actions on Create:**
1. Validate email is unique (not already in use)
2. Generate user ID (if not provided)
3. Create user record in database
4. Assign role and permissions
5. Create HRIS employee record (if synced)
6. Send welcome email with password setup link
7. Log user creation in audit trail
8. Notify manager (if assigned)

---

### Step 3: View/Edit User Profile

**User Action:** Click on user row (e.g., "Sarah Patel")

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ User Profile - Sarah Patel                    [Edit] [Delete]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ BASIC INFORMATION                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Name:            Sarah Patel                               │ │
│ │ Employee ID:     EMP-2024-1089                             │ │
│ │ Email:           sarah.patel@intime.com                    │ │
│ │ Phone:           (555) 123-4567                            │ │
│ │ Location:        New York, NY                              │ │
│ │ Timezone:        America/New_York (EST/EDT)                │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ROLE & PERMISSIONS                                              │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Primary Role:    Technical Recruiter                       │ │
│ │ Pod Assignment:  Recruiting Pod Alpha                      │ │
│ │ Manager:         Mike Jones (Pod Manager)                  │ │
│ │ Data Scope:      Team (can see pod data)                   │ │
│ │ Department:      Sales/Recruiting                          │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ACCOUNT STATUS                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Status:          🟢 Active                                  │ │
│ │ Created:         Nov 15, 2023                              │ │
│ │ Start Date:      Nov 20, 2023                              │ │
│ │ Last Login:      Dec 3, 2024 at 9:42 AM                    │ │
│ │ Login Count:     347 logins (since creation)               │ │
│ │ Failed Logins:   0 (last 30 days)                          │ │
│ │ 2FA Enabled:     Yes ✓                                     │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ PERMISSIONS SUMMARY                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Jobs:            Create, Read, Update (own + RACI)         │ │
│ │ Candidates:      Create, Read, Update (own + RACI)         │ │
│ │ Submissions:     Create, Read, Update (own + RACI)         │ │
│ │ Accounts:        Read (own + RACI)                         │ │
│ │ Users:           Read (team only)                          │ │
│ │ Reports:         View (team level)                         │ │
│ │ Admin:           None                                      │ │
│ │                                                             │ │
│ │ [View Full Permission Matrix]                              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RECENT ACTIVITY                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Dec 3, 2024 9:42 AM  - Logged in                           │ │
│ │ Dec 3, 2024 9:45 AM  - Created job "Senior Java Developer" │ │
│ │ Dec 3, 2024 10:12 AM - Added candidate "John Doe"          │ │
│ │ Dec 3, 2024 10:30 AM - Submitted candidate to job          │ │
│ │ [View Full Activity Log]                                    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ACTIONS                                                         │
│ [Reset Password] [Deactivate User] [Change Role]               │
│ [Unlock Account] [Resend Invite] [View Audit Log]              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Step 4: Deactivate User (Termination)

**User Action:** Click "Deactivate User"

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Deactivate User - Sarah Patel                            [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚠️ WARNING: This will immediately revoke all access            │
│                                                                 │
│ DEACTIVATION DETAILS                                            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Reason for Deactivation: *                                  │ │
│ │ ○ Termination - Voluntary (resignation)                    │ │
│ │ ○ Termination - Involuntary (performance/misconduct)       │ │
│ │ ○ Leave of Absence (temporary deactivation)                │ │
│ │ ○ Duplicate Account                                        │ │
│ │ ○ Security Incident                                        │ │
│ │ ○ Other                                                    │ │
│ │                                                             │ │
│ │ Effective Date:                                             │ │
│ │ ● Immediately                                               │ │
│ │ ○ Scheduled (select date): [____________] [📅]             │ │
│ │                                                             │ │
│ │ Notes: (optional, internal only)                            │ │
│ │ [                                                         ] │ │
│ │ [                                                         ] │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ WHAT WILL HAPPEN:                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ✓ User will be logged out immediately                      │ │
│ │ ✓ All active sessions terminated                           │ │
│ │ ✓ Login disabled (401 Unauthorized on next attempt)        │ │
│ │ ✓ API tokens revoked                                       │ │
│ │ ✓ Email forwarding set up (if configured)                  │ │
│ │ ✓ Manager notified                                         │ │
│ │ ✓ User data remains in system (read-only, for audit)       │ │
│ │ ✓ Audit log entry created                                  │ │
│ │                                                             │ │
│ │ OPTIONAL ACTIONS:                                           │ │
│ │ ☑ Reassign open tasks to manager                           │ │
│ │ ☑ Notify team members                                      │ │
│ │ ☐ Delete user data (GDPR right to erasure - permanent!)    │ │
│ │   ⚠️ Only use for GDPR requests, not regular terminations │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ DATA OWNERSHIP (RACI Transfer)                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Transfer all assignments (Jobs, Candidates, etc.) to:       │ │
│ │ [Select new owner...                                    ▼] │ │
│ │                                                             │ │
│ │ • 12 Jobs (Primary Owner)                                  │ │
│ │ • 47 Candidates (Primary Owner)                            │ │
│ │ • 23 Submissions (Primary Owner)                           │ │
│ │ • 5 Accounts (Secondary Owner)                             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ [Cancel]                                  [Deactivate User]    │
└────────────────────────────────────────────────────────────────┘
```

**System Actions on Deactivate:**
1. Set user status to "Inactive"
2. Terminate all active sessions (logout)
3. Revoke all API tokens
4. Disable login (return 401 Unauthorized)
5. Transfer RACI assignments to new owner
6. Notify manager and team
7. Log deactivation in audit trail
8. Optionally: Delete user data (GDPR request only)

---

## 6. Bulk Operations

### Bulk User Import

**Use Case:** Import multiple users from CSV/Excel

**Workflow:**
```
┌────────────────────────────────────────────────────────────────┐
│ Bulk User Import                                         [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STEP 1: Download Template                                      │
│ [Download CSV Template] [Download Excel Template]              │
│                                                                 │
│ STEP 2: Upload File                                            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Drag and drop file here, or [Browse]                       │ │
│ │                                                             │ │
│ │ Supported formats: CSV, XLSX                               │ │
│ │ Max file size: 10 MB                                       │ │
│ │ Max rows: 1,000 users                                      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ STEP 3: Preview & Validate                                     │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ users_import.csv - 47 rows                                 │ │
│ │                                                             │ │
│ │ ✓ Validated: 45 users ready to import                      │ │
│ │ ⚠️ Warnings: 2 users have issues                           │ │
│ │                                                             │ │
│ │ Issues:                                                     │ │
│ │ • Row 12: Email already exists (sarah.patel@intime.com)    │ │
│ │   Action: [Skip] [Update existing user]                    │ │
│ │ • Row 23: Invalid role "Recruiter Manager" (not found)     │ │
│ │   Action: [Skip] [Change to "Pod Manager"]                 │ │
│ │                                                             │ │
│ │ [Preview Data Table]                                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ STEP 4: Import Settings                                        │
│ ☑ Send welcome emails to all new users                        │
│ ☑ Sync with HRIS                                               │
│ ☐ Set all users to Inactive (manual activation required)      │
│                                                                 │
│ [Cancel]                           [Import 45 Users]           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Bulk Role Update

**Use Case:** Change role for multiple users at once

**Workflow:**
```
1. Select users (checkboxes in user table)
2. Click "Bulk Actions" → "Change Role"
3. Select new role from dropdown
4. Confirm change
5. System updates all selected users
6. Audit log entry for each change
```

---

## 7. Password Management

### Reset Password (Admin-initiated)

```
┌────────────────────────────────────────────────────────────────┐
│ Reset Password - Sarah Patel                             [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ METHOD 1: Send Password Reset Link (Recommended)               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ● Send email with password reset link                      │ │
│ │   User will receive email and can set their own password   │ │
│ │   Link expires in 24 hours                                 │ │
│ │                                                             │ │
│ │   [Send Reset Link to sarah.patel@intime.com]              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ METHOD 2: Set Temporary Password (Use with caution)            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ○ Set temporary password manually                          │ │
│ │                                                             │ │
│ │   New Password:                                             │ │
│ │   [________________________]  [Generate Random]            │ │
│ │                                                             │ │
│ │   ☑ Require password change on next login                  │ │
│ │   ☑ Send temporary password via email                      │ │
│ │                                                             │ │
│ │   ⚠️ WARNING: Admin will see the password                  │ │
│ │   Recommended: Use Method 1 instead                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Cancel]                                     [Reset Password]  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Account Security

### Unlock Account (After Failed Logins)

**Trigger:** User locked out after 5 failed login attempts

**Workflow:**
```
┌────────────────────────────────────────────────────────────────┐
│ Unlock Account - Sarah Patel                             [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ACCOUNT LOCKED                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Locked: Dec 3, 2024 at 2:15 PM                             │ │
│ │ Reason: 5 failed login attempts                            │ │
│ │                                                             │ │
│ │ Failed Login Attempts:                                      │ │
│ │ • 2:10 PM - Failed (wrong password) - IP: 203.0.113.42     │ │
│ │ • 2:11 PM - Failed (wrong password) - IP: 203.0.113.42     │ │
│ │ • 2:12 PM - Failed (wrong password) - IP: 203.0.113.42     │ │
│ │ • 2:13 PM - Failed (wrong password) - IP: 203.0.113.42     │ │
│ │ • 2:15 PM - Failed (wrong password) - IP: 203.0.113.42     │ │
│ │ → Account locked automatically                             │ │
│ │                                                             │ │
│ │ ⚠️ SECURITY CHECK:                                          │ │
│ │ • All attempts from same IP (likely forgot password)       │ │
│ │ • IP matches user's typical location (New York, NY)        │ │
│ │ • No suspicious activity detected                          │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ACTIONS                                                         │
│ ● Unlock account and send password reset link                 │
│   (Recommended for forgotten password)                         │
│                                                                 │
│ ○ Unlock account only (no password reset)                     │
│   (If user knows password and just made typos)                 │
│                                                                 │
│ ○ Keep locked and investigate further                         │
│   (If suspicious activity suspected)                           │
│                                                                 │
│ [Cancel]                                  [Unlock Account]     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. User Data Export (GDPR Compliance)

**Trigger:** Employee requests copy of their data (GDPR right to access)

**Workflow:**
```
1. Navigate to user profile
2. Click "Export User Data"
3. System generates comprehensive data package:
   - Personal information
   - Employment history
   - Performance reviews
   - Benefits elections
   - Login history
   - All user-created content (jobs, candidates, etc.)
4. Package delivered as encrypted ZIP file
5. Email sent to user with download link
6. Link expires in 7 days
7. Audit log entry created
```

---

## 10. User Data Deletion (GDPR Right to Erasure)

**Trigger:** Former employee requests data deletion (GDPR right to erasure)

**Critical:** Only use for legitimate GDPR requests. Do NOT use for regular terminations.

**Workflow:**
```
1. Verify GDPR request is legitimate (legal review)
2. Check retention requirements (e.g., payroll records must be kept 7 years)
3. Navigate to user profile → "Delete User Data"
4. System shows what will be deleted vs retained:

   WILL BE DELETED:
   - Personal contact information
   - Resume/CV
   - Notes and comments
   - User profile photo
   - Personal preferences

   MUST BE RETAINED (Legal/Compliance):
   - Employment dates (for record retention)
   - Payroll records (7 years)
   - I-9 forms (3 years from hire or 1 year from term)
   - Tax documents (4-7 years)
   - Anonymized performance data (for analytics)

5. Anonymize user:
   - Replace name with "User [ID]"
   - Remove email, phone, address
   - Delete personal documents
   - Keep audit trail (anonymized)

6. Confirm deletion (irreversible)
7. Send confirmation email to user
8. Document GDPR request response in compliance log
```

---

## 11. Key Metrics

| Metric | Purpose |
|--------|---------|
| Total Active Users | System utilization |
| New Users (MTD/YTD) | Growth tracking |
| Deactivated Users | Turnover correlation |
| Users by Role | Role distribution |
| Failed Logins | Security monitoring |
| Locked Accounts | Security issues |
| Password Resets | User experience indicator |
| Last Login (per user) | Inactive account detection |

---

## 12. Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| **USER-001** | Email must be unique across all users | System validates on create/update |
| **USER-002** | User must have exactly one primary role | System enforces single role |
| **USER-003** | Deactivated users cannot log in (401 Unauthorized) | Auth system blocks |
| **USER-004** | Account locks after 5 failed login attempts | Auto-lock after 5 failures |
| **USER-005** | Password must meet complexity requirements (8+ chars, upper, lower, number, special) | Enforced on password set |
| **USER-006** | Admin cannot delete own account | System prevents self-deletion |
| **USER-007** | CEO and Admin roles require 2FA | Enforced on role assignment |
| **USER-008** | User data deletion requires legal approval | Manual approval process |

---

## 13. Field Specifications

### Create User Form Fields

**Field Specification: First Name**

| Property | Value |
|----------|-------|
| Field Name | `firstName` |
| Type | TextInput |
| Required | Yes |
| Max Length | 50 characters |
| Validation | Letters, spaces, hyphens, apostrophes only |
| Error Messages | |
| - Empty | "First name is required" |
| - Invalid | "First name can only contain letters, spaces, hyphens, and apostrophes" |
| - Too Long | "First name cannot exceed 50 characters" |

**Field Specification: Last Name**

| Property | Value |
|----------|-------|
| Field Name | `lastName` |
| Type | TextInput |
| Required | Yes |
| Max Length | 50 characters |
| Validation | Letters, spaces, hyphens, apostrophes only |
| Error Messages | |
| - Empty | "Last name is required" |
| - Invalid | "Last name can only contain letters, spaces, hyphens, and apostrophes" |
| - Too Long | "Last name cannot exceed 50 characters" |

**Field Specification: Email**

| Property | Value |
|----------|-------|
| Field Name | `email` |
| Type | TextInput (email) |
| Required | Yes |
| Max Length | 254 characters |
| Validation | Valid email format, unique in system |
| Error Messages | |
| - Empty | "Email is required" |
| - Invalid Format | "Please enter a valid email address" |
| - Duplicate | "A user with this email already exists" |
| - Domain Restricted | "Only @company.com email addresses are allowed" |

**Field Specification: Employee ID**

| Property | Value |
|----------|-------|
| Field Name | `employeeId` |
| Type | TextInput |
| Required | No (auto-generated if empty) |
| Max Length | 20 characters |
| Format | EMP-YYYY-NNNN |
| Validation | Alphanumeric, unique in system |
| Error Messages | |
| - Duplicate | "This employee ID is already in use" |
| - Invalid Format | "Employee ID must be alphanumeric" |

**Field Specification: Primary Role**

| Property | Value |
|----------|-------|
| Field Name | `roleId` |
| Type | Select (searchable) |
| Required | Yes |
| Options | From `roles` table where `is_active = true` |
| Error Messages | |
| - Empty | "Please select a role for this user" |
| - Invalid | "Selected role is not available" |

**Field Specification: Pod Assignment**

| Property | Value |
|----------|-------|
| Field Name | `podId` |
| Type | Select (searchable) |
| Required | Conditional (required for IC roles) |
| Options | From `pods` table where `is_active = true` |
| Error Messages | |
| - Empty | "Pod assignment is required for this role" |
| - Invalid | "Selected pod is not available" |

**Field Specification: Start Date**

| Property | Value |
|----------|-------|
| Field Name | `startDate` |
| Type | DatePicker |
| Required | Yes |
| Default | Today |
| Validation | Cannot be more than 90 days in past or future |
| Error Messages | |
| - Empty | "Start date is required" |
| - Too Far Past | "Start date cannot be more than 90 days in the past" |
| - Too Far Future | "Start date cannot be more than 90 days in the future" |

---

## 14. SSO/SAML User Provisioning

### Overview

InTime OS supports Single Sign-On (SSO) integration with enterprise identity providers using SAML 2.0 or OIDC protocols.

### SSO User Flow

```
┌────────────────────────────────────────────────────────────────┐
│ SSO/SAML User Provisioning Flow                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User clicks "Sign in with SSO"                             │
│     ↓                                                          │
│  2. Redirect to Identity Provider (IdP)                        │
│     ↓                                                          │
│  3. User authenticates with IdP                                │
│     ↓                                                          │
│  4. IdP sends SAML assertion to InTime                         │
│     ↓                                                          │
│  5. InTime validates SAML assertion                            │
│     ↓                                                          │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ User Exists?                                           │   │
│  │                                                         │   │
│  │ YES → Update user attributes from SAML                 │   │
│  │       → Log user in                                    │   │
│  │       → Redirect to dashboard                          │   │
│  │                                                         │   │
│  │ NO (JIT Provisioning Enabled) →                        │   │
│  │       → Create new user from SAML attributes           │   │
│  │       → Assign default role (configurable)             │   │
│  │       → Log user in                                    │   │
│  │       → Show onboarding wizard                         │   │
│  │                                                         │   │
│  │ NO (JIT Disabled) →                                    │   │
│  │       → Show error: "Account not found"                │   │
│  │       → Log failed attempt                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### SAML Attribute Mapping

| SAML Attribute | InTime Field | Required | Notes |
|----------------|--------------|----------|-------|
| `email` | `email` | Yes | Primary identifier |
| `firstName` or `givenName` | `first_name` | Yes | |
| `lastName` or `surname` | `last_name` | Yes | |
| `employeeId` | `employee_id` | No | From HRIS |
| `department` | `department` | No | |
| `manager` | `manager_id` | No | Email lookup |
| `groups` | `role_id` | No | Mapped via group rules |
| `title` | `job_title` | No | |

### SSO Configuration Screen

```
┌────────────────────────────────────────────────────────────────┐
│ SSO/SAML Configuration                              [Test SSO]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ IDENTITY PROVIDER                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Provider Type:                                             │ │
│ │ ○ SAML 2.0                                                │ │
│ │ ○ OIDC (OpenID Connect)                                   │ │
│ │ ● Azure AD (pre-configured)                               │ │
│ │ ○ Okta (pre-configured)                                   │ │
│ │ ○ Google Workspace (pre-configured)                       │ │
│ │                                                             │ │
│ │ IdP Metadata URL:                                          │ │
│ │ [https://login.microsoftonline.com/...]                   │ │
│ │                                                             │ │
│ │ [Upload IdP Metadata XML]                                  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ SERVICE PROVIDER (InTime)                                       │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Entity ID: https://app.intime.com/saml/metadata            │ │
│ │ ACS URL: https://app.intime.com/saml/acs                   │ │
│ │ SLO URL: https://app.intime.com/saml/slo                   │ │
│ │                                                             │ │
│ │ [Download SP Metadata] [Copy URLs]                         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ JIT PROVISIONING                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ☑ Enable Just-in-Time user provisioning                    │ │
│ │                                                             │ │
│ │ Default Role for new SSO users:                            │ │
│ │ [Technical Recruiter                                   ▼] │ │
│ │                                                             │ │
│ │ Default Pod for new SSO users:                             │ │
│ │ [Unassigned                                            ▼] │ │
│ │                                                             │ │
│ │ ☑ Require admin approval for JIT-created users             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Cancel]                                      [Save SSO Config]  │
└────────────────────────────────────────────────────────────────┘
```

---

## 15. API Token Management

### Overview

Admins can create and manage API tokens for users who need programmatic access to InTime APIs.

### API Token Screen

```
┌────────────────────────────────────────────────────────────────┐
│ API Tokens - Sarah Patel                        [+ New Token]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ACTIVE TOKENS (2)                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Token Name        | Scopes          | Created    | Expires │ │
│ ├───────────────────┼─────────────────┼────────────┼─────────┤ │
│ │ Automation Script | jobs:read,      | Nov 1, 2024| Never   │ │
│ │                   | candidates:read |            |         │ │
│ │                   | [Revoke]                               │ │
│ ├───────────────────┼─────────────────┼────────────┼─────────┤ │
│ │ Reporting Tool    | reports:read    | Dec 1, 2024| Dec 2025│ │
│ │                   | [Revoke]                               │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ REVOKED TOKENS (1)                                              │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Old Integration   | full            | Jan 2024   | Revoked │ │
│ │                   | Revoked: Oct 15, 2024 by Admin         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Create API Token Flow

**Step 1:** Click "+ New Token"

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Create API Token                                          [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TOKEN DETAILS                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Token Name: *                                              │ │
│ │ [________________________]                                 │ │
│ │ (Descriptive name to identify this token)                  │ │
│ │                                                             │ │
│ │ Expiration:                                                 │ │
│ │ ○ 30 days                                                  │ │
│ │ ○ 90 days                                                  │ │
│ │ ● 1 year                                                   │ │
│ │ ○ Never (not recommended)                                  │ │
│ │ ○ Custom: [____________] [📅]                             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ SCOPES (Permissions)                                            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ☐ full - Full access (all permissions)                     │ │
│ │                                                             │ │
│ │ Jobs                                                        │ │
│ │ ☑ jobs:read - Read job data                               │ │
│ │ ☐ jobs:write - Create/update jobs                         │ │
│ │                                                             │ │
│ │ Candidates                                                  │ │
│ │ ☑ candidates:read - Read candidate data                   │ │
│ │ ☐ candidates:write - Create/update candidates             │ │
│ │                                                             │ │
│ │ Submissions                                                 │ │
│ │ ☐ submissions:read - Read submissions                     │ │
│ │ ☐ submissions:write - Create/update submissions           │ │
│ │                                                             │ │
│ │ Reports                                                     │ │
│ │ ☐ reports:read - Generate reports                         │ │
│ │                                                             │ │
│ │ Users (Admin only)                                          │ │
│ │ ☐ users:read - Read user data                             │ │
│ │ ☐ users:write - Create/update users                       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Cancel]                                      [Generate Token]  │
└────────────────────────────────────────────────────────────────┘
```

**Step 2:** Click "Generate Token"

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ ✓ API Token Created                                       [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚠️ IMPORTANT: Copy this token now. It will not be shown again! │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ itm_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef       │ │
│ │                                                [Copy 📋]   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Token Details:                                                  │
│ • Name: Automation Script                                       │
│ • Scopes: jobs:read, candidates:read                           │
│ • Expires: December 4, 2025                                    │
│ • Created: December 4, 2024                                    │
│                                                                 │
│ Usage Example:                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ curl -H "Authorization: Bearer itm_live_aBc..."            │ │
│ │      https://api.intime.com/v1/jobs                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Done]                                                          │
└────────────────────────────────────────────────────────────────┘
```

---

## 16. User Profile Photos

### Photo Upload Flow

**Step 1:** Navigate to user profile → Click "Edit" → Click profile photo area

**System Response:**
```
┌────────────────────────────────────────────────────────────────┐
│ Update Profile Photo                                      [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│        ┌─────────────────────────────────────────┐             │
│        │                                         │             │
│        │            Current Photo                │             │
│        │              (or initials)              │             │
│        │                                         │             │
│        └─────────────────────────────────────────┘             │
│                                                                 │
│ UPLOAD NEW PHOTO                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Drag and drop image here, or [Browse]                      │ │
│ │                                                             │ │
│ │ Requirements:                                               │ │
│ │ • JPG, PNG, or WebP format                                 │ │
│ │ • Max file size: 5 MB                                      │ │
│ │ • Min dimensions: 200 x 200 pixels                         │ │
│ │ • Square images work best                                  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Remove Photo]              [Cancel]              [Save Photo]  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Photo Processing

| Step | Action |
|------|--------|
| 1 | Upload photo to temporary storage |
| 2 | Validate file type and size |
| 3 | Generate thumbnail (50x50, 100x100, 200x200) |
| 4 | Move to permanent storage (S3/CDN) |
| 5 | Update user_profile.photo_url |
| 6 | Invalidate CDN cache |

---

## 17. Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` / `Ctrl+K` | Open command palette | Any admin page |
| `g u` | Go to Users list | Any admin page |
| `n u` | New user | Users list |
| `/` | Focus search | Users list |
| `j` / `k` | Navigate up/down | Users list |
| `Enter` | Open selected user | Users list |
| `e` | Edit user | User profile |
| `Escape` | Close modal | Any modal |

---

## 18. Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-USR-001 | Create user with valid data | Admin logged in | 1. Click "+ Create User" 2. Fill all required fields 3. Click "Create" | User created, welcome email sent |
| ADMIN-USR-002 | Create user with duplicate email | User with email exists | 1. Click "+ Create User" 2. Enter existing email 3. Submit | Error: "A user with this email already exists" |
| ADMIN-USR-003 | Deactivate user | User is active | 1. Open user profile 2. Click "Deactivate" 3. Select reason 4. Confirm | User status = Inactive, sessions terminated |
| ADMIN-USR-004 | Reactivate user | User is inactive | 1. Open inactive user 2. Click "Reactivate" 3. Confirm | User status = Active, can log in |
| ADMIN-USR-005 | Reset password (send link) | User exists | 1. Open user profile 2. Click "Reset Password" 3. Choose "Send link" | Password reset email sent |
| ADMIN-USR-006 | Unlock account | User is locked | 1. Open locked user 2. Click "Unlock" 3. Choose option 4. Confirm | Account unlocked |
| ADMIN-USR-007 | Bulk import users | CSV file ready | 1. Click "Import Users" 2. Upload CSV 3. Review mapping 4. Import | Users created, errors reported |
| ADMIN-USR-008 | Change user role | User exists | 1. Open user 2. Click "Edit" 3. Change role 4. Save | Role updated, permissions changed |
| ADMIN-USR-009 | Assign user to pod | User has no pod | 1. Open user 2. Edit pod assignment 3. Save | User added to pod |
| ADMIN-USR-010 | Transfer ownership on deactivation | User owns records | 1. Deactivate user 2. Select new owner 3. Confirm | All RACI assignments transferred |
| ADMIN-USR-011 | Create API token | User profile open | 1. Click "API Tokens" 2. Click "+ New" 3. Configure scopes 4. Generate | Token created, shown once |
| ADMIN-USR-012 | Revoke API token | Token exists | 1. Click "API Tokens" 2. Click "Revoke" 3. Confirm | Token invalidated immediately |
| ADMIN-USR-013 | SSO login (existing user) | SSO configured | 1. Click "SSO Login" 2. Authenticate with IdP | User logged in, attributes synced |
| ADMIN-USR-014 | SSO login (JIT provisioning) | SSO + JIT enabled | 1. New user clicks "SSO Login" 2. Authenticate | New user created, logged in |
| ADMIN-USR-015 | Upload profile photo | User profile open | 1. Click photo area 2. Upload image 3. Save | Photo displayed, thumbnails generated |

---

## 19. Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate email | Email already in system | "A user with this email already exists" | Use different email or merge accounts |
| Invalid role | Role deleted/disabled | "Selected role is not available" | Select different role |
| Pod not found | Pod deleted | "Selected pod no longer exists" | Select different pod |
| HRIS sync failed | Integration error | "Failed to sync with HRIS. User created locally." | Manual HRIS entry or retry |
| Email send failed | SMTP error | "Welcome email failed to send. Click to retry." | Retry or copy invite link |
| SSO assertion invalid | Certificate mismatch | "SSO authentication failed. Contact admin." | Re-upload IdP certificate |
| Token generation failed | Rate limit | "Too many tokens created. Try again later." | Wait 1 hour |
| Photo upload failed | File too large | "Photo must be under 5 MB" | Resize image |
| Password too weak | Doesn't meet policy | "Password must contain uppercase, lowercase, number, and special character" | Use stronger password |

---

## 20. Database Schema Reference

```sql
-- Core user table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(254) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  employee_id VARCHAR(20) UNIQUE,
  phone VARCHAR(20),
  photo_url TEXT,

  -- Enterprise fields
  cost_center VARCHAR(20),
  hire_date DATE,
  termination_date DATE,
  commission_plan_id UUID REFERENCES commission_plans(id),
  license_type VARCHAR(20) DEFAULT 'full', -- full, limited, read_only
  sso_identifier VARCHAR(255), -- External SSO ID
  external_system_id VARCHAR(100), -- HRIS ID

  -- Organization
  organization_id UUID NOT NULL REFERENCES organizations(id),
  pod_id UUID REFERENCES pods(id),
  manager_id UUID REFERENCES user_profiles(id),
  department VARCHAR(100),
  job_title VARCHAR(100),
  location VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'America/New_York',

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, locked, pending
  data_scope VARCHAR(20) DEFAULT 'own', -- own, team, region, organization

  -- Security
  mfa_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  failed_login_count INTEGER DEFAULT 0,
  locked_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

-- API tokens
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  token_hash VARCHAR(64) NOT NULL, -- SHA-256 hash
  token_prefix VARCHAR(10) NOT NULL, -- First 10 chars for identification
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User role assignments
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  UNIQUE(user_id, role_id)
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_pod ON user_profiles(pod_id);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_sso ON user_profiles(sso_identifier);
CREATE INDEX idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_prefix ON api_tokens(token_prefix);
```

---

## 21. Related Use Cases

- [UC-ADMIN-002: Configure Pods](./02-configure-pods.md)
- [UC-ADMIN-006: Permission Management](./06-permission-management.md)
- [UC-ADMIN-007: Integration Management](./07-integration-management.md)
- [UC-ADMIN-008: Audit Logs](./08-audit-logs.md)

---

## 22. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial user management documentation |
| 2.0 | 2025-12-04 | Added field specifications, SSO/SAML flow, API tokens, test cases, keyboard shortcuts, database schema |

---

**End of UC-ADMIN-005**
