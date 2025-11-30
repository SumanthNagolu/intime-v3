/**
 * Account Type Adapter
 *
 * Transforms between database Account type and frontend display type.
 */

import type {
  AlignedAccount,
  DisplayAccount,
  AlignedPointOfContact,
  DisplayPointOfContact,
  AccountStatus,
  AccountType,
  AccountTier,
  Responsiveness,
  PreferredQuality,
  DecisionAuthority,
  ContactMethod,
  AlignedActivityLog,
} from '@/types/aligned/crm';

// ============================================
// ACCOUNT: DATABASE TO FRONTEND
// ============================================

export function dbAccountToDisplay(
  account: AlignedAccount | Record<string, unknown>,
  options?: {
    pocs?: AlignedPointOfContact[];
    activities?: AlignedActivityLog[];
  }
): DisplayAccount {
  // Support both AlignedAccount properties and raw database properties
  const rawAccount = account as Record<string, unknown>;
  const pocs = options?.pocs || (rawAccount.pocs as AlignedPointOfContact[] | undefined) || [];
  const activities = options?.activities || [];

  // Handle both property naming conventions (database vs aligned)
  const status = (rawAccount.status ?? rawAccount.accountStatus) as AccountStatus | undefined;
  const companyType = (rawAccount.companyType ?? rawAccount.type) as AccountType | undefined;
  const accountManagerId = (rawAccount.accountManagerId ?? rawAccount.ownerId) as string | null | undefined;
  const responsiveness = rawAccount.responsiveness as Responsiveness | null | undefined;
  const preferredQuality = rawAccount.preferredQuality as PreferredQuality | null | undefined;
  const tier = rawAccount.tier as AccountTier | string | null | undefined;
  const contractStartDate = rawAccount.contractStartDate as Date | null | undefined;
  const contractEndDate = rawAccount.contractEndDate as Date | null | undefined;
  const _count = rawAccount._count as { jobs?: number; placements?: number; deals?: number } | undefined;

  return {
    id: rawAccount.id as string,
    name: rawAccount.name as string,
    industry: (rawAccount.industry as string) || '',
    status: mapAccountStatusToFrontend(status || 'prospect'),
    type: mapAccountTypeToFrontend(companyType || 'direct_client'),
    accountManagerId: accountManagerId || '',
    logo: undefined, // Would need to be added to schema
    responsiveness: mapResponsivenessToFrontend(responsiveness ?? null),
    preference: mapPreferredQualityToFrontend(preferredQuality ?? null),
    description: (rawAccount.description as string | null) || undefined,
    pocs: pocs.map(dbPocToDisplay),
    activityLog: activities.map(activity => ({
      date: activity.activityDate.toISOString(),
      action: activity.activityType,
      note: activity.description || undefined,
    })),
    // Extended fields
    tier: (tier as string) || undefined,
    contractStartDate: contractStartDate instanceof Date ? contractStartDate.toISOString().split('T')[0] : undefined,
    contractEndDate: contractEndDate instanceof Date ? contractEndDate.toISOString().split('T')[0] : undefined,
    paymentTermsDays: rawAccount.paymentTermsDays as number | undefined,
    markupPercentage: rawAccount.markupPercentage != null ? Number(rawAccount.markupPercentage) : undefined,
    jobsCount: _count?.jobs,
    placementsCount: _count?.placements,
    // Contact info
    website: (rawAccount.website as string | null) || undefined,
    phone: (rawAccount.phone as string | null) || undefined,
    headquartersLocation: (rawAccount.headquartersLocation as string | null) || undefined,
    preferredQuality: (preferredQuality as string) || undefined,
  };
}

export function dbAccountsToDisplay(accounts: AlignedAccount[]): DisplayAccount[] {
  return accounts.map(account => dbAccountToDisplay(account));
}

// ============================================
// ACCOUNT: FRONTEND TO DATABASE
// ============================================

export interface CreateAccountInput {
  name: string;
  industry?: string;
  status?: DisplayAccount['status'];
  type?: DisplayAccount['type'];
  accountManagerId?: string;
  responsiveness?: DisplayAccount['responsiveness'];
  preference?: DisplayAccount['preference'];
  description?: string;
  website?: string;
  phone?: string;
  headquartersLocation?: string;
  tier?: string;
  paymentTermsDays?: number;
  markupPercentage?: number;
}

