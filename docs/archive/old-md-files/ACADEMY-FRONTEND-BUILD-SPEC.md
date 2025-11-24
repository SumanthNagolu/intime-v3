# Training Academy Module - Frontend Build Specification

**For:** Frontend Developer (standalone context)
**Project:** InTime v3 Training Academy
**Current Status:** 75% complete (frontend only)
**Goal:** Complete remaining 25% for full demo-ready experience
**Code Location:** `/frontend-prototype/`
**Live Preview:** `http://localhost:3004`

---

## 🎯 What is the Training Academy?

### Business Context

InTime's Training Academy transforms **inexperienced candidates** into **job-ready consultants** in 8 weeks through hands-on Guidewire insurance software training.

**The Problem:**
- Clients need Guidewire consultants (rare, expensive skill)
- Fresh graduates can't get jobs without experience
- Traditional bootcamps teach theory, not real-world skills

**The Solution:**
- 8-week intensive training program
- Project-based learning (build real insurance systems)
- AI mentor guidance using Socratic method
- Sequential mastery (can't skip ahead without proving competence)
- Graduates get "Senior Developer" persona/resume
- Placed in $80-120k/year consulting roles

**Business Model:**
- Students pay $0 upfront
- Get hired by InTime after graduation
- Work for InTime for 18-24 months
- Then placed with enterprise clients

---

## 👥 User Personas

### 1. **Student** (Primary User)
- Age: 22-28
- Background: CS degree or bootcamp graduate
- Goal: Get first tech job with "2 years experience"
- Pain: Can't get hired without experience
- Journey: Enroll → Learn → Build → Graduate → Get Placed

### 2. **HR Admin / Company Training Manager** (Secondary User)
- Role: Manages employee upskilling programs
- Goal: Assign courses to employees for career development
- Use Case: "I want to assign Guidewire training to 5 junior developers"
- Portal: `/hr/learning`

### 3. **Public Visitor** (Tertiary User)
- Not enrolled yet
- Researching the program
- Landing page: `/academy` (marketing site)
- Action: Apply for next cohort

---

## 🎨 The Pedagogical Model (Theory → Demo → Verify → Build)

This is the **CORE INNOVATION** - a 4-phase learning protocol for every lesson:

### **Phase 1: Theory Tab**
- Multi-slide presentation format
- Left side: Main concept explanation
- Right side: "Senior Context" panel
  - Why this matters in real projects
  - Common pitfalls senior devs know
  - Business impact of this skill
- Navigation: Next/Previous slide buttons
- Progress indicator (Slide X of Y)

### **Phase 2: Demo Tab**
- Video demonstration of concept in action
- Instructor shows how to implement
- Student watches, takes notes
- Video controls: play, pause, seek, speed, fullscreen
- Transcript panel (optional)
- Downloadable resources (code samples, slides)

### **Phase 3: Verify Tab**
- **Quiz gate** - must pass to unlock Build phase
- Multiple choice questions (4 options each)
- Immediate feedback on wrong answers
- Explanations for correct answers
- Must score 80%+ to proceed
- Unlimited attempts but tracks tries
- "Passing this quiz proves comprehension before hands-on work"

### **Phase 4: Build Tab**
- **Hands-on lab environment**
- Left panel: User story & acceptance criteria
- Right panel: Lab workspace (simulated IDE or checklist)
- Student implements what they learned
- Submits for AI mentor review
- Cannot proceed to next lesson until Build is approved

---

## 🧭 Complete Student User Flow

### **Flow 1: Discovery → Enrollment**

```
1. Land on /academy (public marketing page)
   ↓
2. Read program details, watch demo video
   ↓
3. Click "Apply for Cohort"
   ↓
4. Fill application form:
   - Full name
   - Email
   - Phone
   - Current experience level (dropdown)
   - Why interested? (textarea)
   - Preferred start date (date picker)
   ↓
5. Submit application
   ↓
6. See confirmation modal:
   "Application received! Check your email for next steps."
   ↓
7. **[CURRENTLY MISSING]** Receive email with:
   - Payment link ($0 down, ISA agreement)
   - Cohort start date
   - Pre-work checklist
   ↓
8. **[CURRENTLY MISSING]** Complete payment/ISA signature
   ↓
9. **[CURRENTLY MISSING]** Account creation page:
   - Set password
   - Upload photo
   - Complete profile
   ↓
10. **[CURRENTLY MISSING]** Redirect to student dashboard
```

**Current Status:**
- ✅ Steps 1-6 exist
- ❌ Steps 7-10 completely missing

---

### **Flow 2: Student Dashboard → Learning**

```
1. Login to student portal
   ↓
2. Land on /dashboard
   - See current progress (% complete)
   - Current focus: Next lesson to complete
   - Stats: XP earned, badges, streak
   - Cohort activity feed (classmates' progress)
   - Curriculum horizon (upcoming modules)
   ↓
3. Click "Continue Learning" or specific module
   ↓
4. Navigate to /modules (timeline view)
   - See all 10 modules in sequence
   - Locked modules are grayed out
   - Current module is highlighted
   - Completed modules show checkmark
   ↓
5. Click on a module (if unlocked)
   ↓
6. See module overview:
   - Module description
   - Learning objectives
   - Estimated time
   - Lessons list (5-8 lessons per module)
   ↓
7. Click on first incomplete lesson
   ↓
8. Navigate to /lesson/:id
   - 4 tabs: Theory, Demo, Verify, Build
   - Right sidebar: AI Mentor chat
   ↓
9. Complete Theory tab (read all slides)
   ↓
10. Complete Demo tab (watch video)
    ↓
11. Complete Verify tab (pass quiz)
    ↓
12. Complete Build tab (submit lab)
    ↓
13. AI Mentor reviews submission
    ↓
14. If approved → Lesson marked complete
    If needs revision → Get feedback, resubmit
    ↓
15. Return to modules list
    ↓
16. Next lesson unlocks automatically
    ↓
17. Repeat until module complete
    ↓
18. Module complete → Next module unlocks
    ↓
19. After Module 10 complete → Capstone project unlocks
    ↓
20. Complete capstone → Graduate
    ↓
21. Navigate to /persona (resume builder)
    - Auto-generated "Senior Developer" resume
    - Based on all projects completed
    - Download as PDF
    ↓
22. Navigate to /blueprint (portfolio)
    - Every lab submission is cataloged
    - Code snippets, screenshots, descriptions
    - Shareable portfolio link
    ↓
23. **[CURRENTLY MISSING]** Graduation ceremony
    - Certificate generation
    - LinkedIn badge
    - Cohort completion celebration
    ↓
24. **[CURRENTLY MISSING]** Job placement flow
    - InTime offers employment contract
    - Student accepts
    - Onboarded as employee
```

**Current Status:**
- ✅ Steps 2-22 exist and work
- ❌ Steps 1, 23-24 missing
- 🟡 Step 13 (AI Mentor review) is placeholder

---

### **Flow 3: HR Admin → Course Assignment**

```
1. HR Manager logs into /hr/learning
   ↓
2. See course catalog (5 courses)
   - Guidewire PolicyCenter Fundamentals
   - Guidewire ClaimCenter Essentials
   - InsuranceSuite Advanced Configuration
   - Integration Architecture
   - Data Migration Best Practices
   ↓
3. Click "Assign to Employee" button
   ↓
4. **[CURRENTLY BROKEN]** Should open modal:
   - Employee search/select (multi-select)
   - Set enrollment date
   - Add optional message
   - Confirm assignment
   ↓
5. **[MISSING]** Modal confirmation:
   "Course assigned to 3 employees. They will receive email notification."
   ↓
6. **[MISSING]** Employees receive email:
   - Course details
   - Start date
   - Link to begin
   ↓
7. **[MISSING]** Track employee progress:
   - Dashboard showing all assigned courses
   - Per-employee completion status
   - Time spent, quiz scores
   - Flag struggling learners
```

**Current Status:**
- ✅ Step 1-2 exist
- 🔴 Step 3: Button exists but does NOTHING (critical bug)
- ❌ Steps 4-7 completely missing

---

## 📱 Screen-by-Screen Specifications

### **Screen 1: Public Landing (/academy)**

**Purpose:** Marketing page to attract applicants

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Logo]    InTime Academy    [Menu]     │
├─────────────────────────────────────────┤
│                                         │
│  Transform Your Career in 8 Weeks       │
│  From Graduate → Senior Consultant      │
│                                         │
│  [Apply for Cohort]  [Watch Demo]      │
│                                         │
├─────────────────────────────────────────┤
│  How It Works:                          │
│  Week 1-2: Fundamentals                 │
│  Week 3-5: Hands-on Projects            │
│  Week 6-8: Capstone + Portfolio         │
│                                         │
├─────────────────────────────────────────┤
│  Success Stories                         │
│  [Student testimonial cards x 3]        │
│                                         │
├─────────────────────────────────────────┤
│  Curriculum                              │
│  [10 modules with descriptions]         │
│                                         │
├─────────────────────────────────────────┤
│  FAQ                                     │
│  [Accordion with common questions]      │
│                                         │
└─────────────────────────────────────────┘
```

**Buttons:**
- "Apply for Cohort" → Opens application modal
- "Watch Demo" → Opens video modal
- FAQ items → Expand/collapse accordion

**Current Status:**
- ✅ Layout exists
- ✅ Apply modal exists (form present)
- 🟡 Apply form submission → Currently just shows `alert()`, needs proper handling
- 🟡 Demo modal → Currently shows placeholder, needs real video
- ✅ FAQ accordion works

**What Needs to Be Built:**

1. **Application Form Modal Enhancement**
   - Form fields (already exist):
     - Full Name (text input)
     - Email (email input with validation)
     - Phone (tel input with formatting)
     - Experience Level (dropdown: None, Some, Intermediate)
     - Why Interested? (textarea, 200 char min)
     - Preferred Start Date (date picker, min: today + 2 weeks)
   - Add validation messages below each field
   - Submit button states:
     - Default: "Submit Application"
     - Loading: "Submitting..." (disabled)
     - Success: Checkmark + "Submitted!"
   - On submit:
     - Replace current `alert()` with proper modal
     - Show success message:
       ```
       ✅ Application Received!

       Thank you for applying to InTime Academy.

       Next Steps:
       - Check your email (within 24 hours)
       - We'll send payment/ISA details
       - Cohort starts: [selected date]

       Questions? Email: academy@intime.com

       [Close]
       ```
     - Close button → Return to landing page
     - Clear form for next use

2. **Demo Video Modal**
   - Currently shows black rectangle with play icon
   - Replace with actual video player
   - Video embed (YouTube or Vimeo):
     - URL: `https://www.youtube.com/embed/[VIDEO_ID]`
     - 16:9 aspect ratio
     - Autoplay on modal open
     - Controls: play, pause, volume, fullscreen
   - Modal controls:
     - X button to close
     - Click outside to close
     - Escape key to close

