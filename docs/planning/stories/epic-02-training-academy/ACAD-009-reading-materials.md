# ACAD-009: Build Reading Materials Renderer

**Status:** ⚪ Not Started

**Story Points:** 3
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** MEDIUM

---

## User Story

As a **Student**,
I want **to read course materials with rich formatting**,
So that **I can learn from text-based content effectively**.

---

## Acceptance Criteria

- [ ] Markdown rendering with syntax highlighting
- [ ] PDF viewer embedded
- [ ] Code block copy functionality
- [ ] Responsive layout (mobile-friendly)
- [ ] Dark mode support
- [ ] Reading progress tracking (scroll percentage)
- [ ] Auto-mark complete when scrolled to bottom
- [ ] Table of contents for long articles
- [ ] Print-friendly CSS

---

## Technical Implementation

```typescript
// src/components/academy/MarkdownReader.tsx
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export function MarkdownReader({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter language={match[1]} {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

---

**Dependencies:** ACAD-001, ACAD-003
**Next:** ACAD-010 (Quiz Builder)
