# Use Case: Configure Pods

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADM-002 |
| Actor | Admin (System Administrator) |
| Goal | Create and manage pods (teams) in the organization |
| Frequency | Monthly (1-3 pod operations per month) |
| Estimated Time | 5-15 minutes per pod |
| Priority | High |

---

## Preconditions

1. User is logged in as Admin
2. User has "admin.pods.manage" permission (default for Admin role)
3. Organization exists in the system
4. At least one manager-level user exists (for pod assignment)

---

## Trigger

One of the following:
- New team formation (company growth)
- Team restructuring or reorganization
- Manager change or promotion
- Pod performance review requires adjustment
- Sprint target adjustment needed
- Pod merger or dissolution
- New business pillar launch (recruiting, bench sales, TA)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Pod Management

**User Action:** Click "Admin" in sidebar, then click "Pods"

**System Response:**
- Sidebar Admin section expands
- URL changes to: `/admin/pods`
- Pods list screen loads
- Loading skeleton shows for 200-500ms
- Pods list populates with all pods in organization

**Screen State:**
```
+----------------------------------------------------------+
| Admin › Pods                          [+ New Pod] [Cmd+K] |
+----------------------------------------------------------+
| [Search pods...]                       [Filter ▼] [Sort ▼] |
+----------------------------------------------------------+
| ● Active (8) │ ○ Inactive (2) │ ○ All (10)                |
+----------------------------------------------------------+
| Pod Type:  All │ Recruiting (4) │ Bench Sales (3) │ TA (1)|
+----------------------------------------------------------+
| Status  Name              Manager        Members  Sprint Target |
| ──────────────────────────────────────────────────────────────|
| 🟢 Act  Pod A - Recruiting  Sarah Johnson  5/6      2 placements |
| 🟢 Act  Pod B - Recruiting  Mike Chen      6/6      2 placements |
| 🟢 Act  Pod C - Recruiting  Amy Williams   4/6      2 placements |
| 🟢 Act  Pod D - Bench Sales Lisa Brown     3/5      3 hotlists   |
| 🟢 Act  Pod E - Bench Sales Tom Davis      4/5      3 hotlists   |
| 🟡 Act  Pod F - TA          John Smith     2/4      5 hires      |
| 🔴 Inact Pod G - Recruiting  (No Manager)  0/6      -            |
+----------------------------------------------------------+
| Showing 8 active pods                             [Export ▼]|
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "New Pod"

**User Action:** Click "+ New Pod" button in top-right corner

**System Response:**
- Button shows click state
- Modal slides in from right (300ms animation)
- Modal title: "Create New Pod"
- First field (Pod Name) is focused
- Keyboard cursor blinks in Pod Name field

**Screen State:**
```
+----------------------------------------------------------+
|                                         Create New Pod [×] |
+----------------------------------------------------------+
| Step 1 of 3: Pod Information                              |
|                                                           |
| Pod Name *                                                |
| [                                              ] 0/100    |
| Example: "Pod A - Recruiting" or "West Coast Team"        |
|                                                           |
| Pod Type *                                                |
| [Select pod type...                                    ▼] |
|                                                           |
| Available Pod Types:                                      |
| ○ Recruiting                                              |
|   Focus: Jobs, Candidates, Submissions, Placements        |
|                                                           |
| ○ Bench Sales                                             |
|   Focus: Consultant marketing, Hotlists, Bench placements |
|                                                           |
| ○ Talent Acquisition (TA)                                 |
|   Focus: Direct hiring, Internal positions                |
|                                                           |
| Description (Optional)                                    |
| [                                                      ]  |
| [  Brief description of pod's focus area or territory  ]  |
| [                                               ] 0/500   |
|                                                           |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Team Setup →] |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Enter Pod Name

**User Action:** Type pod name, e.g., "Pod H - Recruiting"

**System Response:**
- Characters appear in input field
- Character counter updates
- No validation errors

**Field Specification: Pod Name**
| Property | Value |
|----------|-------|
| Field Name | `name` |
| Type | Text Input |
| Label | "Pod Name" |
| Placeholder | "e.g., Pod A - Recruiting" |
| Required | Yes |
| Max Length | 100 characters |
| Min Length | 3 characters |
| Validation | Not empty, alphanumeric + hyphens/spaces |
| Unique | Yes (within organization) |
| Error Messages | |
| - Empty | "Pod name is required" |
| - Too short | "Pod name must be at least 3 characters" |
| - Duplicate | "A pod with this name already exists" |

