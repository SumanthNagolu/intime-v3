# Use Case: Close Deal

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-B05 |
| Actor | Recruiter (Business Development Role) |
| Goal | Record deal closure outcome (won or lost) and convert won deals to active accounts |
| Frequency | 2-4 times per week |
| Estimated Time | 5-15 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "deal.update" permission
3. Deal exists in final stages (Negotiation or Verbal Commit)
4. For Won: MSA or contract signed by client
5. For Lost: Final decision received from prospect

---

## Trigger

One of the following:
- Client signs MSA/contract (Won)
- Client verbally commits and paperwork complete (Won)
- Prospect declines to proceed (Lost)
- Prospect goes with competitor (Lost)
- Prospect's budget eliminated (Lost)
- Deal stale with no response for extended period (Lost)

---

## Main Flow: Close Deal as Won

### Step 1: Navigate to Deal and Initiate Close

**User Action:** Click "Close Deal" from deal detail or move to "Closed Won" stage

**System Response:**
- Close deal wizard opens
- Pre-selects "Won" based on verbal commit stage

**Screen State:**
```
+----------------------------------------------------------+
|                                    Close Deal         [×] |
+----------------------------------------------------------+
|                                                           |
| Closing: TechStart Inc - Q1 Engineering Hiring           |
| Current Stage: Verbal Commit                              |
| Deal Value: $75,000                                       |
|                                                           |
+----------------------------------------------------------+
|                                                           |
| DEAL OUTCOME *                                            |
|                                                           |
| ○ 🎉 CLOSED WON - We won the deal!                       |
|   Client has signed contract and is ready to proceed     |
|                                                           |
| ○ ❌ CLOSED LOST - Deal did not close                    |
|   Client decided not to proceed                          |
|                                                           |
+----------------------------------------------------------+
|                [Cancel]  [Next: Close Details →]         |
+----------------------------------------------------------+
```

**User Action:** Select "Closed Won", click "Next"

**Time:** ~10 seconds

---

### Step 2: Enter Won Deal Details

**System Response:**
- Won deal details form displayed
- Contract information fields shown

**Screen State:**
```
+----------------------------------------------------------+
|                                    Close Deal - Won   [×] |
+----------------------------------------------------------+
|                                                           |
| 🎉 CONGRATULATIONS! You're closing a deal!               |
|                                                           |
| CONTRACT DETAILS                                          |
|                                                           |
| Contract/MSA Signed Date *                                |
| [12/20/2025                                     📅]      |
|                                                           |
| Contract Start Date *                                     |
| [01/06/2026                                     📅]      |
|                                                           |
| Contract Duration                                         |
| [12   ] months □ Open-ended / Evergreen                  |
|                                                           |
| Contract Type *                                           |
| ○ Master Service Agreement (MSA)                         |
| ○ Statement of Work (SOW)                                |
| ○ Purchase Order (PO)                                    |
| ○ Email Confirmation (Informal)                          |
|                                                           |
| FINAL DEAL VALUE                                          |
|                                                           |
| Original Value: $75,000                                   |
|                                                           |
| Final Contracted Value *                                  |
| [$75,000.00        ] USD                                 |
|                                                           |
| Value Change Reason (if different)                        |
| [No change - original scope confirmed            ]       |
|                                                           |
| BILLING INFORMATION                                       |
|                                                           |
| Payment Terms *                                           |
| [Net 30                                        ▼]        |
|                                                           |
| Billing Frequency *                                       |
| ○ Weekly    ○ Bi-weekly    ○ Monthly                    |
|                                                           |
| Billing Contact                                           |
| Name:  [Jennifer Adams                          ]        |
| Email: [jennifer.adams@techstart.io             ]        |
| Phone: [(415) 555-0199                          ]        |
|                                                           |
| SERVICES CONFIRMED                                        |
|                                                           |
| ☑ Contract Staffing                                      |
| ☐ Contract-to-Hire                                       |
| ☐ Direct Hire                                            |
|                                                           |
| CONFIRMED ROLES                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Role 1: Senior Backend Engineer                    │  |
| │ Quantity: [2  ] | Bill Rate: [$110.00] /hr        │  |
| │ Pay Rate: [$88.00] /hr | Margin: 20%               │  |
| │                                                     │  |
| │ Role 2: Senior Frontend Engineer                   │  |
| │ Quantity: [1  ] | Bill Rate: [$105.00] /hr        │  |
| │ Pay Rate: [$84.00] /hr | Margin: 20%               │  |
| │                                                [×] │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| WIN ANALYSIS                                              |
|                                                           |
| Primary Win Reason *                                      |
| [Industry expertise and speed                  ▼]        |
|   - Price / Value                                        |
|   - Industry expertise and speed                         |
|   - Relationship / Trust                                 |
|   - Candidate quality                                    |
|   - Response time / Availability                         |
|   - Other (specify)                                      |
|                                                           |
| Win Details                                               |
| [Sarah mentioned our FinTech specialization and the     |
|  quality of candidates we showed during the discovery   |
|  phase were key factors. Speed to present qualified     |
|  candidates was also important to them.             ]   |
|                                                           |
| Competitive Situation                                     |
| Did you compete with other vendors?                      |
| ○ Yes, we beat [2  ] competitors                        |
| ○ No competition (sole source)                          |
| ○ Unknown                                                |
|                                                           |
| Key Competitors Beaten                                    |
| [TechStaff, HireRight                           ]        |
|                                                           |
| DOCUMENTS                                                 |
|                                                           |
| Upload Signed Contract/MSA                                |
| [📎 Upload file...] or drag and drop                     |
| TechStart_MSA_Signed_Dec2025.pdf ✓ Uploaded              |
|                                                           |
+----------------------------------------------------------+
|          [← Back]  [Cancel]  [Next: Create Account →]   |
+----------------------------------------------------------+
```

