# System & Organization Settings Implementation Plan

## Overview

Implement a comprehensive settings management system for the Admin portal, covering both system-wide configuration and organization-specific settings. This includes general settings, security policies, email configuration, file storage limits, API settings, branding, localization, business rules, and compliance settings.

**Epic**: Admin Portal (Epic-01)
**Story ID**: ADMIN-US-005
**Source Spec**: `docs/specs/20-USER-ROLES/10-admin/03-system-settings.md`, `15-organization-settings.md`
**Research**: `thoughts/shared/research/2025-12-05-system-organization-settings-codebase-research.md`

## Current State Analysis

### What Exists
- Navigation link to `/employee/admin/settings` (but no page)
- `organizations` table with JSONB `settings` and `features` columns
- Dedicated columns: `timezone`, `locale`, `logo_url`, `favicon_url`, `metadata`, `industry`
- Feature flags system providing a pattern for settings-style UI
- tRPC router patterns established in `pods.ts`, `users.ts`, `permissions.ts`
- UI components: Input, Select, Switch, Dialog, DashboardShell

### What's Missing
- Settings pages and routes
- Settings tRPC router
- Dedicated settings tables (for proper auditing and querying)
- File Upload component
- Color Picker component
- Organization branding assets table

### Key Discoveries
- `src/lib/navigation/adminNavConfig.ts:57-60` - Settings nav item exists
- `src/server/routers/permissions.ts:494-570` - Feature flags pattern to follow
- `src/components/admin/pods/PodFormPage.tsx` - Form pattern with useState
- No React Hook Form - forms use controlled state
- Supabase client used directly (not Drizzle ORM)

## Desired End State

After implementation:
1. Admins can access `/employee/admin/settings` with tabbed navigation
2. System settings configure platform-wide defaults (timezone, security, email, files, API)
3. Organization settings customize per-org behavior (general, branding, localization, business rules, compliance)
4. All settings changes are audited
5. Branding changes reflect immediately in UI (logo, colors)
6. File uploads stored in Supabase Storage bucket `org-assets`

### Verification
- All 10 acceptance criteria from epic pass
- Settings persist across sessions
- Audit logs capture all changes
- Logo uploads display in navigation header
- Color changes apply to themed elements

## What We're NOT Doing

- White-label/custom domain configuration
- Multi-language content management (UI translations)
- Custom CSS injection
- Billing/subscription management (separate module)
- Email template editing (separate feature)
- Workflow configuration (separate feature)

---

## Implementation Approach

**Architecture Decision**: Use normalized tables for settings storage instead of JSONB columns.

**Rationale**:
- Proper audit trail per setting change
- Type-safe validation per setting key
- Easier querying and indexing
- Better support for setting metadata (descriptions, defaults, constraints)
- Backward compatible - existing JSONB columns remain for future extensions

**Storage Strategy**:
- `system_settings` - Global platform settings (key-value with category)
- `organization_settings` - Per-org settings (key-value with category)
- `organization_branding` - Branding assets (files in Supabase Storage)

---

## Phase 1: Database Schema & Migrations

### Overview
Create the database tables for settings storage and branding assets, plus Supabase Storage bucket for organization assets.

### Changes Required

#### 1. Migration File
**File**: `supabase/migrations/20251207000000_settings_tables.sql`

