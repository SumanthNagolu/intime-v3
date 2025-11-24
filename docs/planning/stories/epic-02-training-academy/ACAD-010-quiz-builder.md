# ACAD-010: Build Quiz Builder (Admin)

**Status:** 🟢 Complete

**Story Points:** 6
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** HIGH

---

## User Story

As a **Course Admin**,
I want **to create quizzes with multiple question types**,
So that **I can assess student knowledge**.

---

## Acceptance Criteria

- [x] Question bank system (reusable questions)
- [x] Multiple choice questions (single/multiple answer)
- [x] True/False questions
- [x] Code snippet questions
- [x] Question randomization (optional)
- [x] Answer key management
- [x] Quiz preview mode
- [x] Bulk import (CSV/JSON)
- [x] Question difficulty tagging

---

## Technical Implementation

### Quiz Schema

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES module_topics(id),
  
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'code')),
  
  options JSONB, -- ["Option A", "Option B", ...]
  correct_answers JSONB, -- [0, 2] for multiple correct
  
  explanation TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 1,
  
  created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  topic_id UUID NOT NULL REFERENCES module_topics(id),
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  
  answers JSONB, -- { "question-id": [selected answers] }
  score NUMERIC(5,2),
  passed BOOLEAN,
  
  attempt_number INTEGER DEFAULT 1
);
```

### Quiz Builder UI

```typescript
// Admin quiz builder component
export function QuizBuilder({ topicId }: { topicId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answers: [],
    }]);
  };

  return (
    <div>
      {questions.map((q, idx) => (
        <QuestionEditor key={idx} question={q} onChange={...} />
      ))}
      <Button onClick={addQuestion}>Add Question</Button>
    </div>
  );
}
```

---

**Dependencies:** ACAD-001, ACAD-005
**Next:** ACAD-011 (Quiz Engine)
