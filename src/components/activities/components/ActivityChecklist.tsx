/**
 * Activity Checklist
 *
 * Checklist component for activity completion tracking.
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, Plus, GripVertical, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  id: string;
  label: string;
  required?: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: {
    id: string;
    name: string;
  };
  custom?: boolean; // User-added item
}

export interface ActivityChecklistProps {
  /** Checklist items */
  items: ChecklistItem[];

  /** Read-only mode */
  readOnly?: boolean;

  /** Allow adding custom items */
  allowCustomItems?: boolean;

  /** Allow reordering */
  allowReorder?: boolean;

  /** Item change handler */
  onChange?: (items: ChecklistItem[]) => void;

  /** Single item toggle handler */
  onItemToggle?: (itemId: string, completed: boolean) => void;

  /** Add item handler */
  onAddItem?: (label: string) => void;

  /** Remove custom item handler */
  onRemoveItem?: (itemId: string) => void;

  /** Show completion timestamps */
  showTimestamps?: boolean;

  /** Additional className */
  className?: string;
}

export function ActivityChecklist({
  items,
  readOnly = false,
  allowCustomItems = true,
  allowReorder = false,
  onChange,
  onItemToggle,
  onAddItem,
  onRemoveItem,
  showTimestamps = true,
  className,
}: ActivityChecklistProps) {
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Calculate progress
  const completedCount = items.filter(item => item.completed).length;
  const requiredItems = items.filter(item => item.required);
  const requiredCompleted = requiredItems.filter(item => item.completed).length;
  const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const allRequiredComplete = requiredItems.every(item => item.completed);

  const handleToggle = (itemId: string) => {
    if (readOnly) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (onItemToggle) {
      onItemToggle(itemId, !item.completed);
    } else if (onChange) {
      const updatedItems = items.map(i =>
        i.id === itemId
          ? {
              ...i,
              completed: !i.completed,
              completedAt: !i.completed ? new Date().toISOString() : undefined,
            }
          : i
      );
      onChange(updatedItems);
    }
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    if (onAddItem) {
      onAddItem(newItemText.trim());
    } else if (onChange) {
      const newItem: ChecklistItem = {
        id: `custom_${Date.now()}`,
        label: newItemText.trim(),
        completed: false,
        custom: true,
      };
      onChange([...items, newItem]);
    }

    setNewItemText('');
    setIsAddingItem(false);
  };

  const handleRemoveItem = (itemId: string) => {
    if (onRemoveItem) {
      onRemoveItem(itemId);
    } else if (onChange) {
      onChange(items.filter(i => i.id !== itemId));
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">Checklist</h3>
          <Badge variant="secondary">
            {completedCount}/{items.length}
          </Badge>
        </div>

        {!allRequiredComplete && requiredItems.length > 0 && (
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            {requiredItems.length - requiredCompleted} required
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Checklist Items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'group flex items-start gap-3 p-2 rounded-lg transition-colors',
              'hover:bg-muted/50',
              item.completed && 'opacity-75'
            )}
          >
            {/* Drag Handle */}
            {allowReorder && !readOnly && (
              <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
            )}

            {/* Checkbox */}
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => handleToggle(item.id)}
              disabled={readOnly}
              className="mt-0.5"
            />

            {/* Label & Meta */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm',
                item.completed && 'line-through text-muted-foreground'
              )}>
                {item.label}
                {item.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </p>

              {/* Completion info */}
              {showTimestamps && item.completed && item.completedAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completed {format(new Date(item.completedAt), 'MMM d \'at\' h:mm a')}
                  {item.completedBy && ` by ${item.completedBy.name}`}
                </p>
              )}
            </div>

            {/* Remove button for custom items */}
            {item.custom && !readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
              </Button>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No checklist items
          </p>
        )}
      </div>

      {/* Add Item */}
      {allowCustomItems && !readOnly && (
        <div className="pt-2 border-t">
          {isAddingItem ? (
            <div className="flex items-center gap-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') {
                    setNewItemText('');
                    setIsAddingItem(false);
                  }
                }}
              />
              <Button size="sm" onClick={handleAddItem} disabled={!newItemText.trim()}>
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewItemText('');
                  setIsAddingItem(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsAddingItem(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add item
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityChecklist;
