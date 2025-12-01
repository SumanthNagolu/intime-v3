# Use Case: Submit Expense Report

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EMP-004 |
| Actor | Any Employee (All internal staff) |
| Goal | Submit expense reports for reimbursement |
| Frequency | Weekly or as expenses occur |
| Estimated Time | 5-15 minutes per report |
| Priority | High |

---

## Preconditions

1. User is logged in as Employee
2. User has active employment status
3. User has valid direct deposit or payment method on file
4. Company expense policy is accessible
5. Receipt storage service is available (Supabase Storage)

---

## Trigger

One of the following:
- Incurred business expense requiring reimbursement
- Travel completed with out-of-pocket costs
- Monthly expense report deadline approaching
- Receipt received for business purchase
- Conference or training attendance with expenses
- Client entertainment or meals
- Software or subscription renewal
- Office supplies or equipment purchase

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Expenses

**User Action:** Click "Expenses" in the sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/expenses`
- Expenses dashboard loads
- Loading skeleton shows for 200-500ms
- Expenses list populates with user's expense reports

**Screen State:**
```
+----------------------------------------------------------+
| Expenses                      [+ New Expense] [?] [Cmd+K] |
+----------------------------------------------------------+
| [Search expenses...]                  [Filter ▼] [Sort ▼] |
+----------------------------------------------------------+
| ● Draft │ ○ Pending │ ○ Approved │ ○ Paid │ ○ All        |
+----------------------------------------------------------+
| Status  Date       Description          Amount   Approval |
| ─────────────────────────────────────────────────────────|
| 🟡 Pend Nov 25     Conference Travel     $1,247  Manager  |
| 🟢 Appr Nov 20     Client Lunch          $85     Approved |
| 💰 Paid Nov 15     Software License      $49     Paid     |
| 📝 Draft Nov 28   Office Supplies       $127    Draft    |
+----------------------------------------------------------+
| YTD Submitted: $12,450 │ YTD Approved: $11,890           |
| Pending Reimbursement: $1,332                            |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "New Expense" Button

**User Action:** Click the "+ New Expense" button in top-right corner

**System Response:**
- Button shows click state
- Modal slides in from right (300ms animation)
- Modal title: "Submit New Expense"
- First field (Expense Type) is focused

**Screen State:**
```
+----------------------------------------------------------+
|                                    Submit New Expense [×] |
+----------------------------------------------------------+
| Step 1 of 3: Expense Details                              |
|                                                           |
| Expense Type *                                            |
| [Select expense category...                           ▼]  |
|                                                           |
| Options:                                                  |
| 💼 Travel - Flights, hotels, rental cars                 |
| 🍽️  Meals & Entertainment - Client meals, team events    |
| 💻 Software & Subscriptions - Tools, licenses            |
| 📦 Office Supplies - Equipment, materials                |
| 🎓 Conference & Training - Registration, materials       |
| 🚗 Mileage - Vehicle usage for business                  |
| 📱 Communications - Phone, internet bills                |
| 🏢 Other - Miscellaneous business expenses               |
|                                                           |
+----------------------------------------------------------+
|                                      [Cancel]  [Continue →]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Select Expense Category

**User Action:** Click "Expense Type" dropdown, select "Travel"

**System Response:**
- Dropdown closes
- Field shows selected type with icon: "💼 Travel"
- "Continue" button becomes enabled
- Policy limits badge appears: "Max: $2,000/trip"

**Field Specification: Expense Type**
| Property | Value |
|----------|-------|
| Field Name | `expenseCategory` |
| Type | Dropdown (Select) |
| Label | "Expense Type" |
| Required | Yes |
| Options | |
| - `travel` | "Travel" (Flights, hotels, rental cars) |
| - `meals` | "Meals & Entertainment" (Client meals, team events) |
| - `software` | "Software & Subscriptions" (Tools, licenses) |
| - `office_supplies` | "Office Supplies" (Equipment, materials) |
| - `conference` | "Conference & Training" (Registration, materials) |
| - `mileage` | "Mileage" (Vehicle usage for business) |
| - `communications` | "Communications" (Phone, internet) |
| - `other` | "Other" (Miscellaneous) |
| Policy Limits | Displayed per category |

**Time:** ~2 seconds

---

### Step 4: Click Continue to Details

**User Action:** Click "Continue →" button

**System Response:**
- Validates Step 1
- Slides to Step 2
- Shows expense details form
- Form fields specific to selected category

**Screen State (Step 2 - Travel Details):**
```
+----------------------------------------------------------+
|                                    Submit New Expense [×] |
+----------------------------------------------------------+
| Step 2 of 3: Expense Information                          |
|                                                           |
| 💼 Travel Expense                    Policy Limit: $2,000 |
|                                                           |
| Date of Expense *                                         |
| [MM/DD/YYYY                                     📅]       |
|                                                           |
| Merchant/Vendor *                                         |
| [e.g., United Airlines, Marriott                      ]   |
|                                                           |
| Description *                                             |
| [e.g., Flight to client meeting in NYC                ]   |
| [                                               ] 0/200   |
|                                                           |
| Amount *                                                  |
| Currency: [USD                                        ▼]  |
| Amount:   [$                                          ]   |
|                                                           |
| Business Purpose *                                        |
| [Explain business justification...                    ]   |
| [                                               ] 0/500   |
|                                                           |
| Project/Client (if applicable)                            |
| [Search projects or clients...                        ]   |
|                                                           |
| Receipt Attachment                                        |
| [                                                      ]  |
| [           Drag & Drop Receipt Here                  ]  |
| [              or Click to Browse                     ]  |
| [         Required for amounts > $25                  ]  |
| [         Supports: PDF, JPG, PNG (10MB max)          ]  |
|                                                           |
| Billable to Client?                                       |
| ○ Yes - Will create billable charge                      |
| ● No  - Internal company expense                         |
|                                                           |
+----------------------------------------------------------+
|               [← Back]  [Cancel]  [Next: Review →]       |
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 5: Enter Expense Date

