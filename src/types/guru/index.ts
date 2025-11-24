/**
 * Guidewire Guru Type Definitions
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 3)
 * Stories: AI-GURU-001 through AI-GURU-004
 *
 * Type definitions for all Guidewire Guru AI agents.
 *
 * @module types/guru
 */

// ============================================================================
// Common Types
// ============================================================================

export interface GuruError extends Error {
  name: 'GuruError';
  code: keyof typeof GuruErrorCodes;
  details?: unknown;
}

export const GuruErrorCodes = {
  AGENT_FAILED: 'AGENT_FAILED',
  RAG_SEARCH_FAILED: 'RAG_SEARCH_FAILED',
  MEMORY_FAILED: 'MEMORY_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// ============================================================================
// Code Mentor Agent (AI-GURU-001)
// ============================================================================

export interface CodeMentorInput {
  /** Student ID */
  studentId: string;
  /** Student's question */
  question: string;
  /** Current module being studied */
  currentModule: string;
  /** Optional conversation ID for context */
  conversationId?: string;
  /** Optional code snippet context */
  codeContext?: string;
}

export interface CodeMentorOutput {
  /** Socratic response (question-based guidance) */
  response: string;
  /** Conversation ID for follow-up */
  conversationId: string;
  /** Relevant documentation snippets */
  documentationHints: string[];
  /** Suggested next steps */
  nextSteps: string[];
  /** Helpful rating (optional, user feedback) */
  wasHelpful?: boolean;
  /** Tokens used in AI request */
  tokensUsed?: number;
  /** Cost in USD */
  cost?: number;
}

export interface StudentProgress {
  studentId: string;
  currentModule: string;
  completedModules: string[];
  struggleAreas: string[];
  lastActivityAt: string;
  masteryScore: number; // 0-100
}

// ============================================================================
// Resume Builder Agent (AI-GURU-002)
// ============================================================================

export type ResumeFormat = 'pdf' | 'docx' | 'linkedin' | 'json';

export interface ResumeBuilderInput {
  /** Student ID */
  studentId: string;
  /** Desired output format */
  format: ResumeFormat;
  /** Optional version to retrieve/update */
  versionId?: string;
  /** Include Guidewire certifications */
  includeCertifications?: boolean;
  /** Include course projects */
  includeProjects?: boolean;
  /** Target job description for ATS optimization */
  targetJobDescription?: string;
}

export interface ResumeBuilderOutput {
  /** Resume content (format-specific) */
  content: string | Buffer;
  /** Version ID */
  versionId: string;
  /** ATS optimization score (0-100) */
  atsScore: number;
  /** Keyword matches */
  keywordMatches: string[];
  /** Improvement suggestions */
  suggestions: string[];
  /** Format type */
  format: ResumeFormat;
  /** Created/updated timestamp */
  timestamp: string;
  /** Tokens used in AI request */
  tokensUsed?: number;
  /** Cost in USD */
  cost?: number;
}

export interface ResumeVersion {
  id: string;
  studentId: string;
  version: number;
  format: ResumeFormat;
  content: any;
  atsScore: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Project Planner Agent (AI-GURU-003)
// ============================================================================

export interface ProjectPlannerInput {
  /** Student ID */
  studentId: string;
  /** Project type (e.g., "PolicyCenter Capstone") */
  projectType: string;
  /** Guidewire module focus */
  guidewireModule: string;
  /** Optional existing project ID */
  projectId?: string;
  /** Student's skill level (1-5) */
  skillLevel?: number;
}

export interface ProjectPlannerOutput {
  /** Project ID */
  projectId: string;
  /** Project title */
  title: string;
  /** Project description */
  description: string;
  /** Milestones with deadlines */
  milestones: ProjectMilestone[];
  /** Estimated completion time (hours) */
  estimatedHours: number;
  /** Guidewire-specific requirements */
  guidewireRequirements: string[];
  /** Success criteria */
  successCriteria: string[];
  /** Next action */
  nextAction: string;
  /** Tokens used in AI request */
  tokensUsed?: number;
  /** Cost in USD */
  cost?: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  tasks: ProjectTask[];
}

export interface ProjectTask {
  id: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
}

// ============================================================================
// Interview Coach Agent (AI-GURU-004)
// ============================================================================

export interface InterviewCoachInput {
  /** Student ID */
  studentId: string;
  /** Interview type */
  interviewType: 'technical' | 'behavioral' | 'guidewire';
  /** Guidewire module focus */
  guidewireModule?: string;
  /** Mock interview session ID */
  sessionId?: string;
  /** Student's answer (for evaluation) */
  answer?: string;
  /** Question being answered */
  questionId?: string;
}

export interface InterviewCoachOutput {
  /** Session ID */
  sessionId: string;
  /** Interview question */
  question: string;
  /** Question ID */
  questionId: string;
  /** STAR method components (for behavioral) */
  starComponents?: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
  /** Scoring (if answer provided) */
  score?: {
    overall: number; // 1-10
    technical: number; // 1-10
    communication: number; // 1-10
    confidence: number; // 1-10
  };
  /** Detailed feedback */
  feedback?: string[];
  /** Improvement suggestions */
  suggestions?: string[];
  /** Next question */
  nextQuestion?: string;
  /** Tokens used in AI request */
  tokensUsed?: number;
  /** Cost in USD */
  cost?: number;
}

export interface InterviewSession {
  id: string;
  studentId: string;
  interviewType: 'technical' | 'behavioral' | 'guidewire';
  guidewireModule?: string;
  questions: InterviewQuestion[];
  averageScore: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  answer?: string;
  score?: number;
  feedback?: string;
  askedAt: string;
  answeredAt?: string;
}

// ============================================================================
// Database Schema Types
// ============================================================================

export interface GuruInteraction {
  id: string;
  orgId: string;
  studentId: string;
  agentType: 'code_mentor' | 'resume_builder' | 'project_planner' | 'interview_coach';
  conversationId?: string;
  input: any;
  output: any;
  wasHelpful?: boolean;
  userFeedback?: string;
  modelUsed: string;
  tokensUsed: number;
  costUsd: number;
  latencyMs: number;
  createdAt: string;
}

export interface StudentProgressRecord {
  id: string;
  studentId: string;
  currentModule: string;
  completedModules: string[];
  struggleAreas: string[];
  masteryScore: number;
  totalInteractions: number;
  helpfulInteractions: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}
