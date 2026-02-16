# InTime Admin Operations & System Management SOP

**Document Version:** 1.0
**Last Updated:** February 2026
**Owner:** System Administrator
**Team:** Phase 1 Operations (16 people)

---

## Table of Contents

1. [User Management](#user-management)
2. [Organization Settings](#organization-settings)
3. [Security & Compliance](#security--compliance)
4. [Integration Management](#integration-management)
5. [Data Management](#data-management)
6. [Workflow Automation](#workflow-automation)
7. [System Health](#system-health)

---

## 1. User Management

### 1.1 Adding New Employees

**Purpose:** Establish system access and permissions for new team members
**Owner:** System Administrator / HR Manager
**Trigger:** Employee offer acceptance or hire date confirmation
**SLA:** Complete within 24 hours before start date

#### Step-by-Step Process

1. **Receive onboarding request** from HR with employee details:
   - Full name, email, phone, role, reporting manager, start date
   - Department/team assignment
   - Budget cost center

2. **Create platform account:**
   - Access InTime Admin Dashboard → User Management → Add New User
   - Enter: name, email, date of birth, phone, address
   - Set initial temporary password (12+ characters, mixed case + numbers)
   - Assign role from dropdown: Admin, Manager, Recruiter, Intern, Read-only
   - Select team/pod assignment
   - Set time zone: Asia/Kolkata (default for Hyderabad-based staff)

3. **Configure role-based permissions:**
   - **Admin:** Full system access, user management, organization settings, reporting
   - **Manager (Training Lead, Screening Lead, etc.):** Team viewing, candidate management, team reports, limited admin settings
   - **Recruiter (BDM, Recruiting Lead, Bench Lead, Delivery Manager):** Candidate sourcing, client management, job posting, communication
   - **Intern:** Limited candidate viewing, basic sourcing, task execution, no client/sensitive data access
   - **Read-only:** Dashboard and report viewing only

4. **Grant tool access:**
   - **Email:** Provision in Google Workspace or Outlook (if applicable)
   - **Slack:** Add to InTime workspace, assign to #general and team channels
   - **Job boards:** Add credentials for Dice, Monster, CareerBuilder, LinkedIn, Indeed (if recruiter role)
   - **ATS/Platform:** Activate license in InTime platform
   - **Other tools:** Jira (if PM role), Google Drive (shared team folder), VMS portals

5. **Send welcome communication:**
   - Email with platform login credentials, first login link (expires in 48 hours)
   - Slack welcome message with quick start resources
   - Calendar invite for 1:1 orientation with manager
   - Document: "Platform User Guide" and role-specific job aids

6. **Document in HR system:**
   - Record creation date, assigned role, manager, team in HR module
   - Mark onboarding tasks complete
   - Set 30-day check-in reminder

**Tools Used:** InTime Admin Dashboard, Google Workspace/Outlook, Slack, HRIS
**Escalation:** If account creation fails, escalate to system support; if role unclear, escalate to manager/HR Lead

---

### 1.2 Employee Departure

**Purpose:** Secure data and revoke access upon employee exit
**Owner:** System Administrator
**Trigger:** Resignation notice, termination decision, or final day notification from HR
**SLA:** Complete by end of day on final day (or earlier for involuntary departure)

#### Access Revocation Checklist

- [ ] Disable InTime platform account (login still works but no permissions)
- [ ] Remove from Slack workspace (preserve message history)
- [ ] Revoke email access (forward to manager or designated recipient)
- [ ] Revoke VPN/remote access credentials
- [ ] Revoke all job board accounts (Dice, Monster, CareerBuilder, LinkedIn, Indeed)
- [ ] Remove from shared Google Drive folders and shared calendars
- [ ] Recover company devices: laptop, phone, access cards
- [ ] Deactivate API tokens or integration keys (if applicable)
- [ ] Remove from VMS/MSP portal access
- [ ] Disable MFA device (phone authenticator, hardware token)

#### Data Backup & Archival

1. **Export candidate records:** If employee owns candidate list, export to CSV via Admin → Data Export
2. **Archive email:** Forward to designated inbox or HR for retention (7-year compliance)
3. **Document transfer:** Ensure all work in progress transferred to new owner
4. **Client relationships:** Notify relevant clients of change if account manager
5. **Recruit relationships:** Transfer candidate pipeline to new recruiter or hold in pool

#### License Recovery

- Remove from InTime platform licensing (frees seat for new hire)
- Cancel individual job board subscriptions (if personal license)
- Remove from Slack paid license tier (if applicable)
- Cancel email license or convert to archive-only

#### Final Steps

- Move employee record to "Inactive" status in HR system
- Document departure reason, final day, access revocation completion date
- Run audit to confirm all access disabled (check system logs)
- Archive employee folder in Google Drive

**Tools Used:** InTime Admin Dashboard, Google Workspace, Slack Admin, HRIS
**Escalation:** If data loss suspected, escalate to backup/recovery team immediately

---

### 1.3 Role Changes & Permission Updates

**Purpose:** Update system access when employee's role or team changes
**Owner:** System Administrator / Manager
**Trigger:** Promotion, transfer, or role change approval from HR/Manager
**SLA:** Update within 24 hours of role change effective date

#### Process

1. **Receive role change notification** from HR with:
   - Employee name, effective date
   - New role, new team/reporting manager
   - Specific permission changes needed
   - Any access to revoke

2. **Update role in platform:**
   - InTime Admin Dashboard → User Management → Search employee
   - Update "Role" dropdown to new role
   - Update "Manager" and "Team" fields if applicable
   - Review permission matrix and adjust if needed

3. **Add/remove tool access:**
   - If promoted to Manager: grant team reports, activity monitoring access
   - If promoted to Recruiter: grant client management, job posting access
   - If moved to different team: update shared drive access, Slack channel membership
   - Remove old team access if moving teams (e.g., remove from Bench Lead's reports)

4. **Update organization structure:**
   - If manager-level change, update organizational chart
   - If team change, update cost center/budget allocation

5. **Communicate change:**
   - Notify employee via email/Slack of new role and any access changes
   - Notify new manager and old manager
   - Update team directory

6. **Document in HR system:**
   - Record role change date, old role, new role
   - Retain audit trail for compliance

**Tools Used:** InTime Admin Dashboard, Google Workspace, Slack
**Escalation:** If permissions unclear, escalate to role owner (Manager, HR Lead)

---

### 1.4 API Access Management for Integrations

**Purpose:** Control programmatic access to InTime platform for third-party integrations
**Owner:** System Administrator / Integration Manager
**Trigger:** New integration request, regular access review, security incident
**SLA:** API key creation within 48 hours; quarterly access review

#### Process

1. **Receive integration request:**
   - Integration name, purpose, required endpoints
   - Owner/responsible party
   - Security classification (public, confidential, sensitive)

2. **Create API credentials:**
   - InTime Admin Dashboard → Integrations → API Keys
   - Click "Generate New Key"
   - Name key descriptively (e.g., "Dice_Job_Board_Sync", "Payroll_Integration_Guidepoint")
   - Select scopes: candidate read, candidate write, job posting, client management, reporting (select minimum required)
   - Set expiration date (recommend 12 months)
   - Copy secret key (displayed once only) and store in secure vault

3. **Document API access:**
   - Integration name, purpose, key name
   - Assigned scopes
   - Creation date, expiration date
   - Owner contact
   - IP whitelist (if applicable)

4. **Provide to integration owner:**
   - Share via secure method (1Password, encrypted email, or in-person)
   - Include: API endpoint documentation, authentication method
   - Include: rate limits, retry logic, error handling guide
   - Set up callback webhook for integration health monitoring

5. **Monitor API usage:**
   - Weekly review of API call logs: volume, errors, slow requests
   - Alert if usage spikes unexpectedly (sign of misuse or bug)
   - Alert if integration fails for 4+ consecutive hours

6. **Quarterly access review:**
   - Audit all active API keys
   - Verify owner still employed and needs access
   - Rotate keys that are 12+ months old
   - Revoke unused keys

#### API Key Revocation

- **Immediate:** Security incident, suspected breach, employee departure
- **Scheduled:** Key expiration date reached, integration no longer needed
- Steps: InTime Admin Dashboard → Integrations → Revoke Key → confirm

**Tools Used:** InTime Admin Dashboard, 1Password (secure vault), monitoring logs
**SLA for revocation:** 30 minutes (security incident) or scheduled expiration date
**Escalation:** If integration breaks due to revocation, notify integration owner immediately

---

## 2. Organization Settings

### 2.1 Company Configuration

**Purpose:** Establish foundational organization structure and branding
**Owner:** System Administrator / Admin Lead
**Trigger:** System implementation, organizational change, brand refresh
**SLA:** Configuration complete before team launch; updates within 5 business days

#### Process

1. **Access Organization Settings:**
   - InTime Admin Dashboard → Organization → Company Settings

2. **Configure business entity:**
   - Company legal name: "InTime Staffing Solutions Pvt Ltd"
   - Business type: IT Staffing / Recruitment
   - Headquarters: Hyderabad, India
   - Tax ID (PAN), CIN, ESI registration
   - Industry: IT Staffing & Staffing Services

3. **Set branding:**
   - Upload company logo (min 500x500px)
   - Set primary brand color (hex code)
   - Configure email signature template with company details
   - Set default footer text on reports

4. **Configure time zones & localization:**
   - Default time zone: Asia/Kolkata (UTC+5:30)
   - Date format: DD/MM/YYYY (India standard)
   - Currency: INR (Indian Rupee) for internal operations, USD for client billing
   - Language: English (US/UK dialect options available)

5. **Set compliance defaults:**
   - Compliance jurisdiction: India (labor laws, data protection)
   - Document retention period: 7 years (India statutory requirement)
   - Data residency: India (for candidate/employee data)

6. **Configure system behavior:**
   - Fiscal year start date: 01/04 (India FY) or 01/01 (calendar year)
   - Workweek: Monday–Friday (India standard)
   - Public holidays: Load India national holidays + regional (Telangana)
   - Default working hours: 9 AM – 6 PM IST

**Tools Used:** InTime Admin Dashboard
**Escalation:** If regulatory requirement unclear, consult HR/Compliance Lead

---

### 2.2 Team/Pod Setup

**Purpose:** Organize team structure, assign managers, define territories
**Owner:** System Administrator / Manager
**Trigger:** New team creation, team restructuring, staff onboarding
**SLA:** Team setup complete within 48 hours of approval

#### Process

1. **Create team structure:**
   - InTime Admin Dashboard → Organization → Teams
   - Click "Create New Team"
   - Team name (e.g., "Screening Team", "Recruiting Pod A", "Delivery Team")
   - Description: team purpose and scope
   - Manager: assign from employee dropdown (must be existing account with Manager role)

2. **Assign team members:**
   - Search and select each team member from employee list
   - Confirm role within team (lead, contributor, admin)
   - Set reporting structure (dotted lines if cross-functional)

3. **Define territory:**
   - Geography: US market segments (e.g., "East Coast", "West Coast", "National")
   - Skills: technology focus (Guidewire, Java, Cloud, etc.)
   - Job levels: junior, mid-level, senior, contractor
   - Client segments: specific industries or company sizes

4. **Set team permissions:**
   - Candidate visibility: team members see all team candidates + shared candidate pool
   - Client visibility: team members see assigned clients
   - Job visibility: team members see team job openings + company-wide postings
   - Report access: team-specific dashboards and manager reports

5. **Configure team settings:**
   - Team email distribution list (if applicable)
   - Slack channel creation and invitation
   - Shared Google Drive folder creation
   - Meeting cadence (weekly standup, bi-weekly 1:1s, etc.)

6. **Document team charter:**
   - Team goals for quarter (tied to business objectives)
   - KPIs: hiring targets, candidate quality, time-to-fill
   - Team calendar: blocked times, off-site dates

**Tools Used:** InTime Admin Dashboard, Google Workspace, Slack
**Escalation:** If team structure conflicts with reporting lines, escalate to HR/Management

---

### 2.3 Cost Centers & Budget Allocation

**Purpose:** Track spending by department and function, control budgets
**Owner:** Finance / System Administrator
**Trigger:** Annual budget cycle, headcount change, new department
**SLA:** Budget allocation within 30 days of fiscal year start

#### Process

1. **Define cost centers:**
   - InTime Admin Dashboard → Organization → Cost Centers
   - Create cost center per team or function:
     - "CC001 - Training & Development"
     - "CC002 - Recruiting Operations"
     - "CC003 - Delivery Management"
     - "CC004 - Admin & Support"

2. **Allocate annual budget:**
   - Monthly salary budget per cost center (based on headcount)
   - Training budget per team (₹50-100K per person annually)
   - Technology/tools budget (platform licenses, subscriptions)
   - Travel/event budget (if applicable)
   - Contingency (10% of total)

3. **Assign employees to cost centers:**
   - Each employee assigned to primary cost center (their team)
   - If cross-functional, assign percentage allocation to multiple cost centers

4. **Set budget controls:**
   - Flag when spending reaches 70% of monthly budget (warning)
   - Flag when spending reaches 90% of monthly budget (alert manager)
   - Require approval for expenses >100% of budget without override

5. **Monthly budget review:**
   - Finance team pulls budget vs. actual report
   - Compare salary costs, tool licenses, other variable costs
   - Investigate variances >10%
   - Adjust forecast if needed

6. **Quarterly reforecasting:**
   - Update budget if headcount changes (hire, departure)
   - Adjust if tool costs change
   - Update forecast for remainder of year

**Tools Used:** InTime Admin Dashboard, finance reporting module, spreadsheet tracking
**Escalation:** If budget overrun projected, escalate to Finance Lead and Department Manager

---

## 3. Security & Compliance

### 3.1 Authentication: SSO, MFA, Password Policies

**Purpose:** Protect system access and ensure secure login practices
**Owner:** System Administrator / Security Lead
**SLA:** SSO setup within 2 weeks; MFA enrollment within 30 days of hire

#### Single Sign-On (SSO) Setup

1. **Configure SSO provider:**
   - InTime Admin Dashboard → Security → SSO Configuration
   - Select provider: Google Workspace (preferred for InTime)
   - Alternative: Microsoft Azure AD, Okta
   - Upload SAML metadata from provider
   - Configure attribute mapping: email → InTime username, display name → InTime full name

2. **Enable SSO for all users:**
   - InTime Admin Dashboard → Security → Authentication
   - Toggle "Enable SSO" = ON
   - Set fallback option: allow local login if SSO fails (disabled by default after 30-day transition)
   - Test with admin account before rolling out to all users

3. **Communicate to team:**
   - Email with new login method: click "Sign in with Google" button
   - Quick guide with screenshots
   - FAQ: "What if I forgot my password?"
   - Support contact for SSO issues

#### Multi-Factor Authentication (MFA) Setup

1. **Enroll users in MFA:**
   - InTime Admin Dashboard → Security → MFA Management
   - Click "Require MFA for all users"
   - Set grace period: 7 days for existing users, immediate for new hires
   - Email notification sent automatically

2. **User enrollment process:**
   - Employee logs in with SSO
   - Prompted to enroll in MFA
   - Choose method:
     - Authenticator app (Google Authenticator, Microsoft Authenticator) — preferred
     - SMS to registered phone number
     - Backup codes (printed, stored securely)
   - Test MFA by logging out and back in

3. **MFA enforcement by role:**
   - **Required for:** Admin, Manager, Recruiter, BDM roles
   - **Recommended for:** Interns (optional but encouraged)
   - **Not required:** Read-only users

4. **Backup codes management:**
   - Each user receives 10 backup codes during MFA enrollment
   - Codes stored in secure location (1Password, printed and filed)
   - If phone lost/unavailable: user can use backup code or contact admin for reset

#### Password Policy Configuration

1. **Set password requirements:**
   - Minimum length: 12 characters
   - Complexity: must contain uppercase, lowercase, number, special character (!@#$%^&*)
   - No dictionary words, no previous passwords
   - Password history: cannot reuse last 5 passwords

2. **Password expiration:**
   - Expiration period: 90 days
   - Warning notification: sent 14 days before expiration
   - Force change on first login: yes (temporary password)
   - Inactivity timeout: 30 minutes (auto-logout)

3. **Account lockout:**
   - Lockout after 5 failed login attempts
   - Lockout duration: 30 minutes (then auto-unlock)
   - Alert admin if 10+ failed attempts in 1 hour (potential attack)

4. **Password reset process:**
   - Self-service: "Forgot Password" link on login page
   - Verification method: email confirmation link (expires in 1 hour)
   - Alternative: admin reset (verify identity, send temporary password)

**Tools Used:** InTime Admin Dashboard, Google Workspace/Azure AD, authenticator app
**Escalation:** MFA enrollment issues → escalate to IT support

---

### 3.2 Permission Matrix by Role

**Purpose:** Define what each role can see and do in the platform
**Owner:** System Administrator
**Review cadence:** Quarterly or when roles change

#### Permission Matrix

| Action | Admin | Manager | Recruiter | Intern | Read-only |
|--------|-------|---------|-----------|--------|-----------|
| **User Management** | | | | | |
| Create/edit users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reset passwords | ✅ | ✅ (own team) | ❌ | ❌ | ❌ |
| **Candidate Management** | | | | | |
| Create candidate | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit candidate (own) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit candidate (others) | ✅ | ✅ (team) | ✅ | ❌ | ❌ |
| Delete candidate | ✅ | ✅ (team) | ✅ | ❌ | ❌ |
| Export candidates | ✅ | ✅ | ✅ | Limited | ❌ |
| View salaries/rates | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Client Management** | | | | | |
| Create client | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit client | ✅ | ✅ | ✅ | ❌ | ❌ |
| View client rates | ✅ | ✅ | ✅ | Limited | ❌ |
| View contracts | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Job Management** | | | | | |
| Create job opening | ✅ | ✅ | ✅ | ❌ | ❌ |
| Post to job boards | ✅ | ✅ | ✅ | Limited | ❌ |
| Edit job | ✅ | ✅ (own) | ✅ (own) | ❌ | ❌ |
| Close job | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Reporting & Analytics** | | | | | |
| View all reports | ✅ | ✅ (team) | ✅ (own) | ❌ | ✅ |
| Export reports | ✅ | ✅ (team) | ✅ (own) | ❌ | Limited |
| View financial reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Admin Settings** | | | | | |
| Edit organization settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage integrations | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configure workflows | ✅ | Limited | ❌ | ❌ | ❌ |
| Manage API keys | ✅ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | Limited | ❌ | ❌ | ❌ |
| **Communication** | | | | | |
| Send bulk email | ✅ | ✅ | ✅ | Limited | ❌ |
| Send SMS | ✅ | ✅ | ✅ | Limited | ❌ |
| Schedule interviews | ✅ | ✅ | ✅ | ✅ | ❌ |

---

### 3.3 Security Incident Response

**Purpose:** Respond quickly to security breaches, suspicious activity, or policy violations
**Owner:** System Administrator / Security Lead
**SLA:** Response within 30 minutes of detection

#### Severity Levels

**CRITICAL (Severity 1)** — Immediate action required
- Unauthorized access to system / credentials compromised
- Data breach / unauthorized data export
- Malware or ransomware detected
- Complete system outage affecting all users
- Response: 15 minutes
- Escalation: CEO, CFO, all team leads
- Actions: Revoke affected credentials, isolate affected systems, notify affected parties

**HIGH (Severity 2)** — Urgent, same-day resolution
- Data corruption or loss detected
- Suspicious activity pattern (unusual access, volume spike)
- Integration failure affecting multiple users
- MFA/authentication system failure
- Response: 1-2 hours
- Escalation: Admin Lead, affected Department Manager
- Actions: Investigate, secure affected accounts, restore from backup if needed

**MEDIUM (Severity 3)** — Standard, 24-hour resolution
- Single user account compromised (no data breach)
- Failed login attempts (account lockout)
- Minor integration glitch (affects <5 users)
- Password policy violation (user reuses old password)
- Response: Within business hours
- Escalation: System Administrator, affected Department Manager
- Actions: Reset password, unlock account, audit logs, preventive training

**LOW (Severity 4)** — Monitor and address within 5 days
- Unauthorized access attempt (blocked by system)
- Weak password policy violation (user doesn't meet requirement but hasn't been enforced)
- Outdated software version (no known vulnerability)
- Policy question or clarification needed
- Response: Within 5 business days
- Escalation: System Administrator
- Actions: Document, plan preventive action, update policy if needed

#### Incident Response Procedure

1. **Detection & Logging:**
   - Automated alerts: integration failures, login anomalies, API errors
   - Manual reports: employees reporting suspicious activity
   - Routine audits: admin review of logs
   - Log incident in Incident Tracker with: date/time, description, severity, reporter

2. **Initial Assessment (within 15 min for Severity 1-2):**
   - Confirm incident is real (not false alarm)
   - Determine scope: how many users/records affected
   - Identify root cause: human error, system bug, security breach
   - Assess impact: financial, operational, reputation

3. **Containment (immediate for Severity 1-2):**
   - Revoke compromised credentials (API keys, passwords, MFA tokens)
   - Disable affected user accounts (if breach)
   - Isolate affected systems or integrations (if malware)
   - Block suspicious IP addresses (if attack)
   - Notify affected users if data exposure (GDPR/India data protection law)

4. **Investigation:**
   - Review audit logs and system logs
   - Interview involved parties
   - Determine what data was accessed/exposed
   - Identify when incident started and when it was discovered
   - Check for similar incidents in past 6 months

5. **Remediation:**
   - Fix underlying technical issue (patch, update, reconfigure)
   - Restore data from backup if needed
   - Re-enable accounts with new credentials
   - Verify no further unauthorized access
   - Run penetration test if security breach

6. **Communication:**
   - Notify affected users with: what happened, what was exposed, what action they should take
   - Notify management/leadership (per severity level)
   - Document incident in records for compliance/insurance
   - If regulatory incident: notify authorities/regulators per India data protection laws

7. **Post-Incident Review (within 48 hours):**
   - Root cause analysis: why did this happen?
   - Preventive measures: how to prevent in future?
   - Policy updates: do security policies need strengthening?
   - Training: does team need security awareness training?
   - Document lessons learned

**Tools Used:** InTime Admin Dashboard (audit logs), Slack (alerts), Incident Tracker, email
**Escalation:** Severity 1 → immediate call to CEO, CFO, all managers

---

### 3.4 Audit Logging: What's Logged, Retention, Review Cadence

**Purpose:** Maintain detailed records of system activity for security, compliance, and troubleshooting
**Owner:** System Administrator
**Retention period:** 7 years (India statutory requirement)
**Review cadence:** Daily for critical events, weekly summary, quarterly audit report

#### What Gets Logged

**User Activity Logs**
- Login/logout: timestamp, user, IP address, success/failure
- Password change: who changed, when, success/failure
- MFA enrollment/reset: user, device type, timestamp
- Role/permission change: old role, new role, changed by, timestamp
- User creation/deletion: who was created/deleted, by whom, when

**Data Access Logs**
- Candidate record view: who viewed, which candidate, when
- Candidate data export: who exported, how many records, when, export file size
- Client record access: who viewed, which client, when
- Report generation: who ran report, which report, when, data range
- Sensitive data access: salary, rate, private notes (flagged for review)

**Modification Logs**
- Candidate update: field changed, old value, new value, timestamp, changed by
- Client update: field changed, old value, new value, timestamp, changed by
- Job posting update: fields changed, timestamp, changed by
- Email template change: version, who edited, what changed
- Workflow configuration change: who changed, what rule changed, when

**Integration Logs**
- API call: integration name, endpoint, timestamp, success/failure, user who triggered
- Job board sync: jobs posted, candidates pulled, timestamp, errors
- Email/calendar sync: emails sent, events created, timestamp, delivery status
- HRIS sync: data imported/exported, timestamp, errors

**System Admin Logs**
- Authentication configuration change: SSO, MFA, password policy, who changed, when
- Permission matrix change: role, permission, granted/revoked, changed by, when
- API key creation/revocation: key name, scopes, creation/revocation date, by whom
- Organization setting change: what changed, old value, new value, timestamp
- Team/cost center creation/modification: details, timestamp, created by

#### Log Storage & Retention

1. **Storage:**
   - Logs stored in InTime platform database (encrypted at rest)
   - Backup: automatic daily backups, retained for 30 days
   - Archive: logs older than 6 months exported to cold storage (AWS S3 archive tier)

2. **Retention Policy:**
   - Active logs: 6 months in platform for quick access
   - Archive: 7 years in cold storage (for compliance, audit trails)
   - Deletion: after 7 years, logs purged permanently

3. **Access Control:**
   - Only System Admin can access audit logs
   - Managers can see limited logs of their team members
   - All log access is logged (cannot turn off audit of auditors)

#### Audit Review Cadence

**Daily (automated alerts)**
- Failed login attempts: 5+ failures in 1 hour per user → alert admin
- Suspicious API usage: unusual volume spike → alert admin
- Data exports: >1000 records exported → alert admin
- Critical changes: SSO config, user role change → alert admin

**Weekly (manual review)**
- Summary report of all critical/high-severity events
- API call volume and errors
- Failed integration syncs
- New users created and removed
- System administrator actions

**Monthly (compliance review)**
- Full audit log export for compliance records
- Data access audit: who accessed what sensitive data
- Permission changes audit: validate all role changes were approved
- Integration health audit: failed syncs, API errors
- Security incident log: any incidents or violations

**Quarterly (comprehensive audit)**
- Complete audit trail of system activity (1000+ pages)
- Analysis of access patterns: identify unusual behavior
- Policy compliance review: are users following security policies?
- User access review: does each user still need their current role?
- Incident trends: are there repeating security issues?
- Prepare audit report for leadership and compliance

**Tools Used:** InTime Admin Dashboard (Audit Log viewer), AWS S3, spreadsheet reports
**Escalation:** If suspicious pattern detected, escalate per security incident response process

---

### 3.5 Data Backup: Frequency, Testing, Recovery Procedures

**Purpose:** Protect data from loss and enable rapid recovery from system failures
**Owner:** System Administrator / Infrastructure Team
**RPO (Recovery Point Objective):** 24 hours (max data loss)
**RTO (Recovery Time Objective):** 4 hours (max downtime)

#### Backup Frequency & Schedule

1. **Full database backup:**
   - Frequency: Daily at 2:00 AM IST (off-peak hours)
   - Duration: ~30 minutes
   - Retention: 30 days (rolling window)

2. **Incremental backup:**
   - Frequency: Every 6 hours (2 AM, 8 AM, 2 PM, 8 PM IST)
   - Duration: ~5-10 minutes
   - Retention: 14 days

3. **File/document backup:**
   - Google Drive: automatic versioning, infinite history
   - Email: automatic retention and archival (30-day rolling backup)
   - Configuration files: daily export at 2 AM IST

4. **Geographical redundancy:**
   - Primary backup location: AWS region (India - Mumbai)
   - Secondary backup location: AWS region (different region, for DR)
   - Replication: real-time to secondary (RPO < 1 hour)

#### Backup Testing Procedure

**Monthly backup restore test**
- Select random backup from the past 30 days
- Restore to test environment (non-production)
- Verify all data restored correctly: candidates, clients, jobs, users, configurations
- Verify no data corruption or missing records
- Test database integrity check: run DBCC CHECKDB or equivalent
- Document results and any issues discovered

**Quarterly disaster recovery drill**
- Simulate complete production outage
- Restore from secondary backup (different region)
- Verify all systems come online within RTO (4 hours)
- Run smoke tests: user login, candidate search, job posting
- Measure actual recovery time and document
- Identify any gaps in recovery process
- Update recovery documentation if needed

**Annual full audit of backup process**
- Review entire backup & recovery procedure
- Test with largest backup (full database)
- Test with oldest backup available
- Verify backup encryption and security
- Audit backup logs for any anomalies
- Update RTO/RPO targets if needed

#### Data Recovery Procedures

**Scenario 1: Single Record Deletion/Corruption**
- SLA: 1-2 hours
- Steps:
  1. Confirm with user that record should be restored
  2. Determine when record was last good (query audit logs)
  3. Restore that specific record from backup
  4. Verify record integrity
  5. Update record with any changes since backup date
  6. Log restore action in audit trail

**Scenario 2: Full Database Loss**
- SLA: 4 hours (RTO)
- Steps:
  1. Confirm production database is completely inaccessible
  2. Notify all users that system is down
  3. Restore latest full backup to production environment (from 24 hours ago)
  4. Run database integrity check
  5. Verify all systems online: web, APIs, integrations
  6. Run smoke tests with sample data
  7. Restore incremental backups from time of failure (if within 24 hours)
  8. Verify no data loss (or restore within RPO window)
  9. Notify users system is restored
  10. Post-incident review

**Scenario 3: Corrupted/Malware Infection**
- SLA: 2-4 hours
- Steps:
  1. Isolate affected systems from network immediately
  2. Disable all API access and integrations
  3. Do NOT restore yet — investigate malware first
  4. Scan backups for malware (may need to go back multiple days)
  5. Identify oldest clean backup
  6. Restore from oldest clean backup
  7. Run full antivirus/malware scan
  8. Investigate how malware entered (patch vulnerability)
  9. Gradually restore systems and monitor for reinfection
  10. Update security measures

**Scenario 4: Accidental Data Modification (User Error)**
- SLA: Same business day
- Steps:
  1. Quantify impact: how many records affected, which fields
  2. If minor (<100 records): restore from backup and manually update changed records
  3. If major (>100 records): restore full database from backup point, re-apply good changes
  4. Notify affected users of restoration
  5. Train users on affected process to prevent future errors

**Tools Used:** AWS Backup, database management tools, restore scripts
**Escalation:** RTO exceeded → escalate to CTO/Infrastructure Lead immediately

---

## 4. Integration Management

### 4.1 Job Board Connections: Dice, Monster, CareerBuilder, LinkedIn, Indeed

**Purpose:** Automate job posting and candidate sourcing across major US job boards
**Owner:** System Administrator / Integration Manager
**Trigger:** New integration setup, job posting creation, new board subscription
**SLA:** Integration setup within 5 business days; troubleshooting within 4 hours

#### Job Board Credentials & Access

1. **Dice Integration**
   - Purpose: Post IT/tech roles, source pre-screened candidates
   - Frequency: Daily sync of candidate applications
   - Credentials: API key + account credentials (stored in 1Password)
   - InTime setup: Integration → Job Boards → Dice → Connect
   - Verify: Test posting and candidate import

2. **Monster Integration**
   - Purpose: Post roles, source general IT candidates
   - Frequency: Daily sync of applications
   - Credentials: API key + account credentials
   - InTime setup: Integration → Job Boards → Monster → Connect
   - Verify: Test with sample job posting

3. **CareerBuilder Integration**
   - Purpose: Post roles, source quality candidates, background check integration
   - Frequency: Real-time candidate notifications (optional)
   - Credentials: API key, account login
   - InTime setup: Integration → Job Boards → CareerBuilder → Connect
   - Verify: Post test job, confirm candidates pulling

4. **LinkedIn Integration**
   - Purpose: Post company jobs, source premium candidates via LinkedIn Recruiter
   - Frequency: Daily posting sync, real-time InMail responses
   - Credentials: LinkedIn API key, Recruiter Lite account
   - InTime setup: Integration → Job Boards → LinkedIn → OAuth connect
   - Verify: Post test job on LinkedIn, receive candidate match

5. **Indeed Integration**
   - Purpose: Post jobs free + sponsored postings, high volume of candidates
   - Frequency: Daily posting sync, hourly candidate applications
   - Credentials: Indeed API key, account login
   - InTime setup: Integration → Job Boards → Indeed → Connect
   - Verify: Sponsored job performance tracking enabled

#### Integration Setup Process

1. **Obtain credentials from job board:**
   - Contact board vendor (Dice, Monster, etc.)
   - Request API access or integration credentials
   - Receive: API key, documentation, sandbox environment access
   - Store credentials securely in 1Password (never in code/config)

2. **Configure in InTime platform:**
   - Admin Dashboard → Integrations → Job Board Connections
   - Click "Add New Board"
   - Select job board from dropdown
   - Paste API key and credentials
   - Map fields: InTime job field → Board field (title, description, requirements)
   - Select job posting template (auto-format for board)
   - Enable sync: posting from InTime → board

3. **Test integration:**
   - Create draft job in InTime with test data
   - Publish to selected job board
   - Verify job appears on board within 5 minutes
   - Check job content formatting (no HTML errors, field mapping correct)
   - Create or receive test candidate on board
   - Verify candidate imported to InTime within 24 hours

4. **Configure candidate import:**
   - Enable candidate auto-import or set sync schedule
   - Map job board candidate fields → InTime fields
   - Set auto-tagging: candidates from Dice tagged "dice_import"
   - Test: create candidate on board, verify import to InTime
   - Configure duplicate detection to prevent duplicates

5. **Document integration:**
   - Board name, API key name, credentials location (1Password vault)
   - Setup date, tested by, verification status
   - Responsible person for monitoring
   - SLA for posting (24 hours) and candidate import (24 hours)

#### Integration Health Monitoring

**Daily checks (automated)**
- Posting success: all jobs posted without errors
- Candidate import: number of candidates received vs. expected
- Sync delays: if >24 hour delay, alert admin
- API errors: failed requests logged and counted

**Weekly review (manual)**
- Job board performance: applications received per job board
- Cost per application (for paid boards like Indeed)
- Data quality: any malformed candidates or jobs
- Board service level: any outages or slow response

**Monthly optimization**
- Review job posting templates for underperforming boards
- Adjust job titles/descriptions if click-through rate low
- Evaluate ROI by board: candidates sourced, hires made, cost per hire
- Recommend continuing, upgrading, or downgrading board subscription

#### Troubleshooting Common Issues

**Issue: Job not posting to board**
- Check API credentials valid (not expired)
- Verify job has all required fields (title, description, etc.)
- Check if job level/salary out of board guidelines
- Test with minimal job data
- If persistent, contact board support

**Issue: Candidates not importing**
- Check if board is syncing (integration status = active)
- Verify candidate data mapping is correct
- Check for duplicate detection blocking import
- Confirm no IP whitelist restriction
- Run manual sync to test

**Issue: Duplicate candidates in InTime**
- Enable duplicate detection rules: match on email + phone
- Review existing duplicates and merge manually
- Adjust matching sensitivity if false positives
- Retrain team on preventing duplicates during sourcing

**Issue: Performance slow when posting or importing**
- Check job board API availability (may be slow)
- Check internet connection and bandwidth
- Check if running other large data syncs simultaneously
- If persistent, contact job board support about API throttling

**Tools Used:** InTime Admin Dashboard (Integrations), 1Password, job board APIs
**Escalation:** API authentication failure → contact board support; sync delays >4 hours → escalate to Integration Manager

---

### 4.2 Email/Calendar Sync: Gmail/Outlook Integration

**Purpose:** Synchronize candidate communications and meeting schedules
**Owner:** System Administrator / HR Manager
**SLA:** Email integration within 48 hours of request; calendar within 24 hours

#### Gmail Integration Setup

1. **Connect Gmail account:**
   - User logs into InTime platform → Settings → Integrations
   - Click "Connect Gmail"
   - Redirected to Google login, select email account
   - Approve InTime app access to Gmail
   - InTime receives OAuth token for this account

2. **Sync emails to candidate records:**
   - Emails automatically matched to candidates by email address
   - Candidates receive inbox conversation thread linked in InTime
   - Two-way sync: reply to candidate in InTime → sent from Gmail, received in InTime

3. **Calendar sync:**
   - User selects calendar to sync (default: Primary Calendar)
   - Interview scheduled in InTime → automatically creates calendar event in Gmail
   - Calendar event details: candidate name, job title, interviewer, meeting link
   - Calendar event removal: if interview cancelled in InTime → removed from calendar

4. **Meeting link generation:**
   - InTime automatically generates Google Meet link for interviews
   - Link included in calendar event and interview confirmation email
   - Backup link (Zoom) if Google Meet unavailable

**Configuration:**
- InTime Admin Dashboard → Integrations → Email → Gmail
- Select Gmail account, authorize, verify successful connection
- Set email sync: automatic (recommended) or manual
- Set calendar sync: automatic or manual
- Test: send email to candidate, verify appears in InTime; schedule test interview

#### Outlook Integration Setup

1. **Connect Outlook account:**
   - User logs into InTime → Settings → Integrations
   - Click "Connect Outlook"
   - Redirected to Microsoft login, select Office 365 account
   - Approve InTime app access to Outlook and Calendar
   - InTime receives OAuth token

2. **Email sync:**
   - Same as Gmail: emails matched to candidates by address
   - Two-way sync: replies in InTime → sent from Outlook
   - Conversation thread linked in candidate record

3. **Calendar sync:**
   - Interview created in InTime → event in Outlook calendar
   - Meeting room booking (if using Outlook Room Finder)
   - Recurring interviews supported
   - Backup link: Teams Meeting (Outlook native) or Zoom

**Configuration:**
- InTime Admin Dashboard → Integrations → Email → Outlook
- Select Outlook account, authorize, verify
- Set email and calendar sync preferences
- Test with sample email and interview

#### Email Signature Management

1. **Create company email signature template:**
   - Admin Dashboard → Communications → Email Templates → Signatures
   - Template includes:
     - Name, title, company (InTime Staffing Solutions)
     - Phone, email
     - Company logo (auto-inserted)
     - Disclaimer: "This is a confidential communication..."
   - HTML format for consistency across clients

2. **Apply signature to all outbound emails:**
   - Gmail/Outlook setting: auto-insert signature
   - InTime platform: append signature to automated emails (offers, status updates)
   - User option: use company signature or personal signature (with approval)

#### Calendar & Meeting Management

1. **Interview scheduling workflow:**
   - Recruiter → selects candidate + interviewer + time in InTime
   - Calendar invite automatically created in both Gmail/Outlook
   - Meeting link (Google Meet or Teams) auto-generated
   - Reminder emails sent: candidate 24 hours before, interviewer 1 hour before

2. **Recurring meetings:**
   - Weekly standup meetings, 1:1s scheduled in Outlook
   - InTime syncs to calendar automatically
   - Cancellations/rescheduling reflected in both systems

3. **Meeting room booking:**
   - If interviewing in-person in Hyderabad office
   - Booking integrated with calendar sync (Outlook Room Finder)
   - Conference room reserved, invite includes room details

#### Email Compliance & Privacy

1. **Email retention:**
   - Emails retained for 7 years per India data protection law
   - Automatic archival after 90 days of inactivity
   - User can manually archive or delete (admin can restore from backup)

2. **Email security:**
   - TLS encryption for all outbound emails
   - Spam/phishing filtering enabled (Gmail/Outlook default)
   - Suspicious email flagged and reviewed by compliance team
   - Attachments scanned for malware

3. **Privacy & confidentiality:**
   - Email footer includes: "This communication is confidential"
   - Users trained: don't forward to external parties
   - System prevents accidental external forward (prompt before sending)
   - BCC not allowed (to prevent hidden recipient distribution)

**Tools Used:** Gmail/Outlook API, Google Meet/Microsoft Teams, InTime integrations
**Escalation:** Email sync failing → check OAuth token expiration, re-authorize account

---

### 4.3 HRIS/Payroll Integration

**Purpose:** Sync employee data between InTime platform and HR/payroll system
**Owner:** System Administrator / HR Manager
**SLA:** Data sync daily at 11 PM IST; discrepancies resolved within 48 hours

#### HRIS Integration (HR module)

1. **Connect to HRIS system:**
   - InTime Admin Dashboard → Integrations → HRIS
   - Select provider: Zenefits, Guidepoint, Workday, or custom HR system
   - Enter API credentials (OAuth token or API key from HRIS)
   - Test connection

2. **Data synced from HRIS to InTime:**
   - Employee name, email, phone, date of birth
   - Job title, role, department, cost center
   - Manager/reporting relationship
   - Salary band, compensation level
   - Employment status (active, on leave, terminated)
   - Organizational structure changes
   - Sync frequency: daily at 11 PM IST

3. **Data synced from InTime to HRIS:**
   - Employee status change (new hire, status update)
   - Role/department change
   - Performance ratings (from annual review)
   - Training completion records
   - Leave taken (imported from leave module)
   - Sync frequency: daily at 11 PM IST

4. **Conflict resolution:**
   - If data mismatch (e.g., salary different in two systems)
   - HR system considered source of truth for employee data
   - InTime data updated to match HRIS
   - Alert sent to HR if manual edit needed in HRIS

#### Payroll Integration

1. **Connect to payroll provider:**
   - InTime Admin Dashboard → Integrations → Payroll
   - Select provider: SAP SuccessFactors, ADP, Guidepoint, or custom
   - Enter API credentials
   - Test connection with sample payroll run

2. **Data transferred to payroll:**
   - Employee name, ID, bank account
   - Salary, allowances, deductions
   - Performance bonus (from performance review)
   - Leave balance (from leave module)
   - Designation/cost center (for cost allocation)
   - Attendance data (if integrated)
   - Transfer frequency: monthly before payroll run (typically 5th of month)

3. **Payroll verification before processing:**
   - Generate pre-payroll report from InTime
   - Cross-check: employee count, salary total, bonus total
   - HR Lead reviews report for accuracy
   - Approve for transfer to payroll system
   - Payroll provider processes within 2-3 days of month-end

4. **Post-payroll reconciliation:**
   - After payroll processed, compare actual vs. estimated
   - Investigate variances >1% of total payroll
   - Document reconciliation in records
   - Communicate any adjustments needed to payroll provider

#### Data Mapping & Field Configuration

1. **Field mapping:**
   - Admin → Integrations → HRIS → Field Mapping
   - Map InTime fields to HRIS fields
   - Example mappings:
     - InTime "Role" → HRIS "Job Title"
     - InTime "Team" → HRIS "Department"
     - InTime "Salary Band" → HRIS "Compensation Level"

2. **Test data mapping:**
   - Create test employee in InTime
   - Run test sync to HRIS staging environment
   - Verify all fields transferred correctly
   - Fix any mapping issues before production sync

3. **Documentation:**
   - Document all field mappings in shared spreadsheet
   - Update when fields added or changed in either system
   - Share with HR Lead and payroll provider

#### Error Handling & Monitoring

1. **Sync failure alerts:**
   - If sync fails to complete: alert admin within 30 min
   - Automatic retry: attempt 3 times over 2 hours
   - If persistent failure: escalate to Integration Manager
   - Do not process payroll until sync successful

2. **Data validation:**
   - Check for required fields (name, email, salary)
   - Flag incomplete records for HR review
   - Validate email format, salary numeric, dates logical
   - Block sync if validation fails

3. **Daily sync report:**
   - Log all employees synced, records created/updated/deleted
   - Flag any errors or warnings during sync
   - Report available in Admin Dashboard → Integration Reports
   - HR Lead reviews daily report for anomalies

**Tools Used:** InTime Admin Dashboard, HRIS API, payroll provider API
**Escalation:** Sync failure > 2 hours → escalate to CTO/Integration Manager immediately

---

### 4.4 VMS/MSP Portal Connections

**Purpose:** Integrate with client vendor management systems for job posting, candidate submission, and compliance
**Owner:** Delivery Manager / Account Manager
**SLA:** VMS connection within 48 hours of client request; submissions within same day

#### VMS Integration Setup

1. **Receive VMS connection request from client:**
   - Client name, VMS platform (SAP Fieldglass, Beeline, Workable, etc.)
   - Client contact for VMS admin credentials
   - Required integrations: job posting, candidate submission, timesheets, invoicing
   - Compliance requirements (W-9, insurance, certifications)

2. **Establish VMS connection:**
   - Request API credentials from client VMS admin
   - InTime Admin Dashboard → Integrations → VMS Portals
   - Click "Add New VMS"
   - Enter VMS platform, client name, API credentials
   - Verify connection with test API call

3. **Map job posting workflow:**
   - Client creates job in their VMS
   - InTime pulls job details via API
   - Job auto-created in InTime with client/VMS reference ID
   - InTime team sources and screens candidates

4. **Map candidate submission workflow:**
   - Recruiter selects candidate + job in InTime
   - Click "Submit to Client VMS"
   - Candidate data formatted per client VMS requirements
   - Candidate submitted to VMS with InTime reference ID
   - Confirmation received from VMS, InTime record updated

5. **Test integration:**
   - Test job pull: create test job in client VMS, verify import to InTime
   - Test candidate submission: submit test candidate, verify appears in client VMS
   - Test workflow: job pull → InTime sourcing → submit → client receives
   - Verify all fields mapped correctly, no data loss

#### VMS Client Compliance Management

1. **Compliance document storage:**
   - VMS → Compliance tab stores client requirements
   - Example: "Proof of insurance $2M", "W-9 form", "Background check clearance"
   - InTime tracks: required documents, submission deadlines, expiration dates

2. **Vendor profile creation:**
   - InTime → Admin Dashboard → Vendors → Add New Vendor
   - Vendor name, contact info, VMS platform
   - Compliance status: documents required, documents pending, documents approved
   - Renewals: document expiration dates and renewal reminders

3. **Compliance checklist before candidate submission:**
   - When candidate ready to submit: system checks vendor compliance
   - If compliance missing: alert, prompt to submit documents first
   - If compliance complete: allow submission to proceed

#### VMS Timesheet & Invoice Integration

1. **Timesheet submission to VMS:**
   - Candidate timesheet entered in InTime (hours worked)
   - If job linked to VMS client: timesheet auto-submitted to client VMS
   - Client approves timesheet in their system
   - Approval synced back to InTime

2. **Invoice generation from VMS:**
   - Client pays based on candidate's approved hours and rate
   - Some VMS platforms auto-generate invoices
   - InTime imports invoice data to accounting system
   - Delivery Manager reconciles billing

#### VMS Performance Tracking

1. **Monitor submission success rate:**
   - Track candidates submitted to VMS vs. candidates interviewed/hired
   - Goal: >30% interview rate, >10% placement rate
   - If low rate: analyze feedback from client, improve candidate quality

2. **Track client metrics:**
   - Job fill rate: candidates hired / jobs posted
   - Time-to-fill: average days from job posting to hire
   - Cost-per-hire: total staffing cost / hires
   - Client satisfaction: monthly feedback from client

3. **Reporting to client:**
   - Monthly VMS activity report: jobs, submissions, interviews, hires
   - Candidate quality metrics: interview rate, feedback
   - Billing report: hours worked, invoiced amount
   - Account review meeting: discuss performance, identify improvements

**Tools Used:** InTime Admin Dashboard, VMS platform APIs, integration tools
**Escalation:** VMS submission failure → contact client VMS admin; persistent failures → escalate to Account Manager

---

### 4.5 Integration Health Monitoring & Alerting

**Purpose:** Proactively detect and respond to integration failures
**Owner:** System Administrator
**SLA:** Alert within 30 minutes of failure; resolution within 2-4 hours depending on severity

#### Health Monitoring Checks

**Real-time monitoring (every 5 minutes)**
- API connectivity: test endpoint connectivity for all integrations
- Data freshness: timestamp of last successful sync
- Error rate: % of failed API calls (alert if >5%)
- Response time: API latency (alert if >10 seconds)

**Automated alerts (triggered immediately)**
- Integration offline: connectivity fails for >10 minutes
- Sync failure: data sync fails to complete within expected window
- Data discrepancies: received data doesn't match expected format
- Rate limiting: job board API returning rate limit error
- Authentication error: OAuth token expired or invalid

**Dashboard & Reporting**
- Integration health dashboard: real-time status of all connections
- Status display: green (healthy), yellow (warning), red (down)
- Drill-down: view last sync time, success/failure, API errors
- Alert log: history of alerts, when triggered, resolution

#### Alert Configuration

**Severity 1 (Critical) — Immediate action**
- Critical integration down >15 minutes: job boards, VMS, payroll
- All candidates unable to sync from job board
- All job postings failed (jobs not appearing on boards)
- Alert: Slack message to #integrations, email to admin

**Severity 2 (High) — Urgent**
- Non-critical integration down >1 hour: email, calendar, HRIS
- 50%+ of expected data not syncing
- Frequent failures with temporary recovery
- Alert: Slack message, email within 2 hours

**Severity 3 (Medium) — Standard resolution**
- Integration experiencing slow performance (>5 min sync)
- Occasional failures (1-2 per hour) with intermittent recovery
- Data quality issues (invalid records)
- Alert: email within 24 hours

**Severity 4 (Low) — Monitor**
- Integration slightly slow (2-5 min sync)
- Minor data quality issues (non-critical fields)
- Alert: daily summary report

#### Integration Troubleshooting Playbook

**Issue: Integration offline / connectivity failed**
- Check if external service is down: visit job board website, check status page
- If down on their side: wait for recovery, no action needed
- If down on our side: check internet connectivity, IP whitelist (firewall)
- If intermittent: check for scheduled maintenance window
- If credential issue: verify OAuth token, refresh if expired
- If persistent: open support ticket with integration provider

**Issue: Sync delayed (data not flowing)**
- Check last successful sync timestamp
- Manually trigger sync in Admin Dashboard → Integrations → [Integration] → Sync Now
- Check if queue is backed up (large data volume)
- Check if rate limiting: job board API limits calls per hour
- If rate limited: wait and retry, may need to upgrade to higher API tier
- Check data format: is data being sent in correct format?
- If format issue: update field mapping and retry

**Issue: Data quality issues (malformed candidates, missing fields)**
- Check field mapping: Admin → Integrations → [Integration] → Field Mapping
- Verify required fields are being synced (name, email, phone)
- Check job board for incomplete candidate profiles (fix at source)
- Run data cleanup: Admin → Data Management → Data Quality → Fix Issues
- Review sample records to identify pattern of problem

**Issue: Authentication failure (invalid token, credentials expired)**
- Check OAuth token expiration date
- If expired: re-authenticate: Admin → Integrations → [Integration] → Re-authenticate
- Verify credentials still valid (not changed by job board)
- Check if integration provider disabled API access
- If credential changed: update in 1Password and re-authenticate

**Issue: Rate limiting / API quota exceeded**
- Check API call volume: Admin → Integrations → API Usage Report
- Check if within job board's limits (e.g., 1000 calls/day)
- If exceeded: temporarily disable features causing high volume
- Contact job board about upgrading to higher API tier
- Implement queue/backoff strategy to spread calls over time

#### Manual Sync Procedures

**Manually sync job postings to job boards:**
1. Admin Dashboard → Integrations → Job Boards
2. Select job board (Dice, Monster, etc.)
3. Click "Sync Now" or "Force Sync"
4. Monitor sync progress (shows # of jobs synced)
5. Wait for completion (typically <5 minutes)
6. Verify jobs appeared on job board website

**Manually sync candidates from job boards:**
1. Admin Dashboard → Integrations → Job Boards
2. Select job board
3. Click "Sync Candidates" or "Pull Candidates"
4. Specify date range (e.g., last 24 hours)
5. Monitor progress
6. Review imported candidates in InTime candidates list

**Manually sync email/calendar:**
1. User Settings → Integrations → Email/Calendar
2. Click "Sync Now" (if available)
3. Or re-authenticate (logout/login) to refresh OAuth token
4. Verify new emails and calendar events appear

**Tools Used:** InTime Admin Dashboard (Integrations), monitoring dashboard, alert system, 1Password
**Escalation:** Unresolved after 30 min → contact integration provider support; payroll sync down → escalate to CFO immediately

---

## 5. Data Management

### 5.1 Import/Export: Candidate Data Migration, Bulk Operations

**Purpose:** Migrate candidate data between systems, perform bulk updates, enable data analysis
**Owner:** System Administrator / Recruiting Lead
**SLA:** Import/export completion within 4 hours; data validation within 24 hours

#### Candidate Data Export

1. **Export candidate list:**
   - Admin Dashboard → Data Management → Export Candidates
   - Select fields to export: name, email, phone, skills, experience level, rates, source, status
   - Filter candidates: by team, by date range, by status, by skill
   - Click "Export" → CSV file downloaded
   - File naming: Candidates_[date]_[filter].csv

2. **Export format:**
   - CSV file with headers
   - Encoding: UTF-8
   - Special characters escaped properly (commas in names quoted)
   - Dates in DD/MM/YYYY format
   - Salary in INR format

3. **Sample export process:**
   - Manager → Admin Dashboard → Data Management → Export
   - Filter: "Team = Recruiting Pod A, Status = Active"
   - Fields: name, email, phone, skills, current company, years experience, hourly rate, last contacted
   - Result: 500 candidates exported
   - File: Candidates_2026_02_10_RecruitingPodA.csv

#### Candidate Data Import

1. **Import candidate list:**
   - Recruiting Lead receives CSV file (from previous system, external vendor, or spreadsheet)
   - Admin Dashboard → Data Management → Import Candidates
   - Select CSV file
   - Map fields: CSV column → InTime field (name → Full Name, email → Email, etc.)
   - Review mapping for accuracy

2. **Data validation before import:**
   - System checks for required fields (name, email minimum)
   - Checks for duplicate emails (existing candidates)
   - Validates email format (proper email syntax)
   - Validates phone format (10+ digits)
   - Flags rows with validation errors
   - Displays preview: "X candidates ready to import, Y validation errors"

3. **Duplicate detection:**
   - If email already exists: show warning "This email already in system"
   - Options: skip (don't import), merge (combine with existing), overwrite (replace)
   - Default: merge (if choosing merge, pick which data to keep)

4. **Import execution:**
   - Click "Import"
   - Progress bar shows: "Importing 1 of 500..."
   - If error: stop import, show error details, offer to skip rows with errors and continue
   - After import: summary report shows "500 candidates imported, 10 errors"

5. **Post-import verification:**
   - Search for imported candidates in candidate list
   - Spot-check 5-10 records for data accuracy
   - Verify relationships created (candidate linked to source, team, etc.)
   - If issues found: delete candidates and re-import with corrected file

#### Bulk Operations

1. **Bulk candidate update:**
   - Admin Dashboard → Data Management → Bulk Update
   - Select candidates: by team, by status, by filter, or upload CSV with IDs
   - Select field to update: status, skills, rate, source, team, etc.
   - Enter new value (e.g., status = "Placed")
   - Preview: "Updating 100 candidates, changing status from 'Active' to 'Placed'"
   - Confirm and execute
   - Result: all candidates updated, audit log recorded

2. **Bulk email to candidates:**
   - Admin Dashboard → Communications → Bulk Email
   - Select recipients: by team, by status, by skill, or upload list
   - Select email template or write custom email
   - Verify recipient count and email preview
   - Click "Send"
   - Result: X emails sent, delivery tracking available

3. **Bulk candidate tagging:**
   - Select candidates
   - Click "Add Tags"
   - Type tag name (e.g., "aws_certified", "guidewire_expert")
   - All selected candidates tagged
   - Tags searchable later: filter candidates by tag

#### Data Migration from Previous System

1. **Plan migration:**
   - Identify source system (Bullhorn, Ceipal, spreadsheet)
   - Determine data to migrate: candidates only, or clients/jobs too?
   - Define timeline: migration in phases or all at once?
   - Identify data mapping: how do fields correspond?

2. **Extract data from source system:**
   - Export candidates, jobs, clients from previous system
   - Format: CSV or Excel
   - Include all relevant fields: name, email, phone, skills, rates, status, dates, notes

3. **Prepare data for import:**
   - Clean data: remove duplicates, fix formatting
   - Map fields: old field name → new field name
   - Validate: ensure required fields present
   - Test: import sample of 10 records, verify mapping
   - Fix mapping if incorrect, then do full import

4. **Execute migration:**
   - Back up InTime database before migration
   - Import first batch of data (e.g., 1000 candidates)
   - Verify data integrity: spot-check records
   - If issues: fix and re-import
   - Continue with batches until all data migrated

5. **Post-migration validation:**
   - Total candidate count: does it match expected?
   - Data completeness: what % of fields populated?
   - Data accuracy: spot-check 20 random records
   - Duplicate detection: any duplicate emails or IDs?
   - Broken references: any candidates missing team/source?
   - Report: migration summary to leadership

**Tools Used:** InTime Admin Dashboard, CSV editor (Excel, Google Sheets)
**Escalation:** Data loss during import → restore from backup; unresolved validation errors → escalate to Data Manager

---

### 5.2 Duplicate Detection: Rules, Merge Process, Prevention

**Purpose:** Maintain clean candidate database, prevent redundant work, improve data quality
**Owner:** System Administrator / Data Quality Manager
**SLA:** Monthly duplicate audit, merge duplicates within 5 days of detection

#### Duplicate Detection Rules

1. **Primary matching rules:**
   - **Exact email match:** if two candidates have same email → flagged as duplicate
   - **Exact phone match:** if two candidates have same phone → flagged as duplicate
   - **Exact name + email domain:** if name matches and email domain matches → possible duplicate

2. **Secondary matching rules (fuzzy):**
   - **Similar name + same email domain:** if name 85%+ similar and same company domain → investigate
   - **Similar name + similar phone:** name 85%+ match and phone number differs by 1 digit → investigate
   - **Same job applied for:** if candidates applied to same job on same day → possible duplicate application

3. **Automated duplicate flagging:**
   - InTime runs daily duplicate detection
   - Candidates matching primary rules automatically flagged as "Potential Duplicate"
   - Flagged candidates listed in Admin Dashboard → Data Quality → Duplicates
   - Status: "New" (just flagged), "Reviewing", "Merged", "Not a Duplicate"

#### Manual Duplicate Detection

1. **Candidate merge review:**
   - Admin Dashboard → Data Quality → Duplicates
   - Lists all flagged potential duplicates
   - Sort by: match score (highest first), date flagged, candidate name
   - Click duplicate pair to review

2. **Review candidate information:**
   - Show both candidates side-by-side
   - Compare: name, email, phone, location, skills, experience, source
   - If clearly same person: merge (see merge process below)
   - If not same person: mark "Not a Duplicate" (prevents re-flagging)

#### Merge Process

1. **Initiate merge:**
   - Select two candidate records to merge (both showing in comparison view)
   - Click "Merge Candidates"
   - Choose primary record (keep this one, update with data from secondary)
   - Choose what data to keep for each field

2. **Field-by-field merge:**
   - Name: use [primary or secondary?]
   - Email: use [primary or secondary?] — keep both if different
   - Phone: use [primary or secondary?] — keep both if different
   - Skills: combine both lists, remove duplicates
   - Experience: use more recent or comprehensive
   - Rates/salary: use higher or combine
   - Source: combine "Dice + direct referral"
   - Notes: append both records' notes with timestamp
   - Status: use active if one is active, otherwise merged status
   - Team: choose which team owns merged record

3. **Merge data fields:**
   - Primary email: [primary candidate]
   - Secondary email (if different): [secondary candidate email]
   - Phone 1: [primary phone]
   - Phone 2 (if different): [secondary phone]
   - Skills combined: [all skills from both]
   - Current company: [most recent]
   - Total years experience: [highest]
   - Interactions combined: all emails, calls, interviews linked to merged record
   - Documents combined: all resumes, offer letters, etc. linked to merged record

4. **Activity & interaction consolidation:**
   - All interactions from secondary record transferred to primary
   - Example: if secondary candidate was contacted by different recruiter, that interaction logged
   - Interview feedback from both candidates merged
   - Offer status: if one has offer, that preserved
   - Placement status: if one placed, that marked on primary

5. **Finalize merge:**
   - Confirm all data merged correctly
   - Click "Confirm Merge"
   - Secondary record marked as "Merged into [Primary ID]"
   - Secondary record not deleted (for audit trail), but hidden from normal searches
   - Activity log records: who merged, when, which records
   - Merged count incremented

#### Duplicate Prevention

1. **Duplicate detection during candidate creation:**
   - When recruiter creates new candidate: system checks for potential matches
   - If match found: warning displayed "Similar candidate already exists: [name], email: [email]"
   - Warning shows match score (%) and link to existing candidate
   - Recruiter can: merge with existing (cancel new creation) or create new (if false alarm)

2. **Deduplication during import:**
   - CSV import with duplicate detection enabled (default)
   - System scans import file for duplicates within file (same email appears twice)
   - System checks against existing database (email already exists)
   - Options during import: skip (don't import), merge (combine), overwrite (replace)

3. **Team training on duplicates:**
   - New recruiter training: how to search before creating candidate
   - Search by email first, then by name, then by phone
   - If candidate exists: update existing record, don't create new
   - Monthly duplicate metrics shared with team
   - Recruiter with most duplicates gets coaching

#### Quarterly Duplicate Audit

1. **Manual audit process:**
   - Admin → Data Quality → Duplicate Audit Report
   - Report shows: # potential duplicates, # merged this quarter, # false positives
   - Sample 50 flagged candidates, manually review
   - Verify: merge decisions were correct, no actual duplicates missed
   - Review: duplicates caused by each team (identify process issues)

2. **Tune duplicate detection rules:**
   - If too many false positives: reduce matching threshold (be more conservative)
   - If duplicates being missed: increase matching threshold (be more aggressive)
   - Monitor merge success rate: after merging, verify no issues found later
   - Update rules based on findings

**Tools Used:** InTime Admin Dashboard (Data Quality module), duplicate detection algorithm
**Escalation:** Significant data loss during merge → restore from backup; questions on merge decision → escalate to Data Quality Manager

---

### 5.3 Data Quality: Quarterly Audits, Completeness Scoring, Cleanup Campaigns

**Purpose:** Maintain high-quality candidate data for accurate reporting and client delivery
**Owner:** System Administrator / Data Quality Manager
**Review cadence:** Monthly monitoring, quarterly deep audit, annual improvement plan

#### Data Quality Metrics

1. **Completeness scoring:**
   - Each candidate record scored 0-100% on completeness
   - Score based on: name (required), email (required), phone (required), skills, experience, rates, location, source, last contact date
   - Required fields: if missing → penalize 20% each
   - Recommended fields: if missing → penalize 5% each
   - Score displayed in candidate record: "Data Completeness: 85%"

2. **Quality thresholds:**
   - Excellent: 90-100% (candidate ready for client submission)
   - Good: 75-89% (minor data needs before submission)
   - Fair: 50-74% (needs data update before submission)
   - Poor: <50% (needs significant work)

3. **Monitor data quality trends:**
   - Dashboard metric: "% of candidates with completeness >80%"
   - Target: 85%+ of candidates in Good or Excellent category
   - Trend: track monthly to see if improving or declining
   - Alert: if trend drops below 80%, flag for campaign

#### Monthly Data Quality Monitoring

1. **Monitor incoming data quality:**
   - New candidates added each month from job board imports
   - Check: email validation rate, phone validation rate, skills populated rate
   - If import quality declining: review field mapping with job board
   - Track by source: which job board has best/worst data quality?

2. **Monitor active candidate data:**
   - Candidates with last contact >90 days ago: consider archiving
   - Candidates with no email/phone: flag for followup
   - Candidates with conflicting information (2 different experience levels): flag for review
   - Report: "Data Quality Issues This Month: 23 candidates need attention"

3. **Data quality dashboard:**
   - Admin Dashboard → Data Quality → Monthly Report
   - Shows: completeness distribution, validation errors, data gaps by field
   - Allows drill-down: see which candidates have missing data, which teams

#### Quarterly Data Quality Audit

1. **Plan audit:**
   - Scope: all candidates (or sample of 500+)
   - Timeline: 2 weeks planning, 1 week execution, 1 week review
   - Team: Data Quality Manager + 1-2 analysts
   - Process: spot-check records, identify patterns of poor quality

2. **Execute audit:**
   - Sample 20-30 random candidates from each team
   - Review each candidate record:
     - Name: properly formatted? matches any background check?
     - Email: valid syntax? verified as working? (can send test email)
     - Phone: valid? Indian format if India-based, US format if US-based?
     - Skills: complete list? correct spelling? relevant to roles?
     - Experience: years make sense (e.g., 10 years experience but only 25 years old = error)?
     - Rates: within industry range? have we verified this?
     - Status: is current status accurate? (placed, active, not interested, etc.)
     - Notes: are notes useful and recent? (what was last contact?)
     - Documents: resume attached and readable?

3. **Document findings:**
   - For each error type, note: frequency, root cause (recruiter error vs. data import issue)
   - Examples of issues found:
     - Missing skills in 15% of candidates
     - Phone numbers with wrong format (missing country code) in 12%
     - Outdated status (candidates marked "Active" but last contact 200 days ago) in 20%
     - Duplicate email addresses (should have been merged) in 5%

4. **Publish audit report:**
   - Summary: data quality score by team, by candidate source, by data type
   - Issues by severity: critical (blocks client submission), major (needs fix), minor (nice to have)
   - Root cause analysis: why are issues occurring?
   - Recommendations: process changes, training needs, automation improvements
   - Distribute to leadership, team leads, all recruiters

#### Data Cleanup Campaigns

1. **Plan cleanup campaign:**
   - Identify issue: e.g., "60% of candidates missing skills"
   - Scope: which candidates affected? (all, or specific team/source?)
   - Timeline: 2 weeks to clean
   - Responsibility: who will update data? (data team, recruiters, manager)
   - Target: e.g., "increase % with skills from 40% to 80%"

2. **Execute cleanup:**
   - Generate list of affected candidates
   - Assign to recruiters or data team for updating
   - Recruiter: review candidate, add missing skills (research resume/profile)
   - Data team: batch update where possible (e.g., all candidates from Dice → add "Dice" source)
   - Verify: spot-check 10% of cleaned records to ensure quality

3. **Common cleanup campaigns:**
   - **Missing skills:** assign to recruiter, have them research and add from resume
   - **Invalid phone numbers:** validate format, correct if obvious typo, delete if impossible
   - **Outdated status:** review last contact date, update to "archived" if >6 months
   - **Duplicate detection:** run merge campaign to consolidate duplicate emails
   - **Missing location:** update from resume or phone number area code
   - **No source:** classify candidates by how we sourced them (Dice, referral, etc.)

4. **Track cleanup progress:**
   - Dashboard metric: "Data cleanup campaign progress: 45/100 candidates updated"
   - Weekly status: how many updated, any blockers?
   - Report: before/after quality score, improvement %

#### Data Cleanup Automation

1. **Automated data enrichment:**
   - Integration with data enrichment service (if available)
   - Candidate email → lookup phone, location, company, LinkedIn profile
   - Fill missing data fields automatically (if high confidence)
   - User review: confirm auto-populated data before saving

2. **Validation rules:**
   - Set rules to automatically catch/flag bad data:
     - Email format validation (before saving)
     - Phone format validation (before saving)
     - Years experience logical check (can't be negative or >80)
     - Rate check (outside normal range → flag for review)

3. **Bulk fixes:**
   - Admin → Data Management → Bulk Update
   - Fix common issues in bulk, e.g., "Replace all phone numbers with '9' in first position with '9-'"

**Tools Used:** InTime Admin Dashboard (Data Quality module), audit spreadsheet, cleanup tracking
**Escalation:** Significant data quality issue (>30% of candidates affected) → escalate to Data Quality Manager/Leadership

---

### 5.4 Backup & Disaster Recovery (covered in section 3.5)

Refer to **Section 3.5: Data Backup: Frequency, Testing, Recovery Procedures** for comprehensive backup and disaster recovery details.

---

## 6. Workflow Automation

### 6.1 Email Template Management: Creation, Approval, Version Control

**Purpose:** Standardize candidate communications, maintain brand consistency, ensure compliance
**Owner:** Marketing/HR Lead with Admin approval
**Review cadence:** Quarterly template audit, immediate review before deployment

#### Email Template Categories

1. **Recruiting templates:**
   - Initial outreach: "Exciting opportunity for Java Developer"
   - Screening confirmation: "Thank you for your time on the screening call"
   - Interview invitation: "We'd like to invite you to interview for [role]"
   - Offer letter: formal offer with salary, benefits, start date
   - Rejection: professional decline after screening/interview
   - On-hold: status update during extended hiring process
   - Reactivation: "We have a new opportunity matching your profile"

2. **Onboarding templates:**
   - Welcome email: new hire joining, orientation schedule
   - Pre-boarding checklist: documents to complete before day 1
   - Day 1 logistics: location, parking, badge pickup, team meet-and-greet
   - 30-day check-in: how's your first month going?

3. **Administrative templates:**
   - Password reset confirmation
   - MFA enrollment reminder
   - Upcoming meeting reminder
   - Leave request approved
   - Document signature request

#### Email Template Creation Process

1. **Request new template:**
   - Identify need: what communication is needed?
   - Example: "We need a template for candidate rejection after initial screening"
   - Request: Marketing/HR Lead creates draft in Google Docs, shares with team
   - Includes: from, to, subject, body, any merge fields ({{candidate_name}}, {{job_title}})

2. **Draft template:**
   - Write email message:
     - Professional tone, friendly, brand-aligned
     - Clear call to action (if applicable)
     - Include company logo, footer with contact info
     - Use merge fields for dynamic content
   - Example merge fields: {{candidate_name}}, {{recruiter_name}}, {{interview_date}}, {{offer_salary}}
   - Attach or embed any documents (offer letter, agenda, etc.)

3. **Review and approval:**
   - Marketing/HR Lead → System Administrator → Admin approval
   - Marketing checks: tone, branding, formatting
   - Compliance check: no promises that can't be kept, legal language correct
   - Admin check: merge fields valid, template technical correct
   - Require sign-off before proceeding

4. **Load template into platform:**
   - Admin Dashboard → Communications → Email Templates
   - Click "Create New Template"
   - Template name: "Candidate Rejection - Initial Screening" (descriptive)
   - Category: Recruiting / Onboarding / Admin
   - From: [default company email]
   - Subject: "Application Update for [Job Title]"
   - Body: paste HTML or plain text
   - Merge fields: add any {{field}} that will be populated from candidate record
   - Preview: system shows what email looks like with sample data
   - Save as draft

5. **Test template:**
   - Admin sends test email to own email address
   - Verify: formatting correct, merge fields populated, no HTML errors
   - If issues: go back to draft, fix, test again

6. **Activate template:**
   - Once tested: change status from "Draft" to "Active"
   - Now available for all users to send
   - Track: template created date, created by, last updated, approved by

#### Template Versioning & Control

1. **Version numbering:**
   - Template name includes version: "Offer Letter v2.1"
   - Version X.Y: X = major version (significant content change), Y = minor (formatting, typos)
   - Changelog: document what changed in each version

2. **Version history:**
   - Admin Dashboard shows all versions of template
   - Can view old versions, compare versions side-by-side
   - Roll back to previous version if needed
   - Audit trail: who changed what and when

3. **Managing template updates:**
   - Update existing template (creates new version, keeps old)
   - Example: update "Candidate Rejection" email with new company footer
   - All future emails use new version
   - Old version available if need to resend using legacy template

4. **Retiring old templates:**
   - When template no longer needed: mark as "Inactive"
   - Inactive templates hidden from dropdown but still accessible (archive)
   - Don't delete (for audit trail)

#### Email Template Compliance & Quality

1. **Compliance checks:**
   - No discriminatory language
   - No promises that InTime can't keep
   - Legal review for offer letters (salary, benefits, terms)
   - Data protection: no request for sensitive data (SSN, etc.)
   - Accessibility: readable by screen readers, good contrast

2. **Frequency and tone check:**
   - Don't send too many emails (candidate fatigue)
   - Avoid duplicate communications
   - Friendly but professional tone
   - Personalization: address candidate by name, reference specific role

3. **Merge field validation:**
   - System checks: are all merge fields available in candidate record?
   - Warning: if merge field not in record, shows {{field_missing}}
   - Training: recruiter learns to verify data complete before sending

#### Template Library

1. **Searchable template library:**
   - Admin Dashboard → Communications → Email Templates
   - Search by: name, category, use (recruiting, onboarding, etc.)
   - Sort by: recently used, most used, date created, author
   - Includes template description, merge fields required, approval status

2. **Template usage tracking:**
   - System tracks: # of times template used, by whom, date ranges
   - Identify: most-used templates (maybe need multiple versions)
   - Identify: unused templates (good candidates for retirement)
   - Improves: optimize templates that are frequently used

**Tools Used:** InTime Admin Dashboard (Communications → Email Templates), Google Docs (drafting), email testing
**Escalation:** Non-compliant template published → immediately mark inactive, communicate to team, fix and re-approve

---

### 6.2 Automated Notifications: Triggers, Recipients, Escalation Chains

**Purpose:** Keep team informed of important events without manual email sending
**Owner:** System Administrator
**SLA:** Notification sent within 5 minutes of trigger; escalation within 2 hours

#### Notification Triggers & Recipients

**Recruiting notifications:**

| Trigger | Recipients | Action |
|---------|-----------|--------|
| Candidate submitted to client | Recruiting Lead, BDM, account manager | "Candidate [name] submitted to [client] for [job]" |
| Interview scheduled | Candidate, recruiter, hiring manager, InTime admin | Calendar invite + email confirmation |
| Offer sent to candidate | HR Lead, recruiting lead, BDM | "Offer sent to [candidate] for [job]" |
| Offer accepted | All team leads, accounting | "Candidate [name] starts [date]" |
| Candidate rejected | Recruiting lead, recruiter | "Candidate [name] no longer in consideration" |
| Job not filled within 30 days | Recruiting lead, BDM | "Job [title] at [client] open 30+ days — discuss strategy" |

**Administrative notifications:**

| Trigger | Recipients | Action |
|---------|-----------|--------|
| User created | New user, their manager, IT admin | "Welcome! Your InTime account created. First login: [link]" |
| Failed login (5+ attempts) | User, IT admin | "Warning: Failed login attempts on your account" |
| API integration failed | System admin, integration owner | "Alert: Dice job board sync failed. Last sync: [time]. Action needed." |
| Backup failure | System admin, CTO | "Critical: Automated backup failed. Manual intervention required." |
| User offline for 30 days | System admin | "User [name] inactive 30 days — consider archiving account" |

**Performance notifications:**

| Trigger | Recipients | Action |
|---------|-----------|--------|
| Recruiter fills 5 candidates | Recruiting lead, recruiter | "Congratulations! [name] has placed 5 candidates this month." |
| Team reaches hiring target | Team lead, management | "Team [name] has reached monthly hiring target!" |
| SLA exceeded (job unfilled >45 days) | BDM, recruiting lead | "Job [title] at [client] approaching SLA deadline — escalate" |

#### Notification Configuration

1. **Create notification rule:**
   - Admin Dashboard → Automation → Notifications
   - Click "Create New Notification Rule"
   - Rule name: descriptive (e.g., "Job Unfilled 30+ Days Alert")
   - Trigger: select from dropdown (e.g., "Job open 30 days")
   - Frequency: when trigger occurs (real-time), or daily digest

2. **Set recipients:**
   - Add recipients: role-based or specific people
   - Example: "Send to: Recruiting Lead, BDM for this job"
   - Example: "Send to: specific email addresses" (if static group)
   - Example: "Send to: candidate" (merge field from record)

3. **Select message template:**
   - Choose from pre-created message templates (see 6.1)
   - Or create custom message with merge fields
   - Preview: shows how message looks with sample data

4. **Set escalation (if not responded):**
   - Primary recipient: [recruiting lead]
   - If not acknowledged within 48 hours: escalate to [BDM]
   - If not acknowledged within 72 hours: escalate to [training lead]

5. **Test & activate:**
   - Test: trigger rule manually with sample data
   - Verify: correct recipients receive notification
   - If correct: activate rule (rule is now live)

#### Escalation Chains

**Example escalation chain for "Job not filled within 30 days"**

```
Tier 1 (24 hours): Recruiting Lead
  - Message: "Job [title] at [client] open 30 days. Update plan?"

Tier 2 (48 hours, if no response): BDM/Account Manager
  - Message: "Job [title] at [client] still open. Need to discuss with client."

Tier 3 (72 hours, if no response): Delivery Manager + Training Lead
  - Message: "Job [title] at [client] critical. Escalating to management."

Escalation resolution: Manager calls BDM + recruiting lead, review job requirements, candidate pipeline, salary competitiveness
```

**Example escalation chain for "System integration down"**

```
Tier 1 (15 minutes): System Admin
  - Alert: "Job board sync failed. Investigating..."

Tier 2 (30 minutes, if no resolution): Integration Manager
  - Alert: "Dice API down. Attempting manual sync."

Tier 3 (1 hour, if no resolution): CTO/Tech Lead
  - Alert: "Dice integration offline >1 hour. Critical issue."

Action: Contact Dice support, check if their servers down, check our API credentials, consider failover
```

#### Notification Channels

1. **Email notifications:**
   - Default channel for all alerts
   - Subject line captures main point
   - Body includes: context, action required, link to InTime dashboard

2. **Slack notifications:**
   - Critical/urgent notifications also sent to Slack #alerts
   - Slack message: concise, includes link to InTime
   - Example: "Job [title] at [client] open 30 days. [Link to job details]"

3. **In-app notifications:**
   - Dashboard widget: shows latest 5 notifications
   - Bell icon with unread count
   - Click to view full notification and mark as read

#### Notification Preferences

1. **User notification settings:**
   - User Settings → Notifications
   - Toggle notifications on/off for each type
   - Choose channel: email only, Slack only, both
   - Set quiet hours: no notifications between 6 PM - 8 AM

2. **Admin-wide settings:**
   - Admin Dashboard → Settings → Notification Defaults
   - Set company-wide: should notifications be urgent or low-key?
   - Frequency: immediately or digest (daily/weekly)?

**Tools Used:** InTime Admin Dashboard (Automation → Notifications), email service, Slack integration
**Escalation:** Notifications not delivering → check email delivery service, Slack integration status

---

### 6.3 Activity Patterns: Daily Task Automation, Reminder Sequences

**Purpose:** Reduce manual work through automation, improve task completion rate
**Owner:** System Administrator
**Cadence:** Weekly review of automation performance, quarterly optimization

#### Daily Task Automation

1. **Daily candidate reminder automation:**
   - Trigger: 8:00 AM daily
   - Action: "Reminder: 5 candidates need follow-up today"
   - Task: call/email candidates who haven't been contacted in 7+ days
   - Recipient: assigned recruiter
   - Delivery: email + Slack + dashboard widget

2. **Daily job board sync automation:**
   - Trigger: 11:00 PM daily
   - Action: sync all job postings to boards, import candidates
   - Automatic: no human intervention needed
   - Result: log in system, alert if sync failed
   - Recipient: system admin (if errors)

3. **Daily data quality check:**
   - Trigger: 6:00 AM daily
   - Action: scan for candidates with missing critical data
   - Result: report of 10-20 candidates needing data updates
   - Recipient: data quality manager
   - Action: assign to recruiter for updates

4. **Daily performance email:**
   - Trigger: 5:00 PM daily
   - Recipients: recruiting lead, BDM
   - Content: "Today's metrics: 3 candidates submitted, 1 interview, 0 offers"
   - Trend: compared to yesterday, compared to monthly average
   - Goal: keep team informed of daily progress

#### Reminder Sequences

1. **Candidate follow-up reminder sequence:**
   - Day 1: Automated reminder "Follow up with [candidate] today"
   - Day 3: Reminder "Still need to contact [candidate] — high priority"
   - Day 5: Escalation "Follow-up overdue for [candidate]. Escalating to manager."
   - Recipient: recruiter first, then manager

2. **Interview preparation reminder sequence:**
   - 7 days before: "Interview with [candidate] in 7 days. Send prep materials?"
   - 3 days before: "Reminder: Interview in 3 days. Confirm with candidate?"
   - 1 day before: "Interview tomorrow. Hiring manager — confirm you'll attend?"
   - 1 hour before: "Interview starting in 1 hour. Join meeting [link]"

3. **Onboarding reminder sequence:**
   - 30 days before start: "New hire [name] starts in 30 days. Pre-boarding docs sent?"
   - 7 days before: "New hire [name] starts next week. IT setup complete?"
   - 1 day before: "New hire [name] starts tomorrow. Meet at reception desk 9 AM."
   - Day 1: "Welcome [name]! Orientation starts at 9:30 AM. Buddy [buddy_name] standing by."
   - Day 7: "New hire 1 week in. How's [name] doing? Manager check-in."
   - Day 30: "30-day check-in for [name]. Complete onboarding feedback form."

#### Automated Task Assignment

1. **Auto-assign task to recruiter:**
   - Trigger: New job posted by client
   - Action: Assign to next available recruiter (round-robin assignment)
   - Task: "Screen candidates for [job title] at [client]"
   - SLA: First candidate submission within 5 days

2. **Auto-assign interview:**
   - Trigger: Candidate approved for interview
   - Action: Invite hiring manager + recruiter to calendar
   - Task: Prepare interview questions, review resume
   - SLA: Interview scheduled within 3 days

3. **Auto-escalate overdue tasks:**
   - Trigger: Task due date passed without completion
   - Action: Mark as overdue, notify assignee
   - Day 1 overdue: "Task [name] due. Update status?"
   - Day 3 overdue: "Task [name] now 3 days overdue. Manager notified."
   - Day 7 overdue: "Task [name] 7 days overdue. Escalating to team lead."

#### Automation Performance Monitoring

1. **Track automation effectiveness:**
   - Metric: % of candidates followed up same day (goal: 80%+)
   - Metric: average days to first candidate submission (goal: <3 days)
   - Metric: % of interviews prepared 1 day in advance (goal: 95%+)
   - Dashboard: automation effectiveness score (0-100)

2. **Monitor automation failures:**
   - Alert if automation didn't trigger (e.g., reminder not sent)
   - Alert if automation action failed (e.g., email bounced)
   - Log: all automation activity, troubleshoot failures

3. **Optimize automation:**
   - Review effectiveness monthly
   - If low adoption/engagement: adjust reminder frequency or content
   - If high adoption: consider expanding to other processes
   - Gather feedback: ask users if automations helpful

**Tools Used:** InTime Admin Dashboard (Automation → Activity Patterns), email service, Slack
**Escalation:** Automation not delivering consistently → escalate to System Administrator

---

### 6.4 Business Rules: Auto-assignment, Routing, SLA Enforcement

**Purpose:** Automatically direct work to right person, ensure SLAs met, reduce manual assignment
**Owner:** System Administrator with input from managers
**Review cadence:** Quarterly to ensure rules match current team structure

#### Auto-assignment Rules

1. **Candidate auto-assignment to team:**
   - Rule: Candidates sourced from job board → assigned to Recruiting Pod A
   - Rule: Candidates from referral → assigned to Recruiting Pod B
   - Rule: Candidates from LinkedIn Recruiter → assigned to Premium Pipeline team
   - Result: candidate automatically assigned when created

2. **Job auto-assignment to recruiter:**
   - Rule: Java Developer job → assign to Java specialist recruiters (round-robin)
   - Rule: Guidewire job → assign to Guidewire-trained recruiters
   - Rule: US Northeast region → assign to East Coast team
   - Result: new job automatically assigned when posted

3. **Interview auto-assignment:**
   - Rule: Screen interview → assign to designated screener (round-robin)
   - Rule: Technical interview → assign to hiring manager matching technology
   - Rule: Final interview → assign to BDM (for relationship building)

4. **Escalation auto-routing:**
   - Rule: Any task overdue >3 days → escalate to manager
   - Rule: Any job unfilled >30 days → escalate to Delivery Manager
   - Rule: Any candidate rejection request → route to Recruiting Lead for approval

#### Routing Rules

1. **Candidate routing by skill:**
   - Candidate has Guidewire skill → route to Guidewire Pod
   - Candidate has Java skill → route to Java Pod
   - Candidate has AWS skill → route to Cloud Team
   - If multiple skills → route to team with most specific match

2. **Job routing by geography:**
   - Client in New York → route to East Coast team
   - Client in California → route to West Coast team
   - Client in Midwest → route to Central team
   - Remote job → route to National pool

3. **Client communication routing:**
   - Email from [client] → route to assigned BDM
   - Request for specific skill → route to specialist recruiter
   - Escalation → route to Delivery Manager

#### SLA Enforcement

1. **Define SLAs:**
   - First candidate submission: within 5 days of job posting
   - Interview scheduling: within 3 days of candidate approval
   - Offer preparation: within 5 days of interview completion
   - Onboarding: within 1 week of offer acceptance
   - Response to candidate inquiry: within 24 hours

2. **Monitor SLAs:**
   - System tracks each job/candidate against SLA deadline
   - Dashboard shows: on track, at risk (>75% of time used), overdue
   - Alert: if at risk, notify recruiter and manager
   - Alert: if overdue, escalate to Delivery Manager

3. **SLA reporting:**
   - Weekly: SLA compliance report to leadership
   - Metric: % of jobs meeting SLA (goal: 95%+)
   - Metric: % of candidates responded to within SLA (goal: 98%+)
   - Identify: teams/recruiters with low SLA compliance
   - Action: coaching, workload adjustment, process improvement

4. **SLA exception handling:**
   - If SLA cannot be met: requester marks as "SLA waived" with reason
   - Example: candidate unavailable for 2 weeks → SLA extended
   - Tracked: # of waivers, reasons for waivers
   - Escalation: if >10% of SLAs waived, investigate root cause

**Tools Used:** InTime Admin Dashboard (Automation → Business Rules), rule builder interface
**Escalation:** Rules not working as intended → escalate to System Administrator to debug

---

## 7. System Health

### 7.1 Performance Monitoring: Response Times, Uptime, Error Rates

**Purpose:** Ensure platform runs smoothly, identify issues before they impact users
**Owner:** System Administrator / Infrastructure Team
**SLA:** Monitor 24/7, resolve critical issues within 30 minutes

#### Performance Metrics

1. **Response time metrics:**
   - Page load time: <3 seconds (goal: <2 seconds)
   - API response time: <500 ms (goal: <200 ms)
   - Database query time: <100 ms (goal: <50 ms)
   - Search results: <1 second (goal: <500 ms)
   - Report generation: <10 seconds (goal: <5 seconds)

2. **Uptime metrics:**
   - System availability: 99.9% (goal: 99.95%)
   - Planned maintenance: <2 hours per month (typically weekends)
   - Unplanned downtime: <1 hour per quarter

3. **Error rate metrics:**
   - Failed API calls: <0.1% (goal: <0.01%)
   - Failed job board syncs: <1 per month
   - Failed email sends: <0.1%
   - Database errors: <10 per day

#### Monitoring Tools & Dashboards

1. **InTime system monitoring:**
   - Admin Dashboard → System Health → Performance Monitor
   - Real-time dashboard shows:
     - Current response time (with green/yellow/red indicator)
     - Uptime percentage (last 7, 30, 90 days)
     - Error rate (last 24 hours, 7 days, 30 days)
     - API call volume (requests per minute)
     - Database connection pool status
     - Background job queue (pending/completed)

2. **External monitoring (if available):**
   - Third-party service: DataDog, New Relic, or similar
   - Monitors: availability, performance, errors
   - Alerts: sent to admin if thresholds exceeded

3. **Application logs:**
   - All errors logged with timestamp, user, action, error code
   - Logs retained for 30 days (searchable)
   - Admin Dashboard → System Health → Error Logs

#### Performance Alerts

**Critical alerts (immediate action)**
- Page response time >10 seconds
- API error rate >1%
- System downtime (all users cannot access)
- Database down or unreachable
- Disk space <5% remaining

**High alerts (urgent, within 1 hour)**
- Page response time 5-10 seconds
- API error rate 0.5-1%
- Intermittent downtime (some users affected)
- Database query timeout
- Disk space 5-10% remaining

**Medium alerts (standard, within 4 hours)**
- Page response time 2-5 seconds (slower than normal)
- API error rate 0.1-0.5%
- Search functionality slow
- Report generation slow

#### Response Procedures

**For critical performance issues:**
1. Page immediately appears showing system degradation notice
2. User impacted immediately receives alert
3. System admin notified via Slack #critical-alerts, SMS, email (multiple channels)
4. Admin logs into monitoring dashboard to assess issue
5. If infrastructure issue (server down): initiate failover to backup
6. If code issue (memory leak, slow query): identify problem query and kill it
7. If database issue: restart database service, check for locks
8. If persistent: escalate to CTO and begin incident response protocol
9. Once resolved: send all-clear message to affected users
10. Post-incident: review error logs, identify root cause, prevent recurrence

**For high or medium performance issues:**
1. Monitor closely over next 1-2 hours
2. If resolves on its own: log and monitor for patterns
3. If persists: investigate root cause
4. If identified: apply fix or workaround
5. Monitor for 24 hours post-fix to ensure stable

---

### 7.2 User Issue Troubleshooting: Common Issues, Escalation Path

**Purpose:** Resolve user problems quickly, maintain productivity
**Owner:** IT Support / System Administrator
**SLA:** Respond to ticket within 30 minutes; resolve within 4 hours for critical issues

#### Common Issues & Solutions

| Issue | Symptoms | Root Cause | Solution |
|-------|----------|-----------|----------|
| **Cannot login** | Login page shows error or page doesn't load | Incorrect password, account disabled, SSO down | Verify password, unlock account, check SSO status |
| **Cannot find candidate** | Search returns no results for existing candidate | Candidate archived, deleted, or permission issue | Check if candidate exists, restore if deleted, check permissions |
| **Email not sending** | Candidate doesn't receive email from InTime | Email service down, invalid address, HTML formatting | Check email service status, verify address, simplify formatting |
| **Job not posting** | Job created but not appearing on job boards | Board sync failed, board down, API credentials wrong | Check sync status, verify job board availability, test API |
| **Slow performance** | System is slow, takes long time to load pages | High database load, many users active, network slow | Check performance metrics, reduce background jobs, notify users |
| **Browser issues** | InTime looks broken, elements not displaying | Browser cache, outdated browser, JavaScript error | Clear cache, update browser, test in different browser |
| **Integration failure** | Integration shows "failed" status, data not syncing | API credentials expired, service down, network error | Verify credentials, check service status, test connection |
| **Data discrepancy** | Candidate data in InTime differs from original source | Data import error, user edit, sync overwrite | Identify which is correct, restore if needed, prevent future |

#### Troubleshooting Checklist

**When user reports an issue:**
1. Gather information:
   - What were they trying to do?
   - What did they see? (screenshot if possible)
   - When did it start?
   - Who else affected?
   - What have they tried?

2. Attempt basic troubleshooting:
   - Refresh page (Ctrl+F5)
   - Clear browser cache
   - Try different browser
   - Check if other features work
   - Ask if anyone else experiencing same issue

3. Investigate in system:
   - Check system health dashboard (performance, errors)
   - Check error logs for relevant errors
   - Check user permissions
   - Check integration status if relevant
   - Check if service/third-party down

4. Escalate if needed:
   - If infrastructure issue: escalate to CTO
   - If integration issue: escalate to Integration Manager
   - If feature bug: escalate to development team
   - If complex: escalate to tech lead

#### Escalation Path

**Level 1: IT Support / Help Desk**
- Tier 1 can resolve: password reset, account unlock, basic troubleshooting
- Cannot resolve: escalate to Level 2
- SLA: respond within 30 minutes, resolve within 2 hours if possible

**Level 2: System Administrator**
- Can resolve: integration troubleshooting, data issues, permission problems
- Cannot resolve: escalate to Level 3
- SLA: respond within 1 hour, resolve within 4 hours

**Level 3: CTO / Tech Lead**
- Can resolve: infrastructure issues, code bugs, architecture changes
- Serious/complex issues only
- SLA: respond within 2 hours, resolve within 24 hours

**Escalation communication:**
- When escalating: include all information gathered
- Include: user name, issue description, what's been tried, error logs/screenshots
- Include: who escalated, when, urgency level

**Tools Used:** InTime Admin Dashboard, error logs, help desk ticket system
**Escalation:** Critical issue affecting multiple users → escalate immediately to CTO

---

### 7.3 Update Management: Staging, Testing, Deployment, Rollback

**Purpose:** Deploy system updates safely without disrupting users
**Owner:** System Administrator / Dev Ops
**Process:** All updates must go through staging → testing → approved before production deployment

#### Update Types & Process

**1. Security patches (critical)**
- Timeline: Deploy within 48 hours of availability
- Testing: minimal (security patch has been vetted by vendor)
- Deployment: during low-usage window or immediately if critical vulnerability
- Rollback: keep previous version available, test rollback plan

**2. Bug fixes (standard)**
- Timeline: Deploy next scheduled maintenance window (weekly or monthly)
- Testing: full test cycle on staging environment
- Deployment: during scheduled maintenance window (e.g., Saturday 2-4 AM IST)
- Rollback: keep previous version, test rollback plan before deployment

**3. Feature updates (planned)**
- Timeline: quarterly release cycle (Feb, May, Aug, Nov)
- Testing: 2-week testing cycle in staging
- Deployment: scheduled downtime (1-2 hours), all users notified 1 week ahead
- Rollback: keep previous version, test rollback plan before deployment

#### Staging Environment

1. **Staging setup:**
   - Exact copy of production database and configuration
   - No real user data (sanitized copy)
   - Code and updates deployed to staging first
   - Isolated from production (cannot affect live system)

2. **Staging testing process:**
   - Develop: write code/update on dev branch
   - Deploy to staging: push code to staging environment
   - Test: QA team tests in staging (1-2 weeks for major updates)
   - Verify: test critical flows, integrations, performance
   - Fix issues: if bugs found, fix and re-test

3. **Test cases:**
   - User login (SSO, MFA)
   - Candidate management (create, edit, delete, search)
   - Job posting (create, sync to boards, monitor)
   - Email sending (template merge fields, delivery)
   - Integration (job board sync, email sync, payroll)
   - Reporting (run standard reports, check data accuracy)
   - Performance (load test, response time check)

#### Deployment Process

1. **Pre-deployment checklist:**
   - Staging testing complete and signed off
   - All issues resolved or documented
   - Rollback plan tested and verified
   - Release notes prepared
   - Downtime window scheduled (if needed)
   - Users notified (1 week ahead)

2. **Deployment timing:**
   - Schedule: Saturday 2-4 AM IST (low usage, minimizes impact)
   - For critical security patches: deploy immediately, notify users after
   - Expected downtime: 30 minutes - 2 hours (depends on update size)

3. **Deployment steps:**
   - Create backup of production database (before any changes)
   - Stop background jobs (so no partial writes)
   - Deploy code: push update to production servers
   - Run database migrations (if applicable)
   - Restart application services
   - Verify system is up and responding
   - Run smoke tests (basic functionality check)
   - Monitor for errors for next 2 hours

4. **Post-deployment:**
   - Check error logs for any new issues
   - Monitor performance (response time, uptime)
   - Get feedback from early users
   - Communicate status to all users: "Update successful, system fully operational"

#### Rollback Procedure

1. **Decide to rollback:**
   - Critical issue discovered post-deployment
   - System unstable or performing poorly
   - Major data corruption
   - Integration failure preventing core work

2. **Execute rollback:**
   - Identify issue: what went wrong?
   - Stop production services
   - Restore database from pre-deployment backup
   - Revert code to previous version
   - Restart services
   - Verify system operational
   - Notify users: "Deployed update encountered issue, rolled back to previous version"

3. **Post-rollback investigation:**
   - Review what went wrong
   - Investigate staging test that should have caught issue
   - Fix code issue or update test case
   - Re-test on staging (2+ days)
   - Re-deploy when confident

#### Release Notes & Communication

1. **Prepare release notes:**
   - Summary: what's new, what's fixed
   - For users: new features explained simply
   - For admins: configuration changes, data migration details
   - Known issues: if any identified post-deployment
   - Update date, version number

2. **Communicate to users:**
   - Email: 1 week before deployment (if downtime expected)
   - Email: day before deployment (reminder)
   - In-app banner: on deployment day (system will be down X to Y hours)
   - Email: after deployment complete (system is back up, summary of changes)

**Tools Used:** Git version control, staging environment, database backup/restore, monitoring tools
**Escalation:** Rollback unable to complete → escalate to CTO immediately; data loss suspected → escalate to data recovery team

---

### 7.4 License & Subscription Management

**Purpose:** Track and optimize software licenses and paid subscriptions
**Owner:** System Administrator / Finance Manager
**Review cadence:** Monthly license usage, quarterly renewal planning, annual cost audit

#### License Inventory

1. **InTime platform licenses:**
   - Type: per-user seat license
   - Current: 16 seats (Training Lead, Trainer, Screening Lead, BDM, Bench Lead, Recruiting Lead, Delivery Manager, 9 interns)
   - Cost: $X per user per month (example: $500/month per seat = $8,000/month)
   - Renewal: monthly or annual (if annual, 10% discount typically)
   - Track: Admin Dashboard → Organization → License Management

2. **Job board subscriptions:**
   - Dice: $X/month (posting, candidate search, InMail)
   - Monster: $X/month (posting, resume database, InMail)
   - CareerBuilder: $X/month (posting, candidate sourcing, background check integration)
   - LinkedIn Recruiter Lite: $X/month (access to 15M+ candidates, InMail)
   - Indeed Sponsored: $X/spend (pay-per-click model, budget: $X/month)
   - Total job board cost: $X/month

3. **Integration/tool subscriptions:**
   - Google Workspace (email): 16 users × $6/user = $96/month
   - Slack: 16 users × $6/user = $96/month
   - 1Password (password vault): 16 users × $3/user = $48/month
   - AWS (hosting, storage, backup): $X/month
   - Other: monitoring, analytics, etc. = $X/month

4. **Total software spending:**
   - InTime platform: $8,000/month
   - Job boards: $3,000/month
   - Google/Slack/tools: $300/month
   - Infrastructure/AWS: $1,000/month
   - **Total: ~$12,300/month = $147,600/year**

#### License Usage Tracking

1. **Monitor active licenses:**
   - Dashboard: Admin → Licenses → Usage
   - Shows: # of active users, # of seats in use, # of unused seats
   - Goal: maximize seat utilization (>95% used)
   - Alert: if unused seats >1, evaluate if needed for future hiring

2. **Track job board usage:**
   - Dice: # of jobs posted, # of candidates sourced, cost per candidate
   - Monster: same metrics
   - LinkedIn: # of InMails sent, # of candidates contacted, cost per hire
   - Indeed: # of clicks, # of applications, cost per application
   - Evaluation: ROI by board, identify underperforming boards

3. **Track integration/tool usage:**
   - Google Workspace: # of emails sent/received, storage used
   - Slack: # of messages, # of channels
   - 1Password: # of vault items
   - AWS: compute hours, storage GB, data transfer

#### License Renewal Management

1. **Renewal timeline:**
   - 60 days before expiration: Finance Manager notified to renew
   - 30 days before: License status marked "Renewing Soon" in system
   - 7 days before: Second reminder to Finance Manager
   - On expiration: auto-renew if auto-renewal enabled, or manually renew

2. **Renewal options:**
   - Auto-renew: enabled for critical licenses (InTime platform, Google Workspace)
   - Manual renewal: for optional tools where we evaluate continued need
   - Upsize/downsize: consider if we need more or fewer seats

3. **Cost optimization:**
   - Annual renewal: negotiate annual discount (typically 10-15% vs. monthly)
   - Consolidation: if multiple licenses for similar tool, consolidate
   - Negotiation: review if pricing competitive vs. alternatives
   - Budget: align with annual budget, flag if overbudget

#### Optimization & Review

1. **Monthly review:**
   - Check license usage: are we using what we're paying for?
   - Cost trending: is spending increasing or decreasing?
   - Flag underutilized licenses for discussion

2. **Quarterly review:**
   - Full cost audit: have all licenses been accounted for?
   - ROI analysis: for each job board and tool, calculate return on investment
   - Tool evaluation: consider switching if alternative is better/cheaper
   - Headcount changes: do we need more/fewer licenses?

3. **Annual audit (end of fiscal year):**
   - Complete cost accounting: reconcile all vendor invoices
   - Budget vs. actual: compare to budgeted amount
   - Forecast next year: estimate costs with planned headcount changes
   - Renegotiation: renew major contracts with negotiated pricing

**Tools Used:** InTime Admin Dashboard (License Management), vendor invoices, finance spreadsheet
**Escalation:** Unexpected license cost or overages → escalate to Finance Manager immediately

---

## Glossary

- **API:** Application Programming Interface; allows systems to communicate
- **BDM:** Business Development Manager; focuses on client relationships
- **Bench Lead:** Manager of candidates not currently placed (the "bench")
- **CSV:** Comma-separated values; common data file format
- **MFA:** Multi-factor authentication; extra layer of security beyond password
- **OAuth:** Secure authentication method (e.g., "Sign in with Google")
- **RPO:** Recovery Point Objective; maximum acceptable data loss (e.g., 24 hours)
- **RTO:** Recovery Time Objective; maximum acceptable downtime (e.g., 4 hours)
- **SLA:** Service Level Agreement; commitment to response/resolution time
- **SSO:** Single Sign-On; one login for multiple systems
- **VMS:** Vendor Management System; client portal for job posting and submissions
- **W-9:** Tax form required for US independent contractors

---

**Last Updated:** February 2026
