# Guidewire Guru: Multi-Agent Training Assistant

**Feature:** AI-powered 24/7 training assistant for Guidewire course students
**Architecture:** Multi-Agent System (4 specialists + coordinator)
**Budget:** $304/year (1,000 students)
**ROI:** 2,097× (saves $600K in human mentors)

---

## Overview

Guidewire Guru is an AI-powered training assistant that helps students master the 8-week Guidewire course through:

1. **Code Mentor** - Socratic Q&A, debugging help, concept explanations
2. **Resume Builder** - ATS-optimized resumes showcasing Guidewire skills
3. **Project Planner** - Capstone project breakdown with realistic timelines
4. **Interview Coach** - Behavioral interview prep using STAR method

### Why Multi-Agent?

Each specialist uses a different model optimized for its task:
- Code Mentor → GPT-4o-mini ($0.001/query) - Cheap for high-volume Q&A
- Resume Builder → GPT-4o ($0.15/resume) - Best writing quality
- Project Planner → GPT-4o-mini ($0.02/plan) - Fast planning
- Interview Coach → Claude Sonnet ($0.10/session) - Nuanced coaching

**Result:** 60% cost savings vs. using GPT-4o for everything

---

## Architecture Diagram

```
┌──────────────────────────────────────────┐
│      Coordinator Agent                   │
│  • Routes to correct specialist          │
│  • Tracks conversation context           │
│  • Detects escalation triggers           │
│  Model: GPT-4o-mini                      │
└────────────┬─────────────────────────────┘
             │
  ┌──────────┴──────────┬────────┬─────────┐
  │                     │        │         │
┌─▼───────────┐  ┌──────▼──┐  ┌─▼──────┐  ┌▼─────────┐
│Code Mentor  │  │Resume   │  │Project │  │Interview │
│Agent        │  │Builder  │  │Planner │  │Coach     │
│             │  │         │  │        │  │          │
│Socratic Q&A │  │ATS      │  │Timeline│  │STAR      │
│Debug help   │  │optimized│  │Resource│  │Behavioral│
│Concepts     │  │Writing  │  │plan    │  │Mock int. │
│             │  │         │  │        │  │          │
│GPT-4o-mini  │  │GPT-4o   │  │GPT-4o  │  │Claude    │
│$0.001/query │  │$0.15/   │  │-mini   │  │Sonnet    │
│             │  │resume   │  │$0.02/  │  │$0.10/    │
│             │  │         │  │plan    │  │session   │
└─────────────┘  └─────────┘  └────────┘  └──────────┘
             │
  ┌──────────▼────────────────────────────┐
  │   Knowledge Retrieval (RAG)           │
  │  • Curriculum (pgvector embeddings)   │
  │  • Student history (PostgreSQL)       │
  │  • Similar cases (vector similarity)  │
  └───────────────────────────────────────┘
```

---

## Code Mentor Agent (Primary Feature)

### Purpose

Answer student technical questions using the **Socratic method** - guide them to discover answers rather than telling directly.

### Model Selection

**Primary:** GPT-4o-mini
- **Cost:** $0.0006/1K input tokens, $0.0024/1K output tokens
- **Why:** Cheap enough for high-volume student questions
- **Avg Cost:** $0.001 per interaction (500 input + 200 output tokens)

### Implementation

```typescript
// /src/lib/ai/agents/code-mentor.ts
import { BaseAgent } from '../base-agent';
import { RAGLayer } from '../rag';
import { MemoryLayer } from '../memory';

export class CodeMentorAgent extends BaseAgent {
  private rag: RAGLayer;
  private memory: MemoryLayer;

  constructor() {
    super('code-mentor', 'gpt-4o-mini');
    this.rag = new RAGLayer();
    this.memory = new MemoryLayer();
  }

  async answerQuestion(question: string, studentId: string) {
    // 1. Retrieve curriculum context (RAG)
    const curriculumContext = await this.rag.search({
      query: question,
      collection: 'guidewire_curriculum',
      topK: 3,
      threshold: 0.75
    });

    // 2. Get student history (Memory)
    const conversationHistory = await this.memory.getConversation(
      studentId,
      'code-mentor'
    );
    const studentProgress = await this.getStudentProgress(studentId);

    // 3. Detect if student is struggling (same question 5+ times)
    const questionCount = await this.countSimilarQuestions(
      studentId,
      question
    );

    if (questionCount >= 5) {
      await this.escalateToHuman(studentId, question, conversationHistory);
      return {
        message: "I've noticed you're stuck on this. Let me connect you with a human trainer who can help.",
        escalated: true
      };
    }

    // 4. Generate Socratic response
    const response = await this.llm.complete({
      systemPrompt: this.getSocraticPrompt(),
      context: {
        curriculum: curriculumContext,
        studentHistory: conversationHistory.slice(-10), // Last 10 exchanges
        studentProgress,
        question
      }
    });

    // 5. Save interaction
    await this.memory.saveConversation(studentId, 'code-mentor', [
      ...conversationHistory,
      { role: 'user', content: question },
      { role: 'assistant', content: response.content }
    ]);

    await this.memory.logInteraction({
      userId: studentId,
      agentType: 'code-mentor',
      question,
      response: response.content,
      tokensUsed: response.usage.total_tokens,
      cost: this.calculateCost(response.usage)
    });

    return {
      message: response.content,
      helpful: null, // User will rate with thumbs up/down
      escalated: false
    };
  }

  private getSocraticPrompt(): string {
    return `You are a Guidewire training mentor using the Socratic method.

