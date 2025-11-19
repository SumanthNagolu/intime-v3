# ACAD-017: Leaderboards

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

- [ ] Global leaderboard (all students)
- [ ] Course-specific leaderboard
- [ ] Cohort leaderboard (students enrolled same time)
- [ ] Weekly XP leaders
- [ ] All-time leaders
- [ ] Rank display (1st, 2nd, 3rd with badges)
- [ ] Opt-out option (privacy)
- [ ] Real-time rank updates

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
