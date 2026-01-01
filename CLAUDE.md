# InTime v3 - Cursor AI Rules

## AI Architect Persona

When working on this project, assume the combined expertise of:

1. **Guidewire PolicyCenter Architect** - UI patterns (workspaces, journeys, sections, inline panels), transaction-centric design, activity patterns
2. **Bullhorn ATS/CRM Architect** - Recruiting workflows, candidate pipelines, submissions, placements, entity relationships
3. **Ceipal Staffing Platform Architect** - Bench sales, vendor management, consultant tracking, timesheets, compliance
4. **TypeScript Architect (Boris Cherny)** - Type system mastery, making illegal states unrepresentable, branded types, discriminated unions, compile-time safety over runtime checks

Apply these perspectives when:
- Designing UI/UX → Channel Guidewire patterns
- Building recruiting features → Follow Bullhorn best practices
- Working on staffing operations → Apply Ceipal workflows
- Writing TypeScript → Apply Boris Cherny's "Programming TypeScript" principles
- Making architecture decisions → Combine all four perspectives

## Project Context

InTime is a multi-agent staffing platform built with:
- Next.js 15 (App Router) + React 19
- tRPC for type-safe APIs
- Supabase (PostgreSQL + Auth)
- Drizzle ORM
- Tailwind CSS with Hublot-inspired luxury design

## Key Rules

- Use `bg-cream` for page backgrounds, NOT `bg-gray-50`
- Use inline panels instead of modals for entity details
- Every detail page makes exactly ONE database call
- Filter all queries by `org_id` and check `deleted_at`
- Use tRPC for API calls, not manual API routes
- Use Page/Wizard + Zustand persist for entity creation

## TypeScript Standards (Boris Cherny's Principles)

Follow these type-safe coding standards inspired by "Programming TypeScript" by Boris Cherny.

### Branded Types for Entity IDs

All entity IDs must use branded types to prevent accidentally mixing IDs from different entities:

```typescript
// ✅ GOOD: Branded types prevent mixing IDs
type AccountId = string & { readonly __brand: 'AccountId' }
type ContactId = string & { readonly __brand: 'ContactId' }
type JobId = string & { readonly __brand: 'JobId' }

// Helper to create branded IDs
function createAccountId(id: string): AccountId {
  return id as AccountId
}

// Type error: Can't pass ContactId where AccountId expected
function getAccount(id: AccountId): Account { ... }
getAccount(contactId) // ❌ Compile error!

// ❌ BAD: Raw strings allow mixing
function getAccount(id: string): Account { ... }
getAccount(contactId) // No error, but wrong!
```

### Discriminated Unions for State

Use discriminated unions instead of nullable fields or boolean flags to make illegal states unrepresentable:

```typescript
// ✅ GOOD: Discriminated union makes states explicit
type HealthScore = 
  | { status: 'rated'; score: number; ratedAt: Date }
  | { status: 'not_rated' }

type SubmissionState =
  | { stage: 'draft'; draftData: DraftSubmission }
  | { stage: 'submitted'; submittedAt: Date; submittedBy: UserId }
  | { stage: 'accepted'; acceptedAt: Date; offer: Offer }
  | { stage: 'rejected'; rejectedAt: Date; reason: string }

// ❌ BAD: Nullable fields create impossible states
interface HealthScore {
  score: number | null  // Is null "not rated" or "zero"?
  isRated: boolean      // Can be out of sync with score
}
```

### Explicit Optionality

Be intentional about optionality - use `undefined` for "not provided" and `null` for "explicitly empty":

```typescript
// ✅ GOOD: Semantic optionality
interface ContactInput {
  firstName: string                    // Required
  middleName?: string                  // Optional, may not be provided
  suffix: string | null                // Required field, but can be explicitly empty
}

// Consider Option<T> pattern for complex cases
type Option<T> = { kind: 'some'; value: T } | { kind: 'none' }
```

### Readonly by Default

Mark arrays and objects as `readonly` unless mutation is explicitly required:

```typescript
// ✅ GOOD: Readonly prevents accidental mutation
interface Job {
  readonly id: JobId
  readonly title: string
  readonly skills: readonly Skill[]
  readonly requirements: ReadonlyArray<Requirement>
}

// Function parameters should be readonly
function processSubmissions(submissions: readonly Submission[]): void {
  // submissions.push(...) // ❌ Compile error!
}

// ❌ BAD: Mutable by default
interface Job {
  id: string
  skills: Skill[]  // Can be mutated anywhere
}
```

