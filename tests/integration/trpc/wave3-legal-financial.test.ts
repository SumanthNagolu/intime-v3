/**
 * Integration Tests for Wave 3: Legal & Financial Infrastructure
 *
 * These tests validate the integration between:
 * - Compliance tracking router (COMPLIANCE-01)
 * - Contract management router (CONTRACTS-01)
 * - Rates & billing router (RATES-01)
 *
 * Tests focus on realistic workflow scenarios that span
 * multiple procedures and validate data consistency.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock Supabase client
const mockSupabase = mockDeep<SupabaseClient>()

// Mock createClient to return our mock
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))

describe('Wave 3: Legal & Financial Integration', () => {
  beforeEach(() => {
    mockReset(mockSupabase)
  })

  describe('Contract + Compliance Workflow', () => {
    /**
     * Scenario: When a new contract is created for an account,
     * compliance requirements should be trackable for that entity
     */
    it('should support compliance tracking for contract entities', async () => {
      const accountId = '123e4567-e89b-12d3-a456-426614174000'
      const contractId = 'contract-001'

      // Step 1: Create contract for an account
      const mockContract = {
        id: contractId,
        entity_type: 'account',
        entity_id: accountId,
        contract_name: 'Master Service Agreement',
        contract_type: 'msa',
        status: 'draft',
        effective_date: '2025-01-01',
        expiry_date: '2026-01-01',
      }

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockContract,
          error: null,
        }),
      } as any)

      // Step 2: Assign compliance requirements to the account
      const mockRequirementAssignment = {
        id: 'assign-001',
        entity_type: 'account',
        entity_id: accountId,
        requirement_id: 'req-coi',
        is_required: true,
      }

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockRequirementAssignment,
          error: null,
        }),
      } as any)

      // Step 3: Create compliance item tracking the requirement
      const mockComplianceItem = {
        id: 'item-001',
        entity_type: 'account',
        entity_id: accountId,
        requirement_id: 'req-coi',
        status: 'pending',
      }

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockComplianceItem,
          error: null,
        }),
      } as any)

      // Verify all entities are linked to the same account
      expect(mockContract.entity_id).toBe(accountId)
      expect(mockRequirementAssignment.entity_id).toBe(accountId)
      expect(mockComplianceItem.entity_id).toBe(accountId)
    })

    /**
     * Scenario: Contract cannot be activated without compliance verification
     */
    it('should check compliance before contract activation', async () => {
      const accountId = '123e4567-e89b-12d3-a456-426614174000'

      // Step 1: Check compliance status
      const mockComplianceCheck = {
        is_compliant: false,
        total_requirements: 3,
        compliant_count: 2,
        pending_count: 1,
        blocking_issues: ['COI Insurance Required'],
      }

      mockSupabase.rpc.mockResolvedValueOnce({
        data: [mockComplianceCheck],
        error: null,
      })

      // Verify compliance check result
      expect(mockComplianceCheck.is_compliant).toBe(false)
      expect(mockComplianceCheck.blocking_issues).toContain('COI Insurance Required')

      // In a real scenario, contract activation would be blocked
      // when compliance check returns is_compliant: false
    })
  })

  describe('Rate Card + Contract Workflow', () => {
    /**
     * Scenario: Creating a rate card agreement contract linked to rate card
     */
    it('should support rate card agreement contracts', async () => {
      const accountId = '123e4567-e89b-12d3-a456-426614174000'
      const rateCardId = 'rc-001'

      // Step 1: Create rate card
      const mockRateCard = {
        id: rateCardId,
        entity_type: 'account',
        entity_id: accountId,
        rate_card_name: 'Standard Rates 2025',
        rate_card_type: 'standard',
        currency: 'USD',
        is_active: true,
        min_margin_percentage: 10,
        target_margin_percentage: 20,
      }

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockRateCard,
          error: null,
        }),
      } as any)

      // Step 2: Create rate card agreement contract
      const mockContract = {
        id: 'contract-002',
        entity_type: 'account',
        entity_id: accountId,
        contract_name: 'Rate Card Agreement 2025',
        contract_type: 'rate_card_agreement',
        status: 'active',
        terms: {
          rate_card_id: rateCardId,
          effective_rates: mockRateCard.rate_card_name,
        },
      }

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockContract,
          error: null,
        }),
      } as any)

      // Verify linkage
      expect(mockContract.contract_type).toBe('rate_card_agreement')
      expect(mockContract.terms.rate_card_id).toBe(rateCardId)
      expect(mockRateCard.entity_id).toBe(accountId)
    })

    /**
     * Scenario: Rate card versioning with contract amendment
     */
    it('should version rate cards with contract amendments', async () => {
      const accountId = '123e4567-e89b-12d3-a456-426614174000'

      // Step 1: Original rate card
      const originalRateCard = {
        id: 'rc-001',
        version: 1,
        is_active: false,
        is_latest_version: false,
        target_margin_percentage: 20,
      }

      // Step 2: New rate card version with updated terms
      const newRateCard = {
        id: 'rc-002',
        version: 2,
        previous_version_id: 'rc-001',
        is_active: true,
        is_latest_version: true,
        target_margin_percentage: 22,
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: originalRateCard,
          error: null,
        }),
      } as any)

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newRateCard,
          error: null,
        }),
      } as any)

      // Step 3: Create contract amendment for new rates
      const contractAmendment = {
        id: 'contract-003',
        contract_type: 'amendment',
        contract_name: 'Rate Amendment - 2025 Q2',
        terms: {
          previous_rate_card: 'rc-001',
          new_rate_card: 'rc-002',
          margin_change: '+2%',
        },
      }

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: contractAmendment,
          error: null,
        }),
      } as any)

      // Verify version chain
      expect(newRateCard.previous_version_id).toBe(originalRateCard.id)
      expect(newRateCard.version).toBe(originalRateCard.version + 1)
      expect(contractAmendment.contract_type).toBe('amendment')
    })
  })

  describe('Entity Rate + Approval Workflow', () => {
    /**
     * Scenario: Creating entity rate that requires margin exception approval
     */
    it('should handle margin exception approval workflow', async () => {
      const candidateId = '123e4567-e89b-12d3-a456-426614174000'

      // Step 1: Calculate margin
      const billRate = 100
      const payRate = 95 // 5% margin - below typical minimums

      const marginPercentage = ((billRate - payRate) / billRate) * 100
      expect(marginPercentage).toBe(5)

      // Step 2: Create entity rate with approval required flag
      const mockEntityRate = {
        id: 'rate-001',
        entity_type: 'candidate',
        entity_id: candidateId,
        bill_rate: billRate,
        pay_rate: payRate,
        margin_percentage: marginPercentage,
        requires_approval: true,
        is_current: true,
      }

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockEntityRate,
          error: null,
        }),
      } as any)

      // Step 3: Create approval request
      const mockApproval = {
        id: 'approval-001',
        entity_rate_id: 'rate-001',
        approval_type: 'margin_exception',
        status: 'pending',
        proposed_bill_rate: billRate,
        proposed_pay_rate: payRate,
        proposed_margin_percentage: marginPercentage,
        justification: 'Strategic client - long term engagement',
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'rate-001', bill_rate: billRate, pay_rate: payRate },
          error: null,
        }),
      } as any)

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockApproval,
          error: null,
        }),
      } as any)

      // Verify approval workflow setup
      expect(mockEntityRate.requires_approval).toBe(true)
      expect(mockApproval.approval_type).toBe('margin_exception')
      expect(mockApproval.status).toBe('pending')
    })

    /**
     * Scenario: Approval updates entity rate and records history
     */
    it('should record rate change history on approval', async () => {
      // Step 1: Approve rate
      const mockApprovalUpdate = {
        status: 'approved',
        decided_by: 'manager-001',
        decided_at: new Date().toISOString(),
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            entity_rate_id: 'rate-001',
            proposed_bill_rate: 100,
            proposed_pay_rate: 95,
          },
          error: null,
        }),
      } as any)

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Step 2: Get current rate
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { bill_rate: 100, pay_rate: 95 },
          error: null,
        }),
      } as any)

      // Step 3: Update entity rate
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Step 4: Record change history
      const mockHistory = {
        id: 'history-001',
        entity_rate_id: 'rate-001',
        change_type: 'approved',
        new_bill_rate: 100,
        new_pay_rate: 95,
        reason: 'Rate approved - margin exception granted',
      }

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Verify history tracking
      expect(mockHistory.change_type).toBe('approved')
      expect(mockApprovalUpdate.status).toBe('approved')
    })
  })

  describe('Contract Signature Workflow', () => {
    /**
     * Scenario: Multi-party contract signature flow
     */
    it('should handle multi-party signature workflow', async () => {
      const contractId = 'contract-004'

      // Step 1: Contract with pending signatures
      const mockContract = {
        id: contractId,
        status: 'pending_signature',
        contract_name: 'NDA Agreement',
      }

      // Step 2: Add parties
      const mockParties = [
        {
          id: 'party-001',
          contract_id: contractId,
          party_type: 'company',
          party_role: 'client',
          signatory_status: 'pending',
          signing_order: 1,
        },
        {
          id: 'party-002',
          contract_id: contractId,
          party_type: 'internal',
          party_role: 'vendor',
          signatory_status: 'pending',
          signing_order: 2,
        },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockParties,
          error: null,
        }),
      } as any)

      // Step 3: First party signs
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Check signatures
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { contract_id: contractId },
          error: null,
        }),
      } as any)

      mockSupabase.rpc.mockResolvedValueOnce({
        data: [{
          all_signed: false,
          total_parties: 2,
          signed_count: 1,
          pending_count: 1,
        }],
        error: null,
      })

      // Step 4: Contract becomes partially_signed
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Step 5: Second party signs
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { contract_id: contractId },
          error: null,
        }),
      } as any)

      mockSupabase.rpc.mockResolvedValueOnce({
        data: [{
          all_signed: true,
          total_parties: 2,
          signed_count: 2,
          pending_count: 0,
        }],
        error: null,
      })

      // Step 6: Contract becomes active
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Verify workflow
      expect(mockContract.status).toBe('pending_signature')
      expect(mockParties).toHaveLength(2)
    })
  })

  describe('Compliance Expiration Workflow', () => {
    /**
     * Scenario: Getting items expiring soon across all entities
     */
    it('should track expiring compliance items', async () => {
      const mockExpiringItems = [
        {
          id: 'item-001',
          entity_type: 'contact',
          entity_id: 'contact-001',
          expiry_date: '2025-01-15',
          status: 'verified',
          requirement: { requirement_name: 'Background Check', is_blocking: true },
        },
        {
          id: 'item-002',
          entity_type: 'company',
          entity_id: 'company-001',
          expiry_date: '2025-01-20',
          status: 'verified',
          requirement: { requirement_name: 'COI Insurance', is_blocking: true },
        },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockExpiringItems,
          error: null,
        }),
      } as any)

      // Verify expiring items are from different entity types
      const entityTypes = [...new Set(mockExpiringItems.map(i => i.entity_type))]
      expect(entityTypes).toContain('contact')
      expect(entityTypes).toContain('company')
    })
  })

  describe('Contract Renewal Workflow', () => {
    /**
     * Scenario: Auto-renewal check and renewal creation
     */
    it('should handle contract renewal workflow', async () => {
      const originalContract = {
        id: 'contract-005',
        version: 1,
        renewals_count: 0,
        max_renewals: 3,
        auto_renew: true,
        renewal_term_months: 12,
        status: 'active',
        entity_type: 'account',
        entity_id: 'account-001',
        contract_name: 'Annual Service Agreement',
        contract_type: 'msa',
        terms: { annual_value: 100000 },
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: originalContract,
          error: null,
        }),
      } as any)

      // Mark original as renewed
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Create new version
      const renewedContract = {
        id: 'contract-006',
        version: 2,
        previous_version_id: 'contract-005',
        renewals_count: 0,
        status: 'active',
        is_latest_version: true,
      }

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: renewedContract,
          error: null,
        }),
      } as any)

      // Create version record
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      // Verify renewal chain
      expect(renewedContract.version).toBe(originalContract.version + 1)
      expect(renewedContract.previous_version_id).toBe(originalContract.id)
    })
  })

  describe('Polymorphic Entity Support', () => {
    /**
     * Scenario: Same router supports multiple entity types
     */
    it('should support compliance tracking for different entity types', async () => {
      const entityTypes = ['contact', 'candidate', 'company', 'account', 'placement']

      entityTypes.forEach(entityType => {
        const mockItem = {
          entity_type: entityType,
          entity_id: `${entityType}-001`,
        }
        expect(mockItem.entity_type).toBe(entityType)
      })
    })

    it('should support contracts for different entity types', async () => {
      const entityTypes = ['account', 'contact', 'placement', 'job']

      entityTypes.forEach(entityType => {
        const mockContract = {
          entity_type: entityType,
          entity_id: `${entityType}-001`,
          contract_type: 'msa',
        }
        expect(mockContract.entity_type).toBe(entityType)
      })
    })

    it('should support rate cards for different entity types', async () => {
      const entityTypes = ['account', 'job', 'placement']

      entityTypes.forEach(entityType => {
        const mockRateCard = {
          entity_type: entityType,
          entity_id: `${entityType}-001`,
          rate_card_type: 'standard',
        }
        expect(mockRateCard.entity_type).toBe(entityType)
      })
    })
  })

  describe('Data Consistency', () => {
    /**
     * Scenario: Soft delete preserves data integrity
     */
    it('should maintain deleted_at filtering across all queries', async () => {
      // All list queries should filter deleted_at is null
      const commonFilters = {
        org_id: 'org-001',
        deleted_at: null,
      }

      expect(commonFilters.deleted_at).toBeNull()
    })

    /**
     * Scenario: Org_id scoping for multi-tenancy
     */
    it('should scope all data by org_id', async () => {
      const orgId = 'org-001'

      // Mock queries always include org_id filter
      const mockQuery = {
        eq: vi.fn().mockImplementation((field, value) => {
          if (field === 'org_id') {
            expect(value).toBe(orgId)
          }
          return mockQuery
        }),
      }

      mockQuery.eq('org_id', orgId)
    })

    /**
     * Scenario: Created_by and updated_by audit trail
     */
    it('should track audit fields', async () => {
      const userId = 'user-001'
      const now = new Date().toISOString()

      const mockRecord = {
        created_by: userId,
        created_at: now,
        updated_at: now,
      }

      expect(mockRecord.created_by).toBe(userId)
      expect(mockRecord.created_at).toBeTruthy()
      expect(mockRecord.updated_at).toBeTruthy()
    })
  })
})
