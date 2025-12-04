# User Story: Email Templates

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-010
**Priority:** Medium
**Estimated Context:** ~30K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/10-email-templates.md`

---

## User Story

**As an** Admin user,
**I want** to create and manage email templates with variable substitution,
**So that** I can customize system communications while maintaining consistency.

---

## Acceptance Criteria

### AC-1: Template List
- [ ] Display all templates by category
- [ ] Filter by category, status
- [ ] Search by template name
- [ ] Show last modified date
- [ ] Preview template

### AC-2: Template Editor
- [ ] Rich text editor (Visual mode)
- [ ] HTML editor (Code mode)
- [ ] Plain text editor
- [ ] Toggle between modes
- [ ] Auto-save drafts

### AC-3: Variables
- [ ] Insert variables from reference
- [ ] Variable autocomplete
- [ ] Preview with sample data
- [ ] Validate all variables are defined

### AC-4: Preview & Test
- [ ] Preview in desktop/mobile/dark mode
- [ ] Send test email to address
- [ ] Test with real or sample data

### AC-5: Versioning
- [ ] Save new versions
- [ ] View version history
- [ ] Revert to previous version
- [ ] Archive old templates

### AC-6: Sender Configuration
- [ ] Configure from address per template
- [ ] Configure reply-to address
- [ ] Configure sender name

### AC-7: Marketing Compliance
- [ ] Require unsubscribe link for marketing
- [ ] Track unsubscribes
- [ ] Respect email preferences

---

## UI/UX Requirements

### Template List
```
┌────────────────────────────────────────────────────────────────┐
│ Email Templates                                [+ New Template] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [Category: All ▼] [Status: Active ▼] [🔍 Search...]           │
│                                                                │
│ USER TEMPLATES                                                 │
│ ┌────────────────────────┬────────────┬────────────┬─────────┐│
│ │ Template               │ Subject    │ Modified   │ Status  ││
│ ├────────────────────────┼────────────┼────────────┼─────────┤│
│ │ Welcome Email          │ Welcome to │ Dec 1      │ Active  ││
│ │ Password Reset         │ Reset Your │ Nov 15     │ Active  ││
│ │ Account Activated      │ Your accou │ Oct 20     │ Active  ││
│ └────────────────────────┴────────────┴────────────┴─────────┘│
│                                                                │
│ CANDIDATE TEMPLATES                                            │
│ ┌────────────────────────┬────────────┬────────────┬─────────┐│
│ │ Interview Invitation   │ Interview  │ Nov 28     │ Active  ││
│ │ Interview Reminder     │ Reminder:  │ Nov 28     │ Active  ││
│ │ Offer Letter           │ Congratula │ Nov 20     │ Active  ││
│ │ Rejection              │ Update on  │ Nov 15     │ Active  ││
│ └────────────────────────┴────────────┴────────────┴─────────┘│
│                                                                │
│ CLIENT TEMPLATES                                               │
│ [...]                                                          │
└────────────────────────────────────────────────────────────────┘
```

### Template Editor
```
┌────────────────────────────────────────────────────────────────┐
│ Edit Template - Interview Invitation                      [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ TEMPLATE INFO                                                  │
│ Name:     [Interview Invitation                          ]    │
│ Category: [Candidate                                     ▼]   │
│ Slug:     interview-invitation (auto-generated)               │
│                                                                │
│ SUBJECT LINE                                                   │
│ [Interview Invitation: {{job.title}} at {{company.name}}  ]   │
│                                                                │
│ FROM / REPLY-TO                                                │
│ From: [Recruiting Team                                   ]    │
│ Email:[recruiting@{{company.domain}}                     ]    │
│ Reply:[{{recruiter.email}}                               ]    │
│                                                                │
│ BODY                                              [Visual][HTML]│
│ ┌────────────────────────────────────────────────────────────┐│
│ │ [B] [I] [U] [Link] [Image] [Variable ▼] [Unsubscribe]     ││
│ ├────────────────────────────────────────────────────────────┤│
│ │                                                            ││
│ │ Dear {{candidate.first_name}},                             ││
│ │                                                            ││
│ │ We are pleased to invite you to an interview for the       ││
│ │ {{job.title}} position at {{company.name}}.                ││
│ │                                                            ││
│ │ Interview Details:                                         ││
│ │ • Date: {{interview.date}}                                ││
│ │ • Time: {{interview.time}} {{company.timezone}}           ││
│ │ • Location: {{interview.location}}                         ││
│ │ • Interviewer: {{interviewer.name}}                        ││
│ │                                                            ││
│ │ Please confirm your attendance by clicking the link below: ││
│ │ {{interview.confirm_link}}                                 ││
│ │                                                            ││
│ │ Best regards,                                              ││
│ │ {{recruiter.name}}                                         ││
│ │ {{company.name}}                                           ││
│ │                                                            ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ VARIABLE REFERENCE                                    [Expand] │
│ {{candidate.first_name}}, {{candidate.last_name}},            │
│ {{job.title}}, {{company.name}}, {{interview.date}}...        │
│                                                                │
│ [Cancel]        [Preview] [Send Test] [Save Draft] [Activate] │
└────────────────────────────────────────────────────────────────┘
```

### Preview Modal
```
┌────────────────────────────────────────────────────────────────┐
│ Template Preview                                          [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ PREVIEW MODE                                                   │
│ [Desktop] [Mobile] [Dark Mode]                                │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ From: Recruiting Team <recruiting@intime.com>             ││
│ │ To: john.doe@email.com                                    ││
│ │ Subject: Interview Invitation: Senior Java Developer at   ││
│ │          InTime Staffing                                   ││
│ │                                                            ││
│ │ ───────────────────────────────────────────────────────── ││
│ │                                                            ││
│ │ Dear John,                                                 ││
│ │                                                            ││
│ │ We are pleased to invite you to an interview for the      ││
│ │ Senior Java Developer position at InTime Staffing.        ││
│ │                                                            ││
│ │ Interview Details:                                         ││
│ │ • Date: December 10, 2024                                 ││
│ │ • Time: 2:00 PM EST                                       ││
│ │ • Location: Video Call (Zoom)                             ││
│ │ • Interviewer: Sarah Patel                                ││
│ │                                                            ││
│ │ Please confirm your attendance by clicking the link below:││
│ │ [Confirm Attendance]                                       ││
│ │                                                            ││
│ │ Best regards,                                              ││
│ │ Mike Johnson                                               ││
│ │ InTime Staffing                                            ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ SEND TEST                                                      │
│ To: [admin@company.com                                    ]   │
│ [Send Test Email]                                              │
│                                                                │
│ [Close]                                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL, -- URL-safe identifier
  category VARCHAR(50) NOT NULL, -- user, candidate, client, internal, system, marketing
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT, -- Plain text version
  from_name VARCHAR(100),
  from_email VARCHAR(255),
  reply_to VARCHAR(255),
  variables_used TEXT[], -- List of variables in template
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, archived
  version INTEGER DEFAULT 1,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  UNIQUE(organization_id, slug, version)
);

-- Email template versions (for history)
CREATE TABLE email_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email sends (tracking)
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  template_id UUID REFERENCES email_templates(id),
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'queued', -- queued, sent, delivered, bounced, failed
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounce_reason TEXT,
  provider_id VARCHAR(255), -- External provider message ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email senders (verified addresses)
CREATE TABLE email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Indexes
CREATE INDEX idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_slug ON email_templates(slug);
CREATE INDEX idx_email_sends_org ON email_sends(organization_id);
CREATE INDEX idx_email_sends_template ON email_sends(template_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
```

---

## Variable Categories

### User Variables
| Variable | Description |
|----------|-------------|
| `{{user.first_name}}` | User's first name |
| `{{user.last_name}}` | User's last name |
| `{{user.email}}` | User's email address |
| `{{user.full_name}}` | First + Last name |

### Candidate Variables
| Variable | Description |
|----------|-------------|
| `{{candidate.first_name}}` | Candidate's first name |
| `{{candidate.last_name}}` | Candidate's last name |
| `{{candidate.email}}` | Candidate's email |
| `{{candidate.phone}}` | Candidate's phone |

### Job Variables
| Variable | Description |
|----------|-------------|
| `{{job.title}}` | Job title |
| `{{job.id}}` | Job ID |
| `{{job.location}}` | Job location |
| `{{job.salary_range}}` | Salary range |

### Interview Variables
| Variable | Description |
|----------|-------------|
| `{{interview.date}}` | Interview date |
| `{{interview.time}}` | Interview time |
| `{{interview.location}}` | Interview location |
| `{{interview.confirm_link}}` | Confirmation link |

### Company Variables
| Variable | Description |
|----------|-------------|
| `{{company.name}}` | Company name |
| `{{company.logo_url}}` | Company logo URL |
| `{{company.website}}` | Company website |
| `{{company.timezone}}` | Company timezone |

### System Variables
| Variable | Description |
|----------|-------------|
| `{{current_date}}` | Current date |
| `{{current_year}}` | Current year |
| `{{unsubscribe_link}}` | Unsubscribe link |
| `{{password_reset_link}}` | Password reset link |

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/email-templates.ts
export const emailTemplatesRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      category: z.string().optional(),
      status: z.enum(['draft', 'active', 'archived']).optional(),
      search: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Return templates by category
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return template with details
    }),

  create: orgProtectedProcedure
    .input(z.object({
      name: z.string(),
      category: z.string(),
      subject: z.string(),
      bodyHtml: z.string(),
      bodyText: z.string().optional(),
      fromName: z.string().optional(),
      fromEmail: z.string().email().optional(),
      replyTo: z.string().email().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Create template
    }),

  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      subject: z.string().optional(),
      bodyHtml: z.string().optional(),
      bodyText: z.string().optional(),
      fromName: z.string().optional(),
      fromEmail: z.string().email().optional(),
      replyTo: z.string().email().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update template, create version
    }),

  activate: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Validate and activate template
    }),

  archive: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Archive template
    }),

  preview: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      sampleData: z.record(z.any()).optional()
    }))
    .query(async ({ ctx, input }) => {
      // Return rendered preview
    }),

  sendTest: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      toEmail: z.string().email(),
      sampleData: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Send test email
    }),

  getVersionHistory: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return version history
    }),

  revertToVersion: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      version: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      // Revert to previous version
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-EMAIL-001 | View template list | Shows templates by category |
| ADMIN-EMAIL-002 | Create template | Template created in draft |
| ADMIN-EMAIL-003 | Edit template | Template updated, version created |
| ADMIN-EMAIL-004 | Insert variable | Variable inserted correctly |
| ADMIN-EMAIL-005 | Preview template | Shows rendered with sample data |
| ADMIN-EMAIL-006 | Preview mobile | Shows mobile-optimized view |
| ADMIN-EMAIL-007 | Send test email | Test email received |
| ADMIN-EMAIL-008 | Activate template | Status = active |
| ADMIN-EMAIL-009 | Archive template | Status = archived |
| ADMIN-EMAIL-010 | View version history | Shows all versions |
| ADMIN-EMAIL-011 | Revert to version | Content restored |
| ADMIN-EMAIL-012 | Marketing without unsub | Error: "Unsubscribe required" |
| ADMIN-EMAIL-013 | Invalid variable | Warning shown |
| ADMIN-EMAIL-014 | Duplicate slug | Error: "Template exists" |
| ADMIN-EMAIL-015 | Non-admin access | Returns 403 Forbidden |

---

## Dependencies

- Email integration (SMTP)
- Rich text editor component
- File storage for images
- Audit Logging (UC-ADMIN-008)

---

## Out of Scope

- Drag-and-drop email builder
- A/B testing
- Email analytics dashboard
- Multi-language templates
