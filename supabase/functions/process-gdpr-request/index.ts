import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tables to scan for GDPR data discovery
const GDPR_TABLES = [
  { table: 'user_profiles', emailField: 'email', nameFields: ['first_name', 'last_name'], type: 'candidate' },
  { table: 'point_of_contacts', emailField: 'email', nameFields: ['first_name', 'last_name'], type: 'contact' },
  { table: 'leads', emailField: 'email', nameFields: ['first_name', 'last_name'], type: 'lead' },
  { table: 'employees', emailField: 'email', nameFields: ['first_name', 'last_name'], type: 'employee' },
  { table: 'consultants', emailField: 'email', nameFields: [], type: 'consultant' },
]

// Tables with references to users (for cascading discovery)
const REFERENCE_TABLES = [
  { table: 'submissions', refField: 'candidate_id', refTable: 'user_profiles' },
  { table: 'interviews', refField: 'candidate_id', refTable: 'user_profiles' },
  { table: 'placements', refField: 'candidate_id', refTable: 'user_profiles' },
  { table: 'activities', refField: 'actor_id', refTable: 'user_profiles' },
  { table: 'audit_logs', emailField: 'user_email', type: 'audit' },
]

// Fields to anonymize for erasure requests
const ANONYMIZE_FIELDS = [
  'email', 'first_name', 'last_name', 'phone', 'mobile',
  'address', 'city', 'state', 'zip', 'country',
  'linkedin_url', 'resume_url', 'notes', 'ssn', 'date_of_birth',
]

interface GdprRequest {
  id: string
  org_id: string
  request_type: 'dsar' | 'erasure' | 'rectification' | 'restriction' | 'portability'
  subject_email: string
  subject_name?: string
  subject_phone?: string
  data_found?: Record<string, unknown>
  tables_scanned?: string[]
  total_records_found?: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { requestId, action, orgId } = await req.json()

    if (!requestId || !action || !orgId) {
      throw new Error('requestId, action, and orgId are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('id', requestId)
      .eq('org_id', orgId)
      .single()

    if (requestError || !request) {
      throw new Error(`Request not found: ${requestError?.message || 'Unknown error'}`)
    }

    const typedRequest = request as GdprRequest

    if (action === 'discover') {
      // Data Discovery: Find all records related to the subject
      const dataFound: Record<string, Array<Record<string, unknown>>> = {}
      const tablesScanned: string[] = []
      let totalRecords = 0

      // Search direct tables by email
      for (const tableConfig of GDPR_TABLES) {
        tablesScanned.push(tableConfig.table)

        const { data: records, error } = await supabase
          .from(tableConfig.table)
          .select('*')
          .eq('org_id', orgId)
          .ilike(tableConfig.emailField, typedRequest.subject_email)

        if (!error && records && records.length > 0) {
          dataFound[tableConfig.table] = records
          totalRecords += records.length

          // Find related records
          for (const refConfig of REFERENCE_TABLES) {
            if (refConfig.refTable === tableConfig.table) {
              tablesScanned.push(refConfig.table)

              const recordIds = records.map(r => r.id)
              const { data: refRecords, error: refError } = await supabase
                .from(refConfig.table)
                .select('*')
                .eq('org_id', orgId)
                .in(refConfig.refField!, recordIds)

              if (!refError && refRecords && refRecords.length > 0) {
                dataFound[refConfig.table] = refRecords
                totalRecords += refRecords.length
              }
            }
          }
        }
      }

      // Search audit logs by email
      const { data: auditRecords, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', orgId)
        .ilike('user_email', typedRequest.subject_email)
        .limit(100) // Limit audit logs

      if (!auditError && auditRecords && auditRecords.length > 0) {
        dataFound['audit_logs'] = auditRecords
        totalRecords += auditRecords.length
        tablesScanned.push('audit_logs')
      }

      // Update request with discovery results
      await supabase
        .from('gdpr_requests')
        .update({
          data_found: dataFound,
          tables_scanned: [...new Set(tablesScanned)],
          total_records_found: totalRecords,
          status: 'in_review',
        })
        .eq('id', requestId)

      return new Response(
        JSON.stringify({
          success: true,
          action: 'discover',
          tablesScanned: tablesScanned.length,
          totalRecords,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'export') {
      // Data Export (Portability): Generate export file with all subject data
      const dataFound = typedRequest.data_found || {}

      if (Object.keys(dataFound).length === 0) {
        throw new Error('No data found. Run discovery first.')
      }

      // Create comprehensive export
      const exportData = {
        request_number: request.request_number,
        subject_email: typedRequest.subject_email,
        export_date: new Date().toISOString(),
        data: dataFound,
      }

      const fileContent = JSON.stringify(exportData, null, 2)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filePath = `${orgId}/gdpr-${request.request_number}-${timestamp}.json`

      // Upload to GDPR exports bucket
      const { error: uploadError } = await supabase.storage
        .from('gdpr-exports')
        .upload(filePath, fileContent, {
          contentType: 'application/json',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Update request
      await supabase
        .from('gdpr_requests')
        .update({
          action_taken: 'exported',
          export_file_path: filePath,
          status: 'processing',
        })
        .eq('id', requestId)

      return new Response(
        JSON.stringify({
          success: true,
          action: 'export',
          filePath,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'anonymize') {
      // Data Anonymization (Erasure): Anonymize all PII
      const dataFound = typedRequest.data_found || {}

      if (Object.keys(dataFound).length === 0) {
        throw new Error('No data found. Run discovery first.')
      }

      const anonymizedFields: string[] = []
      const timestamp = new Date().toISOString()

      // Process each table
      for (const [tableName, records] of Object.entries(dataFound)) {
        if (!Array.isArray(records) || records.length === 0) continue

        // Skip audit logs - those should be kept for compliance
        if (tableName === 'audit_logs') continue

        const recordIds = records.map(r => (r as Record<string, unknown>).id)

        // Build anonymized update
        const anonymizedData: Record<string, unknown> = {
          updated_at: timestamp,
        }

        // Get first record to check available fields
        const sampleRecord = records[0] as Record<string, unknown>
        for (const field of ANONYMIZE_FIELDS) {
          if (field in sampleRecord) {
            if (field === 'email') {
              anonymizedData[field] = `anonymized-${requestId.slice(0, 8)}@redacted.invalid`
            } else if (field === 'first_name' || field === 'last_name') {
              anonymizedData[field] = '[REDACTED]'
            } else if (field === 'phone' || field === 'mobile') {
              anonymizedData[field] = '000-000-0000'
            } else if (field.includes('url')) {
              anonymizedData[field] = null
            } else {
              anonymizedData[field] = '[REDACTED]'
            }
            anonymizedFields.push(`${tableName}.${field}`)
          }
        }

        // Update records
        const { error: updateError } = await supabase
          .from(tableName)
          .update(anonymizedData)
          .eq('org_id', orgId)
          .in('id', recordIds)

        if (updateError) {
          console.error(`Failed to anonymize ${tableName}:`, updateError)
        }
      }

      // Update request
      await supabase
        .from('gdpr_requests')
        .update({
          action_taken: 'anonymized',
          anonymized_fields: anonymizedFields,
          status: 'processing',
        })
        .eq('id', requestId)

      return new Response(
        JSON.stringify({
          success: true,
          action: 'anonymize',
          anonymizedFields: anonymizedFields.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error(`Unknown action: ${action}`)

  } catch (error) {
    console.error('GDPR processing error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