---

### **Screen 2: Student Dashboard (/dashboard)**

**Purpose:** Student home base - see progress, next steps, cohort activity

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  👤 Welcome, [Student Name]                     │
│  [Navbar: Dashboard | Modules | Interview |    │
│           Persona | Blueprint]                  │
├─────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Current Focus   │  │  Your Stats      │   │
│  │                  │  │                  │   │
│  │  Module 3        │  │  Progress: 45%   │   │
│  │  Lesson 2.3      │  │  XP: 2,450       │   │
│  │  "Data Models"   │  │  Badges: 7       │   │
│  │                  │  │  Streak: 12 days │   │
│  │  [Continue]      │  │                  │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Curriculum Horizon                       │ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │ │
│  │  │ M1 │→│ M2 │→│ M3 │→│ M4 │→│ M5 │     │ │
│  │  │100%│ │100%│ │45% │ │ 🔒 │ │ 🔒 │     │ │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘     │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Cohort Activity Feed                     │ │
│  │  • Alex completed "API Integration"       │ │
│  │  • Priya earned "Code Quality" badge      │ │
│  │  • Jordan started Module 4                │ │
│  │  • 3 classmates online now                │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Interactive Elements:**

1. **Current Focus Card**
   - Shows next incomplete lesson
   - "Continue" button → Navigate to `/lesson/[id]`
   - If all lessons complete → Show "Start Capstone"

2. **Stats Card**
   - Progress bar (animated fill)
   - XP counter (odometer animation on change)
   - Badge icons (click to see badge details modal)
   - Streak counter (fire emoji + number)

3. **Curriculum Horizon**
   - Horizontal scrollable timeline
   - Completed modules: Green checkmark, 100%
   - Current module: Orange, % progress
   - Locked modules: Gray, lock icon
   - Click module → Navigate to `/modules#module-[id]`

4. **Cohort Activity Feed**
   - Real-time updates (simulated with polling)
   - Shows last 10 activities
   - Click activity → Navigate to relevant page
   - "X classmates online" → Hover shows names

**Current Status:**
- ✅ All layout exists
- ✅ Static data displays correctly
- 🟡 "Continue" button works but needs dynamic lesson routing
- 🟡 Activity feed is hardcoded (needs dynamic data)
- 🟡 Stats are hardcoded (needs dynamic calculation)

**What Needs to Be Built:**

1. **Dynamic Current Focus**
   - Calculate next incomplete lesson from student progress
   - If all lessons done in current module → Show next module
   - If all modules done → Show "Start Capstone Project"
   - Button behavior:
     - Active: Green, cursor pointer
     - Loading: Spinner + "Loading..."
     - Disabled: Gray, cursor not-allowed

2. **Stats Calculations**
   - Progress: `(completed_lessons / total_lessons) * 100`
   - XP: Sum of all lesson XP + quiz bonuses + badges
   - Badges: Count of earned badges
   - Streak: Consecutive days with at least 1 lesson completion

3. **Activity Feed Logic**
   - Poll every 30 seconds for new activities
   - Show max 10 most recent
   - Types of activities:
     - Lesson completion
     - Badge earned
     - Module started
     - Quiz perfect score
     - Capstone submission
   - Avatar + Name + Action + Timestamp (relative, e.g., "2m ago")

4. **Join Sprint Button** (if shown)
   - Only visible if student not in active sprint
   - Click → Show modal:
     ```
     Join Next Sprint?

     Start Date: Monday, Dec 4, 2025
     Duration: 2 weeks
     Cohort Size: 12 students

     Commitment: 20 hours/week minimum

     [Cancel] [Join Sprint]
     ```
   - On confirm → Enroll student in sprint
   - Update dashboard to show sprint progress

---

### **Screen 3: Modules List (/modules)**

