'use client';

import * as React from 'react';
import {
  Eye,
  PlusCircle,
  Users,
  MoreHorizontal,
  Building2,
  Briefcase,
  DollarSign,
  Clock,
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
import type { EntityCardProps, AccountData, CardAction } from '../types';
import { formatCurrency, formatRelativeTime } from '../types';

const TYPE_CONFIG: Record<AccountData['type'], { label: string; className: string }> = {
  client: { label: 'Client', className: 'bg-blue-100 text-blue-700' },
  vendor: { label: 'Vendor', className: 'bg-purple-100 text-purple-700' },
  partner: { label: 'Partner', className: 'bg-green-100 text-green-700' },
};

const TIER_CONFIG: Record<AccountData['tier'], { label: string; className: string }> = {
  enterprise: { label: 'Enterprise', className: 'bg-yellow-100 text-yellow-800' },
  mid_market: { label: 'Mid-Market', className: 'bg-orange-100 text-orange-700' },
  smb: { label: 'SMB', className: 'bg-gray-100 text-gray-700' },
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'add_job', label: 'Add Job', icon: PlusCircle },
  { id: 'add_contact', label: 'Add Contact', icon: Users },
];

interface AccountCardProps extends EntityCardProps<AccountData> {}

export function AccountCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: AccountCardProps) {
  const typeConfig = TYPE_CONFIG[data.type];
  const tierConfig = TIER_CONFIG[data.tier];

  const companyInitials = data.name
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

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-charcoal-200 rounded-lg" />
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
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={data.logo} />
              <AvatarFallback className="rounded-lg text-xs">
                <Building2 className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.name}</p>
              <p className="text-xs text-charcoal-500">{typeConfig.label}</p>
            </div>
            <Badge className={cn('text-xs', tierConfig.className)}>{tierConfig.label}</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        selected && 'ring-2 ring-blue-500',
        onView && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onView}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={data.logo} />
            <AvatarFallback className="rounded-lg">
              <Building2 className="h-6 w-6 text-charcoal-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-charcoal-900 truncate">{data.name}</h3>
            {data.primaryContact && (
              <p className="text-sm text-charcoal-500 truncate">{data.primaryContact}</p>
            )}
          </div>
        </div>

        {/* Type & Tier */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn('text-xs', typeConfig.className)}>{typeConfig.label}</Badge>
          <Badge className={cn('text-xs', tierConfig.className)}>{tierConfig.label}</Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-charcoal-50 rounded-md mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-charcoal-500 mb-0.5">
              <Briefcase className="h-3 w-3" />
              <span className="text-xs">Jobs</span>
            </div>
            <p className="text-sm font-semibold text-charcoal-900">{data.jobsCount ?? 0}</p>
          </div>
          <div className="text-center border-x border-charcoal-200">
            <div className="flex items-center justify-center gap-1 text-charcoal-500 mb-0.5">
              <Users className="h-3 w-3" />
              <span className="text-xs">Placed</span>
            </div>
            <p className="text-sm font-semibold text-charcoal-900">{data.placementsCount ?? 0}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-charcoal-500 mb-0.5">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs">Revenue</span>
            </div>
            <p className="text-sm font-semibold text-charcoal-900">
              {data.revenue ? formatCurrency(data.revenue) : '-'}
            </p>
          </div>
        </div>

        {/* Last Activity */}
        {data.lastActivityDate && (
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
            <Clock className="h-3 w-3" />
            <span>Last activity: {formatRelativeTime(data.lastActivityDate)}</span>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {actions.length > 0 && (
        <CardFooter className="p-2 pt-0 flex justify-end gap-1">
          {actions.slice(0, 2).map((action) => (
            <Button
              key={action.id}
              variant={action.variant as "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | null | undefined || 'ghost'}
              size="sm"
              disabled={action.disabled}
              className={cn(action.hidden && 'hidden')}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(action.id);
              }}
            >
              {action.icon && <action.icon className="h-3 w-3 mr-1" />}
              {action.label}
            </Button>
          ))}
          {actions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(2).map((action) => (
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

export default AccountCard;
