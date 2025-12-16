
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyWave2Migration() {
    console.log('=== WAVE 2 MIGRATION VERIFICATION ===\n')

    let allPassed = true

    // 1. Leads migration
    const { count: unmigratedLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .is('contact_id', null)
        .is('deleted_at', null)

    if (unmigratedLeads === 0) {
        console.log('✅ All leads migrated to contacts')
    } else {
        console.log(`❌ ${unmigratedLeads} leads without contact_id`)
        allPassed = false
    }

    // 2. Bench migration
    const { count: unmigratedBench } = await supabase
        .from('bench_consultants')
        .select('*', { count: 'exact', head: true })
        .is('contact_id', null)
        .is('deleted_at', null)

    const { count: benchDataCount } = await supabase
        .from('contact_bench_data')
        .select('*', { count: 'exact', head: true })

    if (benchDataCount && benchDataCount > 0) {
        console.log(`✅ ${benchDataCount} contact_bench_data records created`)
    } else {
        console.log('❌ No contact_bench_data records found')
        allPassed = false
    }

    if (unmigratedBench && unmigratedBench > 0) {
        console.log(`⚠️  ${unmigratedBench} bench consultants without contact_id (may be expected if no candidate_id)`)
    }

    // 3. Subtype distribution
    const { data: subtypes } = await supabase
        .from('contacts')
        .select('subtype')
        .or('subtype.eq.person_lead,subtype.like.person_bench_%')

    const distribution: Record<string, number> = {}
    subtypes?.forEach((c: any) => {
        distribution[c.subtype] = (distribution[c.subtype] || 0) + 1
    })

    console.log('\nSubtype distribution:')
    Object.entries(distribution).forEach(([subtype, count]) => {
        console.log(`  ${subtype}: ${count}`)
    })

    // 4. Tasks migration
    const { count: migratedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', 'contact')

    console.log(`\nMigrated tasks: ${migratedTasks}`)

    console.log('\n=== VERIFICATION ' + (allPassed ? 'PASSED' : 'FAILED') + ' ===')

    if (!allPassed) {
        process.exit(1)
    }
}

verifyWave2Migration().catch((err) => {
    console.error(err)
    process.exit(1)
})
