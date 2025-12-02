'use client';

import * as React from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { NotificationData } from '../types';
import { formatRelativeTime } from '../types';

interface NotificationCardProps {
  data: NotificationData;
  onDismiss?: () => void;
  onClick?: () => void;
  className?: string;
}

export function NotificationCard({
  data,
  onDismiss,
  onClick,
  className,
}: NotificationCardProps) {
  const Icon = data.icon || Bell;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleClick = () => {
    if (data.actionUrl) {
      window.location.href = data.actionUrl;
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-3 rounded-lg border transition-colors',
        data.isRead
          ? 'bg-white border-charcoal-100'
          : 'bg-blue-50 border-blue-100',
        (onClick || data.actionUrl) && 'cursor-pointer hover:bg-charcoal-50',
        className
      )}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!data.isRead && (
        <div className="absolute top-3 left-3 h-2 w-2 rounded-full bg-blue-500" />
      )}

      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 p-2 rounded-lg',
        data.isRead ? 'bg-charcoal-100' : 'bg-blue-100'
      )}>
        <Icon className={cn(
          'h-4 w-4',
          data.isRead ? 'text-charcoal-500' : 'text-blue-600'
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <h4 className={cn(
          'text-sm',
          data.isRead ? 'font-normal text-charcoal-700' : 'font-medium text-charcoal-900'
        )}>
          {data.title}
        </h4>
        <p className="text-xs text-charcoal-500 mt-0.5 line-clamp-2">
          {data.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-charcoal-400">
            {formatRelativeTime(data.timestamp)}
          </span>
          {data.actionUrl && (
            <a
              href={data.actionUrl}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View</span>
            </a>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 text-charcoal-400 hover:text-charcoal-600"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export default NotificationCard;
