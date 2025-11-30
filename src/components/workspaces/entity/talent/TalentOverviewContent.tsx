/**
 * TalentOverviewContent Component
 *
 * Displays talent/candidate overview with contact info, professional details,
 * skills, and work authorization.
 */

'use client';

import React from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Globe,
  Award,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MetricsGrid, type MetricItem } from '../../sections/MetricsGrid';
import { InfoCard, type InfoCardField } from '../../sections/InfoCard';

// =====================================================
// TYPES
// =====================================================

export interface TalentProfileData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  candidateLocation?: string | null;
  candidateCurrentVisa?: string | null;
  candidateHourlyRate?: number | null;
  candidateAnnualSalary?: number | null;
  candidateSkills?: string[] | null;
  candidateExperienceYears?: number | null;
  candidateAvailability?: string | null;
  candidateWillingToRelocate?: boolean | null;
  candidateStatus?: string | null;
  candidateTitle?: string | null;
  candidateLinkedin?: string | null;
  candidatePortfolio?: string | null;
  candidateEducation?: string | null;
  candidateCertifications?: string[] | null;
  createdAt?: Date | string | null;
}

export interface TalentMetrics {
  totalSubmissions?: number;
  activeSubmissions?: number;
  interviewsCompleted?: number;
  placedCount?: number;
}

export interface TalentOverviewContentProps {
  talent: TalentProfileData;
  metrics?: TalentMetrics | null;
  onEdit?: () => void;
  className?: string;
}

// =====================================================
// COLORS
// =====================================================

const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700',
  GC: 'bg-green-100 text-green-700',
  USC: 'bg-emerald-100 text-emerald-700',
  OPT: 'bg-amber-100 text-amber-700',
  CPT: 'bg-orange-100 text-orange-700',
  TN: 'bg-purple-100 text-purple-700',
  L1: 'bg-indigo-100 text-indigo-700',
  EAD: 'bg-cyan-100 text-cyan-700',
  Other: 'bg-gray-100 text-gray-700',
};

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  immediate: { label: 'Immediate', color: 'bg-green-100 text-green-700' },
  '2_weeks': { label: '2 Weeks', color: 'bg-amber-100 text-amber-700' },
  '1_month': { label: '1 Month', color: 'bg-orange-100 text-orange-700' },
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function TalentOverviewContent({
  talent,
  metrics,
  onEdit,
  className,
}: TalentOverviewContentProps) {
  // Build metrics for grid
  const overviewMetrics: MetricItem[] = [
    {
      label: 'Submissions',
      value: metrics?.totalSubmissions ?? 0,
      icon: Briefcase,
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active',
      value: metrics?.activeSubmissions ?? 0,
      icon: Clock,
      bgColor: 'bg-green-100',
    },
    {
      label: 'Interviews',
      value: metrics?.interviewsCompleted ?? 0,
      icon: Calendar,
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Placements',
      value: metrics?.placedCount ?? 0,
      icon: Award,
      bgColor: 'bg-amber-100',
    },
  ];

  // Contact fields
  const contactFields: InfoCardField[] = [
    {
      label: 'Email',
      value: talent.email,
      icon: Mail,
    },
    {
      label: 'Phone',
      value: talent.phone || 'Not provided',
      icon: Phone,
    },
    {
      label: 'Location',
      value: talent.candidateLocation || 'Not specified',
      icon: MapPin,
    },
  ];

  // Professional fields
  const professionalFields: InfoCardField[] = [
    {
      label: 'Job Title',
      value: talent.candidateTitle || 'Not specified',
      icon: Briefcase,
    },
    {
      label: 'Experience',
      value: talent.candidateExperienceYears
        ? `${talent.candidateExperienceYears} years`
        : 'Not specified',
      icon: Clock,
    },
    {
      label: 'Education',
      value: talent.candidateEducation || 'Not specified',
      icon: GraduationCap,
    },
  ];

  // Compensation fields
  const compensationFields: InfoCardField[] = [
    {
      label: 'Hourly Rate',
      value: talent.candidateHourlyRate
        ? `$${talent.candidateHourlyRate}/hr`
        : 'Not specified',
      icon: DollarSign,
    },
    {
      label: 'Annual Salary',
      value: talent.candidateAnnualSalary
        ? `$${talent.candidateAnnualSalary.toLocaleString()}/yr`
        : 'Not specified',
      icon: DollarSign,
    },
  ];

  // Work Authorization fields
  const availability = talent.candidateAvailability
    ? AVAILABILITY_CONFIG[talent.candidateAvailability]
    : null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Key Metrics */}
      <MetricsGrid items={overviewMetrics} columns={4} />

      {/* Contact & Professional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard
          title="Contact Information"
          fields={contactFields}
          icon={User}
          onEdit={onEdit}
        />
        <InfoCard
          title="Professional Details"
          fields={professionalFields}
          icon={Briefcase}
          onEdit={onEdit}
        />
      </div>

      {/* Work Authorization & Compensation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Authorization Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-stone-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Work Authorization
            </h3>
          </div>
          <div className="space-y-4">
            {/* Visa Status */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                Visa Status
              </p>
              {talent.candidateCurrentVisa ? (
                <Badge
                  className={cn(
                    'text-sm font-bold',
                    VISA_COLORS[talent.candidateCurrentVisa] || VISA_COLORS.Other
                  )}
                >
                  {talent.candidateCurrentVisa}
                </Badge>
              ) : (
                <span className="text-sm text-stone-500">Not specified</span>
              )}
            </div>

            {/* Availability */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                Availability
              </p>
              {availability ? (
                <Badge className={cn('text-sm font-bold', availability.color)}>
                  {availability.label}
                </Badge>
              ) : (
                <span className="text-sm text-stone-500">Not specified</span>
              )}
            </div>

            {/* Willing to Relocate */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                Willing to Relocate
              </p>
              <span className="text-sm text-charcoal font-medium">
                {talent.candidateWillingToRelocate ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <InfoCard
          title="Compensation"
          fields={compensationFields}
          icon={DollarSign}
          onEdit={onEdit}
        />
      </div>

      {/* Skills */}
      {(talent.candidateSkills?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {talent.candidateSkills?.map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-rust/10 text-rust border-rust/20"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {(talent.candidateCertifications?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-stone-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Certifications
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {talent.candidateCertifications?.map((cert, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-amber-100 text-amber-700"
              >
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {(talent.candidateLinkedin || talent.candidatePortfolio) && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">
            Links
          </h3>
          <div className="flex flex-wrap gap-4">
            {talent.candidateLinkedin && (
              <a
                href={talent.candidateLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Building2 className="w-4 h-4" />
                LinkedIn Profile
              </a>
            )}
            {talent.candidatePortfolio && (
              <a
                href={talent.candidatePortfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Globe className="w-4 h-4" />
                Portfolio
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TalentOverviewContent;
