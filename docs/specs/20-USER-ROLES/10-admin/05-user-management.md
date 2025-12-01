# UC-ADMIN-005: User Management

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Admin
**Status:** Approved

---

## 1. Overview

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

## 13. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial user management documentation |

---

**End of UC-ADMIN-005**
