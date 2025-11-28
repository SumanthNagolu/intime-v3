// Check database schema

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
      return new Response(JSON.stringify({ error: 'No DATABASE_URL' }), { status: 500 })
    }

    const sql = postgres(databaseUrl)

    // Get user_profiles columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_profiles'
      ORDER BY ordinal_position
    `

    // Get sample auth users
    const authUsers = await sql`
      SELECT id, email FROM auth.users LIMIT 5
    `

    // Get sample user_profiles
    const profiles = await sql`
      SELECT * FROM user_profiles LIMIT 3
    `

    // Get organizations
    const orgs = await sql`
      SELECT id, name FROM organizations LIMIT 3
    `

    await sql.end()

    return new Response(
      JSON.stringify({
        user_profiles_columns: columns,
        sample_auth_users: authUsers,
        sample_profiles: profiles,
        organizations: orgs
      }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
