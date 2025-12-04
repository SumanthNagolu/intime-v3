# UC-ADMIN-010: Email Template Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-ADMIN-010 |
| Actor | Admin |
| Goal | Configure system email templates and notification settings |
| Frequency | Weekly (initial setup) + as needed for modifications |
| Estimated Time | 15-30 min per template |
| Priority | HIGH |

---

## Preconditions

1. User is authenticated with Admin role
2. User has `email_templates.create`, `email_templates.update`, `email_templates.delete` permissions
3. Organization has email service configured (SMTP or SendGrid)
4. At least one email sender address is verified

---

## Trigger

- Admin clicks "Email" in the Admin sidebar navigation under SYSTEM
- Admin navigates directly to `/employee/admin/settings/email`
- Admin uses keyboard shortcut `g e` from any admin page
- System prompts to create template when setting up notifications

---

## Email Template Categories

| Category | Code | Description | Templates Count |
|----------|------|-------------|-----------------|
| User Notifications | `user` | Welcome, password reset, 2FA setup | 8 templates |
| Candidate Communications | `candidate` | Application received, interview scheduled | 12 templates |
| Client Notifications | `client` | Submission sent, placement confirmed | 10 templates |
| Internal Alerts | `internal` | New lead, deal closed, approval needed | 15 templates |
| System Alerts | `system` | Integration error, security alerts | 6 templates |
| Marketing | `marketing` | Campaigns, newsletters, promotions | 5 templates |

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Email Templates

**User Action:** Click "Email" in Admin sidebar under SYSTEM section

**System Response:**
- URL changes to: `/employee/admin/settings/email`
- Page title displays: "Email Templates"
- Template library loads with categories
- Stats bar shows: Total (56), Active (48), Draft (5), Disabled (3)

**Screen State:**

```
+----------------------------------------------------------+
| Email Templates                          [+ New Template]  |
+----------------------------------------------------------+
| [Search templates...]      [Category ▼] [Status ▼]        |
+----------------------------------------------------------+
| CATEGORIES                                                 |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ 👤 User Notifications                          (8)  │   |
| │ Welcome Email, Password Reset, 2FA Setup, etc.      │   |
| ├─────────────────────────────────────────────────────┤   |
| │ 📋 Candidate Communications                    (12) │   |
| │ Application Received, Interview Scheduled, etc.     │   |
| ├─────────────────────────────────────────────────────┤   |
| │ 🏢 Client Notifications                        (10) │   |
| │ Submission Sent, Placement Confirmed, etc.          │   |
| ├─────────────────────────────────────────────────────┤   |
| │ 🔔 Internal Alerts                             (15) │   |
| │ New Lead, Deal Closed, Approval Needed, etc.        │   |
| ├─────────────────────────────────────────────────────┤   |
| │ ⚠️ System Alerts                               (6)  │   |
| │ Integration Error, Security Alert, etc.             │   |
| ├─────────────────────────────────────────────────────┤   |
| │ 📧 Marketing                                   (5)  │   |
| │ Campaigns, Newsletters, Promotions                  │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
+----------------------------------------------------------+
| [Email Settings]  [Sender Addresses]  [Unsubscribe Rules] |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 2: Select Category and View Templates

**User Action:** Click "User Notifications" category

**System Response:**
- Category expands to show all templates
- Templates listed with status indicators
- Preview available on hover

**Screen State:**

```
+----------------------------------------------------------+
| Email Templates > User Notifications     [+ New Template]  |
+----------------------------------------------------------+
| [Search templates...]                    [Status ▼]        |
+----------------------------------------------------------+
| USER NOTIFICATION TEMPLATES (8)                            |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ✓ Welcome Email - New User                  [Active]│   |
| │   Subject: Welcome to {{company_name}}! 🎉          │   |
| │   Last edited: Dec 1, 2024 by admin@company.com     │   |
| │   [Edit]  [Preview]  [Duplicate]  [Disable]         │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ✓ Password Reset Request                    [Active]│   |
| │   Subject: Reset Your Password - {{company_name}}   │   |
| │   Last edited: Nov 28, 2024 by admin@company.com    │   |
| │   [Edit]  [Preview]  [Duplicate]  [Disable]         │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ✓ 2FA Setup Instructions                    [Active]│   |
| │   Subject: Secure Your Account with 2FA             │   |
| │   Last edited: Nov 15, 2024 by admin@company.com    │   |
| │   [Edit]  [Preview]  [Duplicate]  [Disable]         │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ✓ Account Deactivation Notice               [Active]│   |
| │   Subject: Your Account Has Been Deactivated        │   |
| │   Last edited: Nov 10, 2024 by admin@company.com    │   |
| │   [Edit]  [Preview]  [Duplicate]  [Disable]         │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ ○ Login Alert - New Device                   [Draft]│   |
| │   Subject: New Login Detected                       │   |
| │   Last edited: Dec 2, 2024 by admin@company.com     │   |
| │   [Edit]  [Preview]  [Activate]  [Delete]           │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| [← Back to Categories]                                     |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Click "+ New Template" or "Edit"

