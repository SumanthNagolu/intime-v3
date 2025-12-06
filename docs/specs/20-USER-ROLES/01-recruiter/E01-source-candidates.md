# Use Case: Source Candidates

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-002 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Find and add candidates to the system for open jobs |
| Frequency | Daily (2-3 hours per day) |
| Estimated Time | 5-30 minutes per candidate |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "candidate.create" permission (default for Recruiter role)
3. At least one active job exists (or user can source candidates proactively)
4. Resume parsing AI service is available (optional but recommended)

---

## Trigger

One of the following:
- New job created, need to source candidates
- Account Manager requests candidates for upcoming opening
- Proactive sourcing for high-demand skills
- Received resume from job board (LinkedIn, Indeed, Dice, Monster)
- Referral from existing employee or candidate
- Found qualified candidate on LinkedIn
- Candidate applied directly via careers page

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Candidates

**User Action:** Click "Candidates" in the sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/candidates`
- Candidates list screen loads
- Loading skeleton shows for 200-500ms
- Candidates list populates with all candidates in system

**Screen State:**
```
+----------------------------------------------------------+
| Candidates                       [+ Add Candidate] [Cmd+K] |
+----------------------------------------------------------+
| [Search candidates...]                [Filter ▼] [Sort ▼] |
+----------------------------------------------------------+
| ● Active │ ○ Placed │ ○ Bench │ ○ Hotlist │ ○ All         |
+----------------------------------------------------------+
| Status  Name              Skills          Visa   Avail    |
| ─────────────────────────────────────────────────────────|
| 🟢 Act  John Smith        React, Node     H1B    2 weeks  |
| 🟡 Ben  Sarah Jones       Python, AWS     USC    Immediate|
| 🟢 Act  Mike Williams     Java, Spring    GC     1 month  |
+----------------------------------------------------------+
| Showing 247 candidates                                    |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2A: Search Existing Candidates (Before Adding New)

**User Action:** Type in search box, e.g., "React AWS"

**System Response:**
- Search executes in real-time (debounced 300ms)
- Results filter as user types
- Full-text search across: name, email, skills, location, professional summary
- Matches highlight in yellow

**Screen State:**
```
+----------------------------------------------------------+
| Candidates                       [+ Add Candidate] [Cmd+K] |
+----------------------------------------------------------+
| [React AWS                       ]  [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| ● Active │ ○ Placed │ ○ Bench │ ○ Hotlist │ ○ All         |
+----------------------------------------------------------+
| Status  Name              Skills          Visa   Avail    |
| ─────────────────────────────────────────────────────────|
| 🟢 Act  John Smith        React, Node     H1B    2 weeks  |
|         Senior Engineer    AWS, Docker                     |
| 🟢 Act  Amy Chen          React, AWS      USC    Immediate|
|         Full Stack Dev     TypeScript                      |
+----------------------------------------------------------+
| 2 results for "React AWS"                   [Clear search]|
+----------------------------------------------------------+
```

**Field Specification: Search Box**
| Property | Value |
|----------|-------|
| Field Name | `searchQuery` |
| Type | Text Input with debounce |
| Label | "Search candidates..." |
| Placeholder | "Name, email, skills, location..." |
| Debounce | 300ms |
| Search Fields | `fullName`, `email`, `candidateSkills`, `candidateLocation`, `professionalSummary`, `professionalHeadline` |
| Min Characters | 2 |
| Keyboard Shortcut | `Cmd+K` or `/` |

**Time:** ~2 seconds

---

### Step 2B: Filter Candidates by Skills and Availability

**User Action:** Click "Filter" dropdown

**System Response:**
- Filter panel slides in from right
- Shows multiple filter categories

**Screen State:**
```
+----------------------------------------------------------+
|                                      Filters         [×] |
+----------------------------------------------------------+
| Skills (Select multiple)                                  |
| [Search skills...                                      ]  |
| ☑ React (47)      ☐ Node.js (32)    ☐ Python (28)       |
| ☐ AWS (41)        ☐ Java (19)       ☐ Angular (15)      |
|                                                           |
| Visa Status                                               |
| ☐ US Citizen (89) ☐ Green Card (54) ☐ H1B (71)          |
| ☐ OPT (22)        ☐ CPT (8)         ☐ TN (4)            |
|                                                           |
| Availability                                              |
| ☐ Immediate (42)  ☐ 2 Weeks (31)    ☐ 1 Month (19)      |
|                                                           |
| Experience Years                                          |
| Min: [__]  Max: [__]                                      |
|                                                           |
| Location                                                  |
| [Search locations...                                   ]  |
|                                                           |
| Willing to Relocate                                       |
| ☐ Yes (67)        ☐ No (180)                             |
|                                                           |
| Status                                                    |
| ☐ Active (198)    ☐ Bench (34)      ☐ Placed (15)       |
|                                                           |
+----------------------------------------------------------+
|                [Clear All]  [Apply Filters (3 selected)]  |
+----------------------------------------------------------+
```

**User Action:** Select "React", "AWS", "Immediate availability", click "Apply Filters"

**System Response:**
- Filter panel closes
- List refreshes with filtered results
- Active filters shown as tags above list

**Time:** ~10 seconds

---

### Step 3: Decide to Add New Candidate

**User Action:** Click "+ Add Candidate" button (determined existing search shows no match)

**System Response:**
- Modal slides in from right (300ms animation)
- Modal title: "Add New Candidate"
- Focus on "Source" field

