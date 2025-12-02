/**
 * Marketing Profiles List Screen
 *
 * Grid/List of consultant marketing profiles.
 * Allows filtering, editing, and previewing marketing materials.
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/06-create-hotlist.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const PROFILE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const VISA_TYPE_OPTIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H-1B' },
  { value: 'opt', label: 'OPT' },
  { value: 'opt_stem', label: 'OPT STEM' },
  { value: 'l1', label: 'L-1' },
  { value: 'tn_visa', label: 'TN Visa' },
  { value: 'h4_ead', label: 'H4-EAD' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const marketingProfilesScreen: ScreenDefinition = {
  id: 'marketing-profiles',
  type: 'list',
  entityType: 'marketing_profile',

  title: 'Marketing Profiles',
  subtitle: 'Manage consultant marketing materials',
  icon: 'Megaphone',

  dataSource: {
    type: 'list',
    entityType: 'marketing_profile',
    procedure: 'bench.marketingProfiles.list',
    defaultSort: { field: 'updatedAt', direction: 'desc' },
    defaultPageSize: 20,
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'totalProfiles',
            label: 'Total Profiles',
            type: 'number',
            path: 'stats.total',
          },
          {
            id: 'activeProfiles',
            label: 'Active',
            type: 'number',
            path: 'stats.active',
          },
          {
            id: 'draftProfiles',
            label: 'Drafts',
            type: 'number',
            path: 'stats.draft',
          },
          {
            id: 'needsUpdate',
            label: 'Needs Update',
            type: 'number',
            path: 'stats.needsUpdate',
          },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.marketingProfiles.getStats',
          },
        },
      },

      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'search',
            type: 'text',
            path: 'filters.search',
            placeholder: 'Search profiles...',
            config: { icon: 'Search' },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: PROFILE_STATUS_OPTIONS,
          },
          {
            id: 'skills',
            type: 'tags',
            path: 'filters.skills',
            label: 'Skills',
            placeholder: 'Any skills',
            config: { suggestions: true },
          },
          {
            id: 'visaStatus',
            label: 'Visa Status',
            type: 'multiselect',
            path: 'filters.visaStatus',
            options: VISA_TYPE_OPTIONS,
          },
        ],
      },

      // View Toggle
      {
        id: 'view-toggle',
        type: 'custom',
        component: 'ViewToggle',
        componentProps: {
          views: ['grid', 'list'],
          defaultView: 'grid',
        },
      },

      // Profile Cards/Grid
      {
        id: 'profiles-grid',
        type: 'custom',
        component: 'MarketingProfileGrid',
        componentProps: {
          cardFields: {
            avatar: 'consultant.avatarUrl',
            name: 'consultant.fullName',
            headline: 'headline',
            skills: 'consultant.primarySkills',
            visaBadge: 'consultant.visaStatus',
            rateRange: { min: 'consultant.minimumRate', max: 'consultant.targetRate' },
            status: 'status',
            lastUpdated: 'updatedAt',
          },
          showVisaBadge: true,
          showRateRange: true,
        },
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.marketingProfiles.list',
          },
        },
        actions: [
          {
            id: 'view',
            label: 'View',
            icon: 'Eye',
            type: 'navigate',
            config: { type: 'navigate', route: '/employee/workspace/bench/marketing/{{id}}' },
          },
          {
            id: 'edit',
            label: 'Edit',
            icon: 'Edit',
            type: 'navigate',
            config: { type: 'navigate', route: '/employee/workspace/bench/marketing/{{id}}/edit' },
          },
          {
            id: 'preview',
            label: 'Preview',
            icon: 'FileText',
            type: 'modal',
            config: { type: 'modal', modal: 'marketing-profile-preview', props: { profileId: '{{id}}' } },
          },
          {
            id: 'add-to-hotlist',
            label: 'Add to Hotlist',
            icon: 'ListPlus',
            type: 'modal',
            config: { type: 'modal', modal: 'add-to-hotlist', props: { consultantId: '{{consultantId}}' } },
          },
          {
            id: 'generate-pdf',
            label: 'Generate PDF',
            icon: 'Download',
            type: 'custom',
            config: { type: 'custom', handler: 'generateProfilePdf' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Create Profile',
      type: 'navigate',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/bench/marketing/new' },
    },
    {
      id: 'bulk-generate',
      label: 'Bulk Generate',
      type: 'modal',
      icon: 'Wand2',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-generate-profiles' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'custom', handler: 'exportProfiles' },
    },
  ],

  bulkActions: [
    {
      id: 'bulk-add-hotlist',
      label: 'Add to Hotlist',
      icon: 'ListPlus',
      type: 'modal',
      config: { type: 'modal', modal: 'bulk-add-to-hotlist', props: { consultantIds: '{{selectedIds}}' } },
    },
    {
      id: 'bulk-export-pdf',
      label: 'Export as PDF',
      icon: 'Download',
      type: 'custom',
      config: { type: 'custom', handler: 'bulkExportPdf' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/workspace/bench' },
      { label: 'Marketing Profiles', active: true },
    ],
  },
};

export default marketingProfilesScreen;
