---
name: academy
description: Academy/Training platform domain expertise for InTime v3
---

# Academy Skill - Training Platform

## Domain Overview
Cohort-based training platform with gamification (XP, streaks, badges, certificates).

## Content Hierarchy
```
Course
  └── Module
        └── Topic
              └── Lesson (video, markdown, quiz, lab)
```

## Key Tables (src/lib/db/schema/academy.ts)

| Table | Purpose |
|-------|---------|
| `courses` | Course catalog |
| `course_modules` | Modules within courses |
| `module_topics` | Topics within modules |
| `topic_lessons` | Lessons (video, markdown, quiz, lab) |
| `student_enrollments` | Student-cohort enrollments |
| `course_progress` | Topic completion tracking |
| `xp_transactions` | XP point ledger |
| `learning_streaks` | Daily activity streaks |
| `certificates` | Issued certifications |
| `badges` | Achievement badges |
| `user_badges` | Earned badges |

## Enums

```typescript
// Skill levels
'beginner' | 'intermediate' | 'advanced'

// Content types
'video' | 'reading' | 'quiz' | 'lab' | 'project'

// Enrollment status
'pending' | 'active' | 'completed' | 'dropped' | 'expired'

// XP transaction types
'topic_completion' | 'quiz_passed' | 'lab_completed' |
'project_submitted' | 'bonus_achievement' | 'badge_earned'

// Badge rarity
'common' | 'rare' | 'epic' | 'legendary'
```

## Components (src/components/academy/)

| Component | Purpose |
|-----------|---------|
| AcademyPortal.tsx | Main entry point |
| CandidateDashboard.tsx | Student dashboard |
| InstructorDashboard.tsx | Trainer dashboard |
| CohortDetail.tsx | Cohort management |
| XPProgress.tsx | XP display component |
| StreakFlame.tsx | Streak visualization |
| CertificateGenerator.tsx | Certificate creation |
| BiometricBackground.tsx | Visual effects |

## Gamification System

### XP Points
```typescript
// Earning XP
Topic completion:    +100 XP
Quiz passed:         +50 XP (+ bonus for score)
Lab completed:       +150 XP
Streak bonus (7d):   +200 XP
Badge earned:        +25-500 XP (by rarity)
```

### Levels
```typescript
Level 1:   0-500 XP
Level 2:   501-1500 XP
Level 3:   1501-3500 XP
Level 4:   3501-7000 XP
Level 5+:  Progressive scaling
```

### Streaks
- Track consecutive days of activity
- Flame visualization intensifies with streak length
- Bonus XP at milestones (7, 14, 30 days)

### Badges (Trigger Types)
```typescript
'first_video'        // Watch first video
'first_quiz'         // Complete first quiz
'quiz_streak'        // 5 quizzes in a row without failing
'perfect_quiz'       // 100% on a quiz
'course_completion'  // Finish a course
'consistency'        // 30-day streak
'speed_demon'        // Complete module in record time
'night_owl'          // Study after midnight
'early_bird'         // Study before 6am
```

## API Endpoints (tRPC)

```typescript
// Courses
trpc.courses.list({ skillLevel?, isPublished? })
trpc.courses.getBySlug({ slug })
trpc.courses.getContent({ courseId })  // Full content tree

// Enrollment
trpc.enrollment.enroll({ courseId, cohortId? })
trpc.enrollment.getMyEnrollments()
trpc.enrollment.drop({ enrollmentId })

// Progress
trpc.progress.completeTopic({ topicId })
trpc.progress.submitQuiz({ quizId, answers })
trpc.progress.getProgress({ enrollmentId })
trpc.progress.getCourseProgress({ courseId })

// Gamification
trpc.xp.getBalance()
trpc.xp.getTransactions({ limit? })
trpc.xp.getLeaderboard({ courseId?, timeframe? })
trpc.streaks.getCurrent()
trpc.badges.getEarned()
trpc.badges.checkUnlocks()  // Check for newly unlocked badges

// Certificates
trpc.certificates.generate({ enrollmentId })
trpc.certificates.verify({ certificateId })
```

## Key Schema Fields

### Courses
```typescript
{
  id, slug,
  title, subtitle, description,
  total_modules, total_topics,
  estimated_duration_weeks,
  price_monthly, price_one_time,
  is_included_in_all_access,
  prerequisite_course_ids,  // uuid[]
  skill_level,              // beginner | intermediate | advanced
  thumbnail_url, promo_video_url,
  is_published, is_featured,
  created_by, created_at, updated_at, deleted_at
}
```

### Student Enrollments
```typescript
{
  id,
  student_id,      // user profile ID
  course_id,
  cohort_id,       // optional cohort
  status,          // pending | active | completed | dropped | expired
  enrolled_at,
  started_at,
  completed_at,
  payment_type,    // subscription | one_time | free | scholarship
  created_at, updated_at
}
```

### XP Transactions
```typescript
{
  id,
  student_id,
  amount,            // can be negative for penalties
  transaction_type,  // topic_completion | quiz_passed | etc.
  reference_type,    // what triggered it
  reference_id,      // ID of the trigger
  description,
  created_at
}
```

## Common Patterns

### Award XP
```typescript
await db.insert(xpTransactions).values({
  student_id: studentId,
  amount: 100,
  transaction_type: 'topic_completion',
  reference_type: 'topic_completion',
  reference_id: topicId,
  description: `Completed topic: ${topicTitle}`,
});
```

### Check Streak
```typescript
const streak = await db.query.learningStreaks.findFirst({
  where: eq(learningStreaks.student_id, studentId),
});
const isActive = streak?.last_activity_date &&
  differenceInHours(new Date(), streak.last_activity_date) < 48;
```

### Progress Calculation
```typescript
const progress = (completedTopics / totalTopics) * 100;
```