```sql
-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- Global platform-wide configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL,
  data_type VARCHAR(20) NOT NULL DEFAULT 'string',
  description TEXT,
  default_value JSONB,
  constraints JSONB,
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Categories: general, security, email, files, api
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORGANIZATION SETTINGS TABLE
-- Per-organization configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id),
  UNIQUE(org_id, key)
);

-- Categories: general, branding, localization, business, compliance
CREATE INDEX idx_org_settings_org ON organization_settings(org_id);
CREATE INDEX idx_org_settings_category ON organization_settings(org_id, category);

-- RLS Policy
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org settings"
  ON organization_settings FOR SELECT
  USING (org_id = auth_user_org_id());

CREATE POLICY "Users can update their org settings"
  ON organization_settings FOR ALL
  USING (org_id = auth_user_org_id());

-- Trigger for updated_at
CREATE TRIGGER update_org_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORGANIZATION BRANDING TABLE
-- Branding assets metadata (files stored in Supabase Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES user_profiles(id),
  UNIQUE(org_id, asset_type)
);

-- Asset types: logo_light, logo_dark, favicon, login_background
CREATE INDEX idx_org_branding_org ON organization_branding(org_id);

-- RLS Policy
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org branding"
  ON organization_branding FOR SELECT
  USING (org_id = auth_user_org_id());

CREATE POLICY "Users can manage their org branding"
  ON organization_branding FOR ALL
  USING (org_id = auth_user_org_id());

-- ============================================================================
-- SEED SYSTEM SETTINGS DEFAULTS
-- ============================================================================

-- General Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('default_timezone', '"America/New_York"', 'general', 'string', 'Default timezone for new organizations', '"America/New_York"', '{"type": "timezone"}'),
  ('default_date_format', '"MM/DD/YYYY"', 'general', 'string', 'Default date format', '"MM/DD/YYYY"', '{"options": ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}'),
  ('default_time_format', '"12h"', 'general', 'string', 'Default time format (12h or 24h)', '"12h"', '{"options": ["12h", "24h"]}'),
  ('default_currency', '"USD"', 'general', 'string', 'Default currency code', '"USD"', '{"type": "currency"}'),
  ('decimal_separator', '"."', 'general', 'string', 'Decimal separator for numbers', '"."', '{"options": [".", ","]}'),
  ('thousands_separator', '","', 'general', 'string', 'Thousands separator for numbers', '","', '{"options": [",", ".", " "]}');

-- Security Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints, is_sensitive) VALUES
  ('password_min_length', '12', 'security', 'number', 'Minimum password length', '12', '{"min": 8, "max": 128}', false),
  ('password_require_uppercase', 'true', 'security', 'boolean', 'Require uppercase letter in password', 'true', null, false),
  ('password_require_lowercase', 'true', 'security', 'boolean', 'Require lowercase letter in password', 'true', null, false),
  ('password_require_number', 'true', 'security', 'boolean', 'Require number in password', 'true', null, false),
  ('password_require_special', 'true', 'security', 'boolean', 'Require special character in password', 'true', null, false),
  ('password_history_count', '5', 'security', 'number', 'Number of previous passwords to remember', '5', '{"min": 0, "max": 24}', false),
  ('password_expiry_days', '90', 'security', 'number', 'Days until password expires (0 = never)', '90', '{"min": 0, "max": 365}', false),
  ('session_timeout_minutes', '30', 'security', 'number', 'Session timeout in minutes', '30', '{"min": 5, "max": 480}', false),
  ('max_concurrent_sessions', '3', 'security', 'number', 'Maximum concurrent sessions per user', '3', '{"min": 1, "max": 10}', false),
  ('remember_me_enabled', 'true', 'security', 'boolean', 'Allow "Remember Me" option', 'true', null, false),
  ('failed_login_lockout', '5', 'security', 'number', 'Failed login attempts before lockout', '5', '{"min": 3, "max": 10}', false),
  ('lockout_duration_minutes', '15', 'security', 'number', 'Account lockout duration in minutes', '15', '{"min": 5, "max": 60}', false),
  ('two_factor_requirement', '"optional"', 'security', 'string', '2FA requirement level', '"optional"', '{"options": ["disabled", "optional", "required"]}', false),
  ('ip_allowlist_enabled', 'false', 'security', 'boolean', 'Enable IP allowlist', 'false', null, true),
  ('ip_allowlist', '[]', 'security', 'array', 'Allowed IP addresses/ranges', '[]', '{"type": "ip_list"}', true);

-- Email Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('email_from_address', '"noreply@intime.io"', 'email', 'string', 'Default from email address', '"noreply@intime.io"', '{"type": "email"}'),
  ('email_from_name', '"InTime Platform"', 'email', 'string', 'Default from name', '"InTime Platform"', null),
  ('email_reply_to', '"support@intime.io"', 'email', 'string', 'Reply-to email address', '"support@intime.io"', '{"type": "email"}'),
  ('email_footer_text', '"2024 InTime. All rights reserved."', 'email', 'string', 'Default email footer', '"2024 InTime. All rights reserved."', null),
  ('bounce_handling_enabled', 'true', 'email', 'boolean', 'Enable bounce handling', 'true', null);

-- File Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('max_file_size_mb', '25', 'files', 'number', 'Maximum file upload size in MB', '25', '{"min": 1, "max": 100}'),
  ('allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "gif"]', 'files', 'array', 'Allowed file extensions', '["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "gif"]', null),
  ('storage_quota_gb', '100', 'files', 'number', 'Storage quota per organization in GB', '100', '{"min": 10, "max": 1000}');

-- API Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('api_enabled', 'true', 'api', 'boolean', 'Enable API access', 'true', null),
  ('api_rate_limit_requests', '1000', 'api', 'number', 'API rate limit (requests per hour)', '1000', '{"min": 100, "max": 10000}'),
  ('api_rate_limit_window_minutes', '60', 'api', 'number', 'Rate limit window in minutes', '60', '{"options": [15, 30, 60]}'),
  ('api_version', '"v1"', 'api', 'string', 'Current API version', '"v1"', null);
```