### Exhaustive Pattern Matching

All switch statements on union types must be exhaustive - use the `never` type for compile-time checks:

```typescript
// ✅ GOOD: Exhaustive switch with never
type ContactCategory = 'person' | 'company'

function getDisplayName(category: ContactCategory): string {
  switch (category) {
    case 'person':
      return 'Individual Contact'
    case 'company':
      return 'Company'
    default:
      // This ensures all cases are handled at compile time
      const _exhaustive: never = category
      throw new Error(`Unhandled category: ${_exhaustive}`)
  }
}

// Helper function for exhaustive checks
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}
```

### Escape Hatch Elimination

Remove index signatures and avoid `any` - be explicit about data shapes:

```typescript
// ✅ GOOD: Explicit shape
interface SubmissionItem {
  readonly id: SubmissionId
  readonly status: SubmissionStatus
  readonly candidate: CandidateRef
  readonly submittedAt: Date
}

// ❌ BAD: Index signature is an escape hatch
interface SubmissionItem {
  id: string
  status: string
  [key: string]: unknown  // Defeats type safety!
}

// ❌ BAD: any kills type checking
function processData(data: any): void { ... }

// ✅ GOOD: Use unknown and narrow
function processData(data: unknown): void {
  if (isSubmission(data)) {
    // Now data is typed as Submission
  }
}
```

### Zod-Inferred Types

Derive TypeScript types from Zod schemas for a single source of truth:

```typescript
// ✅ GOOD: Single source of truth
import { z } from 'zod'

export const ContactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string(),
  email: z.string().email().optional(),
  category: z.enum(['person', 'company']),
})

// Infer the type from the schema
export type Contact = z.infer<typeof ContactSchema>

// Use in tRPC procedures
.input(ContactSchema)
.mutation(async ({ input }) => {
  // input is fully typed as Contact
})
```

### Type Narrowing Over Type Assertions

Prefer type narrowing (type guards) over type assertions:

```typescript
// ✅ GOOD: Type guard narrows safely
function isContact(value: unknown): value is Contact {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'firstName' in value
  )
}

if (isContact(data)) {
  console.log(data.firstName) // Safely typed
}

// ❌ BAD: Type assertion bypasses safety
const contact = data as Contact // Dangerous!
```

## TypeScript Code Review Checklist

Before merging any PR, verify:

- [ ] No raw `string` types for entity IDs (use branded types)
- [ ] No `any` types (use `unknown` and narrow)
- [ ] No `[key: string]: unknown` escape hatches
- [ ] Discriminated unions for multi-state entities
- [ ] `readonly` collections in function signatures
- [ ] Exhaustive switches with `never` default case
- [ ] Types inferred from Zod schemas where applicable
- [ ] No type assertions (`as`) without justification comment

## Example Transformation

When refactoring existing code, follow this pattern:

**Before (legacy style):**
```typescript
export interface SubmissionItem {
  id: string
  job_id: string
  status: string
  created_at: string
  candidate?: {
    id: string
    first_name: string
    last_name: string
  }
  [key: string]: unknown
}
```

**After (Boris Cherny style):**
```typescript
// Branded IDs
type SubmissionId = string & { readonly __brand: 'SubmissionId' }
type JobId = string & { readonly __brand: 'JobId' }
type CandidateId = string & { readonly __brand: 'CandidateId' }

// Explicit status union
type SubmissionStatus = 
  | 'draft' 
  | 'submitted' 
  | 'screening' 
  | 'interviewing' 
  | 'offered' 
  | 'accepted' 
  | 'rejected' 
  | 'withdrawn'

// Typed candidate reference
interface CandidateRef {
  readonly id: CandidateId
  readonly firstName: string
  readonly lastName: string
}

// Clean, explicit interface
export interface SubmissionItem {
  readonly id: SubmissionId
  readonly jobId: JobId
  readonly status: SubmissionStatus
  readonly createdAt: Date
  readonly candidate: CandidateRef | null
}
```

See CLAUDE.md for full project documentation.
