// Assign role to a user by email

import postgres from 'https://deno.land/x/postgresjs@v3.4.4/mod.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Role IDs from the database
const ROLE_IDS = {
  student: 'a216014f-2d6e-45f7-b42f-39d8bceb077e',
  client: '35196499-4e8c-4af7-be51-b33947e27064',
  candidate: '10d8f135-b570-4483-91b1-2cd6205cce10',
  recruiter: 'f046991f-1f90-4784-874f-1cd49e63f95b',
  admin: 'b50dd56f-83c6-4940-95aa-a1967dc12c16',
  trainer: 'f1d6cd31-68ed-4ff2-acc1-2b687114e3d8',
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

    const body = await req.json()
    const { email, role } = body

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const roleId = role ? ROLE_IDS[role] : null
    if (role && !roleId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid role: ${role}. Valid roles: ${Object.keys(ROLE_IDS).join(', ')}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const sql = postgres(databaseUrl)

    // Get user profile
    const profiles = await sql`
      SELECT id, email, auth_id, org_id FROM user_profiles WHERE email = ${email}
    `

    if (profiles.length === 0) {
      await sql.end()
      return new Response(
        JSON.stringify({ success: false, error: `User not found: ${email}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const profile = profiles[0]

    // Get current roles
    const currentRoles = await sql`
      SELECT ur.role_id, r.name as role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ${profile.id}
    `

    // If role specified, assign it
    if (roleId) {
      // Check if already has role
      const hasRole = currentRoles.some(r => r.role_id === roleId)

      if (!hasRole) {
        await sql`
          INSERT INTO user_roles (user_id, role_id, is_primary)
          VALUES (${profile.id}, ${roleId}, ${currentRoles.length === 0})
          ON CONFLICT (user_id, role_id) DO NOTHING
        `
      }

      // Refresh roles
      const updatedRoles = await sql`
        SELECT ur.role_id, r.name as role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ${profile.id}
      `

      await sql.end()

      return new Response(
        JSON.stringify({
          success: true,
          message: hasRole ? 'User already has role' : `Role ${role} assigned successfully`,
          user: {
            id: profile.id,
            email: profile.email,
            orgId: profile.org_id,
            roles: updatedRoles.map(r => r.role_name)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    await sql.end()

    // Just return current roles if no role specified
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          orgId: profile.org_id,
          roles: currentRoles.map(r => r.role_name)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
