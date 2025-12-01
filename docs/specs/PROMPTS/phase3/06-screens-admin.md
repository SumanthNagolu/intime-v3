# PROMPT: SCREENS-ADMIN (Window 6)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create Admin and Settings screens for InTime v3.

## Read First:
- docs/specs/20-USER-ROLES/10-admin/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/10-admin/02-manage-users.md
- docs/specs/20-USER-ROLES/10-admin/03-configure-workflows.md
- docs/specs/20-USER-ROLES/10-admin/04-system-settings.md
- docs/specs/20-USER-ROLES/00-PERMISSIONS-MATRIX.md

## Create Admin Screens (src/app/(app)/admin/):

### 1. Admin Dashboard (/admin)
File: page.tsx

Layout:
- System health overview
- Quick stats: Total Users, Active Sessions, Storage Used, API Calls Today
- Alerts panel: System warnings, security alerts
- Quick actions: Add User, System Settings, View Logs
- Recent admin activities

---

## User Management:

### 2. Users List (/admin/users)
File: users/page.tsx

Layout:
- Page header: "Users" + Invite User button
- UsersTable: name, email, role, status, last_login, created_at
- Filters: Role, Status, Department
- Bulk actions: Activate, Deactivate, Reset Password
- Export user list

### 3. User Detail (/admin/users/[id])
File: users/[id]/page.tsx

Layout:
- User header: Avatar, Name, Email, Status badge, Actions
- Tabs:
  - Profile: User info, contact
  - Roles & Permissions: Assigned roles, explicit permissions
  - Activity: Login history, actions log
  - Sessions: Active sessions (with revoke option)
  - Audit: Changes made by user
- Actions: Edit, Deactivate, Reset Password, Impersonate

### 4. Invite User (/admin/users/invite)
File: users/invite/page.tsx

Layout:
- Invite form:
  - Email(s) - multiple allowed
  - Role selection
  - Department
  - Manager
  - Custom message
- Send invitations button

### 5. Roles Management (/admin/roles)
File: roles/page.tsx

Layout:
- Roles table: name, description, users_count, permissions_count
- System roles (non-editable indicator)
- Custom roles section
- Create Custom Role button

### 6. Role Detail (/admin/roles/[id])
File: roles/[id]/page.tsx

Layout:
- Role header: Name, Type (system/custom), Actions
- Description
- Permissions matrix:
  - Entities as rows
  - Actions as columns (Create, Read, Update, Delete)
  - Scope indicators (Own, Team, Org)
- Users with this role list
- Edit permissions (for custom roles)

### 7. Permissions (/admin/permissions)
File: permissions/page.tsx

Layout:
- Full permissions matrix
- Filter by entity, action
- View permission inheritance
- Export permissions report

---

## Organization Settings:

### 8. Organization Settings (/admin/settings/organization)
File: settings/organization/page.tsx

Layout:
- Company information:
  - Name, Legal name
  - Industry
  - Website
  - Logo upload
  - Address
- Contact information
- Timezone settings
- Fiscal year settings

### 9. Subscription & Billing (/admin/settings/billing)
File: settings/billing/page.tsx

Layout:
- Current plan details
- Usage metrics
- Billing history
- Payment method
- Upgrade options

### 10. Regions & Pods (/admin/settings/regions)
File: settings/regions/page.tsx

Layout:
- Regions list with timezone
- Pods per region
- Create/Edit region
- Assign managers

### 11. Pods Management (/admin/settings/pods)
File: settings/pods/page.tsx

Layout:
- Pods grid by type (Recruiting, Bench Sales, TA)
- Pod cards: name, type, senior member, junior member, status
- Create Pod, Edit Pod modals
- Assign members

---

## Workflow Configuration:

### 12. Workflow Settings (/admin/workflows)
File: workflows/page.tsx

Layout:
- Workflow categories:
  - Submission workflow
  - Interview workflow
  - Offer workflow
  - Onboarding workflow
- Status configuration per workflow
- Transition rules
- Approval requirements

### 13. Activity Patterns (/admin/workflows/patterns)
File: workflows/patterns/page.tsx

Layout:
- Activity patterns library
- Filter by category
- Pattern cards: name, category, SLA, auto-trigger
- Create/Edit pattern
- Enable/Disable patterns

### 14. SLA Configuration (/admin/workflows/sla)
File: workflows/sla/page.tsx

Layout:
- SLA definitions list
- Create/Edit SLA:
  - Name, Entity type, Metric
  - Target value and unit
  - Warning/Critical thresholds
  - Business hours toggle
- Priority mapping

### 15. Notification Rules (/admin/workflows/notifications)
File: workflows/notifications/page.tsx

Layout:
- Notification templates by event type
- Channel configuration (email, push, SMS)
- Recipient rules
- Enable/Disable per notification

---

## Integration Settings:

### 16. Integrations (/admin/integrations)
File: integrations/page.tsx

Layout:
- Integration categories:
  - Job Boards
  - Calendar (Google, Outlook)
  - Email
  - HRIS
  - Background Check
  - Assessment Tools
- Integration cards with status
- Configure button

### 17. Integration Detail (/admin/integrations/[id])
File: integrations/[id]/page.tsx

Layout:
- Integration overview
- Connection status
- Configuration form
- Sync settings
- Logs

### 18. API Settings (/admin/integrations/api)
File: integrations/api/page.tsx

Layout:
- API keys management
- Webhook configuration
- Rate limits
- API documentation link

---

## System Settings:

### 19. Email Settings (/admin/settings/email)
File: settings/email/page.tsx

Layout:
- Email provider configuration
- Default sender
- Email templates list
- Template editor

### 20. Security Settings (/admin/settings/security)
File: settings/security/page.tsx

Layout:
- Password policy
- Session timeout
- 2FA settings
- IP allowlist
- Login restrictions

### 21. Audit Logs (/admin/audit)
File: audit/page.tsx

Layout:
- Audit log table: timestamp, actor, action, entity, changes
- Filters: Date range, Actor, Entity type, Action
- Export audit log
- Retention settings

### 22. System Logs (/admin/logs)
File: logs/page.tsx

Layout:
- Error logs
- API logs
- Job queue status
- Performance metrics

### 23. Data Management (/admin/data)
File: data/page.tsx

Layout:
- Import data (CSV upload)
- Export data (entity selection)
- Data cleanup tools
- Duplicate detection

### 24. Feature Flags (/admin/features)
File: features/page.tsx

Layout:
- Feature flags list
- Enable/Disable toggles
- Rollout percentage
- User segment targeting

## Screen Metadata:
Create metadata in src/lib/metadata/screens/admin/

## Requirements:
- Strict permission checks (admin only)
- Confirmation dialogs for destructive actions
- Audit logging for all changes
- Impersonation with audit trail
- Bulk operations with preview

## Security:
- All admin routes require admin role
- Sensitive actions require re-authentication
- Session tracking
- IP logging

## After Screens:
- Add routes to admin navigation
- Export screen metadata
