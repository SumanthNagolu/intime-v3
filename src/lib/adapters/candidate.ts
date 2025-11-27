/**
 * Candidate Type Adapter
 *
 * Transforms between database UserProfile/Candidate type and frontend display type.
 */

import type {
  AlignedCandidate,
  DisplayCandidate,
  CandidateStatus,
  CandidateAvailability,
} from '@/types/aligned/ats';

// ============================================
// DATABASE TO FRONTEND
// ============================================

export function dbCandidateToDisplay(
  candidate: AlignedCandidate,
  options?: {
    matchScore?: number;
    source?: DisplayCandidate['source'];
    ownerId?: string;
  }
): DisplayCandidate {
  return {
    id: candidate.id,
    name: candidate.fullName,
    role: candidate.employeePosition || 'Candidate',
    status: mapCandidateStatus(candidate.candidateStatus),
    type: determineCandidateType(candidate),
    skills: candidate.candidateSkills || [],
    experience: formatExperience(candidate.candidateExperienceYears),
    location: candidate.candidateLocation || '',
    rate: formatHourlyRate(candidate.candidateHourlyRate),
    email: candidate.email,
    score: options?.matchScore || 0,
    notes: undefined,
    source: options?.source,
    ownerId: options?.ownerId,
    // Extended fields
    phone: candidate.phone || undefined,
    resumeUrl: candidate.candidateResumeUrl || undefined,
    visaStatus: candidate.candidateCurrentVisa || undefined,
    visaExpiry: candidate.candidateVisaExpiry?.toISOString().split('T')[0],
    availability: formatAvailability(candidate.candidateAvailability),
    willingToRelocate: candidate.candidateWillingToRelocate,
  };
}

export function dbCandidatesToDisplay(
  candidates: AlignedCandidate[],
  scoresMap?: Map<string, number>
): DisplayCandidate[] {
  return candidates.map(candidate =>
    dbCandidateToDisplay(candidate, {
      matchScore: scoresMap?.get(candidate.id),
    })
  );
}

// ============================================
// FRONTEND TO DATABASE
// ============================================

export interface CreateCandidateInput {
  email: string;
  fullName: string;
  phone?: string;
  skills?: string[];
  experienceYears?: number;
  location?: string;
  hourlyRate?: number;
  resumeUrl?: string;
  currentVisa?: string;
  availability?: 'immediate' | '2_weeks' | '1_month';
  willingToRelocate?: boolean;
  position?: string;
}

export function displayCandidateToDb(
  input: CreateCandidateInput,
  ctx: { orgId: string; userId: string }
): Partial<AlignedCandidate> {
  return {
    orgId: ctx.orgId,
    email: input.email,
    fullName: input.fullName,
    phone: input.phone || null,
    candidateStatus: 'active',
    candidateSkills: input.skills || [],
    candidateExperienceYears: input.experienceYears || null,
    candidateLocation: input.location || null,
    candidateHourlyRate: input.hourlyRate || null,
    candidateResumeUrl: input.resumeUrl || null,
    candidateCurrentVisa: parseVisaType(input.currentVisa),
    candidateAvailability: input.availability || null,
    candidateWillingToRelocate: input.willingToRelocate || false,
    employeePosition: input.position || null,
    isActive: true,
  };
}

// ============================================
// STATUS MAPPING
// ============================================

function mapCandidateStatus(
  status: CandidateStatus | null | undefined
): DisplayCandidate['status'] {
  if (!status) return 'active';

  const map: Record<CandidateStatus, DisplayCandidate['status']> = {
    'active': 'active',
    'placed': 'placed',
    'bench': 'bench',
    'inactive': 'alumni',
    'blacklisted': 'blacklisted',
  };

  return map[status] || 'active';
}

export function displayStatusToDb(
  status: DisplayCandidate['status']
): CandidateStatus {
  const map: Record<DisplayCandidate['status'], CandidateStatus> = {
    'new': 'active',
    'active': 'active',
    'placed': 'placed',
    'bench': 'bench',
    'student': 'active',
    'alumni': 'inactive',
    'blacklisted': 'blacklisted',
  };

  return map[status] || 'active';
}

// ============================================
// TYPE DETERMINATION
// ============================================

function determineCandidateType(
  candidate: AlignedCandidate
): DisplayCandidate['type'] {
  // Check if they have student enrollment data
  // (This would require additional fields in the candidate object)
  // For now, base it on status
  if (candidate.candidateStatus === 'bench') {
    return 'internal_bench';
  }

  // Default to external
  return 'external';
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatExperience(years: number | null | undefined): string {
  if (!years && years !== 0) return 'N/A';
  if (years === 0) return 'Entry Level';
  if (years === 1) return '1 year';
  return `${years} years`;
}

export function formatHourlyRate(rate: number | null | undefined): string {
  if (!rate) return 'N/A';
  return `$${rate.toLocaleString()}/hr`;
}

export function formatAvailability(
  availability: CandidateAvailability | null | undefined
): string | undefined {
  if (!availability) return undefined;

  const map: Record<CandidateAvailability, string> = {
    'immediate': 'Immediate',
    '2_weeks': '2 Weeks Notice',
    '1_month': '1 Month Notice',
  };

  return map[availability];
}

function parseVisaType(visa?: string | null): AlignedCandidate['candidateCurrentVisa'] {
  if (!visa) return null;

  const validVisas = ['H1B', 'GC', 'USC', 'OPT', 'CPT', 'TN', 'L1', 'EAD'];
  const normalized = visa.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (validVisas.includes(normalized)) {
    return normalized as AlignedCandidate['candidateCurrentVisa'];
  }

  return null;
}

// ============================================
// SKILL FORMATTING
// ============================================

export function formatSkillsList(
  skills: string[] | null | undefined,
  maxDisplay: number = 5
): { displayed: string[]; remaining: number } {
  if (!skills || skills.length === 0) {
    return { displayed: [], remaining: 0 };
  }

  return {
    displayed: skills.slice(0, maxDisplay),
    remaining: Math.max(0, skills.length - maxDisplay),
  };
}

// ============================================
// BENCH CANDIDATE ADAPTER
// ============================================

export interface DisplayBenchCandidate extends DisplayCandidate {
  daysOnBench: number;
  lastContact: string;
  benchStartDate?: string;
  benchStatus?: string;
}

export function dbCandidateToBenchDisplay(
  candidate: AlignedCandidate,
  benchMetadata?: {
    daysOnBench: number;
    lastContactedAt: Date | null;
    benchStartDate: Date;
    benchStatus: string;
  }
): DisplayBenchCandidate {
  const base = dbCandidateToDisplay(candidate);

  return {
    ...base,
    daysOnBench: benchMetadata?.daysOnBench || 0,
    lastContact: benchMetadata?.lastContactedAt?.toISOString() || '',
    benchStartDate: benchMetadata?.benchStartDate?.toISOString().split('T')[0],
    benchStatus: benchMetadata?.benchStatus,
  };
}

// ============================================
// UTILITY EXPORTS
// ============================================

export const candidateAdapter = {
  toDisplay: dbCandidateToDisplay,
  toDisplayList: dbCandidatesToDisplay,
  toBenchDisplay: dbCandidateToBenchDisplay,
  toDb: displayCandidateToDb,
  formatExperience,
  formatHourlyRate,
  formatAvailability,
  formatSkillsList,
};
