/**
 * PostgreSQL Memory
 *
 * Long-term storage for AI conversations and extracted patterns.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Conversation, Message } from './redis';

/**
 * Extracted pattern from conversations
 */
export interface Pattern {
  /** Pattern ID */
  id: string;
  /** User ID */
  userId: string;
  /** Pattern type */
  type: 'question' | 'struggle' | 'preference' | 'skill';
  /** Pattern description */
  description: string;
  /** Occurrences count */
  count: number;
  /** First seen timestamp */
  firstSeen: string;
  /** Last seen timestamp */
  lastSeen: string;
  /** Pattern metadata */
  metadata: Record<string, unknown>;
}

/**
 * PostgreSQL Memory
 *
 * Long-term conversation storage with pattern extraction.
 */
export class PostgresMemory {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Get conversation by ID
   *
   * @param conversationId - Conversation ID
   * @returns Conversation or null
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return data as Conversation;
  }

  /**
   * Create new conversation
   *
   * @param conversation - Conversation data
   * @returns Created conversation
   */
  async createConversation(conversation: Omit<Conversation, 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('ai_conversations')
      .insert({
        ...conversation,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data as Conversation;
  }

  /**
   * Add message to conversation
   *
   * @param conversationId - Conversation ID
   * @param message - Message to add
   */
  async addMessage(conversationId: string, message: Message): Promise<void> {
    const conversation = await this.getConversation(conversationId);

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    const { error } = await this.supabase
      .from('ai_conversations')
      .update({
        messages: conversation.messages,
        updatedAt: conversation.updatedAt,
      })
      .eq('id', conversationId);

    if (error) {
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  /**
   * Get conversations for user
   *
   * @param userId - User ID
   * @param limit - Number of conversations to return
   * @returns Array of conversations
   */
  async getUserConversations(userId: string, limit: number = 10): Promise<Conversation[]> {
    const { data, error } = await this.supabase
      .from('ai_conversations')
      .select('*')
      .eq('userId', userId)
      .order('updatedAt', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get user conversations: ${error.message}`);
    }

    return (data as Conversation[]) || [];
  }

  /**
   * Search messages by query
   *
   * @param query - Search query
   * @param userId - User ID (optional)
   * @returns Matching messages
   */
  async searchMessages(query: string, userId?: string): Promise<Message[]> {
    let queryBuilder = this.supabase
      .from('ai_conversations')
      .select('messages');

    if (userId) {
      queryBuilder = queryBuilder.eq('userId', userId);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to search messages: ${error.message}`);
    }

    // Extract and filter messages
    const allMessages: Message[] = [];
    for (const row of data || []) {
      const messages = row.messages as Message[];
      const matching = messages.filter(m =>
        m.content.toLowerCase().includes(query.toLowerCase())
      );
      allMessages.push(...matching);
    }

    return allMessages;
  }

  /**
   * Extract patterns from user conversations
   *
   * @param userId - User ID
   * @returns Extracted patterns
   */
  async extractPatterns(userId: string): Promise<Pattern[]> {
    // Get user conversations
    const conversations = await this.getUserConversations(userId, 50);

    // Simple pattern extraction (can be enhanced with AI)
    const patterns: Map<string, Pattern> = new Map();

    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.role === 'user') {
          // Extract questions
          if (msg.content.includes('?')) {
            const key = 'question:how-to';
            const existing = patterns.get(key);
            if (existing) {
              existing.count++;
              existing.lastSeen = msg.timestamp;
            } else {
              patterns.set(key, {
                id: key,
                userId,
                type: 'question',
                description: 'How-to questions',
                count: 1,
                firstSeen: msg.timestamp,
                lastSeen: msg.timestamp,
                metadata: {},
              });
            }
          }
        }
      }
    }

    return Array.from(patterns.values());
  }

  /**
   * Delete conversation
   *
   * @param conversationId - Conversation ID
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }
}