**User Action:** Click date picker, select date (e.g., November 25, 2024)

**System Response:**
- Date picker opens
- User navigates to correct month
- Clicks on date
- Date picker closes
- Field shows formatted date
- If date > 90 days ago, shows warning: "⚠️ Expense older than 90 days requires manager approval"

**Field Specification: Expense Date**
| Property | Value |
|----------|-------|
| Field Name | `expenseDate` |
| Type | Date Picker |
| Label | "Date of Expense" |
| Format | MM/DD/YYYY |
| Required | Yes |
| Min Date | 1 year ago |
| Max Date | Today |
| Warning Threshold | 90 days (requires justification) |
| Error Messages | |
| - Empty | "Expense date is required" |
| - Future date | "Expense date cannot be in the future" |
| - Too old | "Expenses older than 1 year cannot be submitted" |

**Time:** ~5 seconds

---

### Step 6: Enter Merchant/Vendor

**User Action:** Type merchant name, e.g., "United Airlines"

**System Response:**
- Characters appear in input field
- Autocomplete suggests previously used vendors
- Shows vendor logo/icon if recognized

**Field Specification: Merchant/Vendor**
| Property | Value |
|----------|-------|
| Field Name | `merchantName` |
| Type | Text Input with Autocomplete |
| Label | "Merchant/Vendor" |
| Placeholder | "e.g., United Airlines, Marriott" |
| Required | Yes |
| Max Length | 100 characters |
| Autocomplete | Previous merchants (last 50 used) |
| Error Messages | |
| - Empty | "Merchant name is required" |

**Time:** ~5 seconds

---

### Step 7: Enter Description

**User Action:** Type description, e.g., "Flight to NYC for Google client meeting"

**System Response:**
- Text appears in input
- Character count updates: "45/200"

**Field Specification: Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Text Input |
| Label | "Description" |
| Placeholder | "Brief description of the expense" |
| Required | Yes |
| Max Length | 200 characters |
| Min Length | 10 characters |
| Error Messages | |
| - Empty | "Description is required" |
| - Too short | "Description must be at least 10 characters" |

**Time:** ~10 seconds

---

### Step 8: Select Currency and Enter Amount

**User Action:** Leave currency as "USD" (default), type amount "847.50"

**System Response:**
- Amount displays with currency symbol: "$847.50"
- If USD selected, no conversion needed
- If CAD selected, shows conversion rate and USD equivalent
- Validates against policy limit
- Shows calculation if per diem applicable

**Screen State (Currency Selection):**
```
+----------------------------------------------------------+
| Amount *                                                  |
| Currency: [USD ▼]                                         |
|   Options: USD (US Dollar), CAD (Canadian Dollar)         |
|                                                           |
| Amount:   [$847.50                                    ]   |
|                                                           |
| ✓ Within policy limit ($2,000)                           |
| Remaining budget: $1,152.50                               |
+----------------------------------------------------------+
```

