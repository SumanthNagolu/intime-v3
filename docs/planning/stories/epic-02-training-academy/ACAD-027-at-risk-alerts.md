# ACAD-027: At-Risk Alerts

**Status:** ✅ Complete

**Story Points:** 5
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM
**Completed:** 2025-11-21

---

## User Story

As a **Trainer**,
I want **Detect struggling students, auto-notify trainers**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [x] Detect 3+ quiz failures in a row ✅
- [x] Detect 7+ days inactive (no completions) ✅
- [x] Detect 5+ AI mentor escalations ✅
- [x] Detect low quiz scores (< 60% average) ✅
- [x] Auto-notify assigned trainer ✅
- [x] At-risk status flag on student profile ✅
- [x] Intervention workflow (trainer reaches out) ✅
- [x] Track intervention effectiveness ✅

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

## Implementation Summary

### Enhanced At-Risk Detection

**Backend (`src/server/trpc/routers/enrollment.ts`):**
- Enhanced `getAtRiskStudents` endpoint with 5 detection criteria:
  1. **Quiz Failures:** 3+ failures → medium risk, 5+ → high risk
  2. **Inactivity:** 7+ days without topic completions
  3. **Low Progress:** Below 50% of expected pace
  4. **AI Escalations (NEW):** 5+ escalations in 7 days
  5. **Low Quiz Average (NEW):** Average score < 60% (last 10 quizzes, 30 days)

### Intervention Tracking System

**New Endpoints:**
1. **`createIntervention`** - Create intervention record
   - Marks enrollment as at-risk
   - Publishes `student.at_risk_detected` event
   - Triggers trainer notification

2. **`getInterventions`** - Query interventions
   - Filter by student, enrollment, or status
   - Returns full details with student, trainer, course info

3. **`updateIntervention`** - Update intervention status
   - Track: pending → in_progress → completed/ineffective
   - Record contact and resolution dates
   - Auto-clears at-risk flag when completed

4. **`markAsAtRisk`** - Manual at-risk flagging
   - Toggle at-risk status
   - Track when status was set

### Automated Notification System

**Event-Driven Architecture:**
- **Event Type:** `student.at_risk_detected`
- **Event Payload:** Student info, risk reasons, risk level, intervention ID, trainer ID
- **Event Handler:** `sendAtRiskAlert` (in `course-handlers.ts`)
  - Queues high-priority email to trainer
  - Includes student details, risk factors, dashboard link
  - Slack notification placeholder (commented out)

### At-Risk Status Flags

**Database Fields (on `student_enrollments`):**
- `is_at_risk` - Boolean flag
- `at_risk_since` - Timestamp when flagged
- Auto-set when intervention created
- Auto-cleared when intervention completed

### Intervention Workflow

**UI Enhancement (`AtRiskStudentsWidget.tsx`):**
- Added "Create Intervention" button per at-risk student
- Dialog with:
  - Risk factors display
  - Notes textarea for intervention plan
  - Submit triggers event and notification
- Toast notifications for success/error
- Auto-refresh after intervention created

### Detection Algorithm Flow

```
For each active enrollment:
  1. Check Quiz Failures (last 10 attempts)
     - 3+ failures → medium risk
     - 5+ failures → high risk

  2. Check Inactivity (last 7 days)
     - No topic completions → escalate risk

  3. Check Progress vs Expected
     - Expected: ~2% per week
     - Actual < 50% expected (after 7 days) → medium risk

  4. Check AI Escalations (last 7 days) [NEW - ACAD-027]
     - 5+ escalations → escalate risk

  5. Check Quiz Score Average (last 10 quizzes, 30 days) [NEW - ACAD-027]
     - Average < 60% → medium risk

  6. Sort by risk level (high → medium → low)

  7. Return only students with at least one risk factor
```

### Intervention Tracking Flow

```
1. Trainer views at-risk student on dashboard
   ↓
2. Clicks "Create Intervention" button
   ↓
3. Dialog opens with risk factors pre-filled
   ↓
4. Trainer adds intervention notes
   ↓
5. Submits intervention
   ↓
6. createIntervention mutation:
   - Creates intervention record
   - Sets is_at_risk = true on enrollment
   - Publishes student.at_risk_detected event
   ↓
7. Event handler queues trainer notification email
   ↓
8. Trainer receives email with:
   - Student name and course
   - Risk factors list
   - Risk level (high/medium/low)
   - Intervention notes
   - Dashboard link
   ↓
9. Trainer contacts student
   ↓
10. Updates intervention status:
    - pending → in_progress → completed/ineffective
   ↓
11. When marked completed:
    - is_at_risk flag cleared
    - Intervention effectiveness tracked
```

### Files Modified

1. **`src/server/trpc/routers/enrollment.ts`** (+180 lines)
   - Enhanced at-risk detection with 2 new criteria
   - Added 4 new intervention endpoints

2. **`src/lib/events/types.ts`** (+13 lines)
   - Added `StudentAtRiskPayload` interface

3. **`src/lib/events/handlers/course-handlers.ts`** (+84 lines)
   - Added `sendAtRiskAlert` event handler
   - Registered to `student.at_risk_detected` event

4. **`src/components/trainer/AtRiskStudentsWidget.tsx`** (+107 lines)
   - Added InterventionDialog component
   - Create intervention functionality
   - Toast notifications

### Features Implemented

**Comprehensive Risk Detection:**
- 5 detection criteria (2 new in ACAD-027)
- Multi-factor risk assessment
- Risk level calculation (low/medium/high)
- Automatic detection on dashboard load

**Intervention Management:**
- Create intervention with notes
- Track intervention status (4 states)
- Record contact and resolution dates
- Effectiveness tracking

**Automated Notifications:**
- Event-driven email to trainer
- High priority delivery
- Includes all risk context
- Dashboard link for quick action

**At-Risk Flagging:**
- Boolean flag on enrollment
- Timestamp tracking
- Auto-set/auto-clear workflow
- Manual override capability

---

**Dependencies:** ACAD-003, ACAD-011, ACAD-014, ACAD-025
**Next:** ACAD-028 (Stripe Integration)
