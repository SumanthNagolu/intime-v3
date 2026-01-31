'use client'

/**
 * Dynamic Entity List Page
 *
 * This single page handles the list view for ALL entity types.
 * It uses the entity schema to determine columns, filters, and actions.
 */

import { use, useMemo } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { EntityList } from '@/components/v4/entity'
import { getEntitySchema, hasSchema, type EntityData } from '@/lib/entity/schema'

// Import schemas to register them
import '@/lib/entity/schemas'

// Mock data generator for demo purposes
function generateMockData(entityType: string, count: number = 10): EntityData[] {
  const mockData: Record<string, () => EntityData[]> = {
    job: () =>
      Array.from({ length: count }, (_, i) => ({
        id: `job-${i + 1}`,
        title: ['Senior React Developer', 'Backend Engineer', 'DevOps Engineer', 'Product Manager', 'UX Designer'][
          i % 5
        ],
        status: ['draft', 'open', 'on_hold', 'filled', 'closed'][i % 5],
        location: ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX', 'Seattle, WA'][i % 5],
        account: { name: ['Acme Corp', 'TechCorp', 'StartupXYZ', 'BigCo', 'InnovateCo'][i % 5] },
        submissionsCount: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    candidate: () =>
      Array.from({ length: count }, (_, i) => ({
        id: `candidate-${i + 1}`,
        fullName: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Wilson'][i % 5],
        firstName: ['John', 'Sarah', 'Mike', 'Emily', 'Alex'][i % 5],
        lastName: ['Smith', 'Johnson', 'Chen', 'Davis', 'Wilson'][i % 5],
        currentTitle: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Architect', 'Manager'][i % 5],
        status: ['new', 'active', 'placed', 'on_hold', 'inactive'][i % 5],
        location: ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX', 'Seattle, WA'][i % 5],
        skills: [['React', 'TypeScript'], ['Python', 'Django'], ['AWS', 'Docker'], ['Node.js', 'GraphQL']][i % 4],
        submissionsCount: Math.floor(Math.random() * 10),
        rating: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    account: () =>
      Array.from({ length: count }, (_, i) => ({
        id: `account-${i + 1}`,
        name: ['Acme Corp', 'TechCorp', 'StartupXYZ', 'BigCo', 'InnovateCo'][i % 5],
        status: ['prospect', 'active', 'on_hold', 'inactive'][i % 4],
        tier: ['enterprise', 'premium', 'standard'][i % 3],
        industry: ['technology', 'healthcare', 'finance', 'manufacturing', 'retail'][i % 5],
        city: ['San Francisco', 'New York', 'Chicago', 'Austin', 'Seattle'][i % 5],
        activeJobsCount: Math.floor(Math.random() * 10),
        healthScore: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    contact: () =>
      Array.from({ length: count }, (_, i) => ({
        id: `contact-${i + 1}`,
        fullName: ['Jane Doe', 'Bob Smith', 'Alice Chen', 'Tom Wilson', 'Mary Johnson'][i % 5],
        firstName: ['Jane', 'Bob', 'Alice', 'Tom', 'Mary'][i % 5],
        lastName: ['Doe', 'Smith', 'Chen', 'Wilson', 'Johnson'][i % 5],
        title: ['VP Engineering', 'HR Director', 'Recruiting Manager', 'CTO', 'CEO'][i % 5],
        status: ['active', 'inactive'][i % 2],
        account: { name: ['Acme Corp', 'TechCorp', 'StartupXYZ', 'BigCo', 'InnovateCo'][i % 5] },
        email: `contact${i + 1}@example.com`,
        phone: `(555) ${100 + i}-0000`,
        contactType: ['hiring_manager', 'hr', 'procurement', 'executive'][i % 4],
      })),
    lead: () =>
      Array.from({ length: count }, (_, i) => ({
        id: `lead-${i + 1}`,
        fullName: ['David Lee', 'Emma White', 'James Brown', 'Lisa Green', 'Chris Taylor'][i % 5],
        firstName: ['David', 'Emma', 'James', 'Lisa', 'Chris'][i % 5],
        lastName: ['Lee', 'White', 'Brown', 'Green', 'Taylor'][i % 5],
        company: ['NewCo', 'GrowthInc', 'ScaleUp', 'TechStart', 'InnoLab'][i % 5],
        status: ['new', 'contacted', 'qualified', 'unqualified', 'converted'][i % 5],
        rating: ['hot', 'warm', 'cold'][i % 3],
        source: ['website', 'referral', 'linkedin', 'cold_call', 'event'][i % 5],
        estimatedValue: [50000, 100000, 150000, 200000, 250000][i % 5],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    deal: () =>
      Array.from({ length: count }, (_, i) => ({
        id: `deal-${i + 1}`,
        name: ['IT Staffing Contract', 'Development Team', 'Support Staff', 'Project Hire', 'Executive Search'][
          i % 5
        ],
        status: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'][i % 6],
        account: { name: ['Acme Corp', 'TechCorp', 'StartupXYZ', 'BigCo', 'InnovateCo'][i % 5] },
        amount: [50000, 100000, 150000, 200000, 250000][i % 5],
        probability: [10, 25, 50, 75, 90, 100][i % 6],
        expectedCloseDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        owner: { fullName: ['John Doe', 'Jane Smith'][i % 2] },
      })),
  }

  return mockData[entityType]?.() || []
}

interface PageProps {
  params: Promise<{ entityType: string }>
}

export default function EntityListPage({ params }: PageProps) {
  const { entityType } = use(params)
  const router = useRouter()

  // Validate entity type
  if (!hasSchema(entityType)) {
    notFound()
  }

  const schema = useMemo(() => getEntitySchema(entityType as any), [entityType])
  const entities = useMemo(() => generateMockData(entityType, 15), [entityType])

  const handleCreateNew = () => {
    router.push(`/${entityType}/new`)
  }

  return (
    <EntityList
      schema={schema}
      entities={entities}
      onCreateNew={handleCreateNew}
    />
  )
}
