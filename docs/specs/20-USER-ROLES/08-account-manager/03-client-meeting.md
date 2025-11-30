# Use Case: Conduct Quarterly Business Review (QBR)

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-AM-003 |
| Actor | Account Manager |
| Goal | Conduct quarterly business review with client to showcase value, strengthen relationship, and plan for future |
| Frequency | Once per quarter for Tier 1 accounts, semi-annually for Tier 2 |
| Estimated Time | 3-4 hours (prep + meeting + follow-up) |
| Priority | High |

---

## Preconditions

1. User is logged in as Account Manager
2. Account has been active for at least 1 quarter
3. QBR is scheduled on calendar (typically 60-90 minutes)
4. User has access to account performance data
5. Client executive/stakeholder has confirmed attendance

---

## Trigger

One of the following:
- 90 days since last QBR (automated reminder)
- Client requests performance review
- Renewal period approaching (90-180 days before contract end)
- Significant milestone reached (e.g., 50th placement)
- Account health score drops below threshold (urgent QBR)

---

## Main Flow (Click-by-Click)

### PHASE 1: PREPARATION (1-2 days before meeting)

#### Step 1: Access QBR Builder Tool

**User Action:** Navigate to account (MegaBank), click "Actions" → "Schedule QBR"

**System Response:**
- Opens QBR workflow wizard
- Checks if QBR is overdue
- Suggests QBR date based on last review

**Screen State:**
```
+------------------------------------------------------------------+
| Schedule Quarterly Business Review                         [×]   |
+------------------------------------------------------------------+
| Account: MegaBank                                                |
| Last QBR: August 28, 2024 (94 days ago)                         |
| Status: ⚠️ Overdue (Target: Every 90 days)                      |
+------------------------------------------------------------------+
|
| STEP 1: Schedule Meeting                                        |
|                                                                  |
| Meeting Date *                                                  |
| [November 30, 2024                                    📅]       |
|                                                                  |
| Meeting Time *                                                  |
| [11:00 AM                                             🕐] PST   |
|                                                                  |
| Duration                                                        |
| [60 minutes                                           ▼]        |
| Options: 30 min, 60 min, 90 min, 120 min                        |
|                                                                  |
| Meeting Location                                                |
| ○ Virtual (Zoom)   ○ In-Person   ○ Phone                        |
|                                                                  |
| Attendees *                                                     |
| Client Side:                                                    |
| [+ Add Attendee]                                                |
| • Sarah Chen (VP Talent) - Primary ✓                            |
| • Mark Johnson (CTO) ✓                                          |
|                                                                  |
| InTime Side:                                                    |
| • You (Account Manager) ✓                                       |
| [+ Add Team Member]                                             |
| ○ Invite Recruiting Manager   ○ Invite Sales Director           |
|                                                                  |
+------------------------------------------------------------------+
|                                         [Cancel]  [Next: Prep →]|
+------------------------------------------------------------------+
```

**User Action:** Confirm date/time, add attendees, click "Next: Prep"

**System Response:**
- Meeting created in calendar
- Sends calendar invites to all attendees
- Moves to preparation phase

**Time:** 3 minutes

---

#### Step 2: Generate QBR Data Package

**System Response:**
- Auto-generates QBR data package with metrics from last quarter

