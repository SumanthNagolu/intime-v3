// Entity table mapping for Edge Functions
export const ENTITY_TABLES: Record<string, string> = {
  candidates: 'user_profiles',
  jobs: 'jobs',
  accounts: 'accounts',
  contacts: 'contacts',
  leads: 'leads',
  employees: 'employees',
  consultants: 'consultants',
  vendors: 'vendors',
  submissions: 'submissions',
  interviews: 'interviews',
  placements: 'placements',
  deals: 'deals',
}

export const getEntityTable = (entityType: string): string => {
  return ENTITY_TABLES[entityType] || entityType
}

// GDPR-related tables to scan for subject data
export const GDPR_TABLES = [
  { table: 'user_profiles', emailField: 'email', nameFields: ['first_name', 'last_name'] },
  { table: 'contacts', emailField: 'email', nameFields: ['first_name', 'last_name'] },
  { table: 'leads', emailField: 'email', nameFields: ['first_name', 'last_name'] },
  { table: 'submissions', emailField: null, candidateRef: 'candidate_id' },
  { table: 'interviews', emailField: null, candidateRef: 'candidate_id' },
  { table: 'placements', emailField: null, candidateRef: 'candidate_id' },
  { table: 'audit_logs', emailField: 'user_email', nameFields: [] },
  { table: 'activities', emailField: null, actorRef: 'actor_id' },
]
