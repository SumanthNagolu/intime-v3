/**
 * Contact Detail Screen Definition
 *
 * Metadata-driven screen for viewing Contact details with tabs and related data.
 * Uses the createDetailScreen factory for standardized detail patterns.
 */

import { createDetailScreen } from '@/lib/metadata/factories';
import type { DetailTemplateConfig } from '@/lib/metadata/templates';
import {
  crmContactBasicInputSet,
  crmContactTypeInputSet,
  crmContactCompanyInputSet,
  crmContactDecisionInputSet,
  crmContactPreferencesInputSet,
  crmContactSocialInputSet,
  crmContactNotesInputSet,
  crmContactEngagementInputSet,
} from '@/lib/metadata/inputsets';
import {
  CONTACT_TYPE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  DECISION_AUTHORITY_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// CONTACT DETAIL SCREEN CONFIG
// ==========================================

const contactDetailConfig: DetailTemplateConfig = {
  entityId: 'contact',
  entityName: 'Contact',
  basePath: '/employee/crm/contacts',

  // Data source
  dataSource: {
    getProcedure: 'crm.contacts.getById',
    idParam: 'id',
  },

  // Title template
  titleTemplate: '{{firstName}} {{lastName}}',
  subtitleTemplate: '{{title}} at {{companyName}}',

  // Sidebar configuration
  sidebar: {
    position: 'left',
    width: 320,
    sections: [
      {
        id: 'avatar',
        type: 'avatar',
        config: {
          nameFields: ['firstName', 'lastName'],
          avatarField: 'avatarUrl',
          subtitleField: 'title',
        },
      },
      {
        id: 'quickInfo',
        type: 'info-list',
        fields: [
          {
            id: 'email',
            label: 'Email',
            path: 'email',
            type: 'email',
            icon: 'Mail',
          },
          {
            id: 'phone',
            label: 'Phone',
            path: 'phone',
            type: 'phone',
            icon: 'Phone',
          },
          {
            id: 'mobile',
            label: 'Mobile',
            path: 'mobile',
            type: 'phone',
            icon: 'Smartphone',
          },
          {
            id: 'company',
            label: 'Company',
            path: 'company.name',
            type: 'link',
            linkTemplate: '/employee/crm/accounts/{{companyId}}',
            icon: 'Building2',
          },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            icon: 'CircleDot',
            config: {
              options: CONTACT_STATUS_OPTIONS,
              badgeColors: {
                active: 'green',
                inactive: 'gray',
                do_not_contact: 'red',
                bounced: 'orange',
                unsubscribed: 'yellow',
              },
            },
          },
          {
            id: 'contactType',
            label: 'Type',
            path: 'contactType',
            type: 'enum',
            icon: 'User',
            config: {
              options: CONTACT_TYPE_OPTIONS,
            },
          },
        ],
      },
      {
        id: 'engagement',
        type: 'stats',
        title: 'Engagement',
        fields: [
          {
            id: 'engagementScore',
            label: 'Score',
            path: 'engagementScore',
            type: 'progress',
            config: { max: 100 },
          },
          {
            id: 'totalInteractions',
            label: 'Interactions',
            path: 'totalInteractions',
            type: 'number',
          },
          {
            id: 'lastContacted',
            label: 'Last Contacted',
            path: 'lastContactedAt',
            type: 'date',
            config: { format: 'relative' },
          },
        ],
      },
      {
        id: 'quickActions',
        type: 'action-list',
        actions: [
          {
            id: 'email',
            label: 'Send Email',
            icon: 'Mail',
            actionType: 'custom',
            handler: 'handleSendEmail',
          },
          {
            id: 'call',
            label: 'Log Call',
            icon: 'Phone',
            actionType: 'custom',
            handler: 'handleLogCall',
          },
          {
            id: 'meeting',
            label: 'Schedule Meeting',
            icon: 'Calendar',
            actionType: 'custom',
            handler: 'handleScheduleMeeting',
          },
          {
            id: 'note',
            label: 'Add Note',
            icon: 'StickyNote',
            actionType: 'custom',
            handler: 'handleAddNote',
          },
        ],
      },
      {
        id: 'socialLinks',
        type: 'link-list',
        title: 'Social Profiles',
        fields: [
          {
            id: 'linkedin',
            label: 'LinkedIn',
            type: 'link',
            path: 'linkedinUrl',
            icon: 'Linkedin',
            external: true,
          },
          {
            id: 'twitter',
            label: 'Twitter/X',
            type: 'link',
            path: 'twitterUrl',
            icon: 'Twitter',
            external: true,
          },
          {
            id: 'github',
            label: 'GitHub',
            type: 'link',
            path: 'githubUrl',
            icon: 'Github',
            external: true,
          },
        ],
      },
    ],
  },

  // Tabs configuration
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'User',
      sections: [
        {
          id: 'basicInfo',
          type: 'input-set',
          inputSet: crmContactBasicInputSet,
          title: 'Basic Information',
          readonly: true,
        },
        {
          id: 'classification',
          type: 'input-set',
          inputSet: crmContactTypeInputSet,
          title: 'Classification',
          readonly: true,
        },
        {
          id: 'company',
          type: 'input-set',
          inputSet: crmContactCompanyInputSet,
          title: 'Company Information',
          readonly: true,
        },
        {
          id: 'decision',
          type: 'input-set',
          inputSet: crmContactDecisionInputSet,
          title: 'Decision Making',
          readonly: true,
        },
      ],
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: 'Settings',
      sections: [
        {
          id: 'communication',
          type: 'input-set',
          inputSet: crmContactPreferencesInputSet,
          title: 'Communication Preferences',
          readonly: true,
        },
      ],
    },
    {
      id: 'social',
      label: 'Social & Links',
      icon: 'Link',
      sections: [
        {
          id: 'socialLinks',
          type: 'input-set',
          inputSet: crmContactSocialInputSet,
          title: 'Social Links',
          readonly: true,
        },
      ],
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: 'StickyNote',
      sections: [
        {
          id: 'notes',
          type: 'input-set',
          inputSet: crmContactNotesInputSet,
          title: 'Notes & Tags',
          readonly: true,
        },
      ],
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: 'TrendingUp',
      sections: [
        {
          id: 'metrics',
          type: 'input-set',
          inputSet: crmContactEngagementInputSet,
          title: 'Engagement Metrics',
          readonly: true,
        },
      ],
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: 'DollarSign',
      badge: {
        path: 'deals.length',
        variant: 'secondary',
      },
      sections: [
        {
          id: 'relatedDeals',
          type: 'related-table',
          title: 'Associated Deals',
          dataPath: 'deals',
          columns: [
            { id: 'title', label: 'Deal', path: 'title', type: 'text' },
            { id: 'value', label: 'Value', path: 'value', type: 'currency' },
            { id: 'stage', label: 'Stage', path: 'stage', type: 'enum' },
            { id: 'expectedCloseDate', label: 'Close Date', path: 'expectedCloseDate', type: 'date' },
          ],
          actions: [
            {
              id: 'view',
              label: 'View Deal',
              icon: 'Eye',
              actionType: 'navigate',
              handler: 'navigateToDeal',
            },
          ],
          emptyState: {
            title: 'No deals',
            message: 'This contact is not associated with any deals.',
          },
        },
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: 'Activity',
      sections: [
        {
          id: 'activityTimeline',
          type: 'timeline',
          title: 'Activity Timeline',
          dataPath: 'activities',
          config: {
            activityTypes: ['call', 'email', 'meeting', 'note', 'linkedin_message'],
            showAddButton: true,
            groupByDate: true,
          },
          emptyState: {
            title: 'No activity yet',
            message: 'Log a call, send an email, or add a note to get started.',
          },
        },
      ],
    },
  ],

  // Header actions
  headerActions: [
    {
      id: 'edit',
      label: 'Edit',
      variant: 'primary',
      icon: 'Pencil',
      actionType: 'navigate',
      routeTemplate: '/employee/crm/contacts/{{id}}/edit',
    },
    {
      id: 'email',
      label: 'Email',
      variant: 'secondary',
      icon: 'Mail',
      actionType: 'custom',
      handler: 'handleSendEmail',
    },
    {
      id: 'delete',
      label: 'Delete',
      variant: 'destructive',
      icon: 'Trash',
      actionType: 'mutation',
      mutation: 'crm.contacts.delete',
      confirm: {
        title: 'Delete Contact',
        message: 'Are you sure you want to delete this contact? This action cannot be undone.',
      },
      onSuccess: {
        redirect: '/employee/crm/contacts',
        toast: { message: 'Contact deleted successfully' },
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Contacts', route: '/employee/crm/contacts' },
      { label: '{{firstName}} {{lastName}}' },
    ],
  },
};

// ==========================================
// GENERATE SCREEN
// ==========================================

export const contactDetailScreen = createDetailScreen(contactDetailConfig);

export default contactDetailScreen;
