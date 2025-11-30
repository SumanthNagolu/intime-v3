/**
 * Account Detail Screen Definition
 *
 * Metadata-driven screen for viewing/editing Account details.
 * Generated from entity config: src/lib/entities/crm/account.entity.ts
 */

import type { ScreenDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// SIDEBAR FIELDS
// ==========================================

const sidebarFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    path: 'status',
    options: [
      { value: 'prospect', label: 'Prospect' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'churned', label: 'Churned' },
    ],
    config: {
      badgeColors: {
        prospect: 'blue',
        active: 'green',
        inactive: 'gray',
        churned: 'red',
      },
    },
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'enum',
    path: 'tier',
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'mid_market', label: 'Mid-Market' },
      { value: 'smb', label: 'SMB' },
      { value: 'strategic', label: 'Strategic' },
    ],
    config: {
      badgeColors: {
        enterprise: 'purple',
        mid_market: 'blue',
        smb: 'gray',
        strategic: 'gold',
      },
    },
  },
  {
    id: 'accountManager',
    label: 'Account Manager',
    type: 'text',
    path: 'accountManager',
  },
  {
    id: 'annualRevenueTarget',
    label: 'Revenue Target',
    type: 'currency',
    path: 'annualRevenueTarget',
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'phone',
    path: 'phone',
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    path: 'website',
  },
  {
    id: 'createdAt',
    label: 'Created',
    type: 'date',
    path: 'createdAt',
    config: { format: 'relative' },
  },
  {
    id: 'updatedAt',
    label: 'Updated',
    type: 'date',
    path: 'updatedAt',
    config: { format: 'relative' },
  },
];

// ==========================================
// COMPANY INFO FIELDS
// ==========================================

const companyInfoFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'name',
    label: 'Company Name',
    type: 'text',
    path: 'name',
    required: true,
    editable: true,
    span: 2,
  },
  {
    id: 'industry',
    label: 'Industry',
    type: 'select',
    path: 'industry',
    editable: true,
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
      { value: 'banking', label: 'Banking' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'retail', label: 'Retail' },
      { value: 'consulting', label: 'Consulting' },
      { value: 'government', label: 'Government' },
      { value: 'education', label: 'Education' },
      { value: 'energy', label: 'Energy' },
      { value: 'telecommunications', label: 'Telecom' },
      { value: 'pharmaceutical', label: 'Pharmaceutical' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'companyType',
    label: 'Company Type',
    type: 'select',
    path: 'companyType',
    editable: true,
    options: [
      { value: 'direct_client', label: 'Direct Client' },
      { value: 'implementation_partner', label: 'Implementation Partner' },
      { value: 'msp_vms', label: 'MSP/VMS' },
      { value: 'system_integrator', label: 'System Integrator' },
      { value: 'staffing_agency', label: 'Staffing Agency' },
      { value: 'vendor', label: 'Vendor' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    path: 'status',
    required: true,
    editable: true,
    options: [
      { value: 'prospect', label: 'Prospect' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'churned', label: 'Churned' },
    ],
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'select',
    path: 'tier',
    editable: true,
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'mid_market', label: 'Mid-Market' },
      { value: 'smb', label: 'SMB' },
      { value: 'strategic', label: 'Strategic' },
    ],
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    path: 'description',
    editable: true,
    span: 2,
    config: { rows: 4 },
  },
];

// ==========================================
// CONTACT INFO FIELDS
// ==========================================

const contactInfoFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'phone',
    label: 'Phone',
    type: 'phone',
    path: 'phone',
    editable: true,
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    path: 'website',
    editable: true,
  },
  {
    id: 'headquartersLocation',
    label: 'Headquarters',
    type: 'text',
    path: 'headquartersLocation',
    editable: true,
    span: 2,
  },
];

// ==========================================
// ACCOUNT MANAGEMENT FIELDS
// ==========================================

const accountManagementFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'accountManagerId',
    label: 'Account Manager',
    type: 'select',
    path: 'accountManagerId',
    editable: true,
    config: {
      entityType: 'user',
      displayField: 'fullName',
    },
  },
  {
    id: 'responsiveness',
    label: 'Responsiveness',
    type: 'select',
    path: 'responsiveness',
    editable: true,
    options: [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
  {
    id: 'preferredQuality',
    label: 'Preferred Quality',
    type: 'select',
    path: 'preferredQuality',
    editable: true,
    options: [
      { value: 'premium', label: 'Premium' },
      { value: 'standard', label: 'Standard' },
      { value: 'budget', label: 'Budget' },
    ],
  },
];

// ==========================================
// BUSINESS TERMS FIELDS
// ==========================================

const businessTermsFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'contractStartDate',
    label: 'Contract Start',
    type: 'date',
    path: 'contractStartDate',
    editable: true,
  },
  {
    id: 'contractEndDate',
    label: 'Contract End',
    type: 'date',
    path: 'contractEndDate',
    editable: true,
  },
  {
    id: 'paymentTermsDays',
    label: 'Payment Terms (Days)',
    type: 'number',
    path: 'paymentTermsDays',
    editable: true,
    min: 0,
    max: 180,
  },
  {
    id: 'markupPercentage',
    label: 'Markup %',
    type: 'percentage',
    path: 'markupPercentage',
    editable: true,
  },
  {
    id: 'annualRevenueTarget',
    label: 'Annual Revenue Target',
    type: 'currency',
    path: 'annualRevenueTarget',
    editable: true,
  },
];

// ==========================================
// RELATED CONTACTS TABLE
// ==========================================

const contactsTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Name',
    path: 'name',
    type: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'title',
    label: 'Title',
    path: 'title',
    type: 'text',
  },
  {
    id: 'email',
    label: 'Email',
    path: 'email',
    type: 'email',
  },
  {
    id: 'phone',
    label: 'Phone',
    path: 'phone',
    type: 'phone',
  },
  {
    id: 'isPrimary',
    label: 'Primary',
    path: 'isPrimary',
    type: 'boolean',
    width: '80px',
  },
];

// ==========================================
// RELATED DEALS TABLE
// ==========================================

const dealsTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Deal Name',
    path: 'name',
    type: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'stage',
    label: 'Stage',
    path: 'stage',
    type: 'enum',
    sortable: true,
    config: {
      badgeColors: {
        qualification: 'blue',
        proposal: 'yellow',
        negotiation: 'orange',
        closed_won: 'green',
        closed_lost: 'red',
      },
    },
  },
  {
    id: 'value',
    label: 'Value',
    path: 'value',
    type: 'currency',
    sortable: true,
  },
  {
    id: 'probability',
    label: 'Probability',
    path: 'probability',
    type: 'percentage',
  },
  {
    id: 'expectedCloseDate',
    label: 'Expected Close',
    path: 'expectedCloseDate',
    type: 'date',
    sortable: true,
  },
];

// ==========================================
// RELATED LEADS TABLE
// ==========================================

const leadsTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'title',
    label: 'Title',
    path: 'title',
    type: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      badgeColors: {
        new: 'blue',
        contacted: 'yellow',
        qualified: 'green',
        unqualified: 'red',
        converted: 'purple',
      },
    },
  },
  {
    id: 'source',
    label: 'Source',
    path: 'source',
    type: 'text',
  },
  {
    id: 'createdAt',
    label: 'Created',
    path: 'createdAt',
    type: 'date',
    sortable: true,
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const accountDetailScreen: ScreenDefinition = {
  id: 'account-detail',
  type: 'detail',
  entityType: 'account',

  title: fieldValue('name'),
  subtitle: 'Account Details',

  // Data source
  dataSource: {
    type: 'query',
    query: {
      procedure: 'crm.accounts.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Sidebar + Main layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',

    sidebar: {
      id: 'account-sidebar',
      type: 'info-card',
      title: 'Quick Info',
      fields: sidebarFields,
    },

    tabs: [
      // Overview Tab
      {
        id: 'overview',
        label: 'Overview',
        icon: 'Building2',
        sections: [
          {
            id: 'company-info',
            type: 'field-grid',
            title: 'Company Information',
            icon: 'Building',
            columns: 2,
            fields: companyInfoFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'contact-info',
            type: 'field-grid',
            title: 'Contact Information',
            icon: 'Phone',
            columns: 2,
            fields: contactInfoFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'account-management',
            type: 'field-grid',
            title: 'Account Management',
            icon: 'UserCog',
            columns: 2,
            fields: accountManagementFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'business-terms',
            type: 'field-grid',
            title: 'Business Terms',
            icon: 'FileText',
            columns: 2,
            fields: businessTermsFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
        ],
      },

      // Contacts Tab
      {
        id: 'contacts',
        label: 'Contacts',
        icon: 'Users',
        badge: fieldValue('pointOfContacts.length'),
        lazy: true,
        sections: [
          {
            id: 'contacts-table',
            type: 'table',
            title: 'Points of Contact',
            columns_config: contactsTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getContacts',
                params: { accountId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-contact',
                label: 'Add Contact',
                type: 'modal',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'modal',
                  modal: 'AddContactModal',
                  props: { accountId: fieldValue('id') },
                },
              },
            ],
          },
        ],
      },

      // Deals Tab
      {
        id: 'deals',
        label: 'Deals',
        icon: 'Handshake',
        badge: fieldValue('deals.length'),
        lazy: true,
        sections: [
          {
            id: 'deals-table',
            type: 'table',
            title: 'Associated Deals',
            columns_config: dealsTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getDeals',
                params: { accountId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'create-deal',
                label: 'Create Deal',
                type: 'navigate',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'navigate',
                  route: '/employee/crm/deals/new',
                  params: { accountId: fieldValue('id') },
                },
              },
            ],
          },
        ],
      },

      // Leads Tab
      {
        id: 'leads',
        label: 'Leads',
        icon: 'Target',
        badge: fieldValue('leads.length'),
        lazy: true,
        sections: [
          {
            id: 'leads-table',
            type: 'table',
            title: 'Associated Leads',
            columns_config: leadsTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getLeads',
                params: { accountId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'create-lead',
                label: 'Create Lead',
                type: 'navigate',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'navigate',
                  route: '/employee/crm/leads/new',
                  params: { accountId: fieldValue('id') },
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // Actions
  actions: [
    {
      id: 'edit',
      label: 'Edit',
      type: 'custom',
      variant: 'primary',
      icon: 'Pencil',
      config: {
        type: 'custom',
        handler: 'handleEdit',
      },
    },
    {
      id: 'create-deal',
      label: 'Create Deal',
      type: 'navigate',
      variant: 'secondary',
      icon: 'Handshake',
      config: {
        type: 'navigate',
        route: '/employee/crm/deals/new',
        params: { accountId: fieldValue('id') },
      },
    },
    {
      id: 'create-lead',
      label: 'Create Lead',
      type: 'navigate',
      variant: 'secondary',
      icon: 'Target',
      config: {
        type: 'navigate',
        route: '/employee/crm/leads/new',
        params: { accountId: fieldValue('id') },
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      type: 'mutation',
      variant: 'destructive',
      icon: 'Trash2',
      config: {
        type: 'mutation',
        procedure: 'crm.accounts.delete',
        input: { id: fieldValue('id') },
      },
      confirm: {
        title: 'Delete Account',
        message:
          'Are you sure you want to delete this account? This action cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Accounts',
      route: '/employee/crm/accounts',
    },
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Accounts', route: '/employee/crm/accounts' },
      { label: fieldValue('name') },
    ],
  },
};

export default accountDetailScreen;
