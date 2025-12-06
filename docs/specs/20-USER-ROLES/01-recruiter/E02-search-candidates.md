# Use Case: Search Candidates

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-008 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Search and filter candidates in the database to find qualified talent for job requisitions |
| Frequency | 15-25 times per day |
| Estimated Time | 2-10 minutes per search |
| Priority | CRITICAL (Core Recruiting Activity) |
| Business Impact | Direct impact on time-to-fill, candidate quality, and placement success |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "candidate.read" permission (default for Recruiter role)
3. Candidate database contains searchable profiles
4. User has an active job requisition or prospecting for future needs
5. Search indices are built and up-to-date

---

## Trigger

One of the following:
- Recruiter receives new job requisition and needs to find candidates
- Client requests candidates with specific skills/experience
- Recruiter is building a bench of qualified candidates for anticipated needs
- Manager assigns candidate search task
- Recruiter needs to fill pipeline for existing job
- Weekly prospecting activity (proactive talent mapping)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Candidate Search

**User Action:** Click "Candidates" in the sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/candidates`
- Candidate search screen loads
- Loading skeleton shows for 200-500ms
- Default view shows recent candidates or saved search results

**Screen State:**
```
+----------------------------------------------------------+
| Candidates                       [+ Add] [Import] [⚙] [⌘K] |
+----------------------------------------------------------+
| [🔍 Search candidates by name, skills, location...]       |
| [Advanced Search Builder ▼]                   [Save 💾]  |
+----------------------------------------------------------+
| 📁 Saved Searches:                              [Manage]  |
| • Java Developers - Remote (24 results)                  |
| • Sr DevOps - NYC (12 results)                           |
| • AI/ML Engineers (8 results)                            |
+----------------------------------------------------------+
| Filters                    │ Results (1,247 candidates)  |
|                            │                             |
| Skills [+ Add]             │ ┌─────────────────────────┐ |
|   React [×]                │ │ Sarah Johnson           │ |
|   Node.js [×]              │ │ ⭐⭐⭐⭐⭐ 95% match     │ |
|   AWS [×]                  │ │                         │ |
|                            │ │ Sr Software Engineer    │ |
| Experience                 │ │ 8 yrs | React, Node.js  │ |
|   Min: [5  ] years         │ │ 📍 San Francisco, CA    │ |
|   Max: [10 ] years         │ │ 🏠 Remote OK            │ |
|                            │ │ 💵 $110-130/hr          │ |
| Location                   │ │ ✅ US Citizen           │ |
|   [San Francisco, CA] [×]  │ │                         │ |
|   ☑ Remote OK              │ │ [View] [Add to Job]     │ |
|   ☑ Willing to relocate    │ └─────────────────────────┘ |
|                            │                             |
| Visa Status                │ ┌─────────────────────────┐ |
|   ☑ US Citizen             │ │ Michael Chen            │ |
|   ☐ Green Card             │ │ ⭐⭐⭐⭐ 88% match       │ |
|   ☐ H1B                    │ │ ...                     │ |
|                            │                             |
| Availability               │ Sort by:                    |
|   ○ Available now          │ [Match Score    ▼]         |
|   ○ Within 2 weeks         │                             |
|   ○ Within 30 days         │ View: [Grid] [List] [Table]|
|   ● Any                    │                             |
|                            │ Results/page: [25  ▼]      |
| Rate Range                 │                             |
|   Min: [$    ] /hr         │ << 1 2 3 4 5 ... 50 >>     |
|   Max: [$    ] /hr         │                             |
|                            │                             |
| Status                     │                             |
|   ☑ Active                 │                             |
|   ☐ Placed                 │                             |
|   ☐ Inactive               │                             |
|                            │                             |
| [Clear All]  [Apply]       │ [Export CSV] [Bulk Action] |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Enter Basic Search Query

**User Action:** Click in search box, type "React Senior Developer"

**System Response:**
- Cursor blinks in search field
- Characters appear as typed
- **Auto-suggest dropdown appears** after 3 characters
- Suggests: Skills, Job Titles, Companies, Names
- Search executes on Enter or after 500ms pause

**Screen State (Auto-suggest):**
```
+----------------------------------------------------------+
| [🔍 React Senior Developer                              ]|
| ┌─────────────────────────────────────────────────────┐ |
| │ 💡 Suggestions:                                     │ |
| │                                                     │ |
| │ 🔧 Skills:                                          │ |
| │   React.js (1,247 candidates)                       │ |
| │   React Native (342 candidates)                     │ |
| │                                                     │ |
| │ 💼 Job Titles:                                      │ |
| │   Senior React Developer (89 candidates)            │ |
| │   React Developer (234 candidates)                  │ |
| │   Senior Software Engineer (1,056 candidates)       │ |
| │                                                     │ |
| │ 🏢 Recent Companies:                                │ |
| │   Worked at Meta (15 candidates)                    │ |
| │   Worked at Google (23 candidates)                  │ |
| └─────────────────────────────────────────────────────┘ |
+----------------------------------------------------------+
```

**Field Specification: Search Query**
| Property | Value |
|----------|-------|
| Field Name | `searchQuery` |
| Type | Text Input with Auto-suggest |
| Label | "Search candidates" |
| Placeholder | "Search by name, skills, location, job title, company..." |
| Required | No |
| Max Length | 500 characters |
| Search Behavior | Partial match, case-insensitive |
| Search Fields | `firstName`, `lastName`, `skills`, `title`, `location`, `pastCompanies`, `bio` |
| Auto-suggest | Yes - Shows top 10 matches after 3 characters |
| Debounce | 500ms |
| Keyboard | Standard text |

**Time:** ~3 seconds

---

### Step 3: Use Boolean Search (Advanced)

**User Action:** Click "Advanced Search Builder ▼" to expand boolean search

**System Response:**
- Advanced panel slides down (300ms)
- Shows Boolean operator helper
- Displays example queries

**Screen State (Boolean Builder):**
```
+----------------------------------------------------------+
| Advanced Search Builder                            [▲]   |
+----------------------------------------------------------+
| Boolean Query:                                            |
| [(React OR Vue) AND (Senior OR Lead) AND NOT Junior]     |
|                                                   0/1000  |
|                                                          |
| Quick Operators:                                         |
| [AND] [OR] [NOT] ["Exact"] [( )] [Field:]               |
|                                                          |
| 💡 Examples:                                             |
| • Java AND AWS AND (5+ years)                           |
| • "Machine Learning" OR "Deep Learning" OR AI           |
| • React NOT Angular                                     |
| • location:NYC AND remote:yes                           |
| • title:"Senior Engineer" AND company:Google            |
|                                                          |
| Field Prefixes:                                          |
| • skill:          Search skills only                    |
| • title:          Search job titles only                |
| • location:       Search location only                  |
| • company:        Search past companies                 |
| • visa:           Search visa status                    |
| • rate:           Search rate range (e.g. rate:>100)    |
|                                                          |
| [Build Query]  [Clear]  [Search]                        |
+----------------------------------------------------------+
```

