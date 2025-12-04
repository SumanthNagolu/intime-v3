# UC-ADMIN-008: Audit Logs & Security Monitoring

**Version:** 2.0
**Last Updated:** 2025-12-04
**Role:** Admin
**Status:** Approved

---

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-008 |
| Actor | Admin |
| Goal | Review audit trails, investigate security incidents, monitor user activity, ensure compliance |
| Frequency | Daily (monitoring), As needed (investigations) |
| Estimated Time | 5-30 min per investigation |
| Priority | HIGH |

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

## 11. Log Export Formats

### Export Options

```
┌────────────────────────────────────────────────────────────────┐
│ Export Audit Logs                                         [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DATE RANGE                                                      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ From: [Dec 1, 2024       ] [📅]                            │ │
│ │ To:   [Dec 4, 2024       ] [📅]                            │ │
│ │                                                             │ │
│ │ Quick: [Today] [Yesterday] [Last 7 days] [Last 30 days]   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ FILTERS                                                         │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Event Types:                                                │ │
│ │ ☑ Authentication (login, logout, password)                 │ │
│ │ ☑ Data Changes (create, update, delete)                    │ │
│ │ ☑ Permission Changes (role, scope)                         │ │
│ │ ☐ Security Events (alerts, incidents)                      │ │
│ │ ☐ System Events (integrations, errors)                     │ │
│ │                                                             │ │
│ │ Users: [All users                                      ▼] │ │
│ │ Objects: [All objects                                  ▼] │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ EXPORT FORMAT                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ ● CSV (Spreadsheet compatible)                             │ │
│ │   Fields: timestamp, user, action, object, result, ip      │ │
│ │                                                             │ │
│ │ ○ JSON (Machine readable)                                  │ │
│ │   Full event details including nested objects              │ │
│ │                                                             │ │
│ │ ○ SIEM Format (Splunk, ELK)                               │ │
│ │   Common Event Format (CEF) for security tools            │ │
│ │                                                             │ │
│ │ ○ PDF Report                                               │ │
│ │   Formatted report with charts and summaries              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ESTIMATED SIZE: ~2.5 MB (12,847 events)                         │
│                                                                 │
│ [Cancel]                                      [Export Logs]     │
└────────────────────────────────────────────────────────────────┘
```

### CSV Export Example

```csv
timestamp,event_id,user_email,user_role,action,object_type,object_id,result,ip_address,user_agent
2024-12-04T14:35:42Z,847291,mike.jones@intime.com,Pod Manager,UPDATE,Job,JOB-2024-1234,SUCCESS,203.0.113.42,Chrome/120.0
2024-12-04T14:30:22Z,847290,sarah@intime.com,Technical Recruiter,CREATE,Candidate,CAN-2024-5678,SUCCESS,198.51.100.10,Safari/17.0
```

### JSON Export Example

```json
{
  "events": [
    {
      "event_id": 847291,
      "timestamp": "2024-12-04T14:35:42Z",
      "event_type": "UPDATE",
      "user": {
        "id": "USER-1004",
        "email": "mike.jones@intime.com",
        "role": "Pod Manager"
      },
      "object": {
        "type": "Job",
        "id": "JOB-2024-1234"
      },
      "changes": [
        {"field": "status", "from": "draft", "to": "active"},
        {"field": "priority", "from": "medium", "to": "high"}
      ],
      "result": "SUCCESS",
      "context": {
        "ip_address": "203.0.113.42",
        "user_agent": "Mozilla/5.0 Chrome/120.0",
        "session_id": "sess_abc123xyz789"
      }
    }
  ]
}
```

### SIEM Integration (CEF Format)

```
CEF:0|InTime|InTimeOS|1.0|UPDATE|Job Updated|3|src=203.0.113.42 suser=mike.jones@intime.com outcome=Success cs1=JOB-2024-1234 cs1Label=ObjectID deviceExternalId=847291
```

---

## 12. Real-Time Log Streaming

