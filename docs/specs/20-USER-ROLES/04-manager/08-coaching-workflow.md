# Use Case: Coaching Workflow - 1:1s and Team Development

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-MGR-005 |
| Actor | Manager |
| Goal | Conduct effective 1:1 coaching sessions to develop IC skills and drive performance improvement |
| Frequency | Weekly per IC (rotating schedule) |
| Estimated Time | 30-60 minutes per 1:1 |
| Priority | High (Core management responsibility) |

---

## Preconditions

1. User is logged in as Manager
2. Manager is assigned to active pod with ICs
3. 1:1 is scheduled in advance (recurring or ad-hoc)
4. Manager has reviewed IC's recent performance metrics
5. Previous 1:1 notes are accessible

---

## Trigger

One of the following:
- Scheduled weekly 1:1 time arrives
- Performance issue requires immediate coaching
- IC requests coaching on specific challenge
- Post-escalation debrief needed
- Career development discussion scheduled
- Quarterly performance review cycle

---

## Main Flow (Click-by-Click)

### Step 1: Prepare for 1:1 Session

**Time: 15 minutes before scheduled 1:1**

**User Action:** Navigate to 1:1 Preparation Screen

**Option A: From Calendar Reminder**
- Calendar reminder pops up: "1:1 with John Smith in 15 minutes"
- Manager clicks "Prepare for 1:1"
- System opens preparation screen
- Time: ~5 seconds

**Option B: From Manager Dashboard**
- Manager clicks "Upcoming 1:1s" widget
- List shows: "John Smith - Today 2:00 PM"
- Manager clicks "Prepare"
- Time: ~10 seconds

**URL:** `/employee/manager/1on1/{user_id}/prepare`

---

