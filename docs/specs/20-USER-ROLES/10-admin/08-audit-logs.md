# UC-ADMIN-008: Audit Logs & Security Monitoring

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** Admin
**Status:** Approved

---

## 1. Overview

This use case covers the comprehensive audit logging and security monitoring system for InTime OS. Admin reviews audit trails, investigates security incidents, monitors user activity, and ensures compliance with data protection regulations.

**Critical Focus:** Audit logs are essential for security, compliance, forensics, and accountability. Every significant action must be logged with full context.

---

## 2. What Gets Logged

### 2.1 User Authentication & Access

- Login attempts (successful and failed)
- Logout events
- Password resets
- 2FA setup/removal
- Session creation/termination
- Account lockouts
- API token generation/revocation

### 2.2 Data Changes

- Create, Read, Update, Delete (CRUD) operations
- Object type (job, candidate, submission, user, etc.)
- Changed fields (before/after values)
- Timestamp
- User who made change
- IP address
- User agent (browser/device)

### 2.3 Permission Changes

- Role assignments
- Permission grants/revokes
- Custom permission overrides
- Data scope changes
- Feature flag changes

### 2.4 Security Events

- Failed login attempts (brute force detection)
- Permission denied (403 Forbidden)
- Unauthorized access attempts (401)
- Suspicious activity (unusual hours, locations, patterns)
- Data exports (GDPR compliance)
- User data deletions

### 2.5 System Events

- Integration failures
- API rate limit violations
- System errors (5xx)
- Database migrations
- Configuration changes
- Backup/restore operations

---

## 3. Audit Log Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│ Audit Logs & Security Monitoring                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ SECURITY OVERVIEW (Last 24 Hours)                               │
│ ┌────────────┬────────────┬────────────┬────────────┐          │
│ │ Total      │ Failed     │ Security   │ Data       │          │
│ │ Events     │ Logins     │ Alerts     │ Exports    │          │
│ │ 12,847     │ 23 (0.2%)  │ 2          │ 5          │          │
│ └────────────┴────────────┴────────────┴────────────┘          │
│                                                                 │
│ SECURITY ALERTS (2)                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🟡 Multiple failed logins: sarah.patel@intime.com (5)      │ │
│ │    Last attempt: 2:15 PM from IP 203.0.113.42              │ │
│ │    Status: Account locked automatically                     │ │
│ │    [View Details] [Unlock Account] [Investigate]            │ │
│ │                                                             │ │
│ │ 🟡 Unusual data export: john.smith@intime.com              │ │
│ │    Exported: 500 candidate records at 11:30 PM             │ │
│ │    Location: New IP address (198.51.100.10)                │ │
│ │    [View Details] [Contact User] [Investigate]              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RECENT ACTIVITY                                                 │
│ ┌──────────┬──────────────┬──────────┬─────────────┬────────┐ │
│ │ Time     │ User         │ Action   │ Object      │ Result │ │
│ ├──────────┼──────────────┼──────────┼─────────────┼────────┤ │
│ │ 2:42 PM  │ admin@...    │ Login    │ Session     │ ✓      │ │
│ │ 2:40 PM  │ sarah@...    │ Login    │ Session     │ ✗ 5th  │ │
│ │ 2:38 PM  │ sarah@...    │ Login    │ Session     │ ✗ 4th  │ │
│ │ 2:35 PM  │ mike@...     │ Update   │ Job #1234   │ ✓      │ │
│ │ 2:30 PM  │ lisa@...     │ Create   │ Candidate   │ ✓      │ │
│ │ [View All Events]                                           │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ FILTERS                                                         │
│ [User ▼] [Action ▼] [Object ▼] [Date Range ▼] [🔍 Search]     │
│                                                                 │
│ [Export Logs] [Security Report] [Compliance Report]            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Audit Log Entry

