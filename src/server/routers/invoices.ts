import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// INVOICES-01: Invoice Management Router
// Client invoicing, payments, AR tracking
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const invoiceStatusEnum = z.enum([
  'draft', 'pending_approval', 'approved', 'sent', 'viewed',
  'partially_paid', 'paid', 'overdue', 'disputed', 'void', 'written_off'
])

const invoiceTypeEnum = z.enum([
  'standard', 'fixed_fee', 'retainer', 'milestone', 'credit_note', 'final'
])

const paymentMethodEnum = z.enum([
  'check', 'ach', 'wire', 'credit_card', 'other'
])

const batchStatusEnum = z.enum([
  'draft', 'processing', 'sent', 'completed'
])

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformInvoice(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    invoiceNumber: item.invoice_number as string,
    referenceNumber: item.reference_number as string | null,
    accountId: item.account_id as string | null,
    companyId: item.company_id as string | null,
    billingContactId: item.billing_contact_id as string | null,
    invoiceType: item.invoice_type as string,
    invoiceDate: item.invoice_date as string,
    dueDate: item.due_date as string,
    currency: item.currency as string,
    exchangeRate: item.exchange_rate ? Number(item.exchange_rate) : 1,
    subtotal: item.subtotal ? Number(item.subtotal) : 0,
    discountAmount: item.discount_amount ? Number(item.discount_amount) : 0,
    discountPercentage: item.discount_percentage ? Number(item.discount_percentage) : null,
    taxAmount: item.tax_amount ? Number(item.tax_amount) : 0,
    totalAmount: item.total_amount ? Number(item.total_amount) : 0,
    amountPaid: item.amount_paid ? Number(item.amount_paid) : 0,
    balanceDue: item.balance_due ? Number(item.balance_due) : 0,
    status: item.status as string,
    sentAt: item.sent_at as string | null,
    sentTo: item.sent_to as string[] | null,
    viewedAt: item.viewed_at as string | null,
    paymentTermsId: item.payment_terms_id as string | null,
    paymentInstructions: item.payment_instructions as string | null,
    agingBucket: item.aging_bucket as string | null,
    lastReminderSent: item.last_reminder_sent as string | null,
    reminderCount: item.reminder_count as number,
    isDisputed: item.is_disputed as boolean,
    disputeReason: item.dispute_reason as string | null,
    disputeOpenedAt: item.dispute_opened_at as string | null,
    disputeResolvedAt: item.dispute_resolved_at as string | null,
    writtenOffAmount: item.written_off_amount ? Number(item.written_off_amount) : 0,
    writtenOffAt: item.written_off_at as string | null,
    writtenOffReason: item.written_off_reason as string | null,
    internalNotes: item.internal_notes as string | null,
    clientNotes: item.client_notes as string | null,
    termsAndConditions: item.terms_and_conditions as string | null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    createdBy: item.created_by as string | null,
    updatedBy: item.updated_by as string | null,
    // Joined relations
    company: item.company,
    account: item.account,
    billingContact: item.billing_contact,
    paymentTerms: item.payment_terms,
    lineItems: item.line_items,
    payments: item.payments,
  }
}

function transformLineItem(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    invoiceId: item.invoice_id as string,
    timesheetId: item.timesheet_id as string | null,
    timesheetEntryId: item.timesheet_entry_id as string | null,
    placementId: item.placement_id as string | null,
    lineNumber: item.line_number as number,
    description: item.description as string,
    serviceStartDate: item.service_start_date as string | null,
    serviceEndDate: item.service_end_date as string | null,
    quantity: item.quantity ? Number(item.quantity) : 0,
    unitType: item.unit_type as string,
    unitRate: item.unit_rate ? Number(item.unit_rate) : 0,
    subtotal: item.subtotal ? Number(item.subtotal) : 0,
    discountAmount: item.discount_amount ? Number(item.discount_amount) : 0,
    taxRate: item.tax_rate ? Number(item.tax_rate) : 0,
    taxAmount: item.tax_amount ? Number(item.tax_amount) : 0,
    totalAmount: item.total_amount ? Number(item.total_amount) : 0,
    glCode: item.gl_code as string | null,
    costCenter: item.cost_center as string | null,
    projectCode: item.project_code as string | null,
    createdAt: item.created_at as string,
    // Joined relations
    timesheet: item.timesheet,
    placement: item.placement,
  }
}

function transformPayment(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    invoiceId: item.invoice_id as string,
    paymentDate: item.payment_date as string,
    amount: item.amount ? Number(item.amount) : 0,
    paymentMethod: item.payment_method as string,
    referenceNumber: item.reference_number as string | null,
    bankReference: item.bank_reference as string | null,
    matchedToLineItems: item.matched_to_line_items as Record<string, unknown> | null,
    depositDate: item.deposit_date as string | null,
    depositAccount: item.deposit_account as string | null,
    notes: item.notes as string | null,
    createdAt: item.created_at as string,
    createdBy: item.created_by as string | null,
    // Joined relations
    creator: item.creator,
  }
}

function transformPaymentTerms(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    name: item.name as string,
    description: item.description as string | null,
    daysUntilDue: item.days_until_due as number,
    earlyPaymentDiscountPercent: item.early_payment_discount_percent ? Number(item.early_payment_discount_percent) : null,
    earlyPaymentDiscountDays: item.early_payment_discount_days as number | null,
    lateFeePercent: item.late_fee_percent ? Number(item.late_fee_percent) : null,
    lateFeeFlat: item.late_fee_flat ? Number(item.late_fee_flat) : null,
    lateFeeGraceDays: item.late_fee_grace_days as number,
    isDefault: item.is_default as boolean,
    isActive: item.is_active as boolean,
    createdAt: item.created_at as string,
  }
}

