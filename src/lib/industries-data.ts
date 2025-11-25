/**
 * Industry slugs list - used for server-side validation
 * This is a simple list without React components to avoid serialization issues
 */

export const INDUSTRY_SLUGS = [
  'information-technology',
  'healthcare',
  'engineering',
  'manufacturing',
  'financial-accounting',
  'ai-ml-data',
  'legal',
  'warehouse-distribution',
  'logistics',
  'hospitality',
  'human-resources',
  'telecom-technology',
  'automobile',
  'retail',
  'government-public-sector'
] as const;

export type IndustrySlug = typeof INDUSTRY_SLUGS[number];

export function isValidIndustrySlug(slug: string): slug is IndustrySlug {
  return INDUSTRY_SLUGS.includes(slug as IndustrySlug);
}