RULES:
1. NEVER give direct answers - guide students to discover them
2. Ask probing questions that reveal concepts
3. Use real-world examples and analogies
4. Confirm understanding before moving forward
5. If student is stuck after 3 attempts, give a gentle hint (not full answer)

EXAMPLE:
Student: "How does rating work in PolicyCenter?"
BAD: "Rating calculates premiums using rating tables and algorithms..."
GOOD: "Great question! Think about your car insurance. What factors make
       your premium go up or down? How might a system calculate that?"

Context about this student:
- Current module: {moduleId}
- Completed topics: {completedTopics}
- Recent quiz scores: {quizScores}
- Struggling with: {strugglingTopics}

Relevant curriculum:
{curriculumContext}

Student's question: {question}

Respond with Socratic guidance (2-3 sentences + 1-2 probing questions).`;
  }

  private async escalateToHuman(
    studentId: string,
    question: string,
    history: any[]
  ) {
    // Publish event to notify trainers
    await this.eventBus.publish('ai.escalation', {
      studentId,
      agentType: 'code-mentor',
      reason: 'repeated_question',
      question,
      conversationHistory: history.slice(-20) // Last 20 exchanges
    });

    // Create task for trainer
    await this.db.tasks.create({
      type: 'student_help',
      assignedTo: await this.getStudentTrainer(studentId),
      priority: 'high',
      title: `Student stuck on: ${question.substring(0, 50)}...`,
      metadata: { studentId, question, history }
    });
  }
}
```

### Socratic Method Examples

**Bad (Telling):**
```
Student: "What's the difference between PolicyCenter and ClaimCenter?"
AI: "PolicyCenter handles policy management and rating, while ClaimCenter
     handles claims processing and adjudication..."
```

**Good (Socratic):**
```
Student: "What's the difference between PolicyCenter and ClaimCenter?"
AI: "Great question! Let's think about what insurance companies do.
     When you buy car insurance, what happens first? And then, what
     happens if you get into an accident?

     How might a company need different systems for those two workflows?"
```

### Escalation Triggers

```typescript
const ESCALATION_TRIGGERS = {
  // Same question 5+ times
  repeatedQuestion: (questionCount: number) => questionCount >= 5,

  // Student expresses frustration
  frustration: (message: string) => {
    const frustrationKeywords = ['stupid', 'hate', 'quit', 'impossible'];
    return frustrationKeywords.some(kw => message.toLowerCase().includes(kw));
  },

  // Technical environment issue (AI can't fix)
  environmentIssue: (message: string) => {
    return message.includes('sandbox') &&
           (message.includes('broken') || message.includes('not working'));
  },

  // Career advice (needs human judgment)
  careerAdvice: (message: string) => {
    const careerKeywords = ['salary', 'negotiate', 'offer', 'interview tips'];
    return careerKeywords.some(kw => message.toLowerCase().includes(kw));
  }
};

function shouldEscalate(message: string, context: any): boolean {
  return (
    ESCALATION_TRIGGERS.repeatedQuestion(context.questionCount) ||
    ESCALATION_TRIGGERS.frustration(message) ||
    ESCALATION_TRIGGERS.environmentIssue(message) ||
    ESCALATION_TRIGGERS.careerAdvice(message)
  );
}
```

### Cost Projection

```
Per Student (8 weeks):
- Average questions: 30
- Cost per question: $0.001
- Total per student: $0.03

At Scale (1,000 students/year):
- Total questions: 30,000
- Total cost: $30/year

vs. Human mentor:
- $60/hour × 10 hours/student × 1,000 = $600,000/year
- Savings: 99.995%
```

---

## Resume Builder Agent

### Purpose

Generate ATS-optimized resumes that highlight Guidewire skills and maximize job placement chances.

### Model Selection

**Primary:** GPT-4o
- **Cost:** $0.0025/1K input tokens, $0.01/1K output tokens
- **Why:** Best writing quality (resumes directly impact job placement)
- **Avg Cost:** $0.15 per resume (3K input + 1.5K output tokens)

### Implementation