**Screen State:**
```
+------------------------------------------------------------------+
| 1:1 Preparation - John Smith                          [In 15 min] |
+------------------------------------------------------------------+
| Last 1:1: Nov 21, 2024 (7 days ago)      Next: Nov 28, 2024 2 PM |
| 1:1 Count: 18 total (avg duration: 42 minutes)                   |
+------------------------------------------------------------------+
| PERFORMANCE SNAPSHOT (Last 7 Days)                                |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Sprint Progress:     1/1 ✅ (100% - On Track)               │ |
| │ Activities This Week: 32 (Above avg)                         │ |
| │ Submissions Created:  3 (Below target of 5)                  │ |
| │ Interviews Scheduled: 2 (On target)                          │ |
| │ Placements:          1 (Sprint target met!)                  │ |
| │ Pipeline Health:     Good (12 active jobs, 18 submissions)   │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| RECENT WINS                                                       |
| 🎉 Placed Kevin Lee at Oracle ($85/hr) - Nov 27                 |
| ⭐ Client feedback: 5/5 stars on Sarah Chen placement           |
| 📈 Submission rate improved from 2 to 3 this week               |
+------------------------------------------------------------------+
| AREAS OF CONCERN                                                  |
| ⚠️ Submission rate still below target (3 vs 5 per week)         |
| ⚠️ Google client stale for 10 days (no response on 2 submissions)|
| ⚠️ Last escalation: Rate error on Google contract (Nov 28)      |
+------------------------------------------------------------------+
| PREVIOUS 1:1 ACTION ITEMS (From Nov 21)                          |
| ┌────────────────────────────────┬────────────┬───────────────┐ |
| │ Action Item                    │ Due Date   │ Status        │ |
| ├────────────────────────────────┼────────────┼───────────────┤ |
| │ Improve submission quality     │ Nov 28     │ ✅ Done       │ |
| │ Follow up on stale Google jobs │ Nov 25     │ ⚠️ Partial   │ |
| │ Complete LinkedIn training     │ Nov 30     │ 🔴 Overdue   │ |
| └────────────────────────────────┴────────────┴───────────────┘ |
+------------------------------------------------------------------+
| SUGGESTED TALKING POINTS (AI-Generated)                           |
| 1. Celebrate Kevin Lee placement (Oracle) - What went well?     |
| 2. Discuss Google stale jobs - Need escalation support?         |
| 3. Review contract management process (after escalation)         |
| 4. Address submission rate gap (3 vs target 5) - Blockers?      |
| 5. LinkedIn training overdue - Need help or just time?           |
| 6. Career development: Interest in lead role for Q1 projects?   |
+------------------------------------------------------------------+
| MANAGER'S PREP NOTES (Private)                                    |
| [                                                              ]  |
| [ - Start with wins (Oracle placement, client feedback)      ]  |
| [ - Discuss Google escalation as learning opportunity         ]  |
| [ - Focus on submission rate improvement strategies           ]  |
| [ - Offer to handle Google escalation if needed               ]  |
| [ - Check on LinkedIn training blockers                       ]  |
| [ - Explore career growth interests                           ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| [Save Prep Notes] [View Full History] [Start 1:1 Now]           |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Description | Data Source | Purpose |
|-------|-------------|-------------|---------|
| Performance Snapshot | 7-day rolling metrics | `placements`, `activities`, `submissions` | Quick status overview |
| Recent Wins | Positive highlights | `placements`, `client_feedback` | Start conversation positively |
| Areas of Concern | Issues needing discussion | Calculated from metrics | Focus coaching areas |
| Previous Action Items | From last 1:1 | `one_on_one_notes.action_items` | Accountability tracking |
| Suggested Talking Points | AI-generated agenda | ML model analyzing trends | Ensure comprehensive coverage |
| Manager's Prep Notes | Private coaching notes | `one_on_one_prep.notes` | Manager's personal preparation |

**Manager Action:** Review all sections, add prep notes

**User Action:** Click "Save Prep Notes"

**System Response:**
- Notes saved to `one_on_one_prep` table
- Only visible to manager (not IC)
- Toast: "Prep notes saved ✓"

**Time:** ~10-15 minutes total preparation

---

### Step 2: Start 1:1 Session

**User Action:** Click "Start 1:1 Now" button

**System Response:** 1:1 Session Screen opens

**Screen State:**
```
+------------------------------------------------------------------+
| Active 1:1 Session - John Smith                      [00:00:00 ⏱] |
+------------------------------------------------------------------+
| Session Date: Nov 28, 2024 2:00 PM                                |
| Format: ● In-Person  ○ Video Call  ○ Phone                       |
+------------------------------------------------------------------+
| AGENDA                                               [Edit Agenda] |
| ☐ 1. Wins & Celebrations (5 min)                                 |
| ☐ 2. Action Items Review from Last 1:1 (5 min)                   |
| ☐ 3. Current Sprint Progress (10 min)                            |
| ☐ 4. Challenges & Blockers (15 min)                              |
| ☐ 5. Skill Development & Growth (10 min)                         |
| ☐ 6. Next Actions (5 min)                                        |
+------------------------------------------------------------------+
| LIVE NOTES (Shared with IC after session)                         |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| PRIVATE NOTES (Manager only)                                      |
| [                                                              ]  |
| [                                                              ]  |
+------------------------------------------------------------------+
| ACTION ITEMS                                                      |
| [ No action items yet - Add during conversation ]               |
| [+ Add Action Item]                                              |
+------------------------------------------------------------------+
| [End Session] [Save Draft] [Schedule Next 1:1]                   |
+------------------------------------------------------------------+
```

**System Action:** Timer starts automatically

**Time:** Session begins

---

### Step 3: Conduct Structured 1:1 Conversation

#### 3A: Wins & Celebrations (5 minutes)

**Manager Dialogue Flow:**

**Manager:** "Hey John, great to connect! First off, congrats on placing Kevin at Oracle yesterday. That was a big win for the sprint. Walk me through how that came together."

**IC Response:** "Thanks! Kevin was sourced from my LinkedIn outreach campaign. I screened him on Monday, submitted Tuesday, Oracle interviewed Wednesday, and they made an offer same day. Super smooth process."

**Manager:** "That's excellent - 4-day turnaround from source to placement! What do you think made this one go so well?"

**IC Response:** "Kevin's skills were a perfect match, and I did thorough prep for his interview. Also, Oracle has been responsive lately."

**Manager Action:** Type live notes while listening

**User Action:** Type in "Live Notes" section:

```
WINS & CELEBRATIONS:
- Kevin Lee → Oracle placement ($85/hr) - 4-day cycle (Mon sourced → Thu offer)
- Key success factors:
  * Perfect skills match (Java, Spring Boot, AWS)
  * Thorough interview prep with candidate
  * Client responsiveness (Oracle)