**Screen State:**
```
+----------------------------------------------------------+
|                                    Add New Candidate  [×] |
+----------------------------------------------------------+
| Step 1 of 3: Candidate Source                             |
|                                                           |
| How are you adding this candidate?                        |
|                                                           |
| ○ Upload Resume                                           |
|   Parse candidate details from resume file                |
|                                                           |
| ○ LinkedIn Profile                                        |
|   Import from LinkedIn URL                                |
|                                                           |
| ○ Manual Entry                                            |
|   Enter candidate details manually                        |
|                                                           |
| ○ Quick Add from Job Board                                |
|   Indeed, Dice, Monster integration                       |
|                                                           |
+----------------------------------------------------------+
|                                      [Cancel]  [Continue →]|
+----------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 4A: Upload Resume (Most Common Path)

**User Action:** Select "Upload Resume" radio button, click "Continue"

**System Response:**
- Slides to Step 2
- Shows drag-and-drop upload area

**Screen State:**
```
+----------------------------------------------------------+
|                                    Add New Candidate  [×] |
+----------------------------------------------------------+
| Step 2 of 3: Upload Resume                                |
|                                                           |
| [                                                      ]  |
| [           Drag & Drop Resume Here                   ]  |
| [              or Click to Browse                     ]  |
| [                                                      ]  |
| [         Supports: PDF, DOC, DOCX                    ]  |
| [           Max size: 10 MB                           ]  |
|                                                           |
| Resume Type                                               |
| ○ Master Resume (default)                                 |
| ○ Formatted Resume                                        |
| ○ Client-Specific Resume                                  |
|                                                           |
+----------------------------------------------------------+
|                           [← Back]  [Cancel]  [Upload →] |
+----------------------------------------------------------+
```

**User Action:** Drag resume file or click to browse, select file

**System Response:**
- File name appears in upload area
- File size shows
- Upload button becomes enabled

**Screen State (After File Selected):**
```
+----------------------------------------------------------+
|                                    Add New Candidate  [×] |
+----------------------------------------------------------+
| Step 2 of 3: Upload Resume                                |
|                                                           |
| ✓ Selected File                                           |
|   📄 john_smith_resume.pdf                               |
|   Size: 247 KB                                            |
|   [Change File]                                           |
|                                                           |
| Resume Type                                               |
| ● Master Resume (default)                                 |
| ○ Formatted Resume                                        |
| ○ Client-Specific Resume                                  |
|                                                           |
+----------------------------------------------------------+
|                  [← Back]  [Cancel]  [Parse Resume →]    |
+----------------------------------------------------------+
```

**Field Specification: Resume Upload**
| Property | Value |
|----------|-------|
| Field Name | `resumeFile` |
| Type | File Upload (Drag & Drop) |
| Label | "Upload Resume" |
| Accepted Types | `.pdf`, `.doc`, `.docx` |
| Max File Size | 10 MB |
| Required | No (can skip and enter manually) |
| Storage | Supabase Storage bucket `resumes/` |
| Validation | File type, size, virus scan |
| Error Messages | |
| - Invalid type | "Please upload PDF, DOC, or DOCX file" |
| - Too large | "File size must be under 10 MB" |
| - Virus detected | "File failed security scan" |

**Time:** ~5 seconds

---

### Step 5: AI Resume Parsing

**User Action:** Click "Parse Resume →" button

**System Response:**
1. Button shows loading spinner
2. File uploads to storage (2-5 seconds)
3. AI parsing service extracts data (3-10 seconds)
4. Progress indicator: "Parsing resume..."
5. Slides to Step 3 with pre-filled fields

**Screen State (During Parsing):**
```
+----------------------------------------------------------+
|                                    Add New Candidate  [×] |
+----------------------------------------------------------+
| Step 2 of 3: Upload Resume                                |
|                                                           |
| ⚡ Parsing Resume...                                      |
|                                                           |
| ✓ File uploaded                                           |
| ⟳ Extracting contact information...                      |
| ⟳ Identifying skills...                                  |
| ⟳ Analyzing work experience...                           |
| ⟳ Detecting education...                                 |
|                                                           |
| This may take 10-15 seconds.                              |
|                                                           |
+----------------------------------------------------------+
|                                              [Cancel]     |
+----------------------------------------------------------+
```

**System Response (After Parsing Complete):**
- Slides to Step 3
- Form pre-filled with extracted data
- Fields highlighted in light blue (indicating AI-extracted)
- User can review and edit

**Screen State (Step 3 - Parsed Data):**
```
+----------------------------------------------------------+
|                                    Add New Candidate  [×] |
+----------------------------------------------------------+
| Step 3 of 3: Review & Complete Profile                    |
|                                                           |
| ✨ Auto-filled from resume - Please review                |
|                                                           |
| Contact Information                                       |
| First Name *                  Last Name *                 |
| [John              ]          [Smith              ]       |
|                                                           |
| Email *                       Phone                       |
| [john.smith@email.com]        [+1 (555) 123-4567 ]       |
|                                                           |
| LinkedIn                                                  |
| [https://linkedin.com/in/johnsmith                    ]   |
|                                                           |
| Professional Details                                      |
| Professional Headline                                     |
| [Senior Software Engineer                             ]   |
|                                                           |
| Skills * (Auto-detected: 12 skills)                       |
| [React] [×]  [Node.js] [×]  [AWS] [×]  [Docker] [×]      |
| [TypeScript] [×]  [GraphQL] [×]  [+ Add skill]           |
|                                                           |
| Experience Years *                                        |
| [8  ] years                                               |
|                                                           |
| Work Authorization                                        |
| Visa Status *                                             |
| [US Citizen                                           ▼]  |
|                                                           |
| Availability                                              |
| Current Status                                            |
| ○ Immediate  ● 2 Weeks  ○ 1 Month  ○ Not Available       |
|                                                           |
| Location                                                  |
| Current Location *                                        |
| [San Francisco, CA                                    ]   |
|                                                           |
| □ Willing to Relocate                                    |
|                                                           |
| Compensation Expectations                                 |
| Desired Hourly Rate ($/hr)                                |
| Min: [$85  ]  Max: [$110  ]                              |
|                                                           |
| [▼ Show Advanced Fields]                                  |
|                                                           |
+----------------------------------------------------------+
| [← Back] [Save as Draft] [Cancel]  [Add Candidate ✓]    |
+----------------------------------------------------------+
```

**AI Parsing Specification**
| Property | Value |
|----------|-------|
| Service | OpenAI GPT-4 or Claude (structured output) |
| Extracted Fields | |
| - Name | `firstName`, `lastName` |
| - Contact | `email`, `phone`, `linkedinUrl` |
| - Summary | `professionalHeadline`, `professionalSummary` |
| - Skills | `candidateSkills` (array) |
| - Experience | `candidateExperienceYears` |
| - Education | Saved to `candidateEducation` table |
| - Work History | Saved to `candidateWorkHistory` table |
| Confidence Score | 0-100 (fields with <70% highlighted for review) |
| Processing Time | 5-15 seconds average |
| Fallback | Manual entry if parsing fails |

**Time:** ~15 seconds (parsing) + ~30 seconds (review)

---

### Step 6: Review and Edit Parsed Data

**User Action:** Review auto-filled fields, make corrections

**Corrections Needed:**
- Change visa status from "US Citizen" to "H1B"
- Add missing skill "Kubernetes"
- Update availability from "2 Weeks" to "Immediate"
- Adjust hourly rate from $85-110 to $95-115

**User Action:**
1. Click "Visa Status" dropdown, select "H1B"
2. Type "Kubernetes" in skills field, press Enter
3. Click "Immediate" radio button
4. Update rate min to "95", max to "115"

**Field Specification: First Name**
| Property | Value |
|----------|-------|
| Field Name | `firstName` |
| Type | Text Input |
| Label | "First Name" |
| Required | Yes |
| Max Length | 50 characters |
| Validation | Letters, hyphens, apostrophes only |
| Error Messages | |
| - Empty | "First name is required" |
| - Invalid | "First name contains invalid characters" |

**Field Specification: Last Name**
| Property | Value |
|----------|-------|
| Field Name | `lastName` |
| Type | Text Input |
| Label | "Last Name" |
| Required | Yes |
| Max Length | 50 characters |
| Validation | Letters, hyphens, apostrophes only |
| Error Messages | |
| - Empty | "Last name is required" |

**Field Specification: Email**
| Property | Value |
|----------|-------|
| Field Name | `email` |
| Type | Email Input |
| Label | "Email" |
| Required | Yes |
| Max Length | 100 characters |
| Validation | Valid email format, unique in system |
| Error Messages | |
| - Empty | "Email is required" |
| - Invalid format | "Please enter a valid email address" |
| - Duplicate | "This email already exists (View candidate)" |
| Duplicate Check | Real-time as user types (debounced 500ms) |

**Field Specification: Phone**
| Property | Value |
|----------|-------|
| Field Name | `phone` |
| Type | Phone Input |
| Label | "Phone" |
| Required | No (recommended) |
| Format | Auto-format to US: (555) 123-4567 |
| Validation | Valid phone number |
| International | Yes (detects country code) |

**Field Specification: LinkedIn URL**
| Property | Value |
|----------|-------|
| Field Name | `linkedinUrl` |
| Type | URL Input |
| Label | "LinkedIn" |
| Placeholder | "https://linkedin.com/in/username" |
| Required | No |
| Validation | Valid LinkedIn URL format |
| Auto-complete | Yes (from resume parsing) |

**Field Specification: Skills**
| Property | Value |
|----------|-------|
| Field Name | `candidateSkills` |
| Type | Tag Input (Multi-select) |
| Label | "Skills" |
| Required | Yes (at least 1) |
| Data Source | `skills` table (autocomplete) |
| Allow Custom | Yes (creates new skill if not exists) |
| Max Tags | 50 |
| Display | Tags with × to remove |
| Autocomplete | Shows suggestions after 2 characters |
| Error Messages | |
| - Empty | "At least one skill is required" |
| - Too many | "Maximum 50 skills allowed" |

**Field Specification: Experience Years**
| Property | Value |
|----------|-------|
| Field Name | `candidateExperienceYears` |
| Type | Number Input |
| Label | "Experience Years" |
| Required | Yes |
| Min | 0 |
| Max | 50 |
| Suffix | "years" |
| Default | Parsed from resume or null |
| Validation | Integer only |

**Field Specification: Visa Status**
| Property | Value |
|----------|-------|
| Field Name | `candidateCurrentVisa` |
| Type | Dropdown (Select) |
| Label | "Visa Status" |
| Required | Yes |
| Options | |
| - `USC` | "US Citizen" 🇺🇸 |
| - `GC` | "Green Card" |
| - `H1B` | "H1B" |
| - `L1` | "L1" |
| - `TN` | "TN Visa" |
| - `OPT` | "OPT" |
| - `CPT` | "CPT" |
| - `EAD` | "EAD" |
| - `Other` | "Other" |
| Conditional | If visa has expiry, show "Visa Expiry Date" field |

**Field Specification: Availability**
| Property | Value |
|----------|-------|
| Field Name | `candidateAvailability` |
| Type | Radio Button Group |
| Label | "Current Status" |
| Required | Yes |
| Options | |
| - `immediate` | "Immediate" 🟢 |
| - `2_weeks` | "2 Weeks" 🟡 |
| - `1_month` | "1 Month" 🟠 |
| - `not_available` | "Not Available" 🔴 |
| Default | `2_weeks` |

**Field Specification: Current Location**
| Property | Value |
|----------|-------|
| Field Name | `candidateLocation` |
| Type | Location Autocomplete |
| Label | "Current Location" |
| Required | Yes |
| Placeholder | "City, State" or "City, Country" |
| Autocomplete | Google Places API |
| Format | "San Francisco, CA" |
| Max Length | 200 characters |

**Field Specification: Willing to Relocate**
| Property | Value |
|----------|-------|
| Field Name | `candidateWillingToRelocate` |
| Type | Checkbox |
| Label | "Willing to Relocate" |
| Default | Unchecked (false) |
| Conditional | If checked, show "Preferred Locations" field |

**Field Specification: Desired Hourly Rate (Min)**
| Property | Value |
|----------|-------|
| Field Name | `minimumHourlyRate` |
| Type | Currency Input |
| Label | "Min" |
| Prefix | "$" |
| Suffix | "/hr" |
| Required | No |
| Min Value | 0 |
| Precision | 2 decimal places |
| Placeholder | "e.g., 85" |

**Field Specification: Desired Hourly Rate (Max)**
| Property | Value |
|----------|-------|
| Field Name | `candidateHourlyRate` |
| Type | Currency Input |
| Label | "Max" |
| Required | No |
| Validation | Must be ≥ Min rate |
| Error | "Max rate must be greater than or equal to min rate" |

**Time:** ~30 seconds

---

### Step 7: Expand Advanced Fields (Optional)

**User Action:** Click "Show Advanced Fields" accordion

**System Response:**
- Accordion expands
- Shows additional fields

**Screen State (Advanced Fields Expanded):**
```
+----------------------------------------------------------+
| [▲ Hide Advanced Fields]                                  |
|                                                           |
| Secondary Contact                                         |
| Secondary Email              Home Phone                   |
| [                    ]       [                    ]       |
|                                                           |
| Preferred Contact Method                                  |
| ○ Email  ○ Phone  ○ Text  ○ LinkedIn                     |
|                                                           |
| Employment Status                                         |
| [Employed                                             ▼]  |
|   Options: Employed, Unemployed, Student, Freelance       |
|                                                           |
| Notice Period                                             |
| [14] days                                                 |
|                                                           |
| Professional Summary                                      |
| [                                                      ]  |
| [  Auto-generated from resume. Edit as needed.        ]  |
| [                                               ] 0/2000  |
|                                                           |
| Career Objectives                                         |
| [                                                      ]  |
| [                                               ] 0/500   |
|                                                           |
| Tags (for internal organization)                          |
| [+ Add tag]                                               |
|                                                           |
| Lead Source *                                             |
| [LinkedIn                                             ▼]  |
|   Options: LinkedIn, Indeed, Dice, Monster, Referral,     |
|   Direct Application, Job Board, Agency, Other            |
|                                                           |
| Source Details                                            |
| [Found via LinkedIn Recruiter                         ]   |
|                                                           |
+----------------------------------------------------------+
```

**Field Specification: Lead Source**
| Property | Value |
|----------|-------|
| Field Name | `leadSource` |
| Type | Dropdown |
| Label | "Lead Source" |
| Required | Yes |
| Options | |
| - `linkedin` | "LinkedIn" |
| - `indeed` | "Indeed" |
| - `dice` | "Dice" |
| - `monster` | "Monster" |
| - `referral` | "Employee Referral" |
| - `direct` | "Direct Application" |
| - `agency` | "Agency/Partner" |
| - `job_board` | "Other Job Board" |
| - `other` | "Other" |
| Default | `linkedin` (most common) |

**Time:** ~20 seconds (if filling advanced fields)

---

### Step 8: Candidate Deduplication Check

**System Response (Automatic on Email Blur):**
- When user enters email and moves to next field
- System checks for existing candidate with same email
- If match found, shows warning

**Screen State (Duplicate Detected):**
```
+----------------------------------------------------------+
| ⚠️  Potential Duplicate Candidate Found                  |
+----------------------------------------------------------+
| A candidate with this email already exists:               |
|                                                           |
| 📧 john.smith@email.com                                   |
|                                                           |
| Existing Candidate:                                       |
| Name: John Smith                                          |
| Added: 3 months ago by Sarah Johnson                      |
| Status: Active                                            |
| Skills: React, Node.js, AWS (8 skills)                    |
| Last Activity: Submitted to "Senior Engineer" job 2 days ago |
|                                                           |
| What would you like to do?                                |
|                                                           |
| ● Update Existing Candidate                               |
|   Add new resume version and update profile               |
|                                                           |
| ○ Create New Profile Anyway                               |
|   Keep both (not recommended)                             |
|                                                           |
| ○ Cancel and Review Existing                              |
|   View full profile before deciding                       |
|                                                           |
+----------------------------------------------------------+
|           [Cancel]  [View Existing]  [Proceed with Choice]|
+----------------------------------------------------------+
```

**Deduplication Logic**
| Check Type | Field(s) | Match Threshold |
|------------|----------|-----------------|
| Exact Email | `email` | 100% (case-insensitive) |
| Exact Phone | `phone` | 100% (normalized) |
| Fuzzy Name | `firstName`, `lastName` | 90% (Levenshtein) |
| LinkedIn | `linkedinUrl` | 100% (normalized URL) |

**User Action:** Select "Update Existing Candidate", click "Proceed with Choice"

**System Response:**
- Closes duplicate modal
- Switches to "Update Candidate" mode
- Shows existing candidate data
- Highlights new resume as "Version 2"
- Merges new skills with existing

**Alternative Flow:** If no duplicate found, continue to Step 9

**Time:** ~10 seconds (if duplicate handled)

---

### Step 9: Associate to Job (Optional but Common)

**User Action:** Scroll down to "Associate to Jobs" section (still in modal)

**Screen State:**
```
+----------------------------------------------------------+
| Associate to Jobs (Optional)                              |
|                                                           |
| Link this candidate to one or more open jobs              |
|                                                           |
| [Search jobs...                                        ]  |
|                                                           |
| Suggested Jobs (based on skills match):                   |
|                                                           |
| ☐ Senior Software Engineer                                |
|   Google · Remote · $95-110/hr                           |
|   Skills Match: 85% (React, Node.js, AWS)                |
|                                                           |
| ☐ Full Stack Developer                                    |
|   Meta · San Francisco, CA · $90-105/hr                  |
|   Skills Match: 78% (React, TypeScript)                  |
|                                                           |
| ☐ Backend Engineer                                        |
|   Amazon · Seattle, WA · $100-120/hr                     |
|   Skills Match: 72% (Node.js, AWS, Docker)               |
|                                                           |
+----------------------------------------------------------+
```

**User Action:** Check "Senior Software Engineer" job

**System Response:**
- Checkbox becomes checked
- Creates submission record with status: `sourced`

**Field Specification: Job Association**
| Property | Value |
|----------|-------|
| Field Name | `associatedJobs` |
| Type | Multi-select Checkbox List |
| Label | "Associate to Jobs" |
| Required | No |
| Data Source | Active jobs WHERE `status IN ('open', 'urgent')` |
| Sorting | AI match score descending |
| Display Format | `{job.title}` · `{account.name}` · `{location}` · `{rateMin}-{rateMax}/hr` |
| Match Score | Calculated from skills overlap |
| Auto-create | Creates `submissions` record with `status = 'sourced'` |

**Time:** ~10 seconds

---

### Step 10: Add to Hotlist (Optional for High-Priority Candidates)

**User Action:** Check "Add to Hotlist" checkbox at bottom of form

**Screen State:**
```
+----------------------------------------------------------+
| Special Designations                                      |
|                                                           |
| ☑ Add to Hotlist                                         |
|   Mark as high-priority candidate for immediate attention |
|                                                           |
| Hotlist Notes (visible to all recruiters)                 |
| [Excellent React + AWS skills, immediate availability  ]  |
| [Client-ready, strong communication                   ]   |
|                                               ] 0/500     |
|                                                           |
+----------------------------------------------------------+
```

**Field Specification: Hotlist Flag**
| Property | Value |
|----------|-------|
| Field Name | `isOnHotlist` |
| Type | Checkbox |
| Label | "Add to Hotlist" |
| Default | Unchecked |
| Sets | `isOnHotlist = true`, `hotlistAddedAt = now()`, `hotlistAddedBy = current_user` |
| Visibility | Candidate appears in "Hotlist" filter |

**Field Specification: Hotlist Notes**
| Property | Value |
|----------|-------|
| Field Name | `hotlistNotes` |
| Type | Textarea |
| Label | "Hotlist Notes" |
| Required | No |
| Max Length | 500 characters |
| Visible | Only when "Add to Hotlist" is checked |
| Visibility | Shared with all recruiters |

**Time:** ~15 seconds

---

### Step 11: Add Tags (Optional)

**User Action:** In advanced fields, click "+ Add tag"

**System Response:**
- Tag input appears
- Shows autocomplete from existing tags

**User Action:** Type "client-ready", press Enter, type "react-expert", press Enter

**Screen State:**
```
+----------------------------------------------------------+
| Tags (for internal organization)                          |
| [client-ready] [×]  [react-expert] [×]  [+ Add tag]      |
|                                                           |
| Suggested tags: senior-level, immediate-start, hotlist    |
+----------------------------------------------------------+
```

**Field Specification: Tags**
| Property | Value |
|----------|-------|
| Field Name | `tags` |
| Type | Tag Input (Multi-value) |
| Label | "Tags" |
| Required | No |
| Max Tags | 20 |
| Autocomplete | Yes (from existing tags in system) |
| Allow Custom | Yes |
| Format | Lowercase, no spaces (auto-converted to hyphens) |

**Time:** ~10 seconds

---

### Step 12: Click "Add Candidate"

**User Action:** Click "Add Candidate ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. Form validates all required fields
3. If valid: API call `POST /api/trpc/candidates.create`
4. Creates candidate record in `user_profiles` table
5. Uploads resume to Supabase Storage
6. Creates resume record in `candidate_resumes` table
7. Creates submission record(s) if jobs selected
8. On success:
   - Modal closes (300ms animation)
   - Toast notification: "Candidate added successfully" (green)
   - If associated with job: Shows "Associated with 1 job" badge
   - Candidates list refreshes
   - New candidate appears in list (highlighted for 3 seconds)
   - URL changes to: `/employee/workspace/candidates/{new-candidate-id}`
   - Candidate detail view opens automatically
9. On error:
   - Modal stays open
   - Error toast: "Failed to add candidate: {error message}"
   - Problematic fields highlighted

**Validation Rules (All Fields)**
| Field | Validation |
|-------|------------|
| First Name | Required, 2-50 chars, letters only |
| Last Name | Required, 2-50 chars, letters only |
| Email | Required, valid email, unique (not in system) |
| Phone | Optional, valid phone format |
| Skills | Required, at least 1 skill |
| Experience Years | Required, 0-50 integer |
| Visa Status | Required, valid enum value |
| Availability | Required, valid enum value |
| Location | Required, 2-200 chars |
| Lead Source | Required, valid enum value |

**Time:** ~2 seconds

---

### Step 13: View New Candidate Profile

**System Response (Automatic):**
- Modal closes
- Navigates to candidate detail page
- Shows full candidate profile

**Screen State (Candidate Detail):**
```
+----------------------------------------------------------+
| [← Back to Candidates]                   Candidate Detail |
+----------------------------------------------------------+
|
| John Smith                                   [Edit Profile]|
| 🟢 Active · H1B · Immediate                               |
| 📍 San Francisco, CA                                      |
| 📧 john.smith@email.com · 📞 (555) 123-4567              |
| 🔗 linkedin.com/in/johnsmith                              |
|                                                           |
| Senior Software Engineer · 8 years experience             |
|                                                           |
| ⭐ Hotlist Candidate                                      |
| Excellent React + AWS skills, immediate availability      |
|                                                           |
+----------------------------------------------------------+
| Overview | Jobs (1) | Submissions (1) | Documents | Activity|
+----------------------------------------------------------+
|
| Skills (12)                                               |
| [React] [Node.js] [AWS] [Docker] [TypeScript] [GraphQL]  |
| [Kubernetes] [PostgreSQL] [Redis] [Git] [CI/CD] [Agile]  |
|                                                           |
| Rate Expectations                                         |
| $95 - $115 /hr                                            |
|                                                           |
| Work Authorization                                        |
| H1B · Expires: June 2026                                  |
|                                                           |
| Associated Jobs                                           |
|
| 📋 Senior Software Engineer                               |
|    Google · Remote · $95-110/hr                          |
|    Status: Sourced · Added today                          |
|    Skills Match: 85%                                      |
|                                                           |
| Resume                                                    |
| 📄 john_smith_resume.pdf (v1 - Master)                   |
|    Uploaded today · 247 KB                                |
|    [Download] [View] [Add Version]                        |
|                                                           |
| Tags                                                      |
| [client-ready] [react-expert]                             |
|                                                           |
| Recent Activity                                           |
| ✅ Candidate added by You · Just now                      |
| ✅ Resume uploaded (v1) · Just now                        |
| ✅ Associated with "Senior Software Engineer" · Just now   |
| ✅ Added to Hotlist · Just now                            |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

