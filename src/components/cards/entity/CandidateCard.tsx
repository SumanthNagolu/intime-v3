'use client';

import * as React from 'react';
import {
  User,
  Mail,
  Phone,
  Linkedin,
  AlertTriangle,
  Eye,
  Send,
  UserPlus,
  MoreHorizontal,
  Star,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { EntityCardProps, CandidateData, CardAction } from '../types';

const STATUS_CONFIG: Record<CandidateData['status'], { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-100 text-blue-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  passive: { label: 'Passive', className: 'bg-yellow-100 text-yellow-700' },
  placed: { label: 'Placed', className: 'bg-purple-100 text-purple-700' },
  on_bench: { label: 'On Bench', className: 'bg-orange-100 text-orange-700' },
  do_not_use: { label: 'DNU', className: 'bg-red-100 text-red-700' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
};

const AVAILABILITY_CONFIG: Record<NonNullable<CandidateData['availability']>, string> = {
  immediately: 'Available Now',
  '2_weeks': '2 Weeks Notice',
  '1_month': '1 Month Notice',
  other: 'Other',
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'submit', label: 'Submit to Job', icon: Send },
  { id: 'campaign', label: 'Add to Campaign', icon: UserPlus },
];

interface CandidateCardProps extends EntityCardProps<CandidateData> {}

function getVisaAlertColor(visaStatus?: string, expiryDate?: string | Date): string | null {
  if (!visaStatus || visaStatus === 'USC' || visaStatus === 'Green Card') return null;
  if (!expiryDate) return 'text-yellow-500';

  const daysToExpiry = Math.floor(
    (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysToExpiry < 30) return 'text-red-500';
  if (daysToExpiry < 90) return 'text-orange-500';
  if (daysToExpiry < 180) return 'text-yellow-500';
  return null;
}

export function CandidateCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: CandidateCardProps) {
  const statusConfig = STATUS_CONFIG[data.status];
  const visaAlertColor = getVisaAlertColor(data.visaStatus, data.visaExpiryDate);

  const handleAction = (actionId: string) => {
    if (actionId === 'view' && onView) {
      onView();
    } else if (onAction) {
      onAction(actionId, data);
    }
  };

  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-charcoal-200 rounded-full" />
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={data.avatar} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{data.name}</p>
              <p className="text-xs text-charcoal-500 truncate">{data.currentTitle}</p>
            </div>
            <Badge className={cn('text-xs', statusConfig.className)}>{statusConfig.label}</Badge>
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
        {/* Header: Avatar, Name, Status */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-charcoal-900 truncate">{data.name}</h3>
              <Badge className={cn('text-xs', statusConfig.className)}>{statusConfig.label}</Badge>
            </div>
            {(data.currentTitle || data.currentCompany) && (
              <p className="text-sm text-charcoal-500 truncate mt-0.5">
                {data.currentTitle}
                {data.currentTitle && data.currentCompany && ' @ '}
                {data.currentCompany}
              </p>
            )}
          </div>
        </div>

        {/* Visa Status */}
        {data.visaStatus && (
          <div className="flex items-center gap-2 mb-3">
            {visaAlertColor && <AlertTriangle className={cn('h-4 w-4', visaAlertColor)} />}
            <Badge variant="outline" className="text-xs">
              {data.visaStatus}
            </Badge>
            {data.visaExpiryDate && (
              <span className="text-xs text-charcoal-500">
                Exp: {new Date(data.visaExpiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

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
                +{data.skills.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Contact Icons */}
        <div className="flex items-center gap-2 mb-3">
          <TooltipProvider>
            {data.email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`mailto:${data.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-700 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>{data.email}</TooltipContent>
              </Tooltip>
            )}
            {data.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`tel:${data.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>{data.phone}</TooltipContent>
              </Tooltip>
            )}
            {data.linkedinUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={data.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md hover:bg-charcoal-100 text-charcoal-500 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>LinkedIn Profile</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* Availability & Match Score */}
        <div className="flex items-center justify-between text-xs text-charcoal-500">
          {data.availability && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{AVAILABILITY_CONFIG[data.availability]}</span>
            </div>
          )}
          {data.matchScore !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="font-medium text-charcoal-700">{data.matchScore}% match</span>
            </div>
          )}
        </div>
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

export default CandidateCard;