- John is getting better at candidate prep - this is working!

Client Feedback:
- Sarah Chen @ Microsoft: 5/5 stars client feedback
- Client said: "Exactly what we needed, great cultural fit"
```

**Manager:** "Also saw you got 5-star feedback on Sarah Chen at Microsoft. That's awesome! Keep doing whatever you're doing there."

**IC Response:** "Yeah, I'm really proud of that one. I spent extra time understanding their culture before submitting Sarah."

**Manager Action:** Check off "✅ 1. Wins & Celebrations" in agenda

**Time:** ~5 minutes

---

#### 3B: Action Items Review (5 minutes)

**Manager:** "Let's quickly check on action items from our last 1:1. I see you completed the submission quality improvement - nice! What did you change?"

**IC Response:** "I started doing more thorough pre-screening calls before submitting. Now I only submit candidates I'd personally hire."

**Manager:** "Love that standard. That's why your submissions convert better now."

**Manager:** "I see Google follow-up is marked 'partial' - what's the status there?"

**IC Response:** "I followed up twice by email, but Jane hasn't responded in 10 days. I'm not sure if I should keep pushing or escalate."

**Manager:** "Good awareness. That's exactly when to loop me in. I'll reach out to Jane directly today - she and I have a relationship from previous projects. You did the right thing by trying twice first."

**User Action:** Update "Live Notes":

```
ACTION ITEMS REVIEW:
✅ Submission quality improvement - DONE
  → John now doing deeper pre-screening before submitting
  → New standard: "Only submit candidates I'd personally hire"

⚠️ Google follow-up - PARTIAL
  → John followed up 2x via email (Nov 18, Nov 25)
  → No response in 10 days from Jane (client)
  → Manager will escalate today - client relationship warm-up needed
```

**Manager:** "LinkedIn training is showing overdue. What's going on there?"

**IC Response:** "Honestly, I just haven't made time. I know it's important, but I've been prioritizing placements."

**Manager:** "I get it - placements come first. But this training will actually help you source faster. Can you commit to 30 minutes this week? Maybe Friday afternoon when things slow down?"

**IC Response:** "Yeah, I can do that. Friday works."

**User Action:** Update action item status in system:

- "Follow up on Google jobs" → Status: "Escalated to Manager"
- "Complete LinkedIn training" → New Due Date: "Dec 1, 2024 (Friday)"

**Manager Action:** Check off "✅ 2. Action Items Review" in agenda

**Time:** ~5 minutes

---

#### 3B: Current Sprint Progress (10 minutes)

**Manager:** "You hit your sprint target with Kevin's placement - that's awesome. But I noticed your submission rate is still at 3 per week versus our target of 5. What's the blocker there?"

**IC Response:** "I'm spending more time on quality, which means fewer total submissions. But my conversion rate is better - 50% of my submissions go to interview now."

**Manager:** "That's a great point. Let me show you the math: If you submit 3 high-quality candidates at 50% conversion, you get 1.5 interviews. If you submit 5 medium-quality at 30% conversion, you get 1.5 interviews too. So you're hitting the same outcome, just with a different strategy."

**IC Response:** "Right, but the high-quality approach saves me time on post-submission work. Medium candidates need more hand-holding through the process."

**Manager:** "Valid point. Here's what I'm thinking: Can we aim for 4 submissions per week instead of 3? Still high quality, but push yourself slightly. If you can maintain 50% conversion on 4 submissions, you'll get 2 interviews per week instead of 1.5. That gives you more options for placements."

**IC Response:** "Yeah, I think I can do 4. I'll need to tighten up my sourcing process a bit."

**Manager:** "Exactly. Let's set that as a goal for next sprint. If you hit 4 per week consistently, we'll reassess whether 5 is even needed."

**User Action:** Type in "Live Notes":

```
CURRENT SPRINT PROGRESS:
- Target: 1 placement ✅ (Kevin @ Oracle)
- Submission rate: 3/week (below target of 5, but high quality)