## Postconditions

1. ✅ New candidate record created in `user_profiles` table
2. ✅ `candidateStatus` set to "active"
3. ✅ Resume uploaded to Supabase Storage (`resumes/` bucket)
4. ✅ Resume record created in `candidate_resumes` table
5. ✅ Skills added to `candidate_skills` table (if parsed)
6. ✅ If associated with job: Submission record created with `status = 'sourced'`
7. ✅ If hotlisted: `isOnHotlist = true`, `hotlistAddedAt = now()`
8. ✅ Activity logged: "candidate.added"
9. ✅ If job associated: Activity logged: "candidate.sourced_for_job"
10. ✅ User redirected to candidate detail page

---

## Events Logged

| Event | Payload |
|-------|---------|
| `candidate.added` | `{ candidate_id, name, email, source, added_by, created_at }` |
| `resume.uploaded` | `{ candidate_id, resume_id, version, file_name, uploaded_by }` |
| `candidate.sourced_for_job` | `{ candidate_id, job_id, submission_id, sourced_by, created_at }` |
| `candidate.added_to_hotlist` | `{ candidate_id, added_by, notes, created_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Duplicate Email | Email already exists | "Candidate with this email already exists. [View Existing]" | Update existing or use different email |
| Resume Parse Failed | AI service error | "Resume parsing failed. Please enter details manually." | Fallback to manual entry |
| Invalid Resume Format | Unsupported file type | "Please upload PDF, DOC, or DOCX file" | Select different file |
| Resume Too Large | File > 10 MB | "File size must be under 10 MB" | Compress or use different file |
| Missing Required Fields | Validation failed | "Please complete all required fields" | Fill missing fields |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Permission Denied | User lacks create permission | "You don't have permission to add candidates" | Contact Admin |
| Storage Upload Failed | Supabase error | "Failed to upload resume. Please try again." | Retry upload |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Cmd+K` or `/` | Focus search box |
| `Cmd+N` | Open "Add Candidate" modal |
| `Esc` | Close modal (with confirmation if changes made) |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit form (when on button) |
| `Cmd+Enter` | Submit form (from any field) |
| `Cmd+S` | Save as Draft |