**Field Specification: Currency**
| Property | Value |
|----------|-------|
| Field Name | `currency` |
| Type | Dropdown (Select) |
| Label | "Currency" |
| Required | Yes |
| Default | USD |
| Options | |
| - `USD` | "USD - US Dollar" 🇺🇸 |
| - `CAD` | "CAD - Canadian Dollar" 🇨🇦 |
| Exchange Rate | Live rate from API (if not USD) |
| Display | Shows both original and converted amount |

**Field Specification: Amount**
| Property | Value |
|----------|-------|
| Field Name | `amount` |
| Type | Currency Input |
| Label | "Amount" |
| Required | Yes |
| Min Value | $0.01 |
| Max Value | $50,000 (hard limit) |
| Precision | 2 decimal places |
| Prefix | Currency symbol based on selection |
| Validation | |
| - Policy limit check | Warning if exceeds category limit |
| - Receipt required | If > $25, receipt becomes required |
| Error Messages | |
| - Empty | "Amount is required" |
| - Invalid | "Please enter a valid amount" |
| - Too high | "Amount exceeds maximum limit" |

**Time:** ~5 seconds

---

### Step 9: Enter Business Purpose

**User Action:** Type business justification, e.g., "Attended in-person client meeting with Google engineering team to discuss Q1 2025 staffing requirements"

**System Response:**
- Text appears in textarea
- Character count updates: "125/500"
- Shows helpful hint: "💡 Include client name, project, or business objective"

**Field Specification: Business Purpose**
| Property | Value |
|----------|-------|
| Field Name | `businessPurpose` |
| Type | Textarea |
| Label | "Business Purpose" |
| Placeholder | "Explain business justification..." |
| Required | Yes |
| Max Length | 500 characters |
| Min Length | 20 characters |
| Helpful Hint | Include client, project, or objective |
| Error Messages | |
| - Empty | "Business purpose is required" |
| - Too short | "Business purpose must be at least 20 characters" |

**Time:** ~15 seconds

---

### Step 10: Associate to Project/Client (Optional)

**User Action:** Click "Project/Client" field, search "Google"

**System Response:**
- Dropdown opens with search
- Shows recent projects/clients
- Filters as user types
- Displays: "Google (Account) · Senior Engineer Job"

**User Action:** Click "Google (Account) · Senior Engineer Job"

**System Response:**
- Dropdown closes
- Field shows selection
- Tags expense as billable if client project
- Pre-fills cost code if applicable

**Field Specification: Project/Client**
| Property | Value |
|----------|-------|
| Field Name | `projectId` or `accountId` |
| Type | Searchable Dropdown |
| Label | "Project/Client" |
| Placeholder | "Search projects or clients..." |
| Required | No (but recommended for tracking) |
| Data Source | Active jobs, deals, or accounts |
| Display Format | `{name} ({type}) · {detail}` |
| Search Fields | Name, client name, job title |
| Recent Items | Last 10 used |
| Auto-tag Billable | Yes if client project |

**Time:** ~5 seconds

---

### Step 11: Upload Receipt

**User Action:** Drag receipt image or PDF, or click to browse

**System Response (During Upload):**
- File name appears
- Shows upload progress bar
- Generates thumbnail preview
- OCR scans receipt for amount verification
- If OCR detects different amount, shows warning

**Screen State (After Upload):**
```
+----------------------------------------------------------+
| Receipt Attachment                                        |
|                                                           |
| ✓ Uploaded Receipt                                        |
|   [Thumbnail]  📄 united_receipt_nov25.pdf               |
|   Size: 234 KB · Uploaded just now                        |
|   [Change File]  [View]  [Delete]                         |
|                                                           |
| ✓ OCR Verified: Amount matches receipt ($847.50)         |
|                                                           |
+----------------------------------------------------------+
```

**Screen State (OCR Mismatch Warning):**
```
+----------------------------------------------------------+
| ⚠️  Receipt Amount Mismatch                              |
|                                                           |
| You entered:     $847.50                                  |
| Receipt shows:   $874.50                                  |
| Difference:      $27.00                                   |
|                                                           |
| Please verify the amount or update your entry.            |
|                                                           |
| [Keep My Amount]  [Use Receipt Amount]                    |
+----------------------------------------------------------+
```

**Field Specification: Receipt Upload**
| Property | Value |
|----------|-------|
| Field Name | `receiptFile` |
| Type | File Upload (Drag & Drop) |
| Label | "Receipt Attachment" |
| Accepted Types | `.pdf`, `.jpg`, `.jpeg`, `.png` |
| Max File Size | 10 MB |
| Required | If `amount > $25` |
| Storage | Supabase Storage bucket `expense-receipts/` |
| OCR Processing | Google Vision or AWS Textract |
| OCR Fields | Amount, merchant, date |
| Validation | File type, size, virus scan |
| Error Messages | |
| - Missing (>$25) | "Receipt required for expenses over $25" |
| - Invalid type | "Please upload PDF, JPG, or PNG file" |
| - Too large | "File size must be under 10 MB" |
| - Virus detected | "File failed security scan" |

