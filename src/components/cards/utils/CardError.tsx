'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface CardErrorProps {
  error?: Error | string | null;
  title?: string;
  message?: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const SEVERITY_CONFIG: Record<ErrorSeverity, {
  icon: React.ElementType;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  titleColor: string;
}> = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
  },
  info: {
    icon: AlertTriangle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
  },
};

export function CardError({
  error,
  title = 'Something went wrong',
  message,
  severity = 'error',
  onRetry,
  retryLabel = 'Try again',
  className,
}: CardErrorProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  const errorMessage = message || (error instanceof Error ? error.message : error);

  return (
    <Card className={cn(config.bgColor, config.borderColor, className)}>
      <CardContent className="flex flex-col items-center justify-center py-6 px-4 text-center">
        <div className={cn('p-2 rounded-full mb-3', config.bgColor)}>
          <Icon className={cn('h-6 w-6', config.iconColor)} />
        </div>
        <h3 className={cn('text-sm font-medium mb-1', config.titleColor)}>
          {title}
        </h3>
        {errorMessage && (
          <p className="text-sm text-charcoal-600 mb-4 max-w-xs">
            {errorMessage}
          </p>
        )}
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default CardError;
