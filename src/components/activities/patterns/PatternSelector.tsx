/**
 * Pattern Selector
 *
 * Modal for selecting an activity pattern from available options.
 * Groups patterns by category with search functionality.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ACTIVITY_PATTERNS,
  getPatternsByCategory,
  getPatternsForEntity,
  searchPatterns,
  getCategoryLabel,
  getCategoryColor,
  type ActivityPattern,
  type PatternCategory,
} from '@/lib/activities/patterns';
import { PatternCard } from './PatternCard';

// Categories in display order
const CATEGORIES: PatternCategory[] = [
  'general',
  'recruiting',
  'bench_sales',
  'crm',
  'hr',
];

// Recent patterns storage key
const RECENT_PATTERNS_KEY = 'intime_recent_patterns';
const MAX_RECENT_PATTERNS = 5;

export interface PatternSelectorProps {
  /** Whether modal is open */
  open: boolean;

  /** Open change handler */
  onOpenChange: (open: boolean) => void;

  /** Callback when pattern is selected */
  onSelect: (pattern: ActivityPattern) => void;

  /** Filter patterns to specific entity type */
  entityType?: string;

  /** Show only quick-log patterns */
  quickLogOnly?: boolean;
}

function getRecentPatterns(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_PATTERNS_KEY) || '[]');
  } catch {
    return [];
  }
}

function addToRecentPatterns(patternId: string) {
  const recent = getRecentPatterns().filter(id => id !== patternId);
  recent.unshift(patternId);
  localStorage.setItem(
    RECENT_PATTERNS_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT_PATTERNS))
  );
}

export function PatternSelector({
  open,
  onOpenChange,
  onSelect,
  entityType,
  quickLogOnly = false,
}: PatternSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PatternCategory | 'all' | 'recent'>('all');
  const [hoveredPattern, setHoveredPattern] = useState<ActivityPattern | null>(null);

  // Get recent pattern IDs
  const recentPatternIds = useMemo(() => getRecentPatterns(), [open]);

  // Get recent patterns as objects
  const recentPatterns = useMemo(() => {
    return recentPatternIds
      .map(id => ACTIVITY_PATTERNS[id])
      .filter(Boolean) as ActivityPattern[];
  }, [recentPatternIds]);

  // Filter patterns based on criteria
  const allPatterns = useMemo(() => {
    let patterns = Object.values(ACTIVITY_PATTERNS);

    // Filter by entity type if specified
    if (entityType) {
      patterns = getPatternsForEntity(entityType);
    }

    // Filter quick-log only
    if (quickLogOnly) {
      patterns = patterns.filter(p => p.quickLog);
    }

    return patterns;
  }, [entityType, quickLogOnly]);

  // Get filtered patterns based on search and category
  const filteredPatterns = useMemo(() => {
    let patterns = allPatterns;

    // Apply search
    if (searchQuery.trim()) {
      patterns = searchPatterns(searchQuery).filter(p => allPatterns.includes(p));
    }

    // Apply category filter
    if (selectedCategory !== 'all' && selectedCategory !== 'recent') {
      patterns = patterns.filter(p => p.category === selectedCategory);
    }

    return patterns;
  }, [allPatterns, searchQuery, selectedCategory]);

  // Group patterns by category
  const patternsByCategory = useMemo(() => {
    const grouped = new Map<PatternCategory, ActivityPattern[]>();

    for (const category of CATEGORIES) {
      const categoryPatterns = filteredPatterns.filter(p => p.category === category);
      if (categoryPatterns.length > 0) {
        grouped.set(category, categoryPatterns);
      }
    }

    return grouped;
  }, [filteredPatterns]);

  const handleSelect = (pattern: ActivityPattern) => {
    addToRecentPatterns(pattern.id);
    onSelect(pattern);
    onOpenChange(false);
  };

  // Reset search on open
  React.useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Activity Type</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as PatternCategory | 'all' | 'recent')}
        >
          <TabsList className="flex-wrap h-auto py-1">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            {recentPatterns.length > 0 && (
              <TabsTrigger value="recent" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Recent
              </TabsTrigger>
            )}
            {CATEGORIES.map((category) => {
              const count = allPatterns.filter(p => p.category === category).length;
              if (count === 0) return null;
              return (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {getCategoryLabel(category)}
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Pattern Grid */}
          <ScrollArea className="flex-1 mt-4 -mx-6 px-6" style={{ maxHeight: '50vh' }}>
            {/* Recent patterns section */}
            {selectedCategory === 'recent' && recentPatterns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recently Used
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {recentPatterns.map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onClick={() => handleSelect(pattern)}
                      onHover={setHoveredPattern}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All patterns or category-filtered */}
            {selectedCategory !== 'recent' && (
              <div className="space-y-6">
                {Array.from(patternsByCategory.entries()).map(([category, patterns]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded text-xs', getCategoryColor(category))}>
                        {getCategoryLabel(category)}
                      </span>
                      <span className="text-muted-foreground">({patterns.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {patterns.map((pattern) => (
                        <PatternCard
                          key={pattern.id}
                          pattern={pattern}
                          onClick={() => handleSelect(pattern)}
                          onHover={setHoveredPattern}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {filteredPatterns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No patterns found matching your search
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </Tabs>

        {/* Pattern Preview (on hover) */}
        {hoveredPattern && (
          <div className="mt-4 p-4 bg-muted rounded-lg border">
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg', getCategoryColor(hoveredPattern.category))}>
                <hoveredPattern.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{hoveredPattern.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {hoveredPattern.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Priority: {hoveredPattern.defaultPriority}</span>
                  {hoveredPattern.slaTier && <span>SLA: {hoveredPattern.slaTier}h</span>}
                  {hoveredPattern.checklist.length > 0 && (
                    <span>{hoveredPattern.checklist.length} checklist items</span>
                  )}
                  {hoveredPattern.fields.length > 0 && (
                    <span>{hoveredPattern.fields.length} fields</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PatternSelector;
