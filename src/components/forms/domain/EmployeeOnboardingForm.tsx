'use client';

import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField, SelectOption } from '../FormField';
import { FormSection, FormGrid, FormDivider } from '../FormSection';
import { FormStepper, FormStep, StepContent } from '../FormStepper';
import { employeeOnboardingSchema, EmployeeOnboardingValues } from '../validation';
import { employeeOnboardingDefaults } from '../defaults';
import { mergeWithDefaults } from '../defaults';
import { useFormDraft, useFormAnalytics } from '../hooks';
import { transformEmployeeOnboardingToPayload } from '../transformers';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  User,
  Building,
  FileText,
  DollarSign,
  Shield,
  Laptop,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ============================================
// Options
// ============================================

const employmentTypeOptions: SelectOption[] = [
  { value: 'fte', label: 'Full-Time Employee' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
  { value: 'part_time', label: 'Part-Time' },
];

const workModeOptions: SelectOption[] = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const salaryTypeOptions: SelectOption[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'annual', label: 'Annual Salary' },
];

const payFrequencyOptions: SelectOption[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'semimonthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
];

const accountTypeOptions: SelectOption[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
];

const laptopOptions: SelectOption[] = [
  { value: 'macbook_pro', label: 'MacBook Pro' },
  { value: 'macbook_air', label: 'MacBook Air' },
  { value: 'dell_xps', label: 'Dell XPS' },
  { value: 'thinkpad', label: 'ThinkPad' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None (BYOD)' },
];

const stateOptions: SelectOption[] = [
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'FL', label: 'Florida' },
  { value: 'IL', label: 'Illinois' },
  // Add more as needed
];

// ============================================
// Component Props
// ============================================

