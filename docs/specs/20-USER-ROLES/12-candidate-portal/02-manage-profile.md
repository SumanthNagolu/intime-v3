# Use Case: Manage Candidate Profile

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-CAN-002 |
| Actor | Candidate Portal User |
| Goal | Update and maintain complete, accurate candidate profile |
| Frequency | 2-3 times per month (active job seekers), Weekly (consultants) |
| Estimated Time | 10-30 minutes |
| Priority | High |

---

## Preconditions

1. User is logged in to Candidate Portal
2. User has completed initial profile setup (from onboarding)
3. User has "candidate.profile.update" permission (default for candidate_user)

---

## Trigger

One of the following:
- New job or certification obtained
- Skills or experience updated
- Contact information changed
- Availability status changed
- Profile completeness score below 80%
- Recruiter requested profile update
- Periodic profile refresh reminder

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Profile

**User Action:** Click "My Profile" in the navigation or user menu

**System Response:**
- Navigation item highlights
- URL changes to: `/portal/profile`
- Profile page loads with current information
- Profile completeness score displays at top
- Loading skeleton shows for 200-500ms

**Screen State:**
```
+----------------------------------------------------------------+
| InTime Candidate Portal                    [🔔] [👤 John Doe] |
+----------------------------------------------------------------+
| [← Dashboard] [My Profile] [Applications] [Messages] [Settings]|
+----------------------------------------------------------------+
|                                                                 |
| Profile Completeness: [████████░░] 85%  [Improve Profile →]   |
|                                                                 |
| +-----------------------------------------------------------+  |
| |                     [📷 Profile Photo]                    |  |
| |                                                           |  |
| |                    John Doe (he/him)                      |  |
| |                  Senior Software Engineer                 |  |
| |              San Francisco, CA | john@email.com           |  |
| |              ☎ (555) 123-4567 | 🔗 linkedin.com/in/john   |  |
| |                                                           |  |
| |  [✓ Available] - Ready to start: Immediately              |  |
| |                                                [Edit ✏️]   |  |
| +-----------------------------------------------------------+  |
|                                                                 |
| ┌─────────────────┬──────────────────────────────────────────┐ |
| │ PROFILE MENU    │ CONTACT INFORMATION                      │ |
| │                 │                                          │ |
| │ • Contact Info  │ Email: john@email.com ✓ Verified        │ |
| │ • Work History  │ Phone: (555) 123-4567 ✓ Verified        │ |
| │ • Education     │ Location: San Francisco, CA              │ |
| │ • Skills        │         Remote-friendly                  │ |
| │ • Certifications│ LinkedIn: linkedin.com/in/john           │ |
| │ • Resume        │                                          │ |
| │ • Preferences   │                    [Edit Contact Info]   │ |
| │ • Privacy       │                                          │ |
| └─────────────────┴──────────────────────────────────────────┘ |
+----------------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Click "Edit Contact Info"

**User Action:** Click "Edit Contact Info" button in Contact Information section

**System Response:**
- Contact information section expands to edit mode
- All fields become editable with current values pre-filled
- "Save" and "Cancel" buttons appear
- Field validation indicators show

**Screen State:**
```
+----------------------------------------------------------------+
| CONTACT INFORMATION                                     [Edit] |
+----------------------------------------------------------------+
| Email Address *                                                 |
| [john@email.com                                    ] ✓ Verified |
| ⓘ Your email is verified. Changing it will require re-verification |
|                                                                 |
| Phone Number *                                                  |
| Country Code: [+1 US ▼]  Number: [(555) 123-4567    ] ✓ Verified |
| ⓘ SMS notifications enabled for this number                     |
|                                                                 |
| Preferred Name                                                  |
| [John                                                         ] |
| ⓘ How you'd like to be addressed in communications             |
|                                                                 |
| Current Location *                                              |
| City:        [San Francisco                                   ] |
| State/Region:[California                                   ▼] |
| Country:     [United States                                ▼] |
| Zip Code:    [94105                                          ] |
|                                                                 |
| Willing to Relocate?                                            |
| ○ Yes, anywhere in the US                                       |
| ● Yes, to specific locations   [+ Add cities]                  |
|   • Seattle, WA [×]                                             |
|   • Austin, TX [×]                                              |
| ○ No, local opportunities only                                  |
|                                                                 |
| LinkedIn Profile URL                                            |
| [https://linkedin.com/in/john                                 ] |
|                                                                 |
| GitHub Profile (Optional)                                       |
| [https://github.com/john                                      ] |
|                                                                 |
| Portfolio Website (Optional)                                    |
| [https://johnsmith.dev                                        ] |
|                                                                 |
+----------------------------------------------------------------+
|                                    [Cancel]  [Save Changes ✓]  |
+----------------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 3: Update Phone Number

**User Action:** Click on phone number field, change from (555) 123-4567 to (555) 987-6543

**System Response:**
- Phone number updates as user types
- Auto-formatting applies (parentheses, spaces)
- Verification badge changes to "Needs Verification"
- Warning message appears

**Field Specification: Phone Number**
| Property | Value |
|----------|-------|
| Field Name | `phone` |
| Type | Phone Input |
| Label | "Phone Number" |
| Required | Yes |
| Format | US: (XXX) XXX-XXXX, International: +XX XXX XXX XXXX |
| Validation | Valid phone format for selected country |
| Verification | SMS code sent on change |
| Error Messages | |
| - Empty | "Phone number is required" |
| - Invalid format | "Please enter a valid phone number" |
| - Duplicate | "This phone number is already registered" |

**Time:** ~5 seconds

---

### Step 4: Add Relocation City

**User Action:** Click "+ Add cities" under relocation preferences

**System Response:**
- City autocomplete dropdown appears
- Shows popular cities first

**User Action:** Type "Bos" in autocomplete

**System Response:**
- Filters to Boston locations
- Shows: "Boston, MA", "Boise, ID"

**User Action:** Click "Boston, MA"

**System Response:**
- New tag "Boston, MA [×]" appears in list
- Input clears, ready for next city

**Field Specification: Relocation Cities**
| Property | Value |
|----------|-------|
| Field Name | `relocationPreferences` |
| Type | Multi-select Location Autocomplete |
| Label | "Preferred Relocation Cities" |
| Required | No (conditional on "specific locations" selected) |
| Max Items | 10 cities |
| Data Source | US cities database |
| Autocomplete | Yes, fuzzy match on city + state |

**Time:** ~10 seconds

---

### Step 5: Click "Save Changes"

**User Action:** Click "Save Changes ✓" button

**System Response:**
1. Button shows loading state (spinner)
2. Form validates all fields
3. If phone changed: SMS verification modal appears
4. API call `POST /api/trpc/candidates.updateProfile`
5. On success:
   - Section collapses back to view mode
   - Toast notification: "Contact information updated" (green)
   - Phone verification status shows "Pending verification"
   - Verification code sent to new number

**Screen State (Verification Modal):**
```
+----------------------------------------------------------------+
|                    Verify Your Phone Number                    |
|                                                           [×]  |
+----------------------------------------------------------------+
|                                                                 |
|  We sent a 6-digit code to: (555) 987-6543                     |
|                                                                 |
|  Enter verification code:                                      |
|  ┌───┬───┬───┬───┬───┬───┐                                     |
|  │   │   │   │   │   │   │                                     |
|  └───┴───┴───┴───┴───┴───┘                                     |
|                                                                 |
|  Didn't receive code? [Resend in 45s]                          |
|                                                                 |
|                                    [Cancel]  [Verify]          |
+----------------------------------------------------------------+
```

**Time:** ~2 seconds + verification time

---

### Step 6: Navigate to Work History Section

**User Action:** Click "Work History" in profile menu

**System Response:**
- Scrolls to Work History section
- Displays all positions in reverse chronological order (most recent first)
- Shows "Add Position" button

**Screen State:**
```
+----------------------------------------------------------------+
| WORK HISTORY                                        [+ Add Job]|
+----------------------------------------------------------------+
| ┌──────────────────────────────────────────────────────────┐  |
| │ Senior Software Engineer                          [Edit] │  |
| │ Google                                                    │  |
| │ Mar 2020 - Present (4 years 9 months)                    │  |
| │ 📍 San Francisco, CA (Remote)                            │  |
| │                                                           │  |
| │ • Led development of React-based dashboard platform      │  |
| │ • Mentored team of 5 junior developers                   │  |
| │ • Reduced page load time by 40% through optimization     │  |
| │                                                           │  |
| │ Technologies: React, Node.js, TypeScript, AWS, GraphQL    │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ Software Engineer                                 [Edit] │  |
| │ Meta (Facebook)                                           │  |
| │ Jun 2017 - Feb 2020 (2 years 9 months)                   │  |
| │ 📍 Menlo Park, CA                                        │  |
| │                                                           │  |
| │ • Developed features for Instagram feed algorithm        │  |
| │ • Built RESTful APIs serving 500M+ daily users           │  |
| │                                                           │  |
| │ Technologies: Python, Django, React, MySQL, Redis         │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| Total Experience: 7 years 6 months                             |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 7: Click "Add Job" to Add New Position

**User Action:** Click "+ Add Job" button

**System Response:**
- Modal or expandable form appears
- First field (Company Name) is focused
- Date picker defaults to current date for start date

**Screen State:**
```
+----------------------------------------------------------------+
|                       Add Work Experience                       |
|                                                           [×]  |
+----------------------------------------------------------------+
|                                                                 |
| Company Name *                                                  |
| [Search companies...                                    ▼]     |
| ⓘ Start typing to search or add custom company                 |
|                                                                 |
| Job Title *                                                     |
| [                                                            ]  |
|                                                                 |
| Employment Type *                                               |
| [Full-Time                                               ▼]    |
|                                                                 |
| Employment Period *                                             |
| From: [03/2024 📅]    To: [Present ✓] □ Current Position       |
|                                                                 |
| Location                                                        |
| City/State: [                                                ] |
| Work Arrangement: ○ On-Site  ○ Hybrid  ● Remote               |
|                                                                 |
| Description                                                     |
| [                                                            ]  |
| [                                                            ]  |
| [                                                      ] 0/2000 |
| ⓘ Use bullet points to highlight key achievements              |
|                                                                 |
| Technologies & Skills Used                                      |
| [+ Add technology                                            ]  |
| [React] [×]  [TypeScript] [×]  [AWS] [×]                       |
|                                                                 |
+----------------------------------------------------------------+
|                                    [Cancel]  [Add Position ✓]  |
+----------------------------------------------------------------+
```

**Time:** ~300ms

---

### Step 8: Fill in New Position Details

**User Action:** Type "Stripe" in Company Name field

**System Response:**
- Autocomplete dropdown shows
- "Stripe" appears with logo
- Company details pre-populate when selected

**User Action:** Select "Stripe" from dropdown

**System Response:**
- Company name locked to "Stripe"
- Industry auto-fills: "Financial Services"
- Company logo displays

**Field Specification: Company Name**
| Property | Value |
|----------|-------|
| Field Name | `companyName` |
| Type | Autocomplete Search |
| Label | "Company Name" |
| Required | Yes |
| Data Source | Companies database + LinkedIn Company API |
| Allow Custom | Yes (if company not found) |
| Max Length | 200 characters |

**Time:** ~5 seconds

---

### Step 9: Enter Job Title

**User Action:** Type "Staff Software Engineer"

**Field Specification: Job Title**
| Property | Value |
|----------|-------|
| Field Name | `jobTitle` |
| Type | Text Input |
| Label | "Job Title" |
| Required | Yes |
| Max Length | 200 characters |
| Autocomplete | Common job titles |

**Time:** ~3 seconds

---

### Step 10: Select Employment Type

**User Action:** Click employment type dropdown, select "Contract"

**Field Specification: Employment Type**
| Property | Value |
|----------|-------|
| Field Name | `employmentType` |
| Type | Dropdown |
| Label | "Employment Type" |
| Required | Yes |
| Options | |
| - `full_time` | "Full-Time" |
| - `contract` | "Contract / C2C" |
| - `contract_to_hire` | "Contract-to-Hire" |
| - `part_time` | "Part-Time" |
| - `internship` | "Internship" |
| - `temporary` | "Temporary" |

**Time:** ~2 seconds

---

### Step 11: Set Employment Period

**User Action:** Click "From" date picker, select "March 2024"

**System Response:**
- Calendar modal opens
- Navigates to March 2024
- Date selected, modal closes

**User Action:** Check "Current Position" checkbox

**System Response:**
- "To" date picker disables
- "To" field shows "Present"
- Employment duration calculates automatically

**Field Specification: Employment Period**
| Property | Value |
|----------|-------|
| Field Name | `startDate`, `endDate`, `isCurrent` |
| Type | Date Range Picker + Checkbox |
| Label | "Employment Period" |
| Required | Yes (start date) |
| Format | MM/YYYY |
| Validation | Start date must be before end date |
| Current Position | If checked, end date = null |

**Time:** ~5 seconds

---

### Step 12: Enter Location and Work Arrangement

**User Action:** Type "San Francisco, CA" in location, select "Remote"

**Field Specification: Location**
| Property | Value |
|----------|-------|
| Field Name | `location` |
| Type | Location Autocomplete |
| Label | "Location" |
| Required | No |
| Format | "City, State" or "City, Country" |

**Field Specification: Work Arrangement**
| Property | Value |
|----------|-------|
| Field Name | `workArrangement` |
| Type | Radio Button Group |
| Label | "Work Arrangement" |
| Options | On-Site, Hybrid, Remote |
| Default | On-Site |

**Time:** ~5 seconds

---

### Step 13: Add Job Description

**User Action:** Type or paste job description with bullet points

**Example Input:**
```
• Led backend architecture redesign for payments platform
• Improved transaction processing speed by 60%
• Mentored 3 junior engineers
• Implemented microservices using Node.js and Kubernetes
```

**Field Specification: Description**
| Property | Value |
|----------|-------|
| Field Name | `description` |
| Type | Textarea |
| Label | "Description" |
| Required | No (but strongly recommended) |
| Max Length | 2000 characters |
| Format | Plain text with basic markdown support |
| Suggestions | Bullet points for achievements |

**Time:** ~30-60 seconds

---

### Step 14: Add Technologies Used

**User Action:** Click "+ Add technology", type "Node.js"

**System Response:**
- Autocomplete shows matching skills
- "Node.js" appears in list

**User Action:** Select "Node.js", add "Kubernetes", "PostgreSQL"

**System Response:**
- Each technology appears as tag
- Each tag has remove button [×]

**Field Specification: Technologies**
| Property | Value |
|----------|-------|
| Field Name | `technologies` |
| Type | Multi-select Tag Input |
| Label | "Technologies & Skills Used" |
| Required | No |
| Data Source | Skills taxonomy |
| Allow Custom | Yes |
| Max Tags | 20 |

**Time:** ~15 seconds

---

### Step 15: Save New Position

**User Action:** Click "Add Position ✓" button

**System Response:**
1. Form validates all fields
2. Loading state on button
3. API call `POST /api/trpc/candidates.addWorkHistory`
4. On success:
   - Modal closes
   - New position appears at top of work history list
   - Toast notification: "Work experience added successfully"
   - Profile completeness score updates (+5%)
   - Total experience years recalculates

**Time:** ~1-2 seconds

---

### Step 16: Navigate to Skills Section

**User Action:** Click "Skills" in profile menu

**System Response:**
- Scrolls to Skills section
- Displays skills organized by category
- Shows proficiency levels and years of experience

**Screen State:**
```
+----------------------------------------------------------------+
| SKILLS & EXPERTISE                              [+ Add Skill] |
+----------------------------------------------------------------+
|
| Programming Languages (8)                      [Expand All ▼] |
| ┌──────────────────────────────────────────────────────────┐  |
| │ JavaScript      ████████░░ Advanced    10 years          │  |
| │ TypeScript      ██████░░░░ Intermediate 5 years   [Edit] │  |
| │ Python          ███████░░░ Advanced     8 years   [Edit] │  |
| │ Go              ████░░░░░░ Intermediate 3 years   [Edit] │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| Frameworks & Libraries (12)                                     |
| ┌──────────────────────────────────────────────────────────┐  |
| │ React           █████████░ Advanced    8 years    [Edit] │  |
| │ Node.js         ████████░░ Advanced    7 years    [Edit] │  |
| │ Express.js      ███████░░░ Advanced    6 years    [Edit] │  |
| │ Next.js         ██████░░░░ Intermediate 4 years   [Edit] │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| Cloud & DevOps (6)                                              |
| ┌──────────────────────────────────────────────────────────┐  |
| │ AWS             ████████░░ Advanced     6 years   [Edit] │  |
| │ Docker          ███████░░░ Advanced     5 years   [Edit] │  |
| │ Kubernetes      █████░░░░░ Intermediate 3 years   [Edit] │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| Databases (5)                                                   |
| ┌──────────────────────────────────────────────────────────┐  |
| │ PostgreSQL      ████████░░ Advanced     7 years   [Edit] │  |
| │ MongoDB         ██████░░░░ Intermediate 5 years   [Edit] │  |
| │ Redis           ██████░░░░ Intermediate 4 years   [Edit] │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 17: Edit Skill Proficiency

**User Action:** Click "Edit" next to "TypeScript" skill

**System Response:**
- Inline edit mode activates
- Proficiency slider and years input appear

**Screen State:**
```
+----------------------------------------------------------------+
| TypeScript                                               [Save]|
| Proficiency: [Beginner][Intermediate][Advanced][Expert]        |
|              └────────────●────────────────┘                    |
| Years of Experience: [5  ] years                               |
| Last Used: ● Currently using                                   |
|            ○ Within last 6 months                              |
|            ○ Within last year                                  |
|            ○ 1-2 years ago                                     |
|            ○ More than 2 years ago                             |
|                                                                 |
| Endorsements (Optional)                                         |
| ☐ Used professionally                                          |
| ☐ Certified                                                    |
| ☐ Teaching/Mentoring others                                    |
|                                                                 |
|                                    [Cancel]  [Update Skill]    |
+----------------------------------------------------------------+
```

**User Action:** Slide proficiency to "Advanced", change years to "6"

**Field Specification: Skill Proficiency**
| Property | Value |
|----------|-------|
| Field Name | `proficiencyLevel` |
| Type | Slider / Radio Group |
| Label | "Proficiency" |
| Required | Yes |
| Options | Beginner (1-2), Intermediate (3-5), Advanced (6-8), Expert (9-10) |

**Field Specification: Years of Experience**
| Property | Value |
|----------|-------|
| Field Name | `yearsOfExperience` |
| Type | Number Input |
| Label | "Years of Experience" |
| Min | 0 |
| Max | 50 |
| Required | No |

**Time:** ~10 seconds

---

### Step 18: Click "Update Skill"

**User Action:** Click "Update Skill" button

**System Response:**
- Inline edit closes
- Skill updates in list
- Proficiency bar reflects new level
- Toast: "Skill updated successfully"

**Time:** ~1 second

---

### Step 19: Navigate to Resume Section

**User Action:** Click "Resume" in profile menu

**System Response:**
- Scrolls to Resume section
- Shows current resume(s) on file
- Displays resume preview

**Screen State:**
```
+----------------------------------------------------------------+
| RESUME                                        [+ Upload New]  |
+----------------------------------------------------------------+
| Current Resumes (2)                                             |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📄 John_Doe_Resume_2024.pdf                       PRIMARY │  |
| │ Uploaded: Nov 15, 2024 | Size: 245 KB                      │  |
| │                                                            │  |
| │ [Preview] [Download] [Delete] [Set as Primary]            │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| ┌──────────────────────────────────────────────────────────┐  |
| │ 📄 John_Doe_Resume_Software_Engineer.pdf                  │  |
| │ Uploaded: Oct 10, 2024 | Size: 198 KB                      │  |
| │                                                            │  |
| │ [Preview] [Download] [Delete] [Set as Primary]            │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                 |
| Resume Parsing Status: ✓ All resumes parsed successfully       |
|                                                                 |
| ⓘ Recruiters will see your PRIMARY resume by default            |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 20: Upload New Resume

**User Action:** Click "+ Upload New" button

**System Response:**
- File picker dialog opens
- Accepts .pdf, .doc, .docx formats

**User Action:** Select "John_Doe_Resume_Dec_2024.pdf" from computer

**System Response:**
1. File upload progress bar shows
2. Resume parsing begins automatically
3. Parsing progress indicator displays

**Screen State (During Upload):**
```
+----------------------------------------------------------------+
| Uploading Resume...                                             |
+----------------------------------------------------------------+
|                                                                 |
| John_Doe_Resume_Dec_2024.pdf (235 KB)                          |
| Upload: [████████████████████] 100%                            |
|                                                                 |
| Parsing resume... [⚙️ Processing]                              |
|                                                                 |
+----------------------------------------------------------------+
```

**After Parsing Complete:**
```
+----------------------------------------------------------------+
| Resume Uploaded Successfully! ✓                                 |
+----------------------------------------------------------------+
|                                                                 |
| We extracted the following information:                         |
|                                                                 |
| ✓ Contact Information                                           |
| ✓ Work History (3 positions)                                    |
| ✓ Education (1 degree)                                          |
| ✓ Skills (24 skills detected)                                   |
|                                                                 |
| [Review Extracted Data]  [Use Original]  [Set as Primary]      |
+----------------------------------------------------------------+
```

**Field Specification: Resume Upload**
| Property | Value |
|----------|-------|
| Field Name | `resumeFile` |
| Type | File Upload |
| Label | "Resume" |
| Accept | .pdf, .doc, .docx |
| Max Size | 10 MB |
| Max Files | 5 resumes per candidate |
| Auto-parse | Yes |
| Virus Scan | Yes |

**Time:** ~5-10 seconds (depending on file size and parsing)

---

### Step 21: Navigate to Preferences Section

**User Action:** Click "Preferences" in profile menu

**System Response:**
- Scrolls to Preferences section
- Displays job search preferences and availability

**Screen State:**
```
+----------------------------------------------------------------+
| JOB PREFERENCES                                         [Edit] |
+----------------------------------------------------------------+
|                                                                 |
| Availability Status                                             |
| ● Available - Can start immediately                            |
| Profile Visibility: Public (Visible to recruiters)              |
|                                                                 |
| Desired Job Titles                                              |
| • Senior Software Engineer                                      |
| • Staff Software Engineer                                       |
| • Engineering Manager                                           |
|                                                                 |
| Employment Types                                                |
| ✓ Full-Time     ✓ Contract     ✓ Contract-to-Hire             |
| ☐ Part-Time     ☐ Temporary                                    |
|                                                                 |
| Work Arrangements                                               |
| ✓ Remote        ✓ Hybrid        ☐ On-Site                     |
|                                                                 |
| Desired Compensation                                            |
| Type: Hourly Rate                                               |
| Range: $95 - $120 /hour                                         |
|                                                                 |
| Preferred Locations                                             |
| • San Francisco, CA (Current)                                   |
| • Seattle, WA                                                   |
| • Austin, TX                                                    |
| • Remote (US-based)                                             |
|                                                                 |
| Contract Duration (for contract roles)                          |
| Minimum: 6 months   Preferred: 12+ months                       |
|                                                                 |
| Commute Preferences                                             |
| Max commute: 30 minutes (for hybrid/on-site)                    |
|                                                                 |
+----------------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 22: Update Availability Status

**User Action:** Click "Edit" in preferences section

**System Response:**
- Preferences section switches to edit mode

**Screen State (Edit Mode):**
```
+----------------------------------------------------------------+
| JOB PREFERENCES                                                 |
+----------------------------------------------------------------+
|                                                                 |
| Availability Status *                                           |
| ○ Available - Can start immediately                            |
| ● Passive - Open to opportunities                              |
| ○ Not looking - Currently employed and happy                   |
| ○ Specific date - Available on: [Date Picker]                 |
|                                                                 |
| Notice Period (if currently employed)                           |
| ● 2 weeks     ○ 1 month     ○ Negotiable                       |
|                                                                 |
| Profile Visibility                                              |
| ● Public - Visible to all recruiters                           |
| ○ Limited - Only visible to recruiters I've contacted          |
| ○ Private - Hidden from search (applications only)             |
|                                                                 |
| Desired Compensation *                                          |
| Rate Type: ● Hourly  ○ Annual Salary                           |
|                                                                 |
| Hourly Rate Range:                                              |
| Min: [$  95  ] /hr    Max: [$ 120  ] /hr                       |
|                                                                 |
| Open to negotiate? ☑ Yes                                        |
|                                                                 |
| Job Alert Preferences                                           |
| ☑ Email me daily job matches                                   |
| ☑ Send SMS for urgent opportunities                            |
| ☐ Weekly job digest                                            |
|                                                                 |
+----------------------------------------------------------------+
|                                    [Cancel]  [Save Preferences]|
+----------------------------------------------------------------+
```

**User Action:** Change availability to "Passive - Open to opportunities"

**Field Specification: Availability Status**
| Property | Value |
|----------|-------|
| Field Name | `availabilityStatus` |
| Type | Radio Button Group |
| Label | "Availability Status" |
| Required | Yes |
| Options | |
| - `immediate` | "Available - Can start immediately" |
| - `passive` | "Passive - Open to opportunities" |
| - `not_looking` | "Not looking - Currently employed and happy" |
| - `specific_date` | "Specific date - Available on..." |
| Default | `passive` |

**Time:** ~5 seconds

---

### Step 23: Update Compensation Range

**User Action:** Change min rate from $95 to $100, max from $120 to $135

**Field Specification: Desired Rate**
| Property | Value |
|----------|-------|
| Field Name | `desiredRateMin`, `desiredRateMax` |
| Type | Currency Input |
| Label | "Hourly Rate Range" or "Annual Salary Range" |
| Required | No (but recommended) |
| Min Value | 0 |
| Precision | 2 decimal places |
| Validation | Max must be >= Min |

**Time:** ~5 seconds

---

### Step 24: Save Preferences

**User Action:** Click "Save Preferences" button

**System Response:**
1. Validates all fields
2. Button shows loading state
3. API call `POST /api/trpc/candidates.updatePreferences`
4. On success:
   - Edit mode closes
   - Toast: "Preferences saved successfully"
   - Changes reflect immediately
   - Profile completeness may update
   - Job matching algorithm re-runs with new preferences

**Time:** ~1-2 seconds

---

### Step 25: Review Profile Completeness

**User Action:** Scroll to top of page to view profile completeness widget

**System Response:**
- Updated completeness score displays
- Progress bar reflects new percentage
- Missing items list updates

**Screen State:**
```
+----------------------------------------------------------------+
| Profile Completeness: [█████████░] 90%                         |
+----------------------------------------------------------------+
|                                                                 |
| Great job! Your profile is 90% complete.                       |
|                                                                 |
| ✓ Contact information                                          |
| ✓ Work history (3 positions)                                   |
| ✓ Skills (31 skills)                                           |
| ✓ Resume uploaded                                              |
| ✓ Preferences set                                              |
|                                                                 |
| To reach 100%:                                                  |
| • Add certifications (+5%)                                      |
| • Complete education section (+5%)                              |
|                                                                 |
| Benefits at 90%:                                                |
| ✓ Apply to unlimited jobs                                      |
| ✓ Appear in recruiter searches                                 |
| ✓ AI-powered job matching                                      |
| ✓ Priority placement for hot opportunities                     |
|                                                                 |
+----------------------------------------------------------------+
```

**Time:** ~1 second

---

## Postconditions

1. ✅ Candidate profile updated in `candidates` table
2. ✅ All changes reflected in database
3. ✅ Profile completeness score recalculated
4. ✅ Activity logged: "profile.updated" with changed fields
5. ✅ If phone/email changed: Verification process initiated
6. ✅ Job matching algorithm re-runs if preferences changed
7. ✅ Recruiter search index updated with new information
8. ✅ Resume parsing completed if new resume uploaded
9. ✅ Candidate remains on profile page or returns to dashboard

---

## Events Logged

| Event | Payload |
|-------|---------|
| `profile.contact_updated` | `{ candidate_id, changed_fields, timestamp }` |
| `profile.work_history_added` | `{ candidate_id, company_name, job_title, start_date }` |
| `profile.skills_updated` | `{ candidate_id, added_skills, removed_skills }` |
| `profile.resume_uploaded` | `{ candidate_id, file_name, file_size, parsed }` |
| `profile.preferences_updated` | `{ candidate_id, availability_status, rate_range }` |
| `profile.completeness_changed` | `{ candidate_id, old_score, new_score }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Validation Failed | Required field empty | "Please complete all required fields" | Fill in missing fields |
| Email Already Used | Email exists for another user | "This email is already registered" | Use different email or login |
| Phone Verification Failed | Invalid verification code | "Verification code is incorrect" | Request new code |
| Resume Upload Failed | File too large or invalid format | "Resume must be PDF/DOC and under 10MB" | Use different file |
| Resume Parsing Failed | Unreadable document | "Unable to parse resume. Please check format." | Upload different format or skip parsing |
| Duplicate Work History | Same company/title/dates exist | "This position may already be in your profile" | Review or edit existing entry |
| Rate Validation Error | Min > Max | "Minimum rate cannot exceed maximum rate" | Adjust rate range |
| Network Error | API call failed | "Unable to save changes. Please try again." | Retry |
| Permission Denied | User lacks permission | "You don't have permission to update this profile" | Contact support |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Cancel current edit, close modal |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Cmd+S` / `Ctrl+S` | Save current section |
| `Cmd+E` / `Ctrl+E` | Enter edit mode |

---

## Alternative Flows

### A1: Upload Resume from Mobile Device

1. User clicks "Upload New" on mobile
2. System presents options: "Take Photo", "Choose from Gallery", "Browse Files"
3. If "Take Photo": Camera opens, user photographs resume
4. Image processed and converted to PDF
5. Continue to parsing flow

### A2: Import Profile from LinkedIn

1. User clicks "Import from LinkedIn" button
2. OAuth flow initiates
3. User authorizes InTime access
4. Profile data imports automatically
5. User reviews and confirms imported data
6. Work history, skills, education pre-populate

### A3: Bulk Skills Import

1. User clicks "Import Skills from Resume"
2. System re-parses latest resume
3. Extracted skills show in modal
4. User selects which skills to add
5. Selected skills added with proficiency estimation
6. User prompted to review and adjust proficiency levels

### A4: Quick Profile Update from Dashboard

1. Dashboard shows "Profile Incomplete" widget
2. User clicks specific missing item (e.g., "Add Education")
3. Inline quick-add form appears
4. User fills minimal required fields
5. Saves without leaving dashboard
6. Completeness score updates immediately

---

## Mobile Experience Considerations

**Mobile-Optimized Features:**
- Single-column layout for all sections
- Bottom sheet modals for edits
- Swipe gestures for section navigation
- Auto-save on field blur (no explicit save needed)
- Larger touch targets (48x48px minimum)
- Voice input for descriptions
- Camera integration for resume upload
- Simplified multi-select (drawer instead of dropdown)

**Mobile Edit Flow:**
```
Tap section → Bottom sheet slides up → Edit fields →
Auto-save on blur → Pull down to close
```

---

## Profile Privacy Settings

**Privacy Controls Available:**

| Setting | Options | Default |
|---------|---------|---------|
| Profile Visibility | Public, Limited, Private | Public |
| Resume Visibility | All recruiters, Contacted only, Private | All recruiters |
| Contact Info Sharing | Share immediately, After approval, Never | After approval |
| Work History Visibility | Full detail, Titles only, Hidden | Full detail |
| Salary Expectations | Show to all, Show on request, Hidden | Show on request |
| Current Employer | Show, Hide (for confidential searches) | Show |

---

## Profile Completeness Algorithm

```typescript
function calculateProfileCompleteness(profile: CandidateProfile): number {
  const weights = {
    contact_info: 15,      // Email, phone, location verified
    work_history: 25,      // At least 2 positions with details
    education: 10,         // At least 1 degree
    skills: 20,            // At least 10 skills with proficiency
    resume: 15,            // Current resume uploaded
    preferences: 10,       // Availability and rate set
    certifications: 5,     // Optional but adds points
  };

  let score = 0;

  // Contact Info (15 points)
  if (profile.email_verified) score += 5;
  if (profile.phone_verified) score += 5;
  if (profile.location) score += 5;

  // Work History (25 points)
  if (profile.work_history.length > 0) score += 10;
  if (profile.work_history.length >= 2) score += 10;
  if (profile.work_history.some(j => j.description?.length > 100)) score += 5;

  // Education (10 points)
  if (profile.education.length > 0) score += 10;

  // Skills (20 points)
  if (profile.skills.length >= 5) score += 10;
  if (profile.skills.length >= 10) score += 10;

  // Resume (15 points)
  if (profile.resume_url) score += 15;

  // Preferences (10 points)
  if (profile.availability_status) score += 5;
  if (profile.desired_rate_min) score += 5;

  // Certifications (5 points)
  if (profile.certifications.length > 0) score += 5;

  return Math.min(score, 100);
}
```

---

## Related Use Cases

- [01-portal-onboarding.md](./01-portal-onboarding.md) - Initial profile creation
- [03-view-submissions.md](./03-view-submissions.md) - View job submissions
- [04-prepare-interview.md](./04-prepare-interview.md) - Interview preparation
- [05-manage-placement.md](./05-manage-placement.md) - Active placement management

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Update contact info with all valid data | Profile updates successfully |
| TC-002 | Change email to existing email | Error: "Email already in use" |
| TC-003 | Change phone number | SMS verification required |
| TC-004 | Add work history with all fields | Position added successfully |
| TC-005 | Add work history with overlapping dates | Warning shown, user confirms |
| TC-006 | Update skill proficiency | Skill updates immediately |
| TC-007 | Upload valid PDF resume | Resume parses successfully |
| TC-008 | Upload 15MB resume | Error: "File too large" |
| TC-009 | Update preferences with invalid rate range | Error: "Max rate must be >= min rate" |
| TC-010 | Save profile with network error | Retry option appears |
| TC-011 | Profile completeness calculation | Score updates correctly |
| TC-012 | Mobile resume upload via camera | Image converted and uploaded |

---

*Last Updated: 2024-11-30*
