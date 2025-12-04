'use client';

import React from 'react';
import Link from 'next/link';
import { Pin, X, Briefcase, Users, Building2, Contact, DollarSign, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PinnedItem } from '@/lib/navigation';
import { Button } from '@/components/ui/button';

interface SidebarPinnedItemsProps {
  items: PinnedItem[];
  onUnpin?: (id: string) => void;
  maxItems?: number;
}

const entityIcons = {
  job: Briefcase,
  candidate: Users,
  account: Building2,
  contact: Contact,
  deal: DollarSign,
  submission: Send,
};

/**
 * Pinned items section in sidebar
 * Shows up to 5 pinned entities with quick navigation
 */
export function SidebarPinnedItems({
  items,
  onUnpin,
  maxItems = 5,
}: SidebarPinnedItemsProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <div className="px-3 py-2 flex items-center gap-2">
        <Pin size={12} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Pinned</span>
      </div>

      {/* Pinned Items */}
      {displayItems.map((item) => {
        const Icon = entityIcons[item.entityType] || Briefcase;
        return (
          <div
            key={item.id}
            className="group flex items-center gap-2 h-8 px-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Icon size={14} className="text-muted-foreground shrink-0" />
            <Link
              href={item.href}
              className="flex-1 text-sm text-muted-foreground hover:text-foreground truncate"
            >
              {item.title}
            </Link>
            {onUnpin && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-muted-foreground/10'
                )}
                onClick={() => onUnpin(item.id)}
              >
                <X size={12} />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