**User Action:** Type: `(React OR Vue) AND Senior AND location:SF`

**System Response:**
- Query validated in real-time
- Syntax errors highlighted
- Search executes on "Search" button click

**Field Specification: Boolean Query**
| Property | Value |
|----------|-------|
| Field Name | `booleanQuery` |
| Type | Textarea |
| Label | "Boolean Query" |
| Placeholder | "e.g., (React OR Angular) AND Senior AND NOT Junior" |
| Required | No |
| Max Length | 1000 characters |
| Validation | Valid boolean syntax |
| Operators Supported | |
| - `AND` | Both terms must be present |
| - `OR` | Either term must be present |
| - `NOT` | Excludes term |
| - `"..."` | Exact phrase match |
| - `(...)` | Grouping |
| - `field:value` | Field-specific search |
| Error Messages | |
| - Invalid syntax | "Invalid boolean syntax: {error details}" |
| - Unmatched parens | "Unmatched parentheses" |

**Time:** ~30 seconds

---

### Step 4: Add Skill Filters

**User Action:** Click "[+ Add]" next to Skills filter

**System Response:**
- Skill tag input appears
- Cursor focuses on input
- Auto-complete dropdown shows popular skills

**User Action:** Type "Rea", select "React" from dropdown, press Enter

**System Response:**
- "React" tag appears with × button
- Input clears for next skill
- Results update automatically (if auto-apply is on)

**User Action:** Add "Node.js" and "AWS"

**System Response:**
- Three skill tags now visible: [React ×] [Node.js ×] [AWS ×]
- Results filter to show only candidates with ALL three skills (AND logic)

**Screen State:**
```
+----------------------------------------------------------+
| Filters                                                   |
|                                                          |
| Skills [+ Add]                                           |
|   React [×]  Node.js [×]  AWS [×]                        |
|   [+ Add another skill...]                               |
|                                                          |
| Skill Match Logic:                                       |
|   ● AND (must have all)                                  |
|   ○ OR (must have any)                                   |
+----------------------------------------------------------+
```

**Field Specification: Skills Filter**
| Property | Value |
|----------|-------|
| Field Name | `skills` |
| Type | Multi-select Tag Input |
| Label | "Skills" |
| Required | No |
| Data Source | `skills` table + candidate profiles |
| Allow Custom | Yes (creates new skill if not exists) |
| Max Tags | 20 |
| Match Logic | AND (all required) or OR (any required) - toggle |
| Display Format | Skill name with count: "React (1,247)" |
| Auto-complete | Yes - Shows top 20 skills after 2 characters |
| Sort Order | By candidate count (descending) |

**Time:** ~10 seconds

---

### Step 5: Set Experience Range

**User Action:** Enter "5" in Min Experience, "10" in Max Experience

**System Response:**
- Numbers appear in fields
- Results filter to candidates with 5-10 years experience
- Result count updates

**Field Specification: Min Experience**
| Property | Value |
|----------|-------|
| Field Name | `minExperienceYears` |
| Type | Number Input |
| Label | "Min" |
| Suffix | "years" |
| Min | 0 |
| Max | 50 |
| Default | null (no minimum) |
| Step | 1 |

**Field Specification: Max Experience**
| Property | Value |
|----------|-------|
| Field Name | `maxExperienceYears` |
| Type | Number Input |
| Label | "Max" |
| Suffix | "years" |
| Min | 0 |
| Max | 50 |
| Validation | Must be ≥ Min Experience |
| Error | "Max experience must be greater than or equal to min" |

**Time:** ~3 seconds

---

### Step 6: Filter by Location

**User Action:** Click in Location filter, type "San Francisco"

**System Response:**
- Auto-complete shows matching locations
- Dropdown displays: "San Francisco, CA, USA"

**User Action:** Click "San Francisco, CA, USA"

**System Response:**
- Location tag appears: [San Francisco, CA ×]
- Results filter to candidates in SF area
- Map view option appears (if enabled)

**User Action:** Check "Remote OK" checkbox

**System Response:**
- Results expand to include remote-capable candidates anywhere
- Remote icon (🏠) appears on remote candidates

**Field Specification: Location**
| Property | Value |
|----------|-------|
| Field Name | `location` |
| Type | Multi-select Tag Input with Auto-complete |
| Label | "Location" |
| Required | No |
| Auto-complete | Google Places API or local location database |
| Allow Multiple | Yes (OR logic - candidates in any location) |
| Format | "City, State" or "City, Country" |
| Max Locations | 10 |

**Field Specification: Remote OK**
| Property | Value |
|----------|-------|
| Field Name | `remoteOk` |
| Type | Checkbox |
| Label | "Remote OK" |
| Default | Unchecked |
| Behavior | When checked, includes candidates marked as remote-capable regardless of location |

**Field Specification: Willing to Relocate**
| Property | Value |
|----------|-------|
| Field Name | `willingToRelocate` |
| Type | Checkbox |
| Label | "Willing to relocate" |
| Default | Unchecked |
| Behavior | When checked, includes candidates who indicated willingness to relocate |

**Time:** ~5 seconds

---

### Step 7: Filter by Visa Status

**User Action:** Check "US Citizen" and "Green Card" checkboxes

**System Response:**
- Checkboxes become checked (✓)
- Results filter to show only US Citizens and Green Card holders
- Other visa statuses excluded

**Screen State:**
```
+----------------------------------------------------------+
| Visa Status                                              |
|   ☑ US Citizen              (847 candidates)             |
|   ☑ Green Card              (234 candidates)             |
|   ☐ H1B                     (156 candidates)             |
|   ☐ L1                      (23 candidates)              |
|   ☐ OPT/CPT                 (89 candidates)              |
|   ☐ TN Visa                 (45 candidates)              |
|   ☐ EAD                     (67 candidates)              |
|   ☐ Require Sponsorship     (312 candidates)             |
+----------------------------------------------------------+
```