```typescript
// /src/lib/ai/agents/resume-builder.ts
export class ResumeBuilderAgent extends BaseAgent {
  constructor() {
    super('resume-builder', 'gpt-4o'); // Use expensive model for quality
  }

  async buildResume(studentId: string, targetRole: string) {
    // 1. Get student data
    const student = await this.db.getStudentProfile(studentId);
    const completedTopics = await this.db.getTopicCompletions(studentId);
    const capstoneProject = await this.db.getCapstoneProject(studentId);

    // 2. Get successful examples (RAG)
    const successfulResumes = await this.rag.search({
      query: `${targetRole} Guidewire resume high placement rate`,
      collection: 'successful_resumes',
      topK: 5
    });

    // 3. Get job market keywords
    const jobKeywords = await this.rag.search({
      query: targetRole,
      collection: 'job_descriptions',
      topK: 10
    });

    // 4. Generate resume
    const resume = await this.llm.complete({
      systemPrompt: this.getResumePrompt(),
      context: {
        student,
        completedTopics,
        capstoneProject,
        successfulExamples: successfulResumes,
        targetKeywords: jobKeywords.map(jk => jk.content).join(', ')
      }
    });

    // 5. Validate quality
    const quality = await this.validateResume(resume.content);
    if (!quality.passesAll) {
      // Regenerate with feedback
      return this.regenerateWithFeedback(resume.content, quality);
    }

    return {
      content: resume.content,
      formats: {
        markdown: resume.content,
        pdf: await this.convertToPDF(resume.content),
        docx: await this.convertToDOCX(resume.content)
      },
      atsScore: quality.atsScore
    };
  }

  private async validateResume(resume: string) {
    const atsKeywords = ['PolicyCenter', 'ClaimCenter', 'Java', 'Gosu', 'REST API'];
    const actionVerbs = ['Developed', 'Implemented', 'Designed', 'Optimized'];

    return {
      hasATSkeywords: atsKeywords.every(kw => resume.includes(kw)),
      hasActionVerbs: actionVerbs.some(verb => resume.includes(verb)),
      hasQuantifiedAchievements: /\d+%/.test(resume), // "Improved X by 25%"
      lengthAppropriate: this.wordCount(resume) >= 400 &&
                         this.wordCount(resume) <= 600,
      atsScore: this.calculateATSScore(resume),
      passesAll: function() {
        return this.hasATSkeywords && this.hasActionVerbs &&
               this.hasQuantifiedAchievements && this.lengthAppropriate;
      }
    };
  }

  private getResumePrompt(): string {
    return `You are an expert resume writer specializing in Guidewire consultants.

TARGET: ATS-optimized resume for ${targetRole} position

STUDENT BACKGROUND:
- Name: {student.name}
- Completed modules: {completedTopics}
- Capstone project: {capstoneProject}
- Previous experience: {student.previousExperience}

SUCCESSFUL EXAMPLES (use as reference):
{successfulExamples}

REQUIRED KEYWORDS (must include):
{targetKeywords}

FORMAT:
1. Professional Summary (3-4 sentences)
   - Highlight Guidewire expertise
   - Mention key achievements from capstone
   - Use action verbs

2. Technical Skills
   - Group by category (Languages, Frameworks, Tools)
   - Include all Guidewire modules completed

3. Projects (focus on capstone)
   - Use STAR format (Situation, Task, Action, Result)
   - Quantify achievements ("Improved X by Y%")
   - Highlight technical decisions

4. Experience (if any)
   - Previous roles
   - Relevant accomplishments

5. Education
   - IntimeESolutions Guidewire Training (8 weeks, 200+ hours)
   - Previous degrees

RULES:
- ATS-friendly formatting (no tables, simple bullets)
- Action verbs start each bullet
- Quantify achievements where possible
- 1-page maximum (500-600 words)
- No buzzwords or fluff

Generate the resume in Markdown format.`;
  }
}
```

### Quality Gates

Before returning resume to student:
1. ✅ Contains required ATS keywords (PolicyCenter, ClaimCenter, etc.)
2. ✅ Has quantified achievements ("Improved performance by 30%")
3. ✅ Uses action verbs (Developed, Implemented, Designed)
4. ✅ Appropriate length (500-600 words for 1 page)
5. ✅ No typos or grammar errors
6. ✅ ATS score > 80/100

If any quality gate fails → Regenerate with specific feedback

### Cost Projection

```
Per Student:
- 1 resume generation: $0.15
- 2 revisions avg: $0.10
- Total: $0.25/student

At Scale (1,000 students):
- Total: $150/year

vs. Human resume writer:
- $100/resume × 1,000 = $100,000/year
- Savings: 99.85%
```

---

## Project Planner Agent

Quick, affordable planning using GPT-4o-mini.

**Cost:** $0.02/plan
**Purpose:** Break down capstone project into sprints with realistic timelines