Quality vs. Quantity Discussion:
- John's strategy: Fewer submissions, higher quality
- Current conversion: 50% (3 submissions → 1.5 interviews)
- Industry avg: 30% (5 submissions → 1.5 interviews)
- John's approach saves time on post-submission hand-holding

New Goal for Next Sprint:
- Target 4 submissions/week (up from 3, below original 5)
- Maintain 50% conversion rate
- Expected outcome: 2 interviews/week (vs current 1.5)
- Reassess after 2 sprints

Action: John to optimize sourcing process to support 4/week volume
```

**Manager Action:** Check off "✅ 3. Current Sprint Progress" in agenda

**Time:** ~10 minutes

---

#### 3D: Challenges & Blockers (15 minutes)

**Manager:** "Let's talk about challenges. What's your biggest blocker right now?"

**IC Response:** "Honestly, client responsiveness. Google is stale, and even when I submit good candidates elsewhere, it takes 5-7 days to hear back. By then, candidates are getting other offers."

**Manager:** "That's a systemic issue, not just you. Our average time-to-respond across the org is 6 days. Here's what I want you to try: When you submit a candidate, call the hiring manager the next day. Don't wait for email responses."

**IC Response:** "I'm not comfortable cold-calling hiring managers. What if they're annoyed?"

**Manager (Coaching Moment - SBI Model):**

"Let me share some feedback using the Situation-Behavior-Impact model:

**Situation:** When you submit a high-quality candidate to a client

**Behavior:** You send an email and wait for them to respond (passive approach)

**Impact:**
- Positive: Shows respect for their time, non-intrusive
- Negative: Candidates accept other offers while we wait, you lose placements

Now, let's flip it:

**Situation:** When you submit a high-quality candidate to a client

**Behavior:** You send email + follow up with a 5-minute call next day (proactive approach)

**Impact:**
- Shows urgency and professionalism
- Keeps candidate top-of-mind for client
- Gives you real-time feedback to adjust strategy
- Faster time-to-interview = more placements

Most hiring managers appreciate the call - it shows you care. And if someone is annoyed? That's useful data about the client relationship."

**IC Response:** "That makes sense. I guess I've been avoiding it because I'm not sure what to say on the call."

**Manager:** "I'll help you with a script. Let's role-play right now."

**Manager (Role-Play Exercise):**

**Manager plays Client:** *[Phone rings]* "This is Jane from Google."

**Manager coaches IC:** "Okay, you just called Jane about the React developer you submitted yesterday. What do you say?"

**IC:** "Hi Jane, this is John from InTime. I wanted to quickly follow up on the React developer profile I sent yesterday. Have you had a chance to review it?"

**Manager (as Jane):** "Oh, I haven't looked yet. I've been in meetings all day."

**Manager coaches IC:** "Good start. Now, what's your next line?"

**IC:** "No problem! I know you're busy. I wanted to give you a quick 30-second summary of why I think she's a strong fit, and then I'll let you go. Sound good?"

**Manager (as Jane):** "Sure, go ahead."

**IC:** "Great! Her name is Sarah, she has 5 years of React experience, previously worked at Meta and Amazon, and she's available immediately. She's also open to a 6-month contract-to-hire, which I know you mentioned you prefer. Worth a 30-minute phone screen?"

**Manager (as Jane):** "Yeah, send me her resume again and I'll set something up this week."

**Manager (breaks role-play):** "Perfect! That's exactly the approach. You gave value (quick summary), made it easy for her (30 seconds), and closed with a clear ask (phone screen). Let's practice that a few more times until you're comfortable."

**User Action:** Type in "Live Notes":

```
CHALLENGES & BLOCKERS:

1. Client Responsiveness (Main Blocker)
   - Google stale for 10 days (Jane not responding)
   - Industry avg: 6 days response time
   - Impact: Candidates accept other offers while waiting

