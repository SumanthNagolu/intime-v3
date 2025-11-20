/**
 * Memory Manager
 *
 * Unified interface for AI conversation memory.
 * Coordinates Redis cache and PostgreSQL long-term storage.
 *
 * Performance SLA: <100ms retrieval
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type Redis from 'ioredis';
import { RedisMemory, type Conversation, type Message } from './redis';
import { PostgresMemory, type Pattern } from './postgres';

/**
 * Memory Manager
 *
 * Three-tier memory system:
 * 1. Redis: Short-term (24h TTL)
 * 2. PostgreSQL: Long-term conversations
 * 3. Patterns: Extracted insights
 */
export class MemoryManager {
  private redis: RedisMemory;
  private postgres: PostgresMemory;

  constructor(
    redis: Redis,
    supabase: SupabaseClient
  ) {
    this.redis = new RedisMemory(redis);
    this.postgres = new PostgresMemory(supabase);
  }

  /**
   * Get conversation by ID
   *
   * Checks Redis first (hot cache), falls back to PostgreSQL.
   *
   * @param conversationId - Conversation ID
   * @returns Conversation or null
   *
   * @example
   * ```typescript
   * const manager = new MemoryManager(redis, supabase);
   * const conversation = await manager.getConversation('conv123');
   * console.log(conversation?.messages.length); // 5
   * ```
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const startTime = performance.now();

    // 1. Check Redis cache
    let conversation = await this.redis.get(conversationId);

    if (conversation) {
      const elapsedTime = performance.now() - startTime;
      if (elapsedTime > 100) {
        console.warn(`MemoryManager: Redis retrieval ${elapsedTime.toFixed(2)}ms exceeds SLA`);
      }
      return conversation;
    }

    // 2. Load from PostgreSQL
    conversation = await this.postgres.getConversation(conversationId);

    if (conversation) {
      // 3. Cache in Redis (24h TTL)
      await this.redis.set(conversation);
    }

    const elapsedTime = performance.now() - startTime;
    if (elapsedTime > 100) {
      console.warn(`MemoryManager: Total retrieval ${elapsedTime.toFixed(2)}ms exceeds SLA`);
    }

    return conversation;
  }

  /**
   * Create new conversation
   *
   * Creates in PostgreSQL and caches in Redis.
   *
   * @param conversation - Conversation data
   * @returns Created conversation
   */
  async createConversation(
    conversation: Omit<Conversation, 'createdAt' | 'updatedAt'>
  ): Promise<Conversation> {
    // 1. Create in PostgreSQL
    const created = await this.postgres.createConversation(conversation);

    // 2. Cache in Redis
    await this.redis.set(created);

    return created;
  }

  /**
   * Add message to conversation
   *
   * Updates both PostgreSQL and invalidates Redis cache.
   *
   * @param conversationId - Conversation ID
   * @param message - Message to add
   */
  async addMessage(
    conversationId: string,
    message: Message
  ): Promise<void> {
    // 1. Update PostgreSQL
    await this.postgres.addMessage(conversationId, message);

    // 2. Invalidate Redis cache
    await this.redis.delete(conversationId);
  }

  /**
   * Get user conversations
   *
   * @param userId - User ID
   * @param limit - Number of conversations
   * @returns Array of conversations
   */
  async getUserConversations(userId: string, limit: number = 10): Promise<Conversation[]> {
    return this.postgres.getUserConversations(userId, limit);
  }

  /**
   * Search messages by query
   *
   * @param query - Search query
   * @param userId - User ID (optional)
   * @returns Matching messages
   */
  async searchMessages(query: string, userId?: string): Promise<Message[]> {
    return this.postgres.searchMessages(query, userId);
  }

  /**
   * Extract patterns from conversations
   *
   * Identifies common questions, struggles, etc.
   *
   * @param userId - User ID
   * @returns Extracted patterns
   *
   * @example
   * ```typescript
   * const patterns = await manager.extractPatterns('user123');
   * console.log(patterns[0].type); // 'question'
   * console.log(patterns[0].count); // 15
   * ```
   */
  async extractPatterns(userId: string): Promise<Pattern[]> {
    return this.postgres.extractPatterns(userId);
  }

  /**
   * Delete conversation
   *
   * Removes from both PostgreSQL and Redis.
   *
   * @param conversationId - Conversation ID
   */
  async deleteConversation(conversationId: string): Promise<void> {
    // 1. Delete from PostgreSQL
    await this.postgres.deleteConversation(conversationId);

    // 2. Delete from Redis
    await this.redis.delete(conversationId);
  }

  /**
   * Clear Redis cache
   *
   * USE WITH CAUTION
   */
  async clearCache(): Promise<void> {
    await this.redis.clear();
  }

  /**
   * Close all connections
   */
  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}
