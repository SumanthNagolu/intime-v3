# Epic 01: Admin Portal - Research Summary

**Created:** 2025-12-04
**Status:** Research Complete
**Source:** `/docs/specs/20-USER-ROLES/10-admin/`

---

## Overview

The InTime OS Admin Portal is a comprehensive system administration interface that enables system administrators to manage all aspects of the platform including users, permissions, pods, integrations, workflows, and system settings.

### Key Actors
- **Primary:** System Administrator (Admin)
- **Secondary:** IT Support, Compliance Officers

### Access Requirements
- Full system access across all modules
- Organization-level data scope
- All features enabled

---

## Functional Areas Summary

### 1. Admin Dashboard & Overview (UC-ADMIN-001)
**Source:** `00-OVERVIEW.md` (~737 lines)

**Purpose:** Central hub for system administration with quick access to all admin functions.

**Key Features:**
- System health dashboard with metrics
- Quick action tiles for common tasks
- Critical alerts and notifications
- User activity summary
- Integration status overview
- Navigation to all admin modules

**UI Components:**
- AppShell with admin navigation
- Paper components for metric cards
- Alert banners for critical issues
- Quick action buttons

---

### 2. Pod Management (UC-ADMIN-002)
**Source:** `02-configure-pods.md`

**Purpose:** Create and manage organizational pods (teams) with managers, members, and regional assignments.

**Key Features:**
- Create/edit/deactivate pods
- Assign pod managers
- Add/remove pod members (ICs)
- Configure regional assignments (US/Canada)
- Pod hierarchy visualization
- Activity tracking per pod
- Performance metrics by pod

**Database Tables:**
- `pods` - Pod definitions
- `pod_members` - Pod membership assignments
- `pod_managers` - Manager assignments

**Test Cases:** ADMIN-POD-001 through ADMIN-POD-015

---

### 3. System Settings (UC-ADMIN-003)
**Source:** `03-system-settings.md`

**Purpose:** Configure global system settings affecting all users and modules.

**Key Features:**
- General settings (timezone, date format, currency)
- Security settings (password policy, session timeout, 2FA)
- Email settings (global from address, bounce handling)
- File upload settings (max size, allowed types)
- API settings (rate limits, versioning)
- Notification settings (default channels)
- Maintenance mode toggle

**Test Cases:** ADMIN-SYS-001 through ADMIN-SYS-015

---

### 4. Data Management (UC-ADMIN-004)
**Source:** `04-data-management.md`

**Purpose:** Import, export, archive, and manage data across the system.

**Key Features:**
- Data import (CSV, Excel, JSON)
- Field mapping wizard
- Data export (filtered, full)
- Data archival (soft delete)
- Data restoration
- Duplicate detection and merge
- Bulk operations (update, delete)
- Data retention policies
- GDPR compliance tools (data subject requests)

**Test Cases:** ADMIN-DATA-001 through ADMIN-DATA-015

---

### 5. User Management (UC-ADMIN-005)
**Source:** `05-user-management.md`

**Purpose:** Manage user accounts, roles, and access across the organization.

**Key Features:**
- Create/edit/deactivate users
- Role assignment
- Pod assignment
- SSO configuration
- Password management (reset, force change)
- User activity monitoring
- Bulk user import
- User search and filtering
- Account status management (active, suspended, deactivated)

**Database Tables:**
- `user_profiles` - User account data
- `user_roles` - Role assignments
- `user_sessions` - Active sessions

**Test Cases:** ADMIN-USER-001 through ADMIN-USER-015

---

### 6. Permission Management (UC-ADMIN-006)
**Source:** `06-permission-management.md` (1,096 lines)

**Purpose:** Configure RBAC, data scopes, feature flags, and custom permission overrides.

**Key Features:**
- Permission matrix by role (CRUD + Approve per object type)
- Data scope configuration (Own, Team, Region, Organization)
- Feature flag management
- Custom permission overrides (temporary/permanent)
- Permission testing tool ("test as user")
- Role comparison view
- Bulk permission updates
- Permission audit trail
- API token management

**Permission Model Layers:**
1. Role-Based Access Control (RBAC) - Base permissions
2. Data Scope - Visibility limits
3. RACI Assignments - Object-level access
4. Feature Flags - Enable/disable features
5. Custom Overrides - Exceptions

