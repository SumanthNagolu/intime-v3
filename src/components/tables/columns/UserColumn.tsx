'use client';

/**
 * UserColumn Component
 *
 * Avatar + name display for user fields.
 */

import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { UserConfig } from '../types';

// ==========================================
// PROPS
// ==========================================

interface UserData {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  avatar?: string;
  imageUrl?: string;
}

interface UserColumnProps {
  /** User value - can be a user object or just a name string */
  value: UserData | string | null | undefined;

  /** User configuration */
  config?: UserConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function UserColumn({ value, config = {}, className }: UserColumnProps) {
  if (!value) {
    return <span className="text-muted-foreground">Unassigned</span>;
  }

  const {
    showAvatar = true,
    clickable = false,
    profileRoute,
  } = config;

  // Extract user data
  const userData = typeof value === 'string' ? { name: value } : value;
  const name = userData.name ||
    (userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.firstName || userData.lastName || 'Unknown');
  const avatarUrl = userData.avatarUrl || userData.avatar || userData.imageUrl;
  const email = userData.email;
  const initials = getInitials(name);

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      {showAvatar && (
        <Avatar className="h-6 w-6">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <span className="truncate">{name}</span>
    </div>
  );

  if (clickable && profileRoute && userData.id) {
    const route = profileRoute.replace('{id}', userData.id);
    return (
      <Link href={route} className="hover:underline">
        {content}
      </Link>
    );
  }

  if (email) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>{email}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// ==========================================
// MULTIPLE USERS COLUMN
// ==========================================

interface MultipleUsersColumnProps {
  /** Array of users */
  value: Array<UserData | string> | null | undefined;

  /** Maximum visible users */
  maxVisible?: number;

  /** Additional class name */
  className?: string;
}

export function MultipleUsersColumn({
  value,
  maxVisible = 3,
  className,
}: MultipleUsersColumnProps) {
  if (!value || value.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const visible = value.slice(0, maxVisible);
  const remaining = value.length - maxVisible;

  return (
    <div className={cn('flex items-center', className)}>
      {/* Stacked avatars */}
      <div className="flex -space-x-2">
        {visible.map((user, index) => {
          const userData = typeof user === 'string' ? { name: user } : user;
          const name = userData.name ||
            (userData.firstName && userData.lastName
              ? `${userData.firstName} ${userData.lastName}`
              : 'Unknown');
          const avatarUrl = userData.avatarUrl || userData.avatar || userData.imageUrl;

          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 border-2 border-background">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                    <AvatarFallback className="text-xs">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Remaining count */}
      {remaining > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">+{remaining} more</span>
      )}
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default UserColumn;
