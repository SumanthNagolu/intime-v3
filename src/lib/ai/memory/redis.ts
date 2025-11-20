/**
 * Redis Memory
 *
 * Short-term cache for AI conversations (24h TTL).
 * Provides fast access to recent conversation history.
 */

import Redis from 'ioredis';

/**
 * Message in a conversation
 */
export interface Message {
  /** Message role */
  role: 'user' | 'assistant' | 'system';
  /** Message content */
  content: string;
  /** Message timestamp */
  timestamp: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Conversation data
 */
export interface Conversation {
  /** Conversation ID */
  id: string;
  /** User ID */
  userId: string;
  /** Messages in conversation */
  messages: Message[];
  /** Conversation metadata */
  metadata: Record<string, unknown>;
  /** Created timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Redis Memory
 *
 * Short-term cache for AI conversations.
 */
export class RedisMemory {
  private redis: Redis;
  private readonly TTL = 86400; // 24 hours

  constructor(redis: Redis) {
    this.redis = redis;
  }

  /**
   * Get conversation from cache
   *
   * @param conversationId - Conversation ID
   * @returns Conversation or null if not cached
   */
  async get(conversationId: string): Promise<Conversation | null> {
    const key = this.getKey(conversationId);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as Conversation;
    } catch (error) {
      console.error('Failed to parse cached conversation:', error);
      return null;
    }
  }

  /**
   * Set conversation in cache
   *
   * @param conversation - Conversation to cache
   * @param ttl - Time to live in seconds (default: 24h)
   */
  async set(conversation: Conversation, ttl: number = this.TTL): Promise<void> {
    const key = this.getKey(conversation.id);
    const data = JSON.stringify(conversation);

    await this.redis.setex(key, ttl, data);
  }

  /**
   * Delete conversation from cache
   *
   * @param conversationId - Conversation ID
   */
  async delete(conversationId: string): Promise<void> {
    const key = this.getKey(conversationId);
    await this.redis.del(key);
  }

  /**
   * Add message to cached conversation
   *
   * @param conversationId - Conversation ID
   * @param message - Message to add
   * @returns Updated conversation or null if not cached
   */
  async addMessage(
    conversationId: string,
    message: Message
  ): Promise<Conversation | null> {
    const conversation = await this.get(conversationId);

    if (!conversation) {
      return null;
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    await this.set(conversation);

    return conversation;
  }

  /**
   * Check if conversation is cached
   *
   * @param conversationId - Conversation ID
   * @returns True if cached
   */
  async exists(conversationId: string): Promise<boolean> {
    const key = this.getKey(conversationId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Get TTL for conversation
   *
   * @param conversationId - Conversation ID
   * @returns TTL in seconds or -1 if not cached
   */
  async getTTL(conversationId: string): Promise<number> {
    const key = this.getKey(conversationId);
    return this.redis.ttl(key);
  }

  /**
   * Extend TTL for conversation
   *
   * @param conversationId - Conversation ID
   * @param ttl - New TTL in seconds
   */
  async extend(conversationId: string, ttl: number = this.TTL): Promise<void> {
    const key = this.getKey(conversationId);
    await this.redis.expire(key, ttl);
  }

  /**
   * Clear all cached conversations
   *
   * USE WITH CAUTION
   */
  async clear(): Promise<void> {
    const keys = await this.redis.keys(this.getKey('*'));
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * Get Redis key for conversation
   *
   * @param conversationId - Conversation ID
   * @returns Redis key
   */
  private getKey(conversationId: string): string {
    return `conv:${conversationId}`;
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

/**
 * Create Redis client
 *
 * @param url - Redis URL (default: from env)
 * @returns Redis client
 */
export function createRedisClient(url?: string): Redis {
  return new Redis(url || process.env.REDIS_URL || 'redis://localhost:6379');
}