Solution - Proactive Follow-Up Strategy:
   - Email submission + next-day phone call
   - Manager coached SBI model (Situation-Behavior-Impact)
   - Role-played client call script
   - John will practice calling hiring managers starting next week

2. Comfort with Cold Calling
   - John hesitant to call hiring managers (fear of being annoying)
   - Manager provided script template
   - Role-play exercise completed (John did well!)
   - Action: Practice 3 follow-up calls next week, debrief results

Call Script Template:
"Hi [Name], this is John from InTime. I wanted to quickly follow up on
the [role] profile I sent yesterday. Have you had a chance to review?
[If no] No problem! Can I give you a 30-second summary of why I think
they're a strong fit? [Summarize key points] Worth a phone screen?"
```

**User Action:** Add to "Private Notes" (Manager only):

```
Private Coaching Notes:
- John's main weakness: Avoids difficult conversations (client calls, escalations)
- This is coachable - he has the skills, just needs confidence
- Role-play works well for him - repeat this exercise for other scenarios
- Consider shadowing me on client calls for a week to build confidence
- Long-term development: Get John comfortable with strategic account management
```

**Manager Action:** Check off "✅ 4. Challenges & Blockers" in agenda

**Time:** ~15 minutes

---

#### 3E: Skill Development & Growth (10 minutes)

**Manager:** "Let's talk career growth. Where do you see yourself in 6 months?"

**IC Response:** "I'd like to take on more strategic accounts. Right now I'm mostly working transactional contracts, but I want to build long-term client relationships like you do."

**Manager:** "That's a great goal. Strategic account management requires a few skills you're already building:
1. Proactive communication (we just talked about this)
2. Relationship building (you're good at this with candidates)
3. Understanding client business needs (you're getting better)
4. Managing multiple stakeholders (you need more practice)

Here's what I'm thinking: In Q1, I'll assign you one strategic account as a 'shadow lead'. You'll handle all day-to-day, but I'll be your escalation point. This gives you real experience without the risk of losing a major client if something goes wrong. Sound good?"

**IC Response:** "Yeah, that sounds perfect! Which account?"

**Manager:** "Let's start with a mid-tier strategic account - maybe Salesforce. They have 2 active contracts and are looking to expand in Q1. You'll own the relationship, I'll introduce you as the primary contact, and we'll do weekly debriefs on your progress."

**User Action:** Type in "Live Notes":

```
SKILL DEVELOPMENT & GROWTH:

Career Goal (6-Month):
- Take on more strategic accounts
- Move from transactional contracts → long-term client relationships
- Build skills in strategic account management

Development Plan:
- Q1 Goal: Shadow lead on one strategic account (Salesforce)
- Manager will introduce John as primary contact
- John handles day-to-day, manager is escalation point
- Weekly debriefs to review progress and coaching

Skills to Develop for Strategic Accounts:
1. ✅ Proactive communication (working on this now)
2. ✅ Relationship building (strong with candidates, apply to clients)
3. 🟡 Understanding client business needs (developing)
4. 🔴 Managing multiple stakeholders (needs practice)

