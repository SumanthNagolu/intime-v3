// Supabase Edge Function to fix interviews RLS policies
// Deploy with: npx supabase functions deploy fix-interviews-rls

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
    const databaseUrl = Deno.env.get('DATABASE_URL')

    if (!databaseUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'DATABASE_URL not configured',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const sql = postgres(databaseUrl)

    try {
      // Update RLS policies for interviews table
      // Note: user_profiles uses auth_id column to link to auth.uid()
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
          message: 'RLS policies for interviews table updated successfully!',
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
