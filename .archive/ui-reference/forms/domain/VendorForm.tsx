'use client';

import * as React from 'react';
import { FormProvider } from 'react-hook-form';
import { FormField, SelectOption } from '../FormField';
import { FormSection, FormGrid, FormDivider } from '../FormSection';
import { vendorFormSchema, VendorFormValues, vendorAgreementSchema, VendorAgreementValues } from '../validation';
import { vendorFormDefaults, vendorAgreementDefaults } from '../defaults';
import { useFormWithDefaults, useFormDraft, useFormDirtyState } from '../hooks';
import { transformVendorFormToPayload } from '../transformers';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Send, Building2, FileText, Users } from 'lucide-react';

// ============================================
// Options
// ============================================

const vendorTypeOptions: SelectOption[] = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'prime_vendor', label: 'Prime Vendor' },
  { value: 'sub_vendor', label: 'Sub Vendor' },
  { value: 'msp', label: 'MSP' },
  { value: 'vms', label: 'VMS' },
];

const vendorTierOptions: SelectOption[] = [
  { value: 'preferred', label: 'Preferred' },
  { value: 'standard', label: 'Standard' },
  { value: 'new', label: 'New' },
];

const agreementTypeOptions: SelectOption[] = [
  { value: 'prime_vendor', label: 'Prime Vendor' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'co_marketing', label: 'Co-Marketing' },
];

const commissionTypeOptions: SelectOption[] = [
  { value: 'fixed_percentage', label: 'Fixed Percentage' },
  { value: 'tiered_percentage', label: 'Tiered Percentage' },
  { value: 'fixed_dollar', label: 'Fixed Dollar Amount' },
  { value: 'custom', label: 'Custom' },
];

const invoiceFrequencyOptions: SelectOption[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const paymentMethodOptions: SelectOption[] = [
  { value: 'ach', label: 'ACH' },
  { value: 'check', label: 'Check' },
  { value: 'wire', label: 'Wire Transfer' },
];

const exclusivityOptions: SelectOption[] = [
  { value: 'none', label: 'No Exclusivity' },
  { value: 'first_right_of_refusal', label: 'First Right of Refusal' },
  { value: 'exclusive', label: 'Exclusive' },
];

const relationshipTypeOptions: SelectOption[] = [
  { value: 'Primary', label: 'Primary' },
  { value: 'Operational', label: 'Operational' },
  { value: 'Billing', label: 'Billing' },
  { value: 'Executive', label: 'Executive' },
];

const stateOptions: SelectOption[] = [
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'FL', label: 'Florida' },
  { value: 'IL', label: 'Illinois' },
  { value: 'WA', label: 'Washington' },
  { value: 'GA', label: 'Georgia' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'MA', label: 'Massachusetts' },
  // Add more as needed
];

// ============================================
// Component Props
// ============================================

