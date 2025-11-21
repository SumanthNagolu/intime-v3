# ACAD-024: Enrollment Flow UI

**Status:** ⚪ Not Started

**Story Points:** 5
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** MEDIUM

---

## User Story

As a **Student**,
I want **Course selection, payment, onboarding automation**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [ ] Course catalog page (browse all courses)
- [ ] Course detail page (syllabus, pricing, reviews)
- [ ] Enroll button (triggers payment or direct enroll if free)
- [ ] Payment flow (Stripe checkout)
- [ ] Post-enrollment redirect to course dashboard
- [ ] Welcome email sent
- [ ] Onboarding checklist
- [ ] Course preview (sample videos)

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

**Dependencies:** ACAD-001, ACAD-002, ACAD-028 (Stripe)
**Next:** ACAD-025 (Trainer Dashboard) - Sprint 5
