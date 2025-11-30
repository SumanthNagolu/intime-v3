# Use Case: Close Deal and Handoff

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-SALES-005 |
| Actor | Sales Representative |
| Goal | Successfully close deal, finalize contracts, and hand off to delivery team |
| Frequency | 2-4 times per quarter |
| Estimated Time | 2-8 hours (spread across multiple days) |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Sales Representative
2. Deal in "Negotiation" or "Legal Review" stage
3. Pricing and terms agreed with client
4. MSA/SOW drafted and reviewed
5. Account Manager assigned for handoff
6. Recruiter/Delivery team identified

---

## Trigger

One of the following:
- Client verbally commits to proceed
- Pricing negotiation complete
- Contract terms finalized
- Legal review approved (both sides)
- Client ready to sign paperwork

---

## Deal Close Stages

### Final Stages Before Close

```
┌────────────────────────────────────────────────────────────────────┐
│ CLOSING SEQUENCE                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ NEGOTIATION (75% probability)                                      │
│ ├─ Pricing finalized                                               │
│ ├─ Terms agreed (payment, guarantee, etc.)                         │
│ ├─ Stakeholders aligned                                            │
│ └─ Exit: Verbal commitment to proceed                              │
│                                                                     │
│ LEGAL REVIEW (90% probability)                                     │
│ ├─ MSA drafted and sent                                            │
│ ├─ Client legal review (5-10 days typical)                         │
│ ├─ Redlines exchanged and resolved                                 │
│ ├─ Final approval from both legal teams                            │
│ └─ Exit: Ready to sign                                             │
│                                                                     │
│ CLOSED-WON (100% probability)                                      │
│ ├─ MSA signed by both parties                                      │
│ ├─ SOW signed (if applicable)                                      │
│ ├─ Payment terms confirmed                                         │
│ ├─ Account handoff to Account Manager                              │
│ └─ Jobs created and assigned to recruiters                         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Main Flow: Finalize Negotiation

### Step 1: Final Pricing Alignment

**Context:** MegaCorp deal, negotiating final pricing

**User Action:** Navigate to deal detail page

**Screen State (Deal in Negotiation):**
```
+--------------------------------------------------------------------+
| MegaCorp - RPO Partnership                          [Edit] [⋮] [🤖]|
+--------------------------------------------------------------------+
| Stage: Negotiation  │  Value: $95,000  │  Probability: 75%        |
| Expected Close: Dec 5, 2024 (2 days)    │  Age: 47 days           |
+--------------------------------------------------------------------+
| ⚠ ATTENTION: CLOSE DATE IN 2 DAYS                                 |
+--------------------------------------------------------------------+
| NEGOTIATION STATUS                                                 |
+--------------------------------------------------------------------+
| Current Ask: $95,000 annual                                        |
| Client Counter: $85,000 annual (10.5% discount requested)         |
| Your Authority: Approve up to 10% discount                         |
| Manager Approval: Required for >10%                                |
+--------------------------------------------------------------------+
| RECENT ACTIVITY                                                    |
+--------------------------------------------------------------------+
| Dec 3, 3:45 PM - Call with Tom Wilson (VP Sales)                  |
| Tom requested 10% discount to match competitor pricing.            |
| Willing to sign MSA this week if we can meet price.               |
| Budget approved at $85K. No flexibility above that.                |
| [View Call Notes →]                                                |
+--------------------------------------------------------------------+
| PRICING BREAKDOWN                                                  |
+--------------------------------------------------------------------+
| Original Proposal:                                                 |
| • 4 placements × $25,000 = $100,000                               |
| • Early payment discount: -5% = $95,000                           |
|                                                                    |
| Client Counter:                                                    |
| • Same scope: 4 placements                                        |
| • Requested price: $85,000 (10.5% total discount)                 |
| • Justification: Competitor quote at $88K                         |
|                                                                    |
| Your Options:                                                      |
| 1. Accept $85K (requires manager approval - 15% discount)         |
| 2. Counter at $90K (5% compromise, within your authority)         |
| 3. Add value instead of discount (extended guarantee, etc.)       |
+--------------------------------------------------------------------+
| DECISION TOOLS                                                     |
+--------------------------------------------------------------------+
| Profitability Calculator:                                          |
|                                                                    |
| At $95K:  Margin = 32%  Profit = $30,400                          |
| At $90K:  Margin = 28%  Profit = $25,200                          |
| At $85K:  Margin = 24%  Profit = $20,400                          |
|                                                                    |
| Competitor Analysis:                                               |
| • Competitor: TalentSource Pro at $88K                            |
| • Our Advantage: Quality, speed, relationship                     |
| • Risk: Losing deal over $5K difference                           |
|                                                                    |
| 🤖 AI RECOMMENDATION:                                              |
| Counter at $90K with added value:                                 |
| • Maintain healthier margin (28% vs 24%)                          |
| • Add 120-day guarantee (vs. standard 90-day)                     |
| • Emphasize relationship value and case studies                   |
| Win probability: 80% (up from 75%)                                |
+--------------------------------------------------------------------+
| ACTIONS                                                            |
| [Request Manager Approval ($85K)] [Counter Offer ($90K)]           |
| [Schedule Call to Discuss] [View Competitor Analysis]              |
+--------------------------------------------------------------------+
```

**User Action:** Click "Counter Offer ($90K)"

**System Response:**
- Counter offer modal opens

**Screen State:**
```
+--------------------------------------------------------------------+
| Create Counter Offer - MegaCorp                                [×] |
+--------------------------------------------------------------------+
| Current Client Ask: $85,000 (15% discount)                         |
| Your Counter: $90,000 (10% discount - within your authority)      |
+--------------------------------------------------------------------+
| COUNTER OFFER DETAILS                                              |
|                                                                    |
| Proposed Price *                                                   |
| [$90,000      ] annual (4 placements × $22,500 avg)               |
|                                                                    |
| Discount from Original                                             |
| Original: $100,000  →  Counter: $90,000  =  10% discount          |
|                                                                    |
| Justification / Value Adds *                                       |
| [We can meet at $90K and I'll add extra value:                 ]  |
| [                                                               ]  |
| [1. Extended 120-day replacement guarantee (vs. standard 90)   ]  |
| [2. Dedicated account manager (weekly check-ins)                ]  |
| [3. Priority candidate pipeline (first dibs on new talent)      ]  |
| [4. Quarterly hiring market insights report                     ]  |
| [                                                               ]  |
| [This represents $15K+ in additional value while meeting your  ]  |
| [budget needs. Our quality and speed will save you much more   ]  |
| [than the $5K difference from the competitor.                  ]  |
|                                                             ] 412/1000|
+--------------------------------------------------------------------+
| PAYMENT TERMS                                                      |
|                                                                    |
| Standard Terms: Net 30                                             |
|                                                                    |
| Early Payment Incentive (optional):                                |
| [ ] Offer 2% discount for Net 15 payment                          |
| [ ] Offer 3% discount for prepayment                              |
|                                                                    |
| Volume Incentive (optional):                                       |
| [×] If 6+ placements in Year 1: Reduce per-placement fee to $21K  |
+--------------------------------------------------------------------+
| CONTRACT TIMELINE                                                  |
|                                                                    |
| If Accepted:                                                       |
| 1. Send revised proposal: Today (Dec 3)                           |
| 2. Client review: 1-2 days (Dec 4-5)                              |
| 3. MSA execution: Dec 5, 2024                                     |
| 4. First job orders: Week of Dec 9                                |
+--------------------------------------------------------------------+
| SEND METHOD                                                        |
|                                                                    |
| [●] Email proposal (immediate)                                    |
| [ ] Schedule call to present (delay)                              |
|                                                                    |
| Email Recipients:                                                  |
| [×] Tom Wilson - VP Sales (Primary)                               |
| [×] Jessica Lee - Procurement (CC)                                |
| [ ] Other: [                          ]                           |
+--------------------------------------------------------------------+
| [Cancel] [Save Draft] [Send Counter Offer]                         |
+--------------------------------------------------------------------+
```

**User Action:** Click "Send Counter Offer"

**System Response:**
1. Counter proposal generated (PDF)
2. Email sent to Tom Wilson + Jessica Lee
3. Activity logged: "Counter offer sent - $90K"
4. Deal.value updated to $90,000
5. Task created: "Follow up on counter offer" (Due: Tomorrow)
6. Email tracking enabled
7. Toast: "Counter offer sent to MegaCorp ✓"

**Time:** 10-15 minutes

---

### Step 2: Counter Offer Accepted

**Context:** Client accepted $90K counter offer

**System Notification:**
```
🔔 Email Response: Tom Wilson (MegaCorp)