**Time:** ~10 seconds

---

### Step 12: Set Billable Status

**User Action:** Keep "No - Internal company expense" selected (default)

**Alternative:** If client-billable, select "Yes"

**System Response (If Billable):**
- Shows markup percentage field
- Shows client billing amount
- Creates billable charge record
- Links to client invoice

**Screen State (Billable Expense):**
```
+----------------------------------------------------------+
| Billable to Client?                                       |
| ● Yes - Will create billable charge                      |
| ○ No  - Internal company expense                         |
|                                                           |
| Markup Percentage                                         |
| [18] % (Company standard markup)                          |
|                                                           |
| Client Billing Amount                                     |
| Expense Cost: $847.50                                     |
| Markup (18%): $152.55                                     |
| Client Bill:  $1,000.05                                   |
+----------------------------------------------------------+
```

**Field Specification: Billable to Client**
| Property | Value |
|----------|-------|
| Field Name | `isBillable` |
| Type | Radio Button Group |
| Label | "Billable to Client?" |
| Default | No (false) |
| Options | |
| - `true` | "Yes - Will create billable charge" |
| - `false` | "No - Internal company expense" |
| Conditional | If Yes, shows markup and billing fields |

**Time:** ~2 seconds

---

### Step 13: Review Policy Compliance

**System Response (Automatic):**
- Validates expense against policy rules
- Shows compliance status
- Flags policy violations

**Screen State (Policy Compliance Check):**
```
+----------------------------------------------------------+
| 📋 Policy Compliance Check                                |
|                                                           |
| ✓ Amount within category limit ($2,000)                  |
| ✓ Receipt attached (required for $847.50)                |
| ✓ Business purpose provided                              |
| ✓ Expense date within 90 days                            |
| ✓ Valid merchant/vendor                                   |
|                                                           |
| Status: ✅ Compliant - No approvals required beyond manager|
|                                                           |
+----------------------------------------------------------+
```

**Policy Violation Example:**
```
+----------------------------------------------------------+
| 📋 Policy Compliance Check                                |
|                                                           |
| ✓ Amount within category limit                           |
| ✓ Receipt attached                                        |
| ⚠️  Alcohol on receipt - Requires VP approval            |
| ⚠️  Expense date > 90 days - Requires justification      |
|                                                           |
| Status: ⚠️  Requires Additional Approval                 |
| Approval Chain: Manager → Finance → VP                    |
|                                                           |
| Additional Justification Required                         |
| [Explain why expense is late and includes alcohol...  ]   |
| [                                               ] 0/500   |
|                                                           |
+----------------------------------------------------------+
```

**Policy Rules**
| Rule | Limit | Violation Action |
|------|-------|------------------|
| Travel per trip | $2,000 | Director approval required |
| Meals - Individual | $50 | Auto-approved |
| Meals - Client/Team | $150 | Manager approval |
| Software/Subscriptions | $500 | IT approval required |
| Office Supplies | $300 | Auto-approved |
| Conference Registration | $1,500 | Training budget approval |
| Mileage rate | $0.67/mile | IRS standard rate |
| Alcohol | Any amount | VP approval required |
| Late submission (>90 days) | Any | Justification + Director approval |
| Receipt required | > $25 | Cannot submit without |

**Time:** ~2 seconds (automatic)

---

### Step 14: Click Next to Review

**User Action:** Click "Next: Review →" button

**System Response:**
- Validates all required fields
- Runs policy compliance check
- Slides to Step 3 (Review)

