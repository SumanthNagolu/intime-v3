# Guidewire Developer Academy - Implementation Plan

## Content Inventory

| Chapter | Topic | PPTs | Videos | Assignments |
|---------|-------|------|--------|-------------|
| 1 | Guidewire Cloud Overview | - | 1 | - |
| 2 | Surepath Overview | - | 1 | - |
| 3 | InsuranceSuite Implementation Tools | - | - | 3 (xlsx/pdf) |
| 4 | PolicyCenter Introduction | 31 | 47 | 31 PDFs |
| 5 | ClaimCenter Introduction | 19 | 46 | 19 PDFs |
| 6 | BillingCenter Introduction | 13 | 28 | 19 PDFs |
| 7 | InsuranceSuite Developer Fundamentals | 23 | 29 | 22 PDFs |
| 8 | PolicyCenter Configuration | 14 | 27 | 13 PDFs |
| 9 | ClaimCenter Configuration | 18 | 36 | 17 PDFs |
| 10 | BillingCenter Configuration | - | - | 17 PDFs |
| 11 | Introduction to Integration | 21 | 19 | 18 PDFs |
| 12 | Advanced Product Designer | 4 docs | 22 | - |
| 13 | Rating Introduction | 7 | 11 | - |
| 14 | Rating Configuration | 5 | 9 | - |
| **TOTAL** | | **161** | **276** | **159 PDFs** |

Plus: **26 Interview Preparation documents** (docx + pdf)

---

## The Vision: Guidewire Guru

Turn static PPT training into an interactive, AI-powered learning platform that produces **job-ready Guidewire developers**. The AI (Guidewire Guru) is the backbone - trained on ALL material, it becomes the student's personal mentor throughout the entire journey.

---

## Architecture Overview

### Four Tabs

```
┌──────────────┬──────────────┬──────────────┬──────────────────┐
│   THE PATH   │   THE PLAN   │   THE AI     │ INTERVIEW ASSIST │
│  (Dashboard) │  (Lessons)   │  (GW Guru)   │  (Mock Prep)     │
└──────────────┴──────────────┴──────────────┴──────────────────┘
```

| Tab | Purpose |
|-----|---------|
| **THE PATH** | Dashboard + full curriculum map. See all 14 chapters, progress per chapter, overall readiness index. Bird's eye view. |
| **THE PLAN** | Sequential lesson journey. One lesson at a time, scroll-through format. Student moves forward, never needs to go back (AI handles recall). |
| **THE AI** | Guidewire Guru chat. Trained on ALL lesson content + assignments + interview prep. Can answer "what was that concept from Ch 4 Lesson 3?", help debug Gosu code, explain PCF patterns, do mock interviews. |
| **INTERVIEW ASSIST** | Focused interview prep mode. Mock interviews, question banks (from 26 prep docs), scenario-based practice, timed sessions. |

---

## Phase 0: Content Extraction Pipeline (CRITICAL PATH)

Before any UI work, we need to extract PPT content into a structured format the portal can render.

### 0A. PPT Extraction Script

**Goal:** Extract from each PPTX → structured JSON per lesson

**Input:** `IS_Fund_02 - Introduction to the Data Model.pptx`

**Output:** `ch07/lesson-02.json`
```json
{
  "chapterId": 7,
  "lessonId": 2,
  "title": "Introduction to the Data Model",
  "sourceFile": "IS_Fund_02",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Introduction to the Data Model",
      "content": "The Guidewire data model is the foundation...",
      "notes": "Speaker notes: In this lesson we'll cover the entity hierarchy...",
      "bulletPoints": ["Entity types", "Relationships", "Foreign keys"],
      "hasImage": true,
      "imageFile": "ch07/slides/lesson-02-slide-01.png"
    }
  ],
  "videos": [
    {
      "afterSlide": 5,
      "title": "Data Model Walkthrough Demo",
      "file": "IS_Fund_02_01.mp4",
      "path": "/academy/guidewire/videos/ch07/IS_Fund_02_01.mp4"
    }
  ],
  "estimatedDuration": "45 min"
}
```

**Tool:** Python script using `python-pptx` library
- Extract slide text (title + body + bullet points)
- Extract speaker notes
- Export slide images as PNG (for visual reference alongside text)
- Map embedded video references to actual video files
- Output clean JSON

### 0B. Video File Organization

Copy all MP4/MKV files into `public/academy/guidewire/videos/` organized by chapter:
```
public/academy/guidewire/videos/
├── ch01/01-guidewire-cloud-overview.mp4
├── ch04/In_policy_01_01.mp4
├── ch04/In_policy_01_02.mp4
├── ch07/IS_Fund_02_01.mp4
└── ...
```

