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

// --- Assignment Submission Blocks ---

export interface TextSubmissionBlock {
  type: 'text'
  id: string
  content: string
}

export interface CodeSubmissionBlock {
  type: 'code'
  id: string
  language: string
  content: string
}

export interface ScreenshotSubmissionBlock {
  type: 'screenshot'
  id: string
  dataUrl: string
  caption: string
}

export type SubmissionBlock = TextSubmissionBlock | CodeSubmissionBlock | ScreenshotSubmissionBlock

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
  assignmentBlocks?: SubmissionBlock[]
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

// ============================================================
// Interactive Assignment Types (hands-on lab exercises)
// ============================================================

export type AssignmentElementType =
  | 'assignment_header'
  | 'exercise_group'
  | 'step'
  | 'write_it_down'
  | 'data_table'
  | 'code_task'
  | 'callout'
  | 'verification'
  | 'solution_step'
  | 'reference'

export type AssignmentComplexityLevel = 'exploratory' | 'configuration' | 'development'

export interface AssignmentHeader {
  type: 'assignment_header'
  id: string
  lessonTitle: string
  scenario: string
  prerequisites: string[]
  objectives: string[]
  estimatedMinutes: number
  complexityLevel: AssignmentComplexityLevel
  skillsTested: string[]
}

export interface ExerciseGroup {
  type: 'exercise_group'
  id: string
  exerciseNumber: number
  title: string
  description: string
  variant?: 'lab' | 'activity' | 'exercise' | 'cookbook'
}

export interface StepBlock {
  type: 'step'
  id: string
  exerciseId: string
  stepNumber: number
  instruction: string
  substeps?: { letter: string; text: string }[]
  embeddedQuestion?: string
  requiresAction: boolean
}

export interface WriteItDownBlock {
  type: 'write_it_down'
  id: string
  exerciseId: string
  question: string
  referenceAnswer?: string
  answerType: 'short' | 'paragraph' | 'observation'
  hints?: string[]
  skillTested?: string
}

export interface DataTableBlock {
  type: 'data_table'
  id: string
  exerciseId: string
  context?: string
  headers: string[]
  rows: string[][]
  caption?: string
}

export interface CodeTaskBlock {
  type: 'code_task'
  id: string
  exerciseId: string
  language: 'gosu' | 'xml' | 'yaml' | 'json' | 'text'
  prompt: string
  context?: string
  starterCode?: string
  hints?: string[]
  referenceSolution?: string
  skillTested?: string
}

export interface AssignmentCalloutBlock {
  type: 'callout'
  id: string
  variant: 'hint' | 'important' | 'best_practice' | 'tip' | 'cookbook_recipe' | 'warning'
  title: string
  content: string
}

export interface VerificationBlock {
  type: 'verification'
  id: string
  exerciseId: string
  title: string
  steps: { text: string; verificationNote?: string }[]
}

export interface SolutionStepBlock {
  type: 'solution_step'
  id: string
  exerciseId: string
  stepNumber: number
  instruction: string
  substeps?: { letter: string; text: string }[]
  codeSnippet?: { language: string; code: string; explanation?: string }
  screenshotCaption?: string
}

export interface ReferenceBlock {
  type: 'reference'
  id: string
  variant: 'review' | 'tip'
  question: string
  explanation: string
}

export type InteractiveAssignmentBlock =
  | AssignmentHeader
  | ExerciseGroup
  | StepBlock
  | WriteItDownBlock
  | DataTableBlock
  | CodeTaskBlock
  | AssignmentCalloutBlock
  | VerificationBlock
  | SolutionStepBlock
  | ReferenceBlock

export interface InteractiveAssignment {
  assignmentId: string
  chapterSlug: string
  lessonNumber: number
  title: string
  complexityLevel: AssignmentComplexityLevel
  estimatedMinutes: number
  totalExercises: number
  skillsCovered: string[]
  blocks: InteractiveAssignmentBlock[]
  synthesizedAt: string
}

// --- Assignment Work Record Types ---

export interface ExerciseWorkRecord {
  exerciseId: string
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
  timeSpentSeconds: number
  stepsCompleted: string[]
  writeItDownAnswers: Record<string, {
    answer: string
    correct?: boolean
    feedback?: string
    gradedAt?: string
    attempts: number
  }>
  codeSubmissions: Record<string, {
    code: string
    feedback?: string
    score?: number
    submittedAt: string
  }>
  verificationChecks: string[]
  hintsRevealed: number
  solutionStepsRevealed: number
  guruQueriesCount: number
}

export interface AssignmentWorkRecord {
  assignmentId: string
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
  totalTimeSpentSeconds: number
  exercises: Record<string, ExerciseWorkRecord>
  overallScore?: number
  totalHintsUsed: number
  totalSolutionReveals: number
  totalGuruQueries: number
  skillsScores: Record<string, number>
}