**Screen State (Step 3 - Review):**
```
+----------------------------------------------------------+
|                                    Submit New Expense [×] |
+----------------------------------------------------------+
| Step 3 of 3: Review & Submit                              |
|                                                           |
| Expense Summary                                           |
|                                                           |
| Category:        💼 Travel                                |
| Date:            November 25, 2024                        |
| Merchant:        United Airlines                          |
| Description:     Flight to NYC for Google client meeting  |
|                                                           |
| Amount:          $847.50 USD                              |
|                                                           |
| Business Purpose:                                         |
| Attended in-person client meeting with Google engineering |
| team to discuss Q1 2025 staffing requirements             |
|                                                           |
| Project/Client:  Google · Senior Engineer Job            |
| Billable:        No - Internal expense                    |
|                                                           |
| Receipt:         ✓ united_receipt_nov25.pdf (234 KB)     |
|                  [View Receipt]                           |
|                                                           |
| Policy Status:   ✅ Compliant                             |
|                                                           |
| Approval Workflow:                                        |
| 1. Manager (Sarah Johnson) - Auto-assigned                |
| 2. Finance (Auto-approved if Manager approves)            |
|                                                           |
| Expected Reimbursement:                                   |
| Deposit to: Bank Account ending in ****4567               |
| Estimated Date: Dec 5, 2024 (7-10 business days)          |
|                                                           |
| □ I certify this expense is accurate and for business use |
|                                                           |
+----------------------------------------------------------+
|      [← Back] [Save as Draft] [Cancel]  [Submit Expense ✓]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 15: Review and Certify

**User Action:** Review all details, check certification checkbox

**System Response:**
- Checkbox becomes checked
- "Submit Expense" button becomes enabled
- Shows final compliance check

**Field Specification: Certification**
| Property | Value |
|----------|-------|
| Field Name | `certificationAccepted` |
| Type | Checkbox |
| Label | "I certify this expense is accurate and for business use" |
| Required | Yes (cannot submit without) |
| Legal | Binds employee to expense accuracy |

**Time:** ~15 seconds

---

### Step 16: Click "Submit Expense"

**User Action:** Click "Submit Expense ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. Final validation
3. API call `POST /api/trpc/expenses.create`
4. Creates expense record
5. Uploads receipt to storage
6. Initiates approval workflow
7. Sends notification to manager
8. On success:
   - Modal closes (300ms animation)
   - Toast notification: "Expense submitted successfully" (green)
   - Expenses list refreshes
   - New expense appears with status "Pending"
   - Email sent to manager for approval
   - Employee receives confirmation email
9. On error:
   - Modal stays open
   - Error toast: "Failed to submit expense: {error message}"
   - Problematic fields highlighted

**Time:** ~2 seconds

---

### Step 17: View Submitted Expense

**System Response (Automatic):**
- Modal closes
- Navigates to expense detail page
- Shows full expense details with status

**Screen State (Expense Detail):**
```
+----------------------------------------------------------+
| [← Back to Expenses]                     Expense Detail  |
+----------------------------------------------------------+
|
| Expense #EXP-2024-1127                      [Edit] [Delete]|
| 🟡 Pending Manager Approval                               |
| Submitted: Nov 28, 2024 at 2:45 PM                        |
|                                                           |
| Category:        💼 Travel                                |
| Date:            November 25, 2024                        |
| Merchant:        United Airlines                          |
| Amount:          $847.50 USD                              |
|                                                           |
| Description:                                              |
| Flight to NYC for Google client meeting                   |
|                                                           |
| Business Purpose:                                         |
| Attended in-person client meeting with Google engineering |
| team to discuss Q1 2025 staffing requirements             |
|                                                           |
| Project/Client:  Google · Senior Engineer Job            |
| Billable:        No - Internal expense                    |
|                                                           |
+----------------------------------------------------------+
| Details | Approvals | Receipt | Activity                  |
+----------------------------------------------------------+
|
| Approval Workflow                                         |
|                                                           |
| 1. 🟡 Manager Approval (Sarah Johnson)                    |
|    Status: Pending                                        |
|    Sent: Nov 28, 2024 at 2:45 PM                          |
|                                                           |
| 2. ⚪ Finance Review                                      |
|    Status: Waiting for Manager approval                   |
|                                                           |
| Expected Reimbursement: Dec 5, 2024                       |
|                                                           |
+----------------------------------------------------------+
| Receipt                                                   |
|                                                           |
| 📄 united_receipt_nov25.pdf                              |
|    Size: 234 KB · Uploaded Nov 28, 2024                   |
|    [Download] [View Full Size]                            |
|                                                           |
| [Receipt Thumbnail Preview]                               |
|                                                           |
+----------------------------------------------------------+
| Recent Activity                                           |
|                                                           |
| ✅ Expense submitted by You · Just now                    |
| ✅ Receipt uploaded · Just now                            |
| ✅ Manager notification sent · Just now                   |
| ✅ Compliance check passed · Just now                     |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## Alternative Flow: Mileage Expense

### Mileage-Specific Fields

**User Action:** Select "Mileage" as expense type

