# User Story: Audit Logs & Security

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-008
**Priority:** High
**Estimated Context:** ~45K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/08-audit-logs.md`

---

## User Story

**As an** Admin user,
**I want** to view comprehensive audit logs, security events, and configure alerts,
**So that** I can ensure compliance, investigate incidents, and maintain security.

---

## Acceptance Criteria

### AC-1: Audit Log Dashboard
- [ ] Display security overview metrics
- [ ] Show recent security alerts
- [ ] Show login activity summary
- [ ] Quick access to investigation tools

### AC-2: Audit Log Viewer
- [ ] Search and filter audit events
- [ ] Filter by event type, user, date range, severity
- [ ] View event details with before/after changes
- [ ] Export logs (CSV, JSON, SIEM format)

### AC-3: What Gets Logged
- [ ] Authentication events (login, logout, failed attempts)
- [ ] Data changes (create, update, delete with diff)
- [ ] Permission changes
- [ ] Security events (suspicious activity)
- [ ] System events (config changes)

### AC-4: Security Investigation
- [ ] Failed login analysis (by user, IP)
- [ ] Suspicious activity detection
- [ ] User session tracking
- [ ] IP-based filtering

### AC-5: Alert Configuration
- [ ] Create alert rules (failed logins, data access, etc.)
- [ ] Configure severity levels
- [ ] Configure notification channels
- [ ] View and manage active alerts

### AC-6: GDPR Compliance
- [ ] Generate Data Subject Access Reports
- [ ] Process Right to Erasure requests
- [ ] Track consent
- [ ] Audit data access

### AC-7: Retention & Archival
- [ ] Configure retention policies by event type
- [ ] Archive old logs to cold storage
- [ ] Purge expired logs
- [ ] Restore archived logs

### AC-8: Real-time Monitoring
- [ ] Live log streaming (WebSocket)
- [ ] Real-time alert notifications
- [ ] Dashboard auto-refresh

---

## UI/UX Requirements

### Audit Dashboard
```
┌────────────────────────────────────────────────────────────────┐
│ Audit & Security                                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ SECURITY OVERVIEW (Last 24 Hours)                              │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│ │ Total Events │ Failed Logins│ Data Changes │ Alerts       │ │
│ │ 12,456       │ 23           │ 1,847        │ 3            │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                │
│ ACTIVE ALERTS                                        [View All]│
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 🔴 HIGH: Multiple failed logins for admin@company.com     ││
│ │    5 attempts from 192.168.1.100 in last 15 minutes       ││
│ │    [Investigate] [Block IP] [Dismiss]                     ││
│ ├────────────────────────────────────────────────────────────┤│
│ │ 🟡 MEDIUM: Unusual data export by john@company.com        ││
│ │    Exported 5,000 candidate records                       ││
│ │    [Investigate] [Dismiss]                                ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ RECENT ACTIVITY                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 10:45 AM │ LOGIN    │ sarah@co.com   │ Success │ Chrome   ││
│ │ 10:42 AM │ UPDATE   │ john@co.com    │ Job     │ JOB-1234 ││
│ │ 10:40 AM │ LOGIN    │ admin@co.com   │ Failed  │ Bad pass ││
│ │ 10:38 AM │ CREATE   │ mike@co.com    │ Cand    │ CAND-567 ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [View Full Audit Log] [Configure Alerts] [Export Report]      │
└────────────────────────────────────────────────────────────────┘
```

### Audit Log Viewer
```
┌────────────────────────────────────────────────────────────────┐
│ Audit Log                                            [Export]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ FILTERS                                                        │
│ [Date Range: Last 7 days ▼] [Event Type: All ▼]               │
│ [User: All ▼] [Severity: All ▼] [🔍 Search...]               │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Time       │ Event    │ User      │ Object   │ Result     ││
│ ├────────────┼──────────┼───────────┼──────────┼────────────┤│
│ │ Dec 4      │ LOGIN    │ sarah@    │ —        │ ✓ Success  ││
│ │ 10:45 AM   │          │ co.com    │          │            ││
│ │            │          │           │          │ [Details]  ││
│ ├────────────┼──────────┼───────────┼──────────┼────────────┤│
│ │ Dec 4      │ UPDATE   │ john@     │ JOB-1234 │ ✓ Success  ││
│ │ 10:42 AM   │          │ co.com    │          │            ││
│ │            │          │           │          │ [Details]  ││
│ ├────────────┼──────────┼───────────┼──────────┼────────────┤│
│ │ Dec 4      │ LOGIN    │ admin@    │ —        │ ✗ Failed   ││
│ │ 10:40 AM   │          │ co.com    │          │ Bad pass   ││
│ │            │          │           │          │ [Details]  ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ Showing 1-50 of 12,456         [◀ Previous] [Next ▶]         │
└────────────────────────────────────────────────────────────────┘
```

### Event Detail Modal
```
┌────────────────────────────────────────────────────────────────┐
│ Audit Event Detail                                        [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ EVENT INFORMATION                                              │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Event ID:      EVT-2024-12-04-001234                      ││
│ │ Event Type:    DATA_UPDATE                                 ││
│ │ Timestamp:     Dec 4, 2024 at 10:42:15 AM EST             ││
│ │ Result:        Success                                     ││
│ │ Severity:      INFO                                        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ USER INFORMATION                                               │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ User:          John Smith (john@company.com)              ││
│ │ Role:          Technical Recruiter                        ││
│ │ IP Address:    192.168.1.45                               ││
│ │ User Agent:    Chrome 120.0 / macOS 14.0                  ││
│ │ Session ID:    sess_abc123...                             ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ OBJECT INFORMATION                                             │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Object Type:   Job                                        ││
│ │ Object ID:     JOB-2024-1234                              ││
│ │ Object Name:   Senior Java Developer                       ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ CHANGES                                                        │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Field        │ Before           │ After                   ││
│ ├──────────────┼──────────────────┼─────────────────────────┤│
│ │ status       │ draft            │ active                  ││
│ │ bill_rate    │ $80.00           │ $85.00                  ││
│ │ updated_at   │ Dec 3, 2024      │ Dec 4, 2024             ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [View Related Events] [View User Activity] [Close]            │
└────────────────────────────────────────────────────────────────┘
```

### Alert Rule Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Configure Alert Rule                                      [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ RULE NAME *                                                    │
│ [Multiple Failed Logins                                   ]   │
│                                                                │
│ TRIGGER CONDITIONS                                             │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Event Type: [LOGIN_FAILED                             ▼]   ││
│ │ Count:      [5] or more occurrences                        ││
│ │ Time Window:[15] minutes                                   ││
│ │ Group By:   [User Email                               ▼]   ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ SEVERITY                                                       │
│ ○ Low  ○ Medium  ● High  ○ Critical                          │
│                                                                │
│ ACTIONS                                                        │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ☑ Create security alert                                   ││
│ │ ☑ Send email to security@company.com                      ││
│ │ ☐ Send Slack notification to #security                    ││
│ │ ☐ Lock user account automatically                         ││
│ │ ☐ Block IP address                                        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ☑ Active                                                      │
│                                                                │
│ [Cancel]                                           [Save Rule] │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Audit events
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id BIGSERIAL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.
  severity VARCHAR(20) DEFAULT 'INFO', -- DEBUG, INFO, WARNING, ERROR, CRITICAL
  result VARCHAR(20) NOT NULL, -- SUCCESS, FAILURE
  user_id UUID REFERENCES user_profiles(id),
  user_email VARCHAR(255),
  object_type VARCHAR(50),
  object_id VARCHAR(100),
  object_name VARCHAR(255),
  changes JSONB, -- {field: {before, after}}
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security alerts
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  alert_rule_id UUID REFERENCES alert_rules(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  related_events UUID[], -- Array of audit_event IDs
  status VARCHAR(20) DEFAULT 'open', -- open, acknowledged, resolved, dismissed
  acknowledged_by UUID REFERENCES user_profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert rules
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  condition JSONB NOT NULL, -- {count, timeWindowMinutes, groupBy}
  severity VARCHAR(20) NOT NULL,
  actions JSONB NOT NULL, -- {createAlert, sendEmail, sendSlack, lockUser, blockIp}
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log retention policy
CREATE TABLE audit_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_category VARCHAR(50) NOT NULL, -- auth, data, security, system
  hot_storage_days INTEGER DEFAULT 90,
  cold_storage_days INTEGER DEFAULT 365,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, event_category)
);

-- Indexes
CREATE INDEX idx_audit_events_org ON audit_events(organization_id);
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX idx_audit_events_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_user ON audit_events(user_id);
CREATE INDEX idx_audit_events_object ON audit_events(object_type, object_id);
CREATE INDEX idx_security_alerts_org ON security_alerts(organization_id);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_alert_rules_org ON alert_rules(organization_id);

-- Partitioning for audit events (by month)
CREATE TABLE audit_events_2024_12 PARTITION OF audit_events
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/audit.ts
export const auditRouter = router({
  getDashboard: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return dashboard metrics and recent alerts
    }),

  listEvents: orgProtectedProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      eventType: z.string().optional(),
      userId: z.string().uuid().optional(),
      severity: z.string().optional(),
      objectType: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50)
    }))
    .query(async ({ ctx, input }) => {
      // Return filtered audit events
    }),

  getEventDetail: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return event with full details
    }),

  exportEvents: orgProtectedProcedure
    .input(z.object({
      filters: z.record(z.any()),
      format: z.enum(['csv', 'json', 'siem'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate export file
    }),

  // Alerts
  listAlerts: orgProtectedProcedure
    .input(z.object({
      status: z.enum(['open', 'acknowledged', 'resolved', 'dismissed']).optional()
    }))
    .query(async ({ ctx, input }) => {
      // Return security alerts
    }),

  updateAlertStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['acknowledged', 'resolved', 'dismissed']),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update alert status
    }),

  // Alert Rules
  listAlertRules: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return alert rules
    }),

  createAlertRule: orgProtectedProcedure
    .input(z.object({
      name: z.string(),
      eventType: z.string(),
      condition: z.object({
        count: z.number(),
        timeWindowMinutes: z.number(),
        groupBy: z.string().optional()
      }),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      actions: z.object({
        createAlert: z.boolean(),
        sendEmail: z.string().optional(),
        sendSlack: z.string().optional(),
        lockUser: z.boolean().optional(),
        blockIp: z.boolean().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      // Create alert rule
    }),

  // Investigation
  getUserActivity: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Return user's activity timeline
    }),

  getFailedLogins: orgProtectedProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      groupBy: z.enum(['user', 'ip']).optional()
    }))
    .query(async ({ ctx, input }) => {
      // Return failed login analysis
    }),

  // Retention
  getRetentionPolicies: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return retention policies
    }),

  updateRetentionPolicy: orgProtectedProcedure
    .input(z.object({
      eventCategory: z.string(),
      hotStorageDays: z.number(),
      coldStorageDays: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update retention policy
    }),

  // Real-time (WebSocket subscription)
  subscribeToEvents: orgProtectedProcedure
    .subscription(async function* ({ ctx }) => {
      // Yield new events as they occur
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-AUD-001 | View audit dashboard | Shows metrics and recent alerts |
| ADMIN-AUD-002 | Search audit logs | Returns filtered events |
| ADMIN-AUD-003 | View event detail | Shows full event with changes |
| ADMIN-AUD-004 | Export to CSV | CSV file generated |
| ADMIN-AUD-005 | Export to SIEM format | CEF-formatted output |
| ADMIN-AUD-006 | Create alert rule | Rule created and active |
| ADMIN-AUD-007 | Alert triggered | Alert created when condition met |
| ADMIN-AUD-008 | Acknowledge alert | Status updated, recorded |
| ADMIN-AUD-009 | Resolve alert | Status = resolved |
| ADMIN-AUD-010 | View user activity | Shows user's event timeline |
| ADMIN-AUD-011 | Failed login analysis | Groups failed logins by user/IP |
| ADMIN-AUD-012 | Configure retention | Policy updated |
| ADMIN-AUD-013 | Real-time streaming | New events appear live |
| ADMIN-AUD-014 | Block IP from alert | IP added to blocklist |
| ADMIN-AUD-015 | Non-admin access | Returns 403 Forbidden |

---

## Event Types Reference

| Event Type | Description | Severity |
|------------|-------------|----------|
| LOGIN_SUCCESS | Successful user login | INFO |
| LOGIN_FAILED | Failed login attempt | WARNING |
| LOGOUT | User logout | INFO |
| PASSWORD_CHANGED | Password updated | INFO |
| PASSWORD_RESET | Password reset requested | INFO |
| MFA_ENABLED | 2FA enabled | INFO |
| DATA_CREATE | Record created | INFO |
| DATA_UPDATE | Record updated | INFO |
| DATA_DELETE | Record deleted | WARNING |
| DATA_EXPORT | Data exported | INFO |
| PERMISSION_GRANTED | Permission added | INFO |
| PERMISSION_REVOKED | Permission removed | WARNING |
| ROLE_CHANGED | User role changed | WARNING |
| CONFIG_CHANGED | System config updated | INFO |
| INTEGRATION_ERROR | Integration failure | ERROR |
| SECURITY_ALERT | Security event | WARNING-CRITICAL |

---

## Dependencies

- Background job processor for alert evaluation
- Email/Slack for notifications
- WebSocket server for real-time streaming
- Cold storage (S3) for archived logs

---

## Out of Scope

- SIEM integration configuration
- Custom event types
- Machine learning anomaly detection
