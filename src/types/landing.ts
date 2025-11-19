import { z } from 'zod';

/**
 * Schema for a pillar in the 5-pillar staffing system
 */
export const PillarSchema = z.object({
  title: z.string().min(1),
  icon: z.string().emoji(),
  description: z.string().min(10),
  features: z.array(z.string().min(1)).min(1),
  gradient: z.string().startsWith('from-'),
});

export type Pillar = z.infer<typeof PillarSchema>;

/**
 * Schema for benefits/differentiators
 */
export const BenefitSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  icon: z.string().emoji(),
  stats: z.string().min(1),
});

export type Benefit = z.infer<typeof BenefitSchema>;

/**
 * Schema for workflow steps
 */
export const WorkflowStepSchema = z.object({
  number: z.string().regex(/^\d{2}$/), // Two-digit number like "01", "02"
  title: z.string().min(1),
  description: z.string().min(10),
  color: z.string().startsWith('bg-'),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

/**
 * Schema for timeline entries
 */
export const TimelineEntrySchema = z.object({
  label: z.string().min(1), // e.g., "D1", "W1", "W2", "D30"
  title: z.string().min(1),
  description: z.string().min(10),
  color: z.string().startsWith('bg-'),
});

export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;

/**
 * Schema for footer links
 */
export const FooterLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().startsWith('/'),
});

export type FooterLink = z.infer<typeof FooterLinkSchema>;

/**
 * Schema for footer section
 */
export const FooterSectionSchema = z.object({
  title: z.string().min(1),
  links: z.array(FooterLinkSchema).min(1),
});

export type FooterSection = z.infer<typeof FooterSectionSchema>;

/**
 * Schema for hero stats
 */
export const HeroStatSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export type HeroStat = z.infer<typeof HeroStatSchema>;

/**
 * Schema for contact form (for future use)
 */
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  podCount: z.number().int().positive().optional(),
  interestedPillars: z.array(z.enum([
    'training',
    'recruiting',
    'bench-sales',
    'talent-acquisition',
    'cross-border',
  ])).optional(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

/**
 * Schema for trial signup (for future use)
 */
export const TrialSignupSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  currentStaffingSize: z.enum(['solo', '2-5', '6-10', '11-25', '26-50', '50+']),
  primaryInterest: z.enum([
    'training',
    'recruiting',
    'bench-sales',
    'talent-acquisition',
    'cross-border',
    'all',
  ]),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export type TrialSignupData = z.infer<typeof TrialSignupSchema>;

/**
 * Validation helpers
 */
export const validatePillar = (data: unknown) => PillarSchema.safeParse(data);
export const validateBenefit = (data: unknown) => BenefitSchema.safeParse(data);
export const validateWorkflowStep = (data: unknown) => WorkflowStepSchema.safeParse(data);
export const validateContactForm = (data: unknown) => ContactFormSchema.safeParse(data);
export const validateTrialSignup = (data: unknown) => TrialSignupSchema.safeParse(data);