**Time:** ~5 seconds

---

### Step 4: Select Pod Type

**User Action:** Click "Pod Type" dropdown

**System Response:**
- Dropdown opens with pod type options
- Shows description for each type

**User Action:** Select "Recruiting"

**System Response:**
- Dropdown closes
- Field shows: "Recruiting"
- Description updates to show recruiting focus areas

**Field Specification: Pod Type**
| Property | Value |
|----------|-------|
| Field Name | `podType` |
| Type | Radio Button Group |
| Label | "Pod Type" |
| Required | Yes |
| Options | |
| - `recruiting` | "Recruiting" - Focus on jobs, candidates, submissions |
| - `bench_sales` | "Bench Sales" - Focus on consultant marketing |
| - `ta` | "Talent Acquisition (TA)" - Focus on direct hiring |
| Default | None (user must select) |
| Immutable | Cannot be changed after pod creation |

**Time:** ~5 seconds

---

### Step 5: Add Description (Optional)

**User Action:** Type description, e.g., "East Coast recruiting team focusing on technology roles"

**System Response:**
- Text appears in textarea
- Character count updates

**Field Specification: Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Textarea |
| Label | "Description" |
| Placeholder | "Brief description of pod's focus area or territory" |
| Required | No |
| Max Length | 500 characters |

**Time:** ~10 seconds

---

### Step 6: Click "Next" to Team Setup

**User Action:** Click "Next: Team Setup →" button

**System Response:**
- Form validates Step 1 fields
- If valid: Animation slides to Step 2
- If invalid: Shows error messages, focus on first error

