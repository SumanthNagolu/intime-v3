# PROMPT: SCREENS-ADMIN (Window 6)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and backend skill.

Create/Update Admin role screens for InTime v3 using the metadata-driven screen definition approach.

## Read First (Required):
- docs/specs/20-USER-ROLES/10-admin/README.md (Admin overview)
- docs/specs/20-USER-ROLES/10-admin/00-OVERVIEW.md (Full spec)
- docs/specs/20-USER-ROLES/10-admin/01-manage-users.md (User management)
- docs/specs/20-USER-ROLES/10-admin/02-configure-pods.md (Pod configuration)
- docs/specs/20-USER-ROLES/10-admin/03-system-settings.md (System settings)
- docs/specs/20-USER-ROLES/10-admin/04-data-management.md (Data operations)
- docs/specs/01-GLOSSARY.md (Pods, Roles, RACI)
- CLAUDE.md (Tech stack)

## Read Existing Code:
- src/screens/hr/pod-list.screen.ts (Pod management if exists)
- src/screens/hr/pod-detail.screen.ts
- src/lib/metadata/types.ts (ScreenDefinition type)
- src/lib/db/schema/core.ts (Users, Pods, Roles schema)

## Context:
- Routes: `/admin/*` for admin screens
- Admin has FULL system access - all entities, all users
- Focus on: User management, Pod configuration, System settings, Data operations
- All admin actions require audit logging
- Destructive actions require confirmation

## Admin Responsibilities (per 00-OVERVIEW.md):
- User management (create, edit, deactivate)
- Pod configuration (teams setup)
- System settings (org, security, integrations)
- Data operations (import, export, merge, archive)
- RACI override capability

---

## Admin Dashboard (src/screens/admin/):

### 1. Admin Dashboard
File: admin-dashboard.screen.ts
Route: `/admin`

Layout:
- System health overview
- KPI cards:
  - Total Users (active/inactive)
  - Active Sessions
  - Storage Used
  - API Calls (today)
- Alerts panel: System warnings, security alerts, pending approvals
- Quick actions: Add User, System Settings, View Logs
- Recent admin activities feed

---

## User Management Screens:

### 2. Users List
File: users-list.screen.ts
Route: `/admin/users`

Per 01-manage-users.md:

Table columns: name, email, role, department, status (active/inactive), lastLoginAt, createdAt
Filters: Role, Status, Department, Pod
Search: By name, email

Bulk actions:
- Activate / Deactivate
- Reset Password
- Export

Actions: Invite User, Export List

### 3. User Detail
File: user-detail.screen.ts
Route: `/admin/users/[id]`

Tabs:
- Profile: Personal info, contact, avatar
- Roles & Permissions:
  - Assigned role(s)
  - Explicit permission overrides
  - Pod assignments
  - RACI visibility
- Activity: Login history, action log
- Sessions: Active sessions (with revoke)
- Audit: Changes made by this user

Actions: Edit, Deactivate, Reset Password, Impersonate (with audit)

### 4. Invite User
File: user-invite.screen.ts
Route: `/admin/users/invite`

Per 01-manage-users.md invitation flow:

Form fields:
- Email(s) - multiple with comma/newline
- Role selection (dropdown with descriptions)
- Department
- Pod assignment (optional)
- Manager (searchable select)
- Custom invitation message

Send invitations → tracks pending invitations

### 5. Pending Invitations
File: pending-invitations.screen.ts
Route: `/admin/users/invitations`

Table: email, role, invitedAt, expiresAt, status
Actions: Resend, Cancel

### 6. Roles Management
File: roles-list.screen.ts
Route: `/admin/roles`

Per admin specs:

Table: name, description, userCount, permissionsCount, type (system/custom)
System roles: recruiter, bench_sales, ta, pod_manager, hr_manager, cfo, coo, ceo, admin
Custom roles section: Create Custom Role

### 7. Role Detail / Editor
File: role-detail.screen.ts
Route: `/admin/roles/[id]`

Layout:
- Header: Name, Type badge (system/custom), Description
- Permissions matrix:
  - Rows: Entity types (jobs, candidates, submissions, accounts, etc.)
  - Columns: Create, Read, Update, Delete
  - Cells: Scope selector (None, Own, Pod, Org)
