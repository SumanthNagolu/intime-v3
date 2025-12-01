/**
 * Quick Log Bar Component
 * 
 * Provides quick action buttons to log activities.
 * Appears on entity detail views for one-click activity logging.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Phone, Mail, Calendar, CheckCircle, FileText, MessageSquare,
  Linkedin, Send, Plus,
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

export interface QuickLogBarProps {
  /** Entity type (candidate, job, etc.) */
  entityType: string;
  
  /** Entity ID */
  entityId: string;
  
  /** Entity name for activity subject */
  entityName?: string;
  
  /** Callback when an activity type is clicked */
  onLogActivity: (activityType: string, defaults?: Record<string, unknown>) => void;
  
  /** Callback when opening full activity modal */
  onOpenModal?: () => void;
  
  /** Variant: inline shows all buttons, compact shows dropdown */
  variant?: 'inline' | 'compact';
  
  /** Activity types to show (defaults to all) */
  showTypes?: string[];
  
  /** Additional className */
  className?: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const ACTIVITY_TYPES = [
  { type: 'call', icon: Phone, label: 'Log Call', color: 'text-blue-600', hoverBg: 'hover:bg-blue-50' },
  { type: 'email', icon: Mail, label: 'Log Email', color: 'text-purple-600', hoverBg: 'hover:bg-purple-50' },
  { type: 'meeting', icon: Calendar, label: 'Schedule Meeting', color: 'text-green-600', hoverBg: 'hover:bg-green-50' },
  { type: 'task', icon: CheckCircle, label: 'Create Task', color: 'text-amber-600', hoverBg: 'hover:bg-amber-50' },
  { type: 'note', icon: FileText, label: 'Add Note', color: 'text-gray-600', hoverBg: 'hover:bg-gray-50' },
  { type: 'sms', icon: MessageSquare, label: 'Log SMS', color: 'text-teal-600', hoverBg: 'hover:bg-teal-50' },
  { type: 'linkedin', icon: Linkedin, label: 'Log LinkedIn', color: 'text-sky-600', hoverBg: 'hover:bg-sky-50' },
  { type: 'submission', icon: Send, label: 'Create Submission', color: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50' },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function QuickLogBar({
  entityType,
  entityId,
  entityName,
  onLogActivity,
  onOpenModal,
  variant = 'inline',
  showTypes,
  className,
}: QuickLogBarProps) {
  const visibleTypes = showTypes 
    ? ACTIVITY_TYPES.filter(t => showTypes.includes(t.type))
    : ACTIVITY_TYPES.slice(0, 5); // Default to first 5
  
  const handleClick = (activityType: string) => {
    const defaults: Record<string, unknown> = {
      entityType,
      entityId,
    };
    
    if (entityName) {
      defaults.subject = `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} with ${entityName}`;
    }
    
    onLogActivity(activityType, defaults);
  };
  
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <TooltipProvider>
          {visibleTypes.slice(0, 3).map(({ type, icon: Icon, label, color, hoverBg }) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', hoverBg)}
                  onClick={() => handleClick(type)}
                >
                  <Icon className={cn('h-4 w-4', color)} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {onOpenModal && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onOpenModal}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More activity options</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 bg-stone-50 rounded-lg',
      className
    )}>
      <span className="text-sm text-muted-foreground mr-2">Log:</span>
      
      <div className="flex items-center gap-1">
        {visibleTypes.map(({ type, icon: Icon, label, color, hoverBg }) => (
          <TooltipProvider key={type}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('gap-1.5 px-2', hoverBg)}
                  onClick={() => handleClick(type)}
                >
                  <Icon className={cn('h-4 w-4', color)} />
                  <span className="hidden sm:inline text-xs">{type}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {onOpenModal && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 px-2 ml-2"
            onClick={onOpenModal}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">More</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuickLogBar;