Action: Manager to assign Salesforce account to John in early January
Action: Schedule weekly debriefs starting Jan 7
```

**Manager:** "Also, I want you to think about the Academy training modules. There's one on 'Strategic Account Management' that would be perfect for you. Can you complete that by end of Q4? It's about 2 hours total."

**IC Response:** "Yeah, I can do that. Should I do it before or after the LinkedIn training?"

**Manager:** "LinkedIn first (this week), then Strategic Account Management next week. Both will help you level up."

**Manager Action:** Check off "✅ 5. Skill Development & Growth" in agenda

**Time:** ~10 minutes

---

#### 3F: Next Actions (5 minutes)

**Manager:** "Let's lock in your action items for the next week."

**User Action:** Click "[+ Add Action Item]" button multiple times

**Screen State:**
```
+------------------------------------------------------------------+
| ACTION ITEMS (Next 1:1: Dec 5, 2024)                             |
+------------------------------------------------------------------+
| ┌────────────────────────────────────┬───────────┬────────────┐ |
| │ Action Item                        │ Due Date  │ Owner      │ |
| ├────────────────────────────────────┼───────────┼────────────┤ |
| │ Complete LinkedIn training (30min) │ Dec 1     │ John       │ |
| │ Increase submission rate to 4/week │ Ongoing   │ John       │ |
| │ Practice 3 client follow-up calls  │ Dec 5     │ John       │ |
| │ Complete Strategic Acct Mgmt course│ Dec 8     │ John       │ |
| │ Escalate Google stale jobs to mgr  │ Nov 28    │ Manager    │ |
| │ Assign Salesforce account to John  │ Jan 7     │ Manager    │ |
| └────────────────────────────────────┴───────────┴────────────┘ |
+------------------------------------------------------------------+
```

**Manager:** "Any other blockers or questions before we wrap?"

**IC Response:** "No, I think we covered everything. Thanks for the coaching on client calls - that really helped."

**Manager:** "Anytime! You're doing great, John. Keep it up."

**Manager Action:** Check off "✅ 6. Next Actions" in agenda

**Time:** ~5 minutes

---

### Step 4: End Session & Document

**User Action:** Click "End Session" button

**System Response:** Session summary modal opens

**Screen State:**
```
+------------------------------------------------------------------+
| End 1:1 Session - Summary                                         |
+------------------------------------------------------------------+
| Session Duration: 00:47:23                                        |
| Agenda Items Completed: 6/6 ✅                                   |
+------------------------------------------------------------------+
| NOTES SHARING                                                     |
| ☑ Share live notes with IC (John Smith)                         |
| ☐ Share private notes with IC (Manager only by default)         |
|                                                                   |
| Live Notes Preview:                                               |
| - Wins & Celebrations                                            |
| - Action Items Review                                            |
| - Current Sprint Progress                                        |
| - Challenges & Blockers                                          |
| - Skill Development & Growth                                     |
| - Next Actions (6 action items)                                  |
+------------------------------------------------------------------+
| SENTIMENT ANALYSIS (AI-Generated)                                 |
| Overall Tone: Positive & Productive                              |
| IC Engagement: High (active participation, asked questions)      |
| Key Themes: Client communication, career growth, skill building  |
| Coaching Opportunities Identified: 2 (cold calling, stakeholder mgmt)|
+------------------------------------------------------------------+
| NEXT 1:1 SCHEDULE                                                 |
| Suggested Date: Dec 5, 2024 2:00 PM (1 week from today)         |
| ● Recurring Weekly  ○ One-Time  ○ Custom Schedule                |
|                                                                   |
| [Cancel] [Save Session & Schedule Next]                          |
+------------------------------------------------------------------+
```

**User Action:** Review summary, click "Save Session & Schedule Next"

**System Response:**
1. Session saved to `one_on_one_sessions` table
2. Live notes shared with IC (John receives email + in-app notification)
3. Private notes saved (manager-only access)
4. Action items created in task system (assigned to John and Manager)
5. Next 1:1 scheduled for Dec 5, 2024 2:00 PM
6. Calendar invite sent to both manager and IC
7. Toast: "1:1 session saved ✓ Next session scheduled for Dec 5"

**Time:** ~3 minutes

---

## Postconditions

1. ✅ 1:1 session completed and documented
2. ✅ IC received coaching on specific challenges (client communication)
3. ✅ Action items created and assigned
4. ✅ Career development plan established (strategic account shadow)
5. ✅ Skills gaps identified and training assigned
6. ✅ Next 1:1 scheduled
7. ✅ Performance trends tracked for long-term development
8. ✅ Manager's private coaching notes saved for future reference

---

## Coaching Frameworks Used

### 1. SBI Model (Situation-Behavior-Impact)

Used for delivering specific, actionable feedback:

**Structure:**
- **Situation:** Describe the specific context
- **Behavior:** Describe the observable behavior (not judgment)
- **Impact:** Explain the consequences (positive or negative)

**Example from Session:**
```
Situation: "When you submit a high-quality candidate to a client"
Behavior: "You send an email and wait for them to respond"
Impact: "Candidates accept other offers while we wait, you lose placements"
```

**Benefits:**
- Removes ambiguity (IC knows exactly what to change)
- Focuses on behavior, not personality
- Explains why change matters (impact)

### 2. GROW Model (Goal-Reality-Options-Will)

Used for problem-solving and development:

**Structure:**
- **Goal:** What do you want to achieve?
- **Reality:** What's the current situation?
- **Options:** What could you do?
- **Will:** What will you do?

**Example from Session:**
```
Goal: "I want to take on strategic accounts"
Reality: "Currently handling transactional contracts, need more skills"
Options: "Shadow lead, training, practice with mid-tier account"
Will: "Start with Salesforce in Q1, complete training by Dec 8"
```

### 3. Role-Play Practice

Used for building confidence in difficult conversations:

**Structure:**
1. Identify the scenario (client follow-up call)
2. Manager plays the other role (client)
3. IC practices the conversation
4. Manager provides real-time feedback
5. Repeat until IC is comfortable

**Example from Session:**
- IC practiced calling hiring manager after submission
- Manager played client role, threw in realistic responses
- IC improved with each iteration

---

## 1:1 Agenda Templates

### Standard Weekly 1:1 (45-60 min)

```
1. Wins & Celebrations (5 min)
   - Recent placements
   - Client feedback
   - Personal achievements

