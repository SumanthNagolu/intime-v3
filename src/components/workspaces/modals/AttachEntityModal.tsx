/**
 * AttachEntityModal Component
 *
 * Generic modal for searching and linking entities together.
 * Supports dual-mode: search existing OR create new inline.
 */

'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Loader2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getEntityConfig, type EntityType } from '@/lib/workspace/entity-registry';

// =====================================================
// TYPES
// =====================================================

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  avatar?: string;
  initials?: string;
}

export interface AttachEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  notesLabel?: string;
  notesPlaceholder?: string;
  // Search
  searchResults: SearchResultItem[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  // Attach
  onAttach: (targetId: string, notes?: string) => Promise<void>;
  isAttaching?: boolean;
  // Create new (optional)
  allowCreate?: boolean;
  createForm?: ReactNode;
  createLabel?: string;
  onCreateSuccess?: (newId: string) => void;
}

// =====================================================
// SEARCH RESULT ITEM
// =====================================================

function SearchResultRow({
  item,
  targetType,
  isSelected,
  onClick,
}: {
  item: SearchResultItem;
  targetType: EntityType;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = getEntityConfig(targetType);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        isSelected
          ? 'border-rust bg-rust/5'
          : 'border-stone-200 hover:border-stone-300'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden',
            config.bgColor,
            config.color
          )}
        >
          {item.avatar ? (
            <Image src={item.avatar} alt="" fill unoptimized className="rounded-lg object-cover" />
          ) : (
            item.initials || item.title.slice(0, 2).toUpperCase()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-charcoal truncate">{item.title}</div>
          {item.subtitle && (
            <div className="text-xs text-stone-500 truncate">{item.subtitle}</div>
          )}
        </div>

        {/* Status */}
        {item.status && (
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px] flex-shrink-0',
              config.statuses[item.status.toLowerCase()]?.bgColor,
              config.statuses[item.status.toLowerCase()]?.color
            )}
          >
            {item.status}
          </Badge>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="w-5 h-5 bg-rust rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function AttachEntityModal({
  isOpen,
  onClose,
  sourceType,
  sourceId: _sourceId,
  targetType,
  title,
  description,
  searchPlaceholder,
  notesLabel = 'Notes',
  notesPlaceholder = 'Add notes about this connection...',
  searchResults,
  isSearching,
  onSearch,
  onAttach,
  isAttaching = false,
  allowCreate = false,
  createForm,
  createLabel = 'Create New',
  onCreateSuccess: _onCreateSuccess,
}: AttachEntityModalProps) {
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const targetConfig = getEntityConfig(targetType);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch(query);
    },
    [onSearch]
  );

  const handleAttach = async () => {
    if (!selectedId) return;
    await onAttach(selectedId, notes.trim() || undefined);
    // Reset and close
    setSelectedId(null);
    setNotes('');
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    if (!isAttaching) {
      setSelectedId(null);
      setNotes('');
      setSearchQuery('');
      setMode('search');
      onClose();
    }
  };

  const defaultTitle = `Attach ${targetConfig.name}`;
  const defaultDescription = `Link a ${targetConfig.name.toLowerCase()} to this ${getEntityConfig(sourceType).name.toLowerCase()}`;
  const defaultPlaceholder = `Search ${targetConfig.pluralName.toLowerCase()}...`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          {(description || defaultDescription) && (
            <p className="text-sm text-muted-foreground">{description || defaultDescription}</p>
          )}
        </DialogHeader>

        {/* Mode Toggle */}
        {allowCreate && (
          <div className="flex gap-2">
            <Button
              variant={mode === 'search' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setMode('search')}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Existing
            </Button>
            <Button
              variant={mode === 'create' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setMode('create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              {createLabel}
            </Button>
          </div>
        )}

        {mode === 'search' ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder || defaultPlaceholder}
                className="pl-9"
              />
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[300px] space-y-2">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <SearchResultRow
                    key={item.id}
                    item={item}
                    targetType={targetType}
                    isSelected={selectedId === item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))
              ) : searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-stone-500 mb-2">No results found</p>
                  {allowCreate && (
                    <Button variant="link" onClick={() => setMode('create')}>
                      Create a new {targetConfig.name.toLowerCase()} instead
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Start typing to search</p>
                </div>
              )}
            </div>

            {/* Notes (when selected) */}
            {selectedId && (
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-sm font-medium">{notesLabel} (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={notesPlaceholder}
                  rows={2}
                  className="resize-none"
                />
              </div>
            )}
          </>
        ) : (
          /* Create Form */
          <div className="flex-1 overflow-y-auto py-2">{createForm}</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isAttaching}>
            Cancel
          </Button>
          {mode === 'search' && (
            <Button
              onClick={handleAttach}
              disabled={!selectedId || isAttaching}
            >
              {isAttaching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Attaching...
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Attach {targetConfig.name}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AttachEntityModal;