**Screen State:**
```
+------------------------------------------------------------------+
| QBR Preparation - MegaBank                                       |
+------------------------------------------------------------------+
| Meeting: Nov 30, 11:00 AM   Attendees: Sarah Chen, Mark Johnson |
+------------------------------------------------------------------+
|
| STEP 2: Review Metrics & Build Presentation                     |
|                                                                  |
| [Data Collection] [Presentation Builder] [Review & Finalize]    |
|                                                                  |
+------------------------------------------------------------------+
|
| DATA COLLECTION (Auto-Generated)                                |
|                                                                  |
| Review Period: Q4 2024 (Sept 1 - Nov 30)                        |
| Comparison Period: Q3 2024 (Jun 1 - Aug 31)                     |
|                                                                  |
| ✅ PERFORMANCE METRICS                                          |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Placements:                18  (Target: 15)   ✅ 120%       │ |
| │ Time-to-Fill (avg):        12d (vs 15d Q3)   ✅ Improved   │ |
| │ Offer Acceptance Rate:     94% (vs 88% Q3)   ✅ Improved   │ |
| │ Submissions-to-Hire:       3.2 (vs 4.1 Q3)   ✅ Improved   │ |
| │ Client NPS:                9   (vs 8 Q3)     ✅ Excellent  │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ✅ FINANCIAL METRICS                                            |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Q4 Revenue:              $847K (↑18% vs Q3)                 │ |
| │ Active Contractors:       32   (↑28% vs Q3)                 │ |
| │ Average Bill Rate:        $98/hr (industry avg: $92)        │ |
| │ Payment Timeliness:       14 days avg (Net 30 terms) ✅     │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ✅ OPERATIONAL METRICS                                          |
| ┌────────────────────────────────────────────────────────────┐ |
| │ Active Jobs (current):     23                               │ |
| │ Departments Served:        4 (Engineering, Marketing, Legal,│ |
| │                               Finance)                       │ |
| │ Recruiter Assigned:        Mike Rodriguez (primary)         │ |
| │ Escalations Resolved:      4 (all within SLA)               │ |
| └────────────────────────────────────────────────────────────┘ |
|                                                                  |
| ✅ SUCCESS STORIES (3 available)                                |
| • Principal Engineer placement (Blockchain + RegTech)           |
| • Marketing team expansion (3 placements in 2 weeks)            |
| • Legal department SOW project (first-time success)             |
|                                                                  |
| ⚠️ CHALLENGES (2 flagged)                                       |
| • UX Designer role - slow candidate flow (resolved: rate ↑)     |
| • Interview delays - avg 18 days (resolved: streamlined process)|
|                                                                  |
+------------------------------------------------------------------+
|
| CUSTOM METRICS (Optional)                                       |
| [+ Add Custom Metric] (e.g., Diversity hiring, Retention rate)  |
|                                                                  |
+------------------------------------------------------------------+
|                                    [← Back]  [Build Presentation]|
+------------------------------------------------------------------+
```

**Time:** 2 minutes (review auto-generated data)

---

#### Step 3: Build Presentation

**User Action:** Click "Build Presentation"

**System Response:**
- Opens presentation builder with templates
- Pre-fills slides with data from Step 2

**Screen State:**
```
+------------------------------------------------------------------+
| QBR Presentation Builder - MegaBank Q4 2024                      |
+------------------------------------------------------------------+
|
| Template: [● InTime Standard QBR] [○ Executive Brief] [○ Custom]|
|                                                                  |
+------------------------------------------------------------------+
| SLIDE OUTLINE (10 slides)                      [Preview] [Edit]  |
+------------------------------------------------------------------+
|
| 1. [✓] Cover Slide                                              |
|    Title: MegaBank Quarterly Business Review - Q4 2024          |
|    Subtitle: Presented by [Your Name], Account Manager          |
|    Date: November 30, 2024                                      |
|    Branding: InTime logo, MegaBank logo                         |
|                                                  [Edit Slide]    |
|                                                                  |
| 2. [✓] Executive Summary                                        |
|    - Q4 Performance Highlights (4 key wins)                     |
|    - Growth Metrics (18% revenue increase)                      |
|    - Strategic Wins (2 new departments)                         |
|    Auto-populated from data                      [Edit Slide]   |
|                                                                  |
| 3. [✓] Placement Breakdown                                      |
|    - Placements by Department (chart)                           |
|    - Placements by Role Type (chart)                            |
|    - Diversity Metrics (% women, URM)                           |
|    Auto-populated from data                      [Edit Slide]   |
|                                                                  |
| 4. [✓] Quality & Efficiency Metrics                             |
|    - Time-to-Fill trend                                         |
|    - Submissions-to-Hire ratio                                  |
|    - Offer Acceptance Rate                                      |
|    - First-year Retention                                       |
|    - NPS Score                                                  |
|    Auto-populated with Q3 comparison             [Edit Slide]   |
|                                                                  |
| 5. [⚠️] Success Spotlight                                       |
|    - Feature: Principal Engineer placement story                |
|    Status: Needs customization (add quote, photo)               |
|    Template provided                             [Edit Slide]   |
|                                                                  |
| 6. [✓] Challenges & Resolutions                                 |
|    - Challenge 1: UX Designer role (rate issue)                 |
|    - Challenge 2: Interview delays                              |
|    - Resolutions and outcomes                                   |
|    Auto-populated from escalation data           [Edit Slide]   |
|                                                                  |
| 7. [⚠️] Q1 2025 Strategic Initiatives                           |
|    Status: Needs customization                                  |
|    Suggestions: Data Science expansion, Diversity partnership   |
|    Template provided                             [Edit Slide]   |
|                                                                  |
| 8. [✓] Account Health Scorecard                                 |
|    - Overall Health: GREEN (94/100)                             |
|    - Breakdown by category                                      |
|    - Trend chart (last 6 months)                                |
|    Auto-populated from health system             [Edit Slide]   |
|                                                                  |
| 9. [⚠️] Q&A and Action Items                                    |
|    Status: Blank (fill during meeting)                          |
|    Template provided                             [Edit Slide]   |
|                                                                  |
| 10. [✓] Thank You & Next Steps                                  |
|     - Appreciation message                                      |
|     - Next QBR date: March 1, 2025                              |
|     - Contact information                                       |
|     Auto-populated                               [Edit Slide]   |
|                                                                  |
+------------------------------------------------------------------+
|
| PRESENTATION ACTIONS                                            |
| [Preview Full Deck] [Download PDF] [Download PPTX] [Share Link]|
|                                                                  |
+------------------------------------------------------------------+
|                               [← Back]  [Customize Slides →]    |
+------------------------------------------------------------------+
```