**Purpose:** See all modules in curriculum, track progress, select lessons

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [Navbar]                                   │
├─────────────────────────────────────────────┤
│  Training Curriculum                         │
│  Your Progress: 45%  [Progress Bar]        │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────────────────────────────┐│
│  │ ✅ Module 1: InsuranceSuite Intro     ││
│  │ 100% Complete                          ││
│  │                                        ││
│  │ Lessons:                               ││
│  │ ✅ 1.1 What is Insurance? (Completed) ││
│  │ ✅ 1.2 Guidewire Overview (Completed) ││
│  │ ✅ 1.3 PolicyCenter Basics (Completed)││
│  │                                        ││
│  │ [Review Module]                        ││
│  └────────────────────────────────────────┘│
│                                             │
│  ┌────────────────────────────────────────┐│
│  │ 🔶 Module 2: Data Models              ││
│  │ 60% Complete (3 of 5 lessons)         ││
│  │                                        ││
│  │ Lessons:                               ││
│  │ ✅ 2.1 Entities & Relationships       ││
│  │ ✅ 2.2 Database Schema                ││
│  │ ✅ 2.3 Data Modeling Exercise         ││
│  │ 📖 2.4 Advanced Queries (In Progress) ││
│  │ 🔒 2.5 Performance Optimization       ││
│  │                                        ││
│  │ [Continue Learning]                    ││
│  └────────────────────────────────────────┘│
│                                             │
│  ┌────────────────────────────────────────┐│
│  │ 🔒 Module 3: API Development          ││
│  │ Locked - Complete Module 2 to unlock  ││
│  │                                        ││
│  │ What You'll Learn:                     ││
│  │ • REST API design principles           ││
│  │ • Guidewire integration patterns       ││
│  │ • Authentication & security            ││
│  └────────────────────────────────────────┘│
│                                             │
│  [Modules 4-10 continue in same pattern...]│
│                                             │
└─────────────────────────────────────────────┘
```

**Module States:**

1. **Completed Module** (✅ Green)
   - All lessons show checkmarks
   - "Review Module" button (re-visit lessons)
   - Badge earned displayed (if applicable)

2. **In-Progress Module** (🔶 Orange)
   - Shows % complete
   - Completed lessons: ✅
   - Current lesson: 📖 (book icon + "In Progress")
   - Locked lessons: 🔒 (grayed out)
   - "Continue Learning" button → Goes to first incomplete lesson

3. **Locked Module** (🔒 Gray)
   - Can't click lessons
   - Shows preview: "What You'll Learn" list
   - Lock reason: "Complete Module X to unlock"

**Interactive Elements:**

1. **Lesson Click Behavior**
   - Completed lesson: Click → Navigate to lesson (can review)
   - In-progress lesson: Click → Navigate to lesson
   - Locked lesson: Click → Show tooltip: "Complete previous lessons first"

2. **Module Accordion**
   - Click module header → Expand/collapse lesson list
   - Default: Current module expanded, others collapsed
   - Smooth animation (200ms)

3. **Progress Bar**
   - Top of page: Overall curriculum progress
   - Animated fill (CSS transition)
   - Color gradient: Red (0%) → Yellow (50%) → Green (100%)

**Current Status:**
- ✅ Layout exists
- ✅ Module accordion works
- ✅ Lesson navigation works
- 🟡 Progress calculations are hardcoded
- 🟡 Lock logic is hardcoded (works but static)

**What Needs to Be Built:**

1. **Dynamic Progress Calculation**
   ```typescript
   // Per module
   const moduleProgress = (completedLessons / totalLessons) * 100;

   // Overall
   const overallProgress = (completedLessons / totalLessonsInCurriculum) * 100;
   ```

2. **Lock Logic**
   - Module unlocks when previous module 100% complete
   - Lesson unlocks when:
     - Previous lesson in same module is complete, OR
     - It's the first lesson in module, AND module is unlocked

3. **Lesson Status Icons**
   - ✅ Completed: `lesson.status === 'completed'`
   - 📖 In Progress: `lesson.status === 'in_progress'`
   - 🔒 Locked: `lesson.status === 'locked'`

4. **Search/Filter** (if needed)
   - Search box at top: Filter modules/lessons by keyword
   - Filter by status: All | Completed | In Progress | Locked

---

### **Screen 4: Lesson View (/lesson/:id)**

**Purpose:** The core learning interface - 4-tab protocol

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  [Navbar]   Lesson 2.3: Data Modeling Exercise          │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │ [Theory] [Demo] [Verify] │  │  Senior Context      │ │
│  │ [Build]                  │  │                      │ │
│  │──────────────────────────│  │  💡 In real projects │ │
│  │                          │  │  data modeling is    │ │
│  │  THEORY TAB CONTENT:     │  │  critical because... │ │
│  │                          │  │                      │ │
│  │  [Slide content here]    │  │  Common pitfalls:    │ │
│  │                          │  │  • Over-normalization│ │
│  │  Slide 3 of 8            │  │  • Missing indexes   │ │
│  │                          │  │                      │ │
│  │  [◀ Previous] [Next ▶]   │  │  Impact: Bad models  │ │
│  │                          │  │  = slow queries =    │ │
│  └──────────────────────────┘  │  angry users         │ │
│                                 └──────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  🤖 AI Mentor (minimized)                          │ │
│  │  Click to ask questions...                         │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Tab 1: Theory**

Content Structure:
- Main content area (left 70%)
- Senior Context sidebar (right 30%)
- Slide navigation (bottom)

Slide Format:
```
┌─────────────────────────────┐
│  Slide Title                │
│                             │
│  • Key point 1              │
│  • Key point 2              │
│  • Key point 3              │
│                             │
│  [Diagram or code example]  │
│                             │
│  Slide 3 of 8               │
│  [◀ Previous] [Next ▶]      │
└─────────────────────────────┘
```

Behavior:
- Previous button: Disabled on slide 1
- Next button: Advances to next slide
- Last slide: Next button says "Complete Theory →"
- Click "Complete Theory" → Mark theory tab done, auto-switch to Demo tab
- Can revisit any slide anytime (not linear lockdown)

**Tab 2: Demo**

Content Structure:
```
┌────────────────────────────────────────┐
│  Watch: Data Modeling in Action        │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │        [Video Player]            │ │
│  │                                  │ │
│  │  ▶ Play   🔊 Volume   ⚙ Settings│ │
│  └──────────────────────────────────┘ │
│                                        │
│  Duration: 12:34                       │
│  Your Progress: 8:45 (70%)             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  📄 Transcript (optional)        │ │
│  │  [Expandable transcript panel]   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  📦 Downloads                    │ │
│  │  • Slide deck (PDF)              │ │
│  │  • Code samples (ZIP)            │ │
│  │  • Cheat sheet (PDF)             │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Mark Demo Complete]                  │
└────────────────────────────────────────┘
```

Behavior:
- Video must be watched at least 80% to unlock "Mark Complete"
- Progress tracked by video player time
- Can skip around, but total watch time must be 80%+
- Transcript is optional (for accessibility)
- Downloads available immediately
- "Mark Demo Complete" → Auto-switch to Verify tab

**Current Status:**
- 🟡 Video player shows placeholder (black rectangle)
- ❌ No actual video loaded
- ❌ Progress tracking not implemented
- ❌ Downloads not implemented

**What Needs to Be Built:**

1. **Video Player Integration**
   - Use `<video>` tag or embed (YouTube/Vimeo)
   - Track watch time:
     ```typescript
     const handleVideoProgress = (currentTime: number, duration: number) => {
       const percentWatched = (currentTime / duration) * 100;
       if (percentWatched >= 80) {
         setCanMarkComplete(true);
       }
     };
     ```
   - Save progress on video pause/end
   - Resume from last position on return

2. **Completion Button State**
   - Disabled: Gray, "Watch 80% to continue"
   - Enabled: Green, "Mark Demo Complete"
   - Clicked: Show checkmark, switch to Verify tab

3. **Downloads**
   - Static files in `/public/lessons/[lesson-id]/`
   - Click → Download file
   - Track downloads (analytics)

**Tab 3: Verify (Quiz)**

Content Structure:
```
┌─────────────────────────────────────────┐
│  Knowledge Check                         │
│  Pass this quiz (80%+) to unlock labs   │
│                                         │
│  Question 1 of 5:                       │
│                                         │
│  What is the primary key constraint?    │
│                                         │
│  ○ Allows duplicate values              │
│  ○ Must be unique for each row          │
│  ○ Can contain NULL values              │
│  ○ Is optional in tables                │
│                                         │
│  [Submit Answer]                         │
│                                         │
│  Score: 2/5 (40%) - Keep trying!        │
└─────────────────────────────────────────┘
```

Quiz Logic:
1. Show one question at a time
2. Student selects answer
3. Click "Submit Answer"
4. Immediate feedback:
   - ✅ Correct: Green highlight, "Correct! [explanation]"
   - ❌ Wrong: Red highlight, "Incorrect. [explanation + correct answer]"
5. Click "Next Question"
6. After all questions → Show score
7. If score < 80% → "Retry Quiz" button (reset, different question order)
8. If score >= 80% → "Quiz Passed! ✅" → Auto-unlock Build tab

**Question Types:**
- Multiple choice (4 options)
- True/False
- Fill in the blank (rare)

**Current Status:**
- ✅ Quiz UI exists
- ✅ Question display works
- ✅ Answer selection works
- 🟡 Scoring is simulated (not saved)
- 🟡 Question pool is hardcoded

**What Needs to Be Built:**

1. **Quiz State Management**
   ```typescript
   const [currentQuestion, setCurrentQuestion] = useState(0);
   const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
   const [score, setScore] = useState(0);
   const [quizAttempts, setQuizAttempts] = useState(0);
   const [showFeedback, setShowFeedback] = useState(false);
   ```

2. **Answer Validation**
   ```typescript
   const handleSubmit = () => {
     const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
     if (isCorrect) {
       setScore(score + 1);
       showSuccessFeedback(questions[currentQuestion].explanation);
     } else {
       showErrorFeedback(
         questions[currentQuestion].explanation,
         questions[currentQuestion].correctAnswerText
       );
     }
     setShowFeedback(true);
   };
   ```

3. **Pass/Fail Logic**
   ```typescript
   const handleQuizComplete = () => {
     const percentScore = (score / questions.length) * 100;
     if (percentScore >= 80) {
       markQuizPassed();
       unlockBuildTab();
       showSuccessModal("Quiz passed! Ready for hands-on lab.");
     } else {
       setQuizAttempts(quizAttempts + 1);
       showRetryModal(`Score: ${percentScore}%. Try again!`);
     }
   };
   ```

4. **Question Pool Randomization**
   - Each quiz has 10-15 questions in pool
   - Quiz shows random 5
   - Shuffle question order
   - Shuffle answer options (except "All of the above")

**Tab 4: Build (Lab)**

Content Structure:
```
┌──────────────────────────────────────────────────────┐
│  Hands-On Lab: Build a Data Model                   │
├──────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌────────────────────────────┐│
│  │ User Story      │  │  Lab Workspace             ││
│  │                 │  │                            ││
│  │ As a developer  │  │  [ ] Step 1: Create table  ││
│  │ I need to...    │  │  [ ] Step 2: Add columns   ││
│  │                 │  │  [ ] Step 3: Set PK/FK     ││
│  │ Acceptance:     │  │  [ ] Step 4: Add indexes   ││
│  │ ✓ Table exists  │  │  [ ] Step 5: Test queries  ││
│  │ ✓ Has 5 columns │  │                            ││
│  │ ✓ PK is set     │  │  [Upload SQL File]         ││
│  │ ✓ FK to users   │  │  or                        ││
│  │                 │  │  [Paste Code Here]         ││
│  │ Time: 30 min    │  │                            ││
│  │                 │  │  ┌──────────────────────┐  ││
│  │ Resources:      │  │  │                      │  ││
│  │ • Schema guide  │  │  │  [Code editor area]  │  ││
│  │ • Example code  │  │  │                      │  ││
│  └─────────────────┘  │  └──────────────────────┘  ││
│                       │                            ││
│                       │  [Submit for Review]       ││
│                       └────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