**User Action:** Click "Edit" on "Welcome Email - New User"

**System Response:**
- Template editor opens in full-screen mode
- URL changes to: `/employee/admin/settings/email/templates/welcome-email`
- Editor loads with Visual Editor tab active
- Variable panel shows available merge tags

**Screen State:**

```
+----------------------------------------------------------+
| Template Editor: Welcome Email - New User          [Save]  |
+----------------------------------------------------------+
| TEMPLATE SETTINGS                                          |
|                                                            |
| Template Name *                                            |
| [Welcome Email - New User                              ]   |
|                                                            |
| Category *                                                 |
| [User Notifications                                    ▼]  |
|                                                            |
| Internal Notes                                             |
| [Sent automatically when new user account is created   ]   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| EMAIL HEADERS                                              |
|                                                            |
| Subject Line *                                             |
| [Welcome to {{company_name}}! 🎉                       ]   |
|                                                            |
| Preview Text (shows in inbox preview)                      |
| [We're excited to have you join our team...            ]   |
|                                                            |
| From Name                                                  |
| [{{company_name}} Team                                 ]   |
|                                                            |
| From Email                                                 |
| [noreply@{{company_domain}}                            ▼]  |
| Options: noreply@, hr@, support@, custom                  |
|                                                            |
| Reply-To                                                   |
| [hr@{{company_domain}}                                 ]   |
|                                                            |
| ─────────────────────────────────────────────────────────  |
| EMAIL BODY                                                 |
|                                                            |
| [Visual Editor] [HTML Editor] [Plain Text]                 |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ TOOLBAR                                             │   |
| │ [B] [I] [U] [Link] [Image] [Button] [Divider]      │   |
| │ [H1] [H2] [H3] [List] [Quote] [Code]               │   |
| ├─────────────────────────────────────────────────────┤   |
| │                                                     │   |
| │ Hi {{first_name}},                                  │   |
| │                                                     │   |
| │ Welcome to {{company_name}}! We're thrilled to     │   |
| │ have you join our team as {{job_title}}.           │   |
| │                                                     │   |
| │ Here's what you need to know:                      │   |
| │                                                     │   |
| │ • Start Date: {{start_date}}                       │   |
| │ • Manager: {{manager_name}}                        │   |
| │ • Department: {{department}}                       │   |
| │                                                     │   |
| │ To get started, please:                            │   |
| │ 1. Set up your password: [Button: Set Password]    │   |
| │ 2. Complete your profile                           │   |
| │ 3. Review the onboarding checklist                 │   |
| │                                                     │   |
| │ If you have any questions, reach out to your       │   |
| │ manager or HR at {{hr_email}}.                     │   |
| │                                                     │   |
| │ Best,                                               │   |
| │ {{company_name}} Team                              │   |
| │                                                     │   |
| │ [Company Logo]                                      │   |
| │ ─────────────────────────────────────────────────  │   |
| │ [Footer with unsubscribe link]                     │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
+----------------------------------------------------------+
| AVAILABLE VARIABLES                         [Insert ▼]     |
|                                                            |
| User: {{first_name}}, {{last_name}}, {{full_name}},       |
|       {{email}}, {{job_title}}                            |
| Company: {{company_name}}, {{company_domain}}, {{logo}}    |
| Employment: {{start_date}}, {{department}}, {{pod_name}}   |
| Manager: {{manager_name}}, {{manager_email}}               |
| Links: {{password_setup_link}}, {{login_link}},            |
|        {{profile_link}}, {{onboarding_link}}               |
| System: {{current_date}}, {{current_year}}                 |
+----------------------------------------------------------+
| [Preview] [Send Test] [Cancel] [Save Draft] [Save & Activate]|
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 4: Edit Template Content

**User Action:** Modify the email content using the visual editor

**System Response:**
- Changes reflect in real-time
- Auto-save every 30 seconds (draft status)
- Variable syntax highlighted in blue
- Invalid variables show red underline

**Field Specification: Subject Line**

| Property | Value |
|----------|-------|
| Field Name | `subject` |
| Type | TextInput |
| Label | "Subject Line" |
| Required | Yes |
| Max Length | 200 characters |
| Variables | Supported ({{variable_name}}) |
| Emoji | Supported |
| Error Messages | |
| - Empty | "Subject line is required" |
| - Too Long | "Subject must be under 200 characters" |
| - Invalid Variable | "Unknown variable: {{xyz}}" |
| Best Practice | Keep under 50 characters for mobile |

**Field Specification: Email Body**

| Property | Value |
|----------|-------|
| Field Name | `body_html` |
| Type | Rich Text Editor |
| Label | "Email Body" |
| Required | Yes |
| Max Length | 100,000 characters |
| Variables | Supported |
| Images | Upload or URL (max 5MB) |
| Buttons | Supported with link |
| Error Messages | |
| - Empty | "Email body is required" |
| - Invalid HTML | "HTML syntax error at line X" |
| - Missing Unsubscribe | "Marketing emails require unsubscribe link" |

**Time:** Variable (content editing)

---

### Step 5: Switch to HTML Editor (Optional)

**User Action:** Click "HTML Editor" tab

**System Response:**
- Raw HTML view loads
- Syntax highlighting enabled
- Line numbers shown
- Validation runs on blur

**Screen State:**

```
+----------------------------------------------------------+
| [Visual Editor] [HTML Editor ← Active] [Plain Text]        |
+----------------------------------------------------------+
| ┌─────────────────────────────────────────────────────┐   |
| │  1 │ <!DOCTYPE html>                                │   |
| │  2 │ <html>                                         │   |
| │  3 │ <head>                                         │   |
| │  4 │   <meta charset="utf-8">                       │   |
| │  5 │   <style>                                      │   |
| │  6 │     body { font-family: Arial, sans-serif; }   │   |
| │  7 │     .button {                                  │   |
| │  8 │       background-color: #2D5016;               │   |
| │  9 │       color: white;                            │   |
| │ 10 │       padding: 12px 24px;                      │   |
| │ 11 │       text-decoration: none;                   │   |
| │ 12 │       border-radius: 4px;                      │   |
| │ 13 │     }                                          │   |
| │ 14 │   </style>                                     │   |
| │ 15 │ </head>                                        │   |
| │ 16 │ <body>                                         │   |
| │ 17 │   <div style="max-width: 600px; margin: auto;">│   |
| │ 18 │     <img src="{{logo_url}}" alt="Logo">        │   |
| │ 19 │     <h1>Hi {{first_name}},</h1>                │   |
| │ 20 │     <p>Welcome to {{company_name}}!</p>        │   |
| │ 21 │     ...                                        │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| HTML Validation: ✓ Valid                                   |
| Variables Found: 8 (all valid)                            |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 6: Preview Email

