'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Briefcase, Users, Building2, Contact, DollarSign, Send } from 'lucide-react';
import type { RecentItem } from '@/lib/navigation';

interface SidebarRecentItemsProps {
  items: RecentItem[];
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
 * Recent items section in sidebar
 * Shows up to 5 recently viewed entities
 */
export function SidebarRecentItems({
  items,
  maxItems = 5,
}: SidebarRecentItemsProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <div className="px-3 py-2 flex items-center gap-2">
        <Clock size={12} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Recent</span>
      </div>

      {/* Recent Items */}
      {displayItems.map((item) => {
        const Icon = entityIcons[item.entityType] || Briefcase;
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-2 h-8 px-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Icon size={14} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm text-muted-foreground hover:text-foreground truncate">
              {item.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
