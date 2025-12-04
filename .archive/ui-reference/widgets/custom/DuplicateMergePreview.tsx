'use client';

/**
 * Duplicate Merge Preview Widget
 *
 * Side-by-side comparison for merging duplicate records.
 * Allows field-level merge control and master record selection.
 */

import React, { useState } from 'react';
import {
  GitMerge, ArrowLeft, ArrowRight, Check, AlertTriangle,
  User, Mail, Phone, Building2, Calendar, MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface RecordField {
  id: string;
  label: string;
  icon: React.ElementType;
  leftValue: string | null;
  rightValue: string | null;
}

interface DuplicateRecord {
  id: string;
  name: string;
  createdAt: string;
  activityCount: number;
}

const SAMPLE_FIELDS: RecordField[] = [
  { id: 'firstName', label: 'First Name', icon: User, leftValue: 'John', rightValue: 'Jonathan' },
  { id: 'lastName', label: 'Last Name', icon: User, leftValue: 'Smith', rightValue: 'Smith' },
  { id: 'email', label: 'Email', icon: Mail, leftValue: 'john.smith@company.com', rightValue: 'j.smith@company.com' },
  { id: 'phone', label: 'Phone', icon: Phone, leftValue: '(555) 123-4567', rightValue: null },
  { id: 'company', label: 'Company', icon: Building2, leftValue: 'Acme Corp', rightValue: 'Acme Corporation' },
  { id: 'location', label: 'Location', icon: MapPin, leftValue: 'New York, NY', rightValue: 'New York' },
  { id: 'createdAt', label: 'Created', icon: Calendar, leftValue: '2024-01-15', rightValue: '2024-02-20' },
];

const SAMPLE_RECORDS: { left: DuplicateRecord; right: DuplicateRecord } = {
  left: { id: 'rec_001', name: 'John Smith', createdAt: '2024-01-15', activityCount: 24 },
  right: { id: 'rec_002', name: 'Jonathan Smith', createdAt: '2024-02-20', activityCount: 8 },
};

type MergeChoice = 'left' | 'right' | null;

function FieldRow({
  field,
  choice,
  onChoose,
}: {
  field: RecordField;
  choice: MergeChoice;
  onChoose: (choice: MergeChoice) => void;
}) {
  const Icon = field.icon;
  const valuesMatch = field.leftValue === field.rightValue;

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 p-3 rounded-lg hover:bg-charcoal-50 transition-colors">
      {/* Left value */}
      <button
        onClick={() => onChoose(choice === 'left' ? null : 'left')}
        disabled={!field.leftValue}
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg border-2 transition-all text-left",
          choice === 'left'
            ? "border-forest-500 bg-forest-50"
            : "border-transparent hover:border-charcoal-200",
          !field.leftValue && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
          choice === 'left' ? "border-forest-500 bg-forest-500" : "border-charcoal-300"
        )}>
          {choice === 'left' && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className={cn(
          "text-sm",
          field.leftValue ? "text-charcoal-700" : "text-charcoal-400 italic"
        )}>
          {field.leftValue || 'Empty'}
        </span>
      </button>

      {/* Field label */}
      <div className="flex items-center gap-2 px-3">
        <Icon className="w-4 h-4 text-charcoal-400" />
        <span className="text-xs font-medium text-charcoal-500 whitespace-nowrap">
          {field.label}
        </span>
        {valuesMatch && field.leftValue && (
          <Check className="w-3 h-3 text-success-500" />
        )}
      </div>

      {/* Right value */}
      <button
        onClick={() => onChoose(choice === 'right' ? null : 'right')}
        disabled={!field.rightValue}
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg border-2 transition-all text-left justify-end",
          choice === 'right'
            ? "border-forest-500 bg-forest-50"
            : "border-transparent hover:border-charcoal-200",
          !field.rightValue && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn(
          "text-sm",
          field.rightValue ? "text-charcoal-700" : "text-charcoal-400 italic"
        )}>
          {field.rightValue || 'Empty'}
        </span>
        <div className={cn(
          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
          choice === 'right' ? "border-forest-500 bg-forest-500" : "border-charcoal-300"
        )}>
          {choice === 'right' && <Check className="w-3 h-3 text-white" />}
        </div>
      </button>
    </div>
  );
}

