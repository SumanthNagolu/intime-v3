/**
 * AI Memory Layer
 *
 * Three-tier memory system for AI conversations:
 * - Redis: Short-term cache (24h TTL)
 * - PostgreSQL: Long-term storage
 * - Patterns: Extracted insights
 *
 * @module lib/ai/memory
 */

export {
  RedisMemory,
  createRedisClient,
  type Conversation,
  type Message,
} from './redis';

export {
  PostgresMemory,
  type Pattern,
} from './postgres';

export {
  MemoryManager,
} from './manager';
