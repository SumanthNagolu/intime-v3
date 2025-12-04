'use client';

/**
 * Webhook Event Selector Widget
 *
 * Provides a UI for selecting webhook events with category accordions
 * and payload preview functionality.
 */

import React, { useState } from 'react';
import {
  Webhook, ChevronDown, ChevronRight, Eye, Check, Square, CheckSquare,
  Code2, Copy, Bell, User, Briefcase, FileText, DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface WebhookEvent {
  id: string;
  name: string;
  description: string;
  payload: object;
}

interface EventCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  events: WebhookEvent[];
}

const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'candidates',
    name: 'Candidates',
    icon: User,
    events: [
      { id: 'candidate.created', name: 'Candidate Created', description: 'Fired when a new candidate is added', payload: { id: 'cand_123', name: 'John Doe', email: 'john@example.com' } },
      { id: 'candidate.updated', name: 'Candidate Updated', description: 'Fired when candidate info is modified', payload: { id: 'cand_123', changes: { status: 'active' } } },
      { id: 'candidate.status_changed', name: 'Status Changed', description: 'Fired when candidate status changes', payload: { id: 'cand_123', old_status: 'new', new_status: 'contacted' } },
    ],
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: Briefcase,
    events: [
      { id: 'job.created', name: 'Job Created', description: 'Fired when a new job is posted', payload: { id: 'job_456', title: 'Software Engineer', status: 'open' } },
      { id: 'job.updated', name: 'Job Updated', description: 'Fired when job details are modified', payload: { id: 'job_456', changes: { salary_max: 150000 } } },
      { id: 'job.closed', name: 'Job Closed', description: 'Fired when a job is filled or closed', payload: { id: 'job_456', reason: 'filled' } },
    ],
  },
  {
    id: 'submissions',
    name: 'Submissions',
    icon: FileText,
    events: [
      { id: 'submission.created', name: 'Submission Created', description: 'Fired when candidate is submitted to job', payload: { id: 'sub_789', candidate_id: 'cand_123', job_id: 'job_456' } },
      { id: 'submission.stage_changed', name: 'Stage Changed', description: 'Fired when submission moves to new stage', payload: { id: 'sub_789', old_stage: 'screening', new_stage: 'interview' } },
      { id: 'submission.feedback_received', name: 'Feedback Received', description: 'Fired when client provides feedback', payload: { id: 'sub_789', feedback: { rating: 4, comment: 'Good fit' } } },
    ],
  },
  {
    id: 'placements',
    name: 'Placements',
    icon: DollarSign,
    events: [
      { id: 'placement.created', name: 'Placement Created', description: 'Fired when a new placement is made', payload: { id: 'plc_101', candidate_id: 'cand_123', start_date: '2024-02-01' } },
      { id: 'placement.started', name: 'Placement Started', description: 'Fired on placement start date', payload: { id: 'plc_101', status: 'active' } },
      { id: 'placement.ended', name: 'Placement Ended', description: 'Fired when placement ends', payload: { id: 'plc_101', end_date: '2024-08-01', reason: 'contract_complete' } },
    ],
  },
];

function EventRow({
  event,
  selected,
  onToggle,
  onPreview,
}: {
  event: WebhookEvent;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-colors",
      selected ? "bg-forest-50" : "hover:bg-charcoal-50"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "w-5 h-5 rounded flex items-center justify-center transition-colors",
          selected
            ? "bg-forest-500 text-white"
            : "border border-charcoal-300 text-transparent hover:border-charcoal-400"
        )}
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          selected ? "text-forest-700" : "text-charcoal-700"
        )}>
          {event.name}
        </p>
        <p className="text-xs text-charcoal-500 mt-0.5">{event.description}</p>
      </div>
      <code className="text-xs bg-charcoal-100 text-charcoal-600 px-2 py-0.5 rounded font-mono">
        {event.id}
      </code>
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreview}
        className="h-7 w-7 p-0"
        title="Preview payload"
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );
}

function CategorySection({
  category,
  selectedEvents,
  onToggleEvent,
  onToggleAll,
  onPreview,
}: {
  category: EventCategory;
  selectedEvents: Set<string>;
  onToggleEvent: (eventId: string) => void;
  onToggleAll: (categoryId: string, events: WebhookEvent[]) => void;
  onPreview: (event: WebhookEvent) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = category.icon;
  const selectedCount = category.events.filter(e => selectedEvents.has(e.id)).length;
  const allSelected = selectedCount === category.events.length;

  return (
    <div className="border border-charcoal-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-3 bg-charcoal-50",
          "hover:bg-charcoal-100 transition-colors"
        )}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-charcoal-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-charcoal-500" />
          )}
          <Icon className="w-4 h-4 text-charcoal-600" />
          <span className="font-medium text-charcoal-900">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            selectedCount > 0
              ? "bg-forest-100 text-forest-700"
              : "bg-charcoal-100 text-charcoal-500"
          )}>
            {selectedCount}/{category.events.length}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAll(category.id, category.events); }}
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center transition-colors",
              allSelected
                ? "bg-forest-500 text-white"
                : "border border-charcoal-300 text-charcoal-400 hover:border-charcoal-400"
            )}
          >
            {allSelected ? <Check className="w-3.5 h-3.5" /> : null}
          </button>
        </div>
      </button>
      {isExpanded && (
        <div className="divide-y divide-charcoal-50">
          {category.events.map(event => (
            <EventRow
              key={event.id}
              event={event}
              selected={selectedEvents.has(event.id)}
              onToggle={() => onToggleEvent(event.id)}
              onPreview={() => onPreview(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function WebhookEventSelector({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set((data as string[] | undefined) || [])
  );
  const [previewEvent, setPreviewEvent] = useState<WebhookEvent | null>(null);

  const handleToggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleToggleAll = (categoryId: string, events: WebhookEvent[]) => {
    const newSelected = new Set(selectedEvents);
    const allSelected = events.every(e => newSelected.has(e.id));

    events.forEach(e => {
      if (allSelected) {
        newSelected.delete(e.id);
      } else {
        newSelected.add(e.id);
      }
    });

    setSelectedEvents(newSelected);
  };

  const handleCopyPayload = () => {
    if (previewEvent) {
      navigator.clipboard.writeText(JSON.stringify(previewEvent.payload, null, 2));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-charcoal-100 shadow-elevation-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
                <Webhook className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                  {(typeof definition.title === 'string' ? definition.title : 'Webhook Events') || 'Webhook Events'}
                </CardTitle>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  {selectedEvents.size} events selected
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {EVENT_CATEGORIES.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                selectedEvents={selectedEvents}
                onToggleEvent={handleToggleEvent}
                onToggleAll={handleToggleAll}
                onPreview={setPreviewEvent}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payload Preview Modal */}
      {previewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-forest-600" />
                <div>
                  <h3 className="font-medium text-charcoal-900">{previewEvent.name}</h3>
                  <code className="text-xs text-charcoal-500">{previewEvent.id}</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyPayload} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="p-4 bg-charcoal-900 max-h-96 overflow-auto">
              <pre className="text-sm text-green-400 font-mono">
                {JSON.stringify(previewEvent.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WebhookEventSelector;
