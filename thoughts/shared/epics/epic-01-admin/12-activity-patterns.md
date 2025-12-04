# User Story: Activity Patterns

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-012
**Priority:** Low
**Estimated Context:** ~25K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/13-activity-patterns.md`

---

## User Story

**As an** Admin user,
**I want** to configure activity tracking patterns and gamification elements,
**So that** I can track user productivity and incentivize desired behaviors.

---

## Acceptance Criteria

### AC-1: Activity Pattern List
- [ ] Display all activity patterns
- [ ] Filter by category, status
- [ ] Show activity counts
- [ ] Enable/disable patterns

### AC-2: Configure Activity Pattern
- [ ] Define activity type
- [ ] Set trigger event
- [ ] Configure auto-logging rules
- [ ] Set points value
- [ ] Configure visibility

### AC-3: Points System
- [ ] Configure points per activity type
- [ ] Set bonus points for speed/quality
- [ ] Configure weekly/monthly targets
- [ ] Enable/disable gamification

### AC-4: Achievements/Badges
- [ ] Define achievement criteria
- [ ] Configure badge icons/names
- [ ] Set unlock conditions
- [ ] Configure notifications

### AC-5: Leaderboard Configuration
- [ ] Enable/disable leaderboards
- [ ] Configure grouping (team/individual)
- [ ] Set time periods
- [ ] Configure visible metrics

---

## UI/UX Requirements

### Activity Patterns List
```
┌────────────────────────────────────────────────────────────────┐
│ Activity Patterns                            [+ New Pattern]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Category: All ▼] [Status: Active ▼]                          │
│                                                                │
│ RECRUITING                                                     │
│ ┌────────────────────┬────────────┬────────┬────────┬────────┐│
│ │ Pattern            │ Trigger    │ Points │ Count  │ Status ││
│ ├────────────────────┼────────────┼────────┼────────┼────────┤│
│ │ Job Created        │ Auto       │ 10     │ 1,234  │ Active ││
│ │ Submission Made    │ Auto       │ 25     │ 5,678  │ Active ││
│ │ Interview Sched.   │ Auto       │ 15     │ 890    │ Active ││
│ │ Placement Made     │ Auto       │ 100    │ 156    │ Active ││
│ └────────────────────┴────────────┴────────┴────────┴────────┘│
│                                                                │
│ GAMIFICATION                                      [Configure] │
│ ☑ Points system enabled | ☑ Leaderboards | ☑ Achievements     │
└────────────────────────────────────────────────────────────────┘
```

### Pattern Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Activity Pattern - Submission Made                       [×]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ BASIC INFO                                                     │
│ Name:        [Submission Made                            ]    │
│ Category:    [Recruiting                                 ▼]   │
│ Description: [Candidate submitted to job                 ]    │
│                                                                │
│ TRIGGER                                                        │
│ Trigger Type: ● Auto (system event)  ○ Manual (user logs)    │
│ Event:        [submission.created                        ▼]   │
│                                                                │
│ POINTS                                                         │
│ Base Points:  [25]                                            │
│                                                                │
│ Bonus Points:                                                  │
│ ☑ +10 if within 24h of job creation                          │
│ ☑ +5 if candidate rated 4+ stars                             │
│ ☐ Custom: [condition] [bonus]                                 │
│                                                                │
│ VISIBILITY                                                     │
│ ☑ Show in activity feed                                       │
│ ☑ Include in leaderboard                                      │
│ ☑ Count towards weekly targets                                │
│                                                                │
│ [Cancel]                                    [Save] [Activate]  │
└────────────────────────────────────────────────────────────────┘
```

### Achievements Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Achievements                                  [+ New Badge]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────┬────────────────────┬──────────────────┬─────────┐│
│ │ Badge    │ Name               │ Criteria         │ Earned  ││
│ ├──────────┼────────────────────┼──────────────────┼─────────┤│
│ │ 🏆       │ First Placement    │ 1 placement      │ 45      ││
│ │ 🌟       │ Rising Star        │ 100 pts in week  │ 89      ││
│ │ 🔥       │ On Fire            │ 5 subs in day    │ 23      ││
│ │ 💎       │ Diamond Recruiter  │ 10 placements    │ 12      ││
│ │ 👑       │ Top Performer      │ #1 monthly       │ 6       ││
│ └──────────┴────────────────────┴──────────────────┴─────────┘│
│                                                                │
│ [Edit Badges] [View Award History]                             │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Activity patterns
CREATE TABLE activity_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- recruiting, bench_sales, crm, hr
  description TEXT,
  trigger_type VARCHAR(20) NOT NULL, -- auto, manual
  trigger_event VARCHAR(100), -- submission.created, etc.
  base_points INTEGER DEFAULT 0,
  bonus_rules JSONB, -- [{condition, points}]
  show_in_feed BOOLEAN DEFAULT true,
  include_in_leaderboard BOOLEAN DEFAULT true,
  count_towards_targets BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  pattern_id UUID REFERENCES activity_patterns(id),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  activity_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  bonus_applied JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements/Badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon name
  criteria_type VARCHAR(50) NOT NULL, -- count, points, rank
  criteria_value INTEGER NOT NULL,
  criteria_period VARCHAR(20), -- day, week, month, all_time
  activity_pattern_id UUID REFERENCES activity_patterns(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Points configuration
CREATE TABLE points_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  enabled BOOLEAN DEFAULT true,
  weekly_target INTEGER,
  monthly_target INTEGER,
  leaderboard_enabled BOOLEAN DEFAULT true,
  leaderboard_grouping VARCHAR(20) DEFAULT 'individual', -- individual, team
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_patterns_org ON activity_patterns(organization_id);
CREATE INDEX idx_activities_org ON activities(organization_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-ACT-001 | View activity patterns | Shows all patterns |
| ADMIN-ACT-002 | Create pattern | Pattern created |
| ADMIN-ACT-003 | Configure points | Points saved |
| ADMIN-ACT-004 | Configure bonus | Bonus rules saved |
| ADMIN-ACT-005 | Auto-log activity | Activity logged on event |
| ADMIN-ACT-006 | Points awarded | User points updated |
| ADMIN-ACT-007 | Bonus applied | Bonus points added |
| ADMIN-ACT-008 | Achievement earned | Badge awarded to user |
| ADMIN-ACT-009 | Leaderboard updates | Rankings reflect activities |
| ADMIN-ACT-010 | Disable pattern | No new activities logged |
| ADMIN-ACT-011 | View activity feed | Shows recent activities |
| ADMIN-ACT-012 | Weekly target tracking | Progress shown |
| ADMIN-ACT-013 | Create achievement | Badge criteria saved |
| ADMIN-ACT-014 | Disable gamification | Points hidden |
| ADMIN-ACT-015 | Non-admin access | Returns 403 Forbidden |

---

## Dependencies

- Entity event system (triggers)
- Activity feed component
- Notification system (badge notifications)

---

## Out of Scope

- Complex gamification rules
- Team competitions
- Rewards/prizes integration
- Activity analytics dashboard
