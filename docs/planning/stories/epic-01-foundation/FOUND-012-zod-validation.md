# FOUND-012: Implement Zod Validation Schemas

**Story Points:** 2
**Sprint:** Sprint 2 (Week 3-4)
**Priority:** MEDIUM

---

## User Story

As a **Developer**,
I want **runtime validation schemas shared between client and server**,
So that **invalid data is caught early with consistent validation rules**.

---

## Acceptance Criteria

- [ ] Zod schemas defined for all core entities (user, candidate, job, student)
- [ ] Schemas exported for reuse in forms and API
- [ ] Custom validation rules (email format, phone format, etc.)
- [ ] Error messages user-friendly and actionable
- [ ] Type inference from schemas (no duplicate TypeScript types)
- [ ] Schemas integrated with tRPC procedures
- [ ] Form validation helpers using React Hook Form + Zod

---

## Technical Implementation

### Core Validation Schemas

Create file: `src/lib/validation/schemas.ts`

```typescript
import { z } from 'zod';

/**
 * Common validation patterns
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number (use E.164 format: +1234567890)'
  )
  .optional();

export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * User schemas
 */
export const userProfileSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: z.string().min(1, 'Full name is required'),
  avatar_url: z.string().url('Invalid URL').optional(),
  phone: phoneSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const updateProfileSchema = userProfileSchema.pick({
  full_name: true,
  phone: true,
  avatar_url: true
}).partial();

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Student schemas
 */
export const studentSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: z.string().min(1),
  student_enrollment_date: z.string().datetime(),
  student_current_module: z.string(),
  student_course_progress: z.record(z.number().min(0).max(100)).optional()
});

export const createStudentSchema = studentSchema.pick({
  email: true,
  full_name: true
});

export type Student = z.infer<typeof studentSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;

/**
 * Candidate schemas
 */
export const candidateSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: z.string().min(1),
  candidate_status: z.enum(['active', 'placed', 'bench', 'inactive']),
  candidate_resume_url: z.string().url('Invalid resume URL').optional(),
  candidate_skills: z.array(z.string()).optional(),
  candidate_experience_years: z
    .number()
    .int()
    .min(0)
    .max(50)
    .optional()
});

export const createCandidateSchema = candidateSchema.pick({
  email: true,
  full_name: true,
  candidate_skills: true,
  candidate_experience_years: true
});

export const updateCandidateSchema = candidateSchema
  .pick({
    full_name: true,
    candidate_status: true,
    candidate_resume_url: true,
    candidate_skills: true,
    candidate_experience_years: true
  })
  .partial();

export type Candidate = z.infer<typeof candidateSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

/**
 * Job schemas
 */
export const jobSchema = z.object({
  id: uuidSchema,
  client_id: uuidSchema,
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  required_skills: z
    .array(z.string())
    .min(1, 'At least one skill is required'),
  experience_years_min: z.number().int().min(0).optional(),
  experience_years_max: z.number().int().min(0).optional(),
  salary_min: z.number().positive('Salary must be positive').optional(),
  salary_max: z.number().positive('Salary must be positive').optional(),
  location: z.string().min(1, 'Location is required'),
  remote_allowed: z.boolean().default(false),
  status: z.enum(['open', 'closed', 'filled']).default('open'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
}).refine(
  data =>
    !data.experience_years_max ||
    !data.experience_years_min ||
    data.experience_years_max >= data.experience_years_min,
  {
    message: 'Max experience must be greater than or equal to min experience',
    path: ['experience_years_max']
  }
).refine(
  data =>
    !data.salary_max ||
    !data.salary_min ||
    data.salary_max >= data.salary_min,
  {
    message: 'Max salary must be greater than or equal to min salary',
    path: ['salary_max']
  }
);

export const createJobSchema = jobSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const updateJobSchema = createJobSchema.partial();

export type Job = z.infer<typeof jobSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

/**
 * Auth schemas
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['student', 'candidate', 'client'])
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const resetPasswordSchema = z.object({
  email: emailSchema
});

export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: passwordSchema,
    confirm_password: z.string()
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password']
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### Form Validation Helpers

Create file: `src/lib/validation/form-helpers.ts`

```typescript
import { useForm, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/**
 * Type-safe form hook with Zod validation
 */
export function useZodForm<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  return useForm<z.infer<T>>({
    ...options,
    resolver: zodResolver(schema)
  });
}

/**
 * Extract validation errors from Zod
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });

  return formatted;
}
```

### tRPC Integration Example

Update file: `src/lib/trpc/routers/candidates.ts`

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createCandidateSchema, updateCandidateSchema } from '@/lib/validation/schemas';

export const candidatesRouter = router({
  /**
   * Create candidate
   */
  create: protectedProcedure
    .input(createCandidateSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .insert({
          ...input,
          candidate_status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create candidate');
      }

      return data;
    }),

  /**
   * Update candidate
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateCandidateSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update candidate');
      }

      return data;
    })
});
```

### Form Component Example

Create file: `src/app/candidates/create/page.tsx`

```typescript
'use client';

import { useZodForm } from '@/lib/validation/form-helpers';
import { createCandidateSchema } from '@/lib/validation/schemas';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateCandidatePage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useZodForm(createCandidateSchema);

  const createCandidate = trpc.candidates.create.useMutation();

  const onSubmit = handleSubmit(async data => {
    await createCandidate.mutateAsync(data);
    // Redirect or show success message
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create Candidate</h1>

      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" {...register('full_name')} />
          {errors.full_name && (
            <p className="text-sm text-red-600 mt-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="candidate_experience_years">Years of Experience</Label>
          <Input
            id="candidate_experience_years"
            type="number"
            {...register('candidate_experience_years', { valueAsNumber: true })}
          />
          {errors.candidate_experience_years && (
            <p className="text-sm text-red-600 mt-1">
              {errors.candidate_experience_years.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={createCandidate.isLoading}>
          {createCandidate.isLoading ? 'Creating...' : 'Create Candidate'}
        </Button>

        {createCandidate.isError && (
          <p className="text-red-600">{createCandidate.error.message}</p>
        )}
      </form>
    </div>
  );
}
```

---

## Dependencies

- **Requires:** FOUND-010 (tRPC)
- **Used by:** All forms and API endpoints

---

## Testing Checklist

- [ ] Valid data passes validation
- [ ] Invalid data rejected with clear messages
- [ ] Custom rules work (email format, password strength)
- [ ] Type inference works (no manual TypeScript types needed)
- [ ] Form validation displays errors correctly
- [ ] tRPC procedures validate input

---

## Documentation Updates

- [ ] Document validation schema patterns
- [ ] Add guide for creating new schemas
- [ ] Document custom validation rules

---

## Related Stories

- **Depends on:** FOUND-010
- **Used by:** All features with forms

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
