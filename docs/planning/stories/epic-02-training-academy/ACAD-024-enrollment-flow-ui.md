# ACAD-024: Enrollment Flow UI

**Status:** ✅ Complete

**Story Points:** 5
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** MEDIUM
**Completed:** 2025-11-21

---

## User Story

As a **Student**,
I want **Course selection, payment, onboarding automation**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [x] Course catalog page (browse all courses)
- [x] Course detail page (syllabus, pricing, reviews)
- [x] Enroll button (triggers payment or direct enroll if free)
- [⏳] Payment flow (Stripe checkout) - Deferred to ACAD-028
- [x] Post-enrollment redirect to course dashboard
- [x] Welcome email sent (via event handler)
- [x] Onboarding checklist
- [⏳] Course preview (sample videos) - Deferred to future sprint

---

## Implementation

```typescript
// src/app/courses/[slug]/enroll/page.tsx
export default function EnrollPage({ params }: { params: { slug: string } }) {
  const { data: course } = trpc.courses.getBySlug.useQuery({ slug: params.slug });
  const enrollMutation = trpc.enrollment.enrollInCourse.useMutation();

  const handleEnroll = async () => {
    // Create Stripe checkout session
    const session = await createCheckoutSession(course.id, course.price_monthly);
    
    // Redirect to Stripe
    window.location.href = session.url;
  };

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.subtitle}</p>
      <Button onClick={handleEnroll}>
        Enroll Now - \${course.price_monthly}/month
      </Button>
    </div>
  );
}
```

---

## Implementation Summary

### Files Created

**Pages:**
1. **`src/app/students/courses/page.tsx`** (280 lines)
   - Course catalog with search and filtering
   - Grid layout with course cards
   - Skill level filtering (beginner, intermediate, advanced)
   - Enrollment status badges
   - Responsive design

2. **`src/app/students/courses/[slug]/page.tsx`** (320 lines)
   - Course detail page with full syllabus
   - Hero section with promo video/thumbnail
   - Module and topic breakdown
   - Pricing card with enrollment CTA
   - Prerequisites check and display
   - SEO metadata generation

**Components:**
3. **`src/components/academy/EnrollButton.tsx`** (150 lines)
   - Enrollment flow with confirmation dialog
   - Free vs paid course handling
   - Prerequisites validation
   - Stripe integration placeholder (ACAD-028)
   - Success toast and redirect

4. **`src/components/academy/OnboardingChecklist.tsx`** (180 lines)
   - 5-step onboarding guide
   - Progress bar
   - Dismissible card
   - Completion tracking
   - Interactive checklist items

**Backend:**
5. **`src/lib/events/types.ts`** (Modified)
   - Added `CourseEnrolledPayload` type
   - Enrollment event support

6. **`src/lib/events/handlers/course-handlers.ts`** (Modified, +130 lines)
   - `sendWelcomeEmail()` handler
   - `createOnboardingChecklist()` handler
   - Registered to `course.enrolled` event

7. **`src/server/trpc/routers/enrollment.ts`** (Modified, +60 lines)
   - Event publishing on enrollment
   - `getOnboardingChecklist` endpoint
   - `completeChecklistItem` endpoint

### Event-Driven Workflow

```
Student clicks "Enroll" button
    ↓
EnrollButton component
    ↓
enrollInCourse mutation (enrollment router)
    ↓
enroll_student RPC function (creates enrollment record)
    ↓
Publish course.enrolled event
    ↓
Event Handlers (parallel execution):
  1. sendWelcomeEmail → Queue background job
  2. createOnboardingChecklist → Create 5 checklist items
    ↓
Redirect to /students/dashboard
    ↓
OnboardingChecklist component displays
```

### Features Implemented

**Course Catalog:**
- Search by title/description
- Filter by skill level
- Enrollment status indicators
- Free/paid pricing display
- Responsive grid layout
- Empty state handling

**Course Detail:**
- Hero section with video/thumbnail
- Full syllabus with modules and topics
- Locked topics for non-enrolled students
- Pricing sidebar with "What's Included"
- Prerequisites warning
- SEO-friendly metadata

**Enrollment Flow:**
- One-click enrollment for free courses
- Payment dialog for paid courses
- Prerequisite validation
- Success toast notifications
- Automatic dashboard redirect

**Welcome Email:**
- Queued via background jobs
- Contains course name, dashboard link
- High priority delivery

**Onboarding Checklist:**
- 5 guided steps for new students:
  1. Complete profile
  2. Watch intro video
  3. Complete first topic
  4. Meet AI Mentor
  5. Setup study schedule
- Progress tracking
- Interactive completion
- Dismissible UI
- Completion celebration

### Notes

**Stripe Integration:**
Deferred to ACAD-028. Currently shows placeholder dialog for paid courses with TODO comments.

**Course Previews:**
Sample videos/content deferred to future sprint. Current implementation shows promo video if available.

---

**Dependencies:** ACAD-001, ACAD-002, ACAD-028 (Stripe)
**Next:** ACAD-025 (Trainer Dashboard) - Sprint 5