### Success Criteria

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] Tables exist: `system_settings`, `organization_settings`, `organization_branding`
- [ ] Indexes created on category and org_id columns
- [ ] RLS policies active on organization tables
- [ ] System settings seeded with defaults

#### Manual Verification:
- [ ] Query `system_settings` returns all seeded defaults
- [ ] Create test org setting and verify RLS prevents cross-org access
- [ ] Create Supabase Storage bucket `org-assets` via dashboard

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation that the Supabase Storage bucket was created before proceeding to Phase 2.

---

## Phase 2: Settings tRPC Router

### Overview
Create the tRPC router with all CRUD procedures for system settings, organization settings, and branding asset management.

### Changes Required

#### 1. Settings Router
**File**: `src/server/routers/settings.ts`

Create a new router with the following procedures:
- `getSystemSettings` - Query system settings by category
- `updateSystemSetting` - Update a single system setting
- `bulkUpdateSystemSettings` - Update multiple system settings
- `getOrgSettings` - Query organization settings by category
- `updateOrgSetting` - Update/upsert a single org setting
- `bulkUpdateOrgSettings` - Update multiple org settings
- `updateOrganization` - Update organization base fields (name, contact, etc.)
- `getBranding` - Get branding assets with signed URLs
- `uploadBrandingAsset` - Upload logo/image to Supabase Storage
- `deleteBrandingAsset` - Delete branding asset
- `getLoginPreview` - Get preview data for login page customization

#### 2. Register Router
**File**: `src/server/trpc/root.ts`
Add settings router import and registration.

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] Router exports correctly
- [ ] tRPC types generate correctly

#### Manual Verification:
- [ ] Test `getSystemSettings` returns seeded defaults
- [ ] Test `updateSystemSetting` persists and creates audit log
- [ ] Test `getOrgSettings` returns empty initially
- [ ] Test `updateOrgSetting` upserts correctly
- [ ] Test file upload flow in isolation (via API)

---

## Phase 3: UI Components - File Upload & Color Picker

### Overview
Create reusable UI components needed for the settings forms.

### Changes Required

#### 1. File Upload Component
**File**: `src/components/ui/file-upload.tsx`

Features:
- Drag and drop support
- Image preview
- File size validation
- Base64 encoding for API upload
- Remove/clear functionality

#### 2. Color Picker Component
**File**: `src/components/ui/color-picker.tsx`

Features:
- Preset color palette
- Hex input with validation
- Native color picker integration
- Visual color preview

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] No ESLint errors: `pnpm lint`