Lab Workflow:
1. Student reads user story
2. Follows checklist steps
3. Writes code in workspace OR uploads file
4. Clicks "Submit for Review"
5. AI Mentor evaluates submission
6. One of three outcomes:
   - ✅ Approved: "Great work! Lesson complete."
   - 🟡 Needs revision: "Almost there! Fix: [specific feedback]"
   - ❌ Start over: "This doesn't meet requirements. Review theory."

**Current Status:**
- ✅ Layout exists
- ✅ User story displays
- ✅ Checklist displays
- 🟡 Code editor is textarea (not full IDE)
- ❌ File upload not implemented
- 🟡 Submit button exists but AI review is placeholder

**What Needs to Be Built:**

1. **Code Editor Enhancement**
   - Use Monaco Editor (VS Code editor in browser)
   - Syntax highlighting for SQL/JavaScript/etc
   - Line numbers
   - Auto-completion
   - Error underlining

2. **File Upload**
   ```typescript
   const handleFileUpload = (file: File) => {
     const reader = new FileReader();
     reader.onload = (e) => {
       const content = e.target?.result as string;
       setCodeContent(content);
     };
     reader.readAsText(file);
   };
   ```

3. **Submission Flow**
   ```typescript
   const handleSubmit = async () => {
     setIsSubmitting(true);

     const submission = {
       lessonId,
       studentId,
       code: codeContent,
       timestamp: new Date(),
     };

     // Call AI mentor (placeholder for now)
     const result = await evaluateSubmission(submission);

     if (result.approved) {
       showSuccessModal("Lab complete! Moving to next lesson.");
       markLessonComplete();
     } else {
       showFeedbackModal(result.feedback);
     }

     setIsSubmitting(false);
   };
   ```

4. **Checklist Interactivity**
   - Student can check off steps as they complete
   - Visual progress: "3 of 5 steps complete"
   - Not enforced, just helpful tracking

---

### **Screen 5: AI Mentor Chat (Sidebar)**

**Purpose:** Socratic guide - helps without giving answers

**Layout:**
```
┌─────────────────────────────┐
│  🤖 AI Mentor               │
│  [Minimize] [Settings]      │
├─────────────────────────────┤
│  💬 Chat History:           │
│                             │
│  🤖: Hi! Stuck on something?│
│      What are you trying to │
│      accomplish?            │
│                             │
│  👤: How do I set primary   │
│      key in SQL?            │
│                             │
│  🤖: Good question! Before  │
│      I answer, do you know  │
│      what a primary key is? │
│                             │
│  👤: It identifies each row │
│                             │
│  🤖: Exactly! So knowing that│
│      what SQL keyword might │
│      you use to define it?  │
│                             │
│  [Scroll to see more...]    │
├─────────────────────────────┤
│  Type your question...      │
│  [Text Input]        [Send] │
└─────────────────────────────┘
```

**Mentor Behavior (Socratic Method):**

❌ **NEVER DO:**
- Give direct answers
- Write code for student
- Say "Here's the solution"

✅ **ALWAYS DO:**
- Ask guiding questions
- Reference lesson materials
- Break down problem into smaller steps
- Encourage experimentation

