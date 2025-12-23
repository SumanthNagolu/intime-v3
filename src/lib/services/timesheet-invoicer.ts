/**
 * Timesheet → Invoice Automation Service
 *
 * Automates the creation of invoices from approved timesheets.
 * Groups timesheets by company/account and generates proper line items.
 *
 * @module lib/services/timesheet-invoicer
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================
// TYPES
// ============================================

export interface TimesheetForInvoice {
  id: string
  orgId: string
  placementId: string
  periodStart: string
  periodEnd: string
  totalRegularHours: number
  totalOvertimeHours: number
  totalDoubleTimeHours: number
  totalBillableAmount: number
  rateSnapshot: RateSnapshot | null
  placement: {
    id: string
    companyId: string | null
    accountId: string | null
    jobId: string | null
    billRate: number | null
    overtimeBillRate: number | null
    doubleTimeBillRate: number | null
    candidate: {
      id: string
      firstName: string
      lastName: string
    } | null
    job: {
      id: string
      title: string
    } | null
    company: {
      id: string
      legalName: string
    } | null
  } | null
}

interface RateSnapshot {
  billRate?: number
  payRate?: number
  overtimeBillRate?: number
  overtimePayRate?: number
  doubleTimeBillRate?: number
  doubleTimePayRate?: number
}

export interface InvoiceGenerationOptions {
  /** Company ID to generate invoice for */
  companyId: string
  /** Specific timesheet IDs (optional - defaults to all eligible) */
  timesheetIds?: string[]
  /** Invoice date (defaults to today) */
  invoiceDate?: string
  /** Due date (defaults to invoice date + payment terms days) */
  dueDate?: string
  /** Payment terms ID */
  paymentTermsId?: string
  /** Billing contact ID */
  billingContactId?: string
  /** Internal notes */
  internalNotes?: string
  /** Client notes (visible on invoice) */
  clientNotes?: string
  /** Account ID to filter by (optional) */
  accountId?: string
}

export interface GeneratedInvoice {
  id: string
  invoiceNumber: string
  companyId: string
  totalAmount: number
  lineItemCount: number
  timesheetIds: string[]
}

export interface InvoiceLineItemData {
  description: string
  serviceStartDate: string
  serviceEndDate: string
  quantity: number
  unitType: string
  unitRate: number
  totalAmount: number
  timesheetId: string
  placementId: string
}

export interface EligibleTimesheetsResult {
  timesheets: TimesheetForInvoice[]
  byCompany: Map<string, TimesheetForInvoice[]>
  totalBillableAmount: number
  companyCount: number
}

// ============================================
// TIMESHEET INVOICER SERVICE
// ============================================

export class TimesheetInvoicer {
  private adminClient: SupabaseClient

  constructor() {
    this.adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }

