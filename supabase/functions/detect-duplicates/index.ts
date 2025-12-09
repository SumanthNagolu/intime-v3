import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
}

// Default duplicate rules per entity type
const DEFAULT_RULES: Record<string, Array<{ match_fields: string[]; match_type: string; fuzzy_threshold: number }>> = {
  candidates: [
    { match_fields: ['email'], match_type: 'exact', fuzzy_threshold: 1 },
    { match_fields: ['first_name', 'last_name', 'phone'], match_type: 'fuzzy', fuzzy_threshold: 0.85 },
  ],
  contacts: [
    { match_fields: ['email'], match_type: 'exact', fuzzy_threshold: 1 },
    { match_fields: ['first_name', 'last_name'], match_type: 'fuzzy', fuzzy_threshold: 0.9 },
  ],
  accounts: [
    { match_fields: ['name'], match_type: 'fuzzy', fuzzy_threshold: 0.9 },
  ],
  leads: [
    { match_fields: ['email'], match_type: 'exact', fuzzy_threshold: 1 },
    { match_fields: ['company_name'], match_type: 'fuzzy', fuzzy_threshold: 0.85 },
  ],
}

// Dice coefficient string similarity
function similarity(s1: string, s2: string): number {
  const lower1 = s1?.toLowerCase()?.trim() || ''
  const lower2 = s2?.toLowerCase()?.trim() || ''

  if (lower1 === lower2) return 1.0
  if (lower1.length < 2 || lower2.length < 2) return 0.0

  const bigrams1 = new Set<string>()
  for (let i = 0; i < lower1.length - 1; i++) {
    bigrams1.add(lower1.substring(i, i + 2))
  }

  let intersectionSize = 0
  for (let i = 0; i < lower2.length - 1; i++) {
    if (bigrams1.has(lower2.substring(i, i + 2))) {
      intersectionSize++
    }
  }

  return (2.0 * intersectionSize) / (lower1.length - 1 + lower2.length - 1)
}

// Phonetic matching (simplified Soundex)
function soundex(s: string): string {
  const a = s.toLowerCase().split('')
  const firstLetter = a[0]
  const codes: Record<string, string> = {
    a: '', e: '', i: '', o: '', u: '',
    b: '1', f: '1', p: '1', v: '1',
    c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
    d: '3', t: '3',
    l: '4',
    m: '5', n: '5',
    r: '6',
  }

  const coded = a
    .map(c => codes[c] || '')
    .filter((v, i, arr) => i === 0 || v !== arr[i - 1])
    .join('')

  return (firstLetter + coded.slice(1)).slice(0, 4).padEnd(4, '0').toUpperCase()
}

interface DuplicateRule {
  match_fields: string[]
  match_type: 'exact' | 'fuzzy' | 'phonetic'
  fuzzy_threshold: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const { orgId, entityType, ruleId, userId } = await req.json()

