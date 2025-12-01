# Use Case: Manage Users

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADM-001 |
| Actor | Admin (System Administrator) |
| Goal | Create, edit, and manage user accounts in the organization |
| Frequency | Daily (3-5 user operations per day) |
| Estimated Time | 2-5 minutes per user |
| Priority | High |

---

## Preconditions

1. User is logged in as Admin
2. User has "admin.users.manage" permission (default for Admin role)
3. Organization exists in the system
4. Available user licenses (if license-based billing)

---

## Trigger

One of the following:
- New employee onboarding
- Employee role change or promotion
- User reports access issues
- User password reset request
- Employee offboarding
- Pod restructuring requires user reassignment
- Compliance audit requires user review

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to User Management

**User Action:** Click "Admin" in sidebar, then click "Users"

**System Response:**
- Sidebar Admin section expands
- URL changes to: `/admin/users`
- Users list screen loads
- Loading skeleton shows for 200-500ms
- Users list populates with all users in organization

**Screen State:**
```
+----------------------------------------------------------+
| Admin › Users                         [+ Add User] [Cmd+K] |
+----------------------------------------------------------+
| [Search users...]                      [Filter ▼] [Sort ▼] |
+----------------------------------------------------------+
| ● Active (47) │ ○ Inactive (8) │ ○ Pending (3) │ ○ All (58)|
+----------------------------------------------------------+
| Status  Name              Role            Pod        Last Active |
| ──────────────────────────────────────────────────────────────|
| 🟢 Act  Sarah Johnson     Rec Manager     Pod A      2m ago      |
| 🟢 Act  Mike Chen         Recruiter       Pod A      5m ago      |
| 🟢 Act  Amy Williams      Bench Sales     Pod B      1h ago      |
| 🟡 Pend John Smith        Recruiter       (Unassigned) Invited   |
| 🔴 Inact Lisa Brown       Recruiter       Pod C      30d ago     |
+----------------------------------------------------------+
| Showing 58 users                                          [Export ▼]|
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "Add User"

**User Action:** Click "+ Add User" button in top-right corner

**System Response:**
- Button shows click state
- Modal slides in from right (300ms animation)
- Modal title: "Add New User"
- First field (Email) is focused
- Keyboard cursor blinks in Email field

**Screen State:**
```
+----------------------------------------------------------+
|                                           Add New User [×] |
+----------------------------------------------------------+
| Step 1 of 3: User Information                             |
|                                                           |
| Email Address *                                           |
| [                                              ] 0/100    |
| This will be the user's login email                       |
|                                                           |
| First Name *                  Last Name *                 |
| [                    ]        [                    ]      |
|                                                           |
| Work Phone                                                |
| [                                              ]          |
|                                                           |
| Employee ID                                               |
| [                    ]                                    |
| Optional: For HR integration                              |
|                                                           |
| Start Date                                                |
| [MM/DD/YYYY                                     📅]       |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Role & Access →]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Enter Email Address

**User Action:** Type email, e.g., "alex.martinez@company.com"

**System Response:**
- Characters appear in input field
- Real-time validation checks format
- Checks for duplicate email (debounced 500ms)
- Character counter updates

**Field Specification: Email Address**
| Property | Value |
|----------|-------|
| Field Name | `email` |
| Type | Email Input |
| Label | "Email Address" |
| Placeholder | "user@company.com" |
| Required | Yes |
| Max Length | 100 characters |
| Validation | Valid email format, unique in organization |
| Duplicate Check | Real-time (debounced 500ms) |
| Error Messages | |
| - Empty | "Email address is required" |
| - Invalid format | "Please enter a valid email address" |
| - Duplicate | "This email already exists. [View User]" |
| - Domain mismatch | "Warning: Email domain doesn't match organization" |

**Time:** ~5 seconds

---

### Step 4: Enter Name and Optional Fields

**User Action:** Enter "Alex" in First Name, "Martinez" in Last Name

**System Response:**
- Names appear in fields
- Character validation (letters, hyphens, apostrophes only)

**User Action:** Enter phone number "(555) 234-5678"

