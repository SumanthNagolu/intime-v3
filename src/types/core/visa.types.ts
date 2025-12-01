/**
 * Visa and Work Authorization Type Definitions
 * 
 * Implements: docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md (Section 7.3)
 * 
 * Comprehensive visa and work authorization types for US and Canada.
 */

// ==========================================
// US VISA TYPES
// ==========================================

/**
 * US Work Authorization Types
 */
export type USVisaType =
  | 'USC'           // US Citizen
  | 'GC'            // Green Card (Permanent Resident)
  | 'GC_EAD'        // Green Card EAD (I-485 pending)
  | 'H1B'           // H1B Visa
  | 'H1B_TRANSFER'  // H1B Transfer in progress
  | 'H4_EAD'        // H4 EAD (spouse of H1B)
  | 'L1A'           // L1A (Manager/Executive)
  | 'L1B'           // L1B (Specialized Knowledge)
  | 'L2_EAD'        // L2 EAD (spouse of L1)
  | 'OPT'           // Optional Practical Training
  | 'OPT_STEM'      // OPT STEM Extension
  | 'CPT'           // Curricular Practical Training
  | 'TN'            // TN Visa (NAFTA)
  | 'E3'            // E3 (Australian)
  | 'O1';           // O1 (Extraordinary Ability)

/**
 * US Visa Type Metadata
 */
export interface USVisaTypeMetadata {
  type: USVisaType;
  label: string;
  description: string;
  category: 'citizen' | 'immigrant' | 'non_immigrant' | 'student' | 'dependent';
  workAuthType: 'unlimited' | 'employer_specific' | 'field_specific' | 'pending';
  maxDuration: string;
  requiresSponsorship: boolean;
  keyDatesToTrack: string[];
}

/**
 * US Visa Type Configurations
 */
