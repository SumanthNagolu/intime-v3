# InTime v3 Landing Page - Product Requirements Document

**Document Type:** Product Requirements
**Feature:** Marketing Landing Page
**Author:** PM Agent
**Date:** November 17, 2025
**Status:** Ready for Architecture Review
**Version:** 1.0

---

## Executive Summary

This document defines comprehensive requirements for the InTime v3 marketing landing page - the first public-facing feature to demonstrate our multi-agent development system and validate our "living organism" platform philosophy. The landing page will serve as the primary marketing vehicle for Year 1 (2026) customer acquisition across all 5 business pillars.

**Strategic Context:**
- **Purpose:** Validate multi-agent development workflow while creating production-ready marketing asset
- **Business Impact:** Primary customer acquisition channel (targeting 60% of Year 1 student enrollment via SEO)
- **Timeline:** Foundation phase deliverable
- **Success Criteria:** SEO rankings (#1-3 for target keywords), conversion rate (5%+ visitor-to-signup), technical excellence (80%+ test coverage)

---

## 1. User Stories

### Primary Personas

#### Persona 1: Career Changer (e.g., "Sarah")
- **Current State:** Stuck in low-paying job ($30K-$50K), wants tech career
- **Pain Points:** Can't afford $15K bootcamps, doesn't know where to start, fears wasting money on wrong program
- **Goals:** Learn marketable skill, get high-paying job ($80K+), career transformation

**User Stories:**
- **US-1.1:** As a career changer, I want to understand what Guidewire is and why it's valuable, so I can decide if this career path is right for me
- **US-1.2:** As a career changer, I want to see success stories of people like me, so I can believe the transformation is possible
- **US-1.3:** As a career changer, I want transparent pricing without hidden fees, so I can budget and commit confidently
- **US-1.4:** As a career changer, I want to see the 8-week curriculum breakdown, so I know exactly what I'll learn
- **US-1.5:** As a career changer, I want proof of job placement (80% rate), so I know this investment will pay off

#### Persona 2: Hiring Manager (e.g., "ABC Insurance CTO")
- **Current State:** Desperate for Guidewire talent, traditional agencies too slow (30+ days)
- **Pain Points:** Critical deadlines at risk, can't find qualified candidates, poor quality from other agencies
- **Goals:** Fill roles fast (48 hours), quality candidates only, reliable long-term partner

**User Stories:**
- **US-2.1:** As a hiring manager, I want to see the 48-hour guarantee prominently, so I know InTime is different
- **US-2.2:** As a hiring manager, I want to understand the pre-vetting process, so I trust candidate quality
- **US-2.3:** As a hiring manager, I want to see client testimonials from similar companies, so I trust this will work for me
- **US-2.4:** As a hiring manager, I want one-click contact (no multi-step forms), so I can get help immediately
- **US-2.5:** As a hiring manager, I want to see specialization (100% Guidewire focus), so I know they understand my needs

#### Persona 3: Guidewire Consultant (e.g., "Vikram")
- **Current State:** On bench (no income), previous agency not helping, bills piling up
- **Pain Points:** Stuck 45+ days on bench, other agencies send few submissions, no transparency
- **Goals:** Get placed fast (30 days), steady work pipeline, agency that cares

**User Stories:**
- **US-3.1:** As a consultant, I want to see "30-day average placement" stat, so I know InTime is faster
- **US-3.2:** As a consultant, I want to understand the commission model, so I know there are no surprises
- **US-3.3:** As a consultant, I want to see success stories from other consultants, so I trust InTime delivers
- **US-3.4:** As a consultant, I want easy registration (not 20-field forms), so I can get started today
- **US-3.5:** As a consultant, I want to see active client relationships, so I know jobs are real

---

## 2. Functional Requirements

### 2.1 Hero Section
**Priority:** P0 (Must Have)

**Requirements:**
- **FR-2.1.1:** Display compelling value proposition headline that captures "living organism" philosophy
  - Suggested: "From Curious to Career-Ready in 8 Weeks" (students) or "Guidewire Talent in 48 Hours, Not 30 Days" (clients)
  - Must be dynamic based on visitor source (student traffic vs recruiter traffic) OR use inclusive messaging
- **FR-2.1.2:** Include primary CTA button (different for each persona)
  - Students: "Start Free Trial" or "Explore Training Program"
  - Clients: "Find Talent Now" or "Get Candidates in 48 Hours"
  - Consultants: "Join Our Network" or "Get Placed Faster"
  - MVP: Single CTA with routing logic post-click
- **FR-2.1.3:** Display trust indicators
  - "600+ Students Trained" (Year 1 target)
  - "80% Placement Rate" (non-negotiable metric)
  - "48-Hour Submission Guarantee" (recruiting differentiator)
- **FR-2.1.4:** Hero image/video showing platform in action
  - Option A: Student using AI mentor (Socratic learning)
  - Option B: Split-screen (student learning + consultant getting placed)
  - Must be accessible (alt text, captions for video)

### 2.2 Social Proof Section
**Priority:** P0 (Must Have)

**Requirements:**
- **FR-2.2.1:** Display 3-5 success stories (carousel or card grid)
  - Sarah's story: $38K → $90K in 45 days
  - ABC Insurance: "Critical deadline saved"
  - Vikram's story: 45 days bench → 12 days with InTime
- **FR-2.2.2:** Include authentic photos, names, job titles (with permission)
- **FR-2.2.3:** Show specific metrics (salary increase, days to placement, client projects saved)
- **FR-2.2.4:** Link to full case studies (future enhancement, initially inline)

### 2.3 5-Pillar Business Model Explanation
**Priority:** P0 (Must Have)

**Requirements:**
- **FR-2.3.1:** Visual representation of 5 pillars with cross-pollination
  - Training Academy → Recruiting → Bench Sales → Talent Acquisition → Cross-Border
  - Interactive diagram showing how one customer creates 5+ opportunities
- **FR-2.3.2:** Each pillar gets expandable card with:
  - Icon (visual identity)
  - 2-3 sentence description
  - Primary benefit (for student/client/consultant)
  - CTA specific to pillar
- **FR-2.3.3:** Highlight cross-pollination engine
  - "1 Conversation = 5+ Opportunities"
  - Concrete example (Raj's journey: enrollment → placement → employer becomes client → immigration)

### 2.4 How It Works (Process Flow)
**Priority:** P1 (Should Have)

**Requirements:**
- **FR-2.4.1:** Student journey (8-week timeline visualization)
  - Week 1-2: Fundamentals
  - Week 3-4: Hands-on projects
  - Week 5-6: Advanced topics
  - Week 7-8: Final project + job prep
  - Visual progress indicator
- **FR-2.4.2:** Recruiting process (client perspective)
  - Step 1: Submit job description
  - Step 2: Receive candidates in 48 hours
  - Step 3: Interview and hire
  - Step 4: Ongoing support
- **FR-2.4.3:** Bench sales process (consultant perspective)
  - Step 1: Join network
  - Step 2: AI matches you to opportunities
  - Step 3: Interview coordination
  - Step 4: Placement in 30 days average

### 2.5 Pricing Section
**Priority:** P0 (Must Have)

**Requirements:**
- **FR-2.5.1:** Transparent pricing (no "contact for quote")
  - Training: $499/month, 2-month average = $998 total
  - Recruiting: $5,000 flat fee per placement (no hidden costs)
  - Bench Sales: $10,000 placement + 5% ongoing commission (clear breakdown)
- **FR-2.5.2:** Value comparison
  - vs $15K bootcamps (Training Academy)
  - vs 30-day agency timelines (Recruiting)
  - vs 60-day industry bench average (Bench Sales)
- **FR-2.5.3:** Money-back guarantee or placement guarantee callout
  - "80% Placement Rate or Refund" (Training)
  - "48-Hour Submission or Free" (Recruiting)

### 2.6 Technology Differentiators
**Priority:** P1 (Should Have)

**Requirements:**
- **FR-2.6.1:** Showcase AI-powered features
  - Socratic AI mentor (24/7 availability)
  - Automated candidate matching (48-hour speed)
  - Cross-pollination engine (5× revenue per customer)
- **FR-2.6.2:** Contrast with traditional approaches
  - Side-by-side comparison table
  - Traditional: Manual, slow, siloed
  - InTime: AI-powered, fast, integrated
- **FR-2.6.3:** "Living organism" messaging
  - Platform learns from every interaction
  - Improves daily (not static software)
  - Scales with your needs

### 2.7 FAQ Section
**Priority:** P1 (Should Have)

**Requirements:**
- **FR-2.7.1:** Address top 10 objections/questions
  - "What if I have no tech background?" (Training)
  - "What's your placement rate?" (Training)
  - "How fast can you really deliver candidates?" (Recruiting)
  - "What if the candidate doesn't work out?" (Recruiting)
  - "How long does bench placement take?" (Bench Sales)
  - "Do I pay anything upfront?" (Bench Sales)
- **FR-2.7.2:** Expandable accordion format (minimize scrolling)
- **FR-2.7.3:** Link to full documentation where appropriate

### 2.8 Primary CTA Section (Above Footer)
**Priority:** P0 (Must Have)

**Requirements:**
- **FR-2.8.1:** Final conversion-focused section
  - Headline: "Ready to Transform Your Career?" or "Need Guidewire Talent Today?"
  - Subheadline: Reinforce primary value prop
  - Large, high-contrast CTA button
- **FR-2.8.2:** Remove friction
  - "No credit card required" (Training trial)
  - "No commitment" (Recruiting consultation)
  - "No placement fee upfront" (Bench Sales)
- **FR-2.8.3:** Visual trust indicators (logos, certifications, ratings)

### 2.9 Footer
**Priority:** P2 (Nice to Have)

**Requirements:**
- **FR-2.9.1:** Standard footer elements
  - Navigation links (About, Contact, Privacy, Terms)
  - Social media links (LinkedIn, Twitter/X, YouTube)
  - Contact information (email, phone, office address if applicable)
- **FR-2.9.2:** Secondary CTAs
  - Newsletter signup ("Guidewire Career Tips")
  - Resource links (Blog, Case Studies, Documentation)

---

## 3. Non-Functional Requirements

### 3.1 Performance
**Priority:** P0 (Must Have)

**NFR-3.1.1:** Page Load Performance
- Initial page load: <2 seconds (desktop), <3 seconds (mobile)
- Largest Contentful Paint (LCP): <2.5 seconds
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1
- Lighthouse Performance Score: 90+

**NFR-3.1.2:** Asset Optimization
- Images: WebP format with fallbacks, lazy loading below fold
- Fonts: Preload critical fonts, subset to required characters
- JavaScript: Code splitting, defer non-critical scripts
- CSS: Critical CSS inline, defer non-critical styles

**NFR-3.1.3:** Caching Strategy
- Static assets: 1 year cache (immutable)
- HTML: Short cache with revalidation (5 minutes)
- API responses (if any): Appropriate cache headers

### 3.2 Accessibility (WCAG 2.1 AA)
**Priority:** P0 (Must Have)

**NFR-3.2.1:** Keyboard Navigation
- All interactive elements accessible via keyboard
- Visible focus indicators (2px outline, high contrast)
- Skip navigation link to main content
- Logical tab order maintained

**NFR-3.2.2:** Screen Reader Support
- Semantic HTML (proper heading hierarchy h1→h6)
- ARIA labels for all interactive elements
- Alt text for all images (descriptive, not generic)
- Form labels properly associated with inputs

**NFR-3.2.3:** Visual Accessibility
- Color contrast ratio: 4.5:1 minimum (text), 3:1 (large text)
- Text resizable up to 200% without breaking layout
- No information conveyed by color alone
- Reduced motion support (prefers-reduced-motion)

**NFR-3.2.4:** Testing
- Lighthouse Accessibility Score: 100
- axe DevTools: Zero violations
- Manual keyboard navigation test
- Screen reader test (NVDA or VoiceOver)

### 3.3 SEO
**Priority:** P0 (Must Have)

**NFR-3.3.1:** On-Page SEO
- Title tag: 50-60 characters, includes primary keyword
- Meta description: 150-160 characters, compelling call-to-action
- Heading hierarchy: One h1, proper h2-h6 structure
- URL structure: Clean, readable, includes keywords (/guidewire-training, /guidewire-staffing)
- Canonical tags: Prevent duplicate content issues

**NFR-3.3.2:** Technical SEO
- robots.txt: Allow all indexing
- Sitemap.xml: Submit to Google Search Console
- Schema.org markup:
  - Organization schema (business details)
  - Course schema (Training Academy)
  - JobPosting schema (if applicable)
  - Review schema (testimonials)
- Open Graph tags (social sharing)
- Twitter Card tags (social sharing)

**NFR-3.3.3:** Target Keywords (Year 1 Focus)
- Primary: "Guidewire training", "PolicyCenter course", "Guidewire staffing"
- Secondary: "BillingCenter training", "ClaimCenter course", "Guidewire recruiters"
- Long-tail: "how to learn Guidewire", "Guidewire developer certification", "Guidewire jobs"
- Goal: Rank #1-#3 for 50+ Guidewire-related keywords

**NFR-3.3.4:** Content Quality
- Minimum 1,500 words total (search engines favor comprehensive content)
- Natural keyword density (1-2%, avoid stuffing)
- Internal linking strategy (link to future blog posts, case studies)
- External links to authoritative sources (Guidewire.com, industry reports)

### 3.4 Responsive Design
**Priority:** P0 (Must Have)

**NFR-3.4.1:** Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

**NFR-3.4.2:** Mobile-First Approach
- Design for mobile first, enhance for larger screens
- Touch targets: Minimum 44×44px (Apple HIG, Google Material)
- Readable font sizes: 16px minimum (avoid zoom on mobile)
- Horizontal scrolling: Never (except intentional carousels)

**NFR-3.4.3:** Cross-Browser Compatibility
- Evergreen browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Graceful degradation for older browsers
- Progressive enhancement where appropriate

### 3.5 Analytics & Tracking
**Priority:** P1 (Should Have)

**NFR-3.5.1:** Event Tracking
- CTA clicks (by persona, by section)
- Video plays (if hero video implemented)
- Scroll depth (25%, 50%, 75%, 100%)
- Form submissions (track conversion funnel)
- Pillar card interactions (expand/collapse, clicks)

**NFR-3.5.2:** Conversion Tracking
- Visitor → Signup conversion rate (target: 5%+)
- Traffic source analysis (organic, referral, direct)
- Bounce rate (target: <50%)
- Average time on page (target: 2+ minutes)

**NFR-3.5.3:** A/B Testing Preparation
- Headless architecture to support variant testing
- Instrumentation for headline variations
- CTA button color/text testing capability

### 3.6 Security
**Priority:** P0 (Must Have)

**NFR-3.6.1:** HTTPS Only
- Force HTTPS redirect
- HSTS header (Strict-Transport-Security)
- Secure cookies (if any)

**NFR-3.6.2:** Content Security
- Content Security Policy (CSP) headers
- No inline scripts (except analytics, properly allowed)
- XSS protection headers
- CORS configuration (if API calls present)

**NFR-3.6.3:** Privacy Compliance
- GDPR-compliant cookie consent (if using analytics cookies)
- Privacy policy link in footer
- Clear data collection disclosure

---

## 4. Content Outline

### 4.1 Hero Section Content

**Headline Options (A/B Test):**
- Variant A (Career Changer Focus): "From Zero to Guidewire Pro in 8 Weeks. 80% Job Placement Guaranteed."
- Variant B (Client Focus): "Guidewire Talent in 48 Hours. Pre-Vetted. Ready to Start."
- Variant C (Living Organism): "The Staffing Platform That Learns, Grows, and Scales With You."

**Subheadline:**
- "InTime isn't software. It's a living organism that thinks with your principles, learns from every interaction, and creates economic mobility through specialized tech education + guaranteed employment."

**CTA Buttons:**
- Primary: "Start Learning Free" (Students)
- Primary: "Get Talent in 48 Hours" (Clients)
- Secondary: "Watch 2-Min Demo" (All personas)

### 4.2 Statistics/Trust Bar Content

Display in prominent banner below hero:
- "600+ Students Enrolled"
- "80% Placement Rate"
- "48-Hour Candidate Delivery"
- "$90K Average Starting Salary"
- "100% Guidewire Specialized"

### 4.3 Social Proof Section Content

**Success Story 1: Sarah Johnson (Career Changer)**
> "I was stuck as a customer service rep making $38,000 a year. After InTime's 8-week PolicyCenter training, I landed a $90,000 job in 45 days. This changed my family's life."
> — Sarah Johnson, PolicyCenter Developer at TechCorp Insurance

**Success Story 2: ABC Insurance (Client)**
> "Our lead developer quit 2 weeks before a critical deadline. InTime submitted 3 qualified candidates by noon on Saturday. We hired one who started Monday. Project saved."
> — John Smith, CTO at ABC Insurance

**Success Story 3: Vikram Patel (Consultant)**
> "I was on my previous agency's bench for 45 days with 2 submissions total. InTime got me 3 submissions in 2 days, 2 interviews, 1 offer. Placed in 12 days."
> — Vikram Patel, ClaimCenter Consultant

### 4.4 5-Pillar Model Content

**Pillar 1: Training Academy**
- Icon: Graduation cap
- Headline: "8-Week Guidewire Bootcamp"
- Description: "Transform from curious to career-ready with AI-powered Socratic mentoring. $499/month. 80% placement rate. No experience required."
- CTA: "Explore Curriculum"

**Pillar 2: Recruiting Services**
- Icon: Rocket/Speed
- Headline: "48-Hour Talent Delivery"
- Description: "Need Guidewire developers? We submit pre-vetted candidates in 48 hours, not 30 days. $5,000 flat fee. No surprises."
- CTA: "Find Talent Now"

**Pillar 3: Bench Sales**
- Icon: Network/Connections
- Headline: "30-Day Bench Placement"
- Description: "Guidewire consultants: Get off the bench in 30 days average (vs industry 60 days). No upfront fees. We succeed when you do."
- CTA: "Join Our Network"

**Pillar 4: Talent Acquisition**
- Icon: Target/Pipeline
- Headline: "Your Dedicated Talent Partner"
- Description: "Building a Guidewire team? We become your outsourced TA function. Proactive pipeline, ongoing support, embedded partnership."
- CTA: "Schedule Consultation"

**Pillar 5: Cross-Border Solutions**
- Icon: Globe
- Headline: "100-Day Immigration Placement"
- Description: "International Guidewire talent for US/Canada opportunities. Complete LMIA support. Job + visa in 100 days."
- CTA: "Explore Immigration"

### 4.5 "Why InTime is Different" Content

**Comparison Table:**

| Feature | Traditional Agencies | InTime |
|---------|---------------------|---------|
| **Speed** | 30+ days average | 48 hours guaranteed |
| **Specialization** | Generalist (5% Guidewire) | 100% Guidewire focus |
| **Talent Creation** | Only place existing talent | Train 600 students/year |
| **Technology** | Manual spreadsheets | AI-powered automation |
| **Pricing** | 15-25% of salary ($15K-$25K) | $5K flat fee |
| **Guarantees** | None | 48-hour submission, 30-day replacement |
| **Cross-Pollination** | Separate silos | 1 conversation = 5+ opportunities |

### 4.6 FAQ Content

**Q1: I have zero tech background. Can I really learn Guidewire?**
> Yes! 40% of our students started with no coding experience. Our AI mentor uses the Socratic method to guide you step-by-step. You'll build real projects, not just watch videos. Average completion: 8 weeks.

**Q2: What's your actual placement rate?**
> 80%+ of graduates get jobs within 90 days. Average starting salary: $85K-$90K. We don't just train you - we actively place you through our recruiting network.

**Q3: How can you deliver candidates in 48 hours?**
> We maintain a pre-vetted talent pool of 500+ Guidewire professionals (including our own graduates). When you submit a job, our AI matches candidates instantly. Human recruiters validate top matches and submit within 48 hours.

**Q4: What if the candidate doesn't work out?**
> 30-day replacement guarantee. If our candidate leaves or underperforms in the first 30 days, we'll find you a replacement at no additional cost.

**Q5: How much does training cost?**
> $499/month subscription. Most students complete in 2 months ($998 total). Compare that to $15,000 bootcamps with no job placement guarantee.

**Q6: Do I pay anything upfront for bench sales?**
> No. $10,000 placement fee when you start working. 5% ongoing commission as long as you're on the project. We only succeed when you do.

**Q7: What makes InTime different from other staffing agencies?**
> Three things: (1) 100% Guidewire specialization, (2) We create talent (training academy), not just place existing talent, (3) AI-powered cross-pollination means one customer creates 5+ revenue opportunities across our ecosystem.

**Q8: Is the 48-hour guarantee real?**
> Yes. If we don't submit candidates within 48 business hours of receiving your job description, the placement fee is free. We've hit this 98% of the time in testing.

**Q9: What Guidewire products do you cover?**
> PolicyCenter, ClaimCenter, BillingCenter, and Guidewire Cloud. We're adding more modules based on market demand.

**Q10: Can I try before committing?**
> Yes! Training Academy: First week free (no credit card). Recruiting: Free consultation to understand your needs. Bench Sales: No upfront fees, you pay when placed.

---

## 5. Success Metrics

### 5.1 Business Metrics
**Measurement Period:** First 90 days post-launch

**Primary KPIs:**
- **Visitor → Signup Conversion:** 5%+ (industry average: 2-3%)
  - Students: Free trial signup
  - Clients: Consultation request
  - Consultants: Network registration
- **SEO Rankings:** #1-#3 for 10+ target keywords within 6 months
  - Primary: "Guidewire training" (target: Top 3)
  - Primary: "Guidewire staffing" (target: Top 3)
  - Long-tail: 50+ keywords in Top 10
- **Traffic Volume:** 10,000+ monthly visitors by Month 6
  - 60% organic (SEO)
  - 20% direct (brand awareness)
  - 20% referral/social

**Secondary KPIs:**
- **Bounce Rate:** <50% (industry average: 55%)
- **Average Time on Page:** 2+ minutes (indicates engagement)
- **Page Views per Session:** 3+ (indicates exploration)
- **Return Visitor Rate:** 30%+ (indicates interest/nurturing)

### 5.2 Technical Metrics
**Continuous Monitoring**

**Performance:**
- Lighthouse Performance Score: 90+
- Page Load Time: <2s (desktop), <3s (mobile)
- Core Web Vitals: All "Good" (LCP, FID, CLS)

**Accessibility:**
- Lighthouse Accessibility Score: 100
- axe DevTools Violations: 0
- WAVE Errors: 0

**SEO:**
- Lighthouse SEO Score: 95+
- Mobile-Friendly Test: Pass
- Schema Markup Validation: Pass (Google Rich Results Test)

### 5.3 User Experience Metrics
**Tracked via Analytics**

**Engagement:**
- CTA Click Rate: 10%+ of visitors
- Video Play Rate: 30%+ (if hero video implemented)
- FAQ Expansion Rate: 40%+ of visitors interact
- Scroll Depth: 50%+ reach bottom of page

**Conversion Funnel:**
- Hero CTA → Form: 50% (low friction)
- Form Start → Form Complete: 70% (simple forms)
- Form Complete → Confirmation: 95% (no technical errors)

---

## 6. Acceptance Criteria

### 6.1 Functional Acceptance
All requirements must be met before production deployment:

**Hero Section:**
- [ ] Displays persona-appropriate headline (dynamic or manual selection)
- [ ] CTA buttons functional with proper tracking
- [ ] Trust indicators display correct metrics
- [ ] Hero image/video loads optimally (<500KB compressed)

**Social Proof:**
- [ ] 3+ success stories displayed with real names/photos (permission obtained)
- [ ] Specific metrics shown (salary, days, client impact)
- [ ] Testimonial carousel functional (if carousel implemented)

**5-Pillar Model:**
- [ ] All 5 pillars displayed with accurate descriptions
- [ ] Icons/visuals consistent with brand identity
- [ ] CTAs link to correct destinations (placeholder pages acceptable for MVP)
- [ ] Cross-pollination visualization clear and understandable

**Pricing:**
- [ ] All prices displayed transparently
- [ ] Value comparisons accurate
- [ ] No "contact for quote" (full transparency)

**FAQ:**
- [ ] Minimum 8 questions answered
- [ ] Accordion functionality works
- [ ] Answers address real objections (validated with user research)

**Footer:**
- [ ] All required links present and functional
- [ ] Contact information accurate
- [ ] Social media links (if profiles exist)

### 6.2 Non-Functional Acceptance

**Performance:**
- [ ] Lighthouse Performance: 90+
- [ ] Page load <2s (desktop), <3s (mobile) on 3G connection
- [ ] All Core Web Vitals in "Good" range

**Accessibility:**
- [ ] Lighthouse Accessibility: 100
- [ ] Zero axe DevTools violations
- [ ] Keyboard navigation test passed
- [ ] Screen reader test passed (NVDA or VoiceOver)

**SEO:**
- [ ] Lighthouse SEO: 95+
- [ ] Title/meta descriptions within character limits
- [ ] Schema markup validates (Google Rich Results Test)
- [ ] Mobile-friendly test passes

**Responsive:**
- [ ] Tested on 5+ devices (mobile, tablet, desktop)
- [ ] No horizontal scrolling (except carousels)
- [ ] Touch targets 44×44px minimum on mobile
- [ ] Readable text without zoom on all devices

**Cross-Browser:**
- [ ] Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- [ ] No critical bugs on any browser
- [ ] Graceful degradation on older browsers (feature detection)

### 6.3 Testing Acceptance

**Test Coverage:**
- [ ] 80%+ code coverage for critical paths
- [ ] Unit tests for utilities (format functions, validation)
- [ ] Integration tests for form submissions
- [ ] E2E tests for primary user flows (visitor → CTA click → form submit)

**E2E Test Scenarios:**
- [ ] Student Journey: Land on page → Read content → Click "Start Learning" → Complete signup
- [ ] Client Journey: Land on page → Review case studies → Click "Get Talent" → Submit consultation request
- [ ] Consultant Journey: Land on page → Read bench stats → Click "Join Network" → Register

**Accessibility Tests:**
- [ ] Automated: axe, Lighthouse, WAVE
- [ ] Manual: Keyboard navigation full page flow
- [ ] Manual: Screen reader announcement test

### 6.4 Content Acceptance

**Quality:**
- [ ] Zero spelling/grammar errors (Grammarly or equivalent)
- [ ] Consistent voice/tone (confident, empathetic, non-salesy)
- [ ] Brand terminology correct ("living organism", "cross-pollination", "Socratic mentor")

**Accuracy:**
- [ ] All statistics verifiable (80% placement, 48-hour guarantee, $90K average salary)
- [ ] Testimonials authentic with permission
- [ ] Pricing matches business model ($499/mo, $5K placement, etc.)

**SEO:**
- [ ] Target keywords naturally integrated (1-2% density)
- [ ] Heading hierarchy logical (one h1, proper h2-h6)
- [ ] Alt text descriptive for all images
- [ ] Internal links present (to future pages/blog)

---

## 7. Out of Scope (Future Enhancements)

The following features are explicitly **not** included in MVP but documented for future consideration:

### Phase 2 Enhancements (Post-Launch)
- **Personalization:** Dynamic content based on visitor source (LinkedIn vs Google vs referral)
- **Chat Widget:** Live chat or AI chatbot for instant questions
- **Video Content:** Professionally produced demo videos (beyond hero)
- **Blog Integration:** Recent blog posts section (requires content creation first)
- **Interactive ROI Calculator:** "Calculate your potential salary increase" (students) or "Time-to-fill savings" (clients)

### Phase 3 Enhancements (Year 1+)
- **Multi-Language Support:** Spanish, Hindi for international audiences
- **Advanced Analytics:** Heatmaps (Hotjar), session recordings (FullStory)
- **Account Creation Flow:** Full registration/onboarding (currently leads to simple form)
- **Resource Library:** Downloadable guides, whitepapers, career roadmaps
- **Community Testimonials:** User-generated content section

---

## 8. Design & Brand Guidelines

### 8.1 Visual Identity
**Tone:** Professional yet approachable, modern, trustworthy

**Color Palette (To be defined by design team):**
- Primary: (Suggest: Deep blue for trust, professional)
- Secondary: (Suggest: Vibrant orange/teal for energy, innovation)
- Neutral: Grays for backgrounds, text
- Semantic: Green (success), Red (urgency), Yellow (warning)

**Typography:**
- Headings: Sans-serif, bold, readable (e.g., Inter, Poppins)
- Body: Sans-serif, 16px minimum, 1.5-1.6 line height
- Code/Technical: Monospace where appropriate

### 8.2 Component Library
Use **shadcn/ui** (per project standards):
- Button variants (primary, secondary, outline, ghost)
- Card components (for pillar sections, testimonials)
- Accordion (FAQ section)
- Typography components (consistent heading styles)

### 8.3 Imagery
**Hero Section:**
- High-quality, authentic photos (avoid generic stock photos)
- Ideally: Screenshots of actual platform or students learning
- Accessibility: Alt text describes image content, not decorative

**Success Stories:**
- Real photos with permission (or illustrated avatars if privacy concerns)
- Professional headshots preferred
- Diverse representation (gender, ethnicity, age)

---

## 9. Dependencies & Integrations

### 9.1 Third-Party Services

**Analytics (Required):**
- Google Analytics 4 or Plausible (privacy-friendly alternative)
- Event tracking for all CTAs, form submissions, video plays

**Forms (Required):**
- Newsletter signup: (To be determined - Supabase native or email service like Resend)
- CTA forms: Lead capture to Supabase database
- Validation: Zod schemas for runtime validation

**Email (Optional for MVP):**
- Resend for transactional emails (welcome, confirmation)
- If not implemented: Store leads in database, manual follow-up initially

### 9.2 Internal Dependencies

**Database (Supabase):**
- `leads` table for capturing CTA form submissions
  - Fields: name, email, phone, interest (student/client/consultant), source, timestamp
  - RLS policies: Public insert (for forms), admin read/update

**Authentication (Not for MVP):**
- Landing page is public, no auth required
- Future: "Start Learning" CTA may require account creation

---

## 10. Risks & Mitigation

### Risk 1: SEO Timeline Unrealistic
**Risk:** Ranking #1-#3 for competitive keywords may take 12+ months (not 6 months)
**Mitigation:**
- Focus on long-tail keywords initially (lower competition)
- Content marketing strategy (blog posts to support SEO)
- Paid ads (Google Ads) to supplement organic during ramp-up

### Risk 2: Conversion Rate Below Target
**Risk:** 5% conversion may be optimistic for cold traffic
**Mitigation:**
- A/B test headlines, CTAs, and value props
- Optimize form friction (reduce fields to minimum)
- Implement exit-intent popups or scroll-triggered CTAs
- Add live chat for instant question handling

### Risk 3: Content Authenticity
**Risk:** Success stories may feel fabricated if not authentic
**Mitigation:**
- Use real names/photos with permission (signed releases)
- Link to LinkedIn profiles where possible (social proof)
- Video testimonials in Phase 2 (higher trust)

### Risk 4: Performance on Low-End Devices
**Risk:** Mobile performance may suffer on older devices/slow connections
**Mitigation:**
- Aggressive image optimization (WebP, lazy loading)
- Minimize JavaScript bundle size (code splitting)
- Test on real devices (BrowserStack or physical devices)
- Fallback: Simplified mobile layout if needed

---

## 11. Launch Checklist

### Pre-Launch (1 Week Before)
- [ ] All acceptance criteria met (functional, non-functional, testing)
- [ ] Analytics configured and tested
- [ ] Forms functional (submissions reach database)
- [ ] SSL certificate active (HTTPS enforced)
- [ ] Google Search Console set up
- [ ] Sitemap submitted
- [ ] 404 page designed and tested
- [ ] Staging environment validated (mirrors production)

### Launch Day
- [ ] Deploy to production (Vercel recommended per tech stack)
- [ ] Smoke test all CTAs (click-through to confirmation)
- [ ] Monitor error logs (Sentry or equivalent)
- [ ] Announce launch (social media, email list if exists)
- [ ] Monitor analytics (real-time traffic validation)

### Post-Launch (First 7 Days)
- [ ] Daily analytics review (traffic, conversions, bounce rate)
- [ ] Fix any critical bugs within 24 hours
- [ ] A/B test preparation (identify test candidates)
- [ ] User feedback collection (optional: simple survey)
- [ ] SEO indexing check (Google Search Console)

### Post-Launch (First 30 Days)
- [ ] Monthly performance report (KPIs vs targets)
- [ ] Conversion funnel analysis (where do users drop off?)
- [ ] SEO keyword ranking check (track progress)
- [ ] Iterate based on data (prioritize highest-impact changes)

---

## 12. Appendix

### A. Target Keyword Research

**Primary Keywords (High Priority):**
- "Guidewire training" (1,000+ monthly searches, high competition)
- "PolicyCenter course" (300+ monthly searches, medium competition)
- "Guidewire staffing" (500+ monthly searches, medium competition)
- "Guidewire recruiters" (200+ monthly searches, low competition)

**Secondary Keywords:**
- "BillingCenter training", "ClaimCenter course", "Guidewire certification"
- "Guidewire developer jobs", "PolicyCenter developer"

**Long-Tail Keywords (Quick Wins):**
- "how to learn Guidewire PolicyCenter"
- "Guidewire training for beginners"
- "best Guidewire staffing agency"
- "Guidewire consultant jobs"

### B. Competitive Analysis

**Competitor 1: Traditional Guidewire Training (e.g., Udemy courses)**
- Strength: Low price ($50-$200)
- Weakness: No job placement, generic content, no support
- InTime Advantage: AI mentor, guaranteed placement, specialized

**Competitor 2: Staffing Agencies (e.g., Robert Half, Guidewire-focused boutiques)**
- Strength: Established relationships, large candidate pool
- Weakness: Slow (30+ days), expensive (20-25% of salary), no training
- InTime Advantage: 48-hour speed, flat fee, we create talent

**Competitor 3: Bootcamps (e.g., General Assembly)**
- Strength: Brand recognition, physical locations
- Weakness: Expensive ($15K), not Guidewire-specific, 12-16 weeks
- InTime Advantage: Specialized (Guidewire only), affordable ($998), faster (8 weeks)

### C. User Research Insights (To Validate)

**Assumption 1:** Career changers hesitate due to cost → Validate with transparent pricing and comparison
**Assumption 2:** Hiring managers doubt speed → Validate with 48-hour guarantee and case study
**Assumption 3:** Consultants distrust agencies → Validate with transparent commission model and success stories

**Recommendation:** Post-launch user interviews (5-10 visitors who didn't convert) to understand objections

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-17 | PM Agent | Initial requirements document created |

---

## Next Steps

**For Architect Agent:**
1. Review this PRD for technical feasibility
2. Design system architecture (Next.js App Router structure, component hierarchy)
3. Define database schema for lead capture (Supabase tables)
4. Create technical specification document
5. Identify any technical risks or constraints

**For Developer Agent (Post-Architecture):**
1. Implement components per architecture
2. Ensure 80%+ test coverage
3. Optimize for performance (Core Web Vitals)
4. Follow accessibility guidelines (WCAG 2.1 AA)

**For QA Agent (Post-Development):**
1. Execute E2E test scenarios
2. Validate accessibility (automated + manual)
3. Cross-browser testing
4. Performance validation
5. Final acceptance criteria review

---

**Questions or Clarifications:**
Contact PM Agent for any requirement clarifications or edge case discussions.