**Field Specification: Visa Status**
| Property | Value |
|----------|-------|
| Field Name | `visaStatus` |
| Type | Multi-select Checkbox Group |
| Label | "Visa Status" |
| Required | No |
| Match Logic | OR (candidate has any selected visa) |
| Options | |
| - `us_citizen` | "US Citizen" |
| - `green_card` | "Green Card" |
| - `h1b` | "H1B" |
| - `l1` | "L1" |
| - `opt_cpt` | "OPT/CPT" |
| - `tn` | "TN Visa" |
| - `ead` | "EAD (Employment Authorization Document)" |
| - `needs_sponsorship` | "Require Sponsorship" |
| Display Format | "{label} ({count} candidates)" |

**Time:** ~3 seconds

---

### Step 8: Set Availability Filter

**User Action:** Click "Available now" radio button

**System Response:**
- Radio button selected
- Results filter to candidates marked as immediately available
- Availability date shown on each result card

**Field Specification: Availability**
| Property | Value |
|----------|-------|
| Field Name | `availability` |
| Type | Radio Button Group |
| Label | "Availability" |
| Default | "Any" |
| Options | |
| - `available_now` | "Available now" (candidates with availability ≤ today) |
| - `within_2_weeks` | "Within 2 weeks" (availability ≤ today + 14 days) |
| - `within_30_days` | "Within 30 days" (availability ≤ today + 30 days) |
| - `any` | "Any" (no filter) |

**Time:** ~2 seconds

---

### Step 9: Set Rate Range

**User Action:** Enter "100" in Min Rate, "150" in Max Rate

**System Response:**
- Numbers appear with $ prefix and /hr suffix
- Results filter to candidates with desired rate in range
- Rate shown on result cards

**Field Specification: Min Rate**
| Property | Value |
|----------|-------|
| Field Name | `minRate` |
| Type | Currency Input |
| Label | "Min" |
| Prefix | "$" |
| Suffix | "/hr" (configurable based on rate type) |
| Min Value | 0 |
| Max Value | 9999.99 |
| Precision | 2 decimal places |

**Field Specification: Max Rate**
| Property | Value |
|----------|-------|
| Field Name | `maxRate` |
| Type | Currency Input |
| Label | "Max" |
| Prefix | "$" |
| Suffix | "/hr" |
| Min Value | 0 |
| Validation | Must be ≥ Min Rate |
| Error | "Max rate must be greater than or equal to min" |

**Time:** ~3 seconds

---

### Step 10: Filter by Status

**User Action:** Ensure "Active" is checked, uncheck "Placed" and "Inactive"

**System Response:**
- Only active candidates shown
- Placed and inactive candidates excluded from results

**Field Specification: Status**
| Property | Value |
|----------|-------|
| Field Name | `profileStatus` |
| Type | Multi-select Checkbox Group |
| Label | "Status" |
| Default | ["active"] (Active checked by default) |
| Match Logic | OR (candidate has any selected status) |
| Options | |
| - `active` | "Active" - Currently seeking opportunities |
| - `placed` | "Placed" - Currently on assignment |
| - `inactive` | "Inactive" - Not actively seeking |
| - `passive` | "Passive" - Open to opportunities |
| - `do_not_contact` | "Do Not Contact" - Blacklisted |

**Time:** ~2 seconds

---

### Step 11: Review Search Results

**User Action:** Scroll through results, review candidate cards

**System Response:**
- Results display in grid/list view
- Each card shows:
  - Name
  - Match score (star rating + percentage)
  - Current title
  - Years of experience
  - Top skills (first 3-5)
  - Location + remote status
  - Desired rate
  - Visa status
  - Availability date
  - Quick actions (View, Add to Job, Contact)

**Screen State (Result Card Detail):**
```
+----------------------------------------------------------+
| ┌──────────────────────────────────────────────────────┐|
| │ Sarah Johnson                          [⋮ Actions ▼] ││
| │ ⭐⭐⭐⭐⭐ 95% match                                 ││
| │                                                      ││
| │ 💼 Senior Software Engineer                          ││
| │ 🕐 8 years experience                                ││
| │                                                      ││
| │ 🔧 Skills:                                           ││
| │    React • Node.js • AWS • TypeScript • PostgreSQL   ││
| │    + 8 more skills                                   ││
| │                                                      ││
| │ 📍 San Francisco, CA                                 ││
| │ 🏠 Remote OK (PST timezone preferred)                ││
| │                                                      ││
| │ 💵 Desired Rate: $110-130/hr                         ││
| │ ✅ Visa: US Citizen                                  ││
| │ 📅 Available: Immediately                            ││
| │                                                      ││
| │ 📝 Last Updated: 2 days ago                          ││
| │ 👁 Last Contacted: Never                             ││
| │                                                      ││
| │ [View Profile]  [Add to Job]  [Contact]  [Save]     ││
| └──────────────────────────────────────────────────────┘|
+----------------------------------------------------------+
```

**Match Score Algorithm:**
```typescript
// Match score calculation (0-100%)
let score = 0;

// Skills match (40% weight)
const requiredSkillsMatch = (matchedSkills / requiredSkills.length) * 40;
score += requiredSkillsMatch;

// Experience match (20% weight)
const expMatch = candidate.yearsExperience >= minExp &&
                 candidate.yearsExperience <= maxExp;
score += expMatch ? 20 : 0;

// Location match (15% weight)
const locMatch = candidate.location === searchLocation ||
                 candidate.remoteOk;
score += locMatch ? 15 : 0;

// Rate match (10% weight)
const rateMatch = candidate.desiredRate >= minRate &&
                  candidate.desiredRate <= maxRate;
score += rateMatch ? 10 : 0;

// Visa match (10% weight)
const visaMatch = visaStatuses.includes(candidate.visaStatus);
score += visaMatch ? 10 : 0;

// Availability match (5% weight)
const availMatch = candidate.availableDate <= maxAvailability;
score += availMatch ? 5 : 0;

// Bonus: Recent activity (+5%)
if (candidate.lastUpdated < 7 days) score += 5;

// Bonus: Previous placements (+5%)
if (candidate.placementsCount > 0) score += 5;

return Math.min(score, 100); // Cap at 100%
```

**Time:** ~20 seconds

---

### Step 12: Sort Results

**User Action:** Click "Sort by" dropdown, select "Years of Experience (High to Low)"

**System Response:**
- Dropdown opens
- Shows sort options
- Results re-order by experience (descending)

**Field Specification: Sort By**
| Property | Value |
|----------|-------|
| Field Name | `sortBy` |
| Type | Dropdown |
| Label | "Sort by" |
| Default | "Match Score (High to Low)" |
| Options | |
| - `match_score_desc` | "Match Score (High to Low)" |
| - `match_score_asc` | "Match Score (Low to High)" |
| - `experience_desc` | "Years of Experience (High to Low)" |
| - `experience_asc` | "Years of Experience (Low to High)" |
| - `rate_desc` | "Desired Rate (High to Low)" |
| - `rate_asc` | "Desired Rate (Low to High)" |
| - `availability_asc` | "Available Soonest" |
| - `availability_desc` | "Available Latest" |
| - `last_updated_desc` | "Recently Updated" |
| - `last_updated_asc` | "Least Recently Updated" |
| - `name_asc` | "Name (A-Z)" |
| - `name_desc` | "Name (Z-A)" |