function transformBatch(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    batchNumber: item.batch_number as string,
    batchDate: item.batch_date as string,
    invoiceCount: item.invoice_count as number,
    totalAmount: item.total_amount ? Number(item.total_amount) : 0,
    status: item.status as string,
    generatedAt: item.generated_at as string | null,
    sentAt: item.sent_at as string | null,
    includeAccounts: item.include_accounts as string[] | null,
    excludeAccounts: item.exclude_accounts as string[] | null,
    cutoffDate: item.cutoff_date as string | null,
    notes: item.notes as string | null,
    createdAt: item.created_at as string,
    createdBy: item.created_by as string | null,
  }
}

function transformTemplate(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    orgId: item.org_id as string,
    name: item.name as string,
    description: item.description as string | null,
    headerHtml: item.header_html as string | null,
    footerHtml: item.footer_html as string | null,
    lineItemFormat: item.line_item_format as string | null,
    logoUrl: item.logo_url as string | null,
    primaryColor: item.primary_color as string | null,
    fontFamily: item.font_family as string | null,
    defaultPaymentTermsId: item.default_payment_terms_id as string | null,
    defaultNotes: item.default_notes as string | null,
    defaultTermsAndConditions: item.default_terms_and_conditions as string | null,
    isDefault: item.is_default as boolean,
    isActive: item.is_active as boolean,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
  }
}