**Field Specification: Win Reason**
| Property | Value |
|----------|-------|
| Field Name | `winReason` |
| Type | Dropdown |
| Required | Yes |
| Options | price_value, expertise_speed, relationship_trust, candidate_quality, response_time, other |
| Purpose | Win/loss analysis for process improvement |

**Time:** ~3-5 minutes

---

### Step 3: Create Account from Won Deal

**User Action:** Click "Next: Create Account →"

**System Response:**
- Account creation form pre-filled from deal data
- Option to create account or link to existing

**Screen State:**
```
+----------------------------------------------------------+
|                              Close Deal - Create Account [×]|
+----------------------------------------------------------+
|                                                           |
| ACCOUNT SETUP                                             |
|                                                           |
| ○ Create New Account (Recommended for new clients)       |
| ○ Link to Existing Account (For expansion deals)         |
|                                                           |
| NEW ACCOUNT DETAILS (Pre-filled from Deal)                |
|                                                           |
| Account Name *                                            |
| [TechStart Inc                                  ]        |
|                                                           |
| Account Type *                                            |
| ○ Direct Client                                          |
| ○ Agency Partner                                         |
| ○ VMS/MSP Client                                         |
|                                                           |
| Industry *                                                |
| [Financial Technology (FinTech)              ▼]          |
|                                                           |
| Company Size *                                            |
| [101-200 employees                           ▼]          |
|                                                           |
| Headquarters                                              |
| [San Francisco, CA, USA                         ]        |
|                                                           |
| Website                                                   |
| [https://techstart.io                           ]        |
|                                                           |
| PRIMARY CONTACT (Account Manager Contact)                 |
|                                                           |
| ☑ Use deal champion as primary contact                   |
|                                                           |
| Name: Sarah Chen                                          |
| Title: VP of Engineering                                  |
| Email: sarah.chen@techstart.io                           |
| Phone: (415) 555-0123                                     |
|                                                           |
| BILLING CONTACT (From previous step)                      |
|                                                           |
| Name: Jennifer Adams                                      |
| Title: [Finance Manager                         ]        |
| Email: jennifer.adams@techstart.io                       |
| Phone: (415) 555-0199                                     |
|                                                           |
| ACCOUNT OWNERSHIP                                         |
|                                                           |
| Account Owner *                                           |
| [John Smith (You)                            ▼]          |
|                                                           |
| Pod Manager *                                             |
| [Sarah Johnson (Auto-assigned)               ▼]          |
|                                                           |
| RACI ASSIGNMENTS (Auto-generated)                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Responsible: John Smith (Recruiter)                │  |
| │ Accountable: Sarah Johnson (Pod Manager)           │  |
| │ Consulted:   Finance Team                          │  |
| │ Informed:    COO, Regional Director                │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| INITIAL JOBS                                              |
|                                                           |
| Create jobs from confirmed roles?                         |
| ☑ Yes, create [2  ] job requisitions now                |
|                                                           |
| Jobs to Create:                                           |
| ☑ Senior Backend Engineer (2 positions)                  |
| ☑ Senior Frontend Engineer (1 position)                  |
|                                                           |
| WELCOME PACKAGE                                           |
|                                                           |
| ☑ Send welcome email to primary contact                  |
| ☑ Schedule kickoff call (suggest times)                  |
| ☑ Share candidate submission portal access               |
|                                                           |
+----------------------------------------------------------+
|       [← Back]  [Cancel]  [Close Deal & Create Account ✓]|
+----------------------------------------------------------+
```

**Time:** ~2-3 minutes