**System Response:**
- Auto-formats to standard phone format
- Shows formatted: (555) 234-5678

**User Action:** Enter Employee ID "EMP-2024-047"

**User Action:** Select Start Date (today or future date)

**Field Specification: First Name**
| Property | Value |
|----------|-------|
| Field Name | `firstName` |
| Type | Text Input |
| Label | "First Name" |
| Required | Yes |
| Max Length | 50 characters |
| Validation | Letters, hyphens, apostrophes only |
| Error Messages | |
| - Empty | "First name is required" |
| - Invalid | "First name contains invalid characters" |

**Field Specification: Last Name**
| Property | Value |
|----------|-------|
| Field Name | `lastName` |
| Type | Text Input |
| Label | "Last Name" |
| Required | Yes |
| Max Length | 50 characters |
| Validation | Letters, hyphens, apostrophes only |

**Field Specification: Work Phone**
| Property | Value |
|----------|-------|
| Field Name | `workPhone` |
| Type | Phone Input |
| Label | "Work Phone" |
| Required | No |
| Auto-format | Yes (US: (555) 123-4567) |
| International | Yes (detects country code) |

**Field Specification: Employee ID**
| Property | Value |
|----------|-------|
| Field Name | `employeeId` |
| Type | Text Input |
| Label | "Employee ID" |
| Required | No |
| Max Length | 50 characters |
| Unique | Yes (if provided) |
| Format | Alphanumeric, hyphens allowed |

**Field Specification: Start Date**
| Property | Value |
|----------|-------|
| Field Name | `startDate` |
| Type | Date Picker |
| Label | "Start Date" |
| Required | No |
| Format | MM/DD/YYYY |
| Min Date | Today - 1 year |
| Max Date | Today + 1 year |

**Time:** ~15 seconds

---

### Step 5: Click "Next" to Role & Access

**User Action:** Click "Next: Role & Access →" button

**System Response:**
- Form validates Step 1 fields
- If valid: Animation slides to Step 2
- If invalid: Shows error messages, focus on first error

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                                           Add New User [×] |
+----------------------------------------------------------+
| Step 2 of 3: Role & Access                                |
|                                                           |
| User Role *                                               |
| [Select role...                                        ▼] |
|                                                           |
| Available Roles:                                          |
| ○ Recruiter (IC)                                          |
|   Individual contributor - manages jobs and candidates    |
|                                                           |
| ○ Recruiting Manager                                      |
|   Manages recruiting pod, reviews submissions             |
|                                                           |
| ○ Bench Sales (IC)                                        |
|   Markets consultants, manages bench hotlists             |
|                                                           |
| ○ Bench Sales Manager                                     |
|   Manages bench sales pod                                 |
|                                                           |
| ○ HR Manager                                              |
|   People operations, talent acquisition                   |
|                                                           |
| ○ Admin                                                   |
|   Full system access and configuration                    |
|                                                           |
| ○ Executive (CEO/CFO)                                     |
|   Read-only access to all data, analytics                 |
|                                                           |
| Assign to Pod *                                           |
| [Select pod...                                         ▼] |
| (Required for IC and Manager roles)                       |
|                                                           |
| Position Type                                             |
| ○ Manager (Senior Member)  ○ IC (Junior Member)          |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Next: Confirmation →] |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 6: Select User Role

**User Action:** Click "Recruiter (IC)" radio button

**System Response:**
- Radio button selected
- "Assign to Pod" field becomes enabled
- "Position Type" defaults to "IC (Junior Member)"
- Shows permission preview panel

**Screen State (Role Selected):**
```
+----------------------------------------------------------+
| User Role *                                               |
| ● Recruiter (IC) ✓                                        |
|                                                           |
| Permissions Preview:                                      |
| ✅ Create and manage jobs                                |
| ✅ Source and add candidates                             |
| ✅ Create submissions                                    |
| ✅ Schedule interviews                                   |
| ✅ Make placements                                       |
| ✅ View all candidates (org-wide)                        |
| ❌ Manage users or pods                                  |
| ❌ Access system settings                                |
|                                                           |
+----------------------------------------------------------+
```

