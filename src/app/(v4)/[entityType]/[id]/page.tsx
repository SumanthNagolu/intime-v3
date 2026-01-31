'use client'

/**
 * Dynamic Entity Detail Page
 *
 * This single page handles the detail view for ALL entity types.
 * It uses the entity schema to determine tabs, fields, and actions.
 */

import { use, useMemo } from 'react'
import { notFound } from 'next/navigation'
import { EntityView } from '@/components/v4/entity'
import { getEntitySchema, hasSchema, type EntityData } from '@/lib/entity/schema'

// Import schemas to register them
import '@/lib/entity/schemas'

// Mock data generator for demo purposes
function generateMockEntity(entityType: string, id: string): EntityData | null {
  const mockData: Record<string, (id: string) => EntityData> = {
    job: (id) => ({
      id,
      title: 'Senior React Developer',
      status: 'open',
      priority: 'high',
      jobType: 'full_time',
      workType: 'hybrid',
      location: 'San Francisco, CA',
      department: 'Engineering',
      positions: 2,
      minRate: 150000,
      maxRate: 180000,
      rateType: 'annual',
      startDate: new Date().toISOString(),
      description: 'We are looking for an experienced React developer to join our growing team...',
      requirements: '5+ years of experience with React, TypeScript, and modern frontend development...',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
      account: {
        id: 'account-1',
        name: 'Acme Corp',
      },
      accountId: 'account-1',
      contact: {
        id: 'contact-1',
        fullName: 'Jane Doe',
      },
      contactId: 'contact-1',
      submissionsCount: 12,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    candidate: (id) => ({
      id,
      firstName: 'John',
      lastName: 'Smith',
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
      status: 'active',
      source: 'linkedin',
      currentTitle: 'Senior Software Engineer',
      currentCompany: 'Tech Innovations Inc',
      location: 'San Francisco, CA',
      workAuthorization: 'us_citizen',
      desiredRate: 160000,
      rateType: 'annual',
      availableDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      willingToRelocate: true,
      preferredWorkType: 'hybrid',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
      yearsOfExperience: 8,
      summary: 'Experienced software engineer with a passion for building scalable web applications...',
      rating: 4,
      submissionsCount: 5,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    account: (id) => ({
      id,
      name: 'Acme Corporation',
      status: 'active',
      tier: 'enterprise',
      category: 'client',
      industry: 'technology',
      website: 'https://acme.example.com',
      phone: '(555) 100-0000',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      employeeCount: '501-1000',
      annualRevenue: 50000000,
      paymentTerms: 'net_30',
      defaultMarkup: 35,
      healthScore: 85,
      description: 'Acme Corporation is a leading technology company specializing in enterprise solutions...',
      activeJobsCount: 8,
      placementsCount: 24,
      primaryContact: {
        id: 'contact-1',
        fullName: 'Jane Doe',
      },
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    contact: (id) => ({
      id,
      firstName: 'Jane',
      lastName: 'Doe',
      fullName: 'Jane Doe',
      email: 'jane.doe@acme.example.com',
      phone: '(555) 100-0001',
      mobilePhone: '(555) 100-0002',
      status: 'active',
      category: 'person',
      contactType: 'hiring_manager',
      title: 'VP of Engineering',
      department: 'Engineering',
      linkedinUrl: 'https://linkedin.com/in/janedoe',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      isPrimary: true,
      preferredContactMethod: 'email',
      timezone: 'America/Los_Angeles',
      account: {
        id: 'account-1',
        name: 'Acme Corporation',
      },
      accountId: 'account-1',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    lead: (id) => ({
      id,
      firstName: 'David',
      lastName: 'Lee',
      fullName: 'David Lee',
      email: 'david.lee@newco.example.com',
      phone: '(555) 200-0001',
      company: 'NewCo Ventures',
      title: 'Director of Operations',
      status: 'qualified',
      source: 'referral',
      rating: 'hot',
      industry: 'technology',
      companySize: '51-200',
      estimatedValue: 150000,
      location: 'Austin, TX',
      website: 'https://newco.example.com',
      linkedinUrl: 'https://linkedin.com/in/davidlee',
      description: 'Interested in staffing solutions for their growing engineering team...',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    deal: (id) => ({
      id,
      name: 'NewCo IT Staffing Contract',
      status: 'proposal',
      amount: 150000,
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dealType: 'new_business',
      source: 'referral',
      nextStep: 'Send proposal and schedule follow-up call',
      competitorName: 'StaffingPro',
      description: 'IT staffing contract for NewCo engineering team expansion...',
      account: {
        id: 'account-2',
        name: 'NewCo Ventures',
      },
      accountId: 'account-2',
      contact: {
        id: 'contact-2',
        fullName: 'David Lee',
      },
      contactId: 'contact-2',
      lead: {
        id: 'lead-1',
        fullName: 'David Lee',
      },
      leadId: 'lead-1',
      owner: {
        id: 'user-1',
        fullName: 'Sales Rep',
      },
      ownerId: 'user-1',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  }

  return mockData[entityType]?.(id) || null
}

interface PageProps {
  params: Promise<{ entityType: string; id: string }>
}

export default function EntityDetailPage({ params }: PageProps) {
  const { entityType, id } = use(params)

  // Validate entity type
  if (!hasSchema(entityType)) {
    notFound()
  }

  const schema = useMemo(() => getEntitySchema(entityType as any), [entityType])
  const entity = useMemo(() => generateMockEntity(entityType, id), [entityType, id])

  if (!entity) {
    notFound()
  }

  return <EntityView schema={schema} entity={entity} />
}