---

## Interview Coach Agent

Claude Sonnet for nuanced, empathetic coaching.

**Cost:** $0.10/session
**Purpose:** Mock interviews, STAR method training, confidence building

---

## API Endpoints

```typescript
// /src/app/api/ai/guidewire-guru/route.ts
import { CodeMentorAgent } from '@/lib/ai/agents/code-mentor';
import { ResumeBuilderAgent } from '@/lib/ai/agents/resume-builder';

export async function POST(req: Request) {
  const { agentType, action, data } = await req.json();
  const { studentId } = await authenticateStudent(req);

  switch (agentType) {
    case 'code-mentor':
      const codeMentor = new CodeMentorAgent();
      return codeMentor.answerQuestion(data.question, studentId);

    case 'resume-builder':
      const resumeBuilder = new ResumeBuilderAgent();
      return resumeBuilder.buildResume(studentId, data.targetRole);

    case 'project-planner':
      // Similar pattern...

    case 'interview-coach':
      // Similar pattern...

    default:
      return new Response('Invalid agent type', { status: 400 });
  }
}
```

---

## Success Metrics

| Metric | Target | Actual (to be measured) |
|--------|--------|-------------------------|
| **Accuracy** | 95%+ helpful responses | Track via thumbs up/down |
| **Escalation Rate** | <5% to human trainers | Count escalation events |
| **Response Time** | <2 seconds (95th %ile) | APM monitoring |
| **Student Satisfaction** | 4.5+ stars | Weekly NPS survey |
| **Placement Rate** | 80%+ grads get jobs | Track resume → offer conversion |
| **Cost per Student** | <$0.50 for 8 weeks | Helicone cost dashboard |

---

## Testing Strategy

```typescript
// /src/lib/ai/agents/__tests__/code-mentor.test.ts
describe('Code Mentor Agent', () => {
  it('uses Socratic method (not direct answers)', async () => {
    const agent = new CodeMentorAgent();
    const response = await agent.answerQuestion(
      'What is rating in PolicyCenter?',
      'test-student-id'
    );

    // Should ask probing questions, not give direct answer
    expect(response.message).toContain('?'); // Has questions
    expect(response.message).not.toContain('Rating calculates'); // Not direct
  });

  it('escalates after 5 repeated questions', async () => {
    const agent = new CodeMentorAgent();

    // Ask same question 5 times
    for (let i = 0; i < 5; i++) {
      await agent.answerQuestion('What is rating?', 'test-student-id');
    }

    const response = await agent.answerQuestion(
      'What is rating?',
      'test-student-id'
    );

    expect(response.escalated).toBe(true);
    expect(response.message).toContain('human trainer');
  });

  it('retrieves relevant curriculum context', async () => {
    const agent = new CodeMentorAgent();
    const spy = jest.spyOn(agent.rag, 'search');

    await agent.answerQuestion(
      'How do I configure rating tables?',
      'test-student-id'
    );

    expect(spy).toHaveBeenCalledWith({
      query: 'How do I configure rating tables?',
      collection: 'guidewire_curriculum',
      topK: 3,
      threshold: 0.75
    });
  });
});

describe('Resume Builder Agent', () => {
  it('generates ATS-optimized resume', async () => {
    const agent = new ResumeBuilderAgent();
    const result = await agent.buildResume(
      'test-student-id',
      'Guidewire Developer'
    );

    // Quality checks
    expect(result.content).toContain('PolicyCenter');
    expect(result.content).toContain('ClaimCenter');
    expect(result.atsScore).toBeGreaterThan(80);
    expect(result.formats).toHaveProperty('pdf');
  });

  it('regenerates if quality gates fail', async () => {
    const agent = new ResumeBuilderAgent();

    // Mock low-quality resume
    jest.spyOn(agent, 'validateResume').mockResolvedValueOnce({
      passesAll: false,
      hasATSkeywords: false
    });

    const regenerateSpy = jest.spyOn(agent, 'regenerateWithFeedback');

    await agent.buildResume('test-student-id', 'Guidewire Developer');

    expect(regenerateSpy).toHaveBeenCalled();
  });
});
```

---

## Future Enhancements (Post-MVP)

1. **Voice Interface** - Students can ask questions verbally (Whisper API)
2. **Code Review** - AI reviews capstone project code, suggests improvements
3. **Personalized Learning Paths** - Adapt curriculum based on student progress
4. **Peer Learning** - Connect students struggling with same topic
5. **Mock Interviews with Video** - Record student answers, analyze body language

---

**Status:** ✅ Planned - Ready for Week 7-8 Implementation
**Dependencies:** Epic 1 (Foundation), Epic 2.5 (AI Infrastructure Weeks 5-6)
**Timeline:** Week 7-8 (Sprint 3 of AI Infrastructure epic)
