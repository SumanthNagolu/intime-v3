# UC-ADMIN-014: Feature Flag Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-014 |
| Actor | Admin |
| Goal | Enable/disable features, manage beta rollouts, and control feature access by role |
| Frequency | Weekly (ongoing management) + as needed for releases |
| Estimated Time | 5-15 minutes per feature flag configuration |
| Priority | MEDIUM |

---

## Preconditions

1. User is authenticated with Admin role
2. User has `features.manage`, `features.toggle` permissions
3. Organization has feature flag system enabled
4. At least one feature flag is defined in the system

---

## Trigger

- Admin clicks "Feature Flags" in the Admin sidebar under SYSTEM section
- Admin clicks "Configure" on a feature-gated UI element
- Admin navigates directly to `/employee/admin/feature-flags`
- Admin uses keyboard shortcut `g f` from any admin page
- Support request to enable/disable a feature for organization

---

## Feature Flag States

| State | Code | Description | UI Badge |
|-------|------|-------------|----------|
| Enabled | `enabled` | Feature is active for configured users/roles | 🟢 Enabled |
| Disabled | `disabled` | Feature is completely off for all users | 🔴 Disabled |
| Beta | `beta` | Feature in limited rollout for testing | 🟡 Beta |
| Internal Only | `internal` | Feature only for internal/admin users | 🔵 Internal |
| Percentage Rollout | `percentage` | Feature enabled for X% of users | 🟠 X% Rollout |
| Coming Soon | `coming_soon` | Feature not yet available, shown as preview | ⚪ Coming Soon |

---

## Rollout Strategies

| Strategy | Code | Description | Use Case |
|----------|------|-------------|----------|
| All Users | `all` | Enable for everyone in organization | General release |
| Specific Roles | `roles` | Enable for selected roles only | Role-based features |
| Specific Users | `users` | Enable for specific user IDs | Beta testers |
| Percentage | `percentage` | Random X% of users | Gradual rollout |
| Pod-based | `pods` | Enable for specific pods | Team testing |
| None | `none` | Disabled for everyone | Kill switch |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Feature Flags

**User Action:** Click "Feature Flags" in Admin sidebar under SYSTEM section

**System Response:**
- URL changes to: `/employee/admin/feature-flags`
- Page title displays: "Feature Flags"
- Feature list loads organized by state
- Search and filter options are available

**Screen State:**

```
+------------------------------------------------------------------+
| Feature Flags                                  [+ New Feature]    |
+------------------------------------------------------------------+
| FEATURE FLAG OVERVIEW                                             |
| ┌──────────────────────────────────────────────────────────────┐ |
| │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │ |
| │  │   12   │  │    3   │  │    2   │  │    5   │             │ |
| │  │Enabled │  │  Beta  │  │Internal│  │Disabled│             │ |
| │  │Features│  │Features│  │  Only  │  │Features│             │ |
| │  └────────┘  └────────┘  └────────┘  └────────┘             │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [Search features...]                   [State ▼] [Category ▼]    |
+------------------------------------------------------------------+
| ENABLED FEATURES (12)                                             |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟢 AI Twin System                                            │ |
| │    Key: ai_twin_system                                        │ |
| │    Enabled for: Recruiter, Bench Sales, TA, Pod Manager      │ |
| │    Strategy: Specific Roles (4 roles)                         │ |
| │    [Configure]  [View Usage]  [Disable]                      │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 🟢 Advanced Analytics Dashboard                              │ |
| │    Key: advanced_analytics                                    │ |
| │    Enabled for: Management+ (Pod Manager and above)          │ |
| │    Strategy: Specific Roles (5 roles)                         │ |
| │    [Configure]  [View Usage]  [Disable]                      │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 🟢 Bulk Email Campaigns                                      │ |
| │    Key: bulk_email_campaigns                                  │ |
| │    Enabled for: All Users                                     │ |
| │    Strategy: All Users                                        │ |
| │    [Configure]  [View Usage]  [Disable]                      │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| BETA FEATURES (3)                                                 |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🟡 Video Interview Integration                               │ |
| │    Key: video_interviews                                      │ |
| │    Enabled for: 5 users (beta testers)                        │ |
| │    Strategy: Specific Users | Started: Dec 1, 2024           │ |
| │    [Configure]  [Expand Rollout]  [End Beta]                 │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 🟡 AI Resume Parsing v2                                      │ |
| │    Key: ai_resume_v2                                          │ |
| │    Enabled for: 25% of users (gradual rollout)               │ |
| │    Strategy: Percentage Rollout | Current: 25%               │ |
| │    [Configure]  [Increase to 50%]  [Full Release]            │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 🟡 Slack Integration                                         │ |
| │    Key: slack_integration                                     │ |
| │    Enabled for: Technical Recruiting Pod only                 │ |
| │    Strategy: Pod-based (1 pod)                                │ |
| │    [Configure]  [Expand to All Pods]  [End Beta]             │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| INTERNAL ONLY (2)                                                 |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🔵 Debug Mode                                                │ |
| │    Key: debug_mode                                            │ |
| │    Enabled for: Admin users only                              │ |
| │    [Configure]  [View Logs]                                  │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 🔵 Performance Profiler                                      │ |
| │    Key: perf_profiler                                         │ |
| │    Enabled for: Admin, Engineering                            │ |
| │    [Configure]  [View Metrics]                               │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| DISABLED FEATURES (5)                            [Show/Hide]      |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 🔴 Legacy Reports                                            │ |
| │    Key: legacy_reports | Disabled: Nov 15, 2024              │ |
| │    Reason: Replaced by Advanced Analytics                     │ |
| │    [Re-enable]  [Delete]                                     │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
+------------------------------------------------------------------+
| [Export Flags]  [Import Flags]  [Audit Log →]                    |
+------------------------------------------------------------------+
```

