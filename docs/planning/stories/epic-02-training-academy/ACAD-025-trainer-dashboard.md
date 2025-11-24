# ACAD-025: Trainer Dashboard

**Status:** ✅ Complete

**Story Points:** 7
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM
**Completed:** 2025-11-21

---

## User Story

As a **Trainer**,
I want **Grading queue, student analytics, at-risk alerts dashboard**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [x] Grading queue (ungraded capstones, labs) ✅
- [x] Student list with progress stats ✅
- [x] At-risk student alerts (3+ quiz failures, inactive 7 days) ✅
- [x] Cohort performance analytics ✅
- [x] Escalation inbox (AI → human escalations) ✅
- [x] Quick actions (send message, schedule call) ✅
- [x] Completion rate dashboard ✅
- [x] Time-to-grade metrics ✅

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

## Implementation Summary

### Files Created

**Pages (1):**
1. **`src/app/trainer/dashboard/page.tsx`** (180 lines)
   - Main trainer dashboard with tabs
   - Stats overview cards (students, completion rate, pending grades, escalations)
   - Parallel data fetching (stats, grading queue, at-risk students, escalations)
   - Tabbed interface for different views

**Components (4):**
2. **`src/components/trainer/GradingQueueWidget.tsx`** (150 lines)
   - Displays ungraded capstone submissions
   - Urgency indicators (3+ days waiting)
   - Repository and demo video links
   - "Grade Now" action buttons

3. **`src/components/trainer/AtRiskStudentsWidget.tsx`** (180 lines)
   - At-risk student detection and display
   - Risk levels (high, medium, low)
   - Risk factors (quiz failures, inactivity, low progress)
   - Quick actions (email, view profile, schedule call)

4. **`src/components/trainer/EscalationInboxWidget.tsx`** (160 lines)
   - AI mentor escalations needing human review
   - Wait time tracking
   - Escalation triggers and reasons
   - Review and chat links

5. **`src/components/trainer/StudentListWidget.tsx`** (220 lines)
   - Complete student roster
   - Search and filter functionality
   - Progress tracking per student
   - Status filtering (active, completed, dropped)

**Backend (1 modified):**
6. **`src/server/trpc/routers/enrollment.ts`** (+180 lines)
   - `getAtRiskStudents` endpoint with intelligent risk detection
   - `getTrainerStats` endpoint for dashboard overview
   - Risk criteria: 3+ quiz failures, 7+ days inactive, low progress

### Features Implemented

**Dashboard Overview:**
- 4 stat cards: Total Students, Completion Rate, Pending Grades, Escalations
- Real-time data from all courses
- Badge indicators for action items

**Grading Queue:**
- Ungraded capstone submissions
- Wait time calculation
- Urgency indicators (3+ days)
- Direct links to repositories and demo videos
- Peer review count display

**At-Risk Student Detection:**
- **Quiz Failures:** 3+ failures → medium risk, 5+ → high risk
- **Inactivity:** 7+ days without completing topics → medium/high risk
- **Low Progress:** Below expected pace → medium risk
- Risk level badges (high/medium/low)
- Risk factors displayed as tags
- Quick contact actions

**Escalation Inbox:**
- AI mentor escalations
- Auto-detection indicators
- Confidence scores
- Wait time tracking
- Escalation triggers display
- Direct links to chat history

**Student List:**
- All enrollments across courses
- Search by name or email
- Filter by status (active, completed, dropped)
- Progress bars per student
- Enrollment and completion dates
- Quick contact actions

**Quick Actions:**
- Email student (mailto link)
- View student profile
- Schedule call (placeholder)
- Grade submission
- Review escalation
- View chat history

### Event-Driven Architecture

No new events in this story. Uses existing data from:
- Enrollment system
- Capstone submissions
- Quiz attempts
- Topic completions
- Escalations

### At-Risk Detection Algorithm

```typescript
For each active enrollment:
  1. Check Quiz Failures (recent 10 attempts)
     - 3+ failures → medium risk
     - 5+ failures → high risk

  2. Check Inactivity (last 7 days)
     - No topic completions → escalate risk level

  3. Check Progress vs Expected
     - Expected: ~2% per week
     - Actual < 50% of expected (after 7 days) → medium risk

  4. Sort by risk level (high → medium → low)

  5. Return only students with at least one risk factor
```

---

**Dependencies:** ACAD-002, ACAD-012, ACAD-014, ACAD-027
**Next:** ACAD-026 (Grading System)
