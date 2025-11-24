/**
 * AI Mentor Types
 * ACAD-013: AI Mentor Integration
 *
 * Type definitions for AI-powered 24/7 mentorship with Socratic prompting
 */

// ============================================================================
// DATABASE TYPES
// ============================================================================

/**
 * AI Mentor Chat - Single Q&A interaction with metrics
 */
export interface AIMentorChat {
  id: string;
  userId: string;
  topicId: string | null;
  courseId: string | null;

  // Conversation
  question: string;
  response: string;
  conversationContext: ConversationMessage[];

  // Metrics
  tokensUsed: number;
  responseTimeMs: number;
  model: string;
  costUsd: number;

  // Quality Control
  studentRating: number | null; // 1-5
  studentFeedback: string | null;
  flaggedForReview: boolean;
  escalatedToTrainer: boolean;
  escalationReason: string | null;

  // Timestamps
  createdAt: Date;
  ratedAt: Date | null;
  escalatedAt: Date | null;
}

/**
 * Conversation message for context
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

/**
 * Rate limiting per user
 */
export interface AIMentorRateLimit {
  id: string;
  userId: string;

  // Limits per period
  hourlyCount: number;
  dailyCount: number;
  monthlyCount: number;

  // Reset timestamps
  hourlyResetAt: Date;
  dailyResetAt: Date;
  monthlyResetAt: Date;

  // Cost tracking
  monthlyCostUsd: number;

  updatedAt: Date;
}

/**
 * Conversation session grouping related chats
 */
export interface AIMentorSession {
  id: string;
  userId: string;
  topicId: string | null;
  courseId: string | null;

  title: string | null; // Auto-generated from first question
  messageCount: number;
  totalTokens: number;
  totalCostUsd: number;