```
┌────────────────────────────────────────────────────────────────┐
│ Real-Time Log Stream                         [⏸ Pause] [🔴 Stop│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ LIVE EVENTS (Streaming...)                                      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 14:42:15 ✓ admin@intime.com    LOGIN     Session           │ │
│ │ 14:42:08 ✓ lisa@intime.com     CREATE    Candidate #5679   │ │
│ │ 14:41:55 ✓ mike@intime.com     UPDATE    Job #1234         │ │
│ │ 14:41:42 ✓ sarah@intime.com    VIEW      Dashboard         │ │
│ │ 14:41:30 ✗ unknown@test.com    LOGIN     Failed (wrong pw) │ │
│ │ 14:41:15 ✓ john@intime.com     EXPORT    Candidates (50)   │ │
│ │ ...                                                         │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ FILTERS                                                         │
│ [✓ Logins] [✓ Data Changes] [✓ Errors] [✗ Views] [✗ System]  │
│                                                                 │
│ ALERTS                                                          │
│ ☑ Play sound on security events                                │ │
│ ☑ Desktop notification on critical alerts                      │
│                                                                 │
│ WEBHOOK ENDPOINT (for external SIEM)                            │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ wss://app.intime.com/api/audit/stream                      │ │
│ │ Auth: Bearer token required                                │ │
│ │ [Copy URL] [View Documentation]                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### WebSocket Stream Configuration

```javascript
// Connect to real-time audit stream
const ws = new WebSocket('wss://app.intime.com/api/audit/stream');
ws.onopen = () => {
  ws.send(JSON.stringify({
    auth: 'Bearer <API_TOKEN>',
    filters: {
      eventTypes: ['LOGIN', 'LOGOUT', 'UPDATE', 'DELETE'],
      severities: ['HIGH', 'CRITICAL']
    }
  }));
};
ws.onmessage = (event) => {
  const auditEvent = JSON.parse(event.data);
  console.log('Audit event:', auditEvent);
};
```

---

## 13. Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` / `Ctrl+K` | Open command palette | Any admin page |
| `g a` | Go to Audit Logs | Any admin page |
| `/` | Focus search | Audit log list |
| `j` / `k` | Navigate up/down | Log entries |
| `Enter` | Open log details | Log list |
| `e` | Export selected | Log list |
| `f` | Filter logs | Log list |
| `r` | Refresh logs | Log list |
| `s` | Toggle live stream | Log list |
| `Escape` | Close modal | Any modal |

---

## 14. Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-AUD-001 | View audit dashboard | Admin logged in | 1. Navigate to Audit Logs | Dashboard shows overview and recent events |
| ADMIN-AUD-002 | Search logs by user | Logs exist | 1. Enter user email 2. Click Search | Shows only that user's events |
| ADMIN-AUD-003 | Filter by date range | Logs exist | 1. Select date range 2. Apply filter | Shows events within range |
| ADMIN-AUD-004 | View log entry details | Log entry exists | 1. Click log entry | Shows full event details with changes |
| ADMIN-AUD-005 | Export logs as CSV | Logs exist | 1. Select date range 2. Click Export CSV | CSV file downloaded |
| ADMIN-AUD-006 | Export logs as JSON | Logs exist | 1. Select date range 2. Click Export JSON | JSON file downloaded |
| ADMIN-AUD-007 | Investigate failed logins | Failed login exists | 1. Click security alert 2. Review timeline | Shows investigation workflow |
| ADMIN-AUD-008 | Generate GDPR report | User data exists | 1. Click Compliance Report 2. Select GDPR | Report generated with DSAR summary |
| ADMIN-AUD-009 | Real-time stream | Streaming enabled | 1. Open stream 2. Perform action in another tab | Event appears in stream immediately |
| ADMIN-AUD-010 | Configure alert rule | Admin logged in | 1. Create new alert 2. Set trigger 3. Save | Alert fires when condition met |
| ADMIN-AUD-011 | View related events | Event exists | 1. Open event detail 2. Click "Related Events" | Shows events before/after |
| ADMIN-AUD-012 | Archive old logs | Logs older than retention | System runs archive job | Old logs moved to cold storage |
| ADMIN-AUD-013 | Restore archived logs | Archived logs exist | 1. Request restore 2. Wait for completion | Logs available for query |
| ADMIN-AUD-014 | SIEM integration | SIEM configured | 1. Generate event 2. Check SIEM | Event appears in SIEM tool |
| ADMIN-AUD-015 | Compliance audit trail | Permission changed | 1. Change user permission 2. Check audit log | Full audit trail with before/after |

