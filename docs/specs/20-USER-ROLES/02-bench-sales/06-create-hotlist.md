# Use Case: Create and Distribute Hotlist

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-003 |
| Actor | Bench Sales Recruiter |
| Goal | Create and distribute a marketing hotlist of available bench consultants to generate client opportunities |
| Frequency | 2 times per week (typically Tuesday and Thursday) |
| Estimated Time | 20-30 minutes per hotlist |
| Priority | HIGH (Core marketing activity) |
| Business Impact | Primary lead generation for bench placements, vendor relationship building, bench utilization reduction |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter
2. At least 1 consultant exists on bench with complete profile
3. Consultant resumes are current (updated within last 30 days)
4. Consultant has confirmed availability (contacted within last 5 days)
5. Vendor contact list exists with at least 1 recipient
6. User has "hotlist.create" permission (default for Bench Sales role)
7. Consultants have work authorization valid for >90 days

---

## Trigger

One of the following:
- Weekly marketing schedule (e.g., Tuesday 9:00 AM, Thursday 2:00 PM)
- Manager requests hotlist creation
- New consultants added to bench (3+ new consultants)
- Vendor specifically requests available talent list
- Consultant reaching 30 days on bench (priority marketing)
- End of month push (quarterly goal deadline)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Hotlist Builder

**User Action:** Click "+ New" → "Hotlist" OR navigate to `/employee/workspace/bench/hotlists/new`

**System Response:**
- Hotlist Builder page loads (500ms)
- Step 1 (Details) form appears
- Title field is auto-focused
- Current date pre-fills in title template

**URL:** `/employee/workspace/bench/hotlists/new`