**User Action:** Click "Edit Slide" on Slide 5 (Success Spotlight)

**System Response:**
- Opens slide editor for customization

**Screen State (Slide Editor - Slide 5):**
```
+------------------------------------------------------------------+
| Edit Slide 5: Success Spotlight                            [×]   |
+------------------------------------------------------------------+
|
| SLIDE LAYOUT: [Feature Story with Quote]                        |
|                                                                  |
| Headline *                                                      |
| [Spotlight: Principal Engineer Placement                      ] |
|                                                                  |
| Story Content *                                                 |
| [                                                              ] |
| [Challenge: Client needed niche Blockchain + RegTech expert    ] |
| [with 10+ years experience. Timeline: 3 weeks to start.        ] |
| [                                                              ] |
| [Our Approach:                                                 ] |
| [• Leveraged specialized tech network                         ] |
| [• Identified passive candidate at top competitor             ] |
| [• Coordinated expedited interview (5 days start-to-finish)   ] |
| [• Negotiated candidate relocation from Austin                ] |
| [                                                              ] |
| [Result: Candidate started on target date and exceeded        ] |
| [expectations in first month, leading to 3 additional role    ] |
| [requests in same team.                                       ] |
| [                                                              ] |
|                                                        0/1000   |
|                                                                  |
| Client Quote (Optional)                                         |
| [                                                              ] |
| ["This placement was a game-changer for our RegTech initiative.] |
| [InTime delivered exactly what we needed, exactly when we      ] |
| [needed it." - Hiring Manager Name, Title                     ] |
| [                                                              ] |
|                                                        0/300    |
|                                                                  |
| Visual Element                                                  |
| [Upload Image] [Use Stock Photo] [○ No Image]                  |
| Recommended: Headshot of placed candidate (with permission)     |
|                                                                  |
+------------------------------------------------------------------+
|                                         [Cancel]  [Save Slide]  |
+------------------------------------------------------------------+
```

**User Action:** Add quote, upload image (optional), click "Save Slide"

**System Response:**
- Slide updated with custom content
- Returns to presentation builder

**Time:** 20 minutes (customize 3-4 slides)

---

#### Step 4: Review and Finalize Presentation

**User Action:** Click "Preview Full Deck"

**System Response:**
- Opens full presentation in preview mode
- Allows final review before meeting

**User Action:** Review all slides, make final adjustments

**User Action:** Click "Download PPTX" to have local copy

**System Response:**
- Generates PowerPoint file
- Downloads to local machine
- Also saves to account files in InTime

**User Action:** Click "Mark Prep Complete"

**System Response:**
- QBR marked as "Ready"
- Reminder set for 1 hour before meeting
- Checklist item checked off

**Time:** 10 minutes

---

### PHASE 2: CONDUCTING THE MEETING (60-90 minutes)

#### Step 5: Join Meeting

**User Action:** At 10:55 AM (5 min before), click Zoom link in calendar

**System Response:**
- Opens Zoom meeting room
- Loads waiting room while host joins

**Pre-Meeting Setup:**
- Test audio/video
- Open presentation in screen share
- Have account page open in second tab (for reference)
- Open notes document or InTime meeting notes feature

**Time:** 5 minutes (arrive early)

---

#### Step 6: Meeting Introduction (5 minutes)

**Script/Flow:**
```
AM: "Good morning Sarah and Mark! Thank you both for taking time today.
     It's great to see you.

     Before we dive in, I want to set the agenda:
     1. Q4 performance review (~20 min)
     2. Success stories and lessons learned (~15 min)
     3. Q1 strategic initiatives and planning (~20 min)
     4. Q&A and next steps (~10 min)

     Does that work for everyone? Any topics you'd like to make sure
     we cover?"

[Wait for client input, adjust agenda if needed]

AM: "Great! Let me share my screen and we'll get started."
```

**User Action:** Share screen with presentation

**Time:** 5 minutes

---

#### Step 7: Present Performance Metrics (20 minutes)

**Slides 2-4: Executive Summary, Placements, Quality Metrics**

**Presentation Flow:**

