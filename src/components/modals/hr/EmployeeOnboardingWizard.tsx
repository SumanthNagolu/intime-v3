"use client";

import * as React from "react";
import {
  Loader2,
  User,
  Briefcase,
  DollarSign,
  FileText,
  Building,
  Heart,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "personal",
    title: "Personal Info",
    description: "Basic employee information",
    icon: <User className="h-4 w-4" />,
    required: true,
  },
  {
    id: "employment",
    title: "Employment",
    description: "Job details and reporting",
    icon: <Briefcase className="h-4 w-4" />,
    required: true,
  },
  {
    id: "compensation",
    title: "Compensation",
    description: "Salary and pay schedule",
    icon: <DollarSign className="h-4 w-4" />,
    required: true,
  },
  {
    id: "i9",
    title: "I-9 Verification",
    description: "Employment eligibility",
    icon: <FileText className="h-4 w-4" />,
    required: true,
  },
  {
    id: "w4",
    title: "W-4 Tax",
    description: "Tax withholding",
    icon: <FileText className="h-4 w-4" />,
    required: true,
  },
  {
    id: "direct_deposit",
    title: "Direct Deposit",
    description: "Bank account setup",
    icon: <Building className="h-4 w-4" />,
    required: false,
  },
  {
    id: "benefits",
    title: "Benefits",
    description: "Insurance and perks",
    icon: <Heart className="h-4 w-4" />,
    required: false,
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm all information",
    icon: <Check className="h-4 w-4" />,
    required: true,
  },
];

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface EmploymentInfo {
  jobTitle: string;
  department: string;
  managerId?: string;
  podId?: string;
  startDate: string;
  employmentType: "full_time" | "part_time" | "contractor";
  workLocation: "remote" | "office" | "hybrid";
  officeLocation?: string;
}

interface CompensationInfo {
  payType: "salary" | "hourly";
  amount: number;
  payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
  overtimeEligible: boolean;
}

interface I9Info {
  citizenshipStatus: "citizen" | "noncitizen_national" | "permanent_resident" | "authorized_alien";
  alienNumber?: string;
  expirationDate?: string;
  documentListA?: string;
  documentListB?: string;
  documentListC?: string;
}

interface W4Info {
  filingStatus: "single" | "married_filing_jointly" | "head_of_household";
  multipleJobs: boolean;
  dependentsAmount: number;
  otherIncome: number;
  deductions: number;
  extraWithholding: number;
}

interface DirectDepositInfo {
  accounts: Array<{
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    accountType: "checking" | "savings";
    amount: number | "remainder";
  }>;
}

interface BenefitsInfo {
  medicalPlan?: string;
  dentalPlan?: string;
  visionPlan?: string;
  lifeInsurance: boolean;
  retirement401k: boolean;
  retirementContribution?: number;
  dependents?: Array<{
    name: string;
    relationship: string;
    dateOfBirth: string;
  }>;
}

interface OnboardingFormData {
  personal: PersonalInfo;
  employment: EmploymentInfo;
  compensation: CompensationInfo;
  i9: I9Info;
  w4: W4Info;
  directDeposit: DirectDepositInfo;
  benefits: BenefitsInfo;
}

interface Manager {
  id: string;
  name: string;
}

interface Pod {
  id: string;
  name: string;
  type: string;
}

interface Department {
  id: string;
  name: string;
}

export interface EmployeeOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  pods: Pod[];
  departments: Department[];
  onSubmit: (data: OnboardingFormData) => Promise<{ employeeId: string }>;
}

const initialFormData: OnboardingFormData = {
  personal: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    ssn: "",
    address: { street: "", city: "", state: "", zip: "" },
    emergencyContact: { name: "", relationship: "", phone: "" },
  },
  employment: {
    jobTitle: "",
    department: "",
    startDate: "",
    employmentType: "full_time",
    workLocation: "office",
  },
  compensation: {
    payType: "salary",
    amount: 0,
    payFrequency: "biweekly",
    overtimeEligible: false,
  },
  i9: {
    citizenshipStatus: "citizen",
  },
  w4: {
    filingStatus: "single",
    multipleJobs: false,
    dependentsAmount: 0,
    otherIncome: 0,
    deductions: 0,
    extraWithholding: 0,
  },
  directDeposit: {
    accounts: [],
  },
  benefits: {
    lifeInsurance: false,
    retirement401k: false,
  },
};