**Screen State:**
```
+------------------------------------------------------------------+
|  ← Back to Hotlists         Create Marketing Hotlist [Save Draft]|
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Consultants] [Step 3: Review & Send] |
+------------------------------------------------------------------+
|                                                                   |
| Hotlist Details                                                   |
+------------------------------------------------------------------+
| Title: *                                                          |
| [Available Consultants - Week of 12/2/2024             ] 0/100   |
|                                                                   |
| Description:                                                      |
| [Top IT consultants available immediately for contract roles]    |
| [                                                      ] 65/500   |
|                                                                   |
+------------------------------------------------------------------+
| Template Type: *                                                  |
| ● General Hotlist (All skills)                                   |
| ○ Skills-Focused (Specific technologies)                         |
| ○ Availability-Based (Immediate start only)                      |
| ○ Custom (Build from scratch)                                    |
|                                                                   |
+------------------------------------------------------------------+
| Target Audience: *                                                |
| ● All Vendors (42 contacts) - Recommended for weekly blast       |
| ○ Vendor Groups (Filter by industry/skills)                      |
| ○ Specific Accounts/Clients (Select from list)                   |
| ○ Custom Email List (Enter emails manually)                      |
|                                                                   |
+------------------------------------------------------------------+
| Hotlist Focus: (Optional - helps filter consultants)             |
| Target Skills:  [Java, .NET, React                         ▼]    |
| Target Roles:   [Developer, Engineer, Architect            ▼]    |
| Locations:      [Remote, DC Metro, NYC                     ▼]    |
| Visa Status:    [All, Citizen/GC Only, H1B Transfer Ready  ▼]    |
|                                                                   |
+------------------------------------------------------------------+
| Validity & Expiration:                                            |
| Hotlist valid for: [14   ] days from send date                   |
| (Recommended: 14 days. Shorter for urgent, longer for general)   |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Next: Select →]    |
+------------------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Fill Hotlist Details

**User Action:** Enter title, description, and select template type

**Field Specification: Title**
| Property | Value |
|----------|-------|
| Field Name | `title` |
| Type | Text Input |
| Label | "Title" |
| Required | Yes |
| Min Length | 10 characters |
| Max Length | 100 characters |
| Default | "Available Consultants - Week of {current_date}" |
| Validation | Must contain at least 10 chars |
| Character Counter | Shows "X/100" |
| Error Message | "Title must be at least 10 characters" |

**Common Title Patterns:**
- "Available Java & .NET Developers - Week of 12/2"
- "Immediate Start: Full Stack Engineers"
- "Urgent: Senior Consultants on Bench - December"
- "Top React & Node Developers Available Now"
- "Cleared Professionals: Active Security Clearances"

**Field Specification: Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Textarea |
| Label | "Description" |
| Required | No |
| Max Length | 500 characters |
| Rows | 3 |
| Placeholder | "Brief description of consultants in this hotlist" |
| Character Counter | Shows "X/500" |

**Field Specification: Template Type**
| Property | Value |
|----------|-------|
| Field Name | `templateType` |
| Type | Radio Button Group |
| Label | "Template Type" |
| Required | Yes |
| Options | |
| - `general` | "General Hotlist (All skills)" |
| - `skills_focused` | "Skills-Focused (Specific technologies)" |
| - `availability` | "Availability-Based (Immediate start only)" |
| - `custom` | "Custom (Build from scratch)" |
| Default | `general` |
| Impact | Affects consultant filtering and document layout |

**Field Specification: Target Audience**
| Property | Value |
|----------|-------|
| Field Name | `targetAudience` |
| Type | Radio Button Group |
| Label | "Target Audience" |
| Required | Yes |
| Options | See below |
| Default | `all_vendors` |

**Target Audience Options:**

| Value | Label | Description | Recipient Count |
|-------|-------|-------------|----------------|
| `all_vendors` | "All Vendors" | All vendor contacts in system | 42 contacts |
| `vendor_groups` | "Vendor Groups" | Filter by industry, skills focus | Variable |
| `specific_accounts` | "Specific Accounts/Clients" | Hand-pick accounts | Variable |
| `custom_list` | "Custom Email List" | Manually enter emails | Variable |

**Field Specification: Target Skills**
| Property | Value |
|----------|-------|
| Field Name | `targetSkills` |
| Type | Multi-select Dropdown |
| Label | "Target Skills" |
| Required | No |
| Max Selections | 10 |
| Options | All skills from `skills` table |
| Purpose | Auto-filters consultants by these skills |
| Display Format | Tag chips |

**Field Specification: Validity Period**
| Property | Value |
|----------|-------|
| Field Name | `validityDays` |
| Type | Number Input |
| Label | "Hotlist valid for" |
| Suffix | "days from send date" |
| Required | Yes |
| Default | 14 |
| Min | 3 |
| Max | 30 |
| Validation | Must be between 3 and 30 |
| Error Message | "Validity must be between 3 and 30 days" |

**User Action:** Fill all fields, click "Next: Select →"

**System Response:**
- Validates all required fields
- Shows error messages if validation fails
- If valid, transitions to Step 2 with slide animation (300ms)
- Auto-filters consultants based on target skills (if specified)

**Time:** ~2 minutes

---

### Step 3: Select Consultants for Hotlist

**User Action:** Review available consultants and select 8-20 for hotlist

**Screen State:**
```
+------------------------------------------------------------------+
|  ← Back to Details           Select Consultants    [Save Draft]  |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Consultants] [Step 3: Review & Send] |
+------------------------------------------------------------------+
|                                                                   |
| Select Consultants                        Selected: 0/20 max     |
+------------------------------------------------------------------+
| Filters Applied:                                                  |
| Skills: [Java ×] [.NET ×]                    [Clear All Filters] |
+------------------------------------------------------------------+
| View: [All (34)] [My Consultants (12)] [Priority (8)] [Skills (18)]|
| Sort: [Days on Bench ▼] [Skills Match] [Rate] [Recent Update]   |
+------------------------------------------------------------------+
| ☐ Select All Visible (18 consultants)                [Deselect]  |
+------------------------------------------------------------------+
|                                                                   |
| Priority Consultants (30+ days on bench)                          |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☑ Rajesh Kumar                               42 days | 🟠     │ |
| │ Java Developer | $85/hr | H1B Valid 2026 | Remote/DC         │ |
| │ Skills: Java, Spring Boot, AWS, Microservices (8/10 match)    │ |
| │ Last project: Meta (3 years) | Available: Immediate           │ |
| │ ⚠ HIGH PRIORITY: 42 days on bench - Needs urgent placement   │ |
| │                                                                │ |
| │ [View Full Profile] [Preview Marketing Profile] [Chat Log]    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☑ Sarah Johnson                              38 days | 🟠     │ |
| │ .NET Developer | $90/hr | Citizen | Remote                   │ |
| │ Skills: .NET, C#, Azure, SQL Server (6/10 match)              │ |
| │ Last project: Amazon (2 years) | Available: Immediate         │ |
| │ ⚠ HIGH PRIORITY: 38 days on bench                            │ |
| │                                                                │ |
| │ [View Full Profile] [Preview Marketing Profile] [Chat Log]    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☐ John Smith                                 35 days | 🟠     │ |
| │ Full Stack Developer | $95/hr | Green Card | Remote          │ |
| │ Skills: Java, Spring, React, Node, AWS, Docker (9/10 match)   │ |
| │ Last project: Google (18 months) | Available: 12/10 (1 week) │ |
| │ ⚠ HIGH PRIORITY: 35 days on bench                            │ |
| │ ⚠ Note: Available 12/10 (not immediate)                      │ |
| │ [View Full Profile] [Preview Marketing Profile] [Chat Log]    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
|                                                                   |
| Active Consultants (15-29 days on bench)                          |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☑ Priya Sharma                               22 days | 🟡     │ |
| │ React Developer | $100/hr | H1B Valid 2025 | Remote/Bay Area │ |
| │ Skills: React, TypeScript, Node, GraphQL, AWS (7/10 match)    │ |
| │ Last project: Netflix (2 years) | Available: Immediate        │ |
| │ ✓ Strong match: Front-end focused vendors                    │ |
| │ [View Full Profile] [Preview Marketing Profile] [Chat Log]    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☑ David Chen                                 18 days | 🟡     │ |
| │ DevOps Engineer | $95/hr | Citizen | Remote                  │ |
| │ Skills: AWS, Docker, Kubernetes, Java, Python (5/10 match)    │ |
| │ Last project: Airbnb (1 year) | Available: Immediate          │ |
| │ ✓ High demand: DevOps skills in demand                       │ |
| │ [View Full Profile] [Preview Marketing Profile] [Chat Log]    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
|                                                                   |
| Recent Consultants (1-14 days on bench)                           |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ☑ Maria Garcia                               12 days | 🟢     │ |
| │ QA Automation Engineer | $85/hr | GC | Remote                │ |
| │ Skills: Selenium, Java, TestNG, CI/CD (4/10 match)            │ |
| │ Last project: Uber (6 months) | Available: Immediate          │ |
| │ ℹ Fresh on bench: Good candidate for quick placement         │ |
| │ [View Full Profile] [Preview Marketing Profile] [Chat Log]    │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ... 12 more consultants (scroll for more) ...                    |
+------------------------------------------------------------------+
|                                                                   |
| ⚠ Ineligible Consultants (Cannot include in hotlist)             |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ⊘ Ahmed Ali                                  45 days | 🔴     │ |
| │ Data Analyst | $80/hr | H1B Expires 03/2025 (85 days)        │ |
| │ ⚠ CANNOT INCLUDE: Visa expires in <90 days                   │ |
| │ Action required: Contact HR for visa extension                │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ⊘ Wei Zhang                                  62 days | 🔴     │ |
| │ Cloud Architect | $110/hr | H1B Valid 2026 | Remote           │ |
| │ ⚠ CANNOT INCLUDE: No contact in 12 days (unresponsive)       │ |
| │ Action required: Contact consultant to confirm availability   │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
|                                                                   |
| Selection Summary:                                                |
| • 6 selected (2 Priority, 2 Active, 2 Recent)                    |
| • Recommended: 8-20 consultants per hotlist                      |
| • Diversity: ✓ Skills, ✓ Experience, ✓ Visa Status              |
|                                                                   |
+------------------------------------------------------------------+
|                               [← Back]  [Next: Customize →]      |
+------------------------------------------------------------------+
```

**Selection Strategy (Best Practices):**

**Priority Order:**
1. **Orange/Red consultants first** (31+ days on bench) - Urgent placement needed
2. **Skills match** to target audience and job market demand
3. **Complete profiles** (resume updated <30 days, skills current, rate set)
4. **Responsive consultants** (contacted within last 5 days)
5. **Diverse skillsets** (variety to appeal to different vendors)
6. **Mix of visa statuses** (Citizen, Green Card, H1B transfer-ready)
7. **Mix of experience levels** (Junior, Mid, Senior, Architect)

**Selection Limits:**
- **Minimum:** 1 consultant (for targeted/urgent hotlists)
- **Maximum:** 20 consultants (avoid overwhelming vendors)
- **Recommended:** 8-12 consultants (sweet spot for engagement)

**Consultant Eligibility Rules:**

| Eligible ✅ | Ineligible ❌ |
|------------|--------------|
| On bench ≥7 days | On bench <7 days (too fresh) |
| Profile complete | Profile incomplete (missing resume/skills) |
| Contacted within 5 days | No contact in >10 days (unresponsive) |
| Visa valid >90 days | Visa expires <90 days |
| Available within 14 days | Not available for >14 days |
| Resume updated <30 days | Resume outdated >30 days |
| Not on hotlist in last 3 days | Already on recent hotlist |

**Field Specification: Consultant Selection**
| Property | Value |
|----------|-------|
| Field Name | `consultantIds` |
| Type | Multi-select Checkbox List |
| Label | "Select Consultants" |
| Required | Yes |
| Min Selections | 1 |
| Max Selections | 20 |
| Default | None (user must select) |
| Validation | Must select at least 1 consultant |
| Error Message | "Please select at least 1 consultant (max 20)" |
| Display | Card-based list with details |

**User Action:**
1. Review priority consultants (30+ days on bench)
2. Select 2-3 priority consultants (orange/red)
3. Select 2-3 active consultants (yellow)
4. Select 2-3 recent consultants (green)
5. Ensure diversity: skills, visa status, experience
6. Click checkboxes to select (6-8 consultants total)

**System Response:**
- Checkbox checks on click
- Selected count updates: "Selected: 6/20"
- Selected consultants highlighted with subtle background
- Selection summary updates at bottom
- Can preview individual marketing profiles (optional)

**Time:** ~5 minutes

---

### Step 4: Preview and Customize Consultant Profiles

**User Action:** Click "Preview Marketing Profile" on a high-priority consultant

**Modal Opens:**
```
+------------------------------------------------------------------+
|              Marketing Profile Preview: Rajesh Kumar         [×] |
+------------------------------------------------------------------+
| This is how Rajesh will appear in the hotlist document.          |
| You can customize this profile for marketing purposes.           |
+------------------------------------------------------------------+
|                                                                   |
| RAJESH KUMAR                                    [Edit Profile]   |
| Java Developer                                                    |
+------------------------------------------------------------------+
| Experience:     10+ years                                         |
| Location:       Washington, DC Metro (Open to remote)            |
| Rate:           $85/hr                                            |
| Availability:   Immediate                                         |
| Work Auth:      H1B (valid through March 2026)                   |
|                                                                   |
| KEY SKILLS:                                                       |
| • Java, Spring Boot, Microservices Architecture                  |
| • AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes                 |
| • REST APIs, GraphQL, gRPC                                       |
| • MySQL, PostgreSQL, MongoDB, Redis                              |
| • CI/CD: Jenkins, GitLab CI, GitHub Actions                      |
|                                                                   |
| RECENT PROJECT:                                                   |
| Meta Platforms (3 years, 2021-2024)                              |
| Backend Services Engineer                                         |
| • Built scalable microservices handling 10M+ requests/day        |
| • Migrated legacy monolith to microservices (15 services)        |
| • Led team of 4 backend developers                               |
| • Reduced API response time by 40% through optimization          |
| • Tech stack: Java 17, Spring Boot, AWS, Kafka, PostgreSQL       |
|                                                                   |
| PREVIOUS EXPERIENCE:                                              |
| • Accenture - Senior Java Developer (2 years)                    |
| • Cognizant - Java Developer (2 years)                           |
| • Infosys - Associate Developer (2 years)                        |
|                                                                   |
| CERTIFICATIONS:                                                   |
| • AWS Certified Solutions Architect - Associate (2023)           |
| • Spring Professional Certification (2022)                        |
| • Oracle Certified Java Programmer (2020)                        |
|                                                                   |
| EDUCATION:                                                        |
| Master of Science in Computer Science                             |
| University of Maryland, College Park (2012)                       |
|                                                                   |
+------------------------------------------------------------------+
| Resume Attachment:                                                |
| ☑ Include resume with hotlist                                    |
| Resume: [Rajesh_Kumar_Java_Developer_2024.pdf (485 KB)    ▼]    |
|                                                                   |
| Marketing Customizations: (Optional)                              |
| ☐ Hide hourly rate (show as "Competitive" instead)              |
| ☐ Customize headline: [_____________________________]            |
| ☐ Highlight specific skills: [AWS, Microservices       ]         |
| ☑ Include certifications                                         |
| ☑ Include education                                              |
|                                                                   |
+------------------------------------------------------------------+
| AI Enhancement: (Powered by Claude)                               |
| [✨ Use AI to Enhance Profile]                                   |
| Generates compelling bullet points and highlights achievements    |
|                                                                   |
+------------------------------------------------------------------+
|                              [Cancel]  [Save Changes] [Close]    |
+------------------------------------------------------------------+
```

**AI Enhancement Feature:**

When user clicks "✨ Use AI to Enhance Profile", system:
1. Sends consultant data to AI (Claude API)
2. AI generates:
   - Compelling headline (e.g., "Senior Java Engineer with Meta Experience - Microservices Expert")
   - Achievement-focused bullet points
   - Skills grouped by category
   - Quantified accomplishments
3. User reviews AI suggestions
4. User accepts or edits suggestions
5. Profile updated

**Example AI-Enhanced Output:**
```
HEADLINE: "Senior Java Engineer | 10+ Years | Meta, Accenture | AWS Certified | Immediate Start"

