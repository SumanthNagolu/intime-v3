# Academy App - Complete Page List

**Date:** 2025-11-23
**Status:** Authentication disabled for development
**Access:** All pages accessible without login

---

## 🏠 Main Navigation Flow

### **Home → Dashboard → Courses → Lesson → Complete → Next**

```
Home Page (/)
    ↓
Dashboard (/students/dashboard)
    ↓
Courses List (/students/courses)
    ↓
Lesson View (/students/courses/[moduleId]/learn/[lessonId])
    ↓
[Theory → Demo → Quiz → Lab]
    ↓
Next Lesson or Back to Courses
```

---

## 📄 Complete Page Inventory

### 🎓 **Core Academy Pages** (From Prototype - Now Integrated)

| # | Page Name | URL Path | Status | Description |
|---|-----------|----------|--------|-------------|
| 1 | **Dashboard** | `/students/dashboard` | ✅ Live | Main student dashboard with progress, employability matrix, sprint backlog |
| 2 | **Courses List** | `/students/courses` | ✅ Live | Full curriculum view with visual timeline of all modules |
| 3 | **Lesson View** | `/students/courses/[moduleId]/learn/[lessonId]` | ✅ Live | 4-stage protocol: Theory → Demo → Quiz → Lab |
| 4 | **Persona View** | `/students/identity` | ✅ Live | Resume simulation - "The 7-Year Promise" |
| 5 | **Interview Studio** | `/students/dojo` | ✅ Live | Interview shadowing teleprompter |
| 6 | **AI Mentor Chat** | Floating Widget | ✅ Live | Accessible from any page via bottom-right button |

---

### 📚 **Additional Student Pages** (Existing in App)

| # | Page Name | URL Path | Status | Description |
|---|-----------|----------|--------|-------------|
| 7 | **Student Home** | `/students` | ✅ Live | Student section landing page |
| 8 | **AI Mentor Page** | `/students/ai-mentor` | ✅ Live | Dedicated AI mentor page |
| 9 | **Progress Tracking** | `/students/progress` | ✅ Live | Detailed progress analytics |
| 10 | **Assessments Hub** | `/students/assessments` | ✅ Live | Assessment overview |
| 11 | **Interview Prep** | `/students/assessments/interview` | ✅ Live | Interview preparation |
| 12 | **Quizzes List** | `/students/assessments/quizzes` | ✅ Live | Available quizzes |
| 13 | **Quiz Detail** | `/students/assessments/quizzes/[id]` | ✅ Live | Individual quiz |
| 14 | **Certificates** | `/students/certificates` | ✅ Live | Earned certificates |
| 15 | **Course Detail (Alt)** | `/students/courses/[slug]` | ✅ Live | Alternative course view |
| 16 | **Topic Lesson (Alt)** | `/students/courses/[slug]/learn/[topicId]` | ✅ Live | Alternative lesson route |
| 17 | **Test Page** | `/students/test` | ✅ Live | Testing/development page |

---

## 🎯 Primary User Journey

### **The Complete Learning Flow**

#### 1️⃣ **Entry: Dashboard** (`/students/dashboard`)
**Purpose:** Motivational hub + today's focus

**Features:**
- Hero card with current lesson
- Curriculum horizon (8-week roadmap)
- Employability matrix (tech/portfolio/comm scores)
- Sprint backlog (next 4 lessons)
- Live cohort pulse (social feed)

**CTAs:**
- "Enter The Protocol" → Current lesson
- "View Full Sprint" → Courses list

---

#### 2️⃣ **Discovery: Courses List** (`/students/courses`)
**Purpose:** Full curriculum overview

**Features:**
- Visual timeline with 8 modules
- Module progress indicators
- Lesson status badges (completed/current/locked)
- Sequential unlocking visualization

**CTAs:**
- Click module → Expand lessons
- Click lesson → Enter lesson view
- "Continue Journey" → Resume current lesson

---