**Database Tables:**
- `roles` - Role definitions
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mappings
- `permission_overrides` - Custom overrides
- `feature_flags` - Feature definitions
- `feature_flag_roles` - Feature-role mappings

**Test Cases:** ADMIN-PRM-001 through ADMIN-PRM-015

---

### 7. Integration Management (UC-ADMIN-007)
**Source:** `07-integration-management.md` (1,052 lines)

**Purpose:** Manage external integrations including configuration, monitoring, and troubleshooting.

**Integration Categories:**

| Category | Providers |
|----------|-----------|
| Email (SMTP) | SendGrid, AWS SES |
| Calendar | Google Calendar, Outlook |
| Storage | AWS S3 |
| Background Checks | Checkr |
| Job Boards | Indeed, LinkedIn, Dice |
| HRIS | BambooHR, Workday |
| Payroll | ADP, Paychex |
| SMS | Twilio |
| Video | Zoom, Teams |
| SSO | Okta, Auth0 |

**Key Features:**
- Integration dashboard with health overview
- Configure connection settings
- OAuth 2.0 flow management
- Webhook configuration and debugging
- API access monitoring
- Error retry configuration (exponential backoff)
- Dead Letter Queue for failed events
- Integration logs viewer
- Fallback/backup provider support

**Database Tables:**
- `integrations` - Integration configurations
- `oauth_tokens` - OAuth token storage
- `webhooks` - Webhook definitions
- `webhook_deliveries` - Delivery history
- `webhook_dlq` - Dead Letter Queue

**Test Cases:** ADMIN-INT-001 through ADMIN-INT-015

---

### 8. Audit Logs (UC-ADMIN-008)
**Source:** `08-audit-logs.md` (1,016 lines)

**Purpose:** Comprehensive logging for security, compliance, and forensic investigation.

**What Gets Logged:**
- Authentication events (login, logout, failed attempts)
- Data changes (create, update, delete with before/after)
- Permission changes
- Security events (suspicious activity, API access)
- System events (config changes, integrations)

**Key Features:**
- Audit log dashboard with security overview
- Advanced filtering and search
- Security investigation workflow
- GDPR compliance reporting (DSAR, Right to Erasure)
- Retention policies (hot/cold storage)
- Security alerting rules
- Forensic investigation templates
- Log export (CSV, JSON, SIEM/CEF)
- Real-time log streaming (WebSocket)

**Retention Policies:**
- Auth logs: 90 days hot, 1 year cold
- Data changes: 7 years
- Security events: 1 year

**Database Tables:**
- `audit_events` - Main audit log
- `security_alerts` - Security alert records
- `alert_rules` - Alert rule definitions

**Test Cases:** ADMIN-AUD-001 through ADMIN-AUD-015

---

### 9. Workflow Configuration (UC-ADMIN-009)
**Source:** `09-workflow-configuration.md` (1,029 lines)

**Purpose:** Create and manage automated workflows including approval chains, status automation, and notifications.

**Workflow Types:**
| Type | Description |
|------|-------------|
| Approval Chain | Multi-step approval workflows |
| Status Automation | Auto-update status based on conditions |
| Notification Trigger | Send notifications on events |
| SLA Escalation | Escalate when SLA breached |
| Field Automation | Auto-populate/calculate fields |
| Assignment Rules | Auto-assign based on criteria |
| Webhook Trigger | Call external services |
| Scheduled Task | Time-based automation |

**Key Features:**
- Visual workflow builder
- Trigger condition configuration
- Action configuration (approve, reject, notify, update)
- Approval step configuration with timeouts
- Escalation rules
- Test/dry run capability
- Workflow activation/deactivation
- Execution history and debugging
- Apply to existing records option

**Condition Operators:**
- eq, neq, contains, gt, lt, between
- is_empty, changed, changed_to, has_rel

**Database Tables:**
- `workflows` - Workflow definitions
- `workflow_steps` - Workflow steps
- `workflow_actions` - Step actions
- `workflow_executions` - Execution history
- `workflow_approvals` - Approval records

**Test Cases:** ADMIN-WF-001 through ADMIN-WF-015