**Slide 2 - Executive Summary:**
```
AM: "Let me start with the highlights from Q4.

     [POINT TO SLIDE]

     We had a fantastic quarter together:
     • 18 successful placements - that's 120% of our target of 15
     • 94% offer acceptance rate - up from 88% in Q3
     • 12-day average time-to-fill - 3 days faster than last quarter
     • And most importantly, your NPS score of 9 out of 10

     What I'm particularly proud of is the revenue growth - $847K this
     quarter, which is 18% higher than Q3. This is a direct result of
     our expanded partnership into Marketing and Legal departments.

     Sarah, Mark - what stands out to you from these numbers?"

[Pause for client reaction and discussion]
```

**User Action (During Presentation):** Use InTime meeting notes to capture client comments

**Screen State (Meeting Notes - Second Monitor):**
```
+------------------------------------------------------------------+
| Meeting Notes: MegaBank QBR - Nov 30, 2024                       |
+------------------------------------------------------------------+
| Attendees: Sarah Chen (VP Talent), Mark Johnson (CTO), You       |
| Duration: [Live Timer: 12:34]                                    |
+------------------------------------------------------------------+
|
| NOTES (Timestamped)                                             |
| [                                                              ] |
| [11:07 - Sarah: Very impressed with 12-day time-to-fill.       ] |
| [This is significantly faster than our other vendors (~20 days)] |
| [                                                              ] |
| [11:09 - Mark: Asked about diversity metrics. Wants to see     ] |
| [more focus on underrepresented groups in engineering.         ] |
| [                                                              ] |
| [                                                              ] |
+------------------------------------------------------------------+
|
| ACTION ITEMS                                                    |
| [+ Add Action Item]                                             |
| ┌────────────────────────────────────────────────────────────┐ |
| │ ☐ Send diversity hiring plan for Q1                        │ |
| │   Assigned: You      Due: Dec 7                            │ |
| │   Note: Mark requested focus on engineering hires          │ |
| └────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Slide 3 - Placement Breakdown:**
```
AM: "Let me break down where we've been placing talent.

     [POINT TO CHART]

     Engineering continues to be our largest partnership - 12 of the 18
     placements were in your Engineering org. We also successfully
     expanded into Marketing with 3 placements and Legal with 2.

     Mark, I know diversity is important to you. Currently, 39% of our
     placements this quarter were women, and 28% were from
     underrepresented minority groups. I'd love to discuss how we can
     push these numbers even higher in Q1."

[Mark responds with feedback - capture in notes]
```

**Slide 4 - Quality & Efficiency:**
```
AM: "What really tells the story of our partnership is these quality
     metrics.

     [POINT TO TABLE]

     We're outperforming on every single metric:
     • Time-to-fill: 12 days vs 14-day target (✅)
     • Submissions-to-hire: 3.2:1 vs 3.5:1 target (✅)
     • Offer acceptance: 94% vs 90% target (✅)
     • First-year retention: 96% vs 95% target (✅)

     The retention number is particularly important - 96% of contractors
     we placed a year ago are still with you today. That speaks to the
     quality of the talent and the cultural fit we're achieving.

     Sarah, how does this align with your internal benchmarks?"

[Sarah responds - capture feedback]
```

**Time:** 20 minutes

---

#### Step 8: Discuss Success Stories & Challenges (15 minutes)

**Slide 5 - Success Spotlight:**
```
AM: "I want to take a moment to highlight one placement that I think
     exemplifies what we're capable of when we work together.

     [SHOW SLIDE 5]

     The Principal Engineer role for your RegTech initiative. This was
     a really challenging search - Blockchain AND RegTech expertise is
     an extremely rare combination, and you needed someone to start in
     3 weeks.

     Here's how we approached it:
     [Walk through bullet points on slide]

     The result was that candidate started on time and, from what I
     understand, has become a critical member of the team. In fact,
     this success led to 3 additional role requests.

     [READ CLIENT QUOTE IF AVAILABLE]

     Are there other success stories from your perspective that we
     should be celebrating?"

[Client shares feedback, success stories - capture in notes]
```

**Slide 6 - Challenges & Resolutions:**
```
AM: "Now I want to be transparent about challenges we faced and how
     we resolved them.

     [SHOW SLIDE 6]

     We had two main challenges in Q4:

     1. The UX Designer role took longer than expected. We discovered
        the rate was below market for the required experience level
        (Retail AND Healthcare). We had a great conversation, adjusted
        the rate from $75 to $85/hr, and within a week had 4 qualified
        candidates.

     2. Interview scheduling was taking an average of 18 days, which
        was slowing down time-to-hire. We worked with David (your TA
        director) to implement a streamlined 2-stage process, and we've
        now cut that down to 9 days.

     Both of these challenges taught us valuable lessons about
     communication and process optimization.

     Are there any other challenges or concerns you'd like to discuss?"

