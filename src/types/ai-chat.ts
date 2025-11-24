/**
 * AI Chat Types and Interfaces
 * ACAD-020
 *
 * Type definitions for AI mentor chat system
 */

import { z } from 'zod';

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  feedback?: 'positive' | 'negative' | null;
  metadata?: {
    topic_id?: string;
    course_id?: string;
    code_snippets?: Array<{
      language: string;
      code: string;
    }>;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  };
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  last_message_at: string;
  created_at: string;
  message_count: number;
  context?: {
    topic_id?: string;
    course_id?: string;
    module_id?: string;
  };
}

export interface ConversationWithMessages extends Conversation {
  messages: ChatMessage[];
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().min(1),
  created_at: z.string().datetime(),
  feedback: z.enum(['positive', 'negative']).nullable().optional(),
  metadata: z
    .object({
      topic_id: z.string().uuid().optional(),
      course_id: z.string().uuid().optional(),
      code_snippets: z
        .array(
          z.object({
            language: z.string(),
            code: z.string(),
          })
        )
        .optional(),
      attachments: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().url(),
            type: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  topic: z.string().min(1).max(100),
  last_message_at: z.string().datetime(),
  created_at: z.string().datetime(),
  message_count: z.number().int().min(0),
  context: z
    .object({
      topic_id: z.string().uuid().optional(),
      course_id: z.string().uuid().optional(),
      module_id: z.string().uuid().optional(),
    })
    .optional(),
});

export const ConversationWithMessagesSchema = ConversationSchema.extend({
  messages: z.array(ChatMessageSchema),
});

// ============================================================================
// Input Schemas for API
// ============================================================================

export const SendMessageInputSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
  context: z
    .object({
      topic_id: z.string().uuid().optional(),
      course_id: z.string().uuid().optional(),
      module_id: z.string().uuid().optional(),
    })
    .optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

export const CreateConversationInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  topic: z.string().min(1).max(100).default('General'),
  initial_message: z.string().min(1).max(5000),
  context: z
    .object({
      topic_id: z.string().uuid().optional(),
      course_id: z.string().uuid().optional(),
      module_id: z.string().uuid().optional(),
    })
    .optional(),
});

export type CreateConversationInput = z.infer<typeof CreateConversationInputSchema>;

export const GetConversationHistoryInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  topic: z.string().optional(),
});

export type GetConversationHistoryInput = z.infer<typeof GetConversationHistoryInputSchema>;

export const GetConversationMessagesInputSchema = z.object({
  conversation_id: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type GetConversationMessagesInput = z.infer<typeof GetConversationMessagesInputSchema>;

export const ProvideFeedbackInputSchema = z.object({
  message_id: z.string().uuid(),
  feedback: z.enum(['positive', 'negative']),
});

export type ProvideFeedbackInput = z.infer<typeof ProvideFeedbackInputSchema>;

export const DeleteConversationInputSchema = z.object({
  conversation_id: z.string().uuid(),
});

export type DeleteConversationInput = z.infer<typeof DeleteConversationInputSchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a title for a conversation based on the first message
 */
export function generateConversationTitle(firstMessage: string): string {
  const maxLength = 50;
  const cleaned = firstMessage.trim().replace(/\s+/g, ' ');

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength - 3) + '...';
}

/**
 * Extract code snippets from message content
 */
export function extractCodeSnippets(content: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const snippets: Array<{ language: string; code: string }> = [];

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    snippets.push({
      language: match[1] || 'plaintext',
      code: match[2].trim(),
    });
  }

  return snippets;
}

/**
 * Format message timestamp
 */
export function formatMessageTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Truncate conversation title for display
 */
export function truncateTitle(title: string, maxLength: number = 40): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
}

/**
 * Get topic color based on topic name
 */
export function getTopicColor(topic: string): string {
  const colors: Record<string, string> = {
    General: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    Learning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Coding: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Practice: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Career: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Guidewire: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return colors[topic] || colors.General;
}

/**
 * Check if message contains code
 */
export function messageHasCode(content: string): boolean {
  return /```[\s\S]*?```/.test(content) || /`[^`]+`/.test(content);
}

/**
 * Get estimated reading time for message
 */
export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): {
  isValid: boolean;
  error?: string;
} {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (content.length > 5000) {
    return { isValid: false, error: 'Message is too long (max 5000 characters)' };
  }

  return { isValid: true };
}

/**
 * Sanitize user input for display
 */
export function sanitizeUserInput(input: string): string {
  // Basic HTML escaping
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
