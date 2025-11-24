/**
 * Quiz System Types
 * ACAD-010
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type QuestionType =
  | 'multiple_choice_single'
  | 'multiple_choice_multiple'
  | 'true_false'
  | 'code';

export type Difficulty = 'easy' | 'medium' | 'hard';

// ============================================================================
// QUIZ QUESTIONS
// ============================================================================

/**
 * Base Quiz Question
 */
export interface BaseQuizQuestion {
  id: string;
  topicId: string | null;
  questionText: string;
  explanation: string | null;
  difficulty: Difficulty;
  points: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Multiple Choice Single Answer Question
 */
export interface MultipleChoiceSingleQuestion extends BaseQuizQuestion {
  questionType: 'multiple_choice_single';
  options: string[]; // ["Option A", "Option B", "Option C", "Option D"]
  correctAnswers: [number]; // [2] - single index
  codeLanguage?: never;
}

/**
 * Multiple Choice Multiple Answers Question
 */
export interface MultipleChoiceMultipleQuestion extends BaseQuizQuestion {
  questionType: 'multiple_choice_multiple';
  options: string[]; // ["Option A", "Option B", "Option C", "Option D"]
  correctAnswers: number[]; // [0, 2, 3] - multiple indices
  codeLanguage?: never;
}

/**
 * True/False Question
 */
export interface TrueFalseQuestion extends BaseQuizQuestion {
  questionType: 'true_false';
  options: ['True', 'False']; // Always exactly these two
  correctAnswers: [0 | 1]; // [0] for True, [1] for False
  codeLanguage?: never;
}

/**
 * Code Question
 */
export interface CodeQuestion extends BaseQuizQuestion {
  questionType: 'code';
  options: string[]; // Can be empty or contain starter code
  correctAnswers: number[]; // Empty for manual grading, or indices for auto-grading
  codeLanguage: string; // 'javascript', 'python', 'java', etc.
}

/**
 * Discriminated Union of All Question Types
 */
export type QuizQuestion =
  | MultipleChoiceSingleQuestion
  | MultipleChoiceMultipleQuestion
  | TrueFalseQuestion
  | CodeQuestion;

/**
 * Question for Creating/Updating (without metadata)
 */
export type CreateQuizQuestionInput = Omit<
  QuizQuestion,
  'id' | 'createdBy' | 'createdAt' | 'updatedAt'
>;

export type UpdateQuizQuestionInput = Partial<
  Omit<QuizQuestion, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>
>;

// ============================================================================
// QUIZ SETTINGS
// ============================================================================

export interface QuizSettings {
  id: string;
  topicId: string;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  passingThreshold: number; // 0-100 percentage
  showCorrectAnswers: boolean;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  allowReview: boolean;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateQuizSettingsInput = Partial<
  Omit<QuizSettings, 'id' | 'topicId' | 'createdAt' | 'updatedAt'>
>;

// ============================================================================
// QUIZ ATTEMPTS
// ============================================================================

export interface QuizAttempt {
  id: string;
  userId: string;
  topicId: string;
  enrollmentId: string;
  attemptNumber: number;
  startedAt: Date;
  submittedAt: Date | null;
  timeTakenSeconds: number | null;
  answers: QuizAnswers; // { "question-id": [selected indices] }
  totalQuestions: number;
  correctAnswers: number | null;
  score: number | null; // 0-100
  passed: boolean | null;
  xpEarned: number;
  createdAt: Date;
}

/**
 * Quiz Answers Format
 * Maps question IDs to selected answer indices
 */
export type QuizAnswers = Record<string, number[]>;

export interface StartQuizAttemptInput {
  topicId: string;
  enrollmentId: string;
}

export interface SubmitQuizAttemptInput {
  attemptId: string;
  answers: QuizAnswers;
}

// ============================================================================
// QUESTION BANK
// ============================================================================

export type QuestionBankItem = QuizQuestion & {
  createdByName: string;
  timesUsed: number;
  uniqueStudents: number;
  avgCorrectPercentage: number;
}

export interface QuestionBankFilters {
  topicId?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  searchText?: string;
  includePublic?: boolean;
  createdBy?: string;
}

// ============================================================================
// QUIZ ANALYTICS
// ============================================================================

export interface QuizAnalytics {
  topicId: string;
  topicTitle: string;
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseTitle: string;
  totalQuestions: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;
  totalAttempts: number;
  uniqueStudents: number;
  passedAttempts: number;
  avgScore: number;
  avgTimeSeconds: number;
  passRate: number;
}

// ============================================================================
// BULK IMPORT
// ============================================================================

/**
 * Bulk Import Question Format
 */
export interface BulkImportQuestion {
  question_text: string;
  question_type: QuestionType;
  options: string[];
  correct_answers: number[];
  explanation?: string;
  difficulty?: Difficulty;
  points?: number;
  code_language?: string;
  is_public?: boolean;
}

export interface BulkImportResult {
  success: boolean;
  importedCount: number;
  errors: Array<{
    question: string;
    error: string;
  }>;
}

/**
 * CSV Import Format
 * question_text,question_type,options,correct_answers,difficulty,points,explanation
 */
export type CSVImportRow = [
  string, // question_text
  QuestionType, // question_type
  string, // options (JSON array)
  string, // correct_answers (JSON array)
  Difficulty, // difficulty
  number, // points
  string?, // explanation
  string?, // code_language
  boolean? // is_public
];

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface QuizBuilderProps {
  topicId: string;
  onSave?: (questions: QuizQuestion[]) => void;
  onCancel?: () => void;
}

export interface QuestionEditorProps {
  question?: QuizQuestion;
  onChange: (question: CreateQuizQuestionInput) => void;
  onDelete?: () => void;
}

export interface QuestionBankProps {
  filters?: QuestionBankFilters;
  onSelect?: (question: QuizQuestion) => void;
  multiSelect?: boolean;
}

export interface QuizPreviewProps {
  topicId: string;
  showCorrectAnswers?: boolean;
}

export interface BulkImportModalProps {
  topicId: string;
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: BulkImportResult) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate question based on type
 */
export function validateQuizQuestion(
  question: CreateQuizQuestionInput
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Common validation
  if (!question.questionText || question.questionText.length < 10) {
    errors.push('Question text must be at least 10 characters');
  }

  if (!question.options || !Array.isArray(question.options)) {
    errors.push('Options must be an array');
  }

  if (!question.correctAnswers || !Array.isArray(question.correctAnswers)) {
    errors.push('Correct answers must be an array');
  }

  // Type-specific validation
  switch (question.questionType) {
    case 'true_false':
      if (question.options.length !== 2) {
        errors.push('True/False questions must have exactly 2 options');
      }
      if (question.correctAnswers.length !== 1) {
        errors.push('True/False questions must have exactly 1 correct answer');
      }
      break;

    case 'multiple_choice_single':
      if (question.options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
      if (question.correctAnswers.length !== 1) {
        errors.push('Single answer questions must have exactly 1 correct answer');
      }
      break;

    case 'multiple_choice_multiple':
      if (question.options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
      if (question.correctAnswers.length < 1) {
        errors.push('Multiple answer questions must have at least 1 correct answer');
      }
      break;

    case 'code':
      if (!question.codeLanguage) {
        errors.push('Code questions must have a code language specified');
      }
      break;
  }

  // Validate correct answers are within bounds
  const maxIndex = question.options.length - 1;
  for (const answerIndex of question.correctAnswers) {
    if (answerIndex < 0 || answerIndex > maxIndex) {
      errors.push(`Correct answer index ${answerIndex} is out of bounds`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate quiz score
 */
export function calculateQuizScore(
  questions: QuizQuestion[],
  answers: QuizAnswers
): {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  passingThreshold: number;
} {
  const totalQuestions = questions.length;
  let correctAnswers = 0;

  for (const question of questions) {
    const userAnswers = answers[question.id] || [];
    const correctAnswerSet = new Set(question.correctAnswers);
    const userAnswerSet = new Set(userAnswers);

    // Check if answers match exactly
    if (
      correctAnswerSet.size === userAnswerSet.size &&
      [...correctAnswerSet].every((ans) => userAnswerSet.has(ans))
    ) {
      correctAnswers++;
    }
  }

  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passingThreshold = 70; // Default, should come from settings

  return {
    totalQuestions,
    correctAnswers,
    score,
    passed: score >= passingThreshold,
    passingThreshold,
  };
}

/**
 * Format question type for display
 */
export function formatQuestionType(type: QuestionType): string {
  const typeMap: Record<QuestionType, string> = {
    multiple_choice_single: 'Multiple Choice (Single)',
    multiple_choice_multiple: 'Multiple Choice (Multiple)',
    true_false: 'True/False',
    code: 'Code',
  };
  return typeMap[type];
}

/**
 * Format difficulty for display
 */
export function formatDifficulty(difficulty: Difficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  const colorMap: Record<Difficulty, string> = {
    easy: 'green',
    medium: 'yellow',
    hard: 'red',
  };
  return colorMap[difficulty];
}

/**
 * Parse CSV row to question
 */
export function parseCSVRow(row: string[]): BulkImportQuestion | null {
  try {
    return {
      question_text: row[0],
      question_type: row[1] as QuestionType,
      options: JSON.parse(row[2]),
      correct_answers: JSON.parse(row[3]),
      difficulty: (row[4] as Difficulty) || 'medium',
      points: parseInt(row[5]) || 1,
      explanation: row[6] || undefined,
      code_language: row[7] || undefined,
      is_public: row[8] === 'true' || false,
    };
  } catch (error) {
    console.error('Failed to parse CSV row:', error);
    return null;
  }
}

/**
 * Convert questions to CSV format
 */
export function questionsToCSV(questions: QuizQuestion[]): string {
  const headers = [
    'question_text',
    'question_type',
    'options',
    'correct_answers',
    'difficulty',
    'points',
    'explanation',
    'code_language',
    'is_public',
  ];

  const rows = questions.map((q) => [
    `"${q.questionText.replace(/"/g, '""')}"`,
    q.questionType,
    JSON.stringify(q.options),
    JSON.stringify(q.correctAnswers),
    q.difficulty,
    q.points.toString(),
    q.explanation ? `"${q.explanation.replace(/"/g, '""')}"` : '',
    q.questionType === 'code' ? q.codeLanguage : '',
    q.isPublic.toString(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Randomize array (Fisher-Yates shuffle)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create empty question template
 */
export function createEmptyQuestion(type: QuestionType): CreateQuizQuestionInput {
  const base = {
    topicId: null,
    questionText: '',
    explanation: null,
    difficulty: 'medium' as Difficulty,
    points: 1,
    isPublic: false,
  };

  switch (type) {
    case 'multiple_choice_single':
      return {
        ...base,
        questionType: 'multiple_choice_single',
        options: ['', '', '', ''],
        correctAnswers: [0],
      };

    case 'multiple_choice_multiple':
      return {
        ...base,
        questionType: 'multiple_choice_multiple',
        options: ['', '', '', ''],
        correctAnswers: [],
      };

    case 'true_false':
      return {
        ...base,
        questionType: 'true_false',
        options: ['True', 'False'],
        correctAnswers: [0],
      };

    case 'code':
      return {
        ...base,
        questionType: 'code',
        options: [],
        correctAnswers: [],
        codeLanguage: 'javascript',
      };
  }
}

/**
 * Format time taken
 */
export function formatTimeTaken(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate points earned
 */
export function calculatePointsEarned(
  questions: QuizQuestion[],
  answers: QuizAnswers
): number {
  let points = 0;

  for (const question of questions) {
    const userAnswers = answers[question.id] || [];
    const correctAnswerSet = new Set(question.correctAnswers);
    const userAnswerSet = new Set(userAnswers);

    // Award points if answer is correct
    if (
      correctAnswerSet.size === userAnswerSet.size &&
      [...correctAnswerSet].every((ans) => userAnswerSet.has(ans))
    ) {
      points += question.points;
    }
  }

  return points;
}

// ============================================================================
// QUIZ ENGINE (ACAD-011)
// ============================================================================

/**
 * Quiz Attempt Result (from submit_quiz_attempt function)
 */
export interface QuizAttemptResult {
  attemptId: string;
  score: number; // 0-100
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  results: QuestionResult[];
}

/**
 * Individual Question Result
 */
export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswers: number[];
  correctAnswers: number[];
  pointsEarned: number;
  pointsPossible: number;
}

/**
 * Quiz Attempt Summary (for history)
 */
export interface QuizAttemptSummary {
  id: string;
  attemptNumber: number;
  startedAt: Date;
  submittedAt: Date | null;
  score: number | null;
  passed: boolean | null;
  correctAnswers: number | null;
  totalQuestions: number;
  timeTakenSeconds: number | null;
  xpEarned: number;
}

/**
 * Best Quiz Score
 */
export interface BestQuizScore {
  bestScore: number;
  bestAttemptId: string;
  totalAttempts: number;
  passedAttempts: number;
}

/**
 * Detailed Attempt Results (for review)
 */
export interface DetailedAttemptResults {
  attemptId: string;
  userId: string;
  topicId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  startedAt: Date;
  submittedAt: Date;
  timeTakenSeconds: number;
  xpEarned: number;
  answers: QuizAnswers;
  questions: QuizQuestion[];
}

/**
 * Quiz Taking Props
 */
export interface QuizTakerProps {
  topicId: string;
  enrollmentId: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  onComplete?: (result: QuizAttemptResult) => void;
}

/**
 * Quiz Timer Props
 */
export interface QuizTimerProps {
  timeLimitMinutes: number;
  startTime: Date;
  onTimeExpired: () => void;
}

/**
 * Question Display Props (for taking quiz)
 */
export interface QuestionDisplayProps {
  question: QuizQuestion;
  questionNumber: number;
  selectedAnswers: number[];
  onAnswerChange: (answers: number[]) => void;
  showResults?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
}

/**
 * Quiz Results Props
 */
export interface QuizResultsProps {
  result: QuizAttemptResult;
  questions: QuizQuestion[];
  settings: QuizSettings;
  onRetry?: () => void;
  onViewHistory?: () => void;
}

/**
 * Quiz Attempt History Props
 */
export interface QuizAttemptHistoryProps {
  attempts: QuizAttemptSummary[];
  bestScore?: BestQuizScore;
  onViewAttempt?: (attemptId: string) => void;
}

/**
 * Calculate remaining time from start
 */
export function calculateRemainingTime(
  startTime: Date,
  timeLimitMinutes: number
): {
  remainingSeconds: number;
  isExpired: boolean;
  percentRemaining: number;
} {
  const now = new Date();
  const elapsed = (now.getTime() - startTime.getTime()) / 1000; // seconds
  const totalSeconds = timeLimitMinutes * 60;
  const remainingSeconds = Math.max(0, totalSeconds - elapsed);
  const isExpired = remainingSeconds === 0;
  const percentRemaining = (remainingSeconds / totalSeconds) * 100;

  return {
    remainingSeconds: Math.floor(remainingSeconds),
    isExpired,
    percentRemaining: Math.round(percentRemaining),
  };
}

/**
 * Format seconds to MM:SS
 */
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get time warning color
 */
export function getTimeWarningColor(percentRemaining: number): string {
  if (percentRemaining <= 10) return 'red';
  if (percentRemaining <= 25) return 'yellow';
  return 'green';
}

/**
 * Check if user can retake quiz
 */
export function canRetakeQuiz(
  attempts: QuizAttemptSummary[],
  maxAttempts: number | null
): boolean {
  if (maxAttempts === null) return true; // Unlimited
  return attempts.length < maxAttempts;
}

/**
 * Get attempt status badge
 */
export function getAttemptStatusBadge(attempt: QuizAttemptSummary): {
  label: string;
  color: string;
} {
  if (!attempt.submittedAt) {
    return { label: 'In Progress', color: 'blue' };
  }
  if (attempt.passed) {
    return { label: 'Passed', color: 'green' };
  }
  return { label: 'Failed', color: 'red' };
}

/**
 * Calculate quiz statistics
 */
export function calculateQuizStatistics(attempts: QuizAttemptSummary[]): {
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  averageScore: number;
  bestScore: number;
  passRate: number;
} {
  const completedAttempts = attempts.filter((a) => a.submittedAt !== null);
  const passedAttempts = completedAttempts.filter((a) => a.passed);

  const scores = completedAttempts
    .map((a) => a.score)
    .filter((s): s is number => s !== null);

  const averageScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const passRate =
    completedAttempts.length > 0 ? (passedAttempts.length / completedAttempts.length) * 100 : 0;

  return {
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    passedAttempts: passedAttempts.length,
    averageScore: Math.round(averageScore),
    bestScore: Math.round(bestScore),
    passRate: Math.round(passRate),
  };
}
