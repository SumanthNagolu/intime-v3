# UC-ADMIN-011: Emergency Procedures & Incident Response

**Version:** 1.1
**Last Updated:** 2025-12-04
**Role:** Admin
**Status:** Approved

---

## 1. Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-011 |
| Actor | Admin (System Administrator) |
| Goal | Execute emergency procedures to respond to incidents, restore services, and protect organizational data |
| Frequency | Rare (1-2 times per year, but critical when needed) |
| Estimated Time | Variable (15 minutes to 24+ hours depending on severity) |
| Priority | CRITICAL |

This use case covers emergency procedures and incident response protocols for InTime OS, including system outages, security breaches, data loss, and critical failures. Admin executes emergency procedures to restore services and protect data.

**Critical Focus:** Fast, decisive action during emergencies minimizes damage and downtime. Clear procedures ensure consistent, effective response.

---

## 1.1 Preconditions

1. User is logged in as Admin with `admin.emergency` permission
2. Emergency contact list is up-to-date and accessible
3. Monitoring/alerting systems are operational
4. Backup systems have been verified within the last 24 hours
5. Break-glass credentials are stored and accessible to authorized personnel
6. Communication channels (Slack, email, SMS) are configured

---

## 1.2 Trigger

One or more of the following:
- Monitoring system alerts for P0/P1 incident
- User reports widespread service unavailability
- Security alert from intrusion detection system
- Data anomaly or corruption detected
- Third-party vendor outage notification
- Manual detection of suspicious activity
- Automated health check failures exceeding threshold

---

## 2. Emergency Classifications

| Level | Severity | Examples | Response Time | Escalation |
|-------|----------|----------|---------------|------------|
| **P0 - Critical** | System down, data breach | Production outage, security breach, data loss | < 15 min | CTO, CEO immediate |
| **P1 - High** | Major feature broken | Login broken, payroll failure, email down | < 1 hour | CTO notified |
| **P2 - Medium** | Degraded service | Slow performance, partial outage | < 4 hours | Engineering team |
| **P3 - Low** | Minor issue | UI bug, non-critical feature | Next business day | Standard ticket |

---

## 3. Emergency Contact List

```
┌────────────────────────────────────────────────────────────────┐
│ EMERGENCY CONTACTS (24/7)                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PRIMARY CONTACTS                                                │
│ • CTO:           John Smith     (555) 123-4567                 │
│ • CEO:           Lisa Chen       (555) 234-5678                 │
│ • COO:           Mike Jones      (555) 345-6789                 │
│ • Lead Admin:    Sarah Patel     (555) 456-7890                 │
│                                                                 │
│ TECHNICAL TEAM                                                  │
│ • DevOps Lead:   Bob Wilson      (555) 567-8901                 │
│ • Backend Lead:  Amy Davis       (555) 678-9012                 │
│ • Security Lead: Tom Harris      (555) 789-0123                 │
│                                                                 │
│ VENDORS (24/7 Support)                                          │
│ • AWS Support:   1-800-AWS-HELP  (Priority Support)            │
│ • Supabase:      support@supabase.io (Enterprise SLA)          │
│ • SendGrid:      1-877-969-8647  (24/7 Support)                │
│                                                                 │
│ ESCALATION PATH                                                 │
│ P0: Admin → CTO → CEO (all notified immediately)               │
│ P1: Admin → CTO (within 1 hour)                                │
│ P2: Admin → Engineering (within 4 hours)                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. P0 Emergency: Production System Down

### Incident: Complete System Outage

**Symptoms:**
- Users cannot access InTime OS
- Login page shows 503 Service Unavailable
- API endpoints returning errors
- Database connections failing

### Immediate Response (First 15 Minutes)

```
STEP 1: CONFIRM OUTAGE (1 min)
☐ Check status page: https://status.intime.com
☐ Verify from multiple locations (VPN, different ISP)
☐ Check monitoring dashboard (Datadog/New Relic)
☐ Confirm: Is it full outage or partial?

