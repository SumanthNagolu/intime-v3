# ACAD-027: At-Risk Alerts

**Story Points:** 5
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM

---

## User Story

As a **Trainer**,
I want **Detect struggling students, auto-notify trainers**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [ ] Detect 3+ quiz failures in a row
- [ ] Detect 7+ days inactive (no completions)
- [ ] Detect 5+ AI mentor escalations
- [ ] Detect low quiz scores (< 60% average)
- [ ] Auto-notify assigned trainer
- [ ] At-risk status flag on student profile
- [ ] Intervention workflow (trainer reaches out)
- [ ] Track intervention effectiveness

---

## Implementation

```sql
CREATE VIEW at_risk_students AS
SELECT DISTINCT
  se.user_id,
  up.full_name,
  up.email,
  se.id AS enrollment_id,
  c.title AS course,
  ARRAY_AGG(DISTINCT reason.risk_reason) AS risk_reasons
FROM student_enrollments se
JOIN user_profiles up ON up.id = se.user_id
JOIN courses c ON c.id = se.course_id
CROSS JOIN LATERAL (
  -- Reason 1: Quiz failures
  SELECT 'quiz_failures' AS risk_reason
  WHERE (
    SELECT COUNT(*) FROM quiz_attempts qa
    WHERE qa.user_id = se.user_id AND qa.passed = false
      AND qa.submitted_at > NOW() - INTERVAL '7 days'
  ) >= 3

  UNION ALL

  -- Reason 2: Inactive
  SELECT 'inactive' AS risk_reason
  WHERE NOT EXISTS (
    SELECT 1 FROM topic_completions tc
    WHERE tc.user_id = se.user_id
      AND tc.completed_at > NOW() - INTERVAL '7 days'
  )

  UNION ALL

  -- Reason 3: AI escalations
  SELECT 'ai_escalations' AS risk_reason
  WHERE (
    SELECT COUNT(*) FROM ai_mentor_chats amc
    WHERE amc.user_id = se.user_id AND amc.escalated_to_trainer = true
      AND amc.created_at > NOW() - INTERVAL '7 days'
  ) >= 5
) reason
WHERE se.status = 'active'
GROUP BY se.user_id, up.full_name, up.email, se.id, c.title;
```

```typescript
// Daily cron job
export async function notifyTrainersOfAtRiskStudents() {
  const atRiskStudents = await getAtRiskStudents();

  for (const student of atRiskStudents) {
    await sendSlackNotification({
      channel: '#trainer-alerts',
      message: \`🚨 At-Risk Student: \${student.full_name} in \${student.course}
      Reasons: \${student.risk_reasons.join(', ')}\`,
    });

    await sendEmail({
      to: student.trainer_email,
      subject: 'At-Risk Student Alert',
      body: \`Student \${student.full_name} needs intervention...\`,
    });
  }
}
```

---

**Dependencies:** ACAD-003, ACAD-011, ACAD-014
**Next:** ACAD-028 (Stripe Integration)
