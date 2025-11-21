# ACAD-026: Grading System

**Status:** ⚪ Not Started

**Story Points:** 6
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM

---

## User Story

As a **Trainer**,
I want **Capstone review interface, feedback, scoring rubrics**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [ ] Capstone submission review page
- [ ] GitHub repo code viewer
- [ ] Video demo player
- [ ] Grading rubric checklist
- [ ] Score input (0-100)
- [ ] Feedback text area
- [ ] Pass/Fail/Revision Requested actions
- [ ] Notify student on grade submission
- [ ] Grading history tracking

---

## Implementation

```typescript
// src/app/trainer/grade/[submissionId]/page.tsx
export default function GradeSubmissionPage({ params }: Props) {
  const { data: submission } = trpc.grading.getSubmission.useQuery({
    submissionId: params.submissionId
  });
  
  const gradeMutation = trpc.grading.gradeSubmission.useMutation();

  const handleGrade = async (data: { score: number; feedback: string; passed: boolean }) => {
    await gradeMutation.mutateAsync({
      submissionId: params.submissionId,
      ...data,
    });

    // Redirect back to queue
    router.push('/trainer/dashboard');
  };

  return (
    <div>
      <h1>Grade Capstone: {submission.course.title}</h1>
      <iframe src={submission.repository_url} className="w-full h-96" />
      
      <GradingRubric onSubmit={handleGrade} />
    </div>
  );
}
```

```sql
CREATE OR REPLACE FUNCTION grade_capstone(
  p_submission_id UUID,
  p_grader_id UUID,
  p_grade NUMERIC,
  p_feedback TEXT,
  p_passed BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE capstone_submissions
  SET
    status = CASE WHEN p_passed THEN 'passed' ELSE 'failed' END,
    grade = p_grade,
    feedback = p_feedback,
    graded_by = p_grader_id,
    graded_at = NOW()
  WHERE id = p_submission_id;

  -- If passed, check graduation eligibility
  IF p_passed THEN
    PERFORM check_graduation_eligibility(
      (SELECT enrollment_id FROM capstone_submissions WHERE id = p_submission_id)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

**Dependencies:** ACAD-012, ACAD-025
**Next:** ACAD-027 (At-Risk Alerts)
