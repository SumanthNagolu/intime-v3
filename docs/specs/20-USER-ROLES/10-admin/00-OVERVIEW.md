# Admin Role - Complete Specification

> **Note:** This folder should be renumbered to `04-admin` to avoid conflict with `03-ta`. The naming will be updated in a future cleanup pass.

## Role Overview

The **Admin** is the system administrator role in InTime OS. Admins have full access to all system functionality and data, responsible for user management, pod configuration, system settings, data operations, and overall system health. This is the highest-privilege role in the organization.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `admin` |
| Role Type | System Administrator |
| Reports To | CEO / CTO |
| Primary Entities | Users, Pods, Organizations, System Settings |
| RCAI Default | Can override all ownership, full access to all records |
| Sprint Target | N/A (operational focus) |

---

## Admin Dashboard Screen

### Screen Layout (ASCII)

```
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
| │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │ |
| │ │  12    │ │   8    │ │  15    │ │  98.5% │       │ |
| │ │ Active │ │Pending │ │Failed  │ │ System │       │ |
| │ │Sessions│ │Invites │ │Logins  │ │ Uptime │       │ |
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
```

### Navigation Structure (Mantine v7 AppShell)

The Admin layout uses `<AppShell>` with a collapsible sidebar:

```typescript
// Layout Configuration
<AppShell
  layout="default"
  navbar={{
    width: 260,
    breakpoint: 'sm',
    collapsed: { mobile: !opened, desktop: false }
  }}
  padding="md"
>
```

#### Sidebar Navigation Groups

| Group | Items | Route Prefix |
|-------|-------|--------------|
| **USER MANAGEMENT** | Dashboard, Users, Roles, Pods, Permissions | `/employee/admin/` |
| **SYSTEM** | Settings, Integrations, Workflows, SLA, Email, Features | `/employee/admin/settings/` |
| **DATA** | Data Hub, Audit Logs, System Logs | `/employee/admin/data/` |

### Metrics Grid Specification

| Metric | Data Source | Refresh Rate | Click Action | Color When |
|--------|-------------|--------------|--------------|------------|
| Total Users | `admin.users.count()` | 5 min | → Users List | Always blue |
| Active Users | `admin.users.count(status='active')` | 5 min | → Filter: Active | Green if >90% |
| Inactive Users | `admin.users.count(status='inactive')` | 5 min | → Filter: Inactive | Yellow if >5% |
| Locked Accounts | `admin.users.count(status='locked')` | 1 min | → Filter: Locked | Red if >0 |
| Active Sessions | `admin.sessions.countActive()` | 30 sec | → Session Monitor | Always blue |
| Pending Invitations | `admin.invitations.pending()` | 5 min | → Pending Invites | Yellow if >10 |
| Failed Logins (24h) | `admin.audit.failedLogins(24h)` | 1 min | → Audit Logs | Red if >20 |
| System Uptime | `admin.health.uptime()` | 1 min | → System Logs | Green if >99% |

### Quick Actions Panel

| Action | Button Label | Route | Permission Required |
|--------|--------------|-------|---------------------|
| Add User | `+ Add User` | Modal → `/employee/admin/users/invite` | `users.create` |
| Invite Users | `📧 Invite Users` | Modal → Bulk invite form | `users.invite` |
| Sync HRIS | `🔄 Sync HRIS` | Trigger integration sync | `integrations.sync` |
| Export Data | `⬇️ Export Data` | Modal → Export wizard | `data.export` |
| System Settings | `🔧 System Settings` | `/employee/admin/settings/org` | `settings.update` |

### System Alerts Specification

Alerts display in severity order (Critical → Warning → Info):

| Severity | Icon | Color | Examples |
|----------|------|-------|----------|
| Critical | 🔴 | `red-6` | Integration down, Security breach |
| Warning | 🟡 | `gold-6` | Email timeout, Unusual activity |
| Info | 🔵 | `ocean-6` | Scheduled maintenance, New features |

### Recent Activity Feed

Shows last 10 activities across all users:

