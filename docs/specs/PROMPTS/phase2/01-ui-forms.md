# PROMPT: UI-FORMS (Window 1)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create reusable form components for InTime v3 based on the database schemas and user role workflows.

## Read First:
- docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md (Job form)
- docs/specs/20-USER-ROLES/01-recruiter/03-source-candidates.md (Candidate form)
- docs/specs/20-USER-ROLES/02-bench-sales/01-onboard-consultant.md (Consultant form)
- docs/specs/20-USER-ROLES/03-ta/05-generate-leads.md (Lead form)
- docs/specs/20-USER-ROLES/06-hr-manager/02-onboard-employee.md (Employee form)
- src/lib/db/schema/*.ts (All schemas for field types)
- src/components/ui/ (Existing shadcn components)

## Create Form Components:

### 1. src/components/forms/FormField.tsx
Base field component with:
- Field types: text, email, phone, number, currency, date, datetime, select, multi-select, checkbox, radio, textarea, rich-text, file-upload
- Validation integration (zod)
- Error display
- Required/optional indicator
- Help text support
- Conditional visibility

### 2. src/components/forms/FormSection.tsx
- Collapsible sections
- Section title and description
- Grid layout support (1-4 columns)

### 3. src/components/forms/FormStepper.tsx
- Multi-step form wizard
- Step validation before next
- Step indicators (completed/current/pending)
- Navigation (back/next/skip)
- Summary step

### 4. Domain Forms (src/components/forms/domain/):

#### JobForm.tsx
Fields: title, account_id (searchable select), status, priority, job_type, work_mode, location (city/state/country), description (rich text), positions_open
Sections: Basic Info, Requirements, Skills, Rates, Screening Questions
Multi-step: Details → Requirements → Rates → Screening → Review

#### CandidateForm.tsx
Fields: first_name, last_name, email, phone, source, visa_status, current_company, current_title, willing_relocate, preferred_locations (multi-select)
Sections: Personal Info, Contact, Current Position, Preferences, Skills
Upload: Resume (required), Portfolio (optional)

#### ConsultantOnboardingForm.tsx
Fields: candidate_id (search existing or create new), visa_type, visa_expiry_date, work_auth_status, min_rate, target_rate, willing_relocate, preferred_locations
Sections: Basic Info, Visa & Authorization, Rates, Availability, Skills Matrix

#### SubmissionForm.tsx
Fields: candidate_id (searchable), job_id (searchable), bill_rate, pay_rate, margin_percent (auto-calculated), notes
Screening answers dynamically from job

#### LeadForm.tsx
Fields: source, company_name, company_website, company_industry, company_size, contact_name, contact_title, contact_email, contact_phone, notes
Qualification section: budget, decision_maker, need, timeline

#### EmployeeForm.tsx
Fields: user_id, employee_number, employment_type, hire_date, department, job_title, manager_id (searchable), location, work_mode, salary_type, salary_amount
Sections: Employment, Personal, Emergency Contact, Documents

#### ActivityForm.tsx
Fields: pattern_id (select with pattern info), subject, description, priority, due_at, assigned_to (searchable), related_entity
Dynamic fields from pattern
Checklist items

### 5. Form Utilities (src/lib/forms/):

#### validation.ts
- Zod schemas for all forms
- Custom validators (email, phone, rate range, date range)

#### defaults.ts
- Default values per form type
- Smart defaults from context

#### transformers.ts
- Form data → API payload
- API response → Form data

## Requirements:
- Use React Hook Form with Zod validation
- Integrate with shadcn/ui components
- Support controlled and uncontrolled modes
- Accessibility (ARIA labels, keyboard navigation)
- Mobile responsive
- Loading states during submission
- Dirty state tracking
- Auto-save drafts (optional)

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
  dependsOn?: { field: string; value: any };
}
```

## After Components:
Export all from src/components/forms/index.ts
