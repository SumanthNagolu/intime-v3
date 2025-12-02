/**
 * Event Feed Item
 *
 * System event display within a feed - expandable with metadata.
 */

'use client';

import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ChevronDown, ChevronUp, ExternalLink, Clock, User, Zap,
  FileText, Mail, Phone, Calendar, MessageSquare, CheckCircle,
  AlertCircle, UserPlus, Send, Eye, Download, Upload, Edit,
  Trash2, Link, ArrowRight, Bot,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

export type EventType =
  // Activity events
  | 'activity_created'
  | 'activity_started'
  | 'activity_completed'
  | 'activity_deferred'
  | 'activity_cancelled'
  | 'activity_reassigned'
  // Communication events
  | 'email_sent'
  | 'email_received'
  | 'call_made'
  | 'call_received'
  | 'sms_sent'
  | 'sms_received'
  // Entity events
  | 'entity_created'
  | 'entity_updated'
  | 'entity_deleted'
  | 'entity_viewed'
  // Status events
  | 'status_changed'
  | 'stage_changed'
  // Document events
  | 'document_uploaded'
  | 'document_downloaded'
  | 'document_signed'
  // Meeting events
  | 'meeting_scheduled'
  | 'meeting_completed'
  | 'meeting_cancelled'
  // System events
  | 'automation_triggered'
  | 'integration_sync'
  | 'reminder_sent';

export interface FeedEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
    avatarUrl?: string;
    type: 'user' | 'system' | 'automation';
  };
  entity?: {
    type: string;
    id: string;
    name: string;
    url: string;
  };
  metadata?: Record<string, unknown>;
}

export interface EventFeedItemProps {
  /** Event data */
  event: FeedEvent;

  /** Click handler for entity link */
  onEntityClick?: (entity: FeedEvent['entity']) => void;

  /** Show relative timestamps */
  relativeTime?: boolean;

  /** Compact mode */
  compact?: boolean;