export const US_VISA_CONFIGS: Record<USVisaType, USVisaTypeMetadata> = {
  USC: {
    type: 'USC',
    label: 'US Citizen',
    description: 'United States Citizen',
    category: 'citizen',
    workAuthType: 'unlimited',
    maxDuration: 'Permanent',
    requiresSponsorship: false,
    keyDatesToTrack: [],
  },
  GC: {
    type: 'GC',
    label: 'Green Card',
    description: 'Permanent Resident',
    category: 'immigrant',
    workAuthType: 'unlimited',
    maxDuration: 'Permanent',
    requiresSponsorship: false,
    keyDatesToTrack: ['Card Expiry (10yr)'],
  },
  GC_EAD: {
    type: 'GC_EAD',
    label: 'Green Card EAD',
    description: 'I-485 pending, EAD work authorization',
    category: 'immigrant',
    workAuthType: 'unlimited',
    maxDuration: 'Until decision',
    requiresSponsorship: false,
    keyDatesToTrack: ['EAD Expiry', 'I-485 Status'],
  },
  H1B: {
    type: 'H1B',
    label: 'H-1B',
    description: 'Specialty Occupation Visa',
    category: 'non_immigrant',
    workAuthType: 'employer_specific',
    maxDuration: '6 years',
    requiresSponsorship: true,
    keyDatesToTrack: ['I-94 Expiry', 'Visa Stamp Expiry'],
  },
  H1B_TRANSFER: {
    type: 'H1B_TRANSFER',
    label: 'H-1B Transfer',
    description: 'H-1B Transfer in progress',
    category: 'non_immigrant',
    workAuthType: 'employer_specific',
    maxDuration: 'Existing time',
    requiresSponsorship: true,
    keyDatesToTrack: ['Receipt Date', 'Approval Date', 'I-94 Expiry'],
  },
  H4_EAD: {
    type: 'H4_EAD',
    label: 'H-4 EAD',
    description: 'Spouse of H-1B with EAD',
    category: 'dependent',
    workAuthType: 'unlimited',
    maxDuration: 'Per H4 status',
    requiresSponsorship: false,
    keyDatesToTrack: ['EAD Expiry', 'H1B Status'],
  },
  L1A: {
    type: 'L1A',
    label: 'L-1A',
    description: 'Intracompany Transferee - Manager/Executive',
    category: 'non_immigrant',
    workAuthType: 'employer_specific',
    maxDuration: '7 years',
    requiresSponsorship: true,
    keyDatesToTrack: ['I-94 Expiry'],
  },
  L1B: {
    type: 'L1B',
    label: 'L-1B',
    description: 'Intracompany Transferee - Specialized Knowledge',
    category: 'non_immigrant',
    workAuthType: 'employer_specific',
    maxDuration: '5 years',
    requiresSponsorship: true,
    keyDatesToTrack: ['I-94 Expiry'],
  },
  L2_EAD: {
    type: 'L2_EAD',
    label: 'L-2 EAD',
    description: 'Spouse of L-1 with EAD',
    category: 'dependent',
    workAuthType: 'unlimited',
    maxDuration: 'Per L1 status',
    requiresSponsorship: false,
    keyDatesToTrack: ['EAD Expiry', 'L1 Status'],
  },
  OPT: {
    type: 'OPT',
    label: 'OPT',
    description: 'Optional Practical Training (Post-graduation)',
    category: 'student',
    workAuthType: 'field_specific',
    maxDuration: '12 months',
    requiresSponsorship: false,
    keyDatesToTrack: ['EAD Expiry', '90-day Unemployment Limit'],
  },
  OPT_STEM: {
    type: 'OPT_STEM',
    label: 'OPT STEM Extension',
    description: 'STEM OPT Extension (24 months additional)',
    category: 'student',
    workAuthType: 'field_specific',
    maxDuration: '+24 months',
    requiresSponsorship: false,
    keyDatesToTrack: ['EAD Expiry', 'Employer E-Verify'],
  },
  CPT: {
    type: 'CPT',
    label: 'CPT',
    description: 'Curricular Practical Training',
    category: 'student',
    workAuthType: 'employer_specific',
    maxDuration: 'Per semester',
    requiresSponsorship: false,
    keyDatesToTrack: ['Authorization Start', 'Authorization End'],
  },
  TN: {
    type: 'TN',
    label: 'TN',
    description: 'NAFTA Professional (Canada/Mexico)',
    category: 'non_immigrant',
    workAuthType: 'employer_specific',
    maxDuration: '3 years (renewable)',
    requiresSponsorship: false,
    keyDatesToTrack: ['I-94 Expiry'],
  },
  E3: {
    type: 'E3',
    label: 'E-3',
    description: 'Australian Specialty Occupation',
    category: 'non_immigrant',
    workAuthType: 'employer_specific',
    maxDuration: '2 years (renewable)',
    requiresSponsorship: false,
    keyDatesToTrack: ['I-94 Expiry', 'Visa Stamp Expiry'],
  },
  O1: {
    type: 'O1',
    label: 'O-1',
    description: 'Extraordinary Ability or Achievement',
    category: 'non_immigrant',
    workAuthType: 'employer_specific',
    maxDuration: '3 years',
    requiresSponsorship: true,
    keyDatesToTrack: ['I-94 Expiry'],
  },
};

// ==========================================
// CANADA WORK AUTHORIZATION TYPES
// ==========================================

/**
 * Canada Work Authorization Types
 */
export type CanadaWorkAuth =
  | 'CITIZEN'       // Canadian Citizen
  | 'PR'            // Permanent Resident
  | 'WORK_PERMIT'   // Closed Work Permit
  | 'OWP'           // Open Work Permit
  | 'PGWP'          // Post-Graduation Work Permit
  | 'LMIA'          // LMIA-based Work Permit
  | 'IEC'           // International Experience Canada
  | 'BRIDGING_OWP'; // Bridging Open Work Permit

/**
 * Canada Work Auth Metadata
 */
export interface CanadaWorkAuthMetadata {
  type: CanadaWorkAuth;
  label: string;
  description: string;
  category: 'citizen' | 'immigrant' | 'work_permit' | 'transitional';
  workAuthType: 'unlimited' | 'employer_specific' | 'any_employer';
  maxDuration: string;
  keyDatesToTrack: string[];
}

/**
 * Canada Work Auth Configurations
 */