[Open floor for client to raise issues - capture in notes]
```

**Time:** 15 minutes

---

#### Step 9: Present Q1 Strategic Initiatives (20 minutes)

**Slide 7 - Q1 2025 Strategic Initiatives:**
```
AM: "Looking ahead to Q1, I have three strategic initiatives I'd like
     to propose.

     [SHOW SLIDE 7]

     Initiative 1: Data Science Team Expansion

     Sarah, I know you mentioned your new VP of Data is planning to
     hire 5-7 roles in January and February. This represents about
     $200-300K in additional quarterly revenue.

     We'd like to assign a dedicated recruiter with DS/ML expertise to
     support this. I have a few profiles I can share with you.

     Mark, does this align with your expectations for the Data Science
     buildout?

[Discussion - capture decisions in notes]

     Initiative 2: Diversity Hiring Partnership

     Mark, following up on your earlier comment about diversity, we'd
     like to propose a formal partnership with organizations like NSBE,
     AnitaB.org, and Code2040 to increase our pipeline of
     underrepresented talent.

     Our goal would be to increase underrepresented talent from 28% to
     40% in Q1. This would require a small budget allocation for
     organizational partnerships - approximately $5-10K per quarter.

     What are your thoughts on this approach?

[Discussion - capture buy-in or concerns]

     Initiative 3: Quarterly Talent Market Briefings

     This is something new we're offering to our strategic partners.
     We'd provide your hiring managers with quarterly webinars covering:
     • Salary trends by role
     • Skill availability in the market
     • Competitive intelligence (what other companies are hiring)

     Format would be 30 minutes, once a month. Would this be valuable
     to your team?

[Discussion - gauge interest]
```

**User Action:** Capture all decisions and feedback in meeting notes

**Example Notes Captured:**
```
DECISIONS MADE:

✅ Data Science Expansion: APPROVED
   - Sarah confirmed 5-7 roles in Jan-Feb
   - Action: AM to send DS recruiter profiles by Dec 9
   - Mark wants to meet proposed recruiter before assignment

✅ Diversity Partnership: APPROVED
   - Budget approved by Mark ($10K/quarter)
   - Sarah to connect AM with D&I team lead
   - Target: 40% underrepresented talent in Q1

⚠️ Market Briefings: INTERESTED, needs details
   - Sarah likes the idea
   - Action: AM to send sample agenda and topics
   - Decision by Dec 15
```

**Time:** 20 minutes

---

#### Step 10: Q&A and Wrap-Up (10 minutes)

**Slide 8 - Account Health Scorecard:**
```
AM: "Before we wrap up, I want to share our account health scorecard.

     [SHOW SLIDE 8]

     Overall, MegaBank is rated GREEN at 94 out of 100. This is one of
     our highest-scoring accounts.

     The breakdown shows strength across all categories:
     • Hiring velocity: 25/25 (maxed out!)
     • Payment promptness: 20/20 (you always pay on time - thank you!)
     • NPS/Satisfaction: 18/20 (the 9/10 score we discussed)
     • Executive engagement: 15/15 (like this meeting!)
     • Expansion pipeline: 10/10 (Data Science opportunity)

     The only area with room for improvement is issue frequency at 6/10.
     We had 4 minor escalations this quarter, all resolved. We've
     implemented tighter QA processes in November to prevent future
     issues.

     Overall, this partnership is extremely healthy. We're excited about
     what we can accomplish together in Q1.

     [PAUSE]

     What questions do you have? Anything we didn't cover?"

[Open floor for client questions - answer and capture]
```

**Slide 9 - Thank You & Next Steps:**
```
AM: "Thank you both so much for your partnership and for your time
     today. It's truly a pleasure working with MegaBank.

     [SHOW SLIDE 9]

     To summarize our next steps:
     [Read through action items captured during meeting]

     Our next QBR is scheduled for March 1, 2025. I'll send a calendar
     invite this week.

     If anything comes up before then - questions, concerns, ideas -
     please don't hesitate to reach out. You have my cell, email, and
     Slack.

     Thank you again, and I look forward to a fantastic Q1!"
