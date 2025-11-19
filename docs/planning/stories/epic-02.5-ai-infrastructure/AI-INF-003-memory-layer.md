# AI-INF-003: Memory Layer

**Story Points:** 8
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** HIGH (Critical for Conversation Context)

---

## User Story

As an **AI Agent**,
I want **a three-tier memory system** (Redis short-term, PostgreSQL long-term, pgvector patterns),
So that **I can remember conversations, user preferences, and learned patterns**.

---

## Acceptance Criteria

- [ ] Redis setup for short-term memory (conversations, 24h TTL)
- [ ] PostgreSQL tables for long-term memory (interactions, preferences)
- [ ] pgvector storage for learned patterns (vector similarity)
- [ ] Memory retrieval APIs (getConversation, findSimilarPatterns)
- [ ] Automatic cleanup of expired short-term memory
- [ ] Memory retrieval <100ms latency
- [ ] Support for 100K+ concurrent conversations in Redis
- [ ] Pattern matching with 80%+ accuracy
- [ ] Memory persistence on Redis failure (fallback to PostgreSQL)
- [ ] User privacy controls (clear my data)

---

## Technical Implementation

### Database Migration

Create file: `supabase/migrations/012_memory_layer.sql`

```sql
-- Long-term memory: User interactions
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  interaction_type TEXT NOT NULL, -- 'question', 'feedback', 'preference'
  use_case TEXT NOT NULL, -- 'code_mentor', 'resume_builder', etc.

  question TEXT,
  response TEXT,
  context JSONB, -- Additional context (module, topic, etc.)

  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for retrieval
CREATE INDEX idx_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_interactions_use_case ON ai_interactions(use_case);
CREATE INDEX idx_interactions_created_at ON ai_interactions(created_at DESC);

-- Composite index for user history
CREATE INDEX idx_interactions_user_history
  ON ai_interactions(user_id, use_case, created_at DESC);

-- User preferences
CREATE TABLE user_ai_preferences (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id),

  preferences JSONB DEFAULT '{}'::jsonb, -- { learningStyle: 'visual', responseLength: 'concise', ... }

  struggle_patterns JSONB DEFAULT '[]'::jsonb, -- Topics user struggles with
  strength_patterns JSONB DEFAULT '[]'::jsonb, -- Topics user excels at

  last_interaction TIMESTAMPTZ,
  total_interactions INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_user_ai_preferences_updated_at
  BEFORE UPDATE ON user_ai_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Learned patterns (vector storage)
CREATE TABLE ai_learned_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id), -- NULL for global patterns

  pattern_type TEXT NOT NULL, -- 'struggle', 'success', 'common_question'
  description TEXT NOT NULL,
  context JSONB,

  embedding vector(1536), -- Pattern embedding for similarity matching

  frequency INTEGER DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector index for pattern matching
CREATE INDEX idx_patterns_embedding ON ai_learned_patterns
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_patterns_user_id ON ai_learned_patterns(user_id);
CREATE INDEX idx_patterns_type ON ai_learned_patterns(pattern_type);

-- RLS Policies
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learned_patterns ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY interactions_user_own ON ai_interactions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY preferences_user_own ON user_ai_preferences
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY patterns_user_own ON ai_learned_patterns
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Admins can view all
CREATE POLICY interactions_admin_all ON ai_interactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
```

### Memory Service

