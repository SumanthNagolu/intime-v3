# ACAD-014: Escalation Logic

**Story Points:** 5
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **AI → human trainer for stuck students**,
So that **I can get help 24/7 and stay motivated**.

---

## Acceptance Criteria

- [ ] Detect stuck students (same question 5+ times)
- [ ] Frustration detection (sentiment analysis)
- [ ] Auto-escalate to human trainer
- [ ] Escalation queue for trainers
- [ ] Trainer notification (Slack/email)
- [ ] Trainer response interface
- [ ] Escalation resolution tracking
- [ ] Analytics (escalation rate, resolution time)

---

## Technical Implementation

```typescript
export function detectEscalation(chatHistory: Chat[]): boolean {
  // Check for repeated questions
  const recentQuestions = chatHistory.slice(-10).map(c => c.question);
  const uniqueQuestions = new Set(recentQuestions);
  
  if (recentQuestions.length - uniqueQuestions.size >= 5) {
    return true; // Same question repeated 5+ times
  }

  // Sentiment analysis for frustration
  const frustrationKeywords = ['stupid', 'quit', 'hate', 'confused', 'help'];
  const hasFrustration = recentQuestions.some(q =>
    frustrationKeywords.some(kw => q.toLowerCase().includes(kw))
  );

  return hasFrustration;
}
```

---

**Dependencies:** ACAD-013
**Next:** ACAD-015 (AI Analytics)