---

## 15. Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Export too large | >1M events selected | "Export limited to 1 million events. Please narrow date range." | Reduce date range |
| Log not found | Invalid event ID | "Audit event not found" | Verify event ID |
| Permission denied | Non-admin user | "You don't have permission to view audit logs" | Login as admin |
| Archive unavailable | Cold storage offline | "Archived logs temporarily unavailable" | Retry later |
| Stream disconnected | Network issue | "Real-time stream disconnected. Reconnecting..." | Auto-reconnect |
| Search timeout | Complex query | "Search timed out. Try a more specific query." | Add filters |
| SIEM connection failed | Integration error | "Failed to send events to SIEM" | Check SIEM config |

---

## 16. Field Specifications

### Audit Log Filter Form

**Field Specification: Date Range**

| Property | Value |
|----------|-------|
| Field Name | `dateRange` |
| Type | DateRangePicker |
| Required | No |
| Default | Last 24 hours |
| Options | Today, Yesterday, Last 7 days, Last 30 days, This month, Custom |
| Max Range | 90 days (for performance) |
| Validation | End date >= Start date, range <= 90 days |
| Error Messages | |
| - Invalid Range | "End date must be after start date" |
| - Too Wide | "Date range cannot exceed 90 days. For longer ranges, use export." |

**Field Specification: User Filter**

| Property | Value |
|----------|-------|
| Field Name | `userFilter` |
| Type | Select (searchable, multi) |
| Required | No |
| Default | All Users |
| Options | Dynamic from `user_profiles` table (includes deactivated) |
| Placeholder | "Search by name or email..." |
| Validation | Valid user IDs |
| Error Messages | |
| - Invalid | "One or more selected users not found" |

**Field Specification: Action Type Filter**

| Property | Value |
|----------|-------|
| Field Name | `actionType` |
| Type | MultiSelect |
| Required | No |
| Default | All Actions |
| Options | LOGIN, LOGOUT, CREATE, READ, UPDATE, DELETE, EXPORT, PERMISSION_CHANGE |
| Validation | Valid action types |

**Field Specification: Object Type Filter**

| Property | Value |
|----------|-------|
| Field Name | `objectType` |
| Type | MultiSelect |
| Required | No |
| Default | All Objects |
| Options | Job, Candidate, Submission, Account, Contact, User, Role, Permission, Integration, System |
| Validation | Valid object types |

**Field Specification: Result Filter**

| Property | Value |
|----------|-------|
| Field Name | `result` |
| Type | SegmentedControl |
| Required | No |
| Default | All |
| Options | All, Success, Failure |

**Field Specification: Severity Filter**

| Property | Value |
|----------|-------|
| Field Name | `severity` |
| Type | MultiSelect |
| Required | No |
| Default | All |
| Options | INFO, LOW, MEDIUM, HIGH, CRITICAL |

**Field Specification: Search Query**

| Property | Value |
|----------|-------|
| Field Name | `searchQuery` |
| Type | TextInput with search icon |
| Required | No |
| Placeholder | "Search by event ID, IP address, object ID..." |
| Max Length | 200 characters |
| Debounce | 300ms |
| Validation | Alphanumeric with special characters (-, ., :, @) |
| Error Messages | |
| - Too Long | "Search query cannot exceed 200 characters" |

**Field Specification: IP Address Filter**