  /**
   * Get all approved timesheets eligible for invoicing
   * (status = 'approved', not yet linked to an invoice)
   */
  async getEligibleTimesheets(
    orgId: string,
    options?: {
      companyId?: string
      accountId?: string
      fromDate?: string
      toDate?: string
    }
  ): Promise<EligibleTimesheetsResult> {
    let query = this.adminClient
      .from('timesheets')
      .select(`
        id,
        org_id,
        placement_id,
        period_start,
        period_end,
        total_regular_hours,
        total_overtime_hours,
        total_double_time_hours,
        total_billable_amount,
        rate_snapshot,
        placement:placements!placement_id(
          id,
          company_id,
          account_id,
          job_id,
          bill_rate,
          overtime_bill_rate,
          double_time_bill_rate,
          candidate:contacts!candidate_id(id, first_name, last_name),
          job:jobs!job_id(id, title),
          company:companies!placements_company_id_fkey(id, legal_name)
        )
      `)
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .is('invoice_id', null)
      .is('deleted_at', null)

    if (options?.fromDate) {
      query = query.gte('period_start', options.fromDate)
    }
    if (options?.toDate) {
      query = query.lte('period_end', options.toDate)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch eligible timesheets: ${error.message}`)
    }

    // Transform and filter by company if specified
    const timesheets: TimesheetForInvoice[] = []
    const byCompany = new Map<string, TimesheetForInvoice[]>()
    let totalBillableAmount = 0

    for (const ts of data || []) {
      const placement = ts.placement as unknown as Record<string, unknown> | null
      const companyId = placement?.company_id as string | null

      // Skip if filtering by company and doesn't match
      if (options?.companyId && companyId !== options.companyId) {
        continue
      }

      // Skip if filtering by account and doesn't match
      if (options?.accountId && placement?.account_id !== options.accountId) {
        continue
      }

      // Skip timesheets without a company
      if (!companyId) {
        continue
      }

      const candidate = placement?.candidate as Record<string, unknown>
      const job = placement?.job as Record<string, unknown>
      const company = placement?.company as Record<string, unknown>

      const timesheet: TimesheetForInvoice = {
        id: ts.id,
        orgId: ts.org_id,
        placementId: ts.placement_id,
        periodStart: ts.period_start,
        periodEnd: ts.period_end,
        totalRegularHours: Number(ts.total_regular_hours || 0),
        totalOvertimeHours: Number(ts.total_overtime_hours || 0),
        totalDoubleTimeHours: Number(ts.total_double_time_hours || 0),
        totalBillableAmount: Number(ts.total_billable_amount || 0),
        rateSnapshot: ts.rate_snapshot as RateSnapshot | null,
        placement: {
          id: placement?.id as string,
          companyId: companyId,
          accountId: placement?.account_id as string | null,
          jobId: placement?.job_id as string | null,
          billRate: placement?.bill_rate ? Number(placement.bill_rate) : null,
          overtimeBillRate: placement?.overtime_bill_rate ? Number(placement.overtime_bill_rate) : null,
          doubleTimeBillRate: placement?.double_time_bill_rate ? Number(placement.double_time_bill_rate) : null,
          candidate: candidate ? {
            id: candidate.id as string,
            firstName: candidate.first_name as string,
            lastName: candidate.last_name as string,
          } : null,
          job: job ? {
            id: job.id as string,
            title: job.title as string,
          } : null,
          company: company ? {
            id: company.id as string,
            legalName: company.legal_name as string,
          } : null,
        },
      }

      timesheets.push(timesheet)
      totalBillableAmount += timesheet.totalBillableAmount

      // Group by company
      if (!byCompany.has(companyId)) {
        byCompany.set(companyId, [])
      }
      byCompany.get(companyId)!.push(timesheet)
    }

    return {
      timesheets,
      byCompany,
      totalBillableAmount,
      companyCount: byCompany.size,
    }
  }

  /**
   * Generate an invoice from timesheets for a specific company
   */
  async generateInvoice(
    orgId: string,
    userId: string | undefined,
    options: InvoiceGenerationOptions
  ): Promise<GeneratedInvoice> {
    // Get eligible timesheets for this company
    let timesheets: TimesheetForInvoice[]

    if (options.timesheetIds && options.timesheetIds.length > 0) {
      // Fetch specific timesheets
      const { data, error } = await this.adminClient
        .from('timesheets')
        .select(`
          id,
          org_id,
          placement_id,
          period_start,
          period_end,
          total_regular_hours,
          total_overtime_hours,
          total_double_time_hours,
          total_billable_amount,
          rate_snapshot,
          placement:placements!placement_id(
            id,
            company_id,
            account_id,
            job_id,
            bill_rate,
            overtime_bill_rate,
            double_time_bill_rate,
            candidate:contacts!candidate_id(id, first_name, last_name),
            job:jobs!job_id(id, title),
            company:companies!placements_company_id_fkey(id, legal_name)
          )
        `)
        .eq('org_id', orgId)
        .eq('status', 'approved')
        .is('invoice_id', null)
        .is('deleted_at', null)
        .in('id', options.timesheetIds)

      if (error) {
        throw new Error(`Failed to fetch timesheets: ${error.message}`)
      }

      timesheets = this.transformTimesheets(data || [])
    } else {
      const result = await this.getEligibleTimesheets(orgId, {
        companyId: options.companyId,
        accountId: options.accountId,
      })
      timesheets = result.timesheets
    }

    if (timesheets.length === 0) {
      throw new Error('No eligible timesheets found for invoicing')
    }

    // Verify all timesheets belong to the same company
    const companyIds = new Set(timesheets.map(ts => ts.placement?.companyId).filter(Boolean))
    if (companyIds.size > 1) {
      throw new Error('All timesheets must belong to the same company')
    }

    // Generate line items
    const lineItems = this.generateLineItems(timesheets)
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0)

    // Calculate invoice dates
    const invoiceDate = options.invoiceDate || new Date().toISOString().split('T')[0]
    let dueDate = options.dueDate

    if (!dueDate) {
      // Get payment terms to calculate due date
      if (options.paymentTermsId) {
        const { data: terms } = await this.adminClient
          .from('payment_terms')
          .select('days_until_due')
          .eq('id', options.paymentTermsId)
          .single()

        if (terms) {
          const due = new Date(invoiceDate)
          due.setDate(due.getDate() + terms.days_until_due)
          dueDate = due.toISOString().split('T')[0]
        }
      }

      if (!dueDate) {
        // Default to Net 30
        const due = new Date(invoiceDate)
        due.setDate(due.getDate() + 30)
        dueDate = due.toISOString().split('T')[0]
      }
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(orgId)

    // Create the invoice
    const { data: invoice, error: invoiceError } = await this.adminClient
      .from('invoices')
      .insert({
        org_id: orgId,
        invoice_number: invoiceNumber,
        company_id: options.companyId,
        account_id: options.accountId || null,
        billing_contact_id: options.billingContactId || null,
        invoice_type: 'standard',
        invoice_date: invoiceDate,
        due_date: dueDate,
        currency: 'USD',
        subtotal: subtotal,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: subtotal,
        balance_due: subtotal,
        payment_terms_id: options.paymentTermsId || null,
        internal_notes: options.internalNotes || null,
        client_notes: options.clientNotes || null,
        status: 'draft',
        aging_bucket: 'current',
        created_by: userId || null,
        updated_by: userId || null,
      })
      .select()
      .single()

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    }

    const invoiceId = invoice.id

    // Insert line items
    const lineItemInserts = lineItems.map((item, index) => ({
      invoice_id: invoiceId,
      line_number: index + 1,
      description: item.description,
      service_start_date: item.serviceStartDate,
      service_end_date: item.serviceEndDate,
      quantity: item.quantity,
      unit_type: item.unitType,
      unit_rate: item.unitRate,
      subtotal: item.totalAmount,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: item.totalAmount,
      timesheet_id: item.timesheetId,
      placement_id: item.placementId,
    }))

    const { error: lineItemError } = await this.adminClient
      .from('invoice_line_items')
      .insert(lineItemInserts)

    if (lineItemError) {
      // Rollback invoice creation
      await this.adminClient.from('invoices').delete().eq('id', invoiceId)
      throw new Error(`Failed to create line items: ${lineItemError.message}`)
    }

    // Link timesheets to invoice
    const timesheetIds = timesheets.map(ts => ts.id)
    const { error: linkError } = await this.adminClient
      .from('timesheets')
      .update({
        invoice_id: invoiceId,
        updated_by: userId || null,
        updated_at: new Date().toISOString(),
      })
      .in('id', timesheetIds)

    if (linkError) {
      console.error('Warning: Failed to link timesheets to invoice:', linkError)
    }

    return {
      id: invoiceId,
      invoiceNumber,
      companyId: options.companyId,
      totalAmount: subtotal,
      lineItemCount: lineItems.length,
      timesheetIds,
    }
  }

  /**
   * Generate invoices for all eligible companies
   */
  async generateBulkInvoices(
    orgId: string,
    userId: string | undefined,
    options?: {
      invoiceDate?: string
      paymentTermsId?: string
      excludeCompanyIds?: string[]
    }
  ): Promise<GeneratedInvoice[]> {
    const { byCompany } = await this.getEligibleTimesheets(orgId)
    const results: GeneratedInvoice[] = []

    for (const [companyId, timesheets] of byCompany) {
      // Skip excluded companies
      if (options?.excludeCompanyIds?.includes(companyId)) {
        continue
      }

      try {
        const invoice = await this.generateInvoice(orgId, userId, {
          companyId,
          timesheetIds: timesheets.map(ts => ts.id),
          invoiceDate: options?.invoiceDate,
          paymentTermsId: options?.paymentTermsId,
        })
        results.push(invoice)
      } catch (error) {
        console.error(`Failed to generate invoice for company ${companyId}:`, error)
      }
    }

    return results
  }

  /**
   * Preview line items that would be generated (without creating invoice)
   */
  previewLineItems(timesheets: TimesheetForInvoice[]): InvoiceLineItemData[] {
    return this.generateLineItems(timesheets)
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private transformTimesheets(data: Array<Record<string, unknown>>): TimesheetForInvoice[] {
    return data.map(ts => {
      const placement = ts.placement as Record<string, unknown>
      const candidate = placement?.candidate as Record<string, unknown>
      const job = placement?.job as Record<string, unknown>
      const company = placement?.company as Record<string, unknown>

      return {
        id: ts.id as string,
        orgId: ts.org_id as string,
        placementId: ts.placement_id as string,
        periodStart: ts.period_start as string,
        periodEnd: ts.period_end as string,
        totalRegularHours: Number(ts.total_regular_hours || 0),
        totalOvertimeHours: Number(ts.total_overtime_hours || 0),
        totalDoubleTimeHours: Number(ts.total_double_time_hours || 0),
        totalBillableAmount: Number(ts.total_billable_amount || 0),
        rateSnapshot: ts.rate_snapshot as RateSnapshot | null,
        placement: placement ? {
          id: placement.id as string,
          companyId: placement.company_id as string | null,
          accountId: placement.account_id as string | null,
          jobId: placement.job_id as string | null,
          billRate: placement.bill_rate ? Number(placement.bill_rate) : null,
          overtimeBillRate: placement.overtime_bill_rate ? Number(placement.overtime_bill_rate) : null,
          doubleTimeBillRate: placement.double_time_bill_rate ? Number(placement.double_time_bill_rate) : null,
          candidate: candidate ? {
            id: candidate.id as string,
            firstName: candidate.first_name as string,
            lastName: candidate.last_name as string,
          } : null,
          job: job ? {
            id: job.id as string,
            title: job.title as string,
          } : null,
          company: company ? {
            id: company.id as string,
            legalName: company.legal_name as string,
          } : null,
        } : null,
      }
    })
  }

  private generateLineItems(timesheets: TimesheetForInvoice[]): InvoiceLineItemData[] {
    const lineItems: InvoiceLineItemData[] = []

    for (const ts of timesheets) {
      const candidateName = ts.placement?.candidate
        ? `${ts.placement.candidate.firstName} ${ts.placement.candidate.lastName}`
        : 'Unknown'
      const jobTitle = ts.placement?.job?.title || 'Unknown Job'

      // Get bill rate from rate snapshot or placement
      const billRate = ts.rateSnapshot?.billRate ??
        ts.placement?.billRate ??
        0

      // Calculate total hours (weighted for display)
      const totalHours = ts.totalRegularHours +
        ts.totalOvertimeHours * 1.5 +
        ts.totalDoubleTimeHours * 2

      // Use the pre-calculated billable amount or calculate from rate
      const totalAmount = ts.totalBillableAmount ||
        (totalHours > 0 ? totalHours * billRate : 0)

      // Effective rate (for display)
      const effectiveRate = totalHours > 0 ? totalAmount / totalHours : billRate

      lineItems.push({
        description: `${candidateName} - ${jobTitle} (${ts.periodStart} to ${ts.periodEnd})`,
        serviceStartDate: ts.periodStart,
        serviceEndDate: ts.periodEnd,
        quantity: totalHours,
        unitType: 'hours',
        unitRate: effectiveRate,
        totalAmount,
        timesheetId: ts.id,
        placementId: ts.placementId,
      })
    }

    return lineItems
  }

  private async generateInvoiceNumber(orgId: string): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `INV-${year}-`

    const { data } = await this.adminClient
      .from('invoices')
      .select('invoice_number')
      .eq('org_id', orgId)
      .like('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1
    if (data?.invoice_number) {
      const match = data.invoice_number.match(/INV-\d+-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    return `${prefix}${String(nextNumber).padStart(5, '0')}`
  }
}

// Singleton instance
export const timesheetInvoicer = new TimesheetInvoicer()