---

### 10. Email Templates (UC-ADMIN-010)
**Source:** `10-email-templates.md` (893 lines)

**Purpose:** Create and manage email templates with variable substitution and versioning.

**Template Categories:**
| Category | Examples |
|----------|----------|
| User | Welcome, Password Reset, Account Activation |
| Candidate | Interview Invitation, Offer Letter |
| Client | Job Posted Confirmation |
| Internal | Approval Request, Reminder |
| System | Error Notification, Alert |
| Marketing | Newsletter, Promotion |

**Key Features:**
- Rich text editor (Visual/HTML/Plain Text modes)
- Variable reference with autocomplete
- Preview functionality (desktop/mobile/dark mode)
- Send test email capability
- Template versioning
- Template archival
- Unsubscribe link enforcement for marketing
- Sender configuration

**Variable Categories:**
- User: first_name, last_name, email
- Company: company_name, logo_url
- Employment: start_date, manager_name
- Links: password_setup_link, unsubscribe_link
- Entity: candidate.name, job.title
- System: current_date, current_year

**Database Tables:**
- `email_templates` - Template storage
- `email_sends` - Send history
- `email_senders` - Sender configurations

**Test Cases:** ADMIN-EMAIL-001 through ADMIN-EMAIL-015

---

### 11. Emergency Procedures (UC-ADMIN-011)
**Source:** `11-emergency-procedures.md` (~810 lines)

**Purpose:** Handle system emergencies including incidents, break-glass access, and disaster recovery.

**Priority Classifications:**
| Priority | Response Time | Example |
|----------|--------------|---------|
| P0 - Critical | 15 min | System outage, data breach |
| P1 - High | 1 hour | Major feature failure |
| P2 - Medium | 4 hours | Non-critical feature issue |
| P3 - Low | 24 hours | Minor bug |

**Key Features:**
- Incident creation and tracking
- Break-glass access (emergency elevated permissions)
- Incident commander assignment
- Communication templates
- Post-mortem workflow
- Disaster recovery procedures
- Backup restoration
- Emergency contact list
- Runbook library

**Test Cases:** ADMIN-EMERG-001 through ADMIN-EMERG-015

---

### 12. SLA Configuration (UC-ADMIN-012)
**Source:** `12-sla-configuration.md` (~970 lines)

**Purpose:** Define and monitor Service Level Agreements for various entity types.

**SLA Types:**
- Job response time (time to first submission)
- Interview scheduling (time to schedule)
- Offer turnaround (time to extend offer)
- Client communication (response time)
- Internal tasks (completion time)

**Key Features:**
- SLA rule definition
- Escalation level configuration (warning, breach)
- SLA monitoring dashboard
- Breach notifications
- SLA reporting and analytics
- Custom SLA per client/entity
- Business hours configuration
- Holiday calendar support

**Escalation Levels:**
- Warning (e.g., 80% of time elapsed)
- Breach (100% of time elapsed)
- Critical (150% - still unresolved)

**Database Tables:**
- `sla_rules` - SLA definitions
- `sla_metrics` - SLA measurements
- `sla_escalations` - Escalation history

**Test Cases:** ADMIN-SLA-001 through ADMIN-SLA-015

---

### 13. Activity Patterns (UC-ADMIN-013)
**Source:** `13-activity-patterns.md` (~931 lines)

**Purpose:** Configure activity tracking patterns and gamification elements.

**Activity Types:**
| Category | Activities |
|----------|------------|
| Recruiting | Job created, submission made, interview scheduled |
| Bench Sales | Consultant marketed, job order created |
| CRM | Lead captured, deal advanced |
| HR | Onboarding completed, review submitted |

**Key Features:**
- Activity pattern configuration
- Points system configuration
- Auto-logging rules
- Activity triggers and actions
- Leaderboard configuration
- Achievement/badge definitions
- Activity feed configuration
- Activity analytics

**Points System:**
- Configurable points per activity type
- Bonus points for speed/quality
- Weekly/monthly targets
- Team vs individual tracking

**Database Tables:**
- `activity_patterns` - Pattern definitions
- `activity_points` - Point rules
- `activities` - Activity log
- `achievements` - Badge/achievement definitions