**Field Specification: User Role**
| Property | Value |
|----------|-------|
| Field Name | `roleId` |
| Type | Radio Button Group |
| Label | "User Role" |
| Required | Yes |
| Data Source | `roles` table WHERE `org_id = current_org` |
| Display Format | `{role.name}` with description |
| Options | |
| - `recruiter` | "Recruiter (IC)" |
| - `recruiting_manager` | "Recruiting Manager" |
| - `bench_sales` | "Bench Sales (IC)" |
| - `bench_sales_manager` | "Bench Sales Manager" |
| - `hr_manager` | "HR Manager" |
| - `admin` | "Admin" |
| - `executive` | "Executive (CEO/CFO)" |
| Conditional | If Manager role selected, show "Direct Reports" field |

**Time:** ~5 seconds

---

### Step 7: Assign to Pod

**User Action:** Click "Assign to Pod" dropdown

**System Response:**
- Dropdown opens with list of active pods
- Filtered by pod type matching user role (recruiting pods for recruiters)
- Shows pod name, manager, and current member count

**Screen State (Pod Dropdown):**
```
+----------------------------------------------------------+
| Assign to Pod *                                           |
| [Search pods...                                        ]  |
|                                                           |
| Pod A - Recruiting                                        |
| Manager: Sarah Johnson                                    |
| Members: 4/6                                              |
|                                                           |
| Pod B - Recruiting                                        |
| Manager: Mike Chen                                        |
| Members: 6/6 (Full)                                       |
|                                                           |
| Pod C - Recruiting                                        |
| Manager: Amy Williams                                     |
| Members: 3/6                                              |
|                                                           |
| [+ Create New Pod]                                        |
+----------------------------------------------------------+
```

**User Action:** Click "Pod A - Recruiting"

**System Response:**
- Dropdown closes
- Shows selected pod: "Pod A - Recruiting"
- Position Type auto-set to "IC (Junior Member)"
- Shows pod manager: "Manager: Sarah Johnson"

**Field Specification: Assign to Pod**
| Property | Value |
|----------|-------|
| Field Name | `podId` |
| Type | Searchable Dropdown |
| Label | "Assign to Pod" |
| Required | Yes (for IC and Manager roles) |
| Data Source | `pods` table WHERE `status = 'active'` AND `pod_type` matches user role |
| Display Format | `{pod.name} - {pod.type}` <br> `Manager: {manager.name}` <br> `Members: {current}/{max}` |
| Filter | By pod type (recruiting, bench_sales, ta) |
| Allow Create | Yes - Opens "Quick Add Pod" modal |
| Validation | Warn if pod is full (max members reached) |

**Field Specification: Position Type**
| Property | Value |
|----------|-------|
| Field Name | `positionType` |
| Type | Radio Button Group |
| Label | "Position Type" |
| Required | Yes (if assigned to pod) |
| Options | |
| - `manager` | "Manager (Senior Member)" |
| - `ic` | "IC (Junior Member)" |
| Default | Based on role: Manager roles → "manager", IC roles → "ic" |
| Validation | Only one manager per pod allowed |

**Time:** ~10 seconds

---

### Step 8: Click "Next" to Confirmation

**User Action:** Click "Next: Confirmation →" button

**System Response:**
- Validates Step 2 fields
- Slides to Step 3 (Confirmation)

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                                           Add New User [×] |
+----------------------------------------------------------+
| Step 3 of 3: Review & Send Invitation                     |
|                                                           |
| Review User Details                                       |
|                                                           |
| Email:          alex.martinez@company.com                 |
| Name:           Alex Martinez                             |
| Phone:          (555) 234-5678                           |
| Employee ID:    EMP-2024-047                              |
| Start Date:     12/01/2024                                |
|                                                           |
| Role:           Recruiter (IC)                            |
| Pod:            Pod A - Recruiting                        |
| Position:       IC (Junior Member)                        |
| Reports To:     Sarah Johnson (Pod A Manager)             |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Invitation Settings                                       |
|                                                           |
| ☑ Send invitation email immediately                      |
| ☐ Require password change on first login                 |
| ☑ Enable 2FA requirement for this user                   |
|                                                           |
| Temporary Password (Auto-generated)                       |
| [TempPass2024!] [Regenerate] [📋 Copy]                   |
|                                                           |
| Custom Welcome Message (Optional)                         |
| [                                                      ]  |
| [  Welcome to InTime! Your manager Sarah will reach    ]  |
| [  out shortly to schedule your onboarding.            ]  |
| [                                               ] 0/500   |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Create User & Invite ✓]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 9: Review and Configure Invitation

