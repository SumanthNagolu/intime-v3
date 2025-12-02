'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  status?: 'default' | 'error' | 'complete' | 'warning';
  required?: boolean;
  fieldCount?: number;
  completedFieldCount?: number;
}

export function FormSection({
  title,
  description,
  children,
  defaultOpen = true,
  collapsible = true,
  className,
  headerClassName,
  contentClassName,
  icon,
  badge,
  badgeVariant = 'secondary',
  status = 'default',
  required,
  fieldCount,
  completedFieldCount,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const statusIcon = React.useMemo(() => {
    switch (status) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  }, [status]);

  const progressText = React.useMemo(() => {
    if (fieldCount !== undefined && completedFieldCount !== undefined) {
      return `${completedFieldCount}/${fieldCount}`;
    }
    return null;
  }, [fieldCount, completedFieldCount]);

  const headerContent = (
    <div
      className={cn(
        'flex items-center justify-between py-3 px-4 bg-muted/50 rounded-t-lg border-b',
        !isOpen && 'rounded-b-lg border-b-0',
        headerClassName
      )}
    >
      <div className="flex items-center gap-3">
        {collapsible && (
          <div className="text-muted-foreground">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div>
          <h3 className="font-medium text-sm flex items-center gap-2">
            {title}
            {required && <span className="text-destructive">*</span>}
            {statusIcon}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {progressText && (
          <span className="text-xs text-muted-foreground">{progressText}</span>
        )}
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      </div>
    </div>
  );

  const content = (
    <div className={cn('p-4 border-x border-b rounded-b-lg', contentClassName)}>
      {children}
    </div>
  );

  if (!collapsible) {
    return (
      <div className={cn('rounded-lg border', className)}>
        {headerContent}
        {content}
      </div>
    );
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('rounded-lg border', className)}
    >
      <CollapsibleTrigger asChild>
        <button type="button" className="w-full text-left cursor-pointer">
          {headerContent}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>{content}</CollapsibleContent>
    </Collapsible>
  );
}

// Grid layout helpers for sections
export interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FormGrid({
  children,
  columns = 2,
  gap = 'md',
  className,
}: FormGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// Full width span within grid
export interface FormFullWidthProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFullWidth({ children, className }: FormFullWidthProps) {
  return <div className={cn('col-span-full', className)}>{children}</div>;
}

// Divider with optional text
export interface FormDividerProps {
  text?: string;
  className?: string;
}

export function FormDivider({ text, className }: FormDividerProps) {
  if (!text) {
    return <hr className={cn('my-4 border-t', className)} />;
  }

  return (
    <div className={cn('relative my-4', className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

export default FormSection;