---

### Step 4: Complete Deal Closure

**User Action:** Click "Close Deal & Create Account ✓"

**System Response:**

1. **Deal record updated** (~100ms)
   ```sql
   UPDATE deals
   SET stage = 'closed_won',
       closed_at = NOW(),
       closed_reason = 'Won',
       final_value = 75000,
       win_reason = 'expertise_speed',
       contract_signed_date = '2025-12-20',
       contract_start_date = '2026-01-06',
       contract_duration_months = 12
   WHERE id = deal_id;
   ```

2. **Account created** (~100ms)
   ```sql
   INSERT INTO accounts (
     id, org_id, name, account_type,
     industry, company_size, headquarters, website,
     owner_id, pod_manager_id,
     msa_signed_date, payment_terms, billing_frequency,
     created_from_deal_id, created_by, created_at
   ) VALUES (...);
   ```

3. **Contacts created** (~100ms)
   - Primary contact linked to account
   - Billing contact linked to account

4. **Jobs created** (~200ms)
   - Senior Backend Engineer (2 positions)
   - Senior Frontend Engineer (1 position)

5. **Commission triggered** (~100ms)
   - Commission record created
   - Pending activation on first placement

6. **Notifications sent** (~1 second)
   - Pod Manager: "🎉 Deal Won: TechStart Inc - $75,000"
   - COO: "New Account: TechStart Inc"
   - Finance: "New Account Setup Required"
   - Welcome email to Sarah Chen

7. **On Success:**
   - Modal closes with celebration animation 🎉
   - Toast: "Congratulations! Deal closed and TechStart Inc account created!"
   - Redirects to new account detail page

