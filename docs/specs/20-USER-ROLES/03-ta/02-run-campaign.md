# Use Case: Create and Run Talent Acquisition Campaign

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-TA-001 |
| Actor | TA Recruiter |
| Goal | Create and execute a talent sourcing campaign to attract qualified internal candidates |
| Frequency | 2-4 times per month |
| Estimated Time | 30-60 minutes to create, ongoing management |
| Priority | High (Core workflow) |

---

## Preconditions

1. User is logged in as TA Recruiter
2. User has "campaign.create" permission
3. Internal job requisition exists (or proactive sourcing)
4. Email integration configured (SendGrid, Mailgun, etc.)
5. LinkedIn integration configured (optional)

---

## Trigger

One of the following:
- New internal job requisition opened
- Low candidate pipeline for existing role
- Proactive sourcing for high-demand roles
- Quarterly hiring plan requires pipeline building
- Previous campaign completed, need to launch new one

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Campaigns

**User Action:** Click "Campaigns" in the sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/campaigns`
- Campaigns list screen loads
- Loading skeleton shows for 200-500ms
- Campaigns list populates

**Screen State:**
```
+----------------------------------------------------------+
| Campaigns                              [+ New Campaign]   |
+----------------------------------------------------------+
| [Search campaigns...]               [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| ● Active │ ○ Draft │ ○ Completed │ ○ Archived │ ○ All     |
+----------------------------------------------------------+
| Name              Type     Sent  Response  Conv  Status   |
| ───────────────────────────────────────────────────────── |
| Senior Recruiter  Talent   247   38 (15%)  5    🟢 Active |
| BDR Sourcing      Talent   156   19 (12%)  3    🟡 Active |
| Jr. Developer     Talent   89    12 (13%)  2    🟢 Active |
+----------------------------------------------------------+
| Showing 3 active campaigns                                |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "New Campaign"

**User Action:** Click "+ New Campaign" button

**System Response:**
- Campaign builder modal slides in from right (300ms animation)
- Modal title: "Create New Campaign"
- Focus on "Campaign Name" field

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create New Campaign [×] |
+----------------------------------------------------------+
| Step 1 of 4: Campaign Details                             |
|                                                           |
| Campaign Name *                                           |
| [                                                      ]  |
|   Max 100 characters                                      |
|                                                           |
| Description                                               |
| [                                                      ]  |
| [                                                      ]  |
|                                               ] 0/500     |
|                                                           |
| Campaign Type *                                           |
| ● Talent Sourcing                                         |
|   Find candidates for internal positions                  |
| ○ Business Development                                    |
|   Generate client leads (not typical for TA)              |
| ○ Mixed                                                   |
|   Both talent and business development                    |
|                                                           |
| Target Role (if Talent Sourcing)                          |
| [Select internal job...                               ▼]  |
|   [No active jobs? You can still run a proactive campaign]|
|                                                           |
+----------------------------------------------------------+
|                                      [Cancel] [Continue →]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Complete Campaign Details

**User Action:** Fill in campaign details

**Field Inputs:**
- Campaign Name: "Account Executive Sourcing - Q1 2025"
- Description: "Sourcing experienced AEs for our Sales team expansion"
- Campaign Type: Talent Sourcing (selected)
- Target Role: "Account Executive" (from dropdown)

**Field Specification: Campaign Name**
| Property | Value |
|----------|-------|
| Field Name | `name` |
| Type | Text Input |
| Label | "Campaign Name" |
| Required | Yes |
| Max Length | 100 characters |
| Validation | Non-empty, unique within active campaigns |
| Error Messages | |
| - Empty | "Campaign name is required" |
| - Duplicate | "A campaign with this name already exists" |

**Field Specification: Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Textarea |
| Label | "Description" |
| Required | No |
| Max Length | 500 characters |
| Placeholder | "Describe the purpose and goals of this campaign..." |

