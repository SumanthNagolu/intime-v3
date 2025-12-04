'use client';

/**
 * Consultant Card Grid Widget
 *
 * Displays bench consultants in a card grid layout
 */

import React from 'react';
import { Calendar, MapPin, CreditCard, DollarSign, Send, Eye, Phone, Megaphone, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Consultant {
  id: string;
  candidateId: string;
  fullName: string;
  title: string;
  avatarUrl?: string | null;
  location: string;
  daysOnBench: number;
  benchStatus: 'green' | 'yellow' | 'orange' | 'red' | 'black';
  visaStatus: string;
  rateFormatted: string;
  activeSubmissions: number;
  lastContactDays: number;
  skills: string[];
}

const STATUS_COLORS: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  black: 'bg-charcoal-700',
};

const STATUS_BADGES: Record<string, string> = {
  green: 'bg-green-100 text-green-700 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  black: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
};

function ConsultantCard({ consultant }: { consultant: Consultant }) {
  const initials = consultant.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-4 rounded-lg border border-charcoal-100 bg-white hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          {consultant.avatarUrl ? (
            <img
              src={consultant.avatarUrl}
              alt={consultant.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-goldfinch-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-goldfinch-700">{initials}</span>
            </div>
          )}
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
              STATUS_COLORS[consultant.benchStatus]
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-charcoal-900 truncate">
            {consultant.fullName}
          </h4>
          <p className="text-xs text-charcoal-500 truncate">{consultant.title}</p>
        </div>
        <Badge variant="outline" className={cn('text-xs', STATUS_BADGES[consultant.benchStatus])}>
          {consultant.daysOnBench}d
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
          <span className="truncate">{consultant.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <CreditCard className="w-3.5 h-3.5 text-charcoal-400" />
          <span>{consultant.visaStatus}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <DollarSign className="w-3.5 h-3.5 text-charcoal-400" />
          <span>{consultant.rateFormatted}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-4">
        {consultant.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 text-xs bg-charcoal-50 text-charcoal-600 rounded"
          >
            {skill}
          </span>
        ))}
        {consultant.skills.length > 3 && (
          <span className="px-2 py-0.5 text-xs bg-charcoal-50 text-charcoal-500 rounded">
            +{consultant.skills.length - 3}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs border-t border-charcoal-100 pt-3 mb-3">
        <div className="flex items-center gap-1 text-charcoal-500">
          <Send className="w-3 h-3" />
          <span>{consultant.activeSubmissions} active</span>
        </div>
        <div className="flex items-center gap-1 text-charcoal-500">
          <Calendar className="w-3 h-3" />
          <span>{consultant.lastContactDays}d ago</span>
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
          <Link href={`/employee/bench/consultants/${consultant.id}`}>
            <Eye className="w-3 h-3 mr-1" />
            View
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
        >
          <Send className="w-3 h-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
        >
          <Phone className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function ConsultantCardGrid({ definition, data, context }: SectionWidgetProps) {
  const consultants = data as Consultant[] | undefined;
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-stone-100 rounded-lg animate-pulse" />
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
            {(typeof definition.title === 'string' ? definition.title : 'My Bench Consultants') || 'My Bench Consultants'}
          </CardTitle>
          <Link
            href="/employee/bench/consultants"
            className="text-sm text-goldfinch-600 hover:text-goldfinch-700"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {consultants && consultants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultants.slice(0, 6).map((consultant) => (
              <ConsultantCard key={consultant.id} consultant={consultant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-charcoal-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No consultants on your bench</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConsultantCardGrid;