export const CANADA_WORK_AUTH_CONFIGS: Record<CanadaWorkAuth, CanadaWorkAuthMetadata> = {
  CITIZEN: {
    type: 'CITIZEN',
    label: 'Canadian Citizen',
    description: 'Canadian Citizenship',
    category: 'citizen',
    workAuthType: 'unlimited',
    maxDuration: 'Permanent',
    keyDatesToTrack: [],
  },
  PR: {
    type: 'PR',
    label: 'Permanent Resident',
    description: 'Canadian Permanent Resident',
    category: 'immigrant',
    workAuthType: 'unlimited',
    maxDuration: 'Permanent',
    keyDatesToTrack: ['PR Card Expiry (5yr)'],
  },
  WORK_PERMIT: {
    type: 'WORK_PERMIT',
    label: 'Closed Work Permit',
    description: 'Employer-specific work permit',
    category: 'work_permit',
    workAuthType: 'employer_specific',
    maxDuration: 'Per LMIA',
    keyDatesToTrack: ['Permit Expiry'],
  },
  OWP: {
    type: 'OWP',
    label: 'Open Work Permit',
    description: 'Open work permit - any employer',
    category: 'work_permit',
    workAuthType: 'any_employer',
    maxDuration: 'Varies',
    keyDatesToTrack: ['Permit Expiry'],
  },
  PGWP: {
    type: 'PGWP',
    label: 'PGWP',
    description: 'Post-Graduation Work Permit',
    category: 'work_permit',
    workAuthType: 'any_employer',
    maxDuration: '1-3 years',
    keyDatesToTrack: ['Permit Expiry'],
  },
  LMIA: {
    type: 'LMIA',
    label: 'LMIA-based',
    description: 'Work permit based on approved LMIA',
    category: 'work_permit',
    workAuthType: 'employer_specific',
    maxDuration: 'Per LMIA',
    keyDatesToTrack: ['Permit Expiry', 'LMIA Expiry'],
  },
  IEC: {
    type: 'IEC',
    label: 'IEC',
    description: 'International Experience Canada',
    category: 'work_permit',
    workAuthType: 'any_employer',
    maxDuration: '1-2 years',
    keyDatesToTrack: ['Permit Expiry'],
  },
  BRIDGING_OWP: {
    type: 'BRIDGING_OWP',
    label: 'Bridging OWP',
    description: 'Bridging Open Work Permit (PR pending)',
    category: 'transitional',
    workAuthType: 'any_employer',
    maxDuration: 'Until PR decision',
    keyDatesToTrack: ['PR Application Status'],
  },
};

// ==========================================
// UNIFIED WORK AUTHORIZATION
// ==========================================

/**
 * Country for work authorization
 */
export type WorkAuthCountry = 'US' | 'CA';

/**
 * Combined work authorization type
 */
export type WorkAuthType = USVisaType | CanadaWorkAuth;

/**
 * Work Authorization Status
 */
export interface WorkAuthorization {
  id: string;
  candidateId: string;
  country: WorkAuthCountry;
  authType: WorkAuthType;
  startDate?: Date;
  expiryDate?: Date;
  status: WorkAuthStatus;
  sponsorshipRequired: boolean;
  documentsOnFile: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Work Authorization Status
 */
export type WorkAuthStatus =
  | 'valid'          // Currently valid
  | 'expiring_soon'  // Expiring within 90 days
  | 'expired'        // Already expired
  | 'pending'        // Application pending
  | 'in_renewal';    // Renewal in progress

// ==========================================
// VISA ALERT LEVELS
// ==========================================

/**
 * Immigration Alert Level
 */
export type ImmigrationAlertLevel =
  | 'green'    // Valid (> 180 days)
  | 'yellow'   // Monitor (90-180 days)
  | 'orange'   // Warning (30-90 days)
  | 'red'      // Critical (< 30 days)
  | 'black';   // Expired

/**
 * Immigration Alert Configuration
 */
export const IMMIGRATION_ALERT_CONFIG: Record<ImmigrationAlertLevel, { days: number; label: string; action: string }> = {
  green: {
    days: 180,
    label: 'Valid',
    action: 'No action needed',
  },
  yellow: {
    days: 90,
    label: 'Monitor',
    action: 'Start renewal planning',
  },
  orange: {
    days: 30,
    label: 'Warning',
    action: 'Initiate renewal process',
  },
  red: {
    days: 0,
    label: 'Critical',
    action: 'Escalate to Legal + HR',
  },
  black: {
    days: -1,
    label: 'Expired',
    action: 'Cannot work, immediate escalation',
  },
};

/**
 * Calculate immigration alert level from expiry date
 */
export function calculateAlertLevel(expiryDate: Date | null | undefined): ImmigrationAlertLevel {
  if (!expiryDate) return 'green'; // No expiry = permanent (citizen/GC)
  
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'black';
  if (daysUntilExpiry < 30) return 'red';
  if (daysUntilExpiry < 90) return 'orange';
  if (daysUntilExpiry < 180) return 'yellow';
  return 'green';
}

