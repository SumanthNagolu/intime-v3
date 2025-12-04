'use client';

/**
 * Marketing Profile Grid Widget
 *
 * Displays consultant marketing profiles in a card grid layout
 * with profile details, skills, visa status, and rate information.
 */

import React from 'react';
import { MapPin, DollarSign, Eye, Edit, FileText, ListPlus, Download, Calendar, CreditCard, Megaphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface MarketingProfile {
  id: string;
  consultantId: string;
  headline: string;
  summary: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: number;
  updatedAt: string | Date;
  consultant: {
    id?: string;
    fullName: string;
    title: string;
    avatarUrl?: string | null;
    location: string;
    visaStatus: string;
    minimumRate: number | null;
    targetRate: number | null;
    primarySkills: string[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-stone-100 text-stone-700 border-stone-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  archived: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
};

const VISA_DISPLAY: Record<string, string> = {
  usc: 'US Citizen',
  green_card: 'Green Card',
  gc_ead: 'GC EAD',
  h1b: 'H-1B',
  h1b_transfer: 'H-1B Transfer',
  h4_ead: 'H4 EAD',
  l1a: 'L-1A',
  l1b: 'L-1B',
  l2_ead: 'L2 EAD',
  opt: 'OPT',
  opt_stem: 'OPT STEM',
  cpt: 'CPT',
  tn: 'TN',
  e3: 'E-3',
  o1: 'O-1',
  unknown: 'Unknown',
};

function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function ProfileCard({ profile }: { profile: MarketingProfile }) {
  const initials = profile.consultant.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const rateDisplay = profile.consultant.targetRate
    ? `$${profile.consultant.targetRate}/hr`
    : profile.consultant.minimumRate
    ? `$${profile.consultant.minimumRate}+/hr`
    : 'Rate TBD';

  return (
    <div className="p-4 rounded-lg border border-charcoal-100 bg-white hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          {profile.consultant.avatarUrl ? (
            <img
              src={profile.consultant.avatarUrl}
              alt={profile.consultant.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-goldfinch-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-goldfinch-700">{initials}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-charcoal-900 truncate">
            {profile.consultant.fullName}
          </h4>
          <p className="text-xs text-charcoal-500 truncate">{profile.consultant.title}</p>
        </div>
        <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[profile.status])}>
          {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
        </Badge>
      </div>

      {/* Headline */}
      {profile.headline && (
        <p className="text-xs text-charcoal-600 line-clamp-2 mb-3">
          {profile.headline}
        </p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
          <span className="truncate">{profile.consultant.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <CreditCard className="w-3.5 h-3.5 text-charcoal-400" />
          <span>{VISA_DISPLAY[profile.consultant.visaStatus] || profile.consultant.visaStatus}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <DollarSign className="w-3.5 h-3.5 text-charcoal-400" />
          <span>{rateDisplay}</span>
        </div>
      </div>

      {/* Skills */}
      {profile.consultant.primarySkills && profile.consultant.primarySkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {profile.consultant.primarySkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs bg-charcoal-50 text-charcoal-600 rounded"
            >
              {skill}
            </span>
          ))}
          {profile.consultant.primarySkills.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-charcoal-50 text-charcoal-500 rounded">
              +{profile.consultant.primarySkills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs border-t border-charcoal-100 pt-3 mb-3">
        <div className="flex items-center gap-1 text-charcoal-500">
          <Megaphone className="w-3 h-3" />
          <span>v{profile.version}</span>
        </div>
        <div className="flex items-center gap-1 text-charcoal-500">
          <Calendar className="w-3 h-3" />
          <span>{formatRelativeTime(profile.updatedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
          asChild
        >
          <Link href={`/employee/bench/marketing/${profile.id}`}>
            <Eye className="w-3 h-3 mr-1" />
            View
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
          asChild
        >
          <Link href={`/employee/bench/marketing/${profile.id}/edit`}>
            <Edit className="w-3 h-3" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function MarketingProfileGrid({ definition, data, context }: SectionWidgetProps) {
  // Data can be either the profiles array directly or an object with items property
  const rawData = data as MarketingProfile[] | { items?: MarketingProfile[] } | undefined;
  const profiles = Array.isArray(rawData) ? rawData : rawData?.items;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-6 w-44 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
            {(typeof definition.title === 'string' ? definition.title : 'Marketing Profiles') || 'Marketing Profiles'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {profiles && profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-charcoal-400">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No marketing profiles yet</p>
            <p className="text-xs mt-1">Create a profile to start marketing consultants</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MarketingProfileGrid;
