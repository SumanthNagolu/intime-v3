'use client';

import * as React from 'react';
import {
  Eye,
  Mail,
  Phone,
  MessageSquare,
  MoreHorizontal,
  Star,
  Clock,
  Linkedin,
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
import type { EntityCardProps, ContactData, CardAction } from '../types';
import { formatRelativeTime } from '../types';

const COMM_PREF_ICONS: Record<NonNullable<ContactData['communicationPreference']>, typeof Mail> = {
  email: Mail,
  phone: Phone,
  linkedin: Linkedin,
};

const DEFAULT_ACTIONS: CardAction[] = [
  { id: 'view', label: 'View', icon: Eye },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'add_campaign', label: 'Add to Campaign', icon: MessageSquare },
];

interface ContactCardProps extends EntityCardProps<ContactData> {}

export function ContactCard({
  data,
  variant = 'default',
  onView,
  onAction,
  actions = DEFAULT_ACTIONS,
  selected,
  loading,
  className,
}: ContactCardProps) {
  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const CommPrefIcon = data.communicationPreference
    ? COMM_PREF_ICONS[data.communicationPreference]
    : null;

  const handleAction = (actionId: string) => {
    if (actionId === 'view' && onView) {
      onView();
    } else if (actionId === 'email') {
      window.location.href = `mailto:${data.email}`;
    } else if (actionId === 'call' && data.phone) {
      window.location.href = `tel:${data.phone}`;
    } else if (onAction) {
      onAction(actionId, data);
    }
  };

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
              <p className="text-xs text-charcoal-500 truncate">{data.title}</p>
            </div>
            {data.isPrimary && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
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
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-charcoal-900 truncate">{data.name}</h3>
              {data.isPrimary && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>
            {data.title && (
              <p className="text-sm text-charcoal-500 truncate">{data.title}</p>
            )}
          </div>
        </div>

        {/* Account Link */}
        {data.accountName && (
          <a
            href={`/employee/workspace/accounts/${data.accountId}`}
            className="text-sm text-blue-600 hover:underline truncate block mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            {data.accountName}
          </a>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-3">
          <TooltipProvider>
            {/* Email */}
            <div className="flex items-center gap-2">
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
                <TooltipContent>Send email</TooltipContent>
              </Tooltip>
              <span className="text-sm text-charcoal-600 truncate">{data.email}</span>
            </div>

            {/* Phone */}
            {data.phone && (
              <div className="flex items-center gap-2">
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
                  <TooltipContent>Call</TooltipContent>
                </Tooltip>
                <span className="text-sm text-charcoal-600">{data.phone}</span>
              </div>
            )}
          </TooltipProvider>
        </div>

        {/* Communication Preference & Last Contacted */}
        <div className="flex items-center justify-between text-xs text-charcoal-500">
          {data.communicationPreference && CommPrefIcon && (
            <div className="flex items-center gap-1">
              <CommPrefIcon className="h-3 w-3" />
              <span>Prefers {data.communicationPreference}</span>
            </div>
          )}
          {data.lastContactedDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last: {formatRelativeTime(data.lastContactedDate)}</span>
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

export default ContactCard;
