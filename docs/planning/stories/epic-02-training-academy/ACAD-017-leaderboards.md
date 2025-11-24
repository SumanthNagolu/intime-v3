# ACAD-017: Leaderboards

**Status:** 🟢 Complete

**Story Points:** 4
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **XP rankings, cohort comparisons**,
So that **I can get help 24/7 and stay motivated**.

---

## Acceptance Criteria

- [x] Global leaderboard (all students)
- [x] Course-specific leaderboard
- [x] Cohort leaderboard (students enrolled same time)
- [x] Weekly XP leaders
- [x] All-time leaders
- [x] Rank display (1st, 2nd, 3rd with badges)
- [x] Opt-out option (privacy)
- [x] Real-time rank updates

---

## Implementation

```sql
CREATE VIEW leaderboard_global AS
SELECT
  up.full_name,
  up.email,
  uxp.total_xp,
  RANK() OVER (ORDER BY uxp.total_xp DESC) as rank
FROM user_xp_totals uxp
JOIN user_profiles up ON up.id = uxp.user_id;
```

---

**Dependencies:** ACAD-003, ACAD-016
**Next:** ACAD-018 (XP Transactions UI)