**Time:** ~2 seconds

---

### Step 13: Change View Mode

**User Action:** Click "List" view icon

**System Response:**
- View changes from grid to list (table format)
- Shows more details per candidate in rows
- Compact view for easier scanning

**Screen State (List View):**
```
+----------------------------------------------------------+
| View: [Grid] [● List] [Table]                            |
+----------------------------------------------------------+
| Match  Name            Title           Skills  Loc   Rate |
| ──────────────────────────────────────────────────────── |
| ⭐ 95% Sarah Johnson   Sr Engineer     R,N,A   SF   $120 |
| ⭐ 88% Michael Chen    Lead Dev        R,V,K   NYC  $135 |
| ⭐ 82% Emily Davis     Full Stack Dev  R,P,M   LA   $105 |
| ⭐ 78% David Lee       Sr Developer    N,A,D   BOS  $115 |
| ...                                                       |
+----------------------------------------------------------+
```

**Field Specification: View Mode**
| Property | Value |
|----------|-------|
| Field Name | `viewMode` |
| Type | Radio Button Group (Icon Toggle) |
| Label | "View" |
| Default | "Grid" |
| Options | |
| - `grid` | Grid view - Large cards with full details |
| - `list` | List view - Compact rows with key details |
| - `table` | Table view - Spreadsheet-like with all fields |

**Time:** ~1 second

---

### Step 14: Set Results Per Page

**User Action:** Click "Results/page" dropdown, select "50"

**System Response:**
- Dropdown opens
- Shows page size options
- Results re-load with 50 per page

**Field Specification: Results Per Page**
| Property | Value |
|----------|-------|
| Field Name | `pageSize` |
| Type | Dropdown |
| Label | "Results/page" |
| Default | 25 |
| Options | 10, 25, 50, 100, 200 |

**Time:** ~2 seconds

---

### Step 15: Save Search

**User Action:** Click "Save 💾" button at top right

**System Response:**
- "Save Search" modal appears
- Prompts for search name and settings

**Screen State (Save Modal):**
```
+----------------------------------------------------------+
|                        Save Search                   [×] |
+----------------------------------------------------------+
| Save this search for quick access later.                 |
|                                                          |
| Search Name *                                            |
| [React Senior Developers - SF                   ] 0/100  |
|                                                          |
| Description                                              |
| [Senior React developers in SF with 5-10 yrs exp]       |
|                                                   0/500  |
|                                                          |
| ☑ Make this my default search                           |
| ☐ Share with team                                       |
| ☑ Email me weekly with new matches                      |
|                                                          |
| Current Filters:                                         |
| • Skills: React, Node.js, AWS                           |
| • Experience: 5-10 years                                |
| • Location: San Francisco, CA                           |
| • Remote: Yes                                           |
| • Visa: US Citizen, Green Card                          |
| • Availability: Any                                     |
| • Rate: $100-150/hr                                     |
| • Status: Active                                        |
|                                                          |
| [Cancel]  [Save Search]                                 |
+----------------------------------------------------------+
```

**User Action:** Type name "React Senior Developers - SF", click "Save Search"

**System Response:**
- Modal closes
- Toast: "Search saved successfully"
- Saved search appears in sidebar under "Saved Searches"
- Search is now accessible with one click

**Field Specification: Search Name**
| Property | Value |
|----------|-------|
| Field Name | `searchName` |
| Type | Text Input |
| Label | "Search Name" |
| Placeholder | "e.g., Senior Java Developers - Remote" |
| Required | Yes |
| Max Length | 100 characters |
| Validation | Unique within user's saved searches |
| Error Messages | |
| - Empty | "Search name is required" |
| - Duplicate | "A search with this name already exists" |

**Field Specification: Search Description**
| Property | Value |
|----------|-------|
| Field Name | `searchDescription` |
| Type | Textarea |
| Label | "Description" |
| Placeholder | "Brief description of this search..." |
| Required | No |
| Max Length | 500 characters |

**Field Specification: Default Search**
| Property | Value |
|----------|-------|
| Field Name | `isDefault` |
| Type | Checkbox |
| Label | "Make this my default search" |
| Default | Unchecked |
| Behavior | When checked, this search loads automatically on Candidates page |

**Field Specification: Share with Team**
| Property | Value |
|----------|-------|
| Field Name | `shareWithTeam` |
| Type | Checkbox |
| Label | "Share with team" |
| Default | Unchecked |
| Behavior | When checked, search is visible to pod members |

**Field Specification: Email Alerts**
| Property | Value |
|----------|-------|
| Field Name | `emailAlerts` |
| Type | Checkbox |
| Label | "Email me weekly with new matches" |
| Default | Unchecked |
| Behavior | System sends email every Monday with new candidates matching criteria |

**Time:** ~15 seconds

---

### Step 16: Perform Quick Actions on Candidate

**User Action:** Click "Add to Job" on Sarah Johnson's card

**System Response:**
- "Add to Job" modal opens
- Shows list of active jobs
- Pre-selects most recent job if applicable

**Screen State (Add to Job Modal):**
```
+----------------------------------------------------------+
|                    Add to Job                        [×] |
+----------------------------------------------------------+
| Select a job to add Sarah Johnson to:                    |
|                                                          |
| [Search jobs...]                                         |
|                                                          |
| ● Sr Software Engineer - Google                          |
|   Skills match: React, Node.js, AWS (95%)                |
|   Status: Active | 12 candidates in pipeline             |
|                                                          |
| ○ Full Stack Developer - Meta                            |
|   Skills match: React, Node.js (85%)                     |
|   Status: Active | 8 candidates in pipeline              |
|                                                          |
| ○ Lead React Developer - Netflix                         |
|   Skills match: React (75%)                              |
|   Status: Active | 5 candidates in pipeline              |
|                                                          |
| Add Note (optional):                                     |
| [Found via search - perfect skills match!        ]       |
|                                                   0/500  |
|                                                          |
| [Cancel]  [Add to Job]                                  |
+----------------------------------------------------------+
```

**User Action:** Select "Sr Software Engineer - Google", click "Add to Job"

**System Response:**
1. Modal closes
2. API call creates submission record
3. Toast: "Sarah Johnson added to Sr Software Engineer - Google"
4. Candidate card updates: "Added to job" badge appears
5. Submission created with status = "sourced"