**Example Conversations:**

**Bad (Giving Answer):**
```
Student: How do I create a table?
Mentor: Use CREATE TABLE tablename (columns)
```

**Good (Socratic):**
```
Student: How do I create a table?
Mentor: Great question! Let's think about this step by step.

        First, have you reviewed the Theory tab on table creation?

Student: Yes
Mentor: Excellent. So you know tables have columns, right?
        What SQL command do you think *creates* something new?

Student: CREATE?
Mentor: You're on the right track! Now, what comes after CREATE
        when you want to make a table specifically?
```

**Escalation to Human:**

If student is stuck after 5+ back-and-forth messages:
```
Mentor: I can see you're working hard on this!
        Would you like me to connect you with a human instructor?

        [Stay with AI] [Get Human Help]
```

**Current Status:**
- ✅ Chat UI exists
- ✅ Text input works
- ✅ Send button works
- ❌ AI responses are placeholder (just echoes back)
- ❌ No Socratic logic implemented
- ❌ No escalation flow

**What Needs to Be Built:**

1. **Chat State Management**
   ```typescript
   const [messages, setMessages] = useState<Message[]>([]);
   const [input, setInput] = useState('');
   const [isTyping, setIsTyping] = useState(false);

   interface Message {
     id: string;
     role: 'user' | 'assistant';
     content: string;
     timestamp: Date;
   }
   ```

2. **Send Message Handler**
   ```typescript
   const handleSend = async () => {
     if (!input.trim()) return;

     // Add user message
     const userMessage: Message = {
       id: generateId(),
       role: 'user',
       content: input,
       timestamp: new Date(),
     };
     setMessages([...messages, userMessage]);
     setInput('');
     setIsTyping(true);

     // Get AI response (placeholder)
     const response = await getAIMentorResponse(input, messages, currentLesson);

     const assistantMessage: Message = {
       id: generateId(),
       role: 'assistant',
       content: response,
       timestamp: new Date(),
     };
     setMessages([...messages, userMessage, assistantMessage]);
     setIsTyping(false);
   };
   ```

3. **Placeholder AI Logic** (until backend ready)
   ```typescript
   const getAIMentorResponse = async (
     userInput: string,
     history: Message[],
     lesson: Lesson
   ): Promise<string> => {
     // Simple keyword matching for demo
     if (userInput.toLowerCase().includes('primary key')) {
       return "Good question about primary keys! Before I help, let me ask: Why do you think we need primary keys in database tables?";
     }

     if (userInput.toLowerCase().includes('help')) {
       return "I'm here to guide you! What specific part of the lesson is challenging? The theory, the demo, or the lab exercise?";
     }

     // Default response
     return "Interesting question! Can you tell me more about what you've tried so far?";
   };
   ```

4. **Minimize/Maximize**
   - Minimize button → Collapse to small chat bubble
   - Chat bubble shows "💬 Ask AI Mentor"
   - Click bubble → Expand to full chat
   - Persists across tab switches (stays minimized/maximized)

---

### **Screen 6: Persona Builder (/persona)**

**Purpose:** Auto-generate "Senior Developer" resume from completed projects

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Your Professional Identity                      │
│  [Preview] [Edit] [Download]                    │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐ │
│  │  SENIOR DEVELOPER                         │ │
│  │  Guidewire Specialist                     │ │
│  │  ────────────────────────────────────     │ │
│  │                                           │ │
│  │  PROFESSIONAL SUMMARY                     │ │
│  │  Experienced Guidewire developer with     │ │
│  │  proven track record in PolicyCenter     │ │
│  │  and ClaimCenter implementations.         │ │
│  │  Delivered 8 enterprise projects...       │ │
│  │                                           │ │
│  │  TECHNICAL SKILLS                         │ │
│  │  • Guidewire PolicyCenter 10.x            │ │
│  │  • ClaimCenter, BillingCenter             │ │
│  │  • Gosu, Java, SQL                        │ │
│  │  • REST APIs, SOAP, Integration Hub       │ │
│  │  • Agile/Scrum methodologies              │ │
│  │                                           │ │
│  │  PROFESSIONAL EXPERIENCE                  │ │
│  │                                           │ │
│  │  Senior Guidewire Developer               │ │
│  │  [Auto-generated from projects]           │ │
│  │  Jan 2024 - Present                       │ │
│  │  • Implemented policy rating engine       │ │
│  │  • Built claim submission workflow        │ │
│  │  • Integrated with legacy systems         │ │
│  │  [Each bullet = a completed lab project]  │ │
│  │                                           │ │
│  │  PROJECTS                                 │ │
│  │  [List of 8 capstone + major labs]       │ │
│  │                                           │ │
│  │  CERTIFICATIONS                           │ │
│  │  • InTime Academy Graduate 2025           │ │
│  │  • Guidewire Certified Developer          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [Download PDF] [Copy LinkedIn Version]        │
│  [Share Link]                                   │
└─────────────────────────────────────────────────┘
```

**How It Works:**

1. **Data Source:**
   - Student's completed labs
   - Capstone project
   - Quiz scores (shows mastery)
   - Badges earned
   - Cohort ranking

2. **Auto-Generation Logic:**
   ```
   SUMMARY = Template based on:
     - Cohort completion % (faster = "fast learner")
     - Quiz average (high = "detail-oriented")
     - Badge count (shows initiative)

   EXPERIENCE = Each completed lab becomes a bullet:
     Lab: "Build rating engine"
     Becomes: "• Implemented multi-factor policy rating engine with 15+ rating variables"

   PROJECTS = Capstone project details:
     - Project name
     - Tech stack used
     - Problem solved
     - Quantifiable outcomes

   SKILLS = Extracted from lessons:
     Lesson tags → Skill list
     (PolicyCenter lessons → "PolicyCenter 10.x")
   ```

3. **Edit Mode:**
   - Click "Edit" → All sections become editable
   - Can customize any section
   - "Reset to Auto-Generated" button
   - Changes save automatically

4. **Download Options:**
   - PDF: Full resume, formatted for printing
   - LinkedIn Version: Optimized for LinkedIn profile
   - Plain Text: For copy/paste into job apps

**Current Status:**
- ✅ Layout exists
- ✅ Preview displays
- 🟡 Content is hardcoded (not auto-generated)
- ❌ Edit mode not implemented
- ❌ Download not implemented

**What Needs to Be Built:**

1. **Auto-Generation Engine**
   ```typescript
   const generatePersona = (student: Student): Resume => {
     const completedLabs = student.progress.filter(p => p.labComplete);

     const experience = completedLabs.map(lab => ({
       action: lab.actionVerb, // "Implemented", "Built", "Designed"
       description: lab.projectDescription,
       technologies: lab.techStack,
     }));

     const skills = extractSkills(student.completedLessons);

     const summary = generateSummary({
       completionRate: student.progressPercentage,
       avgQuizScore: student.avgQuizScore,
       badgeCount: student.badges.length,
     });

     return {
       summary,
       skills,
       experience,
       projects: [student.capstoneProject],
       certifications: ['InTime Academy Graduate 2025'],
     };
   };
   ```

2. **Edit Mode**
   ```typescript
   const [isEditing, setIsEditing] = useState(false);
   const [resume, setResume] = useState<Resume>(initialResume);

   const handleEdit = () => {
     setIsEditing(true);
   };

   const handleSave = () => {
     saveResume(resume);
     setIsEditing(false);
   };
   ```

3. **PDF Generation**
   - Use `react-pdf` or `jsPDF`
   - Professional template
   - 1-page format (ideal)
   ```typescript
   const handleDownloadPDF = async () => {
     const pdf = await generatePDF(resume);
     pdf.save(`${student.name}-resume.pdf`);
   };
   ```

4. **LinkedIn Version**
   - Different format (sections for LI)
   - Optimized character counts
   - Copy to clipboard button
   ```typescript
   const handleCopyLinkedIn = () => {
     const linkedInText = formatForLinkedIn(resume);
     navigator.clipboard.writeText(linkedInText);
     showToast("Copied to clipboard!");
   };
   ```

---

### **Screen 7: Blueprint/Portfolio (/blueprint)**

**Purpose:** Technical implementation log - every lab cataloged

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Technical Blueprint                             │
│  Your Implementation Portfolio                   │
├─────────────────────────────────────────────────┤
│  Filter: [All] [By Module] [By Tech]  🔍 Search │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  📦 Lab 2.3: Data Modeling Exercise      │ │
│  │  Module 2 • Completed Nov 15, 2025       │ │
│  │  ───────────────────────────────────────  │ │
│  │                                           │ │
│  │  🎯 Objective:                           │ │
│  │  Design and implement relational database │ │
│  │  schema for insurance policy system       │ │
│  │                                           │ │
│  │  🛠️ Technologies:                        │ │
│  │  PostgreSQL, SQL, Database Design         │ │
│  │                                           │ │
│  │  📝 Implementation:                       │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │ CREATE TABLE policies (             │ │ │
│  │  │   id SERIAL PRIMARY KEY,            │ │ │
│  │  │   policy_number VARCHAR(20) UNIQUE, │ │ │
│  │  │   customer_id INT REFERENCES...     │ │ │
│  │  │ );                                  │ │ │
│  │  │ [View Full Code]                    │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  │  ✅ Acceptance Criteria Met:             │ │
│  │  • 5 normalized tables created            │ │
│  │  • Primary/Foreign keys defined           │ │
│  │  • Indexes on frequently queried columns  │ │
│  │                                           │ │
│  │  📊 Metrics:                             │ │
│  │  • Completion Time: 28 minutes            │ │
│  │  • Quiz Score: 95%                        │ │
│  │  • Revision Count: 1                      │ │
│  │                                           │ │
│  │  [View Details] [Download Code]          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [Next lab entry...]                            │
│  [Next lab entry...]                            │
│                                                 │
│  ─────────────────────────────────────────────  │
│  Total Implementations: 24                      │
│  Lines of Code: 3,847                           │
│  Technologies Used: 8                           │
│                                                 │
│  [Export Portfolio] [Share Link] [Download All]│
└─────────────────────────────────────────────────┘
```

