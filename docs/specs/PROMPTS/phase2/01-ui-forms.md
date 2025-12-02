# PROMPT: UI-FORMS (Window 1)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable form components for InTime v3 based on the database schemas and user role workflows.

## Read First:
- docs/specs/10-DATABASE/00-ERD.md (Database overview)
- docs/specs/01-GLOSSARY.md (Business terms)
- docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md (Job form - detailed field specs)
- docs/specs/20-USER-ROLES/01-recruiter/03-source-candidates.md (Candidate form)
- docs/specs/20-USER-ROLES/01-recruiter/04-submit-candidate.md (Submission form - detailed)
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md (Bench sales workflows)
- docs/specs/20-USER-ROLES/02-bench-sales/11-source-bench-consultant.md (Consultant sourcing)
- docs/specs/20-USER-ROLES/02-bench-sales/12-onboard-bench-consultant.md (Consultant onboarding)
- docs/specs/20-USER-ROLES/02-bench-sales/14-onboard-vendor.md (Vendor onboarding)
- docs/specs/20-USER-ROLES/03-ta/05-generate-leads.md (Lead form)
- docs/specs/20-USER-ROLES/05-hr/02-employee-onboarding.md (Employee onboarding)
- src/lib/db/schema/*.ts (All schemas for field types)
- src/components/ui/ (Existing shadcn components)

## Create Form Components:

### 1. src/components/forms/FormField.tsx
Base field component with:
- Field types: text, email, phone, number, currency, date, datetime, select, multi-select, checkbox, radio, textarea, rich-text, file-upload, tag-input, searchable-select
- Validation integration (zod)
- Error display
- Required/optional indicator
- Help text support
- Conditional visibility (dependsOn)
- Auto-formatting (phone, currency)

### 2. src/components/forms/FormSection.tsx
- Collapsible sections
- Section title and description
- Grid layout support (1-4 columns)
- Nested form sections

### 3. src/components/forms/FormStepper.tsx
- Multi-step form wizard
- Step validation before next
- Step indicators (completed/current/pending)
- Navigation (back/next/skip)
- Summary step with review
- Save draft functionality

### 4. Domain Forms (src/components/forms/domain/):

#### JobForm.tsx (Recruiting)
**Based on:** 02-create-job.md detailed field specifications
Fields: title, accountId (searchable select), jobType (contract/permanent/contract_to_hire/temp/sow), location, isRemote, hybridDays, description (rich text), positionsCount
Sections: Basic Info → Requirements → Compensation → Review
Requirements Section: requiredSkills (tag input), niceToHaveSkills, minExperienceYears, maxExperienceYears, visaRequirements (multi-select)
Compensation Section: rateMin, rateMax, rateType (hourly/daily/weekly/monthly/annual), priority, urgency, targetFillDate, targetStartDate, internalNotes
Multi-step: Details → Requirements → Compensation → Review

#### CandidateForm.tsx (Recruiting)
Fields: firstName, lastName, email, phone, source, status (new/active/passive/placed/on_bench/do_not_use/inactive), currentCompany, currentTitle, willingRelocate, preferredLocations (multi-select)
Sections: Personal Info, Contact, Current Position, Work Authorization, Skills
Work Auth Section: visaStatus (us_citizen/green_card/h1b/l1/opt/tn/etc), visaExpiryDate
Upload: Resume (required), Portfolio (optional)

#### SubmissionForm.tsx (Recruiting)
**Based on:** 04-submit-candidate.md detailed specifications
Fields: candidateId (searchable), jobId (searchable), resumeVersionId (select), payRate, billRate (auto-calculated), submissionNotes (required, min 50 chars), internalNotes, submissionMethod (email/vms/manual)
Rate calculation with margin display
Screening answers dynamically from job's screening questions
AI-assisted highlights generation option

#### ConsultantOnboardingForm.tsx (Bench Sales)
**Based on:** 12-onboard-bench-consultant.md
Fields: source (internal/referral/vendor), candidateId (search existing or create new), visaType, visaExpiryDate, workAuthStatus, minRate, targetRate, willingRelocate, preferredLocations, contractPreference (c2c/w2/1099)
Sections: Basic Info → Visa & Authorization → Rates & Availability → Skills Matrix → Marketing Profile
Immigration tracking fields: visaAlertLevel, renewalStatus, immigrationCaseId

#### VendorForm.tsx (Bench Sales)
**Based on:** 14-onboard-vendor.md
Fields: companyName, website, industry, primaryContactName, primaryContactEmail, primaryContactPhone, address
Sections: Company Info → Contacts → Agreement Terms → Commission Structure
Agreement fields: msa (file upload), nda (file upload), coi (file upload), w9 (file upload)
Custom commission: markupType (percentage/fixed/tiered), markupValue, paymentTerms (net_30/net_45/net_60), invoiceFrequency

#### HotlistForm.tsx (Bench Sales)
Fields: name, description, consultantIds (multi-select searchable), targetVendors (multi-select), expiresAt
Validation: min 5 consultants, max 25 consultants

#### LeadForm.tsx (CRM/TA)
Fields: source (linkedin/referral/cold_call/event/website), companyName, companyWebsite, companyIndustry, companySize, contactName, contactTitle, contactEmail, contactPhone, notes
Qualification section: budget (low/medium/high), decisionMaker (boolean), need (immediate/future/exploring), timeline (days)
Lead scoring auto-calculation

#### DealForm.tsx (CRM)
Fields: accountId, contactId, name, value, probability, stage (discovery/proposal/negotiation/closed_won/closed_lost), expectedCloseDate, notes
Related: dealStakeholders, dealCompetitors

#### AccountForm.tsx (CRM)
Fields: name, industry, website, phone, billingAddress, status (prospect/active/inactive), type (client/vendor/partner), tier (enterprise/mid_market/smb)
Contacts section: Add/manage associated contacts

#### EmployeeForm.tsx (HR)
**Based on:** 02-employee-onboarding.md
Fields: userId, employeeNumber, employmentType (full_time/part_time/contractor), hireDate, department, jobTitle, managerId (searchable), location, workMode (remote/hybrid/onsite), salaryType (hourly/salary), salaryAmount
Sections: Employment → Personal → Emergency Contact → Documents
Onboarding checklist integration
I-9 verification fields, W-4 fields, direct deposit

#### ImmigrationCaseForm.tsx (HR/Bench Sales)
Fields: consultantId, caseType (h1b/h1b_transfer/opt/opt_stem/green_card/tn/l1/h4_ead), status, filingDate, approvalDate, expiryDate, attorneyId, notes
Documents: Receipt notices, I-797, EAD cards
Timeline milestones

#### PlacementForm.tsx (Recruiting/Bench Sales)
Fields: submissionId, startDate, endDate, billRate, payRate, contractType, clientManagerId
30/60/90 day check-in scheduling
Extension management

#### ActivityForm.tsx (All Roles)
Fields: patternId (select with pattern info preview), subject, description, priority (low/normal/high/urgent/critical), dueAt, assignedTo (searchable), relatedEntityType, relatedEntityId
Dynamic fields from pattern definition
Checklist items from pattern
SLA auto-calculation based on pattern

#### RCAIAssignmentForm.tsx (All Roles)
Assign RACI ownership to entities:
Fields: entityType, entityId, responsibleUserId, accountableUserId, consultedUserIds (multi-select), informedUserIds (multi-select)
Transfer ownership functionality

### 5. Form Utilities (src/lib/forms/):

#### validation.ts
- Zod schemas for all forms matching database constraints
- Custom validators (email, phone with country code, rate range, date range, visa expiry)
- Form-specific validation (e.g., rateMax >= rateMin, maxExperience >= minExperience)

#### defaults.ts
- Default values per form type
- Smart defaults from context (e.g., current user as owner)
- Role-based defaults

#### transformers.ts
- Form data → API payload transformation
- API response → Form data transformation
- Rate calculations (margin %, markup)

#### hooks.ts
- useFormState - manage form state with URL sync
- useFormDraft - auto-save drafts to localStorage
- useFormValidation - real-time validation

## Requirements:
- Use React Hook Form with Zod validation
- Integrate with shadcn/ui components
- Support controlled and uncontrolled modes
- Accessibility (ARIA labels, keyboard navigation, screen reader support)
- Mobile responsive
- Loading states during submission
- Dirty state tracking with unsaved changes warning
- Auto-save drafts (configurable)
- Form analytics (track completion rates, drop-off points)

## Component Pattern:
```tsx
export interface FormFieldProps<T> {
  name: keyof T;
  label: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ZodSchema;
  dependsOn?: { field: string; value: any; operator?: 'equals' | 'not_equals' | 'contains' };
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}

export type FieldType =
  | 'text' | 'email' | 'phone' | 'url'
  | 'number' | 'currency' | 'percentage'
  | 'date' | 'datetime' | 'time' | 'daterange'
  | 'select' | 'multi-select' | 'searchable-select' | 'tag-input'
  | 'checkbox' | 'radio' | 'switch'
  | 'textarea' | 'rich-text'
  | 'file-upload' | 'image-upload'
  | 'rating' | 'slider';
```

## After Components:
Export all from src/components/forms/index.ts