---

## Alternative Flows

### A1: Quick Add from LinkedIn

At Step 4, if user selects "LinkedIn Profile":

1. Modal shows "LinkedIn URL" input field
2. User pastes LinkedIn profile URL
3. System scrapes public data (via RapidAPI or similar)
4. Pre-fills: Name, Headline, Skills, Location, Experience
5. User reviews and completes missing fields (email, phone)
6. Continue from Step 11

**Time:** ~20 seconds

---

### A2: Manual Entry (No Resume)

At Step 4, if user selects "Manual Entry":

1. Modal shows empty form (Step 3)
2. No AI parsing, all fields blank
3. User fills all fields manually
4. Continue from Step 11

**Time:** ~2 minutes

---

### A3: Quick Add from Job Board

At Step 4, if user selects "Quick Add from Job Board":

1. Modal shows job board selection: Indeed, Dice, Monster
2. User selects board, pastes candidate URL or ID
3. System imports data via job board API (if available)
4. Pre-fills available fields
5. User completes missing fields
6. Continue from Step 11

**Time:** ~30 seconds

---

### A4: Update Existing Candidate (Duplicate Found)

If duplicate detected at Step 8:

1. User selects "Update Existing Candidate"
2. System loads existing candidate data
3. Shows side-by-side comparison: Existing | New
4. User selects which fields to update
5. New resume added as Version 2
6. Merges skills (no duplicates)
7. Updates `updatedAt` timestamp
8. Logs activity: "candidate.updated"

