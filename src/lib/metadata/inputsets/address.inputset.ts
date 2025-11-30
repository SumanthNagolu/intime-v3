/**
 * Address InputSet
 *
 * Reusable address form fields for any entity requiring address input.
 * Follows Guidewire InputSet pattern for composable form sections.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

/**
 * Full address fields
 */
export const addressFields: FieldDefinition[] = [
  {
    id: 'street1',
    label: 'Street Address',
    type: 'text',
    placeholder: '123 Main St',
    required: true,
    config: {
      maxLength: 200,
    },
  },
  {
    id: 'street2',
    label: 'Apt/Suite/Unit',
    type: 'text',
    placeholder: 'Apt 4B',
    config: {
      maxLength: 100,
    },
  },
  {
    id: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'New York',
    required: true,
    config: {
      maxLength: 100,
    },
  },
  {
    id: 'state',
    label: 'State/Province',
    type: 'text',
    placeholder: 'NY',
    required: true,
    config: {
      maxLength: 50,
    },
  },
  {
    id: 'postalCode',
    label: 'ZIP/Postal Code',
    type: 'text',
    placeholder: '10001',
    required: true,
    config: {
      maxLength: 20,
    },
  },
  {
    id: 'country',
    label: 'Country',
    type: 'enum',
    defaultValue: 'US',
    config: {
      options: [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'UK', label: 'United Kingdom' },
        { value: 'IN', label: 'India' },
        { value: 'AU', label: 'Australia' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
  },
];

/**
 * Address InputSet configuration
 */
export const addressInputSet: InputSetConfig = {
  id: 'address',
  label: 'Address',
  description: 'Full mailing address',
  fields: addressFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'street1', colSpan: 2 },
      { fieldId: 'street2', colSpan: 2 },
      { fieldId: 'city', colSpan: 1 },
      { fieldId: 'state', colSpan: 1 },
      { fieldId: 'postalCode', colSpan: 1 },
      { fieldId: 'country', colSpan: 1 },
    ],
  },
};

/**
 * US-only address InputSet (simplified)
 */
export const usAddressInputSet: InputSetConfig = {
  id: 'us-address',
  label: 'US Address',
  description: 'US mailing address',
  fields: [
    ...addressFields.filter((f) => f.id !== 'country'),
    {
      id: 'state',
      label: 'State',
      type: 'enum',
      required: true,
      config: {
        options: [
          { value: 'AL', label: 'Alabama' },
          { value: 'AK', label: 'Alaska' },
          { value: 'AZ', label: 'Arizona' },
          { value: 'AR', label: 'Arkansas' },
          { value: 'CA', label: 'California' },
          { value: 'CO', label: 'Colorado' },
          { value: 'CT', label: 'Connecticut' },
          { value: 'DE', label: 'Delaware' },
          { value: 'FL', label: 'Florida' },
          { value: 'GA', label: 'Georgia' },
          { value: 'HI', label: 'Hawaii' },
          { value: 'ID', label: 'Idaho' },
          { value: 'IL', label: 'Illinois' },
          { value: 'IN', label: 'Indiana' },
          { value: 'IA', label: 'Iowa' },
          { value: 'KS', label: 'Kansas' },
          { value: 'KY', label: 'Kentucky' },
          { value: 'LA', label: 'Louisiana' },
          { value: 'ME', label: 'Maine' },
          { value: 'MD', label: 'Maryland' },
          { value: 'MA', label: 'Massachusetts' },
          { value: 'MI', label: 'Michigan' },
          { value: 'MN', label: 'Minnesota' },
          { value: 'MS', label: 'Mississippi' },
          { value: 'MO', label: 'Missouri' },
          { value: 'MT', label: 'Montana' },
          { value: 'NE', label: 'Nebraska' },
          { value: 'NV', label: 'Nevada' },
          { value: 'NH', label: 'New Hampshire' },
          { value: 'NJ', label: 'New Jersey' },
          { value: 'NM', label: 'New Mexico' },
          { value: 'NY', label: 'New York' },
          { value: 'NC', label: 'North Carolina' },
          { value: 'ND', label: 'North Dakota' },
          { value: 'OH', label: 'Ohio' },
          { value: 'OK', label: 'Oklahoma' },
          { value: 'OR', label: 'Oregon' },
          { value: 'PA', label: 'Pennsylvania' },
          { value: 'RI', label: 'Rhode Island' },
          { value: 'SC', label: 'South Carolina' },
          { value: 'SD', label: 'South Dakota' },
          { value: 'TN', label: 'Tennessee' },
          { value: 'TX', label: 'Texas' },
          { value: 'UT', label: 'Utah' },
          { value: 'VT', label: 'Vermont' },
          { value: 'VA', label: 'Virginia' },
          { value: 'WA', label: 'Washington' },
          { value: 'WV', label: 'West Virginia' },
          { value: 'WI', label: 'Wisconsin' },
          { value: 'WY', label: 'Wyoming' },
          { value: 'DC', label: 'Washington D.C.' },
        ],
      },
    },
  ],
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'street1', colSpan: 2 },
      { fieldId: 'street2', colSpan: 2 },
      { fieldId: 'city', colSpan: 1 },
      { fieldId: 'state', colSpan: 1 },
      { fieldId: 'postalCode', colSpan: 2 },
    ],
  },
};

/**
 * Work location address (simplified for remote/onsite)
 */
export const workLocationInputSet: InputSetConfig = {
  id: 'work-location',
  label: 'Work Location',
  description: 'Job or work location',
  fields: [
    {
      id: 'locationType',
      label: 'Location Type',
      type: 'enum',
      required: true,
      config: {
        options: [
          { value: 'onsite', label: 'On-site' },
          { value: 'remote', label: 'Remote' },
          { value: 'hybrid', label: 'Hybrid' },
        ],
      },
    },
    {
      id: 'city',
      label: 'City',
      type: 'text',
      visible: {
        type: 'condition',
        condition: { field: 'locationType', operator: 'neq', value: 'remote' },
      },
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      visible: {
        type: 'condition',
        condition: { field: 'locationType', operator: 'neq', value: 'remote' },
      },
    },
    {
      id: 'remoteRestrictions',
      label: 'Remote Restrictions',
      type: 'textarea',
      placeholder: 'e.g., Must be in US time zones',
      visible: {
        type: 'condition',
        condition: { field: 'locationType', operator: 'eq', value: 'remote' },
      },
    },
  ],
  layout: {
    columns: 2,
  },
};

export default addressInputSet;