  startedAt: Date;
  lastMessageAt: Date;
  endedAt: Date | null;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Daily aggregated statistics
 */
export interface AIMentorDailyStats {
  date: Date;
  totalChats: number;
  uniqueUsers: number;
  totalTokens: number;
  totalCost: number;
  avgResponseTimeMs: number;
  avgRating: number;
  flaggedCount: number;
  escalatedCount: number;
}

/**
 * Per-student analytics
 */
export interface AIMentorStudentStats {
  userId: string;
  fullName: string;
  email: string;
  totalChats: number;
  totalTokens: number;
  totalCost: number;
  avgResponseTimeMs: number;
  avgRating: number;
  flaggedCount: number;
  escalatedCount: number;
  lastChatAt: Date | null;
}

/**
 * Topic-level analytics (which topics need most help)
 */
export interface AIMentorTopicStats {
  topicId: string;
  topicTitle: string;
  courseTitle: string;
  totalChats: number;
  uniqueStudents: number;
  avgRating: number;
  escalationCount: number;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Ask AI Mentor - Submit question
 */
export interface AskMentorInput {
  question: string;
  topicId?: string | null;
  courseId?: string | null;
  sessionId?: string | null; // Optional: continue existing session
  conversationHistory?: ConversationMessage[]; // Optional: for context
}

/**
 * Rate mentor response
 */
export interface RateMentorInput {
  chatId: string;
  rating: number; // 1-5
  feedback?: string;
}

/**
 * Flag chat for review
 */
export interface FlagChatInput {
  chatId: string;
  reason: string;
}

/**
 * Escalate to trainer
 */
export interface EscalateChatInput {
  chatId: string;
  reason: string;
}

/**
 * Create new session
 */
export interface CreateSessionInput {
  topicId?: string | null;
  courseId?: string | null;
  title?: string;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

/**
 * AI Mentor Response (with streaming support)
 */
export interface MentorResponse {
  chatId: string;
  response: string;
  tokensUsed: number;
  responseTimeMs: number;
  costUsd: number;
  sessionId: string;
  rateLimitStatus: RateLimitStatus;
}

/**
 * Streaming response chunk
 */
export interface MentorStreamChunk {
  type: 'token' | 'complete' | 'error';
  content: string;
  metadata?: {
    chatId?: string;
    tokensUsed?: number;
    responseTimeMs?: number;
    costUsd?: number;
  };
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  hourlyRemaining: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  monthlyCostUsd: number;
  isLimited: boolean;
  resetAt: Date;
}

/**
 * Chat with full context
 */
export interface ChatWithContext extends AIMentorChat {
  topicTitle?: string;
  courseTitle?: string;
  userName?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Rate limit thresholds (per period)
 */
export const RATE_LIMITS = {
  HOURLY: 10,
  DAILY: 50,
  MONTHLY: 500,
  MAX_COST_USD: 5.0, // $5/month per student
} as const;

/**
 * Cost per 1K tokens (GPT-4o-mini)
 */
export const TOKEN_COSTS = {
  INPUT: 0.00015, // $0.15 per 1M tokens
  OUTPUT: 0.0006, // $0.60 per 1M tokens
} as const;

/**
 * OpenAI Model configuration
 */
export const AI_MODEL_CONFIG = {
  MODEL: 'gpt-4o-mini' as const,
  TEMPERATURE: 0.7,
  MAX_TOKENS: 500,
  MAX_CONTEXT_MESSAGES: 10, // Keep last 10 messages for context
} as const;

/**
 * Socratic prompting system prompt
 */
export const SOCRATIC_SYSTEM_PROMPT = `You are a Socratic mentor for students learning technical skills.

Your teaching philosophy:
- Guide students to discover answers through questions, not direct answers
- Ask probing questions that encourage critical thinking
- Break down complex problems into smaller steps
- Validate their thinking process, not just the final answer
- Encourage experimentation and learning from mistakes
- Be patient, supportive, and encouraging

Guidelines:
- Never directly provide code solutions - guide them to figure it out
- Ask "Why?" and "What if?" questions frequently
- Reference course materials when relevant
- If a student is truly stuck after multiple attempts, provide a small hint
- Celebrate progress and effort, not just correct answers
- Keep responses concise (under 200 words when possible)
- Use simple language and avoid jargon unless teaching that specific concept

If a question is:
- Off-topic: Gently redirect to course-related topics
- About personal issues: Show empathy but suggest they contact their trainer
- Too vague: Ask clarifying questions
- Beyond your knowledge: Admit uncertainty and suggest escalating to trainer
`;

/**
 * Escalation triggers
 */
export const ESCALATION_TRIGGERS = {
  LOW_RATING_THRESHOLD: 2, // Rating of 2 or below
  REPEATED_FAILURES: 5, // Same topic, 5+ questions
  EXPLICIT_REQUEST: true, // Student asks for human help
  TOPIC_DIFFICULTY: true, // Topic marked as "high difficulty"
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate cost from token usage
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * TOKEN_COSTS.INPUT;
  const outputCost = (outputTokens / 1000) * TOKEN_COSTS.OUTPUT;
  return parseFloat((inputCost + outputCost).toFixed(6));
}

/**
 * Check if user has exceeded rate limits
 */
export function isRateLimited(rateLimit: AIMentorRateLimit): boolean {
  const now = new Date();

  return (
    rateLimit.hourlyCount >= RATE_LIMITS.HOURLY ||
    rateLimit.dailyCount >= RATE_LIMITS.DAILY ||
    rateLimit.monthlyCount >= RATE_LIMITS.MONTHLY ||
    rateLimit.monthlyCostUsd >= RATE_LIMITS.MAX_COST_USD
  );
}

/**
 * Get time until rate limit resets
 */
export function getResetTime(rateLimit: AIMentorRateLimit): Date {
  const now = new Date();

  // Return the earliest reset time
  const resets = [
    rateLimit.hourlyResetAt,
    rateLimit.dailyResetAt,
    rateLimit.monthlyResetAt,
  ].map((d) => new Date(d));

  return resets.sort((a, b) => a.getTime() - b.getTime())[0];
}

/**
 * Determine if chat should be escalated
 */
export function shouldEscalate(
  chat: AIMentorChat,
  recentChats: AIMentorChat[]
): { should: boolean; reason: string | null } {
  // Low rating
  if (
    chat.studentRating !== null &&
    chat.studentRating <= ESCALATION_TRIGGERS.LOW_RATING_THRESHOLD
  ) {
    return {
      should: true,
      reason: `Low rating (${chat.studentRating}/5) - student needs human assistance`,
    };
  }

  // Repeated failures on same topic
  if (chat.topicId) {
    const topicChats = recentChats.filter((c) => c.topicId === chat.topicId);
    if (topicChats.length >= ESCALATION_TRIGGERS.REPEATED_FAILURES) {
      return {
        should: true,
        reason: `${topicChats.length} questions on same topic - student may be struggling`,
      };
    }
  }

  // Explicit request keywords
  const requestKeywords = [
    'talk to trainer',
    'human help',
    'speak to someone',
    'need real help',
    "this isn't helping",
  ];
  const questionLower = chat.question.toLowerCase();
  if (requestKeywords.some((keyword) => questionLower.includes(keyword))) {
    return {
      should: true,
      reason: 'Student explicitly requested human assistance',
    };
  }

  return { should: false, reason: null };
}

/**
 * Generate session title from first question (truncated)
 */
export function generateSessionTitle(question: string): string {
  const maxLength = 60;
  const cleaned = question.trim().replace(/\\s+/g, ' ');

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength - 3) + '...';
}

/**
 * Format conversation context for OpenAI API
 */
export function formatConversationContext(
  messages: ConversationMessage[],
  maxMessages: number = AI_MODEL_CONFIG.MAX_CONTEXT_MESSAGES
): ConversationMessage[] {
  // Keep only the last N messages
  const recentMessages = messages.slice(-maxMessages);

  // Ensure system message is always first if present
  const systemMessage = messages.find((m) => m.role === 'system');
  if (systemMessage && !recentMessages.some((m) => m.role === 'system')) {
    return [systemMessage, ...recentMessages.filter((m) => m.role !== 'system')];
  }

  return recentMessages;
}

/**
 * Validate question input
 */
export function validateQuestion(question: string): {
  valid: boolean;
  error: string | null;
} {
  const trimmed = question.trim();

  if (!trimmed) {
    return { valid: false, error: 'Question cannot be empty' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: 'Question must be at least 10 characters' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Question must be less than 1000 characters' };
  }

  return { valid: true, error: null };
}