**Backend Processing:**
```typescript
// Create submission
await db.insert(submissions).values({
  orgId: currentOrgId,
  jobId: selectedJobId,
  candidateId: candidateId,
  status: 'sourced',
  source: 'database_search',
  addedBy: currentUserId,
  notes: userNote,
  createdAt: new Date()
});

// Log activity
await db.insert(activities).values({
  orgId: currentOrgId,
  entityType: 'submission',
  entityId: submissionId,
  activityType: 'candidate_sourced',
  description: `${candidateName} added to ${jobTitle} via database search`,
  createdBy: currentUserId,
  createdAt: new Date()
});

// Update job pipeline count
await db.update(jobs)
  .set({
    pipelineCount: sql`pipeline_count + 1`,
    updatedAt: new Date()
  })
  .where(eq(jobs.id, jobId));
```

**Time:** ~5 seconds

---

### Step 17: Export Search Results

**User Action:** Click "Export CSV" button

**System Response:**
- "Export Options" modal appears
- Prompts for export format and fields

**Screen State (Export Modal):**
```
+----------------------------------------------------------+
|                    Export Results                    [×] |
+----------------------------------------------------------+
| Export 247 candidates matching your search criteria.     |
|                                                          |
| Format:                                                  |
|   ● CSV (Excel compatible)                               |
|   ○ XLSX (Excel workbook)                                |
|   ○ JSON                                                 |
|                                                          |
| Fields to Include:                                       |
|   ☑ Name                                                 |
|   ☑ Email                                                |
|   ☑ Phone                                                |
|   ☑ Title                                                |
|   ☑ Skills (comma-separated)                             |
|   ☑ Experience (years)                                   |
|   ☑ Location                                             |
|   ☑ Desired Rate                                         |
|   ☑ Visa Status                                          |
|   ☑ Availability Date                                    |
|   ☐ Resume URL                                           |
|   ☐ LinkedIn URL                                         |
|   ☐ Last Contacted Date                                  |
|   ☐ Source                                               |
|                                                          |
| Include:                                                 |
|   ○ First 25 results                                     |
|   ○ Current page (25 results)                            |
|   ● All results (247 candidates)                         |
|                                                          |
| [Cancel]  [Export]                                      |
+----------------------------------------------------------+
```

**User Action:** Select "CSV", check desired fields, click "Export"

**System Response:**
1. Modal closes
2. Loading indicator: "Preparing export..."
3. After 2-3 seconds, file downloads: `candidate-search-results-2024-11-30.csv`
4. Toast: "Export complete. 247 candidates exported."

**CSV Format:**
```csv
Name,Email,Phone,Title,Skills,Experience,Location,Desired Rate,Visa Status,Availability
Sarah Johnson,sarah.j@example.com,415-555-0123,Senior Software Engineer,"React,Node.js,AWS,TypeScript,PostgreSQL",8,San Francisco CA,120,US Citizen,2024-12-01
Michael Chen,m.chen@example.com,212-555-0456,Lead Developer,"React,Vue,Kubernetes,Python",10,New York NY,135,Green Card,2024-12-15
...
```

**Time:** ~5 seconds

---

### Step 18: Bulk Actions

**User Action:** Select multiple candidates using checkboxes, click "Bulk Action" button

**System Response:**
- Bulk action menu appears
- Shows available actions for selected candidates

**Screen State (Bulk Actions):**
```
+----------------------------------------------------------+
| ☑ 5 candidates selected                   [Deselect All]|
+----------------------------------------------------------+
| Bulk Actions:                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ Add to Job                                         │  |
| │ Add Tags                                           │  |
| │ Export Selected                                    │  |
| │ Send Email Campaign                                │  |
| │ Create Activity                                    │  |
| │ Update Status                                      │  |
| │ Add to Saved List                                  │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**User Action:** Click "Add Tags"

**System Response:**
- Tag input modal appears

**Screen State (Bulk Tag Modal):**
```
+----------------------------------------------------------+
|                    Add Tags to 5 Candidates          [×] |
+----------------------------------------------------------+
| Add tags to organize and categorize candidates:          |
|                                                          |
| Tags:                                                    |
| [+ Add tag...]                                           |
|                                                          |
| 💡 Suggested Tags:                                       |
| [React Specialist] [Senior Level] [SF Bay Area]         |
| [Hot Candidate] [A-Player] [Available Now]              |
|                                                          |
| Current Tags (will be added):                            |
|   React Senior Dev [×]                                   |
|   Q4 2024 Search [×]                                     |
|                                                          |
| [Cancel]  [Add Tags to 5 Candidates]                    |
+----------------------------------------------------------+
```

**User Action:** Add tags "React Senior Dev" and "Q4 2024 Search", click "Add Tags"

**System Response:**
1. Modal closes
2. Tags added to all 5 selected candidates
3. Toast: "Tags added to 5 candidates"
4. Candidate cards update to show new tags

**Time:** ~10 seconds

---

### Step 19: Use Semantic AI Search (Phase 3 - Future)

**User Action:** Click "AI Search" tab at top

**System Response:**
- AI search interface appears
- Natural language query box

**Screen State (AI Search - Future Feature):**
```
+----------------------------------------------------------+
| 🤖 AI-Powered Semantic Search                            |
+----------------------------------------------------------+
| Ask in natural language, and AI will find the best       |
| candidates based on meaning, not just keywords.          |
|                                                          |
| [Describe the ideal candidate in your own words...]     |
|                                                          |
| 💡 Example Queries:                                      |
| • "Find senior developers who have worked on large-scale|
|    React applications at FAANG companies"               |
| • "I need a full-stack engineer who can lead a team and |
|    has experience with microservices architecture"      |
| • "Looking for someone who has transitioned from Java to|
|    React in the past 2 years"                           |
|                                                          |
| [Search with AI]                                         |
+----------------------------------------------------------+
```

**User Action:** Type: "I need a senior React developer who has experience building real-time applications with WebSockets and has worked at a startup before"

**System Response:**
1. AI processes query using semantic search
2. Identifies key concepts: React, senior, real-time, WebSockets, startup
3. Finds candidates matching the semantic meaning
4. Ranks by relevance (not just keyword match)
5. Results show with AI-generated explanations

**Screen State (AI Results - Future Feature):**
```
+----------------------------------------------------------+
| 🤖 AI Search Results - 23 candidates found               |
+----------------------------------------------------------+
| ┌──────────────────────────────────────────────────────┐|
| │ Sarah Johnson                      🤖 AI Match: 98%  ││
| │                                                      ││
| │ Why this is a great match:                           ││
| │ • 8 years of React experience, with 5 years at       ││
| │   senior level                                       ││
| │ • Built real-time collaboration tool using           ││
| │   WebSockets and Socket.io at early-stage startup    ││
| │ • Led team of 3 engineers in building live          ││
| │   chat feature for SaaS platform                     ││
| │                                                      ││
| │ 💼 Current: Sr Software Engineer                     ││
| │ 🔧 Skills: React, WebSockets, Socket.io, Node.js     ││
| │ 📍 San Francisco, CA | 🏠 Remote OK                  ││
| │                                                      ││
| │ [View Profile]  [Add to Job]  [Contact]              ││
| └──────────────────────────────────────────────────────┘|
+----------------------------------------------------------+
```

**AI Search Backend (Future):**
```typescript
// Semantic search using embeddings
const queryEmbedding = await generateEmbedding(naturalLanguageQuery);

