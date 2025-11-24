/**
 * AI Mentor Service
 * ACAD-013: AI Mentor Integration
 *
 * OpenAI GPT-4o-mini integration with Socratic prompting for 24/7 student mentorship
 */

import OpenAI from 'openai';
import type {
  AskMentorInput,
  MentorResponse,
  ConversationMessage,
  RateLimitStatus,
  MentorStreamChunk,
} from '@/types/ai-mentor';
import {
  AI_MODEL_CONFIG,
  SOCRATIC_SYSTEM_PROMPT,
  calculateCost,
  formatConversationContext,
  validateQuestion,
  generateSessionTitle,
} from '@/types/ai-mentor';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build system prompt with course context
 */
async function buildSystemPrompt(
  courseId: string | null,
  topicId: string | null
): Promise<string> {
  let contextInfo = '';

  if (topicId) {
    // TODO: Fetch topic details from database
    // For now, use generic prompt
    contextInfo = `\\n\\nThe student is currently working on a specific topic in the course.`;
  } else if (courseId) {
    // TODO: Fetch course details from database
    contextInfo = `\\n\\nThe student is enrolled in a course.`;
  }

  return SOCRATIC_SYSTEM_PROMPT + contextInfo;
}

/**
 * Build conversation messages for OpenAI API
 */
async function buildMessages(
  input: AskMentorInput,
  systemPrompt: string
): Promise<ConversationMessage[]> {
  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history if provided
  if (input.conversationHistory && input.conversationHistory.length > 0) {
    const formattedHistory = formatConversationContext(input.conversationHistory);
    messages.push(...formattedHistory);
  }

  // Add current question
  messages.push({ role: 'user', content: input.question });

  return messages;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Check rate limits before allowing request
 */
async function checkRateLimits(userId: string): Promise<RateLimitStatus> {
  // TODO: Implement rate limit check via database function
  // For now, return mock data
  return {
    hourlyRemaining: 10,
    dailyRemaining: 50,
    monthlyRemaining: 500,
    monthlyCostUsd: 0.5,
    isLimited: false,
    resetAt: new Date(Date.now() + 3600000), // 1 hour from now
  };
}

/**
 * Increment rate limit counters after successful request
 */
async function incrementRateLimits(
  userId: string,
  tokensUsed: number,
  costUsd: number
): Promise<void> {
  // TODO: Implement rate limit increment via database function
  // This should update hourly/daily/monthly counts and cost
}

// ============================================================================
// CHAT STORAGE
// ============================================================================

/**
 * Store chat in database
 */
async function storeChat(data: {
  userId: string;
  topicId: string | null;
  courseId: string | null;
  sessionId: string | null;
  question: string;
  response: string;
  conversationContext: ConversationMessage[];
  tokensUsed: number;
  responseTimeMs: number;
  costUsd: number;
}): Promise<string> {
  // TODO: Implement via database function
  // For now, return mock chat ID
  return crypto.randomUUID();
}

/**
 * Update or create session
 */
async function updateSession(data: {
  sessionId: string | null;
  userId: string;
  topicId: string | null;
  courseId: string | null;
  question: string;
  tokensUsed: number;
  costUsd: number;
}): Promise<string> {
  // TODO: Implement via database function
  // If sessionId is null, create new session
  // Otherwise update existing session
  return data.sessionId || crypto.randomUUID();
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Ask AI Mentor (Non-streaming)
 */
export async function askMentor(
  userId: string,
  input: AskMentorInput
): Promise<MentorResponse> {
  const startTime = Date.now();

  // Validate question
  const validation = validateQuestion(input.question);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid question');
  }

  // Check rate limits
  const rateLimitStatus = await checkRateLimits(userId);
  if (rateLimitStatus.isLimited) {
    throw new Error(
      `Rate limit exceeded. Reset at ${rateLimitStatus.resetAt.toLocaleString()}`
    );
  }

  // Build system prompt with context
  const systemPrompt = await buildSystemPrompt(input.courseId || null, input.topicId || null);

  // Build conversation messages
  const messages = await buildMessages(input, systemPrompt);

  // Call OpenAI API
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL_CONFIG.MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: AI_MODEL_CONFIG.TEMPERATURE,
      max_tokens: AI_MODEL_CONFIG.MAX_TOKENS,
    });

    const responseMessage = completion.choices[0].message.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    // Calculate cost and response time
    const costUsd = calculateCost(inputTokens, outputTokens);
    const responseTimeMs = Date.now() - startTime;

    // Store chat in database
    const conversationContext = input.conversationHistory || [];
    conversationContext.push(
      { role: 'user', content: input.question },
      { role: 'assistant', content: responseMessage }
    );

    const chatId = await storeChat({
      userId,
      topicId: input.topicId || null,
      courseId: input.courseId || null,
      sessionId: input.sessionId || null,
      question: input.question,
      response: responseMessage,
      conversationContext,
      tokensUsed,
      responseTimeMs,
      costUsd,
    });

    // Update or create session
    const sessionId = await updateSession({
      sessionId: input.sessionId || null,
      userId,
      topicId: input.topicId || null,
      courseId: input.courseId || null,
      question: input.question,
      tokensUsed,
      costUsd,
    });

    // Increment rate limits
    await incrementRateLimits(userId, tokensUsed, costUsd);

    return {
      chatId,
      response: responseMessage,
      tokensUsed,
      responseTimeMs,
      costUsd,
      sessionId,
      rateLimitStatus,
    };
  } catch (error) {
    // If OpenAI API Key is missing or fails, return a mock response
    console.error('OpenAI API Error:', error);
    return {
      chatId: crypto.randomUUID(),
      response: "I'm sorry, I can't connect to my brain right now (OpenAI API key missing). But I'm here to help! Please ask a trainer for assistance or check the course materials.",
      tokensUsed: 0,
      responseTimeMs: Date.now() - startTime,
      costUsd: 0,
      sessionId: input.sessionId || crypto.randomUUID(),
      rateLimitStatus,
    };
  }
}