**Time:** ~2 seconds (page load)

---

### Step 2: Configure Feature Flag

**User Action:** Click "Configure" on a feature flag

**System Response:**
- Modal opens with Feature Flag Configuration form
- Current settings are loaded
- Rollout strategy options are displayed
- Usage statistics are shown

**Screen State:**

```
+------------------------------------------------------------------+
| Configure Feature: AI Twin System                       [× Close] |
+------------------------------------------------------------------+
| FEATURE DETAILS                                                   |
|                                                                   |
| Feature Name *                                                    |
| [AI Twin System                                              ]    |
|                                                                   |
| Feature Key (immutable after creation)                           |
| [ai_twin_system                                              ]    |
| ℹ Used in code to check feature status                           |
|                                                                   |
| Description                                                       |
| [AI-powered assistant for recruiters providing intelligent   ]   |
| [suggestions, automated outreach, and productivity insights  ]   |
|                                                                   |
| Category                                                          |
| [AI & Automation                                             ▼]  |
| Options: AI & Automation, Communication, Reporting, Workflow,    |
|          Integration, UI/UX, Experimental                        |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| ROLLOUT STRATEGY                                                  |
|                                                                   |
| ○ Enable for all users                                           |
| ● Enable for specific roles                                      |
| ○ Enable for specific users                                      |
| ○ Percentage rollout                                             |
| ○ Enable for specific pods                                       |
| ○ Disable for all                                                |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| ENABLED ROLES                                                     |
|                                                                   |
| Select which roles can access this feature:                      |
|                                                                   |
| RECRUITING                                                        |
| ☑ Technical Recruiter                                            |
| ☑ Bench Sales Recruiter                                          |
| ☑ TA Specialist                                                  |
|                                                                   |
| MANAGEMENT                                                        |
| ☑ Pod Manager                                                    |
| ☐ Regional Director                                              |
| ☐ COO                                                            |
| ☐ CEO                                                            |
|                                                                   |
| SUPPORT                                                           |
| ☐ HR Manager                                                     |
| ☐ Finance                                                        |
|                                                                   |
| ADMIN                                                             |
| ☐ Admin                                                          |
| ☐ Super Admin                                                    |
|                                                                   |
| PORTALS                                                           |
| ☐ Client Portal User                                             |
| ☐ Talent Portal User                                             |
|                                                                   |
| Selected: 4 roles (estimated 89 users)                           |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| ADDITIONAL SETTINGS                                               |
|                                                                   |
| ☑ Show feature in navigation/menu                                |
| ☐ Show "New" badge on feature (for 30 days)                      |
| ☐ Show "Beta" badge on feature                                   |
| ☑ Log feature usage for analytics                                |
| ☐ Show feedback prompt after first use                           |
| ☐ Require feature flag acknowledgment                            |
|                                                                   |
+------------------------------------------------------------------+
|                                [Cancel]  [Save Draft]  [Save]     |
+------------------------------------------------------------------+
```

**Time:** ~1 second (modal open)

