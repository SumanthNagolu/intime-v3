# ACAD-025: Trainer Dashboard

**Status:** ⚪ Not Started

**Story Points:** 7
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM

---

## User Story

As a **Trainer**,
I want **Grading queue, student analytics, at-risk alerts dashboard**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [ ] Grading queue (ungraded capstones, labs)
- [ ] Student list with progress stats
- [ ] At-risk student alerts (3+ quiz failures, inactive 7 days)
- [ ] Cohort performance analytics
- [ ] Escalation inbox (AI → human escalations)
- [ ] Quick actions (send message, schedule call)
- [ ] Completion rate dashboard
- [ ] Time-to-grade metrics

---

## Implementation

```typescript
// src/app/trainer/dashboard/page.tsx
export default async function TrainerDashboard() {
  const gradingQueue = await getUngradedSubmissions();
  const atRiskStudents = await getAtRiskStudents();
  const escalations = await getEscalations();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h2>Grading Queue ({gradingQueue.length})</h2>
        {gradingQueue.map(submission => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))}
      </div>
      <div>
        <AtRiskAlerts students={atRiskStudents} />
        <EscalationInbox escalations={escalations} />
      </div>
    </div>
  );
}
```

```sql
CREATE VIEW trainer_dashboard_stats AS
SELECT
  COUNT(DISTINCT se.user_id) AS total_students,
  COUNT(DISTINCT CASE WHEN se.status = 'active' THEN se.user_id END) AS active_students,
  COUNT(DISTINCT CASE WHEN se.status = 'completed' THEN se.user_id END) AS graduated_students,
  AVG(se.completion_percentage) AS avg_progress,
  COUNT(DISTINCT cs.id) FILTER (WHERE cs.status = 'pending') AS pending_grades
FROM student_enrollments se
LEFT JOIN capstone_submissions cs ON cs.enrollment_id = se.id;
```

---

**Dependencies:** ACAD-002, ACAD-012, ACAD-014, ACAD-027
**Next:** ACAD-026 (Grading System)