**Field Specification: Campaign Type**
| Property | Value |
|----------|-------|
| Field Name | `campaignType` |
| Type | Radio Button Group |
| Label | "Campaign Type" |
| Required | Yes |
| Options | |
| - `talent_sourcing` | "Talent Sourcing" (default) |
| - `business_development` | "Business Development" |
| - `mixed` | "Mixed" |
| Default | `talent_sourcing` |

**Field Specification: Target Role**
| Property | Value |
|----------|-------|
| Field Name | `targetRoleId` |
| Type | Dropdown (Select) |
| Label | "Target Role" |
| Required | No (can be proactive) |
| Data Source | Active internal jobs |
| Display | Job title + Department |
| Conditional | Only shown if Campaign Type = Talent Sourcing |

**User Action:** Click "Continue →"

**System Response:**
- Validates Step 1 fields
- If valid: Slides to Step 2
- If invalid: Shows error messages, stays on Step 1

**Time:** ~30 seconds

---

### Step 4: Define Target Audience

**System Response:**
- Slides to Step 2: Target Audience
- Shows targeting criteria fields

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create New Campaign [×] |
+----------------------------------------------------------+
| Step 2 of 4: Target Audience                              |
|                                                           |
| Target Audience Description                               |
| [Experienced Account Executives in tech sales         ]   |
|                                               ] 0/200     |
|                                                           |
| Target Skills * (select at least 1)                       |
| [Search skills...                                      ]  |
| [Sales] [×]  [SaaS] [×]  [B2B] [×]  [Outbound] [×]      |
| [+ Add skill]                                             |
|                                                           |
| Experience Level                                          |
| Min: [3] years  Max: [8] years                           |
|                                                           |
| Target Locations (select multiple)                        |
| [Search locations...                                   ]  |
| [San Francisco, CA] [×]  [Remote] [×]                    |
| [New York, NY] [×]                                        |
| [+ Add location]                                          |
|                                                           |
| Target Company Sizes (optional)                           |
| ☐ Startup (1-50)  ☑ Small (51-200)  ☑ Medium (201-1000) |
| ☐ Large (1000+)                                          |
|                                                           |
| Current Company Types (optional)                          |
| [SaaS companies, staffing agencies, tech startups     ]   |
|                                               ] 0/200     |
|                                                           |
| Goals                                                     |
| Target Contact Count: [250] contacts                      |
| Expected Response Rate: [15]%                             |
| Target Conversions: [10] candidates added to pipeline    |
|                                                           |
+----------------------------------------------------------+
|                        [← Back] [Cancel] [Continue →]     |
+----------------------------------------------------------+
```

**Field Specification: Target Skills**
| Property | Value |
|----------|-------|
| Field Name | `targetSkills` |
| Type | Multi-select Tag Input |
| Label | "Target Skills" |
| Required | Yes (at least 1) |
| Data Source | `skills` table (autocomplete) |
| Allow Custom | Yes |
| Max Tags | 20 |
| Display | Tags with × to remove |
| Error Messages | |
| - Empty | "At least one skill is required" |

**Field Specification: Target Locations**
| Property | Value |
|----------|-------|
| Field Name | `targetLocations` |
| Type | Multi-select Tag Input |
| Label | "Target Locations" |
| Required | No |
| Data Source | Google Places API (autocomplete) |
| Allow Custom | Yes |
| Max Tags | 10 |
| Special Values | "Remote", "Hybrid" |

**Field Specification: Target Contact Count**
| Property | Value |
|----------|-------|
| Field Name | `targetContactsCount` |
| Type | Number Input |
| Label | "Target Contact Count" |
| Required | Yes |
| Min | 10 |
| Max | 5000 |
| Default | 200 |
| Validation | Must be reasonable for campaign duration |

**Field Specification: Expected Response Rate**
| Property | Value |
|----------|-------|
| Field Name | `targetResponseRate` |
| Type | Percentage Input |
| Label | "Expected Response Rate" |
| Required | No |
| Min | 1% |
| Max | 100% |
| Default | 15% |
| Help Text | "Industry average: 10-20% for talent sourcing" |

**User Action:** Fill in targeting criteria, click "Continue →"

**Time:** ~2 minutes

---

### Step 5: Choose Campaign Channel

**System Response:**
- Slides to Step 3: Channel & Messaging
- Shows channel selection and message templates

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create New Campaign [×] |
+----------------------------------------------------------+
| Step 3 of 4: Channel & Messaging                          |
|                                                           |
| Channel *                                                 |
| ☑ Email                                                  |
|   Send personalized emails to candidates                  |
| ☑ LinkedIn                                               |
|   Send InMails via LinkedIn Recruiter                     |
| ○ Combined                                               |
|   Multi-channel approach (email + LinkedIn)               |
|                                                           |
| A/B Testing                                               |
| ☑ Enable A/B Testing                                     |
|   Test two message variants to optimize response          |
|   Split: [50]% Variant A  [50]% Variant B                |
|                                                           |
+----------------------------------------------------------+
```

