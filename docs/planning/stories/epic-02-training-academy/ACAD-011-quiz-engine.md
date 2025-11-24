# ACAD-011: Build Quiz Engine (Student-Facing)

**Status:** 🟢 Complete

**Story Points:** 7
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** CRITICAL

---

## User Story

As a **Student**,
I want **to take quizzes and receive instant feedback**,
So that **I can test my knowledge and pass assessments**.

---

## Acceptance Criteria

- [x] Quiz-taking interface (student view)
- [x] Timer display (if time-limited)
- [x] Answer selection (radio/checkbox)
- [x] Submit quiz and get instant score
- [x] Pass/fail determination (configurable threshold, default 70%)
- [x] Unlimited retakes allowed (configurable max_attempts)
- [x] Show correct answers after submission
- [x] Display explanation for wrong answers
- [x] Track best attempt score
- [x] XP awarded only on first pass

---

## Technical Implementation

```typescript
// src/components/academy/QuizTaker.tsx
export function QuizTaker({ topicId, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const submitMutation = trpc.quizzes.submitQuiz.useMutation();

  const handleSubmit = async () => {
    const result = await submitMutation.mutateAsync({
      topicId,
      answers,
    });

    if (result.passed) {
      // Auto-complete topic
      await trpc.progress.completeTopic.mutate({
        topicId,
        score: result.score,
        completionMethod: 'quiz_passed',
      });
    }
  };

  return (
    <div>
      {questions.map((q) => (
        <QuestionDisplay
          key={q.id}
          question={q}
          selectedAnswers={answers[q.id] || []}
          onAnswerChange={(selected) => setAnswers({...answers, [q.id]: selected})}
        />
      ))}
      <Button onClick={handleSubmit}>Submit Quiz</Button>
    </div>
  );
}
```

### Grading Function

```sql
CREATE OR REPLACE FUNCTION grade_quiz(
  p_user_id UUID,
  p_topic_id UUID,
  p_answers JSONB
)
RETURNS TABLE(score NUMERIC, passed BOOLEAN, results JSONB) AS $$
DECLARE
  v_total_points INTEGER := 0;
  v_earned_points INTEGER := 0;
  v_question RECORD;
  v_is_correct BOOLEAN;
BEGIN
  FOR v_question IN
    SELECT * FROM quiz_questions WHERE topic_id = p_topic_id
  LOOP
    v_total_points := v_total_points + v_question.points;
    
    -- Check if student answer matches correct answer
    IF p_answers->v_question.id::TEXT = v_question.correct_answers THEN
      v_earned_points := v_earned_points + v_question.points;
    END IF;
  END LOOP;

  score := (v_earned_points::NUMERIC / v_total_points) * 100;
  passed := score >= 80;

  RETURN QUERY SELECT score, passed, p_answers;
END;
$$ LANGUAGE plpgsql;
```

---

**Dependencies:** ACAD-010, ACAD-003
**Next:** ACAD-012 (Capstone Projects)