2. Action Items Review (5 min)
   - Review last week's commitments
   - Celebrate completions
   - Discuss blockers

3. Current Sprint Progress (10 min)
   - Metrics review
   - Pipeline health
   - Goal tracking

4. Challenges & Blockers (15 min)
   - IC-identified issues
   - Manager observations
   - Problem-solving

5. Skill Development & Growth (10 min)
   - Training progress
   - Career goals
   - Development opportunities

6. Next Actions (5 min)
   - Lock in commitments
   - Set clear deadlines
   - Schedule follow-ups
```

### Performance Improvement 1:1 (60 min)

```
1. Performance Gap Identification (10 min)
   - Review metrics vs targets
   - Identify specific gaps
   - Agree on priority issues

2. Root Cause Analysis (15 min)
   - Why is the gap occurring?
   - Is it skill, will, or environment?
   - Manager's observations vs IC's perspective

3. Performance Improvement Plan (20 min)
   - Specific, measurable goals
   - Timeline and milestones
   - Support needed from manager

4. Skill Building (10 min)
   - Training assignments
   - Shadowing opportunities
   - Practice exercises

5. Accountability & Check-ins (5 min)
   - Weekly progress reviews
   - Clear consequences (positive & negative)
   - Next steps
```

### Career Development 1:1 (60 min)

```
1. Long-Term Vision (15 min)
   - Where do you want to be in 1 year? 3 years?
   - What excites you most about your work?
   - What drains your energy?

2. Skills Inventory (15 min)
   - Current strengths (leverage these)
   - Skills to develop (for next role)
   - Gaps to close (blockers to advancement)

3. Development Opportunities (15 min)
   - Stretch assignments
   - Cross-functional projects
   - Leadership responsibilities

4. Action Plan (10 min)
   - Specific development actions
   - Training/certifications needed
   - Timeline for growth

5. Manager Support (5 min)
   - What manager will do to support
   - Resources to provide
   - Advocacy with leadership