**Field Specification: Channel**
| Property | Value |
|----------|-------|
| Field Name | `channel` |
| Type | Checkbox Group (multi-select) |
| Label | "Channel" |
| Required | Yes (at least one) |
| Options | |
| - `email` | "Email" |
| - `linkedin` | "LinkedIn" |
| - `combined` | "Combined" |
| Validation | LinkedIn requires integration setup |

**Field Specification: Enable A/B Testing**
| Property | Value |
|----------|-------|
| Field Name | `isAbTest` |
| Type | Checkbox |
| Label | "Enable A/B Testing" |
| Default | Unchecked (false) |
| Help Text | "Test two message variants to find what resonates" |

**Time:** ~10 seconds

---

### Step 6: Create Message Templates

**User Action:** Check "Enable A/B Testing", configure messages

**System Response:**
- Shows Variant A and Variant B message editors
- Pre-fills with default templates (editable)

**Screen State:**
```
+----------------------------------------------------------+
| Message Templates                                         |
|                                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │ Variant A (50% of contacts)                         │ |
| ├─────────────────────────────────────────────────────┤ |
| │ Subject Line *                                       │ |
| │ [Exciting AE Opportunity at InTime                ] │ |
| │                                                      │ |
| │ Message Body *                                       │ |
| │ [                                                  ] │ |
| │ [Hi {{firstName}},                                 ] │ |
| │ [                                                  ] │ |
| │ [I came across your profile and was impressed by   ] │ |
| │ [your {{experience}} years in SaaS sales. We're    ] │ |
| │ [building out our Sales team at InTime, a fast-    ] │ |
| │ [growing staffing tech company.                    ] │ |
| │ [                                                  ] │ |
| │ [Would you be open to a quick conversation about   ] │ |
| │ [this opportunity?                                 ] │ |
| │ [                                                  ] │ |
| │ [Best,                                             ] │ |
| │ [{{senderName}}                                    ] │ |
| │ [TA Recruiter at InTime                           ] │ |
| │ [                                         ] 0/1000  │ |
| │                                                      │ |
| │ Call-to-Action                                       │ |
| │ [Schedule a 15-Minute Chat]                         │ |
| │ Link: [https://calendly.com/ta-recruiter/15min   ] │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| ┌─────────────────────────────────────────────────────┐ |
| │ Variant B (50% of contacts)                         │ |
| ├─────────────────────────────────────────────────────┤ |
| │ Subject Line *                                       │ |
| │ [Join InTime's High-Performing Sales Team        ] │ |
| │                                                      │ |
| │ Message Body *                                       │ |
| │ [Different angle: focus on company growth, team   ] │ |
| │ [culture, commission structure...                  ] │ |
| │ [                                         ] 0/1000  │ |
| │                                                      │ |
| │ Call-to-Action                                       │ |
| │ [Learn More About This Role]                        │ |
| │ Link: [https://intime.com/careers/ae              ] │ |
| └─────────────────────────────────────────────────────┘ |
|                                                           |
| Personalization Variables Available:                      |
| {{firstName}}, {{lastName}}, {{currentCompany}},          |
| {{currentTitle}}, {{experience}}, {{location}},           |
| {{senderName}}, {{senderTitle}}                           |
|                                                           |
+----------------------------------------------------------+
|                        [← Back] [Cancel] [Continue →]     |
+----------------------------------------------------------+
```