| Property | Value |
|----------|-------|
| Field Name | `ipAddress` |
| Type | TextInput |
| Required | No |
| Placeholder | "203.0.113.42 or 203.0.113.0/24" |
| Validation | Valid IPv4/IPv6 address or CIDR notation |
| Error Messages | |
| - Invalid | "Please enter a valid IP address or CIDR range" |

### Export Options Form

**Field Specification: Export Date Range**

| Property | Value |
|----------|-------|
| Field Name | `exportDateRange` |
| Type | DateRangePicker |
| Required | Yes |
| Default | Last 7 days |
| Max Range | 1 year (for exports) |
| Validation | End date >= Start date |
| Error Messages | |
| - Empty | "Please select a date range to export" |
| - Invalid | "End date must be after start date" |

**Field Specification: Event Types**

| Property | Value |
|----------|-------|
| Field Name | `exportEventTypes` |
| Type | CheckboxGroup |
| Required | At least one |
| Default | All selected |
| Options | Authentication, Data Changes, Permission Changes, Security Events, System Events |
| Validation | At least one selected |
| Error Messages | |
| - Empty | "Please select at least one event type to export" |

**Field Specification: Export Format**

| Property | Value |
|----------|-------|
| Field Name | `exportFormat` |
| Type | Radio |
| Required | Yes |
| Default | CSV |
| Options | CSV (Spreadsheet compatible), JSON (Machine readable), SIEM Format (CEF), PDF Report |
| Validation | Must select format |
| Error Messages | |
| - Empty | "Please select an export format" |

**Field Specification: Include User Details**

| Property | Value |
|----------|-------|
| Field Name | `includeUserDetails` |
| Type | Checkbox |
| Required | No |
| Default | true |
| Label | "Include user details (email, role, IP address)" |

**Field Specification: Include Change Details**

| Property | Value |
|----------|-------|
| Field Name | `includeChangeDetails` |
| Type | Checkbox |
| Required | No |
| Default | true |
| Label | "Include change details (before/after values)" |

### Alert Rule Configuration Form

**Field Specification: Alert Name**

| Property | Value |
|----------|-------|
| Field Name | `alertName` |
| Type | TextInput |
| Required | Yes |
| Placeholder | "Multiple Failed Logins" |
| Max Length | 100 characters |
| Validation | Non-empty, unique per organization |
| Error Messages | |
| - Empty | "Alert name is required" |
| - Duplicate | "An alert with this name already exists" |

**Field Specification: Alert Description**

| Property | Value |
|----------|-------|
| Field Name | `alertDescription` |
| Type | Textarea |
| Required | No |
| Placeholder | "Triggers when a user fails to log in 5+ times in 10 minutes" |
| Max Length | 500 characters |

**Field Specification: Event Type Trigger**

| Property | Value |
|----------|-------|
| Field Name | `triggerEventType` |
| Type | Select |
| Required | Yes |
| Options | LOGIN, LOGOUT, CREATE, UPDATE, DELETE, PERMISSION_CHANGE, EXPORT, API_ACCESS |
| Validation | Must select event type |
| Error Messages | |
| - Empty | "Please select an event type" |

**Field Specification: Result Condition**

| Property | Value |
|----------|-------|
| Field Name | `triggerResult` |
| Type | Select |
| Required | Yes |
| Default | FAILURE |
| Options | Any, SUCCESS, FAILURE |

**Field Specification: Threshold Count**

| Property | Value |
|----------|-------|
| Field Name | `thresholdCount` |
| Type | NumberInput |
| Required | Yes |
| Min | 1 |
| Max | 100 |
| Default | 5 |
| Validation | Integer within range |
| Error Messages | |
| - Empty | "Threshold count is required" |
| - Below Min | "Minimum threshold is 1" |
| - Above Max | "Maximum threshold is 100" |

**Field Specification: Time Window**

| Property | Value |
|----------|-------|
| Field Name | `timeWindow` |
| Type | Select |
| Required | Yes |
| Default | 10 minutes |
| Options | 1 minute, 5 minutes, 10 minutes, 30 minutes, 1 hour, 24 hours |
| Validation | Must select time window |
| Error Messages | |
| - Empty | "Please select a time window" |