**Time:** ~30 seconds

---

### A5: Bulk Import from CSV

From candidates list:

1. User clicks "Import" button
2. Downloads CSV template
3. Fills template with candidate data
4. Uploads CSV file
5. System validates data, shows preview
6. User confirms import
7. System creates candidates in batch
8. Shows success/error report

**Time:** ~5 minutes for 50 candidates

---

## Related Use Cases

- [D01-create-job.md](./D01-create-job.md) - Before sourcing candidates
- [F01-submit-candidate.md](./F01-submit-candidate.md) - After sourcing
- [E03-screen-candidate.md](./E03-screen-candidate.md) - After sourcing
- [E04-manage-hotlist.md](./E04-manage-hotlist.md) - Managing hotlist

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Add candidate with resume upload | Candidate created, resume parsed |
| TC-002 | Add candidate manually (no resume) | Candidate created with manual data |
| TC-003 | Duplicate email detected | Warning shown, option to update |
| TC-004 | Invalid email format | Error: "Please enter a valid email" |
| TC-005 | Missing required fields | Error highlights, cannot submit |
| TC-006 | Resume parse failed | Fallback to manual entry |
| TC-007 | Associate candidate with job | Submission created with status "sourced" |
| TC-008 | Add to hotlist | Candidate appears in hotlist filter |
| TC-009 | Add tags | Tags saved and searchable |
| TC-010 | Upload invalid file type | Error: "Please upload PDF, DOC, or DOCX" |
| TC-011 | Resume too large (>10MB) | Error: "File size must be under 10 MB" |
| TC-012 | Network error during upload | Retry option shown |
| TC-013 | Search existing candidates first | Prevents duplicates |
| TC-014 | LinkedIn import | Data pre-filled from LinkedIn |
| TC-015 | Cancel mid-creation | Confirmation prompt, then close |

