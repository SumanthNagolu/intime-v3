---
date: 2025-12-16T16:30:53-05:00
researcher: Claude
git_commit: 365d5c4
branch: main
repository: intime-v3
topic: "Country/State Dropdown Implementation for Address Fields"
tags: [research, codebase, addresses, dropdowns, forms]
status: complete
last_updated: 2025-12-16
last_updated_by: Claude
---

# Research: Country/State Dropdown Implementation for Address Fields

**Date**: 2025-12-16T16:30:53-05:00
**Researcher**: Claude
**Git Commit**: 365d5c4
**Branch**: main
**Repository**: intime-v3

## Research Question

How to implement country as a dropdown (India, USA, Canada) with state/province as a dependent dropdown that shows appropriate regions based on the selected country. This should apply across the application, not just in account onboarding.

## Summary

The codebase has address handling infrastructure in place but currently uses simple text inputs for State and Country fields. Reference data for US states and 10 countries (including India, USA, Canada) already exists in `src/components/addresses/index.ts`. The implementation requires:

1. Adding Canadian provinces and Indian states/territories constants
2. Creating a helper function to get states by country code
3. Updating address form components to use Select dropdowns with cascading behavior

## Detailed Findings

### Current Implementation

#### Account Onboarding Form (Screenshot Context)

**File**: `src/components/recruiting/accounts/onboarding/OnboardingStep1Profile.tsx:110-156`

The "Headquarters Address" section currently uses simple text inputs:

```tsx
// Lines 132-139: State field - PLAIN TEXT INPUT
<div className="space-y-2">
  <Label>State</Label>
  <Input
    value={formData.state}
    onChange={(e) => setFormData({ state: e.target.value })}
    placeholder="CA"
  />
</div>

// Lines 148-154: Country field - PLAIN TEXT INPUT
<div className="space-y-2">
  <Label>Country</Label>
  <Input
    value={formData.country}
    onChange={(e) => setFormData({ country: e.target.value })}
  />
</div>
```

**Store Default**: `country: 'United States'` in `src/stores/account-onboarding-store.ts:118`

### Existing Reference Data

**File**: `src/components/addresses/index.ts`

| Constant | Lines | Contents |
|----------|-------|----------|
| `US_STATES` | 26-78 | All 50 US states + DC with `{ value, label }` format |
| `COUNTRIES` | 80-91 | 10 countries including US, Canada (CA), India (IN) |

Current COUNTRIES array:
```typescript
export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'AU', label: 'Australia' },
] as const
```

**Missing Data**:
- Canadian provinces/territories (13 total)
- Indian states/territories (28 states + 8 UTs = 36 total)

### Other Address Usage Locations

These components also need updating for consistent behavior:

| Component | File | Current State |
|-----------|------|---------------|
| AddressForm | `src/components/addresses/AddressForm.tsx` | Uses US_STATES dropdown but not dependent on country |
| Billing Step | `src/components/recruiting/accounts/onboarding/OnboardingStep3Billing.tsx` | May have address fields |
| Contact Form | `src/configs/entities/forms/contact-form.config.ts` | Config-driven form |
| Candidate Intake | `src/configs/entities/wizards/candidate-intake.config.ts` | Wizard with address |
| Job Location | `src/components/recruiting/jobs/intake/IntakeStep4Compensation.tsx` | Location picker |

### Cascading Dropdown Pattern in Codebase

**Example**: Account → Contact cascading in `src/components/recruiting/jobs/intake/IntakeStep1BasicInfo.tsx`

```typescript
// Parent query runs once
const accountsQuery = trpc.crm.accounts.list.useQuery(
  { limit: 100, status: 'active' },
  { enabled: !formData.accountId }
)

// Child query depends on parent selection
const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
  { accountId: formData.accountId || '' },
  { enabled: !!formData.accountId }  // Only fetch when parent selected
)

// Handler resets child when parent changes
const handleAccountChange = (accountId: string) => {
  setFormData({
    accountId,
    hiringManagerId: '', // Reset dependent field
  })
}
```

