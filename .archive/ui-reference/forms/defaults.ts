/**
 * Form Default Values
 * Provides sensible defaults for all form types
 */

import type {
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
// Job Form Defaults
// ============================================

export const jobFormDefaults: Partial<JobFormValues> = {
  status: 'draft',
  priority: 'medium',
  jobType: 'contract',
  workMode: 'remote',
  rateType: 'hourly',
  currency: 'USD',
  positions: 1,
  requiredSkills: [],
  preferredSkills: [],
  visaTypes: [],
};

// ============================================
// Candidate Form Defaults
// ============================================

export const candidateFormDefaults: Partial<CandidateFormValues> = {
  willingToRelocate: false,
  preferredLocations: [],
  salaryType: 'annual',
  currency: 'USD',
  skills: [],
  certifications: [],
};

// ============================================
// Submission Form Defaults
// ============================================

export const submissionFormDefaults: Partial<SubmissionFormValues> = {
  rateType: 'hourly',
};

// ============================================
// Vendor Form Defaults
// ============================================

export const vendorFormDefaults: Partial<VendorFormValues> = {
  type: 'prime_vendor',
  tier: 'standard',
  industryFocus: [],
  geographicFocus: [],
  address: {
    country: 'USA',
  },
};

// ============================================
// Vendor Agreement Defaults
// ============================================

export const vendorAgreementDefaults: Partial<VendorAgreementValues> = {
  agreementType: 'subcontractor',
  commissionType: 'tiered_percentage',
  invoiceFrequency: 'monthly',
  paymentTermsDays: 30,
  paymentMethod: 'ach',
  exclusivityType: 'first_right_of_refusal',
  exclusivityDurationHours: 48,
  termMonths: 24,
  autoRenew: true,
  terminationNoticeDays: 30,
  nonCompeteDurationMonths: 6,
  tiers: [
    { minPlacements: 1, maxPlacements: 5, percentage: 5 },
    { minPlacements: 6, maxPlacements: 10, percentage: 4 },
    { minPlacements: 11, maxPlacements: undefined, percentage: 3 },
  ],
};

// ============================================
// Hotlist Form Defaults
// ============================================

export const hotlistFormDefaults: Partial<HotlistFormValues> = {
  purpose: 'general',
};

// ============================================
// Lead Form Defaults
// ============================================

export const leadFormDefaults: Partial<LeadFormValues> = {
  leadType: 'company',
  status: 'new',
  bantBudget: 0,
  bantAuthority: 0,
  bantNeed: 0,
  bantTimeline: 0,
};

// ============================================
// Deal Form Defaults
// ============================================

export const dealFormDefaults: Partial<DealFormValues> = {
  dealType: 'new_business',
  stage: 'discovery',
  currency: 'USD',
};

// ============================================
// Account Form Defaults
// ============================================

export const accountFormDefaults: Partial<AccountFormValues> = {
  companyType: 'direct_client',
  status: 'prospect',
  paymentTermsDays: 30,
};

// ============================================
// Employee Onboarding Defaults
// ============================================

export const employeeOnboardingDefaults: Partial<EmployeeOnboardingValues> = {
  basicInfo: {
    firstName: '',
    lastName: '',
    email: '',
    address: {
      country: 'USA',
    },
    emergencyContact: {
      name: '',
    },
  },
  employmentDetails: {
    jobTitle: '',
    employmentType: 'fte',
    workMode: 'on_site',
  },
  i9Section1: {
    completed: false,
  },
  taxForms: {
    w4Completed: false,
    stateFormsCompleted: false,
  },
  payroll: {
    salaryType: 'annual',
    payFrequency: 'biweekly',
  },
  backgroundCheck: {
    status: 'not_started',
  },
  itEquipment: {
    monitor: false,
    keyboard: false,
    mouse: false,
    headset: false,
  },
};

// ============================================
// Immigration Case Defaults
// ============================================

export const immigrationCaseDefaults: Partial<ImmigrationCaseValues> = {
  status: 'not_started',
};

// ============================================
// Activity Form Defaults
// ============================================

export const activityFormDefaults: Partial<ActivityFormValues> = {
  activityType: 'note',
  priority: 'normal',
};

// ============================================
// RACI Assignment Defaults
// ============================================

export const raciAssignmentDefaults: Partial<RACIAssignmentValues> = {
  responsible: [],
  consulted: [],
  informed: [],
};

// ============================================
// Campaign Form Defaults
// ============================================

export const campaignFormDefaults: Partial<CampaignFormValues> = {
  status: 'draft',
  currency: 'USD',
  targetIndustries: [],
  targetTitles: [],
  targetCompanySizes: [],
};

// ============================================
// Placement Form Defaults
// ============================================

export const placementFormDefaults: Partial<PlacementFormValues> = {
  rateType: 'hourly',
  currency: 'USD',
  paymentTermsDays: 30,
  workMode: 'remote',
};

// ============================================
// Helper to merge defaults with existing values
// ============================================

export function mergeWithDefaults<T extends Record<string, unknown>>(
  defaults: Partial<T>,
  values?: Partial<T>
): Partial<T> {
  if (!values) return defaults;

  return Object.keys(defaults).reduce(
    (merged, key) => {
      const defaultValue = defaults[key as keyof T];
      const existingValue = values[key as keyof T];

      if (existingValue === undefined || existingValue === null) {
        (merged as Record<string, unknown>)[key] = defaultValue;
      } else if (
        typeof defaultValue === 'object' &&
        !Array.isArray(defaultValue) &&
        defaultValue !== null
      ) {
        // Deep merge for objects
        (merged as Record<string, unknown>)[key] = mergeWithDefaults(
          defaultValue as Record<string, unknown>,
          existingValue as Record<string, unknown>
        );
      } else {
        (merged as Record<string, unknown>)[key] = existingValue;
      }

      return merged;
    },
    { ...values } as Partial<T>
  );
}

// ============================================
// Get defaults by form type
// ============================================

export type FormType =
  | 'job'
  | 'candidate'
  | 'submission'
  | 'vendor'
  | 'vendorAgreement'
  | 'hotlist'
  | 'lead'
  | 'deal'
  | 'account'
  | 'employeeOnboarding'
  | 'immigrationCase'
  | 'activity'
  | 'raciAssignment'
  | 'campaign'
  | 'placement';

export function getFormDefaults(formType: FormType): Record<string, unknown> {
  const defaultsMap: Record<FormType, Record<string, unknown>> = {
    job: jobFormDefaults,
    candidate: candidateFormDefaults,
    submission: submissionFormDefaults,
    vendor: vendorFormDefaults,
    vendorAgreement: vendorAgreementDefaults,
    hotlist: hotlistFormDefaults,
    lead: leadFormDefaults,
    deal: dealFormDefaults,
    account: accountFormDefaults,
    employeeOnboarding: employeeOnboardingDefaults,
    immigrationCase: immigrationCaseDefaults,
    activity: activityFormDefaults,
    raciAssignment: raciAssignmentDefaults,
    campaign: campaignFormDefaults,
    placement: placementFormDefaults,
  };

  return defaultsMap[formType] || {};
}
