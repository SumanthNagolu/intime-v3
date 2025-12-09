'use client'

import { Star, MoreHorizontal, Copy, Edit, Trash2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { LibraryItemConfig } from './types'

interface LibraryCardProps<T extends LibraryItemConfig> {
  item: T
  isSelected?: boolean
  showThumbnail?: boolean
  onClick?: () => void
  onUse?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onFavorite?: (isFavorite: boolean) => void
  className?: string
}

export function LibraryCard<T extends LibraryItemConfig>({
  item,
  isSelected,
  showThumbnail = true,
  onClick,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  onFavorite,
  className,
}: LibraryCardProps<T>) {
  const Icon = item.icon

  return (
    <Card
      className={cn(
        'group relative cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-gold-200',
        isSelected && 'ring-2 ring-gold-500 border-gold-500',
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      {showThumbnail && (
        <div className="relative h-32 bg-charcoal-50 rounded-t-lg overflow-hidden">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : Icon ? (
            <div className="flex items-center justify-center h-full">
              <Icon className="w-12 h-12 text-charcoal-300" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-12 h-12 rounded-lg bg-charcoal-200" />
            </div>
          )}

          {/* Favorite button */}
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white',
                item.isFavorite && 'text-gold-500'
              )}
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(!item.isFavorite)
              }}
            >
              <Star
                className={cn('w-4 h-4', item.isFavorite && 'fill-current')}
              />
            </Button>
          )}

          {/* System badge */}
          {item.isSystem && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 text-xs bg-white/80"
            >
              System
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-charcoal-900 truncate">{item.title}</h3>
            {item.description && (
              <p className="text-xs text-charcoal-500 line-clamp-2 mt-0.5">
                {item.description}
              </p>
            )}
          </div>

          {/* Actions dropdown */}
          {(onEdit || onDelete || onDuplicate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onUse && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onUse()
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Use Template
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate()
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onEdit && !item.isSystem && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && !item.isSystem && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <CardContent className="pt-0 pb-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-charcoal-100 text-charcoal-600"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      {/* Footer */}
      {(item.usageCount !== undefined || item.author) && (
        <CardFooter className="pt-0 text-xs text-charcoal-500">
          <div className="flex items-center justify-between w-full">
            {item.author && <span>By {item.author}</span>}
            {item.usageCount !== undefined && (
              <span>{item.usageCount} uses</span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