**Screen State (Step 2):**
```
+----------------------------------------------------------+
|                                         Create New Pod [×] |
+----------------------------------------------------------+
| Step 2 of 3: Team Setup                                   |
|                                                           |
| Assign Manager (Senior Member) *                          |
| [Search users with manager role...                     ▼] |
|                                                           |
| Available Managers:                                       |
| (Users with Recruiting Manager role not assigned to pod)  |
|                                                           |
| ○ Emily Rodriguez                                         |
|   Role: Recruiting Manager                                |
|   Experience: 3 years                                     |
|   Currently: Unassigned                                   |
|                                                           |
| ○ David Kim                                               |
|   Role: Recruiting Manager                                |
|   Experience: 5 years                                     |
|   Currently: Unassigned                                   |
|                                                           |
| Add Team Members (Junior Members)                         |
| [Search users...                                       ▼] |
|                                                           |
| Selected Members (0):                                     |
| (None selected yet)                                       |
|                                                           |
| Maximum Pod Size                                          |
| [6  ] members (including manager)                         |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Next: Targets →]      |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 7: Assign Manager

**User Action:** Click on "Emily Rodriguez" radio button

**System Response:**
- Radio button selected
- Shows manager preview with details
- Updates pod structure diagram

**Screen State (Manager Selected):**
```
+----------------------------------------------------------+
| Assign Manager (Senior Member) *                          |
| ● Emily Rodriguez ✓                                       |
|                                                           |
| Manager Preview:                                          |
| Name: Emily Rodriguez                                     |
| Role: Recruiting Manager                                  |
| Email: emily.rodriguez@company.com                        |
| Experience: 3 years                                       |
|                                                           |
| Pod Structure:                                            |
| ┌─────────────────────────────────┐                      |
| │  Pod H - Recruiting             │                      |
| │                                 │                      |
| │  👤 Emily Rodriguez (Manager)   │                      |
| │  ├─ (Add team members below)    │                      |
| └─────────────────────────────────┘                      |
+----------------------------------------------------------+
```

**Field Specification: Assign Manager**
| Property | Value |
|----------|-------|
| Field Name | `managerId` (maps to `seniorMemberId` in schema) |
| Type | Radio Button List (Searchable) |
| Label | "Assign Manager (Senior Member)" |
| Required | Yes |
| Data Source | `user_profiles` WHERE `role` IN ('recruiting_manager', 'bench_sales_manager', 'hr_manager') AND `pod_id IS NULL` |
| Filter | By pod type - only show managers with matching role |
| Display Format | `{user.name}` <br> `Role: {user.role}` <br> `Currently: {user.pod_id ? pod.name : 'Unassigned'}` |
| Validation | Manager cannot be assigned to multiple pods |
| Error | "This manager is already assigned to {pod.name}" |

**Time:** ~5 seconds

---

### Step 8: Add Team Members

**User Action:** Click "Add Team Members" dropdown

**System Response:**
- Dropdown opens with searchable user list
- Shows available ICs (individual contributors)
- Filtered by role matching pod type

**Screen State (Add Members Dropdown):**
```
+----------------------------------------------------------+
| Add Team Members (Junior Members)                         |
| [Search users...                                       ]  |
|                                                           |
| Available Recruiters (not assigned to pod):               |
|                                                           |
| ☐ Alex Martinez                                           |
|   Recruiter · Joined: 12/01/2024 · Unassigned            |
|                                                           |
| ☐ Jessica Lee                                             |
|   Recruiter · Joined: 11/15/2024 · Unassigned            |
|                                                           |
| ☐ Carlos Hernandez                                        |
|   Recruiter · Joined: 10/20/2024 · Unassigned            |
|                                                           |
| [Select All] [Clear Selection]                            |
+----------------------------------------------------------+
```

**User Action:** Check "Alex Martinez" and "Jessica Lee"

**System Response:**
- Checkboxes become checked
- Selected members appear in "Selected Members" section
- Updates pod structure diagram

**Screen State (Members Selected):**
```
+----------------------------------------------------------+
| Selected Members (2):                                     |
|                                                           |
| 1. Alex Martinez (Recruiter)                              |
|    [Remove]                                               |
|                                                           |
| 2. Jessica Lee (Recruiter)                                |
|    [Remove]                                               |
|                                                           |
| [+ Add More Members]                                      |
|                                                           |
| Pod Structure:                                            |
| ┌─────────────────────────────────┐                      |
| │  Pod H - Recruiting             │                      |
| │                                 │                      |
| │  👤 Emily Rodriguez (Manager)   │                      |
| │  ├─ 👤 Alex Martinez            │                      |
| │  └─ 👤 Jessica Lee              │                      |
| │                                 │                      |
| │  Members: 3/6                   │                      |
| └─────────────────────────────────┘                      |
+----------------------------------------------------------+
```

**Field Specification: Add Team Members**
| Property | Value |
|----------|-------|
| Field Name | `memberIds` (maps to `juniorMemberId` in schema) |
| Type | Multi-select Checkbox List (Searchable) |
| Label | "Add Team Members (Junior Members)" |
| Required | No (can create pod with just manager) |
| Data Source | `user_profiles` WHERE `role` IN ('recruiter', 'bench_sales', 'hr_coordinator') AND `pod_id IS NULL` |
| Filter | By pod type - only show ICs with matching role |
| Display Format | `{user.name}` <br> `{user.role} · Joined: {user.start_date} · {user.pod_id ? pod.name : 'Unassigned'}` |
| Max Members | Defined by "Maximum Pod Size" field (default 6 including manager) |
| Validation | Total members (manager + ICs) ≤ max pod size |

**Time:** ~15 seconds

---

### Step 9: Set Maximum Pod Size

**User Action:** Keep default "6" or adjust (e.g., change to "8")

**System Response:**
- Number updates in field
- Validation checks: selected members ≤ max size

**Field Specification: Maximum Pod Size**
| Property | Value |
|----------|-------|
| Field Name | `maxMembers` |
| Type | Number Input |
| Label | "Maximum Pod Size" |
| Suffix | "members (including manager)" |
| Required | Yes |
| Default | 6 |
| Min | 2 (1 manager + 1 IC minimum) |
| Max | 20 |
| Validation | Selected members must fit within max size |
| Error | "You have selected {count} members, but max size is {max}" |

**Time:** ~5 seconds

---

### Step 10: Click "Next" to Targets

**User Action:** Click "Next: Targets →" button

**System Response:**
- Validates Step 2 fields
- Slides to Step 3 (Sprint Targets)

**Screen State (Step 3):**
```
+----------------------------------------------------------+
|                                         Create New Pod [×] |
+----------------------------------------------------------+
| Step 3 of 3: Sprint Targets & Goals                       |
|                                                           |
| Sprint Duration                                           |
| [2  ] weeks                                               |
|                                                           |
| Pod-Level Sprint Target *                                 |
| (Target for the entire pod per sprint)                    |
|                                                           |
| For Recruiting Pods:                                      |
| Placements: [6  ] placements per sprint                   |
| Submissions: [30 ] submissions per sprint                 |
| Interviews: [15 ] interviews per sprint                   |
|                                                           |
| Individual Contributor Target *                           |
| (Target for each IC in the pod)                           |
|                                                           |
| Placements: [2  ] placements per sprint                   |
| Submissions: [10 ] submissions per sprint                 |
| Interviews: [5  ] interviews per sprint                   |
|                                                           |
| 💡 Pod Target = IC Target × Number of ICs                 |
|    Current: 2 ICs × 2 placements = 4 placements           |
|    (Below pod target of 6)                                |
|                                                           |
| Additional Goals (Optional)                               |
| [                                                      ]  |
| [  e.g., "Focus on cloud engineering roles", "Improve   ] |
| [  client satisfaction scores", etc.                   ]  |
| [                                               ] 0/500   |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Create Pod ✓]         |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 11: Configure Sprint Targets

**User Action:** Review and adjust sprint targets

**Defaults Shown (for Recruiting pod with 2 ICs):**
- Sprint Duration: 2 weeks
- Pod Placements: 6 per sprint
- IC Placements: 2 per sprint
- Pod Submissions: 30 per sprint
- IC Submissions: 10 per sprint

**User Action:** Adjust if needed (e.g., change IC placement target to 3)

**System Response:**
- Number updates
- Recalculates pod-level target
- Shows validation if pod target doesn't match IC × count

**Field Specification: Sprint Duration**
| Property | Value |
|----------|-------|
| Field Name | `sprintDurationWeeks` |
| Type | Number Input |
| Label | "Sprint Duration" |
| Suffix | "weeks" |
| Required | Yes |
| Default | 2 |
| Options | 1, 2, 3, 4 |
| Most Common | 2 weeks |

**Field Specification: Pod Placement Target**
| Property | Value |
|----------|-------|
| Field Name | `podPlacementTarget` |
| Type | Number Input |
| Label | "Placements" (Pod-Level) |
| Suffix | "placements per sprint" |
| Required | Yes |
| Min | 1 |
| Default | Based on pod type: Recruiting = 6, Bench Sales = 9 |
| Visibility | Only for recruiting and bench_sales pod types |

**Field Specification: IC Placement Target**
| Property | Value |
|----------|-------|
| Field Name | `icPlacementTarget` |
| Type | Number Input |
| Label | "Placements" (IC Level) |
| Suffix | "placements per sprint" |
| Required | Yes |
| Min | 1 |
| Default | Based on pod type: Recruiting = 2, Bench Sales = 3 |
| Validation | IC target × IC count should align with pod target |

**Field Specification: Pod Submission Target**
| Property | Value |
|----------|-------|
| Field Name | `podSubmissionTarget` |
| Type | Number Input |
| Label | "Submissions" (Pod-Level) |
| Suffix | "submissions per sprint" |
| Required | Yes |
| Min | 1 |
| Default | 30 (recruiting), 45 (bench sales) |

**Field Specification: IC Submission Target**
| Property | Value |
|----------|-------|
| Field Name | `icSubmissionTarget` |
| Type | Number Input |
| Label | "Submissions" (IC Level) |
| Suffix | "submissions per sprint" |
| Required | Yes |
| Min | 1 |
| Default | 10 (recruiting), 15 (bench sales) |

**Field Specification: Additional Goals**
| Property | Value |
|----------|-------|
| Field Name | `additionalGoals` |
| Type | Textarea |
| Label | "Additional Goals" |
| Required | No |
| Max Length | 500 characters |
| Placeholder | "e.g., Focus on cloud engineering roles" |

**Time:** ~30 seconds

---

### Step 12: Click "Create Pod"

**User Action:** Click "Create Pod ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. Form validates all fields across all steps
3. If valid: API call `POST /api/trpc/admin.pods.create`
4. Creates pod record in `pods` table
5. Updates manager's `pod_id` and `position_type = 'manager'`
6. Updates each IC's `pod_id` and `position_type = 'ic'`
7. Creates pod targets in `pod_targets` table
8. Sends notification to manager and team members
9. On success:
   - Modal closes (300ms animation)
   - Toast notification: "Pod created successfully. Team members notified." (green)
   - Pods list refreshes
   - New pod appears in list (highlighted for 3 seconds)
   - URL changes to: `/admin/pods/{new-pod-id}`
   - Pod detail view opens automatically
10. On error:
    - Modal stays open
    - Error toast: "Failed to create pod: {error message}"
    - Problematic fields highlighted

**Database Operations:**
```sql
-- 1. Create pod
INSERT INTO pods (
  name, pod_type, description, max_members,
  senior_member_id, sprint_duration_weeks,
  status, created_by, created_at
) VALUES (
  'Pod H - Recruiting', 'recruiting', 'East Coast recruiting team',
  6, 'emily-id', 2,
  'active', current_user_id, NOW()
);

-- 2. Update manager's pod assignment
UPDATE user_profiles
SET pod_id = new_pod_id, position_type = 'manager', updated_at = NOW()
WHERE user_id = 'emily-id';

-- 3. Update IC pod assignments
UPDATE user_profiles
SET pod_id = new_pod_id, position_type = 'ic', updated_at = NOW()
WHERE user_id IN ('alex-id', 'jessica-id');

-- 4. Create pod_members records
INSERT INTO pod_members (pod_id, user_id, position_type, added_by, added_at)
VALUES
  (new_pod_id, 'emily-id', 'manager', current_user_id, NOW()),
  (new_pod_id, 'alex-id', 'ic', current_user_id, NOW()),
  (new_pod_id, 'jessica-id', 'ic', current_user_id, NOW());

-- 5. Create pod targets
INSERT INTO pod_targets (
  pod_id, sprint_duration_weeks,
  pod_placement_target, ic_placement_target,
  pod_submission_target, ic_submission_target,
  additional_goals, created_by, created_at
) VALUES (
  new_pod_id, 2,
  6, 2,
  30, 10,
  'East Coast focus', current_user_id, NOW()
);

-- 6. Log activity
INSERT INTO activities (
  entity_type, entity_id, activity_type, performed_by, performed_at
) VALUES (
  'pod', new_pod_id, 'pod.created', current_user_id, NOW()
);
```

**Time:** ~2 seconds

---

### Step 13: View New Pod Detail

**System Response (Automatic):**
- Modal closes
- Navigates to pod detail page
- Shows full pod profile

**Screen State (Pod Detail):**
```
+----------------------------------------------------------+
| [← Back to Pods]                          Pod Detail     |
+----------------------------------------------------------+
|
| Pod H - Recruiting                          [Edit Pod]   |
| 🟢 Active                                                 |
| East Coast recruiting team focusing on technology roles   |
|                                                           |
| Manager:        Emily Rodriguez                           |
| Members:        3/6 (50% capacity)                        |
| Sprint:         2-week cycles                             |
| Created:        Just now by You                           |
|                                                           |
+----------------------------------------------------------+
| Overview | Members | Performance | Targets | Settings    |
+----------------------------------------------------------+
|
| Team Structure                                            |
|                                                           |
| Manager (Senior Member)                                   |
| 👤 Emily Rodriguez                                        |
|    Recruiting Manager · emily.rodriguez@company.com       |
|    [View Profile] [Message]                               |
|                                                           |
| Team Members (Junior Members)                             |
|                                                           |
| 1. 👤 Alex Martinez                                       |
|    Recruiter · alex.martinez@company.com                  |
|    Joined Pod: Just now                                   |
|    [View Profile] [Message] [Remove from Pod]             |
|                                                           |
| 2. 👤 Jessica Lee                                         |
|    Recruiter · jessica.lee@company.com                    |
|    Joined Pod: Just now                                   |
|    [View Profile] [Message] [Remove from Pod]             |
|                                                           |
| [+ Add Member]                                            |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Sprint Targets                                            |
|                                                           |
| Sprint Duration: 2 weeks                                  |
|                                                           |
| Pod-Level Targets (per sprint):                           |
| • Placements: 6                                           |
| • Submissions: 30                                         |
| • Interviews: 15                                          |
|                                                           |
| Individual Contributor Targets (per sprint):              |
| • Placements: 2                                           |
| • Submissions: 10                                         |
| • Interviews: 5                                           |
|                                                           |
| Additional Goals:                                         |
| "Focus on cloud engineering roles and improve client      |
| satisfaction scores"                                      |
|                                                           |
| [Edit Targets]                                            |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Current Sprint Performance (Sprint 1)                     |
| Start Date: 12/01/2024 (Today)                            |
| End Date: 12/14/2024 (14 days remaining)                  |
|                                                           |
| Progress vs Targets:                                      |
|                                                           |
| Placements: 0 / 6  [░░░░░░░░░░] 0%                       |
| Submissions: 0 / 30 [░░░░░░░░░░] 0%                      |
| Interviews: 0 / 15 [░░░░░░░░░░] 0%                       |
|                                                           |
| (Pod just created - metrics will populate as team works)  |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Recent Activity                                           |
| ✅ Pod created by You · Just now                         |
| 👤 Emily Rodriguez assigned as Manager · Just now        |
| 👤 Alex Martinez added to pod · Just now                 |
| 👤 Jessica Lee added to pod · Just now                   |
| 🎯 Sprint targets configured · Just now                  |
|                                                           |
| Quick Actions                                             |
| [Add Member] [Edit Targets] [View Performance Report]    |
| [Message Team] [Dissolve Pod]                             |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## Alternative Flow A: Edit Existing Pod

### Entry Point: From Pods List

**User Action:** Click on existing pod row (e.g., "Pod A - Recruiting")

**System Response:**
- Navigates to pod detail page: `/admin/pods/{pod-id}`
- Shows full pod profile

**User Action:** Click "Edit Pod" button

**System Response:**
- Modal slides in with pod edit form
- All current values pre-filled

**Screen State (Edit Pod):**
```
+----------------------------------------------------------+
|                                          Edit Pod [×]     |
+----------------------------------------------------------+
| Edit Pod: Pod A - Recruiting                              |
|                                                           |
| Pod Name *                                                |
| [Pod A - Recruiting                                    ]  |
|                                                           |
| Pod Type                                                  |
| Recruiting (Cannot be changed)                            |
|                                                           |
| Description                                               |
| [Primary recruiting team for West Coast region         ]  |
|                                                           |
| Current Manager: Sarah Johnson                            |
| [Change Manager...]                                       |
|                                                           |
| Current Members: 5/6                                      |
| [Manage Members...]                                       |
|                                                           |
| Maximum Pod Size                                          |
| [6  ] members (currently 5 assigned)                      |
|                                                           |
| Pod Status                                                |
| ● Active  ○ Inactive                                     |
|                                                           |
| Created: 6 months ago by Admin                            |
| Last Updated: 2 weeks ago                                 |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Save Changes ✓]                 |
+----------------------------------------------------------+
```

**User Action:** Make changes (e.g., increase max size to 8)

**User Action:** Click "Save Changes ✓"

**System Response:**
- Validates changes
- Updates pod record
- Toast: "Pod updated successfully"
- Refreshes pod detail view
- Logs activity: "pod.updated"

**Time:** ~30 seconds to 2 minutes

---

## Alternative Flow B: Change Pod Manager

### Entry Point: Pod Detail Page

**User Action:** Click "Change Manager" button

**System Response:**
- Manager change modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Change Pod Manager [×] |
+----------------------------------------------------------+
| Change Manager for Pod A - Recruiting                     |
|                                                           |
| Current Manager:                                          |
| 👤 Sarah Johnson                                          |
|    Recruiting Manager · In pod for 6 months              |
|                                                           |
| New Manager *                                             |
| [Select new manager...                                 ▼] |
|                                                           |
| Available Managers:                                       |
| (Recruiting Managers not assigned to other pods)          |
|                                                           |
| ○ David Kim                                               |
|   Recruiting Manager · Currently Unassigned              |
|                                                           |
| ○ Promote from within pod                                |
|   Select IC to promote: [Select...                     ▼] |
|                                                           |
| What happens to current manager?                          |
| ● Reassign to different pod: [Select pod...           ▼] |
| ○ Remove from pod (unassigned)                           |
| ○ Demote to IC in same pod                               |
|                                                           |
| Effective Date                                            |
| ○ Immediate                                               |
| ● Scheduled: [MM/DD/YYYY                            📅]  |
|                                                           |
| Notify team members?                                      |
| ☑ Yes, send announcement email to pod                    |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Change Manager ✓]               |
+----------------------------------------------------------+
```