**Field Specification: Subject Line**
| Property | Value |
|----------|-------|
| Field Name | `variantASubject`, `variantBSubject` |
| Type | Text Input |
| Label | "Subject Line" |
| Required | Yes |
| Max Length | 100 characters |
| Personalization | Supports {{variables}} |
| Validation | Non-empty |

**Field Specification: Message Body**
| Property | Value |
|----------|-------|
| Field Name | `variantABody`, `variantBBody` |
| Type | Rich Text Editor / Textarea |
| Label | "Message Body" |
| Required | Yes |
| Max Length | 1000 characters |
| Personalization | Supports {{variables}} |
| Formatting | Plain text or HTML |
| Error Messages | |
| - Empty | "Message body is required" |
| - Too long | "Message exceeds maximum length" |

**Field Specification: Call-to-Action**
| Property | Value |
|----------|-------|
| Field Name | `ctaText`, `ctaLink` |
| Type | Text Input + URL Input |
| Label | "Call-to-Action" |
| Required | Yes |
| CTA Text Max | 50 characters |
| Link Validation | Must be valid URL |

**User Action:** Customize both variants, click "Continue →"

**Time:** ~10 minutes

---

### Step 7: Set Campaign Duration & Schedule

**System Response:**
- Slides to Step 4: Schedule & Launch
- Shows campaign duration and send schedule options

**Screen State:**
```
+----------------------------------------------------------+
|                                   Create New Campaign [×] |
+----------------------------------------------------------+
| Step 4 of 4: Schedule & Launch                            |
|                                                           |
| Campaign Duration                                         |
| Start Date: [Dec 1, 2024]                                |
| End Date: [Dec 31, 2024]                                 |
|   (30 days)                                               |
|                                                           |
| Send Schedule                                             |
| ● Spread over duration (recommended)                     |
|   Sends distributed evenly to avoid spam filters          |
|   ~8 contacts per day                                     |
|                                                           |
| ○ Send immediately                                       |
|   Send to all contacts within 1 hour (use cautiously)     |
|                                                           |
| ○ Custom schedule                                        |
|   Define specific send windows                            |
|                                                           |
| Optimal Send Times (based on analytics)                   |
| ☑ Tuesday 10:00 AM - 12:00 PM                            |
| ☑ Thursday 2:00 PM - 4:00 PM                             |
| ☑ Wednesday 9:00 AM - 11:00 AM                           |
| ☐ Monday mornings (lower response rate)                  |
|                                                           |
| Contact Import                                            |
| How will you add contacts to this campaign?               |
|                                                           |
| ○ Import from LinkedIn Recruiter                         |
|   Manually search and add contacts                        |
|                                                           |
| ○ Upload CSV file                                        |
|   Import contact list from spreadsheet                    |
|   [Download Template]                                     |
|                                                           |
| ● Add contacts later                                     |
|   Save campaign as draft, add contacts before launching   |
|                                                           |
| Summary                                                   |
| Campaign: Account Executive Sourcing - Q1 2025           |
| Target: 250 contacts with Sales, SaaS, B2B skills         |
| Duration: Dec 1 - Dec 31, 2024 (30 days)                 |
| A/B Test: Enabled (50/50 split)                          |
| Expected: ~38 responses, ~10 conversions                  |
|                                                           |
+----------------------------------------------------------+
| [← Back] [Save as Draft] [Cancel] [Launch Campaign →]    |
+----------------------------------------------------------+
```

**Field Specification: Start Date**
| Property | Value |
|----------|-------|
| Field Name | `startDate` |
| Type | Date Picker |
| Label | "Start Date" |
| Required | Yes |
| Validation | Cannot be in the past |
| Default | Today |

**Field Specification: End Date**
| Property | Value |
|----------|-------|
| Field Name | `endDate` |
| Type | Date Picker |
| Label | "End Date" |
| Required | Yes |
| Validation | Must be after start date, max 90 days |
| Default | 30 days from start |