export interface EmployeeOnboardingFormProps {
  initialValues?: Partial<EmployeeOnboardingValues>;
  onSubmit: (values: EmployeeOnboardingValues) => Promise<void>;
  onSaveDraft?: (values: EmployeeOnboardingValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  managerOptions?: SelectOption[];
}

// ============================================
// Step Components
// ============================================

function BasicInfoStep() {
  return (
    <StepContent>
      <FormSection title="Personal Information">
        <FormGrid columns={2}>
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.firstName"
            label="First Name"
            required
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.lastName"
            label="Last Name"
            required
          />
        </FormGrid>
        <FormGrid columns={2}>
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.email"
            label="Email"
            type="email"
            required
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.phone"
            label="Phone"
            type="phone"
          />
        </FormGrid>
        <FormGrid columns={2}>
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.dateOfBirth"
            label="Date of Birth"
            type="date"
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.ssnEncrypted"
            label="Social Security Number"
            type="ssn"
            description="This will be encrypted"
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Address">
        <FormField<EmployeeOnboardingValues>
          name="basicInfo.address.street"
          label="Street Address"
        />
        <FormGrid columns={4}>
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.address.city"
            label="City"
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.address.state"
            label="State"
            type="select"
            options={stateOptions}
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.address.postalCode"
            label="Postal Code"
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.address.country"
            label="Country"
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Emergency Contact">
        <FormGrid columns={3}>
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.emergencyContact.name"
            label="Contact Name"
            required
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.emergencyContact.phone"
            label="Contact Phone"
            type="phone"
          />
          <FormField<EmployeeOnboardingValues>
            name="basicInfo.emergencyContact.relationship"
            label="Relationship"
          />
        </FormGrid>
      </FormSection>
    </StepContent>
  );
}

function EmploymentDetailsStep({ managerOptions }: { managerOptions: SelectOption[] }) {
  return (
    <StepContent>
      <FormSection title="Position Details">
        <FormGrid columns={2}>
          <FormField<EmployeeOnboardingValues>
            name="employmentDetails.jobTitle"
            label="Job Title"
            required
          />
          <FormField<EmployeeOnboardingValues>
            name="employmentDetails.department"
            label="Department"
          />
        </FormGrid>
        <FormGrid columns={2}>
          <FormField<EmployeeOnboardingValues>
            name="employmentDetails.managerId"
            label="Manager"
            type="searchable-select"
            options={managerOptions}
          />
          <FormField<EmployeeOnboardingValues>
            name="employmentDetails.startDate"
            label="Start Date"
            type="date"
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Employment Type">
        <FormGrid columns={3}>
          <FormField<EmployeeOnboardingValues>
            name="employmentDetails.employmentType"
            label="Employment Type"
            type="select"
            options={employmentTypeOptions}
          />
          <FormField<EmployeeOnboardingValues>
            name="employmentDetails.workMode"
            label="Work Mode"
            type="select"
            options={workModeOptions}
          />
          <FormField<EmployeeOnboardingValues>
            name="employmentDetails.workLocation"
            label="Work Location"
            placeholder="e.g., New York, NY"
          />
        </FormGrid>
      </FormSection>
    </StepContent>
  );
}

function I9VerificationStep() {
  return (
    <StepContent>
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Form I-9 must be completed within 3 business days of the employee's start date.
          Section 1 must be completed by the employee. Section 2 will be completed by HR.
        </AlertDescription>
      </Alert>

      <FormSection title="Section 1 - Employee Information">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The employee must attest to their employment authorization status.
            This information was collected in the previous steps.
          </p>

          <FormField<EmployeeOnboardingValues>
            name="i9Section1.completed"
            label="I have reviewed and acknowledge my employment authorization status"
            type="checkbox"
          />
        </div>
      </FormSection>

      <FormSection title="Required Documents" description="List A or List B + List C">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">List A - Documents Establishing Identity AND Employment Authorization</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>U.S. Passport or U.S. Passport Card</li>
              <li>Permanent Resident Card (Green Card)</li>
              <li>Employment Authorization Document (EAD)</li>
              <li>Foreign passport with I-94</li>
            </ul>
          </div>

          <div className="text-center font-medium text-muted-foreground">OR</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">List B - Documents Establishing Identity</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Driver's license</li>
                <li>State ID card</li>
                <li>School ID with photo</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">List C - Documents Establishing Employment Authorization</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Social Security Card (unrestricted)</li>
                <li>Birth Certificate</li>
                <li>U.S. Citizen ID Card</li>
              </ul>
            </div>
          </div>
        </div>
      </FormSection>
    </StepContent>
  );
}

function TaxFormsStep() {
  return (
    <StepContent>
      <FormSection title="Federal Tax Forms">
        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Please complete Form W-4 to determine federal income tax withholding.
              This can be done electronically or on paper.
            </AlertDescription>
          </Alert>

          <FormField<EmployeeOnboardingValues>
            name="taxForms.w4Completed"
            label="I have completed Form W-4 (Federal Income Tax Withholding)"
            type="checkbox"
          />
        </div>
      </FormSection>

      <FormSection title="State Tax Forms">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Depending on your state of residence, you may need to complete additional
            state tax withholding forms.
          </p>

          <FormField<EmployeeOnboardingValues>
            name="taxForms.stateFormsCompleted"
            label="I have completed all required state tax forms"
            type="checkbox"
          />
        </div>
      </FormSection>
    </StepContent>
  );
}

function PayrollStep() {
  return (
    <StepContent>
      <FormSection title="Compensation">
        <FormGrid columns={3}>
          <FormField<EmployeeOnboardingValues>
            name="payroll.salaryType"
            label="Salary Type"
            type="select"
            options={salaryTypeOptions}
          />
          <FormField<EmployeeOnboardingValues>
            name="payroll.salaryAmount"
            label="Salary Amount"
            type="currency"
          />
          <FormField<EmployeeOnboardingValues>
            name="payroll.payFrequency"
            label="Pay Frequency"
            type="select"
            options={payFrequencyOptions}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Direct Deposit Information">
        <Alert className="mb-4">
          <AlertDescription>
            Direct deposit ensures you receive your pay on time. This information is securely stored.
          </AlertDescription>
        </Alert>

        <FormGrid columns={2}>
          <FormField<EmployeeOnboardingValues>
            name="payroll.directDeposit.bankName"
            label="Bank Name"
          />
          <FormField<EmployeeOnboardingValues>
            name="payroll.directDeposit.accountType"
            label="Account Type"
            type="select"
            options={accountTypeOptions}
          />
        </FormGrid>
        <FormGrid columns={2}>
          <FormField<EmployeeOnboardingValues>
            name="payroll.directDeposit.routingNumber"
            label="Routing Number"
            placeholder="9 digits"
          />
          <FormField<EmployeeOnboardingValues>
            name="payroll.directDeposit.accountNumber"
            label="Account Number"
            type="password"
          />
        </FormGrid>
      </FormSection>
    </StepContent>
  );
}

function BackgroundCheckStep() {
  return (
    <StepContent>
      <FormSection title="Background Check Authorization">
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            A background check is required for all new employees. This process is conducted
            through our partner Checkr and typically takes 3-5 business days.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">What's Included:</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>SSN Trace</li>
              <li>Criminal Background Check</li>
              <li>Employment Verification</li>
              <li>Education Verification</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            You will receive an email from Checkr to complete the authorization process.
            Please watch for this email and complete it promptly.
          </p>

          <FormField<EmployeeOnboardingValues>
            name="backgroundCheck.status"
            label="Current Status"
            type="select"
            disabled
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'pending', label: 'Pending' },
              { value: 'clear', label: 'Clear' },
              { value: 'consider', label: 'Needs Review' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        </div>
      </FormSection>
    </StepContent>
  );
}

function ITEquipmentStep() {
  return (
    <StepContent>
      <FormSection title="Equipment Request">
        <Alert className="mb-4">
          <Laptop className="h-4 w-4" />
          <AlertDescription>
            Select the equipment you need for your role. IT will provision your equipment
            before your start date.
          </AlertDescription>
        </Alert>

        <FormField<EmployeeOnboardingValues>
          name="itEquipment.laptop"
          label="Laptop"
          type="select"
          options={laptopOptions}
        />

        <div className="mt-4 space-y-3">
          <Label>Additional Accessories</Label>
          <div className="grid grid-cols-2 gap-4">
            <FormField<EmployeeOnboardingValues>
              name="itEquipment.monitor"
              label="External Monitor"
              type="checkbox"
            />
            <FormField<EmployeeOnboardingValues>
              name="itEquipment.keyboard"
              label="External Keyboard"
              type="checkbox"
            />
            <FormField<EmployeeOnboardingValues>
              name="itEquipment.mouse"
              label="Mouse"
              type="checkbox"
            />
            <FormField<EmployeeOnboardingValues>
              name="itEquipment.headset"
              label="Headset"
              type="checkbox"
            />
          </div>
        </div>

        <FormField<EmployeeOnboardingValues>
          name="itEquipment.specialRequests"
          label="Special Requests"
          type="textarea"
          rows={2}
          placeholder="Any special equipment needs or accessibility requirements..."
          className="mt-4"
        />
      </FormSection>
    </StepContent>
  );
}

function ReviewStep({ values }: { values: EmployeeOnboardingValues }) {
  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      items: [
        { label: 'Name', value: `${values.basicInfo?.firstName} ${values.basicInfo?.lastName}` },
        { label: 'Email', value: values.basicInfo?.email },
        { label: 'Phone', value: values.basicInfo?.phone },
      ],
    },
    {
      title: 'Employment',
      icon: Building,
      items: [
        { label: 'Job Title', value: values.employmentDetails?.jobTitle },
        { label: 'Department', value: values.employmentDetails?.department },
        { label: 'Start Date', value: values.employmentDetails?.startDate },
        { label: 'Work Mode', value: values.employmentDetails?.workMode },
      ],
    },
    {
      title: 'Compliance',
      icon: FileText,
      items: [
        { label: 'I-9 Section 1', value: values.i9Section1?.completed ? 'Completed' : 'Pending' },
        { label: 'W-4', value: values.taxForms?.w4Completed ? 'Completed' : 'Pending' },
        { label: 'State Forms', value: values.taxForms?.stateFormsCompleted ? 'Completed' : 'Pending' },
      ],
    },
    {
      title: 'Payroll',
      icon: DollarSign,
      items: [
        { label: 'Salary Type', value: values.payroll?.salaryType },
        { label: 'Pay Frequency', value: values.payroll?.payFrequency },
        { label: 'Direct Deposit', value: values.payroll?.directDeposit?.bankName || 'Not configured' },
      ],
    },
  ];

  return (
    <StepContent>
      <Alert className="mb-6">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Please review all information before submitting. You can go back to any step to make changes.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">{section.title}</h4>
            </div>
            <dl className="space-y-2">
              {section.items.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-medium">{item.value || '-'}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </StepContent>
  );
}

