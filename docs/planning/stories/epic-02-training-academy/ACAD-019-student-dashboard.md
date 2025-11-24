# ACAD-019: Student Dashboard

**Status:** 🟢 Complete

**Story Points:** 6
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **Current progress, next steps, enrolled courses dashboard**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [x] Overview of all enrolled courses
- [x] Current course progress (percentage complete)
- [x] Next topic to study (smart recommendations)
- [x] Recent XP earnings
- [x] Badges earned
- [x] Leaderboard position
- [x] Upcoming deadlines (if any)
- [x] AI mentor quick access
- [x] Mobile-responsive layout

---

## Implementation

```typescript
// src/app/dashboard/page.tsx
export default async function StudentDashboard() {
  const enrollments = await getMyEnrollments();
  const recentXP = await getRecentXP();
  const badges = await getMyBadges();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h2>My Courses</h2>
        {enrollments.map(e => (
          <CourseProgressCard key={e.id} enrollment={e} />
        ))}
      </div>
      <div>
        <XPSummary xp={recentXP} />
        <BadgeShowcase badges={badges} />
        <LeaderboardPosition />
      </div>
    </div>
  );
}
```

---

**Dependencies:** ACAD-002, ACAD-003, ACAD-016, ACAD-017
**Next:** ACAD-020 (AI Chat Interface)