// Search against candidate embeddings
const results = await db.execute(sql`
  SELECT
    c.*,
    1 - (c.profile_embedding <=> ${queryEmbedding}) AS similarity
  FROM user_profiles c
  WHERE 1 - (c.profile_embedding <=> ${queryEmbedding}) > 0.7
  ORDER BY similarity DESC
  LIMIT 50
`);

// Generate AI explanations for top matches
for (const candidate of results.slice(0, 10)) {
  const explanation = await generateMatchExplanation(
    query,
    candidate,
    similarity
  );
  candidate.aiExplanation = explanation;
}
```

**Time:** ~10 seconds

---

## Postconditions

1. ✅ Search executed with specified filters
2. ✅ Results displayed sorted by match score or selected sort
3. ✅ Result count accurate and displayed
4. ✅ If saved: Search saved to `saved_searches` table
5. ✅ If candidates added to job: Submissions created with status = "sourced"
6. ✅ If exported: CSV/XLSX file downloaded
7. ✅ If bulk tagged: Tags added to selected candidates
8. ✅ Search history logged for analytics
9. ✅ User preferences saved (view mode, page size, sort)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `candidate_search.executed` | `{ user_id, search_query, filters, result_count, execution_time_ms, created_at }` |
| `saved_search.created` | `{ user_id, search_name, filters, is_default, is_shared, created_at }` |
| `candidate.added_to_job` | `{ user_id, candidate_id, job_id, source: 'database_search', created_at }` |
| `search_results.exported` | `{ user_id, format, row_count, fields, created_at }` |
| `candidates.bulk_tagged` | `{ user_id, candidate_ids, tags, created_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| No Results | Search too restrictive | "No candidates match your criteria. Try adjusting filters." | Remove some filters |
| Invalid Boolean Syntax | Malformed query | "Invalid boolean syntax: unmatched parentheses" | Fix syntax or use builder |
| Search Timeout | Query too complex | "Search timed out. Try simplifying your filters." | Reduce filter complexity |
| Export Failed | Too many results | "Export limit: 10,000 candidates. Please narrow your search." | Add more filters |
| Save Name Duplicate | Name already exists | "A search with this name already exists" | Choose different name |
| Permission Denied | User lacks read permission | "You don't have permission to search candidates" | Contact Admin |
| Network Error | API call failed | "Network error. Please try again." | Retry |
| Invalid Date Range | End date before start | "Invalid date range in availability filter" | Fix date range |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `/` | Focus search box |
| `Esc` | Clear search / Close modal |
| `Enter` | Execute search |
| `Cmd+S` | Save current search |
| `Cmd+E` | Export results |
| `Cmd+K` | Open command palette |
| `Cmd+F` | Focus filter panel |
| `←` `→` | Navigate pages |
| `j` `k` | Navigate results (up/down) |
| `Space` | Select/deselect candidate (in list view) |

---

## Alternative Flows

### A1: Search from Job Detail

**Trigger:** User is viewing job detail, needs to find candidates

**Flow:**
1. User clicks "Find Candidates" button on job detail page
2. Search page opens with job requirements pre-filled:
   - Skills auto-populated from job.requiredSkills
   - Experience range from job.minExperience / job.maxExperience
   - Location from job.location
   - Visa requirements from job.visaRequirements
   - Rate range from job.rateMin / job.rateMax
3. User reviews pre-filled filters
4. User adjusts filters if needed
5. User executes search
6. Results show with "Add to This Job" quick action
7. Continue from Step 11

### A2: Load Saved Search

**Trigger:** User wants to run a previously saved search

**Flow:**
1. User navigates to Candidates page
2. User clicks on saved search in sidebar: "Java Developers - Remote"
3. System loads saved filters
4. Search executes automatically
5. Results display
6. User sees: "Showing results for saved search: Java Developers - Remote"
7. User can modify filters and re-search
8. Continue from Step 11

### A3: Quick Search from Global Command

**Trigger:** User wants to quickly search candidates from anywhere

**Flow:**
1. User presses `Cmd+K` to open global command palette
2. User types: "search candidates react"
3. Command palette shows: "Search Candidates: react"
4. User presses Enter
5. System navigates to Candidates page
6. Search pre-filled with "react" keyword
7. Search executes automatically
8. Continue from Step 11

### A4: Search by Resume Upload

**Trigger:** User has candidate resume and wants to find similar candidates

**Flow:**
1. User clicks "Find Similar" button
2. File upload modal appears
3. User uploads resume (PDF, DOCX)
4. AI extracts skills, experience, location from resume
5. Search auto-populated with extracted criteria
6. User reviews and adjusts
7. User executes search
8. Results show candidates similar to uploaded resume
9. Continue from Step 11

### A5: Search from Email/Message

**Trigger:** User receives email with job requirements, wants to search

**Flow:**
1. User clicks "Import Requirements" button
2. User pastes email content
3. AI parses requirements:
   - Skills mentioned
   - Years of experience
   - Location
   - Other criteria
4. Search filters auto-populate
5. User reviews and adjusts
6. User executes search
7. Continue from Step 11

---

## International Considerations

### Multi-language Resume Parsing

**Challenge:** Candidates may have resumes in different languages

**Solution:**
- AI resume parser detects language automatically
- Translates skills to English for indexing
- Preserves original language in resume text
- Search works across all languages

**Implementation:**
```typescript
// Resume parsing with language detection
const detectedLanguage = await detectLanguage(resumeText);
const translatedSkills = await translateSkills(skills, detectedLanguage, 'en');

// Index both original and translated
await db.insert(candidateSkills).values({
  candidateId,
  skill: originalSkill,
  skillTranslated: translatedSkills[originalSkill],
  language: detectedLanguage
});
```

### Location Search Across Countries

**Challenge:** Different location formats and search radius

**Solution:**
- Support multiple location formats:
  - US: "San Francisco, CA"
  - UK: "London, England, UK"
  - India: "Bangalore, Karnataka, India"
  - Global: "Remote - Worldwide"
- Search radius in km or miles based on country
- Timezone display for remote candidates

**Field Specification: Location (International)**
| Property | Value |
|----------|-------|
| Format | "{City}, {State/Province}, {Country}" |
| Auto-complete | Google Places API (global) |
| Search Radius | Configurable: 10, 25, 50, 100, 200 km/miles |
| Timezone | Display timezone for remote candidates |
| Remote Zones | "Remote - Americas", "Remote - EMEA", "Remote - APAC", "Remote - Worldwide" |

### Currency Conversion for Rate Filters

**Challenge:** Candidates in different countries have different currencies

**Solution:**
- Auto-convert all rates to USD for comparison
- Display original currency on candidate card
- Real-time exchange rates (updated daily)

**Implementation:**
```typescript
// Currency conversion
const exchangeRates = await getExchangeRates(); // Updated daily

// Convert candidate rate to USD for filtering
const rateInUSD = candidate.rate * exchangeRates[candidate.currency];

// Filter by USD-equivalent
if (rateInUSD >= minRate && rateInUSD <= maxRate) {
  // Include in results
}

// Display original currency
candidateCard.displayRate = `${candidate.currency} ${candidate.rate}/hr (≈ $${rateInUSD}/hr)`;
```

**Field Specification: Rate (International)**
| Property | Value |
|----------|-------|
| Display Format | "{original_currency} {rate}/hr (≈ ${usd_rate}/hr)" |
| Filter Currency | USD (all rates converted for filtering) |
| Supported Currencies | USD, EUR, GBP, INR, CAD, AUD, MXN, BRL, JPY, CNY |
| Exchange Rate Update | Daily at 00:00 UTC |

### Work Authorization by Country

**Challenge:** Visa requirements vary by country

**Solution:**
- Country-specific visa options
- US: US Citizen, Green Card, H1B, L1, OPT, TN, EAD
- UK: British Citizen, ILR, Tier 2, Tier 5, EU Settled Status
- Canada: Canadian Citizen, PR, Work Permit, LMIA
- India: Indian Citizen, OCI, Employment Visa
- Australia: Australian Citizen, PR, Visa 457, Visa 482

**Field Specification: Visa Status (International)**
| Property | Value |
|----------|-------|
| Field Name | `visaStatus` |
| Type | Multi-select Dropdown |
| Options | Country-specific (loaded based on job location) |
| Display | "{country}: {visa_type}" |
| Search Logic | Filter by country AND visa type |

**Implementation:**
```typescript
// Dynamic visa options based on job location
const visaOptions = getVisaOptions(job.country);

// Example for US
const usVisaOptions = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H1B' },
  // ...
];

// Example for UK
const ukVisaOptions = [
  { value: 'uk_citizen', label: 'British Citizen' },
  { value: 'ilr', label: 'Indefinite Leave to Remain (ILR)' },
  { value: 'tier2', label: 'Tier 2 (General)' },
  // ...
];
```

---

## Related Use Cases

- [D01-create-job.md](./D01-create-job.md) - Create job before searching candidates
- [E01-source-candidates.md](./E01-source-candidates.md) - Source candidates from external sources
- [F01-submit-candidate.md](./F01-submit-candidate.md) - Submit found candidates to jobs
- [D04-manage-pipeline.md](./D04-manage-pipeline.md) - Manage candidates in pipeline

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Search with single keyword "React" | Returns all candidates with React skill |
| TC-002 | Search with boolean query "(React OR Angular) AND Senior" | Returns senior candidates with React or Angular |
| TC-003 | Filter by skills: React, Node.js, AWS (AND logic) | Returns only candidates with all 3 skills |
| TC-004 | Filter by experience: 5-10 years | Returns candidates with 5-10 years experience |
| TC-005 | Filter by location: "San Francisco" + Remote OK | Returns SF candidates + remote-capable candidates |
| TC-006 | Filter by visa: US Citizen, Green Card | Returns only US Citizens and Green Card holders |
| TC-007 | Filter by availability: Available now | Returns candidates available ≤ today |
| TC-008 | Filter by rate: $100-150/hr | Returns candidates with rate in range |
| TC-009 | Filter by status: Active only | Excludes placed and inactive candidates |
| TC-010 | Sort by match score | Results ordered by match score (descending) |
| TC-011 | Sort by experience | Results ordered by years of experience |
| TC-012 | Save search with name "React Devs" | Search saved, appears in sidebar |
| TC-013 | Load saved search | Filters populated, search executes |
| TC-014 | Add candidate to job | Submission created with status = "sourced" |
| TC-015 | Export 100 candidates to CSV | CSV file downloads with 100 rows |
| TC-016 | Bulk tag 5 candidates | Tags added to all 5 candidates |
| TC-017 | Search with no results | Shows "No candidates match your criteria" |
| TC-018 | Boolean query with syntax error | Shows error: "Invalid boolean syntax" |
| TC-019 | Search timeout (complex query) | Shows "Search timed out" message |
| TC-020 | Export >10,000 candidates | Error: "Export limit: 10,000 candidates" |
| TC-021 | Search with international location "London, UK" | Returns UK-based candidates |
| TC-022 | Filter by rate in EUR, convert to USD | Rates converted, filtering works correctly |
| TC-023 | Filter by UK visa options | Shows only candidates with UK work authorization |
| TC-024 | AI semantic search (future) | Returns semantically relevant candidates |

---

## UI/UX Specifications

### Match Score Visual Indicator

**Star Rating:**
- 90-100%: ⭐⭐⭐⭐⭐ (5 stars, gold color)
- 80-89%: ⭐⭐⭐⭐ (4 stars, gold color)
- 70-79%: ⭐⭐⭐ (3 stars, amber color)
- 60-69%: ⭐⭐ (2 stars, amber color)
- <60%: ⭐ (1 star, gray color)

**Percentage Badge:**
- 90-100%: Green background (#10B981)
- 80-89%: Light green (#34D399)
- 70-79%: Yellow (#FBBF24)
- 60-69%: Orange (#FB923C)
- <60%: Red (#EF4444)

### Filter Panel Behavior

**Responsive Design:**
- Desktop (>1024px): Fixed left sidebar, always visible
- Tablet (768-1024px): Collapsible sidebar, toggle button
- Mobile (<768px): Bottom sheet, swipe up to expand

**Filter Application:**
- **Auto-apply mode**: Filters apply instantly (default)
- **Manual mode**: User clicks "Apply" button to execute
- Toggle setting: "Auto-apply filters" checkbox in settings

**Active Filter Display:**
```
+----------------------------------------------------------+
| Active Filters (8):                          [Clear All] |
| [React ×] [Node.js ×] [AWS ×] [5-10 yrs ×]              |
| [SF, CA ×] [Remote OK ×] [US Citizen ×] [$100-150 ×]    |
+----------------------------------------------------------+
```

### Empty State

```
+----------------------------------------------------------+
|                                                          |
|                    🔍                                    |
|                                                          |
|               No candidates found                        |
|                                                          |
|  Your search didn't match any candidates in the database.|
|                                                          |
|  Try:                                                    |
|  • Removing some filters                                |
|  • Using different keywords                             |
|  • Broadening your search criteria                      |
|                                                          |
|  [Clear All Filters]  [Adjust Search]                   |
|                                                          |
+----------------------------------------------------------+
```

### Loading State

```
+----------------------------------------------------------+
|                                                          |
|                    ⏳                                    |
|                                                          |
|            Searching candidates...                       |
|                                                          |
|      [████████████████░░░░░░░░] 75%                     |
|                                                          |
|      Searching 12,345 profiles...                        |
|                                                          |
+----------------------------------------------------------+
```

---

## Database Schema Reference

**Saved Searches Table:**
```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Search details
  search_name TEXT NOT NULL,
  search_description TEXT,

  -- Search criteria (stored as JSON)
  filters JSONB NOT NULL,

  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  email_alerts BOOLEAN DEFAULT false,

  -- Metadata
  result_count INTEGER,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(org_id, user_id, search_name)
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_org ON saved_searches(org_id);
```

**Search History Table (Analytics):**
```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Search query
  search_query TEXT,
  boolean_query TEXT,
  filters JSONB,

  -- Results
  result_count INTEGER,
  execution_time_ms INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_org ON search_history(org_id);
CREATE INDEX idx_search_history_created ON search_history(created_at DESC);
```

**Candidate Tags Table:**
```sql
CREATE TABLE candidate_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  tag TEXT NOT NULL,

  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(org_id, candidate_id, tag)
);

CREATE INDEX idx_candidate_tags_candidate ON candidate_tags(candidate_id);
CREATE INDEX idx_candidate_tags_tag ON candidate_tags(tag);
```

---

## Search Performance Optimization

### Database Indices

**Required Indices for Fast Search:**
```sql
-- Full-text search on candidate profiles
CREATE INDEX idx_user_profiles_search ON user_profiles
USING GIN (to_tsvector('english',
  COALESCE(first_name, '') || ' ' ||
  COALESCE(last_name, '') || ' ' ||
  COALESCE(title, '') || ' ' ||
  COALESCE(bio, '')
));

-- Skills search
CREATE INDEX idx_candidate_skills_skill ON candidate_skills(skill);
CREATE INDEX idx_candidate_skills_candidate ON candidate_skills(candidate_id);

-- Location search
CREATE INDEX idx_user_profiles_location ON user_profiles(location);
CREATE INDEX idx_user_profiles_remote ON user_profiles(is_remote_ok);

-- Experience range
CREATE INDEX idx_user_profiles_experience ON user_profiles(years_experience);

-- Rate range
CREATE INDEX idx_user_profiles_rate ON user_profiles(desired_rate);

-- Visa status
CREATE INDEX idx_user_profiles_visa ON user_profiles(visa_status);

-- Availability
CREATE INDEX idx_user_profiles_availability ON user_profiles(available_date);

-- Status
CREATE INDEX idx_user_profiles_status ON user_profiles(profile_status);

-- Composite index for common queries
CREATE INDEX idx_user_profiles_common_filters ON user_profiles(
  profile_status,
  is_remote_ok,
  years_experience,
  desired_rate
);
```

### Caching Strategy

**Redis Cache for Common Searches:**
```typescript
// Cache key generation
const cacheKey = `search:${hash(filters)}`;

// Check cache first
const cachedResults = await redis.get(cacheKey);
if (cachedResults) {
  return JSON.parse(cachedResults);
}

// Execute search
const results = await executeSearch(filters);

// Cache for 5 minutes
await redis.setex(cacheKey, 300, JSON.stringify(results));

return results;
```

**Cache Invalidation:**
- Cache cleared when:
  - New candidate added
  - Candidate profile updated
  - Candidate skills changed
  - Candidate status changed

### Query Optimization

**Pagination with Cursor:**
```typescript
// Instead of OFFSET (slow for large offsets)
// Use cursor-based pagination
const results = await db.query.userProfiles.findMany({
  where: and(
    ...filters,
    gt(userProfiles.id, lastSeenId) // Cursor
  ),
  limit: pageSize,
  orderBy: [desc(userProfiles.matchScore), asc(userProfiles.id)]
});
```

**Search Query Example:**
```sql
-- Optimized search query with all filters
SELECT
  p.*,
  COALESCE(
    (
      SELECT COUNT(*)
      FROM candidate_skills cs
      WHERE cs.candidate_id = p.id
        AND cs.skill = ANY($1::text[])
    )::float / array_length($1::text[], 1),
    0
  ) * 40 AS skills_score,
  CASE
    WHEN p.years_experience BETWEEN $2 AND $3 THEN 20
    ELSE 0
  END AS experience_score,
  CASE
    WHEN p.location = $4 OR p.is_remote_ok THEN 15
    ELSE 0
  END AS location_score,
  CASE
    WHEN p.desired_rate BETWEEN $5 AND $6 THEN 10
    ELSE 0
  END AS rate_score,
  CASE
    WHEN p.visa_status = ANY($7::text[]) THEN 10
    ELSE 0
  END AS visa_score,
  CASE
    WHEN p.available_date <= $8 THEN 5
    ELSE 0
  END AS availability_score
FROM user_profiles p
WHERE p.org_id = $9
  AND p.profile_status = ANY($10::text[])
  AND (
    p.location = $4
    OR p.is_remote_ok = true
  )
  AND p.years_experience BETWEEN $2 AND $3
  AND p.desired_rate BETWEEN $5 AND $6
  AND p.visa_status = ANY($7::text[])
  AND EXISTS (
    SELECT 1
    FROM candidate_skills cs
    WHERE cs.candidate_id = p.id
      AND cs.skill = ANY($1::text[])
  )
ORDER BY (
  skills_score +
  experience_score +
  location_score +
  rate_score +
  visa_score +
  availability_score
) DESC
LIMIT $11 OFFSET $12;
```

---

*Last Updated: 2024-11-30*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
