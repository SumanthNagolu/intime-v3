// Check roles and permissions schema

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

    // Check for roles table
    const rolesTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%role%'
    `

    // Check user_roles table structure
    const userRolesColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_roles'
      ORDER BY ordinal_position
    `

    // Check roles table structure
    const rolesColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'roles'
      ORDER BY ordinal_position
    `

    // Get available roles
    const availableRoles = await sql`
      SELECT * FROM roles LIMIT 20
    `

    // Check user_roles for a known user (student_m2@intim.com)
    const studentProfile = await sql`
      SELECT id, email, auth_id, org_id FROM user_profiles WHERE email = 'student_m2@intim.com'
    `

    let studentRoles = []
    if (studentProfile.length > 0) {
      studentRoles = await sql`
        SELECT ur.*, r.name as role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ${studentProfile[0].id}
      `
    }

    // Get sample user with roles (a working user)
    const workingUser = await sql`
      SELECT up.id, up.email, up.auth_id, up.org_id,
             array_agg(r.name) as roles
      FROM user_profiles up
      LEFT JOIN user_roles ur ON ur.user_id = up.id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE up.auth_id IS NOT NULL
      GROUP BY up.id, up.email, up.auth_id, up.org_id
      HAVING array_agg(r.name) != '{NULL}'
      LIMIT 3
    `

    await sql.end()

    return new Response(
      JSON.stringify({
        rolesTables,
        userRolesColumns,
        rolesColumns,
        availableRoles,
        studentProfile,
        studentRoles,
        workingUsersWithRoles: workingUser
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
