# Epic 2.5: AI Infrastructure & Services - User Stories

**Epic Goal:** Build unified AI infrastructure that powers all AI-driven features across the platform

**Business Value:** Enables $3M/year in cost savings (vs. human labor); 10× productivity multiplier; 24/7 automated intelligence

**Total Stories:** 15
**Total Story Points:** 87
**Estimated Duration:** 8 weeks (Week 5-12)

---

## Sprint Overview

### Sprint 1: Core Infrastructure (Week 5-6, 21 points)

**Goal:** Build foundational AI services for routing, retrieval, and memory

**Stories:**
- **AI-INF-001** - AI Model Router (5 points)
- **AI-INF-002** - RAG Infrastructure (8 points)
- **AI-INF-003** - Memory Layer (8 points)

**Key Deliverables:**
- Intelligent model selection (GPT-4o-mini/GPT-4o/Claude Sonnet)
- pgvector-based semantic search with 85%+ accuracy
- Three-tier memory system (Redis + PostgreSQL + patterns)
- <2 second AI response time (95th percentile)

---

### Sprint 2: Monitoring & Base Agents (Week 7-8, 19 points)

**Goal:** Implement cost tracking, agent framework, and orchestration

**Stories:**
- **AI-INF-004** - Cost Monitoring with Helicone (5 points)
- **AI-INF-005** - Base Agent Framework (8 points)
- **AI-INF-006** - Prompt Library (3 points)
- **AI-INF-007** - Multi-Agent Orchestrator (3 points)

**Key Deliverables:**
- Real-time cost tracking with $500/day budget alerts
- Reusable BaseAgent class with memory + RAG + prompts
- Standardized prompt templates library
- Multi-agent coordination and handoff system

---

### Sprint 3: Guidewire Guru (Week 9-10, 26 points)

**Goal:** Build multi-agent training assistant with 4 specialist agents

**Stories:**
- **AI-GURU-001** - Code Mentor Agent (8 points)
- **AI-GURU-002** - Resume Builder Agent (5 points)
- **AI-GURU-003** - Project Planner Agent (5 points)
- **AI-GURU-004** - Interview Coach Agent (8 points)

**Key Deliverables:**
- Socratic method implementation with curriculum RAG
- ATS-optimized resume generation
- Capstone project breakdown with milestones
- STAR method training and mock interviews
- 95%+ helpful response rate, <5% escalation

---

### Sprint 4: Productivity & Employee Bots (Week 11-12, 21 points)

**Goal:** Build activity tracking and personalized employee AI assistants

**Stories:**
- **AI-PROD-001** - Desktop Screenshot Agent (5 points)
- **AI-PROD-002** - Activity Classification (8 points)
- **AI-PROD-003** - Daily Timeline Generator (3 points)
- **AI-TWIN-001** - Employee AI Twin Framework (5 points)

**Key Deliverables:**
- Privacy-safe screenshot capture (Electron app)
- GPT-4o-mini vision for activity classification (90%+ accuracy)
- Daily narrative reports with insights
- Role-specific AI twins with proactive suggestions
- 80%+ employee adoption rate

---

## Dependencies

**Requires (Blockers):**
- Epic 1 (Foundation) - MUST be complete
  - Database schema and auth
  - Event bus infrastructure
  - tRPC API foundation

**Enables (Downstream):**
- Epic 2 (Training Academy) - AI Mentor integration
- Epic 6 (HR & Employee) - Productivity tracking, AI twins
- Epic 3 (Recruiting) - Resume matching, candidate sourcing

---

## Success Metrics

### Infrastructure Performance
- AI response time: <2 seconds (95th percentile)
- RAG search latency: <500ms
- Memory retrieval: <100ms
- Uptime: 99.5%+

### Cost Efficiency
- Total AI spend: <$280K/year (200 employees + 1,000 students)
- Cost per student: <$0.50 for 8-week program
- Cost per employee: <$1,200/year
- Budget alerts trigger at $500/day threshold

### Business Impact
- Guidewire Guru accuracy: 95%+ helpful responses
- Productivity classification accuracy: 90%+
- Employee bot adoption: 80%+ daily active use
- Time saved per employee: 15+ hours/week

---

## Quality Gates

### Code Quality
- TypeScript: 0 compilation errors
- ESLint: 0 errors
- Tests: 80%+ coverage on AI services
- Build: <3 minutes

### Performance Benchmarks
- Model router: <100ms decision time
- RAG retrieval: <500ms for top 5 results
- Memory lookup: <100ms
- Cost tracking: Real-time (sync)

### Security & Privacy
- API keys stored in environment variables
- No raw screenshots accessible to humans
- Rate limiting: 50 queries/day per student, 20/day per employee
- GDPR/CCPA compliance for productivity tracking

---

## Story Naming Convention

**Infrastructure Stories:** `AI-INF-XXX`
- Core services (router, RAG, memory, monitoring)

**Guidewire Guru Stories:** `AI-GURU-XXX`
- Training assistant specialist agents

**Productivity Stories:** `AI-PROD-XXX`
- Screenshot capture and activity tracking

**Employee Twin Stories:** `AI-TWIN-XXX`
- Personalized workflow assistants

---

## Story Point Distribution

| Sprint | Stories | Points | % of Epic |
|--------|---------|--------|-----------|
| Sprint 1: Core Infrastructure | 3 | 21 | 24% |
| Sprint 2: Monitoring & Agents | 4 | 19 | 22% |
| Sprint 3: Guidewire Guru | 4 | 26 | 30% |
| Sprint 4: Productivity Bots | 4 | 21 | 24% |
| **TOTAL** | **15** | **87** | **100%** |

