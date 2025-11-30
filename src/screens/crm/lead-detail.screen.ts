/**
 * Lead Detail Screen Definition
 *
 * Metadata-driven screen for viewing and editing a Lead.
 * This serves as a template for other CRM entity detail screens.
 */

import type { ScreenDefinition, FieldDefinition, SectionDefinition } from '@/lib/metadata';
import { fieldValue, paramValue, conditionVisible, roleVisible } from '@/lib/metadata';

// ==========================================
// FIELD DEFINITIONS
// ==========================================

const companyInfoFields: FieldDefinition[] = [
  {
    id: 'companyName',
    label: 'Company Name',
    fieldType: 'text',
    path: 'companyName',
    required: true,
  },
  {
    id: 'industry',
    label: 'Industry',
    fieldType: 'enum',
    path: 'industry',
    config: {
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'retail', label: 'Retail' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'other', label: 'Other' },
      ],
    },
  },
  {
    id: 'companyType',
    label: 'Company Type',
    fieldType: 'enum',
    path: 'companyType',
    config: {
      options: [
        { value: 'direct_client', label: 'Direct Client' },
        { value: 'implementation_partner', label: 'Implementation Partner' },
        { value: 'msp_vms', label: 'MSP/VMS' },
        { value: 'system_integrator', label: 'System Integrator' },
      ],
    },
  },
  {
    id: 'companySize',
    label: 'Company Size',
    fieldType: 'enum',
    path: 'companySize',
    config: {
      options: [
        { value: '1-10', label: '1-10 employees' },
        { value: '11-50', label: '11-50 employees' },
        { value: '51-200', label: '51-200 employees' },
        { value: '201-500', label: '201-500 employees' },
        { value: '501-1000', label: '501-1000 employees' },
        { value: '1000+', label: '1000+ employees' },
      ],
    },
  },
  {
    id: 'tier',
    label: 'Tier',
    fieldType: 'enum',
    path: 'tier',
    config: {
      options: [
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'mid_market', label: 'Mid-Market' },
        { value: 'smb', label: 'SMB' },
        { value: 'strategic', label: 'Strategic' },
      ],
      badgeColors: {
        enterprise: 'purple',
        mid_market: 'blue',
        smb: 'gray',
        strategic: 'yellow',
      },
    },
  },
  {
    id: 'website',
    label: 'Website',
    fieldType: 'url',
    path: 'website',
  },
  {
    id: 'headquarters',
    label: 'Headquarters',
    fieldType: 'text',
    path: 'headquarters',
  },
];

const contactFields: FieldDefinition[] = [
  {
    id: 'firstName',
    label: 'First Name',
    fieldType: 'text',
    path: 'firstName',
  },
  {
    id: 'lastName',
    label: 'Last Name',
    fieldType: 'text',
    path: 'lastName',
  },
  {
    id: 'title',
    label: 'Title',
    fieldType: 'text',
    path: 'title',
  },
  {
    id: 'email',
    label: 'Email',
    fieldType: 'email',
    path: 'email',
  },
  {
    id: 'phone',
    label: 'Phone',
    fieldType: 'phone',
    path: 'phone',
  },
  {
    id: 'linkedinUrl',
    label: 'LinkedIn',
    fieldType: 'url',
    path: 'linkedinUrl',
  },
  {
    id: 'decisionAuthority',
    label: 'Decision Authority',
    fieldType: 'enum',
    path: 'decisionAuthority',
    config: {
      options: [
        { value: 'decision_maker', label: 'Decision Maker' },
        { value: 'influencer', label: 'Influencer' },
        { value: 'gatekeeper', label: 'Gatekeeper' },
        { value: 'end_user', label: 'End User' },
        { value: 'champion', label: 'Champion' },
      ],
    },
  },
  {
    id: 'preferredContactMethod',
    label: 'Preferred Contact',
    fieldType: 'enum',
    path: 'preferredContactMethod',
    config: {
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'linkedin', label: 'LinkedIn' },
      ],
    },
  },
];

