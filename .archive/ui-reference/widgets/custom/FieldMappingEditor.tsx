'use client';

/**
 * Field Mapping Editor Widget
 *
 * Provides a UI for mapping fields between source and target systems.
 * Supports transformation rules and bidirectional sync configuration.
 */

import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, RefreshCw, Settings2, AlertCircle, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation: string;
  required: boolean;
  syncDirection: 'push' | 'pull' | 'bidirectional';
}

interface FieldOption {
  value: string;
  label: string;
  type: string;
}

const SOURCE_FIELDS: FieldOption[] = [
  { value: 'email', label: 'Email', type: 'string' },
  { value: 'firstName', label: 'First Name', type: 'string' },
  { value: 'lastName', label: 'Last Name', type: 'string' },
  { value: 'phone', label: 'Phone', type: 'string' },
  { value: 'company', label: 'Company', type: 'string' },
  { value: 'title', label: 'Job Title', type: 'string' },
  { value: 'status', label: 'Status', type: 'enum' },
  { value: 'createdAt', label: 'Created Date', type: 'date' },
  { value: 'updatedAt', label: 'Updated Date', type: 'date' },
];

const TARGET_FIELDS: FieldOption[] = [
  { value: 'contact_email', label: 'Contact Email', type: 'string' },
  { value: 'first_name', label: 'First Name', type: 'string' },
  { value: 'last_name', label: 'Last Name', type: 'string' },
  { value: 'phone_number', label: 'Phone Number', type: 'string' },
  { value: 'company_name', label: 'Company Name', type: 'string' },
  { value: 'job_title', label: 'Job Title', type: 'string' },
  { value: 'lead_status', label: 'Lead Status', type: 'enum' },
  { value: 'created_date', label: 'Created Date', type: 'date' },
  { value: 'modified_date', label: 'Modified Date', type: 'date' },
];

const TRANSFORMATIONS = [
  { value: 'none', label: 'No transformation' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'titlecase', label: 'Title Case' },
  { value: 'trim', label: 'Trim whitespace' },
  { value: 'phone_format', label: 'Format phone number' },
  { value: 'date_iso', label: 'ISO date format' },
  { value: 'custom', label: 'Custom formula' },
];

const DEFAULT_MAPPINGS: FieldMapping[] = [
  { id: '1', sourceField: 'email', targetField: 'contact_email', transformation: 'lowercase', required: true, syncDirection: 'bidirectional' },
  { id: '2', sourceField: 'firstName', targetField: 'first_name', transformation: 'titlecase', required: true, syncDirection: 'push' },
  { id: '3', sourceField: 'lastName', targetField: 'last_name', transformation: 'titlecase', required: true, syncDirection: 'push' },
  { id: '4', sourceField: 'phone', targetField: 'phone_number', transformation: 'phone_format', required: false, syncDirection: 'bidirectional' },
];

function MappingRow({
  mapping,
  onUpdate,
  onRemove,
}: {
  mapping: FieldMapping;
  onUpdate: (id: string, updates: Partial<FieldMapping>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
      {/* Source field */}
      <div className="flex-1">
        <select
          value={mapping.sourceField}
          onChange={(e) => onUpdate(mapping.id, { sourceField: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-charcoal-200 rounded-lg bg-white focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        >
          <option value="">Select source field</option>
          {SOURCE_FIELDS.map(field => (
            <option key={field.value} value={field.value}>
              {field.label} ({field.type})
            </option>
          ))}
        </select>
      </div>

      {/* Arrow */}
      <div className="shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          mapping.syncDirection === 'bidirectional'
            ? "bg-forest-100 text-forest-600"
            : mapping.syncDirection === 'push'
              ? "bg-blue-100 text-blue-600"
              : "bg-gold-100 text-gold-600"
        )}>
          {mapping.syncDirection === 'bidirectional' ? (
            <RefreshCw className="w-4 h-4" />
          ) : (
            <ArrowRight className={cn(
              "w-4 h-4",
              mapping.syncDirection === 'pull' && "rotate-180"
            )} />
          )}
        </div>
      </div>

      {/* Target field */}
      <div className="flex-1">
        <select
          value={mapping.targetField}
          onChange={(e) => onUpdate(mapping.id, { targetField: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-charcoal-200 rounded-lg bg-white focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        >
          <option value="">Select target field</option>
          {TARGET_FIELDS.map(field => (
            <option key={field.value} value={field.value}>
              {field.label} ({field.type})
            </option>
          ))}
        </select>
      </div>

      {/* Transformation */}
      <div className="w-40 shrink-0">
        <select
          value={mapping.transformation}
          onChange={(e) => onUpdate(mapping.id, { transformation: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-charcoal-200 rounded-lg bg-white focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        >
          {TRANSFORMATIONS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Required badge */}
      <button
        onClick={() => onUpdate(mapping.id, { required: !mapping.required })}
        className={cn(
          "px-2 py-1 text-xs font-bold rounded-full transition-colors",
          mapping.required
            ? "bg-error-100 text-error-700"
            : "bg-charcoal-100 text-charcoal-500"
        )}
      >
        {mapping.required ? 'Required' : 'Optional'}
      </button>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(mapping.id)}
        className="h-8 w-8 p-0 text-charcoal-400 hover:text-error-600"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function FieldMappingEditor({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const [mappings, setMappings] = useState<FieldMapping[]>(
    (data as FieldMapping[] | undefined) || DEFAULT_MAPPINGS
  );
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      id: `new-${Date.now()}`,
      sourceField: '',
      targetField: '',
      transformation: 'none',
      required: false,
      syncDirection: 'push',
    };
    setMappings([...mappings, newMapping]);
    setHasChanges(true);
  };

  const handleUpdateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, ...updates } : m));
    setHasChanges(true);
  };

  const handleRemoveMapping = (id: string) => {
    setMappings(mappings.filter(m => m.id !== id));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving mappings:', mappings);
    setHasChanges(false);
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
              <div key={i} className="h-14 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const validMappings = mappings.filter(m => m.sourceField && m.targetField).length;
  const invalidMappings = mappings.filter(m => !m.sourceField || !m.targetField).length;

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-forest rounded-lg flex items-center justify-center shadow-sm">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : 'Field Mappings') || 'Field Mappings'}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {validMappings} mappings configured
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddMapping} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Mapping
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Header row */}
        <div className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-charcoal-500 uppercase tracking-wider">
          <div className="flex-1">Source Field</div>
          <div className="w-8" />
          <div className="flex-1">Target Field</div>
          <div className="w-40">Transformation</div>
          <div className="w-16" />
          <div className="w-8" />
        </div>

        {/* Mapping rows */}
        <div className="space-y-2">
          {mappings.map(mapping => (
            <MappingRow
              key={mapping.id}
              mapping={mapping}
              onUpdate={handleUpdateMapping}
              onRemove={handleRemoveMapping}
            />
          ))}
        </div>

        {mappings.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings2 className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-sm font-medium text-charcoal-600">
              No field mappings configured
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              Add mappings to sync data between systems
            </p>
          </div>
        )}

        {/* Validation warning */}
        {invalidMappings > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-warning-600 shrink-0" />
            <p className="text-sm text-warning-700">
              {invalidMappings} mapping{invalidMappings > 1 ? 's' : ''} incomplete. Select both source and target fields.
            </p>
          </div>
        )}

        {/* Action buttons */}
        {hasChanges && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-charcoal-100">
            <Button variant="outline" onClick={() => { setMappings(DEFAULT_MAPPINGS); setHasChanges(false); }}>
              Reset
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Save Mappings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FieldMappingEditor;