**User Action:** Review all details, check "Send invitation email immediately"

**System Response:**
- Checkbox becomes checked
- Email preview shown below

**User Action:** Check "Require password change on first login"

**System Response:**
- Checkbox becomes checked
- User will be forced to change password on first login

**User Action:** (Optional) Add custom welcome message

**Field Specification: Send Invitation Email**
| Property | Value |
|----------|-------|
| Field Name | `sendInviteEmail` |
| Type | Checkbox |
| Label | "Send invitation email immediately" |
| Default | Checked (true) |
| Email Template | Uses organization's email template |

**Field Specification: Require Password Change**
| Property | Value |
|----------|-------|
| Field Name | `requirePasswordChange` |
| Type | Checkbox |
| Label | "Require password change on first login" |
| Default | Checked (true) |
| Security | Best practice for new users |

**Field Specification: Enable 2FA**
| Property | Value |
|----------|-------|
| Field Name | `require2FA` |
| Type | Checkbox |
| Label | "Enable 2FA requirement for this user" |
| Default | Checked (true) if org-wide 2FA enabled |
| Security | Can override org-wide setting per user |

**Field Specification: Temporary Password**
| Property | Value |
|----------|-------|
| Field Name | `temporaryPassword` |
| Type | Text Input (with generate button) |
| Label | "Temporary Password" |
| Auto-generated | Yes (16 chars, alphanumeric + symbols) |
| Copy Button | Yes |
| Validation | Min 12 chars, must include uppercase, lowercase, number, symbol |
| Visibility | Masked by default, can toggle |

**Field Specification: Custom Welcome Message**
| Property | Value |
|----------|-------|
| Field Name | `welcomeMessage` |
| Type | Textarea |
| Label | "Custom Welcome Message" |
| Required | No |
| Max Length | 500 characters |
| Included In | Invitation email body |

**Time:** ~30 seconds

---

### Step 10: Click "Create User & Invite"

**User Action:** Click "Create User & Invite ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. Form validates all fields across all steps
3. If valid: API call `POST /api/trpc/admin.users.create`
4. Creates user record in `user_profiles` table
5. Assigns role in `user_roles` table
6. Assigns to pod in `pod_members` table
7. Generates and stores hashed temporary password
8. If "Send invitation email" checked: Sends invitation email
9. On success:
   - Modal closes (300ms animation)
   - Toast notification: "User created successfully. Invitation sent to alex.martinez@company.com" (green)
   - Users list refreshes
   - New user appears in list with status "🟡 Pending" (highlighted for 3 seconds)
   - URL changes to: `/admin/users/{new-user-id}`
   - User detail view opens automatically
10. On error:
    - Modal stays open
    - Error toast: "Failed to create user: {error message}"
    - Problematic fields highlighted

**Database Operations:**
```sql
-- 1. Create user profile
INSERT INTO user_profiles (
  email, first_name, last_name, work_phone, employee_id, start_date,
  role_id, pod_id, position_type, status, created_by, created_at
) VALUES (
  'alex.martinez@company.com', 'Alex', 'Martinez', '5552345678',
  'EMP-2024-047', '2024-12-01',
  'recruiter', 'pod-a-id', 'ic', 'pending', current_user_id, NOW()
);

-- 2. Assign role
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (new_user_id, 'recruiter', current_user_id, NOW());

-- 3. Assign to pod
INSERT INTO pod_members (pod_id, user_id, position_type, added_by, added_at)
VALUES ('pod-a-id', new_user_id, 'ic', current_user_id, NOW());

-- 4. Store temp password
INSERT INTO auth.users (email, encrypted_password, require_password_change, require_2fa)
VALUES ('alex.martinez@company.com', hashed_password, true, true);

-- 5. Log activity
INSERT INTO activities (
  entity_type, entity_id, activity_type, performed_by, performed_at
) VALUES (
  'user', new_user_id, 'user.created', current_user_id, NOW()
);
```