// ============================================
// Main Component
// ============================================

export function EmployeeOnboardingForm({
  initialValues,
  onSubmit,
  onSaveDraft,
  onCancel,
  isLoading = false,
  managerOptions = [],
}: EmployeeOnboardingFormProps) {
  const defaults = mergeWithDefaults(employeeOnboardingDefaults, initialValues);

  const form = useForm<EmployeeOnboardingValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeOnboardingSchema) as any,
    defaultValues: defaults as EmployeeOnboardingValues,
    mode: 'onBlur',
  });

  const { watch } = form;
  const values = watch();

  // Form draft
  const { saveDraft, clearDraft } = useFormDraft<EmployeeOnboardingValues>({
    key: `onboarding_${initialValues?.basicInfo?.email || 'new'}`,
  });

  // Analytics
  const { trackStepComplete } = useFormAnalytics(8);

  const handleComplete = async () => {
    const payload = transformEmployeeOnboardingToPayload(values);
    await onSubmit(payload as EmployeeOnboardingValues);
    clearDraft();
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(values);
    saveDraft(values);
  };

  const handleStepChange = (stepIndex: number) => {
    trackStepComplete(stepIndex);
    saveDraft(values);
  };

  const steps: FormStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Personal and contact details',
      icon: <User className="h-4 w-4" />,
      fields: ['basicInfo.firstName', 'basicInfo.lastName', 'basicInfo.email', 'basicInfo.emergencyContact.name'],
      component: <BasicInfoStep />,
    },
    {
      id: 'employment',
      title: 'Employment',
      description: 'Position and work details',
      icon: <Building className="h-4 w-4" />,
      fields: ['employmentDetails.jobTitle'],
      component: <EmploymentDetailsStep managerOptions={managerOptions} />,
    },
    {
      id: 'i9',
      title: 'I-9 Verification',
      description: 'Employment eligibility',
      icon: <FileText className="h-4 w-4" />,
      fields: ['i9Section1.completed'],
      component: <I9VerificationStep />,
    },
    {
      id: 'tax',
      title: 'Tax Forms',
      description: 'W-4 and state forms',
      icon: <FileText className="h-4 w-4" />,
      fields: ['taxForms.w4Completed'],
      component: <TaxFormsStep />,
    },
    {
      id: 'payroll',
      title: 'Payroll',
      description: 'Compensation and direct deposit',
      icon: <DollarSign className="h-4 w-4" />,
      fields: [],
      component: <PayrollStep />,
    },
    {
      id: 'background',
      title: 'Background Check',
      description: 'Authorization and status',
      icon: <Shield className="h-4 w-4" />,
      fields: [],
      component: <BackgroundCheckStep />,
    },
    {
      id: 'equipment',
      title: 'IT Equipment',
      description: 'Laptop and accessories',
      icon: <Laptop className="h-4 w-4" />,
      fields: [],
      optional: true,
      component: <ITEquipmentStep />,
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Confirm all information',
      icon: <CheckCircle2 className="h-4 w-4" />,
      fields: [],
      component: <ReviewStep values={values} />,
    },
  ];

  return (
    <FormProvider {...form}>
      <FormStepper
        steps={steps}
        onComplete={handleComplete}
        onStepChange={handleStepChange}
        onSaveDraft={handleSaveDraft}
        showProgress
        showStepNumbers
        stepIndicatorPosition="left"
        submitLabel="Complete Onboarding"
      />
    </FormProvider>
  );
}

export default EmployeeOnboardingForm;