"Sarah,

$90K works. The extended guarantee and dedicated AM are valuable.

Let's move forward. Can you send the MSA today?

Best,
Tom"
```

**User Action:** Click notification

**System Response:**
- Lead to contract generation flow

**User Action:** Log activity (accept verbal commitment)

**Screen State (Log Call/Email):**
```
+--------------------------------------------------------------------+
| Log Activity - MegaCorp Deal                                   [×] |
+--------------------------------------------------------------------+
| Activity Type: [Email Response ▼]                                 |
| Date: [Dec 3, 2024 ▼]  Time: [4:30 PM ▼]                          |
+--------------------------------------------------------------------+
| DETAILS                                                            |
|                                                                    |
| Subject: Counter offer accepted                                    |
|                                                                    |
| Notes:                                                             |
| [Tom Wilson accepted $90K counter offer via email. Ready to    ]  |
| [proceed with MSA. Requested MSA be sent today. Verbal commit  ]  |
| [to sign by Dec 5. Moving to Legal Review stage.               ]  |
|                                                              ] 163/1000|
|                                                                    |
| Outcome: [●] Very Positive  [ ] Positive  [ ] Neutral              |
+--------------------------------------------------------------------+
| DEAL UPDATE                                                        |
|                                                                    |
| Move Stage: [Negotiation ▼] → [Legal Review ▼] ✓                  |
| Update Probability: 75% → [90% ▼]                                 |
| Update Close Date: [Dec 5, 2024 📅] (Keep)                         |
| Final Deal Value: [$90,000      ] (Updated)                       |
+--------------------------------------------------------------------+
| NEXT ACTIONS                                                       |
|                                                                    |
| [×] Send MSA for signature         Due: [Today ▼]                 |
| [×] Schedule contract review call  Due: [Dec 4 ▼]                 |
| [ ] Coordinate legal review        Due: [Dec 5 ▼]                 |
+--------------------------------------------------------------------+
| [Cancel] [Save Activity] [Save & Move to Legal Review →]           |
+--------------------------------------------------------------------+
```

**User Action:** Click "Save & Move to Legal Review →"

**System Response:**
- Activity logged
- Deal stage: Negotiation → Legal Review
- Deal probability: 75% → 90%
- Deal value: $95K → $90K
- 3 tasks created
- Manager notified (deal progressing to close)
- Legal team notified (MSA review incoming)

**Time:** 5 minutes

---

## MSA Generation and Execution

### Step 3: Generate MSA

**User Action:** From deal detail, click "Generate MSA" button

**System Response:**
- MSA builder opens with template

**Screen State:**
```
+--------------------------------------------------------------------+
| Generate Master Service Agreement (MSA)                        [×] |
+--------------------------------------------------------------------+
| Deal: MegaCorp - RPO Partnership                                   |
| Value: $90,000 annual  |  Expected Close: Dec 5, 2024              |
+--------------------------------------------------------------------+
| MSA TEMPLATE                                                       |
|                                                                    |
| Template: [Standard MSA - USA ▼]                                  |
|                                                                    |
| Options:                                                           |
| • Standard MSA - USA (default)                                    |
| • Standard MSA - UK                                               |
| • Standard MSA - India                                            |
| • Statement of Work (SOW) Only                                    |
| • Custom Template                                                 |
+--------------------------------------------------------------------+
| CONTRACT PARTIES                                                   |
+--------------------------------------------------------------------+
| PROVIDER (InTime):                                                 |
| Legal Entity: InTime Staffing Solutions, LLC                       |
| Address: 123 Main Street, San Francisco, CA 94105                  |
| Signatory: John Smith, CEO                                         |
| Email: john.smith@intime.com                                       |
|                                                                    |
| CLIENT:                                                            |
| Legal Entity: [MegaCorp Industries, Inc.                        ]  |
| Address: [456 Corporate Blvd, Austin, TX 78701                  ]  |
| Signatory: [Tom Wilson ▼] - VP Sales                              |
| Email: [tom.wilson@megacorp.com                                 ]  |
+--------------------------------------------------------------------+
| CONTRACT TERMS                                                     |
+--------------------------------------------------------------------+
| Contract Start Date *                                              |
| [Dec 6, 2024 📅] (Day after expected signature)                    |
|                                                                    |
| Contract End Date *                                                |
| [Dec 6, 2025 📅] (1 year)                                          |
| Auto-renewal: [×] Yes, annual renewal unless 60 days notice       |
|                                                                    |
| Total Contract Value                                               |
| [$90,000      ] (4 placements × $22,500 avg)                      |
|                                                                    |
| Payment Terms                                                      |
| [Net 30 ▼]  Invoicing: [Bi-weekly based on timesheets ▼]         |
|                                                                    |
| Markup Percentage (Internal Only)                                  |
| [32% ▼] (not shown to client)                                     |
+--------------------------------------------------------------------+
| SCOPE OF SERVICES                                                  |
+--------------------------------------------------------------------+
| Service Type:                                                      |
| [×] Contract Staffing                                             |
| [×] Direct Hire Recruiting                                        |
| [ ] Retained Search                                               |
| [ ] RPO (Recruitment Process Outsourcing)                         |
|                                                                    |
| Estimated Placements: [4] positions in Year 1                     |
|                                                                    |
| Job Categories:                                                    |
| [×] Engineering / Technical                                       |
| [×] Product Management                                            |
| [ ] Sales / Marketing                                             |
| [ ] Operations / Administrative                                   |
+--------------------------------------------------------------------+
| GUARANTEES & SLAs                                                  |
+--------------------------------------------------------------------+
| Replacement Guarantee                                              |
| [120 days ▼] (Custom - standard is 90 days)                       |
|                                                                    |
| Time to First Candidates                                           |
| [7-10 business days ▼]                                            |
|                                                                    |
| Service Level Agreement (SLA):                                     |
| [×] Dedicated Account Manager (weekly check-ins)                  |
| [×] Quarterly business reviews                                    |
| [ ] 24-hour response time guarantee                               |
+--------------------------------------------------------------------+
| SPECIAL TERMS & RIDERS (from negotiation)                          |
+--------------------------------------------------------------------+
| Custom Terms:                                                      |
| [×] Extended 120-day replacement guarantee                        |
| [×] Dedicated account manager with weekly check-ins               |
| [×] Priority candidate pipeline access                            |
| [×] Quarterly hiring market insights report                       |
| [×] Volume incentive: 6+ placements → $21K per placement          |
+--------------------------------------------------------------------+
| LEGAL CLAUSES                                                      |
+--------------------------------------------------------------------+
| Standard Clauses (pre-approved by legal):                          |
| [×] Confidentiality / NDA                                         |
| [×] Intellectual Property (client owns work product)              |
| [×] Liability limitations                                         |
| [×] Termination (30-day notice)                                   |
| [×] Governing law (State of California)                           |
| [×] Dispute resolution (mediation first, then arbitration)        |
|                                                                    |
| Custom Clauses (requires legal review):                            |
| [ ] Add custom clause: [                                       ]  |
+--------------------------------------------------------------------+
| DOCUMENT GENERATION                                                |
|                                                                    |
| Documents to Generate:                                             |
| [×] Master Service Agreement (MSA)                                |
| [×] Statement of Work (SOW) - 4 positions                         |
| [×] Rate Card                                                     |
| [ ] Work Order Template                                           |
|                                                                    |
| Signature Method:                                                  |
| [●] DocuSign (electronic signature)                               |
| [ ] Wet signature (PDF for manual signing)                        |
|                                                                    |
| [Preview Documents] [Save Draft] [Generate & Send for Signature →]|
+--------------------------------------------------------------------+
```

**User Action:** Click "Preview Documents"

**System Response:**
- Generates PDF preview of MSA, SOW, Rate Card
- Shows preview modal

**User Action:** Review documents, click "Generate & Send for Signature →"

**System Response:**
1. 3 PDFs generated (MSA, SOW, Rate Card)
2. DocuSign envelope created
3. Signing order configured:
   - Tom Wilson (MegaCorp) → Signs first
   - John Smith (InTime CEO) → Signs second
4. Email sent to Tom Wilson with DocuSign link
5. Activity logged: "MSA sent for signature"
6. Documents attached to deal
7. Task created: "Monitor MSA signature status"
8. Toast: "MSA sent to Tom Wilson via DocuSign ✓"

**Time:** 15-20 minutes

---

### Step 4: Monitor Contract Execution

**User Action:** Check deal detail page next day

**Screen State (MSA Pending Signature):**
```
+--------------------------------------------------------------------+
| MegaCorp - RPO Partnership                          [Edit] [⋮] [🤖]|
+--------------------------------------------------------------------+
| Stage: Legal Review  │  Value: $90,000  │  Probability: 90%       |
| Expected Close: Dec 5, 2024 (Tomorrow) ⏰                          |
+--------------------------------------------------------------------+
| CONTRACT STATUS                                                    |
+--------------------------------------------------------------------+
| MSA Signature Progress:                                            |
|                                                                    |
| ┌────────────────────────────────────────────────────────────────┐|
| │ Step 1: Client Signature (Tom Wilson - MegaCorp)              ││
| │ Status: ✅ SIGNED                                              ││
| │ Signed: Dec 4, 2024 at 2:15 PM                                ││
| │                                                                ││
| │ Step 2: InTime Signature (John Smith - CEO)                   ││
| │ Status: ⏳ PENDING                                             ││
| │ Sent: Dec 4, 2024 at 2:16 PM (auto-sent after client signed) ││
| │ Expected: Today EOD                                            ││
| └────────────────────────────────────────────────────────────────┘|
|                                                                    |
| Documents:                                                         |
| • MSA_MegaCorp_2024.pdf (signed by client ✓)                     |
| • SOW_MegaCorp_4positions.pdf (signed by client ✓)               |
| • Rate_Card_MegaCorp.pdf (reference only)                         |
|                                                                    |
| [View Signed MSA] [Download All Documents] [Remind Signer]        |
+--------------------------------------------------------------------+
| RECENT ACTIVITY                                                    |
+--------------------------------------------------------------------+
| Dec 4, 2:16 PM - DocuSign: Auto-sent to John Smith (InTime CEO)  |
| Dec 4, 2:15 PM - DocuSign: Tom Wilson (MegaCorp) signed MSA ✓    |
| Dec 4, 9:00 AM - DocuSign: Tom Wilson opened signature request   |
| Dec 3, 4:45 PM - MSA sent to Tom Wilson for signature            |
+--------------------------------------------------------------------+
| NEXT STEPS (Preparing for Close)                                  |
+--------------------------------------------------------------------+
| 🟡 WAITING: InTime CEO signature (expected today)                 |
| 🟢 READY: Account handoff to Tom Anderson (Account Manager)       |
| 🟢 READY: Job orders drafted (4 positions)                        |
| 🟢 READY: Recruiter assignment (Jessica Kim)                      |
+--------------------------------------------------------------------+
```

**Time:** 1-2 minutes (checking status)

---

## Deal Close: Fully Executed

### Step 5: MSA Fully Executed - Close Deal

**System Notification (Real-time):**
```
🎉 DocuSign Completed: MegaCorp MSA Fully Executed!

