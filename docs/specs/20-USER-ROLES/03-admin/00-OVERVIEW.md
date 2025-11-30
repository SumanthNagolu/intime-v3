# Admin Role - Complete Specification

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

| Use Case | File | Priority |
|----------|------|----------|
| Manage Users | [01-manage-users.md](./01-manage-users.md) | High |
| Configure Pods | [02-configure-pods.md](./02-configure-pods.md) | High |
| System Settings | [03-system-settings.md](./03-system-settings.md) | High |
| Data Management | [04-data-management.md](./04-data-management.md) | Medium |

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

*Last Updated: 2024-11-30*