**What's Included:**

Each lab entry shows:
- Lab title and module
- Completion date
- Objective (what you built)
- Technologies used
- Code snippets (collapsed by default)
- Acceptance criteria checklist
- Performance metrics

**Interactive Elements:**

1. **View Details** → Expand full submission
   - Complete code
   - Screenshots (if applicable)
   - AI mentor feedback
   - Revision history

2. **Download Code** → ZIP file with:
   - Source code
   - README explaining project
   - Screenshots

3. **Filter Options:**
   - By Module: Show only Module 2 labs
   - By Technology: Show only SQL labs
   - Search: Find "API" or "Integration"

4. **Export Portfolio:**
   - PDF with all labs
   - Professional format
   - Shareable with employers

**Current Status:**
- ✅ Layout exists
- ✅ Lab cards display
- 🟡 Content is hardcoded (not from actual submissions)
- ❌ Code snippets are placeholders
- ❌ Filter/search not implemented
- ❌ Export not implemented

**What Needs to Be Built:**

1. **Lab Data Aggregation**
   ```typescript
   const getStudentBlueprint = (studentId: string): BlueprintEntry[] => {
     const submissions = getAllLabSubmissions(studentId);

     return submissions.map(sub => ({
       labId: sub.labId,
       labTitle: sub.lesson.title,
       module: sub.lesson.module,
       completedDate: sub.submittedAt,
       objective: sub.lesson.labObjective,
       technologies: sub.lesson.techStack,
       code: sub.codeSubmission,
       acceptanceCriteria: sub.lesson.criteria,
       criteriaMet: sub.approvedCriteria,
       metrics: {
         completionTime: calculateTime(sub.startedAt, sub.submittedAt),
         quizScore: sub.lesson.quizScore,
         revisionCount: sub.revisionCount,
       },
     }));
   };
   ```

2. **Code Display**
   - Use syntax highlighter (Prism.js or highlight.js)
   - Collapsed by default (first 10 lines)
   - "View Full Code" → Expand
   - Line numbers
   - Copy button

3. **Filter Implementation**
   ```typescript
   const [filter, setFilter] = useState<FilterType>('all');
   const [searchTerm, setSearchTerm] = useState('');

   const filteredBlueprint = blueprint
     .filter(entry => {
       if (filter === 'module') return entry.module === selectedModule;
       if (filter === 'tech') return entry.technologies.includes(selectedTech);
       return true;
     })
     .filter(entry =>
       entry.labTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
       entry.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
     );
   ```

4. **Export to PDF**
   - Generate professional portfolio PDF
   - Include:
     - Cover page with student name
     - Table of contents
     - Each lab as a section
     - Code with syntax highlighting
     - Metrics summary at end

---

### **Screen 8: Interview Dojo (/interview)** (PLACEHOLDER)

**Purpose:** Practice technical interviews with AI

**Current Status:**
- 🟡 Basic UI exists
- ❌ No interview logic
- ❌ Placeholder content only

**What It Should Be:**
```
┌─────────────────────────────────────────┐
│  Interview Practice Dojo                 │
│  Get ready for real Guidewire interviews│
├─────────────────────────────────────────┤
│                                         │
│  Choose Interview Type:                 │
│  • Technical Questions (30 min)         │
│  • System Design (45 min)               │
│  • Behavioral (20 min)                  │
│  • Mock Full Interview (90 min)        │
│                                         │
│  Difficulty: [Junior] [Mid] [Senior]   │
│                                         │
│  [Start Interview]                      │
│                                         │
├─────────────────────────────────────────┤
│  Past Interviews:                       │
│  • Nov 10: Technical - Score: 85%      │
│  • Nov 8: Behavioral - Score: 92%      │
│  [View History]                         │
└─────────────────────────────────────────┘
```

**Not Priority** - Can be built later

---

### **Screen 9: HR Learning Admin (/hr/learning)**

