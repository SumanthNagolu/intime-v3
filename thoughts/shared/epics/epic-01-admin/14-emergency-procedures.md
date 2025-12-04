# User Story: Emergency Procedures

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-014
**Priority:** High
**Estimated Context:** ~25K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/11-emergency-procedures.md`

---

## User Story

**As an** Admin user,
**I want** to handle system emergencies including incidents, break-glass access, and disaster recovery,
**So that** I can quickly respond to critical issues and minimize downtime.

---

## Acceptance Criteria

### AC-1: Incident Management
- [ ] Create incident with priority
- [ ] Assign incident commander
- [ ] Track incident timeline
- [ ] Update incident status
- [ ] Close with post-mortem

### AC-2: Priority Classifications
- [ ] P0 - Critical (15 min response)
- [ ] P1 - High (1 hour response)
- [ ] P2 - Medium (4 hours response)
- [ ] P3 - Low (24 hours response)

### AC-3: Break-Glass Access
- [ ] Request emergency elevated permissions
- [ ] Time-limited access (1-4 hours)
- [ ] Require justification
- [ ] Full audit logging
- [ ] Auto-revoke on expiry

### AC-4: Communication Templates
- [ ] Pre-defined incident communications
- [ ] Internal status updates
- [ ] External customer notifications
- [ ] Quick send to stakeholders

### AC-5: Disaster Recovery
- [ ] Database backup restoration
- [ ] Service health monitoring
- [ ] Failover procedures
- [ ] Recovery runbooks

### AC-6: Emergency Contacts
- [ ] Maintain emergency contact list
- [ ] On-call schedule
- [ ] Escalation paths
- [ ] Quick contact actions

---

## UI/UX Requirements

### Emergency Dashboard
```
┌────────────────────────────────────────────────────────────────┐
│ Emergency Procedures                      [🚨 Declare Incident]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ACTIVE INCIDENTS                                               │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 🔴 INC-2024-001 | P0 - CRITICAL                           ││
│ │ "Database connection failures"                             ││
│ │ Commander: John Smith | Started: 10:30 AM (45 min ago)    ││
│ │ Status: INVESTIGATING                                      ││
│ │ [View] [Update Status] [Communication]                     ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ SYSTEM STATUS                                                  │
│ ┌──────────────────┬──────────────────┬──────────────────────┐│
│ │ Service          │ Status           │ Last Check           ││
│ ├──────────────────┼──────────────────┼──────────────────────┤│
│ │ Web Application  │ 🟢 Operational   │ 1 min ago            ││
│ │ API Server       │ 🟡 Degraded      │ 1 min ago            ││
│ │ Database         │ 🔴 Outage        │ 1 min ago            ││
│ │ Email Service    │ 🟢 Operational   │ 2 min ago            ││
│ │ File Storage     │ 🟢 Operational   │ 2 min ago            ││
│ └──────────────────┴──────────────────┴──────────────────────┘│
│                                                                │
│ QUICK ACTIONS                                                  │
│ [Break-Glass Access] [Contact On-Call] [View Runbooks]        │
│                                                                │
│ ON-CALL TODAY                                                  │
│ Primary: Sarah Patel (555-123-4567)                           │
│ Secondary: Mike Jones (555-234-5678)                          │
└────────────────────────────────────────────────────────────────┘
```

### Declare Incident
```
┌────────────────────────────────────────────────────────────────┐
│ Declare Incident                                          [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ INCIDENT DETAILS                                               │
│ Title: *                                                       │
│ [Database connection failures                            ]    │
│                                                                │
│ Description: *                                                 │
│ [Multiple users reporting inability to access the system.  ]  │
│ [Database connection pool exhausted.                       ]  │
│                                                                │
│ Priority: *                                                    │
│ ● P0 - Critical (System down, data loss risk)                │
│   Response: 15 minutes | Escalation: Immediate                │
│ ○ P1 - High (Major feature unavailable)                      │
│   Response: 1 hour | Escalation: 2 hours                      │
│ ○ P2 - Medium (Degraded performance)                         │
│   Response: 4 hours | Escalation: 8 hours                     │
│ ○ P3 - Low (Minor issue)                                     │
│   Response: 24 hours | Escalation: 48 hours                   │
│                                                                │
│ Affected Services:                                             │
│ ☑ Database  ☑ API  ☐ Email  ☐ Storage  ☐ Auth               │
│                                                                │
│ Incident Commander:                                            │
│ [John Smith (On-Call Primary)                            ▼]   │
│                                                                │
│ Notify:                                                        │
│ ☑ On-call team  ☑ Engineering leads  ☐ Executives            │
│                                                                │
│ [Cancel]                                    [Declare Incident] │
└────────────────────────────────────────────────────────────────┘
```

### Break-Glass Access
```
┌────────────────────────────────────────────────────────────────┐
│ Break-Glass Access Request                               [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ⚠️ EMERGENCY ACCESS                                           │
│ Break-glass access bypasses normal permission controls.        │
│ All actions will be fully audited.                            │
│                                                                │
│ REQUESTED PERMISSIONS                                          │
│ ☑ Database direct access (read/write)                        │
│ ☑ Server SSH access                                          │
│ ☐ Production deployment                                       │
│ ☐ User data access                                           │
│                                                                │
│ JUSTIFICATION *                                                │
│ [Investigating INC-2024-001. Need direct DB access to        ]│
│ [diagnose connection pool issue and potentially restart.     ]│
│                                                                │
│ DURATION                                                       │
│ [2 hours                                                 ▼]   │
│ Max: 4 hours. Extension requires new request.                 │
│                                                                │
│ ASSOCIATED INCIDENT                                            │
│ [INC-2024-001 - Database connection failures             ▼]   │
│                                                                │
│ [Cancel]                                    [Request Access]   │
└────────────────────────────────────────────────────────────────┘
```

### Incident Timeline
```
┌────────────────────────────────────────────────────────────────┐
│ INC-2024-001 - Database Connection Failures                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Status: 🟡 MITIGATING          Priority: 🔴 P0 - CRITICAL     │
│ Commander: John Smith          Duration: 1h 15m               │
│                                                                │
│ TIMELINE                                                       │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 11:45 AM │ [MITIGATING] Connection pool expanded to 200   ││
│ │          │ Users reporting service restored                ││
│ │          │ Added by: John Smith                            ││
│ │──────────┼────────────────────────────────────────────────││
│ │ 11:30 AM │ [UPDATE] Root cause identified: memory leak    ││
│ │          │ in connection manager causing pool exhaustion   ││
│ │          │ Added by: Sarah Patel                           ││
│ │──────────┼────────────────────────────────────────────────││
│ │ 11:00 AM │ [ACTION] Break-glass access granted to Sarah   ││
│ │          │ Duration: 2 hours | Permissions: DB access      ││
│ │          │ Added by: System                                ││
│ │──────────┼────────────────────────────────────────────────││
│ │ 10:45 AM │ [INVESTIGATING] Team assembled                 ││
│ │          │ John, Sarah, Mike on call                       ││
│ │──────────┼────────────────────────────────────────────────││
│ │ 10:30 AM │ [DECLARED] Incident declared by monitoring     ││
│ │          │ Alert: DB connection errors > 100/min          ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Add Update] [Send Communication] [Resolve Incident]          │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  incident_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(10) NOT NULL, -- p0, p1, p2, p3
  status VARCHAR(20) DEFAULT 'declared', -- declared, investigating, mitigating, resolved, closed
  affected_services TEXT[],
  commander_id UUID NOT NULL REFERENCES user_profiles(id),
  declared_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  post_mortem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident timeline
CREATE TABLE incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  entry_type VARCHAR(50) NOT NULL, -- status_change, update, action, communication
  content TEXT NOT NULL,
  status VARCHAR(20),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Break-glass access requests
CREATE TABLE break_glass_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  incident_id UUID REFERENCES incidents(id),
  permissions_requested TEXT[] NOT NULL,
  justification TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, active, expired, revoked
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  is_on_call BOOLEAN DEFAULT false,
  on_call_schedule JSONB, -- {day: {start, end}}
  escalation_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Runbooks
CREATE TABLE runbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- database, api, auth, etc.
  content TEXT NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_incidents_org ON incidents(organization_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incident_timeline_incident ON incident_timeline(incident_id);
CREATE INDEX idx_break_glass_status ON break_glass_requests(status);
CREATE INDEX idx_break_glass_expires ON break_glass_requests(expires_at);
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-EMERG-001 | Declare P0 incident | Incident created, team notified |
| ADMIN-EMERG-002 | Assign commander | Commander assigned |
| ADMIN-EMERG-003 | Add timeline update | Update added with timestamp |
| ADMIN-EMERG-004 | Change incident status | Status updated, logged |
| ADMIN-EMERG-005 | Request break-glass | Request created, pending approval |
| ADMIN-EMERG-006 | Approve break-glass | Access granted, time-limited |
| ADMIN-EMERG-007 | Break-glass expires | Access auto-revoked |
| ADMIN-EMERG-008 | Revoke break-glass early | Access immediately revoked |
| ADMIN-EMERG-009 | Send communication | Template sent to recipients |
| ADMIN-EMERG-010 | Resolve incident | Status = resolved, duration calculated |
| ADMIN-EMERG-011 | Close with post-mortem | Incident closed, post-mortem linked |
| ADMIN-EMERG-012 | View on-call schedule | Shows current on-call |
| ADMIN-EMERG-013 | View runbook | Runbook content displayed |
| ADMIN-EMERG-014 | Contact on-call | Contact info shown |
| ADMIN-EMERG-015 | Audit break-glass | All actions fully logged |

---

## Priority Response Matrix

| Priority | Response Time | Escalation | Examples |
|----------|--------------|------------|----------|
| P0 - Critical | 15 minutes | Immediate | System outage, data breach |
| P1 - High | 1 hour | 2 hours | Major feature down |
| P2 - Medium | 4 hours | 8 hours | Degraded performance |
| P3 - Low | 24 hours | 48 hours | Minor bug |

---

## Dependencies

- Notification system (alerts, communications)
- Audit logging (break-glass actions)
- Monitoring/alerting integration
- User authentication

---

## Out of Scope

- Automated incident detection
- PagerDuty/OpsGenie integration
- Status page management
- SLA impact calculation
