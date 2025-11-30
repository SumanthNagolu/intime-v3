# Use Case: Prospect Outreach Campaign

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-SALES-004 |
| Actor | Sales Representative |
| Goal | Execute targeted prospecting campaigns to generate qualified leads |
| Frequency | 2-3 campaigns per month |
| Estimated Time | 2-4 hours (setup + execution) |
| Priority | High |

---

## Preconditions

1. User is logged in as Sales Representative
2. User has "lead.create" and "campaign.create" permissions
3. User has access to prospecting tools (LinkedIn Sales Navigator, ZoomInfo, etc.)
4. User has assigned territory
5. Email integration configured

---

## Trigger

One of the following:
- Weekly prospecting block scheduled
- New territory assigned
- Quarterly prospecting goals set
- Manager assigns prospecting campaign
- Industry/vertical target identified

---

## Prospecting Strategy Overview

### Types of Outreach Campaigns

| Campaign Type | Volume | Touch Points | Timeline | Success Rate |
|---------------|--------|--------------|----------|--------------|
| **Cold Outbound** | 50-100/month | 5-7 touches | 2-3 weeks | 2-5% |
| **Warm Referral** | 10-20/month | 3-4 touches | 1-2 weeks | 15-25% |
| **Inbound Follow-up** | 5-10/week | 2-3 touches | 3-5 days | 30-50% |
| **Event-Based** | 20-30/event | 4-5 touches | 1 week | 10-20% |
| **Account-Based** | 5-10/quarter | 8-10 touches | 4-6 weeks | 25-40% |

---

## Main Flow: Create Prospecting Campaign

### Step 1: Define Campaign

**User Action:** Navigate to `/employee/workspace/sales/campaigns`

**User Action:** Click "Create Campaign" button