**User Action:** Click "Preview" button

**System Response:**
- Preview modal opens
- Sample data populated in variables
- Desktop and mobile views available
- Dark mode preview option

**Screen State:**

```
+----------------------------------------------------------+
| Preview: Welcome Email - New User               [× Close]  |
+----------------------------------------------------------+
| [Desktop] [Mobile] [Dark Mode]                             |
+----------------------------------------------------------+
|                                                            |
| From: InTime Staffing Team <noreply@intime.com>           |
| To: sarah.chen@intime.com                                  |
| Subject: Welcome to InTime Staffing! 🎉                    |
|                                                            |
| ─────────────────────────────────────────────────────────  |
|                                                            |
| ┌─────────────────────────────────────────────────────┐   |
| │ [InTime Logo]                                       │   |
| │                                                     │   |
| │ Hi Sarah,                                           │   |
| │                                                     │   |
| │ Welcome to InTime Staffing! We're thrilled to      │   |
| │ have you join our team as Senior Recruiter.        │   |
| │                                                     │   |
| │ Here's what you need to know:                      │   |
| │                                                     │   |
| │ • Start Date: Monday, December 18, 2024            │   |
| │ • Manager: Mike Rodriguez                          │   |
| │ • Department: Recruiting                           │   |
| │                                                     │   |
| │ To get started, please:                            │   |
| │ 1. Set up your password                            │   |
| │    ┌────────────────────┐                          │   |
| │    │  Set Password →    │                          │   |
| │    └────────────────────┘                          │   |
| │ 2. Complete your profile                           │   |
| │ 3. Review the onboarding checklist                 │   |
| │                                                     │   |
| │ If you have any questions, reach out to your       │   |
| │ manager or HR at hr@intime.com.                    │   |
| │                                                     │   |
| │ Best,                                               │   |
| │ InTime Staffing Team                               │   |
| │                                                     │   |
| │ ─────────────────────────────────────────────────  │   |
| │ InTime Staffing | 123 Main St | City, State        │   |
| │ Unsubscribe | Privacy Policy                       │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
+----------------------------------------------------------+
| Sample Data Used:                                          |
| first_name: Sarah | company_name: InTime Staffing         |
| job_title: Senior Recruiter | start_date: Dec 18, 2024    |
| [Change Sample Data]                                       |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 7: Send Test Email

**User Action:** Click "Send Test" button

**System Response:**
- Test email modal opens
- User enters recipient email(s)
- Test email sent with "[TEST]" prefix in subject
- Confirmation shown

**Screen State:**

```
+----------------------------------------------------------+
| Send Test Email                                 [× Close]  |
+----------------------------------------------------------+
| Send a test version of this email                          |
|                                                            |
| Recipient Email(s) *                                       |
| [admin@company.com                                     ]   |
| ℹ️ Separate multiple emails with commas                    |
|                                                            |
| Sample Data                                                |
| ┌─────────────────────────────────────────────────────┐   |
| │ first_name      │ [Sarah                        ]   │   |
| │ last_name       │ [Chen                         ]   │   |
| │ email           │ [sarah@company.com            ]   │   |
| │ company_name    │ [InTime Staffing              ]   │   |
| │ job_title       │ [Senior Recruiter             ]   │   |
| │ start_date      │ [December 18, 2024            ]   │   |
| │ manager_name    │ [Mike Rodriguez               ]   │   |
| │ department      │ [Recruiting                   ]   │   |
| └─────────────────────────────────────────────────────┘   |
|                                                            |
| ☑ Add "[TEST]" prefix to subject line                     |
| ☐ Use my email as recipient instead                       |
|                                                            |
+----------------------------------------------------------+
|                              [Cancel]  [Send Test Email]   |
+----------------------------------------------------------+
```

**Confirmation State:**

```
+----------------------------------------------------------+
| ✓ Test Email Sent                               [× Close]  |
+----------------------------------------------------------+
|                                                            |
| Test email sent successfully to:                           |
| • admin@company.com                                        |
|                                                            |
| Subject: [TEST] Welcome to InTime Staffing! 🎉             |
|                                                            |
| Please check your inbox (and spam folder) to verify       |
| the email renders correctly.                               |
|                                                            |
+----------------------------------------------------------+
|                                      [Send Another Test]   |
+----------------------------------------------------------+
```

**Time:** ~3 seconds

---

### Step 8: Save and Activate Template

**User Action:** Click "Save & Activate"

**System Response:**
- Template validates all required fields
- Template saves to database
- Status changes to "Active"
- Previous active version archived (if exists)
- Success notification shown

**Backend Processing:**

```typescript
// Template save and activation
async function saveAndActivateTemplate(templateId: string, data: TemplateData) {
  // 1. Validate template
  const validation = await validateTemplate(data);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors);
  }

  // 2. Check for required variables based on category
  if (data.category === 'marketing' && !data.body_html.includes('{{unsubscribe_link}}')) {
    throw new ValidationError(['Marketing emails must include unsubscribe link']);
  }

  // 3. Archive previous active version
  await db.emailTemplates.update(
    { org_id: currentOrg.id, slug: data.slug, status: 'active' },
    { status: 'archived', archived_at: new Date() }
  );

  // 4. Save new version
  const template = await db.emailTemplates.upsert({
    id: templateId,
    org_id: currentOrg.id,
    name: data.name,
    slug: slugify(data.name),
    category: data.category,
    subject: data.subject,
    preview_text: data.preview_text,
    from_name: data.from_name,
    from_email: data.from_email,
    reply_to: data.reply_to,
    body_html: data.body_html,
    body_text: data.body_text || stripHtml(data.body_html),
    variables_used: extractVariables(data.body_html),
    status: 'active',
    version: (data.version || 0) + 1,
    updated_by: currentUser.id,
    updated_at: new Date()
  });

  // 5. Create audit log
  await auditLog.create({
    action: 'email_template.activated',
    entity_type: 'email_template',
    entity_id: template.id,
    user_id: currentUser.id,
    metadata: { template_name: data.name, version: template.version }
  });

  return template;
}
```

**SQL:**

```sql
-- Save email template
INSERT INTO email_templates (
  id, org_id, name, slug, category, subject, preview_text,
  from_name, from_email, reply_to, body_html, body_text,
  variables_used, status, version, created_by, updated_by
) VALUES (
  gen_random_uuid(),
  'org-uuid',
  'Welcome Email - New User',
  'welcome-email-new-user',
  'user',
  'Welcome to {{company_name}}! 🎉',
  'We''re excited to have you join our team...',
  '{{company_name}} Team',
  'noreply@{{company_domain}}',
  'hr@{{company_domain}}',
  '<html>...</html>',
  'Hi {{first_name}}, Welcome to...',
  ARRAY['first_name', 'company_name', 'job_title', 'start_date', 'manager_name'],
  'active',
  1,
  'user-uuid',
  'user-uuid'
)
ON CONFLICT (org_id, slug, version)
DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  status = EXCLUDED.status,
  updated_at = NOW(),
  updated_by = EXCLUDED.updated_by;