**Field Specification: Send Schedule**
| Property | Value |
|----------|-------|
| Field Name | `sendSchedule` |
| Type | Radio Button Group |
| Label | "Send Schedule" |
| Options | |
| - `spread` | "Spread over duration" (recommended) |
| - `immediate` | "Send immediately" |
| - `custom` | "Custom schedule" |
| Default | `spread` |

**Time:** ~2 minutes

---

### Step 8: Launch Campaign

**User Action:** Click "Launch Campaign →"

**System Response:**

1. **Button shows loading state** (spinner)

2. **Form validates all fields across all steps**
   - If errors: Navigate to step with errors, highlight fields
   - If valid: Proceed

3. **API call:** `POST /api/trpc/campaigns.create`

4. **Campaign Creation:**
   - Creates campaign record in `campaigns` table
   - Status: "active" (if launching now) or "draft" (if saving)
   - Owner: Current user
   - A/B test configuration saved

5. **Contact Assignment (if applicable):**
   - If LinkedIn import: Opens LinkedIn integration
   - If CSV: Processes file, creates campaign_contacts records
   - If "Add later": Campaign saved as draft

6. **A/B Variant Assignment:**
   - System randomly assigns each contact to Variant A or B
   - 50/50 split (or custom split percentage)
   - Assignment stored in `campaign_contacts.abVariant`

7. **Send Scheduling:**
   - If "Spread over duration": Creates send queue
   - Distributes contacts evenly across campaign duration
   - Respects optimal send times
   - Avoids weekends and holidays

8. **On Success:**
   - Modal closes
   - Toast: "Campaign launched successfully!" ✓
   - Redirects to Campaign Detail page
   - URL: `/employee/workspace/campaigns/{campaign-id}`

9. **On Error:**
   - Modal stays open
   - Error toast with message
   - User can retry

**Time:** ~3 seconds

---

### Step 9: View Campaign Dashboard

**System Response (Automatic):**
- Navigates to Campaign Detail page
- Shows campaign dashboard with real-time metrics