const bantFields: FieldDefinition[] = [
  {
    id: 'bantBudget',
    label: 'Budget Score',
    fieldType: 'number',
    path: 'bantBudget',
    description: '0-25: Has budget allocated for this need?',
    config: { min: 0, max: 25 },
  },
  {
    id: 'bantBudgetNotes',
    label: 'Budget Notes',
    fieldType: 'textarea',
    path: 'bantBudgetNotes',
  },
  {
    id: 'bantAuthority',
    label: 'Authority Score',
    fieldType: 'number',
    path: 'bantAuthority',
    description: '0-25: Can they make the decision?',
    config: { min: 0, max: 25 },
  },
  {
    id: 'bantAuthorityNotes',
    label: 'Authority Notes',
    fieldType: 'textarea',
    path: 'bantAuthorityNotes',
  },
  {
    id: 'bantNeed',
    label: 'Need Score',
    fieldType: 'number',
    path: 'bantNeed',
    description: '0-25: Is there a clear business need?',
    config: { min: 0, max: 25 },
  },
  {
    id: 'bantNeedNotes',
    label: 'Need Notes',
    fieldType: 'textarea',
    path: 'bantNeedNotes',
  },
  {
    id: 'bantTimeline',
    label: 'Timeline Score',
    fieldType: 'number',
    path: 'bantTimeline',
    description: '0-25: When do they need to make a decision?',
    config: { min: 0, max: 25 },
  },
  {
    id: 'bantTimelineNotes',
    label: 'Timeline Notes',
    fieldType: 'textarea',
    path: 'bantTimelineNotes',
  },
];

const leadStatusFields: FieldDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    fieldType: 'enum',
    path: 'status',
    config: {
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'converted', label: 'Converted' },
        { value: 'lost', label: 'Lost' },
      ],
      badgeColors: {
        new: 'blue',
        contacted: 'yellow',
        qualified: 'green',
        proposal: 'purple',
        negotiation: 'orange',
        converted: 'green',
        lost: 'red',
      },
    },
  },
  {
    id: 'estimatedValue',
    label: 'Estimated Value',
    fieldType: 'currency',
    path: 'estimatedValue',
  },
  {
    id: 'source',
    label: 'Source',
    fieldType: 'enum',
    path: 'source',
    config: {
      options: [
        { value: 'website', label: 'Website' },
        { value: 'referral', label: 'Referral' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'cold_outreach', label: 'Cold Outreach' },
        { value: 'event', label: 'Event' },
        { value: 'inbound', label: 'Inbound' },
        { value: 'partner', label: 'Partner' },
      ],
    },
  },
  {
    id: 'ownerId',
    label: 'Owner',
    fieldType: 'select',
    path: 'owner.fullName',
    config: {
      entityType: 'user',
      displayField: 'fullName',
    },
  },
];

// ==========================================
// SIDEBAR SECTION
// ==========================================

const sidebarSection: SectionDefinition = {
  id: 'lead-sidebar',
  type: 'info-card',
  title: 'Lead Info',
  fields: [
    {
      id: 'status',
      label: 'Status',
      fieldType: 'enum',
      path: 'status',
      config: {
        options: [
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'qualified', label: 'Qualified' },
          { value: 'proposal', label: 'Proposal' },
          { value: 'negotiation', label: 'Negotiation' },
          { value: 'converted', label: 'Converted' },
          { value: 'lost', label: 'Lost' },
        ],
      },
    },
    {
      id: 'estimatedValue',
      label: 'Est. Value',
      fieldType: 'currency',
      path: 'estimatedValue',
    },
    {
      id: 'tier',
      label: 'Tier',
      fieldType: 'enum',
      path: 'tier',
      config: {
        options: [
          { value: 'enterprise', label: 'Enterprise' },
          { value: 'mid_market', label: 'Mid-Market' },
          { value: 'smb', label: 'SMB' },
          { value: 'strategic', label: 'Strategic' },
        ],
      },
    },
    {
      id: 'source',
      label: 'Source',
      fieldType: 'text',
      path: 'source',
    },
    {
      id: 'owner',
      label: 'Owner',
      fieldType: 'text',
      path: 'owner.fullName',
    },
    {
      id: 'lastContactedAt',
      label: 'Last Contact',
      fieldType: 'date',
      path: 'lastContactedAt',
      config: { format: 'relative' },
    },
    {
      id: 'createdAt',
      label: 'Created',
      fieldType: 'date',
      path: 'createdAt',
      config: { format: 'relative' },
    },
  ],
};

// ==========================================
// TAB SECTIONS
// ==========================================

