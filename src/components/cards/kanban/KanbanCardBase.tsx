'use client';

import * as React from 'react';
import { GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export interface KanbanCardBaseProps {
  id: string;
  title: string;
  subtitle?: string;
  statusColor?: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'gray';
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  isDragging?: boolean;
  isSelected?: boolean;
  showCheckbox?: boolean;
  showDragHandle?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  children?: React.ReactNode;
  className?: string;
}

const STATUS_COLORS: Record<NonNullable<KanbanCardBaseProps['statusColor']>, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-400',
};

export function KanbanCardBase({
  id,
  title,
  subtitle,
  statusColor = 'gray',
  badge,
  isDragging,
  isSelected,
  showCheckbox = false,
  showDragHandle = true,
  onSelect,
  onClick,
  onDragStart,
  onDragEnd,
  children,
  className,
}: KanbanCardBaseProps) {
  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(checked);
    }
  };

  return (
    <Card
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'relative transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        isSelected && 'ring-2 ring-blue-500',
        onClick && 'cursor-pointer',
        onDragStart && 'cursor-grab active:cursor-grabbing',
        className
      )}
    >
      {/* Status color strip */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
        STATUS_COLORS[statusColor]
      )} />

      <CardContent className="p-3 pl-4">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          {showDragHandle && (
            <div className="flex-shrink-0 text-charcoal-300 hover:text-charcoal-500 cursor-grab active:cursor-grabbing mt-0.5">
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          {/* Checkbox */}
          {showCheckbox && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 mt-0.5"
            />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Title + Badge */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-charcoal-900 truncate">
                {title}
              </h4>
              {badge && (
                <Badge
                  variant={badge.variant || 'secondary'}
                  className={cn('text-xs flex-shrink-0', badge.className)}
                >
                  {badge.text}
                </Badge>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs text-charcoal-500 truncate">
                {subtitle}
              </p>
            )}

            {/* Additional content */}
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default KanbanCardBase;