```
┌────────────────────────────────────────────────────────────────┐
│ Audit Log Entry #847291                                  [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ EVENT DETAILS                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Event ID:        847291                                    │ │
│ │ Timestamp:       Dec 3, 2024 at 2:35:42 PM EST             │ │
│ │ Event Type:      UPDATE                                    │ │
│ │ Object Type:     Job                                       │ │
│ │ Object ID:       JOB-2024-1234                             │ │
│ │ Result:          ✓ Success (200 OK)                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ USER INFORMATION                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ User:            Mike Jones (mike.jones@intime.com)        │ │
│ │ User ID:         USER-1004                                 │ │
│ │ Role:            Pod Manager                               │ │
│ │ IP Address:      203.0.113.42                              │ │
│ │ Location:        New York, NY, United States               │ │
│ │ User Agent:      Mozilla/5.0 (Mac) Chrome/120.0            │ │
│ │ Session ID:      sess_abc123xyz789                         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ CHANGES MADE                                                    │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Field: status                                               │ │
│ │ Before: "draft"                                             │ │
│ │ After:  "active"                                            │ │
│ │                                                             │ │
│ │ Field: priority                                             │ │
│ │ Before: "medium"                                            │ │
│ │ After:  "high"                                              │ │
│ │                                                             │ │
│ │ Field: updatedAt                                            │ │
│ │ Before: "2024-12-03T14:30:00Z"                              │ │
│ │ After:  "2024-12-03T14:35:42Z"                              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ REQUEST DETAILS (Technical)                                     │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Method:          PATCH                                      │ │
│ │ Endpoint:        /api/jobs/JOB-2024-1234                   │ │
│ │ Request Body:    {"status": "active", "priority": "high"}  │ │
│ │ Response Code:   200 OK                                     │ │
│ │ Response Time:   142ms                                      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ CONTEXT                                                         │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Permission Check: ✓ Passed                                 │ │
│ │ • User is Accountable (A) for this job                     │ │
│ │ • Role "Pod Manager" has Update permission                 │ │
│ │ • Data scope: Team (job in user's pod)                     │ │
│ │                                                             │ │
│ │ Related Events:                                             │ │
│ │ • #847289: User viewed job (2:35:30 PM)                    │ │
│ │ • #847290: User edited job (2:35:40 PM)                    │ │
│ │ • #847291: User updated job (2:35:42 PM) ← Current         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [View Related Events] [Export Entry] [Copy Event ID]           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Security Investigation Workflow

### Scenario: Investigating Failed Login Attempts

```
┌────────────────────────────────────────────────────────────────┐
│ Security Investigation - Failed Logins                    [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ALERT: 5 Failed Logins for sarah.patel@intime.com             │
│                                                                 │
│ FAILED LOGIN TIMELINE                                           │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 2:10 PM - Failed (wrong password) - IP: 203.0.113.42       │ │
│ │ 2:11 PM - Failed (wrong password) - IP: 203.0.113.42       │ │
│ │ 2:12 PM - Failed (wrong password) - IP: 203.0.113.42       │ │
│ │ 2:13 PM - Failed (wrong password) - IP: 203.0.113.42       │ │
│ │ 2:15 PM - Failed (wrong password) - IP: 203.0.113.42       │ │
│ │ 2:15 PM - Account locked automatically                     │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RISK ASSESSMENT                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Risk Level: 🟡 LOW-MEDIUM                                   │ │
│ │                                                             │ │
│ │ Indicators:                                                 │ │
│ │ ✓ All attempts from same IP (not distributed attack)       │ │
│ │ ✓ IP matches user's typical location (New York, NY)        │ │
│ │ ✓ Timing: During business hours (not unusual time)         │ │
│ │ ⚠️ 5 attempts in 5 minutes (possible brute force)          │ │
│ │                                                             │ │
│ │ Likely Scenario: Forgotten password                        │ │
│ │ Unlikely: Compromised account or attack                    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ USER HISTORY (Last 30 Days)                                     │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Successful Logins: 42                                       │ │
│ │ Failed Logins:     5 (today only)                           │ │
│ │ Last Successful:   Yesterday at 5:30 PM                     │ │
│ │ Typical Location:  New York, NY (same as today)            │ │
│ │ Typical Device:    MacBook Pro (same as today)             │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RECOMMENDED ACTIONS                                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 1. [Unlock Account] - Send password reset link             │ │
│ │ 2. [Contact User] - Verify legitimate access attempt       │ │
│ │ 3. [Monitor] - Watch for further suspicious activity       │ │
│ │                                                             │ │
│ │ NOT RECOMMENDED (low risk):                                 │ │
│ │ • Force password change (user likely forgot password)      │ │
│ │ • Disable account (no indicators of compromise)            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Unlock & Send Reset] [Keep Locked] [Escalate to Security]    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Compliance Reporting

### GDPR Compliance Report

