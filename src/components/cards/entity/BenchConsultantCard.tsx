'use client';

import * as React from 'react';
import {
  Eye,
  Send,
  ListPlus,
  MessageSquare,
  Calendar,
  DollarSign,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EntityCardProps, BenchConsultantData, CardAction } from '../types';
import { getBenchAlertLevel, getBenchAlertColor, formatCurrency, formatRelativeTime } from '../types';

const MARKETING_STATUS_CONFIG: Record<BenchConsultantData['marketingStatus'], { label: string; className: string }> = {
  active: { label: 'Active Marketing', className: 'bg-green-100 text-green-700' },
  passive: { label: 'Passive', className: 'bg-yellow-100 text-yellow-700' },
  hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-700' },
};

const CONTRACT_PREF_CONFIG: Record<BenchConsultantData['contractPreference'], string> = {
  c2c: 'C2C',
  w2: 'W2',
  '1099': '1099',
  any: 'Any',
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'marketing', label: 'Marketing', icon: ListPlus },
  { id: 'submit', label: 'Submit', icon: Send },
  { id: 'log_activity', label: 'Log Activity', icon: MessageSquare },
  { id: 'contact', label: 'Contact', icon: Phone },
];

interface BenchConsultantCardProps extends EntityCardProps<BenchConsultantData> {}

export function BenchConsultantCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: BenchConsultantCardProps) {
  const benchAlertLevel = getBenchAlertLevel(data.daysOnBench);
  const benchAlertColorClass = getBenchAlertColor(benchAlertLevel);
  const marketingConfig = MARKETING_STATUS_CONFIG[data.marketingStatus];

  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const handleAction = (actionId: string) => {
    if (actionId === 'view' && onView) {
      onView();
    } else if (onAction) {
      onAction(actionId, data);
    }
  };

  // Calculate visa alert
  const visaDaysRemaining = data.visaExpiryDate
    ? Math.floor((new Date(data.visaExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const visaAlertColor = visaDaysRemaining !== null && visaDaysRemaining < 90
    ? visaDaysRemaining < 30 ? 'text-red-500' : 'text-orange-500'
    : null;

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-charcoal-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-charcoal-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-charcoal-200 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5',
          selected && 'ring-2 ring-blue-500',
          className
        )}
        onClick={onView}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={data.avatar} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className={cn(
                'absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold',
                benchAlertColorClass
              )}>
                {data.daysOnBench}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.name}</p>
              <p className="text-xs text-charcoal-500 truncate">{data.headline}</p>
            </div>
            <Badge className={cn('text-xs', marketingConfig.className)}>{marketingConfig.label}</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 border-l-4',
        benchAlertLevel === 'green' && 'border-l-green-500',
        benchAlertLevel === 'yellow' && 'border-l-yellow-500',
        benchAlertLevel === 'orange' && 'border-l-orange-500',
        benchAlertLevel === 'red' && 'border-l-red-500',
        benchAlertLevel === 'black' && 'border-l-gray-900',
        selected && 'ring-2 ring-blue-500',
        onView && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onView}
    >
      <CardContent className="p-4">
        {/* Header: Avatar, Name, Marketing Status */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-charcoal-900 truncate">{data.name}</h3>
            {data.headline && (
              <p className="text-sm text-charcoal-500 truncate">{data.headline}</p>
            )}
          </div>
          <Badge className={cn('text-xs flex-shrink-0', marketingConfig.className)}>
            {marketingConfig.label}
          </Badge>
        </div>

        {/* Days on Bench - Prominent */}
        <div className={cn(
          'flex items-center justify-between p-2 rounded-md mb-3',
          benchAlertColorClass
        )}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-semibold">{data.daysOnBench} days on bench</span>
          </div>
          <span className="text-xs">
            Started {new Date(data.benchStartDate).toLocaleDateString()}
          </span>
        </div>

        {/* Visa & Contract Info */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {data.visaType}
          </Badge>
          {visaAlertColor && data.visaExpiryDate && (
            <div className={cn('flex items-center gap-1 text-xs', visaAlertColor)}>
              <AlertTriangle className="h-3 w-3" />
              <span>Exp in {visaDaysRemaining}d</span>
            </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {CONTRACT_PREF_CONFIG[data.contractPreference]}
          </Badge>
        </div>

        {/* Rate Info */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-charcoal-400" />
            <span className="font-medium">{formatCurrency(data.targetRate)}/hr</span>
          </div>
          {data.minRate && (
            <span className="text-xs text-charcoal-500">
              (min: {formatCurrency(data.minRate)}/hr)
            </span>
          )}
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {data.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {data.skills.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{data.skills.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Activity Info */}
        <div className="flex items-center gap-4 text-xs text-charcoal-500">
          {data.activeSubmissions !== undefined && (
            <div className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              <span>{data.activeSubmissions} active subs</span>
            </div>
          )}
          {data.lastContact && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last contact: {formatRelativeTime(data.lastContact)}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      {actions.length > 0 && (
        <CardFooter className="p-2 pt-0 flex justify-end gap-1 flex-wrap">
          {actions.slice(0, 3).map((action) => (
            <Button
              key={action.id}
              variant={action.variant as "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | null | undefined || 'ghost'}
              size="sm"
              disabled={action.disabled}
              className={cn(action.hidden && 'hidden', 'text-xs')}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(action.id);
              }}
            >
              {action.icon && <action.icon className="h-3 w-3 mr-1" />}
              {action.label}
            </Button>
          ))}
          {actions.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(3).map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    disabled={action.disabled}
                    className={cn(action.hidden && 'hidden')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(action.id);
                    }}
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default BenchConsultantCard;