export function displayAccountToDb(
  input: CreateAccountInput,
  ctx: { orgId: string; userId: string }
): Partial<AlignedAccount> {
  return {
    orgId: ctx.orgId,
    name: input.name,
    industry: input.industry || null,
    accountStatus: mapFrontendStatusToDb(input.status),
    companyType: mapFrontendTypeToDb(input.type),
    ownerId: input.accountManagerId || ctx.userId,
    responsiveness: mapFrontendResponsivenessToDb(input.responsiveness),
    preferredQuality: mapFrontendPreferredQualityToDb(input.preference),
    description: input.description || null,
    website: input.website || null,
    phone: input.phone || null,
    headquartersLocation: input.headquartersLocation || null,
    tier: input.tier as AlignedAccount['tier'] || null,
    paymentTermsDays: input.paymentTermsDays || 30,
    markupPercentage: input.markupPercentage || null,
    createdBy: ctx.userId,
  };
}

// ============================================
// STATUS MAPPING
// ============================================

function mapAccountStatusToFrontend(status: AccountStatus): DisplayAccount['status'] {
  const map: Record<AccountStatus, DisplayAccount['status']> = {
    'prospect': 'Prospect',
    'active': 'Active',
    'inactive': 'Hold',
    'churned': 'Churned',
  };
  return map[status] || 'Prospect';
}

function mapFrontendStatusToDb(status?: DisplayAccount['status']): AccountStatus {
  if (!status) return 'prospect';

  const map: Record<DisplayAccount['status'], AccountStatus> = {
    'Prospect': 'prospect',
    'Active': 'active',
    'Hold': 'inactive',
    'Churned': 'churned',
  };
  return map[status] || 'prospect';
}

// ============================================
// TYPE MAPPING
// ============================================

function mapAccountTypeToFrontend(type: AccountType): DisplayAccount['type'] {
  const map: Record<AccountType, DisplayAccount['type']> = {
    'direct_client': 'Direct Client',
    'vendor': 'MSP/VMS',
    'partner': 'Implementation Partner',
    'prospect': 'Direct Client',
  };
  return map[type] || 'Direct Client';
}

function mapFrontendTypeToDb(type?: DisplayAccount['type']): AccountType {
  if (!type) return 'direct_client';

  const map: Record<DisplayAccount['type'], AccountType> = {
    'Direct Client': 'direct_client',
    'MSP/VMS': 'vendor',
    'Implementation Partner': 'partner',
  };
  return map[type] || 'direct_client';
}

// ============================================
// RESPONSIVENESS MAPPING
// ============================================

function mapResponsivenessToFrontend(
  responsiveness: Responsiveness | null
): DisplayAccount['responsiveness'] {
  if (!responsiveness) return 'Medium';

  const map: Record<Responsiveness, DisplayAccount['responsiveness']> = {
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
  };
  return map[responsiveness] || 'Medium';
}

function mapFrontendResponsivenessToDb(
  responsiveness?: DisplayAccount['responsiveness']
): Responsiveness | null {
  if (!responsiveness) return null;

  const map: Record<DisplayAccount['responsiveness'], Responsiveness> = {
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low',
  };
  return map[responsiveness] || 'medium';
}

// ============================================
// PREFERRED QUALITY MAPPING
// ============================================

function mapPreferredQualityToFrontend(
  quality: PreferredQuality | null
): DisplayAccount['preference'] {
  if (!quality) return 'Quality';

  const map: Record<PreferredQuality, DisplayAccount['preference']> = {
    'premium': 'Quality',
    'standard': 'Speed',
    'budget': 'Quantity',
  };
  return map[quality] || 'Quality';
}

function mapFrontendPreferredQualityToDb(
  preference?: DisplayAccount['preference']
): PreferredQuality | null {
  if (!preference) return null;

  const map: Record<DisplayAccount['preference'], PreferredQuality> = {
    'Quality': 'premium',
    'Speed': 'standard',
    'Quantity': 'budget',
  };
  return map[preference] || 'standard';
}

// ============================================
// POC: DATABASE TO FRONTEND
// ============================================

