/**
 * Form Components Library
 * Reusable form components for InTime v3
 *
 * @example Basic Usage
 * ```tsx
 * import { FormField, FormSection, FormGrid } from '@/components/forms';
 * import { jobFormSchema, jobFormDefaults } from '@/components/forms';
 * import { useFormWithDefaults } from '@/components/forms';
 *
 * function MyForm() {
 *   const form = useFormWithDefaults({
 *     formType: 'job',
 *     schema: jobFormSchema,
 *   });
 *
 *   return (
 *     <FormProvider {...form}>
 *       <FormSection title="Basic Info">
 *         <FormGrid columns={2}>
 *           <FormField name="title" label="Title" required />
 *           <FormField name="status" type="select" options={...} />
 *         </FormGrid>
 *       </FormSection>
 *     </FormProvider>
 *   );
 * }
 * ```
 */

// ============================================
// Base Components
// ============================================

export { FormField } from './FormField';
export type { FormFieldProps, FieldType, SelectOption } from './FormField';

export {
  FormSection,
  FormGrid,
  FormFullWidth,
  FormDivider,
} from './FormSection';
export type {
  FormSectionProps,
  FormGridProps,
  FormFullWidthProps,
  FormDividerProps,
} from './FormSection';

export { FormStepper, StepContent } from './FormStepper';
export type { FormStepperProps, FormStep, StepContentProps } from './FormStepper';

// ============================================
// Validation Schemas
// ============================================

export {
  // Common validators
  requiredString,
  optionalString,
  requiredEmail,
  optionalEmail,
  phoneSchema,
  urlSchema,
  ssnSchema,
  einSchema,
  positiveNumber,
  percentageSchema,
  currencySchema,
  dateSchema,
  dateTimeSchema,
  tagsSchema,
  addressSchema,
  contactSchema,

  // Domain schemas
  jobFormSchema,
  candidateFormSchema,
  submissionFormSchema,
  vendorFormSchema,
  vendorAgreementSchema,
  hotlistFormSchema,
  leadFormSchema,
  dealFormSchema,
  accountFormSchema,
  employeeOnboardingSchema,
  immigrationCaseSchema,
  activityFormSchema,
  raciAssignmentSchema,
  campaignFormSchema,
  placementFormSchema,
} from './validation';

export type {
  JobFormValues,
  CandidateFormValues,
  SubmissionFormValues,
  VendorFormValues,
  VendorAgreementValues,
  HotlistFormValues,
  LeadFormValues,
  DealFormValues,
  AccountFormValues,
  EmployeeOnboardingValues,
  ImmigrationCaseValues,
  ActivityFormValues,
  RACIAssignmentValues,
  CampaignFormValues,
  PlacementFormValues,
} from './validation';

// ============================================
// Default Values
// ============================================

export {
  jobFormDefaults,
  candidateFormDefaults,
  submissionFormDefaults,
  vendorFormDefaults,
  vendorAgreementDefaults,
  hotlistFormDefaults,
  leadFormDefaults,
  dealFormDefaults,
  accountFormDefaults,
  employeeOnboardingDefaults,
  immigrationCaseDefaults,
  activityFormDefaults,
  raciAssignmentDefaults,
  campaignFormDefaults,
  placementFormDefaults,
  mergeWithDefaults,
  getFormDefaults,
} from './defaults';

export type { FormType } from './defaults';

// ============================================
// Transformers
// ============================================

export {
  // String transformers
  trimStrings,
  stripEmptyStrings,
  nullToUndefined,

  // Phone transformers
  parsePhone,
  formatPhone,

  // Currency transformers
  parseCurrency,
  formatCurrencyValue,
  formatCurrencyDisplay,

  // Date transformers
  toISODateString,
  toISOTimestamp,
  parseDate,
  formatDateDisplay,

  // SSN/EIN transformers
  parseSSN,
  formatSSNMasked,
  parseEIN,
  formatEIN,

  // Array transformers
  filterEmptyStrings,
  stringToArray,
  arrayToString,

  // Object transformers
  removeEmptyValues,
  flattenObject,
  unflattenObject,

  // Generic transformers
  transformFormToPayload,
  transformPayloadToForm,

  // Domain transformers
  transformJobFormToPayload,
  transformCandidateFormToPayload,
  transformVendorFormToPayload,
  transformLeadFormToPayload,
  transformDealFormToPayload,
  transformEmployeeOnboardingToPayload,
} from './transformers';

export type { TransformOptions } from './transformers';

// ============================================
// Hooks
// ============================================

export {
  useFormWithDefaults,
  useFormDraft,
  useFormDirtyState,
  useFormAnalytics,
  useFormValidation,
  useFormProgress,
  useFormReset,
  useConditionalFields,
} from './hooks';

// ============================================
// Domain Forms
// ============================================

export {
  JobForm,
  VendorForm,
  LeadForm,
  EmployeeOnboardingForm,
} from './domain';

export type {
  JobFormProps,
  VendorFormProps,
  LeadFormProps,
  EmployeeOnboardingFormProps,
} from './domain';
