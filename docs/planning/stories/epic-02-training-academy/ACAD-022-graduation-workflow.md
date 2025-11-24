# ACAD-022: Graduation Workflow

**Status:** ✅ Complete

**Story Points:** 5
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** MEDIUM
**Completed:** 2025-11-21

---

## User Story

As a **Student**,
I want **Auto-detect completion, publish event, notify recruiting**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [x] Auto-detect course completion (100% + capstone passed)
- [x] Publish course.graduated event
- [x] Grant 'candidate' role automatically
- [x] Notify recruiting team (event subscriber)
- [x] Send congratulations email
- [x] Trigger certificate generation
- [x] Update enrollment status to 'completed'
- [x] Analytics (graduation rate, time-to-complete)

---

## Implementation

```sql
-- Already implemented in ACAD-003, but enhance event:
CREATE OR REPLACE FUNCTION handle_graduation(p_enrollment_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
BEGIN
  SELECT user_id, course_id INTO v_user_id, v_course_id
  FROM student_enrollments WHERE id = p_enrollment_id;

  -- Update enrollment
  UPDATE student_enrollments
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_enrollment_id;

  -- Grant candidate role
  INSERT INTO user_roles (user_id, role_id)
  SELECT v_user_id, id FROM roles WHERE name = 'candidate'
  ON CONFLICT DO NOTHING;

  -- Publish event
  PERFORM publish_event('course.graduated', jsonb_build_object(
    'user_id', v_user_id,
    'course_id', v_course_id,
    'enrollment_id', p_enrollment_id,
    'graduated_at', NOW()
  ));
END;
$$ LANGUAGE plpgsql;
```

---

## Implementation Summary

### Backend Enhancements

#### 1. Event Handlers (`src/lib/events/handlers/course-handlers.ts`)

**Enhanced existing handlers:**
- `handleCourseGraduated` - Grants 'candidate' role, updates user profile
- `notifyRecruitingTeam` - Logs notification (ready for Slack integration)

**New handlers added:**
- `sendGraduationEmail` - Queues congratulations email via background jobs
- `generateCertificate` - Creates certificate record and queues PDF generation

All handlers registered to `course.graduated` event.

#### 2. tRPC Endpoints (`src/server/trpc/routers/progress.ts`)

**New Endpoints:**

**`checkGraduationEligibility`**
- Input: `enrollment_id`
- Returns: Eligibility status, completion %, capstone status
- Checks:
  - 100% course completion
  - Capstone approved with grade ≥ 70
  - Not already graduated

**`processGraduation`**
- Input: `enrollment_id`
- Verifies eligibility
- Updates enrollment status to 'completed'
- Sets `completed_at` timestamp
- Publishes `course.graduated` event
- Returns: Success status, course title, grade

**`getGraduationAnalytics`**
- Input: Optional `course_id`, `date_from`, `date_to`
- Returns:
  - Total graduations
  - Avg time to complete (days)
  - Avg completion percentage
  - Graduations by month (chart data)
  - Recent graduates list

### Event-Driven Workflow

```
Student completes final topic (100%)
    ↓
Student submits capstone
    ↓
Trainer approves capstone (grade ≥ 70)
    ↓
Manual or automatic graduation check
    ↓
tRPC: progress.processGraduation
    ↓
Updates enrollment status = 'completed'
    ↓
Publishes 'course.graduated' event
    ↓
Event handlers execute in parallel:
  1. Grant 'candidate' role
  2. Notify recruiting team
  3. Queue congratulations email
  4. Create certificate record
  5. Queue PDF generation
```

### Key Features

✅ **Automatic Role Grant**
- Student → Candidate role
- Updates user profile with bench status
- Ready for placement if grade ≥ 80

✅ **Event-Driven Architecture**
- Single event triggers multiple actions
- Handlers can fail independently
- Automatic retries via event bus
- Dead letter queue for failed events

✅ **Background Job Integration**
- Email sending queued (not blocking)
- Certificate PDF generation async
- Priority levels supported

✅ **Analytics Tracking**
- Graduation rate calculation
- Time-to-complete metrics
- Monthly trend data
- Course-specific filtering

### Graduation Requirements

**Must meet ALL:**
1. ✅ 100% course completion
2. ✅ Capstone project submitted
3. ✅ Capstone status = 'approved'
4. ✅ Capstone grade ≥ 70

**Auto-triggered on:**
- Final required topic completion (if capstone already passed)
- Capstone approval (if 100% already complete)

**Manual trigger:**
- Admin can call `processGraduation` endpoint
- Student can request graduation (if eligible)

---

**Dependencies:** ACAD-002, ACAD-003, ACAD-012, FOUND-007
**Next:** ACAD-023 (Certificate Generation)