### 0C. Assignment PDF Organization

Copy assignment PDFs to `public/academy/guidewire/assignments/`:
```
public/academy/guidewire/assignments/
├── ch04-policycenter-intro/01_Accounts.pdf
├── ch05-claimcenter-intro/01_The_Claims_Process.pdf
├── ch07-is-fundamentals/01_Introduction_to_Guidewire_Configuration.pdf
└── ...
```

### 0D. Slide Image Export

Export each slide as a PNG image using python-pptx + Pillow (or LibreOffice headless):
```
public/academy/guidewire/slides/
├── ch07/lesson-02/slide-01.png
├── ch07/lesson-02/slide-02.png
└── ...
```

### 0E. Interview Prep Extraction

Extract DOCX content from Interview Preparation folder into structured JSON:
```json
{
  "categories": [
    {
      "title": "Common Guidewire Interview Questions",
      "source": "Commom_Guidewire_Interview_Questions.docx",
      "questions": [
        { "question": "...", "answer": "...", "difficulty": "medium", "topics": ["PCF", "DataModel"] }
      ]
    }
  ]
}
```

---

## Phase 1: Curriculum Data Model

### 1A. Master Curriculum Config

`src/lib/academy/curriculum.ts` - Single source of truth for all 14 chapters, ~160 lessons

```typescript
export interface Chapter {
  id: number
  title: string
  slug: string           // "policycenter-intro"
  description: string
  weekRange: string      // "Week 3-5"
  phase: 'foundation' | 'specialization' | 'configuration' | 'advanced'
  lessons: Lesson[]
  assignmentFolder: string  // maps to Assignments/ subfolder
}

export interface Lesson {
  id: string              // "ch04-l01"
  lessonNumber: number
  title: string
  sourcePrefix: string    // "In_policy_01", "IS_Fund_02"
  contentFile: string     // path to extracted JSON
  videos: VideoRef[]
  assignmentPdf?: string  // path to assignment PDF
  estimatedMinutes: number
  checkpoints: Checkpoint[]
}

export interface VideoRef {
  title: string
  path: string            // "/academy/guidewire/videos/ch04/..."
  afterSection: number    // show after which content section
}

export interface Checkpoint {
  afterSection: number
  questions: CheckpointQuestion[]
}

export interface CheckpointQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: string
}
```

### 1B. Progress Store (Zustand)

```typescript
interface AcademyProgress {
  // Per-lesson progress
  lessons: Record<string, {
    status: 'locked' | 'available' | 'in_progress' | 'completed'
    scrollProgress: number          // 0-100%
    checkpointsCompleted: string[]  // checkpoint IDs
    videoWatched: Record<string, boolean>
    assignmentSubmitted: boolean
    assignmentResponse?: string     // student's submission
    completedAt?: string
    score?: number
  }>

  // Per-chapter aggregate
  chapters: Record<number, {
    lessonsCompleted: number
    totalLessons: number
    progress: number  // 0-100%
  }>

  // Overall
  readinessIndex: number  // weighted score
  currentLesson: string   // "ch04-l01"
  streak: number          // consecutive days
}
```

---

## Phase 2: Lesson Page (The Core Experience)

### 2A. Lesson Page Layout