- Users with this role
- Edit permissions (custom roles only)

### 8. Permissions Matrix View
File: permissions-matrix.screen.ts
Route: `/admin/permissions`

Full org-wide permissions view:
- Filter by role, entity
- Export permissions report
- View inheritance chain

---

## Pod Configuration Screens:

### 9. Pods List
File: pods-list.screen.ts
Route: `/admin/pods`

Per 02-configure-pods.md:

Grid by type: Recruiting, Bench Sales, TA
Pod cards:
- Name
- Type badge
- Senior member (manager) avatar + name
- Junior member(s) avatars
- Status (active/inactive)
- Sprint targets

Actions: Create Pod

### 10. Pod Detail / Editor
File: pod-detail.screen.ts
Route: `/admin/pods/[id]`

Per 02-configure-pods.md:

Sections:
- Overview: Name, Type, Status
- Members:
  - Senior Member (Manager) with reassign
  - Junior Members with add/remove
- Sprint Targets:
  - Placements target
  - Revenue target
  - Submissions target
- Performance: Historical metrics
- History: Audit log of changes

Actions: Edit, Add Member, Remove Member, Change Manager, Dissolve Pod

### 11. Create Pod
File: pod-create.screen.ts
Route: `/admin/pods/new`

Form:
- Name
- Type (recruiting/bench_sales/ta)
- Senior Member (searchable, must have manager role)
- Junior Members (multi-select)
- Initial targets

---

## System Settings Screens:

### 12. Settings Hub
File: settings-hub.screen.ts
Route: `/admin/settings`

Per 03-system-settings.md:

Categories with links:
- Organization Profile
- Security
- Email & Notifications
- Integrations
- Features & Modules
- Data & Privacy
- API & Webhooks

### 13. Organization Settings
File: org-settings.screen.ts
Route: `/admin/settings/organization`

Sections:
- Company Info: Name, Legal name, Industry, Website, Address
- Branding: Logo upload, Primary color, Accent color
- Timezone: Default timezone, Business hours
- Fiscal Year: Start month

### 14. Security Settings
File: security-settings.screen.ts
Route: `/admin/settings/security`

Sections:
- Password Policy: Min length, Complexity requirements, Expiry
- Session: Timeout duration, Concurrent sessions limit
- 2FA: Require 2FA toggle, Methods (TOTP, SMS)
- IP Allowlist: Restrict access by IP
- Login: Failed attempts lockout, Captcha threshold

### 15. Email Settings
File: email-settings.screen.ts
Route: `/admin/settings/email`

Sections:
- SMTP Configuration: Provider, Host, Port, Auth
- Default Sender: From name, From email
- Email Templates: List with edit links
- Template Editor: Rich text with merge fields

### 16. Integrations Hub
File: integrations-hub.screen.ts
Route: `/admin/integrations`

Categories:
- Job Boards (Indeed, LinkedIn, etc.)
- Calendar (Google, Outlook)
- Email (Gmail, Outlook)
- HRIS Systems
- Background Check (Checkr, etc.)
- Assessment Tools

Integration cards: Name, Logo, Status (connected/disconnected), Configure

### 17. Integration Detail
File: integration-detail.screen.ts
Route: `/admin/integrations/[id]`

- Connection status
- Configuration form (credentials, API keys)
- Sync settings (frequency, scope)
- Logs (recent sync events)
- Test connection button

### 18. API Settings
File: api-settings.screen.ts
Route: `/admin/settings/api`

Sections:
- API Keys: List, Create, Revoke
- Webhooks: List, Create, Test
- Rate Limits: View/adjust
- Documentation link

---

## Data Management Screens:

### 19. Data Management Hub
File: data-hub.screen.ts
Route: `/admin/data`

Per 04-data-management.md:

Options:
- Import Data (CSV upload)
- Export Data (entity selection)
- Merge Duplicates
- Bulk Reassign
- Archive Old Data
- Data Quality Report

### 20. Import Data
File: data-import.screen.ts
Route: `/admin/data/import`

Multi-step:
1. Select Entity Type (candidates, jobs, accounts, contacts)
2. Upload CSV with template download
3. Map Columns to fields
4. Preview & Validate (show errors)
5. Confirm Import
6. Progress & Results

