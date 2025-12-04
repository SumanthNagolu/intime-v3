'use client';

import * as React from 'react';
import { FormProvider } from 'react-hook-form';
import { FormField, SelectOption } from '../FormField';
import { FormSection, FormGrid, FormDivider } from '../FormSection';
import { leadFormSchema, LeadFormValues } from '../validation';
import { useFormWithDefaults, useFormDraft, useFormDirtyState } from '../hooks';
import { transformLeadFormToPayload } from '../transformers';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Send, Target } from 'lucide-react';

// ============================================
// Options
// ============================================

const leadTypeOptions: SelectOption[] = [
  { value: 'company', label: 'Company' },
  { value: 'person', label: 'Person' },
];

const leadStatusOptions: SelectOption[] = [
  { value: 'new', label: 'New' },
  { value: 'warm', label: 'Warm' },
  { value: 'hot', label: 'Hot' },
  { value: 'cold', label: 'Cold' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const companyTypeOptions: SelectOption[] = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
  { value: 'msp_vms', label: 'MSP/VMS' },
  { value: 'system_integrator', label: 'System Integrator' },
];

const companySizeOptions: SelectOption[] = [
  { value: 'small', label: 'Small (1-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

const tierOptions: SelectOption[] = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'mid_market', label: 'Mid Market' },
  { value: 'smb', label: 'SMB' },
  { value: 'strategic', label: 'Strategic' },
];

const decisionAuthorityOptions: SelectOption[] = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
  { value: 'end_user', label: 'End User' },
  { value: 'champion', label: 'Champion' },
];

const sourceOptions: SelectOption[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'event', label: 'Event/Conference' },
  { value: 'partner', label: 'Partner' },
  { value: 'ad_campaign', label: 'Ad Campaign' },
  { value: 'other', label: 'Other' },
];

// ============================================
// BANT Score Component
// ============================================

interface BANTScoreProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  notesName: string;
}

function BANTScoreItem({ label, description, value, onChange, notesName }: BANTScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 20) return 'text-green-500';
    if (score >= 10) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{label}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className={`text-2xl font-bold ${getScoreColor(value)}`}>
          {value}/25
        </span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={25}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Component Props
// ============================================

