/**
 * RelatedObjectsList Component
 *
 * Displays list of related entities with navigation links.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getEntityConfig, type EntityType } from '@/lib/workspace/entity-registry';

// =====================================================
// TYPES
// =====================================================

export interface RelatedObject {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  status?: string;
  href?: string;
  metadata?: Record<string, unknown>;
}

export interface RelatedObjectsListProps {
  title?: string;
  objects: RelatedObject[];
  maxVisible?: number;
  showType?: boolean;
  showStatus?: boolean;
  emptyMessage?: string;
  onViewAll?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
}

// =====================================================
// RELATED OBJECT ITEM
// =====================================================

function RelatedObjectItem({
  object,
  showType,
  showStatus,
}: {
  object: RelatedObject;
  showType?: boolean;
  showStatus?: boolean;
}) {
  const config = getEntityConfig(object.type);
  const Icon = config.icon;
  const href = object.href || config.routes.detail(object.id);

  const content = (
    <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-stone-100 transition-colors group">
      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          config.bgColor
        )}
      >
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-charcoal truncate">
            {object.title}
          </span>
          {showType && (
            <Badge variant="outline" className="text-[10px]">
              {config.name}
            </Badge>
          )}
          {showStatus && object.status && (
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px]',
                config.statuses[object.status.toLowerCase()]?.bgColor,
                config.statuses[object.status.toLowerCase()]?.color
              )}
            >
              {object.status}
            </Badge>
          )}
        </div>
        {object.subtitle && (
          <p className="text-xs text-stone-500 truncate">{object.subtitle}</p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function RelatedObjectsList({
  title,
  objects,
  maxVisible = 5,
  showType = false,
  showStatus = true,
  emptyMessage = 'No related items',
  onViewAll,
  onAdd,
  addLabel = 'Add',
  className,
}: RelatedObjectsListProps) {
  const visibleObjects = objects.slice(0, maxVisible);
  const hasMore = objects.length > maxVisible;

  return (
    <div className={cn('', className)}>
      {/* Header */}
      {(title || onAdd) && (
        <div className="flex items-center justify-between mb-2">
          {title && (
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {title}
              {objects.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {objects.length}
                </Badge>
              )}
            </h4>
          )}
          {onAdd && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onAdd}>
              {addLabel}
            </Button>
          )}
        </div>
      )}

      {/* List */}
      {visibleObjects.length > 0 ? (
        <div className="space-y-0.5">
          {visibleObjects.map((object) => (
            <RelatedObjectItem
              key={`${object.type}-${object.id}`}
              object={object}
              showType={showType}
              showStatus={showStatus}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone-400 py-2">{emptyMessage}</p>
      )}

      {/* View All */}
      {hasMore && onViewAll && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs"
          onClick={onViewAll}
        >
          View all {objects.length} items
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

export default RelatedObjectsList;