### 21. Export Data
File: data-export.screen.ts
Route: `/admin/data/export`

Form:
- Entity type selection
- Fields to include (checklist)
- Filters (date range, status)
- Format (CSV, Excel, JSON)
- Generate & Download

### 22. Duplicate Detection
File: duplicate-detection.screen.ts
Route: `/admin/data/duplicates`

Per 04-data-management.md merge duplicates:

- Entity type tabs (Candidates, Contacts, Accounts)
- Potential duplicates list (similarity score)
- Review duplicates: Side-by-side comparison
- Merge action: Select primary, merge fields

### 23. Bulk Reassign
File: bulk-reassign.screen.ts
Route: `/admin/data/reassign`

Form:
- From User (searchable)
- To User (searchable)
- Entity types to include (checkboxes)
- Preview affected records
- Confirm reassignment

---

## Audit & Logs Screens:

### 24. Audit Logs
File: audit-logs.screen.ts
Route: `/admin/audit`

Table: timestamp, actor, action, entity, entityId, changes
Filters: Date range, Actor, Entity type, Action type
Search: By entity ID
Export: CSV/JSON

Change diff viewer (before/after)

### 25. System Logs
File: system-logs.screen.ts
Route: `/admin/logs`

Sections:
- Error Logs (with stack traces)
- API Request Logs
- Background Job Status
- Performance Metrics

Filters: Level (error/warn/info), Date range, Source

### 26. Feature Flags
File: feature-flags.screen.ts
Route: `/admin/features`

Table: name, description, status (enabled/disabled), rollout %
Actions: Toggle, Set rollout %, User segment targeting

---

## Workflow Configuration Screens:

### 27. Workflows Hub
File: workflows-hub.screen.ts
Route: `/admin/workflows`

Workflow types:
- Submission Workflow (stages, transitions)
- Interview Workflow
- Offer Workflow
- Onboarding Workflow

Click → Workflow detail editor

### 28. Workflow Editor
File: workflow-editor.screen.ts
Route: `/admin/workflows/[type]`

Visual workflow editor:
- Stages list (drag to reorder)
- Stage detail: Name, Actions available, Required fields
- Transitions: From stage → To stage, Conditions
- Approval requirements per transition

### 29. Activity Patterns
File: activity-patterns.screen.ts
Route: `/admin/workflows/patterns`

Pattern library:
- Filter by category (Recruiting, Bench, CRM, HR, General)
- Pattern cards: Name, Category, SLA, Fields count, Checklist count
- Create/Edit pattern

### 30. SLA Configuration
File: sla-config.screen.ts
Route: `/admin/workflows/sla`

SLA definitions:
- Name, Entity type, Metric
- Target value, Unit
- Warning threshold, Critical threshold
- Business hours toggle

Priority mapping table

### 31. Notification Rules
File: notification-rules.screen.ts
Route: `/admin/workflows/notifications`

Notification templates by event:
- Template editor (subject, body with merge fields)
- Channel config (email, push, SMS)
- Recipient rules
- Enable/disable per notification type

## Screen Definition Pattern:
```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const adminScreenName: ScreenDefinition = {
  id: 'admin-screen-id',
  type: 'list' | 'form' | 'dashboard',
  title: 'Screen Title',
  icon: 'IconName',

  permission: {
    roles: ['admin'],
  },

  dataSource: {
    type: 'query',
    query: { procedure: 'admin.procedure' },
  },

  layout: { /* sections */ },
  actions: [...],
};
```

## Requirements:
- Strict permission checks (admin role only)
- Confirmation dialogs for destructive actions
- Audit logging for ALL changes
- Impersonation with clear visual indicator and audit trail
- Bulk operations with preview before execute
- Undo support where possible

## Security Considerations:
- All admin routes require active admin role check
- Sensitive actions (password reset, impersonate) require re-auth
- Session tracking with IP logging
- Failed action logging

## After Screens:
1. Create screen definitions in src/screens/admin/
2. Add to adminScreens registry
3. Create routes in src/app/admin/
4. Update navigation config for admin role
5. Add audit logging middleware
