'use client'

import { X, ExternalLink, Copy, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { LibraryItemConfig } from './types'

interface LibraryPreviewProps<T extends LibraryItemConfig> {
  item: T
  onClose?: () => void
  onUse?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  renderContent?: (item: T) => React.ReactNode
  className?: string
}

export function LibraryPreview<T extends LibraryItemConfig>({
  item,
  onClose,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  renderContent,
  className,
}: LibraryPreviewProps<T>) {
  const Icon = item.icon

  return (
    <aside className={cn('w-96 bg-white border-l border-charcoal-200 flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
        <h2 className="font-medium text-charcoal-900">Preview</h2>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Thumbnail */}
          <div className="h-48 bg-charcoal-50 rounded-lg overflow-hidden">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            ) : Icon ? (
              <div className="flex items-center justify-center h-full">
                <Icon className="w-16 h-16 text-charcoal-300" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 rounded-lg bg-charcoal-200" />
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-charcoal-900">{item.title}</h3>
              {item.isSystem && <Badge variant="secondary">System</Badge>}
            </div>
            {item.description && (
              <p className="text-sm text-charcoal-500 mt-1">{item.description}</p>
            )}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            {item.author && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Author</span>
                <span className="text-charcoal-700">{item.author}</span>
              </div>
            )}
            {item.usageCount !== undefined && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Usage</span>
                <span className="text-charcoal-700">{item.usageCount} times</span>
              </div>
            )}
            {item.createdAt && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Created</span>
                <span className="text-charcoal-700">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Custom content */}
          {renderContent && (
            <>
              <Separator />
              {renderContent(item)}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t border-charcoal-100 space-y-2">
        {onUse && (
          <Button className="w-full gap-2" onClick={onUse}>
            <ExternalLink className="w-4 h-4" />
            Use Template
          </Button>
        )}
        <div className="flex gap-2">
          {onDuplicate && (
            <Button variant="outline" className="flex-1 gap-2" onClick={onDuplicate}>
              <Copy className="w-4 h-4" />
              Duplicate
            </Button>
          )}
          {onEdit && !item.isSystem && (
            <Button variant="outline" className="flex-1 gap-2" onClick={onEdit}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
        {onDelete && !item.isSystem && (
          <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>
    </aside>
  )
}