**User Action:** Select new manager, configure options, click "Change Manager ✓"

**System Response:**
- Updates pod's `senior_member_id`
- Updates old manager's `pod_id` and `position_type`
- Updates new manager's `pod_id` and `position_type = 'manager'`
- Sends notifications to team
- Toast: "Pod manager changed successfully"
- Logs activity: "pod.manager_changed"

**Time:** ~1 minute

---

## Alternative Flow C: Add/Remove Pod Members

### Entry Point: Pod Detail Page

**User Action:** Click "+ Add Member" button

**System Response:**
- Add member modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Add Member to Pod [×]  |
+----------------------------------------------------------+
| Add Member to Pod A - Recruiting                          |
|                                                           |
| Current Members: 5/6                                      |
| Available Slots: 1                                        |
|                                                           |
| Select Member to Add *                                    |
| [Search recruiters...                                  ▼] |
|                                                           |
| Available Recruiters (not in pod):                        |
|                                                           |
| ○ Carlos Hernandez                                        |
|   Recruiter · Currently Unassigned                       |
|                                                           |
| ○ Maria Garcia                                            |
|   Recruiter · Currently Unassigned                       |
|                                                           |
| ⚠️  Pod will be at full capacity (6/6) after this         |
|                                                           |
| Notify pod manager and team?                              |
| ☑ Yes, send notification                                 |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Add to Pod ✓]                   |
+----------------------------------------------------------+
```

**User Action:** Select member, click "Add to Pod ✓"

**System Response:**
- Updates user's `pod_id` and `position_type = 'ic'`
- Creates `pod_members` record
- Sends notifications
- Toast: "Carlos Hernandez added to Pod A"
- Refreshes pod detail view
- Logs activity: "pod.member_added"

### Remove Member

**User Action:** On pod detail page, click "Remove from Pod" next to a member

**System Response:**
- Confirmation modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Remove Pod Member [×]  |
+----------------------------------------------------------+
| Remove Carlos Hernandez from Pod A?                       |
|                                                           |
| ⚠️  This will:                                            |
| • Remove user from pod                                   |
| • User will become unassigned                            |
| • User's active items (jobs, submissions) remain assigned|
|                                                           |
| Reassign user's active items to:                          |
| [Keep assigned to Carlos                               ▼] |
| (Or select another user in pod)                           |
|                                                           |
| Reason for removal (Optional)                             |
| [                                                      ]  |
| [                                               ] 0/200   |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Remove from Pod]                |
+----------------------------------------------------------+
```

