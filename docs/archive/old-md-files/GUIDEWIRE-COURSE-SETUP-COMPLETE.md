# Guidewire PolicyCenter Course - Setup Complete! ✅

**Date:** 2025-11-22
**Status:** Ready to Seed & Test

---

## 📁 Final Folder Structure

```
public/courses/guidewire-developer/
└── policy-center-introduction/          ← MODULE
    ├── lesson-01-accounts/              ← TOPIC
    │   ├── lesson.pptx      (195 MB)   ← Main presentation
    │   ├── demo-1.mp4       (53 MB)    ← Demo video 1
    │   ├── demo-2.mp4       (134 MB)   ← Demo video 2
    │   └── assignment.pdf   (644 KB)   ← Assignment
    ├── lesson-02-policy-transactions/
    │   ├── lesson.pptx      (3.0 MB)
    │   └── assignment.pdf   (111 KB)
    ├── lesson-03-policy-files/
    │   ├── lesson.pptx      (99 MB)
    │   ├── demo-1.mp4       (60 MB)
    │   ├── demo-2.mp4       (37 MB)
    │   └── assignment.pdf   (329 KB)
    ├── lesson-04-product-model/
    │   ├── lesson.pptx      (3.3 MB)
    │   └── assignment.pdf   (560 KB)
    └── lesson-05-full-application/
        ├── lesson.pptx      (506 MB)
        ├── demo-1.mp4       (116 MB)
        ├── demo-2.mp4       (63 MB)
        ├── demo-3.mp4       (96 MB)
        ├── demo-4.mp4       (156 MB)
        ├── demo-5.mp4       (73 MB)
        └── assignment.pdf   (554 KB)
```

**Total Files:** 19 content files
**Total Size:** ~1.6 GB

---

## 🗂️ Database Mapping

```
Course: Guidewire PolicyCenter Introduction
└── Module: PolicyCenter Fundamentals
    ├── Topic 1: Accounts (4 lessons)
    │   ├── Lesson: Accounts Lesson (PPTX)
    │   ├── Lesson: Demo Part 1 (MP4)
    │   ├── Lesson: Demo Part 2 (MP4)
    │   └── Lesson: Assignment (PDF)
    ├── Topic 2: Policy Transactions (2 lessons)
    │   ├── Lesson: Policy Transactions Lesson (PPTX)
    │   └── Lesson: Assignment (PDF)
    ├── Topic 3: The Policy File (4 lessons)
    │   ├── Lesson: The Policy File Lesson (PPTX)
    │   ├── Lesson: Demo Part 1 (MP4)
    │   ├── Lesson: Demo Part 2 (MP4)
    │   └── Lesson: Assignment (PDF)
    ├── Topic 4: Product Model Introduction (2 lessons)
    │   ├── Lesson: Product Model Lesson (PPTX)
    │   └── Lesson: Assignment (PDF)
    └── Topic 5: Full Application Submission (7 lessons)
        ├── Lesson: Full Application Lesson (PPTX)
        ├── Lesson: Demo Part 1 (MP4)
        ├── Lesson: Demo Part 2 (MP4)
        ├── Lesson: Demo Part 3 (MP4)
        ├── Lesson: Demo Part 4 (MP4)
        ├── Lesson: Demo Part 5 (MP4)
        └── Lesson: Assignment (PDF)
```

---

## ✅ What's Complete

- [x] **Folder structure organized** (module/topic/lesson hierarchy)
- [x] **Files renamed to standards** (lesson.pptx, assignment.pdf, demo-X.mp4)
- [x] **Seed file created** (`scripts/seed-guidewire-policycenter-final.sql`)
- [x] **All file paths updated** (nested module structure)
- [x] **Prerequisites configured** (Topic 2 requires Topic 1, etc.)
- [x] **Test student account ready** (student@intime.com)
- [x] **Multiple demo videos supported** (Lesson 1: 2 videos, Lesson 3: 2 videos, Lesson 5: 5 videos)

---

## 🚀 Next Steps

### Step 1: Seed the Database

```bash
# Option A: Using psql directly
psql $SUPABASE_DB_URL -f scripts/seed-guidewire-policycenter-final.sql

# Option B: Create npm script (add to package.json)
npm run db:seed:guidewire
```

**Expected Output:**
```
Course Created          | guidewire-policycenter-introduction
Module Created          | policycenter-fundamentals
Topics Created (5)      | lesson-01-accounts, lesson-02-policy-transactions, ...
Lessons Summary (19)    | Topic 1=4, Topic 2=2, Topic 3=4, Topic 4=2, Topic 5=7
Student Enrolled        | student@intime.com
```

### Step 2: Verify in Database

