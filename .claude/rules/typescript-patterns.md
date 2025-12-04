# TypeScript Patterns Rules

## Type Safety

### Strict Mode

This project uses strict TypeScript. All code must:
- Have explicit return types for functions
- Use proper null checks
- Avoid `any` type (use `unknown` instead)

### Type Imports

Use `type` imports for type-only imports:

```typescript
// Good
import type { User, Session } from '@/lib/types'
import { createUser } from '@/lib/services/user'

// Bad
import { User, Session, createUser } from '@/lib/types'
```

### Zod for Runtime Validation

Use Zod schemas as the source of truth:

```typescript
import { z } from 'zod'

// Schema
export const jobSchema = z.object({
  title: z.string().min(1).max(200),
  accountId: z.string().uuid(),
  status: z.enum(['draft', 'open', 'closed']),
  salary: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.string().default('USD'),
  }).optional(),
})

// Type inference
export type Job = z.infer<typeof jobSchema>
export type CreateJobInput = z.input<typeof jobSchema>
```

---

## React Patterns

### Component Props

Define props interfaces explicitly:

```typescript
interface ButtonProps {
  variant?: 'default' | 'premium' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  // ...
}
```

### ForwardRef Pattern

Use forwardRef for base components:

```typescript
import * as React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ error }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

### Hook Return Types

Explicitly type hook returns:

```typescript
interface UseJobsReturn {
  jobs: Job[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useJobs(accountId: string): UseJobsReturn {
  const { data, isLoading, error, refetch } = trpc.ats.jobs.list.useQuery({
    accountId,
  })

  return {
    jobs: data?.items ?? [],
    isLoading,
    error: error ?? null,
    refetch: async () => { await refetch() },
  }
}
```

---

## Async Patterns

### Async/Await

Always use async/await over .then():

```typescript
// Good
async function fetchJobs(orgId: string) {
  const jobs = await db.query.jobs.findMany({
    where: eq(jobs.orgId, orgId)
  })
  return jobs
}

// Bad
function fetchJobs(orgId: string) {
  return db.query.jobs.findMany({
    where: eq(jobs.orgId, orgId)
  }).then(jobs => jobs)
}
```

### Error Handling

Use try/catch with typed errors:

```typescript
try {
  const result = await submitCandidate(input)
  return { success: true, data: result }
} catch (error) {
  if (error instanceof TRPCError) {
    // Known error
    throw error
  }
  // Log and rethrow as internal error
  console.error('Submission failed:', error)
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to submit candidate',
  })
}
```

### Promise.all for Parallel Operations

Use Promise.all for independent operations:

```typescript
// Good - parallel
const [jobs, candidates, accounts] = await Promise.all([
  fetchJobs(orgId),
  fetchCandidates(orgId),
  fetchAccounts(orgId),
])

// Bad - sequential (slower)
const jobs = await fetchJobs(orgId)
const candidates = await fetchCandidates(orgId)
const accounts = await fetchAccounts(orgId)
```

---

## File Organization

### Import Order

Follow consistent import order:

```typescript
// 1. React and external libraries
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

// 2. Internal utilities and types
import type { Job, Submission } from '@/lib/types'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

// 3. Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Local imports
import { useJobForm } from './hooks'
import { JobFormSchema } from './schema'
```

### Export Pattern

Use named exports, avoid default exports:

```typescript
// Good
export function JobCard({ job }: JobCardProps) { ... }
export function JobList({ jobs }: JobListProps) { ... }

// Bad
export default function JobCard({ job }: JobCardProps) { ... }
```

### Barrel Exports

Use index.ts for clean imports:

```typescript
// src/components/ui/index.ts
export { Button, buttonVariants } from './button'
export { Card, CardHeader, CardContent } from './card'
export { Input, inputVariants } from './input'
```

---

## Naming Conventions

### Files and Directories

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `JobCard.tsx` |
| Hooks | camelCase with use prefix | `useJobs.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | camelCase with .types suffix | `job.types.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS.ts` |

### Variables and Functions

```typescript
// Components - PascalCase
function JobDetailScreen() { ... }

// Functions - camelCase
function formatSalary(min: number, max: number) { ... }

// Constants - SCREAMING_SNAKE_CASE
const MAX_PAGE_SIZE = 100

// Types - PascalCase
type JobStatus = 'draft' | 'open' | 'closed'

// Enums - PascalCase
enum JobStatus {
  Draft = 'draft',
  Open = 'open',
  Closed = 'closed',
}
```

---

## Utility Types

### Common Patterns

```typescript
// Make fields optional for updates
type UpdateJobInput = Partial<Omit<Job, 'id' | 'createdAt'>>

// Pick specific fields
type JobSummary = Pick<Job, 'id' | 'title' | 'status'>

// Require specific fields
type CreateJobInput = Required<Pick<Job, 'title' | 'accountId'>> & Partial<Job>

// Record type for maps
type StatusCounts = Record<JobStatus, number>
```

### Discriminated Unions

Use for type-safe state:

```typescript
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function renderState<T>(state: FetchState<T>) {
  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return <Spinner />
    case 'success':
      return <DataView data={state.data} />
    case 'error':
      return <ErrorView error={state.error} />
  }
}
```

---

## Path Aliases

Use configured aliases:

```typescript
// Good - uses aliases
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import type { Job } from '@/lib/types'

// Bad - relative paths
import { Button } from '../../../components/ui/button'
import { trpc } from '../../lib/trpc/client'
```

---

## DO's and DON'Ts

### DO

- Use explicit return types
- Use Zod for runtime validation
- Use discriminated unions for state
- Use `type` imports for type-only
- Use path aliases
- Use named exports
- Follow naming conventions

### DON'T

- Use `any` type (use `unknown`)
- Use `.then()` chains (use async/await)
- Use default exports
- Mix concerns in single files
- Skip null checks
- Use relative imports when alias available
- Forget displayName on forwardRef components
