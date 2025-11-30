/**
 * WorkflowTransitionModal Component
 *
 * Generic modal for workflow status transitions with notes/reason.
 * Used for vendor submissions, client decisions, rejections, etc.
 */

'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  type LucideIcon,
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface WorkflowTransition {
  fromStatus: string;
  toStatus: string;
  action: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

interface FieldConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface WorkflowTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transition: WorkflowTransition;
  title?: string;
  description?: string;
  fields?: FieldConfig[];
  notesLabel?: string;
  notesPlaceholder?: string;
  notesRequired?: boolean;
  confirmLabel?: string;
  onConfirm: (data: Record<string, string>) => Promise<void>;
  isProcessing?: boolean;
}

// =====================================================
// VARIANT STYLES
// =====================================================

const VARIANT_STYLES = {
  default: {
    icon: ChevronRight,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    buttonVariant: 'default' as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    buttonVariant: 'default' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    buttonVariant: 'default' as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    buttonVariant: 'destructive' as const,
  },
};

// =====================================================
// FIELD RENDERER
// =====================================================

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="resize-none"
        />
      );
    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'date':
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
    default:
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function WorkflowTransitionModal({
  isOpen,
  onClose,
  transition,
  title,
  description,
  fields = [],
  notesLabel = 'Notes',
  notesPlaceholder = 'Add any relevant notes...',
  notesRequired = false,
  confirmLabel,
  onConfirm,
  isProcessing = false,
}: WorkflowTransitionModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const variantStyle = VARIANT_STYLES[transition.variant || 'default'];
  const Icon = transition.icon || variantStyle.icon;

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleConfirm = async () => {
    const data = { ...formData };
    if (notes.trim()) {
      data.notes = notes.trim();
    }
    await onConfirm(data);
    // Reset
    setFormData({});
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFormData({});
      setNotes('');
      onClose();
    }
  };

  // Check if all required fields are filled
  const requiredFields = fields.filter((f) => f.required);
  const isValid =
    requiredFields.every((f) => formData[f.id]?.trim()) &&
    (!notesRequired || notes.trim());

  const defaultTitle = transition.action;
  const defaultDescription = `Move from "${transition.fromStatus}" to "${transition.toStatus}"`;
  const defaultConfirmLabel = transition.action;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                variantStyle.iconBg
              )}
            >
              <Icon className={cn('w-5 h-5', variantStyle.iconColor)} />
            </div>
            <div>
              <DialogTitle>{title || defaultTitle}</DialogTitle>
              {(description || defaultDescription) && (
                <DialogDescription className="mt-1">
                  {description || defaultDescription}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Transition Visual */}
          <div className="flex items-center justify-center gap-3 py-2 bg-stone-50 rounded-lg">
            <Badge variant="secondary" className="text-xs">
              {transition.fromStatus.replace(/_/g, ' ')}
            </Badge>
            <ChevronRight className="w-4 h-4 text-stone-400" />
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                transition.variant === 'success' && 'bg-green-100 text-green-700',
                transition.variant === 'destructive' && 'bg-red-100 text-red-700',
                transition.variant === 'warning' && 'bg-amber-100 text-amber-700'
              )}
            >
              {transition.toStatus.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Custom Fields */}
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <FieldRenderer
                field={field}
                value={formData[field.id] || ''}
                onChange={(value) => handleFieldChange(field.id, value)}
              />
            </div>
          ))}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {notesLabel}
              {notesRequired && <span className="text-destructive ml-1">*</span>}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={notesPlaceholder}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant={variantStyle.buttonVariant}
            onClick={handleConfirm}
            disabled={!isValid || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="w-4 h-4 mr-2" />
                {confirmLabel || defaultConfirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WorkflowTransitionModal;
