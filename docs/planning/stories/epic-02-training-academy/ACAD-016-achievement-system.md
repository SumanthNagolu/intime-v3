# ACAD-016: Achievement System

**Status:** 🟢 Complete

**Story Points:** 6
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **Badges, triggers, unlocks**,
So that **I can get help 24/7 and stay motivated**.

---

## Acceptance Criteria

- [x] Badge definitions (First Video, Quiz Master, Lab Legend, etc.)
- [x] Trigger system (auto-award on event)
- [x] Badge display on profile
- [x] Unlock animations
- [x] Rare badges (99th percentile achievements)
- [x] Badge sharing (LinkedIn, social media)
- [x] Progress toward next badge
- [x] XP bonus for badge unlocks

---

## Implementation

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 50,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

---

**Dependencies:** ACAD-003 (XP system)
**Next:** ACAD-017 (Leaderboards)