```sql
-- Check course exists
SELECT * FROM courses WHERE slug = 'guidewire-policycenter-introduction';

-- Check module structure
SELECT
  c.title as course,
  m.title as module,
  COUNT(t.id) as topic_count
FROM courses c
JOIN course_modules m ON m.course_id = c.id
LEFT JOIN module_topics t ON t.module_id = m.id
WHERE c.slug = 'guidewire-policycenter-introduction'
GROUP BY c.title, m.title;

-- Check all topics with lesson counts
SELECT
  t.topic_number,
  t.title,
  COUNT(l.id) as lesson_count
FROM module_topics t
LEFT JOIN topic_lessons l ON l.topic_id = t.id
WHERE t.module_id = (
  SELECT id FROM course_modules
  WHERE slug = 'policycenter-fundamentals'
)
GROUP BY t.topic_number, t.title
ORDER BY t.topic_number;

-- Check enrollment
SELECT
  u.email,
  e.status,
  e.enrolled_at,
  e.completion_percentage
FROM student_enrollments e
JOIN user_profiles u ON u.id = e.user_id
WHERE e.course_id = (SELECT id FROM courses WHERE slug = 'guidewire-policycenter-introduction');
```

### Step 3: Test Login & Access

```
🌐 URL: https://your-app.vercel.app/login

Email: student@intime.com
Password: password123
```

### Step 4: End-to-End Testing (30-45 minutes)

**Test Flow:**

1. **Dashboard**
   - [ ] Course appears in "My Courses"
   - [ ] Progress shows 0%
   - [ ] XP shows 0

2. **Lesson 1: Accounts**
   - [ ] Topic 1 is unlocked (no prerequisites)
   - [ ] Topics 2-5 are locked
   - [ ] Open Lesson 1.1 (PPTX)
   - [ ] View presentation
   - [ ] Mark as complete → XP +10
   - [ ] Open Lesson 1.2 (Demo 1 MP4)
   - [ ] Video plays correctly
   - [ ] Mark as complete → XP +10
   - [ ] Open Lesson 1.3 (Demo 2 MP4)
   - [ ] Video plays correctly
   - [ ] Mark as complete → XP +10
   - [ ] Open Lesson 1.4 (Assignment PDF)
   - [ ] PDF loads correctly
   - [ ] Mark as complete → XP +10
   - [ ] Total XP after Lesson 1: **40 XP**
   - [ ] Progress: **20%** (1 of 5 topics)

3. **Lesson 2: Policy Transactions**
   - [ ] Topic 2 unlocks automatically
   - [ ] Lock icon removed
   - [ ] Complete Lesson 2.1 (PPTX) → XP +10
   - [ ] Complete Lesson 2.2 (Assignment PDF) → XP +10
   - [ ] Total XP after Lesson 2: **60 XP**
   - [ ] Progress: **40%** (2 of 5 topics)

4. **Lesson 3: The Policy File**
   - [ ] Topic 3 unlocks
   - [ ] Complete all 4 lessons (PPTX, 2 videos, assignment)
   - [ ] Total XP after Lesson 3: **100 XP**
   - [ ] Progress: **60%** (3 of 5 topics)

5. **Lesson 4: Product Model**
   - [ ] Topic 4 unlocks
   - [ ] Complete 2 lessons
   - [ ] Total XP after Lesson 4: **120 XP**
   - [ ] Progress: **80%** (4 of 5 topics)

6. **Lesson 5: Full Application Submission**
   - [ ] Topic 5 unlocks
   - [ ] Complete 7 lessons (PPTX, 5 videos, assignment)
   - [ ] Total XP after Lesson 5: **190 XP**
   - [ ] Progress: **100%** (5 of 5 topics)

7. **Graduation**
   - [ ] Enrollment status = 'completed'
   - [ ] `course.graduated` event published
   - [ ] Certificate generated (if implemented)
   - [ ] Badge unlocked (if configured)

---

## 📊 File Type Summary

| Type | Count | Total Size | Purpose |
|------|-------|------------|---------|
| PPTX (lessons) | 5 | ~806 MB | Main presentations with embedded demos |
| MP4 (demos) | 9 | ~698 MB | Demonstration videos |
| PDF (assignments) | 5 | ~2.1 MB | Student assignments |
| **Total** | **19** | **~1.6 GB** | Complete module content |

---

## 🔍 Testing Checklist

### Content Delivery
- [ ] PPTX files render correctly (or download link works)
- [ ] MP4 videos play in browser
- [ ] Video player shows controls (play, pause, seek)
- [ ] Resume playback works (remembers position)
- [ ] PDF viewer loads correctly
- [ ] Scroll tracking works for PDFs

### Progress Tracking
- [ ] Topic completion updates in database
- [ ] XP awarded correctly (10 XP per lesson)
- [ ] XP transactions recorded
- [ ] Leaderboard updates (if other students exist)
- [ ] Completion percentage calculates correctly
- [ ] Next topic unlocks automatically