**Purpose:** HR managers assign courses to employees

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Learning & Development                      │
│  Manage employee training programs           │
├─────────────────────────────────────────────┤
│  Search: [🔍 Find courses...]  [+ New Course]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Guidewire PolicyCenter Fundamentals│   │
│  │  8 weeks • 40 lessons • Advanced    │   │
│  │  ─────────────────────────────────   │   │
│  │  Master PolicyCenter configuration  │   │
│  │  and customization. Build real      │   │
│  │  insurance products from scratch.   │   │
│  │                                     │   │
│  │  12 employees enrolled              │   │
│  │  Avg completion: 65%                │   │
│  │                                     │   │
│  │  [View Employees] [Assign to Employee]│ │
│  └─────────────────────────────────────┘   │
│                                             │
│  [4 more course cards...]                   │
└─────────────────────────────────────────────┘
```

**THE CRITICAL BUG:**

Current "Assign to Employee" button does NOTHING when clicked.

**What It Should Do:**

1. Click "Assign to Employee"
2. Open modal:
   ```
   ┌─────────────────────────────────────┐
   │  Assign Course                      │
   │  Guidewire PolicyCenter Fundamentals│
   ├─────────────────────────────────────┤
   │                                     │
   │  Select Employees:                  │
   │  ┌─────────────────────────────┐   │
   │  │ 🔍 Search employees...       │   │
   │  └─────────────────────────────┘   │
   │                                     │
   │  ☐ Alex Johnson (Sales)             │
   │  ☐ Maria Garcia (Support)           │
   │  ☑ John Smith (Engineering)         │
   │  ☑ Sarah Chen (Engineering)         │
   │  ☐ Mike Wilson (Product)            │
   │                                     │
   │  Start Date:                        │
   │  [📅 Dec 1, 2025 ▼]                │
   │                                     │
   │  Optional Message:                  │
   │  ┌─────────────────────────────┐   │
   │  │ Hi team, please complete    │   │
   │  │ this training by year end...│   │
   │  └─────────────────────────────┘   │
   │                                     │
   │  [Cancel] [Assign Course (2)]      │
   └─────────────────────────────────────┘
   ```

3. On "Assign Course":
   - Show loading spinner
   - Create enrollments for selected employees
   - Send email notifications
   - Show success toast: "Course assigned to 2 employees"
   - Close modal
   - Update course card: "14 employees enrolled" (was 12)

**What Needs to Be Built:**

```typescript
// In LearningAdmin.tsx

const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

const handleAssignClick = (course: Course) => {
  setSelectedCourse(course);
  setShowAssignModal(true);
};

const handleConfirmAssignment = async () => {
  if (!selectedCourse || selectedEmployees.length === 0) return;

  setIsAssigning(true);

  try {
    // Create enrollments
    await assignCourseToEmployees({
      courseId: selectedCourse.id,
      employeeIds: selectedEmployees,
      startDate: selectedStartDate,
      message: assignmentMessage,
    });

    // Success
    showToast(`Course assigned to ${selectedEmployees.length} employees`);
    setShowAssignModal(false);
    setSelectedEmployees([]);

    // Refresh course data to show updated enrollment count
    refreshCourses();

  } catch (error) {
    showToast('Failed to assign course. Please try again.', 'error');
  } finally {
    setIsAssigning(false);
  }
};
```

**Modal Component:**

```typescript
<AssignCourseModal
  isOpen={showAssignModal}
  course={selectedCourse}
  onClose={() => setShowAssignModal(false)}
  onConfirm={handleConfirmAssignment}
/>
```

---

## 🔄 Data Flow (Frontend Only - Mock Data)

Since there's NO backend integration, all data is managed in-memory:

### **State Management Architecture**

```typescript
// Option 1: Context API (current)
// Currently using React useState in each component

// Option 2: Zustand (RECOMMENDED)
// Create global store for student data

// stores/academyStore.ts
import { create } from 'zustand';

interface AcademyState {
  student: Student | null;
  modules: Module[];
  currentLesson: Lesson | null;
  progress: Progress[];

  // Actions
  setStudent: (student: Student) => void;
  completeLesson: (lessonId: string) => void;
  updateProgress: (lessonId: string, progress: number) => void;
  markQuizPassed: (lessonId: string, score: number) => void;
  submitLab: (lessonId: string, code: string) => void;
}

export const useAcademyStore = create<AcademyState>((set) => ({
  student: MOCK_STUDENT,
  modules: MOCK_MODULES,
  currentLesson: null,
  progress: MOCK_PROGRESS,

  setStudent: (student) => set({ student }),

  completeLesson: (lessonId) => set((state) => ({
    progress: state.progress.map(p =>
      p.lessonId === lessonId
        ? { ...p, completed: true, completedAt: new Date() }
        : p
    ),
  })),

  updateProgress: (lessonId, progressPercent) => set((state) => ({
    progress: state.progress.map(p =>
      p.lessonId === lessonId
        ? { ...p, progress: progressPercent }
        : p
    ),
  })),

  markQuizPassed: (lessonId, score) => set((state) => ({
    progress: state.progress.map(p =>
      p.lessonId === lessonId
        ? { ...p, quizPassed: true, quizScore: score }
        : p
    ),
  })),

  submitLab: (lessonId, code) => set((state) => ({
    progress: state.progress.map(p =>
      p.lessonId === lessonId
        ? { ...p, labSubmitted: true, labCode: code }
        : p
    ),
  })),
}));
```

### **Using the Store**

```typescript
// In any component
import { useAcademyStore } from '@/stores/academyStore';

const Dashboard = () => {
  const student = useAcademyStore(state => state.student);
  const modules = useAcademyStore(state => state.modules);
  const progress = useAcademyStore(state => state.progress);

  const overallProgress = useMemo(() => {
    const completed = progress.filter(p => p.completed).length;
    return (completed / progress.length) * 100;
  }, [progress]);

  return (
    <div>
      <h1>Welcome, {student?.name}</h1>
      <ProgressBar value={overallProgress} />
    </div>
  );
};
```

### **Mock Data Structure**

```typescript
// constants/mockData.ts

export const MOCK_STUDENT: Student = {
  id: '1',
  name: 'Alex Rodriguez',
  email: 'alex@example.com',
  enrolledDate: new Date('2025-11-01'),
  cohort: 'Fall 2025',
  avatar: '/avatars/default.jpg',
};

export const MOCK_MODULES: Module[] = [
  {
    id: 'mod-1',
    title: 'InsuranceSuite Introduction',
    description: 'Learn the fundamentals...',
    order: 1,
    duration: '2 weeks',
    lessons: [
      {
        id: 'lesson-1-1',
        moduleId: 'mod-1',
        title: 'What is Insurance?',
        order: 1,
        theory: {
          slides: [
            { title: 'Slide 1', content: '...', seniorContext: '...' },
          ],
        },
        demo: {
          videoUrl: 'https://...',
          transcript: '...',
          downloads: ['slides.pdf', 'code.zip'],
        },
        verify: {
          questions: [
            {
              id: 'q1',
              question: 'What is a policy?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 1,
              explanation: '...',
            },
          ],
          passingScore: 80,
        },
        build: {
          userStory: 'As a developer...',
          acceptanceCriteria: ['✓ ...', '✓ ...'],
          checklist: ['Step 1', 'Step 2'],
          estimatedTime: 30,
        },
      },
    ],
  },
];

