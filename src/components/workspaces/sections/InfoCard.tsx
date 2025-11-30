/**
 * InfoCard Component
 *
 * Editable information card for displaying entity details.
 */

'use client';

import React, { ReactNode } from 'react';
import { Edit2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface InfoCardField {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export interface InfoCardProps {
  title: string;
  icon?: LucideIcon;
  fields?: InfoCardField[];
  children?: ReactNode;
  editable?: boolean;
  onEdit?: () => void;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function InfoCard({
  title,
  icon: TitleIcon,
  fields,
  children,
  editable = false,
  onEdit,
  footer,
  className,
  contentClassName,
}: InfoCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {TitleIcon && <TitleIcon className="w-4 h-4 text-stone-500" />}
            {title}
          </CardTitle>
          {editable && onEdit && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>
        {fields && fields.length > 0 ? (
          <div className="space-y-0">
            {fields.map((field, idx) => {
              const FieldIcon = field.icon;
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start justify-between py-2 border-b border-stone-100 last:border-0',
                    field.className
                  )}
                >
                  <span className="text-sm text-stone-500 flex items-center gap-1.5">
                    {FieldIcon && <FieldIcon className="w-3.5 h-3.5" />}
                    {field.label}
                  </span>
                  <span className="text-sm font-medium text-charcoal text-right max-w-[60%]">
                    {field.value ?? '—'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          children
        )}
        {footer && <div className="mt-4 pt-4 border-t border-stone-100">{footer}</div>}
      </CardContent>
    </Card>
  );
}

export default InfoCard;
