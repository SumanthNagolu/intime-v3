# ACAD-012: Build Capstone Project System

**Story Points:** 8
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **to complete a final capstone project**,
So that **I can demonstrate mastery and build portfolio pieces**.

---

## Acceptance Criteria

- [ ] Capstone project requirements page
- [ ] GitHub repository submission
- [ ] Video demo submission (optional)
- [ ] Peer review system (students review each other)
- [ ] Trainer grading with rubric
- [ ] Comments/feedback on submission
- [ ] Revision workflow (resubmit if failed)
- [ ] Auto-graduate on capstone pass
- [ ] Certificate generation trigger

---

## Technical Implementation

### Capstone Submissions

```sql
CREATE TABLE capstone_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  
  repository_url TEXT NOT NULL,
  demo_video_url TEXT,
  description TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'peer_review', 'trainer_review', 'passed', 'failed', 'revision_requested')
  ),
  
  -- Grading
  graded_by UUID REFERENCES user_profiles(id),
  graded_at TIMESTAMPTZ,
  grade NUMERIC(5,2), -- 0-100
  feedback TEXT,
  
  -- Peer reviews
  peer_review_count INTEGER DEFAULT 0
);

CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES capstone_submissions(id),
  reviewer_id UUID REFERENCES user_profiles(id),
  
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Graduation Trigger

```sql
CREATE OR REPLACE FUNCTION check_graduation_eligibility(p_enrollment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_capstone_passed BOOLEAN;
  v_all_topics_complete BOOLEAN;
BEGIN
  -- Check if capstone passed
  SELECT EXISTS (
    SELECT 1 FROM capstone_submissions
    WHERE enrollment_id = p_enrollment_id AND status = 'passed'
  ) INTO v_capstone_passed;

  -- Check if all topics completed
  SELECT (completion_percentage = 100) INTO v_all_topics_complete
  FROM student_enrollments WHERE id = p_enrollment_id;

  RETURN v_capstone_passed AND v_all_topics_complete;
END;
$$ LANGUAGE plpgsql;
```

---

**Dependencies:** ACAD-001, ACAD-002, ACAD-003, ACAD-008
**Next:** ACAD-013 (AI Mentor) - Sprint 3
