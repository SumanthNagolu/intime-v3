/**
 * Marketing Profile Editor Screen
 *
 * Split view editor for consultant marketing profiles.
 * Left: Form (headline, summary, highlights, target roles)
 * Right: Live preview
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/06-create-hotlist.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const marketingProfileEditorScreen: ScreenDefinition = {
  id: 'marketing-profile-editor',
  type: 'detail',
  entityType: 'marketing_profile',

  title: { type: 'field', path: 'consultant.fullName' },
  subtitle: 'Edit Marketing Profile',
  icon: 'Megaphone',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'bench.marketingProfiles.getById',
      params: { id: fieldValue('id') },
    },
  },

  layout: {
    type: 'two-column',
    sections: [
      // Left Column - Editor
      {
        id: 'editor-column',
        type: 'form',
        span: 1,
        sections: [
          // Consultant Info (Read-only)
          {
            id: 'consultant-info',
            type: 'info-card',
            title: 'Consultant',
            collapsible: true,
            defaultExpanded: false,
            fields: [
              { id: 'name', label: 'Name', type: 'text', path: 'consultant.fullName' },
              { id: 'title', label: 'Title', type: 'text', path: 'consultant.title' },
              { id: 'visa', label: 'Visa', type: 'enum', path: 'consultant.visaStatus' },
              { id: 'skills', label: 'Skills', type: 'tags', path: 'consultant.primarySkills' },
            ],
          },

          // Headline
          {
            id: 'headline-section',
            type: 'form',
            title: 'Professional Headline',
            icon: 'Type',
            fields: [
              {
                id: 'headline',
                label: 'Headline',
                type: 'text',
                path: 'headline',
                required: true,
                config: {
                  placeholder: 'e.g., Senior Java Developer with 10+ years of enterprise experience',
                  maxLength: 120,
                  showCharCount: true,
                },
              },
            ],
          },

          // Summary
          {
            id: 'summary-section',
            type: 'form',
            title: 'Professional Summary',
            icon: 'FileText',
            fields: [
              {
                id: 'summary',
                label: 'Summary',
                type: 'textarea',
                path: 'summary',
                required: true,
                config: {
                  rows: 6,
                  placeholder: 'Brief professional summary highlighting key experience and strengths...',
                  maxLength: 500,
                  showCharCount: true,
                },
              },
            ],
          },

          // Key Highlights
          {
            id: 'highlights-section',
            type: 'form',
            title: 'Key Highlights',
            icon: 'Star',
            description: 'Top 3-5 bullet points for hotlists and quick marketing',
            fields: [
              {
                id: 'highlights',
                label: 'Highlights',
                type: 'list',
                path: 'highlights',
                config: {
                  maxItems: 5,
                  minItems: 3,
                  itemPlaceholder: 'Add a highlight...',
                  sortable: true,
                },
              },
            ],
          },

          // Target Information
          {
            id: 'targeting-section',
            type: 'form',
            title: 'Target Positioning',
            icon: 'Target',
            columns: 2,
            fields: [
              {
                id: 'targetRoles',
                label: 'Target Roles',
                type: 'tags',
                path: 'targetRoles',
                config: {
                  placeholder: 'Add target roles...',
                  suggestions: ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Engineer', 'Cloud Architect'],
                },
              },
              {
                id: 'targetIndustries',
                label: 'Target Industries',
                type: 'tags',
                path: 'targetIndustries',
                config: {
                  placeholder: 'Add industries...',
                  suggestions: ['Finance', 'Healthcare', 'Technology', 'Retail', 'Manufacturing'],
                },
              },
              {
                id: 'keywords',
                label: 'SEO Keywords',
                type: 'tags',
                path: 'keywords',
                config: {
                  placeholder: 'Add keywords...',
                  helpText: 'Keywords for search matching',
                },
              },
            ],
          },

          // Additional Details
          {
            id: 'additional-section',
            type: 'form',
            title: 'Additional Details',
            icon: 'Info',
            collapsible: true,
            defaultExpanded: false,
            fields: [
              {
                id: 'certifications',
                label: 'Certifications',
                type: 'tags',
                path: 'certifications',
              },
              {
                id: 'achievements',
                label: 'Key Achievements',
                type: 'textarea',
                path: 'achievements',
                config: { rows: 3 },
              },
              {
                id: 'preferredWorkMode',
                label: 'Preferred Work Mode',
                type: 'select',
                path: 'preferredWorkMode',
                options: [
                  { value: 'remote', label: 'Remote' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'onsite', label: 'On-site' },
                  { value: 'any', label: 'Any' },
                ],
              },
            ],
          },
        ],
      },

      // Right Column - Live Preview
      {
        id: 'preview-column',
        type: 'custom',
        span: 1,
        component: 'MarketingProfileLivePreview',
        componentProps: {
          profilePath: '',
          formats: [
            { id: 'standard', label: 'Standard', description: 'Default hotlist format' },
            { id: 'detailed', label: 'Detailed', description: 'Extended profile with full history' },
            { id: 'one-pager', label: 'One-Pager', description: 'Single page PDF format' },
          ],
          defaultFormat: 'standard',
          showExportButtons: true,
          showVisaBadge: true,
          showRateRange: true,
          // Per spec Section 8.4 - visa color coding
          visaColorCoding: {
            green: { minDays: 181, label: 'Green', color: 'green' },
            yellow: { minDays: 90, maxDays: 180, label: 'Yellow', color: 'yellow' },
            orange: { minDays: 30, maxDays: 90, label: 'Orange', color: 'orange' },
            red: { minDays: 1, maxDays: 30, label: 'Red', color: 'red' },
            black: { maxDays: 0, label: 'Expired', color: 'gray' },
          },
        },
        actions: [
          {
            id: 'preview-standard',
            label: 'Standard',
            type: 'custom',
            config: { type: 'custom', handler: 'setPreviewFormat', args: { format: 'standard' } },
          },
          {
            id: 'preview-detailed',
            label: 'Detailed',
            type: 'custom',
            config: { type: 'custom', handler: 'setPreviewFormat', args: { format: 'detailed' } },
          },
          {
            id: 'preview-one-pager',
            label: 'One-Pager',
            type: 'custom',
            config: { type: 'custom', handler: 'setPreviewFormat', args: { format: 'one-pager' } },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'save',
      label: 'Save',
      type: 'mutation',
      icon: 'Save',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'bench.marketingProfiles.update',
        input: { id: fieldValue('id') },
      },
    },
    {
      id: 'save-draft',
      label: 'Save as Draft',
      type: 'mutation',
      icon: 'FileText',
      variant: 'default',
      config: {
        type: 'mutation',
        procedure: 'bench.marketingProfiles.saveDraft',
        input: { id: fieldValue('id') },
      },
    },
    {
      id: 'publish',
      label: 'Publish',
      type: 'mutation',
      icon: 'CheckCircle',
      variant: 'default',
      config: {
        type: 'mutation',
        procedure: 'bench.marketingProfiles.publish',
        input: { id: fieldValue('id') },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'draft' },
      },
    },
    {
      id: 'generate-pdf',
      label: 'Generate PDF',
      type: 'download',
      icon: 'Download',
      variant: 'ghost',
      config: {
        type: 'download',
        url: '/api/bench/marketing-profiles/{{id}}/pdf',
        filename: '{{consultant.fullName}}-profile.pdf',
      },
    },
    {
      id: 'share',
      label: 'Share',
      type: 'modal',
      icon: 'Share2',
      variant: 'ghost',
      config: {
        type: 'modal',
        modal: 'share-marketing-profile',
        props: { profileId: fieldValue('id') },
      },
    },
  ],

  navigation: {
    back: {
      label: 'Back to Marketing Profiles',
      route: '/employee/bench/marketing',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Marketing Profiles', route: '/employee/bench/marketing' },
      { label: { type: 'field', path: 'consultant.fullName' }, active: true },
    ],
  },
};

export default marketingProfileEditorScreen;