export interface VendorFormProps {
  initialValues?: Partial<VendorFormValues>;
  onSubmit: (values: VendorFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  showAgreementTab?: boolean;
}

// ============================================
// Component
// ============================================

export function VendorForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  showAgreementTab = true,
}: VendorFormProps) {
  const form = useFormWithDefaults<VendorFormValues>({
    formType: 'vendor',
    initialValues,
    schema: vendorFormSchema,
  });

  const { handleSubmit, formState: { isDirty }, watch } = form;
  const commissionType = watch('primaryContact');

  // Form draft
  const { saveDraft, clearDraft, hasDraft, lastSavedAt } = useFormDraft<VendorFormValues>({
    key: `vendor_${initialValues?.name || 'new'}`,
    enabled: mode === 'create',
  });

  // Dirty state warning
  const { confirmLeave } = useFormDirtyState(isDirty);

  const handleFormSubmit = async (values: VendorFormValues) => {
    const payload = transformVendorFormToPayload(values);
    await onSubmit(payload as VendorFormValues);
    clearDraft();
  };

  const handleCancel = () => {
    if (confirmLeave()) {
      clearDraft();
      onCancel?.();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Info
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Primary Contact
            </TabsTrigger>
            {showAgreementTab && (
              <TabsTrigger value="agreement" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Agreement Terms
              </TabsTrigger>
            )}
          </TabsList>

          {/* Company Information Tab */}
          <TabsContent value="company" className="space-y-6 mt-6">
            <FormSection title="Company Details" description="Basic vendor information">
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="name"
                  label="Company Name"
                  placeholder="e.g., Acme Staffing Inc."
                  required
                />
                <FormField<VendorFormValues>
                  name="legalName"
                  label="Legal Name"
                  placeholder="Legal name as on W-9"
                />
              </FormGrid>
              <FormGrid columns={3}>
                <FormField<VendorFormValues>
                  name="type"
                  label="Vendor Type"
                  type="select"
                  options={vendorTypeOptions}
                  required
                />
                <FormField<VendorFormValues>
                  name="tier"
                  label="Tier"
                  type="select"
                  options={vendorTierOptions}
                />
                <FormField<VendorFormValues>
                  name="website"
                  label="Website"
                  type="url"
                  placeholder="https://example.com"
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Business Details" description="Company size and focus areas">
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="yearFounded"
                  label="Year Founded"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                />
                <FormField<VendorFormValues>
                  name="consultantPoolSize"
                  label="Consultant Pool Size"
                  type="number"
                  min={0}
                  description="Estimated number of consultants on bench"
                />
              </FormGrid>
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="industryFocus"
                  label="Industry Focus"
                  type="tag-input"
                  placeholder="Add industry and press Enter"
                />
                <FormField<VendorFormValues>
                  name="geographicFocus"
                  label="Geographic Coverage"
                  type="multi-select"
                  options={stateOptions}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Address" description="Headquarters location">
              <FormField<VendorFormValues>
                name="address.street"
                label="Street Address"
                placeholder="123 Main St"
              />
              <FormGrid columns={4}>
                <FormField<VendorFormValues>
                  name="address.city"
                  label="City"
                />
                <FormField<VendorFormValues>
                  name="address.state"
                  label="State"
                  type="select"
                  options={stateOptions}
                />
                <FormField<VendorFormValues>
                  name="address.postalCode"
                  label="Postal Code"
                />
                <FormField<VendorFormValues>
                  name="address.country"
                  label="Country"
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Contact" description="General contact information">
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="phone"
                  label="Phone"
                  type="phone"
                />
                <FormField<VendorFormValues>
                  name="email"
                  label="Email"
                  type="email"
                />
              </FormGrid>
            </FormSection>
          </TabsContent>

          {/* Primary Contact Tab */}
          <TabsContent value="contact" className="space-y-6 mt-6">
            <FormSection title="Primary Contact" description="Main point of contact">
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="primaryContact.firstName"
                  label="First Name"
                  required
                />
                <FormField<VendorFormValues>
                  name="primaryContact.lastName"
                  label="Last Name"
                  required
                />
              </FormGrid>
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="primaryContact.title"
                  label="Title"
                  placeholder="e.g., VP of Partnerships"
                />
                <FormField<VendorFormValues>
                  name="primaryContact.department"
                  label="Department"
                />
              </FormGrid>
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="primaryContact.email"
                  label="Email"
                  type="email"
                  required
                />
                <FormField<VendorFormValues>
                  name="primaryContact.phone"
                  label="Phone"
                  type="phone"
                  required
                />
              </FormGrid>
              <FormGrid columns={2}>
                <FormField<VendorFormValues>
                  name="primaryContact.linkedinUrl"
                  label="LinkedIn URL"
                  type="url"
                />
                <FormField<VendorFormValues>
                  name="primaryContact.preferredContactMethod"
                  label="Preferred Contact Method"
                  type="select"
                  options={[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'mobile', label: 'Mobile' },
                    { value: 'linkedin', label: 'LinkedIn' },
                  ]}
                />
              </FormGrid>
            </FormSection>
          </TabsContent>

          {/* Agreement Terms Tab (for onboarding) */}
          {showAgreementTab && (
            <TabsContent value="agreement" className="space-y-6 mt-6">
              <FormSection title="Agreement Type" description="Type of partnership">
                <FormGrid columns={2}>
                  {/* Note: These fields would need a separate agreement form or be nested */}
                  <div className="text-sm text-muted-foreground">
                    Agreement terms configuration is handled separately during the onboarding
                    workflow. Navigate to the vendor profile after creation to set up
                    commission terms and contract details.
                  </div>
                </FormGrid>
              </FormSection>
            </TabsContent>
          )}
        </Tabs>

        {/* Notes */}
        <FormSection title="Notes" description="Internal notes about this vendor" defaultOpen={false}>
          <FormField<VendorFormValues>
            name="notes"
            type="textarea"
            rows={3}
            placeholder="Add any internal notes about this vendor..."
          />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Vendor' : 'Update Vendor'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default VendorForm;