```

**Time:** ~2 seconds

---

## Variable Reference

### User Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{first_name}}` | User's first name | Sarah |
| `{{last_name}}` | User's last name | Chen |
| `{{full_name}}` | User's full name | Sarah Chen |
| `{{email}}` | User's email address | sarah@company.com |
| `{{job_title}}` | User's position | Senior Recruiter |
| `{{department}}` | User's department | Recruiting |
| `{{pod_name}}` | User's pod/team name | Alpha Pod |

### Company Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{company_name}}` | Organization name | InTime Staffing |
| `{{company_domain}}` | Company domain | intime.com |
| `{{company_address}}` | Company address | 123 Main St, City |
| `{{company_phone}}` | Company phone | (555) 123-4567 |
| `{{logo_url}}` | Company logo URL | https://... |

### Employment Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{start_date}}` | Formatted start date | Monday, December 18, 2024 |
| `{{start_date_short}}` | Short start date | 12/18/2024 |
| `{{manager_name}}` | Manager's name | Mike Rodriguez |
| `{{manager_email}}` | Manager's email | mike@company.com |
| `{{hr_email}}` | HR contact email | hr@company.com |

### Link Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{password_setup_link}}` | Password setup URL | https://app.../setup/abc123 |
| `{{login_link}}` | Login page URL | https://app.../login |
| `{{profile_link}}` | User profile URL | https://app.../profile |
| `{{onboarding_link}}` | Onboarding checklist | https://app.../onboarding |
| `{{unsubscribe_link}}` | Unsubscribe URL | https://app.../unsubscribe/xyz |
| `{{preferences_link}}` | Email preferences | https://app.../preferences |