HIGHLIGHTED ACHIEVEMENTS:
• Architected and deployed 15 microservices handling 10M+ daily requests at Meta
• Led cross-functional team of 4 engineers, delivering on-time for 12 consecutive sprints
• Reduced API latency by 40% through database optimization and caching strategies
• Expert in cloud-native development: AWS, Docker, Kubernetes (3+ years production)
```

**User Action:**
1. Review profile
2. Optionally click "Use AI to Enhance" (adds 10 seconds)
3. Optionally customize settings (hide rate, etc.)
4. Click "Save Changes"

**System Response:**
- Profile updates saved to hotlist (not master profile)
- Modal closes
- Returns to consultant selection screen
- Green checkmark appears on consultant card: "✓ Profile customized"

**Time:** ~2 minutes per consultant (optional, can skip and use defaults)

**User Action (After Customizing):** Click "Next: Customize →"

**System Response:**
- Validates at least 1 consultant selected
- Transitions to Step 3 with slide animation (300ms)

---

### Step 5: Configure Hotlist Format and Generation

**Screen State:**
```
+------------------------------------------------------------------+
|  ← Back to Selection     Customize Hotlist Format   [Save Draft] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Consultants] [Step 3: Review & Send] |
+------------------------------------------------------------------+
|                                                                   |
| Document Format & Layout                                          |
+------------------------------------------------------------------+
| Output Format: *                                                  |
| ● PDF (Recommended - Professional, attachment-friendly)          |
| ○ HTML Email (Embedded in email body)                            |
| ○ Excel Spreadsheet (Vendor-friendly, easy to filter)            |
| ○ All Formats (PDF + HTML + Excel)                               |
|                                                                   |
+------------------------------------------------------------------+
| Document Options:                                                 |
| ☑ Include InTime branding and logo                               |
| ☑ Include recruiter contact information                          |
| ☑ Include consultant resumes as attachments (zip file)           |
| ☐ Password protect PDF (requires vendor to request password)     |
| ☑ Include disclaimer and confidentiality notice                  |
| ☐ Customize footer text: [________________________________]       |
|                                                                   |
+------------------------------------------------------------------+
| Consultant Profile Layout: *                                      |
| ● Standard (1 consultant per page - detailed)                    |
| ○ Compact (2 consultants per page - concise)                     |
| ○ List View (All on one page - summary only)                     |
|                                                                   |
| Profile Sections to Include:                                      |
| ☑ Skills                                                         |
| ☑ Recent project/experience                                      |
| ☑ Certifications                                                 |
| ☑ Education                                                      |
| ☐ Full work history (5+ pages per consultant)                   |
|                                                                   |
+------------------------------------------------------------------+
| Sorting & Grouping:                                               |
| Sort consultants by: [Days on Bench (High to Low)         ▼]     |
| Options: Days on Bench, Skills Match, Rate, Experience           |
|                                                                   |
| Group by: [None (Single list)                             ▼]     |
| Options: None, Skills, Experience Level, Location, Visa Status   |
|                                                                   |
+------------------------------------------------------------------+
| International Localization: (Optional)                            |
| Language: [English                                         ▼]     |
| Currency Display: [USD ($)                                 ▼]     |
| Date Format: [MM/DD/YYYY                                   ▼]     |
| Timezone: [Eastern Time (ET)                               ▼]     |
|                                                                   |
| ☐ Include GDPR opt-out language (for EU vendors)                |
| ☐ Convert rates to target currency: [EUR €                ▼]     |
|                                                                   |
+------------------------------------------------------------------+
| Branding Customization:                                           |
| Header Color: [#2D5016 (InTime Green)                     🎨]    |
| Accent Color: [#E07A5F (InTime Rust)                      🎨]    |
|                                                                   |
| Company Logo:                                                     |
| ● Use InTime default logo                                        |
| ○ Upload custom logo: [Choose File]                              |
|                                                                   |
+------------------------------------------------------------------+
|                         [← Back]  [Generate Preview →]           |
+------------------------------------------------------------------+
```

**Field Specification: Output Format**
| Property | Value |
|----------|-------|
| Field Name | `outputFormat` |
| Type | Radio Button Group |
| Label | "Output Format" |
| Required | Yes |
| Options | |
| - `pdf` | "PDF" (Most common) |
| - `html` | "HTML Email" |
| - `excel` | "Excel Spreadsheet" |
| - `all` | "All Formats" |
| Default | `pdf` |
| File Extensions | .pdf, .html, .xlsx |

**Field Specification: Document Options**
| Property | Value |
|----------|-------|
| Field Name | Various checkboxes |
| Type | Checkbox Group |
| Label | "Document Options" |
| Required | No |
| Defaults | Branding: ✓, Contact: ✓, Resumes: ✓, Disclaimer: ✓ |

**Field Specification: Profile Layout**
| Property | Value |
|----------|-------|
| Field Name | `profileLayout` |
| Type | Radio Button Group |
| Label | "Consultant Profile Layout" |
| Required | Yes |
| Options | |
| - `standard` | "Standard (1 per page)" |
| - `compact` | "Compact (2 per page)" |
| - `list` | "List View (All on one page)" |
| Default | `standard` |
| Page Impact | Standard: 6 consultants = 7 pages (cover + 6) |
| | Compact: 6 consultants = 4 pages (cover + 3) |
| | List: 6 consultants = 2 pages (cover + 1) |

**User Action:**
1. Select output format (PDF is default)
2. Check/uncheck document options
3. Select profile layout (Standard is default)
4. Select which profile sections to include
5. Choose sort order (Days on Bench is default)
6. Optionally set grouping (None is default)
7. Click "Generate Preview →"

**System Response:**
- Validates selections
- Shows loading spinner (10-15 seconds)
- Generates PDF hotlist document
- Preview modal opens

**Time:** ~2 minutes selection + 10-15 seconds generation

---

### Step 6: Preview Generated Hotlist Document

**Modal Opens (PDF Preview):**
```
+------------------------------------------------------------------+
|                    Hotlist Document Preview                  [×] |
+------------------------------------------------------------------+
| [Page 1 of 7]              [◀ Prev] [▶ Next]         [Download]  |
+------------------------------------------------------------------+
|                                                                   |
|           ╔═══════════════════════════════════════════╗          |
|           ║                                           ║          |
|           ║         [InTime Logo]                     ║          |
|           ║                                           ║          |
|           ║         INTIME STAFFING                   ║          |
|           ║    Available IT Consultants               ║          |
|           ║                                           ║          |
|           ║    Java & .NET Developers                 ║          |
|           ║    Week of December 2, 2024               ║          |
|           ║                                           ║          |
|           ╚═══════════════════════════════════════════╝          |
|                                                                   |
|    6 Top Consultants Available Immediately                       |
|    All cleared for C2C or W2 contracts                           |
|    Skills: Java, .NET, React, DevOps, QA                         |
|                                                                   |
|    Contact Information:                                          |
|    Name:   [Your Name], Bench Sales Recruiter                    |
|    Email:  [your.email@intime.com]                               |
|    Phone:  [555-123-4567]                                        |
|    Office: [Main Office: 555-999-0000]                           |
|                                                                   |
|    Valid through: December 16, 2024 (14 days)                    |
|                                                                   |
|    Consultants in this hotlist:                                  |
|    1. Rajesh Kumar - Java Developer (42 days bench)              |
|    2. Sarah Johnson - .NET Developer (38 days bench)             |
|    3. Priya Sharma - React Developer (22 days bench)             |
|    4. David Chen - DevOps Engineer (18 days bench)               |
|    5. Maria Garcia - QA Automation (12 days bench)               |
|    6. John Smith - Full Stack Developer (35 days bench)          |
|                                                                   |
|    ───────────────────────────────────────────────────────       |
|    © 2024 InTime Staffing. Confidential and Proprietary.         |
|    [Page 1 of 7]                                                  |
|                                                                   |
+------------------------------------------------------------------+
|             [◀ Prev Page]  [▶ Next: Rajesh Kumar]                |
+------------------------------------------------------------------+
```

**Page 2 Preview (Consultant Detail - Standard Layout):**
```
+------------------------------------------------------------------+
|                                                                   |
|    RAJESH KUMAR                                [InTime Logo]     |
|    Java Developer                                                 |
|    ───────────────────────────────────────────────────────       |
|                                                                   |
|    PROFILE SUMMARY                                                |
|    Experience:       10+ years                                    |
|    Location:         Washington, DC Metro (Open to remote)       |
|    Rate:             $85/hr (Negotiable)                         |
|    Availability:     Immediate                                    |
|    Work Authorization: H1B (Valid through March 2026)            |
|    Days on Bench:    42 days (Available since Oct 22, 2024)      |
|                                                                   |
|    KEY SKILLS                                                     |
|    • Java (10+ years), Spring Boot, Microservices Architecture   |
|    • AWS Cloud: EC2, S3, Lambda, RDS, CloudFormation             |
|    • Containers & Orchestration: Docker, Kubernetes              |
|    • APIs: REST, GraphQL, gRPC                                   |
|    • Databases: MySQL, PostgreSQL, MongoDB, Redis                |
|    • DevOps: Jenkins, GitLab CI, GitHub Actions, Terraform       |
|                                                                   |
|    RECENT PROJECT EXPERIENCE                                      |
|    Meta Platforms (3 years, 2021-2024)                           |
|    Backend Services Engineer                                      |
|    • Architected and deployed 15 microservices processing        |
|      10M+ requests/day with 99.9% uptime                         |
|    • Migrated legacy monolith (500K+ LOC) to microservices       |
|      architecture, reducing deployment time by 70%               |
|    • Led team of 4 backend engineers across 3 scrum teams        |
|    • Optimized database queries, reducing API response time      |
|      from 200ms to 120ms (40% improvement)                       |
|    • Tech Stack: Java 17, Spring Boot, AWS, Kafka, PostgreSQL   |
|                                                                   |
|    CERTIFICATIONS                                                 |
|    • AWS Certified Solutions Architect - Associate (2023)        |
|    • Spring Professional Certification (2022)                    |
|    • Oracle Certified Java Programmer (2020)                     |
|                                                                   |
|    EDUCATION                                                      |
|    Master of Science in Computer Science                          |
|    University of Maryland, College Park (2012)                    |
|                                                                   |
|    ───────────────────────────────────────────────────────       |
|    Resume attached | Contact: [your.email@intime.com]           |
|    Page 2 of 7                                                    |
+------------------------------------------------------------------+
```

**Navigation Controls:**
- **Prev/Next buttons**: Navigate between pages
- **Page indicator**: Shows "Page X of Y"
- **Download button**: Downloads PDF immediately
- **Zoom controls** (optional): 100%, 125%, 150%

**User Action:**
1. Review cover page (Page 1)
2. Click "Next" to review consultant pages (Pages 2-7)
3. Verify:
   - Contact info is correct
   - Consultant details are accurate
   - Formatting looks professional
   - No typos or errors
4. If satisfied, click "Looks Good, Continue →"
5. If changes needed, click "← Back" to edit

**System Response:**
- If "Looks Good": Saves PDF to file storage, proceeds to distribution
- If "Back": Returns to format configuration screen

**Common Issues Check:**
- ✅ All consultant names spelled correctly
- ✅ Rates are current and approved
- ✅ Skills match resume
- ✅ Work authorization is accurate
- ✅ Contact information is correct
- ✅ Expiration date is correct (today + validity days)
- ✅ No placeholder text (e.g., "[Name]", "[Rate]")

**Time:** ~1-2 minutes review

**User Action:** Click "Looks Good, Continue →"

**System Response:**
- PDF saved to file storage (`/hotlists/2024-12-02_java-net-developers.pdf`)
- If resumes included: Zip file created (`/hotlists/2024-12-02_resumes.zip`)
- Transitions to distribution configuration screen

---

### Step 7: Configure Distribution Settings

**Screen State:**
```
+------------------------------------------------------------------+
|  ← Back to Preview         Distribution Settings    [Save Draft] |
+------------------------------------------------------------------+
| [Step 1: Details] [Step 2: Consultants] [Step 3: Review & Send] |
+------------------------------------------------------------------+
|                                                                   |
| Send Hotlist: "Java & .NET Developers - Week of 12/2"            |
| Document: hotlist_2024-12-02.pdf (1.2 MB)                        |
| Consultants: 6 | Expires: 12/16/2024                              |
+------------------------------------------------------------------+
|                                                                   |
| Distribution Method: *                                            |
| ● Email                                                          |
| ○ Secure Link (vendors access via portal)                        |
| ○ Both (Email + Link)                                            |
|                                                                   |
+------------------------------------------------------------------+
| Send To: *                                                        |
| ● All Vendors (42 contacts)                                      |
|   ├─ TechStaff Solutions                                         |
|   ├─ ClearanceJobs                                               |
|   ├─ Robert Half Technology                                      |
|   ├─ Insight Global                                              |
|   ├─ TEKsystems                                                  |
|   └─ ... and 37 more vendors                                     |
|   [View Full List]                                               |
|                                                                   |
| ○ Vendor Groups (Filter by focus area)                           |
|   ┌─────────────────────────────────────────┐                   |
|   │ [×] Java-focused Vendors (12 contacts)  │                   |
|   │ [×] .NET-focused Vendors (8 contacts)   │                   |
|   │ [ ] Front-end Vendors (15 contacts)     │                   |
|   │ [ ] Government Contractors (10 contacts)│                   |
|   │ [ ] Healthcare IT Vendors (7 contacts)  │                   |
|   └─────────────────────────────────────────┘                   |
|                                                                   |
| ○ Specific Accounts (Hand-pick accounts)                         |
|   [Select accounts...                                     ▼]     |
|                                                                   |
| ○ Custom Email List                                              |
|   [Enter emails (comma or newline separated)...          ]       |
|   [                                                       ]       |
|                                                                   |
+------------------------------------------------------------------+
| Email Template: *                                                 |
| [Weekly Hotlist - All Vendors                             ▼]     |
|                                                                   |
| Templates:                                                        |
| • Weekly Hotlist - All Vendors (Default)                         |
| • Urgent Hotlist - Priority Consultants                          |
| • Skills-Focused Hotlist                                         |
| • Custom (Start from scratch)                                    |
|                                                                   |
+------------------------------------------------------------------+
| Subject Line: *                                                   |
| [InTime Hotlist: Java & .NET Developers Available - 12/2] 0/100  |
|                                                                   |
+------------------------------------------------------------------+
| Email Body: *                                                     |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Hi {{vendor_contact_name}},                                  │ |
| │                                                              │ |
| │ I hope this email finds you well. Please find attached our  │ |
| │ latest hotlist of immediately available IT consultants.     │ |
| │                                                              │ |
| │ Featured this week:                                          │ |
| │ • 2 Senior Java Developers (8-10 years experience)          │ |
| │ • 1 .NET Developer (5 years C#/Azure experience)            │ |
| │ • 1 Full Stack Engineer (Java + React)                      │ |
| │ • 1 DevOps Engineer (AWS/Kubernetes expert)                 │ |
| │ • 1 QA Automation Engineer (Selenium/Java)                  │ |
| │                                                              │ |
| │ All consultants are:                                         │ |
| │ ✓ Immediately available (or within 1 week)                  │ |
| │ ✓ US work authorized (Citizens, Green Cards, H1B transfers) │ |
| │ ✓ Open to C2C or W2 contracts                               │ |
| │ ✓ Flexible on location (Remote/Hybrid/Onsite)               │ |
| │                                                              │ |
| │ Rates range from $85-100/hr. All rates are negotiable based │ |
| │ on project scope and duration.                               │ |
| │                                                              │ |
| │ If any of these profiles match your current requirements,   │ |
| │ please let me know and I'll send additional details,        │ |
| │ references, and schedule interviews.                         │ |
| │                                                              │ |
| │ This hotlist is valid through December 16, 2024.            │ |
| │                                                              │ |
| │ Looking forward to hearing from you!                         │ |
| │                                                              │ |
| │ Best regards,                                                │ |
| │ {{your_signature}}                                           │ |
| └──────────────────────────────────────────────────────────────┘ |
| [                                                      ] 1240/2000|
|                                                                   |
+------------------------------------------------------------------+
| Attachments:                                                      |
| ✓ hotlist_2024-12-02.pdf (1.2 MB)                                |
| ☑ Include consultant resumes (zip, 4.8 MB)                       |
|   Warning: Total size = 6.0 MB (Some email systems limit 10 MB) |
|                                                                   |
+------------------------------------------------------------------+
| Tracking & Engagement:                                            |
| ☑ Track email opens (via pixel)                                  |
| ☑ Track PDF downloads                                            |
| ☑ Track link clicks                                              |
| ☑ Request acknowledgment/response                                |
| ☐ Send read receipt                                              |
|                                                                   |
+------------------------------------------------------------------+
| Send Options:                                                     |
| ○ Send immediately                                               |
| ● Schedule send:                                                 |
|   Date: [12/02/2024 📅]  Time: [09:00 AM ▼]  Timezone: [ET ▼]  |
|                                                                   |
| ○ Save as draft (send later manually)                            |
|                                                                   |
+------------------------------------------------------------------+
| Follow-up Reminders: (Auto-create tasks)                         |
| ☑ Review engagement metrics in 2 days (12/4)                     |
| ☑ Follow up with non-openers in 5 days (12/7)                    |
| ☐ Send reminder hotlist in 7 days (12/9)                         |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Save Draft]  [Next: Send →]  |
+------------------------------------------------------------------+
```

**Template Variables (Auto-Replaced):**

| Variable | Replacement | Example |
|----------|-------------|---------|
| `{{vendor_name}}` | Vendor company name | "TechStaff Solutions" |
| `{{vendor_contact_name}}` | Contact first name | "John" |
| `{{vendor_contact_full_name}}` | Contact full name | "John Smith" |
| `{{your_name}}` | Your full name | "Jane Doe" |
| `{{your_email}}` | Your email | "jane.doe@intime.com" |
| `{{your_phone}}` | Your phone | "555-123-4567" |
| `{{your_signature}}` | Email signature from profile | Full signature block |
| `{{consultant_count}}` | Number of consultants | "6" |
| `{{skills_list}}` | Comma-separated skills | "Java, .NET, React, DevOps" |
| `{{hotlist_title}}` | Hotlist title | "Java & .NET Developers" |
| `{{expires_date}}` | Expiry date | "December 16, 2024" |
| `{{today_date}}` | Today's date | "December 2, 2024" |

**Field Specification: Distribution Method**
| Property | Value |
|----------|-------|
| Field Name | `distributionMethod` |
| Type | Radio Button Group |
| Label | "Distribution Method" |
| Required | Yes |
| Options | `email`, `link`, `both` |
| Default | `email` |

**Field Specification: Send To**
| Property | Value |
|----------|-------|
| Field Name | `recipients` |
| Type | Radio + Multi-select |
| Label | "Send To" |
| Required | Yes |
| Validation | At least 1 recipient required |

**Field Specification: Email Template**
| Property | Value |
|----------|-------|
| Field Name | `emailTemplateId` |
| Type | Dropdown |
| Label | "Email Template" |
| Required | Yes |
| Options | Pre-defined templates from database |

**Field Specification: Subject Line**
| Property | Value |
|----------|-------|
| Field Name | `emailSubject` |
| Type | Text Input |
| Label | "Subject Line" |
| Required | Yes |
| Max Length | 100 characters |
| Character Counter | Shows "X/100" |
| Supports | Template variables |

**Field Specification: Email Body**
| Property | Value |
|----------|-------|
| Field Name | `emailBody` |
| Type | Textarea (Rich Text Optional) |
| Label | "Email Body" |
| Required | Yes |
| Min Length | 50 characters |
| Max Length | 2000 characters |
| Character Counter | Shows "X/2000" |
| Supports | Template variables, basic formatting |

**Field Specification: Tracking Options**
| Property | Value |
|----------|-------|
| Field Name | Various checkboxes |
| Type | Checkbox Group |
| Label | "Tracking & Engagement" |
| Required | No |
| Defaults | All checked (recommended) |

**Field Specification: Send Options**
| Property | Value |
|----------|-------|
| Field Name | `sendOption` + `scheduledAt` |
| Type | Radio + DateTime Picker |
| Label | "Send Options" |
| Required | Yes |
| Options | `immediate`, `scheduled`, `draft` |
| Default | `scheduled` with next optimal time |

**Optimal Send Times (Auto-Suggested):**
- **Tuesday:** 9:00 AM ET (vendors start week, high open rates)
- **Thursday:** 2:00 PM ET (mid-week follow-up window)
- Avoid: Monday mornings, Friday afternoons, weekends

**User Action:**
1. Review distribution method (Email is default)
2. Confirm recipients (All Vendors or select groups)
3. Review/edit email subject
4. Review/edit email body
5. Confirm attachments
6. Review tracking options (all checked by default)
7. Select send option (Schedule for Tuesday 9 AM recommended)
8. Check follow-up reminders
9. Click "Next: Send →"

**System Response:**
- Validates all required fields
- Shows error if subject too short (<10 chars)
- Shows error if body too short (<50 chars)
- Shows error if no recipients selected
- Shows warning if attachment size >10 MB
- If valid, proceeds to confirmation screen

**Time:** ~3-5 minutes

---

### Step 8: Review and Confirm Send

**Screen State:**
```
+------------------------------------------------------------------+
|                      Confirm Hotlist Send                    [×] |
+------------------------------------------------------------------+
| You are about to send this hotlist. Please review:               |
+------------------------------------------------------------------+
|                                                                   |
| Hotlist Summary                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Title: Java & .NET Developers - Week of 12/2                │ |
| │ Consultants: 6 selected                                      │ |
| │ Document: hotlist_2024-12-02.pdf (1.2 MB)                    │ |
| │ Expires: December 16, 2024 (14 days)                         │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| Distribution Details                                              |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Method: Email                                                │ |
| │ Recipients: 42 vendor contacts                               │ |
| │   • TechStaff Solutions (3 contacts)                         │ |
| │   • ClearanceJobs (2 contacts)                               │ |
| │   • Robert Half Technology (2 contacts)                      │ |
| │   • Insight Global (2 contacts)                              │ |
| │   • ... and 33 more contacts from 38 vendors                 │ |
| │                                                              │ |
| │ Subject: InTime Hotlist: Java & .NET Developers - 12/2      │ |
| │                                                              │ |
| │ Attachments:                                                 │ |
| │   • hotlist_2024-12-02.pdf (1.2 MB)                          │ |
| │   • consultant_resumes.zip (4.8 MB)                          │ |
| │   Total: 6.0 MB                                              │ |
| │                                                              │ |
| │ Scheduled: Tuesday, December 2, 2024 at 9:00 AM ET          │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| Consultant List                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 1. 🟠 Rajesh Kumar - Java Developer (42 days bench)          │ |
| │ 2. 🟠 Sarah Johnson - .NET Developer (38 days bench)         │ |
| │ 3. 🟠 John Smith - Full Stack Developer (35 days bench)      │ |
| │ 4. 🟡 Priya Sharma - React Developer (22 days bench)         │ |
| │ 5. 🟡 David Chen - DevOps Engineer (18 days bench)           │ |
| │ 6. 🟢 Maria Garcia - QA Automation (12 days bench)           │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| This action will:                                                 |
| ✓ Send 42 emails to vendor contacts                              |
| ✓ Create hotlist record in system                                |
| ✓ Update each consultant's "last marketed" timestamp             |
| ✓ Enable tracking (opens, downloads, link clicks)                |
| ✓ Create follow-up tasks:                                        |
|   • Review engagement metrics (12/4)                              |
|   • Follow up with non-openers (12/7)                             |
|                                                                   |
| ⚠ Important Notes:                                                |
| • Emails cannot be recalled once sent                            |
| • Scheduled send will occur at 9:00 AM ET on 12/2                |
| • You'll receive a confirmation when emails are sent             |
| • Engagement metrics will be available within 1 hour             |
|                                                                   |
+------------------------------------------------------------------+
|                    [← Go Back]  [✅ Confirm & Schedule Send]     |
+------------------------------------------------------------------+
```

**User Action:** Review all details, click "✅ Confirm & Schedule Send"

**System Response:**
1. Button shows loading spinner (500ms)
2. API call `POST /api/trpc/bench/hotlists.create`
3. Processing sequence begins

**Time:** ~1-2 minutes review

---

### Step 9: System Processing (Backend)

**Backend Processing Sequence (5-10 seconds):**

1. **Create Hotlist Record:**
   ```typescript
   const hotlist = await db.insert(benchHotlists).values({
     id: uuid(),
     orgId: currentOrgId,
     title: "Java & .NET Developers - Week of 12/2",
     description: "Top consultants available immediately",
     templateType: "general",
     targetAudience: "all_vendors",
     validityDays: 14,
     expiresAt: addDays(new Date(), 14),
     status: "scheduled",
     scheduledSendAt: new Date("2024-12-02T09:00:00-05:00"),
     createdBy: currentUserId,
     createdAt: new Date()
   }).returning();
   ```

2. **Associate Consultants with Hotlist:**
   ```typescript
   const consultantIds = [
     "raj-kumar-id",
     "sarah-johnson-id",
     "john-smith-id",
     "priya-sharma-id",
     "david-chen-id",
     "maria-garcia-id"
   ];

   for (const consultantId of consultantIds) {
     await db.insert(hotlistConsultants).values({
       hotlistId: hotlist.id,
       consultantId,
       includeResume: true,
       profileCustomizations: consultantCustomizations[consultantId],
       sortOrder: consultantIds.indexOf(consultantId)
     });
   }
   ```

3. **Upload Documents to Storage:**
   ```typescript
   // Upload PDF
   const pdfUrl = await uploadToStorage({
     file: pdfBuffer,
     path: `/hotlists/${hotlist.id}/hotlist_2024-12-02.pdf`,
     contentType: "application/pdf"
   });

   // Upload resume zip
   const zipUrl = await uploadToStorage({
     file: resumeZipBuffer,
     path: `/hotlists/${hotlist.id}/consultant_resumes.zip`,
     contentType: "application/zip"
   });

   // Update hotlist with document URLs
   await db.update(benchHotlists)
     .set({
       documentUrl: pdfUrl,
       resumeZipUrl: zipUrl,
       documentSize: pdfBuffer.length,
       resumeZipSize: resumeZipBuffer.length
     })
     .where(eq(benchHotlists.id, hotlist.id));
   ```

4. **Create Email Distribution Records:**
   ```typescript
   // Get all vendor contacts based on selection
   const vendorContacts = await db.query.vendorContacts.findMany({
     where: eq(vendorContacts.isActive, true)
   });

   for (const contact of vendorContacts) {
     await db.insert(hotlistDistributions).values({
       hotlistId: hotlist.id,
       recipientType: "vendor_contact",
       recipientId: contact.id,
       recipientEmail: contact.email,
       recipientName: contact.name,
       vendorId: contact.vendorId,
       status: "scheduled",
       scheduledSendAt: hotlist.scheduledSendAt,
       trackingEnabled: true,
       trackingPixelId: uuid() // For open tracking
     });
   }
   ```

5. **Update Consultant Metadata:**
   ```typescript
   for (const consultantId of consultantIds) {
     await db.update(benchConsultants)
       .set({
         lastMarketedAt: new Date(),
         hotlistSendCount: sql`hotlist_send_count + 1`,
         updatedAt: new Date()
       })
       .where(eq(benchConsultants.consultantId, consultantId));
   }
   ```

6. **Create Follow-up Tasks:**
   ```typescript
   // Task 1: Review engagement in 2 days
   await db.insert(activities).values({
     orgId: currentOrgId,
     entityType: "hotlist",
     entityId: hotlist.id,
     activityType: "task",
     title: "Review hotlist engagement metrics",
     description: `Check opens, downloads, and responses for hotlist: ${hotlist.title}`,
     dueDate: addDays(hotlist.scheduledSendAt, 2),
     priority: "medium",
     status: "pending",
     assignedTo: currentUserId,
     createdBy: currentUserId
   });

   // Task 2: Follow up with non-openers in 5 days
   await db.insert(activities).values({
     orgId: currentOrgId,
     entityType: "hotlist",
     entityId: hotlist.id,
     activityType: "task",
     title: "Follow up with vendors who didn't open hotlist",
     description: `Personal outreach to non-openers for: ${hotlist.title}`,
     dueDate: addDays(hotlist.scheduledSendAt, 5),
     priority: "low",
     status: "pending",
     assignedTo: currentUserId,
     createdBy: currentUserId
   });
   ```

7. **Schedule Email Send Job:**
   ```typescript
   // Queue email job for scheduled time
   await queueManager.schedule({
     jobType: "send_hotlist_emails",
     payload: {
       hotlistId: hotlist.id,
       sendAt: hotlist.scheduledSendAt
     },
     runAt: hotlist.scheduledSendAt
   });
   ```

8. **Log Activity:**
   ```typescript
   await db.insert(activityLog).values({
     orgId: currentOrgId,
     entityType: "hotlist",
     entityId: hotlist.id,
     activityType: "hotlist_created",
     description: `Hotlist created and scheduled: ${hotlist.title}`,
     metadata: {
       consultantCount: consultantIds.length,
       recipientCount: vendorContacts.length,
       scheduledSendAt: hotlist.scheduledSendAt,
       expiresAt: hotlist.expiresAt,
       documentSize: pdfBuffer.length,
       templateType: hotlist.templateType
     },
     createdBy: currentUserId,
     createdAt: new Date()
   });
   ```

9. **Send Success Notification:**
   ```typescript
   await sendNotification({
     userId: currentUserId,
     type: "hotlist_scheduled",
     title: "Hotlist Scheduled Successfully",
     message: `Your hotlist "${hotlist.title}" is scheduled to send to 42 vendors on 12/2 at 9:00 AM.`,
     link: `/employee/workspace/bench/hotlists/${hotlist.id}`
   });

   // Notify manager
   if (managerId) {
     await sendNotification({
       userId: managerId,
       type: "team_hotlist",
       title: "Team Hotlist Created",
       message: `${userName} created hotlist: "${hotlist.title}" with 6 consultants.`,
       link: `/employee/workspace/bench/hotlists/${hotlist.id}`
     });
   }
   ```

**Time:** ~5-10 seconds processing

---

### Step 10: View Success Confirmation

**Screen State (Success):**
```
+------------------------------------------------------------------+
|                                                                   |
|                    [Success animation - checkmark]                |
|                                                                   |
|          ┌─────────────────────────────────────────┐            |
|          │                                         │            |
|          │   ✅ HOTLIST SCHEDULED SUCCESSFULLY!   │            |
|          │                                         │            |
|          │  Your hotlist is ready to send!         │            |
|          │                                         │            |
|          │  📧 Scheduled: Tuesday, 12/2 at 9:00 AM │            |
|          │  👥 Recipients: 42 vendor contacts      │            |
|          │  📄 Consultants: 6                      │            |
|          │  📅 Valid through: 12/16/24             │            |
|          │                                         │            |
|          │  What happens next:                     │            |
|          │  • Emails will send automatically       │            |
|          │  • You'll receive confirmation          │            |
|          │  • Tracking starts immediately          │            |
|          │  • Tasks created for follow-up          │            |
|          │                                         │            |
|          └─────────────────────────────────────────┘            |
|                                                                   |
|         [View Hotlist Details]  [Create Another]                 |
|         [Back to Dashboard]                                      |
|                                                                   |
+------------------------------------------------------------------+
```

**User Action:** Click "View Hotlist Details" or "Back to Dashboard"

**System Response:**
- If "View Hotlist Details": Redirects to hotlist detail page
- If "Back to Dashboard": Redirects to bench dashboard
- If "Create Another": Resets form, starts new hotlist

**Time:** ~2 seconds

---

### Step 11: Email Send (Scheduled Time - Automated)

**When Scheduled Time Arrives (Tuesday 12/2 at 9:00 AM):**

1. **Email Send Job Executes:**
   ```typescript
   // Retrieve hotlist and all distributions
   const hotlist = await db.query.benchHotlists.findFirst({
     where: eq(benchHotlists.id, hotlistId),
     with: {
       consultants: true,
       distributions: true
     }
   });

   // Send emails in batches (prevent spam throttling)
   const batchSize = 10;
   for (let i = 0; i < hotlist.distributions.length; i += batchSize) {
     const batch = hotlist.distributions.slice(i, i + batchSize);

     await Promise.all(batch.map(async (dist) => {
       // Replace template variables
       const personalizedSubject = replaceVariables(
         emailSubject,
         dist.recipientName,
         dist.vendorName
       );
       const personalizedBody = replaceVariables(
         emailBody,
         dist.recipientName,
         dist.vendorName
       );

       // Send email
       const result = await sendEmail({
         to: dist.recipientEmail,
         from: currentUserEmail,
         subject: personalizedSubject,
         body: personalizedBody,
         attachments: [
           {
             filename: "hotlist_2024-12-02.pdf",
             url: hotlist.documentUrl
           },
           {
             filename: "consultant_resumes.zip",
             url: hotlist.resumeZipUrl
           }
         ],
         trackingPixelId: dist.trackingPixelId
       });

       // Update distribution status
       await db.update(hotlistDistributions)
         .set({
           status: result.success ? "sent" : "failed",
           sentAt: new Date(),
           errorMessage: result.error || null
         })
         .where(eq(hotlistDistributions.id, dist.id));
     }));

     // Wait 2 seconds between batches
     await sleep(2000);
   }

   // Update hotlist status
   await db.update(benchHotlists)
     .set({
       status: "sent",
       actualSentAt: new Date()
     })
     .where(eq(benchHotlists.id, hotlistId));
   ```

2. **Send Confirmation to Recruiter:**
   ```typescript
   await sendEmail({
     to: recruiterEmail,
     subject: "Hotlist Sent Successfully",
     body: `
       Your hotlist "${hotlist.title}" has been successfully sent to 42 vendors.

       Emails sent: 42/42
       Failed: 0
       Sent at: 9:00 AM ET

       Track engagement: ${appUrl}/employee/workspace/bench/hotlists/${hotlistId}
     `
   });
   ```

**Total Send Time:** ~1-2 minutes for 42 emails (batched)

---

### Step 12: Monitor Hotlist Engagement

**User navigates to hotlist detail page later that day:**

**URL:** `/employee/workspace/bench/hotlists/{id}`

**Screen State:**
```
+------------------------------------------------------------------+
| ← Back to Hotlists    Hotlist: Java & .NET Devs 12/2   [⋮ Actions]|
+------------------------------------------------------------------+
| Status: ✓ Sent                        Sent: 12/2/24 9:00 AM      |
| Expires: 12/16/24                     Consultants: 6             |
+------------------------------------------------------------------+
| [View Document] [Download PDF] [Resend to Selected] [Archive]   |
+------------------------------------------------------------------+
|                                                                   |
| Engagement Metrics                           Last updated: 5m ago |
+------------------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐  |
| │ Email Opens     │ │ PDF Downloads   │ │ Responses Received │  |
| │      28/42      │ │      15/42      │ │       3/42         │  |
| │      67%        │ │      36%        │ │       7%           │  |
| │                 │ │                 │ │                    │  |
| │ ✅ Excellent    │ │ ✅ Good         │ │ → Follow up        │  |
| └─────────────────┘ └─────────────────┘ └────────────────────┘  |
+------------------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌────────────────────┐  |
| │ Link Clicks     │ │ Avg Time Open   │ │ Bounced/Failed     │  |
| │      22/42      │ │   2m 15s        │ │       0/42         │  |
| │      52%        │ │                 │ │       0%           │  |
| │                 │ │                 │ │                    │  |
| │ ✅ Good         │ │ ℹ Good signal   │ │ ✅ Perfect         │  |
| └─────────────────┘ └─────────────────┘ └────────────────────┘  |
+------------------------------------------------------------------+
|                                                                   |
| Vendor Engagement Details                        [Export CSV]    |
+------------------------------------------------------------------+
| Filter: [All] [Opened] [Downloaded] [Responded] [Not Opened]    |
| Sort: [Engagement Score ▼]                                       |
+------------------------------------------------------------------+
| Vendor                    | Opened | Download | Responded | Last   |
|---------------------------|--------|----------|-----------|--------|
| TechStaff Solutions       |  ✅    |   ✅     |    ✅     | 2h ago |
|   Contact: Mike Johnson   | 9:15AM |  9:20AM  | Email     |        |
|   [View Response] [Follow Up]                                    |
+------------------------------------------------------------------+
| Insight Global            |  ✅    |   ✅     |    ✅     | 3h ago |
|   Contact: Sarah Chen     | 9:05AM |  9:10AM  | Phone     |        |
|   [View Response] [Follow Up]                                    |
+------------------------------------------------------------------+
| ClearanceJobs             |  ✅    |   ✅     |    -      | 4h ago |
|   Contact: David Lee      | 9:30AM |  9:35AM  |    -      |        |
|   [View Response] [Follow Up]                                    |
+------------------------------------------------------------------+
| Robert Half Technology    |  ✅    |   -      |    -      | 5h ago |
|   Contact: Emma Wilson    | 11:00AM|    -     |    -      |        |
|   [View Response] [Follow Up]                                    |
+------------------------------------------------------------------+
| TEKsystems                |  -     |   -      |    -      |   -    |
|   Contact: John Smith     |   -    |    -     |    -      |        |
|   ⚠ Not opened yet - Consider phone follow-up                   |
|   [View Response] [Follow Up]                                    |
+------------------------------------------------------------------+
| ... 37 more vendors ...                           [Load More]    |
+------------------------------------------------------------------+
|                                                                   |
| Responses & Conversations (3)                     [View All]      |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ TechStaff Solutions - Mike Johnson          📧 2 hours ago   │ |
| │ ──────────────────────────────────────────────────────────── │ |
| │ "Hi! Interested in Rajesh Kumar for Accenture role. Senior   │ |
| │ Java developer, 6-month contract in DC. Can you send full    │ |
| │ resume and confirm rate? Client wants to interview ASAP."    │ |
| │                                                              │ |
| │ Consultant Match: Rajesh Kumar (42 days bench) ✅            │ |
| │                                                              │ |
| │ [Reply via Email] [Create Submission] [Schedule Call]        │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ Insight Global - Sarah Chen                 📞 3 hours ago   │ |
| │ ──────────────────────────────────────────────────────────── │ |
| │ Called to discuss Sarah Johnson (.NET Developer). Client in  │ |
| │ Baltimore needs .NET/Azure engineer. Interview next week?    │ |
| │ Rate range: $90-95/hr. 3-month contract.                     │ |
| │                                                              │ |
| │ Consultant Match: Sarah Johnson (38 days bench) ✅           │ |
| │                                                              │ |
| │ [Log Call Notes] [Create Submission] [Send Availability]     │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────────┐ |
| │ CyberCoders - Alex Martinez                 📧 4 hours ago   │ |
| │ ──────────────────────────────────────────────────────────── │ |
| │ "Thanks for the hotlist. Will review and get back to you if  │ |
| │ any match our current openings. Great mix of skills!"        │ |
| │                                                              │ |
| │ Consultant Match: None yet                                   │ |
| │                                                              │ |
| │ [Reply] [Mark as Acknowledged] [Schedule Follow-up]          │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
|                                                                   |
| Consultant Performance                           [View Details]  |
+------------------------------------------------------------------+
| Which consultants generated the most interest?                    |
+------------------------------------------------------------------+
| Consultant          | Mentions | Interviews | Submissions | Status|
|---------------------|----------|------------|-------------|-------|
| Rajesh Kumar        |    5     |     2      |      1      | 🔥Hot |
| Sarah Johnson       |    4     |     1      |      1      | 🔥Hot |
| John Smith          |    2     |     0      |      0      | 👀    |
| Priya Sharma        |    1     |     0      |      0      | 👀    |
| David Chen          |    1     |     0      |      0      | 👀    |
| Maria Garcia        |    0     |     0      |      0      | -     |
+------------------------------------------------------------------+
```

**Engagement Metrics Explained:**

| Metric | Formula | Good Rate | Excellent Rate |
|--------|---------|-----------|----------------|
| Email Opens | Opens / Sent | >50% | >65% |
| PDF Downloads | Downloads / Opens | >40% | >55% |
| Link Clicks | Clicks / Opens | >30% | >50% |
| Responses | Replies / Sent | >5% | >10% |
| Conversions | Submissions / Sent | >3% | >8% |

**Engagement Score Calculation:**
```typescript
const engagementScore = (
  (opened ? 25 : 0) +
  (downloaded ? 25 : 0) +
  (clicked ? 20 : 0) +
  (responded ? 30 : 0)
) / 100; // 0-100 score
```

**Time:** Ongoing monitoring (check daily for first 5 days)

---

## Postconditions

1. ✅ Hotlist record created in `bench_hotlists` table
2. ✅ 6 consultant associations created in `hotlist_consultants` table
3. ✅ PDF document uploaded to file storage
4. ✅ Resume zip file uploaded to file storage
5. ✅ 42 email distribution records created in `hotlist_distributions` table
6. ✅ 42 emails sent successfully to vendor contacts
7. ✅ Consultant metadata updated:
   - `lastMarketedAt` timestamp set to send time
   - `hotlistSendCount` incremented by 1
8. ✅ Follow-up tasks created:
   - "Review engagement" task due in 2 days
   - "Follow up non-openers" task due in 5 days
9. ✅ Activity logged for audit trail
10. ✅ Notifications sent:
    - Recruiter: Hotlist sent confirmation
    - Manager: Team hotlist notification
11. ✅ Tracking enabled:
    - Email opens tracked
    - PDF downloads tracked
    - Link clicks tracked
12. ✅ Hotlist status = "sent"
13. ✅ Engagement metrics dashboard available
14. ✅ RCAI entry: Recruiter = Responsible + Accountable, Manager = Informed

---

## Alternative Flows

### A1: Urgent Hotlist for Specific Consultant

**Trigger:** Consultant reaches 45+ days on bench, manager requests immediate marketing

**Actions:**
1. Create hotlist with 1-3 high-priority consultants only
2. Select template: "Urgent Hotlist - Priority Consultants"
3. Select targeted vendor group (not all vendors) - focus on high-response vendors
4. Customize email subject: "🔴 URGENT: Senior Java Developer Available Immediately"
5. Add urgency language in email body:
   - "Immediate availability"
   - "Limited time offer"
   - "First come, first served"
6. Send immediately (no scheduling)
7. Follow up by phone within 2 hours to top 10 vendors
8. Track responses hourly

**Expected Outcome:**
- Higher response rate (10-15% vs 5-7%)
- Faster time to submission (1-2 days vs 5-7 days)
- Manager visibility into urgent actions

---

### A2: Skills-Specific Hotlist

**Trigger:** Multiple consultants with same skillset on bench, demand surge for that skill

**Example:** 5 React developers on bench, React demand high in market

**Actions:**
1. Create hotlist title: "Available React Developers - Immediate Start"
2. Select template: "Skills-Focused Hotlist"
3. Filter consultants by primary skill = "React"
4. Select 5-8 React consultants
5. Target "Front-end Vendors" group only (15 vendors)
6. Include specific React project examples in email
7. Highlight React version expertise (React 18, Next.js, etc.)
8. Send to focused audience

**Expected Outcome:**
- Higher open rate (skills match = relevance)
- Higher conversion rate (15-20% vs 5-7%)
- Better vendor targeting

---

### A3: Vendor Requests Hotlist

**Trigger:** Vendor calls/emails: "Do you have any Java developers available?"

**Actions:**
1. Create on-demand hotlist: "Java Developers for [Vendor Name]"
2. Select Java consultants matching vendor's typical requirements
3. Customize profiles for that vendor's preferences
4. Send to single vendor (not distribution list)
5. Mark as "Custom Request" type (not weekly hotlist)
6. Follow up within 24 hours
7. Track if submission created

**Expected Outcome:**
- Very high response rate (80%+ - they asked for it)
- Fast time to submission (1-2 days)
- Relationship building with vendor

---

### A4: International Hotlist (Multi-Language)

**Trigger:** Targeting vendors in Canada, Europe, or other regions

**Actions:**
1. Select language: "French", "Spanish", "German"
2. Enable currency conversion: USD → EUR, CAD, etc.
3. Include GDPR opt-out language (for EU)
4. Adjust timezone references (ET → local time)
5. Use international date format (DD/MM/YYYY)
6. Include visa transfer information for that region
7. Send during optimal local business hours

**Customizations:**
```
Language: French
Currency: EUR (€)
Date Format: DD/MM/YYYY
Timezone: CET (Central European Time)
GDPR Opt-out: ✅ Enabled
```

---

### A5: Hotlist Expiry and Refresh

**Trigger:** Hotlist reaches expiration date (14 days after send)

**System Actions:**
1. Hotlist status auto-updates to "expired"
2. Notification sent to recruiter: "Hotlist expired. Create refresh?"
3. Recruiter clicks "Create Refresh"
4. System copies expired hotlist
5. Removes consultants who were placed
6. Adds new consultants who joined bench
7. Updates consultant profiles (latest data)
8. New expiration date set
9. Send to same vendor list or updated list

**Expected Outcome:**
- Continuous marketing cadence
- Updated consultant pool
- Fresh opportunities

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Title | Required, 10-100 chars | "Please enter a hotlist title (10-100 characters)" |
| Consultants | Required, min 1, max 20 | "Please select at least 1 consultant (max 20)" |
| Recipient List | Required, min 1 recipient | "Please select at least one recipient" |
| Email Subject | Required, 10-100 chars | "Email subject is required (10-100 characters)" |
| Email Body | Required, min 50, max 2000 | "Email body must be between 50 and 2000 characters" |
| Validity Days | Required, 3-30 | "Validity must be between 3 and 30 days" |
| Output Format | Required | "Please select document format" |
| Send Option | Required | "Please select when to send" |
| Consultant Eligibility | Visa valid >90 days | "Cannot include: Visa expires in <90 days" |
| Consultant Eligibility | Contacted within 10 days | "Cannot include: Not contacted in 10+ days" |
| Consultant Eligibility | Resume updated <30 days | "Warning: Resume is >30 days old" |
| Attachment Size | Max 25 MB total | "Total attachment size exceeds 25 MB limit" |

---

## Business Rules

### Hotlist Frequency

**Per Recruiter:**
- **Weekly:** 2 hotlists per week (Tuesday, Thursday recommended)
- **Monthly:** 8-10 hotlists per month
- **Quarterly:** 24-30 hotlists per quarter

**Per Consultant:**
- Maximum 2 hotlists per week per consultant (avoid over-exposure)
- Minimum 3 days between hotlists featuring same consultant
- No hotlist within 7 days of successful placement

**Team Guidelines:**
- Coordinate send times to avoid vendor fatigue
- Don't send multiple hotlists to same vendor on same day
- Stagger sends: Recruiter A at 9 AM, Recruiter B at 2 PM

---

### Consultant Eligibility Rules

**Must Meet ALL:**
- ✅ On bench ≥7 days
- ✅ Profile complete (resume, skills, rate)
- ✅ Contacted within last 5 days (confirmed available)
- ✅ Visa valid >90 days
- ✅ Available within 14 days (not on notice period)
- ✅ Resume updated within 30 days

**Cannot Include If:**
- ❌ On bench <7 days (too fresh, might place quickly)
- ❌ Profile incomplete (missing resume, skills, or rate)
- ❌ Unresponsive (no contact in >10 days)
- ❌ Visa expires <90 days (risky for placements)
- ❌ Not available for >14 days (defeats "immediate" messaging)
- ❌ Already on hotlist within last 3 days (over-exposure)
- ❌ Consultant requested to not be marketed (opt-out)

---

### Document Standards

**Format:**
- PDF (not editable, professional)
- Letter size (8.5" × 11")
- Max file size: 10 MB per document

**Branding:**
- InTime logo on every page
- Consistent color scheme (Green #2D5016, Rust #E07A5F)
- Professional fonts (Inter, Open Sans)

**Content:**
- Error-free (grammar, spelling checked)
- No discriminatory language
- Visa status disclosed accurately
- No salary/rate inflation
- Include recruiter contact info

**Compliance:**
- Include confidentiality notice
- Include GDPR opt-out (if EU recipients)
- No candidate photos without consent
- No protected class information (age, race, etc.)

---

### Tracking Requirements

**All hotlists must have:**
- ✅ Email open tracking enabled
- ✅ PDF download tracking enabled
- ✅ Link click tracking enabled
- ✅ Response tracking enabled

**Review Schedule:**
- Day 1 (send day): Check delivery success (100% delivered?)
- Day 2: Review engagement (opens, downloads)
- Day 5: Follow up with non-openers
- Day 7: Analyze conversion (submissions created)
- Day 14 (expiry): Final report, archive hotlist

**Metrics to Track:**
- Opens (target: >50%)
- Downloads (target: >30%)
- Responses (target: >5%)
- Submissions (target: >3%)
- Placements (target: >1% - 1 placement per 100 consultants marketed)

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `hotlist.created` | `{ hotlist_id, title, consultant_ids, created_by, scheduled_send_at }` | System |
| `hotlist.scheduled` | `{ hotlist_id, recipient_count, send_at }` | Recruiter, Manager |
| `hotlist.sent` | `{ hotlist_id, sent_to, sent_at, delivery_count, failed_count }` | Recruiter |
| `hotlist.opened` | `{ hotlist_id, vendor_id, contact_id, opened_at }` | System |
| `hotlist.downloaded` | `{ hotlist_id, vendor_id, contact_id, downloaded_at }` | System |
| `hotlist.link_clicked` | `{ hotlist_id, vendor_id, contact_id, link_url, clicked_at }` | System |
| `hotlist.responded` | `{ hotlist_id, vendor_id, contact_id, response_text, responded_at }` | Recruiter |
| `consultant.marketed` | `{ consultant_id, hotlist_id, marketed_at }` | System |
| `hotlist.expired` | `{ hotlist_id, expired_at, engagement_summary }` | Recruiter |
| `hotlist.submission_created` | `{ hotlist_id, submission_id, consultant_id, vendor_id }` | Recruiter, Manager |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Hotlist Frequency | 2 per week | Weekly count |
| Email Open Rate | >50% | Opens / Sends |
| PDF Download Rate | >30% | Downloads / Sends |
| Link Click Rate | >30% | Clicks / Opens |
| Response Rate | >5% | Responses / Sends |
| Submission Conversion | >10% | Submissions from hotlist / Total consultants |
| Placement from Hotlist | >15% | Placements from hotlist / Total consultants (within 30 days) |
| Time to First Response | <24 hours | Avg time from send to first vendor response |
| Vendor Engagement Score | >60/100 | Weighted score based on all engagement metrics |
| Consultant Reduction Days | -7 days | Avg reduction in bench days for hotlist consultants |

**Example Calculation:**
```
Hotlist: 10 consultants marketed
Opens: 30/50 vendors (60%)
Downloads: 18/50 vendors (36%)
Responses: 4/50 vendors (8%)
Submissions: 2 consultants submitted (20%)
Placements: 1 consultant placed (10%)

Result: ✅ Above all targets!
```

---

## Related Use Cases

- [02-manage-bench.md](./02-manage-bench.md) - Managing bench consultants
- [03-market-consultant.md](./03-market-consultant.md) - Individual consultant marketing
- [04-find-requirements.md](./04-find-requirements.md) - Finding external jobs for consultants
- [05-submit-bench-consultant.md](./05-submit-bench-consultant.md) - Submitting consultants from hotlist responses

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+Enter` | Send hotlist (if on send screen) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Space` | Select/deselect consultant |
| `Cmd+S` | Save draft |
| `Esc` | Cancel / Close modal |
| `Cmd+P` | Preview document |
| `Cmd+D` | Download document |

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