---

### Step 3: Percentage Rollout Configuration

**User Action:** Select "Percentage rollout" strategy

**System Response:**
- Form updates to show percentage slider
- Shows estimated user count
- Rollout schedule options appear

**Screen State:**

```
+------------------------------------------------------------------+
| Configure Feature: AI Resume Parsing v2                 [× Close] |
+------------------------------------------------------------------+
| ROLLOUT STRATEGY                                                  |
|                                                                   |
| ○ Enable for all users                                           |
| ○ Enable for specific roles                                      |
| ○ Enable for specific users                                      |
| ● Percentage rollout                                             |
| ○ Enable for specific pods                                       |
| ○ Disable for all                                                |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| PERCENTAGE CONFIGURATION                                          |
|                                                                   |
| Current Rollout: 25%                                              |
|                                                                   |
| [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] |
| 0%              25%             50%             75%          100% |
|                  ▲                                                |
|                                                                   |
| Estimated Users: ~62 of 247 total users                          |
|                                                                   |
| Rollout Method:                                                   |
| ● Random (users randomly selected each session)                  |
| ○ Sticky (same users always see feature)                         |
| ○ By User ID (deterministic, based on user ID hash)              |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| GRADUAL ROLLOUT SCHEDULE (Optional)                               |
|                                                                   |
| ☑ Enable automatic percentage increase                           |
|                                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Date          │ Target %  │ Status                           │ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Dec 1, 2024   │ 10%       │ ✓ Completed                      │ |
| │ Dec 8, 2024   │ 25%       │ ✓ Current                        │ |
| │ Dec 15, 2024  │ 50%       │ ○ Scheduled                      │ |
| │ Dec 22, 2024  │ 75%       │ ○ Scheduled                      │ |
| │ Jan 1, 2025   │ 100%      │ ○ Full Release                   │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [+ Add Schedule Step]                                            |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| ROLLOUT SAFEGUARDS                                                |
|                                                                   |
| ☑ Pause rollout if error rate exceeds [5  ]%                     |
| ☑ Notify admin if issues detected                                |
| ☐ Require manual approval for each increase                      |
|                                                                   |
+------------------------------------------------------------------+
|                                [Cancel]  [Save Draft]  [Save]     |
+------------------------------------------------------------------+
```

**Field Specification: Rollout Percentage**

| Property | Value |
|----------|-------|
| Field Name | `rollout_percentage` |
| Type | Slider / Number Input |
| Label | "Rollout Percentage" |
| Required | Yes (when percentage strategy selected) |
| Min Value | 0 |
| Max Value | 100 |
| Step | 5 |
| Default | 10 |
| Validation | Integer between 0-100 |
| Error Messages | |
| - Invalid | "Percentage must be between 0 and 100" |

**Time:** ~10 seconds

---

### Step 4: Beta User Selection

**User Action:** Select "Enable for specific users" strategy

**System Response:**
- Form shows user search/selection interface
- Current beta testers are listed
- Add/remove user functionality is available

**Screen State:**

```
+------------------------------------------------------------------+
| Configure Feature: Video Interview Integration          [× Close] |
+------------------------------------------------------------------+
| ROLLOUT STRATEGY                                                  |
|                                                                   |
| ○ Enable for all users                                           |
| ○ Enable for specific roles                                      |
| ● Enable for specific users                                      |
| ○ Percentage rollout                                             |
| ○ Enable for specific pods                                       |
| ○ Disable for all                                                |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| BETA TESTERS                                                      |
|                                                                   |
| Search and add users to the beta program:                        |
|                                                                   |
| [Search users by name or email...                            🔍] |
|                                                                   |
| CURRENT BETA TESTERS (5)                                          |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Sarah Chen                                                   │ |
| │ sarah@company.com | Technical Recruiter                      │ |
| │ Added: Dec 1, 2024 | Usage: 23 sessions                      │ |
| │                                                    [× Remove]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Mike Rodriguez                                               │ |
| │ mike@company.com | Pod Manager                               │ |
| │ Added: Dec 1, 2024 | Usage: 18 sessions                      │ |
| │                                                    [× Remove]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Emily Davis                                                  │ |
| │ emily@company.com | Bench Sales Recruiter                    │ |
| │ Added: Dec 2, 2024 | Usage: 12 sessions                      │ |
| │                                                    [× Remove]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ James Wilson                                                 │ |
| │ james@company.com | TA Specialist                            │ |
| │ Added: Dec 3, 2024 | Usage: 8 sessions                       │ |
| │                                                    [× Remove]│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ Lisa Thompson                                                │ |
| │ lisa@company.com | Regional Director                         │ |
| │ Added: Dec 3, 2024 | Usage: 5 sessions                       │ |
| │                                                    [× Remove]│ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| [+ Add by Email List]  [+ Add by Role]  [+ Add by Pod]           |
|                                                                   |
| ─────────────────────────────────────────────────────────────── |
| BETA SETTINGS                                                     |
|                                                                   |
| Beta Start Date: [Dec 1, 2024       ]                            |
| Planned End Date: [Dec 31, 2024      ] (optional)                |
|                                                                   |
| ☑ Send welcome email to new beta testers                         |
| ☑ Collect feedback after each session                            |
| ☑ Show "Beta" badge in UI                                        |
|                                                                   |
+------------------------------------------------------------------+
|                                [Cancel]  [Save Draft]  [Save]     |
+------------------------------------------------------------------+
```