### Prerequisites
- [ ] Topics 2-5 locked initially
- [ ] Lock indicators show prerequisite titles
- [ ] Topics unlock sequentially after completion
- [ ] "Next Lesson" button appears after completing current topic
- [ ] Can't access locked topics (UI prevents it)

### User Experience
- [ ] Navigation sidebar shows all topics
- [ ] Current topic highlighted
- [ ] Breadcrumb trail works
- [ ] Mobile view responsive
- [ ] Loading states show for large files (500MB+ PPTX)
- [ ] Error handling for missing files

---

## 🎓 Course Details

**Course:** Guidewire PolicyCenter Introduction
**Module:** PolicyCenter Fundamentals
**Topics:** 5
**Lessons:** 19
**Duration:** ~8 weeks
**Skill Level:** Beginner
**Prerequisites:** None (first course in Guidewire series)

**Topics Covered:**
1. Accounts (90 min)
2. Policy Transactions (60 min)
3. The Policy File (90 min)
4. Product Model Introduction (60 min)
5. Full Application Submission (120 min)

**Total Learning Time:** ~7 hours of content

---

## 📈 Expected Student Journey

```
Day 1:   Enroll → Complete Lesson 1 (90 min) → 20% complete, 40 XP
Day 2-3: Complete Lesson 2 (60 min) → 40% complete, 60 XP
Day 4-5: Complete Lesson 3 (90 min) → 60% complete, 100 XP
Day 6:   Complete Lesson 4 (60 min) → 80% complete, 120 XP
Day 7-8: Complete Lesson 5 (120 min) → 100% complete, 190 XP
         → GRADUATED! 🎓
```

---

## 🔄 Future Modules (Coming Soon)

Structure is ready for:
- `claimcenter-introduction/` (5-7 lessons)
- `policycenter-configuration/` (8-10 lessons)
- `claimcenter-configuration/` (8-10 lessons)
- `integration-patterns/` (6-8 lessons)
- `billingcenter-introduction/` (4-6 lessons)

**Same folder pattern:**
```
guidewire-developer/
├── policycenter-introduction/ ✅ (READY)
├── claimcenter-introduction/ (TODO)
├── policycenter-configuration/ (TODO)
└── ...
```

---

## 🐛 Known Issues & Workarounds

### Issue 1: Large PPTX Files (500MB+)
**Impact:** Lesson 5 PPTX is 506 MB, may take time to load
**Workaround:**
- Compress PPTX (remove unused media, optimize images)
- Upload to Google Drive/OneDrive and link instead
- Convert to PDF (loses interactivity but smaller)

### Issue 2: PPTX Not Rendering in Browser
**Impact:** Some browsers don't support PPTX preview
**Workaround:**
- Provide download link
- Convert to PDF for inline viewing
- Use external viewer (Google Docs Viewer)

### Issue 3: Multiple Demo Videos
**Impact:** 5 separate videos for Lesson 5 (504 MB total)
**Workaround:**
- Merge videos into single file (using ffmpeg)
- Upload to Vimeo/YouTube and embed
- Add chapter markers in video player

---

## 💡 Optimization Recommendations

### Short-Term (1-2 weeks)
1. **Compress PPTX files:**
   - Remove embedded videos (already have separate MP4s)
   - Optimize images (use 1080p max, not 4K)
   - Target: 50-80% size reduction

2. **Add video chapters:**
   - Lesson 5 has 5 demos
   - Add chapter markers or timestamps
   - Improve student navigation

3. **Create quiz for each lesson:**
   - 5-10 questions per topic
   - Auto-graded multiple choice
   - Unlock certificate only if quizzes pass (80%+)

### Medium-Term (1 month)
1. **Upload videos to Vimeo/YouTube:**
   - Reduce hosting costs
   - Faster streaming
   - Better player controls (speed, quality)

2. **Add lab environment:**
   - Lesson 5 assignment could be hands-on lab
   - GitHub template with PolicyCenter config
   - Auto-grading via GitHub Actions

3. **Certificate generation:**
   - PDF template design
   - Auto-generate on 100% completion
   - Verification page (`/verify/[certificateNumber]`)

---

## ✅ Ready to Proceed?

**Current Status:** All files in place, seed file ready

**To begin testing:**
```bash
# 1. Seed the database
psql $SUPABASE_DB_URL -f scripts/seed-guidewire-policycenter-final.sql

# 2. Start development server (if needed)
npm run dev

# 3. Login and test
# URL: http://localhost:3000/login
# Email: student@intime.com
# Password: password123
```

**Questions? Issues?**
- See `ACADEMY-LMS-COMPARISON-REPORT.md` for detailed testing guide
- See `CONTENT-SETUP-CHECKLIST.md` for troubleshooting

---

**Setup Complete! 🎉 Ready to seed and test the Academy module.**