```
┌────────────────────────────────────────────────────────────────┐
│ GDPR Compliance Report - November 2024                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DATA SUBJECT ACCESS REQUESTS (DSAR)                            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Total Requests:  3                                          │ │
│ │ Completed:       3 (100%)                                   │ │
│ │ Avg Response:    5 days (target: < 30 days) ✓              │ │
│ │                                                             │ │
│ │ Nov 5:  John Doe - Data export delivered (7 days)          │ │
│ │ Nov 12: Jane Smith - Data export delivered (4 days)        │ │
│ │ Nov 28: Bob Wilson - Data export delivered (3 days)        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ RIGHT TO ERASURE (DELETE) REQUESTS                             │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Total Requests:  1                                          │ │
│ │ Completed:       1 (100%)                                   │ │
│ │ Avg Response:    12 days (target: < 30 days) ✓             │ │
│ │                                                             │ │
│ │ Nov 18: Mary Johnson - Data anonymized (12 days)           │ │
│ │ • Personal data deleted                                    │ │
│ │ • Employment records retained (legal requirement)          │ │
│ │ • User anonymized to "User 1047"                           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ DATA BREACHES                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Total Incidents: 0                                          │ │
│ │ ✓ No data breaches in last 12 months                       │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ CONSENT TRACKING                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Email Marketing:  1,247 opt-ins (98% consent rate)         │ │
│ │ Data Processing:  All employees consented (100%)            │ │
│ │ Cookie Consent:   4,523 visitors consented                  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Export GDPR Report] [Email to DPO] [Next Steps]               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Retention & Archival

### Audit Log Retention Policy

| Log Type | Retention Period | Storage | Reason |
|----------|-----------------|---------|--------|
| **Authentication Logs** | 90 days (hot), 1 year (cold) | Database → Archive | Security investigation |
| **Data Changes** | 7 years | Database → Archive | Compliance (SOX, GDPR) |
| **Permission Changes** | 7 years | Database → Archive | Security audit |
| **Security Events** | 1 year | Database → Archive | Incident response |
| **API Logs** | 30 days | Database | Performance monitoring |
| **Integration Logs** | 30 days | Database | Troubleshooting |
| **System Errors** | 90 days | Database → Archive | Debugging |

**Archive Process:**
- Hot storage (PostgreSQL): Fast queries, recent data
- Cold storage (AWS S3 Glacier): Compressed, encrypted, long-term
- Automatic archival after retention period
- Restore on-demand for investigations or compliance

---

## 8. Security Metrics

| Metric | Formula | Target | Purpose |
|--------|---------|--------|---------|
| **Failed Login Rate** | Failed / Total Logins | < 1% | Detect brute force |
| **Lockout Rate** | Locked Accounts / Total Users | < 0.5% | User experience |
| **Permission Denied Rate** | 403 Errors / Total Requests | < 2% | Permission tuning |
| **Unusual Access Attempts** | New IP/location logins | Monitor | Compromised accounts |
| **Data Export Volume** | GB exported / month | Trend | Insider threat |
| **Audit Log Coverage** | Events logged / Total Events | 100% | Compliance |

---

## 9. Alerting Rules

### Auto-Alerts (Send to Admin + Security Team)

| Alert | Trigger | Severity | Action |
|-------|---------|----------|--------|
| **Brute Force Attack** | 10+ failed logins from same IP in 10 min | 🔴 Critical | Auto-block IP |
| **Account Compromise** | Login from new country | 🟠 High | Require 2FA verification |
| **Privilege Escalation** | User role changed to Admin/CEO | 🔴 Critical | Immediate review |
| **Mass Data Export** | 1000+ records exported at once | 🟡 Medium | Contact user |
| **After-Hours Activity** | Login between 11 PM - 6 AM | 🟡 Low | Monitor |
| **Integration Failure** | Critical integration down > 15 min | 🔴 Critical | Switch to fallback |

---

## 10. Forensic Investigation Template

When investigating security incident:

```
INCIDENT REPORT #2024-12-03-001

DATE/TIME: Dec 3, 2024 at 11:30 PM EST
REPORTER: Admin (admin@intime.com)
SEVERITY: Medium

SUMMARY:
Unusual data export detected - 500 candidate records exported
by john.smith@intime.com at 11:30 PM from new IP address.

TIMELINE:
11:28 PM - User logged in from IP 198.51.100.10 (first time)
11:29 PM - User navigated to Candidates → Export
11:30 PM - User exported 500 records (CSV format)
11:31 PM - User logged out

INVESTIGATION:
1. User contacted - Claims: "Working late on report, VPN issue"
2. IP geolocation: New York, NY (user's location) ✓
3. VPN provider confirmed: User's home VPN changed IP ✓
4. Export contents reviewed: Legitimate business need ✓
5. User's recent activity: No other suspicious behavior ✓

RISK ASSESSMENT: LOW
- Legitimate business activity
- User verified via phone call
- IP location matches user
- Export contents appropriate for user's role

ACTIONS TAKEN:
- Documented in audit log
- User reminded of data export policies
- No further action needed

LESSONS LEARNED:
- New IP from VPN change triggered alert (working as intended)
- Consider whitelisting known VPN IP ranges

CLOSED: Dec 3, 2024
STATUS: Resolved - No security risk
```

---

## 11. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial audit logs and security monitoring documentation |

---

**End of UC-ADMIN-008**