**Time:** ~2 seconds

---

### Step 11: View New User Profile

**System Response (Automatic):**
- Modal closes
- Navigates to user detail page
- Shows full user profile

**Screen State (User Detail):**
```
+----------------------------------------------------------+
| [← Back to Users]                         User Detail    |
+----------------------------------------------------------+
|
| Alex Martinez                               [Edit User]  |
| 🟡 Pending (Invitation Sent)                              |
| alex.martinez@company.com                                 |
| (555) 234-5678                                           |
| Employee ID: EMP-2024-047                                |
|                                                           |
| Role:           Recruiter (IC)                            |
| Pod:            Pod A - Recruiting                        |
| Position:       IC (Junior Member)                        |
| Reports To:     Sarah Johnson                             |
| Start Date:     12/01/2024                                |
|                                                           |
| Security                                                  |
| 🔐 2FA Required: Yes                                     |
| 🔑 Must change password on first login                   |
|                                                           |
+----------------------------------------------------------+
| Overview | Permissions | Activity Log | Settings         |
+----------------------------------------------------------+
|
| Permissions (Inherited from "Recruiter" role)             |
|                                                           |
| Jobs                                                      |
| ✅ Create jobs                                           |
| ✅ View own and consulted jobs                           |
| ✅ Edit own jobs                                         |
| ❌ Delete jobs                                           |
|                                                           |
| Candidates                                                |
| ✅ Create candidates                                     |
| ✅ View all candidates (org-wide)                        |
| ✅ Edit assigned candidates                              |
| ❌ Delete candidates                                     |
|                                                           |
| Submissions                                               |
| ✅ Create submissions                                    |
| ✅ View own submissions                                  |
| ✅ Edit own submissions                                  |
| ❌ Delete submissions                                    |
|                                                           |
| [View Full Permissions Matrix]                            |
|                                                           |
| Recent Activity                                           |
| ✅ User created by You · Just now                        |
| 📧 Invitation email sent · Just now                      |
| 📋 Assigned to Pod A · Just now                          |
| 🔑 Temporary password generated · Just now               |
|                                                           |
| Quick Actions                                             |
| [Resend Invitation] [Reset Password] [Edit Role]         |
| [Change Pod] [Deactivate User]                           |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## Alternative Flow A: Edit Existing User

### Entry Point: From Users List

**User Action:** Click on existing user row (e.g., "Sarah Johnson")

**System Response:**
- Navigates to user detail page: `/admin/users/{user-id}`
- Shows full user profile

**User Action:** Click "Edit User" button

**System Response:**
- Modal slides in with user edit form
- All current values pre-filled

**Screen State (Edit User):**
```
+----------------------------------------------------------+
|                                          Edit User [×]    |
+----------------------------------------------------------+
| Edit User: Sarah Johnson                                  |
|                                                           |
| Email Address *                                           |
| [sarah.johnson@company.com                             ]  |
| ⚠️  Changing email will require email verification        |
|                                                           |
| First Name *                  Last Name *                 |
| [Sarah              ]         [Johnson            ]       |
|                                                           |
| Work Phone                    Employee ID                 |
| [(555) 123-4567     ]         [EMP-2024-001       ]       |
|                                                           |
| Current Role: Recruiting Manager                          |
| [Change Role...]                                          |
|                                                           |
| Current Pod: Pod A - Recruiting (Manager)                 |
| [Change Pod Assignment...]                                |
|                                                           |
| Status                                                    |
| ● Active  ○ Inactive  ○ Suspended                        |
|                                                           |
| Last Login: 2 minutes ago                                 |
| Account Created: 6 months ago                             |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Save Changes ✓]                 |
+----------------------------------------------------------+
```

**User Action:** Make changes (e.g., update phone number)

**User Action:** Click "Save Changes ✓"

**System Response:**
- Validates changes
- Updates user record
- Toast: "User updated successfully"
- Refreshes user detail view
- Logs activity: "user.updated"

**Time:** ~30 seconds to 2 minutes

---

## Alternative Flow B: Reset User Password

### Entry Point: User Detail Page or Users List

**User Action:** Click "Reset Password" button

**System Response:**
- Confirmation modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Reset Password [×]     |
+----------------------------------------------------------+
| Reset Password for Sarah Johnson                          |
|                                                           |
| Generate New Password                                     |
| ○ Send password reset link via email (Recommended)       |
|   User will receive link to set their own password        |
|                                                           |
| ○ Generate temporary password                            |
|   Admin provides password to user manually                |
|                                                           |
| If generating temporary password:                         |
| ☑ Require password change on next login                  |
|                                                           |
| ⚠️  This will invalidate the user's current password      |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Reset Password ✓]               |
+----------------------------------------------------------+
```