| Column | Width | Content |
|--------|-------|---------|
| Time | 60px | Relative time (e.g., "2:42 PM") |
| User | 120px | User email (truncated) |
| Action | 80px | Login, Create, Update, Delete |
| Entity | 100px | Session, User, Job, etc. |
| Status | 40px | ✓ Success, ✗ Failed |

---

## Key Responsibilities

1. **User Management** - Create, edit, deactivate users; assign roles and permissions
2. **Pod Configuration** - Create and manage pods (teams), assign managers and members
3. **System Settings** - Configure organization-wide settings, integrations, security
4. **Data Management** - Import/export data, merge duplicates, bulk operations
5. **Security & Compliance** - Manage SSO, 2FA, audit logs, data retention
6. **System Monitoring** - Monitor system health, user adoption, data quality
7. **Support** - Assist users with permission issues, data recovery, troubleshooting

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| System Uptime | 99.9% | Monthly |
| User Adoption Rate | 90% | Quarterly |
| Data Quality Score | 95% | Weekly |
| Support Ticket Response Time | < 4 hours | Daily |
| Security Incidents | 0 | Monthly |
| Active Users (DAU/MAU) | 80% | Weekly |

---

## Daily Workflow Summary

### Morning (8:00 AM - 9:00 AM)
1. Check system health dashboard
2. Review overnight error logs and alerts
3. Monitor user activity and adoption metrics
4. Check pending user requests (access, permissions)
5. Review data quality reports

### Mid-Morning (9:00 AM - 11:00 AM)
1. Process new user onboarding requests
2. Configure new pods or update existing ones
3. Handle permission escalation requests
4. Review and approve integration changes

### Midday (11:00 AM - 1:00 PM)
1. Bulk data operations (imports, exports)
2. Audit log reviews
3. Security compliance checks

### Afternoon (1:00 PM - 4:00 PM)
1. User support and troubleshooting
2. System configuration updates
3. Data cleanup operations (merge duplicates, archive old data)
4. Prepare reports for leadership

### Late Afternoon (4:00 PM - 5:00 PM)
1. Review day's changes in audit log
2. Plan next day maintenance windows
3. Update documentation
4. Team sync with technical leadership

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Users | ✅ | ✅ All | ✅ All | ✅ All | Full user lifecycle management |
| Pods | ✅ | ✅ All | ✅ All | ✅ All | Create and manage all pods |
| Jobs | ✅ | ✅ All | ✅ All | ✅ All | Can override ownership |
| Candidates | ✅ | ✅ All | ✅ All | ✅ All | Full access to all candidates |
| Submissions | ✅ | ✅ All | ✅ All | ✅ All | Full access to all submissions |
| Interviews | ✅ | ✅ All | ✅ All | ✅ All | Full access |
| Offers | ✅ | ✅ All | ✅ All | ✅ All | Full access |
| Placements | ✅ | ✅ All | ✅ All | ✅ All | Full access |
| Accounts | ✅ | ✅ All | ✅ All | ✅ All | Full access to all accounts |
| Contacts | ✅ | ✅ All | ✅ All | ✅ All | Full access |
| Leads | ✅ | ✅ All | ✅ All | ✅ All | Full access |
| Deals | ✅ | ✅ All | ✅ All | ✅ All | Full access |
| Activities | ✅ | ✅ All | ✅ All | ✅ All | Can view and manage all activities |
| Organizations | ✅ | ✅ All | ✅ All | ❌ | Manage org settings (no delete) |
| Audit Logs | ❌ | ✅ All | ❌ | ❌ | Read-only for compliance |

### Feature Permissions

| Feature | Access |
|---------|--------|
| User Management | ✅ Full |
| Pod Management | ✅ Full |
| Role & Permission Management | ✅ Full |
| System Settings | ✅ Full |
| Integration Settings | ✅ Full |
| Security Settings (SSO, 2FA) | ✅ Full |
| Audit Logs | ✅ Full |
| Data Import/Export | ✅ Full |
| Bulk Operations | ✅ Full |
| Data Merging | ✅ Full |
| Archive Management | ✅ Full |
| Reports (All Data) | ✅ Full |
| Analytics Dashboard | ✅ Full |
| Ownership Reassignment | ✅ Full |
| System Monitoring | ✅ Full |
| Feature Flags | ✅ Full |
| API Access & Keys | ✅ Full |

