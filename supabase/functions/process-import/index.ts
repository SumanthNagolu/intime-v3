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
  contacts: 'point_of_contacts',
  leads: 'leads',
  employees: 'employees',
  consultants: 'consultants',
  vendors: 'vendors',
}

interface ImportJob {
  id: string
  org_id: string
  entity_type: string
  file_path: string
  field_mapping: Record<string, string>
  import_options: {
    errorHandling: 'skip' | 'stop' | 'flag'
    createMissingReferences: boolean
    updateExisting: boolean
  }
  total_rows: number
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
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message || 'Unknown error'}`)
    }

    const typedJob = job as ImportJob

    // Update status to processing
    await supabase
      .from('import_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(typedJob.file_path)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message || 'Unknown error'}`)
    }

    // Parse file based on type
    const text = await fileData.text()
    let rows: Record<string, unknown>[]

    if (typedJob.file_path.endsWith('.json')) {
      rows = JSON.parse(text)
    } else {
      // CSV parsing
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      })
      rows = parsed.data as Record<string, unknown>[]
    }

    const fieldMapping = typedJob.field_mapping
    const importOptions = typedJob.import_options
    const tableName = ENTITY_TABLES[typedJob.entity_type] || typedJob.entity_type

    let successCount = 0
    let errorCount = 0
    let warningCount = 0
    const errorLog: Array<{ row: number; field?: string; error: string; code: string }> = []
    const warningsLog: Array<{ row: number; field?: string; message: string }> = []

    // Process in chunks of 100 for progress updates
    const chunkSize = 100
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)

      for (let j = 0; j < chunk.length; j++) {
        const row = chunk[j]
        const rowIndex = i + j + 1

        try {
          // Map fields from source to destination
          const insertData: Record<string, unknown> = {
            org_id: typedJob.org_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          for (const [sourceCol, destField] of Object.entries(fieldMapping)) {
            const value = row[sourceCol]
            if (value !== undefined && value !== null && value !== '') {
              // Basic type conversion
              if (destField.includes('date') || destField.includes('_at')) {
                const dateVal = new Date(String(value))
                if (!isNaN(dateVal.getTime())) {
                  insertData[destField] = dateVal.toISOString()
                }
              } else if (destField.includes('is_') || destField.includes('has_')) {
                const strVal = String(value).toLowerCase()
                insertData[destField] = ['true', '1', 'yes', 'y'].includes(strVal)
              } else if (destField.includes('rate') || destField.includes('amount') || destField.includes('count')) {
                const numVal = Number(value)
                if (!isNaN(numVal)) {
                  insertData[destField] = numVal
                }
              } else {
                insertData[destField] = String(value).trim()
              }
            }
          }

          // Validate required fields based on entity type
          if (typedJob.entity_type === 'candidates' && !insertData.email) {
            throw new Error('Email is required for candidates')
          }
          if (typedJob.entity_type === 'accounts' && !insertData.name) {
            throw new Error('Name is required for accounts')
          }

          // Insert or update based on options
          if (importOptions.updateExisting && insertData.email) {
            // Upsert based on email (for candidates/contacts)
            const { error } = await supabase
              .from(tableName)
              .upsert(insertData, {
                onConflict: 'org_id,email',
                ignoreDuplicates: false
              })

            if (error) throw error
          } else if (importOptions.updateExisting && insertData.name && typedJob.entity_type === 'accounts') {
            // Upsert based on name (for accounts)
            const { error } = await supabase
              .from(tableName)
              .upsert(insertData, {
                onConflict: 'org_id,name',
                ignoreDuplicates: false
              })

            if (error) throw error
          } else {
            // Standard insert
            const { error } = await supabase
              .from(tableName)
              .insert(insertData)

            if (error) {
              // Check if it's a duplicate error
              if (error.code === '23505') {
                warningCount++
                warningsLog.push({
                  row: rowIndex,
                  message: 'Duplicate record skipped',
                })
                continue
              }
              throw error
            }
          }

          successCount++
        } catch (err) {
          errorCount++
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          errorLog.push({
            row: rowIndex,
            error: errorMessage,
            code: 'IMPORT_ERROR',
          })

          // Stop processing if error handling is set to 'stop'
          if (importOptions.errorHandling === 'stop') {
            await supabase
              .from('import_jobs')
              .update({
                status: 'failed',
                error_message: `Import stopped at row ${rowIndex}: ${errorMessage}`,
                error_log: errorLog,
                warnings_log: warningsLog,
                processed_rows: rowIndex,
                success_rows: successCount,
                error_rows: errorCount,
                warning_rows: warningCount,
                completed_at: new Date().toISOString(),
              })
              .eq('id', jobId)

            return new Response(
              JSON.stringify({
                success: false,
                error: `Import stopped at row ${rowIndex}`,
                processed: rowIndex,
                successCount,
                errorCount,
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }

      // Update progress after each chunk
      await supabase
        .from('import_jobs')
        .update({
          processed_rows: Math.min(i + chunkSize, rows.length),
          success_rows: successCount,
          error_rows: errorCount,
          warning_rows: warningCount,
          error_log: errorLog.slice(-100), // Keep last 100 errors
          warnings_log: warningsLog.slice(-100),
        })
        .eq('id', jobId)
    }

    // Determine final status
    const finalStatus = errorCount > 0 && successCount === 0
      ? 'failed'
      : errorCount > 0
        ? 'completed' // Completed with errors
        : 'completed'

    // Mark as completed
    await supabase
      .from('import_jobs')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        processed_rows: rows.length,
        success_rows: successCount,
        error_rows: errorCount,
        warning_rows: warningCount,
        error_log: errorLog,
        warnings_log: warningsLog,
      })
      .eq('id', jobId)

    const duration = Date.now() - startTime

    return new Response(
      JSON.stringify({
        success: true,
        processed: rows.length,
        successCount,
        errorCount,
        warningCount,
        duration: `${duration}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Import processing error:', error)

    // Try to update job status to failed
    try {
      const body = await req.clone().json()
      if (body.jobId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        )

        await supabase
          .from('import_jobs')
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
