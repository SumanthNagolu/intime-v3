// ============================================================
// Guidewire Academy Types
// ============================================================

// --- Curriculum Structure ---

export type ChapterPhase =
  | 'foundation'
  | 'specialization'
  | 'developer-core'
  | 'configuration'
  | 'advanced'

export interface Chapter {
  id: number
  title: string
  slug: string
  description: string
  weekRange: string
  phase: ChapterPhase
  totalLessons: number
  assignmentFolder?: string
}

export interface LessonMeta {
  lessonId: string
  chapterSlug: string
  chapterId: number
  lessonNumber: number
  title: string
  estimatedMinutes: number
  videoCount: number
  hasAssignment: boolean
  assignmentPdf?: string
  solutionPdf?: string
}

// --- Extracted Content (from JSON files) ---

export type SlideType =
  | 'title'
  | 'objectives'
  | 'content'
  | 'demo_instruction'
  | 'demo_video'
  | 'question'
  | 'answer'
  | 'objectives_review'
  | 'vm_instructions'
  | 'exercise'

export interface QuestionData {
  question: string
  answer: string
}

export interface SlideContent {
  slideNumber: number
  title: string
  slideType?: SlideType
  bodyParagraphs: SlideParagraph[]
  notes: string
  narration?: string
  hasTable: boolean
  hasChart: boolean
  hasImage: boolean
  tableData: string[][] | null
  mediaReferences: string[]
  questionData?: QuestionData
  demoVideoIndex?: number
  downloadFiles?: DownloadFile[]
}

export interface DownloadFile {
  label: string
  path: string
}

export interface SlideParagraph {
  text: string
  level: number
  bold: boolean
}

export interface VideoRef {
  index: number
  filename: string
  path: string
}

export interface ExtractedLesson {
  lessonId: string
  chapterId: number
  chapterSlug: string
  lessonNumber: number
  title: string
  sourceFile: string
  sourceFolder: string | null
  totalSlides: number
  estimatedMinutes: number
  slides: SlideContent[]
  videos: VideoRef[]
  hasNotes: boolean
  hasTables: boolean
  hasImages: boolean
}

// ============================================================
// Synthesized Lesson Types (AI-generated structured content)
// ============================================================

export type LessonBlockType =
  | 'hook' | 'objectives' | 'activate' | 'concept'
  | 'demo' | 'practice' | 'knowledge_check' | 'summary' | 'assignment'

export interface FigureRef {
  slideNumber: number
  caption: string
}

export interface Callout {
  type: 'tip' | 'warning' | 'best_practice' | 'gotcha' | 'definition'
  title: string
  content: string
}

export interface CodeExample {
  language: 'gosu' | 'xml' | 'sql' | 'json' | 'text'
  title: string
  code: string
  explanation?: string
}

export interface HookBlock {
  type: 'hook'
  id: string
  scenario: string
  question: string
}

export interface ObjectivesBlock {
  type: 'objectives'
  id: string
  objectives: string[]
  estimatedMinutes: number
}

export interface ActivateBlock {
  type: 'activate'
  id: string
  priorKnowledge: string
  warmupQuestion: string
  hint?: string
}

export interface ConceptBlock {
  type: 'concept'
  id: string
  heading: string
  narrative: string
  keyPoints: string[]
  figures: FigureRef[]
  tables?: { headers: string[]; rows: string[][]; caption?: string }[]
  callouts?: Callout[]
  codeExamples?: CodeExample[]
}

export interface DemoBlock {
  type: 'demo'
  id: string
  videoIndex: number
  context: string
  transcriptSummary: string
}

export interface PracticeBlock {
  type: 'practice'
  id: string
  level: 'guided' | 'independent'
  scenario: string
  question: string
  hints?: string[]
  expectedApproach?: string
}

export interface KnowledgeCheckBlock {
  type: 'knowledge_check'
  id: string
  question: string
  referenceAnswer: string
  questionKey: string
}