One continuous scroll per lesson. Student reads top to bottom, never goes back.

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Curriculum    Chapter 7 · Lesson 02           │
│ Introduction to the Data Model          Est. 45 min     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 32% ━━━━━━━━━━━━━━━━━━━ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [SLIDE IMAGE]          │ PRESENTER NOTES           │ │
│ │                        │                           │ │
│ │  Introduction to       │ In this lesson, we'll     │ │
│ │  the Data Model        │ explore the Guidewire     │ │
│ │                        │ entity hierarchy and      │ │
│ │  (Visual from PPT)     │ how data is structured... │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ KEY CONCEPTS                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ The Guidewire data model uses a hierarchical        │ │
│ │ entity structure. Core entities include:            │ │
│ │                                                     │ │
│ │ • Entity Types - Define the schema                  │ │
│ │ • Relationships - Foreign key associations          │ │
│ │ • Typelists - Enumerated value sets                │ │
│ │                                                     │ │
│ │ [Formatted text from slide body + notes]            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [SLIDE IMAGE]          │ PRESENTER NOTES           │ │
│ │  Entity Hierarchy      │ Think of entities like    │ │
│ │                        │ database tables...        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ CHECKPOINT ────────────────────────────────────────┐ │
│ │ Before we continue, let's verify:                   │ │
│ │                                                     │ │
│ │ Q: What defines the schema in GW's data model?      │ │
│ │   ○ Typelists                                       │ │
│ │   ● Entity Types  ✓                                 │ │
│ │   ○ Foreign Keys                                    │ │
│ │   ○ XML Files                                       │ │
│ │                                                     │ │
│ │ ✓ Correct! Entity Types define the schema...        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ DEMO ─────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │  ▶ Data Model Walkthrough                           │ │
│ │  ┌───────────────────────────────────────────┐     │ │
│ │  │                                           │     │ │
│ │  │         [HTML5 Video Player]               │     │ │
│ │  │                                           │     │ │
│ │  └───────────────────────────────────────────┘     │ │
│ │  IS_Fund_02_01.mp4                    12:34         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ... more slides + checkpoints ...                       │
│                                                         │
│ ┌─ ASSIGNMENT ───────────────────────────────────────┐ │
│ │                                                     │ │
│ │ 📋 Introduction to the Data Model                   │ │
│ │                                                     │ │
│ │ Complete the following exercises from the            │ │
│ │ assignment document.                                │ │
│ │                                                     │ │
│ │ [Download Assignment PDF]                           │ │
│ │                                                     │ │
│ │ Submit your response:                               │ │
│ │ ┌───────────────────────────────────────────┐      │ │
│ │ │ (Text area / file upload)                  │      │ │
│ │ └───────────────────────────────────────────┘      │ │
│ │                                                     │ │
│ │ [Submit Response]    [View Solution] (after submit) │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│            [ ✓ COMPLETE LESSON → Next: Lesson 03 ]      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2B. Slide Rendering Component

Each PPT slide becomes a two-column card:
- **Left:** Slide image (exported PNG) - the visual graphic
- **Right:** Formatted text from slide notes - the explanation

For text-heavy slides (no meaningful graphic), render as a styled content block with:
- Title (from slide title)
- Bullet points (from slide body)
- Explanatory text (from speaker notes)

### 2C. Progress Tracking

