'use client';

/**
 * Quick Activity Patterns Widget
 *
 * Displays a grid of quick-action buttons for creating common activity types.
 * Used in the activities list screen to enable fast activity creation.
 */

import React from 'react';
import {
  UserSearch,
  UserCog,
  Megaphone,
  Send,
  Calendar,
  Globe,
  Building2,
  CheckCircle,
  Plus,
  Phone,
  Mail,
  Users,
  FileText,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface ActivityPattern {
  id: string;
  label: string;
  icon: string;
  activityType: string;
  description?: string;
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  UserSearch,
  UserCog,
  Megaphone,
  Send,
  Calendar,
  Globe,
  Building2,
  CheckCircle,
  Plus,
  Phone,
  Mail,
  Users,
  FileText,
  Clock,
};

// Activity type colors for visual distinction
const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  task: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700',
  call: 'hover:bg-green-50 hover:border-green-200 hover:text-green-700',
  email: 'hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700',
  meeting: 'hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700',
  follow_up: 'hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700',
  submission: 'hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700',
  review: 'hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700',
};

function PatternButton({
  pattern,
  onClick,
}: {
  pattern: ActivityPattern;
  onClick: () => void;
}) {
  const Icon = ICON_MAP[pattern.icon] || FileText;
  const colorClass = ACTIVITY_TYPE_COLORS[pattern.activityType] || ACTIVITY_TYPE_COLORS.task;

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center h-auto py-3 px-4 gap-2',
        'transition-all duration-200 border-charcoal-200',
        colorClass
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium text-center leading-tight">
        {pattern.label}
      </span>
    </Button>
  );
}

export function QuickActivityPatterns({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;

  // Get patterns from componentProps in definition
  const componentProps = definition.componentProps as { patterns?: ActivityPattern[] } | undefined;
  const patterns = componentProps?.patterns || [];

  const handlePatternClick = (pattern: ActivityPattern) => {
    // TODO: Open create activity modal with pre-filled type
    console.log('Create activity:', pattern);
    // This could dispatch an event or call a context method to open a modal
    // For now, we'll log the action
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {definition.title && (
          <h3 className="text-sm font-medium text-charcoal-600">
            {typeof definition.title === 'string' ? definition.title : 'Quick Create'}
          </h3>
        )}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {definition.title && (
        <h3 className="text-sm font-medium text-charcoal-600">
          {typeof definition.title === 'string' ? definition.title : 'Quick Create'}
        </h3>
      )}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {patterns.map((pattern) => (
          <PatternButton
            key={pattern.id}
            pattern={pattern}
            onClick={() => handlePatternClick(pattern)}
          />
        ))}
      </div>
    </div>
  );
}

export default QuickActivityPatterns;