**Screen State:**
```
+----------------------------------------------------------+
| Campaign: Account Executive Sourcing - Q1 2025    [⋮ Menu]|
+----------------------------------------------------------+
| Status: 🟢 Active    Owner: You    Created: Just now      |
| Duration: Dec 1 - Dec 31, 2024 (30 days remaining)        |
+----------------------------------------------------------+
| [Overview] [Contacts] [Responses] [Analytics] [Settings]  |
+----------------------------------------------------------+
| Performance Summary                                       |
| ┌──────────────┬──────────────┬──────────────┬──────────┐|
| │ Contacts     │ Sent         │ Opened       │ Responded││
| │ 0 / 250      │ 0            │ 0 (0%)       │ 0 (0%)   ││
| │ [Add Contacts]│             │              │          ││
| └──────────────┴──────────────┴──────────────┴──────────┘|
|                                                           |
| ┌──────────────┬──────────────┬──────────────┬──────────┐|
| │ Conversions  │ Response Rate│ Conv. Rate   │ Goal     ││
| │ 0            │ 0%           │ 0%           │ 10       ││
| │              │ Target: 15%  │              │ (0%)     ││
| └──────────────┴──────────────┴──────────────┴──────────┘|
|                                                           |
| A/B Test Results                                          |
| No data yet - contacts need to be added and sent          |
|                                                           |
| Recent Activity                                           |
| ✅ Campaign created by You · Just now                     |
|                                                           |
| Next Steps                                                |
| 1. Add contacts to campaign (LinkedIn or CSV import)      |
| 2. Review message templates one more time                 |
| 3. Launch sends when ready                                |
|                                                           |
+----------------------------------------------------------+
| [Add Contacts] [Edit Campaign] [Pause] [Export Data]     |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## Postconditions

1. ✅ Campaign record created in `campaigns` table
2. ✅ Status = "active" or "draft"
3. ✅ Owner = current user
4. ✅ A/B test configuration saved
5. ✅ Target audience criteria stored
6. ✅ Message templates saved
7. ✅ Send schedule configured
8. ✅ Campaign appears in user's campaign list
9. ✅ Activity logged: "campaign.created"
10. ✅ Analytics tracking initialized

---

## Adding Contacts to Campaign

### Option A: LinkedIn Recruiter Integration

**Flow:**
1. User clicks "Add Contacts" → "Import from LinkedIn"
2. Opens LinkedIn Recruiter in new tab/window
3. User searches for candidates matching criteria
4. For each candidate:
   - User clicks "Add to InTime Campaign" (browser extension/bookmarklet)
   - Candidate data imported to InTime
   - `campaign_contacts` record created
   - A/B variant assigned randomly
5. User returns to InTime
6. Campaign shows updated contact count
7. Sends begin based on schedule

**Time:** ~2-5 minutes per contact (manual)

---

### Option B: CSV Import

**Flow:**
1. User clicks "Add Contacts" → "Upload CSV"
2. User downloads CSV template
3. User fills template with contact data:
   - First Name, Last Name, Email, LinkedIn URL, Current Company, Title
4. User uploads filled CSV
5. System validates data:
   - Email format
   - No duplicates
   - Required fields present
6. System creates `campaign_contacts` records
7. A/B variants assigned randomly
8. Sends begin based on schedule

**CSV Template:**
```csv
firstName,lastName,email,linkedinUrl,companyName,title
John,Doe,john.doe@example.com,https://linkedin.com/in/johndoe,Acme Corp,Account Executive
Jane,Smith,jane.smith@example.com,https://linkedin.com/in/janesmith,Beta Inc,Sales Manager
```

**Time:** ~10-20 minutes for 100 contacts

---

## Managing Active Campaign

### Monitor Performance

**User navigates to Campaign Detail → Analytics tab**

Metrics shown:
- **Send Performance**: Emails sent, bounced, failed
- **Engagement**: Opens, clicks, response rate
- **A/B Test Results**: Variant A vs B comparison
- **Conversion Funnel**: Sent → Opened → Responded → Converted
- **Time-based Analytics**: Response rates by day, hour
- **Contact Quality**: Response quality score

**Time:** ~5 minutes daily

---

### Respond to Candidate Replies

**User navigates to Campaign Detail → Responses tab**

For each response:
1. **Positive Response**: Click "Convert to Candidate"
   - Creates candidate profile
   - Associates with internal job
   - Moves to hiring pipeline
   - Marks campaign contact as "converted"

2. **Negative Response**: Click "Mark as Not Interested"
   - Updates status to "declined"
   - Removes from active send list

3. **Needs Follow-up**: Click "Reply"
   - Opens email composer
   - Sends personalized reply
   - Logs activity

**Time:** ~5-10 minutes per response

---

### Pause or Adjust Campaign

**User can:**
- **Pause Campaign**: Stops all pending sends
- **Edit Templates**: Update messaging mid-campaign
- **Adjust Target Count**: Add or remove contacts
- **Change Send Schedule**: Modify timing
- **End Early**: Mark campaign as completed

**Time:** ~2-5 minutes

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| No contacts added | Campaign launched without contacts | "Campaign has no contacts. Add contacts to begin sending." | Add contacts via LinkedIn or CSV |
| LinkedIn integration failed | LinkedIn connection expired | "LinkedIn integration failed. Please reconnect your account." | Re-authenticate LinkedIn |
| Email bounce rate high | Invalid email addresses | "High bounce rate detected (>5%). Review contact list quality." | Clean contact list, verify emails |
| Spam complaints | Recipients marking as spam | "Spam complaints received. Campaign paused for review." | Review messaging, contact compliance team |
| Low response rate | Poor messaging or targeting | "Response rate below target (5% vs 15% expected)" | A/B test results, adjust messaging |
| Quota exceeded | Too many emails sent in short period | "Daily send limit reached. Sends will resume tomorrow." | Wait for quota reset, or adjust schedule |
| Duplicate contacts | Same contact in multiple campaigns | "Warning: 15 contacts are in other active campaigns" | Review duplicates, decide to exclude or proceed |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Campaign Name | Required, unique | "Campaign name is required" / "Name already exists" |
| Target Skills | At least 1 skill | "At least one skill is required" |
| Target Contact Count | 10-5000 | "Contact count must be between 10 and 5000" |
| Subject Line | Required, max 100 chars | "Subject line is required" / "Subject line too long" |
| Message Body | Required, max 1000 chars | "Message body is required" / "Message exceeds limit" |
| Start Date | Cannot be in past | "Start date cannot be in the past" |
| End Date | After start date, max 90 days | "End date must be after start date" / "Max 90 days" |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `campaign.created` | `{ campaign_id, name, type, target_count, created_by, created_at }` |
| `campaign.launched` | `{ campaign_id, status: 'active', launched_at, launched_by }` |
| `campaign_contact.added` | `{ campaign_id, contact_id, ab_variant, added_at }` |
| `campaign_contact.sent` | `{ campaign_id, contact_id, sent_at, variant, channel }` |
| `campaign_contact.opened` | `{ campaign_id, contact_id, opened_at, variant }` |
| `campaign_contact.responded` | `{ campaign_id, contact_id, responded_at, response_type }` |
| `campaign_contact.converted` | `{ campaign_id, contact_id, candidate_id, converted_at }` |
| `campaign.completed` | `{ campaign_id, status: 'completed', total_sent, response_rate, conversions }` |

---

## A/B Test Analysis

After campaign runs for 7-14 days, system calculates:

**Winning Variant Criteria:**
- Higher response rate (primary)
- Higher conversion rate (secondary)
- Statistical significance (p-value < 0.05)

**Shown in Analytics:**
```
A/B Test Results (14 days in)
┌────────────────────────────────────────────────┐
│ Variant A                  │ Variant B         │
│ Subject: "Exciting AE..."  │ Subject: "Join..." │
├────────────────────────────┼───────────────────┤
│ Sent: 125                  │ Sent: 125         │
│ Opened: 68 (54%)           │ Opened: 82 (66%)  │
│ Responded: 15 (12%)        │ Responded: 23 (18%)│
│ Converted: 3 (20% of resp) │ Converted: 7 (30%) │
│                            │                    │
│ 🔴 Underperforming         │ 🟢 WINNER         │
└────────────────────────────┴───────────────────┘