- **Scroll-based:** As student scrolls, track % through lesson
- **Checkpoint gates:** Must answer correctly to continue scrolling (soft gate - warn, don't block)
- **Video tracking:** Track if video was played (don't require full watch)
- **Assignment submission:** Required to mark lesson complete
- **Sticky progress bar** at top shows real-time lesson progress

### 2D. Assignment Flow

1. Student reads lesson content
2. At bottom, sees assignment PDF download
3. Completes exercises
4. Submits response (text or file upload)
5. After submission, "View Solution" button unlocks (solution = attached solution in PDF)
6. Lesson marked complete

---

## Phase 3: Dashboard & Curriculum Map (THE PATH)

### 3A. Dashboard Redesign

Keep the existing dashboard structure but populate with real data:

```
┌─────────────────────────────────────────────────────────┐
│ Readiness Index: 33%                                    │
│ ━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ CURRENT FOCUS                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Chapter 7 · Lesson 02                               │ │
│ │ Introduction to the Data Model                      │ │
│ │ InsuranceSuite Developer Fundamentals               │ │
│ │                                   [CONTINUE →]      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ CURRICULUM MAP                           14 Chapters    │
│                                                         │
│ FOUNDATION                                              │
│ ┌──────┐ ┌──────┐ ┌──────┐                            │
│ │ Ch 1 │ │ Ch 2 │ │ Ch 3 │                            │
│ │ ✓100%│ │ ✓100%│ │ ✓100%│                            │
│ │Cloud │ │Sure  │ │Tools │                            │
│ └──────┘ └──────┘ └──────┘                            │
│                                                         │
│ SPECIALIZATION                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐                            │
│ │ Ch 4 │ │ Ch 5 │ │ Ch 6 │                            │
│ │ 65%  │ │ 0%   │ │ 0%   │                            │
│ │PC    │ │CC    │ │BC    │                            │
│ └──────┘ └──────┘ └──────┘                            │
│                                                         │
│ DEVELOPER CORE                                          │
│ ┌──────┐                                               │
│ │ Ch 7 │  ← CURRENT                                   │
│ │ 8%   │                                               │
│ │Fund  │                                               │
│ └──────┘                                               │
│                                                         │
│ CONFIGURATION                                           │
│ ┌──────┐ ┌──────┐ ┌──────┐                            │
│ │ Ch 8 │ │ Ch 9 │ │Ch 10 │                            │
│ │ 🔒   │ │ 🔒   │ │ 🔒   │                            │
│ │PC Cfg│ │CC Cfg│ │BC Cfg│                            │
│ └──────┘ └──────┘ └──────┘                            │
│                                                         │
│ ADVANCED                                                │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │Ch 11 │ │Ch 12 │ │Ch 13 │ │Ch 14 │                  │
│ │ 🔒   │ │ 🔒   │ │ 🔒   │ │ 🔒   │                  │
│ │Integ │ │APD   │ │Rate I│ │Rate C│                  │
│ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                         │
│ STATS                                                   │
│ Technical: 44%  Communication: 55%  Portfolio: 0%       │
└─────────────────────────────────────────────────────────┘
```

### 3B. Chapter Detail View

Clicking a chapter shows all its lessons with status:
```
Chapter 7: InsuranceSuite Developer Fundamentals
23 Lessons · 22 Assignments · Week 6-8

 ✓ Lesson 01 - Introduction to Guidewire Configuration
 ● Lesson 02 - Introduction to the Data Model       ← CURRENT
 🔒 Lesson 03 - Extending the Data Model
 🔒 Lesson 04 - User Interface Architecture
 🔒 Lesson 05 - Atomic Widgets
 ...
 🔒 Lesson 22 - Entity Names
 🔒 Lesson 23 - Preparing for Guidewire Exam
```

---

## Phase 4: Guidewire Guru AI (THE AI)

### 4A. Knowledge Base

Feed the AI ALL extracted content:
- All slide text + speaker notes from 161 PPTs
- All assignment content from 159 PDFs
- All interview prep questions from 26 docs
- Chapter/lesson structure for context

**Approach:** Use Gemini's 1M token context window. Concatenate all lesson content into a structured prompt:

```
You are Guidewire Guru, a senior Guidewire developer with 10+ years experience.
You have complete knowledge of the following training curriculum:

[Chapter 1: Guidewire Cloud Overview]
[Lesson content...]

[Chapter 4: PolicyCenter Introduction]
[Lesson 01: Accounts]
[Slide notes + content...]
...
```

### 4B. AI Capabilities

| Capability | How It Works |
|-----------|-------------|
| **Recall** | "What was the entity hierarchy from Chapter 7 Lesson 2?" → Pulls from lesson content |
| **Explain** | "Explain PCF files like I'm new" → Uses slide notes + real examples |
| **Debug** | "My Gosu rule isn't firing" → Uses IS_Fund knowledge |
| **Quiz** | "Test me on ClaimCenter data model" → Generates from checkpoint questions |
| **Interview** | "Give me a mock interview question about rating" → Uses interview prep docs |
| **Connect** | "How does Ch 4 Coverages relate to Ch 8 Configuration?" → Cross-chapter understanding |

### 4C. Context-Aware

The AI knows WHERE the student is in the curriculum:
- What chapters they've completed
- Current lesson
- What they struggled with (checkpoint failures)
- Their assignment responses

So it can say: "Based on your work in Ch 7 Lesson 8 on Gosu, here's how that applies to what you're learning now in Ch 8..."

---

## Phase 5: Interview Assist

### 5A. Content Source

26 docs from `Interview Preparation/`:
- Common Guidewire Interview Questions (multiple variants)
- Domain Review Questions
- Technical Review Questions
- Claims Process Review
- Vendor Call Script
- Numbered question sets (1.docx through 22.docx)

### 5B. Features

| Feature | Description |
|---------|-------------|
| **Question Bank** | All questions categorized by topic (PC, CC, BC, Integration, Rating) and difficulty |
| **Mock Interview** | AI plays interviewer, asks questions, evaluates answers |
| **Timed Sessions** | 30-min / 60-min mock interviews with timer |
| **Answer Review** | After attempt, show model answer + AI feedback |
| **Weak Spots** | Track which topics student struggles with, recommend review |
| **Vendor Call Practice** | Practice the vendor call script for bench sales scenarios |

---

## Phase 6: Implementation Sequence

### Sprint 1: Content Pipeline (Week 1)
- [ ] Write Python PPT extraction script (`scripts/extract-ppts.py`)
- [ ] Run extraction on all 161 PPTs → JSON files
- [ ] Export slide images to PNGs
- [ ] Organize videos into `public/academy/guidewire/videos/`
- [ ] Organize assignment PDFs into `public/academy/guidewire/assignments/`
- [ ] Extract interview prep DOCX → JSON

### Sprint 2: Curriculum Data Model (Week 1-2)
- [ ] Create `src/lib/academy/curriculum.ts` with full 14-chapter structure
- [ ] Create `src/lib/academy/types.ts` with TypeScript types
- [ ] Map all 161 lessons with video references + assignment links
- [ ] Create Zustand progress store with localStorage persistence
- [ ] Generate checkpoint questions (AI-assisted from slide content)

### Sprint 3: Lesson Page Redesign (Week 2-3)
- [ ] New `LessonScrollView` component (replaces 4-stage LessonView)
- [ ] `SlideCard` component (image left + notes right)
- [ ] `ContentBlock` component (formatted text from slides)
- [ ] `CheckpointGate` component (inline quiz questions)
- [ ] `DemoVideo` component (HTML5 video player with tracking)
- [ ] `AssignmentBlock` component (PDF download + submit + solution)
- [ ] Scroll progress tracking
- [ ] Lesson completion flow

### Sprint 4: Dashboard & Curriculum Map (Week 3)
- [ ] Update Dashboard with real curriculum data
- [ ] Chapter cards with progress
- [ ] Chapter detail view (lesson list)
- [ ] Current lesson hero card
- [ ] Readiness index calculation from real progress

### Sprint 5: Guidewire Guru AI (Week 3-4)
- [ ] Build knowledge base from extracted content
- [ ] Create specialized Gemini system prompt with full curriculum
- [ ] Context-aware chat (knows student's progress)
- [ ] Cross-chapter recall capability
- [ ] Quiz generation from checkpoints
- [ ] Code help mode (Gosu/PCF assistance)

### Sprint 6: Interview Assist (Week 4)
- [ ] Extract interview questions from 26 docs
- [ ] Question bank with categories + difficulty
- [ ] Mock interview mode (AI interviewer)
- [ ] Timed sessions
- [ ] Answer review + feedback
- [ ] Weak spot tracking

### Sprint 7: Polish & Integration (Week 5)
- [ ] Cohort features (if multiple students)
- [ ] Certificate generation on chapter completion
- [ ] Employability index tied to real progress
- [ ] Mobile responsive lesson view
- [ ] Offline support for lesson content

---

## File Structure (Final)

```
public/academy/guidewire/
├── videos/              ← 276 MP4/MKV files organized by chapter
│   ├── ch01/
│   ├── ch04/
│   └── ...
├── assignments/         ← 159 PDF files organized by chapter
│   ├── ch04-policycenter-intro/
│   ├── ch07-is-fundamentals/
│   └── ...
├── slides/              ← Exported slide PNGs
│   ├── ch04/lesson-01/
│   └── ...
└── content/             ← Extracted JSON from PPTs
    ├── ch04/lesson-01.json
    ├── ch07/lesson-02.json
    └── ...

src/lib/academy/
├── curriculum.ts        ← Master curriculum definition (14 chapters)
├── types.ts             ← TypeScript types
├── progress-store.ts    ← Zustand store for student progress
├── checkpoints.ts       ← Checkpoint questions per lesson
└── interview-bank.ts    ← Interview questions database

src/components/academy/
├── LessonScrollView.tsx ← New lesson page (replaces LessonView)
├── SlideCard.tsx         ← Slide image + notes card
├── ContentBlock.tsx      ← Formatted lesson text
├── CheckpointGate.tsx    ← Inline quiz checkpoint
├── DemoVideo.tsx         ← Video player with tracking
├── AssignmentBlock.tsx   ← Assignment download + submit
├── CurriculumMap.tsx     ← Full curriculum grid view
├── ChapterDetail.tsx     ← Chapter lesson list
└── InterviewMode.tsx     ← Mock interview interface

scripts/
├── extract-ppts.py      ← PPT → JSON + PNG extraction
├── extract-docx.py      ← DOCX → JSON (interview prep)
└── organize-content.sh  ← File organization script
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Video hosting | `public/` for dev, Supabase Storage for prod | Start simple, migrate later |
| Content format | JSON extracted from PPT | Structured, renderable, searchable by AI |
| Slide rendering | Image + text side-by-side | Preserves PPT visual design + adds readable text |
| Progress tracking | Zustand + localStorage | No backend needed yet, upgrade to DB later |
| AI context | Full curriculum in Gemini system prompt | 1M token window fits everything |
| Checkpoints | AI-generated then manually curated | Bootstrap fast, refine over time |
| Sequential locking | Soft lock (warn, don't block) | Adult learners, don't frustrate |

---

## Success Metrics

- Student can go from zero to interview-ready in 8-10 weeks
- AI can answer any question about any lesson in the curriculum
- 100% of PPT content is accessible in the portal (no external tools needed)
- Every lesson has embedded videos, checkpoints, and assignments
- Interview prep covers all 26 source documents
- Progress tracking shows exactly where each student stands
