# Guidewire Course Content Setup Checklist

**Created:** 2025-11-22
**Status:** Ready for content placement

---

## 📁 Folder Structure Created

```
✅ public/courses/guidewire-developer/
   ├── README.md ← Instructions
   ├── thumbnail.jpg ← PLACE YOUR COURSE THUMBNAIL HERE (1280x720px)
   │
   ├── ✅ lesson-01-introduction/
   │   ├── README.md ← Lesson details
   │   ├── video.mp4 ← PLACE YOUR 45-MIN VIDEO HERE
   │   ├── presentation.pdf ← PLACE YOUR SLIDES HERE
   │   └── assignment.pdf ← PLACE YOUR ASSIGNMENT HERE
   │
   ├── ✅ lesson-02-architecture/
   │   ├── README.md ← Lesson details
   │   ├── video.mp4 ← PLACE YOUR 50-MIN VIDEO HERE
   │   ├── presentation.pdf ← PLACE YOUR SLIDES HERE
   │   └── assignment.pdf ← PLACE YOUR ASSIGNMENT HERE
   │
   ├── ✅ lesson-03-data-model/
   │   ├── README.md ← Lesson details
   │   ├── video.mp4 ← PLACE YOUR 55-MIN VIDEO HERE
   │   ├── presentation.pdf ← PLACE YOUR SLIDES HERE
   │   └── assignment.pdf ← PLACE YOUR ASSIGNMENT HERE
   │
   ├── ✅ lesson-04-configuration/
   │   ├── README.md ← Lesson details
   │   ├── video.mp4 ← PLACE YOUR 60-MIN VIDEO HERE
   │   ├── presentation.pdf ← PLACE YOUR SLIDES HERE
   │   └── assignment.pdf ← PLACE YOUR ASSIGNMENT HERE
   │
   └── ✅ lesson-05-integration/
       ├── README.md ← Lesson details
       ├── video.mp4 ← PLACE YOUR 50-MIN VIDEO HERE
       ├── presentation.pdf ← PLACE YOUR SLIDES HERE
       └── assignment.pdf ← PLACE YOUR ASSIGNMENT HERE
```

---

## ✅ What's Already Done

- ✅ Folder structure created
- ✅ README files with detailed instructions in each folder
- ✅ Complete seed file with all lesson metadata
- ✅ Prerequisites configured (sequential enforcement)
- ✅ Test student account ready (student@intime.com)
- ✅ Database schema ready

---

## 📋 Your Action Items

### Option 1: Place Your Own Content (Production Ready)

**1. Course Thumbnail (1 file)**
```
📍 Location: public/courses/guidewire-developer/thumbnail.jpg
📏 Size: 1280x720px (16:9 aspect ratio)
📄 Format: JPG or PNG
```

**2. Lesson 1: Introduction to Guidewire (3 files)**
```
📍 Location: public/courses/guidewire-developer/lesson-01-introduction/

video.mp4
├─ Duration: 45 minutes
├─ Topics: Guidewire overview, P&C insurance, product suite, architecture, careers
└─ Format: MP4 (H.264), 1080p or 720p

presentation.pdf
├─ Content: Slides from video lecture
└─ Format: PDF (text-selectable)

assignment.pdf
├─ Content: Research assignment (3 companies, 1-page summary)
└─ Format: PDF
```

**3. Lesson 2: Architecture Deep Dive (3 files)**
```
📍 Location: public/courses/guidewire-developer/lesson-02-architecture/

video.mp4 (50 min)
├─ Topics: Multi-tier architecture, Gosu language, database, integrations, deployment
presentation.pdf
└─ assignment.pdf
```

**4. Lesson 3: Data Model & Entities (3 files)**
```
📍 Location: public/courses/guidewire-developer/lesson-03-data-model/

video.mp4 (55 min)
├─ Topics: Core entities, relationships, denormalization, custom entities, querying
presentation.pdf
└─ assignment.pdf
```