```

**Time:** 10 minutes

---

### PHASE 3: POST-MEETING FOLLOW-UP (30-60 minutes, same day)

#### Step 11: Finalize Meeting Notes

**User Action:** Return to InTime meeting notes, review and clean up

**Screen State:**
```
+------------------------------------------------------------------+
| Meeting Notes: MegaBank QBR - Nov 30, 2024                       |
+------------------------------------------------------------------+
| Status: [In Progress]                    [Finalize & Distribute] |
| Duration: 62 minutes (11:00 AM - 12:02 PM)                       |
+------------------------------------------------------------------+
|
| ATTENDEES                                                       |
| ✓ Sarah Chen (VP Talent, MegaBank)                              |
| ✓ Mark Johnson (CTO, MegaBank)                                  |
| ✓ You (Account Manager, InTime)                                 |
+------------------------------------------------------------------+
|
| KEY DISCUSSION POINTS                                           |
|                                                                  |
| 1. Q4 Performance Review                                        |
|    • 18 placements (120% of target) - Client very satisfied     |
|    • 12-day time-to-fill significantly faster than other vendors|
|    • Mark emphasized importance of diversity in engineering     |
|                                                                  |
| 2. Success Stories                                              |
|    • Principal Engineer placement highlighted as "game-changer" |
|    • Client appreciated transparency on challenges & resolutions|
|                                                                  |
| 3. Q1 Strategic Initiatives                                     |
|    • Data Science expansion: APPROVED (5-7 roles, Jan-Feb)      |
|    • Diversity partnership: APPROVED ($10K/quarter budget)      |
|    • Market briefings: Under consideration (decision by Dec 15) |
|                                                                  |
| 4. Client Feedback                                              |
|    • Very positive overall sentiment                            |
|    • Appreciated proactive approach to challenges               |
|    • Mark wants to see more diversity focus in Q1               |
|    • Sarah wants to streamline interview process further        |
+------------------------------------------------------------------+
|
| ACTION ITEMS (7 total)                                          |
|                                                                  |
| InTime (You):                                                   |
| ☐ Send DS recruiter profiles for review - Due: Dec 9            |
| ☐ Schedule intro call between Mark and proposed DS recruiter    |
| ☐ Send diversity hiring plan for Q1 - Due: Dec 7                |
| ☐ Connect with MegaBank D&I team lead (via Sarah intro)         |
| ☐ Send sample market briefing agenda - Due: Dec 15              |
| ☐ Send QBR summary email - Due: Today (Nov 30)                  |
| ☐ Schedule next QBR for March 1, 2025                           |
|                                                                  |
| MegaBank (Sarah):                                               |
| ☐ Confirm Q1 hiring projections - Due: Dec 7                    |
| ☐ Introduce AM to D&I team lead - Due: Dec 5                    |
| ☐ Approve diversity partnership budget (formal PO)              |
|                                                                  |
+------------------------------------------------------------------+
|
| DECISIONS MADE                                                  |
| ✅ Data Science expansion approved (5-7 roles, $200-300K value) |
| ✅ Diversity partnership approved ($10K/quarter budget)          |
| ⏳ Market briefings pending (decision by Dec 15)                |
|                                                                  |
+------------------------------------------------------------------+
|
| NEXT MEETING                                                    |
| Date: March 1, 2025, 11:00 AM PST                               |
| Type: Q1 2025 QBR                                               |
| Attendees: Sarah Chen, Mark Johnson, You                        |
+------------------------------------------------------------------+
|                                              [Finalize & Distribute]|
+------------------------------------------------------------------+
```

**User Action:** Review notes, click "Finalize & Distribute"

**System Response:**
- Prompts to select distribution method

**Time:** 10 minutes

---

#### Step 12: Send Follow-Up Email

**System Response:**
- Auto-generates follow-up email from meeting notes

**Generated Email:**
```
To: Sarah Chen <schen@megabank.com>, Mark Johnson <mjohnson@megabank.com>
CC: David Kim <dkim@megabank.com>
Subject: MegaBank Q4 QBR - Summary & Action Items
Attachments: MegaBank_Q4_QBR_Presentation.pdf

Hi Sarah and Mark,

Thank you for a productive Q4 Business Review today! It was great to
celebrate our successes together and plan for an exciting Q1.

KEY HIGHLIGHTS:
✅ 18 placements (120% of target)
✅ 94% offer acceptance rate
✅ 12-day average time-to-fill (3 days faster than Q3)
✅ NPS: 9/10 - Thank you for your trust and partnership!

DECISIONS MADE:
• Data Science Expansion: Approved for Q1 (5-7 roles, $200-300K value)
• Diversity Partnership: Approved ($10K/quarter budget allocation)
• Market Briefings: Under consideration (decision by Dec 15)

ACTION ITEMS:

InTime (Us):
□ Send Data Science recruiter profiles for review - Dec 9
□ Schedule intro call with proposed DS recruiter and Mark
□ Send diversity hiring plan for Q1 - Dec 7
□ Connect with MegaBank D&I team lead (awaiting intro from Sarah)
□ Send sample market briefing agenda - Dec 15
□ Schedule next QBR for March 1, 2025 (calendar invite sent separately)