/**
 * Ask AI Mentor (Streaming)
 */
export async function* askMentorStream(
  userId: string,
  input: AskMentorInput
): AsyncGenerator<MentorStreamChunk> {
  const startTime = Date.now();

  try {
    // Validate question
    const validation = validateQuestion(input.question);
    if (!validation.valid) {
      yield {
        type: 'error',
        content: validation.error || 'Invalid question',
      };
      return;
    }

    // Check rate limits
    const rateLimitStatus = await checkRateLimits(userId);
    if (rateLimitStatus.isLimited) {
      yield {
        type: 'error',
        content: `Rate limit exceeded. Reset at ${rateLimitStatus.resetAt.toLocaleString()}`,
      };
      return;
    }

    // Build system prompt with context
    const systemPrompt = await buildSystemPrompt(input.courseId || null, input.topicId || null);

    // Build conversation messages
    const messages = await buildMessages(input, systemPrompt);

    // Call OpenAI API with streaming
    const stream = await openai.chat.completions.create({
      model: AI_MODEL_CONFIG.MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: AI_MODEL_CONFIG.TEMPERATURE,
      max_tokens: AI_MODEL_CONFIG.MAX_TOKENS,
      stream: true,
    });

    let fullResponse = '';
    let tokensUsed = 0;

    // Stream tokens
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        tokensUsed += 1; // Rough estimate, will be corrected at end

        yield {
          type: 'token',
          content,
        };
      }
    }

    // Calculate final metrics
    const responseTimeMs = Date.now() - startTime;

    // Estimate tokens (will be corrected by OpenAI's final count if available)
    const inputTokens = Math.ceil(JSON.stringify(messages).length / 4);
    const outputTokens = Math.ceil(fullResponse.length / 4);
    tokensUsed = inputTokens + outputTokens;

    const costUsd = calculateCost(inputTokens, outputTokens);

    // Store chat in database
    const conversationContext = input.conversationHistory || [];
    conversationContext.push(
      { role: 'user', content: input.question },
      { role: 'assistant', content: fullResponse }
    );

    const chatId = await storeChat({
      userId,
      topicId: input.topicId || null,
      courseId: input.courseId || null,
      sessionId: input.sessionId || null,
      question: input.question,
      response: fullResponse,
      conversationContext,
      tokensUsed,
      responseTimeMs,
      costUsd,
    });

    // Update or create session
    const sessionId = await updateSession({
      sessionId: input.sessionId || null,
      userId,
      topicId: input.topicId || null,
      courseId: input.courseId || null,
      question: input.question,
      tokensUsed,
      costUsd,
    });

    // Increment rate limits
    await incrementRateLimits(userId, tokensUsed, costUsd);

    // Send completion chunk
    yield {
      type: 'complete',
      content: '',
      metadata: {
        chatId,
        tokensUsed,
        responseTimeMs,
        costUsd,
      },
    };
  } catch (error) {
    yield {
      type: 'error',
      content: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(
  userId: string,
  sessionId: string
): Promise<ConversationMessage[]> {
  // TODO: Implement via database query
  return [];
}

/**
 * Get active sessions for user
 */
export async function getUserSessions(userId: string, limit: number = 10) {
  // TODO: Implement via database query
  return [];
}

/**
 * Get rate limit status for user
 */
export async function getRateLimitStatus(userId: string): Promise<RateLimitStatus> {
  return checkRateLimits(userId);
}
