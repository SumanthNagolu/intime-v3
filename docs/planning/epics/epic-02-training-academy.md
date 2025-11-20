# Epic 2: Training Academy (LMS)

**Status:** 🔵 **READY FOR IMPLEMENTATION** (30 stories planned, 0% implemented)
**Planning Complete:** 2025-11-18

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 Epic Name:** Training Academy (LMS)

**🎯 Goal:** Transform career changers into job-ready IT consultants in 8 weeks through AI-powered Socratic learning

**💰 Business Value:** $599K Year 1 revenue (600 students × $998 avg); 80% placement rate creates recruiting pipeline; 95% gross margin (AI-powered scalability)

**👥 User Personas:**

- Students (career changers, college grads, IT professionals seeking new technical skills)
- Trainers (senior + junior trainer pod, manage 50 students per cohort)
- AI Mentor (GPT-4o-mini, 24/7 Socratic guidance for any course)
- Course Admins (create courses, manage curriculum, track completions)
- System Admins (track overall completions, placement rates, revenue)

**🎁 Key Features:**

- Course catalog (multi-course support: Guidewire, Salesforce, AWS, etc.)
- Flexible curriculum builder (N modules × M topics per course, configurable)
- Video lessons (hosted on Vimeo, embedded with progress tracking)
- Interactive labs (sandbox environments, hands-on exercises, auto-provisioning)
- AI-powered Socratic mentor (GPT-4o-mini, course-specific context, escalation to human)
- Quiz system (auto-graded, configurable pass requirements, unlimited retakes)
- Capstone projects (GitHub integration, peer review, demo videos, portfolio pieces)
- Progress tracking (topic completions, XP points, achievements/badges per course)
- Certificate generation (auto-issue on graduation, branded PDFs, LinkedIn integration)
- Gamification (leaderboards, badges, XP transactions, cohort competitions)
- Student dashboard (current module, next steps, AI mentor chat, multi-course enrollment)
- Trainer dashboard (student progress, at-risk students, grading queue, cohort analytics)
- Course admin tools (create/edit courses, manage curriculum, upload content)

**📊 Success Metrics:**

- 70% completion rate (420 of 600 students complete 8-week program)
- 80% placement rate (336 grads placed within 90 days)
- Average time-to-complete: 8 weeks (vs 12-week bootcamps)
- Student satisfaction: 4.5+ stars (NPS 50+)
- AI mentor accuracy: 95%+ helpful responses (thumbs up/down)
- Escalation rate to human trainer: <5% of interactions

**🔗 Dependencies:**

- **Requires:** Epic 1 (Foundation - auth, user management, event bus)
- **Requires:** Epic 2.5 (AI Infrastructure - model router, RAG layer, agents for Guidewire Guru)
- **Enables:** Epic 3 (Recruiting - graduates become candidates)
- **Blocks:** None

**⏱️ Effort Estimate:** 6 weeks, ~30 stories

**📅 Tentative Timeline:** Week 5-10 (Post-Foundation)

**Key Stories (Sample):**

1. Create courses table (multi-course catalog, metadata, pricing, prerequisites)
2. Build curriculum builder (modules, topics, lessons hierarchy - flexible N×M structure)
3. Implement video player (Vimeo embed, progress tracking, completion events)
4. Create quiz system (questions bank, attempts, scoring, configurable pass criteria)
5. Build AI mentor integration (OpenAI API, course-specific context, Socratic prompts)
6. Implement capstone project workflow (GitHub repo creation, submission, peer review)
7. Create progress tracking (topic_completions, XP transactions, multi-course support)
8. Build student dashboard (current progress, next steps, AI chat, enrolled courses)
9. Implement graduation workflow (completion check, event publish, certificate generation)
10. Create trainer dashboard (grading queue, student analytics, at-risk alerts)
11. Build achievement system (badges, triggers, unlocks, gamification)
12. Implement payment processing (Stripe subscription, per-course or all-access)
13. Create enrollment workflow (course selection, payment, onboarding automation)
14. Build leaderboard (XP rankings, cohort comparisons, cross-course leaderboards)
15. Implement escalation logic (AI → human trainer for stuck students)
16. Create course admin portal (CRUD courses, upload content, manage curriculum)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## Curriculum Architecture

### Generic Course Structure (Configurable)

**LMS supports flexible N-module structure. Each course defines:**
- **Modules:** High-level learning units (typically 4-8 modules per course)
- **Topics:** Specific lessons within modules (5-10 topics per module)
- **Content Types:** Videos, readings, quizzes, labs, projects
- **Prerequisites:** Module/topic dependencies (must complete A before B)
- **Pass Criteria:** Quiz scores, project submissions, completion percentages

### Example: Guidewire Course (8 weeks, 7 modules)

**Module 1: Domain Fundamentals (Week 1)**
- Industry context and terminology
- Business processes overview
- Key concepts and workflows

