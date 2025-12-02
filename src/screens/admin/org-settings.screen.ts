/**
 * Organization Settings Screen Definition
 *
 * Configure organization profile, branding, and localization.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (AZ)' },
  { value: 'UTC', label: 'UTC' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
];

const FISCAL_MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const INDUSTRY_OPTIONS = [
  { value: 'staffing', label: 'Staffing & Recruiting' },
  { value: 'it_consulting', label: 'IT Consulting' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const orgSettingsScreen: ScreenDefinition = {
  id: 'org-settings',
  type: 'detail',
  // entityType: 'organization', // Admin entity

  title: 'Organization Settings',
  subtitle: 'Company profile and preferences',
  icon: 'Building2',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.settings.getOrganization',
      params: {},
    },
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Company Information
      {
        id: 'company-info',
        type: 'form',
        title: 'Company Information',
        description: 'Basic organization details',
        icon: 'Building2',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'name',
            label: 'Company Name',
            type: 'text',
            path: 'name',
            config: { required: true, maxLength: 100 },
          },
          {
            id: 'legalName',
            label: 'Legal Name',
            type: 'text',
            path: 'legalName',
            config: { helpText: 'Full legal entity name for contracts' },
          },
          {
            id: 'industry',
            label: 'Industry',
            type: 'select',
            path: 'industry',
            options: [...INDUSTRY_OPTIONS],
          },
          {
            id: 'website',
            label: 'Website',
            type: 'url',
            path: 'website',
            config: { placeholder: 'https://company.com' },
          },
          {
            id: 'phone',
            label: 'Main Phone',
            type: 'phone',
            path: 'phone',
          },
          {
            id: 'email',
            label: 'Main Email',
            type: 'email',
            path: 'email',
          },
        ],
        actions: [
          {
            id: 'save-company',
            type: 'mutation',
            label: 'Save Changes',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateOrganization' },
          },
        ],
      },
      // Address
      {
        id: 'address',
        type: 'form',
        title: 'Company Address',
        icon: 'MapPin',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'addressLine1',
            label: 'Address Line 1',
            type: 'text',
            path: 'address.line1',
          },
          {
            id: 'addressLine2',
            label: 'Address Line 2',
            type: 'text',
            path: 'address.line2',
          },
          {
            id: 'city',
            label: 'City',
            type: 'text',
            path: 'address.city',
          },
          {
            id: 'state',
            label: 'State/Province',
            type: 'text',
            path: 'address.state',
          },
          {
            id: 'postalCode',
            label: 'Postal Code',
            type: 'text',
            path: 'address.postalCode',
          },
          {
            id: 'country',
            label: 'Country',
            type: 'text',
            path: 'address.country',
            config: { defaultValue: 'United States' },
          },
        ],
        actions: [
          {
            id: 'save-address',
            type: 'mutation',
            label: 'Save Address',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateAddress' },
          },
        ],
      },
      // Branding
      {
        id: 'branding',
        type: 'form',
        title: 'Branding',
        description: 'Customize your organization\'s appearance',
        icon: 'Palette',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'logo',
            label: 'Logo',
            type: 'file',
            path: 'branding.logoUrl',
            config: {
              accept: 'image/*',
              maxSize: '2MB',
              helpText: 'Recommended: 200x50px PNG with transparent background',
            },
          },
          {
            id: 'favicon',
            label: 'Favicon',
            type: 'file',
            path: 'branding.faviconUrl',
            config: {
              accept: 'image/x-icon,image/png',
              maxSize: '100KB',
              helpText: '32x32px favicon',
            },
          },
          {
            id: 'primaryColor',
            label: 'Primary Color',
            type: 'text',
            path: 'branding.primaryColor',
            config: { defaultValue: '#3B82F6' },
          },
          {
            id: 'accentColor',
            label: 'Accent Color',
            type: 'text',
            path: 'branding.accentColor',
            config: { defaultValue: '#10B981' },
          },
        ],
        actions: [
          {
            id: 'save-branding',
            type: 'mutation',
            label: 'Save Branding',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateBranding' },
          },
          {
            id: 'preview',
            type: 'modal',
            label: 'Preview',
            variant: 'outline',
            icon: 'Eye',
            config: { type: 'modal', modal: 'BrandingPreviewModal' },
          },
        ],
      },
      // Localization
      {
        id: 'localization',
        type: 'form',
        title: 'Localization',
        description: 'Regional and formatting preferences',
        icon: 'Globe',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'timezone',
            label: 'Default Timezone',
            type: 'select',
            path: 'localization.timezone',
            options: [...TIMEZONE_OPTIONS],
            config: { required: true },
          },
          {
            id: 'dateFormat',
            label: 'Date Format',
            type: 'select',
            path: 'localization.dateFormat',
            options: [...DATE_FORMAT_OPTIONS],
          },
          {
            id: 'currency',
            label: 'Default Currency',
            type: 'select',
            path: 'localization.currency',
            options: [...CURRENCY_OPTIONS],
          },
          {
            id: 'language',
            label: 'Language',
            type: 'select',
            path: 'localization.language',
            options: [{ value: 'en', label: 'English' }],
            config: { helpText: 'More languages coming soon' },
          },
        ],
        actions: [
          {
            id: 'save-localization',
            type: 'mutation',
            label: 'Save Settings',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateLocalization' },
          },
        ],
      },
      // Business Hours
      {
        id: 'business-hours',
        type: 'custom',
        title: 'Business Hours',
        description: 'Set working hours for SLA calculations',
        icon: 'Clock',
        component: 'BusinessHoursEditor',
        componentProps: {
          defaultStart: '09:00',
          defaultEnd: '17:00',
          defaultWorkdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
      },
      // Fiscal Year
      {
        id: 'fiscal-year',
        type: 'form',
        title: 'Fiscal Year',
        description: 'Configure fiscal year for reporting',
        icon: 'Calendar',
        columns: 2,
        editable: true,
        fields: [
          {
            id: 'fiscalYearStart',
            label: 'Fiscal Year Start Month',
            type: 'select',
            path: 'fiscal.startMonth',
            options: FISCAL_MONTH_OPTIONS.map((o) => ({ ...o, value: String(o.value) })),
          },
          {
            id: 'fiscalYearType',
            label: 'Fiscal Year Naming',
            type: 'radio',
            path: 'fiscal.naming',
            config: {
              options: [
                { value: 'start', label: 'By Start Year (FY2024 starts Jan 2024)' },
                { value: 'end', label: 'By End Year (FY2024 ends Dec 2024)' },
              ],
            },
          },
        ],
        actions: [
          {
            id: 'save-fiscal',
            type: 'mutation',
            label: 'Save Settings',
            variant: 'primary',
            icon: 'Save',
            config: { type: 'mutation', procedure: 'admin.settings.updateFiscal' },
          },
        ],
      },
    ],
  },

  // Navigation
  navigation: {
    back: { label: 'Back to Settings', route: '/admin/settings' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Settings', route: '/admin/settings' },
      { label: 'Organization' },
    ],
  },
};

export default orgSettingsScreen;