export const MOCK_PROGRESS: Progress[] = [
  {
    studentId: '1',
    lessonId: 'lesson-1-1',
    completed: true,
    theoryComplete: true,
    demoComplete: true,
    quizPassed: true,
    quizScore: 95,
    labSubmitted: true,
    labApproved: true,
    completedAt: new Date('2025-11-05'),
  },
];
```

---

## 🎯 Missing Features to Build

### **Priority 1: CRITICAL (Must Have for Demo)**

1. ✅ **Fix HR Assign Button** (30 min)
   - Make button actually open modal
   - Implement assignment flow
   - Show success confirmation

2. ✅ **Video Player in Demo Tab** (2 hours)
   - Integrate video embed
   - Track watch progress
   - Enable completion tracking

3. ✅ **Quiz Scoring Logic** (3 hours)
   - Implement answer validation
   - Calculate score
   - Pass/fail logic
   - Retry functionality

4. ✅ **Lab Submission Flow** (4 hours)
   - Code editor improvement
   - Submit button behavior
   - Placeholder AI review
   - Success/revision modals

5. ✅ **Application Form Handling** (2 hours)
   - Replace alert() with modal
   - Form validation
   - Success state

### **Priority 2: IMPORTANT (Completes Core Experience)**

6. ✅ **AI Mentor Chat Backend** (6 hours)
   - Message state management
   - Placeholder responses (keyword-based)
   - Socratic prompts library
   - Minimize/maximize behavior

7. ✅ **Progress Tracking** (4 hours)
   - Calculate lesson completion
   - Calculate module completion
   - Update stats dynamically
   - Unlock next lessons/modules

8. ✅ **Persona Auto-Generation** (5 hours)
   - Extract data from completed labs
   - Generate resume sections
   - Edit mode
   - PDF download

9. ✅ **Blueprint Aggregation** (4 hours)
   - Collect all lab submissions
   - Display with syntax highlighting
   - Filter and search
   - Export functionality

### **Priority 3: NICE TO HAVE (Polish)**

10. ✅ **Cohort Activity Feed** (3 hours)
    - Simulate real-time updates
    - Different activity types
    - Clickable activities

11. ✅ **Module Lock Logic** (2 hours)
    - Dynamic unlock based on progress
    - Visual feedback (grayed out)
    - Tooltips on locked items

12. ✅ **Download Resources** (2 hours)
    - Static files setup
    - Download tracking
    - File organization

13. ✅ **Search/Filter** (3 hours)
    - Module search
    - Blueprint filter
    - Employee search in HR

---

## 📐 Design System Reference

### **Colors**

```css
/* Primary Palette */
--rust-primary: #C84B31;      /* Rust orange - primary CTA */
--charcoal: #2D4059;           /* Dark charcoal - headers */
--ivory: #F5F5F5;              /* Off-white - backgrounds */
--sage: #88A096;               /* Muted sage - accents */

/* Status Colors */
--success: #4CAF50;            /* Green - completed */
--warning: #FF9800;            /* Orange - in progress */
--error: #F44336;              /* Red - failed/locked */
--info: #2196F3;               /* Blue - info */

/* Neutrals */
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;
```

### **Typography**

```css
/* Headers */
font-family: 'Playfair Display', serif;  /* Elegant serif */

h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }

/* Body */
font-family: 'Inter', sans-serif;  /* Clean sans-serif */

body { font-size: 1rem; line-height: 1.6; }
small { font-size: 0.875rem; }
```

### **Components**

**Buttons:**
```css
.btn-primary {
  background: var(--rust-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #A03B25;  /* Darker rust */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200, 75, 49, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--charcoal);
  color: var(--charcoal);
}
```

**Cards:**
```css
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
```

**Progress Bars:**
```css
.progress-bar {
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #F44336 0%, #FF9800 50%, #4CAF50 100%);
  transition: width 0.3s ease;
}
```

### **Spacing**

```css
/* Use 8px grid system */
--space-1: 0.5rem;   /* 8px */
--space-2: 1rem;     /* 16px */
--space-3: 1.5rem;   /* 24px */
--space-4: 2rem;     /* 32px */
--space-6: 3rem;     /* 48px */
--space-8: 4rem;     /* 64px */
```

---

## 🧪 Testing Checklist

Before marking complete, test these flows:

### **Student Flow**
- [ ] Can land on /academy
- [ ] Can submit application (see confirmation)
- [ ] Can navigate to dashboard
- [ ] Dashboard shows correct progress %
- [ ] Can click "Continue" to resume lesson
- [ ] Can browse all modules
- [ ] Locked modules show lock icon
- [ ] Can enter a lesson
- [ ] Theory tab shows all slides
- [ ] Can advance through slides
- [ ] Demo tab shows video
- [ ] Video tracks watch progress
- [ ] Can mark demo complete after 80% watched
- [ ] Quiz tab shows questions
- [ ] Can select answers
- [ ] Gets immediate feedback
- [ ] Quiz calculates score correctly
- [ ] Can retry if score < 80%
- [ ] Build tab unlocks after quiz pass
- [ ] Can write code in lab
- [ ] Can submit lab
- [ ] Gets AI mentor feedback
- [ ] Lesson marks complete on approval
- [ ] Next lesson unlocks
- [ ] Can visit /persona
- [ ] Resume auto-generates from labs
- [ ] Can download PDF
- [ ] Can visit /blueprint
- [ ] All labs are cataloged
- [ ] Can filter labs
- [ ] Can export portfolio

### **HR Flow**
- [ ] Can navigate to /hr/learning
- [ ] Sees course catalog
- [ ] Can click "Assign to Employee"
- [ ] Modal opens
- [ ] Can select employees
- [ ] Can set start date
- [ ] Can add message
- [ ] Can confirm assignment
- [ ] Sees success confirmation
- [ ] Course card updates enrollment count

### **AI Mentor**
- [ ] Chat panel visible
- [ ] Can minimize/maximize
- [ ] Can type message
- [ ] Can send message
- [ ] Gets AI response
- [ ] Response is Socratic (not direct answer)
- [ ] Can have multi-turn conversation

---

## 📦 Deliverables

At the end, the frontend app should have:

1. **All Screens Built** (9 screens functional)
2. **All Buttons Working** (no broken interactions)
3. **User Flows Complete** (can navigate end-to-end)
4. **Mock Data Integrated** (using Zustand store)
5. **No Console Errors** (clean browser console)
6. **Responsive Design** (works on desktop, tablet, mobile)
7. **Accessible** (keyboard navigation, screen reader friendly)

---

## 🚀 Development Timeline

**Estimated Total:** 5-7 days (full-time)

**Day 1:**
- Fix HR assign button (Priority 1.1)
- Implement video player (Priority 1.2)
- Setup Zustand store

**Day 2:**
- Quiz scoring logic (Priority 1.3)
- Lab submission flow (Priority 1.4)
- Application form (Priority 1.5)

**Day 3:**
- AI Mentor chat (Priority 2.6)
- Progress tracking (Priority 2.7)

**Day 4:**
- Persona auto-generation (Priority 2.8)
- Blueprint aggregation (Priority 2.9)

**Day 5:**
- Activity feed (Priority 3.10)
- Lock logic (Priority 3.11)
- Downloads (Priority 3.12)

**Day 6:**
- Search/filter (Priority 3.13)
- Testing all flows
- Bug fixes

**Day 7:**
- Polish UI
- Responsive design fixes
- Final QA

---

## ❓ FAQ for Developer

**Q: Do I need to integrate with backend/database?**
A: NO. Everything is frontend-only with mock data. Use Zustand for state management.

**Q: What about authentication?**
A: Not needed. Assume user is already logged in. Hardcode student data.

**Q: Should AI Mentor actually use AI?**
A: For now, no. Use simple keyword matching. Backend integration comes later.

**Q: Where do I get video files?**
A: Use placeholder videos from YouTube or create mock player. Real content comes later.

**Q: How do I handle form submissions?**
A: Show success modal, update in-memory state. No actual data persistence needed.

**Q: What if I find design issues?**
A: Fix obvious UX problems, but stay close to existing design. Focus on functionality.

**Q: Should I write tests?**
A: Not required for this phase. Manual testing is sufficient.

**Q: Mobile responsive required?**
A: Yes. Use Tailwind responsive classes. Test on 3 screen sizes: mobile (375px), tablet (768px), desktop (1440px).

---

## 📞 Contact

If you have questions or need clarification, ask about:
- Business logic (how should this work?)
- User experience (what should user see?)
- Technical approach (which library to use?)
- Priority (is this feature needed now?)

---

**End of Specification**

You now have complete context to build the Academy module frontend. Focus on getting user flows working first, then polish. Good luck! 🚀
