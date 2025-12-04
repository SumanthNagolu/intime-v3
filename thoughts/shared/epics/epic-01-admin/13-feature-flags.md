# User Story: Feature Flags

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-013
**Priority:** Medium
**Estimated Context:** ~25K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/14-feature-flags.md`

---

## User Story

**As an** Admin user,
**I want** to control feature rollout with flags and gradual deployment strategies,
**So that** I can safely release features to specific users or groups.

---

## Acceptance Criteria

### AC-1: Feature Flag List
- [ ] Display all feature flags
- [ ] Show flag status (on/off/partial)
- [ ] Show rollout percentage
- [ ] Quick toggle for simple flags

### AC-2: Create Feature Flag
- [ ] Define flag name and key
- [ ] Set flag type (boolean, percentage, etc.)
- [ ] Configure default value
- [ ] Add description

### AC-3: Rollout Strategies
- [ ] Boolean (all on/off)
- [ ] Percentage rollout (0-100%)
- [ ] User list (specific users)
- [ ] Role-based (by user role)
- [ ] Time-based (scheduled)

### AC-4: Flag Overrides
- [ ] Override for specific user
- [ ] Override for specific org/tenant
- [ ] Environment-specific overrides

### AC-5: Kill Switch
- [ ] Instant disable (emergency off)
- [ ] Confirmation required
- [ ] Audit logged

### AC-6: Flag Dependencies
- [ ] Define flag prerequisites
- [ ] Warning on dependency conflicts

---

## UI/UX Requirements

### Feature Flags List
```
┌────────────────────────────────────────────────────────────────┐
│ Feature Flags                                   [+ New Flag]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Status: All ▼] [🔍 Search...]                                │
│                                                                │
│ ┌────────────────────┬────────────┬────────────┬─────────────┐│
│ │ Flag               │ Type       │ Rollout    │ Status      ││
│ ├────────────────────┼────────────┼────────────┼─────────────┤│
│ │ ai_twin_system     │ Role-based │ 4 roles    │ 🟢 Enabled  ││
│ │ bulk_email         │ Percentage │ 50%        │ 🟡 Partial  ││
│ │ advanced_analytics │ Role-based │ Managers+  │ 🟢 Enabled  ││
│ │ new_dashboard      │ User list  │ 5 users    │ 🟡 Beta     ││
│ │ dark_mode          │ Boolean    │ 100%       │ 🟢 Enabled  ││
│ │ legacy_reports     │ Boolean    │ 0%         │ 🔴 Disabled ││
│ └────────────────────┴────────────┴────────────┴─────────────┘│
│                                                                │
│ Showing 6 of 12 flags                                          │
└────────────────────────────────────────────────────────────────┘
```

### Feature Flag Editor
```
┌────────────────────────────────────────────────────────────────┐
│ Feature Flag - bulk_email                                [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ BASIC INFO                                                     │
│ Name:        [Bulk Email Campaigns                       ]    │
│ Key:         [bulk_email] (used in code)                      │
│ Description: [Allow users to send bulk email campaigns   ]    │
│                                                                │
│ ROLLOUT STRATEGY                                               │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ○ Boolean (all users on/off)                              ││
│ │ ● Percentage rollout                                      ││
│ │   Rollout: [50]%  ━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░        ││
│ │ ○ Specific users                                          ││
│ │ ○ By role                                                 ││
│ │ ○ Scheduled                                               ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ OVERRIDES                                                      │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ User Overrides:                                           ││
│ │ • sarah@company.com - Always ON (beta tester)            ││
│ │ • john@company.com - Always OFF (requested)              ││
│ │ [+ Add Override]                                          ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ DEPENDENCIES                                                   │
│ ☐ Requires: [Select flag...                              ▼]  │
│                                                                │
│ ⚠️ KILL SWITCH                                                │
│ [🔴 Emergency Disable] Instantly disables for all users      │
│                                                                │
│ [Cancel]                                    [Save] [Activate]  │
└────────────────────────────────────────────────────────────────┘
```

### Scheduled Rollout
```
┌────────────────────────────────────────────────────────────────┐
│ Scheduled Rollout - new_dashboard                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ROLLOUT SCHEDULE                                               │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Phase 1: Dec 5, 2024  │ 10% rollout │ ✓ Completed         ││
│ │ Phase 2: Dec 10, 2024 │ 25% rollout │ ⏳ Scheduled        ││
│ │ Phase 3: Dec 15, 2024 │ 50% rollout │ ⏳ Scheduled        ││
│ │ Phase 4: Dec 20, 2024 │ 100% rollout│ ⏳ Scheduled        ││
│ │ [+ Add Phase]                                              ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ROLLBACK TRIGGERS                                              │
│ ☑ Auto-rollback if error rate > 5%                           │
│ ☑ Auto-rollback if reported issues > 10                      │
│                                                                │
│ [Cancel Rollout] [Pause] [Save]                               │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Feature flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id), -- null = global
  key VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  flag_type VARCHAR(20) NOT NULL, -- boolean, percentage, user_list, role_based, scheduled
  default_value BOOLEAN DEFAULT false,
  rollout_percentage INTEGER, -- 0-100
  enabled_roles UUID[], -- Array of role IDs
  enabled_users UUID[], -- Array of user IDs
  schedule JSONB, -- [{date, percentage}]
  requires_flag_id UUID REFERENCES feature_flags(id), -- Dependency
  status VARCHAR(20) DEFAULT 'inactive', -- inactive, active, killed
  killed_at TIMESTAMPTZ,
  killed_by UUID REFERENCES user_profiles(id),
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, key)
);