John Smith (InTime CEO) signed at Dec 4, 2024 4:30 PM.

All parties have signed. Contract is now fully executed.

[Close Deal Now →]
```

**User Action:** Click "Close Deal Now →"

**System Response:**
- Close deal modal opens (see UC-SALES-003 for full detail)

**Screen State:**
```
+--------------------------------------------------------------------+
| Close Deal - MegaCorp RPO Partnership                          [×] |
+--------------------------------------------------------------------+
| Deal Value: $90,000  |  Probability: 90%  |  Age: 48 days          |
+--------------------------------------------------------------------+
| CLOSE OUTCOME *                                                    |
| [●] Closed-Won (We won!) 🎉                                        |
+--------------------------------------------------------------------+
| CLOSED-WON DETAILS                                                 |
+--------------------------------------------------------------------+
| Actual Close Date: [Dec 4, 2024 📅]                                |
| Expected: Dec 5, 2024 (1 day early! ✅)                            |
|                                                                    |
| Final Deal Value: [$90,000] (Negotiated from $95K)                |
|                                                                    |
| Contract Details:                                                  |
| Contract Type: [Master Service Agreement (MSA) ▼]                 |
| Contract Start: [Dec 6, 2024 📅]                                   |
| Contract End: [Dec 6, 2025 📅] (1 year, auto-renew)               |
| Payment Terms: [Net 30 ▼]                                         |
|                                                                    |
| Contract Documents:                                                |
| [×] MSA Signed: MSA_MegaCorp_2024.pdf ✓ (auto-attached)          |
| [×] SOW Signed: SOW_MegaCorp_4positions.pdf ✓                     |
| [×] Rate Card: Rate_Card_MegaCorp.pdf ✓                           |
+--------------------------------------------------------------------+
| HANDOFF & NEXT STEPS                                               |
+--------------------------------------------------------------------+
| Account Manager * (owns client relationship going forward)         |
| [Tom Anderson ▼]                                                   |
|                                                                    |
| Create Jobs from Deal?                                             |
| [●] Yes, create job orders now                                    |
| [ ] No, I'll create jobs later                                    |
|                                                                    |
| Planned Positions (from SOW):                                      |
| [×] 2 × Senior Software Engineers                                 |
| [×] 1 × Product Manager                                           |
| [×] 1 × DevOps Engineer                                           |
|                                                                    |
| Assign Jobs To (Recruiter/Manager):                                |
| [Jessica Kim - Recruiting Manager ▼]                              |
|                                                                    |
| Internal Handoff Notes *                                           |
| [KEY CLIENT INFO:                                               ]  |
| [• Contact: Tom Wilson (VP Sales) - Prefers email, responsive  ]  |
| [• Contract: 120-day replacement guarantee (extended)          ]  |
| [• SLA: Weekly check-ins with Account Manager (Tom A.)         ]  |
| [• Volume incentive: 6+ placements → $21K rate                 ]  |
| [• Priority: First 2 roles urgent (need by Jan 15)             ]  |
| [• Tech Stack: Python, AWS, React (for screening)              ]  |
| [                                                               ]  |
| [NEGOTIATION HISTORY:                                           ]  |
| [• Started at $100K, client asked for $85K                     ]  |
| [• Countered at $90K with added value (120-day guarantee, AM)  ]  |
| [• Client accepted quickly - good relationship                 ]  |
|                                                             ] 487/2000|
+--------------------------------------------------------------------+
| CLOSE ANALYSIS                                                     |
+--------------------------------------------------------------------+
| Win Reason (select all that apply):                                |
| [×] Quality of talent / Reputation                                |
| [×] Speed to fill                                                 |
| [ ] Pricing (competitive)                                         |
| [×] Relationship / Trust                                          |
| [×] Value-adds (extended guarantee, dedicated AM)                 |
| [ ] Case studies / References                                     |
|                                                                    |
| Competitors We Beat:                                               |
| [TalentSource Pro ($88K offer)                                  ]  |
|                                                                    |
| Key Success Factors:                                               |
| [Strong discovery call established pain points clearly.         ]  |
| [Counter-offer with added value (vs. pure discount) maintained ]  |
| [healthy margin while meeting client budget. Extended guarantee]  |
| [and dedicated AM were differentiators. Responsive follow-up.  ]  |
|                                                              ] 278/1000|
+--------------------------------------------------------------------+
| COMMISSION CALCULATION                                             |
+--------------------------------------------------------------------+
| Deal Value: $90,000                                                |
| Commission Rate: 12% (Tier 3 - 105% quota attainment)             |
| Commission: $10,800                                                |
| New Logo Bonus: $1,500                                             |
| Total Earnings: $12,300 💰                                         |
|                                                                    |
| Payment: Monthly based on invoiced revenue                         |
| Est. First Payment: January 2025 (after first invoice paid)       |
+--------------------------------------------------------------------+
| [Cancel] [Close as Won 🎉]                                         |
+--------------------------------------------------------------------+
```

**User Action:** Click "Close as Won 🎉"

**System Response:**
1. **Deal Updated:**
   - stage: "closed_won"
   - probability: 100%
   - actualCloseDate: Dec 4, 2024
   - closeReason: "Won - Quality, value-adds, relationship"

2. **Account Updated:**
   - status: "prospect" → "active"
   - accountManagerId: Tom Anderson
   - contractStartDate: Dec 6, 2024
   - contractEndDate: Dec 6, 2025
   - markupPercentage: 32%

3. **Jobs Created (4):**
   ```
   Job #1: Senior Software Engineer (Backend)
   - Client: MegaCorp
   - Rate: $95-110/hr
   - Owner: Jessica Kim
   - Status: Open

   Job #2: Senior Software Engineer (Frontend)
   - Client: MegaCorp
   - Rate: $90-105/hr
   - Owner: Jessica Kim
   - Status: Open

   Job #3: Product Manager
   - Client: MegaCorp
   - Rate: $85-100/hr
   - Owner: Jessica Kim
   - Status: Open

   Job #4: DevOps Engineer
   - Client: MegaCorp
   - Rate: $100-120/hr
   - Owner: Jessica Kim
   - Status: Open
   ```

4. **Activities Logged:**
   - "Deal closed - WON 🎉"
   - "Contract executed - MSA signed by all parties"
   - "Account handed off to Tom Anderson (AM)"
   - "4 job orders created and assigned to Jessica Kim"

5. **Notifications Sent:**
   - **Manager:** "Sarah closed MegaCorp deal - $90K! 🎉"
   - **Account Manager (Tom):** "New account assigned: MegaCorp - $90K annual"
   - **Recruiter (Jessica):** "4 new jobs assigned from MegaCorp (urgent)"
   - **CEO:** "New client: MegaCorp Industries - $90K ARR"
   - **Finance:** "New MSA: MegaCorp - $90K, Net 30 terms"

6. **Commission Record Created:**
   - User: Sarah Johnson
   - Deal: MegaCorp
   - Amount: $12,300 ($10,800 commission + $1,500 new logo bonus)
   - Status: Pending invoice
   - Expected payment: January 2025

7. **Documents Stored:**
   - MSA_MegaCorp_2024.pdf (signed)
   - SOW_MegaCorp_4positions.pdf (signed)
   - Rate_Card_MegaCorp.pdf
   - All linked to Account and Deal

8. **UI Response:**
   - Confetti animation plays 🎉
   - Success modal appears
   - Deal card moves to "Closed-Won" column
   - User redirected to Account detail page
   - Toast: "Congratulations! MegaCorp deal closed - $90,000! 🎉"

**Time:** 10-15 minutes (full close process)

---

## Post-Close: Account Handoff

### Step 6: Handoff Meeting with Account Manager

**Context:** Schedule handoff meeting with Account Manager

**User Action:** From account detail page, click "Schedule Handoff Meeting"

**Screen State:**
```
+--------------------------------------------------------------------+
| Schedule Account Handoff - MegaCorp                            [×] |
+--------------------------------------------------------------------+
| Account: MegaCorp Industries, Inc.                                 |
| Account Manager: Tom Anderson                                      |
| Deal Value: $90,000  |  Jobs: 4 open positions                     |
+--------------------------------------------------------------------+
| MEETING DETAILS                                                    |
|                                                                    |
| Meeting Type: [Account Handoff (Internal) ▼]                      |
|                                                                    |
| Attendees *                                                        |
| [×] Tom Anderson - Account Manager (required)                     |
| [×] Jessica Kim - Recruiting Manager (required)                   |
| [×] You (Sarah Johnson - Sales Rep)                               |
| [ ] Add: [Search users... ▼]                                      |
|                                                                    |
| Date & Time *                                                      |
| [Dec 5, 2024 📅]  [10:00 AM ▼]  Duration: [30 minutes ▼]          |
|                                                                    |
| Meeting Link                                                       |
| [●] Generate Zoom link automatically                              |
| [ ] In-person meeting                                             |
| [ ] Use custom link: [                                         ]  |
+--------------------------------------------------------------------+
| HANDOFF AGENDA (Auto-Generated)                                    |
+--------------------------------------------------------------------+
| 1. Client Overview (5 min)                                         |
|    • Company background, industry, size                            |
|    • Key stakeholders and org chart                                |
|    • Decision-making process                                       |
|                                                                    |
| 2. Contract Terms (5 min)                                          |
|    • MSA details, payment terms, guarantees                        |
|    • Special terms and value-adds                                  |
|    • Volume incentives and pricing                                 |
|                                                                    |
| 3. Client Relationship (10 min)                                    |
|    • Communication preferences and style                           |
|    • Pain points and what they value                               |
|    • Competitive landscape and positioning                         |
|                                                                    |
| 4. Job Orders & Execution (5 min)                                  |
|    • 4 open positions overview                                     |
|    • Priority and urgency                                          |
|    • Success criteria and KPIs                                     |
|                                                                    |
| 5. Next Steps (5 min)                                              |
|    • AM takes ownership (weekly check-ins)                         |
|    • Recruiter begins sourcing                                     |
|    • Client kickoff call scheduling                                |
|                                                                    |
| [Edit Agenda]                                                      |
+--------------------------------------------------------------------+
| HANDOFF MATERIALS (Auto-Attached)                                  |
+--------------------------------------------------------------------+
| Documents to Share:                                                |
| [×] Deal summary and close notes                                  |
| [×] Signed MSA and SOW                                            |
| [×] Client org chart (if available)                               |
| [×] BANT qualification notes                                      |
| [×] All call notes and email threads                              |
| [×] Competitive analysis                                          |
|                                                                    |
| [View All Materials] [Add Document]                                |
+--------------------------------------------------------------------+
| CALENDAR INVITATION                                                |
|                                                                    |
| Subject:                                                           |
| [Account Handoff: MegaCorp (Tom A., Jessica K.)                ]  |
|                                                                    |
| Calendar Note:                                                     |
| [Internal handoff meeting for MegaCorp account. Sarah to brief ]  |
| [Tom (AM) and Jessica (Recruiter) on client details, contract, ]  |
| [and job orders. All docs attached.                             ]  |
|                                                              ] 186/500|
+--------------------------------------------------------------------+
| [Cancel] [Schedule Meeting & Send Invites]                         |
+--------------------------------------------------------------------+
```

**User Action:** Click "Schedule Meeting & Send Invites"

**System Response:**
- Meeting created in calendar (Google/Outlook)
- Invites sent to attendees
- Zoom link generated
- All handoff materials attached to invite
- Activity logged: "Handoff meeting scheduled"
- Toast: "Handoff meeting scheduled for Dec 5 at 10:00 AM ✓"

---

### Step 7: Conduct Handoff Meeting

**Context:** Dec 5, 10:00 AM - Handoff meeting

**Meeting Flow:**

**Introduction (2 min):**
- Sarah: "Thanks for joining. MegaCorp deal closed yesterday, $90K annual. Here's what you need to know."

**Client Overview (5 min):**
- Company: MegaCorp Industries, 500 employees, SaaS
- Contact: Tom Wilson (VP Sales) - prefers email, very responsive
- Decision-makers: Tom (primary), Jessica Lee (Procurement for contracts)
- Communication style: Direct, focused on results, values quality over speed

**Contract Terms (5 min):**
- MSA: $90K annual, 4 placements @ $22.5K avg
- Payment: Net 30, invoiced bi-weekly
- Special terms:
  - 120-day replacement guarantee (extended from standard 90)
  - Dedicated AM with weekly check-ins
  - Volume incentive: 6+ placements → $21K rate
- Duration: 1 year, auto-renew

**Client Relationship (10 min):**
- Pain points:
  - Slow hiring (60+ days average)
  - Quality issues with other vendors
  - Need for senior talent (10+ years experience)
- What they value:
  - Quality over speed
  - Transparency and communication
  - Proactive problem-solving
- Competitors:
  - Evaluated TalentSource Pro ($88K offer) - we won on quality and value-adds
- Positioning:
  - Emphasize quality metrics, replacement guarantee, dedicated support

**Job Orders (5 min):**
- Jessica (Recruiter): 4 positions assigned
  1. Senior Backend Engineer (urgent - need by Jan 15)
  2. Senior Frontend Engineer (urgent - need by Jan 15)
  3. Product Manager (medium priority)
  4. DevOps Engineer (medium priority)
- Tech stack: Python, AWS, React
- Budget: $90-120/hr bill rate
- Jessica to begin sourcing today

**Next Steps (5 min):**
- Tom (AM):
  - Schedule client kickoff call with MegaCorp for next week
  - Set up weekly check-in cadence (Fridays preferred)
  - Send welcome email with contact info
- Jessica (Recruiter):
  - Begin sourcing for 2 urgent roles today
  - First candidates presented by Dec 15 (10 days)
- Sarah (Sales):
  - Available for questions, but account now owned by Tom
  - Will check in after first placement

**Meeting Ends:** All aligned, handoff complete ✓

**Time:** 30 minutes

---

### Step 8: Post-Handoff Activities

**User Action (Sarah):** Log handoff completion in system

**Screen State:**
```
+--------------------------------------------------------------------+
| Log Activity - MegaCorp Account                                [×] |
+--------------------------------------------------------------------+
| Activity Type: [Internal Meeting ▼]                               |
| Date: [Dec 5, 2024 ▼]  Time: [10:00 AM ▼]  Duration: [30 min]     |
+--------------------------------------------------------------------+
| Subject: Account handoff to Tom Anderson                           |
|                                                                    |
| Attendees:                                                         |
| • Tom Anderson (Account Manager)                                  |
| • Jessica Kim (Recruiter)                                         |
| • Sarah Johnson (Sales Rep - you)                                 |
|                                                                    |
| Notes:                                                             |
| [Completed account handoff for MegaCorp. Briefed Tom (AM) on   ]  |
| [client background, contract terms, relationship dynamics, and  ]  |
| [pain points. Reviewed 4 job orders with Jessica (Recruiter).  ]  |
| [                                                               ]  |
| [Tom will:                                                      ]  |
| [• Schedule client kickoff call next week                      ]  |
| [• Set up weekly check-ins (Fridays)                           ]  |
| [• Send welcome email                                          ]  |
| [                                                               ]  |
| [Jessica will:                                                  ]  |
| [• Begin sourcing for 2 urgent roles today                     ]  |
| [• Present first candidates by Dec 15                          ]  |
| [                                                               ]  |
| [Handoff complete. Account ownership transferred to Tom.       ]  |
|                                                             ] 548/1000|
|                                                                    |
| Outcome: [●] Successful  [ ] Needs follow-up                       |
+--------------------------------------------------------------------+
| ACCOUNT UPDATE                                                     |
|                                                                    |
| Account Status: [Active ▼] (Keep)                                 |
| Account Manager: [Tom Anderson ▼] ✓ Confirmed                     |
|                                                                    |
| Sales Rep Role Going Forward:                                      |
| [●] Monitor only (AM owns relationship)                           |
| [ ] Co-manage with AM                                             |
| [ ] Stay involved actively                                        |
+--------------------------------------------------------------------+
| [Cancel] [Save Activity]                                           |
+--------------------------------------------------------------------+
```

**User Action:** Click "Save Activity"

**System Response:**
- Activity logged
- Account handoff marked complete
- Sarah's role: Monitor only
- Tom Anderson confirmed as primary owner
- Toast: "Account handoff logged successfully ✓"

**Time:** 5 minutes

---

## Success Metrics & Celebration

### Step 9: Review Deal Success

**User Action:** Navigate to personal dashboard

**Screen State (Dashboard - Updated):**
```
+--------------------------------------------------------------------+
| Sales Dashboard - December Summary                  [Cmd+K] [Twin] |
+--------------------------------------------------------------------+
| Great work this month, Sarah! 🎉                                   |
+--------------------------------------------------------------------+
| DECEMBER PERFORMANCE                                               |
+--------------------------------------------------------------------+
| Deals Closed: 2 (MegaCorp $90K, TechStart $280K)                  |
| Total Revenue: $370,000                                            |
| Quota Attainment: 185% (Quota: $200K) 🏆                           |
| Commission Earned: $47,100                                         |
| New Logos: 2 clients                                               |
+--------------------------------------------------------------------+
| QUARTERLY PERFORMANCE (Q4 2024)                                    |
+--------------------------------------------------------------------+
| Quota: $200,000                                                    |
| Closed: $484,000                                                   |
| Attainment: 242% 🏆🏆🏆                                             |
| Deals Won: 6                                                       |
| Win Rate: 67% (6 won, 3 lost)                                     |
| Avg Deal Size: $80,667                                            |
| Avg Sales Cycle: 42 days                                          |
+--------------------------------------------------------------------+
| COMMISSION SUMMARY (Q4)                                            |
+--------------------------------------------------------------------+
| Total Earnings: $68,400                                            |
| • Base Commission: $58,080 (12% avg rate)                         |
| • New Logo Bonuses: $10,320 (6 × $1,720 avg)                      |
|                                                                    |
| Payment Schedule:                                                  |
| • October: $18,200 (paid)                                         |
| • November: $25,100 (paid)                                        |
| • December: $25,100 (pending first invoices)                      |
+--------------------------------------------------------------------+
| LEADERBOARD (Company-Wide)                                         |
+--------------------------------------------------------------------+
| 1. Sarah Johnson (you)    242% quota  $484K  6 deals ⭐⭐⭐       |
| 2. Mike Peterson          215% quota  $430K  5 deals              |
| 3. Lisa Chen              198% quota  $396K  7 deals              |
| 4. Robert Kim             156% quota  $312K  4 deals              |
| 5. Jessica Martinez       142% quota  $284K  3 deals              |
+--------------------------------------------------------------------+
| 🏆 ACHIEVEMENTS UNLOCKED                                           |
+--------------------------------------------------------------------+
| • President's Club (200%+ quota) 🏆                                |
| • Top Performer (Q4) 🥇                                            |
| • Fast Closer (avg 42 days vs 55 company avg) ⚡                  |
| • Quality Wins (67% win rate vs 45% company avg) ✓                |
+--------------------------------------------------------------------+
```

**Time:** 2 minutes (celebrate!)

---

## Postconditions

### After Deal Close and Handoff

1. ✅ Deal marked as closed-won
2. ✅ Contract fully executed (MSA signed by all parties)
3. ✅ Account status updated to "active"
4. ✅ Account Manager assigned and briefed
5. ✅ Jobs created and assigned to recruiters
6. ✅ Handoff meeting completed
7. ✅ All deal notes and context documented
8. ✅ Commission calculated and tracked
9. ✅ Client relationship transitioned smoothly
10. ✅ Sales rep available for questions, but not primary owner

---

## Events Logged

| Event | Payload |
|-------|---------|
| `deal.negotiation_complete` | `{ deal_id, final_value, terms_agreed }` |
| `contract.generated` | `{ deal_id, contract_type, documents }` |
| `contract.sent_for_signature` | `{ deal_id, recipient, signature_method }` |
| `contract.signed` | `{ deal_id, signatory, timestamp }` |
| `contract.fully_executed` | `{ deal_id, final_execution_date }` |
| `deal.closed_won` | `{ deal_id, value, close_date, jobs_created }` |
| `account.activated` | `{ account_id, contract_start_date }` |
| `account.handed_off` | `{ account_id, from_user, to_user }` |
| `commission.calculated` | `{ user_id, deal_id, amount }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Signature | Tried to close without full execution | "Contract not fully signed. Cannot close deal." | Wait for all signatures |
| Unauthorized Discount | Discount exceeds authority | "Discount requires manager approval (>10%)" | Request approval or adjust |
| Invalid Close Date | Future close date | "Close date cannot be in the future" | Use today or past date |
| Missing Documents | No MSA attached | "Please attach signed MSA to close deal" | Upload documents |
| Account Manager Not Assigned | No handoff recipient | "Please assign Account Manager before closing" | Select AM |
| Jobs Creation Failed | Invalid job data | "Failed to create job orders. Please try again." | Retry or create manually |

---

## Best Practices

### Do's

✅ **Do** respond quickly to contract questions (within 4 hours)
✅ **Do** set realistic close dates (don't over-promise)
✅ **Do** document all negotiation points in deal notes
✅ **Do** schedule handoff meeting before close (prep AM)
✅ **Do** celebrate wins with team (share success)
✅ **Do** follow up with AM after first placement
✅ **Do** analyze win/loss reasons for learning

### Don'ts

❌ **Don't** over-discount to close faster (protect margin)
❌ **Don't** skip legal review for standard MSA changes
❌ **Don't** hand off account without proper briefing
❌ **Don't** forget to attach signed contracts to deal
❌ **Don't** promise delivery timelines without checking with recruiters
❌ **Don't** lose touch with client after handoff (check in occasionally)

---

## Related Use Cases

- [03-manage-deals.md](./03-manage-deals.md) - Managing deals through pipeline
- [02-manage-leads.md](./02-manage-leads.md) - Qualifying leads before deals
- [01-daily-workflow.md](./01-daily-workflow.md) - Close activities in daily context

---

*Last Updated: 2024-11-30*
