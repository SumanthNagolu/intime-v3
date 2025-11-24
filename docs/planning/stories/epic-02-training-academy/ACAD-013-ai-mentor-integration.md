# ACAD-013: AI Mentor Integration

**Status:** 🟢 Complete

**Story Points:** 8
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **OpenAI GPT-4o-mini, Socratic prompts, course context**,
So that **I can get help 24/7 and stay motivated**.

---

## Acceptance Criteria

- [x] OpenAI GPT-4o-mini API integration
- [x] Course-specific context injection (current module/topic)
- [x] Socratic prompting system (guide, don't tell)
- [x] Chat history persistence
- [x] Real-time streaming responses
- [x] Code syntax highlighting in responses
- [x] Rate limiting (prevent abuse)
- [x] Cost tracking ($0.009/student/month target)
- [x] Conversation analytics

---

## Technical Implementation

### AI Mentor Service

```typescript
// src/lib/ai/mentor.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askMentor(
  userId: string,
  question: string,
  courseContext: { courseId: string; topicId: string }
): Promise<string> {
  const systemPrompt = `You are a Socratic mentor for ${courseContext.courseName}. 
  Guide students to discover answers through questions, not direct answers.
  Current topic: ${courseContext.topicTitle}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}
```

### Chat History

```sql
CREATE TABLE ai_mentor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  topic_id UUID REFERENCES module_topics(id),
  
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  
  tokens_used INTEGER,
  response_time_ms INTEGER,
  
  student_rating INTEGER CHECK (student_rating BETWEEN 1 AND 5),
  flagged_for_review BOOLEAN DEFAULT false,
  escalated_to_trainer BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

**Dependencies:** ACAD-001, ACAD-002
**Next:** ACAD-014 (Escalation Logic)
