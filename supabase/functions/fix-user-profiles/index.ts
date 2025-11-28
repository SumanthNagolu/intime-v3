// Supabase Edge Function to fix user profiles
// Links auth users to user_profiles and assigns org_id

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
        JSON.stringify({ success: false, message: 'DATABASE_URL not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const sql = postgres(databaseUrl)

    try {
      // Get all auth users
      const authUsers = await sql`
        SELECT id, email, raw_user_meta_data
        FROM auth.users
        ORDER BY created_at DESC
      `

      // Get default organization (InTime Solutions)
      const defaultOrg = (await sql`
        SELECT id FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001'
      `)[0]

      if (!defaultOrg) {
        await sql.end()
        return new Response(
          JSON.stringify({ success: false, message: 'Default organization not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const results = []

      for (const authUser of authUsers) {
        // Check if user_profile exists with this auth_id
        const existingByAuthId = await sql`
          SELECT id, email, auth_id, org_id FROM user_profiles WHERE auth_id = ${authUser.id}
        `

        if (existingByAuthId.length > 0) {
          results.push({ email: authUser.email, action: 'already linked', orgId: existingByAuthId[0].org_id })
          continue
        }

        // Check if user_profile exists with same email
        const existingByEmail = await sql`
          SELECT id, email, auth_id, org_id FROM user_profiles WHERE email = ${authUser.email}
        `

        if (existingByEmail.length > 0) {
          // Link existing profile to auth user and ensure org_id is set
          await sql`
            UPDATE user_profiles
            SET auth_id = ${authUser.id},
                org_id = COALESCE(org_id, ${defaultOrg.id}),
                is_active = true,
                deleted_at = NULL
            WHERE email = ${authUser.email}
          `
          results.push({ email: authUser.email, action: 'linked to existing profile' })
          continue
        }

        // Create new user_profile with full_name (not first_name/last_name)
        const fullName = authUser.raw_user_meta_data?.full_name ||
                        authUser.raw_user_meta_data?.name ||
                        authUser.email.split('@')[0].replace(/[._]/g, ' ')

        await sql`
          INSERT INTO user_profiles (auth_id, email, full_name, org_id, is_active)
          VALUES (${authUser.id}, ${authUser.email}, ${fullName}, ${defaultOrg.id}, true)
        `
        results.push({ email: authUser.email, action: 'created new profile' })
      }

      await sql.end()

      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${authUsers.length} auth users`,
          defaultOrgId: defaultOrg.id,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )

    } catch (sqlError) {
      await sql.end()
      throw sqlError
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