  /** Additional className */
  className?: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const EVENT_ICONS: Record<EventType, typeof Clock> = {
  // Activity events
  activity_created: FileText,
  activity_started: ArrowRight,
  activity_completed: CheckCircle,
  activity_deferred: Clock,
  activity_cancelled: Trash2,
  activity_reassigned: UserPlus,
  // Communication events
  email_sent: Send,
  email_received: Mail,
  call_made: Phone,
  call_received: Phone,
  sms_sent: MessageSquare,
  sms_received: MessageSquare,
  // Entity events
  entity_created: FileText,
  entity_updated: Edit,
  entity_deleted: Trash2,
  entity_viewed: Eye,
  // Status events
  status_changed: ArrowRight,
  stage_changed: ArrowRight,
  // Document events
  document_uploaded: Upload,
  document_downloaded: Download,
  document_signed: FileText,
  // Meeting events
  meeting_scheduled: Calendar,
  meeting_completed: CheckCircle,
  meeting_cancelled: Trash2,
  // System events
  automation_triggered: Zap,
  integration_sync: Link,
  reminder_sent: AlertCircle,
};

const EVENT_COLORS: Record<EventType, string> = {
  // Activity events - blue
  activity_created: 'bg-blue-100 text-blue-600',
  activity_started: 'bg-blue-100 text-blue-600',
  activity_completed: 'bg-green-100 text-green-600',
  activity_deferred: 'bg-amber-100 text-amber-600',
  activity_cancelled: 'bg-red-100 text-red-600',
  activity_reassigned: 'bg-purple-100 text-purple-600',
  // Communication events - teal
  email_sent: 'bg-teal-100 text-teal-600',
  email_received: 'bg-teal-100 text-teal-600',
  call_made: 'bg-teal-100 text-teal-600',
  call_received: 'bg-teal-100 text-teal-600',
  sms_sent: 'bg-teal-100 text-teal-600',
  sms_received: 'bg-teal-100 text-teal-600',
  // Entity events - gray
  entity_created: 'bg-gray-100 text-gray-600',
  entity_updated: 'bg-gray-100 text-gray-600',
  entity_deleted: 'bg-red-100 text-red-600',
  entity_viewed: 'bg-gray-100 text-gray-600',
  // Status events - purple
  status_changed: 'bg-purple-100 text-purple-600',
  stage_changed: 'bg-purple-100 text-purple-600',
  // Document events - orange
  document_uploaded: 'bg-orange-100 text-orange-600',
  document_downloaded: 'bg-orange-100 text-orange-600',
  document_signed: 'bg-green-100 text-green-600',
  // Meeting events - indigo
  meeting_scheduled: 'bg-indigo-100 text-indigo-600',
  meeting_completed: 'bg-green-100 text-green-600',
  meeting_cancelled: 'bg-red-100 text-red-600',
  // System events - gray
  automation_triggered: 'bg-violet-100 text-violet-600',
  integration_sync: 'bg-gray-100 text-gray-600',
  reminder_sent: 'bg-amber-100 text-amber-600',
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatEventMetadata(type: EventType, metadata?: Record<string, unknown>): React.ReactElement | null {
  if (!metadata) return null;

  switch (type) {
    case 'status_changed':
    case 'stage_changed':
      return (
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline">{String(metadata.oldValue)}</Badge>
          <ArrowRight className="h-3 w-3" />
          <Badge variant="outline">{String(metadata.newValue)}</Badge>
        </div>
      );

    case 'email_sent':
    case 'email_received': {
      const subject = metadata.subject;
      const recipients = metadata.recipients;
      return (
        <div className="text-xs space-y-1">
          {subject ? <p key="subject"><strong>Subject:</strong> {String(subject)}</p> : null}
          {recipients ? (
            <p key="recipients"><strong>To:</strong> {Array.isArray(recipients) ? recipients.join(', ') : String(recipients)}</p>
          ) : null}
        </div>
      );
    }

    case 'call_made':
    case 'call_received': {
      const duration = metadata.duration;
      const outcome = metadata.outcome;
      return (
        <div className="text-xs space-y-1">
          {duration ? <p key="duration"><strong>Duration:</strong> {String(duration)}</p> : null}
          {outcome ? <p key="outcome"><strong>Outcome:</strong> {String(outcome)}</p> : null}
        </div>
      );
    }

    case 'document_uploaded':
    case 'document_downloaded': {
      const fileName = metadata.fileName;
      const fileSize = metadata.fileSize;
      return (
        <div className="text-xs space-y-1">
          {fileName ? <p key="fileName"><strong>File:</strong> {String(fileName)}</p> : null}
          {fileSize ? <p key="fileSize"><strong>Size:</strong> {String(fileSize)}</p> : null}
        </div>
      );
    }

    case 'meeting_scheduled': {
      const scheduledAt = metadata.scheduledAt;
      const attendees = metadata.attendees;
      return (
        <div className="text-xs space-y-1">
          {scheduledAt ? (
            <p key="scheduledAt"><strong>When:</strong> {format(new Date(String(scheduledAt)), 'PPp')}</p>
          ) : null}
          {attendees ? (
            <p key="attendees"><strong>Attendees:</strong> {Array.isArray(attendees) ? attendees.length : 1}</p>
          ) : null}
        </div>
      );
    }

    case 'automation_triggered': {
      const automationName = metadata.automationName;
      const actions = metadata.actions;
      return (
        <div className="text-xs space-y-1">
          {automationName ? <p key="automationName"><strong>Automation:</strong> {String(automationName)}</p> : null}
          {actions ? <p key="actions"><strong>Actions:</strong> {String(actions)}</p> : null}
        </div>
      );
    }

    default:
      // Generic metadata display
      const entries = Object.entries(metadata).slice(0, 3);
      if (entries.length === 0) return null;
      return (
        <div className="text-xs space-y-1">
          {entries.map(([key, value]) => (
            <p key={key}>
              <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong>{' '}
              {String(value)}
            </p>
          ))}
        </div>
      );
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function EventFeedItem({
  event,
  onEntityClick,
  relativeTime = true,
  compact = false,
  className,
}: EventFeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const Icon = EVENT_ICONS[event.type] || Clock;
  const colorClass = EVENT_COLORS[event.type] || 'bg-gray-100 text-gray-600';
  const timestamp = new Date(event.timestamp);
  const isSystem = event.actor?.type === 'system' || event.actor?.type === 'automation';

  const hasExpandableContent = event.description || event.metadata;

  return (
    <div className={cn(
      'group flex gap-3 p-3',
      !compact && 'hover:bg-muted/30 rounded-lg',
      className
    )}>
      {/* Icon */}
      <div className={cn(
        'p-1.5 rounded-full h-fit flex-shrink-0',
        colorClass
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm">
            {/* Actor */}
            {event.actor && (
              <span className="font-medium">
                {isSystem ? (
                  <span className="inline-flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    {event.actor.name}
                  </span>
                ) : (
                  event.actor.name
                )}
              </span>
            )}{' '}
            {/* Title */}
            <span className="text-muted-foreground">{event.title}</span>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {relativeTime
              ? formatDistanceToNow(timestamp, { addSuffix: true })
              : format(timestamp, 'MMM d, h:mm a')
            }
          </span>
        </div>

        {/* Entity Link */}
        {event.entity && (
          <button
            onClick={() => onEntityClick?.(event.entity)}
            className="inline-flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
          >
            <span className="capitalize">{event.entity.type}:</span>
            <span className="truncate max-w-[200px]">{event.entity.name}</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        )}

        {/* Expand Toggle */}
        {!compact && hasExpandableContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show details
              </>
            )}
          </button>
        )}

        {/* Expanded Content */}
        {isExpanded && !compact && hasExpandableContent && (
          <div className="mt-2 space-y-2 pl-0">
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            {event.metadata && formatEventMetadata(event.type, event.metadata)}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventFeedItem;