### Entity Variables (Candidates, Jobs, etc.)

| Variable | Description | Context |
|----------|-------------|---------|
| `{{candidate.name}}` | Candidate's name | Candidate emails |
| `{{candidate.email}}` | Candidate's email | Candidate emails |
| `{{job.title}}` | Job title | Job-related emails |
| `{{job.location}}` | Job location | Job-related emails |
| `{{job.bill_rate}}` | Job bill rate | Job-related emails |
| `{{submission.status}}` | Submission status | Submission emails |
| `{{interview.date}}` | Interview date | Interview emails |
| `{{interview.time}}` | Interview time | Interview emails |
| `{{placement.start_date}}` | Placement start | Placement emails |

### System Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{current_date}}` | Today's date | December 3, 2024 |
| `{{current_year}}` | Current year | 2024 |
| `{{current_time}}` | Current time | 2:45 PM EST |
| `{{sender_name}}` | Sending user's name | Admin User |
| `{{sender_email}}` | Sending user's email | admin@company.com |

---

## Alternative Flows

### Alternative A: Create Template from Scratch

1. Click "+ New Template"
2. Select category
3. Enter template name
4. Choose "Start from Blank" or "Use Template"
5. Build email content
6. Test and activate

### Alternative B: Duplicate Existing Template

1. Click "Duplicate" on existing template
2. System creates copy with "(Copy)" suffix
3. Modify as needed
4. Save with new name