**Module 2: Platform Basics (Week 2)**
- Tool overview and data model
- Core entities and navigation
- Configuration fundamentals

**Module 3: Core Configuration (Weeks 3-4)**
- Product/feature design
- Scripting and rules engine
- Project: Build sample implementation

**Module 4: Integrations (Week 5)**
- API patterns (REST, SOAP)
- Integration architecture
- Project: External system integration

**Module 5: Advanced Topics (Week 6)**
- Performance optimization
- Batch processing
- Troubleshooting and debugging

**Module 6: Complementary Tools (Week 7)**
- Related platforms/modules
- Cross-system workflows
- Integration patterns

**Module 7: Capstone Project (Week 8)**
- End-to-end implementation
- Portfolio-ready deliverable
- Documentation and presentation

### Example: Other Course Structures

**Salesforce Admin (6 weeks):**
- Module 1: CRM Basics → Module 6: Capstone

**AWS Solutions Architect (10 weeks):**
- Module 1: Cloud Fundamentals → Module 10: Certification Prep

**Full-Stack Development (12 weeks):**
- Module 1: HTML/CSS → Module 12: Production Deployment

---

## AI Mentor Implementation

### Socratic Method (Course-Agnostic)

**Principle:** Guide students to discover answers, don't just tell them.

**Bad Response (Just Telling):**
"Feature X uses pattern Y with configuration Z..."

**Good Response (Socratic):**
"Great question! Let's explore this together. Think about a real-world scenario where you might need this functionality. What do you think the system needs to track?"

[Student engages → AI asks follow-up questions → Student discovers answer → AI confirms/corrects]

**Example: Guidewire Course**
- Student: "How does rating work in PolicyCenter?"
- AI: "Great question! Before we dive in, have you ever wondered how your car insurance company decides your premium? What factors do you think they consider?"

**Example: AWS Course**
- Student: "What's the difference between S3 and EBS?"
- AI: "Good question! Let's think about how you use storage in real life. Where do you keep files you rarely access vs. files you use every day? How might that apply to cloud storage?"

**Example: Salesforce Course**
- Student: "When should I use a workflow rule vs. process builder?"
- AI: "Excellent question! Think about a simple task vs. a complex multi-step process. Can you describe the business requirement you're trying to automate?"

### Escalation Triggers

AI escalates to human trainer when:
- Student asks same question 5+ times (not getting it)
- Student expresses frustration ("this is stupid," "I want to quit")
- Technical issue AI can't solve (sandbox access, environment setup)
- Complex career advice ("should I negotiate my offer?")

### Cost Analysis

**Per Student:**
- Average interactions: 30 per student
- Average tokens: 500 per interaction
- Cost: $0.009 per student

**At Scale (1,000 students):**
- Total cost: $9/month
- Human mentor equivalent: $600K/year
- **Savings: 99.99%**

---

## Revenue Model

### Pricing

- **Subscription:** $499/month
- **Average duration:** 2 months (some 6 weeks, some 10 weeks)
- **Average revenue per student:** $998

### Year 1 Projections

**Enrollment Ramp:**
- Month 1-3: 20 students/month × $998 = $19,960/month
- Month 4-6: 30 students/month × $998 = $29,940/month
- Month 7-9: 40 students/month × $998 = $39,920/month
- Month 10-12: 50 students/month × $998 = $49,900/month

**Total Year 1:** 450 students × $998 = $449,100

### Indirect Revenue (Cross-Pollination)

- 80% placement rate → 360 placements × $5,000 = $1,800,000 (recruiting revenue)
- Training attribution bonus: 15% of placement fee = $270,000
- **Total Attributed Revenue:** $449,100 + $270,000 = $719,100

---

## Success Criteria

**Definition of Done:**

1. ✅ Student can enroll, pay, and start Module 1
2. ✅ AI mentor responds within 2 seconds with Socratic guidance
3. ✅ Student completes all 7 modules and graduates
4. ✅ Certificate auto-generated and downloadable
5. ✅ Graduation event published to recruiting pod
6. ✅ Trainer can review progress and grade submissions
7. ✅ XP and badges awarded for completions
8. ✅ Payment processing works (Stripe integration)

**Quality Gates:**

- AI mentor accuracy: 95%+ (measured by student thumbs up/down)
- Completion rate: 70%+ (420 of 600 students)
- Placement rate: 80%+ (336 grads placed within 90 days)
- Student satisfaction: 4.5+ stars (NPS 50+)
- System uptime: 99.5%+ (students study 24/7)

---

**Related Epics:**
- [Epic 1: Foundation](./epic-01-foundation.md) (Required)
- [Epic 3: Recruiting Services](./epic-03-recruiting-services.md) (Enabled)

**Next Epic:** [Epic 3: Recruiting Services](./epic-03-recruiting-services.md)
