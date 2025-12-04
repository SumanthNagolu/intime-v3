# User Story: System & Organization Settings

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-005
**Priority:** High
**Estimated Context:** ~40K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/03-system-settings.md`, `15-organization-settings.md`

---

## User Story

**As an** Admin user,
**I want** to configure system-wide settings and organization-specific settings,
**So that** I can customize the platform behavior, security policies, and branding for my organization.

---

## Acceptance Criteria

### AC-1: System Settings - General
- [ ] Configure default timezone
- [ ] Configure date/time format
- [ ] Configure currency
- [ ] Configure number format (decimal separator)

### AC-2: System Settings - Security
- [ ] Configure password policy (min length, complexity)
- [ ] Configure session timeout
- [ ] Configure failed login lockout threshold
- [ ] Enable/disable 2FA requirement
- [ ] Configure IP allowlist/blocklist

### AC-3: System Settings - Email
- [ ] Configure global from address
- [ ] Configure reply-to address
- [ ] Configure bounce handling
- [ ] Configure email footer

### AC-4: System Settings - Files
- [ ] Configure max file upload size
- [ ] Configure allowed file types
- [ ] Configure storage quota

### AC-5: System Settings - API
- [ ] Configure rate limits
- [ ] Configure API versioning
- [ ] Enable/disable API access

### AC-6: Organization Settings - General
- [ ] Update organization name
- [ ] Update organization logo
- [ ] Update contact information
- [ ] Configure timezone (if different from system)

### AC-7: Organization Settings - Branding
- [ ] Configure primary color
- [ ] Configure secondary color
- [ ] Upload logo (dark and light versions)
- [ ] Configure email footer
- [ ] Configure login page branding

### AC-8: Organization Settings - Localization
- [ ] Configure default language
- [ ] Configure date format
- [ ] Configure currency
- [ ] Configure number format

### AC-9: Organization Settings - Business Rules
- [ ] Configure approval thresholds
- [ ] Configure default values for entities
- [ ] Configure required fields
- [ ] Configure naming conventions (job IDs, etc.)

### AC-10: Organization Settings - Compliance
- [ ] Configure data retention period
- [ ] Enable GDPR features
- [ ] Configure audit log retention
- [ ] Configure data export settings

---

## UI/UX Requirements

### System Settings View
```
┌────────────────────────────────────────────────────────────────┐
│ System Settings                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [General] [Security] [Email] [Files] [API] [Maintenance]      │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ GENERAL                                                        │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Default Timezone                                           ││
│ │ [America/New_York (EST)                               ▼]   ││
│ │                                                            ││
│ │ Date Format                                                ││
│ │ ○ MM/DD/YYYY  ● DD/MM/YYYY  ○ YYYY-MM-DD                  ││
│ │                                                            ││
│ │ Time Format                                                ││
│ │ ● 12-hour (AM/PM)  ○ 24-hour                              ││
│ │                                                            ││
│ │ Default Currency                                           ││
│ │ [USD - US Dollar                                      ▼]   ││
│ │                                                            ││
│ │ Number Format                                              ││
│ │ Decimal: [.] Thousands: [,]                                ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Save Changes]                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Security Settings
```
┌────────────────────────────────────────────────────────────────┐
│ SECURITY                                                       │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ PASSWORD POLICY                                            ││
│ │ Minimum Length: [12] characters                            ││
│ │                                                            ││
│ │ Requirements:                                              ││
│ │ ☑ Uppercase letter (A-Z)                                  ││
│ │ ☑ Lowercase letter (a-z)                                  ││
│ │ ☑ Number (0-9)                                            ││
│ │ ☑ Special character (!@#$%^&*)                            ││
│ │                                                            ││
│ │ Password History: [5] (cannot reuse last N passwords)     ││
│ │ Password Expiry: [90] days (0 = never)                    ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ SESSION MANAGEMENT                                         ││
│ │ Session Timeout: [30] minutes of inactivity               ││
│ │ Max Concurrent Sessions: [3] per user                     ││
│ │                                                            ││
│ │ ☑ Remember Me enabled (extends session to 30 days)        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ LOGIN SECURITY                                             ││
│ │ Failed Login Lockout: [5] attempts                        ││
│ │ Lockout Duration: [15] minutes                            ││
│ │                                                            ││
│ │ Two-Factor Authentication:                                 ││
│ │ ○ Disabled  ○ Optional  ● Required for all users         ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Save Changes]                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Organization Settings View
```
┌────────────────────────────────────────────────────────────────┐
│ Organization Settings                                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ [General] [Branding] [Localization] [Business Rules]          │
│ [Compliance] [Billing]                                         │
│                                                                │
│ ═══════════════════════════════════════════════════════════   │
│                                                                │
│ GENERAL                                                        │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Organization Name                                          ││
│ │ [InTime Staffing Corp                                  ]   ││
│ │                                                            ││
│ │ Legal Name (if different)                                  ││
│ │ [InTime Staffing Corporation, Inc.                     ]   ││
│ │                                                            ││
│ │ Industry                                                   ││
│ │ [Staffing & Recruiting                                ▼]   ││
│ │                                                            ││
│ │ Company Size                                               ││
│ │ [51-200 employees                                     ▼]   ││
│ │                                                            ││
│ │ Website                                                    ││
│ │ [https://www.intimestaff.com                          ]    ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ CONTACT INFORMATION                                            │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Address                                                    ││
│ │ [123 Main Street, Suite 400                           ]    ││
│ │ [New York, NY 10001                                   ]    ││
│ │                                                            ││
│ │ Phone                                                      ││
│ │ [+1 (555) 123-4567                                    ]    ││
│ │                                                            ││
│ │ Support Email                                              ││
│ │ [support@intimestaff.com                              ]    ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Save Changes]                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Branding Settings
```
┌────────────────────────────────────────────────────────────────┐
│ BRANDING                                                       │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ LOGO                                                       ││
│ │ ┌─────────────────┐  ┌─────────────────┐                  ││
│ │ │                 │  │                 │                  ││
│ │ │   [LOGO]        │  │   [LOGO]        │                  ││
│ │ │   Light Mode    │  │   Dark Mode     │                  ││
│ │ │                 │  │                 │                  ││
│ │ └─────────────────┘  └─────────────────┘                  ││
│ │ [Upload Light Logo] [Upload Dark Logo]                    ││
│ │ Recommended: PNG/SVG, min 200x50px                        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ COLORS                                                     ││
│ │ Primary Color:   [#0D4C3B] [████]                         ││
│ │ Secondary Color: [#C5A572] [████]                         ││
│ │ Accent Color:    [#1A1A1A] [████]                         ││
│ │                                                            ││
│ │ [Reset to Defaults]                                        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ LOGIN PAGE                                                 ││
│ │ ☑ Show company logo                                       ││
│ │ ☑ Show company name                                       ││
│ │ ☐ Custom background image [Upload]                        ││
│ │                                                            ││
│ │ Welcome Message:                                           ││
│ │ [Welcome to InTime Staffing                           ]    ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ PREVIEW                                                        │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ [Live preview of login page with branding]                ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ [Save Changes]                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- System settings (global)
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category VARCHAR(50) NOT NULL, -- general, security, email, files, api
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Organization settings
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50) NOT NULL, -- general, branding, localization, business, compliance
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id),
  UNIQUE(organization_id, key)
);

-- Organization branding assets
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  asset_type VARCHAR(50) NOT NULL, -- logo_light, logo_dark, favicon, background
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_org_settings_org ON organization_settings(organization_id);
CREATE INDEX idx_org_settings_category ON organization_settings(category);
CREATE INDEX idx_org_branding_org ON organization_branding(organization_id);
```

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/settings.ts
export const settingsRouter = router({
  // System Settings
  getSystemSettings: adminProtectedProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // Return system settings
    }),

  updateSystemSetting: adminProtectedProcedure
    .input(z.object({
      key: z.string(),
      value: z.any(),
      category: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update setting
      // Create audit log
    }),

  // Organization Settings
  getOrgSettings: orgProtectedProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // Return org settings
    }),

  updateOrgSetting: orgProtectedProcedure
    .input(z.object({
      key: z.string(),
      value: z.any(),
      category: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update setting
      // Create audit log
    }),

  // Branding
  uploadBrandingAsset: orgProtectedProcedure
    .input(z.object({
      assetType: z.enum(['logo_light', 'logo_dark', 'favicon', 'background']),
      fileBase64: z.string(),
      mimeType: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Upload to storage
      // Create/update branding record
    }),

  deleteBrandingAsset: orgProtectedProcedure
    .input(z.object({
      assetType: z.enum(['logo_light', 'logo_dark', 'favicon', 'background'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Delete asset
    }),

  // Preview
  getLoginPreview: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return preview data
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-SYS-001 | View system settings | Shows all settings organized by category |
| ADMIN-SYS-002 | Update timezone | Timezone updated, affects all date displays |
| ADMIN-SYS-003 | Update password policy | New policy applies to future passwords |
| ADMIN-SYS-004 | Enable 2FA requirement | All users prompted to set up 2FA |
| ADMIN-SYS-005 | Update session timeout | Sessions expire after new timeout |
| ADMIN-SYS-006 | Update file size limit | New limit enforced on uploads |
| ADMIN-ORG-001 | Update org name | Name updated across system |
| ADMIN-ORG-002 | Upload logo | Logo displays in header and emails |
| ADMIN-ORG-003 | Change brand colors | Colors applied to UI elements |
| ADMIN-ORG-004 | Update currency | Currency displays in new format |
| ADMIN-ORG-005 | Enable GDPR features | Data subject request features enabled |
| ADMIN-ORG-006 | Update data retention | Retention policy applied |
| ADMIN-ORG-007 | Preview login page | Shows login with branding |
| ADMIN-ORG-008 | Invalid color code | Error: "Invalid color format" |
| ADMIN-ORG-009 | Logo too small | Error: "Logo must be at least 200x50px" |
| ADMIN-ORG-010 | Non-admin access | Returns 403 Forbidden |

---

## Field Specifications

### Password Minimum Length
| Property | Value |
|----------|-------|
| Field Name | `passwordMinLength` |
| Type | NumberInput |
| Required | Yes |
| Min | 8 |
| Max | 128 |
| Default | 12 |
| Error Messages | |
| - Below Min | "Minimum password length must be at least 8" |
| - Above Max | "Minimum password length cannot exceed 128" |

### Session Timeout
| Property | Value |
|----------|-------|
| Field Name | `sessionTimeout` |
| Type | NumberInput |
| Required | Yes |
| Min | 5 |
| Max | 480 |
| Default | 30 |
| Unit | minutes |
| Error Messages | |
| - Below Min | "Session timeout must be at least 5 minutes" |
| - Above Max | "Session timeout cannot exceed 8 hours" |

### Primary Color
| Property | Value |
|----------|-------|
| Field Name | `primaryColor` |
| Type | ColorInput |
| Required | Yes |
| Default | #0D4C3B |
| Validation | Valid hex color code |
| Error Messages | |
| - Invalid | "Please enter a valid hex color code" |

### Organization Name
| Property | Value |
|----------|-------|
| Field Name | `orgName` |
| Type | TextInput |
| Required | Yes |
| Min Length | 2 |
| Max Length | 200 |
| Error Messages | |
| - Empty | "Organization name is required" |
| - Too Short | "Organization name must be at least 2 characters" |

---

## Dependencies

- File storage system (S3) for branding assets
- Authentication system for security settings
- Audit Logging (UC-ADMIN-008)

---

## Out of Scope

- White-label/custom domain configuration
- Multi-language content management
- Custom CSS injection
- Billing/subscription management (separate module)
