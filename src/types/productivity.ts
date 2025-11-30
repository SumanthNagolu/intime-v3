/**
 * TypeScript Type Definitions for Productivity Tracking
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 4)
 * Stories: AI-PROD-001, AI-PROD-002, AI-PROD-003, AI-TWIN-001
 *
 * @module types/productivity
 */

// ============================================================================
// ACTIVITY CLASSIFICATION
// ============================================================================

/**
 * Activity categories for screenshot classification
 */
export type ActivityCategory =
  | 'coding'
  | 'email'
  | 'meeting'
  | 'documentation'
  | 'research'
  | 'social_media'
  | 'idle';

/**
 * Screenshot metadata record
 */
export interface ScreenshotMetadata {
  id: string;
  orgId: string;
  userId: string;
  filename: string;
  fileSize: number;
  capturedAt: string; // ISO timestamp
  analyzed: boolean;
  activityCategory?: ActivityCategory;
  confidence?: number; // 0.00 to 1.00
  reasoning?: string;
  isSensitive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/**
 * Activity classification result
 */
export interface ActivityClassification {
  category: ActivityCategory;
  confidence: number; // 0.00 to 1.00
  reasoning: string;
  timestamp: string;
}

/**
 * Classification request payload
 */
export interface ClassificationRequest {
  screenshotId: string;
}

/**
 * Classification response
 */
export interface ClassificationResponse {
  success: boolean;
  classification?: ActivityClassification;
  error?: string;
}

/**
 * Batch classification request
 */
export interface BatchClassificationRequest {
  userId: string;
  date: string; // YYYY-MM-DD
}

/**
 * Batch classification response
 */
export interface BatchClassificationResponse {
  success: boolean;
  classifiedCount: number;
  totalCount: number;
  errors?: string[];
}

// ============================================================================
// PRODUCTIVITY REPORTS
// ============================================================================

/**
 * Activity breakdown by category
 */
export interface ActivityBreakdown {
  category: ActivityCategory;
  count: number;
  percentage: number;
  hours: number;
}

/**
 * Daily productivity report
 */
export interface ProductivityReport {
  id: string;
  orgId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  summary: string; // AI-generated narrative
  productiveHours: number;
  topActivities: ActivityBreakdown[];
  insights: string[];
  recommendations: string[];
  totalScreenshots: number;
  analyzedScreenshots: number;
  activityBreakdown: Record<ActivityCategory, number>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate report request
 */
export interface GenerateReportRequest {
  userId: string;
  date: string; // YYYY-MM-DD
}

/**
 * Generate report response
 */
export interface GenerateReportResponse {
  success: boolean;
  report?: ProductivityReport;
  error?: string;
}

// ============================================================================
// EMPLOYEE AI TWINS
// ============================================================================

/**
 * Employee AI Twin role types
 *
 * Partner Approach: Each partner handles end-to-end workflows
 * Hierarchy: Flat with CEO oversight
 */
export type TwinRole =
  // Leadership
  | 'ceo'              // Strategic overview, cross-pillar coordination
  | 'admin'            // System/org administration
  // Revenue Partners (End-to-End ownership)
  | 'recruiter'        // Full recruiting cycle: sourcing → placement
  | 'bench_sales'      // Full bench cycle: onboard → placement → extension
  | 'talent_acquisition'  // Full TA cycle: prospecting → deal close
  // Support Partners
  | 'hr'               // People ops, compliance, performance
  | 'immigration'      // Visa tracking, compliance, cross-border
  | 'trainer';         // Academy/training operations

/**
 * Twin hierarchy mapping
 * Flat structure: CEO oversees all, no intermediate hierarchy
 */
export const TWIN_HIERARCHY: Record<TwinRole, TwinRole | null> = {
  ceo: null,                    // Top level
  admin: 'ceo',
  recruiter: 'ceo',
  bench_sales: 'ceo',
  talent_acquisition: 'ceo',
  hr: 'ceo',
  immigration: 'ceo',
  trainer: 'ceo',
};

/**
 * Twin role display names
 */
export const TWIN_ROLE_DISPLAY: Record<TwinRole, string> = {
  ceo: 'CEO',
  admin: 'Administrator',
  recruiter: 'Recruiter',
  bench_sales: 'Bench Sales',
  talent_acquisition: 'Talent Acquisition',
  hr: 'HR',
  immigration: 'Immigration',
  trainer: 'Trainer',
};

/**
 * Cross-pollination event types for inter-twin communication
 */
export type CrossPollinationEvent =
  | 'placement_complete'      // Recruiter → Bench Sales (new consultant)
  | 'bench_ending'            // Bench Sales → TA (renewal opportunity)
  | 'training_graduate'       // Trainer → Recruiter (ready for placement)
  | 'deal_closed'             // TA → Recruiting (new positions)
  | 'escalation'              // Any → CEO (needs attention)
  | 'approval_needed'         // Any → Approver (workflow)
  | 'milestone_reached'       // Broadcast (celebration)
  | 'cross_sell_opportunity'; // Any → TA (upsell potential)

/**
 * Interaction types with AI Twin
 */
export type InteractionType =
  | 'morning_briefing'
  | 'suggestion'
  | 'question'
  | 'feedback';

/**
 * Twin interaction record
 */
export interface TwinInteraction {
  id: string;
  orgId: string;
  userId: string;
  twinRole: TwinRole;
  interactionType: InteractionType;
  prompt?: string; // NULL for briefings
  response: string;
  context?: Record<string, unknown>;
  wasHelpful?: boolean;
  userFeedback?: string;
  modelUsed: string;
  tokensUsed: number;
  costUsd: number;
  latencyMs: number;
  createdAt: string;
}

/**
 * Morning briefing request
 */
export interface MorningBriefingRequest {
  userId: string;
  role: TwinRole;
}

/**
 * Morning briefing response
 */
export interface MorningBriefingResponse {
  success: boolean;
  briefing?: string;
  error?: string;
}

/**
 * Proactive suggestion priority levels
 */
export type SuggestionPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Proactive suggestion record
 */
export interface ProactiveSuggestion {
  id: string;
  orgId: string;
  userId: string;
  twinRole: TwinRole;
  suggestion: string;
  reasoning?: string;
  priority: SuggestionPriority;
  category?: string;
  delivered: boolean;
  deliveredAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  actioned: boolean;
  actionedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Generate suggestion request
 */
export interface GenerateSuggestionRequest {
  userId: string;
  role: TwinRole;
}

/**
 * Generate suggestion response
 */
export interface GenerateSuggestionResponse {
  success: boolean;
  suggestion?: ProactiveSuggestion;
  error?: string;
}

/**
 * Twin query request
 */
export interface TwinQueryRequest {
  userId: string;
  role: TwinRole;
  question: string;
  conversationId?: string;
}

/**
 * Twin query response
 */
export interface TwinQueryResponse {
  success: boolean;
  answer?: string;
  conversationId?: string;
  error?: string;
}

// ============================================================================
// SCREENSHOT AGENT (Electron App)
// ============================================================================

/**
 * Screenshot agent configuration
 */
export interface ScreenshotAgentConfig {
  userId: string;
  captureInterval: number; // milliseconds (default: 30000)
  compressionQuality: number; // 0-100 (default: 50)
  maxWidth: number; // pixels (default: 1280)
  sensitiveKeywords: string[]; // window titles to skip
}

/**
 * Screenshot upload result
 */
export interface ScreenshotUploadResult {
  success: boolean;
  filename?: string;
  error?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error codes for productivity tracking
 */
export const ProductivityErrorCodes = {
  SCREENSHOT_UPLOAD_FAILED: 'SCREENSHOT_UPLOAD_FAILED',
  CLASSIFICATION_FAILED: 'CLASSIFICATION_FAILED',
  REPORT_GENERATION_FAILED: 'REPORT_GENERATION_FAILED',
  TWIN_QUERY_FAILED: 'TWIN_QUERY_FAILED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT: 'INVALID_INPUT',
} as const;

/**
 * Productivity tracking error class
 */
export class ProductivityError extends Error {
  constructor(
    message: string,
    public code: keyof typeof ProductivityErrorCodes,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProductivityError';
  }
}

// ============================================================================
// SERVICE LAYER INTERFACES
// ============================================================================

/**
 * Screenshot agent interface (Electron app)
 */
export interface IScreenshotAgent {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isActive(): boolean;
  getConfig(): ScreenshotAgentConfig;
  updateConfig(config: Partial<ScreenshotAgentConfig>): void;
}

/**
 * Activity classifier interface
 */
export interface IActivityClassifier {
  classifyScreenshot(screenshotId: string): Promise<ActivityClassification>;
  batchClassify(userId: string, date: string): Promise<number>;
  getDailySummary(userId: string, date: string): Promise<{
    totalScreenshots: number;
    analyzed: number;
    byCategory: Record<ActivityCategory, number>;
    productiveHours: number;
  }>;
}

/**
 * Timeline generator interface
 */
export interface ITimelineGenerator {
  generateDailyReport(userId: string, date: string): Promise<ProductivityReport>;
  batchGenerateReports(date: string): Promise<number>;
}

/**
 * Employee twin interface
 */
export interface IEmployeeTwin {
  generateMorningBriefing(): Promise<string>;
  generateProactiveSuggestion(): Promise<string | null>;
  query(question: string, conversationId?: string): Promise<{
    answer: string;
    conversationId: string;
  }>;
  getRole(): TwinRole;
  getInteractionHistory(limit?: number): Promise<TwinInteraction[]>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Daily activity summary
 */
export interface DailyActivitySummary {
  totalScreenshots: number;
  analyzed: number;
  byCategory: Record<ActivityCategory, number>;
  productiveHours: number;
}

/**
 * Twin context data (role-specific)
 */
export interface TwinContext {
  employeeName?: string;
  role: TwinRole;
  [key: string]: unknown; // Role-specific fields
}

/**
 * AI request options
 */
export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}
