/**
 * TalentSidebarContent Component
 *
 * Sidebar content for talent workspace including profile card,
 * availability status, skills summary, and quick actions.
 */

'use client';

import React from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Globe,
  Briefcase,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface TalentSidebarData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  candidateLocation?: string | null;
  candidateCurrentVisa?: string | null;
  candidateHourlyRate?: number | null;
  candidateSkills?: string[] | null;
  candidateExperienceYears?: number | null;
  candidateAvailability?: string | null;
  candidateStatus?: string | null;
  candidateTitle?: string | null;
  createdAt?: Date | string | null;
}

export interface TalentSidebarContentProps {
  talent: TalentSidebarData;
  onEdit?: () => void;
  onEmail?: () => void;
  onCall?: () => void;
  className?: string;
}

// =====================================================
// COLORS
// =====================================================

const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700 border-blue-200',
  GC: 'bg-green-100 text-green-700 border-green-200',
  USC: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  OPT: 'bg-amber-100 text-amber-700 border-amber-200',
  CPT: 'bg-orange-100 text-orange-700 border-orange-200',
  TN: 'bg-purple-100 text-purple-700 border-purple-200',
  L1: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  EAD: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-stone-100 text-stone-700 border-stone-200',
  placed: 'bg-blue-100 text-blue-700 border-blue-200',
  do_not_contact: 'bg-red-100 text-red-700 border-red-200',
  blacklisted: 'bg-red-100 text-red-700 border-red-200',
};

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  immediate: { label: 'Immediate', color: 'bg-green-50 text-green-700 border-green-200' },
  '2_weeks': { label: '2 Weeks', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  '1_month': { label: '1 Month', color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function TalentSidebarContent({
  talent,
  onEdit,
  onEmail,
  onCall,
  className,
}: TalentSidebarContentProps) {
  const initials = `${talent.firstName?.[0] || ''}${talent.lastName?.[0] || ''}`.toUpperCase();
  const availability = talent.candidateAvailability
    ? AVAILABILITY_CONFIG[talent.candidateAvailability]
    : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-rust/80 to-rust/60" />
        <div className="px-6 pb-6 -mt-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
            <span className="text-2xl font-bold text-rust">{initials}</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-charcoal text-center mb-1">
            {talent.fullName}
          </h1>
          {talent.candidateTitle && (
            <p className="text-sm text-stone-500 text-center mb-3">
              {talent.candidateTitle}
            </p>
          )}

          {/* Status Badges */}
          <div className="flex justify-center gap-2 flex-wrap">
            {talent.candidateStatus && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-bold',
                  STATUS_COLORS[talent.candidateStatus] || STATUS_COLORS.active
                )}
              >
                {talent.candidateStatus.replace(/_/g, ' ')}
              </Badge>
            )}
            {talent.candidateCurrentVisa && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-bold',
                  VISA_COLORS[talent.candidateCurrentVisa] || VISA_COLORS.Other
                )}
              >
                {talent.candidateCurrentVisa}
              </Badge>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm border-t border-stone-100 pt-4 mt-4">
            <div className="flex items-center gap-2 text-stone-600">
              <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <a
                href={`mailto:${talent.email}`}
                className="hover:text-rust transition-colors truncate"
              >
                {talent.email}
              </a>
            </div>
            {talent.phone && (
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <a
                  href={`tel:${talent.phone}`}
                  className="hover:text-rust transition-colors"
                >
                  {talent.phone}
                </a>
              </div>
            )}
            {talent.candidateLocation && (
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>{talent.candidateLocation}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            {onEmail && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onEmail}
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            )}
            {onCall && talent.phone && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onCall}
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Availability Card */}
      {availability && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Availability
            </span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <Badge
            variant="outline"
            className={cn('text-sm font-bold', availability.color)}
          >
            {availability.label}
          </Badge>
        </div>
      )}

      {/* Rate Card */}
      {talent.candidateHourlyRate && (
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Hourly Rate
            </span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-serif font-bold">
            ${talent.candidateHourlyRate}/hr
          </div>
        </div>
      )}

      {/* Experience Card */}
      {talent.candidateExperienceYears && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Experience
            </span>
            <Briefcase className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-charcoal">
            {talent.candidateExperienceYears} years
          </div>
        </div>
      )}

      {/* Top Skills Card */}
      {(talent.candidateSkills?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Top Skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {talent.candidateSkills?.slice(0, 6).map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-rust/10 text-rust border-rust/20 text-xs"
              >
                {skill}
              </Badge>
            ))}
            {(talent.candidateSkills?.length ?? 0) > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{talent.candidateSkills!.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Member Since */}
      {talent.createdAt && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              Added {new Date(talent.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TalentSidebarContent;
