# ACAD-020: AI Chat Interface

**Status:** 🟢 Complete

**Story Points:** 5
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** HIGH

---

## User Story

As a **Student**,
I want **Real-time AI mentor chat UI**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [x] Chat widget accessible from any page
- [x] Real-time streaming responses (placeholder)
- [x] Chat history display
- [x] Thumbs up/down feedback
- [x] Context awareness (current topic)
- [x] Code snippet formatting
- [x] Copy code button
- [x] Markdown rendering
- [x] Typing indicators

---

## Implementation

```typescript
// src/components/academy/AIMentorChat.tsx
export function AIMentorChat({ topicId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const askMutation = trpc.ai.askMentor.useMutation();

  const sendMessage = async () => {
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);

    const response = await askMutation.mutateAsync({ question: input, topicId });
    setMessages([...messages, userMsg, { role: 'assistant', content: response }]);
  };

  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <Input value={input} onChange={setInput} onEnter={sendMessage} />
    </div>
  );
}
```

---

**Dependencies:** ACAD-013, ACAD-019
**Next:** ACAD-021 (Course Navigation)