const overviewSections: SectionDefinition[] = [
  {
    id: 'company-info',
    type: 'info-card',
    title: 'Company Information',
    columns: 2,
    fields: companyInfoFields,
  },
  {
    id: 'contact-info',
    type: 'info-card',
    title: 'Contact Information',
    columns: 2,
    fields: contactFields,
  },
  {
    id: 'notes-section',
    type: 'form',
    title: 'Notes',
    columns: 1,
    fields: [
      {
        id: 'notes',
        label: 'Notes',
        fieldType: 'textarea',
        path: 'notes',
      },
      {
        id: 'companyDescription',
        label: 'Company Description',
        fieldType: 'textarea',
        path: 'companyDescription',
      },
    ],
  },
];

const qualificationSections: SectionDefinition[] = [
  {
    id: 'bant-overview',
    type: 'metrics-grid',
    columns: 4,
    fields: [
      {
        id: 'bantBudget',
        label: 'Budget',
        fieldType: 'number',
        path: 'bantBudget',
        config: { suffix: '/25' },
      },
      {
        id: 'bantAuthority',
        label: 'Authority',
        fieldType: 'number',
        path: 'bantAuthority',
        config: { suffix: '/25' },
      },
      {
        id: 'bantNeed',
        label: 'Need',
        fieldType: 'number',
        path: 'bantNeed',
        config: { suffix: '/25' },
      },
      {
        id: 'bantTimeline',
        label: 'Timeline',
        fieldType: 'number',
        path: 'bantTimeline',
        config: { suffix: '/25' },
      },
    ],
  },
  {
    id: 'bant-details',
    type: 'form',
    title: 'BANT Qualification Details',
    columns: 2,
    fields: bantFields,
  },
];

const activitySections: SectionDefinition[] = [
  {
    id: 'activity-metrics',
    type: 'metrics-grid',
    columns: 3,
    fields: [
      {
        id: 'lastContactedAt',
        label: 'Last Contacted',
        fieldType: 'date',
        path: 'lastContactedAt',
        config: { format: 'relative' },
      },
      {
        id: 'lastResponseAt',
        label: 'Last Response',
        fieldType: 'date',
        path: 'lastResponseAt',
        config: { format: 'relative' },
      },
      {
        id: 'engagementScore',
        label: 'Engagement',
        fieldType: 'number',
        path: 'engagementScore',
        config: { suffix: '%' },
      },
    ],
  },
  {
    id: 'activity-timeline',
    type: 'timeline',
    title: 'Activity History',
    dataPath: 'activities',
    fields: [
      {
        id: 'timestamp',
        label: 'Time',
        fieldType: 'datetime',
        path: 'activityDate',
      },
      {
        id: 'title',
        label: 'Activity',
        fieldType: 'text',
        path: 'subject',
      },
      {
        id: 'description',
        label: 'Details',
        fieldType: 'text',
        path: 'body',
      },
    ],
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const leadDetailScreen: ScreenDefinition = {
  id: 'lead-detail',
  type: 'detail',
  entityType: 'lead',

  // Dynamic title from entity
  title: fieldValue('companyName', 'Lead Details'),
  subtitle: fieldValue('status'),

  // Data source
  dataSource: {
    type: 'query',
    query: {
      router: 'crm',
      procedure: 'getLeadById',
      input: { id: paramValue('id') },
    },
  },

  // Sidebar + Tabs layout
  layout: {
    type: 'sidebar-main',
    sidebar: sidebarSection,
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        sections: overviewSections,
      },
      {
        id: 'qualification',
        label: 'Qualification',
        sections: qualificationSections,
      },
      {
        id: 'activity',
        label: 'Activity',
        sections: activitySections,
      },
    ],
  },

  // Actions
  actions: [
    {
      id: 'edit',
      label: 'Edit',
      type: 'custom',
      variant: 'secondary',
      icon: 'Pencil',
    },
    {
      id: 'convert',
      label: 'Convert to Deal',
      type: 'custom',
      variant: 'primary',
      icon: 'ArrowRight',
      showWhen: {
        type: 'condition',
        condition: { field: 'status', operator: 'in', value: ['qualified', 'proposal', 'negotiation'] },
      },
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      type: 'custom',
      variant: 'secondary',
      icon: 'Plus',
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', path: '/employee/crm' },
      { label: 'Leads', path: '/employee/crm/leads' },
      { label: fieldValue('companyName', 'Lead') },
    ],
  },
};

export default leadDetailScreen;