export interface SummaryBlock {
  type: 'summary'
  id: string
  keyTakeaways: string[]
  realWorldConnection: string
  nextLessonPreview?: string
}

export interface AssignmentBlock {
  type: 'assignment'
  id: string
  description: string
  objectives: string[]
}

export type LessonBlock =
  | HookBlock | ObjectivesBlock | ActivateBlock | ConceptBlock
  | DemoBlock | PracticeBlock | KnowledgeCheckBlock
  | SummaryBlock | AssignmentBlock

export interface SynthesizedLesson {
  lessonId: string
  chapterId: number
  chapterSlug: string
  lessonNumber: number
  title: string
  subtitle: string
  synthesizedAt: string
  estimatedMinutes: number
  blocks: LessonBlock[]
  videos: VideoRef[]
  assignmentPdf?: string
  solutionPdf?: string
}

// --- Centralized Knowledge Checks ---

export interface KnowledgeCheckItem {
  id: string
  question: string
  answer: string
  questionSlide: number
  answerSlide: number | null
  source: 'questionData' | 'ocr'
}

export interface KnowledgeChecksData {
  _meta: {
    description: string
    generatedAt: string
    totalQuestions: number
    totalLessons: number
    source: string
  }
  lessons: Record<string, KnowledgeCheckItem[]>
}

// --- Checkpoints (inline quiz questions) ---

export interface CheckpointQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: string
}

export interface Checkpoint {
  id: string
  afterSlide: number // Show after this slide number
  questions: CheckpointQuestion[]
}

// Open-ended knowledge check generated from slide notes
export interface GeneratedKnowledgeCheck {
  id: string
  question: string
  referenceAnswer: string
  topic: string
}

// --- Progress Tracking ---

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface KnowledgeCheckAnswer {
  answer: string
  correct: boolean
  feedback: string
  gradedAt: string
}

export interface LessonProgress {
  status: LessonStatus
  scrollProgress: number
  slidesVisited?: number[]
  blocksVisited?: string[]
  checkpointsCompleted: string[]
  videosWatched: string[]
  assignmentSubmitted: boolean
  assignmentResponse?: string
  completedAt?: string
  score?: number
  knowledgeCheckAnswers?: Record<string, KnowledgeCheckAnswer>
}

export interface ChapterProgress {
  lessonsCompleted: number
  totalLessons: number
  progress: number
}

export interface AcademyProgressState {
  lessons: Record<string, LessonProgress>
  chapters: Record<number, ChapterProgress>
  currentLesson: string | null
  readinessIndex: number
  streak: number
  lastActiveDate: string | null
}

// --- AI Chat ---

export interface GuruMessageSource {
  source_type: string
  chapter?: string
  chapter_title?: string
  score: number
}

export interface GuruMessage {
  id: string
  role: 'user' | 'guru'
  content: string
  timestamp: string
  lessonContext?: string
  sources?: GuruMessageSource[]
}

export interface GuruSession {
  id: string
  title: string
  messages: GuruMessage[]
  createdAt: string
  lastModified: string
}

// --- Interview Prep ---

export interface InterviewQA {
  question: string
  answer: string
  topic: string
}

export interface InterviewDocument {
  title: string
  sourceFile: string
  sections: {
    heading: string
    content: {
      text: string
      bold: boolean
      isQuestion: boolean
      isAnswer: boolean
    }[]
  }[]
  qaPairs: InterviewQA[]
  totalQuestions: number
  isPdf?: boolean
}

export interface InterviewPrepData {
  totalDocuments: number
  totalQuestions: number
  documents: InterviewDocument[]
}

// --- Mock Interview ---

export type InterviewDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface MockInterviewSession {
  id: string
  difficulty: InterviewDifficulty
  topics: string[]
  questions: InterviewQA[]
  currentIndex: number
  answers: { question: string; userAnswer: string; score: number }[]
  startedAt: string
  completedAt?: string
  timerMinutes: number
}