export interface LeadFormProps {
  initialValues?: Partial<LeadFormValues>;
  onSubmit: (values: LeadFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

// ============================================
// Component
// ============================================

export function LeadForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}: LeadFormProps) {
  const form = useFormWithDefaults<LeadFormValues>({
    formType: 'lead',
    initialValues,
    schema: leadFormSchema,
  });

  const { handleSubmit, formState: { isDirty }, watch, setValue } = form;
  const leadType = watch('leadType');
  const bantBudget = watch('bantBudget') || 0;
  const bantAuthority = watch('bantAuthority') || 0;
  const bantNeed = watch('bantNeed') || 0;
  const bantTimeline = watch('bantTimeline') || 0;

  const totalBANTScore = bantBudget + bantAuthority + bantNeed + bantTimeline;
  const bantPercentage = (totalBANTScore / 100) * 100;

  // Form draft
  const { saveDraft, clearDraft, hasDraft, lastSavedAt } = useFormDraft<LeadFormValues>({
    key: `lead_${initialValues?.companyName || 'new'}`,
    enabled: mode === 'create',
  });

  // Dirty state warning
  const { confirmLeave } = useFormDirtyState(isDirty);

  const handleFormSubmit = async (values: LeadFormValues) => {
    const payload = transformLeadFormToPayload(values);
    await onSubmit(payload as LeadFormValues);
    clearDraft();
  };

  const handleCancel = () => {
    if (confirmLeave()) {
      clearDraft();
      onCancel?.();
    }
  };

  const getLeadQualification = () => {
    if (totalBANTScore >= 75) return { label: 'Highly Qualified', color: 'text-green-500' };
    if (totalBANTScore >= 50) return { label: 'Qualified', color: 'text-blue-500' };
    if (totalBANTScore >= 25) return { label: 'Needs Development', color: 'text-yellow-500' };
    return { label: 'Not Qualified', color: 'text-muted-foreground' };
  };

  const qualification = getLeadQualification();

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Lead Type & Status */}
        <FormSection title="Lead Classification" description="Type and status of this lead">
          <FormGrid columns={3}>
            <FormField<LeadFormValues>
              name="leadType"
              label="Lead Type"
              type="radio"
              options={leadTypeOptions}
            />
            <FormField<LeadFormValues>
              name="status"
              label="Status"
              type="select"
              options={leadStatusOptions}
            />
            <FormField<LeadFormValues>
              name="source"
              label="Source"
              type="select"
              options={sourceOptions}
            />
          </FormGrid>
        </FormSection>

        {/* Company Information (for company leads) */}
        {leadType === 'company' && (
          <FormSection title="Company Information" description="Details about the company">
            <FormGrid columns={2}>
              <FormField<LeadFormValues>
                name="companyName"
                label="Company Name"
                required
              />
              <FormField<LeadFormValues>
                name="website"
                label="Website"
                type="url"
              />
            </FormGrid>
            <FormGrid columns={3}>
              <FormField<LeadFormValues>
                name="industry"
                label="Industry"
              />
              <FormField<LeadFormValues>
                name="companyType"
                label="Company Type"
                type="select"
                options={companyTypeOptions}
              />
              <FormField<LeadFormValues>
                name="companySize"
                label="Company Size"
                type="select"
                options={companySizeOptions}
              />
            </FormGrid>
            <FormGrid columns={2}>
              <FormField<LeadFormValues>
                name="headquarters"
                label="Headquarters"
              />
              <FormField<LeadFormValues>
                name="tier"
                label="Tier"
                type="select"
                options={tierOptions}
              />
            </FormGrid>
          </FormSection>
        )}

        {/* Contact Information */}
        <FormSection title="Contact Information" description="Primary contact details">
          <FormGrid columns={2}>
            <FormField<LeadFormValues>
              name="firstName"
              label="First Name"
              required={leadType === 'person'}
            />
            <FormField<LeadFormValues>
              name="lastName"
              label="Last Name"
              required={leadType === 'person'}
            />
          </FormGrid>
          <FormGrid columns={2}>
            <FormField<LeadFormValues>
              name="title"
              label="Title"
            />
            <FormField<LeadFormValues>
              name="decisionAuthority"
              label="Decision Authority"
              type="select"
              options={decisionAuthorityOptions}
            />
          </FormGrid>
          <FormGrid columns={3}>
            <FormField<LeadFormValues>
              name="email"
              label="Email"
              type="email"
            />
            <FormField<LeadFormValues>
              name="phone"
              label="Phone"
              type="phone"
            />
            <FormField<LeadFormValues>
              name="linkedinUrl"
              label="LinkedIn"
              type="url"
            />
          </FormGrid>
        </FormSection>

        {/* Value */}
        <FormSection title="Estimated Value" description="Potential value of this lead">
          <FormGrid columns={2}>
            <FormField<LeadFormValues>
              name="estimatedValue"
              label="Estimated Value"
              type="currency"
              description="Annual contract value estimate"
            />
          </FormGrid>
        </FormSection>

        {/* BANT Qualification */}
        <FormSection
          title="BANT Qualification"
          description="Score the lead based on Budget, Authority, Need, and Timeline"
          badge={`${totalBANTScore}/100`}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total BANT Score</span>
              <span className={`text-sm font-medium ${qualification.color}`}>
                {qualification.label}
              </span>
            </div>
            <Progress value={bantPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BANTScoreItem
              label="Budget"
              description="Does the prospect have budget allocated?"
              value={bantBudget}
              onChange={(v) => setValue('bantBudget', v)}
              notesName="bantBudgetNotes"
            />
            <BANTScoreItem
              label="Authority"
              description="Is this the decision maker?"
              value={bantAuthority}
              onChange={(v) => setValue('bantAuthority', v)}
              notesName="bantAuthorityNotes"
            />
            <BANTScoreItem
              label="Need"
              description="Is there a clear business need?"
              value={bantNeed}
              onChange={(v) => setValue('bantNeed', v)}
              notesName="bantNeedNotes"
            />
            <BANTScoreItem
              label="Timeline"
              description="Is there urgency or a deadline?"
              value={bantTimeline}
              onChange={(v) => setValue('bantTimeline', v)}
              notesName="bantTimelineNotes"
            />
          </div>

          {/* BANT Notes */}
          <div className="mt-6 space-y-4">
            <FormGrid columns={2}>
              <FormField<LeadFormValues>
                name="bantBudgetNotes"
                label="Budget Notes"
                type="textarea"
                rows={2}
                placeholder="Notes about budget..."
              />
              <FormField<LeadFormValues>
                name="bantAuthorityNotes"
                label="Authority Notes"
                type="textarea"
                rows={2}
                placeholder="Notes about decision-making authority..."
              />
            </FormGrid>
            <FormGrid columns={2}>
              <FormField<LeadFormValues>
                name="bantNeedNotes"
                label="Need Notes"
                type="textarea"
                rows={2}
                placeholder="Notes about business need..."
              />
              <FormField<LeadFormValues>
                name="bantTimelineNotes"
                label="Timeline Notes"
                type="textarea"
                rows={2}
                placeholder="Notes about timeline..."
              />
            </FormGrid>
          </div>
        </FormSection>

        {/* General Notes */}
        <FormSection title="Notes" defaultOpen={false}>
          <FormField<LeadFormValues>
            name="notes"
            type="textarea"
            rows={3}
            placeholder="Additional notes about this lead..."
          />
        </FormSection>

        {/* Form Actions */}
        <FormDivider />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className={`font-medium ${qualification.color}`}>
                {qualification.label} ({totalBANTScore}/100)
              </span>
            </div>
            {hasDraft && lastSavedAt && (
              <span className="text-sm text-muted-foreground">
                Draft saved {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Lead' : 'Update Lead'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default LeadForm;
