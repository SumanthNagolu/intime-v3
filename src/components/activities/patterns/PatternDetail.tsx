/**
 * Pattern Detail
 *
 * Full pattern information display component.
 */

'use client';

import React from 'react';
import { Clock, CheckSquare, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getPattern, getCategoryLabel, getCategoryColor } from '@/lib/activities/patterns';
import type { ActivityPattern, PatternField, ChecklistItem, PatternOutcome } from '@/lib/activities/patterns';
import type { Priority } from '@/lib/activities/sla';

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'bg-red-500',
  urgent: 'bg-orange-500',
  high: 'bg-amber-500',
  normal: 'bg-blue-500',
  low: 'bg-gray-400',
};

export interface PatternDetailProps {
  /** Pattern ID or pattern object */
  pattern: string | ActivityPattern;

  /** Show usage statistics */
  showUsageStats?: boolean;

  /** Usage count (for stats) */
  usageCount?: number;

  /** Compact mode */
  compact?: boolean;

  /** Additional className */
  className?: string;
}

export function PatternDetail({
  pattern: patternProp,
  showUsageStats = false,
  usageCount = 0,
  compact = false,
  className,
}: PatternDetailProps) {
  // Get pattern object
  const pattern = typeof patternProp === 'string'
    ? getPattern(patternProp)
    : patternProp;

  if (!pattern) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          Pattern not found
        </CardContent>
      </Card>
    );
  }

  const Icon = pattern.icon;

  if (compact) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', getCategoryColor(pattern.category))}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{pattern.name}</h3>
            <p className="text-sm text-muted-foreground">{pattern.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Badge className={cn('text-white', PRIORITY_COLORS[pattern.defaultPriority])}>
            {pattern.defaultPriority}
          </Badge>
          {pattern.slaTier && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {pattern.slaTier}h SLA
            </span>
          )}
          {pattern.checklist.length > 0 && (
            <span>{pattern.checklist.length} checklist items</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg', getCategoryColor(pattern.category))}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>{pattern.name}</CardTitle>
              <Badge variant="secondary" className={cn('text-xs', getCategoryColor(pattern.category))}>
                {getCategoryLabel(pattern.category)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{pattern.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Properties */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Priority */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Default Priority</p>
            <Badge className={cn('text-white', PRIORITY_COLORS[pattern.defaultPriority])}>
              {pattern.defaultPriority}
            </Badge>
          </div>

          {/* SLA */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">SLA Tier</p>
            <p className="font-medium">
              {pattern.slaTier ? `${pattern.slaTier} hours` : 'Default'}
            </p>
          </div>

          {/* Direction */}
          {pattern.direction && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Direction</p>
              <p className="font-medium capitalize">{pattern.direction}</p>
            </div>
          )}

          {/* Quick Log */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium">
              {pattern.quickLog ? 'Quick Log' : 'Standard'}
            </p>
          </div>
        </div>

        {/* Applicable Entities */}
        {pattern.applicableEntities && pattern.applicableEntities.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Applies To</h4>
              <div className="flex flex-wrap gap-2">
                {pattern.applicableEntities.map((entity) => (
                  <Badge key={entity} variant="outline" className="capitalize">
                    {entity}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Fields */}
        {pattern.fields.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Fields ({pattern.fields.length})
              </h4>
              <div className="grid gap-2">
                {pattern.fields.map((field) => (
                  <FieldItem key={field.id} field={field} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Checklist */}
        {pattern.checklist.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Checklist ({pattern.checklist.length})
              </h4>
              <div className="space-y-2">
                {pattern.checklist.map((item) => (
                  <ChecklistItemDisplay key={item.id} item={item} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Outcomes */}
        {pattern.outcomes.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3">Possible Outcomes</h4>
              <div className="grid gap-2">
                {pattern.outcomes.map((outcome) => (
                  <OutcomeItem key={outcome.id} outcome={outcome} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Usage Stats */}
        {showUsageStats && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Times used</span>
              <span className="font-medium text-foreground">{usageCount}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FieldItem({ field }: { field: PatternField }) {
  return (
    <div className="flex items-start justify-between p-2 rounded-lg bg-muted/50">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </p>
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
      </div>
      <Badge variant="outline" className="text-xs ml-2">
        {field.type}
      </Badge>
    </div>
  );
}

function ChecklistItemDisplay({ item }: { item: ChecklistItem }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
      <CheckSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm">
          {item.label}
          {item.required && (
            <Badge variant="destructive" className="ml-2 text-[10px] px-1">
              Required
            </Badge>
          )}
        </p>
        {item.helpText && (
          <p className="text-xs text-muted-foreground">{item.helpText}</p>
        )}
      </div>
    </div>
  );
}

function OutcomeItem({ outcome }: { outcome: PatternOutcome }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            outcome.color === 'green' && 'bg-green-500',
            outcome.color === 'red' && 'bg-red-500',
            outcome.color === 'orange' && 'bg-orange-500',
            outcome.color === 'blue' && 'bg-blue-500',
            outcome.color === 'gray' && 'bg-gray-400'
          )}
        />
        <span className="text-sm font-medium">{outcome.label}</span>
        {outcome.requiresNotes && (
          <Badge variant="outline" className="text-[10px]">
            Notes required
          </Badge>
        )}
      </div>
      {outcome.nextActivity && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>Creates: {outcome.nextActivity}</span>
        </div>
      )}
    </div>
  );
}

export default PatternDetail;
