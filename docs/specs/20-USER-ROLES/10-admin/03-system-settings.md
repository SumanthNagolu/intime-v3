# Use Case: System Settings

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADM-003 |
| Actor | Admin (System Administrator) |
| Goal | Configure organization-wide system settings and integrations |
| Frequency | Weekly (ongoing configuration) |
| Estimated Time | 5-30 minutes per setting category |
| Priority | High |

---

## Preconditions

1. User is logged in as Admin
2. User has "admin.settings.manage" permission (default for Admin role)
3. Organization record exists in the system
4. Super admin credentials available (for sensitive settings)

---

## Trigger

One of the following:
- Initial system setup / onboarding
- Organization rebranding (logo, colors)
- Integration setup (email, calendar, job boards)
- Security policy changes (SSO, 2FA, password rules)
- Compliance requirement changes
- Feature flag toggling for new functionality
- Email template customization
- API access configuration

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to System Settings

**User Action:** Click "Admin" in sidebar, then click "Settings"

**System Response:**
- Sidebar Admin section expands
- URL changes to: `/admin/settings`
- Settings dashboard loads
- Shows settings categories in left sidebar
- General settings shown by default

**Screen State:**
```
+----------------------------------------------------------+
| Admin › Settings                                          |
+----------------------------------------------------------+
| ┌─ Settings Categories ────┐ │                           |
| │                           │ │  General                  |
| │ ● General                 │ │                           |
| │ ○ Organization Profile    │ │  Organization Settings    |
| │ ○ Security                │ │                           |
| │ ○ Email & Notifications   │ │  [Logo preview]           |
| │ ○ Integrations            │ │  InTime OS                |
| │ ○ Features & Modules      │ │                           |
| │ ○ Data & Privacy          │ │  [Edit Profile]           |
| │ ○ API & Webhooks          │ │                           |
| └───────────────────────────┘ │  Quick Actions            |
|                               │                           |
|                               │  [Manage Users]           |
|                               │  [Configure Pods]         |
|                               │  [View Audit Logs]        |
|                               │  [Export Data]            |
|                               │                           |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Organization Profile Settings

**User Action:** Click "Organization Profile" in settings sidebar

**System Response:**
- Right panel updates to show organization profile settings
- Loading skeleton for 200ms
- All current organization settings loaded

**Screen State:**
```
+----------------------------------------------------------+
| Organization Profile                       [Save Changes] |
+----------------------------------------------------------+
|
| Company Information                                       |
|                                                           |
| Organization Name *                                       |
| [InTime Staffing Solutions                             ]  |
|                                                           |
| Legal Entity Name                                         |
| [InTime Staffing Solutions, Inc.                       ]  |
|                                                           |
| Website                                                   |
| [https://www.intimestaffing.com                        ]  |
|                                                           |
| Industry                                                  |
| [Staffing & Recruiting                                 ▼] |
|                                                           |
| Company Size                                              |
| [51-200 employees                                      ▼] |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Branding                                                  |
|                                                           |
| Logo                                                      |
| [Current Logo Preview]                                    |
| [Upload New Logo] (Recommended: 200×200px, PNG)          |
|                                                           |
| Primary Brand Color                                       |
| [#3B82F6] 🎨                                             |
|                                                           |
| Secondary Brand Color                                     |
| [#10B981] 🎨                                             |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Contact Information                                       |
|                                                           |
| Primary Email                                             |
| [contact@intimestaffing.com                            ]  |
|                                                           |
| Support Email                                             |
| [support@intimestaffing.com                            ]  |
|                                                           |
| Primary Phone                                             |
| [(555) 123-4567                                        ]  |
|                                                           |
| Address                                                   |
| [123 Main Street                                       ]  |
| [Suite 400                                             ]  |
| [San Francisco           ] [CA  ] [94105  ]              |
| [United States                                         ▼] |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Time Zone & Locale                                        |
|                                                           |
| Default Time Zone *                                       |
| [America/Los_Angeles (PST/PDT)                         ▼] |
|                                                           |
| Date Format                                               |
| ○ MM/DD/YYYY (US)  ● DD/MM/YYYY (International)          |
|                                                           |
| Time Format                                               |
| ● 12-hour (3:30 PM)  ○ 24-hour (15:30)                   |
|                                                           |
| Currency                                                  |
| [USD - US Dollar                                       ▼] |
|                                                           |
+----------------------------------------------------------+
|                                          [Save Changes ✓] |
+----------------------------------------------------------+
```

**Field Specifications:**

**Organization Name**
| Property | Value |
|----------|-------|
| Field Name | `organizationName` |
| Type | Text Input |
| Required | Yes |
| Max Length | 100 characters |
| Validation | Not empty, alphanumeric + spaces |

**Logo Upload**
| Property | Value |
|----------|-------|
| Field Name | `logoUrl` |
| Type | Image Upload |
| Accepted Types | PNG, JPG, SVG |
| Max File Size | 2 MB |
| Recommended Size | 200×200px |
| Storage | Supabase Storage `org-logos/` bucket |

**Primary Brand Color**
| Property | Value |
|----------|-------|
| Field Name | `primaryColor` |
| Type | Color Picker |
| Format | HEX (#3B82F6) |
| Default | #3B82F6 (Blue) |
| Applied To | Buttons, links, primary UI elements |

**Default Time Zone**
| Property | Value |
|----------|-------|
| Field Name | `defaultTimeZone` |
| Type | Dropdown (Searchable) |
| Required | Yes |
| Data Source | IANA time zone database |
| Default | America/New_York |
| Impact | All timestamps, reports, notifications |

**User Action:** Update organization name, upload new logo, change brand color

**User Action:** Click "Save Changes ✓"

**System Response:**
- Validates all fields
- Updates organization record
- Uploads logo to storage
- Applies brand colors to UI (requires page refresh)
- Toast: "Organization profile updated successfully"
- Logs activity: "settings.org_profile_updated"

**Time:** ~2 minutes

---

### Step 3: Security Settings

**User Action:** Click "Security" in settings sidebar

**System Response:**
- Right panel updates to show security settings

**Screen State:**
```
+----------------------------------------------------------+
| Security Settings                          [Save Changes] |
+----------------------------------------------------------+
|
| Authentication                                            |
|                                                           |
| Single Sign-On (SSO)                                      |
| ☑ Enable SSO for organization                            |
|                                                           |
| SSO Provider                                              |
| ○ SAML 2.0  ● OAuth 2.0 / OpenID Connect                 |
|                                                           |
| Provider Details (OAuth 2.0)                              |
| Client ID                                                 |
| [your-client-id-here                                   ]  |
|                                                           |
| Client Secret                                             |
| [••••••••••••••••••••                                  ]  |
| [Show] [Regenerate]                                       |
|                                                           |
| Authorization URL                                         |
| [https://accounts.google.com/o/oauth2/v2/auth          ]  |
|                                                           |
| Token URL                                                 |
| [https://oauth2.googleapis.com/token                   ]  |
|                                                           |
| Redirect URI (Read-only)                                  |
| [https://intime.com/auth/callback                      ]  |
| [📋 Copy]                                                |
|                                                           |
| [Test SSO Connection]                                     |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Two-Factor Authentication (2FA)                           |
|                                                           |
| ☑ Require 2FA for all users                              |
| ☐ Require 2FA only for admins                            |
| ☑ Allow SMS-based 2FA                                    |
| ☑ Allow authenticator app (TOTP)                         |
|                                                           |
| Grace Period for New Users                                |
| [7  ] days to set up 2FA                                 |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Password Policy                                           |
|                                                           |
| Minimum Password Length                                   |
| [12 ] characters                                          |
|                                                           |
| Password Requirements                                     |
| ☑ At least one uppercase letter                          |
| ☑ At least one lowercase letter                          |
| ☑ At least one number                                    |
| ☑ At least one special character (!@#$%^&*)              |
|                                                           |
| Password Expiration                                       |
| ☐ Require password change every [90] days               |
|                                                           |
| Password History                                          |
| Prevent reuse of last [5  ] passwords                    |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Session Management                                        |
|                                                           |
| Session Timeout (Inactive)                                |
| [30 ] minutes                                             |
|                                                           |
| Maximum Session Duration                                  |
| [24 ] hours (then require re-login)                      |
|                                                           |
| Concurrent Sessions                                       |
| [3  ] devices per user                                   |
|                                                           |
| ☑ Automatically log out on browser close                 |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| IP Allowlist (Optional)                                   |
|                                                           |
| ☐ Restrict access to specific IP addresses              |
|                                                           |
| Allowed IP Addresses (one per line)                       |
| [                                                      ]  |
| [                                                      ]  |
|                                                           |
| Example: 192.168.1.0/24 or 203.0.113.5                    |
|                                                           |
+----------------------------------------------------------+
|                                          [Save Changes ✓] |
+----------------------------------------------------------+
```

**Field Specifications:**

**Enable SSO**
| Property | Value |
|----------|-------|
| Field Name | `ssoEnabled` |
| Type | Checkbox |
| Default | Unchecked |
| Impact | Enables SSO authentication flow |
| Requires | Valid SSO provider configuration |

**Require 2FA for All Users**
| Property | Value |
|----------|-------|
| Field Name | `require2FA` |
| Type | Checkbox |
| Default | Checked (recommended) |
| Impact | All users must set up 2FA |
| Grace Period | Configurable (default 7 days) |

**Minimum Password Length**
| Property | Value |
|----------|-------|
| Field Name | `minPasswordLength` |
| Type | Number Input |
| Min | 8 |
| Max | 128 |
| Default | 12 |
| Recommended | 12-16 characters |

**Session Timeout**
| Property | Value |
|----------|-------|
| Field Name | `sessionTimeoutMinutes` |
| Type | Number Input |
| Min | 5 |
| Max | 1440 (24 hours) |
| Default | 30 minutes |
| Unit | Minutes |

**User Action:** Enable 2FA for all users, set password length to 14

**User Action:** Click "Save Changes ✓"

**System Response:**
- Validates security settings
- Updates organization security config
- Toast: "Security settings updated. Users will be prompted for 2FA on next login."
- Logs activity: "settings.security_updated"

**Time:** ~3 minutes

---

### Step 4: Email & Notifications Settings

**User Action:** Click "Email & Notifications" in settings sidebar

**System Response:**
- Right panel updates to show email and notification settings

**Screen State:**
```
+----------------------------------------------------------+
| Email & Notifications                      [Save Changes] |
+----------------------------------------------------------+
|
| Email Server Configuration                                |
|                                                           |
| Email Provider                                            |
| ● Use InTime Email Service (Recommended)                 |
| ○ Custom SMTP Server                                     |
|                                                           |
| From Email Address *                                      |
| [noreply@intimestaffing.com                            ]  |
|                                                           |
| From Name                                                 |
| [InTime Staffing                                       ]  |
|                                                           |
| Reply-To Email                                            |
| [support@intimestaffing.com                            ]  |
|                                                           |
| [Custom SMTP Configuration] (Hidden unless selected)      |
|                                                           |
| [Send Test Email]                                         |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Email Templates                                           |
|                                                           |
| Customize email templates sent to users                   |
|                                                           |
| Template Library:                                         |
|                                                           |
| • User Invitation Email                [Edit Template]   |
| • Password Reset Email                 [Edit Template]   |
| • New Job Assignment                   [Edit Template]   |
| • Submission Status Update             [Edit Template]   |
| • Interview Scheduled                  [Edit Template]   |
| • Placement Confirmed                  [Edit Template]   |
| • Pod Assignment Notification          [Edit Template]   |
| • Sprint Target Update                 [Edit Template]   |
|                                                           |
| [Preview All Templates]                                   |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Notification Preferences (Defaults)                       |
|                                                           |
| Users can override these in their personal settings       |
|                                                           |
| Email Notifications                                       |
| ☑ Job assigned to me                                     |
| ☑ New submission on my job                               |
| ☑ Interview scheduled                                    |
| ☑ Placement confirmed                                    |
| ☑ Daily digest (8:00 AM)                                 |
| ☐ Weekly summary (Monday 8:00 AM)                        |
|                                                           |
| In-App Notifications                                      |
| ☑ Real-time notifications                                |
| ☑ Show browser notifications (if allowed)                |
| ☑ Notification sound                                     |
|                                                           |
| Notification Frequency                                    |
| ○ Immediate  ● Batched (every 15 min)  ○ Daily digest   |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Slack Integration (Optional)                              |
|                                                           |
| ☐ Enable Slack notifications                             |
|                                                           |
| Slack Webhook URL                                         |
| [https://hooks.slack.com/services/...                  ]  |
|                                                           |
| Send Slack notifications for:                             |
| ☐ New placements                                         |
| ☐ Sprint goals achieved                                  |
| ☐ System alerts                                          |
|                                                           |
| [Test Slack Connection]                                   |
|                                                           |
+----------------------------------------------------------+
|                                          [Save Changes ✓] |
+----------------------------------------------------------+
```

**Field Specifications:**

**From Email Address**
| Property | Value |
|----------|-------|
| Field Name | `fromEmail` |
| Type | Email Input |
| Required | Yes |
| Validation | Valid email, must be verified |
| Default | noreply@{org-domain} |

**Email Provider**
| Property | Value |
|----------|-------|
| Field Name | `emailProvider` |
| Type | Radio Button |
| Options | InTime Service (Recommended), Custom SMTP |
| Default | InTime Service |
| Note | Custom SMTP requires additional config |

**Notification Frequency**
| Property | Value |
|----------|-------|
| Field Name | `notificationFrequency` |
| Type | Radio Button |
| Options | Immediate, Batched (15 min), Daily digest |
| Default | Batched |
| Impact | How often users receive notifications |

**User Action:** Edit "User Invitation Email" template

**System Response:**
- Template editor modal opens

**Screen State (Template Editor):**
```
+----------------------------------------------------------+
|                              Edit Email Template [×]     |
+----------------------------------------------------------+
| Template: User Invitation Email                           |
|                                                           |
| Subject Line *                                            |
| [Welcome to {{organization_name}}!                     ]  |
|                                                           |
| Email Body (HTML supported)                               |
| ┌──────────────────────────────────────────────────────┐ |
| │ Hi {{user_first_name}},                              │ |
| │                                                       │ |
| │ Welcome to {{organization_name}}!                    │ |
| │                                                       │ |
| │ Your account has been created with the following:    │ |
| │                                                       │ |
| │ Email: {{user_email}}                                │ |
| │ Role: {{user_role}}                                  │ |
| │ Pod: {{user_pod}}                                    │ |
| │                                                       │ |
| │ Get started:                                          │ |
| │ 1. Click the link below to set your password         │ |
| │ 2. Set up 2FA for security                           │ |
| │ 3. Complete your profile                             │ |
| │                                                       │ |
| │ [Set Password] ({{reset_link}})                      │ |
| │                                                       │ |
| │ Questions? Contact {{support_email}}                 │ |
| │                                                       │ |
| │ Best regards,                                         │ |
| │ The {{organization_name}} Team                       │ |
| └──────────────────────────────────────────────────────┘ |
|                                                           |
| Available Variables:                                      |
| {{user_first_name}}, {{user_last_name}}, {{user_email}}  |
| {{user_role}}, {{user_pod}}, {{organization_name}}       |
| {{reset_link}}, {{support_email}}, {{login_url}}         |
|                                                           |
| [Reset to Default] [Preview] [Send Test Email]           |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Save Template ✓]                |
+----------------------------------------------------------+
```

**User Action:** Customize template, click "Save Template ✓"

**System Response:**
- Validates template (ensures required variables present)
- Saves template to database
- Toast: "Email template updated"
- Closes modal

**User Action:** Back on main settings, click "Save Changes ✓"

**System Response:**
- Updates notification preferences
- Toast: "Email and notification settings updated"
- Logs activity: "settings.email_updated"

**Time:** ~5 minutes

---

### Step 5: Integrations Settings

**User Action:** Click "Integrations" in settings sidebar

**System Response:**
- Right panel updates to show integrations settings

**Screen State:**
```
+----------------------------------------------------------+
| Integrations                               [Save Changes] |
+----------------------------------------------------------+
|
| Calendar Integration                                      |
|                                                           |
| ☑ Enable calendar integration                            |
|                                                           |
| Calendar Provider                                         |
| ● Google Calendar  ○ Microsoft Outlook  ○ Custom         |
|                                                           |
| Google Calendar Configuration                             |
| Client ID                                                 |
| [your-google-client-id                                 ]  |
|                                                           |
| Client Secret                                             |
| [••••••••••••••••••                                    ]  |
| [Show]                                                    |
|                                                           |
| Calendar Sync                                             |
| ☑ Create events for interviews                           |
| ☑ Send calendar invites to candidates                    |
| ☑ Sync with user's default calendar                      |
|                                                           |
| [Test Calendar Connection]                                |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Job Boards Integration                                    |
|                                                           |
| ☑ Enable job board posting                               |
|                                                           |
| Connected Job Boards:                                     |
|                                                           |
| ☑ LinkedIn Jobs                        [Configure]       |
|   Status: ✅ Connected                                    |
|   Last sync: 2 hours ago                                  |
|                                                           |
| ☑ Indeed                                [Configure]       |
|   Status: ✅ Connected                                    |
|   Last sync: 1 hour ago                                   |
|                                                           |
| ☐ Dice                                  [Configure]       |
|   Status: ⚠️  Not configured                              |
|                                                           |
| ☐ Monster                               [Configure]       |
|   Status: ⚠️  Not configured                              |
|                                                           |
| Auto-Post Settings                                        |
| ☑ Automatically post new jobs to LinkedIn               |
| ☑ Automatically post new jobs to Indeed                  |
| ☐ Require approval before posting                        |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Background Check Provider                                 |
|                                                           |
| ☐ Enable background checks                               |
|                                                           |
| Provider                                                  |
| [Select provider...                                    ▼] |
| Options: Checkr, Sterling, HireRight, GoodHire            |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Resume Parsing Service                                    |
|                                                           |
| ☑ Enable AI resume parsing                               |
|                                                           |
| AI Provider                                               |
| ● OpenAI GPT-4  ○ Anthropic Claude  ○ Custom             |
|                                                           |
| OpenAI API Key                                            |
| [sk-proj-••••••••••••••••••••                          ]  |
| [Show] [Regenerate]                                       |
|                                                           |
| Parsing Confidence Threshold                              |
| [70 ]% (Fields below this confidence highlighted)         |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| CRM Integration (Optional)                                |
|                                                           |
| ☐ Enable external CRM sync                               |
|                                                           |
| CRM System                                                |
| [Select CRM...                                         ▼] |
| Options: Salesforce, HubSpot, Zoho CRM, Custom API        |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Communication Integrations                                |
|                                                           |
| Email Provider (Beyond notifications)                     |
| ☐ Gmail Integration (send/receive from Gmail)            |
| ☐ Outlook Integration                                    |
|                                                           |
| Messaging                                                 |
| ☐ Slack (already configured in Notifications)            |
| ☐ Microsoft Teams                                        |
|                                                           |
+----------------------------------------------------------+
|                                          [Save Changes ✓] |
+----------------------------------------------------------+
```

**User Action:** Configure LinkedIn Jobs integration - Click "Configure"

**System Response:**
- LinkedIn configuration modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                           LinkedIn Jobs Integration [×]   |
+----------------------------------------------------------+
| Connect LinkedIn Jobs API                                 |
|                                                           |
| API Key                                                   |
| [your-linkedin-api-key                                 ]  |
|                                                           |
| API Secret                                                |
| [••••••••••••••••••                                    ]  |
| [Show]                                                    |
|                                                           |
| Company Page ID                                           |
| [12345678                                              ]  |
|                                                           |
| Default Posting Settings                                  |
|                                                           |
| Job Visibility                                            |
| ● Public  ○ Network Only                                 |
|                                                           |
| Application Method                                        |
| ● External (redirect to InTime)  ○ LinkedIn Easy Apply   |
|                                                           |
| External Apply URL                                        |
| [https://careers.intimestaffing.com/apply              ]  |
|                                                           |
| [Test Connection]                                         |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Save Configuration ✓]           |
+----------------------------------------------------------+
```

**User Action:** Enter API credentials, click "Test Connection"

**System Response:**
- Makes API test call to LinkedIn
- Shows success or error message
- If success: Green checkmark "✅ Connection successful"

**User Action:** Click "Save Configuration ✓"

**System Response:**
- Saves LinkedIn integration config
- Updates integration status to "Connected"
- Toast: "LinkedIn Jobs integration configured"
- Closes modal

**User Action:** Back on main settings, click "Save Changes ✓"

**System Response:**
- Saves all integration settings
- Toast: "Integration settings updated"
- Logs activity: "settings.integrations_updated"

**Time:** ~10 minutes

---

### Step 6: Features & Modules Settings

**User Action:** Click "Features & Modules" in settings sidebar

**System Response:**
- Right panel updates to show feature flags and module toggles

**Screen State:**
```
+----------------------------------------------------------+
| Features & Modules                         [Save Changes] |
+----------------------------------------------------------+
|
| Active Modules                                            |
|                                                           |
| Core Modules (Always Active)                              |
| ✅ Recruiting (ATS)                                      |
| ✅ User Management                                       |
| ✅ Pod Management                                        |
|                                                           |
| Optional Modules                                          |
|                                                           |
| ☑ Bench Sales                                            |
|   Marketing and placement of bench consultants            |
|                                                           |
| ☑ Talent Acquisition (TA)                                |
|   Direct hiring for internal positions                    |
|                                                           |
| ☑ CRM                                                    |
|   Lead and deal pipeline management                       |
|                                                           |
| ☑ Academy                                                |
|   Training platform for candidates                        |
|                                                           |
| ☐ Client Portal                                          |
|   External portal for clients to view submissions         |
|                                                           |
| ☐ AI Twins                                               |
|   AI-powered virtual assistants (Beta)                    |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Feature Flags (Experimental)                              |
|                                                           |
| ☑ Enable dark mode                                       |
|   Allow users to switch to dark theme                     |
|                                                           |
| ☑ Advanced search filters                                |
|   Boolean search, saved searches                          |
|                                                           |
| ☐ AI-powered candidate matching                          |
|   Auto-suggest candidates for jobs (Beta)                 |
|                                                           |
| ☐ Video interview integration                            |
|   Embedded video interviews (Zoom, Teams)                 |
|                                                           |
| ☐ Mobile app access                                      |
|   Enable mobile app for recruiters (Coming soon)          |
|                                                           |
| ☑ Email tracking                                         |
|   Track open/click rates on emails sent                   |
|                                                           |
| ☐ Candidate self-scheduling                              |
|   Allow candidates to book interview slots                |
|                                                           |
| ☐ Bulk import/export                                     |
|   CSV bulk operations for candidates, jobs                |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Performance Settings                                      |
|                                                           |
| Database Query Optimization                               |
| ● Enabled  ○ Disabled                                    |
|                                                           |
| Cache Strategy                                            |
| ● Aggressive (faster, more memory)                       |
| ○ Balanced                                                |
| ○ Conservative (slower, less memory)                     |
|                                                           |
| Real-time Updates                                         |
| ☑ Enable WebSocket connections                           |
|   Live updates without page refresh                       |
|                                                           |
+----------------------------------------------------------+
|                                          [Save Changes ✓] |
+----------------------------------------------------------+
```

**User Action:** Enable "Client Portal" and "AI-powered candidate matching"

**User Action:** Click "Save Changes ✓"

**System Response:**
- Enables selected modules and features
- May require page refresh for UI changes
- Toast: "Features updated. Please refresh page to see changes."
- Logs activity: "settings.features_updated"

**Time:** ~3 minutes

---

### Step 7: Data & Privacy Settings

**User Action:** Click "Data & Privacy" in settings sidebar

**System Response:**
- Right panel updates to show data and privacy settings

**Screen State:**
```
+----------------------------------------------------------+
| Data & Privacy                             [Save Changes] |
+----------------------------------------------------------+
|
| Data Retention                                            |
|                                                           |
| Candidate Data                                            |
| Retain candidate data for: [2  ] years after last activity |
|                                                           |
| Job Data                                                  |
| Retain job data for: [5  ] years after closure           |
|                                                           |
| Activity Logs                                             |
| Retain activity logs for: [1  ] year                     |
|                                                           |
| Audit Logs                                                |
| Retain audit logs for: [7  ] years (compliance)          |
|                                                           |
| ☑ Automatically archive old data                         |
| ☑ Anonymize data after retention period                  |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| GDPR Compliance                                           |
|                                                           |
| ☑ Enable GDPR features                                   |
|                                                           |
| Data Subject Rights                                       |
| ☑ Allow users to request data export                     |
| ☑ Allow users to request data deletion                   |
| ☑ Show privacy policy on signup                          |
| ☑ Require consent for data processing                    |
|                                                           |
| Privacy Policy URL                                        |
| [https://intimestaffing.com/privacy                    ]  |
|                                                           |
| Terms of Service URL                                      |
| [https://intimestaffing.com/terms                      ]  |
|                                                           |
| Data Protection Officer (DPO)                             |
| Name: [Jane Smith                                      ]  |
| Email: [dpo@intimestaffing.com                         ]  |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Data Export & Backup                                      |
|                                                           |
| Automated Backups                                         |
| ☑ Enable daily backups                                   |
|                                                           |
| Backup Schedule                                           |
| ● Daily at 2:00 AM  ○ Weekly  ○ Custom                   |
|                                                           |
| Backup Retention                                          |
| Keep backups for: [30 ] days                             |
|                                                           |
| Backup Location                                           |
| [Supabase Storage (Encrypted)                          ▼] |
|                                                           |
| Last Backup: Today at 2:05 AM ✅                         |
| [Run Backup Now]                                          |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Data Sharing                                              |
|                                                           |
| Third-Party Data Sharing                                  |
| ☐ Allow sharing data with partner agencies               |
| ☐ Allow sharing data with job boards                     |
| ☑ Require explicit consent for each share               |
|                                                           |
| Analytics & Tracking                                      |
| ☑ Enable usage analytics (anonymized)                    |
| ☐ Share anonymized data for product improvement         |
|                                                           |
+----------------------------------------------------------+
|                                          [Save Changes ✓] |
+----------------------------------------------------------+
```

**User Action:** Adjust data retention periods, enable GDPR features

**User Action:** Click "Save Changes ✓"

**System Response:**
- Saves data retention policies
- Schedules archival jobs for old data
- Toast: "Data and privacy settings updated"
- Logs activity: "settings.privacy_updated"

**Time:** ~5 minutes

---

### Step 8: API & Webhooks Settings

**User Action:** Click "API & Webhooks" in settings sidebar

**System Response:**
- Right panel updates to show API and webhook settings

**Screen State:**
```
+----------------------------------------------------------+
| API & Webhooks                             [Save Changes] |
+----------------------------------------------------------+
|
| API Access                                                |
|                                                           |
| ☑ Enable API access                                      |
|                                                           |
| API Base URL (Read-only)                                  |
| [https://api.intimestaffing.com/v1                     ]  |
| [📋 Copy]                                                |
|                                                           |
| API Keys                                                  |
|                                                           |
| Production API Key                                        |
| [sk_live_••••••••••••••••••••••••••••••••••••••       ]  |
| Created: 6 months ago                                     |
| Last Used: 2 hours ago                                    |
| [Show] [Regenerate] [Revoke]                             |
|                                                           |
| Test API Key                                              |
| [sk_test_••••••••••••••••••••••••••••••••••••••       ]  |
| Created: 6 months ago                                     |
| Last Used: 1 day ago                                      |
| [Show] [Regenerate] [Revoke]                             |
|                                                           |
| [+ Generate New API Key]                                  |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Rate Limiting                                             |
|                                                           |
| Requests per minute: [100 ] (per API key)                |
| Burst limit: [200 ] requests                             |
|                                                           |
| ☑ Enable rate limiting                                   |
| ☐ Send alert when limit reached                          |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| Webhooks                                                  |
|                                                           |
| ☑ Enable webhooks                                        |
|                                                           |
| Configured Webhooks:                                      |
|                                                           |
| 1. Placement Notification                                 |
|    URL: https://partner.com/webhooks/placement            |
|    Events: placement.created, placement.confirmed         |
|    Status: ✅ Active (Last triggered: 3 hours ago)        |
|    [Edit] [Test] [Delete]                                 |
|                                                           |
| 2. Candidate Added                                        |
|    URL: https://crm.example.com/api/candidates            |
|    Events: candidate.created                              |
|    Status: ⚠️  Failed (Last error: Connection timeout)    |
|    [Edit] [Test] [Delete]                                 |
|                                                           |
| [+ Add Webhook]                                           |
|                                                           |
| Available Events:                                         |
| • candidate.created, candidate.updated                    |
| • job.created, job.updated, job.filled                    |
| • submission.created, submission.updated                  |
| • placement.created, placement.confirmed                  |
| • interview.scheduled, interview.completed                |
| • user.created, user.deactivated                          |
|                                                           |
| ─────────────────────────────────────────────────────────|
|                                                           |
| API Documentation                                         |
|                                                           |
| [View Full API Documentation →]                           |
| [Download OpenAPI Spec]                                   |
|                                                           |
+----------------------------------------------------------+
|                                          [Save Changes ✓] |
+----------------------------------------------------------+
```

**User Action:** Click "+ Add Webhook"

**System Response:**
- Add webhook modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                                       Add Webhook [×]     |
+----------------------------------------------------------+
| Configure New Webhook                                     |
|                                                           |
| Webhook Name *                                            |
| [New Job Notification                                  ]  |
|                                                           |
| Target URL *                                              |
| [https://your-system.com/api/webhooks                  ]  |
|                                                           |
| Events to Subscribe *                                     |
| [Select events...                                      ▼] |
|                                                           |
| ☑ job.created                                            |
| ☑ job.updated                                            |
| ☐ job.filled                                             |
| ☐ candidate.created                                      |
| ☐ placement.created                                      |
|                                                           |
| Authentication                                            |
| ☑ Include signature header (HMAC SHA256)                 |
|                                                           |
| Secret Key (for signature)                                |
| [Auto-generated: whsec_••••••••••••••••••••            ]  |
| [Show] [Regenerate]                                       |
|                                                           |
| Retry Policy                                              |
| Max retries: [3  ]                                       |
| Retry interval: [5  ] minutes                            |
|                                                           |
| ☑ Active (start sending immediately)                     |
|                                                           |
| [Test Webhook]                                            |
|                                                           |
+----------------------------------------------------------+
|               [Cancel]  [Create Webhook ✓]               |
+----------------------------------------------------------+
```

**User Action:** Configure webhook, click "Test Webhook"

**System Response:**
- Sends test payload to webhook URL
- Shows success or error response

**User Action:** Click "Create Webhook ✓"

**System Response:**
- Creates webhook configuration
- Adds to webhooks list
- Toast: "Webhook created successfully"
- Closes modal

**Time:** ~5 minutes

---

## Postconditions

1. ✅ Organization settings updated in `organizations` table
2. ✅ Security settings applied (SSO, 2FA, password policy)
3. ✅ Email templates customized
4. ✅ Integrations configured and tested
5. ✅ Feature flags enabled/disabled
6. ✅ Data retention policies set
7. ✅ API keys generated
8. ✅ Webhooks configured
9. ✅ All changes logged in audit log
10. ✅ Notifications sent to affected users (if applicable)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `settings.org_profile_updated` | `{ org_id, changed_fields, updated_by, updated_at }` |
| `settings.security_updated` | `{ org_id, security_changes, updated_by, updated_at }` |
| `settings.email_updated` | `{ org_id, email_changes, updated_by, updated_at }` |
| `settings.integrations_updated` | `{ org_id, integration_changes, updated_by, updated_at }` |
| `settings.features_updated` | `{ org_id, enabled_features, disabled_features, updated_by, updated_at }` |
| `settings.privacy_updated` | `{ org_id, privacy_changes, updated_by, updated_at }` |
| `api.key_generated` | `{ org_id, key_type, generated_by, generated_at }` |
| `webhook.created` | `{ org_id, webhook_id, target_url, events, created_by, created_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Invalid Logo Format | Unsupported file type | "Please upload PNG, JPG, or SVG file" | Upload valid image |
| Logo Too Large | File > 2MB | "Logo file must be under 2 MB" | Compress image |
| Invalid SSO Config | Missing required fields | "Please complete all SSO configuration fields" | Fill missing fields |
| SSO Test Failed | Incorrect credentials | "SSO connection test failed. Check credentials." | Verify SSO provider settings |
| Email Test Failed | SMTP error | "Test email failed to send. Check configuration." | Verify email server settings |
| API Key Generation Failed | System error | "Failed to generate API key. Try again." | Retry |
| Webhook Test Failed | Connection error | "Webhook test failed: {error message}" | Check webhook URL and firewall |
| Invalid Time Zone | Unrecognized time zone | "Invalid time zone selected" | Select valid time zone |
| Permission Denied | User lacks permission | "You don't have permission to change system settings" | Contact super admin |

---

## Best Practices

### Organization Profile
- ✅ Use high-resolution logo (200×200px minimum)
- ✅ Choose brand colors with good contrast
- ✅ Set correct time zone for accurate reporting
- ✅ Keep contact information up to date

### Security
- ✅ Enable 2FA for all users
- ✅ Use SSO if available
- ✅ Set minimum password length to 12+ characters
- ✅ Review session timeout settings for security vs. usability
- ✅ Monitor failed login attempts

### Email & Notifications
- ✅ Test email delivery before enabling
- ✅ Customize templates to match brand voice
- ✅ Set reasonable notification defaults
- ✅ Provide clear unsubscribe options

### Integrations
- ✅ Test each integration after configuration
- ✅ Keep API credentials secure
- ✅ Monitor integration health regularly
- ✅ Document custom integrations

### Features
- ✅ Enable only needed features (avoid feature bloat)
- ✅ Test beta features in staging first
- ✅ Communicate feature changes to users
- ✅ Monitor performance impact of new features

### Data & Privacy
- ✅ Comply with local data protection laws (GDPR, CCPA)
- ✅ Set appropriate retention periods
- ✅ Enable automated backups
- ✅ Provide clear privacy policies
- ✅ Honor user data requests promptly

### API & Webhooks
- ✅ Rotate API keys regularly
- ✅ Use different keys for production and testing
- ✅ Monitor API usage and rate limits
- ✅ Implement webhook retry logic
- ✅ Secure webhook endpoints

---

*Last Updated: 2024-11-30*
