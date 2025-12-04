'use client';

import * as React from 'react';
import { FormProvider } from 'react-hook-form';
import { FormField, FieldType, SelectOption } from '../FormField';
import { FormSection, FormGrid, FormDivider } from '../FormSection';
import { jobFormSchema, JobFormValues } from '../validation';
import { jobFormDefaults } from '../defaults';
import { useFormWithDefaults, useFormDraft, useFormDirtyState } from '../hooks';
import { transformJobFormToPayload } from '../transformers';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Send } from 'lucide-react';

// ============================================
// Options
// ============================================

const jobStatusOptions: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'filled', label: 'Filled' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const jobTypeOptions: SelectOption[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'contract_to_hire', label: 'Contract to Hire' },
  { value: 'temp', label: 'Temporary' },
];

const workModeOptions: SelectOption[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const rateTypeOptions: SelectOption[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

const visaTypeOptions: SelectOption[] = [
  { value: 'usc', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H1B' },
  { value: 'h1b_transfer', label: 'H1B Transfer' },
  { value: 'opt', label: 'OPT' },
  { value: 'opt_stem', label: 'OPT STEM' },
  { value: 'l1', label: 'L1' },
  { value: 'tn', label: 'TN' },
];

// ============================================
// Component Props
// ============================================

export interface JobFormProps {
  initialValues?: Partial<JobFormValues>;
  onSubmit: (values: JobFormValues) => Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (values: JobFormValues) => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  accountOptions?: SelectOption[];
  recruiterOptions?: SelectOption[];
}

// ============================================
// Component
// ============================================

export function JobForm({
  initialValues,
  onSubmit,
  onCancel,
  onSaveDraft,
  isLoading = false,
  mode = 'create',
  accountOptions = [],
  recruiterOptions = [],
}: JobFormProps) {
  const form = useFormWithDefaults<JobFormValues>({
    formType: 'job',
    initialValues,
    schema: jobFormSchema,
  });

  const { handleSubmit, formState: { isDirty } } = form;

  // Form draft
  const { saveDraft, clearDraft, hasDraft, lastSavedAt } = useFormDraft<JobFormValues>({
    key: `job_${initialValues?.title || 'new'}`,
    enabled: mode === 'create',
  });

  // Dirty state warning
  const { confirmLeave } = useFormDirtyState(isDirty);

  // Auto-save on change
  React.useEffect(() => {
    if (isDirty && mode === 'create') {
      const values = form.getValues();
      saveDraft(values);
    }
  }, [isDirty, mode, form, saveDraft]);

  const handleFormSubmit = async (values: JobFormValues) => {
    const payload = transformJobFormToPayload(values);
    await onSubmit(payload as JobFormValues);
    clearDraft();
  };

  const handleCancel = () => {
    if (confirmLeave()) {
      clearDraft();
      onCancel?.();
    }
  };

  const handleSaveDraft = () => {
    const values = form.getValues();
    onSaveDraft?.(values);
    saveDraft(values);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <FormSection title="Basic Information" description="Core job details">
          <FormGrid columns={2}>
            <FormField<JobFormValues>
              name="title"
              label="Job Title"
              placeholder="e.g., Senior Software Engineer"
              required
            />
            <FormField<JobFormValues>
              name="accountId"
              label="Account"
              type="searchable-select"
              placeholder="Select account"
              options={accountOptions}
            />
          </FormGrid>
          <FormField<JobFormValues>
            name="description"
            label="Job Description"
            type="textarea"
            rows={4}
            placeholder="Describe the role, responsibilities, and requirements..."
          />
        </FormSection>

        {/* Classification */}
        <FormSection title="Classification" description="Job type and priority">
          <FormGrid columns={4}>
            <FormField<JobFormValues>
              name="status"
              label="Status"
              type="select"
              options={jobStatusOptions}
            />
            <FormField<JobFormValues>
              name="priority"
              label="Priority"
              type="select"
              options={priorityOptions}
            />
            <FormField<JobFormValues>
              name="jobType"
              label="Job Type"
              type="select"
              options={jobTypeOptions}
            />
            <FormField<JobFormValues>
              name="positions"
              label="Positions"
              type="number"
              min={1}
            />
          </FormGrid>
        </FormSection>

        {/* Location */}
        <FormSection title="Location" description="Work location details">
          <FormGrid columns={2}>
            <FormField<JobFormValues>
              name="location"
              label="Location"
              placeholder="e.g., New York, NY"
            />
            <FormField<JobFormValues>
              name="workMode"
              label="Work Mode"
              type="select"
              options={workModeOptions}
            />
          </FormGrid>
        </FormSection>

        {/* Compensation */}
        <FormSection title="Compensation" description="Rate and salary details">
          <FormGrid columns={4}>
            <FormField<JobFormValues>
              name="rateType"
              label="Rate Type"
              type="select"
              options={rateTypeOptions}
            />
            <FormField<JobFormValues>
              name="rateMin"
              label="Min Rate"
              type="currency"
            />
            <FormField<JobFormValues>
              name="rateMax"
              label="Max Rate"
              type="currency"
            />
            <FormField<JobFormValues>
              name="currency"
              label="Currency"
              type="select"
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'CAD', label: 'CAD' },
              ]}
            />
          </FormGrid>
        </FormSection>

        {/* Requirements */}
        <FormSection title="Requirements" description="Skills and qualifications">
          <FormGrid columns={2}>
            <FormField<JobFormValues>
              name="requiredSkills"
              label="Required Skills"
              type="tag-input"
              placeholder="Add skill and press Enter"
            />
            <FormField<JobFormValues>
              name="preferredSkills"
              label="Preferred Skills"
              type="tag-input"
              placeholder="Add skill and press Enter"
            />
          </FormGrid>
          <FormGrid columns={3}>
            <FormField<JobFormValues>
              name="experienceMin"
              label="Min Experience (Years)"
              type="number"
              min={0}
            />
            <FormField<JobFormValues>
              name="experienceMax"
              label="Max Experience (Years)"
              type="number"
              min={0}
            />
            <FormField<JobFormValues>
              name="educationLevel"
              label="Education Level"
              placeholder="e.g., Bachelor's Degree"
            />
          </FormGrid>
          <FormField<JobFormValues>
            name="visaTypes"
            label="Accepted Visa Types"
            type="multi-select"
            options={visaTypeOptions}
          />
        </FormSection>

        {/* Timeline */}
        <FormSection title="Timeline" description="Start date and duration" defaultOpen={false}>
          <FormGrid columns={3}>
            <FormField<JobFormValues>
              name="startDate"
              label="Start Date"
              type="date"
            />
            <FormField<JobFormValues>
              name="endDate"
              label="End Date"
              type="date"
            />
            <FormField<JobFormValues>
              name="durationMonths"
              label="Duration (Months)"
              type="number"
              min={1}
            />
          </FormGrid>
        </FormSection>

        {/* Assignment */}
        <FormSection title="Assignment" description="Team and recruiter" defaultOpen={false}>
          <FormGrid columns={2}>
            <FormField<JobFormValues>
              name="recruiterId"
              label="Assigned Recruiter"
              type="searchable-select"
              options={recruiterOptions}
            />
            <FormField<JobFormValues>
              name="notes"
              label="Internal Notes"
              type="textarea"
              rows={2}
            />
          </FormGrid>
        </FormSection>

        {/* Form Actions */}
        <FormDivider />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasDraft && lastSavedAt && (
              <span>Draft saved {lastSavedAt.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            {onSaveDraft && (
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Job' : 'Update Job'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default JobForm;
