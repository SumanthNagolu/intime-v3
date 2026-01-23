'use client'

import * as React from 'react'
import { User, Users, Mail, Phone, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================
// USER DISPLAY TYPES
// ============================================

export interface UserValue {
  id?: string
  name: string
  email?: string
  phone?: string
  avatarUrl?: string
  role?: string
  department?: string
  isActive?: boolean
}

// ============================================
// USER DISPLAY COMPONENT
// ============================================

export interface UserDisplayProps {
  /** User value or just a name string */
  value: UserValue | string | null | undefined
  /** Show avatar */
  showAvatar?: boolean
  /** Avatar size */
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show role/subtitle */
  showRole?: boolean
  /** Show status badge */
  showStatus?: boolean
  /** Show email on hover */
  showEmailTooltip?: boolean
  /** Link to user profile */
  href?: string
  /** Click handler */
  onClick?: () => void
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Additional className */
  className?: string
}

export function UserDisplay({
  value,
  showAvatar = true,
  avatarSize = 'md',
  showRole = false,
  showStatus = false,
  showEmailTooltip = false,
  href,
  onClick,
  orientation = 'horizontal',
  className,
}: UserDisplayProps) {
  if (!value) {
    return <span className={cn('text-charcoal-400', className)}>Unassigned</span>
  }

  // Normalize value
  const user: UserValue = typeof value === 'string' ? { name: value } : value

  const avatarSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const content = (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        orientation === 'vertical' && 'flex-col text-center',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {showAvatar && (
        <Avatar className={avatarSizes[avatarSize]}>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col min-w-0',
          orientation === 'vertical' && 'items-center'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium text-charcoal-900 truncate',
              textSizes[avatarSize]
            )}
          >
            {user.name}
          </span>
          {showStatus && user.isActive !== undefined && (
            <Badge
              variant={user.isActive ? 'success' : 'secondary'}
              className="text-[10px] px-1.5 py-0"
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>

        {showRole && user.role && (
          <span className="text-xs text-charcoal-500 truncate">{user.role}</span>
        )}
      </div>
    </div>
  )

  // Wrap with tooltip if email should be shown
  if (showEmailTooltip && user.email) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {href ? (
              <a href={href} className="no-underline">
                {content}
              </a>
            ) : (
              content
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{user.email}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Wrap with link if href provided
  if (href) {
    return (
      <a href={href} className="no-underline">
        {content}
      </a>
    )
  }

  return content
}

// ============================================
// USER CARD COMPONENT
// ============================================

export interface UserCardProps {
  user: UserValue
  onEdit?: () => void
  onRemove?: () => void
  showActions?: boolean
  showContact?: boolean
  className?: string
}

export function UserCard({
  user,
  onEdit,
  onRemove,
  showActions = true,
  showContact = true,
  className,
}: UserCardProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'group p-4 rounded-lg border border-charcoal-200/60 bg-white',
        'hover:border-charcoal-300 hover:shadow-elevation-sm transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-charcoal-900 truncate">{user.name}</h4>
              {user.role && (
                <p className="text-xs text-charcoal-500">{user.role}</p>
              )}
            </div>

            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-1.5 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={onRemove}
                    className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <span className="text-sm">×</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {showContact && (user.email || user.phone) && (
            <div className="mt-2 space-y-1">
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-700 transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email}</span>
                </a>
              )}
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-700 transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  <span>{user.phone}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// USER AVATAR GROUP
// ============================================

export interface UserAvatarGroupProps {
  users: UserValue[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export function UserAvatarGroup({
  users,
  maxDisplay = 4,
  size = 'md',
  onClick,
  className,
}: UserAvatarGroupProps) {
  const displayUsers = users.slice(0, maxDisplay)
  const remaining = users.length - maxDisplay

  const sizes = {
    sm: { avatar: 'h-6 w-6', text: 'text-[10px]', offset: '-ml-2' },
    md: { avatar: 'h-8 w-8', text: 'text-xs', offset: '-ml-3' },
    lg: { avatar: 'h-10 w-10', text: 'text-sm', offset: '-ml-4' },
  }

  const sizeConfig = sizes[size]

  if (users.length === 0) {
    return (
      <span className={cn('text-charcoal-400 text-sm', className)}>No users</span>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {displayUsers.map((user, index) => {
        const initials = user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <TooltipProvider key={user.id || index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  className={cn(
                    sizeConfig.avatar,
                    'border-2 border-white',
                    index > 0 && sizeConfig.offset
                  )}
                >
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback
                    className={cn(
                      'bg-charcoal-100 text-charcoal-600 font-medium',
                      sizeConfig.text
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium">{user.name}</p>
                {user.role && (
                  <p className="text-xs text-charcoal-400">{user.role}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}

      {remaining > 0 && (
        <div
          className={cn(
            sizeConfig.avatar,
            sizeConfig.offset,
            'rounded-full bg-charcoal-100 border-2 border-white',
            'flex items-center justify-center'
          )}
        >
          <span
            className={cn('font-medium text-charcoal-600', sizeConfig.text)}
          >
            +{remaining}
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================
// USER LIST COMPONENT
// ============================================

export interface UserListProps {
  users: UserValue[]
  onUserClick?: (user: UserValue) => void
  onRemove?: (user: UserValue) => void
  emptyMessage?: string
  showContact?: boolean
  className?: string
}

export function UserList({
  users,
  onUserClick,
  onRemove,
  emptyMessage = 'No users assigned',
  showContact = false,
  className,
}: UserListProps) {
  if (users.length === 0) {
    return (
      <div
        className={cn(
          'p-6 rounded-lg border border-dashed border-charcoal-200 text-center',
          className
        )}
      >
        <Users className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
        <p className="text-sm text-charcoal-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {users.map((user, index) => (
        <UserCard
          key={user.id || index}
          user={user}
          showContact={showContact}
          onEdit={onUserClick ? () => onUserClick(user) : undefined}
          onRemove={onRemove ? () => onRemove(user) : undefined}
        />
      ))}
    </div>
  )
}
