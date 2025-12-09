# API Conventions

This document defines the API patterns and conventions for the InTime platform.

## tRPC Router Structure

### Router Organization
```
src/server/routers/
├── _app.ts          # Root router combining all routers
├── auth.ts          # Authentication procedures
├── jobs.ts          # Job-related procedures
├── candidates.ts    # Candidate procedures
├── crm.ts           # CRM (leads, companies, campaigns)
├── academy.ts       # Training/courses
└── workspace.ts     # Workspace management
```

### Naming Conventions

**Procedures**: Use descriptive verbs
```typescript
// Good
router({
  getById: ...,
  list: ...,
  create: ...,
  update: ...,
  delete: ...,
  archive: ...,
  
  // Domain-specific actions
  submitToClient: ...,
  scheduleInterview: ...,
  extendOffer: ...,
});

// Bad
router({
  job: ...,        // Too vague
  doAction: ...,   // Not descriptive
});
```

### Standard CRUD Pattern

```typescript
export const exampleRouter = router({
  // List with pagination and filters
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: z.enum(['active', 'archived']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Return { items: T[], total: number, page: number }
    }),

  // Get single item by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return item or throw TRPCError NOT_FOUND
    }),

  // Create new item
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      // Return created item
    }),

  // Update existing item
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Return updated item
    }),

  // Soft delete
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Set deleted_at, return success
    }),
});
```

## Error Handling

### Standard Error Codes
```typescript
import { TRPCError } from '@trpc/server';

// Not found
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Job not found',
});

// Validation failed
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid job status transition',
});

// Permission denied
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'You do not have permission to update this job',
});

// Server error
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Failed to create job',
  cause: originalError, // For logging
});
```

### Error Message Format
- Be specific: "Job with ID abc123 not found" not "Not found"
- Be actionable: Tell users what they can do
- Don't expose internals: No stack traces in production

## Input Validation

### Use Zod Schemas
```typescript
// Define reusable schemas
const jobStatusSchema = z.enum(['draft', 'open', 'filled', 'closed']);

const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: jobStatusSchema.default('draft'),
  salary_min: z.number().positive().optional(),
  salary_max: z.number().positive().optional(),
}).refine(
  (data) => !data.salary_max || !data.salary_min || data.salary_max >= data.salary_min,
  { message: 'Max salary must be greater than min salary' }
);
```

## Response Formats

### List Response
```typescript
interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### Mutation Response
```typescript
// Return the created/updated item
interface MutationResponse<T> {
  data: T;
  message?: string; // Optional success message
}
```

## Pagination

Standard pagination parameters:
```typescript
const paginationInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});
```

Calculate offset: `(page - 1) * limit`

## Search & Filters

### Full-text Search
```typescript
// Use Supabase textSearch or ilike
.input(z.object({
  search: z.string().optional(),
}))

// In query
if (input.search) {
  query = query.ilike('title', `%${input.search}%`);
}
```

### Status Filters
```typescript
.input(z.object({
  status: z.enum(['all', 'active', 'archived']).default('active'),
}))
```

## Adding New Endpoints

When adding a new endpoint:
1. Follow the naming conventions above
2. Use appropriate procedure type (public/protected)
3. Define input schema with Zod
4. Return consistent response format
5. Handle errors with TRPCError
6. Add to the appropriate router
7. Update this document if introducing new patterns

---

**Last Updated**: 2025-12-08
**Maintainer**: Development Team