**User Action:** Select "Send password reset link via email", click "Reset Password ✓"

**System Response:**
- Generates password reset token
- Sends email with reset link to user
- Toast: "Password reset email sent to sarah.johnson@company.com"
- Logs activity: "password.reset_requested"

**Time:** ~10 seconds

---

## Alternative Flow C: Deactivate User

### Entry Point: User Detail Page

**User Action:** Click "Deactivate User" button

**System Response:**
- Warning modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Deactivate User [×]    |
+----------------------------------------------------------+
| Deactivate Sarah Johnson                                  |
|                                                           |
| ⚠️  Warning: This will immediately:                       |
| • Revoke user's access to the system                     |
| • Invalidate all active sessions                         |
| • Hide user from active user lists                       |
|                                                           |
| User's data will be preserved:                            |
| ✅ Jobs, Candidates, Submissions remain assigned         |
| ✅ Activity history preserved                            |
| ✅ Can be reactivated later                              |
|                                                           |
| Reassign Ownership (Optional)                             |
| Transfer this user's active items to:                     |
| [Select user...                                        ▼] |
|                                                           |
| Reason for Deactivation (Required)                        |
| [Offboarding - Last day 11/30/2024                     ]  |
| [                                               ] 0/200   |
|                                                           |
| ☑ Send notification to user's manager                    |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Deactivate User]                |
+----------------------------------------------------------+
```

**User Action:** Select reassignment user, enter reason, click "Deactivate User"

**System Response:**
- Sets `status = 'inactive'`
- Revokes all sessions
- If reassignment selected: Bulk updates ownership
- Sends notification to manager
- Toast: "User deactivated. 47 items reassigned to Mike Chen."
- Redirects to users list
- Logs activity: "user.deactivated"

**Time:** ~30 seconds

---

## Alternative Flow D: Bulk User Import

### Entry Point: Users List

**User Action:** Click "Import" button (next to "Add User")

**System Response:**
- Import modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Import Users [×]       |
+----------------------------------------------------------+
| Bulk Import Users from CSV                                |
|                                                           |
| Step 1: Download Template                                 |
| [Download CSV Template]                                   |
|                                                           |
| Template includes columns:                                |
| • email (required)                                        |
| • first_name (required)                                   |
| • last_name (required)                                    |
| • work_phone                                              |
| • employee_id                                             |
| • role_id (required)                                      |
| • pod_id (required)                                       |
| • start_date                                              |
|                                                           |
| Step 2: Upload Filled Template                            |
| [Drag & Drop CSV Here or Click to Browse]                |
|                                                           |
| Import Options                                            |
| ☑ Send invitation emails to all new users                |
| ☑ Require password change on first login                 |
| ☐ Skip rows with validation errors                       |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Import Users →]                 |
+----------------------------------------------------------+
```

**User Action:** Download template, fill with user data, upload CSV

**System Response:**
- Validates CSV format and data
- Shows preview with validation results