**Screen State (Success):**
```
+----------------------------------------------------------+
|                    🎉 DEAL CLOSED SUCCESSFULLY!           |
+----------------------------------------------------------+
|                                                           |
| TechStart Inc - Q1 Engineering Hiring                    |
| Deal Value: $75,000                                       |
|                                                           |
| ✅ Deal marked as Closed Won                             |
| ✅ Account created: TechStart Inc                        |
| ✅ 2 contacts added                                      |
| ✅ 2 jobs created (3 positions total)                    |
| ✅ Welcome email sent to Sarah Chen                      |
| ✅ Notifications sent to team                            |
|                                                           |
| COMMISSION SUMMARY                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ Deal Value: $75,000                                │  |
| │ Projected Gross Margin: $15,000                    │  |
| │ Your Commission (5%): $750/month                   │  |
| │ Annual Commission: $9,000                          │  |
| │                                                     │  |
| │ Status: Pending (activates on first placement)     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NEXT STEPS                                                |
| 1. Review created jobs and adjust requirements           |
| 2. Schedule kickoff call with Sarah Chen                 |
| 3. Begin candidate sourcing                              |
|                                                           |
| [Go to Account]  [View Jobs]  [Back to Pipeline]        |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~3-5 seconds

---

## Alternative Flow: Close Deal as Lost

### Step 1: Select Lost Outcome

**User Action:** Select "Closed Lost" in outcome selection

**System Response:**
- Lost deal form displayed
- Loss reason options shown

**Screen State:**
```
+----------------------------------------------------------+
|                                   Close Deal - Lost   [×] |
+----------------------------------------------------------+
|                                                           |
| Closing: DataFlow Systems - Enterprise Support           |
| Deal Value: $48,000                                       |
|                                                           |
| LOSS DETAILS                                              |
|                                                           |
| Loss Reason *                                             |
| [Lost to competitor                            ▼]        |
|   - Lost to competitor                                   |
|   - Budget eliminated / No budget                        |
|   - Project cancelled / Postponed                        |
|   - Decided to hire internally                           |
|   - No decision / Went dark                              |
|   - Price too high                                       |
|   - Requirements changed                                 |
|   - Other (specify)                                      |
|                                                           |
| Loss Details *                                            |
| [Client went with TechStaff who offered lower rates.    |
|  They were willing to accept a 15% margin vs our 20%.   |
|  Client prioritized cost over quality despite our       |
|  better candidate track record.                    ]    |
|                                                           |
| COMPETITOR ANALYSIS (If lost to competitor)              |
|                                                           |
| Winning Competitor                                        |
| [TechStaff Inc                                  ]        |
|                                                           |
| Why Did They Win? *                                       |
| ☑ Lower price / rates                                    |
| ☐ Existing relationship                                  |
| ☐ Better candidate quality                               |
| ☐ Faster response time                                   |
| ☐ Better terms / flexibility                             |
| ☐ Unknown                                                |
|                                                           |
| Price Difference (if known)                               |
| They offered: [$90.00   ] /hr vs our [$110.00] /hr      |
| Difference: -18% lower                                    |
|                                                           |
| FUTURE POTENTIAL                                          |
|                                                           |
| Could this become a future opportunity?                   |
| ○ Yes, likely (Keep warm)                                |
| ○ Maybe, uncertain                                       |
| ○ No, unlikely to reconsider                             |
|                                                           |
| Re-engagement Timeline                                    |
| [6     ] months - Add reminder to re-engage              |
|                                                           |
| LESSONS LEARNED                                           |
|                                                           |
| What could we have done differently?                      |
| [Could have been more flexible on rates for this deal.  |
|  They were clearly price-sensitive from the start.      |
|  Should have qualified budget constraints earlier.  ]   |
|                                                           |
| Share learnings with team?                                |
| ☑ Yes, add to team knowledge base                       |
|                                                           |
+----------------------------------------------------------+
|            [← Back]  [Cancel]  [Close as Lost ✓]        |
+----------------------------------------------------------+
```

**User Action:** Complete loss details, click "Close as Lost ✓"

**System Response:**

1. **Deal record updated**
   ```sql
   UPDATE deals
   SET stage = 'closed_lost',
       closed_at = NOW(),
       closed_reason = 'Lost to competitor',
       loss_reason_category = 'competitor',
       loss_details = '...',
       competitor_won = 'TechStaff Inc',
       competitor_price = 90.00,
       future_potential = 'maybe',
       reengagement_date = '2026-06-21',
       lessons_learned = '...'
   WHERE id = deal_id;
   ```

2. **Lead reactivated for future** (~50ms)
   - Lead status → "nurture"
   - Re-engagement task created

3. **Learning shared** (~100ms)
   - Team notification with lessons learned
   - Added to loss analysis database

4. **On Success:**
   - Toast: "Deal closed as lost. Re-engagement reminder set for June 2026."
   - Returns to pipeline view

**Time:** ~2 seconds

---

## Postconditions

### For Closed Won:
1. ✅ Deal status = closed_won
2. ✅ Account created and active
3. ✅ Contacts linked to account
4. ✅ Jobs created from deal roles
5. ✅ Commission record created
6. ✅ Welcome email sent
7. ✅ RACI assignments created
8. ✅ All stakeholders notified

### For Closed Lost:
1. ✅ Deal status = closed_lost
2. ✅ Loss reason documented
3. ✅ Competitive analysis recorded
4. ✅ Re-engagement task created (if applicable)
5. ✅ Lessons learned shared with team
6. ✅ Pipeline metrics updated

---

## Events Logged

| Event | Payload |
|-------|---------|
| `deal.closed_won` | `{ deal_id, value, account_id, win_reason, closed_by }` |
| `deal.closed_lost` | `{ deal_id, value, loss_reason, competitor, closed_by }` |
| `account.created` | `{ account_id, deal_id, name, owner_id }` |
| `job.created` | `{ job_id, account_id, deal_id, title, positions }` |
| `commission.created` | `{ recruiter_id, deal_id, projected_amount }` |

---

## Win/Loss Reasons Reference

### Win Reasons
| Reason | Description |
|--------|-------------|
| Price / Value | Competitive pricing or value proposition |
| Expertise | Industry or technical specialization |
| Relationship | Trust built through sales process |
| Candidate Quality | Quality of presented candidates |
| Response Time | Speed and availability |

### Loss Reasons
| Reason | Description |
|--------|-------------|
| Lost to Competitor | Another vendor won |
| No Budget | Budget eliminated or insufficient |
| Project Cancelled | Initiative postponed or cancelled |
| Hired Internally | Decided to recruit in-house |
| Went Dark | No response, couldn't reach decision |
| Price Too High | Our rates exceeded budget |

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Close deal as won | Account created, jobs created |
| TC-002 | Close deal as lost to competitor | Competitor analysis saved |
| TC-003 | Close won with different final value | Value change recorded |
| TC-004 | Upload signed contract | Document attached to deal |
| TC-005 | Create jobs from deal roles | Jobs created with correct specs |
| TC-006 | Send welcome email | Email sent to primary contact |
| TC-007 | Set re-engagement for lost deal | Task created for future date |
| TC-008 | Share lessons learned | Team notified |

---

## Related Use Cases

- [B03-create-deal.md](./B03-create-deal.md) - Deal creation
- [B04-manage-deal-pipeline.md](./B04-manage-deal-pipeline.md) - Pipeline management
- [C01-create-account.md](./C01-create-account.md) - Account creation
- [C02-onboard-account.md](./C02-onboard-account.md) - Account onboarding
- [D01-create-job.md](./D01-create-job.md) - Job creation

---

*Last Updated: 2025-12-05*

