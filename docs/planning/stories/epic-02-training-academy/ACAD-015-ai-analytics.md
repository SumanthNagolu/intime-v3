# ACAD-015: AI Analytics

**Status:** ⚪ Not Started

**Story Points:** 4
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **Response quality, thumbs up/down, improvement tracking**,
So that **I can get help 24/7 and stay motivated**.

---

## Acceptance Criteria

- [ ] Track response quality (thumbs up/down)
- [ ] Calculate helpful response percentage
- [ ] Identify common question patterns
- [ ] Flag low-quality responses for review
- [ ] A/B test prompt improvements
- [ ] Cost per conversation tracking
- [ ] Token usage analytics
- [ ] Response time monitoring

---

## Implementation

```sql
CREATE TABLE ai_mentor_analytics (
  date DATE PRIMARY KEY,
  total_questions INTEGER DEFAULT 0,
  helpful_responses INTEGER DEFAULT 0,
  unhelpful_responses INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER,
  total_tokens_used INTEGER,
  total_cost_usd NUMERIC(10,4),
  escalation_count INTEGER DEFAULT 0
);
```

---

**Dependencies:** ACAD-013, ACAD-014
**Next:** ACAD-016 (Achievement System)