Statistical Significance: ✓ Yes (p=0.03)
Recommendation: Use Variant B for future campaigns
```

---

## Related Use Cases

- [03-internal-hiring.md](./03-internal-hiring.md) - Converting campaign leads to candidates
- [04-onboard-employee.md](./04-onboard-employee.md) - After successful hire from campaign
- [01-daily-workflow.md](./01-daily-workflow.md) - Daily campaign management tasks

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Create campaign with all required fields | Campaign created successfully |
| TC-002 | Create campaign without target skills | Error: "At least one skill is required" |
| TC-003 | Enable A/B test with 2 variants | Contacts split 50/50 between variants |
| TC-004 | Launch campaign without contacts | Warning shown, campaign saved as draft |
| TC-005 | Import 100 contacts via CSV | All contacts imported, variants assigned |
| TC-006 | LinkedIn integration adds contact | Contact added to campaign, ready to send |
| TC-007 | Convert campaign response to candidate | Candidate profile created, associated with job |
| TC-008 | Pause active campaign | All pending sends stopped |
| TC-009 | Analytics show A/B winner | Statistical significance calculated correctly |
| TC-010 | Email bounce rate >10% | Warning shown, campaign paused |

---

## Success Metrics

Campaign is successful when:
1. ✅ Response rate meets or exceeds target (15%+)
2. ✅ Conversion rate 10%+ of responders
3. ✅ Bounce rate < 5%
4. ✅ Spam complaints < 0.1%
5. ✅ A/B test yields clear winner (p < 0.05)
6. ✅ Cost per conversion < $100
7. ✅ Quality candidates added to pipeline (4+ rating from hiring manager)

---

*Last Updated: 2024-11-30*