**5. Lesson 4: Configuration & Customization (3 files)**
```
📍 Location: public/courses/guidewire-developer/lesson-04-configuration/

video.mp4 (60 min)
├─ Topics: Guidewire Studio, PCF files, rules engine, validations, upgrades
presentation.pdf
└─ assignment.pdf
```

**6. Lesson 5: Integration Patterns & APIs (3 files)**
```
📍 Location: public/courses/guidewire-developer/lesson-05-integration/

video.mp4 (50 min)
├─ Topics: REST APIs, SOAP, messaging, batch jobs, error handling, security
presentation.pdf
└─ assignment.pdf
```

**Total Files Needed: 16 files (1 thumbnail + 15 lesson files)**

---

### Option 2: Use Placeholder Content (Quick Testing)

**If you want to test the system immediately without actual content:**

1. **Use YouTube Videos (No upload needed)**
   - Find 5 Guidewire-related videos on YouTube
   - Copy video IDs (e.g., `dQw4w9WgXcQ` from `youtube.com/watch?v=dQw4w9WgXcQ`)
   - I'll update the seed file to use YouTube embeds

2. **Use Public PDFs (No upload needed)**
   - Find Guidewire documentation PDFs online
   - Use direct links (Google Drive, Dropbox, official Guidewire docs)
   - I'll update the seed file with these URLs

**Want me to create placeholder version? Just say "use placeholders" and I'll handle it.**

---

### Option 3: Hybrid Approach (Recommended)

**Test with placeholders now, replace with real content later:**

1. I create placeholder version for immediate testing
2. You test entire flow today (enrollment → progress → completion)
3. You create/gather real content in parallel
4. We swap placeholders with real files
5. Re-test with production content

---

## 🚀 Once Files Are in Place

### Step 1: Verify Files Exist
```bash
# Check all files are in place
ls -lh public/courses/guidewire-developer/thumbnail.jpg
ls -lh public/courses/guidewire-developer/lesson-*/video.mp4
ls -lh public/courses/guidewire-developer/lesson-*/presentation.pdf
ls -lh public/courses/guidewire-developer/lesson-*/assignment.pdf

# Should show 16 files total
```

### Step 2: Seed the Database
```bash
# Use the complete seed file (with all metadata)
npm run db:seed

# Or manually:
psql $SUPABASE_DB_URL -f scripts/seed-guidewire-5-lessons-complete.sql
```

### Step 3: Verify Seeding
```sql
-- Check course created
SELECT * FROM courses WHERE slug = 'guidewire-developer';

-- Check all 5 topics
SELECT topic_number, title FROM module_topics
WHERE module_id = (SELECT id FROM course_modules WHERE slug = 'guidewire-fundamentals')
ORDER BY topic_number;

-- Check all 15 lessons
SELECT COUNT(*) FROM topic_lessons
WHERE topic_id IN (
  SELECT id FROM module_topics
  WHERE module_id = (SELECT id FROM course_modules WHERE slug = 'guidewire-fundamentals')
);
-- Should return: 15

-- Check test student enrolled
SELECT * FROM student_enrollments
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'student@intime.com');
```

### Step 4: Test Login
```
🌐 URL: https://your-app-url.vercel.app/login

Email: student@intime.com
Password: password123

After login: You should see the Guidewire course in your dashboard
```

### Step 5: Run End-to-End Test

**Test Flow (30-45 minutes):**

1. **Enrollment:**
   - [ ] Click "View Course"
   - [ ] Course details page loads
   - [ ] Prerequisites shown (none for this course)
   - [ ] Click "Enroll" (or auto-enrolled)
   - [ ] Redirected to course dashboard

2. **Lesson 1 (Video):**
   - [ ] Click Lesson 1
   - [ ] Video player loads
   - [ ] Play video (at least 1 minute)
   - [ ] Pause and refresh page
   - [ ] Video resumes from last position
   - [ ] Mark as complete
   - [ ] XP +10 notification appears

3. **Lesson 1 (Presentation):**
   - [ ] Click presentation link
   - [ ] PDF viewer loads
   - [ ] Scroll to bottom
   - [ ] Mark as complete
   - [ ] XP +10 notification