    if (!orgId || !entityType) {
      throw new Error('orgId and entityType are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get duplicate rules
    let rules: DuplicateRule[]

    if (ruleId) {
      // Use specific rule
      const { data } = await supabase
        .from('duplicate_rules')
        .select('match_fields, match_type, fuzzy_threshold')
        .eq('id', ruleId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .single()

      rules = data ? [data as DuplicateRule] : []
    } else {
      // Get all active rules for entity type
      const { data } = await supabase
        .from('duplicate_rules')
        .select('match_fields, match_type, fuzzy_threshold')
        .eq('org_id', orgId)
        .eq('entity_type', entityType)
        .eq('is_active', true)

      rules = (data || []) as DuplicateRule[]
    }

    // Use default rules if none configured
    if (rules.length === 0) {
      rules = (DEFAULT_RULES[entityType] || [
        { match_fields: ['email'], match_type: 'exact', fuzzy_threshold: 1 },
      ]) as DuplicateRule[]
    }

    // Get entity table and fields to select
    const tableName = ENTITY_TABLES[entityType] || entityType
    const allFields = new Set<string>(['id'])
    for (const rule of rules) {
      rule.match_fields.forEach(f => allFields.add(f))
    }

    // Fetch all records (limited to 10000 for performance)
    const { data: records, error } = await supabase
      .from(tableName)
      .select([...allFields].join(','))
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .limit(10000)

    if (error || !records) {
      throw new Error(`Failed to fetch records: ${error?.message || 'Unknown error'}`)
    }

    // Find duplicates using O(n²) comparison
    const duplicates: Array<{
      record_id_1: string
      record_id_2: string
      confidence_score: number
      match_fields: string[]
      match_details: Record<string, unknown>
    }> = []

    const seen = new Set<string>()

    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const record1 = records[i]
        const record2 = records[j]

        // Create pair key to avoid duplicates
        const pairKey = [record1.id, record2.id].sort().join('-')
        if (seen.has(pairKey)) continue

        for (const rule of rules) {
          const matchedFields: string[] = []
          const matchDetails: Record<string, unknown> = {}
          let totalScore = 0
          let fieldCount = 0

          for (const field of rule.match_fields) {
            const val1 = record1[field]
            const val2 = record2[field]

            // Skip if either value is missing
            if (!val1 || !val2) continue
            fieldCount++

            const str1 = String(val1)
            const str2 = String(val2)

            if (rule.match_type === 'exact') {
              if (str1.toLowerCase().trim() === str2.toLowerCase().trim()) {
                matchedFields.push(field)
                totalScore += 1
                matchDetails[field] = { type: 'exact', val1: str1, val2: str2, score: 1 }
              }
            } else if (rule.match_type === 'phonetic') {
              if (soundex(str1) === soundex(str2)) {
                matchedFields.push(field)
                totalScore += 0.8
                matchDetails[field] = { type: 'phonetic', val1: str1, val2: str2, soundex: soundex(str1), score: 0.8 }
              }
            } else {
              // Fuzzy matching
              const score = similarity(str1, str2)
              if (score >= rule.fuzzy_threshold) {
                matchedFields.push(field)
                totalScore += score
                matchDetails[field] = { type: 'fuzzy', val1: str1, val2: str2, score }
              }
            }
          }

          // Only consider as duplicate if at least one field matched
          if (matchedFields.length > 0 && fieldCount > 0) {
            const confidence = totalScore / fieldCount

            // Threshold: at least 50% average match
            if (confidence >= 0.5) {
              seen.add(pairKey)

              // Ensure record_id_1 < record_id_2 for constraint
              const [id1, id2] = record1.id < record2.id
                ? [record1.id, record2.id]
                : [record2.id, record1.id]

              duplicates.push({
                record_id_1: id1,
                record_id_2: id2,
                confidence_score: Math.round(confidence * 10000) / 10000,
                match_fields: matchedFields,
                match_details: matchDetails,
              })
              break // Only one match per pair
            }
          }
        }
      }
    }

    // Insert duplicates (upsert to handle existing pairs)
    let insertedCount = 0
    if (duplicates.length > 0) {
      for (const dup of duplicates) {
        const { error: upsertError } = await supabase
          .from('duplicate_records')
          .upsert(
            {
              org_id: orgId,
              entity_type: entityType,
              ...dup,
              status: 'pending',
              detected_at: new Date().toISOString(),
            },
            {
              onConflict: 'org_id,entity_type,record_id_1,record_id_2',
              ignoreDuplicates: true,
            }
          )

        if (!upsertError) {
          insertedCount++
        }
      }
    }

    const duration = Date.now() - startTime

    return new Response(
      JSON.stringify({
        success: true,
        recordsScanned: records.length,
        duplicatesFound: duplicates.length,
        duplicatesInserted: insertedCount,
        rulesApplied: rules.length,
        duration: `${duration}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Duplicate detection error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