export function DuplicateMergePreview({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const [masterRecord, setMasterRecord] = useState<'left' | 'right'>('left');
  const [fieldChoices, setFieldChoices] = useState<Record<string, MergeChoice>>({});

  const records = SAMPLE_RECORDS;
  const fields = SAMPLE_FIELDS;

  const handleFieldChoice = (fieldId: string, choice: MergeChoice) => {
    setFieldChoices(prev => ({ ...prev, [fieldId]: choice }));
  };

  const handleSelectAllLeft = () => {
    const choices: Record<string, MergeChoice> = {};
    fields.forEach(f => { if (f.leftValue) choices[f.id] = 'left'; });
    setFieldChoices(choices);
  };

  const handleSelectAllRight = () => {
    const choices: Record<string, MergeChoice> = {};
    fields.forEach(f => { if (f.rightValue) choices[f.id] = 'right'; });
    setFieldChoices(choices);
  };

  const selectedCount = Object.values(fieldChoices).filter(v => v !== null).length;

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
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <GitMerge className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Merge Duplicates') || 'Merge Duplicates'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {selectedCount} of {fields.length} fields selected
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Record headers */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 mb-4">
          {/* Left record */}
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all",
            masterRecord === 'left'
              ? "border-forest-500 bg-forest-50"
              : "border-charcoal-200 hover:border-charcoal-300"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-charcoal-500 uppercase">Record A</span>
              <button
                onClick={() => setMasterRecord('left')}
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full transition-colors",
                  masterRecord === 'left'
                    ? "bg-forest-500 text-white"
                    : "bg-charcoal-100 text-charcoal-500 hover:bg-charcoal-200"
                )}
              >
                {masterRecord === 'left' ? 'Master' : 'Set as Master'}
              </button>
            </div>
            <p className="font-medium text-charcoal-900">{records.left.name}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-charcoal-500">
              <span>Created {records.left.createdAt}</span>
              <span>•</span>
              <span>{records.left.activityCount} activities</span>
            </div>
          </div>

          {/* Center actions */}
          <div className="flex flex-col items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllLeft}
              className="h-8 w-8 p-0"
              title="Select all from left"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllRight}
              className="h-8 w-8 p-0"
              title="Select all from right"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right record */}
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all",
            masterRecord === 'right'
              ? "border-forest-500 bg-forest-50"
              : "border-charcoal-200 hover:border-charcoal-300"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-charcoal-500 uppercase">Record B</span>
              <button
                onClick={() => setMasterRecord('right')}
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full transition-colors",
                  masterRecord === 'right'
                    ? "bg-forest-500 text-white"
                    : "bg-charcoal-100 text-charcoal-500 hover:bg-charcoal-200"
                )}
              >
                {masterRecord === 'right' ? 'Master' : 'Set as Master'}
              </button>
            </div>
            <p className="font-medium text-charcoal-900">{records.right.name}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-charcoal-500">
              <span>Created {records.right.createdAt}</span>
              <span>•</span>
              <span>{records.right.activityCount} activities</span>
            </div>
          </div>
        </div>

        {/* Field comparison */}
        <div className="divide-y divide-charcoal-100">
          {fields.map(field => (
            <FieldRow
              key={field.id}
              field={field}
              choice={fieldChoices[field.id] || null}
              onChoose={(choice) => handleFieldChoice(field.id, choice)}
            />
          ))}
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-800">Merge is permanent</p>
            <p className="text-xs text-warning-600 mt-0.5">
              The non-master record will be deleted. All activities and relationships will be moved to the master record.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-charcoal-100">
          <Button variant="outline">Cancel</Button>
          <Button className="gap-2">
            <GitMerge className="w-4 h-4" />
            Merge Records
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DuplicateMergePreview;