MegaBank (You):
□ Confirm Q1 hiring projections - Dec 7 (Sarah)
□ Introduce AM to D&I team lead - Dec 5 (Sarah)
□ Approve diversity partnership budget via formal PO (Mark)

NEXT QBR: March 1, 2025, 11:00 AM PST

Please let me know if I missed anything or if you have any questions.
Looking forward to a fantastic Q1 together!

Best regards,
[Your Name]
Account Manager, InTime
[Phone] | [Email]

[Attachment: MegaBank_Q4_QBR_Presentation.pdf]
```

**User Action:** Review email, personalize if needed, send

**System Response:**
- Email sent to all attendees
- Activity logged in CRM
- Attachment (presentation PDF) linked to account

**Time:** 10 minutes

---

#### Step 13: Create Action Items in InTime

**User Action:** Navigate to Tasks, click "Import from Meeting Notes"

**System Response:**
- Loads all action items from QBR meeting notes
- Allows assignment and due date confirmation

**Screen State:**
```
+------------------------------------------------------------------+
| Import Action Items from QBR Meeting                             |
+------------------------------------------------------------------+
| Source: MegaBank QBR - Nov 30, 2024                              |
| Items Found: 7 (InTime-owned)                                    |
+------------------------------------------------------------------+
|
| SELECT ITEMS TO IMPORT:                                         |
|                                                                  |
| ☑ Send DS recruiter profiles for review                         |
|   Assigned: You            Due: Dec 9, 2024                     |
|   Priority: High                                                |
|   [Edit]                                                        |
|                                                                  |
| ☑ Schedule intro call with Mark and DS recruiter                |
|   Assigned: You            Due: Dec 10, 2024                    |
|   Priority: High                                                |
|   Dependencies: Requires recruiter profiles sent first          |
|   [Edit]                                                        |
|                                                                  |
| ☑ Send diversity hiring plan for Q1                             |
|   Assigned: You            Due: Dec 7, 2024                     |
|   Priority: High                                                |
|   [Edit]                                                        |
|                                                                  |
| ☑ Connect with MegaBank D&I team lead                           |
|   Assigned: You            Due: Dec 8, 2024                     |
|   Priority: Medium                                              |
|   Dependencies: Awaiting intro from Sarah                       |
|   [Edit]                                                        |
|                                                                  |
| ☑ Send sample market briefing agenda                            |
|   Assigned: You            Due: Dec 15, 2024                    |
|   Priority: Medium                                              |
|   [Edit]                                                        |
|                                                                  |
| ☑ Send QBR summary email                                        |
|   Assigned: You            Due: Today (Nov 30)                  |
|   Priority: Critical                                            |
|   Status: ✅ COMPLETED                                          |
|                                                                  |
| ☑ Schedule next QBR for March 1, 2025                           |
|   Assigned: You            Due: Dec 2, 2024                     |
|   Priority: Low                                                 |
|   [Edit]                                                        |
|                                                                  |
+------------------------------------------------------------------+
|                                         [Cancel]  [Import Tasks] |
+------------------------------------------------------------------+
```

**User Action:** Review, adjust if needed, click "Import Tasks"

**System Response:**
- 7 tasks created in task management system
- Reminders set based on due dates
- Tasks appear on daily dashboard
- Toast notification: "7 action items imported successfully"

**Time:** 5 minutes

---

#### Step 14: Update Account Health & Expansion Pipeline

**User Action:** Navigate to MegaBank account, click "Update Health Score"

**System Response:**
- Shows current health score (94/100)
- Asks if QBR results change any metrics

**User Action:** Update "Executive Engagement" to 15/15 (had exec meeting today)

**User Action:** Navigate to "Expansion Pipeline", click on "Data Science" opportunity

**System Response:**
- Opens expansion opportunity detail

**User Action:** Update stage from "Proposal" to "Negotiation"

**User Action:** Add note: "Approved in Q4 QBR. Verbal approval from Sarah & Mark. Awaiting formal PO."

**User Action:** Update probability from 60% to 85%

**System Response:**
- Expansion opportunity updated
- Forecast recalculated
- Account health score updated

**Time:** 5 minutes

---

## Postconditions

1. ✅ QBR meeting conducted successfully (60-90 minutes)
2. ✅ Presentation delivered with client engagement
3. ✅ Client feedback and concerns captured
4. ✅ Strategic initiatives proposed and decisions captured
5. ✅ Meeting notes finalized and distributed
6. ✅ Follow-up email sent within 24 hours
7. ✅ All action items created in task system
8. ✅ Account health score updated
9. ✅ Expansion pipeline updated
10. ✅ Next QBR scheduled

---

## Events Logged

| Event | Payload |
|-------|---------|
| `qbr.scheduled` | `{ account_id, meeting_date, attendees[], user_id }` |
| `qbr.prep_started` | `{ account_id, presentation_id, user_id }` |
| `qbr.completed` | `{ account_id, meeting_date, duration, attendees[], sentiment }` |
| `meeting.notes_created` | `{ account_id, meeting_type: 'qbr', action_items_count, user_id }` |
| `account.health_updated` | `{ account_id, old_score, new_score, trigger: 'qbr', user_id }` |
| `expansion.stage_changed` | `{ opportunity_id, old_stage, new_stage, user_id }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Data Load Failed | API error during prep | "Failed to load account metrics. Please try again." | Retry or use manual data entry |
| Presentation Generation Failed | Template error | "Failed to generate presentation. Contact support." | Use manual PowerPoint creation |
| Client No-Show | Client doesn't attend | N/A | Reschedule, send apologetic follow-up |
| Meeting Notes Not Saved | Network error | "Failed to save meeting notes. Please retry." | Copy notes to clipboard, retry save |
| Action Item Import Failed | System error | "Failed to import action items. Create manually." | Manual task creation |