---

## Time Breakdown (Typical Flow)

| Step | Time |
|------|------|
| 1. Navigate to Candidates | 1s |
| 2. Search existing (no match) | 2s |
| 3. Click "Add Candidate" | 1s |
| 4. Select "Upload Resume" | 2s |
| 5. Upload file | 5s |
| 6. AI parsing | 15s |
| 7. Review/edit parsed data | 30s |
| 8. No duplicate found | 0s |
| 9. Associate to 1 job | 10s |
| 10. Add to hotlist | 15s |
| 11. Add tags | 10s |
| 12. Click "Add Candidate" | 2s |
| 13. View profile | 1s |
| **Total** | **~1.5 minutes** |

**Range:** 5 seconds (quick manual entry) to 30 minutes (complex profile with verification)

---

## Performance Metrics

| Metric | Target |
|--------|--------|
| Page Load Time | < 500ms |
| Search Response | < 300ms |
| Resume Upload | < 5s |
| AI Parsing | < 15s |
| Candidate Creation | < 2s |
| Duplicate Check | < 500ms |

---

## Success Criteria

1. ✅ Candidate profile 90%+ complete
2. ✅ Resume uploaded and parseable
3. ✅ At least 3 skills tagged
4. ✅ Contact information verified
5. ✅ Work authorization documented
6. ✅ Availability status clear
7. ✅ Associated with at least 1 job (if sourcing for specific role)
8. ✅ No duplicate candidates created

---

## Notes for Developers

1. **Resume Parsing**: Use OpenAI GPT-4 structured output or Claude with JSON schema
2. **Deduplication**: Check on email blur (real-time), phone on submit
3. **Skills Autocomplete**: Load from `skills` table, cache in Redis
4. **Job Suggestions**: Calculate match score using TF-IDF or vector similarity
5. **Activity Logging**: Use event bus pattern, async processing
6. **File Upload**: Use Supabase Storage with signed URLs
7. **Version Control**: Resume versions tracked in `candidate_resumes` table
8. **Search**: Use PostgreSQL full-text search or Algolia for instant results

---

## Backend Processing

### tRPC Router Reference

**File:** `src/server/routers/candidates.ts`
**Procedure:** `candidates.create`
**Type:** Mutation (Protected)

### Input Schema (Zod)