### Alternative C: Import Template

1. Click "+ New Template"
2. Click "Import HTML"
3. Upload .html file or paste HTML
4. System parses and loads into editor
5. Add variables and customize
6. Save and activate

### Alternative D: Disable Template

1. Click "Disable" on active template
2. Confirm in modal
3. Template stops being available for triggers
4. Can be re-enabled later

### Alternative E: Version History

1. Click "..." menu on template
2. Select "Version History"
3. View all previous versions
4. Preview or restore any version

---

## Postconditions

1. Template is saved to database with status 'active' or 'draft'
2. Variables are validated and stored
3. Audit log entry created for template changes
4. Template available for workflow triggers and manual sends
5. Previous active version archived (if applicable)

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Missing Subject | Subject line empty | "Subject line is required" | Enter subject |
| Invalid Variable | Unknown variable used | "Unknown variable: {{xyz}}" | Remove or fix variable |
| Missing Unsubscribe | Marketing email without link | "Marketing emails require unsubscribe link" | Add {{unsubscribe_link}} |
| Invalid HTML | Malformed HTML syntax | "HTML syntax error at line X" | Fix HTML |
| Image Too Large | Image exceeds 5MB | "Image must be under 5MB" | Resize or compress |
| Duplicate Name | Template name exists | "Template name already exists" | Use unique name |
| Send Failed | SMTP error | "Failed to send: [error]" | Check email settings |
| Permission Denied | User lacks permissions | "Permission denied" | Contact admin |