// Generate invoice number
async function generateInvoiceNumber(adminClient: ReturnType<typeof getAdminClient>, orgId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`

  // Get the highest invoice number for this year
  const { data } = await adminClient
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

// Calculate aging bucket
function calculateAgingBucket(dueDate: string): string {
  const due = new Date(dueDate)
  const today = new Date()
  const daysPastDue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))

  if (daysPastDue < 0) return 'current'
  if (daysPastDue <= 30) return '0-30'
  if (daysPastDue <= 60) return '31-60'
  if (daysPastDue <= 90) return '61-90'
  return '90+'
}

// ============================================
// ROUTER
// ============================================

export const invoicesRouter = router({
  // ==========================================
  // INVOICES - Main invoice operations
  // ==========================================

  // List invoices with filters
  list: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid().optional(),
      accountId: z.string().uuid().optional(),
      status: invoiceStatusEnum.optional(),
      invoiceType: invoiceTypeEnum.optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      agingBucket: z.string().optional(),
      search: z.string().optional(),
      isOverdue: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['invoice_number', 'invoice_date', 'due_date', 'total_amount', 'balance_due', 'status', 'created_at']).default('invoice_date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('invoices')
        .select(`
          *,
          company:companies!company_id(id, legal_name),
          billing_contact:contacts!billing_contact_id(id, first_name, last_name, email)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input.companyId) query = query.eq('company_id', input.companyId)
      if (input.accountId) query = query.eq('account_id', input.accountId)
      if (input.status) query = query.eq('status', input.status)
      if (input.invoiceType) query = query.eq('invoice_type', input.invoiceType)
      if (input.fromDate) query = query.gte('invoice_date', input.fromDate)
      if (input.toDate) query = query.lte('invoice_date', input.toDate)
      if (input.agingBucket) query = query.eq('aging_bucket', input.agingBucket)

      if (input.isOverdue === true) {
        const today = new Date().toISOString().split('T')[0]
        query = query.lt('due_date', today).gt('balance_due', 0).neq('status', 'paid').neq('status', 'void')
      }

      if (input.search) {
        query = query.or(`invoice_number.ilike.%${input.search}%,reference_number.ilike.%${input.search}%`)
      }

      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc', nullsFirst: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list invoices:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformInvoice) ?? [],
        total: count ?? 0,
      }
    }),

  // Get single invoice with full details
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('invoices')
        .select(`
          *,
          company:companies!company_id(id, legal_name, legal_address),
          billing_contact:contacts!billing_contact_id(id, first_name, last_name, email, phone),
          payment_terms:payment_terms!payment_terms_id(id, name, days_until_due)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      // Fetch line items
      const { data: lineItems } = await adminClient
        .from('invoice_line_items')
        .select(`
          *,
          timesheet:timesheets!timesheet_id(id, period_start, period_end),
          placement:placements!placement_id(id, candidate:contacts!candidate_id(id, first_name, last_name))
        `)
        .eq('invoice_id', input.id)
        .order('line_number', { ascending: true })

      // Fetch payments
      const { data: payments } = await adminClient
        .from('invoice_payments')
        .select(`
          *,
          creator:user_profiles!created_by(id, full_name)
        `)
        .eq('invoice_id', input.id)
        .order('payment_date', { ascending: false })

      const invoice = transformInvoice(data)
      return {
        ...invoice,
        lineItems: lineItems?.map(transformLineItem) ?? [],
        payments: payments?.map(transformPayment) ?? [],
      }
    }),

  // Create invoice manually
  create: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      accountId: z.string().uuid().optional(),
      billingContactId: z.string().uuid().optional(),
      invoiceType: invoiceTypeEnum.default('standard'),
      invoiceDate: z.string(),
      dueDate: z.string(),
      referenceNumber: z.string().optional(),
      currency: z.string().default('USD'),
      subtotal: z.number().default(0),
      discountAmount: z.number().default(0),
      discountPercentage: z.number().optional(),
      taxAmount: z.number().default(0),
      totalAmount: z.number().default(0),
      paymentTermsId: z.string().uuid().optional(),
      paymentInstructions: z.string().optional(),
      internalNotes: z.string().optional(),
      clientNotes: z.string().optional(),
      termsAndConditions: z.string().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        serviceStartDate: z.string().optional(),
        serviceEndDate: z.string().optional(),
        quantity: z.number(),
        unitType: z.string().default('hours'),
        unitRate: z.number(),
        discountAmount: z.number().default(0),
        taxRate: z.number().default(0),
        taxAmount: z.number().default(0),
        totalAmount: z.number(),
        glCode: z.string().optional(),
        costCenter: z.string().optional(),
        projectCode: z.string().optional(),
        timesheetId: z.string().uuid().optional(),
        placementId: z.string().uuid().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify company belongs to org
      const { data: company } = await adminClient
        .from('companies')
        .select('id')
        .eq('id', input.companyId)
        .eq('org_id', orgId)
        .single()

      if (!company) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Company not found' })
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(adminClient, orgId)

      // Create invoice
      const { data, error } = await adminClient
        .from('invoices')
        .insert({
          org_id: orgId,
          invoice_number: invoiceNumber,
          reference_number: input.referenceNumber || null,
          account_id: input.accountId || null,
          company_id: input.companyId,
          billing_contact_id: input.billingContactId || null,
          invoice_type: input.invoiceType,
          invoice_date: input.invoiceDate,
          due_date: input.dueDate,
          currency: input.currency,
          subtotal: input.subtotal,
          discount_amount: input.discountAmount,
          discount_percentage: input.discountPercentage ?? null,
          tax_amount: input.taxAmount,
          total_amount: input.totalAmount,
          payment_terms_id: input.paymentTermsId || null,
          payment_instructions: input.paymentInstructions || null,
          internal_notes: input.internalNotes || null,
          client_notes: input.clientNotes || null,
          terms_and_conditions: input.termsAndConditions || null,
          status: 'draft',
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create invoice:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const invoiceId = data.id

      // Insert line items if provided
      if (input.lineItems && input.lineItems.length > 0) {
        const lineItemInserts = input.lineItems.map((item, index) => ({
          invoice_id: invoiceId,
          line_number: index + 1,
          description: item.description,
          service_start_date: item.serviceStartDate || null,
          service_end_date: item.serviceEndDate || null,
          quantity: item.quantity,
          unit_type: item.unitType,
          unit_rate: item.unitRate,
          discount_amount: item.discountAmount,
          tax_rate: item.taxRate,
          tax_amount: item.taxAmount,
          total_amount: item.totalAmount,
          gl_code: item.glCode || null,
          cost_center: item.costCenter || null,
          project_code: item.projectCode || null,
          timesheet_id: item.timesheetId || null,
          placement_id: item.placementId || null,
        }))

        const { error: lineItemError } = await adminClient
          .from('invoice_line_items')
          .insert(lineItemInserts)

        if (lineItemError) {
          console.error('Failed to create line items:', lineItemError)
        }
      }

      return { id: invoiceId, invoiceNumber }
    }),

  // Generate invoices from approved timesheets
  generateFromTimesheets: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      timesheetIds: z.array(z.string().uuid()),
      invoiceDate: z.string(),
      dueDate: z.string(),
      billingContactId: z.string().uuid().optional(),
      paymentTermsId: z.string().uuid().optional(),
      internalNotes: z.string().optional(),
      clientNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Fetch timesheets
      const { data: timesheets, error: tsError } = await adminClient
        .from('timesheets')
        .select(`
          *,
          placement:placements!placement_id(
            id,
            candidate:contacts!candidate_id(id, first_name, last_name),
            job:jobs!job_id(id, title)
          )
        `)
        .eq('org_id', orgId)
        .in('id', input.timesheetIds)
        .eq('status', 'approved')
        .is('invoice_id', null)
        .is('deleted_at', null)

      if (tsError || !timesheets || timesheets.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No eligible timesheets found' })
      }

      // Calculate totals
      let subtotal = 0
      const lineItems: Array<{
        description: string
        serviceStartDate: string
        serviceEndDate: string
        quantity: number
        unitType: string
        unitRate: number
        totalAmount: number
        timesheetId: string
        placementId: string
      }> = []

      for (const ts of timesheets) {
        const placement = ts.placement as Record<string, unknown>
        const candidate = placement?.candidate as Record<string, unknown>
        const job = placement?.job as Record<string, unknown>
        const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown'
        const jobTitle = (job?.title as string) || 'Unknown Job'

        const billableAmount = Number(ts.total_billable_amount) || 0
        const totalHours = Number(ts.total_regular_hours || 0) +
                          Number(ts.total_overtime_hours || 0) * 1.5 +
                          Number(ts.total_double_time_hours || 0) * 2

        const rateSnapshot = ts.rate_snapshot as Record<string, unknown>
        const billRate = rateSnapshot?.billRate ? Number(rateSnapshot.billRate) :
                        (totalHours > 0 ? billableAmount / totalHours : 0)

        subtotal += billableAmount

        lineItems.push({
          description: `${candidateName} - ${jobTitle} (${ts.period_start} to ${ts.period_end})`,
          serviceStartDate: ts.period_start,
          serviceEndDate: ts.period_end,
          quantity: totalHours,
          unitType: 'hours',
          unitRate: billRate,
          totalAmount: billableAmount,
          timesheetId: ts.id,
          placementId: placement?.id as string,
        })
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(adminClient, orgId)

      // Create invoice
      const { data: invoice, error: invoiceError } = await adminClient
        .from('invoices')
        .insert({
          org_id: orgId,
          invoice_number: invoiceNumber,
          company_id: input.companyId,
          billing_contact_id: input.billingContactId || null,
          invoice_type: 'standard',
          invoice_date: input.invoiceDate,
          due_date: input.dueDate,
          currency: 'USD',
          subtotal: subtotal,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: subtotal,
          payment_terms_id: input.paymentTermsId || null,
          internal_notes: input.internalNotes || null,
          client_notes: input.clientNotes || null,
          status: 'draft',
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single()

      if (invoiceError) {
        console.error('Failed to create invoice:', invoiceError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: invoiceError.message })
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
        total_amount: item.totalAmount,
        timesheet_id: item.timesheetId,
        placement_id: item.placementId,
      }))

      await adminClient
        .from('invoice_line_items')
        .insert(lineItemInserts)

      // Link timesheets to invoice
      await adminClient
        .from('timesheets')
        .update({ invoice_id: invoiceId, updated_by: user?.id })
        .in('id', input.timesheetIds)

      return { id: invoiceId, invoiceNumber }
    }),

  // Update invoice (draft only)
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      referenceNumber: z.string().optional(),
      billingContactId: z.string().uuid().optional(),
      invoiceDate: z.string().optional(),
      dueDate: z.string().optional(),
      discountAmount: z.number().optional(),
      discountPercentage: z.number().optional(),
      taxAmount: z.number().optional(),
      paymentTermsId: z.string().uuid().optional(),
      paymentInstructions: z.string().optional(),
      internalNotes: z.string().optional(),
      clientNotes: z.string().optional(),
      termsAndConditions: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify invoice exists and is in draft status
      const { data: existing } = await adminClient
        .from('invoices')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      if (existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only update draft invoices' })
      }

      const { id, ...updateData } = input
      const dbUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }

      if (updateData.referenceNumber !== undefined) dbUpdate.reference_number = updateData.referenceNumber
      if (updateData.billingContactId !== undefined) dbUpdate.billing_contact_id = updateData.billingContactId
      if (updateData.invoiceDate !== undefined) dbUpdate.invoice_date = updateData.invoiceDate
      if (updateData.dueDate !== undefined) dbUpdate.due_date = updateData.dueDate
      if (updateData.discountAmount !== undefined) dbUpdate.discount_amount = updateData.discountAmount
      if (updateData.discountPercentage !== undefined) dbUpdate.discount_percentage = updateData.discountPercentage
      if (updateData.taxAmount !== undefined) dbUpdate.tax_amount = updateData.taxAmount
      if (updateData.paymentTermsId !== undefined) dbUpdate.payment_terms_id = updateData.paymentTermsId
      if (updateData.paymentInstructions !== undefined) dbUpdate.payment_instructions = updateData.paymentInstructions
      if (updateData.internalNotes !== undefined) dbUpdate.internal_notes = updateData.internalNotes
      if (updateData.clientNotes !== undefined) dbUpdate.client_notes = updateData.clientNotes
      if (updateData.termsAndConditions !== undefined) dbUpdate.terms_and_conditions = updateData.termsAndConditions

      const { error } = await adminClient
        .from('invoices')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update invoice:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Delete invoice (soft delete, draft only)
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify invoice exists and is in draft status
      const { data: existing } = await adminClient
        .from('invoices')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      if (existing.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only delete draft invoices' })
      }

      // Unlink any timesheets
      await adminClient
        .from('timesheets')
        .update({ invoice_id: null })
        .eq('invoice_id', input.id)

      const { error } = await adminClient
        .from('invoices')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete invoice:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Approve invoice for sending
  approve: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('invoices')
        .select('id, status')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      if (existing.status !== 'draft' && existing.status !== 'pending_approval') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invoice is not pending approval' })
      }

      const { error } = await adminClient
        .from('invoices')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to approve invoice:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Send invoice to client
  send: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      emailAddresses: z.array(z.string().email()),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('invoices')
        .select('id, status, due_date')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      if (!['draft', 'approved'].includes(existing.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invoice cannot be sent in current status' })
      }

      // TODO: Integrate with email service to actually send the invoice
      // For now, just update status

      const agingBucket = calculateAgingBucket(existing.due_date)

      const { error } = await adminClient
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_to: input.emailAddresses,
          aging_bucket: agingBucket,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to mark invoice as sent:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Record payment
  recordPayment: orgProtectedProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      paymentDate: z.string(),
      amount: z.number().positive(),
      paymentMethod: paymentMethodEnum,
      referenceNumber: z.string().optional(),
      bankReference: z.string().optional(),
      depositDate: z.string().optional(),
      depositAccount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get invoice
      const { data: invoice } = await adminClient
        .from('invoices')
        .select('id, total_amount, amount_paid, status')
        .eq('id', input.invoiceId)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!invoice) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      if (['void', 'written_off'].includes(invoice.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot record payment for voided invoice' })
      }

      // Create payment record
      const { data: payment, error: paymentError } = await adminClient
        .from('invoice_payments')
        .insert({
          org_id: orgId,
          invoice_id: input.invoiceId,
          payment_date: input.paymentDate,
          amount: input.amount,
          payment_method: input.paymentMethod,
          reference_number: input.referenceNumber || null,
          bank_reference: input.bankReference || null,
          deposit_date: input.depositDate || null,
          deposit_account: input.depositAccount || null,
          notes: input.notes || null,
          created_by: user?.id,
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Failed to record payment:', paymentError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: paymentError.message })
      }

      // Update invoice amounts and status
      const newAmountPaid = Number(invoice.amount_paid) + input.amount
      const totalAmount = Number(invoice.total_amount)
      const balanceDue = totalAmount - newAmountPaid

      let newStatus = invoice.status
      if (balanceDue <= 0) {
        newStatus = 'paid'
      } else if (newAmountPaid > 0) {
        newStatus = 'partially_paid'
      }

      await adminClient
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.invoiceId)

      return { id: payment.id }
    }),

  // Void invoice
  void: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('invoices')
        .select('id, status, amount_paid')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      if (Number(existing.amount_paid) > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot void invoice with payments. Create a credit note instead.' })
      }

      // Unlink timesheets
      await adminClient
        .from('timesheets')
        .update({ invoice_id: null })
        .eq('invoice_id', input.id)

      const { error } = await adminClient
        .from('invoices')
        .update({
          status: 'void',
          internal_notes: `Voided: ${input.reason}`,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to void invoice:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Mark as disputed
  dispute: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('invoices')
        .update({
          status: 'disputed',
          is_disputed: true,
          dispute_reason: input.reason,
          dispute_opened_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (error) {
        console.error('Failed to mark invoice as disputed:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Resolve dispute
  resolveDispute: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      resolution: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('invoices')
        .select('id, due_date')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      // Determine new status based on due date
      const agingBucket = calculateAgingBucket(existing.due_date)
      const newStatus = agingBucket !== 'current' ? 'overdue' : 'sent'

      const { error } = await adminClient
        .from('invoices')
        .update({
          status: newStatus,
          is_disputed: false,
          dispute_resolved_at: new Date().toISOString(),
          aging_bucket: agingBucket,
          internal_notes: input.resolution || null,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to resolve dispute:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Write off balance
  writeOff: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      amount: z.number().positive(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data: existing } = await adminClient
        .from('invoices')
        .select('id, balance_due, written_off_amount')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
      }

      const currentBalance = Number(existing.balance_due)
      if (input.amount > currentBalance) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Write-off amount exceeds balance due' })
      }

      const newWrittenOff = Number(existing.written_off_amount || 0) + input.amount
      const newStatus = input.amount >= currentBalance ? 'written_off' : 'partially_paid'

      const { error } = await adminClient
        .from('invoices')
        .update({
          written_off_amount: newWrittenOff,
          written_off_at: new Date().toISOString(),
          written_off_reason: input.reason,
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to write off invoice:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // Invoice statistics
  stats: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('invoices')
        .select('id, status, total_amount, balance_due, amount_paid, aging_bucket, due_date')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.companyId) {
        query = query.eq('company_id', input.companyId)
      }
      if (input?.fromDate) {
        query = query.gte('invoice_date', input.fromDate)
      }
      if (input?.toDate) {
        query = query.lte('invoice_date', input.toDate)
      }

      const { data: items } = await query

      const today = new Date().toISOString().split('T')[0]

      const byStatus = items?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const outstanding = items
        ?.filter(i => !['paid', 'void', 'written_off'].includes(i.status))
        ?.reduce((sum, i) => sum + Number(i.balance_due || 0), 0) || 0

      const overdue = items
        ?.filter(i => i.due_date < today && !['paid', 'void', 'written_off'].includes(i.status))
        ?.reduce((sum, i) => sum + Number(i.balance_due || 0), 0) || 0

      const collected = items
        ?.reduce((sum, i) => sum + Number(i.amount_paid || 0), 0) || 0

      // AR aging buckets
      const agingCurrent = items?.filter(i => i.aging_bucket === 'current')
        ?.reduce((sum, i) => sum + Number(i.balance_due || 0), 0) || 0
      const aging0_30 = items?.filter(i => i.aging_bucket === '0-30')
        ?.reduce((sum, i) => sum + Number(i.balance_due || 0), 0) || 0
      const aging31_60 = items?.filter(i => i.aging_bucket === '31-60')
        ?.reduce((sum, i) => sum + Number(i.balance_due || 0), 0) || 0
      const aging61_90 = items?.filter(i => i.aging_bucket === '61-90')
        ?.reduce((sum, i) => sum + Number(i.balance_due || 0), 0) || 0
      const aging90Plus = items?.filter(i => i.aging_bucket === '90+')
        ?.reduce((sum, i) => sum + Number(i.balance_due || 0), 0) || 0

      return {
        total: items?.length ?? 0,
        draft: byStatus['draft'] ?? 0,
        sent: byStatus['sent'] ?? 0,
        partiallyPaid: byStatus['partially_paid'] ?? 0,
        paid: byStatus['paid'] ?? 0,
        overdue: byStatus['overdue'] ?? 0,
        disputed: byStatus['disputed'] ?? 0,
        void: byStatus['void'] ?? 0,
        outstanding,
        overdueAmount: overdue,
        collected,
        byStatus,
        aging: {
          current: agingCurrent,
          '0-30': aging0_30,
          '31-60': aging31_60,
          '61-90': aging61_90,
          '90+': aging90Plus,
        },
      }
    }),

  // Update aging buckets (scheduled job)
  updateAgingBuckets: orgProtectedProcedure
    .mutation(async ({ ctx }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get all open invoices
      const { data: invoices } = await adminClient
        .from('invoices')
        .select('id, due_date')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('status', 'in', '("paid","void","written_off")')

      if (!invoices) return { updated: 0 }

      let updated = 0
      const today = new Date().toISOString().split('T')[0]

      for (const invoice of invoices) {
        const agingBucket = calculateAgingBucket(invoice.due_date)
        const isOverdue = invoice.due_date < today

        await adminClient
          .from('invoices')
          .update({
            aging_bucket: agingBucket,
            status: isOverdue ? 'overdue' : undefined,
            updated_by: user?.id,
          })
          .eq('id', invoice.id)

        updated++
      }

      return { updated }
    }),

  // ==========================================
  // LINE ITEMS - Invoice line item operations
  // ==========================================
  lineItems: router({
    // List line items for an invoice
    list: orgProtectedProcedure
      .input(z.object({
        invoiceId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify invoice belongs to org
        const { data: invoice } = await adminClient
          .from('invoices')
          .select('id')
          .eq('id', input.invoiceId)
          .eq('org_id', orgId)
          .single()

        if (!invoice) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
        }

        const { data, error } = await adminClient
          .from('invoice_line_items')
          .select(`
            *,
            timesheet:timesheets!timesheet_id(id, period_start, period_end),
            placement:placements!placement_id(id)
          `)
          .eq('invoice_id', input.invoiceId)
          .order('line_number', { ascending: true })

        if (error) {
          console.error('Failed to list line items:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformLineItem) ?? []
      }),

    // Add line item
    create: orgProtectedProcedure
      .input(z.object({
        invoiceId: z.string().uuid(),
        description: z.string(),
        serviceStartDate: z.string().optional(),
        serviceEndDate: z.string().optional(),
        quantity: z.number(),
        unitType: z.string().default('hours'),
        unitRate: z.number(),
        discountAmount: z.number().default(0),
        taxRate: z.number().default(0),
        taxAmount: z.number().default(0),
        totalAmount: z.number(),
        glCode: z.string().optional(),
        costCenter: z.string().optional(),
        projectCode: z.string().optional(),
        timesheetId: z.string().uuid().optional(),
        placementId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify invoice belongs to org and is draft
        const { data: invoice } = await adminClient
          .from('invoices')
          .select('id, status, subtotal, total_amount')
          .eq('id', input.invoiceId)
          .eq('org_id', orgId)
          .single()

        if (!invoice) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
        }

        if (invoice.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only add line items to draft invoices' })
        }

        // Get next line number
        const { data: lastLine } = await adminClient
          .from('invoice_line_items')
          .select('line_number')
          .eq('invoice_id', input.invoiceId)
          .order('line_number', { ascending: false })
          .limit(1)
          .single()

        const lineNumber = (lastLine?.line_number || 0) + 1

        const { data, error } = await adminClient
          .from('invoice_line_items')
          .insert({
            invoice_id: input.invoiceId,
            line_number: lineNumber,
            description: input.description,
            service_start_date: input.serviceStartDate || null,
            service_end_date: input.serviceEndDate || null,
            quantity: input.quantity,
            unit_type: input.unitType,
            unit_rate: input.unitRate,
            discount_amount: input.discountAmount,
            tax_rate: input.taxRate,
            tax_amount: input.taxAmount,
            total_amount: input.totalAmount,
            gl_code: input.glCode || null,
            cost_center: input.costCenter || null,
            project_code: input.projectCode || null,
            timesheet_id: input.timesheetId || null,
            placement_id: input.placementId || null,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create line item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update invoice totals
        const newSubtotal = Number(invoice.subtotal) + input.totalAmount
        await adminClient
          .from('invoices')
          .update({
            subtotal: newSubtotal,
            total_amount: newSubtotal, // Simplified, should account for discounts/taxes
            updated_by: user?.id,
          })
          .eq('id', input.invoiceId)

        return { id: data.id }
      }),

    // Update line item
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        invoiceId: z.string().uuid(),
        description: z.string().optional(),
        quantity: z.number().optional(),
        unitRate: z.number().optional(),
        discountAmount: z.number().optional(),
        taxRate: z.number().optional(),
        taxAmount: z.number().optional(),
        totalAmount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify invoice belongs to org and is draft
        const { data: invoice } = await adminClient
          .from('invoices')
          .select('id, status')
          .eq('id', input.invoiceId)
          .eq('org_id', orgId)
          .single()

        if (!invoice) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
        }

        if (invoice.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only update line items in draft invoices' })
        }

        const { id, invoiceId, ...updateData } = input
        const dbUpdate: Record<string, unknown> = {}

        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.quantity !== undefined) dbUpdate.quantity = updateData.quantity
        if (updateData.unitRate !== undefined) dbUpdate.unit_rate = updateData.unitRate
        if (updateData.discountAmount !== undefined) dbUpdate.discount_amount = updateData.discountAmount
        if (updateData.taxRate !== undefined) dbUpdate.tax_rate = updateData.taxRate
        if (updateData.taxAmount !== undefined) dbUpdate.tax_amount = updateData.taxAmount
        if (updateData.totalAmount !== undefined) dbUpdate.total_amount = updateData.totalAmount

        const { error } = await adminClient
          .from('invoice_line_items')
          .update(dbUpdate)
          .eq('id', id)
          .eq('invoice_id', invoiceId)

        if (error) {
          console.error('Failed to update line item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Recalculate invoice totals
        const { data: allLines } = await adminClient
          .from('invoice_line_items')
          .select('total_amount')
          .eq('invoice_id', invoiceId)

        const newSubtotal = allLines?.reduce((sum, l) => sum + Number(l.total_amount || 0), 0) || 0
        await adminClient
          .from('invoices')
          .update({
            subtotal: newSubtotal,
            total_amount: newSubtotal,
            updated_by: user?.id,
          })
          .eq('id', invoiceId)

        return { success: true }
      }),

    // Delete line item
    delete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        invoiceId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Verify invoice belongs to org and is draft
        const { data: invoice } = await adminClient
          .from('invoices')
          .select('id, status')
          .eq('id', input.invoiceId)
          .eq('org_id', orgId)
          .single()

        if (!invoice) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
        }

        if (invoice.status !== 'draft') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only delete line items from draft invoices' })
        }

        // Get line item to unlink timesheet if needed
        const { data: lineItem } = await adminClient
          .from('invoice_line_items')
          .select('id, timesheet_id, total_amount')
          .eq('id', input.id)
          .single()

        if (lineItem?.timesheet_id) {
          await adminClient
            .from('timesheets')
            .update({ invoice_id: null })
            .eq('id', lineItem.timesheet_id)
        }

        const { error } = await adminClient
          .from('invoice_line_items')
          .delete()
          .eq('id', input.id)
          .eq('invoice_id', input.invoiceId)

        if (error) {
          console.error('Failed to delete line item:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Recalculate invoice totals
        const { data: allLines } = await adminClient
          .from('invoice_line_items')
          .select('total_amount')
          .eq('invoice_id', input.invoiceId)

        const newSubtotal = allLines?.reduce((sum, l) => sum + Number(l.total_amount || 0), 0) || 0
        await adminClient
          .from('invoices')
          .update({
            subtotal: newSubtotal,
            total_amount: newSubtotal,
            updated_by: user?.id,
          })
          .eq('id', input.invoiceId)

        return { success: true }
      }),
  }),

  // ==========================================
  // PAYMENTS - Payment operations
  // ==========================================
  payments: router({
    // List payments for an invoice
    list: orgProtectedProcedure
      .input(z.object({
        invoiceId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Verify invoice belongs to org
        const { data: invoice } = await adminClient
          .from('invoices')
          .select('id')
          .eq('id', input.invoiceId)
          .eq('org_id', orgId)
          .single()

        if (!invoice) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
        }

        const { data, error } = await adminClient
          .from('invoice_payments')
          .select(`
            *,
            creator:user_profiles!created_by(id, full_name)
          `)
          .eq('invoice_id', input.invoiceId)
          .order('payment_date', { ascending: false })

        if (error) {
          console.error('Failed to list payments:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformPayment) ?? []
      }),

    // Delete payment (reversal)
    delete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        invoiceId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get payment and invoice
        const { data: payment } = await adminClient
          .from('invoice_payments')
          .select('id, amount')
          .eq('id', input.id)
          .eq('invoice_id', input.invoiceId)
          .single()

        if (!payment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Payment not found' })
        }

        const { data: invoice } = await adminClient
          .from('invoices')
          .select('id, amount_paid, total_amount')
          .eq('id', input.invoiceId)
          .eq('org_id', orgId)
          .single()

        if (!invoice) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found' })
        }

        // Delete payment
        const { error } = await adminClient
          .from('invoice_payments')
          .delete()
          .eq('id', input.id)

        if (error) {
          console.error('Failed to delete payment:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update invoice
        const newAmountPaid = Number(invoice.amount_paid) - Number(payment.amount)
        const newStatus = newAmountPaid <= 0 ? 'sent' : 'partially_paid'

        await adminClient
          .from('invoices')
          .update({
            amount_paid: Math.max(0, newAmountPaid),
            status: newStatus,
            updated_by: user?.id,
          })
          .eq('id', input.invoiceId)

        return { success: true }
      }),
  }),

  // ==========================================
  // PAYMENT TERMS - Payment terms configuration
  // ==========================================
  paymentTerms: router({
    // List payment terms
    list: orgProtectedProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('payment_terms')
          .select('*')
          .eq('org_id', orgId)

        if (input.isActive !== undefined) {
          query = query.eq('is_active', input.isActive)
        }

        query = query.order('name')

        const { data, error } = await query

        if (error) {
          console.error('Failed to list payment terms:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformPaymentTerms) ?? []
      }),

    // Get default payment terms
    getDefault: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('payment_terms')
          .select('*')
          .eq('org_id', orgId)
          .eq('is_default', true)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          return null
        }

        return transformPaymentTerms(data)
      }),

    // Create payment terms
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        daysUntilDue: z.number().int().min(0).default(30),
        earlyPaymentDiscountPercent: z.number().min(0).max(100).optional(),
        earlyPaymentDiscountDays: z.number().int().min(0).optional(),
        lateFeePercent: z.number().min(0).max(100).optional(),
        lateFeeFlat: z.number().min(0).optional(),
        lateFeeGraceDays: z.number().int().min(0).default(0),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault) {
          await adminClient
            .from('payment_terms')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { data, error } = await adminClient
          .from('payment_terms')
          .insert({
            org_id: orgId,
            name: input.name,
            description: input.description || null,
            days_until_due: input.daysUntilDue,
            early_payment_discount_percent: input.earlyPaymentDiscountPercent ?? null,
            early_payment_discount_days: input.earlyPaymentDiscountDays ?? null,
            late_fee_percent: input.lateFeePercent ?? null,
            late_fee_flat: input.lateFeeFlat ?? null,
            late_fee_grace_days: input.lateFeeGraceDays,
            is_default: input.isDefault,
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create payment terms:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update payment terms
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        daysUntilDue: z.number().int().min(0).optional(),
        earlyPaymentDiscountPercent: z.number().min(0).max(100).optional().nullable(),
        earlyPaymentDiscountDays: z.number().int().min(0).optional().nullable(),
        lateFeePercent: z.number().min(0).max(100).optional().nullable(),
        lateFeeFlat: z.number().min(0).optional().nullable(),
        lateFeeGraceDays: z.number().int().min(0).optional(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault === true) {
          await adminClient
            .from('payment_terms')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { id, ...updateData } = input
        const dbUpdate: Record<string, unknown> = {}

        if (updateData.name !== undefined) dbUpdate.name = updateData.name
        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.daysUntilDue !== undefined) dbUpdate.days_until_due = updateData.daysUntilDue
        if (updateData.earlyPaymentDiscountPercent !== undefined) dbUpdate.early_payment_discount_percent = updateData.earlyPaymentDiscountPercent
        if (updateData.earlyPaymentDiscountDays !== undefined) dbUpdate.early_payment_discount_days = updateData.earlyPaymentDiscountDays
        if (updateData.lateFeePercent !== undefined) dbUpdate.late_fee_percent = updateData.lateFeePercent
        if (updateData.lateFeeFlat !== undefined) dbUpdate.late_fee_flat = updateData.lateFeeFlat
        if (updateData.lateFeeGraceDays !== undefined) dbUpdate.late_fee_grace_days = updateData.lateFeeGraceDays
        if (updateData.isDefault !== undefined) dbUpdate.is_default = updateData.isDefault
        if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive

        const { error } = await adminClient
          .from('payment_terms')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update payment terms:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete payment terms
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('payment_terms')
          .delete()
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete payment terms:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ==========================================
  // BATCHES - Batch invoice operations
  // ==========================================
  batches: router({
    // List batches
    list: orgProtectedProcedure
      .input(z.object({
        status: batchStatusEnum.optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('invoice_batches')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)

        if (input.status) {
          query = query.eq('status', input.status)
        }

        query = query
          .order('batch_date', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          console.error('Failed to list batches:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(transformBatch) ?? [],
          total: count ?? 0,
        }
      }),

    // Create batch
    create: orgProtectedProcedure
      .input(z.object({
        batchDate: z.string(),
        cutoffDate: z.string().optional(),
        includeAccounts: z.array(z.string().uuid()).optional(),
        excludeAccounts: z.array(z.string().uuid()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Generate batch number
        const year = new Date().getFullYear()
        const month = String(new Date().getMonth() + 1).padStart(2, '0')
        const prefix = `BATCH-${year}${month}-`

        const { data: lastBatch } = await adminClient
          .from('invoice_batches')
          .select('batch_number')
          .eq('org_id', orgId)
          .like('batch_number', `${prefix}%`)
          .order('batch_number', { ascending: false })
          .limit(1)
          .single()

        let nextNumber = 1
        if (lastBatch?.batch_number) {
          const match = lastBatch.batch_number.match(/BATCH-\d+-(\d+)/)
          if (match) {
            nextNumber = parseInt(match[1], 10) + 1
          }
        }

        const batchNumber = `${prefix}${String(nextNumber).padStart(3, '0')}`

        const { data, error } = await adminClient
          .from('invoice_batches')
          .insert({
            org_id: orgId,
            batch_number: batchNumber,
            batch_date: input.batchDate,
            cutoff_date: input.cutoffDate || null,
            include_accounts: input.includeAccounts || null,
            exclude_accounts: input.excludeAccounts || null,
            notes: input.notes || null,
            status: 'draft',
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create batch:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id, batchNumber }
      }),
  }),

  // ==========================================
  // TEMPLATES - Invoice templates
  // ==========================================
  templates: router({
    // List templates
    list: orgProtectedProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('invoice_templates')
          .select('*')
          .eq('org_id', orgId)

        if (input.isActive !== undefined) {
          query = query.eq('is_active', input.isActive)
        }

        query = query.order('name')

        const { data, error } = await query

        if (error) {
          console.error('Failed to list templates:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(transformTemplate) ?? []
      }),

    // Get default template
    getDefault: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('invoice_templates')
          .select('*')
          .eq('org_id', orgId)
          .eq('is_default', true)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          return null
        }

        return transformTemplate(data)
      }),

    // Create template
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        headerHtml: z.string().optional(),
        footerHtml: z.string().optional(),
        lineItemFormat: z.string().optional(),
        logoUrl: z.string().url().optional(),
        primaryColor: z.string().optional(),
        fontFamily: z.string().optional(),
        defaultPaymentTermsId: z.string().uuid().optional(),
        defaultNotes: z.string().optional(),
        defaultTermsAndConditions: z.string().optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault) {
          await adminClient
            .from('invoice_templates')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { data, error } = await adminClient
          .from('invoice_templates')
          .insert({
            org_id: orgId,
            name: input.name,
            description: input.description || null,
            header_html: input.headerHtml || null,
            footer_html: input.footerHtml || null,
            line_item_format: input.lineItemFormat || null,
            logo_url: input.logoUrl || null,
            primary_color: input.primaryColor || null,
            font_family: input.fontFamily || null,
            default_payment_terms_id: input.defaultPaymentTermsId || null,
            default_notes: input.defaultNotes || null,
            default_terms_and_conditions: input.defaultTermsAndConditions || null,
            is_default: input.isDefault,
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id }
      }),

    // Update template
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        headerHtml: z.string().optional(),
        footerHtml: z.string().optional(),
        lineItemFormat: z.string().optional(),
        logoUrl: z.string().url().optional().nullable(),
        primaryColor: z.string().optional(),
        fontFamily: z.string().optional(),
        defaultPaymentTermsId: z.string().uuid().optional().nullable(),
        defaultNotes: z.string().optional(),
        defaultTermsAndConditions: z.string().optional(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // If setting as default, clear other defaults
        if (input.isDefault === true) {
          await adminClient
            .from('invoice_templates')
            .update({ is_default: false })
            .eq('org_id', orgId)
        }

        const { id, ...updateData } = input
        const dbUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (updateData.name !== undefined) dbUpdate.name = updateData.name
        if (updateData.description !== undefined) dbUpdate.description = updateData.description
        if (updateData.headerHtml !== undefined) dbUpdate.header_html = updateData.headerHtml
        if (updateData.footerHtml !== undefined) dbUpdate.footer_html = updateData.footerHtml
        if (updateData.lineItemFormat !== undefined) dbUpdate.line_item_format = updateData.lineItemFormat
        if (updateData.logoUrl !== undefined) dbUpdate.logo_url = updateData.logoUrl
        if (updateData.primaryColor !== undefined) dbUpdate.primary_color = updateData.primaryColor
        if (updateData.fontFamily !== undefined) dbUpdate.font_family = updateData.fontFamily
        if (updateData.defaultPaymentTermsId !== undefined) dbUpdate.default_payment_terms_id = updateData.defaultPaymentTermsId
        if (updateData.defaultNotes !== undefined) dbUpdate.default_notes = updateData.defaultNotes
        if (updateData.defaultTermsAndConditions !== undefined) dbUpdate.default_terms_and_conditions = updateData.defaultTermsAndConditions
        if (updateData.isDefault !== undefined) dbUpdate.is_default = updateData.isDefault
        if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive

        const { error } = await adminClient
          .from('invoice_templates')
          .update(dbUpdate)
          .eq('id', id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to update template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // Delete template
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('invoice_templates')
          .delete()
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          console.error('Failed to delete template:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),
})
