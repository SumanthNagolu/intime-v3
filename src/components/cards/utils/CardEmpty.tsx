'use client';

import * as React from 'react';
import { Inbox, FileQuestion, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type EmptyVariant = 'no-data' | 'no-results' | 'not-found' | 'default';

interface CardEmptyProps {
  variant?: EmptyVariant;
  icon?: React.ElementType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<EmptyVariant, {
  icon: React.ElementType;
  title: string;
  message: string;
}> = {
  'no-data': {
    icon: Inbox,
    title: 'No data yet',
    message: 'Start by adding some data to see it here.',
  },
  'no-results': {
    icon: Search,
    title: 'No results found',
    message: 'Try adjusting your search or filters.',
  },
  'not-found': {
    icon: FileQuestion,
    title: 'Not found',
    message: 'The item you\'re looking for doesn\'t exist.',
  },
  default: {
    icon: Inbox,
    title: 'Nothing here',
    message: 'There\'s nothing to display at the moment.',
  },
};

export function CardEmpty({
  variant = 'default',
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className,
}: CardEmptyProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="p-3 bg-charcoal-100 rounded-full mb-3">
          <Icon className="h-6 w-6 text-charcoal-400" />
        </div>
        <h3 className="text-sm font-medium text-charcoal-700 mb-1">
          {displayTitle}
        </h3>
        <p className="text-sm text-charcoal-500 mb-4 max-w-xs">
          {displayMessage}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default CardEmpty;
