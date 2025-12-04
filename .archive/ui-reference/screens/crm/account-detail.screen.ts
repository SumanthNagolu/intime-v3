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
// ADDRESSES TABLE
// ==========================================

const addressesTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'addressType',
    label: 'Type',
    path: 'addressType',
    type: 'enum',
    width: '100px',
    config: {
      options: [
        { value: 'hq', label: 'Headquarters' },
        { value: 'billing', label: 'Billing' },
        { value: 'office', label: 'Office' },
        { value: 'shipping', label: 'Shipping' },
      ],
      badgeColors: {
        hq: 'purple',
        billing: 'blue',
        office: 'gray',
        shipping: 'green',
      },
    },
  },
  {
    id: 'street',
    label: 'Street',
    path: 'street',
    type: 'text',
    width: '200px',
  },
  {
    id: 'city',
    label: 'City',
    path: 'city',
    type: 'text',
  },
  {
    id: 'state',
    label: 'State',
    path: 'state',
    type: 'text',
  },
  {
    id: 'postalCode',
    label: 'Postal Code',
    path: 'postalCode',
    type: 'text',
  },
  {
    id: 'country',
    label: 'Country',
    path: 'country',
    type: 'text',
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
// CONTRACTS TABLE
// ==========================================

const contractsTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Contract Name',
    path: 'name',
    type: 'text',
    width: '200px',
  },
  {
    id: 'contractType',
    label: 'Type',
    path: 'contractType',
    type: 'enum',
    config: {
      options: [
        { value: 'msa', label: 'MSA' },
        { value: 'sow', label: 'SOW' },
        { value: 'nda', label: 'NDA' },
        { value: 'amendment', label: 'Amendment' },
        { value: 'addendum', label: 'Addendum' },
      ],
      badgeColors: {
        msa: 'purple',
        sow: 'blue',
        nda: 'gray',
        amendment: 'amber',
        addendum: 'cyan',
      },
    },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending_review', label: 'Pending Review' },
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
        { value: 'terminated', label: 'Terminated' },
      ],
      badgeColors: {
        draft: 'gray',
        pending_review: 'yellow',
        active: 'green',
        expired: 'orange',
        terminated: 'red',
      },
    },
  },
  {
    id: 'startDate',
    label: 'Start Date',
    path: 'startDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'endDate',
    label: 'End Date',
    path: 'endDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'value',
    label: 'Value',
    path: 'value',
    type: 'currency',
  },
];

// ==========================================
// TEAM TABLE
// ==========================================

const teamTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'userName',
    label: 'Team Member',
    path: 'userName',
    type: 'text',
    width: '200px',
  },
  {
    id: 'userEmail',
    label: 'Email',
    path: 'userEmail',
    type: 'email',
  },
  {
    id: 'role',
    label: 'Role',
    path: 'role',
    type: 'enum',
    config: {
      options: [
        { value: 'owner', label: 'Owner' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'support', label: 'Support' },
        { value: 'recruiter', label: 'Recruiter' },
        { value: 'account_manager', label: 'Account Manager' },
      ],
      badgeColors: {
        owner: 'purple',
        secondary: 'blue',
        support: 'gray',
        recruiter: 'green',
        account_manager: 'amber',
      },
    },
  },
  {
    id: 'isPrimary',
    label: 'Primary',
    path: 'isPrimary',
    type: 'boolean',
    width: '80px',
  },
  {
    id: 'assignedAt',
    label: 'Assigned',
    path: 'assignedAt',
    type: 'date',
    config: { format: 'relative' },
  },
];

// ==========================================
// PREFERENCES FIELDS
// ==========================================

const preferencesSkillsFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'preferredSkills',
    label: 'Preferred Skills',
    type: 'tags',
    path: 'preferredSkills',
    editable: true,
    span: 2,
  },
  {
    id: 'excludedSkills',
    label: 'Excluded Skills',
    type: 'tags',
    path: 'excludedSkills',
    editable: true,
    span: 2,
  },
];

const preferencesVisaFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'preferredVisaTypes',
    label: 'Preferred Visa Types',
    type: 'multi-select',
    path: 'preferredVisaTypes',
    editable: true,
    options: [
      { value: 'USC', label: 'US Citizen' },
      { value: 'GC', label: 'Green Card' },
      { value: 'H1B', label: 'H-1B' },
      { value: 'L1', label: 'L-1' },
      { value: 'OPT', label: 'OPT' },
      { value: 'CPT', label: 'CPT' },
      { value: 'TN', label: 'TN Visa' },
      { value: 'EAD', label: 'EAD' },
    ],
  },
  {
    id: 'excludedVisaTypes',
    label: 'Excluded Visa Types',
    type: 'multi-select',
    path: 'excludedVisaTypes',
    editable: true,
    options: [
      { value: 'USC', label: 'US Citizen' },
      { value: 'GC', label: 'Green Card' },
      { value: 'H1B', label: 'H-1B' },
      { value: 'L1', label: 'L-1' },
      { value: 'OPT', label: 'OPT' },
      { value: 'CPT', label: 'CPT' },
      { value: 'TN', label: 'TN Visa' },
      { value: 'EAD', label: 'EAD' },
    ],
  },
];

const preferencesRateFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'rateRangeMin',
    label: 'Min Rate',
    type: 'currency',
    path: 'rateRangeMin',
    editable: true,
  },
  {
    id: 'rateRangeMax',
    label: 'Max Rate',
    type: 'currency',
    path: 'rateRangeMax',
    editable: true,
  },
  {
    id: 'preferredRateType',
    label: 'Rate Type',
    type: 'select',
    path: 'preferredRateType',
    editable: true,
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'daily', label: 'Daily' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'annual', label: 'Annual' },
    ],
  },
];

const preferencesWorkFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'workModePreference',
    label: 'Work Mode',
    type: 'select',
    path: 'workModePreference',
    editable: true,
    options: [
      { value: 'remote', label: 'Remote' },
      { value: 'onsite', label: 'Onsite' },
      { value: 'hybrid', label: 'Hybrid' },
    ],
  },
  {
    id: 'backgroundCheckRequired',
    label: 'Background Check',
    type: 'boolean',
    path: 'backgroundCheckRequired',
    editable: true,
  },
  {
    id: 'drugScreenRequired',
    label: 'Drug Screen',
    type: 'boolean',
    path: 'drugScreenRequired',
    editable: true,
  },
  {
    id: 'securityClearanceRequired',
    label: 'Security Clearance',
    type: 'select',
    path: 'securityClearanceRequired',
    editable: true,
    options: [
      { value: 'none', label: 'None Required' },
      { value: 'public_trust', label: 'Public Trust' },
      { value: 'secret', label: 'Secret' },
      { value: 'top_secret', label: 'Top Secret' },
      { value: 'sci', label: 'TS/SCI' },
    ],
  },
];

const preferencesInterviewFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'typicalInterviewRounds',
    label: 'Interview Rounds',
    type: 'number',
    path: 'typicalInterviewRounds',
    editable: true,
  },
  {
    id: 'interviewTurnaroundDays',
    label: 'Turnaround (Days)',
    type: 'number',
    path: 'interviewTurnaroundDays',
    editable: true,
  },
  {
    id: 'interviewProcessNotes',
    label: 'Interview Process Notes',
    type: 'textarea',
    path: 'interviewProcessNotes',
    editable: true,
    span: 2,
    config: { rows: 4 },
  },
];

// ==========================================
// METRICS FIELDS
// ==========================================

const metricsPlacementFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'totalPlacements',
    label: 'Total Placements',
    type: 'number',
    path: 'totalPlacements',
  },
  {
    id: 'activePlacements',
    label: 'Active Placements',
    type: 'number',
    path: 'activePlacements',
  },
  {
    id: 'endedPlacements',
    label: 'Ended Placements',
    type: 'number',
    path: 'endedPlacements',
  },
];

const metricsRevenueFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'totalRevenue',
    label: 'Total Revenue',
    type: 'currency',
    path: 'totalRevenue',
    config: { format: 'compact' },
  },
  {
    id: 'totalMargin',
    label: 'Total Margin',
    type: 'currency',
    path: 'totalMargin',
    config: { format: 'compact' },
  },
];

const metricsPerformanceFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'avgTtfDays',
    label: 'Avg Time to Fill',
    type: 'number',
    path: 'avgTtfDays',
    config: { suffix: ' days' },
  },
  {
    id: 'submissionToInterviewRate',
    label: 'Submit to Interview',
    type: 'percentage',
    path: 'submissionToInterviewRate',
  },
  {
    id: 'interviewToOfferRate',
    label: 'Interview to Offer',
    type: 'percentage',
    path: 'interviewToOfferRate',
  },
  {
    id: 'offerAcceptanceRate',
    label: 'Offer Acceptance',
    type: 'percentage',
    path: 'offerAcceptanceRate',
  },
];

const metricsActivityFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'totalSubmissions',
    label: 'Total Submissions',
    type: 'number',
    path: 'totalSubmissions',
  },
  {
    id: 'totalInterviews',
    label: 'Total Interviews',
    type: 'number',
    path: 'totalInterviews',
  },
  {
    id: 'totalOffers',
    label: 'Total Offers',
    type: 'number',
    path: 'totalOffers',
  },
  {
    id: 'healthScore',
    label: 'Health Score',
    type: 'number',
    path: 'healthScore',
    config: { suffix: '/100' },
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

      // Addresses Tab
      {
        id: 'addresses',
        label: 'Addresses',
        icon: 'MapPin',
        lazy: true,
        sections: [
          {
            id: 'addresses-table',
            type: 'table',
            title: 'Account Addresses',
            columns_config: addressesTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getAddresses',
                params: { accountId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-address',
                label: 'Add Address',
                type: 'modal',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'modal',
                  modal: 'AddAddressModal',
                  props: { accountId: fieldValue('id') },
                },
              },
            ],
            emptyState: {
              title: 'No addresses',
              message: 'Add an address for this account.',
            },
          },
        ],
      },

      // Contracts Tab
      {
        id: 'contracts',
        label: 'Contracts',
        icon: 'FileSignature',
        lazy: true,
        sections: [
          {
            id: 'contracts-table',
            type: 'table',
            title: 'Account Contracts',
            columns_config: contractsTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getContracts',
                params: { accountId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-contract',
                label: 'Add Contract',
                type: 'modal',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'modal',
                  modal: 'AddContractModal',
                  props: { accountId: fieldValue('id') },
                },
              },
            ],
            emptyState: {
              title: 'No contracts',
              message: 'Add a contract for this account.',
            },
          },
        ],
      },

      // Team Tab
      {
        id: 'team',
        label: 'Team',
        icon: 'UsersRound',
        lazy: true,
        sections: [
          {
            id: 'team-table',
            type: 'table',
            title: 'Account Team',
            columns_config: teamTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getTeam',
                params: { accountId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-team-member',
                label: 'Add Team Member',
                type: 'modal',
                variant: 'primary',
                icon: 'UserPlus',
                config: {
                  type: 'modal',
                  modal: 'AddTeamMemberModal',
                  props: { accountId: fieldValue('id') },
                },
              },
            ],
            emptyState: {
              title: 'No team members',
              message: 'Add team members to this account.',
            },
          },
        ],
      },

      // Preferences Tab
      {
        id: 'preferences',
        label: 'Preferences',
        icon: 'Settings',
        lazy: true,
        sections: [
          {
            id: 'preferences-skills',
            type: 'field-grid',
            title: 'Skill Preferences',
            icon: 'Code',
            columns: 2,
            fields: preferencesSkillsFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getPreferences',
                params: { accountId: fieldValue('id') },
              },
            },
          },
          {
            id: 'preferences-visa',
            type: 'field-grid',
            title: 'Visa Preferences',
            icon: 'FileCheck',
            columns: 2,
            fields: preferencesVisaFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'preferences-rate',
            type: 'field-grid',
            title: 'Rate Preferences',
            icon: 'DollarSign',
            columns: 3,
            fields: preferencesRateFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'preferences-work',
            type: 'field-grid',
            title: 'Work Preferences',
            icon: 'Briefcase',
            columns: 2,
            fields: preferencesWorkFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'preferences-interview',
            type: 'field-grid',
            title: 'Interview Process',
            icon: 'Calendar',
            columns: 2,
            fields: preferencesInterviewFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
        ],
      },

      // Metrics Tab
      {
        id: 'metrics',
        label: 'Metrics',
        icon: 'BarChart3',
        lazy: true,
        sections: [
          {
            id: 'metrics-placements',
            type: 'metrics-grid',
            title: 'Placement Metrics',
            columns: 3,
            fields: metricsPlacementFields,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'crm.accounts.getMetrics',
                params: { accountId: fieldValue('id') },
              },
            },
          },
          {
            id: 'metrics-revenue',
            type: 'metrics-grid',
            title: 'Revenue & Margin',
            columns: 2,
            fields: metricsRevenueFields,
          },
          {
            id: 'metrics-performance',
            type: 'metrics-grid',
            title: 'Performance Rates',
            columns: 4,
            fields: metricsPerformanceFields,
          },
          {
            id: 'metrics-activity',
            type: 'metrics-grid',
            title: 'Activity Metrics',
            columns: 4,
            fields: metricsActivityFields,
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