export function dbPocToDisplay(poc: AlignedPointOfContact): DisplayPointOfContact {
  return {
    id: poc.id,
    name: `${poc.firstName} ${poc.lastName}`,
    role: poc.title || poc.role || '',
    email: poc.email,
    phone: poc.phone || undefined,
    preference: mapContactMethodToFrontend(poc.preferredContactMethod),
    influence: mapDecisionAuthorityToFrontend(poc.decisionAuthority),
    // Extended fields
    firstName: poc.firstName,
    lastName: poc.lastName,
    title: poc.title || undefined,
    isPrimary: poc.isPrimary,
    isActive: poc.isActive,
    decisionAuthority: poc.decisionAuthority || undefined,
    notes: poc.notes || undefined,
    linkedinUrl: poc.linkedinUrl || undefined,
  };
}

// ============================================
// POC: FRONTEND TO DATABASE
// ============================================

export interface CreatePOCInput {
  accountId: string;
  name: string;
  role?: string;
  email: string;
  phone?: string;
  preference?: DisplayPointOfContact['preference'];
  influence?: DisplayPointOfContact['influence'];
  isPrimary?: boolean;
}

export function displayPocToDb(
  input: CreatePOCInput,
  ctx: { orgId: string; userId: string }
): Partial<AlignedPointOfContact> {
  const [firstName, ...lastNameParts] = input.name.split(' ');
  const lastName = lastNameParts.join(' ') || firstName;

  return {
    accountId: input.accountId,
    orgId: ctx.orgId,
    firstName,
    lastName,
    title: input.role || null,
    email: input.email,
    phone: input.phone || null,
    preferredContactMethod: mapFrontendContactMethodToDb(input.preference),
    decisionAuthority: mapFrontendInfluenceToDb(input.influence),
    isPrimary: input.isPrimary || false,
    isActive: true,
    createdBy: ctx.userId,
  };
}

// ============================================
// CONTACT METHOD MAPPING
// ============================================

function mapContactMethodToFrontend(
  method: ContactMethod
): DisplayPointOfContact['preference'] {
  const map: Record<ContactMethod, DisplayPointOfContact['preference']> = {
    'email': 'Email',
    'phone': 'Phone',
    'linkedin': 'Email', // Map LinkedIn to Email for frontend
  };
  return map[method] || 'Email';
}

function mapFrontendContactMethodToDb(
  preference?: DisplayPointOfContact['preference']
): ContactMethod {
  const map: Record<DisplayPointOfContact['preference'], ContactMethod> = {
    'Email': 'email',
    'Phone': 'phone',
    'Text': 'phone',
  };
  return map[preference || 'Email'] || 'email';
}

// ============================================
// DECISION AUTHORITY MAPPING
// ============================================

function mapDecisionAuthorityToFrontend(
  authority: DecisionAuthority | null
): DisplayPointOfContact['influence'] {
  if (!authority) return 'Influencer';

  const map: Record<DecisionAuthority, DisplayPointOfContact['influence']> = {
    'none': 'Gatekeeper',
    'influencer': 'Influencer',
    'decision_maker': 'Decision Maker',
    'final_approver': 'Decision Maker',
  };
  return map[authority] || 'Influencer';
}

function mapFrontendInfluenceToDb(
  influence?: DisplayPointOfContact['influence']
): DecisionAuthority | null {
  if (!influence) return null;

  const map: Record<DisplayPointOfContact['influence'], DecisionAuthority> = {
    'Decision Maker': 'decision_maker',
    'Influencer': 'influencer',
    'Gatekeeper': 'none',
  };
  return map[influence] || 'influencer';
}

// ============================================
// TIER BADGE UTILITIES
// ============================================

export function getTierBadgeVariant(tier?: string | null): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (tier) {
    case 'platinum': return 'default';
    case 'gold': return 'secondary';
    case 'silver': return 'outline';
    case 'bronze': return 'destructive';
    default: return 'outline';
  }
}

export function getStatusBadgeVariant(status: DisplayAccount['status']): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'Active': return 'default';
    case 'Prospect': return 'secondary';
    case 'Hold': return 'outline';
    case 'Churned': return 'destructive';
    default: return 'outline';
  }
}

// ============================================
// UTILITY EXPORTS
// ============================================

export const accountAdapter = {
  toDisplay: dbAccountToDisplay,
  toDisplayList: dbAccountsToDisplay,
  toDb: displayAccountToDb,
  getTierBadgeVariant,
  getStatusBadgeVariant,
};

export const pocAdapter = {
  toDisplay: dbPocToDisplay,
  toDb: displayPocToDb,
};