Create file: `src/lib/ai/memory.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const redis = new Redis(process.env.REDIS_URL!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};

export type ConversationMemory = {
  conversationId: string;
  userId: string;
  useCase: string;
  messages: Message[];
  context?: Record<string, any>;
};

export type UserPreferences = {
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  responseLength?: 'concise' | 'detailed';
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  customPreferences?: Record<string, any>;
};

export class MemoryLayer {
  private readonly CONVERSATION_TTL = 24 * 60 * 60; // 24 hours in seconds
  private readonly MAX_MESSAGES_IN_MEMORY = 20;

  /**
   * Save conversation message to short-term memory (Redis)
   */
  async saveMessage(
    conversationId: string,
    userId: string,
    useCase: string,
    message: Message,
    context?: Record<string, any>
  ): Promise<void> {
    const key = `conversation:${conversationId}`;

    // Get existing conversation
    const existing = await redis.get(key);
    const conversation: ConversationMemory = existing
      ? JSON.parse(existing)
      : {
          conversationId,
          userId,
          useCase,
          messages: [],
          context,
        };

    // Add new message
    conversation.messages.push(message);

    // Keep only last N messages
    if (conversation.messages.length > this.MAX_MESSAGES_IN_MEMORY) {
      conversation.messages = conversation.messages.slice(-this.MAX_MESSAGES_IN_MEMORY);
    }

    // Save to Redis with TTL
    await redis.setex(
      key,
      this.CONVERSATION_TTL,
      JSON.stringify(conversation)
    );

    // Also save to long-term storage if it's a user question
    if (message.role === 'user') {
      await this.saveInteraction(userId, useCase, message.content, '', context);
    }
  }

  /**
   * Get conversation from short-term memory
   */
  async getConversation(conversationId: string): Promise<ConversationMemory | null> {
    const key = `conversation:${conversationId}`;
    const data = await redis.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }

  /**
   * Get recent messages for context
   */
  async getRecentMessages(
    conversationId: string,
    limit: number = 10
  ): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId);

    if (!conversation) return [];

    return conversation.messages.slice(-limit);
  }

  /**
   * Clear conversation (user privacy)
   */
  async clearConversation(conversationId: string): Promise<void> {
    await redis.del(`conversation:${conversationId}`);
  }

  /**
   * Save interaction to long-term memory (PostgreSQL)
   */
  async saveInteraction(
    userId: string,
    useCase: string,
    question: string,
    response: string,
    context?: Record<string, any>
  ): Promise<void> {
    await supabase.from('ai_interactions').insert({
      user_id: userId,
      interaction_type: 'question',
      use_case: useCase,
      question,
      response,
      context,
    });

    // Update user interaction count
    await supabase.rpc('increment_user_interactions', { user_id_param: userId });
  }

  /**
   * Get user interaction history
   */
  async getUserHistory(
    userId: string,
    useCase?: string,
    limit: number = 50
  ): Promise<any[]> {
    let query = supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (useCase) {
      query = query.eq('use_case', useCase);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  }

  /**
   * Get or create user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data } = await supabase
      .from('user_ai_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    return data?.preferences || {};
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    await supabase.from('user_ai_preferences').upsert({
      user_id: userId,
      preferences,
      last_interaction: new Date().toISOString(),
    });
  }

  /**
   * Learn pattern from interactions
   */
  async learnPattern(
    userId: string | null,
    patternType: 'struggle' | 'success' | 'common_question',
    description: string,
    context?: Record<string, any>
  ): Promise<void> {
    // Generate embedding for pattern
    const embedding = await this.generateEmbedding(description);

    // Check if similar pattern exists
    const { data: existing } = await supabase.rpc('search_patterns', {
      query_embedding: embedding,
      match_threshold: 0.9,
      user_id_filter: userId,
    });

    if (existing && existing.length > 0) {
      // Increment frequency
      await supabase
        .from('ai_learned_patterns')
        .update({
          frequency: existing[0].frequency + 1,
          last_seen: new Date().toISOString(),
        })
        .eq('id', existing[0].id);
    } else {
      // Create new pattern
      await supabase.from('ai_learned_patterns').insert({
        user_id: userId,
        pattern_type: patternType,
        description,
        context,
        embedding,
      });
    }
  }

  /**
   * Find similar patterns
   */
  async findSimilarPatterns(
    description: string,
    userId?: string,
    limit: number = 5
  ): Promise<any[]> {
    const embedding = await this.generateEmbedding(description);

    const { data, error } = await supabase.rpc('search_patterns', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      user_id_filter: userId || null,
    });

    if (error) throw error;

    return data;
  }

  /**
   * Generate embedding for pattern matching
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Get memory stats
   */
  async getMemoryStats(userId: string): Promise<{
    totalInteractions: number;
    activeConversations: number;
    learnedPatterns: number;
  }> {
    const [interactions, patterns] = await Promise.all([
      supabase
        .from('ai_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('ai_learned_patterns')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    // Count active conversations in Redis
    const keys = await redis.keys(`conversation:*:${userId}:*`);

    return {
      totalInteractions: interactions.count || 0,
      activeConversations: keys.length,
      learnedPatterns: patterns.count || 0,
    };
  }

  /**
   * Clear all user data (GDPR compliance)
   */
  async clearUserData(userId: string): Promise<void> {
    // Clear Redis conversations
    const keys = await redis.keys(`conversation:*:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // Clear PostgreSQL data
    await Promise.all([
      supabase.from('ai_interactions').delete().eq('user_id', userId),
      supabase.from('user_ai_preferences').delete().eq('user_id', userId),
      supabase.from('ai_learned_patterns').delete().eq('user_id', userId),
    ]);
  }
}
```

### Additional SQL Functions

```sql
-- Increment user interactions count
CREATE OR REPLACE FUNCTION increment_user_interactions(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_ai_preferences (user_id, total_interactions, last_interaction)
  VALUES (user_id_param, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_interactions = user_ai_preferences.total_interactions + 1,
    last_interaction = NOW();
END;
$$ LANGUAGE plpgsql;

-- Search learned patterns
CREATE OR REPLACE FUNCTION search_patterns(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  user_id_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  description text,
  context jsonb,
  similarity float,
  frequency integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.description,
    p.context,
    1 - (p.embedding <=> query_embedding) AS similarity,
    p.frequency
  FROM ai_learned_patterns p
  WHERE
    (user_id_filter IS NULL OR p.user_id = user_id_filter OR p.user_id IS NULL)
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## Testing

### Unit Tests

```typescript
// src/lib/ai/__tests__/memory.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryLayer } from '../memory';

describe('Memory Layer', () => {
  let memory: MemoryLayer;
  const testUserId = 'test-user-123';
  const testConversationId = 'conv-123';

  beforeEach(() => {
    memory = new MemoryLayer();
  });

  afterEach(async () => {
    // Cleanup
    await memory.clearConversation(testConversationId);
  });

  describe('Short-term Memory (Redis)', () => {
    it('saves and retrieves messages', async () => {
      await memory.saveMessage(
        testConversationId,
        testUserId,
        'code_mentor',
        {
          role: 'user',
          content: 'What is PolicyCenter?',
          timestamp: new Date().toISOString(),
        }
      );

      const conversation = await memory.getConversation(testConversationId);

      expect(conversation).toBeTruthy();
      expect(conversation!.messages).toHaveLength(1);
      expect(conversation!.messages[0].content).toBe('What is PolicyCenter?');
    });

    it('maintains conversation context', async () => {
      // Add multiple messages
      const messages = [
        { role: 'user', content: 'Q1' },
        { role: 'assistant', content: 'A1' },
        { role: 'user', content: 'Q2' },
      ];

      for (const msg of messages) {
        await memory.saveMessage(
          testConversationId,
          testUserId,
          'code_mentor',
          {
            ...msg,
            timestamp: new Date().toISOString(),
          } as any
        );
      }

      const recent = await memory.getRecentMessages(testConversationId, 10);

      expect(recent).toHaveLength(3);
      expect(recent[0].content).toBe('Q1');
      expect(recent[2].content).toBe('Q2');
    });

    it('limits messages to max count', async () => {
      // Add 25 messages (max is 20)
      for (let i = 0; i < 25; i++) {
        await memory.saveMessage(
          testConversationId,
          testUserId,
          'code_mentor',
          {
            role: 'user',
            content: `Message ${i}`,
            timestamp: new Date().toISOString(),
          }
        );
      }

      const conversation = await memory.getConversation(testConversationId);

      expect(conversation!.messages).toHaveLength(20); // Max limit
      expect(conversation!.messages[0].content).toBe('Message 5'); // Oldest kept
    });

    it('expires after 24 hours', async () => {
      // This test would need to mock time or use Redis TTL inspection
      // Simplified version:
      await memory.saveMessage(
        testConversationId,
        testUserId,
        'code_mentor',
        {
          role: 'user',
          content: 'Test',
          timestamp: new Date().toISOString(),
        }
      );

      // Check TTL is set
      const ttl = await redis.ttl(`conversation:${testConversationId}`);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(24 * 60 * 60);
    });
  });

  describe('Long-term Memory (PostgreSQL)', () => {
    it('saves interactions to database', async () => {
      await memory.saveInteraction(
        testUserId,
        'code_mentor',
        'What is rating?',
        'Rating calculates premiums...'
      );

      const history = await memory.getUserHistory(testUserId);

      expect(history.length).toBeGreaterThan(0);
      expect(history[0].question).toBe('What is rating?');
    });

    it('retrieves user history by use case', async () => {
      await memory.saveInteraction(
        testUserId,
        'code_mentor',
        'Q1',
        'A1'
      );
      await memory.saveInteraction(
        testUserId,
        'resume_builder',
        'Q2',
        'A2'
      );

      const history = await memory.getUserHistory(testUserId, 'code_mentor');

      expect(history.every((h) => h.use_case === 'code_mentor')).toBe(true);
    });
  });

  describe('User Preferences', () => {
    it('stores and retrieves preferences', async () => {
      await memory.updateUserPreferences(testUserId, {
        learningStyle: 'visual',
        responseLength: 'concise',
      });

      const prefs = await memory.getUserPreferences(testUserId);

      expect(prefs.learningStyle).toBe('visual');
      expect(prefs.responseLength).toBe('concise');
    });
  });

  describe('Pattern Learning', () => {
    it('learns new patterns', async () => {
      await memory.learnPattern(
        testUserId,
        'struggle',
        'User struggles with PolicyCenter rating concepts'
      );

      const patterns = await memory.findSimilarPatterns(
        'Having trouble with rating',
        testUserId
      );

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].similarity).toBeGreaterThan(0.7);
    });

    it('increments frequency for repeated patterns', async () => {
      const description = 'Common question about ClaimCenter workflows';

      await memory.learnPattern(testUserId, 'common_question', description);
      await memory.learnPattern(testUserId, 'common_question', description);

      const patterns = await memory.findSimilarPatterns(description, testUserId);

      expect(patterns[0].frequency).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Performance', () => {
    it('retrieves conversation in <100ms', async () => {
      await memory.saveMessage(
        testConversationId,
        testUserId,
        'test',
        {
          role: 'user',
          content: 'Test',
          timestamp: new Date().toISOString(),
        }
      );

      const start = Date.now();
      await memory.getConversation(testConversationId);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Privacy & GDPR', () => {
    it('clears all user data', async () => {
      // Create data
      await memory.saveInteraction(testUserId, 'test', 'Q', 'A');
      await memory.updateUserPreferences(testUserId, { learningStyle: 'visual' });
      await memory.learnPattern(testUserId, 'struggle', 'Test pattern');

      // Clear data
      await memory.clearUserData(testUserId);

      // Verify cleared
      const history = await memory.getUserHistory(testUserId);
      const prefs = await memory.getUserPreferences(testUserId);
      const stats = await memory.getMemoryStats(testUserId);

      expect(history).toHaveLength(0);
      expect(Object.keys(prefs)).toHaveLength(0);
      expect(stats.totalInteractions).toBe(0);
      expect(stats.learnedPatterns).toBe(0);
    });
  });
});
```

---

## Verification

### Manual Testing

```bash
# Test Redis connection
redis-cli -u $REDIS_URL PING

# Check memory usage
redis-cli -u $REDIS_URL INFO memory

# List active conversations
redis-cli -u $REDIS_URL KEYS "conversation:*"
```

### SQL Verification

```sql
-- Check interaction history
SELECT user_id, use_case, COUNT(*), MAX(created_at)
FROM ai_interactions
GROUP BY user_id, use_case
ORDER BY COUNT(*) DESC
LIMIT 10;

-- Check learned patterns
SELECT pattern_type, COUNT(*), AVG(frequency)
FROM ai_learned_patterns
GROUP BY pattern_type;

-- Check user preferences
SELECT COUNT(*), AVG(total_interactions)
FROM user_ai_preferences;
```

---

## Dependencies

**Requires:**
- FOUND-001 (Database schema - user_profiles)
- Redis instance configured
- AI-INF-002 (RAG Infrastructure - for pattern embeddings)

**Blocks:**
- AI-INF-005 (Base Agent Framework - uses memory)
- AI-GURU-001 (Code Mentor - uses conversation memory)
- AI-TWIN-001 (Employee AI Twins - uses preferences)

---

## Environment Variables

```bash
REDIS_URL=redis://localhost:6379
# or
REDIS_URL=rediss://redis.upstash.com:6379?auth=xxx
```

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-INF-004 (Cost Monitoring with Helicone)