```

---

## 1:1 Best Practices

### Before the 1:1

✅ **Review IC's recent performance metrics** (15 min prep time)
✅ **Review previous 1:1 notes and action items** (5 min)
✅ **Prepare 2-3 coaching points** (based on observations)
✅ **Block off time before/after** (buffer for notes, urgent issues)
✅ **Send agenda in advance** (IC can prepare too)

### During the 1:1

✅ **Start with wins** (build confidence, positive tone)
✅ **Listen more than talk** (80/20 rule - IC talks 80%, manager 20%)
✅ **Use open-ended questions** ("What do you think?" vs "Did you do X?")
✅ **Take live notes** (share with IC for transparency)
✅ **Be present** (close laptop, silence phone, full attention)
✅ **End with clear action items** (who does what by when)

### After the 1:1

✅ **Share notes immediately** (while fresh in IC's mind)
✅ **Create tasks for action items** (track accountability)
✅ **Update IC's development plan** (long-term tracking)
✅ **Note private observations** (for manager reference)
✅ **Schedule next 1:1** (consistent cadence)

---

## Common 1:1 Pitfalls (Avoid These)

❌ **Manager monologues** (IC becomes passive listener)
❌ **Status updates only** (use async communication for this)
❌ **Skipping 1:1s** (erodes trust, signals IC isn't priority)
❌ **No action items** (conversation without outcomes)
❌ **Avoiding difficult topics** (coaching requires honest feedback)
❌ **Surprise feedback** (issues should be addressed immediately, not saved for 1:1)
❌ **No follow-up on previous commitments** (accountability disappears)

---

## Metrics to Track

| Metric | Target | Purpose |
|--------|--------|---------|
| 1:1 Completion Rate | 100% (no cancellations) | Consistency and priority |
| Average Duration | 45-60 min | Adequate time for depth |
| Action Item Completion | >80% | Accountability and progress |
| IC Satisfaction Score | >4.0/5.0 | Usefulness of sessions |
| Career Development Discussions | 1 per quarter minimum | Long-term growth focus |

---

## Integration with Other Systems

### Task Management
- Action items from 1:1s automatically create tasks
- Tasks linked back to 1:1 session for context
- Task completion status visible in next 1:1 prep

### Performance Reviews
- 1:1 notes aggregated for quarterly reviews
- Career development discussions inform promotion decisions
- Action item completion rate factors into performance ratings

### Training & Development
- Training assignments from 1:1s tracked in Academy
- Course completions reported back to 1:1 prep screen
- Skill gaps identified in 1:1s trigger training recommendations

---

## Alternative Flows

### A1: IC Cancels 1:1 (Emergency)

**Scenario:** IC has client emergency and needs to reschedule

1. IC sends message: "Client emergency with Oracle - can we reschedule?"
2. Manager responds: "No problem, handle the client. How about tomorrow same time?"
3. IC confirms new time
4. System reschedules 1:1 automatically
5. Manager sends quick async note: "Anything I can help with on Oracle issue?"

### A2: Performance Issue Requires Immediate 1:1

**Scenario:** IC missed sprint target 2 sprints in a row

1. Manager schedules urgent 1:1 (outside regular cadence)
2. Uses "Performance Improvement 1:1" agenda template
3. Documents performance gap and improvement plan
4. Increases 1:1 frequency to 2x per week during improvement period
5. Tracks progress closely

### A3: IC Requests 1:1 for Specific Issue

**Scenario:** IC struggling with difficult client, needs coaching

1. IC sends message: "Can we meet today? Having trouble with Google client."
2. Manager responds: "Absolutely. 3 PM work? What's the issue?"
3. IC gives brief overview
4. Manager prepares focused coaching for that topic
5. 1:1 focuses only on that issue (shorter, more tactical)

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Manager opens 1:1 prep screen | All IC metrics, wins, concerns, and previous action items load |
| TC-002 | Manager starts 1:1 session | Timer starts, agenda loads, notes fields enabled |
| TC-003 | Manager adds action item during session | Action item appears in list with due date and owner |
| TC-004 | Manager ends session | Notes shared with IC, action items created as tasks, next 1:1 scheduled |
| TC-005 | IC marks action item complete | Completion shows in next 1:1 prep under "Action Items Review" |
| TC-006 | Manager searches previous 1:1 notes | Full history searchable by keyword, date, or topic |

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - 1:1s are part of manager's weekly routine
- [02-pod-dashboard.md](./02-pod-dashboard.md) - IC metrics feed into 1:1 preparation
- [03-handle-escalation.md](./03-handle-escalation.md) - Post-escalation debriefs happen in 1:1s
- [09-escalation-handling.md](./09-escalation-handling.md) - Use escalations as coaching opportunities

---

*Last Updated: 2024-11-30*