**System Response:**
- Campaign builder opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Create Prospecting Campaign                                    [×] |
+--------------------------------------------------------------------+
| Step 1 of 4: Campaign Details                                      |
+--------------------------------------------------------------------+
| CAMPAIGN BASICS                                                    |
|                                                                    |
| Campaign Name *                                                    |
| [Q1 2025 Tech Hiring - SaaS Companies                           ]  |
|                                                                    |
| Campaign Type *                                                    |
| [●] Cold Outbound                                                 |
| [ ] Warm Referral                                                 |
| [ ] Event-Based (conference, webinar)                             |
| [ ] Content Marketing (download, whitepaper)                      |
| [ ] Account-Based Marketing (ABM)                                 |
|                                                                    |
| Campaign Goal *                                                    |
| [Lead Generation ▼]                                               |
| Options: Lead Generation, Account Penetration, Brand Awareness     |
|                                                                    |
| Target Number of Leads                                             |
| [50] prospects                                                     |
|                                                                    |
| Campaign Duration                                                  |
| Start: [Dec 1, 2024 📅]  End: [Dec 31, 2024 📅]                    |
+--------------------------------------------------------------------+
| TARGET PROFILE (ICP - Ideal Customer Profile)                      |
|                                                                    |
| Industry *                                                         |
| [×] Technology / SaaS                                             |
| [×] Software Development                                          |
| [ ] Healthcare                                                    |
| [ ] Financial Services                                            |
| [ ] Manufacturing                                                 |
|                                                                    |
| Company Size *                                                     |
| [×] 100-500 employees                                             |
| [×] 500-1000 employees                                            |
| [ ] 1000-5000 employees                                           |
| [ ] 5000+ employees                                               |
|                                                                    |
| Revenue Range (optional)                                           |
| Min: [$10M      ]  Max: [$100M     ]                              |
|                                                                    |
| Location/Territory *                                               |
| [×] San Francisco Bay Area                                        |
| [×] Austin, TX                                                    |
| [×] Seattle, WA                                                   |
| [ ] Other: [                          ]                           |
+--------------------------------------------------------------------+
| TARGET CONTACTS (Persona)                                          |
|                                                                    |
| Job Titles / Roles *                                               |
| [VP of Engineering                                              ]  |
| [Director of Engineering                                        ]  |
| [CTO                                                            ]  |
| [VP of Talent / HR                                              ]  |
| [+ Add Title]                                                      |
|                                                                    |
| Seniority Level                                                    |
| [×] VP / SVP                                                      |
| [×] Director                                                      |
| [×] C-Level (CTO, CHRO)                                           |
| [ ] Manager                                                       |
+--------------------------------------------------------------------+
| CAMPAIGN MESSAGING                                                 |
|                                                                    |
| Value Proposition *                                                |
| [Helping high-growth SaaS companies scale engineering teams     ]  |
| [quickly with senior talent. 40% faster time-to-hire vs.       ]  |
| [traditional recruiting.                                        ]  |
|                                                              ] 142/500|
|                                                                    |
| Key Pain Points to Address                                         |
| [×] Slow hiring process                                           |
| [×] Difficulty finding senior talent                              |
| [×] High cost of vacancy                                          |
| [ ] Quality of candidates                                         |
| [×] Time spent interviewing unqualified candidates                |
+--------------------------------------------------------------------+
| [Cancel] [Save Draft] [Next: Build Prospect List →]               |
+--------------------------------------------------------------------+
```

**Time:** 5-10 minutes

---

### Step 2: Build Prospect List

**User Action:** Click "Next: Build Prospect List →"

**System Response:**
- Step 2 loads with prospect sourcing options

**Screen State:**
```
+--------------------------------------------------------------------+
| Create Prospecting Campaign                                    [×] |
+--------------------------------------------------------------------+
| Step 2 of 4: Build Prospect List                                   |
+--------------------------------------------------------------------+
| TARGET CRITERIA (from Step 1)                                      |
| Industry: Technology / SaaS                                        |
| Company Size: 100-1000 employees                                   |
| Location: SF Bay Area, Austin, Seattle                             |
| Contacts: VP/Director/C-Level in Engineering/HR                    |
+--------------------------------------------------------------------+
| PROSPECT SOURCES                                                   |
|                                                                    |
| [Tab: Manual Entry] [Tab: Import CSV] [●Tab: Search Tools]         |
+--------------------------------------------------------------------+
| SEARCH PROSPECTING TOOLS                                           |
|                                                                    |
| LinkedIn Sales Navigator                                           |
| [Launch LinkedIn Search →]                                         |
| Find prospects matching criteria in LinkedIn                       |
|                                                                    |
| ZoomInfo / Clearbit                                                |
| [Search ZoomInfo →]                                                |
| Find contact data and company intelligence                         |
|                                                                    |
| Company Database Search (Internal)                                 |
| [Search InTime Database →]                                         |
| Find prospects from past interactions and events                   |
+--------------------------------------------------------------------+
| IMPORTED PROSPECTS                                                 |
|                                                                    |
| Upload CSV File                                                    |
| [Choose File: prospects-q1-tech.csv ✓]                            |
|                                                                    |
| File Preview: 47 prospects loaded                                  |
| ✅ 45 valid | ⚠ 2 warnings | ❌ 0 errors                            |
|                                                                    |
| Preview (first 5):                                                 |
| Name              Title           Company        Location          |
| ────────────────────────────────────────────────────────────────   |
| Jennifer Park     VP Engineering  TechStart      SF, CA            |
| Michael Chen      CTO             CodeBase       Austin, TX        |
| Sarah Williams    Dir Engineering InnoSoft       Seattle, WA       |
| Robert Kim        VP Talent       DataFlow       SF, CA            |
| Lisa Anderson     CHRO            CloudTech      Austin, TX        |
|                                                                    |
| [View All 47 →]                                                    |
+--------------------------------------------------------------------+
| PROSPECT LIST ACTIONS                                              |
|                                                                    |
| Total Prospects: 47                                                |
|                                                                    |
| Enrichment Options:                                                |
| [×] Auto-enrich company data (Clearbit)                           |
| [×] Verify email addresses (NeverBounce)                          |
| [×] Find LinkedIn profiles (automatic)                            |
| [×] Calculate lead scores (InTime AI)                             |
|                                                                    |
| Deduplication:                                                     |
| [×] Skip prospects already in CRM (check email)                   |
| [×] Skip prospects in active campaigns                            |
|                                                                    |
| Assignment:                                                        |
| [●] Assign all to me (Sarah Johnson)                              |
| [ ] Distribute across team: [Select users... ▼]                   |
+--------------------------------------------------------------------+
| [← Back] [Save Draft] [Next: Create Sequence →]                    |
+--------------------------------------------------------------------+
```

**User Action:** Click "Next: Create Sequence →"

**Time:** 10-15 minutes (including prospect research and upload)

---

### Step 3: Create Outreach Sequence

**User Action:** Proceed to Step 3

**System Response:**
- Outreach sequence builder loads

**Screen State:**
```
+--------------------------------------------------------------------+
| Create Prospecting Campaign                                    [×] |
+--------------------------------------------------------------------+
| Step 3 of 4: Create Outreach Sequence                              |
+--------------------------------------------------------------------+
| SEQUENCE OVERVIEW                                                  |
|                                                                    |
| Total Touches: 5 (recommended for cold outbound)                   |
| Timeline: 2 weeks                                                  |
|                                                                    |
| Touch Pattern:                                                     |
| Day 1: Email → Day 3: LinkedIn → Day 7: Email → Day 10: Call →    |
| Day 14: Email (breakup)                                            |
+--------------------------------------------------------------------+
| TOUCH #1: INITIAL EMAIL                                            |
+--------------------------------------------------------------------+
| Send On: [Day 1 ▼] after campaign start                           |
| Channel: [Email ▼]                                                |
| Time of Day: [9:00 AM ▼] (recipient's timezone)                   |
|                                                                    |
| Email Template: [Use Template ▼] or [Write Custom]                |
| Selected: "Cold Outreach - Engineering Hiring Pain"               |
|                                                                    |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Subject Line:                                                  ││
| │ {{firstName}}, struggling to hire senior engineers?           ││
| │                                                                ││
| │ Preview Text:                                                  ││
| │ Most tech companies take 60-90 days. We do it in 30.          ││
| │                                                                ││
| │ Body:                                                          ││
| │ Hi {{firstName}},                                              ││
| │                                                                ││
| │ I noticed {{companyName}} is growing rapidly (congrats on the ││
| │ Series B!). Fast growth = urgent hiring needs.                ││
| │                                                                ││
| │ Most SaaS companies we work with struggle with:               ││
| │ • 60-90 day time to hire for senior engineers                 ││
| │ • Competing with FAANG for top talent                         ││
| │ • 3-4 rounds of interviews eating up eng time                 ││
| │                                                                ││
| │ We help companies like {{companyName}} hire 40% faster by:    ││
| │ ✓ Pre-vetted senior engineers (10+ years)                     ││
| │ ✓ First candidates in 7-10 days                               ││
| │ ✓ 90-day replacement guarantee                                ││
| │                                                                ││
| │ Quick question: Are you hiring engineers in Q1?                ││
| │                                                                ││
| │ If so, I'd love to share how we helped {{caseStudyCompany}}   ││
| │ fill 12 roles in 45 days.                                     ││
| │                                                                ││
| │ Worth a 15-min call?                                           ││
| │                                                                ││
| │ Best,                                                          ││
| │ {{senderName}}                                                 ││
| │ {{senderTitle}}                                                ││
| │ {{senderPhone}}                                                ││
| │                                                                ││
| │ P.S. Here's a recent case study: [link]                       ││
| └────────────────────────────────────────────────────────────────┘|
|                                                                    |
| Personalization Tokens Available:                                  |
| {{firstName}}, {{lastName}}, {{companyName}}, {{title}},          |
| {{industry}}, {{location}}, {{mutual_connection}}, etc.           |
|                                                                    |
| [Preview Email] [A/B Test] [Edit Template]                         |
+--------------------------------------------------------------------+
| TOUCH #2: LINKEDIN CONNECTION REQUEST                              |
+--------------------------------------------------------------------+
| Send On: [Day 3 ▼] after Touch #1                                 |
| Channel: [LinkedIn Message ▼]                                     |
| Condition: [If no email response ▼]                               |
|                                                                    |
| ┌────────────────────────────────────────────────────────────────┐|
| │ LinkedIn Connection Note (max 300 chars):                      ││
| │                                                                ││
| │ Hi {{firstName}}, I help SaaS companies like {{companyName}}  ││
| │ scale engineering teams quickly. Thought we should connect    ││
| │ given your rapid growth. Would love to share some insights    ││
| │ on hiring senior talent faster. - Sarah                       ││
| │                                                                ││
| │                                                      285/300   ││
| └────────────────────────────────────────────────────────────────┘|
|                                                                    |
| [Preview] [Edit]                                                   |
+--------------------------------------------------------------------+
| TOUCH #3: FOLLOW-UP EMAIL                                          |
+--------------------------------------------------------------------+
| Send On: [Day 7 ▼] after campaign start                           |
| Channel: [Email ▼]                                                |
| Condition: [If no response to Touch #1 ▼]                         |
|                                                                    |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Subject: RE: {{firstName}}, struggling to hire senior eng?    ││
| │                                                                ││
| │ Hi {{firstName}},                                              ││
| │                                                                ││
| │ Following up on my email from last week about helping         ││
| │ {{companyName}} hire senior engineers faster.                 ││
| │                                                                ││
| │ I know your inbox is slammed, so I'll keep this short:        ││
| │                                                                ││
| │ We recently helped a Series B SaaS company (similar stage     ││
| │ to {{companyName}}) fill 8 senior engineering roles in 6      ││
| │ weeks. They were skeptical too.                                ││
| │                                                                ││
| │ Here's what made the difference:                               ││
| │ • We only sent pre-vetted candidates (passed tech screen)     ││
| │ • First 3 candidates presented in 10 days                     ││
| │ • 2 accepted offers, both started within 30 days              ││
| │                                                                ││
| │ Worth a quick chat? I promise to keep it under 15 minutes.    ││
| │                                                                ││
| │ [Book a time on my calendar] ← Direct link                    ││
| │                                                                ││
| │ Best,                                                          ││
| │ Sarah                                                          ││
| └────────────────────────────────────────────────────────────────┘|
+--------------------------------------------------------------------+
| TOUCH #4: PHONE CALL                                               |
+--------------------------------------------------------------------+
| Schedule On: [Day 10 ▼] after campaign start                      |
| Channel: [Phone Call ▼]                                           |
| Condition: [If no response to prior touches ▼]                    |
|                                                                    |
| Call Script (Talking Points):                                      |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Opening:                                                       ││
| │ "Hi {{firstName}}, this is Sarah Johnson from InTime. I sent  ││
| │  you a couple emails about helping {{companyName}} hire       ││
| │  senior engineers faster. Do you have 2 minutes?"             ││
| │                                                                ││
| │ If YES:                                                        ││
| │ "Great! Quick question: Are you hiring engineers in Q1?"      ││
| │                                                                ││
| │ If NO:                                                         ││
| │ "No problem. Can I send you a quick case study? Would that    ││
| │  be helpful?"                                                  ││
| │                                                                ││
| │ Voicemail Script:                                              ││
| │ "Hi {{firstName}}, Sarah Johnson from InTime. I help SaaS     ││
| │  companies hire senior engineers 40% faster. I sent you a     ││
| │  couple emails with a relevant case study. Worth a chat?      ││
| │  Call me at 415-555-0123 or reply to my email. Thanks!"      ││
| └────────────────────────────────────────────────────────────────┘|
+--------------------------------------------------------------------+
| TOUCH #5: BREAKUP EMAIL                                            |
+--------------------------------------------------------------------+
| Send On: [Day 14 ▼] after campaign start                          |
| Channel: [Email ▼]                                                |
| Condition: [If no response to any prior touches ▼]                |
|                                                                    |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Subject: Closing the loop - {{companyName}}                   ││
| │                                                                ││
| │ Hi {{firstName}},                                              ││
| │                                                                ││
| │ I've reached out a few times about helping {{companyName}}   ││
| │ hire senior engineers faster, but haven't heard back.          ││
| │                                                                ││
| │ I'm guessing one of three things:                              ││
| │ 1. Not a priority right now (totally fair)                    ││
| │ 2. You're handling hiring internally (great!)                 ││
| │ 3. I didn't explain the value clearly (my bad)                ││
| │                                                                ││
| │ Either way, I'll stop filling your inbox.                      ││
| │                                                                ││
| │ If hiring senior engineers becomes urgent in the future,      ││
| │ feel free to reach out. I'll be here.                         ││
| │                                                                ││
| │ Best of luck with your growth!                                 ││
| │                                                                ││
| │ Sarah                                                          ││
| │                                                                ││
| │ P.S. If I missed the mark and you ARE interested, just hit    ││
| │ reply. I'll prioritize a response.                             ││
| └────────────────────────────────────────────────────────────────┘|
+--------------------------------------------------------------------+
| SEQUENCE SETTINGS                                                  |
|                                                                    |
| Stop Sequence If:                                                  |
| [×] Prospect replies to any email                                 |
| [×] Prospect connects on LinkedIn                                 |
| [×] Prospect books a meeting                                      |
| [×] Prospect marks as "Not Interested"                            |
| [ ] Prospect opens email 3+ times (high engagement)               |
|                                                                    |
| [← Back] [Save Sequence] [Next: Review & Launch →]                |
+--------------------------------------------------------------------+
```

**Time:** 20-30 minutes (writing and customizing sequence)

---

### Step 4: Review and Launch Campaign

**User Action:** Click "Next: Review & Launch →"

**System Response:**
- Campaign summary loads

**Screen State:**
```
+--------------------------------------------------------------------+
| Create Prospecting Campaign                                    [×] |
+--------------------------------------------------------------------+
| Step 4 of 4: Review & Launch                                       |
+--------------------------------------------------------------------+
| CAMPAIGN SUMMARY                                                   |
+--------------------------------------------------------------------+
| Campaign Name: Q1 2025 Tech Hiring - SaaS Companies               |
| Type: Cold Outbound                                                |
| Duration: Dec 1 - Dec 31, 2024 (31 days)                           |
| Goal: Generate 50 qualified leads                                  |
+--------------------------------------------------------------------+
| TARGET PROFILE                                                     |
| • Industry: Technology / SaaS                                      |
| • Company Size: 100-1000 employees                                 |
| • Location: SF Bay Area, Austin, Seattle                           |
| • Contacts: VP/Director/C-Level in Engineering/HR                  |
+--------------------------------------------------------------------+
| PROSPECT LIST                                                      |
| Total Prospects: 47                                                |
| Enriched: 45 (96%)                                                 |
| Verified Emails: 43 (91%)                                          |
| LinkedIn Profiles Found: 41 (87%)                                  |
| Avg Lead Score: 72/100                                             |
+--------------------------------------------------------------------+
| OUTREACH SEQUENCE                                                  |
| Total Touches: 5                                                   |
| Timeline: 14 days                                                  |
|                                                                    |
| Day 1  → Email: Initial outreach                                  |
| Day 3  → LinkedIn: Connection request                             |
| Day 7  → Email: Follow-up with case study                         |
| Day 10 → Call: Phone outreach                                     |
| Day 14 → Email: Breakup email                                     |
+--------------------------------------------------------------------+
| EXPECTED RESULTS (based on historical data)                        |
|                                                                    |
| Prospects: 47                                                      |
| Expected Response Rate: 8-12% (4-6 responses)                      |
| Expected Qualified Leads: 2-4 (SQL)                               |
| Expected Meetings Booked: 1-3                                      |
| Expected Deals Created: 0-1                                        |
|                                                                    |
| Avg Deal Size from Cold Outbound: $85,000                          |
| Campaign ROI Potential: $85K-$170K (if 1-2 deals close)           |
+--------------------------------------------------------------------+
| LAUNCH OPTIONS                                                     |
|                                                                    |
| Launch Timing                                                      |
| [●] Launch immediately (start sending today)                      |
| [ ] Schedule launch: [Select date... 📅]                          |
|                                                                    |
| Send Rate (to avoid spam filters)                                 |
| [10 ▼] emails per hour (recommended: 5-15/hour)                   |
|                                                                    |
| Tracking & Analytics                                               |
| [×] Track email opens                                             |
| [×] Track link clicks                                             |
| [×] Track replies                                                 |
| [×] Log LinkedIn activity                                         |
| [×] Update lead scores based on engagement                        |
|                                                                    |
| Notifications                                                      |
| [×] Notify me when prospect replies                               |
| [×] Daily campaign summary email                                  |
| [×] Weekly performance report                                     |
| [ ] Notify manager of results                                     |
+--------------------------------------------------------------------+
| COMPLIANCE CHECK ✅                                                |
| [×] All prospects have valid business emails (no personal)        |
| [×] Unsubscribe link included in all emails                       |
| [×] CAN-SPAM compliant                                            |
| [×] GDPR compliant (for EU contacts)                              |
| [×] No purchased lists (all organically sourced)                  |
+--------------------------------------------------------------------+
| [← Back] [Save as Draft] [Launch Campaign 🚀]                      |
+--------------------------------------------------------------------+
```

**User Action:** Click "Launch Campaign 🚀"

**System Response:**
1. Campaign created in database
2. 47 leads created (if not already in CRM)
3. Leads assigned to user
4. Sequence automation activated
5. First batch of emails queued
6. Email tracking pixels added
7. LinkedIn automation scheduled
8. Campaign dashboard created
9. Notifications configured
10. Toast: "Campaign launched! First emails sending now. 🚀"

**Time:** 5-10 minutes (review)

---

## Campaign Execution: Real-Time Activity

### Step 5: Monitor Campaign Performance

**User Action:** Navigate to campaign dashboard

**URL:** `/employee/workspace/sales/campaigns/q1-tech-saas-uuid`

**Screen State (Campaign Dashboard):**
```
+--------------------------------------------------------------------+
| Campaign: Q1 2025 Tech Hiring - SaaS Companies        [Edit] [⋮]  |
+--------------------------------------------------------------------+
| Status: ● Active  |  Day 5 of 31  |  Owner: Sarah Johnson          |
+--------------------------------------------------------------------+
| PERFORMANCE SNAPSHOT                                               |
+--------------------------------------------------------------------+
| Prospects      Contacted    Responded    Qualified    Meetings     |
| ─────────────────────────────────────────────────────────────────  |
|    47             47           4            2            1          |
|   100%           100%         8.5%         4.3%         2.1%        |
|                                                                    |
| Response Rate: 8.5% ✅ (Target: 8-12%)                             |
| Qualification Rate: 4.3% ✅ (Target: 4-6%)                         |
+--------------------------------------------------------------------+
| ENGAGEMENT METRICS                                                 |
+--------------------------------------------------------------------+
| Email Performance:                                                 |
| • Sent: 94 (Touch #1: 47, Touch #2: 35, Touch #3: 12)            |
| • Delivered: 92 (98% delivery rate) ✅                             |
| • Opened: 38 (41% open rate) ✅ Above avg                          |
| • Clicked: 12 (13% click rate) ✅ Above avg                        |
| • Replied: 4 (4.3% reply rate) ✅ On target                        |
| • Bounced: 2 (2.1% bounce rate) ✅ Low                             |
| • Unsubscribed: 1 (1.1%) ✅ Normal                                 |
|                                                                    |
| LinkedIn Activity:                                                 |
| • Connection Requests Sent: 35                                     |
| • Accepted: 12 (34% acceptance rate) ✅                            |
| • Messages Sent: 12                                                |
| • Replies: 2 (17% reply rate) ✅                                   |
|                                                                    |
| Phone Calls:                                                       |
| • Attempted: 8                                                     |
| • Connected: 3 (38% connect rate) ✅                               |
| • Voicemails: 5                                                    |
+--------------------------------------------------------------------+
| ACTIVE PROSPECTS (Engaged)                                         |
+--------------------------------------------------------------------+
| Name            Company      Score  Status        Last Activity    |
| ─────────────────────────────────────────────────────────────────  |
| Jennifer Park   TechStart    92/100 🟢 Hot       Replied to email  |
|                 VP Eng                Qualified   2 hours ago       |
|                                       [View] [Call] [Email]         |
| ─────────────────────────────────────────────────────────────────  |
| Michael Chen    CodeBase     85/100 🟡 Warm      Opened email 3x   |
|                 CTO                   Interested  Yesterday         |
|                                       [View] [Call] [Email]         |
| ─────────────────────────────────────────────────────────────────  |
| Robert Kim      DataFlow     78/100 🟡 Warm      LinkedIn connect  |
|                 VP Talent              Interested  2 days ago       |
|                                       [View] [Message]              |
| ─────────────────────────────────────────────────────────────────  |
| Lisa Anderson   CloudTech    81/100 🟢 Hot       Booked meeting    |
|                 CHRO                  Qualified   Meeting: Dec 8    |
|                                       [View] [Prep Call]            |
+--------------------------------------------------------------------+
| UPCOMING ACTIONS (Next 48 Hours)                                   |
+--------------------------------------------------------------------+
| Today:                                                             |
| • Touch #3 (Follow-up Email) sending to 12 prospects at 9:00 AM   |
| • Call attempts scheduled for 3 prospects (warm leads)             |
|                                                                    |
| Tomorrow:                                                          |
| • Touch #4 (Phone Calls) for 8 prospects                          |
| • Meeting: Lisa Anderson (CloudTech) at 10:00 AM                  |
+--------------------------------------------------------------------+
| PIPELINE IMPACT                                                    |
+--------------------------------------------------------------------+
| Deals Created from Campaign: 0 (so far)                            |
| Opportunities Identified: 2 (Jennifer, Lisa)                       |
| Est. Pipeline Value: $160,000 (2 × $80K avg)                      |
| Weighted Value: $64,000 (2 deals × 40% early-stage prob)          |
+--------------------------------------------------------------------+
| 🤖 AI CAMPAIGN INSIGHTS                                            |
|                                                                    |
| Performance: ABOVE AVERAGE ✅                                      |
| • Open rate 41% vs. 28% industry avg (+46%)                       |
| • Reply rate 8.5% vs. 5% industry avg (+70%)                      |
|                                                                    |
| Recommendations:                                                   |
| • Subject line "struggling to hire..." performing well - reuse    |
| • Case study link clicked by 13 prospects - strong interest       |
| • VP Engineering titles responding better than CTOs (67% vs 33%)  |
| • Friday sends getting 2x open rate vs Monday - adjust timing     |
|                                                                    |
| Next Actions:                                                      |
| • Follow up with Jennifer Park TODAY (hot lead, replied)          |
| • Prep for Lisa Anderson meeting (research pain points)           |
| • Call Michael Chen (opened email 3x, high intent)                |
+--------------------------------------------------------------------+
```

**Time:** 2-3 minutes (daily check)

---

## Response Handling: Prospect Replied

### Step 6: Handle Prospect Response

**Context:** Jennifer Park replied to initial email

**System Notification:**
```
🔔 Campaign Response: Jennifer Park (TechStart) replied!

"Hi Sarah,

Yes, we're hiring 6 senior engineers in Q1. Been struggling to find
quality candidates. Would love to learn more about your approach.

Can you send me a case study from a similar company?

Thanks,
Jennifer"
```

**User Action:** Click notification to open conversation

**System Response:**
- Conversation view opens
- Campaign sequence auto-paused for this prospect
- Lead status updated to "contacted" → "warm"
- Lead score increased from 85 → 92 (reply detected)

**Screen State (Conversation View):**
```
+--------------------------------------------------------------------+
| Conversation: Jennifer Park - TechStart Inc.               [Close] |
+--------------------------------------------------------------------+
| Lead Score: 92/100 🟢  Status: Warm  Campaign: Q1 Tech SaaS        |
+--------------------------------------------------------------------+
| CONVERSATION THREAD                                                |
+--------------------------------------------------------------------+
| Dec 3, 2024 2:45 PM - Jennifer Park Replied:                      |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Hi Sarah,                                                      ││
| │                                                                ││
| │ Yes, we're hiring 6 senior engineers in Q1. Been struggling   ││
| │ to find quality candidates. Would love to learn more about    ││
| │ your approach.                                                 ││
| │                                                                ││
| │ Can you send me a case study from a similar company?          ││
| │                                                                ││
| │ Thanks,                                                        ││
| │ Jennifer                                                       ││
| └────────────────────────────────────────────────────────────────┘|
|                                                                    |
| ──────────────────────────────────────────────────────────────────|
|                                                                    |
| Dec 1, 2024 9:00 AM - You Sent (Campaign Email):                  |
| Subject: Jennifer, struggling to hire senior engineers?           |
| [View Original Email]                                              |
|                                                                    |
| Opened: Dec 1 at 10:30 AM, Dec 2 at 3:15 PM                       |
| Clicked: Case study link (Dec 2 at 3:20 PM)                       |
+--------------------------------------------------------------------+
| 🤖 AI REPLY SUGGESTIONS                                            |
|                                                                    |
| Suggested Response #1 (Recommended):                               |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Hi Jennifer,                                                   ││
| │                                                                ││
| │ Great to hear from you! Congrats on the growth that's         ││
| │ driving the 6 hires.                                           ││
| │                                                                ││
| │ I'll send you 2 case studies that are very relevant:          ││
| │                                                                ││
| │ 1. CodeFlow (Series B SaaS, ~500 employees) - Hired 8 senior ││
| │    engineers in 6 weeks. Here's what made it work: [link]     ││
| │                                                                ││
| │ 2. DataStream (HR tech, similar stage) - Filled 12 roles in  ││
| │    2 months during rapid growth: [link]                       ││
| │                                                                ││
| │ Quick question: What's your biggest challenge right now?      ││
| │ • Finding qualified candidates?                                ││
| │ • Speed (time to hire)?                                        ││
| │ • Both?                                                        ││
| │                                                                ││
| │ I'd love to understand your situation better. Worth a quick   ││
| │ 15-min call this week? Here's my calendar: [Calendly link]    ││
| │                                                                ││
| │ Best,                                                          ││
| │ Sarah                                                          ││
| └────────────────────────────────────────────────────────────────┘|
| [Use This Response] [Edit] [Generate Another]                     |
|                                                                    |
| Suggested Response #2 (Shorter):                                   |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Hi Jennifer! Absolutely. Just sent you 2 case studies from   ││
| │ similar companies. Worth a quick call to discuss your specific││
| │ needs? [Calendar link]                                         ││
| └────────────────────────────────────────────────────────────────┘|
| [Use This Response]                                                |
+--------------------------------------------------------------------+
| COMPOSE REPLY                                                      |
| ┌────────────────────────────────────────────────────────────────┐|
| │ To: Jennifer Park <jennifer.park@techstart.io>                ││
| │ Subject: RE: Jennifer, struggling to hire senior engineers?   ││
| │                                                                ││
| │ [Type your reply or use AI suggestion above...]               ││
| │                                                                ││
| │                                                                ││
| │                                                                ││
| │                                                         ] 0/2000││
| └────────────────────────────────────────────────────────────────┘|
|                                                                    |
| [Insert Template ▼] [Attach File] [Schedule Send] [Send Now]      |
+--------------------------------------------------------------------+
| NEXT STEPS                                                         |
|                                                                    |
| Recommended Actions:                                               |
| [×] Send case studies (via reply)                                 |
| [×] Book discovery call (include Calendly link)                   |
| [ ] Qualify with BANT (during call)                               |
| [ ] Create deal (if qualified)                                    |
|                                                                    |
| Campaign Status for This Prospect:                                 |
| ⏸ PAUSED (auto-paused due to reply)                               |
| Remaining touches (4, 5) will NOT be sent unless manually resumed  |
+--------------------------------------------------------------------+
```

**User Action:** Click "Use This Response" on Suggestion #1

**User Action:** Click "Send Now"

**System Response:**
- Email sent to Jennifer
- Activity logged: "Campaign reply sent"
- Lead score updated: 92 → 95 (quick response)
- Task created: "Follow up if Jennifer books meeting"
- Campaign touch #2, #3, #4, #5 canceled for this prospect
- Toast: "Reply sent to Jennifer Park ✓"

**Time:** 3-5 minutes per response

---

## Campaign Results: Week 2

### Step 7: Campaign Performance Report

**User Action:** Navigate to campaign, click "Performance Report"

**Screen State (Week 2 Report):**
```
+--------------------------------------------------------------------+
| Campaign Performance Report                         [Export PDF ↓] |
+--------------------------------------------------------------------+
| Campaign: Q1 2025 Tech Hiring - SaaS Companies                     |
| Period: Dec 1-14, 2024 (14 days)                                   |
| Owner: Sarah Johnson                                               |
+--------------------------------------------------------------------+
| RESULTS SUMMARY                                                    |
+--------------------------------------------------------------------+
|                         Target    Actual   Achievement             |
| Prospects Contacted       47        47       100% ✅               |
| Response Rate           8-12%      9.8%      ✅ On Target          |
| Qualified Leads (SQL)    2-4        3        ✅ On Target          |
| Meetings Booked          1-3        2        ✅ On Target          |
| Deals Created            0-1        1        🎉 Exceeded!          |
+--------------------------------------------------------------------+
| ENGAGEMENT FUNNEL                                                  |
+--------------------------------------------------------------------+
|                                                                    |
| 47 Prospects (100%)                                                |
|   │                                                                |
|   ├─► 47 Emails Delivered (100%)                                  |
|   │     │                                                          |
|   │     ├─► 19 Opened (40.4%) ← Above avg (28%)                   |
|   │     │     │                                                    |
|   │     │     ├─► 6 Clicked (31.6% of opens) ← Strong             |
|   │     │     │                                                    |
|   │     │     └─► 5 Replied (26.3% of opens) ← Excellent          |
|   │     │                                                          |
|   │     └─► 28 Not Opened (59.6%)                                 |
|   │                                                                |
|   ├─► 35 LinkedIn Requests (74.5%)                                |
|   │     │                                                          |
|   │     ├─► 14 Accepted (40%) ← Good                              |
|   │     │     │                                                    |
|   │     │     └─► 2 Replied to Messages (14.3%)                   |
|   │     │                                                          |
|   │     └─► 21 Pending/Ignored (60%)                              |
|   │                                                                |
|   └─► 12 Phone Calls Attempted                                    |
|         │                                                          |
|         ├─► 4 Connected (33.3%)                                   |
|         │                                                          |
|         └─► 8 Voicemail (66.7%)                                   |
|                                                                    |
| OUTCOMES:                                                          |
| • 5 Total Responses (10.6% response rate)                         |
| • 3 Qualified Leads (6.4% qualification rate)                     |
| • 2 Meetings Booked (4.3% meeting rate)                           |
| • 1 Deal Created (2.1% conversion rate)                           |
+--------------------------------------------------------------------+
| DETAILED RESULTS                                                   |
+--------------------------------------------------------------------+
| Prospect         Response    Outcome          Value     Status     |
| ─────────────────────────────────────────────────────────────────  |
| Jennifer Park    Email reply Qualified → Deal $280K    Closed     |
|                  (Day 2)     Created                    (won)      |
| ─────────────────────────────────────────────────────────────────  |
| Lisa Anderson    Email reply Qualified       $95K     In progress |
|                  (Day 3)     Meeting booked            (proposal)  |
| ─────────────────────────────────────────────────────────────────  |
| Michael Chen     Opened 3x   Qualified       $120K    In progress |
|                  No reply    Phone call conv          (discovery) |
| ─────────────────────────────────────────────────────────────────  |
| Robert Kim       LinkedIn    Warm lead       TBD      Nurture     |
|                  connect     Not qualified yet                    |
| ─────────────────────────────────────────────────────────────────  |
| Sarah Williams   Replied     Not interested  -        Disqualified|
|                  (Day 4)     "Not hiring"                          |
+--------------------------------------------------------------------+
| ROI ANALYSIS                                                       |
+--------------------------------------------------------------------+
| Campaign Costs:                                                    |
| • Time spent (setup + execution): 12 hours × $75/hr = $900        |
| • Tools (LinkedIn, ZoomInfo): $150/month (allocated) = $150       |
| • Email service: Included in platform                             |
| Total Cost: $1,050                                                 |
|                                                                    |
| Pipeline Created:                                                  |
| • 1 deal closed-won: $280,000 (Jennifer / TechStart)             |
| • 2 deals in progress: $215,000 (Lisa + Michael)                  |
| Total Pipeline: $495,000                                           |
|                                                                    |
| Weighted Pipeline Value: $280K + ($215K × 50% prob) = $387,500    |
|                                                                    |
| ROI: $387,500 ÷ $1,050 = 369x return (369,000%)                   |
|                                                                    |
| Commission Earnings (if all deals close):                          |
| • Jennifer (TechStart): $280K × 12% = $33,600                     |
| • Lisa (CloudTech): $95K × 10% = $9,500                           |
| • Michael (CodeBase): $120K × 10% = $12,000                       |
| Total Potential: $55,100                                           |
+--------------------------------------------------------------------+
| TOP PERFORMERS                                                     |
+--------------------------------------------------------------------+
| Best Email Subject:                                                |
| "Jennifer, struggling to hire senior engineers?" → 48% open rate  |
|                                                                    |
| Best Day/Time to Send:                                             |
| Friday 9:00 AM → 2.2x higher open rate than Monday                |
|                                                                    |
| Best Touch Point:                                                  |
| Touch #1 (Initial Email) → 5 of 5 responses came from Touch #1    |
|                                                                    |
| Best Persona:                                                      |
| VP Engineering → 60% response rate (vs. CTO 20%, CHRO 10%)        |
+--------------------------------------------------------------------+
| LEARNINGS & NEXT STEPS                                             |
+--------------------------------------------------------------------+
| ✅ What Worked:                                                    |
| • Personalized subject lines (company name, specific pain)        |
| • Case studies as social proof (clicked by 31% of opens)          |
| • Short, scannable emails (avg 150 words)                         |
| • Quick follow-up on replies (<2 hours)                           |
| • VP Engineering titles highly responsive                         |
|                                                                    |
| ⚠ What Didn't Work:                                                |
| • LinkedIn messages low reply rate (14%)                          |
| • Phone calls low connect rate (33%)                              |
| • CTO titles unresponsive (only 20% response)                     |
| • Monday sends low open rate (25% vs. Friday 55%)                 |
|                                                                    |
| 🎯 Recommendations for Next Campaign:                              |
| • Focus on VP Engineering titles (highest response)               |
| • Send emails Friday mornings (2x better performance)             |
| • Lead with case studies in initial email (high click rate)       |
| • Skip LinkedIn for cold outreach (low ROI)                       |
| • Reduce sequence to 3 touches (80% of responses from Touch #1)   |
| • Test A/B subject lines (personalized vs. value prop)            |
+--------------------------------------------------------------------+
```

**Time:** 5-10 minutes to review

---

## Postconditions

### After Campaign Completion

1. ✅ All prospects contacted per sequence
2. ✅ Responses logged and followed up
3. ✅ Qualified leads moved to BANT qualification
4. ✅ Meetings scheduled and prepared
5. ✅ Deals created from hot prospects
6. ✅ Campaign performance analyzed
7. ✅ Learnings documented for future campaigns
8. ✅ Low-response prospects moved to nurture

---

## Events Logged

| Event | Payload |
|-------|---------|
| `campaign.created` | `{ campaign_id, name, type, owner_id }` |
| `campaign.launched` | `{ campaign_id, prospect_count, start_date }` |
| `campaign.email_sent` | `{ campaign_id, prospect_id, touch_number }` |
| `campaign.response` | `{ campaign_id, prospect_id, response_type }` |
| `campaign.prospect_qualified` | `{ campaign_id, prospect_id, lead_id }` |
| `campaign.completed` | `{ campaign_id, end_date, results }` |

---

## Related Use Cases

- [02-manage-leads.md](./02-manage-leads.md) - Qualifying prospects from campaign
- [03-manage-deals.md](./03-manage-deals.md) - Converting qualified leads to deals
- [01-daily-workflow.md](./01-daily-workflow.md) - Daily prospecting activities

---

*Last Updated: 2024-11-30*