```typescript
import { z } from 'zod';

export const createCandidateInput = z.object({
  // Personal Information
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().max(100),
  phone: z.string().max(20).optional(),
  linkedinUrl: z.string().url().optional(),

  // Professional Profile
  professionalHeadline: z.string().max(200).optional(),
  professionalSummary: z.string().max(2000).optional(),
  candidateSkills: z.array(z.string()).min(1).max(50),
  candidateExperienceYears: z.number().int().min(0).max(50),

  // Work Authorization
  candidateCurrentVisa: z.enum([
    'us_citizen', 'green_card', 'h1b', 'l1', 'tn', 'opt', 'cpt', 'ead', 'other'
  ]),
  visaExpiryDate: z.date().optional(),

  // Availability
  candidateAvailability: z.enum(['immediate', '2_weeks', '30_days', 'not_available']),
  candidateLocation: z.string().min(2).max(200),
  candidateWillingToRelocate: z.boolean().default(false),

  // Rate Expectations
  minimumHourlyRate: z.number().min(0).multipleOf(0.01).optional(),
  candidateHourlyRate: z.number().min(0).multipleOf(0.01).optional(),

  // Resume
  resumeFileId: z.string().uuid().optional(),
  resumeType: z.enum(['master', 'formatted', 'client_specific']).default('master'),

  // Source
  leadSource: z.enum([
    'linkedin', 'indeed', 'dice', 'monster', 'referral', 'direct', 'agency', 'job_board', 'other'
  ]),
  sourceDetails: z.string().max(500).optional(),

  // Advanced Fields
  homePhone: z.string().max(20).optional(),
  secondaryEmail: z.string().email().optional(),
  employmentStatus: z.enum(['employed', 'unemployed', 'student', 'freelance', 'other']).optional(),
  noticePeriod: z.number().int().min(0).max(365).optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'text', 'linkedin']).optional(),

  // Hotlist
  isOnHotlist: z.boolean().default(false),
  hotlistNotes: z.string().max(500).optional(),

  // Tags & Jobs
  tags: z.array(z.string()).max(20).optional(),
  associatedJobIds: z.array(z.string().uuid()).optional(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateInput>;
```

### Output Schema

```typescript
export const createCandidateOutput = z.object({
  candidateId: z.string().uuid(),
  profileComplete: z.boolean(),
  resumeUploaded: z.boolean(),
  submissions: z.array(z.object({
    submissionId: z.string().uuid(),
    jobId: z.string().uuid(),
    status: z.literal('sourced'),
  })).optional(),
});

export type CreateCandidateOutput = z.infer<typeof createCandidateOutput>;
```

### Processing Steps

1. **Validate Input** (~50ms)

   ```typescript
   // Check permissions
   const hasPermission = ctx.user.permissions.includes('candidate.create');
   if (!hasPermission) throw new TRPCError({ code: 'FORBIDDEN' });

   // Validate rate range
   if (input.candidateHourlyRate && input.minimumHourlyRate &&
       input.candidateHourlyRate < input.minimumHourlyRate) {
     throw new TRPCError({
       code: 'BAD_REQUEST',
       message: 'Target rate cannot be less than minimum rate'
     });
   }
   ```

2. **Check Duplicate** (~100ms)

   ```sql
   SELECT id, first_name, last_name, email, phone
   FROM user_profiles
   WHERE org_id = $1
     AND (
       LOWER(email) = LOWER($2)
       OR (phone IS NOT NULL AND phone = $3)
       OR (linkedin_url IS NOT NULL AND linkedin_url = $4)
     )
     AND role = 'candidate'
   LIMIT 1;
   ```

3. **Create Candidate Record** (~100ms)

   ```sql
   INSERT INTO user_profiles (
     id, org_id, role,
     first_name, last_name, email, phone, linkedin_url,
     professional_headline, professional_summary,
     experience_years, current_visa, visa_expiry_date,
     current_status, location, willing_to_relocate,
     min_hourly_rate, hourly_rate,
     employment_status, notice_period_days, preferred_contact_method,
     lead_source, source_details,
     candidate_status, is_on_hotlist, hotlist_added_at, hotlist_added_by, hotlist_notes,
     created_at, updated_at, created_by
   ) VALUES (
     gen_random_uuid(), $1, 'candidate',
     $2, $3, $4, $5, $6,
     $7, $8,
     $9, $10, $11,
     $12, $13, $14,
     $15, $16,
     $17, $18, $19,
     $20, $21,
     'active', $22, CASE WHEN $22 THEN NOW() ELSE NULL END, CASE WHEN $22 THEN $23 ELSE NULL END, $24,
     NOW(), NOW(), $23
   ) RETURNING id;
   ```

4. **Create Skills Associations** (~50ms)

   ```sql
   INSERT INTO candidate_skills (id, candidate_id, skill_name, created_at)
   SELECT gen_random_uuid(), $1, unnest($2::text[]), NOW();
   ```

5. **Link Resume** (~50ms)

   ```sql
   INSERT INTO candidate_resumes (
     id, candidate_id, version, file_name, storage_path,
     resume_type, uploaded_at, uploaded_by, created_at
   ) VALUES (
     gen_random_uuid(), $1, 1, $2, $3,
     $4, NOW(), $5, NOW()
   );
   ```

6. **Create Submissions for Jobs** (~50ms per job)

   ```sql
   INSERT INTO submissions (
     id, org_id, job_id, candidate_id,
     status, source, created_at, created_by
   )
   SELECT
     gen_random_uuid(), $1, unnest($2::uuid[]), $3,
     'sourced', 'manual', NOW(), $4;
   ```

7. **Add Tags** (~50ms)

   ```sql
   INSERT INTO candidate_tags (id, org_id, candidate_id, tag, created_at)
   SELECT gen_random_uuid(), $1, $2, unnest($3::text[]), NOW()
   ON CONFLICT (org_id, candidate_id, tag) DO NOTHING;
   ```

8. **Log Activity** (~50ms)

   ```sql
   INSERT INTO activities (
     id, org_id, entity_type, entity_id,
     activity_type, description, created_by, created_at, metadata
   ) VALUES (
     gen_random_uuid(), $1, 'candidate', $2,
     'created', 'Candidate profile created', $3, NOW(), $4::jsonb
   );
   ```

---

## Database Schema References

### Table: user_profiles (Candidate Fields)