export function EmployeeOnboardingWizard({
  isOpen,
  onClose,
  managers,
  pods,
  departments,
  onSubmit,
}: EmployeeOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<OnboardingFormData>(initialFormData);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFormData(initialFormData);
      setCompletedSteps(new Set());
      setErrors({});
    }
  }, [isOpen]);

  const updatePersonal = (updates: Partial<PersonalInfo>) => {
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...updates },
    }));
  };

  const updateEmployment = (updates: Partial<EmploymentInfo>) => {
    setFormData((prev) => ({
      ...prev,
      employment: { ...prev.employment, ...updates },
    }));
  };

  const updateCompensation = (updates: Partial<CompensationInfo>) => {
    setFormData((prev) => ({
      ...prev,
      compensation: { ...prev.compensation, ...updates },
    }));
  };

  const updateI9 = (updates: Partial<I9Info>) => {
    setFormData((prev) => ({
      ...prev,
      i9: { ...prev.i9, ...updates },
    }));
  };

  const updateW4 = (updates: Partial<W4Info>) => {
    setFormData((prev) => ({
      ...prev,
      w4: { ...prev.w4, ...updates },
    }));
  };

  const updateDirectDeposit = (updates: Partial<DirectDepositInfo>) => {
    setFormData((prev) => ({
      ...prev,
      directDeposit: { ...prev.directDeposit, ...updates },
    }));
  };

  const updateBenefits = (updates: Partial<BenefitsInfo>) => {
    setFormData((prev) => ({
      ...prev,
      benefits: { ...prev.benefits, ...updates },
    }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Personal
        if (!formData.personal.firstName) newErrors.firstName = "Required";
        if (!formData.personal.lastName) newErrors.lastName = "Required";
        if (!formData.personal.email) newErrors.email = "Required";
        break;
      case 1: // Employment
        if (!formData.employment.jobTitle) newErrors.jobTitle = "Required";
        if (!formData.employment.department) newErrors.department = "Required";
        if (!formData.employment.startDate) newErrors.startDate = "Required";
        break;
      case 2: // Compensation
        if (formData.compensation.amount <= 0) newErrors.amount = "Must be greater than 0";
        break;
      case 3: // I-9
        if (!formData.i9.citizenshipStatus) newErrors.citizenshipStatus = "Required";
        break;
      case 4: // W-4
        if (!formData.w4.filingStatus) newErrors.filingStatus = "Required";
        break;
      // Direct deposit and benefits are optional
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex: number) => {
    // Can only navigate to completed steps or the next incomplete step
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((completedSteps.size + (currentStep === ONBOARDING_STEPS.length - 1 ? 1 : 0)) / ONBOARDING_STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <input
                  type="text"
                  value={formData.personal.firstName}
                  onChange={(e) => updatePersonal({ firstName: e.target.value })}
                  className={cn(
                    "h-10 w-full rounded-md border bg-background px-3 text-sm",
                    errors.firstName ? "border-red-500" : "border-input"
                  )}
                />
                {errors.firstName && (
                  <span className="text-xs text-red-500">{errors.firstName}</span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <input
                  type="text"
                  value={formData.personal.lastName}
                  onChange={(e) => updatePersonal({ lastName: e.target.value })}
                  className={cn(
                    "h-10 w-full rounded-md border bg-background px-3 text-sm",
                    errors.lastName ? "border-red-500" : "border-input"
                  )}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={formData.personal.email}
                  onChange={(e) => updatePersonal({ email: e.target.value })}
                  className={cn(
                    "h-10 w-full rounded-md border bg-background px-3 text-sm",
                    errors.email ? "border-red-500" : "border-input"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={formData.personal.phone}
                  onChange={(e) => updatePersonal({ phone: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input
                  type="date"
                  value={formData.personal.dateOfBirth}
                  onChange={(e) => updatePersonal({ dateOfBirth: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SSN (Last 4)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={formData.personal.ssn}
                  onChange={(e) => updatePersonal({ ssn: e.target.value })}
                  placeholder="****"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                value={formData.personal.address.street}
                onChange={(e) =>
                  updatePersonal({
                    address: { ...formData.personal.address, street: e.target.value },
                  })
                }
                placeholder="Street address"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  type="text"
                  value={formData.personal.address.city}
                  onChange={(e) =>
                    updatePersonal({
                      address: { ...formData.personal.address, city: e.target.value },
                    })
                  }
                  placeholder="City"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  type="text"
                  value={formData.personal.address.state}
                  onChange={(e) =>
                    updatePersonal({
                      address: { ...formData.personal.address, state: e.target.value },
                    })
                  }
                  placeholder="State"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  type="text"
                  value={formData.personal.address.zip}
                  onChange={(e) =>
                    updatePersonal({
                      address: { ...formData.personal.address, zip: e.target.value },
                    })
                  }
                  placeholder="ZIP"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Contact</label>
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  type="text"
                  value={formData.personal.emergencyContact.name}
                  onChange={(e) =>
                    updatePersonal({
                      emergencyContact: { ...formData.personal.emergencyContact, name: e.target.value },
                    })
                  }
                  placeholder="Name"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  type="text"
                  value={formData.personal.emergencyContact.relationship}
                  onChange={(e) =>
                    updatePersonal({
                      emergencyContact: { ...formData.personal.emergencyContact, relationship: e.target.value },
                    })
                  }
                  placeholder="Relationship"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  type="tel"
                  value={formData.personal.emergencyContact.phone}
                  onChange={(e) =>
                    updatePersonal({
                      emergencyContact: { ...formData.personal.emergencyContact, phone: e.target.value },
                    })
                  }
                  placeholder="Phone"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title *</label>
                <input
                  type="text"
                  value={formData.employment.jobTitle}
                  onChange={(e) => updateEmployment({ jobTitle: e.target.value })}
                  className={cn(
                    "h-10 w-full rounded-md border bg-background px-3 text-sm",
                    errors.jobTitle ? "border-red-500" : "border-input"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department *</label>
                <select
                  value={formData.employment.department}
                  onChange={(e) => updateEmployment({ department: e.target.value })}
                  className={cn(
                    "h-10 w-full rounded-md border bg-background px-3 text-sm",
                    errors.department ? "border-red-500" : "border-input"
                  )}
                >
                  <option value="">Select department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Manager</label>
                <select
                  value={formData.employment.managerId || ""}
                  onChange={(e) => updateEmployment({ managerId: e.target.value || undefined })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select manager...</option>
                  {managers.map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pod/Team</label>
                <select
                  value={formData.employment.podId || ""}
                  onChange={(e) => updateEmployment({ podId: e.target.value || undefined })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select pod...</option>
                  {pods.map((pod) => (
                    <option key={pod.id} value={pod.id}>
                      {pod.name} ({pod.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date *</label>
                <input
                  type="date"
                  value={formData.employment.startDate}
                  onChange={(e) => updateEmployment({ startDate: e.target.value })}
                  className={cn(
                    "h-10 w-full rounded-md border bg-background px-3 text-sm",
                    errors.startDate ? "border-red-500" : "border-input"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Employment Type</label>
                <select
                  value={formData.employment.employmentType}
                  onChange={(e) =>
                    updateEmployment({ employmentType: e.target.value as EmploymentInfo["employmentType"] })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Location</label>
                <select
                  value={formData.employment.workLocation}
                  onChange={(e) =>
                    updateEmployment({ workLocation: e.target.value as EmploymentInfo["workLocation"] })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              {formData.employment.workLocation !== "remote" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Office Location</label>
                  <input
                    type="text"
                    value={formData.employment.officeLocation || ""}
                    onChange={(e) => updateEmployment({ officeLocation: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pay Type</label>
                <select
                  value={formData.compensation.payType}
                  onChange={(e) =>
                    updateCompensation({ payType: e.target.value as CompensationInfo["payType"] })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="salary">Salary</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {formData.compensation.payType === "salary" ? "Annual Salary" : "Hourly Rate"} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={formData.compensation.amount || ""}
                    onChange={(e) =>
                      updateCompensation({ amount: parseFloat(e.target.value) || 0 })
                    }
                    className={cn(
                      "h-10 w-full rounded-md border bg-background pl-7 pr-3 text-sm",
                      errors.amount ? "border-red-500" : "border-input"
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pay Frequency</label>
                <select
                  value={formData.compensation.payFrequency}
                  onChange={(e) =>
                    updateCompensation({ payFrequency: e.target.value as CompensationInfo["payFrequency"] })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="semimonthly">Semi-monthly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="overtime-eligible"
                  checked={formData.compensation.overtimeEligible}
                  onChange={(e) => updateCompensation({ overtimeEligible: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="overtime-eligible" className="text-sm font-medium">
                  Overtime Eligible (Non-exempt)
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  Form I-9 must be completed within 3 business days of the employee&apos;s start date.
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Citizenship Status *</label>
              <select
                value={formData.i9.citizenshipStatus}
                onChange={(e) =>
                  updateI9({ citizenshipStatus: e.target.value as I9Info["citizenshipStatus"] })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="citizen">U.S. Citizen</option>
                <option value="noncitizen_national">Noncitizen National of the U.S.</option>
                <option value="permanent_resident">Lawful Permanent Resident</option>
                <option value="authorized_alien">Alien Authorized to Work</option>
              </select>
            </div>
            {(formData.i9.citizenshipStatus === "permanent_resident" ||
              formData.i9.citizenshipStatus === "authorized_alien") && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alien/USCIS Number</label>
                  <input
                    type="text"
                    value={formData.i9.alienNumber || ""}
                    onChange={(e) => updateI9({ alienNumber: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                {formData.i9.citizenshipStatus === "authorized_alien" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiration Date</label>
                    <input
                      type="date"
                      value={formData.i9.expirationDate || ""}
                      onChange={(e) => updateI9({ expirationDate: e.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Verification</label>
              <p className="text-xs text-muted-foreground">
                Employee must present either one List A document OR one List B AND one List C document.
              </p>
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">List A (Identity + Work Authorization)</label>
                  <input
                    type="text"
                    value={formData.i9.documentListA || ""}
                    onChange={(e) => updateI9({ documentListA: e.target.value })}
                    placeholder="e.g., U.S. Passport, Permanent Resident Card"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="text-center text-xs text-muted-foreground">— OR —</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">List B (Identity)</label>
                    <input
                      type="text"
                      value={formData.i9.documentListB || ""}
                      onChange={(e) => updateI9({ documentListB: e.target.value })}
                      placeholder="e.g., Driver's License"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">List C (Work Authorization)</label>
                    <input
                      type="text"
                      value={formData.i9.documentListC || ""}
                      onChange={(e) => updateI9({ documentListC: e.target.value })}
                      placeholder="e.g., Social Security Card"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filing Status *</label>
              <select
                value={formData.w4.filingStatus}
                onChange={(e) => updateW4({ filingStatus: e.target.value as W4Info["filingStatus"] })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="single">Single or Married filing separately</option>
                <option value="married_filing_jointly">Married filing jointly</option>
                <option value="head_of_household">Head of household</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="multiple-jobs"
                checked={formData.w4.multipleJobs}
                onChange={(e) => updateW4({ multipleJobs: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="multiple-jobs" className="text-sm">
                Multiple jobs or spouse works
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dependents Amount ($)</label>
                <input
                  type="number"
                  value={formData.w4.dependentsAmount || ""}
                  onChange={(e) => updateW4({ dependentsAmount: parseFloat(e.target.value) || 0 })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Other Income ($)</label>
                <input
                  type="number"
                  value={formData.w4.otherIncome || ""}
                  onChange={(e) => updateW4({ otherIncome: parseFloat(e.target.value) || 0 })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deductions ($)</label>
                <input
                  type="number"
                  value={formData.w4.deductions || ""}
                  onChange={(e) => updateW4({ deductions: parseFloat(e.target.value) || 0 })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Extra Withholding ($)</label>
                <input
                  type="number"
                  value={formData.w4.extraWithholding || ""}
                  onChange={(e) => updateW4({ extraWithholding: parseFloat(e.target.value) || 0 })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Add bank accounts for direct deposit. First account receives remainder after fixed amounts.
            </div>
            {formData.directDeposit.accounts.map((account, index) => (
              <div key={index} className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newAccounts = [...formData.directDeposit.accounts];
                      newAccounts.splice(index, 1);
                      updateDirectDeposit({ accounts: newAccounts });
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={account.bankName}
                    onChange={(e) => {
                      const newAccounts = [...formData.directDeposit.accounts];
                      newAccounts[index] = { ...account, bankName: e.target.value };
                      updateDirectDeposit({ accounts: newAccounts });
                    }}
                    placeholder="Bank Name"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <select
                    value={account.accountType}
                    onChange={(e) => {
                      const newAccounts = [...formData.directDeposit.accounts];
                      newAccounts[index] = { ...account, accountType: e.target.value as "checking" | "savings" };
                      updateDirectDeposit({ accounts: newAccounts });
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                  <input
                    type="text"
                    value={account.routingNumber}
                    onChange={(e) => {
                      const newAccounts = [...formData.directDeposit.accounts];
                      newAccounts[index] = { ...account, routingNumber: e.target.value };
                      updateDirectDeposit({ accounts: newAccounts });
                    }}
                    placeholder="Routing Number"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <input
                    type="text"
                    value={account.accountNumber}
                    onChange={(e) => {
                      const newAccounts = [...formData.directDeposit.accounts];
                      newAccounts[index] = { ...account, accountNumber: e.target.value };
                      updateDirectDeposit({ accounts: newAccounts });
                    }}
                    placeholder="Account Number"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                updateDirectDeposit({
                  accounts: [
                    ...formData.directDeposit.accounts,
                    { bankName: "", routingNumber: "", accountNumber: "", accountType: "checking", amount: "remainder" },
                  ],
                });
              }}
              className="text-sm text-primary hover:underline"
            >
              + Add Bank Account
            </button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Medical Plan</label>
                <select
                  value={formData.benefits.medicalPlan || ""}
                  onChange={(e) => updateBenefits({ medicalPlan: e.target.value || undefined })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Decline coverage</option>
                  <option value="basic">Basic Plan</option>
                  <option value="standard">Standard Plan</option>
                  <option value="premium">Premium Plan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dental Plan</label>
                <select
                  value={formData.benefits.dentalPlan || ""}
                  onChange={(e) => updateBenefits({ dentalPlan: e.target.value || undefined })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Decline coverage</option>
                  <option value="basic">Basic Dental</option>
                  <option value="premium">Premium Dental</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vision Plan</label>
                <select
                  value={formData.benefits.visionPlan || ""}
                  onChange={(e) => updateBenefits({ visionPlan: e.target.value || undefined })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Decline coverage</option>
                  <option value="basic">Basic Vision</option>
                  <option value="premium">Premium Vision</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="life-insurance"
                  checked={formData.benefits.lifeInsurance}
                  onChange={(e) => updateBenefits({ lifeInsurance: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="life-insurance" className="text-sm">
                  Life Insurance
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="401k"
                  checked={formData.benefits.retirement401k}
                  onChange={(e) => updateBenefits({ retirement401k: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="401k" className="text-sm font-medium">
                  401(k) Retirement Plan
                </label>
              </div>
              {formData.benefits.retirement401k && (
                <div className="ml-7 space-y-2">
                  <label className="text-sm">Contribution %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.benefits.retirementContribution || ""}
                    onChange={(e) =>
                      updateBenefits({ retirementContribution: parseFloat(e.target.value) || 0 })
                    }
                    className="h-10 w-32 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Please review all information before submitting.
            </div>
            <div className="space-y-4 max-h-[400px] overflow-auto">
              {/* Personal Summary */}
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Personal Information</h4>
                <dl className="grid gap-1 text-sm sm:grid-cols-2">
                  <div><span className="text-muted-foreground">Name:</span> {formData.personal.firstName} {formData.personal.lastName}</div>
                  <div><span className="text-muted-foreground">Email:</span> {formData.personal.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {formData.personal.phone || "N/A"}</div>
                </dl>
              </div>

              {/* Employment Summary */}
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Employment Details</h4>
                <dl className="grid gap-1 text-sm sm:grid-cols-2">
                  <div><span className="text-muted-foreground">Title:</span> {formData.employment.jobTitle}</div>
                  <div><span className="text-muted-foreground">Start Date:</span> {formData.employment.startDate}</div>
                  <div><span className="text-muted-foreground">Type:</span> {formData.employment.employmentType.replace("_", " ")}</div>
                  <div><span className="text-muted-foreground">Location:</span> {formData.employment.workLocation}</div>
                </dl>
              </div>

              {/* Compensation Summary */}
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Compensation</h4>
                <dl className="grid gap-1 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">
                      {formData.compensation.payType === "salary" ? "Annual Salary:" : "Hourly Rate:"}
                    </span>{" "}
                    ${formData.compensation.amount.toLocaleString()}
                  </div>
                  <div><span className="text-muted-foreground">Pay Frequency:</span> {formData.compensation.payFrequency}</div>
                </dl>
              </div>

              {/* Benefits Summary */}
              {(formData.benefits.medicalPlan || formData.benefits.dentalPlan || formData.benefits.retirement401k) && (
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-2">Benefits Elections</h4>
                  <dl className="grid gap-1 text-sm sm:grid-cols-2">
                    {formData.benefits.medicalPlan && (
                      <div><span className="text-muted-foreground">Medical:</span> {formData.benefits.medicalPlan}</div>
                    )}
                    {formData.benefits.dentalPlan && (
                      <div><span className="text-muted-foreground">Dental:</span> {formData.benefits.dentalPlan}</div>
                    )}
                    {formData.benefits.retirement401k && (
                      <div><span className="text-muted-foreground">401(k):</span> {formData.benefits.retirementContribution}%</div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Onboarding"
      subtitle="Complete all required steps to onboard a new employee"
      size="2xl"
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input",
                  "bg-background px-4 py-2 text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                  "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                  "hover:bg-primary/90"
                )}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                  "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                  "hover:bg-primary/90",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Complete Onboarding
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between overflow-x-auto pb-2">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = currentStep === index;
            const isClickable = index <= currentStep || completedSteps.has(index - 1);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[80px] p-2 rounded-md transition-colors",
                  isClickable && "hover:bg-muted/50 cursor-pointer",
                  !isClickable && "cursor-not-allowed opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted && "border-green-500 bg-green-500 text-white",
                    isCurrent && !isCompleted && "border-primary bg-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "border-muted-foreground/30"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
                </div>
                <span
                  className={cn(
                    "text-xs whitespace-nowrap",
                    isCurrent && "font-medium text-primary",
                    isCompleted && "text-green-600"
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          <h3 className="font-medium mb-4">
            {ONBOARDING_STEPS[currentStep].title}
            {ONBOARDING_STEPS[currentStep].required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h3>
          {renderStepContent()}
        </div>
      </div>
    </Modal>
  );
}

export default EmployeeOnboardingWizard;