**User Action:** Configure options, click "Remove from Pod"

**System Response:**
- Sets user's `pod_id = NULL`
- Optionally reassigns ownership
- Sends notifications
- Toast: "Carlos Hernandez removed from Pod A"
- Logs activity: "pod.member_removed"

**Time:** ~30 seconds

---

## Alternative Flow D: Update Sprint Targets

### Entry Point: Pod Detail Page

**User Action:** Click "Edit Targets" button

**System Response:**
- Sprint targets edit modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Update Sprint Targets [×]|
+----------------------------------------------------------+
| Update Targets for Pod A - Recruiting                     |
|                                                           |
| Current Sprint Targets:                                   |
| Pod Placements: 6 per sprint                              |
| IC Placements: 2 per sprint                               |
| Pod Submissions: 30 per sprint                            |
| IC Submissions: 10 per sprint                             |
|                                                           |
| New Sprint Targets:                                       |
|                                                           |
| Pod-Level Targets (per 2-week sprint)                     |
| Placements: [8  ] (was 6)                                |
| Submissions: [40 ] (was 30)                              |
| Interviews: [20 ] (was 15)                               |
|                                                           |
| IC Targets (per 2-week sprint)                            |
| Placements: [2  ] (no change)                            |
| Submissions: [10 ] (no change)                           |
| Interviews: [5  ] (no change)                            |
|                                                           |
| 💡 With 5 ICs: 5 × 2 = 10 placements                      |
|    (Pod target of 8 is achievable)                        |
|                                                           |
| Effective Date                                            |
| ○ Current sprint (retroactive)                           |
| ● Next sprint (starts 12/15/2024)                        |
|                                                           |
| Notify team?                                              |
| ☑ Yes, send notification about new targets               |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Update Targets ✓]               |
+----------------------------------------------------------+
```

**User Action:** Adjust targets, click "Update Targets ✓"

**System Response:**
- Updates `pod_targets` record
- If next sprint: Creates new target record
- Sends notifications to pod members
- Toast: "Sprint targets updated. Team notified."
- Logs activity: "pod.targets_updated"

**Time:** ~1 minute

---

## Alternative Flow E: Dissolve Pod

### Entry Point: Pod Detail Page

**User Action:** Click "Dissolve Pod" button

**System Response:**
- Warning modal appears

**Screen State:**
```
+----------------------------------------------------------+
|                                    Dissolve Pod [×]       |
+----------------------------------------------------------+
| Dissolve Pod A - Recruiting                               |
|                                                           |
| ⚠️  WARNING: This is a permanent action                   |
|                                                           |
| This will:                                                |
| • Mark pod as inactive                                   |
| • Remove all members from pod (become unassigned)        |
| • Preserve all historical data and performance metrics   |
| • NOT delete jobs, candidates, or submissions            |
|                                                           |
| Current members (6):                                      |
| • Sarah Johnson (Manager)                                |
| • Alex Martinez, Jessica Lee, Carlos Hernandez,          |
|   Maria Garcia, David Kim                                 |
|                                                           |
| What should happen to members?                            |
| ○ Leave unassigned (manual reassignment)                 |
| ● Distribute to other pods:                              |
|                                                           |
|   Sarah Johnson → [Pod B - Recruiting (as IC)         ▼] |
|   Alex Martinez → [Pod B - Recruiting                 ▼] |
|   Jessica Lee → [Pod C - Recruiting                   ▼] |
|   (Continue for all members...)                           |
|                                                           |
| Reason for dissolution (Required)                         |
| [Pod merger with Pod B due to reorganization           ]  |
| [                                               ] 0/500   |
|                                                           |
| ☑ Notify all affected members                            |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Dissolve Pod]                   |
+----------------------------------------------------------+
```

**User Action:** Configure member reassignments, enter reason, click "Dissolve Pod"

**System Response:**
- Sets pod `status = 'inactive'`
- Updates all members' `pod_id` based on selections
- Sends notifications to all affected users
- Toast: "Pod A dissolved. 6 members reassigned."
- Redirects to pods list
- Logs activity: "pod.dissolved"

**Time:** ~2 minutes

---

## Postconditions

1. ✅ New pod record created in `pods` table
2. ✅ Pod status set to "active"
3. ✅ Manager assigned (`senior_member_id` populated)
4. ✅ Manager's `pod_id` updated
5. ✅ IC members' `pod_id` updated
6. ✅ `pod_members` records created for all members
7. ✅ `pod_targets` record created with sprint goals
8. ✅ Activity logged: "pod.created"
9. ✅ Notifications sent to manager and members
10. ✅ Admin redirected to pod detail page

---

## Events Logged

| Event | Payload |
|-------|---------|
| `pod.created` | `{ pod_id, name, pod_type, manager_id, member_count, created_by, created_at }` |
| `pod.updated` | `{ pod_id, changed_fields, updated_by, updated_at }` |
| `pod.manager_changed` | `{ pod_id, old_manager_id, new_manager_id, changed_by, changed_at }` |
| `pod.member_added` | `{ pod_id, user_id, position_type, added_by, added_at }` |
| `pod.member_removed` | `{ pod_id, user_id, reason, removed_by, removed_at }` |
| `pod.targets_updated` | `{ pod_id, old_targets, new_targets, updated_by, updated_at }` |
| `pod.dissolved` | `{ pod_id, reason, dissolved_by, dissolved_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Pod Name | Pod name already exists | "A pod with this name already exists" | Use different name |
| Manager Already Assigned | Manager in another pod | "This manager is already assigned to {pod.name}" | Select different manager or remove from current pod |
| Pod Over Capacity | Selected members exceed max | "You have selected {count} members, but max size is {max}" | Increase max size or remove members |
| No Manager Selected | Manager field empty | "Please assign a manager to the pod" | Select a manager |
| Invalid Pod Type | Pod type not recognized | "Invalid pod type selected" | Select valid pod type |
| Target Mismatch | IC × count ≠ pod target | "Warning: IC target × count doesn't match pod target" | Adjust targets (warning only) |
| Deletion Failed | Pod has active items | "Cannot delete pod with active items" | Dissolve instead of delete |
| Permission Denied | User lacks permission | "You don't have permission to manage pods" | Contact super admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Cmd+Shift+P` | Quick create pod (opens modal) |
| `Esc` | Close modal (with confirmation if changes made) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form (when on button) |
| `Cmd+Enter` | Submit form (from any field) |

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create pod with manager and 2 ICs | Pod created successfully |
| TC-002 | Create pod with duplicate name | Error: "Pod name already exists" |
| TC-003 | Create pod without manager | Error: "Manager required" |
| TC-004 | Assign manager already in pod | Error: "Manager already assigned" |
| TC-005 | Exceed max pod size | Error shown, cannot save |
| TC-006 | Edit pod to increase max size | Pod updated successfully |
| TC-007 | Change pod manager | Manager changed, notifications sent |
| TC-008 | Add member to full pod | Error or warning shown |
| TC-009 | Remove member from pod | Member removed, optionally reassigned |
| TC-010 | Update sprint targets | Targets updated for next sprint |
| TC-011 | Dissolve pod with reassignment | Pod dissolved, members moved |
| TC-012 | Create pod with no members | Pod created with manager only |

---

*Last Updated: 2024-11-30*