---

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` | Open Command Bar | Any page |
| `g e` | Go to Email Templates | Any admin page |
| `n` | New Template | Templates list |
| `Cmd+S` | Save Template | Template editor |
| `Cmd+Shift+P` | Preview | Template editor |
| `Cmd+Shift+T` | Send Test | Template editor |
| `Cmd+B` | Bold | In editor |
| `Cmd+I` | Italic | In editor |
| `Cmd+U` | Underline | In editor |
| `Cmd+K` | Insert Link | In editor |
| `Escape` | Close Modal | Any modal |

---

## Test Cases

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| ADMIN-EMAIL-001 | Create new template | Admin logged in | Create template, add content, save | Template created in draft |
| ADMIN-EMAIL-002 | Activate template | Draft template exists | Click Activate | Status changes to active |
| ADMIN-EMAIL-003 | Variable substitution | Template with variables | Preview with sample data | Variables replaced correctly |
| ADMIN-EMAIL-004 | Send test email | Template configured | Enter email, send test | Email received with [TEST] prefix |
| ADMIN-EMAIL-005 | Invalid variable | - | Add {{invalid}} variable | Error shown, cannot save |
| ADMIN-EMAIL-006 | Marketing without unsubscribe | Category = marketing | Save without unsubscribe | Error: requires unsubscribe |
| ADMIN-EMAIL-007 | Duplicate template | Template exists | Click Duplicate | Copy created with "(Copy)" suffix |
| ADMIN-EMAIL-008 | HTML editor | - | Switch to HTML tab | Raw HTML shown with syntax highlighting |
| ADMIN-EMAIL-009 | Mobile preview | - | Click Mobile preview | Email renders in mobile viewport |
| ADMIN-EMAIL-010 | Version history | Multiple versions | View history | All versions listed chronologically |
| ADMIN-EMAIL-011 | Restore version | Old version exists | Click Restore | Old version becomes active |
| ADMIN-EMAIL-012 | Disable template | Active template | Click Disable | Template unavailable for triggers |
| ADMIN-EMAIL-013 | Import HTML | - | Upload HTML file | Template populated from file |
| ADMIN-EMAIL-014 | Image upload | - | Upload image to template | Image embedded in email |
| ADMIN-EMAIL-015 | Subject line emoji | - | Add emoji to subject | Emoji renders in preview and test |

---

## Database Schema Reference

```sql
-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'user', 'candidate', 'client', 'internal', 'system', 'marketing'
  )),
  subject TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT NOT NULL DEFAULT '{{company_name}}',
  from_email TEXT NOT NULL DEFAULT 'noreply@{{company_domain}}',
  reply_to TEXT,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables_used TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'disabled', 'archived'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  archived_at TIMESTAMPTZ,
  UNIQUE(org_id, slug, version)
);

-- Email template sends (for tracking)
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  )),
  variables_data JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sender addresses (verified)
CREATE TABLE email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- Indexes
CREATE INDEX idx_email_templates_org_category ON email_templates(org_id, category);
CREATE INDEX idx_email_templates_org_status ON email_templates(org_id, status);
CREATE INDEX idx_email_sends_template ON email_sends(template_id, status);
CREATE INDEX idx_email_sends_recipient ON email_sends(recipient_email, created_at);
```

---

## UI Component Reference (Mantine v7)

| Context | Component | Props |
|---------|-----------|-------|
| Template Card | `<Paper p="md" withBorder>` | shadow="xs", radius="md" |
| Status Badge | `<Badge>` | color="green" for active |
| Category Card | `<Card withBorder>` | p="lg" |
| Editor Toolbar | `<Group>` | gap="xs" |
| Variable Tag | `<Code>` | color="blue" |
| Preview Modal | `<Modal size="lg">` | centered |
| Test Email Modal | `<Modal size="md">` | centered |
| Save Button | `<Button variant="filled">` | color="brand" |
| Tab | `<Tabs>` | variant="outline" |
| Rich Text | `<RichTextEditor>` | @mantine/tiptap |

---

## Related Use Cases

- [UC-ADMIN-009](./09-workflow-configuration.md) - Workflow Configuration (templates used in workflows)
- [UC-ADMIN-003](./03-system-settings.md) - System Settings (email server configuration)
- [UC-ADMIN-007](./07-integration-management.md) - Integration Management (SendGrid, SMTP)
- [UC-ADMIN-008](./08-audit-logs.md) - Audit Logs (email send history)

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-03 | Initial documentation - full enterprise spec |

---

*Last Updated: 2025-12-03*