**File:** `src/lib/db/schema/core.ts`

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `org_id` | UUID | FK → organizations.id, NOT NULL | |
| `role` | ENUM | NOT NULL | 'candidate', 'employee', 'client', etc. |
| `first_name` | VARCHAR(50) | NOT NULL | |
| `last_name` | VARCHAR(50) | NOT NULL | |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE per org | Indexed |
| `phone` | VARCHAR(20) | | |
| `linkedin_url` | VARCHAR(500) | | |
| `professional_headline` | VARCHAR(200) | | |
| `professional_summary` | TEXT | | Max 2000 chars |
| `experience_years` | INT | | 0-50 |
| `current_visa` | ENUM | | See visa enum |
| `visa_expiry_date` | DATE | | |
| `current_status` | ENUM | | 'immediate', '2_weeks', '30_days', 'not_available' |
| `location` | VARCHAR(200) | | |
| `willing_to_relocate` | BOOLEAN | DEFAULT false | |
| `min_hourly_rate` | DECIMAL(8,2) | | |
| `hourly_rate` | DECIMAL(8,2) | | |
| `employment_status` | ENUM | | 'employed', 'unemployed', 'student', 'freelance' |
| `notice_period_days` | INT | | |
| `preferred_contact_method` | ENUM | | 'email', 'phone', 'text', 'linkedin' |
| `lead_source` | ENUM | | See source enum |
| `source_details` | VARCHAR(500) | | |
| `candidate_status` | ENUM | DEFAULT 'active' | 'active', 'bench', 'placed', 'inactive' |
| `is_on_hotlist` | BOOLEAN | DEFAULT false | |
| `hotlist_added_at` | TIMESTAMP | | |
| `hotlist_added_by` | UUID | FK → user_profiles.id | |
| `hotlist_notes` | VARCHAR(500) | | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |
| `created_by` | UUID | FK → user_profiles.id | |

### Table: candidate_skills

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `candidate_id` | UUID | FK → user_profiles.id, NOT NULL | |
| `skill_name` | VARCHAR(100) | NOT NULL | |
| `years_experience` | INT | | Optional |
| `proficiency` | ENUM | | 'beginner', 'intermediate', 'expert' |
| `created_at` | TIMESTAMP | NOT NULL | |

**Unique Constraint:** `(candidate_id, skill_name)`

### Table: candidate_resumes

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `candidate_id` | UUID | FK → user_profiles.id, NOT NULL | |
| `version` | INT | NOT NULL | Auto-increment per candidate |
| `file_name` | VARCHAR(255) | NOT NULL | |
| `storage_path` | VARCHAR(500) | NOT NULL | Supabase storage path |
| `resume_type` | ENUM | NOT NULL | 'master', 'formatted', 'client_specific' |
| `file_size` | INT | | Bytes |
| `is_archived` | BOOLEAN | DEFAULT false | |
| `uploaded_at` | TIMESTAMP | NOT NULL | |
| `uploaded_by` | UUID | FK → user_profiles.id | |
| `created_at` | TIMESTAMP | NOT NULL | |

### Table: candidate_tags

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PK | |
| `org_id` | UUID | FK → organizations.id, NOT NULL | |
| `candidate_id` | UUID | FK → user_profiles.id, NOT NULL | |
| `tag` | VARCHAR(50) | NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |

**Unique Constraint:** `(org_id, candidate_id, tag)`

### Indexes

```sql
-- Email uniqueness check
CREATE UNIQUE INDEX idx_user_profiles_org_email
  ON user_profiles(org_id, LOWER(email))
  WHERE role = 'candidate';

-- LinkedIn deduplication
CREATE INDEX idx_user_profiles_linkedin
  ON user_profiles(linkedin_url)
  WHERE linkedin_url IS NOT NULL AND role = 'candidate';

-- Phone deduplication
CREATE INDEX idx_user_profiles_phone
  ON user_profiles(phone)
  WHERE phone IS NOT NULL AND role = 'candidate';

-- Skills lookup
CREATE INDEX idx_candidate_skills_candidate
  ON candidate_skills(candidate_id);

-- Full-text search on candidates
CREATE INDEX idx_user_profiles_search
  ON user_profiles USING gin(
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(professional_headline, '') || ' ' ||
      coalesce(location, '')
    )
  )
  WHERE role = 'candidate';

-- Hotlist quick access
CREATE INDEX idx_user_profiles_hotlist
  ON user_profiles(org_id, is_on_hotlist)
  WHERE role = 'candidate' AND is_on_hotlist = true;
```

---

## Resume Storage Configuration

| Property | Value |
|----------|-------|
| Bucket | `resumes` (Supabase Storage) |
| Access Level | Private (signed URLs required) |
| Path Structure | `resumes/{candidateId}/v{version}-{fileHash}.{ext}` |
| Max File Size | 10 MB |
| Accepted Types | .pdf, .doc, .docx |
| Retention | Indefinite |
| Signed URL Expiry | 1 hour |

---

## Enterprise & Multi-National Features

### Multi-Currency Support

All rate fields support multiple currencies with real-time conversion:

| Currency | Symbol | Supported Regions |
|----------|--------|-------------------|
| USD | $ | US, Americas |
| CAD | C$ | Canada |
| EUR | € | EMEA |
| GBP | £ | UK |
| INR | ₹ | India |
| AUD | A$ | Australia, APAC |

**Rate Display:** System displays candidate's preferred currency with USD equivalent
```
Desired Rate: C$120/hr (≈ $89 USD)
```

### Timezone Handling

- All timestamps stored in UTC
- Displayed in user's local timezone
- Candidate availability shown in their local time
- Interview scheduling respects all party timezones

### Regional Team Routing

When creating candidates, system auto-assigns based on:
- Candidate location → Regional team (NA, EMEA, APAC, LATAM)
- Lead source → Campaign owner's region
- Manual override available for cross-regional hires

### Compliance Features

| Requirement | Implementation |
|-------------|----------------|
| **GDPR** | Consent checkbox, data retention policy, right to delete |
| **CCPA** | Do-not-sell flag, data export capability |
| **EEOC** | Optional demographic collection, separate from hiring decisions |
| **Data Residency** | EU candidate data stored in EU region |

### Audit Trail

Every candidate action logged:
```
{
  "action": "candidate.created",
  "user_id": "uuid",
  "timestamp": "2025-12-01T14:30:00Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Chrome/120.0",
  "changes": { "fields": [...] },
  "metadata": { "source": "linkedin", "campaign_id": "uuid" }
}
```

### International Candidate Fields

Additional fields for international candidates:

| Field | Type | Description |
|-------|------|-------------|
| `countryOfCitizenship` | Dropdown | Primary citizenship |
| `workAuthorizationCountries` | Multi-select | Countries where authorized to work |
| `languagesSpoken` | Multi-select | Languages with proficiency level |
| `timezonePref` | Dropdown | Preferred working timezone |
| `remotePreference` | Enum | Remote, Hybrid, On-site |

---

*Last Updated: 2024-12-01*