4. **Lesson 1 (Assignment):**
   - [ ] Open assignment PDF
   - [ ] Read assignment
   - [ ] Mark as complete
   - [ ] XP +10 (total 30 XP)

5. **Prerequisites:**
   - [ ] Lesson 2 unlocks automatically
   - [ ] Lock icon removed
   - [ ] "Next Lesson" button appears

6. **Progress Tracking:**
   - [ ] Dashboard shows 20% complete (1 of 5 topics)
   - [ ] XP total shows 30
   - [ ] Leaderboard updates (if other students exist)

7. **AI Mentor (Optional):**
   - [ ] Click AI Mentor icon
   - [ ] Ask: "What is Guidewire ClaimCenter?"
   - [ ] AI responds with Socratic prompt
   - [ ] Conversation history saved

8. **Complete All 5 Lessons:**
   - [ ] Repeat for Lessons 2-5
   - [ ] Final progress: 100%
   - [ ] Total XP: 150 (30 XP × 5 topics)
   - [ ] Graduation event triggered
   - [ ] Certificate generated (if implemented)

---

## 📊 Testing Checklist

### Database Verification
- [ ] Course created in `courses` table
- [ ] Module created in `course_modules` table
- [ ] 5 topics created in `module_topics` table
- [ ] 15 lessons created in `topic_lessons` table
- [ ] Test student enrolled in `student_enrollments`
- [ ] Prerequisites configured correctly

### Frontend Testing
- [ ] Course appears in catalog
- [ ] Course detail page loads
- [ ] Enrollment flow works
- [ ] Video player works (resume playback)
- [ ] PDF viewer works (scroll tracking)
- [ ] Progress updates in real-time
- [ ] XP awards correctly
- [ ] Prerequisites enforce sequencing
- [ ] Leaderboard updates
- [ ] AI Mentor chat works (if enabled)

### Backend Testing
- [ ] tRPC endpoints respond correctly
- [ ] Progress tracking updates `topic_completions`
- [ ] XP transactions recorded
- [ ] Materialized views refresh
- [ ] Graduation event published at 100%

---

## 🐛 Common Issues & Solutions

### Issue: Videos won't play
**Solution:** Check file format (must be MP4 H.264). Try YouTube embeds instead.

### Issue: PDFs won't load
**Solution:** Ensure PDFs are text-based (not scanned images). Check file size < 20MB.

### Issue: Lesson 2 still locked after completing Lesson 1
**Solution:** Check `topic_completions` table. Run:
```sql
SELECT * FROM topic_completions
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'student@intime.com');
```

### Issue: XP not awarding
**Solution:** Check `xp_transactions` table. Ensure `complete_topic()` function is being called.

### Issue: Test student can't login
**Solution:** Check auth.users table:
```sql
SELECT * FROM auth.users WHERE email = 'student@intime.com';
```

---

## 📚 Reference Documentation

**For detailed instructions, see:**
- `ACADEMY-LMS-COMPARISON-REPORT.md` - Complete functional analysis
- `public/courses/guidewire-developer/README.md` - Main course guide
- `public/courses/guidewire-developer/lesson-*/README.md` - Individual lesson guides
- `scripts/seed-guidewire-5-lessons-complete.sql` - Database seed file

**For testing guidance, see:**
- Report Section: "End-to-End Testing Plan" (Phase 1-7)
- Report Section: "Testing Readiness Assessment"

---

## ❓ What Would You Like to Do?

**Choose your path:**

1. **"I have content ready"** → Place your 16 files in the folders, then run seed script
2. **"Create placeholders"** → I'll make a placeholder version using YouTube/public PDFs
3. **"Show me an example"** → I'll create 1 complete lesson with sample content
4. **"Questions about content"** → Ask about video topics, assignment ideas, etc.

---

**Current Status:** ✅ Folders created, ⏳ Waiting for content files

**Next Step:** Choose your approach above, or start placing files!