---

## Field Specifications

### QBR Frequency

| Property | Value |
|----------|-------|
| Field Name | `qbrFrequency` |
| Type | Dropdown |
| Label | "QBR Frequency" |
| Required | Yes |
| Default | Based on account tier |
| Options | |
| - `monthly` | "Monthly" (rare, very strategic accounts) |
| - `quarterly` | "Quarterly" (Tier 1 standard) |
| - `semi_annual` | "Semi-Annually" (Tier 2 standard) |
| - `annual` | "Annually" (Tier 3 standard) |
| - `as_needed` | "As Needed" (low-tier or dormant) |

### Meeting Duration

| Property | Value |
|----------|-------|
| Field Name | `duration` |
| Type | Dropdown |
| Label | "Duration" |
| Required | Yes |
| Default | 60 minutes |
| Options | |
| - `30` | "30 minutes" (brief update) |
| - `60` | "60 minutes" (standard QBR) |
| - `90` | "90 minutes" (comprehensive QBR) |
| - `120` | "120 minutes" (strategic planning) |

---

## Best Practices

### Presentation Tips

1. **Start with wins**: Always lead with positive metrics
2. **Be honest about challenges**: Transparency builds trust
3. **Use visuals**: Charts > tables > text
4. **Tell stories**: Data + narrative = memorable
5. **Make it conversational**: Read the room, adjust on the fly

### Meeting Facilitation

1. **Arrive early**: 5 minutes before to test tech
2. **Set agenda upfront**: Manage expectations
3. **Pause for questions**: Don't rush through slides
4. **Capture everything**: Take detailed notes
5. **End with action items**: Clear next steps

### Follow-Up Excellence

1. **Send summary same day**: Strike while iron is hot
2. **Action items ASAP**: Import to task system immediately
3. **Calendar next QBR**: Don't let it slip
4. **Update CRM**: Capture all insights while fresh

---

## Alternative Flows

### A1: Client Requests Early QBR (Crisis Mode)

1. Account health drops to RED
2. Client requests urgent performance review
3. AM schedules emergency QBR (within 1 week)
4. Focus on issues, root causes, remediation plan
5. More frequent follow-ups (weekly check-ins)

### A2: Virtual QBR (COVID Era / Remote-First)

1. All attendees join via Zoom
2. Use breakout rooms for private discussions if needed
3. Share presentation via screen share
4. Use Zoom chat for questions
5. Record meeting (with permission) for absent stakeholders

### A3: Executive Sponsor Replacement (Relationship Risk)

1. Original exec sponsor leaves company or changes role
2. AM must build relationship with new sponsor
3. QBR becomes "introduction + performance review"
4. Focus on credibility-building and value demonstration
5. May need to "re-sell" partnership to new stakeholder

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - QBR as part of routine
- [02-manage-account.md](./02-manage-account.md) - Using account data for QBR prep
- [04-expand-account.md](./04-expand-account.md) - Proposing expansion in QBR
- [05-handle-issue.md](./05-handle-issue.md) - Addressing challenges section

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Schedule QBR for Tier 1 account | Meeting created, invites sent |
| TC-002 | Generate QBR presentation | All slides auto-populated with data |
| TC-003 | Conduct QBR and capture notes | Notes saved with action items |
| TC-004 | Import action items from QBR | All tasks created in system |
| TC-005 | Client no-show to QBR | System allows rescheduling |
| TC-006 | QBR with missing data | Show warning, allow manual entry |
| TC-007 | Send follow-up email | Email sent, activity logged |
| TC-008 | Update health score post-QBR | Score recalculated, account updated |

---

*Last Updated: 2025-11-30*