**Time:** ~15 seconds

---

### Step 5: Save Feature Flag Configuration

**User Action:** Click "Save" button

**System Response:**
- Configuration is validated
- Feature flag is updated in database
- Cache is invalidated immediately
- Success toast notification appears
- Modal closes
- Feature list refreshes

**Backend Processing:**

```typescript
// Feature Flag Update
async function updateFeatureFlag(input: UpdateFeatureFlagInput): Promise<FeatureFlag> {
  // 1. Validate configuration
  validateFeatureFlagConfig(input);

  // 2. Load current flag state
  const currentFlag = await db.feature_flags.findUnique({
    where: { id: input.id }
  });

  // 3. Update feature flag
  const flag = await db.feature_flags.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      state: input.state,
      rollout_strategy: input.rollout_strategy,
      rollout_percentage: input.rollout_percentage,
      enabled_roles: input.enabled_roles,
      enabled_users: input.enabled_users,
      enabled_pods: input.enabled_pods,
      show_in_nav: input.show_in_nav,
      show_new_badge: input.show_new_badge,
      show_beta_badge: input.show_beta_badge,
      log_usage: input.log_usage,
      show_feedback_prompt: input.show_feedback_prompt,
      rollout_schedule: input.rollout_schedule,
      safeguards: input.safeguards,
      updated_by: input.user_id,
      updated_at: new Date()
    }
  });

  // 4. Invalidate feature flag cache (immediate effect)
  await cache.invalidate(`feature_flags:${input.org_id}`);
  await cache.invalidate(`feature_flags:${input.org_id}:${flag.key}`);

  // 5. Create audit log
  await auditLog.create({
    action: 'feature_flag.updated',
    entity_type: 'feature_flags',
    entity_id: flag.id,
    user_id: input.user_id,
    old_values: currentFlag,
    new_values: flag
  });

  // 6. Send notifications if needed
  if (input.notify_affected_users) {
    await notifyFeatureFlagChange(flag, currentFlag);
  }

  return flag;
}
```

```sql
-- Update Feature Flag
UPDATE feature_flags SET
  name = $1,
  description = $2,
  category = $3,
  state = $4,
  rollout_strategy = $5,
  rollout_percentage = $6,
  enabled_roles = $7,
  enabled_users = $8,
  enabled_pods = $9,
  show_in_nav = $10,
  show_new_badge = $11,
  show_beta_badge = $12,
  log_usage = $13,
  show_feedback_prompt = $14,
  rollout_schedule = $15,
  safeguards = $16,
  updated_by = $17,
  updated_at = NOW()
WHERE id = $18;
```

**Success Message:**
- Toast: "Feature Flag Updated" (green, 4 seconds)
- Subtitle: "AI Twin System is now enabled for 4 roles"

**Time:** ~2 seconds

---

## Alternative Flows

### Alternative A: Create New Feature Flag

1. Admin clicks "+ New Feature" button
2. Modal opens with empty form
3. Admin enters feature key (must be unique)
4. Admin configures settings
5. Feature is created (disabled by default)
6. Admin can then enable/configure rollout

### Alternative B: Quick Toggle

1. Admin clicks state badge (🟢/🔴) on feature card
2. Confirmation dialog appears
3. Admin confirms enable/disable
4. Feature state toggles immediately
5. Cache is invalidated

### Alternative C: Expand Beta to Full Release