**Screen State (Mileage Form):**
```
+----------------------------------------------------------+
| 🚗 Mileage Expense                    Rate: $0.67/mile   |
|                                                           |
| Trip Date *                                               |
| [MM/DD/YYYY                                     📅]       |
|                                                           |
| Starting Location *                                       |
| [e.g., Office, Home Address                           ]   |
|                                                           |
| Destination *                                             |
| [e.g., Client site, Conference venue                  ]   |
|                                                           |
| Round Trip?                                               |
| ● Yes - Calculate return distance                        |
| ○ No  - One-way trip only                                |
|                                                           |
| Distance Calculation                                      |
| ○ Auto-Calculate (Google Maps)                           |
| ○ Manual Entry                                            |
|                                                           |
| [Auto-Calculate Distance]                                 |
|                                                           |
| Distance: 45.2 miles (round trip)                         |
| Reimbursement: $30.28 (45.2 × $0.67)                     |
|                                                           |
| Purpose of Trip *                                         |
| [e.g., Client meeting at Google HQ                    ]   |
|                                                           |
+----------------------------------------------------------+
```

**Mileage Rate**: $0.67/mile (2024 IRS standard rate)

---

## Alternative Flow: Per Diem Meals

### Per Diem-Specific Fields

**User Action:** Select "Meals & Entertainment" for travel-related meals

**Screen State (Per Diem Option):**
```
+----------------------------------------------------------+
| 🍽️  Meals & Entertainment                                |
|                                                           |
| Meal Type                                                 |
| ○ Individual Meal (Actual expense with receipt)          |
| ● Per Diem Allowance (Travel meals - no receipt needed)  |
|                                                           |
| Travel Location *                                         |
| [Enter city/state...                                  ]   |
|   → San Francisco, CA                                     |
|                                                           |
| Travel Dates                                              |
| Start: [MM/DD/YYYY 📅]  End: [MM/DD/YYYY 📅]            |
|   → Nov 25 to Nov 27 (3 days)                            |
|                                                           |
| Meals Included                                            |
| Day 1 (Nov 25): ☑ Breakfast  ☑ Lunch  ☑ Dinner          |
| Day 2 (Nov 26): ☑ Breakfast  ☑ Lunch  ☑ Dinner          |
| Day 3 (Nov 27): ☑ Breakfast  ☑ Lunch  ☐ Dinner          |
|                                                           |
| Per Diem Calculation                                      |
| Location Rate: $79/day (San Francisco, CA)                |
| Total Days: 3 days                                        |
| Meals: 8 of 9 meals                                       |
|                                                           |
| Per Diem Amount: $211.00                                  |
| (8 meals × $26.33 average per meal)                      |
|                                                           |
| Receipt: Not required for per diem                        |
|                                                           |
+----------------------------------------------------------+
```

**Per Diem Rates (US GSA Standard):**
- Standard Rate: $59/day
- High-Cost Cities (SF, NYC, DC): $79/day
- International: Varies by country

---

## Postconditions

1. ✅ Expense record created in `expenses` table
2. ✅ `status` set to "pending_manager_approval"
3. ✅ Receipt uploaded to Supabase Storage (`expense-receipts/` bucket)
4. ✅ Receipt record created with OCR data
5. ✅ Approval workflow initiated
6. ✅ Manager notified via email and in-app notification
7. ✅ Employee receives confirmation email
8. ✅ Activity logged: "expense.submitted"
9. ✅ If billable: Billable charge record created
10. ✅ User redirected to expense detail page

---

## Events Logged

| Event | Payload |
|-------|---------|
| `expense.submitted` | `{ expense_id, employee_id, amount, currency, category, submitted_at }` |
| `expense.receipt_uploaded` | `{ expense_id, receipt_id, file_name, ocr_verified, uploaded_at }` |
| `expense.approval_requested` | `{ expense_id, approver_id, approval_level, requested_at }` |
| `expense.policy_checked` | `{ expense_id, policy_status, violations, checked_at }` |
| `expense.billable_created` | `{ expense_id, client_id, bill_amount, created_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Receipt | Amount > $25 without receipt | "Receipt required for expenses over $25" | Upload receipt |
| Policy Violation | Exceeds category limit | "Amount exceeds policy limit. Director approval required." | Justify or reduce amount |
| Invalid Date | Future date entered | "Expense date cannot be in the future" | Select valid date |
| Duplicate Expense | Same merchant, date, amount exists | "Possible duplicate expense found. [View Existing]" | Confirm or edit |
| OCR Mismatch | Receipt amount ≠ entered amount | "Receipt shows different amount. Please verify." | Correct amount |
| File Upload Failed | Storage error | "Failed to upload receipt. Please try again." | Retry upload |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Over Annual Limit | YTD expenses > $25,000 | "Annual expense limit reached. Contact Finance." | Contact Finance |
| Invalid Merchant | Restricted vendor | "This vendor is not approved. Contact Procurement." | Use approved vendor |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+N` | New expense |
| `Cmd+S` | Save as draft |
| `Cmd+Enter` | Submit expense |
| `Esc` | Close modal |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |

---

## Approval Workflow

### Standard Approval Chain

| Approval Level | Approver | Conditions | Auto-Approve Threshold |
|----------------|----------|------------|------------------------|
| 1. Manager | Direct manager | All expenses | < $50 (Meals) |
| 2. Finance | Finance team | Amount > $500 OR Policy violation | N/A |
| 3. Director | Department director | Amount > $2,000 OR Late submission | N/A |
| 4. VP | Vice President | Alcohol OR International | N/A |
| 5. CFO | Chief Financial Officer | Amount > $10,000 | N/A |

### Approval SLAs

| Approval Level | Target Response Time |
|----------------|---------------------|
| Manager | 2 business days |
| Finance | 3 business days |
| Director | 5 business days |
| VP | 7 business days |
| CFO | 10 business days |

**Total Expected Time to Reimbursement:** 7-10 business days after final approval

---

## Reimbursement Process

### Payment Methods

| Method | Description | Processing Time |
|--------|-------------|-----------------|
| Direct Deposit | Bank account (preferred) | 3-5 business days |
| Payroll Integration | Next paycheck | Next pay cycle |
| Check | Physical check mailed | 7-10 business days |

### Reimbursement Statuses

- **Pending Approval** - Awaiting manager/finance approval
- **Approved** - Approved, queued for payment
- **Processing** - Payment being processed
- **Paid** - Funds deposited
- **Rejected** - Denied (with reason)
- **On Hold** - Additional information needed

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/expenses.ts`
**Procedure:** `expenses.create`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const createExpenseInput = z.object({
  // Expense Details
  expenseCategory: z.enum([
    'travel', 'meals', 'software', 'office_supplies',
    'conference', 'mileage', 'communications', 'other'
  ]),
  expenseDate: z.date(),
  merchantName: z.string().min(1).max(100),
  description: z.string().min(10).max(200),
  businessPurpose: z.string().min(20).max(500),

  // Amount
  amount: z.number().positive().multipleOf(0.01),
  currency: z.enum(['USD', 'CAD']).default('USD'),

  // Associations
  projectId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),

  // Billable
  isBillable: z.boolean().default(false),
  markupPercentage: z.number().min(0).max(100).optional(),

  // Receipt
  receiptFileId: z.string().uuid().optional(),
  receiptOcrData: z.object({
    amount: z.number().optional(),
    merchant: z.string().optional(),
    date: z.string().optional(),
  }).optional(),

  // Mileage-specific
  mileageDistance: z.number().positive().optional(),
  mileageStartLocation: z.string().max(200).optional(),
  mileageEndLocation: z.string().max(200).optional(),
  mileageRoundTrip: z.boolean().optional(),

  // Per Diem-specific
  perDiemLocation: z.string().max(200).optional(),
  perDiemStartDate: z.date().optional(),
  perDiemEndDate: z.date().optional(),
  perDiemMeals: z.array(z.enum(['breakfast', 'lunch', 'dinner'])).optional(),

  // Certification
  certificationAccepted: z.literal(true),
});

export type CreateExpenseInput = z.infer<typeof createExpenseInput>;
```

### Output Schema