---

## RCAI Override Capability

Admins have the unique ability to **override RCAI assignments** on any entity:

| Scenario | Admin Capability |
|----------|------------------|
| Reassign Job Ownership | Can change Responsible/Accountable to any user |
| Access Restricted Records | Can view/edit any record regardless of RCAI |
| Delete Protected Data | Can delete data after confirmation (with audit trail) |
| Emergency Access | Can grant temporary elevated permissions |
| Cross-Pod Operations | Can move entities between pods |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Dashboard / Today View
- ✅ Tasks
- ✅ Jobs (All)
- ✅ Candidates (All)
- ✅ Submissions (All)
- ✅ Placements (All)
- ✅ Accounts (All)
- ✅ Contacts (All)
- ✅ Leads (All)
- ✅ Deals (All)
- ✅ Pods (All)
- ✅ Analytics (All Org Data)
- ✅ **Admin Panel** (Unique to Admin)
  - Users
  - Pods
  - Settings
  - Integrations
  - Audit Logs
  - Data Management

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g a` | Go to Admin Panel |
| `g u` | Go to Users |
| `g p` | Go to Pods |
| `g s` | Go to Settings |
| `Cmd+Shift+A` | Quick Add User |
| `Cmd+Shift+P` | Quick Add Pod |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

### User & Pod Management

| Use Case | File | Priority | Status |
|----------|------|----------|--------|
| Manage Users (Legacy) | [01-manage-users.md](./01-manage-users.md) | Low | Deprecated - See 05 |
| Configure Pods | [02-configure-pods.md](./02-configure-pods.md) | High | Active |
| User Management | [05-user-management.md](./05-user-management.md) | High | Active |
| Permission Management | [06-permission-management.md](./06-permission-management.md) | High | Active |

### System Configuration

| Use Case | File | Priority | Status |
|----------|------|----------|--------|
| System Settings | [03-system-settings.md](./03-system-settings.md) | High | Active |
| Workflow Configuration | [09-workflow-configuration.md](./09-workflow-configuration.md) | High | Active |
| Email Templates | [10-email-templates.md](./10-email-templates.md) | High | Active |
| SLA Configuration | [12-sla-configuration.md](./12-sla-configuration.md) | Medium | Active |
| Activity Patterns | [13-activity-patterns.md](./13-activity-patterns.md) | Medium | Active |
| Feature Flags | [14-feature-flags.md](./14-feature-flags.md) | Medium | Active |
| Organization Settings | [15-organization-settings.md](./15-organization-settings.md) | High | Active |

### Data & Integrations

| Use Case | File | Priority | Status |
|----------|------|----------|--------|
| Data Management | [04-data-management.md](./04-data-management.md) | High | Active |
| Integration Management | [07-integration-management.md](./07-integration-management.md) | Medium | Active |
| Audit Logs | [08-audit-logs.md](./08-audit-logs.md) | Medium | Active |
| Emergency Procedures | [11-emergency-procedures.md](./11-emergency-procedures.md) | Critical | Active |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| Admin Dashboard | `/admin` | Full |
| User Management | `/admin/users` | Full (CRUD) |
| User Detail | `/admin/users/[id]` | Full (edit all fields) |
| Pod Management | `/admin/pods` | Full (CRUD) |
| Pod Detail | `/admin/pods/[id]` | Full (edit all fields) |
| System Settings | `/admin/settings` | Full |
| Integrations | `/admin/integrations` | Full |
| Audit Logs | `/admin/audit-logs` | Read-only |
| Data Import/Export | `/admin/data` | Full |
| Security Settings | `/admin/security` | Full |
| Feature Flags | `/admin/features` | Full |
| All Employee Workspaces | `/employee/workspace/*` | Full (all users) |

---

## Security Responsibilities

### Critical Security Tasks

1. **SSO Configuration**
   - Set up SAML/OAuth providers
   - Test authentication flows
   - Monitor failed login attempts

2. **2FA Enforcement**
   - Enable/disable 2FA organization-wide
   - Reset 2FA for locked-out users
   - Track 2FA adoption rates

3. **Access Control**
   - Review and approve elevated permission requests
   - Regular audit of user roles and permissions
   - Deactivate offboarded users within 24 hours

4. **Audit Log Monitoring**
   - Daily review of suspicious activities
   - Track data exports and bulk operations
   - Monitor permission changes

5. **Data Retention**
   - Configure retention policies
   - Schedule archival jobs
   - Manage GDPR compliance requests

---

## Common Admin Operations

### User Lifecycle

| Operation | Frequency | Typical Time |
|-----------|-----------|--------------|
| Create New User | Daily | 2-3 minutes |
| Assign to Pod | Daily | 1 minute |
| Update Permissions | Weekly | 2 minutes |
| Reset Password | Weekly | 30 seconds |
| Deactivate User | Monthly | 1 minute |

### Pod Management

| Operation | Frequency | Typical Time |
|-----------|-----------|--------------|
| Create New Pod | Monthly | 5 minutes |
| Assign Manager | Monthly | 1 minute |
| Add IC to Pod | Weekly | 1 minute |
| Update Sprint Targets | Bi-weekly | 2 minutes |
| Dissolve Pod | Quarterly | 10 minutes |

### Data Operations

| Operation | Frequency | Typical Time |
|-----------|-----------|--------------|
| Import Candidates (CSV) | Monthly | 10 minutes (100 records) |
| Export Jobs | Weekly | 2 minutes |
| Merge Duplicate Candidates | Weekly | 3 minutes each |
| Bulk Reassign Ownership | Monthly | 5 minutes |
| Archive Old Data | Quarterly | 15 minutes |

---

## Training Requirements

Before granting Admin access, a user should:

1. **System Architecture Training** (2 hours)
   - Data model overview
   - RCAI ownership model
   - Pod structure and hierarchy

2. **User Management Training** (2 hours)
   - User lifecycle management
   - Role and permission assignment
   - Password reset and 2FA recovery

3. **Pod Management Training** (1 hour)
   - Creating and configuring pods
   - Assigning managers and ICs
   - Sprint target setting

4. **Security & Compliance Training** (3 hours)
   - SSO and 2FA setup
   - Audit log monitoring
   - Data retention policies
   - GDPR compliance procedures

5. **Data Management Training** (2 hours)
   - Import/export procedures
   - Deduplication workflows
   - Bulk operations best practices

6. **Emergency Procedures** (1 hour)
   - User lockout recovery
   - Data recovery procedures
   - Incident response protocols

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| User can't login | Check if user is active, reset password, verify email |
| User can't see job | Check RCAI assignment, add user as Consulted or Informed |
| Permission denied error | Review user's role, add specific permission if needed |
| Duplicate candidates in system | Use Data Management → Merge Duplicates tool |
| Pod members can't see each other's work | Check pod configuration, verify pod_id assignment |
| Integration not working | Check API keys, test connection, review error logs |
| Slow system performance | Check active user count, review database queries |
| Data export failed | Check file size limits, verify user permissions |

---

## Emergency Procedures

### User Lockout
1. Navigate to Admin → Users
2. Search for user
3. Click "Reset Password"
4. Send reset link to verified email
5. If 2FA locked: Click "Reset 2FA"

### Data Recovery
1. Check Audit Logs for deletion timestamp
2. If < 30 days: Navigate to Admin → Data → Archived
3. Search for deleted record
4. Click "Restore"
5. Verify restoration with user

### Security Incident
1. Immediately change affected user passwords
2. Enable 2FA organization-wide if not already
3. Review Audit Logs for suspicious activity
4. Export audit trail for incident report
5. Notify CTO/CEO
6. Document incident and response

---

## Best Practices

### Daily Operations
- ✅ Check audit logs every morning for anomalies
- ✅ Process user access requests within 4 hours
- ✅ Monitor system health dashboard throughout day
- ✅ Document all configuration changes

### Weekly Operations
- ✅ Review and clean up duplicate records
- ✅ Audit user permissions and roles
- ✅ Check data quality metrics
- ✅ Test backup and recovery procedures

### Monthly Operations
- ✅ Full audit of all user accounts
- ✅ Review and optimize pod structures
- ✅ Archive inactive data
- ✅ Update documentation
- ✅ Test disaster recovery plan

---

## Escalation Paths

| Issue Type | Escalate To | When |
|------------|-------------|------|
| Technical Issues | Engineering Team | System errors, bugs, performance issues |
| Security Incidents | CTO + CEO | Unauthorized access, data breach |
| Compliance Questions | Legal Team | GDPR, data retention, audit requests |
| User Disputes | HR Manager | Ownership conflicts, access disputes |
| Feature Requests | Product Team | New functionality needs |

---

## System Health Monitoring

### Key Metrics to Monitor

| Metric | Healthy Range | Alert Threshold |
|--------|---------------|-----------------|
| Active Users (DAU) | 80%+ of total users | < 70% |
| API Response Time | < 200ms average | > 500ms |
| Error Rate | < 0.1% | > 1% |
| Database CPU | < 60% | > 80% |
| Storage Usage | < 70% | > 85% |
| Failed Login Attempts | < 5/hour | > 20/hour |

---

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-DASH-001 | View dashboard metrics | Admin logged in | Navigate to /employee/admin/dashboard | All 8 metrics load within 2s |
| ADMIN-DASH-002 | Metrics refresh automatically | On dashboard | Wait 5 minutes | User count metrics refresh |
| ADMIN-DASH-003 | Quick Action - Add User | On dashboard | Click "+ Add User" | User creation modal opens |
| ADMIN-DASH-004 | Alert severity ordering | Alerts exist | View alert panel | Critical alerts shown first |
| ADMIN-DASH-005 | Click metric to filter | On dashboard | Click "Locked Accounts" | Navigate to users with locked filter |
| ADMIN-DASH-006 | Recent activity updates | On dashboard | Another admin makes change | Activity appears within 30s |
| ADMIN-DASH-007 | Navigation sidebar | On any admin page | Check sidebar | All groups visible and clickable |
| ADMIN-DASH-008 | Keyboard navigation | On dashboard | Press `g u` | Navigate to Users list |
| ADMIN-DASH-009 | Permission restriction | Non-admin logged in | Try /employee/admin/dashboard | Redirect to unauthorized page |
| ADMIN-DASH-010 | Mobile responsive | On mobile device | View dashboard | Sidebar collapses, metrics stack |

---

## Database Schema Reference

```sql
-- Admin Dashboard Metrics Query Examples
-- Total Users
SELECT COUNT(*) FROM users WHERE org_id = current_org_id;

-- Active Users
SELECT COUNT(*) FROM users WHERE org_id = current_org_id AND status = 'active';

-- Active Sessions
SELECT COUNT(*) FROM sessions
WHERE org_id = current_org_id
  AND expires_at > NOW()
  AND revoked_at IS NULL;

-- Failed Logins (24h)
SELECT COUNT(*) FROM audit_logs
WHERE org_id = current_org_id
  AND action = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours';

-- System Uptime (from health_checks table)
SELECT
  (COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 / COUNT(*)) as uptime_percent
FROM health_checks
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## UI Component Reference (Mantine v7)

| Context | Component | Props |
|---------|-----------|-------|
| Metrics Card | `<Paper p="md" withBorder>` | shadow="xs", radius="md" |
| Metric Value | `<Text size="xl" fw={700}>` | c="brand.6" for positive |
| Alert Item | `<Alert>` | color="yellow", icon={IconAlertTriangle} |
| Quick Action | `<Button variant="light">` | leftSection={Icon} |
| Activity Row | `<Table.Tr>` | Hover state for clickable |
| Sidebar Nav | `<NavLink>` | Within AppShell.Navbar |

---

## Field Specifications

### Dashboard Filter Fields

**Field Specification: Date Range Filter**

| Property | Value |
|----------|-------|
| Field Name | `dateRange` |
| Type | DateRangePicker |
| Required | No |
| Default | Last 7 days |
| Options | Today, Yesterday, Last 7 days, Last 30 days, This month, Custom |
| Validation | End date must be >= Start date |
| Error Messages | |
| - Invalid Range | "End date must be after start date" |
| - Future Date | "Cannot select future dates" |

**Field Specification: User Type Filter**

| Property | Value |
|----------|-------|
| Field Name | `userType` |
| Type | MultiSelect |
| Required | No |
| Default | All |
| Options | Active, Inactive, Locked, Pending Invitation |
| Validation | At least one option if filtering |
| Error Messages | |
| - None Selected | "Select at least one user type to filter" |

**Field Specification: Role Filter**

| Property | Value |
|----------|-------|
| Field Name | `roleFilter` |
| Type | MultiSelect (searchable) |
| Required | No |
| Default | All Roles |
| Options | Dynamic from `roles` table |
| Validation | Valid role IDs |
| Error Messages | |
| - Invalid Role | "One or more selected roles no longer exist" |

**Field Specification: Pod Filter**

| Property | Value |
|----------|-------|
| Field Name | `podFilter` |
| Type | MultiSelect (searchable) |
| Required | No |
| Default | All Pods |
| Options | Dynamic from `pods` table |
| Validation | Valid pod IDs |
| Error Messages | |
| - Invalid Pod | "One or more selected pods no longer exist" |

**Field Specification: Search Input**

| Property | Value |
|----------|-------|
| Field Name | `searchQuery` |
| Type | TextInput with search icon |
| Required | No |
| Placeholder | "Search users, pods, settings..." |
| Max Length | 100 characters |
| Debounce | 300ms |
| Validation | Alphanumeric, spaces, @, ., - |
| Error Messages | |
| - Too Long | "Search query cannot exceed 100 characters" |
| - Invalid Characters | "Search contains invalid characters" |

**Field Specification: Alert Severity Filter**

| Property | Value |
|----------|-------|
| Field Name | `alertSeverity` |
| Type | SegmentedControl |
| Required | No |
| Default | All |
| Options | All, Critical, Warning, Info |
| Validation | None |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Dashboard load failed | API timeout | "Unable to load dashboard. Please refresh the page." | Click refresh or wait and retry |
| Metrics unavailable | Database connection issue | "Some metrics are temporarily unavailable" | Partial dashboard shown, auto-retry in 30s |
| User count mismatch | Data sync delay | "User counts may be slightly delayed" | Info banner, resolves automatically |
| Session expired | Token expired | "Your session has expired. Please log in again." | Redirect to login |
| Permission denied | Non-admin access | "You don't have permission to view this dashboard" | Redirect to appropriate dashboard |
| Filter error | Invalid filter combination | "Unable to apply filters. Please try again." | Reset filters to defaults |
| Export failed | Too much data | "Export failed. Try narrowing your date range." | Reduce data scope |
| Real-time updates paused | WebSocket disconnected | "Live updates paused. Reconnecting..." | Auto-reconnect with backoff |
| Quick action failed | Backend error | "Action failed: [specific error]. Please try again." | Retry or contact support |
| Alert dismiss failed | Concurrent modification | "Unable to dismiss alert. It may have been updated." | Refresh and retry |

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-11-30 | Initial documentation |
| 2.0 | 2025-12-03 | Added dashboard wireframe, metrics grid, navigation spec, quick actions, alerts, test cases |
| 2.1 | 2025-12-04 | Added field specifications for dashboard filters, error scenarios table |

---

*Last Updated: 2025-12-04*