**Screen State (Preview):**
```
+----------------------------------------------------------+
| Import Preview                                            |
|                                                           |
| ✅ 23 users ready to import                              |
| ⚠️  3 users have warnings                                |
| ❌ 2 users have errors                                   |
|                                                           |
| Row | Email              | Status  | Issue                |
| ────────────────────────────────────────────────────────|
| 1   | user1@company.com  | ✅ Ready | -                   |
| 2   | user2@company.com  | ✅ Ready | -                   |
| 5   | user5@company.com  | ⚠️  Warn | Pod is full        |
| 10  | invalid-email      | ❌ Error| Invalid email      |
| 15  | user15@company.com | ❌ Error| Duplicate email    |
|                                                           |
| [View All Rows]                                           |
|                                                           |
| What would you like to do?                                |
| ○ Import only valid rows (23 users)                      |
| ○ Fix errors and re-upload                               |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Import Valid Rows ✓]           |
+----------------------------------------------------------+
```

**User Action:** Select "Import only valid rows", click "Import Valid Rows ✓"

**System Response:**
- Creates users in batch
- Sends invitation emails
- Shows progress bar
- On complete:
  - Toast: "23 users imported successfully. 2 rows skipped due to errors."
  - Downloads error report CSV
  - Refreshes users list
  - Logs activity: "users.bulk_imported"

**Time:** ~2 minutes for 25 users

---

## Postconditions

1. ✅ New user record created in `user_profiles` table
2. ✅ User status set to "pending" (until first login)
3. ✅ Role assigned in `user_roles` table
4. ✅ Pod membership created in `pod_members` table
5. ✅ Temporary password generated and stored (hashed)
6. ✅ Invitation email sent (if selected)
7. ✅ Activity logged: "user.created"
8. ✅ Manager notified (if pod has manager)
9. ✅ Admin redirected to user detail page

---

## Events Logged

| Event | Payload |
|-------|---------|
| `user.created` | `{ user_id, email, name, role_id, pod_id, created_by, created_at }` |
| `user.invited` | `{ user_id, email, invited_by, invited_at }` |
| `user.assigned_to_pod` | `{ user_id, pod_id, position_type, assigned_by, assigned_at }` |
| `user.role_assigned` | `{ user_id, role_id, assigned_by, assigned_at }` |
| `user.updated` | `{ user_id, changed_fields, updated_by, updated_at }` |
| `user.deactivated` | `{ user_id, reason, deactivated_by, deactivated_at }` |
| `password.reset_requested` | `{ user_id, requested_by, requested_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Email | Email already exists | "User with this email already exists. [View User]" | Use different email or edit existing user |
| Invalid Email Format | Email format invalid | "Please enter a valid email address" | Correct email format |
| License Limit Reached | No available user licenses | "User limit reached. Upgrade plan or deactivate users." | Upgrade plan or deactivate inactive users |
| Pod Full | Selected pod at max capacity | "Pod A is full (6/6 members). Select different pod or increase capacity." | Choose different pod or expand pod capacity |
| Invalid Role | Role doesn't exist | "Selected role is invalid" | Select valid role |
| Duplicate Employee ID | Employee ID already used | "Employee ID already exists" | Use different employee ID |
| Email Send Failed | SMTP error | "User created but invitation email failed. [Resend]" | Resend invitation manually |
| Permission Denied | Admin lacks permission | "You don't have permission to create users" | Contact super admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Cmd+Shift+A` | Quick add user (opens modal) |
| `Esc` | Close modal (with confirmation if changes made) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form (when on button) |
| `Cmd+Enter` | Submit form (from any field) |
| `/` | Focus search box on users list |

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create user with all required fields | User created successfully |
| TC-002 | Submit with duplicate email | Error: "User already exists" |
| TC-003 | Submit with invalid email | Error: "Invalid email format" |
| TC-004 | Assign to full pod | Warning shown, can override |
| TC-005 | Create without sending invitation | User created, no email sent |
| TC-006 | Edit existing user email | Email updated, verification required |
| TC-007 | Reset user password | Reset email sent successfully |
| TC-008 | Deactivate user with ownership reassignment | User deactivated, items reassigned |
| TC-009 | Bulk import 50 users | All valid users imported |
| TC-010 | Import with errors | Valid users imported, errors reported |
| TC-011 | Change user role | Role updated, permissions changed |
| TC-012 | Network error during creation | Retry option shown |

---

*Last Updated: 2024-11-30*
