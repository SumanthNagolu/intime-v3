'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Briefcase,
  Users,
  Building2,
  Contact,
  DollarSign,
  Send,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CommandCategory, CommandItem } from '@/lib/navigation';

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: CommandCategory[];
}

const defaultCategories: CommandCategory[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    items: [
      { id: 'jobs', type: 'navigation', category: 'navigation', title: 'Jobs', icon: Briefcase, href: '/employee/workspace/jobs', keywords: ['jobs', 'positions', 'requisitions'] },
      { id: 'candidates', type: 'navigation', category: 'navigation', title: 'Candidates', icon: Users, href: '/employee/workspace/candidates', keywords: ['candidates', 'talent', 'people'] },
      { id: 'accounts', type: 'navigation', category: 'navigation', title: 'Accounts', icon: Building2, href: '/employee/workspace/accounts', keywords: ['accounts', 'clients', 'companies'] },
      { id: 'contacts', type: 'navigation', category: 'navigation', title: 'Contacts', icon: Contact, href: '/employee/workspace/contacts', keywords: ['contacts', 'people'] },
      { id: 'deals', type: 'navigation', category: 'navigation', title: 'Deals', icon: DollarSign, href: '/employee/workspace/deals', keywords: ['deals', 'opportunities', 'sales'] },
      { id: 'submissions', type: 'navigation', category: 'navigation', title: 'Submissions', icon: Send, href: '/employee/workspace/submissions', keywords: ['submissions', 'submittals'] },
    ],
  },
  {
    id: 'actions',
    label: 'Quick Actions',
    items: [
      { id: 'new-job', type: 'action', category: 'actions', title: 'Create New Job', subtitle: 'Add a new job requisition', icon: Plus, keywords: ['new', 'create', 'job'] },
      { id: 'new-candidate', type: 'action', category: 'actions', title: 'Add Candidate', subtitle: 'Add a new candidate profile', icon: Plus, keywords: ['new', 'create', 'candidate'] },
      { id: 'submit-candidate', type: 'action', category: 'actions', title: 'Submit Candidate', subtitle: 'Submit a candidate to a job', icon: ArrowRight, keywords: ['submit', 'send'] },
    ],
  },
];

/**
 * Command bar (Cmd+K) component
 * Based on 01-LAYOUT-SHELL.md command bar specification
 * Modal overlay with search and quick actions
 */
export function CommandBar({
  open,
  onOpenChange,
  categories = defaultCategories,
}: CommandBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isCommandMode = query.startsWith('>');

  // Filter items based on query
  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories;

    const searchQuery = query.toLowerCase().replace(/^>\s*/, '');
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const matchTitle = item.title.toLowerCase().includes(searchQuery);
          const matchSubtitle = item.subtitle?.toLowerCase().includes(searchQuery);
          const matchKeywords = item.keywords?.some((k) =>
            k.toLowerCase().includes(searchQuery)
          );
          return matchTitle || matchSubtitle || matchKeywords;
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [query, categories]);

  // Get all visible items for keyboard navigation
  const allItems = useMemo(() => {
    return filteredCategories.flatMap((c) => c.items);
  }, [filteredCategories]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle item selection
  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.href) {
        router.push(item.href);
      } else if (item.action) {
        item.action();
      }
      onOpenChange(false);
      setQuery('');
    },
    [router, onOpenChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % allItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + allItems.length) % allItems.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (allItems[selectedIndex]) {
            handleSelect(allItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          setQuery('');
          break;
      }
    },
    [allItems, selectedIndex, handleSelect, onOpenChange]
  );

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b">
          <Search size={20} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 h-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {query && (
            <kbd className="h-5 px-1.5 text-xs bg-muted rounded border">
              esc
            </kbd>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {isCommandMode && (
              <div className="px-3 py-2 mb-1">
                <span className="text-xs font-medium text-forest">
                  Command Mode
                </span>
              </div>
            )}

            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No results found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="mb-4">
                  <div className="px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {category.label}
                    </span>
                  </div>
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = allItems.indexOf(item);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = item.icon || Briefcase;

                    return (
                      <button
                        key={item.id}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                          'text-left transition-colors',
                          isSelected
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-muted'
                        )}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            item.type === 'action'
                              ? 'bg-forest/10 text-forest'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {item.type === 'navigation' && (
                          <ArrowRight
                            size={14}
                            className="text-muted-foreground shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="h-5 px-1.5 bg-background rounded border">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="h-5 px-1.5 bg-background rounded border">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="h-5 px-1.5 bg-background rounded border">esc</kbd>
            <span>Close</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <kbd className="h-5 px-1.5 bg-background rounded border">&gt;</kbd>
            <span>Commands</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