**Field Specification: Alert Severity**

| Property | Value |
|----------|-------|
| Field Name | `alertSeverity` |
| Type | Select |
| Required | Yes |
| Default | MEDIUM |
| Options | LOW, MEDIUM, HIGH, CRITICAL |
| Validation | Must select severity |
| Error Messages | |
| - Empty | "Please select alert severity" |

**Field Specification: Notification Channels**

| Property | Value |
|----------|-------|
| Field Name | `notificationChannels` |
| Type | CheckboxGroup |
| Required | At least one |
| Options | Email (with recipients field), Slack (with channel field), Dashboard Alert |
| Default | Dashboard Alert |
| Validation | At least one channel selected |
| Error Messages | |
| - Empty | "Please select at least one notification channel" |

**Field Specification: Auto-Action**

| Property | Value |
|----------|-------|
| Field Name | `autoAction` |
| Type | Select |
| Required | No |
| Default | None |
| Options | None, Lock Account, Block IP, Require 2FA, Notify Manager |
| Validation | Valid action for event type |
| Warning | "Auto-actions are irreversible. Use with caution." |

**Field Specification: Alert Active**

| Property | Value |
|----------|-------|
| Field Name | `isActive` |
| Type | Switch |
| Required | No |
| Default | true |
| Label | "Alert is active" |

---

## 17. Database Schema Reference

```sql
-- Audit events table
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id BIGSERIAL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Event details
  event_type VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, CREATE, UPDATE, DELETE
  severity VARCHAR(20) DEFAULT 'INFO', -- INFO, LOW, MEDIUM, HIGH, CRITICAL
  result VARCHAR(20) NOT NULL, -- SUCCESS, FAILURE

  -- Actor
  user_id UUID REFERENCES user_profiles(id),
  user_email VARCHAR(254),
  user_role VARCHAR(100),
  session_id VARCHAR(100),

  -- Object
  object_type VARCHAR(50), -- Job, Candidate, User, etc.
  object_id VARCHAR(100),
  object_name VARCHAR(255),

  -- Changes
  changes JSONB, -- {field: {from: x, to: y}}

  -- Context
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path TEXT,
  response_code INTEGER,
  response_time_ms INTEGER,

  -- Metadata
  metadata JSONB -- Additional context
);

-- Security alerts
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  related_events UUID[], -- Array of audit_event IDs
  status VARCHAR(20) DEFAULT 'open', -- open, investigating, resolved
  assigned_to UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert rules
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  condition JSONB NOT NULL, -- {event_type: 'LOGIN', result: 'FAILURE', count: 5, window: '10m'}
  severity VARCHAR(20) NOT NULL,
  actions JSONB NOT NULL, -- {email: [...], slack: '#channel', auto_lock: true}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_events_org_time ON audit_events(organization_id, timestamp DESC);
CREATE INDEX idx_audit_events_user ON audit_events(user_id);
CREATE INDEX idx_audit_events_object ON audit_events(object_type, object_id);
CREATE INDEX idx_audit_events_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_severity ON audit_events(severity);
CREATE INDEX idx_security_alerts_org ON security_alerts(organization_id);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);

-- Partitioning for large tables (by month)
CREATE TABLE audit_events_2024_12 PARTITION OF audit_events
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

---

## 18. Related Use Cases

- [UC-ADMIN-006: Permission Management](./06-permission-management.md)
- [UC-ADMIN-007: Integration Management](./07-integration-management.md) (integration logs)
- [UC-ADMIN-005: User Management](./05-user-management.md) (user activity)

---

## 19. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial audit logs and security monitoring documentation |
| 2.0 | 2025-12-04 | Added overview table, log export formats (CSV/JSON/SIEM), real-time streaming, keyboard shortcuts, test cases, error scenarios, database schema |
| 2.1 | 2025-12-04 | Added field specifications for log filters, export options, and alert rule configuration |

---

**End of UC-ADMIN-008**