-- Feature flag overrides
CREATE TABLE feature_flag_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  organization_id UUID REFERENCES organizations(id),
  environment VARCHAR(20), -- development, staging, production
  value BOOLEAN NOT NULL,
  reason TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Feature flag evaluation log (for debugging)
CREATE TABLE feature_flag_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID NOT NULL REFERENCES feature_flags(id),
  user_id UUID REFERENCES user_profiles(id),
  result BOOLEAN NOT NULL,
  reason VARCHAR(50), -- default, percentage, role, user_list, override
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_status ON feature_flags(status);
CREATE INDEX idx_feature_flag_overrides_flag ON feature_flag_overrides(flag_id);
CREATE INDEX idx_feature_flag_overrides_user ON feature_flag_overrides(user_id);
```

---

## Flag Evaluation Logic

```typescript
// src/lib/features/evaluate-flag.ts
export async function evaluateFlag(
  flagKey: string,
  userId: string,
  context?: FlagContext
): Promise<boolean> {
  const flag = await getFlag(flagKey);

  if (!flag || flag.status === 'inactive') {
    return false;
  }

  if (flag.status === 'killed') {
    return false;
  }

  // Check user override
  const userOverride = await getUserOverride(flag.id, userId);
  if (userOverride) {
    return userOverride.value;
  }

  // Check dependency
  if (flag.requires_flag_id) {
    const dependencyMet = await evaluateFlag(flag.requiresFlagKey, userId);
    if (!dependencyMet) {
      return false;
    }
  }

  // Evaluate based on type
  switch (flag.flag_type) {
    case 'boolean':
      return flag.default_value;

    case 'percentage':
      const hash = hashUserId(userId);
      return hash < (flag.rollout_percentage / 100);

    case 'role_based':
      const user = await getUser(userId);
      return flag.enabled_roles.includes(user.roleId);

    case 'user_list':
      return flag.enabled_users.includes(userId);

    case 'scheduled':
      return evaluateSchedule(flag.schedule, new Date());

    default:
      return false;
  }
}
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-FF-001 | View flag list | Shows all flags with status |
| ADMIN-FF-002 | Create boolean flag | Flag created |
| ADMIN-FF-003 | Create percentage flag | Flag with rollout created |
| ADMIN-FF-004 | Create role-based flag | Flag with roles created |
| ADMIN-FF-005 | Add user override | Override saved |
| ADMIN-FF-006 | Evaluate flag (on) | Returns true for enabled |
| ADMIN-FF-007 | Evaluate flag (off) | Returns false for disabled |
| ADMIN-FF-008 | Percentage rollout | Consistent result per user |
| ADMIN-FF-009 | Override takes priority | Override wins over rule |
| ADMIN-FF-010 | Kill switch | Flag immediately disabled |
| ADMIN-FF-011 | Dependency check | Fails if dependency off |
| ADMIN-FF-012 | Scheduled rollout | Percentage changes on date |
| ADMIN-FF-013 | Auto-rollback | Rolls back on error threshold |
| ADMIN-FF-014 | View evaluation log | Shows flag decisions |
| ADMIN-FF-015 | Non-admin access | Returns 403 Forbidden |

---

## Dependencies

- User/role system
- Background job processor (scheduled rollouts)
- Error tracking (auto-rollback triggers)

---

## Out of Scope

- A/B testing with metrics
- Feature analytics dashboard
- Multi-variate flags