```typescript
export const createExpenseOutput = z.object({
  expenseId: z.string().uuid(),
  expenseNumber: z.string(),
  status: z.literal('pending_manager_approval'),
  approvalWorkflow: z.array(z.object({
    level: z.number(),
    approverRole: z.string(),
    approverId: z.string().uuid(),
    status: z.enum(['pending', 'approved', 'rejected']),
  })),
  expectedReimbursementDate: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type CreateExpenseOutput = z.infer<typeof createExpenseOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)
2. **Check Policy Compliance** (~100ms)
3. **Verify Receipt Required** (~50ms)
4. **Calculate Reimbursement Amount** (~50ms)
5. **Create Expense Record** (~100ms)
6. **Upload Receipt to Storage** (~1-3 seconds)
7. **Run OCR on Receipt** (~2-5 seconds)
8. **Determine Approval Workflow** (~50ms)
9. **Create Approval Records** (~100ms)
10. **Send Notifications** (~200ms)
11. **Log Activity** (~50ms)

**Total Processing Time:** ~4-10 seconds

---

## Database Schema Reference

### Table: expenses

**File:** `src/lib/db/schema/hr.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `org_id` | UUID | FK → organizations.id, NOT NULL | |
| `employee_id` | UUID | FK → user_profiles.id, NOT NULL | Submitter |
| `expense_number` | VARCHAR(50) | NOT NULL, UNIQUE | EXP-YYYY-NNNN |
| `expense_category` | ENUM | NOT NULL | See category enum |
| `expense_date` | DATE | NOT NULL | Date expense occurred |
| `merchant_name` | VARCHAR(100) | NOT NULL | |
| `description` | VARCHAR(200) | NOT NULL | |
| `business_purpose` | VARCHAR(500) | NOT NULL | |
| `amount` | DECIMAL(10,2) | NOT NULL | Original amount |
| `currency` | ENUM | DEFAULT 'USD' | USD, CAD |
| `usd_amount` | DECIMAL(10,2) | NOT NULL | Converted to USD |
| `exchange_rate` | DECIMAL(10,6) | | If non-USD |
| `project_id` | UUID | FK → projects.id | Optional |
| `account_id` | UUID | FK → accounts.id | Optional |
| `job_id` | UUID | FK → jobs.id | Optional |
| `is_billable` | BOOLEAN | DEFAULT false | |
| `markup_percentage` | DECIMAL(5,2) | | If billable |
| `client_bill_amount` | DECIMAL(10,2) | | If billable |
| `receipt_id` | UUID | FK → expense_receipts.id | |
| `receipt_required` | BOOLEAN | | Based on amount |
| `mileage_distance` | DECIMAL(10,2) | | Miles |
| `mileage_rate` | DECIMAL(5,2) | | $/mile |
| `per_diem_rate` | DECIMAL(10,2) | | $/day |
| `status` | ENUM | DEFAULT 'draft' | See status enum |
| `policy_compliant` | BOOLEAN | | |
| `policy_violations` | JSONB | | Array of violations |
| `submitted_at` | TIMESTAMP | | |
| `approved_at` | TIMESTAMP | | |
| `paid_at` | TIMESTAMP | | |
| `reimbursement_method` | ENUM | | 'direct_deposit', 'payroll', 'check' |
| `payment_reference` | VARCHAR(100) | | Transaction ID |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Status Enum:**
- `draft` - Being created
- `pending_manager_approval` - Awaiting manager
- `pending_finance_approval` - Awaiting finance
- `pending_director_approval` - Awaiting director
- `pending_vp_approval` - Awaiting VP
- `approved` - Approved, queued for payment
- `processing` - Payment processing
- `paid` - Reimbursed
- `rejected` - Denied
- `on_hold` - Additional info needed

### Table: expense_receipts

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `expense_id` | UUID | FK → expenses.id, NOT NULL | |
| `file_name` | VARCHAR(255) | NOT NULL | |
| `storage_path` | VARCHAR(500) | NOT NULL | |
| `file_size` | INT | | Bytes |
| `file_type` | VARCHAR(50) | | MIME type |
| `ocr_data` | JSONB | | Extracted data |
| `ocr_verified` | BOOLEAN | | Amount match |
| `uploaded_at` | TIMESTAMP | NOT NULL | |
| `uploaded_by` | UUID | FK → user_profiles.id | |

### Table: expense_approvals

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `expense_id` | UUID | FK → expenses.id, NOT NULL | |
| `approval_level` | INT | NOT NULL | 1, 2, 3, etc. |
| `approver_role` | VARCHAR(50) | NOT NULL | Manager, Finance, etc. |
| `approver_id` | UUID | FK → user_profiles.id | |
| `status` | ENUM | DEFAULT 'pending' | pending, approved, rejected |
| `comments` | TEXT | | Approver notes |
| `actioned_at` | TIMESTAMP | | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

## Related Use Cases

- Employee onboarding (direct deposit setup)
- Travel booking and approvals
- Client billing (billable expenses)
- Finance reporting and reconciliation

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Submit expense with receipt | Expense created, receipt uploaded |
| TC-002 | Submit expense > $25 without receipt | Error: Receipt required |
| TC-003 | Submit expense with OCR mismatch | Warning shown, allow override |
| TC-004 | Submit mileage expense | Auto-calculate reimbursement |
| TC-005 | Submit per diem expense | No receipt required |
| TC-006 | Submit expense > policy limit | Director approval added to workflow |
| TC-007 | Submit expense with alcohol | VP approval added to workflow |
| TC-008 | Submit late expense (>90 days) | Justification required |
| TC-009 | Submit billable expense | Billable charge created |
| TC-010 | Submit expense in CAD | Converted to USD |

---

*Last Updated: 2024-11-30*
