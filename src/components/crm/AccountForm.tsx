'use client';

/**
 * Account Form Component
 *
 * Form for creating and editing client accounts with all available fields.
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCreateAccount, useUpdateAccount } from '@/hooks/mutations/accounts';
import { trpc } from '@/lib/trpc/client';
import {
  ChevronLeft,
  Building2,
  Globe,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Industry options
const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'banking', label: 'Banking' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'government', label: 'Government' },
  { value: 'education', label: 'Education' },
  { value: 'energy', label: 'Energy' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'other', label: 'Other' },
];

// Company type options
const COMPANY_TYPE_OPTIONS = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
  { value: 'msp_vms', label: 'MSP/VMS' },
  { value: 'system_integrator', label: 'System Integrator' },
  { value: 'staffing_agency', label: 'Staffing Agency' },
  { value: 'vendor', label: 'Vendor' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'churned', label: 'Churned' },
];

// Tier options
const TIER_OPTIONS = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'mid_market', label: 'Mid-Market' },
  { value: 'smb', label: 'SMB' },
  { value: 'strategic', label: 'Strategic' },
];

// Responsiveness options
const RESPONSIVENESS_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Preferred quality options
const QUALITY_OPTIONS = [
  { value: 'premium', label: 'Premium' },
  { value: 'standard', label: 'Standard' },
  { value: 'budget', label: 'Budget' },
];

interface FormData {
  name: string;
  legalName: string;
  industry: string;
  companyType: string;
  status: string;
  tier: string;
  website: string;
  phone: string;
  headquartersLocation: string;
  foundedYear: string;
  employeeCount: string;
  annualRevenue: string;
  description: string;
  responsiveness: string;
  preferredQuality: string;
  contractStartDate: string;
  contractEndDate: string;
  paymentTermsDays: string;
  markupPercentage: string;
  annualRevenueTarget: string;
}

const initialFormData: FormData = {
  name: '',
  legalName: '',
  industry: '',
  companyType: 'direct_client',
  status: 'prospect',
  tier: '',
  website: '',
  phone: '',
  headquartersLocation: '',
  foundedYear: '',
  employeeCount: '',
  annualRevenue: '',
  description: '',
  responsiveness: '',
  preferredQuality: '',
  contractStartDate: '',
  contractEndDate: '',
  paymentTermsDays: '30',
  markupPercentage: '',
  annualRevenueTarget: '',
};

interface AccountFormProps {
  mode?: 'create' | 'edit';
  accountId?: string;
}

export function AccountForm({ mode = 'create', accountId }: AccountFormProps) {
  const router = useRouter();
  const params = useParams();
  const editId = accountId || (params?.id as string);
  const isEditMode = mode === 'edit' || !!editId;

  // Fetch account data when in edit mode
  const { data: accountData, isLoading: isLoadingAccount } = trpc.crm.accounts.getById.useQuery(
    { id: editId! },
    { enabled: isEditMode && !!editId }
  );

  const { createAccount, isCreating, error: createError } = useCreateAccount({
    onSuccess: () => {
      router.push('/employee/recruiting/accounts');
    },
  });

  const { updateAccount, isUpdating, error: updateError } = useUpdateAccount({
    onSuccess: () => {
      router.push(`/employee/recruiting/accounts/${editId}`);
    },
  });

  const error = isEditMode ? updateError : createError;
  const isSubmitting = isEditMode ? isUpdating : isCreating;

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Populate form when account data is loaded
  useEffect(() => {
    if (isEditMode && accountData) {
      setFormData({
        name: accountData.name || '',
        legalName: '',
        industry: accountData.industry || '',
        companyType: accountData.companyType || 'direct_client',
        status: accountData.status || 'prospect',
        tier: accountData.tier || '',
        website: accountData.website || '',
        phone: accountData.phone || '',
        headquartersLocation: accountData.headquartersLocation || '',
        foundedYear: '',
        employeeCount: '',
        annualRevenue: '',
        description: accountData.description || '',
        responsiveness: accountData.responsiveness || '',
        preferredQuality: accountData.preferredQuality || '',
        contractStartDate: accountData.contractStartDate ? new Date(accountData.contractStartDate).toISOString().split('T')[0] : '',
        contractEndDate: accountData.contractEndDate ? new Date(accountData.contractEndDate).toISOString().split('T')[0] : '',
        paymentTermsDays: accountData.paymentTermsDays?.toString() || '30',
        markupPercentage: accountData.markupPercentage || '',
        annualRevenueTarget: accountData.annualRevenueTarget || '',
      });
    }
  }, [isEditMode, accountData]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Account name is required';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      errors.website = 'Website must be a valid URL (e.g., https://example.com)';
    }

    if (formData.foundedYear) {
      const year = parseInt(formData.foundedYear);
      if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
        errors.foundedYear = 'Founded year must be a valid year';
      }
    }

    if (formData.employeeCount) {
      const count = parseInt(formData.employeeCount);
      if (isNaN(count) || count < 0) {
        errors.employeeCount = 'Employee count must be a positive number';
      }
    }

    if (formData.markupPercentage) {
      const markup = parseFloat(formData.markupPercentage);
      if (isNaN(markup) || markup < 0 || markup > 100) {
        errors.markupPercentage = 'Markup must be between 0 and 100';
      }
    }

    if (formData.paymentTermsDays) {
      const days = parseInt(formData.paymentTermsDays);
      if (isNaN(days) || days < 0 || days > 180) {
        errors.paymentTermsDays = 'Payment terms must be between 0 and 180 days';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const accountInput = {
      name: formData.name,
      industry: formData.industry || undefined,
      companyType: (formData.companyType || undefined) as 'direct_client' | 'implementation_partner' | 'msp_vms' | 'system_integrator' | 'staffing_agency' | 'vendor' | undefined,
      status: (formData.status || 'prospect') as 'prospect' | 'active' | 'inactive' | 'churned',
      tier: (formData.tier || undefined) as 'enterprise' | 'mid_market' | 'smb' | 'strategic' | undefined,
      website: formData.website || undefined,
      phone: formData.phone || undefined,
      headquartersLocation: formData.headquartersLocation || undefined,
      description: formData.description || undefined,
      responsiveness: (formData.responsiveness || undefined) as 'high' | 'medium' | 'low' | undefined,
      preferredQuality: (formData.preferredQuality || undefined) as 'premium' | 'standard' | 'budget' | undefined,
      contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate) : undefined,
      contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : undefined,
      paymentTermsDays: formData.paymentTermsDays ? parseInt(formData.paymentTermsDays) : undefined,
      markupPercentage: formData.markupPercentage ? parseFloat(formData.markupPercentage) : undefined,
      annualRevenueTarget: formData.annualRevenueTarget ? parseFloat(formData.annualRevenueTarget) : undefined,
    };

    try {
      if (isEditMode && editId) {
        await updateAccount({ id: editId, ...accountInput });
      } else {
        await createAccount(accountInput);
      }
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} account:`, err);
    }
  };

  if (isEditMode && isLoadingAccount) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-stone-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={isEditMode ? `/employee/recruiting/accounts/${editId}` : '/employee/recruiting/accounts'}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4"
        >
          <ChevronLeft size={20} />
          {isEditMode ? 'Back to Account' : 'Back to Accounts'}
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">
          {isEditMode ? 'Edit Account' : 'Create New Account'}
        </h1>
        <p className="text-stone-500 mt-1">
          {isEditMode ? 'Update account information' : 'Add a new client account to the system'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-red-800">Error {isEditMode ? 'updating' : 'creating'} account</p>
            <p className="text-red-600 text-sm mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-rust" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Acme Corporation"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none',
                  validationErrors.name ? 'border-red-500' : 'border-stone-300'
                )}
                data-testid="account-name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="legalName" className="block text-sm font-medium text-stone-700 mb-1">
                Legal Name
              </label>
              <input
                type="text"
                id="legalName"
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                placeholder="e.g., Acme Corporation Inc."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-legal-name"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-stone-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-industry"
              >
                <option value="">Select Industry</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-stone-700 mb-1">
                Company Type
              </label>
              <select
                id="companyType"
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-company-type"
              >
                {COMPANY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-stone-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-status"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tier" className="block text-sm font-medium text-stone-700 mb-1">
                Tier
              </label>
              <select
                id="tier"
                name="tier"
                value={formData.tier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-tier"
              >
                <option value="">Select Tier</option>
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-rust" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-stone-700 mb-1">
                Website
              </label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none',
                  validationErrors.website ? 'border-red-500' : 'border-stone-300'
                )}
                data-testid="account-website"
              />
              {validationErrors.website && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.website}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-phone"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="headquartersLocation" className="block text-sm font-medium text-stone-700 mb-1">
                Headquarters Location
              </label>
              <input
                type="text"
                id="headquartersLocation"
                name="headquartersLocation"
                value={formData.headquartersLocation}
                onChange={handleChange}
                placeholder="e.g., New York, NY"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-headquarters"
              />
            </div>
          </div>
        </section>

        {/* Company Details */}
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-rust" />
            Company Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-stone-700 mb-1">
                Founded Year
              </label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                placeholder="e.g., 2010"
                min="1800"
                max={new Date().getFullYear()}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none',
                  validationErrors.foundedYear ? 'border-red-500' : 'border-stone-300'
                )}
                data-testid="account-founded-year"
              />
              {validationErrors.foundedYear && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.foundedYear}</p>
              )}
            </div>

            <div>
              <label htmlFor="employeeCount" className="block text-sm font-medium text-stone-700 mb-1">
                Employee Count
              </label>
              <input
                type="number"
                id="employeeCount"
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleChange}
                placeholder="e.g., 500"
                min="0"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none',
                  validationErrors.employeeCount ? 'border-red-500' : 'border-stone-300'
                )}
                data-testid="account-employee-count"
              />
              {validationErrors.employeeCount && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.employeeCount}</p>
              )}
            </div>

            <div>
              <label htmlFor="annualRevenue" className="block text-sm font-medium text-stone-700 mb-1">
                Annual Revenue ($)
              </label>
              <input
                type="number"
                id="annualRevenue"
                name="annualRevenue"
                value={formData.annualRevenue}
                onChange={handleChange}
                placeholder="e.g., 10000000"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-annual-revenue"
              />
            </div>

            <div>
              <label htmlFor="responsiveness" className="block text-sm font-medium text-stone-700 mb-1">
                Responsiveness
              </label>
              <select
                id="responsiveness"
                name="responsiveness"
                value={formData.responsiveness}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-responsiveness"
              >
                <option value="">Select Responsiveness</option>
                {RESPONSIVENESS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preferredQuality" className="block text-sm font-medium text-stone-700 mb-1">
                Preferred Quality
              </label>
              <select
                id="preferredQuality"
                name="preferredQuality"
                value={formData.preferredQuality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-preferred-quality"
              >
                <option value="">Select Quality</option>
                {QUALITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the company..."
                rows={4}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none resize-none"
                data-testid="account-description"
              />
            </div>
          </div>
        </section>

        {/* Business Terms */}
        <section className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-rust" />
            Business Terms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contractStartDate" className="block text-sm font-medium text-stone-700 mb-1">
                Contract Start Date
              </label>
              <input
                type="date"
                id="contractStartDate"
                name="contractStartDate"
                value={formData.contractStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-contract-start"
              />
            </div>

            <div>
              <label htmlFor="contractEndDate" className="block text-sm font-medium text-stone-700 mb-1">
                Contract End Date
              </label>
              <input
                type="date"
                id="contractEndDate"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-contract-end"
              />
            </div>

            <div>
              <label htmlFor="paymentTermsDays" className="block text-sm font-medium text-stone-700 mb-1">
                Payment Terms (Days)
              </label>
              <input
                type="number"
                id="paymentTermsDays"
                name="paymentTermsDays"
                value={formData.paymentTermsDays}
                onChange={handleChange}
                placeholder="e.g., 30"
                min="0"
                max="180"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none',
                  validationErrors.paymentTermsDays ? 'border-red-500' : 'border-stone-300'
                )}
                data-testid="account-payment-terms"
              />
              {validationErrors.paymentTermsDays && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.paymentTermsDays}</p>
              )}
            </div>

            <div>
              <label htmlFor="markupPercentage" className="block text-sm font-medium text-stone-700 mb-1">
                Markup Percentage (%)
              </label>
              <input
                type="number"
                id="markupPercentage"
                name="markupPercentage"
                value={formData.markupPercentage}
                onChange={handleChange}
                placeholder="e.g., 25"
                min="0"
                max="100"
                step="0.01"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none',
                  validationErrors.markupPercentage ? 'border-red-500' : 'border-stone-300'
                )}
                data-testid="account-markup"
              />
              {validationErrors.markupPercentage && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.markupPercentage}</p>
              )}
            </div>

            <div>
              <label htmlFor="annualRevenueTarget" className="block text-sm font-medium text-stone-700 mb-1">
                Annual Revenue Target ($)
              </label>
              <input
                type="number"
                id="annualRevenueTarget"
                name="annualRevenueTarget"
                value={formData.annualRevenueTarget}
                onChange={handleChange}
                placeholder="e.g., 500000"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
                data-testid="account-revenue-target"
              />
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href={isEditMode ? `/employee/recruiting/accounts/${editId}` : '/employee/recruiting/accounts'}
            className="px-6 py-2 text-stone-600 hover:text-stone-800 font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-rust text-white rounded-lg hover:bg-rust/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            data-testid="account-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditMode ? 'Update Account' : 'Create Account'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccountForm;