#### Manual Verification:
- [ ] FileUpload renders and accepts drag/drop
- [ ] FileUpload shows image preview
- [ ] ColorPicker opens with preset colors
- [ ] ColorPicker accepts manual hex input

---

## Phase 4: Settings Hub & Navigation

### Overview
Create the settings hub page with tabbed navigation structure.

### Changes Required

#### 1. Settings Routes
- `src/app/employee/admin/settings/page.tsx` - Redirect to organization settings
- `src/app/employee/admin/settings/layout.tsx` - Settings sidebar layout

#### 2. Navigation Structure
Settings sidebar with two sections:
- **Organization**: General, Branding, Localization, Business Rules, Compliance
- **System**: General, Security, Email, Files & Storage, API

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors
- [ ] Routes accessible

#### Manual Verification:
- [ ] Navigate to `/employee/admin/settings` redirects correctly
- [ ] Settings sidebar shows all 10 navigation items
- [ ] Active tab highlights correctly

---

## Phase 5: Organization Settings - General

### Overview
Implement the Organization General settings form.

### Changes Required
- `src/app/employee/admin/settings/organization/page.tsx`
- `src/components/admin/settings/OrganizationSettingsPage.tsx`

Features:
- Organization name, legal name
- Industry, company size
- Website, contact email, phone
- Address fields

### Success Criteria

#### Manual Verification:
- [ ] Form loads with existing data
- [ ] Can update and save all fields
- [ ] Audit log created

---

## Phase 6: Organization Settings - Branding

### Overview
Implement Branding settings with logo uploads, colors, and login preview.

### Changes Required
- `src/app/employee/admin/settings/branding/page.tsx`
- `src/components/admin/settings/BrandingSettingsPage.tsx`

Features:
- Light/dark mode logo upload
- Color pickers for primary/secondary/accent
- Login page customization (toggle logo, company name, welcome message)
- Background image upload
- Live preview panel

### Success Criteria

#### Manual Verification:
- [ ] Can upload logos
- [ ] Color picker works
- [ ] Login preview updates in real-time
- [ ] Files upload to Supabase Storage

---

## Phase 7: Organization Settings - Localization

### Overview
Implement Localization settings.

### Changes Required
- `src/app/employee/admin/settings/localization/page.tsx`
- `src/components/admin/settings/LocalizationSettingsPage.tsx`

Features:
- Timezone selection
- Date/time format
- Currency selection
- Number format (decimal/thousands separators)
- Live preview of formatted values

---

## Phase 8: Organization Settings - Business Rules & Compliance

### Overview
Implement Business Rules and Compliance settings.

### Changes Required
- Business Rules page: approval thresholds, defaults, naming conventions
- Compliance page: data retention, GDPR toggle, audit log settings

---

## Phase 9: System Settings - General & Security

### Overview
Implement System-wide General and Security settings.

### Changes Required
- System General: default timezone, date format, currency
- Security: password policy, session management, 2FA, IP allowlist

---

## Phase 10: System Settings - Email, Files & API

### Overview
Implement remaining system settings.

### Changes Required
- Email: from address, reply-to, bounce handling, footer
- Files: max size, allowed types, storage quota
- API: enabled toggle, rate limits, version

---

## Testing Strategy

### Unit Tests
- Settings router procedures
- Input validation
- File upload validation

### Integration Tests
- Full settings CRUD flow
- File upload to Supabase Storage
- Audit log creation

### Manual Testing Steps
1. Create new organization and verify defaults
2. Update each setting category
3. Upload logo and verify display
4. Test with different user roles
5. Verify audit logs

---

## References

- Epic: `thoughts/shared/epics/epic-01-admin/05-system-organization-settings.md`
- Research: `thoughts/shared/research/2025-12-05-system-organization-settings-codebase-research.md`
- Specs: `docs/specs/20-USER-ROLES/10-admin/03-system-settings.md`, `15-organization-settings.md`
