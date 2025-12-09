import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Papa from 'https://esm.sh/papaparse@5.4.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Entity table mapping
const ENTITY_TABLES: Record<string, string> = {
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

interface ExportJob {
  id: string
  org_id: string
  entity_type: string
  export_name: string
  filters: Record<string, unknown>
  columns: string[]
  format: 'csv' | 'excel' | 'json'
  include_headers: boolean
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const { jobId } = await req.json()

    if (!jobId) {
      throw new Error('jobId is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message || 'Unknown error'}`)
    }

    const typedJob = job as ExportJob

    // Update status to processing
    await supabase
      .from('export_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId)

    const tableName = ENTITY_TABLES[typedJob.entity_type] || typedJob.entity_type

    // Build query with selected columns
    const selectColumns = typedJob.columns.length > 0
      ? typedJob.columns.join(',')
      : '*'

    let query = supabase
      .from(tableName)
      .select(selectColumns)
      .eq('org_id', typedJob.org_id)
      .is('deleted_at', null)

    // Apply filters
    const filters = typedJob.filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'date_from' || key === 'created_from') {
            query = query.gte('created_at', value)
          } else if (key === 'date_to' || key === 'created_to') {
            query = query.lte('created_at', value)
          } else if (key === 'updated_from') {
            query = query.gte('updated_at', value)
          } else if (key === 'updated_to') {
            query = query.lte('updated_at', value)
          } else if (key === 'status') {
            if (Array.isArray(value)) {
              query = query.in('status', value)
            } else {
              query = query.eq('status', value)
            }
          } else if (key === 'search') {
            // Full text search on common fields
            query = query.or(`name.ilike.%${value}%,email.ilike.%${value}%`)
          } else {
            query = query.eq(key, value)
          }
        }
      }
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false })

    // Execute query
    const { data: records, error: queryError } = await query

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`)
    }

    const recordCount = records?.length || 0

    // Generate file content based on format
    let fileContent: string
    let contentType: string
    let extension: string

    if (typedJob.format === 'json') {
      fileContent = JSON.stringify(records, null, 2)
      contentType = 'application/json'
      extension = 'json'
    } else if (typedJob.format === 'excel') {
      // For Excel, we generate CSV with BOM for Excel compatibility
      fileContent = '\ufeff' + Papa.unparse(records || [], {
        header: typedJob.include_headers,
        quotes: true,
      })
      contentType = 'text/csv; charset=utf-8'
      extension = 'csv' // Could be xlsx with proper library
    } else {
      // CSV (default)
      fileContent = Papa.unparse(records || [], {
        header: typedJob.include_headers,
      })
      contentType = 'text/csv'
      extension = 'csv'
    }

    // Upload to storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filePath = `${typedJob.org_id}/${typedJob.entity_type}-${timestamp}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(filePath, fileContent, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Calculate file size
    const fileSizeBytes = new TextEncoder().encode(fileContent).length

    // Update job as completed
    await supabase
      .from('export_jobs')
      .update({
        status: 'completed',
        file_path: filePath,
        file_size_bytes: fileSizeBytes,
        record_count: recordCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    const duration = Date.now() - startTime

    return new Response(
      JSON.stringify({
        success: true,
        recordCount,
        filePath,
        fileSizeBytes,
        format: typedJob.format,
        duration: `${duration}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Export processing error:', error)

    // Try to update job status to failed
    try {
      const body = await req.clone().json()
      if (body.jobId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        )

        await supabase
          .from('export_jobs')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', body.jobId)
      }
    } catch (updateErr) {
      console.error('Failed to update job status:', updateErr)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