#### 3️⃣ **Learning: Lesson View** (`/students/courses/[moduleId]/learn/[lessonId]`)
**Purpose:** 4-stage mastery protocol

**Features:**

**Stage 1: Theory** (20 min)
- Slide deck with key concepts
- Senior context panel (why it matters)
- Navigation: Previous/Next/Complete

**Stage 2: Demo** (15 min)
- Video demonstration
- Transcript overlay
- Complete when video watched

**Stage 3: Quiz** (5 min)
- Knowledge verification gate
- Multiple choice questions
- Must pass to proceed

**Stage 4: Lab** (45 min)
- Split view: Instructions + Code editor
- User story reference
- Copy code snippet
- Mark complete when finished

**Auto-Progression:**
- Complete stage → Unlock next stage
- Complete all 4 stages → Next lesson unlocks
- Complete module → Next module unlocks

---

#### 4️⃣ **Identity: Persona View** (`/students/identity`)
**Purpose:** Resume you're building toward

**Features:**
- Professional resume layout (7-year senior dev)
- Gap analysis (what you're missing)
- Current progress vs target
- Next milestone to unlock

**CTAs:**
- "Close the Gap" → Jump to specific lab

---

#### 5️⃣ **Practice: Interview Studio** (`/students/dojo`)
**Purpose:** Interview shadowing simulation

**Features:**
- Teleprompter-style script
- Auto-scrolling with progress bars
- Real-time analysis (pacing, tone)
- Coach's notes panel

**Flow:**
- Start simulation
- Read aloud in real-time
- Get feedback on cadence/confidence
- Reset and practice again

---

#### 6️⃣ **Support: AI Mentor** (Floating Widget)
**Purpose:** Socratic method coaching

**Features:**
- Always accessible (bottom-right)
- Minimizable chat widget
- Question-based guidance
- Context-aware responses

**Available From:** All pages

---

## 🗺️ Navigation Structure

```
Academy App Structure
│
├── 🏠 Home (/)
│   └── Redirects to /students/dashboard
│
├── 🎓 Students Section (/students)
│   │
│   ├── 📊 Dashboard (/students/dashboard)
│   │   ├── Hero Card → Current Lesson
│   │   ├── Curriculum Horizon → All Modules
│   │   ├── Employability Matrix
│   │   ├── Sprint Backlog
│   │   └── Live Cohort Pulse
│   │
│   ├── 📚 Courses (/students/courses)
│   │   ├── Module 1 (Week 1)
│   │   │   ├── Lesson 1.1 → /students/courses/1/learn/l1
│   │   │   ├── Lesson 1.2 → /students/courses/1/learn/l2
│   │   │   └── ...
│   │   ├── Module 2 (Week 2)
│   │   └── ... (8 modules total)
│   │
│   ├── 📖 Lesson Protocol (/students/courses/[moduleId]/learn/[lessonId])
│   │   ├── Theory Stage
│   │   ├── Demo Stage
│   │   ├── Quiz Stage
│   │   └── Lab Stage
│   │
│   ├── 👤 Identity (/students/identity)
│   │   ├── Target Resume
│   │   └── Gap Analysis
│   │
│   ├── 🎤 Interview Studio (/students/dojo)
│   │   └── Shadowing Simulation
│   │
│   ├── 🤖 AI Mentor (/students/ai-mentor)
│   │   └── Socratic Coaching
│   │
│   ├── 📈 Progress (/students/progress)
│   │   └── Analytics Dashboard
│   │
│   ├── ✅ Assessments (/students/assessments)
│   │   ├── Quizzes → /students/assessments/quizzes
│   │   └── Interview Prep → /students/assessments/interview
│   │
│   └── 🏆 Certificates (/students/certificates)
│       └── Earned Credentials
│
└── 💬 AI Mentor Widget (Floating)
    └── Always accessible from any page
```

---

## 🎨 Design Philosophy Per Page

### **Dashboard** - Motivational Design
- Premium aesthetics (noise texture, shadows)
- Hero card with gradient hover
- Visual progress indicators
- Employability matrix with color-coded bars
- "Today's Focus" emphasis

### **Courses List** - Timeline Design
- Vertical timeline visualization
- Module progress circles
- Lesson status indicators
- Card-based module layout
- "The Path" branding

### **Lesson View** - Protocol Design
- Stage navigation bar (pill style)
- Full-screen immersive stages
- Theory: Dark background + slide deck
- Demo: Video player focus
- Quiz: Centered verification gate
- Lab: Split view (instructions + code)

### **Persona View** - Professional Resume
- Formal resume layout
- Watermark "CONFIDENTIAL"
- Gap analysis panel
- Locked milestones
- "7-Year Promise" branding

### **Interview Studio** - Teleprompter Design
- Auto-scrolling script
- Live recording indicators
- Progress bars per line
- Real-time analysis panel
- Coach's notes sidebar

### **AI Mentor** - Chat Widget
- Minimizable floating window
- Socratic question style
- Typing indicators
- Message bubbles (user vs AI)
- Always accessible

---

## 🚀 Quick Access URLs (Development)

**Authentication is DISABLED** - All pages accessible directly:

### Core Academy Flow
```bash
http://localhost:3000/students/dashboard
http://localhost:3000/students/courses
http://localhost:3000/students/courses/1/learn/l1
http://localhost:3000/students/identity
http://localhost:3000/students/dojo
```

### Alternative Routes
```bash
http://localhost:3000/students/courses/guidewire-developer
http://localhost:3000/students/courses/guidewire-developer/learn/[topic-id]
```

### Support Pages
```bash
http://localhost:3000/students/ai-mentor
http://localhost:3000/students/progress
http://localhost:3000/students/assessments
http://localhost:3000/students/certificates
```

---

## 📊 Page Completion Status

| Status | Count | Pages |
|--------|-------|-------|
| ✅ **Live with Real Data** | 3 | Dashboard, Courses, Lesson View |
| ✅ **Live with Mock Data** | 3 | Persona, Dojo, AI Mentor |
| ✅ **Live (Existing)** | 11 | All other student pages |
| **Total** | **17** | Complete Academy App |

---

## 🔄 Data Integration Status

### **Connected to Supabase** ✅
- Dashboard (modules, progress, employability)
- Courses List (timeline, status, unlocking)
- Lesson View (content, stages, completion)

### **Using Mock Data** ⏳
- Persona View (target resume, gap analysis)
- Interview Studio (script, simulation)
- AI Mentor (chat responses)

### **Existing Features** ✅
- Progress tracking
- Assessments
- Certificates
- Quiz engine

---

## 🎯 Recommended Testing Order

1. **Start:** `/students/dashboard`
   - Verify employability scores load
   - Check current lesson detection
   - Click "Enter The Protocol"

2. **Navigate:** `/students/courses`
   - Verify timeline renders
   - Check module progress bars
   - Click into a lesson

3. **Learn:** `/students/courses/1/learn/l1`
   - Complete Theory stage
   - Complete Demo stage
   - Complete Quiz stage
   - Complete Lab stage
   - Verify auto-progression

4. **Explore:** `/students/identity`
   - View target resume
   - Check gap analysis

5. **Practice:** `/students/dojo`
   - Start simulation
   - Watch auto-scroll

6. **Chat:** AI Mentor Widget
   - Click bottom-right button
   - Send a message

---

## 📝 Notes for Development

### **Authentication Status**
⚠️ **TEMPORARILY DISABLED** in `src/middleware.ts`
- All protected routes accessible
- No login required
- **IMPORTANT:** Re-enable before production deployment

### **Data Requirements**
To see full functionality:
- Seed Guidewire course data
- Create student enrollment
- Have at least 1 completed lesson

### **Environment**
```bash
npm run dev
# Open http://localhost:3000/students/dashboard
```

---

**Complete Academy App Ready for Testing!** 🚀
All 17 pages accessible without authentication.
