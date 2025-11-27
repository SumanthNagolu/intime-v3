// Supabase Edge Function to run database migrations
// Deploy with: npx supabase functions deploy run-migration
// Invoke with: curl -X POST https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/run-migration

import postgres from 'https://deno.land/x/postgresjs@v3.4.4/mod.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get database URL from environment (use DATABASE_URL secret)
    const databaseUrl = Deno.env.get('DATABASE_URL')

    if (!databaseUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'DATABASE_URL not configured. Please set it in Supabase Dashboard > Edge Functions > run-migration > Secrets',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Create postgres connection
    const sql = postgres(databaseUrl)

    try {
      // Check if org_id column already exists
      const columnCheck = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'interviews'
        AND column_name = 'org_id'
      `

      if (columnCheck.length > 0) {
        await sql.end()
        return new Response(
          JSON.stringify({
            success: true,
            message: 'org_id column already exists on interviews table',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      // Add org_id column
      await sql`
        ALTER TABLE interviews
        ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE
      `

      // Update existing interviews with org_id from their related submission
      await sql`
        UPDATE interviews i
        SET org_id = s.org_id
        FROM submissions s
        WHERE i.submission_id = s.id
        AND i.org_id IS NULL
      `

      // Check if there are any null org_ids left (interviews without submissions)
      const nullCheck = await sql`
        SELECT COUNT(*) as count FROM interviews WHERE org_id IS NULL
      `

      if (parseInt(nullCheck[0].count) > 0) {
        // If there are orphaned interviews, we can't make org_id NOT NULL
        // Just create the index for now
        await sql`
          CREATE INDEX IF NOT EXISTS idx_interviews_org_id ON interviews(org_id)
        `
      } else {
        // Make org_id NOT NULL
        await sql`
          ALTER TABLE interviews
          ALTER COLUMN org_id SET NOT NULL
        `

        // Create index
        await sql`
          CREATE INDEX IF NOT EXISTS idx_interviews_org_id ON interviews(org_id)
        `
      }

      // Update RLS policies
      // Note: user_profiles uses auth_id column to link to auth.uid(), not user_id
      await sql`
        DROP POLICY IF EXISTS "Users can view interviews in their organization" ON interviews
      `
      await sql`
        CREATE POLICY "Users can view interviews in their organization" ON interviews
        FOR SELECT
        USING (
          org_id IN (
            SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
          )
        )
      `

      await sql`
        DROP POLICY IF EXISTS "Users can manage interviews in their organization" ON interviews
      `
      await sql`
        CREATE POLICY "Users can manage interviews in their organization" ON interviews
        FOR ALL
        USING (
          org_id IN (
            SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
          )
        )
      `

      await sql.end()

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Migration completed successfully! org_id column added to interviews table.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (sqlError) {
      await sql.end()
      throw sqlError
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