1. Admin clicks "Full Release" on beta feature
2. Confirmation shows impact (X users currently, Y total)
3. Admin confirms
4. Strategy changes to "All Users"
5. Beta badges are removed

### Alternative D: Emergency Kill Switch

1. Admin identifies problematic feature
2. Clicks "Disable" with urgent context
3. System immediately disables feature
4. All users lose access instantly
5. Error logs are captured
6. Incident report is created

### Alternative E: Clone Feature Flag

1. Admin clicks "⋮" → "Clone" on feature
2. New feature created with "(Copy)" suffix
3. All settings copied except key
4. Admin modifies key and saves
5. Useful for A/B testing scenarios

---

## Feature Check Implementation

```typescript
// Check if feature is enabled for user
async function isFeatureEnabled(
  featureKey: string,
  userId: string,
  orgId: string
): Promise<boolean> {
  // 1. Get feature flag (from cache or DB)
  const flag = await getFeatureFlag(featureKey, orgId);

  if (!flag) return false;

  // 2. Check state
  if (flag.state === 'disabled' || flag.state === 'coming_soon') {
    return false;
  }

  // 3. Check rollout strategy
  switch (flag.rollout_strategy) {
    case 'all':
      return true;

    case 'none':
      return false;

    case 'roles': {
      const user = await getUser(userId);
      return flag.enabled_roles.includes(user.role_id);
    }

    case 'users':
      return flag.enabled_users.includes(userId);

    case 'pods': {
      const user = await getUser(userId);
      return flag.enabled_pods.includes(user.pod_id);
    }

    case 'percentage': {
      // Use deterministic hash for sticky rollout
      const hash = hashUserIdWithFlag(userId, featureKey);
      const userPercentile = hash % 100;
      return userPercentile < flag.rollout_percentage;
    }

    default:
      return false;
  }
}

// Usage in React component
function MyComponent() {
  const { isEnabled } = useFeatureFlag('ai_twin_system');

  if (!isEnabled) {
    return null; // or fallback UI
  }

  return <AITwinFeature />;
}

// Usage in API/Backend
async function handleRequest(req, res) {
  const enabled = await isFeatureEnabled('ai_twin_system', req.userId, req.orgId);

  if (!enabled) {
    return res.status(403).json({ error: 'Feature not available' });
  }

  // Process request...
}
```

---

## Postconditions

1. Feature flag configuration is saved to database
2. Cache is immediately invalidated
3. Affected users see changes on next page load
4. Audit log entry is created
5. If beta users added, welcome emails are sent
6. Usage logging is enabled/disabled as configured

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Key | Feature key already exists | "A feature with this key already exists" | Edit key |
| Invalid Key Format | Key contains invalid characters | "Feature key must be lowercase with underscores only" | Fix key format |
| No Rollout Target | Strategy selected but no targets | "Please select at least one role/user/pod" | Select targets |
| Invalid Percentage | Percentage > 100 or < 0 | "Percentage must be between 0 and 100" | Fix value |
| User Not Found | Beta tester email doesn't exist | "User not found: john@company.com" | Verify email |
| Permission Denied | User lacks features.manage | "You don't have permission to manage feature flags" | Contact admin |
| Database Error | Connection or constraint failure | "Unable to save feature flag. Please try again." | Retry |

---

## Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `g f` | Any admin page | Go to Feature Flags |
| `n` | Feature list | New Feature Flag |
| `e` | Feature focused | Edit/Configure |
| `t` | Feature focused | Toggle enable/disable |
| `Ctrl+S` / `Cmd+S` | Feature editor | Save configuration |
| `Escape` | Feature editor | Close modal |
| `/` | Feature list | Focus search |
| `?` | Any | Show keyboard shortcuts |

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-FF-001 | Create feature flag | Admin logged in | 1. Click + New 2. Enter key and name 3. Save | Flag created (disabled) |
| ADMIN-FF-002 | Enable for all users | Disabled flag exists | 1. Configure 2. Select "All users" 3. Save | All users can access feature |
| ADMIN-FF-003 | Enable for specific roles | Flag exists | 1. Configure 2. Select Recruiter role 3. Save | Only recruiters can access |
| ADMIN-FF-004 | Percentage rollout | Flag exists | 1. Configure 2. Set 25% 3. Save | ~25% of users can access |
| ADMIN-FF-005 | Add beta tester | Beta flag exists | 1. Configure 2. Add user by email 3. Save | User added to beta |
| ADMIN-FF-006 | Remove beta tester | Beta with 5 users | 1. Configure 2. Remove user 3. Save | User loses access |
| ADMIN-FF-007 | Emergency disable | Enabled flag | 1. Click Disable 2. Confirm | Immediate disable, all lose access |
| ADMIN-FF-008 | Gradual rollout schedule | Percentage flag | 1. Configure schedule 2. Save | Auto-increases per schedule |
| ADMIN-FF-009 | Feature usage check | isEnabled() called | 1. Call API with user context | Correct boolean based on config |
| ADMIN-FF-010 | Audit log | Flag modified | 1. Change configuration 2. Check audit | Change logged with old/new values |
| ADMIN-FF-011 | Duplicate key error | "ai_twin" exists | 1. Create new with "ai_twin" key | Error: "Key already exists" |
| ADMIN-FF-012 | Pod-based rollout | Flag exists | 1. Configure 2. Select specific pods 3. Save | Only pod members can access |
| ADMIN-FF-013 | View usage stats | Flag with log_usage | 1. Click View Usage | Shows session counts, users |
| ADMIN-FF-014 | Clone feature flag | Existing flag | 1. Click Clone 2. Edit key 3. Save | New flag with copied settings |
| ADMIN-FF-015 | Export/Import flags | Multiple flags | 1. Export 2. Modify JSON 3. Import | Flags updated from import |

---

## Database Schema Reference

```sql
-- Feature Flags Table
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  key TEXT NOT NULL, -- e.g., 'ai_twin_system'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  state TEXT NOT NULL DEFAULT 'disabled' CHECK (state IN (
    'enabled', 'disabled', 'beta', 'internal', 'percentage', 'coming_soon'
  )),
  rollout_strategy TEXT NOT NULL DEFAULT 'none' CHECK (rollout_strategy IN (
    'all', 'roles', 'users', 'percentage', 'pods', 'none'
  )),
  rollout_percentage INTEGER DEFAULT 0,
  enabled_roles UUID[] DEFAULT '{}',
  enabled_users UUID[] DEFAULT '{}',
  enabled_pods UUID[] DEFAULT '{}',
  show_in_nav BOOLEAN DEFAULT true,
  show_new_badge BOOLEAN DEFAULT false,
  show_beta_badge BOOLEAN DEFAULT false,
  log_usage BOOLEAN DEFAULT true,
  show_feedback_prompt BOOLEAN DEFAULT false,
  rollout_schedule JSONB DEFAULT '[]', -- Scheduled percentage increases
  safeguards JSONB DEFAULT '{}', -- Error rate limits, etc.
  metadata JSONB DEFAULT '{}', -- Additional config
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, key)
);

-- Feature Flag Usage (for analytics)
CREATE TABLE feature_flag_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  was_enabled BOOLEAN NOT NULL,
  context JSONB DEFAULT '{}' -- Additional context (page, action)
);

-- Feature Flag Feedback
CREATE TABLE feature_flag_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feature_flags_org_key ON feature_flags(org_id, key);
CREATE INDEX idx_feature_flags_state ON feature_flags(org_id, state);
CREATE INDEX idx_feature_flag_usage_flag ON feature_flag_usage(feature_flag_id, checked_at DESC);
CREATE INDEX idx_feature_flag_usage_user ON feature_flag_usage(user_id, checked_at DESC);
```

---

## Related Use Cases

- [UC-ADMIN-009: Workflow Configuration](./09-workflow-configuration.md) - Workflows can be feature-gated
- [UC-ADMIN-08: Audit Logs](./08-audit-logs.md) - Feature flag changes are audited
- [UC-ADMIN-05: User Management](./05-user-management.md) - Users can be added to beta programs

---

## UI Design System Reference

### Colors
- Enabled badge: `--mantine-color-green-6`
- Disabled badge: `--mantine-color-red-6`
- Beta badge: `--mantine-color-yellow-6`
- Internal badge: `--mantine-color-blue-6`
- Coming soon badge: `--mantine-color-gray-5`
- Primary actions: `--mantine-color-brand-6` (#2D5016)

### Components
- Feature cards: `<Paper p="md" withBorder>`
- State badges: `<Badge size="sm">`
- Percentage slider: `<Slider>` with marks
- User search: `<Autocomplete>` with user results
- Role checkboxes: `<Checkbox.Group>`
- Modal: `<Modal size="lg">`

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-04 | Initial documentation |
