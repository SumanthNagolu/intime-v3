'use client';

import React, { useState } from 'react';
import { Mail, Phone, Calendar, FileText, Linkedin, Send, Clock, Loader2 } from 'lucide-react';
import { useCreateLeadActivity } from '@/hooks/mutations/leads';

type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message';

interface ActivityComposerProps {
  entityType: 'lead' | 'deal' | 'account';
  entityId: string;
  onActivityCreated?: () => void;
}

const ACTIVITY_TABS: { id: ActivityType; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'meeting', label: 'Meeting', icon: Calendar },
  { id: 'linkedin_message', label: 'LinkedIn', icon: Linkedin },
  { id: 'note', label: 'Note', icon: FileText },
];

const OUTCOME_OPTIONS = [
  { value: 'positive', label: 'Positive', color: 'bg-green-100 text-green-600' },
  { value: 'neutral', label: 'Neutral', color: 'bg-stone-100 text-stone-600' },
  { value: 'negative', label: 'Negative', color: 'bg-red-100 text-red-600' },
] as const;

export function ActivityComposer({ entityType, entityId, onActivityCreated }: ActivityComposerProps) {
  const [activeTab, setActiveTab] = useState<ActivityType>('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [direction, setDirection] = useState<'inbound' | 'outbound'>('outbound');
  const [outcome, setOutcome] = useState<'positive' | 'neutral' | 'negative' | undefined>(undefined);
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(undefined);

  const createActivity = useCreateLeadActivity();

  const resetForm = () => {
    setSubject('');
    setBody('');
    setDirection('outbound');
    setOutcome(undefined);
    setNextAction('');
    setNextActionDate('');
    setDurationMinutes(undefined);
  };

  const handleSubmit = () => {
    if (!body.trim() && !subject.trim()) return;

    createActivity.mutate(
      {
        entityType,
        entityId,
        activityType: activeTab,
        subject: subject || undefined,
        body: body || undefined,
        direction: activeTab === 'email' || activeTab === 'call' ? direction : undefined,
        outcome: outcome || undefined,
        nextAction: nextAction || undefined,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
        durationMinutes: durationMinutes || undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          onActivityCreated?.();
        },
      }
    );
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'email':
        return 'Write your email content...';
      case 'call':
        return 'Log details about this call...';
      case 'meeting':
        return 'Meeting notes and key points...';
      case 'linkedin_message':
        return 'LinkedIn message content...';
      case 'note':
        return 'Add a note about this lead...';
    }
  };

  const getSubmitLabel = () => {
    switch (activeTab) {
      case 'email':
        return 'Log Email';
      case 'call':
        return 'Log Call';
      case 'meeting':
        return 'Log Meeting';
      case 'linkedin_message':
        return 'Log Message';
      case 'note':
        return 'Save Note';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-stone-100">
        {ACTIVITY_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-charcoal border-b-2 border-rust'
                  : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        {/* Subject (for emails and meetings) */}
        {(activeTab === 'email' || activeTab === 'meeting') && (
          <div className="flex gap-4">
            <input
              className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <button className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-400 hover:text-charcoal hover:border-charcoal transition-colors">
              <Clock size={18} />
            </button>
          </div>
        )}

        {/* Direction (for emails, calls, linkedin) */}
        {(activeTab === 'email' || activeTab === 'call' || activeTab === 'linkedin_message') && (
          <div className="flex gap-2">
            <button
              onClick={() => setDirection('outbound')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                direction === 'outbound'
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              Outbound
            </button>
            <button
              onClick={() => setDirection('inbound')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                direction === 'inbound'
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              Inbound
            </button>
          </div>
        )}

        {/* Body */}
        <textarea
          className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
          placeholder={getPlaceholder()}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        {/* Duration (for calls and meetings) */}
        {(activeTab === 'call' || activeTab === 'meeting') && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                placeholder="30"
                value={durationMinutes || ''}
                onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
        )}

        {/* Outcome */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
            Outcome
          </label>
          <div className="flex gap-2">
            {OUTCOME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOutcome(outcome === opt.value ? undefined : opt.value)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                  outcome === opt.value ? opt.color + ' border-transparent' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Next Action */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Next Action
            </label>
            <input
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
              placeholder="Follow up call"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Due Date
            </label>
            <input
              type="date"
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSubmit}
            disabled={createActivity.isPending || (!body.trim() && !subject.trim())}
            className="px-6 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createActivity.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                {getSubmitLabel()} <Send size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