**Test Cases:** ADMIN-ACT-001 through ADMIN-ACT-015

---

### 14. Feature Flags (UC-ADMIN-014)
**Source:** `14-feature-flags.md` (~815 lines)

**Purpose:** Control feature rollout and A/B testing across the platform.

**Flag Types:**
| Type | Description |
|------|-------------|
| Boolean | Simple on/off |
| Percentage | Gradual rollout (10%, 50%, 100%) |
| User List | Specific users |
| Role-based | By user role |
| Time-based | Scheduled enable/disable |

**Key Features:**
- Feature flag creation and management
- Rollout strategies (percentage, role, user)
- Override by user/environment
- Kill switch (instant disable)
- Flag dependencies
- Flag expiration/cleanup
- Usage analytics
- A/B test configuration
- Remote configuration

**Rollout Strategies:**
- Canary (small percentage first)
- Beta (specific user group)
- Role-based (managers first)
- Geographic (region by region)
- Full rollout (100%)

**Database Tables:**
- `feature_flags` - Flag definitions
- `feature_flag_rules` - Rollout rules
- `feature_flag_overrides` - User/org overrides

**Test Cases:** ADMIN-FF-001 through ADMIN-FF-015

---

### 15. Organization Settings (UC-ADMIN-015)
**Source:** `15-organization-settings.md` (~965 lines)

**Purpose:** Configure organization-specific settings including branding, localization, and business rules.

**Settings Categories:**
1. **General** - Company info, logo, timezone
2. **Branding** - Colors, logo, email footer
3. **Localization** - Language, date format, currency
4. **Business Rules** - Approval thresholds, defaults
5. **Compliance** - GDPR, data retention
6. **Billing** - Plan, usage, invoices
7. **White Label** - Custom domain, theming

**Key Features:**
- Organization profile management
- Custom branding/theming
- Multi-language support
- Currency configuration
- Tax settings
- Business rule configuration
- Compliance settings
- Subscription management
- Usage monitoring

**Database Tables:**
- `organizations` - Org profile
- `organization_settings` - Settings key-value store
- `organization_branding` - Branding assets

**Test Cases:** ADMIN-ORG-001 through ADMIN-ORG-015

---

## Cross-Cutting Concerns

### UI Framework
- **Mantine v7** components throughout
- AppShell, Paper, Modal, Tabs, Stepper
- RichTextEditor for email templates
- DataTable for lists with pagination/filtering

### Database Patterns
- PostgreSQL with UUID primary keys
- JSONB for flexible configuration
- `organization_id` scoping on all tables
- Soft deletes with `deleted_at`
- Audit columns: `created_at`, `updated_at`, `created_by`, `updated_by`

### API Patterns
- TypeScript async/await
- Event-driven architecture via `eventBus.publish()`
- Cache invalidation after mutations
- Audit logging on all admin operations

### Security
- Permission checks on all operations
- Audit trail for compliance
- Encrypted credential storage
- Rate limiting on APIs

---

## User Story Breakdown Strategy

Each functional area will be broken into 3-5 user stories, targeting:
- **Under 80K context** per story
- **Atomic scope** - implementable independently
- **Clear acceptance criteria** from test cases
- **Database schema** included when relevant

### Story Structure Template
1. Overview & Context
2. User Story Statement
3. Acceptance Criteria (from test cases)
4. UI/UX Requirements
5. Database Schema (if applicable)
6. API Endpoints
7. Technical Implementation Notes

---

## File Manifest

User stories will be created in the following structure:

```
/thoughts/shared/epics/epic-01-admin/
├── 00-admin-research-summary.md (this file)
├── 01-admin-dashboard.md
├── 02-pod-management.md
├── 03-user-management.md
├── 04-permission-management.md
├── 05-system-organization-settings.md
├── 06-data-management.md
├── 07-integration-management.md
├── 08-audit-logs-security.md
├── 09-workflow-configuration.md
├── 10-email-templates.md
├── 11-sla-configuration.md
├── 12-activity-patterns.md
├── 13-feature-flags.md
├── 14-emergency-procedures.md
└── 99-epic-summary.md
```

---

## Next Steps

1. Create individual user story files (01-14)
2. Create epic summary file (99)
3. Review for completeness and implementability
