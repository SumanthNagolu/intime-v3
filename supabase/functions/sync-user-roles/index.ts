// Sync user roles - assigns roles based on email patterns
// Uses actual profile.id (not auth_id) for foreign key compliance

import postgres from 'https://deno.land/x/postgresjs@v3.4.4/mod.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Role IDs from the database
const ROLE_IDS: Record<string, string> = {
  student: 'a216014f-2d6e-45f7-b42f-39d8bceb077e',
  client: '35196499-4e8c-4af7-be51-b33947e27064',
  candidate: '10d8f135-b570-4483-91b1-2cd6205cce10',
  recruiter: 'f046991f-1f90-4784-874f-1cd49e63f95b',
  admin: 'b50dd56f-83c6-4940-95aa-a1967dc12c16',
  trainer: 'f1d6cd31-68ed-4ff2-acc1-2b687114e3d8',
}

// Email patterns to role mapping
function inferRoleFromEmail(email: string): string | null {
  const lowerEmail = email.toLowerCase()

  if (lowerEmail.includes('student')) return 'student'
  if (lowerEmail.includes('talent') || lowerEmail.includes('candidate')) return 'candidate'
  if (lowerEmail.includes('client')) return 'client'
  if (lowerEmail.includes('trainer')) return 'trainer'
  if (lowerEmail.includes('recruiter') || lowerEmail.includes('rec@') || lowerEmail.includes('_rec@') || lowerEmail.includes('_rec_')) return 'recruiter'
  if (lowerEmail.includes('admin')) return 'admin'

  return null
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

    const body = await req.json().catch(() => ({}))
    const dryRun = body.dryRun !== false // Default to dry run for safety

    const sql = postgres(databaseUrl)

    // Find all users with their auth info and current roles
    const allUsers = await sql`
      SELECT
        up.id as profile_id,
        up.auth_id,
        up.email,
        up.org_id,
        array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) as current_roles
      FROM user_profiles up
      LEFT JOIN user_roles ur ON ur.user_id = up.id AND ur.deleted_at IS NULL
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE up.auth_id IS NOT NULL
        AND up.deleted_at IS NULL
      GROUP BY up.id, up.auth_id, up.email, up.org_id
      ORDER BY up.email
    `

    const results = {
      totalUsers: allUsers.length,
      usersWithRoles: 0,
      usersWithoutRoles: 0,
      roleAssignments: [] as any[],
      dryRun,
    }

    for (const user of allUsers) {
      const hasRoles = user.current_roles && user.current_roles.length > 0 && user.current_roles[0] !== null

      if (hasRoles) {
        results.usersWithRoles++
        continue
      }

      results.usersWithoutRoles++

      // Infer role from email
      const inferredRole = inferRoleFromEmail(user.email)

      if (!inferredRole || !ROLE_IDS[inferredRole]) {
        results.roleAssignments.push({
          email: user.email,
          profileId: user.profile_id,
          action: 'skipped',
          reason: 'Could not infer role from email',
        })
        continue
      }

      if (!dryRun) {
        try {
          // Insert role using profile_id (NOT auth_id)
          await sql`
            INSERT INTO user_roles (user_id, role_id, is_primary)
            VALUES (${user.profile_id}, ${ROLE_IDS[inferredRole]}, true)
            ON CONFLICT (user_id, role_id) DO NOTHING
          `

          results.roleAssignments.push({
            email: user.email,
            profileId: user.profile_id,
            action: 'assigned',
            role: inferredRole,
          })
        } catch (err) {
          results.roleAssignments.push({
            email: user.email,
            profileId: user.profile_id,
            action: 'error',
            error: err.message,
          })
        }
      } else {
        results.roleAssignments.push({
          email: user.email,
          profileId: user.profile_id,
          action: 'would_assign',
          role: inferredRole,
        })
      }
    }

    await sql.end()

    return new Response(
      JSON.stringify(results, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
