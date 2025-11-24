# ACAD-026: Grading System

**Status:** ✅ Complete

**Story Points:** 6
**Sprint:** Sprint 5 (Week 13-14)
**Priority:** MEDIUM
**Completed:** 2025-11-21

---

## User Story

As a **Trainer**,
I want **Capstone review interface, feedback, scoring rubrics**,
So that **I can support students effectively and track teaching performance**.

---

## Acceptance Criteria

- [x] Capstone submission review page ✅
- [x] GitHub repo code viewer ✅
- [x] Video demo player ✅
- [x] Grading rubric checklist ✅
- [x] Score input (0-100) ✅
- [x] Feedback text area ✅
- [x] Pass/Fail/Revision Requested actions ✅
- [x] Notify student on grade submission ✅
- [x] Grading history tracking ✅

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

## Implementation Summary

### Files Created

**Pages (1):**
1. **`src/app/trainer/grade/[submissionId]/page.tsx`** (220 lines)
   - Main grading page with submission details
   - Student information display
   - Wait time tracking
   - Embedded GitHub repo viewer
   - Demo video player
   - Peer reviews display
   - Grading form sidebar
   - Previous grading history

**Components (4):**
2. **`src/components/trainer/GradingForm.tsx`** (290 lines)
   - Interactive grading form with 7-criterion rubric:
     - Functionality & Requirements (25 points)
     - Code Quality (20 points)
     - Best Practices (15 points)
     - Testing (15 points)
     - Documentation (10 points)
     - UI/UX Design (10 points)
     - Demo & Presentation (5 points)
   - Auto-calculated total score (0-100)
   - Visual progress bars per criterion
   - Feedback textarea with validation
   - Status selection (Pass/Fail/Revision Requested)
   - Submit button with loading state

3. **`src/components/trainer/GitHubRepoViewer.tsx`** (180 lines)
   - Two view modes: embedded viewer and quick links
   - Embedded github1s.com VS Code viewer
   - Quick links to GitHub, github.dev, commits, issues
   - Clone command with copy button
   - URL validation and error handling

4. **`src/components/trainer/VideoPlayer.tsx`** (140 lines)
   - Multi-platform support:
     - YouTube embed
     - Vimeo embed
     - Loom embed
     - Google Drive embed
     - Direct video files (mp4, webm, ogg)
   - Fallback for unknown platforms
   - External link option

5. **`src/components/trainer/PeerReviewsList.tsx`** (120 lines)
   - Average rating summary with star display
   - Individual reviews with 1-5 star ratings
   - Reviewer name and date
   - Comments, strengths, and improvements display
   - Helpfulness count (if available)
   - Empty state handling

**Backend (2 modified):**
6. **`src/server/trpc/routers/capstone.ts`** (+50 lines)
   - Enhanced `gradeCapstone` mutation to publish event
   - Fetches submission and grader details
   - Publishes `capstone.graded` event with full payload

7. **`src/lib/events/types.ts`** (+14 lines)
   - Added `CapstoneGradedPayload` interface
   - Type-safe event payload for grading notifications

8. **`src/lib/events/handlers/course-handlers.ts`** (+56 lines)
   - `sendGradeNotification` handler
   - Queues email based on grade status (pass/fail/revision)
   - Custom subject and message per status
   - Registered to `capstone.graded` event

### Features Implemented

**Grading Page:**
- Comprehensive submission overview
- Student info with wait time calculation
- Status badges with color coding
- Submission description and revision count
- Responsive 2/3 + 1/3 layout

**GitHub Code Viewer:**
- Embedded VS Code (github1s.com) for in-browser review
- Toggle between embedded and links view
- Direct links to repo, commits, issues
- One-click clone command copy
- Supports all GitHub repositories

**Video Player:**
- Automatic platform detection
- Responsive aspect-ratio container
- Full-screen support
- External link fallback
- Supports most video platforms

**Grading Rubric:**
- 7 comprehensive criteria totaling 100 points
- Individual score inputs with max validation
- Real-time total calculation
- Visual progress bars per criterion
- Detailed descriptions for each criterion

**Feedback System:**
- Minimum 10 character validation
- Character count display
- Required field enforcement
- Plain text area for detailed feedback

**Decision System:**
- Three status options with distinct outcomes
- Pass: Student completes capstone
- Fail: Student must resubmit with major work
- Revision Requested: Minor improvements needed
- Status-specific email notifications

**Notification System:**
- Event-driven email queuing
- High priority delivery
- Custom subject/message per status
- Background job processing
- Includes grade, feedback, and next steps

**Grading History:**
- Display previous grade if exists
- Show previous score, grader, date
- Previous feedback display
- Supports re-grading workflow

### Event-Driven Architecture

**New Event:**
- `capstone.graded` - Published when trainer grades submission

**Event Payload:**
```typescript
{
  submissionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  grade: number;
  feedback: string;
  status: 'passed' | 'failed' | 'revision_requested';
  graderId: string;
  graderName: string;
  gradedAt: string;
}
```

**Event Handler:**
- `sendGradeNotification` - Queues email to student
- Different email templates based on status
- High priority job queue

### Grading Workflow

```
1. Trainer clicks "Grade Now" from dashboard
   ↓
2. Opens /trainer/grade/[submissionId]
   ↓
3. Reviews:
   - Student information
   - GitHub repository (embedded viewer)
   - Demo video (if provided)
   - Peer reviews (if available)
   ↓
4. Fills grading rubric (7 criteria)
   ↓
5. Writes detailed feedback
   ↓
6. Selects decision (Pass/Fail/Revision)
   ↓
7. Submits grade
   ↓
8. gradeCapstone mutation:
   - Fetches submission and grader details
   - Calls grade_capstone RPC
   - Publishes capstone.graded event
   ↓
9. Event handler queues notification email
   ↓
10. Success toast + redirect to dashboard
   ↓
11. Student receives email with grade and feedback
```

---

**Dependencies:** ACAD-012, ACAD-025
**Next:** ACAD-027 (At-Risk Alerts)
