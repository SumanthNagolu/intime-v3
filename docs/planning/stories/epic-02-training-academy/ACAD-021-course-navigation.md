# ACAD-021: Course Navigation

**Story Points:** 4
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **Module tree, topic breadcrumbs, progress indicators**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [ ] Sidebar module tree (collapsible)
- [ ] Topic list with completion icons
- [ ] Breadcrumb navigation
- [ ] Next/Previous topic buttons
- [ ] Locked/unlocked visual indicators
- [ ] Progress bar per module
- [ ] Jump to any unlocked topic
- [ ] Mobile drawer navigation

---

## Implementation

```typescript
export function CourseNavigation({ courseId, currentTopicId }: Props) {
  const { data: modules } = trpc.courses.getModules.useQuery({ courseId });

  return (
    <nav className="course-nav">
      {modules?.map(module => (
        <div key={module.id}>
          <h3>{module.title}</h3>
          <ul>
            {module.topics.map(topic => (
              <li key={topic.id} className={topic.isUnlocked ? '' : 'locked'}>
                <Link href={`/courses/${courseId}/topics/${topic.id}`}>
                  {topic.isCompleted && <Check />}
                  {!topic.isUnlocked && <Lock />}
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

---

**Dependencies:** ACAD-001, ACAD-003, ACAD-006
**Next:** ACAD-022 (Graduation Workflow)