For country/state, we don't need tRPC queries since the data is static - use a helper function instead.

## Implementation Approach

### 1. Add Reference Data

**File**: `src/components/addresses/index.ts`

Add new constants:

```typescript
// Canadian Provinces and Territories
export const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
] as const

// Indian States and Union Territories
export const INDIAN_STATES = [
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'DN', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LA', label: 'Ladakh' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OR', label: 'Odisha' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UK', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' },
] as const

// Operating countries (limited set as requested)
export const OPERATING_COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'IN', label: 'India' },
] as const

// Helper to get states/provinces by country code
export function getStatesByCountry(countryCode: string) {
  switch (countryCode) {
    case 'US':
      return US_STATES
    case 'CA':
      return CANADIAN_PROVINCES
    case 'IN':
      return INDIAN_STATES
    default:
      return []
  }
}
```

### 2. Update OnboardingStep1Profile.tsx

Replace lines 110-156 with dropdown implementation:

```tsx
import { OPERATING_COUNTRIES, getStatesByCountry } from '@/components/addresses'

// Inside component:
const stateOptions = getStatesByCountry(formData.country)

// Country dropdown handler - resets state when country changes
const handleCountryChange = (countryCode: string) => {
  const country = OPERATING_COUNTRIES.find(c => c.value === countryCode)
  setFormData({
    country: country?.label || countryCode,
    state: '' // Reset state when country changes
  })
}

// In JSX - replace State Input with Select:
<Select value={formData.state} onValueChange={(v) => setFormData({ state: v })}>
  <SelectTrigger>
    <SelectValue placeholder="Select state/province" />
  </SelectTrigger>
  <SelectContent>
    {stateOptions.map((state) => (
      <SelectItem key={state.value} value={state.value}>
        {state.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Replace Country Input with Select:
<Select
  value={OPERATING_COUNTRIES.find(c => c.label === formData.country)?.value || 'US'}
  onValueChange={handleCountryChange}
>
  <SelectTrigger>
    <SelectValue placeholder="Select country" />
  </SelectTrigger>
  <SelectContent>
    {OPERATING_COUNTRIES.map((country) => (
      <SelectItem key={country.value} value={country.value}>
        {country.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. Update AddressForm.tsx

Similar changes to `src/components/addresses/AddressForm.tsx` to use the helper function and make state dependent on country.

### 4. Update Store Default

In `src/stores/account-onboarding-store.ts:118`, change:
```typescript
country: 'US', // Use code instead of full name for consistency
```

## Code References

- `src/components/addresses/index.ts:26-91` - Existing US_STATES and COUNTRIES constants
- `src/components/recruiting/accounts/onboarding/OnboardingStep1Profile.tsx:110-156` - Address section to update
- `src/stores/account-onboarding-store.ts:23-27` - Store address fields definition
- `src/stores/account-onboarding-store.ts:114-118` - Store address defaults
- `src/components/addresses/AddressForm.tsx` - Reusable address form component
- `src/components/recruiting/jobs/intake/IntakeStep1BasicInfo.tsx:26-107` - Example of cascading dropdown pattern

## Architecture Documentation

### Data Flow for Cascading Dropdowns

```
1. User selects Country → onChange handler fires
2. Handler updates store: { country: newValue, state: '' }
3. Component re-renders with new country
4. getStatesByCountry(country) returns appropriate state list
5. State dropdown shows filtered options
```

### Store Field Considerations

The store uses string fields for flexibility:
- `country: string` - Could store code ('US') or label ('United States')
- `state: string` - Could store code ('CA') or label ('California')

**Recommendation**: Store codes for consistency, convert to labels for display.

## Open Questions

1. Should the `country` field store the code ('US') or label ('United States')? Current default is 'United States' (label).
2. Should we update ALL address forms at once or just Account Onboarding first?
3. Should the existing COUNTRIES constant be replaced with OPERATING_COUNTRIES or kept for backward compatibility?
4. Do we need postal code format validation per country (US: 5/9 digit, Canada: A1A 1A1, India: 6 digit)?
