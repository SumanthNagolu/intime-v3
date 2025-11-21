# ACAD-022: Graduation Workflow

**Status:** ⚪ Not Started

**Story Points:** 5
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** MEDIUM

---

## User Story

As a **Student**,
I want **Auto-detect completion, publish event, notify recruiting**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [ ] Auto-detect course completion (100% + capstone passed)
- [ ] Publish course.graduated event
- [ ] Grant 'candidate' role automatically
- [ ] Notify recruiting team (event subscriber)
- [ ] Send congratulations email
- [ ] Trigger certificate generation
- [ ] Update enrollment status to 'completed'
- [ ] Analytics (graduation rate, time-to-complete)

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

**Dependencies:** ACAD-002, ACAD-003, ACAD-012, FOUND-007
**Next:** ACAD-023 (Certificate Generation)
