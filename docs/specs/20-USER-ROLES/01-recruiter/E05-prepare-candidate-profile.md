# Use Case: Prepare Candidate Profile

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-E05 |
| Actor | Recruiter |
| Goal | Format candidate profile for professional client presentation |
| Frequency | 5-10 times per week |
| Estimated Time | 15-20 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Candidate has been screened and approved for submission
3. Resume and screening notes available
4. Client submission format known

---

## Trigger

- Candidate approved for submission
- Client requests candidate profile
- Preparing submission package

---

## Main Flow

### Step 1: Open Profile Builder

**User Action:** Click "Prepare Profile" from candidate or submission flow

**Screen State:**
```
+----------------------------------------------------------+
|                          Profile Builder              [×] |
+----------------------------------------------------------+
| Candidate: Jane Doe | For: TechStart Inc                  |
| Job: Senior Backend Engineer                              |
+----------------------------------------------------------+
|                                                           |
| PROFILE TEMPLATE                                          |
| [InTime Standard Format                         ▼]       |
| ○ InTime Standard   ○ Client Custom   ○ Minimal          |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| CANDIDATE SUMMARY (Auto-generated, editable)              |
| ┌────────────────────────────────────────────────────┐  |
| │ Senior Backend Engineer with 6+ years building     │  |
| │ high-scale distributed systems. Currently at Meta  │  |
| │ leading payment processing infrastructure. Expert  │  |
| │ in Node.js, TypeScript, and AWS with strong        │  |
| │ FinTech domain experience.                         │  |
| │                                                     │  |
| │ [✏ Edit] [🔄 Regenerate]                          │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| KEY HIGHLIGHTS                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ ☑ 6 years backend development experience          │  |
| │ ☑ Payment processing expertise (Stripe, internal) │  |
| │ ☑ Led team of 6 engineers at Meta                 │  |
| │ ☑ MS Computer Science, Stanford                   │  |
| │ ☑ AWS Solutions Architect certified               │  |
| │ [+ Add highlight]                                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| SKILLS MATRIX                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ Skill          Years   Level      Job Match       │  |
| │ ────────────────────────────────────────────────  │  |
| │ Node.js        5       Expert     ✓ Required      │  |
| │ TypeScript     3       Expert     ✓ Required      │  |
| │ PostgreSQL     4       Advanced   ✓ Required      │  |
| │ AWS            4       Advanced   ✓ Required      │  |
| │ Kafka          2       Advanced   ★ Bonus         │  |
| │ Kubernetes     2       Proficient ★ Bonus         │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| EXPERIENCE SUMMARY                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ META (2022 - Present) | Sr. Software Engineer     │  |
| │ • Led payment processing pipeline, $2B monthly    │  |
| │ • Achieved 50ms p99 latency, 99.99% uptime       │  |
| │ • Mentored 3 junior engineers                     │  |
| │                                                     │  |
| │ STRIPE (2019 - 2022) | Software Engineer          │  |
| │ • Built merchant onboarding automation            │  |
| │ • Reduced onboarding time by 60%                  │  |
| │                                                     │  |
| │ [✏ Edit Experience]                               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| WHY THIS CANDIDATE                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ [Jane is an excellent fit for TechStart's Senior  │  |
| │  Backend role because:                             │  |
| │  1. Deep payment processing experience matches    │  |
| │     their core product                            │  |
| │  2. Proven track record at high-scale companies  │  |
| │  3. Leadership experience aligns with team growth│  |
| │  4. Motivated by FinTech and startup environment]│  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PREVIEW                                        [Download] |
| [📄 Preview PDF]                                          |
|                                                           |
+----------------------------------------------------------+
|       [Save Draft]  [Cancel]  [Finalize Profile ✓]       |
+----------------------------------------------------------+
```

---

### Step 2: Customize and Finalize

**User Action:** Edit sections as needed, click "Finalize Profile ✓"

**System Response:**
1. Profile saved to candidate record
2. PDF generated and stored
3. Ready for submission attachment

---

## Profile Template Sections

| Section | Content | Editable |
|---------|---------|----------|
| Summary | 3-4 sentence overview | Yes (AI-generated) |
| Key Highlights | 5-7 bullet points | Yes |
| Skills Matrix | Technical skills + job match | Auto + editable |
| Experience | Condensed work history | Yes |
| Why This Candidate | Recruiter pitch | Yes |
| Education | Degrees, certs | Auto-populated |

---

## Postconditions

1. ✅ Profile formatted for client
2. ✅ PDF generated
3. ✅ Linked to candidate record
4. ✅ Ready for submission

---

## Related Use Cases

- [E03-screen-candidate.md](./E03-screen-candidate.md) - Gather information
- [F01-submit-candidate.md](./F01-submit-candidate.md) - Include in submission

---

*Last Updated: 2025-12-05*