---

## Definition of Done (Epic 2.5)

**Sprint 1 Complete When:**
- [x] AI Model Router routes to correct model 95%+ accuracy
- [x] RAG Layer retrieves relevant context 85%+ precision
- [x] Memory Layer stores and retrieves conversation history
- [x] Tests passing, 80%+ coverage

**Sprint 2 Complete When:**
- [x] Cost monitoring live with Helicone
- [x] Budget alerts trigger at $500/day
- [x] Base Agent Framework operational
- [x] Prompt Library has 10+ templates

**Sprint 3 Complete When:**
- [x] Guidewire Guru answers student questions (95%+ accuracy)
- [x] Socratic method working (not giving direct answers)
- [x] Resume Builder generates ATS-optimized resumes
- [x] Escalation to human trainers < 5% of queries

**Sprint 4 Complete When:**
- [x] Productivity tracking classifies activities (90%+ accuracy)
- [x] Daily timelines generated for all employees
- [x] Employee AI Twins deliver morning briefings
- [x] Adoption rate: 80%+ employees use AI Twin daily

---

## Testing Strategy

### Unit Tests (Vitest)
- AI router model selection logic
- RAG similarity scoring
- Memory caching and expiration
- Prompt template rendering
- Cost calculation accuracy

### Integration Tests
- Full AI request flow (router → model → response)
- RAG indexing and search pipeline
- Memory storage and retrieval
- Cost tracking and alerting
- Event emission for AI interactions

### E2E Tests (Playwright)
- Student asks question → AI Mentor responds
- Employee views daily timeline
- Resume generation and download
- Cost dashboard displays metrics

### Performance Tests
- Load testing: 100 concurrent AI requests
- RAG search under high load
- Memory layer scalability
- Cost tracking accuracy at scale

---

## Cost Projections (Year 1)

| Use Case | Volume | Cost per Unit | Annual Cost | % of Budget |
|----------|--------|---------------|-------------|-------------|
| **Guidewire Guru** | 1,000 students | $0.30/student | $304 | 0.1% |
| - Code Mentor | 30K interactions | $0.001/query | $30 | - |
| - Resume Builder | 1K resumes | $0.15/resume | $150 | - |
| - Project Planner | 1K plans | $0.02/plan | $20 | - |
| - Interview Coach | 1K sessions | $0.10/session | $104 | - |
| **Productivity Tracking** | 200 employees | $252/employee | $50,400 | 18% |
| - Screenshot classification | 25M images | $0.002/image | $50,000 | - |
| - Daily timelines | 52K reports | $0.01/report | $400 | - |
| **Employee AI Twins** | 200 employees | $1,133/employee | $226,700 | 82% |
| - Morning briefings | 52K briefings | $0.005/briefing | $260 | - |
| - Proactive suggestions | 156K suggestions | $0.005/suggestion | $780 | - |
| - On-demand questions | 260K queries | $0.005/query | $1,300 | - |
| - Real-time coaching | 52K hours | $3/hour | $156,000 | - |
| - Advanced analytics | 52K reports | $0.50/report | $26,000 | - |
| - Infrastructure | - | - | $42,360 | - |
| **TOTAL** | - | - | **$277,404** | **100%** |

**Budget Approved:** $280,000/year
**Remaining Buffer:** $2,596 (1%)

---

## Risk Mitigation

### Technical Risks

**RAG Accuracy Below Expectations (<70%):**
- Mitigation: A/B test RAG vs. no-RAG in Week 6
- Fallback: Remove RAG if improvement < 10%

**Cost Overruns (Exceed $280K):**
- Mitigation: Daily monitoring, $500/day alerts
- Fallback: Rate limiting, model downgrading

**High AI Latency (>5s response time):**
- Mitigation: Streaming responses, async processing
- Fallback: Upgrade to faster models if needed

**Memory Scaling Issues:**
- Mitigation: Redis 5GB limit, 24h TTL cleanup
- Fallback: Use PostgreSQL if Redis unavailable

### Business Risks

**Students Become AI-Dependent:**
- Mitigation: Socratic method, quiz validation, detect dependency patterns

**Privacy Concerns with Screenshots:**
- Mitigation: Transparent communication, employee controls, no human review

**Low Employee AI Twin Adoption:**
- Mitigation: Onboarding training, early wins, manager endorsement

---

## Related Documentation

- **Epic Definition:** `/docs/planning/epics/epic-02.5-ai-infrastructure.md`
- **Architecture Details:** `/docs/planning/AI-ARCHITECTURE-STRATEGY.md`
- **Use Case Guides:** `/docs/planning/ai-use-cases/`
- **Epic 2:** Training Academy (depends on AI Infrastructure)
- **Epic 6:** HR & Employee (productivity tracking, AI twins)

---

## Story Files

All stories are located in this directory with the naming pattern:
- `AI-INF-XXX-description.md` - Infrastructure stories
- `AI-GURU-XXX-description.md` - Guidewire Guru specialist agents
- `AI-PROD-XXX-description.md` - Productivity tracking stories
- `AI-TWIN-XXX-description.md` - Employee AI twin stories

---

**Status:** ✅ READY FOR IMPLEMENTATION
**Next Epic:** Epic 2 (Training Academy) - Continues in parallel
**Estimated Start:** Week 5 (after Foundation Sprint 1-2 complete)

---

*AI Infrastructure is the foundation for all AI-powered features in InTime v3. Build once, use everywhere.*
