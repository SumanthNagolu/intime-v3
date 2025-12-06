# Use Case: Handle Extension

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-G06 |
| Actor | Recruiter |
| Goal | Process contract extensions for placements approaching end date |
| Frequency | 2-4 times per month |
| Estimated Time | 15-30 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. Active placement exists approaching end date
3. Client interested in extending contract
4. Contractor interested in continuing

---

## Trigger

- Contract end date within 30 days
- Client requests extension
- Contractor expresses interest in continuing
- System alert: "Contract ending soon"

---

## Main Flow

### Step 1: Review Expiring Placements

**User Action:** Navigate to placements, filter "Ending Soon"

**Screen State:**
```
+----------------------------------------------------------+
| PLACEMENTS                          [+ New Placement]     |
+----------------------------------------------------------+
| [Active] [Ending Soon ●] [Extended] [Completed]          |
+----------------------------------------------------------+
|                                                           |
| CONTRACTS ENDING SOON (Within 30 days)                    |
| ┌────────────────────────────────────────────────────┐  |
| │ Contractor     Client       End Date    Days Left  │  |
| │ ─────────────────────────────────────────────────  │  |
| │ 🟡 Jane Doe    TechStart    Jan 6, 2026    32     │  |
| │ 🔴 Alex R.     Google       Dec 31, 2025   9      │  |
| │ 🟡 Maria G.    Meta         Jan 15, 2026   44     │  |
| │                                                     │  |
| │ 🔴 = Urgent (<14 days)  🟡 = Upcoming (14-45 days)│  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

---

### Step 2: Initiate Extension Process

**User Action:** Click on placement, then "Request Extension"

**Screen State:**
```
+----------------------------------------------------------+
|                    Contract Extension                 [×] |
+----------------------------------------------------------+
| Placement: Alex Rodriguez @ Google                        |
| Current End: Dec 31, 2025 (9 days remaining)             |
+----------------------------------------------------------+
|                                                           |
| CURRENT CONTRACT                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Start Date:      Jul 1, 2025                       │  |
| │ End Date:        Dec 31, 2025                      │  |
| │ Duration:        6 months                          │  |
| │ Bill Rate:       $150/hr                           │  |
| │ Pay Rate:        $120/hr                           │  |
| │ Margin:          20%                               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| EXTENSION DETAILS                                         |
|                                                           |
| Extension Type *                                          |
| ○ Same terms (No rate change)                            |
| ○ Rate adjustment (Negotiate new rate)                   |
| ○ Conversion to permanent (Direct hire)                  |
|                                                           |
| New End Date *                                            |
| [06/30/2026                                     📅]      |
| Extension Duration: 6 months                              |
|                                                           |
| RATE ADJUSTMENT (If applicable)                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Current Bill Rate:  $150/hr                        │  |
| │ Proposed Bill Rate: [$155    ] /hr  (+3.3%)       │  |
| │                                                     │  |
| │ Current Pay Rate:   $120/hr                        │  |
| │ Proposed Pay Rate:  [$124    ] /hr  (+3.3%)       │  |
| │                                                     │  |
| │ New Margin: $31/hr (20%) ✅                        │  |
| │                                                     │  |
| │ Note: 3-5% annual increase is market standard      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| APPROVALS REQUIRED                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ ☐ Client approval (Sarah Chen @ Google)            │  |
| │ ☐ Contractor agreement (Alex Rodriguez)           │  |
| │ ☐ Pod Manager sign-off (if rate change)           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| COMMISSION IMPACT                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Current Monthly: $1,260 (at $150 × 168 × 5%)      │  |
| │ New Monthly:     $1,302 (at $155 × 168 × 5%)      │  |
| │ 6-Month Total:   $7,812 additional commission     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
|     [Cancel]  [Save Draft]  [Send Extension Request ✓]   |
+----------------------------------------------------------+
```

---

### Step 3: Send Extension Request

**User Action:** Complete details, click "Send Extension Request ✓"

**System Response:**
1. Extension request created
2. Email sent to client for approval
3. Email sent to contractor for agreement
4. Reminder tasks created

---

### Step 4: Process Approvals

**User Action:** Track approvals as they come in

**Screen State:**
```
+----------------------------------------------------------+
|                  Extension Status                         |
+----------------------------------------------------------+
| Alex Rodriguez @ Google - Extension Request               |
+----------------------------------------------------------+
|                                                           |
| APPROVAL STATUS                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ ✅ Client Approved - Dec 23, 2025                  │  |
| │    Sarah Chen: "Approved, we want to keep Alex"   │  |
| │                                                     │  |
| │ ✅ Contractor Agreed - Dec 24, 2025                │  |
| │    Alex: "Happy to continue, rate works for me"   │  |
| │                                                     │  |
| │ ⏳ Pod Manager Sign-off - Pending                  │  |
| │    [Send Reminder]                                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Once all approved: [Finalize Extension ✓]                |
|                                                           |
+----------------------------------------------------------+
```

---

### Step 5: Finalize Extension

**User Action:** All approvals received, click "Finalize Extension ✓"

**System Response:**
1. Placement end date updated
2. New rate applied
3. Contract amendment generated (if needed)
4. Notifications sent to all parties
5. Commission continues accruing

---

## Postconditions

1. ✅ Contract extended
2. ✅ New end date set
3. ✅ Rate adjustment applied (if any)
4. ✅ All parties notified
5. ✅ Commission continues

---

## Extension Types

| Type | Description | Rate Change |
|------|-------------|-------------|
| Same terms | Extend as-is | No |
| Rate adjustment | Market rate increase | Yes (3-5% typical) |
| Conversion | Become permanent | Direct hire fee applies |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `placement.extension_requested` | `{ placement_id, new_end_date, rate_change }` |
| `placement.extended` | `{ placement_id, duration, new_rate }` |

---

## Related Use Cases

- [G04-manage-placement.md](./G04-manage-placement.md) - Ongoing management
- [G07-handle-early-termination.md](./G07-handle-early-termination.md) - If not extended

---

*Last Updated: 2025-12-05*