STEP 2: NOTIFY STAKEHOLDERS (2 min)
☐ Post status page update: "Investigating outage"
☐ Send emergency alert:
   • CTO (immediate call + SMS)
   • CEO (immediate call + SMS)
   • COO (immediate SMS)
   • Engineering team (Slack #incidents channel)
☐ Email all users: "Service disruption - investigating"

STEP 3: START INCIDENT LOG (2 min)
☐ Create incident ticket: INC-2024-XXXX
☐ Start incident timeline (Google Doc / Notion)
☐ Assign roles:
   • Incident Commander: CTO or Lead Admin
   • Communications: Marketing/HR
   • Technical Lead: DevOps Lead

STEP 4: INITIAL DIAGNOSIS (10 min)
☐ Check infrastructure:
   • AWS Status: https://status.aws.amazon.com
   • Supabase Status: https://status.supabase.com
   • Vercel Status: https://vercel.com/status
☐ Check application logs:
   • Error rates spiking?
   • Database connection errors?
   • Memory/CPU issues?
☐ Check recent deployments:
   • Was there a recent deploy?
   • Rollback candidate?
☐ Check DNS:
   • nslookup intime.com
   • Cloudflare status
```

### Recovery Procedures

#### Scenario A: Bad Deployment

```
IF recent deployment caused outage:

ROLLBACK PROCEDURE:
1. Identify last known good version
   git log --oneline -10

2. Rollback Vercel deployment:
   vercel rollback [deployment-url]

3. Verify rollback successful:
   curl https://intime.com/api/health

4. Monitor for 10 minutes:
   - Error rates drop to normal
   - Users can log in
   - Core features working

5. Post-incident:
   - Root cause analysis
   - Fix issue in development
   - Test thoroughly before re-deploy
```

#### Scenario B: Database Failure

```
IF database is down or unreachable:

DIAGNOSIS:
1. Check Supabase Dashboard
   - Database status
   - Connection pool exhausted?
   - Storage full?

2. Check database connections:
   SELECT count(*) FROM pg_stat_activity;

3. Check disk space:
   SELECT pg_database_size('postgres');

RECOVERY:
If connection pool exhausted:
  - Restart connection pooler
  - Increase pool size (temporary)
  - Identify connection leak in app

If storage full:
  - Upgrade storage immediately
  - Delete old logs/temp tables
  - Archive old data

If database corruption:
  - Restore from most recent backup
  - Verify backup integrity
  - Accept data loss (last X minutes)
  - Communicate to users

FALLBACK:
- Switch to read-only mode
- Display maintenance page
- Allow critical operations only
```

#### Scenario C: Infrastructure Failure (AWS/Vercel)

```
IF infrastructure provider is down:

IMMEDIATE:
1. Check provider status page
2. If confirmed outage:
   - Post update: "Third-party outage"
   - Monitor provider for ETA
   - No action possible (wait for recovery)

3. If multi-region:
   - Failover to secondary region
   - Update DNS to point to backup
   - Verify backup region operational

4. If no backup region:
   - Communicate ETA to users
   - Prepare for recovery when provider restores
   - Consider temporary solutions (static site)
```

---

## 5. P0 Emergency: Security Breach

### Incident: Unauthorized Access Detected

**Symptoms:**
- Unusual data access patterns
- Unauthorized admin actions
- Data exfiltration detected
- Compromised user credentials

### Immediate Response (First 30 Minutes)

```
STEP 1: CONTAIN BREACH (5 min)
☐ Identify compromised account(s)
☐ IMMEDIATELY disable compromised accounts
   - Set status = 'locked'
   - Revoke all active sessions
   - Revoke API tokens
☐ If admin account compromised:
   - Disable account
   - Change all system passwords
   - Rotate all API keys

STEP 2: ASSESS DAMAGE (10 min)
☐ Check audit logs:
   - What data was accessed?
   - What actions were taken?
   - Time range of compromise
☐ Identify scope:
   - Single user or multiple?
   - Data exfiltrated?
   - System changes made?
☐ Determine attack vector:
   - Phishing?
   - Brute force?
   - SQL injection?
   - Insider threat?

STEP 3: NOTIFY STAKEHOLDERS (5 min)
☐ IMMEDIATE notification:
   • CEO (call immediately)
   • Legal Counsel (call immediately)
   • CTO (call immediately)
☐ DO NOT notify all users yet (Legal approval required)
☐ Prepare breach notification (Legal review)

STEP 4: EVIDENCE PRESERVATION (10 min)
☐ Preserve audit logs (DO NOT delete)
☐ Take database snapshot (forensics)
☐ Save all relevant logs:
   - Authentication logs
   - Access logs
   - System logs
☐ Document timeline
☐ Screenshot evidence

STEP 5: LEGAL & COMPLIANCE (immediate)
☐ Notify Legal Counsel
☐ Determine regulatory requirements:
   - GDPR (72-hour notification to authorities)
   - State breach notification laws
   - Industry-specific regulations
☐ Prepare breach notification letter
```

### Recovery & Remediation

```
SHORT-TERM (24 hours):
☐ Patch security vulnerability
☐ Force password reset (all users if widespread)
☐ Enable 2FA requirement (all users)
☐ Monitor for continued suspicious activity
☐ Engage cybersecurity firm (if needed)

MEDIUM-TERM (1 week):
☐ Conduct forensic analysis
☐ Identify all affected users/data
☐ Notify affected individuals (per legal requirements)
☐ Offer credit monitoring (if PII compromised)
☐ Update security policies
☐ Penetration testing (find other vulnerabilities)

LONG-TERM (1 month):
☐ Post-incident review
☐ Update security training
☐ Implement additional security controls
☐ Consider cyber insurance claim
☐ Document lessons learned
```

---

## 6. P0 Emergency: Data Loss

### Incident: Accidental Data Deletion

**Symptoms:**
- User reports missing data
- Database query returned empty result
- Accidental DELETE operation
- Backup corruption discovered

### Immediate Response

```
STEP 1: STOP THE BLEEDING (1 min)
☐ IMMEDIATELY identify scope:
   - Single record or entire table?
   - When did deletion occur?
   - Who performed deletion?
☐ PREVENT further deletion:
   - Disable user account (if accidental)
   - Revoke permissions (if malicious)
   - Take database offline (if necessary)

STEP 2: ASSESS RECOVERABILITY (5 min)
☐ Check soft delete (is data marked deleted or hard deleted?)
☐ Check database transaction log (can we rollback?)
☐ Check most recent backup:
   - When was last backup?
   - Is backup valid?
   - How much data loss? (time since backup)
☐ Check audit log (exact time of deletion)

STEP 3: NOTIFY STAKEHOLDERS (2 min)
☐ Notify affected users (if specific data)
☐ Notify CTO/CEO (immediate)
☐ Notify Legal (if regulatory data)

STEP 4: RESTORE DATA (variable time)

Option A: Soft Delete (BEST - No data loss)
  UPDATE table SET deleted_at = NULL WHERE id = X;

Option B: Point-in-Time Recovery (if supported)
  Restore database to moment before deletion
  Potential data loss: 0 minutes

Option C: Restore from Backup
  Restore most recent backup
  Potential data loss: Time since last backup

  1. Identify backup timestamp
  2. Restore to temporary database
  3. Extract deleted records
  4. Merge into production database
  5. Verify data integrity
  6. Test application functionality

STEP 5: VERIFY RECOVERY
☐ Confirm data restored
☐ Verify data integrity (checksums)
☐ Test application functionality
☐ User acceptance testing
```

---

## 7. Emergency Runbooks

### Runbook: Database Connection Pool Exhausted

```
SYMPTOMS:
- Users getting "Database connection timeout" errors
- New users cannot log in
- API requests timing out

DIAGNOSIS:
1. Check connection count:
   SELECT count(*) FROM pg_stat_activity;

2. If count near max (e.g., 99/100):
   - Connection pool exhausted

3. Check for connection leaks:
   SELECT * FROM pg_stat_activity
   WHERE state = 'idle'
   AND state_change < NOW() - INTERVAL '5 minutes';

RESOLUTION:
1. Immediate (temporary fix):
   - Kill idle connections:
     SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE state = 'idle'
     AND state_change < NOW() - INTERVAL '10 minutes';

   - Increase pool size (temporary):
     Update Supabase connection pool: 100 → 200

2. Root cause (permanent fix):
   - Identify connection leak in application code
   - Ensure proper connection closing
   - Implement connection pooling in app
   - Monitor connection count (alert if > 80%)

POST-INCIDENT:
- Add monitoring alert: connections > 80 of max
- Code review: Ensure all DB connections closed
- Load testing: Verify connection pooling works
```

---

## 8. Communication Templates

### Template: P0 Incident Notification (Email to Users)

```
Subject: [ACTION REQUIRED] Service Disruption - InTime OS

Dear InTime User,

We are currently experiencing a service disruption affecting access
to InTime OS. Our team is actively working to restore service.

IMPACT:
- InTime OS is currently unavailable
- You may be unable to log in or access data
- Started at: [TIME] EST

CURRENT STATUS:
- Our engineering team is investigating the issue
- We will provide updates every 30 minutes
- Estimated resolution: [ETA or "Under investigation"]

WHAT YOU SHOULD DO:
- Please wait for service restoration
- Do not attempt to re-submit data (may cause duplicates)
- Check status page: https://status.intime.com

NEXT UPDATE:
We will send another update in 30 minutes or when service is restored.

We apologize for the inconvenience and appreciate your patience.

InTime Engineering Team
support@intime.com
```

### Template: All-Clear Notification

```
Subject: [RESOLVED] InTime OS Service Restored

Dear InTime User,

Service has been fully restored. You can now access InTime OS normally.

INCIDENT SUMMARY:
- Start: [TIME] EST
- End: [TIME] EST
- Duration: [X hours Y minutes]
- Cause: [Brief description]

IMPACT:
- [Description of what was affected]
- Data integrity: Verified - no data loss
- All services operational

NEXT STEPS:
- Please log in and verify your data
- If you experience any issues, contact support@intime.com
- Post-incident report will be published within 48 hours

Thank you for your patience during this incident.

InTime Engineering Team
```

---

## 9. Post-Incident Review Template

```
POST-INCIDENT REVIEW
Incident: [INC-2024-XXXX]
Date: [Date]
Severity: P0 - Critical

1. INCIDENT SUMMARY
   - What happened?
   - When did it start/end?
   - What was the impact?

2. TIMELINE
   [Detailed timeline from detection to resolution]

3. ROOT CAUSE
   [5 Whys analysis or other RCA method]

4. WHAT WENT WELL
   - Fast detection
   - Clear communication
   - Effective escalation

5. WHAT WENT WRONG
   - Late detection
   - Unclear procedures
   - Missing tools

6. ACTION ITEMS
   [Specific, assignable tasks to prevent recurrence]

   | Action | Owner | Due Date | Priority |
   |--------|-------|----------|----------|
   | Add monitoring for X | DevOps | Week 1 | P0 |
   | Update runbook for Y | Admin | Week 1 | P1 |

7. LESSONS LEARNED
   [Key takeaways for organization]
```

---

## 10. Disaster Recovery Plan

### Backup & Recovery Strategy

```
BACKUP SCHEDULE:
- Database: Every 6 hours (retained 30 days)
- Full system: Daily at 2 AM EST (retained 7 days)
- Weekly backups: Retained 90 days
- Monthly backups: Retained 1 year

RECOVERY TIME OBJECTIVE (RTO):
- P0: < 4 hours (max acceptable downtime)
- P1: < 24 hours
- P2: < 72 hours

RECOVERY POINT OBJECTIVE (RPO):
- P0: < 1 hour (max data loss acceptable)
- P1: < 24 hours
- P2: < 72 hours

DISASTER SCENARIOS:
1. Data center failure → Failover to secondary region
2. Database corruption → Restore from backup (RPO: 6 hours)
3. Application failure → Rollback to last known good
4. Ransomware attack → Restore from isolated backup
```

---

## 11. Emergency Access

### Break-Glass Procedures

```
WHEN TO USE:
- Primary admin account locked/unavailable
- Emergency access needed immediately
- Standard escalation not possible

BREAK-GLASS ACCOUNT:
- Username: admin-emergency@intime.com
- Password: Stored in secure vault (1Password Enterprise)
- 2FA: Hardware token (stored in office safe)

PROCEDURE:
1. Retrieve credentials from vault (requires 2 authorized persons)
2. Log all break-glass access in incident log
3. Use only for emergency recovery
4. Change break-glass password after use
5. Document justification for access

MONITORING:
- All break-glass logins trigger immediate alert
- CEO and CTO notified instantly
- Full audit of actions taken
- Post-incident review required
```

---

## 12. Testing & Drills

### Emergency Drill Schedule

| Drill | Frequency | Participants | Duration |
|-------|-----------|--------------|----------|
| **Tabletop Exercise** | Quarterly | Leadership + IT | 2 hours |
| **Simulated Outage** | Semi-annual | All staff | 4 hours |
| **Security Breach Sim** | Annual | IT + Legal | 6 hours |
| **Backup Restore Test** | Monthly | DevOps | 1 hour |

### Drill Checklist

```
QUARTERLY TABLETOP EXERCISE:
☐ Schedule drill (all participants)
☐ Prepare scenario (realistic incident)
☐ Walk through response procedures
☐ Identify gaps in procedures
☐ Update runbooks based on findings
☐ Document lessons learned
☐ Schedule next drill
```

---

## 13. Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Cannot access monitoring dashboard | Network/service down | "Monitoring service unavailable" | Use backup monitoring or direct system checks |
| Break-glass credentials invalid | Password expired or changed | "Authentication failed" | Contact secondary authorized personnel, use backup access method |
| Backup restore fails | Corrupted backup or insufficient space | "Restore operation failed" | Try previous backup version, verify storage space |
| Database connection timeout during recovery | Connection pool exhausted | "Connection timeout" | Kill idle connections, increase pool size temporarily |
| Status page update fails | Third-party service down | "Failed to update status" | Use backup communication (email, Slack, SMS) |
| Cannot reach on-call personnel | Phone/Slack unavailable | "Contact unreachable" | Escalate to next person in chain |
| Rollback fails | Version mismatch or dependencies | "Rollback aborted" | Manual deployment of previous version |
| Insufficient permissions for recovery | Token expired or revoked | "Access denied" | Use break-glass account |
| Audit log inaccessible during incident | Log service down | "Audit service unavailable" | Manual logging to document, sync later |
| Communication channel overloaded | Mass notifications sent | "Rate limit exceeded" | Stagger notifications, use alternative channels |
| Vendor support unavailable | Outside business hours | "No response from vendor" | Use emergency contact or escalate internally |
| Evidence preservation fails | Insufficient storage | "Cannot save snapshot" | Clear space or use secondary storage |

---

## 14. Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+Shift+E` | Open Emergency Dashboard | Global (Admin) |
| `Cmd+Shift+I` | Create Incident Ticket | Emergency Dashboard |
| `Cmd+Shift+N` | Send Mass Notification | Emergency Dashboard |
| `Cmd+Shift+L` | View Incident Log | Emergency Dashboard |
| `Cmd+Shift+S` | Update Status Page | Emergency Dashboard |
| `Cmd+Shift+B` | Access Backup Console | Emergency Dashboard |
| `Cmd+Shift+R` | Initiate Rollback | Emergency Dashboard |
| `Cmd+Shift+A` | View Audit Logs | Emergency Dashboard |
| `Cmd+K` | Open Command Palette | Global |
| `Esc` | Cancel Current Action | Any Modal |
| `Cmd+Enter` | Confirm Emergency Action | Confirmation Dialog |

---

## 15. Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-EMR-001 | P0 incident creation | Admin logged in, system operational | 1. Navigate to Emergency Dashboard 2. Click "Create Incident" 3. Select P0 severity 4. Fill incident details 5. Submit | Incident created, stakeholders notified immediately |
| ADMIN-EMR-002 | Status page update during outage | Active P0 incident exists | 1. Open incident 2. Click "Update Status" 3. Enter status message 4. Publish | Status page updated, users see current status |
| ADMIN-EMR-003 | Emergency rollback execution | Recent deployment available | 1. Open Emergency Dashboard 2. Click "Rollback" 3. Select version 4. Confirm rollback 5. Monitor | System rolled back, services restored |
| ADMIN-EMR-004 | Break-glass account access | Primary admin unavailable | 1. Access vault 2. Retrieve break-glass credentials 3. Log in with emergency account | Access granted, alert sent to CEO/CTO |
| ADMIN-EMR-005 | Database backup restore | Database corruption detected | 1. Access backup console 2. Select recovery point 3. Initiate restore 4. Verify integrity | Database restored, data integrity verified |
| ADMIN-EMR-006 | Mass notification delivery | Active incident, users affected | 1. Create notification template 2. Select all users 3. Send notification | All affected users receive notification within 5 minutes |
| ADMIN-EMR-007 | Security breach containment | Compromised account detected | 1. Identify account 2. Disable account 3. Revoke sessions 4. Preserve evidence | Account disabled, sessions terminated, evidence saved |
| ADMIN-EMR-008 | Incident escalation | P0 incident, CTO unresponsive | 1. Document escalation 2. Contact CEO 3. Update incident log | CEO notified, escalation documented |
| ADMIN-EMR-009 | Post-incident report generation | Incident resolved | 1. Open closed incident 2. Click "Generate Report" 3. Review timeline 4. Add lessons learned | Comprehensive report generated with timeline |
| ADMIN-EMR-010 | Emergency drill execution | Drill scheduled, team available | 1. Announce drill 2. Simulate P0 scenario 3. Execute procedures 4. Debrief | Drill completed, gaps identified, runbooks updated |
| ADMIN-EMR-011 | Connection pool recovery | Pool exhausted, timeouts occurring | 1. Access database console 2. Kill idle connections 3. Verify recovery | Connections available, timeouts resolved |
| ADMIN-EMR-012 | Third-party outage handling | AWS/Supabase down | 1. Confirm vendor outage 2. Update status page 3. Monitor vendor status 4. Communicate ETA | Users informed, monitoring in place |
| ADMIN-EMR-013 | Data loss recovery | Accidental deletion reported | 1. Identify scope 2. Check soft delete 3. Restore from backup if needed 4. Verify | Data recovered, integrity confirmed |
| ADMIN-EMR-014 | Incident log audit trail | Incident closed, audit required | 1. Access audit logs 2. Filter by incident 3. Export timeline | Complete audit trail with all actions documented |
| ADMIN-EMR-015 | Multi-incident management | Two simultaneous P1 incidents | 1. Create both incidents 2. Assign separate teams 3. Track independently 4. Coordinate communications | Both incidents tracked, resolved without confusion |

---

## 16. Database Schema Reference

```sql
-- Incident tracking
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT UNIQUE NOT NULL, -- INC-2024-0001
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('P0', 'P1', 'P2', 'P3')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'identified', 'monitoring', 'resolved')),
  impact TEXT,
  root_cause TEXT,
  resolution TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  incident_commander UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident timeline events
CREATE TABLE incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('detection', 'notification', 'escalation', 'action', 'update', 'resolution')),
  description TEXT NOT NULL,
  performed_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident notifications sent
CREATE TABLE incident_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'slack', 'status_page')),
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed'))
);

-- Break-glass access log
CREATE TABLE break_glass_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  accessed_by TEXT NOT NULL, -- Could be email if user record doesn't exist
  reason TEXT NOT NULL,
  incident_id UUID REFERENCES incidents(id),
  actions_taken TEXT[],
  authorized_by TEXT NOT NULL, -- Two-person authorization
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Emergency drills
CREATE TABLE emergency_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_type TEXT NOT NULL CHECK (drill_type IN ('tabletop', 'simulated_outage', 'security_breach', 'backup_restore')),
  scenario TEXT NOT NULL,
  participants UUID[] NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  findings TEXT,
  action_items JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_started ON incidents(started_at);
CREATE INDEX idx_incident_timeline_incident ON incident_timeline(incident_id);
CREATE INDEX idx_break_glass_accessed ON break_glass_access(accessed_at);
```

---

## 17. Related Use Cases

- [UC-ADMIN-008: Audit Logs](./08-audit-logs.md) - Review incident-related audit trails
- [UC-ADMIN-007: Integration Management](./07-integration-management.md) - Manage third-party integrations during outages
- [UC-ADMIN-005: User Management](./05-user-management.md) - Disable compromised accounts
- [UC-ADMIN-03: System Settings](./03-system-settings.md) - Configure security settings
- [UC-ADMIN-012: SLA Configuration](./12-sla-configuration.md) - Monitor SLA breaches during incidents

---

## 18. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial emergency procedures and incident response documentation |
| 1.1 | 2025-12-04 | Added Overview table, Preconditions, Trigger, Error Scenarios, Keyboard Shortcuts, Test Cases, Database Schema, Related Use Cases |

---

**End of UC-ADMIN-011**
